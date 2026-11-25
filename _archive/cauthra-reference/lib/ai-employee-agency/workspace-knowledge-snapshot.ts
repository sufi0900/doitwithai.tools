/**
 * ============================================================================
 * DOITWITHAI.TOOLS — 24/7 AI EMPLOYEE AGENCY OS (V4 PHASE 13)
 * Module: `lib/ai-employee-agency/workspace-knowledge-snapshot.ts`
 *
 * Live Workspace Knowledge Snapshot Builder for the General AI Copilot &
 * 36-Agent Messenger Drawer:
 * - Aggregates real-time workspace metrics (published/draft/queued articles,
 *   titles, rendered visual assets, SEO & AI discoverability scores, backlink
 *   club exchanges, 24/7 heartbeat schedule, learned skills, and zero-based
 *   session token telemetry) into a compact, strongly typed JSON snapshot.
 * - Serializes into a clean LLM context block so the General Workspace Copilot
 *   answers founder questions with exact live numbers instead of generic guesses.
 * ============================================================================
 */

export interface WorkspaceArticleSummary {
  title: string;
  primaryKeyword: string;
  status: string;
  kdScore?: number;
}

export interface WorkspaceKnowledgeSnapshot {
  capturedAtIso: string;
  siteName: string;
  siteUrl: string;
  primaryNiche: string;
  isInternalSite: boolean;
  publishedArticlesCount: number;
  draftArticlesCount: number;
  queuedArticlesCount: number;
  totalArticlesCount: number;
  recentArticles: WorkspaceArticleSummary[];
  activeArticleTitle: string;
  activeKeyword: string;
  heroBannersCount: number;
  sectionInfographicsCount: number;
  socialVisualAssetsCount: number;
  totalVisualAssetsCount: number;
  seoHealthScore: number;
  aiDiscoverabilityScore: number;
  backlinkClubMatchesCount: number;
  heartbeatJobsCount: number;
  nextHeartbeatSummary: string;
  learnedSkillsCount: number;
  sessionTokensUsed: number;
  sessionShadowCostUsd: number;
  sessionActualCostUsd: number;
  activeKeySlot: string;
  activeAgentsCount: number;
}

export const GENERAL_COPILOT_AGENT_ID = 'general-workspace-copilot';

/**
 * Formats a `WorkspaceKnowledgeSnapshot` into a concise, structured context
 * block for the LLM system prompt so replies cite exact workspace metrics.
 */
export function formatWorkspaceKnowledgeForPrompt(
  snapshot?: WorkspaceKnowledgeSnapshot
): string {
  if (!snapshot) {
    return 'No live workspace metrics snapshot was attached to this request.';
  }

  const articleLines =
    snapshot.recentArticles.length > 0
      ? snapshot.recentArticles
          .slice(0, 6)
          .map(
            (a, idx) =>
              `  ${idx + 1}. "${a.title}" [Status: ${a.status} · Keyword: "${a.primaryKeyword}"${
                a.kdScore !== undefined ? ` · KD ${a.kdScore}` : ''
              }]`
          )
          .join('\n')
      : '  - No articles queued yet.';

  return [
    `LIVE WORKSPACE SNAPSHOT (${snapshot.siteName} — ${snapshot.siteUrl}):`,
    `- Niche: ${snapshot.primaryNiche} (${snapshot.isInternalSite ? 'Internal Auto-Publish' : 'External CMS Domain'})`,
    `- Content Pipeline: ${snapshot.totalArticlesCount} total articles (${snapshot.publishedArticlesCount} published, ${snapshot.draftArticlesCount} in drafting/review, ${snapshot.queuedArticlesCount} queued).`,
    `- Active Focus Article: "${snapshot.activeArticleTitle}" (Keyword: "${snapshot.activeKeyword}")`,
    `- Recent Articles:\n${articleLines}`,
    `- Visual & Design Assets Ready: ${snapshot.totalVisualAssetsCount} total (${snapshot.heroBannersCount} Hero Banners, ${snapshot.sectionInfographicsCount} 6-Layer Infographics, ${snapshot.socialVisualAssetsCount} Social/Pinterest/LinkedIn assets).`,
    `- SEO & AI Search Health: Technical Health ${snapshot.seoHealthScore}/100 · AI Discoverability ${snapshot.aiDiscoverabilityScore}/100 · Backlink Club Matches: ${snapshot.backlinkClubMatchesCount}.`,
    `- 24/7 Heartbeat Schedule: ${snapshot.heartbeatJobsCount} staggered autonomous jobs active (${snapshot.nextHeartbeatSummary}).`,
    `- Live Session Token Ledger: ${snapshot.sessionTokensUsed.toLocaleString()} tokens used ($${snapshot.sessionShadowCostUsd.toFixed(4)} shadow cost · $${snapshot.sessionActualCostUsd.toFixed(4)} billed) via ${snapshot.activeKeySlot} · ${snapshot.activeAgentsCount}/36 agents active · ${snapshot.learnedSkillsCount} learned custom skills.`,
  ].join('\n');
}

