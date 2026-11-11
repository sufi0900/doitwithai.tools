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
  buildDeterministicGeoCitationPack,
  type GeoCitationInput,
} from "@/features/ai-citation-geo-agent/model";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

const inputSchema = z.object({
  targetUrl: z.string().trim().max(2048).default(""),
  primaryTopicOrQuery: z.string().trim().min(3).max(160),
  brandOrAuthorEntity: z
    .string()
    .trim()
    .max(160)
    .default("Sufian Mustafa · Do It With AI Tools"),
  verifiedProfilesList: z.string().trim().max(2000).default(""),
  rawDraftOrParagraphs: z.string().trim().max(4000).default(""),
  proprietaryStatOrProof: z.string().trim().max(1500).default(""),
  optimizationGoal: z
    .enum([
      "Full AI Overview & Perplexity Readiness",
      "Quotable Data & Fact Tables",
      "Entity Disambiguation & sameAs Schema",
      "Direct Answer Lead Refactoring",
    ])
    .default("Full AI Overview & Perplexity Readiness"),
});

const aiGeoSchema = z.object({
  directAnswerDefinitionHtml: z.string().min(80).max(750),
  comparisonFactMatrixMarkdown: z.string().min(100).max(1400),
  quotablePassages: z
    .array(
      z.object({
        id: z.string().min(2).max(30),
        queryIntent: z.string().min(10).max(140),
        fluffyBefore: z.string().min(20).max(400),
        citationReadyAfter: z.string().min(40).max(550),
        wordCount: z.number().int().min(15).max(120),
        whyLLMsCiteThis: z.string().min(20).max(260),
      }),
    )
    .min(3)
    .max(4),
});

export async function POST(request: NextRequest) {
  let input: GeoCitationInput;
  try {
    input = inputSchema.parse(await readBoundedJson(request, 120_000));
  } catch (error) {
    return NextResponse.json(
      {
        error: {
          message:
            error instanceof BodyError
              ? error.message
              : "Provide a primary topic/query and optional draft paragraphs to run the AI Citation & GEO Agent.",
        },
      },
      { status: 422 },
    );
  }

  const fallback = buildDeterministicGeoCitationPack(input);
  const model = getGeminiModel("GEO_CITATION_AGENT") || getGeminiModel();
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
        max_output_tokens: 2800,
        store: false,
        input: [
          {
            role: "system",
            content:
              "You are an Autonomous Generative Engine Optimization (GEO) & AI Citation Agent. Refactor the user's topic, draft paragraphs, and first-party proof into high-citation density assets for Google AI Overviews, Perplexity, and ChatGPT Search: (1) an HTML <aside> containing a 45-58 word definition lead, (2) a structured Markdown comparison/fact table, and (3) 3 before/after quotable passage upgrades with word counts and RAG extraction rationale.",
          },
          {
            role: "user",
            content: JSON.stringify(input),
          },
        ],
        text: {
          format: geminiTextFormat(aiGeoSchema, "geo_citation_pack", {
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
    return NextResponse.json({
      pack: {
        ...fallback,
        directAnswerDefinitionHtml: p.directAnswerDefinitionHtml,
        comparisonFactMatrixMarkdown: p.comparisonFactMatrixMarkdown,
        quotablePassages: p.quotablePassages,
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
