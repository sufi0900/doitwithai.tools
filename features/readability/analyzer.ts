export const phraseSuggestions = [
  ["in order to", "to"],
  ["due to the fact that", "because"],
  ["at this point in time", "now"],
  ["in the event that", "if"],
  ["a large number of", "many"],
  ["with regard to", "about"],
  ["has the ability to", "can"],
  ["for the purpose of", "for"],
  ["utilize", "use"],
] as const;
export function words(text: string) {
  return text.match(/[\p{L}\p{N}]+(?:['’-][\p{L}\p{N}]+)*/gu) || [];
}
export function sentenceParts(
  text: string,
): Array<{ text: string; start: number; end: number }> {
  const Segmenter = (Intl as any).Segmenter;
  if (Segmenter)
    return Array.from(
      new Segmenter("en", { granularity: "sentence" }).segment(text),
      (p: any) => ({
        text: p.segment,
        start: p.index,
        end: p.index + p.segment.length,
      }),
    ).filter((p) => words(p.text).length);
  const parts = [];
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
export function analyzeReadability(text: string, threshold = 25) {
  const tokens = words(text);
  const sentences = sentenceParts(text).map((p) => ({
    ...p,
    count: words(p.text).length,
  }));
  const paragraphs = text
    .split(/\n\s*\n/)
    .filter((p) => p.trim())
    .map((p) => ({ text: p, words: words(p).length }));
  const phrases = phraseSuggestions.flatMap(([phrase, suggestion]) => {
    const count = (
      text.toLowerCase().match(new RegExp(`\\b${phrase}\\b`, "g")) || []
    ).length;
    return count ? [{ phrase, suggestion, count }] : [];
  });
  const frequency = new Map<string, number>();
  const stop = new Set(
    "the a an and or to of in for is it this that with as at be are was were on by your you we our can from not".split(
      " ",
    ),
  );
  for (const word of tokens) {
    const key = word.toLowerCase();
    if (key.length > 3 && !stop.has(key))
      frequency.set(key, (frequency.get(key) || 0) + 1);
  }
  const repeated = Array.from(frequency, ([word, count]) => ({ word, count }))
    .filter((x) => x.count >= 3)
    .sort((a, b) => b.count - a.count)
    .slice(0, 8);
  return {
    words: tokens.length,
    sentences,
    paragraphs,
    average: sentences.length
      ? Math.round((tokens.length / sentences.length) * 10) / 10
      : 0,
    longSentences: sentences.filter((s) => s.count > threshold),
    longParagraphs: paragraphs.filter((p) => p.words > 100),
    phrases,
    repeated,
  };
}
export function preservationChecks(
  original: string,
  revised: string,
  terms: string,
) {
  const numbers = (s: string) => s.match(/\b\d+(?:[.,]\d+)*(?:%|\b)/g) || [];
  const before = new Set(numbers(original));
  const after = new Set(numbers(revised));
  const keep = terms
    .split(/\n|,/)
    .map((t) => t.trim())
    .filter(Boolean);
  const cautions = [
    "may",
    "might",
    "could",
    "cannot",
    "must",
    "should",
    "not",
    "unless",
    "only",
  ];
  const originalWords = words(original).map((w) => w.toLowerCase());
  const revisedWords = words(revised).map((w) => w.toLowerCase());
  return {
    missingNumbers: [...before].filter((n) => !after.has(n)),
    addedNumbers: [...after].filter((n) => !before.has(n)),
    missingTerms: keep.filter((t) => {
      const escaped = t
        .normalize("NFKC")
        .replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      return !new RegExp(
        `(?:^|[^\\p{L}\\p{N}])${escaped}(?=$|[^\\p{L}\\p{N}])`,
        "iu",
      ).test(revised.normalize("NFKC"));
    }),
    missingCautions: cautions.filter(
      (w) => originalWords.includes(w) && !revisedWords.includes(w),
    ),
  };
}
