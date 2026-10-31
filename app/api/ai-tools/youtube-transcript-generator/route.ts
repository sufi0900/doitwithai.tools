import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import {
  geminiTextFormat,
  getGeminiClient,
  getGeminiModel,
  isAiConfigured,
} from "@/lib/ai-tools/gemini";
import { BodyError, readBoundedJson } from "@/lib/ai-tools/request-body";
import { buildYoutubeTranscriptPack } from "@/features/youtube-transcript-generator/model";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

const inputSchema = z.object({
  videoId: z.string().trim().max(40).default("exampleSEO2026"),
  videoUrl: z.string().trim().max(1024).default(""),
  title: z.string().trim().max(240).default(""),
  channelName: z.string().trim().max(140).default(""),
  segments: z
    .array(
      z.object({
        timestamp: z.string(),
        seconds: z.number(),
        text: z.string(),
      }),
    )
    .max(400)
    .default([]),
});

const aiSummarySchema = z.object({
  executiveSummary: z.string().min(80).max(460),
  keyTakeaways: z.array(z.string().min(15).max(200)).min(4).max(6),
  chapters: z
    .array(
      z.object({
        timestamp: z.string().min(3).max(16),
        heading: z.string().min(5).max(90),
        summary: z.string().min(15).max(220),
      }),
    )
    .min(3)
    .max(6),
});

export async function POST(request: NextRequest) {
  let input: z.infer<typeof inputSchema>;
  try {
    input = inputSchema.parse(await readBoundedJson(request, 250_000));
  } catch (error) {
    return NextResponse.json(
      {
        error: {
          message:
            error instanceof BodyError
              ? error.message
              : "Provide a YouTube URL or transcript segments.",
        },
      },
      { status: 422 },
    );
  }

  const fallback = buildYoutubeTranscriptPack(input);
  const model = getGeminiModel("YOUTUBE_TRANSCRIPT") || getGeminiModel();
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
        max_output_tokens: 1500,
        store: false,
        input: [
          {
            role: "system",
            content:
              "You are a Video Content Analyst. Given a YouTube video's title and timestamped transcript segments, generate: (1) a concise 50-word executive summary, (2) 5 actionable key takeaway bullets, and (3) 4 to 6 timestamped chapters with clear headings and summaries.",
          },
          {
            role: "user",
            content: JSON.stringify({
              title: fallback.title,
              channelName: fallback.channelName,
              transcript: fallback.timestampedTranscript.slice(0, 12_000),
            }),
          },
        ],
        text: {
          format: geminiTextFormat(aiSummarySchema, "youtube_transcript_pack", {
            compact: true,
          }),
        },
      },
      { timeout: 26000 },
    );

    if (!res.output_parsed) {
      return NextResponse.json({
        pack: fallback,
        provider: "deterministic",
      });
    }

    return NextResponse.json({
      pack: buildYoutubeTranscriptPack({
        ...input,
        aiSummary: res.output_parsed,
      }),
      provider: "ai",
    });
  } catch {
    return NextResponse.json({
      pack: fallback,
      provider: "deterministic",
    });
  }
}
