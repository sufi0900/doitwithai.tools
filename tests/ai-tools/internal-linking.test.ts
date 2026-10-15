import { test } from "node:test";
import assert from "node:assert/strict";
import {
  inputSchema,
  normalizeUrl,
  sameSite,
  textMatches,
  validateSuggestions,
  type Page,
  selectReviewPassages,
  reviewDestinations,
  mergeSuggestions,
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

test("a linked phrase elsewhere does not suppress an unlinked exact placement", () => {
  const page = extractPage(
    '<article><p>Read <a href="/overview">search intent</a> in this overview of website planning and editorial strategy.</p><p>Check search intent before choosing which keywords deserve a separate article.</p></article>',
    source.url,
  );
  const result = textMatches(page, [destination]);
  assert.equal(result.length, 1);
  assert.equal(result[0].paragraphIndex, 1);
  assert.equal(result[0].anchor, "search intent");
  const linked = extractPage(
    '<article><p>Check <a href="/overview">search intent</a> before choosing which keywords deserve a separate article.</p></article>',
    source.url,
  );
  assert.equal(textMatches(linked, [destination]).length, 0);
});

test("empty AI review preserves validated local opportunities and merges without duplicates", () => {
  const local = textMatches(source, [destination]);
  assert.equal(mergeSuggestions([], local).length, 1);
  assert.equal(mergeSuggestions(local, local).length, 1);
});

test("already linked pages cannot consume the download shortlist and missing robots is nonfatal", async () => {
  const old = Array.from(
    { length: 25 },
    (_, i) => `https://example.com/already-linked-${i}`,
  );
  const fetched: string[] = [];
  const read = async (url: string) => {
    fetched.push(url);
    if (url.endsWith("/robots.txt")) throw new Error("HTTP 404");
    if (url === source.url)
      return {
        url,
        body: `<article><h1>Keyword research</h1><p>${source.paragraphs[0]}</p><p>${old.map((link) => `<a href="${link}">Research guide</a>`).join(" ")} More existing links.</p></article>`,
      };
    if (url === destination.url)
      return {
        url,
        body: `<article><h1>${destination.title}</h1><p>${destination.paragraphs[0]}</p></article>`,
      };
    throw new Error("Should not download already linked pages");
  };
  const result = await collectPages(
    {
      sourceUrl: source.url,
      sourceText: "",
      sitemapUrl: "",
      destinationUrls: [...old, destination.url],
    },
    new AbortController().signal,
    read,
  );
  assert.equal(result.alreadyLinked, 25);
  assert.equal(result.destinations.length, 1);
  assert.ok(!old.some((url) => fetched.includes(url)));
  assert.equal(textMatches(result.source, result.destinations).length, 1);
  assert.ok(result.notes.some((note) => note.includes("no robots.txt")));
});

test("landing-page extraction supports text blocks and AI ignores unrelated passages", () => {
  const page = extractPage(
    "<main><h1>Keyword research</h1><section><div>Check search intent before choosing which keywords deserve a separate article.</div></section></main>",
    source.url,
  );
  assert.equal(textMatches(page, [destination]).length, 1);
  const unrelated = {
    ...destination,
    title: "Baking bread",
    url: "https://example.com/baking",
    paragraphs: ["Mixing flour and yeast in a kitchen."],
  };
  assert.equal(reviewDestinations(source, [unrelated]).length, 0);
  assert.equal(selectReviewPassages(source, [unrelated]).length, 0);
  assert.ok(
    selectReviewPassages(page, [destination]).reduce(
      (sum, item) => sum + item.passage.length,
      0,
    ) <= 8000,
  );
});

test("AI SEO remains a specific match while generic AI tools anchors are rejected", () => {
  const page: Page = {
    ...source,
    title: "Modern visibility",
    paragraphs: [
      "Learn AI SEO before choosing your content strategy for modern search engines.",
    ],
    links: [],
  };
  const target: Page = {
    ...destination,
    url: "https://example.com/ai-seo",
    title: "AI SEO",
    paragraphs: ["AI SEO helps content visibility in modern search engines."],
  };
  assert.equal(textMatches(page, [target])[0].anchor, "AI SEO");
  const generic = {
    ...page,
    paragraphs: [
      "Try AI tools before choosing your content strategy for modern search engines.",
    ],
  };
  const genericTarget = {
    ...target,
    url: "https://example.com/ai-tools",
    title: "AI tools",
  };
  assert.equal(textMatches(generic, [genericTarget]).length, 0);
});

test("a teaser article before the main article does not hide source passages", () => {
  const page = extractPage(
    "<main><article><p>A small promotional teaser with unrelated information.</p></article><article><h1>Keyword research</h1><p>Check search intent before choosing which keywords deserve a separate article.</p><p>A useful editorial plan also checks what readers expect from each destination page.</p></article></main>",
    source.url,
  );
  assert.equal(textMatches(page, [destination]).length, 1);
});
