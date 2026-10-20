import {
  ToolHeroBackground,
  toolHeroSurface,
  toolHeroHeading,
} from "@/features/tool-ui/ToolHero";
import type { Metadata } from "next";
import Link from "next/link";
import { ScanText, FileCheck2, Gauge, Wand2 } from "lucide-react";
import ReadabilityClient from "@/features/readability/ReadabilityClient";
import { issueStyles } from "@/features/readability/components/styles";
import type { IssueType } from "@/features/readability/engine";
import ToolResources from "@/features/tool-catalog/ToolResources";

const pageUrl = "https://doitwithai.tools/tools/readability-checker";
const description =
  "Free readability checker with live highlights, an estimated grade, and one-click fixes. Optional AI rewrites for selected text. Your draft stays in your browser.";
const image = `https://doitwithai.tools/api/og?${new URLSearchParams({ title: "Readability Checker and Improver", category: "AI SEO · Content Writing", ctaText: "Highlight. Fix. Refine.", features: "Live Highlights,Estimated Grade,Optional AI Rewrite" })}`;

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

const colorGuide: Array<[IssueType, string]> = [
  [
    "veryHard",
    "A long, dense sentence. It has at least 14 words and an estimated level of 14 or higher. Split it at a change of idea.",
  ],
  [
    "hard",
    "A heavy sentence. It has at least 14 words and an estimated level from 10 to 13. Cut words or shorten it.",
  ],
  [
    "passive",
    "A form of be followed by a past participle, such as was written. Name who does the action when that helps.",
  ],
  [
    "adverb",
    "Words ending in ly, minus common exceptions such as family. A stronger verb often works better.",
  ],
  [
    "weakener",
    "Hedges and filler such as really or I think. Some hedges protect accuracy, so cut only the empty ones.",
  ],
  [
    "simpler",
    "A complex word or wordy phrase from a small list. One click swaps in the plainer option.",
  ],
];

