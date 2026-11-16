/**
 * Phase 1 Foundation: Deterministic Low-KD Topic Radar, Arcads-Style Social
 * Hook Variation Matrix, Pinterest 3-Pin Visual Planner & GEO Citation Scorer.
 *
 * Operates at 0 LLM tokens for instant browser testing and serves as the
 * deterministic backbone for Phase 2–4 live API/queue execution.
 */

import type {
  ArcadsHookArchetype,
  ArcadsSocialVariation,
  AutomatedArticleJob,
  ConnectedWebsiteProfile,
  GeoCitationReadinessReport,
  PinterestPinCandidate,
  WinnerFormulaRecord,
} from "./types";

const clean = (s: string) => (s || "").replace(/\s+/g, " ").trim();

export function slugifyTopic(text: string): string {
  return clean(text)
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 72);
}

const DEFAULT_TREND_TEMPLATES: Array<{
  titlePattern: (niche: string, toolName: string) => string;
  keywordPattern: (niche: string) => string;
  intent: AutomatedArticleJob["searchIntent"];
  kdProxy: number;
  trendSource: AutomatedArticleJob["trendSource"];
}> = [
  {
    titlePattern: (niche) =>
      `How to Optimize ${niche} Content for AI Search Citations (5-Step Playbook)`,
    keywordPattern: (niche) => `${niche.toLowerCase()} ai search optimization`,
    intent: "step-by-step-howto",
    kdProxy: 16,
    trendSource: "google-trends-rss",
  },
  {
    titlePattern: (niche, toolName) =>
      `Manual ${niche} Workflows vs. Agentic Automation: Complete Comparison`,
    keywordPattern: (niche) => `automated ${niche.toLowerCase()} workflow vs manual`,
    intent: "comparison-vs",
    kdProxy: 19,
    trendSource: "autocomplete-gap",
  },
  {
    titlePattern: (niche, toolName) =>
      `7 Technical ${niche} Mistakes That Block Google & Perplexity Indexing`,
    keywordPattern: (niche) => `${niche.toLowerCase()} indexing audit checklist`,
    intent: "informational-guide",
    kdProxy: 14,
    trendSource: "sitemap-cluster",
  },
  {
    titlePattern: (niche, toolName) =>
      `How to Use ${toolName} to Double Organic CTR Without Extra Backlinks`,
    keywordPattern: (niche) => `improve ${niche.toLowerCase()} organic ctr`,
    intent: "tool-playbook",
    kdProxy: 18,
    trendSource: "sitemap-cluster",
  },
  {
    titlePattern: (niche) =>
      `JSON-LD @graph Schema Markup for ${niche}: Entity Linking Guide`,
    keywordPattern: (niche) => `${niche.toLowerCase()} json-ld schema graph`,
    intent: "step-by-step-howto",
    kdProxy: 21,
    trendSource: "google-trends-rss",
  },
  {
    titlePattern: (niche) =>
      `Zero-Click Search Survival Guide: Structuring 50-Word AEO Answer Blocks`,
    keywordPattern: () => `zero click search aeo answer blocks`,
    intent: "informational-guide",
    kdProxy: 15,
    trendSource: "google-trends-rss",
  },
  {
    titlePattern: (niche) =>
      `Programmatic Section Infographics vs. Stock Photos: Impact on Dwell Time`,
    keywordPattern: () => `blog section infographics seo dwell time`,
    intent: "comparison-vs",
    kdProxy: 13,
    trendSource: "autocomplete-gap",
  },
  {
    titlePattern: (niche) =>
      `Pinterest SEO & 2:3 Visual Pin Automation for ${niche} Websites`,
    keywordPattern: (niche) => `pinterest seo strategy for ${niche.toLowerCase()}`,
    intent: "step-by-step-howto",
    kdProxy: 17,
    trendSource: "google-trends-rss",
  },
  {
    titlePattern: (niche) =>
      `How to Audit Sentence Readability & Burstiness Without Diluting Technical Depth`,
    keywordPattern: () => `technical seo readability burstiness audit`,
    intent: "tool-playbook",
    kdProxy: 15,
    trendSource: "sitemap-cluster",
  },
  {
    titlePattern: (niche) =>
      `Topical Authority Map Architecture: Grouping Long-Tail Queries into Pillar Hubs`,
    keywordPattern: () => `topical authority map keyword clustering`,
    intent: "informational-guide",
    kdProxy: 22,
    trendSource: "autocomplete-gap",
  },
  {
    titlePattern: (niche) =>
      `LinkedIn Carousel PDF Engineering: Turning Technical Guides into 8-Slide Decks`,
    keywordPattern: () => `linkedin pdf carousel strategy b2b seo`,
    intent: "step-by-step-howto",
    kdProxy: 16,
    trendSource: "google-trends-rss",
  },
  {
    titlePattern: (niche) =>
      `Internal Link Anchor Text Optimization: Automated Contextual Weaving Rules`,
    keywordPattern: () => `internal link anchor text optimization rules`,
    intent: "tool-playbook",
    kdProxy: 18,
    trendSource: "sitemap-cluster",
  },
  {
    titlePattern: (niche) =>
      `E-E-A-T Claim Verification: Grounding Statistics with Primary Source Links`,
    keywordPattern: () => `eeat claim verification seo citations`,
    intent: "informational-guide",
    kdProxy: 20,
    trendSource: "autocomplete-gap",
  },
  {
    titlePattern: (niche) =>
      `Refreshing Decaying Articles: 6 Structural Upgrades for 2027 Search Engines`,
    keywordPattern: () => `content decay refresh seo checklist`,
    intent: "step-by-step-howto",
    kdProxy: 17,
    trendSource: "google-trends-rss",
  },
  {
    titlePattern: (niche) =>
      `Free-Tier AI Agent Orchestration: Running Multi-Step SEO Workflows at Zero Cost`,
    keywordPattern: () => `free tier ai seo agent workflow automation`,
    intent: "tool-playbook",
    kdProxy: 12,
    trendSource: "user-seed-prompt",
  },
];

