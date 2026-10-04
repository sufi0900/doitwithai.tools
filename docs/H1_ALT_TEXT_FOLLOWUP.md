# H1 wording and uploaded alt text follow-up

## H1 wording

The primary keyword identifies topic and intent. It is not mandatory literal text for every alternative.
Prompts now explicitly vary syntax, singular or plural forms, and supported terminology.
Named tools such as ChatGPT require support in the brief. They are not universal replacements for AI.
The editing panel explains that natural variants are acceptable without adding missing keyword words.

Reference: https://developers.google.com/search/docs/fundamentals/seo-starter-guide
Google explains that language matching can understand relevant queries without their exact wording.

## Alt text source modes

The UI starts in uploaded-image mode. An image is required before generation in this mode.
Written examples switch explicitly to description-only draft mode. This mode cannot verify visible image details.
Description-only API requests remain compatible with existing callers.
Image uploads switch back to image mode automatically. Removing an image does not silently replace it with written notes.
Decorative images retain their empty-alt guidance without an AI request.

Reference: https://www.w3.org/WAI/tutorials/images/
The image's purpose and surrounding context determine the appropriate text alternative.

## Reported error and recovery

The screenshot reports generic output validation failure. It does not identify the failing field or establish an API-key problem.
The existing catch covers malformed contracts, duplicate alternatives, incorrect extended descriptions, and other unexpected failures.

Provider-facing schemas now constrain extendedDescription by image purpose and use compact decoder guidance.
For informative or functional images, this field must be an empty string. Complex images require a supported extended description.
Prompts explicitly require every field, valid lengths, and distinct wording without invented visual facts.

Only a received result that fails local validation gets one repair attempt.
The repair retains the original image and brief. It shares the original 45-second time budget.
Quota, authentication, safety, transport, and provider failures do not trigger this repair.
Repeated invalid output returns ALT_OUTPUT_INVALID rather than the previous undifferentiated error.
Safe diagnostics record the output-contract failure, input source, and model without image data or generated content.

## Validation scope

Tests cover natural H1 variants, required uploads, purpose-specific output schemas, and one bounded image-preserving repair.
Live Gemini output remains unverified here. The screenshot alone cannot establish the exact failing contract field.

Verification completed: 86 AI-tool tests and 11 foundation checks passed.
TypeScript, focused lint, production build, and whitespace checks passed.
Alt-text browser checks passed for source modes, uploads, resizing, edits, snapshots, provider failures, mobile, and dark mode.
Provider responses were mocked during automated testing.
