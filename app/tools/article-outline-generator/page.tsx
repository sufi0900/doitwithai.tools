import type { Metadata } from "next";
import Link from "next/link";
import { BookOpen, Layers3, ListChecks, PencilLine } from "lucide-react";
import OutlineClient from "@/features/article-outline/OutlineClient";
import ToolResources from "@/features/tool-catalog/ToolResources";
const pageUrl = "https://doitwithai.tools/tools/article-outline-generator";
const description =
  "Plan an article around your reader's intent. Compare H1, H2, and H3 alternatives, edit section notes, and export a structured writing outline.";
const image = `https://doitwithai.tools/api/og?${new URLSearchParams({ title: "Article Outline Generator", category: "AI SEO · Content Writing", ctaText: "Plan. Compare. Refine.", features: "Heading Alternatives,Writing Notes,Markdown Export" })}`;
export const metadata: Metadata = {
  title: "AI Article Outline Generator",
  description,
  alternates: { canonical: pageUrl },
  openGraph: {
    title: "AI Article Outline Generator",
    description,
    url: pageUrl,
    type: "website",
    images: [{ url: image, width: 1200, height: 630 }],
  },
  twitter: {
    card: "summary_large_image",
    title: "AI Article Outline Generator",
    description,
    images: [image],
  },
};
export default function Page() {
  const schema = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebApplication",
        name: "Article Outline Generator",
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
          { name: "Article Outline Generator", item: pageUrl },
        ].map((s, i) => ({ "@type": "ListItem", position: i + 1, ...s })),
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
      <div className="relative overflow-hidden bg-slate-950 pb-20 pt-10 sm:pt-16">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,rgba(255,255,255,0.08)_1px,transparent_0)] bg-[size:28px_28px]"
        />
        <div
          aria-hidden
          className="absolute -left-32 top-10 h-96 w-96 rounded-full bg-[#5271ff]/25 blur-3xl"
        />
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <nav
            aria-label="Breadcrumb"
            className="flex flex-wrap gap-2 text-xs text-slate-400"
          >
            <Link href="/">Home</Link>
            <span>/</span>
            <Link href="/tools">Tools</Link>
            <span>/</span>
            <span aria-current="page" className="text-blue-200">
              Article Outline Generator
            </span>
          </nav>
          <header className="mx-auto mb-14 mt-12 max-w-5xl text-center text-white">
            <p className="inline-flex rounded-full border border-white/15 bg-white/10 px-4 py-2 text-xs font-bold uppercase tracking-widest text-blue-100">
              AI SEO · Content Writing
            </p>
            <h1 className="mt-7 text-4xl font-black tracking-tight sm:text-6xl lg:text-7xl">
              AI Article Outline Generator
              <span className="mt-3 block text-balance bg-gradient-to-r from-blue-300 via-cyan-300 to-violet-300 bg-clip-text text-transparent">
                Give Every Section a Purpose
              </span>
            </h1>
            <p className="mx-auto mt-6 max-w-3xl text-base leading-8 text-slate-300 sm:text-lg">
              Turn your title and context into a reader-focused article plan.
              Choose heading alternatives, shape the structure, and gather
              evidence before you draft.
            </p>
            <div className="mt-7 flex flex-wrap justify-center gap-3 text-xs font-bold text-slate-300">
              {[
                [Layers3, "H1 / H2 / H3 structure"],
                [PencilLine, "Editable writing notes"],
                [ListChecks, "Human review"],
              ].map(([Icon, label]) => {
                const I = Icon as typeof Layers3;
                return (
                  <span
                    key={label as string}
                    className="inline-flex items-center gap-2 rounded-full border border-white/10 px-3 py-2"
                  >
                    <I aria-hidden className="h-4 w-4 text-blue-300" />
                    {label as string}
                  </span>
                );
              })}
            </div>
          </header>
          <OutlineClient />
        </div>
      </div>
      <div className="mx-auto max-w-7xl space-y-20 px-4 py-20 sm:px-6 lg:px-8">
        <section className="grid gap-8 lg:grid-cols-2">
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-[#4662df] dark:text-blue-300">
              Plan before you write
            </p>
            <h2 className="mt-3 text-3xl font-black tracking-tight sm:text-4xl">
              An outline is a sequence of reader decisions
            </h2>
            <p className="mt-5 text-sm leading-8 text-slate-600 dark:text-slate-300">
              A useful article outline goes beyond a list of headings. It
              explains what each section should answer and how those answers fit
              together.
            </p>
            <p className="mt-4 text-sm leading-8 text-slate-600 dark:text-slate-300">
              Begin with the reader&apos;s problem, establish necessary context,
              and arrange the practical steps or comparisons in a logical order.
              Remove sections that repeat an answer.
            </p>
            <p className="mt-4 text-sm leading-8 text-slate-600 dark:text-slate-300">
              This generator uses your stated intent and notes. It does not
              inspect search results, verify competitor coverage, or promise
              rankings.
            </p>
          </div>
          <aside className="rounded-3xl bg-slate-950 p-8 text-white">
            <BookOpen aria-hidden className="h-7 w-7 text-blue-300" />
            <h3 className="mt-5 text-xl font-bold">
              Bring something the reader cannot get from a generic brief
            </h3>
            <p className="mt-4 text-sm leading-7 text-slate-300">
              Add your audience, a distinct angle, real examples, and
              boundaries. Name evidence you already have, and mark material that
              still needs research.
            </p>
            <p className="mt-4 text-sm leading-7 text-slate-300">
              For a tool review, provide verified features and your actual
              testing notes. For a tutorial, provide the process and the
              reader&apos;s starting level.
            </p>
            <p className="mt-4 text-sm leading-7 text-slate-300">
              The resulting plan should guide your work. It should not invent
              experience or replace a source review.
            </p>
          </aside>
        </section>
        <section>
          <h2 className="text-3xl font-black">
            Match the structure to the reader&apos;s task
          </h2>
          <div className="mt-7 grid gap-5 sm:grid-cols-2">
            {[
              [
                "Learning a subject",
                "Define essential concepts before introducing practical details. Use examples to explain difficult ideas, then close with an application or next step.",
              ],
              [
                "Completing a task",
                "Establish prerequisites, order the steps, and address likely mistakes. Finish with a practical check that helps the reader use the result.",
              ],
              [
                "Comparing options",
                "Explain comparison criteria before discussing differences. Gather evidence for each option, then close with a decision framework tied to real needs.",
              ],
              [
                "Making a decision",
                "Identify constraints, trade-offs, and questions to investigate. End with a specific decision process instead of a vague promotional recommendation.",
              ],
            ].map(([title, text]) => (
              <article
                key={title}
                className="rounded-2xl border border-slate-200 p-6 dark:border-slate-800"
              >
                <h3 className="font-extrabold">{title}</h3>
                <p className="mt-3 text-sm leading-7 text-slate-600 dark:text-slate-400">
                  {text}
                </p>
              </article>
            ))}
          </div>
        </section>
        <section>
          <p className="text-xs font-bold uppercase tracking-widest text-[#4662df] dark:text-blue-300">
            Illustrative example
          </p>
          <h2 className="mt-3 text-3xl font-black">
            From a broad title to a purposeful outline
          </h2>
          <p className="mt-4 max-w-3xl text-sm leading-7 text-slate-600 dark:text-slate-400">
            For an AI blog-writing guide, the brief could specify beginners, a
            human-led process, tested prompt examples, and a final quality
            review.
          </p>
          <div className="mt-7 grid gap-6 lg:grid-cols-2">
            <div className="rounded-3xl bg-slate-50 p-7 dark:bg-slate-900">
              <h3 className="font-extrabold">A possible heading sequence</h3>
              <ol className="mt-4 space-y-3 text-sm leading-7 text-slate-600 dark:text-slate-300">
                {[
                  "H1: How to Plan and Write a Blog Post With AI",
                  "H2: Define the Reader and the Article's Job",
                  "H2: Build a Brief Before Asking for a Draft",
                  "H3: Add Source Notes and Clear Boundaries",
                  "H2: Draft and Review One Section at a Time",
                  "H2: Check Claims Against Your Evidence",
                  "H2: Prepare Your Article for a Human Review",
                ].map((s) => (
                  <li key={s}>{s}</li>
                ))}
              </ol>
            </div>
            <div className="rounded-3xl border border-slate-200 p-7 dark:border-slate-800">
              <h3 className="font-extrabold">
                Three options for a useful closing section
              </h3>
              <ul className="mt-4 space-y-3 text-sm leading-7 text-slate-600 dark:text-slate-300">
                <li>Prepare Your Article for a Human Review</li>
                <li>Use a Final Check Before Publishing Your Draft</li>
                <li>Turn Your Draft Into a Reviewed Article</li>
              </ul>
              <p className="mt-5 text-sm leading-7 text-slate-600 dark:text-slate-400">
                Each heading names a real task. The section can bring together
                checks for accuracy, originality, flow, and the published page.
              </p>
              <p className="mt-4 text-xs leading-6 text-slate-500">
                This is an editorial example, not a generated or validated
                search-results analysis.
              </p>
            </div>
          </div>
        </section>
        <section>
          <h2 className="text-3xl font-black">
            How to review the generated outline
          </h2>
          <div className="mt-7 grid gap-5 md:grid-cols-3">
            {[
              [
                "01",
                "Choose a coherent angle",
                "Check that the H1 represents the whole article. Select section alternatives that fit the same audience and scope.",
              ],
              [
                "02",
                "Keep meaningful hierarchy",
                "Use H2s for main sections and H3s for related subsections. Reorder sections around the reader's needs, rather than adding headings for length.",
              ],
              [
                "03",
                "Gather evidence before drafting",
                "Treat opening approaches as suggestions. Verify source notes, add firsthand material where available, and remove claims you cannot support.",
              ],
            ].map(([n, title, text]) => (
              <article
                key={n}
                className="rounded-3xl border border-slate-200 p-6 dark:border-slate-800"
              >
                <p className="text-3xl font-black text-blue-200 dark:text-blue-800">
                  {n}
                </p>
                <h3 className="mt-4 text-lg font-bold">{title}</h3>
                <p className="mt-3 text-sm leading-7 text-slate-600 dark:text-slate-400">
                  {text}
                </p>
              </article>
            ))}
          </div>
          <p className="mt-6 text-sm leading-7 text-slate-600 dark:text-slate-400">
            The heading counter and duplicate check inspect the draft&apos;s
            structure. They do not measure topical completeness, accessibility
            compliance, or search performance.
          </p>
        </section>
        <section className="max-w-4xl">
          <h2 className="text-3xl font-black">Article outline questions</h2>
          <div className="mt-7 space-y-4">
            {[
              [
                "Does this tool write the whole article?",
                "No. It creates headings and planning notes. Use the approved outline to draft one section at a time, then review your evidence and wording.",
              ],
              [
                "Can I use a title without context?",
                "The generator requires a short context brief. A title alone rarely explains the intended audience, scope, boundaries, or original value.",
              ],
              [
                "Are these outlines automatically SEO optimized?",
                "They support clear organization and your supplied reader intent. They cannot confirm search demand, perform live competitor research, or guarantee visibility.",
              ],
              [
                "Why are there three options for each heading?",
                "Alternative wording lets you choose the best expression of a section's purpose. Review its planning notes when you change the scope.",
              ],
              [
                "Why does the closing have its own heading?",
                "A specific closing heading can introduce a practical next action or decision. The generator avoids generic closing labels while preserving the article's final section.",
              ],
              [
                "What does the depth control mean?",
                "Focused generates four to five body sections, balanced five to six, and detailed seven to eight. Introduction and closing are additional sections.",
              ],
              [
                "How can I save my outline?",
                "Copy the outline or download Markdown. Export headings alone or include writing notes. The workspace does not save local edits after refresh.",
              ],
            ].map(([q, a]) => (
              <details
                key={q}
                className="rounded-2xl border border-slate-200 p-5 dark:border-slate-800"
              >
                <summary className="cursor-pointer text-sm font-bold">
                  {q}
                </summary>
                <p className="mt-4 text-sm leading-7 text-slate-600 dark:text-slate-400">
                  {a}
                </p>
              </details>
            ))}
          </div>
        </section>
        <p className="text-sm leading-7 text-slate-500">
          Review{" "}
          <a
            className="text-[#4662df] underline dark:text-blue-300"
            href="https://developers.google.com/search/docs/fundamentals/creating-helpful-content"
          >
            Google&apos;s people-first content guidance
          </a>{" "}
          and{" "}
          <a
            className="text-[#4662df] underline dark:text-blue-300"
            href="https://www.w3.org/WAI/tutorials/page-structure/headings/"
          >
            W3C&apos;s heading guidance
          </a>
          . For a stronger brief, explore our{" "}
          <Link
            className="text-[#4662df] underline dark:text-blue-300"
            href="/ai-seo/chatgpt-target-audience-research"
          >
            audience research guide
          </Link>
          .
        </p>
      </div>
      <ToolResources slug="article-outline-generator" />
    </>
  );
}
