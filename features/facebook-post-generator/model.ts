export type FacebookPostFormat =
  | "story-engagement"
  | "value-listicle"
  | "community-debate"
  | "promo-first-comment";

export interface FacebookPostInput {
  topicOrContent: string;
  targetAudience: string;
  postFormat: FacebookPostFormat;
  destinationUrl?: string;
  brandTone: string;
}

export interface FacebookPostVariation {
  styleName: string;
  hookLine: string;
  fullPostText: string;
  firstCommentText: string;
  engagementQuestion: string;
  visualHeadline: string;
  visualSubtext: string;
  hashtags: string[];
}

export interface FacebookPostOutput {
  provider?: "ai" | "deterministic";
  strategySummary: string;
  variations: FacebookPostVariation[];
  bestPostingTip: string;
}

export function buildFallbackFacebookPosts(
  input: FacebookPostInput,
): FacebookPostOutput {
  const sentences = input.topicOrContent
    .split(/(?<=[.!?])\s+|\n+/)
    .map((s) => s.trim())
    .filter((s) => s.length > 20);
  const coreHook =
    sentences[0]?.slice(0, 110) ||
    `Why most ${input.targetAudience} overlook the simplest lever in their workflow`;
  const point1 =
    sentences[1]?.slice(0, 120) ||
    "Focus on high-intent fundamentals before scaling volume.";
  const point2 =
    sentences[2]?.slice(0, 120) ||
    "Turn every long-form asset into native, zero-click social value.";
  const point3 =
    sentences[3]?.slice(0, 120) ||
    "Invite a useful discussion and make the source easy to find.";
  const linkUrl = input.destinationUrl?.trim() || "";

  const output: FacebookPostOutput = {
    provider: "deterministic",
    strategySummary: `Three editable, source-based Facebook drafts for ${input.targetAudience}, with a ${input.brandTone} tone. Review the wording and source details before publishing.`,
    variations: [
      {
        styleName: "Zero-Click Value Breakdown + First-Comment Link",
        hookLine: `Unpopular truth for ${input.targetAudience}: ${coreHook}`,
        fullPostText: `Unpopular truth for ${input.targetAudience}:\n${coreHook}\n\nHere are 3 ideas to consider from this topic:\n\n1️⃣ ${point1}\n\n2️⃣ ${point2}\n\n3️⃣ ${point3}\n\nChoose one action to try, then review the result before changing your wider workflow.\n\n👇 Which of these 3 points hits closest to home for your current workflow? Drop a 1, 2, or 3 below.`,
        firstCommentText: linkUrl ? `🔗 Full resource: ${linkUrl}` : "",
        engagementQuestion:
          "Which of these 3 points hits closest to home for your current workflow? Drop a 1, 2, or 3 below!",
        visualHeadline: coreHook.slice(0, 85),
        visualSubtext: `1. ${point1.slice(0, 65)}\n2. ${point2.slice(0, 65)}`,
        hashtags: [
          "#DigitalStrategy",
          "#ContentMarketing",
          "#GrowthTips",
          "#CreatorEconomy",
        ],
      },
      {
        styleName: "Story-Driven Lesson & Community Discussion",
        hookLine: `A useful workflow starts with one clear takeaway.`,
        fullPostText: `A useful workflow starts with one clear takeaway.\n\nFor ${input.targetAudience}, here is one idea to explore:\n"${coreHook}"\n\nTwo practical steps to consider:\n✅ ${point1}\n✅ ${point2}\n\nTry one step in your own workflow and check whether it helps your audience.\n\nHow are you currently handling this in your day-to-day? Would love to hear what's working for you right now! 💬`,
        firstCommentText: linkUrl ? `📌 Explore the source: ${linkUrl}` : "",
        engagementQuestion:
          "How are you currently handling this in your day-to-day?",
        visualHeadline: "Stop Overcomplicating Your Workflow",
        visualSubtext: point1,
        hashtags: [
          "#BusinessGrowth",
          "#MarketingStrategy",
          "#Productivity",
          "#SocialMediaTips",
        ],
      },
      {
        styleName: "Quick Poll / Debate Starter",
        hookLine: `Quick question for ${input.targetAudience}: If you could only keep ONE priority this quarter, which wins?`,
        fullPostText: `Quick question for ${input.targetAudience} 👇\n\nWhen it comes to "${coreHook.slice(0, 80)}":\n\n🅰️ Doubling down on ${point1.slice(0, 75)}\n🅱️ Focusing entirely on ${point2.slice(0, 75)}\n\nVote A or B in the comments and tell me why!`,
        firstCommentText: linkUrl ? `Read the full article: ${linkUrl}` : "",
        engagementQuestion: "Vote A or B in the comments and tell me why!",
        visualHeadline: "Team A vs. Team B: Which Wins?",
        visualSubtext: `A: ${point1.slice(0, 65)} | B: ${point2.slice(0, 65)}`,
        hashtags: ["#CommunityPoll", "#MarketingDebate", "#Strategy"],
      },
    ],
    bestPostingTip:
      "Preview the post and image together. Check readability on mobile, verify any claims, and decide where the source link is most useful. Link placement does not guarantee reach.",
  };
  const preferred =
    input.postFormat === "community-debate"
      ? 2
      : input.postFormat === "story-engagement"
        ? 1
        : 0;
  output.variations = [
    output.variations[preferred],
    ...output.variations.filter((_, index) => index !== preferred),
  ];
  return output;
}

export const DEFAULT_FACEBOOK_POST_OUTPUT = buildFallbackFacebookPosts({
  topicOrContent:
    "Turn an article into a useful Facebook post. Choose one takeaway and explain it in plain language. Add a practical next step readers can try. Pair the post with a relevant article image or a simple visual card.",
  targetAudience: "Digital Marketers, Creators & Founders",
  postFormat: "story-engagement",
  destinationUrl: "https://doitwithai.tools",
  brandTone: "Conversational, Warm & High-Value",
});
