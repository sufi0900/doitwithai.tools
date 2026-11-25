import { load } from "cheerio";
import {
  fetchPublic,
  publicUrl,
} from "@/features/backlink-verifier/fetch.server";
import type { CmsArticlePayload } from "@/lib/ai-employee-agency/cms-connectors";

export type ReviewDraft = {
  title: string;
  description: string;
  body: string;
  slug: string;
};
type Policy = {
  live_sitemap_urls?: (string | { url: string })[];
  competitor_blocklist?: string[];
  reading_grade_target?: string;
  locale?: string;
};

const escapeHtml = (text: string) =>
  text.replace(
    /[&<>"']/g,
    (c) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[
        c
      ]!,
  );
const linkPattern = /\[([^\]\n]+)\]\(([^)\s]+)\)|(https?:\/\/[^\s<>"')]+)/gi;

export function prepareArticle(draft: ReviewDraft): CmsArticlePayload {
  const paragraphs = draft.body.split(/\n\s*\n/).map((part) => {
    let html = "",
      offset = 0;
    for (const match of part.matchAll(linkPattern)) {
      html += escapeHtml(part.slice(offset, match.index));
      const href = escapeHtml(match[2] || match[3]);
      html +=
        '<a href="' + href + '">' + escapeHtml(match[1] || match[3]) + "</a>";
      offset = match.index! + match[0].length;
    }
    html += escapeHtml(part.slice(offset));
    return "<p>" + html.replace(/\n/g, "<br>") + "</p>";
  });
  const schema = JSON.stringify({
    "@context": "https://schema.org",
    "@type": "Article",
    headline: draft.title,
    description: draft.description,
  }).replace(/</g, "\\u003c");
  const jsonLdGraphScript =
    '<script type="application/ld+json">' + schema + "</script>";
  return {
    title: draft.title,
    slug: draft.slug,
    metaTitle: draft.title,
    metaDescription: draft.description,
    compiledHtmlBody: paragraphs.join("\n") + jsonLdGraphScript,
    compiledMarkdownBody: draft.body,
    aeoDirectAnswer50Words: draft.description,
    featuredHeroSvg: "",
    primaryKeyword: "",
    jsonLdGraphScript,
  };
}

export async function validateArticle(
  article: CmsArticlePayload,
  domain: string,
  policy: Policy,
) {
  const issues: string[] = [];
  const evidence: { url: string; excerpt: string }[] = [];
  const $ = load(article.compiledHtmlBody);
  try {
    const schema = JSON.parse($('script[type="application/ld+json"]').text());
    if (schema["@type"] !== "Article" || schema.headline !== article.title)
      throw Error();
  } catch {
    issues.push("Invalid Article JSON-LD.");
  }
  $("script").remove();
  const prose = $("p")
    .map((_, p) => $(p).text())
    .get()
    .join(" ")
    .replace(/https?:\/\/\S+/gi, "");
  if (
    article.metaTitle.length > 60 ||
    article.metaTitle.length < 10 ||
    article.metaDescription.length > 160 ||
    article.metaDescription.length < 50
  )
    issues.push(
      "Use a title of 10–60 characters and a description of 50–160 characters.",
    );
  if (
    /\b(delve into|ever-evolving landscape|in today.s digital age|unlock the power of|game.changer)\b/i.test(
      prose,
    )
  )
    issues.push("Replace stock marketing phrases with specific language.");
  if (!policy.locale || /^en\b/i.test(policy.locale)) {
    const words: string[] = prose.toLowerCase().match(/[a-z]+/g) || [];
    const syllables = words.reduce(
      (sum, w) =>
        sum +
        Math.max(1, (w.replace(/e$/, "").match(/[aeiouy]+/g) || []).length),
      0,
    );
    const sentences = Math.max(1, (prose.match(/[.!?]+/g) || []).length);
    const grade =
      (0.39 * words.length) / sentences +
      (11.8 * syllables) / Math.max(1, words.length) -
      15.59;
    const limit = policy.reading_grade_target === "grade_7_9" ? 9 : 12;
    if (grade > limit)
      issues.push(
        "Simplify the prose. Estimated reading grade is " +
          grade.toFixed(1) +
          ", target " +
          limit +
          ".",
      );
  }
  const base = new URL(domain);
  function normalize(value: string) {
    const u = publicUrl(new URL(value, base).href);
    return u.href;
  }
  const sitemap = new Set(
    (policy.live_sitemap_urls || []).map((entry) =>
      normalize(typeof entry === "string" ? entry : entry.url),
    ),
  );
  const hostname = (host: string) =>
    host
      .toLowerCase()
      .replace(/^www\./, "")
      .replace(/\.$/, "");
  const blocked = (policy.competitor_blocklist || []).map((d) =>
    hostname(new URL(d.includes("://") ? d : "https://" + d).hostname),
  );
  function check(url: URL) {
    const host = hostname(url.hostname);
    if (blocked.some((d) => host === d || host.endsWith("." + d)))
      throw Error("Competitor domain");
    if (host === hostname(base.hostname) && !sitemap.has(url.href))
      throw Error("Missing from approved sitemap");
  }
  const links = new Set(
    $("a[href]")
      .map((_, a) => $(a).attr("href")!)
      .get(),
  );
  if (links.size > 20) issues.push("Use at most 20 distinct links per review.");
  if (issues.length) return { issues, evidence };
  const signal = AbortSignal.timeout(18000);
  for (const raw of links) {
    try {
      const url = normalize(raw);
      check(new URL(url));
      const page = await fetchPublic(url, {
        signal,
        beforeRequest: async (u) => check(u),
        maxDecodedBytes: 400000,
      });
      if (page.status !== 200) throw Error("HTTP " + page.status);
      const doc = load(page.html);
      evidence.push({
        url,
        excerpt: doc("p")
          .map((_, p) => doc(p).text().trim())
          .get()
          .join(" ")
          .slice(0, 2000),
      });
    } catch (err) {
      issues.push(
        raw + " — " + (err instanceof Error ? err.message : "Link unavailable"),
      );
    }
  }
  return { issues, evidence };
}
