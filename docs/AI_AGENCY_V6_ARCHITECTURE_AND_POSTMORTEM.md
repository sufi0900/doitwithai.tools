# DoItWithAI Agency OS — V6 Architecture, Live Postmortem & Engineering Playbook

**Branch:** `codex/infographic-studio-redesign` (Cloudflare Workers Preview ONLY — never merge into `production-cloudflare` or `main`)  
**Updated:** 2026-11-21  
**Audience:** All AI experts and engineers working on the 24/7 AI Employee Digital Agency OS.

---

## 1. Live Preview Postmortem — Five Mistakes Caught & How We Solved Them

Live testing on `doitwithai.tools` (167 indexed pages) exposed five concrete code-level defects in V5 that caused quota lockouts, robotic UX, and low-value SEO suggestions:

1. **4× Byte-as-Token Reservation Bug + 167-URL Prompt Bloat (`lib/ai-agency/billing.server.ts`, `lib/ai-agency/prompt-compiler.ts`):**
   - *Mistake:* `billing.server.ts` reserved raw UTF-8 byte length (`~4×` actual token count) as tokens, while `compilePrompt()` dumped up to 60–200 raw sitemap URLs into every call (burning 13,333 tokens on Stage 1 alone). Stage 2 then tried to reserve ~31,000 tokens and hit the Starter 50,000/day ceiling at only 40% actual usage.
   - *V6 Fix (Phase 1):* Replaced byte count with `estimatePromptTokens()` (`Math.ceil(bytes / 4) + 128`), added `selectRelevantSitePages()` (top-15 topical URLs + inventory summary), and introduced **Founder Unlimited Testing Mode** (`AGENCY_UNLIMITED_TESTING=true` or `AGENCY_ADMIN_USER_IDS` / `AGENCY_UNLIMITED_WORKSPACE_IDS`) that removes testing lockouts while still logging 100% real token & USD telemetry to `token_usage_ledger`.
2. **Unrequested Truncated "Proposed SEO Update" (`features/ai-employee-agency/RefreshWorkbench.tsx`):**
   - *Mistake:* Clicking any URL automatically ran `repairFields()` (a blind 70-character string slicer) and displayed it as `"Proposed SEO update"` (chopping live titles mid-word like `...Chrome Extens` and `... | Do`) before the user ever requested an optimization.
   - *V6 Fix (Phase 2):* Page clicks run strictly a `$0.00` zero-LLM diagnostic scorecard with transparent pass/fail rules and a circular SVG health ring—never fake default diffs. Full multi-agent optimization runs only when the user explicitly opts in on a chosen page.
3. **Duplicated Technical Audit & On-Page Refresh Views + Missing Circular Health Gauge (`AgencyWorkspaceOverview.tsx`):**
   - *Mistake:* Both `Technical Site Audit` and `On-Page & Refresh` rendered the exact same `RefreshWorkbench` component, duplicating the 167-page list and omitting the circular progress gauge.
   - *V6 Fix (Phase 2):* Dedicated **Technical Site Audit** (circular SVG health ring + site-wide crawl/meta/media telemetry) separated cleanly from **On-Page & Refresh** (dedicated Existing Articles & Pages optimization studio).
4. **Identical Onboarding Keywords on Repeated Runs (`lib/ai-employee-agency/onboarding.server.ts`):**
   - *Mistake:* Quota/fallback triggers returned static deterministic templates, and repeated runs lacked an exclusion list of previously generated keywords or live Reddit/Quora research seeds.
   - *V6 Fix (Phase 3):* Integrate live Web Research (Reddit, Quora, Google Autocomplete) with its own **Web Research** telemetry line in `Token & API Usage`, plus previously-suggested keyword exclusion so re-runs always discover fresh opportunities.
5. **Missing Explicit Criteria, Category-Based Knowledge Base & Scroll-Safe Craft:**
   - *V6 Fix (Phases 4–5):* Embed rich default specialist system prompts, organize the Supabase `pgvector` Practitioner Brain into 6 explicit domain categories (`On-Page SEO`, `Technical SEO`, `Keyword & Web Research`, `Off-Page & AI Visibility`, `Content Writing & QA`, `Visual & Brand Design`), allow user-editable per-specialist overrides, and elevate the calm-monochrome UI with cleaner typography and scroll-safe responsive layouts.

---

## 2. Core Architectural Laws (Non-Negotiable)

- **Quality First, Zero Waste:** Never starve prompts or compromise E-E-A-T, competitor gap depth, internal linking, or live web research to save pennies. Eliminate only waste, duplication, over-reservation bugs, and unnecessary LLM calls where deterministic mechanical code works at `$0.00`.
- **1-Flip Provider-Agnostic Switch (Gemini Now → OpenAI / ChatGPT Later):**
  - Testing uses isolated Gemini keys (`AUTONOMOUS_AUTOMATION_GEMINI_KEY`, never touching reserved public-tool keys `GEMINI_API_KEY`, `GEMINI_API_KEY_2`, `GROQ_API_KEY`, `OPENROUTER_API_KEY`).
  - Commercial upgrade to OpenAI/ChatGPT requires **zero code changes**: set `AGENCY_PRIMARY_PROVIDER=openai`, `AUTONOMOUS_AUTOMATION_OPENAI_KEY=<key>`, and optional `AGENCY_OPENAI_MODEL=gpt-4.1-mini` (or `gpt-4o-mini`) in Cloudflare Workers environment variables.
