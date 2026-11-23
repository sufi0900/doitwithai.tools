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
  buildDeterministicOmnichannelPack,
  type OmnichannelMarketingInput,
} from "@/features/omnichannel-marketing-agent/model";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

const inputSchema = z.object({
  sourceUrl: z.string().trim().max(2048).default(""),
  articleOrToolTitle: z.string().trim().min(3).max(180),
  coreTakeawaysOrSummary: z.string().trim().max(3000).default(""),
  targetAudiencePersona: z.string().trim().max(200).default(""),
  targetSubredditOrCommunity: z.string().trim().max(120).default("r/SEO"),
  campaignGoal: z
    .enum([
      "Drive Organic Traffic to Guide / Blog Post",
      "Launch Free Interactive AI / SEO Tool",
      "Build Founder Thought Leadership & E-E-A-T",
      "Grow Newsletter Subscribers & Lead Magnet",
    ])
    .default("Drive Organic Traffic to Guide / Blog Post"),
  founderOrBrandSignoff: z
    .string()
    .trim()
    .max(160)
    .default("Sufian Mustafa · Founder at DoItWithAI.tools"),
});

const aiOmnichannelSchema = z.object({
  linkedinPost: z.object({
    hookLine: z.string().min(20).max(220),
    fullPostText: z.string().min(120).max(1800),
    carouselSlides: z.array(z.string().min(15).max(180)).min(5).max(7),
  }),
  twitterThread: z.array(z.string().min(30).max(280)).min(4).max(6),
  redditCommunityAnswer: z.object({
    targetSubreddit: z.string().min(2).max(80),
    sampleQuestionMatched: z.string().min(15).max(200),
    valueFirstReplyMarkdown: z.string().min(120).max(1400),
    antiSpamSafetyNote: z.string().min(20).max(260),
  }),
  newsletterEdition: z.object({
    subjectLines: z.array(z.string().min(10).max(95)).min(3).max(3),
    previewText: z.string().min(20).max(140),
    bodyMarkdown: z.string().min(120).max(1600),
  }),
});

export async function POST(request: NextRequest) {
  let input: OmnichannelMarketingInput;
  try {
    input = inputSchema.parse(await readBoundedJson(request, 120_000));
  } catch (error) {
    return NextResponse.json(
      {
        error: {
          message:
            error instanceof BodyError
              ? error.message
              : "Provide an article/tool title and optional takeaways to run the Omni-Channel Marketing Agent.",
        },
      },
      { status: 422 },
    );
  }

  const fallback = buildDeterministicOmnichannelPack(input);
  const model = getGeminiModel("OMNICHANNEL_AGENT") || getGeminiModel();
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
        max_output_tokens: 3000,
        store: false,
        input: [
          {
            role: "system",
            content:
              "You are an Autonomous White-Hat Omni-Channel Content Repurposing & Digital Marketing Agent. Transform the user's article/tool URL and key takeaways into 4 synchronized, spam-safe distribution assets: (1) a LinkedIn thought-leadership post + 6-slide carousel outline, (2) a 5-post X/Twitter thread, (3) a value-first, non-spammy Reddit community answer tailored to the target subreddit, and (4) an email newsletter edition with 3 subject lines.",
          },
          {
            role: "user",
            content: JSON.stringify(input),
          },
        ],
        text: {
          format: geminiTextFormat(
            aiOmnichannelSchema,
            "omnichannel_marketing_pack",
            { compact: true },
          ),
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
    const compiledCampaignBundleMarkdown = [
      `# Omni-Channel Safe Marketing Campaign: ${input.articleOrToolTitle}`,
      `**Source URL:** ${input.sourceUrl || "https://doitwithai.tools"}`,
      `**Campaign Goal:** ${input.campaignGoal}`,
      ``,
      `---`,
      `## 1. LinkedIn Thought-Leadership Post`,
      p.linkedinPost.fullPostText,
      ``,
      `### LinkedIn Carousel Outline`,
      ...p.linkedinPost.carouselSlides.map((s) => `- ${s}`),
      ``,
      `---`,
      `## 2. X / Twitter Thread`,
      ...p.twitterThread.map((t) => `${t}\n`),
      `---`,
      `## 3. Reddit Value-First Community Reply (${p.redditCommunityAnswer.targetSubreddit})`,
      p.redditCommunityAnswer.valueFirstReplyMarkdown,
      ``,
      `---`,
      `## 4. Email Newsletter Edition`,
      `**Subject Line Options:**`,
      ...p.newsletterEdition.subjectLines.map((s) => `- ${s}`),
      ``,
      p.newsletterEdition.bodyMarkdown,
    ].join("\n");

    return NextResponse.json({
      pack: {
        ...p,
        compiledCampaignBundleMarkdown,
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
