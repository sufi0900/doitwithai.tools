import * as cheerio from "cheerio";
import type { Options, Report, Match } from "./types";

export function webUrl(raw: string, base?: string): string {
  try {
    const u = new URL(raw, base);
    if (!/^https?:$/.test(u.protocol) || u.username || u.password) return "";
    u.hash = "";
    return u.href;
  } catch {
    return "";
  }
}
const host = (u: URL) => u.hostname.replace(/^www\./, "");
export function domainMatches(
  candidate: string,
  target: string,
  subdomains: boolean,
) {
  try {
    const a = host(new URL(candidate)),
      b = host(new URL(target));
    return a === b || (subdomains && a.endsWith("." + b));
  } catch {
    return false;
  }
}
const clean = (s: string, max = 500) =>
  s.replace(/\s+/g, " ").trim().slice(0, max);
export function emptyReport(
  sourceUrl: string,
  method: Report["method"] = "live",
): Report {
  return {
    sourceUrl,
    finalUrl: sourceUrl,
    status: "unverified",
    checkedAt: new Date().toISOString(),
    httpStatus: null,
    redirects: [],
    title: "",
    canonical: "",
    robots: [],
    pageNofollow: false,
    noindex: false,
    crawlAccess: "unknown",
    crawlNote: "Robots policy was not fetched.",
    complete: false,
    links: [],
    otherTargets: [],
    notes: [],
    error: "",
    method,
  };
}
/** Only generic and Googlebot-scoped directives describe this Google-focused report. */
export function googleDirectives(header: string) {
  let applies = true;
  const result: string[] = [];
  for (const part of header.toLowerCase().split(",")) {
    let token = part.trim();
    const scope = token.match(/^([a-z][\w-]*):\s*(.*)$/);
    if (scope) {
      applies = ["googlebot", "*"].includes(scope[1]);
      token = scope[2];
    }
    if (applies) result.push(...token.split(/\s+/).filter(Boolean));
  }
  return result;
}
export function analyzeHtml(
  html: string,
  sourceUrl: string,
  options: Options,
  extras: Partial<Report> & { xRobots?: string } = {},
): Report {
  const report = {
    ...emptyReport(sourceUrl, extras.method || "pasted"),
    ...extras,
  };
  const $ = cheerio.load(html),
    finalUrl = report.finalUrl || sourceUrl;
  report.title = clean($("title").first().text(), 300);
  // A successful HTTP response can still be an access challenge.
  if (
    /^(just a moment|access denied|attention required|verify (you are|you're) human|security verification)[.!…\s]*$/i.test(
      report.title,
    )
  ) {
    report.error =
      "The source returned an access challenge. Paste its actual page HTML or try again later.";
    return report;
  }
  const canonical = $('link[rel~="canonical"]').first().attr("href");
  report.canonical = canonical ? webUrl(canonical, finalUrl) : "";
  const directives = googleDirectives(extras.xRobots || "");
  if (extras.xRobots)
    report.robots.push(`HTTP: ${clean(extras.xRobots, 1000)}`);
  $("meta[name]").each((_, n) => {
    const name = $(n).attr("name")?.toLowerCase();
    if (name === "robots" || name === "googlebot") {
      const content = $(n).attr("content") || "";
      report.robots.push(`${name}: ${clean(content, 1000)}`);
      directives.push(...content.toLowerCase().split(/[\s,]+/));
    }
  });
  report.noindex =
    directives.includes("noindex") || directives.includes("none");
  report.pageNofollow =
    directives.includes("nofollow") || directives.includes("none");
  const baseHref = $("base[href]").first().attr("href");
  const base = baseHref ? webUrl(baseHref, finalUrl) || finalUrl : finalUrl;
  // Template content can have a detached parse tree; remove inactive containers before selecting anchors.
  $("template,noscript").remove();
  const target = webUrl(options.target),
    nodes = $("a[href],area[href]");
  const other = new Set<string>();
  report.complete = nodes.length <= 10000 && extras.complete !== false;
  nodes.slice(0, 10000).each((_, node) => {
    if ($(node).closest("template,noscript").length) return;
    const href = webUrl($(node).attr("href") || "", base);
    if (!href || !domainMatches(href, target, options.includeSubdomains))
      return;
    if (options.mode === "page" && href !== target) {
      other.add(href);
      return;
    }
    if (report.links.length >= 100) {
      report.complete = false;
      return;
    }
    const text = $(node).clone();
    text.find("script,style").remove();
    const imageAlt = $(node)
      .find("img[alt]")
      .map((_, n) => $(n).attr("alt") || "")
      .get()
      .join(" ");
    const anchor =
      clean(text.text()) ||
      clean(imageAlt) ||
      clean($(node).attr("aria-label") || "") ||
      clean($(node).attr("alt") || "");
    const anchorSource = clean(text.text())
      ? "Text"
      : clean(imageAlt)
        ? "Image alt"
        : "Accessible label or empty";
    const rel = [
      ...new Set(
        ($(node).attr("rel") || "").toLowerCase().split(/\s+/).filter(Boolean),
      ),
    ];
    const section =
      $(node)
        .closest("nav,footer,header,aside,main,article")
        .prop("tagName")
        ?.toLowerCase() || "Other";
    const issues: string[] = [];
    if (
      options.expectedAnchor &&
      anchor.toLowerCase() !== clean(options.expectedAnchor).toLowerCase()
    )
      issues.push("Anchor differs from your expectation");
    const qualified =
      rel.some((r) => ["nofollow", "sponsored", "ugc"].includes(r)) ||
      report.pageNofollow;
    if (options.expectedRel === "unqualified" && qualified)
      issues.push("Link or page has a relationship qualification");
    if (
      !["any", "unqualified"].includes(options.expectedRel) &&
      !rel.includes(options.expectedRel)
    )
      issues.push(`Expected ${options.expectedRel} is absent from this link`);
    const external = !domainMatches(href, finalUrl, true);
    if (!external) issues.push("Source and target are on the same site");
    if (!anchor) issues.push("No anchor text or image alt was found");
    report.links.push({
      href,
      anchor,
      anchorSource,
      rel,
      placement: section,
      external,
      issues,
      context: clean(
        $(node).closest("p,li,div,td,section").first().text(),
        320,
      ),
    });
  });
  report.otherTargets = [...other].slice(0, 20);
  report.status = report.links.length
    ? "found"
    : !report.complete
      ? "unverified"
      : other.size
        ? "different-page"
        : "not-found";
  if (!report.complete)
    report.notes.push(
      "The report reached an HTML or link limit. A missing link cannot be confirmed.",
    );
  if (report.noindex)
    report.notes.push(
      "A noindex directive is present. This is not a check of Google's actual index.",
    );
  if (report.pageNofollow)
    report.notes.push("A page-level nofollow directive applies to Googlebot.");
  if (report.canonical && report.canonical !== webUrl(finalUrl))
    report.notes.push(
      "The source declares a different canonical URL. Review its intended page version.",
    );
  if (!report.links.length)
    report.notes.push(
      "Only supplied or fetched HTML was checked. Browser-rendered JavaScript and iframe content may contain additional links.",
    );
  if (report.method === "pasted")
    report.notes.push(
      "Pasted HTML is supplied evidence. HTTP status, robots.txt, and live destinations were not verified.",
    );
  return report;
}
