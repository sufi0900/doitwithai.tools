import test from "node:test";
import assert from "node:assert/strict";
import {
  extractHtml,
  PageCollector,
} from "../../features/on-page-analyzer/server/extract";
import { auditPage, applyDraft } from "../../features/on-page-analyzer/audit";
import { answerReadiness } from "../../features/on-page-analyzer/readiness";
import {
  keywordReport,
  readabilityReport,
  claimPassages,
} from "../../features/on-page-analyzer/metrics";
import {
  categoryScores,
  CATEGORY_WEIGHTS,
  summarize,
} from "../../features/on-page-analyzer/scoring";
import {
  inspectSchemas,
  schemaSources,
} from "../../features/schema-inspector/inspect";
import { EXAMPLE_HTML } from "../../features/on-page-analyzer/example";

test("author cards and contents navigation are not mistaken for article answers", () => {
  const p = extractHtml(
    '<main><h1>Content planning</h1><div class="author-card"><p>AI Tools Expert &amp; Founder</p></div><nav aria-label="Contents"><h2>Table of Contents</h2><ul><li>Overview</li></ul></nav><p>Content planning organizes the work needed to create useful articles.</p><h2>Choose a topic</h2><p>Start with the question your reader needs answered.</p></main>',
  );
  const r = answerReadiness(p);
  assert.match(r.opening.passage!.text, /^Content planning/);
  assert.equal(r.sections.length, 1);
  assert.ok(!p.blocks.some((b) => /Founder|Contents/.test(b.text)));
});
test("contents headings without navigation wrappers do not become answer cards", () => {
  const p = extractHtml(
    "<main><h1>Plan content</h1><p>AI Tools Expert &amp; Founder</p><h2>Table of Contents</h2><ul><li>Choose a topic</li></ul><p>Plan content around useful questions and practical examples.</p><h2>Choose a topic</h2><p>Start with a reader question.</p></main>",
  );
  const r = answerReadiness(p);
  assert.match(r.opening.passage!.text, /^Plan content/);
  assert.equal(r.sections.length, 1);
});
test("nested Microdata and basic Schema.org RDFa retain types, properties, and origins", () => {
  const p = extractHtml(
    '<main><article itemscope itemtype="https://schema.org/Article"><h1 itemprop="headline">A useful guide</h1><span itemprop="author" itemscope itemtype="https://schema.org/Person"><span itemprop="name">Example Writer</span></span><meta itemprop="datePublished" content="2026-10-22"></article><div vocab="https://schema.org/" typeof="Organization"><span property="name">Example Company</span><a property="url" href="/">Website</a></div></main>',
    "https://example.com/article",
  );
  assert.deepEqual(p.schemas.sampleFormats, ["Microdata", "RDFa"]);
  const r = inspectSchemas(schemaSources(p.schemas));
  assert.deepEqual(r.types.sort(), ["Article", "Organization", "Person"]);
  assert.equal(r.items.filter((i) => i.types.includes("Person")).length, 1);
  assert.equal(
    r.items.find((i) => i.types.includes("Person"))!.name,
    "Example Writer",
  );
  assert.match(schemaSources(p.schemas)[0].label, /Microdata.*normalized/);
  assert.equal(p.schemas.valid, 0); // Normalized sources are not invented JSON-LD script blocks.
});
test("structured sources survive stream chunks and parameterized MIME types", () => {
  const html =
    '<script type="application/ld+json; charset=utf-8">{"@context":"https://schema.org","@type":"WebPage","name":"Streamed"}</script><meta name="twitter:title" content="Sharing title"><meta name="twitter:image" content="/share.jpg">';
  const parser = new PageCollector("https://example.com");
  for (let i = 0; i < html.length; i += 7) parser.write(html.slice(i, i + 7));
  const p = parser.finish();
  assert.equal(p.schemas.valid, 1);
  assert.equal(p.twitterTitle, "Sharing title");
  assert.equal(p.twitterImage, "https://example.com/share.jpg");
});
test("unsupported markup relationships expose limitations without prototype mutation", () => {
  const p = extractHtml(
    '<div itemscope itemtype="https://schema.org/Person" itemref="other"><span itemprop="__proto__">unsafe</span><span itemprop="name">Writer</span></div>',
  );
  assert.ok(p.schemas.markupWarnings?.length);
  assert.equal(({} as any).unsafe, undefined);
  assert.equal(
    inspectSchemas(schemaSources(p.schemas)).items[0].name,
    "Writer",
  );
});
test("readability uses independent list boundaries and does not score unsupported languages", () => {
  const p = extractHtml(
    '<html lang="en"><main><h1>Checklist</h1><ul><li>Choose a useful topic</li><li>Write clear headings</li><li>Check your sources</li></ul></main></html>',
  );
  const report = readabilityReport(p);
  assert.equal(report.sentenceCount, 3);
  assert.equal(report.longSentences, 0);
  p.language = "ur";
  assert.equal(
    auditPage(p).find((f) => f.id === "readability")!.status,
    "unchecked",
  );
});
test("keyword phrases use boundaries, supporting groups, and exclude headings from body density", () => {
  const p = extractHtml(
    "<main><h1>Content plan</h1><p>A content plan helps. Keep the content plan useful.</p><h2>Audience needs</h2><p>Audience research guides decisions.</p></main>",
  );
  const r = keywordReport(
    p,
    "content plan",
    "audience research",
    "audience needs,CONTENT PLAN",
  );
  assert.equal(r.length, 3);
  assert.equal(r[0].count, 2);
  assert.equal(r[0].h1, 1);
  assert.equal(r[2].count, 0);
  assert.equal(r[2].headings, 1);
  assert.equal(
    r[0].distribution.reduce((a, b) => a + b, 0),
    r[0].count,
  );
});
test("category weights total 100 and unknown coverage never earns an unqualified overall score", () => {
  assert.equal(
    Object.values(CATEGORY_WEIGHTS).reduce((a, b) => a + b, 0),
    100,
  );
  const p = extractHtml(EXAMPLE_HTML, "https://example.com");
  const f = auditPage(p);
  const allUnknown = f.map((x) => ({ ...x, status: "unchecked" as const }));
  assert.equal(summarize(allUnknown).score, null);
  assert.equal(summarize(allUnknown).coverage, 0);
  const onlySearch = f.map((x) => ({
    ...x,
    status:
      x.section === "search" ? ("passed" as const) : ("unchecked" as const),
  }));
  assert.equal(summarize(onlySearch).score, null);
  assert.equal(
    categoryScores(onlySearch).find((c) => c.id === "search")!.score,
    100,
  );
  assert.ok(summarize(onlySearch).coverage <= 15);
});
test("confirmed blockers remain critical while completed draft changes improve their own category", () => {
  const p = extractHtml(EXAMPLE_HTML, "https://example.com");
  p.source = "url";
  p.status = 200;
  p.robots = ["robots: noindex"];
  const before = categoryScores(auditPage(p)).find((c) => c.id === "search")!;
  const draft = applyDraft(p, [
    {
      field: "description",
      before: p.description,
      after: "A clear page description.",
    },
  ]);
  const after = categoryScores(auditPage(draft)).find(
    (c) => c.id === "search",
  )!;
  assert.ok(after.contribution >= before.contribution);
  assert.equal(summarize(auditPage(draft)).critical, 1);
  assert.ok(!p.description || p.description !== draft.description);
});
test("claim detection is editorial and has no score input from user acknowledgments", () => {
  const p = extractHtml(
    '<html lang="en"><main><h1>Example</h1><p>Research shows 90% prefer this option.</p></main></html>',
  );
  assert.equal(claimPassages(p).length, 1);
  const claim = auditPage(p).find((f) => f.id === "claims")!;
  assert.equal(claim.weight, 0);
  assert.equal(claim.status, "info");
});
test("unknown schema profiles stay visible without passing field coverage", () => {
  const p = extractHtml(
    '<script type="application/ld+json">{"@context":"https://schema.org","@type":"NewUnsupportedType","name":"Example"}</script>',
  );
  assert.equal(inspectSchemas(schemaSources(p.schemas)).items.length, 1);
  assert.equal(
    auditPage(p).find((f) => f.id === "schema-fields")!.status,
    "unchecked",
  );
});

test("rich-editor list paragraphs retain item identity and independent sentence boundaries", () => {
  const p = extractHtml(
    '<html lang="en"><main><h1>Checklist</h1><ul><li><p>Pick a topic</p><p>Keep its purpose clear</p></li><li><p>Check your sources</p></li></ul></main></html>',
  );
  const r = readabilityReport(p);
  assert.equal(r.sentenceCount, 3);
  assert.equal(r.listItems, 2);
  assert.equal(r.paragraphs, 0);
});

test("keyword matches never join separate paragraphs or list items", () => {
  const p = extractHtml(
    "<main><h1>Notes</h1><p>Consider content</p><p>plan your next task</p><ul><li>content</li><li>plan</li></ul></main>",
  );
  assert.equal(keywordReport(p, "content plan")[0].count, 0);
});
test("image link alternative text supplies anchor context without becoming prose", () => {
  const p = extractHtml(
    '<main><p><a href="/guide"><img src="/cover.jpg" alt="Read the content planning guide"></a></p></main>',
    "https://example.com",
  );
  assert.equal(p.links[0].text, "Read the content planning guide");
  assert.equal(p.blocks.length, 0);
});
