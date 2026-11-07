import type { Metadata } from "next";
import Link from "next/link";
import { BookOpen, FileCheck2, PenTool, ShieldCheck } from "lucide-react";
import AiBlogWriterClient from "@/features/ai-blog-writer/AiBlogWriterClient";
import PortableToolHeroBar from "@/features/portable-tool-kit/PortableToolHeroBar";
import ToolFaq from "@/features/tool-ui/ToolFaq";
import ToolResources from "@/features/tool-catalog/ToolResources";
import {
  ToolHeroBackground,
  toolHeroHeading,
  toolHeroSurface,
} from "@/features/tool-ui/ToolHero";

const pageUrl = "https://doitwithai.tools/tools/ai-blog-article-writer";
const title =
  "Free AI Blog & Article Writer | Section-by-Section E-E-A-T Content Studio";
const description =
  "Write complete, reader-first SEO blog articles with a 50-word Position Zero answer lead, 3 introduction hook frameworks, editable H2/H3 sections, and E-E-A-T proof prompts.";

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
    question: "How does this AI Blog & Article Writer avoid generic AI fluff?",
    answer:
      "Instead of generating a wall of unverified text from a single keyword, this studio includes a dedicated 'First-Hand Experience / Proof Note' field and embeds section-by-section E-E-A-T prompts reminding you where to insert real screenshots, metrics, and practitioner examples.",
  },
  {
    question: "What are the 3 introduction hook frameworks included?",
    answer:
      "Every draft generates three selectable introduction styles: (1) Direct Answer + Practitioner Proof (optimized for Google Position Zero and AI Overviews), (2) Problem–Agitation–Solution (PAS for reader retention), and (3) Contrarian Insight Hook (ideal for social and newsletter shares).",
  },
  {
    question: "Can I import an outline from a reference or competitor URL?",
    answer:
      "Yes. Paste any public article URL into the top extractor bar to pull its topic, primary keyword, and H2 heading structure into your brief automatically.",
  },
  {
    question: "Can I edit individual H2 sections before exporting?",
    answer:
      "Yes. Every H2 section renders in its own editable Markdown card so you can refine wording, add personal proof, and export the complete compiled article as a .md file or clipboard Markdown.",
  },
];

const section = "mx-auto max-w-6xl px-4 py-12 sm:px-6";
const prose = "mt-4 text-base leading-8 text-slate-600 dark:text-slate-300";

export default function AiBlogArticleWriterPage() {
  const schema = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebApplication",
        name: "AI Blog & Article Writer Studio",
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
          { name: "AI Blog & Article Writer", item: pageUrl },
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
            <Link href="/tools">Tools</Link>
            <span>/</span>
            <span aria-current="page">AI Blog &amp; Article Writer</span>
          </nav>

          <div className="grid items-center gap-8 lg:grid-cols-[minmax(0,1.35fr)_minmax(0,0.85fr)]">
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-[#b4c3ff]">
                Content Writing &amp; SEO · Section-by-Section Article Studio
              </p>
              <h1 className="mt-4 text-3xl font-black leading-tight sm:text-4xl lg:text-5xl">
                Free AI Blog &amp;{" "}
                <span className={toolHeroHeading}>
                  Article Writer Studio
                </span>
              </h1>
              <p className="mt-5 max-w-2xl text-base leading-8 text-slate-300">
                Turn your keyword brief and first-hand testing notes into a
                complete, structured blog post—complete with a 50-word Position
                Zero answer lead, 3 introduction hook options, editable H2/H3
                sections, and reader FAQs.
              </p>
              <div className="mt-7 flex flex-wrap gap-3 text-xs font-semibold text-slate-200">
                <span className="rounded-lg border border-white/15 px-3 py-2">
                  3 intro hook frameworks
                </span>
                <span className="rounded-lg border border-white/15 px-3 py-2">
                  Section-by-section E-E-A-T editor
                </span>
                <span className="rounded-lg border border-white/15 px-3 py-2">
                  1-click URL outline import &amp; MD export
                </span>
              </div>
              <PortableToolHeroBar slug="ai-blog-article-writer" />
            </div>

            <div className="rounded-2xl border border-[#9aabff]/30 bg-[#101b30]/90 p-6 shadow-xl">
              <p className="text-xs font-bold uppercase tracking-wider text-[#b4c3ff]">
                4 Elements Built Into Every Article
              </p>
              <ul className="mt-4 space-y-2.5 text-xs text-slate-300">
                <li>
                  <strong className="text-emerald-300">
                    Answer-First Lead:
                  </strong>{" "}
                  45–58 word direct answer passage calibrated for Position Zero.
                </li>
                <li>
                  <strong className="text-indigo-300">3 Intro Angles:</strong>{" "}
                  Switch between Direct Proof, PAS, and Contrarian hooks.
                </li>
                <li>
                  <strong className="text-sky-300">
                    Editable H2 Sections:
                  </strong>{" "}
                  Scannable subheadings, bullet points, and E-E-A-T proof cues.
                </li>
                <li>
                  <strong className="text-amber-300">
                    FAQ &amp; Next Steps:
                  </strong>{" "}
                  High-intent reader Q&amp;As and conclusion checklist.
                </li>
              </ul>
            </div>
          </div>
        </div>
      </header>

      <AiBlogWriterClient />

      <section
        className={`${section} border-t border-slate-200 dark:border-slate-800`}
      >
        <p className="text-xs font-bold uppercase tracking-wider text-[#5271ff]">
          AI speed + Human judgment
        </p>
        <h2 className="mt-3 text-3xl font-extrabold">
          Write structured, citation-ready articles without losing your human
          voice
        </h2>
        <p className={prose}>
          Publishing raw, unedited AI paragraphs rarely earns rankings or reader
          trust. By combining a structured H2 outline with your own first-hand
          experience notes, you produce articles that answer the searcher&apos;s
          query immediately and demonstrate real practitioner authority.
        </p>

        <div className="mt-8 grid gap-5 md:grid-cols-3">
          {[
            [
              PenTool,
              "Compare 3 Introduction Hooks",
              "Test a direct Position-Zero definition lead against a Problem–Agitation–Solution or Contrarian opening before committing to your draft.",
            ],
            [
              BookOpen,
              "Refine Section by Section",
              "Edit each H2 block independently and follow the built-in E-E-A-T prompts to add screenshots, tables, and real-world measurements.",
            ],
            [
              FileCheck2,
              "Chain Into Your SEO Audit",
              "Export clean Markdown in one click, or pass your finished draft straight into our 20-Signal E-E-A-T Auditor and Pinterest Pin Studio.",
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

      <ToolResources slug="ai-blog-article-writer" />
      <ToolFaq title="AI blog & article writer questions" faqs={faqs} />
    </div>
  );
}
