# DoItWithAI.tools — 24/7 AI Digital Agency OS
## V4 Real-Time Architecture, API Key Isolation, Cloudflare Env Spec & 6-Phase Master Implementation Plan

**Repository:** `sufi0900/doitwithai.tools`  
**Active Development / Preview Branch:** `codex/infographic-studio-redesign` (`https://codex-infographic-studio-redesign-doitwithai-tools.doitwithaitools.workers.dev`)  
**Live Public Production Branch:** `production-cloudflare` (`https://doitwithai.tools`)  
**Updated:** 2026-11-21  
**Related Docs:**
- `docs/AI_AGENCY_COMMERCIAL_MASTER_BLUEPRINT.md` (Commercial tiers, RLS, 100-pt QA, 13-agent lean roster)
- `docs/AI_AGENCY_PRODUCTION_SETUP.md` (Supabase migrations, Inngest cron, CMS/MCP secrets, `< 64 MiB` Worker check)
- `docs/AI_PROVIDER_FALLBACK.md` (Public tools 4-key rotation & evergreen Gemini cascade)

---

## 1. Non-Negotiable Repository, Branch & API Key Rules (Read Before Coding)

### 1.1 Strict Branch Separation (Never Violate)
| Branch | Purpose | What Belongs Here | What Is Strictly Forbidden |
| :--- | :--- | :--- | :--- |
| **`production-cloudflare`** | Live public site (`https://doitwithai.tools`) | Public SEO/AI tools, blog, prompts, shared public-tool failover (`lib/ai-tools/*`, `lib/ai/multi-model-router.ts`) | **NEVER** merge or expose the under-construction **24/7 AI Employee Digital Agency** (`ai-employee-agency`) or **AI Website Builder** (`website-builder`) here |
| **`codex/infographic-studio-redesign`** | Cloudflare Preview & Active Development | 24/7 AI Employee Digital Agency, AI Website Builder, Infographic Studio, Founder Hub updates, and all V4 real-time agency upgrades | Never push untested breaking builds; keep `< 64 MiB` Worker bundle limit |
| **`main`** | Founder's separate local branch | Do not modify unless explicitly instructed by the Founder | Never push directly without permission |

### 1.2 Strict API Key Isolation & Evergreen Gemini Model Cascade
> **CRITICAL:** `gemini-2.0-flash` was shut down on June 1, 2026 (HTTP 404), and `gemini-2.5-flash` is deprecated and returns HTTP 404 on newly created API keys. **NEVER hardcode `gemini-2.0-flash` or rely solely on `gemini-2.5-flash`.**

#### A. 24/7 Autonomous AI Digital Agency Keys (Strictly Isolated)
- **Primary Key:** `AUTONOMOUS_AUTOMATION_GEMINI_KEY` (plus optional agency-only aliases: `AGENCY_GEMINI_API_KEY`, `GEMINI_AUTOMATION_API_KEY`, `AUTONOMOUS_AUTOMATION_API_KEY`; optional agency-only backups: `AUTONOMOUS_AUTOMATION_GROQ_KEY`, `AUTONOMOUS_AUTOMATION_OPENAI_KEY`).
- **Gateway Path:** Every single LLM call in the 24/7 AI Digital Agency (Onboarding Brand DNA synthesis, Initial 6 Low-KD Keyword Cards, Chief AI Officer, Workspace Copilot, all 11 Specialist Workbenches, 5-Stage Live Production Pipeline, QA Scorecard, On-Page Refresh suggestions, and Social/Video Generators) **MUST** go through `meteredAgencyCall()` (`lib/ai-agency/billing.server.ts`) → `executeAgencyLlmCall()` (`lib/ai-employee-agency/llm-gateway.ts`).
- **Evergreen Agency Model Cascade:** `gemini-flash-lite-latest` → `gemini-3.5-flash-lite` → `gemini-flash-latest` → `gemini-3.8-flash` → `gemini-2.5-flash`.
- **Forbidden:** Agency code must **NEVER** read or fall back to the 4 reserved public-tool keys (`GEMINI_API_KEY`, `GEMINI_API_KEY_2`, `GROQ_API_KEY`, `OPENROUTER_API_KEY`). Enforced by unit tests in `tests/ai-tools/agency-commercial-foundation.test.ts`.

