import React from "react";
import Image from "next/image";
import Link from "next/link";
import AiSearchPromptLibrary, {
  aiSearchPromoGuides,
} from "./AiSearchPromptLibrary";
import KeywordGuideCard from "./KeywordGuideCard";

const body = "mt-4 text-lg leading-9 text-slate-600 dark:text-slate-300";
const button =
  "inline-flex min-h-11 items-center justify-center rounded-xl border border-slate-300 px-5 py-3 text-sm font-semibold text-blue-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#5271FF] dark:border-slate-600 dark:text-blue-200";

export const aiSearchFaqs = [
  [
    "What is the difference between SEO, AEO (Answer Engine Optimization), and GEO (Generative Engine Optimization)?",
    "Traditional SEO focuses on ranking URLs in search result lists. AEO structures direct, self-contained answer blocks (45–55 words) for Featured Snippets and voice/answer boxes. GEO optimizes entity clarity, verifiable statistics, comparison matrices, and off-site corroboration so generative engines (Google AI Overviews, ChatGPT Search, Perplexity, and Claude) cite and recommend your brand accurately.",
  ],
  [
    "Why do AI answer engines skip paragraphs that start with 'It is' or 'This approach'?",
    "Retrieval-Augmented Generation (RAG) pipelines chunk web pages into standalone passages before feeding them to an LLM. If a passage starts with a pronoun ('It reduces latency by 40%'), the chunk loses its subject noun when separated from the heading. Naming the subject explicitly ('Server-side caching reduces latency by 40%') makes the passage safe to quote (Prompts 1–11).",
  ],
  [
    "What does academic GEO research say actually increases AI citations?",
    "Studies on Generative Engine Optimization show that adding specific quantitative statistics with sample sizes, citing primary sources, and using clear technical terminology significantly boosts citation visibility, while keyword stuffing provides zero or negative lift (Prompts 22–32).",
  ],
  [
    "Do I need an /llms.txt file and should I allow OAI-SearchBot in robots.txt?",
    "Publishing a concise `/llms.txt` markdown index helps developer tools and AI retrieval agents locate your canonical documentation and product specs quickly. In `robots.txt`, you can separate training crawlers (like `GPTBot` or `Google-Extended`) from live search/citation crawlers (like `OAI-SearchBot` or `PerplexityBot`) depending on your governance policy (Prompts 53–62).",
  ],
  [
    "Why do AI assistants recommend competitors even when my page ranks higher on Google?",
    "LLMs synthesize recommendations across both live search results and third-party corroboration sources—such as independent comparison tables, Reddit threads, YouTube transcripts, and documentation hubs. Prompts 73–91 help you audit those gaps and publish transparent 'Best for X / Skip if Y' matrices that AI engines trust.",
  ],
];

