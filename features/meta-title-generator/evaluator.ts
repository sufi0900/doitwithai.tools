import { META_TITLE_LIMITS, type MetaTitleLens } from "./config";
import type { MetaTitleInput } from "./schema";

const BENEFIT_WORDS = [
  "boost",
  "build",
  "create",
  "earn",
  "fix",
  "grow",
  "improve",
  "increase",
  "learn",
  "master",
  "reduce",
  "save",
  "simplify",
  "win",
];

const FORMAT_WORDS = [
  "checklist",
  "examples",
  "explained",
  "guide",
  "how to",
  "review",
  "steps",
  "template",
  "tutorial",
  "what is",
  "why",
];

const AUTHORITY_WORDS = [
  "analysis",
  "data-backed",
  "evidence-based",
  "expert",
  "framework",
  "research",
  "study",
];

const CLICKBAIT_WORDS = [
  "shocking",
  "secret",
  "you won't believe",
  "guaranteed",
  "instantly rich",
];

export type TitleCheck = {
  id: string;
  label: string;
  status: "pass" | "warn" | "fail";
  detail: string;
};

export type TitleEvaluation = {
  characters: number;
  pixels: number;
  mobileSafe: boolean;
  desktopSafe: boolean;
  primaryKeywordFound: boolean;
  primaryKeywordFrontLoaded: boolean;
  duplicateRisk: number;
  scores: Record<MetaTitleLens, number>;
  overallScore: number;
  checks: TitleCheck[];
};

function clamp(value: number, min = 0, max = 100) {
  return Math.min(max, Math.max(min, Math.round(value)));
}

