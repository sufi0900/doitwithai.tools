# DoItWithAI.tools — 24/7 AI Employee Digital Agency OS (V8.2 Master Research & Architecture Spec)

> **STATUS: INCOMPLETE — ACTIVE RESEARCH & ARCHITECTURE PAPER (DO NOT START IMPLEMENTATION YET)**
> **Last Updated:** November 22, 2026
> **Branch Scope:** `codex/infographic-studio-redesign` (Cloudflare Workers Preview ONLY — never touch `production-cloudflare` or `main`)
> **Purpose:** Complete A-to-Z living startup architecture and founder vision knowledge base. Covers Keyword Research OS, Keyword Overview, Free-to-Paid SEO Data APIs, Upstash Redis + Supabase 2-Layer Caching, Super Admin Control Center, AI Agent Draft/Test/Publish Studio, Thinking-AI Brain Cost Controls, Privacy-Safe Learning Policy, 3-Watchdog Mistake Triage & Live Simulation Mode, Dashboard Mutation Rules, Calendar Agent & Rolling Lock Window, Animated Node Handoffs, Middle E-E-A-T Agent, Strict Specialist Ownership Matrix, 7-Step Locked Article Assembly Line, Visual vs. Social Org Chart, Multi-Agent Group Chat War Room, Two-Track Existing Page Optimization, Universal Agency Awareness & Off-Topic Guardrails, 4-Pillar Memory & Latest-Version Precedence, Personalized Workspace Behavior Card & Existing-Page Social Promotion, and the On-Page SEO Specialist 100-Point Objective Rubric & Zero-Conflict Relay.

---

## 1. Founder Vision & Three-Way Expert Division of Labor

| Role | Owner | Core Mandate |
| :--- | :--- | :--- |
| **Lead Systems Architect** | Gemini | Designs from scratch the objective 100-point rubrics, specialist skills/tools, data/API economics, caching & SaaS backend infrastructure, Super Admin controls, memory rules, and cross-agent handoff contracts. |
| **Debugging & Backend Expert** | Antigravity | Resolves live Preview bugs, API key isolation, token metering, Supabase migrations, Upstash Redis wiring, and backend execution using the forensic handoffs in this spec. |
| **Frontend & Visual Designer** | Designer AI Expert | Elevates UI/UX polish, visual hierarchy, gauges, tables, animated node handoffs, War Room chat UI, and Super Admin panels using the functional zone specs defined below. |

---

## 2. Live Preview Forensic Bug Handoff (For Antigravity)

Diagnosed from 6 live Preview screenshots (`codex-infographic-studio-redesign`):

1. **Broken Slogan-Glued Fallback Keywords:** `onboarding.server.ts:218` slices the homepage `<h1>` (`"Do It With AI Tools Put AI to work on your SEO and"`) and appends `"workflow for beginners"` / `"step by step checklist"`, producing junk keywords and triggering false `Refresh Existing` overlap against the homepage.
2. **Stage 2 `Invalid block` Crash:** Stage 1 succeeded at `1,548 tokens · $0.0011` (confirming V6 Phase 1 fixed prompt bloat), then Stage 2 threw `Invalid block` from `prompt-compiler.ts:149` because `verifiedReply()` rejects any inline URL not explicitly present in `allowedSitemapUrls`.
3. **Neutral Gray `#bdbdbd` Extracted as Primary Brand Color:** `onboarding.server.ts:569` captures the first hex string in inline `<style>` tags without prioritizing `meta[name="theme-color"]` or filtering low-saturation grays/whites/blacks.
4. **5–6s Blocking "Saving..." Button UX:** Clicking Register or Approve awaits the full server round-trip inside the button state instead of transitioning immediately into an animated multi-stage progress screen.
5. **Stale `2025` Year & Partial 3-Page Crawl:** Generated article title contained `in 2025` (must inject current UTC year `2026`), and fresh workspace registration indexed only `3 indexed pages (partial)`.

---

## 3. Unified Website Model & 12-Skill Keyword Research OS

Every website—brand-new or established—runs through a single **Unified Website Model** assuming existing pages may exist (new sites simply have fewer discovered URLs). Every keyword candidate routes cleanly to one of four actions: `New Article`, `Optimize Existing Page` (real non-homepage URLs only), `Cannibalization Resolution`, or `New Tool / Landing Page`.

### The 12 Callable Specialist Skills & Tools
Unifies existing standalone routes in this repo (`app/api/ai-tools/keyword-research/route.ts`, `keyword-clustering/route.ts`, `keyword-golden-ratio-calculator/route.ts`, `serp-content-gap-agent/route.ts`) into one cohesive Keyword Research AI Agent:

