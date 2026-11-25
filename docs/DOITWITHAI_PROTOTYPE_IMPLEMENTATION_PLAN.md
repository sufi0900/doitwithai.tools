# DoItWithAI.tools — Clean-Split & 5-Phase First Prototype Implementation Plan

> **STATUS: READY FOR PHASED IMPLEMENTATION ON PREVIEW BRANCH (`codex/infographic-studio-redesign`)**
> **Last Updated:** November 26, 2026
> **Branch Discipline:** Execute **strictly on `codex/infographic-studio-redesign`**. **NEVER commit to or modify `production-cloudflare` or `main`** until all 5 phases pass full QA and the Founder approves the production merge.
> **Target Audience:** Antigravity (Debugging & Backend/Full-Stack Lead) & Designer AI (Frontend Visuals Lead)
> **Strategic Context Docs:** Read alongside `docs/FOUNDER_HUB_V8_RESEARCH_LOG_ENTRY.md` and `docs/AI_AGENCY_V8_4_CONTENT_AUTHORITY_AND_STRATEGIC_ADDENDUM.md` for complete Two-Brand context.

---

## 1. Strategic Context: Why This Clean Split Exists (Two-Brand Architecture)

Previously, the `codex/infographic-studio-redesign` preview branch framed `doitwithai.tools` as an autonomous *"24/7 AI Employee Digital Agency."* That vision has officially graduated into a **separate, dedicated Second Brand — `Cauthra` (`cauthra.com`)**, which will be built cleanly from scratch in its own repository later.

Therefore, **`doitwithai.tools` (Brand 1)** must now be cleanly repackaged as a fast, focused, **Manual DIY AI SEO, Content Writer & Tool/Blog Website Builder Toolkit**—removing all autonomous AI Employee Agency UI, routes, and messaging from public view while safely archiving the reference code outside Next.js routing.

### Non-Overlapping Brand Boundary

| Capability | **Brand 1: `doitwithai.tools`** *(Build Now on Preview)* | **Brand 2: `Cauthra` (`cauthra.com`)** *(Built From Scratch Later)* |
| :--- | :--- | :--- |
| **Core Identity** | *"All-in-One DIY AI SEO, Content Writer & Tool Website Builder"* | *"Living AI Marketing Team + Content Authority (`CA`/`PCA`) Network"* |
| **Site Audit & On-Page** | Unified Manual Site Snapshot (combines existing free On-Page/Meta/Schema tools into 1 view; user clicks to fix) | Autonomous On-Page & Technical SEO AI Agents with 100-Pt Rubrics & Surgical H2 Beams |
| **Keyword Research** | Manual Brand Keyword Ideas, Clustering & Saved Backlog (`Send to Writer`) | Autonomous Keyword Specialist (12-Skill OS, live chat copilot, cross-agent handoffs) |
| **Content Writing** | **Flagship Manual AI SEO Content Writer** (article-by-article + real internal/external links + Infographic Studio V5 + 1-Click Social Pack) | 7-Step Locked Assembly Line + Mandatory Middle E-E-A-T Interview + Studio Process Telemetry |
| **Website Builder** | **AI Tool & Blog Website Builder** (pre-built tool widgets + isolated subdomain hosting; Phase 2 custom tool submissions) | Quiet onboarding cross-link pointing beginners to `doitwithai.tools` |
| **Calendar** | **Simple Manual Editorial Planner** (drag/drop dates & status checklist ONLY — zero auto-posting) | Autonomous Calendar Agent with 5-Stage Rolling Lock Window & hands-free CMS auto-posting |
| **Social / Community / Trust Metric** | **None** (only lightweight `/tools/seo-originality-plagiarism-checker` with future CTA to `Cauthra`) | Private AI Team Feed, Official Mentors, Trophies, Public Proof-of-Human Network, **`CA`/`PCA` Detector** & Chrome Tab-Group Extension |

---

## 2. Clean Archive Strategy (Zero Public Routes, Zero Bundle Bloat)

Do **NOT** delete the existing AI Agency / Autonomous Agent code permanently, and do **NOT** leave it inside `app/` or `lib/` where Next.js compiles routes or bloats the Cloudflare Worker bundle.

