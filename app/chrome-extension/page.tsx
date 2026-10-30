import type { Metadata } from "next";
import Link from "next/link";
import { CheckCircle2, Download, Layers, Sparkles } from "lucide-react";
import ChromeExtensionShowcaseClient from "@/features/chrome-extension/ChromeExtensionShowcaseClient";
import ToolFaq from "@/features/tool-ui/ToolFaq";
import {
  ToolHeroBackground,
  toolHeroHeading,
  toolHeroSurface,
} from "@/features/tool-ui/ToolHero";

const pageUrl = "https://doitwithai.tools/chrome-extension";
const title =
  "Free AI SEO Inspector, Content Converter & Social Studio Chrome Extension | Do It With AI Tools";
const description =
  "Inspect On-Page & Technical SEO, score E-E-A-T & Information Gain, convert any article to PDF/Word/Markdown/MP3, and generate 15 social media posts in 1 click.";

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
    question:
      "What makes the Do It With AI Chrome Extension different from Ahrefs SEO Toolbar or Detailed SEO?",
    answer:
      "Traditional SEO extensions only display raw meta tags and link counts. Our extension combines a full On-Page/Technical SEO Toolbar (Rendered vs. Raw DOM Canonical, Robots, H1–H6 tree, JSON-LD Schema, Dofollow/Nofollow highlighter) with 20-Point E-E-A-T & Information Gain scoring, 1-Click Article Conversion (Markdown, Word, PDF, Read-Aloud Audio), and an instant 15-Post Social Media Studio.",
  },
  {
    question: "Is the Chrome Extension completely free to use?",
    answer:
      "Yes. All local DOM inspections, E-E-A-T and Information Gain scores, TOC HTML generation, link/image CSV exports, Markdown/Word downloads, and 15 social post templates run 100% free in your browser with no paid subscription required.",
  },
  {
    question: "Can I dock the extension to Chrome's Side Panel so it stays open while I browse?",
    answer:
      "Yes. Built on Manifest V3, the extension includes a 1-click 'Dock to Side Panel' button (◧) in the top-right header so you can keep it open alongside WordPress, Webflow, Google Docs, or any competitor article.",
  },
  {
    question: "Does it work on websites that block server-side crawlers (like Cloudflare pages)?",
    answer:
      "Yes! Because the extension inspects the live rendered DOM directly inside your active browser tab, it works on any page you can view in Chrome—even pages behind bot protection or login screens.",
  },
  {
    question: "Does the extension slow down my browsing speed?",
    answer:
      "No. The extension uses strict on-demand Manifest V3 activeTab execution—zero background scripts run on your pages until you click the extension icon.",
  },
];

