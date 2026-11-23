import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import {
  geminiTextFormat,
  getGeminiClient,
  getGeminiModel,
  isAiConfigured,
} from "@/lib/ai-tools/gemini";
import { readBoundedJson, BodyError } from "@/lib/ai-tools/request-body";
import {
  assembleFullPitchText,
  buildBioBlock,
  buildDeterministicPitchVariations,
  type JournalistPitchInput,
  type PitchVariation,
} from "@/features/journalist-pitch-builder/model";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

const inputSchema = z.object({
  platform: z
    .enum(["haro-email", "featured-qa", "qwoted-expert", "digital-pr-data"])
    .default("haro-email"),
  publicationOrOutlet: z.string().trim().max(160).default(""),
  journalistName: z.string().trim().max(120).default(""),
  queryTopic: z.string().trim().min(2).max(240),
  journalistQuery: z.string().trim().min(10).max(3000),
  expertName: z.string().trim().min(1).max(120),
  expertRole: z.string().trim().min(1).max(160),
  brandName: z.string().trim().min(1).max(140),
  brandUrl: z.string().trim().min(1).max(500),
  linkedinUrl: z.string().trim().max(500).default(""),
  headshotUrl: z.string().trim().max(500).default(""),
  coreThesis: z.string().trim().min(5).max(800),
  proofOrMetric: z.string().trim().max(800).default(""),
  practicalTakeaway: z.string().trim().max(800).default(""),
});

const aiOutputSchema = z.object({
  angles: z
    .array(
      z.object({
        id: z.enum(["direct-soundbite", "contrarian-data", "framework"]),
        subjectOptions: z.array(z.string().min(6).max(130)).min(2).max(3),
        credentialHook: z.string().min(15).max(260),
        quotableSoundbite: z.string().min(40).max(520),
        supportingPoints: z.array(z.string().min(10).max(240)).min(3).max(4),
      }),
    )
    .min(3)
    .max(3),
});

export async function POST(request: NextRequest) {
  let input: JournalistPitchInput;
  try {
    input = inputSchema.parse(await readBoundedJson(request, 120_000));
  } catch (error) {
    return NextResponse.json(
      {
        error: {
          message:
            error instanceof BodyError
              ? error.message
              : "Please complete the required journalist query, expert credentials, and core thesis fields.",
        },
      },
      { status: 422 },
    );
  }

  const fallbackVariations = buildDeterministicPitchVariations(input);
  const model = getGeminiModel("JOURNALIST_PITCH") || getGeminiModel();

  if (!isAiConfigured(model)) {
    return NextResponse.json({
      variations: fallbackVariations,
      provider: "deterministic",
    });
  }

  try {
    const client = getGeminiClient();
    const response = await client.generate(
      {
        model,
        max_output_tokens: 2200,
        store: false,
        input: [
          {
            role: "system",
            content:
              "You are a senior Digital PR & Journalist Relations Editor. Craft 3 distinct, highly quotable journalist pitch responses (1: direct-soundbite, 2: contrarian-data, 3: framework) based strictly on the expert's supplied credentials, thesis, and proof points. Never invent fake awards or unverified claims. Keep soundbites crisp (40–85 words), natural, and ready for a reporter to paste directly into their article.",
          },
          {
            role: "user",
            content: JSON.stringify({
              platform: input.platform,
              outlet: input.publicationOrOutlet,
              journalist: input.journalistName,
              topic: input.queryTopic,
              query: input.journalistQuery,
              expert: `${input.expertName}, ${input.expertRole} at ${input.brandName} (${input.brandUrl})`,
              coreThesis: input.coreThesis,
              proofOrMetric: input.proofOrMetric,
              practicalTakeaway: input.practicalTakeaway,
            }),
          },
        ],
        text: {
          format: geminiTextFormat(aiOutputSchema, "journalist_pitch", {
            compact: true,
          }),
        },
      },
      { timeout: 30000 },
    );

    const parsed = response.output_parsed;
    if (!parsed?.angles?.length) {
      return NextResponse.json({
        variations: fallbackVariations,
        provider: "deterministic",
      });
    }

    const bioBlock = buildBioBlock(input);
    const variations: PitchVariation[] = fallbackVariations.map((fb, idx) => {
      const aiAngle =
        parsed.angles.find((a) => a.id === fb.id) || parsed.angles[idx];
      if (!aiAngle) return fb;
      const fullFormattedPitch = assembleFullPitchText({
        platform: input.platform,
        journalistName: input.journalistName,
        publicationOrOutlet: input.publicationOrOutlet,
        credentialHook: aiAngle.credentialHook,
        quotableSoundbite: aiAngle.quotableSoundbite,
        supportingPoints: aiAngle.supportingPoints,
        bioBlock,
      });
      return {
        ...fb,
        subjectOptions: aiAngle.subjectOptions,
        selectedSubject: aiAngle.subjectOptions[0] || fb.selectedSubject,
        credentialHook: aiAngle.credentialHook,
        quotableSoundbite: aiAngle.quotableSoundbite,
        supportingPoints: aiAngle.supportingPoints,
        fullFormattedPitch,
      };
    });

    return NextResponse.json({
      variations,
      provider: "ai",
    });
  } catch {
    return NextResponse.json({
      variations: fallbackVariations,
      provider: "deterministic",
    });
  }
}
