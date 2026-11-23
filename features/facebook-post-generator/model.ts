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
  strategySummary: string;
  variations: FacebookPostVariation[];
  bestPostingTip: string;
}

export const DEFAULT_FACEBOOK_POST_OUTPUT: FacebookPostOutput = {
  strategySummary:
    "Zero-click native Facebook storytelling paired with a 1080×1080 visual takeaway card and a First-Comment Link Box to avoid external link reach throttling.",
  variations: [
    {
      styleName: "Story Lesson + Engagement Question",
      hookLine:
        "We audited 100+ organic Facebook posts and found one mistake killing 60% of reach:",
      fullPostText: `We audited 100+ organic Facebook posts and found one mistake killing 60% of reach:\n\nDropping bare external links inside the main post body.\n\nWhen we switched to a 3-part native workflow, reach and link clicks tripled:\n\n1. Deliver the complete 3-step takeaway natively inside the post body so readers get immediate value.\n2. Attach a high-contrast 1080×1080 visual summary card to stop the scroll and boost dwell time.\n3. Place the full guide URL in the First Comment below the post.\n\nAre you still putting links in the main post body, or have you tested the First-Comment workflow? 👇`,
      firstCommentText:
        "📖 Read the full step-by-step breakdown and grab the templates here → https://doitwithai.tools",
      engagementQuestion:
        "Are you still putting links in the main post body, or have you tested the First-Comment workflow?",
      visualHeadline: "Why Native Zero-Click Posts Triple Organic Reach",
      visualSubtext:
        "1. Share 3 native takeaways in the post • 2. Attach a 1080p visual card • 3. Put the link in Comment #1",
      hashtags: [
        "#ContentMarketing",
        "#SocialMediaStrategy",
        "#OrganicReach",
        "#DigitalMarketing",
      ],
    },
    {
      styleName: "Zero-Click Value Breakdown (1-2-3 List)",
      hookLine:
        "Here is the exact 3-step content repurposing system we use to turn 1 article into 7 days of reach:",
      fullPostText: `Here is the exact 3-step content repurposing system we use to turn 1 article into 7 days of reach:\n\n✅ Step 1: Slice every H2 heading into a standalone sub-topic angle instead of sharing the generic article title.\n✅ Step 2: Pair each post with a clean visual framework or checklist card.\n✅ Step 3: Ask a low-friction A/B question at the end to spark early comment velocity.\n\nWhich of these 3 steps would save your team the most time this week?`,
      firstCommentText:
        "⚡ Try the free AI Content Repurposing Studio here → https://doitwithai.tools",
      engagementQuestion:
        "Which of these 3 steps would save your team the most time this week?",
      visualHeadline: "The 3-Step Content Repurposing System",
      visualSubtext:
        "Slice H2 sub-topics • Attach a visual summary card • Spark comment velocity",
      hashtags: [
        "#CreatorEconomy",
        "#BloggingTips",
        "#GrowthStrategy",
        "#MarketingTools",
      ],
    },
    {
      styleName: "A vs. B Community Debate",
      hookLine:
        "Unpopular opinion: Publishing 1 deep-dive guide per week beats publishing 5 unedited AI articles every single time.",
      fullPostText: `Unpopular opinion: Publishing 1 deep-dive guide per week beats publishing 5 unedited AI articles every single time.\n\nWhy? Because distribution compounds authority:\n• Option A: Publish 5 thin posts that nobody bookmarks or shares.\n• Option B: Publish 1 authoritative pillar guide and repurpose it into native social stories, carousels, and visual cards.\n\nWhere do you stand—Team Volume (A) or Team Repurposed Depth (B)? Drop your vote below! 👇`,
      firstCommentText:
        "🔗 Full benchmark study and free visual tools → https://doitwithai.tools",
      engagementQuestion:
        "Where do you stand—Team Volume (A) or Team Repurposed Depth (B)?",
      visualHeadline: "1 Repurposed Pillar Guide > 5 Thin Posts",
      visualSubtext:
        "Distribution + Visual Packaging = 3x Higher Bookmark Saves & Organic Reach",
      hashtags: [
        "#SEOStrategy",
        "#ContentCreation",
        "#FounderLessons",
        "#SocialMediaTips",
      ],
    },
  ],
  bestPostingTip:
    "Publish your main post with the downloaded 1080×1080 visual card attached, then immediately paste the First Comment text within 30 seconds.",
};
