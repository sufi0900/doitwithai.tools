# Writer quality implementation checkpoint

Base: eaf5b7683f049ffa4c8bb832d4d292c24d2e16d8 (codex/infographic-studio-redesign).
Date: 2026-11-27. Preserve the latest separate social/email studios and article library.

## Phase 1 — draft integrity and editorial instructions

Implemented:
- Preserve Markdown through automatic polish; raw punctuation splitting previously deleted text before dotted URLs. Compatibility helpers retain original text.
- Route the readability polish action through the existing AI revision preview and explicit Apply/Discard flow. Long article revisions fail with a selection instruction rather than silently truncating the article.
- Validate requested subsection headings and explanations instead of splitting/relabeling paragraphs or synthesizing filler.
- Remove automatic attribution of statistics to unrelated candidate URLs, appended resource promotions, and redundant generated takeaways.
- Remove mandatory per-section links, exact opening lengths, question-heading ratios and keyword-subject instructions from generation prompts.
- Only weave matched internal-link opportunities; skip unrelated destinations.
- Do not assume doitwithai.tools when the user supplies no website, in either research entry point.
- Preserve skipped research status when planning begins; handle HTTP research failures and stop manufacturing reference descriptions.

Validation: 37 writer tests passed, including new URL/code/decimal preservation, missing or swapped subsection rejection, unsupported citation non-insertion and unrelated internal-link regressions. TypeScript checking and whitespace checks recorded in the delivery summary.

Limitations: no live paid generation, browser integration or deployment verification in this phase. Existing saved corrupted drafts cannot be reconstructed automatically; regenerate affected sections or restore an earlier version. Research remains Wikipedia/abstract/catalog based until phase 2. Candidate links are not claim verification; readiness remains a structural heuristic. Existing auto-created brand assignments on saved projects are not erased.

## Next phases (not implemented)

2. Real research: configurable search provider, geographic/language query context, relevant competitor page extraction, primary-source passages, evidence mapping, explicit source failures. Never claim Google SERP/PAA/AI Overview access unless actually returned by the provider. Preserve bounded fetching and SSRF protections. Provider credentials/configuration must be verified before claiming live research.
3. Editorial quality: source-backed section briefs, article-wide repetition review, editable brand profiles from supplied examples, no brand assumptions for keyword-only input. Evaluate multiple unrelated topics, not a hardcoded AI SEO fixture.
4. Editor: article-first layout, one collapsible inspector, contextual revisions and actionable quality issues instead of a dominant perfect-score badge.
5. Shared agency pipeline: reuse evidence and revision contracts across generation entry points and derivative visuals/social; preserve the new social/email studio architecture.

Before each phase, re-read branch HEAD and reconcile concurrent changes. No dependency additions in phase 1. Do not treat source publication as proof of deployment or output quality.
