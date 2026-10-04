import type { Metadata } from "next";
import Link from "next/link";
import { ScanText, FileCheck2, PencilLine } from "lucide-react";
import ReadabilityClient from "@/features/readability/ReadabilityClient";
import ToolResources from "@/features/tool-catalog/ToolResources";
const pageUrl = "https://doitwithai.tools/tools/readability-checker";
const description =
  "Check sentence variety, paragraph length, and wordy phrases. Compare AI revisions with natural flow and optional paragraph splitting. Review meaning before applying.";
const image = `https://doitwithai.tools/api/og?${new URLSearchParams({ title: "Readability Checker and Improver", category: "AI SEO · Content Writing", ctaText: "Inspect. Compare. Refine.", features: "Local Checks,3 Editing Directions,Meaning Review" })}`;
export const metadata: Metadata = {
  title: "Readability Checker and AI Improver",
  description,
  alternates: { canonical: pageUrl },
  openGraph: {
    title: "Readability Checker and AI Improver",
    description,
    url: pageUrl,
    type: "website",
    images: [{ url: image, width: 1200, height: 630 }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Readability Checker and AI Improver",
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
        name: "Readability Checker and Improver",
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
          { name: "Readability Checker", item: pageUrl },
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
              Readability Checker
            </span>
          </nav>
          <header className="mx-auto mb-14 mt-12 max-w-5xl text-center text-white">
            <p className="inline-flex rounded-full border border-white/15 bg-white/10 px-4 py-2 text-xs font-bold uppercase tracking-widest text-blue-100">
              AI SEO · Content Writing
            </p>
            <h1 className="mt-7 text-balance text-4xl font-black tracking-tight sm:text-6xl lg:text-7xl">
              Readability Checker and AI Improver
              <span className="mt-3 block text-balance bg-gradient-to-r from-blue-300 via-cyan-300 to-violet-300 bg-clip-text text-transparent">
                Make the Meaning Easier to Follow
              </span>
            </h1>
            <p className="mx-auto mt-6 max-w-3xl text-base leading-8 text-slate-300 sm:text-lg">
              Find passages worth reviewing, explore three editing directions,
              and compare important details before you replace your text.
            </p>
            <div className="mt-7 flex flex-wrap justify-center gap-3 text-xs font-bold text-slate-300">
              {[
                [ScanText, "Local passage checks"],
                [PencilLine, "Editable comparisons"],
                [FileCheck2, "Human meaning review"],
              ].map(([Icon, label]) => {
                const I = Icon as typeof ScanText;
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
          <ReadabilityClient />
        </div>
      </div>
      <div className="mx-auto max-w-7xl space-y-20 px-4 py-20 sm:px-6 lg:px-8">
        <section className="grid gap-8 lg:grid-cols-2">
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-[#4662df] dark:text-blue-300">
              Clarity depends on context
            </p>
            <h2 className="mt-3 text-3xl font-black sm:text-4xl">
              Write for a reader, rather than a number
            </h2>
            <p className="mt-5 text-sm leading-8 text-slate-600 dark:text-slate-300">
              Readability depends on wording, structure, background knowledge,
              and the task a reader wants to complete. Shortening every sentence
              cannot address all those needs.
            </p>
            <p className="mt-4 text-sm leading-8 text-slate-600 dark:text-slate-300">
              A technical term may be essential for specialists. Beginners may
              need an explanation, a clear example, or a smaller step before the
              same term becomes useful.
            </p>
            <p className="mt-4 text-sm leading-8 text-slate-600 dark:text-slate-300">
              This checker shows measurable editing cues. It does not assign a
              reading age, measure comprehension, certify accessibility, or
              predict search performance.
            </p>
          </div>
          <aside className="rounded-3xl bg-slate-950 p-8 text-white">
            <h3 className="text-xl font-extrabold">
              Keep the detail that makes the text accurate
            </h3>
            <p className="mt-4 text-sm leading-7 text-slate-300">
              A shorter version can lose a condition, change a number, or make a
              cautious statement sound certain. Check meaning before accepting
              an edit.
            </p>
            <p className="mt-4 text-sm leading-7 text-slate-300">
              Use the required-terms field for names, product terms, or
              vocabulary that should remain. Add the audience to guide the level
              of explanation.
            </p>
            <p className="mt-4 text-sm leading-7 text-slate-300">
              Compare claims, quantities, units, quotations, and qualifications
              against the submitted original. Literal preservation checks are
              prompts for review, not fact verification.
            </p>
          </aside>
        </section>
        <section>
          <h2 className="text-3xl font-black">What each observation means</h2>
          <div className="mt-7 grid gap-5 sm:grid-cols-2">
            {[
              [
                "Long sentence segments",
                "The default threshold flags more than 25 words. Choose 20 or 30 when useful. These thresholds are editorial preferences, not readability standards.",
              ],
              [
                "Paragraph length",
                "Flow review flags prose blocks above 100 words or four sentence segments. Break at changes of idea. Keep a condition beside the action it qualifies.",
              ],
              [
                "Sentence variety",
                "Compare the length sequence and short, medium, and fuller prose segments. Four consecutive short or similar-length segments prompt review. Lists follow a different rhythm.",
              ],
              [
                "Paragraph flow",
                "Group related sentences, usually two or three, with an occasional one-sentence paragraph. Vary size when useful. Repeated inline colons can signal awkward pseudo-lists.",
              ],
              [
                "Wordy phrases",
                "A small English phrase list suggests simpler alternatives. Read each phrase in context before changing it. The list cannot identify every difficult expression.",
              ],
              [
                "Repeated content words",
                "Some words occurring at least three times are listed. Repetition can maintain clarity, especially for technical terms. Do not replace precise terms simply to vary vocabulary.",
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
          <p className="mt-5 text-xs leading-7 text-slate-500">
            Words are counted as letter or number tokens, including internal
            apostrophes and hyphens. Sentence boundaries use English
            segmentation where available, with a simpler fallback.
          </p>
        </section>
        <section>
          <p className="text-xs font-bold uppercase tracking-widest text-[#4662df] dark:text-blue-300">
            An editorial example
          </p>
          <h2 className="mt-3 text-3xl font-black">
            Simplify the wording without strengthening the claim
          </h2>
          <div className="mt-7 grid gap-5 lg:grid-cols-2">
            <div className="rounded-3xl bg-slate-50 p-7 dark:bg-slate-900">
              <h3 className="text-sm font-bold">Before</h3>
              <p className="mt-4 text-sm leading-8 text-slate-600 dark:text-slate-300">
                Due to the fact that AI can miss important context, a human
                editor should check every claim before making the decision to
                publish.
              </p>
            </div>
            <div className="rounded-3xl border border-blue-200 bg-blue-50 p-7 dark:border-blue-900 dark:bg-blue-950/30">
              <h3 className="text-sm font-bold">After</h3>
              <p className="mt-4 text-sm leading-8 text-slate-600 dark:text-slate-300">
                Because AI can miss important context, a human editor should
                check every claim before publishing.
              </p>
            </div>
          </div>
          <p className="mt-5 text-sm leading-7 text-slate-600 dark:text-slate-400">
            The revision simplifies the lead-in while keeping the reason and
            action connected. It preserves the uncertainty and the strength of
            the original advice.
          </p>
        </section>
        <section>
          <h2 className="text-3xl font-black">
            Three editing directions, three useful trade-offs
          </h2>
          <div className="mt-7 grid gap-5 md:grid-cols-3">
            {[
              [
                "Light edit",
                "Preserve the original voice and structure while reducing friction. Use this when the draft already fits its reader and needs focused cleanup.",
              ],
              [
                "Plain language",
                "Use familiar words with varied sentence lengths and connected ideas. Keep precise terms, useful emphasis, and qualifications. Simpler language can still carry necessary detail.",
              ],
              [
                "Easy to scan",
                "Split dense prose where the idea changes. Use real lists only when appropriate. Preserve transitions, conditions, and the relationship between ideas.",
              ],
            ].map(([title, text], i) => (
              <article
                key={title}
                className="rounded-3xl border border-slate-200 p-6 dark:border-slate-800"
              >
                <p className="text-3xl font-black text-blue-200 dark:text-blue-800">
                  0{i + 1}
                </p>
                <h3 className="mt-4 text-lg font-bold">{title}</h3>
                <p className="mt-3 text-sm leading-7 text-slate-600 dark:text-slate-400">
                  {text}
                </p>
              </article>
            ))}
          </div>
        </section>
        <section className="max-w-4xl">
          <h2 className="text-3xl font-black">Readability questions</h2>
          <div className="mt-7 space-y-4">
            {[
              [
                "Can I check text without using AI?",
                "Yes. Counts, highlights, phrase matches, and repeated-word observations run locally as you type. Only the revision request sends text to the provider.",
              ],
              [
                "Does the tool calculate Flesch or a school grade?",
                "No. This version focuses on transparent passage checks. It does not estimate syllables, reading age, school grade, or a formula-based readability score.",
              ],
              [
                "Will a shorter revision rank better?",
                "This tool does not predict rankings or traffic. Choose wording that helps your reader understand the actual topic and preserves accurate detail.",
              ],
              [
                "Does it verify that AI kept the meaning?",
                "No. Literal checks flag certain numbers, required terms, and caution words. They can miss meaningful changes or flag harmless rewording.",
              ],
              [
                "Can the tool split a long paragraph?",
                "Yes. Paragraph splitting is requested by default. It groups related ideas and uses blank lines. Turn it off to request existing boundaries, then review the output.",
              ],
              [
                "Should every sentence be short?",
                "No. Mix concise emphasis with fuller explanations where useful. Transitions should clarify existing relationships. Length bands are review cues, not universal readability rules.",
              ],
              [
                "Can I revise a complete long article?",
                "Work section by section within the 4500-character source limit. Review transitions and overall structure separately when combining edited sections.",
              ],
              [
                "Will changing the source overwrite my comparison?",
                "No. The comparison preserves the submitted original. Failed regeneration keeps previous revisions and edits. Successful regeneration creates a new comparison.",
              ],
              [
                "How do I save the revision?",
                "Copy or download the selected text. Apply a revision to the source only after review. Local work is lost on refresh, so save it before leaving.",
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
            href="https://www.w3.org/WAI/tips/writing/"
            className="text-[#4662df] underline dark:text-blue-300"
          >
            W3C writing guidance
          </a>
          ,{" "}
          <a
            href="https://prowritingaid.com/art/346/How-to-use...-The-Sentence-Length-Report.aspx"
            className="text-[#4662df] underline dark:text-blue-300"
          >
            ProWritingAid sentence variety guidance
          </a>
          , and{" "}
          <a
            href="https://www.stylemanual.gov.au/structuring-content/paragraphs"
            className="text-[#4662df] underline dark:text-blue-300"
          >
            paragraph structure guidance
          </a>
          . For your wider workflow, use the{" "}
          <Link
            href="/tools/article-outline-generator"
            className="text-[#4662df] underline dark:text-blue-300"
          >
            Article Outline Generator
          </Link>{" "}
          to review structure before editing individual sections.
        </p>
      </div>
      <ToolResources slug="readability-checker" />
    </>
  );
}
