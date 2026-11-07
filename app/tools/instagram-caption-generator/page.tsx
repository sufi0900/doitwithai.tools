import PortableToolHeroBar from "@/features/portable-tool-kit/PortableToolHeroBar";
import type { Metadata } from "next";
import Link from "next/link";
import { Layers, Sparkles, Hash } from "lucide-react";
import InstagramCaptionGeneratorClient from "@/features/instagram-caption-generator/InstagramCaptionGeneratorClient";
import ToolFaq from "@/features/tool-ui/ToolFaq";
import ToolResources from "@/features/tool-catalog/ToolResources";
import {
  ToolHeroBackground,
  toolHeroHeading,
  toolHeroSurface,
} from "@/features/tool-ui/ToolHero";
import { PlatformBrandIcon } from "@/features/tool-ui/PlatformBrandIcon";

const pageUrl = "https://doitwithai.tools/tools/instagram-caption-generator";
const title =
  "Free Instagram Caption & 5-Slide Carousel Studio — 1-Click Vector Decks";
const description =
  "Generate save-worthy Instagram captions, 5 rendered vector carousel slides, 10 color themes, tiered hashtags, and 1-click multi-page PDF or PNG slide downloads from any URL or topic.";

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
    question: "How does the 1-click Carousel Generator work?",
    answer:
      "Paste any blog URL or YouTube link. The tool automatically selects the first sub-topic angle and renders all 5 visual carousel slides (1080×1080) immediately in a single click, with 1-click switcher pills above the deck to jump to other sub-topics.",
  },
  {
    question: "Can I customize the colors and text on every slide?",
    answer:
      "Yes! You can pick from 10 designer color themes (Navy & Orange, Royal Cobalt, Emerald Growth, Canva Daylight, Cyber Violet, etc.) or use live custom color pickers. Clicking any slide allows you to edit the headline, metric pill, and explanation in real time.",
  },
  {
    question: "How do I download the carousel slides?",
    answer:
      "Hovering over any individual slide reveals a download button for high-res PNG or vector SVG. You can also click 'Download Carousel PDF Deck' at the top of the studio to get a multi-page PDF ready for LinkedIn and Instagram document posts, or download all 5 PNGs in a bundle.",
  },
];

const section = "mx-auto max-w-6xl px-4 py-12 sm:px-6";
const prose = "mt-4 text-base leading-8 text-slate-600 dark:text-slate-300";

export default function InstagramCaptionGeneratorPage() {
  const schema = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebApplication",
        name: "Instagram Caption & 5-Slide Carousel Studio",
        url: pageUrl,
        description,
        applicationCategory: "DesignApplication",
        operatingSystem: "Any",
        isAccessibleForFree: true,
        offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { name: "Home", item: "https://doitwithai.tools" },
          { name: "Tools", item: "https://doitwithai.tools/tools" },
          { name: "Instagram Caption Generator", item: pageUrl },
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
        <div className="relative mx-auto max-w-6xl px-4 py-6 sm:px-6 sm:py-8">
          <nav
            aria-label="Breadcrumb"
            className="mb-4 flex flex-wrap gap-2 text-xs text-slate-300"
          >
            <Link href="/">Home</Link>
            <span>/</span>
            <Link href="/tools">Tools</Link>
            <span>/</span>
            <span aria-current="page">Instagram Caption Generator</span>
          </nav>

          <div className="grid items-center gap-8 lg:grid-cols-[minmax(0,1.35fr)_minmax(0,0.85fr)]">
            <div>
              <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-xs font-bold text-white backdrop-blur-xs">
                <PlatformBrandIcon slugOrText="instagram-caption-generator" size={24} />
                <span>Instagram Studio · 5 Rendered Vector Slides</span>
              </div>
              <p className="text-xs font-bold uppercase tracking-widest text-[#b4c3ff]">
                Social Media Studio · 1-Click Carousels &amp; Vector Decks
              </p>
              <h1 className="mt-4 text-3xl font-black leading-tight sm:text-4xl lg:text-5xl">
                Instagram Caption &amp;{" "}
                <span className={toolHeroHeading}>
                  Carousel Slide Studio
                </span>
              </h1>
              <p className="mt-5 max-w-2xl text-base leading-8 text-slate-300">
                Repurpose any blog URL or topic into a 5-slide vector carousel
                deck across 10 color themes with hover PNG/SVG downloads,
                multi-page PDF export, and 125-character hook previews.
              </p>
              <PortableToolHeroBar />
            </div>

            <div className="rounded-2xl border border-[#9aabff]/30 bg-[#101b30]/90 p-6 shadow-xl">
              <p className="text-xs font-bold uppercase tracking-wider text-[#b4c3ff]">
                Complete 1-Click Carousel Package
              </p>
              <ul className="mt-4 space-y-2.5 text-xs text-slate-300">
                <li>1. 1-Click URL Extraction with Sub-Topic Switcher</li>
                <li>2. 5 Rendered 1080×1080 Vector Slide Graphics</li>
                <li>3. 10 Curated Color Themes + Custom Color Pickers</li>
                <li>4. Multi-Page Carousel PDF + PNG Slide Downloads</li>
              </ul>
            </div>
          </div>
        </div>
      </header>

      <InstagramCaptionGeneratorClient />

      <section
        className={`${section} border-t border-slate-200 dark:border-slate-800`}
      >
        <h2 className="text-3xl font-extrabold">
          Turn articles into high-save Instagram carousels and micro-blogs
        </h2>
        <p className={prose}>
          Bookmarks (Saves) and DM Shares are the two strongest ranking signals
          on Instagram. Structuring your post as a 5-slide visual guide with a
          searchable caption maximizes both.
        </p>

        <div className="mt-8 grid gap-5 md:grid-cols-3">
          {[
            [
              Layers,
              "5 Rendered Vector Slides",
              "Get an interactive 5-slide carousel with cover hook, tactical steps, metric pills, and saveable checklist.",
            ],
            [
              Hash,
              "10 Themes & Custom Pickers",
              "Switch between 10 high-contrast themes or customize background, card, accent, and text colors.",
            ],
            [
              Sparkles,
              "Hover PNG & Multi-Page PDF",
              "Hover over any slide to download individual 1080p PNGs or download the complete multi-page PDF deck.",
            ],
          ].map(([Icon, heading, body]) => {
            const I = Icon as typeof Layers;
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

      <ToolResources slug="instagram-caption-generator" />
      <ToolFaq title="Instagram Caption & Carousel Generator FAQs" faqs={faqs} />
    </div>
  );
}
