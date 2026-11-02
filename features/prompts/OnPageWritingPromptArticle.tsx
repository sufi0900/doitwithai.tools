import React from "react";
import Image from "next/image";
import Link from "next/link";
import OnPageWritingPromptLibrary from "./OnPageWritingPromptLibrary";
import { onpageWritingPromoGuides } from "./OnPageWritingPromoGuides";
import KeywordGuideCard from "./KeywordGuideCard";

const body = "mt-4 text-lg leading-9 text-slate-600 dark:text-slate-300";
const button =
  "inline-flex min-h-11 items-center justify-center rounded-xl border border-slate-300 px-5 py-3 text-sm font-semibold text-blue-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#5271FF] dark:border-slate-600 dark:text-blue-200";

export const onpageWritingFaqs = [
  [
    "How do I stop AI-assisted drafts from sounding like generic consensus summaries?",
    "Generic AI articles fail because they average out what already ranks without adding Information Gain. Use Prompts 1 and 33–43 to mark explicit `[MY INPUT]` slots in your outline and weave in your own test metrics, screenshots, edge-case caveats, and before/after examples.",
  ],
  [
    "Should I put my primary keyword in every H2 heading?",
    "No. Repeating the exact keyword in every H2 looks unnatural to readers and does not help rankings. Give your H1 the primary topic context, and assign each H2 a distinct reader sub-question or step (covered in Prompts 1–11).",
  ],
  [
    "What is the ideal length for a Featured Snippet or AI Overview answer block?",
    "Place a self-contained 45-to-55 word paragraph directly beneath a question-based H2 heading, starting the first sentence with a direct noun-verb definition ('Image alt text is...') before expanding with examples or a comparison table (Prompts 22–32).",
  ],
  [
    "How do I improve readability without 'dumbing down' technical accuracy?",
    "Readability comes from sentence structure, not removing technical facts. Prompts 44–54 replace passive nominalizations ('implementation of the directive was performed') with active verbs ('we added the directive') while keeping every caveat and specification intact.",
  ],
  [
    "When should I refresh an existing article instead of publishing a new URL?",
    "If an existing URL already targets the same search intent and has historical impressions or links, refresh that URL (Prompts 75–84) rather than creating a second competing page that causes keyword cannibalization.",
  ],
];

