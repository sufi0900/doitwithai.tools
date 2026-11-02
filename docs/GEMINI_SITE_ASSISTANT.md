# Gemini website assistant

The chatbot now uses the existing server-only `GEMINI_API_KEY` and `GEMINI_MODEL` settings. Optional `GEMINI_SITE_ASSISTANT_MODEL` overrides the shared model for chat.

No OpenAI key, OpenAI vector store, embeddings, or manual indexing is required for the active chat path.

## Automatic updates

- Published articles and resources are queried from Sanity's public API on every question, using published perspective and no CDN or persistent cache.
- Relevant article content is fetched again before generation. Drafts, unsupported document types, and unsafe slugs are excluded.
- Deleted or unpublished articles disappear from retrieval on the next request. Existing browser transcripts remain historical answers.
- Executable tools come from the deployed central registry. Add new tools there and deploy the code to make them discoverable.
- The homepage, contact, founder and other hard-coded profile information remain code-managed. Update the site profile when those facts change.
- This is on-demand retrieval, not model training. Relevant excerpts are supplied to Gemini for each answer.

## Configuration

Keep the existing Gemini key and model in Vercel's Preview and Production environments as appropriate. Public Sanity settings are `NEXT_PUBLIC_SANITY_PROJECT_ID` and `NEXT_PUBLIC_SANITY_DATASET`.

An environment-variable change requires a new deployment. Gemini quota, model availability, Sanity access, and the existing Redis rate limiter still affect availability.

The Sanity webhook continues normal page invalidation. In Gemini mode it skips the legacy OpenAI file synchronization. The `ai:sync-knowledge` command explains that no manual synchronization is needed.

## Grounding and verification

Only published content, registry entries, and the approved site profile are supplied. Retrieved text and conversation history remain untrusted reference data. The model cannot create source-card URLs: it returns validated document IDs that the server maps to canonical URLs.

Sanity failure returns an unavailable response instead of silently using an old index. Retrieval uses two bounded requests, then Gemini has a 28-second deadline. Existing chat input limits, honeypot, rate limits, and provider error handling remain active.

Tests cover canonical tools, draft exclusion, safe URLs, relevant excerpts, repeated CMS reads, updated content, source deduplication, and CMS failure. Provider calls are mocked. Verify the deployed chatbot with the existing credentials after deployment.
