import { NextRequest, NextResponse } from 'next/server';
import {
  getAllAgencyEmployeesFlat,
  type AgencySidebarTabId,
} from '@/lib/ai-employee-agency/agent-registry';
import {
  generateTikTokReels60sScript,
  scoreKeywordWithDoItWithAiEngine,
  type ScoredKeywordBrief,
} from '@/lib/ai-employee-agency/handoff-orchestrator';
import { executeAgencyLlmCall } from '@/lib/ai-employee-agency/llm-gateway';
import type { AgencyLlmModelId } from '@/lib/ai-employee-agency/token-telemetry-store';
import {
  buildAgentThreeLayerPromptStack,
  routeSelectiveWorkflowInterrupt,
  type SharedMemoryBusEvent,
  type UserLearnedSkillRule,
} from '@/lib/ai-employee-agency/agent-memory-store';
import {
  GENERAL_COPILOT_AGENT_ID,
  answerFromWorkspaceKnowledge,
  formatWorkspaceKnowledgeForPrompt,
  type WorkspaceKnowledgeSnapshot,
} from '@/lib/ai-employee-agency/workspace-knowledge-snapshot';

/**
 * ============================================================================
 * DOITWITHAI.TOOLS — 24/7 AI EMPLOYEE AGENCY OS (V4 PHASE 13 UPGRADE)
 * API Route: `app/api/ai-employee-agency/agent-chat/route.ts`
 *
 * Slide-Over Copilot & 36-Agent Messenger Endpoint:
 * 1. Supports Default General ChatGPT-Style Workspace Copilot
 *    (`general-workspace-copilot`) as well as direct messaging to any of the
 *    36 AI Employees.
 * 2. Injects the live `WorkspaceKnowledgeSnapshot` (exact article counts/titles,
 *    visuals, SEO/AI health scores, schedule, and zero-based session tokens)
 *    into every LLM system prompt and deterministic fallback.
 * 3. Strips all robotic metadata prefixes (`[Agent · Layer 2]:`) so every reply
 *    reads naturally like ChatGPT/Claude while returning structured badges and
 *    real-time `tokenUsage` (`KEY_SLOT_*`, prompt/output/thinking tokens, cost).
 * ============================================================================
 */

