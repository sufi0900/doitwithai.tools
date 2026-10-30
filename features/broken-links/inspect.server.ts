import { load } from "cheerio";
import { getDomain } from "tldts";
import {
  fetchPublic,
  publicUrl,
  type Fetched,
} from "../backlink-verifier/fetch.server";
import {
  inspectCrawlerPath,
  parseCrawlerPolicy,
} from "../robots-generator/access";
import type { Report, Row } from "./model";

const clean = (s: string, n = 400) => s.replace(/\s+/g, " ").trim().slice(0, n);
const site = (u: URL) =>
  getDomain(u.hostname, { allowPrivateDomains: true }) || u.hostname;
export function extractExternal(html: string, source: string) {
  const $ = load(html);
  $(
    'script,style,noscript,template,nav,header,footer,[hidden],[aria-hidden="true"]',
  ).remove();
  const root = $("main").first().length
    ? $("main").first()
    : $("article").first().length
      ? $("article").first()
      : $("body");
  const sourceUrl = publicUrl(source);
  let base = sourceUrl;
  try {
    const declared = $("base[href]").first().attr("href");
    if (declared) base = publicUrl(new URL(declared, sourceUrl).href);
  } catch {
    /* Invalid base declarations cannot expand the request scope. */
  }
  const found = new Map<
    string,
    Pick<Row, "href" | "anchor" | "context" | "rel" | "occurrences">
  >();
  let omitted = 0;
  root.find("a[href]").each((_, el) => {
    const node = $(el);
    if (
      node
        .parents()
        .addBack()
        .toArray()
        .some((e) =>
          /display\s*:\s*none|visibility\s*:\s*hidden/i.test(
            $(e).attr("style") || "",
          ),
        )
    )
      return;
    const raw = node.attr("href")?.trim();
    if (!raw || raw.startsWith("#")) return;
    let url: URL;
    try {
      url = publicUrl(new URL(raw, base).href);
    } catch {
      return;
    }
    if (site(url) === site(sourceUrl)) return;
    if (found.has(url.href)) {
      found.get(url.href)!.occurrences++;
      return;
    }
    if (found.size >= 500) {
      omitted++;
      return;
    }
    found.set(url.href, {
      href: url.href,
      anchor: clean(
        node.text() || node.find("img").attr("alt") || "Unlabelled link",
        180,
      ),
      context: clean(
        node.closest("p,li,blockquote,dd,td,section").text() ||
          node.parent().text(),
      ),
      rel: (node.attr("rel") || "").toLowerCase().split(/\s+/).filter(Boolean),
      occurrences: 1,
    });
  });
  return {
    title: clean($("title").first().text(), 200),
    links: [...found.values()],
    omitted,
  };
}

export function classify(
  status: number,
  redirected: boolean,
): Pick<Row, "state" | "reason"> {
  if (status === 404 || status === 410)
    return {
      state: "broken",
      reason: `The destination returned HTTP ${status}. Recheck in a browser and assess a relevant replacement before outreach.`,
    };
  if (status >= 200 && status < 300)
    return {
      state: redirected ? "redirected" : "working",
      reason: redirected
        ? "The redirect chain ended with a successful response. Check that the final resource remains relevant."
        : "A successful HTTP response was observed. This does not confirm content quality or rule out a soft 404.",
    };
  return {
    state: "unverified",
    reason: [401, 403, 429].includes(status)
      ? `HTTP ${status} indicates restricted or limited access. This is not evidence of a dead resource.`
      : `HTTP ${status} needs another check. Temporary errors are not classified as link-building opportunities.`,
  };
}

