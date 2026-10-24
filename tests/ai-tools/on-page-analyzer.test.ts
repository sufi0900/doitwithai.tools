import test from "node:test";
import assert from "node:assert/strict";
import {
  extractHtml,
  PageCollector,
  absoluteUrl,
} from "../../features/on-page-analyzer/server/extract";
import { fetchAuditPage } from "../../features/on-page-analyzer/server/fetch";
import {
  applyDraft,
  auditPage,
  changesCsv,
  phraseCount,
  summarize,
} from "../../features/on-page-analyzer/audit";
import { EXAMPLE_HTML } from "../../features/on-page-analyzer/example";
import { tools } from "../../features/tool-catalog/catalog";
import { SECTIONS } from "../../features/on-page-analyzer/types";
const example = () =>
  extractHtml(EXAMPLE_HTML, "https://example.com/content-planning");
const finding = (id: string, p = example()) =>
  auditPage(p).find((f) => f.id === id)!;

test("extracts actual title tags, structured content, and independent list items", () => {
  const p = example();
  assert.equal(p.title, "Content planning");
  assert.equal(p.blocks.filter((b) => b.tag === "li").length, 3);
  assert.equal(p.blocks.filter((b) => b.tag === "h1").length, 1);
  assert.ok(!p.blocks.some((b) => b.text === "Navigation"));
  assert.equal(p.schemas.valid, 1);
  assert.deepEqual(p.schemas.types, ["Article"]);
  assert.equal(p.images[0].alt, null);
  assert.equal(p.links[0].href, "https://example.com/writing-guide");
});
test("stream chunk boundaries and large script bundles do not corrupt metadata or retain scripts", () => {
  const html =
    '<html><head><title>Actual &amp; title</title><meta property="og:title" content="Different"><script>var x="' +
    "x".repeat(1300000) +
    '";</script></head><body><main><h1>Heading</h1><ul><li>One</li><li>Two</li></ul></main></body></html>';
  const collector = new PageCollector("https://example.com");
  for (let i = 0; i < html.length; i += 127)
    collector.write(html.slice(i, i + 127));
  const p = collector.finish();
  assert.equal(p.title, "Actual & title");
  assert.equal(p.blocks.length, 3);
  assert.ok(JSON.stringify(p).length < 5000);
  assert.equal(p.partial, false);
});
test("excludes hidden and raw content while preserving section boundaries", () => {
  const p = extractHtml(
    '<main><h1>Real</h1><div hidden><h2>Hidden</h2></div><p>Alpha <b>bold</b>.</p><blockquote><p>A quotation.</p></blockquote><style>h2{color:red}</style><script>"<h2>Fake</h2>"</script><ul><li>Item one</li><li>Item two</li></ul></main>',
  );
  assert.deepEqual(
    p.blocks.map((b) => b.text),
    ["Real", "Alpha bold.", "A quotation.", "Item one", "Item two"],
  );
});
test("recognizes malformed JSON-LD and multiple schema types without executing anything", () => {
  const p = extractHtml(
    '<script type="application/ld+json">{"@graph":[{"@type":["Article","WebPage"]},{"author":{"@type":"Person"}}]}</script><script type="application/ld+json">bad</script>',
  );
  assert.equal(p.schemas.valid, 1);
  assert.equal(p.schemas.invalid, 1);
  assert.deepEqual(p.schemas.types, ["Article", "WebPage", "Person"]);
  assert.equal(finding("schema-json", p).status, "warning");
});
test("scores noindex as critical but optional files and missing schema are not failures", () => {
  const p = example();
  p.source = "url";
  p.status = 200;
  p.robots = ["HTTP X-Robots-Tag: noindex, nofollow"];
  assert.equal(finding("indexing", p).status, "critical");
  const before = summarize(auditPage(p)).score;
  p.resources.llms = "found";
  assert.equal(summarize(auditPage(p)).score, before);
  p.schemas = { types: [], valid: 0, invalid: 0, samples: [] };
  assert.equal(finding("schema-json", p).status, "info");
});
test("partial extraction does not claim that unobserved body checks passed", () => {
  const p = example();
  p.partial = true;
  assert.equal(finding("content", p).status, "unchecked");
  assert.equal(finding("content-repeats", p).status, "unchecked");
  assert.ok(
    summarize(auditPage(p)).assessed < summarize(auditPage(example())).assessed,
  );
});
test("draft changes preserve originals and allow independent heading text, level, alt, and schema changes", () => {
  const p = example(),
    before = JSON.stringify(p),
    h = p.blocks.find((b) => b.tag === "h3")!;
  const changes = [
    {
      field: "title",
      before: p.title,
      after: "Plan a useful article with clear examples",
    },
    { field: h.id, before: h.text, after: "Prepare your article sections" },
    { field: `level:${h.id}`, before: "h3", after: "h2" },
    { field: "image:0", before: "", after: "Article planning checklist" },
    {
      field: "schema:1",
      before: "",
      after: '{"@context":"https://schema.org","@type":"WebPage"}',
    },
  ];
  const draft = applyDraft(p, changes);
  assert.equal(JSON.stringify(p), before);
  assert.equal(draft.blocks.find((b) => b.id === h.id)?.tag, "h2");
  assert.equal(draft.images[0].alt, "Article planning checklist");
  assert.equal(draft.schemas.samples.length, 2);
  assert.equal(finding("heading-order", draft).status, "passed");
  assert.equal(finding("alt", draft).status, "passed");
  assert.equal(applyDraft(p, []).title, p.title);
});
test("keyword counts respect boundaries and reports protect spreadsheet formula cells", () => {
  assert.equal(phraseCount("art cart art. ART", "art"), 3);
  assert.equal(phraseCount("Plan your content", "!!!"), 0);
  const csv = changesCsv([
    { field: "title", before: '=HYPERLINK("bad")', after: "+unsafe" },
  ]);
  assert.ok(csv.includes('"\'=HYPERLINK(""bad"")"'));
  assert.ok(csv.includes('"\'+unsafe"'));
});
test("all report actions and the featured tool point to registered pages", () => {
  for (const f of auditPage(example())) {
    assert.ok(
      tools.some((t) => t.slug === f.tool),
      f.tool,
    );
    assert.ok(SECTIONS.some((s) => s.id === f.section));
  }
  assert.equal(tools[0].slug, "on-page-ai-seo-analyzer");
  assert.equal(tools[0].featuredOrder, 0);
});
test("rejects unsafe protocols, credentials, and unresolved relative assets", () => {
  assert.equal(absoluteUrl("javascript:alert(1)", "https://example.com"), "");
  assert.equal(
    absoluteUrl("https://u:p@example.com", "https://example.com"),
    "",
  );
  assert.equal(absoluteUrl("/page", ""), "");
});
test("revalidates redirects and retains a report when optional files fail", async () => {
  const visited: string[] = [];
  const p = await fetchAuditPage("https://example.com/start", {
    safeUrl: async (raw) => {
      visited.push(raw);
      return new URL(raw);
    },
    fetcher: (async (url) => {
      if (String(url).endsWith("/start"))
        return new Response(null, {
          status: 302,
          headers: { location: "/article" },
        });
      if (String(url).endsWith("/article"))
        return new Response(EXAMPLE_HTML, {
          headers: { "content-type": "text/html", "x-robots-tag": "noindex" },
        });
      throw new Error("Optional resource unavailable");
    }) as typeof fetch,
  });
  assert.equal(p.url, "https://example.com/article");
  assert.equal(p.redirects, 1);
  assert.ok(visited.includes("https://example.com/article"));
  assert.equal(p.resources.robots, "unknown");
  assert.equal(finding("indexing", p).status, "critical");
});
test("large HTML produces explicit partial evidence rather than a download-limit error", async () => {
  const source =
    "<head><title>Large article</title></head><main><h1>Large</h1><p>Readable text.</p></main><script>" +
    "x".repeat(8100000) +
    "</script>";
  const p = await fetchAuditPage("https://example.com", {
    safeUrl: async (s) => new URL(s),
    fetcher: (async (url) =>
      String(url).includes(".txt")
        ? new Response(null, { status: 404 })
        : new Response(source, {
            headers: {
              "content-type": "text/html",
              "content-length": String(source.length),
            },
          })) as typeof fetch,
  });
  assert.equal(p.title, "Large article");
  assert.equal(p.partial, true);
  assert.equal(p.bytesRead, 8000000);
  assert.ok(p.warnings.length > 0);
  assert.equal(p.resources.llms, "missing");
});
test("unavailable pages cannot produce successful audit findings", async () => {
  await assert.rejects(
    () =>
      fetchAuditPage("https://example.com", {
        safeUrl: async (s) => new URL(s),
        fetcher: (async () =>
          new Response(null, { status: 403 })) as typeof fetch,
      }),
    /HTTP 403/,
  );
});