#### B. Public AI Tools Keys (4-Key Automatic Rotation — Both Production & Preview)
- **Reserved Public-Tool Pool (Exact Order):**
  1. `GEMINI_API_KEY` → `GEMINI_API_KEY_2` *(and `GEMINI_API_KEYS` / `GEMINI_API_KEY_3..10` / `GEMINI_API_KEY_BACKUP`)* using `DEFAULT_GEMINI_MODEL = "gemini-flash-lite-latest"` and `GEMINI_MODEL_CASCADE` (`gemini-flash-lite-latest` → `gemini-3.5-flash-lite` → `gemini-flash-latest` → `gemini-3.8-flash`), with all-tools HTTP 400 `schemaRejected` JSON-mode recovery and HTTP 404 model cascade.
  2. `GROQ_API_KEY` (`openai/gpt-oss-120b` for text, `qwen/qwen3.8-27b` for vision) with markdown-fence JSON extraction.
  3. `OPENROUTER_API_KEY` (`OPENROUTER_FREE_MODELS`: `openrouter/free` → `meta-llama/llama-3.3-70b-instruct:free` → `qwen/qwen-2.5-72b-instruct:free`).
- **Workers-Safe Logging:** Always use `safeStderrLog()` from `lib/ai-tools/request-body.ts` instead of bare `process.stderr.write(...)`.
- **Completed Commits:**
  - `codex/infographic-studio-redesign`: `2eb44bb` (TS build fixes), `5c021d7` (Agency dashboard responsive/layout overhaul), `f07906b` (API key isolation + evergreen Gemini cascade + 4-key rotation).
  - `production-cloudflare`: `e1dcf00` (clean public-tools-only backport of 4-key rotation + evergreen cascade; 0 preview/agency/website-builder files added).

### 1.3 Cloudflare Workers Production vs. Preview Runtime Variables & Secrets
Cloudflare Workers keeps **Production** and **Preview** Runtime Variables & Secrets completely separate:
- **Cloudflare Production (`production-cloudflare`):**
  - Keep: `GEMINI_API_KEY`, `GEMINI_API_KEY_2`, `GROQ_API_KEY`, `OPENROUTER_API_KEY`, `UPSTASH_REDIS_REST_URL`, `UPSTASH_REDIS_REST_TOKEN`, Supabase vars, Sanity vars.
  - **Delete `GEMINI_MODEL`** from Production Runtime Variables so Gemini automatically uses `gemini-flash-lite-latest` and cascades safely on retirement.
- **Cloudflare Preview (`codex/infographic-studio-redesign`):**
  - **Required for 24/7 AI Digital Agency:** `AUTONOMOUS_AUTOMATION_GEMINI_KEY`, `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`, `SUPABASE_SECRET_KEY`.
  - **Required for AI Website Builder:** `GEMINI_API_KEY` + Supabase vars above.
  - **Required if testing rate-limited Public AI Tools on Preview:** `UPSTASH_REDIS_REST_URL` and `UPSTASH_REDIS_REST_TOKEN` (Cloudflare Preview runs with `NODE_ENV=production`, and `lib/ai-tools/rate-limit.ts` fails closed with HTTP `503` without Redis).
  - **Optional in Preview:** `GEMINI_API_KEY_2`, `GROQ_API_KEY`, `OPENROUTER_API_KEY` (for full 4-key public-tool rotation; do **not** add `GEMINI_MODEL`), `NEXT_PUBLIC_SANITY_PROJECT_ID` / `NEXT_PUBLIC_SANITY_DATASET` (for Sanity pages), `AGENCY_IMAGE_ACCOUNT_ID` / `AGENCY_IMAGE_API_TOKEN` (for Visual Studio AI images), `AUTONOMOUS_AUTOMATION_GROQ_KEY` (optional agency backup LLM).
  - **Build-Time Note:** Next.js inlines `NEXT_PUBLIC_*` into client bundles at build time (`wrangler.jsonc` also sets `previews.vars` for Supabase). Add `NEXT_PUBLIC_*` to Cloudflare **Build variables** if browser-side auth ever reports missing config.

---

## 2. Deep Root-Cause Diagnosis: Why the 24/7 AI Digital Agency Currently Fails in Real Time

