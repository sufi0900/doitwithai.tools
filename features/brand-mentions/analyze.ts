import * as cheerio from "cheerio";
import { getDomain } from "tldts";
import { webUrl } from "../backlink-verifier/analyze";
import type { Settings, MentionReport, Mention } from "./types";
type HtmlNode = {
  type: string;
  name?: string;
  data?: string;
  attribs?: Record<string, string>;
  children?: HtmlNode[];
};
const host = (value: string) =>
  new URL(value).hostname
    .toLowerCase()
    .replace(/\.$/, "")
    .replace(/^www\./, "");
export function sameWebsite(
  candidate: string,
  target: string,
  subdomains = true,
) {
  try {
    const a = host(candidate),
      b = host(target);
    return a === b || (subdomains && a.endsWith("." + b));
  } catch {
    return false;
  }
}
export function ownSource(source: string, target: string) {
  try {
    const a = host(source),
      b = host(target);
    const domain = (h: string) =>
      getDomain(h, { allowPrivateDomains: true }) ||
      getDomain(h, { allowPrivateDomains: false }) ||
      h;
    return domain(a) === domain(b);
  } catch {
    return false;
  }
}
export function emptyMentionReport(
  sourceUrl: string,
  method: MentionReport["method"] = "live",
): MentionReport {
  return {
    sourceUrl,
    finalUrl: sourceUrl,
    method,
    checkedAt: new Date().toISOString(),
    httpStatus: null,
    title: "",
    status: "unverified",
    complete: false,
    mentions: [],
    siteLinks: [],
    notes: [],
    error: "",
  };
}
const escape = (value: string) => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
const tidy = (value: string, max = 300) =>
  value.replace(/\s+/g, " ").trim().slice(0, max);
