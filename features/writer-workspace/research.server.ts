import { NextRequest, NextResponse } from "next/server";
import * as cheerio from "cheerio";
import { z } from "zod";
import { fetchPublic, publicUrl } from "@/features/backlink-verifier/fetch.server";
import {
  getGeminiClient,
  getGeminiModel,
  geminiTextFormat,
  isAiConfigured,
} from "@/lib/ai-tools/gemini";
import type { StudioGroundedSearchResult } from "@/lib/studio/studio-llm-gateway.server";
import { checkAiToolRateLimit } from "@/lib/ai-tools/rate-limit";
import { readBoundedJson, BodyError } from "@/lib/ai-tools/request-body";
import { parseBrief, parseBriefDirectives } from "./model";
import {
  classifyBriefAndBuildContract,
  DOITWITHAI_CAPABILITY_CATALOG,
  isFirstPartyAuthorityUrl,
  isSeoOrWebTopic,
} from "./niche-policies";
import type {
  BrandVoiceProfile,
  OutlineItem,
  ResearchCompetitorBenchmarks,
  ResearchLinkItem,
  ResearchPacket,
  SemanticTermTarget,
} from "./types";

export const researchRequestSchema = z.object({
  requestId: z.string().min(6).max(100),
  brief: z.string().min(3).max(16000),
  keyword: z.string().max(160).default(""),
  websiteUrl: z.string().max(500).default(""),
  audience: z.string().max(500).default(""),
  tone: z.string().max(100).default("auto"),
  language: z.string().max(60).default("English"),
  targetWords: z.number().min(500).max(4000).default(1600),
  lengthMode: z.enum(["auto", "custom"]).default("auto"),
  toneMode: z.enum(["auto", "custom"]).default("auto"),
  includeWebResearch: z.boolean().default(true),
});

const aiResearchSchema = z.object({
  analyzedIntent: z.string().min(10).max(600),
  searchIntent: z.enum([
    "informational",
    "commercial",
    "transactional",
    "navigational",
    "mixed",
  ]),
  primaryTopic: z.string().min(2).max(180),
  primaryKeyword: z.string().min(2).max(140),
  secondaryKeywords: z.array(z.string().min(2).max(120)).min(2).max(8),
  lsiEntities: z.array(z.string().min(2).max(120)).min(2).max(10),
  questionsToAnswer: z.array(z.string().min(5).max(200)).min(2).max(6),
  competitorAngles: z.array(z.string().min(5).max(240)).min(2).max(6),
  eeatSignals: z.array(z.string().min(5).max(220)).min(2).max(5),
});

type ResearchDeps = {
  generate?: typeof getGeminiClient;
  configured?: (model: string) => boolean;
  limit?: typeof checkAiToolRateLimit;
  fetchPage?: typeof fetchPublic;
  groundedSearch?: (params: {
    query: string;
    brief: string;
    language?: string;
    timeoutMs?: number;
    signal?: AbortSignal;
  }) => Promise<StudioGroundedSearchResult>;
};

const DOITWITHAI_INTERNAL_CATALOG = DOITWITHAI_CAPABILITY_CATALOG.map((item) => ({
  path: item.url,
  title: item.title,
  anchorText: item.anchorText,
  keywords: item.keywords,
  snippet: `${item.verifiedCapabilities.join("; ")} (Does NOT: ${item.nonCapabilities.join("; ")})`,
}));

const VERIFIED_AUTHORITY_REFERENCES: Array<{
  url: string;
  title: string;
  snippet: string;
  keywords: string;
}> = [
  {
    url: "https://developers.google.com/search/docs/fundamentals/creating-helpful-content",
    title: "Google Search Central: Creating Helpful, Reliable, People-First Content",
    snippet:
      "Official Google Search documentation explaining how search algorithms evaluate helpful, people-first content, original information, and E-E-A-T quality signals.",
    keywords: "seo ai search content helpful quality eeat google ranking website optimize",
  },
  {
    url: "https://developers.google.com/search/docs/fundamentals/seo-starter-guide",
    title: "Google Search Central: Search Engine Optimization (SEO) Starter Guide",
    snippet:
      "Canonical Google technical and editorial guide covering crawlability, descriptive titles, meta descriptions, heading hierarchy, and internal linking best practices.",
    keywords: "seo starter guide optimize website meta title headings links search engine",
  },
  {
    url: "https://developers.google.com/search/docs/appearance/ai-overviews",
    title: "Google Search Central: AI Features and Your Website",
    snippet:
      "Official guidance on how Google AI Overviews and AI Mode surface web pages, structured data, and authoritative citations in generative search experiences.",
    keywords: "ai seo ai overviews generative search aeo geo citation optimize website",
  },
  {
    url: "https://developers.google.com/search/docs/crawling-indexing/robots-meta-tag",
    title: "Google Search Central: Robots Meta Tag & max-snippet Specifications",
    snippet:
      "Official Google specification for robots meta directives including max-snippet:-1, max-image-preview:large, and max-video-preview:-1 for search and AI snippet extraction.",
    keywords: "robots meta tag max-snippet max-image-preview indexing crawling snippet preview",
  },
  {
    url: "https://developers.google.com/search/docs/appearance/structured-data/sd-policies",
    title: "Google Search Central: General Structured Data Guidelines",
    snippet:
      "Official technical and quality policies for JSON-LD structured data eligibility, entity accuracy, and content parity in Google Search rich results.",
    keywords: "structured data json-ld schema policies rich results google search",
  },
  {
    url: "https://schema.org/Article",
    title: "Schema.org: Article Structured Data Specification",
    snippet:
      "Standard Schema.org vocabulary specification for Article, BlogPosting, author attribution, publisher metadata, and machine-readable entity relationships.",
    keywords: "schema markup json-ld structured data article entity seo",
  },
  {
    url: "https://schema.org/FAQPage",
    title: "Schema.org: FAQPage Structured Data Specification",
    snippet:
      "Standard Schema.org specification for FAQPage, Question, and acceptedAnswer structured data nodes used by search and answer engines.",
    keywords: "faqpage schema question answer structured data paa people also ask",
  },
  {
    url: "https://www.w3.org/WAI/tutorials/images/decision-tree/",
    title: "W3C Web Accessibility Initiative (WAI): Image Alt Text Decision Tree",
    snippet:
      "Official W3C WCAG accessibility standard for writing descriptive alternative text for informative diagrams, infographics, and editorial images.",
    keywords: "alt text accessibility wcag images infographics visual seo",
  },
  {
    url: "https://developers.google.com/search/docs/appearance/ai-features",
    title: "Google Search Central: AI Features and Your Website (AI Overviews & AI Mode)",
    snippet:
      "Official Google Search Central documentation explaining query fan-out, technical indexing eligibility, and how AI Overviews and AI Mode select supporting links.",
    keywords: "ai features ai overviews ai mode query fan-out google search citations",
  },
  {
    url: "https://support.google.com/webmasters/answer/7576553",
    title: "Google Search Console Help: Performance Report (Search Results)",
    snippet:
      "Official Google Search Console documentation detailing clicks, impressions, CTR, and position filtering by Queries and Pages inside the Performance report.",
    keywords: "google search console performance report query page impressions clicks cannibalization",
  },
  {
    url: "https://developer.mozilla.org/en-US/docs/Web/HTML/Element/article",
    title: "MDN Web Docs: The Semantic <article> HTML Element",
    snippet:
      "Canonical MDN specification for self-contained semantic <article>, <section>, and <table> HTML markup for assistive technologies and machine parsers.",
    keywords: "semantic html article table accessibility dom extraction",
  },
  {
    url: "https://web.dev/articles/vitals",
    title: "web.dev: Core Web Vitals & Page Experience Benchmarks",
    snippet:
      "Technical performance benchmarks for Largest Contentful Paint (LCP), Interaction to Next Paint (INP), and Cumulative Layout Shift (CLS) on modern websites.",
    keywords: "technical seo core web vitals performance speed website optimization",
  },
];

