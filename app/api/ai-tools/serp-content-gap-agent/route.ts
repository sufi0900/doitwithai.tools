import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import {
  geminiTextFormat,
  getGeminiClient,
  getGeminiModel,
  isAiConfigured,
} from "@/lib/ai-tools/gemini";
import { BodyError, readBoundedJson } from "@/lib/ai-tools/request-body";
import {
  buildDeterministicSerpContentGapPack,
  type SerpContentGapInput,
} from "@/features/serp-content-gap-agent/model";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

const inputSchema = z.object({
  targetUrl: z.string().trim().max(2048).default(""),
  primaryKeyword: z.string().trim().min(2).max(140),
  searchIntent: z
    .enum([
      "Informational (Guide / Tutorial)",
      "Commercial Investigation (Comparison / Best X)",
      "Transactional (Tool / Template / Product)",
      "Troubleshooting & How-To Fix",
    ])
    .default("Informational (Guide / Tutorial)"),
  userHeadingsList: z.string().trim().max(2500).default(""),
  competitorTopicsOrUrls: z.string().trim().max(2500).default(""),
  uniquePractitionerAngle: z.string().trim().max(1500).default(""),
});

const aiGapSchema = z.object({
  detectedIntentSummary: z.string().min(25).max(320),
  missingSubtopicGaps: z
    .array(
      z.object({
        id: z.string().min(2).max(30),
        missingHeading: z.string().min(8).max(140),
        level: z.enum(["H2", "H3"]),
        gapSeverity: z.enum([
          "High-Priority Gap",
          "Information Gain Opportunity",
        ]),
        competitorCoverageNote: z.string().min(20).max(260),
        readyToPasteMarkdown: z.string().min(100).max(1400),
      }),
    )
    .min(3)
    .max(5),
  peopleAlsoAskBlocks: z
    .array(
      z.object({
        question: z.string().min(10).max(160),
        conciseAnswer: z.string().min(35).max(400),
      }),
    )
    .min(3)
    .max(4),
});

export async function POST(request: NextRequest) {
  let input: SerpContentGapInput;
  try {
    input = inputSchema.parse(await readBoundedJson(request, 120_000));
  } catch (error) {
    return NextResponse.json(
      {
        error: {
          message:
            error instanceof BodyError
              ? error.message
              : "Provide a primary keyword and optional heading outline to run the SERP Content Gap Agent.",
        },
      },
      { status: 422 },
    );
  }

  const fallback = buildDeterministicSerpContentGapPack(input);
  const model = getGeminiModel("SERP_CONTENT_GAP") || getGeminiModel();
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
        max_output_tokens: 3000,
        store: false,
        input: [
          {
            role: "system",
            content:
              "You are an Autonomous Competitor SERP Content Gap & Outranker Agent. Compare the user's current H2/H3 outline against top-ranking SERP expectations and competitor subtopics for the target keyword. Identify 4 critical missing subtopics or Information Gain opportunities, write complete ready-to-paste Markdown H2 sections for each gap, and draft 3 concise People Also Ask (PAA) Q&A blocks.",
          },
          {
            role: "user",
            content: JSON.stringify(input),
          },
        ],
        text: {
          format: geminiTextFormat(aiGapSchema, "serp_content_gap_pack", {
            compact: true,
          }),
        },
      },
      { timeout: 35000 },
    );

    if (!res.output_parsed) {
      return NextResponse.json({
        pack: fallback,
        provider: "deterministic",
      });
    }

    const p = res.output_parsed;
    const compiledOutrankBlueprintMarkdown = [
      `# SERP Content Gap & Outranker Patch: ${input.primaryKeyword}`,
      ``,
      `**Detected Intent:** ${p.detectedIntentSummary}`,
      ``,
      `---`,
      ``,
      ...p.missingSubtopicGaps.flatMap((g, idx) => [
        `## [Gap #${idx + 1} · ${g.gapSeverity}] ${g.missingHeading}`,
        `> *Why this matters:* ${g.competitorCoverageNote}`,
        ``,
        g.readyToPasteMarkdown,
        ``,
      ]),
      `## High-Intent People Also Ask (PAA) Additions`,
      ``,
      ...p.peopleAlsoAskBlocks.flatMap((paa) => [
        `### ${paa.question}`,
        paa.conciseAnswer,
        ``,
      ]),
    ].join("\n");

    return NextResponse.json({
      pack: {
        ...fallback,
        detectedIntentSummary: p.detectedIntentSummary,
        missingSubtopicGaps: p.missingSubtopicGaps,
        peopleAlsoAskBlocks: p.peopleAlsoAskBlocks,
        compiledOutrankBlueprintMarkdown,
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