export default function AiSearchPromptArticle({
  schema,
}: {
  schema: Record<string, unknown>;
}) {
  return (
    <article className="bg-white text-slate-900 dark:bg-slate-950 dark:text-white">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            ...schema,
            "@graph": [
              ...(schema["@graph"] as unknown[]),
              {
                "@type": "FAQPage",
                mainEntity: aiSearchFaqs.map(([name, text]) => ({
                  "@type": "Question",
                  name,
                  acceptedAnswer: { "@type": "Answer", text },
                })),
              },
            ],
          }).replace(/</g, "\\u003c"),
        }}
      />

      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
        <nav
          aria-label="Breadcrumb"
          className="flex flex-wrap gap-2 text-sm text-slate-600 dark:text-slate-300"
        >
          <Link href="/">Home</Link>
          <span>/</span>
          <Link href="/prompts">Prompt library</Link>
          <span>/</span>
          <span aria-current="page">
            AI Search, AEO &amp; GEO visibility
          </span>
        </nav>

        <header className="py-10">
          <p className="text-sm font-semibold tracking-wider text-blue-700 dark:text-blue-200">
            91 PROMPTS · NINE AEO, GEO &amp; AI CITATION WORKFLOWS
          </p>
          <h1 className="mt-4 max-w-4xl text-4xl font-extrabold leading-tight tracking-tight sm:text-5xl">
            91 Prompts for AI Search, AEO, GEO &amp; LLM Citation Optimization
          </h1>
          <p className={body + " max-w-3xl"}>
            Structure 50-word self-contained citation passages, disambiguate
            your brand entity in the Knowledge Graph, format original statistics
            for Generative Engine Optimization (GEO), generate `/llms.txt` and
            `@graph` JSON-LD, and audit your brand visibility across AI
            Overviews, ChatGPT, and Perplexity.
          </p>

          <div className="mt-6 flex flex-wrap items-center gap-4">
            <Link
              href="/author/sufian-mustafa"
              className="inline-flex min-w-0 items-center gap-3"
            >
              <Image
                src="/prompts/sufian-mustafa-portrait.webp"
                width={48}
                height={48}
                alt="Sufian Mustafa"
                className="!h-12 !w-12 shrink-0 rounded-full object-cover object-[center_25%]"
              />
              <span className="min-w-0 text-sm leading-6">
                <strong className="block">Sufian Mustafa</strong>Founder and
                author · Do It With AI Tools
              </span>
            </Link>
            <span className="text-sm text-slate-500 dark:text-slate-400">
              Published November 1, 2026
            </span>
          </div>

          <div className="mt-7 flex flex-wrap gap-3">
            <a
              className={button + " bg-[#4058D0] text-white dark:text-white"}
              href="#ai-search-prompt-library"
            >
              Explore all 91 prompts
            </a>
            <a className={button} href="#ai-search-prompt-brief">
              Customize shared AEO / GEO brief
            </a>
            <Link className={button} href="/tools/ai-citation-readiness-checker">
              Open AI Citation Optimizer
            </Link>
          </div>
        </header>

        {/* Featured Hero Image */}
        <figure>
          <Image
            src="/prompts/ai-search-aeo-geo-prompts-hero.webp"
            width={1600}
            height={900}
            alt="91 prompts for AI Search, AEO, GEO, and LLM citation optimization beside an entity graph and citation workbench."
            priority
            sizes="(max-width: 1200px) 100vw, 1152px"
            className="h-auto w-full rounded-2xl shadow-lg"
          />
          <figcaption className="mt-3 text-sm leading-7 text-slate-500 dark:text-slate-400">
            AEO &amp; GEO architecture: Self-contained 50-word citation blocks,
            explicit entity triples, benchmark statistics, and `/llms.txt`
            indexes.
          </figcaption>
        </figure>

        {/* What This Collection Helps You Do */}
        <section className="my-12 rounded-2xl border border-[#5271FF]/30 bg-[#5271FF]/5 p-6 sm:p-8">
          <h2 className="text-2xl font-bold">
            Make your pages easy for AI answer engines to verify and cite
          </h2>
          <p className={body}>
            When a buyer asks Google AI Mode, ChatGPT Search, Perplexity, or
            Claude to compare solutions or explain a technical workflow, the
            engine splits one prompt into 4 to 8 sub-queries (&ldquo;Query
            Fan-Out&rdquo;) and retrieves specific HTML passages, tables, and
            JSON-LD entities.
          </p>
          <p className={body}>
            Pages buried in vague marketing slogans get skipped. Pages that name
            entities explicitly, lead H2 sections with self-contained 50-word
            answers, publish transparent &ldquo;Best for X / Skip if Y&rdquo;
            comparison matrices, and back claims with dated statistics earn the
            citation.
          </p>
          <p className={body}>
            <strong>Fast AEO / GEO Path:</strong> Start with{" "}
            <a href="#aisearch-prompt-001" className="underline font-semibold">
              Prompt 1 (50-Word Self-Contained Citation Passage)
            </a>
            , clarify your brand entity with{" "}
            <a href="#aisearch-prompt-012" className="underline font-semibold">
              Prompt 12 (Canonical Entity Home Statement)
            </a>
            , structure your data with{" "}
            <a href="#aisearch-prompt-022" className="underline font-semibold">
              Prompt 22 (GEO Quantitative Proof)
            </a>{" "}
            and{" "}
            <a href="#aisearch-prompt-033" className="underline font-semibold">
              Prompt 33 (Best For / Skip If Matrix)
            </a>
            , and publish your AI index with{" "}
            <a href="#aisearch-prompt-053" className="underline font-semibold">
              Prompt 53 (/llms.txt Generator)
            </a>
            .
          </p>
        </section>

        {/* Promotional Card #1 */}
        <KeywordGuideCard guide={aiSearchPromoGuides.citationOptimizer} />

        {/* 3-Step AEO / GEO Process */}
        <section className="mb-12">
          <h2 className="text-3xl font-bold">
            Three pillars of Generative Engine Optimization (GEO)
          </h2>
          <ol className="mt-6 grid gap-4 md:grid-cols-3">
            {[
              [
                "Write self-contained answer chunks",
                "Name the subject noun explicitly in sentence one of every H2 answer block so RAG chunkers never lose context.",
              ],
              [
                "Publish dated stats & trade-off tables",
                "Replace vague superlatives with sample-sized numbers, methodology notes, and honest 'Best for X / Not ideal for Y' matrices.",
              ],
              [
                "Connect entities across HTML & @graph",
                "Align your visible copy, `/llms.txt` documentation index, and `@graph` JSON-LD `sameAs` links across the web.",
              ],
            ].map(([title, text], i) => (
              <li
                className="rounded-xl bg-slate-100 p-5 dark:bg-slate-900"
                key={title}
              >
                <span className="text-sm font-semibold text-blue-700 dark:text-blue-200">
                  Pillar {i + 1}
                </span>
                <h3 className="mt-2 text-xl font-bold">{title}</h3>
                <p className={body}>{text}</p>
              </li>
            ))}
          </ol>
        </section>

        {/* Main Interactive 91-Prompt Workbench */}
        <AiSearchPromptLibrary />

        {/* Bottom Interactive AEO & GEO Studios Banner */}
        <section className="my-14 rounded-2xl bg-[#101e43] p-6 text-white sm:p-8">
          <div className="mb-6 flex items-center gap-3 text-sm font-semibold text-blue-100">
            <Image
              src="/doitwithai-logo-square.png"
              width={40}
              height={40}
              alt=""
              className="!h-10 !w-10 shrink-0 rounded-lg object-contain"
            />
            <span>Do It With AI Tools · AI Search, AEO &amp; GEO Studios</span>
          </div>
          <p className="text-sm font-semibold text-blue-200">
            TEST &amp; DEPLOY YOUR AEO / GEO ASSETS
          </p>
          <h2 className="mt-3 text-3xl font-bold">
            Optimize your snippet passages, `/llms.txt`, schema &amp; charts
          </h2>
          <p className="mt-4 max-w-3xl text-lg leading-9 text-slate-200">
            Pair these 91 prompts with our interactive AI Search and Visual
            Infographic studios to test citation readiness and publish
            machine-readable documentation.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            {[
              ["ai-citation-readiness-checker", "AI Citation & Snippet Optimizer"],
              ["ai-brand-visibility-prompt-generator", "AI Brand Visibility Prompt Studio"],
              ["llms-txt-generator", "LLMs.txt Generator"],
              ["structured-data-validator", "JSON-LD @graph Validator"],
              ["ai-faq-generator", "Conversational FAQ & Schema Studio"],
              ["data-to-chart-visual-card-maker", "GEO Benchmark Chart Maker"],
              ["framework-matrix-diagram-builder", "2×2 Trade-Off Matrix Studio"],
              ["on-page-ai-seo-analyzer", "On-Page AI SEO Analyzer"],
            ].map(([slug, label]) => (
              <Link
                className="inline-flex min-h-11 items-center justify-center rounded-xl border border-blue-200/40 px-4 py-3 text-sm font-semibold hover:bg-white/10"
                href={`/tools/${slug}`}
                key={slug}
              >
                {label} ↗
              </Link>
            ))}
          </div>
        </section>

        {/* FAQs */}
        <section className="my-12" aria-labelledby="aisearch-faq-title">
          <h2 id="aisearch-faq-title" className="text-3xl font-bold">
            AI Search, AEO &amp; GEO optimization prompt FAQs
          </h2>
          <div className="mt-6 space-y-4">
            {aiSearchFaqs.map(([q, a]) => (
              <details
                key={q}
                className="rounded-2xl border border-slate-200 p-5 dark:border-slate-700"
              >
                <summary className="cursor-pointer text-lg font-bold">
                  {q}
                </summary>
                <p className={body}>{a}</p>
              </details>
            ))}
          </div>
        </section>

        {/* Related Prompt Guides Mesh */}
        <section className="my-12" aria-labelledby="related-prompts-title">
          <h2 id="related-prompts-title" className="text-3xl font-bold">
            Related prompt guides to continue your workflow
          </h2>
          <div className="mt-6 grid gap-5 md:grid-cols-2">
              <Link
                href="/prompts/on-page-seo-content-writing-prompts"
                className="group flex flex-col justify-between rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-all hover:-translate-y-0.5 hover:border-[#5271FF] hover:shadow-md dark:border-slate-700 dark:bg-slate-900"
              >
                <div>
                  <h3 className="text-xl font-bold group-hover:text-[#4058D0] dark:group-hover:text-blue-300">
                    84 On-Page SEO, Headings, E-E-A-T & Readability Prompts
                  </h3>
                  <p className="mt-2 text-base leading-7 text-slate-600 dark:text-slate-300">
                    Write question-led H1–H3 outlines, 45-word Featured Snippets, and E-E-A-T Information Gain passages.
                  </p>
                </div>
                <span className="mt-4 inline-block text-sm font-semibold text-blue-700 dark:text-blue-200">
                  Explore prompt guide →
                </span>
              </Link>
              <Link
                href="/prompts/technical-seo-audit-schema-prompts"
                className="group flex flex-col justify-between rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-all hover:-translate-y-0.5 hover:border-[#5271FF] hover:shadow-md dark:border-slate-700 dark:bg-slate-900"
              >
                <div>
                  <h3 className="text-xl font-bold group-hover:text-[#4058D0] dark:group-hover:text-blue-300">
                    76 Technical SEO Audit, JSON-LD Schema & CWV Prompts
                  </h3>
                  <p className="mt-2 text-base leading-7 text-slate-600 dark:text-slate-300">
                    Build connected @graph JSON-LD schema, audit AI crawler robots.txt rules, and verify SSR HTML parity.
                  </p>
                </div>
                <span className="mt-4 inline-block text-sm font-semibold text-blue-700 dark:text-blue-200">
                  Explore prompt guide →
                </span>
              </Link>
              <Link
                href="/prompts/link-building-digital-pr-outreach-prompts"
                className="group flex flex-col justify-between rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-all hover:-translate-y-0.5 hover:border-[#5271FF] hover:shadow-md dark:border-slate-700 dark:bg-slate-900"
              >
                <div>
                  <h3 className="text-xl font-bold group-hover:text-[#4058D0] dark:group-hover:text-blue-300">
                    88 Link Building, Digital PR & Journalist Prompts
                  </h3>
                  <p className="mt-2 text-base leading-7 text-slate-600 dark:text-slate-300">
                    Build the third-party editorial citations and benchmark studies AI answer engines cross-check.
                  </p>
                </div>
                <span className="mt-4 inline-block text-sm font-semibold text-blue-700 dark:text-blue-200">
                  Explore prompt guide →
                </span>
              </Link>
              <Link
                href="/prompts/topic-clustering-topical-authority-prompts"
                className="group flex flex-col justify-between rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-all hover:-translate-y-0.5 hover:border-[#5271FF] hover:shadow-md dark:border-slate-700 dark:bg-slate-900"
              >
                <div>
                  <h3 className="text-xl font-bold group-hover:text-[#4058D0] dark:group-hover:text-blue-300">
                    94 Topic Clustering & Topical Authority Prompts
                  </h3>
                  <p className="mt-2 text-base leading-7 text-slate-600 dark:text-slate-300">
                    Cover every semantic entity and follow-up question across a connected Pillar-and-Spoke cluster.
                  </p>
                </div>
                <span className="mt-4 inline-block text-sm font-semibold text-blue-700 dark:text-blue-200">
                  Explore prompt guide →
                </span>
              </Link>
          </div>
        </section>

        <div className="flex flex-wrap gap-3 pb-10">
          <a className={button} href="#ai-search-prompt-brief">
            Customize shared brief ↑
          </a>
          <a className={button} href="#ai-search-prompt-library">
            Return to prompt library ↑
          </a>
          <Link className={button} href="/prompts">
            Browse all 13 prompt guides →
          </Link>
        </div>
      </div>
    </article>
  );
}
