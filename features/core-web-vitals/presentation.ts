import type { Metric, PageSpeedResult } from "./types";
export const CORE_METRICS = [
  {
    id: "LARGEST_CONTENTFUL_PAINT_MS",
    labId: "largest-contentful-paint",
    name: "Loading (LCP)",
    goal: "Good at 2.5 seconds or less",
    help: "How quickly the main content becomes visible.",
  },
  {
    id: "INTERACTION_TO_NEXT_PAINT",
    labId: "total-blocking-time",
    name: "Responsiveness (INP)",
    goal: "Good at 200 milliseconds or less",
    help: "How quickly the page responds to visitor interactions.",
  },
  {
    id: "CUMULATIVE_LAYOUT_SHIFT_SCORE",
    labId: "cumulative-layout-shift",
    name: "Visual stability (CLS)",
    goal: "Good at 0.1 or less",
    help: "Whether visible content shifts unexpectedly.",
  },
];
export function hasMeasurement(metric: Metric | undefined): metric is Metric {
  return Boolean(
    metric &&
    metric.displayValue &&
    !/^(no data|not available|n\/a)$/i.test(metric.displayValue.trim()),
  );
}
export function coreCards(result: PageSpeedResult) {
  return CORE_METRICS.map((definition) => {
    const field = result.fieldData.metrics.find((m) => m.id === definition.id);
    if (hasMeasurement(field))
      return {
        ...definition,
        metric: field,
        source: "field" as const,
        note:
          result.fieldData.source === "origin"
            ? "Real visitors across this origin"
            : "Real visitors to this page",
      };
    const lab = result.labMetrics.find((m) => m.id === definition.labId);
    const diagnostic = definition.id === "INTERACTION_TO_NEXT_PAINT";
    return {
      ...definition,
      name:
        diagnostic && hasMeasurement(lab)
          ? "Main-thread blocking (TBT)"
          : definition.name,
      goal: diagnostic
        ? "INP requires real visitor interactions"
        : definition.goal,
      help: diagnostic
        ? "TBT is a separate lab diagnostic. It is not an INP measurement."
        : definition.help,
      metric: hasMeasurement(lab) ? lab : undefined,
      source: hasMeasurement(lab)
        ? diagnostic
          ? ("diagnostic" as const)
          : ("lab" as const)
        : ("missing" as const),
      note: diagnostic
        ? "No real-user INP data"
        : "No real-user data; lab measurement shown",
    };
  });
}
