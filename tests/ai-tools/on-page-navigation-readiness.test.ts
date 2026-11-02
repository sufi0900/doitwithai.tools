import test from "node:test";
import assert from "node:assert/strict";
import { extractHtml } from "../../features/on-page-analyzer/server/extract";
import { answerReadiness } from "../../features/on-page-analyzer/readiness";
import {
  auditPage,
  sampleOpeningReviewBlocks,
  summarize,
} from "../../features/on-page-analyzer/audit";
import { crawlerReadiness } from "../../features/on-page-analyzer/crawlers";
import {
  sectionFromHash,
  sectionHash,
} from "../../features/on-page-analyzer/navigation";
import { reviewInput } from "../../features/on-page-analyzer/review";
import { SECTIONS } from "../../features/on-page-analyzer/types";
import {
  inspectCrawlerPath,
  parseCrawlerPolicy,
} from "../../features/robots-generator/access";

const access = (text: string, path = "/article", agent = "OAI-SearchBot") =>
  inspectCrawlerPath(parseCrawlerPolicy(text), agent, path);
test("section links round-trip through a bounded allowlist without accepting arbitrary fragments", () => {
  for (const section of SECTIONS)
    assert.equal(sectionFromHash(sectionHash(section.id)), section.id);
  for (const hash of [
    "#unknown",
    "#audit-evil",
    "search",
    "#audit-search?x=1",
    "#audit-search/../content",
  ])
    assert.equal(sectionFromHash(hash), null);
});
test("crawler rules inspect the actual path and most specific Allow exception", () => {
  const policy = "User-agent: *\nDisallow: /private/\nAllow: /private/public/";
  assert.equal(access(policy, "/article").status, "allowed");
  assert.equal(access(policy, "/private/notes").status, "blocked");
  assert.equal(access(policy, "/private/public/notes").status, "allowed");
  assert.equal(access(policy, "/Private/notes").status, "allowed");
});
test("crawler-specific groups override wildcard rules and repeated groups merge", () => {
  const policy =
    "User-agent: *\nDisallow: /\nUser-agent: OAI-SearchBot\nDisallow: /draft/\nUser-agent: OAI-SearchBot\nAllow: /draft/shared/";
  assert.equal(access(policy, "/article").status, "allowed");
  assert.equal(access(policy, "/draft/shared/post").status, "allowed");
  assert.equal(access(policy, "/draft/secret").status, "blocked");
  assert.equal(access(policy, "/article", "GPTBot").status, "blocked");
});
test("wildcards, terminal matching, query strings, and percent encoding follow bounded path rules", () => {
  const policy =
    "User-agent: *\nDisallow: /*.pdf$\nDisallow: /download?private=*\nDisallow: /caf%C3%A9\nDisallow: /%7Edraft\nAllow: /file.pdf";
  assert.equal(access(policy, "/guide.pdf").status, "blocked");
  assert.equal(access(policy, "/guide.pdf?public=1").status, "allowed");
  assert.equal(access(policy, "/download?private=yes").status, "blocked");
  assert.equal(access(policy, "/café").status, "blocked");
  assert.equal(access(policy, "/~draft").status, "blocked");
  assert.equal(access(policy, "/file.pdf").status, "allowed");
  assert.equal(
    access("User-agent: *\nDisallow: /a%2Fb", "/a/b").status,
    "allowed",
  );
});
test("equal specificity favors Allow and empty Disallow never blocks", () => {
  assert.equal(
    access("User-agent: *\nDisallow: /a\nAllow: /a", "/a").status,
    "allowed",
  );
  assert.equal(access("User-agent: *\nDisallow:").status, "allowed");
});
test("truncated or unavailable robot files do not produce a crawler access pass", () => {
  const p = extractHtml(
    "<main><h1>AI SEO</h1><p>AI SEO uses artificial intelligence to support search optimization.</p></main>",
    "https://example.com/article",
  );
  assert.ok(crawlerReadiness(p).every((r) => r.status === "unknown"));
  p.resources = {
    robots: "found",
    robotsText: "User-agent: *\nAllow: /",
    robotsPartial: true,
    llms: "unknown",
  };
  assert.ok(crawlerReadiness(p).every((r) => r.status === "unknown"));
  p.resources.robots = "missing";
  p.resources.robotsPartial = false;
  assert.ok(
    crawlerReadiness(p)
      .filter((r) => r.scored)
      .every((r) => r.status === "allowed"),
  );
});
test("blocking search affects readiness while training preferences never change the score", () => {
  const p = extractHtml(
    '<html lang="en"><main><h1>AI SEO</h1><p>AI SEO uses artificial intelligence to support search optimization.</p></main></html>',
    "https://example.com/article",
  );
  p.resources = {
    robots: "found",
    robotsText: "User-agent: *\nAllow: /",
    llms: "unknown",
  };
  const original = summarize(auditPage(p), "ai-search").score;
  p.resources.robotsText += "\nUser-agent: GPTBot\nDisallow: /";
  assert.equal(summarize(auditPage(p), "ai-search").score, original);
  p.resources.robotsText += "\nUser-agent: OAI-SearchBot\nDisallow: /article";
  const findings = auditPage(p);
  assert.ok(summarize(findings, "ai-search").score! < original!);
  assert.equal(
    findings.find((f) => f.id === "crawler-OAI-SearchBot")?.credit,
    0,
  );
  assert.equal(
    findings.find((f) => f.id === "crawler-OAI-SearchBot")?.status,
    "warning",
  );
});
test("generic openings are reviewed using the complete paragraph rather than its first sentence", () => {
  const generic =
    "We have seen a huge change in how people look for information online in recent years.";
  const p = extractHtml(
    `<main><h1>AI SEO explained</h1><p>${generic}</p><p>AI SEO uses artificial intelligence to support search optimization.</p></main>`,
  );
  assert.equal(answerReadiness(p).opening.status, "review");
  assert.equal(answerReadiness(p).opening.paragraphs.length, 2);
  const complete = extractHtml(
    `<main><h1>AI SEO explained</h1><p>${generic} AI SEO uses artificial intelligence to support search optimization.</p></main>`,
  );
  assert.equal(answerReadiness(complete).opening.status, "available");
  assert.match(
    answerReadiness(complete).opening.passage!.text,
    /optimization\.$/,
  );
});
test("opening review retains headings, whole paragraphs within the sample budget, and following context", () => {
  const p = extractHtml(
    "<main><h1>AI SEO explained</h1><p>AI SEO uses artificial intelligence to support research and improve content. It combines editorial judgment with measurable search checks.</p><p>Our examples show the process.</p><h2>Table of Contents</h2><ul><li>Steps</li></ul><h2>Steps</h2><p>First, choose a page.</p></main>",
  );
  const sample = sampleOpeningReviewBlocks(p);
  assert.ok(sample.some((b) => b.text.includes("It combines editorial")));
  assert.ok(sample.some((b) => b.text === "Our examples show the process."));
  assert.ok(!sample.some((b) => b.text === "Table of Contents"));
  assert.ok(sample.every((b) => b.text.length <= 1600));
  assert.ok(sample.length <= 27);
  assert.equal(new Set(sample.map((b) => b.id)).size, sample.length);
});
test("favicon metadata is resolved safely and preferred over touch icons", () => {
  const p = extractHtml(
    '<link rel="apple-touch-icon" href="/touch.png"><link rel="shortcut icon" href="/brand.ico"><link rel="icon" href="javascript:alert(1)">',
    "https://example.com/article",
  );
  assert.equal(p.favicon, "https://example.com/brand.ico");
});

