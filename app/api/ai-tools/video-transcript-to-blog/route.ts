import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import {
  geminiTextFormat,
  getGeminiClient,
  getGeminiModel,
  isAiConfigured,
} from "@/lib/ai-tools/gemini";
import { BodyError, readBoundedJson } from "@/lib/ai-tools/request-body";
import { buildDeterministicBlogFromTranscript } from "@/features/video-transcript-to-blog/model";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

const inputSchema = z.object({
  videoTitle: z.string().trim().min(3).max(200),
  videoUrl: z.string().trim().max(500).default(""),
  targetKeyword: z.string().trim().max(140).default(""),
  speakerOrChannelName: z.string().trim().max(120).default(""),
  rawTranscript: z.string().trim().min(20).max(60_000),
});

const aiBlogSchema = z.object({
  seoTitle: z.string().min(15).max(68),
  metaDescription: z.string().min(60).max(165),
  executiveSummarySnippet: z.string().min(120).max(420),
  sections: z
    .array(
      z.object({
        heading: z.string().min(5).max(110),
        timestamp: z.string().max(20).optional(),
        paragraphs: z.array(z.string().min(25).max(600)).min(1).max(3),
        keyTakeawayBullet: z.string().min(15).max(200),
      }),
    )
    .min(3)
    .max(7),
  faqItems: z
    .array(
      z.object({
        question: z.string().min(10).max(160),
        answer: z.string().min(25).max(380),
      }),
    )
    .min(2)
    .max(4),
});

export async function POST(request: NextRequest) {
  let input: z.infer<typeof inputSchema>;
  try {
    input = inputSchema.parse(await readBoundedJson(request, 180_000));
  } catch (error) {
    return NextResponse.json(
      {
        error: {
          message:
            error instanceof BodyError
              ? error.message
              : "Provide a video title and transcript or timestamped notes.",
        },
      },
      { status: 422 },
    );
  }

  const fallback = buildDeterministicBlogFromTranscript(input);
  const model = getGeminiModel("VIDEO_TO_BLOG") || getGeminiModel();
  if (!isAiConfigured(model)) {
    return NextResponse.json({
      article: fallback,
      provider: "deterministic",
    });
  }

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
              "You are a Senior Technical Editor & SEO Content Architect. Convert the user's raw video transcript into a polished, publication-ready SEO blog post. Remove spoken filler words, organize chapters into clear H2 sections with polished paragraphs and key takeaway bullets, write a 48-word Featured Snippet executive summary, and include 3 FAQs grounded strictly in the transcript.",
          },
          {
            role: "user",
            content: JSON.stringify({
              ...input,
              rawTranscript: input.rawTranscript.slice(0, 18_000),
            }),
          },
        ],
        text: {
          format: geminiTextFormat(aiBlogSchema, "video_to_blog_article", {
            compact: true,
          }),
        },
      },
      { timeout: 30000 },
    );

    if (!res.output_parsed) {
      return NextResponse.json({
        article: fallback,
        provider: "deterministic",
      });
    }

    const p = res.output_parsed;
    const md = [
      `# ${p.seoTitle}`,
      "",
      `> **Executive Summary:** ${p.executiveSummarySnippet}`,
      "",
      "## Key Takeaways",
      ...p.sections.map((s) => `- **${s.heading}:** ${s.keyTakeawayBullet}`),
      "",
      ...p.sections.flatMap((s) => [
        `## ${s.heading}${s.timestamp ? ` [${s.timestamp}]` : ""}`,
        "",
        ...s.paragraphs.map((para) => `${para}\n`),
      ]),
      "## Frequently Asked Questions",
      ...p.faqItems.flatMap((f) => [`### ${f.question}`, f.answer, ""]),
    ].join("\n");

    const html = `<article>\n  <h1>${p.seoTitle}</h1>\n  <p><strong>Executive Summary:</strong> ${p.executiveSummarySnippet}</p>\n${p.sections.map((s) => `  <section>\n    <h2>${s.heading}</h2>\n${s.paragraphs.map((para) => `    <p>${para}</p>`).join("\n")}\n  </section>`).join("\n")}\n</article>`;

    return NextResponse.json({
      article: {
        ...fallback,
        ...p,
        markdownOutput: md,
        htmlOutput: html,
        cleanedWordCount: md.trim().split(/\s+/).length,
      },
      provider: "ai",
    });
  } catch {
    return NextResponse.json({
      article: fallback,
      provider: "deterministic",
    });
  }
}
