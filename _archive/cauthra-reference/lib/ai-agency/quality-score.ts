export const rubric = {
  audienceFit: 25,
  factualAccuracy: 25,
  linkIntegrity: 20,
  readability: 15,
  voiceAndCTA: 15,
} as const;
export function readScore(raw: string, ymyl: boolean, attempt: number) {
  const card = JSON.parse(
    raw.trim().replace(/^`{3}(?:json)?\s*|\s*`{3}$/gi, ""),
  );
  if (
    typeof card.criticalFail !== "boolean" ||
    typeof card.requiresHuman !== "boolean" ||
    typeof card.feedback !== "string" ||
    !card.feedback.trim()
  )
    throw Error("Incomplete scorecard");
  let total = 0;
  for (const [key, max] of Object.entries(rubric)) {
    const score = card.scores?.[key];
    if (!Number.isInteger(score) || score < 0 || score > max)
      throw Error("Invalid score");
    total += score;
  }
  const disposition =
    card.criticalFail || total < 70
      ? "quarantined"
      : total < 85
        ? attempt === 1
          ? "revision"
          : "quarantined"
        : ymyl || card.requiresHuman
          ? "human_review"
          : "approved";
  return {
    scores: card.scores,
    total,
    criticalFail: card.criticalFail,
    feedback: card.feedback,
    disposition,
  };
}
