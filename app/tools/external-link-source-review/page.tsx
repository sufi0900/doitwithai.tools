import type { Metadata } from "next";
import Link from "next/link";
import Client from "@/features/external-links/Client";
import ToolResources from "@/features/tool-catalog/ToolResources";
import {
  ToolHeroBackground,
  toolHeroHeading,
  toolHeroSurface,
} from "@/features/tool-ui/ToolHero";
const pageUrl = "https://doitwithai.tools/tools/external-link-source-review";
const title = "External Link and Source Review | Inspect Outbound Links";
const description =
  "Review outbound links, anchor text, source context, and link attributes. Record editorial decisions and export a practical source review checklist.";
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
  [
    "Does this tool check broken links?",
    "No. It inspects links extracted from the supplied page. Destination status, redirects, and source content remain unchecked. Open a destination to inspect it yourself.",
  ],
  [
    "Is linking to a competitor an SEO error?",
    "A competitor label alone does not establish a problem. Judge whether the reference helps readers and accurately supports the surrounding content.",
  ],
  [
    "Does every external link need nofollow?",
    "No. Ordinary editorial links do not require special qualification. Google recommends sponsored for paid placements and ugc for user-generated links.",
  ],
  [
    "Why can one destination appear several times?",
    "Each occurrence can have different anchor wording, attributes, and surrounding content. Review occurrences separately rather than treating every repeated link as a duplicate error.",
  ],
  [
    "Why are some links missing?",
    "The importer prefers main content and excludes navigation, footers, and sidebars. Script-loaded links, unsupported markup, and extraction limits can leave links uninspected.",
  ],
  [
    "Does a familiar domain prove a source is reliable?",
    "No. Check the exact page, author, publication date, original evidence, and relevance. This report does not assign authority scores or verify factual support.",
  ],
  [
    "Can I paste HTML without a page URL?",
    "Yes, but links remain unclassified. Add the page URL to resolve relative destinations and distinguish internal links from links to another origin.",
  ],
  [
    "Will saving a decision edit my website?",
    "No. Save and export your review decisions, then make any changes through your website editor. Reports clear when you leave or reload.",
  ],
];
const prose = "mt-4 text-base leading-8 text-slate-600 dark:text-slate-300";
export default function Page() {
  const schema = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebApplication",
        name: "External Link and Source Review",
        url: pageUrl,
        description,
        applicationCategory: "BusinessApplication",
        operatingSystem: "Any",
        isAccessibleForFree: true,
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { name: "Home", item: "https://doitwithai.tools" },
          { name: "Tools", item: "https://doitwithai.tools/tools" },
          { name: "External Link and Source Review", item: pageUrl },
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
        className={`relative overflow-hidden ${toolHeroSurface} px-5 py-14 text-white`}
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
            <span aria-current="page">External Link and Source Review</span>
          </nav>
          <header className="mx-auto max-w-4xl text-center">
            <p className="text-xs font-bold uppercase tracking-widest text-blue-200">
              On-page SEO · Thoughtful source review
            </p>
            <h1 className="mt-6 text-4xl font-black leading-tight tracking-tight sm:text-6xl">
              External Link and Source Review
              <span className={`mt-4 block ${toolHeroHeading}`}>
                See what your links tell readers.
              </span>
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-base leading-8 text-blue-100 sm:text-lg">
              Inspect outbound references in context. Review anchor wording and
              link relationships, then record the changes you want to make.
            </p>
            <a
              href="#external-link-workspace"
              className="mt-8 inline-flex min-h-12 items-center rounded-xl bg-white px-6 py-3 text-sm font-bold text-[#3048bb]"
            >
              Review your outbound links
            </a>
          </header>
        </div>
      </section>
      <section className="bg-slate-50 px-3 py-10 dark:bg-[#0c1422] sm:px-6">
        <div className="mx-auto max-w-6xl">
          <Client />
        </div>
      </section>
      <section className="bg-white px-5 py-16 dark:bg-slate-950">
        <div className="mx-auto max-w-6xl">
          <h2 className="text-3xl font-extrabold text-slate-950 dark:text-white">
            Make each reference useful
          </h2>
          <p className={`${prose} max-w-3xl`}>
            A link can support an explanation, give readers background, or
            document a source. Its value depends on the destination and
            surrounding context.
          </p>
          <div className="mt-9 grid gap-5 md:grid-cols-3">
            {[
              [
                "Import your article",
                "Enter a public page URL, or paste HTML. Add the original page URL when resolving relative links from pasted content.",
              ],
              [
                "Inspect each occurrence",
                "Read the anchor and surrounding passage together. Open the destination to check whether readers will find the information they expect.",
              ],
              [
                "Save an editorial decision",
                "Identify the relationship and choose keep, update, or remove. Add notes and export your saved decisions before leaving the page.",
              ],
            ].map(([heading, text]) => (
              <article
                className="min-w-0 rounded-2xl border border-slate-200 p-6 dark:border-slate-700"
                key={heading}
              >
                <h3 className="text-lg font-bold text-slate-950 dark:text-white">
                  {heading}
                </h3>
                <p className={prose}>{text}</p>
              </article>
            ))}
          </div>
          <div className="mt-14 grid gap-8 lg:grid-cols-2">
            <section>
              <h2 className="text-2xl font-bold text-slate-950 dark:text-white">
                Review the anchor, not just the URL
              </h2>
              <p className={prose}>
                An anchor such as “click here” gives little context on its own.
                Describe the destination when clearer wording would help
                readers.
              </p>
              <p className={prose}>
                For example, “Read the survey methodology” explains more than
                “source” when linking to a study’s methods section.
              </p>
              <p className={prose}>
                This report flags short generic labels for review. It does not
                claim every flagged anchor is wrong.
              </p>
              <a
                href="https://developers.google.com/search/docs/crawling-indexing/links-crawlable"
                className="mt-4 inline-flex text-sm font-bold text-[#4058d0] underline dark:text-blue-200"
              >
                Read Google’s link and anchor guidance
              </a>
            </section>
            <section>
              <h2 className="text-2xl font-bold text-slate-950 dark:text-white">
                Check the relationship before changing rel
              </h2>
              <p className={prose}>
                Ordinary editorial references do not require a special rel
                value. Paid placements and user-generated links have different
                qualification guidance.
              </p>
              <p className={prose}>
                Google recommends sponsored for paid placements. Nofollow
                remains an accepted alternative. User-generated links can use
                ugc or another appropriate qualification.
              </p>
              <p className={prose}>
                The tool cannot infer a commercial relationship from the URL.
                Select the relationship yourself to see relevant guidance.
              </p>
              <a
                href="https://developers.google.com/search/docs/crawling-indexing/qualify-outbound-links"
                className="mt-4 inline-flex text-sm font-bold text-[#4058d0] underline dark:text-blue-200"
              >
                Read Google’s outbound-link guidance
              </a>
            </section>
          </div>
          <section className="mt-14 rounded-2xl border border-blue-200 bg-blue-50 p-6 dark:border-blue-900 dark:bg-slate-900">
            <h2 className="text-2xl font-bold text-slate-950 dark:text-white">
              A source checklist without invented authority scores
            </h2>
            <ul className="mt-5 list-disc space-y-3 pl-5 text-base leading-8 text-slate-600 dark:text-slate-300">
              <li>
                Check whether the exact destination supports the statement you
                made.
              </li>
              <li>
                Prefer original evidence when it is available and relevant.
              </li>
              <li>
                Review dates, methods, authorship, and important qualifications.
              </li>
              <li>
                Do not treat a recognizable brand as proof that every page is
                accurate.
              </li>
              <li>
                Judge competitor references by their usefulness, rather than
                automatically removing them.
              </li>
            </ul>
            <p className={prose}>
              Use{" "}
              <Link
                href="/tools/content-evidence-review"
                className="text-[#4058d0] underline dark:text-blue-200"
              >
                Content Evidence Review
              </Link>{" "}
              to track claims and supporting notes. Review broader page signals
              with the{" "}
              <Link
                href="/tools/on-page-ai-seo-analyzer"
                className="text-[#4058d0] underline dark:text-blue-200"
              >
                On-page AI SEO Analyzer
              </Link>
              .
            </p>
          </section>
          <section className="mt-14">
            <h2 className="text-3xl font-extrabold text-slate-950 dark:text-white">
              Questions about outbound source review
            </h2>
            <div className="mt-7 grid items-start gap-4 md:grid-cols-2">
              {faqs.map(([q, a]) => (
                <details
                  className="rounded-xl border border-slate-200 p-5 dark:border-slate-700"
                  key={q}
                >
                  <summary className="cursor-pointer font-bold leading-7 text-slate-900 dark:text-white">
                    {q}
                  </summary>
                  <p className={prose}>{a}</p>
                </details>
              ))}
            </div>
          </section>
        </div>
      </section>
      <ToolResources slug="external-link-source-review" />
    </>
  );
}
