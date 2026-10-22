import test from "node:test";
import assert from "node:assert/strict";
import {
  inspectSchemas,
  schemaSources,
  authorsFromSchemas,
} from "../../features/schema-inspector/inspect";
import { extractHtml } from "../../features/on-page-analyzer/server/extract";
import { applyDraft, auditPage } from "../../features/on-page-analyzer/audit";
import { answerReadiness } from "../../features/on-page-analyzer/readiness";
import { draftHtml } from "../../features/citation-readiness/draft-html";
const source = (value: unknown) => [
  { field: "schema:0", label: "JSON-LD source 1", raw: JSON.stringify(value) },
];
const graph = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": ["Article", "TechArticle"],
      "@id": "#article",
      headline: "Useful article",
      author: { "@id": "#author" },
      image: "https://example.com/a.jpg",
      datePublished: "2026-10-22",
      dateModified: "2026-10-22",
    },
    {
      "@type": "Person",
      "@id": "#author",
      name: "Actual Author",
      url: "https://example.com/author",
    },
    {
      "@type": "ItemList",
      itemListElement: [
        { "@type": "ListItem", position: 1, item: "https://example.com/one" },
      ],
    },
  ],
};

test("graphs show instances, distinct types, and nested objects independently", () => {
  const r = inspectSchemas(source(graph));
  assert.equal(r.items.length, 4);
  assert.equal(r.types.length, 5);
  assert.equal(r.items[0].types.join(" / "), "Article / TechArticle");
  assert.equal(r.items.filter((i) => i.nested).length, 1);
  assert.equal(r.errors, 0);
  assert.ok(!r.items[0].issues.some((i) => i.path.endsWith("author")));
});
test("separate definitions of the same type remain separate detected items", () => {
  const r = inspectSchemas(
    source({
      "@context": "https://schema.org",
      "@graph": [
        { "@type": "Article", headline: "First" },
        { "@type": "Article", headline: "Second" },
      ],
    }),
  );
  assert.equal(r.items.length, 2);
  assert.deepEqual(r.types, ["Article"]);
});
test("invalid calendar dates and reversed timelines produce precise property findings", () => {
  const r = inspectSchemas(
    source({
      "@context": "https://schema.org",
      "@type": "Article",
      datePublished: "2026-02-30",
      dateModified: "2026-01-01",
    }),
  );
  assert.ok(
    r.items[0].issues.some(
      (i) => i.severity === "error" && i.path === "$.datePublished",
    ),
  );
  assert.ok(r.items[0].issues.some((i) => i.path === "$.dateModified"));
});
test("article profile omissions are recommendations, never invented Google-required errors", () => {
  const r = inspectSchemas(
    source({
      "@context": "https://schema.org",
      "@type": "Article",
      headline: "A useful headline",
    }),
  );
  assert.equal(r.errors, 0);
  assert.ok(r.warnings > 0);
  assert.ok(r.items[0].issues.every((i) => i.severity !== "error"));
});
test("unknown types remain visible without false full-validation claims", () => {
  const r = inspectSchemas(
    source({
      "@context": "https://schema.org",
      "@type": "Volcano",
      name: "A volcano",
    }),
  );
  assert.equal(r.items.length, 1);
  assert.equal(r.items[0].covered, false);
  assert.equal(r.items[0].issues[0].severity, "info");
});
test("valid JSON primitives are not treated as usable schema documents", () => {
  const r = inspectSchemas([{ field: "schema:0", label: "source", raw: "42" }]);
  assert.equal(r.syntax.length, 1);
  assert.equal(r.items.length, 0);
});
test("invalid source blocks are retained for correction and undo keeps originals intact", () => {
  const p = extractHtml(
    '<main><h1>Page</h1></main><script type="application/ld+json">{"@type":"Article",bad}</script>',
  );
  assert.equal(p.schemas.invalid, 1);
  assert.equal(p.schemas.invalidSamples?.length, 1);
  const before = JSON.stringify(p),
    raw =
      '{"@context":"https://schema.org","@type":"Article","headline":"Corrected source"}';
  const draft = applyDraft(p, [
    {
      field: "schema-invalid:0",
      before: p.schemas.invalidSamples![0].raw,
      after: raw,
    },
  ]);
  assert.equal(JSON.stringify(p), before);
  assert.equal(draft.schemas.invalid, 0);
  assert.equal(draft.schemas.valid, 1);
  assert.deepEqual(draft.schemas.types, ["Article"]);
  assert.equal(
    inspectSchemas(schemaSources(draft.schemas)).items[0].name,
    "Corrected source",
  );
  assert.equal(applyDraft(p, []).schemas.invalid, 1);
});
test("authors resolve through local graph references without guessing publisher authorship", () => {
  const p = extractHtml(
    `<script type="application/ld+json">${JSON.stringify(graph)}</script>`,
  );
  const a = authorsFromSchemas(p.schemas);
  assert.equal(a.length, 1);
  assert.equal(a[0].name, "Actual Author");
  assert.equal(a[0].url, "https://example.com/author");
});
test("nested authors and multiple script blocks retain their source identifiers", () => {
  const p = extractHtml(
    '<script type="application/ld+json">{"@context":"https://schema.org","@type":"Article","author":{"@type":"Person","name":"Writer"}}</script><script type="application/ld+json">{"@context":"https://schema.org","@type":"WebSite","name":"Site","url":"https://example.com"}</script>',
  );
  const r = inspectSchemas(schemaSources(p.schemas));
  assert.equal(r.items.length, 3);
  assert.ok(r.items.some((i) => i.source.field === "schema:1"));
  assert.equal(authorsFromSchemas(p.schemas)[0].name, "Writer");
});
test("breadcrumb positions and declared rating ranges are checked without requiring the final breadcrumb URL", () => {
  const a = inspectSchemas(
    source({
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        {
          "@type": "ListItem",
          name: "Home",
          position: 1,
          item: "https://example.com",
        },
        { "@type": "ListItem", name: "Last", position: 2 },
      ],
    }),
  );
  assert.equal(a.errors, 0);
  assert.equal(a.warnings, 0);
  const b = inspectSchemas(
    source({
      "@context": "https://schema.org",
      "@type": "AggregateRating",
      ratingValue: 7,
      bestRating: 5,
    }),
  );
  assert.ok(
    b.items[0].issues.some(
      (i) => i.path === "$.ratingValue" && i.severity === "error",
    ),
  );
});
test("JSON-LD strings containing markup remain evidence and are never executed", () => {
  const r = inspectSchemas(
    source({
      "@context": "https://schema.org",
      "@type": "Article",
      headline: '<img src=x onerror="alert(1)">',
    }),
  );
  assert.equal(r.items[0].name, '<img src=x onerror="alert(1)">');
  assert.equal((globalThis as any).alert, undefined);
});
test("oversized and deeply nested samples expose explicit coverage limits", () => {
  const r = inspectSchemas([
    { field: "schema:0", label: "source", raw: "x".repeat(150001) },
  ]);
  assert.equal(r.limited, true);
  let nested: any = { "@type": "Person", name: "Deep" };
  for (let i = 0; i < 25; i++) nested = { child: nested };
  assert.equal(inspectSchemas(source(nested)).limited, true);
});
test("opening and section boundaries never borrow a later section's answer", () => {
  const p = extractHtml(
    "<main><h1>Topic</h1><h2>First section</h2><h3>Nested section</h3><p>Actual nested explanation.</p><h2>Second section</h2><p>In this article we will explore the topic.</p></main>",
  );
  const r = answerReadiness(p);
  assert.equal(r.opening.status, "unknown");
  assert.equal(r.sections[0].status, "unknown");
  assert.equal(r.sections[1].passage?.text, "Actual nested explanation.");
  assert.equal(r.sections[2].status, "review");
});
test("short passages are detected, not certified as direct or correct answers", () => {
  const r = answerReadiness(
    extractHtml(
      "<main><h1>Topic</h1><p>Brief unrelated wording.</p><h2>Details</h2><p>A short passage.</p></main>",
    ),
  );
  assert.equal(r.opening.status, "available");
  assert.match(r.opening.reason, /cannot establish/);
});
test("claim cues remain editorial prompts and new schema findings link to the validator", () => {
  const p = extractHtml(
    "<main><h1>Topic</h1><p>Research shows 90% prefer this approach.</p></main>",
  );
  assert.equal(answerReadiness(p).claims.length, 1);
  const f = auditPage(p).find((f) => f.id === "schema-fields")!;
  assert.equal(f.tool, "structured-data-validator");
  assert.equal(f.weight, 0);
});

