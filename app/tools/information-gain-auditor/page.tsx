import type { Metadata } from "next";
import ToolLandingHero from "@/features/tool-ui/ToolLandingHero";
import Link from "next/link";
import {
  Award,
  Lightbulb,
  Sparkles,
  Table2,
} from "lucide-react";
import InformationGainAuditorClient from "@/features/information-gain-auditor/InformationGainAuditorClient";
import ToolFaq from "@/features/tool-ui/ToolFaq";
import ToolResources from "@/features/tool-catalog/ToolResources";

const pageUrl = "https://doitwithai.tools/tools/information-gain-auditor";
const title =
  "Free Information Gain & Originality Scorer | Audit SEO Content Value";
const description =
  "Measure how much net-new information your article adds beyond competing SERP pages across 6 concrete dimensions: unique entities, quantitative metrics, and testing proof.";

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: pageUrl },
  openGraph: {
    title,
    description,
    url: pageUrl,
    type: "website",
    images: ["https://doitwithai.tools/ogimage.png"],
  },
  twitter: {
    card: "summary_large_image",
    title,
    description,
    images: ["https://doitwithai.tools/ogimage.png"],
  },
};

const faqs = [
  {
    question: "What does Information Gain mean in SEO and AI Search?",
    answer:
      "Information Gain refers to the net-new facts, original data points, unique subtopics, or first-hand observations a document provides beyond what a reader has already seen in other top-ranking results on the same topic.",
  },
  {
    question: "How does this tool measure Information Gain without inventing fake metrics?",
    answer:
      "It evaluates 6 concrete, observable signals in your text compared against your competitor baseline: (1) Net-New Named Entities, (2) Quantitative Data & Percentages, (3) First-Hand Testing Phrasing ('we tested', 'our dataset'), (4) Structured Tables & Lists, (5) Unique H2/H3 Subheadings, and (6) Absence of Generic AI-Cliché Filler.",
  },
  {
    question: "Why do commodity articles struggle to win AI Overview citations?",
    answer:
      "When 10 articles repeat the exact same high-level summary, AI answer engines only need to cite one source for consensus and look to cite pages that supply unique statistics, edge cases, or structured comparison tables for the remaining slots.",
  },
  {
    question: "What files can I download?",
    answer:
      "You can export a 6-dimension Information Gain CSV scorecard or download an editable Word (.docx) Editorial Differentiation Brief.",
  },
];

const section = "mx-auto max-w-6xl px-4 py-12 sm:px-6";
const prose = "mt-4 text-base leading-8 text-slate-600 dark:text-slate-300";

export default function InformationGainAuditorPage() {
  const schema = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebApplication",
        name: "Information Gain & Originality Scorer",
        url: pageUrl,
        description,
        applicationCategory: "BusinessApplication",
        operatingSystem: "Any",
        isAccessibleForFree: true,
        offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { name: "Home", item: "https://doitwithai.tools" },
          { name: "Tools", item: "https://doitwithai.tools/tools" },
          { name: "Information Gain Auditor", item: pageUrl },
        ].map((item, i) => ({ "@type": "ListItem", position: i + 1, ...item })),
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
        slug="information-gain-auditor"
        title="Information Gain & Originality Scorer"
        description="Compare your draft against competing articles to measure net-new entities, quantitative proof points, practitioner testing evidence, and unique subheadings—while stripping out generic AI filler."
        categoryLabel="On-page SEO"
        categoryHref="/tools"
        workspaceId="tool-studio-workspace"
      >
        <div className="p-4 sm:p-6">
          <InformationGainAuditorClient />
        </div>
      </ToolLandingHero>

      <section
        className={`${section} border-t border-slate-200 dark:border-slate-800`}
      >
        <h2 className="text-3xl font-extrabold">
          Stand out from commodity summaries in both Google and AI search
        </h2>
        <p className={prose}>
          Publishing another reworded summary of the top 3 results rarely moves
          rankings on competitive keywords. Adding proprietary measurements,
          edge-case warnings, and structured exhibits gives both human readers
          and AI engines a reason to cite your page specifically.
        </p>

        <div className="mt-8 grid gap-5 md:grid-cols-3">
          {[
            [
              Lightbulb,
              "Net-New Entity Diffing",
              "See which named entities and technical concepts appear exclusively in your draft versus competitor copy.",
            ],
            [
              Table2,
              "Quantitative & Exhibit Check",
              "Verify that your article backs up assertions with concrete percentages, sample sizes, and tables.",
            ],
            [
              Award,
              "Cliché & Fluff Removal",
              "Flag tired AI-generated transitional phrases that dilute reader trust.",
            ],
          ].map(([Icon, heading, body]) => {
            const I = Icon as typeof Sparkles;
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
      </section>

      <section
        className={`${section} border-t border-slate-200 dark:border-slate-800`}
      >
        <h2 className="text-2xl font-extrabold">
          Complete Your On-Page Content Audit
        </h2>
        <p className={prose}>
          Check missing competitor topics first in the{" "}
          <Link
            href="/tools/semantic-entity-gap-analyzer"
            className="font-semibold text-[#3452d1] underline dark:text-[#9aabff]"
          >
            Semantic Entity & Competitor Gap Analyzer
          </Link>
          , verify authorship and trust signals in the{" "}
          <Link
            href="/tools/eeat-content-auditor"
            className="font-semibold text-[#3452d1] underline dark:text-[#9aabff]"
          >
            E-E-A-T & Helpful Content Auditor
          </Link>
          , and check AI crawler readiness in the{" "}
          <Link
            href="/tools/ai-citation-readiness-checker"
            className="font-semibold text-[#3452d1] underline dark:text-[#9aabff]"
          >
            AI Citation Readiness Checker
          </Link>
          .
        </p>
      </section>

      <ToolResources slug="information-gain-auditor" />
      <ToolFaq title="Information Gain & content originality questions" faqs={faqs} />
    </div>
  );
}