/**
 * V3.12: Synthesizes a 6-dimension Query Fan-Out sub-query set covering:
 * (1) Definitional/Mechanism, (2) Comparative/Alternatives, (3) Step-by-Step Implementation,
 * (4) Cost/Latency Trade-offs, (5) Failure Modes/Edge Cases, and (6) Verification Benchmarks.
 */
export function buildQueryFanOutQuestions(
  focusKw: string,
  outline: OutlineItem[] = [],
): string[] {
  const cleanKw = (focusKw || "this workflow").trim();
  const fromOutline = outline
    .slice(0, 3)
    .map((o) => {
      const h = o.heading.trim().replace(/[.!?:]+$/, "");
      return /\?$/.test(h) ? h : `How does ${h.toLowerCase()} work in practice?`;
    });
  const fanOutPool = [
    ...fromOutline,
    `What is ${cleanKw} and how does it work in practice?`,
    `How does ${cleanKw} compare to traditional alternatives and when should you switch?`,
    `How do you implement ${cleanKw} step by step without breaking existing workflows?`,
    `What are the real cost, latency, and maintenance trade-offs of ${cleanKw}?`,
    `What common edge cases or failure modes should teams avoid with ${cleanKw}?`,
    `How do practitioners audit and verify ${cleanKw} results in 2026?`,
  ];
  const unique: string[] = [];
  for (const q of fanOutPool) {
    if (!unique.some((u) => u.toLowerCase() === q.toLowerCase())) {
      unique.push(q);
    }
    if (unique.length >= 6) break;
  }
  return unique;
}

function tokenize(text: string): Set<string> {
  return new Set(
    text
      .toLowerCase()
      .split(/[^a-z0-9\p{L}]+/u)
      .filter((t) => t.length >= 3),
  );
}

function scoreOverlap(tokens: Set<string>, candidateText: string): number {
  if (!tokens.size) return 1;
  const hay = candidateText.toLowerCase();
  let score = 0;
  for (const t of tokens) {
    if (hay.includes(t)) score += 1;
  }
  return score;
}

