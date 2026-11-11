import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowRight,
  BookOpen,
  CheckCircle2,
  GraduationCap,
  Layers,
  Palette,
  ShieldCheck,
  Sparkles,
  Star,
  Terminal,
  Wand2,
} from "lucide-react";
import BlogInfographicStudio from "@/features/blog-infographic-studio/BlogInfographicStudio";
import HeroAnimatedInfographicShowcase from "@/features/blog-infographic-studio/HeroAnimatedInfographicShowcase";
import { BLOG_INFOGRAPHIC_25_TEMPLATES } from "@/lib/blog-infographic-studio/templates";
import ToolFaq from "@/features/tool-ui/ToolFaq";
import ToolResources from "@/features/tool-catalog/ToolResources";
import PortableToolHeroBar from "@/features/portable-tool-kit/PortableToolHeroBar";
import {
  ToolHeroBackground,
  toolHeroHeading,
  toolHeroSurface,
} from "@/features/tool-ui/ToolHero";
import { PlatformBrandIcon } from "@/features/tool-ui/PlatformBrandIcon";

const pageUrl =
  "https://doitwithai.tools/tools/blog-section-infographic-generator";
const title =
  "Free AI Blog Infographic Generator | 25 Editable Layouts";
const description =
  "Create clear blog section infographics from your text with 25 editable layouts, custom brand colors and a logo, then download PNG, SVG, WebP or PDF for free.";
const templateCount = BLOG_INFOGRAPHIC_25_TEMPLATES.length;

export const metadata: Metadata = {
  title,
  description,
  keywords: [
    "free AI blog section infographic generator",
    "AI blog infographic generator",
    "napkin ai alternative free",
    "blog diagram generator",
    "text to infographic generator free",
    "canva blog graphic maker",
    "seo blog visual studio",
    "do it with AI",
  ],
  alternates: { canonical: pageUrl },
  openGraph: {
    title,
    description,
    url: pageUrl,
    siteName: "DoItWithAI.tools",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title,
    description,
  },
};

const faqs = [
  {
    question:
      "What is the Free AI Blog Section Infographic Generator and how does it work?",
    answer:
      "The Free AI Blog Section Infographic Generator converts any H2 blog heading, bullet list, paragraph, or public article URL into a crisp, typo-free visual diagram. Unlike diffusion image generators that paint flat pixels with misspelled words, our engine renders 25 structured HTML5 Canvas and vector SVG templates that you can edit live in your browser.",
  },
  {
    question:
      "How is this 25-template studio different from Napkin.ai, Canva, or Midjourney?",
    answer:
      "Diffusion generators (like Midjourney or DALL-E) frequently garble small text inside flowcharts and cost per-image API credits. Paid diagram tools lock exports behind monthly subscriptions. Our studio runs 100% free in your browser at zero token cost, maps your H2 heading to the ideal layout automatically, and exports crisp PNG, vector SVG, WebP, PDF, and zero-CLS Core Web Vitals HTML.",
  },
  {
    question:
      "Which 25 blog infographic templates are included in the studio?",
    answer:
      "The studio includes 25 purpose-built templates across 6 visual families: Process & Step Flows (4-Step Pipeline, Vertical Roadmap, Growth Flywheel, Zig-Zag Journey, 4-Tier Funnel), Comparison & Versus (Battle Card, 3-Tier Matrix, Before/After Split, Pros & Cons, Do's & Don'ts), Data & KPI Callouts (4-Card Bento KPI, Spotlight Stat, Benchmark Bars, ROI Breakdown, 5-Pillar Scorecard), Frameworks & Pyramids (2x2 Quadrant, 3-Tier Pyramid, 3-Circle Venn, Hub & Spoke), Checklists & Cheat Sheets (8-Point Checklist, 5-Point TL;DR, Page Anatomy, Myth vs Reality, 6-Box Cheat Sheet), and Widescreen Blog Hero & OG Banners.",
  },
  {
    question:
      "Can I add my own logo and brand colors?",
    answer:
      "Yes. Upload a PNG, JPG or WebP logo under 2 MB, adjust its size and choose a plain, white or dark container. Pick a color collection or custom background, panel, accent and text colors. Your brand settings are saved with the infographic and reused in the content writer and exports.",
  },
  {
    question:
      "Does switching between the 25 templates or 4 aspect ratios erase my edited text?",
    answer:
      "Never. Your H2 headline, subheadline, node badges, titles, details, metrics, brand colors, logo, and illustration settings are stored in a unified state. Click any of the 25 live layout previews or switch between 16:9, 1:1, 4:5, and 9:16 to re-render your exact content without replacing your writing.",
  },
  {
    question:
      "Can I extract multiple section infographics directly from a published blog URL?",
    answer:
      "Yes. Paste any public article URL into the top extractor bar. The studio extracts the key sections, auto-recommends the matching infographic template for each heading, and populates multiple visual tabs that you can download individually or together as a single .ZIP archive.",
  },
  {
    question:
      "How do these infographics help with Google Core Web Vitals and SEO?",
    answer:
      "Exports include the selected width and height. The Embed HTML button copies a figure with alt text and a source caption, helping reserve image space before loading. Image dimensions alone do not guarantee Core Web Vitals scores.",
  },
  {
    question:
      "How does this tool connect to the Grand AI Blog, Article & Content Writer Studio?",
    answer:
      "This 25-template engine powers the inline H2 visuals inside our flagship AI Blog Writer, AI Content Writer, and AI Article Writer studios—allowing you to generate a complete 2,000-word SEO article with a custom infographic under every H2 section.",
  },
  {
    question: "Is this blog infographic generator completely free for commercial use?",
    answer:
      "Yes. It is 100% free with zero signup, zero watermark, and full commercial publishing rights across client blogs, SaaS landing pages, LinkedIn carousels, and newsletters.",
  },
  {
    question: "Can I chain this tool inside the Do It AI workspace?",
    answer:
      "Yes. Click 'Use in Do It AI' in the hero bar to open our Do It AI command center, where you can research keywords, draft your article, generate section infographics, and build social distribution posts in one connected workflow.",
  },
];

