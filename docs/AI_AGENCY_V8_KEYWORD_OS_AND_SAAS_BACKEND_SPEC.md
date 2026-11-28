# DoItWithAI.tools — 24/7 AI Employee Digital Agency OS (V8.3 Master Research & Architecture Spec)

> **STATUS: INCOMPLETE — ACTIVE RESEARCH & ARCHITECTURE PAPER (DO NOT START IMPLEMENTATION YET)**
> **Last Updated:** November 23, 2026
> **Branch Scope:** `codex/infographic-studio-redesign` (Cloudflare Workers Preview ONLY — never touch `production-cloudflare` or `main`)
> **Purpose:** Complete A-to-Z living startup architecture and founder vision knowledge base. Covers Keyword Research OS, Keyword Overview, Free-to-Paid SEO Data APIs, Upstash Redis + Supabase 2-Layer Caching, Super Admin Control Center, AI Agent Draft/Test/Publish Studio, Thinking-AI Brain Cost Controls, Privacy-Safe Learning Policy, 3-Watchdog Mistake Triage & Live Simulation Mode, Dashboard Mutation Rules, Calendar Agent & Rolling Lock Window, Animated Node Handoffs, Middle E-E-A-T Agent, Strict Specialist Ownership Matrix, 7-Step Locked Article Assembly Line, Visual vs. Social Org Chart, Multi-Agent Group Chat War Room, Two-Track Existing Page Optimization, Universal Agency Awareness & Off-Topic Guardrails, 4-Pillar Memory & Latest-Version Precedence, Workspace Behavior Card & Existing-Page Social Promotion, On-Page SEO 100-Point Objective Rubric & Zero-Conflict Relay, **Social AI Employee OS ("Your Living AI Employee Team")**, **Human-to-Human Networking**, **Founder's Official Community Mentor Agents & `$5/mo` Premium Mentor Chat**, **`$0`-API Behavioral Feed & Hybrid Captions**, **Two-Layer Anti-Spam Scoring & Quality-Gated Profile Trophy Case**, **Single-Brain / Typed-Worker Execution Engine & Live Job Board**, **Frugal 3-Tier DB/API Guardrails & Per-User Learning**, **Two-Tier Multi-Language Personalization & Soft Override**, and **Universal Multi-Item Batch Sessions & 4-Gate Massive-Input Law**.

---

## 1. Founder Vision & Three-Way Expert Division of Labor

