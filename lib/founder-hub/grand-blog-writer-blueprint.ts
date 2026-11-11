export interface MultiAiAgentProfile {
  codename: string;
  officialTitle: string;
  badgeColor: string;
  primaryResponsibilities: string[];
  signatureFormat: string;
}

export interface DailyMultiAiUpdateEntry {
  id: string;
  dateIso: string;
  pktTimestamp: string;
  authorAiCodename: string;
  authorAiTitle: string;
  commitShas: string[];
  updateCategory:
    | "De-Cannibalization & Root Migration"
    | "Permanent Branch Policy"
    | "Flagship Blueprint"
    | "Phase Execution"
    | "Tool Catalog Parity"
    | "Feeder Tools Sprint"
    | "Core Web Vitals";
  headline: string;
  detailedSummary: string;
  whatNextAiMustKnow: string;
  filesTouched: string[];
  signatureLine: string;
}

export interface FounderBlogDiscussionTopic {
  id: string;
  category: string;
  questionOrRequirement: string;
  founderIntentSummary: string;
  architecturalDecision: string;
  connectedToolsOrFiles: string[];
  signedBy: string;
}

export interface GrandBlogImplementationPhase {
  id: string;
  phaseNumber: number;
  title: string;
  status: "Completed & Live" | "In Progress" | "Ready for Execution";
  completed: boolean;
  completedByAi?: string;
  commitSha?: string;
  estimatedTokenCost: string;
  primaryObjective: string;
  upstreamConnection: string;
  keyDeliverables: string[];
  downstreamHandoff: string;
  copyPasteAiPrompt: string;
  connectedEcosystemTools: string[];
  targetFiles: string[];
  signedBy: string;
}

export interface BlogInfographicTemplateSpec {
  id: number;
  slug: string;
  name: string;
  family:
    | "Process & Step Flows"
    | "Comparison & Versus"
    | "Data, KPI & Stat Callouts"
    | "Frameworks & Pyramids"
    | "Checklists & Cheat Sheets"
    | "Hero, OG & Quote Cards";
  bestForSectionType: string;
  editableFields: string;
}

export const PERMANENT_GIT_BRANCH_POLICY = {
  mandatoryBranch: "feat/homepage-tools-learning",
  branchUrl:
    "https://github.com/sufi0900/doitwithai.tools/tree/feat/homepage-tools-learning",
  forbiddenBranches: ["main", "master"],
  ruleSummary:
    "PERMANENT RULE FOR ALL AI CODING AGENTS: Never push commits directly to main or master. All code, route migrations, bug fixes, and documentation updates MUST be pushed exclusively to feat/homepage-tools-learning so the Founder can verify routes, slugs, and SEO before merging to production.",
  signedBy:
    "Aegis-Prime (Founder's Master AI Strategist & Lead Ecosystem Architect)",
};

export const MASTER_AI_ARCHITECT_IDENTITY: MultiAiAgentProfile = {
  codename: "Aegis-Prime",
  officialTitle: "Founder's Master AI Strategist & Lead Ecosystem Architect",
  badgeColor: "indigo",
  primaryResponsibilities: [
    "Master product strategy, SEO de-cannibalization architecture, and 10-phase roadmapping with Founder Sufian Mustafa",
    "Standalone Root-Level Flagship Platform (/ai-content-writer) & 25-Template Canva/Napkin Visual Studio (/tools/blog-section-infographic-generator)",
    "Enforcement of the Permanent Staging Branch Rule (feat/homepage-tools-learning) and zero-duplicate /tools catalog hygiene",
    "Multi-AI coordination protocol, upstream/downstream phase contracts, and Daily News & Updates Ledger in /founder-hub",
  ],
  signatureFormat:
    "— Signed by: Aegis-Prime (Founder's Master AI Strategist & Lead Ecosystem Architect)",
};