1. **Git Safety Tag First:** Create a tag before moving any files: `git tag archive/pre-cauthra-split-2026-11-26`.
2. **Pre-Move Import Audit (`grep`):** Search across `app/`, `components/`, and `lib/` for any imports referencing `ai-employee-agency`, `ai-agency`, or `autonomous-agents`. If any shared utility (e.g., Supabase helper, prompt helper, or UI primitive) is used by `/ai-content-writer`, `/ai-website-builder`, or `/founder-hub`, extract it into `lib/shared/` first.
3. **Move All 8 Second-Brand Folders into `_archive/cauthra-reference/`:**
   - `app/ai-employee-agency/` &rarr; `_archive/cauthra-reference/app/ai-employee-agency/`
   - `app/api/ai-employee-agency/` &rarr; `_archive/cauthra-reference/app/api/ai-employee-agency/`
   - `lib/ai-employee-agency/` &rarr; `_archive/cauthra-reference/lib/ai-employee-agency/`
   - `lib/ai-agency/` &rarr; `_archive/cauthra-reference/lib/ai-agency/`
   - `app/agents/` (11 autonomous agent routes) &rarr; `_archive/cauthra-reference/app/agents/`
   - `app/api/autonomous-agents/` &rarr; `_archive/cauthra-reference/app/api/autonomous-agents/`
   - `lib/autonomous-agents/` &rarr; `_archive/cauthra-reference/lib/autonomous-agents/`
   - `app/chrome-extension/` &rarr; `_archive/cauthra-reference/app/chrome-extension/`
4. **Exclude From Build:** Add `"_archive"` to `"exclude"` in `tsconfig.json` and `.eslintignore` so Next.js/Cloudflare builds completely ignore it (**0 public routes, 0 bundle bytes**).

---

## 3. Clean URL / Slug Architecture & Mandatory `301` Redirects

### Public SEO Landing Pages (Indexed in `app/sitemap.js`)
- `/ai-content-writer` — Flagship AI SEO Content Writer landing page (canonical).
- `/ai-website-builder` — Dedicated **AI Tool & Blog Website Builder** landing page (canonical).
- `/pricing` — Clean Free vs. Pro Creator (`$12/mo` or `$79/yr`) vs. Pro Plus (`$29/mo`) comparison.
- `/tools/*`, `/prompts/*`, `/ai-seo/*`, `/ai-tools/*`, `/ai-code/*`, `/blogs/*` — Existing SEO & free-tool funnels.

### Unified Logged-In Workspace (`noindex`, Protected Behind `/auth`)
- `/studio` — Site Overview & Combined 1-Click Audit Snapshot
- `/studio/keywords` — Saved Brand Keyword Ideas, Clustering & Topic Backlog
- `/studio/writer` — Flagship Manual AI Content Writer + Infographic Studio V5 + 1-Click Social Repurposing Pack
- `/studio/website-builder` — Manage `ai-website-builder` projects (hosted on isolated neutral subdomains, e.g., `user.doitwithai.site` + Pro custom CNAME — never subfolders on `doitwithai.tools/`)
- `/studio/planner` — Simple Manual Editorial Planner + Pro Prompt Vault & Saved Tool History

### Mandatory `301` Redirects (Stop Self-Cannibalization & Prevent 404s)
- `/tools/ai-content-writer`, `/tools/ai-article-writer`, `/tools/ai-blog-writer`, `/tools/ai-blog-article-writer` &rarr; **`301` `/ai-content-writer`**
- `/tools/ai-website-builder` &rarr; **`301` `/ai-website-builder`**
- `/ai-employee-agency` & `/ai-employee-agency/*` &rarr; **`301` `/studio`** (or `/pricing`)
- `/agents` & `/agents/*` &rarr; **`301` `/tools`**
- `/chrome-extension` &rarr; **`301` `/tools`**
- **Fix Malformed Relative Links:** Locate and fix the template bug generating indexed `/https:` and `/http:` URLs spotted in Google Search Console.

---

## 4. 60-Second 2-Path Onboarding Flow & Revenue Engine

### Post-Sign-Up Onboarding (`/auth` &rarr; `/studio/onboarding`)
1. **Path A — "I Already Have a Website":** User enters URL + 3 quick brand/niche questions &rarr; imports sitemap, runs the **Combined 1-Click Site Snapshot** (unifying existing On-Page/Meta/Schema checks), generates initial Brand Keyword Ideas, and routes straight into `/studio/writer`.
2. **Path B — "I Want to Build a Tool or Blog Website":** Routes into `/studio/website-builder` (`app/ai-website-builder/start`) so beginners launch a fast niche Tool/Blog site with pre-built tool widgets, then automatically connects that site back into `/studio`.

### Revenue Engine & Plan Guardrails
- **Free (`$0`):** Stateless `/tools/*` (capped daily runs) + 1 free trial article preview inside `/studio/writer` + sample `/prompts/*`.
- **Pro Creator (`$12/month` or `$79/year` Founding Pass):** 1 connected site, 15–20 complete publish-ready articles/mo (internal/external links + Infographic V5 + Social Pack), saved keyword backlog, unified site audit snapshot, AI Tool/Blog Website Builder access, and full Pro Prompt Vault.
- **Pro Plus (`$29/month`):** Up to 5 websites, 50 articles/mo, bulk exports, custom domain CNAME support.

---

## 5. Step-by-Step 5-Phase Implementation Roadmap

> **Execution Law:** Complete **one phase at a time**, run verification (`npm run build` + live route checks), and provide a concise diff summary before starting the next phase.

