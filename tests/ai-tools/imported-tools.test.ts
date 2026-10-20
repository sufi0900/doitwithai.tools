import test from "node:test";
import assert from "node:assert/strict";
import { analyzeDocument, classifySentence } from "../../features/readability/engine";
import { analyzeHeadings, extractFromMarkdown } from "../../features/heading-analyzer/headingLib";
import { buildJsonLd, parseManualUrls, serializeJsonLd, parseSearchResponse } from "../../features/entity-sameas/entityLib";
import { parseJsonLdInput, extractRichResultBlocks, breadcrumbFromUrl } from "../../features/serp-preview/generator";

test("reader targets change editing cues without changing measured grade", () => {
  const text = "We prepare clear information so that every reader can understand the main point and choose the next useful action.";
  const general = analyzeDocument(text, { targetGrade: 9 });
  const technical = analyzeDocument(text, { targetGrade: 13 });
  assert.equal(general.grade, technical.grade);
  assert.ok(general.counts.hard + general.counts.veryHard > technical.counts.hard + technical.counts.veryHard);
  assert.equal(classifySentence(18, 11, 9), "hard");
  assert.equal(classifySentence(18, 11, 11), null);
  assert.equal(classifySentence(18, 16, 11), "veryHard");
});
test("heading outline ignores fenced examples and catches skipped levels", () => {
  const result = extractFromMarkdown("# Main topic\n\n```html\n# Example only\n```\n### Deep section\n### Deep section");
  assert.equal(result.headings.length, 3);
  const report = analyzeHeadings(result.headings, "Main topic");
  assert.ok(report.issues.some((i) => i.code.includes("skip")));
  assert.ok(report.issues.some((i) => i.code.includes("duplicate")));
});
test("entity output keeps only valid manual links and escapes script tags", () => {
  const urls = parseManualUrls("https://example.com/profile\njavascript:alert(1)");
  assert.equal(urls.valid.length, 1);
  assert.equal(urls.invalid.length, 1);
  const value = buildJsonLd({ type: "Organization", name: "</script><script>alert(1)</script>", url: "https://example.com", description: "", sameAs: urls.valid });
  assert.ok(!serializeJsonLd(value, false).includes("</script>"));
  assert.deepEqual(parseSearchResponse({ search: [{ id: "bad", label: "Wrong" }, { id: "Q42", label: "Douglas Adams" }] }).map((c) => c.id), ["Q42"]);
});
test("SERP preview reads graph markup and tolerates malformed URL input", () => {
  const blocks = extractRichResultBlocks(parseJsonLdInput(JSON.stringify({ "@graph": [{ "@type": "Article", headline: "Example", author: { name: "Editor" }, datePublished: "2026-10-20" }] })));
  assert.equal(blocks[0]?.type, "Article");
  assert.deepEqual(breadcrumbFromUrl("https://example.com/a%ZZ"), []);
  assert.throws(() => parseJsonLdInput("not json"));
});
