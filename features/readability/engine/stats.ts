import {
  annotate,
  ariGrade,
  issueTypes,
  scoreSentences,
  type Annotation,
  type IssueType,
  type SentenceInfo,
} from "./annotate";
import { codeRanges, countSyllables, words } from "./text";

export const READING_WPM = 238;
export const SPEAKING_WPM = 150;

export type TargetPreset = { id: string; label: string; grade: number };
export const targetPresets: TargetPreset[] = [
  { id: "general", label: "General web readers (grade 9)", grade: 9 },
  { id: "professional", label: "Professional readers (grade 11)", grade: 11 },
  { id: "technical", label: "Technical readers (grade 13)", grade: 13 },
];

export type Feedback = {
  id: string;
  level: "high" | "medium" | "low";
  text: string;
};

export type DocumentAnalysis = {
  sentences: SentenceInfo[];
  annotations: Annotation[];
  counts: Record<IssueType, number>;
  words: number;
  characters: number;
  charactersNoSpaces: number;
  sentenceCount: number;
  paragraphs: number;
  grade: number;
  fleschEase: number | null;
  fleschKincaid: number | null;
  averageSentenceWords: number;
  longestSentenceWords: number;
  longSentences: number;
  readingSeconds: number;
  speakingSeconds: number;
  bands: Array<{ label: string; count: number }>;
};

export function gradeLabel(grade: number, hasText: boolean) {
  if (!hasText) return "Add text to see an estimate.";
  if (grade <= 6) return "Very easy to read.";
  if (grade <= 9) return "Good for most readers.";
  if (grade <= 12) return "Getting dense.";
  return "Hard to read.";
}

export function formatDuration(seconds: number) {
  if (seconds <= 0) return "0 sec";
  if (seconds < 60) return `${seconds} sec`;
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return s ? `${m} min ${s} sec` : `${m} min`;
}

export function analyzeDocument(
  text: string,
  options: { longThreshold?: number; targetGrade?: number } = {},
): DocumentAnalysis {
  const longThreshold = options.longThreshold ?? 25;
  const sentences = scoreSentences(text, options.targetGrade ?? 9);
  const annotations = annotate(text, sentences);

  const counts = Object.fromEntries(issueTypes.map((t) => [t, 0])) as Record<
    IssueType,
    number
  >;
  for (const a of annotations) counts[a.type]++;

  const code = codeRanges(text);
  const prose = code.length
    ? code.reduceRight(
        (t, [a, b]) => t.slice(0, a) + " ".repeat(b - a) + t.slice(b),
        text,
      )
    : text;
  const tokens = words(prose);
  const letters = sentences.reduce((n, s) => n + s.letters, 0);
  const wordCount = sentences.reduce((n, s) => n + s.words, 0);
  const sentenceCount = sentences.length;
  const syllables = tokens.reduce((n, w) => n + countSyllables(w), 0);
  const perSentence = sentenceCount ? wordCount / sentenceCount : 0;
  const perWord = wordCount ? syllables / wordCount : 0;
  const lengths = sentences.map((s) => s.words);

  return {
    sentences,
    annotations,
    counts,
    words: wordCount,
    characters: text.length,
    charactersNoSpaces: text.replace(/\s/g, "").length,
    sentenceCount,
    paragraphs: prose.split(/\n\s*\n/).filter((p) => p.trim()).length,
    grade: ariGrade(letters, wordCount, sentenceCount),
    fleschEase: sentenceCount
      ? Math.round((206.835 - 1.015 * perSentence - 84.6 * perWord) * 10) / 10
      : null,
    fleschKincaid: sentenceCount
      ? Math.max(0, Math.round((0.39 * perSentence + 11.8 * perWord - 15.59) * 10) / 10)
      : null,
    averageSentenceWords: Math.round(perSentence * 10) / 10,
    longestSentenceWords: lengths.length ? Math.max(...lengths) : 0,
    longSentences: lengths.filter((n) => n > longThreshold).length,
    readingSeconds: Math.round((wordCount / READING_WPM) * 60),
    speakingSeconds: Math.round((wordCount / SPEAKING_WPM) * 60),
    bands: [
      { label: "1 to 8 words", count: lengths.filter((n) => n <= 8).length },
      { label: "9 to 16 words", count: lengths.filter((n) => n >= 9 && n <= 16).length },
      { label: "17 to 25 words", count: lengths.filter((n) => n >= 17 && n <= 25).length },
      { label: "Over 25 words", count: lengths.filter((n) => n > 25).length },
    ],
  };
}

const plural = (n: number, one: string, many = `${one}s`) =>
  `${n} ${n === 1 ? one : many}`;

/** Editing allowances are product choices, not readability standards. */
export function allowances(a: Pick<DocumentAnalysis, "words" | "sentenceCount">) {
  return {
    adverbs: Math.max(1, Math.ceil(a.words / 80)),
    passive: Math.max(1, Math.ceil(a.sentenceCount * 0.15)),
    weakeners: Math.max(1, Math.ceil(a.words / 100)),
  };
}

export function buildFeedback(a: DocumentAnalysis, target: number): Feedback[] {
  if (!a.sentenceCount) return [];
  const limit = allowances(a);
  const hardShare = (a.counts.hard + a.counts.veryHard) / a.sentenceCount;
  const items: Feedback[] = [];

  if (a.grade > target)
    items.push({
      id: "grade",
      level: a.grade > target + 2 ? "high" : "medium",
      text: `The estimated grade is ${a.grade}, above your target of ${target}. Start with the red sentences, then the amber ones.`,
    });
  if (a.counts.veryHard)
    items.push({
      id: "veryHard",
      level: "high",
      text: `${plural(a.counts.veryHard, "sentence")} marked very hard. Split each one at a change of idea, or cut words.`,
    });
  if (hardShare > 0.2)
    items.push({
      id: "hardShare",
      level: "medium",
      text: `${Math.round(hardShare * 100)} percent of sentences are hard or very hard. Mix in shorter sentences to give readers a rest.`,
    });
  if (a.counts.passive > limit.passive)
    items.push({
      id: "passive",
      level: "medium",
      text: `${plural(a.counts.passive, "use")} of passive voice. Try to stay near ${limit.passive}. Name the person or thing doing the action.`,
    });
  if (a.counts.adverb > limit.adverbs)
    items.push({
      id: "adverb",
      level: "low",
      text: `${plural(a.counts.adverb, "adverb")} found. Try to stay near ${limit.adverbs}. A stronger verb often does the same job.`,
    });
  if (a.counts.weakener > limit.weakeners)
    items.push({
      id: "weakener",
      level: "low",
      text: `${plural(a.counts.weakener, "weakening word")} found. Cut the ones that do not protect accuracy.`,
    });
  if (a.counts.simpler)
    items.push({
      id: "simpler",
      level: "low",
      text: `${plural(a.counts.simpler, "word or phrase", "words or phrases")} with a simpler option. Swap them when the meaning stays the same.`,
    });
  if (!items.length)
    items.push({
      id: "clear",
      level: "low",
      text: "No urgent cues. Read the text aloud once to check rhythm and flow.",
    });
  const order = { high: 0, medium: 1, low: 2 };
  return items.sort((x, y) => order[x.level] - order[y.level]).slice(0, 5);
}
