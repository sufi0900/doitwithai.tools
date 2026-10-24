import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, FileSearch, Link2, ClipboardCheck } from "lucide-react";
import Client from "@/features/content-evidence/Client";
import ToolResources from "@/features/tool-catalog/ToolResources";
import {
  ToolHeroBackground,
  toolHeroHeading,
  toolHeroSurface,
} from "@/features/tool-ui/ToolHero";

const pageUrl = "https://doitwithai.tools/tools/content-evidence-review";
const title = "Content Evidence Review | Check Claims and Source Context";
const description =
  "Find statistics, guarantees, research claims, and testing statements in your content. Inspect nearby sources, record decisions, and export your review.";
const image = `https://doitwithai.tools/api/og?${new URLSearchParams({ title: "Content Evidence Review", category: "On-page SEO · Editorial Review", ctaText: "Find claims. Check evidence.", features: "Claim Cues,Source Context,Review Notes" })}`;
export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: pageUrl },
  openGraph: {
    title,
    description,
    url: pageUrl,
    type: "website",
    images: [{ url: image, width: 1200, height: 630 }],
  },
  twitter: { card: "summary_large_image", title, description, images: [image] },
};
const faqs = [
  [
    "Does this tool tell me whether a claim is true?",
    "No. It identifies wording worth reviewing and shows nearby link candidates. You must inspect the original evidence and decide whether it supports the claim.",
  ],
  [
    "What counts as a nearby source?",
    "A candidate link appears in the same passage or an adjacent passage within the same section. A nearby link may be unrelated. Check its actual content.",
  ],
  [
    "Why did my article have no flagged claims?",
    "The checks look for selected English wording and numerical cues. Claims can appear without these cues. No detected claims does not confirm accuracy.",
  ],
  [
    "Does recording evidence improve an E-E-A-T score?",
    "There is no E-E-A-T score here. Saved decisions update your manual review progress. They do not establish factual accuracy, expertise, rankings, or citation chances.",
  ],
  [
    "Can I use my own research or a book as evidence?",
    "Yes. Record a method, source title, page number, or research note. An evidence URL is optional when you provide a source note.",
  ],
  [
    "Are my website and draft changed automatically?",
    "No. The report records review decisions. Make any content changes in your own editor, then import the updated content for another review.",
  ],
  [
    "What if a URL cannot be imported?",
    "Paste your article text or page HTML. Private pages and content added after the initial page load may need this approach.",
  ],
  [
    "Can I keep the report?",
    "Export CSV for an editorial task list, or JSON for detailed source context. Save review decisions first. Reloading or leaving clears the session.",
  ],
];
const prose = "mt-4 text-base leading-8 text-slate-600 dark:text-slate-300";
export default function Page() {
  const schema = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebApplication",
        name: "Content Evidence Review",
        url: pageUrl,
        description,
        applicationCategory: "BusinessApplication",
        operatingSystem: "Any",
        isAccessibleForFree: true,
        browserRequirements: "Requires JavaScript",
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { name: "Home", item: "https://doitwithai.tools" },
          { name: "Tools", item: "https://doitwithai.tools/tools" },
          { name: "Content Evidence Review", item: pageUrl },
        ].map((item, index) => ({
          "@type": "ListItem",
          position: index + 1,
          ...item,
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
      <section
        className={`relative overflow-hidden ${toolHeroSurface} px-5 pb-16 pt-10 text-white sm:pt-14`}
      >
        <ToolHeroBackground />
        <div className="relative mx-auto max-w-6xl">
          <nav
            aria-label="Breadcrumb"
            className="mb-12 flex flex-wrap gap-2 text-xs text-blue-100"
          >
            <Link href="/">Home</Link>
            <span aria-hidden="true">/</span>
            <Link href="/tools">Tools</Link>
            <span aria-hidden="true">/</span>
            <span aria-current="page">Content Evidence Review</span>
          </nav>
          <header className="mx-auto max-w-4xl text-center">
            <p className="text-xs font-bold uppercase tracking-widest text-blue-200">
              On-page SEO · Your editorial evidence desk
            </p>
            <h1 className="mt-6 text-4xl font-black leading-tight tracking-tight sm:text-6xl">
              Content Evidence Review
              <span className={`mt-4 block ${toolHeroHeading}`}>
                Give your claims a closer look.
              </span>
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-base leading-8 text-blue-100 sm:text-lg">
              Find statements worth checking, inspect nearby source links, and
              keep a clear record of your editorial decisions.
            </p>
            <a
              href="#evidence-review-workspace"
              className="mt-8 inline-flex min-h-12 items-center gap-2 rounded-xl bg-white px-6 py-3 text-sm font-bold text-[#3048bb]"
            >
              Start your review <ArrowRight size={17} aria-hidden="true" />
            </a>
          </header>
        </div>
      </section>
      <section className="scroll-mt-28 bg-slate-50 px-3 py-10 dark:bg-[#0c1422] sm:px-6">
        <div className="mx-auto max-w-6xl">
          <Client />
        </div>
      </section>
      <section className="bg-white px-5 py-16 dark:bg-slate-950">
        <div className="mx-auto max-w-6xl">
          <h2 className="text-3xl font-extrabold tracking-tight text-slate-950 dark:text-white">
            A practical claim and source review workflow
          </h2>
          <p className={`${prose} max-w-3xl`}>
            Content can read smoothly while leaving an important claim
            unsupported. This workspace helps you find review tasks and record
            what you checked.
          </p>
          <div className="mt-9 grid gap-5 md:grid-cols-3">
            {[
              {
                icon: FileSearch,
                name: "Find the passage",
                body: "Import a public article or paste a draft. Review statistics, attribution, absolute wording, comparisons, and statements about first-hand testing.",
              },
              {
                icon: Link2,
                name: "Inspect the evidence",
                body: "Open a candidate source and read the relevant section. Compare its date, scope, sample, and limitations with your claim.",
              },
              {
                icon: ClipboardCheck,
                name: "Record your decision",
                body: "Add a source link or note. Mark evidence recorded, request a revision, or explain why evidence is unnecessary. Export the saved decisions.",
              },
            ].map(({ icon: Icon, name, body }) => (
              <article
                key={name}
                className="min-w-0 rounded-2xl border border-slate-200 p-6 dark:border-slate-700"
              >
                <Icon className="text-[#5271ff]" size={26} aria-hidden="true" />
                <h3 className="mt-5 text-lg font-bold text-slate-950 dark:text-white">
                  {name}
                </h3>
                <p className={prose}>{body}</p>
              </article>
            ))}
          </div>
          <div className="mt-16 grid gap-10 lg:grid-cols-2">
            <section>
              <h2 className="text-2xl font-extrabold text-slate-950 dark:text-white">
                What makes evidence useful?
              </h2>
              <p className={prose}>
                Start with the original source when possible. A number repeated
                across several articles may still trace back to one weak or
                outdated claim.
              </p>
              <ul className="mt-5 list-disc space-y-3 pl-5 text-base leading-8 text-slate-600 dark:text-slate-300">
                <li>
                  Check what was measured and which audience or sample was
                  included.
                </li>
                <li>
                  Read the method and date before treating a result as broadly
                  applicable.
                </li>
                <li>
                  Distinguish correlation, opinion, and observation from a
                  demonstrated cause.
                </li>
                <li>
                  For your own tests, record the setup, sample, limits, and
                  results.
                </li>
                <li>
                  Keep qualifications that change how a reader should understand
                  the claim.
                </li>
              </ul>
            </section>
            <section>
              <h2 className="text-2xl font-extrabold text-slate-950 dark:text-white">
                Clear sourcing and on-page SEO
              </h2>
              <p className={prose}>
                Google’s people-first content guidance asks authors to consider
                clear sourcing, evidence of expertise, and accurate authorship
                information.
              </p>
              <p className={prose}>
                Use this review to organize those editorial checks. A linked
                source alone does not establish trust, and a completed checklist
                cannot guarantee rankings.
              </p>
              <a
                className="mt-5 inline-flex min-h-11 items-center text-sm font-bold text-[#4058d0] underline dark:text-blue-200"
                href="https://developers.google.com/search/docs/fundamentals/creating-helpful-content"
              >
                Read Google’s helpful content guidance
              </a>
              <p className={prose}>
                For headings, metadata, links, and other page signals, use the{" "}
                <Link
                  className="text-[#4058d0] underline dark:text-blue-200"
                  href="/tools/on-page-ai-seo-analyzer"
                >
                  On-page AI SEO Analyzer
                </Link>
                .
              </p>
            </section>
          </div>
          <section className="mt-16">
            <h2 className="text-2xl font-extrabold text-slate-950 dark:text-white">
              Read each result in context
            </h2>
            <div className="mt-6 overflow-x-auto rounded-2xl border border-slate-200 dark:border-slate-700">
              <table className="w-full min-w-[540px] text-left text-sm leading-7">
                <caption className="sr-only">
                  Evidence review labels and the action to take
                </caption>
                <thead className="bg-slate-100 text-slate-900 dark:bg-slate-800 dark:text-white">
                  <tr>
                    <th scope="col" className="p-5">
                      Finding
                    </th>
                    <th scope="col" className="p-5">
                      What it means
                    </th>
                    <th scope="col" className="p-5">
                      Your next step
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 text-slate-600 dark:divide-slate-700 dark:text-slate-300">
                  {[
                    [
                      "No nearby link detected",
                      "The passage has no retained link in its immediate context.",
                      "Check references, original research, or records before revising.",
                    ],
                    [
                      "Source candidate",
                      "A link appears nearby. Its relevance has not been established.",
                      "Open the source and compare the exact claim.",
                    ],
                    [
                      "Evidence recorded by you",
                      "You saved a source link or note for the passage.",
                      "Publish any required corrections through your website editor.",
                    ],
                    [
                      "Needs revision",
                      "You marked the wording for further editing.",
                      "Narrow the claim, add context, or remove unsupported wording.",
                    ],
                  ].map((row) => (
                    <tr key={row[0]}>
                      {row.map((cell, i) =>
                        i === 0 ? (
                          <th
                            scope="row"
                            className="p-5 font-semibold"
                            key={cell}
                          >
                            {cell}
                          </th>
                        ) : (
                          <td className="p-5" key={cell}>
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
          <section className="mt-16 rounded-2xl border border-blue-200 bg-blue-50 p-6 dark:border-blue-900 dark:bg-slate-900">
            <h2 className="text-2xl font-extrabold text-slate-950 dark:text-white">
              Keep the report’s limits in mind
            </h2>
            <p className={prose}>
              The rules detect selected English cues. They can flag harmless
              wording and miss important claims. Source candidates are not
              verified citations or authority ratings.
            </p>
            <p className={prose}>
              Imported pages may omit hidden or script-loaded content. Partial
              reports are labeled. Your manual decisions measure review progress
              rather than factual accuracy.
            </p>
            <p className={prose}>
              Use the{" "}
              <Link
                href="/tools/ai-citation-readiness-checker"
                className="text-[#4058d0] underline dark:text-blue-200"
              >
                AI Citation Readiness Checker
              </Link>{" "}
              for a separate content-structure review.
            </p>
          </section>
          <section className="mt-16">
            <h2 className="text-3xl font-extrabold text-slate-950 dark:text-white">
              Questions about content evidence review
            </h2>
            <div className="mt-7 grid items-start gap-4 md:grid-cols-2">
              {faqs.map(([question, answer]) => (
                <details
                  className="rounded-xl border border-slate-200 p-5 dark:border-slate-700"
                  key={question}
                >
                  <summary className="cursor-pointer font-bold leading-7 text-slate-900 dark:text-white">
                    {question}
                  </summary>
                  <p className={prose}>{answer}</p>
                </details>
              ))}
            </div>
          </section>
        </div>
      </section>
      <ToolResources slug="content-evidence-review" />
    </>
  );
}
