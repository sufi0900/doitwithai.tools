import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import {
  geminiTextFormat,
  getGeminiClient,
  getGeminiModel,
  isAiConfigured,
} from "@/lib/ai-tools/gemini";
import {
  buildDeterministicDataChart,
  type DataToChartInput,
} from "@/features/data-to-chart-visual-card-maker/model";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

const aiChartSchema = z.object({
  chartTitle: z.string(),
  chartSubtitle: z.string(),
  kickerBadge: z.string(),
  heroMetricValue: z.string(),
  heroMetricLabel: z.string(),
  points: z
    .array(
      z.object({
        label: z.string(),
        valueNumber: z.number(),
        displayValue: z.string(),
        note: z.string(),
      }),
    )
    .min(3)
    .max(6),
  socialPostText: z.string(),
});

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as Partial<DataToChartInput>;
    const input: DataToChartInput = {
      chartTitle: (body.chartTitle || "Benchmark Data Breakdown").trim(),
      chartSubtitle: (
        body.chartSubtitle || "Quantitative comparison across key drivers."
      ).trim(),
      rawSourceText: (body.rawSourceText || "").trim(),
      brandFooter: (body.brandFooter || "doitwithai.tools").trim(),
      template: body.template || "horizontal-bars",
    };

    const fallback = buildDeterministicDataChart(input);
    const model = getGeminiModel("DATA_CHART_CARD") || getGeminiModel();

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
                  "You are a B2B Data Journalist and Visual Designer. Extract 4 to 6 clean quantitative data points from the user's text or topic so they can be plotted on a high-contrast social data chart card. Ensure valueNumber is normalized between 5 and 100 for bar/ring plotting, while displayValue shows the exact human-readable figure (e.g. '84%', '3.4x', '$120k').",
              },
              {
                role: "user",
                content: JSON.stringify({
                  chartTitle: input.chartTitle.slice(0, 180),
                  rawSourceText: input.rawSourceText.slice(0, 3500),
                }),
              },
            ],
            text: {
              format: geminiTextFormat(aiChartSchema, "data_to_chart_pack", {
                compact: true,
              }),
            },
          },
          { timeout: 24000 },
        );

        if (res.output_parsed?.points?.length) {
          return NextResponse.json({
            pack: {
              ...res.output_parsed,
              points: res.output_parsed.points.map((p, idx) => ({
                id: `ai-dp-${idx + 1}`,
                ...p,
                valueNumber: Math.max(5, Math.min(100, Number(p.valueNumber) || 50)),
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
            : "Failed to build data chart card.",
      },
      { status: 500 },
    );
  }
}