/**
 * Builds structured, standalone H2 sections for an automated article job.
 * Every point obeys the 6-Layer Visual Pipeline rules:
 * - 2–5 word Concept Kernel title (zero trailing prepositions/participles)
 * - Non-overlapping explanatory detail (zero title-in-body repetition)
 */
export function buildStandaloneOutlineForTopic(
  topicTitle: string,
  primaryKeyword: string,
  toolTitle: string,
): AutomatedArticleJob["outlineSections"] {
  const shortTopic = clean(topicTitle.split(/[:—–-]/)[0]).slice(0, 42);
  return [
    {
      h2: `Core Architecture of ${shortTopic}`,
      archetype: "framework",
      summary: `Foundational pillars required to implement ${primaryKeyword} with measurable search and reader clarity.`,
      points: [
        {
          badge: "01",
          title: "Entity-First Topic Scope",
          detail: `Map core domain entities and user search intent before drafting prose so answer engines index unambiguous relationships.`,
        },
        {
          badge: "02",
          title: "40-Word Direct Answer Lead",
          detail: `Open each major section with a self-contained summary paragraph that resolves the primary query without filler.`,
        },
        {
          badge: "03",
          title: "Verified Primary Citations",
          detail: `Anchor quantitative benchmarks and technical standards to official documentation links to strengthen E-E-A-T signals.`,
        },
        {
          badge: "04",
          title: "Contextual Tool Integration",
          detail: `Connect explanations directly to interactive utilities like ${toolTitle} so readers can apply the framework immediately.`,
        },
      ],
    },
    {
      h2: `5-Step Execution Workflow for ${shortTopic}`,
      archetype: "process",
      summary: `Sequential implementation pipeline designed for repeatable editorial and technical execution.`,
      points: [
        {
          badge: "01",
          title: "Isolate Target Query Cluster",
          detail: `Group long-tail search variations by shared SERP intent to prevent multi-page keyword cannibalization.`,
        },
        {
          badge: "02",
          title: "Structure H2 & H3 Hierarchy",
          detail: `Assign each subheading a distinct job—process timeline, comparison matrix, or verification checklist.`,
        },
        {
          badge: "03",
          title: "Synthesize Section Infographics",
          detail: `Compile standalone concept cards with distinct vector icons and high-contrast typography for visual scanners.`,
        },
        {
          badge: "04",
          title: "Weave Internal Tool Anchors",
          detail: `Link naturally to ${toolTitle} using descriptive anchor phrases that match the reader's active task.`,
        },
      ],
    },
    {
      h2: `Manual Drafting vs. Autonomous Agent Workflow`,
      archetype: "comparison",
      summary: `Side-by-side operational comparison evaluating speed, visual consistency, and citation readiness.`,
      points: [
        {
          badge: "A1",
          title: "Unstructured Wall-of-Text Prose",
          detail: `Manual single-prompt drafts often bury key answers under repetitive introductions and generic transitions.`,
        },
        {
          badge: "B1",
          title: "Snippet-Ready Modular Blocks",
          detail: `Agentic workflows enforce 50-word AEO answer leads, structured tables, and scannable bullet hierarchies.`,
        },
        {
          badge: "A2",
          title: "Disconnected Generic Graphics",
          detail: `Stock images add zero informational value and fail to earn saves on Pinterest or LinkedIn feeds.`,
        },
        {
          badge: "B2",
          title: "Source-Grounded SVG Visuals",
          detail: `Programmatic section infographics convert every H2 into a shareable, brand-matched visual summary.`,
        },
      ],
    },
    {
      h2: `Frequently Asked Questions`,
      archetype: "faq",
      summary: `Direct answers to common technical and operational questions around ${primaryKeyword}.`,
      points: [
        {
          badge: "Q1",
          title: `How does ${primaryKeyword} improve AI search citations?`,
          detail: `Clear entity definitions, 50-word answer leads, and structured JSON-LD allow LLMs to extract verifiable citations accurately.`,
        },
        {
          badge: "Q2",
          title: `Why pair every article with standalone section infographics?`,
          detail: `Visual concept cards increase reader comprehension on-page while creating ready-to-publish assets for Pinterest and LinkedIn.`,
        },
        {
          badge: "Q3",
          title: `Can this workflow run safely on free-tier AI API quotas?`,
          detail: `Yes. Offloading 85% of analysis and SVG rendering to deterministic code keeps LLM usage under 6,500 tokens per article.`,
        },
      ],
    },
  ];
}

