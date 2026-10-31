import type { Metadata } from "next";
import Link from "next/link";
import { MessageSquare, QrCode, Star } from "lucide-react";
import GoogleReviewLinkGeneratorClient from "@/features/google-review-link-generator/GoogleReviewLinkGeneratorClient";
import ToolFaq from "@/features/tool-ui/ToolFaq";
import ToolResources from "@/features/tool-catalog/ToolResources";
import {
  ToolHeroBackground,
  toolHeroHeading,
  toolHeroSurface,
} from "@/features/tool-ui/ToolHero";

const pageUrl = "https://doitwithai.tools/tools/google-review-link-generator";
const title =
  "Free Google Review Link & QR Code Poster Generator | Local SEO Tool";
const description =
  "Generate a direct 1-click Google Review link from your Place ID, download a vector QR code and printable counter poster, and copy SMS, WhatsApp, and email review templates.";

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
    question: "How does a direct Google Review link improve Local SEO rankings?",
    answer:
      "Google's Local Pack and Google Maps algorithm heavily weights review volume, review recency, and review velocity. Removing friction with a direct writereview pop-up link and scannable QR code increases customer completion rates.",
  },
  {
    question: "What is a Google Place ID and how does this tool use it?",
    answer:
      "A Google Place ID (typically starting with 'ChIJ...') is Google Maps' unique identifier for a physical business location or service-area listing. Appending it to https://search.google.com/local/writereview?placeid= opens the 5-star review modal immediately.",
  },
  {
    question: "Can I print the QR code poster for my reception desk or restaurant tables?",
    answer:
      "Yes. Click 'Print Counter Poster / Save PDF' to open a print-ready table tent layout, or click 'Download QR Code (.SVG)' to place the scalable vector QR code into Canva, Adobe Illustrator, or your printed invoices.",
  },
  {
    question: "Is it against Google's guidelines to ask customers for reviews?",
    answer:
      "Google explicitly encourages businesses to ask customers for reviews using short links and QR codes—as long as you do not offer financial incentives (review gating or paid rewards) in exchange for positive ratings.",
  },
];

const section = "mx-auto max-w-6xl px-4 py-12 sm:px-6";
const prose = "mt-4 text-base leading-8 text-slate-600 dark:text-slate-300";

export default function GoogleReviewLinkGeneratorPage() {
  const schema = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebApplication",
        name: "Google Review Link & QR Code Poster Generator",
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
          { name: "Google Review Link Generator", item: pageUrl },
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
            <span aria-current="page">Google Review Link Generator</span>
          </nav>

          <div className="grid items-center gap-8 lg:grid-cols-[minmax(0,1.35fr)_minmax(0,0.85fr)]">
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-[#b4c3ff]">
                Local SEO · Google Business Profile &amp; Review Velocity
              </p>
              <h1 className="mt-4 text-3xl font-black leading-tight sm:text-4xl lg:text-5xl">
                Google Review Link &amp;{" "}
                <span className={toolHeroHeading}>
                  QR Code Poster Generator
                </span>
              </h1>
              <p className="mt-5 max-w-2xl text-base leading-8 text-slate-300">
                Create a direct 1-click Google Review pop-up link from your
                Place ID, download a scalable vector QR code and printable
                table-tent poster, and copy ready-to-send SMS, WhatsApp, and
                email follow-ups.
              </p>
              <div className="mt-7 flex flex-wrap gap-3 text-xs font-semibold text-slate-200">
                <span className="rounded-lg border border-white/15 px-3 py-2">
                  Direct writereview URL
                </span>
                <span className="rounded-lg border border-white/15 px-3 py-2">
                  SVG QR + Printable Poster
                </span>
                <span className="rounded-lg border border-white/15 px-3 py-2">
                  SMS, WhatsApp &amp; Email Copy
                </span>
              </div>
            </div>

            <div className="rounded-2xl border border-[#9aabff]/30 bg-[#101b30]/90 p-6 shadow-xl">
              <p className="text-xs font-bold uppercase tracking-wider text-[#b4c3ff]">
                What You Generate Instantly
              </p>
              <ul className="mt-4 space-y-2.5 text-xs text-slate-300">
                <li>1. Direct 1-click Google Review pop-up URL</li>
                <li>2. Vector SVG QR Code for print &amp; receipts</li>
                <li>3. Printable 5-Star Reception / Table Tent Poster</li>
                <li>4. Personalized SMS, WhatsApp &amp; Email requests</li>
              </ul>
            </div>
          </div>
        </div>
      </header>

      <GoogleReviewLinkGeneratorClient />

      <section
        className={`${section} border-t border-slate-200 dark:border-slate-800`}
      >
        <h2 className="text-3xl font-extrabold">
          Turn happy local customers into consistent 5-star Google reviews
        </h2>
        <p className={prose}>
          Most satisfied customers intend to leave a review, but drop off when
          they have to search for your business name on Google Maps, scroll past
          ads, and locate the review tab manually.
        </p>

        <div className="mt-8 grid gap-5 md:grid-cols-3">
          {[
            [
              Star,
              "1-Click Review Modal",
              "Sends customers straight into the 5-star rating pop-up window on mobile and desktop.",
            ],
            [
              QrCode,
              "Print-Ready Counter Poster",
              "Generate a branded table tent or reception sign that customers can scan in 3 seconds.",
            ],
            [
              MessageSquare,
              "SMS & WhatsApp Follow-Ups",
              "Pre-filled outreach messages tailored to the exact service your customer just received.",
            ],
          ].map(([Icon, heading, body]) => {
            const I = Icon as typeof Star;
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

      <ToolResources slug="google-review-link-generator" />
      <ToolFaq
        title="Google Review Link & QR Code Generator FAQs"
        faqs={faqs}
      />
    </div>
  );
}