const faqs = [
  {
    question: "Does this readability checker need AI?",
    answer:
      "No. Highlights, the grade estimate, stats, and one-click fixes run in your browser. AI is optional and only runs when you ask for revisions of a passage.",
  },
  {
    question: "How is the grade calculated?",
    answer:
      "It uses the ARI formula: 4.71 times letters per word, plus 0.5 times words per sentence, minus 21.43. The result is an estimate for editing, not a verdict on comprehension.",
  },
  {
    question: "Is this the same score as Hemingway Editor?",
    answer:
      "Not necessarily. We follow a publicly documented analysis of how Hemingway-style tools work. This is an independent tool, and results can differ from Hemingway's own.",
  },
  {
    question: "Why are some sentences red and others amber?",
    answer:
      "Sentences under 14 words are never flagged. Longer ones are amber at an estimated level of 10 to 13 and red at 14 or higher.",
  },
  {
    question: "Should I remove every highlight?",
    answer:
      "No. Highlights are prompts. Technical text, quotations, and careful hedging can be correct as written. Keep wording that protects accuracy and meaning.",
  },
  {
    question: "Does a lower grade help my rankings?",
    answer:
      "This tool does not predict rankings or traffic. Clear writing helps readers, and that is the goal. Choose wording that fits your audience and keeps details accurate.",
  },
  {
    question: "Does the tool verify that AI kept the meaning?",
    answer:
      "No. Literal checks flag changed numbers, missing required terms, and dropped caution words. They can miss meaningful changes, so always read the revision against the original.",
  },
  {
    question: "Where is my draft stored?",
    answer:
      "Your draft autosaves in this browser only. Use Clear text to remove it. Avoid confidential information, and note that AI revisions send just the passage you choose.",
  },
  {
    question: "How much text can I check?",
    answer:
      "The editor accepts up to 30,000 characters. AI revisions work on a selected passage of 40 to 4,500 characters, so long articles can be improved section by section.",
  },
  {
    question: "Can it fix grammar and spelling?",
    answer:
      "No. This tool focuses on clarity and style. Your browser's spellcheck still underlines misspellings, but there is no dedicated grammar checker.",
  },
];

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
        isAccessibleForFree: true,
        offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
        featureList: [
          "Live highlights for hard sentences, passive voice, adverbs, weakeners, and simpler words",
          "Estimated grade, reading time, and document stats",
          "One-click fixes with undo",
          "Optional AI revisions for a selected passage",
          "Draft autosave in the browser",
        ],
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { name: "Home", item: "https://doitwithai.tools" },
          { name: "Tools", item: "https://doitwithai.tools/tools" },
          { name: "Readability Checker", item: pageUrl },
        ].map((s, i) => ({ "@type": "ListItem", position: i + 1, ...s })),
      },
      {
        "@type": "FAQPage",
        mainEntity: faqs.map((f) => ({
          "@type": "Question",
          name: f.question,
          acceptedAnswer: { "@type": "Answer", text: f.answer },
        })),
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
      <div
        className={`relative overflow-hidden ${toolHeroSurface} pb-20 pt-10 sm:pt-16`}
      >
        <ToolHeroBackground />
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
              <span className={`mt-3 block text-balance ${toolHeroHeading}`}>
                Make the Meaning Easier to Follow
              </span>
            </h1>
            <p className="mx-auto mt-6 max-w-3xl text-base leading-8 text-slate-300 sm:text-lg">
              Paste your draft and see hard sentences, passive voice, adverbs,
              and wordy phrases highlighted as you type. Fix them in one click,
              or compare AI revisions for a passage you select.
            </p>
            <div className="mt-7 flex flex-wrap justify-center gap-3 text-xs font-bold text-slate-300">
              {[
                [ScanText, "Live highlights"],
                [Gauge, "Estimated grade"],
                [Wand2, "One-click fixes"],
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
              need an explanation, an example, or a smaller step first.
            </p>
            <p className="mt-4 text-sm leading-8 text-slate-600 dark:text-slate-300">
              This checker shows an estimated grade and editing cues. They guide
              your edits. They do not measure comprehension, certify
              accessibility, or predict search performance.
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
              Use the required-terms field for names and product terms that
              must stay. Add the audience to guide the level of explanation.
            </p>
            <p className="mt-4 text-sm leading-7 text-slate-300">
              Compare claims, quantities, units, and qualifications against the
              original. Literal checks are prompts for review, not fact
              verification.
            </p>
          </aside>
        </section>

        <section>
          <h2 className="text-3xl font-black">What each highlight means</h2>
          <p className="mt-3 max-w-3xl text-sm leading-8 text-slate-600 dark:text-slate-300">
            Every category has its own color and underline style, so the meaning
            never depends on color alone. Click a highlight in the editor to see
            why it is marked.
          </p>
          <div className="mt-7 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {colorGuide.map(([type, text]) => (
              <article
                key={type}
                className="rounded-2xl border border-slate-200 p-6 dark:border-slate-800"
              >
                <h3 className="flex items-center gap-3 font-extrabold">
                  <span
                    aria-hidden
                    className={`h-3.5 w-3.5 rounded-sm ${issueStyles[type].swatch}`}
                  />
                  {issueStyles[type].label}
                </h3>
                <p className="mt-3 text-sm leading-7 text-slate-600 dark:text-slate-400">
                  {text}
                </p>
              </article>
            ))}
          </div>
        </section>

        <section className="grid gap-8 lg:grid-cols-2">
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-[#4662df] dark:text-blue-300">
              Open about the math
            </p>
            <h2 className="mt-3 text-3xl font-black">
              How the estimated grade works
            </h2>
            <p className="mt-5 text-sm leading-8 text-slate-600 dark:text-slate-300">
              The grade uses the Automated Readability Index. It looks at word
              length and sentence length, then rounds to a whole grade.
            </p>
            <pre className="mt-5 overflow-x-auto rounded-2xl bg-slate-950 p-5 text-xs leading-7 text-blue-100">
              <code>
                {"grade = 4.71 × (letters ÷ words)\n      + 0.5 × (words ÷ sentences)\n      − 21.43"}
              </code>
            </pre>
            <p className="mt-5 text-sm leading-8 text-slate-600 dark:text-slate-300">
              Sentence colors use the same formula on one sentence at a time.
              The method follows a publicly documented analysis of Hemingway-style
              editors. It is an independent estimate, not the vendor&apos;s own
              calculation.
            </p>
          </div>
          <ul className="space-y-3 text-sm leading-7 text-slate-600 dark:text-slate-300">
            {[
              "Letters and digits count as characters. Punctuation and spaces do not.",
              "Fenced code blocks are skipped. Headings count but are never flagged.",
              "Reading time assumes 238 words per minute. Speaking time assumes 150.",
              "Flesch scores use an approximate syllable counter, so treat them as estimates.",
              "Adverb, passive, and hedge lists are small editorial lists. They cannot catch everything.",
            ].map((item) => (
              <li
                key={item}
                className="rounded-2xl border border-slate-200 p-5 dark:border-slate-800"
              >
                {item}
              </li>
            ))}
          </ul>
        </section>

        <section>
          <h2 className="text-3xl font-black">
            How this tool compares with Hemingway Editor
          </h2>
          <p className="mt-3 max-w-3xl text-sm leading-8 text-slate-600 dark:text-slate-300">
            Hemingway Editor is a well-known standard for plain writing. We are
            an independent tool with a similar goal and a smaller scope. Here is
            an honest side-by-side.
          </p>
          <div className="mt-7 overflow-x-auto rounded-2xl border border-slate-200 dark:border-slate-800">
            <table className="w-full min-w-[560px] text-left text-sm">
              <caption className="sr-only">
                Feature comparison between this readability checker and Hemingway Editor
              </caption>
              <thead className="bg-slate-50 text-xs uppercase tracking-wider dark:bg-slate-900">
                <tr>
                  <th scope="col" className="p-4">Feature</th>
                  <th scope="col" className="p-4">This tool</th>
                  <th scope="col" className="p-4">Hemingway Editor</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 text-slate-600 dark:divide-slate-800 dark:text-slate-300">
                {[
                  ["Live highlights in the text", "Yes", "Yes"],
                  ["Estimated grade level", "Yes", "Yes"],
                  ["Reading time and stats", "Yes", "Yes"],
                  ["One-click word and phrase fixes", "Yes, free", "Part of a paid plan"],
                  ["AI rewrite", "Optional, on a selected passage", "Part of a paid plan"],
                  ["Literal meaning and number checks on revisions", "Yes", "No"],
                  ["Grammar and spelling checker", "No", "Part of a paid plan"],
                ].map(([feature, ours, theirs]) => (
                  <tr key={feature}>
                    <th scope="row" className="p-4 font-bold text-slate-900 dark:text-white">
                      {feature}
                    </th>
                    <td className="p-4">{ours}</td>
                    <td className="p-4">{theirs}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="mt-4 text-xs leading-7 text-slate-500">
            Hemingway details come from its public site and may change. We are
            not affiliated with Hemingway Editor or its owners.
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
            Three AI editing directions, three useful trade-offs
          </h2>
          <div className="mt-7 grid gap-5 md:grid-cols-3">
            {[
              [
                "Light edit",
                "Preserve the original voice and structure while reducing friction. Use this when the draft already fits its reader and needs focused cleanup.",
              ],
              [
                "Plain language",
                "Use familiar words with varied sentence lengths and connected ideas. Keep precise terms, useful emphasis, and qualifications.",
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
            {faqs.map((f) => (
              <details
                key={f.question}
                className="rounded-2xl border border-slate-200 p-5 dark:border-slate-800"
              >
                <summary className="cursor-pointer text-sm font-bold">
                  {f.question}
                </summary>
                <p className="mt-4 text-sm leading-7 text-slate-600 dark:text-slate-400">
                  {f.answer}
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
