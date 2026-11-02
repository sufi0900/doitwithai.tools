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
import { words, sentenceParts } from "./engine/text";
export { words, sentenceParts };
export function analyzeReadability(text: string, threshold = 25) {
  const tokens = words(text);
  const sentences = sentenceParts(text).map((p) => ({
    ...p,
    count: words(p.text).length,
  }));
  const paragraphs = text
    .split(/\n\s*\n/)
    .filter((p) => p.trim())
    .map((p) => ({
      text: p,
      words: words(p).length,
      sentences: sentenceParts(p).length,
    }));
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
const listLine = /^\s*(?:[-*•]|\d+[.)])\s+/;
export function flowObservations(text: string) {
  const analysis = analyzeReadability(text);
  // Lists and labels have a different rhythm from continuous prose.
  const prose = analysis.sentences.filter((s) => {
    const lineStart = text.lastIndexOf("\n", Math.max(0, s.start - 1)) + 1;
    const nextBreak = text.indexOf("\n", s.start);
    const line = text.slice(lineStart, nextBreak < 0 ? text.length : nextBreak);
    return !listLine.test(line) && !/:\s*$/.test(s.text) && !/^\s*#/.test(line);
  });
  const lengths = prose.map((s) => s.count);
  const windows = prose.flatMap((s, i) => {
    const run = prose.slice(i, i + 4);
    if (run.length < 4) return [];
    const span = text.slice(s.start, run[3].end);
    if (
      /\n\s*\n/.test(span) ||
      span.split(/\r?\n/).some((line) => listLine.test(line))
    )
      return [];
    const counts = run.map((part) => part.count);
    return [{ min: Math.min(...counts), max: Math.max(...counts) }];
  });
  const proseParagraphs = analysis.paragraphs.filter(
    (p) =>
      !p.text.split(/\r?\n/).some((line) => listLine.test(line)) &&
      !/:\s*$/.test(p.text) &&
      !/^\s*#/.test(p.text),
  );
  return {
    lengths,
    minimum: lengths.length ? Math.min(...lengths) : 0,
    maximum: lengths.length ? Math.max(...lengths) : 0,
    bands: [
      { label: "1–8 words", count: lengths.filter((n) => n <= 8).length },
      {
        label: "9–16 words",
        count: lengths.filter((n) => n >= 9 && n <= 16).length,
      },
      {
        label: "17–25 words",
        count: lengths.filter((n) => n >= 17 && n <= 25).length,
      },
      { label: "Over 25", count: lengths.filter((n) => n > 25).length },
    ],
    shortRun: windows.some((run) => run.max <= 8),
    similarRun: windows.some((run) => run.max - run.min <= 3),
    denseParagraphs: proseParagraphs.filter(
      (p) => p.words > 100 || p.sentences > 4,
    ).length,
    singleSentenceRun:
      proseParagraphs.length >= 4 &&
      proseParagraphs.every((p) => p.sentences === 1),
    inlineColonParagraphs: proseParagraphs.filter(
      (p) => (p.text.match(/:(?=\s+\S)/g) || []).length >= 2,
    ).length,
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
