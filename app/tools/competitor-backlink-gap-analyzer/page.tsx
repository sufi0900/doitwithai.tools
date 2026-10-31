import type { Metadata } from "next";
import Link from "next/link";
import { FileSearch, GitCompareArrows, ListChecks } from "lucide-react";
import GapClient from "@/features/backlink-gap/GapClient";
import ToolFaq from "@/features/tool-ui/ToolFaq";
import ToolResources from "@/features/tool-catalog/ToolResources";
import {
  ToolHeroBackground,
  toolHeroHeading,
  toolHeroSurface,
} from "@/features/tool-ui/ToolHero";

const pageUrl =
  "https://doitwithai.tools/tools/competitor-backlink-gap-analyzer";
const title = "Competitor Backlink Gap Analyzer | Compare CSV Exports";
const description =
  "Compare your backlink exports with up to five competitors. Find referring-domain gaps, inspect source evidence, shortlist prospects, and export clear reports.";
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
    question: "What is a competitor backlink gap?",
    answer:
      "It is a referring source recorded for competitors but absent from your own comparison data. A sampled export can miss existing links, so verify apparent gaps.",
  },
  {
    question: "Can I find competitors’ backlinks by entering their domains?",
    answer:
      "This tool compares supplied exports or lists. It does not query a backlink database or discover incoming links from a domain alone.",
  },
  {
    question: "Which export formats can I use?",
    answer:
      "Use CSV, TSV, or one referring domain or URL per line. Preview the columns and confirm their mapping before comparing provider exports.",
  },
  {
    question: "Can I use Search Console or Bing data?",
    answer:
      "You can compare their supplied linking-page or referring-domain data. These datasets can be sampled and may differ from commercial backlink indexes.",
  },
  {
    question: "Why do I need my own backlink data?",
    answer:
      "Your own dataset supplies the reference for missing-source comparisons. You can explicitly choose an empty own-site list, but this does not prove zero backlinks.",
  },
  {
    question: "What does the all-competitors view mean?",
    answer:
      "It shows sources recorded for every included competitor and absent from your own accepted records. It does not establish quality, relevance, or willingness to link.",
  },
  {
    question: "How are duplicate rows handled?",
    answer:
      "Identical normalized linking records are counted once within each dataset. Multiple placements from one referring source cannot increase the number of competitors matched.",
  },
  {
    question: "How are subdomains and hosted sites grouped?",
    answer:
      "Domain grouping uses public suffix rules, including private hosting suffixes. Exact-host mode separates other subdomains while grouping www with its corresponding host.",
  },
  {
    question: "Will relationship filters create false missing-domain gaps?",
    answer:
      "Relationship filters select groups using competitor evidence. Full imported counts remain visible. An existing accepted own-site record still prevents a missing-domain classification.",
  },
  {
    question: "Does a lost record mean a backlink is currently absent?",
    answer:
      "A status in an export is historical evidence. Inactive competitor records are excluded by default. Own-site records retain membership until you review their live state.",
  },
  {
    question: "Can I compare authority scores across providers?",
    answer:
      "Imported metric labels and values remain attached to their source records. They are not combined, converted, or used to rank prospects.",
  },
  {
    question: "Are my exports uploaded to a server?",
    answer:
      "The comparison runs in your browser. Saving a review stores decisions locally. A downloaded project contains your supplied data, so share it carefully.",
  },
  {
    question: "Can I save my work and continue later?",
    answer:
      "Download a project to preserve inputs, column choices, and review notes. Restore it later and run the comparison again. Browser-saved reviews contain decisions only.",
  },
  {
    question: "How many records can I compare?",
    answer:
      "Use your own dataset and up to five competitors. Each dataset accepts 5,000 data records and up to 2 MB of decoded source text.",
  },
  {
    question: "What should I do after finding a gap?",
    answer:
      "Review the exact publisher page, relevance, link placement, and your own coverage. Verify supplied source URLs before deciding whether a specific outreach approach makes sense.",
  },
];
const prose = "mt-4 text-base leading-8 text-slate-600 dark:text-slate-300";
const section = "mx-auto max-w-6xl px-4 py-12 sm:px-6";
export default function Page() {
  const schema = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebApplication",
        name: "Competitor Backlink Gap Analyzer",
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
          { name: "Competitor Backlink Gap Analyzer", item: pageUrl },
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
        <div className="relative mx-auto max-w-6xl px-4 py-10 sm:px-6 sm:py-14">
          <nav
            aria-label="Breadcrumb"
            className="mb-7 flex flex-wrap gap-2 text-xs text-slate-300"
          >
            <Link href="/">Home</Link>
            <span>/</span>
            <Link href="/tools">Tools</Link>
            <span>/</span>
            <span aria-current="page">Competitor backlink gaps</span>
          </nav>
          <div className="grid items-center gap-8 lg:grid-cols-[1.25fr_0.9fr]">
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-[#b4c3ff]">
                Off-page SEO · Competitor backlink gap analyzer
              </p>
              <h1 className="mt-4 text-3xl font-black leading-tight sm:text-4xl lg:text-5xl">
                Find competitor backlink gaps{" "}
                <span className={toolHeroHeading}>you can actually review</span>
              </h1>
              <p className="mt-5 text-base leading-8 text-slate-300">
                Compare supplied backlink exports, uncover referring-source
                overlap, and turn apparent gaps into an evidence-based
                shortlist.
              </p>
              <div className="mt-7 flex flex-wrap gap-3 text-xs font-semibold text-slate-200">
                <span className="rounded-lg border border-white/15 px-3 py-2">
                  Your site + 5 competitors
                </span>
                <span className="rounded-lg border border-white/15 px-3 py-2">
                  Private browser processing
                </span>
                <span className="rounded-lg border border-white/15 px-3 py-2">
                  Source-level evidence
                </span>
              </div>
            </div>
            <div className="rounded-2xl border border-[#9aabff]/30 bg-[#101b30]/90 p-6 shadow-xl">
              <p className="text-xs font-bold uppercase tracking-wider text-[#b4c3ff]">
                Illustrative overlap
              </p>
              <table className="mt-5 w-full text-left text-xs leading-7">
                <caption className="sr-only">
                  Fictional referring-domain comparison
                </caption>
                <thead>
                  <tr className="border-b border-slate-700 text-slate-400">
                    <th scope="col" className="pb-3">
                      Source
                    </th>
                    <th scope="col" className="pb-3">
                      You
                    </th>
                    <th scope="col" className="pb-3">
                      A
                    </th>
                    <th scope="col" className="pb-3">
                      B
                    </th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <th scope="row" className="pt-3 font-medium">
                      journal.example
                    </th>
                    <td className="pt-3 text-amber-200">Absent*</td>
                    <td className="pt-3 text-emerald-300">✓</td>
                    <td className="pt-3 text-emerald-300">✓</td>
                  </tr>
                  <tr>
                    <th scope="row" className="pt-3 font-medium">
                      shared.example
                    </th>
                    <td className="pt-3 text-emerald-300">✓</td>
                    <td className="pt-3 text-emerald-300">✓</td>
                    <td className="pt-3 text-slate-400">0</td>
                  </tr>
                </tbody>
              </table>
              <p className="mt-5 border-t border-slate-700 pt-4 text-xs leading-6 text-slate-400">
                *Absent from the supplied export. Real backlink coverage still
                needs review.
              </p>
            </div>
          </div>
        </div>
      </header>
      <GapClient />
      <section
        className={`${section} border-t border-slate-200 dark:border-slate-800`}
      >
        <p className="text-xs font-bold uppercase tracking-wider text-[#5271ff]">
          Start with the right question
        </p>
        <h2 className="mt-3 text-3xl font-extrabold">
          Which referring sources appear in competitors’ data?
        </h2>
        <p className={prose}>
          Backlink gap analysis compares incoming-link evidence across websites.
          The useful outcome is a set of publishers worth reviewing for a clear
          reason.
        </p>
        <p className={prose}>
          Our analyzer works from the lists and exports you provide. It keeps
          source records visible, so you can review what supports each apparent
          gap.
        </p>
        <div className="mt-8 grid gap-5 md:grid-cols-3">
          {[
            [
              FileSearch,
              "Inspect the source records",
              "Expand a referring group to review linking pages, targets, anchors, relationships, provider labels, and export dates.",
            ],
            [
              GitCompareArrows,
              "Compare meaningful membership",
              "See missing, shared, own-only, and all-competitor groups. Repeated records cannot inflate the number of competitors represented.",
            ],
            [
              ListChecks,
              "Build a practical shortlist",
              "Mark sources for review, shortlist suitable prospects, add notes, and export the evidence behind your decisions.",
            ],
          ].map(([Icon, heading, text]) => {
            const Graphic = Icon as typeof FileSearch;
            return (
              <div
                className="rounded-2xl border border-slate-200 bg-slate-50 p-6 dark:border-slate-700 dark:bg-slate-900"
                key={String(heading)}
              >
                <Graphic aria-hidden size={25} className="text-[#5271ff]" />
                <h3 className="mt-4 text-lg font-bold">{String(heading)}</h3>
                <p className={prose}>{String(text)}</p>
              </div>
            );
          })}
        </div>
      </section>
      <section className={section}>
        <h2 className="text-3xl font-extrabold">
          Prepare comparable backlink exports
        </h2>
        <ol className="mt-8 grid gap-5 md:grid-cols-3">
          {[
            [
              "Use a clear reference set",
              "Add your own linking-page or referring-domain data first. Record its provider and date so you can judge possible coverage gaps.",
            ],
            [
              "Map competitor evidence",
              "Add one dataset per competitor. Preview the source column and map optional targets, anchors, attributes, and status fields.",
            ],
            [
              "Review the import totals",
              "Check accepted records, duplicates, wrong-site targets, and skipped rows. Resolve mapping issues before acting on the comparison.",
            ],
          ].map(([heading, text], i) => (
            <li
              className="rounded-2xl border border-[#5271ff]/25 p-6"
              key={heading}
            >
              <span className="text-sm font-black text-[#5271ff]">
                0{i + 1}
              </span>
              <h3 className="mt-3 text-lg font-bold">{heading}</h3>
              <p className={prose}>{text}</p>
            </li>
          ))}
        </ol>
        <p className={prose}>
          CSV and TSV headers vary between providers. We suggest column matches,
          while the preview gives you control over the final mapping.
        </p>
        <p className={prose}>
          For plain lists, put one referring domain or source URL on each line.
          A domain-only record does not supply a verified linking page.
        </p>
      </section>
      <section className={section}>
        <h2 className="text-3xl font-extrabold">
          Read the comparison views correctly
        </h2>
        <div className="mt-7 overflow-x-auto rounded-2xl border border-slate-200 dark:border-slate-700">
          <table className="w-full min-w-[580px] text-left text-sm leading-7">
            <caption className="sr-only">
              Backlink gap comparison views and their limits
            </caption>
            <thead className="bg-slate-100 dark:bg-slate-900">
              <tr>
                <th scope="col" className="p-4">
                  View
                </th>
                <th scope="col" className="p-4">
                  What it shows
                </th>
                <th scope="col" className="p-4">
                  What to review next
                </th>
              </tr>
            </thead>
            <tbody>
              {[
                [
                  "Missing from your export",
                  "A competitor has a recorded source that your own dataset does not contain.",
                  "Check whether your own export is sampled, dated, or filtered.",
                ],
                [
                  "All competitors, missing for you",
                  "Every submitted competitor has an eligible record from this source.",
                  "Review why that publisher links to those websites.",
                ],
                [
                  "Shared with competitors",
                  "Your site and at least one competitor have records from the same referring group.",
                  "Inspect page-level differences and the context of each placement.",
                ],
                [
                  "Only in your export",
                  "Your dataset contains the source, while the competitor datasets do not.",
                  "Treat this as supplied-data uniqueness, not proof of exclusivity.",
                ],
              ].map((row) => (
                <tr
                  key={row[0]}
                  className="border-t border-slate-200 dark:border-slate-700"
                >
                  {row.map((cell, i) =>
                    i === 0 ? (
                      <th scope="row" key={i} className="p-4 font-semibold">
                        {cell}
                      </th>
                    ) : (
                      <td
                        key={i}
                        className="p-4 text-slate-600 dark:text-slate-300"
                      >
                        {cell}
                      </td>
                    ),
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
      <section className={`${section} grid gap-8 lg:grid-cols-2`}>
        <div className="rounded-2xl border border-slate-200 p-6 dark:border-slate-700">
          <h2 className="text-2xl font-extrabold">
            Referring groups and backlink counts describe different things
          </h2>
          <p className={prose}>
            A publisher can link to several competitors through many pages. The
            competitor match count measures represented websites, not the number
            of link rows.
          </p>
          <p className={prose}>
            Matrix counts describe accepted imported records. Domain-summary
            exports and backlink-level exports have different detail, so their
            record counts are not directly equivalent.
          </p>
          <p className={prose}>
            Imported authority metrics remain attached to their provider and
            column names. We do not combine different scoring systems or invent
            a quality score.
          </p>
        </div>
        <div className="rounded-2xl border border-slate-200 p-6 dark:border-slate-700">
          <h2 className="text-2xl font-extrabold">
            Choose domain or host grouping deliberately
          </h2>
          <p className={prose}>
            Registrable-domain grouping combines related subdomains using public
            suffix rules. This handles country suffixes such as co.uk without
            treating every co.uk website as one publisher.
          </p>
          <p className={prose}>
            Private hosting suffixes keep separately registered hosted sites
            distinct. Exact-host mode can help you inspect differences between a
            publisher’s subdomains.
          </p>
          <p className={prose}>
            Neither grouping mode establishes publisher ownership or editorial
            independence. Review the actual source before treating it as a
            separate outreach opportunity.
          </p>
        </div>
      </section>
      <section className={section}>
        <div className="rounded-3xl border border-[#5271ff]/30 bg-[#5271ff]/5 p-7 sm:p-9">
          <h2 className="text-2xl font-extrabold">
            Turn an apparent gap into a reason to reach out
          </h2>
          <p className={prose}>
            Open the supplied source page and review its topic, audience,
            existing references, and editorial purpose. Decide what useful
            resource your website could contribute.
          </p>
          <p className={prose}>
            A competitor match alone does not establish relevance. Avoid
            assuming that a directory, partnership, sponsorship, or old resource
            page accepts the same approach.
          </p>
          <p className={prose}>
            Record your reasoning in a review note. Copy the supplied source
            URLs and verify the placements before planning outreach.
          </p>
        </div>
      </section>
      <section className={section}>
        <h2 className="text-3xl font-extrabold">
          Data handling and comparison limits
        </h2>
        <div className="mt-5 grid gap-x-10 md:grid-cols-2">
          <p className={prose}>
            Your site can be compared with one to five competitors. Each dataset
            supports 5,000 records, 100 columns, and 2 MB of decoded text.
          </p>
          <p className={prose}>
            Inactive competitor records are excluded by default. Own-site
            records retain membership, including historical records that deserve
            a live recheck.
          </p>
          <p className={prose}>
            Expanded groups show up to 50 evidence records. Filtered evidence
            exports retain all accepted records in the current result selection.
          </p>
          <p className={prose}>
            Projects preserve your source text and column choices in a
            downloaded file. Browser-saved reviews contain decisions and notes,
            with no automatic monitoring.
          </p>
        </div>
      </section>
      <ToolFaq title="Questions about competitor backlink gaps" faqs={faqs} />
      <ToolResources slug="competitor-backlink-gap-analyzer" />
    </div>
  );
}
