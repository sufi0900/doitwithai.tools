import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import {
  geminiTextFormat,
  getGeminiClient,
  getGeminiModel,
  isAiConfigured,
} from "@/lib/ai-tools/gemini";
import {
  buildDeterministicFrameworkDiagram,
  type FrameworkDiagramInput,
} from "@/features/framework-matrix-diagram-builder/model";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

const aiDiagramSchema = z.object({
  diagramTitle: z.string(),
  diagramSubtitle: z.string(),
  centerOrCoreThesis: z.string(),
  xAxisLabel: z.string(),
  yAxisLabel: z.string(),
  nodes: z
    .array(
      z.object({
        tag: z.string(),
        title: z.string(),
        detail: z.string(),
      }),
    )
    .min(4)
    .max(6),
  socialPostText: z.string(),
});

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as Partial<FrameworkDiagramInput>;
    const input: FrameworkDiagramInput = {
      diagramTitle: (body.diagramTitle || "Strategic Framework Matrix").trim(),
      diagramSubtitle: (
        body.diagramSubtitle ||
        "Visual mental model for high-leverage execution."
      ).trim(),
      centerOrCoreThesis: (
        body.centerOrCoreThesis || "Core Strategic Engine"
      ).trim(),
      xAxisLabel: (
        body.xAxisLabel ||
        "Low Effort  ←  IMPLEMENTATION EFFORT  →  High Effort"
      ).trim(),
      yAxisLabel: (
        body.yAxisLabel || "Low Impact  ←  STRATEGIC IMPACT  →  High Impact"
      ).trim(),
      sourceNotes: (body.sourceNotes || "").trim(),
      brandFooter: (body.brandFooter || "doitwithai.tools").trim(),
      template: body.template || "matrix-2x2",
    };

    const fallback = buildDeterministicFrameworkDiagram(input);
    const model = getGeminiModel("FRAMEWORK_DIAGRAM") || getGeminiModel();

    if (isAiConfigured(model)) {
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
                  "You are a McKinsey-grade Strategy Consultant and Visual Information Designer. Transform the user's topic or notes into a clean 4-to-6 node strategic diagram (2x2 Matrix, SWOT, Circular Flywheel, 3-Pillar Architecture, Hub & Spoke, or Process Workflow). Keep each node's title under 5 words and detail under 18 words so it renders cleanly inside diagram boxes.",
              },
              {
                role: "user",
                content: JSON.stringify({
                  template: input.template,
                  diagramTitle: input.diagramTitle.slice(0, 180),
                  sourceNotes: input.sourceNotes.slice(0, 3500),
                }),
              },
            ],
            text: {
              format: geminiTextFormat(
                aiDiagramSchema,
                "framework_diagram_pack",
                { compact: true },
              ),
            },
          },
          { timeout: 24000 },
        );

        if (res.output_parsed?.nodes?.length) {
          return NextResponse.json({
            pack: {
              ...res.output_parsed,
              nodes: res.output_parsed.nodes.map((n, idx) => ({
                id: `ai-diag-${idx + 1}`,
                ...n,
              })),
            },
            provider: "ai",
          });
        }
      } catch {
        // Fallback below
      }
    }

    return NextResponse.json({
      pack: fallback,
      provider: "deterministic",
    });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Failed to generate framework diagram.",
      },
      { status: 500 },
    );
  }
}
