import type { Metadata } from "next";
import Link from "next/link";
import { MessageSquare, Sparkles, UserCheck } from "lucide-react";
import LinkedinCommentGeneratorClient from "@/features/linkedin-comment-generator/LinkedinCommentGeneratorClient";
import ToolFaq from "@/features/tool-ui/ToolFaq";
import ToolResources from "@/features/tool-catalog/ToolResources";
import {
  ToolHeroBackground,
  toolHeroHeading,
  toolHeroSurface,
} from "@/features/tool-ui/ToolHero";

const pageUrl = "https://doitwithai.tools/tools/linkedin-comment-generator";
const title =
  "Free LinkedIn Comment Generator — 5 Authority & Networking Angles";
const description =
  "Generate thoughtful, high-visibility LinkedIn comments from any post or article URL. Choose from authority frameworks, nuanced contrarian takes, and smart follow-up questions.";

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
    question: "Why do strategic LinkedIn comments drive more profile views than regular posts?",
    answer:
      "Commenting early on high-reach industry posts places your headline, name, and expertise directly under the eyes of thousands of targeted readers—without waiting for the feed algorithm to distribute your own post.",
  },
  {
    question: "How does this avoid sounding like generic AI comments?",
    answer:
      "Instead of generic praise like 'Great post!', the studio extracts the exact thesis of the post and generates 5 distinct practitioner angles: Authority Framework Add-On, 90/10 Nuanced Contrarian Take, Smart Follow-Up Question, Mini Case-Study Story, and a 2-Line Mobile Hook.",
  },
  {
    question: "Can I fetch an article or LinkedIn URL directly?",
    answer:
      "Yes. Paste any public article or post URL into the top extractor bar (or use the Manual Text box) to pull the core argument and sub-topics in one click.",
  },
];

const section = "mx-auto max-w-6xl px-4 py-12 sm:px-6";
const prose = "mt-4 text-base leading-8 text-slate-600 dark:text-slate-300";

export default function LinkedinCommentGeneratorPage() {
  const schema = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebApplication",
        name: "LinkedIn Comment & Engagement Generator",
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
          { name: "LinkedIn Comment Generator", item: pageUrl },
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
            <span aria-current="page">LinkedIn Comment Generator</span>
          </nav>

          <div className="grid items-center gap-8 lg:grid-cols-[minmax(0,1.35fr)_minmax(0,0.85fr)]">
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-[#b4c3ff]">
                Social Media Studio · B2B Authority &amp; Networking
              </p>
              <h1 className="mt-4 text-3xl font-black leading-tight sm:text-4xl lg:text-5xl">
                LinkedIn Comment &amp;{" "}
                <span className={toolHeroHeading}>
                  Engagement Strategy Studio
                </span>
              </h1>
              <p className="mt-5 max-w-2xl text-base leading-8 text-slate-300">
                Turn any LinkedIn post or industry article into 5 high-impact,
                human-sounding comments that spark author replies and drive
                qualified profile views.
              </p>
            </div>

            <div className="rounded-2xl border border-[#9aabff]/30 bg-[#101b30]/90 p-6 shadow-xl">
              <p className="text-xs font-bold uppercase tracking-wider text-[#b4c3ff]">
                5 Comment Angles Included
              </p>
              <ul className="mt-4 space-y-2.5 text-xs text-slate-300">
                <li>1. Authority &amp; Framework Add-On</li>
                <li>2. 90% Agree + 10% Nuanced Contrarian Take</li>
                <li>3. Smart A/B Follow-Up Question</li>
                <li>4. Real-World Practitioner Mini Story</li>
              </ul>
            </div>
          </div>
        </div>
      </header>

      <LinkedinCommentGeneratorClient />

      <section
        className={`${section} border-t border-slate-200 dark:border-slate-800`}
      >
        <h2 className="text-3xl font-extrabold">
          Build B2B authority in 5 minutes a day through strategic commenting
        </h2>
        <p className={prose}>
          High-performing LinkedIn operators treat comments as micro-posts. A
          well-structured comment under an industry leader&apos;s post stays
          pinned at the top of the thread and compounds profile visits all day.
        </p>

        <div className="mt-8 grid gap-5 md:grid-cols-3">
          {[
            [
              MessageSquare,
              "5 Distinct Formats",
              "Choose between framework add-ons, contrarian nuance, or question hooks.",
            ],
            [
              UserCheck,
              "Author Reply Predictor",
              "See why each comment works psychologically and how the original poster is likely to reply.",
            ],
            [
              Sparkles,
              "URL & Sub-Topic Fetcher",
              "Paste any article link to reply to specific H2 sections with precision.",
            ],
          ].map(([Icon, heading, body]) => {
            const I = Icon as typeof MessageSquare;
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

      <ToolResources slug="linkedin-comment-generator" />
      <ToolFaq title="LinkedIn Comment Generator FAQs" faqs={faqs} />
    </div>
  );
}