export const MULTI_AI_NAMING_AND_DAILY_READ_PROTOCOL = {
  ruleTitle:
    "Mandatory Multi-AI Branch Rule (feat/homepage-tools-learning), Identity & De-Cannibalization Protocol",
  rules: [
    "0. 🚨 PERMANENT BRANCH RULE (NEVER PUSH TO MAIN/MASTER): Every AI coding expert MUST push all commits exclusively to the branch 'feat/homepage-tools-learning' (https://github.com/sufi0900/doitwithai.tools/tree/feat/homepage-tools-learning). Direct pushes to main or master are strictly forbidden.",
    "1. 🚨 STANDALONE ROOT PLATFORM (/ai-content-writer OUTSIDE /tools): Our Flagship AI Content Writer is NOT a /tools/* item. It lives at the root domain route '/ai-content-writer' (app/ai-content-writer/page.tsx) and unifies AI Content Writer, AI Blog Writer, and AI Article Writer on ONE single canonical URL. Never re-add ai-content-writer, ai-blog-writer, ai-article-writer, or ai-blog-article-writer to /tools!",
    "2. READ FIRST DAILY: Every AI coding expert MUST read docs/GRAND_AI_BLOG_WRITER_MASTER_BLUEPRINT.md and inspect the Daily Multi-AI News & Updates Broadcast Feed in /founder-hub BEFORE writing or modifying any code.",
    "3. UNIQUE AI CODENAME & SIGNATURE: Aegis-Prime is the Founder's Master AI Strategist & Lead Ecosystem Architect. Nova-Forge is the Flagship Studio Persistence & Workspace Engineer. Apex-CWV is the Technical SEO & Core Web Vitals Agent. Every AI must sign all commits and /founder-hub updates.",
  ],
};

export const DAILY_MULTI_AI_NEWS_FEED: DailyMultiAiUpdateEntry[] = [
  {
    id: "news-2026-11-11-root-ai-content-writer-and-decannibalization",
    dateIso: "2026-11-11",
    pktTimestamp: "02:42 PM PKT",
    authorAiCodename: "Aegis-Prime",
    authorAiTitle: "Founder's Master AI Strategist & Lead Ecosystem Architect",
    commitShas: ["Pushed to feat/homepage-tools-learning"],
    updateCategory: "De-Cannibalization & Root Migration",
    headline:
      "Migrated Flagship AI Content Writer to Root Domain (/ai-content-writer), Eliminated All 4 Duplicate Writer Tools from /tools & Enforced feat/homepage-tools-learning Branch Rule",
    detailedSummary:
      "Investigated the Founder's screenshot showing 4 overlapping writer tools inside /tools (ai-blog-article-writer, ai-content-writer, ai-blog-writer, ai-article-writer). Executed a complete Root-Cause De-Cannibalization & Root Platform Migration: (1) Created standalone root-level flagship platform route app/ai-content-writer/page.tsx (https://doitwithai.tools/ai-content-writer) with a SaaS Dashboard Bar, Cloud Sync/Sign-In panel, and unified SEO targeting for 'AI Content Writer', 'AI Blog Writer', and 'AI Article Writer' on ONE canonical URL; (2) Excluded all 4 writer slugs, the legacy 8-template blog-to-infographic-generator, and the 10 duplicate /tools/*-agent wrappers from /tools via EXCLUDED_FROM_TOOLS_CATALOG_SLUGS in features/tool-catalog/catalog.ts and features/guides/content-routes.mjs; (3) Replaced /tools/ai-content-writer, /tools/ai-blog-writer, /tools/ai-article-writer, /tools/ai-blog-article-writer, and /agents/autonomous-blog-writer-agent with 308 permanentRedirect('/ai-content-writer'); and (4) Enforced the permanent rule that all AI agents push exclusively to feat/homepage-tools-learning.",
    whatNextAiMustKnow:
      "CRITICAL: (1) Always push to branch 'feat/homepage-tools-learning' (NEVER push to main/master). (2) The Flagship AI Content Writer lives at root '/ai-content-writer' (app/ai-content-writer/page.tsx) — NEVER register content/blog/article writers inside /tools!",
    filesTouched: [
      "app/ai-content-writer/page.tsx",
      "app/tools/ai-content-writer/page.tsx",
      "app/tools/ai-blog-writer/page.tsx",
      "app/tools/ai-article-writer/page.tsx",
      "app/tools/ai-blog-article-writer/page.tsx",
      "app/tools/blog-to-infographic-generator/page.tsx",
      "app/agents/autonomous-blog-writer-agent/page.tsx",
      "features/tool-catalog/catalog.ts",
      "features/guides/content-routes.mjs",
      "docs/GRAND_AI_BLOG_WRITER_MASTER_BLUEPRINT.md",
      "lib/founder-hub/grand-blog-writer-blueprint.ts",
    ],
    signatureLine:
      "— Signed by: Aegis-Prime (Founder's Master AI Strategist & Lead Ecosystem Architect)",
  },
];

