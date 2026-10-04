# Gemini configuration for all tools

Replacing an OpenAI key with a Gemini key cannot change the API endpoint or request format. This feature branch now uses Gemini's native generateContent API for all ten executable tools.

## Vercel environment settings

Set these server-only variables for each intended environment:

```dotenv
GEMINI_API_KEY=your_google_ai_studio_key
GEMINI_MODEL=gemini-3.5-flash-lite
```

Leave all `GEMINI_*_MODEL` overrides blank or remove them to use the shared model. An existing `GEMINI_TOPICAL_MAP_MODEL` overrides the shared value for that tool. Old `OPENAI_*_MODEL` values are ignored by executable tools.

Redeploy the environment after saving its settings. Environment changes do not update already built deployments. Preview deployments need Preview settings; Production deployments need Production settings.

Keep existing Redis settings. Production rate limits require shared Redis. API keys must never use `NEXT_PUBLIC_`. Never place a Gemini key in `OPENAI_API_KEY`.

## Model choice and limits

Google lists Gemini 3.5 Flash-Lite as a stable model with image input and structured output. Its current pricing page lists free input/output access. Start here and evaluate real results for each tool. Structured output does not prove factual accuracy.

Free-tier quota and model access depend on the Google project. Verify available models and current rate limits in Google AI Studio. The implementation does not enable billing, buy credits, or silently switch providers. Quota exhaustion returns a clear error without automatic retries.

Google's free-tier data handling differs from paid-tier handling. Request logging is disabled with `store:false`; this does not override provider terms. Users should avoid sending private material through the free tier.

References checked October 4, 2026:
- https://ai.google.dev/gemini-api/docs/models/gemini-3.5-flash-lite
- https://ai.google.dev/gemini-api/docs/pricing
- https://ai.google.dev/api/generate-content

## Preserved behavior

All tool routes, UI, input limits, validation, result editing, and exports remain in place. The adapter converts uploaded images to inline Gemini image parts. Provider responses must finish successfully and pass local schema and tool-specific validation. Timeouts stay below Vercel's 60-second function limit.

The title tool now uses the supplied brief without live search grounding. Its prompt and progress text reflect that behavior. The separate site assistant still relies on OpenAI vector stores and file search. That integration requires its own retrieval migration and is outside this executable-tool change.

## Troubleshooting

### Structured tool request compatibility

Article Outline, Keyword Clustering, and Topical Map now send compact provider-facing schemas.
Types, fields, required keys, enums, and object structure remain enforced by Gemini's structured decoder.
Array bounds, string lengths, and patterns move into schema descriptions to reduce decoder complexity.
The original Zod validators and tool-specific semantic checks remain strict.
Compact schemas do not prove the exact reason for an earlier HTTP 400.

If Gemini explicitly identifies a schema rejection, these three tools allow one JSON-mode recovery call.
It keeps the output contract in trusted instructions and retains JSON response mode and all local validators.
Both attempts share the original timeout. Other HTTP 400 errors are not retried.
Safety blocks, authentication failures, and quota errors never trigger this compatibility recovery.
The event `ai_schema_json_mode_retry` records the model and tool format without submitted material.

Alt Text now has a 6,000-token output ceiling instead of 2,400.
This provides more completion headroom; actual token exhaustion must still be confirmed from the stopping reason.
`MAX_TOKENS`, safety refusals, and other incomplete responses now have distinct messages.
Safe failure logs include an allowlisted stopping reason. Partial and blocked results remain rejected.

Official references
- https://ai.google.dev/gemini-api/docs/structured-output
- https://ai.google.dev/api/generate-content

### Text examples work but uploaded images fail

Text success confirms credentials work for that request. It does not establish image-processing availability or model compatibility.
The image path sends validated base64 image bytes through native `inlineData`, with the matching MIME type.
PNG, JPEG, and WebP remain supported. Images are never silently dropped.

An optional server-only `GEMINI_ALT_TEXT_VISION_MODEL` selects a separate model for uploaded images.
Without it, image requests keep using `GEMINI_ALT_TEXT_MODEL`, then `GEMINI_MODEL`.
Text examples continue using the existing Alt Text model settings.
Select a model with verified image input and structured output support in your Google project.
Configure it in Vercel Preview scope and create a new preview deployment before retesting.

Provider failures now display a reference identifier. Match it to the `ai_provider_failure` entry in Vercel runtime logs.
Safe diagnostics include the actual upstream HTTP status, allowlisted provider status, model ID, and text/image mode.
Provider messages, prompts, image bytes, keys, and generated text are excluded.
HTTP 500 and 503 now have distinct messages instead of the generic provider failure.
HTTP 400 can involve input format as well as schema or generation settings. Do not assume a schema defect from status alone.
Diagnostic improvements do not establish the exact cause of an earlier failure or guarantee provider recovery.

- Not configured: check the Gemini key, shared model, optional overrides, and deployment environment.
- Authentication failure: check the key's Google project, API restrictions, and model access.
- Model unavailable: use an exact available model ID without the `models/` prefix.
- Quota exhausted: review Google AI Studio limits and wait for quota recovery.
- Production rate-limit unavailable: check the existing shared Redis configuration.
- Invalid output: try a more focused brief. No partial or malformed result replaces the open workspace.

## Validation

The current update passes 90 automated checks: 79 AI-tool tests and 11 foundation checks.
These cover native transport, image conversion, separate vision-model routing, safe diagnostics, validation, quota errors, and existing tool workflows.
Frontend TypeScript and focused lint pass. Provider calls were mocked. No live key or Gemini model output was evaluated.