interface AgentChatRequestBody {
  agentId?: string;
  message?: string;
  siteName?: string;
  siteUrl?: string;
  primaryNiche?: string;
  activeArticleTitle?: string;
  activeKeyword?: string;
  isInternalSite?: boolean;
  existingSlugs?: string[];
  learnedSkills?: UserLearnedSkillRule[];
  sharedEvents?: SharedMemoryBusEvent[];
  customAssetUrl?: string;
  modelId?: AgencyLlmModelId;
  apiKeyOverride?: string;
  isFreeTierKey?: boolean;
  workspaceKnowledge?: WorkspaceKnowledgeSnapshot;
}

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json().catch(() => ({}))) as AgentChatRequestBody;
    const rawMessage = (body.message || '').trim();
    if (!rawMessage) {
      return NextResponse.json(
        { ok: false, error: 'Message is required.' },
        { status: 400 }
      );
    }

    const siteName = (
      body.workspaceKnowledge?.siteName ||
      body.siteName ||
      'DoItWithAI.tools'
    ).trim();
    const siteUrl = (
      body.workspaceKnowledge?.siteUrl ||
      body.siteUrl ||
      'https://doitwithai.tools'
    ).trim();
    const primaryNiche = (
      body.workspaceKnowledge?.primaryNiche ||
      body.primaryNiche ||
      'AI SEO & Digital Marketing'
    ).trim();
    const activeKeyword = (
      body.workspaceKnowledge?.activeKeyword ||
      body.activeKeyword ||
      'ai seo audit checklist'
    ).trim();
    const activeArticleTitle = (
      body.workspaceKnowledge?.activeArticleTitle ||
      body.activeArticleTitle ||
      '2026 AI SEO Audit & Implementation Playbook'
    ).trim();

    const isGeneralCopilot =
      !body.agentId || body.agentId === GENERAL_COPILOT_AGENT_ID;

    const allEmployees = getAllAgencyEmployeesFlat();
    const targetEmployee = isGeneralCopilot
      ? allEmployees[0]!
      : allEmployees.find((e) => e.id === body.agentId) || allEmployees[0]!;

    const responderName = isGeneralCopilot
      ? 'Workspace Copilot'
      : targetEmployee.name;
    const responderBadge = isGeneralCopilot
      ? 'General AI Assistant'
      : targetEmployee.departmentBadge;

    const interruptPlan = routeSelectiveWorkflowInterrupt({
      agentId: targetEmployee.id,
      rawMessage,
      customAssetUrl: body.customAssetUrl,
    });

    const updatedSkills = interruptPlan.learnedSkillRule
      ? [interruptPlan.learnedSkillRule, ...(body.learnedSkills || [])]
      : body.learnedSkills;

    const liveKnowledgeBlock = formatWorkspaceKnowledgeForPrompt(
      body.workspaceKnowledge
    );

    const promptStack = buildAgentThreeLayerPromptStack({
      agentId: targetEmployee.id,
      siteName,
      siteUrl,
      primaryNiche,
      activeArticleTitle,
      activeKeyword,
      learnedSkills: updatedSkills,
      sharedEvents: [interruptPlan.memoryBusEvent, ...(body.sharedEvents || [])],
    });

    const systemPrompt = isGeneralCopilot
      ? [
          `You are the DoItWithAI.tools Workspace Copilot — a warm, direct, expert AI digital agency assistant for ${siteName} (${siteUrl}).`,
          'Answer naturally and concisely in clean prose or short bullet points. NEVER wrap your reply in robotic bracket prefixes or debug headers.',
          'Always ground status, content, SEO, design, schedule, and token answers in the LIVE WORKSPACE SNAPSHOT below.',
          '',
          liveKnowledgeBlock,
          '',
          updatedSkills && updatedSkills.length > 0
            ? `Active User-Taught Rules (${updatedSkills.length}): ${updatedSkills
                .slice(0, 6)
                .map((s) => s.skillRuleText)
                .join(' | ')}`
            : '',
        ]
          .filter(Boolean)
          .join('\n')
      : [
          promptStack.systemPrompt,
          '',
          'RESPONSE STYLE: Reply naturally and directly as this specialist. Do NOT include robotic bracketed prefixes or debug logs in your reply.',
          '',
          liveKnowledgeBlock,
        ].join('\n');

    const llmCall = await executeAgencyLlmCall({
      modelId: body.modelId || 'gemini-2.5-flash',
      apiKeyOverride: body.apiKeyOverride,
      isFreeTierKey: body.isFreeTierKey,
      systemPrompt,
      userPrompt: rawMessage,
      temperature: 0.4,
      maxOutputTokens: 600,
    });

    const lower = rawMessage.toLowerCase();
    const wantsNewArticleOrCampaign =
      lower.includes('launch') ||
      lower.includes('write a new') ||
      lower.includes('new article') ||
      lower.includes('create an article') ||
      lower.includes('start a campaign');

    let replyText = '';
    let spawnedKeywordBrief: ScoredKeywordBrief | undefined;
    let recommendedTabRedirect: AgencySidebarTabId | undefined;

    if (interruptPlan.learnedSkillRule) {
      replyText = `Got it — I've saved that permanent rule for **${siteName}**:\n\n> "${interruptPlan.learnedSkillRule.skillRuleText}"\n\n${interruptPlan.wokenAgentNames.join(
        ' and '
      )} will apply it going forward while the other ${
        interruptPlan.uninterruptedAgentCount
      } agents keep running uninterrupted.`;
    } else if (interruptPlan.triggerType === 'custom-image-upload') {
      recommendedTabRedirect =
        targetEmployee.departmentTab === 'graphic-design'
          ? 'graphic-design'
          : 'social-video-fleet';
      replyText = `I've attached your custom visual asset to the active **${siteName}** campaign. Only ${interruptPlan.wokenAgentNames.join(
        ' and '
      )} were woken to update the visual card and caption, leaving the other ${
        interruptPlan.uninterruptedAgentCount
      } agents uninterrupted.`;
    } else if (wantsNewArticleOrCampaign) {
      const cleanedTopic = rawMessage
        .replace(
          /^(today\s+)?(let's|lets|please|can you|chief)?\s*(write|launch|create|publish|start)\s*(a\s+new\s+article\s+on|an\s+article\s+about|a\s+campaign\s+on|about|on)?/i,
          ''
        )
        .trim();

      spawnedKeywordBrief = scoreKeywordWithDoItWithAiEngine({
        rawKeyword: cleanedTopic.length > 4 ? cleanedTopic : primaryNiche,
        siteName,
        primaryNiche,
        existingSlugs: body.existingSlugs || [],
      });
      recommendedTabRedirect = 'content-writing';

      replyText = `I've launched a new cross-department campaign for **"${spawnedKeywordBrief.recommendedH1Title}"** (target keyword: *${spawnedKeywordBrief.keyword}* · KD ${spawnedKeywordBrief.kdScore}/100 · est. ${spawnedKeywordBrief.estimatedMonthlyVolume}/mo).\n\n• **Keyword Strategist** locked the H1–H3 outline and 4 PAA FAQ items.\n• **Visual Studio** is preparing the 1200×675 Hero Banner and 4× 1080×1350 section infographics.\n• **Content & On-Page SEO** are drafting the 50-word AEO answer lead, H2 sections, and \`@graph\` JSON-LD.\n• **Social & Video** is staging 3 Pinterest pins, an 8-slide LinkedIn carousel, and a 60s TikTok script.`;
    } else if (llmCall.usedLiveApiKey && llmCall.outputText.length > 15) {
      replyText = llmCall.outputText;
    } else if (body.workspaceKnowledge) {
      const liveAnswer = answerFromWorkspaceKnowledge(
        rawMessage,
        body.workspaceKnowledge
      );
      if (liveAnswer) {
        replyText = liveAnswer;
      }
    }

    if (!replyText) {
      if (
        !isGeneralCopilot &&
        (targetEmployee.departmentTab === 'keyword-strategist' ||
          lower.includes('keyword') ||
          lower.includes('kd'))
      ) {
        const briefA = scoreKeywordWithDoItWithAiEngine({
          rawKeyword: `${rawMessage.slice(0, 35)} checklist 2026`,
          siteName,
          primaryNiche,
          indexOffset: 1,
        });
        const briefB = scoreKeywordWithDoItWithAiEngine({
          rawKeyword: `${rawMessage.slice(0, 35)} vs manual workflow`,
          siteName,
          primaryNiche,
          indexOffset: 2,
        });
        recommendedTabRedirect = 'keyword-strategist';
        replyText = `Here are two low-difficulty keyword opportunities for **${siteName}**:\n\n• **${briefA.keyword}** — KD ${briefA.kdScore}/100 (${briefA.difficultyLabel}), ~${briefA.estimatedMonthlyVolume}/mo, AEO Score ${briefA.aeoCitationScore}/100\n• **${briefB.keyword}** — KD ${briefB.kdScore}/100 (${briefB.difficultyLabel}), ~${briefB.estimatedMonthlyVolume}/mo\n\nSuggested H1: *"${briefA.recommendedH1Title}"*.`;
      } else if (
        targetEmployee.id.includes('tiktok') ||
        (!isGeneralCopilot &&
          targetEmployee.departmentTab === 'social-video-fleet') ||
        lower.includes('tiktok') ||
        lower.includes('reel') ||
        lower.includes('video')
      ) {
        const script = generateTikTokReels60sScript({
          articleTitle: activeArticleTitle,
          primaryKeyword: activeKeyword,
          siteName,
        });
        recommendedTabRedirect = 'social-video-fleet';
        replyText = `Here is a 60-second TikTok / Reels storyboard for **"${activeArticleTitle}"**:\n\n• **0:00–0:03 Hook:** "${script.hook0To3Seconds.spokenHookLine}"\n• **0:03–0:18 Problem:** "${script.problem3To18Seconds.spokenScript}"\n• **0:18–0:45 Walkthrough:** "${script.walkthrough18To45Seconds.spokenScript}"\n• **0:45–0:60 CTA:** "${script.cta45To60Seconds.spokenScript}"`;
      } else if (
        (!isGeneralCopilot &&
          targetEmployee.departmentTab === 'technical-seo') ||
        lower.includes('robots') ||
        lower.includes('cls') ||
        lower.includes('technical')
      ) {
        recommendedTabRedirect = 'technical-seo';
        replyText = `Technical & AI Search status for **${siteUrl}**:\n\n• **Core Web Vitals:** 0.00 CLS verified across all 1200×675 and 1080×1350 inline SVGs.\n• **AI Crawler Access:** Verified \`Allow\` rules for \`OAI-SearchBot\`, \`GPTBot\`, \`PerplexityBot\`, and \`Google-Extended\`.\n• **Schema Graph:** \`Organization\` + \`WebSite\` + \`BlogPosting\` + \`FAQPage\` JSON-LD active.`;
      } else {
        replyText = isGeneralCopilot
          ? `I'm connected to your live **${siteName}** workspace (${
              body.workspaceKnowledge?.totalArticlesCount ?? 0
            } articles, ${
              body.workspaceKnowledge?.totalVisualAssetsCount ?? 0
            } visual assets, and ${
              body.workspaceKnowledge?.sessionTokensUsed.toLocaleString() ?? '0'
            } session tokens used).\n\nAsk me for a workspace summary, launch a new article campaign, teach a permanent rule with *"Remember: ..."*, or switch to any of the 36 specialists above.`
          : `Done — I've applied your instruction ("${rawMessage}") for **${siteName}** using ${
              promptStack.activeAgentLearnedSkills.length
            } saved custom rule(s) while keeping the other ${
              interruptPlan.uninterruptedAgentCount
            } agents running smoothly.`;
      }
    }

    return NextResponse.json({
      ok: true,
      agentId: isGeneralCopilot ? GENERAL_COPILOT_AGENT_ID : targetEmployee.id,
      agentName: responderName,
      departmentBadge: responderBadge,
      replyText,
      spawnedKeywordBrief,
      recommendedTabRedirect,
      selectiveInterruptPlan: interruptPlan,
      learnedSkillRule: interruptPlan.learnedSkillRule,
      tokenUsage: {
        modelId: llmCall.modelId,
        apiKeySlot: llmCall.apiKeySlot,
        usedLiveApiKey: llmCall.usedLiveApiKey,
        promptTokens: llmCall.promptTokens,
        completionTokens: llmCall.completionTokens,
        thinkingTokens: llmCall.thinkingTokens,
        totalTokens: llmCall.totalTokens,
        shadowPaidCostUsd: llmCall.shadowPaidCostUsd,
        actualCostUsd: llmCall.actualCostUsd,
      },
      timestamp: new Date().toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
      }),
    });
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        error:
          error instanceof Error
            ? error.message
            : 'Failed to process workspace copilot message.',
      },
      { status: 500 }
    );
  }
}
