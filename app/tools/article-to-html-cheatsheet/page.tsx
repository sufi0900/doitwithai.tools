import type { Metadata } from "next";
import Link from "next/link";
import { Download, LayoutGrid, Printer } from "lucide-react";
import ArticleToHtmlCheatsheetClient from "@/features/article-to-html-cheatsheet/ArticleToHtmlCheatsheetClient";
import ToolFaq from "@/features/tool-ui/ToolFaq";
import ToolResources from "@/features/tool-catalog/ToolResources";
import {
  ToolHeroBackground,
  toolHeroHeading,
  toolHeroSurface,
} from "@/features/tool-ui/ToolHero";

const pageUrl = "https://doitwithai.tools/tools/article-to-html-cheatsheet";
const title =
  "Free Article to HTML Infographic & 1-Page Summary Cheatsheet Builder";
const description =
  "Distill any long-form article or URL into a standalone, print-ready 1-page visual HTML cheatsheet with KPI metric cards, step-by-step boxes, and Do's & Don'ts.";

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
    question: "How does embedding a 1-page HTML cheatsheet improve SEO and backlinks?",
    answer:
      "Adding a downloadable 1-page visual summary or cheatsheet at the top or bottom of a long guide increases reader dwell time, boosts social shares, and gives other bloggers and journalists a linkable reference asset to cite.",
  },
  {
    question: "Does the exported HTML file require any external CSS or JavaScript libraries?",
    answer:
      "No. The downloaded .HTML file is 100% self-contained with inline responsive CSS and print media queries, so it opens cleanly in any browser or prints directly to a 1-page PDF.",
  },
  {
    question: "Can I launch this tool directly from the DoItWithAI Chrome Extension?",
    answer:
      "Yes! Clicking 'HTML Cheatsheet Studio' inside the Convert Page tab of our Chrome Extension automatically pre-fills the active tab's URL right into this workspace.",
  },
  {
    question: "Can I use the generated cheatsheet as a lead magnet?",
    answer:
      "Absolutely. Click 'Print / Save PDF' or 'Download .HTML' to offer a clean 1-page checklist companion alongside your 3,000-word guides.",
  },
];

const section = "mx-auto max-w-6xl px-4 py-12 sm:px-6";
const prose = "mt-4 text-base leading-8 text-slate-600 dark:text-slate-300";

export default function ArticleToHtmlCheatsheetPage() {
  const schema = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebApplication",
        name: "Article to HTML Infographic & Summary Cheatsheet Builder",
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
          { name: "Article to HTML Cheatsheet", item: pageUrl },
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

      <header
        className={`relative overflow-hidden ${toolHeroSurface} text-white`}
      >
        <ToolHeroBackground />
        <div className="relative mx-auto max-w-6xl px-4 py-12 sm:px-6 sm:py-16">
          <nav
            aria-label="Breadcrumb"
            className="mb-7 flex flex-wrap gap-2 text-xs text-slate-300"
          >
            <Link href="/">Home</Link>
            <span>/</span>
            <Link href="/tools">Tools</Link>
            <span>/</span>
            <span aria-current="page">Article to HTML Cheatsheet</span>
          </nav>

          <div className="grid items-center gap-8 lg:grid-cols-[minmax(0,1.35fr)_minmax(0,0.85fr)]">
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-[#b4c3ff]">
                Content Conversion · Visual Summaries &amp; Linkable Assets
              </p>
              <h1 className="mt-4 text-3xl font-black leading-tight sm:text-4xl lg:text-5xl">
                Article to HTML Infographic{" "}
                <span className={toolHeroHeading}>
                  &amp; Summary Cheatsheet
                </span>
              </h1>
              <p className="mt-5 max-w-2xl text-base leading-8 text-slate-300">
                Distill any long-form guide or URL into a self-contained,
                print-ready 1-page HTML executive summary card with KPI
                benchmarks, numbered steps, and Do&apos;s &amp; Don&apos;ts.
              </p>
              <div className="mt-7 flex flex-wrap gap-3 text-xs font-semibold text-slate-200">
                <span className="rounded-lg border border-white/15 px-3 py-2">
                  Standalone .HTML Export
                </span>
                <span className="rounded-lg border border-white/15 px-3 py-2">
                  Print-Ready 1-Page PDF
                </span>
                <span className="rounded-lg border border-white/15 px-3 py-2">
                  Connected to Chrome Extension
                </span>
              </div>
            </div>

            <div className="rounded-2xl border border-[#9aabff]/30 bg-[#101b30]/90 p-6 shadow-xl">
              <p className="text-xs font-bold uppercase tracking-wider text-[#b4c3ff]">
                Turn Long Guides Into Linkable Cheatsheets
              </p>
              <ul className="mt-4 space-y-2.5 text-xs text-slate-300">
                <li>1. 4 KPI benchmark cards at the top of the sheet</li>
                <li>2. 6-step visual implementation grid</li>
                <li>3. Side-by-side Best Practices vs. Pitfalls</li>
                <li>4. Zero external dependencies — works offline</li>
              </ul>
            </div>
          </div>
        </div>
      </header>

      <ArticleToHtmlCheatsheetClient />

      <section
        className={`${section} border-t border-slate-200 dark:border-slate-800`}
      >
        <h2 className="text-3xl font-extrabold">
          Give busy readers a 1-page visual takeaway they will bookmark and share
        </h2>
        <p className={prose}>
          Pairing long-form articles with a downloadable 1-page cheatsheet
          increases time-on-page and earns natural backlinks from industry
          roundups.
        </p>

        <div className="mt-8 grid gap-5 md:grid-cols-3">
          {[
            [
              LayoutGrid,
              "Visual Card Layout",
              "Organizes dense paragraphs into KPI badges, numbered steps, and high-contrast Do's & Don'ts.",
            ],
            [
              Download,
              "Self-Contained HTML",
              "Downloads as a clean, zero-dependency .HTML file you can host, embed, or share with clients.",
            ],
            [
              Printer,
              "1-Click Print to PDF",
              "Includes built-in @media print styling so saving as a PDF produces a crisp white-background handout.",
            ],
          ].map(([Icon, heading, body]) => {
            const I = Icon as typeof LayoutGrid;
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

      <ToolResources slug="article-to-html-cheatsheet" />
      <ToolFaq title="Article to HTML Cheatsheet Builder FAQs" faqs={faqs} />
    </div>
  );
}
