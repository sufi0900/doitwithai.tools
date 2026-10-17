import type { Metadata } from "next";
import { Suspense } from "react";
import Link from "next/link";
import {
  ArrowRight,
  FileCheck2,
  ListChecks,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import {
  ToolHeroBackground,
  toolHeroSurface,
  toolHeroHeading,
} from "@/features/tool-ui/ToolHero";
import FaqGeneratorClient from "@/features/faq-generator/Client";
import ToolResources from "@/features/tool-catalog/ToolResources";
const pageUrl = "https://doitwithai.tools/tools/ai-faq-generator";
const description =
  "Generate FAQs from your article or product notes. Compare answers with matched source quotes, identify research gaps, and export reviewed FAQs as Markdown or HTML.";
const image = `https://doitwithai.tools/api/og?${new URLSearchParams({ title: "AI FAQ Generator", category: "AI SEO · Content Writing", ctaText: "Source. Review. Publish.", features: "Source Quotes,Research Gaps,Editable FAQs" })}`;
export const metadata: Metadata = {
  title: "Free AI FAQ Generator from Text | Source-Backed Answer Drafts",
  description,
  alternates: { canonical: pageUrl },
  openGraph: {
    title: "AI FAQ Generator",
    description,
    url: pageUrl,
    type: "website",
    images: [{ url: image, width: 1200, height: 630 }],
  },
  twitter: {
    card: "summary_large_image",
    title: "AI FAQ Generator",
    description,
    images: [image],
  },
};
const prose = "mt-4 text-base leading-8 text-slate-600 dark:text-slate-300";
const faqs = [
  [
    "How does this FAQ generator use my source?",
    "It selects supplied text passages and asks AI to draft questions and answers from them. Answer drafts must include quotes that match selected passages.",
  ],
  [
    "Does a matched quote prove the answer is correct?",
    "No. A quote match confirms text exists in your source. You must check whether it supports every claim and whether the source remains accurate.",
  ],
  [
    "Can I analyze a long article?",
    "Yes. Paste up to 60,000 characters. The AI receives at most 14,000 normalized source characters, with partial coverage clearly shown before generation.",
  ],
  [
    "Why did a question become a research task?",
    "The selected material did not support an answer, or returned evidence failed matching. Add relevant information or check omitted passages before answering.",
  ],
  [
    "Does this pull Google People Also Ask questions?",
    "No. Questions are supplied by you or suggested by AI. They are not live search data, verified audience questions, or measured keyword opportunities.",
  ],
  [
    "Will FAQ markup create a Google rich result?",
    "Google discontinued FAQ rich results in May 2026. This tool focuses on helpful content and reviewed exports, without rich-result or AI citation guarantees.",
  ],
  [
    "Why can the result contain fewer FAQs than requested?",
    "Your selected count is a maximum. A short source may support only a few distinct, useful answers. The tool avoids padding the result.",
  ],
  [
    "What if Gemini cannot generate the FAQs?",
    "The shared provider workflow can try configured Groq after eligible Gemini failures. Clear errors preserve your source and previous result.",
  ],
  [
    "Can I edit and export answers?",
    "Yes. Edit each answer, compare its quotes, and select reviewed items. Download Markdown, an escaped HTML accordion, or separate editorial review notes.",
  ],
  [
    "Are sources saved in my browser?",
    "The tool keeps its form and results in page memory. It does not save them to local storage. AI generation sends supplied text to the server.",
  ],
];
export default function Page() {
  const schema = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebApplication",
        name: "AI FAQ Generator",
        url: pageUrl,
        description,
        applicationCategory: "BusinessApplication",
        operatingSystem: "Any",
        browserRequirements: "Requires JavaScript",
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { name: "Home", item: "https://doitwithai.tools" },
          { name: "Tools", item: "https://doitwithai.tools/tools" },
          { name: "AI FAQ Generator", item: pageUrl },
        ].map((v, i) => ({ "@type": "ListItem", position: i + 1, ...v })),
      },
    ],
  };
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(schema).replace(/</g, "\\u003c"),
        }}
      />
      <section
        className={`relative overflow-hidden ${toolHeroSurface} pb-20 pt-10 sm:pt-16`}
      >
        <ToolHeroBackground />
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <nav
            aria-label="Breadcrumb"
            className="flex flex-wrap gap-2 text-xs text-slate-400"
          >
            <Link href="/">Home</Link>
            <span aria-hidden>/</span>
            <Link href="/tools">Tools</Link>
            <span aria-hidden>/</span>
            <span aria-current="page" className="text-blue-200">
              AI FAQ Generator
            </span>
          </nav>
          <header className="mx-auto mb-12 mt-12 max-w-5xl text-center text-white">
            <p className="inline-flex items-center gap-2 rounded-full border border-[#5271FF]/40 bg-[#5271FF]/15 px-4 py-2 text-xs font-bold uppercase tracking-widest text-[#AEBBFF]">
              <Sparkles className="h-4 w-4" aria-hidden />
              Source-first content writing
            </p>
            <h1 className="mt-7 text-4xl font-black tracking-tight sm:text-6xl lg:text-7xl">
              AI FAQ Generator
              <span className={`mt-3 block text-balance ${toolHeroHeading}`}>
                Trace Every Answer Back to Your Text
              </span>
            </h1>
            <p className="mx-auto mt-6 max-w-3xl text-base leading-8 text-slate-300 sm:text-lg">
              Turn your article into useful questions and answer drafts. Inspect
              the source quotes, resolve missing information, and export only
              what you have reviewed.
            </p>
            <div className="mt-7 flex flex-wrap justify-center gap-3 text-xs font-bold text-slate-300">
              {[
                [FileCheck2, "Matched source quotes"],
                [ShieldCheck, "Missing evidence stays visible"],
                [ListChecks, "Editor-controlled exports"],
              ].map(([Icon, label]) => {
                const I = Icon as typeof FileCheck2;
                return (
                  <span
                    key={String(label)}
                    className="inline-flex items-center gap-2 rounded-full border border-[#5271FF]/25 bg-[#5271FF]/10 px-3 py-2"
                  >
                    <I className="h-4 w-4 text-[#9AABFF]" aria-hidden />
                    {String(label)}
                  </span>
                );
              })}
            </div>
          </header>
          <FaqGeneratorClient />
        </div>
      </section>
      <div className="mx-auto max-w-5xl space-y-16 px-4 py-16 sm:px-6">
        <section>
          <h2 className="text-3xl font-black">
            How to create FAQs from an article
          </h2>
          <ol className="mt-6 grid gap-5 sm:grid-cols-3">
            {[
              [
                "1. Supply useful source material",
                "Paste the article or product notes. Add the intended reader and any questions you already need to answer.",
              ],
              [
                "2. Compare answers with evidence",
                "Read each supporting passage. Check that the proposed answer preserves its limits, exceptions, dates, and meaning.",
              ],
              [
                "3. Review and export",
                "Edit the drafts, select reviewed answers, and export your chosen format. Keep research tasks separate from publishable FAQs.",
              ],
            ].map(([h, t]) => (
              <li
                key={h}
                className="rounded-2xl border border-slate-200 p-5 dark:border-slate-700"
              >
                <h3 className="font-bold">{h}</h3>
                <p className={prose}>{t}</p>
              </li>
            ))}
          </ol>
        </section>
        <section>
          <h2 className="text-3xl font-black">
            An FAQ generator with a visible evidence trail
          </h2>
          <p className={prose}>
            A fluent answer can still introduce a feature, price, or promise
            your page never supported. Checking the wording alone may miss that
            problem.
          </p>
          <p className={prose}>
            This tool keeps the answer beside matching source quotes. Open the
            full selected passage to check context, then decide whether the
            answer is suitable.
          </p>
          <p className={prose}>
            The match checks whether quoted text appears in the supplied
            passage. It does not prove truth, accuracy, completeness, or logical
            support for every statement.
          </p>
          <p className={prose}>
            Use the source wording button when you prefer an extract over a
            paraphrase. Review the resulting wording before including it in your
            FAQ section.
          </p>
        </section>
        <section>
          <h2 className="text-3xl font-black">
            Turn missing answers into a research plan
          </h2>
          <p className={prose}>
            Some useful questions need details your article does not contain.
            Shipping a confident guess can mislead readers and create extra
            editing work.
          </p>
          <p className={prose}>
            Unsupported answers become research tasks. Add the missing product
            details, first-hand observations, or reliable references to your
            source, then generate again.
          </p>
          <div className="mt-6 overflow-x-auto rounded-2xl border border-slate-200 dark:border-slate-700">
            <table className="w-full text-left text-sm">
              <caption className="p-4 text-left text-xs text-slate-500">
                Illustrative editorial decisions, not generated search data
              </caption>
              <thead className="bg-slate-100 dark:bg-slate-800">
                <tr>
                  {[
                    "Reader question",
                    "Source situation",
                    "Useful next step",
                  ].map((h) => (
                    <th key={h} scope="col" className="p-4">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[
                  [
                    "Does this tool have a free plan?",
                    "The notes describe features but omit pricing.",
                    "Check the current pricing source before answering.",
                  ],
                  [
                    "Can title length guarantee full display?",
                    "The article explains that display space varies.",
                    "Draft an answer that preserves this limitation.",
                  ],
                  [
                    "Does this process guarantee a ranking?",
                    "No ranking evidence is supplied.",
                    "Avoid the guarantee and research the claim.",
                  ],
                ].map((row) => (
                  <tr
                    key={row[0]}
                    className="border-t border-slate-200 dark:border-slate-700"
                  >
                    {row.map((cell, i) => (
                      <td key={i} className="p-4 leading-7">
                        {cell}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
        <section>
          <h2 className="text-3xl font-black">
            Long articles with a clear reading budget
          </h2>
          <p className={prose}>
            You can paste up to 60,000 characters of source text. To control API
            use, the AI receives at most 14,000 normalized characters.
          </p>
          <p className={prose}>
            For longer sources, passage selection samples the beginning, middle,
            and end. It then prioritizes passages matching your topic and custom
            questions.
          </p>
          <p className={prose}>
            The coverage preview shows the selected passages before you
            generate. Partial coverage means the tool has not analyzed every
            paragraph.
          </p>
          <p className={prose}>
            A missing answer may exist in an omitted passage. For important
            questions, paste a focused source section or add the relevant
            evidence and try again.
          </p>
          <p className={prose}>
            The tool sends text only. It does not fetch URLs, download media,
            run a website crawl, or make a second AI call for each edit.
          </p>
        </section>
        <section>
          <h2 className="text-3xl font-black">
            Write questions your readers actually need
          </h2>
          <p className={prose}>
            Our{" "}
            <Link
              href="/ai-seo/chatgpt-target-audience-research"
              className="text-primary underline dark:text-blue-300"
            >
              audience research guide
            </Link>{" "}
            explores needs, experience, and pain points. Use that context to
            choose helpful questions, rather than repeating headings as filler.
          </p>
          <p className={prose}>
            Bring real questions from customer conversations, support messages,
            or your own research when available. AI suggestions alone do not
            establish audience demand.
          </p>
          <p className={prose}>
            Check a topic with the{" "}
            <Link
              href="/tools/search-intent-checker"
              className="text-primary underline dark:text-blue-300"
            >
              Search Intent Checker
            </Link>{" "}
            when the reader task is unclear. Keep generated question ideas
            separate from measured search volume.
          </p>
        </section>
        <section>
          <h2 className="text-3xl font-black">
            Choose an export that fits your workflow
          </h2>
          <dl className="mt-6 grid gap-4 sm:grid-cols-3">
            {[
              [
                "Markdown",
                "Move reviewed questions and answers into your article draft.",
              ],
              [
                "HTML accordion",
                "Use escaped details and summary markup without generated scripts or external dependencies.",
              ],
              [
                "Editorial review notes",
                "Keep source quotes, draft answers, and research tasks together for a writer or reviewer.",
              ],
            ].map(([h, t]) => (
              <div
                key={h}
                className="rounded-2xl border border-slate-200 p-5 dark:border-slate-700"
              >
                <dt className="font-bold">{h}</dt>
                <dd className="mt-3 text-sm leading-7 text-slate-600 dark:text-slate-300">
                  {t}
                </dd>
              </div>
            ))}
          </dl>
          <p className={prose}>
            Only selected answer drafts enter FAQ exports. Editing a question or
            answer clears its review selection so you can check the revised
            version.
          </p>
        </section>
        <section className="rounded-2xl border border-amber-300/50 bg-amber-50 p-6 dark:bg-amber-400/5">
          <h2 className="text-2xl font-black">
            Helpful content comes before search promises
          </h2>
          <p className={prose}>
            Google discontinued FAQ rich results in May 2026, as recorded in its{" "}
            <a
              href="https://developers.google.com/search/updates"
              className="text-primary underline dark:text-blue-300"
              rel="noopener noreferrer"
            >
              documentation updates
            </a>
            . FAQ content can still help readers navigate practical questions.
          </p>
          <p className={prose}>
            This generator does not promise rankings, rich results, AI
            citations, or People Also Ask inclusion. It supports an editorial
            workflow with human review.
          </p>
        </section>
        <section>
          <h2 className="text-3xl font-black">
            Connect FAQs with your wider content plan
          </h2>
          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            {[
              [
                "/tools/seo-content-brief-generator",
                "Prepare a writer handoff",
                "Plan the purpose, scope, and evidence requirements before drafting.",
              ],
              [
                "/tools/article-outline-generator",
                "Organize the article",
                "Place useful answers within a clear heading structure.",
              ],
              [
                "/tools/readability-checker",
                "Review the wording",
                "Check long sentences and edit answers without losing their meaning.",
              ],
              [
                "/tools/internal-link-opportunity-finder",
                "Find relevant next steps",
                "Review links to useful supporting pages after the article is ready.",
              ],
            ].map(([href, h, t]) => (
              <Link
                key={href}
                href={href}
                className="rounded-2xl border border-slate-200 p-5 hover:border-[#5271FF] dark:border-slate-700"
              >
                <h3 className="flex items-center gap-2 font-bold">
                  {h}
                  <ArrowRight className="h-4 w-4" aria-hidden />
                </h3>
                <p className="mt-2 text-sm leading-7 text-slate-600 dark:text-slate-300">
                  {t}
                </p>
              </Link>
            ))}
          </div>
        </section>
        <section>
          <h2 className="text-3xl font-black">AI FAQ generator questions</h2>
          <div className="mt-6 divide-y divide-slate-200 rounded-2xl border border-slate-200 px-5 dark:divide-slate-700 dark:border-slate-700">
            {faqs.map(([q, a]) => (
              <details key={q} className="py-5">
                <summary className="cursor-pointer font-bold leading-7">
                  {q}
                </summary>
                <p className={prose}>{a}</p>
              </details>
            ))}
          </div>
        </section>
      </div>
      <Suspense fallback={null}>
        <ToolResources slug="ai-faq-generator" />
      </Suspense>
    </>
  );
}
