import type { Metadata } from "next";
import Link from "next/link";
import { Film, Search, Zap } from "lucide-react";
import TiktokScriptCaptionGeneratorClient from "@/features/tiktok-script-caption-generator/TiktokScriptCaptionGeneratorClient";
import ToolFaq from "@/features/tool-ui/ToolFaq";
import ToolResources from "@/features/tool-catalog/ToolResources";
import {
  ToolHeroBackground,
  toolHeroHeading,
  toolHeroSurface,
} from "@/features/tool-ui/ToolHero";

const pageUrl = "https://doitwithai.tools/tools/tiktok-script-caption-generator";
const title =
  "Free TikTok Script, 3-Second Hook & Search SEO Caption Generator";
const description =
  "Turn any article URL, YouTube video, or topic into a timestamped TikTok script with 3-second visual hooks, on-screen text cues, and TikTok Search SEO captions.";

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
    question: "How does TikTok Search SEO work in 2026?",
    answer:
      "TikTok indexes three layers of your video for search queries: the words you speak out loud in the first 5 seconds, the on-screen text overlays placed inside the video editor, and the keyword-rich first line of your caption. Our generator aligns all three layers automatically.",
  },
  {
    question: "Can I turn a long blog post into multiple short TikTok scripts?",
    answer:
      "Yes! Paste your blog URL into the top extractor bar. When multiple H2 sections are detected, click any Sub-Topic Pill to generate a dedicated 15s, 30s, or 60s TikTok script for that specific section.",
  },
  {
    question: "Does this include visual directions for Green-Screen videos?",
    answer:
      "Yes. Every timestamped beat includes camera/visual direction, exact on-screen text overlay, and spoken teleprompter dialogue—plus a downloadable graphic card you can use as your green-screen backdrop.",
  },
];

const section = "mx-auto max-w-6xl px-4 py-12 sm:px-6";
const prose = "mt-4 text-base leading-8 text-slate-600 dark:text-slate-300";

export default function TiktokScriptCaptionGeneratorPage() {
  const schema = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebApplication",
        name: "TikTok Script, Hook & Search SEO Studio",
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
          { name: "TikTok Script & Caption Generator", item: pageUrl },
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
            <span aria-current="page">TikTok Script &amp; Caption Generator</span>
          </nav>

          <div className="grid items-center gap-8 lg:grid-cols-[minmax(0,1.35fr)_minmax(0,0.85fr)]">
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-[#b4c3ff]">
                Social Media &amp; Video Studio · Hooks, Beats &amp; TikTok SEO
              </p>
              <h1 className="mt-4 text-3xl font-black leading-tight sm:text-4xl lg:text-5xl">
                TikTok Script, Hook &amp;{" "}
                <span className={toolHeroHeading}>
                  Search SEO Studio
                </span>
              </h1>
              <p className="mt-5 max-w-2xl text-base leading-8 text-slate-300">
                Transform any article URL, YouTube video, or idea into a
                timestamped 15s/30s/60s TikTok script with 3-second pattern
                interrupt hooks and TikTok Search SEO captions.
              </p>
            </div>

            <div className="rounded-2xl border border-[#9aabff]/30 bg-[#101b30]/90 p-6 shadow-xl">
              <p className="text-xs font-bold uppercase tracking-wider text-[#b4c3ff]">
                Engineered for Retention &amp; Search
              </p>
              <ul className="mt-4 space-y-2.5 text-xs text-slate-300">
                <li>1. 3 First-3-Second Visual + Verbal Hooks</li>
                <li>2. Timestamped Camera, Text &amp; Audio Beats</li>
                <li>3. TikTok Search Bar Keyword &amp; Caption Package</li>
                <li>4. Green-Screen Visual Card Backdrop Generator</li>
              </ul>
            </div>
          </div>
        </div>
      </header>

      <TiktokScriptCaptionGeneratorClient />

      <section
        className={`${section} border-t border-slate-200 dark:border-slate-800`}
      >
        <h2 className="text-3xl font-extrabold">
          Script high-retention TikToks that rank in TikTok Search
        </h2>
        <p className={prose}>
          Whether you film Green-Screen article breakdowns or talking-head
          listicles, structuring your script into tight 5–7 second visual beats
          keeps viewer retention high from second zero.
        </p>

        <div className="mt-8 grid gap-5 md:grid-cols-3">
          {[
            [
              Zap,
              "3-Second Hook Options",
              "Compare pattern-interrupt, curiosity-gap, and contrarian opening lines.",
            ],
            [
              Film,
              "Beat-by-Beat Teleprompter",
              "Every timecode includes spoken dialogue, camera direction, and on-screen text.",
            ],
            [
              Search,
              "TikTok Search SEO",
              "Aligns spoken keywords, text overlays, and captions so your video ranks in search.",
            ],
          ].map(([Icon, heading, body]) => {
            const I = Icon as typeof Zap;
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

      <ToolResources slug="tiktok-script-caption-generator" />
      <ToolFaq title="TikTok Script & SEO Caption Generator FAQs" faqs={faqs} />
    </div>
  );
}
