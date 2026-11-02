# Personalized Outreach Email Builder

Research and implementation date: October 27, 2026. Route: `/tools/outreach-email-builder`.

## User need and independent research

Outreach writers need a specific reason to contact a publisher, a reader benefit, and wording they can review. Generic personalization and unsupported familiarity weaken the relevance of a request.

Primary workflow references:

- BuzzStream describes purpose, early personalization, value, and a clear request: https://www.buzzstream.com/blog/email-outreach-templates/
- Hunter discusses matching the message to a specific article and explaining why a resource fits its audience: https://hunter.io/blog/link-building-outreach-guide/
- Hunter documents per-lead editing and preview before sending: https://help.hunter.io/en/articles/8488768-email-sequence-settings-preview-in-hunter
- Microsoft documents the required WordprocessingML document structure and package parts: https://learn.microsoft.com/en-us/office/open-xml/word/structure-of-a-wordprocessingml-document

Vendor performance statistics and outreach probabilities are not adopted. Vendor-specific sending, prospect databases, tracking, and subscriptions are outside this tool.

Keyword intent: personalized outreach email builder, link building outreach email, resource page outreach template, broken link outreach email, and unlinked mention outreach. No verified keyword-volume dataset was available. No search volume or ranking forecasts are claimed.

## Product strategy and scope

The tool is a deterministic guided draft builder. It does not claim to be an AI generator. It requires a publisher URL, a specific reference, a resource URL, a reader benefit, and sender name. Resource suggestions are the default, with optional broken-link and unlinked-brand-mention purposes.

Conditional inputs make the current purpose clear. Broken-link requests require an existing destination and phrase availability conditionally. Brand-mention requests require the actual brand name. Optional recipient/page names, tone, and one follow-up remain collapsed initially.

Drafts include three subject options and an editable subject/message. No praise, earlier relationship, independent verification, contact address, metric, or success claim is invented. User facts remain user-supplied and must be checked.

Input changes do not silently overwrite an edited draft. A change notice invites an explicit rebuild. Exports and copying use the edited draft, including any currently drafted follow-up. A follow-up assumes the first message has already been sent.

## Processing and privacy

Draft assembly and export run entirely in the browser. This feature has no API handler, provider key, page fetching, mailbox connection, sending, recipient lookup, open tracking, or follow-up scheduling.

The site's existing recent-URL helper may remember URL suggestions in browser storage. This feature does not persist message bodies or upload them to an AI provider. Normal site analytics and account features remain separate.

The tool offers no legal compliance assessment, deliverability score, response probability, or backlink guarantee.

## Download implementation

TXT contains the current subject and edited message. Optional follow-up text is separately labeled and included only when non-empty.

DOCX is a native OOXML ZIP package with content types, relationships, document content, and styles. It is not renamed HTML. The dependency-free exporter uses uncompressed ZIP entries with CRC32 checksums, UTF-8 names, and a central directory.

The document uses Letter pages, editable paragraphs, a black title and headings, readable Arial text, and XML escaping. User text is not interpreted as document markup. There are no macros, remote document relationships, or embedded executable content.

Browser export tests must save and parse the actual files. The document renderer must produce page images for visual review before completion.

## Validation

Validation results are recorded after the feature, foundation, type, lint, build, browser, and document-render checks complete.

### Verified on October 27, 2026

- All 516 feature tests and 11 catalog/foundation checks passed.
- Type checking, lint, and the production build passed. Existing unrelated repository warnings remain.
- Production-browser checks passed for required fields, all three outreach purposes, optional follow-up, draft editing without focus jumps, visible loading, cancellation preserving the previous draft, result focus, catalog discovery, and mobile light/dark layouts.
- Clipboard success and permission-failure handling were checked with a controlled browser clipboard API.
- Actual TXT and DOCX downloads preserved the edited subject and message. Python validated ZIP checksums, parsed every XML part, and opened the document with python-docx.
- The final DOCX rendered successfully with the packaged LibreOffice workflow. Both Letter pages were inspected. The optional follow-up starts on its own page.
- The final browser-downloaded DOCX was byte-identical to the rendered and visually reviewed file.
- Browser runtime errors: none. Tested horizontal mobile overflow: none. Draft API requests: zero.

The QA example uses clearly fictional names and example domains. The tool does not verify source facts, send email, or predict outreach results.

Reproduce feature checks with `node --import tsx --test tests/ai-tools/*.test.ts` and foundation checks with `node --test tests/tool-catalog.test.cjs tests/tools-foundation.test.mjs`. Build with the repository's public CMS environment configuration. After building, run `PUPPETEER_CACHE_DIR=<browser-cache> node scripts/outreach-email-smoke.cjs`. DOCX browser validation requires python-docx; visual review additionally uses the packaged document renderer.
