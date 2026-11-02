import test from "node:test";
import assert from "node:assert/strict";
import {
  defaults,
  example,
  validate,
  recommend,
  buildPlan,
  markdown,
  csv,
  exportError,
} from "../../features/digital-pr/model";
import { planDocx } from "../../features/digital-pr/export";
test("required reader inputs have specific errors and valid example builds", () => {
  assert.deepEqual(Object.keys(validate(defaults)), [
    "topic",
    "audience",
    "problem",
  ]);
  assert.deepEqual(validate(example), {});
  assert.throws(() => buildPlan(defaults));
});
test("evidence choices require collection notes except an honest no-evidence start", () => {
  for (const evidence of ["public", "owned", "expert"] as const)
    assert(
      validate({ ...example, evidence, evidenceNotes: " " }).evidenceNotes,
    );
  assert.deepEqual(
    validate({ ...example, evidence: "none", evidenceNotes: "" }),
    {},
  );
});
test("rules recommend reports for data and guides otherwise without fabricated scores", () => {
  for (const evidence of ["public", "owned"] as const)
    assert.equal(recommend({ ...example, evidence }), "report");
  for (const evidence of ["expert", "none"] as const)
    assert.equal(recommend({ ...example, evidence }), "guide");
});
test("all optional formats produce distinct production and verification requirements", () => {
  const texts = new Set<string>();
  for (const format of ["report", "guide", "tool", "visual"] as const) {
    const plan = buildPlan({ ...example, format });
    assert.equal(plan.asset, format);
    assert.match(plan.reason, /You selected/);
    texts.add(plan.sections.find((s) => s.id === "evidence")!.text);
    assert.equal(plan.actions.length, 7);
    assert(plan.actions.every((a) => !a.done));
  }
  assert.equal(texts.size, 4);
  assert.match(
    markdown(buildPlan({ ...example, format: "tool" })),
    /real implementation/,
  );
});
test("supplied facts are preserved, findings remain questions, and no invented contacts appear", () => {
  const p = buildPlan(example),
    text = markdown(p);
  for (const fact of [
    example.topic,
    example.audience,
    example.problem,
    example.evidenceNotes,
    example.region,
  ])
    assert(text.includes(fact));
  assert.match(text, /research question/);
  assert.match(p.warning, /self-reported/);
  assert(!/\b\d+%|guaranteed|@.*\.(com|org)/i.test(text));
});
test("no evidence produces an explicit incomplete-evidence warning", () => {
  const p = buildPlan({ ...example, evidence: "none", evidenceNotes: "" });
  assert.match(p.warning, /not been collected/);
  assert.match(markdown(p), /not publishable findings/);
});
test("limits and invalid enum inputs fail closed including object prototype names", () => {
  assert(validate({ ...example, topic: "x".repeat(121) }).topic);
  assert(validate({ ...example, evidence: "toString" as any }).evidence);
  assert(validate({ ...example, format: "constructor" as any }).format);
});
test("Markdown export escapes markup and includes current section and task edits", () => {
  const p = buildPlan(example);
  p.title = "My [reviewed] plan";
  p.sections[0].text = "Edited *literal* <script>";
  p.actions[0].done = true;
  p.actions[0].owner = "R&D";
  const text = markdown(p);
  assert(text.includes("My \\[reviewed\\] plan"));
  assert(text.includes("Edited \\*literal\\* \\<script\\>"));
  assert.match(text, /\[x\]/);
  assert(text.includes("R&D"));
});
test("CSV quotes commas, quotes and multiline text and neutralizes spreadsheet formulas", () => {
  const p = buildPlan(example);
  p.title = 'A, "test"';
  p.actions[0].owner = '\t=HYPERLINK("x")';
  p.actions[1].owner = "Sam\nTeam";
  const out = csv(p);
  assert(out.startsWith("\ufeff"));
  assert(out.includes('"A, ""test"""'));
  assert(out.includes('"\'\t=HYPERLINK(""x"")"'));
  assert(out.includes('"Sam\nTeam"'));
});
test("export validation catches deleted titles and sections", () => {
  const p = buildPlan(example);
  assert.equal(exportError(p), "");
  p.title = " ";
  assert(exportError(p));
  p.title = "Okay";
  p.sections[0].text = "";
  assert(exportError(p));
});
test("DOCX is a real ZIP with WordprocessingML, styles, escaped edits and action status", () => {
  const p = buildPlan(example);
  p.title = "Test & <plan>";
  p.actions[0].done = true;
  const bytes = planDocx(p),
    text = new TextDecoder().decode(bytes);
  assert.equal(new DataView(bytes.buffer).getUint32(0, true), 0x04034b50);
  for (const part of [
    "[Content_Types].xml",
    "word/document.xml",
    "word/styles.xml",
    "_rels/.rels",
  ])
    assert(text.includes(part));
  assert(text.includes("Test &amp; &lt;plan&gt;"));
  assert(text.includes("Status: Done"));
  assert(text.includes('w:w="12240"'));
  assert(text.includes('w:h="15840"'));
});
test("switching to no evidence excludes hidden notes from earlier choices", () => {
  const p = buildPlan({
    ...example,
    evidence: "none",
    evidenceNotes: "Private notes from a previous choice",
  });
  assert(!markdown(p).includes("Private notes from a previous choice"));
});
