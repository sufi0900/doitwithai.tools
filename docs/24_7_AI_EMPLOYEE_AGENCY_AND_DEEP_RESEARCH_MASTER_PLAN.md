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
     * **View 1 (`🌐 Live Animated AI Employee Node Graph`)**: A motion-graphic, interconnected node workflow ([n8n AI Agent Nodes](https://docs.n8n.io/changelog/release-notes), [LangGraph Stateful Graphs](https://dev.to/anmolbaranwal/open-source-toolkit-for-building-ai-agents-in-2026-55h1)) showing all **6 Departments** and **Sub-Agent Nodes** with animated data pulses flowing along SVG connectors, live status rings (`ACTIVE WORKING`, `COMPLETED`, `MONITORING`), and **Click-Any-Node Inspection** (clicking `JSON-LD @graph Schema Agent` or `Pinterest 2:3 Pin Creator` opens its live output card and a 1-click **`Switch to Full Dashboard Tab →`** button).
     * **View 2 (`📊 Multi-Department Text Dashboard`)**: Dedicated, distinctly styled department tabs showing everything that is healthy, what needs fixing, and ready-to-apply code/content packs.

## 2. How Internal (`/p/[slug]`) vs. External Websites Work in the 24/7 Agency

| Capability | Internal DoItWithAI Website (`/p/[slug]/blog`) | External User Website (`https://example.com`) |
| :--- | :--- | :--- |
| **Deep Research, Brand Voice & Competitor Gap Analysis** | Automatic from internal project state + niche trends. | Automatic from live HTML, `<meta>`, headings & `/sitemap.xml` crawl. |
| **On-Page SEO (Schema `@graph`, Internal Links, Meta Pixel Width, `robots.txt`)** | **1-Click / Auto-Applied** directly into the user's hosted Website Builder store. | **Full Diagnostic + Copy-Ready Code Patches** (`@graph` JSON-LD, `robots.txt`, meta tags, internal link anchor map). |
| **Existing Article Decay & Refresh Agent** | Continuously re-audits previously AI-published `/p/[slug]/blog` posts as new trends/competitors emerge and auto-updates them. | Audits existing sitemap blog URLs, highlights missing 2026 sub-topics/tables, and generates drop-in refresh sections. |
| **Off-Page SEO (Digital PR Pitches, Directories, Link Magnet Embeds)** | Generates ready-to-send journalist pitches, curated directory submissions & infographic embed codes. | Generates ready-to-send journalist pitches, curated directory submissions & infographic embed codes. |
| **New Articles + 6-Layer Infographics** | **Auto-Published** directly to `/p/[slug]/blog/[postSlug]` with all 4 SVG infographics embedded. | Synced to `/ai-content-writer` Studio + packaged for 1-click `.MD`/`.HTML`/`.JSON` download (or WordPress REST push). |
| **Multi-Network Social Media (Pinterest, LinkedIn, X/Threads)** | Auto-publishes on channels connected via 1-Tap OAuth; generates 1-click downloadable `.CSV`/`.HTML`/`.SVG` packs for unconnected channels. | Auto-publishes on channels connected via 1-Tap OAuth; generates 1-click downloadable `.CSV`/`.HTML`/`.SVG` packs for unconnected channels. |

## 3. Department & Sub-Agent Hierarchy (24/7 Active AI Employee Agency)

| Department | Specialized Sub-Agents | What the User Sees in Node Graph & Dashboard |
| :--- | :--- | :--- |
| **1. Deep Research Team** *(Background Foundation)* | `Brand DNA & Sitemap Gap Scout`, `Competitor & Long-Tail Keyword Radar` | Extracted Brand Voice rubric, sitemap coverage count, 3 competitor teardowns, and low-KD question clusters. |
| **2. On-Page SEO Department** | `JSON-LD @graph Schema Agent`, `Internal Linking & Meta Pixel Agent`, `robots.txt & AI Crawler Agent`, `Existing Article Refresh Agent` | Health scorecard (`Healthy` vs `Needs Improvement`), copy-ready `@graph` JSON-LD code, hub-and-spoke internal link table, AI-friendly `robots.txt`, and drop-in refresh paragraphs for existing articles. |
| **3. Off-Page SEO Department** | `Digital PR & Journalist Pitch Agent`, `Niche Directory & Citation Scout`, `Infographic Link-Magnet Agent` | Curated list of niche directories (with 40-word submission bios), data-backed HARO/Featured journalist pitch emails, and HTML embed codes. |
| **4. Technical & Local SEO Department** | `Core Web Vitals & Zero-CLS SVG Agent`, `Sitemap & Canonical Guard`, `Local & Organization Entity Agent` | Inline SVG zero-CLS verification, canonical tag rules, and `Organization` / `LocalBusiness` `sameAs` entity disambiguation schema. |
| **5. Autonomous Content Studio** | `50-Word AEO Lead Architect`, `Humanized H2/H3 Section Writer`, `6-Layer Prism Infographic Engine`, `150-Point GEO Critic` | Live indicator of which article is currently being written vs. already completed, granular sub-task animations, and 1-click switch into `/ai-content-writer`. |
| **6. Multi-Network Social Media Fleet** | **Pinterest 5-Agent Squad** (`Trend Scout` → `Existing Pin Auditor` → `2:3 Pin Creator` → `SEO Pin Fields` → `Publisher/CSV`), **LinkedIn 4-Agent Squad** (`8-Slide Carousel` + `Hooks`), **X/Threads 3-Agent Squad** | Dedicated per-network visual agent trees with live status, 1000×1500 Pin previews, 8-slide 1080×1350 carousel decks, and 1-click download/OAuth controls. |

## 4. Series of Implementation Phases for Commercial Launch

| Phase | Scope & Deliverables | Status |
| :--- | :--- | :--- |
| **Phase A (Current Sprint — Implemented Now)** | **Universal Background Deep Research Engine (`lib/autonomous-agents/deep-research-agency-engine.ts`) + Interactive Animated AI Employee Agency Node Graph & Dual-View Command Center (`features/autonomous-campaign-studio/AiEmployeeAgencyCommandCenter.tsx`) + Granular Sub-Stage Article Animations in `AutonomousCampaignDashboard.tsx`** | **COMPLETED & PUSHED** |
| **Phase B** | **Deep Live HTML Page Crawler for Existing Article Refreshing (`/api/autonomous-agents/audit-page`)**: Fetches individual existing blog post URLs from the user's sitemap to perform paragraph-level diffing, heading gap detection, and 1-click section injection. | **READY FOR NEXT SPRINT** |
| **Phase C** | **Persistent 24/7 Cloud Heartbeat Worker (`/api/autonomous-agents/cron-24h` + Supabase/Inngest)**: Runs scheduled background cycles every 24 hours even when the user's browser tab is closed, emailing or logging a daily "AI Employee Morning Briefing". | **READY FOR NEXT SPRINT** |
| **Phase D** | **Live Social Analytics Ingestion & Auto-Rebalancing**: Reads live Pinterest v5 Pin saves/clicks and LinkedIn impressions via OAuth tokens to automatically re-weight visual palettes and hook archetypes. | **READY FOR NEXT SPRINT** |
