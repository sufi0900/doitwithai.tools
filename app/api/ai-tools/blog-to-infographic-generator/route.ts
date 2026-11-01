import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import {
  geminiTextFormat,
  getGeminiClient,
  getGeminiModel,
  isAiConfigured,
} from "@/lib/ai-tools/gemini";
import {
  buildDeterministicBlogInfographic,
  type BlogToInfographicInput,
} from "@/features/blog-to-infographic-generator/model";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

const aiInfographicSchema = z.object({
  infographicTitle: z.string(),
  infographicSubtitle: z.string(),
  kickerLabel: z.string(),
  recommendedTemplate: z.enum([
    "step-roadmap",
    "comparison-versus",
    "stat-bento-grid",
    "timeline-journey",
    "dos-and-donts",
    "pyramid-funnel",
    "numbered-checklist",
    "hub-anatomy",
  ]),
  nodes: z
    .array(
      z.object({
        badge: z.string(),
        title: z.string(),
        body: z.string(),
        metricValue: z.string(),
        compareRight: z.string(),
      }),
    )
    .min(4)
    .max(8),
  seoAltText: z.string(),
  socialCaption: z.string(),
});

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as Partial<BlogToInfographicInput>;
    const input: BlogToInfographicInput = {
      title: (body.title || "Visual Content Breakdown").trim(),
      sourceContent: (body.sourceContent || "").trim(),
      sourceUrl: (body.sourceUrl || "https://doitwithai.tools").trim(),
      brandFooter: (body.brandFooter || "doitwithai.tools").trim(),
      preferredTemplate: body.preferredTemplate || "step-roadmap",
    };

    const fallback = buildDeterministicBlogInfographic(input);
    const model = getGeminiModel("BLOG_INFOGRAPHIC") || getGeminiModel();

    if (isAiConfigured(model)) {
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
                  "You are an expert Information Designer and B2B Visual Strategist. Convert the user's blog post, sub-topic, or idea into a structured 6-node visual infographic blueprint. Keep each node's title under 6 words and body under 18 words so it renders cleanly inside an infographic card. Never cut words off mid-word.",
              },
              {
                role: "user",
                content: JSON.stringify({
                  title: input.title.slice(0, 200),
                  sourceContent: input.sourceContent.slice(0, 4000),
                  preferredTemplate: input.preferredTemplate,
                }),
              },
            ],
            text: {
              format: geminiTextFormat(
                aiInfographicSchema,
                "blog_to_infographic_pack",
                { compact: true },
              ),
            },
          },
          { timeout: 25000 },
        );

        if (res.output_parsed?.nodes?.length) {
          return NextResponse.json({
            pack: {
              ...res.output_parsed,
              nodes: res.output_parsed.nodes.map((n, idx) => ({
                id: `ai-node-${idx + 1}`,
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
            : "Failed to generate infographic blueprint.",
      },
      { status: 500 },
    );
  }
}
