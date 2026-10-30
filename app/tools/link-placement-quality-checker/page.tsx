import type { Metadata } from "next";
import Link from "next/link";
import {
  FileCheck2,
  ScanSearch,
  ShieldAlert,
  ShieldCheck,
} from "lucide-react";
import LinkPlacementQualityCheckerClient from "@/features/link-placement-quality-checker/LinkPlacementQualityCheckerClient";
import ToolFaq from "@/features/tool-ui/ToolFaq";
import ToolResources from "@/features/tool-catalog/ToolResources";
import {
  ToolHeroBackground,
  toolHeroHeading,
  toolHeroSurface,
} from "@/features/tool-ui/ToolHero";

const pageUrl =
  "https://doitwithai.tools/tools/link-placement-quality-checker";
const title =
  "Free Guest Post & Link Placement Quality Checker | 10-Point Vetting Tool";
const description =
  "Vet guest post sites and link building prospects across 10 real on-page checkpoints: indexability, canonical alignment, outbound link density, dofollow ratio, and PBN footprints.";

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
    question: "How does the Guest Post & Link Placement Quality Checker evaluate a prospect?",
    answer:
      "It inspects 10 observable technical and editorial signals on the candidate page: (1) meta/header indexability, (2) self-referencing canonical alignment, (3) outbound dofollow vs nofollow/sponsored policy, (4) external link density per 1,000 words, (5) internal-to-external link ratio, (6) 'write for us' and high-risk commercial footprints, (7) body word count and heading depth, (8) topical relevance overlap with your keywords, (9) author attribution and schema markup, and (10) publication/update timestamps.",
  },
  {
    question: "Does this tool invent Domain Rating (DR) or Domain Authority (DA) numbers?",
    answer:
      "No. Third-party authority metrics are proprietary to their vendors and are frequently gamed on expired-domain link farms. Instead, this tool inspects the actual HTML, HTTP headers, link density, and editorial signals on the page where your link will live.",
  },
  {
    question: "Why should I enter a sample article URL rather than just a bare homepage?",
    answer:
      "Entering a representative article URL (or the exact niche-edit target URL) lets the analyzer check whether individual posts are indexable, whether external links inside articles are dofollow or forced nofollow, and whether articles have real internal links and author attribution.",
  },
  {
    question: "What outbound link density is considered a red flag?",
    answer:
      "When an article contains more than 15–22 external links per 1,000 words across many unrelated domains—especially paired with zero internal links—it strongly resembles a paid link farm or PBN post.",
  },
  {
    question: "Why does canonical tag alignment matter for link placements?",
    answer:
      "If a publisher page has a <link rel='canonical'> tag pointing to the site's homepage or another URL, search engines ignore the page itself and consolidate link signals elsewhere.",
  },
  {
    question: "Can I compare multiple guest post prospects at once?",
    answer:
      "Yes. Enter up to 5 public URLs in batch mode to generate a side-by-side comparison table and downloadable CSV/DOCX vetting scorecard.",
  },
  {
    question: "What if a publisher site blocks automated crawlers with a firewall?",
    answer:
      "Switch to the 'Inspect Pasted Publisher HTML' tab, copy the page source from your browser, and run the exact same 10-point audit offline.",
  },
  {
    question: "What exports are included for agency or client sign-off?",
    answer:
      "You can download a side-by-side CSV prospect scorecard for spreadsheets or an editable Word (.docx) vetting audit detailing all 10 checkpoints per site.",
  },
];

const section = "mx-auto max-w-6xl px-4 py-12 sm:px-6";
const prose = "mt-4 text-base leading-8 text-slate-600 dark:text-slate-300";

