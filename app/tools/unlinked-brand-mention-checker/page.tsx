import type { Metadata } from "next";
import Link from "next/link";
import { Link2, TextSearch, ScanEye } from "lucide-react";
import MentionClient from "@/features/brand-mentions/MentionClient";
import ToolFaq from "@/features/tool-ui/ToolFaq";
import ToolResources from "@/features/tool-catalog/ToolResources";
import {
  ToolHeroBackground,
  toolHeroHeading,
  toolHeroSurface,
} from "@/features/tool-ui/ToolHero";

const pageUrl = "https://doitwithai.tools/tools/unlinked-brand-mention-checker";
const title = "Unlinked Brand Mention Checker | Review Pages and Links";
const description =
  "Check supplied pages for brand mentions without website links. Review highlighted context, alternate names, existing links, and export source evidence.";
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
    question: "What is an unlinked brand mention?",
    answer:
      "It is a reference to your brand without a direct website link. Review the surrounding text to confirm that the reference identifies your brand.",
  },
  {
    question: "Does this tool discover mentions across the web?",
    answer:
      "No. It checks source page URLs or HTML that you supply. Bring pages from search results, alerts, PR records, or your own research.",
  },
  {
    question: "What do I need before running a check?",
    answer:
      "Enter your brand name, your website, and at least one external page URL. Paste one source URL per line, up to fifty unique pages.",
  },
  {
    question: "Can I check alternate brand names?",
    answer:
      "Yes. Add up to five alternate names in the optional settings. Use distinct names that identify your brand rather than broad topic keywords.",
  },
  {
    question: "How does text matching work?",
    answer:
      "Matching ignores letter case by default and uses word boundaries. It normalizes Unicode and whitespace, including brand text split across ordinary inline elements.",
  },
  {
    question: "What if the page already links to my website elsewhere?",
    answer:
      "The result identifies that existing website link separately. An unlinked text occurrence does not establish a new referring-domain opportunity.",
  },
  {
    question: "Are nofollow, sponsored, and ugc links counted?",
    answer:
      "Yes. They remain direct website links, with recorded rel attributes shown for review. Their presence does not establish ranking value.",
  },
  {
    question:
      "What happens when a mention links to a social profile or redirect?",
    answer:
      "Other destinations receive a review label. The checker does not resolve unrelated destination redirects, so inspect the link before treating it as an opportunity.",
  },
  {
    question: "Why is a page marked unable to verify?",
    answer:
      "Access restrictions, robots rules, network failures, challenges, or analysis limits can prevent a complete check. An unverified result does not prove a missing mention.",
  },
  {
    question: "Does the checker render JavaScript or inspect screenshots?",
    answer:
      "No. It parses fetched or supplied HTML without running scripts. Browser-generated content, external CSS, shadow DOM, iframe pages, and image text are outside this check.",
  },
  {
    question: "Can I use pasted HTML instead of a live check?",
    answer:
      "Yes. Select Paste HTML and provide one source URL with its HTML. This reports supplied evidence and does not verify the publisher's current page.",
  },
  {
    question: "Can I save evidence for a manual review?",
    answer:
      "Shortlist relevant pages, copy their source URLs, or export the filtered evidence as CSV. No outreach or automatic monitoring is performed.",
  },
  {
    question: "Do mentions guarantee backlinks or better rankings?",
    answer:
      "No. A mention can help identify a page to review, but relevance, editorial context, and the publisher's decision still matter.",
  },
];
const section = "mx-auto max-w-6xl px-4 py-12 sm:px-6";
const prose = "mt-4 text-base leading-8 text-slate-600 dark:text-slate-300";
export default function Page() {
  const schema = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebApplication",
        name: "Unlinked Brand Mention Checker",
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
          { name: "Unlinked Brand Mention Checker", item: pageUrl },
        ].map((entry, i) => ({
          "@type": "ListItem",
          position: i + 1,
          ...entry,
        })),
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
            <span aria-current="page">Unlinked brand mentions</span>
          </nav>
          <div className="grid items-center gap-8 lg:grid-cols-[1.2fr_0.9fr]">
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-[#b4c3ff]">
                Off-page SEO · Supplied-page checks
              </p>
              <h1 className="mt-4 text-3xl font-black leading-tight sm:text-4xl lg:text-5xl">
                Unlinked Brand Mention Checker{" "}
                <span className={toolHeroHeading}>
                  with the context to review
                </span>
              </h1>
              <p className="mt-5 text-base leading-8 text-slate-300">
                Check whether supplied pages mention your brand, link that
                mention, or reference your website elsewhere. Keep the source
                evidence behind each result.
              </p>
              <div className="mt-7 flex flex-wrap gap-3 text-xs font-semibold text-slate-200">
                <span className="rounded-lg border border-white/15 px-3 py-2">
                  Brand text + link context
                </span>
                <span className="rounded-lg border border-white/15 px-3 py-2">
                  Live or supplied HTML
                </span>
                <span className="rounded-lg border border-white/15 px-3 py-2">
                  Evidence CSV
                </span>
              </div>
            </div>
            <div className="rounded-2xl border border-[#9aabff]/30 bg-[#101b30]/90 p-6 shadow-xl">
              <p className="text-xs font-bold uppercase tracking-wider text-[#b4c3ff]">
                Illustrative text, fictional publisher
              </p>
              <blockquote className="mt-5 text-lg leading-8">
                “Our editors mentioned{" "}
                <span className="rounded bg-[#5271ff]/25 px-1 font-bold text-[#c6d0ff]">
                  Do It With AI Tools
                </span>{" "}
                when discussing content planning.”
              </blockquote>
              <p className="mt-5 border-t border-slate-700 pt-4 text-sm leading-7 text-slate-300">
                A matching phrase is a starting point. Check its destination and
                the rest of the page before planning outreach.
              </p>
            </div>
          </div>
        </div>
      </header>
      <MentionClient />
      <section
        className={`${section} border-t border-slate-200 dark:border-slate-800`}
      >
        <p className="text-xs font-bold uppercase tracking-wider text-[#5271ff]">
          From a mention to a useful review
        </p>
        <h2 className="mt-3 text-3xl font-extrabold">
          A brand mention and a backlink answer different questions
        </h2>
        <p className={prose}>
          A publisher might name your brand in a resource list, article,
          comparison, or community discussion. That reference can appear with or
          without a clickable link.
        </p>
        <p className={prose}>
          This checker examines pages you already know about. It separates
          matching text from website links so you can assess the actual
          placement.
        </p>
        <div className="mt-8 grid gap-5 md:grid-cols-3">
          {[
            [
              TextSearch,
              "See the matching words",
              "Review your primary brand name and alternate names, with surrounding text that helps identify a relevant reference.",
            ],
            [
              Link2,
              "Follow the evidence",
              "Inspect direct website links and links to other destinations. Link attributes remain visible instead of becoming a quality score.",
            ],
            [
              ScanEye,
              "Review the whole page",
              "A website link in the footer or another paragraph can change how you interpret a plain-text mention.",
            ],
          ].map(([Icon, heading, text]) => {
            const Graphic = Icon as typeof TextSearch;
            return (
              <div
                key={String(heading)}
                className="rounded-2xl border border-slate-200 bg-slate-50 p-6 dark:border-slate-700 dark:bg-slate-900"
              >
                <Graphic size={25} aria-hidden className="text-[#5271ff]" />
                <h3 className="mt-4 text-lg font-bold">{String(heading)}</h3>
                <p className={prose}>{String(text)}</p>
              </div>
            );
          })}
        </div>
      </section>
      <section className={section}>
        <h2 className="text-3xl font-extrabold">
          Start with three simple inputs
        </h2>
        <ol className="mt-8 grid gap-5 md:grid-cols-3">
          {[
            [
              "Your brand name",
              "Use the name people would write in an article. Add distinct variations under optional settings when needed.",
            ],
            [
              "Your website",
              "Enter the website that should receive a relevant reference. The checker accepts direct links to its pages and optional subdomains.",
            ],
            [
              "External source pages",
              "Paste exact page URLs from search results, mention alerts, PR records, or your research. Press Enter to add another page.",
            ],
          ].map(([heading, text], i) => (
            <li
              key={heading}
              className="rounded-2xl border border-[#5271ff]/25 p-6"
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
          Entering a brand name and domain alone does not discover web mentions.
          Source URLs are required because this version checks supplied pages.
        </p>
      </section>
      <section className={section}>
        <h2 className="text-3xl font-extrabold">
          Understand what each result means
        </h2>
        <div className="relative mt-7 overflow-x-auto rounded-2xl border border-slate-200 dark:border-slate-700">
          <table className="w-full min-w-[580px] text-left text-sm leading-7">
            <caption className="sr-only">Brand mention result meanings</caption>
            <thead className="bg-slate-100 dark:bg-slate-900">
              <tr>
                <th scope="col" className="p-4">
                  Result
                </th>
                <th scope="col" className="p-4">
                  HTML evidence
                </th>
                <th scope="col" className="p-4">
                  Next review
                </th>
              </tr>
            </thead>
            <tbody>
              {[
                [
                  "Mention without a website link",
                  "Matching plain text appeared without a direct website link in the inspected HTML.",
                  "Confirm brand identity, relevance, and whether a reference would help the reader.",
                ],
                [
                  "Brand mention linked",
                  "Every recorded mention sits inside a direct link to your website.",
                  "Inspect the destination and attributes before considering another request.",
                ],
                [
                  "Some mentions unlinked",
                  "The page contains both linked and other matching occurrences.",
                  "Review the placement rather than treating every occurrence as a new prospect.",
                ],
                [
                  "Website link elsewhere",
                  "The matching text is not linked to your website, but another page element is.",
                  "Check that existing reference and the publisher's editorial context.",
                ],
                [
                  "Review the linked destination",
                  "A mention links elsewhere or only part of its text is linked.",
                  "Inspect social profiles, third-party destinations, and possible redirects manually.",
                ],
                [
                  "Unable to verify",
                  "Access restrictions or analysis limits prevented a complete conclusion.",
                  "Try supplied HTML or open the page directly before drawing conclusions.",
                ],
              ].map((row) => (
                <tr
                  key={row[0]}
                  className="border-t border-slate-200 dark:border-slate-700"
                >
                  {row.map((cell, i) =>
                    i === 0 ? (
                      <th key={i} scope="row" className="p-4 font-semibold">
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
            Reduce false matches before outreach
          </h2>
          <p className={prose}>
            A short brand name can also be an ordinary word, a person, or
            another business. Matching text alone does not identify the correct
            organization.
          </p>
          <p className={prose}>
            Read the surrounding sentence, topic, and destination. Alternate
            names help with genuine naming variations, but broad keywords can
            increase irrelevant matches.
          </p>
          <p className={prose}>
            Matching uses normalized text and word boundaries. Hidden HTML,
            metadata, scripts, image alt text, and browser-generated text are
            not treated as ordinary visible brand mentions.
          </p>
        </div>
        <div className="rounded-2xl border border-slate-200 p-6 dark:border-slate-700">
          <h2 className="text-2xl font-extrabold">
            Keep link attributes and context visible
          </h2>
          <p className={prose}>
            A nofollow, sponsored, or ugc link still links to your website. The
            checker records supplied attributes without estimating their ranking
            effect.
          </p>
          <p className={prose}>
            Links to other websites may lead through redirects or point to
            official social profiles. Those destinations require manual review
            rather than an automatic opportunity claim.
          </p>
          <p className={prose}>
            The tool does not invent publisher authority, traffic estimates,
            contact details, sentiment, or a likelihood of earning a link.
          </p>
        </div>
      </section>
      <section className={section}>
        <div className="rounded-3xl border border-[#5271ff]/30 bg-[#5271ff]/5 p-7 sm:p-9">
          <h2 className="text-2xl font-extrabold">
            Build a shortlist with a clear reason
          </h2>
          <p className={prose}>
            Shortlist a page when the mention identifies your brand and a
            website reference could add useful context. Keep the exact source
            and surrounding wording.
          </p>
          <p className={prose}>
            Before contacting anyone, review the publication, existing
            references, and any editorial or sponsorship context. A mention does
            not create an obligation to add a link.
          </p>
          <p className={prose}>
            Export the evidence for your records. When you need a closer
            placement check, open the related backlink verifier from the result
            area.
          </p>
        </div>
      </section>
      <section className={section}>
        <h2 className="text-3xl font-extrabold">
          Scope, limits, and data handling
        </h2>
        <div className="mt-5 grid gap-x-10 md:grid-cols-2">
          <p className={prose}>
            Check up to fifty unique source pages, submitted in batches of five.
            Live checks fetch public HTML and relevant robots policies without
            rendering a browser.
          </p>
          <p className={prose}>
            Supplied HTML uses one source URL and accepts up to 750 KB of UTF-8
            text. The source URL helps resolve relative links.
          </p>
          <p className={prose}>
            Analysis is bounded to 200 recorded mentions, 10,000 anchors, 40,000
            visited nodes, and 300,000 text characters. Reached limits prevent
            negative conclusions.
          </p>
          <p className={prose}>
            Your own website&apos;s pages are excluded from external
            opportunities. No automatic discovery, scheduled monitoring, or
            outreach is performed.
          </p>
          <p className={prose}>
            Fetched pages may differ from what a logged-in browser displays.
            External CSS, scripts, iframe pages, and shadow DOM can affect the
            rendered result.
          </p>
          <p className={prose}>
            CSV exports include source URLs, checked dates, matching text,
            destinations, and limitations. Shortlists remain in this page&apos;s
            memory until you leave or run another check.
          </p>
        </div>
      </section>
      <ToolFaq title="Questions about unlinked brand mentions" faqs={faqs} />
      <ToolResources slug="unlinked-brand-mention-checker" />
    </div>
  );
}