test("contextual review samples and server validation enforce the shared total text budget", () => {
  const p = extractHtml(
    "<main><h1>AI SEO</h1>" +
      Array.from(
        { length: 12 },
        (_, i) =>
          `<h2>Topic ${i}</h2><p>${"AI SEO helps readers understand search. ".repeat(75)}</p><p>${"Useful context for the section. ".repeat(75)}</p>`,
      ).join("") +
      "</main>",
  );
  const sample = sampleOpeningReviewBlocks(p);
  assert.ok(sample.reduce((n, b) => n + b.text.length, 0) <= 24000);
  assert.ok(reviewInput.safeParse({ title: "AI SEO", blocks: sample }).success);
  const oversized = Array.from({ length: 16 }, (_, i) => ({
    id: `block:${i}`,
    tag: "p",
    text: "x".repeat(1600),
  }));
  assert.equal(
    reviewInput.safeParse({ title: "AI SEO", blocks: oversized }).success,
    false,
  );
});

test("Google-documented rule precedence includes wildcard and terminal-anchor specificity", () => {
  assert.equal(
    access("User-agent: *\nAllow: /page\nDisallow: /*.htm", "/page.htm").status,
    "blocked",
  );
  assert.equal(
    access("User-agent: *\nAllow: /page\nDisallow: /*.ph", "/page.php5").status,
    "allowed",
  );
  assert.equal(
    access("User-agent: *\nAllow: /$\nDisallow: /", "/").status,
    "allowed",
  );
  assert.equal(
    access("User-agent: *\nAllow: /$\nDisallow: /", "/other").status,
    "blocked",
  );
  assert.equal(
    access("User-agent: googlebot*\nDisallow: /", "/article", "Googlebot")
      .status,
    "blocked",
  );
  assert.equal(
    access("User-agent: googlebot/1.2\nDisallow: /", "/article", "Googlebot")
      .status,
    "blocked",
  );
  assert.equal(
    access("User-agent: googlebot-news\nDisallow: /", "/article", "Googlebot")
      .status,
    "allowed",
  );
});

test("non-access directives never split consecutive User-agent declarations", () => {
  const policy =
    "User-agent: OAI-SearchBot\nSitemap: https://example.com/sitemap.xml\nCrawl-delay: 10\nUser-agent: PerplexityBot\nDisallow: /";
  assert.equal(access(policy).status, "blocked");
  assert.equal(access(policy, "/article", "PerplexityBot").status, "blocked");
});
