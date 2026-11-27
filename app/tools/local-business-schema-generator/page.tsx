import type { Metadata } from "next";
import ToolLandingHero from "@/features/tool-ui/ToolLandingHero";
import Link from "next/link";
import {
  Code2,
  Globe,
  MapPin,
} from "lucide-react";
import LocalBusinessSchemaGeneratorClient from "@/features/local-business-schema-generator/LocalBusinessSchemaGeneratorClient";
import ToolFaq from "@/features/tool-ui/ToolFaq";
import ToolResources from "@/features/tool-catalog/ToolResources";

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

      <ToolLandingHero
        slug="local-business-schema-generator"
        title="LocalBusiness JSON-LD Schema Markup Generator"
        description="Generate rich, machine-readable LocalBusiness JSON-LD across 35+ industry subtypes with verified PostalAddress , GeoCoordinates , OpeningHoursSpecification , areaServed cities, and sameAs citation links."
        categoryLabel="Local SEO"
        categoryHref="/tools"
        workspaceId="tool-studio-workspace"
      >
        <div className="p-4 sm:p-6">
          <LocalBusinessSchemaGeneratorClient />
        </div>
      </ToolLandingHero>

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