Code-level investigation across all 19 routes in `app/api/ai-employee-agency/`, all 14 modules in `lib/ai-agency/`, and all UI components in `features/ai-employee-agency/` uncovered **7 exact root causes**:

1. **Cloudflare Workers Edge Crawler Crash (`0 indexed pages · manual`):**
   - `features/backlink-verifier/fetch.server.ts:1-179` uses `node:https` `request()` with a custom `lookup` callback calling `node:dns/promises` `lookup()`. On Cloudflare Workers (`workerd`), raw DNS socket pinning is unsupported and throws immediately.
   - Because `onboarding.server.ts`, `web-research.ts`, `refresh.server.ts`, and `qa-validators.ts` all call `fetchPublic()`, every live crawl, sitemap discovery, web search, technical site audit, and QA URL check crashes on Cloudflare Workers (`onboarding.server.ts:95` catches and silently returns `0 pages · manual`).
   - Meanwhile, `wrangler.jsonc:8` already enables `"global_fetch_strictly_public"`, so an edge-safe `globalThis.fetch` fallback with manual redirect validation (max 5 hops), `publicUrl()` checks, and byte-bounded reads works natively at the edge.
2. **Blank Brand DNA Extraction + 14-Field Compulsory Form Wall:**
   - `lib/ai-employee-agency/onboarding.server.ts:18-72` leaves `industry`, `audience`, and `offer` completely empty (`''`) for external sites and throws at line 71 if `<body>` has `< 250` words *before* checking `/sitemap.xml`.
   - `supabase/migrations/20261121_agency_onboarding.sql:16-19` (`on conflict do nothing`) + `app/api/ai-employee-agency/workspace/route.ts:28` (`discover: data && !data.profile?.checkedAt`) skip re-discovery if an earlier failed crawl set `checkedAt`.
   - `features/ai-employee-agency/KnowledgeReview.tsx:98-148` then forces a 14-field manual form with `required` on `name`, `industry`, and `audience`.
3. **Premature Dashboard Unlock & Missing Guided Onboarding Gate:**
   - `features/ai-employee-agency/AiAgencyPublicLanding.tsx:204` redirects straight to `/ai-employee-agency/dashboard` immediately after registration. The user lands on a full dashboard showing `0` metrics while every specialist API returns HTTP `409 ("Approve the website knowledge base first.")`.
4. **Catastrophic Digit-Matching Bug in `verifiedReply()` (HTTP 422 Across Copilot & All 11 Specialists):**
   - `lib/ai-agency/prompt-compiler.ts:23-26` runs `const numbers = block.text.match(/\d+(?:[.,]\d+)*%?/g) || []` and throws `Error('Unsupported citation')` whenever **any digit** appears in `block.text` without a matching Wikipedia `evidence` quote—even for numbered lists (`1.`, `2.`), headings (`H1`, `H2`), years (`2026`), `"5-point checklist"`, `"60s script"`, or `"8-slide carousel"`.
   - Since `app/api/ai-employee-agency/agent-chat/route.ts:48` passes `evidence = []` for Copilot, Chief AI Officer, and 8 specialists, nearly 100% of real Gemini responses fail with HTTP `422`.
5. **Over-Strict Sitemap Overlap Gate Rejecting All Topics on Partial/Manual Sitemaps:**
   - `lib/ai-employee-agency/site-knowledge.ts:27` forces `action = 'review'` whenever `profile.coverage !== 'complete'` (even when `best === 0` overlap), and `app/api/ai-employee-agency/topics/route.ts:15` returns `{ queued: false }` on `'review'`, making it impossible to queue any topic on sites with `> 4` sub-sitemaps, `> 500` URLs, or missing `/sitemap.xml`.
6. **Disconnected Keyword & Live Execution APIs:**
   - `app/api/ai-employee-agency/orchestrate/route.ts`, `run-agent-step/route.ts`, `site-audit/route.ts`, `competitor-gap/route.ts`, and `visibility-check/route.ts` are only wired to the legacy `?view=legacy` shell (`AiAgencyDashboardShell.tsx`)—none are called by the active V6 dashboard (`AgencyWorkspaceOverview.tsx` / `PanelWorkspace.tsx`).
