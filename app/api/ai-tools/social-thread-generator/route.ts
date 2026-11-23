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
  buildDeterministicThread,
  getPlatformMaxChars,
} from "@/features/social-thread-generator/model";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

const inputSchema = z.object({
  topicOrHeadline: z.string().trim().min(3).max(220),
  sourceContent: z.string().trim().min(20).max(15_000),
  platform: z
    .enum(["X (Twitter)", "Threads", "LinkedIn Slide Text"])
    .default("X (Twitter)"),
  includeNumbering: z.boolean().default(true),
  ctaUrl: z.string().trim().max(500).default(""),
  authorHandle: z.string().trim().max(80).default("@DoItWithAI"),
});

const aiThreadSchema = z.object({
  hookOptions: z
    .array(
      z.object({
        angle: z.enum([
          "Data / Benchmark Hook",
          "Contrarian Framework",
          "Step-by-Step Playbook",
        ]),
        hookText: z.string().min(25).max(240),
      }),
    )
    .min(3)
    .max(3),
  bodyPosts: z.array(z.string().min(30).max(245)).min(4).max(8),
  recapPost: z.string().min(35).max(250),
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
              : "Provide a thread headline and source notes or article text.",
        },
      },
      { status: 422 },
    );
  }

  const fallback = buildDeterministicThread(input);
  const model = getGeminiModel("SOCIAL_THREAD") || getGeminiModel();
  if (!isAiConfigured(model)) {
    return NextResponse.json({
      thread: fallback,
      provider: "deterministic",
    });
  }

  try {
    const client = getGeminiClient();
    const maxChars = getPlatformMaxChars(input.platform);
    const res = await client.generate(
      {
        model,
        max_output_tokens: 1800,
        store: false,
        input: [
          {
            role: "system",
            content: `You are a Viral Social Thread Strategist for ${input.platform}. Turn the user's source notes into a punchy, high-retention multi-post thread where every post stays well under ${maxChars - 20} characters. Generate 3 interchangeable Post #1 Hook options, 4 to 7 concise Body Insight posts (1 clear idea per post), and 1 Recap & CTA finale post.`,
          },
          {
            role: "user",
            content: JSON.stringify(input),
          },
        ],
        text: {
          format: geminiTextFormat(aiThreadSchema, "social_thread_pack", {
            compact: true,
          }),
        },
      },
      { timeout: 28000 },
    );

    if (!res.output_parsed) {
      return NextResponse.json({
        thread: fallback,
        provider: "deterministic",
      });
    }

    const parsed = res.output_parsed;
    const rawItems = [
      {
        role: "Hook (Post #1)" as const,
        body: parsed.hookOptions[0].hookText,
      },
      ...parsed.bodyPosts.map((b) => ({
        role: "Body Insight" as const,
        body: b,
      })),
      { role: "Recap & CTA" as const, body: parsed.recapPost },
    ];

    const total = rawItems.length;
    const posts = rawItems.map((item, idx) => {
      const index = idx + 1;
      const prefix = input.includeNumbering ? `${index}/${total}\n\n` : "";
      const text = `${prefix}${item.body}`;
      return {
        index,
        total,
        role: item.role,
        text,
        charCount: text.length,
        maxChars,
        withinLimit: text.length <= maxChars,
      };
    });

    return NextResponse.json({
      thread: {
        maxCharsPerPost: maxChars,
        hookOptions: parsed.hookOptions,
        posts,
      },
      provider: "ai",
    });
  } catch {
    return NextResponse.json({
      thread: fallback,
      provider: "deterministic",
    });
  }
}
