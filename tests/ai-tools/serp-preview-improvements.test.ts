import test from "node:test";
import assert from "node:assert/strict";
import {
  SerpMetadataCollector,
  collectedSerpData,
  fetchPageSerpData,
  safeAssetUrl,
} from "../../features/serp-preview/server/fetch-page-data";
import {
  textLayout,
  highlightParts,
  metadataHtml,
  safeWebUrl,
} from "../../features/serp-preview/preview";
import {
  extractRichResultBlocks,
  validateSnippet,
} from "../../features/serp-preview/generator";
const head =
  '<html><head><title>AI &amp; SEO guide</title><meta name="description" content="A useful guide"><meta property="og:site_name" content="Creator Hub"><link rel="icon" href="/icon.png"></head><body>';
function collect(html: string, size = 13) {
  const collector = new SerpMetadataCollector();
  for (let start = 0; start < html.length; start += size)
    collector.write(html.slice(start, start + size));
  collector.finish();
  return collectedSerpData(
    collector,
    "https://example.com/article",
    false,
    html.length,
  );
}
const safeUrl = async (url: string) => new URL(url);
const response = (html: string) =>
  new Response(html, { headers: { "content-type": "text/html" } });

test("streamed metadata handles tag boundaries, entities, body schema, and favicon", () => {
  const result = collect(
    head +
      '<article>Long article</article><script type="application/ld+json">{"@type":"Article","headline":"Guide"}</script></body></html>',
    1,
  );
  assert.equal(result.title, "AI & SEO guide");
  assert.equal(result.description, "A useful guide");
  assert.equal(result.siteName, "Creator Hub");
  assert.equal(result.faviconUrl, "https://example.com/icon.png");
  assert.equal(result.jsonLd.length, 1);
});
test("collector ignores comments, ordinary scripts, styles, and fake head closing tags", () => {
  const html =
    '<head><script>const marker="</head>";</script><!-- <script type="application/ld+json">{"fake":1}</script> --><style>.test{content:"<script>"}</style><title>Real title</title></head><body><script data-type="application/ld+json">{"fake":2}</script>';
  const result = collect(html, 7);
  assert.equal(result.title, "Real title");
  assert.equal(result.jsonLd.length, 0);
});
test("bad JSON and oversized markup preserve metadata with explicit warnings", () => {
  const result = collect(
    head +
      '<script type="application/ld+json">bad</script><script type="application/ld+json">' +
      JSON.stringify({ large: "x".repeat(301000) }) +
      "</script>",
    4096,
  );
  assert.equal(result.title, "AI & SEO guide");
  assert.equal(result.jsonLd.length, 0);
  assert.ok(result.warnings.length >= 2);
});
test("large declared response sizes no longer reject useful metadata", async () => {
  const result = await fetchPageSerpData("https://example.com", true, {
    safeUrl,
    fetcher: async () =>
      new Response(head, {
        headers: { "content-type": "text/html", "content-length": "64000000" },
      }),
  });
  assert.equal(result.title, "AI & SEO guide");
});
test("body JSON-LD after a long article is detected without retaining article text", async () => {
  const result = await fetchPageSerpData("https://example.com", true, {
    safeUrl,
    fetcher: async () =>
      response(
        head +
          "<p>" +
          "article ".repeat(220000) +
          '</p><script type="application/ld+json">{"@type":"Product","name":"Useful product"}</script>',
      ),
  });
  assert.equal(result.jsonLd.length, 1);
  assert.equal(result.partial, false);
  assert.equal(result.title, "AI & SEO guide");
});
test("quick import cancels the stream after the head", async () => {
  let cancelled = false;
  let index = 0;
  const chunks = [head, "x".repeat(2000000)];
  const result = await fetchPageSerpData("https://example.com", false, {
    safeUrl,
    fetcher: async () =>
      new Response(
        new ReadableStream({
          pull(controller) {
            if (index < chunks.length)
              controller.enqueue(new TextEncoder().encode(chunks[index++]));
            else controller.close();
          },
          cancel() {
            cancelled = true;
          },
        }),
        { headers: { "content-type": "text/html" } },
      ),
  });
  assert.equal(cancelled, true);
  assert.equal(result.bytesRead, head.length);
  assert.match(result.warnings.join(" "), /head only/);
});
test("bounded full scans return partial metadata instead of a long-page failure", async () => {
  const result = await fetchPageSerpData("https://example.com", true, {
    safeUrl,
    fetcher: async () => response(head + "x".repeat(8100000)),
  });
  assert.equal(result.title, "AI & SEO guide");
  assert.equal(result.bytesRead, 8000000);
  assert.equal(result.partial, true);
  assert.match(result.warnings.join(" "), /8 MB/);
});
test("redirects are validated before fetching the destination", async () => {
  let calls = 0;
  await assert.rejects(
    fetchPageSerpData("https://example.com", true, {
      safeUrl: async (url) => {
        if (url.includes("127.0.0.1"))
          throw new Error("Private network blocked");
        return new URL(url);
      },
      fetcher: async () => {
        calls++;
        return new Response(null, {
          status: 302,
          headers: { location: "http://127.0.0.1" },
        });
      },
    }),
    /Private network/,
  );
  assert.equal(calls, 1);
});
test("favicon metadata cannot introduce non-web schemes or cross-origin image requests", () => {
  assert.equal(safeAssetUrl("javascript:alert(1)", "https://example.com"), "");
  assert.equal(
    safeAssetUrl("http://127.0.0.1/icon", "https://example.com"),
    "",
  );
  assert.equal(safeWebUrl("data:text/html,bad"), "");
});
test("invalid content types and access errors produce actionable messages", async () => {
  await assert.rejects(
    fetchPageSerpData("https://example.com", true, {
      safeUrl,
      fetcher: async () => new Response("blocked", { status: 403 }),
    }),
    /HTTP 403/,
  );
  await assert.rejects(
    fetchPageSerpData("https://example.com", true, {
      safeUrl,
      fetcher: async () =>
        new Response("pdf", { headers: { "content-type": "application/pdf" } }),
    }),
    /HTML webpage/,
  );
});
test("pixel wrapping distinguishes wide and narrow letters with equal character counts", () => {
  const measure = (text: string) =>
    Array.from(text).reduce(
      (sum, char) => sum + (char === "W" ? 20 : char === "i" ? 3 : 5),
      0,
    );
  assert.equal(textLayout("WWWWWW", 60, 1, measure).truncated, true);
  assert.equal(textLayout("iiiiii", 60, 1, measure).truncated, false);
  assert.equal(textLayout("one two three", 40, 2, measure).lines.length, 2);
  assert.ok(textLayout("WWWWWW", 60, 1, measure).lines[0].endsWith("…"));
});
test("query highlighting escapes regex syntax and leaves markup as plain text", () => {
  const parts = highlightParts("A C++ guide with <script> text", "C++");
  assert.equal(parts.find((p) => p.bold)?.text, "C++");
  assert.equal(
    parts.map((p) => p.text).join(""),
    "A C++ guide with <script> text",
  );
});
test("metadata HTML escapes attributes and prevents script-closing injection", () => {
  const html = metadataHtml(
    "</title><script>bad()</script>",
    '" onload="bad',
    "Brand",
    JSON.stringify({ text: "</script><script>bad()</script>" }),
  );
  assert.ok(html.includes("&lt;/title&gt;"));
  assert.ok(html.includes("&quot;"));
  assert.ok(!html.includes("</script><script>"));
  assert.ok(html.includes("\\u003c"));
});
test("character counts alone do not produce snippet length warnings", () => {
  const result = validateSnippet({
    title: "i".repeat(100),
    description: "description ".repeat(25),
    url: "https://example.com",
  });
  assert.equal(result.length, 0);
});
test("nested markup, multiple items, referenced authors, and zero prices stay distinct", () => {
  const blocks = extractRichResultBlocks([
    {
      "@graph": [
        { "@id": "#author", "@type": "Person", name: "Real Author" },
        {
          "@type": "WebPage",
          mainEntity: {
            "@type": "Article",
            headline: "Real headline",
            author: { "@id": "#author" },
          },
        },
        {
          "@type": "Product",
          name: "Free product",
          offers: { price: 0, priceCurrency: "USD" },
        },
        {
          "@type": "Product",
          name: "Paid product",
          offers: { price: 10, priceCurrency: "USD" },
        },
        {
          "@type": "Review",
          itemReviewed: { name: "Tool" },
          reviewRating: { ratingValue: 4.2 },
        },
      ],
    },
  ]);
  assert.equal(blocks.filter((b) => b.type === "Product").length, 2);
  const article = blocks.find((b) => b.type === "Article");
  assert.ok(article?.type === "Article");
  assert.equal(article.data.author, "Real Author");
  const free = blocks.find(
    (b) => b.type === "Product" && b.data.name === "Free product",
  );
  assert.ok(free?.type === "Product");
  assert.equal(free.data.price, "0");
  assert.ok(
    blocks.some((b) => b.type === "Review" && b.data.ratingValue === 4.2),
  );
});
test("endpoint validates URLs before spending import quota", async () => {
  const { NextRequest } = await import("next/server");
  const { POST } =
    await import("../../app/api/ai-tools/serp-preview/import/route");
  const result = await POST(
    new NextRequest("https://example.com/api", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ pageUrl: "file:///etc/passwd" }),
    }),
  );
  assert.equal(result.status, 422);
});

test("import quota allows fifteen successful checks and refunds repeated failures", async () => {
  const { NextRequest } = await import("next/server");
  const { checkAiToolRateLimit } =
    await import("../../lib/ai-tools/rate-limit");
  const request = new NextRequest("https://example.com/api", {
    headers: { "x-forwarded-for": "203.0.113.77" },
  });
  const options = { dailyLimit: 100, burstLimit: 20, refundFailures: true };
  const tool = "serp-import-quota-contract";
  for (let i = 0; i < 15; i++)
    assert.equal(
      (await checkAiToolRateLimit(request, tool, options)).allowed,
      true,
    );
  for (let i = 0; i < 30; i++) {
    const attempt = await checkAiToolRateLimit(request, tool, options);
    assert.equal(attempt.allowed, true);
    await attempt.release?.();
  }
  for (let i = 0; i < 5; i++)
    assert.equal(
      (await checkAiToolRateLimit(request, tool, options)).allowed,
      true,
    );
  const blocked = await checkAiToolRateLimit(request, tool, options);
  assert.equal(blocked.allowed, false);
  assert.ok(blocked.retryAfterSeconds > 0);
});
