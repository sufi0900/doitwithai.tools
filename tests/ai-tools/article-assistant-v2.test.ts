import { test } from "node:test";
import assert from "node:assert/strict";
import { assistantContinuity, assistantLinkIntent, requestsResearch } from "../../features/writer-workspace/article-assistant";
import { articleSourceRank, preservesExamples, unsupportedArticleClaims } from "../../lib/studio/article-ai-verification";

test("real statistics, typo-heavy benchmarks and web citation follow-ups request research", () => {
  assert.equal(requestsResearch("now find any statistical data about hallucination %age of AI to add in the above section"), true);
  assert.equal(requestsResearch("find statstical benchmrk to hyperlnk"), true);
  assert.deepEqual(assistantLinkIntent("find practical web sources to hyperlink"), { internal: false, authority: true });
  assert.deepEqual(assistantLinkIntent("add internal links from my site"), { internal: true, authority: false });
  assert.equal(requestsResearch("don't search for statistics"), false);
});

test("continuity protects constraints and the working proposal through casual turns", () => {
  const context = assistantContinuity([
    { id: "1", question: "Keep the technical term.", answer: { reply: "Understood.", cards: [] } },
    { id: "2", question: "Draft the example", answer: { reply: "Drafted.", cards: [], turnContext: { topic: "Technical example", linkScope: "none" } },
      proposal: { kind: "insert-section", markdown: "## Example\n<keyword_matrix>data</keyword_matrix>", status: "pending", revision: "x" } },
    { id: "3", question: "Thanks", answer: { reply: "You’re welcome.", cards: [] } },
  ]);
  assert.equal(context.focus.topic, "Technical example");
  assert.equal(context.focus.constraints[0], "Keep the technical term.");
  assert.match(context.focus.proposal?.markdown || "", /keyword_matrix/);
});

test("explicit subject switch clears prior editing context", () => {
  const context = assistantContinuity([
    { id: "1", question: "Keep the old example", answer: { reply: "Okay", cards: [] },
      proposal: { kind: "passage", markdown: "Old", status: "pending", revision: "x" } },
    { id: "2", question: "Now explain the introduction", answer: { reply: "Here is why.", cards: [],
      turnContext: { topic: "Introduction", linkScope: "none", referent: "switch" } } },
  ]);
  assert.equal(context.focus.proposal, undefined);
  assert.deepEqual(context.focus.constraints, []);
});

test("verified publisher candidates exclude the user's site, social sources and lookalike hosts", () => {
  for (const site of ["https://arxiv.org/abs/123", "https://hai.stanford.edu/report", "https://github.com/vectara/hallucination-leaderboard", "https://www.pewresearch.org/report"])
    assert.ok(articleSourceRank(site, "doitwithai.tools") >= 2, site);
  for (const site of ["https://docs.doitwithai.tools/page", "https://www.reddit.com/a", "https://fakearxiv.org/abs"])
    assert.ok(articleSourceRank(site, "doitwithai.tools") < 2, site);
});

test("a proposed statistic needs a nearby source marker and a matching fetched figure", () => {
  const source = { url: "https://hai.stanford.edu/report", title: "Study", text: "In the tested population, 15% failed.", kind: "page text" as const };
  assert.equal(unsupportedArticleClaims("The rate was 3% to 15% [S1].", "", [source]), true);
  assert.equal(unsupportedArticleClaims("The rate was 15% [S1].", "", [{ ...source, kind: "search excerpt" }]), true);
  assert.equal(unsupportedArticleClaims("The rate was 15% [S2].", "", [source]), true);
  assert.equal(unsupportedArticleClaims("The rate was 15% [Primary study][S1].", "", [source]), false);
  assert.equal(unsupportedArticleClaims("Keep the existing 15% qualifier.", "Existing 15% qualifier.", []), false);
});

test("evidence edits preserve the earlier example verbatim", () => {
  const original = "<keyword_matrix>data</keyword_matrix>";
  assert.equal(preservesExamples(original, original + "\nA citation follows."), true);
  assert.equal(preservesExamples(original, "<keyword_matrix>replacement</keyword_matrix>"), false);
});
