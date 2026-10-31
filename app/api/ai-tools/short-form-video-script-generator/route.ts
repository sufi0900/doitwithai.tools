import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import {
  geminiTextFormat,
  getGeminiClient,
  getGeminiModel,
  isAiConfigured,
} from "@/lib/ai-tools/gemini";
import { BodyError, readBoundedJson } from "@/lib/ai-tools/request-body";
import { buildDeterministicShortScript } from "@/features/short-form-video-script-generator/model";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

const inputSchema = z.object({
  topic: z.string().trim().min(4).max(300),
  coreTakeawayOrProof: z.string().trim().max(1500).default(""),
  platform: z
    .enum(["YouTube Shorts", "Instagram Reels", "TikTok"])
    .default("YouTube Shorts"),
  durationSeconds: z
    .union([z.literal(30), z.literal(45), z.literal(60)])
    .default(45),
  ctaGoal: z.string().trim().max(200).default(""),
});

const aiShortScriptSchema = z.object({
  hookVariations: z
    .array(
      z.object({
        angle: z.enum([
          "Contrarian Stop-Hook",
          "Proof / Number Hook",
          "Mistake Callout",
        ]),
        spokenHook: z.string().min(10).max(160),
        onScreenHook: z.string().min(4).max(42),
      }),
    )
    .min(3)
    .max(3),
  segments: z
    .array(
      z.object({
        timeRange: z.string().min(5).max(30),
        beatLabel: z.string().min(5).max(80),
        spokenLine: z.string().min(12).max(260),
        visualBRollCue: z.string().min(10).max(220),
        onScreenTextCaption: z.string().min(4).max(60),
      }),
    )
    .min(4)
    .max(6),
  captionWithHashtags: z.string().min(40).max(800),
});

export async function POST(request: NextRequest) {
  let input: z.infer<typeof inputSchema>;
  try {
    input = inputSchema.parse(await readBoundedJson(request, 100_000));
  } catch (error) {
    return NextResponse.json(
      {
        error: {
          message:
            error instanceof BodyError
              ? error.message
              : "Provide a short-form video topic and key takeaway.",
        },
      },
      { status: 422 },
    );
  }

  const fallback = buildDeterministicShortScript(input);
  const model = getGeminiModel("SHORT_VIDEO_SCRIPT") || getGeminiModel();
  if (!isAiConfigured(model)) {
    return NextResponse.json({
      scriptPack: fallback,
      provider: "deterministic",
    });
  }

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
              "You are a Viral Short-Form Video Producer for YouTube Shorts, Instagram Reels, and TikTok. Build a high-retention vertical video script paced at ~150 spoken words per minute with: (1) 3 interchangeable 0–3s hook variations (Contrarian Stop-Hook, Proof / Number Hook, Mistake Callout), (2) 5 timed retention beats with Pattern Interrupt B-roll cues every 7–10 seconds and punchy 3–5 word on-screen text captions, and (3) a ready-to-paste social caption with 5 hashtags.",
          },
          {
            role: "user",
            content: JSON.stringify(input),
          },
        ],
        text: {
          format: geminiTextFormat(aiShortScriptSchema, "short_video_script", {
            compact: true,
          }),
        },
      },
      { timeout: 28000 },
    );

    if (!res.output_parsed) {
      return NextResponse.json({
        scriptPack: fallback,
        provider: "deterministic",
      });
    }

    const allSpoken = res.output_parsed.segments
      .map((s) => s.spokenLine)
      .join(" ");
    const totalSpokenWords = allSpoken
      .trim()
      .split(/\s+/)
      .filter(Boolean).length;
    const estimatedSecondsAt150Wpm = Math.round((totalSpokenWords / 150) * 60);

    return NextResponse.json({
      scriptPack: {
        ...res.output_parsed,
        totalSpokenWords,
        estimatedSecondsAt150Wpm,
      },
      provider: "ai",
    });
  } catch {
    return NextResponse.json({
      scriptPack: fallback,
      provider: "deterministic",
    });
  }
}
