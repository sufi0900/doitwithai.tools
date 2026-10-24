import type { IntentItem, IntentReport } from "./schema";

// Named labels and descriptions keep meaning available without relying on color.
export const intentPresentation: Record<
  IntentItem["primary"],
  {
    classes: string;
    border: string;
    meaning: string;
  }
> = {
  Informational: {
    classes: "border-blue-300/40 bg-blue-400/15 text-blue-100",
    border: "border-t-blue-400",
    meaning: "The reader wants to learn or understand something.",
  },
  Navigational: {
    classes: "border-violet-300/40 bg-violet-400/15 text-violet-100",
    border: "border-t-violet-400",
    meaning: "The reader wants to reach a specific destination.",
  },
  "Commercial investigation": {
    classes: "border-amber-300/40 bg-amber-400/15 text-amber-100",
    border: "border-t-amber-400",
    meaning: "The reader wants to compare options before choosing.",
  },
  Transactional: {
    classes: "border-emerald-300/40 bg-emerald-400/15 text-emerald-100",
    border: "border-t-emerald-400",
    meaning: "The reader wants to complete an action.",
  },
  "Mixed / unclear": {
    classes: "border-slate-300/40 bg-slate-400/15 text-slate-100",
    border: "border-t-slate-400",
    meaning: "Several tasks may fit, or the wording needs more context.",
  },
};
export function reportBasis(report: IntentReport) {
  if (report.method === "Rule-based estimate")
    return "Keyword wording estimate";
  if (report.method === "AI review of pasted notes")
    return "AI review of your result notes";
  return "AI interpretation of your keywords";
}
export function copyReport(report: IntentReport) {
  return [
    reportBasis(report),
    report.notice,
    ...report.items.map((item) =>
      [
        item.keyword,
        `Likely intent: ${item.primary}`,
        item.secondary ? `Possible secondary intent: ${item.secondary}` : "",
        `Reader task: ${item.task}`,
        `Page format: ${item.format}`,
        `Content angle: ${item.angle}`,
        `Next step: ${item.nextStep}`,
        `What to verify: ${item.uncertainty}`,
        `Supporting cues: ${item.evidence.map((cue) => `${cue.source}: “${cue.quote}”`).join("; ") || "No explicit cue"}`,
      ]
        .filter(Boolean)
        .join("\n"),
    ),
  ].join("\n\n");
}
