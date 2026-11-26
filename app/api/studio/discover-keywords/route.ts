import { NextResponse } from "next/server";
import { z } from "zod";
import { checkStudioRateLimit } from "@/lib/studio/studio-llm-gateway.server";
import { synthesizeAiSiteKeywordsAndIdeas } from "@/lib/studio/site-snapshot.server";

export const dynamic = "force-dynamic";
export const maxDuration = 35;

const requestSchema = z.object({
  siteId: z.string().min(1).max(120).default("studio-site"),
  siteUrl: z.string().min(3).max(500),
  siteName: z.string().max(160).default(""),
  niche: z.string().max(240).default(""),
  audience: z.string().max(240).default(""),
  primaryGoal: z.string().max(300).default(""),
  focusTopic: z.string().max(200).default(""),
  sitemapUrls: z
    .array(
      z.object({
        url: z.string().max(600),
        title: z.string().max(240).default(""),
      }),
    )
    .max(400)
    .default([]),
});

export async function POST(request: Request) {
  try {
    const limit = await checkStudioRateLimit(request, "studio-discover-keywords", {
      dailyLimit: 80,
      burstLimit: 12,
    });
    if (!limit.allowed) {
      return NextResponse.json(
        { error: "Keyword discovery rate limit reached. Please retry shortly." },
        { status: 429 },
      );
    }

    const raw = await request.json();
    const body = requestSchema.parse(raw);

    const synthesis = await synthesizeAiSiteKeywordsAndIdeas({
      siteId: body.siteId,
      siteUrl: body.siteUrl,
      siteName: body.siteName || body.siteUrl,
      title: body.siteName,
      metaDescription: body.niche,
      h1Text: body.focusTopic || body.niche,
      headings: body.focusTopic ? [body.focusTopic] : [],
      navLabels: [],
      bodyExcerpt: `${body.niche} ${body.audience} ${body.primaryGoal}`.trim(),
      explicitNiche: body.niche,
      explicitAudience: body.audience,
      primaryGoal: body.primaryGoal,
      focusTopic: body.focusTopic,
      sitemapUrls: body.sitemapUrls,
    });

    return NextResponse.json(
      {
        ok: true,
        usedAi: synthesis.usedAi,
        contentPillars: synthesis.contentPillars || [],
        keywords: synthesis.keywords,
      },
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch (err) {
    return NextResponse.json(
      {
        error:
          err instanceof Error
            ? err.message
            : "Unable to generate keyword ideas right now.",
      },
      { status: 400 },
    );
  }
}
