# DoItWithAI.tools — 24/7 AI Employee Digital Agency OS (V8 Master Research & Architecture Spec)

> **STATUS: INCOMPLETE — ACTIVE RESEARCH & ARCHITECTURE PAPER (DO NOT START IMPLEMENTATION YET)**
> **Last Updated:** November 21, 2026
> **Branch Scope:** `codex/infographic-studio-redesign` (Cloudflare Workers Preview ONLY — never touch `production-cloudflare` or `main`)
> **Purpose:** Complete A-to-Z living startup architecture and founder vision knowledge base. Covers Keyword Research OS, Keyword Overview, Free-to-Paid SEO Data APIs, Upstash Redis + Supabase 2-Layer Caching, Super Admin Control Center, AI Agent Draft/Test/Publish Studio, Thinking-AI Brain Cost Controls, Privacy-Safe Learning Policy, 3-Watchdog Human-in-the-Loop Mistake Detection & Live Simulation Mode, Dashboard Mutation Rules, Calendar Agent & Rolling Lock Window, Animated Node-to-Node Cross-Agent Handoffs, Middle E-E-A-T Dynamic Authority Agent, Strict Specialist Ownership (On-Page SEO owns Slug/Meta/Schema & Link Approval), Article Writer V8, and Lightweight Final QA Gate.

---

## 1. Founder Vision & Three-Way Expert Division of Labor

| Role | Owner | Core Mandate |
| :--- | :--- | :--- |
| **Lead Systems Architect** | Gemini | Designs from scratch the objective 100-point rubrics, specialist skills/tools, data/API economics, caching & SaaS backend infrastructure, Super Admin controls, and cross-agent handoff contracts. |
| **Debugging & Backend Expert** | Antigravity | Resolves live Preview bugs, API key isolation, token metering, Supabase migrations, Upstash Redis wiring, and backend execution using the forensic handoffs in this spec. |
| **Frontend & Visual Designer** | Designer AI Expert | Elevates UI/UX polish, visual hierarchy, gauges, tables, animated node handoffs, Super Admin panels, and interactive states using the functional zone specs defined below. |

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

### 4-Zone Prompt-First Dashboard Layout (For Frontend Designer)
- **Zone 1 · Top Telemetry Bar:** Circular score gauges + GSC/SEMrush/Ahrefs CSV upload dropzone + Country/Device switcher.
- **Zone 2 · Conversational Keyword Copilot Bar:** Natural-language prompt bar that invokes any of the 12 skills and updates the live table directly.
- **Zone 3 · Topical Cluster & Pillar Rail:** Clickable Pillar → Cluster filter tree with coverage percentage.
- **Zone 4 · Living Priority Backlog Table:** Filterable, sortable 11-column table with manual row positioning, pin/override, E-E-A-T status badge, and 1-click routing to Keyword Overview, E-E-A-T Studio, or Calendar.

### Exact 11-Column Master Table Schema

| # | Column | Format & Visual Signal | Source (Free → Paid) |
| :-: | :--- | :--- | :--- |
| 01 | **# (Rank)** | Sequential priority number (`1, 2, 3...`) — directly editable via drag or chat | Deterministic sort / user pin |
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

Clicking any keyword in the master list—or typing a seed keyword (or 1–100 terms in Bulk Analysis) into the top bar—opens **Keyword Overview** inside Keyword & Topics:

- **Zone A · Command Bar & Personalization:** Single-keyword search, Bulk Analysis toggle (1–100 terms), Country & Device selector (`US`/`UK`/`PK`/`Global`, `Desktop`/`Mobile`), and automatic Domain Personalization comparing user's OpenPageRank authority against the live SERP.
- **Zone B · Six-Metric Telemetry Strip:** Volume & Country Split, KD % Ring Gauge (with plain-English authority requirement), Search Intent + Funnel tag, 12-Month Trend Bar, CPC / Commercial Density, and KGR + AI Overview (GEO) Citation Count.
- **Zone C · Three-Column Keyword Ideas:** (1) **Keyword Variations** (A–Z Autocomplete + modifiers), (2) **Real Questions** (People Also Ask + Reddit/Quora), and (3) **Mini Topical Strategy Tree** (Pillar → Supporting Subpages).
- **Zone D · Live Top-10 SERP Breakdown & Community Pulse:** Ranking URL, Domain Authority (OpenPageRank), Word Count, Readability, Load Speed, H2 Outline, AI Overview flag, Reddit/Quora pain points, and one-click handoff to **Add Unique E-E-A-T Angle** or **Send Dossier to Production**.
- **Zero-Waste Execution:** Live fetchers + deterministic rubrics (KD, KGR, Intent, Cannibalization) run at `$0` LLM cost; only the final competitor gap synthesis uses 1 compact LLM call.

---

## 7. Free-to-Paid SEO Data API Stack & Commercial Unit Economics

