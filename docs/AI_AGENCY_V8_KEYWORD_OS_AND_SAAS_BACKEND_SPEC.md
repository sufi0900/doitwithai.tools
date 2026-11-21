# DoItWithAI.tools — 24/7 AI Employee Digital Agency OS (V8 Master Research & Architecture Spec)

> **STATUS: ACTIVE RESEARCH & ARCHITECTURE DRAFT — DO NOT START IMPLEMENTATION YET**
> **Last Updated:** November 21, 2026
> **Branch Scope:** `codex/infographic-studio-redesign` (Cloudflare Workers Preview ONLY — never touch `production-cloudflare` or `main`)
> **Purpose:** Living master knowledge base capturing all founder vision, Keyword Research OS architecture, Keyword Overview deep-dive specs, Free-to-Paid SEO Data API economics, Upstash Redis + Supabase 2-layer caching, and Super Admin SaaS backend planning so every AI expert (Debugging, Frontend Design, Architecture) stays 100% aligned.

---

## 1. Three-Way Expert Division of Labor

| Role | Owner | Core Mandate |
| :--- | :--- | :--- |
| **Lead Systems Architect** | Gemini | Designs from scratch the objective 100-point rubrics, specialist skills/tools, data/API architecture, caching/backend specs, and cross-agent handoff contracts. |
| **Debugging & Backend Expert** | Antigravity | Resolves live Preview bugs, API key isolation, token metering, Supabase migrations, and backend wiring using the forensic handoffs in this doc. |
| **Frontend & Visual Designer** | Designer AI Expert | Elevates UI/UX polish, visual hierarchy, gauges, tables, and interactive states using the functional zone specs defined below. |

---

## 2. Live Preview Forensic Bug Handoff (For Antigravity)

Diagnosed from 6 live Preview screenshots (`codex-infographic-studio-redesign`):

1. **Broken Slogan-Glued Fallback Keywords:** `onboarding.server.ts:218` slices the homepage `<h1>` (`"Do It With AI Tools Put AI to work on your SEO and"`) and appends `"workflow for beginners"` / `"step by step checklist"`, producing junk keywords and triggering false `Refresh Existing` overlap against the homepage.
2. **Stage 2 `Invalid block` Crash:** Stage 1 succeeded at `1,548 tokens · $0.0011` (confirming V6 Phase 1 fixed prompt bloat), then Stage 2 threw `Invalid block` from `prompt-compiler.ts:149` because `verifiedReply()` rejects any inline URL not explicitly present in `allowedSitemapUrls`.
3. **Neutral Gray `#bdbdbd` Extracted as Primary Brand Color:** `onboarding.server.ts:569` captures the first hex string in inline `<style>` tags without prioritizing `meta[name="theme-color"]` or filtering low-saturation grays/whites/blacks.
4. **5–6s Blocking "Saving..." Button UX:** Clicking Register or Approve awaits the full server round-trip inside the button state instead of transitioning immediately into an animated multi-stage progress experience.
5. **Stale `2025` Year & Partial 3-Page Crawl:** Generated article title contained `in 2025` (must inject current UTC year `2026`), and fresh workspace registration indexed only `3 indexed pages (partial)`.

---

## 3. Unified Website Model & 12-Skill Keyword Research OS

Every website—whether brand-new or established—runs through a single **Unified Website Model** assuming existing pages may exist (new sites simply have fewer discovered URLs). Every keyword candidate routes cleanly to one of four actions: `New Article`, `Optimize Existing Page` (real non-homepage URLs only), `Cannibalization Resolution`, or `New Tool / Landing Page`.

### The 12 Callable Specialist Skills & Tools
Unifies existing standalone routes in this repo (`app/api/ai-tools/keyword-research/route.ts`, `keyword-clustering/route.ts`, `keyword-golden-ratio-calculator/route.ts`, `serp-content-gap-agent/route.ts`) into one cohesive agent:

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
12. **Conversational Dashboard Mutator:** Prompt bar translates natural language (e.g., *"show only KGR < 0.25 commercial keywords"*, *"find cannibalization in this CSV"*) into structured tool calls that update the live backlog table directly.

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

## 5. Master Keyword List Schema (11 Columns)

