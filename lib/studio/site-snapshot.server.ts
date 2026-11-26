import { load } from "cheerio";
import { z } from "zod";
import {
  generateStudioStructured,
  isStudioAiConfigured,
} from "./studio-llm-gateway.server";
import type {
  SavedKeywordItem,
  SiteAuditCheckItem,
  SiteAuditSnapshot,
} from "./types";

const DEFAULT_BRAND_HEX = "#5271FF";

const SLOGAN_OR_UI_HEADING_PATTERNS = [
  /^(?:don['’]?t\s+just|put\s+\w+\s+to\s+work|welcome\s+to|empowering|transforming|supercharge\s+your|unlock\s+your|the\s+#?1|build\s+better|grow\s+faster|get\s+started|work\s+smarter|less\s+busywork|meet\s+your)\b/i,
  /^(?:learn\s+the|explore\s+our|discover\s+how|read\s+more|see\s+how|why\s+choose|ready\s+to|start\s+your|join\s+\d+|trusted\s+by|frequently\s+asked|what\s+people\s+say)\b/i,
  /^(?:home|homepage|official\s+site|index|main\s+page|untitled|sign\s+in|login|menu|navigation)\b/i,
];

function hexToHsl(hex: string): { h: number; s: number; l: number } | null {
  const clean = hex.replace(/^#/, "").trim();
  const full =
    clean.length === 3
      ? clean
          .split("")
          .map((c) => c + c)
          .join("")
      : clean;
  if (!/^[0-9a-f]{6}$/i.test(full)) return null;
  const r = parseInt(full.slice(0, 2), 16) / 255;
  const g = parseInt(full.slice(2, 4), 16) / 255;
  const b = parseInt(full.slice(4, 6), 16) / 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const l = (max + min) / 2;
  if (max === min) return { h: 0, s: 0, l };
  const d = max - min;
  const s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
  let h = 0;
  if (max === r) h = (g - b) / d + (g < b ? 6 : 0);
  else if (max === g) h = (b - r) / d + 2;
  else h = (r - g) / d + 4;
  return { h: h / 6, s, l };
}

export function extractSaturatedBrandColors(
  themeColorMeta: string,
  cssText: string,
): string[] {
  const candidates: string[] = [];
  if (
    themeColorMeta &&
    /^#(?:[0-9a-f]{3}|[0-9a-f]{6})$/i.test(themeColorMeta.trim())
  ) {
    candidates.push(themeColorMeta.trim());
  }
  const varMatches = cssText.matchAll(
    /--(?:brand|primary|accent|theme)[-\w]*\s*:\s*(#[0-9a-f]{6}|#[0-9a-f]{3})\b/gi,
  );
  for (const m of varMatches) {
    if (m[1]) candidates.push(m[1]);
  }
  const allHexes = cssText.match(/#[0-9a-f]{6}\b/gi) || [];
  candidates.push(...allHexes);

  const vibrant: string[] = [];
  for (const raw of candidates) {
    const clean = raw.replace(/^#/, "");
    const normalized =
      "#" +
      (clean.length === 3
        ? clean
            .split("")
            .map((c) => c + c)
            .join("")
        : clean
      ).toUpperCase();
    if (vibrant.includes(normalized)) continue;
    const hsl = hexToHsl(normalized);
    if (!hsl) continue;
    if (hsl.s < 0.25 || hsl.l < 0.14 || hsl.l > 0.86) continue;
    vibrant.push(normalized);
    if (vibrant.length >= 5) break;
  }

  return vibrant.length > 0 ? vibrant : [DEFAULT_BRAND_HEX];
}

export function extractCleanTopicSeed(params: {
  explicitNiche?: string;
  title?: string;
  headings: string[];
  metaDescription: string;
  navLabels: string[];
  siteName: string;
}): string {
  const explicit = (params.explicitNiche || "").replace(/\s+/g, " ").trim();
  if (explicit.length >= 3) {
    return explicit
      .replace(/[^\w\s&-]/g, " ")
      .replace(/\s+/g, " ")
      .trim()
      .slice(0, 48)
      .toLowerCase();
  }

  // Prefer Title tag segment after brand separator (e.g. "Brand — AI SEO & Content Tools")
  if (params.title) {
    const titleParts = params.title
      .split(/[|–—•:]/)
      .map((s) => s.trim())
      .filter((s) => s.length >= 5 && s.split(/\s+/).length <= 7);
    const descriptivePart = titleParts.find(
      (part) =>
        part.toLowerCase() !== params.siteName.toLowerCase() &&
        !SLOGAN_OR_UI_HEADING_PATTERNS.some((re) => re.test(part)),
    );
    if (descriptivePart) {
      return descriptivePart
        .replace(/[^\w\s&-]/g, " ")
        .replace(/\s+/g, " ")
        .trim()
        .toLowerCase();
    }
  }

  const meaningfulNav = params.navLabels.find(
    (label) =>
      label.length >= 4 &&
      label.length <= 28 &&
      !/^(?:home|about|contact|pricing|login|sign\s*in|sign\s*up|blog|resources|faq|support|terms|privacy|dashboard|studio)$/i.test(
        label.trim(),
      ),
  );
  if (meaningfulNav) {
    return meaningfulNav.toLowerCase();
  }

  const nonSloganHeading = params.headings
    .map((h) => h.split(/[:|–—•-]/)[0]?.replace(/\s+/g, " ").trim() || "")
    .find(
      (h) =>
        h.length >= 5 &&
        h.split(/\s+/).length >= 2 &&
        h.split(/\s+/).length <= 5 &&
        !SLOGAN_OR_UI_HEADING_PATTERNS.some((re) => re.test(h)) &&
        !/[!?.]$/.test(h),
    );

  if (nonSloganHeading) {
    return nonSloganHeading
      .replace(/[^\w\s&-]/g, " ")
      .replace(/\s+/g, " ")
      .trim()
      .toLowerCase();
  }

  return (
    params.siteName
      .replace(/\.(?:com|io|ai|tools|org|net|co|site)$/i, "")
      .replace(/[^\w\s-]/g, " ")
      .trim()
      .toLowerCase() || "seo content strategy"
  );
}

export function sanitizeVerifiedBlocks(
  blocks: Array<{ text?: unknown; url?: unknown }>,
  allowedUrls: string[] = [],
): string {
  const allowed = new Set(allowedUrls.map((u) => u.trim()).filter(Boolean));
  const validParagraphs: string[] = [];

  for (const rawBlock of blocks) {
    if (typeof rawBlock?.text !== "string") continue;
    let text = rawBlock.text.trim();
    if (!text) continue;

    text = text.replace(/https?:\/\/[^\s)>\]"']+/gi, (matched) => {
      const clean = matched.replace(/[.,;:!?]+$/, "");
      return allowed.size === 0 || allowed.has(clean) ? matched : "";
    });
    text = text.replace(/\s{2,}/g, " ").trim();
    if (text) validParagraphs.push(text);
  }

  return validParagraphs.join("\n\n");
}

export function slugifyTopic(input: string): string {
  return input
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .slice(0, 60);
}

/**
 * Matches 2-3 relevant internal sitemap URLs for a given keyword/topic.
 */
export function matchInternalLinksFromSitemap(
  keyword: string,
  sitemapUrls: Array<{ url: string; title: string }>,
  limit = 3,
): Array<{ url: string; title: string }> {
  if (!sitemapUrls.length) return [];
  const terms = keyword
    .toLowerCase()
    .split(/\s+/)
    .filter((w) => w.length > 3);

  const scored = sitemapUrls
    .map((entry) => {
      const hay = `${entry.title} ${entry.url}`.toLowerCase();
      let score = 0;
      for (const term of terms) {
        if (hay.includes(term)) score += 2;
      }
      if (/\/(?:blog|ai-seo|guides|tools|prompts)\//i.test(entry.url)) {
        score += 1;
      }
      return { entry, score };
    })
    .sort((a, b) => b.score - a.score);

  return scored.slice(0, limit).map((s) => s.entry);
}

/**
 * Checks whether a candidate keyword/slug overlaps an already-published sitemap URL.
 */
export function detectSitemapCannibalization(
  keyword: string,
  suggestedSlug: string,
  sitemapUrls: Array<{ url: string; title: string }>,
): {
  status: "clear" | "overlap-review" | "optimize-existing";
  overlapUrl?: string;
} {
  const cleanSlug = slugifyTopic(suggestedSlug || keyword);
  const kwTokens = keyword
    .toLowerCase()
    .split(/\s+/)
    .filter((w) => w.length > 3);

  for (const page of sitemapUrls) {
    try {
      const pathSlug =
        new URL(page.url).pathname.split("/").filter(Boolean).pop() || "";
      if (!pathSlug) continue;
      if (pathSlug.toLowerCase() === cleanSlug) {
        return { status: "optimize-existing", overlapUrl: page.url };
      }
      if (kwTokens.length >= 3) {
        const matched = kwTokens.filter((t) =>
          pathSlug.toLowerCase().includes(t),
        );
        if (matched.length === kwTokens.length) {
          return { status: "overlap-review", overlapUrl: page.url };
        }
      }
    } catch {
      // ignore invalid URL
    }
  }
  return { status: "clear" };
}

export function buildCleanStarterKeywords(params: {
  siteId: string;
  topicSeed: string;
  existingSlugs?: string[];
  sitemapUrls?: Array<{ url: string; title: string }>;
}): SavedKeywordItem[] {
  const currentYear = new Date().getUTCFullYear();
  const seed = params.topicSeed.trim() || "seo content strategy";
  const titleSeed = seed.replace(/\b\w/g, (c) => c.toUpperCase());
  const nowIso = new Date().toISOString();
  const existingSet = new Set(
    (params.existingSlugs || []).map((s) => s.toLowerCase()),
  );
  const sitemapUrls = params.sitemapUrls || [];

  const templates: Array<{
    keyword: string;
    clusterName: string;
    intent: SavedKeywordItem["intent"];
    funnelStage: NonNullable<SavedKeywordItem["funnelStage"]>;
    kdEstimate: number;
    suggestedTitle: string;
    articleAngle: string;
  }> = [
    {
      keyword: `${seed} complete guide`,
      clusterName: "Core Pillar Guides",
      intent: "informational",
      funnelStage: "tofu",
      kdEstimate: 18,
      suggestedTitle: `${titleSeed}: The Practical Implementation Guide (${currentYear})`,
      articleAngle:
        "Comprehensive pillar guide with workflow architecture, benchmarks, and decision checklists.",
    },
    {
      keyword: `best ${seed} tools`,
      clusterName: "Commercial Comparisons",
      intent: "commercial",
      funnelStage: "mofu",
      kdEstimate: 24,
      suggestedTitle: `Best ${titleSeed} Tools & Platforms Compared (${currentYear})`,
      articleAngle:
        "Side-by-side evaluation matrix covering pricing, strengths, limitations, and ideal team size.",
    },
    {
      keyword: `${seed} audit checklist`,
      clusterName: "Tactical Playbooks",
      intent: "informational",
      funnelStage: "mofu",
      kdEstimate: 14,
      suggestedTitle: `15-Point ${titleSeed} Audit Checklist for Faster Results`,
      articleAngle:
        "Step-by-step diagnostic checklist practitioners can run in under 30 minutes.",
    },
    {
      keyword: `${seed} mistakes to avoid`,
      clusterName: "Troubleshooting & QA",
      intent: "informational",
      funnelStage: "tofu",
      kdEstimate: 12,
      suggestedTitle: `9 Costly ${titleSeed} Mistakes (And How to Fix Each One)`,
      articleAngle:
        "Real failure modes, root causes, and concrete before-and-after fixes.",
    },
    {
      keyword: `how to automate ${seed}`,
      clusterName: "Workflows & Scaling",
      intent: "commercial",
      funnelStage: "mofu",
      kdEstimate: 19,
      suggestedTitle: `How to Streamline ${titleSeed} Without Losing Quality`,
      articleAngle:
        "Balances AI speed with human editorial QA and measurable KPIs.",
    },
    {
      keyword: `${seed} vs traditional methods`,
      clusterName: "Comparisons & ROI",
      intent: "comparison",
      funnelStage: "bofu",
      kdEstimate: 16,
      suggestedTitle: `Modern ${titleSeed} vs. Legacy Workflows: ROI & Time Breakdown`,
      articleAngle:
        "Cost, turnaround time, and output quality comparison for decision-makers.",
    },
    {
      keyword: `${seed} templates and examples`,
      clusterName: "Templates & Frameworks",
      intent: "transactional",
      funnelStage: "bofu",
      kdEstimate: 15,
      suggestedTitle: `Ready-to-Use ${titleSeed} Templates & Real-World Examples (${currentYear})`,
      articleAngle:
        "Copy-paste frameworks and annotated real examples readers can apply immediately.",
    },
    {
      keyword: `how to measure ${seed} roi`,
      clusterName: "Analytics & Attribution",
      intent: "commercial",
      funnelStage: "bofu",
      kdEstimate: 17,
      suggestedTitle: `How to Measure ${titleSeed} ROI: Metrics That Actually Matter`,
      articleAngle:
        "KPI scorecard connecting organic visibility, conversions, and pipeline impact.",
    },
  ];

  return templates
    .filter((item) => !existingSet.has(slugifyTopic(item.keyword)))
    .map((item, idx) => {
      const slug = slugifyTopic(item.keyword);
      const overlap = detectSitemapCannibalization(
        item.keyword,
        slug,
        sitemapUrls,
      );
      return {
        id: `kw-${Date.now()}-${idx + 1}`,
        siteId: params.siteId,
        keyword: item.keyword,
        clusterName: item.clusterName,
        intent: item.intent,
        funnelStage: item.funnelStage,
        kdEstimate: item.kdEstimate,
        suggestedTitle: item.suggestedTitle,
        suggestedSlug: slug,
        articleAngle: item.articleAngle,
        internalLinkTargets: matchInternalLinksFromSitemap(
          item.keyword,
          sitemapUrls,
        ),
        cannibalizationStatus: overlap.status,
        existingOverlapUrl: overlap.overlapUrl,
        status: "backlog",
        createdAtIso: nowIso,
      };
    });
}

/**
 * Fetches live Google Suggest / Autocomplete expansions ($0 public endpoint)
 * to ground LLM keyword synthesis in real user search queries.
 */
export async function fetchGoogleAutocompleteSuggestions(
  seeds: string[],
): Promise<string[]> {
  const uniqueSeeds = Array.from(
    new Set(
      seeds
        .map((s) => s.trim())
        .filter((s) => s.length >= 3 && s.length <= 60),
    ),
  ).slice(0, 4);

  if (uniqueSeeds.length === 0) return [];

  const results = await Promise.all(
    uniqueSeeds.map(async (query) => {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), 2400);
      try {
        const res = await fetch(
          `https://suggestqueries.google.com/complete/search?client=firefox&hl=en&q=${encodeURIComponent(
            query,
          )}`,
          {
            signal: controller.signal,
            headers: { "User-Agent": "Mozilla/5.0" },
          },
        );
        if (!res.ok) return [];
        const json = (await res.json()) as unknown;
        if (Array.isArray(json) && Array.isArray(json[1])) {
          return (json[1] as unknown[])
            .filter((item): item is string => typeof item === "string")
            .slice(0, 8);
        }
        return [];
      } catch {
        return [];
      } finally {
        clearTimeout(timer);
      }
    }),
  );

  return Array.from(new Set(results.flat())).slice(0, 24);
}

const aiSiteDiscoverySchema = z.object({
  coreOfferSummary: z.string().min(15).max(320),
  businessModel: z.string().min(3).max(80),
  detectedNiche: z.string().min(3).max(80),
  detectedAudience: z.string().min(5).max(160),
  contentPillars: z.array(z.string().min(3).max(60)).min(3).max(5),
  ideas: z
    .array(
      z.object({
        keyword: z.string().min(4).max(90),
        clusterName: z.string().min(3).max(60),
        intent: z.enum([
          "informational",
          "commercial",
          "transactional",
          "comparison",
        ]),
        funnelStage: z.enum(["tofu", "mofu", "bofu"]),
        kdEstimate: z.number().int().min(5).max(75),
        suggestedTitle: z.string().min(15).max(120),
        suggestedSlug: z.string().min(4).max(70),
        articleAngle: z.string().min(15).max(240),
      }),
    )
    .min(10)
    .max(16),
});

/**
 * Synthesizes niche-accurate, non-cannibalizing Keyword & Blog Article Ideas
 * via the isolated Studio LLM Gateway (`AUTONOMOUS_AUTOMATION_GEMINI_KEY`).
 */
export async function synthesizeAiSiteKeywordsAndIdeas(params: {
  siteId: string;
  siteUrl: string;
  siteName: string;
  title: string;
  metaDescription: string;
  h1Text: string;
  headings: string[];
  navLabels: string[];
  bodyExcerpt: string;
  explicitNiche?: string;
  explicitAudience?: string;
  primaryGoal?: string;
  focusTopic?: string;
  sitemapUrls: Array<{ url: string; title: string }>;
}): Promise<{
  coreOfferSummary?: string;
  businessModel?: string;
  detectedNiche?: string;
  detectedAudience?: string;
  contentPillars?: string[];
  keywords: SavedKeywordItem[];
  usedAi: boolean;
}> {
  const currentYear = new Date().getUTCFullYear();
  const fallbackSeed = extractCleanTopicSeed({
    explicitNiche: params.focusTopic || params.explicitNiche,
    title: params.title,
    headings: params.headings,
    metaDescription: params.metaDescription,
    navLabels: params.navLabels,
    siteName: params.siteName,
  });

  if (!isStudioAiConfigured()) {
    return {
      keywords: buildCleanStarterKeywords({
        siteId: params.siteId,
        topicSeed: fallbackSeed,
        sitemapUrls: params.sitemapUrls,
      }),
      usedAi: false,
    };
  }

  const autocompleteSeeds = [
    params.focusTopic || "",
    params.explicitNiche || "",
    fallbackSeed,
    `${fallbackSeed} how to`,
    `best ${fallbackSeed}`,
  ].filter(Boolean);

  const autocompleteQueries =
    await fetchGoogleAutocompleteSuggestions(autocompleteSeeds);

  const existingSampleSlugs = params.sitemapUrls
    .slice(0, 80)
    .map((u) => {
      try {
        return new URL(u.url).pathname;
      } catch {
        return u.url;
      }
    });

  try {
    const { data } = await generateStudioStructured({
      schema: aiSiteDiscoverySchema,
      schemaName: "studio_site_keyword_discovery",
      maxOutputTokens: 3600,
      timeoutMs: 28_000,
      temperature: 0.35,
      systemPrompt: `You are a Principal SEO & Content Strategist. Analyze the connected website's real product/service, audience, navigation, and existing sitemap URLs to generate 12 to 15 high-intent, realistic Google & AI-Search keyword and blog article ideas for ${currentYear}.
STRICT QUALITY RULES:
1. NEVER quote UI button text, marketing slogans, or generic page section labels (e.g., never produce phrases like "learn the reasoning behind the work").
2. Every \`keyword\` MUST be a natural 2 to 6 word lowercase search query real buyers or practitioners actually type into Google or ChatGPT.
3. Mix search intents strategically across Informational (tutorials, checklists, frameworks), Commercial ("best...", software/service evaluations), Comparison ("X vs Y", alternatives), and Transactional/BOFU (templates, calculators, ROI).
4. Check \`existingSitemapPaths\` and propose fresh net-new topics that complement—rather than duplicate—already published slugs.
5. Make \`suggestedTitle\` crisp, human, specific, and <= 65 characters where possible. Return valid JSON only.`,
      userPrompt: JSON.stringify({
        siteUrl: params.siteUrl,
        siteName: params.siteName,
        explicitNiche: params.explicitNiche || null,
        explicitAudience: params.explicitAudience || null,
        focusTopic: params.focusTopic || null,
        primaryGoal: params.primaryGoal || null,
        homepageTitle: params.title,
        metaDescription: params.metaDescription,
        h1: params.h1Text,
        topHeadings: params.headings.slice(0, 12),
        navItems: params.navLabels.slice(0, 15),
        bodyExcerpt: params.bodyExcerpt.slice(0, 1200),
        googleAutocompleteSignals: autocompleteQueries,
        existingSitemapPaths: existingSampleSlugs,
      }),
    });

    const nowIso = new Date().toISOString();
    const seen = new Set<string>();
    const keywords: SavedKeywordItem[] = [];

    data.ideas.forEach((idea, idx) => {
      const cleanKw = idea.keyword.replace(/\s+/g, " ").trim().toLowerCase();
      if (!cleanKw || seen.has(cleanKw)) return;
      seen.add(cleanKw);

      const cleanSlug = slugifyTopic(idea.suggestedSlug || cleanKw);
      const overlap = detectSitemapCannibalization(
        cleanKw,
        cleanSlug,
        params.sitemapUrls,
      );

      keywords.push({
        id: `kw-${Date.now()}-${idx + 1}`,
        siteId: params.siteId,
        keyword: cleanKw,
        clusterName: idea.clusterName.trim(),
        intent: idea.intent,
        funnelStage: idea.funnelStage,
        kdEstimate: idea.kdEstimate,
        suggestedTitle: idea.suggestedTitle.trim(),
        suggestedSlug: cleanSlug,
        articleAngle: idea.articleAngle.trim(),
        internalLinkTargets: matchInternalLinksFromSitemap(
          cleanKw,
          params.sitemapUrls,
        ),
        cannibalizationStatus: overlap.status,
        existingOverlapUrl: overlap.overlapUrl,
        status: "backlog",
        createdAtIso: nowIso,
      });
    });

    return {
      coreOfferSummary: data.coreOfferSummary,
      businessModel: data.businessModel,
      detectedNiche: data.detectedNiche,
      detectedAudience: data.detectedAudience,
      contentPillars: data.contentPillars,
      keywords,
      usedAi: true,
    };
  } catch {
    return {
      keywords: buildCleanStarterKeywords({
        siteId: params.siteId,
        topicSeed: fallbackSeed,
        sitemapUrls: params.sitemapUrls,
      }),
      usedAi: false,
    };
  }
}

export function normalizeSiteUrl(rawUrl: string): URL {
  let cleaned = rawUrl.trim();
  if (!/^https?:\/\//i.test(cleaned)) {
    cleaned = `https://${cleaned}`;
  }
  const parsed = new URL(cleaned);
  if (!["http:", "https:"].includes(parsed.protocol)) {
    throw new Error("Only http:// and https:// URLs are supported.");
  }
  return parsed;
}

export async function fetchEdgeSafeText(
  url: string,
  timeoutMs = 8000,
): Promise<{ status: number; text: string; finalUrl: string }> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(url, {
      method: "GET",
      redirect: "follow",
      signal: controller.signal,
      headers: {
        "User-Agent":
          "Mozilla/5.0 (compatible; DoItWithAIStudioAudit/2.0; +https://doitwithai.tools)",
        Accept:
          "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
      },
    });
    const text = (await res.text()).slice(0, 512_000);
    return { status: res.status, text, finalUrl: res.url || url };
  } catch {
    return { status: 0, text: "", finalUrl: url };
  } finally {
    clearTimeout(timer);
  }
}

