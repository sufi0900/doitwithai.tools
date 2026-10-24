export type SentencePart = { text: string; start: number; end: number };

/** Unicode word tokens, including internal apostrophes and hyphens. */
export function words(text: string): string[] {
  return text.match(/[\p{L}\p{N}]+(?:['’-][\p{L}\p{N}]+)*/gu) || [];
}

/**
 * Splits text into sentence segments and keeps source offsets.
 * Explicit line breaks always end a segment, which keeps lists and headings apart.
 */
export function sentenceParts(text: string): SentencePart[] {
  const Segmenter = (Intl as any).Segmenter;
  if (Segmenter) {
    const segmenter = new Segmenter("en", { granularity: "sentence" });
    return Array.from(text.matchAll(/[^\r\n]+(?:\r?\n|$)/g)).flatMap((line) =>
      Array.from(segmenter.segment(line[0]), (p: any) => ({
        text: p.segment as string,
        start: line.index! + p.index,
        end: line.index! + p.index + p.segment.length,
      })).filter((p) => words(p.text).length),
    );
  }
  const parts: SentencePart[] = [];
  const pattern = /[^.!?\n]+(?:[.!?]+["')]*|\n|$)/g;
  let match;
  while ((match = pattern.exec(text)))
    if (words(match[0]).length)
      parts.push({
        text: match[0],
        start: match.index,
        end: match.index + match[0].length,
      });
  return parts;
}

/** Counts letters and digits only. Used by the ARI grade formula. */
export function letterCount(word: string) {
  return (word.match(/[\p{L}\p{N}]/gu) || []).length;
}

/**
 * Approximate English syllable count. This is a heuristic, so every
 * score built on it is labelled as an estimate.
 */
export function countSyllables(word: string) {
  const w = word.toLowerCase().replace(/[^a-z]/g, "");
  if (!w) return 1;
  if (w.length <= 3) return 1;
  let s = w
    .replace(/(?:[^laeiouy]es|ed|[^laeiouy]e)$/, "")
    .replace(/^y/, "");
  const groups = s.match(/[aeiouy]{1,2}/g);
  return Math.max(1, groups ? groups.length : 1);
}

/** Ranges of fenced code blocks. Code is not prose, so it is skipped. */
export function codeRanges(text: string): Array<[number, number]> {
  const ranges: Array<[number, number]> = [];
  const fence = /^[ \t]*(```|~~~).*$/gm;
  let open: number | null = null;
  let m: RegExpExecArray | null;
  while ((m = fence.exec(text))) {
    if (open === null) open = m.index;
    else {
      ranges.push([open, m.index + m[0].length]);
      open = null;
    }
  }
  if (open !== null) ranges.push([open, text.length]);
  return ranges;
}

export function inRanges(pos: number, ranges: Array<[number, number]>) {
  return ranges.some(([a, b]) => pos >= a && pos < b);
}

export function isHeadingLine(text: string, offset: number) {
  const lineStart = text.lastIndexOf("\n", Math.max(0, offset - 1)) + 1;
  const next = text.indexOf("\n", offset);
  const line = text.slice(lineStart, next < 0 ? text.length : next);
  return /^\s{0,3}#{1,6}\s/.test(line);
}
