import workbookCoreJson from "./workbook-core.json";

export interface TableSheetData {
  headers: string[];
  rows: string[][];
}

export interface FounderWorkbookCore {
  updatedAt: string;
  workbookTitle: string;
  sheets: {
    "Keyword Plan": TableSheetData;
    "Filtered Expansion Views": {
      summary: TableSheetData;
      table: TableSheetData;
    };
    "CTR & Conversion Playbook": TableSheetData;
    "2026-2027 AI Capabilities": TableSheetData;
    "Do It With AI Brand Plan": TableSheetData;
    "Existing Pages": TableSheetData;
    "GSC Daily": TableSheetData;
    "GSC Queries": TableSheetData;
    "GSC Countries": TableSheetData;
    Indexing: {
      exclusions: TableSheetData;
      timeline: TableSheetData;
    };
    "Live Audit": {
      findings: TableSheetData;
      sitemapChecks: TableSheetData;
    };
    "AI Task Queries": TableSheetData;
  };
}

export const FOUNDER_WORKBOOK_CORE = workbookCoreJson as FounderWorkbookCore;

export const MULTI_AI_COLLABORATION_PROTOCOL = {
  title: "Unified Founder & Multi-AI Command Center Protocol",
  subtitle:
    "Single Source of Truth for Sufian Mustafa (Founder) and Every AI Coding, SEO & Research Agent Working on DoItWithAI.tools",
  accessPolicy: [
    "Strictly Protected & Non-Indexable: Blocked via X-Robots-Tag (noindex, nofollow, noarchive), robots.txt Disallow, metadata robots rules, and passkey authentication.",
    "Zero Public Visibility: Never link /founder-hub in the public Header, Footer, Sitemap, or internal linking grids.",
    "Full Multi-AI Authority: Every AI agent with GitHub / repository access (Gemini, Claude Code, Cursor, Windsurf, Copilot, OpenAI) has full authority and mandatory responsibility to read AND update this Command Center.",
  ],
  agentDuties: [
    {
      step: "1. Read Before Coding",
      detail:
        "Before building a new tool, fixing a bug, or publishing a guide, inspect lib/founder-hub/data.ts, lib/founder-hub/workbook-core.json, and docs/TOOL_OPTIMIZATION_RULES.md to align with active sprint priorities and architectural guardrails.",
    },
    {
      step: "2. Follow Industrial Studio Standards",
      detail:
        "Every tool upgrade or new build must obey the 8-point Industrial Studio Standard (10–14 domain-specific templates, mathematical zero-overlap canvas gutters, architectural portrait framing, 100% male executive portraits, and 'Free AI [Tool Name]' SEO).",
    },
    {
      step: "3. Log Every Change in FOUNDER_AI_CHANGELOG",
      detail:
        "Whenever ANY AI agent adds a new tool, fixes a bug, updates API failover logic, or completes a keyword row from the 64-item plan, append a structured entry to FOUNDER_AI_CHANGELOG in lib/founder-hub/data.ts so the Founder and all subsequent AI agents have 100% visibility.",
    },
    {
      step: "4. Keep Keyword & Audit Sheets Live in Next.js",
      detail:
        "Instead of scattering external Excel files, maintain all keyword sheets, GSC audits, and status updates directly inside lib/founder-hub/workbook-core.json and workbook-large.json so they render interactively inside /founder-hub.",
    },
  ],
};

export const EXECUTIVE_KPI_CARDS = [
  {
    id: "gsc-impressions",
    label: "GSC Search Impressions (90d)",
    value: "22,522",
    subtext: "38 Clicks · 0.17% CTR · Avg Pos 45.13",
    badge: "CTR Playbook Active",
    tone: "blue",
  },
  {
    id: "master-roadmap",
    label: "Total Actionable Roadmap Items",
    value: "112",
    subtext: "64 Keyword Plan + 10 CTR + 32 Guides + 6 Brand",
    badge: "Nov 9 Batch 2",
    tone: "emerald",
  },
  {
    id: "curated-expansion",
    label: "Curated Expansion Pool",
    value: "370 Keywords",
    subtext: "88,281 Monthly Volume · 14.4% Avg KD",
    badge: "4 Strategic Views",
    tone: "purple",
  },
  {
    id: "raw-semrush-pool",
    label: "Reviewed & Raw Keyword DB",
    value: "2,621 / 3,700",
    subtext: "2,621 Deduplicated Phrases · 3,700 Raw Rows",
    badge: "15 Excel Tabs Live",
    tone: "amber",
  },
  {
    id: "live-tools-catalog",
    label: "Interactive AI Tools & Studios",
    value: "104+ Tools",
    subtext: "Connected to /do-it-ai + Portable ZIP Builder",
    badge: "Industrial Standard",
    tone: "indigo",
  },
  {
    id: "ai-failover-engine",
    label: "Multi-Key AI Failover Engine",
    value: "4-Tier Pool",
    subtext: "2x Gemini Keys + Groq Pool + OpenRouter Free Tier",
    badge: "Zero-Downtime",
    tone: "teal",
  },
];

