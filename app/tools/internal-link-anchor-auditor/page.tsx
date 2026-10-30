import type { Metadata } from "next";
import Link from "next/link";
import { AlertTriangle, GitFork, Link2, Sparkles } from "lucide-react";
import InternalLinkAnchorAuditorClient from "@/features/internal-link-anchor-auditor/InternalLinkAnchorAuditorClient";
import ToolFaq from "@/features/tool-ui/ToolFaq";
import ToolResources from "@/features/tool-catalog/ToolResources";
import {
  ToolHeroBackground,
  toolHeroHeading,
  toolHeroSurface,
} from "@/features/tool-ui/ToolHero";

const pageUrl =
  "https://doitwithai.tools/tools/internal-link-anchor-auditor";
const title =
  "Free Internal Link Anchor & Cannibalization Auditor | On-Page SEO Tool";
const description =
  "Audit internal links on your pages for anchor text cannibalization, generic 'click here' CTAs, accidental nofollow leaks, empty image anchors, and duplicate links.";

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
    question: "What is internal anchor text cannibalization?",
    answer:
      "Internal anchor cannibalization occurs when you use the exact same descriptive keyword anchor text to link to two or more different internal URLs on your site, sending conflicting topical signals to search engines about which page should rank for that phrase.",
  },
  {
    question: "How does this tool differ from the Internal Link Opportunity Finder?",
    answer:
      "The Internal Link Opportunity Finder suggests where to add new internal links, whereas the Internal Link Anchor & Cannibalization Auditor inspects your existing internal links to fix cannibalized anchors, generic 'click here' phrases, nofollow leaks, and redundant links.",
  },
  {
    question: "What is the 'First-Link Priority' duplicate destination warning?",
    answer:
      "When a single page links to the same destination URL multiple times in body copy, search engines primarily weight the anchor text of the first link. Consolidating redundant links keeps anchor signals clean.",
  },
  {
    question: "Why are internal rel='nofollow' links flagged as leaks?",
    answer:
      "Adding rel='nofollow' to internal links prevents PageRank and crawl equity from flowing cleanly between your own pages.",
  },
];

const section = "mx-auto max-w-6xl px-4 py-12 sm:px-6";
const prose = "mt-4 text-base leading-8 text-slate-600 dark:text-slate-300";

export default function InternalLinkAnchorAuditorPage() {
  const schema = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebApplication",
        name: "Internal Link Anchor & Cannibalization Auditor",
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
          { name: "Internal Link Anchor Auditor", item: pageUrl },
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
            <span aria-current="page">Internal link anchor auditor</span>
          </nav>

          <div className="grid items-center gap-8 lg:grid-cols-[1.35fr_0.85fr]">
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-[#b4c3ff]">
                On-page SEO · Internal Link Architecture
              </p>
              <h1 className="mt-4 text-3xl font-black leading-tight sm:text-4xl lg:text-5xl">
                Internal Link Anchor &{" "}
                <span className={toolHeroHeading}>
                  Cannibalization Auditor
                </span>
              </h1>
              <p className="mt-5 max-w-2xl text-base leading-8 text-slate-300">
                Inspect internal links across up to 5 pages to catch conflicting
                keyword anchors pointing to different URLs, generic{" "}
                <em>&ldquo;click here&rdquo;</em> links, internal{" "}
                <code>nofollow</code> leaks, and empty image anchors.
              </p>
              <div className="mt-7 flex flex-wrap gap-3 text-xs font-semibold text-slate-200">
                <span className="rounded-lg border border-white/15 px-3 py-2">
                  Anchor cannibalization detector
                </span>
                <span className="rounded-lg border border-white/15 px-3 py-2">
                  First-link priority check
                </span>
                <span className="rounded-lg border border-white/15 px-3 py-2">
                  CSV & DOCX audit reports
                </span>
              </div>
            </div>

            <div className="rounded-2xl border border-[#9aabff]/30 bg-[#101b30]/90 p-6 shadow-xl">
              <p className="text-xs font-bold uppercase tracking-wider text-[#b4c3ff]">
                5 Internal Link Flaws Caught
              </p>
              <ul className="mt-4 space-y-2.5 text-xs text-slate-300">
                <li>1. Same keyword anchor pointing to 2+ internal URLs</li>
                <li>2. Generic CTAs (&ldquo;click here&rdquo;, &ldquo;read more&rdquo;)</li>
                <li>3. Accidental <code>rel=&quot;nofollow&quot;</code> on internal links</li>
                <li>4. Linked images missing <code>alt</code> attributes</li>
                <li>5. Redundant same-target links on the same page</li>
              </ul>
            </div>
          </div>
        </div>
      </header>

      <InternalLinkAnchorAuditorClient />

      <section
        className={`${section} border-t border-slate-200 dark:border-slate-800`}
      >
        <h2 className="text-3xl font-extrabold">
          Make every internal link send an unambiguous topical signal
        </h2>
        <p className={prose}>
          Unlike external backlinks, you have 100% control over your internal
          anchor text. Auditing your editorial body links ensures every target
          page receives consistent, descriptive keyword anchors without
          competing against sibling pages.
        </p>

        <div className="mt-8 grid gap-5 md:grid-cols-3">
          {[
            [
              GitFork,
              "Stop Internal Cannibalization",
              "Find exact anchor phrases used to link to multiple different URLs on your site.",
            ],
            [
              AlertTriangle,
              "Fix Nofollow & Empty Links",
              "Catch CMS plugins or writers accidentally marking internal links as nofollow or leaving linked icons without alt text.",
            ],
            [
              Link2,
              "Editorial Zone Isolation",
              "Filter out global navigation and footer menus so you focus strictly on in-content editorial links.",
            ],
          ].map(([Icon, heading, body]) => {
            const I = Icon as typeof Sparkles;
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
          Connected Internal Linking & Cannibalization Tools
        </h2>
        <p className={prose}>
          Discover new internal link placements in the{" "}
          <Link
            href="/tools/internal-link-opportunity-finder"
            className="font-semibold text-[#3452d1] underline dark:text-[#9aabff]"
          >
            Internal Link Opportunity Finder
          </Link>
          , check query-level ranking overlap in the{" "}
          <Link
            href="/tools/keyword-cannibalization-finder"
            className="font-semibold text-[#3452d1] underline dark:text-[#9aabff]"
          >
            Keyword Cannibalization Finder
          </Link>
          , and audit external backlink anchors in the{" "}
          <Link
            href="/tools/anchor-text-analyzer"
            className="font-semibold text-[#3452d1] underline dark:text-[#9aabff]"
          >
            Anchor Text Analyzer
          </Link>
          .
        </p>
      </section>

      <ToolResources slug="internal-link-anchor-auditor" />
      <ToolFaq faqs={faqs} />
    </div>
  );
}
