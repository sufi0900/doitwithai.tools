# Digital PR and Linkable Asset Planner

Research and implementation date: October 27, 2026.
Route: `/tools/digital-pr-linkable-asset-planner`.

## Audience and workflow

The intended user is a small marketing team or creator deciding what useful reference to build before outreach. The problem is translating a broad topic into a specific reader task, an evidence plan, and assigned production work. A finished pitch without a credible asset is too early in that workflow.

The initial form asks for topic, audience, reader task, and an evidence starting point. Evidence notes become required only when public data, owned data, or expert access is selected. Optional controls cover format, geography, and owner. There is no dataset upload, contact database, or expensive provider prerequisite.

## Research inspected

- [Ahrefs linkable asset types](https://ahrefs.com/blog/linkable-assets/), updated November 5, 2020, retrieved October 27, 2026. The vendor's own examples cover tools, visual formats, research, and guides. Its workflow includes promotion. This supports offering several production formats and a distribution stage. We did not adopt its example performance numbers or ROI claims.
- [BuzzStream international digital PR discussion](https://www.buzzstream.com/blog/international-pr-podcast/), published June 3, 2026, retrieved October 27, 2026. Its first-party practitioner discussion emphasizes accurate analysis, transparent methodology, and clearly stated sources across markets. This supports an explicit evidence protocol and optional market scope.
- [BuzzStream creative campaign discussion](https://www.buzzstream.com/blog/creative-digital-pr-podcast/), published April 9, 2026, retrieved October 27, 2026. Its practitioner conversation links creative campaigns with measurement. This informed a separate baseline and outcome section rather than invented backlink predictions.
- [Microsoft WordprocessingML structure](https://learn.microsoft.com/en-us/office/open-xml/word/structure-of-a-wordprocessingml-document), retrieved October 27, 2026. The document/body/paragraph/run/text structure and package parts informed the native DOCX export. This is technical documentation rather than evidence of marketing demand.

The Muck Rack media-pitching guide appeared in search, but opening its URL failed. No recommendation relies on having reviewed that page. Vendor discussions are evidence of existing workflows, not independent proof of market size or success.

## Keyword intent

Relevant query families are digital PR campaign planner, digital PR strategy template, linkable asset ideas, linkable asset planner, and digital PR campaign brief. These suggest planning and reusable-document intent. Broad digital PR terms may instead seek agencies, services, training, or campaign examples. The page describes its concrete planner scope and does not imply those other services.

No verified search-volume or keyword-difficulty dataset was available. No numeric demand, ranking forecasts, or competitor conversion results are claimed.

## Product decisions

- Use transparent deterministic planning rules, not an AI provider. The interface explicitly says this. It assembles a useful editable brief without hallucinated evidence or credentials.
- Public or owned data recommends a research report. Expert access or no evidence recommends a practical guide. Users can override with report, guide, calculator/worksheet, or visual explainer. The reason is visible. These are design rules, not a measured suitability score.
- Build one format-specific plan with seven editable sections. It includes the reader question, evidence method, outline, publication package, distribution work, and measurement. It does not pretend to build the actual calculator, conduct a survey, or identify contacts.
- With no evidence, retain an explicit collection warning. With other evidence choices, mark access as self-reported. Hidden notes from a previous choice are excluded when the user switches to no evidence.
- Export the current edited text, rather than silently rebuilding from inputs. Changed inputs trigger a clear rebuild notice. Rebuild is explicit and replaces the plan.
- Actions have editable owners and self-reported status. Markdown and DOCX contain the brief and actions. CSV contains the action list with campaign, phase, task, owner, and status columns.
- No source URL fetching occurs, so blocked pages, extraction timeouts, provider quotas, and partial extraction do not apply. No feature-specific API request or external credential is needed. Build and export exceptions produce understandable messages. Cancellation preserves the previous plan.
- Use the existing overlay, brand, hero, FAQ, catalog, and dynamic sitemap architecture. DOCX generation is loaded only on download. No new dependency was added.
- Use literal React text fields without rendering supplied HTML. Markdown escapes user markup. CSV quotes fields, preserves multiline data, includes a UTF-8 BOM, and prefixes formula-like spreadsheet values. DOCX escapes XML and strips illegal XML control characters.

## Export structure

DOCX is an actual OOXML ZIP with content types, package relationships, document relationships, styles, and WordprocessingML. It uses Letter pages, Arial 11 point body text, black title/headings, and editable paragraphs. The existing validated stored-ZIP writer is reused. It is not renamed HTML or plain text.

Markdown uses `.md` and includes the current brief and action checklist. CSV uses `.csv` and a real quoted record structure. No download contains fabricated coverage results.

## Validation

- All 528 feature tests passed, including 12 planner checks. All 11 foundation/catalog checks passed, for 539 tests overall.
- Explicit TypeScript checking passed. Lint passed with existing unrelated repository warnings. The final production build passed and prerendered the new route among 106 static pages. Existing cache integrations logged missing local Redis configuration; the planner does not depend on them.
- Production-browser checks passed for required-field errors and focus, conditional evidence errors, all four format choices, all evidence modes, keyboard submission and checkbox use, loading dialog, Escape cancellation, result focus, edit preservation, explicit rebuilding, download failure, deleted export title, catalog search, and category discovery.
- Desktop and 390-pixel mobile screenshots were visually reviewed in light and dark mode. No horizontal mobile overflow or browser runtime errors occurred. The feature made no AI-tool API requests.
- Actual browser downloads produced DOCX, Markdown, and CSV files. DOCX ZIP CRCs and every XML part parsed; python-docx opened 70 paragraphs. Markdown preserved edited text and completed actions. Python csv parsed seven actions with the edited owner and self-reported status.
- The actual browser-downloaded DOCX rendered to three Letter pages. Every page was visually inspected for readable text, margins, heading placement, and clipping. No layout defects were observed.
- Feature checks: `tests/ai-tools/digital-pr.test.ts`. Production-browser checks: `scripts/digital-pr-smoke.cjs`.
- Functional scope is deterministic browser-based planning. No live dataset analysis, source verification, journalist discovery, AI generation, sending, or campaign outcome prediction is implemented or claimed. No outreach was sent.
- No implementation blocker remains. Completion requires the separate durable queue update pointing to the implementation commit.