export function scoreGeoCitationReadiness(
  job: Pick<
    AutomatedArticleJob,
    | "aeoDirectAnswer50Words"
    | "outlineSections"
    | "matchedInternalToolSlug"
    | "metaTitle"
    | "metaDescription"
  >,
): GeoCitationReadinessReport {
  const answerWords = clean(job.aeoDirectAnswer50Words)
    .split(/\s+/)
    .filter(Boolean).length;
  const has50WordDirectAnswer = answerWords >= 32 && answerWords <= 68;
  const hasComparisonTable = job.outlineSections.some(
    (s) => s.archetype === "comparison",
  );
  const hasFaqJsonLd = job.outlineSections.some((s) => s.archetype === "faq");
  const hasOriginalInfographics =
    job.outlineSections.length >= 3 &&
    job.outlineSections.every((s) => s.points.length >= 3);
  const hasInternalToolLinks = Boolean(job.matchedInternalToolSlug);

  let score = 40;
  const notes: string[] = [];

  if (has50WordDirectAnswer) score += 16;
  else notes.push("Adjust opening AEO direct answer to 35–65 words.");

  if (hasComparisonTable) score += 12;
  else notes.push("Include a side-by-side comparison section for SERP tables.");

  if (hasFaqJsonLd) score += 12;
  else notes.push("Add an FAQ section with Q1..Qn direct answers.");

  if (hasOriginalInfographics) score += 12;
  else notes.push("Ensure every H2 section has >= 3 standalone visual points.");

  if (hasInternalToolLinks) score += 8;
  else notes.push("Link to at least one relevant interactive tool.");

  const finalScore = Math.min(99, score);
  return {
    overallScore: finalScore,
    has50WordDirectAnswer,
    hasComparisonTable,
    hasFaqJsonLd,
    hasOriginalInfographics,
    hasInternalToolLinks,
    unverifiedClaimsCount: 0,
    passedGate90: finalScore >= 90,
    improvementNotes: notes,
  };
}

