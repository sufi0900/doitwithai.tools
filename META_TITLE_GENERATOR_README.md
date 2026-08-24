# Meta Title Generator v1 — Install and Run

This package is structured to merge into the existing `sufi0900/doitwithai.tools` Next.js App Router repository. Keep every path exactly as supplied.

## 1. Install the new dependencies

```bash
pnpm install
```

The package adds:

- `openai` for the server-side Responses API;
- `zod` for one typed validation and Structured Outputs contract; and
- `tsx` for the focused TypeScript tests.

The patch also declares `@portabletext/react`, which the existing article components already import but the inspected `package.json` did not declare. Without it, the current repository fails a clean production build before reaching the new route.

## 2. Configure local environment variables

Copy the values from `.env.ai-tools.example` into your untracked local `.env.local` file:

```dotenv
OPENAI_API_KEY=your_server_only_key
OPENAI_META_TITLE_MODEL=gpt-5.6-luna
AI_TOOLS_DAILY_LIMIT=5
AI_TOOLS_BURST_LIMIT=3
UPSTASH_REDIS_REST_URL=
UPSTASH_REDIS_REST_TOKEN=
```

Do not use `NEXT_PUBLIC_OPENAI_API_KEY` and do not put the key in a client component.

## 3. Start the existing app

```bash
pnpm dev
```

Open:

```text
http://localhost:3000/ai-seo/meta-title-generator
```

## 4. Run the focused tests

```bash
pnpm test:ai-tools
```

Then run the repository build:

```bash
pnpm build
```

The existing repository may surface unrelated legacy errors. Resolve or isolate those separately; do not disable checks for the new tool.

## 5. Production requirements

- Add all environment variables in Vercel.
- Configure Upstash Redis before public promotion; the in-memory fallback is only reliable for local development or one long-lived process.
- Set OpenAI project budgets and billing alerts.
- Rotate any secret that may have been committed in the repository's tracked root `.env` file, remove that file from Git, and clean the history safely.
- Add a visible internal link from `/ai-seo/meta-title` to the generator.
- Add the generator to the AI SEO hub or free-tools discovery surface.
- Test the live route without authenticated admin cookies.

## Core implementation paths

```text
app/ai-seo/meta-title-generator/page.tsx
app/api/ai-tools/meta-title/route.ts
components/ai-tools/*
features/meta-title-generator/*
lib/ai-tools/*
tests/ai-tools/*
docs/AI_META_TITLE_GENERATOR_ARCHITECTURE.md
```

Read `docs/AI_META_TITLE_GENERATOR_ARCHITECTURE.md` for the product contract, reusable system design, safety boundary, rollout gates, and future-tool reuse map.
