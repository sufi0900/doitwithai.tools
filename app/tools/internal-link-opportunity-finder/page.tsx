import type { Metadata } from "next";
import Link from "next/link";
import { Link2, Search, FileCheck2 } from "lucide-react";
import InternalLinkingClient from "@/features/internal-linking/Client";
import ToolResources from "@/features/tool-catalog/ToolResources";
const pageUrl =
  "https://doitwithai.tools/tools/internal-link-opportunity-finder";
const description =
  "Find relevant internal links for an article. Discover sitemap pages, review exact anchor placements, inspect page coverage, and export suggestions.";
const image = `https://doitwithai.tools/api/og?${new URLSearchParams({ title: "Internal Link Opportunity Finder", category: "AI SEO · Content Writing", ctaText: "Discover. Match. Review.", features: "Sitemap Discovery,Exact Anchors,CSV Export" })}`;
export const metadata: Metadata = {
  title: "Internal Link Opportunity Finder: Review Exact Placements",
  description,
  alternates: { canonical: pageUrl },
  openGraph: {
    title: "Internal Link Opportunity Finder",
    description,
    url: pageUrl,
    type: "website",
    images: [{ url: image, width: 1200, height: 630 }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Internal Link Opportunity Finder",
    description,
    images: [image],
  },
};
const prose = "mt-4 text-sm leading-8 text-slate-600 dark:text-slate-300";
export default function Page() {
  const schema = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebApplication",
        name: "Internal Link Opportunity Finder",
        url: pageUrl,
        description,
        applicationCategory: "BusinessApplication",
        operatingSystem: "Any",
        browserRequirements: "Requires JavaScript",
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { name: "Home", item: "https://doitwithai.tools" },
          { name: "Tools", item: "https://doitwithai.tools/tools" },
          { name: "Internal Link Opportunity Finder", item: pageUrl },
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
      <div className="relative overflow-hidden bg-slate-950 pb-20 pt-10 sm:pt-16">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,rgba(255,255,255,0.08)_1px,transparent_0)] bg-[size:28px_28px]"
        />
        <div
          aria-hidden
          className="absolute -left-32 top-10 h-96 w-96 rounded-full bg-[#5271ff]/25 blur-3xl"
        />
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <nav
            aria-label="Breadcrumb"
            className="flex flex-wrap gap-2 text-xs text-slate-400"
          >
            <Link href="/">Home</Link>
            <span>/</span>
            <Link href="/tools">Tools</Link>
            <span>/</span>
            <span aria-current="page" className="text-blue-200">
              Internal Link Opportunity Finder
            </span>
          </nav>
          <header className="mx-auto mb-14 mt-12 max-w-5xl text-center text-white">
            <p className="inline-flex rounded-full border border-white/15 bg-white/10 px-4 py-2 text-xs font-bold uppercase tracking-widest text-blue-100">
              AI SEO · Content Writing
            </p>
            <h1 className="mt-7 text-balance text-4xl font-black tracking-tight sm:text-6xl lg:text-7xl">
              Internal Link Opportunity Finder
              <span className="mt-3 block text-balance bg-gradient-to-r from-blue-300 via-cyan-300 to-violet-300 bg-clip-text text-transparent">
                Connect Your Content Where It Helps
              </span>
            </h1>
            <p className="mx-auto mt-6 max-w-3xl text-base leading-8 text-slate-300 sm:text-lg">
              Find relevant pages on your website and see exactly where an
              internal link could help your reader. Review every placement
              before publishing.
            </p>
            <div className="mt-7 flex flex-wrap justify-center gap-3 text-xs font-bold text-slate-300">
              {[
                [Link2, "Article URL or pasted text"],
                [Search, "Bounded sitemap discovery"],
                [FileCheck2, "Exact passages and export"],
              ].map(([Icon, label]) => {
                const I = Icon as typeof Link2;
                return (
                  <span
                    key={label as string}
                    className="inline-flex items-center gap-2 rounded-full border border-white/10 px-3 py-2"
                  >
                    <I aria-hidden className="h-4 w-4 text-blue-300" />
                    {label as string}
                  </span>
                );
              })}
            </div>
          </header>
          <InternalLinkingClient />
        </div>
      </div>
      <div className="mx-auto max-w-7xl space-y-20 px-4 py-20 sm:px-6 lg:px-8">
        <section className="grid gap-8 lg:grid-cols-2">
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-[#4662df] dark:text-blue-300">
              Reader value before link counts
            </p>
            <h2 className="mt-3 text-3xl font-black sm:text-4xl">
              Find the next useful page for your reader
            </h2>
            <p className={prose}>
              An internal link connects two pages on the same website. A useful
              link helps readers explore a related explanation, example, or
              tool.
            </p>
            <p className={prose}>
              This finder starts with an article URL. It discovers candidate
              pages through sitemaps or uses the destination URLs you supply.
            </p>
            <p className={prose}>
              It reads promising destinations, compares their content, and looks
              for natural placements within the source article. Each result
              shows the original passage.
            </p>
            <p className={prose}>
              The highlighted words become the proposed anchor. You can copy
              those words and the destination URL, then add the link in your
              editor.
            </p>
          </div>
          <aside className="rounded-3xl bg-slate-950 p-8 text-white">
            <h3 className="text-2xl font-bold">A suggestion you can inspect</h3>
            <p className="mt-4 text-sm leading-8 text-slate-300">
              The tool does not add links automatically. It checks destination
              membership, source wording, topic overlap, and existing source
              links where detectable.
            </p>
            <p className="mt-4 text-sm leading-8 text-slate-300">
              AI review evaluates candidate placements when available.
              Text-match results use shared phrases and remain clearly labeled.
            </p>
            <p className="mt-4 text-sm leading-8 text-slate-300">
              A related topic does not always deserve a link. Read both pages
              and confirm that the destination delivers what the anchor
              promises.
            </p>
          </aside>
        </section>
        <section>
          <h2 className="text-3xl font-black">
            From one article to reviewable placements
          </h2>
          <div className="mt-7 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {[
              [
                "01",
                "Choose the source article",
                "Enter a public article URL. If the page cannot be extracted, paste its text using the optional inputs.",
              ],
              [
                "02",
                "Discover candidate pages",
                "The finder checks available sitemaps. You can provide a sitemap or replace discovery with your own destination URL list.",
              ],
              [
                "03",
                "Read promising destinations",
                "A bounded shortlist is fetched for content checks. Robots restrictions, inaccessible pages, and download limits can reduce coverage.",
              ],
              [
                "04",
                "Review the exact passage",
                "Compare the proposed anchor with its surrounding sentence. Confirm that the destination provides useful detail for that passage.",
              ],
              [
                "05",
                "Apply selected links",
                "Copy the anchor and URL into your editor. Check existing links again, particularly when you supplied plain article text.",
              ],
              [
                "06",
                "Keep a record",
                "Export suggestions as CSV. The workspace is temporary, so download your results before leaving the page.",
              ],
            ].map(([number, title, text]) => (
              <article
                key={number}
                className="rounded-3xl border border-slate-200 p-6 dark:border-slate-800"
              >
                <span className="text-sm font-bold text-[#4662df] dark:text-blue-300">
                  {number}
                </span>
                <h3 className="mt-3 text-xl font-bold">{title}</h3>
                <p className={prose}>{text}</p>
              </article>
            ))}
          </div>
        </section>
        <section className="grid gap-8 lg:grid-cols-2">
          <div>
            <h2 className="text-3xl font-black">
              What makes a useful internal link
            </h2>
            <p className={prose}>
              Specific anchors set a clear expectation. Linking “search intent”
              to a practical intent guide usually communicates more than a
              generic “click here.”
            </p>
            <p className={prose}>
              The surrounding sentence matters too. Add the link where the
              reader encounters a question that the destination answers.
            </p>
            <p className={prose}>
              Avoid linking every repeated phrase. Choose placements that
              improve navigation without interrupting reading or creating
              unnecessary repetition.
            </p>
            <p className={prose}>
              Google recommends descriptive anchor text and crawlable links. Use
              ordinary links in your editor and verify their rendered
              destinations.
            </p>
            <a
              href="https://developers.google.com/search/docs/crawling-indexing/links-crawlable"
              target="_blank"
              rel="noopener noreferrer"
              className="mt-4 inline-flex min-h-11 items-center text-sm font-bold text-[#4662df] underline dark:text-blue-300"
            >
              Read Google’s link guidance
            </a>
          </div>
          <aside className="rounded-3xl border border-slate-200 p-7 dark:border-slate-800">
            <h3 className="text-xl font-bold">Review before adding a link</h3>
            <ul className="mt-5 list-disc space-y-4 pl-5 text-sm leading-7 text-slate-600 dark:text-slate-300">
              <li>
                Does the destination answer a question raised by this passage?
              </li>
              <li>Does the anchor accurately describe the linked page?</li>
              <li>Is the page accessible and suitable for your audience?</li>
              <li>Does this article already contain an equivalent link?</li>
              <li>Would the link improve the reader’s next step?</li>
            </ul>
          </aside>
        </section>
        <section>
          <h2 className="text-3xl font-black">
            Coverage and limits are part of the result
          </h2>
          <p className={prose}>
            This is a bounded opportunity finder. It considers up to 100
            candidates and downloads up to 20 destinations within a fixed time
            budget.
          </p>
          <p className={prose}>
            Sitemap discovery reads up to four sitemap files. Large sitemap
            indexes, omitted URLs, and unreadable pages can leave substantial
            parts of a website unexplored.
          </p>
          <p className={prose}>
            Candidate discovery and successful content analysis are different
            counts. Expand page coverage to see analyzed pages and skipped URLs.
          </p>
          <p className={prose}>
            Compressed downloads and streaming cleanup remove bulky scripts and
            styles before extraction. Very large pages can return clearly marked
            partial coverage. The current version reads server-delivered HTML.
            It does not render JavaScript, use private account access, or
            analyze an entire website without limits.
          </p>
          <p className={prose}>
            Pages with noindex directives or blocked robot access are excluded.
            Analysis stays on the exact hostname supplied in the source URL.
          </p>
          <p className={prose}>
            Source extraction reads up to 1,200 passages within 240,000
            characters. AI review receives up to 40 relevant passages within a
            fixed text budget. Pasted articles use up to 60 paragraphs and
            accept 40,000 characters.
          </p>
        </section>
        <section>
          <h2 className="text-3xl font-black">
            Internal link finder questions
          </h2>
          <div className="mt-7 divide-y divide-slate-200 rounded-3xl border border-slate-200 px-6 dark:divide-slate-800 dark:border-slate-800">
            {[
              [
                "Will it discover every URL on my website?",
                "No. It reads available sitemaps within limits. Missing sitemap entries and large websites reduce coverage. Supply specific URLs when you need targeted analysis.",
              ],
              [
                "Can I analyze a page without a sitemap?",
                "Yes. Paste destination URLs in the optional inputs. They replace sitemap discovery, and the tool fetches their content for review.",
              ],
              [
                "Does it work outside WordPress?",
                "Yes, when the website provides readable HTML. The current version does not require a CMS plugin or automatically publish changes.",
              ],
              [
                "Why did a destination get skipped?",
                "Possible reasons include robot restrictions, noindex directives, inaccessible pages, download limits, and missing readable paragraphs. The coverage panel reports observed outcomes.",
              ],
              [
                "What happens when AI review fails?",
                "The service tries its configured backup provider automatically. If review still fails, an error preserves your inputs for another attempt.",
              ],
              [
                "Does the tool detect orphan pages?",
                "No. One article and a bounded destination sample cannot establish whether a page has no incoming links across the website.",
              ],
              [
                "Can it check existing links in pasted text?",
                "Plain text does not preserve hyperlinks. Check your editor before applying suggestions. Fetched article links are checked where extraction can detect them.",
              ],
              [
                "Will it save or publish my results?",
                "No. Download the CSV to keep suggestions. The tool does not edit your website. Relevant extracted content may reach our AI provider during review.",
              ],
              [
                "Can internal links guarantee better rankings?",
                "No. Links can help navigation and discovery, but this tool does not measure ranking impact or guarantee search visibility.",
              ],
            ].map(([q, a]) => (
              <details key={q} className="py-5">
                <summary className="cursor-pointer text-base font-bold leading-7">
                  {q}
                </summary>
                <p className={prose}>{a}</p>
              </details>
            ))}
          </div>
        </section>
        <ToolResources slug="internal-link-opportunity-finder" />
      </div>
    </>
  );
}
