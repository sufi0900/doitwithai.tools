# Gemini primary and Groq fallback

All eleven AI tools use the shared adapter in `lib/ai-tools/gemini.ts`. The site assistant uses it too. Existing client method names remain compatible with handler tests.

## Configuration

Keep the existing `GEMINI_API_KEY`, `GEMINI_MODEL`, and optional Gemini model overrides.

Add these server-side variables in Vercel for the environments you use:

```dotenv
GROQ_API_KEY=your_private_groq_key
GROQ_MODEL=openai/gpt-oss-120b
GROQ_VISION_MODEL=qwen/qwen3.8-27b
```

Only the Groq key is necessary to enable fallback. Both model values above are built-in defaults and can be overridden. Never prefix the key with `NEXT_PUBLIC_`. Select Preview for testing and Production for later production use. Redeploy after saving environment changes. The code does not change your account billing plan or provision paid access.

## Request sequence

1. Validate the tool request and enforce application rate limits.
2. Try the configured Gemini model.
3. If Gemini has a service, quota, authentication, model, timeout, incomplete-output, or structured-output parsing failure, try Groq once.
4. Parse Groq output with the same Zod contract, followed by the handler's existing editorial and deterministic checks.
5. If both providers fail, return one safe error while preserving client inputs.

Provider refusals and invalid image submissions retain the existing rejection behavior. They are not retried through another provider. Gemini's existing schema-specific JSON-mode repair remains bounded by its primary deadline. Semantic checks performed after the adapter can reject a schema-valid response; such checks do not automatically trigger another provider request.

With both providers enabled, Gemini receives at most 55% of the request's AI budget, capped at 25 seconds. Groq receives the remaining time. The combined deadline never exceeds the caller's existing budget or the adapter's 50-second maximum. Calls are sequential. A successful Gemini response does not consume a Groq request.

## Images and quality

Image uploads are forwarded intact as data URLs to the configured Groq vision model. A text-only model is never silently substituted for image interpretation. Written image descriptions use the normal text model.

Groq uses JSON object mode with explicit schema instructions. Local parsing still enforces the tool's original schema. Truncated, malformed, refused, or schema-invalid output cannot be returned as success. Model overrides must support the relevant input and JSON mode.

## Operational boundaries

Fallback does not bypass application rate limits, unavailable Redis, page-fetch restrictions, crawling limits, or invalid form inputs. It does not add another user click. Credentials and provider response bodies are never returned to clients or included in fallback logs. Logs record provider, model, and safe failure codes only.

The internal link tool still supports deterministic text matching when no AI provider is configured. When a provider is configured but both AI services fail, the request now returns a safe error and releases its analysis reservation.

Groq free-plan limits still apply. Current official documentation lists the default text and vision models with 8K tokens per minute and 200K tokens per day; account limits can differ. Large briefs may exceed a free-plan request budget. The adapter does not silently discard supplied evidence to fit a quota.

## Verification

Tests cover Gemini success without a Groq call, ordered fallback on service and output errors, separate credentials, timeout allocation, image preservation, Groq-only configuration, both-provider failures, and preservation of refusals. Existing tool tests verify route contracts and local output checks. Live authenticated requests require the deployment's configured credentials.

Sources checked October 14, 2026:

- https://console.groq.com/docs/structured-outputs
- https://console.groq.com/docs/api-reference
- https://console.groq.com/docs/vision
- https://console.groq.com/docs/rate-limits
