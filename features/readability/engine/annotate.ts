import {
  beForms,
  irregularParticiples,
  notAdverbs,
  notParticiples,
  simplerAlternatives,
  weakeners,
} from "./lexicons";
import {
  codeRanges,
  inRanges,
  isHeadingLine,
  letterCount,
  sentenceParts,
  words,
} from "./text";

export type IssueType =
  | "veryHard"
  | "hard"
  | "simpler"
  | "adverb"
  | "passive"
  | "weakener";

export const issueTypes: IssueType[] = [
  "veryHard",
  "hard",
  "passive",
  "adverb",
  "weakener",
  "simpler",
];

export type Annotation = {
  id: string;
  type: IssueType;
  start: number;
  end: number;
  message: string;
  /** Plain-text replacement. null means "delete the span". undefined means no automatic fix. */
  replacement?: string | null;
  sentenceIndex: number;
};

export type SentenceInfo = {
  index: number;
  start: number;
  end: number;
  text: string;
  words: number;
  letters: number;
  level: number;
  heading: boolean;
  flag: "veryHard" | "hard" | null;
};

/** Hemingway-style ARI grade. Formula: 4.71 * (letters / words) + 0.5 * (words / sentences) - 21.43. */
export function ariGrade(letters: number, wordCount: number, sentenceCount: number) {
  if (!wordCount || !sentenceCount) return 0;
  const raw =
    4.71 * (letters / wordCount) + 0.5 * (wordCount / sentenceCount) - 21.43;
  return Math.max(0, Math.round(raw));
}

/** Sentences shorter than 14 words are never flagged. Hard starts one grade above the target; very hard starts five grades above. */
export function classifySentence(wordCount: number, level: number, targetGrade = 9) {
  if (wordCount < 14) return null;
  if (level >= targetGrade + 5) return "veryHard" as const;
  if (level >= targetGrade + 1) return "hard" as const;
  return null;
}

export function scoreSentences(text: string, targetGrade = 9): SentenceInfo[] {
  const code = codeRanges(text);
  const result: SentenceInfo[] = [];
  for (const part of sentenceParts(text)) {
    if (inRanges(part.start, code)) continue;
    const tokens = words(part.text);
    if (!tokens.length) continue;
    const letters = tokens.reduce((n, w) => n + letterCount(w), 0);
    const level = ariGrade(letters, tokens.length, 1);
    const heading = isHeadingLine(text, part.start);
    const trimmed = part.text.replace(/\s+$/, "");
    result.push({
      index: result.length,
      start: part.start,
      end: part.start + trimmed.length,
      text: trimmed,
      words: tokens.length,
      letters,
      level,
      heading,
      flag: heading ? null : classifySentence(tokens.length, level, targetGrade),
    });
  }
  return result;
}

const escape = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
const phrasePattern = (list: string[]) =>
  new RegExp(
    `(?<![\\p{L}\\p{N}])(?:${[...list]
      .sort((a, b) => b.length - a.length)
      .map((p) => escape(p).replace(/\s+/g, "\\s+"))
      .join("|")})(?![\\p{L}\\p{N}])`,
    "giu",
  );

const simplerPattern = phrasePattern(Object.keys(simplerAlternatives));
const weakenerPattern = phrasePattern(weakeners);
const adverbPattern = /(?<![\p{L}])[\p{L}]{3,}ly(?![\p{L}])/giu;
const passivePattern = new RegExp(
  `(?<![\\p{L}])(?:${beForms.join("|")})\\s+(?:[\\p{L}]+ly\\s+)?([\\p{L}]+)(?![\\p{L}])`,
  "giu",
);

type Candidate = Omit<Annotation, "id" | "sentenceIndex"> & { priority: number };

function matchCase(source: string, replacement: string) {
  if (!replacement) return replacement;
  if (source === source.toUpperCase() && source.length > 1) return replacement;
  return /^\p{Lu}/u.test(source)
    ? replacement.charAt(0).toUpperCase() + replacement.slice(1)
    : replacement;
}

