import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import {
  geminiTextFormat,
  getGeminiClient,
  getGeminiModel,
  isAiConfigured,
} from "@/lib/ai-tools/gemini";
import { BodyError, readBoundedJson } from "@/lib/ai-tools/request-body";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

const inputSchema = z.object({
  businessName: z.string().trim().min(2).max(140),
  primaryCategory: z.string().trim().min(2).max(120),
  targetCity: z.string().trim().min(2).max(100),
  stateAbbr: z.string().trim().max(30).default(""),
  targetService: z.string().trim().min(2).max(140),
  uniqueLocalProofNotes: z.string().trim().max(1000).default(""),
});

const aiCityBriefSchema = z.object({
  localizedIntroParagraph: z.string().min(120).max(520),
  localProofChecklist: z.array(z.string().min(10).max(180)).min(4).max(5),
  citySpecificFaqs: z
    .array(
      z.object({
        question: z.string().min(10).max(160),
        answer: z.string().min(25).max(360),
      }),
    )
    .min(3)
    .max(4),
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
              : "Provide a business name, target city, and service.",
        },
      },
      { status: 422 },
    );
  }

  const cityState = [input.targetCity, input.stateAbbr]
    .filter(Boolean)
    .join(", ");
  const fallback = {
    localizedIntroParagraph: `Searching for dependable ${input.targetService.toLowerCase()} in ${cityState}? ${input.businessName} dispatches experienced ${input.primaryCategory.toLowerCase()} specialists across ${input.targetCity} with upfront written estimates, code-compliant workmanship, and proven local warranties.`,
    localProofChecklist: [
      `Embed 2–3 original photos of ${input.targetService.toLowerCase()} jobs completed in ${cityState}.`,
      `Feature 2 customer reviews from verified residents in ${input.targetCity}.`,
      `Mention local building codes, climate factors, or utility rebates applicable to ${cityState}.`,
      `Include driving directions or dispatch travel time from your primary office to ${input.targetCity}.`,
    ],
    citySpecificFaqs: [
      {
        question: `How quickly can ${input.businessName} schedule ${input.targetService.toLowerCase()} in ${cityState}?`,
        answer: `We offer same-day and next-day dispatch across ${cityState} with real-time arrival updates.`,
      },
      {
        question: `Do you provide upfront written pricing for ${input.targetService.toLowerCase()} in ${input.targetCity}?`,
        answer: `Yes. Every job in ${input.targetCity} starts with a transparent inspection and flat-rate quote before any work begins.`,
      },
      {
        question: `Are your ${input.primaryCategory.toLowerCase()} technicians licensed to work in ${cityState}?`,
        answer: `Yes, our crew is fully licensed, insured, and familiar with all local ${cityState} municipal requirements.`,
      },
    ],
  };

  const model = getGeminiModel("LOCAL_SERVICE_PLANNER") || getGeminiModel();
  if (!isAiConfigured(model)) {
    return NextResponse.json({ brief: fallback, provider: "deterministic" });
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
              "You are a Senior Local SEO Architect specializing in non-doorway Service-Area & City Landing Pages. Given a business, target city, and service, write: (1) an engaging, non-spammy localized opening paragraph, (2) 4 concrete local proof elements to include on the page so it passes Google's Helpful Content & Doorway Page guidelines, and (3) 3 city-specific FAQs.",
          },
          {
            role: "user",
            content: JSON.stringify(input),
          },
        ],
        text: {
          format: geminiTextFormat(aiCityBriefSchema, "city_service_brief", {
            compact: true,
          }),
        },
      },
      { timeout: 25000 },
    );

    return NextResponse.json({
      brief: res.output_parsed || fallback,
      provider: res.output_parsed ? "ai" : "deterministic",
    });
  } catch {
    return NextResponse.json({ brief: fallback, provider: "deterministic" });
  }
}
