/**
 * Historical & Second-Brand (`Cauthra` / `cauthra.com`) Reference Specs
 * Preserved for the private `/founder-hub` Command Center after archiving active
 * autonomous agency code into `_archive/cauthra-reference/`.
 */

export interface ArchivedAgentRoleSummary {
  id: string;
  order: number;
  name: string;
  shortBadge: string;
  stage: string;
  deterministicSharePercent: number;
  estimatedTokensPerArticle: number;
  responsibility: string;
}

export interface ArchivedPhaseRoadmapItem {
  phaseNumber: number;
  title: string;
  status: "completed" | "archived-to-cauthra";
  summary: string;
}

export const AUTONOMOUS_AGENT_ROLES: ArchivedAgentRoleSummary[] = [
  {
    id: "website-brand-scout",
    order: 1,
    name: "Website, Sitemap & Brand DNA Scout Agent",
    shortBadge: "01 · Brand & Site Scout",
    stage: "discovery",
    deterministicSharePercent: 95,
    estimatedTokensPerArticle: 150,
    responsibility:
      "Crawls connected website URLs, extracts Brand DNA (hex colors, fonts, site title), indexes installed tools and existing blog slugs, and prevents duplicate topic generation.",
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
      "Discovers rising search queries from Google Trends RSS and Autocomplete expansions, scoring each candidate with a deterministic KD proxy and search intent label.",
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
      "Designs 4–6 section H2/H3 outlines mapped to visual archetypes and weaves verified internal links to tools and sibling articles.",
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
      "Drafts H2 sections with 40–60 word snippet-ready leads, scannable lists, comparison tables, human rhythm, and contextual tool callouts.",
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
      "Audits drafted articles deterministically for ChatGPT Search, Perplexity, and Google AI Overview citation readiness.",
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
      "Transforms substantive article sections into standalone, brand-themed SVG/PNG infographics at zero LLM token cost.",
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
      "Generates 5 scroll-stopper hook variations paired with channel-native copy and visual cards.",
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
      "Generates 3 distinct 1000x1500 (2:3) vertical Infographic Pins per article with Pinterest SEO titles and descriptions.",
  },
  {
    id: "linkedin-carousel-agent",
    order: 9,
    name: "LinkedIn 1080x1350 PDF Carousel & Authority Post Agent",
    shortBadge: "09 · LinkedIn Carousel Agent",
    stage: "social-matrix",
    deterministicSharePercent: 95,
    estimatedTokensPerArticle: 150,
    responsibility:
      "Compiles section visuals into an 8-slide portrait PDF Carousel Deck paired with an executive LinkedIn post.",
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
      "Splits core frameworks into a 5-post numbered thread bounded to <= 275 characters per post.",
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
      "Archived to Brand 2 (Cauthra): confidence-gated WordPress REST API, Webhook, and social queue dispatcher.",
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
      "Archived to Brand 2 (Cauthra): monitors post-publish save/CTR signals and promotes winning creative formulas.",
  },
];

export const SIX_IMPLEMENTATION_PHASES: ArchivedPhaseRoadmapItem[] = [
  {
    phaseNumber: 1,
    title: "Phase 1: 12 Agent Roles, Contracts & Visual Rules",
    status: "archived-to-cauthra",
    summary:
      "Preserved in _archive/cauthra-reference/lib/autonomous-agents/ for Second Brand (Cauthra / cauthra.com).",
  },
  {
    phaseNumber: 2,
    title: "Phase 2: Live Sitemap Crawler & Trend Scout",
    status: "archived-to-cauthra",
    summary:
      "Preserved in _archive/cauthra-reference/lib/autonomous-agents/sitemap-trend-scout.ts; manual snapshot moved to /studio.",
  },
  {
    phaseNumber: 3,
    title: "Phase 3: Multi-Agent Batch Runner",
    status: "archived-to-cauthra",
    summary:
      "Graduated to Brand 2 (Cauthra); Brand 1 (doitwithai.tools) focuses on Flagship Manual AI SEO Content Writer (/studio/writer).",
  },
  {
    phaseNumber: 4,
    title: "Phase 4: Social Repurposing & Carousel Deck",
    status: "completed",
    summary:
      "Manual 1-Click Social Repurposing Pack & Infographic Studio V5 active inside /studio/writer.",
  },
  {
    phaseNumber: 5,
    title: "Phase 5: Auto-Publisher Separation",
    status: "archived-to-cauthra",
    summary:
      "Hands-free CMS auto-posting moved strictly to Brand 2 (Cauthra); Brand 1 provides Simple Manual Editorial Planner (/studio/planner).",
  },
  {
    phaseNumber: 6,
    title: "Phase 6: Two-Brand Clean Split (doitwithai.tools vs. Cauthra)",
    status: "completed",
    summary:
      "All 8 Second-Brand folders safely archived in _archive/cauthra-reference/ with 0 public routes and 0 bundle bloat on doitwithai.tools.",
  },
];
