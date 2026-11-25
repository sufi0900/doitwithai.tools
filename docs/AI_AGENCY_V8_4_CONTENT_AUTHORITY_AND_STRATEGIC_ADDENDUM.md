# DoItWithAI.tools — V8.4 Content Authority (CA) Detector, Worst-Case Scale Defense & 2027 Strategic Addendum

> **STATUS: INCOMPLETE — ACTIVE RESEARCH & ARCHITECTURE PAPER (DO NOT START IMPLEMENTATION YET)**
> **Last Updated:** November 25, 2026
> **Branch Scope:** `codex/infographic-studio-redesign` (Cloudflare Workers Preview ONLY — never touch `production-cloudflare` or `main`)
> **Companion Master Spec:** Extends `docs/AI_AGENCY_V8_KEYWORD_OS_AND_SAAS_BACKEND_SPEC.md` (V8.1–V8.3, Sections 1–29)
> **Purpose:** Complete zero-skip record of every architectural, commercial, concurrency, and proprietary scoring rule finalized after V8.3: Worst-Case Scale & Abuse Defense (100-article locks, 1,000-page site triage, 1,000 competitor URLs, marathon strategic chat), Two-Brand Ecosystem & Non-Dilutive Funding Stack, 28-Day Google Search Console Forensic Baseline, the Locked 2027 North Star (**"GitHub for Content & Growth Teams"** — Hybrid Two-Room Architecture), and the flagship **`Content Authority (CA 0–100)`** Detector Engine.

---

## 1. Worst-Case Scale, Abuse & Margin Defense Architecture

Designing for absolute worst-case workloads first ensures every normal customer workload stays fast, predictable, and profitable (target **75–85%+ gross margin**).

### 1.1 Worst Case 1 — "Write 100 Articles Right Now" (Structural Pipeline Lock)
- **No Article Runs on Air:** Article Writer V8 cannot start unless a keyword has passed the 100-Point Keyword Rubric and been **explicitly locked by the user** in the Keyword Research tab.
- **Mandatory Middle E-E-A-T Gate:** Even if a user locks 100 keywords, no draft begins until the user provides unique E-E-A-T authority points (or manually clicks Skip, triggering a visible Ranking Risk Warning and a `0/20` E-E-A-T quality sub-score).
- **Plan-Bound Calendar Auto-Stop:** The Calendar Agent schedules strictly up to the user's remaining **Monthly Plan Article Quota** (e.g., `10 / 30 / 100` per month) and stops automatically at zero with a quota card.

### 1.2 Worst Case 2 — 1,000+ Published Pages ("Audit & Optimize My Entire Website")
Agents receive `$0` HTTP XML sitemap visibility—never a blind 1,000-page LLM crawl. The On-Page SEO Specialist runs a **2-Phase Funnel**:
- **Phase A — `$0`-AI Triage (Cloudflare Worker):** Combines cached sitemap URLs with free **Google Search Console** metrics (when connected) and lightweight metadata/slug checks to sort 1,000+ URLs into three buckets:
  - **Tier 1 (High-Impact Quick Wins):** Positions `#4–#20`, high impressions with low CTR, outdated year in title/slug, or core money pages (surfaces Top 10–20 immediately).
  - **Tier 2 (Secondary Candidates):** Positions `#21–#50` or missing baseline metadata.
  - **Tier 3 (Protect / Leave Alone):** Healthy `#1–#3` pages plus tag/legal/utility URLs.
- **Phase B — Quota-Gated Step-by-Step Deep Audit:** Deep HTML + live SERP + 100-Point On-Page Rubric audits load strictly within the active batch cap (**5 / 10 / 20 URLs**) and execute **one-by-one** against the monthly On-Page Audit quota.

### 1.3 Worst Case 3 — 1,000 Pasted Competitor URLs ("Compare All & Find Gaps")
1. **`$0` Pre-LLM Intake Parser:** Intercepts raw paste before any LLM call, deduplicates domains/URLs, strips tracking params, and saves to `Saved Intake Backlog` at zero token cost.
2. **Smart Domain-Level Shortcut:** When pasted URLs belong to 1–3 competitor domains, recommends a **Domain-Level Keyword Gap Lookup** (1 cached SEO API call instead of 1,000 page scrapes).
3. **Dedicated Competitor Quota:** Page-by-page teardowns run inside a capped active batch (`5 / 10 / 20`) sequentially in the Heavy Research Lane under a separate monthly Competitor Audit quota.

