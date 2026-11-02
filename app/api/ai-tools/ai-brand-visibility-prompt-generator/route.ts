import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import {
  geminiTextFormat,
  getGeminiClient,
  getGeminiModel,
  isAiConfigured,
} from "@/lib/ai-tools/gemini";
import { BodyError, readBoundedJson } from "@/lib/ai-tools/request-body";
import { buildDeterministicGeoPromptMatrix } from "@/features/ai-brand-visibility-prompt-generator/model";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

const inputSchema = z.object({
  brandName: z.string().trim().min(2).max(120),
  primaryCategory: z.string().trim().min(3).max(160),
  coreDifferentiator: z.string().trim().min(5).max(600),
  targetAudience: z.string().trim().min(3).max(200),
  competitorsCsv: z.string().trim().max(400).default(""),
});

const aiGeoPromptsSchema = z.object({
  prompts: z
    .array(
      z.object({
        id: z.string().min(1).max(20),
        stage: z.enum([
          "1. Category Discovery",
          "2. Best-For Use Case",
          "3. Competitor Comparison",
          "4. Trust, Pricing & Proof",
        ]),
        promptText: z.string().min(15).max(240),
        targetEngine: z.enum([
          "ChatGPT / SearchGPT",
          "Perplexity",
          "Google AI Overviews",
          "Gemini",
        ]),
        citationTriggerSignal: z.string().min(10).max(180),
      }),
    )
    .min(8)
    .max(12),
});

export async function POST(request: NextRequest) {
  let input: z.infer<typeof inputSchema>;
  try {
    input = inputSchema.parse(await readBoundedJson(request, 80_000));
  } catch (error) {
    return NextResponse.json(
      {
        error: {
          message:
            error instanceof BodyError
              ? error.message
              : "Provide your brand name, category, and differentiator.",
        },
      },
      { status: 422 },
    );
  }

  const fallback = buildDeterministicGeoPromptMatrix(input);
  const model = getGeminiModel("BRAND_GEO_MATRIX") || getGeminiModel();
  if (!isAiConfigured(model)) {
    return NextResponse.json({
      pack: fallback,
      provider: "deterministic",
    });
  }

  try {
    const client = getGeminiClient();
    const res = await client.generate(
      {
        model,
        max_output_tokens: 1800,
        store: false,
        input: [
          {
            role: "system",
            content:
              "You are a Generative Engine Optimization (GEO) & AI Search Visibility Analyst. Given a brand, category, differentiator, target audience, and competitors, generate 12 realistic buyer-intent test prompts across 4 stages (1. Category Discovery, 2. Best-For Use Case, 3. Competitor Comparison, 4. Trust, Pricing & Proof) to audit brand citation Share of Voice across ChatGPT, Perplexity, Google AI Overviews, and Gemini.",
          },
          {
            role: "user",
            content: JSON.stringify(input),
          },
        ],
        text: {
          format: geminiTextFormat(aiGeoPromptsSchema, "brand_geo_matrix", {
            compact: true,
          }),
        },
      },
      { timeout: 28000 },
    );

    if (!res.output_parsed) {
      return NextResponse.json({
        pack: fallback,
        provider: "deterministic",
      });
    }

    return NextResponse.json({
      pack: {
        ...fallback,
        prompts: res.output_parsed.prompts,
      },
      provider: "ai",
    });
  } catch {
    return NextResponse.json({
      pack: fallback,
      provider: "deterministic",
    });
  }
}
