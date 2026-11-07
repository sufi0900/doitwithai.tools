import PortableToolHeroBar from "@/features/portable-tool-kit/PortableToolHeroBar";
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
  "Free AI Blog & Idea to Infographic Generator — 26 Vector Templates";
const description =
  "Turn any blog post URL, article excerpt, or random topic idea into a realistic vector infographic across 26 editable templates (S-Curve Roadmaps, 3D Pyramids, Timelines, Side-Image Splits, Donut Charts & Mind-Maps) with hover PNG, SVG, and PDF download.";

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
    question: "How does the AI Blog & Idea to Infographic Generator work?",
    answer:
      "You can either paste a blog/article URL to extract key points and images in 1 click, or enter any random topic idea. Our AI synthesizes 6 research-backed visual nodes with benchmarks and icons, auto-selects the best matching layout from 26 vector templates, and renders a live poster you can download on hover as PNG, SVG, or PDF.",
  },
  {
    question: "What types of infographic templates are included in the 26 layouts?",
    answer:
      "The studio includes 26 templates across 8 visual categories: S-Curve Winding Roadmaps, 3D Isometric Pyramids, 3D Conversion Funnels, Central Spine Timelines, Horizontal 16:9 Process & Milestone Boards, Left/Right Side-Image Magazine Splits, Radial Donut Ring Dashboards, Bento Grids, Head-to-Head VS Battles, 2×2 Matrices, and Radial Hub-and-Spoke Mind-Maps.",
  },
  {
    question: "How do I download the infographic as PNG, SVG, or PDF?",
    answer:
      "Simply hover your cursor over the live infographic poster preview. A floating download bar appears at the top of the infographic with 1-click buttons for 2x Retina PNG, Pure Editable Vector SVG, Print-Ready PDF, and Copy Image to Clipboard.",
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
        name: "AI Blog & Idea to Infographic Studio (26 Vector Templates)",
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
        <div className="relative mx-auto max-w-6xl px-4 py-6 sm:px-6 sm:py-8">
          <nav
            aria-label="Breadcrumb"
            className="mb-4 flex flex-wrap gap-2 text-xs text-slate-300"
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
                <span>Visual Infographic Studio · 26 Vector Templates</span>
              </div>
              <p className="text-xs font-bold uppercase tracking-widest text-[#b4c3ff]">
                Content Conversion · Pure Vector Infographics &amp; Hover Export
              </p>
              <h1 className="mt-4 text-3xl font-black leading-tight sm:text-4xl lg:text-5xl">
                AI Blog &amp; Idea to{" "}
                <span className={toolHeroHeading}>
                  Visual Infographic Studio
                </span>
              </h1>
              <p className="mt-5 max-w-2xl text-base leading-8 text-slate-300">
                Enter any topic idea or paste an article URL to generate a
                vector infographic across 26 templates—including S-Curve
                Roadmaps, 3D Pyramids, Side-Image Splits, Radial Donut Charts,
                and 16:9 Horizontal Boards—with instant hover download for PNG,
                SVG, and PDF.
              </p>
              <PortableToolHeroBar />
            </div>

            <div className="rounded-2xl border border-[#9aabff]/30 bg-[#101b30]/90 p-6 shadow-xl">
              <p className="text-xs font-bold uppercase tracking-wider text-[#b4c3ff]">
                26 Vector Infographic Layouts Across 8 Categories
              </p>
              <ul className="mt-4 space-y-2.5 text-xs text-slate-300">
                <li>1. S-Curve Roadmaps, 3D Staircases &amp; 360° Flywheels</li>
                <li>2. 3D Layered Pyramids, Conversion Funnels &amp; Icebergs</li>
                <li>3. Left/Right Side-Image Splits &amp; 16:9 Horizontal Boards</li>
                <li>4. Hover Over Poster for Instant PNG, Vector SVG &amp; PDF</li>
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
          Turn written articles and raw ideas into realistic vector infographics
        </h2>
        <p className={prose}>
          Embedding a custom vector infographic at the top of a blog post
          increases reader dwell time, earns Pinterest and LinkedIn shares, and
          gives other bloggers a visual asset to embed with an attribution
          backlink to your site.
        </p>

        <div className="mt-8 grid gap-5 md:grid-cols-3">
          {[
            [
              Layers,
              "26 Realistic Vector Templates",
              "Switch between S-curve roadmaps, 3D pyramids, funnels, side-image splits, radial donut gauges, mind-maps, and horizontal 16:9 boards.",
            ],
            [
              Sparkles,
              "1-Click Idea & URL Synthesis",
              "Type a short idea or paste a blog URL—our engine synthesizes benchmark metrics, selects topic-matched icons, and renders immediately.",
            ],
            [
              Code2,
              "Hover PNG, SVG & PDF Export",
              "Hover over the infographic canvas to download a 2x Retina PNG, pure editable SVG, print-ready PDF, or SEO backlink embed snippet.",
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