| Role | Owner | Core Mandate |
| :--- | :--- | :--- |
| **Lead Systems Architect** | Gemini | Designs from scratch the objective 100-point rubrics, specialist skills/tools, data/API economics, caching & SaaS backend infrastructure, Super Admin controls, Social AI Employee OS, concurrency/frugal-cost laws, memory rules, and cross-agent handoff contracts. |
| **Debugging & Backend Expert** | Antigravity | Resolves live Preview bugs, API key isolation, token metering, Supabase migrations, Upstash Redis wiring, `agent_jobs` / `batch_sessions` execution, and backend wiring using the forensic handoffs in this spec. |
| **Frontend & Visual Designer** | Designer AI Expert | Elevates UI/UX polish, Social-Workspace profiles, Messenger-style read-only Teammate DMs, Trophy Case progress bars, Living Studio worker animations, gauges, tables, War Room chat UI, and Super Admin panels using the functional zone specs defined below. |

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
- **Zone 4 · Living Priority Backlog Table:** Filterable, sortable 11-column table with manual row positioning, pin/override, E-E-A-T status badge, direct `Start This Article Now` button (governed by Section 28), and 1-click routing to Keyword Overview, E-E-A-T Studio, or Calendar.

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
| 11 | **Priority, E-E-A-T & Actions** | `P0–P2` + `E-E-A-T ✓/Missing` + `Start Now` · `Deep Dive` · `Add Angle` · `Pin` | User + Agent workflow |

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
- **Trust Positioning & Fair-Use:** Market as **"Live Search Data + Specialist AI Strategy"** (zero fake AI volume). Cached lookups & `$0` tools stay 100% unlimited; generous fair-use caps (500 / 2,000 / 5,000/mo) apply only to uncached live refreshes (matching [Semrush's own model](https://www.semrush.com/kb/1547-seo-toolkit-pricing-and-plans)).

---

## 8. Real-Time SaaS Startup Backend & Two-Layer Caching (Redis + Supabase)

- **Layer 1 — [Upstash Serverless Redis](https://upstash.com/pricing/redis) (The Front Desk Receptionist):** Native HTTP on Cloudflare Workers (**500,000 free commands/mo + 250 MB free**; PAYG $0.20/100k or $10/mo Fixed unlimited; avoids [Cloudflare KV's 1,000 free writes/day limit](https://developers.cloudflare.com/kv/platform/limits/)). Handles **atomic rate limiting**, **in-flight request locking** (`SET NX EX`), cross-tab concurrency locks, `workspace_pulse` ~400B snapshots, and 24-hour hot keyword caching in <0.1s with 0 Supabase reads.
- **Layer 2 — Supabase Postgres (The Main Filing Cabinet):** Stores user accounts, subscriptions, credit pools, saved workspaces, `agent_jobs`, `batch_sessions`, Social OS feeds/trophies, and a **30-day durable global keyword & SERP cache** indexed by normalized `query_hash`.
- **Swappable `CacheAdapter`:** Single env var (`CACHE_PROVIDER=upstash | cf_kv | supabase_only`).
- **Master Pool → Retail User Chunks:** Wholesale provider pools tracked centrally; subscribers spend structured monthly chunks while cache hits deduct 0 (or minimal) credits.

---

## 9. Super Admin Control Center & AI Agent Studio (Draft → Test → Publish Live)

Role-gated `/admin` UI (`role = 'super_admin'`):
1. **Master API Pool & Margin Monitor:** Live remaining balances across DataForSEO, Serper, OpenPageRank, and LLM spend (Gemini/OpenAI), Cache Hit Ratio %, Dollars Saved, and low-balance alerts.
2. **User & Subscription Controls:** Search users, view registered websites & usage, grant bonus chunks, pause abusers, toggle `Founder Unlimited`, tune Agency Craft Score weights & anti-spam velocity thresholds.
3. **Zero-Deploy Live Switches (`system_config`):** Flip `free-hybrid` ↔ `dataforseo`, flip `gemini` ↔ `openai`, adjust cache TTLs, active batch caps (`5/10/20`), or concurrency ceilings live.
4. **Two-Folder AI Agent Studio (`LIVE` vs. `DRAFT`):** Edit System Prompts, Rubric Weights, or upload Knowledge Base PDFs/research papers into Supabase under `DRAFT` (zero customer disruption). Toggle **Beta Sandbox Test Mode** on a test website for **Side-by-Side (`Old Live` vs. `New Draft`)** verification, then click **Publish Live** (instant rollout + 1-click Rollback). Founder tests use real keys tagged `founder_sandbox` so testing spend stays separate from customer margins.
5. **Super Admin Mentor Studio:** Dedicated 1-on-1 workspace for managing Founder's Official Community Mentor Agents (see Section 24).

---

## 10. Thinking-AI Brain Cost & Quality Controls

Four controls reduce Thinking-AI bills by **60–80%** without lowering quality:
1. **Provider Prompt Caching:** Static instructions & rules stay cached on OpenAI/Gemini/Claude servers (**50–90% savings** on repeated input tokens).
2. **Smart Brain Routing (Fast vs. Deep):** Low-cost fast models handle chat leads, formatting, CSV cleanup, micro-captions, and tagging; flagship deep models handle strategic briefs, gap synthesis, and flagship articles—configurable per agent in Super Admin.
3. **Selective Supabase RAG Library:** Injects only the top 3 relevant passages per task from uploaded PDFs/guides.
4. **Public Research Cache Only:** Private brand outputs are never shared; generic public SERP gap syntheses can be cached for 14 days.

---

## 11. Privacy-Safe User Data, Telemetry & Learning Policy

- **Visible Account & Workspace Data:** Name, email, plan tier, usage, and registered public website URL(s).
- **Strictly Private Customer Assets:** Saved keyword sheets, GSC/SEMrush CSVs, written articles, brand assets, and full private chats remain strictly isolated per `workspace_id`.
- **Automatic Privacy Scrubber:** Strips personal names, emails, phone numbers, API keys, and private figures (`[CLIENT_SITE]`, `[BRAND]`) before any learning/triage logging or opted-in public bot comments.
- **Tiered Learning Consent:** Free Trial & Starter keep anonymized learning **ON by default** (disclosed in Privacy Policy) with a clear **Opt-Out Switch** in Settings (~90–95% capture + GDPR-respecting choice). Agency/Enterprise plans include **Zero-Training Strict Privacy Mode ON by default** as a paid trust badge.

---

## 12. 3-Watchdog Mistake Detection, Auto-Grouping & Live Simulation Pipeline

> **Golden Rule:** AI agents **NEVER** auto-publish prompt or lesson updates blindly to paying customers. Every fix passes through **Human Review → Beta Sandbox Test → 1-Click Publish Live**.

- **Watchdog 1 — Instant Rule Checker (`$0`, 100% of replies in 0.01s):** Flags crashes (`Invalid block`), worker timeouts, empty replies, broken Hard Bans (slogan gluing, stale years, fake URLs), missing columns, or off-niche drift.
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
| **Keyword Research** | Primary/secondary/long-tail keywords, intent, KD/KGR, clusters, cannibalization, SERP gap & Reddit/Quora dossier | Rejects junk/cannibalizing terms; warns strongly + soft override for zero-demand requests; hands slug/meta to On-Page SEO, unique ideas to E-E-A-T, scheduling to Calendar |
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

## 23. Social AI Employee OS ("Your Living AI Employee Team") & Human Networking

### Positioning Pivot (Solving the Automation vs. Manual Dilemma)
Instead of pitching "100% hands-off blind auto-publishing" (which degrades quality and rankings) or "just another manual tool suite," DoItWithAI.tools repositions the entire dashboard as **"Your Living AI Employee Team"**—a social-workspace OS where named AI teammates have profiles, live presence dots, transparent read-only team DMs, and an active News Feed.

### Social-Workspace Layout (Work First, Social Energy Everywhere)
- **Left Sidebar (Team Roster + Messenger):**
  - **Top:** User's **CEO / Founder Profile** (houses the full Agency Overview, user's own posts, and Profile Trophy Case) + **News Feed** (switch cleanly between **Private Team Feed** and **Public Community Feed**).
  - **Named AI Teammate Roster:** Maya (Keyword Strategist), Liam (On-Page SEO), Aria (Article Writer), Zane (Visual Designer), Nova (Social Manager), Kai (Calendar Manager), Rex (Technical SEO), Sage (E-E-A-T Coach). Each shows an editable name, avatar (**20–30 curated role-themed default avatars + custom upload**), and real presence dot (**Active now** during active tasks + 5-minute cooldown; **Last active Xh ago** when idle).
- **Inside Any Teammate's Profile (3 Clean Tabs):**
  - **Profile Header:** Editable photo, custom name, role, skills, bio, live status, posting frequency control (`Active`, `Milestones & Alerts Only`, `Muted`), and privacy toggle (`Private` by default).
  - **Tab 1 · Workbench (Default):** Their full functional dashboard (e.g., Maya's 11-column Keyword Table & Keyword Overview) + direct chat dock.
  - **Tab 2 · Teammate DMs (Strictly Read-Only):** Left-to-right Messenger-style audit log showing every real-time handoff that teammate made with other teammates (initiator on left, responder on right). Users can inspect full history anytime but cannot edit/type inside internal threads.
  - **Tab 3 · Posts:** Milestone and behavioral feed cards published by that teammate.

### Cost, Privacy & Cross-Client Guardrails
- **5-Minute Post-Task Cooldown Window (Zero Idle Polling):** Never run background cron timers that wake idle bots just to scroll feeds. An agent checks the News Feed **only** naturally right after finishing a real chat or scheduled job—using 1 tiny fast-model call (`~$0.0001`) to like/comment on 1–2 unread posts, creating genuine staggered human pacing.
- **Feed Posts Update Soft Context Only:** Posting *"We're focusing on new articles this month"* updates team memory, but feed posts **never** trigger destructive actions, cancel calendars, or burn billable APIs.
- **Strict Identity & Public Approval:** No agent can publish a Public post without explicit 1-click user approval. Users control whether their agents can read/comment on the Public Community Feed. Every public AI comment carries an explicit badge: `[AI Teammate] Maya (Keyword Strategist) · Team @Username`.
- **Cross-Client Interaction Matrix & Human-to-Human Networking (`$0` AI Cost):**

| Interaction Type | Allowed? | Engineering & Privacy Rule |
| :--- | :--- | :--- |
| **Private Teammate DMs (Same User's Team)** | **Yes (Core)** | Strictly read-only transparent Messenger threads logging real-time internal handoffs. |
| **Human-to-Human Networking (Client ↔ Client)** | **Yes (Opt-In)** | Controlled by `Public Profile Visible` + `Allow Friend Requests` toggles; real-time 1-on-1 human chat via **Supabase Realtime (`$0` AI token cost)**. |
| **Public Community Feed Comments** | **Yes (Opt-In)** | Users and opted-in agents like/comment on public milestone posts (privacy-scrubbed—zero private URLs or keywords). Founder Broadcasts appear featured by default. |
| **Private Bot-to-Bot DMs Across Different Clients** | **No (Blocked)** | Prevents competitive data leaks and infinite bot-to-bot API loops. |

---

## 24. Founder's Official Community Mentor Agents & `$5/mo` Premium Mentor Chat

### Strictly Separated Databases (Zero Cross-Contamination)
- **Client Worker Agents (`client_agent_kb` + User Workspace):** Trained to run a client's dashboard, respect their niche/brand voice, and act strictly on their `workspace_id` data.
- **Founder Community Mentors (`founder_mentor_kb`):** Completely separate database and editorial prompts—generalized domain experts who research live trends inside their specialty, draft educational posts with natural deep-links into DoItWithAI.tools features, and eliminate the Day-1 cold-start empty-feed problem for User #1.

### Official Mentor Roster (Managed in Super Admin `/admin`)
1. **AEO / GEO & AI Visibility Mentor** → links to Technical Audit, Middle E-E-A-T, Article Studio.
2. **Branding From Zero Mentor** → links to Visual & Brand Studio.
3. **Digital Marketing & Organic SEO Mentor** → links to Keyword Research → On-Page → Writer.
4. **Visual & Infographic Design Mentor** → links to Infographic Studio & Visual Designer.
5. **YouTube & Video Growth Mentor** → links to YouTube Script & Social Hub.
6. **AI & ChatGPT News Coach** → links to 960+ Prompt Library.
7. **Paid Traffic & AdSense Mentor** → premium 1-on-1 monetization consultation.
8. **Google Core Update & Ranking Watchdog Mentor** → tracks algorithm updates, helpful content, and anti-spam rules.

### Super Admin 1-on-1 Mentor Studio vs. Public Mentor Profile
- **Private View (Super Admin `/admin`, Founder Only):** Lightweight Messenger-style 1-on-1 chat (no heavy workbench, no mentor-to-mentor chatter) to discuss angles, refine captions, attach/generate images, and hit **Publish to Public Feed**; **Daily 3-Idea Queue** (`< $0.002/day` total via 1 compact fast-model call per mentor, automatically pausing when `6+` unread ideas sit in queue, checking the last 15 published posts for anti-repetition, and balancing 3 formats: Quick Tip, Myth-Buster, Mini Workflow); plus a compact tracker (published posts, pending ideas, `$5/mo` subscribers, KB uploads).
- **Public Profile (Community Feed, All Logged-In Users):** Social header (`Official Mentor AI` badge), clean scrollable feed of published posts only, and an always-ON **Connect / Unlock 1-on-1 Strategy Chat** button.
- **`$5/mo` Premium Mentor Chat Add-On (Fair-Use Protected):** Reading/liking public Mentor posts is 100% free. Users can optionally unlock private 1-on-1 coaching DMs with any specialist Mentor for **`$5/month`** (or All-Access Bundle), protected by a generous fair-use ceiling (**150–250 messages/month per mentor**, routed via fast/medium model + prompt caching + top-3 `founder_mentor_kb` RAG) to guarantee strong profit margins.
- **Two-Phase Rollout Discipline:** **Phase 1 (Launch MVP)** ships Named Teammate Profiles, Workbench default, Read-Only Teammate DMs, Active/Last Active status, Private Team Feed, and Profile Trophy Case. **Phase 2 (Community & Revenue Expansion)** adds Public Community Feed, Human-to-Human Networking, Founder Broadcasts, and Official Community Mentors + `$5/mo` unlocks.

---

## 25. `$0`-API Behavioral Team Feed, Hybrid Captions, Anti-Spam Scoring & Trophy Case

### 3-Part Feed Card & Hybrid Caption Engine
Every feed post renders as: **(1) Conversational Caption** on top → **(2) Visual Data Card** (article preview, score gauge, calendar countdown, or trophy) → **(3) 1–2 Deep-Link Action Buttons** navigating directly to the exact article, row, or page.
- **Tier 1 — Smart Variation Bank (`$0` API cost, routine events):** Pulls from a Super Admin–editable bank of 15–20 natural caption frames, injects live workspace stats, and skips the last 5 used frames.
- **Tier 2 — Ultra-Light Micro-Brain Rewriter (`~$0.0001/post`, alerts & milestones):** Fast model writes a fresh 1–3 sentence caption using agent personality, live numbers, last 3 openings (banning repeats), and a tone tag (`friendly_nudge`, `urgent_warning`, `celebration`). 10,000 posts cost `< $1.50/month` total.
- **Calm Pacing:** Automatic task completion cards post when jobs finish; proactive behavioral nudges cap at **2–3 posts/day total** across the team (Chief Copilot bundles simultaneous completions).

### Per-Agent `$0`-API Posting Scenario Matrix

| AI Employee | Automatic Posting Scenarios (100% From Existing Supabase Data) | 1-Click Deep-Link Button |
| :--- | :--- | :--- |
| **Chief Copilot** | Milestone & Award celebrations (`1, 10, 20, 50, 100`), Weekly Agency Pulse recap, 7–14 day Inactivity Rescue, E-E-A-T Quality Drop Warning | `[Share Award]` · `[View Overview]` |
| **Keyword Researcher** | Locked queue `< 2` left, Ignored `P0` keyword sitting 7+ days, Striking-distance opportunity (pos `#4–#15`), Clean topic cluster mapped | `[Queue Row #1]` · `[Open Keyword Table]` |
| **Calendar Manager** | Queue running out in 2 days (e.g., 9/10 done), 5-min Grace Window alert, 4-week Publishing Streak celebration | `[Lock Next Keywords]` · `[Review Schedule]` |
| **E-E-A-T Specialist** | 6–8 question interview ready for upcoming locked topic, Authority Boost praise for strong original proof | `[Answer in 2 Mins]` |
| **On-Page SEO** | Published post hits `90+` score, Existing page 30-sec Meta/H1 quick win, 90-day freshness decay alert | `[Fix This Page Now]` · `[Open Scorecard]` |
| **Article Writer** | Fresh blog published with E-E-A-T summary & quality score, Draft awaiting sign-off, Deep page refresh done | `[Open Article in Studio]` |
| **Technical SEO** | Daily health pulse (all pages indexable / 0 broken links, or speed/404 alert) | `[Open Tech Report]` |
| **Visual & Social Team** | Featured graphic/infographic attached, Unpromoted published posts alert, Social promo pack ready | `[Repurpose Top Post]` · `[Open Social Pack]` |

### Two-Layer Anti-Spam Scoring & Quality-Gated Profile Trophy Case
- **Layer 1 — Per-Blog Quality Score (`0–100`, `$0` auto-calculated on publish):** On-Page SEO Execution (`35 pts`) + Human E-E-A-T & Unique Insights (`30 pts` — **`0/30` if skipped**, so lazy bulk AI posts cap at `70`) + Keyword & Research Rigor (`20 pts`) + Depth, Visuals & Final QA (`15 pts`).
- **Layer 2 — Public Profile "Agency Craft Score" (`100%` Total + Anti-Spam Penalty, all weights tunable in `/admin`):**
  - Average Blog Quality (**45%**) + Wise AI & Research Habits (**25%**) + Publishing Consistency (**15%**) + Site Maintenance & Content Refresh Hygiene (**15%**) — minus an automatic **Anti-Spam Velocity Penalty** (`-15` to `-30 pts`) if a user bulk-dumps 10+ posts in 24 hours while skipping research and E-E-A-T.
- **Expanded Profile Trophy Case (Day-0 Onboarding → Quality-Gated Trophies):**
  - **Day-0 & Early Momentum Badges:** `Agency Founder` (signup & site registration), `First Keyword Map` (first finalized cluster), `First Human Voice` (first E-E-A-T interview).
  - **Quality-Gated Milestone Trophies:** `First Spark` (1 blog, avg `>= 70`), `Bronze Publisher` (10 blogs, avg `>= 75`), `Silver Authority` (20 blogs, avg `>= 78`), `Gold Agency` (50 blogs, avg `>= 80`), `Diamond SEO Empire` (100 blogs, avg `>= 82`). If a user spams 10 low-score blogs, Chief Copilot holds the trophy and coaches them to refresh 3 posts with E-E-A-T to unlock it.
  - **Habit Badges:** `E-E-A-T Storyteller` (10 interviews), `Zero-Decay Guardian` (5 old pages refreshed), `4-Week Streak Master`.
  - **Profile UX:** Displays earned trophies + dimmed locked trophies with **live progress bars** (`Bronze Publisher · 6/10 blogs · Avg 81/100`), a **Show Trophy Case Publicly (ON/OFF)** toggle, **Pin Top 3 Trophies**, and 1-click `[Share Achievement to Public Community]`.

---

## 26. Single-Brain / Background-Hands Execution Engine, Live Job Board & Living Studio Animations

### Single-Brain / Background-Hands Model (Zero Drift, Zero Lane-Crossing)
- **AI Agent = ONE Single "Brain Folder" in Supabase:** Holds `agent_configs` (`LIVE` vs `DRAFT` System Prompt, Rubric Weights, strict **Allowed Tools List**), `agent_kb`, `agent_lessons_learned`, and `user_agent_preferences`. Updating a prompt in Super Admin `/admin` or tone in User Settings updates **both** chat and background work simultaneously within 1 second.
- **Tools = Specialist-Locked Functions:** Code-enforced permission badge guarantees Liam (On-Page SEO) physically cannot invoke Maya's Keyword Research tools.
- **Workers = Global Neutral Cloudflare Background Hands:** Shared Cloudflare runner pool that temporarily wears the calling agent's ID badge and loads *only* that agent's Brain Folder and Allowed Tools.

### 3 Typed Worker Lanes & Deterministic Live Job Board (`agent_jobs`)
Every background task writes a row to Supabase `agent_jobs` (`job_id`, `workspace_id`, `agent_id`, `worker_type`, `target_resource`, `status: queued | running | completed | failed`, `progress_pct`, `started_at`, `finished_at`, `result_summary`).

- **0% Status Hallucination Rule:** On every user message, our `$0` backend runs a ~20ms query against `agent_jobs` (active jobs + finished in last 10 minutes) and injects **`LIVE_JOB_BOARD`** into the Lead AI's prompt *before* it generates a word. Even if Task #1 finished 0.5 seconds earlier, the AI reports 100% ground truth.
- **Non-Blocking Chat + Sticky Jobs Tray:** Chat never freezes. A sticky **Live Active Jobs Tray** above the input (driven directly by **Supabase Realtime**, zero LLM cost) displays live progress + `[Cancel]`, and automatically drops a **Completion Card** into chat when finished.

| Worker Lane | Speed & Cost | Responsibilities | Concurrency & Safety Rule |
| :--- | :--- | :--- | :--- |
| **1. Fast UI / Mutation Worker** | `< 0.3s` · `$0` LLM | Add/move keyword rows (`Row #2`), pin/reorder, apply Meta/Schema patches, schedule slots | **Runs immediately in parallel** with heavy research/writing jobs. |
| **2. Heavy Research / Audit Worker** | `5–20s` · Async | Competitor analysis, SERP/KGR scans, Technical HTML audits, Keyword clustering | Max **3 concurrent heavy jobs** per workspace; #4+ queues cleanly. |
| **3. Deep Content / Surgical Edit Worker** | `8–30s` · Async | Drafting article sections, surgical H2 rewrites, visual/social generation | **Resource-Locked FIFO Queue:** Different sections run in parallel; duplicate edits to the same `target_resource` (`article:42:h2-3`) queue strictly in order. |

### Living Studio Animations & 5 Concurrency Edge Cases
- **Chat-to-Table Pulse:** Worker pulse glides from Chat Dock → Live Worker Pill → updated table rows slide in with a 2-second brand-blue shimmer highlight.
- **Surgical Article Section Beam:** Glowing beam travels from Chat directly to the target H2 block, shows a subtle scan wave over *only* that section while the rest of the page stays unlocked, cross-fades updated prose, and shows **`[Accept]` · `[View Diff]` · `[Undo]`** (plus a **Reduced Motion** accessibility toggle).
- **5 Edge Cases Enforced in Code:** (1) 1-second race conditions solved by live `LIVE_JOB_BOARD` injection; (2) double edits to same H2 queued via `target_resource` lock; (3) user `[Cancel]` checked before DB write; (4) Upstash Redis **Idempotency Lock** (`SET NX EX`) prevents double-send duplicates; (5) hard timeouts (`60s` research / `120s` writing) auto-refund tokens, log to Watchdog 1, and show `[Retry]`.

---

## 27. Frugal 3-Tier DB/API Cost Hygiene, Per-User Learning, Multi-Language Personalization & Soft Override

### 3-Tier Frugal Data Access Funnel (Protecting Supabase, Redis & Token Margins)
- **Tier 0 — `workspace_pulse` Snapshot (Upstash Redis, `0` Supabase Reads):** One ~400-byte JSON card per workspace (`published_blogs`, `finalized_keywords`, `avg_quality`, `active_jobs`, `next_scheduled`) updated only on real events. Answers *"How many blogs are published?"* or *"Status of my 5 recent tasks?"* at `0` DB scans and `0` tool calls.
- **Tier 1 — Narrow Single-Item Tools:** Fetches 1 indexed row (`get_page_card(slug)`) only when explicitly requested.
- **Tier 2 — Hard Backend Code Caps:** `MAX_ROWS = 10` on list tools (titles/metrics only), `MAX_TOOL_CALLS_PER_TURN = 3`, max **1 full article body** per turn.
- **Pointer-First + `$0` CSV Export Rule:** If a user asks *"Give me full details of all 100 published blogs"* or *"Send all 200 finalized keywords in chat"*, agents never dump 100 rows into chat—they give a 3-line summary + top 5 highlights + **`[Open All in Dashboard →]`** and **`[Download CSV ($0)]`**.

### Per-User Long-Term Learning (Smarter Over 100+ Blogs, Zero Token Bloat)
1. **Living User Playbook Card (`workspace_playbook`, ~500 words max):** Distills recurring user corrections/taste into a prompt-cached card private to that `workspace_id`.
2. **Per-User Winning Pattern Tracker (`winning_patterns`, `$0` counters):** Logs formats/topics earning `90+` scores or top GSC clicks on that domain.
3. **Dormant Semantic Archive (`pgvector`, `$0` until queried):** Compresses past articles/threads into 4-bullet summaries retrieved (top 2) only when explicitly referenced.

### Two-Tier Multi-Language Personalization & Warn-First Soft Override
- **Global Workspace Memory (`workspace_global_memory`):** Editable in Settings OR via any agent (*"Remember globally: always chat with me in Hindi/Urdu"*). Supports **any chat language** independently of **Published Article Language** (e.g., chat in Hindi/Urdu, publish in US English). Pops `Saved to Global Memory ✓ [Undo]`.
- **Per-Agent Memory (`user_agent_preferences`):** Craft-specific rules (e.g., Aria's blog hook style) stay isolated to that agent's Brain Folder; if a user gives an agent a company-wide rule, it asks whether to save locally or globally.
- **Warn-Strongly + Soft Override (Authority vs. UX):** For zero-demand or off-brand keywords, Maya warns clearly and offers 3 stronger alternatives, while still allowing **`[Add Anyway (Custom Override)]`** tagged with an amber **`Custom Override · Low Demand`** badge so user autonomy and platform SEO honesty both win.

---

## 28. Universal Multi-Item Batch Sessions, Direct "Start Now" Governor & 4-Gate Massive-Input Law

### Universal Multi-Item Batch Sessions (`batch_sessions` Table — All Agents)
- **Creating a Batch (*"Optimize these 5 pages"*):** Agent creates 1 structured **Batch Checklist Card (`BATCH-42`)** in Supabase and pops a 1-click choice: **`[Auto-Run Step-by-Step (1 at a time)]`** or **`[Guided One-by-One With Me]`**.
- **Bundled Cross-Agent Relay:** If Liam needs Maya's keywords for 5 pages, he sends **ONE bundled Batch Handoff (`BATCH-42 · 5 URLs`)** in his read-only Teammate DM—never 5 chaotic chat floods.
- **Multi-Blog Discussion (*"Let's discuss the 5 blogs we improved"*):** Calls `get_recent_page_cards(limit=5, summary_only=true)` (~80 words/card = ~400 words total), loading full prose only when zooming into 1 specific page.

### Direct `Start This Article Now` Cross-Tab Governor
- Lives right next to Calendar scheduling inside Keyword Research.
- **Server-Side Upstash Redis Concurrency Lock (Across All Browser Tabs):** Opening 5 tabs and clicking `Start Now` 10 times cannot bypass limits. Active `In Production` cap is plan-gated in `/admin` (**Starter `1`**, **Pro `2`**, **Agency `3`**); overflow items cleanly stack in the **Production Queue** (`Queued #1`, `#2`...) with 5-minute Grace Window, upfront token budget check, and isolated `article_id` rows (zero corruption).

### The 4-Gate Massive-Input Law (100–1,000 URLs in an Unlimited Chat Box)
Never cripple chat character limits—users can paste huge strategy briefs or 100–1,000 URLs freely. A **`$0` Pre-LLM Input Parser** extracts, validates, and deduplicates URLs into a **`Saved Intake Backlog`** before the LLM runs, handing the LLM only a 2-line count summary (`0` wasted input tokens). Every multi-item request then passes 4 hard backend gates:
1. **Gate 1 — Plan Quota + Active Batch Cap:** Never exceeds remaining monthly quota; caps each active batch by plan tier (**Starter = `5`**, **Pro = `10`**, **Agency = `20`**). Remaining URLs stay safely saved in `Saved Intake Backlog` for 1-click next-batch launches.
2. **Gate 2 — Zero Pipeline-Skipping Law:** Bulk requests can never jump straight into blind writing—every item still passes Keyword Research / Gap Plan → E-E-A-T Prompt/Warning → Calendar / Rolling Lock Window.
3. **Gate 3 — Strict 1-by-1 Sequential Queue + Relaxation Gap:** Heavy workers execute strictly 1-by-1 in sequence with mandatory 5-minute Grace Window & inter-item cooldown so live status stays crystal-clear and APIs never spike.
4. **Gate 4 — Global Redis Velocity Circuit Breaker:** Caps rapid hourly worker bursts across all tabs per workspace, pausing smoothly and alerting Super Admin if abuse is detected.

---

## 29. Ongoing Research Queue (Incomplete — Remaining Rubrics) & Verified Sources

### Remaining Specialists to Architect Before Implementation Begins
- [x] Keyword Research OS (12 Skills, 100-Pt Rubric, Cannibalization, KGR, Topical Maps, Mode A & B Competitor Gap)
- [x] Dedicated Keyword Overview Deep-Dive View (Semrush Parity + AI-Native Edge)
- [x] Free-to-Paid SEO Data API Stack, Unit Economics & Trust Positioning
- [x] Real-Time SaaS Backend, Upstash Redis + Supabase 2-Layer Caching & Master Pool Allocation
- [x] Super Admin AI Agent Studio (Draft/Test/Publish), Thinking-AI Cost Controls, Privacy Policy & 3-Watchdog Mistake Detection + Live Simulation Mode
- [x] Dashboard Mutation Rules, Calendar Agent, Rolling Lock Window, Animated Node Handoffs, Middle E-E-A-T Agent, Strict Specialist Ownership Matrix, Article Writer V8 & Final QA Gate
- [x] 7-Step Locked Article Assembly Line, Visual vs. Social Org Chart, Multi-Agent Group Chat War Room, Two-Track Existing Page Optimization, Universal Agency Awareness, Off-Topic Guardrails & 4-Pillar Memory Management with Strict Latest-Version Precedence
- [x] Workspace Behavior Card, Anti-Generic Thinking, Existing-Page Social Promotion, On-Page SEO 100-Point Objective Rubric, On-Demand Existing Page Keyword Plans & Universal Live Pipeline Status Card
- [x] **V8.3 Complete:** Social AI Employee OS, Human Networking, Founder Community Mentors (`$5/mo` add-on), `$0`-API Behavioral Feed & Hybrid Captions, Quality-Gated Profile Trophy Case & Agency Craft Score (100%), Single-Brain / Typed-Worker Engine & Live Job Board, Frugal 3-Tier DB/API Guardrails, Two-Tier Multi-Language Personalization & Soft Override, Universal Multi-Item Batch Sessions & 4-Gate Massive-Input Law
- [ ] **Next (V8.4):** Technical SEO Audit AI Agent 100-Point Rubric & Zero-LLM Diagnostic Architecture
- [ ] **Next (V8.5):** Visual & Brand Studio V8 and Social/Video Hub V8 Scoring Rubrics

### Verified External Sources
1. Ahrefs Developer Docs (API v3 Limits): https://docs.ahrefs.com/en/api/docs/introduction
2. 1Lookup Ahrefs API Pricing Audit (2026): https://www.1lookup.io/compare/ahrefs
3. Google Ads API Quotas & Developer Policies: https://developers.google.com/google-ads/api/docs/best-practices/quotas | https://support.google.com/adspolicy/answer/6169371?hl=en
4. Open PageRank Free Authority API: https://keywordseverywhere.com/openpagerank
5. Serper.dev Google SERP API: https://serper.dev/
6. Keyword Tool Free Guest MCP: https://keywordtool.io/api
7. DataForSEO Pay-As-You-Go Pricing & FAQ: https://dataforseo.com/pricing | https://dataforseo.com/help-center/minimum-payment
8. Upstash Serverless Redis Pricing: https://upstash.com/pricing/redis
9. Cloudflare Workers KV Limits: https://developers.cloudflare.com/kv/platform/limits/
10. Semrush 2026 Plan & Toolkit Limits: https://www.semrush.com/kb/1547-seo-toolkit-pricing-and-plans
