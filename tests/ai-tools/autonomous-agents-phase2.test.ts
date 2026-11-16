import assert from "node:assert/strict";
import test from "node:test";
import {
  computeTopicSimilarity,
  deduplicateAndRankLowKdTopics,
  extractHtmlBrandAndHeadings,
  parseAutocompleteSuggestionsJson,
  parseGoogleTrendsRssXml,
  parseSitemapXmlUrls,
  runLiveWebsiteAndTrendScout,
} from "../../lib/autonomous-agents/sitemap-trend-scout";
import { createDefaultAutonomousStudioState } from "../../lib/autonomous-agents/local-storage-store";

test("Phase 2 parseSitemapXmlUrls extracts and classifies blog, tool, and landing URLs", () => {
  const sampleSitemapXml = `<?xml version="1.0" encoding="UTF-8"?>
    <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
      <url><loc>https://doitwithai.tools/</loc></url>
      <url><loc>https://doitwithai.tools/tools/blog-section-infographic-generator</loc></url>
      <url><loc>https://doitwithai.tools/blog/how-to-optimize-ai-seo-content-for-ai-search-citations</loc></url>
      <url><loc>https://doitwithai.tools/blog/json-ld-schema-graph-entity-linking</loc></url>
    </urlset>`;

  const entries = parseSitemapXmlUrls(sampleSitemapXml);
  assert.equal(entries.length, 4);
  assert.equal(entries[0].category, "landing");
  assert.equal(entries[1].category, "tool");
  assert.equal(entries[2].category, "blog");
  assert.equal(
    entries[2].slug,
    "how-to-optimize-ai-seo-content-for-ai-search-citations",
  );
});

test("Phase 2 extractHtmlBrandAndHeadings parses Brand DNA hex colors, tools, and blog links", () => {
  const sampleHtml = `<!DOCTYPE html>
    <html class="dark">
      <head>
        <title>DoItWithAI Tools | AI SEO Directory</title>
        <meta property="og:site_name" content="DoItWithAI.tools" />
        <meta name="theme-color" content="#38BDF8" />
        <style>:root { --brand-secondary: #F59E0B; }</style>
      </head>
      <body>
        <h1>Autonomous AI SEO & Content Studio</h1>
        <a href="/tools/meta-title-generator">AI Meta Title & Pixel Optimizer</a>
        <a href="/blog/existing-pillar-post">Existing Pillar Post</a>
      </body>
    </html>`;

  const result = extractHtmlBrandAndHeadings(
    sampleHtml,
    "https://doitwithai.tools",
  );
  assert.equal(result.siteName, "DoItWithAI.tools");
  assert.equal(result.brandPrimaryHex, "#38BDF8");
  assert.equal(result.brandSecondaryHex, "#F59E0B");
  assert.equal(result.darkThemePreferred, true);
  assert.equal(result.discoveredTools.length, 1);
  assert.equal(result.discoveredTools[0].slug, "meta-title-generator");
  assert.ok(result.existingBlogSlugs.includes("existing-pillar-post"));
});

test("Phase 2 parseGoogleTrendsRssXml and parseAutocompleteSuggestionsJson extract rising trend signals", () => {
  const sampleRss = `<rss version="2.0" xmlns:ht="https://trends.google.com/trending/rss">
    <channel>
      <item>
        <title>AI Search Optimization</title>
        <ht:approx_traffic>50,000+</ht:approx_traffic>
        <ht:news_item_title>How Answer Engines Rank Technical Guides in 2027</ht:news_item_title>
      </item>
    </channel>
  </rss>`;

  const rssSignals = parseGoogleTrendsRssXml(sampleRss);
  assert.equal(rssSignals.length, 1);
  assert.equal(rssSignals[0].title, "AI Search Optimization");
  assert.equal(rssSignals[0].approxTraffic, "50,000+");

  const autoSignals = parseAutocompleteSuggestionsJson([
    "ai seo",
    ["ai seo checklist for perplexity", "ai seo vs traditional seo"],
  ]);
  assert.equal(autoSignals.length, 2);
  assert.equal(autoSignals[0].source, "autocomplete-gap");
});

test("Phase 2 deduplicateAndRankLowKdTopics blocks cannibalized slugs and returns full target count", () => {
  const state = createDefaultAutonomousStudioState();
  const website = state.websites[0];

  const existingSlugs = [
    "ai-seo-content-writing-marketing-tools-ai-search-optimization",
    "how-to-optimize-blog-sections-for-ai-search-citations",
  ];

  const sim = computeTopicSimilarity(
    "how-to-optimize-blog-sections-for-ai-search-citations",
    "Optimize Blog Sections for AI Search Citations & Google AI Overviews",
  );
  assert.ok(sim >= 0.55);

  const { jobs, cannibalizedCandidates } = deduplicateAndRankLowKdTopics({
    website,
    seedTopicsOrPrompt: [
      "How to Optimize Blog Sections for AI Search Citations",
      "Pinterest 2:3 Visual Infographic Automation for SaaS",
      "WordPress Application Passwords REST API Auto Publishing",
    ].join("\n"),
    targetCount: 4,
    existingBlogSlugs: existingSlugs,
    trendSignals: [],
    winnerFormulas: state.winnerFormulas,
  });

  assert.equal(jobs.length, 4);
  assert.ok(cannibalizedCandidates.length >= 1);
  for (const job of jobs) {
    assert.ok(!existingSlugs.includes(job.urlSlug));
  }
});

