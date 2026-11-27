import ToolLandingHero from "@/features/tool-ui/ToolLandingHero";
import type { Metadata } from "next";
import Link from "next/link";
import {
  Code2,
  FileCheck2,
  ShieldCheck,
  Wrench,
} from "lucide-react";
import OnPageRepairAgentClient from "@/features/on-page-repair-agent/OnPageRepairAgentClient";
import ToolFaq from "@/features/tool-ui/ToolFaq";
import ToolResources from "@/features/tool-catalog/ToolResources";

const pageUrl = "https://doitwithai.tools/tools/on-page-ai-seo-repair-agent";
const title =
  "Free On-Page AI SEO Repair Agent | Auto-Fix Metadata, Headings & JSON-LD Patch";
const description =
  "Run an autonomous On-Page SEO Repair Agent on any URL. Diagnose pixel truncation, weak headings, and missing schemaâ€”then copy a ready-to-deploy HTML <head> and JSON-LD patch.";

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
    question:
      "How is the On-Page AI SEO Repair Agent different from a standard SEO audit tool?",
    answer:
      "Standard audit tools only list warnings and leave you to write the fixes manually. This Autonomous Repair Agent diagnoses title pixel truncation, weak H2 headings, missing image alt text, and absent structured dataâ€”and immediately compiles a drop-in HTML <head> patch, Position Zero answer block, and validated JSON-LD @graph.",
  },
  {
    question: "Can I import a live URL automatically?",
    answer:
      "Yes. Paste any public URL into the top extractor bar to pull its current title tag, meta description, heading hierarchy, and unoptimized images directly into the agent workspace.",
  },
  {
    question: "Does the agent check SERP pixel width for title tags?",
    answer:
      "Yes. Every repaired title tag is measured in estimated desktop SERP pixels (targeting under 580px) so Google does not truncate or rewrite your headline.",
  },
  {
    question: "Is it safe to paste the generated HTML patch into my CMS?",
    answer:
      "Yes, after human editorial review. All generated meta tags, Open Graph properties, and JSON-LD structured data use standard, dependency-free HTML and Schema.org vocabulary.",
  },
];

const section = "mx-auto max-w-6xl px-4 py-12 sm:px-6";
const prose = "mt-4 text-base leading-8 text-slate-600 dark:text-slate-300";

export default function OnPageAiSeoRepairAgentPage() {
  const schema = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebApplication",
        name: "Autonomous On-Page AI SEO Repair Agent",
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
          { name: "AI Tools", item: "https://doitwithai.tools/tools" },
          { name: "On-Page AI SEO Repair Agent", item: pageUrl },
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
        slug="on-page-ai-seo-repair-agent"
        title="Autonomous On-Page AI SEO Repair Agent"
        description="Move beyond passive SEO checklists. Extract any live URL, diagnose metadata and heading bottlenecks, and automatically compile a ready-to-deploy HTML &lt;head&gt; patch, 50-word Position Zero lead, semantic H1/H2 refactors, and validated JSON-LD schema."
        categoryLabel="Autonomous SEO Agent Â"
        categoryHref="/tools"
        workspaceId="tool-studio-workspace"
      >
        <div className="p-4 sm:p-6">
          <OnPageRepairAgentClient />
        </div>
      </ToolLandingHero>

      <section
        className={`${section} border-t border-slate-200 dark:border-slate-800`}
      >
        <p className="text-xs font-bold uppercase tracking-wider text-[#5271ff]">
          Diagnosis to deployment in one workflow
        </p>
        <h2 className="mt-3 text-3xl font-extrabold">
          Stop copying between five separate SEO tools to fix a single page
        </h2>
        <p className={prose}>
          When auditing an underperforming article or landing page, switching
          between a title pixel counter, heading analyzer, alt text writer, and
          schema generator slows down execution. This repair agent unifies
          diagnosis and code synthesis so you can review, edit, and ship
          verified improvements in minutes.
        </p>

        <div className="mt-8 grid gap-5 md:grid-cols-3">
          {[
            [
              Wrench,
              "Fix Metadata & SERP Truncation",
              "Automatically align your title tag, H1, and meta description around your primary keyword while staying within Google desktop pixel limits.",
            ],
            [
              Code2,
              "Compile Ready-to-Paste HTML & Schema",
              "Generate a unified <head> snippet containing canonical tags, Open Graph social cards, and a linked TechArticle + FAQPage JSON-LD graph.",
            ],
            [
              FileCheck2,
              "Upgrade Headings & Image Accessibility",
              "Replace generic subheadings ('Overview', 'Conclusion') with entity-rich H2 landmarks and patch missing image alt attributes.",
            ],
          ].map(([Icon, heading, body]) => {
            const I = Icon as typeof ShieldCheck;
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

      <ToolResources slug="on-page-ai-seo-repair-agent" />
      <ToolFaq title="On-Page AI SEO Repair Agent questions" faqs={faqs} />
    </div>
  );
}
