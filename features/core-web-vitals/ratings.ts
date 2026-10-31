import type { VitalRating } from "./types";
export const RATING_STYLE: Record<
  VitalRating,
  { className: string; valueClass: string; panelClass: string; label: string }
> = {
  good: {
    className:
      "bg-emerald-100 text-emerald-800 dark:bg-emerald-500/15 dark:text-emerald-300",
    valueClass: "text-emerald-700 dark:text-emerald-300",
    panelClass:
      "border-emerald-300 bg-emerald-50 dark:border-emerald-700 dark:bg-emerald-950/30",
    label: "Good",
  },
  "needs-improvement": {
    className:
      "bg-amber-100 text-amber-800 dark:bg-amber-500/15 dark:text-amber-300",
    valueClass: "text-amber-700 dark:text-amber-300",
    panelClass:
      "border-amber-300 bg-amber-50 dark:border-amber-700 dark:bg-amber-950/30",
    label: "Needs improvement",
  },
  poor: {
    className:
      "bg-rose-100 text-rose-800 dark:bg-rose-500/15 dark:text-rose-300",
    valueClass: "text-rose-700 dark:text-rose-300",
    panelClass:
      "border-rose-300 bg-rose-50 dark:border-rose-700 dark:bg-rose-950/30",
    label: "Poor",
  },
  unknown: {
    className:
      "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300",
    valueClass: "text-slate-600 dark:text-slate-300",
    panelClass:
      "border-slate-300 bg-slate-50 dark:border-slate-700 dark:bg-slate-950/60",
    label: "Not available",
  },
};
export function scoreRating(score: number | null | undefined): VitalRating {
  return score == null || !Number.isFinite(score)
    ? "unknown"
    : score >= 90
      ? "good"
      : score >= 50
        ? "needs-improvement"
        : "poor";
}
const LIMITS: Record<string, [number, number]> = {
  LARGEST_CONTENTFUL_PAINT_MS: [2500, 4000],
  INTERACTION_TO_NEXT_PAINT: [200, 500],
  CUMULATIVE_LAYOUT_SHIFT_SCORE: [0.1, 0.25],
  FIRST_CONTENTFUL_PAINT_MS: [1800, 3000],
  "largest-contentful-paint": [2500, 4000],
  "cumulative-layout-shift": [0.1, 0.25],
};
export function metricRating(
  id: string,
  value: number | null | undefined,
): VitalRating {
  const limits = LIMITS[id];
  if (!limits || value == null || !Number.isFinite(value) || value < 0)
    return "unknown";
  return value <= limits[0]
    ? "good"
    : value <= limits[1]
      ? "needs-improvement"
      : "poor";
}
