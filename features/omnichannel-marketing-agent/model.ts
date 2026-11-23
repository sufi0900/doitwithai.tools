export type MarketingCampaignGoal =
  | "Drive Organic Traffic to Guide / Blog Post"
  | "Launch Free Interactive AI / SEO Tool"
  | "Build Founder Thought Leadership & E-E-A-T"
  | "Grow Newsletter Subscribers & Lead Magnet";

export type OmnichannelMarketingInput = {
  sourceUrl: string;
  articleOrToolTitle: string;
  coreTakeawaysOrSummary: string;
  targetAudiencePersona: string;
  targetSubredditOrCommunity: string;
  campaignGoal: MarketingCampaignGoal;
  founderOrBrandSignoff: string;
};

export type OmnichannelMarketingPack = {
  linkedinPost: {
    hookLine: string;
    fullPostText: string;
    carouselSlides: string[];
  };
  twitterThread: string[];
  redditCommunityAnswer: {
    targetSubreddit: string;
    sampleQuestionMatched: string;
    valueFirstReplyMarkdown: string;
    antiSpamSafetyNote: string;
  };
  newsletterEdition: {
    subjectLines: string[];
    previewText: string;
    bodyMarkdown: string;
  };
  compiledCampaignBundleMarkdown: string;
};

export const DEFAULT_OMNICHANNEL_INPUT: OmnichannelMarketingInput = {
  sourceUrl: "https://doitwithai.tools/ai-seo/write-slug-urls",
  articleOrToolTitle: "Choose Clear URL Slugs with AI and Keep Published Links Stable",
  coreTakeawaysOrSummary:
    "1. A URL slug is the final readable identifier in a page's path.\n2. Google recommends readable words separated by hyphens—no arbitrary 3-to-5 word rule exists.\n3. Never change an already-published, indexed URL slug without a 301 redirect and canonical migration plan.",
  targetAudiencePersona: "SEO specialists, content writers, and solo website owners",
  targetSubredditOrCommunity: "r/SEO & r/bigseo",
  campaignGoal: "Drive Organic Traffic to Guide / Blog Post",
  founderOrBrandSignoff: "Sufian Mustafa · Founder at DoItWithAI.tools",
};

