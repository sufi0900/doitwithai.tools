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
  "Free Instagram Caption, Carousel Blueprint & Visual Cover Generator";
const description =
  "Generate save-worthy Instagram captions, 5-slide carousel copy, tiered hashtags, Instagram SEO Alt Text, and downloadable 1080x1080 cover graphics from any URL or topic.";

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
    question: "Why are the first 125 characters of an Instagram caption so important?",
    answer:
      "Instagram truncates captions in the feed after roughly 125 characters with a '...more' link. Our generator previews your exact above-the-fold hook so you can maximize tap-throughs and dwell time.",
  },
  {
    question: "Does this also design the slides for an Instagram Carousel?",
    answer:
      "Yes! Alongside 3 caption variations, you get a 5-slide Carousel Blueprint (with headline, body copy, and visual cue per slide) plus an interactive 1080×1080 / 1080×1350 Visual Card Studio to download your cover slide as a PNG.",
  },
  {
    question: "What is Instagram SEO Alt Text?",
    answer:
      "Instagram's search engine reads custom image Alt Text (found under Advanced Settings when posting) to rank your post when users search keywords in the Instagram search bar.",
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
        name: "Instagram Caption, Carousel & Visual Cover Studio",
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
        <div className="relative mx-auto max-w-6xl px-4 py-12 sm:px-6 sm:py-16">
          <nav
            aria-label="Breadcrumb"
            className="mb-7 flex flex-wrap gap-2 text-xs text-slate-300"
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
                <PlatformBrandIcon slugOrText="instagram-caption-generator" size=18 />
                <span>Official Platform Studio</span>
              </div>
              <p className="text-xs font-bold uppercase tracking-widest text-[#b4c3ff]">
                Social Media Studio · Captions, Carousels &amp; 1080p Covers
              </p>
              <h1 className="mt-4 text-3xl font-black leading-tight sm:text-4xl lg:text-5xl">
                Instagram Caption &amp;{" "}
                <span className={toolHeroHeading}>
                  Carousel Slide Studio
                </span>
              </h1>
              <p className="mt-5 max-w-2xl text-base leading-8 text-slate-300">
                Repurpose any blog URL or idea into save-worthy Instagram
                captions, a 5-slide carousel deck, SEO alt text, and a
                downloadable 1080p graphic.
              </p>
            </div>

            <div className="rounded-2xl border border-[#9aabff]/30 bg-[#101b30]/90 p-6 shadow-xl">
              <p className="text-xs font-bold uppercase tracking-wider text-[#b4c3ff]">
                Complete Instagram Package
              </p>
              <ul className="mt-4 space-y-2.5 text-xs text-slate-300">
                <li>1. 125-char Above-the-Fold Hook Preview</li>
                <li>2. 5-Slide Educational Carousel Blueprint</li>
                <li>3. Tiered Hashtags + Custom Alt Text SEO</li>
                <li>4. Downloadable 1:1 &amp; 4:5 Cover Graphic</li>
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
              "5-Slide Carousel Deck",
              "Get ready-to-paste headline and body copy for every slide in your carousel.",
            ],
            [
              Hash,
              "Instagram Search SEO",
              "Includes tiered hashtags and keyword-optimized custom Alt Text.",
            ],
            [
              Sparkles,
              "1080p Visual Cover Builder",
              "Download a crisp 1:1 Square or 4:5 Portrait cover graphic right in your browser.",
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
