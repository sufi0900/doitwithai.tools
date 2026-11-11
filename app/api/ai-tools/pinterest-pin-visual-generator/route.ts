import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import {
  geminiTextFormat,
  getGeminiClient,
  getGeminiModel,
  isAiConfigured,
} from "@/lib/ai-tools/gemini";
import {
  buildDeterministicPinterestVisualPack,
  type PinterestVisualInput,
} from "@/features/pinterest-pin-visual-generator/model";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

const aiPinterestSchema = z.object({
  primaryKeyword: z.string(),
  bulletSteps: z.array(z.string()).min(3).max(6),
  pinVariations: z
    .array(
      z.object({
        pinTitle: z.string(),
        pinHeadlineOverlay: z.string(),
        pinSubtextOverlay: z.string(),
        pinBadge: z.string(),
        seoDescription: z.string(),
        altText: z.string(),
        suggestedBoard: z.string(),
      }),
    )
    .min(3)
    .max(3),
  hashtags: z.array(z.string()),
});

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as Partial<PinterestVisualInput>;
    const input: PinterestVisualInput = {
      topicOrHeadline: (
        body.topicOrHeadline || "7 Actionable Content Strategy Tips"
      ).trim(),
      sourceStepsOrNotes: (body.sourceStepsOrNotes || "").trim(),
      targetKeyword: (body.targetKeyword || "Content Marketing").trim(),
      destinationDomain: (body.destinationDomain || "doitwithai.tools").trim(),
      template: body.template || "listicle-number-pin",
    };

    const fallback = buildDeterministicPinterestVisualPack(input);
    const model = getGeminiModel("PINTEREST_VISUAL") || getGeminiModel();

    if (isAiConfigured(model)) {
      try {
        const client = getGeminiClient();
        const res = await client.generate(
          {
            model,
            max_output_tokens: 1700,
            store: false,
            input: [
              {
                role: "system",
                content:
                  "You are an elite Pinterest SEO Strategist and Visual Pin Designer. Generate 3 high-converting Pinterest Pin variations (with punchy overlay headlines under 8 words, 5 concise bullet steps under 9 words each, 500-char keyword-rich Pinterest SEO descriptions, custom image Alt Text, and board suggestions).",
              },
              {
                role: "user",
                content: JSON.stringify({
                  topicOrHeadline: input.topicOrHeadline.slice(0, 200),
                  targetKeyword: input.targetKeyword,
                  destinationDomain: input.destinationDomain,
                  sourceStepsOrNotes: input.sourceStepsOrNotes.slice(0, 3500),
                }),
              },
            ],
            text: {
              format: geminiTextFormat(
                aiPinterestSchema,
                "pinterest_visual_pack",
                { compact: true },
              ),
            },
          },
          { timeout: 24000 },
        );

        if (res.output_parsed?.pinVariations?.length) {
          return NextResponse.json({
            pack: res.output_parsed,
            provider: "ai",
          });
        }
      } catch {
        // Fallback below
      }
    }

    return NextResponse.json({
      pack: fallback,
      provider: "deterministic",
    });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Failed to generate Pinterest visual pack.",
      },
      { status: 500 },
    );
  }
}
