export type AiCrawlerPurpose = "training" | "search" | "user-fetch";

export type AiCrawler = {
  token: string;
  operator: string;
  purpose: AiCrawlerPurpose;
  note?: string;
};

// Curated against vendor documentation as of late 2026. Vendors add and rename
// crawlers over time — treat this as a well-sourced starting point, not an
// exhaustive or permanently accurate list, and re-check vendor docs before
// relying on it for anything load-bearing.
export const AI_CRAWLERS: AiCrawler[] = [
  { token: "GPTBot", operator: "OpenAI", purpose: "training" },
  { token: "OAI-SearchBot", operator: "OpenAI", purpose: "search" },
  {
    token: "ChatGPT-User",
    operator: "OpenAI",
    purpose: "user-fetch",
    note: "User-initiated fetch — OpenAI documents that it may ignore robots.txt.",
  },
  { token: "ClaudeBot", operator: "Anthropic", purpose: "training" },
  { token: "Claude-SearchBot", operator: "Anthropic", purpose: "search" },
  {
    token: "Claude-User",
    operator: "Anthropic",
    purpose: "user-fetch",
    note: "User-initiated fetch — may ignore robots.txt.",
  },
  { token: "PerplexityBot", operator: "Perplexity", purpose: "search" },
  {
    token: "Perplexity-User",
    operator: "Perplexity",
    purpose: "user-fetch",
    note: "User-initiated fetch — documented as generally ignoring robots.txt.",
  },
  {
    token: "Google-Extended",
    operator: "Google",
    purpose: "training",
    note: "Controls Gemini training and selected grounding uses; separate from Googlebot search indexing.",
  },
  {
    token: "CCBot",
    operator: "Common Crawl",
    purpose: "training",
    note: "Open dataset reused by many AI labs for training.",
  },
  { token: "Bytespider", operator: "ByteDance", purpose: "training" },
  { token: "meta-externalagent", operator: "Meta", purpose: "training" },
  { token: "Amazonbot", operator: "Amazon", purpose: "training" },
  {
    token: "Applebot-Extended",
    operator: "Apple",
    purpose: "training",
    note: "Controls Apple Intelligence training use — separate from Applebot search/Siri.",
  },
];
