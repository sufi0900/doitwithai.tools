import type { IntentItem, IntentReport } from "./schema";

// Named labels, rich color themes, and descriptions keep meaning clear and scannable.
export const intentPresentation: Record<
  IntentItem["primary"],
  {
    classes: string;
    border: string;
    cardBg: string;
    accentText: string;
    badgeDot: string;
    serpFeature: string;
    meaning: string;
  }
> = {
  Informational: {
    classes:
      "border-sky-400/50 bg-sky-500/20 text-sky-100 shadow-sm shadow-sky-500/10",
    border: "border-t-sky-400",
    cardBg: "from-sky-950/35 via-slate-950/90 to-slate-950/95",
    accentText: "text-sky-300",
    badgeDot: "bg-sky-400",
    serpFeature: "AI Overviews · Featured Snippet · Step-by-Step Guide",
    meaning:
      "The reader wants to learn, understand a concept, or follow a step-by-step tutorial.",
  },
  Navigational: {
    classes:
      "border-violet-400/50 bg-violet-500/20 text-violet-100 shadow-sm shadow-violet-500/10",
    border: "border-t-violet-400",
    cardBg: "from-violet-950/35 via-slate-950/90 to-slate-950/95",
    accentText: "text-violet-300",
    badgeDot: "bg-violet-400",
    serpFeature: "Site Links · Brand Portal · Direct Account / Login Page",
    meaning:
      "The reader wants to reach a specific brand, login portal, or official destination.",
  },
  "Commercial investigation": {
    classes:
      "border-amber-400/55 bg-amber-500/20 text-amber-100 shadow-sm shadow-amber-500/10",
    border: "border-t-amber-400",
    cardBg: "from-amber-950/35 via-slate-950/90 to-slate-950/95",
    accentText: "text-amber-300",
    badgeDot: "bg-amber-400",
    serpFeature: "Comparison Matrix · Local Map Pack · Reviews & Shortlists",
    meaning:
      "The reader wants to compare options, local agencies, or reviews before choosing.",
  },
  Transactional: {
    classes:
      "border-emerald-400/55 bg-emerald-500/20 text-emerald-100 shadow-sm shadow-emerald-500/10",
    border: "border-t-emerald-400",
    cardBg: "from-emerald-950/35 via-slate-950/90 to-slate-950/95",
    accentText: "text-emerald-300",
    badgeDot: "bg-emerald-400",
    serpFeature: "Interactive Web Tool · Service Booking · Product Action Page",
    meaning:
      "The reader wants to complete an immediate action, use a tool, buy, or hire.",
  },
  "Mixed / unclear": {
    classes:
      "border-rose-400/45 bg-rose-500/15 text-rose-100 shadow-sm shadow-rose-500/10",
    border: "border-t-rose-400",
    cardBg: "from-rose-950/25 via-slate-950/90 to-slate-950/95",
    accentText: "text-rose-300",
    badgeDot: "bg-rose-400",
    serpFeature: "Split SERP Mix · Pillar Hub Page Needed",
    meaning:
      "Several tasks may fit, or the wording needs more context from live SERP results.",
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