export default function LinkPlacementQualityCheckerPage() {
  const schema = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebApplication",
        name: "Guest Post & Link Placement Quality Vetting Tool",
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
          { name: "Link Placement Quality Checker", item: pageUrl },
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
            <span aria-current="page">Link placement quality checker</span>
          </nav>

          <div className="grid items-center gap-8 lg:grid-cols-[1.35fr_0.85fr]">
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-[#b4c3ff]">
                Off-page SEO · Prospect Vetting
              </p>
              <h1 className="mt-4 text-3xl font-black leading-tight sm:text-4xl lg:text-5xl">
                Guest Post & Link Placement{" "}
                <span className={toolHeroHeading}>
                  Quality Vetting Scorecard
                </span>
              </h1>
              <p className="mt-5 max-w-2xl text-base leading-8 text-slate-300">
                Inspect candidate publisher pages across 10 real technical and
                editorial checkpoints before outreach. Catch hidden{" "}
                <code>noindex</code> tags, sitewide <code>nofollow</code>{" "}
                policies, outbound link farms, and PBN footprints.
              </p>
              <div className="mt-7 flex flex-wrap gap-3 text-xs font-semibold text-slate-200">
                <span className="rounded-lg border border-white/15 px-3 py-2">
                  10-point live HTML & header audit
                </span>
                <span className="rounded-lg border border-white/15 px-3 py-2">
                  Link-farm & footprint detector
                </span>
                <span className="rounded-lg border border-white/15 px-3 py-2">
                  CSV & DOCX vetting reports
                </span>
              </div>
            </div>

            <div className="rounded-2xl border border-[#9aabff]/30 bg-[#101b30]/90 p-6 shadow-xl">
              <p className="text-xs font-bold uppercase tracking-wider text-[#b4c3ff]">
                10 Checkpoints Inspected
              </p>
              <ul className="mt-4 grid grid-cols-2 gap-2.5 text-xs text-slate-300">
                <li>✓ Meta & Header Indexability</li>
                <li>✓ Self-Canonical Integrity</li>
                <li>✓ Dofollow vs Nofollow Share</li>
                <li>✓ Outbound Links / 1k Words</li>
                <li>✓ Internal Link Ratio</li>
                <li>✓ Guest-Post Footprint Scan</li>
                <li>✓ Editorial Word Depth</li>
                <li>✓ Niche Keyword Overlap</li>
                <li>✓ Author & Schema Markup</li>
                <li>✓ Freshness Timestamp</li>
              </ul>
            </div>
          </div>
        </div>
      </header>

      <LinkPlacementQualityCheckerClient />

      <section
        className={`${section} border-t border-slate-200 dark:border-slate-800`}
      >
        <p className="text-xs font-bold uppercase tracking-wider text-[#5271ff]">
          Look beyond surface metrics
        </p>
        <h2 className="mt-3 text-3xl font-extrabold">
          Why on-page placement signals matter more than inflated authority scores
        </h2>
        <p className={prose}>
          Link sellers routinely inflate domain-level metrics using redirected
          expired domains while publishing thin, unindexed articles packed with
          dozens of paid external links. Auditing the actual article template
          and outbound link behavior protects your budget and your backlink
          profile.
        </p>

        <div className="mt-8 grid gap-5 md:grid-cols-3">
          {[
            [
              ScanSearch,
              "Verify Indexability & Canonicals",
              "Confirm that candidate pages do not carry hidden noindex directives or canonical tags pointing away from the article.",
            ],
            [
              ShieldAlert,
              "Spot Link Farms & Toxic Co-Citations",
              "Measure external links per 1,000 words, internal-to-external link ratios, and commercial spam footprints automatically.",
            ],
            [
              FileCheck2,
              "Standardize Agency Vetting",
              "Export a repeatable 10-point CSV matrix or Word audit report before approving guest posts, resource outreach, or link insertions.",
            ],
          ].map(([Icon, heading, body]) => {
            const I = Icon as typeof ShieldCheck;
            return (
              <div
                key={String(heading)}
                className="rounded-2xl border border-slate-200 p-6 dark:border-slate-700"
              >
                <I aria-hidden className="text-[#5271ff]" size={22} />
                <h3 className="mt-4 text-lg font-bold">{String(heading)}</h3>
                <p className="mt-2 text-sm leading-7 text-slate-600 dark:text-slate-300">
                  {String(body)}
                </p>
              </div>
            );
          })}
        </div>
      </section>

      <section
        className={`${section} border-t border-slate-200 dark:border-slate-800`}
      >
        <h2 className="text-2xl font-extrabold">
          Next steps after qualifying a prospect
        </h2>
        <p className={prose}>
          Once a publisher passes vetting, check for broken outbound links on
          their resource pages with the{" "}
          <Link
            href="/tools/broken-link-opportunity-finder"
            className="font-semibold text-[#3452d1] underline dark:text-[#9aabff]"
          >
            Broken Link Opportunity Finder
          </Link>
          , draft your personalized pitch in the{" "}
          <Link
            href="/tools/outreach-email-builder"
            className="font-semibold text-[#3452d1] underline dark:text-[#9aabff]"
          >
            Outreach Email Builder
          </Link>
          , and verify the live link once published with the{" "}
          <Link
            href="/tools/backlink-verification-tool"
            className="font-semibold text-[#3452d1] underline dark:text-[#9aabff]"
          >
            Backlink Verification Tool
          </Link>
          .
        </p>
      </section>

      <ToolResources slug="link-placement-quality-checker" />
      <ToolFaq faqs={faqs} />
    </div>
  );
}