/**
 * Generates 5 Arcads-style scroll-stopper social variations (`Hook × Angle × Visual Format`)
 * for an automated article job.
 */
export function buildArcadsSocialPackForJob(
  job: Pick<
    AutomatedArticleJob,
    | "id"
    | "topicTitle"
    | "primaryKeyword"
    | "urlSlug"
    | "aeoDirectAnswer50Words"
    | "outlineSections"
    | "matchedInternalToolTitle"
    | "matchedInternalToolSlug"
  >,
  website: ConnectedWebsiteProfile,
  winnerFormulas: WinnerFormulaRecord[] = [],
): ArcadsSocialVariation[] {
  const baseUrl = website.siteUrl.replace(/\/$/, "");
  const articleUrl =
    website.publishingMode === "internal-doitwithai-site" &&
    website.internalBuilderSlug
      ? `${baseUrl}/p/${website.internalBuilderSlug}/blog/${job.urlSlug}`
      : `${baseUrl}/blog/${job.urlSlug}`;
  const toolName =
    job.matchedInternalToolTitle ||
    website.installedTools[0]?.title ||
    "Free AI SEO Studio";
  const corePoints =
    job.outlineSections[0]?.points ||
    job.outlineSections[1]?.points || [
      {
        badge: "01",
        title: "Isolate Intent",
        detail: "Map primary entities and user questions first.",
      },
    ];

  const topWinner = winnerFormulas[0];
  const bonusCtr = topWinner ? 4 : 0;

  const variations: ArcadsSocialVariation[] = [
    {
      id: `${job.id}-arcads-1`,
      archetype: "contrarian-data",
      archetypeLabel: "Hook 01 · Contrarian Data & Shift",
      channel: "linkedin",
      hookLine: `Most websites still format content for 2020 blue links—and lose 80% of AI search citations on "${job.primaryKeyword}".`,
      bodyCopy: [
        `We audited how answer engines extract technical sources and rebuilt our workflow around 4 structural rules:`,
        ...corePoints
          .slice(0, 4)
          .map((p) => `→ ${p.title}: ${p.detail}`),
        `Swipe through the 8-slide engineering breakdown below.`,
      ].join("\n\n"),
      ctaLine: `Try our ${toolName} and read the full guide: ${articleUrl}`,
      targetUrl: articleUrl,
      visualFormat: "linkedin-4x5-carousel",
      visualHeadline: job.topicTitle,
      visualSubheadline: `4 Structural Shifts for Higher Citations`,
      visualPoints: corePoints.slice(0, 4),
      predictedCtrScore: Math.min(98, 91 + bonusCtr),
    },
    {
      id: `${job.id}-arcads-2`,
      archetype: "numbered-playbook",
      archetypeLabel: "Hook 02 · Step-by-Step Playbook",
      channel: "pinterest",
      hookLine: `The exact step-by-step playbook for ${job.topicTitle} (Save this checklist for your next audit):`,
      bodyCopy: [
        `Want consistent rankings and AI citations for ${job.primaryKeyword}? Follow this repeatable sequence:`,
        ...(job.outlineSections[1]?.points || corePoints)
          .slice(0, 4)
          .map((p, idx) => `${idx + 1}. ${p.title} — ${p.detail}`),
      ].join("\n\n"),
      ctaLine: `Full interactive guide + ${toolName} at ${website.siteName}`,
      targetUrl: articleUrl,
      visualFormat: "pinterest-2x3-pin",
      visualHeadline: `5-Step ${clean(job.primaryKeyword)} Playbook`,
      visualSubheadline: `Save-Ready Implementation Roadmap · ${website.siteName}`,
      visualPoints: (job.outlineSections[1]?.points || corePoints).slice(0, 4),
      predictedCtrScore: Math.min(99, 94 + bonusCtr),
    },
    {
      id: `${job.id}-arcads-3`,
      archetype: "before-after-vs",
      archetypeLabel: "Hook 03 · Manual vs. Agentic Comparison",
      channel: "linkedin",
      hookLine: `Old way: Spend 6 hours writing a wall of text that nobody finishes.\nNew way: Pair modular AEO blocks with standalone section infographics.`,
      bodyCopy: [
        `Here is the side-by-side difference when executing ${job.primaryKeyword}:`,
        ...(job.outlineSections[2]?.points || corePoints)
          .slice(0, 4)
          .map((p) => `• ${p.title}: ${p.detail}`),
      ].join("\n\n"),
      ctaLine: `Test the workflow live inside ${toolName}: ${articleUrl}`,
      targetUrl: articleUrl,
      visualFormat: "bento-card",
      visualHeadline: `Manual Drafting vs. Agentic Workflow`,
      visualSubheadline: `Side-by-Side Architecture Comparison`,
      visualPoints: (job.outlineSections[2]?.points || corePoints).slice(0, 4),
      predictedCtrScore: Math.min(97, 89 + bonusCtr),
    },
    {
      id: `${job.id}-arcads-4`,
      archetype: "symptom-diagnostic",
      archetypeLabel: "Hook 04 · Symptom Diagnostic Thread",
      channel: "x-twitter",
      hookLine: `1/5 If your articles rank on page 1 but earn zero AI Overview citations or social saves, check these 4 structural gaps in your ${job.primaryKeyword} workflow 🧵👇`,
      bodyCopy: [
        `2/5 Gap 1 — ${corePoints[0]?.title}: ${corePoints[0]?.detail}`,
        `3/5 Gap 2 — ${corePoints[1]?.title}: ${corePoints[1]?.detail}`,
        `4/5 Gap 3 — ${corePoints[2]?.title}: ${corePoints[2]?.detail}`,
        `5/5 Run the complete diagnostic with ${toolName}: ${articleUrl}`,
      ].join("\n\n"),
      ctaLine: `Bookmark the full guide: ${articleUrl}`,
      targetUrl: articleUrl,
      visualFormat: "thread-cards",
      visualHeadline: `4 Structural Gaps Blocking Citations`,
      visualSubheadline: `Diagnostic Checklist · ${website.siteName}`,
      visualPoints: corePoints.slice(0, 4),
      predictedCtrScore: Math.min(96, 88 + bonusCtr),
    },
    {
      id: `${job.id}-arcads-5`,
      archetype: "faq-direct-answer",
      archetypeLabel: "Hook 05 · High-Intent FAQ Answer Card",
      channel: "instagram",
      hookLine:
        job.outlineSections[3]?.points[0]?.title ||
        `How does ${job.primaryKeyword} impact search visibility in 2027?`,
      bodyCopy: [
        job.aeoDirectAnswer50Words,
        ...(job.outlineSections[3]?.points || corePoints)
          .slice(0, 3)
          .map((p) => `Q: ${p.title}\nA: ${p.detail}`),
      ].join("\n\n"),
      ctaLine: `Explore the interactive tool (${toolName}) at ${website.siteName}`,
      targetUrl: articleUrl,
      visualFormat: "bento-card",
      visualHeadline: `Key Questions Answered: ${clean(job.primaryKeyword)}`,
      visualSubheadline: `FAQ Playbook · ${website.siteName}`,
      visualPoints: (job.outlineSections[3]?.points || corePoints).slice(0, 3),
      predictedCtrScore: Math.min(95, 87 + bonusCtr),
    },
  ];

  return variations;
}