const USE_CASES = [
  {
    title: "SEO blog posts & pillar guides",
    body: "Place a structured process pipeline, comparison matrix, or KPI bento card under every H2 heading to boost reader dwell time and earn image search impressions.",
  },
  {
    title: "SaaS & B2B product comparisons",
    body: "Use Template #6 (Head-to-Head Versus Card) or Template #7 (3-Tier Feature Matrix) to visually prove why your platform outperforms legacy alternatives.",
  },
  {
    title: "AI automation & SEO agencies",
    body: "Turn client audit scores, ROI savings, and 90-day implementation roadmaps into branded executive graphics with the client's logo and hex palette.",
  },
  {
    title: "LinkedIn & X/Twitter thought leadership",
    body: "Switch any blog diagram to 1:1 Square or 4:5 Portrait to turn long-form H2 sections into high-engagement social feed graphics.",
  },
  {
    title: "Digital PR & original data studies",
    body: "Package survey findings and benchmark bars into downloadable SVG and PNG stat cards that journalists and niche bloggers love to embed and cite.",
  },
  {
    title: "Newsletters, SOPs & documentation",
    body: "Replace walls of instructional text with 8-point checklists, 6-box cheat sheets, and annotated page anatomy diagrams.",
  },
];

const PROMPT_PROMO_CARDS = [
  {
    badge: "77 VISUAL & CHART PROMPTS",
    title: "Infographic, Data Visualization & H2 Diagram Prompt Library",
    desc: "Copy-paste prompt frameworks to turn raw research notes, statistics, and SOPs into structured 4-node and 6-node infographic copy.",
    image: "/prompts/infographic-data-visualization-prompts-hero-v2.webp",
    snippet:
      "Act as an Information Designer. Compress this H2 section into 4 scannable diagram nodes with a 2-word badge, 4-word title, and 1 KPI metric...",
    href: "/prompts/infographic-data-visualization-prompts",
    cta: "Open Visual Prompt Pack",
  },
  {
    badge: "87 REPURPOSING PROMPTS",
    title: "Blog-to-Carousel & Visual Content Repurposing Prompts",
    desc: "Turn every H2 section of your blog post into LinkedIn carousels, Pinterest pins, and executive summary cards.",
    image: "/prompts/content-repurposing-prompts-hero-v2.webp",
    snippet:
      "Convert each H2 heading in [Article] into a standalone visual takeaway card with a before-vs-after transformation hook...",
    href: "/prompts/content-repurposing-prompts",
    cta: "Open Repurposing Prompts",
  },
  {
    badge: "94 AI SEO & AEO PROMPTS",
    title: "AI Search (AEO), E-E-A-T & Visual Entity Optimization Prompts",
    desc: "Optimize image alt text, 50-word AI Overview answer boxes, and structured data so Google and Perplexity cite your visuals.",
    image: "/prompts/ai-search-aeo-geo-prompts-hero-v2.webp",
    snippet:
      "Write a 50-word AEO direct answer and 4 descriptive infographic alt-text strings that naturally include our primary entity...",
    href: "/prompts/ai-search-aeo-geo-prompts",
    cta: "Open AEO & SEO Prompts",
  },
];

const BLOG_GUIDE_CARDS = [
  {
    category: "Content & AEO Playbook · 7 Min Read",
    title: "What to Do After Keyword Research: From Topic Clusters to Visual Proof",
    summary:
      "Why top-ranking articles in 2026 pair 50-word quick answers with deterministic H2 section infographics and comparison tables.",
    image: "/images/articles/what-to-do-after-keyword-research.jpg",
    author: "Sufian Mustafa",
    href: "/ai-seo",
    cta: "Explore AI SEO Playbooks",
  },
  {
    category: "Editorial Strategy Guide · 8 Min Read",
    title: "How to Check Google Keyword Rankings & Upgrade Underperforming H2s",
    summary:
      "Identify pages stuck on Page 2 in Search Console and lift CTR and dwell time by embedding custom section diagrams.",
    image: "/images/articles/check-google-keyword-rankings.jpg",
    author: "Sufian Mustafa",
    href: "/guides",
    cta: "Read Ranking & Visual Guide",
  },
  {
    category: "Visual Tool Reviews · 6 Min Read",
    title: "Best Free AI Tools for Blog Infographics, Diagrams & B2B Visuals",
    summary:
      "How browser-based HTML5 Canvas and vector SVG engines eliminate garbled AI text and cut content production costs to $0.",
    image: "/prompts/linkedin-personal-branding-b2b-prompts-hero-v2.webp",
    author: "Sufian Mustafa",
    href: "/ai-tools",
    cta: "Browse AI Tool Reviews",
  },
];