export function buildDeterministicOmnichannelPack(
  input: OmnichannelMarketingInput,
): OmnichannelMarketingPack {
  const title =
    input.articleOrToolTitle.trim() ||
    "Practical AI SEO & Content Workflow Guide";
  const url =
    input.sourceUrl.trim() && /^https?:\/\//i.test(input.sourceUrl.trim())
      ? input.sourceUrl.trim()
      : "https://doitwithai.tools";
  const audience =
    input.targetAudiencePersona.trim() || "marketers and site owners";
  const subreddit = input.targetSubredditOrCommunity.trim() || "r/SEO";
  const signoff =
    input.founderOrBrandSignoff.trim() ||
    "Sufian Mustafa · DoItWithAI.tools";

  const takeawayLines = input.coreTakeawaysOrSummary
    .split(/\r?\n/)
    .map((l) => l.replace(/^[-*•\d.)\s]+/, "").trim())
    .filter(Boolean);

  const t1 =
    takeawayLines[0] ||
    "Focus on clarity and reader intent before touching technical edge cases.";
  const t2 =
    takeawayLines[1] ||
    "Pair fast AI drafting with human verification checklists.";
  const t3 =
    takeawayLines[2] ||
    "Protect existing organic equity before deploying structural changes.";

  const hookLine = `Most ${audience} overcomplicate "${title}"—and end up hurting their existing rankings.`;

  const linkedinFullText = [
    hookLine,
    ``,
    `Here is the exact 3-step framework we use to get it right every time (without guesswork):`,
    ``,
    `1️⃣ ${t1}`,
    `2️⃣ ${t2}`,
    `3️⃣ ${t3}`,
    ``,
    `💡 The golden rule: AI can generate 10 options in 5 seconds, but your human judgment decides which option actually serves the reader.`,
    ``,
    `I put together a complete, step-by-step breakdown + free interactive tool so you can test this on your own pages today:`,
    `👉 ${url}`,
    ``,
    `How is your team handling this workflow right now? Let me know in the comments 👇`,
    ``,
    `#SEO #ContentMarketing #AISearch #DigitalMarketing #TechnicalSEO`,
  ].join("\n");

  const carouselSlides = [
    `Slide 1 (Cover): ${title} — A Practical Playbook for ${audience}`,
    `Slide 2 (The Problem): Why generic AI advice fails in real-world publishing`,
    `Slide 3 (Rule #1): ${t1}`,
    `Slide 4 (Rule #2): ${t2}`,
    `Slide 5 (Rule #3): ${t3}`,
    `Slide 6 (CTA): Try the free interactive workflow at ${url} (${signoff})`,
  ];

  const twitterThread = [
    `1/ ${hookLine}\n\nHere is the no-fluff playbook for ${audience} 🧵👇`,
    `2/ Principle #1:\n\n${t1}\n\nStop chasing arbitrary checklist scores and optimize for real human clarity first.`,
    `3/ Principle #2:\n\n${t2}\n\nUse AI to compare options rapidly, then apply practitioner review before shipping.`,
    `4/ Principle #3:\n\n${t3}\n\nStability and verification beat constant unmeasured tweaking every single time.`,
    `5/ Want the full step-by-step guide + free interactive tool?\n\nRead & test it free here:\n${url}\n\n— ${signoff}`,
  ];

  const redditCommunityAnswer = {
    targetSubreddit: subreddit,
    sampleQuestionMatched: `"What is the safest workflow for ${title.toLowerCase()} without losing traffic?"`,
    valueFirstReplyMarkdown: [
      `Great question—this trips up a lot of folks because standard SEO plugins often give overly rigid rules.`,
      ``,
      `From our own testing across dozens of content and tool pages, here is what actually matters:`,
      ``,
      `- **Start with the fundamentals:** ${t1}`,
      `- **Don't blindly follow score meters:** ${t2}`,
      `- **Protect your live URLs:** ${t3}`,
      ``,
      `If you want to see side-by-side examples (or run a quick check on your draft), we wrote a free, no-signup breakdown over at [${title}](${url}). Hope that helps!`,
    ].join("\n"),
    antiSpamSafetyNote:
      "90% standalone educational value in the comment body + 1 contextual link at the end. Safe for manual posting in moderated subreddits.",
  };

  const newsletterEdition = {
    subjectLines: [
      `The 3-step fix for ${title}`,
      `Stop making this mistake with ${title.slice(0, 38)}...`,
      `[New Guide + Tool] How we approach ${title}`,
    ],
    previewText: `Practical examples, verification checks, and a free tool for ${audience}.`,
    bodyMarkdown: [
      `Hi there,`,
      ``,
      `When working with ${audience}, one question comes up almost every week: **how do we handle "${title}" efficiently with AI without sacrificing quality?**`,
      ``,
      `### 3 Takeaways You Can Apply Today`,
      `- **1.** ${t1}`,
      `- **2.** ${t2}`,
      `- **3.** ${t3}`,
      ``,
      `### Put It Into Practice`,
      `We just published the full walkthrough—complete with copy-paste prompts and a free interactive checker:`,
      ``,
      `👉 **[Explore the Full Guide & Free Tool Here](${url})**`,
      ``,
      `Best,`,
      `**${signoff}**`,
    ].join("\n"),
  };

  const compiledCampaignBundleMarkdown = [
    `# Omni-Channel Safe Marketing Campaign: ${title}`,
    `**Source URL:** ${url}`,
    `**Campaign Goal:** ${input.campaignGoal}`,
    ``,
    `---`,
    `## 1. LinkedIn Thought-Leadership Post`,
    linkedinFullText,
    ``,
    `### LinkedIn 6-Slide Carousel Outline`,
    ...carouselSlides.map((s) => `- ${s}`),
    ``,
    `---`,
    `## 2. X / Twitter 5-Post Thread`,
    ...twitterThread.map((t) => `${t}\n`),
    `---`,
    `## 3. Reddit Value-First Community Reply (${subreddit})`,
    redditCommunityAnswer.valueFirstReplyMarkdown,
    ``,
    `---`,
    `## 4. Email Newsletter Edition`,
    `**Subject Line Options:**`,
    ...newsletterEdition.subjectLines.map((s) => `- ${s}`),
    ``,
    newsletterEdition.bodyMarkdown,
  ].join("\n");

  return {
    linkedinPost: {
      hookLine,
      fullPostText: linkedinFullText,
      carouselSlides,
    },
    twitterThread,
    redditCommunityAnswer,
    newsletterEdition,
    compiledCampaignBundleMarkdown,
  };
}
