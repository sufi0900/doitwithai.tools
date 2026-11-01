import type { Metadata } from "next";
import Link from "next/link";
import { Code2, Layers, Sparkles } from "lucide-react";
import BlogToInfographicGeneratorClient from "@/features/blog-to-infographic-generator/BlogToInfographicGeneratorClient";
import ToolFaq from "@/features/tool-ui/ToolFaq";
import ToolResources from "@/features/tool-catalog/ToolResources";
import {
  ToolHeroBackground,
  toolHeroHeading,
  toolHeroSurface,
} from "@/features/tool-ui/ToolHero";
import { PlatformBrandIcon } from "@/features/tool-ui/PlatformBrandIcon";

const pageUrl = "https://doitwithai.tools/tools/blog-to-infographic-generator";
const title =
  "Free AI Blog to Infographic Generator — 8 Editable Visual Templates";
const description =
  "Convert any blog URL, article sub-topic, or content idea into a high-resolution visual infographic with 8 built-in editable templates, 6 color themes, PNG/SVG/PDF export, and SEO backlink embed code.";

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
    question: "How does the AI Blog to Infographic Generator work?",
    answer:
      "Paste any blog URL, YouTube video link, or bulleted outline. Our extractor slices the article into 4 to 8 concise visual cards and renders them inside an interactive HTML5 canvas where you can switch between 8 professional infographic templates and edit any text live.",
  },
  {
    question: "Which infographic templates are built into the studio?",
    answer:
      "You can switch with 1 click between: (1) Step-by-Step Roadmap, (2) A vs. B Comparison, (3) KPI & Stat Bento Grid, (4) Vertical Timeline, (5) Do's & Don'ts Split, (6) Pyramid / Funnel Hierarchy, (7) Saveable Checklist, and (8) Pillar & Spoke Grid.",
  },
  {
    question: "Can I use the generated infographics to earn SEO backlinks?",
    answer:
      "Yes! Click the 'SEO Backlink Embed Code' button to generate a ready-to-copy HTML <figure> snippet that credits your original article URL with a dofollow link whenever another website embeds your infographic.",
  },
];

const section = "mx-auto max-w-6xl px-4 py-12 sm:px-6";
const prose = "mt-4 text-base leading-8 text-slate-600 dark:text-slate-300";

export default function BlogToInfographicGeneratorPage() {
  const schema = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebApplication",
        name: "AI Blog to Infographic Generator & Visual Template Studio",
        url: pageUrl,
        description,
        applicationCategory: "DesignApplication",
        operatingSystem: "Any",
        isAccessibleForFree: true,
        offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { name: "Home", item: "https://doitwithai.tools" },
          { name: "Tools", item: "https://doitwithai.tools/tools" },
          { name: "Blog to Infographic Generator", item: pageUrl },
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
            <span aria-current="page">Blog to Infographic Generator</span>
          </nav>

          <div className="grid items-center gap-8 lg:grid-cols-[minmax(0,1.35fr)_minmax(0,0.85fr)]">
            <div>
              <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-xs font-bold text-white backdrop-blur-xs">
                <PlatformBrandIcon
                  slugOrText="blog-to-infographic-generator"
                  size={18}
                />
                <span>Visual Infographic Studio · 8 Editable Templates</span>
              </div>
              <p className="text-xs font-bold uppercase tracking-widest text-[#b4c3ff]">
                Content Conversion · Visual Linkable Assets &amp; Social Posters
              </p>
              <h1 className="mt-4 text-3xl font-black leading-tight sm:text-4xl lg:text-5xl">
                AI Blog &amp; Idea to{" "}
                <span className={toolHeroHeading}>
                  Visual Infographic Studio
                </span>
              </h1>
              <p className="mt-5 max-w-2xl text-base leading-8 text-slate-300">
                Turn any blog post URL, H2 sub-topic, or content idea into a
                publication-ready infographic using 8 editable templates—and
                export high-res PNG, Vector SVG, PDF, and SEO backlink embed
                code.
              </p>
            </div>

            <div className="rounded-2xl border border-[#9aabff]/30 bg-[#101b30]/90 p-6 shadow-xl">
              <p className="text-xs font-bold uppercase tracking-wider text-[#b4c3ff]">
                8 Built-In Editable Infographic Layouts
              </p>
              <ul className="mt-4 space-y-2.5 text-xs text-slate-300">
                <li>1. Step-by-Step Roadmap &amp; Vertical Timeline</li>
                <li>2. Side-by-Side A vs. B Comparison &amp; Do&apos;s/Don&apos;ts</li>
                <li>3. KPI &amp; Stat Bento Grid + Pyramid Funnel</li>
                <li>4. Instant PNG, Vector SVG, PDF &amp; SEO Embed HTML</li>
              </ul>
            </div>
          </div>
        </div>
      </header>

      <BlogToInfographicGeneratorClient />

      <section
        className={`${section} border-t border-slate-200 dark:border-slate-800`}
      >
        <h2 className="text-3xl font-extrabold">
          Turn written articles into high-retention visual infographics
        </h2>
        <p className={prose}>
          Embedding a custom infographic at the top of a blog post increases
          reader dwell time, earns Pinterest and LinkedIn shares, and gives
          other bloggers a visual asset to embed with a backlink to your site.
        </p>

        <div className="mt-8 grid gap-5 md:grid-cols-3">
          {[
            [
              Layers,
              "8 Editable Visual Templates",
              "Switch between roadmaps, comparisons, bento stat grids, timelines, pyramids, and checklists in one click.",
            ],
            [
              Sparkles,
              "Live Inline Node Editor",
              "Edit every card's badge, headline, explanation, metric pill, and brand footer with real-time canvas preview.",
            ],
            [
              Code2,
              "SEO Backlink Embed Generator",
              "Copy a ready-made HTML <figure> snippet so other publishers attribute your domain when sharing your visual.",
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

      <ToolResources slug="blog-to-infographic-generator" />
      <ToolFaq title="AI Blog to Infographic Generator FAQs" faqs={faqs} />
    </div>
  );
}
