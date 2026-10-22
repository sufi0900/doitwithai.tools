import { SECTIONS, type Finding, type Section } from "./types";
/** Product checklist weights, never a model of search engine ranking factors. */
export const CATEGORY_WEIGHTS: Record<Exclude<Section, "overview">, number> = {
  search: 15,
  headings: 10,
  content: 20,
  links: 15,
  media: 5,
  technical: 15,
  schema: 10,
  "ai-search": 10,
};
const measured = (f: Finding) =>
  ["passed", "warning", "critical"].includes(f.status);
export function categoryScores(findings: Finding[]) {
  return SECTIONS.filter((s) => s.id !== "overview").map((s) => {
    const checks = findings.filter((f) => f.section === s.id && f.weight > 0);
    const possible = checks.reduce((n, f) => n + f.weight, 0);
    const assessed = checks.filter(measured).reduce((n, f) => n + f.weight, 0);
    const earned = checks
      .filter(measured)
      .reduce(
        (n, f) =>
          n +
          f.weight *
            (f.status === "passed" ? 1 : f.status === "warning" ? 0.5 : 0),
        0,
      );
    const weight = CATEGORY_WEIGHTS[s.id as keyof typeof CATEGORY_WEIGHTS];
    const coverage = possible ? assessed / possible : 0;
    return {
      ...s,
      weight,
      score:
        assessed && coverage >= 0.6
          ? Math.round((100 * earned) / assessed)
          : null,
      coverage: Math.round(100 * coverage),
      assessedWeight: weight * coverage,
      contribution: possible ? (weight * earned) / possible : 0,
      critical: findings.filter(
        (f) => f.section === s.id && f.status === "critical",
      ).length,
    };
  });
}
export function summarize(findings: Finding[], section?: Section) {
  const selected = findings.filter(
    (f) => !section || section === "overview" || f.section === section,
  );
  const categories = categoryScores(findings).filter(
    (s) => !section || section === "overview" || s.id === section,
  );
  const totalWeight = categories.reduce((n, s) => n + s.weight, 0);
  const assessedWeight = categories.reduce((n, s) => n + s.assessedWeight, 0);
  const earned = categories.reduce((n, s) => n + s.contribution, 0);
  const coverage = totalWeight
    ? Math.round((100 * assessedWeight) / totalWeight)
    : 0;
  return {
    score:
      assessedWeight && coverage >= 60
        ? Math.round((100 * earned) / assessedWeight)
        : null,
    coverage,
    provisional: coverage < 90,
    assessed: selected.filter(measured).length,
    unchecked: selected.filter((f) => f.status === "unchecked").length,
    informational: selected.filter((f) => f.status === "info").length,
    total: selected.length,
    critical: selected.filter((f) => f.status === "critical").length,
    warnings: selected.filter((f) => f.status === "warning").length,
    passed: selected.filter((f) => f.status === "passed").length,
  };
}