7. **No Direct Real-Time Pipeline Execution Without External Inngest Cron:**
   - `inngest/ai-agency-pipeline.ts` only runs when triggered by external Inngest `*/10 * * * *` cron events, while `run-agent-step/route.ts` returns JSON without persisting rows into Supabase (`agency_production_runs`, `agency_specialist_work`, `qa_audit_logs`, `content_items`, `social_ledger`).

---

## 3. V4 6-Phase Implementation Plan (Execute Sequentially on `codex/infographic-studio-redesign`)

### Phase 1 — Fix Edge Crawler (`fetchPublic`), Smart Citation Verifier (`verifiedReply`) & Partial-Sitemap Overlap Gate [P0]
- **`features/backlink-verifier/fetch.server.ts`:** Add an edge-safe `globalThis.fetch` fallback when `node:dns/promises` socket pinning is unavailable (Cloudflare Workers), preserving `publicUrl()`, manual redirect verification (max 5 hops), content-type enforcement, and byte-bounded stream reading (and keeping local Node unit tests passing).
- **`lib/ai-agency/prompt-compiler.ts` & `app/api/ai-employee-agency/agent-chat/route.ts`:** Upgrade `verifiedReply()` so ordinal lists (`1.`, `2.`), headings (`H1`–`H6`), years (`2024`–`2030`), dimensions (`1200x675`), durations (`60s`), and workspace counts never trigger false-positive `Unsupported citation` HTTP `422` errors; still strictly verify any explicit external URL citation against `evidence` or `live_sitemap_urls`, and cleanly parse both JSON `{"blocks":[...]}` and Markdown fallbacks.
- **`lib/ai-employee-agency/site-knowledge.ts` & `app/api/ai-employee-agency/topics/route.ts`:** Allow `best < 50` to return `action: 'create'` (with `inventoryCoverage: profile.coverage`) even on `'partial'` or `'manual'` coverage, and support explicit `{ forceDifferentiated: true }` for `50–79%` partial overlap.

### Phase 2 — Automatic Brand DNA Synthesis, 6 Pre-Built Low-KD Keywords & Strict Dashboard Lock Gate [P0]
- **`lib/ai-employee-agency/onboarding.server.ts` & `app/api/ai-employee-agency/knowledge/route.ts`:**
  - Always crawl `/robots.txt` and `/sitemap.xml` regardless of homepage body word count.
  - Extract richer HTML metadata (`meta description`, `og:description`, JSON-LD `@type`/services, nav anchors, H1–H3, colors, fonts, locale, currency).
  - Run `synthesizeInitialBrandAndKeywords()` via `meteredAgencyCall` (`AUTONOMOUS_AUTOMATION_GEMINI_KEY`, with deterministic fallback) during `action: 'discover'` to automatically pre-fill `name`, `industry`, `sub_niche`, `audience`, `offer`, `goal`, `business_model`, `brand_voice`, `locale`, `currency` AND generate **6 clickable low-KD keyword opportunity cards** (`suggestedKeywords[]`, live Google Autocomplete + `topicDecision()` overlap checked).
- **`app/api/ai-employee-agency/workspace/route.ts`:** Always allow re-discovery on registration if `pages.length === 0`, `!approved_at`, or the domain changed.
- **`features/ai-employee-agency/AgencyWorkspaceOverview.tsx`, `KnowledgeReview.tsx`, `AiAgencyPublicLanding.tsx`:**
  - **Lock the dashboard** whenever `!summary?.website?.approved_at`, rendering a clean **4-Step Guided Onboarding Studio** instead of unapproved `409` panels.
  - Show a side-by-side **Verified Brand Dossier** (left, all fields pre-filled with optional collapsible "Edit Brand Details" drawer—zero compulsory blank blockers) and **6 Clickable Low-KD Keyword Cards** (right, top 3 pre-selected + custom keyword input).
  - Provide two explicit CTAs:
    1. **`Approve & Start Digital Agency Now`** — approves Brand DNA, queues selected keywords, ensures an active 30-day starter calendar quota exists, unlocks the dashboard, and immediately launches **Live Production Run #1**.
    2. **`Approve & Enter Dashboard Manually`** — approves auto-detected Brand DNA and unlocks the dashboard without auto-queuing articles.
  - Update landing page copy to accurately describe the **13 Autonomous AI Agents** (Workspace Copilot + Chief AI Officer + 11 Specialists).

