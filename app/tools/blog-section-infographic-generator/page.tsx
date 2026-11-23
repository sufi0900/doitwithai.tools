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
import { TEMPLATE_CURATED_SHOWCASE_DATA } from "@/lib/blog-infographic-studio/infographic-presets-and-icons";
import { BLOG_INFOGRAPHIC_25_TEMPLATES } from "@/lib/founder-hub/grand-blog-writer-blueprint";
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
  "Free AI Blog Section Infographic Generator: 25 Venngage, Canva & Napkin Layouts";
const description =
  "Turn any blog H2 heading, paragraph, or article URL into a realistic Venngage, Canva, or Napkin.ai-style section infographic with our free AI blog section infographic generator—combining high-resolution AI art plates, 20 vector icon medallions, 25 data-driven layouts, and instant PNG, vector SVG, WebP, or PDF export.";
const templateCount = BLOG_INFOGRAPHIC_25_TEMPLATES.length;

export const metadata: Metadata = {
  title,
  description,
  keywords: [
    "free AI blog section infographic generator",
    "AI blog infographic generator",
    "venngage infographic generator alternative",
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
      "The Free AI Blog Section Infographic Generator converts any H2 blog heading, bullet list, paragraph, or public article URL into a realistic, typo-free visual infographic. Our Hybrid Composite Engine combines high-resolution AI-generated 3D art plates (glassmorphic orbs, isometric tech grids, editorial warm paper, and emerald data waves) with 25 structured HTML5 Canvas and vector SVG diagram layouts.",
  },
  {
    question:
      "How is this 25-template studio different from Venngage, Napkin.ai, Canva, or Midjourney?",
    answer:
      "Raw diffusion image generators (like Midjourney or DALL-E) frequently garble small text inside charts and cost per-image API credits. Paid infographic tools lock high-res exports behind $19–$49/month subscriptions. Our studio blends photographic AI art plates with 100% live-editable vector typography, charts, gears, timelines, and chevrons—running free in your browser with PNG, vector SVG, WebP, PDF, and zero-CLS Core Web Vitals HTML exports.",
  },
  {
    question:
      "Which 25 blog infographic templates are included in the studio?",
    answer:
      "The studio includes 25 purpose-built Venngage and Canva-grade templates across 6 visual families: Process & Step Flows (Interlocking Chevron Pipeline, Alternating Milestone Timeline, 12-Tooth Mechanical Growth Gears, Winding S-Curve Road, 3D Tapered Funnel), Comparison & Versus (Central-Spine Battle Card, 3-Tier SaaS Matrix, Before/After Split, Pros & Cons, Do's & Don'ts), Data & KPI Callouts (Glassmorphic KPI Orbs, 2x2 Stat Cards + Vertical Multi-Bar Chart, Horizontal Benchmark Bars, Cost vs. ROI Waterfall, 3-Ring Radial Audit Gauge), Frameworks & Pyramids (2x2 Priority Quadrant, 3D Layered Pyramid, 3-Circle Venn Diagram, Hub & Spoke Circuit), Checklists & Cheat Sheets (8-Point Checklist, Executive TL;DR Board, Annotated Page Wireframe, Myth vs Reality, 6-Box Cheat Sheet), and Widescreen Blog Hero Posters.",
  },
  {
    question:
      "Can I upload my company logo, customize icons, and switch AI art plate backdrops?",
    answer:
      "Yes. Upload your PNG, SVG, JPG, or WEBP brand logo and adjust its scale and badge container (Auto, Brand Pill, White Box, Dark Box, or Plain). You can also switch between AI Art Plate backdrops, 3D Glow Orbs, or Clean Vector Studio mode, upload your own custom background art plate, and assign 20 geometric vector icons (Rocket, Trophy, Chart, Gear, Shield, Target, CPU, etc.) to each individual infographic node.",
  },
  {
    question:
      "Does switching between the 25 templates or 4 aspect ratios erase my edited text?",
    answer:
      "Never. Your H2 headline, subheadline, node badges, titles, details, KPI metrics, vector icons, brand colors, and logo settings are stored in a unified state. Click 'Use Layout' on any of the 25 live miniature canvas previews to re-render your exact text in that layout, or click 'Load Sample' to try that template's curated showcase data.",
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
      "Every visual exports with explicit width and height dimensions (zero Cumulative Layout Shift, 0.000 CLS), next-gen WebP and vector SVG formats for sub-second Largest Contentful Paint (LCP), and a 1-click 'CWV HTML' button that copies semantic <figure> and <figcaption> markup with SEO alt text.",
  },
  {
    question:
      "How does this tool connect to the Grand AI Blog, Article & Content Writer Studio?",
    answer:
      "This 25-template hybrid engine powers the inline H2 visuals inside our flagship AI Content Writer (/ai-content-writer) and AI Blog Writer studios—allowing you to generate a complete 2,000-word SEO article with a custom infographic under every H2 section.",
  },
  {
    question: "Is this blog infographic generator completely free for commercial use?",
    answer:
      "Yes. It is 100% free with zero signup, zero mandatory watermark, and full commercial publishing rights across client blogs, SaaS landing pages, LinkedIn carousels, and newsletters.",
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
    body: "Place an interlocking chevron pipeline, comparison matrix, or KPI orb board under every H2 heading to boost reader dwell time and earn Google Image Search impressions.",
  },
  {
    title: "SaaS & B2B product comparisons",
    body: "Use Template #6 (Central-Spine Versus Battle Card) or Template #7 (3-Tier SaaS Feature Matrix) to visually prove why your platform outperforms legacy alternatives.",
  },
  {
    title: "AI automation & SEO agencies",
    body: "Turn client audit scores, ROI savings, and 90-day implementation roadmaps into branded executive infographics with the client's logo, hex palette, and vector icon medallions.",
  },
  {
    title: "LinkedIn & X/Twitter thought leadership",
    body: "Switch any blog diagram to 1:1 Square or 4:5 Portrait to turn long-form H2 sections into high-engagement social feed infographics.",
  },
  {
    title: "Digital PR & original data studies",
    body: "Package survey findings, multi-bar charts, and benchmark bars into downloadable SVG and PNG stat posters that journalists and niche bloggers love to embed and cite.",
  },
  {
    title: "Newsletters, SOPs & documentation",
    body: "Replace walls of instructional text with 8-point checklists, 6-box cheat sheets, and annotated page wireframe teardowns.",
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
      "Module 2: Brand palette, AI art plates & vector icon medallions",
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
      "Module 1: Hybrid AI Art Plate + Canvas/SVG architecture",
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
    href: "/tools/ai-blog-writer",
    label: "Free AI Blog Writer Studio",
    why: "Draft complete SEO blog posts with embedded H2 infographics",
  },
  {
    slug: "ai-content-writer",
    href: "/ai-content-writer",
    label: "Flagship AI Content Writer Studio",
    why: "Run the full 6-stage SEO, AEO & inline infographic production pipeline",
  },
  {
    slug: "quote-stat-testimonial-card-studio",
    href: "/tools/quote-stat-testimonial-card-studio",
    label: "Free AI Testimonial Card Generator",
    why: "Create customer quote & KPI cards with ring-framed portraits",
  },
  {
    slug: "blog-to-linkedin-carousel",
    href: "/tools/blog-to-linkedin-carousel",
    label: "LinkedIn PDF Carousel Studio",
    why: "Turn your blog sections into a swipeable 10-slide PDF carousel",
  },
  {
    slug: "data-to-chart-visual-card-maker",
    href: "/tools/data-to-chart-visual-card-maker",
    label: "Data & KPI Chart Maker",
    why: "Build dedicated bar, line, and benchmark chart cards",
  },
  {
    slug: "pinterest-pin-visual-generator",
    href: "/tools/pinterest-pin-visual-generator",
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
        name: "Free AI Blog Section Infographic Generator: 25 Venngage, Canva & Napkin Layouts",
        alternateName: [
          "Free AI Blog Section Infographic Generator",
          "AI Blog Infographic Studio",
          "Venngage & Napkin.ai Alternative Blog Diagram Maker",
          "Do It With AI Blog Visual Studio",
        ],
        url: pageUrl,
        description,
        applicationCategory: "DesignApplication",
        operatingSystem: "Any",
        browserRequirements: "Requires JavaScript",
        isAccessibleForFree: true,
        featureList: [
          `${templateCount} realistic Venngage, Canva & Napkin.ai-style blog infographic templates across 6 visual families`,
          "Hybrid 3D AI Art Plate Backdrops (Obsidian Glass Orbs, Royal Indigo Isometric, Editorial Warm Paper, Emerald Data Waves)",
          "20 geometric vector icon medallions with per-node icon picker and 100% live-editable typography (zero garbled AI text)",
          "Custom brand logo upload with adjustable scale and badge styles plus 8 light & dark brand palettes and custom hex wheel",
          "URL-to-Infographic extractor for turning existing articles into multi-section visual packs",
          "Instant 16:9, 1:1, 4:5, and 9:16 exports in HD PNG, Vector SVG, WebP, PDF, CWV <figure> HTML, and .ZIP",
        ],
        offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
      },
      {
        "@type": "HowTo",
        name: "How to Create a Realistic Blog Section Infographic in 3 Steps",
        description:
          "Turn any H2 blog heading, paragraph, or URL into a branded, zero-CLS section infographic.",
        step: [
          {
            "@type": "HowToStep",
            position: 1,
            name: "Load a preset, paste section notes, or extract from a URL",
            text: "Type your H2 section headline and nodes (or paste a raw paragraph / article URL to extract nodes automatically). Click 'Auto-Match Layout from H2' to map your heading to the ideal infographic geometry.",
          },
          {
            "@type": "HowToStep",
            position: 2,
            name: "Customize AI art plates, vector icons, brand palette, and logo",
            text: "Choose between AI Art Plate backdrops, 3D Glow Orbs, or Clean Vector mode. Assign 20 geometric vector icons to each node, upload your company logo, and pick from 8 light & dark brand palettes.",
          },
          {
            "@type": "HowToStep",
            position: 3,
            name: "Preview across 25 live layouts and export in PNG, SVG, WebP, or PDF",
            text: "Click 'Use Layout' or 'Load Sample' on any of the 25 live miniature infographic previews. Download in 16:9, 1:1, 4:5, or 9:16 as a crisp PNG, scalable SVG, Core Web Vitals WebP, print-ready PDF, or multi-section .ZIP bundle.",
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

      {/* COMPACT UNIFIED HERO: LEFT SEO & CTA COLUMN + RIGHT 5-SLIDE LIVE COMPOSITE INFOGRAPHIC SHOWCASE */}
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

          <div className="grid items-center gap-8 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1.05fr)]">
            <div>
              <div className="mb-3 inline-flex flex-wrap items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-xs font-bold text-white backdrop-blur-xs">
                <PlatformBrandIcon
                  slugOrText="blog-section-infographic-generator"
                  size={18}
                />
                <span>
                  Hybrid AI Art Plates + 25 Vector Infographic Layouts · Zero Watermark
                </span>
                <span className="inline-flex items-center gap-0.5 text-amber-300">
                  <Star size={12} fill="currentColor" /> 4.9/5
                </span>
              </div>

              <p className="text-xs font-bold uppercase tracking-widest text-[#b4c3ff]">
                AI BLOG SECTION INFOGRAPHIC GENERATOR · 25 VENNGAGE, CANVA &amp;
                NAPKIN LAYOUTS
              </p>

              <h1 className="mt-3 text-3xl font-black leading-tight sm:text-4xl lg:text-5xl">
                Free AI Blog Section Infographic Generator:{" "}
                <span className={toolHeroHeading}>
                  25 Realistic Data, Timeline &amp; Comparison Templates
                </span>
              </h1>

              <p className="mt-4 max-w-2xl text-base leading-relaxed text-slate-200">
                Turn any blog H2 heading, paragraph, bullet list, or article URL
                into a realistic, 100% editable infographic. Our{" "}
                <strong>Hybrid Composite Engine</strong> blends high-resolution{" "}
                <strong>AI 3D Art Plates</strong> with{" "}
                <strong>
                  {templateCount} Venngage &amp; Canva-grade geometries
                </strong>{" "}
                (interlocking chevrons, milestone timelines, mechanical growth
                gears, VS battle cards, KPI glass orbs &amp; multi-bar charts),{" "}
                <strong>20 vector icon medallions</strong>, and your{" "}
                <strong>brand logo</strong>—exporting HD PNG, vector SVG, WebP,
                or PDF at $0 cost.
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
            How do you create an SEO blog section infographic that ranks and
            converts?
          </h2>
          <p className={prose}>
            To create a high-retention blog section infographic, convert each{" "}
            <strong>H2 heading into 3–6 structured visual nodes</strong> paired
            with <strong>quantified KPI badges and vector icons</strong>, match
            the section intent to a{" "}
            <strong>
              chevron pipeline, milestone timeline, versus battle card, KPI orb
              board, or multi-bar chart
            </strong>
            , composite over a <strong>branded AI art plate</strong> with your
            logo, and embed <strong>zero-CLS WebP or vector SVG markup</strong>{" "}
            with descriptive alt text.
          </p>
        </div>
      </section>

      {/* HOW IT WORKS (3-STEP VISUAL WORKFLOW) */}
      <section
        className={`${section} border-t border-slate-200 dark:border-slate-800`}
      >
        <div className="text-center">
          <p className="text-xs font-extrabold uppercase tracking-widest text-[#3452d1] dark:text-blue-300">
            Simple 3-Step Hybrid AI Infographic Workflow
          </p>
          <h2 className="mt-2 text-3xl font-black sm:text-4xl">
            How does the Free AI Blog Section Infographic Generator work?
          </h2>
          <p className="mx-auto mt-3 max-w-2xl text-sm text-slate-600 dark:text-slate-300">
            Go from a raw H2 heading, paragraph, or published blog URL to a
            realistic, publish-ready infographic in under 30 seconds.
          </p>
        </div>
        <div className="mt-10 grid gap-6 md:grid-cols-3">
          {[
            {
              num: "1",
              title: "Enter H2 heading, load preset, or extract URL",
              body: "Pick one of 6 Venngage-style scenario presets, paste a raw paragraph to auto-split into diagram nodes, or extract multiple H2 sections directly from any public article URL.",
            },
            {
              num: "2",
              title: "Customize AI art plates, vector icons & logo",
              body: "Switch between 3D AI Art Plate backdrops, Glow Orbs, or Clean Vector mode. Assign 20 geometric vector icons to each node, upload your brand logo, and apply 8 light or dark palettes.",
            },
            {
              num: "3",
              title: "Preview 25 live layouts & export HD",
              body: "Browse all 25 curated infographic designs or toggle 'My Active Text' to see your copy across every layout. Export as PNG, vector SVG, WebP, PDF, CWV HTML, or a multi-section .ZIP.",
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

      {/* ALL 25 TEMPLATES OVERVIEW WITH CURATED SHOWCASE DATA & FAMILY BADGES */}
      <section
        className={`${section} border-t border-slate-200 dark:border-slate-800`}
      >
        <div className="text-center">
          <p className="text-xs font-extrabold uppercase tracking-widest text-[#3452d1] dark:text-blue-300">
            {templateCount} Built-In Venngage, Canva &amp; Napkin.ai-Style Blog Layouts
          </p>
          <h2 className="mt-2 text-3xl font-black sm:text-4xl">
            Every blog infographic template engineered with distinct visual geometry
          </h2>
          <p className="mx-auto mt-3 max-w-2xl text-sm text-slate-600 dark:text-slate-300">
            All 25 templates combine AI art plate depth, 20 vector icon
            medallions, and auto-fitted typography across 16:9 Blog/OG, 1:1
            Square, 4:5 LinkedIn, and 9:16 Story/Pin dimensions.
          </p>
        </div>
        <ul className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {BLOG_INFOGRAPHIC_25_TEMPLATES.map((t) => {
            const showcase = TEMPLATE_CURATED_SHOWCASE_DATA[t.id];
            return (
              <li
                key={t.id}
                className="flex flex-col justify-between rounded-2xl border border-slate-200 bg-slate-50/80 p-4 shadow-2xs transition hover:border-[#3452d1]/60 hover:shadow-md dark:border-slate-800 dark:bg-slate-900"
              >
                <div>
                  <div className="flex items-center justify-between gap-2">
                    <span className="inline-flex items-center gap-1.5 rounded-lg bg-slate-900 px-2.5 py-0.5 text-[11px] font-black text-white dark:bg-indigo-500/20 dark:text-indigo-200">
                      Template #{t.id}
                    </span>
                    <span className="shrink-0 rounded-full bg-[#3452d1]/10 px-2.5 py-0.5 text-[10px] font-extrabold text-[#3452d1] dark:bg-blue-500/20 dark:text-blue-300">
                      {t.family}
                    </span>
                  </div>

                  <h3 className="mt-2.5 text-sm font-black text-slate-900 dark:text-white">
                    {t.name}
                  </h3>

                  {showcase && (
                    <div className="mt-2 rounded-xl border border-slate-200/80 bg-white p-2.5 dark:border-slate-800 dark:bg-slate-950/70">
                      <p className="text-[11px] font-bold text-slate-800 dark:text-slate-200">
                        “{showcase.headline}”
                      </p>
                      <div className="mt-1.5 flex flex-wrap gap-1">
                        {showcase.nodes.slice(0, 3).map((n, idx) => (
                          <span
                            key={idx}
                            className="rounded-md bg-slate-100 px-1.5 py-0.5 text-[10px] font-semibold text-slate-600 dark:bg-slate-900 dark:text-slate-300"
                          >
                            {n.metricValue || n.badge}: {n.title}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  <p className="mt-2.5 text-xs leading-6 text-slate-600 dark:text-slate-300">
                    <strong>Best for:</strong> {t.bestForSectionType} ·{" "}
                    <span className="text-slate-500 dark:text-slate-400">
                      {t.editableFields}
                    </span>
                  </p>
                </div>

                <div className="mt-3 flex items-center justify-between border-t border-slate-200/70 pt-2.5 dark:border-slate-800">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    Palette: {showcase?.paletteId || "indigo-cyber"}
                  </span>
                  <a
                    href="#tool-studio-workspace"
                    className="inline-flex items-center gap-1 text-[11px] font-extrabold text-[#3452d1] hover:underline dark:text-blue-300"
                  >
                    Use in Studio ↑
                  </a>
                </div>
              </li>
            );
          })}
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
            Hybrid AI Art Plate + Vector Diagram Engine
          </p>
          <h2 className="mt-2 text-3xl font-black sm:text-4xl">
            Why our 25-Template Studio beats diffusion image prompts &amp; paid
            diagram tools
          </h2>
        </div>

        <div className="mt-10 grid gap-6 md:grid-cols-3">
          <div className="rounded-3xl border border-slate-200 bg-slate-50/70 p-6 dark:border-slate-800 dark:bg-slate-900">
            <Layers className="text-[#3452d1]" size={26} />
            <h3 className="mt-4 text-xl font-black">
              Hybrid AI art plates + 100% crisp vector typography
            </h3>
            <p className="mt-2 text-sm leading-7 text-slate-600 dark:text-slate-300">
              Diffusion image models paint flat pixels and misspell labels
              inside charts. We composite high-resolution AI 3D art plates
              underneath razor-sharp, live-editable HTML5 Canvas and SVG
              diagrams.
            </p>
          </div>
          <div className="rounded-3xl border border-slate-200 bg-slate-50/70 p-6 dark:border-slate-800 dark:bg-slate-900">
            <Palette className="text-[#EA580C]" size={26} />
            <h3 className="mt-4 text-xl font-black">
              20 vector icon medallions, brand logo &amp; 8 palettes
            </h3>
            <p className="mt-2 text-sm leading-7 text-slate-600 dark:text-slate-300">
              Assign custom geometric icons (Rocket, Trophy, Chart, Gear,
              Shield, CPU) to every node, upload your brand logo pill, and
              switch between light editorial paper and dark glassmorphic themes.
            </p>
          </div>
          <div className="rounded-3xl border border-slate-200 bg-slate-50/70 p-6 dark:border-slate-800 dark:bg-slate-900">
            <Sparkles className="text-emerald-500" size={26} />
            <h3 className="mt-4 text-xl font-black">
              Zero-CLS Core Web Vitals HTML, SVG &amp; WebP exports
            </h3>
            <p className="mt-2 text-sm leading-7 text-slate-600 dark:text-slate-300">
              Export lightweight vector SVGs, compressed WebPs, or copy
              ready-to-paste <code>&lt;figure&gt;</code> HTML with explicit
              width and height attributes for 0.000 layout shift.
            </p>
          </div>
        </div>

        <div className="mt-10 overflow-x-auto rounded-3xl border border-slate-200 dark:border-slate-800">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-100 text-xs font-extrabold uppercase text-slate-700 dark:bg-slate-950 dark:text-slate-200">
              <tr>
                <th className="px-4 py-3.5">Capability</th>
                <th className="px-4 py-3.5 text-[#3452d1] dark:text-blue-300">
                  DoItWithAI 25-Template Hybrid Infographic Studio
                </th>
                <th className="px-4 py-3.5">
                  Paid Diagram SaaS (Venngage / Napkin / Canva Pro)
                </th>
                <th className="px-4 py-3.5">Raw AI Diffusion Image Prompts</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 bg-white dark:divide-slate-800 dark:bg-slate-900">
              <tr>
                <td className="px-4 py-3.5 font-bold">
                  Blog-Specific Infographic Geometries
                </td>
                <td className="px-4 py-3.5 font-semibold text-emerald-600 dark:text-emerald-400">
                  25 Layouts (Chevrons, Timelines, Gears, VS Battle Cards, KPI
                  Orbs, Multi-Bar Charts, Pyramids)
                </td>
                <td className="px-4 py-3.5">Limited on free tier</td>
                <td className="px-4 py-3.5">Unstructured random art</td>
              </tr>
              <tr>
                <td className="px-4 py-3.5 font-bold">
                  Visual Depth &amp; Typography Accuracy
                </td>
                <td className="px-4 py-3.5 font-semibold text-emerald-600 dark:text-emerald-400">
                  3D AI Art Plates + 100% Editable Badges, Titles, Metrics &amp;
                  Vector Icons (Zero Typos)
                </td>
                <td className="px-4 py-3.5">Editable (requires account login)</td>
                <td className="px-4 py-3.5">Frequent misspelled / garbled text</td>
              </tr>
              <tr>
                <td className="px-4 py-3.5 font-bold">
                  Brand Logo Pill &amp; Custom Art Plate Upload
                </td>
                <td className="px-4 py-3.5 font-semibold text-emerald-600 dark:text-emerald-400">
                  Custom Logo Container + Custom Art Plate Backdrop + 8 Palettes
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
                  href="/ai-content-writer"
                  className="font-bold text-blue-300 underline hover:text-white"
                >
                  Flagship AI Content Writer Studio
                </Link>
                ,{" "}
                <Link
                  href="/tools/ai-blog-writer"
                  className="font-bold text-blue-300 underline hover:text-white"
                >
                  Free AI Blog Writer
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
                  Hybrid AI Art Plate + SVG Layouts
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
                  href={r.href}
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
              href={r.href}
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