export function analyzeMentions(
  html: string,
  source: string,
  settings: Settings,
  extra: Partial<MentionReport> = {},
): MentionReport {
  const report = { ...emptyMentionReport(source, "pasted"), ...extra };
  if (ownSource(report.finalUrl, settings.target)) {
    report.status = "own-site";
    report.notes.push(
      "This source belongs to your website and is excluded from external opportunities.",
    );
    return report;
  }
  const $ = cheerio.load(html);
  report.title = tidy($("title").first().text());
  if (
    /^(just a moment|access denied|attention required|verify (you are|you're) human|security verification)[.!…\s]*$/i.test(
      report.title,
    )
  ) {
    report.error =
      "The source returned an access challenge. Its brand mentions could not be verified.";
    return report;
  }
  const baseHref = $("base[href]").first().attr("href");
  const base = baseHref
    ? webUrl(baseHref, report.finalUrl) || report.finalUrl
    : report.finalUrl;
  $("template,noscript,script,style").remove();
  const anchors = $("a[href],area[href]");
  report.complete = anchors.length <= 10000;
  const seen = new Set<string>();
  anchors.slice(0, 10000).each((_, node) => {
    const href = webUrl($(node).attr("href") || "", base);
    if (
      !href ||
      !sameWebsite(href, settings.target, settings.includeSubdomains) ||
      seen.has(href)
    )
      return;
    seen.add(href);
    if (report.siteLinks.length < 100)
      report.siteLinks.push({
        href,
        rel: ($(node).attr("rel") || "")
          .toLowerCase()
          .split(/\s+/)
          .filter(Boolean),
      });
    else report.complete = false;
  });
  const names = [
    ...new Set(
      [settings.brand, ...settings.aliases]
        .map((s) => s.normalize("NFKC").replace(/\s+/g, " ").trim())
        .filter(Boolean),
    ),
  ].sort((a, b) => b.length - a.length);
  if (!names.length) {
    report.error = "Enter a brand name to match.";
    report.complete = false;
    return report;
  }
  const pattern = new RegExp(
    `(?<![\\p{L}\\p{N}_])(?:${names.map(escape).join("|")})(?![\\p{L}\\p{N}_])`,
    settings.caseSensitive ? "gu" : "giu",
  );
  type Part = {
    start: number;
    end: number;
    href: string;
    rel: string[];
    section: string;
  };
  let text = "",
    parts: Part[] = [],
    characters = 0,
    visited = 0;
  const flush = () => {
    if (!text.trim()) {
      text = "";
      parts = [];
      return;
    }
    pattern.lastIndex = 0;
    for (const match of text.matchAll(pattern)) {
      if (report.mentions.length >= 200) {
        report.complete = false;
        break;
      }
      const start = match.index!,
        end = start + match[0].length;
      const overlapping = parts.filter(
        (p) =>
          p.end > start &&
          p.start < end &&
          text.slice(Math.max(start, p.start), Math.min(end, p.end)).trim(),
      );
      const hrefs = [...new Set(overlapping.map((p) => p.href))];
      const href = hrefs.length === 1 ? hrefs[0] : "";
      const kind: Mention["kind"] = href
        ? sameWebsite(href, settings.target, settings.includeSubdomains)
          ? "website-link"
          : "other-link"
        : hrefs.some(Boolean)
          ? "partial-link"
          : "plain";
      report.mentions.push({
        text: match[0],
        before: text.slice(Math.max(0, start - 130), start),
        after: text.slice(end, end + 160),
        kind,
        href,
        destinations: hrefs.filter(Boolean),
        rel: [...new Set(overlapping.flatMap((p) => p.rel))],
        section: overlapping[0]?.section || "body",
      });
    }
    text = "";
    parts = [];
  };
  type Frame = {
    node: HtmlNode;
    href: string;
    rel: string[];
    section: string;
    depth: number;
    exit?: boolean;
  };
  const root = $("body").get(0) as unknown as HtmlNode;
  const stack: Frame[] = root
    ? [{ node: root, href: "", rel: [], section: "body", depth: 0 }]
    : [];
  const blocks = new Set([
    "p",
    "div",
    "section",
    "article",
    "main",
    "aside",
    "nav",
    "header",
    "footer",
    "li",
    "td",
    "th",
    "h1",
    "h2",
    "h3",
    "h4",
    "h5",
    "h6",
    "blockquote",
    "pre",
    "br",
    "hr",
    "dt",
    "dd",
  ]);
  while (stack.length) {
    const frame = stack.pop()!;
    if (frame.exit) {
      flush();
      continue;
    }
    if (++visited > 40000 || characters > 300000 || frame.depth > 150) {
      report.complete = false;
      break;
    }
    const { node } = frame,
      name = node.name || "",
      attrs = node.attribs || {};
    if (
      [
        "script",
        "style",
        "head",
        "template",
        "noscript",
        "svg",
        "canvas",
        "iframe",
      ].includes(name) ||
      "hidden" in attrs ||
      "inert" in attrs ||
      attrs["aria-hidden"]?.toLowerCase() === "true" ||
      /(?:^|;)\s*(?:display\s*:\s*none|visibility\s*:\s*(?:hidden|collapse))(?:\s*!important)?\s*(?:;|$)/i.test(
        attrs.style || "",
      )
    )
      continue;
    if (node.type === "text") {
      const value = (node.data || "").normalize("NFKC").replace(/\s+/g, " ");
      const normalized = text.endsWith(" ") ? value.replace(/^ /, "") : value;
      if (characters + normalized.length > 300000) {
        report.complete = false;
        break;
      }
      const start = text.length;
      text += normalized;
      characters += normalized.length;
      if (normalized)
        parts.push({
          start,
          end: text.length,
          href: frame.href,
          rel: frame.rel,
          section: frame.section,
        });
      continue;
    }
    const block = blocks.has(name);
    if (block) {
      flush();
      stack.push({ ...frame, exit: true });
    }
    const href =
      name === "a"
        ? "href" in attrs
          ? webUrl(attrs.href, base)
          : ""
        : frame.href;
    const rel =
      name === "a"
        ? (attrs.rel || "").toLowerCase().split(/\s+/).filter(Boolean)
        : frame.rel;
    const section = [
      "main",
      "article",
      "aside",
      "nav",
      "header",
      "footer",
    ].includes(name)
      ? name
      : frame.section;
    for (const child of [...(node.children || [])].reverse())
      stack.push({ node: child, href, rel, section, depth: frame.depth + 1 });
  }
  flush();
  const linked = report.mentions.filter(
    (m) => m.kind === "website-link",
  ).length;
  report.status = !report.complete
    ? "unverified"
    : !report.mentions.length
      ? "not-mentioned"
      : linked === report.mentions.length
        ? "linked"
        : linked
          ? "mixed"
          : report.siteLinks.length
            ? "elsewhere"
            : report.mentions.some((m) => m.kind !== "plain")
              ? "review"
              : "unlinked";
  report.notes.push(
    "Only HTML evidence was inspected. JavaScript-rendered content, external CSS, shadow DOM, and iframe pages were not rendered.",
  );
  if (!report.complete)
    report.notes.push(
      "An analysis limit was reached. Negative link or mention conclusions cannot be confirmed.",
    );
  if (report.method === "pasted")
    report.notes.push("Supplied HTML is not a live website check.");
  if (report.status === "review")
    report.notes.push(
      "Mentions link to another destination or are partly linked. Redirects were not resolved; review those links manually.",
    );
  if (report.status === "elsewhere" || report.status === "mixed")
    report.notes.push(
      "This page already links to your website. Unlinked text does not establish a new referring-domain opportunity.",
    );
  return report;
}
