import type { Metadata } from "next";
import ToolLandingHero from "@/features/tool-ui/ToolLandingHero";
import Link from "next/link";
import {
  BarChart3,
  FileCheck2,
  ScanText,
  ShieldCheck,
} from "lucide-react";
import Client from "@/features/keyword-density/Client";
import ToolFaq from "@/features/tool-ui/ToolFaq";
import ToolResources from "@/features/tool-catalog/ToolResources";

const pageUrl = "https://doitwithai.tools/tools/keyword-density-checker";
const title =
  "Free Keyword Density & Phrase Coverage Checker | On-Page SEO Tool";
const description =
  "Check 1-to-4 word phrase frequency, target keyword placement across title/H1/body thirds, and in-context passage repetition. Export clean CSV coverage reports.";
const image = `https://doitwithai.tools/api/og?${new URLSearchParams({
  title: "Keyword Density Checker",
  category: "SEO · Content Editing",
  ctaText: "Count. Inspect. Edit.",
  features: "Phrase Counts,Context Highlights,Live Counts",
})}`;

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: pageUrl },
  openGraph: {
    title: "Keyword Density & Phrase Coverage Checker",
    description,
    url: pageUrl,
    type: "website",
    images: [{ url: image, width: 1200, height: 630 }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Keyword Density & Phrase Coverage Checker",
    description,
    images: [image],
  },
};

const section = "mx-auto max-w-6xl px-4 py-12 sm:px-6";
const prose = "mt-4 text-base leading-8 text-slate-600 dark:text-slate-300";

