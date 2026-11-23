import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import {
  geminiTextFormat,
  getGeminiClient,
  getGeminiModel,
  isAiConfigured,
} from "@/lib/ai-tools/gemini";
import {
  buildDeterministicQuotePack,
  type QuoteStudioInput,
} from "@/features/quote-stat-testimonial-card-studio/model";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

const aiQuotePackSchema = z.object({
  cards: z
    .array(
      z.object({
        quoteText: z.string(),
        highlightPhrase: z.string(),
        subContextOrReality: z.string(),
        badgeLabel: z.string(),
      }),
    )
    .min(3)
    .max(5),
  socialCaption: z.string(),
});

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as Partial<QuoteStudioInput>;
    const input: QuoteStudioInput = {
      authorName: (body.authorName || "Sufian Mustafa").trim(),
      authorHandleOrRole: (
        body.authorHandleOrRole || "@doitwithai · Founder & SEO Strategist"
      ).trim(),
      brandDomain: (body.brandDomain || "doitwithai.tools").trim(),
      sourceContent: (body.sourceContent || "").trim(),
      template: body.template || "arch-aura-split",
    };

    const fallback = buildDeterministicQuotePack(input);
    const model = getGeminiModel("QUOTE_STUDIO") || getGeminiModel();

    if (isAiConfigured(model)) {
      try {
        const client = getGeminiClient();
        const res = await client.generate(
          {
            model,
            max_output_tokens: 1600,
            store: false,
            input: [
              {
                role: "system",
                content:
                  "You are an elite Social Media Ghostwriter and Visual Quote Designer. Extract 4 to 5 punchy, high-shareability quotes, contrarian insights, or proof statements from the user's text. Keep each quoteText between 18 and 36 words, highlightPhrase to 4–7 words, and subContextOrReality under 22 words.",
              },
              {
                role: "user",
                content: JSON.stringify({
                  authorName: input.authorName,
                  sourceContent: input.sourceContent.slice(0, 3500),
                }),
              },
            ],
            text: {
              format: geminiTextFormat(
                aiQuotePackSchema,
                "quote_card_studio_pack",
                { compact: true },
              ),
            },
          },
          { timeout: 24000 },
        );

        if (res.output_parsed?.cards?.length) {
          return NextResponse.json({
            pack: {
              ...res.output_parsed,
              cards: res.output_parsed.cards.map((c, idx) => ({
                id: `ai-quote-${idx + 1}`,
                ...c,
              })),
            },
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
            : "Failed to generate quote visual cards.",
      },
      { status: 500 },
    );
  }
}