export async function inspectPage(
  source: string,
  limit: number,
  html: string | undefined,
  signal: AbortSignal,
  fetcher: typeof fetchPublic = fetchPublic,
): Promise<Report> {
  const report: Report = {
    sourceUrl: source,
    finalSourceUrl: source,
    title: "",
    method: html === undefined ? "live" : "pasted",
    sourceStatus: null,
    totalExternal: 0,
    checkedCount: 0,
    rows: [],
    notes: [],
    error: "",
    checkedAt: new Date().toISOString(),
  };
  const policies = new Map<
    string,
    Promise<ReturnType<typeof parseCrawlerPolicy>>
  >();
  const beforeRequest = async (url: URL) => {
    if (!policies.has(url.origin))
      policies.set(
        url.origin,
        (async () => {
          const r = await fetcher(new URL("/robots.txt", url).href, {
            text: true,
            bytes: 64000,
            timeout: 3000,
            signal,
          });
          if (r.status === 404 || r.status === 410)
            return parseCrawlerPolicy("");
          if (r.status !== 200)
            throw new Error(
              "Robots policy could not be verified. This URL was not checked.",
            );
          return parseCrawlerPolicy(r.html);
        })(),
      );
    const state = await policies.get(url.origin)!;
    const access = inspectCrawlerPath(
      state,
      "doitwithai-backlinkverifier",
      url.pathname + url.search,
    );
    if (access.status !== "allowed")
      throw new Error(
        "Robots policy blocks this check or exceeds inspection limits.",
      );
  };
  const guarded = async (
    url: string,
    headersOnly = false,
  ): Promise<Fetched> => {
    await beforeRequest(publicUrl(url));
    return fetcher(url, {
      signal,
      html: !headersOnly,
      timeout: headersOnly ? 4000 : 8000,
      beforeRequest,
    });
  };
  try {
    let content = html;
    if (content === undefined) {
      const page = await guarded(source);
      report.finalSourceUrl = page.url;
      report.sourceStatus = page.status;
      if (page.status < 200 || page.status >= 300)
        throw new Error(
          `Publisher page returned HTTP ${page.status}. Its external links could not be inspected.`,
        );
      content = page.html;
    } else
      report.notes.push(
        "Source links came from supplied HTML. Current publisher-page placement was not verified. Destination checks are live.",
      );
    const extracted = extractExternal(content, report.finalSourceUrl);
    report.title = extracted.title;
    report.totalExternal = extracted.links.length;
    const selected = extracted.links.slice(0, limit);
    if (extracted.links.length > limit || extracted.omitted)
      report.notes.push(
        `Partial scan: checked the first ${selected.length} of ${extracted.links.length}${extracted.omitted ? " or more" : ""} unique external URLs found in the inspected content.`,
      );
    report.notes.push(
      "Internal links and navigation areas are excluded. JavaScript-generated links, image text, soft 404 detection, and hidden external CSS are outside this check.",
    );
    const rows: Row[] = new Array(selected.length);
    let next = 0;
    await Promise.all(
      Array.from({ length: Math.min(3, selected.length) }, async () => {
        while (next < selected.length) {
          const index = next++;
          const link = selected[index];
          const row: Row = {
            ...link,
            finalUrl: link.href,
            httpStatus: null,
            redirects: [],
            state: "unverified",
            reason: "Check did not finish.",
            checkedAt: new Date().toISOString(),
          };
          if (signal.aborted)
            row.reason =
              "Run stopped before this destination could be checked.";
          else
            try {
              const r = await guarded(link.href, true);
              row.httpStatus = r.status;
              row.finalUrl = r.url;
              row.redirects = r.redirects;
              Object.assign(
                row,
                classify(r.status, Boolean(r.redirects.length)),
              );
            } catch (error) {
              row.reason =
                error instanceof Error &&
                /robots|policy|private|reserved|public|credential|port|redirect/i.test(
                  error.message,
                )
                  ? error.message
                  : "Destination was unreachable, timed out, or could not be checked safely. No broken-link conclusion was drawn.";
            }
          row.checkedAt = new Date().toISOString();
          rows[index] = row;
        }
      }),
    );
    report.rows = rows;
    report.checkedCount = rows.filter((r) => r.httpStatus !== null).length;
    if (signal.aborted)
      report.notes.push(
        "The request deadline interrupted this scan. Some destinations remain unverified.",
      );
  } catch (error) {
    report.error =
      error instanceof Error &&
      /HTTP|robots|policy|private|reserved|public|credential|port|redirect|HTML|compressed/i.test(
        error.message,
      )
        ? error.message
        : "The publisher page could not be fetched completely. Try supplied HTML or return later.";
  }
  return report;
}
