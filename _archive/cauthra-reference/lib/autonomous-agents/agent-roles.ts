/**
 * Phase 1 Foundation: Registry of the 12 Specialized Autonomous AI Agents
 * powering Content Writing, Prism Forge Visuals, Arcads Social Variations,
 * Pinterest/LinkedIn Growth, and Closed-Loop Analytics.
 */

import type {
  AutonomousAgentId,
  AutonomousAgentRoleSpec,
  AutonomousPipelineStage,
} from "./types";

export const AUTONOMOUS_AGENT_ROLES: AutonomousAgentRoleSpec[] = [
  {
    id: "website-brand-scout",
    order: 1,
    name: "Website, Sitemap & Brand DNA Scout Agent",
    shortBadge: "01 · Brand & Site Scout",
    stage: "discovery",
    deterministicSharePercent: 95,
    estimatedTokensPerArticle: 150,
    responsibility:
      "Crawls the user's connected website URL (or internal /p/[slug] Website Builder project), extracts Brand DNA (primary/secondary hex colors, dark/light preference, site title), indexes installed tools and existing blog slugs, and prevents duplicate topic generation.",
    deterministicPreStep:
      "DOM/CSS token parser (`extractWebsiteBrand` in `lib/blog-infographic-studio/brand-source.ts`) + `sitemap.xml` / local Website Builder store scanner.",
    llmMicroPromptContract:
      "Optional 150-token JSON classification of site niche, primary audience persona, and top 3 monetization/tool callout angles.",
    inputContract: ["siteUrl", "internalBuilderSlug?", "existingSlugs[]"],
    outputContract: [
      "brandPrimaryHex",
      "brandSecondaryHex",
      "primaryNiche",
      "installedTools[]",
    ],
    qualityGateRules: [
      "Never overwrite user-customized brand hex codes without explicit confirmation.",
      "Must index existing article slugs so downstream agents never cannibalize an already-published URL.",
    ],
    fallbackBehavior:
      "Falls back to deterministic URL hostname + DoItWithAI Royal Blue (#4867FF) and Emerald (#10B981) palette.",
  },
  {
    id: "trend-keyword-radar",
    order: 2,
    name: "Trend & Low-KD Keyword Radar Agent",
    shortBadge: "02 · Trend & KD Radar",
    stage: "discovery",
    deterministicSharePercent: 85,
    estimatedTokensPerArticle: 350,
    responsibility:
      "Discovers rising search queries from Google Trends Public RSS (`https://trends.google.com/trending/rss?geo=US`), Google Autocomplete expansions, and user seed topics, scoring each candidate with a deterministic Keyword Difficulty (KD Proxy) and search intent label.",
    deterministicPreStep:
      "Fetches public trend feeds and autocomplete expansions; computes KD proxy (10–35 Easy, 36–60 Medium) based on long-tail word count, question/comparison modifiers, and topical specificity.",
    llmMicroPromptContract:
      "350-token JSON ranker that selects the top N (1–15) low-difficulty, high-conversion article topics tailored to the site's niche.",
    inputContract: ["primaryNiche", "seedTopicsOrPrompt", "targetArticleCount"],
    outputContract: [
      "queuedTopics[]",
      "primaryKeyword",
      "secondaryKeywords[]",
      "kdProxyScore",
      "searchIntent",
    ],
    qualityGateRules: [
      "Every queued topic must have a distinct primary keyword and zero overlap with existing site slugs.",
      "Prioritize topics with KD Proxy <= 35 that naturally pair with at least one internal tool or pillar guide.",
    ],
    fallbackBehavior:
      "Generates a deterministic multi-intent topic cluster (How-To Workflow, Vs. Comparison, Audit Checklist, Pillar Guide) from the user's seed prompt.",
  },
  {
    id: "topical-map-architect",
    order: 3,
    name: "Topical Map, Outline & Internal Link Architect",
    shortBadge: "03 · Outline & Link Architect",
    stage: "editorial",
    deterministicSharePercent: 80,
    estimatedTokensPerArticle: 650,
    responsibility:
      "Designs a 4–6 section H2/H3 outline where every H2 maps to a specific visual archetype (`process`, `framework`, `comparison`, `checklist`, `faq`) and weaves in verified internal links to the user's tools and sibling articles.",
    deterministicPreStep:
      "Matches topic keywords against `installedTools` and existing blog URLs; assigns section visual archetypes via `classifySectionArchetype`.",
    llmMicroPromptContract:
      "650-token structured JSON outline call returning Meta Title (<580px), Meta Description (<920px), 50-word AEO Direct Answer, and 4–6 H2 sections.",
    inputContract: ["topicTitle", "primaryKeyword", "installedTools[]"],
    outputContract: [
      "metaTitle",
      "metaDescription",
      "urlSlug",
      "aeoDirectAnswer50Words",
      "outlineSections[]",
      "matchedInternalToolSlug",
    ],
    qualityGateRules: [
      "Meta Title must be <= 60 characters (~580px); Meta Description must be 120–160 characters.",
      "Opening AEO Direct Answer must be 40–60 words with zero robotic throat-clearing.",
    ],
    fallbackBehavior:
      "Builds a 4-section structured outline (Core Framework, Step-by-Step Workflow, Side-by-Side Comparison, Frequently Asked Questions).",
  },
  {
    id: "geo-article-writer",
    order: 4,
    name: "E-E-A-T & GEO/AEO Section Writer Agent",
    shortBadge: "04 · GEO Section Writer",
    stage: "editorial",
    deterministicSharePercent: 30,
    estimatedTokensPerArticle: 3200,
    responsibility:
      "Drafts each H2 section with a 40–60 word snippet-ready lead paragraph, scannable bullet/numbered lists with bold lead-ins, comparison tables, natural human sentence burstiness, and contextual internal tool callouts.",
    deterministicPreStep:
      "Runs `stripAiClichesAndPolishRhythm` and `normalizeAndValidateSectionMarkdown` to strip AI clichés and enforce heading hierarchy.",
    llmMicroPromptContract:
      "Bounded per-section JSON markdown call (~600–800 tokens per section) with automatic 45s rate-limit cooldown between batch steps.",
    inputContract: ["outlineSection", "previousEnding", "verifiedLinks[]"],
    outputContract: ["sectionMarkdown", "extractedConceptPoints[]"],
    qualityGateRules: [
      "Zero repeated H1/H2 headings inside section bodies.",
      "Zero AI cliché openers ('In today's fast-paced digital landscape', 'Delving into').",
      "Every section must contain >= 2 explained points suitable for standalone infographic synthesis.",
    ],
    fallbackBehavior:
      "Synthesizes structured explanatory points from the outline brief and pauses queue if live provider quota is exhausted.",
  },
  {
    id: "citation-readiness-critic",
    order: 5,
    name: "AI Search Citation Radar (GEO/AEO Critic Agent)",
    shortBadge: "05 · Citation Radar QA",
    stage: "editorial",
    deterministicSharePercent: 100,
    estimatedTokensPerArticle: 0,
    responsibility:
      "Audits the drafted article for ChatGPT Search, Perplexity, and Google AI Overview citation readiness: verifies the 50-word direct answer lead, comparison table presence, FAQPage JSON-LD, internal tool links, and claim grounding.",
    deterministicPreStep:
      "100% deterministic check (`scoreGeoCitationReadiness`) consuming 0 LLM tokens.",
    llmMicroPromptContract: "None (0 tokens — pure deterministic verification).",
    inputContract: ["articleJob"],
    outputContract: ["GeoCitationReadinessReport"],
    qualityGateRules: [
      "Articles in Conditional Autopilot mode must score >= 90/100 to auto-publish; lower scores route to the Co-Pilot Review Queue.",
    ],
    fallbackBehavior: "Always executes deterministically in <5ms.",
  },
  {
    id: "prism-visual-infographic",
    order: 6,
    name: "Prism Forge 6-Layer Visual & Infographic Agent",
    shortBadge: "06 · 6-Layer Infographic Engine",
    stage: "visual",
    deterministicSharePercent: 100,
    estimatedTokensPerArticle: 0,
    responsibility:
      "Transforms every substantive article section into a standalone, brand-themed SVG/PNG infographic using our 6-Layer Agentic Visual Pipeline (Topic Intelligence, Standalone Copywriter, 48-Icon Semantic Matcher, Dynamic Bento/Timeline Solver, Procedural Shaders, and 8-Gate Visual QA Critic).",
    deterministicPreStep:
      "Runs `buildAllArticleSectionVisuals` and `runInfographicQaCritic` (`lib/blog-infographic-studio/visual-brief.ts`) at 0 LLM token cost.",
    llmMicroPromptContract: "None (0 tokens — 100% programmatic SVG AST synthesis).",
    inputContract: ["outlineSections[]", "brandTheme"],
    outputContract: ["sectionInfographics[]", "multiPagePdfDeckReady"],
    qualityGateRules: [
      "Zero title-in-body duplication (`hasTitleBodyDuplication === false`).",
      "Zero trailing cliffhanger words (`including`, `missing`, `checking`).",
      "100% distinct semantic icons across sibling cards (`assignDistinctSectionIcons`).",
      "WCAG contrast >= 4.5:1 across all text and card surfaces.",
    ],
    fallbackBehavior: "Auto-repairs any copy or geometry issue via `runInfographicQaCritic`.",
  },
  {
    id: "arcads-hook-matrix",
    order: 7,
    name: "Arcads-Style Social Hook & Variation Matrix Agent",
    shortBadge: "07 · Arcads Hook Matrix",
    stage: "social-matrix",
    deterministicSharePercent: 80,
    estimatedTokensPerArticle: 450,
    responsibility:
      "Applies the Arcads.ai creative testing methodology to generate 5 distinct scroll-stopper hook variations (`contrarian-data`, `symptom-diagnostic`, `numbered-playbook`, `before-after-vs`, `faq-direct-answer`) paired with channel-native copy and visual cards.",
    deterministicPreStep:
      "Extracts core thesis, quantified benchmarks, step sequence, and FAQ pairs from the article.",
    llmMicroPromptContract:
      "Optional 450-token JSON enrichment for custom hook angles; 100% deterministic template synthesis available at 0 tokens.",
    inputContract: ["articleJob", "websiteProfile", "winnerFormulas[]"],
    outputContract: ["arcadsVariations[]"],
    qualityGateRules: [
      "Never output generic 'New blog post is live!' captions.",
      "Every variation must open with a pattern-interrupt hook in the first 110 characters.",
      "Zero article-relative leaks ('above', 'below', 'in this post').",
    ],
    fallbackBehavior:
      "Synthesizes all 5 hook archetypes deterministically from the article's H2/H3 concept kernels.",
  },
  {
    id: "pinterest-pin-growth",
    order: 8,
    name: "Autonomous Pinterest 2:3 Visual & Board Growth Agent",
    shortBadge: "08 · Pinterest 3-Pin Agent",
    stage: "social-matrix",
    deterministicSharePercent: 95,
    estimatedTokensPerArticle: 150,
    responsibility:
      "Generates 3 visually distinct `1000×1500` (2:3) vertical Infographic Pins per article (Timeline Pin, Myth-vs-Reality Pin, Checklist Pin) with keyword-frontloaded Pin Titles, SEO descriptions, alt text, board routing, and 4-day drip scheduling.",
    deterministicPreStep:
      "Builds 3 distinct `Prism Forge` 2:3 visual configurations cycling palettes, shaders, and layouts based on the user's top-performing Winner Formula.",
    llmMicroPromptContract:
      "Optional 150-token Pinterest SEO keyword tag refinement.",
    inputContract: ["articleJob", "websiteProfile", "winnerFormulas[]"],
    outputContract: ["pinterestPins[3]"],
    qualityGateRules: [
      "All 3 Pins must use distinct layouts (`timeline`, `comparison`, `checklist`) and distinct background shaders so Pinterest algorithms treat each as fresh creative.",
      "Drip schedule must space Pins at Day 0, Day +4, and Day +8.",
    ],
    fallbackBehavior:
      "Generates all 3 vertical 2:3 Pins deterministically using `Prism Forge` SVG rendering.",
  },
  {
    id: "linkedin-carousel-agent",
    order: 9,
    name: "LinkedIn 1080×1350 PDF Carousel & Authority Post Agent",
    shortBadge: "09 · LinkedIn Carousel Agent",
    stage: "social-matrix",
    deterministicSharePercent: 95,
    estimatedTokensPerArticle: 150,
    responsibility:
      "Compiles the article's section visuals into an 8-slide `1080×1350` portrait PDF Carousel Deck paired with an executive LinkedIn post (Hook → `→` Takeaways → Tool Callout → Engagement Question).",
    deterministicPreStep:
      "Uses `exportMultiPagePdfDeck` / `build_infographic_deck.py` geometry to package all section visuals into a portrait deck.",
    llmMicroPromptContract:
      "Included in the Arcads social matrix micro-call (or 0-token deterministic builder).",
    inputContract: ["articleJob", "sectionInfographics[]"],
    outputContract: ["linkedinCarouselVariation", "pdfDeckSlideCount"],
    qualityGateRules: [
      "Slide 1 must be a bold Hook Cover; final slide must include the Brand Signature and Tool/Guide CTA.",
    ],
    fallbackBehavior: "Compiles the multi-page PDF deck directly in browser via SVG-to-print/PDF.",
  },
  {
    id: "x-thread-agent",
    order: 10,
    name: "X / Threads Visual Thread Atomizer Agent",
    shortBadge: "10 · X & Threads Atomizer",
    stage: "social-matrix",
    deterministicSharePercent: 95,
    estimatedTokensPerArticle: 100,
    responsibility:
      "Splits the article's core framework into a 5-post numbered thread (`1/5..5/5`) where Post 1 attaches the high-contrast Bento Infographic and Post 5 links to the canonical article and free tool.",
    deterministicPreStep:
      "Enforces <= 275 character bounds per post and pairs each post with its matching section visual.",
    llmMicroPromptContract: "0-token deterministic thread splitter.",
    inputContract: ["articleJob"],
    outputContract: ["threadPosts[]"],
    qualityGateRules: [
      "Every post in the thread must be <= 275 characters and stand alone without trailing ellipses.",
    ],
    fallbackBehavior: "Deterministic clause compressor.",
  },
  {
    id: "omnichannel-publisher",
    order: 11,
    name: "Omnichannel CMS & Buffer MCP Publisher Agent",
    shortBadge: "11 · CMS & Buffer Publisher",
    stage: "publishing",
    deterministicSharePercent: 100,
    estimatedTokensPerArticle: 0,
    responsibility:
      "Publishes or stages the approved article + visual pack to the user's website (auto-publishing to internal `/p/[slug]/blog`, pushing via WordPress REST API Application Passwords / Webhook, or staging in the Workspace Queue) and dispatches social posts to Buffer MCP (`mcp.buffer.com/mcp`), Postiz, or Pinterest API v5.",
    deterministicPreStep:
      "100% deterministic API/storage dispatcher respecting the campaign's Autopilot Approval Mode (`copilot-review-queue` vs `confidence-gated-90`).",
    llmMicroPromptContract: "None (0 tokens).",
    inputContract: [
      "articleJob",
      "websiteProfile",
      "socialConnections[]",
      "approvalMode",
    ],
    outputContract: ["publishedUrl", "socialDispatchReceipts[]"],
    qualityGateRules: [
      "Never auto-publish external posts if `geoReadiness.overallScore < confidenceThreshold`.",
    ],
    fallbackBehavior:
      "Saves full publication bundle in local browser Workspace Staging Queue (`localStorage`) for 1-click export.",
  },
  {
    id: "analytics-winner-loop",
    order: 12,
    name: "Closed-Loop Analytics & Winner-Clone Memory Agent",
    shortBadge: "12 · Analytics Winner Loop",
    stage: "analytics",
    deterministicSharePercent: 95,
    estimatedTokensPerArticle: 100,
    responsibility:
      "Monitors post-publish performance signals (Pinterest Save Rate, Outbound Clicks, LinkedIn CTR), identifies outperforming combinations of Hook Archetype + Prism Layout + Color Palette + Card Style, and locks them into the user's Winner Formula Memory for the next campaign.",
    deterministicPreStep:
      "Computes Save Rate (`saves / impressions`) and CTR across published variants and ranks top performers.",
    llmMicroPromptContract:
      "Optional 100-token insight note explaining why the winning combination outperformed.",
    inputContract: ["pinterestPins[]", "arcadsVariations[]", "winnerFormulas[]"],
    outputContract: ["updatedWinnerFormulas[]", "nextBatchRecommendations"],
    qualityGateRules: [
      "Only promote a visual/hook formula to Winner Memory when it outperforms the campaign median by >= 20%.",
    ],
    fallbackBehavior:
      "Allows 1-click manual or simulated Winner Formula locking in the Studio UI.",
  },
];

