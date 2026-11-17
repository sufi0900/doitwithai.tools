# DoItWithAI.tools — 24/7 Autonomous AI Digital Agency OS (V2 Re-Architecture & Master Blueprint)

> **Repository**: [`sufi0900/doitwithai.tools`](https://github.com/sufi0900/doitwithai.tools)  
> **Branch**: [`codex/infographic-studio-redesign`](https://github.com/sufi0900/doitwithai.tools/tree/codex/infographic-studio-redesign)  
> **New Public Landing Page Route**: `/ai-employee-agency`  
> **New Dedicated Agency Workspace Route**: `/ai-employee-agency/dashboard`  
> **Content Writer Bridge Route**: `/ai-content-writer` & `/ai-content-writer/automation` (Mode B redirects to `/ai-employee-agency`)

---

## 1. Executive Strategy: Why Separate `/ai-employee-agency` & `/ai-employee-agency/dashboard`?

### 1.1 SEO, Paid Acquisition & Product Positioning Best Practices
Separating the **24/7 Active AI Employee Agency** from `/ai-content-writer` into its own dedicated route hierarchy is the strongest architectural and SEO decision ([GetSpike SaaS Landing Page Best Practices](https://getspike.ai/blog/saas-landing-page-best-practices/), [LynxDigital URL & Slug Best Practices](https://www.lynxdigital.com/kb/seo/url-and-slug-best-practices)):

| Route / Slug | Primary Purpose & User Experience | Primary SEO & Commercial Intent |
| :--- | :--- | :--- |
| **`/ai-employee-agency`** | **Public Marketing & Zero-Noise URL Onboarding Page**: Focused single-input hero where the user enters only their **Website URL** and watches the cinematic multi-stage analysis & agency team assembly animation before auto-redirecting to `/ai-employee-agency/dashboard`. | Targets commercial high-ticket keywords: *"24/7 AI SEO & Digital Marketing Agency"*, *"Autonomous AI Employees for Website Growth"*, *"Automated SEO, Content & Social Media Agency"*. Ready for standalone paid ads & social promotion. |
| **`/ai-employee-agency/dashboard`** | **Dedicated Left-Sidebar + Right-Workspace Agency OS**: Standard SaaS dashboard layout with 8 Department Tabs on the left, a dedicated workspace on the right, a 1-click **Full-Canvas Interactive Pan/Zoom Node Graph**, and a **Unified Founder Chat & Voice Command Bar**. | Protected/Workspace application route ready for future Google Sign-In gating (`/ai-employee-agency/dashboard?site=...`). |
| **`/ai-content-writer`** & **`/ai-content-writer/automation`** | **Content Writing & Multi-Article Batch Studio**: Keeps Mode A (Multi-Article Guided Batch) for users focused purely on writing articles/keywords. Clicking **Mode B (`24/7 Active AI Employee Agency`)** immediately redirects the user to `/ai-employee-agency`. | Targets content-specific queries: *"AI blog writer"*, *"bulk AI article generator"*, *"SEO content writer with infographics"*. |

### 1.2 Universal 6-Item Navbar Cap Compliance
* Top-level navbar remains strictly capped at **6 items** (`Home`, `AI Tools`, `AI Extensions`, `Blog`, `Resources`, `Founder Hub`).
* Both **`⚡ 24/7 AI Employee Agency (Landing)`** (`/ai-employee-agency`) and **`🏢 AI Agency Live Dashboard`** (`/ai-employee-agency/dashboard`) will be placed at the very top of the **`Resources`** dropdown with a `LIVE V2` badge for 1-click testing.

---

## 2. Complete Digital Agency Hierarchy: 8 Main Agents (Managers) & 24 Specialized Sub-Agents

Modeled on the **Hybrid Supervisor + Handoff Architecture** ([LangGraph Multi-Agent Supervisor](https://reference.langchain.com/python/langgraph-supervisor), [LangChain Multi-Agent Architecture Guide](https://www.langchain.com/blog/choosing-the-right-multi-agent-architecture), [CrewAI Hierarchical Process](https://docs.crewai.com/v1.10.1/en/learn/hierarchical-process)), every department has a **Manager/Lead Agent** that coordinates specialized **Sub-Agents**, and every agent has a modular `skills[]` and `tools[]` registry so we can continuously upgrade its backend capabilities.

| Dept ID & Sidebar Tab | Main Agent (Manager / Lead) | Specialized Sub-Agents (Visible in Node Graph & Dept View) | Equipped Backend Skills & Tools (`skills[]` / `tools[]`) |
| :--- | :--- | :--- | :--- |
| **0. Executive Office** (`executive-office`) | **Chief AI Officer & Founder Assistant** (`agent-chief-orchestrator`) | 1. `Daily Briefing & Telemetry Synthesizer`<br>2. `Founder Manual Action Escalator`<br>3. `Scenario & Task Dispatcher` | `founder-intent-parser`, `cross-department-handoff-router`, `manual-blocker-detector`, `voice-speech-synthesis` |
| **1. Keyword Research** (`keyword-strategist`) | **Keyword & Topic Strategist** (`agent-keyword-lead`) | 1. `Live Web & Autocomplete Trend Scout`<br>2. `DoItWithAI Keyword KD & Intent Scorer`<br>3. `Heading Structure (H1-H3) & Cluster Architect` | `google-autocomplete-live-scraper`, `doitwithai-keyword-scoring-engine`, `sitemap-cannibalization-guard`, `serp-intent-classifier` |
| **2. Content Writing** (`content-writing`) | **Content Production Manager** (`agent-content-manager`) | 1. `Long-Form GEO/AEO Section Writer`<br>2. `Meta Title (<580px) & Description Specialist`<br>3. `Internal & External Link Weaver`<br>4. `Connected @graph JSON-LD Schema Writer` | `geo-50word-lead-writer`, `human-rhythm-stylist`, `contextual-anchor-link-mapper`, `jsonld-graph-compiler`, `writer-studio-bridge` |
| **3. Graphic & Visuals** (`graphic-design`) | **Creative & Graphic Design Director** (`agent-design-director`) | 1. `Featured Hero Image Designer`<br>2. `6-Layer Section Infographic Architect (1080×1350)`<br>3. `Social Carousel & 2:3 Vertical Pin Designer` | `featured-hero-svg-generator`, `six-layer-infographic-engine`, `brand-palette-contrast-checker`, `zero-cls-vector-optimizer` |
| **4. On-Page SEO** (`on-page-seo`) | **On-Page SEO Lead Engineer** (`agent-onpage-lead`) | 1. `Live DOM Heading & Word-Count Auditor`<br>2. `Content Decay & 2026 Refresh Injector`<br>3. `SERP Pixel & Schema Compliance Verifier` | `live-html-page-crawler`, `content-decay-gap-analyzer`, `drop-in-refresh-markdown-generator`, `internal-link-orphan-detector` |
| **5. Off-Page SEO** (`off-page-seo`) | **Off-Page Authority & Digital PR Lead** (`agent-offpage-lead`) | 1. `Competitor Backlink & Link-Magnet Scout`<br>2. `Journalist Data Pitch & HARO/Qwoted Writer`<br>3. `Niche Directory & Unlinked Mention Agent` | `backlink-gap-heuristics`, `data-pr-pitch-composer`, `directory-submission-packager`, `embeddable-infographic-code-builder` |
| **6. Technical & Local SEO** (`technical-seo`) | **Technical & Local SEO Architect** (`agent-technical-lead`) | 1. `Core Web Vitals (LCP/CLS) & Speed Auditor`<br>2. `robots.txt, AI Crawler & Canonical Guard`<br>3. `Local Business & Knowledge Graph Entity Agent` | `robots-txt-ai-bot-validator`, `sitemap-xml-health-checker`, `organization-sameas-schema-builder`, `founder-manual-fix-escalator` |
| **7. QA & Publishing** (`qa-publishing`) | **Quality Assurance & Publishing Controller** (`agent-qa-publisher`) | 1. `150-Point Readability, E-E-A-T & Anti-Fluff Gate`<br>2. `Internal Site Auto-Publisher (/p/[slug]/blog)`<br>3. `External CMS Draft & Webhook Packager` | `150pt-geo-quality-gate`, `anti-cliche-linter`, `internal-blog-store-publisher`, `external-cms-draft-packager` |
| **8. Social & Video Fleet** (`social-video-fleet`) | **Social Media & Viral Video Manager** (`agent-social-manager`) | 1. `Pinterest 2:3 Visual Growth Specialist`<br>2. `LinkedIn 8-Slide PDF Carousel Specialist`<br>3. `Facebook & Instagram Bento Specialist`<br>4. `X (Twitter) & Threads Viral Thread Writer`<br>5. `TikTok, Reels & Shorts Video Script & Trend Agent` | `pinterest-2x3-pin-compiler`, `linkedin-8slide-html-pdf-builder`, `viral-thread-atomizer`, `tiktok-trend-hook-analyzer`, `short-form-video-storyboard-writer` |

---

## 3. Real-Time Inter-Agent Communication & Deliberate Pacing Protocol

To make the agency feel like a **living, breathing Digital Office** rather than a static instant dump, the **Stateful Handoff Engine (`lib/ai-employee-agency/handoff-orchestrator.ts`)** executes tasks with **deliberate visual pacing (`2.0s–3.2s` per stage)** and visible **Handoff Data Packets**:

1. **Stage 1 — Founder Scenario or 24/7 Trigger → `Chief AI Officer`**:
   * Triggered either automatically on onboarding/24h cycle OR when the Founder types/speaks in the Command Chat (e.g., *"Launch a new article on technical SEO audits and prepare Pinterest + TikTok scripts"*).
2. **Stage 2 — `Chief AI Officer` → `Keyword & Topic Strategist`**:
   * The Keyword Agent activates (`⚡ Working`), runs `google-autocomplete-live-scraper` + `doitwithai-keyword-scoring-engine`, generates a list of candidate keywords with KD scores, selects the #1 priority keyword + H1–H3 outline, and sends a **Handoff Packet** (`SELECTED_KEYWORD_BRIEF`) along the animated connector to the **Content Production Manager**.
3. **Stage 3 — `Content Production Manager` → Parallel/Sequential Sub-Agent Delegation**:
   * Upon receiving the keyword brief, the Content Manager distributes tasks:
     * Sends a visual brief packet to **`Creative & Graphic Design Director`** → `Featured Hero Image Designer` + `6-Layer Section Infographic Architect` start rendering the featured image and 4 section SVGs.
     * Dispatches `Long-Form Section Writer` (drafts H2/H3 + 50-word AEO lead), `Meta Specialist` (writes title/description), and `Internal/External Link Weaver` (inserts contextual links).
4. **Stage 4 — `Content Production Manager` + `On-Page SEO Lead` → `QA & Publishing Controller`**:
   * The assembled article + featured image + 4 section SVGs + `@graph` schema pass to `QA & Readability Gatekeeper`.
   * Once QA approves (`96/100 Pass`), `Publishing Controller` checks the website mode:
     * **Internal DoItWithAI Website**: Automatically publishes to `/p/[slug]/blog/[article-slug]` and marks the article card **`🟢 Published`**.
     * **External Website**: Packages the complete draft + schema + visuals and marks the article card **`📘 Draft Ready (Manual/CMS Push)`**.
5. **Stage 5 — `QA & Publishing Controller` → `Social Media & Viral Video Manager`**:
   * Sends the finalized article URL and key takeaways to the Social Manager, which sequentially activates:
     * `Pinterest Specialist` (3 tall `1000×1500` pins)
     * `LinkedIn Specialist` (8-slide `1080×1350` carousel deck)
     * `Facebook/IG Specialist` + `X/Threads Specialist` (multi-post thread & bento cards)
     * `TikTok / Reels Video Script Agent` (analyzes trending short-form formats in the niche and writes a 60-second scene-by-scene video script with 3-second visual/verbal hook, B-roll cues, and caption).

---

## 4. Zero-Noise Onboarding & Standard Left-Sidebar Dashboard UX

### 4.1 `/ai-employee-agency` — Clean Public Landing Page + Full-Screen Animated Analysis Transition
* **Zero Clutter Hero**: No Mode A / Mode B cards, no wall of text. Just a bold agency headline, a single **Website URL Input Bar** (`https://yourwebsite.com` or select an internal DoItWithAI site), and **`🚀 Launch My 24/7 AI Digital Agency`**.
* **Full-Screen Animated Analysis & Office Assembly Transition**:
  * As soon as the user submits their URL, the screen transitions into a dedicated **Cinematic Agency Initialization View** showing:
    1. Live Website HTML, Brand Palette & Sitemap Crawl (`0% → 25%`)
    2. Keyword Strategist & Competitor Intent Gap Radar (`25% → 50%`)
    3. On-Page, Off-Page & Technical SEO Diagnostic Scan (`50% → 75%`)
    4. Assembling Your 8 AI Department Managers & 24 Sub-Agents (`75% → 100%`)
  * Automatically redirects to **`/ai-employee-agency/dashboard`** upon completion.

### 4.2 `/ai-employee-agency/dashboard` — Left Department Sidebar + Dedicated Right Canvas
* **Top Header Bar**:
  * Displays the active website domain, live agency status ticker (*"Keyword Strategist handing off 'AI SEO Audit Checklist' to Content Manager..."*), and the primary view toggle button: **`🌐 Live Animated AI Agency Node Graph`** vs. **`📊 Department Workspace View`**.
* **Left Sidebar Navigation (Always Accessible)**:
  * Lists the 9 clean views:
    1. `🏢 Executive Office & Founder Brief` (Today's activity timeline graph + **Manual Founder Action Required** alerts—e.g., when an external website has a technical SEO or `robots.txt` issue that requires manual Founder intervention)
    2. `🔑 Keyword & Topic Strategist`
    3. `✍️ Content Writing Studio`
    4. `🎨 Graphic & Visual Design`
    5. `🛠️ On-Page SEO & Refresh`
    6. `📣 Off-Page SEO & Digital PR`
    7. `⚙️ Technical & Local SEO`
    8. `📲 Social Media & TikTok Scripts`
    9. `✅ QA & Publishing Queue`
* **Right Main Area — Mode 1: Department Workspace View**:
  * Shows **ONLY** the clicked department's clean dashboard.
  * **Special Design for `✍️ Content Writing Studio` Tab**:
    * Top KPI strip showing `Published / Drafts Ready`, `Actively Writing Now`, and `Not Yet Started (Queued)`.
    * **Unique Article Status Boxes Grid**:
      * **Box Type 1 (`🟢 Published` for internal sites / `📘 Draft Ready` for external sites)**: Shows the completed article title, featured image + 4 section infographics badge, QA score, and 1-click buttons to **Open in Full Content Writer Studio (`/ai-content-writer`)**, **Preview/Edit**, or **Download/Publish**.
      * **Box Type 2 (`⚡ Actively Writing Now`)**: Live animated card showing which sub-agent (`Keyword Handoff → Featured Image → Section Writer → Link Weaver → Schema → QA`) is working on this article right now with a real-time step progress bar.
      * **Box Type 3 (`⚪ Not Yet Started`)**: Placed at the end of the grid for upcoming slots, clearly showing *"Not Yet Started — Waiting for Keyword Strategist handoff"* with a **`▶ Start Writing Now`** button.
* **Right Main Area — Mode 2: Full-Canvas Interactive Pan/Zoom Node Graph (`🌐 Live Animated AI Agency Node Graph`)**:
  * When clicked, the **entire right-side workspace** becomes a **100% full-canvas interactive node graph** ([n8n AI Workflow Canvas](https://n8n.io/ai-agents/)) with **zero text blocks or clutter below or beside it**:
    * **Interactive Controls**: `Zoom In (+)`, `Zoom Out (-)`, `Fit to Screen (⊡)`, `Drag to Pan`, and `Play/Pause Live Pacing`.
    * **Hover Any Node**: Displays a crisp floating tooltip over the node with its current status, active sub-task, and latest handoff summary.
    * **Click Any Node**: Opens a clean floating **Agent Inspector Card** with:
      1. Live work output & equipped skills/tools badges.
      2. **`💬 Chat / Voice Call with This Agent`** (opens 1-on-1 conversation with that agent).
      3. **`Open Full [Department] Dashboard →`** (switches the right-side canvas directly to that department's tab!).

### 4.3 Persistent Founder Command Chat & Voice Bar (`FounderCommandChatDock.tsx`)
* Docked at the bottom of `/ai-employee-agency/dashboard`:
  * **Global Assistant Mode (`Chief AI Officer`)**: The Founder can type or use the microphone button (`🎙️ Voice Call`) to say: *"Today let's write and launch a new article on AI technical SEO checklists"* or *"What did the agency finish today?"*. The Chief AI Officer immediately triggers all relevant departments (Keyword → Content → Graphic Design → On-Page → Off-Page → QA → Social/TikTok) in sequence!
  * **1-on-1 Specialist Mode**: The Founder can switch the target dropdown to any individual AI Employee (e.g., `Keyword Strategist`, `TikTok Video Script Agent`, `On-Page SEO Lead`, `Graphic Designer`) to chat directly, critique its work, or assign a custom task.

---

## 5. Series of Implementation Phases (Step-by-Step Engineering Roadmap)

| Phase | Milestone & Exact Files to Create / Upgrade | Key Deliverables |
| :--- | :--- | :--- |
| **Phase 1 (COMPLETED)** | **Dedicated Routes (`/ai-employee-agency` & `/ai-employee-agency/dashboard`), Cinematic Onboarding & Cross-Route Redirects**<br>• `app/ai-employee-agency/page.tsx`<br>• `app/ai-employee-agency/dashboard/page.tsx`<br>• `features/ai-employee-agency/AiAgencyPublicLanding.tsx`<br>• `features/ai-employee-agency/AiAgencyDashboardShell.tsx`<br>• `features/autonomous-campaign-studio/AutonomousCampaignDashboard.tsx`<br>• `components/Header/menuData.tsx` | 1. Clean, zero-noise `/ai-employee-agency` landing page with single Website URL input.<br>2. Full-screen animated 6-stage Deep Analysis & Agency Team Assembly transition that redirects to `/ai-employee-agency/dashboard`.<br>3. Clicking Mode B on `/ai-content-writer/automation` redirects cleanly to `/ai-employee-agency`.<br>4. Top of `Resources` dropdown updated with direct test links. |
| **Phase 2** | **8-Department / 24-Sub-Agent Modular Registry & Paced Handoff Orchestrator**<br>• `lib/ai-employee-agency/agent-registry.ts`<br>• `lib/ai-employee-agency/handoff-orchestrator.ts`<br>• `app/api/ai-employee-agency/orchestrate/route.ts` | 1. Complete registry of 8 Main Agents + 24 Sub-Agents with `skills[]`, `tools[]`, and department mappings.<br>2. Deliberate, real-time paced handoff engine (`Keyword Strategist → Content Manager → Graphic Designer + Link/Schema Sub-Agents → QA → Publisher → Social & TikTok Video Manager`).<br>3. Integration of our internal Keyword Tool scoring engine into the `Keyword Strategist` agent. |
| **Phase 3** | **Full-Canvas Interactive Pan/Zoom Node Graph Expansion (Sub-Agent Expansion Nodes + Custom Edge Inspector)**<br>• `features/ai-employee-agency/InteractiveAgencyNodeCanvas.tsx` | 1. Expandable sub-agent clusters for all 24 sub-agents on the full-right-area interactive canvas.<br>2. Smooth Zoom In, Zoom Out, Reset View, Drag-to-Pan, and animated glowing packets moving between parent/child nodes.<br>3. Hover tooltip + Click floating card with `"Open [Department] Dashboard →"` and `"💬 Chat with Agent"`. |
| **Phase 4** | **Deepened Department Dashboards (Live Keyword Tool Scorer, Multi-Box Content Studio & TikTok Storyboard Builder)**<br>• `features/ai-employee-agency/departments/*` | 1. Live interactive tools inside each of the 9 Left-Sidebar tabs.<br>2. **`Executive Office`** tab with Daily Activity Graph + **Manual Founder Action Required** alerts.<br>3. **`Content Writing Studio`** tab with unique `Published` / `Draft Ready`, `Actively Writing Now`, and `Not Yet Started` boxes + bridge to `/ai-content-writer`. |
| **Phase 5** | **Live AI Backend for Unified Founder Command Chat & Web Speech Voice Call Dock**<br>• `features/ai-employee-agency/FounderCommandChatDock.tsx`<br>• `app/api/ai-employee-agency/agent-chat/route.ts` | 1. Live LLM-powered `/api/ai-employee-agency/agent-chat` endpoint.<br>2. Talk to `Chief AI Officer` to launch a full multi-department article/campaign scenario from a single sentence.<br>3. Talk 1-on-1 (text or Web Speech API voice call) with any individual AI Employee to inspect, refine, or assign tasks. |
