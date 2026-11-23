export type MarketingCampaignAgentInput = {
  campaignNameOrProductLaunch: string;
  destinationLandingPageUrl: string;
  coreValuePropsAndTakeaways: string;
  targetAudienceSegment: string;
  teamWeeklyHoursCapacity: number;
  paidTrafficBudget: string;
};

export type SprintTaskItem = {
  dayOrPhase: string;
  ownerRole: string;
  deliverable: string;
  estimatedHours: number;
};

export type AdCopyAngleItem = {
  angleName: string;
  channel: "Meta / Instagram Ads" | "LinkedIn Sponsored Content" | "Google Search / Performance Max";
  headline: string;
  primaryText: string;
  trafficAnalysisHypothesis: string;
};

export type UtmLinkItem = {
  channelName: string;
  utmSource: string;
  utmMedium: string;
  utmCampaign: string;
  fullTrackedUrl: string;
};

export type MarketingCampaignAgentPack = {
  capacityAndSprintPlan: {
    totalEstimatedHours: number;
    capacityStatus: string;
    tasks: SprintTaskItem[];
  };
  linkedinAndCarouselPack: {
    linkedinPost: string;
    carouselSlides: string[];
  };
  twitterThreadAndVideoScript: {
    twitterThread: string[];
    shortFormVideoScript60s: string;
  };
  paidTrafficAdAngles: AdCopyAngleItem[];
  utmTrackingMatrix: UtmLinkItem[];
  compiledCampaignMarkdown: string;
};

export const DEFAULT_MARKETING_CAMPAIGN_INPUT: MarketingCampaignAgentInput = {
  campaignNameOrProductLaunch: "Q4 Autonomous AI SEO & Marketing Agents Launch",
  destinationLandingPageUrl: "https://doitwithai.tools/agents",
  coreValuePropsAndTakeaways:
    "1. Replace single-prompt ChatGPT guesswork with multi-step autonomous AI agents.\n2. Run 5-step SEO/AEO optimization, RAG support bot building, and omnichannel campaigns in 1 click.\n3. 100% free browser workspace + downloadable portable HTML tools.",
  targetAudienceSegment:
    "Growth marketers, SaaS founders, content leads, and digital agencies",
  teamWeeklyHoursCapacity: 16,
  paidTrafficBudget: "$1,500 test sprint across LinkedIn, Meta & Search",
};

