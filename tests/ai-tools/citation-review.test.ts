import test from "node:test";
import assert from "node:assert/strict";
import {
  citationReview,
  googleRestrictions,
  readinessCsv,
} from "../../features/citation-readiness/review";
import {
  draftBlocks,
  draftHtml,
  draftPage,
  MAX_DRAFT,
} from "../../features/citation-readiness/draft-html";
import { extractFromText } from "../../features/citation-readiness/extract-from-text";
import { extractHtml } from "../../features/on-page-analyzer/server/extract";
import {
  citationDocument,
  importCitationPage,
} from "../../features/citation-readiness/client";
const page = () => {
  const p = extractHtml(
    "<main><h1>Internal linking</h1><p>Internal linking connects pages. It helps readers navigate a website.</p><h2>Choose anchor text</h2><p>Choose text that describes the destination.</p></main>",
    "https://example.com/article",
  );
  p.source = "url";
  p.status = 200;
  p.resources = {
    robots: "found",
    robotsText: "User-agent: *\nAllow: /",
    llms: "unknown",
  };
  return p;
};
const row = (p: ReturnType<typeof page>, id: string) =>
  citationReview(p).rows.find((r) => r.id === id)!;
test("Google exclusions respect scope, case, restrictive combinations, and snippet limits", () => {
  assert.deepEqual(
    googleRestrictions(["HTTP X-Robots-Tag: otherbot: noindex, nosnippet"]),
    { noindex: false, nosnippet: false, maxSnippet: null },
  );
  assert.equal(googleRestrictions(["googlebot: INDEX, NOINDEX"]).noindex, true);
  assert.equal(
    googleRestrictions([
      "HTTP X-Robots-Tag: googlebot: none, otherbot: nosnippet",
    ]).noindex,
    true,
  );
  assert.equal(
    googleRestrictions([
      "robots: max-snippet: -1",
      "googlebot: max-snippet: 60",
      "robots: max-snippet: 20",
    ]).maxSnippet,
    20,
  );
  assert.equal(googleRestrictions(["robots: max-snippet: 0"]).nosnippet, true);
  assert.equal(
    googleRestrictions(["robots: noindexing, notnosnippet"]).noindex,
    false,
  );
});
test("drafts preserve soft-wrapped paragraphs, headings, independent lists, and total word counts", () => {
  const text =
    "# Topic\n\nA complete first sentence.\nA second sentence in the same paragraph.\n\n- Short item\n- Another item\n\n## Details\n\nMore context.";
  const blocks = draftBlocks(text);
  assert.equal(
    blocks[1].text,
    "A complete first sentence. A second sentence in the same paragraph.",
  );
  assert.deepEqual(
    blocks.map((b) => b.tag),
    ["h1", "p", "li", "li", "h2", "p"],
  );
  assert.equal(
    extractFromText(text).wordCount,
    blocks.reduce((n, b) => n + b.text.split(/\s+/).length, 0),
  );
  assert.equal(extractFromText(text).paragraphs.length, 2);
  assert.deepEqual(
    extractHtml(draftHtml(text)).blocks.map((b) => b.text),
    blocks.map((b) => b.text),
  );
});
test("draft content is bounded, safely escaped, and marked partial at the block limit", () => {
  assert.throws(() => draftPage("x".repeat(MAX_DRAFT + 1)), /150,000/);
  assert.equal(
    draftPage(Array.from({ length: 1201 }, () => "- Item").join("\n")).partial,
    true,
  );
  assert.equal(
    draftPage(Array.from({ length: 1201 }, () => "- Item").join("\n")).blocks
      .length,
    1200,
  );
  assert.ok(!draftHtml("<script>alert(1)</script>").includes("<script>"));
});
test("draft and pasted HTML access evidence stays unknown even when a URL is supplied", () => {
  const draft = draftPage("# Topic\n\nA useful opening.");
  assert.equal(row(draft, "response").state, "unknown");
  assert.equal(row(draft, "indexing").state, "unknown");
  assert.equal(row(draft, "snippets").state, "unknown");
  assert.equal(row(draft, "attribution").state, "unknown");
  const pasted = extractHtml(
    "<main><p>Content.</p></main>",
    "https://example.com",
  );
  assert.equal(row(pasted, "response").state, "unknown");
  assert.equal(row(pasted, "crawler-Googlebot").state, "unknown");
});
test("partial HTML never certifies absent exclusions while detected restrictions remain visible", () => {
  const p = page();
  p.partial = true;
  assert.equal(row(p, "scope").state, "unknown");
  const headings = p.blocks;
  p.blocks = [];
  assert.equal(row(p, "structure").state, "unknown");
  p.blocks = headings;
  assert.equal(row(p, "indexing").state, "unknown");
  assert.equal(row(p, "snippets").state, "unknown");
  p.robots = ["robots: noindex, nosnippet"];
  assert.equal(row(p, "indexing").state, "restriction");
  assert.equal(row(p, "snippets").state, "restriction");
});
test("search crawler restrictions remain separate from training choices and unavailable policies", () => {
  const p = page();
  const before = citationReview(p);
  p.resources.robotsText += "\nUser-agent: GPTBot\nDisallow: /";
  assert.deepEqual(citationReview(p), before);
  p.resources.robotsText += "\nUser-agent: OAI-SearchBot\nDisallow: /article";
  assert.equal(row(p, "crawler-OAI-SearchBot").state, "restriction");
  p.resources.robotsPartial = true;
  assert.equal(row(p, "crawler-OAI-SearchBot").state, "unknown");
});
test("opening exports retain whole paragraphs, context, scope, and no invented score", () => {
  const p = page();
  p.blocks[1].text =
    "We have seen a huge change in information discovery. A second sentence adds no topic explanation.";
  const report = citationReview(p);
  assert.equal(report.openings[0].paragraph, p.blocks[1].text);
  assert.equal(row(p, "openings").state, "review");
  assert.ok(!Object.hasOwn(report, "score"));
  assert.match(readinessCsv(report), /A second sentence/);
  assert.match(readinessCsv(report), /No factual verification/);
});
test("CSV neutralizes formula prefixes and escapes imported quotation marks", () => {
  const p = page();
  p.blocks[0].text = '=SUM(1,2) "quoted"';
  p.blocks[1].text = "@dangerous";
  const csv = readinessCsv(citationReview(p));
  assert.match(csv, /"'=SUM\(1,2\) ""quoted"""/);
  assert.match(csv, /"'@dangerous"/);
});
test("malformed links cannot crash document normalization and missing origins stay unknown", () => {
  const p = page();
  p.links = [
    { href: "broken", text: "Link", rel: "" },
    { href: "mailto:test@example.com", text: "Email", rel: "" },
    { href: "https://source.example/report", text: "Report", rel: "" },
  ];
  assert.deepEqual(citationDocument(p).outboundLinkDomains, ["source.example"]);
  p.url = "";
  assert.equal(citationDocument(p).outboundLinkDomains, null);
});
test("imports preserve cancellation signals and shared importer error details", async () => {
  const original = globalThis.fetch;
  const controller = new AbortController();
  try {
    globalThis.fetch = async (url, options) => {
      assert.equal(url, "/api/ai-tools/on-page/analyze");
      assert.equal(options?.signal, controller.signal);
      assert.equal(
        options?.body,
        JSON.stringify({ url: "https://example.com" }),
      );
      return new Response(
        JSON.stringify({
          error: { message: "Import limit reached. Try again later." },
        }),
        { status: 429 },
      );
    };
    const result = await importCitationPage(
      { url: "https://example.com" },
      controller.signal,
    );
    assert.equal(result.ok, false);
    if (result.ok === false)
      assert.match(result.message, /Import limit reached/);
  } finally {
    globalThis.fetch = original;
  }
});

test("every action target resolves to an existing registered tool", async () => {
  const { readFile } = await import("node:fs/promises");
  const registry = JSON.parse(
    await readFile(
      new URL("../../features/tool-catalog/registry.json", import.meta.url),
      "utf8",
    ),
  );
  const slugs = new Set(
    registry.tools.map((tool: { slug: string }) => tool.slug),
  );
  for (const item of citationReview(page()).rows)
    assert.ok(slugs.has(item.tool), item.tool);
});
