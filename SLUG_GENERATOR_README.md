# SEO Slug Generator v1 — Install and Run

This integration package adds the context-aware slug generator to the existing Do It With AI Tools Next.js App Router repository. Keep every supplied path unchanged when copying it into the project.

## 1. Install dependencies

```bash
pnpm install
```

The generator reuses the shared AI-tool foundation introduced with the meta-title tool:

- `openai` for the server-only Responses API call;
- `zod` for input validation and Structured Outputs;
- `@upstash/redis` for production rate limits; and
- `tsx` for focused TypeScript tests.

The supplied `package.json` and lockfile already declare these dependencies.

## 2. Configure local environment values

Copy the safe variable names from `.env.ai-tools.example` into an untracked `.env.local` file:

```dotenv
OPENAI_API_KEY=your_server_only_key
OPENAI_SLUG_GENERATOR_MODEL=gpt-5.6-luna
AI_TOOLS_DAILY_LIMIT=5
AI_TOOLS_BURST_LIMIT=3
UPSTASH_REDIS_REST_URL=
UPSTASH_REDIS_REST_TOKEN=
```

Never expose the API key through a variable beginning with `NEXT_PUBLIC_`.

## 3. Start the app

```bash
pnpm dev
```

Open:

```text
http://localhost:3000/ai-seo/slug-url-generator
```

## 4. Validate the integration

```bash
pnpm test:ai-tools
pnpm exec tsc --noEmit
pnpm build
```

The API returns a safe `AI_NOT_CONFIGURED` response when no OpenAI key is available. This is expected during a keyless build check.

## 5. Production checklist

- Add the environment variables in Vercel.
- Configure Upstash Redis before public promotion; the in-memory fallback is for local development or one long-lived process.
- Set OpenAI project budgets and billing alerts.
- Add a visible CTA from `/ai-seo/write-slug-urls` to the generator.
- Add the generator to the AI SEO hub or free-tools discovery surface.
- Test the route on mobile, tablet, and desktop without authenticated admin cookies.
- Evaluate at least 30 real page briefs before promoting it widely.
- Do not publish any generated slug without checking it against the actual page and existing URL history.
- If the repository's root `.env` has ever been committed, remove it from version control and rotate exposed credentials safely.

## Core implementation paths

```text
app/ai-seo/slug-url-generator/page.tsx
app/api/ai-tools/slug/route.ts
features/slug-generator/*
components/ai-tools/*
lib/ai-tools/*
tests/ai-tools/slug-evaluator.test.ts
docs/AI_SEO_SLUG_GENERATOR_ARCHITECTURE.md
```

Read `docs/AI_SEO_SLUG_GENERATOR_ARCHITECTURE.md` for the product contract, request flow, prompt boundary, deterministic evaluator, reuse map, SEO safeguards, and rollout gates.
