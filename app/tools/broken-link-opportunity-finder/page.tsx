import type { Metadata } from "next";
import ToolLandingHero from "@/features/tool-ui/ToolLandingHero";
import Link from "next/link";
import BrokenLinksClient from "@/features/broken-links/BrokenLinksClient";
import ToolFaq from "@/features/tool-ui/ToolFaq";
const pageUrl = "https://doitwithai.tools/tools/broken-link-opportunity-finder";
const title = "Broken Link Opportunity Finder | Check Resource Page Links";
const description =
  "Find broken external links on supplied resource pages. Review HTTP 404 and 410 candidates, anchor text, redirects, and source context. Download CSV evidence.";
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
    question: "What does the Broken Link Opportunity Finder do?",
    answer:
      "It reads publisher pages you supply and checks a bounded set of external destination URLs. HTTP 404 and 410 responses become review candidates.",
  },
  {
    question: "Does it discover every website that could link to me?",
    answer:
      "No. It checks supplied pages rather than searching a web-wide backlink index. Bring relevant resource pages from your own research.",
  },
  {
    question: "Which pages should I enter?",
    answer:
      "Use specific articles, reading lists, or resource pages discussing your topic. A domain homepage alone may not contain useful editorial references.",
  },
  {
    question: "What do HTTP 404 and 410 mean here?",
    answer:
      "They indicate a missing or removed destination in this check. Confirm the result manually because access rules and temporary behavior can affect responses.",
  },
  {
    question: "Are HTTP 403 and 429 broken links?",
    answer:
      "Not necessarily. They can indicate blocked access or request limits. This tool labels them unverified, rather than treating them as dead-resource opportunities.",
  },
  {
    question: "What happens when a link redirects?",
    answer:
      "The checker follows up to five redirects and records the chain. A successful final response is labeled redirected, rather than broken.",
  },
  {
    question: "How many pages and links can I check?",
    answer:
      "Submit up to five unique publisher pages per run. Each page selects fifteen unique external URLs by default, with an optional maximum of thirty.",
  },
  {
    question: "Does supplied HTML bypass destination checks?",
    answer:
      "No. HTML supplies source-page evidence only. Destinations still receive live checks, with network restrictions and crawler policies respected.",
  },
  {
    question: "Can the checker find JavaScript links or soft 404s?",
    answer:
      "It does not render JavaScript or inspect destination content for soft 404s. A successful HTTP response alone does not prove resource quality.",
  },
  {
    question: "Does a candidate guarantee a backlink?",
    answer:
      "No. Your proposed replacement must suit the source’s audience and purpose. Publishers decide whether a change helps their readers.",
  },
  {
    question: "Can I download the results?",
    answer:
      "Yes. Export all source and destination evidence, or export only HTTP 404 and 410 candidates as CSV. Failed checks remain distinct from missing links.",
  },
  {
    question: "Does the tool contact publishers?",
    answer:
      "No. It collects evidence for your review. It does not send messages, identify private contact details, or promise outreach success.",
  },
];
const section = "mx-auto max-w-6xl px-4 py-12 sm:px-6";
const text = "mt-4 text-base leading-8 text-slate-600 dark:text-slate-300";
export default function Page() {
  const schema = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebApplication",
        name: "Broken Link Opportunity Finder",
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
          { name: "Broken Link Opportunity Finder", item: pageUrl },
        ].map((entry, i) => ({
          "@type": "ListItem",
          position: i + 1,
          ...entry,
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
        slug="broken-link-opportunity-finder"
        title="Broken Link Opportunity Finder with evidence worth reviewing"
        description="Inspect relevant resource pages for missing external destinations. Keep the source, anchor text, and response evidence before considering a replacement."
        categoryLabel="Off-page SEO"
        categoryHref="/tools"
        workspaceId="tool-studio-workspace"
      >
        <div className="p-4 sm:p-6">
          <BrokenLinksClient />
        </div>
      </ToolLandingHero>
      <section className={section}>
        <h2 className="text-3xl font-extrabold">
          Find a reason to review a reference
        </h2>
        <p className={text}>
          Resource lists and editorial articles can link to pages that have
          moved or disappeared. A relevant replacement may help readers continue
          their research.
        </p>
        <p className={text}>
          This broken link building tool starts with publisher pages you already
          know. It reports observed responses without inventing authority
          scores, traffic estimates, or outreach probabilities.
        </p>
        <div className="mt-8 grid gap-5 md:grid-cols-3">
          {[
            [
              "Start with context",
              "See the publisher page, anchor wording, and surrounding text. Understand why the resource was included before suggesting another page.",
            ],
            [
              "Separate failures correctly",
              "Review missing resources separately from blocked requests, rate limits, redirects, and temporary server errors.",
            ],
            [
              "Keep the evidence",
              "Download CSV rows with source URLs, destinations, timestamps, response codes, redirect chains, and scan limits.",
            ],
          ].map(([heading, body]) => (
            <div
              key={heading}
              className="rounded-2xl border border-slate-200 p-6 dark:border-slate-700"
            >
              <h3 className="text-lg font-bold">{heading}</h3>
              <p className={text}>{body}</p>
            </div>
          ))}
        </div>
      </section>
      <section className={section}>
        <h2 className="text-3xl font-extrabold">
          How to find broken-link candidates
        </h2>
        <ol className="mt-8 grid gap-5 md:grid-cols-3">
          {[
            [
              "Choose publisher pages",
              "Bring relevant resource lists or articles. Paste one full page URL per line, then press Enter to add another.",
            ],
            [
              "Inspect the selected links",
              "Run the scan. The loading dialog shows publisher-page progress while external destinations receive bounded live checks.",
            ],
            [
              "Assess a useful replacement",
              "Open each candidate, review the original context, and decide whether your resource addresses the same reader need.",
            ],
          ].map(([heading, body], i) => (
            <li
              key={heading}
              className="rounded-2xl bg-slate-50 p-6 dark:bg-slate-900"
            >
              <span className="font-black text-[#3452d1] dark:text-blue-200">
                0{i + 1}
              </span>
              <h3 className="mt-3 text-lg font-bold">{heading}</h3>
              <p className={text}>{body}</p>
            </li>
          ))}
        </ol>
      </section>
      <section className={section}>
        <h2 className="text-3xl font-extrabold">
          Read HTTP evidence without guessing
        </h2>
        <div className="mt-7 overflow-x-auto rounded-2xl border border-slate-200 dark:border-slate-700">
          <table className="w-full min-w-[560px] text-left text-sm leading-7">
            <caption className="sr-only">
              How destination responses are interpreted
            </caption>
            <thead className="bg-slate-100 dark:bg-slate-900">
              <tr>
                {["Observed response", "Result", "Next step"].map((x) => (
                  <th key={x} scope="col" className="p-4">
                    {x}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {[
                [
                  "404 or 410",
                  "Missing-resource candidate",
                  "Confirm in a browser and assess the original purpose.",
                ],
                [
                  "2xx",
                  "Successful HTTP response",
                  "Review content manually; soft 404s are not detected.",
                ],
                [
                  "Redirect to 2xx",
                  "Redirected successfully",
                  "Check whether the final resource still matches the reference.",
                ],
                [
                  "401, 403, or 429",
                  "Unverified access",
                  "Retry later or inspect manually. Do not assume the resource is gone.",
                ],
                [
                  "5xx, timeout, DNS failure, or robots restriction",
                  "Unverified destination",
                  "Preserve the uncertainty and repeat the check if appropriate.",
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
      <section className={`${section} grid gap-7 lg:grid-cols-2`}>
        <div className="rounded-2xl border border-slate-200 p-6 dark:border-slate-700">
          <h2 className="text-2xl font-extrabold">
            What makes a replacement relevant?
          </h2>
          <p className={text}>
            Match the original topic, depth, and reader task. A beginner
            tutorial, research citation, dataset, and interactive tool serve
            different purposes.
          </p>
          <p className={text}>
            Read the anchor and surrounding sentence. Check whether your page
            supports that statement before treating a missing destination as an
            outreach opportunity.
          </p>
          <p className={text}>
            For example, a broken spreadsheet template reference needs a useful
            template or equivalent workflow. A broad product homepage may not
            satisfy that need.
          </p>
        </div>
        <div className="rounded-2xl border border-slate-200 p-6 dark:border-slate-700">
          <h2 className="text-2xl font-extrabold">Know the scan boundaries</h2>
          <p className={text}>
            The scan reads fetched HTML without running scripts. It prioritizes
            main or article content and excludes ordinary navigation, header,
            and footer areas.
          </p>
          <p className={text}>
            It deduplicates destination URLs and checks the first fifteen per
            page by default. Optional settings raise the limit to thirty.
          </p>
          <p className={text}>
            A limit, blocked crawler policy, network failure, or interrupted
            request leaves explicit evidence gaps. No backlink discovery
            database or authority-score provider is used.
          </p>
        </div>
      </section>
      <section className={section}>
        <div className="rounded-3xl border border-[#5271ff]/30 bg-[#5271ff]/5 p-7 sm:p-9">
          <h2 className="text-2xl font-extrabold">
            From a candidate to a considered request
          </h2>
          <p className={text}>
            Confirm the missing destination and review its original purpose.
            Assess your replacement, then contact the publisher only when the
            change would help readers.
          </p>
          <p className={text}>
            The publisher controls its editorial links. This checker does not
            send outreach, promise a replacement, or estimate ranking benefits.
          </p>
        </div>
      </section>
      <ToolFaq title="Broken link building questions" faqs={faqs} />
      <aside className={section} aria-label="Related tools">
        <h2 className="text-2xl font-extrabold">Continue your link research</h2>
        <div className="mt-6 grid gap-5 sm:grid-cols-2">
          {[
            [
              "backlink-verification-tool",
              "Backlink Verification Tool",
              "Verify a known publisher page’s link to your website.",
            ],
            [
              "unlinked-brand-mention-checker",
              "Unlinked Brand Mention Checker",
              "Review brand mentions and their surrounding link context.",
            ],
          ].map(([slug, name, body]) => (
            <Link
              key={slug}
              href={`/tools/${slug}`}
              className="rounded-2xl border border-slate-200 p-6 hover:border-[#5271ff] focus-visible:outline-[#5271ff] dark:border-slate-700"
            >
              <h3 className="text-lg font-bold">{name}</h3>
              <p className={text}>{body}</p>
            </Link>
          ))}
        </div>
      </aside>
    </div>
  );
}
