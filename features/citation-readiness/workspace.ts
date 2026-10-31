import type { PageSnapshot } from "../on-page-analyzer/types";
import { answerReadiness } from "../on-page-analyzer/readiness";
import { citationReview } from "./review";
import {
  EMPTY_REVIEW,
  reviewProgress,
  validateReview,
  type Review,
} from "../content-evidence/analyze";
export const CATEGORIES = [
  { id: "overview", name: "Overview" },
  { id: "access", name: "Crawler access" },
  { id: "content", name: "Content structure" },
  { id: "claims", name: "Claims and authorship" },
  { id: "schema", name: "Markup and files" },
  { id: "performance", name: "Performance" },
] as const;
export type Category = (typeof CATEGORIES)[number]["id"];
export type PassageFlag = {
  id: string;
  blockId: string;
  index: number;
  kind: "claim" | "opening" | "length";
  label: string;
  detail: string;
};
export function passageFlags(page: PageSnapshot): PassageFlag[] {
  const report = citationReview(page),
    answers = answerReadiness(page),
    flags: PassageFlag[] = [];
  const positions = new Map(page.blocks.map((b, index) => [b.id, index]));
  for (const claim of report.claims)
    flags.push({
      id: `claim:${claim.id}`,
      blockId: claim.id,
      index: positions.get(claim.id)!,
      kind: "claim",
      label: "Check claim evidence",
      detail: claim.sources.length
        ? "Nearby sources are candidates, not verified support."
        : "No nearby source candidate was extracted. Evidence may exist elsewhere.",
    });
  for (const opening of [answers.opening, ...answers.sections])
    if (opening.status === "review" && opening.passage)
      flags.push({
        id: `opening:${opening.passage.id}`,
        blockId: opening.passage.id,
        index: positions.get(opening.passage.id)!,
        kind: "opening",
        label: opening.label,
        detail: opening.reason,
      });
  page.blocks.forEach((block, index) => {
    const count = block.text.trim().split(/\s+/).filter(Boolean).length;
    if (block.tag === "p" && count > 150)
      flags.push({
        id: `length:${block.id}`,
        blockId: block.id,
        index,
        kind: "length",
        label: "Review a dense paragraph",
        detail: `${count} words. Our 150-word editorial cue is not a citation requirement.`,
      });
  });
  return flags;
}
export function evidenceCoverage(
  rows: ReturnType<typeof citationReview>["rows"],
) {
  const measured = rows.filter((r) => !r.optional),
    available = measured.filter((r) => r.state !== "unknown").length;
  return {
    available,
    total: measured.length,
    percentage: measured.length
      ? Math.round((100 * available) / measured.length)
      : null,
  };
}
export function categoryRows(
  report: ReturnType<typeof citationReview>,
  category: Category,
) {
  return report.rows.filter((r) =>
    category === "access"
      ? ["response", "indexing", "snippets"].includes(r.id) ||
        r.id.startsWith("crawler-")
      : category === "content"
        ? ["openings", "structure", "paragraphs"].includes(r.id)
        : category === "claims"
          ? ["sources", "attribution"].includes(r.id)
          : category === "schema"
            ? ["schema", "llms"].includes(r.id)
            : true,
  );
}
export function cleanReviews(
  page: PageSnapshot,
  reviews: Record<string, Review>,
) {
  return Object.fromEntries(
    citationReview(page).claims.flatMap((claim) => {
      const review = reviews[claim.id];
      return review && !validateReview(review)
        ? [
            [
              claim.id,
              {
                ...review,
                note: review.note.slice(0, 2000),
                evidenceUrl: review.evidenceUrl.slice(0, 2048),
              },
            ],
          ]
        : [];
    }),
  ) as Record<string, Review>;
}
export function workspaceReport(
  page: PageSnapshot,
  reviews: Record<string, Review>,
) {
  const report = citationReview(page),
    manualReviews = cleanReviews(page, reviews);
  return {
    ...report,
    coverage: evidenceCoverage(report.rows),
    manualReviews,
    manualProgress: reviewProgress(report.claims, manualReviews),
    manualLimit:
      "Manual decisions are supplied by the reviewer. They do not establish factual accuracy or increase citation likelihood.",
  };
}
export function markerTone(
  blockId: string,
  flags: PassageFlag[],
  reviews: Record<string, Review>,
) {
  const state = (reviews[blockId] || EMPTY_REVIEW).status;
  if (state === "revise") return "revision";
  if (flags.some((f) => f.blockId === blockId && f.kind !== "claim"))
    return "review";
  if (state === "recorded") return "recorded";
  if (state === "dismissed") return "dismissed";
  return flags.some((f) => f.blockId === blockId) ? "review" : null;
}
export function articleMarkerTones(
  flags: PassageFlag[],
  reviews: Record<string, Review>,
) {
  const pending = new Set<string>(),
    other = new Set<string>();
  for (const flag of flags) {
    pending.add(flag.blockId);
    if (flag.kind !== "claim") other.add(flag.blockId);
  }
  const tones = new Map<string, string>();
  for (const id of new Set([...pending, ...Object.keys(reviews)])) {
    const state = reviews[id]?.status;
    if (state === "revise") tones.set(id, "revision");
    else if (other.has(id)) tones.set(id, "review");
    else if (state === "recorded") tones.set(id, "recorded");
    else if (state === "dismissed") tones.set(id, "dismissed");
    else if (pending.has(id)) tones.set(id, "review");
  }
  return tones;
}
