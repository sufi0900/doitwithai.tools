import type { Metadata } from "next";
import Link from "next/link";
import { Code2, Globe, MapPin } from "lucide-react";
import LocalBusinessSchemaGeneratorClient from "@/features/local-business-schema-generator/LocalBusinessSchemaGeneratorClient";
import ToolFaq from "@/features/tool-ui/ToolFaq";
import ToolResources from "@/features/tool-catalog/ToolResources";
import {
  ToolHeroBackground,
  toolHeroHeading,
  toolHeroSurface,
} from "@/features/tool-ui/ToolHero";

const pageUrl =
  "https://doitwithai.tools/tools/local-business-schema-generator";
const title =
  "Free LocalBusiness Schema Markup Generator (JSON-LD) | 35+ Subtypes";
const description =
  "Build validated LocalBusiness JSON-LD structured data with 35+ industry subtypes, GeoCoordinates, OpeningHoursSpecification, areaServed cities, and sameAs links.";

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
    question: "Why should I use a specific LocalBusiness subtype instead of generic LocalBusiness?",
    answer:
      "Schema.org provides specific subtypes such as Dentist, HVACBusiness, LegalService, Plumber, Restaurant, and HairSalon. Using the most specific subtype helps Google Search, Google Maps, and AI answer engines disambiguate your exact service category.",
  },
  {
    question: "How do GeoCoordinates and areaServed help Local SEO?",
    answer:
      "GeoCoordinates confirm your exact latitude and longitude pin, while areaServed explicitly lists the surrounding cities, suburbs, or postal codes your team serves—strengthening relevance for 'near me' and neighboring city searches.",
  },
  {
    question: "What URLs should I place inside the sameAs property?",
    answer:
      "Include your official Google Business Profile link, Yelp, Better Business Bureau (BBB), Apple Business Connect, Facebook, Instagram, and LinkedIn company pages so search engines reconcile all citations as the same entity.",
  },
  {
    question: "Where do I paste the generated LocalBusiness JSON-LD script?",
    answer:
      "Paste the <script type='application/ld+json'> block into the <head> or body of your homepage or dedicated location landing page, then verify it in our Structured Data Validator.",
  },
];

const section = "mx-auto max-w-6xl px-4 py-12 sm:px-6";
const prose = "mt-4 text-base leading-8 text-slate-600 dark:text-slate-300";

export default function LocalBusinessSchemaGeneratorPage() {
  const schema = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebApplication",
        name: "LocalBusiness JSON-LD Schema Markup Generator",
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
          { name: "LocalBusiness Schema Generator", item: pageUrl },
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
            <span aria-current="page">LocalBusiness Schema Generator</span>
          </nav>

          <div className="grid items-center gap-8 lg:grid-cols-[minmax(0,1.35fr)_minmax(0,0.85fr)]">
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-[#b4c3ff]">
                Local SEO · Structured Data &amp; Entity Disambiguation
              </p>
              <h1 className="mt-4 text-3xl font-black leading-tight sm:text-4xl lg:text-5xl">
                LocalBusiness JSON-LD{" "}
                <span className={toolHeroHeading}>
                  Schema Markup Generator
                </span>
              </h1>
              <p className="mt-5 max-w-2xl text-base leading-8 text-slate-300">
                Generate rich, machine-readable <code>LocalBusiness</code>{" "}
                JSON-LD across 35+ industry subtypes with verified{" "}
                <code>PostalAddress</code>, <code>GeoCoordinates</code>,{" "}
                <code>OpeningHoursSpecification</code>,{" "}
                <code>areaServed</code> cities, and <code>sameAs</code> citation
                links.
              </p>
              <div className="mt-7 flex flex-wrap gap-3 text-xs font-semibold text-slate-200">
                <span className="rounded-lg border border-white/15 px-3 py-2">
                  35+ Industry Subtypes
                </span>
                <span className="rounded-lg border border-white/15 px-3 py-2">
                  GeoCoordinates + areaServed
                </span>
                <span className="rounded-lg border border-white/15 px-3 py-2">
                  OpeningHours + sameAs
                </span>
              </div>
            </div>

            <div className="rounded-2xl border border-[#9aabff]/30 bg-[#101b30]/90 p-6 shadow-xl">
              <p className="text-xs font-bold uppercase tracking-wider text-[#b4c3ff]">
                Built for Local Pack &amp; AI Search
              </p>
              <ul className="mt-4 space-y-2.5 text-xs text-slate-300">
                <li>1. Exact NAP parity with Google Business Profile</li>
                <li>2. Explicit GeoCoordinates &amp; Google Maps CID link</li>
                <li>3. Multi-city service-area declarations</li>
                <li>4. Instant HTML <code>&lt;script&gt;</code> &amp; raw JSON export</li>
              </ul>
            </div>
          </div>
        </div>
      </header>

      <LocalBusinessSchemaGeneratorClient />

      <section
        className={`${section} border-t border-slate-200 dark:border-slate-800`}
      >
        <h2 className="text-3xl font-extrabold">
          Connect your website, Google Business Profile, and local citations
        </h2>
        <p className={prose}>
          Local search engines cross-reference your on-page NAP details with
          your structured data and external directory listings to verify trust
          and proximity.
        </p>

        <div className="mt-8 grid gap-5 md:grid-cols-3">
          {[
            [
              MapPin,
              "35+ Specific Subtypes",
              "Choose from Dentist, HVACBusiness, Plumber, LegalService, Restaurant, AutoRepair, and more.",
            ],
            [
              Globe,
              "Service Area & Geo Pinning",
              "Declare every neighboring city you serve alongside exact latitude and longitude coordinates.",
            ],
            [
              Code2,
              "Entity sameAs Graph",
              "Link your Google Business Profile, Yelp, BBB, and social profiles into a single unified Knowledge Graph node.",
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

      <ToolResources slug="local-business-schema-generator" />
      <ToolFaq
        title="LocalBusiness Schema Markup Generator FAQs"
        faqs={faqs}
      />
    </div>
  );
}