1. **Zero-Input Niche Discovery:** Works with zero user uploads—extracts real brand entities/offers from homepage + sitemap, then mines A–Z Autocomplete, Reddit, and Quora.
2. **Keyword Cannibalization Guard (Tool + Skill):** Compares existing sitemap slugs, titles, and H1s against each other AND against any newly uploaded keyword sheet; prescribes `Merge`, `301 Redirect`, `Canonical`, or `Re-Target`.
3. **Topical Map & Pillar Builder:** Organizes keywords into a `Pillar → Cluster → Supporting Subpage` hierarchy with coverage percentage and internal-linking anchors.
4. **Keyword Golden Ratio (KGR) Calculator:** Computes `allintitle:"keyword" / monthly search volume` (for terms ~<250 monthly searches). Flags `< 0.25` as fast-ranking quick wins, `0.25–1.00` as moderate, and `> 1.00` as authority-heavy.
5. **Competitor Domain & URL Gap Analyzer (Mode A):** User drops any competitor domain, landing page, or blog URL → extracts their headings/topics/keywords, diffs against user's sitemap, outputs a ready-to-publish keyword sheet.
6. **1-vs-N Blog Beat & Content Unification Engine (Mode B):** User provides their own blog URL + 1–5 competing articles → compares every H1/H2/H3, entity, FAQ, word count, and missing subtopic to generate one unified outranking brief.
7. **Bulk CSV / GSC Sheet Cleaner & Enricher:** Ingests SEMrush, Ahrefs, and Google Search Console CSVs at `$0` LLM cost; deduplicates, strips branded/junk noise, and auto-scores every row.
8. **Search Intent & Funnel Stage Classifier:** Tags `Informational`, `Commercial`, `Transactional`, or `Navigational` + Funnel (`ToFu`, `MoFu`, `BoFu`) + recommended page format (`Guide`, `Comparison`, `Tool`, `Checklist`, `Landing`).
9. **AI Overview (GEO) & Zero-Click Risk Scorer:** Detects live Google AI Overview presence, counts cited links, and scores citation opportunity so users win AI answers rather than losing clicks.
10. **Seasonality & Trend Velocity Detector:** Tags keywords `Rising Breakout`, `Evergreen`, or `Declining` via Google Trends related queries.
11. **Striking-Distance & Content Decay Finder:** Mines GSC exports for positions `#4–#20` and high-impression, low-CTR pages for fast traffic wins.
12. **Conversational Dashboard Mutator:** Prompt bar translates natural language (e.g., *"show only KGR < 0.25 commercial keywords"*, *"put this keyword in Row #3"*, *"find cannibalization in this CSV"*) into structured tool calls that update the live backlog table directly.

---

## 4. 100-Point Keyword Opportunity Rubric & Hard Rejection Bans

| Criterion | Max Points | Evaluation Basis |
| :--- | :---: | :--- |
| **Niche & Offer Relevance** | 25 | Direct alignment with site's real products, services, and ICP |
| **Demand & Community Proof** | 20 | Verified search volume OR live Autocomplete + Trends + Reddit/Quora proof |
| **Winnability (KD vs. Authority)** | 20 | Top-10 OpenPageRank DA vs. user's domain + KGR signal |
| **Commercial & Conversion Intent** | 20 | Revenue proximity (`BoFu` / `MoFu` / `ToFu` balance) + CPC density |
| **Freshness & Non-Cannibalization** | 15 | Current-year hygiene + zero overlap with existing ranking URLs |
| **Total Opportunity Score** | **100** | Ranks backlog into `P0` (80–100), `P1` (60–79), `P2` (<60) |

**Three Hard Rejection Bans (Zero Exceptions):**
1. **No Slogan Gluing:** Never concatenate raw homepage hero/H1 marketing copy with generic suffixes (`"workflow for beginners"`).
2. **No Phantom Homepage Refreshes:** Never route informational blog keywords as `Refresh Existing` against the root homepage (`/`).
3. **Current-Year Hygiene:** Always inject current UTC year (`2026`); reject stale `2024`/`2025` modifiers unless explicitly requested for historical analysis.

---

## 5. Master Keyword List Schema (11 Columns) & 4-Zone Dashboard

- **Zone 1 · Top Telemetry Bar:** Circular score gauges + GSC/SEMrush/Ahrefs CSV upload dropzone + Country/Device switcher.
- **Zone 2 · Conversational Keyword Copilot Bar:** Natural-language prompt bar that invokes any of the 12 skills and updates the live table directly.
- **Zone 3 · Topical Cluster & Pillar Rail:** Clickable Pillar → Cluster filter tree with coverage percentage.
- **Zone 4 · Living Priority Backlog Table:** Filterable, sortable 11-column table with manual row positioning, pin/override, E-E-A-T status badge, and 1-click routing to Keyword Overview, E-E-A-T Studio, or Calendar.

