import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import {
  geminiTextFormat,
  getGeminiClient,
  getGeminiModel,
  isAiConfigured,
} from "@/lib/ai-tools/gemini";
import { BodyError, readBoundedJson } from "@/lib/ai-tools/request-body";
import { buildDeterministicYoutubeVariations } from "@/features/youtube-title-thumbnail-optimizer/model";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

const inputSchema = z.object({
  topicOrKeyword: z.string().trim().min(2).max(160),
  draftTitle: z.string().trim().max(200).default(""),
  thumbnailOverlayText: z.string().trim().max(80).default(""),
  channelName: z.string().trim().max(100).default("Creator Channel"),
  targetAudience: z.string().trim().max(200).default(""),
  videoDuration: z.string().trim().max(20).default("12:45"),
});

const aiYoutubeSchema = z.object({
  variations: z
    .array(
      z.object({
        framework: z.enum([
          "Curiosity & Open Loop",
          "Quantified Benchmark / Case Study",
          "Mistake / Warning Hook",
          "Step-by-Step Blueprint",
          "Time-Bound Challenge",
        ]),
        title: z.string().min(20).max(95),
        thumbnailText: z.string().min(4).max(32),
        whyItClicks: z.string().min(15).max(220),
      }),
    )
    .min(5)
    .max(5),
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
              : "Provide a video topic or target keyword.",
        },
      },
      { status: 422 },
    );
  }

  const fallback = buildDeterministicYoutubeVariations(input);
  const model = getGeminiModel("YOUTUBE_OPTIMIZER") || getGeminiModel();
  if (!isAiConfigured(model)) {
    return NextResponse.json({
      variations: fallback,
      provider: "deterministic",
    });
  }

  try {
    const client = getGeminiClient();
    const res = await client.generate(
      {
        model,
        max_output_tokens: 1400,
        store: false,
        input: [
          {
            role: "system",
            content:
              "You are a YouTube Packaging & CTR Strategist. Given a video topic and audience, generate 5 high-CTR YouTube Title + Thumbnail Text pairs across 5 frameworks (Curiosity & Open Loop, Quantified Benchmark / Case Study, Mistake / Warning Hook, Step-by-Step Blueprint, Time-Bound Challenge). Keep titles between 42 and 62 characters so they never truncate on mobile, and keep thumbnailText to 2–4 punchy uppercase words that complement (never repeat) the title.",
          },
          {
            role: "user",
            content: JSON.stringify(input),
          },
        ],
        text: {
          format: geminiTextFormat(aiYoutubeSchema, "youtube_packaging_pack", {
            compact: true,
          }),
        },
      },
      { timeout: 25000 },
    );

    if (!res.output_parsed) {
      return NextResponse.json({
        variations: fallback,
        provider: "deterministic",
      });
    }

    const variations = res.output_parsed.variations.map((v) => ({
      ...v,
      charCount: v.title.length,
    }));

    return NextResponse.json({ variations, provider: "ai" });
  } catch {
    return NextResponse.json({
      variations: fallback,
      provider: "deterministic",
    });
  }
}
