import { NextResponse } from "next/server";
import { runLiveWebsiteAndTrendScout } from "@/lib/autonomous-agents/sitemap-trend-scout";
import type { AutomationKeyOverrides } from "@/lib/autonomous-agents/automation-ai-router";
import type {
  WebsitePublishingMode,
  WinnerFormulaRecord,
} from "@/lib/autonomous-agents/types";

export const maxDuration = 45;

export async function POST(request: Request) {
  try {
    const body = (await request.json().catch(() => ({}))) as {
      siteUrl?: string;
      primaryNiche?: string;
      seedTopicsOrPrompt?: string;
      targetArticleCount?: number;
      publishingMode?: WebsitePublishingMode;
      internalBuilderSlug?: string;
      existingSlugs?: string[];
      winnerFormulas?: WinnerFormulaRecord[];
      variationSeed?: number;
      keyOverrides?: AutomationKeyOverrides;
    };

    const siteUrl = String(body.siteUrl || "https://doitwithai.tools").trim();
    const primaryNiche = String(body.primaryNiche || "").trim();

    const result = await runLiveWebsiteAndTrendScout({
      siteUrl,
      primaryNiche,
      seedTopicsOrPrompt: body.seedTopicsOrPrompt || "",
      targetArticleCount: Number(body.targetArticleCount) || 6,
      publishingMode: body.publishingMode || "internal-doitwithai-site",
      internalBuilderSlug:
        body.internalBuilderSlug ||
        "doitwithai-multi-tool-directory-publication",
      existingSlugs: Array.isArray(body.existingSlugs)
        ? body.existingSlugs
        : [],
      winnerFormulas: Array.isArray(body.winnerFormulas)
        ? body.winnerFormulas
        : [],
      variationSeed:
        typeof body.variationSeed === "number"
          ? body.variationSeed
          : Math.floor(Math.random() * 10000),
      keyOverrides: body.keyOverrides,
    });

    return NextResponse.json({
      ok: true,
      ...result,
    });
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        error:
          error instanceof Error
            ? error.message
            : "Failed to execute Phase 2 Website & Trend Scout.",
      },
      { status: 500 },
    );
  }
}