/**
 * Answers common founder status/inventory questions directly from live workspace
 * telemetry in clean, natural conversational prose (zero robotic prefixes).
 */
export function answerFromWorkspaceKnowledge(
  rawMessage: string,
  snapshot: WorkspaceKnowledgeSnapshot
): string | null {
  const lower = rawMessage.toLowerCase();

  if (
    lower.includes('token') ||
    lower.includes('cost') ||
    lower.includes('how much') ||
    lower.includes('api key') ||
    lower.includes('usage')
  ) {
    return (
      `So far in this session for **${snapshot.siteName}**, you've used **${snapshot.sessionTokensUsed.toLocaleString()} tokens** ` +
      `($${snapshot.sessionShadowCostUsd.toFixed(4)} shadow commercial value, **$${snapshot.sessionActualCostUsd.toFixed(4)} billed**) ` +
      `on slot \`${snapshot.activeKeySlot}\`, with **${snapshot.activeAgentsCount} of 36** agents active.\n\n` +
      `You can click **Reset 0** in the top header or open **Token & API Ledger** anytime to inspect individual agent and chat usage.`
    );
  }

  if (
    lower.includes('how many blog') ||
    lower.includes('how many article') ||
    lower.includes('published') ||
    lower.includes('content pipeline') ||
    lower.includes('what article') ||
    lower.includes('recent blog')
  ) {
    const listText =
      snapshot.recentArticles.length > 0
        ? snapshot.recentArticles
            .slice(0, 5)
            .map(
              (a) =>
                `• **${a.title}** — ${a.status} (keyword: *${a.primaryKeyword}*)`
            )
            .join('\n')
        : '• No articles have been queued yet.';
    return (
      `For **${snapshot.siteName}**, your pipeline currently tracks **${snapshot.totalArticlesCount} articles**: ` +
      `**${snapshot.publishedArticlesCount} published**, **${snapshot.draftArticlesCount} in drafting/QA**, and **${snapshot.queuedArticlesCount} queued**.\n\n` +
      `Here are the latest items:\n${listText}`
    );
  }

  if (
    lower.includes('design') ||
    lower.includes('infographic') ||
    lower.includes('visual') ||
    lower.includes('hero image') ||
    lower.includes('pinterest')
  ) {
    return (
      `Your Visual & SVG Studio currently has **${snapshot.totalVisualAssetsCount} ready assets** for **${snapshot.siteName}**:\n` +
      `• **${snapshot.heroBannersCount}** Featured Hero Banners (1200×675)\n` +
      `• **${snapshot.sectionInfographicsCount}** 6-Layer Section Infographics (1080×1350)\n` +
      `• **${snapshot.socialVisualAssetsCount}** Social distribution assets (Pinterest 2:3 pins & 8-slide LinkedIn carousels)\n\n` +
      `All SVGs are verified for 0.00 CLS and rendered deterministically at $0.00 token cost.`
    );
  }

  if (
    lower.includes('schedule') ||
    lower.includes('heartbeat') ||
    lower.includes('cron') ||
    lower.includes('next run') ||
    lower.includes('24/7')
  ) {
    return (
      `Your 24/7 Autonomous Heartbeat has **${snapshot.heartbeatJobsCount} staggered jobs** configured for **${snapshot.siteName}**.\n\n` +
      `Next up: ${snapshot.nextHeartbeatSummary}. You can adjust cadence or trigger any slot manually from **24/7 Heartbeat Schedule**.`
    );
  }

  if (
    lower.includes('status') ||
    lower.includes('summary') ||
    lower.includes('overview') ||
    lower.includes('seo score') ||
    lower.includes('health score') ||
    lower.includes('how is my site') ||
    lower.includes('what is going on')
  ) {
    return (
      `Here is the live snapshot for **${snapshot.siteName}** (${snapshot.siteUrl}):\n` +
      `• **Content**: ${snapshot.publishedArticlesCount} published, ${snapshot.draftArticlesCount} drafting, ${snapshot.queuedArticlesCount} queued (active focus: *"${snapshot.activeArticleTitle}"*)\n` +
      `• **SEO & AI Health**: Technical Health **${snapshot.seoHealthScore}/100**, AI Discoverability **${snapshot.aiDiscoverabilityScore}/100**, **${snapshot.backlinkClubMatchesCount}** Backlink Club matches\n` +
      `• **Visuals**: ${snapshot.totalVisualAssetsCount} vector assets ready\n` +
      `• **Session Usage**: ${snapshot.sessionTokensUsed.toLocaleString()} tokens ($${snapshot.sessionShadowCostUsd.toFixed(4)} shadow · $${snapshot.sessionActualCostUsd.toFixed(4)} billed) with ${snapshot.learnedSkillsCount} custom skills active\n\n` +
      `Tell me what you'd like to tackle next—or switch to any of the 36 specialists in the top dropdown.`
    );
  }

  return null;
}
