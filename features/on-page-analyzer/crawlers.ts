import {
  inspectCrawlerPath,
  parseCrawlerPolicy,
} from "@/features/robots-generator/access";
import type { PageSnapshot } from "./types";
const SEARCH_CRAWLERS = [
  { token: "Googlebot", purpose: "Google Search" },
  { token: "bingbot", purpose: "Bing Search" },
  { token: "OAI-SearchBot", purpose: "ChatGPT search" },
  { token: "PerplexityBot", purpose: "Perplexity search" },
  { token: "Claude-SearchBot", purpose: "Claude search" },
];
export function crawlerReadiness(page: PageSnapshot) {
  let path = "";
  try {
    const url = new URL(page.url);
    path = url.pathname + url.search;
  } catch {}
  const unavailable =
    !path ||
    page.resources.robots === "unknown" ||
    page.resources.robotsPartial;
  const state = unavailable
    ? null
    : parseCrawlerPolicy(page.resources.robotsText);
  const row = (token: string, purpose: string, scored: boolean) => ({
    token,
    purpose,
    scored,
    ...(state
      ? inspectCrawlerPath(state, token, path)
      : {
          status: "unknown" as const,
          matchedAgent: "",
          rule: "Not inspected",
          reason: page.resources.robotsPartial
            ? "The robots.txt sample is incomplete."
            : "A complete robots.txt response and page URL are needed.",
        }),
    ...(page.resources.robots === "missing" && path
      ? {
          reason:
            "No robots.txt file was found. No file-based restriction was detected; network access remains unverified.",
        }
      : {}),
  });
  return [
    ...SEARCH_CRAWLERS.map((c) => row(c.token, c.purpose, true)),
    row("GPTBot", "Model training", false),
    row(
      "Google-Extended",
      "Gemini training and grounding; separate from Google Search",
      false,
    ),
  ];
}