const COURSE_LEARNING_CARDS = [
  {
    level: "Free Track · 4 Modules",
    title: "Learn & Earn with AI: Ship Visual-First SEO Articles for Clients",
    outcome:
      "Package keyword clusters, humanized articles, and 25-template section infographics into high-ticket content retainers.",
    modules: [
      "Module 1: Mapping H2 search intent to visual families",
      "Module 2: Brand palette & editable visual hierarchy",
      "Module 3: Zero-CLS WebP/SVG publishing & schema",
    ],
    href: "/ai-learn-earn",
    cta: "Start Learn & Earn Track",
  },
  {
    level: "No-Code Builder Track · 5 Modules",
    title: "Vibe-Coding & Customizing Standalone AI Visual Studios",
    outcome:
      "Download portable HTML5 Canvas and React tools from our catalog, customize templates, and embed them on your own domain.",
    modules: [
      "Module 1: Deterministic Canvas & SVG architecture",
      "Module 2: Adding custom brand themes & logos",
      "Module 3: Embedding interactive visual lead magnets",
    ],
    href: "/ai-code",
    cta: "Explore AI Code & Builders",
  },
  {
    level: "Full Platform Walkthrough · Interactive",
    title: "How to Do It With AI: 62-Tool Blog & Visual Production Pipeline",
    outcome:
      "See how our 121+ free SEO, writing, and visual studios connect inside the Do It AI command center.",
    modules: [
      "Step 1: Cluster keywords & validate <580px SERP titles",
      "Step 2: Generate H2 section infographics across 25 layouts",
      "Step 3: Export CWV HTML, JSON-LD @graph & Master .ZIP",
    ],
    href: "/what-our-ai-tool-can-do",
    cta: "See What DoItWithAI Can Do",
  },
];

const RELATED_TOOLS = [
  {
    slug: "ai-blog-writer",
    label: "Free AI Blog Writer Studio",
    why: "Draft complete SEO blog posts with embedded H2 infographics",
  },
  {
    slug: "ai-content-writer",
    label: "Free AI Content Writer Studio",
    why: "Run the full multi-stage SEO & AEO content production pipeline",
  },
  {
    slug: "quote-stat-testimonial-card-studio",
    label: "Free AI Testimonial Card Generator",
    why: "Create customer quote & KPI cards with ring-framed portraits",
  },
  {
    slug: "blog-to-linkedin-carousel",
    label: "LinkedIn PDF Carousel Studio",
    why: "Turn your blog sections into a swipeable 10-slide PDF carousel",
  },
  {
    slug: "data-to-chart-visual-card-maker",
    label: "Data & KPI Chart Maker",
    why: "Build dedicated bar, line, and benchmark chart cards",
  },
  {
    slug: "pinterest-pin-visual-generator",
    label: "Pinterest 1000×1500 Pin Studio",
    why: "Convert blog takeaways into vertical Pinterest traffic pins",
  },
];

const section = "mx-auto max-w-6xl px-4 py-14 sm:px-6";
const prose = "mt-4 text-base leading-8 text-slate-600 dark:text-slate-300";