| # | Column | Format & Visual Signal | Source (Free → Paid) |
| :-: | :--- | :--- | :--- |
| 01 | **# (Rank)** | Sequential priority number (`1, 2, 3...`) | Deterministic sort / user pin |
| 02 | **Keyword** | Clickable link opening **Keyword Overview** deep dive | Discovery / CSV / GSC |
| 03 | **Topic Group & Pillar** | Parent Pillar + Semantic Cluster badge | Semantic Clusterer |
| 04 | **Content Type** | `Guide`, `Comparison`, `Tool Page`, `Checklist`, `Landing` | SERP format classifier |
| 05 | **Search Intent** | `Info`, `Comm`, `Trans`, `Nav` + Funnel stage | SERP + modifier rules |
| 06 | **Volume / Demand** | Verified monthly volume (Paid/CSV/GSC) OR `Demand Signal` (Free) | Hybrid → DataForSEO |
| 07 | **KD %** | 0–100 color ring (OpenPageRank Top-10 DA → DataForSEO KD) | OpenPageRank → DataForSEO |
| 08 | **KGR & AI Overview** | KGR win badge (`<0.25`) + AI Overview active indicator | Serper `allintitle:` + SERP |
| 09 | **Opp. Score (0–100)** | Composite rubric score | Deterministic rubric |
| 10 | **Route / Cannibalization** | `New Article`, `Optimize URL`, `Cannibalization Risk (slug)`, `New Tool` | Sitemap Overlap Gate |
| 11 | **Priority & Actions** | `P0–P2` + `Deep Dive` · `Queue & Write` · `Pin` · `Dismiss` | User + Agent workflow |

---

## 6. Dedicated "Keyword Overview" Deep-Dive View (Semrush Parity + AI-Native Edge)

Clicking any keyword in the master list—or typing a seed keyword (or 1–100 terms in Bulk Analysis) into the top bar—opens **Keyword Overview** inside Keyword & Topics:

- **Zone A · Command Bar & Personalization:** Single-keyword search, Bulk Analysis toggle (1–100 terms), Country & Device selector (`US`/`UK`/`PK`/`Global`, `Desktop`/`Mobile`), and automatic Domain Personalization comparing user's OpenPageRank authority against the live SERP.
- **Zone B · Six-Metric Telemetry Strip:** Volume & Country Split, KD % Ring Gauge (with plain-English authority requirement), Search Intent + Funnel tag, 12-Month Trend Bar, CPC / Commercial Density, and KGR + AI Overview (GEO) Citation Count.
- **Zone C · Three-Column Keyword Ideas:** (1) **Keyword Variations** (A–Z Autocomplete + modifiers), (2) **Real Questions** (People Also Ask + Reddit/Quora), and (3) **Mini Topical Strategy Tree** (Pillar → Supporting Subpages).
- **Zone D · Live Top-10 SERP Breakdown & Community Pulse:** Ranking URL, Domain Authority (OpenPageRank), Word Count, Readability, Load Speed, H2 Outline, AI Overview flag, Reddit/Quora pain points, and one-click handoff: **Send Full Gap Brief to Article Writer** or **Optimize My Existing Page**.
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

