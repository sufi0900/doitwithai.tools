import type { Metadata } from "next";
import ToolLandingHero from "@/features/tool-ui/ToolLandingHero";
import Link from "next/link";
import {
  Layers,
  MapPin,
  ShieldCheck,
} from "lucide-react";
import LocalSeoServicePagePlannerClient from "@/features/local-seo-service-page-planner/LocalSeoServicePagePlannerClient";
import ToolFaq from "@/features/tool-ui/ToolFaq";
import ToolResources from "@/features/tool-catalog/ToolResources";

const pageUrl =
  "https://doitwithai.tools/tools/local-seo-service-page-planner";
const title =
  "Free Local SEO Service-Area & City Landing Page Matrix Planner";
const description =
  "Plan a non-spammy City × Service landing page matrix, generate unique local H1s, meta titles, and H2 outlines, and prevent Google doorway-page penalties.";

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
    question: "How do I rank in neighboring cities where I don't have a physical office?",
    answer:
      "While your Google Business Profile ranks strongest near your physical address, your website can rank organically in surrounding suburbs and service-area cities by publishing dedicated, genuinely helpful City + Service landing pages backed by real local project photos and reviews from residents in those cities.",
  },
  {
    question: "What makes a city landing page get flagged as a 'Doorway Page' by Google?",
    answer:
      "Google's spam policies target mass-produced city pages that simply find-and-replace the city name on identical boilerplate text. To make each city page genuinely valuable, feature completed project case studies, specific neighborhood/ZIP references, local municipal permit rules, and real customer testimonials from that city.",
  },
  {
    question: "Should I create a separate page for every single service in every single city?",
    answer:
      "No. Creating 10 services × 20 cities (200 thin pages) dilutes crawl budget and triggers doorway filters. Instead, create dedicated '/services/[service]' pages anchored to your primary hub city, and create 1 comprehensive '/locations/[city]-[primary-category]' page for your top surrounding suburbs.",
  },
  {
    question: "How should internal links connect service pages and city pages?",
    answer:
      "Link from your main '/services/*' pages down to your neighboring city pages ('Also serving Aurora, Lakewood, and Littleton'), and link from each city page back up to your core service pages.",
  },
];

const section = "mx-auto max-w-6xl px-4 py-12 sm:px-6";
const prose = "mt-4 text-base leading-8 text-slate-600 dark:text-slate-300";

export default function LocalSeoServicePagePlannerPage() {
  const schema = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebApplication",
        name: "Local SEO Service-Area & City Landing Page Planner",
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
          { name: "Local SEO Service Page Planner", item: pageUrl },
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
        slug="local-seo-service-page-planner"
        title="Service-Area & City Landing Page Matrix Planner"
        description="Turn your services and target cities into a clean, cannibalization-free URL silo with localized meta tags, H2 outlines, internal linking paths, and anti-doorway page proof checklists."
        categoryLabel="Local SEO"
        categoryHref="/tools"
        workspaceId="tool-studio-workspace"
      >
        <div className="p-4 sm:p-6">
          <LocalSeoServicePagePlannerClient />
        </div>
      </ToolLandingHero>

      <section
        className={`${section} border-t border-slate-200 dark:border-slate-800`}
      >
        <h2 className="text-3xl font-extrabold">
          Expand your local search footprint beyond your primary ZIP code
        </h2>
        <p className={prose}>
          Service-area businesses (plumbers, roofers, HVAC, attorneys, home
          care, and mobile specialists) rely on organic city pages to capture
          high-intent searches in surrounding suburbs.
        </p>

        <div className="mt-8 grid gap-5 md:grid-cols-3">
          {[
            [
              Layers,
              "Hub & Spoke URL Silos",
              "Separates core '/services/*' pages from '/locations/*' suburb pages so URLs never cannibalize each other.",
            ],
            [
              ShieldCheck,
              "Anti-Doorway Guardrails",
              "Prompts writers to add neighborhood landmarks, real job photos, and city-specific customer reviews.",
            ],
            [
              MapPin,
              "AI City Brief Generator",
              "Generates localized intro paragraphs and city-specific FAQs for any page in your matrix.",
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

      <ToolResources slug="local-seo-service-page-planner" />
      <ToolFaq title="Local SEO Service-Area Page Planner FAQs" faqs={faqs} />
    </div>
  );
}
