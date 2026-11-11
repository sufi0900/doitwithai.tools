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
    "Standalone Root-Level Flagship Platform (/ai-content-writer) & 25-Template Hybrid AI Art Plate + Vector Infographic Studio (/tools/blog-section-infographic-generator)",
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
    id: "news-2026-11-11-venngage-hybrid-ai-infographic-studio-upgrade",
    dateIso: "2026-11-11",
    pktTimestamp: "04:35 PM PKT",
    authorAiCodename: "Aegis-Prime",
    authorAiTitle: "Founder's Master AI Strategist & Lead Ecosystem Architect",
    commitShas: ["Pushed to feat/homepage-tools-learning"],
    updateCategory: "Flagship Blueprint",
    headline:
      "Overhauled /tools/blog-section-infographic-generator into a Hybrid 3D AI Art Plate + 25 Venngage/Canva-Grade Vector Infographic Studio (Removed Person Portraits, Rebuilt Hero Showcase & Curated 25 Preview Cards)",
    detailedSummary:
      "Executed a comprehensive visual and architectural overhaul of /tools/blog-section-infographic-generator and its inline integration inside /ai-content-writer: (1) Generated and installed 4 high-resolution text-free AI 3D Art Plates in public/images/infographics/ (obsidian-glass-orbs.jpg, royal-indigo-isometric.jpg, editorial-warm-paper.jpg, emerald-data-waves.jpg) plus paper-sculpture.webp; (2) Built a 3-Layer Hybrid Composite Renderer in lib/blog-infographic-studio/canvas-renderer.ts combining AI Art Plate backdrops with 25 Venngage-inspired geometries (Interlocking Chevron Pipeline, Alternating Milestone Timeline with 56px Icon Medallions, 12-Tooth Interlocking Mechanical Gears, Winding S-Curve Road, 3D Tapered Funnel, Central-Spine Versus Battle Card, 3-Tier SaaS Matrix, Glassmorphic KPI Orbs, 2x2 Clipboard Stat Cards + Vertical Multi-Bar Chart, Horizontal Benchmark Bars, Cost vs. ROI Waterfall, 3-Ring Radial Audit Gauge, 2x2 Priority Quadrant, 3D Layered Pyramid, 3-Circle Venn Diagram, Hub & Spoke Circuit, 8-Point Checklist, TL;DR Board, Wireframe Teardown, 6-Box Cheat Sheet, and Widescreen Hero Poster with Embedded Mini Bar Chart); (3) Created lib/blog-infographic-studio/infographic-presets-and-icons.ts with 20 geometric vector icons, 6 1-click scenario presets, and 25 distinct curated showcase designs (mix of light and dark palettes) so all 25 template preview cards look like unique, realistic infographics; (4) Rebuilt HeroAnimatedInfographicShowcase.tsx to render 5 live high-DPI composite infographic canvases (zero person/founder portraits); and (5) Streamlined the left dashboard in BlogInfographicStudio.tsx to focus exclusively on Infographic Presets, Brand Logo, AI Art Plates, Spacing Density, Per-Node Vector Icons, and Palettes.",
    whatNextAiMustKnow:
      "Never add person/founder portrait controls to /tools/blog-section-infographic-generator—person portraits belong exclusively to /tools/quote-stat-testimonial-card-studio. Always preload AI art plates via preloadInfographicArtPlates() before rendering infographic canvases.",
    filesTouched: [
      "public/images/infographics/obsidian-glass-orbs.jpg",
      "public/images/infographics/royal-indigo-isometric.jpg",
      "public/images/infographics/editorial-warm-paper.jpg",
      "public/images/infographics/emerald-data-waves.jpg",
      "lib/blog-writer/canonical-state.ts",
      "lib/blog-infographic-studio/infographic-presets-and-icons.ts",
      "lib/blog-infographic-studio/canvas-renderer.ts",
      "features/blog-infographic-studio/HeroAnimatedInfographicShowcase.tsx",
      "features/blog-infographic-studio/BlogInfographicStudio.tsx",
      "features/blog-writer-studio/components/Stage4RichEditorAndScorecard.tsx",
      "app/tools/blog-section-infographic-generator/page.tsx",
      "lib/founder-hub/grand-blog-writer-blueprint.ts",
    ],
    signatureLine:
      "— Signed by: Aegis-Prime (Founder's Master AI Strategist & Lead Ecosystem Architect)",
  },
  {
    id: "news-2026-11-11-root-ai-content-writer-and-decannibalization",
    dateIso: "2026-11-11",
    pktTimestamp: "02:42 PM PKT",
    authorAiCodename: "Aegis-Prime",
    authorAiTitle: "Founder's Master AI Strategist & Lead Ecosystem Architect",
    commitShas: ["bbd27e8"],
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
    "DoItWithAI Flagship AI Content Writer Platform (/ai-content-writer) + 25-Template Hybrid Infographic Studio",
  leadArchitect:
    "Aegis-Prime (Founder's Master AI Strategist & Lead Ecosystem Architect)",
  primaryRoutes: [
    "/ai-content-writer (Single Unified Root Flagship Platform & Dashboard — Outside /tools)",
    "/tools/blog-section-infographic-generator (Standalone 25-Template Hybrid AI Art Plate + Vector Infographic Studio)",
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
  {
    id: "disc-1-venngage-hybrid-ai-infographic-architecture",
    category: "1. Hybrid AI Art Plate + 25 Venngage/Canva-Grade Vector Infographic Architecture",
    questionOrRequirement:
      "Why did /tools/blog-section-infographic-generator still show the Testimonial Card hero slider with a person portrait, why were person portrait controls in the left panel, and how do we make the 25 infographic templates look like realistic Venngage/Canva infographics instead of plain HTML boxes?",
    founderIntentSummary:
      "An infographic generator does not need person/founder photos (those belong in the Testimonial Card tool)—it only needs Brand Logo / Domain Watermark, rich visual depth, charts, timelines, gears, chevrons, vector icons, and distinct templates. Pure flat HTML/Canvas boxes look robotic unless paired with photographic/3D AI visual art plates and authentic infographic geometries.",
    architecturalDecision:
      "1. Removed all person/founder portrait UI from HeroAnimatedInfographicShowcase.tsx and BlogInfographicStudio.tsx. 2. Generated 4 custom 3D AI Art Plates (obsidian-glass-orbs, royal-indigo-isometric, editorial-warm-paper, emerald-data-waves) and built a 3-Layer Hybrid Composite Engine in canvas-renderer.ts that composites AI Art Plates underneath 25 Venngage-grade geometries with 20 geometric vector icon medallions. 3. Created TEMPLATE_CURATED_SHOWCASE_DATA so all 25 template preview cards display distinct light/dark palettes and realistic industry data.",
    connectedToolsOrFiles: [
      "lib/blog-infographic-studio/infographic-presets-and-icons.ts",
      "lib/blog-infographic-studio/canvas-renderer.ts",
      "features/blog-infographic-studio/HeroAnimatedInfographicShowcase.tsx",
      "features/blog-infographic-studio/BlogInfographicStudio.tsx",
    ],
    signedBy:
      "Aegis-Prime (Founder's Master AI Strategist & Lead Ecosystem Architect)",
  },
];

export const BLOG_INFOGRAPHIC_25_TEMPLATES: BlogInfographicTemplateSpec[] = [
  { id: 1, slug: "horizontal-step-pipeline", name: "Horizontal Chevron Strategy Pipeline", family: "Process & Step Flows", bestForSectionType: "How-To Steps & Strategy Workflows", editableFields: "Title, Subtitle, 4–5 Interlocking Chevrons, Vector Icons, Drop-Down Callout Cards" },
  { id: 2, slug: "vertical-numbered-roadmap", name: "Alternating Milestone Timeline", family: "Process & Step Flows", bestForSectionType: "Historical Milestones & Roadmaps", editableFields: "Header, Central Spine, 56px Vector Icon Medallions, Left/Right Cards" },
  { id: 3, slug: "circular-growth-flywheel", name: "Interlocking Growth Gears System", family: "Process & Step Flows", bestForSectionType: "Compound Loops, Mindsets & Flywheels", editableFields: "4–5 12-Tooth Mechanical Gears, Center Icons, Alternating Callout Columns" },
  { id: 4, slug: "zigzag-journey-path", name: "Winding S-Curve Journey Roadmap", family: "Process & Step Flows", bestForSectionType: "Onboarding & Transformation Guides", editableFields: "Dashed S-Curve Highway, 4–6 Pin Medallions, Metrics Badges, Action Cards" },
  { id: 5, slug: "conversion-funnel-breakdown", name: "3D Tapered Conversion & SEO Funnel", family: "Process & Step Flows", bestForSectionType: "TOFU / MOFU / BOFU Strategy Sections", editableFields: "4–5 Tapered Funnel Stages, Conversion %, Right-Side Detail Callouts" },
  { id: 6, slug: "two-column-versus-card", name: "Central-Spine Versus Battle Card", family: "Comparison & Versus", bestForSectionType: "Platform A vs. Platform B Comparisons", editableFields: "Contender Headers, Central Icon Medallions, Left Winner vs Right Legacy Cards" },
  { id: 7, slug: "three-tier-feature-matrix", name: "3-Column SaaS Feature Matrix", family: "Comparison & Versus", bestForSectionType: "Software & Pricing Comparisons", editableFields: "3 Tier Headers (1 Highlighted Winner), Feature Rows, Status Check Badges" },
  { id: 8, slug: "before-after-transformation", name: "Before vs. After Impact Split Card", family: "Comparison & Versus", bestForSectionType: "Case Studies & Optimization Results", editableFields: "Old Way Pain Points (Red), New Way Wins (Emerald), Delta KPI Badges" },
  { id: 9, slug: "pros-and-cons-dual-grid", name: "Pros & Cons Executive Grid", family: "Comparison & Versus", bestForSectionType: "Product Reviews & Trade-Off Analysis", editableFields: "Dual Tinted Containers, 4–6 Pros & Cons Cards, Vector Icon Medallions" },
  { id: 10, slug: "dos-and-donts-board", name: "Best Practices: Do's vs. Don'ts Board", family: "Comparison & Versus", bestForSectionType: "Mistakes to Avoid & Guidelines", editableFields: "Green Do's Column, Red Don'ts Column, Vector Icons, Metric Tags" },
  { id: 11, slug: "bento-four-kpi-grid", name: "Glassmorphic KPI Orbs & Callouts", family: "Data, KPI & Stat Callouts", bestForSectionType: "Executive Q3/Q4 Performance & KPIs", editableFields: "4 Glowing Circular KPI Orbs, Big Metric Numbers, Side Context Cards" },
  { id: 12, slug: "hero-stat-three-takeaways", name: "2x2 Stat Cards + Vertical Multi-Bar Chart", family: "Data, KPI & Stat Callouts", bestForSectionType: "Customer Research & Survey Findings", editableFields: "4 Left Clipboard Stat Cards + Right Vertical Multi-Bar Chart Panel" },
  { id: 13, slug: "horizontal-benchmark-bars", name: "Horizontal Performance Benchmark Bars", family: "Data, KPI & Stat Callouts", bestForSectionType: "Speed, ROI & Score Comparisons", editableFields: "4–6 Labeled Progress Tracks, Gradient Fill Bars, Numeric Value Pills" },
  { id: 14, slug: "cost-roi-savings-breakdown", name: "Cost vs. ROI Waterfall Breakdown", family: "Data, KPI & Stat Callouts", bestForSectionType: "Budgeting & Financial Breakdowns", editableFields: "Stepped Waterfall Columns, Connector Arrows, Net ROI Callouts" },
  { id: 15, slug: "five-metric-scorecard", name: "3-Ring Radial Audit Gauge + Pillars", family: "Data, KPI & Stat Callouts", bestForSectionType: "Core Web Vitals & Technical SEO Audits", editableFields: "Left 3-Ring Concentric Gauge (98/100) + Right 4–5 Pillar Score Cards" },
  { id: 16, slug: "two-by-two-priority-quadrant", name: "2x2 Impact vs. Effort Quadrant", family: "Frameworks & Pyramids", bestForSectionType: "Prioritization & Strategy Frameworks", editableFields: "X/Y Axis Crosshairs, 4 Color-Tinted Quadrants, Vector Icon Cards" },
  { id: 17, slug: "three-tier-authority-pyramid", name: "3D Layered Hierarchy Pyramid", family: "Frameworks & Pyramids", bestForSectionType: "Foundational vs. Advanced Concepts", editableFields: "Left 3–4 Tier Trapezoid Pyramid + Right Connected Detail Callouts" },
  { id: 18, slug: "three-circle-venn-synergy", name: "3-Circle Venn Synergy + 4 Callouts", family: "Frameworks & Pyramids", bestForSectionType: "Core Intersection Concepts (SEO + UX + AI)", editableFields: "Center 3 Overlapping Circles (WIN Core) + 4 Corner Callout Cards" },
  { id: 19, slug: "hub-and-spoke-architecture", name: "Hub-and-Spoke Topic Cluster Circuit", family: "Frameworks & Pyramids", bestForSectionType: "System Architecture & Internal Linking Maps", editableFields: "Central CORE Hub Ring + 4–6 Connected Spoke Cards with Icons" },
  { id: 20, slug: "actionable-audit-checklist", name: "2-Column Actionable Launch Checklist", family: "Checklists & Cheat Sheets", bestForSectionType: "Pre-Publish & Implementation Checklists", editableFields: "4–8 Verified Checkmark Cards, Priority Badges, Vector Icons" },
  { id: 21, slug: "five-point-tldr-summary", name: "Executive TL;DR Takeaway Board", family: "Checklists & Cheat Sheets", bestForSectionType: "Top-of-Article Key Takeaways & Summaries", editableFields: "Left Hero KPI Card + Right Stacked Executive Takeaway Rows" },
  { id: 22, slug: "anatomy-annotated-breakdown", name: "Annotated Page Wireframe Teardown", family: "Checklists & Cheat Sheets", bestForSectionType: "Landing Page & Article Structural Teardowns", editableFields: "Center Browser Mockup Wireframe + Left/Right Pointer Callout Cards" },
  { id: 23, slug: "myth-vs-reality-buster", name: "Common Myths vs. Proven Reality", family: "Checklists & Cheat Sheets", bestForSectionType: "Debunking Misconceptions & FAQ Sections", editableFields: "Left Red Myths Column vs Right Emerald Facts Column" },
  { id: 24, slug: "quick-reference-cheat-sheet", name: "6-Box Quick Reference Cheat Sheet", family: "Checklists & Cheat Sheets", bestForSectionType: "Formulas, Prompts & Command Reference", editableFields: "3x2 Grid of Categorized Reference Cards with Top Accent Bars & Icons" },
  { id: 25, slug: "widescreen-blog-hero-og-banner", name: "Widescreen Hero Poster + Mini Bar Chart", family: "Hero, OG & Quote Cards", editableFields: "Left Hero Headline & 3 KPI Pills + Right Embedded Vertical Bar Chart Card", bestForSectionType: "Article Featured Image & Social Share Card" },
];

export const GRAND_BLOG_WRITER_IMPLEMENTATION_PHASES: GrandBlogImplementationPhase[] = [
  {
    id: "gbw-phase-10",
    phaseNumber: 10,
    title: "Phase 10 (Updated): Root-Level Flagship Migration (/ai-content-writer) & Hybrid 25-Template Infographic Studio",
    status: "Completed & Live",
    completed: true,
    completedByAi: "Aegis-Prime (Founder's Master AI Strategist & Lead Ecosystem Architect)",
    commitSha: "feat/homepage-tools-learning",
    estimatedTokenCost: "0 LLM Tokens (Root SSR Platform + Hybrid AI Art Plate Canvas/SVG Engine)",
    primaryObjective:
      "Place the unified AI Content Writer, Blog Writer & Article Studio directly at the root domain route /ai-content-writer (outside /tools), remove all duplicate writer tools from /tools, and upgrade /tools/blog-section-infographic-generator with 4 AI 3D Art Plates, 20 vector icon medallions, and 25 Venngage/Canva-grade infographic geometries.",
    upstreamConnection:
      "Mounts GrandBlogWriterStudio inside root app/ai-content-writer/page.tsx and connects Stage 4 inline H2 canvases to the upgraded Hybrid Composite Renderer.",
    keyDeliverables: [
      "✅ Created standalone root-level platform & dashboard route at app/ai-content-writer/page.tsx (https://doitwithai.tools/ai-content-writer)",
      "✅ Upgraded /tools/blog-section-infographic-generator with 4 AI 3D Art Plates, 20 geometric vector icons, 25 curated showcase previews, and 5-slide live composite hero showcase (zero person portraits)",
      "✅ Excluded duplicate writer slugs from /tools via EXCLUDED_FROM_TOOLS_CATALOG_SLUGS in features/tool-catalog/catalog.ts",
    ],
    downstreamHandoff:
      "100% of content/blog/article writing intent resolves to /ai-content-writer and inline H2 visuals use the Hybrid AI Art Plate + 25-Template Infographic Engine.",
    copyPasteAiPrompt:
      "Always push to branch feat/homepage-tools-learning. The flagship AI Content Writer lives at root /ai-content-writer (app/ai-content-writer/page.tsx) and uses the Hybrid AI Art Plate + 25-Template Infographic Studio.",
    connectedEcosystemTools: [
      "blog-section-infographic-generator",
    ],
    targetFiles: [
      "app/ai-content-writer/page.tsx",
      "app/tools/blog-section-infographic-generator/page.tsx",
      "lib/blog-infographic-studio/canvas-renderer.ts",
      "lib/blog-infographic-studio/infographic-presets-and-icons.ts",
    ],
    signedBy: "Aegis-Prime (Founder's Master AI Strategist & Lead Ecosystem Architect)",
  },
];
