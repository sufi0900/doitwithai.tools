# DoItWithAI.tools — 24/7 Autonomous AI Digital Agency OS
## Unified Commercial Operations Manual, Quality Constitution, UX Spec & 8-Phase Engineering Roadmap (v2.0 Master Blueprint)

> **Purpose of This Document:** This is the single source of truth for building, scaling, and governing the commercial **DoItWithAI.tools 24/7 AI Digital Agency OS**. It unifies all founder product decisions, multi-agent rules, multi-tenant quality assurance gates, real-world SEO edge-case handling, panel-by-panel UX specifications, technical stack architecture, and an 8-phase engineering implementation plan so any senior engineer or AI coding agent can execute without ambiguity.

---

## 1. Executive Summary & Core Product Thesis

DoItWithAI.tools is transitioning from an early prototype into a **commercial multi-tenant 24/7 AI Digital Agency OS** capable of serving thousands of distinct businesses (SaaS, e-commerce, local services, publishers, and internal DoItWithAI Website Builder domains).

### Non-Negotiable Founding Principles
1. **Zero Fake Pre-Populated Output:** Never fabricate 6 finished articles or inflated counters on first load. On entry, extract the real Website Knowledge Base, show `0 Published Articles`, and wait for explicit user sign-off (`Approve Knowledge Base & Start Agency`).
2. **Lean Commercial Roster (11 Real Specialists, Not 36 Decorative Sub-Agents):** Eliminate decorative middle-management layers that burn tokens and cause prompt drift. Operate a flat 3-tier command structure: **1 Neutral Workspace Copilot**, **1 Chief AI Officer (Orchestrator)**, and **11 High-Value Specialist Agents**.
3. **Bespoke Multi-Tenant Precision:** Every specialist invocation is compiled server-side with an immutable **Global Quality Constitution** + the client's isolated **Tenant Brand DNA Envelope** (`workspace_id`), ensuring a medical clinic, a DevOps startup, and a local plumber never receive generic output.
4. **Deterministic $0.00 Engineering Before LLM Tokens:** Run website crawling, sitemap indexing, HTTP 200 URL checks, competitor blocklist checks, readability scoring, calendar pacing math, and brand-locked SVG rendering in deterministic code—reserving live LLM APIs strictly for synthesis, writing, QA reasoning, and Copilot conversation.
5. **Zero Silent Failures:** Never swallow missing API keys (such as [Cloudflare Worker Previews](https://developers.cloudflare.com/workers/previews/) secret isolation) behind fake template replies or fabricated token counts.

---

## 2. Website Onboarding & Live Knowledge Base (Internal vs. External)

### Two Distinct Onboarding Paths
| Dimension | Path A: Internal Website (DoItWithAI AI Website Builder) | Path B: External Website (WordPress, Shopify, Webflow, Custom) |
| :--- | :--- | :--- |
| **Detection** | Automatic via workspace account ownership. | User submits live URL; verified via deterministic HTTP crawler. |
| **Brand DNA Extraction** | Instant database read of hex palette, typography, logo SVG, niche, and existing blog/page rows ($0.00). | Live crawl of homepage HTML, `robots.txt`, `sitemap.xml`, H1–H3 taxonomy, CSS palette, favicon/logo, and social handles ($0.00). |
| **Publishing Mode** | `internal_direct` — auto-publishes blogs, SVGs, JSON-LD, and internal links directly to CMS. | `external_export` (HTML/Markdown/DOCX download) until CMS connector or MCP bridge is authenticated (`cms_mcp_connected`). |
| **Technical SEO Fixes** | 1-click auto-patch for meta tags, canonicals, `sitemap.xml`, and `llms.txt`. | Copy-ready code patches and step-by-step developer fix tickets. |

### Optional 30-Second Goal Intake (Skippable, Always Editable in Copilot)
Immediately after extracting the Knowledge Base, offer an optional 3-field intake:
1. Primary service or product to promote this month.
2. Core business goal (Leads, Organic Traffic, Product Sales, or Brand Authority).
3. Target geography & audience locale (e.g., `en-US`, `en-GB`, local city/region).

### Mandatory Website Knowledge Base Schema (`TenantBrandDNA`)
```ts
export interface TenantBrandDNA {
  workspace_id: string;
  domain: string;
  site_type: 'internal_direct' | 'external_export' | 'cms_mcp_connected';
  business_model: 'b2b_saas' | 'ecommerce' | 'local_service' | 'publisher' | 'agency';
  domain_maturity: 'new_site' | 'established_site'; // <15 pages vs >=15 pages
  industry: string;
  sub_niche: string;
  out_of_scope_topics: string[];
  target_audience: string;
  reading_grade_target: 'grade_7_9' | 'grade_10_12' | 'executive';
  locale: string; // e.g. 'en-US', 'en-GB'
  currency: string; // e.g. 'USD', 'GBP', 'PKR'
  brand_voice: string[]; // 3 traits
  brand_colors: { primary: string; secondary: string; accent: string };
  typography: { heading: string; body: string };
  primary_cta: { label: string; target_url: string };
  is_ymyl: boolean; // Health, Finance, Legal -> enforces Human Approval Gate
  competitor_blocklist: string[]; // Never link externally to these domains
  live_sitemap_urls: Array<{ url: string; title: string; type: 'service' | 'product' | 'blog' | 'core'; last_checked: string }>;
  strategy_bus_version: number;
  active_priority_offer?: { name: string; target_url?: string; notes: string };
}
```

---

## 3. Lean Commercial Multi-Agent Roster (11 Specialists + Chief AI Officer + Neutral Copilot)

### Tier 1 & Tier 2 Command Layers
- **Default Workspace Copilot (Neutral ChatGPT-Style Control Plane):** Always the default chat drawer mode. Runs an explicit **Intent Classifier** (`casual_chat`, `workspace_read`, `web_research`, `delegate_task`, `strategy_pivot`). Natural human responses for greetings (`"hi"` never triggers a robotic sub-agent template); full live read access across all panels; inline delegation (`"Pass 'solar battery ROI' to Keyword Research"`); and live broadcast to the **Workspace Strategy Bus** so a single business pivot updates all 11 specialists immediately.
- **Chief AI Officer (Executive Orchestrator):** Maintains a compact executive summary (<600 tokens: total published, queued, failed, daily quota pace, open manual blockers) and coordinates the Calendar Quota Engine + `>= 10-minute` cooldown scheduler.

### Tier 3: The 11 High-Value Specialist Agents
| # | Specialist Agent | Core Commercial Deliverable | Tools & Isolation | Domain Memory Ledger | API Cost Mode |
| :-: | :--- | :--- | :--- | :--- | :--- |
| **1** | **Keyword & Competitor Researcher** | Low-KD topic clusters, search intent map, SERP gap analysis, `KeywordBrief` JSON. | Shared Web Research Tool + Sitemap Overlap Gate. | Tracked clusters, rejected duplicates, seasonal trends. | Deterministic SERP + 1 LLM call |
| **2** | **Article Writer Specialist** | Publication-ready long-form guides with real citations, tables, FAQs, and natural brand CTAs. | Shared Web Research Tool (live stats/sources) + `KeywordBrief`. | Brand voice, internal link graph, past article styles. | Live LLM (2–3 section calls) |
| **3** | **Fact-Check & Editorial QA** | 100-point quality gate checking factual claims, live URLs, readability, and zero AI fluff. | Stage 1 Code Validators + Web Research Tool. | Historical QA pass rates, recurring brand corrections. | $0.00 Code Gate + 1 LLM audit |
| **4** | **Visual & Infographic Designer** | Blog featured heroes, comparison charts, process diagrams, and reusable pin templates. | Deterministic brand-locked SVG factory ($0.00) + opt-in AI Image API. | Brand hex/font tokens, uploaded reference layouts. | $0.00 SVG / Opt-in Image API |
| **5** | **On-Page & Content Refresh SEO** | Meta tags, JSON-LD schema, internal link weaving, **AND existing service/blog page upgrades**. | Live Sitemap Index + Decay Scanner + Diff Generator. | URL taxonomy, anchor-text distribution, decay log. | Deterministic + micro LLM pass |
| **6** | **Technical Site Auditor** | Weekly CWV, crawl health, 404 scanner, `robots.txt`, `sitemap.xml`, and `llms.txt`. | Deterministic HTTP/DOM crawler + Auto-patch (Internal) / Code patch (External). | Historical CWV & AI readiness scores, fix tickets. | $0.00 Crawler + 1 summary call |
| **7** | **Off-Page & Digital PR** | Link-worthy data hooks, journalist/partner outreach drafts, unlinked mention tracker. | Reads published pillar articles; drafts strictly to Human Approval Queue. | Target publications, outreach templates, backlink log. | Live LLM (on-demand) |
| **8** | **Pinterest Specialist** | 2:3 vertical pin copy, keyword-rich pin descriptions, board assignments. | Isolated Pinterest OAuth/MCP + Visual Studio pin templates. | Published pins, timestamps, boards, saves/likes, trends. | Live LLM (compact batch) |
| **9** | **LinkedIn Specialist** | Authority text posts, 6–8 slide PDF carousel scripts, B2B discussion hooks. | Isolated LinkedIn OAuth/MCP. | Published posts, engagement metrics, winning hook styles. | Live LLM (compact batch) |
| **10** | **Facebook & Community** | Conversational page updates, question-led engagement posts, group summaries. | Isolated Meta Graph API/MCP. | Post history, comment engagement themes, peak hours. | Live LLM (compact batch) |
| **11** | **TikTok & Reels Scripter** | 30–60s vertical video scripts with 3-second visual hooks, B-roll cues, captions. | Isolated short-video export/MCP. | Scripted angles, hook retention notes, format trends. | Live LLM (compact batch) |

---

## 4. Multi-Tenant Quality Assurance, Link Integrity & 4-Layer Prompt Compiler

### 4-Layer Server-Side Prompt Compilation Stack (Strict Priority Order)
1. **Layer 1 — Immutable Global Quality & Safety Constitution (Highest Priority):** Zero fabricated stats/URLs, strict sitemap whitelist for internal links, competitor domain ban for external links, anti-fluff discipline, and YMYL human-review lock. Cannot be overridden by user text.
2. **Layer 2 — Tenant Brand DNA Envelope (Per `workspace_id`):** Auto-injected industry/sub-niche, audience reading grade, locale/currency, brand voice, live sitemap URLs, and competitor blocklist.
3. **Layer 3 — Specialist Craft System Prompt (1 of 11 Versioned Prompts):** Role-specific craft, strict JSON output schema, and platform formatting rules.
4. **Layer 4 — User Custom Rules + Visual Examples + Live Domain Ledger:** User-editable preferences (e.g., uploaded winning Pinterest pin screenshot) + specialist's recent published history + current session Web Research snippets.

### Two-Stage Quality Gate & 100-Point Commercial Scorecard
Every asset passes **Stage 1 ($0.00 Deterministic Code Validators)** before **Stage 2 (Independent Fact-Check QA Agent)**:
- **Stage 1 Code Validators ($0.00):** Live `HTTP 200` check on every URL; assert every internal URL exists in `live_sitemap_urls`; assert zero external URLs match `competitor_blocklist`; Flesch-Kincaid reading grade check; banned AI-cliché regex; JSON-LD & meta character-length bounds.
- **Stage 2 Fact-Check QA Scorecard (100 Points):**
  - Niche, Industry & ICP Fit: **25 pts**
  - Factual Accuracy & Live Citation Proof: **25 pts** *(Critical Auto-Fail on any fabricated stat)*
  - Internal & External Link Integrity: **20 pts** *(Critical Auto-Fail on any 404 or competitor link)*
  - Readability & Scannable Structure: **15 pts**
  - Brand Voice & Conversion CTA Alignment: **15 pts**
- **Release Thresholds:** `>= 85` with `0 Critical Fails` = Approved for Release (YMYL niches still hold for human sign-off); `70–84` = Max **1 targeted revision**; `< 70` or any Critical Fail = Quarantine in Founder Approval Queue.

---

## 5. Existing-Site Optimization, Anti-Cannibalization & 10 Real-World SEO Edge Cases

### The 3-Way Sitemap Overlap Gate (Zero Keyword Cannibalization)
Before adding any new keyword or service promotion to the queue, compare target intent, slug, and H1 against `live_sitemap_urls`:
- **`>= 80%` Match (Duplicate Risk):** **BLOCK** new page. Trigger **On-Page & Refresh Specialist** to upgrade the existing page + schedule 2–3 supporting informational cluster blogs linking up to it.
- **`50–79%` Match (Partial Overlap):** Present choice to merge into an existing H2 or lock a distinct non-competing search intent.
- **`< 50%` Match (Verified Gap):** Approve new article creation and wire bidirectional internal links.

### 10 Mandatory Production Edge-Case Rules
1. **Keyword Cannibalization:** Blocked by Sitemap Overlap Gate; pivots to Existing Page Refresh + supporting cluster.
2. **New Domain (0 Pages) vs. Established Site (500+ Pages):** New sites target foundational pillars + ultra-low-KD long-tail; established sites split quota 60% new gaps / 40% existing content refreshes.
3. **Content Decay & Outdated Dates:** Monthly scan flags stale years (`2022–2024`), dead links, or thin copy and queues refresh sprints.
4. **Local vs. E-Commerce vs. B2B SaaS:** Local injects geo-modifiers + `LocalBusiness` schema; E-Com keeps blogs informational linking to collection/product pages without cannibalizing product URLs.
5. **Crawl-Blocked, SPA, or Coming-Soon Sites:** If `< 250` words extracted or HTTP 403/503, halt crawl cleanly and show a 3-field Quick Brand Brief in Copilot.
6. **Multi-Language, Regional Spelling & Currency:** Auto-detect `html lang` and currency; enforce exact locale (`en-GB`, `en-US`, etc.) in Layer 2 Tenant DNA.
7. **Unsafe Publishing Velocity Spikes:** New domains enforce a Safe Ramp-Up Curve (max 1–2 articles/day Weeks 1–2) plus the hard `>= 10-minute` cooldown between autonomous runs.
8. **External CMS Sync Drift:** Automated weekly sitemap diff sync purges deleted/renamed external URLs from the internal link whitelist.
9. **Shifting Business Priorities / Discontinued Offers:** Strategy Bus version bump auto-pauses queued drafts mentioning deprecated services and notifies the user.
10. **Social Platform Policy & Cross-Post Spam:** Each platform specialist enforces native daily rate limits and unique per-network angles—never identical link-drop spam.

---

## 6. Panel-by-Panel Information Architecture & Sidebar UX Contract

### Dual-Chat Rule
- **Global `Ask Copilot` Button:** Always opens the neutral General Workspace Copilot.
- **Contextual `Chat with [Specialist]` Bar:** Pinned inside every agent-backed panel; opens the right drawer pre-bound to that exact specialist with the active item loaded in context.

### Complete Left-Sidebar Map (4 Groups · 13 Views + 4 Social Sub-Panels)
- **WORKSPACE:**
  1. `Overview` (Executive Hub — GSC-style daily progress graph, 3 honest KPI cards, active pipeline ticker, cooldown timer).
  2. `Agency Calendar` (Quota Engine — date-range targets e.g. `100 blogs / 200 pins / 30d`, visual day badges, cooldown slider `>= 10m`).
  3. `Live Node Canvas` (Real-time interactive graph of the 11 specialists; click any node to jump to its panel or 1-on-1 chat).
- **CONTENT & CREATIVE:**
  4. `Keyword & Topics` (Keyword Specialist — filterable queue with status pills, KD, intent, cannibalization badge, manual 1–5 topic override).
  5. `Article Studio` (Article Writer — full article library, live 100-pt QA score, citations/links counts, preview/editor, HTML/MD/DOCX export).
  6. `Visual & Brand Studio` (Visual Designer — **Factory only**: blog heroes, infographics, reusable pin templates, locked brand palette, reference screenshot uploads, SVG vs. opt-in AI image toggle).
  7. `Social & Video Hub` *(Expandable Left-Sidebar Dropdown)*:
     - Main view: Cross-platform totals, schedule overview, OAuth status.
     - Dropdown sub-panels: `Pinterest`, `LinkedIn`, `Facebook`, `TikTok & Reels` — each with native preview cards, publish logs, engagement stats, OAuth/MCP settings, and `Chat with [Platform] Specialist`.
- **SEO & GROWTH:**
  8. `Technical Site Audit` (Technical Auditor — continuous $0.00 weekly scan of CWV, 404s, `robots.txt`, `sitemap.xml`, `llms.txt`; 1-click auto-patch on Internal sites, copy-ready code fixes on External sites).
  9. `On-Page & Refresh` (On-Page & Refresh Specialist — existing URL inventory, content decay alerts, cannibalization warnings, side-by-side page upgrade diffs).
  10. `AI Visibility & Links` (Off-Page & PR Specialist — AEO/GEO citation score, internal link orphan detector, backlink log, human-approved outreach drafts).
- **OPERATIONS:**
  11. `QA & Auto-Publish` (Fact-Check QA — 100-pt scorecard breakdown, quarantined/YMYL review queue, 60-second WordPress/Shopify/Webflow/Webhook CMS connector).
  12. `Token & API Usage` (Deterministic Telemetry — per-specialist token/USD ledger, monthly quota bar, daily spend cap, loud pre-flight API key diagnostics).
  13. `Agent Skills & Cron` (Governance Panel — Layer 2 Brand DNA editor, Competitor Blocklist, per-specialist Layer 4 rules & reference uploads, global pause/cooldown controls).

---

## 7. Technical Stack, Infrastructure & Unit Economics

### Production Tech Stack (`sufi0900/doitwithai.tools` · Branch `codex/infographic-studio-redesign`)
- **Frontend & App Framework:** Next.js App Router (`app/ai-employee-agency/`), React, TypeScript, Tailwind CSS.
- **Edge Compute & Hosting:** Cloudflare Workers via `@opennextjs/cloudflare` (`open-next.config.ts`, `wrangler.jsonc`), respecting the [Cloudflare Workers 64 MiB uncompressed size limit](https://developers.cloudflare.com/changelog/post/2026-09-04-increased-worker-size-limit/) and [Cloudflare Workers CPU limits](https://developers.cloudflare.com/workers/platform/limits/) (10 ms Free / up to 5 min Paid).
- **Durable Background Orchestration:** Inngest (`inngest/`) for multi-step durable execution, `>= 10-minute` sleep/cooldown timers, idempotency keys, and zero Cloudflare HTTP 504 timeouts.
- **Database, Multi-Tenant Auth & Storage:** Supabase (`supabase/`) — PostgreSQL with Row-Level Security (RLS) partitioned strictly by `workspace_id` for `tenant_brand_dna`, `strategy_bus_events`, `agency_calendar_quotas`, `content_items`, `qa_audit_logs`, `social_ledger`, and `token_usage_ledger`.
- **Internal CMS:** Sanity (`sanity/`) / internal AI Website Builder DB for `internal_direct` auto-publishing.
- **Multi-Provider LLM Router:** [Gemini 2.5 Flash](https://creditforstartups.com/pricing/gemini-api-pricing) ($0.30/1M in, $2.50/1M out), [OpenAI GPT-4o-mini](https://www.aipricing.guru/models/gpt-4o-mini/) ($0.15/1M in, $0.60/1M out), and [Groq Llama 3.3 70B](https://www.spheron.network/blog/groq-api-pricing-2026-cost-per-token-vs-gpu-rental/) ($0.59/1M in, $0.79/1M out).
- **Estimated Unit Cost:** ~$0.015–$0.03 per complete 1,800-word researched article + QA audit + 4-platform social pack (12K–18K tokens).

### Commercial Quota & Billing Tiers
| Plan Tier | Monthly Asset Quota | Websites & Socials | Internal Token Cap & Est. COGS | Publishing & Visuals |
| :--- | :--- | :--- | :--- | :--- |
| **Starter ($29/mo)** | 20 articles, 60 social posts, 4 weekly audits | 1 Website · 2 Social Platforms | 500K tok/mo (~$0.60–$1.10 COGS) | Direct Internal / External Export · Brand SVGs |
| **Growth ($79/mo)** | 60 articles, 240 social posts, 12 audits + Copilot | 3 Websites · All 4 Social Platforms | 1.8M tok/mo (~$2.10–$3.80 COGS) | CMS/MCP Auto-Publish + 30 AI Hero Images/mo |
| **Agency Scale ($199/mo)** | 200 articles, 800 social posts, daily audits | 10 Client Websites · White-label | 6.0M tok/mo (~$6.80–$12.50 COGS) | Full MCP Fleet + Custom Visual Packs + BYOK |

---

## 8. Complete 8-Phase Engineering Implementation Roadmap

Each phase is independently testable, deployable on Cloudflare Workers without breaking existing routes, and maps directly to the existing `app/ai-employee-agency/` and `app/api/ai-employee-agency/` structure.

### Phase 1 — Foundations, Secret Diagnostics & Neutral Copilot Repair (Priority P0)
- **Objective:** Fix the two live preview bugs immediately and establish the multi-tenant database schema.
- **Key Deliverables:**
  - Configure Cloudflare Preview + Production secrets (`GEMINI_API_KEY`, `OPENAI_API_KEY`, `GROQ_API_KEY`) and add a pre-flight key check endpoint so missing keys show a clear diagnostic banner with `0` fake tokens billed.
  - Refactor `app/api/ai-employee-agency/agent-chat/route.ts` to default to **Neutral Workspace Copilot** with an explicit Intent Classifier (`casual_chat`, `workspace_read`, `web_research`, `delegate_task`, `strategy_pivot`). Eliminate robotic fallback replies on `"hi"`.
  - Create Supabase migrations (`supabase/migrations/`) for `tenant_brand_dna`, `strategy_bus_events`, `content_items`, `qa_audit_logs`, `social_ledger`, and `token_usage_ledger` with strict `workspace_id` RLS.
- **Acceptance Criteria:** Typing `"hi"` in Copilot returns a natural human greeting grounded in real workspace counts; Preview worker executes real Gemini calls; zero fake pre-populated articles on new workspace creation.

### Phase 2 — Real Website Onboarding Crawler, Brand DNA & Sitemap Overlap Gate
- **Objective:** Make every workspace genuinely bespoke from minute one and block keyword cannibalization.
- **Key Deliverables:**
  - Build deterministic onboarding crawler (`lib/ai-agency/onboarding-crawler.ts`) supporting Path A (`internal_direct`) and Path B (`external_export`), extracting `sitemap.xml`, `robots.txt`, H1–H3 taxonomy, hex colors, fonts, locale/currency, and YMYL classification.
  - Add fallback 3-Field Quick Brand Brief UI for crawl-blocked/SPA/coming-soon sites.
  - Build the **3-Way Sitemap Overlap Gate** (`lib/ai-agency/cannibalization-gate.ts`) returning `BLOCK_UPGRADE_EXISTING`, `DIFFERENTIATE`, or `VERIFIED_GAP`.
  - Add optional 30-second Goal Intake + explicit `Approve Knowledge Base & Start Agency` gate.
- **Acceptance Criteria:** Connecting any live URL populates a real `TenantBrandDNA` record; proposing a duplicate of an existing service page is automatically blocked and routed to Refresh Mode.

### Phase 3 — 4-Layer Prompt Compiler, 11-Specialist Registry & Shared Web Research Tool
- **Objective:** Consolidate the bloated 36 sub-agents into the lean 11-specialist commercial roster with strict prompt governance.
- **Key Deliverables:**
  - Implement server-side **4-Layer Prompt Compiler** (`lib/ai-agency/prompt-compiler.ts`) enforcing Layer 1 (Immutable Global Constitution) > Layer 2 (Tenant DNA) > Layer 3 (11 Versioned Specialist Prompts) > Layer 4 (User Rules + Visual Refs + Domain Ledger).
  - Wire one unified **Web Research Tool** (`lib/ai-agency/web-research.ts`) shared by Keyword Research, Article Writer, Fact-Check QA, and Copilot.
  - Implement **Workspace Strategy Bus** so a single pivot directive in Copilot bumps `strategy_bus_version`, updates all 11 specialists' context, and pauses conflicting queued drafts.
- **Acceptance Criteria:** All 11 specialists execute real LLM calls using compiled 4-layer prompts; every external stat in a generated draft carries a verbatim URL retrieved from the Web Research Tool.

### Phase 4 — Two-Stage Quality Gate ($0.00 Code Validators + 100-Point QA Agent)
- **Objective:** Guarantee commercial-grade accuracy, zero 404s, zero competitor links, and YMYL safety at scale.
- **Key Deliverables:**
  - Build Stage 1 `$0.00` Deterministic Validators (`lib/ai-agency/qa-validators.ts`): live `HTTP 200` URL checker, `live_sitemap_urls` whitelist enforcer, `competitor_blocklist` filter, Flesch-Kincaid reading grade scorer, banned AI-cliché regex, and JSON-LD validator.
  - Upgrade Fact-Check QA Specialist to output the structured **100-Point Commercial Scorecard** (`>= 85` pass, `70–84` max 1 targeted revision, `< 70` or Critical Fail quarantine).
  - Enforce YMYL Human Approval Lock inside `QA & Auto-Publish`.
- **Acceptance Criteria:** Intentionally injecting a fake internal slug, a 404 external link, or a competitor domain causes Stage 1 to fail at `$0.00` API cost before publishing.

### Phase 5 — Durable Step-by-Step Pipeline, Calendar Quota Engine & Cooldown Scheduler
- **Objective:** Replace synchronous single-request runs with durable, paced 24/7 execution that never times out on Cloudflare Workers.
- **Key Deliverables:**
  - Build Inngest durable pipeline (`inngest/ai-agency-pipeline.ts`) splitting each run into persisted stages: `Keyword Brief -> Research Writer -> Stage 1+2 QA -> Visual/On-Page -> Idempotent Publish -> Memory Sync`.
  - Enforce idempotency keys (`workspace_id + target_slug + cycle_date`), `>= 10-minute` cooldown sleeps, Safe Velocity Ramp-Up for new domains, and hard circuit breakers (max 1 QA retry, max 6 LLM calls/run).
  - Build the **Agency Calendar** UI (`Agency Calendar` sidebar panel): date-range quota planner (`100 articles / 200 pins / 30d`), daily pacing math, priority ad-hoc manual overrides, and visual day milestone badges.
  - Upgrade `Overview` with the **GSC-Style Daily Progress Graph** (7d/30d/90d trend lines).
- **Acceptance Criteria:** Scheduling a 30-day quota executes stage-by-stage with zero 504 timeouts, zero duplicate publishes on retry, and accurate daily progress plotting.

### Phase 6 — Sidebar UX Upgrade, Social Dropdown (1+4 Views) & Contextual Specialist Chat
- **Objective:** Implement the v1.3 Panel-by-Panel UX Contract cleanly across the V6 sidebar shell.
- **Key Deliverables:**
  - Add expandable **`Social & Video Hub`** dropdown in the left sidebar exposing `Pinterest`, `LinkedIn`, `Facebook`, and `TikTok & Reels` sub-panels—each bound to its own specialist and Domain State Ledger.
  - Separate **`Visual & Brand Studio`** (Factory: blog heroes, SVGs, reference screenshot uploads, opt-in AI image toggle) cleanly from Social Distribution.
  - Add the sticky contextual **`Chat with [Panel Specialist]`** bar inside every agent-backed panel while keeping the global `Ask Copilot` button strictly neutral.
- **Acceptance Criteria:** Clicking `Chat with Pinterest Specialist` opens 1-on-1 Pinterest chat with pin history loaded; clicking `Ask Copilot` always opens neutral Workspace Copilot.

### Phase 7 — Existing-Page Refresh Engine, Technical Auditor & CMS/Social MCP Connectors
- **Objective:** Unlock full commercial value for established websites and automated multi-channel publishing.
- **Key Deliverables:**
  - Build **`On-Page & Refresh`** side-by-side upgrade diff workbench for existing service pages and decaying blog posts, plus automated Weekly Sitemap Diff Sync.
  - Upgrade **`Technical Site Audit`** with continuous weekly $0.00 scanning, 1-click auto-remediation for Internal sites, and copy-ready code patches for External sites.
  - Wire isolated OAuth/MCP connectors for WordPress, Shopify, Webflow, Webhook (`app/api/ai-employee-agency/publish-cms`), Pinterest API, LinkedIn API, and Meta Graph API—defaulting to Human Approval Queue until opt-in Auto-Publish is enabled.
- **Acceptance Criteria:** Existing service pages can be audited and refreshed without creating duplicate slugs; Internal sites auto-publish cleanly; External sites export or push to CMS draft cleanly.

### Phase 8 — Commercial Billing Quotas, Token Telemetry, Spend Caps & Launch Hardening
- **Objective:** Make the platform commercially profitable, transparent, and safe for 1,000+ concurrent workspaces.
- **Key Deliverables:**
  - Enforce atomic daily and monthly workspace token/asset ceilings (`Starter`, `Growth`, `Agency Scale` + BYOK mode) before every LLM dispatch.
  - Wire **`Token & API Usage`** panel with live per-specialist token/USD breakdowns, 80% soft alerts, and 100% clean cron pause.
  - Run full end-to-end commercial load, multi-tenant RLS isolation, YMYL gate, and Cloudflare bundle-size (`< 64 MiB`) verification.
- **Acceptance Criteria:** Reaching 100% quota pauses autonomous runs cleanly with zero runaway API spend; multi-tenant penetration check confirms zero cross-workspace data leakage.