| # | Column | Format & Visual Signal | Source (Free → Paid) |
| :-: | :--- | :--- | :--- |
| 01 | **# (Rank)** | Sequential priority number (`1, 2, 3...`) — editable via drag or chat | Deterministic sort / user pin |
| 02 | **Keyword** | Clickable link opening **Keyword Overview** deep dive | Discovery / CSV / GSC |
| 03 | **Topic Group & Pillar** | Parent Pillar + Semantic Cluster badge | Semantic Clusterer |
| 04 | **Content Type** | `Guide`, `Comparison`, `Tool Page`, `Checklist`, `Landing` | SERP format classifier |
| 05 | **Search Intent** | `Info`, `Comm`, `Trans`, `Nav` + Funnel stage | SERP + modifier rules |
| 06 | **Volume / Demand** | Verified monthly volume (Paid/CSV/GSC) OR `Demand Signal` (Free) | Hybrid → DataForSEO |
| 07 | **KD %** | 0–100 color ring (OpenPageRank Top-10 DA → DataForSEO KD) | OpenPageRank → DataForSEO |
| 08 | **KGR & AI Overview** | KGR win badge (`<0.25`) + AI Overview active indicator | Serper `allintitle:` + SERP |
| 09 | **Opp. Score (0–100)** | Composite rubric score | Deterministic rubric |
| 10 | **Route / Cannibalization** | `New Article`, `Optimize URL`, `Cannibalization Risk (slug)`, `New Tool` | Sitemap Overlap Gate |
| 11 | **Priority, E-E-A-T & Actions** | `P0–P2` + `E-E-A-T ✓/Missing` + `Deep Dive` · `Add Angle` · `Pin` | User + Agent workflow |

---

## 6. Dedicated "Keyword Overview" Deep-Dive View (Semrush Parity + AI-Native Edge)

- **Zone A · Command Bar & Personalization:** Single-keyword search, Bulk Analysis toggle (1–100 terms), Country & Device selector (`US`/`UK`/`PK`/`Global`, `Desktop`/`Mobile`), and automatic Domain Personalization comparing user's OpenPageRank authority against the live SERP.
- **Zone B · Six-Metric Telemetry Strip:** Volume & Country Split, KD % Ring Gauge, Search Intent + Funnel tag, 12-Month Trend Bar, CPC / Commercial Density, and KGR + AI Overview (GEO) Citation Count.
- **Zone C · Three-Column Keyword Ideas:** (1) **Keyword Variations** (A–Z Autocomplete + modifiers), (2) **Real Questions** (People Also Ask + Reddit/Quora), and (3) **Mini Topical Strategy Tree** (Pillar → Supporting Subpages).
- **Zone D · Live Top-10 SERP Breakdown & Community Pulse:** Ranking URL, Domain Authority (OpenPageRank), Word Count, Readability, Load Speed, H2 Outline, AI Overview flag, Reddit/Quora pain points, and one-click handoff to **Add Unique E-E-A-T Angle** or **Send Dossier to Production**.
- **Zero-Waste Execution:** Live fetchers + deterministic rubrics run at `$0` LLM cost; only the final competitor gap synthesis uses 1 compact LLM call.

---

## 7. Free-to-Paid SEO Data API Stack & Commercial Unit Economics

