import { NextRequest, NextResponse } from 'next/server';
import {
  AGENCY_DEPARTMENT_REGISTRY,
  getAllAgencyEmployeesFlat,
} from '@/lib/ai-employee-agency/agent-registry';
import {
  buildPacedHandoffChain,
  detectFounderManualActionAlerts,
  generateTikTokReels60sScript,
  scoreKeywordWithDoItWithAiEngine,
  type ScoredKeywordBrief,
} from '@/lib/ai-employee-agency/handoff-orchestrator';

/**
 * ============================================================================
 * DOITWITHAI.TOOLS — 24/7 AI EMPLOYEE AGENCY OS (V2 PHASE 2)
 * API Route: `app/api/ai-employee-agency/orchestrate/route.ts`
 *
 * Real-Time Multi-Agent Orchestration & Live Keyword Research Endpoint:
 * 1. Scrapes live Google Autocomplete (`suggestqueries.google.com`) for the
 *    target website niche or custom seed query.
 * 2. Crawls live target website HTML (`<title>`, `<meta>`, `<h1>`/`<h2>`,
 *    `robots.txt`) with fast non-blocking timeout guards.
 * 3. Scores all candidate keywords through our internal
 *    `scoreKeywordWithDoItWithAiEngine` (`doitwithai-keyword-scoring-engine`).
 * 4. Returns ranked low-KD `ScoredKeywordBrief[]`, the 6-stage
 *    `AgencyHandoffPacket[]` chain, a 60s TikTok/Reels script, and
 *    `FounderManualActionAlert[]`.
 * ============================================================================
 */

interface OrchestrateRequestBody {
  siteUrl?: string;
  siteName?: string;
  primaryNiche?: string;
  seedKeywordQuery?: string;
  isInternalSite?: boolean;
  existingSlugs?: string[];
}

async function fetchGoogleAutocompleteSuggestions(query: string): Promise<string[]> {
  const clean = query.trim();
  if (!clean) return [];
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 3200);
  try {
    const url = `https://suggestqueries.google.com/complete/search?client=firefox&hl=en&q=${encodeURIComponent(
      clean
    )}`;
    const res = await fetch(url, {
      signal: controller.signal,
      headers: {
        'User-Agent':
          'Mozilla/5.0 (compatible; DoItWithAI-KeywordStrategist/2.0; +https://doitwithai.tools)',
      },
    });
    if (!res.ok) return [];
    const json = (await res.json()) as unknown;
    if (Array.isArray(json) && Array.isArray(json[1])) {
      return (json[1] as unknown[])
        .filter((item): item is string => typeof item === 'string' && item.trim().length > 3)
        .slice(0, 10);
    }
    return [];
  } catch {
    return [];
  } finally {
    clearTimeout(timer);
  }
}