### Verified API Reality Check (November 2026)
- **Ahrefs API v3 (Skip):** No free production tier. Complimentary test queries only return sample data for `ahrefs.com`; real lookups require paid plans starting at $129/mo (Lite, 100 rows/request cap) up to $1,499/mo (Enterprise), with a 50-unit minimum per call. ([Ahrefs Docs](https://docs.ahrefs.com/en/api/docs/introduction), [1Lookup Audit](https://www.1lookup.io/compare/ahrefs))
- **Google Ads Keyword Planner API (Defer):** 15,000 ops/day on Basic access ([Quotas](https://developers.google.com/google-ads/api/docs/best-practices/quotas)), but requires active ad billing and strict [Developer Policy](https://support.google.com/adspolicy/answer/6169371?hl=en) approval that often rejects standalone SEO SaaS apps.

### Launch Stack ($0/mo — Covers ~85% of Semrush Today)
1. **Google, YouTube & Bing Suggest (Autocomplete):** `$0` unlimited long-tail & A–Z expansion.
2. **[Keyword Tool Guest MCP](https://keywordtool.io/api):** `$0`, no API key; Google/Bing/Copilot autocomplete + Google Trends rising/top queries.
3. **[Open PageRank API](https://keywordseverywhere.com/openpagerank):** `$0` for **30,000 domains/month** (100 domains/call, 0–10 DA score for real KD calculation).
4. **[Serper.dev](https://serper.dev/):** **2,500 free Google SERP queries** (no credit card) for live Top-10 SERPs, PAA, AI Overviews, and exact `allintitle:` KGR counts; then `$50` for 50,000 queries (`$0.30–$1/1k`).
5. **Reddit JSON + Quora + User GSC/SEMrush/Ahrefs CSVs:** `$0` real buyer pain points and first-party impressions/clicks/CTR.
6. **Open-Source GitHub References:** [`IamRamgarhia/All-In-One-Free-SEO-Tool`](https://github.com/IamRamgarhia/All-In-One-Free-SEO-Tool), [`HasData/python-for-seo`](https://github.com/HasData/python-for-seo), [`chukhraiartur/seo-keyword-research-tool`](https://github.com/chukhraiartur/seo-keyword-research-tool), and [`OpenSEO`](https://openseo.so/features/keyword-research).

### Top 3 Low-Cost Paid API Candidates & Self-Funding Cash-Flow Loop
- **#1 [DataForSEO](https://dataforseo.com/pricing) (Primary Paid Engine):** `$1` free trial credit, then pure pay-as-you-go with a **`$50` minimum deposit that never expires** (no monthly subscription). `$50` buys **450,000+ Labs keyword lookups** or **33,000+ SERPs** ([Minimum Payment FAQ](https://dataforseo.com/help-center/minimum-payment)). Built explicitly for B2B SaaS.
- **#2 [Serper.dev](https://serper.dev/) (Fastest Live SERP & KGR Engine):** 2,500 free queries, then `$50` for 50,000 queries (`$1/1k`, down to `$0.30/1k` at scale).
- **#3 [Keywords Everywhere API](https://keywordseverywhere.com/api-documentation.html) (Budget Volume Backup):** `$84/yr` (`$7/mo`) for 100,000 credits (confirm SaaS resale terms before multi-tenant use).
- **Unit Economics:** An active Starter subscriber (`$29–$49/mo`) running 200 uncached Keyword Overviews + 1,000 keyword enrichments costs **~$0.50–$1.20/month** in data APIs. Your first 2 paying subscribers completely fund the initial `$50` DataForSEO pool.
- **Trust Positioning (Zero Fake AI Numbers):** Market explicitly as **"Live Search Data + Specialist AI Strategy."** On Free Trial, label unenriched demand honestly as `Demand Signal (Autocomplete + Trends + Reddit)` and grant **5–10 Verified Live Keyword Overviews** so prospects experience real Google Volume + SERP data before upgrading.
- **Fair-Use "Feels Unlimited" Control:** Even Semrush Pro caps at 3,000 reports/day (Guru caps live metric updates at 1,000/mo) and Ahrefs Lite caps at 1,000 credits/mo. Cached lookups and `$0` workflows stay **100% unlimited**; generous fair-use caps (500 / 2,000 / 5,000 per month) apply only to **uncached live API refreshes**.

---

## 8. Real-Time SaaS Startup Backend & Two-Layer Caching Infrastructure

### Plain-English Office Workflow (Without vs. With Our System)
- **Without Caching & Guardrails:** If 100 users search `"ai seo tools"`, you pay the SEO API **100 times**, every click hammers Supabase, and an impatient user clicking 15 times in 5 seconds causes 15 billable API calls.
- **With Upstash Redis + Supabase 2-Layer Caching:**
  1. **Upstash Serverless Redis (The Front Desk Receptionist — Layer 1):** Runs natively over HTTP on Cloudflare Workers (**500,000 free commands/month + 250 MB free**; PAYG `$0.20/100k` or `$10/mo` Fixed unlimited commands per [Upstash Pricing](https://upstash.com/pricing/redis)). Performs **atomic rate limiting** (blocks rapid bot clicks at the door), **in-flight request locking** (`SET NX EX` so 2 simultaneous searches for the same keyword only pay the API once), and serves hot 24-hour cached keywords in **<0.1s** with **0 Supabase reads and $0 API cost**.
  2. **Supabase Postgres (The Main Filing Cabinet — Layer 2):** Stores user accounts, subscriptions, credit pools, saved workspaces, and a **30-day durable global keyword & SERP cache** indexed by normalized `query_hash` (lowercased, trimmed, sorted modifiers). If someone searched `"ai seo tools"` 10 days ago, Supabase serves it at `$0` API cost and refreshes Redis for 24 hours.
  3. **External SEO APIs (Layer 3):** Called **only on a cache miss** or explicit user Force Refresh, then immediately saved back to Supabase (30 days) and Redis (24 hours) so the next 99 users get it free.
  4. **Adjustable `CacheAdapter`:** Controlled by one env var (`CACHE_PROVIDER=upstash | cf_kv | supabase_only`) so caching is 100% swappable with zero code rewrite.

### Master Pool → Retail User Chunk Allocation
- **Wholesale Provider Pools (Backend):** Master balances tracked for LLM tokens (Gemini → OpenAI), DataForSEO USD balance, Serper credits, and OpenPageRank.
- **Retail User Chunks (Per Subscriber):** Each plan grants a structured monthly chunk. Cache hits deduct `0` (or minimal) credits, protecting margins while making the app feel effortlessly fast and generous.

---

## 9. Super Admin Control Center & AI Agent Studio (Draft → Test → Publish Live)

Role-gated `/admin` frontend UI (`role = 'super_admin'`) allowing full backend control from the browser with zero code redeployment:

1. **Master API Pool & Margin Monitor:** Live balances for DataForSEO, Serper, OpenPageRank, and LLM spend (Gemini/OpenAI), **Cache Hit Ratio % & Dollars Saved**, and low-balance alerts.
2. **User & Subscription Manager:** Search any user, view registered websites, plan tier, and credit usage; grant bonus chunks, pause abusers, or toggle `Founder Unlimited`.
3. **Zero-Deploy Live Switches (`system_config` in Supabase):** Flip `KEYWORD_DATA_PROVIDER` (`free-hybrid` ↔ `dataforseo`), flip `AGENCY_PRIMARY_PROVIDER` (`gemini` ↔ `openai`), adjust cache TTLs, or change tier quotas instantly.
4. **AI Agent Prompt & Knowledge Studio (Two-Folder Safety Model):**
   - Every AI Agent maintains two folders in Supabase: **`LIVE`** (what paying customers use) and **`DRAFT`** (founder's private test kitchen), with full version history (`v1`, `v2`, `v3`).
   - Edit System Prompts, Training Rules, Rubric Weights, or upload Knowledge Base files (PDFs, blogs, research papers) directly from Super Admin → saves to **`DRAFT`** with zero customer disruption.
   - **Beta Sandbox Test Mode:** Toggle **"Open Dashboard in Draft Test Mode"** using a test website (e.g., `doitwithai.tools`) and run **Side-by-Side Comparison (`Old Live` vs. `New Draft`)** on identical prompts before promoting.
   - **1-Click Publish Live & Instant Rollback:** Promotes `DRAFT` → `LIVE` in real time (flushing Redis prompt cache within 1 second), with 1-click rollback to any prior version.
   - **Separated Founder Testing Spend:** All Super Admin Beta tests use real provider keys so quality is authentic, but Supabase tags them `account_type = 'founder_sandbox'` so **Customer Spend** and **Founder Testing Spend** never mix in margin reports.

---

## 10. Thinking-AI Brain Cost & Quality Controls (Gemini / OpenAI / Claude)

While brand-specific creative outputs must call the LLM live, four architectural controls reduce Thinking-AI spend by **60–80%** without sacrificing specialist quality:

1. **Provider Prompt Caching:** Static system prompts and rules stay cached on OpenAI/Gemini/Claude servers, cutting repeated input token costs by **50–90%**.
2. **Smart Brain Routing (Fast vs. Deep):** Fast, low-cost models handle formatting, intent tagging, and CSV cleanup; flagship deep-thinking models handle strategic briefs, gap synthesis, and flagship articles—configurable per agent in Super Admin.
3. **Selective Supabase RAG Knowledge Base:** Even with 100+ uploaded PDFs/guides, Supabase vector retrieval injects only the **top 3 relevant passages** per task rather than dumping the entire library.
4. **Shared Cache for Public Research Only:** Private brand outputs are never shared; generic public SERP gap syntheses for popular keywords can be cached in Redis/Supabase for 14 days.

---

## 11. Privacy-Safe User Data, Telemetry & Learning Policy

- **Stored Account & Workspace Data (Visible in Super Admin):** User name, email, subscription tier, token/API usage, and registered website URL(s) (public domains).
- **Strictly Private Customer Assets (Never Shared Across Users):** Saved keyword sheets, uploaded GSC/SEMrush CSVs, generated articles, brand assets, and full private chat logs.
- **Automatic Privacy Scrubber:** Before any prompt/reply enters the Super Admin Learning & Mistake Triage pipeline, an automated scrubber strips personal names, emails, phone numbers, API keys, and confidential client figures, replacing them with neutral tags (`[CLIENT_SITE]`, `[BRAND]`).
- **Tiered Learning Consent Model:**
  - **Free Trial & Starter Plans:** Anonymized prompt/quality learning is **ON by default** (explicitly disclosed in the Privacy Policy) with a clear **Opt-Out Switch** in Account Settings (~90–95% learning capture while respecting GDPR/user choice).
  - **Agency / Enterprise Tier:** **"Zero-Training Strict Privacy Mode" ON by default** as a premium B2B trust badge.
  - **Basic Crash/Error Telemetry:** Always active under standard product reliability operations.

---

## 12. Human-in-the-Loop Mistake Detection, Auto-Grouping & Live Simulation Pipeline

> **Golden Rule:** AI agents **NEVER** auto-publish prompt or lesson updates blindly to paying customers. Every improvement passes through **Human Review → Beta Sandbox Test → 1-Click Publish Live**.

### Three Automated Watchdogs (How Mistakes Are Caught & Measured)
1. **Watchdog 1 — Instant Rule Checker (`$0`, runs on 100% of replies in 0.01s):** Automatically flags crashes (`Invalid block`), empty responses, broken Hard Bans (slogan gluing, stale `2024`/`2025` years, hallucinated URLs not in sitemap), missing table columns, or severe off-niche drift.
2. **Watchdog 2 — User Behavior & Frustration Detector (`$0`, runs on 100% of sessions):** Automatically flags explicit **👎 Thumbs Down** clicks, silent **>70% deletion/rejection** of generated keywords/drafts, or rapid **correction follow-ups within 30 seconds** (*"no, that's wrong"*, *"I said Austin only"*).
3. **Watchdog 3 — Background AI Quality Inspector (cheap fast model):** Runs asynchronously on **100% of Watchdog 1 & 2 flags** plus a **5% random sample of unflagged chats** to diagnose subtle context drops, write a 1-sentence failure summary, and match the incident to an existing **Mistake Group** via Supabase vector similarity.

### Real-Time Supabase Logging & Individual Case Preservation
- Every detected mistake writes an asynchronous ticket into Supabase (`incident_cases`) with a unique **Case ID** (`ERR-101`, `ERR-102`...) containing the exact sanitized prompt, exact bad AI output, agent name, AI model used, and trigger watchdog—so the user's screen never slows down.
- Similar mistakes stack automatically inside one **Mistake Group Panel** (e.g., *Group #01: Wrong Intent on Buyer Prompts — 10 Cases*), while preserving every individual user's unique Case ID and exact query/reply inside the panel. New unrelated mistakes automatically spawn a new Mistake Group Panel.

### Four-Button Super Admin Fix & Regression Pipeline
Inside every Mistake Group Panel in Super Admin:
1. **`Merge into Unified Fix Doc`:** Synthesizes all grouped Case IDs into one clean **Global Lesson Document** (generalized rule + real *Don't Do / Do Instead* examples) and attaches it to the agent's **`DRAFT`** `agent_lessons_learned` table in Supabase.
2. **`Review / Edit Draft Rule`:** Lets the founder refine the lesson or adjust the agent's Draft System Prompt.
3. **`Test in Beta Sandbox`:** Replays the exact failed prompts (plus any custom prompt) side-by-side (`Old Live` vs. `New Draft`) to prove the fix works.
4. **`Publish Live`:** Promotes `DRAFT` → `LIVE` in real time, marks the group **`Resolved`**, and monitors for regressions (automatically re-opening the panel with a **`Regression Alert`** if the same mistake ever recurs).

### Pre-Launch Verification & Live Simulation Mode (Built Into Super Admin)
1. **"Simulate Bad Reply" Fire-Alarm Button:** Injects a deliberate synthetic error (e.g., stale `2024` keyword or off-topic reply) so the founder can verify in real time that Watchdogs 1 & 3 catch it, create a Case ID in Supabase, group it, and live-update the Super Admin Mistake Triage table within seconds.
2. **"Messy User" Stress-Test Pack:** 20–30 stored tricky prompts (typos, vague inputs, angry corrections, conflicting constraints, edge niches) runnable in Beta Mode before launch.
3. **Soft-Launch First 10–20 Real Testers:** All 3 Watchdogs run live from Day 1 to capture real-world edge cases and turn them into permanent global agent upgrades.

---

## 13. Dashboard Mutation Rules, Calendar Agent & Rolling Lock Window

### Strict Dashboard Mutation Permissions
- **Keyword Research Agent (Full List Control):** Can add new keywords, place a keyword into an exact row (*"put this in Row #3"*), reorder priorities, mark keywords as **`Finalized`**, and trigger Calendar/E-E-A-T/On-Page handoffs.
- **On-Page & Technical SEO Agents (Score-Protected):** Can **never** manually edit or fake a page's SEO score. They only apply/propose real fixes (Meta Title, Meta Description, H1, Slug, Alt Text, Schema) and re-scan so the score updates honestly.
- **Agency Calendar Agent (Lightweight Specialist):** Owns publishing dates, timezones, spacing gaps, lock statuses, and advises on healthy cadence (e.g., *"30 articles in 10 days = 3/day at 9 AM, 2 PM, 7 PM local time"*).

### Keyword ↔ Calendar Sync & Auto-Posting
- **Hard Cap Sync:** If a user has 20 Finalized Keywords, Calendar caps max schedulable count at 20.
- **Three Selection Modes:** Auto-pick by count + order (`Top-Down` / `Bottom-Up`), manual checkbox selection by title, or natural-language chat command from Keyword Research.
- **Mandatory Confirmation Card:** Any lock, schedule, or token-spending chat command requires a 1-click Confirmation Card showing exact article count, schedule times, timezone, and estimated token usage (`[Confirm & Schedule]` / `[Edit]`).
- **Optional Auto-Posting Mode:** If toggled ON, finalized keywords sitting at the top of Priority for the user's chosen waiting window (e.g., 1 hour) automatically lock and enter production one-by-one while enforcing the 5-minute relaxation gap and plan token check.

### The 5-Stage Rolling Lock Window (Graceful Change of Mind)

| Status | Timing | User Can Swap / Reorder / Cancel? |
| :--- | :--- | :--- |
| **1. `Queued (Editable)`** | Scheduled >5 minutes in the future | **Yes** — swap Row #3, drag up/down, or cancel anytime |
| **2. `Grace Window (5 min)`** | Right after clicking "Start Now" (mandatory 5-minute relaxation buffer) | **Yes** — 1-click Pause/Undo at `$0` token cost |
| **3. `Locked (Up Next)`** | Within 5 minutes of launch | **Locked** — cannot swap keyword |
| **4. `In Production`** | Writer + On-Page Approval + QA running | **Locked** — runs cleanly to completion |
| **5. `Published / Done`** | Finished and delivered | **Completed** |

---

## 14. Animated Node-to-Node Handoffs & Middle E-E-A-T Dynamic Authority Agent

### Live Animated Cross-Agent Handoffs (For Frontend Designer)
- Agents proactively ask before delegating (e.g., Keyword Research asks: *"Should I call the Calendar Agent to lock your top 10 articles?"* or *"Should I save this unique angle to your E-E-A-T Authority Agent?"*).
- Upon user confirmation, a sleek **Live Node Handoff Animation** plays: a glowing pulse travels from `Source Agent Node` → `Target Agent Node`, target flashes `Acknowledged & Saved/Scheduled`, and confirmation returns into chat.

### Middle E-E-A-T & Human Authority Agent (Core USP Against AI De-Ranking)
- **Accessible Anytime from Any Keyword Row:** Every keyword (even Row #20) has an **"Add Your Unique Angle (E-E-A-T)"** button opening a dedicated plain-English studio, editable anytime until locked.
- **Dynamic Topic-Tailored Question Bank:** Generates **6–8 smart, topic-specific questions** (e.g., #1 mistake people make, real test/result, personal opinion, tools to review, AnswerThePublic/Reddit notes) and nudges the user to answer **at least 3–4**.
- **Power-User Overrides:** Users can also type rough outlines, preferred H2s, exact internal links, or exact lists (*"Review these exact 10 keyword tools"*)—and the Article Writer's live web researcher visits those real URLs before writing.
- **Skip Warning UX:** If a user tries to skip E-E-A-T before locking, display a clear **Ranking Risk Warning** with Primary CTA **`Add My Unique Points`** and subtle secondary button **`Proceed Anyway (Lower Authority Risk)`**.

---

## 15. Strict Specialist Ownership Matrix, Article Writer V8 & Final QA Gate

| Specialist Agent | Strictly Owns (Final Authority) | Quality Gatekeeper Behavior (Pushback) | Hands Off To |
| :--- | :--- | :--- | :--- |
| **Keyword Research Agent** | Primary/secondary/long-tail keywords, intent, KD/KGR, clusters, cannibalization, competitor SERP gaps, Reddit/Quora research dossier | Rejects junk, zero-demand, or cannibalizing keywords | Calendar, E-E-A-T Agent, On-Page SEO (slug/meta requests) |
| **Middle E-E-A-T Agent** | Dynamic 6–8 question bank, user's personal proof, custom tool lists, rough notes | Ranking Risk Warning if skipped | Article Writer |
| **On-Page SEO Specialist** | **Slug URLs**, **Meta Titles**, **Meta Descriptions**, **Schema Markup**, heading hierarchy, and **final approval of all Internal & External Links** | Warns user if a proposed slug/meta violates site structure or SEO best practices; proposes optimal brand-matched alternative | Article Writer (approves final link & meta package) |
| **Article Writer Agent** | Outline, storytelling, audience tone, natural keyword density (~0.8–1.5%, zero stuffing), drafting candidate links in context, visiting user-named tool URLs, **surgical post-draft conversational edits** | Cannot finalize links or publish without On-Page SEO approval; defaults to `Ready for Final Review` | On-Page SEO Agent → Final QA Gate |
| **Calendar Agent** | Dates, timezones, spacing gaps, 5-min relaxation buffer, Rolling Lock Window, upfront token checks | Blocks scheduling beyond finalized keywords or remaining plan tokens | Article Writer |
| **Final QA & Compliance Gate** | Lightweight Managing Editor safety net (`$0` automated checks + fast sanity check): live 404 link ping, cross-agent consistency (H1 ↔ Meta ↔ Slug ↔ Schema ↔ E-E-A-T inclusion), zero stale years or AI clichés | Blocks broken/inconsistent packages before user review or publish | User Final Review / Publish |

- **Polite Boundary Handoff Rule:** If a user asks Keyword Research to finalize a Slug URL, Keyword Research replies: *"Slug URLs are owned by our On-Page SEO Specialist so your site structure stays clean. Want me to send your suggested slug to the On-Page SEO Agent to verify and finalize?"*

---

## 16. Ongoing Research Queue (Incomplete — Next Specialists to Architect)

- [x] Keyword Research OS (12 Skills, 100-Pt Rubric, Cannibalization, KGR, Topical Maps, Mode A & B Competitor Gap)
- [x] Dedicated Keyword Overview Deep-Dive View (Semrush Parity + AI-Native Edge)
- [x] Free-to-Paid SEO Data API Stack, Unit Economics & Trust Positioning
- [x] Real-Time SaaS Backend, Upstash Redis + Supabase 2-Layer Caching & Master Pool Allocation
- [x] Super Admin AI Agent Studio (Draft/Test/Publish), Thinking-AI Cost Controls, Privacy Policy & 3-Watchdog Mistake Detection + Live Simulation Mode
- [x] Dashboard Mutation Rules, Calendar Agent, Rolling Lock Window, Animated Node Handoffs, Middle E-E-A-T Agent, Strict Specialist Ownership Matrix, Article Writer V8 & Final QA Gate
- [ ] **Next:** On-Page SEO Specialist Deep-Dive Rubric & Page Optimization Workflow
- [ ] **Next:** Technical SEO Audit AI Agent Rubric & Zero-LLM Diagnostic Architecture
- [ ] **Next:** Visual & Brand Studio V8 and Social/Video Hub V8 Rubrics
