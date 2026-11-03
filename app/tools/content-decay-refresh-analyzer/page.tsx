import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowRight,
  FileSpreadsheet,
  ListChecks,
  ShieldCheck,
} from "lucide-react";
import ContentDecayRefreshAnalyzerClient from "@/features/content-decay-refresh-analyzer/ContentDecayRefreshAnalyzerClient";
import ToolFaq from "@/features/tool-ui/ToolFaq";
import ToolResources from "@/features/tool-catalog/ToolResources";
import {
  ToolHeroBackground,
  toolHeroHeading,
  toolHeroSurface,
} from "@/features/tool-ui/ToolHero";

const pageUrl = "https://doitwithai.tools/tools/content-decay-refresh-analyzer";
const title = "Free Content Refresh Tool for SEO | GSC Audit & Brief";
const description =
  "Find pages to update with a free SEO content refresh tool. Compare GSC exports, review traffic decline signals, and build editable CSV or Word refresh briefs.";
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
    question: "What does this free content refresh tool do for SEO?",
    answer:
      "It compares previous and current Search Console metrics, orders pages or queries for review, and creates an editable refresh brief. Specify what to keep, update, add, source, and link before exporting your CSV queue or Word action plan. It does not rewrite or publish your website.",
  },
  {
    question: "How do I import my Google Search Console data?",
    answer:
      "Export the Pages or Queries table for two equal-length periods with the same filters. In Two period exports, add the previous file and current file separately. Alternatively use a comparison CSV with explicit Previous and Current column names. Only matching rows from separate files are compared; an absent row is not assumed to have zero clicks.",
  },
  {
    question: "Can I use a three-column CSV with clicks only?",
    answer:
      "Yes. Supply Page, Previous Clicks, and Current Clicks. The tool shows click changes and a general review checklist. Missing impressions and positions remain unavailable; no ranking or CTR diagnosis is inferred from invented values.",
  },
  {
    question: "Can GSC data prove that an AI Overview caused my traffic drop?",
    answer:
      "No. A CTR decline with broadly stable position is a signal to investigate. Search-result features, query mix, country, device, demand, and title changes may contribute. Review matched queries and actual result layouts before choosing a cause or rewriting content.",
  },
  {
    question: "How is refresh priority calculated?",
    answer:
      "The editorial score adds up to 60 points for lost clicks (lost clicks divided by 4), up to 25 for percentage click decline (decline percentage times 0.4), and 15 for an average-position worsening of at least 1.2. It is rounded and capped at 100. It is a queue-ordering heuristic, not a Google score, expected traffic recovery, or ranking probability.",
  },
  {
    question:
      "When should I update an old article instead of creating a new one?",
    answer:
      "Refresh an existing page when it still serves the same reader task but needs more accurate information, clearer instructions, or useful new examples. Consider a separate page when the task and search intent are distinct. Check overlap with existing pages before choosing.",
  },
  {
    question:
      "Should I change the URL or publish date when refreshing content?",
    answer:
      "Keep a useful established URL when the topic stays the same. If a move is necessary, plan redirects and update internal links. Update visible dates and modification metadata when they reflect real changes. A historical year in a URL is a review cue, not proof that the page is outdated.",
  },
  {
    question: "Is my GSC CSV uploaded, and can I save the brief?",
    answer:
      "The comparison and brief editor run in your browser without a Google account connection. Download the full queue as CSV or an editable Word document, or copy one brief. Work stays in the current tab and is cleared on reload. This tool does not fetch article content or change your CMS.",
  },
];
const section = "mx-auto max-w-6xl px-4 py-12 sm:px-6";
const prose = "mt-4 text-base leading-8 text-slate-600 dark:text-slate-300";
const link = "font-semibold text-[#3452d1] underline dark:text-[#9aabff]";
export default function ContentDecayRefreshAnalyzerPage() {
  const schema = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebApplication",
        "@id": `${pageUrl}#application`,
        name: "SEO Content Refresh Tool",
        url: pageUrl,
        description,
        applicationCategory: "BusinessApplication",
        operatingSystem: "Any",
        browserRequirements: "Requires JavaScript",
        isAccessibleForFree: true,
        offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
        featureList: [
          "Compare Search Console period exports",
          "Review click, impression, CTR, and position changes",
          "Edit page-specific content refresh briefs",
          "Export CSV queues and Word action plans",
        ],
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { name: "Home", item: "https://doitwithai.tools" },
          { name: "Tools", item: "https://doitwithai.tools/tools" },
          { name: "SEO Content Refresh Tool", item: pageUrl },
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
            <span aria-current="page">Content refresh tool</span>
          </nav>
          <p className="text-xs font-bold uppercase tracking-widest text-blue-200">
            Free tool · Search Console content audit
          </p>
          <h1 className="mt-4 max-w-4xl text-4xl font-black leading-tight sm:text-5xl lg:text-6xl">
            Content Refresh Tool{" "}
            <span className={toolHeroHeading}>for SEO</span>
          </h1>
          <p className="mt-5 max-w-3xl text-base leading-8 text-slate-300">
            Find existing pages that need attention, compare their Search
            Console performance, and turn the evidence into a practical refresh
            brief. Decide what to keep, update, and add before rewriting.
          </p>
          <div className="mt-6 flex flex-wrap gap-4 text-sm font-semibold text-slate-200">
            {[
              [FileSpreadsheet, "Two GSC exports"],
              [ListChecks, "Editable refresh briefs"],
              [ShieldCheck, "CSV stays in your browser"],
            ].map(([Icon, label]) => {
              const I = Icon as typeof ListChecks;
              return (
                <span
                  key={String(label)}
                  className="inline-flex items-center gap-2"
                >
                  <I size={17} aria-hidden />
                  {String(label)}
                </span>
              );
            })}
          </div>
          <a
            href="#content-refresh-tool"
            className="mt-7 inline-flex items-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-extrabold text-slate-950"
          >
            Build your refresh plan <ArrowRight size={17} aria-hidden />
          </a>
        </div>
      </header>
      <ContentDecayRefreshAnalyzerClient />
      <section
        id="prepare-refresh-data"
        className={`${section} scroll-mt-8 border-t border-slate-200 dark:border-slate-800`}
      >
        <h2 className="text-3xl font-extrabold">
          How to prepare your GSC content refresh audit
        </h2>
        <ol className="mt-6 list-decimal space-y-4 pl-6 text-sm leading-7 text-slate-600 dark:text-slate-300">
          <li>
            In Search Console, open Performance → Search results. Choose Web
            search and the Pages table to prioritize URLs, or Queries to
            investigate search terms.
          </li>
          <li>
            Export a previous period and a current period of equal length. Keep
            country, device, search type, and any page/query filters consistent.
            Consider seasonality and incomplete recent data.
          </li>
          <li>
            Unzip the downloads and upload each Pages.csv or Queries.csv in{" "}
            <strong>Two period exports</strong>. Do not upload the Chart,
            Countries, or Devices tables. Use the same grouping in both files.
          </li>
          <li>
            For a prepared comparison file, label previous and current metrics
            explicitly. Column order can vary when headers are present.
            Headerless data uses the order below; the three-column clicks-only
            version is also supported.
          </li>
        </ol>
        <pre className="mt-5 overflow-x-auto rounded-xl bg-slate-100 p-4 text-xs leading-6 dark:bg-slate-900">
          Page,Previous Clicks,Current Clicks,Previous Impressions,Current
          Impressions,Previous Position,Current Position{"\n"}
          https://example.com/guide,500,200,10000,9500,2.1,6.4
        </pre>
        <p className={prose}>
          Up to 1,000 matched items and 2 MB of input. English metric headers,
          comma/tab/semicolon delimiters, and quoted fields are supported. Use a
          dot for decimals and quote numbers containing thousands commas.
          Missing metrics stay unassessed. Only matching rows are compared;
          export omissions do not establish zero traffic.
        </p>
        <a
          href="https://support.google.com/webmasters/answer/7576553?hl=en"
          className={`${link} mt-4 inline-block`}
        >
          Google&apos;s Search Console performance report documentation
        </a>
      </section>
      <section
        className={`${section} border-t border-slate-200 dark:border-slate-800`}
      >
        <h2 className="text-3xl font-extrabold">
          Worked example: from a traffic decline to an editing brief
        </h2>
        <p className={prose}>
          In this illustrative comparison, a guide drops from 500 to 200 clicks
          (−60%), impressions fall from 10,000 to 9,500 (−5%), and average
          position moves from 2.1 to 6.4. The tool flags a ranking decline
          signal and gives it editorial priority 99/100. This is an
          investigation cue, not proof of stale content or a forecast of
          recovered clicks.
        </p>
        <div className="mt-6 grid gap-4 md:grid-cols-3">
          {[
            [
              "Keep",
              "Preserve the working setup walkthrough and original screenshots that still match the product.",
            ],
            [
              "Update",
              "Verify each outdated interface instruction against the current product. Record the source and the specific section to correct.",
            ],
            [
              "Add and measure",
              "Add the missing troubleshooting example, link a relevant supporting guide, and record the publish date for a matched query comparison.",
            ],
          ].map(([heading, body]) => (
            <article
              key={heading}
              className="rounded-2xl border border-slate-200 p-5 dark:border-slate-700"
            >
              <h3 className="font-bold">{heading}</h3>
              <p className="mt-3 text-sm leading-7 text-slate-600 dark:text-slate-300">
                {body}
              </p>
            </article>
          ))}
        </div>
        <p className={prose}>
          The brief editor adds a target query, reader intent, proposed title
          and description, evidence links, and a measurement plan. These are
          your editorial decisions; the tool does not inspect the article,
          verify sources, or automatically generate replacement copy.
        </p>
      </section>
      <section
        className={`${section} border-t border-slate-200 dark:border-slate-800`}
      >
        <h2 className="text-2xl font-extrabold">
          How to interpret content decay signals
        </h2>
        <p className={prose}>
          A click decline of at least 10% triggers review. A position worsening
          of at least 1.2 suggests checking rankings; an impression decline of
          at least 20% with broadly stable position suggests checking visibility
          and demand. A measured CTR decline with broadly stable position
          prompts a snippet and query review. These thresholds are editorial
          heuristics. Search Console averages can change when the query mix
          changes, and none of these patterns establishes a root cause.
        </p>
        <p className={prose}>
          Before a rewrite, check the page&apos;s indexing and access, compare
          the same queries and audience segments, and inspect what readers need
          now. Improve substantive content rather than merely changing a date or
          inserting a year. Judge results with enough comparable data after
          publishing; a higher priority score does not guarantee a higher
          ranking.
        </p>
        <h3 className="mt-8 text-xl font-bold">
          Continue with the right supporting check
        </h3>
        <p className={prose}>
          Investigate snippets with the{" "}
          <Link href="/tools/gsc-ctr-optimizer" className={link}>
            GSC CTR optimizer
          </Link>
          , find near-page-one queries with the{" "}
          <Link href="/tools/gsc-striking-distance-finder" className={link}>
            striking distance finder
          </Link>
          , or check overlap using the{" "}
          <Link href="/tools/keyword-cannibalization-finder" className={link}>
            keyword cannibalization finder
          </Link>
          . After updating your article, run the{" "}
          <Link href="/tools/ai-citation-readiness-checker" className={link}>
            free GEO and AI citation readiness audit
          </Link>{" "}
          to review available access, clarity, and sourcing evidence.
        </p>
      </section>
      <ToolFaq title="SEO content refresh tool questions" faqs={faqs} />
      <ToolResources slug="content-decay-refresh-analyzer" />
    </div>
  );
}
