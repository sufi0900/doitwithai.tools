import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import {
  geminiTextFormat,
  getGeminiClient,
  getGeminiModel,
  isAiConfigured,
} from "@/lib/ai-tools/gemini";
import type {
  InstagramCaptionInput,
  InstagramCaptionOutput,
} from "@/features/instagram-caption-generator/model";

const aiOutputSchema = z.object({
  captions: z.array(
    z.object({
      styleLabel: z.string(),
      aboveTheFoldHook: z.string(),
      fullCaption: z.string(),
      altTextSeo: z.string(),
    })
  ),
  carouselSlides: z.array(
    z.object({
      slideNumber: z.number(),
      headline: z.string(),
      supportingText: z.string(),
      visualPrompt: z.string(),
    })
  ),
  hashtagTiers: z.object({
    broadReach: z.array(z.string()),
    nicheSpecific: z.array(z.string()),
    communitySearch: z.array(z.string()),
  }),
  audioAndReelTip: z.string(),
});

function buildFallbackInstagram(input: InstagramCaptionInput): InstagramCaptionOutput {
  const sentences = input.topicOrContent
    .split(/(?<=[.!?])\s+|\n+/)
    .map((s) => s.trim())
    .filter((s) => s.length > 18);
  const hook =
    sentences[0]?.slice(0, 110) ||
    `Save this before your next ${input.niche} sprint: the 80/20 breakdown nobody talks about.`;
  const s1 = sentences[1]?.slice(0, 110) || "Start with search & audience intent before drafting a single slide.";
  const s2 = sentences[2]?.slice(0, 110) || "Structure your hook so the first 125 characters force a tap on '...more'.";
  const s3 = sentences[3]?.slice(0, 110) || "End with a save-worthy checklist that rewards bookmarks and shares.";

  return {
    captions: [
      {
        styleLabel: "Save-Worthy Micro-Blog Caption",
        aboveTheFoldHook: hook.slice(0, 120),
        fullCaption: `${hook.slice(0, 120)}\n.\nMost creators in ${input.niche} spend 90% of their energy on production and only 10% on packaging.\n\nFlip that ratio with these 3 shifts:\n✨ 01. ${s1}\n✨ 02. ${s2}\n✨ 03. ${s3}\n\n📌 ${input.callToAction || "Save this post for your next content batch & share it with a teammate!"}`,
        altTextSeo: `Educational ${input.niche} infographic guide covering ${hook.slice(0, 70)}`,
      },
      {
        styleLabel: "Punchy Reel / Carousel Hook Caption",
        aboveTheFoldHook: `Stop scrolling if you care about ${input.niche} results in 2026 👇`,
        fullCaption: `Stop scrolling if you care about ${input.niche} results in 2026 👇\n\nHere is the quick cheat code from our latest breakdown:\n• ${s1}\n• ${s2}\n• ${s3}\n\n${input.callToAction || "Drop 'GUIDE' in the comments and bookmark this for later!"}`,
        altTextSeo: `${input.niche} carousel slide deck summarizing key action steps`,
      },
      {
        styleLabel: "Storytelling & Behind-the-Scenes",
        aboveTheFoldHook: `The biggest lesson we learned testing this across ${input.niche}:`,
        fullCaption: `The biggest lesson we learned testing this across ${input.niche}:\n\n"${hook}"\n\nWhen we simplified down to "${s1}", save rates jumped immediately.\n\n${input.callToAction || "Which slide resonated most with you? Let me know below! 💬"}`,
        altTextSeo: `Behind the scenes strategy breakdown for ${input.niche}`,
      },
    ],
    carouselSlides: [
      {
        slideNumber: 1,
        headline: hook.slice(0, 68),
        supportingText: `The complete ${input.niche} cheat sheet (Swipe →)`,
        visualPrompt: "Bold high-contrast cover typography with upward arrow motif",
      },
      {
        slideNumber: 2,
        headline: "The Hidden Bottleneck",
        supportingText: s1,
        visualPrompt: "Comparison split card showing Old Way vs. New Way",
      },
      {
        slideNumber: 3,
        headline: "The Core Framework",
        supportingText: s2,
        visualPrompt: "3-step numbered diagram with clean brand accent highlights",
      },
      {
        slideNumber: 4,
        headline: "Execution Checklist",
        supportingText: s3,
        visualPrompt: "Checklist card with green checkmarks and scannable labels",
      },
      {
        slideNumber: 5,
        headline: "Save & Share This Guide",
        supportingText: input.callToAction || "Bookmark this carousel so you can apply it on your next post!",
        visualPrompt: "Call-to-action footer card with Save, Share, and Comment icons",
      },
    ],
    hashtagTiers: {
      broadReach: ["#ContentStrategy", "#DigitalMarketing", "#CreatorTips", "#SocialMediaGrowth"],
      nicheSpecific: [
        `#${input.niche.replace(/[^a-zA-Z0-9]/g, "") || "SEO"}Strategy`,
        "#OrganicGrowth",
        "#CarouselDesign",
        "#ContentRepurposing",
      ],
      communitySearch: ["#MarketingPlaybook", "#CreatorsOfInstagram", "#GrowthMarketingTips"],
    },
    audioAndReelTip:
      "Keep your first caption line under 125 characters so the curiosity gap appears right before Instagram's '...more' truncation button, and always populate the Custom Alt Text field in Advanced Settings for Instagram Search SEO.",
  };
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as Partial<InstagramCaptionInput>;
    const topicOrContent = (body.topicOrContent || "").trim();
    if (!topicOrContent) {
      return NextResponse.json(
        { error: "Please enter a topic or fetch an article URL first." },
        { status: 400 }
      );
    }

    const input: InstagramCaptionInput = {
      topicOrContent,
      niche: (body.niche || "SEO & Digital Marketing").trim(),
      postFormat: body.postFormat || "carousel-educator",
      callToAction: (body.callToAction || "Save this post for your next content sprint!").trim(),
    };

    const model = getGeminiModel("INSTAGRAM_CAPTION") || getGeminiModel();
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
                  "You are an Instagram growth strategist and carousel designer. Generate 3 Instagram captions, a 5-slide carousel breakdown, tiered hashtags, and Instagram SEO alt text.",
              },
              {
                role: "user",
                content: JSON.stringify({
                  niche: input.niche,
                  postFormat: input.postFormat,
                  callToAction: input.callToAction,
                  topicOrContent: input.topicOrContent.slice(0, 4500),
                }),
              },
            ],
            text: {
              format: geminiTextFormat(aiOutputSchema, "instagram_captions_pack", {
                compact: true,
              }),
            },
          },
          { timeout: 24000 }
        );
        if (res.output_parsed?.captions?.length && res.output_parsed?.carouselSlides?.length) {
          return NextResponse.json(res.output_parsed);
        }
      } catch {
        // Fallback below
      }
    }

    return NextResponse.json(buildFallbackInstagram(input));
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to generate Instagram captions." },
      { status: 500 }
    );
  }
}
