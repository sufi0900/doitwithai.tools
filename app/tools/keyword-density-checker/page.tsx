import type { Metadata } from "next";
import { Suspense } from "react";
import Link from "next/link";
import {
  ToolHeroBackground,
  toolHeroHeading,
  toolHeroSurface,
} from "@/features/tool-ui/ToolHero";
import Client from "@/features/keyword-density/Client";
import ToolResources from "@/features/tool-catalog/ToolResources";
const pageUrl = "https://doitwithai.tools/tools/keyword-density-checker";
const description =
  "Check keyword density, target phrase coverage, and distribution. Compare body matches with page fields, inspect highlighted context, and export reports.";
const image = `https://doitwithai.tools/api/og?${new URLSearchParams({ title: "Keyword Density Checker", category: "SEO · Content Editing", ctaText: "Count. Inspect. Edit.", features: "Phrase Counts,Context Highlights,Live Counts" })}`;
export const metadata: Metadata = {
  title: "Free Keyword Density and Coverage Checker",
  description,
  alternates: { canonical: pageUrl },
  openGraph: {
    title: "Keyword Density Checker",
    description,
    url: pageUrl,
    type: "website",
    images: [{ url: image, width: 1200, height: 630 }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Keyword Density Checker",
    description,
    images: [image],
  },
};
const prose = "mt-4 text-base leading-8 text-slate-600 dark:text-slate-300";
const faqs = [
  [
    "Does keyword coverage measure topical completeness?",
    "No. It reports exact normalized matches for the phrases you supply. Synonyms and relevant ideas may communicate the same topic without matching those phrases.",
  ],
  [
    "How is distribution measured?",
    "The body is divided into thirds by word-token position. Each occurrence belongs to the third where it starts. No particular distribution is required.",
  ],
  [
    "Do page titles and headings change the body density?",
    "Optional page fields are checked separately. They never enter the body denominator. Leave them blank to mark those fields as not supplied.",
  ],
  [
    "Is there an ideal keyword density?",
    "This tool does not prescribe a percentage. Use frequency to inspect wording, then judge relevance, accuracy, and readability in context.",
  ],
  [
    "Does a high count mean keyword stuffing?",
    "No. A technical topic can naturally repeat a term. Counts alone cannot establish intent, quality, or a search policy violation.",
  ],
  [
    "Do I need to create an account?",
    "No. Paste your text to start checking phrases, inspect highlighted matches, and download your report.",
  ],
  [
    "How are multiword phrases counted?",
    "Each matching sequence counts once, including overlaps. Occurrences are divided by the total word count. This is not the percentage of words covered.",
  ],
  [
    "Does punctuation affect matching?",
    "Case differences and common apostrophe or hyphen variants are normalized. Sentence punctuation and line breaks stop multiword matches. Commas do not stop a match.",
  ],
  [
    "What does the stop-word option change?",
    "It hides discovered phrases starting or ending with common English words. It does not change total words or counts for your supplied targets.",
  ],
  [
    "Can I check a URL?",
    "This version accepts pasted text only. Copy the article body without menus or footers to keep counts focused on the content you want to edit.",
  ],
  [
    "How long can my article be?",
    "You can paste up to 150,000 characters. Counts cover the full supplied text. Split longer documents into sections.",
  ],
  [
    "Does keyword frequency measure search demand?",
    "No. These counts describe your supplied text. They do not measure search volume, keyword difficulty, rankings, or audience demand.",
  ],
  [
    "Which languages work?",
    "Word matching supports Unicode letters and numbers. The stop-word filter is English only. Languages without word spacing need a language-specific segmenter for reliable counts.",
  ],
];
export default function Page() {
  const schema = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebApplication",
        name: "Keyword Density Checker",
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
          { name: "Keyword Density Checker", item: pageUrl },
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
            <span>/</span>
            <Link href="/tools">Tools</Link>
            <span>/</span>
            <span aria-current="page" className="text-blue-200">
              Keyword Density Checker
            </span>
          </nav>
          <header className="mx-auto mb-12 mt-12 max-w-5xl text-center text-white">
            <p className="inline-flex rounded-full border border-[#5271FF]/40 bg-[#5271FF]/15 px-4 py-2 text-xs font-bold uppercase tracking-widest text-[#AEBBFF]">
              Free content editing tool
            </p>
            <h1 className="mt-7 text-4xl font-black tracking-tight sm:text-6xl lg:text-7xl">
              Keyword Density Checker
              <span className={`mt-3 block text-balance ${toolHeroHeading}`}>
                Find Repetition. Keep Your Meaning.
              </span>
            </h1>
            <p className="mx-auto mt-6 max-w-3xl text-base leading-8 text-slate-300 sm:text-lg">
              Count words and phrases, inspect repeated wording in context, and
              spot paragraphs worth reviewing.
            </p>
          </header>
          <Client />
        </div>
      </section>
      <div className="mx-auto max-w-5xl space-y-14 px-4 py-16 sm:px-6">
        <section>
          <h2 className="text-3xl font-black">
            Review your phrase plan across the page
          </h2>
          <p className={prose}>
            Add one focus phrase first, followed by supporting phrases. The
            coverage workspace shows which targets appear in the body and
            supplied page fields.
          </p>
          <p className={prose}>
            Paste the title, description, and headings into the optional fields.
            These placement checks stay separate from body frequency.
          </p>
          <p className={prose}>
            Use the distribution cards to inspect the beginning, middle, and
            end. A technical definition may repeat a phrase naturally within one
            section.
          </p>
          <p className={prose}>
            Occurrences per 100 words count matches. Matched-word coverage
            counts distinct body words occupied by your plan, without
            double-counting overlaps.
          </p>
          <p className={prose}>
            For example, “AI writing tools” occupies three words. A second
            target such as “writing tools” can overlap those words without
            increasing their combined coverage.
          </p>
          <p className={prose}>
            Missing exact wording is a prompt to read the passage. It does not
            prove that a topic is missing or needs another keyword insertion.
          </p>
          <p className={prose}>
            Export the coverage CSV to keep phrase counts, first-match
            positions, paragraph presence, distribution, and optional field
            matches together.
          </p>
        </section>
        <section>
          <h2 className="text-3xl font-black">How to check keyword density</h2>
          <ol className="mt-6 grid gap-5 sm:grid-cols-3">
            {[
              [
                "1. Paste the main text",
                "Copy your article or page body. Leave out menus, footers, and unrelated widgets.",
              ],
              [
                "2. Inspect your phrases",
                "Add target phrases or explore discovered one-word, two-word, and three-word combinations.",
              ],
              [
                "3. Review before editing",
                "Select a phrase, read its highlighted context, and decide whether repetition helps or distracts.",
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
          <h2 className="text-3xl font-black">What keyword density measures</h2>
          <p className={prose}>
            Keyword density describes how often a word or phrase appears
            relative to a text’s length. It helps you inspect wording, rather
            than predict rankings.
          </p>
          <div className="mt-5 rounded-2xl bg-slate-100 p-5 dark:bg-slate-800">
            <p className="font-bold">Occurrences ÷ total source words × 100</p>
            <p className={prose}>
              A phrase appearing five times in 500 words has one occurrence per
              100 words, shown as 1% in this report.
            </p>
          </div>
          <p className={prose}>
            For a three-word phrase, this percentage still counts occurrences.
            It does not count all words occupied by the phrase or represent
            search engine importance.
          </p>
          <p className={prose}>
            The word total includes common words such as “the” and “and.” Hiding
            stop words changes the discovered phrase list, not the denominator.
          </p>
        </section>
        <section>
          <h2 className="text-3xl font-black">
            Find repetition that a whole-article percentage can hide
          </h2>
          <p className={prose}>
            An article can have a modest overall frequency while repeating the
            same phrase several times in one paragraph. Local context makes that
            easier to notice.
          </p>
          <p className={prose}>
            Select a phrase to see its matching passages highlighted. The
            paragraph list shows where that wording is most concentrated.
          </p>
          <p className={prose}>
            A short definition may naturally repeat a technical term. A
            promotional paragraph may repeat a phrase without adding useful
            detail. Read both before changing them.
          </p>
          <p className={prose}>
            The context preview shows up to 20,000 characters near the first
            match, with at most 200 highlighted ranges. Full-text counts remain
            unchanged.
          </p>
          <p className={prose}>
            Overlapping occurrences count separately. In “very very very,” the
            phrase “very very” occurs twice. Highlighted ranges merge so the
            text remains readable.
          </p>
        </section>
        <section>
          <h2 className="text-3xl font-black">
            Understand how phrase matching works
          </h2>
          <div className="mt-6 overflow-x-auto rounded-2xl border border-slate-200 dark:border-slate-700">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-100 dark:bg-slate-800">
                <tr>
                  <th scope="col" className="p-4">
                    Situation
                  </th>
                  <th scope="col" className="p-4">
                    Counting behavior
                  </th>
                </tr>
              </thead>
              <tbody>
                {[
                  ["AI tools and ai tools", "Case differences are ignored."],
                  ["AI, tools", "The comma does not stop a phrase match."],
                  [
                    "AI. Tools",
                    "The sentence boundary stops the two-word match.",
                  ],
                  [
                    "An internal hyphen",
                    "A hyphenated expression counts as one word.",
                  ],
                  [
                    "A blank line",
                    "Starts a new paragraph for distribution counts.",
                  ],
                  [
                    "A word absent from the text",
                    "Its supplied target count is zero.",
                  ],
                ].map(([a, b]) => (
                  <tr
                    key={a}
                    className="border-t border-slate-200 dark:border-slate-700"
                  >
                    <th scope="row" className="p-4 font-medium">
                      {a}
                    </th>
                    <td className="p-4 leading-7">{b}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className={prose}>
            Matching uses Unicode letters and numbers, with common apostrophe
            and hyphen variants normalized. It does not infer synonyms, plurals,
            entities, or search intent.
          </p>
          <p className={prose}>
            English stop words can be filtered from discovered phrases. For
            another language, disable that filter. Languages without word
            spacing need dedicated segmentation.
          </p>
        </section>
        <section>
          <h2 className="text-3xl font-black">
            Avoid editing toward an arbitrary percentage
          </h2>
          <p className={prose}>
            Use frequency to identify passages worth reviewing. Judge each
            occurrence by clarity, relevance, and usefulness.
          </p>
          <p className={prose}>
            Keep precise terms when readers need them. Remove repeated wording
            when it makes sentences awkward, distracts from the point, or adds
            no meaning.
          </p>
          <p className={prose}>
            Google’s{" "}
            <a
              href="https://developers.google.com/search/docs/essentials/spam-policies#keyword-stuffing"
              className="text-primary underline dark:text-blue-300"
              rel="noopener noreferrer"
            >
              spam policies
            </a>{" "}
            address unnatural keyword repetition. Use the highlighted context to
            make an editorial decision, rather than chasing a universal target.
          </p>
        </section>
        <section>
          <h2 className="text-3xl font-black">
            Keep a useful record of your edits
          </h2>
          <p className={prose}>
            Counts update as you edit. Inspect the highlighted context to decide
            which repeated phrases are useful and which need attention.
          </p>
          <p className={prose}>
            Download your report before leaving or refreshing the page. Your
            draft is not saved between visits.
          </p>
          <p className={prose}>
            The CSV includes target phrases and discovered phrases with their
            counts, phrase length, and occurrence rate. The interface shows only
            the top 50 per length.
          </p>
          <p className={prose}>
            Use the export to compare editorial revisions. It records text
            frequency, not a forecast of traffic or search performance.
          </p>
        </section>
        <section>
          <h2 className="text-3xl font-black">
            Connect frequency checks with a reader-focused workflow
          </h2>
          <p className={prose}>
            Start with the reader task using our{" "}
            <Link
              href="/tools/search-intent-checker"
              className="text-primary underline dark:text-blue-300"
            >
              Keyword Intent Checker
            </Link>
            . Keyword repetition cannot replace a clear purpose or useful
            evidence.
          </p>
          <p className={prose}>
            Review difficult sentences with the{" "}
            <Link
              href="/tools/readability-checker"
              className="text-primary underline dark:text-blue-300"
            >
              Readability Checker
            </Link>{" "}
            and explore our{" "}
            <Link
              href="/ai-seo/ai-readability-tools"
              className="text-primary underline dark:text-blue-300"
            >
              readability guide
            </Link>
            . Keep important terms accurate while improving flow.
          </p>
          <p className={prose}>
            For planning, use the{" "}
            <Link
              href="/tools/seo-content-brief-generator"
              className="text-primary underline dark:text-blue-300"
            >
              SEO Content Brief Generator
            </Link>
            . Group research queries with the{" "}
            <Link
              href="/tools/keyword-clustering-tool"
              className="text-primary underline dark:text-blue-300"
            >
              Keyword Clustering Tool
            </Link>{" "}
            before drafting.
          </p>
        </section>
        <section>
          <h2 className="text-3xl font-black">
            Keyword density checker questions
          </h2>
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
        <ToolResources slug="keyword-density-checker" />
      </Suspense>
    </>
  );
}