const faqs = [
  {
    question: "Does keyword coverage measure topical completeness?",
    answer:
      "No. It reports exact normalized matches for the phrases you supply. Synonyms, related entities, and clear explanations often communicate the topic without repeating the exact string.",
  },
  {
    question: "How is beginning, middle, and end distribution measured?",
    answer:
      "Your article body is divided into three equal thirds by word-token position. Each phrase match belongs to the third where it begins, helping you see whether mentions cluster in a single section.",
  },
  {
    question: "Do page titles and headings change the body density percentage?",
    answer:
      "No. Optional title, meta description, H1, and H2 fields are checked separately for placement coverage and never inflate your body word count denominator.",
  },
  {
    question: "Is there an ideal keyword density percentage for Google SEO?",
    answer:
      "No universal percentage guarantees rankings. Use phrase frequency to spot unnatural repetition or missing topic cues, then edit for clarity, accuracy, and reader usefulness.",
  },
  {
    question: "How are multi-word phrases (2-word, 3-word, 4-word) counted?",
    answer:
      "Each matching word sequence counts as one occurrence and is divided by total source words × 100. Sentence boundaries and line breaks stop multi-word spans, while commas do not.",
  },
  {
    question: "What does the English stop-word filter change?",
    answer:
      "It hides discovered n-grams that begin or end with common English function words (like 'the', 'and', 'of') so topical phrases stand out. It never alters your total word count or supplied target counts.",
  },
  {
    question: "What reports can I export from the checker?",
    answer:
      "You can download a UTF-8 CSV containing both your target phrase coverage across page fields and the top discovered 1–4 word n-grams.",
  },
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
        isAccessibleForFree: true,
        offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { name: "Home", item: "https://doitwithai.tools" },
          { name: "Tools", item: "https://doitwithai.tools/tools" },
          { name: "Keyword Density Checker", item: pageUrl },
        ].map((v, i) => ({ "@type": "ListItem", position: i + 1, ...v })),
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
    <div className="bg-white text-slate-900 dark:bg-[#0F1523] dark:text-white">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(schema).replace(/</g, "\\u003c"),
        }}
      />

      <ToolLandingHero
        slug="keyword-density-checker"
        title="Keyword Density Checker & Phrase Coverage Analyzer"
        description="Paste your article draft to inspect 1-to-4 word phrase frequency, check target keyword placement across title, H1, and body thirds, and spot over-repeated passages in context."
        categoryLabel="On-Page SEO"
        categoryHref="/tools"
        workspaceId="tool-studio-workspace"
      >
        <div className="p-4 sm:p-6">
          <p className="text-xs font-bold uppercase tracking-wider text-[#5271ff]">
          Context over arbitrary percentages
        </p>
        <h2 className="mt-3 text-3xl font-extrabold">
          Inspect phrase coverage, section distribution, and paragraph-level
          repetition
        </h2>
        <p className={prose}>
          A whole-article frequency score can hide the fact that the same phrase
          repeats four times inside a single paragraph. Checking phrase
          locations alongside your title, meta description, and headings helps
          you keep key terminology clear without robotic keyword stuffing.
        </p>

        <div className="mt-8 grid gap-5 md:grid-cols-3">
          {[
            [
              ScanText,
              "Highlight Matches in Context",
              "Select any target or discovered phrase to highlight every occurrence across your paragraphs so you can judge natural flow before editing.",
            ],
            [
              BarChart3,
              "Track Placement Across Fields",
              "Compare body occurrences against optional Title, Meta Description, H1, and H2–H3 inputs without distorting your body word denominator.",
            ],
            [
              FileCheck2,
              "Export Full Coverage CSV",
              "Download a clean CSV report recording target phrase counts, beginning/middle/end distribution, and top 1–4 word n-gram frequencies.",
            ],
          ].map(([Icon, heading, body]) => {
            const I = Icon as typeof ShieldCheck;
            return (
              <div
                key={String(heading)}
                className="rounded-2xl border border-slate-200 p-6 dark:border-slate-700"
              >
                <I aria-hidden className="text-[#5271ff]" size={22} />
                <h3 className="mt-4 text-lg font-bold">{String(heading)}</h3>
                <p className="mt-2 text-sm leading-7 text-slate-600 dark:text-slate-300">
                  {String(body)}
                </p>
              </div>
            );
          })}
        </div>
        </div>
      </ToolLandingHero>

      <section
        className={`${section} border-t border-slate-200 dark:border-slate-800`}
      >
        <h2 className="text-2xl font-extrabold">
          How phrase normalization and token matching work
        </h2>
        <p className={prose}>
          Frequency is calculated as{" "}
          <code>occurrences ÷ total source words × 100</code>. Punctuation and
          casing are normalized so you get consistent counts across drafts:
        </p>
        <div className="mt-6 overflow-x-auto rounded-2xl border border-slate-200 dark:border-slate-700">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-100 dark:bg-slate-800">
              <tr>
                <th scope="col" className="p-4 font-bold">
                  Text Pattern
                </th>
                <th scope="col" className="p-4 font-bold">
                  Counting Behavior
                </th>
              </tr>
            </thead>
            <tbody>
              {[
                [
                  "Case variations (AI Tools vs. ai tools)",
                  "Normalized to lowercase so capitalization never splits counts.",
                ],
                [
                  "Internal commas (AI, tools)",
                  "Commas do not break a multi-word phrase match.",
                ],
                [
                  "Sentence stops (AI. Tools)",
                  "Periods, question marks, and line breaks stop multi-word spans.",
                ],
                [
                  "Hyphenated words (on-page)",
                  "Counted as a single normalized word token.",
                ],
                [
                  "Stop-word toggle enabled",
                  "Filters discovered n-grams starting or ending with common English stop words without changing total word count.",
                ],
              ].map(([a, b]) => (
                <tr
                  key={a}
                  className="border-t border-slate-200 dark:border-slate-700"
                >
                  <th scope="row" className="p-4 font-semibold">
                    {a}
                  </th>
                  <td className="p-4 leading-7 text-slate-600 dark:text-slate-300">
                    {b}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section
        className={`${section} border-t border-slate-200 dark:border-slate-800`}
      >
        <h2 className="text-2xl font-extrabold">
          Related On-Page SEO &amp; Content Editing Tools
        </h2>
        <p className={prose}>
          Verify reader intent before drafting with our{" "}
          <Link
            href="/tools/search-intent-checker"
            className="font-semibold text-[#3452d1] underline dark:text-[#9aabff]"
          >
            Search Intent Checker
          </Link>
          , compare entity coverage against top-ranking pages in the{" "}
          <Link
            href="/tools/semantic-entity-gap-analyzer"
            className="font-semibold text-[#3452d1] underline dark:text-[#9aabff]"
          >
            Semantic Entity &amp; Competitor Gap Analyzer
          </Link>
          , and polish complex sentences with the{" "}
          <Link
            href="/tools/readability-checker"
            className="font-semibold text-[#3452d1] underline dark:text-[#9aabff]"
          >
            Readability Checker
          </Link>
          .
        </p>
      </section>

      <ToolResources slug="keyword-density-checker" />
      <ToolFaq title="Keyword density & phrase coverage questions" faqs={faqs} />
    </div>
  );
}
