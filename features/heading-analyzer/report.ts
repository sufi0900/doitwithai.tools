import type { Analysis, Heading } from "./headingLib";

export function structureScore(analysis: Analysis) {
  const visible = analysis.headings.filter((h) => !h.hidden);
  if (!visible.length) return { score: 0, checks: [] };
  const has = (code: string) => analysis.issues.some((i) => i.code === code);
  const checks = [
    {
      label: "One visible H1",
      points: 30,
      passed: visible.filter((h) => h.level === 1).length === 1,
    },
    { label: "H1 appears first", points: 15, passed: visible[0].level === 1 },
    { label: "No skipped levels", points: 25, passed: !has("skipped") },
    { label: "No empty headings", points: 15, passed: !has("empty") },
    { label: "Distinct heading text", points: 10, passed: !has("duplicate") },
    { label: "Descriptive labels", points: 5, passed: !has("generic") },
  ];
  return {
    score: checks.reduce((sum, c) => sum + (c.passed ? c.points : 0), 0),
    checks,
  };
}

export function keywordMatches(text: string, term: string) {
  const normalize = (s: string) =>
    s
      .toLowerCase()
      .replace(/[^\p{L}\p{N}\s]/gu, " ")
      .replace(/\s+/g, " ")
      .trim();
  const phrase = normalize(term);
  return Boolean(phrase) && ` ${normalize(text)} `.includes(` ${phrase} `);
}

export function suggestedLevel(heading: Heading, headings: Heading[]) {
  if (heading.hidden) return null;
  const previous = headings
    .filter((h) => !h.hidden && h.index < heading.index)
    .at(-1);
  if (!previous && heading.level !== 1) return 1;
  if (previous && heading.level > previous.level + 1) return previous.level + 1;
  return null;
}
