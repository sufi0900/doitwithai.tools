import type { Metadata } from "next";
import Link from "next/link";
import { CheckCircle2, Link2, QrCode } from "lucide-react";
import UtmLinkBuilderClient from "@/features/utm-link-builder/UtmLinkBuilderClient";
import ToolFaq from "@/features/tool-ui/ToolFaq";
import ToolResources from "@/features/tool-catalog/ToolResources";
import {
  ToolHeroBackground,
  toolHeroHeading,
  toolHeroSurface,
} from "@/features/tool-ui/ToolHero";

const pageUrl = "https://doitwithai.tools/tools/utm-link-builder";
const title =
  "Free UTM Campaign Link Builder, GA4 Validator & QR Code Generator";
const description =
  "Build lowercase-normalized UTM tracking URLs, verify Google Analytics 4 (GA4) default channel grouping rules, export a 6-channel campaign CSV, and download a vector QR code.";

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
    question: "Why does traffic sometimes show up as 'Unassigned' in Google Analytics 4?",
    answer:
      "GA4 uses strict regex rules on utm_source and utm_medium to bucket sessions into Default Channel Groupings (such as Organic Social, Email, Paid Search, or Organic Video). Using non-standard medium names causes GA4 to dump those visits into 'Unassigned'. Our builder predicts your exact GA4 channel bucket in real time.",
  },
  {
    question: "Why should all UTM parameters be forced to lowercase?",
    answer:
      "UTM parameters are case-sensitive in Google Analytics. Tagging one link with utm_source=LinkedIn and another with utm_source=linkedin splits your reporting into two separate rows.",
  },
  {
    question: "Should I ever use UTM tags on internal links within my own website?",
    answer:
      "Never use UTM parameters on internal links between pages on your own domain. Clicking an internal UTM link overwrites the visitor's original acquisition source in analytics.",
  },
  {
    question: "How does the 6-Channel Bulk Matrix work?",
    answer:
      "Enter your destination URL and campaign name once, and the matrix automatically generates matching UTM links for LinkedIn, X/Twitter, YouTube, Instagram Bio, Email Newsletter, and Google Business Profile—ready to export as a single CSV.",
  },
];

const section = "mx-auto max-w-6xl px-4 py-12 sm:px-6";
const prose = "mt-4 text-base leading-8 text-slate-600 dark:text-slate-300";

export default function UtmLinkBuilderPage() {
  const schema = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebApplication",
        name: "UTM Campaign Link Builder, GA4 Validator & QR Studio",
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
          { name: "UTM Link Builder", item: pageUrl },
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
            <span aria-current="page">UTM Link Builder</span>
          </nav>

          <div className="grid items-center gap-8 lg:grid-cols-[minmax(0,1.35fr)_minmax(0,0.85fr)]">
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-[#b4c3ff]">
                Social Media &amp; Analytics · Campaign Attribution &amp; QR
              </p>
              <h1 className="mt-4 text-3xl font-black leading-tight sm:text-4xl lg:text-5xl">
                UTM Campaign Link Builder{" "}
                <span className={toolHeroHeading}>
                  &amp; GA4 Channel Validator
                </span>
              </h1>
              <p className="mt-5 max-w-2xl text-base leading-8 text-slate-300">
                Create clean, lowercase-normalized UTM tracking links for social
                media, newsletters, Google Business Profiles, and paid ads—with
                live GA4 channel prediction, bulk 6-channel CSV export, and
                vector QR code generation.
              </p>
              <div className="mt-7 flex flex-wrap gap-3 text-xs font-semibold text-slate-200">
                <span className="rounded-lg border border-white/15 px-3 py-2">
                  GA4 Channel Bucket Predictor
                </span>
                <span className="rounded-lg border border-white/15 px-3 py-2">
                  6-Channel Bulk CSV Matrix
                </span>
                <span className="rounded-lg border border-white/15 px-3 py-2">
                  Vector QR Code Export
                </span>
              </div>
            </div>

            <div className="rounded-2xl border border-[#9aabff]/30 bg-[#101b30]/90 p-6 shadow-xl">
              <p className="text-xs font-bold uppercase tracking-wider text-[#b4c3ff]">
                Stop Losing Attribution to &ldquo;Unassigned&rdquo;
              </p>
              <ul className="mt-4 space-y-2.5 text-xs text-slate-300">
                <li>1. Enforces lowercase &amp; snake_case parameter hygiene</li>
                <li>2. Verifies GA4 Default Channel Grouping compatibility</li>
                <li>3. Generates 6 multi-channel campaign URLs simultaneously</li>
                <li>4. Exports scalable SVG QR code for slides &amp; print</li>
              </ul>
            </div>
          </div>
        </div>
      </header>

      <UtmLinkBuilderClient />

      <section
        className={`${section} border-t border-slate-200 dark:border-slate-800`}
      >
        <h2 className="text-3xl font-extrabold">
          Keep every social post, newsletter, and GBP link cleanly attributed
        </h2>
        <p className={prose}>
          Consistent UTM naming conventions allow you to compare exact traffic
          and conversion ROI across LinkedIn, X, YouTube, email newsletters, and
          local search profiles.
        </p>

        <div className="mt-8 grid gap-5 md:grid-cols-3">
          {[
            [
              CheckCircle2,
              "GA4 Channel Validation",
              "Shows which GA4 Default Channel Grouping your utm_source and utm_medium combination will land in.",
            ],
            [
              Link2,
              "Multi-Channel Launch Matrix",
              "Automatically generates 6 channel-specific URLs for your campaign and exports them as a CSV sheet.",
            ],
            [
              QrCode,
              "Instant Vector QR Code",
              "Turn any UTM-tracked campaign URL into a print-ready SVG QR code for events, packaging, or slide decks.",
            ],
          ].map(([Icon, heading, body]) => {
            const I = Icon as typeof CheckCircle2;
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

      <ToolResources slug="utm-link-builder" />
      <ToolFaq title="UTM Campaign Link Builder FAQs" faqs={faqs} />
    </div>
  );
}
