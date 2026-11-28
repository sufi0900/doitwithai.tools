export type ArticleEvidence = {
  title: string;
  url: string;
  text: string;
  kind: "page text" | "search excerpt" | "grounded summary";
};

function onDomain(name: string, domain: string) {
  return name === domain || name.endsWith("." + domain);
}

export function articleSourceRank(url: string, brandHost: string): number {
  const site = new URL(url);
  const name = site.hostname.toLowerCase().replace(/^www\./, "");
  if ((brandHost && onDomain(name, brandHost)) || [
    "reddit.com", "quora.com", "medium.com", "pinterest.com", "facebook.com", "instagram.com",
    "x.com", "twitter.com", "tiktok.com", "youtube.com",
  ].some((domain) => onDomain(name, domain))) return 0;
  if (/\.(?:gov|edu)(?:\.[a-z]{2})?$|\.(?:int|mil)$/.test(name)) return 3;
  if (["arxiv.org", "acm.org", "ieee.org", "nature.com", "science.org", "springer.com", "pewresearch.org",
    "aclweb.org", "openai.com", "anthropic.com", "huggingface.co", "developers.google.com", "support.google.com",
    "blog.google", "ai.google.dev", "web.dev", "developer.mozilla.org", "w3.org", "ietf.org", "iso.org",
    "oecd.org", "worldbank.org", "supabase.com", "developers.cloudflare.com", "docs.github.com",
    "learn.microsoft.com", "developer.apple.com", "docs.aws.amazon.com", "cloud.google.com",
    "developers.facebook.com", "unesco.org"].some((domain) => onDomain(name, domain))) return 3;
  if (name === "github.com" && /^\/[^/]+\/[^/]*(?:benchmark|dataset|leaderboard|evaluation)[^/]*(?:\/|$)/i.test(site.pathname)) return 2;
  return 1;
}

const numericClaim = /(?:^|[^\p{L}\p{N}])((?:\d+(?:[.,]\d+)?\s*(?:%|percent(?:age points?)?\b))|(?:\d[\d,]*(?:\.\d+)?\s+(?:(?:million|billion|thousand)\s+)?(?:respondents?|participants?|models?|users?|samples?|cases?)\b))/giu;
const citationMarkers = /(?:\[[^\]\n]+\])?\[S(\d+)\]/g;
const normalizeNumber = (value: string) => value.toLowerCase().replace(/,/g, "").replace(/\s+/g, " ").replace(/\s*(?:percent\b|%)/g, "%").trim();

function claims(text: string) {
  const normalized = text.replace(/(\d+(?:\.\d+)?)\s*(?:to|[–—-])\s*(\d+(?:\.\d+)?)\s*(%|percent\b)/gi, "$1$3 to $2$3");
  return [...normalized.matchAll(numericClaim)].map((match) => normalizeNumber(match[1]));
}

export function unsupportedArticleClaims(text: string, original: string, evidence: ArticleEvidence[]): boolean {
  const numbersInOriginal = new Set(claims(original));
  const blocks = text.split(/\n+|(?<=[!?]|\.(?!\d))\s+(?=[A-Z])/);
  return blocks.some((block) => {
    const newClaims = claims(block).filter((claim) => !numbersInOriginal.has(claim));
    if (!newClaims.length) return false;
    const cited = [...block.matchAll(citationMarkers)].flatMap((marker) => {
      const source = evidence[Number(marker[1]) - 1];
      return source?.kind === "page text" ? claims(source.text) : [];
    });
    return newClaims.some((claim) => !cited.includes(claim));
  });
}

export function preservesExamples(before: string, after: string) {
  const examples: string[] = before.match(/(?:^|\n)(?:```[^\n]*\n[\s\S]*?\n```|~~~[^\n]*\n[\s\S]*?\n~~~)|<keyword_matrix\b[^>]*>[\s\S]*?<\/keyword_matrix>/gi) || [];
  return examples.every((example) => after.includes(example.trim()));
}