export const GRAND_BLOG_WRITER_EXECUTIVE_SUMMARY = {
  flagshipTitle:
    "DoItWithAI Flagship AI Content Writer Platform (/ai-content-writer) + 25-Template Visual Studio",
  leadArchitect:
    "Aegis-Prime (Founder's Master AI Strategist & Lead Ecosystem Architect)",
  primaryRoutes: [
    "/ai-content-writer (Single Unified Root Flagship Platform & Dashboard — Outside /tools)",
    "/tools/blog-section-infographic-generator (Standalone 25-Template Canva/Napkin Visual Studio)",
  ],
  targetKeywords: [
    {
      keyword: "ai content writer",
      volume: "18,100/mo",
      kd: 38,
      intent: "Unified on /ai-content-writer",
    },
    {
      keyword: "ai blog writer",
      volume: "14,800/mo",
      kd: 34,
      intent: "Unified on /ai-content-writer",
    },
    {
      keyword: "ai article writer",
      volume: "12,100/mo",
      kd: 31,
      intent: "Unified on /ai-content-writer",
    },
    {
      keyword: "free ai blog post generator",
      volume: "5,400/mo",
      kd: 21,
      intent: "Unified on /ai-content-writer",
    },
    {
      keyword: "ai text to infographic generator for blogs",
      volume: "2,900/mo",
      kd: 14,
      intent: "Targeted on /tools/blog-section-infographic-generator",
    },
  ],
  totalOrchestratedTools: 62,
  deterministicZeroTokenTools: 47,
  llmPassesPerFullBlog:
    "2 Structured JSON Passes (~3,500–5,500 tokens total via 4-Tier Failover)",
  localStorageEngine:
    "IndexedDB (DoItWithAI_BlogStudio_DB · 500MB+ browser capacity) + .JSON & Master .ZIP Export",
};

export const FOUNDER_GRAND_BLOG_WRITER_DISCUSSION_RECORD: FounderBlogDiscussionTopic[] = [
  {
    id: "disc-0-root-platform-and-branch-policy",
    category: "0. Root-Level Platform (/ai-content-writer), Zero /tools Duplication & Staging Branch Rule",
    questionOrRequirement:
      "Why were 4 separate content/blog/article writer tools showing inside /tools? Remove all duplicate writer tools from /tools, place our unified AI Content Writer directly at the root domain (/ai-content-writer) as a standalone user dashboard/platform, and push all work to feat/homepage-tools-learning.",
    founderIntentSummary:
      "AI Content Writer, AI Blog Writer, and AI Article Writer share the exact same user intent. Having 4 tools in /tools causes severe keyword cannibalization. Moreover, our AI Content Writer is not a small single-task tool—it is our flagship SaaS platform and user dashboard that belongs directly under the root domain (doitwithai.tools/ai-content-writer), outside /tools. All AI pushes must go to feat/homepage-tools-learning first so routes and slugs are verified before production.",
    architecturalDecision:
      "1. Built standalone root route app/ai-content-writer/page.tsx (doitwithai.tools/ai-content-writer) unifying AI Content Writer, AI Blog Writer, and AI Article Writer on ONE canonical page with a SaaS Dashboard header & Sign-In/Cloud Sync bar. 2. Excluded ai-content-writer, ai-blog-writer, ai-article-writer, ai-blog-article-writer, blog-to-infographic-generator, and the 10 duplicate /tools/*-agent wrappers from /tools via EXCLUDED_FROM_TOOLS_CATALOG_SLUGS in features/tool-catalog/catalog.ts. 3. Converted all old /tools writer routes into 308 permanentRedirect('/ai-content-writer'). 4. Enforced feat/homepage-tools-learning as the mandatory branch for all AI agents.",
    connectedToolsOrFiles: [
      "app/ai-content-writer/page.tsx",
      "features/tool-catalog/catalog.ts",
      "features/guides/content-routes.mjs",
      "docs/GRAND_AI_BLOG_WRITER_MASTER_BLUEPRINT.md",
    ],
    signedBy:
      "Aegis-Prime (Founder's Master AI Strategist & Lead Ecosystem Architect)",
  },
];

