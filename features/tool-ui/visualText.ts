/** Wrap every word, marking overflow instead of silently dropping the last sentence. */
export function wrapVisualText(
  value: string,
  maxChars: number,
  maxLines: number,
): string[] {
  const words = String(value || "")
    .trim()
    .split(/\s+/)
    .filter(Boolean);
  const lines: string[] = [];
  let line = "";
  for (let i = 0; i < words.length; i++) {
    const candidate = line ? `${line} ${words[i]}` : words[i];
    if (candidate.length > maxChars && line) {
      if (lines.length === maxLines - 1) {
        lines.push(`${line.replace(/[.,;:]$/, "")}…`);
        return lines;
      }
      lines.push(line);
      line = words[i];
    } else line = candidate;
  }
  if (line && lines.length < maxLines)
    lines.push(
      line.length > maxChars + 8 ? `${line.slice(0, maxChars - 1)}…` : line,
    );
  return lines.length ? lines : [""];
}

export function sourceMetric(text: string): string {
  return (
    text.match(/[+-]?\d+(?:\.\d+)?%|\b\d+(?:\.\d+)?x\b|\$\d[\d,.]*/i)?.[0] || ""
  );
}

export function percentageMetric(value?: string): number | null {
  const match = String(value || "")
    .trim()
    .match(/^([+-]?\d+(?:\.\d+)?)\s*%$/);
  if (!match) return null;
  const number = Number(match[1]);
  return number >= 0 && number <= 100 ? number : null;
}