export function getAgentRoleById(
  id: AutonomousAgentId,
): AutonomousAgentRoleSpec {
  return (
    AUTONOMOUS_AGENT_ROLES.find((r) => r.id === id) || AUTONOMOUS_AGENT_ROLES[0]
  );
}

export function getAgentsByStage(
  stage: AutonomousPipelineStage,
): AutonomousAgentRoleSpec[] {
  return AUTONOMOUS_AGENT_ROLES.filter((r) => r.stage === stage);
}

/**
 * Computes the exact token budget and free-tier safety profile for a campaign
 * of `articleCount` (1 to 15) articles.
 */
export function calculateCampaignTokenBudget(
  articleCount: number,
  rpmCooldownSeconds = 45,
): {
  articleCount: number;
  tokensPerArticle: number;
  totalCampaignTokens: number;
  legacyUnoptimizedTokens: number;
  tokenSavingsPercent: number;
  estimatedMinutesWithCooldown: number;
  fitsGeminiFreeTierDaily: boolean;
} {
  const clamped = Math.max(1, Math.min(15, Math.round(articleCount || 1)));
  const tokensPerArticle = AUTONOMOUS_AGENT_ROLES.reduce(
    (sum, r) => sum + r.estimatedTokensPerArticle,
    0,
  );
  const totalCampaignTokens = clamped * tokensPerArticle;
  const legacyUnoptimizedTokens = clamped * 45000;
  const tokenSavingsPercent = Math.round(
    ((legacyUnoptimizedTokens - totalCampaignTokens) /
      legacyUnoptimizedTokens) *
      100,
  );
  // Each article makes ~6 bounded micro-requests spaced by rpmCooldownSeconds
  const estimatedMinutesWithCooldown = Math.max(
    1,
    Math.round((clamped * 6 * rpmCooldownSeconds) / 60),
  );
  return {
    articleCount: clamped,
    tokensPerArticle,
    totalCampaignTokens,
    legacyUnoptimizedTokens,
    tokenSavingsPercent,
    estimatedMinutesWithCooldown,
    fitsGeminiFreeTierDaily: totalCampaignTokens <= 250000,
  };
}