test("pasted draft conversion preserves list boundaries and escapes executable markup", () => {
  const p = extractHtml(
    draftHtml(
      "# Main heading\nIntroductory passage.\n- One item\n- Second item\n<script>alert(1)</script>",
    ),
  );
  assert.equal(p.blocks.filter((b) => b.tag === "li").length, 2);
  assert.equal(p.blocks[0].tag, "h1");
  assert.ok(p.blocks.some((b) => b.text.includes("<script>")));
});

test("optional AI content formats never penalize natural prose or require statistics", async () => {
  const { analyzeDocument } =
    await import("../../features/citation-readiness/analyzer");
  const { extractFromText } =
    await import("../../features/citation-readiness/extract-from-text");
  const result = analyzeDocument(
    extractFromText(
      "# A useful topic\n\nA clear opening passage explains the subject.\n\n## Details\n\nThis section provides a useful explanation.",
    ),
  );
  for (const id of ["question-headings", "has-lists-or-tables", "has-stats"])
    assert.equal(result.checks.find((c) => c.id === id)?.status, "na");
});
test("dedicated content checker uses retained authors and schema dates without inventing unknown metadata", async () => {
  const { citationDocument } =
    await import("../../features/citation-readiness/client");
  const p = extractHtml(
    `<main><h1>Topic</h1><p>Clear content.</p></main><script type="application/ld+json">${JSON.stringify(graph)}</script>`,
    "https://example.com/article",
  );
  const doc = citationDocument(p);
  assert.equal(doc.hasAuthor, true);
  assert.equal(doc.hasPublishedDate, true);
  assert.equal(doc.h1Count, 1);
  const empty = citationDocument(
    extractHtml("<main><p>Simple page.</p></main>", "https://example.com"),
  );
  assert.equal(empty.hasAuthor, null);
  assert.equal(empty.hasPublishedDate, null);
});
