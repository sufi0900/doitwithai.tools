import { requireApprovedWebsite, agencyWorkspace, recordAgencyUsage } from '@/lib/ai-employee-agency/workspace.server';
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
import { executeAgencyLlmCall } from '@/lib/ai-employee-agency/llm-gateway';
import {
  buildAgencyCircleTelemetrySnapshot,
  type AgencyLlmModelId,
} from '@/lib/ai-employee-agency/token-telemetry-store';
import {
  buildAgentThreeLayerPromptStack,
  type UserLearnedSkillRule,
} from '@/lib/ai-employee-agency/agent-memory-store';
import {
  evaluate150PointQaAndSpotCheck,
  generateGoogleAdsRsaCampaignPack,
} from '@/lib/ai-employee-agency/google-ads-agent';

interface OrchestrateRequestBody {
  siteUrl?: string;
  siteName?: string;
  primaryNiche?: string;
  seedKeywordQuery?: string;
  isInternalSite?: boolean;
  existingSlugs?: string[];
  modelId?: AgencyLlmModelId;
  apiKeyOverride?: string;
  isFreeTierKey?: boolean;
  userLearnedSkills?: UserLearnedSkillRule[];
  isSpotCheckOptedIn?: boolean;
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
          'Mozilla/5.0 (compatible; DoItWithAI-KeywordStrategist/3.0; +https://doitwithai.tools)',
      },
    });
    if (!res.ok) return [];
    const json = (await res.json()) as unknown;
    if (Array.isArray(json) && Array.isArray(json[1])) {
      return (json[1] as unknown[])
        .filter(
          (item): item is string => typeof item === 'string' && item.trim().length > 3
        )
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
          'Mozilla/5.0 (compatible; DoItWithAI-AgencyAuditor/3.0; +https://doitwithai.tools)',
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
  const workspace = await agencyWorkspace(req);
  if (workspace instanceof NextResponse) return workspace;
  const blocked = await requireApprovedWebsite(workspace);
  if (blocked) return blocked;
  try {
    const body = (await req.json().catch(() => ({}))) as OrchestrateRequestBody;
    const siteUrl = (body.siteUrl || 'https://doitwithai.tools').trim();
    const cleanHost =
      siteUrl.replace(/^https?:\/\//i, '').replace(/^www\./i, '').split('/')[0] ||
      'doitwithai.tools';
    const siteName = (body.siteName || cleanHost).trim();
    const isInternalSite = Boolean(body.isInternalSite);
    const selectedModelId: AgencyLlmModelId = body.modelId || 'gemini-2.5-flash';

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

    const threeLayerStack = buildAgentThreeLayerPromptStack({
      agentId: 'mgr-keyword-strategist',
      siteName,
      siteUrl,
      primaryNiche: inferredNiche,
      activeArticleTitle: winningBrief.recommendedH1Title,
      activeKeyword: winningBrief.keyword,
      learnedSkills: Array.isArray(body.userLearnedSkills)
        ? body.userLearnedSkills
        : [],
      sharedEvents: [],
    });

    const llmResult = await executeAgencyLlmCall({
      modelId: selectedModelId,
      apiKeyOverride: body.apiKeyOverride,
      isFreeTierKey: body.isFreeTierKey,
      systemPrompt: threeLayerStack.systemPrompt,
      userPrompt: `Website: ${siteName} (${siteUrl})\nNiche: ${inferredNiche}\nWinning Keyword: "${winningBrief.keyword}" (KD ${winningBrief.kdScore}/100)\nRecommended H1: ${winningBrief.recommendedH1Title}\nProvide a concise 2-sentence AEO direct answer lead adhering to all active user-learned skill rules.`,
      temperature: 0.3,
      maxOutputTokens: 280,
    });
    if (!llmResult.ok) return NextResponse.json({ error: llmResult.apiErrorDetail }, { status: 503 });
    await recordAgencyUsage(workspace.id, 'orchestrate', llmResult);


    const circleTokenTelemetry = buildAgencyCircleTelemetrySnapshot({
      siteName,
      activeTopicTitle: winningBrief.recommendedH1Title,
      modelId: selectedModelId,
      isFreeTierKeyActive: llmResult.isFreeTierKey,
      liveStage1Override: {
        promptTokens: llmResult.promptTokens,
        completionTokens: llmResult.completionTokens,
        thinkingTokens: llmResult.thinkingTokens,
        latencyMs: llmResult.latencyMs,
        isLiveCall: llmResult.usedLiveApiKey,
      },
    });

    const handoffPackets = buildPacedHandoffChain({
      siteName,
      isInternalSite,
      activeKeyword: winningBrief.keyword,
      activeArticleTitle: winningBrief.recommendedH1Title,
      activeKdScore: winningBrief.kdScore,
    });

    const tiktokVideoScript = generateTikTokReels60sScript({
      articleTitle: winningBrief.recommendedH1Title,
      primaryKeyword: winningBrief.keyword,
      siteName,
    });

    const googleAdsCampaignPack = generateGoogleAdsRsaCampaignPack({
      siteName,
      siteUrl,
      primaryKeyword: winningBrief.keyword,
      articleTitle: winningBrief.recommendedH1Title,
      urlSlug: winningBrief.recommendedUrlSlug,
    });

    const qa150PointRubric = evaluate150PointQaAndSpotCheck({
      articleTitle: winningBrief.recommendedH1Title,
      primaryKeyword: winningBrief.keyword,
      isSpotCheckOptedIn: Boolean(body.isSpotCheckOptedIn),
    });

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
      googleAdsCampaignPack,
      qa150PointRubric,
      manualActionAlerts,
      activeSkillRulesInjected: threeLayerStack.activeAgentLearnedSkills.length,
      llmGatewayStatus: {
        provider: llmResult.provider,
        modelId: llmResult.modelId,
        apiKeySlot: llmResult.apiKeySlot,
        usedLiveApiKey: llmResult.usedLiveApiKey,
        isFreeTierKey: llmResult.isFreeTierKey,
        telemetryNote: llmResult.telemetryNote,
      },
      stage1TokenEvent: {
        agentId: 'mgr-keyword-strategist',
        modelId: llmResult.modelId,
        apiKeySlot: llmResult.apiKeySlot,
        promptTokens: llmResult.promptTokens,
        completionTokens: llmResult.completionTokens,
        thinkingTokens: llmResult.thinkingTokens,
        totalTokens: llmResult.totalTokens,
        shadowPaidCostUsd: llmResult.shadowPaidCostUsd,
        actualCostUsd: llmResult.actualCostUsd,
        usedLiveApiKey: llmResult.usedLiveApiKey,
      },
      circleTokenTelemetry,
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