### 1.4 Worst Case 4 — Marathon Strategic Chatting (Long Inputs & Outputs, No Tools)
Eliminates quadratic context-window cost inflation while keeping deep strategy chats generous:
- **Fixed-Ceiling Context Window:** Every turn sends only cached System Prompt + Tier-0 `workspace_pulse` (~400B) + **5-Bullet Rolling Summary** + **Sliding Window (last 6–8 messages)** → flat ~4,000–6,000 input tokens even on message #150.
- **Two-Speed Chat Brain:**
  - **85–90% of chat turns (brainstorming, strategy, Q&A):** Fast-Smart model + Prompt Caching (50–90% discount; even a 2,000-word input + 1,500-word reply costs `~$0.002–$0.004`, so 500 marathon turns cost `~$1–$2/mo`).
  - **10–15% Deep Thinking turns:** Governed by a **ChatGPT-style 5-Hour Rolling Window** (e.g., Starter `10` / Pro `30` / Agency `80` deep turns per 5 hours).
- **Generous Input Ceiling + Soft Margin Cushion:** Accepts brain-dumps up to **~20,000 chars (~3,500 words)** per message (larger pastes auto-chunk via `$0` parser). If a heavy user hits 80% of their safe monthly chat margin, non-critical chat smoothly steps down to an **Eco-Fast model** (~5x cheaper) rather than locking them out; only bot/script abuse triggers a cooldown timer.

### 1.5 Per-Agent Worst-Case Limit Matrix

| Agent / Surface | Primary Cost Driver | Worst-Case Abuse Defense | Quota Enforcement |
| :--- | :--- | :--- | :--- |
| **Calendar Agent** | Near `$0` (DB writes) | Blocks unlocked keywords & skipped E-E-A-T | Auto-stops at Monthly Article Quota |
| **Keyword Research** | SERP / DataForSEO + LLM | 30-day shared cache + `$0` paste parser + batch cap | Monthly Lookup Quota (`500 / 2,000 / 5,000`) |
| **On-Page SEO** | HTTP crawl + SERP + LLM | `$0` Sitemap/GSC Triage; never deep-crawls 1,000 at once | Monthly Page Audit Quota + `5 / 10 / 20` batch |
| **Competitor Audit** | External crawl + SERP | `$0` Parser + Domain-Level Gap shortcut | Separate Monthly Competitor Quota (1-by-1) |
| **Article Writer V8** | Deep LLM + QA Gate | Locked Keyword + E-E-A-T; Redis `1 / 2 / 3` active slots | Monthly Article Quota + 5-min grace gap |
| **Strategic Chat** | Input/Output LLM tokens | Flat sliding context + Two-Speed + Eco step-down | Rolling 5-Hour Window + soft monthly margin |

---

## 2. Commercial Launch Strategy, Two-Brand Ecosystem & Non-Dilutive Funding

### 2.1 Two-Brand Ecosystem & Product Hierarchy Law (Zero Split Focus)
- **Do NOT split into 4 separate startups** (Tools Site + AI Website Builder + Buffer Clone + Social Network) and **do NOT build a Buffer/Metricool clone** from scratch.
- **Brand 1 (`doitwithai.tools`):** Evergreen SEO traffic magnet, free tools, and prompts feeding warm signups at `$0` CAC.
- **Brand 2 (Dedicated Global SaaS Brand — One Unified Login & Subscription):** Houses the AI Agency OS + Proof-of-Human Network. Shortlisted pronounceable abbreviation candidates:
  - **`AMSO`** — **A**I **M**arketing **S**ocial **O**S
  - **`AMSON`** — **A**I **M**arketing **S**ocial **O**perating **N**etwork
  - **`AEMON`** — **A**I **E**mployees & **M**arketers **O**perating **N**etwork
  - **`MARCO`** — **M**arketing **A**I **R**esearch, **C**raft & **O**ptimization
- **Product Hierarchy Law (No Split Marketing):** 100% of ads, homepage copy, and blogs promote **one hero promise** (AI Marketing & Growth OS). The already-started **Website Builder / Instant SEO Blog Launcher** lives strictly as a **quiet onboarding button** for beginners without WordPress—hosted on an **isolated neutral subdomain** (e.g., `user.yoursites.page` + Pro custom CNAME) so beginner content never risks main-domain SEO authority.
- **Tool-First, Network-Second Growth:** Follows Chris Dixon's ["Come for the tool, stay for the network"](https://cdixon.org/2015/01/31/come-for-the-tool-stay-for-the-network/) model. Skip `$5/post` cash bounties in favor of **Founding Verified Expert badges + 1-Year Free Pro + public portfolio backlink**.

