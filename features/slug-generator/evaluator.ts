import { SLUG_LIMITS } from "./config";
import type { SlugInput } from "./schema";

const FILLER_WORDS = new Set([
  "a",
  "an",
  "and",
  "are",
  "best",
  "complete",
  "for",
  "in",
  "of",
  "on",
  "the",
  "to",
  "ultimate",
  "with",
  "your",
]);

const TEMPORAL_WORDS = new Set([
  "current",
  "latest",
  "new",
  "now",
  "today",
  "updated",
]);

const CONTEXT_STOP_WORDS = new Set([
  ...FILLER_WORDS,
  "about",
  "article",
  "blog",
  "content",
  "page",
  "people",
  "provides",
  "that",
  "this",
  "users",
  "will",
]);

export type SlugCheck = {
  id: string;
  label: string;
  status: "pass" | "warn" | "fail";
  detail: string;
};

export type SlugEvaluation = {
  score: number;
  words: number;
  characters: number;
  canonical: boolean;
  keywordCoverage: number;
  topicCoverage: number;
  fillerWords: string[];
  hasDateRisk: boolean;
  currentSimilarity: number;
  checks: SlugCheck[];
};

function clamp(value: number, min = 0, max = 100) {
  return Math.min(max, Math.max(min, Math.round(value)));
}

export function canonicalizeSlug(value: string) {
  return value
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLocaleLowerCase("en")
    .replace(/&/g, " and ")
    .replace(/[’']/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/-{2,}/g, "-")
    .replace(/^-|-$/g, "");
}

function tokens(value: string) {
  return canonicalizeSlug(value).split("-").filter(Boolean);
}

function meaningfulTokens(value: string) {
  return tokens(value).filter(
    (token) => token.length > 1 && !CONTEXT_STOP_WORDS.has(token),
  );
}

function tokenCoverage(slugTokens: string[], sourceTokens: string[]) {
  const source = new Set(sourceTokens);
  if (!slugTokens.length || !source.size) return 0;
  const matches = slugTokens.filter((token) => source.has(token)).length;
  return matches / slugTokens.length;
}

export function slugSimilarity(a: string, b: string) {
  const aTokens = new Set(tokens(a));
  const bTokens = new Set(tokens(b));
  if (!aTokens.size || !bTokens.size) return 0;
  const intersection = [...aTokens].filter((token) =>
    bTokens.has(token),
  ).length;
  const union = new Set([...aTokens, ...bTokens]).size;
  return intersection / union;
}

export function buildFullUrl(baseUrl: string, slug: string) {
  const cleanSlug = canonicalizeSlug(slug);
  const trimmedBase = baseUrl.trim().replace(/\/+$/, "");
  return trimmedBase
    ? `${trimmedBase}/${cleanSlug}`
    : `example.com/${cleanSlug}`;
}

export function evaluateSlug(
  rawSlug: string,
  input: SlugInput,
): SlugEvaluation {
  const slug = canonicalizeSlug(rawSlug);
  const slugTokens = tokens(slug);
  const words = slugTokens.length;
  const characters = slug.length;
  const canonical = rawSlug === slug && /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug);
  const keywordTokens = meaningfulTokens(input.primaryKeyword);
  const contextTokens = meaningfulTokens(
    `${input.pageContext} ${input.primaryKeyword}`,
  );
  const keywordCoverage = keywordTokens.length
    ? tokenCoverage(keywordTokens, slugTokens)
    : 0;
  const topicCoverage = tokenCoverage(slugTokens, contextTokens);
  const fillerWords = slugTokens.filter((token) => FILLER_WORDS.has(token));
  const duplicateTokens = slugTokens.filter(
    (token, index) => slugTokens.indexOf(token) !== index,
  );
  const hasDate = slugTokens.some((token) => /^(?:19|20)\d{2}$/.test(token));
  const hasTemporalModifier = slugTokens.some((token) =>
    TEMPORAL_WORDS.has(token),
  );
  const hasDateRisk = !input.timeSensitive && (hasDate || hasTemporalModifier);
  const currentSimilarity = input.currentSlug
    ? slugSimilarity(slug, input.currentSlug)
    : 0;
  const preferredWords =
    words >= SLUG_LIMITS.preferredWordsMin &&
    words <= SLUG_LIMITS.preferredWordsMax;

  let score = 35;
  score += canonical ? 15 : -15;
  score += preferredWords ? 18 : words === 2 ? 14 : words === 6 ? 7 : -8;
  score += characters <= SLUG_LIMITS.softCharactersMax ? 7 : -7;
  score += input.primaryKeyword
    ? keywordCoverage >= 0.75
      ? 15
      : keywordCoverage >= 0.5
        ? 9
        : -8
    : topicCoverage >= 0.66
      ? 15
      : topicCoverage >= 0.4
        ? 8
        : -8;
  score += topicCoverage >= 0.66 ? 8 : topicCoverage >= 0.4 ? 4 : -6;
  score += fillerWords.length === 0 ? 5 : fillerWords.length === 1 ? 1 : -6;
  score += hasDateRisk ? -12 : 5;
  score += duplicateTokens.length ? -12 : 4;

  const checks: SlugCheck[] = [
    {
      id: "format",
      label: "URL-safe format",
      status: canonical ? "pass" : "fail",
      detail: canonical
        ? "Lowercase words are separated with single hyphens."
        : "Use lowercase letters, numbers, and single hyphens only.",
    },
    {
      id: "length",
      label: "Concise length",
      status: preferredWords
        ? "pass"
        : words === 2 || words === 6
          ? "warn"
          : "fail",
      detail: `${words} words and ${characters} characters; the working target is 3–5 meaningful words.`,
    },
    {
      id: "topic",
      label: input.primaryKeyword ? "Keyword signal" : "Topic signal",
      status:
        (input.primaryKeyword ? keywordCoverage : topicCoverage) >= 0.66
          ? "pass"
          : (input.primaryKeyword ? keywordCoverage : topicCoverage) >= 0.4
            ? "warn"
            : "fail",
      detail: input.primaryKeyword
        ? `${Math.round(keywordCoverage * 100)}% of meaningful primary-keyword terms are represented.`
        : `${Math.round(topicCoverage * 100)}% of slug words map to meaningful terms in the page brief.`,
    },
    {
      id: "clarity",
      label: "Clarity per word",
      status:
        fillerWords.length === 0
          ? "pass"
          : fillerWords.length === 1
            ? "warn"
            : "fail",
      detail: fillerWords.length
        ? `Review whether ${fillerWords.join(", ")} adds meaning or only length.`
        : "No obvious filler word is diluting the topic label.",
    },
    {
      id: "stability",
      label: "Future-proofing",
      status: hasDateRisk ? "warn" : "pass",
      detail: hasDateRisk
        ? "A date or freshness cue may make an evergreen URL age unnecessarily."
        : input.timeSensitive
          ? "No unnecessary permanence issue was detected for this time-sensitive page."
          : "No unnecessary date or temporary freshness cue was detected.",
    },
    {
      id: "repetition",
      label: "No repetition",
      status: duplicateTokens.length ? "fail" : "pass",
      detail: duplicateTokens.length
        ? `Repeated term detected: ${[...new Set(duplicateTokens)].join(", ")}.`
        : "No repeated word or obvious keyword stuffing was detected.",
    },
  ];

  return {
    score: clamp(score),
    words,
    characters,
    canonical,
    keywordCoverage,
    topicCoverage,
    fillerWords,
    hasDateRisk,
    currentSimilarity,
    checks,
  };
}
