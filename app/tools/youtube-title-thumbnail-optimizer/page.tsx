import type { Metadata } from "next";
import Link from "next/link";
import { Eye, Play, Sparkles } from "lucide-react";
import YoutubeTitleThumbnailOptimizerClient from "@/features/youtube-title-thumbnail-optimizer/YoutubeTitleThumbnailOptimizerClient";
import ToolFaq from "@/features/tool-ui/ToolFaq";
import ToolResources from "@/features/tool-catalog/ToolResources";
import {
  ToolHeroBackground,
  toolHeroHeading,
  toolHeroSurface,
} from "@/features/tool-ui/ToolHero";

const pageUrl =
  "https://doitwithai.tools/tools/youtube-title-thumbnail-optimizer";
const title =
  "Free YouTube Title, Hook & Thumbnail Text Optimizer | CTR Preview";
const description =
  "Score your YouTube video titles against the 58-character mobile cutoff, pair titles with 2–4 word thumbnail text overlays, and preview your video card in YouTube feeds.";

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
    question: "What is the ideal YouTube title length to avoid truncation?",
    answer:
      "While YouTube allows up to 100 characters, mobile feeds and suggested video sidebars truncate titles around 55 to 60 characters. Placing your core hook and keyword inside the first 58 characters ensures viewers never miss the punchline.",
  },
  {
    question: "Why shouldn't my thumbnail text repeat my video title?",
    answer:
      "Viewers look at your thumbnail image and text first (in under 0.5 seconds) and then read your title. If both say the exact same words, you waste half of your visual real estate. Use the thumbnail for a 2–4 word proof metric or curiosity hook ('310 SITES TESTED') and the title for the clear value proposition.",
  },
  {
    question: "How many words should be on a YouTube thumbnail?",
    answer:
      "Keep thumbnail text between 2 and 5 bold words. More than 6 words become illegible on mobile screens and Suggested video rails.",
  },
  {
    question: "Can I generate a full video script after choosing my title?",
    answer:
      "Yes! Once you pick your winning Title + Thumbnail pair, open our Blog to Video Script or Short-Form Video Script Builder to generate the matching hook and retention script.",
  },
];

const section = "mx-auto max-w-6xl px-4 py-12 sm:px-6";
const prose = "mt-4 text-base leading-8 text-slate-600 dark:text-slate-300";

export default function YoutubeTitleThumbnailOptimizerPage() {
  const schema = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebApplication",
        name: "YouTube Title, Hook & Thumbnail Text Optimizer",
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
          { name: "YouTube Title & Thumbnail Optimizer", item: pageUrl },
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
            <span aria-current="page">YouTube Title &amp; Thumbnail Optimizer</span>
          </nav>

          <div className="grid items-center gap-8 lg:grid-cols-[minmax(0,1.35fr)_minmax(0,0.85fr)]">
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-[#b4c3ff]">
                Social Media &amp; Video SEO · YouTube Packaging &amp; CTR
              </p>
              <h1 className="mt-4 text-3xl font-black leading-tight sm:text-4xl lg:text-5xl">
                YouTube Title, Hook &amp;{" "}
                <span className={toolHeroHeading}>
                  Thumbnail Text Optimizer
                </span>
              </h1>
              <p className="mt-5 max-w-2xl text-base leading-8 text-slate-300">
                Test your YouTube titles against the 58-character mobile
                truncation cutoff, verify Title + Thumbnail Text synergy, and
                generate 5 high-CTR packaging variations in one click.
              </p>
              <div className="mt-7 flex flex-wrap gap-3 text-xs font-semibold text-slate-200">
                <span className="rounded-lg border border-white/15 px-3 py-2">
                  58-Char Mobile Cutoff Check
                </span>
                <span className="rounded-lg border border-white/15 px-3 py-2">
                  Title + Thumbnail Synergy
                </span>
                <span className="rounded-lg border border-white/15 px-3 py-2">
                  5 CTR Packaging Frameworks
                </span>
              </div>
            </div>

            <div className="rounded-2xl border border-[#9aabff]/30 bg-[#101b30]/90 p-6 shadow-xl">
              <p className="text-xs font-bold uppercase tracking-wider text-[#b4c3ff]">
                Package Videos Before You Record
              </p>
              <ul className="mt-4 space-y-2.5 text-xs text-slate-300">
                <li>1. Live YouTube mobile &amp; desktop feed card preview</li>
                <li>2. Redundant title/thumbnail copy-paste detector</li>
                <li>3. 5 proven CTR angles (Case Study, Warning, Blueprint)</li>
                <li>4. Instant AI packaging generator for any topic</li>
              </ul>
            </div>
          </div>
        </div>
      </header>

      <YoutubeTitleThumbnailOptimizerClient />

      <section
        className={`${section} border-t border-slate-200 dark:border-slate-800`}
      >
        <h2 className="text-3xl font-extrabold">
          Package your title and thumbnail as a single click-through system
        </h2>
        <p className={prose}>
          High-performing YouTube creators design the thumbnail hook and title
          before recording the video so the first 15 seconds deliver directly on
          the promise of the click.
        </p>

        <div className="mt-8 grid gap-5 md:grid-cols-3">
          {[
            [
              Eye,
              "Mobile Truncation Guard",
              "See exactly where YouTube cuts off long titles with an ellipsis on smartphones and suggested rails.",
            ],
            [
              Play,
              "Thumbnail Badge Pairing",
              "Pairs every title with a 2–4 word high-contrast thumbnail text badge that complements the headline.",
            ],
            [
              Sparkles,
              "5 Proven CTR Frameworks",
              "Compare Curiosity, Case Study, Mistake Warning, Blueprint, and Challenge hooks side by side.",
            ],
          ].map(([Icon, heading, body]) => {
            const I = Icon as typeof Eye;
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

      <ToolResources slug="youtube-title-thumbnail-optimizer" />
      <ToolFaq title="YouTube Title & Thumbnail Optimizer FAQs" faqs={faqs} />
    </div>
  );
}
