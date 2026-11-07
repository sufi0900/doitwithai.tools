import {
  ToolHeroBackground,
  toolHeroSurface,
  toolHeroHeading,
} from "@/features/tool-ui/ToolHero";
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
      <div className={`relative overflow-hidden ${toolHeroSurface} text-white`}
      >
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
            <span aria-current="page">Internal Link Opportunity Finder</span>
          </nav>

          <div className="mb-8 grid items-center gap-8 lg:grid-cols-[minmax(0,1.35fr)_minmax(0,0.85fr)]">
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-[#b4c3ff]">
                On-Page SEO · Contextual Anchor & Sitemap Matcher
              </p>
              <h1 className="mt-4 text-3xl font-black leading-tight sm:text-4xl lg:text-5xl">
                Internal Link Opportunity 
                <span className={toolHeroHeading}>
                  & Contextual Anchor Finder
                </span>
              </h1>
              <p className="mt-5 max-w-2xl text-base leading-8 text-slate-300">
                Scan your article URL or draft alongside your sitemap to discover natural in-sentence anchor text opportunities that connect related pages for readers and crawlers.
              </p>
              <div className="mt-7 flex flex-wrap gap-3 text-xs font-semibold text-slate-200">
                <span className="rounded-lg border border-white/15 px-3 py-2">
                  Article URL or pasted draft
                </span>
                <span className="rounded-lg border border-white/15 px-3 py-2">
                  Sitemap & URL list import
                </span>
                <span className="rounded-lg border border-white/15 px-3 py-2">
                  Exact passage & anchor export
                </span>
              </div>
            </div>

            <div className="rounded-2xl border border-[#9aabff]/30 bg-[#101b30]/90 p-6 shadow-xl">
              <p className="text-xs font-bold uppercase tracking-wider text-[#b4c3ff]">
                4 Internal Linking Checks
              </p>
              <ul className="mt-4 space-y-2.5 text-xs text-slate-300">
                <li>
                  <strong className="text-emerald-300">Passage Matching:</strong> Finds sentences in your draft that naturally mention target topics.
                </li>
                <li>
                  <strong className="text-indigo-300">Anchor Clarity:</strong> Suggests descriptive multi-word anchors instead of 'click here'.
                </li>
                <li>
                  <strong className="text-sky-300">Sitemap Discovery:</strong> Pulls candidate destination URLs straight from your sitemap.
                </li>
                <li>
                  <strong className="text-amber-300">Editorial Review:</strong> Approve, edit, and export your chosen internal link placements.
                </li>
              </ul>
            </div>
          </div>
          <InternalLinkingClient />
        </div>
      </div>
      <div className="mx-auto max-w-6xl space-y-20 px-4 py-20 sm:px-6 lg:px-8">
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
            The tool considers up to 100 candidate pages and reviews up to 20
            destinations. Check the coverage panel to see which pages were
            included.
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
            Very large or inaccessible pages may receive partial coverage. If a
            page cannot be read, paste its main article text for a focused
            review.
          </p>
          <p className={prose}>
            Pages with noindex directives or blocked robot access are excluded.
            Analysis stays on the exact hostname supplied in the source URL.
          </p>
          <p className={prose}>
            Source extraction reads up to 1,200 passages within 240,000
            characters. AI review receives up to 16 relevant passages within
            8,000 characters, plus eight destination excerpts of 600 characters
            each. Pasted articles use up to 1,200 paragraphs and accept 40,000
            characters.
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
                "Available text matches remain visible with an incomplete-review notice. Check the coverage panel and retry later for a fuller review.",
              ],
              [
                "Does zero suggestions mean my article is fully optimized?",
                "No. The report distinguishes already-linked destinations from pages without validated placements. Check skipped URLs and scan coverage before drawing broader conclusions.",
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
                "No. Download the CSV to keep suggestions. Review and apply any changes in your own website editor.",
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
