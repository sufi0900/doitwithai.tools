import type { Metadata } from "next";
import Link from "next/link";
import { Image as ImageIcon, MessageCircle, Share2 } from "lucide-react";
import FacebookPostGeneratorClient from "@/features/facebook-post-generator/FacebookPostGeneratorClient";
import ToolFaq from "@/features/tool-ui/ToolFaq";
import ToolResources from "@/features/tool-catalog/ToolResources";
import {
  ToolHeroBackground,
  toolHeroHeading,
  toolHeroSurface,
} from "@/features/tool-ui/ToolHero";

const pageUrl = "https://doitwithai.tools/tools/facebook-post-generator";
const title =
  "Free Facebook Post Generator — Zero-Click Posts, First-Comment Links & Visual Cards";
const description =
  "Turn any topic or article URL into high-reach Facebook posts with a First-Comment Link strategy and downloadable 1080p visual cards.";

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
    question: "Why does this tool separate the main Facebook post from the First-Comment link?",
    answer:
      "Facebook's feed algorithm heavily throttles organic reach on posts that contain outbound links in the main body. Delivering standalone value + a 1080p visual graphic in the main post and pasting the URL in the First Comment protects your reach while driving high-intent clicks.",
  },
  {
    question: "Can I generate an image to attach to my Facebook post?",
    answer:
      "Yes! Every generated Facebook post includes the interactive Visual Card Studio where you can download a 1080×1080 or 1080×1350 PNG graphic—or pick any image extracted directly from your source article.",
  },
  {
    question: "What if my article covers multiple different topics?",
    answer:
      "When you paste a multi-topic article URL into the top extractor bar, interactive Sub-Topic Pills appear so you can generate a dedicated Facebook post for each individual H2 section.",
  },
];

const section = "mx-auto max-w-6xl px-4 py-12 sm:px-6";
const prose = "mt-4 text-base leading-8 text-slate-600 dark:text-slate-300";

export default function FacebookPostGeneratorPage() {
  const schema = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebApplication",
        name: "Facebook Post & Engagement Studio",
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
          { name: "Facebook Post Generator", item: pageUrl },
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
            <span aria-current="page">Facebook Post Generator</span>
          </nav>

          <div className="grid items-center gap-8 lg:grid-cols-[minmax(0,1.35fr)_minmax(0,0.85fr)]">
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-[#b4c3ff]">
                Social Media Studio · Zero-Click Feed + Visual Graphic
              </p>
              <h1 className="mt-4 text-3xl font-black leading-tight sm:text-4xl lg:text-5xl">
                Facebook Post &amp;{" "}
                <span className={toolHeroHeading}>
                  Visual Card Studio
                </span>
              </h1>
              <p className="mt-5 max-w-2xl text-base leading-8 text-slate-300">
                Convert any article URL or topic into 3 organic Facebook post
                variations, a First-Comment Link snippet, and a downloadable
                1080p visual card.
              </p>
            </div>

            <div className="rounded-2xl border border-[#9aabff]/30 bg-[#101b30]/90 p-6 shadow-xl">
              <p className="text-xs font-bold uppercase tracking-wider text-[#b4c3ff]">
                Built for 2026 Facebook Reach
              </p>
              <ul className="mt-4 space-y-2.5 text-xs text-slate-300">
                <li>1. Zero-click story &amp; listicle variations</li>
                <li>2. Dedicated First-Comment URL copy box</li>
                <li>3. 1080p Visual Card &amp; Article Image picker</li>
                <li>4. 1-Click Share to Facebook, LinkedIn &amp; WhatsApp</li>
              </ul>
            </div>
          </div>
        </div>
      </header>

      <FacebookPostGeneratorClient />

      <section
        className={`${section} border-t border-slate-200 dark:border-slate-800`}
      >
        <h2 className="text-3xl font-extrabold">
          Publish native Facebook posts that pair text with high-impact visuals
        </h2>
        <p className={prose}>
          Instead of dropping bare links that get buried in the feed, package
          your best insights into native story posts paired with a custom quote
          or takeaway graphic.
        </p>

        <div className="mt-8 grid gap-5 md:grid-cols-3">
          {[
            [
              MessageCircle,
              "First-Comment Link Strategy",
              "Keep your main post 100% native while placing your article link in the first comment.",
            ],
            [
              ImageIcon,
              "Companion Visual Cards",
              "Download a 1080p PNG graphic or select an image extracted from your blog post.",
            ],
            [
              Share2,
              "1-Click Social Handoff",
              "Copy your post text and open the Facebook composer in a single click.",
            ],
          ].map(([Icon, heading, body]) => {
            const I = Icon as typeof MessageCircle;
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

      <ToolResources slug="facebook-post-generator" />
      <ToolFaq title="Facebook Post Generator FAQs" faqs={faqs} />
    </div>
  );
}
