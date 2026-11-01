import type { Metadata } from "next";
import Link from "next/link";
import { Image as ImageIcon, Layers, Sparkles } from "lucide-react";
import PinterestPinVisualGeneratorClient from "@/features/pinterest-pin-visual-generator/PinterestPinVisualGeneratorClient";
import ToolFaq from "@/features/tool-ui/ToolFaq";
import ToolResources from "@/features/tool-catalog/ToolResources";
import {
  ToolHeroBackground,
  toolHeroHeading,
  toolHeroSurface,
} from "@/features/tool-ui/ToolHero";
import { PlatformBrandIcon } from "@/features/tool-ui/PlatformBrandIcon";

const pageUrl = "https://doitwithai.tools/tools/pinterest-pin-visual-generator";
const title =
  "Free AI Pinterest Tall Pin Visual Generator (1000x1500) & SEO Studio";
const description =
  "Convert any blog post URL or topic into downloadable 1000x1500 (2:3) vertical Pinterest Pin graphics with 6 editable templates, extracted article photos, and Pinterest SEO titles & descriptions.";

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
    question: "What is the optimal Pinterest Pin image size in 2026?",
    answer:
      "Pinterest recommends a 2:3 vertical aspect ratio at 1000×1500 pixels. Our canvas renders every Pin at exact 1000×1500 resolution so your text overlays and checklists never get cropped in mobile feeds.",
  },
  {
    question: "Can I use images extracted from my blog post inside the Pin?",
    answer:
      "Yes! When you fetch a blog URL, any extracted images appear in a 1-click bar—click any photo to feature it inside the Editorial Magazine Cover or Split Photo Pin templates.",
  },
  {
    question: "Does this also write the Pinterest SEO Title and Description?",
    answer:
      "Yes. Alongside the 1000×1500 PNG graphic, you get 3 keyword-optimized Pin titles, 500-character descriptions, image Alt Text, and board recommendations.",
  },
];

const section = "mx-auto max-w-6xl px-4 py-12 sm:px-6";
const prose = "mt-4 text-base leading-8 text-slate-600 dark:text-slate-300";

export default function PinterestPinVisualGeneratorPage() {
  const schema = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebApplication",
        name: "AI Pinterest Tall Pin Visual Generator & SEO Studio",
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
          { name: "Pinterest Pin Visual Generator", item: pageUrl },
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
            <span aria-current="page">Pinterest Pin Visual Generator</span>
          </nav>

          <div className="grid items-center gap-8 lg:grid-cols-[minmax(0,1.35fr)_minmax(0,0.85fr)]">
            <div>
              <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-xs font-bold text-white backdrop-blur-xs">
                <PlatformBrandIcon
                  slugOrText="pinterest-pin-visual-generator"
                  size={18}
                />
                <span>1000×1500 Tall Pin Designer · 6 Templates</span>
              </div>
              <p className="text-xs font-bold uppercase tracking-widest text-[#b4c3ff]">
                Social Media Studio · Visual Pinterest Pins &amp; Evergreen Traffic
              </p>
              <h1 className="mt-4 text-3xl font-black leading-tight sm:text-4xl lg:text-5xl">
                AI Blog to{" "}
                <span className={toolHeroHeading}>
                  Pinterest Tall Pin Visual Studio
                </span>
              </h1>
              <p className="mt-5 max-w-2xl text-base leading-8 text-slate-300">
                Turn any blog post URL into scroll-stopping 1000×1500 (2:3)
                vertical Pinterest Pin graphics with 6 editable templates,
                1-click article photo integration, and keyword-indexed Pin SEO
                copy.
              </p>
            </div>

            <div className="rounded-2xl border border-[#9aabff]/30 bg-[#101b30]/90 p-6 shadow-xl">
              <p className="text-xs font-bold uppercase tracking-wider text-[#b4c3ff]">
                Complete 2:3 Tall Pin Package
              </p>
              <ul className="mt-4 space-y-2.5 text-xs text-slate-300">
                <li>1. 6 Editable 1000×1500 Vertical Pin Layouts</li>
                <li>2. 1-Click Extracted Blog Photo Integration</li>
                <li>3. 3 Pin Angles with SEO Titles &amp; Descriptions</li>
                <li>4. Instant PNG + SEO Copy Bundle Download</li>
              </ul>
            </div>
          </div>
        </div>
      </header>

      <PinterestPinVisualGeneratorClient />

      <section
        className={`${section} border-t border-slate-200 dark:border-slate-800`}
      >
        <h2 className="text-3xl font-extrabold">
          Drive evergreen blog traffic with 2:3 vertical infographic Pins
        </h2>
        <p className={prose}>
          Unlike fleeting social feeds, Pinterest acts as a visual search engine
          where a single well-designed 1000×1500 checklist or listicle Pin can
          send outbound clicks to your blog for months.
        </p>

        <div className="mt-8 grid gap-5 md:grid-cols-3">
          {[
            [
              Layers,
              "6 Tall 1000×1500 Templates",
              "Switch between Listicle Number Pins, Mini-Infographics, Editorial Covers, and Saveable Checklists.",
            ],
            [
              ImageIcon,
              "1-Click Blog Photo Insertion",
              "Click any image extracted from your article URL to place it directly into your Pin header.",
            ],
            [
              Sparkles,
              "Pinterest Search SEO Pack",
              "Includes keyword-rich Pin titles, 500-char descriptions, Alt Text, and board recommendations.",
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

      <ToolResources slug="pinterest-pin-visual-generator" />
      <ToolFaq title="Pinterest Tall Pin Visual Generator FAQs" faqs={faqs} />
    </div>
  );
}