export const WEEKLY_EXECUTION_SEQUENCE = [
  {
    window: "Week 1 (Immediate)",
    focus: "Technical SEO & Snippet CTR Fixes",
    action:
      "Fix Sanity PortableText table rendering (Merlin review & AI SEO guide) and TOC heading ID consistency. Deploy CTR Playbook titles & above-the-fold widgets on H1, Meta Description, Keyword Grouping, and Search Intent pages.",
    status: "In Progress",
  },
  {
    window: "Weeks 1–2",
    focus: "Breakout Low-KD Tools & Content Writer Cluster",
    action:
      "Build #58 SEO Content Writing Cost & Per-Article Pricing Calculator (Vol 3,600, KD 7) and #59 AI Article-to-Quiz & Assessment Test Generator (Vol 1,600, KD 14), plus #57 Grand Flagship AI Content Writer Studio (Vol 2,400, 7,200+ cluster).",
    status: "Next Up",
  },
  {
    window: "Weeks 2–3",
    focus: "Upgrade Existing High-Fit SEO Studios",
    action:
      "Upgrade AI Citation Readiness Checker (#1), Content Decay & Refresh Analyzer (#2), Semantic Entity Gap Analyzer (#4), FAQ Schema Validator (#5), and Writer.com Alternative AI Detector (#62) to full Industrial Studio standard.",
    status: "Planned",
  },
  {
    window: "Weeks 3–4",
    focus: "Publish Supporting High-Intent Guides & Brand Layers",
    action:
      "Publish #63 'Can AI Write Content That Ranks in Google? (2026 Format)', #64 'Best AI Content Writer Tools & EU AI Act Article 50 Guide', and Wave 1 of the 32 'What AI Can Do' 2026–2027 guides.",
    status: "Planned",
  },
  {
    window: "Weeks 4–12",
    focus: "Cohort Measurement, Internal Linking & AdSense RPM Loop",
    action:
      "Enforce the 3-step AdSense RPM & Session-Depth loop (Low-KD Guide -> Above-the-fold Interactive Tool -> /do-it-ai multi-step workflow) and compare 28-day GSC cohorts.",
    status: "Ongoing",
  },
];

export interface SystemArchitectureNode {
  id: string;
  title: string;
  filePaths: string[];
  role: string;
  dependencies: string[];
  whenAddingOrUpgradingTool: string[];
}

