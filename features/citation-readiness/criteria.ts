export type EvidenceBasis = {
  label: string;
  explanation: string;
  references: { name: string; url: string }[];
};
const google = {
  name: "Google AI features guidance",
  url: "https://developers.google.com/search/docs/appearance/ai-features",
};
const bing = {
  name: "Bing content and citation guidance",
  url: "https://blogs.bing.com/webmaster/2026/2/Introducing-AI-Performance-in-Bing-Webmaster-Tools-Public-Preview/",
};
const policies: Record<string, { name: string; url: string }> = {
  bingbot: {
    name: "Bingbot and robots rules",
    url: "https://www.bing.com/webmasters/help/how-to-report-an-issue-with-bingbot-25c19802",
  },
  "OAI-SearchBot": {
    name: "OpenAI crawler documentation",
    url: "https://developers.openai.com/api/docs/bots",
  },
  PerplexityBot: {
    name: "Perplexity crawler documentation",
    url: "https://docs.perplexity.ai/docs/resources/perplexity-crawlers",
  },
  "Claude-SearchBot": {
    name: "Anthropic crawler documentation",
    url: "https://support.claude.com/en/articles/8896518-does-anthropic-crawl-data-from-the-web-and-how-can-site-owners-block-the-crawler",
  },
};
export function criterionBasis(id: string): EvidenceBasis {
  if (id.startsWith("crawler-"))
    return {
      label: "Documented crawler policy",
      explanation:
        "Tests retrieved robots rules for this path. This is not a live request from the named crawler.",
      references: [policies[id.slice(8)] || google],
    };
  if (["indexing", "snippets"].includes(id))
    return {
      label: "Documented Google control",
      explanation:
        "Describes Google indexing or snippet controls. Actual indexing and inclusion remain unverified.",
      references: [google],
    };
  if (["structure", "paragraphs", "openings"].includes(id))
    return {
      label: "Editorial heuristic",
      explanation:
        "Observed structure supports review. No H1 count, word threshold, or first-sentence pattern proves citation readiness.",
      references: [bing, google],
    };
  if (["attribution", "sources"].includes(id))
    return {
      label: "Editorial evidence review",
      explanation:
        "Reviews sourcing and attribution cues. Presence alone cannot establish expertise, originality, or factual accuracy.",
      references: [bing],
    };
  if (id === "schema" || id === "llms")
    return {
      label: "General search guidance",
      explanation:
        "Markup should match visible content. Special AI schema is not required, and parsed markup does not certify eligibility.",
      references: [google],
    };
  return {
    label: "Observed import evidence",
    explanation:
      "Reports this import's scope or response. These observations do not predict search performance.",
    references: [google],
  };
}
