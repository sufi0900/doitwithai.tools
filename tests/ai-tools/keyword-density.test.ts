import { test } from "node:test";
import assert from "node:assert/strict";
import {
  analyze,
  distribution,
  exportCsv,
  findMatches,
  MAX_TEXT,
  mergeMatches,
  parseTargets,
  previewWindow,
  tokenize,
} from "../../features/keyword-density/analyze";
test("counts full words, phrases, unicode, contractions, and normalized variants", () => {
  const text =
    "AI tools help. ai tools help. café café don't don’t well-being well‑being ＡＩ tools";
  const r = analyze(text, false);
  assert.equal(r.totalWords, 14);
  assert.equal(findMatches(text, r.tokens, "ai tools").length, 3);
  assert.equal(findMatches(text, r.tokens, "café").length, 2);
  assert.equal(findMatches(text, r.tokens, "don't").length, 2);
  assert.equal(findMatches(text, r.tokens, "well-being").length, 2);
  assert.equal(
    findMatches("cat caterpillar", tokenize("cat caterpillar"), "cat").length,
    1,
  );
});
test("sentence and line breaks block phrases while commas remain transparent", () => {
  const text = "AI, tools. AI tools! AI\ntools\n\nAI tools";
  const tokens = tokenize(text);
  assert.equal(findMatches(text, tokens, "AI tools").length, 3);
  assert.equal(analyze(text).paragraphs, 2);
  assert.equal(tokenize("\n\nHello world")[0].paragraph, 1);
  assert.equal(
    findMatches("AI? tools", tokenize("AI? tools"), "AI tools").length,
    0,
  );
});
test("filtering discovered stop words never changes totals or explicit targets", () => {
  const text = "the AI tools and the AI tools";
  const a = analyze(text, true),
    b = analyze(text, false);
  assert.equal(a.totalWords, b.totalWords);
  assert.ok(!a.phrases[0].some((p) => p.phrase === "the"));
  assert.ok(b.phrases[0].some((p) => p.phrase === "the"));
  assert.equal(findMatches(text, a.tokens, "the AI tools").length, 2);
  assert.equal(
    a.phrases[1].find((p) => p.phrase === "ai tools")?.rate,
    (2 / 7) * 100,
  );
});
test("overlaps, paragraph concentration, and source offsets remain accurate", () => {
  const text =
    "very very very\n\nA different paragraph with very very wording.";
  const r = analyze(text, false);
  const matches = findMatches(text, r.tokens, "very very");
  assert.equal(matches.length, 3);
  assert.equal(mergeMatches(matches).length, 2);
  assert.equal(text.slice(matches[0].start, matches[0].end), "very very");
  const d = distribution(text, r.tokens, "very very");
  assert.equal(d[0].paragraph, 1);
  assert.equal(d[0].count, 2);
  assert.equal(d[0].words, 3);
  const unicode = "🌟 café café";
  const m = findMatches(unicode, tokenize(unicode), "café");
  assert.equal(unicode.slice(m[0].start, m[0].end), "café");
  assert.equal(
    previewWindow(
      "very very very",
      findMatches("very very very", tokenize("very very very"), "very very"),
    ).partial,
    false,
  );
});
test("bounds text and targets and rejects normalized duplicate inputs", () => {
  assert.equal(analyze("").totalWords, 0);
  assert.equal(analyze("!!!").totalWords, 0);
  assert.throws(() => analyze("x".repeat(MAX_TEXT + 1)));
  assert.deepEqual(parseTargets(" AI tools \n\nhuman review"), [
    "AI tools",
    "human review",
  ]);
  for (const raw of [
    "AI tools\nai tools",
    "!",
    "a ".repeat(11),
    "x".repeat(121),
    Array.from({ length: 11 }, (_, i) => `word ${i}`).join("\n"),
  ])
    assert.throws(() => parseTargets(raw));
});
test("handles maximum text locally while bounding highlight DOM and retaining complete counts", () => {
  const text = "word ".repeat(30000);
  const r = analyze(text, false);
  assert.equal(text.length, MAX_TEXT);
  assert.equal(r.totalWords, 30000);
  const matches = findMatches(text, r.tokens, "word");
  assert.equal(matches.length, 30000);
  const preview = previewWindow(text, matches);
  assert.ok(preview.partial);
  assert.ok(preview.ranges.length <= 200);
  assert.ok(preview.end - preview.start <= 20000);
  assert.equal(r.phrases[0][0].count, 30000);
  const late = "start ".repeat(15000) + "needle";
  const p = previewWindow(late, findMatches(late, tokenize(late), "needle"));
  assert.ok(p.start > 0);
  assert.ok(late.slice(p.start, p.end).includes("needle"));
});
test("CSV preserves exact counts and neutralizes spreadsheet formulas", () => {
  const csv = exportCsv(
    [{ phrase: '=HYPERLINK("bad")', count: 2, rate: 2.5, words: 1, first: 0 }],
    80,
  );
  assert.ok(csv.includes('"\'=HYPERLINK(""bad"")"'));
  assert.ok(csv.includes('"2.500"'));
  assert.ok(csv.includes('"80"'));
});

test("combining accents match their composed Unicode equivalent", () => {
  const text = "cafe\u0301 café";
  assert.equal(findMatches(text, tokenize(text), "café").length, 2);
});
