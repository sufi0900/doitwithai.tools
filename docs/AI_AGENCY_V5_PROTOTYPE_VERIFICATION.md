# AI Employee Agency OS V5 — Phase 9 Prototype Verification & Release Gate

**Target Branch:** `codex/infographic-studio-redesign` (Cloudflare Workers Preview ONLY — never push or merge directly into `production-cloudflare` or `main`).

## 1. Completed V5 Implementation Commits (Phases 1–8)

| Phase | Scope | Commit |
| :--- | :--- | :--- |
| **Phase 1** | Core Runtime Unblock — Edge-safe `fetchPublic`, smart `verifiedReply`, partial-sitemap `topicDecision` | `6d755a48146de0256090b8f4fed1ddccf94c6c45` |
| **Phase 2** | Automatic Brand DNA, `classifySiteMaturity`, `classifyPageKind`, 6 overlap-checked low-KD keywords | `955345c6fb4f6454c47c4e64ce20dd80d9446ae5` |
| **Phase 3** | Strict 4-Step `GuidedOnboardingStudio`, Dashboard Lock Gate, live crawl stepper animations | `c33c43b2cbb17a7c45e9529d1fb3fa13211d9873` |
| **Phase 4** | Real-Time 5-Stage Supabase-persisting pipeline (`run-agent-step`) & `LivePipelineTracker` | `7e5ba260f5882e54b5dc8ce8ccbcb17b141f12ed` |
| **Phase 5** | Interactive Workbenches (`KeywordTopicsWorkbench`, `AiVisibilityWorkbench`, upgraded `PanelWorkspace`) | `eb11b19d518151043405b1803d9be5bc62f87b0f` |
| **Phase 6** | Dual-Track Existing Website Optimization Engine (Zero-LLM Media/Meta Audit + Two-Pane Page Optimizer) | `fc0566bc1967894122d188ee6ac12aba17cd133f` |
| **Phase 7** | Dual-Quota Commercial Metering (`existing_page_optimization`) & Overview `PriorityActionQueue` | `86d35e96968ab43f24c53092a8e6e85a456b666c` |
| **Phase 8** | Calm-Monochrome `16x16` Sidebar SVG Brand Icons, Live Count Pills & `CalmAgencyNodeCanvas` Live Sync | `f5cf7d1cc9e94017c7d0f1e8bf7353410c95b6ce` |

## 2. Manual Supabase Migration Checklist (Required Before Live Preview Test)

Apply this migration in Supabase SQL Editor if not already executed during Phase 7:
- `supabase/migrations/20261129_agency_dual_quota_optimization.sql` — adds `monthly_optimizations` column to `agency_entitlements`, updates `agency_asset_usage_asset_check` for `existing_page_optimization`, and updates the `agency_reserve_usage` RPC.

## 3. Automated Release Gate Commands (Run Locally / CI)

```bash
# 1. TypeScript zero-error gate
pnpm exec tsc --noEmit

# 2. Full Agency & Public-Tool Isolation Unit Test Suite
node --import tsx --test \
  tests/ai-tools/agency-commercial-foundation.test.ts \
  tests/ai-tools/multi-key-rotation.test.ts \
  tests/ai-tools/provider-fallback.test.ts \
  tests/ai-tools/backlink-verifier.test.ts \
  tests/ai-tools/broken-links.test.ts

# 3. Cloudflare Workers Preview Bundle Size Gate (< 64 MiB uncompressed upload)
pnpm build
pnpm cf:build
node scripts/check-agency-worker-size.mjs
```

## 4. End-to-End Preview Browser Walkthrough Checklist

1. **Strict API Key Isolation:** Confirm `diagnostics` shows `gemini: true` backed exclusively by `AUTONOMOUS_AUTOMATION_GEMINI_KEY` (zero reads of `GEMINI_API_KEY`, `GEMINI_API_KEY_2`, `GROQ_API_KEY`, or `OPENROUTER_API_KEY`).
2. **Guided Onboarding & Dashboard Lock Gate:** Register a fresh website → verify the 13-panel dashboard remains locked until **Approve & Launch** sets `approved_at`, Brand DNA + 6 low-KD keywords populate automatically, and optional custom fields never block launch.
3. **Live 5-Stage Production Pipeline:** Trigger **Run Next Queued Topic Live** → verify Stages 1–5 execute sequentially, Written vs. Remaining counters update, `CalmAgencyNodeCanvas` pulses only the active specialist node, and draft + QA scorecard + social kit persist to Supabase.
4. **Dual-Track Established Site Optimization:** Open **Technical Site Audit** → run **Run Live Technical Site Scan Now** (`$0.00` LLM cost) → verify `Crawl & Index`, `Meta Health`, and `Media & Alt-Text` tabs → open **On-Page & Refresh** and trigger **AI Optimize Page** on a `Needs Fix` URL.
5. **Calm-Monochrome UI & Sidebar Craft:** Verify crisp `16x16` SVG icons on all 13 core panels, official brand SVGs on Pinterest/LinkedIn/Facebook/TikTok & Reels, live `queued`/`ready` count pills, and responsive fullscreen Escape handling in `CalmAgencyNodeCanvas`.