export function buildDeterministicMarketingCampaignPack(
  input: MarketingCampaignAgentInput,
): MarketingCampaignAgentPack {
  const title =
    input.campaignNameOrProductLaunch.trim() ||
    "Product Launch & Content Campaign";
  const baseUrl =
    input.destinationLandingPageUrl.trim() &&
    /^https?:\/\//i.test(input.destinationLandingPageUrl.trim())
      ? input.destinationLandingPageUrl.trim().replace(/\/+$/, "")
      : "https://doitwithai.tools/agents";
  const audience =
    input.targetAudienceSegment.trim() || "growth marketers and founders";
  const capacityHrs = Math.max(4, Math.min(120, Number(input.teamWeeklyHoursCapacity) || 16));
  const slugCampaign = title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_|_$/g, "")
    .slice(0, 32) || "q4_agent_launch";

  const lines = input.coreValuePropsAndTakeaways
    .split(/\r?\n/)
    .map((l) => l.replace(/^[-*•\d.)\s]+/, "").trim())
    .filter(Boolean);
  const v1 = lines[0] || "Automate multi-step marketing workflows instead of writing one-off prompts.";
  const v2 = lines[1] || "Ship synchronized assets across LinkedIn, X, short-form video, and paid ads.";
  const v3 = lines[2] || "Track every click with clean UTM attribution and weekly sprint capacity limits.";

  const tasks: SprintTaskItem[] = [
    {
      dayOrPhase: "Day 1 (Intake & Strategy)",
      ownerRole: "Marketing Lead",
      deliverable: "Finalize campaign brief, UTM taxonomy, and landing page conversion check",
      estimatedHours: 2.5,
    },
    {
      dayOrPhase: "Day 2 (Organic Social & Carousel)",
      ownerRole: "Content Strategist",
      deliverable: "Publish LinkedIn thought-leadership post + 6-slide PDF carousel + 5-post X thread",
      estimatedHours: 3.5,
    },
    {
      dayOrPhase: "Day 3 (Short-Form Video Production)",
      ownerRole: "Creator / Founder",
      deliverable: "Record & caption 60-second Reels / TikTok / YouTube Shorts walkthrough",
      estimatedHours: 3.0,
    },
    {
      dayOrPhase: "Day 4 (Paid Traffic Launch)",
      ownerRole: "Paid Acquisition Manager",
      deliverable: `Deploy 3 ad angles (${input.paidTrafficBudget || "$1,500 test budget"}) with UTM links`,
      estimatedHours: 3.5,
    },
    {
      dayOrPhase: "Day 5 (Paid Traffic & Conversion Analysis)",
      ownerRole: "Growth Analyst",
      deliverable: "Audit CTR, CPC, and scroll-depth by UTM source; pause bottom 30% creatives",
      estimatedHours: 2.0,
    },
  ];

  const totalEstimatedHours = tasks.reduce((s, t) => s + t.estimatedHours, 0);
  const capacityStatus =
    totalEstimatedHours <= capacityHrs
      ? `Green Capacity Fit: ${totalEstimatedHours}h planned vs ${capacityHrs}h weekly team capacity (${(capacityHrs - totalEstimatedHours).toFixed(1)}h buffer)`
      : `Capacity Alert: ${totalEstimatedHours}h planned exceeds ${capacityHrs}h available—automate carousel & ad variations first`;

  const linkedinPost = [
    `Why an AI Marketing Agent beats raw ChatGPT prompts for "${title}" 👇`,
    ``,
    `Most ${audience} spend hours copying and pasting between 6 tabs just to ship one campaign.`,
    ``,
    `Here is how we turned one brief into a full-funnel sprint:`,
    `✅ ${v1}`,
    `✅ ${v2}`,
    `✅ ${v3}`,
    ``,
    `Explore the live workspace here: ${baseUrl}?utm_source=linkedin&utm_medium=organic_social&utm_campaign=${slugCampaign}`,
    ``,
    `#MarketingAutomation #AIAgents #GrowthMarketing #ContentStrategy`,
  ].join("\n");

  const carouselSlides = [
    `Slide 1 (Hook): ${title} — The 1-Brief Omnichannel Playbook`,
    `Slide 2 (AI Agent vs ChatGPT): Why single prompts fail at capacity planning & UTM attribution`,
    `Slide 3 (Pillar 1): ${v1}`,
    `Slide 4 (Pillar 2): ${v2}`,
    `Slide 5 (Pillar 3): ${v3}`,
    `Slide 6 (CTA): Launch your campaign free at ${baseUrl}`,
  ];

  const twitterThread = [
    `1/ Stop using raw ChatGPT like a typewriter for marketing campaigns.\n\nHere is how we run "${title}" with an autonomous Omnichannel Campaign Agent 🧵👇`,
    `2/ Step 1 — Work Intake & Capacity Planning:\n\nBefore writing a single post, map your sprint hours (${totalEstimatedHours}h across 5 days) so your team never burns out.`,
    `3/ Step 2 — Core Value Architecture:\n\n• ${v1}\n• ${v2}`,
    `4/ Step 3 — Paid Traffic & UTM Attribution:\n\nEvery organic post, video, and ad variation gets a deterministic UTM link so you know what actually drives pipeline.`,
    `5/ Try the full 1-Brief-to-Campaign Agent live here:\n${baseUrl}?utm_source=twitter&utm_medium=organic_social&utm_campaign=${slugCampaign}`,
  ];

  const shortFormVideoScript60s = [
    `[0:00–0:05 HOOK — On-Screen Text: "AI Marketing Agent vs ChatGPT"]`,
    `"If you're still prompting ChatGPT one channel at a time for ${title}, you're wasting 6 hours a week."`,
    ``,
    `[0:05–0:20 THE PROBLEM]`,
    `"Most ${audience} have great product launches that flop because capacity planning, video scripts, ad copy, and UTM links live in disconnected spreadsheets."`,
    ``,
    `[0:20–0:45 THE 3-STEP SOLUTION — Screen Recording of Workspace]`,
    `"Watch this: we paste one brief. First: ${v1} Second: ${v2} Third: ${v3}"`,
    ``,
    `[0:45–0:60 CTA]`,
    `"Comment 'AGENT' or head to ${baseUrl.replace(/^https?:\/\//, "")} to generate your entire campaign + UTM sheet in 30 seconds."`,
  ].join("\n");

  const paidTrafficAdAngles: AdCopyAngleItem[] = [
    {
      angleName: "Angle 1: AI Marketing Agent vs. Manual Prompting (Problem/Solution)",
      channel: "LinkedIn Sponsored Content",
      headline: `${title}: Cut Campaign Prep Time by 70%`,
      primaryText: `Built for ${audience}. ${v1} Launch your capacity plan, social posts, and UTM tracking in one workspace.`,
      trafficAnalysisHypothesis:
        "Benchmarks highest CTR (1.2%+) among B2B decision-makers frustrated with fragmented workflows.",
    },
    {
      angleName: "Angle 2: Direct Value & Speed Proof (Social Proof / Demo)",
      channel: "Meta / Instagram Ads",
      headline: "1 Brief → Full Omnichannel Campaign in 60 Seconds",
      primaryText: `${v2} ${v3} Try the interactive agent free—no credit card required.`,
      trafficAnalysisHypothesis:
        "Optimizes for lowest CPC and high landing-page scroll depth on mobile feeds.",
    },
    {
      angleName: "Angle 3: High-Intent Search Capture",
      channel: "Google Search / Performance Max",
      headline: `Free AI Marketing Campaign & Capacity Planner`,
      primaryText: `Automate work intake,sprint capacity planning, ad copy angles, and UTM links for ${title}.`,
      trafficAnalysisHypothesis:
        "Captures bottom-of-funnel queries ('ai agent for marketing campaigns', 'marketing work intake ai agent').",
    },
  ];

  const sep = baseUrl.includes("?") ? "&" : "?";
  const utmTrackingMatrix: UtmLinkItem[] = [
    {
      channelName: "LinkedIn Organic Post & Carousel",
      utmSource: "linkedin",
      utmMedium: "organic_social",
      utmCampaign: slugCampaign,
      fullTrackedUrl: `${baseUrl}${sep}utm_source=linkedin&utm_medium=organic_social&utm_campaign=${slugCampaign}`,
    },
    {
      channelName: "X / Twitter 5-Post Thread",
      utmSource: "twitter",
      utmMedium: "organic_social",
      utmCampaign: slugCampaign,
      fullTrackedUrl: `${baseUrl}${sep}utm_source=twitter&utm_medium=organic_social&utm_campaign=${slugCampaign}`,
    },
    {
      channelName: "Short-Form Video (Reels / Shorts / TikTok)",
      utmSource: "short_video",
      utmMedium: "video_bio",
      utmCampaign: slugCampaign,
      fullTrackedUrl: `${baseUrl}${sep}utm_source=short_video&utm_medium=video_bio&utm_campaign=${slugCampaign}`,
    },
    {
      channelName: "Paid Traffic — LinkedIn & Meta Ads",
      utmSource: "paid_social",
      utmMedium: "cpc",
      utmCampaign: slugCampaign,
      fullTrackedUrl: `${baseUrl}${sep}utm_source=paid_social&utm_medium=cpc&utm_campaign=${slugCampaign}`,
    },
  ];

  const compiledCampaignMarkdown = [
    `# Omnichannel Content & Marketing Campaign Pack: ${title}`,
    `**Destination URL:** ${baseUrl}`,
    `**Capacity Status:** ${capacityStatus}`,
    ``,
    `## 1. Marketing Work Intake & 5-Day Sprint Capacity Plan`,
    ...tasks.map(
      (t) =>
        `- **${t.dayOrPhase} (${t.ownerRole} — ${t.estimatedHours}h):** ${t.deliverable}`,
    ),
    ``,
    `## 2. LinkedIn Post & 6-Slide Carousel`,
    linkedinPost,
    ``,
    ...carouselSlides.map((s) => `- ${s}`),
    ``,
    `## 3. X Thread & 60s Short-Form Video Script`,
    ...twitterThread.map((t) => `${t}\n`),
    `### 60-Second Short-Form Video Script`,
    shortFormVideoScript60s,
    ``,
    `## 4. Paid Traffic Ad Copy Angles & Hypotheses`,
    ...paidTrafficAdAngles.map(
      (a) =>
        `### ${a.angleName} (${a.channel})\n- **Headline:** ${a.headline}\n- **Primary Text:** ${a.primaryText}\n- **Paid Traffic Analysis Hypothesis:** ${a.trafficAnalysisHypothesis}\n`,
    ),
    `## 5. UTM Attribution Tracking Links`,
    ...utmTrackingMatrix.map(
      (u) => `- **${u.channelName}:** \`${u.fullTrackedUrl}\``,
    ),
  ].join("\n");

  return {
    capacityAndSprintPlan: {
      totalEstimatedHours,
      capacityStatus,
      tasks,
    },
    linkedinAndCarouselPack: {
      linkedinPost,
      carouselSlides,
    },
    twitterThreadAndVideoScript: {
      twitterThread,
      shortFormVideoScript60s,
    },
    paidTrafficAdAngles,
    utmTrackingMatrix,
    compiledCampaignMarkdown,
  };
}
