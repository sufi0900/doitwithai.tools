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
  buildDeterministicOnPageRepairPack,
  type OnPageRepairInput,
} from "@/features/on-page-repair-agent/model";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

const inputSchema = z.object({
  targetUrl: z.string().trim().max(2048).default(""),
  primaryKeyword: z.string().trim().min(2).max(120),
  secondaryKeywords: z.string().trim().max(600).default(""),
  currentTitle: z.string().trim().max(250).default(""),
  currentDescription: z.string().trim().max(500).default(""),
  currentH1: z.string().trim().max(250).default(""),
  headingsList: z.string().trim().max(2500).default(""),
  imagesWithoutAlt: z.string().trim().max(1500).default(""),
  repairFocus: z
    .enum([
      "Full Technical & Editorial Repair",
      "CTR & Snippet Optimization",
      "Schema & Structured Data",
      "AI Overview & Position Zero",
    ])
    .default("Full Technical & Editorial Repair"),
  brandOrAuthorName: z.string().trim().max(160).default("Do It With AI Tools"),
});

const aiRepairSchema = z.object({
  optimizedTitle: z.string().min(20).max(65),
  optimizedDescription: z.string().min(80).max(160),
  positionZeroLeadBlock: z.string().min(80).max(600),
  diagnostics: z
    .array(
      z.object({
        id: z.string().min(2).max(40),
        category: z.enum([
          "Metadata & CTR",
          "Heading Hierarchy",
          "Schema & Entities",
          "Image Accessibility",
          "AI Answer Readiness",
        ]),
        severity: z.enum(["Critical", "Warning", "Optimal"]),
        issue: z.string().min(15).max(240),
        impact: z.string().min(15).max(240),
        autoFixSummary: z.string().min(15).max(240),
      }),
    )
    .min(3)
    .max(6),
  headingRefactors: z
    .array(
      z.object({
        level: z.enum(["H1", "H2", "H3"]),
        beforeText: z.string().min(2).max(160),
        afterText: z.string().min(10).max(160),
        intentRationale: z.string().min(15).max(240),
      }),
    )
    .min(3)
    .max(6),
  imageAltPatches: z
    .array(
      z.object({
        imageNameOrContext: z.string().min(2).max(140),
        suggestedAlt: z.string().min(15).max(150),
        htmlSnippet: z.string().min(25).max(320),
      }),
    )
    .min(2)
    .max(5),
  implementationChecklist: z.array(z.string().min(15).max(220)).min(4).max(6),
});

export async function POST(request: NextRequest) {
  let input: OnPageRepairInput;
  try {
    input = inputSchema.parse(await readBoundedJson(request, 100_000));
  } catch (error) {
    return NextResponse.json(
      {
        error: {
          message:
            error instanceof BodyError
              ? error.message
              : "Provide a primary keyword and optional page metadata to run the On-Page SEO Repair Agent.",
        },
      },
      { status: 422 },
    );
  }

  const fallback = buildDeterministicOnPageRepairPack(input);
  const model = getGeminiModel("ON_PAGE_REPAIR") || getGeminiModel();
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
              "You are an Autonomous Technical & On-Page SEO Repair Agent. Diagnose the user's current page metadata, heading structure, and missing image alt attributes, then generate concrete, ready-to-deploy code repairs: an optimized <title> (under 60 chars), high-CTR meta description (135-158 chars), a 50-word HTML Position Zero answer lead, before/after heading refactors, accessible image alt snippets, and a prioritized implementation checklist.",
          },
          {
            role: "user",
            content: JSON.stringify(input),
          },
        ],
        text: {
          format: geminiTextFormat(aiRepairSchema, "on_page_repair_pack", {
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
    const rebuilt = buildDeterministicOnPageRepairPack({
      ...input,
      currentTitle: p.optimizedTitle,
      currentDescription: p.optimizedDescription,
    });

    return NextResponse.json({
      pack: {
        ...fallback,
        optimizedTitle: p.optimizedTitle,
        titlePixelEstimate: rebuilt.titlePixelEstimate,
        optimizedDescription: p.optimizedDescription,
        descriptionCharCount: p.optimizedDescription.length,
        positionZeroLeadBlock: p.positionZeroLeadBlock,
        diagnostics: p.diagnostics,
        headingRefactors: p.headingRefactors,
        imageAltPatches: p.imageAltPatches,
        implementationChecklist: p.implementationChecklist,
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
