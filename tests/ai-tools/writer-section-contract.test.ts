import test from "node:test";
import assert from "node:assert/strict";
import { validateSectionOutline } from "../../features/writer-workspace/section-contract";
const explanation = "Keep the supplied evidence with its original heading. Check each source before publishing a factual claim.";
test("preserves complete requested sections exactly", () => {
 const body = `An introduction.\n\n### First\n\n${explanation}\n\n### Second\n\n${explanation}`;
 assert.equal(validateSectionOutline(body, ["First", "Second"]), body);
});
test("rejects missing, renamed, reordered, duplicate and additional headings", () => {
 for (const headings of [["First"], ["Other", "Second"], ["Second", "First"], ["First", "First"], ["First", "Second", "Extra"]]) {
  assert.throws(() => validateSectionOutline(headings.map(h => `### ${h}\n\n${explanation}`).join("\n\n"), ["First", "Second"]), /Retry this section/);
 }
});
test("does not split unrelated prose or manufacture missing explanation", () => {
 assert.throws(() => validateSectionOutline(`${explanation}\n\n${explanation}`, ["First", "Second"]));
 assert.throws(() => validateSectionOutline(`### First\n\n${explanation}\n\n### Second\n\nShort.`, ["First", "Second"]), /without an explanation/);
});
test("unrequested subheadings become emphasis without changing their prose", () => {
 assert.equal(validateSectionOutline(`### Note\n\n${explanation}`, []), `**Note**\n\n${explanation}`);
});
