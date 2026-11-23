import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import {
  geminiTextFormat,
  getGeminiClient,
  getGeminiModel,
  isAiConfigured,
} from "@/lib/ai-tools/gemini";
import { BodyError, readBoundedJson } from "@/lib/ai-tools/request-body";
import { buildDeterministicReviewReplies } from "@/features/google-review-response-generator/model";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

const inputSchema = z.object({
  businessName: z.string().trim().min(2).max(140),
  cityAndState: z.string().trim().min(2).max(120),
  primaryServiceMentioned: z.string().trim().max(180).default(""),
  reviewerName: z.string().trim().max(100).default("Valued Customer"),
  sentiment: z.enum(["5-star", "3-star", "1-star"]).default("5-star"),
  reviewText: z.string().trim().min(5).max(2500),
  ownerSignOff: z.string().trim().max(120).default(""),
  resolutionPhoneOrEmail: z.string().trim().max(120).default(""),
});

const aiReplySchema = z.object({
  replies: z
    .array(
      z.object({
        style: z.enum([
          "Warm & Local-SEO Optimized",
          "Concise & Professional",
          "Empathy & Offline Resolution",
        ]),
        replyText: z.string().min(40).max(650),
        localSignalsIncluded: z.array(z.string().min(2).max(60)).min(2).max(4),
      }),
    )
    .min(3)
    .max(3),
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
              : "Provide your business name, city, and customer review text.",
        },
      },
      { status: 422 },
    );
  }

  const fallback = buildDeterministicReviewReplies(input);
  const model = getGeminiModel("REVIEW_RESPONSE") || getGeminiModel();
  if (!isAiConfigured(model)) {
    return NextResponse.json({ replies: fallback, provider: "deterministic" });
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
              "You are a Local SEO & Reputation Management Specialist. Generate 3 distinct owner responses to a Google Business Profile customer review: (1) Warm & Local-SEO Optimized (naturally referencing the business name, city, and specific service without robotic keyword stuffing), (2) Concise & Professional, and (3) Empathy & Offline Resolution (especially critical for 1-star or 3-star reviews—never argue publicly, respect privacy/HIPAA, and invite offline contact).",
          },
          {
            role: "user",
            content: JSON.stringify(input),
          },
        ],
        text: {
          format: geminiTextFormat(aiReplySchema, "google_review_replies", {
            compact: true,
          }),
        },
      },
      { timeout: 25000 },
    );

    if (!res.output_parsed) {
      return NextResponse.json({ replies: fallback, provider: "deterministic" });
    }

    const replies = res.output_parsed.replies.map((r) => ({
      ...r,
      wordCount: r.replyText.trim().split(/\s+/).length,
    }));

    return NextResponse.json({ replies, provider: "ai" });
  } catch {
    return NextResponse.json({ replies: fallback, provider: "deterministic" });
  }
}
