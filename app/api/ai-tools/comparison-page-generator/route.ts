import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import {
  geminiTextFormat,
  getGeminiClient,
  getGeminiModel,
  isAiConfigured,
} from "@/lib/ai-tools/gemini";
import { BodyError, readBoundedJson } from "@/lib/ai-tools/request-body";
import { buildDeterministicComparisonPage } from "@/features/comparison-page-generator/model";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

const inputSchema = z.object({
  optionAName: z.string().trim().min(2).max(100),
  optionBName: z.string().trim().min(2).max(100),
  categoryOrUseCase: z.string().trim().min(2).max(140),
  targetBuyerPersona: z.string().trim().max(180).default(""),
  optionAPricingAndStrengths: z.string().trim().min(5).max(1500),
  optionBPricingAndStrengths: z.string().trim().min(5).max(1500),
  criteriaLines: z.string().trim().max(1500).default(""),
});

const aiComparisonSchema = z.object({
  verdictSummarySnippet: z.string().min(120).max(440),
  chooseAIf: z.array(z.string().min(10).max(180)).min(3).max(4),
  chooseBIf: z.array(z.string().min(10).max(180)).min(3).max(4),
  matrixRows: z
    .array(
      z.object({
        criterion: z.string().min(3).max(80),
        optionAValue: z.string().min(3).max(140),
        optionBValue: z.string().min(3).max(140),
        winner: z.enum(["A", "B", "Tie"]),
      }),
    )
    .min(4)
    .max(7),
  faqs: z
    .array(
      z.object({
        question: z.string().min(10).max(160),
        answer: z.string().min(25).max(360),
      }),
    )
    .min(2)
    .max(4),
});

export async function POST(request: NextRequest) {
  let input: z.infer<typeof inputSchema>;
  try {
    input = inputSchema.parse(await readBoundedJson(request, 120_000));
  } catch (error) {
    return NextResponse.json(
      {
        error: {
          message:
            error instanceof BodyError
              ? error.message
              : "Provide Option A, Option B, and their key strengths.",
        },
      },
      { status: 422 },
    );
  }

  const fallback = buildDeterministicComparisonPage(input);
  const model = getGeminiModel("COMPARISON_PAGE") || getGeminiModel();
  if (!isAiConfigured(model)) {
    return NextResponse.json({
      comparison: fallback,
      provider: "deterministic",
    });
  }

  try {
    const client = getGeminiClient();
    const res = await client.generate(
      {
        model,
        max_output_tokens: 1800,
        store: false,
        input: [
          {
            role: "system",
            content:
              "You are a B2B Product Marketing & High-Intent Comparison SEO Strategist. Build an authoritative, unbiased 'X vs. Y' comparison page pack with: (1) a 50-word Featured Snippet executive verdict ('When comparing X vs. Y...'), (2) a 5-to-6-row side-by-side feature matrix, (3) clear 'Choose A if' and 'Choose B if' buyer bullets, and (4) 3 high-intent buyer FAQs.",
          },
          {
            role: "user",
            content: JSON.stringify(input),
          },
        ],
        text: {
          format: geminiTextFormat(aiComparisonSchema, "comparison_page_pack", {
            compact: true,
          }),
        },
      },
      { timeout: 28000 },
    );

    if (!res.output_parsed) {
      return NextResponse.json({
        comparison: fallback,
        provider: "deterministic",
      });
    }

    const p = res.output_parsed;
    const a = input.optionAName.trim();
    const b = input.optionBName.trim();

    const htmlTableMarkup = `<table class="comparison-matrix-table">\n  <thead>\n    <tr>\n      <th>Evaluation Criterion</th>\n      <th>${a}</th>\n      <th>${b}</th>\n      <th>Verdict</th>\n    </tr>\n  </thead>\n  <tbody>\n${p.matrixRows
      .map(
        (r) =>
          `    <tr>\n      <td><strong>${r.criterion}</strong></td>\n      <td>${r.optionAValue}</td>\n      <td>${r.optionBValue}</td>\n      <td>${r.winner === "A" ? a : r.winner === "B" ? b : "Tie"}</td>\n    </tr>`,
      )
      .join("\n")}\n  </tbody>\n</table>`;

    const md = [
      `# ${fallback.h1Heading}`,
      "",
      `> **Quick Verdict:** ${p.verdictSummarySnippet}`,
      "",
      `## Side-by-Side Feature Matrix: ${a} vs. ${b}`,
      "",
      `| Criterion | ${a} | ${b} | Winner |`,
      `| :--- | :--- | :--- | :--- |`,
      ...p.matrixRows.map(
        (r) =>
          `| **${r.criterion}** | ${r.optionAValue} | ${r.optionBValue} | ${r.winner === "A" ? `🏆 ${a}` : r.winner === "B" ? `🏆 ${b}` : "🤝 Tie"} |`,
      ),
      "",
      `## When to Choose ${a}`,
      ...p.chooseAIf.map((item) => `- ${item}`),
      "",
      `## When to Choose ${b}`,
      ...p.chooseBIf.map((item) => `- ${item}`),
      "",
      "## Frequently Asked Questions",
      ...p.faqs.flatMap((f) => [`### ${f.question}`, f.answer, ""]),
    ].join("\n");

    return NextResponse.json({
      comparison: {
        ...fallback,
        ...p,
        markdownOutput: md,
        htmlTableMarkup,
      },
      provider: "ai",
    });
  } catch {
    return NextResponse.json({
      comparison: fallback,
      provider: "deterministic",
    });
  }
}