export const SYSTEM_ARCHITECTURE_DEPENDENCY_MAP: SystemArchitectureNode[] = [
  {
    id: "tools-catalog",
    title: "1. Master Tools Catalog & Registry",
    filePaths: [
      "lib/tools-catalog.js",
      "features/tool-catalog/registry.json",
      "features/guides/content-routes.mjs",
    ],
    role: "Central registry of all 104+ interactive tools, slugs, categories, icons, SEO descriptions, and legacy path redirects. Powers /tools, /tools/categories/*, /navigation, and app/sitemap.js.",
    dependencies: [
      "app/tools/page.tsx",
      "app/sitemap.js",
      "components/Header/index.tsx",
      "app/do-it-ai/page.tsx",
    ],
    whenAddingOrUpgradingTool: [
      "Register new tool slug, title (including 'Free AI ...'), category, and summary in lib/tools-catalog.js and features/tool-catalog/registry.json.",
      "Verify app/sitemap.js automatically picks up the new route via toolSitemapEntries().",
    ],
  },
  {
    id: "do-it-ai-command-center",
    title: "2. '/do-it-ai' Multi-Tool Orchestrator & Agentic Hub",
    filePaths: [
      "app/do-it-ai/page.tsx",
      "app/api/do-it-ai/route.ts",
      "features/do-it-ai/",
      "features/portable-tool-kit/PortableToolHeroBar.tsx",
    ],
    role: "Flagship 'Do It With AI' workspace where users chain multiple tools together, pass URL/article context across tools via ?tool=[slug], and run AI agent workflows.",
    dependencies: [
      "lib/ai-tools/gemini.ts",
      "lib/ai-tools/groq.ts",
      "lib/ai-tools/openrouter.ts",
      "lib/tools-catalog.js",
    ],
    whenAddingOrUpgradingTool: [
      "Include <PortableToolHeroBar /> in the tool's hero so the 'Use in Do It AI ->' button passes ?tool=[slug] seamlessly.",
      "Add a below-the-fold '/do-it-ai?tool=[slug]' workflow integration banner linking 2–3 companion tools.",
    ],
  },
  {
    id: "ai-failover-engine",
    title: "3. 4-Layer Multi-Key AI Failover & Smart Health Memory Engine",
    filePaths: [
      "lib/ai-tools/gemini.ts",
      "lib/ai-tools/groq.ts",
      "lib/ai-tools/openrouter.ts",
      "tests/ai-tools/multi-key-rotation.test.ts",
    ],
    role: "Guarantees 99.99% uptime across all AI tools with zero user-facing quota errors. Automatically rotates across multiple Gemini API keys, Gemini model fallbacks, Groq LPU keys/models, and OpenRouter free-tier models with in-memory cooldown tracking.",
    dependencies: [
      "app/api/ai-tools/[slug]/route.ts",
      "app/api/do-it-ai/route.ts",
      "app/api/ai-assistant/route.ts",
    ],
    whenAddingOrUpgradingTool: [
      "Always call callGeminiText() or callGeminiJson() from @/lib/ai-tools/gemini (never instantiate raw single-key SDK clients inside route handlers).",
      "Env vars supported on Vercel: GEMINI_API_KEY, GEMINI_API_KEY_2..5, GEMINI_API_KEYS, GROQ_API_KEY, GROQ_API_KEY_2..5, OPENROUTER_API_KEY, OPENROUTER_API_KEY_2..5.",
    ],
  },
  {
    id: "industrial-visual-studio-kit",
    title: "4. Shared Visual Studio & Portable Tool UI Kit",
    filePaths: [
      "features/tool-ui/ToolHero.tsx",
      "features/tool-ui/visualCardExport.ts",
      "features/tool-ui/UrlArticleExtractorBar.tsx",
      "features/tool-ui/ToolRunOverlay.tsx",
      "features/tool-ui/PlatformBrandIcon.tsx",
      "features/tool-ui/index.ts",
      "scripts/build-portable-tools.mjs",
    ],
    role: "Provides unified hero surfaces, URL/article extraction, canvas PNG/SVG/PDF/Clipboard export, color theme resolution (STUDIO_COLOR_THEMES), embed code modal, and offline PC App (.ZIP) packaging.",
    dependencies: [
      "features/quote-stat-testimonial-card-studio/*",
      "All visual and interactive /tools/[slug] studios",
    ],
    whenAddingOrUpgradingTool: [
      "Use exact verified module paths (@/features/portable-tool-kit/PortableToolHeroBar and @/features/tool-ui/*).",
      "Ensure default themeId is a valid StudioColorThemeId (e.g., 'royal-cobalt').",
      "Memoize fallback packs only on [input.sourceContent, input.brandDomain] so switching templates never wipes user text edits.",
    ],
  },
  {
    id: "sanity-editorial-guides",
    title: "5. Editorial Hubs, Sanity CMS & Internal Linking Grids",
    filePaths: [
      "app/ai-seo/",
      "app/ai-tools/",
      "app/ai-code/",
      "app/ai-learn-earn/",
      "app/guides/",
      "app/prompts/",
    ],
    role: "Houses informational guides, prompt libraries, and learn-and-earn tracks that capture low-KD informational queries and funnel readers into interactive tools.",
    dependencies: [
      "app/lib/sanity.js",
      "features/prompts/details.js",
    ],
    whenAddingOrUpgradingTool: [
      "Every tool page must include the 3 visually distinct internal-linking promo grids below the fold: (1) Dark Terminal Prompt Cards -> /prompts/*, (2) Editorial Magazine Blog Cards -> /guides & /ai-seo, (3) Emerald Course Cards -> /ai-learn-earn.",
    ],
  },
];

