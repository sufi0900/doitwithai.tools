import test from "node:test";
import assert from "node:assert/strict";
import { getSchema } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { EditorState } from "@tiptap/pm/state";
import { analyzeDocument, changedRange, documentPosition, plainDocument, projectDocument, safeLink, textPosition, type RichDocument } from "../../features/readability/engine";
import { replacementEdits, SafeLink } from "../../features/readability/components/rich-text";
const paragraph = (text: string): RichDocument => ({ type: "paragraph", content: [{ type: "text", text }] });
const item = (text: string): RichDocument => ({ type: "listItem", content: [paragraph(text)] });
const article: RichDocument = { type: "doc", content: [
  { type: "heading", attrs: { level: 2 }, content: [{ type: "text", text: "Understanding organizational communication terminology" }] },
  paragraph("Choose your next step."),
  { type: "bulletList", content: [item("Read the draft carefully"), item("Check the key facts"), item("Review the main heading"), item("Publish the final version")] },
  { type: "blockquote", content: [paragraph("Keep the original meaning.")] },
  { type: "codeBlock", content: [{ type: "text", text: "const complicatedCode = implementationSpecificParameter;" }] },
] };
const schema = getSchema([StarterKit, SafeLink]);

test("four unpunctuated rich list items remain four independent reading units", () => {
  const p = projectDocument(article);
  const a = analyzeDocument(p.text, { blocks: p.blocks });
  assert.equal(a.listItems, 4);
  assert.equal(a.headings, 1);
  assert.equal(a.quotes, 1);
  assert.equal(a.paragraphs, 2);
  assert.equal(a.sentenceCount, 6);
  assert.equal(a.longestSentenceWords, 4);
  assert.equal(a.counts.hard + a.counts.veryHard, 0);
});
test("headings and code do not inflate the rich article grade", () => {
  const withExtra = projectDocument(article);
  const proseOnly = projectDocument({ type: "doc", content: article.content!.slice(1, -1) });
  assert.equal(analyzeDocument(withExtra.text, { blocks: withExtra.blocks }).grade, analyzeDocument(proseOnly.text, { blocks: proseOnly.blocks }).grade);
});
test("text offsets map to exact ProseMirror positions through nested lists and inline marks", () => {
  const doc = schema.nodeFromJSON(article);
  const p = projectDocument(article);
  for (const run of p.runs) {
    for (let i = run.start; i < run.end; i++) {
      const pos = documentPosition(p, i);
      assert.equal(doc.textBetween(pos, pos + 1), p.text[i]);
      assert.equal(textPosition(p, pos), i);
    }
  }
});
test("replacing a sentence preserves the list container and other items", () => {
  const doc = schema.nodeFromJSON(article); const p = projectDocument(article);
  const start = p.text.indexOf("Check the key facts");
  const plan = replacementEdits(p, start, start + "Check the key facts".length, "Verify each key fact");
  assert.ok(plan.edits);
  const state = EditorState.create({ schema, doc });
  const edit = plan.edits![0]; const next = state.tr.insertText(edit.text, edit.from, edit.to).doc;
  const out = next.toJSON();
  assert.equal(out.content[2].type, "bulletList");
  assert.equal(out.content[2].content.length, 4);
  assert.equal(out.content[2].content[1].content[0].content[0].text, "Verify each key fact");
  assert.equal(out.content[2].content[2].content[0].content[0].text, "Review the main heading");
});
test("cross-block rewrites keep block boundaries or refuse a destructive structural change", () => {
  const p = projectDocument({ type: "doc", content: [{ type: "bulletList", content: [item("First item"), item("Second item")] }] });
  assert.equal(replacementEdits(p, 0, p.text.length, "One merged sentence").edits, undefined);
  assert.equal(replacementEdits(p, 0, p.text.length, "First revision\n\nSecond revision").edits?.length, 2);
});
test("marks, hard breaks, empty paragraphs and emoji preserve usable offsets", () => {
  const rich: RichDocument = { type: "doc", content: [{ type: "paragraph", content: [{ type: "text", text: "Clear ", marks: [{ type: "bold" }] }, { type: "text", text: "writing 😀" }, { type: "hardBreak" }, { type: "text", text: "Next line" }] }, { type: "paragraph" }] };
  const p = projectDocument(rich); assert.equal(p.text, "Clear writing 😀\nNext line\n\n");
  assert.equal(textPosition(p, documentPosition(p, p.text.indexOf("Next"))), p.text.indexOf("Next"));
  assert.equal(documentPosition(p, p.text.length), schema.nodeFromJSON(rich).content.size - 1);
  assert.deepEqual(changedRange("Use really clear writing.", "Use clear writing."), { start: 4, end: 11, replacement: "" });
});
test("unsafe links are rejected and legacy plain drafts retain separate lines", () => {
  assert.equal(safeLink("javascript:alert(1)"), null);
  assert.equal(safeLink("data:text/html,<script>alert(1)</script>"), null);
  assert.equal(safeLink("https://example.com/profile"), "https://example.com/profile");
  assert.equal(projectDocument(plainDocument("First item\nSecond item\n\nNext paragraph")).text, "First item\nSecond item\n\nNext paragraph");
});

test("a soft line break inside a paragraph does not create a fake sentence boundary", () => {
  const rich: RichDocument = { type: "doc", content: [{ type: "paragraph", content: [
    { type: "text", text: "The first half continues" }, { type: "hardBreak" }, { type: "text", text: "with the second half of this sentence." },
  ] }] };
  const p = projectDocument(rich); const a = analyzeDocument(p.text, { blocks: p.blocks });
  assert.equal(a.sentenceCount, 1);
  assert.equal(a.sentences[0].text, p.text);
  assert.equal(a.words, 11);
});