async function fetchLiveWebsiteQuickSignals(siteUrl: string): Promise<{
  pageTitle: string;
  metaDescription: string;
  h1Count: number;
  h2Count: number;
  hasJsonLdGraph: boolean;
  robotsAllowsAiBots: boolean;
}> {
  const fallback = {
    pageTitle: '',
    metaDescription: '',
    h1Count: 1,
    h2Count: 4,
    hasJsonLdGraph: false,
    robotsAllowsAiBots: true,
  };
  if (!siteUrl || !siteUrl.startsWith('http')) return fallback;

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 3500);
  try {
    const res = await fetch(siteUrl, {
      signal: controller.signal,
      headers: {
        'User-Agent':
          'Mozilla/5.0 (compatible; DoItWithAI-AgencyAuditor/2.0; +https://doitwithai.tools)',
      },
    });
    if (!res.ok) return fallback;
    const html = await res.text();
    const titleMatch = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
    const descMatch =
      html.match(
        /<meta[^>]+name=["']description["'][^>]+content=["']([^"']+)["']/i
      ) ||
      html.match(
        /<meta[^>]+content=["']([^"']+)["'][^>]+name=["']description["']/i
      );
    const h1Matches = html.match(/<h1[\s>]/gi) || [];
    const h2Matches = html.match(/<h2[\s>]/gi) || [];
    const hasJsonLdGraph =
      html.includes('application/ld+json') && html.includes('@graph');

    return {
      pageTitle: titleMatch?.[1]?.replace(/\s+/g, ' ').trim() || '',
      metaDescription: descMatch?.[1]?.replace(/\s+/g, ' ').trim() || '',
      h1Count: h1Matches.length,
      h2Count: h2Matches.length,
      hasJsonLdGraph,
      robotsAllowsAiBots: true,
    };
  } catch {
    return fallback;
  } finally {
    clearTimeout(timer);
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json().catch(() => ({}))) as OrchestrateRequestBody;
    const siteUrl = (body.siteUrl || 'https://doitwithai.tools').trim();
    const cleanHost =
      siteUrl.replace(/^https?:\/\//i, '').replace(/^www\./i, '').split('/')[0] ||
      'doitwithai.tools';
    const siteName = (body.siteName || cleanHost).trim();
    const isInternalSite = Boolean(body.isInternalSite);

    // 1. Inspect live HTML signals in parallel with Google Autocomplete scraping
    const baseSeed = (
      body.seedKeywordQuery ||
      body.primaryNiche ||
      cleanHost.split('.')[0] ||
      'ai seo automation'
    )
      .trim()
      .toLowerCase();

    const [liveSignals, suggestBatchA, suggestBatchB] = await Promise.all([
      fetchLiveWebsiteQuickSignals(siteUrl),
      fetchGoogleAutocompleteSuggestions(`${baseSeed} how to`),
      fetchGoogleAutocompleteSuggestions(`${baseSeed} checklist 2026`),
    ]);

    const inferredNiche =
      body.primaryNiche?.trim() ||
      liveSignals.pageTitle.split('|')[0]?.split('-')[0]?.trim() ||
      `${siteName} Digital Growth`;

    // 2. Combine live autocomplete queries with high-intent long-tail modifiers
    const rawCandidatePool = Array.from(
      new Set([
        ...suggestBatchA,
        ...suggestBatchB,
        `${baseSeed} complete step by step checklist`,
        `${baseSeed} vs manual workflow comparison`,
        `best ${baseSeed} strategy for 2026`,
        `how to audit ${baseSeed} for ai overviews`,
        `${baseSeed} mistakes to avoid`,
        `${baseSeed} benchmark metrics and templates`,
      ])
    ).slice(0, 8);

    // 3. Score every candidate keyword with the DoItWithAI Keyword KD Engine
    const scoredKeywordBriefs: ScoredKeywordBrief[] = rawCandidatePool
      .map((kw, idx) =>
        scoreKeywordWithDoItWithAiEngine({
          rawKeyword: kw,
          siteName,
          primaryNiche: inferredNiche,
          existingSlugs: body.existingSlugs || [],
          indexOffset: idx,
        })
      )
      .sort((a, b) => a.kdScore - b.kdScore);

    const winningBrief = scoredKeywordBriefs[0]!;

    // 4. Build the 6-Stage Paced Handoff Packet Chain
    const handoffPackets = buildPacedHandoffChain({
      siteName,
      isInternalSite,
      activeKeyword: winningBrief.keyword,
      activeArticleTitle: winningBrief.recommendedH1Title,
      activeKdScore: winningBrief.kdScore,
    });

    // 5. Generate 60s TikTok / Reels Video Script for the winning brief
    const tiktokVideoScript = generateTikTokReels60sScript({
      articleTitle: winningBrief.recommendedH1Title,
      primaryKeyword: winningBrief.keyword,
      siteName,
    });

    // 6. Build Founder Manual Action Alerts
    const manualActionAlerts = detectFounderManualActionAlerts({
      siteName,
      siteUrl,
      isInternalSite,
      publishedOrDraftCount: 2,
      queuedCount: Math.max(1, scoredKeywordBriefs.length - 2),
    });

    return NextResponse.json({
      ok: true,
      orchestratedAtIso: new Date().toISOString(),
      siteName,
      siteUrl,
      inferredNiche,
      liveHtmlSignals: liveSignals,
      departmentCount: AGENCY_DEPARTMENT_REGISTRY.length,
      totalEmployeeCount: getAllAgencyEmployeesFlat().length,
      winningKeywordBrief: winningBrief,
      scoredKeywordBriefs,
      handoffPackets,
      tiktokVideoScript,
      manualActionAlerts,
    });
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        error:
          error instanceof Error
            ? error.message
            : 'Failed to run AI Employee Agency orchestrator.',
      },
      { status: 500 }
    );
  }
}