### Phase 1 — Brand De-Coupling, Safe Archive Move & Route Consolidation *(~2–3 days)*
- [ ] Create safety tag `archive/pre-cauthra-split-2026-11-26`.
- [ ] Run import audit across `app/`, `components/`, `lib/`; extract any shared utilities into `lib/shared/`.
- [ ] Move all 8 Second-Brand folders into `_archive/cauthra-reference/` and add `"_archive"` to `tsconfig.json` & `.eslintignore`.
- [ ] Remove all `"24/7 Autonomous AI Digital Agency"` messaging & links from `app/HomePageCode.jsx`, `components/Header/`, `components/Footer/`, `app/do-it-ai/`, and `app/sitemap.js`.
- [ ] Add all `301` redirects (duplicate AI writers, `/tools/ai-website-builder`, `/ai-employee-agency`, `/agents`, `/chrome-extension`) and fix `/https:` & `/http:` broken links.
- **Gate 1:** `npm run build` passes with 0 errors; 0 agency routes exist; homepage/nav read 100% as *"DoItWithAI — AI SEO, Content Writer & Tool Website Builder."*

### Phase 2 — Unified `/studio` Shell, 5 Verified Bug Fixes & 2-Path Onboarding *(~3–4 days)*
- [ ] Build the clean `app/studio/` layout shell (`noindex`, auth-protected via `app/auth/`) with 5 tabs (`Site Snapshot`, `Keywords`, `Writer`, `Website Builder`, `Planner & Prompts`).
- [ ] Fix the 5 verified preview bugs:
  1. `onboarding.server.ts:218` — slogan-glued keyword generation.
  2. `prompt-compiler.ts:149` — Stage 2 `Invalid block` runtime crash.
  3. `onboarding.server.ts:569` — `#bdbdbd` flat gray brand-color fallback.
  4. 5–6s blocking "Saving..." CTA (shift to optimistic UI / async feedback).
  5. Stale hardcoded `2025` year (inject dynamic UTC year) & 3-page partial crawl limit.
- [ ] Implement Path A (Connect Existing Site) and Path B (Launch via Website Builder) onboarding.
- **Gate 2:** Fresh test user completes Path A and Path B in `<60s` with zero console/server errors.

### Phase 3 — Wire the 5 Manual Pro Modules (Reuse Existing Code) *(~4–5 days)*
- [ ] Wire existing `lib/blog-writer`, `lib/blog-infographic-studio`, `lib/visual-stock`, `app/api/blog-writer`, and `app/api/writer-workspace` into `/studio/writer`.
- [ ] Wire `app/ai-website-builder` & `app/api/website-builder` into `/studio/website-builder` with isolated subdomain architecture + pre-built tool widgets.
- [ ] Wire unified Site Audit Snapshot into `/studio`, saved Keyword Backlog into `/studio/keywords` (1-click `Write Article`), and Manual Editorial Planner + Pro Prompt Vault into `/studio/planner` (persisted via `app/api/projects`).
- **Gate 3:** End-to-end test: connect site &rarr; view audit snapshot &rarr; save keyword &rarr; generate full article + infographic + social pack &rarr; build & preview a Website Builder site.

### Phase 4 — Monetization, `/pricing` & API Margin Guardrails *(~2–3 days)*
- [ ] Ship `/pricing` page (`Free` vs. `Pro Creator $12/mo` vs. `Pro Plus $29/mo`) and wire checkout (Paddle / LemonSqueezy / Stripe).
- [ ] Enforce server-side plan quotas (Supabase/Upstash Redis) so free users hit clean upgrade modals without burning LLM/SEO API keys.
- **Gate 4:** Free account cleanly hits limit & sees upgrade CTA; test Pro checkout immediately unlocks full `/studio` quotas.

### Phase 5 — Live GSC Quick-Win Polish & Production Merge *(~2–3 days)*
- [ ] Upgrade meta titles, descriptions, intros & internal links on top live GSC quick-win pages (Nov 26 data):
  1. `/ai-tools/merlin-ai-review` (573 impr · Pos 9.4)
  2. `/ai-code/chatgpt-portfolio-website` (246 impr · Pos 5.6 — 0 clicks!)
  3. `/ai-learn-earn/ai-infographic-generators` (155 impr · Pos 7.4 — 0 clicks!)
  4. `/ai-seo/h1-heading` (372 impr · Pos 18.8 — link to `/tools/h1-heading-generator`)
  5. `/tools/ai-art-image-prompt-generator` (Pos 6.3 — add dedicated **"8K Photo Prompt Generator"** H2/preset!)
  6. `/tools/article-to-quiz-test-generator` (Vol 1,600 · Pos 4.0)
- [ ] Run full Cloudflare Preview QA across desktop & mobile, verify Core Web Vitals and sitemap, then merge cleanly to `production-cloudflare`.
