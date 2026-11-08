import PortableToolHeroBar from "@/features/portable-tool-kit/PortableToolHeroBar";
import {
  ToolHeroBackground,
  toolHeroSurface,
  toolHeroHeading,
} from "@/features/tool-ui/ToolHero";
import type { Metadata } from "next";
import Link from "next/link";
import ExcelSeoReportClient from "@/features/excel-seo-report-generator/ExcelSeoReportClient";
import ToolResources from "@/features/tool-catalog/ToolResources";

const pageUrl = "https://doitwithai.tools/tools/excel-seo-report-generator";
const description =
  "Generate Excel SEO formulas, Looker Studio calculated fields, and client-ready website analysis reports from your Search Console metrics in seconds.";
const image = `https://doitwithai.tools/api/og?${new URLSearchParams({
  title: "Free Excel SEO Tool & Website Analysis Report Generator",
  category: "AI SEO · Excel Formulas, Looker Studio & Audit PDF",
  ctaText: "Formula. Analyze. Export.",
  features: "Excel & Sheets SEO Formulas,Looker Studio Fields,Print-Ready Audit Report",
})}`;

export const metadata: Metadata = {
  title: "Free Excel SEO Tool & Website Analysis Report Generator",
  description,
  alternates: { canonical: pageUrl },
  openGraph: {
    title: "Free Excel SEO Tool & Website Analysis Report Generator",
    description,
    url: pageUrl,
    type: "website",
    images: [{ url: image, width: 1200, height: 630 }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Free Excel SEO Tool & Website Analysis Report Generator",
    description,
    images: [image],
  },
};

const faqs = [
  [
    "What does this free Excel SEO tool generate for Search Console exports?",
    "It generates tested Excel and Google Sheets formulas for automatic Search Intent classification, Striking-Distance (Position 4–15) CTR underperformance flags, Keyword Golden Ratio (KGR) scoring, and Position Tier buckets—plus a print-ready executive SEO website analysis report.",
  ],
  [
    "How do I build a Google Data Studio (Looker Studio) keyword ranking dashboard?",
    "Connect your Google Search Console property to Looker Studio, click 'Add a Field', and paste the CASE WHEN calculated fields from Card #2 above to group queries into Position Buckets (Top 3, Pos 4–10, Striking Distance 11–20) and Intent Tiers.",
  ],
  [
    "How can I export a clean SEO website analysis report PDF for a client or founder?",
    "Enter your domain's Search Console summary, indexing snapshot, and top striking-distance keywords above, then click 'Print / Save PDF' or 'Export Report .MD' to generate an executive 30-60-90 day SEO roadmap.",
  ],
  [
    "Why should SEO reports separate intentional exclusions from 'Crawled - currently not indexed' URLs?",
    "In Google Search Console, 301 redirects and intentional noindex tags are normal housekeeping—not broken pages. Your report should focus engineering and editorial effort on 'Crawled - currently not indexed' URLs that need stronger Information Gain and internal links.",
  ],
  [
    "Which Excel formula isolates the highest-ROI pages to update first?",
    "Use our Striking-Distance CTR formula: filter for queries ranking in Positions 4 through 15 with at least 100 impressions and a CTR below 3%—upgrading the SEO title and H1 on those pages delivers the fastest click gains.",
  ],
  [
    "How do I attach revenue projections to my monthly agency SEO report?",
    "Take your striking-distance keyword volume from this report and plug it into our Enterprise SEO ROI & AI Cost Calculator to project monthly organic revenue, customer LTV, and break-even timelines.",
  ],
];

const EXCEL_PROMPTS = [
  {
    title: "1. Search Console CSV to Executive Board Report Prompt",
    badge: "Executive Reporting",
    prompt: `Act as an SEO Director presenting a 90-day Search Console audit for [Domain]. Given [Impressions, Clicks, Avg CTR, Avg Position] and [Indexing Snapshot], write a 3-part executive summary covering (1) Non-Brand Visibility Wins, (2) Striking-Distance CTR Opportunities (Pos 4–15), and (3) A prioritized 30-60-90 day roadmap.`,
  },
  {
    title: "2. Custom Excel & Google Sheets Regex/XLOOKUP Builder Prompt",
    badge: "Excel & Sheets SEO",
    prompt: `Write Google Sheets and Excel formulas for an exported Search Console sheet where Column A = Query, Column B = Page URL, Column C = Clicks, Column D = Impressions, Column E = CTR, and Column F = Position. Provide formulas to (1) classify Buyer Intent, (2) flag Keyword Cannibalization where 2+ URLs share the same query, and (3) score Priority Refresh tiers.`,
  },
];

const prose = "mt-4 text-sm leading-8 text-slate-600 dark:text-slate-300";

export default function ExcelSeoReportGeneratorPage() {
  const schema = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebApplication",
        name: "Free Excel SEO Tool & Website Analysis Report Generator",
        alternateName: [
          "Excel SEO Tool",
          "SEO Website Analysis Report PDF Generator",
          "Google Data Studio Keyword Ranking Formula Builder",
          "Agency SEO Reporting Tool",
        ],
        url: pageUrl,
        description,
        applicationCategory: "BusinessApplication",
        operatingSystem: "Any",
        browserRequirements: "Requires JavaScript",
        isAccessibleForFree: true,
        offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
      },
      {
        "@type": "HowTo",
        name: "How to Generate Excel SEO Formulas and a Website Analysis Report",
        description:
          "Build Excel/Sheets SEO formulas, Looker Studio fields, and a client-ready audit report in 4 steps.",
        step: [
          {
            "@type": "HowToStep",
            position: 1,
            name: "Enter your domain, reporting window, and 90-day goal",
            text: "Specify the website domain, Search Console date window, and primary ranking or CTR target.",
          },
          {
            "@type": "HowToStep",
            position: 2,
            name: "Paste your Search Console metrics and indexing snapshot",
            text: "Include total impressions, clicks, average position, indexed page count, and top striking-distance queries.",
          },
          {
            "@type": "HowToStep",
            position: 3,
            name: "Copy your Excel SEO formulas and Looker Studio fields",
            text: "Copy the ready-to-paste Excel/Sheets and Looker Studio CASE WHEN formulas for intent and position buckets.",
          },
          {
            "@type": "HowToStep",
            position: 4,
            name: "Print to PDF or export your report to Markdown and CSV",
            text: "Click 'Print / Save PDF' or download the Markdown executive summary and CSV formula pack.",
          },
        ],
      },
      {
        "@type": "FAQPage",
        mainEntity: faqs.map(([question, answer]) => ({
          "@type": "Question",
          name: question,
          acceptedAnswer: { "@type": "Answer", text: answer },
        })),
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { name: "Home", item: "https://doitwithai.tools" },
          { name: "Tools", item: "https://doitwithai.tools/tools" },
          {
            name: "Excel SEO Tool & Website Analysis Report Generator",
            item: pageUrl,
          },
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
      <div className={`relative overflow-hidden ${toolHeroSurface} text-white`}>
        <ToolHeroBackground />
        <div className="relative mx-auto max-w-6xl px-4 py-6 sm:px-6 sm:py-8">
          <nav
            aria-label="Breadcrumb"
            className="mb-4 flex flex-wrap gap-2 text-xs text-slate-300"
          >
            <Link href="/">Home</Link>
            <span>/</span>
            <Link href="/tools">Tools</Link>
            <span>/</span>
            <span aria-current="page">
              Excel SEO Tool &amp; Report Generator
            </span>
          </nav>

          <div className="mb-8 grid items-center gap-8 lg:grid-cols-[minmax(0,1.35fr)_minmax(0,0.85fr)]">
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-[#b4c3ff]">
                EXCEL SEO WORKFLOWS · LOOKER STUDIO &amp; CLIENT AUDIT REPORTS
              </p>
              <h1 className={toolHeroHeading}>
                Free Excel SEO Tool &amp; Website Analysis Report Generator
              </h1>
              <p className="mt-4 max-w-2xl text-base leading-relaxed text-slate-200">
                Turn raw Search Console exports into{" "}
                <strong>tested Excel &amp; Google Sheets SEO formulas</strong>,{" "}
                <strong>
                  Looker Studio (Google Data Studio) ranking fields
                </strong>
                , and a{" "}
                <strong>
                  print-ready executive SEO website analysis report
                </strong>
                .
              </p>
              <div className="mt-5">
                <PortableToolHeroBar
                  title="Free Excel SEO Tool & Website Analysis Report Generator"
                  path="/tools/excel-seo-report-generator"
                />
              </div>
            </div>

            <div className="rounded-3xl border border-white/15 bg-slate-900/75 p-5 shadow-2xl backdrop-blur-md">
              <p className="text-xs font-bold uppercase tracking-wider text-blue-300">
                Built for Analysts, Founders &amp; Agencies
              </p>
              <ul className="mt-3 space-y-2.5 text-xs leading-6 text-slate-200">
                <li>
                  • <strong>Excel &amp; Sheets Formulas</strong>: Instant
                  Intent, Striking-Distance CTR &amp; KGR formulas.
                </li>
                <li>
                  • <strong>Looker Studio Calculated Fields</strong>: Copy-paste{" "}
                  <code>CASE WHEN</code> ranking &amp; intent buckets.
                </li>
                <li>
                  • <strong>Print-Ready Audit Report</strong>: 1-click PDF print
                  or Markdown/CSV client handoff.
                </li>
              </ul>
            </div>
          </div>

          <ExcelSeoReportClient />
        </div>
      </div>

      <div className="mx-auto max-w-6xl space-y-20 px-4 py-16 sm:px-6 lg:px-8">
        {/* 50-WORD QUICK ANSWER */}
        <section className="rounded-3xl border border-slate-200 bg-slate-50/70 p-7 dark:border-slate-800 dark:bg-slate-900/80">
          <p className="text-xs font-bold uppercase tracking-widest text-[#4662df] dark:text-blue-300">
            Quick Answer · Excel SEO &amp; Website Analysis Reports
          </p>
          <h2 className="mt-2 text-2xl font-black sm:text-3xl">
            How to Automate SEO Reporting in Excel and Looker Studio
          </h2>
          <p className={prose}>
            To turn a raw Google Search Console export into an actionable{" "}
            <strong>SEO website analysis report</strong>, classify queries into{" "}
            <strong>Intent Tiers</strong> using <code>COUNTIF</code> or{" "}
            <code>REGEXP_MATCH</code>, group rankings into{" "}
            <strong>Position Buckets (Top 3, 4–10, 11–20)</strong>, isolate{" "}
            <strong>Position 4–15 low-CTR pages</strong> for immediate title
            upgrades, and track <strong>indexed vs. excluded URLs</strong> over
            8–12 weeks.
          </p>
        </section>

        {/* COMPARISON TABLE */}
        <section>
          <h2 className="text-3xl font-black">
            Excel / Google Sheets vs. Looker Studio vs. Executive PDF Audit Reports
          </h2>
          <div className="mt-6 overflow-x-auto rounded-2xl border border-slate-200 dark:border-slate-800">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-100 text-xs font-bold uppercase text-slate-700 dark:bg-slate-950 dark:text-slate-200">
                <tr>
                  <th className="px-4 py-3.5">Reporting Format</th>
                  <th className="px-4 py-3.5">Best Use Case</th>
                  <th className="px-4 py-3.5">Core Formula / Deliverable</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 bg-white dark:divide-slate-800 dark:bg-slate-900">
                <tr>
                  <td className="px-4 py-3.5 font-bold">
                    Excel &amp; Google Sheets (.xlsx / .csv)
                  </td>
                  <td className="px-4 py-3.5">
                    Deep keyword audits, KGR math &amp; striking-distance filters
                  </td>
                  <td className="px-4 py-3.5">
                    <code>IFS</code>, <code>COUNTIF</code> &amp;{" "}
                    <code>XLOOKUP</code> across GSC + Semrush data
                  </td>
                </tr>
                <tr>
                  <td className="px-4 py-3.5 font-bold">
                    Looker Studio (Google Data Studio)
                  </td>
                  <td className="px-4 py-3.5">
                    Live client ranking dashboards &amp; 28-day velocity charts
                  </td>
                  <td className="px-4 py-3.5">
                    <code>CASE WHEN REGEXP_MATCH(...)</code> calculated fields
                  </td>
                </tr>
                <tr>
                  <td className="px-4 py-3.5 font-bold">
                    Executive Website Audit PDF / Markdown
                  </td>
                  <td className="px-4 py-3.5">
                    Founder &amp; stakeholder sign-off on 30-60-90 day roadmaps
                  </td>
                  <td className="px-4 py-3.5">
                    Baseline KPIs + Indexing Hygiene + Priority Page Refreshes
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          <p className={prose}>
            Want to prioritize which decaying articles to refresh first from
            your spreadsheet? Run your URLs through our{" "}
            <Link
              href="/tools/content-decay-refresh-analyzer"
              className="font-semibold text-[#4662df] underline dark:text-blue-300"
            >
              Content Decay &amp; GSC Refresh Priority Analyzer
            </Link>{" "}
            and calculate low-competition KGR targets in the{" "}
            <Link
              href="/tools/keyword-golden-ratio-calculator"
              className="font-semibold text-[#4662df] underline dark:text-blue-300"
            >
              Keyword Golden Ratio (KGR) &amp; Affinity Calculator
            </Link>
            .
          </p>
        </section>

        {/* PROMPTS */}
        <section>
          <h2 className="text-3xl font-black">
            Copy-Paste Prompts for Excel SEO Formulas &amp; Client Audit Summaries
          </h2>
          <div className="mt-6 grid gap-5 md:grid-cols-2">
            {EXCEL_PROMPTS.map((item) => (
              <article
                key={item.title}
                className="rounded-3xl border border-slate-200 bg-slate-50/70 p-6 dark:border-slate-800 dark:bg-slate-900"
              >
                <span className="inline-block rounded-full bg-blue-500/10 px-3 py-1 text-xs font-bold text-[#4662df] dark:text-blue-300">
                  {item.badge}
                </span>
                <h3 className="mt-3 text-lg font-bold">{item.title}</h3>
                <pre className="mt-3 whitespace-pre-wrap rounded-2xl bg-slate-950 p-4 font-mono text-xs leading-6 text-slate-200">
                  {item.prompt}
                </pre>
              </article>
            ))}
          </div>
        </section>

        {/* FAQS */}
        <section>
          <h2 className="text-3xl font-black">
            Frequently Asked Questions: Excel SEO Workflows &amp; Audit Reports
          </h2>
          <div className="mt-7 divide-y divide-slate-200 rounded-3xl border border-slate-200 px-6 dark:divide-slate-800 dark:border-slate-800">
            {faqs.map(([q, a]) => (
              <details key={q} className="py-5" open>
                <summary className="cursor-pointer text-base font-bold leading-7">
                  {q}
                </summary>
                <p className={prose}>{a}</p>
              </details>
            ))}
          </div>
        </section>

        <ToolResources slug="excel-seo-report-generator" />
      </div>
    </>
  );
}
