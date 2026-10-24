import test from "node:test";
import assert from "node:assert/strict";
import {
  analyzeDocument,
  annotate,
  applyFix,
  ariGrade,
  buildFeedback,
  classifySentence,
  countSyllables,
  formatDuration,
  gradeLabel,
  scoreSentences,
} from "../../features/readability/engine";

const types = (text: string) => annotate(text).map((a) => a.type);
const spans = (text: string, type: string) =>
  annotate(text)
    .filter((a) => a.type === type)
    .map((a) => text.slice(a.start, a.end));

test("ARI grade follows the published formula and clamps at zero", () => {
  // 4.71 * (30 / 5) + 0.5 * (5 / 1) - 21.43 = 9.33 -> 9
  assert.equal(ariGrade(30, 5, 1), 9);
  assert.equal(ariGrade(0, 0, 0), 0);
  assert.equal(ariGrade(5, 5, 1), 0);
  assert.equal(ariGrade(150, 25, 1), Math.round(4.71 * 6 + 12.5 - 21.43));
});

test("sentences under 14 words are never flagged, longer ones use level bands", () => {
  assert.equal(classifySentence(13, 20), null);
  assert.equal(classifySentence(14, 9), null);
  assert.equal(classifySentence(14, 10), "hard");
  assert.equal(classifySentence(14, 13), "hard");
  assert.equal(classifySentence(14, 14), "veryHard");
  assert.equal(classifySentence(30, 22), "veryHard");
});

test("hard and very hard sentences are annotated with exact trimmed offsets", () => {
  const dense =
    "Notwithstanding considerable organizational uncertainty regarding implementation responsibilities, stakeholders consistently demonstrated extraordinary determination throughout comprehensive restructuring negotiations.";
  const text = `${dense}\n\nShort and plain.`;
  const hits = annotate(text).filter((a) => a.type === "veryHard" || a.type === "hard");
  assert.equal(hits.length, 1);
  assert.equal(text.slice(hits[0].start, hits[0].end), dense);
  assert.equal(
    annotate("Short and plain.").some((a) => a.type === "hard" || a.type === "veryHard"),
    false,
  );
});

test("headings and fenced code are not flagged as hard prose", () => {
  const long =
    "Comprehensive organizational restructuring recommendations substantially complicated implementation responsibilities throughout multiple departments";
  assert.equal(types(`# ${long}\n`).includes("veryHard"), false);
  const fenced = "```\nvery really basically quickly utilize\n```\n";
  assert.equal(annotate(fenced).length, 0);
  assert.equal(analyzeDocument(fenced).words, 0);
});

test("adverbs skip common non-adverb words", () => {
  const text = "She quickly left the family home early on Friday, only briefly.";
  assert.deepEqual(spans(text, "adverb"), ["quickly", "briefly"]);
});

test("passive voice matches be-forms with regular and irregular participles", () => {
  const text =
    "The report was written by the team. Mistakes were quickly noticed. The tool is made for editors. The sky is red and the room was bored.";
  assert.deepEqual(spans(text, "passive"), [
    "was written",
    "were quickly noticed",
    "is made",
    "was bored",
  ]);
  assert.deepEqual(spans("We need speed and a red car.", "passive"), []);
});

test("weakeners are matched on word boundaries and keep their own case", () => {
  const text = "I think this is really useful. Justice is not just a word.";
  assert.deepEqual(spans(text, "weakener"), ["I think", "really", "just"]);
});

test("simpler alternatives cover words and wordy phrases", () => {
  const text = "In order to utilize this, due to the fact that it works.";
  const found = annotate(text).filter((a) => a.type === "simpler");
  assert.deepEqual(
    found.map((a) => [text.slice(a.start, a.end), a.replacement]),
    [
      ["In order to", "To"],
      ["utilize", "use"],
      ["due to the fact that", "because"],
    ],
  );
});

