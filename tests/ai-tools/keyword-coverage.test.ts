import test from "node:test";
import assert from "node:assert/strict";
import { tokenize } from "../../features/keyword-density/analyze";
import {
  keywordCoverage,
  coverageCsv,
} from "../../features/keyword-density/coverage";
const run = (text: string, phrases: string[]) =>
  keywordCoverage(text, tokenize(text), phrases);
test("counts normalized target presence and distinguishes missing phrases from supplied fields", () => {
  const text = "AI tools help.\n\nOther content.";
  const r = keywordCoverage(text, tokenize(text), ["ai tools", "missing"], {
    title: "AI TOOLS",
    description: "Different wording",
    headings: "AI\ntools",
  });
  assert.equal(r.matchedTargets, 1);
  assert.equal(r.rows[0].title, 1);
  assert.equal(r.rows[0].description, 0);
  assert.equal(r.rows[0].headings, 0);
  assert.equal(r.rows[1].firstWord, null);
  assert.equal(r.rows[0].paragraphs, 1);
  assert.equal(r.paragraphs, 2);
  assert.equal(run(text, ["AI tools"]).rows[0].title, null);
});
test("overlapping occurrences and targets do not inflate distinct occupied body words", () => {
  const r = run("very very very", ["very very", "very"]);
  assert.equal(r.rows[0].count, 2);
  assert.equal(r.rows[0].coveredWords, 3);
  assert.equal(r.coveredWords, 3);
  assert.equal(r.wordCoverage, 100);
  assert.equal(r.rows[1].count, 3);
});
test("distribution uses word positions and assigns boundary-spanning phrases by start", () => {
  const r = run("one two three four five six seven eight nine", [
    "three four",
    "four five",
    "eight nine",
  ]);
  assert.deepEqual(
    r.rows.map((row) => row.bands),
    [
      [1, 0, 0],
      [0, 1, 0],
      [0, 0, 1],
    ],
  );
  assert.deepEqual(
    r.rows.map((row) => row.firstWord),
    [3, 4, 8],
  );
});
test("phrase matches cannot bridge sentence, paragraph, heading, or list line breaks", () => {
  const text = "AI\ntools\n\nAI. Tools\n- AI\n- tools";
  assert.equal(run(text, ["AI tools"]).matchedTargets, 0);
});
test("empty body and absent page fields remain unassessed without NaN", () => {
  const r = run("", ["AI tools"]);
  assert.equal(r.totalWords, 0);
  assert.equal(r.wordCoverage, 0);
  assert.equal(r.rows[0].rate, 0);
  assert.deepEqual(r.rows[0].bands, [0, 0, 0]);
  assert.equal(r.rows[0].title, null);
  assert.equal(r.rows[0].role, "Focus");
});
test("optional fields do not affect body totals or distribution", () => {
  const text = "AI tools",
    tokens = tokenize(text);
  const r = keywordCoverage(text, tokens, ["AI tools"], {
    title: "AI tools AI tools",
    description: "AI tools",
    headings: "AI tools\nAI tools",
  });
  assert.equal(r.totalWords, 2);
  assert.equal(r.rows[0].count, 1);
  assert.equal(r.rows[0].title, 2);
  assert.equal(r.rows[0].headings, 2);
  assert.equal(r.rows[0].rate, 50);
});
test("coverage validates target limits and CSV retains unknown fields and formula safeguards", () => {
  assert.throws(() => run("AI", ["ai", "AI"]), /duplicate/);
  assert.throws(
    () =>
      run(
        "AI",
        Array.from({ length: 11 }, (_, i) => `word ${i}`),
      ),
    /at most ten/,
  );
  const csv = coverageCsv(run("AI tools", ["=AI tools"]));
  assert.ok(csv.includes('"\'=AI tools"'));
  assert.ok(csv.includes("Not supplied"));
  assert.ok(csv.includes('"50.000"'));
  assert.equal(csv.split("\r\n").length, 2);
});