test("Phase 2 runLiveWebsiteAndTrendScout executes end-to-end with mocked fetch", async () => {
  const mockFetch = (async (url: string | URL | Request) => {
    const urlStr = String(url);
    if (urlStr.endsWith("/sitemap.xml")) {
      return new Response(
        `<urlset><url><loc>https://doitwithai.tools/blog/already-published-guide</loc></url><url><loc>https://doitwithai.tools/tools/schema-markup-generator</loc></url></urlset>`,
        { status: 200 },
      );
    }
    if (urlStr.includes("trends.google.com")) {
      return new Response(
        `<rss><channel><item><title>Agentic SEO Workflows</title><ht:approx_traffic>20K+</ht:approx_traffic></item></channel></rss>`,
        { status: 200 },
      );
    }
    if (urlStr.includes("suggestqueries.google.com")) {
      return new Response(
        JSON.stringify(["ai seo", ["ai seo automation workflow 2027"]]),
        { status: 200 },
      );
    }
    return new Response(
      `<html><head><title>DoItWithAI Hub</title><meta name="theme-color" content="#4F46E5" /></head><body><h1>AI SEO Hub</h1></body></html>`,
      { status: 200 },
    );
  }) as typeof fetch;

  const res = await runLiveWebsiteAndTrendScout({
    siteUrl: "https://doitwithai.tools",
    primaryNiche: "AI SEO & Content Automation",
    seedTopicsOrPrompt: "Already Published Guide\nNew Programmatic Visual Guide",
    targetArticleCount: 3,
    fetchImpl: mockFetch,
  });

  assert.equal(res.scoutReport.liveFetchSucceeded, true);
  assert.equal(res.scoutReport.extractedBrand.brandPrimaryHex, "#4F46E5");
  assert.equal(res.jobs.length, 3);
  assert.ok(res.scoutReport.cannibalizationBlockedCount >= 1);
});

test("Phase 2 Real-Time Niche Discovery: non-AI domain (https://cats.com) infers feline niche, blocks unrelated sports trends ('ap top 25 basketball'), and varies topics across variationSeeds", async () => {
  const catsMockFetch = (async (url: string | URL | Request) => {
    const urlStr = String(url);
    if (urlStr.endsWith("/sitemap.xml")) {
      return new Response(
        `<urlset><url><loc>https://cats.com/blog/best-wet-cat-food</loc></url></urlset>`,
        { status: 200 },
      );
    }
    if (urlStr.includes("trends.google.com")) {
      // Unrelated US daily news trend that previously polluted cats.com topics
      return new Response(
        `<rss><channel><item><title>ap top 25 basketball</title><ht:approx_traffic>100K+</ht:approx_traffic></item></channel></rss>`,
        { status: 200 },
      );
    }
    if (urlStr.includes("suggestqueries.google.com")) {
      return new Response(
        JSON.stringify([
          "cat care",
          [
            "how to transition indoor kittens to wet food",
            "best litter box setup for multi cat homes",
          ],
        ]),
        { status: 200 },
      );
    }
    return new Response(
      `<html><head><title>Cats.com - Cat Food Reviews, Feline Health & Care Advice</title><meta name="description" content="Expert veterinary cat care guides, wet and dry cat food reviews, and feline behavior tips." /></head><body><h1>Cat Care, Nutrition & Feline Health</h1><h2>Indoor Cat Enrichment</h2></body></html>`,
      { status: 200 },
    );
  }) as typeof fetch;

  const run1 = await runLiveWebsiteAndTrendScout({
    siteUrl: "https://cats.com",
    // Even if default AI-SEO placeholder was left in primaryNiche or seedTopicsOrPrompt:
    primaryNiche: "AI SEO, Answer Engine Optimization (GEO) & Content Automation",
    seedTopicsOrPrompt: "How to Rank in Perplexity & ChatGPT Search",
    targetArticleCount: 6,
    variationSeed: 1,
    fetchImpl: catsMockFetch,
  });

  // 1. Must infer feline/cat niche from HTML instead of keeping AI SEO boilerplate
  assert.match(run1.websiteProfile.primaryNiche, /Cat|Feline/i);

  // 2. Zero basketball or unrelated AI-SEO topics in generated jobs
  for (const job of run1.jobs) {
    assert.ok(
      !job.topicTitle.toLowerCase().includes("basketball"),
      `Unexpected sports trend in topic: ${job.topicTitle}`,
    );
    assert.ok(
      !job.topicTitle.toLowerCase().includes("perplexity"),
      `Unexpected hardcoded AI-SEO template in topic: ${job.topicTitle}`,
    );
    assert.ok(
      !job.topicTitle.toLowerCase().includes("json-ld"),
      `Unexpected hardcoded JSON-LD template in topic: ${job.topicTitle}`,
    );
  }

  // 3. Repeated scan with a different variationSeed produces fresh topic titles
  const run2 = await runLiveWebsiteAndTrendScout({
    siteUrl: "https://cats.com",
    primaryNiche: "",
    seedTopicsOrPrompt: "",
    targetArticleCount: 6,
    variationSeed: 5,
    fetchImpl: catsMockFetch,
  });

  const run1Titles = run1.jobs.map((j) => j.topicTitle);
  const run2Titles = run2.jobs.map((j) => j.topicTitle);
  assert.notDeepEqual(run1Titles, run2Titles);
});