- **Founder Unlimited Testing Mode (Preview):** Set `AGENCY_UNLIMITED_TESTING=true` (or add your Supabase user UUID to `AGENCY_UNLIMITED_WORKSPACE_IDS`) in Cloudflare Preview Runtime Variables to test freely without artificial daily caps while still seeing exact per-specialist token and USD telemetry.

---

## 3. V6 5-Phase Implementation Roadmap

1. **V6 Phase 1 (Completed):** True token estimation (`estimatePromptTokens`), Founder Unlimited Testing Mode with full ledger telemetry, 1-flip `AGENCY_PRIMARY_PROVIDER` OpenAI/Gemini switch, topical `selectRelevantSitePages()` prompt digest, and this V6 Postmortem & Architecture doc.
2. **V6 Phase 2:** Separate **Technical Site Audit** (with Circular SVG Health Score Ring + weighted 100-pt rubric) from **On-Page & Refresh** (Existing Articles & Pages Studio), eliminate fake `repairFields()` default diffs, and wire opt-in multi-agent deep page optimization.
3. **V6 Phase 3:** Live Web Research Engine (Reddit, Quora, Google Autocomplete) + dedicated **Web Research** usage row in `Token & API Usage` + fresh non-repeating keyword discovery.
4. **V6 Phase 4:** Category-structured Practitioner Knowledge Base (`on_page_seo`, `technical_seo`, `keyword_research`, `off_page_seo`, `content_writing`, `visual_design`) + rich default specialist system prompts + user-editable per-specialist instructions.
5. **V6 Phase 5:** Calm-monochrome visual elevation (less robotic card noise, refined typography/spacing) and full mobile/tablet/desktop scroll verification.

---

## 4. Ready-to-Paste Sprint 19 `FOUNDER_AI_CHANGELOG` Entry (`lib/founder-hub/data.ts`)

```ts
  {
    id: "log-sprint-19-ai-agency-v6-phase1-token-fix-provider-switch-postmortem",
    sprintNumber: 19,
    date: "2026-11-21",
    title: "AI Agency OS V6 Phase 1 — 4x Token Reservation Fix, Founder Unlimited Testing Mode, 1-Flip OpenAI Switch & V6 Postmortem Docs",
    category: "AI Employee Agency OS",
    founderRequestSummary:
      "Diagnose live Preview screenshots showing Stage 2 quota lockouts at 40% usage, identical/truncated proposed SEO text, duplicated audit/refresh views, and repeated keywords; document every mistake and V6 architectural law for all AI experts; prioritize output quality with zero-waste mechanical execution and a 1-flip Gemini-to-OpenAI provider switch.",
    aiStrategicBlueprint:
      "Fixed the 4x UTF-8 byte-as-token over-reservation bug in billing.server.ts, replaced 167-URL prompt dumps with topical selectRelevantSitePages() digests in prompt-compiler.ts, added Founder Unlimited Testing Mode (AGENCY_UNLIMITED_TESTING=true) with full real token/USD logging, added AGENCY_PRIMARY_PROVIDER=openai automatic routing, and published docs/AI_AGENCY_V6_ARCHITECTURE_AND_POSTMORTEM.md.",
    aiImplementationDetails: [
      "lib/ai-agency/billing.server.ts: Added estimatePromptTokens() (ceil(bytes/4)+128), isUnlimitedTestingEnabled() with full token_usage_ledger telemetry, and resolveDefaultAgencyModelId() supporting 1-flip AGENCY_PRIMARY_PROVIDER=openai.",
      "lib/ai-agency/prompt-compiler.ts: Added selectRelevantSitePages() to pass top-15 topically relevant URLs + inventory summary instead of 167 raw URLs.",
      "docs/AI_AGENCY_V6_ARCHITECTURE_AND_POSTMORTEM.md: Documented all 5 live Preview postmortem findings, Quality-First Zero-Waste token governance, provider-agnostic OpenAI switch, and the 5-phase V6 roadmap.",
      "tests/ai-tools/agency-commercial-foundation.test.ts: Added unit tests for estimatePromptTokens(), isUnlimitedTestingEnabled(), and selectRelevantSitePages().",
    ],
    filesTouched: [
      "lib/ai-agency/billing.server.ts",
      "lib/ai-agency/prompt-compiler.ts",
      "docs/AI_AGENCY_V6_ARCHITECTURE_AND_POSTMORTEM.md",
      "tests/ai-tools/agency-commercial-foundation.test.ts",
    ],
    commits: ["V6-Phase-1"],
    status: "Completed & Pushed to Preview",
  },
```