test("overlaps keep the highest-priority inline issue only", () => {
  const text = "This is basically a really simple tool.";
  const inline = annotate(text).filter((a) => a.type !== "hard" && a.type !== "veryHard");
  for (let i = 1; i < inline.length; i++) assert.ok(inline[i].start >= inline[i - 1].end);
});

test("applyFix replaces with matching case and removes deletions cleanly", () => {
  const swap = "In order to win, utilize speed.";
  const [phrase] = annotate(swap).filter((a) => a.type === "simpler");
  assert.equal(applyFix(swap, phrase)!.text, "To win, utilize speed.");

  const del = "It was really good.";
  const [weak] = annotate(del).filter((a) => a.type === "weakener");
  assert.equal(applyFix(del, weak)!.text, "It was good.");

  const lead = "Basically, it works.";
  const [first] = annotate(lead).filter((a) => a.type === "weakener");
  assert.equal(applyFix(lead, first)!.text, "It works.");

  const tail = "This is very.";
  const [last] = annotate(tail).filter((a) => a.type === "weakener");
  assert.equal(applyFix(tail, last)!.text, "This is.");

  const [passive] = annotate("The file was written.").filter((a) => a.type === "passive");
  assert.equal(applyFix("The file was written.", passive), null);
});

test("every annotation range maps to the exact source text", () => {
  const text =
    "I think the draft was written quickly.\n\nIn order to fix it, utilize a simpler word, because the sentence is really too long for most readers to follow comfortably in one go.";
  for (const a of annotate(text)) {
    assert.ok(a.start >= 0 && a.end <= text.length && a.end > a.start);
    assert.equal(text.slice(a.start, a.end).trim(), text.slice(a.start, a.end));
  }
});

test("document stats count words, paragraphs, time and bands", () => {
  const text = `${Array(238).fill("word").join(" ")}.\n\nSecond paragraph here.`;
  const a = analyzeDocument(text);
  assert.equal(a.words, 241);
  assert.equal(a.paragraphs, 2);
  assert.equal(a.sentenceCount, 2);
  assert.equal(a.readingSeconds, 61);
  assert.equal(a.longSentences, 1);
  assert.equal(a.longestSentenceWords, 238);
  assert.equal(analyzeDocument(text, { longThreshold: 300 }).longSentences, 0);
  assert.equal(a.bands[3].count, 1);
  const empty = analyzeDocument("");
  assert.equal(empty.words, 0);
  assert.equal(empty.grade, 0);
  assert.equal(empty.fleschEase, null);
});

test("syllable estimates and formatting helpers behave sensibly", () => {
  assert.equal(countSyllables("cat"), 1);
  assert.equal(countSyllables("reading"), 2);
  assert.equal(countSyllables("readability"), 5);
  assert.equal(formatDuration(0), "0 sec");
  assert.equal(formatDuration(45), "45 sec");
  assert.equal(formatDuration(120), "2 min");
  assert.equal(formatDuration(125), "2 min 5 sec");
  assert.match(gradeLabel(5, true), /easy/i);
  assert.match(gradeLabel(15, true), /hard/i);
  assert.match(gradeLabel(0, false), /Add text/);
});

test("feedback prioritises the most serious cues and stays calm for clear text", () => {
  const dense =
    "Notwithstanding considerable organizational uncertainty regarding implementation responsibilities, stakeholders consistently demonstrated extraordinary determination throughout comprehensive restructuring negotiations.";
  const bad = buildFeedback(analyzeDocument(dense), 9);
  assert.equal(bad[0].level, "high");
  assert.ok(bad.length <= 5);
  const calm = buildFeedback(analyzeDocument("Short and plain. Easy to read."), 9);
  assert.equal(calm[0].id, "clear");
  assert.deepEqual(buildFeedback(analyzeDocument(""), 9), []);
});

test("scoreSentences preserves heading detection and stable indexes", () => {
  const list = scoreSentences("# Title\n\nOne sentence here. Two sentences here.");
  assert.deepEqual(
    list.map((s) => [s.index, s.heading]),
    [
      [0, true],
      [1, false],
      [2, false],
    ],
  );
});
