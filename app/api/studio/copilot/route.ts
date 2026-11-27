import { NextResponse } from "next/server";
import { z } from "zod";
import {
  ALL_LIVE_TOOLS,
  FOUNDER_MASTER_KNOWLEDGE,
  findMatchingArticles,
  findMatchingPrompts,
  findMatchingTools,
} from "@/features/do-it-ai/server-knowledge";
import {
  checkStudioRateLimit,
  generateStudioStructured,
  isStudioAiConfigured,
} from "@/lib/studio/studio-llm-gateway.server";

export const dynamic = "force-dynamic";
export const maxDuration = 40;

const requestSchema = z.object({
  message: z.string().min(2).max(2500),
  history: z
    .array(
      z.object({
        role: z.enum(["user", "assistant"]),
        content: z.string().max(4000),
      }),
    )
    .max(8)
    .default([]),
  siteContext: z
    .object({
      name: z.string().max(160).optional(),
      url: z.string().max(500).optional(),
      niche: z.string().max(300).optional(),
      audience: z.string().max(300).optional(),
      sitemapCount: z.number().optional(),
      seoScore: z.number().optional(),
      topKeywords: z.array(z.string().max(120)).max(10).optional(),
    })
    .optional(),
});

const copilotReplySchema = z.object({
  reply: z.string().min(20).max(3200),
  recommendedToolSlugs: z.array(z.string().max(80)).max(4).default([]),
  followUps: z.array(z.string().min(6).max(120)).min(2).max(3),
});

export async function POST(request: Request) {
  try {
    const limit = await checkStudioRateLimit(request, "studio-brand-copilot", {
      dailyLimit: 150,
      burstLimit: 20,
    });
    if (!limit.allowed) {
      return NextResponse.json(
        { error: "Strategist chat rate limit reached. Retry in a moment." },
        { status: 429 },
      );
    }

    const body = requestSchema.parse(await request.json());
    const matchedTools = findMatchingTools(body.message, 4);
    const matchedPrompts = findMatchingPrompts(body.message, 3);
    const matchedArticles = findMatchingArticles(body.message, 3);

    if (!isStudioAiConfigured()) {
      return NextResponse.json({
        ok: true,
        reply: `Based on ${body.siteContext?.name || "your workspace"}, start with **${matchedTools[0]?.name || "On-Page AI SEO Analyzer"}** inside your dashboard drawer, then apply the matched prompts below to tighten search intent and internal linking.`,
        recommendedTools: matchedTools.slice(0, 3).map((t) => ({
          slug: t.slug,
          name: t.name,
        })),
        recommendedPrompts: matchedPrompts.map((p) => ({
          id: p.id,
          title: p.title,
          prompt: p.prompt,
        })),
        followUps: [
          "Which 3 blog articles should I write first for my site?",
          "How do I improve my On-Page SEO score above 85/100?",
          "Which internal links should my pillar page point to?",
        ],
      });
    }

    const validToolSlugSet = new Set(ALL_LIVE_TOOLS.map((t) => t.slug));

    const { data } = await generateStudioStructured({
      schema: copilotReplySchema,
      schemaName: "studio_brand_strategist_reply",
      maxOutputTokens: 2200,
      timeoutMs: 28_000,
      temperature: 0.35,
      systemPrompt: `You are the DoItWithAI Brand SEO & Content Strategist inside the user's logged-in Studio Dashboard.
Combine:
1. The user's active connected website context (domain, niche, sitemap count, SEO score, saved keywords).
2. DoItWithAI's verified tools, prompts, and playbooks supplied in the context.
Rules:
- Give concise, specific, high-craft guidance in Markdown (use short bullet points and bold lead-ins; never write generic fluff).
- Guide the user to exact Studio sidebar workbenches (\`Content Writer\`, \`Keyword Research\`, \`On-Page SEO\`, \`Technical SEO\`, \`Off-Page SEO\`, \`Editorial Planner\`, \`Prompts, Tools & Playbooks\`) and only recommend tool slugs from \`availableTools\`.
- Return valid JSON only.`,
      userPrompt: JSON.stringify({
        userQuestion: body.message,
        recentHistory: body.history.slice(-6),
        connectedWebsite: body.siteContext || null,
        availableTools: matchedTools.map((t) => ({
          slug: t.slug,
          name: t.name,
          purpose: t.shortDescription,
        })),
        matchedPlaybooks: matchedArticles.map((a) => ({
          title: a.title,
          summary: a.summary,
        })),
        founderPrinciplesExcerpt: String(FOUNDER_MASTER_KNOWLEDGE || "").slice(
          0,
          1800,
        ),
      }),
    });

    const verifiedToolSlugs = Array.from(
      new Set([
        ...data.recommendedToolSlugs.filter((s) => validToolSlugSet.has(s)),
        ...matchedTools.slice(0, 2).map((t) => t.slug),
      ]),
    ).slice(0, 4);

    const recommendedTools = verifiedToolSlugs
      .map((slug) => ALL_LIVE_TOOLS.find((t) => t.slug === slug))
      .filter((t): t is NonNullable<typeof t> => Boolean(t))
      .map((t) => ({ slug: t.slug, name: t.name }));

    return NextResponse.json({
      ok: true,
      reply: data.reply,
      recommendedTools,
      recommendedPrompts: matchedPrompts.slice(0, 2).map((p) => ({
        id: p.id,
        title: p.title,
        prompt: p.prompt,
      })),
      followUps: data.followUps,
    });
  } catch (err) {
    return NextResponse.json(
      {
        error:
          err instanceof Error
            ? err.message
            : "Brand AI Strategist could not complete that reply.",
      },
      { status: 400 },
    );
  }
}