### Top Paid Low-Cost Upgrade (Funded Directly by Early Subscribers)
- **Primary Paid Engine — [DataForSEO](https://dataforseo.com/pricing):** `$1` free trial credit, then pure pay-as-you-go with a **`$50` minimum deposit that never expires** (no monthly subscription). `$50` buys **450,000+ Labs keyword lookups** (exact volume, CPC, 12-mo trends, KD, intent across 211 countries) or **33,000+ SERPs** ([Minimum Payment FAQ](https://dataforseo.com/help-center/minimum-payment)).
- **Unit Economics & Cash-Flow Loop:** An active Starter subscriber ($29–$49/mo) running 200 uncached Keyword Overviews + 1,000 keyword enrichments costs **~$0.50–$1.20/month** in data APIs. Your first 2 paying subscribers fund the initial `$50` DataForSEO pool, which serves dozens of users for months.
- **Trust Positioning (Zero Fake AI Numbers):** Market explicitly as **"Live Search Data + Specialist AI Strategy."** On Free Trial, label unenriched demand honestly as `Demand Signal (Autocomplete + Trends + Reddit)` and grant **5–10 Verified Live Keyword Overviews** so users experience real Google Volume + SERP data before upgrading.

### Fair-Use "Feels Unlimited" Control Model
Even Semrush Pro caps at 3,000 reports/day (Guru caps live metric updates at 1,000/mo) and Ahrefs Lite caps at 1,000 credits/mo. We make paid plans *feel* unlimited safely by keeping cached lookups and `$0` workflows **100% unlimited**, while applying a generous monthly fair-use cap (e.g., 500 / 2,000 / 5,000) only to **uncached live API refreshes**.

---

## 8. SaaS Startup Backend, Two-Layer Caching & Super Admin Architecture

### Plain-English Office Analogy (How Every Piece Fits Together)
1. **Upstash Serverless Redis (The Front Desk Receptionist):** Sits in front of your database and APIs. Blocks rapid bot clicks at the door (atomic rate limiting), prevents two users searching the exact same keyword at the exact same second from paying the API twice (in-flight lock), and hands back today's popular keywords in <0.1s without touching Supabase or paid APIs.
2. **Supabase Postgres (The Main Filing Cabinet):** Stores user accounts, subscriptions, credit ledgers, saved projects, and a **30-day durable global keyword & SERP cache**. If someone searched `"ai seo tools"` 10 days ago, Supabase serves it at `$0` API cost and refreshes Redis for 24 hours.
3. **External SEO APIs (DataForSEO / Serper):** Called **only on a cache miss** or explicit user Force Refresh. Immediately writes back to Supabase (30 days) and Redis (24 hours) so the next 99 users pay `$0`.
4. **Super Admin Control Center (The Manager's Office):** Role-gated `/admin` frontend UI (`role = 'super_admin'`) to manage the entire startup without touching code.

### Why Upstash Serverless Redis Fits Cloudflare Workers
Traditional TCP Redis Cloud does not fit Cloudflare Workers' V8 isolate runtime natively, whereas **[Upstash Redis](https://upstash.com/pricing/redis)** uses native HTTP, offers **500,000 free commands/month + 250 MB free** (versus Cloudflare KV's 1,000 free writes/day limit and eventual consistency), supports atomic `INCRBY` rate limiting and `SET NX EX` request locking, and scales cleanly (`$0.20/100k` PAYG or `$10/mo` Fixed unlimited commands). Wrapped behind a swappable `CacheAdapter` (`CACHE_PROVIDER=upstash | cf_kv | supabase_only`).

### Master Pool → Retail User Chunk Allocation & Super Admin Features
- **Master API Pool Monitor:** Live balances for DataForSEO, Serper, OpenPageRank, and LLM spend (Gemini → OpenAI), plus **Cache Hit Rate % & Dollars Saved** and low-balance alerts.
- **Pool-to-User Allocation Ledger:** Tracks total master pool vs. chunks allocated across active subscribers vs. real consumption.
- **User & Subscription Controls:** View/search users, adjust plan chunks, grant bonus credits, pause abusers, toggle `Founder Unlimited` on test accounts.
- **Zero-Deploy Live Switches (`system_config`):** Flip `KEYWORD_DATA_PROVIDER` (`free-hybrid` ↔ `dataforseo`), flip `AGENCY_PRIMARY_PROVIDER` (`gemini` ↔ `openai`), adjust cache TTLs, or edit tier allowances live.

---

## 9. Ongoing Research Queue (Next Discussions Before Implementation)
- [x] Keyword Research OS (12 Skills, 100-Pt Rubric, Cannibalization, KGR, Topical Maps, Mode A & B Competitor Gap)
- [x] Dedicated Keyword Overview Deep-Dive View (Semrush Parity + AI-Native Edge)
- [x] Free-to-Paid SEO Data API Stack, Unit Economics & Trust Positioning
- [x] Startup Backend, Upstash Redis + Supabase 2-Layer Caching & Super Admin Pool Architecture
- [ ] **Next:** Technical SEO Audit AI Agent Rubric & Zero-LLM Diagnostic Architecture
- [ ] **Next:** On-Page SEO & Content Refresh AI Agent Rubric
- [ ] **Next:** Article Writer V8, Visual & Brand Studio V8, and Social/Video Hub V8 Rubrics