export async function runCombinedSiteSnapshot(input: {
  url: string;
  niche?: string;
  audience?: string;
  primaryGoal?: string;
}): Promise<{
  siteName: string;
  normalizedUrl: string;
  brandColorHex: string;
  topicSeed: string;
  coreOfferSummary?: string;
  businessModel?: string;
  detectedAudience?: string;
  detectedContentPillars?: string[];
  robotsTxtPreview?: string;
  hasLlmsTxt?: boolean;
  sitemapUrls: Array<{ url: string; title: string }>;
  snapshot: SiteAuditSnapshot;
  seedKeywords: SavedKeywordItem[];
}> {
  const target = normalizeSiteUrl(input.url);
  const nowIso = new Date().toISOString();

  const [homeRes, robotsRes, llmsRes] = await Promise.all([
    fetchEdgeSafeText(target.href, 9000),
    fetchEdgeSafeText(`${target.origin}/robots.txt`, 4500),
    fetchEdgeSafeText(`${target.origin}/llms.txt`, 3500),
  ]);

  const hasRobotsTxt =
    robotsRes.status === 200 && robotsRes.text.trim().length > 0;
  const hasLlmsTxt =
    llmsRes.status === 200 &&
    llmsRes.text.trim().length > 20 &&
    !/<!doctype html/i.test(llmsRes.text.slice(0, 120));

  let title = "";
  let metaDescription = "";
  let h1Count = 0;
  let h1Text = "";
  let h2Count = 0;
  let wordCount = 0;
  let bodyExcerpt = "";
  let internalLinkCount = 0;
  let externalLinkCount = 0;
  let imagesMissingAlt = 0;
  let totalImages = 0;
  let hasCanonical = false;
  let canonicalUrl = "";
  const schemaTypes = new Set<string>();
  let brandColors: string[] = [DEFAULT_BRAND_HEX];
  let headings: string[] = [];
  let navLabels: string[] = [];
  let siteName = target.hostname.replace(/^www\./i, "");

  if (homeRes.status >= 200 && homeRes.status < 400 && homeRes.text) {
    const $ = load(homeRes.text);
    title = $("title").first().text().replace(/\s+/g, " ").trim();
    siteName =
      $('meta[property="og:site_name"]').attr("content")?.trim() ||
      title.split(/[|–—-]/)[0]?.trim() ||
      siteName;
    metaDescription =
      $('meta[name="description"]').attr("content")?.trim() ||
      $('meta[property="og:description"]').attr("content")?.trim() ||
      "";
    canonicalUrl = $('link[rel="canonical"]').attr("href")?.trim() || "";
    hasCanonical = Boolean(canonicalUrl);

    const h1Nodes = $("h1");
    h1Count = h1Nodes.length;
    h1Text = h1Nodes.first().text().replace(/\s+/g, " ").trim();
    h2Count = $("h2").length;

    headings = $("h1, h2")
      .slice(0, 18)
      .map((_, el) => $(el).text().replace(/\s+/g, " ").trim())
      .get()
      .filter(Boolean);

    navLabels = $("nav a, header a")
      .slice(0, 24)
      .map((_, el) => $(el).text().replace(/\s+/g, " ").trim())
      .get()
      .filter((t) => t.length >= 2 && t.length <= 36);

    $("img").each((_, img) => {
      totalImages += 1;
      const alt = $(img).attr("alt");
      if (!alt || !alt.trim()) imagesMissingAlt += 1;
    });

    $("a[href]").each((_, a) => {
      const rawHref = ($(a).attr("href") || "").trim();
      if (
        !rawHref ||
        rawHref.startsWith("#") ||
        rawHref.startsWith("javascript:")
      )
        return;
      try {
        const resolved = new URL(rawHref, target.origin);
        if (resolved.hostname === target.hostname) internalLinkCount += 1;
        else if (["http:", "https:"].includes(resolved.protocol))
          externalLinkCount += 1;
      } catch {
        // Ignore malformed hrefs
      }
    });

    $('script[type="application/ld+json"]').each((_, el) => {
      const rawJson = $(el).contents().text().trim();
      if (!rawJson) return;
      try {
        const parsed = JSON.parse(rawJson) as unknown;
        const collectTypes = (node: unknown) => {
          if (!node || typeof node !== "object") return;
          if (Array.isArray(node)) {
            node.forEach(collectTypes);
            return;
          }
          const rec = node as Record<string, unknown>;
          if (typeof rec["@type"] === "string") schemaTypes.add(rec["@type"]);
          else if (Array.isArray(rec["@type"])) {
            rec["@type"].forEach(
              (t) => typeof t === "string" && schemaTypes.add(t),
            );
          }
          if (Array.isArray(rec["@graph"])) rec["@graph"].forEach(collectTypes);
        };
        collectTypes(parsed);
      } catch {
        // Ignore invalid JSON-LD
      }
    });

    const themeColorMeta =
      $('meta[name="theme-color"]').attr("content")?.trim() || "";
    const cssText = $("style").text().slice(0, 100_000);
    brandColors = extractSaturatedBrandColors(themeColorMeta, cssText);

    $("script, style, noscript, svg").remove();
    const cleanBodyText = $("body").text().replace(/\s+/g, " ").trim();
    bodyExcerpt = cleanBodyText.slice(0, 1500);
    wordCount = cleanBodyText.split(" ").filter(Boolean).length;
  }

  // Crawl up to 10 sitemap files and up to 500 discovered URLs
  const sitemapQueue: string[] = [];
  if (hasRobotsTxt) {
    for (const match of robotsRes.text.matchAll(/^sitemap:\s*(\S+)/gim)) {
      if (match[1]) sitemapQueue.push(match[1].trim());
    }
  }
  if (sitemapQueue.length === 0) {
    sitemapQueue.push(`${target.origin}/sitemap.xml`);
  }

  const discoveredPages = new Map<string, { url: string; title: string }>();
  if (target.href) {
    discoveredPages.set(target.href, {
      url: target.href,
      title: h1Text || title || siteName,
    });
  }

  const visitedSitemaps = new Set<string>();
  while (
    sitemapQueue.length > 0 &&
    visitedSitemaps.size < 10 &&
    discoveredPages.size < 500
  ) {
    const nextSitemapUrl = sitemapQueue.shift()!;
    if (visitedSitemaps.has(nextSitemapUrl)) continue;
    visitedSitemaps.add(nextSitemapUrl);

    const xmlRes = await fetchEdgeSafeText(nextSitemapUrl, 5000);
    if (xmlRes.status !== 200 || !xmlRes.text) continue;
    const xml = load(xmlRes.text, { xmlMode: true });
    xml("sitemap > loc").each((_, el) => {
      const loc = xml(el).text().trim();
      if (loc && !visitedSitemaps.has(loc) && sitemapQueue.length < 16) {
        sitemapQueue.push(loc);
      }
    });
    xml("url > loc").each((_, el) => {
      if (discoveredPages.size >= 500) return;
      const loc = xml(el).text().trim();
      if (!loc || discoveredPages.has(loc)) return;
      try {
        const parsedLoc = new URL(loc);
        const slugPart =
          parsedLoc.pathname
            .split("/")
            .filter(Boolean)
            .pop()
            ?.replace(/[-_]/g, " ") || siteName;
        discoveredPages.set(loc, { url: loc, title: slugPart });
      } catch {
        // Ignore invalid sitemap URL
      }
    });
  }

  const sitemapUrls = Array.from(discoveredPages.values()).slice(0, 400);
  const titlePixelEstimate = Math.round(title.length * 9.4);

  const checks: SiteAuditCheckItem[] = [
    {
      id: "meta-title",
      category: "metadata",
      label: "Meta Title Length & Pixel Width (<580px)",
      status:
        title.length >= 30 && titlePixelEstimate <= 580
          ? "pass"
          : title.length > 0
            ? "warn"
            : "fail",
      value: title
        ? `${title.length} chars (~${titlePixelEstimate}px)`
        : "Missing <title>",
      recommendation:
        title.length === 0
          ? "Add a descriptive keyword-led <title> tag under 580px."
          : titlePixelEstimate > 580
            ? "Shorten your title below ~60 chars (580px) to prevent Google SERP truncation."
            : "Pixel width is clean and SERP-safe.",
      fixToolHref: "/studio/on-page",
      fixToolLabel: "Open On-Page SEO Workbench",
    },
    {
      id: "meta-description",
      category: "metadata",
      label: "Meta Description Presence & Length (120–160 chars)",
      status:
        metaDescription.length >= 110 && metaDescription.length <= 165
          ? "pass"
          : metaDescription.length > 0
            ? "warn"
            : "fail",
      value: metaDescription
        ? `${metaDescription.length} chars`
        : "Missing meta description",
      recommendation:
        metaDescription.length === 0
          ? "Write a clear 140–158 character meta description summarizing page value."
          : "Keep meta descriptions between 120–160 characters for clean snippet display.",
      fixToolHref: "/studio/on-page",
      fixToolLabel: "Optimize in On-Page SEO",
    },
    {
      id: "h1-heading",
      category: "on-page",
      label: "Single Primary H1 Heading",
      status: h1Count === 1 ? "pass" : h1Count > 1 ? "warn" : "fail",
      value:
        h1Count === 1
          ? `1 H1 ("${h1Text.slice(0, 52)}")`
          : `${h1Count} H1 tags found`,
      recommendation:
        h1Count === 1
          ? "Exactly one clear H1 heading detected."
          : "Ensure each page uses one primary H1 aligned with search intent.",
      fixToolHref: "/studio/on-page",
      fixToolLabel: "Inspect Headings",
    },
    {
      id: "json-ld-schema",
      category: "schema",
      label: "Structured Data (@graph JSON-LD Schema)",
      status: schemaTypes.size > 0 ? "pass" : "warn",
      value:
        schemaTypes.size > 0
          ? Array.from(schemaTypes).join(", ")
          : "No JSON-LD detected",
      recommendation:
        schemaTypes.size > 0
          ? "JSON-LD structured data is active on the page."
          : "Add Organization, WebSite, or Article JSON-LD schema for richer search & AI citations.",
      fixToolHref: "/studio/technical",
      fixToolLabel: "Open Technical SEO Schema",
    },
    {
      id: "canonical-sitemap",
      category: "technical",
      label: "Canonical Tag, robots.txt & XML Sitemap",
      status:
        hasCanonical && discoveredPages.size > 1
          ? "pass"
          : hasCanonical || hasRobotsTxt
            ? "warn"
            : "fail",
      value: `${hasCanonical ? "Canonical OK" : "No Canonical"} · ${discoveredPages.size} URLs indexed`,
      recommendation:
        hasCanonical && discoveredPages.size > 1
          ? "Canonical tag and XML sitemap discovery are healthy."
          : "Verify self-referencing canonical tags and expose /sitemap.xml in robots.txt.",
      fixToolHref: "/studio/technical",
      fixToolLabel: "Open Technical SEO",
    },
    {
      id: "images-links",
      category: "links",
      label: "Internal Links & Image Alt Coverage",
      status:
        internalLinkCount >= 3 && imagesMissingAlt === 0
          ? "pass"
          : internalLinkCount >= 1
            ? "warn"
            : "fail",
      value: `${internalLinkCount} internal links · ${imagesMissingAlt}/${totalImages} missing alt`,
      recommendation:
        imagesMissingAlt > 0
          ? `Add descriptive alt text to ${imagesMissingAlt} image(s) for accessibility & image SEO.`
          : "Internal linking and image alt attributes look clean.",
      fixToolHref: "/studio/on-page",
      fixToolLabel: "Audit Images & Links",
    },
  ];

  const passPoints = checks.reduce(
    (sum, c) =>
      sum + (c.status === "pass" ? 100 : c.status === "warn" ? 60 : 20),
    0,
  );
  const overallScore = Math.round(passPoints / checks.length);

  const snapshot: SiteAuditSnapshot = {
    auditedUrl: target.href,
    auditedAtIso: nowIso,
    overallScore,
    title,
    titleLength: title.length,
    titlePixelEstimate,
    metaDescription,
    metaDescriptionLength: metaDescription.length,
    h1Count,
    h1Text,
    h2Count,
    wordCount,
    internalLinkCount,
    externalLinkCount,
    imagesMissingAlt,
    totalImages,
    schemaTypes: Array.from(schemaTypes),
    hasCanonical,
    canonicalUrl,
    hasRobotsTxt,
    hasLlmsTxt,
    sitemapPageCount: discoveredPages.size,
    brandColors,
    checks,
  };

  // Real-Time AI Niche, Offer & Non-Cannibalizing Keyword/Blog Idea Synthesis
  const aiSynthesis = await synthesizeAiSiteKeywordsAndIdeas({
    siteId: "pending",
    siteUrl: target.href,
    siteName,
    title,
    metaDescription,
    h1Text,
    headings,
    navLabels,
    bodyExcerpt,
    explicitNiche: input.niche,
    explicitAudience: input.audience,
    primaryGoal: input.primaryGoal,
    sitemapUrls,
  });

  const topicSeed =
    aiSynthesis.detectedNiche ||
    extractCleanTopicSeed({
      explicitNiche: input.niche,
      title,
      headings,
      metaDescription,
      navLabels,
      siteName,
    });

  return {
    siteName,
    normalizedUrl: target.href,
    brandColorHex: brandColors[0] || DEFAULT_BRAND_HEX,
    topicSeed,
    coreOfferSummary: aiSynthesis.coreOfferSummary,
    businessModel: aiSynthesis.businessModel,
    detectedAudience: aiSynthesis.detectedAudience,
    detectedContentPillars: aiSynthesis.contentPillars,
    robotsTxtPreview: hasRobotsTxt ? robotsRes.text.slice(0, 2000) : undefined,
    hasLlmsTxt,
    sitemapUrls,
    snapshot,
    seedKeywords: aiSynthesis.keywords,
  };
}