function collect(text: string): Candidate[] {
  const code = codeRanges(text);
  const out: Candidate[] = [];

  for (const m of text.matchAll(simplerPattern)) {
    if (inRanges(m.index!, code)) continue;
    const key = m[0].toLowerCase().replace(/\s+/g, " ");
    const alt = simplerAlternatives[key];
    if (alt === undefined) continue;
    out.push({
      type: "simpler",
      start: m.index!,
      end: m.index! + m[0].length,
      priority: 4,
      replacement: alt ? matchCase(m[0], alt) : null,
      message: alt
        ? `Simpler option: "${alt}". Use it only if the meaning stays the same.`
        : "This phrase adds length without adding meaning. Consider cutting it.",
    });
  }

  for (const m of text.matchAll(passivePattern)) {
    if (inRanges(m.index!, code)) continue;
    const part = m[1].toLowerCase();
    const isParticiple =
      irregularParticiples.has(part) ||
      (part.length >= 5 && part.endsWith("ed") && !notParticiples.has(part));
    if (!isParticiple) continue;
    out.push({
      type: "passive",
      start: m.index!,
      end: m.index! + m[0].length,
      priority: 3,
      message:
        "Passive voice. Name who or what does the action when that helps the reader.",
    });
  }

  for (const m of text.matchAll(weakenerPattern)) {
    if (inRanges(m.index!, code)) continue;
    out.push({
      type: "weakener",
      start: m.index!,
      end: m.index! + m[0].length,
      priority: 2,
      replacement: null,
      message:
        "Weakening or hedging word. Cut it if the claim stays accurate. Keep hedges that protect the truth.",
    });
  }

  for (const m of text.matchAll(adverbPattern)) {
    if (inRanges(m.index!, code)) continue;
    const word = m[0].toLowerCase();
    if (word.length < 5 || notAdverbs.has(word)) continue;
    out.push({
      type: "adverb",
      start: m.index!,
      end: m.index! + m[0].length,
      priority: 1,
      replacement: null,
      message: "Adverb. A stronger verb, or no adverb, often reads better.",
    });
  }

  return out;
}

/** Keeps the highest-priority candidate whenever two inline candidates overlap. */
function resolveOverlaps(candidates: Candidate[]) {
  const accepted: Candidate[] = [];
  for (const c of [...candidates].sort(
    (a, b) => b.priority - a.priority || a.start - b.start,
  )) {
    if (!accepted.some((a) => c.start < a.end && c.end > a.start))
      accepted.push(c);
  }
  return accepted.sort((a, b) => a.start - b.start);
}

export function annotate(text: string, sentences = scoreSentences(text)) {
  const annotations: Annotation[] = [];

  for (const s of sentences) {
    if (!s.flag) continue;
    annotations.push({
      id: `s-${s.start}`,
      type: s.flag,
      start: s.start,
      end: s.end,
      sentenceIndex: s.index,
      message:
        s.flag === "veryHard"
          ? `Very hard to read: ${s.words} words, estimated level ${s.level}. Split it or cut words.`
          : `Hard to read: ${s.words} words, estimated level ${s.level}. Try a shorter version.`,
    });
  }

  let pointer = 0;
  for (const c of resolveOverlaps(collect(text))) {
    while (
      pointer < sentences.length - 1 &&
      sentences[pointer].end < c.start
    )
      pointer++;
    const { priority: _priority, ...rest } = c;
    annotations.push({
      ...rest,
      id: `${c.type}-${c.start}`,
      sentenceIndex: sentences.length ? pointer : -1,
    });
  }
  return annotations.sort(
    (a, b) => a.start - b.start || b.end - a.end,
  );
}

const atSentenceStart = (head: string) =>
  head.trim() === "" || /(?:[.!?]["')]*[ \t]+|\n[ \t]*)$/.test(head.slice(-12));

/** Applies one automatic fix and returns the new text with a caret position. */
export function applyFix(text: string, a: Annotation) {
  if (a.replacement === undefined) return null;
  let head = text.slice(0, a.start);
  let after = text.slice(a.end);
  const original = text.slice(a.start, a.end);
  if (a.replacement === null) {
    after = after.replace(/^,[ \t]*/, " ");
    if (/^[ \t]/.test(after) && (head === "" || /\s$/.test(head)))
      after = after.replace(/^[ \t]+/, "");
    if (/^[.,;:!?]/.test(after)) head = head.replace(/[ \t]+$/, "");
    if (atSentenceStart(head))
      after = after.replace(/^(\s*)(\p{Ll})/u, (_m, sp, ch) => sp + ch.toUpperCase());
    return { text: head + after, caret: head.length };
  }
  const replacement = matchCase(original, a.replacement);
  return {
    text: head + replacement + after,
    caret: head.length + replacement.length,
  };
}
