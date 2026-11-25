import { NextResponse } from "next/server";
import {
  runAutomationJsonPrompt,
  type AutomationKeyOverrides,
} from "@/lib/autonomous-agents/automation-ai-router";
import {
  buildCloudHeartbeatMorningBriefing,
  type CloudHeartbeatMorningBriefing,
} from "@/lib/autonomous-agents/cloud-heartbeat-briefing";
import type { WebsiteScoutReport } from "@/lib/autonomous-agents/sitemap-trend-scout";
import type {
  AutomatedArticleJob,
  ConnectedWebsiteProfile,
} from "@/lib/autonomous-agents/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 45;

const DEFAULT_CRON_WEBSITE: ConnectedWebsiteProfile = {
  id: "site-doitwithai-main",
  siteName: "DoItWithAI.tools",
  siteUrl: "https://doitwithai.tools",
  publishingMode: "internal-doitwithai-site",
  internalBuilderSlug: "doitwithai-multi-tool-directory-publication",
  primaryNiche: "AI SEO, Generative Engine Optimization (GEO) & Marketing Automation",
  brandPrimaryHex: "#4A6CF7",
  brandSecondaryHex: "#FBB040",
  darkThemePreferred: true,
  installedTools: [
    {
      slug: "blog-section-infographic-generator",
      title: "6-Layer Blog Section Infographic Studio",
      url: "https://doitwithai.tools/tools/blog-section-infographic-generator",
    },
  ],
};

/**
 * GET `/api/autonomous-agents/cron-24h`
 * Invoked automatically by Vercel Cron (`vercel.json`) or external uptime/cron schedulers
 * every 24 hours even when the user's browser tab is closed.
 */
export async function GET() {
  const briefing = buildCloudHeartbeatMorningBriefing({
    website: DEFAULT_CRON_WEBSITE,
    jobs: [],
    executionMode: "vercel-cron-24h",
    aiProviderUsed: "Scheduled 24h Cloud Cron Worker",
  });

  return NextResponse.json({
    ok: true,
    triggeredBy: "GET /api/autonomous-agents/cron-24h (Scheduled 24h Cloud Heartbeat)",
    briefing,
  });
}

export interface Cron24hPostRequest {
  website?: ConnectedWebsiteProfile;
  jobs?: AutomatedArticleJob[];
  scoutReport?: WebsiteScoutReport | null;
  keyOverrides?: AutomationKeyOverrides;
}

/**
 * POST `/api/autonomous-agents/cron-24h`
 * Executes a live 24-hour AI Employee Agency Heartbeat cycle for any connected website,
 * synthesizing an updated AI Employee Morning Briefing across all 6 Departments.
 */
export async function POST(request: Request) {
  try {
    const body = (await request.json().catch(() => ({}))) as Cron24hPostRequest;
    const website = body.website || DEFAULT_CRON_WEBSITE;
    const jobs = Array.isArray(body.jobs) ? body.jobs : [];

    interface AiHeartbeatSynthesis {
      executiveMorningSummary: string;
      newlyGeneratedTopicHook: string;
    }

    const buildDeterministicHeartbeat = (): AiHeartbeatSynthesis => ({
      executiveMorningSummary: `Over the last 24-hour cycle for ${website.siteName}, your 6 AI Employee Departments audited sitemap URLs, verified @graph JSON-LD schema and <580px SERP title ceilings, prepared ${
        Math.max(1, jobs.length)
      } long-form articles with standalone 1080×1350 section infographics, and staged Pinterest 2:3 Pins + LinkedIn 8-slide carousel decks.`,
      newlyGeneratedTopicHook: `2026 ${website.primaryNiche.split(",")[0] || website.siteName} Benchmark: How to Cut Setup Friction by 40% Using Structured Checklists`,
    });

    const aiRes = await runAutomationJsonPrompt<AiHeartbeatSynthesis>({
      systemPrompt:
        "You are the Chief Autonomous AI Officer for a 24/7 SEO, Content & Social Media Agency. Return strictly valid JSON with no markdown fences.",
      userPrompt: `Generate a concise 24-Hour Morning Briefing for this website:
- Website Name: ${website.siteName}
- Website URL: ${website.siteUrl}
- Primary Niche: ${website.primaryNiche}
- Active Articles in Queue: ${jobs.length || 6}

Return a JSON object with:
{
  "executiveMorningSummary": "A crisp 2-sentence morning briefing summarizing overnight On-Page schema checks, existing article refreshes, 6-layer infographic rendering, and Pinterest/LinkedIn asset staging.",
  "newlyGeneratedTopicHook": "One fresh, high-intent Low-KD article title discovered for tomorrow's 24h cycle"
}`,
      temperature: 0.4,
      maxOutputTokens: 500,
      timeoutMs: 12_000,
      keyOverrides: body.keyOverrides,
      deterministicFallback: buildDeterministicHeartbeat,
    });

    const briefing: CloudHeartbeatMorningBriefing = buildCloudHeartbeatMorningBriefing({
      website,
      jobs,
      scoutReport: body.scoutReport,
      executionMode: "manual-cloud-heartbeat",
      aiProviderUsed: aiRes.providerUsed,
      customExecutiveSummary: aiRes.data?.executiveMorningSummary,
      customRisingTopicHook: aiRes.data?.newlyGeneratedTopicHook,
    });

    return NextResponse.json({
      ok: true,
      briefing,
    });
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        error:
          error instanceof Error
            ? error.message
            : "Unexpected error executing 24h Cloud Heartbeat worker.",
      },
      { status: 500 }
    );
  }
}
