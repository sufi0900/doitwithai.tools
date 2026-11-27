# Tool Landing Hero V2 Contract (Ahrefs-Style Dedicated Tool Pages)

**Branch:** `codex/infographic-studio-redesign`  
**Status:** Phase 1 complete (`d9f6118`); Phase 2 pilot script ready.

## Design Contract
1. **Matte Charcoal Hero (`#14171D`)**: No navy gradients, no `bg-clip-text` gradient headlines, no glowing blur orbs (`ToolHeroBackground` is now a no-op).
2. **Minimal Top Row (Option A)**:
   - Left: Plain breadcrumb (`Tools / <Category> /`).
   - Right: `<ToolUtilityMenu>` (`Open in Do It AI ↗` + compact `Embed / PC App ▾` dropdown). Automatically hidden inside `?embed=1` and Website Builder transferred sites.
3. **Single-String Solid White `<h1>`**: Passed as a plain `title` prop to `<ToolLandingHero>` to permanently eliminate JSX multiline `<span>` missing-space bugs (e.g., `SEOAnalyzer`).
4. **Live Tool Workspace Above the Fold**: Tool client components render directly inside `<ToolLandingHero>` in a crisp white elevated card overlapping the `#14171D` → `#FFFFFF` fold. No `Use Tool Now` scroll button, no eyebrow badge, no 3 feature pills, no right-side summary box.
5. **Bottom Static SEO Content Preserved**: Existing methodology sections, `ToolFaq`, `ToolResources`, `metadata`, and JSON-LD scripts remain untouched during hero migration.

## Execution Commands (Phase 2 Pilot & Phase 3 Rollout)

```bash
# 1. Audit all missing-space H1s across /app/tools/*
node scripts/migrate-tool-heroes.mjs --audit

# 2. Preview Phase 2 Pilot (3 archetypes) without writing files
node scripts/migrate-tool-heroes.mjs --pilot --dry-run

# 3. Apply Phase 2 Pilot (on-page-ai-seo-analyzer, article-outline-generator, blog-section-infographic-generator)
node scripts/migrate-tool-heroes.mjs --pilot
pnpm exec tsc --noEmit

# 4. After visual QA on the 3 pilots, roll out across all remaining tool pages (Phase 3)
node scripts/migrate-tool-heroes.mjs --all --dry-run
node scripts/migrate-tool-heroes.mjs --all
pnpm exec tsc --noEmit
```
