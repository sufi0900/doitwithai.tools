import { NextResponse } from "next/server";
import { runLiveWebsiteAndTrendScout } from "@/lib/autonomous-agents/sitemap-trend-scout";
import type {
  WebsitePublishingMode,
  WinnerFormulaRecord,
} from "@/lib/autonomous-agents/types";

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
    };

    const siteUrl = String(body.siteUrl || "https://doitwithai.tools").trim();
    const primaryNiche = String(
      body.primaryNiche ||
        "AI SEO, GEO Answer Engine Optimization & Autonomous Workflows",
    ).trim();

    const result = await runLiveWebsiteAndTrendScout({
      siteUrl,
      primaryNiche,
      seedTopicsOrPrompt: body.seedTopicsOrPrompt || "",
      targetArticleCount: Number(body.targetArticleCount) || 5,
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