function cleanSearchQuery(rawTopic: string, rawKeyword: string): string {
  const source = (rawKeyword || rawTopic || "").trim();
  const stripped = source
    .replace(/\bhttps?:\/\/[^\s)>"']+/gi, " ")
    .replace(
      new RegExp(
        `\\b(?:i|want|to|write|an|article|blog|post|guide|for|my|website|site|on|the|topic|of|about|how|your|you|can|should|best|way|ways|in|${new Date().getUTCFullYear() - 1}|${new Date().getUTCFullYear()}|${new Date().getUTCFullYear() + 1})\\b`,
        "gi",
      ),
      " ",
    )
    .replace(/[^a-zA-Z0-9\p{L}\s-]+/gu, " ")
    .replace(/\s+/g, " ")
    .trim();
  const words = stripped.split(" ").filter((w) => w.length >= 2);
  if (words.length >= 2) return words.slice(0, 5).join(" ");
  return source.replace(/\bhttps?:\/\/[^\s]+/gi, "").trim().slice(0, 70);
}

function titleFromUrlPath(href: string): string {
  try {
    const u = new URL(href);
    const seg = u.pathname
      .split("/")
      .filter(Boolean)
      .pop();
    if (!seg) return u.hostname;
    return seg
      .replace(/[-_]+/g, " ")
      .replace(/\.[a-z0-9]+$/i, "")
      .replace(/\b\w/g, (c) => c.toUpperCase())
      .trim();
  } catch {
    return href;
  }
}

function isUsefulContentPath(pathname: string): boolean {
  if (!pathname || pathname === "/") return false;
  if (
    /\/(api|_next|wp-admin|wp-content|wp-json|tag|category|author|cdn-cgi|login|signup|cart|checkout)\b/i.test(
      pathname,
    )
  ) {
    return false;
  }
  return !/\.(jpg|jpeg|png|webp|gif|svg|pdf|css|js|xml|json|ico|woff2?)$/i.test(
    pathname,
  );
}

/**
 * Safely discovers verified internal links from the user's target domain using
 * SSRF-hardened `fetchPublic`, plus a built-in verified route catalog for
 * `doitwithai.tools` so self-referential or firewall-blocked scans always return
 * accurate internal links.
 */
export async function discoverSiteInternalLinks(
  rawSiteUrl: string,
  topic: string,
  keyword: string,
  signal?: AbortSignal,
  fetcher: typeof fetchPublic = fetchPublic,
): Promise<{ links: ResearchLinkItem[]; warnings: string[]; origin?: string }> {
  const trimmed = rawSiteUrl.trim().replace(/[.,;:'")\]}>]+$/, "");
  if (!trimmed) return { links: [], warnings: [] };
  let originUrl: URL;
  try {
    const normalized = /^https?:\/\//i.test(trimmed)
      ? trimmed
      : `https://${trimmed}`;
    originUrl = publicUrl(normalized);
  } catch (err) {
    return {
      links: [],
      warnings: [
        err instanceof Error
          ? err.message
          : "Website URL could not be verified as a public HTTP(S) host.",
      ],
    };
  }

  const tokens = tokenize(`${topic} ${keyword}`);
  const candidates = new Map<string, ResearchLinkItem>();
  const warnings: string[] = [];
  const cleanHost = originUrl.hostname.replace(/^www\./i, "").toLowerCase();
  const sameHost = (u: URL) =>
    u.hostname.replace(/^www\./i, "").toLowerCase() === cleanHost;

  // Built-in verified catalog when writing for doitwithai.tools
  if (cleanHost === "doitwithai.tools" || cleanHost.includes("doitwithai")) {
    for (const item of DOITWITHAI_INTERNAL_CATALOG) {
      const fullUrl = new URL(item.path, "https://doitwithai.tools").href;
      const rel = scoreOverlap(tokens, `${item.title} ${item.keywords}`);
      candidates.set(fullUrl, {
        url: fullUrl,
        title: item.title,
        anchorText: item.anchorText,
        snippet: item.snippet,
        sourceKind: "internal",
        relevanceScore: rel + 2,
      });
    }
  }

  // 1. Try sitemap.xml first for clean canonical page discovery
  for (const path of ["/sitemap.xml", "/wp-sitemap.xml"]) {
    if (candidates.size >= 25) break;
    try {
      const sitemapUrl = new URL(path, originUrl.origin).href;
      const res = await fetcher(sitemapUrl, {
        signal,
        text: true,
        timeout: 5500,
      });
      if (res.status >= 200 && res.status < 300 && res.html) {
        const locs = Array.from(
          res.html.matchAll(/<loc>\s*([^<\s]+)\s*<\/loc>/gi),
        ).map((m) => m[1]);
        for (const loc of locs.slice(0, 120)) {
          try {
            const u = new URL(loc);
            if (sameHost(u) && isUsefulContentPath(u.pathname)) {
              const title = titleFromUrlPath(u.href);
              candidates.set(u.href, {
                url: u.href,
                title,
                anchorText: title.toLowerCase(),
                sourceKind: "internal",
                relevanceScore: scoreOverlap(tokens, `${u.pathname} ${title}`),
              });
            }
          } catch {
            // Skip malformed sitemap loc
          }
        }
        if (candidates.size > 0) break;
      }
    } catch {
      // Sitemap optional; fall through cleanly to homepage crawl
    }
  }

  // 2. Crawl homepage anchors for live navigation / hub pages & richer anchor text
  try {
    const home = await fetcher(originUrl.href, {
      signal,
      html: true,
      timeout: 5500,
    });
    if (home.status >= 200 && home.status < 400 && home.html) {
      const $ = cheerio.load(home.html);
      $("a[href]").each((_, el) => {
        if (candidates.size >= 80) return;
        const rawHref = $(el).attr("href") || "";
        const anchor = $(el).text().replace(/\s+/g, " ").trim();
        if (
          !rawHref ||
          rawHref.startsWith("#") ||
          /^(mailto:|tel:|javascript:)/i.test(rawHref)
        ) {
          return;
        }
        try {
          const u = new URL(rawHref, originUrl.origin);
          u.hash = "";
          if (!/^https?:$/.test(u.protocol) || !sameHost(u)) return;
          if (!isUsefulContentPath(u.pathname)) return;
          const label =
            anchor.length >= 4 && anchor.length <= 90
              ? anchor
              : titleFromUrlPath(u.href);
          const existing = candidates.get(u.href);
          const rel = scoreOverlap(tokens, `${u.pathname} ${label}`);
          if (!existing || rel >= (existing.relevanceScore || 0)) {
            candidates.set(u.href, {
              url: u.href,
              title: label,
              anchorText: label,
              sourceKind: "internal",
              relevanceScore: rel,
            });
          }
        } catch {
          // Ignore invalid href
        }
      });
    }
  } catch (err) {
    if (!candidates.size) {
      warnings.push(
        err instanceof Error
          ? `Could not scan ${originUrl.hostname}: ${err.message}`
          : `Could not reach ${originUrl.hostname} to collect internal links.`,
      );
    }
  }

  if (candidates.size === 0) {
    candidates.set(originUrl.href, {
      url: originUrl.href,
      title: `${originUrl.hostname} Official Website`,
      anchorText: originUrl.hostname,
      sourceKind: "internal",
      relevanceScore: 1,
    });
  }

  const ranked = Array.from(candidates.values())
    .sort((a, b) => (b.relevanceScore || 0) - (a.relevanceScore || 0))
    .slice(0, 8);

  return {
    links: ranked,
    warnings,
    origin: originUrl.origin,
  };
}

/**
 * Queries safe public reference APIs (Wikipedia OpenSearch + DuckDuckGo Instant Answer)
 * with a distilled keyword query and supplements with verified primary industry documentation
 * so Authority External References are always populated with real, verifiable citations.
 */
export async function discoverPublicAuthorityLinks(
  topic: string,
  keyword: string,
  language: string,
  signal?: AbortSignal,
  fetcher: typeof fetchPublic = fetchPublic,
): Promise<{
  links: ResearchLinkItem[];
  snippets: string[];
  warnings: string[];
}> {
  const query = cleanSearchQuery(topic, keyword);
  if (!query) return { links: [], snippets: [], warnings: [] };

  const links: ResearchLinkItem[] = [];
  const snippets: string[] = [];
  const warnings: string[] = [];
  const tokens = tokenize(`${topic} ${keyword} ${query}`);
  const langCode = /^spanish/i.test(language)
    ? "es"
    : /^french/i.test(language)
      ? "fr"
      : /^german/i.test(language)
        ? "de"
        : "en";

  try {
    const wikiUrl = `https://${langCode}.wikipedia.org/w/api.php?action=opensearch&search=${encodeURIComponent(
      query,
    )}&limit=4&namespace=0&format=json`;
    const res = await fetcher(wikiUrl, { signal, text: true, timeout: 4500 });
    if (res.status >= 200 && res.status < 300 && res.html) {
      const parsed = JSON.parse(res.html) as [
        string,
        string[],
        string[],
        string[],
      ];
      const titles = parsed[1] || [];
      const descs = parsed[2] || [];
      const urls = parsed[3] || [];
      for (let i = 0; i < Math.min(4, urls.length); i++) {
        if (urls[i] && /^https:\/\//i.test(urls[i])) {
          const descText =
            descs[i] && descs[i].length >= 85
              ? descs[i]
              : `${titles[i] || "Reference"}: Encyclopedic overview and foundational terminology covering ${titles[i] || query} for editorial verification.`;
          links.push({
            url: urls[i],
            title: `${titles[i] || urls[i]} (Wikipedia)`,
            snippet: descText,
            sourceKind: "external",
            relevanceScore: scoreOverlap(tokens, `${titles[i]} ${descText}`) + 2,
          });
          snippets.push(`${titles[i]}: ${descText}`);
        }
      }
    }
  } catch {
    warnings.push("Wikipedia public lookup unavailable; using verified reference catalog.");
  }

  try {
    const ddgUrl = `https://api.duckduckgo.com/?q=${encodeURIComponent(
      query,
    )}&format=json&no_html=1&skip_disambig=1`;
    const res = await fetcher(ddgUrl, { signal, text: true, timeout: 4500 });
    if (res.status >= 200 && res.status < 300 && res.html) {
      const data = JSON.parse(res.html) as {
        AbstractText?: string;
        AbstractURL?: string;
        Heading?: string;
      };
      if (data.AbstractURL && /^https?:\/\//i.test(data.AbstractURL)) {
        if (!links.some((l) => l.url === data.AbstractURL)) {
          const abst =
            data.AbstractText && data.AbstractText.length >= 85
              ? data.AbstractText
              : `Public reference overview for ${data.Heading || query}, providing background definitions and industry context.`;
          links.push({
            url: data.AbstractURL,
            title: data.Heading || data.AbstractURL,
            snippet: abst,
            sourceKind: "external",
            relevanceScore: scoreOverlap(tokens, `${data.Heading} ${abst}`) + 2,
          });
        }
        if (data.AbstractText) snippets.push(data.AbstractText);
      }
    }
  } catch {
    // Public fallback optional
  }

  // Only include hardcoded SEO/Web fallback references when the user topic actually concerns SEO or web engineering
  const seoTopicActive = isSeoOrWebTopic(`${topic} ${keyword} ${query}`);
  const rankedCatalog = seoTopicActive
    ? [...VERIFIED_AUTHORITY_REFERENCES]
        .map((ref) => ({
          ...ref,
          score: scoreOverlap(tokens, `${ref.title} ${ref.keywords} ${ref.snippet}`),
        }))
        .sort((a, b) => b.score - a.score)
    : [];

  for (const ref of rankedCatalog) {
    if (links.length >= 6) break;
    if (ref.score <= 1) continue; // Only include catalog docs genuinely relevant to topic tokens
    if (!links.some((l) => l.url === ref.url)) {
      links.push({
        url: ref.url,
        title: ref.title,
        snippet: ref.snippet,
        sourceKind: "external",
        relevanceScore: ref.score,
      });
      if (snippets.length < 6) {
        snippets.push(`${ref.title}: ${ref.snippet}`);
      }
    }
  }

  return { links: links.slice(0, 6), snippets: snippets.slice(0, 6), warnings };
}

function defaultCompetitorBenchmarks(targetWords: number): ResearchCompetitorBenchmarks {
  const baseWords = Math.max(800, Math.min(3600, targetWords || 1600));
  const targetH2Min = baseWords <= 1100 ? 4 : baseWords >= 2400 ? 7 : 5;
  const targetH2Max = targetH2Min + 3;
  return {
    targetWordsMin: Math.round(baseWords * 0.85),
    targetWordsMax: Math.round(baseWords * 1.25),
    targetH2Min,
    targetH2Max,
    targetParagraphsMin: Math.max(12, Math.round(baseWords / 65)),
    targetParagraphsMax: Math.max(22, Math.round(baseWords / 36)),
    targetImagesMin: Math.max(2, Math.round(targetH2Min * 0.4)),
    targetImagesMax: targetH2Max,
    analyzedPages: [],
  };
}

/**
 * Fetches up to 3 public grounded source/competitor URLs using SSRF-hardened `fetchPublic`
 * to compute real competitor word counts, H2 structures, paragraph density, and media targets.
 */
async function analyzeCompetitorUrls(
  candidateUrls: string[],
  targetWords: number,
  signal?: AbortSignal,
  fetcher: typeof fetchPublic = fetchPublic,
): Promise<ResearchCompetitorBenchmarks> {
  const baseline = defaultCompetitorBenchmarks(targetWords);
  const directCandidates = candidateUrls
    .filter(
      (u) =>
        /^https?:\/\//i.test(u) &&
        !/vertexaisearch\.cloud\.google\.com\/grounding-api-redirect/i.test(u) &&
        !/\.(pdf|png|jpg|jpeg|webp|svg)$/i.test(u) &&
        !/(youtube\.com|twitter\.com|x\.com|facebook\.com|instagram\.com|linkedin\.com)/i.test(
          u,
        ),
    )
    .slice(0, 3);

  if (!directCandidates.length) return baseline;

  const settled = await Promise.allSettled(
    directCandidates.map(async (url) => {
      const res = await fetcher(url, { signal, html: true, timeout: 4500 });
      if (!res || res.status < 200 || res.status >= 400 || !res.html) {
        return null;
      }
      const $ = cheerio.load(res.html);
      $("script,style,noscript,nav,footer,header,aside,form").remove();
      const root = $("main, article, [role='main']").first();
      const scope = root.length ? root : $("body");
      const title =
        $("title").first().text().trim() ||
        $("h1").first().text().trim() ||
        titleFromUrlPath(url);
      const h2Headings = scope
        .find("h2")
        .map((_, el) => $(el).text().replace(/\s+/g, " ").trim())
        .get()
        .filter((h) => h.length >= 4 && h.length <= 120)
        .slice(0, 14);
      const paragraphs = scope.find("p").length;
      const images = scope.find("img").length;
      const text = scope.text().replace(/\s+/g, " ").trim();
      const words = text ? text.split(" ").filter(Boolean).length : 0;
      if (words < 180) return null;
      return {
        url: res.url || url,
        title: title.slice(0, 160),
        wordCount: words,
        h2Count: h2Headings.length,
        paragraphs,
        images,
        h2Headings,
      };
    }),
  );

  const analyzed = settled
    .map((s) => (s.status === "fulfilled" ? s.value : null))
    .filter((v): v is NonNullable<typeof v> => Boolean(v));

  if (!analyzed.length) return baseline;

  const wordsArr = analyzed.map((p) => p.wordCount);
  const h2Arr = analyzed.map((p) => p.h2Count).filter((n) => n > 0);
  const paraArr = analyzed.map((p) => p.paragraphs).filter((n) => n > 0);
  const imgArr = analyzed.map((p) => p.images);

  const minW = Math.min(...wordsArr);
  const maxW = Math.max(...wordsArr);
  return {
    targetWordsMin: Math.max(800, Math.min(3600, Math.round(minW * 0.9))),
    targetWordsMax: Math.max(1200, Math.min(4500, Math.round(maxW * 1.15))),
    targetH2Min: h2Arr.length ? Math.max(3, Math.min(...h2Arr)) : baseline.targetH2Min,
    targetH2Max: h2Arr.length
      ? Math.min(12, Math.max(...h2Arr) + 1)
      : baseline.targetH2Max,
    targetParagraphsMin: paraArr.length
      ? Math.max(10, Math.min(...paraArr))
      : baseline.targetParagraphsMin,
    targetParagraphsMax: paraArr.length
      ? Math.min(
          140,
          Math.round(
            Math.max(
              paraArr.reduce((a, b) => a + b, 0) / paraArr.length + 12,
              ...paraArr,
            ),
          ),
        )
      : baseline.targetParagraphsMax,
    targetImagesMin: Math.max(
      2,
      imgArr.length ? Math.min(6, Math.max(2, Math.min(...imgArr))) : baseline.targetImagesMin,
    ),
    targetImagesMax: Math.min(
      12,
      Math.max(4, ...(imgArr.length ? imgArr : [baseline.targetImagesMax])),
    ),
    analyzedPages: analyzed.map(({ url, title, wordCount: wc, h2Headings }) => ({
      url,
      title,
      wordCount: wc,
      h2Headings,
    })),
  };
}

/**
 * Samples up to 2 editorial pages ONLY on an explicitly connected website URL
 * to derive a concise, factual Brand Voice profile (tone, POV, sentence rhythm).
 */
async function extractWebsiteBrandVoice(
  siteOrigin: string | undefined,
  internalLinks: ResearchLinkItem[],
  signal?: AbortSignal,
  fetcher: typeof fetchPublic = fetchPublic,
): Promise<BrandVoiceProfile | undefined> {
  if (!siteOrigin) return undefined;
  let cleanDomain = siteOrigin;
  try {
    cleanDomain = new URL(siteOrigin).hostname.replace(/^www\./i, "");
  } catch {
    return undefined;
  }

  const pageCandidates = [
    ...internalLinks
      .filter(
        (l) =>
          /^https?:\/\//i.test(l.url) &&
          l.url.includes(cleanDomain) &&
          !/\/(?:pricing|login|signup|contact|privacy|terms)/i.test(l.url),
      )
      .slice(0, 2)
      .map((l) => l.url),
  ];
  if (!pageCandidates.length) pageCandidates.push(siteOrigin);

  const sampledText: string[] = [];
  const sampledPages: string[] = [];
  for (const pageUrl of pageCandidates.slice(0, 2)) {
    try {
      const res = await fetcher(pageUrl, { signal, html: true, timeout: 4000 });
      if (res.status >= 200 && res.status < 400 && res.html) {
        const $ = cheerio.load(res.html);
        $("script,style,noscript,nav,footer,header").remove();
        const paragraphs = $("p")
          .map((_, el) => $(el).text().replace(/\s+/g, " ").trim())
          .get()
          .filter((p) => p.length >= 60 && p.length <= 500)
          .slice(0, 6);
        if (paragraphs.length > 0) {
          sampledPages.push(res.url || pageUrl);
          sampledText.push(paragraphs.join(" "));
          const metaDesc = $('meta[name="description"]').attr("content")?.trim();
          const matchingLink = internalLinks.find((l) => l.url === pageUrl);
          if (matchingLink && metaDesc && !matchingLink.snippet) {
            matchingLink.snippet = metaDesc.slice(0, 180);
          }
        }
      }
    } catch {
      // Optional enrichment; skip unreachable pages
    }
  }

  const combined = sampledText.join(" ");
  if (!combined) {
    return {
      sourceDomain: cleanDomain,
      voiceSummary: `Direct, clear, practical editorial voice aligned with ${cleanDomain}.`,
      pointOfView: "Second-person (you/your) with clear, concrete recommendations",
      sentenceRhythm: "Clear medium sentences mixed with concise takeaways (10–20 words avg)",
      vocabularyNotes: [],
      avoidPhrases: ["hype claims", "hollow AI clichés", "repetitive keyword openers"],
      sampledPages: [],
    };
  }

  const youHits = (combined.match(/\b(?:you|your|yours)\b/gi) || []).length;
  const weHits = (combined.match(/\b(?:we|our|us)\b/gi) || []).length;
  const pointOfView =
    weHits > youHits * 1.4
      ? "First-person plural practitioner (we/our)"
      : "Direct second-person guide (you/your)";

  const sentences = combined
    .split(/(?<=[.!?])\s+/)
    .map((s) => s.trim().split(/\s+/).length)
    .filter((n) => n >= 4 && n <= 60);
  const avgLen = sentences.length
    ? Math.round(sentences.reduce((a, b) => a + b, 0) / sentences.length)
    : 16;

  return {
    sourceDomain: cleanDomain,
    voiceSummary: `Practical, reader-first voice sampled from ${cleanDomain} (${avgLen}w avg sentences, concrete explanations over filler).`,
    pointOfView,
    sentenceRhythm: `Average ~${avgLen} words per sentence with varied short/medium pacing.`,
    vocabularyNotes: [],
    avoidPhrases: [
      "in today's fast-paced digital landscape",
      "delve into",
      "game-changer",
      "mechanical keyword repetition",
    ],
    sampledPages,
  };
}

function buildWeightedSemanticTerms(
  primaryKeyword: string,
  secondaryKeywords: string[],
  lsiEntities: string[],
): SemanticTermTarget[] {
  const seen = new Set<string>();
  const terms: SemanticTermTarget[] = [];
  const pushTerm = (
    raw: string,
    minCount: number,
    maxCount: number,
    category: SemanticTermTarget["category"],
  ) => {
    const clean = raw.trim();
    const key = clean.toLowerCase();
    if (!clean || clean.length < 2 || seen.has(key)) return;
    seen.add(key);
    terms.push({ term: clean, minCount, maxCount, category });
  };

  if (primaryKeyword.trim()) {
    pushTerm(primaryKeyword, 1, 3, "primary");
  }
  for (const s of secondaryKeywords.slice(0, 8)) {
    pushTerm(s, 1, 4, "secondary");
  }
  for (const e of lsiEntities.slice(0, 8)) {
    pushTerm(e, 1, 3, "entity");
  }
  return terms.slice(0, 16);
}

function buildNeutralTopicEntities(
  topic: string,
  focusKw: string,
  outline: OutlineItem[],
): string[] {
  const stopWords = new Set([
    "what",
    "how",
    "why",
    "when",
    "which",
    "with",
    "from",
    "your",
    "this",
    "that",
    "guide",
    "best",
    "practical",
    "steps",
    "complete",
  ]);
  const seeds: string[] = [];
  for (const o of outline.slice(0, 4)) {
    const clean = o.heading.replace(/[:?]+$/, "").trim();
    if (clean && !seeds.includes(clean)) seeds.push(clean);
  }
  const tokens = `${topic} ${focusKw}`
    .split(/[^a-zA-Z0-9\p{L}-]+/u)
    .map((t) => t.trim())
    .filter((t) => t.length >= 4 && !stopWords.has(t.toLowerCase()));
  for (const t of tokens) {
    if (seeds.length >= 6) break;
    if (!seeds.some((s) => s.toLowerCase() === t.toLowerCase())) {
      seeds.push(t);
    }
  }
  if (!seeds.length && focusKw) {
    seeds.push(focusKw, `${focusKw} workflow`, `${focusKw} trade-offs`);
  }
  return seeds.slice(0, 6);
}

export function createResearchHandler(deps: ResearchDeps = {}) {
  return async (req: NextRequest) => {
    let release: (() => Promise<void>) | undefined;
    try {
      const data = researchRequestSchema.parse(await readBoundedJson(req, 32000));

      // Enforce rate limit BEFORE executing any external site crawls, search APIs, or LLM grounding calls
      const limit = await (deps.limit || checkAiToolRateLimit)(
        req,
        "writer-workspace",
        { dailyLimit: 100, burstLimit: 18, refundFailures: true },
      );
      if (!limit.allowed) {
        return NextResponse.json(
          { error: "Research rate limit reached; retry in a moment." },
          {
            status: 429,
            headers: { "Retry-After": String(limit.retryAfterSeconds) },
          },
        );
      }
      release = limit.release;

      const parsed = parseBrief(data.brief);
      const directives = parseBriefDirectives(data.brief);
      const targetSite = (directives.websiteUrl || data.websiteUrl || "").trim();
      const topic = parsed.topic || data.keyword || "Article Topic";
      const focusKw = (
        data.keyword ||
        parsed.keyword ||
        cleanSearchQuery(topic, "") ||
        topic
      )
        .trim()
        .slice(0, 120);

      const initialContract = classifyBriefAndBuildContract({
        topic,
        keyword: focusKw,
        brief: data.brief,
        audience: data.audience,
        lengthMode: data.lengthMode,
        customTargetWords: data.lengthMode === "custom" ? data.targetWords : undefined,
        toneMode: data.toneMode,
        customTone: data.toneMode === "custom" ? data.tone : undefined,
      });
      const effectiveTargetWords =
        data.lengthMode === "custom"
          ? data.targetWords
          : initialContract.recommendedTargetWords;

      const fetcher = deps.fetchPage || fetchPublic;
      const [siteResult, groundedResult, webResult] = await Promise.all([
        targetSite
          ? discoverSiteInternalLinks(
              targetSite,
              topic,
              focusKw,
              req.signal,
              fetcher,
            )
          : Promise.resolve({ links: [], warnings: [], origin: undefined }),
        data.includeWebResearch && deps.groundedSearch
          ? deps
              .groundedSearch({
                query: focusKw || cleanSearchQuery(topic, focusKw),
                brief: data.brief,
                language: data.language,
                signal: req.signal,
              })
              .catch(() => ({
                groundedSummary: "",
                searchQueries: [],
                groundedSources: [],
                provider: "none" as const,
              }))
          : Promise.resolve({
              groundedSummary: "",
              searchQueries: [],
              groundedSources: [],
              provider: "none" as const,
            }),
        data.includeWebResearch
          ? discoverPublicAuthorityLinks(
              topic,
              focusKw,
              data.language,
              req.signal,
              fetcher,
            )
          : Promise.resolve({ links: [], snippets: [], warnings: [] }),
      ]);

      const mergedExternalLinks: ResearchLinkItem[] = [];
      const seenExt = new Set<string>();
      for (const gs of groundedResult.groundedSources || []) {
        if (
          gs.url &&
          !seenExt.has(gs.url) &&
          isFirstPartyAuthorityUrl(gs.url, data.websiteUrl)
        ) {
          seenExt.add(gs.url);
          mergedExternalLinks.push({
            url: gs.url,
            title: gs.title,
            snippet: gs.snippet,
            sourceKind: "external",
            relevanceScore: 10,
          });
        }
      }
      for (const wl of webResult.links) {
        if (
          wl.url &&
          !seenExt.has(wl.url) &&
          isFirstPartyAuthorityUrl(wl.url, data.websiteUrl)
        ) {
          seenExt.add(wl.url);
          mergedExternalLinks.push(wl);
        }
      }

      const [competitorBenchmarks, brandVoice] = await Promise.all([
        data.includeWebResearch
          ? analyzeCompetitorUrls(
              mergedExternalLinks.map((l) => l.url),
              effectiveTargetWords,
              req.signal,
              fetcher,
            )
          : Promise.resolve(defaultCompetitorBenchmarks(effectiveTargetWords)),
        siteResult.origin
          ? extractWebsiteBrandVoice(
              siteResult.origin,
              siteResult.links,
              req.signal,
              fetcher,
            )
          : Promise.resolve(undefined),
      ]);

      const briefContract = classifyBriefAndBuildContract({
        topic,
        keyword: focusKw,
        brief: data.brief,
        audience: data.audience,
        lengthMode: data.lengthMode,
        customTargetWords: data.lengthMode === "custom" ? data.targetWords : undefined,
        toneMode: data.toneMode,
        customTone: data.toneMode === "custom" ? data.tone : undefined,
        brandVoice,
        competitorBenchmarks,
      });

      const resolvedBenchmarks: ResearchCompetitorBenchmarks =
        data.lengthMode !== "custom"
          ? {
              ...competitorBenchmarks,
              targetWordsMin: briefContract.targetWordsMin,
              targetWordsMax: briefContract.targetWordsMax,
            }
          : competitorBenchmarks;

      const researchMode: ResearchPacket["researchMode"] =
        groundedResult.provider === "gemini-google-search"
          ? "live-google-grounding"
          : groundedResult.provider === "serper" ||
              groundedResult.provider === "tavily"
            ? "live-serp-api"
            : data.includeWebResearch && mergedExternalLinks.length > 0
              ? "public-reference"
              : "brief-only";

      const model = getGeminiModel("CONTENT_WRITER");
      const warnings = [...siteResult.warnings, ...webResult.warnings];
      const fanOutQuestions = buildQueryFanOutQuestions(focusKw, parsed.outline);

      if (!(deps.configured || isAiConfigured)(model)) {
        const secondaryKws = parsed.outline.length
          ? parsed.outline.map((o) => o.heading).slice(0, 5)
          : [
              `${focusKw} workflow`,
              `${focusKw} comparison`,
              `${focusKw} trade-offs`,
              `${focusKw} checklist`,
            ];
        const lsiEntities = buildNeutralTopicEntities(
          topic,
          focusKw,
          parsed.outline,
        );
        const packet: ResearchPacket = {
          analyzedIntent: `Target topic "${topic}" focused on "${focusKw}" in ${data.language}.`,
          searchIntent: "informational",
          primaryTopic: topic,
          primaryKeyword: focusKw,
          secondaryKeywords: secondaryKws,
          lsiEntities,
          questionsToAnswer: fanOutQuestions,
          competitorAngles: [
            `Compare real ${focusKw} options and explain explicit decision criteria`,
            `Highlight common mistakes, edge cases, and when simpler alternatives work better`,
            `Provide verifiable steps and concrete examples tailored to ${data.audience || "practitioners"}`,
          ],
          eeatSignals: [
            "Support claims with grounded documentation or explicit practitioner observations",
            "State concrete conditions, limitations, and scope clearly",
            "Avoid vague promotional filler and unsupported performance promises",
          ],
          conclusionDirective: directives.conclusionStyle || undefined,
          visualDirectives: directives.visualHints,
          internalLinks: siteResult.links,
          externalLinks: mergedExternalLinks.slice(0, 8),
          quickAnswerTargetWords: 50,
          fetchedAt: new Date().toISOString(),
          siteScanned: siteResult.origin,
          researchMode,
          searchQueriesUsed: groundedResult.searchQueries,
          groundedSummary: groundedResult.groundedSummary || undefined,
          competitorBenchmarks: resolvedBenchmarks,
          semanticTerms: buildWeightedSemanticTerms(
            focusKw,
            secondaryKws,
            lsiEntities,
          ),
          evidencePassages: mergedExternalLinks
            .filter((l) => l.snippet)
            .slice(0, 10)
            .map((l) => ({
              claimOrFact: l.snippet!.slice(0, 450),
              sourceTitle: l.title,
              sourceUrl: l.url,
            })),
          brandVoice,
          briefContract,
          capabilityLinks: DOITWITHAI_CAPABILITY_CATALOG,
          warnings: [
            ...warnings,
            "AI keyword clustering is offline; using deterministic brief analysis.",
          ],
        };
        return NextResponse.json({ ok: true, packet, provider: "deterministic" });
      }

      const aiRes = await (deps.generate || getGeminiClient)().generate(
        {
          model,
          max_output_tokens: 1800,
          store: false,
          input: [
            {
              role: "system",
              content:
                "You are an SEO, AEO, Query Fan-Out & Information Gain editorial research strategist operating across all niches. Deeply analyze the user's brief, detected content archetype & niche policy, custom headings, visual/conclusion requests, and verified web snippets to build an actionable keyword/intent/E-E-A-T research packet. Ensure primaryKeyword is a clean 2-6 word search query (never a full sentence or URL). In questionsToAnswer, generate 5-6 natural People Also Ask (PAA) & Query Fan-Out sub-questions ending with '?' that span definitional, comparative ('vs.'), step-by-step implementation, trade-offs, and failure-mode/edge-case intents. In competitorAngles, surface concrete Information Gain subtopic gaps (decision criteria, counterexamples, and implementation edge cases). Never fabricate external URLs or statistics. Return only requested JSON.",
            },
            {
              role: "user",
              content: JSON.stringify({
                brief: data.brief,
                topic,
                keyword: focusKw,
                audience: data.audience,
                tone: briefContract.resolvedTone,
                archetype: briefContract.archetypeLabel,
                niche: briefContract.nicheLabel,
                language: data.language,
                extractedOutline: parsed.outline,
                directives,
                webSnippets: [
                  ...(groundedResult.groundedSummary
                    ? [`Live Search Summary:\n${groundedResult.groundedSummary}`]
                    : []),
                  ...webResult.snippets,
                ],
                competitorHeadings: competitorBenchmarks.analyzedPages.map((p) => ({
                  title: p.title,
                  h2s: p.h2Headings.slice(0, 8),
                })),
                internalPagesFound: siteResult.links.map((l) => l.title),
              }),
            },
          ],
          text: {
            format: geminiTextFormat(aiResearchSchema, "writer_research_packet"),
          },
        },
        { timeout: 30000, maxRetries: 0 },
      );

      const parsedAi = aiResearchSchema.parse(aiRes.output_parsed);
      const mergedQuestions = [
        ...parsedAi.questionsToAnswer,
        ...fanOutQuestions,
      ]
        .filter(
          (q, idx, arr) =>
            Boolean(q.trim()) &&
            arr.findIndex((other) => other.toLowerCase() === q.toLowerCase()) ===
              idx,
        )
        .slice(0, 6);

      const finalPrimaryKw =
        parsedAi.primaryKeyword.length <= 75 ? parsedAi.primaryKeyword : focusKw;
      const packet: ResearchPacket = {
        ...parsedAi,
        primaryKeyword: finalPrimaryKw,
        questionsToAnswer: mergedQuestions,
        conclusionDirective: directives.conclusionStyle || undefined,
        visualDirectives: directives.visualHints,
        internalLinks: siteResult.links,
        externalLinks: mergedExternalLinks.slice(0, 8),
        quickAnswerTargetWords: 50,
        fetchedAt: new Date().toISOString(),
        siteScanned: siteResult.origin,
        researchMode,
        searchQueriesUsed: groundedResult.searchQueries,
        groundedSummary: groundedResult.groundedSummary || undefined,
        competitorBenchmarks: resolvedBenchmarks,
        semanticTerms: buildWeightedSemanticTerms(
          finalPrimaryKw,
          parsedAi.secondaryKeywords,
          parsedAi.lsiEntities,
        ),
        evidencePassages: mergedExternalLinks
          .filter((l) => l.snippet)
          .slice(0, 10)
          .map((l) => ({
            claimOrFact: l.snippet!.slice(0, 450),
            sourceTitle: l.title,
            sourceUrl: l.url,
          })),
        brandVoice,
        briefContract,
        capabilityLinks: DOITWITHAI_CAPABILITY_CATALOG,
        warnings,
      };

      return NextResponse.json(
        {
          ok: true,
          packet,
          provider: aiRes.provider || "configured provider",
        },
        { headers: { "Cache-Control": "no-store" } },
      );
    } catch (error) {
      await release?.().catch(() => {});
      if (error instanceof z.ZodError || error instanceof BodyError) {
        return NextResponse.json(
          { error: "Invalid research request payload." },
          { status: 422 },
        );
      }
      return NextResponse.json(
        { error: "Could not complete research packet gathering." },
        { status: 503 },
      );
    }
  };
}
