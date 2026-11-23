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
  buildDeterministicBlogPack,
  type BlogWriterInput,
} from "@/features/ai-blog-writer/model";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

const inputSchema = z.object({
  mode: z
    .enum(["full-article", "intro-hooks", "section-expander"])
    .default("full-article"),
  topicOrTitle: z.string().trim().min(3).max(180),
  primaryKeyword: z.string().trim().min(2).max(120),
  secondaryKeywords: z.string().trim().max(600).default(""),
  targetAudience: z.string().trim().max(200).default(""),
  tone: z
    .enum([
      "Practical & Authoritative",
      "Conversational & Friendly",
      "Analytical & Data-Driven",
      "Beginner-Friendly Step-by-Step",
    ])
    .default("Practical & Authoritative"),
  firstHandExperienceNote: z.string().trim().max(1500).default(""),
  customOutlineOrDraft: z.string().trim().max(3500).default(""),
});

const aiBlogSchema = z.object({
  h1Title: z.string().min(10).max(140),
  metaTitle: z.string().min(20).max(65),
  metaDescription: z.string().min(70).max(160),
  featuredSnippetAnswer: z.string().min(90).max(380),
  introHooks: z
    .array(
      z.object({
        framework: z.string().min(5).max(90),
        hookText: z.string().min(60).max(650),
      }),
    )
    .min(3)
    .max(3),
  sections: z
    .array(
      z.object({
        id: z.string().min(2).max(30),
        heading: z.string().min(5).max(130),
        level: z.enum(["H2", "H3"]),
        summaryGoal: z.string().min(15).max(220),
        bodyMarkdown: z.string().min(120).max(1600),
        eeatProofPrompt: z.string().min(20).max(260),
      }),
    )
    .min(3)
    .max(6),
  faqs: z
    .array(
      z.object({
        question: z.string().min(10).max(160),
        answer: z.string().min(30).max(400),
      }),
    )
    .min(3)
    .max(5),
  conclusionMarkdown: z.string().min(80).max(700),
});

export async function POST(request: NextRequest) {
  let input: BlogWriterInput;
  try {
    input = inputSchema.parse(await readBoundedJson(request, 120_000));
  } catch (error) {
    return NextResponse.json(
      {
        error: {
          message:
            error instanceof BodyError
              ? error.message
              : "Provide a blog topic/title and a primary keyword.",
        },
      },
      { status: 422 },
    );
  }

  const fallback = buildDeterministicBlogPack(input);
  const model = getGeminiModel("BLOG_WRITER") || getGeminiModel();
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
        max_output_tokens: 3200,
        store: false,
        input: [
          {
            role: "system",
            content:
              "You are a Senior Editorial SEO & E-E-A-T Content Strategist. Write a comprehensive, reader-first blog article pack tailored to the user's topic, primary/secondary keywords, target audience, and first-hand experience notes. Include: (1) a 45-58 word Featured Snippet answer block, (2) 3 distinct introduction hooks (Direct Answer + Proof, PAS, and Contrarian), (3) 4 to 5 substantive H2 sections in rich Markdown with bullet points and specific E-E-A-T proof prompts, (4) 3 high-intent FAQs, and (5) a practical conclusion.",
          },
          {
            role: "user",
            content: JSON.stringify(input),
          },
        ],
        text: {
          format: geminiTextFormat(aiBlogSchema, "blog_writer_pack", {
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
    const fullMarkdown = [
      `# ${p.h1Title}`,
      "",
      p.introHooks[0]?.hookText || fallback.introHooks[0].hookText,
      "",
      ...p.sections.flatMap((s) => [
        `## ${s.heading}`,
        "",
        s.bodyMarkdown,
        "",
        `> 💡 **${s.eeatProofPrompt}**`,
        "",
      ]),
      "## Frequently Asked Questions",
      "",
      ...p.faqs.flatMap((f) => [`### ${f.question}`, "", f.answer, ""]),
      p.conclusionMarkdown,
    ].join("\n");

    return NextResponse.json({
      pack: {
        ...p,
        fullMarkdown,
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
