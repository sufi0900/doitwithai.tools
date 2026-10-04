# Keyword clustering upgrade plan

Reviewed 4 October 2026. Scope: improve the existing ninth tool, preserving `/tools/keyword-clustering-tool` and the established visual identity.

## Research findings

Keyword Insights describes clustering from live, country-specific ranking URLs, with ranking metrics and adjustable URL overlap. Those features need real search-result data. Its product claims are not independent quality benchmarks.

Source: https://www.keywordinsights.ai/features/keyword-clustering/

Google's people-first guidance asks whether content serves an intended audience, helps people accomplish a goal, and adds meaningful value. A keyword group alone does not answer these questions.

Source: https://developers.google.com/search/docs/fundamentals/creating-helpful-content

## Product direction

Build a small, careful content-planning workspace. Its value is editable keyword coverage, explicit page decisions, and a portable record of human research. Do not claim market exclusivity or superiority from this review.

| Capability                                    | Decision  | Reason                                                                                           |
| --------------------------------------------- | --------- | ------------------------------------------------------------------------------------------------ |
| Semantic suggestions                          | Keep      | Useful starting point with a clearly stated evidence limit                                       |
| Editable groups and uncertain-term queue      | Keep      | Avoid forcing every phrase into a publication plan                                               |
| Portable projects and browser saves           | Implement | Prevent manual planning work being lost on refresh                                               |
| Page mapping and create/update/hold decisions | Implement | Connect research with practical editorial work                                                   |
| Human review checklist                        | Implement | Record task, real-result, and existing-page review                                               |
| Search and review filters                     | Implement | Navigate larger drafts without hiding or deleting terms                                          |
| Shared-URL warning                            | Implement | Ask whether groups belong together, without diagnosing ranking conflicts                         |
| Invented confidence or SEO scores             | Reject    | No data supports those measurements                                                              |
| Live ranking-based clustering                 | Later     | Requires a provider, location settings, data attribution, cost limits, and a separate evaluation |

## Implemented workflow

1. Paste or import supplied keywords and review duplicate cleanup.
2. Generate tentative groups with exact keyword coverage validation.
3. Refine membership, representative terms, intent, and content focus.
4. Choose create, update, or hold. Record a reference URL and research notes.
5. Record human checks for reader task, actual results, and existing coverage.
6. Merging retains source research notes. Excessive combined notes block the merge without data loss.
7. Changes to the brief, page decision, URL, research notes, or membership reset recorded checks.
8. Filter groups by review progress or search keyword text.
9. Save manually in the browser, or download a validated project JSON file.
10. Restore later without another AI request. Invalid imports preserve the open workspace.
11. Export decisions and research notes alongside keywords in CSV and Markdown.

Review completion records user declarations. It does not validate research or certify content quality. URL references are never fetched. Saving browser data is explicit, not automatic. Saved files remain untrusted and are parsed into bounded schemas before use.

## Next stages

- Evaluate live AI grouping against human-reviewed fixtures across informational, commercial, ambiguous, multilingual, and mixed-format lists. Track missing terms, inappropriate merges, and human correction effort.
- Consider importing user-supplied ranking URL samples before purchasing a SERP integration. Require keyword, country, language, collection date, and source provenance.
- If a live provider is added, preserve semantic and ranking-based modes as distinct methods. Show data freshness, requested location, and observed URL overlap.
- Add server-side durable projects only after defining accounts, ownership, retention, and costs. Browser saves intentionally stay local.
- Consider user-supplied volume or difficulty columns only with source attribution. Keep provider definitions separate; never manufacture missing values.

## Launch and educational content

Update the tool page with project workflows, evidence limits, and page-decision examples. Keep executable tools under `/tools`. A future `/ai-seo/` tutorial should show one real reviewed list, corrections, an existing-page decision, and an outline handoff.

A short video can demonstrate a mixed-task group being split, researched, saved, and restored. Pinterest assets can show a concise review checklist. These are future promotion tasks, not published assets in this phase.

## Acceptance checks

- Every source keyword appears exactly once before and after edits or restore.
- Imported projects reject invalid versions, invalid URLs, oversized files, and changed coverage.
- No AI request is made by project saving or restoring.
- Changed group meaning or membership clears recorded review checks.
- Exports include page decisions and notes; CSV formula safeguards remain intact.
- Frontend type check, focused lint, production build, browser workflows, and mobile/dark layouts pass.
- Only the feature branch is updated. No production promotion or CMS publication.
