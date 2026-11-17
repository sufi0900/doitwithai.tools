# DoItWithAI.tools — 24/7 Active AI Employee Agency & Universal Background Deep Research Master Plan

> **Repository**: [`sufi0900/doitwithai.tools`](https://github.com/sufi0900/doitwithai.tools)
>
> **Active Branch**: [`codex/infographic-studio-redesign`](https://github.com/sufi0900/doitwithai.tools/tree/codex/infographic-studio-redesign)
>
> **Primary Automation Route**: `/ai-content-writer/automation`
>
> **Single-Article Studio Route**: `/ai-content-writer` (Focused strictly on long-form article & visual authoring, with a Multi-Article Batch Switcher Bar when synced from Automation)

## 1. Executive Architecture: Two Clear Automation Modes + One Hidden Deep Research Engine

To make `doitwithai.tools` ready for commercial launch—where a beginner can automate everything simply by entering their **Website URL**, while still delivering agency-grade SEO, content, and social execution—the platform is built around **three core pillars**:

1. **Pillar 1 — Hidden Universal Background Deep Research Team (`lib/autonomous-agents/deep-research-agency-engine.ts`)**:

   * Inspired by multi-step agentic deep research loops ([DigitalApplied Deep Research Site Audit](https://www.digitalapplied.com/blog/deep-research-website-audit-prompt-method-2026) and [DFIRST Intent Gap & Topic Clustering](https://dfirst.ai/blog/ai-content-marketing/)), this engine runs invisibly in the background whenever a user enters a Website URL.

   * Users never have to configure complex research prompts. Behind the scenes, the Deep Research Team automatically:

     * Fetches homepage HTML, `<title>`, `<meta description>`, H1/H2 headings, brand hex colors, and `/sitemap.xml`.

     * Infers the website's true niche and builds a **Brand Voice & Stylistic Rubric** (sentence rhythm rules, E-E-A-T authority angle, and banned AI clichés).

     * Runs **Competitor Intent Gap Analysis** and queries niche-filtered Google Autocomplete + Trends to discover non-overlapping, low-KD long-tail topics.

2. **Pillar 2 — Mode A: Guided 6–10 Article Batch Mode (Straightforward Step-by-Step Article & Visual Production)**:

   * Designed for users who want 3, 5, 6, or 10 deeply researched articles + 6-layer section infographics + social packs in one guided flow:

     * **Step 1**: Enter Website URL → Watch the animated 4-stage Deep Research & Brand DNA scanner.

     * **Step 2**: Review discovered Low-KD topics (or click **`🔄 Generate Fresh Topic Ideas`**) → Click **`▶ Start Writing Articles + Visuals`**.

     * **Step 3**: Watch rich, stage-by-stage motion animations for each article (`Deep Research & Competitor Gap Analysis` → `Humanized H2/H3 Drafting` → `Internal & External Link Weaving` → `JSON-LD @graph Schema Compilation` → `6-Layer Section Infographics` → `Pinterest 2:3 & LinkedIn 8-Slide Carousel`), with smooth completion transitions from `Article #1 ✓` → `Article #2 ⚡`.

     * **Step 4**: Switch between all generated articles, open the entire batch inside `/ai-content-writer` with the Multi-Article Switcher Bar, auto-publish to internal `/p/[slug]/blog` sites, or download ready-made packs in 1 click.

3. **Pillar 3 — Mode B: 24/7 Active AI Employee Agency Command Center (Dual-View: Animated Node Graph ↔ Multi-Department Dashboard)**:

   * Designed for users who want an always-on **Digital AI Employee Agency** working on their website 24/7 across On-Page SEO, Off-Page SEO, Technical/Local SEO, Content Writing, Existing Article Refreshing, and Multi-Network Social Media.

   * The user simply enters their Website URL once and clicks **`⚡ Activate 24/7 AI Employee Agency`**. They can leave and return anytime to inspect work across two synchronized views:

     * **View 1 (`🌐 Live Animated AI Employee Node Graph`)**: A motion-graphic, interconnected node workflow ([n8n AI Agent Nodes](https://docs.n8n.io/changelog/release-notes), [LangGraph Stateful Graphs](https://dev.to/anmolbaranwal/open-source-toolkit-for-building-ai-agents-in-2026-55h1)) showing all **6 Departments** and **Sub-Agent Nodes** across a mathematically centered 3-column SVG canvas (`x = 145`, `x = 440`, `x = 735`) with animated glowing data packets (`<animateMotion>`) flowing along SVG bezier paths, a mobile quick-select pill bar, and **Click-Any-Node Inspection**.

     * **View 2 (`📊 Multi-Department Text Dashboard`)**: Dedicated, distinctly styled department tabs showing everything that is healthy, what needs fixing, and ready-to-apply code/content packs.

## 2. Deep Audit & Pixel-Perfect Optimization Fixes Applied Across All Phases

| Audited Area | Issue / Gap Detected During Deep Review | Resolution & Optimization Implemented |
| :--- | :--- | :--- |
| **1. `runAutomationJsonPrompt` Contract in `audit-page/route.ts` & `cron-24h/route.ts`** | Phase B and Phase C routes originally passed `systemInstruction` / `maxTokens` and read `aiRes.ok` instead of matching `AutomationJsonPromptOptions` (`systemPrompt`, `maxOutputTokens`, required `deterministicFallback`, and `aiRes.providerUsed`). | Aligned both `app/api/autonomous-agents/audit-page/route.ts` and `app/api/autonomous-agents/cron-24h/route.ts` strictly to `AutomationJsonPromptOptions<T>` and `AutomationJsonPromptResult<T>` from `lib/autonomous-agents/automation-ai-router.ts`. |
| **2. Phase B 1-Click Article Refresh Persistence & 6-Layer Refresh Infographic** | Clicking `⚡ 1-Click Auto-Inject` in Dept 2 only toggled local UI state without updating `studioState` or rendering a new section infographic. | Upgraded `/api/autonomous-agents/audit-page` to compile a standalone `1080×1350` 6-layer SVG infographic (`refreshInfographicSvg`) for the new 2026 H2 section, and wired `onApplyArticleRefreshPatch` in `AutonomousCampaignDashboard.tsx` to persist the refreshed Markdown, 50-word AEO lead, and SVG directly into `studioState` (and re-publish internal `/p/[slug]/blog` posts). |
| **3. Phase D Social Winner Auto-Rebalancer Store Persistence** | Syncing live social telemetry in Dept 6 displayed the winning archetype but did not persist a `WinnerFormulaRecord` into `studioState.winnerFormulas`. | Upgraded `/api/autonomous-agents/social-analytics-sync` to return a typed `WinnerFormulaRecord` (`winnerRecordForStore`) and wired `onPromoteSocialWinnerFormula` in `AutonomousCampaignDashboard.tsx` to save it into `localStorage`. |
| **4. SVG Node Graph Mathematical Centering & Mobile Ergonomics** | Node coordinates had uneven horizontal spacing (`140, 420, 700`) and lacked a quick-tap mobile selector. | Re-centered all 10 nodes onto a symmetrical 3-column grid (`x = 145`, `x = 440`, `x = 735` across `880×500`), added `<animateMotion>` glowing data packets along bezier edges, added a Mobile Quick-Select Sub-Agent Pill Bar, and added `overflow-x-auto break-words min-w-0` guards across all code/markdown blocks. |

## 3. Series of Implementation Phases (All 4 Phases Audited, Optimized & Pushed)

| Phase | Scope & Deliverables | Status | 
| ----- | ----- | ----- | 
| **Phase A** | **Universal Background Deep Research Engine (`lib/autonomous-agents/deep-research-agency-engine.ts`) + Interactive Animated AI Employee Agency Node Graph & Dual-View Command Center (`features/autonomous-campaign-studio/AiEmployeeAgencyCommandCenter.tsx`) + Granular Sub-Stage Article Animations in `AutonomousCampaignDashboard.tsx`** | **AUDITED, OPTIMIZED & PUSHED** | 
| **Phase B** | **Deep Live HTML Page Crawler for Existing Article Refreshing (`app/api/autonomous-agents/audit-page/route.ts` + Live Refresh Inspector & 1080×1350 Refresh SVG in `AiEmployeeAgencyCommandCenter.tsx`)** | **AUDITED, OPTIMIZED & PUSHED** | 
| **Phase C** | **Persistent 24/7 Cloud Heartbeat Worker (`app/api/autonomous-agents/cron-24h/route.ts` + `lib/autonomous-agents/cloud-heartbeat-briefing.ts` + Morning Briefing UI in `AiEmployeeAgencyCommandCenter.tsx`)** | **AUDITED, OPTIMIZED & PUSHED** | 
| **Phase D** | **Live Social Analytics Ingestion & Auto-Rebalancing (`app/api/autonomous-agents/social-analytics-sync/route.ts` + Persistent Winner Auto-Rebalancer in `AiEmployeeAgencyCommandCenter.tsx` & `AutonomousCampaignDashboard.tsx`)** | **AUDITED, OPTIMIZED & PUSHED** | 
