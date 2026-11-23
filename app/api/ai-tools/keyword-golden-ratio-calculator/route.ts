import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import {
  getGeminiClient,
  getGeminiModel,
  isAiConfigured,
  geminiTextFormat,
} from "@/lib/ai-tools/gemini";

export const runtime = "nodejs";
export const maxDuration = 45;
export const dynamic = "force-dynamic";

const strategySchema = z.object({
  headline: z.string().trim().min(10).max(180),
  summary: z.string().trim().min(25).max(600),
  clusterPlan: z
    .array(
      z.object({
        groupName: z.string().trim().min(4).max(100),
        keywords: z.string().trim().min(4).max(260),
        pageFormat: z.string().trim().min(4).max(80),
        suggestedTitle: z.string().trim().min(10).max(120),
      }),
    )
    .min(2)
    .max(4),
});

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as {
      nicheContext?: string;
      items?: Array<{
        keyword: string;
        allintitle: number;
        volume: number;
        kgr: number;
        tier: string;
      }>;
    };

    const items = Array.isArray(body.items) ? body.items.slice(0, 15) : [];
    const niche = (body.nicheContext || "SEO and digital marketing").slice(0, 250);

    const model = getGeminiModel();
    if (isAiConfigured(model) && items.length > 0) {
      try {
        const res = await getGeminiClient().generate(
          {
            model,
            max_output_tokens: 1000,
            input: [
              {
                role: "system",
                content:
                  "You are an SEO strategist. Group the user's KGR-scored keywords into 2 to 4 single-page clusters based on shared search intent, prioritizing KGR < 0.25 bargains first.",
              },
              {
                role: "user",
                content: `Niche: ${niche}\nKeywords:\n${items
                  .map(
                    (i) =>
                      `- "${i.keyword}" (Allintitle: ${i.allintitle}, Vol: ${i.volume}, KGR: ${i.kgr}, Tier: ${i.tier})`,
                  )
                  .join("\n")}`,
              },
            ],
            text: {
              format: geminiTextFormat(strategySchema, "kgr_strategy", {
                compact: true,
              }),
            },
          },
          { timeout: 18_000 },
        );
        return NextResponse.json({ ok: true, strategy: res.output_parsed });
      } catch {
        // Fall through to deterministic strategy
      }
    }

    const bargains = items.filter((i) => i.kgr < 0.25);
    const moderates = items.filter((i) => i.kgr >= 0.25);

    const fallback = {
      headline: `KGR Publishing Plan: ${bargains.length} Immediate Quick-Win Terms Identified`,
      summary: `Publish your ${bargains.length} low-competition KGR (<0.25) terms first to build fast early impressions in Google Search Console, while grouping closely related synonyms onto single canonical pages so they don't cannibalize each other.`,
      clusterPlan: [
        {
          groupName: "Wave 1: Immediate KGR Bargains (< 0.25)",
          keywords:
            bargains.map((b) => b.keyword).join(", ") ||
            items.slice(0, 2).map((b) => b.keyword).join(", "),
          pageFormat: "Interactive Utility or Focused How-To Guide",
          suggestedTitle: `${
            bargains[0]?.keyword
              ? bargains[0].keyword.charAt(0).toUpperCase() +
                bargains[0].keyword.slice(1)
              : "Low-Competition Keyword"
          }: Free Tool & Step-by-Step Guide`,
        },
        {
          groupName: "Wave 2: Supporting Pillar & Moderate Terms",
          keywords:
            moderates.map((m) => m.keyword).join(", ") ||
            items.slice(-2).map((b) => b.keyword).join(", "),
          pageFormat: "Comprehensive Comparison or Pillar Guide",
          suggestedTitle: `Complete ${niche.slice(0, 36)} Playbook: Tools, Formulas & Examples`,
        },
      ],
    };

    return NextResponse.json({ ok: true, strategy: fallback });
  } catch {
    return NextResponse.json(
      { error: "Could not generate KGR strategy." },
      { status: 500 },
    );
  }
}
