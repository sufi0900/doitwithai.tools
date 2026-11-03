import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import {
  geminiTextFormat,
  getGeminiClient,
  getGeminiModel,
  isAiConfigured,
} from "@/lib/ai-tools/gemini";
import {
  buildFallbackFacebookPosts,
  type FacebookPostInput,
} from "@/features/facebook-post-generator/model";

const aiOutputSchema = z.object({
  strategySummary: z.string(),
  variations: z
    .array(
      z.object({
        styleName: z.string(),
        hookLine: z.string(),
        fullPostText: z.string(),
        firstCommentText: z.string(),
        engagementQuestion: z.string(),
        visualHeadline: z.string(),
        visualSubtext: z.string(),
        hashtags: z.array(z.string()),
      }),
    )
    .length(3),
  bestPostingTip: z.string(),
});

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as Partial<FacebookPostInput>;
    const topicOrContent = (body.topicOrContent || "").trim();
    if (!topicOrContent) {
      return NextResponse.json(
        { error: "Please enter a topic or fetch an article URL first." },
        { status: 400 },
      );
    }

    const input: FacebookPostInput = {
      topicOrContent,
      targetAudience: (
        body.targetAudience || "Marketers, Creators & Founders"
      ).trim(),
      postFormat: body.postFormat || "story-engagement",
      destinationUrl: (body.destinationUrl || "").trim(),
      brandTone: (body.brandTone || "Conversational & High-Value").trim(),
    };

    const model = getGeminiModel("FACEBOOK_POST") || getGeminiModel();
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
                  "You are an expert Facebook organic growth strategist. Create exactly 3 Facebook post variations with optional first-comment link snippets and companion visual card copy. Follow the requested post format and tone. Use only supplied facts; never invent tests, first-person experience, metrics or guaranteed reach. If no destination URL is supplied, leave firstCommentText empty.",
              },
              {
                role: "user",
                content: JSON.stringify({
                  targetAudience: input.targetAudience,
                  postFormat: input.postFormat,
                  brandTone: input.brandTone,
                  destinationUrl: input.destinationUrl || "",
                  topicOrContent: input.topicOrContent.slice(0, 4500),
                }),
              },
            ],
            text: {
              format: geminiTextFormat(aiOutputSchema, "facebook_posts_pack", {
                compact: true,
              }),
            },
          },
          { timeout: 24000 },
        );
        if (res.output_parsed?.variations?.length) {
          return NextResponse.json({ ...res.output_parsed, provider: "ai" });
        }
      } catch {
        // Fallback below
      }
    }

    return NextResponse.json(buildFallbackFacebookPosts(input));
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Failed to generate Facebook posts.",
      },
      { status: 500 },
    );
  }
}
