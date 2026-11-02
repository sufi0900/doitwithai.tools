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
  videoId: z.string().trim().max(40).default("cH9LbVH7EI4"),
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
    .max(4000)
    .default([]),
});

const aiSummarySchema = z.object({
  executiveSummary: z.string().min(120).max(1200),
  executiveSummaryParagraphs: z
    .array(z.string().min(60).max(520))
    .min(3)
    .max(4),
  keyTakeaways: z.array(z.string().min(25).max(300)).min(6).max(10),
  deepInsights: z
    .array(
      z.object({
        timestamp: z.string(),
        category: z.string(),
        title: z.string(),
        detail: z.string(),
      }),
    )
    .min(6)
    .max(10),
  actionChecklist: z.array(z.string().min(20).max(260)).min(5).max(8),
  chapters: z
    .array(
      z.object({
        timestamp: z.string().min(3).max(16),
        heading: z.string().min(5).max(110),
        summary: z.string().min(20).max(320),
      }),
    )
    .min(5)
    .max(10),
  videoFaqs: z
    .array(
      z.object({
        question: z.string(),
        answer: z.string(),
      }),
    )
    .min(4)
    .max(6),
});

export async function POST(request: NextRequest) {
  let input: z.infer<typeof inputSchema>;
  try {
    input = inputSchema.parse(await readBoundedJson(request, 900_000));
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
        max_output_tokens: 3200,
        store: false,
        input: [
          {
            role: "system",
            content:
              "You are a Senior Video Content Intelligence Analyst. Given a YouTube video's title, channel, and full timestamped transcript, produce an exhaustive, high-signal synthesis: (1) a 3-paragraph executive summary covering Core Premise & Context, Key Rules/Methodology/Comparisons across the middle of the video, and Final Verdict & Strategic Recommendations, (2) 8 deep key insights with exact timestamps, categories, bold titles, and detailed explanations spanning the full timeline from 0:00 to the end, (3) a 6-step actionable implementation checklist, (4) 6 to 8 timestamped chapters with clear headings and 2-sentence summaries, and (5) 5 detailed Video FAQs.",
          },
          {
            role: "user",
            content: JSON.stringify({
              title: fallback.title,
              channelName: fallback.channelName,
              segmentCount: fallback.segments.length,
              transcript: fallback.timestampedTranscript.slice(0, 24_000),
            }),
          },
        ],
        text: {
          format: geminiTextFormat(aiSummarySchema, "youtube_transcript_pack", {
            compact: true,
          }),
        },
      },
      { timeout: 32000 },
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