### 2.2 Solo Founder 100% Ownership & Non-Dilutive Funding Stack (0% Equity, Zero Debt)
Founder maintains **100% ownership** (no co-founder equity split, no personal loans), funding scale via low-burn launch (<$100 initial spend), Founding Member pre-sales, revenue-funded contract hiring, and verified **0%-equity cloud/AI startup credits**:
- [Microsoft for Startups Founders Hub](https://www.microsoft.com/en-us/startups): Self-serve entry up to `~$5,000` Azure/OpenAI credits (scales to `$150K`, no VC required; [tier guide](https://guptadeepak.com/startup-offers/guides/microsoft-for-startups)).
- [Cloudflare for Startups](https://www.cloudflare.com/startups/): Up to `$250K–$350K` credits, 0% equity ([eligibility](https://www.cloudflare.com/en-in/forstartups/)).
- [AWS Activate Founders](https://aws.amazon.com/startups/): `$1,000` bootstrapped credits for 2 years ([step-by-step guide](https://aws.amazon.com/aws-startups/learn/applying-for-aws-activate-credits-a-step-by-step-guide/)).
- [Google for Startups Cloud Program](https://cloud.google.com/startup/benefits): Phase 2 scaling target.
- [Revenue-Based Financing](https://stripe.com/resources/more/what-is-non-dilutive-funding): Optional non-dilutive growth capital once steady MRR is established.

---

## 3. Baseline Reality: 28-Day Google Search Console Forensic Snapshot (`doitwithai.tools`)

Verified export (`2026-10-25` to `2026-11-21`): **22 clicks**, **16,635 impressions** (nearly tripling from ~169–240/day to **412–476/day**), **0.13% CTR** across 163 indexed pages, **43% US impressions (7,202)**, and **87% Desktop (14,480)**.

| Page on `doitwithai.tools` | 28d Impressions | Avg Position | Clicks (CTR) | Strategic Signal |
| :--- | :---: | :---: | :---: | :--- |
| `/ai-seo/check-google-keyword-rankings` | 5,246 | 87.8 | 1 (0.02%) | High-demand cluster |
| `/tools/keyword-clustering-tool` | 1,780 | 77.7 | 0 (0%) | 1,463+ grouping/clustering impressions |
| `/ai-tools/ai-keyword-research-tools` | 1,574 | **28.5** | 0 (0%) | Closest commercial Page-3 push |
| `/ai-tools/merlin-ai-review` | 541 | **9.6** | 1 (0.18%) | Page-1 CTR rescue target |
| `/ai-seo/ai-vs-traditional-keyword-research` | 439 | **15.9** | 0 (0%) | Page-2 quick win |
| `/ai-seo/h1-heading` | 319 | **18.8** | 0 (0%) | Page-2 quick win |
| `/ai-code/chatgpt-portfolio-website` | 275 | **5.4** | 0 (0%) | Top-5 urgent CTR rescue |
| `/ai-learn-earn/ai-infographic-generators` | 147 | **7.3** | 0 (0%) | Page-1 urgent CTR rescue |

---

## 4. Locked 2027 North Star: "GitHub for Content & Growth Teams" (Hybrid Two-Room Architecture)

### Explicitly Rejected Directions
1. **Keyword-Based Medium Clone (Rejected):** Hosting generic SEO keyword guides from multiple authors on one domain causes same-domain Google cannibalization and repetitive feeds.
2. **General Consumer Social Media / Reels App (Parked in Year 2–3 Vision Vault):** Consumer video/reels moderation and broad lifestyle social networking dilute B2B SaaS focus and require heavy upfront capital.

### The Locked Hybrid North Star: *"AI Does the Research. Humans Write the Truth."*
- **Room 1 — Private AI Agency Office (Paid SaaS Engine):** External websites connected (any niche: SEO, fitness, e-commerce, gadgets, SaaS) + quiet Instant Blog Launcher for beginners; full specialist roster (Keyword OS, On-Page, Off-Page, Technical SEO); Private Team Feed; Awards & Trophies; transparent **`Content Authority (CA)`** scoring.
- **Room 2 — Public Proof-of-Human Network (2027 Category Moat):** Strictly **100% Human-Verified** growth case studies, experiments, teardowns, and writer portfolios across niche channels (`#SEO`, `#EcommerceGrowth`, `#ContentCraft`, `#NicheSites`, `#CaseStudies`, `#WriterPortfolios`), featuring optional **Verified GSC Result Cards** and **3-Tier Authority Feeds** (Beginner `noindex` → Rising `index` → Verified Expert `index`).
- **B2B Agency-Writer Viral Loop:** Agencies hiring freelance writers require them to write inside the platform—writers get AI research specialists while proving genuine human craft via their **`CA Score`**, and agencies discover/hire `CA 80+` writers from verified public portfolios.
- **Google Policy Alignment:** 100% aligned with [Google Search's Guidance on Generative AI Content](https://developers.google.com/search/docs/fundamentals/using-gen-ai-content) and [Google's Spam Policies](https://developers.google.com/search/docs/essentials/spam-policies) (AI for research/structure + authentic human E-E-A-T, avoiding Scaled Content Abuse and fake author personas; [Oct 2026 summary](https://8ms.com/blog/2026/googles-latest-content-guidance-what-it-means-for-ai-and-seo)).

---

## 5. Flagship Proprietary Engine: `Content Authority (CA 0–100)` Detector & Rulebook

### Positioning: The Missing Sibling to `DA` & `PA`
- **Industry Hierarchy:** **DA** (Domain Authority) → **PA** (Page Authority) → **`CA` (Content Authority)** — displayed visually as **`CA Score`** or **`Content Authority (CA 84/100)`**.
- **Dual Scope:** Works at BOTH the **Single Blog URL level** (`CA 84`) and the **Writer/Author Profile level** (`CA 86` rolling average) so agencies can hire verified `CA 80+` writers.
- **Explainable Trust (Zero Black Box):** Every audit outputs a **Clickable Evidence Receipt** showing exact quotes, links, and media that earned or lost points—never a black-box `"78% AI"` guess.

### Two Operating Modes
- **Mode A — External / Already-Published Blogs (URL or Paste):** Scored via **Layer 1 + Layer 2** → Badge: **`Evidence-Verified (CA XX/100)`**.
- **Mode B — Written Inside Our Writing Studio:** Combines **Layer 1 + Layer 2 + Layer 3 (Live Studio Telemetry)** → Highest Badge: **`Process + Evidence Verified (CA XX/100)`**.

### 3-Layer Zero-ML-Training Backend Engine (`~$0.002–$0.004` / Audit)
1. **Layer 1 — `$0` Deterministic Forensic Code (`<0.5s` Cloudflare Worker):**
   - Media forensics: detects real screenshots, custom charts, HTML tables, embedded YouTube/Loom demos vs. stock domains (`unsplash`, `pexels`, `shutterstock`) or `C2PA`/`IPTC` AI-image tags.
   - Live `HEAD` link verification: catches **hallucinated 404 URLs**, checks deep primary citations vs. bare homepages, and audits contextual internal links.
   - Specificity & rhythm math: concrete numbers/dates/prices/versions per 500 words, sentence-length burstiness, and AI Cliché Density (*"delve into"*, *"fast-paced digital landscape"*, *"game-changer"*, *"tapestry"*).
   - Author JSON-LD `Person` schema & `sameAs` extraction.
2. **Layer 2 — "Fake First-Person" & Information Gain Judge (1 Structured LLM Call `~$0.002` + Optional `~$0.001` Vision Check):**
   - **Hollow "I" vs. Verified Experience Rule:** First-person claims (*"I tested this"*) earn **`0 pts` by themselves** unless backed by at least **2 of 4 concrete friction signals**: (a) specific failure/limitation, (b) exact measured metric/time/cost, (c) exact UI/workflow path, or (d) adjacent visual/data artifact.
   - Optional lightweight Vision spot-check confirms real screenshots/charts vs. decorative AI art.
   - Deep Mode checks **Information Gain** against cached Top-3 Google SERP summaries.
3. **Layer 3 — `$0` Live Studio Process Telemetry (Mode B Only):** Active drafting duration, revision history, typed vs. bulk-pasted character ratio, and Middle E-E-A-T interview completion.

### Locked 100-Point `CA` Rubric, Fair AI-Polish Rule & Author Entity Footprint

| CA Scoring Dimension | Max Pts | Locked Evaluation Criteria |
| :--- | :---: | :--- |
| **1. Verified First-Hand Proof & Specificity** | **25 pts** | Backed experience claims (`>= 2` friction signals), real drawbacks, exact metrics/steps. Hollow first-person fluff gets `0`. |
| **2. Original Media & Visual Proof** | **20 pts** | Real UI screenshots, custom charts, original photos, data tables, embedded videos. Generic stock/decorative AI art gets `0–2`. |
| **3. Research Depth & Live Citations** | **20 pts** | Working, non-404 deep outbound citations to authoritative primary sources + contextual internal linking. |
| **4. Information Gain & Human Rhythm** | **20 pts** | Unique insights beyond Top-3 SERP consensus + natural sentence burstiness + low AI cliché density. |
| **5. Real Author Digital Footprint & Methodology** | **15 pts** | **Cached Entity Verification (30–90 days in Supabase, `~$0` repeat cost):** Verifies real author digital footprint (`sameAs` LinkedIn/X/YouTube/GitHub + cross-web authority signals like established industry practitioners), plus dates & methodology. Capped as one balanced signal so fame alone never substitutes for article quality. |
| **Fair AI-Polish Minor Deduction** | **`-5` to `-10`** | Genuine human research/proof polished for grammar with AI retains full Evidence points with only a minor Polish deduction—honest experts still score `80–88/100`. |
| **Anti-Gaming Penalties** | **Up to `-25`** | `-10` Hollow First-Person Spam; `-10` Broken/Hallucinated Citation URLs; `-10` Severe AI Cliché / Stock Stuffing. |

### Logarithmic Difficulty Curve, Golden Benchmark Set & Lead-Magnet Funnel
- **DR-Style Logarithmic `CA` Curve:** `0–49` Thin / AI Slop | `50–69` Needs Proof | `70–84` Strong Human Authority | `85–92` Elite Expert Craft | `93–100` Benchmark Masterpiece (virtually impossible without original research, live proof, and Mode B Studio Verification).
- **Curated Golden Benchmark Database (200–500 High-Quality Articles, NOT Millions of Noisy Rows):** 4 curated regression buckets in Supabase (Genuine Human Expert / Human-Researched + AI-Polished / 1-Prompt AI Slop / Sneaky Fake First-Person AI) to test every new CA rule before release.
- **Viral Growth Magnet:** **1 Free Public `CA` URL Check/day** on homepage (overall score + top 2 red flags) → Paid subscription unlocks the full line-by-line **Clickable Evidence Receipt**, unlimited existing-blog audits, live Studio CA meter, and Verified Public Writer Badges.

---

## 6. Updated Ongoing Research Queue & Verified External Sources

- [x] **V8.1–V8.3 Complete:** Core Keyword OS, SaaS Caching, On-Page SEO 100-Pt Rubric, Social AI Employee OS, Mentors, Trophy Case, Typed-Worker Live Job Board, Frugal DB Hygiene, Multi-Language Personalization & 4-Gate Massive-Input Law.
- [x] **V8.4 Complete:** Worst-Case Scale/Abuse Defense (1,000-page triage, 1,000 competitor URLs, marathon chat), Two-Brand Ecosystem & Non-Dilutive Funding, 28-Day GSC Baseline, **"GitHub for Content & Growth Teams"** Hybrid North Star, and **`Content Authority (CA 0–100)`** Detector Engine.
- [ ] **Next (V8.5):** Technical SEO Audit AI Agent 100-Point Rubric & Zero-LLM Diagnostic Architecture.
- [ ] **Next (V8.6):** Visual & Brand Studio / Social Hub Rubrics + Initial 50-Article `CA` Golden Benchmark Calibration.

### Verified External Sources
1. Google Search's Guidance on Generative AI Content: https://developers.google.com/search/docs/fundamentals/using-gen-ai-content
2. Spam Policies for Google Web Search (Scaled Content Abuse): https://developers.google.com/search/docs/essentials/spam-policies
3. Google's Latest Content Guidance (Oct 2026): https://8ms.com/blog/2026/googles-latest-content-guidance-what-it-means-for-ai-and-seo
4. Chris Dixon — Come for the Tool, Stay for the Network: https://cdixon.org/2015/01/31/come-for-the-tool-stay-for-the-network/
5. Microsoft for Startups Founders Hub: https://www.microsoft.com/en-us/startups | https://guptadeepak.com/startup-offers/guides/microsoft-for-startups
6. Cloudflare for Startups: https://www.cloudflare.com/startups/ | https://www.cloudflare.com/en-in/forstartups/
7. AWS Activate Founders: https://aws.amazon.com/startups/ | https://aws.amazon.com/aws-startups/learn/applying-for-aws-activate-credits-a-step-by-step-guide/
8. Google for Startups Cloud Program: https://cloud.google.com/startup/benefits
9. Stripe — What Is Non-Dilutive Funding?: https://stripe.com/resources/more/what-is-non-dilutive-funding
