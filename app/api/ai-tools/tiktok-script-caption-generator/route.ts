import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import {
  geminiTextFormat,
  getGeminiClient,
  getGeminiModel,
  isAiConfigured,
} from "@/lib/ai-tools/gemini";
import type {
  TiktokScriptInput,
  TiktokScriptOutput,
} from "@/features/tiktok-script-caption-generator/model";

const aiOutputSchema = z.object({
  scrollStoppingHooks: z.array(
    z.object({
      style: z.string(),
      verbalHook: z.string(),
      visualAction: z.string(),
    })
  ),
  scriptBeats: z.array(
    z.object({
      timeRange: z.string(),
      beatLabel: z.string(),
      visualDirection: z.string(),
      onScreenText: z.string(),
      spokenAudio: z.string(),
    })
  ),
  tiktokSeoCaption: z.string(),
  searchKeywords: z.array(z.string()),
  hashtags: z.array(z.string()),
  thumbnailCoverText: z.string(),
});

function buildFallbackTiktok(input: TiktokScriptInput): TiktokScriptOutput {
  const sentences = input.topicOrContent
    .split(/(?<=[.!?])\s+|\n+/)
    .map((s) => s.trim())
    .filter((s) => s.length > 18);
  const coreClaim =
    sentences[0]?.slice(0, 100) ||
    `Why 90% of people in ${input.niche} get this backwards`;
  const step1 = sentences[1]?.slice(0, 110) || "Start by pulling the highest-intent sub-topic instead of summarizing everything.";
  const step2 = sentences[2]?.slice(0, 110) || "Show the proof on-screen within the first 3 seconds so viewers don't swipe.";
  const step3 = sentences[3]?.slice(0, 110) || "Put your primary search keyword in both on-screen text and caption for TikTok SEO.";

  return {
    scrollStoppingHooks: [
      {
        style: "Pattern-Interrupt Visual Hook",
        verbalHook: `Stop doing ${input.niche} the slow way—look at what happens when you flip this one step.`,
        visualAction: "Point at green-screen headline behind you while zooming in 1.2x on beat 1.",
      },
      {
        style: "Curiosity Gap / Secret Breakdown",
        verbalHook: `Here is the 30-second cheat sheet from this article so you don't have to read 2,000 words.`,
        visualAction: "Hold up phone/screen showing the source article, then cut to 3 bold on-screen fingers.",
      },
      {
        style: "Contrarian Myth-Buster",
        verbalHook: `Everyone in ${input.niche} tells you to do more volume—here's why that's costing you reach.`,
        visualAction: "Shake head at common advice text bubble, then tap the real metric on screen.",
      },
    ],
    scriptBeats: [
      {
        timeRange: "0:00 – 0:03",
        beatLabel: "Scroll-Stopping Hook",
        visualDirection: "Face to camera with green-screen screenshot of the article headline.",
        onScreenText: coreClaim.slice(0, 58),
        spokenAudio: `Here is the 30-second breakdown of "${coreClaim.slice(0, 75)}" so you can apply it today.`,
      },
      {
        timeRange: "0:03 – 0:10",
        beatLabel: "The Core Problem",
        visualDirection: "Quick jump cut + highlight the first key section on screen.",
        onScreenText: "Step 1: Fix the bottleneck",
        spokenAudio: `First: ${step1}`,
      },
      {
        timeRange: "0:10 – 0:20",
        beatLabel: "The Actionable Shift",
        visualDirection: "Switch angle slightly or point to bullet #2 pop-up graphic.",
        onScreenText: "Step 2: High-retention execution",
        spokenAudio: `Second: ${step2}`,
      },
      {
        timeRange: "0:20 – 0:27",
        beatLabel: "The Multiplier",
        visualDirection: "Show final takeaway card on screen.",
        onScreenText: "Step 3: Compound the result",
        spokenAudio: `And third: ${step3}`,
      },
      {
        timeRange: "0:27 – 0:30",
        beatLabel: "Looping Call-To-Action",
        visualDirection: "Point down toward the Save icon on the right side of the TikTok UI.",
        onScreenText: "Save this for your next post 📌",
        spokenAudio: "Hit save so you don't lose this checklist, and follow for part two.",
      },
    ],
    tiktokSeoCaption: `${coreClaim.slice(0, 90)} — Full ${input.niche} breakdown in ${input.durationSeconds} seconds: 1) ${step1.slice(0, 65)} 2) ${step2.slice(0, 65)} 3) ${step3.slice(0, 65)}. Save this for later!`,
    searchKeywords: [
      `${input.niche.toLowerCase()} tutorial`,
      `how to improve ${input.niche.toLowerCase()}`,
      `${input.niche.toLowerCase()} tips 2026`,
      `${input.niche.toLowerCase()} step by step`,
    ],
    hashtags: [
      `#${input.niche.replace(/[^a-zA-Z0-9]/g, "") || "Marketing"}Tok`,
      "#LearnOnTikTok",
      "#CreatorStrategy",
      "#DigitalMarketingTips",
      "#ContentHacks",
    ],
    thumbnailCoverText: `${input.niche.slice(0, 18)} Cheat Sheet`,
  };
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as Partial<TiktokScriptInput>;
    const topicOrContent = (body.topicOrContent || "").trim();
    if (!topicOrContent) {
      return NextResponse.json(
        { error: "Please enter a topic or fetch an article/video URL first." },
        { status: 400 }
      );
    }

    const input: TiktokScriptInput = {
      topicOrContent,
      niche: (body.niche || "SEO & Content Marketing").trim(),
      videoStyle: body.videoStyle || "greenscreen-breakdown",
      durationSeconds: body.durationSeconds || "30",
    };

    const model = getGeminiModel("TIKTOK_SCRIPT") || getGeminiModel();
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
                  "You are a viral TikTok & Reels scriptwriter and TikTok Search SEO specialist. Turn the content into a timestamped TikTok script with 3-second hooks and TikTok Search SEO captions.",
              },
              {
                role: "user",
                content: JSON.stringify({
                  niche: input.niche,
                  videoStyle: input.videoStyle,
                  durationSeconds: input.durationSeconds,
                  topicOrContent: input.topicOrContent.slice(0, 4500),
                }),
              },
            ],
            text: {
              format: geminiTextFormat(aiOutputSchema, "tiktok_script_pack", {
                compact: true,
              }),
            },
          },
          { timeout: 24000 }
        );
        if (res.output_parsed?.scriptBeats?.length && res.output_parsed?.scrollStoppingHooks?.length) {
          return NextResponse.json(res.output_parsed);
        }
      } catch {
        // Fallback below
      }
    }

    return NextResponse.json(buildFallbackTiktok(input));
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to generate TikTok script." },
      { status: 500 }
    );
  }
}
