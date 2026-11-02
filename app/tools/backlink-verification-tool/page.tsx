import type { Metadata } from "next";
import Link from "next/link";
import {
  CheckCheck,
  FileCheck2,
  GitCompareArrows,
  Link2,
  ScanSearch,
} from "lucide-react";
import BacklinkClient from "@/features/backlink-verifier/BacklinkClient";
import ToolFaq from "@/features/tool-ui/ToolFaq";
import ToolResources from "@/features/tool-catalog/ToolResources";
import {
  ToolHeroBackground,
  toolHeroHeading,
  toolHeroSurface,
} from "@/features/tool-ui/ToolHero";

const pageUrl = "https://doitwithai.tools/tools/backlink-verification-tool";
const title = "Free Backlink Verification Tool | Check Link Status & Anchors";
const description =
  "Verify backlinks on supplied pages. Check anchors, link attributes, redirects, and destination responses. Compare saved checks and export clear CSV reports.";
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
    question: "What does this backlink verification tool do?",
    answer:
      "It checks pages you supply for links to your domain or exact page. Each result includes the observed anchor, attributes, context, and verification limits.",
  },
  {
    question: "Can this tool discover every backlink to my website?",
    answer:
      "Supply source page URLs or import a CSV of known linking pages. This tool does not search a backlink database or discover every incoming link.",
  },
  {
    question: "How do I check whether a backlink is dofollow or nofollow?",
    answer:
      "Expand a result to inspect its rel values and page-level nofollow directives. Ordinary links need no special follow attribute. This does not predict ranking value.",
  },
  {
    question: "Why is a visible backlink reported as missing?",
    answer:
      "The link may load through JavaScript or an iframe. Check the final source URL and matching settings. You can also inspect supplied page HTML.",
  },
  {
    question: "Does an access error mean my backlink was removed?",
    answer:
      "An inaccessible, blocked, or timed-out page leaves link presence unverified. Recheck later or review the publisher’s page before drawing a conclusion.",
  },
  {
    question: "Can I check multiple backlinks at once?",
    answer:
      "Add up to 50 unique source pages. Checks run in batches of five. Each source can retain up to 100 matching link placements.",
  },
  {
    question: "Does this tool confirm that a backlink is indexed by Google?",
    answer:
      "It reports observed noindex directives, canonical tags, and robots policy. These signals do not establish Google’s actual index status or its selected canonical.",
  },
  {
    question: "Are nofollow, sponsored, or ugc links automatically bad?",
    answer:
      "These attributes describe link relationships. Review the actual placement and your expectations. An attribute alone does not establish that a link is harmful or worthless.",
  },
  {
    question: "How do saved comparisons work?",
    answer:
      "Save a completed live run as a baseline in this browser. Run another check with matching target settings to compare observed presence, anchors, and attributes.",
  },
  {
    question: "Does saving a baseline create automatic monitoring?",
    answer:
      "Rechecks are manual. Saved baselines remain on this device until removed. This release does not schedule background checks, send email alerts, or sync reports across devices.",
  },
  {
    question: "Can the tool check redirecting links?",
    answer:
      "It follows bounded source redirects and checks up to six matching destinations per batch. It does not follow every unrelated link to discover indirect backlinks.",
  },
  {
    question: "Is pasted HTML fetched from the publisher?",
    answer:
      "Pasted HTML is supplied evidence. It is parsed without running scripts. The report does not verify its live HTTP status, robots policy, or destinations.",
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
        name: "Backlink Verification Tool",
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
          { name: "Backlink Verification Tool", item: pageUrl },
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
            <span aria-current="page">Backlink verification</span>
          </nav>
          <div className="grid items-center gap-8 lg:grid-cols-[1.35fr_0.85fr]">
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-[#b4c3ff]">
                Off-page SEO · Backlink verification
              </p>
              <h1 className="mt-4 text-3xl font-black leading-tight sm:text-4xl lg:text-5xl">
                Verify live backlinks and{" "}
                <span className={toolHeroHeading}>review every placement</span>
              </h1>
              <p className="mt-5 max-w-2xl text-base leading-8 text-slate-300">
                Check whether known pages still link to you. Inspect anchors,
                link attributes, redirects, and source evidence in one clear
                report.
              </p>
              <div className="mt-7 flex flex-wrap gap-3 text-xs font-semibold text-slate-200">
                <span className="rounded-lg border border-white/15 px-3 py-2">
                  Bulk source checks
                </span>
                <span className="rounded-lg border border-white/15 px-3 py-2">
                  CSV import and export
                </span>
                <span className="rounded-lg border border-white/15 px-3 py-2">
                  Saved manual comparisons
                </span>
              </div>
            </div>
            <div
              aria-label="Illustrative evidence preview"
              className="rounded-2xl border border-[#9aabff]/30 bg-[#101b30]/90 p-6 shadow-xl"
            >
              <p className="text-xs font-bold uppercase tracking-wider text-[#b4c3ff]">
                Example evidence
              </p>
              <div className="mt-5 flex gap-3">
                <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-emerald-400/10 text-emerald-300">
                  <CheckCheck aria-hidden size={21} />
                </span>
                <div>
                  <p className="text-base font-bold">Link found in HTML</p>
                  <p className="mt-1 text-xs leading-6 text-slate-400">
                    Review the exact placement before deciding.
                  </p>
                </div>
              </div>
              <dl className="mt-5 space-y-3 border-t border-slate-700 pt-4 text-xs">
                <div className="flex justify-between gap-4">
                  <dt className="text-slate-400">Anchor</dt>
                  <dd>Example guide</dd>
                </div>
                <div className="flex justify-between gap-4">
                  <dt className="text-slate-400">Link rel</dt>
                  <dd>nofollow</dd>
                </div>
                <div className="flex justify-between gap-4">
                  <dt className="text-slate-400">Google index status</dt>
                  <dd>Not measured</dd>
                </div>
              </dl>
            </div>
          </div>
        </div>
      </header>
      <BacklinkClient />
      <section
        className={`${section} border-t border-slate-200 dark:border-slate-800`}
      >
        <p className="text-xs font-bold uppercase tracking-wider text-[#5271ff]">
          Know what you are checking
        </p>
        <h2 className="mt-3 text-3xl font-extrabold">
          Backlink verification starts with known linking pages
        </h2>
        <p className={prose}>
          A backlink is a link from another website to yours. Verification
          checks whether an expected placement appears in the available page
          HTML.
        </p>
        <p className={prose}>
          We inspect the URLs you provide. Bring a publisher’s article,
          directory listing, partner page, or export of known linking pages.
        </p>
        <div className="mt-8 grid gap-5 md:grid-cols-3">
          {[
            [
              ScanSearch,
              "Find every retained placement",
              "Inspect multiple matches on the same source page. Text links and image links keep their own anchors, attributes, and surrounding context.",
            ],
            [
              FileCheck2,
              "Separate absence from uncertainty",
              "Blocked requests, source errors, and incomplete fetches remain unverified. A technical access problem does not establish that a publisher removed your link.",
            ],
            [
              GitCompareArrows,
              "Keep a useful review trail",
              "Save a live baseline on this device. Compare a later manual check and export observed changes for your records.",
            ],
          ].map(([Icon, heading, text]) => {
            const Graphic = Icon as typeof Link2;
            return (
              <div
                key={String(heading)}
                className="rounded-2xl border border-slate-200 bg-slate-50 p-6 dark:border-slate-700 dark:bg-slate-900"
              >
                <Graphic aria-hidden className="text-[#5271ff]" size={25} />
                <h3 className="mt-4 text-lg font-bold">{String(heading)}</h3>
                <p className={prose}>{String(text)}</p>
              </div>
            );
          })}
        </div>
      </section>
      <section
        className={`${section} border-t border-slate-200 dark:border-slate-800`}
      >
        <h2 className="text-3xl font-extrabold">
          How to check backlinks in three steps
        </h2>
        <ol className="mt-8 grid gap-5 md:grid-cols-3">
          {[
            [
              "Choose your target",
              "Enter your website for domain matching, or select an exact page URL. Include subdomains only when they belong in your review.",
            ],
            [
              "Add the source pages",
              "Paste one linking-page URL per line or import a source CSV. Use pasted HTML when you already have page evidence to inspect.",
            ],
            [
              "Review, compare, and export",
              "Expand each source result. Check individual placements, inspect review notes, and export a CSV before contacting the publisher.",
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
      </section>
      <section className={section}>
        <h2 className="text-3xl font-extrabold">
          Understand the result before taking action
        </h2>
        <div className="mt-7 overflow-x-auto rounded-2xl border border-slate-200 dark:border-slate-700">
          <table className="w-full min-w-[580px] text-left text-sm leading-7">
            <caption className="sr-only">
              Backlink result meanings and suggested next steps
            </caption>
            <thead className="bg-slate-100 dark:bg-slate-900">
              <tr>
                <th scope="col" className="p-4">
                  Result
                </th>
                <th scope="col" className="p-4">
                  What we observed
                </th>
                <th scope="col" className="p-4">
                  Useful next step
                </th>
              </tr>
            </thead>
            <tbody>
              {[
                [
                  "Link found",
                  "At least one matching link appeared in the checked HTML.",
                  "Review the anchor, relationship, context, and destination response.",
                ],
                [
                  "Not found in HTML",
                  "A complete HTML check found no matching placement.",
                  "Check rendering, final source URL, and your matching settings.",
                ],
                [
                  "Different target page",
                  "Links point to other pages on the selected domain.",
                  "Confirm whether the publisher linked to the intended page.",
                ],
                [
                  "Unable to verify",
                  "Access, response, or extraction limits prevented a clear answer.",
                  "Retry later or review supplied HTML. Do not label the backlink lost.",
                ],
              ].map((row) => (
                <tr
                  className="border-t border-slate-200 dark:border-slate-700"
                  key={row[0]}
                >
                  {row.map((cell, i) =>
                    i === 0 ? (
                      <th scope="row" className="p-4 font-semibold" key={i}>
                        {cell}
                      </th>
                    ) : (
                      <td
                        className="p-4 text-slate-600 dark:text-slate-300"
                        key={i}
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
            Read link evidence in context
          </h2>
          <p className={prose}>
            Inspect link-level attributes alongside page-level instructions. A
            page can declare nofollow even when an individual link has no rel
            value.
          </p>
          <p className={prose}>
            Ordinary links require no special follow attribute. Sponsored and
            user-generated placements have their own relationship labels.
          </p>
          <p className={prose}>
            Image links can use image alt text as their anchor. An empty anchor
            should prompt a closer review of the actual placement.
          </p>
          <p className={prose}>
            These observations describe the checked markup. They do not measure
            authority, referral traffic, ranking impact, or whether a link is
            harmful.
          </p>
        </div>
        <div className="rounded-2xl border border-slate-200 p-6 dark:border-slate-700">
          <h2 className="text-2xl font-extrabold">
            Choose the right matching rule
          </h2>
          <p className={prose}>
            <strong>Domain mode</strong> accepts any direct link to the chosen
            host. Root and www hosts are grouped together.
          </p>
          <p className={prose}>
            <strong>Include subdomains</strong> also accepts hosts beneath the
            target. It does not accept unrelated domains containing the same
            text.
          </p>
          <p className={prose}>
            <strong>Exact page mode</strong> compares the normalized protocol,
            host, path, and query. Fragments are ignored, while different query
            strings or trailing slashes remain distinct.
          </p>
          <p className={prose}>
            If a publisher links through a separate tracking service, supply the
            direct placement for manual review. We do not follow every unrelated
            outbound URL.
          </p>
        </div>
      </section>
      <section className={section}>
        <div className="rounded-3xl border border-[#5271ff]/30 bg-[#5271ff]/5 p-7 sm:p-9">
          <h2 className="text-2xl font-extrabold">
            Keep the limits visible in your report
          </h2>
          <div className="mt-4 grid gap-x-10 md:grid-cols-2">
            <p className={prose}>
              Live runs accept 50 unique sources, processed in batches of five.
              Each fetched HTML response is limited to 2 MB.
            </p>
            <p className={prose}>
              Each source retains up to 100 matching placements. Up to six
              unique matching destinations are checked per batch; others stay
              labelled unchecked.
            </p>
            <p className={prose}>
              JavaScript is not executed, and iframe documents are not opened.
              Pasted HTML reports are separate from live verification evidence.
            </p>
            <p className={prose}>
              Saved baselines stay in this browser. Rechecks are manual, and an
              unavailable source cannot establish that a previously observed
              backlink disappeared.
            </p>
          </div>
        </div>
      </section>
      <ToolFaq title="Questions about verifying backlinks" faqs={faqs} />
      <ToolResources slug="backlink-verification-tool" />
    </div>
  );
}
