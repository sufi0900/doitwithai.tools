import { test } from "node:test";
import assert from "node:assert/strict";
import {
  defaultState as robotsState,
  buildRobotsTxt,
  parseRobotsTxt,
} from "../../features/robots-generator/generator";
import {
  defaultState as llmsState,
  buildLlmsTxt,
} from "../../features/llms-txt-generator/generator";
import { analyzeDocument } from "../../features/citation-readiness/analyzer";
import { extractFromText } from "../../features/citation-readiness/extract-from-text";
test("imported robots builder preserves rules through import and export", () => {
  const output = buildRobotsTxt(robotsState());
  assert.match(output, /User-agent: \*/);
  assert.match(output, /Disallow: \/wp-admin\//);
  assert.equal(buildRobotsTxt(parseRobotsTxt(output)), output);
});
test("imported llms builder includes supplied site information", () => {
  const state = llmsState();
  state.site.siteName = "Example Site";
  state.site.summary = "Useful documentation";
  const output = buildLlmsTxt(state);
  assert.match(output, /^# Example Site/);
  assert.match(output, /> Useful documentation/);
});
test("imported citation checker gives bounded results and marks missing HTML signals", () => {
  const result = analyzeDocument(
    extractFromText(
      "# A useful guide\n\nThis guide explains the topic clearly.\n\n## Steps\n\n- Review the evidence\n- Check the source",
    ),
  );
  assert.equal(result.score, null);
  assert.match(result.scoreReason, /individual evidence/);
  assert.equal(result.checks.length, 12);
  assert.ok(result.checks.some((c) => c.status === "na"));
});
