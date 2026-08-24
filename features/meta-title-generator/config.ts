export const META_TITLE_LIMITS = {
  preferredCharactersMin: 45,
  preferredCharactersMax: 58,
  hardCharactersMax: 60,
  mobileSafePixels: 555,
  desktopSafePixels: 600,
  // Wider budget reserved for the "desktop-optimized" lens only. These titles
  // intentionally lean toward the top of the desktop pixel budget and are not
  // guaranteed to display in full on narrow mobile widths.
  desktopPreferredCharactersMin: 55,
  desktopPreferredCharactersMax: 60,
} as const;

export const LENS_ORDER = [
  "unified",
  "search",
  "human",
  "ai",
  "desktop",
] as const;

export const LENS_CONFIG = {
  unified: {
    label: "Unified",
    shortLabel: "All three",
    eyebrow: "Best balance",
    description:
      "Balances search relevance, human click appeal, and AI-readable clarity without over-optimizing for one audience.",
    accent: "#5271ff",
  },
  search: {
    label: "Search engine",
    shortLabel: "Google",
    eyebrow: "Relevance first",
    description:
      "Prioritizes an accurate topic match, natural (not forced) keyword placement, intent alignment, uniqueness, and concise structure.",
    accent: "#0f9d58",
  },
  human: {
    label: "Human",
    shortLabel: "People",
    eyebrow: "Click appeal",
    description:
      "Leads with a clear promise, natural language, specificity, and a useful reason to choose the result. Includes question-style options where they fit.",
    accent: "#f59e0b",
  },
  ai: {
    label: "AI-readable",
    shortLabel: "AI search",
    eyebrow: "Explicit context",
    description:
      "Uses unambiguous entities, answer-oriented phrasing, and supported format or authority cues that machines can interpret cleanly.",
    accent: "#8b5cf6",
  },
  desktop: {
    label: "Desktop-optimized",
    shortLabel: "Desktop",
    eyebrow: "Wider pixel budget",
    description:
      "Uses the fuller 55-60 character desktop pixel budget for a more descriptive title. May trim slightly on narrow mobile screens.",
    accent: "#e11d48",
  },
} as const;

export type MetaTitleLens = (typeof LENS_ORDER)[number];
