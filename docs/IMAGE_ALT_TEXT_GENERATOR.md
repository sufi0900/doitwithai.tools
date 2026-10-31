# Image Alt Text Generator

## Scope and design

The eighth launch tool lives at `/tools/image-alt-text-generator`. It belongs to AI SEO and Content Writing. Its central registry entry drives directory, category, sitemap, and related-tool discovery. The Studio registry snapshot is synchronized. Existing article content is unchanged.

The design follows the existing dark hero, blue/cyan accents, white or dark rounded workspace, and compact tool-card actions. Its workflow starts with image purpose, followed by source/context, alternatives, editing, and human review.

## Inputs and image handling

Users may upload one PNG, JPEG, or WebP file, or describe the image in at least 20 characters. Optional fields provide page context, important visible text or verified values, and existing alt text. Functional images require a link destination or button action.

Original files must be below 10 MB and 24 megapixels. The browser re-encodes a raster copy with a longest side of at most 1600 pixels. The prepared image must be at most 1.5 MB. This strips original file metadata and can reduce fine detail. Small labels should be transcribed in the notes. Animated and SVG inputs are not supported.

Selecting a file makes no AI request. Generate sends the prepared image and brief through the server to the AI provider. The server accepts embedded raster data only, checks base64 encoding, size, and format signatures, and never fetches remote user URLs. Format checks do not replace a complete image decoder; provider failures return explicit errors.

Drafts and image previews stay in component memory, without local storage or CMS writes. Refresh clears them. No image or brief is logged by this handler. Provider requests set `store:false`; this setting does not promise zero provider retention.

## Output and review

Three distinct editable alternatives include specific explanations and review notes. Each alternative retains its edits while users compare options. Submitted context and existing alt text remain a snapshot, so form changes cannot silently alter the original comparison.

Complex-image output includes a separate editable extended description for nearby page text. Users must implement the connection to that description on their own page. Decorative mode provides `alt=""` locally and sends no AI request. It warns users to inspect the entire image/link/button context.

Users can copy plain text, copy an escaped double-quoted HTML alt attribute, or download a text draft. The preview never renders user text as HTML. A local checklist records the user's review and resets after edits or option changes.

Local checks count words and characters, flag certain repeated words, redundant openings, exact caption duplication, possible filenames, and a small promotional-phrase list. A length cue above 180 characters is an editorial prompt, not a standard or hard limit. These checks do not inspect pixels, verify facts, certify accessibility, or score SEO.

## Configuration and runtime

Required variables: `OPENAI_API_KEY`, `OPENAI_ALT_TEXT_MODEL`, `UPSTASH_REDIS_REST_URL`, and `UPSTASH_REDIS_REST_TOKEN`. The selected model must support Responses image input and structured output. No model is guessed. Description-only requests also use this explicitly configured model.

Requests use the existing shared rate limiter with the `alt-text` namespace. Production fails closed without Redis. Streamed JSON is bounded to 2,050,000 bytes, below the project's serverless body ceiling. Provider output is capped at 2400 tokens, with a 45-second timeout, no automatic retries, and a 60-second route duration. Browser requests abort after 65 seconds. Invalid output and failed requests preserve existing edited results.

## Educational content and sources

The tool page includes purpose-specific examples, workflow guidance, implementation advice, local-check limitations, FAQs, and primary references:

- https://www.w3.org/WAI/tutorials/images/decision-tree/
- https://www.w3.org/WAI/tutorials/images/functional/
- https://www.w3.org/WAI/tutorials/images/decorative/
- https://www.w3.org/WAI/tutorials/images/complex/
- https://developers.google.com/search/docs/appearance/google-images
- https://developers.openai.com/api/docs/guides/images-vision

The existing `/ai-seo/ai-alt-text-generators` article is linked with a neutral label. Its unsupported traffic statistics were not reused. A future article audit should verify those claims and add a natural link back to this tool. A separate practical guide could cover selecting image purpose and reviewing AI-generated alt text using worked examples. It is not created or published in this phase.

## Validation

Contract and API tests cover evidence requirements, functional and decorative modes, image boundaries, unsafe remote URLs, HTML escaping, complex output, duplicate alternatives, mocked multimodal requests, provider failures, and missing model configuration. Browser checks cover upload preparation, editing retention, copy output, decorative mode without API calls, functional validation, chart descriptions, error preservation, mobile overflow, and dark mode. Validation passed: 48 AI-tool tests, 11 foundation tests, type checking, focused lint, the production build, ten route checks, five redirects, and the full browser smoke suite. AI provider responses are mocked. No live-model accuracy or billing claim is made.

## Next tools

Keyword Clustering Tool and Internal Link Suggestion Tool remain. Create one tool per implementation phase before beginning the separate content audit and promotion work.