test("a crawler-specific directive is not reported as a Google indexing blocker", () => {
  const p = example();
  p.source = "url";
  p.status = 200;
  p.robots = ["HTTP X-Robots-Tag: bingbot: noindex, nofollow"];
  assert.equal(finding("indexing", p).status, "passed");
  p.robots = ["HTTP X-Robots-Tag: bingbot: noindex, googlebot: noindex"];
  assert.equal(finding("indexing", p).status, "critical");
});
test("editorial reviews retain only quotations matched to real block evidence", async () => {
  const { validateReview } =
    await import("../../features/on-page-analyzer/review");
  const { sampleReviewBlocks } =
    await import("../../features/on-page-analyzer/audit");
  const blocks = [
    {
      id: "block:0",
      tag: "p",
      text: "This is a real and useful source passage with some evidence.",
    },
  ];
  const insight = {
    blockId: "block:0",
    quote: "real and useful source passage",
    topic: "clarity",
    observation: "This wording may need a clearer example.",
    action: "Add a relevant example if useful to the intended reader.",
  };
  const review = validateReview(
    {
      summary: "Only the supplied source sample was reviewed.",
      insights: [
        insight,
        { ...insight, blockId: "block:99" },
        { ...insight, quote: "This quote was fabricated", topic: "evidence" },
      ],
    },
    blocks,
  );
  assert.equal(review.insights.length, 1);
  const long = Array.from({ length: 100 }, (_, i) => ({
    id: `block:${i}`,
    tag: i % 10 === 0 ? "h2" : "p",
    text: `This is passage ${i} `.repeat(100),
  }));
  const sampled = sampleReviewBlocks(long);
  assert.equal(sampled.length, 30);
  assert.equal(new Set(sampled.map((b) => b.id)).size, 30);
  assert.ok(sampled.some((b) => b.id === "block:99"));
  assert.ok(sampled.every((b) => b.text.length <= 1000));
});
