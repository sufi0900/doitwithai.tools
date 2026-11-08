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
  buildDeterministicSeoOptimizerPack,
  type SeoOptimizerAgentInput,
} from "@/features/seo-optimizer-ai-agent/model";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

const inputSchema = z.object({
  targetKeywordOrTopic: z.string().trim().min(2).max(180),
  pageUrl: z.string().trim().max(2048).default(""),
  draftTitle: z.string().trim().max(220).default(""),
  draftDescription: z.string().trim().max(400).default(""),
  authorNameAndCredentials: z.string().trim().max(220).default("Sufian Mustafa · Founder at DoItWithAI.tools"),
  brandOrSiteName: z.string().trim().max(120).default("Do It With AI Tools"),
  contentSummaryOrDraft: z.string().trim().max(4000).default(""),
});

const aiSeoOptimizerSchema = z.object({
  primaryIntent: z.enum([
    "Informational (Guide / Explainer)",
    "Commercial Investigation (Comparison / Best-Of)",
    "Transactional (Tool / Product / Service)",
    "Navigational (Brand / Portal)",
  ]),
  aeoVisibilityAngle: z.string().min(25).max(320),
  buyerStage: z.string().min(10).max(140),
  recommendedContentFormat: z.string().min(15).max(180),
  targetQueryCluster: z.array(z.string().min(3).max(100)).min(3).max(6),
  metaTitle: z.string().min(25).max(60),
  singleSentenceMetaDescription: z.string().min(90).max(160),
  powerAnswerText: z.string().min(180).max(420),
  eeatGaps: z
    .array(
      z.object({
        entityOrSignal: z.string().min(8).max(140),
        category: z.enum([
          "Experience",
          "Expertise",
          "Authoritativeness",
          "Trustworthiness",
        ]),
        status: z.enum(["Missing", "Weak", "Recommended"]),
        remediationSnippet: z.string().min(40).max(360),
      }),
    )
    .min(4)
    .max(4),
});

export async function POST(request: NextRequest) {
  let input: SeoOptimizerAgentInput;
  try {
    input = inputSchema.parse(await readBoundedJson(request, 120_000));
  } catch (error) {
    return NextResponse.json(
      {
        error: {
          message:
            error instanceof BodyError
              ? error.message
              : "Provide a target keyword or topic to run the 5-Step SEO & AEO Page Optimizer Agent.",
        },
      },
      { status: 422 },
    );
  }

  const fallback = buildDeterministicSeoOptimizerPack(input);
  const model = getGeminiModel("SEO_OPTIMIZER_AGENT") || getGeminiModel();
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
              "You are an Autonomous 5-Step SEO & AEO Page Optimizer Agent. Given a topic/URL, execute a 5-step optimization chain: (1) classify search & AI answer intent, (2) write a <580px meta title (<=58 chars) and a single-sentence meta description (<=158 chars), (3) write an extractable ~50-word AI Overview Power Answer starting with a direct copula definition, and (4) identify 4 E-E-A-T entity gaps with copy-paste remediation proof snippets.",
          },
          {
            role: "user",
            content: JSON.stringify(input),
          },
        ],
        text: {
          format: geminiTextFormat(
            aiSeoOptimizerSchema,
            "seo_optimizer_agent_pack",
            { compact: true },
          ),
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
    const words = p.powerAnswerText.trim().split(/\s+/);
    const mergedPack = {
      ...fallback,
      step1IntentClassification: {
        primaryIntent: p.primaryIntent,
        aeoVisibilityAngle: p.aeoVisibilityAngle,
        buyerStage: p.buyerStage,
        recommendedContentFormat: p.recommendedContentFormat,
        targetQueryCluster: p.targetQueryCluster,
      },
      step2MetaOptimization: {
        ...fallback.step2MetaOptimization,
        metaTitle: p.metaTitle,
        characterCount: p.metaTitle.length,
        singleSentenceMetaDescription: p.singleSentenceMetaDescription,
        descriptionCharCount: p.singleSentenceMetaDescription.length,
      },
      step3AeoPowerAnswer: {
        powerAnswerText: p.powerAnswerText,
        wordCount: words.length,
        htmlSnippetBlock: `<aside class="aeo-power-answer" aria-label="AI Overview Summary">\n  <p>${p.powerAnswerText}</p>\n</aside>`,
      },
      step4EeatEntityGaps: p.eeatGaps,
    };

    return NextResponse.json({
      pack: mergedPack,
      provider: "ai",
    });
  } catch {
    return NextResponse.json({
      pack: fallback,
      provider: "deterministic",
    });
  }
}
