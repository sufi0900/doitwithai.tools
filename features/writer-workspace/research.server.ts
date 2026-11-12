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
 * SSRF-hardened `fetchPublic`. Never fabricates URLs.
 */
export async function discoverSiteInternalLinks(
  rawSiteUrl: string,
  topic: string,
  keyword: string,
  signal?: AbortSignal,
  fetcher: typeof fetchPublic = fetchPublic,
): Promise<{ links: ResearchLinkItem[]; warnings: string[]; origin?: string }> {
  const trimmed = rawSiteUrl.trim();
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
  const sameHost = (u: URL) =>
    u.hostname.replace(/^www\./i, "") ===
    originUrl.hostname.replace(/^www\./i, "");

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
        if (!rawHref || rawHref.startsWith("#") || /^(mailto:|tel:|javascript:)/i.test(rawHref)) {
          return;
        }
        try {
          const u = new URL(rawHref, originUrl.origin);
          u.hash = "";
          if (!/^https?:$/.test(u.protocol) || !sameHost(u)) return;
          if (!isUsefulContentPath(u.pathname)) return;
          const label = anchor.length >= 4 && anchor.length <= 90 ? anchor : titleFromUrlPath(u.href);
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
 * for verified authority external URLs & background context snippets. Never scrapes
 * protected search engines or bypasses CAPTCHAs.
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
  const query = (keyword || topic || "").trim().slice(0, 120);
  if (!query) return { links: [], snippets: [], warnings: [] };

  const links: ResearchLinkItem[] = [];
  const snippets: string[] = [];
  const warnings: string[] = [];
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
          links.push({
            url: urls[i],
            title: titles[i] || urls[i],
            snippet: descs[i] || "",
            sourceKind: "external",
          });
          if (descs[i]) snippets.push(`${titles[i]}: ${descs[i]}`);
        }
      }
    }
  } catch {
    warnings.push("Wikipedia public lookup unavailable; using AI synthesis only.");
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
        RelatedTopics?: Array<{ Text?: string; FirstURL?: string }>;
      };
      if (data.AbstractURL && /^https?:\/\//i.test(data.AbstractURL)) {
        if (!links.some((l) => l.url === data.AbstractURL)) {
          links.push({
            url: data.AbstractURL,
            title: data.Heading || data.AbstractURL,
            snippet: data.AbstractText || "",
            sourceKind: "external",
          });
        }
        if (data.AbstractText) snippets.push(data.AbstractText);
      }
    }
  } catch {
    // Public fallback optional
  }

  return { links: links.slice(0, 5), snippets: snippets.slice(0, 5), warnings };
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
      const focusKw = (data.keyword || parsed.keyword || topic).trim();

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
          secondaryKeywords: parsed.outline.map((o) => o.heading).slice(0, 5),
          lsiEntities: [],
          questionsToAnswer: parsed.outline
            .slice(0, 4)
            .map((o) => `How does ${o.heading.toLowerCase()} work?`),
          competitorAngles: [],
          eeatSignals: [],
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
                "You are an SEO & editorial research strategist. Deeply analyze the user's human-language brief, custom headings, visual/conclusion requests, and verified web snippets to build an actionable keyword/intent/E-E-A-T research packet. Never fabricate external URLs or statistics. Return only requested JSON.",
            },
            {
              role: "user",
              content: JSON.stringify({
                brief: data.brief,
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
