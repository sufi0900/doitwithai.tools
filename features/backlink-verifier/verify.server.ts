import {
  inspectCrawlerPath,
  parseCrawlerPolicy,
} from "../robots-generator/access";
import { analyzeHtml, domainMatches, emptyReport } from "./analyze";
import { fetchPublic, publicUrl } from "./fetch.server";
import type { Destination, Options, Report } from "./types";

export async function mapLimit<T, R>(
  items: T[],
  parallel: number,
  work: (item: T) => Promise<R>,
): Promise<R[]> {
  const result: R[] = new Array(items.length);
  let next = 0;
  await Promise.all(
    Array.from({ length: Math.min(parallel, items.length) }, async () => {
      while (next < items.length) {
        const index = next++;
        result[index] = await work(items[index]);
      }
    }),
  );
  return result;
}
export async function verifySources(
  sources: string[],
  options: Options,
  signal?: AbortSignal,
  fetcher = fetchPublic,
) {
  const policies = new Map<
    string,
    Promise<{ text: string; missing: boolean }>
  >();
  const policy = (url: URL) => {
    if (!policies.has(url.origin))
      policies.set(
        url.origin,
        fetcher(new URL("/robots.txt", url).href, {
          text: true,
          bytes: 64000,
          timeout: 4000,
          signal,
        }).then((r) =>
          r.status === 404 || r.status === 410
            ? { text: "", missing: true }
            : r.status === 200
              ? { text: r.html, missing: false }
              : Promise.reject(new Error("Robots unavailable")),
        ),
      );
    return policies.get(url.origin)!;
  };
  const reports = await mapLimit([...new Set(sources)], 3, async (source) => {
    let report = emptyReport(source);
    try {
      const url = publicUrl(source);
      report.sourceUrl = url.href;
      report.finalUrl = url.href;
      let ownBlocked = false;
      try {
        const rules = await policy(url),
          state = parseCrawlerPolicy(rules.text);
        const google = inspectCrawlerPath(
          state,
          "googlebot",
          url.pathname + url.search,
        );
        ownBlocked =
          inspectCrawlerPath(
            state,
            "doitwithai-backlinkverifier",
            url.pathname + url.search,
          ).status === "blocked";
        report.crawlAccess = google.status;
        report.crawlNote = rules.missing
          ? "No robots.txt file was returned. No robots restriction was observed."
          : `${google.matchedAgent}: ${google.rule}`;
      } catch {
        report.crawlNote =
          "Robots.txt could not be verified. No crawl-access conclusion was drawn.";
      }
      if (ownBlocked) {
        report.error =
          "Robots.txt disallows this verifier. Paste page HTML to inspect supplied evidence.";
        return report;
      }
      const page = await fetcher(url.href, { signal });
      report.finalUrl = page.url;
      report.httpStatus = page.status;
      report.redirects = page.redirects;
      if (page.status < 200 || page.status >= 300) {
        report.error = [401, 403, 429].includes(page.status)
          ? `Source access was blocked or limited (HTTP ${page.status}). Link presence is unknown.`
          : `The source returned HTTP ${page.status}. Link presence could not be verified.`;
        return report;
      }
      // The final host can have a different robots policy after a redirect.
      if (new URL(page.url).origin !== url.origin || page.url !== url.href) {
        try {
          const final = new URL(page.url),
            rules = await policy(final);
          const access = inspectCrawlerPath(
            parseCrawlerPolicy(rules.text),
            "googlebot",
            final.pathname + final.search,
          );
          report.crawlAccess = access.status;
          report.crawlNote = `Final source policy: ${access.matchedAgent}: ${access.rule}`;
        } catch {
          report.crawlAccess = "unknown";
          report.crawlNote =
            "Final source robots policy could not be verified.";
        }
      }
      return analyzeHtml(page.html, url.href, options, {
        ...report,
        method: "live",
        complete: true,
        xRobots: page.headers["x-robots-tag"] || "",
      });
    } catch (error) {
      report.error = signal?.aborted
        ? "The check was cancelled."
        : error instanceof Error &&
            /private|reserved|public|credentials|port|redirect|HTML|compressed/i.test(
              error.message,
            )
          ? error.message
          : "The source could not be fetched completely. It may be unavailable, blocked, or timed out. Try pasted HTML.";
      return report;
    }
  });
  // A bounded set of direct matching destinations is checked. Unchecked links stay explicitly labelled.
  const destinations = [
    ...new Set(reports.flatMap((r) => r.links.map((l) => l.href))),
  ].slice(0, 6);
  const checks = await mapLimit(destinations, 3, async (url) => {
    const result: Destination = {
      url,
      finalUrl: url,
      status: null,
      redirects: [],
      error: "",
    };
    try {
      const r = await fetcher(url, { html: false, timeout: 4000, signal });
      result.finalUrl = r.url;
      result.status = r.status;
      result.redirects = r.redirects;
    } catch {
      result.error =
        "Destination check was inconclusive. Open this URL to review it.";
    }
    return result;
  });
  const byUrl = new Map(checks.map((c) => [c.url, c]));
  for (const report of reports)
    for (const link of report.links) {
      link.destination = byUrl.get(link.href);
      if (link.destination?.status >= 400)
        link.issues.push(
          `Destination returned HTTP ${link.destination.status}`,
        );
      if (
        link.destination?.status &&
        link.destination.status < 400 &&
        !domainMatches(
          link.destination.finalUrl,
          options.target,
          options.includeSubdomains,
        )
      )
        link.issues.push(
          "The destination redirects outside the selected target domain",
        );
    }
  return reports;
}
