export const SLUG_LIMITS = {
  preferredWordsMin: 3,
  preferredWordsMax: 5,
  conciseWordsMax: 3,
  softCharactersMax: 60,
} as const;

export const SLUG_GROUPS = {
  balanced: {
    label: "Best overall",
    eyebrow: "Recommended",
    description:
      "The strongest balance of topic clarity, keyword relevance, brevity, and long-term stability.",
    accent: "#5271ff",
  },
  concise: {
    label: "Shortest clear",
    eyebrow: "Brevity first",
    description:
      "Compresses the page to its essential topic without turning the URL into a vague label.",
    accent: "#06b6d4",
  },
  keyword: {
    label: "Keyword aligned",
    eyebrow: "Topic signal",
    description:
      "Preserves the primary keyword or its essential terms naturally, without keyword repetition.",
    accent: "#16a34a",
  },
  intent: {
    label: "Intent clear",
    eyebrow: "Meaning first",
    description:
      "Keeps an action, comparison, review, or other intent cue only when it helps explain the page.",
    accent: "#8b5cf6",
  },
} as const;

export type SlugGroupId = keyof typeof SLUG_GROUPS;
