import { test } from "node:test";
import assert from "node:assert/strict";
import {
  inputSchema,
  normalizeUrl,
  sameSite,
  textMatches,
  validateSuggestions,
  type Page,
} from "../../features/internal-linking/core";
import {
  collectPages,
  extractPage,
  publicIpv4,
  robotsAllows,
  sitemapEntries,
} from "../../features/internal-linking/server";
import { POST } from "../../features/internal-linking/handler";
import { NextRequest } from "next/server";
const source: Page = {
  url: "https://example.com/research",
  title: "Keyword research",
  paragraphs: [
    "Check search intent before choosing which keywords deserve a separate article.",
  ],
  links: [],
};
const destination: Page = {
  url: "https://example.com/search-intent",
  title: "How to check search intent",
  paragraphs: ["Search intent describes the task a reader wants to complete."],
  links: [],
};
test("extraction keeps article passages and existing links without navigation", () => {
  const page = extractPage(
    '<html><title>Research</title><body><nav><p>This navigation should never become an anchor placement.</p></nav><article><h1>Keyword research</h1><p>Check <a href="/search-intent#types">search intent</a> before choosing which keywords deserve a separate article.</p><aside><p>This related post should never become an anchor placement.</p></aside></article></body></html>',
    source.url,
  );
  assert.equal(page.paragraphs.length, 1);
  assert.equal(page.links[0].url, destination.url);
  assert.equal(page.title, source.title);
  assert.throws(
    () =>
      extractPage(
        '<meta name="robots" content="noindex"><article><p>This is a long paragraph that should never be analyzed here.</p></article>',
        source.url,
      ),
    /noindex/,
  );
});
test("sitemaps distinguish index entries, remove duplicates and exclude other sites", () => {
  assert.deepEqual(
    sitemapEntries(
      "<urlset><url><loc>https://example.com/search-intent</loc></url><url><loc>https://other.com/page</loc></url><url><loc>https://example.com/search-intent</loc></url></urlset>",
      source.url,
    ),
    { index: false, urls: [destination.url] },
  );
  assert.equal(
    sitemapEntries(
      "<sitemapindex><sitemap><loc>https://example.com/posts.xml</loc></sitemap></sitemapindex>",
      source.url,
    ).index,
    true,
  );
});
test("network allowlist rejects private, reserved, encoded and IPv6 addresses", () => {
  for (const address of [
    "127.0.0.1",
    "10.0.0.1",
    "192.168.1.1",
    "169.254.169.254",
    "100.64.0.1",
    "198.18.0.1",
    "203.0.113.1",
    "::1",
    "::ffff:127.0.0.1",
  ])
    assert.equal(publicIpv4(address), false, address);
  assert.equal(publicIpv4("8.8.8.8"), true);
  assert.equal(publicIpv4(new URL("http://2130706433").hostname), false);
  assert.throws(() => normalizeUrl("https://user:pass@example.com"));
  assert.equal(
    sameSite("https://example.com.evil.test/page", source.url),
    false,
  );
});
test("robots rules apply wildcard, specific agents and longest allow rules", () => {
  const robots =
    "User-agent: *\nDisallow: /private\nAllow: /private/public\nDisallow: /*?secret=";
  assert.equal(robotsAllows(robots, "https://example.com/private/a"), false);
  assert.equal(
    robotsAllows(robots, "https://example.com/private/public/a"),
    true,
  );
  assert.equal(robotsAllows(robots, "https://example.com/a?secret=x"), false);
  assert.equal(
    robotsAllows(
      "User-agent: *\nDisallow: /\nUser-agent: DoItWithAI-LinkFinder\nAllow: /",
      source.url,
    ),
    true,
  );
});
test("suggestions reject invented URLs, nonexistent words, duplicates and existing links", () => {
  const valid = {
    destinationUrl: destination.url,
    paragraphIndex: 0,
    anchor: "search intent",
    reason: "This page explains the search intent check.",
  };
  assert.equal(
    validateSuggestions(
      { suggestions: [valid, valid] },
      source,
      [destination],
      "AI reviewed",
    ).length,
    1,
  );
  for (const invalid of [
    { ...valid, anchor: "invented words" },
    { ...valid, destinationUrl: "https://evil.test/page" },
    { ...valid, paragraphIndex: 99 },
  ])
    assert.equal(
      validateSuggestions(
        { suggestions: [invalid] },
        source,
        [destination],
        "AI reviewed",
      ).length,
      0,
    );
  assert.equal(
    validateSuggestions(
      { suggestions: [valid] },
      {
        ...source,
        links: [{ url: destination.url + "#types", text: "search intent" }],
      },
      [destination],
      "AI reviewed",
    ).length,
    0,
  );
  assert.equal(textMatches(source, [destination])[0].anchor, "search intent");
  assert.equal(
    textMatches(source, [
      {
        ...destination,
        title: "Bread recipes",
        url: "https://example.com/bread-recipes",
        paragraphs: ["Bread and flour recipes for home baking."],
      },
    ]).length,
    0,
  );
});
test("input and endpoint reject oversized or cross-site candidate lists before downloads", async () => {
  assert.equal(
    inputSchema.safeParse({
      sourceUrl: source.url,
      destinationUrls: Array(101).fill(destination.url),
    }).success,
    false,
  );
  const response = await POST(
    new NextRequest("http://localhost/api/ai-tools/internal-linking", {
      method: "POST",
      body: JSON.stringify({
        sourceUrl: source.url,
        destinationUrls: ["https://other.com/page"],
      }),
    }),
  );
  assert.equal(response.status, 422);
  const invalid = await POST(
    new NextRequest("http://localhost/api/ai-tools/internal-linking", {
      method: "POST",
      body: "{",
    }),
  );
  assert.equal(invalid.status, 400);
});
test("article URL flows through sitemap discovery, content fetch, skipped-page coverage and exact suggestions", async () => {
  const fetched: string[] = [];
  const read = async (url: string) => {
    fetched.push(url);
    const fixtures: Record<string, string> = {
      "https://example.com/robots.txt":
        "User-agent: *\nDisallow: /private\nSitemap: https://example.com/sitemap.xml",
      [source.url]: `<article><h1>${source.title}</h1><p>${source.paragraphs[0]}</p></article>`,
      "https://example.com/sitemap.xml":
        "<sitemapindex><sitemap><loc>https://example.com/posts.xml</loc></sitemap></sitemapindex>",
      "https://example.com/posts.xml": `<urlset>${[source.url, destination.url, "https://example.com/private", "https://example.com/missing"].map((u) => `<url><loc>${u}</loc></url>`).join("")}</urlset>`,
      [destination.url]: `<article><h1>${destination.title}</h1><p>${destination.paragraphs[0]}</p></article>`,
    };
    if (!fixtures[url]) throw new Error("HTTP 404");
    return { url, body: fixtures[url] };
  };
  const result = await collectPages(
    {
      sourceUrl: source.url,
      sourceText: "",
      sitemapUrl: "",
      destinationUrls: [],
    },
    new AbortController().signal,
    read,
  );
  assert.equal(result.discovered, 3);
  assert.equal(result.destinations.length, 1);
  assert.equal(
    textMatches(result.source, result.destinations)[0].anchor,
    "search intent",
  );
  assert.ok(result.pages.some((p) => p.status === "Blocked by robots.txt"));
  assert.ok(result.pages.some((p) => p.status === "HTTP 404"));
  assert.ok(!fetched.includes("https://example.com/private"));
  const manual = await collectPages(
    {
      sourceUrl: source.url,
      sourceText: source.paragraphs[0],
      sitemapUrl: "",
      destinationUrls: [destination.url],
    },
    new AbortController().signal,
    read,
  );
  assert.equal(manual.discovery, "Supplied URLs");
  assert.ok(manual.notes.some((n) => n.includes("duplicate")));
});
