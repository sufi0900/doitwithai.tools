# Keyword research prompt guide

Date: October 25, 2026.
Route: `/prompts/keyword-research-prompts`.

## Editorial delivery

A complete frontend article contains exactly 100 original prompts across ten workflows.
Workflows cover foundations, discovery, intent, competitors, architecture, metrics, questions, YouTube, business contexts, and agency delivery.
Each workflow has ten prompts, with stable numbers and fragment identifiers.
Each prompt states the required inputs, specific task, expected output, and evidence boundaries.
The collection contains approximately 13,200 words of prompt text, plus surrounding guidance.
Length is descriptive, not an SEO ranking target.

Shared brief fields customize business context, audience, and market.
Individual prompts accept their own source material, with a 12,000-character limit per prompt.
The optional example brief concerns a local coffee workshop and does not establish demand.
Search and category filters help readers choose one next task instead of running every prompt.
Workflow links reset filters before navigation. Direct prompt fragments reveal their associated disclosure.
Prompt cards offer Copy, a bounded ChatGPT prefill link, manual-copy fallback, and fragment links.
Oversized prompts retain copying when a prefill link exceeds the existing URL limit.
A download contains all prompts with the current brief and source inputs.
Inputs remain in the active page session. External handoff explicitly explains that the destination URL includes prompt content.

## Evidence and accuracy

Source research included:

- https://doitwithai.tools/ai-seo/chatgpt-keyword-research
- https://doitwithai.tools/ai-seo/ai-vs-traditional-keyword-research
- https://ahrefs.com/blog/keyword-clustering/
- https://help.ahrefs.com/en/articles/72265-what-does-kd-stand-for-in-keywords-explorer
- https://www.semrush.com/blog/youtube-keyword-research/
- https://support.google.com/youtube/answer/9962575?hl=en
- https://developers.google.com/google-ads/api/docs/keyword-planning/generate-historical-metrics

The source review informed workflow coverage. The prompts are original authored instructions, rather than copied competitor lists.
No quantitative keyword demand or search-volume study was available or invented.
Difficulty interpretation requires a named provider’s supplied metric and definition.
Competitor page text supports inferred targeting, while reported rankings and traffic require identified exports.
PAA analysis requires supplied observations. Suggested questions are not claimed as observed Google results.
Related vocabulary is not prescribed as an LSI ranking checklist or density requirement.
Video workflows distinguish YouTube observations from Google search volume.
No prompt promises rankings, traffic, citations, authority, or complete factual verification.
All prompts have not been benchmarked against every assistant. The article states this limitation.

## Design and discovery

The article uses readable body text, expandable prompt cards, a ten-workflow index, and responsive controls.
A shared brief appears before the prompt list, with return links at the bottom.
The author portrait uses an optimized copy of the supplied image at `/prompts/sufian-mustafa-portrait.webp`.
The page includes an example, source notes, six FAQs, related reading, and contextual promotional cards for existing tools.
The existing published prompt registry supplies listing cards, static parameters, canonical metadata, and sitemap discovery.
Only the new completed guide is marked ready. Existing unfinished placeholders remain excluded.
The keyword research and clustering tool resources link back to the article without changing the guide registry’s path contract.

Featured asset: `public/prompts/keyword-research-prompts-hero.webp`.
Final dimensions: 1600 × 900. The image is optimized WebP.
Created with the built-in image-generation tool, followed by a targeted edit removing promotional wording from the mug.
The visual brief requested a navy and brand-blue editorial cover with the headline “100 Keyword Research Prompts”.
It included a desktop mockup with Discover, Group, Review, and Copy prompt controls, without people or invented numeric metrics.
Generated source images were visually inspected before integration.

## Verification

Completed checks:

- 408 AI-tool feature and regression tests passed.
- 11 catalogue and foundation tests passed.
- TypeScript completed without errors.
- Targeted lint reported no warnings or errors.
- The production build completed successfully.
- Rendered HTML contains one H1, 100 prompt disclosures, ten workflow links, and valid local fragment targets.
- Canonical metadata, Article schema, publication date, author, cover, and six FAQ entries were checked.
- The prompt listing and sitemap include the new guide. Research and clustering tools link back to it.
- Git whitespace checks passed.

Existing unrelated image, hook, metadata, and local Redis configuration warnings remain in the production build output.
React review covered effect cleanup, bounded inputs, server rendering, control labels, dark mode classes, and responsive layout constraints.
The managed browser preview was unavailable because its startup flags are incompatible with this Next.js version.
Responsive behavior was reviewed in code, without a visual browser pass.
Browser interactions, responsive visuals, clipboard, downloads, and actual ChatGPT handoff remain unverified.
No production deployment, private login, third-party message, paid subscription, or credential change was performed.

## Author and contextual link polish

The supplied portrait replaces the previous photo in this article.
The 384-pixel WebP portrait is 14 KB, compared with the 5.5 MB original upload.
Fixed width, height, and flex sizing prevent the portrait from stretching within the author row.
Each workflow destination appears once, with the tool name as its visible label.
The full article includes at most three contextual links to any individual tool.
Validation includes the prompt tests, TypeScript, targeted lint, and production compilation.
Browser visual and interaction checks remain unavailable in this environment.
The continuation check passed all 13 focused prompt tests, TypeScript, targeted lint, and production compilation.
The full continuation build stopped during page-data collection because local Sanity configuration lacks `projectId`.
