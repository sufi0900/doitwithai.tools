import test from "node:test";
import assert from "node:assert/strict";
import {
  analyzeHeadings,
  extractFromMarkdown,
  buildCsv,
} from "../../features/heading-analyzer/headingLib";
import {
  keywordMatches,
  structureScore,
  suggestedLevel,
} from "../../features/heading-analyzer/report";
import {
  extractPageHeadings,
  fetchPageHeadings,
} from "../../features/heading-analyzer/server/fetch-headings";
import { assertSafeFetchUrl } from "../../features/schema-generator/server/fetch-page";

const report = (source: string, keyword = "") =>
  analyzeHeadings(extractFromMarkdown(source).headings, keyword);

test("structure score rewards logical nesting and allows closing subsections", () => {
  const analysis = report(
    "# Main topic\n## First section\n### Detail\n#### Further detail\n## Second section",
  );
  assert.equal(structureScore(analysis).score, 100);
  assert.equal(analysis.issues.filter((i) => i.code === "skipped").length, 0);
});
test("score deductions are explicit and independent of keyword placement", () => {
  const analysis = report(
    "# Topic\n#### Details\n## Details",
    "missing phrase",
  );
  const rating = structureScore(analysis);
  assert.equal(rating.score, 65);
  assert.equal(
    rating.checks.reduce((sum, c) => sum + c.points, 0),
    100,
  );
  assert.equal(
    structureScore(report("# Topic\n#### Details\n## Details")).score,
    rating.score,
  );
});
test("no visible headings do not earn a misleading perfect score", () => {
  assert.equal(structureScore(analyzeHeadings([], "")).score, 0);
  const headings = extractPageHeadings(
    "<main hidden><h1>Topic</h1></main>",
    true,
  ).headings;
  assert.equal(structureScore(analyzeHeadings(headings, "")).score, 0);
});
test("keyword matching respects word boundaries and normalizes punctuation", () => {
  assert.equal(keywordMatches("Cartography", "art"), false);
  assert.equal(
    keywordMatches("Content-marketing basics", "content marketing"),
    true,
  );
  assert.equal(keywordMatches("SEO basics", "seo"), true);
  assert.equal(keywordMatches("Nothing", "!!!"), false);
  assert.equal(
    report("# Cartography\n## Art lessons", "art").keyword?.matching,
    1,
  );
  assert.equal(
    report("# Content-marketing basics", "content-marketing").keyword?.inH1,
    true,
  );
});
test("suggested levels use preceding visible headings without changing the source", () => {
  const headings = extractPageHeadings(
    "<h2>Intro</h2><h3 hidden>Hidden</h3><h5>Details</h5>",
    false,
  ).headings;
  assert.equal(suggestedLevel(headings[0], headings), 1);
  assert.equal(suggestedLevel(headings[1], headings), null);
  assert.equal(suggestedLevel(headings[2], headings), 3);
  assert.equal(headings[2].level, 5);
});
test("main scope excludes nested navigation, footer, and aside headings", () => {
  const html =
    "<title>Page &amp; title</title><nav><h2>Menu</h2></nav><main><h1>Topic</h1><aside><h2>Related</h2></aside><h2>Body</h2><footer><h3>Contact</h3></footer></main>";
  const main = extractPageHeadings(html, true);
  assert.equal(main.title, "Page & title");
  assert.deepEqual(
    main.headings.map((h) => h.text),
    ["Topic", "Body"],
  );
  assert.equal(extractPageHeadings(html, false).headings.length, 5);
});
test("article and whole-page fallback scopes stay explicit", () => {
  assert.match(
    extractPageHeadings("<article><h1>Topic</h1></article>", true).scope,
    /article/,
  );
  const fallback = extractPageHeadings("<div><h1>Topic</h1></div>", true);
  assert.match(fallback.scope, /whole page/);
  assert.equal(fallback.headings.length, 1);
});
test("HTML extraction handles ARIA headings, alt text, hidden ancestors, and script content", () => {
  const result = extractPageHeadings(
    '<main><h1>Title<script>fake</script></h1><div role="heading" aria-level="3">Section</div><div role="heading" aria-level="3x">Default</div><h2><img alt="Image heading"></h2><div aria-hidden="true"><h2>Hidden</h2></div><h2 style="display: none !important">Also hidden</h2><template><h2>Template</h2></template></main>',
    true,
  );
  assert.deepEqual(
    result.headings.map((h) => [h.level, h.text, h.hidden]),
    [
      [1, "Title", false],
      [3, "Section", false],
      [2, "Default", false],
      [2, "Image heading", false],
      [2, "Hidden", true],
      [2, "Also hidden", true],
    ],
  );
});
test("excessive heading counts fail explicitly instead of silently truncating", () => {
  assert.throws(
    () => extractPageHeadings("<h2>Section</h2>".repeat(1001), true),
    /1,000 headings/,
  );
});
test("CSV report protects formula-like heading text", () => {
  assert.match(buildCsv(report("# =SUM(A1:A2)")), /'=SUM/);
});

const safeUrl = async (url: string) => new URL(url);
const htmlResponse = (html: string) =>
  new Response(html, { headers: { "content-type": "text/html" } });
test("URL fetch follows relative redirects and validates every destination", async () => {
  const checked: string[] = [];
  const fetched: string[] = [];
  const result = await fetchPageHeadings(
    "https://example.com/start#part",
    true,
    {
      safeUrl: async (url) => {
        checked.push(url);
        return new URL(url);
      },
      fetcher: async (url, options) => {
        fetched.push(String(url));
        assert.equal(options?.redirect, "manual");
        return fetched.length === 1
          ? new Response(null, {
              status: 302,
              headers: { location: "/article" },
            })
          : htmlResponse(
              "<title>Published article</title><main><h1>Topic</h1><h2>Section</h2></main>",
            );
      },
    },
  );
  assert.deepEqual(checked, [
    "https://example.com/start#part",
    "https://example.com/article",
  ]);
  assert.equal(fetched[0], "https://example.com/start");
  assert.equal(result.finalUrl, "https://example.com/article");
  assert.equal(result.headings.length, 2);
  assert.ok(Date.parse(result.checkedAt));
});
test("redirect validation blocks a private destination before fetching it", async () => {
  let calls = 0;
  await assert.rejects(
    fetchPageHeadings("https://example.com", true, {
      safeUrl: async (url) => {
        if (url.includes("127.0.0.1"))
          throw new Error("Private target blocked");
        return new URL(url);
      },
      fetcher: async () => {
        calls++;
        return new Response(null, {
          status: 302,
          headers: { location: "http://127.0.0.1/secret" },
        });
      },
    }),
    /Private target/,
  );
  assert.equal(calls, 1);
});
test("URL fetch bounds redirects", async () => {
  let calls = 0;
  await assert.rejects(
    fetchPageHeadings("https://example.com", true, {
      safeUrl,
      fetcher: async () => {
        calls++;
        return new Response(null, {
          status: 302,
          headers: { location: "/again" },
        });
      },
    }),
    /redirect/,
  );
  assert.equal(calls, 4);
});
test("HTTP access failures give an actionable paste fallback", async () => {
  await assert.rejects(
    fetchPageHeadings("https://example.com", true, {
      safeUrl,
      fetcher: async () => new Response("blocked", { status: 403 }),
    }),
    /HTTP 403.*Paste content/,
  );
});
test("non-HTML responses are rejected", async () => {
  await assert.rejects(
    fetchPageHeadings("https://example.com/image", true, {
      safeUrl,
      fetcher: async () =>
        new Response("image", { headers: { "content-type": "image/png" } }),
    }),
    /webpage URL/,
  );
});
test("declared and streamed download sizes are bounded", async () => {
  await assert.rejects(
    fetchPageHeadings("https://example.com", true, {
      safeUrl,
      fetcher: async () =>
        new Response("small", {
          headers: { "content-type": "text/html", "content-length": "3000001" },
        }),
    }),
    /3 MB/,
  );
  await assert.rejects(
    fetchPageHeadings("https://example.com", true, {
      safeUrl,
      fetcher: async () => htmlResponse("x".repeat(3_000_001)),
    }),
    /3 MB/,
  );
});
test("client-rendered shell returns an honest empty extraction, never invented headings", async () => {
  const result = await fetchPageHeadings("https://example.com", true, {
    safeUrl,
    fetcher: async () =>
      htmlResponse(
        '<title>App</title><div id="root"></div><script>document.write("<h1>Late title</h1>")</script>',
      ),
  });
  assert.equal(result.headings.length, 0);
});
test("private, credentialed, and non-web targets are rejected before any request", async () => {
  for (const url of [
    "http://127.0.0.1",
    "http://localhost",
    "https://user:pass@example.com",
    "file:///etc/passwd",
    "https://example.com:8443",
  ]) {
    await assert.rejects(assertSafeFetchUrl(url));
  }
});

test("heading text is preserved within limits and excessive text fails explicitly", () => {
  const text = "Topic ".repeat(400);
  assert.equal(
    extractPageHeadings(`<h1>${text}</h1>`, true).headings[0].text,
    text.trim(),
  );
  assert.throws(
    () => extractPageHeadings(`<h1>${"x".repeat(200_001)}</h1>`, true),
    /unusually large/,
  );
  assert.throws(
    () => extractFromMarkdown(`# ${"x".repeat(200_001)}`),
    /smaller article section/,
  );
});

test("URL endpoint rejects malformed inputs before fetching pages", async () => {
  const { NextRequest } = await import("next/server");
  const { POST } =
    await import("../../app/api/ai-tools/heading-analyzer/route");
  for (const pageUrl of ["not a url", "file:///etc/passwd"]) {
    const response = await POST(
      new NextRequest(
        "https://doitwithai.tools/api/ai-tools/heading-analyzer",
        {
          method: "POST",
          body: JSON.stringify({ pageUrl }),
          headers: { "content-type": "application/json" },
        },
      ),
    );
    assert.equal(response.status, 422);
    assert.match((await response.json()).error.message, /valid public/);
  }
});

test("URL endpoint bounds request bodies", async () => {
  const { NextRequest } = await import("next/server");
  const { POST } =
    await import("../../app/api/ai-tools/heading-analyzer/route");
  const response = await POST(
    new NextRequest("https://doitwithai.tools/api/ai-tools/heading-analyzer", {
      method: "POST",
      body: JSON.stringify({
        pageUrl: "https://example.com/",
        excess: "x".repeat(6000),
      }),
      headers: { "content-type": "application/json" },
    }),
  );
  assert.equal(response.status, 413);
});
