import type { Metadata } from "next";
import Link from "next/link";
import { CheckCircle2, MapPin, Sparkles } from "lucide-react";
import GoogleBusinessProfileAuditorClient from "@/features/google-business-profile-auditor/GoogleBusinessProfileAuditorClient";
import ToolFaq from "@/features/tool-ui/ToolFaq";
import ToolResources from "@/features/tool-catalog/ToolResources";
import {
  ToolHeroBackground,
  toolHeroHeading,
  toolHeroSurface,
} from "@/features/tool-ui/ToolHero";

const pageUrl =
  "https://doitwithai.tools/tools/google-business-profile-auditor";
const title =
  "Free Google Business Profile (GBP) Auditor & AI Optimizer | Local SEO";
const description =
  "Audit your Google Business Profile across 10 Local Pack ranking factors, score Relevance and Prominence, and generate an optimized 750-character GBP description, Q&As, and weekly posts.";

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
    question: "What are the most important Google Business Profile ranking factors?",
    answer:
      "Google evaluates Local Pack rankings across three pillars: Relevance (Primary Category, Secondary Categories, Services, and Description entities), Distance (proximity and service-area coverage), and Prominence (Review count, rating, owner response rate, and website authority).",
  },
  {
    question: "Why should I add UTM parameters to my GBP website and appointment URLs?",
    answer:
      "Without UTM parameters (?utm_source=google&utm_medium=organic&utm_campaign=gbp), clicks from Google Maps and the Local 3-Pack often get bucketed alongside standard organic or direct traffic in Google Analytics 4 and Search Console.",
  },
  {
    question: "Am I allowed to post my own questions and answers in GBP Q&A?",
    answer:
      "Yes. Google explicitly encourages business owners to seed frequently asked questions and provide clear, helpful answers so prospective customers see accurate pricing, parking, and scheduling info immediately.",
  },
  {
    question: "How often should I publish Google Business Profile updates?",
    answer:
      "Publishing at least 1 GBP post per week (rotating between Service Spotlights, Special Offers, and What's New updates) signals active profile management and increases click-through conversions.",
  },
];

const section = "mx-auto max-w-6xl px-4 py-12 sm:px-6";
const prose = "mt-4 text-base leading-8 text-slate-600 dark:text-slate-300";

export default function GoogleBusinessProfileAuditorPage() {
  const schema = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebApplication",
        name: "Google Business Profile (GBP) Completeness Auditor & Optimizer",
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
          { name: "Google Business Profile Auditor", item: pageUrl },
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
            <span aria-current="page">Google Business Profile Auditor</span>
          </nav>

          <div className="grid items-center gap-8 lg:grid-cols-[minmax(0,1.35fr)_minmax(0,0.85fr)]">
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-[#b4c3ff]">
                Local SEO · Google Maps &amp; 3-Pack Optimization
              </p>
              <h1 className="mt-4 text-3xl font-black leading-tight sm:text-4xl lg:text-5xl">
                Google Business Profile{" "}
                <span className={toolHeroHeading}>
                  Auditor &amp; AI Optimizer
                </span>
              </h1>
              <p className="mt-5 max-w-2xl text-base leading-8 text-slate-300">
                Score your Google Business Profile across 10 Local Pack ranking
                signals, uncover category and UTM gaps, and generate a
                compliant 750-character description, pre-seeded Q&amp;As, and
                weekly GBP posts.
              </p>
              <div className="mt-7 flex flex-wrap gap-3 text-xs font-semibold text-slate-200">
                <span className="rounded-lg border border-white/15 px-3 py-2">
                  10-Point Local Pack Audit
                </span>
                <span className="rounded-lg border border-white/15 px-3 py-2">
                  750-Char GBP Description
                </span>
                <span className="rounded-lg border border-white/15 px-3 py-2">
                  Owner Q&amp;A + Weekly Posts
                </span>
              </div>
            </div>

            <div className="rounded-2xl border border-[#9aabff]/30 bg-[#101b30]/90 p-6 shadow-xl">
              <p className="text-xs font-bold uppercase tracking-wider text-[#b4c3ff]">
                Complete GBP Optimization Suite
              </p>
              <ul className="mt-4 space-y-2.5 text-xs text-slate-300">
                <li>1. Relevance, Prominence &amp; Conversion scores</li>
                <li>2. Title keyword-stuffing suspension check</li>
                <li>3. Optimized 750-char description with local entities</li>
                <li>4. Pre-seeded Q&amp;As and 3 weekly GBP posts</li>
              </ul>
            </div>
          </div>
        </div>
      </header>

      <GoogleBusinessProfileAuditorClient />

      <section
        className={`${section} border-t border-slate-200 dark:border-slate-800`}
      >
        <h2 className="text-3xl font-extrabold">
          Strengthen every signal Google Maps uses to rank local businesses
        </h2>
        <p className={prose}>
          An incomplete Google Business Profile leaves Local 3-Pack rankings on
          the table—even if your website has strong organic backlinks.
        </p>

        <div className="mt-8 grid gap-5 md:grid-cols-3">
          {[
            [
              MapPin,
              "Primary & Secondary Categories",
              "Ensure your primary category matches high-intent buyer searches while secondary categories unlock service menus.",
            ],
            [
              CheckCircle2,
              "Suspension-Safe Title Check",
              "Detect pipe-separated keyword stuffing in business titles before it triggers a Google Business Profile suspension.",
            ],
            [
              Sparkles,
              "Pre-Seeded Q&As & Posts",
              "Copy ready-to-publish owner Q&As and weekly GBP Offer/Spotlight updates in one click.",
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

      <ToolResources slug="google-business-profile-auditor" />
      <ToolFaq title="Google Business Profile Auditor FAQs" faqs={faqs} />
    </div>
  );
}