export interface ChangelogEntry {
  id: string;
  date: string;
  title: string;
  category: "Architecture & AI Failover" | "Flagship Tool Overhaul" | "SEO & H1 Optimization" | "UI / Navigation & Agents" | "Founder Command Center";
  founderRequestSummary: string;
  aiImplementationDetails: string[];
  filesTouched: string[];
  commits: string[];
  status: "Completed & Live" | "In Progress";
}

export const FOUNDER_AI_CHANGELOG: ChangelogEntry[] = [
  {
    id: "log-2026-11-09-founder-hub",
    date: "2026-11-09",
    title: "Protected Founder & Multi-AI Command Center (/founder-hub) + Full 15-Tab Excel Workbook Studio",
    category: "Founder Command Center",
    founderRequestSummary:
      "Create a protected, non-indexed route inside doitwithai.tools accessible only to the Founder (via credential gate) and AI agents with GitHub repo access. Embed all 15 sheets from the Nov 9 Batch 2 Excel workbook (including #57–#64 AI Content Writer cluster, 370 curated expansion keywords, 2,621 keyword reviews, 3,700 raw Semrush records, GSC audits, CTR playbook, 32 guides, 6 brand layers), the Industrial Tool Optimization Handbook, System Architecture & /do-it-ai dependency manual, and chronological Founder/AI work log.",
    aiImplementationDetails: [
      "Built /founder-hub with strict multi-layer bot blocking: X-Robots-Tag (noindex, nofollow, noarchive, nosnippet) in middleware.ts, Disallow in public/robots.txt, metadata robots noindex, and zero links in public navigation.",
      "Implemented passkey authentication gate (/api/founder-hub/auth) supporting FOUNDER_DASHBOARD_KEY environment variable + HTTP-only session cookie.",
      "Extracted 100% of all 15 sheets from DoItWithAI-SEO-Audit-Keyword-Plan-Updated_(1).xlsx into lib/founder-hub/workbook-core.json and workbook-large.json with interactive search, filter, sort, pagination, and 1-click CSV export.",
      "Added prominent Multi-AI Collaboration Protocol instructing all future AI agents to read and update this Command Center whenever they modify tools, fix bugs, or execute SEO sprints.",
    ],
    filesTouched: [
      "app/founder-hub/page.tsx",
      "features/founder-hub/FounderCommandCenterClient.tsx",
      "app/api/founder-hub/auth/route.ts",
      "app/api/founder-hub/large-sheets/route.ts",
      "lib/founder-hub/data.ts",
      "lib/founder-hub/workbook-core.json",
      "lib/founder-hub/workbook-large.json",
      "middleware.ts",
      "public/robots.txt",
    ],
    commits: ["Latest (Nov 9, 2026)"],
    status: "Completed & Live",
  },
  {
    id: "log-2026-11-09-multi-key-failover",
    date: "2026-11-09",
    title: "4-Tier Multi-Key AI Failover Engine (2x Gemini + Groq LPU Pool + OpenRouter Free Tier)",
    category: "Architecture & AI Failover",
    founderRequestSummary:
      "Ensure that if the primary Gemini API key hits rate limits (429), quota exhaustion, or temporary downtime, all tools automatically and smartly switch between multiple Gemini keys, Groq keys, and OpenRouter free-tier models without user delays or errors.",
    aiImplementationDetails: [
      "Upgraded lib/ai-tools/gemini.ts with multi-key discovery (GEMINI_API_KEY, GEMINI_API_KEY_2..5, GEMINI_API_KEYS) and per-(key+model) health memory cooldown map (60s for 429 rate-limit, 30m for billing/quota exhaustion, 24h for invalid key, 15s for 503 overload) + 12s per-attempt AbortSignal timeout.",
      "Upgraded lib/ai-tools/groq.ts to support multiple Groq keys and model fallbacks (llama-3.3-70b-versatile -> llama-3.1-8b-instant -> qwen/qwen3-32b).",
      "Created lib/ai-tools/openrouter.ts as Layer 4 fallback across free OpenRouter models (deepseek/deepseek-chat-v3-0324:free, meta-llama/llama-3.3-70b-instruct:free, qwen/qwen-2.5-72b-instruct:free, google/gemini-2.0-flash-exp:free, openrouter/free).",
      "Added 12 automated unit tests in tests/ai-tools/multi-key-rotation.test.ts verifying multi-key rotation, cooldown memory, and cross-provider failover.",
    ],
    filesTouched: [
      "lib/ai-tools/gemini.ts",
      "lib/ai-tools/groq.ts",
      "lib/ai-tools/openrouter.ts",
      "tests/ai-tools/multi-key-rotation.test.ts",
      ".env.example",
    ],
    commits: ["e5c28a1", "422a420"],
    status: "Completed & Live",
  },
  {
    id: "log-2026-11-09-testimonial-studio-overhaul",
    date: "2026-11-09",
    title: "Flagship Overhaul: Free AI Testimonial Card Generator (/tools/quote-stat-testimonial-card-studio)",
    category: "Flagship Tool Overhaul",
    founderRequestSummary:
      "Transform the Testimonial & Founder Quote Card Generator into an industrial-grade studio beating Senja and Aragon. Fix build errors (@/features/tool-ui barrel), eliminate gray background boxes on portraits, fix Full-Bleed Split card overlap in the hero carousel, add real-time photo/ring/arch/logo sliders, and codify all lessons in docs/TOOL_OPTIMIZATION_RULES.md.",
    aiImplementationDetails: [
      "Designed 14 bespoke templates with live miniature canvas thumbnails (TemplateThumb at 0.35x scale via useDeferredValue).",
      "Engineered mathematical non-overlapping column layout (colGap >= 32px) and bottom-up vertical stack budgeting in cardRenderer.ts.",
      "Built Architectural Portrait Framing (Circle-in-Ring, Rounded Arch, Adjustable Radius 0%–50%, Full-Bleed Split Window) + instant <15ms client-side studio background remover (removeStudioBackdropInstant).",
      "Redesigned Slide 4 (Full-Bleed Split) in HeroAnimatedTestimonialShowcase.tsx with a Sleek Architectural Rounded Portrait Window, ambient radial glow, and floating '⚡ Verified Founder' badge.",
      "Created features/tool-ui/index.ts barrel and expanded docs/TOOL_OPTIMIZATION_RULES.md with the 7-stage evolution post-mortem and Copy-Paste Master Prompt.",
    ],
    filesTouched: [
      "app/tools/quote-stat-testimonial-card-studio/page.tsx",
      "features/quote-stat-testimonial-card-studio/QuoteStatTestimonialCardStudioClient.tsx",
      "features/quote-stat-testimonial-card-studio/HeroAnimatedTestimonialShowcase.tsx",
      "features/quote-stat-testimonial-card-studio/cardRenderer.ts",
      "features/quote-stat-testimonial-card-studio/portraitCutout.ts",
      "features/quote-stat-testimonial-card-studio/model.ts",
      "features/tool-ui/index.ts",
      "docs/TOOL_OPTIMIZATION_RULES.md",
    ],
    commits: ["f4f328c", "d15d2c4", "8b59718"],
    status: "Completed & Live",
  },
  {
    id: "log-2026-11-08-phase1-4-seo-h1-agents",
    date: "2026-11-08",
    title: "Sitewide H1 & Meta SEO Optimization (Phases 1–4) + Navbar Heading Cleanup + AI Agents Hub",
    category: "SEO & H1 Optimization",
    founderRequestSummary:
      "Execute sitewide SEO audit fixes across Homepage, /tools, /ai-seo, /ai-tools, /prompts, and priority tool pages. Remove H4/H6 heading tags from the sitewide Navbar so crawlers only see semantic page headings, keep the Navbar on a single clean line, and elevate AI Agents in navigation.",
    aiImplementationDetails: [
      "Replaced all <h4> and <h6> tags inside components/Header/index.tsx mega-menus with semantic non-heading elements and enforced single-line navigation layout.",
      "Optimized H1 headings, single-sentence high-CTR meta descriptions, and above-the-fold direct answer boxes across priority SEO and tool routes.",
      "Enforced strict 100% male executive portrait policy across all preset selectors, hero showcases, and promotional cards.",
    ],
    filesTouched: [
      "components/Header/index.tsx",
      "app/HomePageCode.jsx",
      "app/tools/page.tsx",
    ],
    commits: ["Prior Nov 8–9 commits"],
    status: "Completed & Live",
  },
];
