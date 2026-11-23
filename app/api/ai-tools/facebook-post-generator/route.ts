import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import {
  geminiTextFormat,
  getGeminiClient,
  getGeminiModel,
  isAiConfigured,
} from "@/lib/ai-tools/gemini";
import type {
  FacebookPostInput,
  FacebookPostOutput,
} from "@/features/facebook-post-generator/model";

const aiOutputSchema = z.object({
  strategySummary: z.string(),
  variations: z.array(
    z.object({
      styleName: z.string(),
      hookLine: z.string(),
      fullPostText: z.string(),
      firstCommentText: z.string(),
      engagementQuestion: z.string(),
      visualHeadline: z.string(),
      visualSubtext: z.string(),
      hashtags: z.array(z.string()),
    })
  ),
  bestPostingTip: z.string(),
});

function buildFallbackFacebookPosts(input: FacebookPostInput): FacebookPostOutput {
  const sentences = input.topicOrContent
    .split(/(?<=[.!?])\s+|\n+/)
    .map((s) => s.trim())
    .filter((s) => s.length > 20);
  const coreHook =
    sentences[0]?.slice(0, 110) ||
    `Why most ${input.targetAudience} overlook the simplest lever in their workflow`;
  const point1 = sentences[1]?.slice(0, 120) || "Focus on high-intent fundamentals before scaling volume.";
  const point2 = sentences[2]?.slice(0, 120) || "Turn every long-form asset into native, zero-click social value.";
  const point3 = sentences[3]?.slice(0, 120) || "Keep external links in the first comment to protect organic reach.";
  const linkUrl = input.destinationUrl?.trim() || "https://doitwithai.tools";

  return {
    strategySummary: `Optimized for Facebook's zero-click feed algorithm for ${input.targetAudience} using a ${input.brandTone} tone—delivering standalone value in the main post and moving external URLs to the First Comment to prevent reach throttling.`,
    variations: [
      {
        styleName: "Zero-Click Value Breakdown + First-Comment Link",
        hookLine: `Unpopular truth for ${input.targetAudience}: ${coreHook}`,
        fullPostText: `Unpopular truth for ${input.targetAudience}:\n${coreHook}\n\nHere are the 3 biggest takeaways we uncovered after breaking this down:\n\n1️⃣ ${point1}\n\n2️⃣ ${point2}\n\n3️⃣ ${point3}\n\nYou don't need 10 more complicated tools—you just need a repeatable system you can execute in 15 minutes a day.\n\n👇 Which of these 3 points hits closest to home for your current workflow? Drop a 1, 2, or 3 below (and grab the full breakdown link in the first comment!).`,
        firstCommentText: `🔗 Full resource & step-by-step guide mentioned above: ${linkUrl}`,
        engagementQuestion: "Which of these 3 points hits closest to home for your current workflow? Drop a 1, 2, or 3 below!",
        visualHeadline: coreHook.slice(0, 85),
        visualSubtext: `1. ${point1.slice(0, 65)}\n2. ${point2.slice(0, 65)}`,
        hashtags: ["#DigitalStrategy", "#ContentMarketing", "#GrowthTips", "#CreatorEconomy"],
      },
      {
        styleName: "Story-Driven Lesson & Community Discussion",
        hookLine: `I used to overcomplicate this every single week until we changed one rule.`,
        fullPostText: `I used to overcomplicate this every single week until we changed one rule.\n\nWhenever working with ${input.targetAudience}, the biggest bottleneck usually isn't ideas—it's formatting and distribution:\n"${coreHook}"\n\nOnce we shifted our focus to:\n✅ ${point1}\n✅ ${point2}\n\nEverything got faster and engagement doubled without extra ad spend.\n\nHow are you currently handling this in your day-to-day? Would love to hear what's working for you right now! 💬`,
        firstCommentText: `📌 Pinned resource for anyone who wants to test this workflow: ${linkUrl}`,
        engagementQuestion: "How are you currently handling this in your day-to-day?",
        visualHeadline: "Stop Overcomplicating Your Workflow",
        visualSubtext: point1,
        hashtags: ["#BusinessGrowth", "#MarketingStrategy", "#Productivity", "#SocialMediaTips"],
      },
      {
        styleName: "Quick Poll / Debate Starter",
        hookLine: `Quick question for ${input.targetAudience}: If you could only keep ONE priority this quarter, which wins?`,
        fullPostText: `Quick question for ${input.targetAudience} 👇\n\nWhen it comes to "${coreHook.slice(0, 80)}":\n\n🅰️ Doubling down on ${point1.slice(0, 75)}\n🅱️ Focusing entirely on ${point2.slice(0, 75)}\n\nVote A or B in the comments and tell me why!`,
        firstCommentText: `Full comparison & deep-dive article here: ${linkUrl}`,
        engagementQuestion: "Vote A or B in the comments and tell me why!",
        visualHeadline: "Team A vs. Team B: Which Wins?",
        visualSubtext: `A: ${point1.slice(0, 65)} | B: ${point2.slice(0, 65)}`,
        hashtags: ["#CommunityPoll", "#MarketingDebate", "#Strategy"],
      },
    ],
    bestPostingTip:
      "Attach the 1:1 Square (1080×1080) or 4:5 Portrait visual graphic below directly to your Facebook post, and paste your external article link in the First Comment within 30 seconds of publishing.",
  };
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as Partial<FacebookPostInput>;
    const topicOrContent = (body.topicOrContent || "").trim();
    if (!topicOrContent) {
      return NextResponse.json(
        { error: "Please enter a topic or fetch an article URL first." },
        { status: 400 }
      );
    }

    const input: FacebookPostInput = {
      topicOrContent,
      targetAudience: (body.targetAudience || "Marketers, Creators & Founders").trim(),
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
                  "You are an expert Facebook organic growth strategist. Create 3 high-engagement zero-click Facebook post variations with First-Comment link snippets and companion visual card copy.",
              },
              {
                role: "user",
                content: JSON.stringify({
                  targetAudience: input.targetAudience,
                  postFormat: input.postFormat,
                  brandTone: input.brandTone,
                  destinationUrl: input.destinationUrl || "https://doitwithai.tools",
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
          { timeout: 24000 }
        );
        if (res.output_parsed?.variations?.length) {
          return NextResponse.json(res.output_parsed);
        }
      } catch {
        // Fallback below
      }
    }

    return NextResponse.json(buildFallbackFacebookPosts(input));
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to generate Facebook posts." },
      { status: 500 }
    );
  }
}
