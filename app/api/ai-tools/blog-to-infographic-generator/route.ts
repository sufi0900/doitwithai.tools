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
  detectBestTemplateForTopic,
  type BlogToInfographicInput,
} from "@/features/blog-to-infographic-generator/model";
import { inferNodeIcon } from "@/features/tool-ui/EditableInfographicStudio";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

const aiInfographicSchema = z.object({
  infographicTitle: z.string(),
  infographicSubtitle: z.string(),
  kickerLabel: z.string(),
  recommendedTemplate: z.enum([
    "winding-s-roadmap",
    "step-roadmap",
    "step-staircase-ascension",
    "circular-flywheel-cycle",
    "alternating-spine-timeline",
    "horizontal-timeline-gantt",
    "before-after-transformation",
    "isometric-3d-pyramid",
    "conversion-funnel-stages",
    "pillar-temple-architecture",
    "iceberg-hidden-layers",
    "side-image-editorial-split",
    "side-image-right-spotlight",
    "side-image-horizontal-board",
    "stat-donut-kpi-dashboard",
    "stat-bento-grid",
    "editorial-newspaper-digest",
    "versus-battle-comparison",
    "dos-and-donts-matrix",
    "quadrant-2x2-strategy",
    "radial-hub-and-spoke",
    "honeycomb-hex-cluster",
    "anatomy-x-ray-breakdown",
    "numbered-ribbon-banners",
    "horizontal-landscape-flow",
    "checklist-audit-scorecard",
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
  evidenceSummary: z.array(z.string()),
});

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as Partial<BlogToInfographicInput>;
    const input: BlogToInfographicInput = {
      title: (body.title || "Visual Content Breakdown").trim(),
      sourceContent: (body.sourceContent || "").trim(),
      sourceUrl: (body.sourceUrl || "https://doitwithai.tools").trim(),
      brandFooter: (body.brandFooter || "doitwithai.tools").trim(),
      preferredTemplate: body.preferredTemplate,
      sideImageUrl: body.sideImageUrl || "",
    };

    const fallback = buildDeterministicBlogInfographic(input);
    const model = getGeminiModel("BLOG_INFOGRAPHIC") || getGeminiModel();

    if (isAiConfigured(model)) {
      try {
        const client = getGeminiClient();
        const res = await client.generate(
          {
            model,
            max_output_tokens: 2200,
            store: false,
            input: [
              {
                role: "system",
                content:
                  "You are an elite Information Designer and Research Analyst. Whether the user provides a full article excerpt OR a short random topic/idea, synthesize 6 research-backed, high-signal visual infographic nodes complete with realistic quantitative benchmarks/metrics (e.g. '84%', '3.2x ROI', '+142%'), concise 3-to-5 word titles, and 12-to-16 word actionable explanations. Also select the best-fitting visual template from the 26 options and return a 6-point evidenceSummary array.",
              },
              {
                role: "user",
                content: JSON.stringify({
                  title: input.title.slice(0, 200),
                  sourceContent: input.sourceContent.slice(0, 4500),
                  preferredTemplate:
                    input.preferredTemplate ||
                    detectBestTemplateForTopic(
                      input.title,
                      input.sourceContent,
                      Boolean(input.sideImageUrl),
                    ),
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
                icon: inferNodeIcon(`${n.title} ${n.body}`, idx),
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