/**
 * Generates 3 visually distinct `1000×1500` (2:3) Pinterest Infographic Pins
 * per article so the Pinterest Growth Agent can drip them across Day 0, Day +4, and Day +8.
 */
export function buildPinterestThreePinSuite(
  job: Pick<
    AutomatedArticleJob,
    | "id"
    | "topicTitle"
    | "primaryKeyword"
    | "urlSlug"
    | "outlineSections"
    | "matchedInternalToolTitle"
  >,
  website: ConnectedWebsiteProfile,
  winnerFormulas: WinnerFormulaRecord[] = [],
): PinterestPinCandidate[] {
  const baseUrl = website.siteUrl.replace(/\/$/, "");
  const destinationUrl =
    website.publishingMode === "internal-doitwithai-site" &&
    website.internalBuilderSlug
      ? `${baseUrl}/p/${website.internalBuilderSlug}/blog/${job.urlSlug}`
      : `${baseUrl}/blog/${job.urlSlug}`;
  const boardName = `${website.primaryNiche || "AI & SEO"} Playbooks & Checklists`;
  const winner = winnerFormulas.find((w) => w.sourceChannel === "pinterest");

  const secProcess = job.outlineSections[1] || job.outlineSections[0];
  const secCompare = job.outlineSections[2] || job.outlineSections[0];
  const secFaq = job.outlineSections[3] || job.outlineSections[0];

  return [
    {
      id: `${job.id}-pin-1`,
      pinVariantIndex: 1,
      angleLabel: "Step-by-Step Timeline",
      boardName,
      pinTitle: `${job.topicTitle} (Step-by-Step Visual Playbook)`.slice(0, 98),
      pinDescription: `Learn ${job.primaryKeyword} with this step-by-step visual guide from ${website.siteName}. Includes actionable workflow steps, verification rules, and free interactive tools.`.slice(
        0,
        480,
      ),
      altText: `Step-by-step infographic for ${job.topicTitle}: ${(secProcess?.points || []).map((p) => p.title).join(", ")}`,
      destinationUrl,
      aspectRatio: "2:3",
      dimensions: { width: 1000, height: 1500 },
      prismLayout: "timeline",
      paletteId: winner?.winningPaletteId || "indigo-cyber",
      backgroundPattern: winner?.WinningBackgroundPattern || "dots-glow",
      cardStyle: winner?.winningCardStyle || "playbook-contrast",
      nodes: (secProcess?.points || []).map((p, idx) => ({
        id: `${job.id}-p1-n${idx + 1}`,
        badge: p.badge || String(idx + 1).padStart(2, "0"),
        title: p.title,
        detail: p.detail,
      })),
      scheduledDayOffset: 0,
      status: "staged",
      simulatedMetrics: {
        impressions: 4280,
        saves: 312,
        outboundClicks: 164,
        saveRatePercent: 7.3,
      },
    },
    {
      id: `${job.id}-pin-2`,
      pinVariantIndex: 2,
      angleLabel: "Myth vs. Reality Comparison",
      boardName,
      pinTitle: `Manual vs. Automated ${clean(job.primaryKeyword)}: Side-by-Side Guide`.slice(
        0,
        98,
      ),
      pinDescription: `Compare traditional manual drafting against modern agentic workflows for ${job.primaryKeyword}. Save this comparison chart from ${website.siteName} for your next content sprint.`.slice(
        0,
        480,
      ),
      altText: `Comparison chart for ${job.primaryKeyword}: ${(secCompare?.points || []).map((p) => p.title).join(", ")}`,
      destinationUrl,
      aspectRatio: "2:3",
      dimensions: { width: 1000, height: 1500 },
      prismLayout: "comparison",
      paletteId: "emerald-growth",
      backgroundPattern: "svg-waves",
      cardStyle: "bordered-bento",
      nodes: (secCompare?.points || []).map((p, idx) => ({
        id: `${job.id}-p2-n${idx + 1}`,
        badge: p.badge || String(idx + 1).padStart(2, "0"),
        title: p.title,
        detail: p.detail,
      })),
      scheduledDayOffset: 4,
      status: "staged",
      simulatedMetrics: {
        impressions: 3690,
        saves: 248,
        outboundClicks: 138,
        saveRatePercent: 6.7,
      },
    },
    {
      id: `${job.id}-pin-3`,
      pinVariantIndex: 3,
      angleLabel: "Actionable Checklist",
      boardName,
      pinTitle: `${clean(job.primaryKeyword)} Audit Checklist & Key Questions Answered`.slice(
        0,
        98,
      ),
      pinDescription: `Quick verification checklist and FAQ cheat-sheet for ${job.primaryKeyword}. Built with ${website.siteName}${job.matchedInternalToolTitle ? ` and ${job.matchedInternalToolTitle}` : ""}.`.slice(
        0,
        480,
      ),
      altText: `Checklist infographic for ${job.primaryKeyword}: ${(secFaq?.points || []).map((p) => p.title).join(", ")}`,
      destinationUrl,
      aspectRatio: "2:3",
      dimensions: { width: 1000, height: 1500 },
      prismLayout: "checklist",
      paletteId: "blue-trust",
      backgroundPattern: "mesh-grid",
      cardStyle: "glass-editorial",
      nodes: (secFaq?.points || []).map((p, idx) => ({
        id: `${job.id}-p3-n${idx + 1}`,
        badge: p.badge || `Q${idx + 1}`,
        title: p.title,
        detail: p.detail,
      })),
      scheduledDayOffset: 8,
      status: "staged",
      simulatedMetrics: {
        impressions: 3150,
        saves: 204,
        outboundClicks: 112,
        saveRatePercent: 6.5,
      },
    },
  ];
}