export const BLOG_INFOGRAPHIC_25_TEMPLATES: BlogInfographicTemplateSpec[] = [
  { id: 1, slug: "horizontal-step-pipeline", name: "Horizontal 4-Step Process Pipeline", family: "Process & Step Flows", bestForSectionType: "How-To Steps & Workflows", editableFields: "Title, Subtitle, 4–6 Step Badges, Step Titles, Step Descriptions, Accent Color" },
  { id: 2, slug: "vertical-numbered-roadmap", name: "Vertical Milestone Roadmap", family: "Process & Step Flows", bestForSectionType: "Implementation Phases & Timelines", editableFields: "Header, Phase Tags, Milestone Titles, Deliverables List, Footer Note" },
  { id: 3, slug: "circular-growth-flywheel", name: "4-Stage Growth Flywheel Diagram", family: "Process & Step Flows", bestForSectionType: "Compound Loops & Flywheels", editableFields: "Center Core Label, 4 Orbit Nodes, Arrow Captions, Theme Palette" },
  { id: 4, slug: "zigzag-journey-path", name: "Zig-Zag Customer / Reader Journey", family: "Process & Step Flows", bestForSectionType: "Onboarding & Transformation Guides", editableFields: "5 Touchpoints, Metrics Badges, Action Labels" },
  { id: 5, slug: "conversion-funnel-breakdown", name: "4-Tier Conversion & SEO Funnel", family: "Process & Step Flows", bestForSectionType: "TOFU / MOFU / BOFU Strategy Sections", editableFields: "4 Funnel Stages, Conversion %, Key Tactics per Tier" },
  { id: 6, slug: "two-column-versus-card", name: "Head-to-Head Versus Battle Card", family: "Comparison & Versus", bestForSectionType: "Tool A vs. Tool B Comparisons", editableFields: "Contender A/B Names, 5 Criteria Rows, Winner Badges, Verdict Footer" },
  { id: 7, slug: "three-tier-feature-matrix", name: "3-Option Comparison Matrix Table", family: "Comparison & Versus", bestForSectionType: "Software & Pricing Comparisons", editableFields: "3 Column Headers, 6 Feature Rows, Status Icons (✓/✗/⚡), Best Value Tag" },
  { id: 8, slug: "before-after-transformation", name: "Before vs. After Impact Split Card", family: "Comparison & Versus", bestForSectionType: "Case Studies & Optimization Results", editableFields: "Old Way Pain Points (Red), New Way Wins (Emerald), Delta KPI Badge" },
  { id: 9, slug: "pros-and-cons-dual-grid", name: "Pros & Cons Executive Grid", family: "Comparison & Versus", bestForSectionType: "Product Reviews & Trade-Off Analysis", editableFields: "Product Title, 5 Pros, 5 Cons, Bottom-Line Rating Score" },
  { id: 10, slug: "dos-and-donts-board", name: "Best Practices: Do's vs. Don'ts Board", family: "Comparison & Versus", bestForSectionType: "Mistakes to Avoid & Guidelines", editableFields: "4 Green Do's with Icons, 4 Red Don'ts with Icons, Pro Tip Banner" },
  { id: 11, slug: "bento-four-kpi-grid", name: "4-Card Bento KPI & Metric Callout", family: "Data, KPI & Stat Callouts", bestForSectionType: "Key Statistics & Benchmark Sections", editableFields: "4 Big Metric Numbers, Trend Arrows (+%), Context Captions, Source Citation" },
  { id: 12, slug: "hero-stat-three-takeaways", name: "Spotlight Stat + 3 Key Insights", family: "Data, KPI & Stat Callouts", bestForSectionType: "Industry Research & Survey Findings", editableFields: "Primary Giant Percentage/Number, 3 Supporting Bullet Cards, Source URL" },
  { id: 13, slug: "horizontal-benchmark-bars", name: "Horizontal Performance Bar Chart", family: "Data, KPI & Stat Callouts", bestForSectionType: "Speed, ROI & Score Comparisons", editableFields: "Chart Title, 5 Labeled Bars, Numeric Values, Unit Suffix, Highlight Bar" },
  { id: 14, slug: "cost-roi-savings-breakdown", name: "Cost vs. ROI Savings Calculator Card", family: "Data, KPI & Stat Callouts", bestForSectionType: "Budgeting & Financial Breakdowns", editableFields: "Baseline Cost, Optimized Cost, Net Savings, Time Saved, Payback Period" },
  { id: 15, slug: "five-metric-scorecard", name: "5-Pillar Audit Scorecard", family: "Data, KPI & Stat Callouts", bestForSectionType: "SEO, Performance & Quality Audits", editableFields: "Overall Score Ring (0–100), 5 Sub-Pillar Scores, Status Pills" },
  { id: 16, slug: "two-by-two-priority-quadrant", name: "2x2 Impact vs. Effort Quadrant", family: "Frameworks & Pyramids", bestForSectionType: "Prioritization & Strategy Frameworks", editableFields: "X/Y Axis Labels, 4 Quadrant Titles (Quick Wins, Big Bets, etc.), Item Pills" },
  { id: 17, slug: "three-tier-authority-pyramid", name: "3-Tier Strategy Hierarchy Pyramid", family: "Frameworks & Pyramids", bestForSectionType: "Foundational vs. Advanced Concepts", editableFields: "Foundation Layer, Execution Layer, Apex Layer, Side Annotations" },
  { id: 18, slug: "three-circle-venn-synergy", name: "3-Pillar Synergy Overlap Diagram", family: "Frameworks & Pyramids", bestForSectionType: "Core Intersection Concepts (e.g. SEO + UX + AI)", editableFields: "3 Outer Pillar Titles + Bullets, Center Sweet-Spot Label" },
  { id: 19, slug: "hub-and-spoke-architecture", name: "Hub-and-Spoke Topic Cluster Map", family: "Frameworks & Pyramids", bestForSectionType: "System Architecture & Internal Linking Maps", editableFields: "Center Pillar Node, 6 Connected Spoke Nodes, Connection Labels" },
  { id: 20, slug: "actionable-audit-checklist", name: "8-Point Actionable Launch Checklist", family: "Checklists & Cheat Sheets", bestForSectionType: "Pre-Publish & Implementation Checklists", editableFields: "Checklist Title, 8 Checkboxes with Labels & Priority Tags, Completion Badge" },
  { id: 21, slug: "five-point-tldr-summary", name: "Executive 5-Point TL;DR Takeaway Card", family: "Checklists & Cheat Sheets", bestForSectionType: "Top-of-Article Key Takeaways & Summaries", editableFields: "Header Badge, 5 Numbered Key Takeaways, Reading Time Pill" },
  { id: 22, slug: "anatomy-annotated-breakdown", name: "Anatomy of a High-Converting Page", family: "Checklists & Cheat Sheets", bestForSectionType: "Structural & Template Teardowns", editableFields: "Central Wireframe Box, 6 Numbered Callout Pointers & Explanations" },
  { id: 23, slug: "myth-vs-reality-buster", name: "3 Common Myths vs. Proven Reality", family: "Checklists & Cheat Sheets", bestForSectionType: "Debunking Misconceptions & FAQ Sections", editableFields: "3 Myth Badges (Strikethrough), 3 Verified Fact Cards, Evidence Note" },
  { id: 24, slug: "quick-reference-cheat-sheet", name: "6-Box Quick Reference Cheat Sheet", family: "Checklists & Cheat Sheets", bestForSectionType: "Formulas, Prompts & Command Reference", editableFields: "6 Categorized Mini-Cards with Copyable Formula/Rule Snippets" },
  { id: 25, slug: "widescreen-blog-hero-og-banner", name: "Widescreen 16:9 Blog Hero & 1200x630 OG Banner", family: "Hero, OG & Quote Cards", bestForSectionType: "Article Featured Image & Social Share Card", editableFields: "Category Pill, H1 Title, Author Badge, Read Time, Visual Metric Preview" },
];

