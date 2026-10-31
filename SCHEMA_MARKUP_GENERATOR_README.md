# Do It With AI Tools — Schema Markup Generator v1

Integration-ready implementation for:

`/ai-seo/schema-markup-generator`

## What this build includes

- 16 type-specific workflows: Article, FAQPage, BreadcrumbList, HowTo, Product, Recipe, Event, JobPosting, LocalBusiness, Organization, Person, VideoObject, WebSite, SoftwareApplication, Course, and Service.
- Dynamic required and recommended fields that change with the selected schema type.
- A deterministic JSON-LD compiler. AI never writes the final publishable code.
- Optional context analysis and optional safe public-URL fetching, including mapped FAQ, step, ingredient, breadcrumb, and other repeatable rows.
- Connected `@graph` output with stable `@id` references.
- Optional WebPage and BreadcrumbList supporting nodes.
- Live required-property, URL, date, location, rating, salary, and integrity checks.
- Copyable script output plus `.jsonld` and `.html` downloads.
- Modern Schema.org Validator and Google Rich Results Test actions.
- Complete SEO landing-page metadata, WebApplication markup, FAQ content, and sitemap entry.
- Focused compiler, validation, metadata extraction, and SSRF-protection tests.

## Install

This bundle is already aligned to the existing repository. The only new direct dependency is `cheerio`, used server-side to extract metadata and visible page evidence from fetched HTML.

```bash
pnpm install
```

Copy the relevant values from `.env.ai-tools.example` into `.env.local`:

```bash
OPENAI_API_KEY=your_server_only_key
OPENAI_SCHEMA_ANALYZER_MODEL=gpt-5.6-luna

AI_TOOLS_DAILY_LIMIT=5
AI_TOOLS_BURST_LIMIT=3

UPSTASH_REDIS_REST_URL=
UPSTASH_REDIS_REST_TOKEN=
```

Never expose the OpenAI key through a `NEXT_PUBLIC_` variable.

## Run

```bash
pnpm dev
```

Open:

`http://localhost:3000/ai-seo/schema-markup-generator`

## Important behavior

### Final JSON-LD is deterministic

The optional AI analyzer maps unstructured page evidence into typed form suggestions. The user reviews those suggestions. `compiler.ts` then builds the final JSON-LD from the confirmed state. This prevents a model from improvising properties, nesting, prices, ratings, dates, or code syntax.

### URL analysis is optional

The form works without the OpenAI key and without fetching a URL. The API is used only when the user clicks the analysis button.

The fetcher:

- accepts only public HTTP or HTTPS pages;
- rejects credentials and nonstandard ports;
- resolves and blocks private, loopback, link-local, reserved, and local-network targets;
- rechecks every redirect;
- caps redirects, response size, and request duration;
- accepts HTML only;
- strips non-content elements before sending a bounded excerpt to the model.

### External validation actions

The retired Google Structured Data Testing Tool now redirects to documentation. This build uses:

- Schema.org Validator for general vocabulary and syntax;
- Google Rich Results Test for current Google-supported rich-result features.

Google does not document a stable cross-site code-prefill interface. The code buttons therefore copy the script and open the official tool, where the user selects the Code workflow and pastes. Live URL actions deep-link the published page URL.

### Honest feature status

- FAQ rich-result display is normally limited to authoritative government and health sites.
- Google retired HowTo rich results and HowTo support in Rich Results Test.
- Google retired the Course Info rich result in 2025, although Course remains Schema.org vocabulary and Google separately documents Course list experiences.
- A valid Schema.org entity can be useful machine-readable context without having a dedicated Google rich result.
- Structured data does not guarantee ranking improvements, rich results, traffic, or AI citations.

## Validation

```bash
pnpm test:ai-tools
pnpm exec tsc --noEmit
pnpm build
```

The schema-specific suite verifies:

- connected Article graph compilation;
- FAQ Question/Answer nesting;
- omission of empty properties;
- parseable JSON and script serialization;
- visible-content confirmation;
- event location rules;
- event date-time UTC offsets;
- remote JobPosting output;
- typed Service output entities;
- all 16 sample workflows;
- metadata and existing-schema extraction;
- private/local URL blocking.

## Key files

```text
app/
  ai-seo/schema-markup-generator/page.tsx
  api/ai-tools/schema/analyze/route.ts

features/schema-generator/
  api.ts
  compiler.ts
  config.ts
  prompt.ts
  schema.ts
  types.ts
  validation.ts
  components/
    SchemaCodePanel.tsx
    SchemaDynamicForm.tsx
    SchemaFieldInput.tsx
    SchemaGeneratorClient.tsx
    SchemaRepeaterEditor.tsx
    SchemaToolEducation.tsx
  server/
    fetch-page.ts

tests/ai-tools/schema-generator.test.ts
docs/SCHEMA_MARKUP_GENERATOR_ARCHITECTURE.md
```

## Reference methodology

- Do It With AI Tools: https://doitwithai.tools/ai-seo/schema-markup-optimization
- Google structured-data guidelines: https://developers.google.com/search/docs/appearance/structured-data/sd-policies
- Google supported structured-data gallery: https://developers.google.com/search/docs/appearance/structured-data/search-gallery
- Schema.org Validator: https://validator.schema.org/
- Google Rich Results Test: https://search.google.com/test/rich-results
- OpenAI Structured Outputs: https://developers.openai.com/api/docs/guides/structured-outputs
