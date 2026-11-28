export function normalizeTrackedTerm(term: string) {
  return term.trim().replace(/\s+/gu, " ");
}

export function termMatcher(term: string): RegExp | null {
  const clean = normalizeTrackedTerm(term);
  if (clean.length < 2) return null;
  const phrase = clean.split(" ").map((part) =>
    part.replace(/[.*+?^$(){}|[\]\\]/g, "\\$&"),
  ).join("\\s+");
  const boundary = "[\\p{L}\\p{N}\\p{M}]";
  return new RegExp("(?<!" + boundary + ")" + phrase + "(?!" + boundary + ")", "giu");
}