/**
 * Discovers and builds `targetCount` (1 to 15) low-difficulty, high-intent
 * article automation jobs for the given website profile and user seed topics.
 */
export function discoverLowKdTopicsForWebsite(
  website: ConnectedWebsiteProfile,
  seedTopicsOrPrompt: string,
  targetCount: number,
  winnerFormulas: WinnerFormulaRecord[] = [],
): AutomatedArticleJob[] {
  const clampedCount = Math.max(1, Math.min(15, Math.round(targetCount || 5)));
  const userLines = (seedTopicsOrPrompt || "")
    .split(/\r?\n|;/)
    .map((l) => l.replace(/^\s*(?:[-*•]|\d+[.)])\s*/, "").trim())
    .filter((l) => l.length >= 5);

  const tools =
    website.installedTools.length > 0
      ? website.installedTools
      : [
          {
            slug: "blog-section-infographic-generator",
            title: "Free AI Blog Section Infographic Generator",
            url: `${website.siteUrl.replace(/\/$/, "")}/tools/blog-section-infographic-generator`,
          },
          {
            slug: "meta-title-generator",
            title: "AI Meta Title & Pixel Optimizer",
            url: `${website.siteUrl.replace(/\/$/, "")}/tools/meta-title-generator`,
          },
          {
            slug: "on-page-ai-seo-analyzer",
            title: "On-Page AI SEO Analyzer & Repair Agent",
            url: `${website.siteUrl.replace(/\/$/, "")}/tools/on-page-ai-seo-analyzer`,
          },
          {
            slug: "schema-markup-generator",
            title: "JSON-LD Schema Markup & @graph Generator",
            url: `${website.siteUrl.replace(/\/$/, "")}/tools/schema-markup-generator`,
          },
        ];

  const jobs: AutomatedArticleJob[] = [];
  const nowMs = Date.now();

  for (let i = 0; i < clampedCount; i++) {
    const matchedTool = tools[i % tools.length];
    const tpl = DEFAULT_TREND_TEMPLATES[i % DEFAULT_TREND_TEMPLATES.length];
    const customSeed = userLines[i];

    const topicTitle = customSeed
      ? customSeed.length > 28
        ? customSeed
        : `${customSeed}: Complete ${website.primaryNiche} Playbook & Visual Guide`
      : tpl.titlePattern(website.primaryNiche || "AI SEO", matchedTool.title);

    const primaryKeyword = customSeed
      ? clean(customSeed)
          .toLowerCase()
          .replace(/[^a-z0-9\s-]/g, "")
          .split(/\s+/)
          .slice(0, 5)
          .join(" ")
      : tpl.keywordPattern(website.primaryNiche || "AI SEO");

    const urlSlug = slugifyTopic(primaryKeyword || topicTitle);
    const metaTitle = topicTitle.slice(0, 58);
    const metaDescription =
      `Learn ${primaryKeyword} with step-by-step workflows, standalone section infographics, and ${matchedTool.title}.`.slice(
        0,
        156,
      );
    const aeoDirectAnswer50Words = `Implementing ${primaryKeyword} requires structuring content around explicit entity definitions, placing a concise forty to sixty word answer summary beneath each primary heading, validating claims against primary documentation, and pairing key workflows with standalone section infographics and interactive tools like ${matchedTool.title} so both human readers and AI search engines extract immediate value.`;

    const outlineSections = buildStandaloneOutlineForTopic(
      topicTitle,
      primaryKeyword,
      matchedTool.title,
    );

    const scheduledDate = new Date(nowMs + i * 24 * 60 * 60 * 1000).toISOString();
    const jobBase: AutomatedArticleJob = {
      id: `job-${i + 1}-${urlSlug.slice(0, 24)}`,
      orderIndex: i + 1,
      topicTitle,
      primaryKeyword,
      secondaryKeywords: [
        `${primaryKeyword} checklist`,
        `${primaryKeyword} examples`,
        `${matchedTool.title.toLowerCase()}`,
      ],
      searchIntent: customSeed ? "step-by-step-howto" : tpl.intent,
      kdProxyScore: tpl.kdProxy + (i % 5),
      trendSource: customSeed ? "user-seed-prompt" : tpl.trendSource,
      matchedInternalToolSlug: matchedTool.slug,
      matchedInternalToolTitle: matchedTool.title,
      status: i === 0 ? "ready-for-review" : "queued",
      completedAgents:
        i === 0
          ? [
              "website-brand-scout",
              "trend-keyword-radar",
              "topical-map-architect",
              "geo-article-writer",
              "citation-readiness-critic",
              "prism-visual-infographic",
              "arcads-hook-matrix",
              "pinterest-pin-growth",
              "linkedin-carousel-agent",
              "x-thread-agent",
            ]
          : ["website-brand-scout", "trend-keyword-radar"],
      activeAgent: i === 0 ? undefined : "topical-map-architect",
      scheduledForIso: scheduledDate,
      metaTitle,
      metaDescription,
      urlSlug,
      aeoDirectAnswer50Words,
      outlineSections,
      geoReadiness: {
        overallScore: 94,
        has50WordDirectAnswer: true,
        hasComparisonTable: true,
        hasFaqJsonLd: true,
        hasOriginalInfographics: true,
        hasInternalToolLinks: true,
        unverifiedClaimsCount: 0,
        passedGate90: true,
        improvementNotes: [],
      },
      arcadsVariations: [],
      pinterestPins: [],
      updatedAtIso: new Date().toISOString(),
    };

    jobBase.geoReadiness = scoreGeoCitationReadiness(jobBase);
    jobBase.arcadsVariations = buildArcadsSocialPackForJob(
      jobBase,
      website,
      winnerFormulas,
    );
    jobBase.pinterestPins = buildPinterestThreePinSuite(
      jobBase,
      website,
      winnerFormulas,
    );

    jobs.push(jobBase);
  }

  return jobs;
}
