import type { Metadata } from "next";
import Link from "next/link";
import { CheckCircle2, FileSpreadsheet, MapPin } from "lucide-react";
import NapConsistencyCheckerClient from "@/features/nap-consistency-checker/NapConsistencyCheckerClient";
import ToolFaq from "@/features/tool-ui/ToolFaq";
import ToolResources from "@/features/tool-catalog/ToolResources";
import {
  ToolHeroBackground,
  toolHeroHeading,
  toolHeroSurface,
} from "@/features/tool-ui/ToolHero";

const pageUrl = "https://doitwithai.tools/tools/nap-consistency-checker";
const title =
  "Free NAP Consistency Checker & Local Citation Formatter | Local SEO";
const description =
  "Audit Name, Address, and Phone (NAP) consistency across local directories, normalize USPS street and suite abbreviations, and export a Master Citation Sheet (.CSV).";

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
    question: "Why does NAP consistency matter for Local SEO and Google Maps?",
    answer:
      "Search engines cross-check your business Name, Address, and Phone number (NAP) across Google Business Profile, Apple Maps, Bing, Yelp, BBB, and data aggregators. Conflicting phone numbers, old street addresses, or inconsistent legal suffixes erode entity trust and can split rankings.",
  },
  {
    question: "Do minor street abbreviations like 'St.' vs 'Street' hurt rankings?",
    answer:
      "Modern search engines normalize standard USPS abbreviations (like 'St' vs 'Street' or 'Ste' vs '#'), which our tool flags as 'Normalized Match'. However, wrong phone digits, missing suite numbers, or rebranded business names ('Mismatch') require immediate correction.",
  },
  {
    question: "What are Local SEO Data Aggregators?",
    answer:
      "Data aggregators such as Data Axle, Localeze, and Foursquare distribute your canonical NAP record to hundreds of downstream GPS apps, local directories, and voice assistants.",
  },
  {
    question: "How do I use the downloadable Citation Master Sheet (.CSV)?",
    answer:
      "Click 'Download Citation Master Sheet (.CSV)' to get a pre-formatted spreadsheet containing your USPS-standardized NAP alongside direct submission links for Tier 1, Tier 2, and Tier 3 directories.",
  },
];

const section = "mx-auto max-w-6xl px-4 py-12 sm:px-6";
const prose = "mt-4 text-base leading-8 text-slate-600 dark:text-slate-300";

export default function NapConsistencyCheckerPage() {
  const schema = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebApplication",
        name: "NAP Consistency Checker & Local Citation Formatter",
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
          { name: "NAP Consistency Checker", item: pageUrl },
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
            <span aria-current="page">NAP Consistency Checker</span>
          </nav>

          <div className="grid items-center gap-8 lg:grid-cols-[minmax(0,1.35fr)_minmax(0,0.85fr)]">
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-[#b4c3ff]">
                Local SEO · Citations &amp; Directory Accuracy
              </p>
              <h1 className="mt-4 text-3xl font-black leading-tight sm:text-4xl lg:text-5xl">
                NAP Consistency Checker &amp;{" "}
                <span className={toolHeroHeading}>
                  Local Citation Formatter
                </span>
              </h1>
              <p className="mt-5 max-w-2xl text-base leading-8 text-slate-300">
                Compare your canonical Business Name, Address, and Phone (NAP)
                against directory listings, distinguish harmless USPS
                abbreviation differences from ranking-killing phone/address
                conflicts, and export a Master Citation CSV.
              </p>
              <div className="mt-7 flex flex-wrap gap-3 text-xs font-semibold text-slate-200">
                <span className="rounded-lg border border-white/15 px-3 py-2">
                  USPS Address Normalization
                </span>
                <span className="rounded-lg border border-white/15 px-3 py-2">
                  Exact vs. Normalized vs. Conflict
                </span>
                <span className="rounded-lg border border-white/15 px-3 py-2">
                  Master Citation CSV Export
                </span>
              </div>
            </div>

            <div className="rounded-2xl border border-[#9aabff]/30 bg-[#101b30]/90 p-6 shadow-xl">
              <p className="text-xs font-bold uppercase tracking-wider text-[#b4c3ff]">
                What This Citation Auditor Checks
              </p>
              <ul className="mt-4 space-y-2.5 text-xs text-slate-300">
                <li>1. Brand name &amp; legal suffix variations (LLC/Inc)</li>
                <li>2. USPS street &amp; suite standardization (St/Ste/#)</li>
                <li>3. Tracking phone vs. primary phone conflicts</li>
                <li>4. Pre-built Tier 1–3 citation submission sheet</li>
              </ul>
            </div>
          </div>
        </div>
      </header>

      <NapConsistencyCheckerClient />

      <section
        className={`${section} border-t border-slate-200 dark:border-slate-800`}
      >
        <h2 className="text-3xl font-extrabold">
          Eliminate citation conflicts before building new local links
        </h2>
        <p className={prose}>
          Even a single wrong digit in a directory phone number or an old suite
          number left on Yelp can confuse both customers and Google&apos;s local
          entity reconciliation engine.
        </p>

        <div className="mt-8 grid gap-5 md:grid-cols-3">
          {[
            [
              MapPin,
              "USPS-Standardized Format",
              "Automatically formats your street, suite, city, state, and postal code to match official postal standards.",
            ],
            [
              CheckCircle2,
              "Smart Normalization",
              "Separates benign abbreviations ('Street' vs 'St') from critical phone or suite errors that hurt local trust.",
            ],
            [
              FileSpreadsheet,
              "Ready-to-Use CSV Sheet",
              "Export a clean spreadsheet ready for your team or VA to update Tier 1, Tier 2, and Tier 3 directories.",
            ],
          ].map(([Icon, heading, body]) => {
            const I = Icon as typeof MapPin;
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

      <ToolResources slug="nap-consistency-checker" />
      <ToolFaq title="NAP Consistency & Citation Formatter FAQs" faqs={faqs} />
    </div>
  );
}