export default function OnPageWritingPromptArticle({
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
                mainEntity: onpageWritingFaqs.map(([name, text]) => ({
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
            On-page SEO, headings &amp; readability
          </span>
        </nav>

        <header className="py-10">
          <p className="text-sm font-semibold tracking-wider text-blue-700 dark:text-blue-200">
            84 PROMPTS · EIGHT ON-PAGE SEO, HEADING &amp; EDITORIAL WORKFLOWS
          </p>
          <h1 className="mt-4 max-w-4xl text-4xl font-extrabold leading-tight tracking-tight sm:text-5xl">
            84 ChatGPT prompts for on-page SEO, headings, E-E-A-T &amp;
            readability
          </h1>
          <p className={body + " max-w-3xl"}>
            Plan question-led H1–H3 outlines, draft 45-word Featured Snippet
            answers, inject first-hand E-E-A-T proof, and edit dense passages
            into clear, human-sounding prose.
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
              href="#onpage-writing-prompt-library"
            >
              Explore all 84 prompts
            </a>
            <a className={button} href="#onpage-writing-prompt-brief">
              Customize shared editorial brief
            </a>
            <Link className={button} href="/tools/on-page-ai-seo-analyzer">
              Open On-Page AI SEO Analyzer
            </Link>
          </div>
        </header>

        {/* Featured Hero Image */}
        <figure>
          <Image
            src="/prompts/on-page-seo-content-writing-prompts-hero-v2.webp"
            width={1600}
            height={900}
            alt="84 ChatGPT prompts for on-page SEO, headings, E-E-A-T, and readability beside an interactive editorial workbench."
            priority
            sizes="(max-width: 1200px) 100vw, 1152px"
            className="h-auto w-full rounded-2xl shadow-lg"
          />
          <figcaption className="mt-3 text-sm leading-7 text-slate-500 dark:text-slate-400">
            Editorial workflow: Structure headings around reader tasks, lead
            with direct answers, and ground every section in real evidence.
          </figcaption>
        </figure>

        {/* What This Collection Helps You Do */}
        <section className="my-12 rounded-2xl border border-[#5271FF]/30 bg-[#5271FF]/5 p-6 sm:p-8">
          <h2 className="text-2xl font-bold">
            Write pages that earn both human trust and search citations
          </h2>
          <p className={body}>
            Asking an assistant to &ldquo;write an SEO blog post for
            [keyword]&rdquo; in a single shot produces repetitive headings,
            vague filler intros, and zero original Information Gain. Strong
            on-page SEO happens in deliberate editorial stages: structure first,
            evidence second, and readability refinement third.
          </p>
          <p className={body}>
            These 84 prompts keep you in the editor&apos;s seat—marking exact{" "}
            <code>[MY INPUT]</code> slots for your own screenshots and numbers,
            structuring 45-word answer blocks and comparison tables, and
            stripping robotic AI phrasing without losing technical caveats.
          </p>
          <p className={body}>
            <strong>Fast Editorial Path:</strong> Start with{" "}
            <a href="#onpage-prompt-001" className="underline font-semibold">
              Prompt 1 (Question-Led H1–H3 Outline)
            </a>
            , write your opening with{" "}
            <a href="#onpage-prompt-012" className="underline font-semibold">
              Prompt 12 (65-Word Answer-First Intro)
            </a>
            , format key sections with{" "}
            <a href="#onpage-prompt-022" className="underline font-semibold">
              Prompt 22 (45-Word Featured Snippet)
            </a>{" "}
            and{" "}
            <a href="#onpage-prompt-033" className="underline font-semibold">
              Prompt 33 (Information Gain Audit)
            </a>
            , and polish your prose with{" "}
            <a href="#onpage-prompt-044" className="underline font-semibold">
              Prompt 44 (Grade 8 Readability Edit)
            </a>
            .
          </p>
        </section>

        {/* Promotional Card #1 */}
        <KeywordGuideCard guide={onpageWritingPromoGuides.onpageAnalyzer} />

        {/* 3-Step Editorial Process */}
        <section className="mb-12">
          <h2 className="text-3xl font-bold">
            Three principles of high-ranking, reader-first content
          </h2>
          <ol className="mt-6 grid gap-4 md:grid-cols-3">
            {[
              [
                "Give every heading a single job",
                "Each H2 should answer one concrete reader question, followed immediately by a 45-word direct answer before diving into nuances.",
              ],
              [
                "Lead with first-hand Information Gain",
                "Show your own tests, screenshots, edge-case warnings, and quantitative comparisons that generic summaries cannot replicate.",
              ],
              [
                "Edit for active verbs & visual rhythm",
                "Break up long walls of text every 200 words with a comparison table, parallel bullet list, or embedded infographic card.",
              ],
            ].map(([title, text], i) => (
              <li
                className="rounded-xl bg-slate-100 p-5 dark:bg-slate-900"
                key={title}
              >
                <span className="text-sm font-semibold text-blue-700 dark:text-blue-200">
                  Principle {i + 1}
                </span>
                <h3 className="mt-2 text-xl font-bold">{title}</h3>
                <p className={body}>{text}</p>
              </li>
            ))}
          </ol>
        </section>

        {/* Main Interactive 84-Prompt Workbench */}
        <OnPageWritingPromptLibrary />

        {/* Bottom Interactive On-Page SEO & Editorial Studios Banner */}
        <section className="my-14 rounded-2xl bg-[#101e43] p-6 text-white sm:p-8">
          <div className="mb-6 flex items-center gap-3 text-sm font-semibold text-blue-100">
            <Image
              src="/doitwithai-logo-square.png"
              width={40}
              height={40}
              alt=""
              className="!h-10 !w-10 shrink-0 rounded-lg object-contain"
            />
            <span>Do It With AI Tools · On-Page SEO &amp; Editorial Studios</span>
          </div>
          <p className="text-sm font-semibold text-blue-200">
            INSPECT &amp; VISUALIZE YOUR DRAFT
          </p>
          <h2 className="mt-3 text-3xl font-bold">
            Audit your headings, readability, schema &amp; visual assets
          </h2>
          <p className="mt-4 max-w-3xl text-lg leading-9 text-slate-200">
            Pair these 84 editorial prompts with our interactive on-page SEO and
            visual studios to verify your page structure before publishing.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            {[
              ["on-page-ai-seo-analyzer", "On-Page AI SEO Analyzer"],
              ["heading-structure-analyzer", "Heading Structure Analyzer"],
              ["readability-checker", "Readability & Flow Checker"],
              ["seo-content-brief-generator", "SEO Content Brief Generator"],
              ["ai-citation-readiness-checker", "Featured Snippet Optimizer"],
              ["image-alt-text-generator", "Image Alt Text Generator"],
              ["blog-to-infographic-generator", "Blog to Infographic Studio"],
              ["structured-data-validator", "Schema Markup Validator"],
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
        <section className="my-12" aria-labelledby="onpage-faq-title">
          <h2 id="onpage-faq-title" className="text-3xl font-bold">
            On-page SEO, headings &amp; readability prompt FAQs
          </h2>
          <div className="mt-6 space-y-4">
            {onpageWritingFaqs.map(([q, a]) => (
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
                href="/prompts/ai-search-aeo-geo-visibility-prompts"
                className="group flex flex-col justify-between rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-all hover:-translate-y-0.5 hover:border-[#5271FF] hover:shadow-md dark:border-slate-700 dark:bg-slate-900"
              >
                <div>
                  <h3 className="text-xl font-bold group-hover:text-[#4058D0] dark:group-hover:text-blue-300">
                    91 AI Search, AEO, GEO & Citation Prompts
                  </h3>
                  <p className="mt-2 text-base leading-7 text-slate-600 dark:text-slate-300">
                    Format 50-word entity-explicit citation passages, GEO benchmark stats, and /llms.txt indexes.
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
                    Architect 3-tier Pillar-and-Spoke topical maps and bidirectional internal linking matrices.
                  </p>
                </div>
                <span className="mt-4 inline-block text-sm font-semibold text-blue-700 dark:text-blue-200">
                  Explore prompt guide →
                </span>
              </Link>
              <Link
                href="/prompts/chatgpt-prompts-for-meta-title-and-meta-description"
                className="group flex flex-col justify-between rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-all hover:-translate-y-0.5 hover:border-[#5271FF] hover:shadow-md dark:border-slate-700 dark:bg-slate-900"
              >
                <div>
                  <h3 className="text-xl font-bold group-hover:text-[#4058D0] dark:group-hover:text-blue-300">
                    ChatGPT Prompts for Meta Titles & Descriptions
                  </h3>
                  <p className="mt-2 text-base leading-7 text-slate-600 dark:text-slate-300">
                    Brief, draft, compare, and pixel-check your meta title and description pair before publishing.
                  </p>
                </div>
                <span className="mt-4 inline-block text-sm font-semibold text-blue-700 dark:text-blue-200">
                  Explore prompt guide →
                </span>
              </Link>
              <Link
                href="/prompts/infographic-data-visualization-prompts"
                className="group flex flex-col justify-between rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-all hover:-translate-y-0.5 hover:border-[#5271FF] hover:shadow-md dark:border-slate-700 dark:bg-slate-900"
              >
                <div>
                  <h3 className="text-xl font-bold group-hover:text-[#4058D0] dark:group-hover:text-blue-300">
                    77 Infographic, Data Visualization & Diagram Prompts
                  </h3>
                  <p className="mt-2 text-base leading-7 text-slate-600 dark:text-slate-300">
                    Break up long text sections with 8-node visual infographics, bar charts, and 2×2 matrices.
                  </p>
                </div>
                <span className="mt-4 inline-block text-sm font-semibold text-blue-700 dark:text-blue-200">
                  Explore prompt guide →
                </span>
              </Link>
          </div>
        </section>

        <div className="flex flex-wrap gap-3 pb-10">
          <a className={button} href="#onpage-writing-prompt-brief">
            Customize shared brief ↑
          </a>
          <a className={button} href="#onpage-writing-prompt-library">
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
