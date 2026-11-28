import type { Metadata } from "next";
import ToolLandingHero from "@/features/tool-ui/ToolLandingHero";
import Link from "next/link";
import {
  CheckCircle2,
  FileSpreadsheet,
  MapPin,
} from "lucide-react";
import NapConsistencyCheckerClient from "@/features/nap-consistency-checker/NapConsistencyCheckerClient";
import ToolFaq from "@/features/tool-ui/ToolFaq";
import ToolResources from "@/features/tool-catalog/ToolResources";

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

      <ToolLandingHero
        slug="nap-consistency-checker"
        title="NAP Consistency Checker & Local Citation Formatter"
        description="Compare your canonical Business Name, Address, and Phone (NAP) against directory listings, distinguish harmless USPS abbreviation differences from ranking-killing phone/address conflicts, and export a Master Citation CSV."
        categoryLabel="Local SEO"
        categoryHref="/tools"
        workspaceId="tool-studio-workspace"
      >
        <div className="p-4 sm:p-6">
          <NapConsistencyCheckerClient />
        </div>
      </ToolLandingHero>

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
