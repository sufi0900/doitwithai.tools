import type { Claim, Review } from "../content-evidence/analyze";
import { validateReview as validateDecision } from "../content-evidence/analyze";
import {
  validateReview,
  type EditorialReview,
} from "../on-page-analyzer/review";
export function claimReviewInput(claim: Claim, decision: Review) {
  const issue = validateDecision({ ...decision, status: "pending" });
  if (issue) throw new Error(issue);
  const blocks = [
    { id: "block:0", tag: "h2", text: claim.section.slice(0, 500) },
    { id: "block:1", tag: "p", text: claim.text.slice(0, 1600) },
  ];
  if (decision.note.trim())
    blocks.push({
      id: "block:2",
      tag: "p",
      text: `Reviewer-supplied source note, not independently verified: ${decision.note}`.slice(
        0,
        1600,
      ),
    });
  return {
    title: "Selected claim editorial review",
    audience:
      "Review clarity, attribution, and evidence gaps. Supplied notes are unverified. Do not certify factual accuracy.",
    blocks,
  };
}
export async function reviewClaim(
  claim: Claim,
  decision: Review,
  signal: AbortSignal,
): Promise<EditorialReview> {
  const input = claimReviewInput(claim, decision);
  const response = await fetch("/api/ai-tools/on-page/review", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
    signal,
  });
  const payload = await response.json().catch(() => null);
  if (!response.ok || !payload?.result)
    throw new Error(
      payload?.error?.message ||
        "The selected passage could not be reviewed. Your report is preserved.",
    );
  return validateReview(payload.result, input.blocks);
}