export const GRAND_BLOG_WRITER_IMPLEMENTATION_PHASES: GrandBlogImplementationPhase[] = [
  {
    id: "gbw-phase-10",
    phaseNumber: 10,
    title: "Phase 10 (Updated): Root-Level Flagship Migration (/ai-content-writer) & Complete /tools De-Cannibalization",
    status: "Completed & Live",
    completed: true,
    completedByAi: "Aegis-Prime (Founder's Master AI Strategist & Lead Ecosystem Architect)",
    commitSha: "feat/homepage-tools-learning",
    estimatedTokenCost: "0 LLM Tokens (Root SSR Platform + 308 Redirects + Catalog Filter)",
    primaryObjective:
      "Place the unified AI Content Writer, Blog Writer & Article Studio directly at the root domain route /ai-content-writer (outside /tools), remove all 4 duplicate writer tools and 10 duplicate agent wrappers from /tools, and enforce feat/homepage-tools-learning as the permanent staging branch.",
    upstreamConnection:
      "Mounts GrandBlogWriterStudio inside root app/ai-content-writer/page.tsx and filters features/tool-catalog/catalog.ts.",
    keyDeliverables: [
      "✅ Created standalone root-level platform & dashboard route at app/ai-content-writer/page.tsx (https://doitwithai.tools/ai-content-writer)",
      "✅ Excluded ai-content-writer, ai-blog-writer, ai-article-writer, ai-blog-article-writer, blog-to-infographic-generator, and 10 duplicate agent slugs from /tools via EXCLUDED_FROM_TOOLS_CATALOG_SLUGS in features/tool-catalog/catalog.ts",
      "✅ Replaced /tools/ai-content-writer, /tools/ai-blog-writer, /tools/ai-article-writer, /tools/ai-blog-article-writer, and /agents/autonomous-blog-writer-agent with 308 permanentRedirect('/ai-content-writer')",
    ],
    downstreamHandoff:
      "100% of content/blog/article writing intent now resolves to https://doitwithai.tools/ai-content-writer with zero /tools duplication.",
    copyPasteAiPrompt:
      "Always push to branch feat/homepage-tools-learning. The flagship AI Content Writer lives at root /ai-content-writer (app/ai-content-writer/page.tsx) outside /tools.",
    connectedEcosystemTools: [
      "blog-section-infographic-generator",
    ],
    targetFiles: [
      "app/ai-content-writer/page.tsx",
      "features/tool-catalog/catalog.ts",
      "features/guides/content-routes.mjs",
    ],
    signedBy: "Aegis-Prime (Founder's Master AI Strategist & Lead Ecosystem Architect)",
  },
];
