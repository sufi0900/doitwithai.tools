import type { Metadata } from "next";
import ToolLandingHero from "@/features/tool-ui/ToolLandingHero";
import Link from "next/link";
import {
  Eye,
  Play,
  Sparkles,
} from "lucide-react";
import YoutubeTitleThumbnailOptimizerClient from "@/features/youtube-title-thumbnail-optimizer/YoutubeTitleThumbnailOptimizerClient";
import ToolFaq from "@/features/tool-ui/ToolFaq";
import ToolResources from "@/features/tool-catalog/ToolResources";
import { PlatformBrandIcon } from "@/features/tool-ui/PlatformBrandIcon";

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

      <ToolLandingHero
        slug="youtube-title-thumbnail-optimizer"
        title="YouTube Title, Hook & Thumbnail Text Optimizer"
        description="Test your YouTube titles against the 58-character mobile truncation cutoff, verify Title + Thumbnail Text synergy, and generate 5 high-CTR packaging variations in one click."
        categoryLabel="Social Media & Video SEO"
        categoryHref="/tools"
        workspaceId="tool-studio-workspace"
      >
        <div className="p-4 sm:p-6">
          <YoutubeTitleThumbnailOptimizerClient />
        </div>
      </ToolLandingHero>

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
