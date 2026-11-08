import type { Metadata } from "next";
import Link from "next/link";
import { Code2, FileCheck2, ShieldCheck, Wrench } from "lucide-react";
import OnPageRepairAgentClient from "@/features/on-page-repair-agent/OnPageRepairAgentClient";
import PortableToolHeroBar from "@/features/portable-tool-kit/PortableToolHeroBar";
import ToolFaq from "@/features/tool-ui/ToolFaq";
import ToolResources from "@/features/tool-catalog/ToolResources";
import {
  ToolHeroBackground,
  toolHeroHeading,
  toolHeroSurface,
} from "@/features/tool-ui/ToolHero";

const pageUrl = "https://doitwithai.tools/agents/on-page-ai-seo-repair-agent";
const title =
  "Free On-Page AI SEO Repair Agent | Auto-Fix Metadata, Headings & JSON-LD Patch";
const description =
  "Run an autonomous On-Page SEO Repair Agent on any URL. Diagnose pixel truncation, weak headings, and missing schema—then copy a ready-to-deploy HTML <head> and JSON-LD patch.";

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
      "Standard audit tools only list warnings and leave you to write the fixes manually. This Autonomous Repair Agent diagnoses title pixel truncation, weak H2 headings, missing image alt text, and absent structured data—and immediately compiles a drop-in HTML <head> patch, Position Zero answer block, and validated JSON-LD @graph.",
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
          { name: "AI Agents", item: "https://doitwithai.tools/agents" },
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

      <header
        className={`relative overflow-hidden ${toolHeroSurface} text-white`}
      >
        <ToolHeroBackground />
        <div className="relative mx-auto max-w-6xl px-4 py-6 sm:px-6 sm:py-8">
          <nav
            aria-label="Breadcrumb"
            className="mb-4 flex flex-wrap gap-2 text-xs text-slate-300"
          >
            <Link href="/">Home</Link>
            <span>/</span>
            <Link href="/agents">AI Agents</Link>
            <span>/</span>
            <span aria-current="page">On-Page AI SEO Repair Agent</span>
          </nav>

          <div className="grid items-center gap-8 lg:grid-cols-[minmax(0,1.35fr)_minmax(0,0.85fr)]">
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-[#b4c3ff]">
                Autonomous SEO Agent · Diagnose &amp; Auto-Generate Code Patches
              </p>
              <h1 className="mt-4 text-3xl font-black leading-tight sm:text-4xl lg:text-5xl">
                Autonomous On-Page{" "}
                <span className={toolHeroHeading}>
                  AI SEO Repair Agent
                </span>
              </h1>
              <p className="mt-5 max-w-2xl text-base leading-8 text-slate-300">
                Move beyond passive SEO checklists. Extract any live URL,
                diagnose metadata and heading bottlenecks, and automatically
                compile a ready-to-deploy HTML <code>&lt;head&gt;</code> patch,
                50-word Position Zero lead, semantic H1/H2 refactors, and
                validated JSON-LD schema.
              </p>
              <div className="mt-7 flex flex-wrap gap-3 text-xs font-semibold text-slate-200">
                <span className="rounded-lg border border-white/15 px-3 py-2">
                  1-click HTML &lt;head&gt; &amp; JSON-LD patch
                </span>
                <span className="rounded-lg border border-white/15 px-3 py-2">
                  Before/After H1–H2 heading refactors
                </span>
                <span className="rounded-lg border border-white/15 px-3 py-2">
                  50-word Position Zero &amp; Image Alt fixes
                </span>
              </div>
              <PortableToolHeroBar slug="on-page-ai-seo-repair-agent" />
            </div>

            <div className="rounded-2xl border border-[#9aabff]/30 bg-[#101b30]/90 p-6 shadow-xl">
              <p className="text-xs font-bold uppercase tracking-wider text-[#b4c3ff]">
                4 Autonomous Repair Deliverables
              </p>
              <ul className="mt-4 space-y-2.5 text-xs text-slate-300">
                <li>
                  <strong className="text-emerald-300">
                    Pixel-Checked Metadata:
                  </strong>{" "}
                  Rewrites Title (&lt;580px) and Meta Description for SERP CTR.
                </li>
                <li>
                  <strong className="text-indigo-300">
                    Position Zero Lead HTML:
                  </strong>{" "}
                  50-word semantic summary block for AI Overviews.
                </li>
                <li>
                  <strong className="text-sky-300">
                    Heading &amp; Alt Patches:
                  </strong>{" "}
                  Upgrades vague H2s and writes missing <code>&lt;img alt&gt;</code> tags.
                </li>
                <li>
                  <strong className="text-amber-300">
                    Drop-In JSON-LD @graph:
                  </strong>{" "}
                  TechArticle + FAQPage + Author entity structured data.
                </li>
              </ul>
            </div>
          </div>
        </div>
      </header>

      <OnPageRepairAgentClient />

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
