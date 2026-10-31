import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import {
  geminiTextFormat,
  getGeminiClient,
  getGeminiModel,
  isAiConfigured,
} from "@/lib/ai-tools/gemini";
import { BodyError, readBoundedJson } from "@/lib/ai-tools/request-body";
import { buildDeterministicGbpPack } from "@/features/google-business-profile-auditor/model";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

const inputSchema = z.object({
  businessName: z.string().trim().min(2).max(140),
  primaryCategory: z.string().trim().min(2).max(120),
  secondaryCategoriesCsv: z.string().trim().max(500).default(""),
  cityAndState: z.string().trim().min(2).max(120),
  serviceAreasCsv: z.string().trim().max(500).default(""),
  description: z.string().trim().max(1500).default(""),
  servicesCsv: z.string().trim().max(1000).default(""),
});

const aiGbpSchema = z.object({
  optimizedDescription: z.string().min(180).max(750),
  recommendedCategories: z.array(z.string().min(3).max(80)).min(3).max(6),
  qaSeeds: z
    .array(
      z.object({
        question: z.string().min(10).max(180),
        answer: z.string().min(25).max(420),
      }),
    )
    .min(3)
    .max(5),
  weeklyPosts: z
    .array(
      z.object({
        type: z.enum(["What's New", "Offer", "Service Spotlight"]),
        headline: z.string().min(8).max(110),
        body: z.string().min(40).max(450),
        ctaLabel: z.string().min(4).max(30),
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
              : "Provide your business name, primary category, and target city.",
        },
      },
      { status: 422 },
    );
  }

  const fallback = buildDeterministicGbpPack({
    ...input,
    websiteUrl: "",
    appointmentUrl: "",
    reviewCount: 50,
    averageRating: 4.9,
    ownerReplyRatePercent: 90,
    photoCount: 25,
    postsPerMonth: 4,
    qaSeedCount: 4,
  });

  const model = getGeminiModel("GBP_AUDITOR") || getGeminiModel();
  if (!isAiConfigured(model)) {
    return NextResponse.json({
      optimizationPack: fallback,
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
              "You are a Senior Local SEO & Google Business Profile Strategist. Given a local business name, primary category, target city, and services, generate: (1) a policy-compliant, high-converting 450-to-720-character GBP description naturally weaving in the primary category, services, and service-area cities, (2) 4 to 5 specific secondary GBP categories, (3) 4 pre-seeded customer Q&As with authoritative answers, and (4) 3 ready-to-publish GBP Posts (Service Spotlight, Offer, What's New).",
          },
          {
            role: "user",
            content: JSON.stringify(input),
          },
        ],
        text: {
          format: geminiTextFormat(aiGbpSchema, "gbp_optimization_pack", {
            compact: true,
          }),
        },
      },
      { timeout: 28000 },
    );

    if (!res.output_parsed) {
      return NextResponse.json({
        optimizationPack: fallback,
        provider: "deterministic",
      });
    }

    return NextResponse.json({
      optimizationPack: res.output_parsed,
      provider: "ai",
    });
  } catch {
    return NextResponse.json({
      optimizationPack: fallback,
      provider: "deterministic",
    });
  }
}