export default function BlogSectionInfographicGeneratorPage() {
  const schema = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": ["WebApplication", "SoftwareApplication"],
        name: "Free AI Blog Infographic Generator | 25 Editable Layouts",
        alternateName: [
          "Free AI Blog Section Infographic Generator",
          "AI Blog Infographic Studio",
          "Napkin.ai Alternative Blog Diagram Maker",
          "Do It With AI Blog Visual Studio",
        ],
        url: pageUrl,
        description,
        applicationCategory: "DesignApplication",
        operatingSystem: "Any",
        browserRequirements: "Requires JavaScript",
        isAccessibleForFree: true,
        featureList: [
          `${templateCount} editable blog infographic layouts across 6 visual families`,
          "100% live-editable typography, node badges, titles, details, and KPI metrics with zero garbled AI text",
          "Optional editorial illustration with independently editable text and a source footer",
          "Custom brand logo upload with adjustable scale and badge styles plus 8 brand palettes & custom hex wheel",
          "URL-to-Infographic extractor for turning existing articles into multi-section visual packs",
          "Instant 16:9, 1:1, 4:5, and 9:16 exports in HD PNG, Vector SVG, WebP, PDF, CWV <figure> HTML, and .ZIP",
        ],
        offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
      },
      {
        "@type": "HowTo",
        name: "How to Create an Editable Blog Section Infographic in 3 Steps",
        description:
          "Turn any H2 blog heading, paragraph, or URL into a branded, dimensioned section infographic.",
        step: [
          {
            "@type": "HowToStep",
            position: 1,
            name: "Enter your H2 heading, paste section notes, or extract from a URL",
            text: "Type your H2 section headline and nodes (or paste a raw paragraph / article URL to extract nodes automatically). Click 'Auto-Match Template from H2' to map your heading to the ideal layout.",
          },
          {
            "@type": "HowToStep",
            position: 2,
            name: "Customize the layout, brand colors, logo and optional illustration",
            text: "Click any of the 25 live layout previews to switch layouts without losing your text. Upload your brand logo, pick one of 8 palettes or custom hex colors, and choose an optional editorial illustration.",
          },
          {
            "@type": "HowToStep",
            position: 3,
            name: "Export in PNG, Vector SVG, WebP, PDF, or Zero-CLS HTML",
            text: "Download your graphic in 16:9, 1:1, 4:5, or 9:16 as a crisp PNG, scalable SVG, Core Web Vitals WebP, print-ready PDF, or multi-section .ZIP bundle.",
          },
        ],
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { name: "Home", item: "https://doitwithai.tools" },
          { name: "Tools", item: "https://doitwithai.tools/tools" },
          {
            name: "Free AI Blog Section Infographic Generator",
            item: pageUrl,
          },
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
    <div className="min-h-screen bg-white text-slate-900 dark:bg-slate-950 dark:text-white">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(schema).replace(/</g, "\\u003c"),
        }}
      />

      {/* COMPACT UNIFIED HERO: LEFT SEO & CTA COLUMN + RIGHT 5-SLIDE INTERACTIVE SHOWCASE */}
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
            <span aria-current="page">
              Free AI Blog Section Infographic Generator
            </span>
          </nav>

          <div className="grid items-center gap-8 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)]">
            <div>
              <div className="mb-3 inline-flex flex-wrap items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-xs font-bold text-white backdrop-blur-xs">
                <PlatformBrandIcon
                  slugOrText="blog-section-infographic-generator"
                  size={18}
                />
                <span>
                  Free AI Blog Infographic Studio · No Signup · Zero Watermark
                </span>
                <span className="inline-flex items-center gap-0.5 text-amber-300">
                  Editable source included
                </span>
              </div>

              <p className="text-xs font-bold uppercase tracking-widest text-[#b4c3ff]">
                AI BLOG SECTION INFOGRAPHIC GENERATOR · 25 CANVA &amp; NAPKIN
                LAYOUTS · SVG &amp; WEBP
              </p>

              <h1 className="mt-3 text-3xl font-black leading-tight sm:text-4xl lg:text-5xl">
                Free AI Blog Section Infographic Generator:{" "}
                <span className={toolHeroHeading}>
                  25 Editable Infographic Layouts
                </span>
              </h1>

              <p className="mt-4 max-w-2xl text-base leading-relaxed text-slate-200">
                Turn any blog H2 heading, paragraph, bullet list, or article URL
                into a crisp, 100% editable section diagram. Choose from{" "}
                {templateCount} deterministic layouts (pipelines, versus cards,
                KPI bento grids, pyramids &amp; checklists), add your brand logo
                and optional editorial artwork, then export PNG, vector
                SVG, WebP, or PDF at $0 API cost.
              </p>

              <PortableToolHeroBar
                slug="blog-section-infographic-generator"
                title="Free AI Blog Section Infographic Generator"
                path="/tools/blog-section-infographic-generator"
                primaryLabel="Use Tool Now: Create Blog Infographic"
                workspaceId="tool-studio-workspace"
              />
            </div>

            <div>
              <HeroAnimatedInfographicShowcase />
            </div>
          </div>
        </div>
      </header>

      {/* INTERACTIVE 25-TEMPLATE STUDIO WORKSPACE */}
      <BlogInfographicStudio mode="standalone" />

      {/* 50-WORD QUICK ANSWER BOX FOR GOOGLE AI OVERVIEWS & AEO */}
      <section className={section}>
        <div className="rounded-3xl border border-slate-200 bg-slate-50/80 p-7 dark:border-slate-800 dark:bg-slate-900/80">
          <p className="text-xs font-bold uppercase tracking-widest text-[#3452d1] dark:text-blue-300">
            Quick Answer · Free AI Blog Section Infographic Generator
          </p>
          <h2 className="mt-2 text-2xl font-black sm:text-3xl">
            How do you create a clear blog section infographic that helps
            converts?
          </h2>
          <p className={prose}>
            To create a high-retention blog section infographic, convert each{" "}
            <strong>H2 heading into 3–6 structured visual nodes</strong> paired
            with <strong>quantified KPI badges</strong>, match the section
            intent to a{" "}
            <strong>
              process pipeline, versus card, bento grid, or pyramid layout
            </strong>
            , apply your <strong>brand logo and hex palette</strong>, and embed{" "}
            <strong>zero-CLS WebP or vector SVG markup</strong> with descriptive
            alt text.
          </p>
        </div>
      </section>

      {/* HOW IT WORKS (3-STEP VISUAL WORKFLOW) */}
      <section
        className={`${section} border-t border-slate-200 dark:border-slate-800`}
      >
        <div className="text-center">
          <p className="text-xs font-extrabold uppercase tracking-widest text-[#3452d1] dark:text-blue-300">
            Simple 3-Step AI Visual Workflow
          </p>
          <h2 className="mt-2 text-3xl font-black sm:text-4xl">
            How does the Free AI Blog Section Infographic Generator work?
          </h2>
          <p className="mx-auto mt-3 max-w-2xl text-sm text-slate-600 dark:text-slate-300">
            Go from a raw H2 heading, paragraph, or published blog URL to a
            publish-ready diagram in under 30 seconds.
          </p>
        </div>
        <div className="mt-10 grid gap-6 md:grid-cols-3">
          {[
            {
              num: "1",
              title: "Enter H2 heading, paste text, or extract URL",
              body: "Type your H2 headline and nodes, paste a raw paragraph to auto-split into diagram cards, or extract multiple H2 sections directly from any public article URL.",
            },
            {
              num: "2",
              title: "Choose your logo, illustration & colors",
              body: "Upload your company logo, pick from 8 curated brand palettes or custom hex colors, and choose an optional editorial illustration.",
            },
            {
              num: "3",
              title: "Switch across 25 live layouts & export HD",
              body: "Click any of the 25 live layout previews to test different visual families without losing your text. Export as PNG, vector SVG, WebP, PDF, CWV HTML, or a multi-section .ZIP.",
            },
          ].map((step) => (
            <div
              key={step.num}
              className="rounded-3xl border border-slate-200 bg-white p-6 shadow-xs dark:border-slate-800 dark:bg-slate-900/80"
            >
              <div className="flex items-center gap-3">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#3452d1] to-[#5271ff] text-sm font-black text-white shadow">
                  {step.num}
                </span>
                <h3 className="text-lg font-black">{step.title}</h3>
              </div>
              <p className="mt-3 text-sm leading-7 text-slate-600 dark:text-slate-300">
                {step.body}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* ALL 25 TEMPLATES OVERVIEW WITH FAMILY BADGES */}
      <section
        className={`${section} border-t border-slate-200 dark:border-slate-800`}
      >
        <div className="text-center">
          <p className="text-xs font-extrabold uppercase tracking-widest text-[#3452d1] dark:text-blue-300">
            {templateCount} Built-In Canva &amp; Napkin.ai-Style Blog Layouts
          </p>
          <h2 className="mt-2 text-3xl font-black sm:text-4xl">
            Every blog infographic template engineered for clear reading paths
          </h2>
          <p className="mx-auto mt-3 max-w-2xl text-sm text-slate-600 dark:text-slate-300">
            All 25 templates adapt across 16:9 Blog/OG, 1:1 Square, 4:5
            LinkedIn, and 9:16 Story/Pin dimensions with crisp, editable
            typography.
          </p>
        </div>
        <ul className="mt-8 grid gap-3.5 sm:grid-cols-2 lg:grid-cols-3">
          {BLOG_INFOGRAPHIC_25_TEMPLATES.map((t) => (
            <li
              key={t.id}
              className="flex flex-col justify-between rounded-2xl border border-slate-200 bg-slate-50/70 p-4 transition hover:border-[#3452d1]/50 dark:border-slate-800 dark:bg-slate-900"
            >
              <div>
                <div className="flex items-center justify-between gap-2">
                  <h3 className="text-sm font-black text-slate-900 dark:text-white">
                    #{t.id}. {t.name}
                  </h3>
                  <span className="shrink-0 rounded-full bg-[#3452d1]/10 px-2.5 py-0.5 text-[10px] font-extrabold text-[#3452d1] dark:bg-blue-500/20 dark:text-blue-300">
                    {t.family}
                  </span>
                </div>
                <p className="mt-1.5 text-xs leading-6 text-slate-600 dark:text-slate-300">
                  <strong>Best for:</strong> {t.bestForSectionType} ·{" "}
                  <span className="text-slate-500 dark:text-slate-400">
                    {t.editableFields}
                  </span>
                </p>
              </div>
              <a
                href="#tool-studio-workspace"
                className="mt-3 inline-flex items-center gap-1 text-[11px] font-extrabold text-[#3452d1] hover:underline dark:text-blue-300"
              >
                Preview in live studio above ↑
              </a>
            </li>
          ))}
        </ul>
      </section>

      {/* 6 INDUSTRY USE CASES */}
      <section
        className={`${section} border-t border-slate-200 dark:border-slate-800`}
      >
        <div className="text-center">
          <p className="text-xs font-extrabold uppercase tracking-widest text-[#3452d1] dark:text-blue-300">
            Built for Visual SEO &amp; High Dwell Time
          </p>
          <h2 className="mt-2 text-3xl font-black sm:text-4xl">
            Who uses our Free AI Blog Section Infographic Generator?
          </h2>
        </div>
        <div className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {USE_CASES.map((u) => (
            <div
              key={u.title}
              className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900/80"
            >
              <h3 className="text-base font-black">{u.title}</h3>
              <p className="mt-1.5 text-sm leading-7 text-slate-600 dark:text-slate-300">
                {u.body}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* 3 DIFFERENTIATOR CARDS + COMPETITOR COMPARISON TABLE */}
      <section
        className={`${section} border-t border-slate-200 dark:border-slate-800`}
      >
        <div className="text-center">
          <p className="text-xs font-extrabold uppercase tracking-widest text-[#3452d1] dark:text-blue-300">
            Industrial-Grade Blog Visual Engine
          </p>
          <h2 className="mt-2 text-3xl font-black sm:text-4xl">
            A visual workflow built around your content
          </h2>
        </div>

        <div className="mt-10 grid gap-6 md:grid-cols-3">
          <div className="rounded-3xl border border-slate-200 bg-slate-50/70 p-6 dark:border-slate-800 dark:bg-slate-900">
            <Layers className="text-[#3452d1]" size={26} />
            <h3 className="mt-4 text-xl font-black">
              Editable wording, figures and sources
            </h3>
            <p className="mt-2 text-sm leading-7 text-slate-600 dark:text-slate-300">
              Combine reusable editorial artwork with editable text, measured
              spacing and a source footer. Preview changes before you download
              a graphic, without asking an image model to redraw your words.
            </p>
          </div>
          <div className="rounded-3xl border border-slate-200 bg-slate-50/70 p-6 dark:border-slate-800 dark:bg-slate-900">
            <Palette className="text-[#EA580C]" size={26} />
            <h3 className="mt-4 text-xl font-black">
              Your logo, colors &amp; editorial artwork
            </h3>
            <p className="mt-2 text-sm leading-7 text-slate-600 dark:text-slate-300">
              Upload your brand logo, apply custom hex colors across all 25
              layouts, and add a reusable illustration while keeping every
              label, explanation and figure editable.
            </p>
          </div>
          <div className="rounded-3xl border border-slate-200 bg-slate-50/70 p-6 dark:border-slate-800 dark:bg-slate-900">
            <Sparkles className="text-emerald-500" size={26} />
            <h3 className="mt-4 text-xl font-black">
              PNG, SVG, WebP &amp; dimensioned embed HTML
            </h3>
            <p className="mt-2 text-sm leading-7 text-slate-600 dark:text-slate-300">
              Export lightweight vector SVGs, compressed WebPs, or copy ready-to-paste{" "}
              <code>&lt;figure&gt;</code> HTML with explicit width and height
              attributes that reserve space while the image loads.
            </p>
          </div>
        </div>

        <div className="mt-10 overflow-x-auto rounded-3xl border border-slate-200 dark:border-slate-800">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-100 text-xs font-extrabold uppercase text-slate-700 dark:bg-slate-950 dark:text-slate-200">
              <tr>
                <th className="px-4 py-3.5">Capability</th>
                <th className="px-4 py-3.5 text-[#3452d1] dark:text-blue-300">
                  DoItWithAI 25-Template Infographic Studio
                </th>
                <th className="px-4 py-3.5">Paid Diagram SaaS (Napkin / Venngage)</th>
                <th className="px-4 py-3.5">Raw AI Diffusion Image Prompts</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 bg-white dark:divide-slate-800 dark:bg-slate-900">
              <tr>
                <td className="px-4 py-3.5 font-bold">
                  Blog-Specific Infographic Templates
                </td>
                <td className="px-4 py-3.5 font-semibold text-emerald-600 dark:text-emerald-400">
                  25 Layouts across 6 Families (Pipelines, Versus, Bento KPI,
                  Pyramids, Checklists, Hero OG)
                </td>
                <td className="px-4 py-3.5">Limited on free tier</td>
                <td className="px-4 py-3.5">Unstructured random art</td>
              </tr>
              <tr>
                <td className="px-4 py-3.5 font-bold">
                  Typography &amp; Live Node Editing
                </td>
                <td className="px-4 py-3.5 font-semibold text-emerald-600 dark:text-emerald-400">
                  100% Editable Badges, Titles, Details &amp; Metrics (Zero
                  Typos)
                </td>
                <td className="px-4 py-3.5">Editable (requires account login)</td>
                <td className="px-4 py-3.5">Frequent misspelled / garbled text</td>
              </tr>
              <tr>
                <td className="px-4 py-3.5 font-bold">
                  Author Ring Framing &amp; Brand Logo Upload
                </td>
                <td className="px-4 py-3.5 font-semibold text-emerald-600 dark:text-emerald-400">
                  Auto Background Cutout + Ring/Arch Sliders + Custom Logo Pill
                </td>
                <td className="px-4 py-3.5">Paid Brand Kit tier only</td>
                <td className="px-4 py-3.5">Not supported</td>
              </tr>
              <tr>
                <td className="px-4 py-3.5 font-bold">
                  Export Formats &amp; Pricing
                </td>
                <td className="px-4 py-3.5 font-semibold text-emerald-600 dark:text-emerald-400">
                  100% Free · PNG, Vector SVG, WebP, PDF, CWV HTML &amp; .ZIP
                </td>
                <td className="px-4 py-3.5">$18–$49/mo subscription</td>
                <td className="px-4 py-3.5">Per-image credit cost + flat raster</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      {/* DO IT WITH AI (/do-it-ai) NATURAL WORKFLOW INTEGRATION */}
      <section
        className={`${section} border-t border-slate-200 dark:border-slate-800`}
      >
        <div className="rounded-3xl border-2 border-[#3452d1]/30 bg-gradient-to-br from-[#0B1325] via-[#111C35] to-[#19284C] p-7 text-white shadow-2xl sm:p-10">
          <div className="grid items-center gap-8 lg:grid-cols-12">
            <div className="lg:col-span-8">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-500/20 px-3.5 py-1 text-xs font-extrabold uppercase tracking-wider text-blue-300 ring-1 ring-blue-400/30">
                <Sparkles size={13} /> Do It With AI · Unified Multi-Tool
                Command Center
              </span>
              <h2 className="mt-3 text-2xl font-black sm:text-3xl">
                Want to generate the full SEO blog post AND all H2 infographics
                automatically? Just Do It With AI.
              </h2>
              <p className="mt-3 text-sm leading-7 text-slate-200 sm:text-base">
                Instead of jumping between separate tabs for keyword clustering,
                article drafting, diagram design, and schema validation, you can{" "}
                <strong>do it with AI</strong> inside our{" "}
                <Link
                  href="/do-it-ai?tool=blog-section-infographic-generator"
                  className="font-bold text-blue-300 underline hover:text-white"
                >
                  Do It AI Workspace
                </Link>
                . Chain our{" "}
                <Link
                  href="/tools/ai-blog-writer"
                  className="font-bold text-blue-300 underline hover:text-white"
                >
                  Free AI Blog Writer
                </Link>
                ,{" "}
                <Link
                  href="/tools/ai-content-writer"
                  className="font-bold text-blue-300 underline hover:text-white"
                >
                  AI Content Writer Studio
                </Link>
                , and this 25-Template Blog Infographic Studio in one seamless
                pipeline.
              </p>
              <div className="mt-5 flex flex-wrap gap-3 text-xs font-bold text-slate-200">
                <span className="inline-flex items-center gap-1.5 rounded-xl bg-white/10 px-3 py-1.5">
                  <CheckCircle2 size={14} className="text-emerald-400" /> 121+
                  Connected AI SEO &amp; Visual Tools
                </span>
                <span className="inline-flex items-center gap-1.5 rounded-xl bg-white/10 px-3 py-1.5">
                  <CheckCircle2 size={14} className="text-emerald-400" /> 25
                  Editable HTML5 &amp; SVG Diagram Layouts
                </span>
                <span className="inline-flex items-center gap-1.5 rounded-xl bg-white/10 px-3 py-1.5">
                  <CheckCircle2 size={14} className="text-emerald-400" /> Zero
                  Signup · Instant Browser Execution
                </span>
              </div>
            </div>
            <div className="flex flex-col gap-3 rounded-2xl border border-white/15 bg-slate-950/60 p-5 lg:col-span-4">
              <p className="text-xs font-extrabold uppercase tracking-wider text-blue-300">
                Launch Connected Workflows
              </p>
              <Link
                href="/do-it-ai?tool=blog-section-infographic-generator"
                className="inline-flex items-center justify-between rounded-xl bg-gradient-to-r from-[#3452d1] to-[#5271ff] px-4 py-3 text-xs font-black text-white shadow-lg transition hover:brightness-110"
              >
                <span>Open in Do It AI Workspace</span>
                <ArrowRight size={15} />
              </Link>
              {RELATED_TOOLS.slice(0, 2).map((r) => (
                <Link
                  key={r.slug}
                  href={`/tools/${r.slug}`}
                  className="inline-flex items-center justify-between rounded-xl border border-white/15 bg-white/5 px-4 py-2.5 text-xs font-bold text-slate-200 transition hover:bg-white/10"
                >
                  <span>{r.label}</span>
                  <ArrowRight size={14} />
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* RELATED TOOLS */}
      <section
        className={`${section} border-t border-slate-200 dark:border-slate-800`}
      >
        <h2 className="text-2xl font-black sm:text-3xl">
          Related free AI tools for blog writing &amp; visual distribution
        </h2>
        <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {RELATED_TOOLS.map((r) => (
            <Link
              key={r.slug}
              href={`/tools/${r.slug}`}
              className="group rounded-2xl border border-slate-200 bg-white p-4 transition hover:border-[#3452d1] dark:border-slate-800 dark:bg-slate-900"
            >
              <span className="flex items-center justify-between text-sm font-black">
                {r.label}
                <ArrowRight
                  size={14}
                  className="text-[#3452d1] transition group-hover:translate-x-0.5"
                />
              </span>
              <span className="mt-1 block text-xs text-slate-600 dark:text-slate-300">
                {r.why}
              </span>
            </Link>
          ))}
        </div>
      </section>

      {/* PROMOTIONAL CARDS 1: READY-MADE AI PROMPT PACKS */}
      <section
        className={`${section} border-t border-slate-200 dark:border-slate-800`}
      >
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-purple-500/10 px-3 py-1 text-xs font-extrabold uppercase tracking-wider text-purple-600 dark:text-purple-300">
              <Terminal size={13} /> Ready-Made Prompt Libraries
            </span>
            <h2 className="mt-2 text-2xl font-black sm:text-3xl">
              Copy-paste AI prompt packs for infographics, repurposing &amp; AEO
            </h2>
          </div>
          <Link
            href="/prompts"
            className="inline-flex items-center gap-1 text-xs font-extrabold text-[#3452d1] underline dark:text-blue-300"
          >
            Browse all 952+ prompts <ArrowRight size={14} />
          </Link>
        </div>
        <div className="mt-7 grid gap-6 md:grid-cols-3">
          {PROMPT_PROMO_CARDS.map((card) => (
            <article
              key={card.href}
              className="flex flex-col justify-between overflow-hidden rounded-3xl border-2 border-purple-500/25 bg-slate-950 text-white shadow-xl transition hover:border-purple-400/60"
            >
              <div>
                <div className="relative h-40 w-full overflow-hidden bg-slate-900">
                  <img
                    src={card.image}
                    alt={card.title}
                    loading="lazy"
                    className="h-full w-full object-cover opacity-85"
                  />
                  <span className="absolute left-3 top-3 rounded-full bg-purple-600/95 px-3 py-1 text-[10px] font-black uppercase tracking-wider text-white shadow">
                    {card.badge}
                  </span>
                </div>
                <div className="p-5">
                  <h3 className="text-base font-black leading-snug">
                    {card.title}
                  </h3>
                  <p className="mt-2 text-xs leading-6 text-slate-300">
                    {card.desc}
                  </p>
                  <pre className="mt-3 overflow-x-auto whitespace-pre-wrap rounded-xl border border-purple-500/30 bg-slate-900/90 p-3 font-mono text-[11px] leading-5 text-purple-200">
                    {card.snippet}
                  </pre>
                </div>
              </div>
              <div className="border-t border-slate-800 px-5 py-3.5">
                <Link
                  href={card.href}
                  className="inline-flex w-full items-center justify-between text-xs font-black text-purple-300 hover:text-white"
                >
                  <span>{card.cta}</span>
                  <ArrowRight size={14} />
                </Link>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* PROMOTIONAL CARDS 2: EDITORIAL BLOG & STRATEGY GUIDES */}
      <section
        className={`${section} border-t border-slate-200 dark:border-slate-800`}
      >
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-500/10 px-3 py-1 text-xs font-extrabold uppercase tracking-wider text-[#3452d1] dark:text-blue-300">
              <BookOpen size={13} /> Editorial Playbooks &amp; Guides
            </span>
            <h2 className="mt-2 text-2xl font-black sm:text-3xl">
              Deep-dive SEO, AEO &amp; visual content architecture guides
            </h2>
          </div>
          <Link
            href="/guides"
            className="inline-flex items-center gap-1 text-xs font-extrabold text-[#3452d1] underline dark:text-blue-300"
          >
            View all editorial guides <ArrowRight size={14} />
          </Link>
        </div>
        <div className="mt-7 grid gap-6 md:grid-cols-3">
          {BLOG_GUIDE_CARDS.map((post) => (
            <article
              key={post.title}
              className="flex flex-col justify-between overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm transition hover:shadow-lg dark:border-slate-800 dark:bg-slate-900"
            >
              <div>
                <div className="h-44 w-full overflow-hidden bg-slate-100 dark:bg-slate-800">
                  <img
                    src={post.image}
                    alt={post.title}
                    loading="lazy"
                    className="h-full w-full object-cover"
                  />
                </div>
                <div className="p-6">
                  <span className="text-[11px] font-extrabold uppercase tracking-wider text-[#3452d1] dark:text-blue-300">
                    {post.category}
                  </span>
                  <h3 className="mt-2 text-lg font-black leading-snug">
                    {post.title}
                  </h3>
                  <p className="mt-2.5 text-xs leading-6 text-slate-600 dark:text-slate-300">
                    {post.summary}
                  </p>
                </div>
              </div>
              <div className="flex items-center justify-between border-t border-slate-100 px-6 py-4 text-xs dark:border-slate-800">
                <span className="font-semibold text-slate-500 dark:text-slate-400">
                  By {post.author}
                </span>
                <Link
                  href={post.href}
                  className="inline-flex items-center gap-1 font-extrabold text-[#3452d1] hover:underline dark:text-blue-300"
                >
                  <span>{post.cta}</span>
                  <ArrowRight size={13} />
                </Link>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* PROMOTIONAL CARDS 3: FREE AI COURSES & LEARN-AND-EARN TRACKS */}
      <section
        className={`${section} border-t border-slate-200 dark:border-slate-800`}
      >
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-extrabold uppercase tracking-wider text-emerald-600 dark:text-emerald-300">
              <GraduationCap size={14} /> Free AI Courses &amp; Learn-and-Earn
              Tracks
            </span>
            <h2 className="mt-2 text-2xl font-black sm:text-3xl">
              Build, customize &amp; monetize AI visual workflows step by step
            </h2>
          </div>
          <Link
            href="/ai-learn-earn"
            className="inline-flex items-center gap-1 text-xs font-extrabold text-emerald-600 underline dark:text-emerald-300"
          >
            Explore all learning tracks <ArrowRight size={14} />
          </Link>
        </div>
        <div className="mt-7 grid gap-6 md:grid-cols-3">
          {COURSE_LEARNING_CARDS.map((course) => (
            <article
              key={course.title}
              className="flex flex-col justify-between rounded-3xl border-2 border-emerald-500/25 bg-emerald-50/40 p-6 dark:border-emerald-500/30 dark:bg-emerald-950/15"
            >
              <div>
                <div className="flex items-center justify-between gap-2">
                  <span className="rounded-full bg-emerald-600 px-3 py-1 text-[10px] font-black uppercase tracking-wider text-white">
                    {course.level}
                  </span>
                  <Wand2
                    size={16}
                    className="text-emerald-600 dark:text-emerald-400"
                  />
                </div>
                <h3 className="mt-3.5 text-lg font-black leading-snug">
                  {course.title}
                </h3>
                <p className="mt-2 text-xs leading-6 text-slate-600 dark:text-slate-300">
                  {course.outcome}
                </p>
                <ul className="mt-4 space-y-2 rounded-2xl border border-emerald-500/20 bg-white/80 p-3.5 text-xs font-semibold text-slate-700 dark:bg-slate-900/80 dark:text-slate-200">
                  {course.modules.map((m) => (
                    <li key={m} className="flex items-start gap-2">
                      <ShieldCheck
                        size={14}
                        className="mt-0.5 shrink-0 text-emerald-500"
                      />
                      <span>{m}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="mt-5 pt-2">
                <Link
                  href={course.href}
                  className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-xs font-black text-white shadow transition hover:bg-emerald-500"
                >
                  <span>{course.cta}</span>
                  <ArrowRight size={14} />
                </Link>
              </div>
            </article>
          ))}
        </div>
      </section>

      <ToolResources slug="blog-section-infographic-generator" />
      <ToolFaq
        title="Free AI Blog Section Infographic Generator FAQs"
        faqs={faqs}
      />
    </div>
  );
}