## 5. Ready-to-Add Sprint 18 `FOUNDER_AI_CHANGELOG` Entry (`lib/founder-hub/data.ts`)

Prepend this object to `FOUNDER_AI_CHANGELOG` in `lib/founder-hub/data.ts` (kept out of remote full-file overwrite to preserve Sprints 1–17 verbatim):

```ts
  {
    id: "log-sprint-18-ai-agency-v5-phases-1-to-9-prototype",
    sprintNumber: 18,
    date: "2026-11-21",
    title: "24/7 AI Digital Agency OS V5 — Full Phases 1–9 Real-Time Prototype, Dual-Track SEO Optimization & Calm-Monochrome UI",
    category: "AI Employee Agency OS",
    founderRequestSummary:
      "Execute the V5 Unified Phased Master Plan sequentially on codex/infographic-studio-redesign to unblock live crawling on Cloudflare Workers, automate Brand DNA & 6 low-KD keywords, enforce a strict 4-step Guided Onboarding Dashboard Lock Gate, wire a real-time 5-stage Supabase-persisting pipeline, build interactive specialist workbenches and dual-track existing-site optimization, enforce dual-quota metering, polish calm-monochrome 16x16 SVG brand icons and live node telemetry, and harden the automated test suite.",
    aiStrategicBlueprint:
      "Delivered Phases 1–9 incrementally with zero public-tool API key cross-contamination (100% AUTONOMOUS_AUTOMATION_GEMINI_KEY), zero explicit any types, zero retired gemini-2.0-flash references, and full edge-runtime compatibility for Cloudflare Workers Preview (< 64 MiB bundle gate).",
    aiImplementationDetails: [
      "Phase 1 (6d755a4): Edge-safe fetchPublic(), smart verifiedReply() digit/heading parser, and partial-sitemap topicDecision().",
      "Phase 2 (955345c): Automatic Brand DNA synthesis, classifySiteMaturity(), classifyPageKind(), and 6 overlap-checked low-KD starter keywords.",
      "Phase 3 (c33c43b): Strict 4-Step GuidedOnboardingStudio, Dashboard Lock Gate until approved_at, and live crawl progress animations.",
      "Phase 4 (7e5ba26): 5-stage Supabase-persisting run-agent-step pipeline & LivePipelineTracker with Written vs. Remaining counters.",
      "Phase 5 (eb11b19): KeywordTopicsWorkbench, AiVisibilityWorkbench, upgraded PanelWorkspace social generators, Article Studio handoff, and context-aware Copilot.",
      "Phase 6 (fc0566b): Zero-LLM Technical Site Audit (robots, canonicals, meta health, image alt-text/KB size) + two-pane On-Page & Refresh AI page optimizer.",
      "Phase 7 (86d35e9): Dual-quota metering migration (existing_page_optimization), resolveMeteredAssetKind(), Overview PriorityActionQueue, and CommercialUsage dual meters.",
      "Phase 8 (f5cf7d1): Crisp 16x16 SidebarNavIcons (13 core panels + Pinterest/LinkedIn/Facebook/TikTok brand SVGs), live count pills, and CalmAgencyNodeCanvas live execution sync.",
      "Phase 9: Expanded 11-test commercial foundation suite (including static source isolation audit) and Cloudflare < 64 MiB release verification checklist.",
    ],
    filesTouched: [
      "features/backlink-verifier/fetch.server.ts",
      "lib/ai-agency/prompt-compiler.ts",
      "lib/ai-employee-agency/site-knowledge.ts",
      "lib/ai-employee-agency/onboarding.server.ts",
      "lib/ai-agency/refresh.server.ts",
      "lib/ai-agency/billing.server.ts",
      "app/api/ai-employee-agency/run-agent-step/route.ts",
      "features/ai-employee-agency/GuidedOnboardingStudio.tsx",
      "features/ai-employee-agency/LivePipelineTracker.tsx",
      "features/ai-employee-agency/KeywordTopicsWorkbench.tsx",
      "features/ai-employee-agency/AiVisibilityWorkbench.tsx",
      "features/ai-employee-agency/RefreshWorkbench.tsx",
      "features/ai-employee-agency/PriorityActionQueue.tsx",
      "features/ai-employee-agency/SidebarNavIcons.tsx",
      "features/ai-employee-agency/CalmAgencyNodeCanvas.tsx",
      "features/ai-employee-agency/AgencyWorkspaceOverview.tsx",
      "supabase/migrations/20261129_agency_dual_quota_optimization.sql",
      "tests/ai-tools/agency-commercial-foundation.test.ts",
      "docs/AI_AGENCY_V5_PROTOTYPE_VERIFICATION.md",
    ],
    commits: ["6d755a4", "955345c", "c33c43b", "7e5ba26", "eb11b19", "fc0566b", "86d35e9", "f5cf7d1"],
    status: "Completed & Ready for Preview Verification",
  },
```