export function normalizeTitle(value: string) {
  return value
    .toLocaleLowerCase("en")
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function tokenSet(value: string) {
  return new Set(normalizeTitle(value).split(" ").filter(Boolean));
}

export function titleSimilarity(a: string, b: string) {
  const aTokens = tokenSet(a);
  const bTokens = tokenSet(b);

  if (!aTokens.size || !bTokens.size) return 0;

  const intersection = [...aTokens].filter((token) =>
    bTokens.has(token),
  ).length;
  const union = new Set([...aTokens, ...bTokens]).size;
  return intersection / union;
}

function fallbackPixelEstimate(title: string) {
  let width = 0;

  for (const character of title) {
    if ("ilI1|.,'`:;!".includes(character)) width += 4.6;
    else if ("MW@%&#QO".includes(character)) width += 14.2;
    else if (/[A-Z0-9]/.test(character)) width += 11.2;
    else if (character === " ") width += 5.5;
    else width += 9.4;
  }

  return Math.ceil(width);
}

export function measureTitlePixels(title: string) {
  if (typeof document === "undefined") return fallbackPixelEstimate(title);

  const canvas = document.createElement("canvas");
  const context = canvas.getContext("2d");
  if (!context) return fallbackPixelEstimate(title);

  context.font = "20px Arial, sans-serif";
  return Math.ceil(context.measureText(title).width);
}

function hasAny(title: string, words: string[]) {
  const normalized = normalizeTitle(title);
  return words.some((word) => normalized.includes(word));
}

function repeatedKeywordRisk(title: string, primaryKeyword: string) {
  const normalizedTitle = normalizeTitle(title);
  const keywordTokens = normalizeTitle(primaryKeyword)
    .split(" ")
    .filter((token) => token.length > 2);

  return keywordTokens.some((token) => {
    const matches = normalizedTitle.match(new RegExp(`\\b${token}\\b`, "g"));
    return (matches?.length ?? 0) > 1;
  });
}

function getDuplicateRisk(title: string, input: MetaTitleInput) {
  const comparisons = [input.currentTitle, ...input.existingTitles].filter(
    Boolean,
  );
  if (!comparisons.length) return 0;
  return Math.max(
    ...comparisons.map((candidate) => titleSimilarity(title, candidate)),
  );
}

export function evaluateTitle(
  title: string,
  input: MetaTitleInput,
  lens?: MetaTitleLens,
): TitleEvaluation {
  const normalizedTitle = normalizeTitle(title);
  const normalizedKeyword = normalizeTitle(input.primaryKeyword);
  const characters = [...title].length;
  const pixels = measureTitlePixels(title);
  const keywordIndex = normalizedTitle.indexOf(normalizedKeyword);
  const firstEightWords = normalizedTitle.split(" ").slice(0, 8).join(" ");
  const primaryKeywordFound = keywordIndex >= 0;
  // "Front-loaded" is tracked as informational context, not a requirement.
  // A keyword placed naturally in the middle or end of a well-written title
  // is not a defect, so this no longer drives a large score swing below.
  const primaryKeywordFrontLoaded = firstEightWords.includes(normalizedKeyword);
  const duplicateRisk = getDuplicateRisk(title, input);
  const mobileSafe = pixels <= META_TITLE_LIMITS.mobileSafePixels;
  const desktopSafe = pixels <= META_TITLE_LIMITS.desktopSafePixels;
  const isDesktopLens = lens === "desktop";
  const preferredLength = isDesktopLens
    ? characters >= META_TITLE_LIMITS.desktopPreferredCharactersMin &&
      characters <= META_TITLE_LIMITS.desktopPreferredCharactersMax
    : characters >= META_TITLE_LIMITS.preferredCharactersMin &&
      characters <= META_TITLE_LIMITS.preferredCharactersMax;
  const hardLengthSafe = characters <= META_TITLE_LIMITS.hardCharactersMax;
  const keywordStuffed = repeatedKeywordRisk(title, input.primaryKeyword);
  const excessivePunctuation = /[!?]{2,}|[:|\-]{2,}/.test(title);
  const allCaps = title.length > 8 && title === title.toUpperCase();
  const hasBenefit = hasAny(title, BENEFIT_WORDS) || /\d/.test(title);
  const hasFormat = hasAny(title, FORMAT_WORDS);
  const hasAuthority = hasAny(title, AUTHORITY_WORDS);
  const clickbait = hasAny(title, CLICKBAIT_WORDS);
  const hasBrand = input.brandName
    ? normalizedTitle.includes(normalizeTitle(input.brandName))
    : true;

  let search = 45;
  search += primaryKeywordFound ? 20 : -12;
  // A small nudge only. Natural placement matters far more than position,
  // so this is a minor tie-breaker rather than a dominant factor.
  search += primaryKeywordFrontLoaded ? 4 : 0;
  search += preferredLength ? 10 : hardLengthSafe ? 4 : -12;
  search += mobileSafe ? 8 : desktopSafe ? 3 : -10;
  search += duplicateRisk < 0.55 ? 7 : duplicateRisk < 0.72 ? 0 : -15;
  search -= keywordStuffed ? 14 : 0;
  search -= excessivePunctuation || allCaps ? 8 : 0;

  let human = 48;
  human += hasBenefit ? 15 : 2;
  human += primaryKeywordFound ? 7 : 0;
  human += preferredLength ? 8 : hardLengthSafe ? 3 : -8;
  human += mobileSafe ? 7 : desktopSafe ? 2 : -8;
  human += /[:|\-]/.test(title) ? 2 : 4;
  human -= clickbait ? 18 : 0;
  human -= allCaps || excessivePunctuation ? 12 : 0;

  let ai = 44;
  ai += primaryKeywordFound ? 14 : -8;
  ai += primaryKeywordFrontLoaded ? 3 : 0;
  ai += hasFormat ? 13 : 3;
  ai += hasAuthority ? 7 : 0;
  ai += preferredLength || hardLengthSafe ? 7 : -6;
  ai += duplicateRisk < 0.65 ? 5 : -7;
  ai -= keywordStuffed || clickbait ? 12 : 0;

  // The desktop lens intentionally leans into the fuller 55-60 character
  // desktop pixel budget, so it is scored against desktop-safe width rather
  // than mobile-safe width, and rewards actually using the extra room
  // instead of staying needlessly short.
  let desktop = 46;
  desktop += primaryKeywordFound ? 16 : -8;
  desktop += preferredLength ? 10 : hardLengthSafe ? 4 : -10;
  desktop += desktopSafe ? 10 : -14;
  desktop += characters >= META_TITLE_LIMITS.desktopPreferredCharactersMin ? 4 : 0;
  desktop += hasFormat ? 8 : 2;
  desktop += duplicateRisk < 0.6 ? 6 : -10;
  desktop -= keywordStuffed ? 14 : 0;
  desktop -= excessivePunctuation || allCaps ? 8 : 0;

  const searchScore = clamp(search);
  const humanScore = clamp(human);
  const aiScore = clamp(ai);
  const desktopScore = clamp(desktop);
  const unifiedScore = clamp(
    searchScore * 0.4 + humanScore * 0.35 + aiScore * 0.25,
  );

  const checks: TitleCheck[] = [
    {
      id: "length",
      label: "Character range",
      status: preferredLength ? "pass" : hardLengthSafe ? "warn" : "fail",
      detail: preferredLength
        ? isDesktopLens
          ? `${characters} characters uses the wider desktop budget (${META_TITLE_LIMITS.desktopPreferredCharactersMin}–${META_TITLE_LIMITS.desktopPreferredCharactersMax}).`
          : `${characters} characters is within the preferred ${META_TITLE_LIMITS.preferredCharactersMin}–${META_TITLE_LIMITS.preferredCharactersMax} range.`
        : `${characters} characters; use the pixel preview as the final practical check.`,
    },
    {
      id: "pixels",
      label: "Pixel safety",
      status: mobileSafe ? "pass" : desktopSafe ? "warn" : "fail",
      detail: `${pixels}px estimated width; ${mobileSafe ? "mobile-safe" : desktopSafe ? "desktop-safe only" : "likely to truncate"}.`,
    },
    {
      id: "keyword",
      label: "Primary keyword",
      status: primaryKeywordFound ? "pass" : "warn",
      detail: primaryKeywordFound
        ? primaryKeywordFrontLoaded
          ? "The primary keyword appears early in the title."
          : "The primary keyword appears later in the title, which reads naturally here."
        : "The exact primary keyword phrase is not present; confirm a natural variant covers the topic.",
    },
    {
      id: "uniqueness",
      label: "Duplicate risk",
      status:
        duplicateRisk < 0.55 ? "pass" : duplicateRisk < 0.72 ? "warn" : "fail",
      detail:
        input.existingTitles.length || input.currentTitle
          ? `${Math.round(duplicateRisk * 100)}% maximum similarity to the titles supplied for comparison.`
          : "No comparison titles were supplied.",
    },
    {
      id: "quality",
      label: "Quality guardrails",
      status:
        keywordStuffed || allCaps || excessivePunctuation || clickbait
          ? "fail"
          : "pass",
      detail:
        keywordStuffed || allCaps || excessivePunctuation || clickbait
          ? "Review repetition, capitalization, punctuation, or clickbait wording."
          : "No obvious stuffing, all-caps, punctuation, or clickbait pattern detected.",
    },
    ...(input.brandName
      ? [
          {
            id: "brand",
            label: "Brand preference",
            status: hasBrand ? ("pass" as const) : ("warn" as const),
            detail: hasBrand
              ? "The requested brand name is included."
              : "The brand was omitted to preserve clarity or pixel space.",
          },
        ]
      : []),
  ];

  return {
    characters,
    pixels,
    mobileSafe,
    desktopSafe,
    primaryKeywordFound,
    primaryKeywordFrontLoaded,
    duplicateRisk,
    scores: {
      unified: unifiedScore,
      search: searchScore,
      human: humanScore,
      ai: aiScore,
      desktop: desktopScore,
    },
    overallScore: unifiedScore,
    checks,
  };
}