export default function ChromeExtensionPage() {
  const schema = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "SoftwareApplication",
        name: "Do It With AI: SEO Inspector, Content Converter & Social Studio Chrome Extension",
        url: pageUrl,
        description,
        applicationCategory: "BrowserApplication",
        operatingSystem: "Chrome, Brave, Microsoft Edge",
        isAccessibleForFree: true,
        offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { name: "Home", item: "https://doitwithai.tools" },
          { name: "Tools", item: "https://doitwithai.tools/tools" },
          { name: "Chrome Extension", item: pageUrl },
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

      {/* High-Impact Hero Section */}
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
            <span aria-current="page">Chrome Extension</span>
          </nav>

          <div className="grid items-center gap-8 lg:grid-cols-[minmax(0,1.28fr)_minmax(0,0.92fr)]">
            <div>
              <p className="inline-flex items-center gap-2 rounded-full border border-[#b4c3ff]/30 bg-white/5 px-3.5 py-1 text-xs font-bold uppercase tracking-widest text-[#b4c3ff]">
                <Sparkles size={13} />
                Manifest V3 Browser Extension · Popup + Side Panel
              </p>
              <h1 className="mt-4 text-3xl font-black leading-tight sm:text-4xl lg:text-5xl">
                All 63 SEO, Content &amp; Social Tools{" "}
                <span className={toolHeroHeading}>
                  Inside Your Browser Toolbar
                </span>
              </h1>
              <p className="mt-5 max-w-2xl text-base leading-8 text-slate-300">
                Audit On-Page &amp; Technical SEO, measure E-E-A-T and
                Information Gain with animated gauges, convert any live webpage
                into PDF/Word/Markdown/MP3 audio, and generate 15 social media
                posts in a single click.
              </p>

              <div className="mt-7 flex flex-wrap items-center gap-3.5">
                <a
                  href="/downloads/doitwithai-chrome-extension.zip"
                  download="doitwithai-chrome-extension.zip"
                  className="inline-flex items-center gap-2.5 rounded-xl bg-[#5271ff] px-6 py-3.5 text-sm font-extrabold text-white shadow-lg transition hover:bg-[#3b5bdb]"
                >
                  <Download size={18} />
                  Download Free Chrome Extension (.ZIP)
                </a>
                <Link
                  href="/tools"
                  className="inline-flex items-center gap-2 rounded-xl border border-white/20 bg-white/10 px-5 py-3.5 text-sm font-bold text-white backdrop-blur-sm transition hover:bg-white/20"
                >
                  <Layers size={17} />
                  Explore All 63 Web Tools
                </Link>
              </div>

              <div className="mt-7 flex flex-wrap gap-3 text-xs font-semibold text-slate-200">
                <span className="inline-flex items-center gap-1.5 rounded-lg border border-white/15 bg-white/5 px-3 py-1.5">
                  <CheckCircle2 size={14} className="text-emerald-400" />
                  100% Free · Zero Subscription
                </span>
                <span className="inline-flex items-center gap-1.5 rounded-lg border border-white/15 bg-white/5 px-3 py-1.5">
                  <CheckCircle2 size={14} className="text-emerald-400" />
                  Works on Chrome, Brave &amp; Edge
                </span>
                <span className="inline-flex items-center gap-1.5 rounded-lg border border-white/15 bg-white/5 px-3 py-1.5">
                  <CheckCircle2 size={14} className="text-emerald-400" />
                  Bypasses Crawler Blocks via Live DOM
                </span>
              </div>
            </div>

            {/* Right-Side Executive Summary Card */}
            <div className="rounded-2xl border border-[#7c96ff]/40 bg-gradient-to-br from-[#13203B]/95 via-[#0F182D]/95 to-[#172544]/95 p-6 shadow-2xl ring-1 ring-white/10">
              <div className="flex items-center justify-between border-b border-white/10 pb-3.5">
                <div>
                  <p className="text-[11px] font-extrabold uppercase tracking-wider text-[#b4c3ff]">
                    3-in-1 Browser Studio
                  </p>
                  <p className="mt-0.5 text-sm font-black text-white">
                    What You Get in Every Tab
                  </p>
                </div>
                <span className="rounded-full border border-emerald-400/40 bg-emerald-500/20 px-3 py-1 text-xs font-extrabold text-emerald-300">
                  Manifest V3
                </span>
              </div>

              <div className="mt-4 space-y-3 text-xs">
                <div className="rounded-xl border border-blue-400/30 bg-blue-500/10 p-3">
                  <strong className="text-blue-200">
                    1. On-Page, Technical &amp; Off-Page SEO Toolbar
                  </strong>
                  <p className="mt-1 text-slate-300">
                    Rendered vs. Raw Canonical, Robots, H1–H6 tree, JSON-LD
                    Schema, Dofollow/Nofollow highlighter, E-E-A-T &amp; Info
                    Gain gauges.
                  </p>
                </div>

                <div className="rounded-xl border border-emerald-400/30 bg-emerald-500/10 p-3">
                  <strong className="text-emerald-200">
                    2. Instant Article Converter &amp; Audio Reader
                  </strong>
                  <p className="mt-1 text-slate-300">
                    Convert the active tab into Markdown, Word, PDF, or listen
                    aloud—plus 1-click handoff to Video Script, EPUB &amp;
                    Newsletter studios.
                  </p>
                </div>

                <div className="rounded-xl border border-indigo-400/30 bg-indigo-500/15 p-3">
                  <strong className="text-indigo-200">
                    3. Social Cards &amp; 15-Post Campaign Studio
                  </strong>
                  <p className="mt-1 text-slate-300">
                    Preview Facebook/LinkedIn OG &amp; X cards, generate 15
                    ready-to-post social updates, and launch the LinkedIn
                    Carousel Builder.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Interactive Live Simulator & Feature Showcase */}
      <ChromeExtensionShowcaseClient />

      {/* Head-to-Head Comparison Table */}
      <section className="mx-auto max-w-6xl border-t border-slate-200 px-4 py-12 dark:border-slate-800 sm:px-6">
        <span className="text-xs font-extrabold uppercase tracking-wider text-[#5271ff]">
          Side-by-Side Comparison
        </span>
        <h2 className="mt-2 text-2xl font-black sm:text-3xl">
          How Do It With AI Compares to Standard SEO Extensions
        </h2>

        <div className="mt-6 overflow-x-auto rounded-2xl border border-slate-200 dark:border-slate-800">
          <table className="w-full border-collapse text-left text-xs sm:text-sm">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 dark:border-slate-800 dark:bg-slate-900">
                <th className="p-4 font-extrabold">Capability</th>
                <th className="p-4 font-extrabold text-[#3452d1] dark:text-[#9aabff]">
                  Do It With AI Studio
                </th>
                <th className="p-4 font-bold text-slate-500">
                  Ahrefs SEO Toolbar
                </th>
                <th className="p-4 font-bold text-slate-500">
                  MarketingSyrup SEO Pro
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
              {[
                [
                  "Meta Tags, Canonical (DOM vs. Raw), Robots & Hreflang",
                  "✅ Included Free",
                  "✅ Included",
                  "✅ Included",
                ],
                [
                  "H1–H6 Tree + 1-Click Crawl-Safe <nav> TOC HTML Generator",
                  "✅ Included Free",
                  "Headings only (No TOC HTML)",
                  "Headings only (No TOC HTML)",
                ],
                [
                  "20-Point E-E-A-T & 6-Dimension Information Gain Gauges",
                  "✅ Included Free",
                  "❌ Not available",
                  "❌ Not available",
                ],
                [
                  "Anchor Text Ratio Audit & Guest Post Prospect Vetting",
                  "✅ Included Free",
                  "Basic link list",
                  "Basic link list",
                ],
                [
                  "1-Click Article to Markdown, Word, PDF & Read-Aloud Audio",
                  "✅ Included Free",
                  "❌ Not available",
                  "❌ Not available",
                ],
                [
                  "Instant 15 Social Media Posts + LinkedIn Carousel Handoff",
                  "✅ Included Free",
                  "OG tag list only",
                  "Static OG preview only",
                ],
                [
                  "Dockable Chrome Side Panel Mode (Stays Open While Editing)",
                  "✅ Included Free",
                  "Overlay bar",
                  "Popup only",
                ],
              ].map(([feat, ours, ahrefs, seopro]) => (
                <tr key={feat}>
                  <td className="p-4 font-bold">{feat}</td>
                  <td className="p-4 font-extrabold text-emerald-700 dark:text-emerald-300">
                    {ours}
                  </td>
                  <td className="p-4 text-slate-600 dark:text-slate-400">
                    {ahrefs}
                  </td>
                  <td className="p-4 text-slate-600 dark:text-slate-400">
                    {seopro}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <ToolFaq title="Do It With AI Chrome Extension FAQs" faqs={faqs} />
    </div>
  );
}