### Phase 3 — Real-Time 5-Stage Production Pipeline Runner & Live Activity Feed [P0]
- **`app/api/ai-employee-agency/run-agent-step/route.ts`:** Upgrade all 5 stages (`0: keywords`, `1: writer`, `2: visual`, `3: qa`, `4: social`) to use `meteredAgencyCall` (`AUTONOMOUS_AUTOMATION_GEMINI_KEY` only) + 4-layer compiled prompts AND persist real rows into `agency_production_runs`, `agency_specialist_work`, `qa_audit_logs`, `content_items`, and `social_ledger` (while keeping `inngest/ai-agency-pipeline.ts` intact for unattended 24/7 cron).
- **New `LivePipelineTracker` UI (Overview + Article Studio):** Horizontal 5-stage live stepper (`1. Research & Brief → 2. Long-Form Writing → 3. Brand Visuals → 4. 100-Pt QA Gate → 5. Social & Delivery Queue`) with active pulse state, live specialist label, real token/USD readout, live output preview, and a 1-click **`Run Next Queued Topic Live`** trigger in the top bar, `Overview`, `Agency Calendar`, and `Article Studio`.

### Phase 4 — Interactive Specialist Workbenches for All 13 Agents [P1]
- **`Keyword & Topics`:** 1-click **`Discover 6 Low-KD Keywords & Gap Analysis`** button calling `/api/ai-employee-agency/orchestrate`, clickable keyword cards with `KD`, `Intent`, `Overlap Gate`, and **`Queue Topic`** / **`Queue & Write Now`** actions.
- **`Article Studio`:** Queued topic list with **`Write Full Article Live (5-Stage Pipeline)`**, formatted Markdown preview, word/link counts, HTML/Markdown copy, and 1-click **`Send to QA Review`**.
- **`Technical Site Audit` & `On-Page & Refresh`:** 1-click **`Run Live Technical Site Scan Now`** button (persists to `agency_site_scans` on demand) and 1-click **`AI Optimize Title, H1 & Meta`** button in `On-Page & Refresh`.
- **`AI Visibility & Links`:** Wire live `/api/ai-employee-agency/visibility-check` and `/api/ai-employee-agency/competitor-gap` + Digital PR outreach drafts.
- **`Social & Video Hub` + 4 Channel Panels (`Pinterest`, `LinkedIn`, `Facebook`, `TikTok & Reels`):** In-panel **`Generate Pin Pack`** / **`Generate LinkedIn Carousel`** / **`Generate Community Post`** / **`Generate 60s Video Script`** actions that immediately save structured drafts into `social_ledger`.

### Phase 5 — Modern Calm-Monochrome UI & Left-Sidebar SVG Iconography [P1]
- **`features/ai-employee-agency/AgencySvgIcons.tsx` & `AgencyWorkspaceOverview.tsx`:** Render crisp `16×16` SVG icons on every left-sidebar nav item, dedicated brand SVG icons for **Pinterest** (`#E11D48`), **LinkedIn** (`#0A66C2`), **Facebook** (`#1877F2`), and **TikTok & Reels**, live badge counters (queued, ready-for-review, active pipeline pulse), and active-specialist synchronization with `CalmAgencyNodeCanvas.tsx`.

### Phase 6 — Verification & Cloudflare Workers `< 64 MiB` Release Gate [P0]
- Expand `tests/ai-tools/agency-commercial-foundation.test.ts` to verify strict `AUTONOMOUS_AUTOMATION_GEMINI_KEY` isolation across all new code paths, edge-safe `fetchPublic()`, smart `verifiedReply()`, partial-sitemap `topicDecision()`, and 5-stage pipeline persistence.
- Pass before pushing:
  - `pnpm exec tsc --noEmit` (0 errors)
  - `node --import tsx --test tests/ai-tools/agency-commercial-foundation.test.ts tests/ai-tools/multi-key-rotation.test.ts tests/ai-tools/provider-fallback.test.ts` (100% pass)
  - On Linux/CI Cloudflare build: `pnpm cf:build` + `node scripts/check-agency-worker-size.mjs` (strictly `< 64 MiB` uncompressed upload)
  - *(Note: On Windows, Next.js 14.2.35 `@vercel/og` has a known Windows-only `fileURLToPath` backslash bug on `/opengraph-image` routes; do NOT modify `opengraph-image` routes.)*
