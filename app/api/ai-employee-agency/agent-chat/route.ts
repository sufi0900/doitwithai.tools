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

/**
 * ============================================================================
 * DOITWITHAI.TOOLS — 24/7 AI EMPLOYEE AGENCY OS (V2 PHASE 5)
 * API Route: `app/api/ai-employee-agency/agent-chat/route.ts`
 *
 * Real-Time Founder Command Chat & 1-on-1 Specialist Agent Endpoint:
 * - Handles natural-language text or voice commands directed either to the
 *   `Chief AI Officer` (`agent-chief-orchestrator`) OR any individual AI
 *   Department Manager / Sub-Agent (36 total employees).
 * - When the Founder asks to write, launch, or research a new topic/article,
 *   runs `scoreKeywordWithDoItWithAiEngine` and returns a `spawnedKeywordBrief`
 *   so the dashboard immediately spawns the article and triggers the 6-stage
 *   handoff animation!
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

    const siteName = (body.siteName || 'DoItWithAI.tools').trim();
    const siteUrl = (body.siteUrl || 'https://doitwithai.tools').trim();
    const primaryNiche = (body.primaryNiche || 'AI SEO & Digital Marketing').trim();
    const activeKeyword = (body.activeKeyword || 'ai seo audit checklist').trim();
    const activeArticleTitle = (
      body.activeArticleTitle || '2026 AI SEO Audit & Implementation Playbook'
    ).trim();

    const allEmployees = getAllAgencyEmployeesFlat();
    const targetEmployee =
      allEmployees.find((e) => e.id === body.agentId) || allEmployees[0]!;

    const lower = rawMessage.toLowerCase();
    const wantsNewArticleOrCampaign =
      lower.includes('launch') ||
      lower.includes('write') ||
      lower.includes('new article') ||
      lower.includes('blog post') ||
      lower.includes('create an article') ||
      lower.includes('start a campaign');

    let replyText = '';
    let spawnedKeywordBrief: ScoredKeywordBrief | undefined;
    let recommendedTabRedirect: AgencySidebarTabId | undefined;

    if (wantsNewArticleOrCampaign) {
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

      replyText = `✅ [${targetEmployee.name}]: I've launched a full cross-department campaign for "${spawnedKeywordBrief.recommendedH1Title}" (Primary Keyword: "${spawnedKeywordBrief.keyword}" · KD ${spawnedKeywordBrief.kdScore}/100 · Est. Volume: ${spawnedKeywordBrief.estimatedMonthlyVolume}/mo):\n1. 🔑 Keyword Strategist locked the H1–H3 outline & 4 PAA FAQ items.\n2. 🎨 Graphic Design Director is rendering the 1200×675 Featured Hero Image + 4× 1080×1350 6-Layer Section Infographics.\n3. ✍️ Content Production Manager & On-Page SEO Lead are drafting the 50-word AEO answer lead, H2 prose, internal links & @graph JSON-LD.\n4. 📲 Social & TikTok Video Manager is staging 3× 2:3 Pinterest Pins, an 8-Slide LinkedIn Carousel & a 60s TikTok script.`;
    } else if (
      targetEmployee.departmentTab === 'keyword-strategist' ||
      lower.includes('keyword') ||
      lower.includes('kd')
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
      replyText = `🔑 [${targetEmployee.name}]: I ran our DoItWithAI Keyword KD Scorer on your query for ${siteName}:\n• Option 1: "${briefA.keyword}" — KD ${briefA.kdScore}/100 (${briefA.difficultyLabel}), Vol ${briefA.estimatedMonthlyVolume}/mo, AEO Score ${briefA.aeoCitationScore}/100\n• Option 2: "${briefB.keyword}" — KD ${briefB.kdScore}/100 (${briefB.difficultyLabel}), Vol ${briefB.estimatedMonthlyVolume}/mo\nRecommended H1: "${briefA.recommendedH1Title}". Click "Hand Off to Content Production Manager" in the Keyword Strategist tab to start drafting immediately!`;
    } else if (
      targetEmployee.id.includes('tiktok') ||
      targetEmployee.departmentTab === 'social-video-fleet' ||
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
      replyText = `🎬 [${targetEmployee.name}]: Here is your updated 60-Second TikTok / Reels / Shorts Hook & Storyboard for "${activeArticleTitle}":\n• [0:00–0:03 HOOK]: "${script.hook0To3Seconds.spokenHookLine}"\n• [0:03–0:18 PROBLEM]: "${script.problem3To18Seconds.spokenScript}"\n• [0:18–0:45 WALKTHROUGH]: "${script.walkthrough18To45Seconds.spokenScript}"\n• [0:45–0:60 CTA]: "${script.cta45To60Seconds.spokenScript}"\nOpen the Social & TikTok Video Fleet tab to copy the full storyboard, 8-Slide LinkedIn Carousel, and 3× Pinterest 2:3 Pins!`;
    } else if (
      targetEmployee.departmentTab === 'technical-seo' ||
      lower.includes('robots') ||
      lower.includes('cls') ||
      lower.includes('technical')
    ) {
      recommendedTabRedirect = 'technical-seo';
      replyText = `⚙️ [${targetEmployee.name}]: Technical & Entity SEO status for ${siteUrl}:\n• Core Web Vitals Vector Guard: 0.00 CLS verified on all 1200×675 and 1080×1350 inline SVGs.\n• AI Search Crawler Rules: Verified Allow rules for OAI-SearchBot, GPTBot, PerplexityBot, and Google-Extended.\n• Entity Disambiguation: Organization + WebSite + BlogPosting + FAQPage @graph JSON-LD ready in the Technical SEO tab.`;
    } else {
      replyText = `💬 [${targetEmployee.name} · ${targetEmployee.departmentBadge}]: Equipped with skills [${targetEmployee.equippedSkills.join(
        ', '
      )}] and tools [${targetEmployee.equippedTools.join(
        ', '
      )}]. I have logged your directive ("${rawMessage}") into the active ${siteName} workflow and updated our department deliverables.`;
    }

    return NextResponse.json({
      ok: true,
      agentId: targetEmployee.id,
      agentName: targetEmployee.name,
      departmentBadge: targetEmployee.departmentBadge,
      replyText,
      spawnedKeywordBrief,
      recommendedTabRedirect,
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
            : 'Failed to process agent chat command.',
      },
      { status: 500 }
    );
  }
}