- **Ahrefs API v3 (Skip):** No free production tier. Complimentary test queries only return sample data for `ahrefs.com`; real lookups start at $129/mo (Lite, 100 rows/request cap) up to $1,499/mo (Enterprise). ([Ahrefs Docs](https://docs.ahrefs.com/en/api/docs/introduction), [1Lookup Audit](https://www.1lookup.io/compare/ahrefs))
- **Google Ads Keyword Planner API (Defer):** 15,000 ops/day on Basic access ([Quotas](https://developers.google.com/google-ads/api/docs/best-practices/quotas)), but requires active ad billing and strict [Developer Policy](https://support.google.com/adspolicy/answer/6169371?hl=en) approval.
- **$0 Launch Stack (~85% of Semrush Today):** Google/YouTube/Bing Suggest + [Keyword Tool Guest MCP](https://keywordtool.io/api) + [Open PageRank API](https://keywordseverywhere.com/openpagerank) (30,000 domains/mo free) + [Serper.dev](https://serper.dev/) (2,500 free Google SERPs & `allintitle:` KGR; then $50/50k) + Reddit JSON/Quora + User GSC/CSV uploads.
- **Paid Upgrade — [DataForSEO](https://dataforseo.com/pricing):** `$1` free trial credit, then **`$50` non-expiring pay-as-you-go deposit** (buys 450,000+ Labs keyword lookups or 33,000+ SERPs per [Minimum Payment FAQ](https://dataforseo.com/help-center/minimum-payment)). Active Starter subscribers ($29–$49/mo) cost **~$0.50–$1.20/mo** in data APIs, so the first 2 paying users fund the initial $50 pool.
- **Trust Positioning & Fair-Use:** Market as **"Live Search Data + Specialist AI Strategy"** (zero fake AI volume). Cached lookups & `$0` tools stay 100% unlimited; generous fair-use caps (500 / 2,000 / 5,000/mo) apply only to uncached live refreshes (matching Semrush's own model).

---

## 8. Real-Time SaaS Startup Backend & Two-Layer Caching (Redis + Supabase)

- **Layer 1 — [Upstash Serverless Redis](https://upstash.com/pricing/redis) (The Front Desk Receptionist):** Native HTTP on Cloudflare Workers (**500,000 free commands/mo + 250 MB free**; PAYG $0.20/100k or $10/mo Fixed unlimited). Handles **atomic rate limiting** (blocks rapid bot clicks), **in-flight request locking** (`SET NX EX` so simultaneous searches pay the API once), and 24-hour hot keyword caching in <0.1s with 0 Supabase reads.
- **Layer 2 — Supabase Postgres (The Main Filing Cabinet):** Stores user accounts, subscriptions, credit pools, saved workspaces, and a **30-day durable global keyword & SERP cache** indexed by normalized `query_hash`.
- **Swappable `CacheAdapter`:** Single env var (`CACHE_PROVIDER=upstash | cf_kv | supabase_only`).
- **Master Pool → Retail User Chunks:** Wholesale provider pools tracked centrally; subscribers spend structured monthly chunks while cache hits deduct 0 (or minimal) credits.

---

## 9. Super Admin Control Center & AI Agent Studio (Draft → Test → Publish Live)

Role-gated `/admin` UI (`role = 'super_admin'`):
1. **Master API Pool & Margin Monitor:** Live remaining balances across DataForSEO, Serper, OpenPageRank, and LLM spend (Gemini/OpenAI), Cache Hit Ratio %, Dollars Saved, and low-balance alerts.
2. **User & Subscription Controls:** Search users, view registered websites & usage, grant bonus chunks, pause abusers, toggle `Founder Unlimited`.
3. **Zero-Deploy Live Switches (`system_config`):** Flip `free-hybrid` ↔ `dataforseo`, flip `gemini` ↔ `openai`, adjust cache TTLs, or edit tier quotas live.
4. **Two-Folder AI Agent Studio (`LIVE` vs. `DRAFT`):** Edit System Prompts, Rubric Weights, or upload Knowledge Base PDFs/research papers into Supabase under `DRAFT` (zero customer disruption). Toggle **Beta Sandbox Test Mode** on a test website for **Side-by-Side (`Old Live` vs. `New Draft`)** verification, then click **Publish Live** (instant rollout + 1-click Rollback). Founder tests use real keys tagged `founder_sandbox` so testing spend stays separate from customer margins.

---

## 10. Thinking-AI Brain Cost & Quality Controls

Four controls reduce Thinking-AI bills by **60–80%** without lowering quality:
1. **Provider Prompt Caching:** Static instructions & rules stay cached on OpenAI/Gemini/Claude servers (**50–90% savings** on repeated input tokens).
2. **Smart Brain Routing (Fast vs. Deep):** Low-cost fast models handle formatting, CSV cleanup, and tagging; flagship deep models handle strategic briefs and flagship articles—configurable per agent in Super Admin.
3. **Selective Supabase RAG Library:** Injects only the top 3 relevant passages per task from uploaded PDFs/guides.
4. **Public Research Cache Only:** Private brand outputs are never shared; generic public SERP gap syntheses can be cached for 14 days.

---

## 11. Privacy-Safe User Data, Telemetry & Learning Policy

- **Visible Account & Workspace Data:** Name, email, plan tier, usage, and registered public website URL(s).
- **Strictly Private Customer Assets:** Saved keyword sheets, GSC/SEMrush CSVs, written articles, brand assets, and full private chats remain strictly isolated per workspace.
- **Automatic Privacy Scrubber:** Strips personal names, emails, phone numbers, API keys, and private figures (`[CLIENT_SITE]`, `[BRAND]`) before any learning/triage logging.
- **Tiered Learning Consent:** Free Trial & Starter keep anonymized learning **ON by default** (disclosed in Privacy Policy) with a clear **Opt-Out Switch** in Settings (~90–95% capture + GDPR-respecting choice). Agency/Enterprise plans include **Zero-Training Strict Privacy Mode ON by default** as a paid trust badge.

---

## 12. 3-Watchdog Mistake Detection, Auto-Grouping & Live Simulation Pipeline

> **Golden Rule:** AI agents **NEVER** auto-publish prompt or lesson updates blindly to paying customers. Every fix passes through **Human Review → Beta Sandbox Test → 1-Click Publish Live**.

- **Watchdog 1 — Instant Rule Checker (`$0`, 100% of replies in 0.01s):** Flags crashes (`Invalid block`), empty replies, broken Hard Bans (slogan gluing, stale years, fake URLs), missing columns, or off-niche drift.
- **Watchdog 2 — User Frustration Detector (`$0`, 100% of sessions):** Flags **👎 Thumbs Down**, >70% silent deletion of generated items, or rapid correction prompts within 30 seconds.
- **Watchdog 3 — Background AI Quality Inspector:** Runs asynchronously on 100% of Watchdog 1 & 2 flags plus a 5% random sample of unflagged chats to diagnose subtle context drops and sort each unique **Case ID** (`ERR-101`, `ERR-102`) into matching **Mistake Group Panels** in Supabase (preserving every user's exact query/reply).
- **4-Button Super Admin Fix Pipeline:** (1) `Merge into Unified Fix Doc` (writes a global Do/Don't lesson to `DRAFT` `agent_lessons_learned`) → (2) `Edit Draft Rule` → (3) `Test in Beta Sandbox` (replays failed prompts side-by-side) → (4) `Publish Live` (marks Resolved and auto-reopens with a `Regression Alert` if it ever recurs).
- **Pre-Launch Live Simulation Mode:** 1-click **"Simulate Bad Reply" Fire-Alarm Button** in Super Admin injects a synthetic error so the founder can verify in real time that Watchdogs catch it, log a Case ID in Supabase, and live-update the Mistake Triage table—plus a 20–30 prompt **Messy User Stress-Test Pack**.

---

## 13. Dashboard Mutation Rules, Calendar Agent & Rolling Lock Window

- **Strict Mutation Permissions:** Keyword Research controls list ordering & exact row placement; On-Page & Technical SEO can **never** fake scores (only apply real fixes & re-scan); the lightweight **Calendar Agent** owns dates, timezones, spacing cadence, and lock states.
- **Hard Cap Sync, Confirmation Card & Auto-Posting:** Calendar caps max schedulable count at Finalized Keywords and checks remaining plan tokens upfront. Any lock or token-spending chat command pops a mandatory 1-click Confirmation Card. Optional **Auto-Posting Mode** locks top-priority finalized keywords automatically after the user's chosen waiting window (enforcing the 5-minute relaxation gap).
- **5-Stage Rolling Lock Window:** (1) `Queued (Editable)` (>5 min away — full swap/reorder/cancel freedom) → (2) `Grace Window (5 min)` (1-click Pause/Undo at `$0`) → (3) `Locked (Up Next)` (within 5 min) → (4) `In Production` → (5) `Published / Done`.

---

## 14. Animated Node Handoffs & Middle E-E-A-T Dynamic Authority Agent

- **Live Animated Node-to-Node Handoffs:** Agents ask before delegating; upon confirmation, a glowing pulse travels from Source Agent Node → Target Agent Node, flashes Acknowledged, and confirms in chat.
- **Middle E-E-A-T & Human Authority Agent (Core USP):** Every keyword row has an **"Add Your Unique Angle (E-E-A-T)"** button editable anytime until locked. Generates a **dynamic 6–8 question bank** tailored to that topic (nudging users to answer at least 3–4), accepts rough drafts, H2 preferences, AnswerThePublic/Reddit notes, or exact lists (*"Review these exact 10 tools"*), and shows a **Ranking Risk Warning** if skipped (Primary CTA: `Add My Unique Points`; secondary: `Proceed Anyway`).

---

## 15. Strict Specialist Ownership Matrix, Article Writer V8 & Final QA Gate

| Specialist Agent | Strictly Owns (Final Authority) | Quality Gatekeeper & Handoff |
| :--- | :--- | :--- |
| **Keyword Research** | Primary/secondary/long-tail keywords, intent, KD/KGR, clusters, cannibalization, SERP gap & Reddit/Quora dossier | Rejects junk/cannibalizing terms; hands slug/meta requests to On-Page SEO, unique ideas to E-E-A-T, scheduling to Calendar |
| **Middle E-E-A-T** | Dynamic 6–8 question bank, user's personal proof, custom tool lists, rough notes | Shows Ranking Risk Warning if skipped; feeds Article Writer |
| **On-Page SEO** | **Slug URLs, Meta Titles, Meta Descriptions, Schema Markup**, heading hierarchy & **final approval of all Internal & External Links** | Warns user when a proposed slug/meta breaks site structure; proposes optimal brand-matched alternative |
| **Article Writer V8** | Outline, storytelling, audience tone, natural keyword flow (~0.8–1.5%), candidate links, visiting user-named tool URLs, **surgical post-draft chat edits** | Cannot finalize links without On-Page SEO approval; defaults to `Ready for Final Review` |
| **Final QA Gate** | Lightweight Managing Editor safety net: readability, logical flow, originality/plagiarism safety, live 404 link ping, cross-agent consistency (H1 ↔ Meta ↔ Slug ↔ Schema ↔ E-E-A-T) | Blocks broken/inconsistent packages before user review or publish |

---

## 16. 7-Step Locked Article Assembly Line & Article Studio Workspace

Once a keyword locks, the dashboard sets clear expectations (*"Crafting step-by-step — ~2–3 minutes"*) and executes sequentially:
1. **Keyword & Research Recheck (Keyword Research):** Re-validates the locked keyword and finalizes the Research Dossier + live PAA/Reddit/Quora FAQ pool.
2. **On-Page Blueprint (On-Page SEO):** Locks Slug URL, Meta Title, Meta Description, H1–H3 outline, and Schema plan before writing starts.
3. **Staged Writing (Article Writer V8):** Writes sequentially: (a) **AI Overview Box (GEO 40–60 words)** → (b) **Hook, Intro & Table of Contents** → (c) **Main Body with E-E-A-T & candidate links** → (d) **Live-Researched FAQs**.
4. **On-Page Verification & Link Approval (On-Page SEO):** Approves all internal/external links and finalizes matching JSON-LD Schema.
5. **Readability, Storytelling & Originality Gate (Final QA):** Checks readability grade, logical transitions, originality, 404 links, and E-E-A-T inclusion.
6. **Blog Visuals (Visual & Infographic Designer):** Produces brand-locked Featured Image + in-article diagrams.
7. **Article Studio Workspace:** Lands in `Article Studio`; clicking any article opens its dedicated workspace (preview, surgical prompt edits, On-Page scores, QA report, visuals, Publish/Export).

---

## 17. Visual vs. Social Org Chart & Multi-Agent Group Chat ("Agency War Room")

- **Visual & Infographic Designer:** Owns **all visuals** (blog featured images, in-article infographics, and social graphics) to keep every asset 100% brand-locked. Includes a built-in **Visual Copywriter micro-skill** (punchy 4–7 word headlines, stat callouts—never walls of blog text) and pulls alt text/SEO context from On-Page SEO.
- **Social Media Manager:** Owns **platform distribution** (LinkedIn posts/carousels, Pinterest SEO pins, Facebook posts, TikTok/Reels scripts). Writes platform-native hooks/captions and hands visual briefs to the Visual Designer via animated node handoff.
- **Multi-Agent Group Chat ("Agency War Room"):** Users can select up to **3 specialists together** (e.g., `Visual Designer` + `On-Page SEO`) in one chat. A lightweight router executes **sequential turns** (On-Page SEO outputs keyword-aligned labels & alt text first → Visual Designer immediately builds the brand-locked layout around those exact words) so agents never talk over each other or waste tokens.

---

## 18. Two-Track Existing Page Optimization vs. New Growth Architecture

No separate redundant "Audit Agent" is needed—**Chief Copilot** runs all 4 specialists' quick checks together to produce a unified **4-Part Page Scorecard** (Technical + On-Page + Keyword Fit + Content/E-E-A-T) with 1-click **"Fix with [Specialist]"** buttons.

| Dashboard Screen | Two Clean Tabs | What Lives There |
| :--- | :--- | :--- |
| **Keyword & Topics** | **Tab 1:** New Keyword Ideas · **Tab 2:** Existing Page Optimization Plans *(inactive by default)* | Tab 1 = clean 11-column new backlog; Tab 2 = activates ONLY on-demand for user-requested existing URLs with a dedicated 5-column gap table. |
| **On-Page & Refresh** *(Home of Existing Pages)* | **Tab 1:** Existing Website Pages · **Tab 2:** New Article Blueprints | Tab 1 lists all sitemap URLs (Blogs/Services/Landing/Tools) with **Quick On-Page Fix** (30s Meta/H1/Schema patch) OR **Deep Keyword & Content Refresh**. |
| **Article Studio** | **Tab 1:** New Articles · **Tab 2:** Refreshed Pages | Tab 2 preserves live text word-for-word and shows a **Side-by-Side Diff** with newly woven keywords + fresh E-E-A-T points. |
| **Agency Calendar** | **One Unified Timeline** (`New Article` vs. `Page Refresh` badges) | Shares the exact same Rolling Lock Window & 5-minute buffer. |

- **Strict Page-Type Rule:** On a **Homepage, Service Page, or Landing Page**, agents **never** convert it into a 2,500-word blog essay—they optimize commercial/transactional keywords, hero headlines, benefit bullets, trust proof, and conversion FAQs.

---

## 19. Universal Agency Awareness ("Agency Handbook") & Polite Off-Topic Guardrails

- **Shared Agency Handbook:** Every specialist holds a tiny, prompt-cached map of all teammates and existing dashboard screens. If asked for something outside its lane (e.g., asking Visual Designer to optimize a blog post), it helps with its own piece (images) and warmly guides the user to the exact right specialists (On-Page SEO, Keyword Research, Technical SEO).
- **Honest "Not Built Yet" Fallback:** If a user asks for a feature not yet in the dashboard (e.g., an inline image compressor), agents never hallucinate fake buttons—they state honestly that it isn't built in yet and recommend a practical workaround.
- **Polite Off-Topic Guardrails:** Turns 1–2 give a short helpful answer using the **fast cheap model** (never burning Thinking models or paid SEO APIs) with a warm reminder of the agent's SEO mission; Turn 3+ gently redirects back to website growth.

---

## 20. 4-Pillar Memory & Context Management (With Strict Latest-Version Precedence)

- **Master Project Binder (4 Supabase Folders per `workspace_id`):** (1) Brand & Site Identity Card, (2) Article & Page Memory Cards (Live URL, Keyword, Publish Date, Last Refresh Date, E-E-A-T Points, Approved Meta/Schema, Social Posts Published), (3) Active Pipeline & Calendar State, (4) Chat History Archive + 4-Bullet Summaries.
- **`$0` Smart Context Picker:** Never dumps 200 articles into a prompt—loads ONLY the specific Article Memory Card referenced (or open on screen), or a compact 1-line index for broad questions.
- **Strict Latest-Version Precedence Rules:** (1) **Live Dashboard Memory Card ALWAYS wins** over older chat text; (2) when reading chat history for multi-updated articles, agents MUST sort strictly by **newest timestamp** and ignore superseded drafts; (3) active chats use a **Sliding Window (last 6–8 messages) + 5-Bullet Rolling Summary**; (4) strict `workspace_id` isolation; (5) transparent Activity Timeline where users can view/edit saved memory notes.

---

## 21. Workspace Behavior Card, Anti-Generic Thinking & Existing-Page Social Promotion

- **`$0` Workspace Behavior & Site Health Snapshot (Supabase):** Automatically tracks user habits (`eeat_skip_rate`, `avg_onpage_score`, `social_promotion_coverage`, `preferred_working_style`, `recent_wins` vs. `untouched_gaps`) via simple counters. When a user asks *"Why isn't my site ranking?"*, specialists call out real workspace blockers naturally (e.g., *"You skipped E-E-A-T unique points on 5 of your last 6 posts"*) instead of generic ChatGPT advice.
- **Whole-Website Goals:** **Chief Copilot** owns site-wide strategy; individual specialists answer broad site-wide questions through their own unique expert lens (Keyword vs. On-Page vs. Visual) and link straight to exact dashboard panels.
- **Existing Page Social Media Optimization:** 1-click **`Promote / Repurpose Existing Page`** button inside `On-Page & Refresh → Existing Site Pages` and `Social & Video Hub`. Social Manager reads any existing blog or landing page, builds LinkedIn/Pinterest/Facebook/Reels assets, hands visual briefs to Visual Designer, and logs results onto that page's Memory Card.
- **4-Ingredient Anti-Generic Formula:** Every specialist reply blends (1) its unique specialist mindset, (2) the user's live Workspace Behavior Card, (3) exact dashboard placement, and (4) honest niche-specific SEO/GEO strategy.

---

## 22. On-Page SEO Specialist: 100-Point Objective Rubric & Zero-Conflict Relay

### Zero-Overlap Boundary (70% Existing Pages · 30% New Articles)
- **Keyword Research = "WHAT to target"** (discovery, intent, KD/KGR, competitor gaps).
- **On-Page SEO = "WHERE & HOW to optimize the page"** (Slug URL, Meta Title, Meta Description, H1–H3, keyword placement & density, Schema Markup, Alt Text, Internal & External Link approval).

### Objective 100-Point On-Page SEO Rubric (`$0` Live HTML Audit — Zero Fake Scores)

| Category | Max Pts | Exact Measurable Checks |
| :--- | :---: | :--- |
| **1. Meta Title & Description CTR** | **20** | Title 50–60 chars (no truncation), primary keyword near front, unique; Meta Description 140–158 chars with benefit; current year (`2026`). |
| **2. Slug URL & Canonical Hygiene** | **10** | Short lowercase slug (`<= 5` words), matches primary keyword, no random IDs/dates, fits site folder pattern, valid canonical tag. |
| **3. Heading Hierarchy & Page-Type Fit** | **15** | Exactly one H1 aligned with Title, clean H2→H3 nesting, secondary keywords in natural H2s, format matches Page Type (Landing/Service vs. Blog). |
| **4. Keyword Placement & Natural Density** | **15** | Primary keyword in H1, first 100 words, and an H2; secondary terms woven naturally; penalizes stuffing (>2.5%) and cannibalization. |
| **5. Internal & Authority External Links** | **15** | Minimum 3 relevant internal links with descriptive anchors, 1–2 authoritative external citations, zero `404` broken links, non-orphan page. |
| **6. Schema Markup & AI Overview (GEO)** | **15** | Valid JSON-LD Schema matching page type (`Article`, `FAQPage`, `SoftwareApplication`, `Service`) + crisp 40–60 word direct-answer summary near top. |
| **7. On-Page Media, Alt Text & Scannability** | **10** | Descriptive Alt Text on all content images, flags oversized images (`>200 KB`), short scannable paragraphs and clean lists/tables. |
| **Total On-Page Score** | **100** | **85–100:** Strong (Green) · **60–84:** Needs Polish (Amber) · **<60:** Priority Fix (Red) |

### On-Demand `Existing Page Optimization Plans` Tab (Inside Keyword Research)
- **Inactive/Empty by Default:** Keeps Keyword & Topics clutter-free. Activates **only** for specific existing URLs requested for optimization.
- **Dedicated 5-Column Gap Table (Stored in Supabase for Reuse):**
  1. `Current Target Keyword` (from live H1/Title)
  2. `Coverage Status` (`Covered ✓`, `Under-Optimized`, `Missing`, `Cannibalization Risk`)
  3. `Missing Long-Tail & Subtopics` (high-value secondary terms + PAA/Reddit questions)
  4. `Competitor Gap Proof` (rival URLs winning on this gap & their angle)
  5. `Recommended Placement` (`Add to Meta/H1`, `Add New H2 Section`, `Add to FAQ`, `Keep As-Is`)

### Strict Relay Race, One-Line Chief Trigger & Universal Live Status Check
1. **Keyword Prerequisite Gate:** On-Page SEO never starts keyword optimization until Keyword Research delivers the Existing Page Keyword Plan.
2. **On-Page → Article Writer Handoff:** On-Page SEO upgrades only what it owns (Meta, Schema, Slug guidance, Density/Cannibalization check, Link plan), then sends the complete SEO Copy & Keyword Plan to **Article Writer** for body updates and guides the user to switch over.
3. **One-Line Chief Copilot Trigger:** Telling Chief Copilot *"Optimize `example.com/blog/meta-title-guide`"* automatically coordinates `Keyword Research → On-Page SEO → Article Writer → Final QA`.
4. **Universal Live Pipeline Status Card (Supabase):** Any specialist asked *"Where did yesterday's optimization reach?"* reads the shared status card and reports exact progress across all stages.

---

## 23. Ongoing Research Queue (Incomplete — Next Rubrics to Architect)

- [x] Keyword Research OS (12 Skills, 100-Pt Rubric, Cannibalization, KGR, Topical Maps, Mode A & B Competitor Gap)
- [x] Dedicated Keyword Overview Deep-Dive View (Semrush Parity + AI-Native Edge)
- [x] Free-to-Paid SEO Data API Stack, Unit Economics & Trust Positioning
- [x] Real-Time SaaS Backend, Upstash Redis + Supabase 2-Layer Caching & Master Pool Allocation
- [x] Super Admin AI Agent Studio (Draft/Test/Publish), Thinking-AI Cost Controls, Privacy Policy & 3-Watchdog Mistake Detection + Live Simulation Mode
- [x] Dashboard Mutation Rules, Calendar Agent, Rolling Lock Window, Animated Node Handoffs, Middle E-E-A-T Agent, Strict Specialist Ownership Matrix, Article Writer V8 & Final QA Gate
- [x] 7-Step Locked Article Assembly Line, Visual vs. Social Org Chart, Multi-Agent Group Chat War Room, Two-Track Existing Page Optimization, Universal Agency Awareness, Off-Topic Guardrails & 4-Pillar Memory Management with Strict Latest-Version Precedence
- [x] Workspace Behavior Card, Anti-Generic Thinking, Existing-Page Social Promotion, On-Page SEO 100-Point Objective Rubric, On-Demand Existing Page Keyword Plans & Universal Live Pipeline Status Card
- [ ] **Next:** Technical SEO Audit AI Agent 100-Point Rubric & Zero-LLM Diagnostic Architecture
- [ ] **Next:** Visual & Brand Studio V8 and Social/Video Hub V8 Scoring Rubrics
