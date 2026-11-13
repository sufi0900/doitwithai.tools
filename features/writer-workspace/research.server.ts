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
import { checkAiToolRateLimit } from "@/lib/ai-tools/rate-limit";
import { readBoundedJson, BodyError } from "@/lib/ai-tools/request-body";
import { parseBrief, parseBriefDirectives } from "./model";
import type { ResearchLinkItem, ResearchPacket } from "./types";

export const researchRequestSchema = z.object({
  requestId: z.string().min(6).max(100),
  brief: z.string().min(3).max(16000),
  keyword: z.string().max(160).default(""),
  websiteUrl: z.string().max(500).default(""),
  audience: z.string().max(500).default(""),
  tone: z.string().max(100).default("Clear and helpful"),
  language: z.string().max(60).default("English"),
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
};

const DOITWITHAI_INTERNAL_CATALOG: Array<{
  path: string;
  title: string;
  anchorText: string;
  keywords: string;
}> = [
  {
    path: "/ai-content-writer",
    title: "AI Content Writer & Publishing Studio",
    anchorText: "AI Content Writer Studio",
    keywords: "ai content writer blog article studio seo writing workflow",
  },
  {
    path: "/tools/on-page-ai-seo-analyzer",
    title: "On-Page AI SEO Analyzer",
    anchorText: "on-page AI SEO audit tool",
    keywords: "on-page seo analyzer website optimization audit headings meta",
  },
  {
    path: "/tools/ai-citation-readiness-checker",
    title: "AI Citation & GEO Readiness Checker",
    anchorText: "AI citation readiness checker",
    keywords: "ai seo geo aeo citation readiness google ai overviews",
  },
  {
    path: "/tools/blog-section-infographic-generator",
    title: "Blog Section Infographic Generator",
    anchorText: "blog section infographic generator",
    keywords: "infographic generator visual content blog diagrams svg",
  },
  {
    path: "/tools/schema-markup-generator",
    title: "Schema Markup & JSON-LD Generator",
    anchorText: "JSON-LD schema markup generator",
    keywords: "schema markup json-ld structured data article faqpage seo",
  },
  {
    path: "/tools/readability-checker",
    title: "AI Readability & Clarity Checker",
    anchorText: "readability and sentence clarity checker",
    keywords: "readability score flesch grade level clear writing sentences",
  },
  {
    path: "/tools/keyword-clustering-tool",
    title: "AI Keyword Clustering & Topic Map Tool",
    anchorText: "keyword clustering tool",
    keywords: "keyword research clustering search intent topic clusters",
  },
  {
    path: "/tools/internal-link-opportunity-finder",
    title: "Internal Link Opportunity Finder",
    anchorText: "internal link opportunity finder",
    keywords: "internal linking anchor text site architecture seo links",
  },
  {
    path: "/tools/serp-rich-result-preview-generator",
    title: "Google SERP & Rich Result Simulator",
    anchorText: "Google SERP preview simulator",
    keywords: "serp preview meta title description pixel width rich results",
  },
  {
    path: "/tools/search-intent-checker",
    title: "Search Intent & SERP Alignment Checker",
    anchorText: "search intent analyzer",
    keywords: "search intent informational commercial transactional query",
  },
  {
    path: "/tools/eeat-content-auditor",
    title: "E-E-A-T Content Quality Auditor",
    anchorText: "E-E-A-T content quality auditor",
    keywords: "eeat experience expertise authoritativeness trustworthiness",
  },
  {
    path: "/ai-seo/ai-readability-tools",
    title: "AI Readability Tools & Comprehension Guide",
    anchorText: "AI readability and comprehension guide",
    keywords: "readability tools comprehension clarity editorial review",
  },
  {
    path: "/tools/seo-content-pricing-calculator",
    title: "AI SEO Content Writing Cost & Per-Article ROI Calculator",
    anchorText: "SEO content pricing and ROI calculator",
    keywords: "content writing pricing cost per article roi agency vs ai calculator",
  },
  {
    path: "/tools/article-to-quiz-test-generator",
    title: "AI Article-to-Quiz & Interactive Lead Magnet Generator",
    anchorText: "article-to-quiz generator",
    keywords: "quiz generator interactive assessment lead magnet reader engagement",
  },
  {
    path: "/tools/source-pdf-to-article-generator",
    title: "Source, PDF, Interview & NotebookLM-to-Article Studio",
    anchorText: "source and PDF to article converter",
    keywords: "pdf to article notebooklm interview transcript research synthesis",
  },
  {
    path: "/tools/ai-article-summarizer",
    title: "AI Article Summarizer & 50-Word AI Overview Box Builder",
    anchorText: "50-word AI Overview summary builder",
    keywords: "article summarizer 50 word quick answer box tldr ai overviews",
  },
  {
    path: "/tools/seo-originality-plagiarism-checker",
    title: "AI Content Burstiness Grader & Human-Like Article Polisher",
    anchorText: "AI burstiness and originality grader",
    keywords: "burstiness humanize ai text originality sentence variety",
  },
  {
    path: "/ai-seo/h1-heading",
    title: "H1 Heading & Tag Structure Guide",
    anchorText: "H1 heading optimization guide",
    keywords: "h1 heading structure h2 h3 hierarchy on-page seo",
  },
];

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
    url: "https://schema.org/Article",
    title: "Schema.org: Article Structured Data Specification",
    snippet:
      "Standard Schema.org vocabulary specification for Article, BlogPosting, author attribution, publisher metadata, and machine-readable entity relationships.",
    keywords: "schema markup json-ld structured data article entity seo",
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
    url: "https://developers.google.com/search/docs/fundamentals/ai-optimization-guide",
    title: "Google Search Central: Optimizing Your Website for Generative AI Features",
    snippet:
      "Official Google guide on structuring helpful people-first content, clear headings, and verifiable E-E-A-T context for generative AI search experiences.",
    keywords: "generative ai optimization geo aeo structured content google search",
  },
  {
    url: "https://web.dev/articles/vitals",
    title: "web.dev: Core Web Vitals & Page Experience Benchmarks",
    snippet:
      "Technical performance benchmarks for Largest Contentful Paint (LCP), Interaction to Next Paint (INP), and Cumulative Layout Shift (CLS) on modern websites.",
    keywords: "technical seo core web vitals performance speed website optimization",
  },
];

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
      /\b(?:i|want|to|write|an|article|blog|post|guide|for|my|website|site|on|the|topic|of|about|how|your|you|can|should|best|way|ways|in|2025|2026)\b/gi,
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

  const rankedCatalog = [...VERIFIED_AUTHORITY_REFERENCES]
    .map((ref) => ({
      ...ref,
      score: scoreOverlap(tokens, `${ref.title} ${ref.keywords} ${ref.snippet}`),
    }))
    .sort((a, b) => b.score - a.score);

  for (const ref of rankedCatalog) {
    if (links.length >= 6) break;
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

export function createResearchHandler(deps: ResearchDeps = {}) {
  return async (req: NextRequest) => {
    let release: (() => Promise<void>) | undefined;
    try {
      const data = researchRequestSchema.parse(await readBoundedJson(req, 32000));
      const parsed = parseBrief(data.brief);
      const directives = parseBriefDirectives(data.brief);
      const targetSite = (data.websiteUrl || directives.websiteUrl || "").trim();
      const topic = parsed.topic || data.keyword || "Article Topic";
      const focusKw = (
        data.keyword ||
        parsed.keyword ||
        cleanSearchQuery(topic, "") ||
        topic
      )
        .trim()
        .slice(0, 120);

      const fetcher = deps.fetchPage || fetchPublic;
      const [siteResult, webResult] = await Promise.all([
        targetSite
          ? discoverSiteInternalLinks(
              targetSite,
              topic,
              focusKw,
              req.signal,
              fetcher,
            )
          : Promise.resolve({ links: [], warnings: [], origin: undefined }),
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

      const model = getGeminiModel("CONTENT_WRITER");
      const warnings = [...siteResult.warnings, ...webResult.warnings];

      if (!(deps.configured || isAiConfigured)(model)) {
        const packet: ResearchPacket = {
          analyzedIntent: `Target topic "${topic}" focused on "${focusKw}" in ${data.language}.`,
          searchIntent: "informational",
          primaryTopic: topic,
          primaryKeyword: focusKw,
          secondaryKeywords: parsed.outline.length
            ? parsed.outline.map((o) => o.heading).slice(0, 5)
            : [
                `${focusKw} strategy`,
                `${focusKw} checklist`,
                `${focusKw} best practices`,
              ],
          lsiEntities: [
            "search intent",
            "structured data",
            "internal linking",
            "E-E-A-T signals",
          ],
          questionsToAnswer: parsed.outline.length
            ? parsed.outline
                .slice(0, 4)
                .map((o) => `How does ${o.heading.toLowerCase()} work?`)
            : [
                `What is ${focusKw} and why does it matter?`,
                `How do you implement ${focusKw} step by step?`,
              ],
          competitorAngles: [
            `Include a side-by-side decision matrix comparing traditional vs. modern ${focusKw} workflows`,
            `Address common implementation failure modes and how practitioners verify ${focusKw} results`,
            `Provide a 50-word self-contained answer summary for query fan-out and AI Overviews`,
          ],
          eeatSignals: [
            "Cite primary technical documentation (Google Search Central, Schema.org, W3C WAI) instead of unverified claims",
            "Document concrete before-and-after verification steps and measurable audit thresholds",
            "Highlight real operational trade-offs and edge cases rather than generic summaries",
          ],
          conclusionDirective: directives.conclusionStyle || undefined,
          visualDirectives: directives.visualHints,
          internalLinks: siteResult.links,
          externalLinks: webResult.links,
          quickAnswerTargetWords: 50,
          fetchedAt: new Date().toISOString(),
          siteScanned: siteResult.origin,
          warnings: [
            ...warnings,
            "AI keyword clustering is offline; using deterministic brief analysis.",
          ],
        };
        return NextResponse.json({ ok: true, packet, provider: "deterministic" });
      }

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

      const aiRes = await (deps.generate || getGeminiClient)().generate(
        {
          model,
          max_output_tokens: 1800,
          store: false,
          input: [
            {
              role: "system",
              content:
                "You are an SEO, AEO & Information Gain editorial research strategist. Deeply analyze the user's brief, custom headings, visual/conclusion requests, and verified web snippets to build an actionable keyword/intent/E-E-A-T research packet. Ensure primaryKeyword is a clean 2-6 word search query (never a full sentence or URL), phrase questionsToAnswer as natural People Also Ask (PAA) questions ending with '?', and ensure competitorAngles surface concrete Information Gain subtopic gaps (decision matrices, cost/latency trade-offs, and implementation edge cases). Never fabricate external URLs or statistics. Return only requested JSON.",
            },
            {
              role: "user",
              content: JSON.stringify({
                brief: data.brief,
                topic,
                keyword: focusKw,
                audience: data.audience,
                tone: data.tone,
                language: data.language,
                extractedOutline: parsed.outline,
                directives,
                webSnippets: webResult.snippets,
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
      const packet: ResearchPacket = {
        ...parsedAi,
        primaryKeyword:
          parsedAi.primaryKeyword.length <= 75
            ? parsedAi.primaryKeyword
            : focusKw,
        conclusionDirective: directives.conclusionStyle || undefined,
        visualDirectives: directives.visualHints,
        internalLinks: siteResult.links,
        externalLinks: webResult.links,
        quickAnswerTargetWords: 50,
        fetchedAt: new Date().toISOString(),
        siteScanned: siteResult.origin,
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
