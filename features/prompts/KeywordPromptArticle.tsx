import React from "react";
import Image from "next/image";
import Link from "next/link";
import Library from "./KeywordPromptLibrary";

const body = "mt-4 text-lg leading-9 text-slate-600 dark:text-slate-300";
const button =
  "inline-flex min-h-11 items-center justify-center rounded-xl border border-slate-300 px-5 py-3 text-sm font-semibold text-blue-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#5271FF] dark:border-slate-600 dark:text-blue-200";
export const keywordFaqs = [
  [
    "Can these prompts calculate search volume or difficulty?",
    "Not without suitable source data. Supply a dated export and the provider’s definitions. Ask the assistant to preserve numbers and identify missing evidence.",
  ],
  [
    "Can I find keywords bringing traffic to a competitor?",
    "Use an authorized competitor keyword export for reported rankings and traffic estimates. Page text alone only supports inferences about topic targeting.",
  ],
  [
    "Are search intent and keyword intent different workflows?",
    "They usually describe the same underlying task in keyword research. This guide uses search intent consistently while reviewing the purpose behind each query.",
  ],
  [
    "Do I need LSI keywords?",
    "Use related concepts and natural vocabulary when they help explain the topic. Do not treat an LSI keyword list as a required ranking checklist.",
  ],
  [
    "Can I use these prompts with other assistants?",
    "Yes. Copy the prompt into your preferred assistant. Browsing, attachments, context limits, and link-prefilling behavior vary, so confirm the available capabilities.",
  ],
  [
    "Should I run all 100 prompts?",
    "No. Choose the prompt that matches your next decision. Use the workflow index to avoid repeating work or collecting irrelevant keyword ideas.",
  ],
];
export default function KeywordPromptArticle({
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
                mainEntity: keywordFaqs.map(([name, text]) => ({
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
          <span aria-current="page">Keyword research</span>
        </nav>
        <header className="py-10">
          <p className="text-sm font-semibold tracking-wider text-blue-700 dark:text-blue-200">
            100 PROMPTS · TEN RESEARCH WORKFLOWS
          </p>
          <h1 className="mt-4 max-w-4xl text-4xl font-extrabold leading-tight tracking-tight sm:text-5xl">
            100 keyword research prompts for a useful content strategy
          </h1>
          <p className={body + " max-w-3xl"}>
            Start with audience needs, discover relevant phrases, review
            evidence, and decide what deserves a page. These prompts help you
            make specific research decisions.
          </p>
          <div className="mt-6 flex flex-wrap items-center gap-4">
            <Link
              href="/author/sufian-mustafa"
              className="inline-flex items-center gap-3"
            >
              <Image
                src="/sufi.jpeg"
                width={48}
                height={48}
                alt="Sufian Mustafa"
                className="rounded-full"
              />
              <span className="text-sm leading-6">
                <strong className="block">Sufian Mustafa</strong>Founder and
                author · Do It With AI Tools
              </span>
            </Link>
            <span className="text-sm text-slate-500 dark:text-slate-400">
              Published October 25, 2026
            </span>
          </div>
          <div className="mt-7 flex flex-wrap gap-3">
            <a
              className={button + " bg-[#4058D0] text-white dark:text-white"}
              href="#keyword-prompt-library"
            >
              Find your next prompt
            </a>
            <a className={button} href="#keyword-prompt-brief">
              Customize the shared brief
            </a>
            <Link className={button} href="/tools/keyword-research-tool">
              Use Keyword Research Tool
            </Link>
          </div>
        </header>
        <figure>
          <Image
            src="/prompts/keyword-research-prompts-hero.webp"
            width={1600}
            height={900}
            alt="100 keyword research prompts beside a desktop screen with discover, group, review, and copy prompt controls."
            priority
            sizes="(max-width: 1200px) 100vw, 1152px"
            className="h-auto w-full rounded-2xl"
          />
          <figcaption className="mt-3 text-sm leading-7 text-slate-500 dark:text-slate-400">
            Illustrative prompt workflow. The image does not display measured
            keyword performance.
          </figcaption>
        </figure>
        <section className="my-12 rounded-2xl border border-[#5271FF]/30 bg-[#5271FF]/5 p-6 sm:p-8">
          <h2 className="text-2xl font-bold">
            What this collection helps you do
          </h2>
          <p className={body}>
            Use prompts to explore candidate phrases, structure supplied data,
            compare reader tasks, and prepare content decisions. A prompt cannot
            substitute for unavailable research evidence.
          </p>
          <p className={body}>
            Volume, difficulty, rankings, traffic, and observed questions need
            identified sources. Each prompt keeps generated ideas separate from
            those measurements.
          </p>
          <p className={body}>
            If you are starting from scratch, use prompts 1, 11, 21, 41, and 94.
            Review the outputs between steps.
          </p>
        </section>
        <section className="mb-12">
          <h2 className="text-3xl font-bold">
            How to use these keyword research prompts
          </h2>
          <ol className="mt-6 grid gap-4 md:grid-cols-3">
            {[
              [
                "Prepare the source",
                "Give the assistant your real offer, audience, and market. Paste the specific article, export, or observations requested by the selected prompt.",
              ],
              [
                "Ask for a bounded output",
                "Keep the task specific. Preserve row IDs and source definitions so you can check whether the assistant skipped, altered, or invented information.",
              ],
              [
                "Review before publishing",
                "Verify metrics and quotations against the source. Compare actual search results before choosing page boundaries, and revise recommendations that do not fit your business.",
              ],
            ].map(([title, text], i) => (
              <li
                className="rounded-xl bg-slate-100 p-5 dark:bg-slate-900"
                key={title}
              >
                <span className="text-sm font-semibold text-blue-700 dark:text-blue-200">
                  Step {i + 1}
                </span>
                <h3 className="mt-2 text-xl font-bold">{title}</h3>
                <p className={body}>{text}</p>
              </li>
            ))}
          </ol>
        </section>
        <section className="mb-12">
          <h2 className="text-3xl font-bold">
            A short example before you start
          </h2>
          <p className={body}>
            Imagine a local coffee business offering beginner espresso classes.
            A broad seed such as “coffee” leaves the intended task unclear.
          </p>
          <p className={body}>
            Prompt 11 can suggest class comparisons, home-brewing problems, and
            gift-workshop queries. Prompt 21 then separates learning,
            comparison, and purchase tasks.
          </p>
          <p className={body}>
            Those phrases remain candidates. Prompt 42 requires actual
            ranking-URL notes before using search-result overlap to refine the
            proposed page groups.
          </p>
          <p className={body}>
            The useful outcome is a clearer decision about whom a page helps. It
            is not an invented search-volume table.
          </p>
        </section>
        <Library />
        <section className="my-14 rounded-2xl bg-[#101e43] p-6 text-white sm:p-8">
          <p className="text-sm font-semibold text-blue-200">
            PUT YOUR RESEARCH INTO PRACTICE
          </p>
          <h2 className="mt-3 text-3xl font-bold">
            Move from copied prompts to a working shortlist
          </h2>
          <p className="mt-4 max-w-3xl text-lg leading-9 text-slate-200">
            Our Keyword Research Tool organizes ideas, inferred intent,
            questions, and proposed page groups. Upload your own supported
            metrics and export a reviewed shortlist.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            {[
              ["keyword-research-tool", "Explore keyword ideas"],
              ["keyword-clustering-tool", "Review clusters"],
              ["search-intent-checker", "Review intent"],
              ["seo-content-brief-generator", "Prepare a brief"],
            ].map(([slug, label]) => (
              <Link
                className="inline-flex min-h-11 items-center justify-center rounded-xl border border-blue-200/40 px-4 py-3 text-sm font-semibold hover:bg-white/10"
                href={`/tools/${slug}`}
                key={slug}
              >
                {label}
              </Link>
            ))}
          </div>
          <p className="mt-4 text-sm leading-7 text-blue-100">
            The research tool currently displays uploaded volume data. It does
            not provide automatic live volume or observed Google questions.
          </p>
        </section>
        <section className="my-12">
          <h2 className="text-3xl font-bold">
            Important distinctions behind the prompts
          </h2>
          <div className="mt-6 grid gap-5 md:grid-cols-2">
            {[
              [
                "Primary and supporting keywords",
                "Choose a primary phrase around the page’s main task. Supporting terms should help explain that same task, rather than become a repetition quota.",
              ],
              [
                "Related concepts rather than an LSI checklist",
                "Prompt 15 reframes the LSI keyword request into useful concepts and natural vocabulary. It does not prescribe a special list or density target.",
              ],
              [
                "Competitor targeting and competitor traffic",
                "A heading can suggest a competitor’s intended topic. It cannot reveal actual rankings or traffic; prompts 31 and 32 handle these different evidence sources.",
              ],
              [
                "Difficulty and advertising competition",
                "Prompt 53 interprets a named provider’s supplied difficulty score. Prompt 54 prevents advertising competition from being relabeled as organic ranking difficulty.",
              ],
              [
                "Google research and YouTube research",
                "Video research needs platform-specific observations. Google volume should not be presented as YouTube volume; prompts 71–80 focus on viewer tasks and supplied platform evidence.",
              ],
              [
                "Keyword clusters and page boundaries",
                "A shared topic does not always imply one page. Review the reader task, existing content, and supplied search-result evidence before merging or splitting groups.",
              ],
            ].map(([title, text]) => (
              <section
                className="rounded-xl border border-slate-200 p-5 dark:border-slate-700"
                key={title}
              >
                <h3 className="text-xl font-bold">{title}</h3>
                <p className={body}>{text}</p>
              </section>
            ))}
          </div>
        </section>
        <section className="my-12">
          <h2 className="text-3xl font-bold">
            Read the workflow behind the prompt library
          </h2>
          <div className="mt-6 grid gap-5 md:grid-cols-2">
            {[
              [
                "/ai-seo/chatgpt-keyword-research",
                "Research keyword ideas with ChatGPT, then validate the data",
                "A shorter walkthrough for collecting context, checking evidence, and deciding which page to create.",
              ],
              [
                "/ai-seo/ai-vs-traditional-keyword-research",
                "Combine AI keyword ideas with reliable research data",
                "Understand how generated suggestions, research measurements, and human editorial decisions work together.",
              ],
              [
                "/prompts/chatgpt-prompts-for-search-intent",
                "Go deeper on search intent",
                "Use the focused six-prompt guide when intent is the main decision you need to resolve.",
              ],
              [
                "/prompts/chatgpt-prompts-for-meta-title-and-meta-description",
                "Turn a reviewed keyword into metadata",
                "Draft accurate titles and descriptions after the page purpose and target reader are clear.",
              ],
            ].map(([href, title, text]) => (
              <Link
                className="rounded-xl border border-slate-200 p-5 hover:border-[#5271FF] dark:border-slate-700"
                href={href}
                key={href}
              >
                <h3 className="text-xl font-bold">{title}</h3>
                <p className={body}>{text}</p>
                <span className="mt-4 inline-block text-sm font-semibold text-blue-700 dark:text-blue-200">
                  Read the related guide →
                </span>
              </Link>
            ))}
          </div>
        </section>
        <section className="my-12">
          <h2 className="text-3xl font-bold">Research notes and sources</h2>
          <p className={body}>
            These original prompts were organized after reviewing our existing
            guides and the sources below. They are not copied competitor prompt
            lists.
          </p>
          <ul className="mt-5 list-disc space-y-3 pl-5 text-base leading-8">
            {[
              [
                "https://ahrefs.com/blog/keyword-clustering/",
                "Ahrefs on clustering by similar intent",
              ],
              [
                "https://help.ahrefs.com/en/articles/72265-what-does-kd-stand-for-in-keywords-explorer",
                "Ahrefs on its provider-specific difficulty metric",
              ],
              [
                "https://www.semrush.com/blog/youtube-keyword-research/",
                "Semrush on YouTube keyword research",
              ],
              [
                "https://support.google.com/youtube/answer/9962575?hl=en",
                "YouTube on search relevance, engagement, and quality",
              ],
              [
                "https://developers.google.com/google-ads/api/docs/keyword-planning/generate-historical-metrics",
                "Google on historical keyword metrics",
              ],
            ].map(([href, label]) => (
              <li key={href}>
                <a
                  className="font-semibold text-blue-700 underline dark:text-blue-200"
                  href={href}
                >
                  {label}
                </a>
              </li>
            ))}
          </ul>
          <p className={body}>
            Ahrefs describes clustering around similar intent and defines its
            own difficulty metric. YouTube describes search using relevance,
            engagement, and quality, beyond keyword wording alone.
          </p>
          <p className={body}>
            These principles inform the workflows, not a guarantee of ranking
            gains. We have not benchmarked all prompts across every assistant or
            measured their search-performance effects.
          </p>
        </section>
        <section className="my-12">
          <h2 className="text-3xl font-bold">
            Questions about keyword research prompts
          </h2>
          <div className="mt-6 divide-y divide-slate-200 rounded-2xl border border-slate-200 px-5 dark:divide-slate-700 dark:border-slate-700">
            {keywordFaqs.map(([q, a]) => (
              <details className="py-5" key={q}>
                <summary className="cursor-pointer text-lg font-bold leading-8">
                  {q}
                </summary>
                <p className={body}>{a}</p>
              </details>
            ))}
          </div>
        </section>
        <div className="flex flex-wrap gap-3 pb-10">
          <a className={button} href="#keyword-prompt-brief">
            Customize your brief
          </a>
          <a className={button} href="#keyword-prompt-library">
            Return to the prompt library
          </a>
        </div>
      </div>
    </article>
  );
}
