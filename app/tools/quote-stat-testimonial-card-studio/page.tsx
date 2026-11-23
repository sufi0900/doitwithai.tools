import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowRight,
  BookOpen,
  CheckCircle2,
  GraduationCap,
  Layers,
  MessageSquareQuote,
  Palette,
  ShieldCheck,
  Sparkles,
  Star,
  Terminal,
  Wand2,
} from "lucide-react";
import QuoteStatTestimonialCardStudioClient from "@/features/quote-stat-testimonial-card-studio/QuoteStatTestimonialCardStudioClient";
import HeroAnimatedTestimonialShowcase from "@/features/quote-stat-testimonial-card-studio/HeroAnimatedTestimonialShowcase";
import { QUOTE_TEMPLATES } from "@/features/quote-stat-testimonial-card-studio/model";
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
  "https://doitwithai.tools/tools/quote-stat-testimonial-card-studio";
const title =
  "Free AI Testimonial Card Generator: Customer Quote & Review Graphics";
const description =
  "Create branded customer testimonial cards, B2B quote graphics, and social proof images with our free AI testimonial card generator—upload a portrait photo, fit it inside concentric rings or arches, add your logo, and export HD PNG, SVG, or PDF.";
const templateCount = QUOTE_TEMPLATES.length;

export const metadata: Metadata = {
  title,
  description,
  keywords: [
    "free AI testimonial card generator",
    "AI testimonial card generator",
    "customer quote graphic maker",
    "testimonial card maker with photo and logo",
    "social proof graphic generator",
    "client review card generator",
    "founder quote card studio",
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
      "What is a Free AI Testimonial Card Generator and how does it work?",
    answer:
      "A free AI testimonial card generator turns raw customer reviews, G2 or Google feedback, case-study metrics, or article URLs into designed social proof cards. In this studio you paste a quote (or extract 5 quotable wins from any URL with AI), upload the customer's photo and your brand logo, adjust the ring/arch frame and brand hex colors, and export a 1080p PNG, vector SVG, or print-ready PDF.",
  },
  {
    question:
      "Can I upload a customer photo and adjust its position inside the ring or arch frame?",
    answer:
      "Yes. Upload any JPG, PNG, or WEBP portrait (or pick one of the 4 built-in male executive portraits), choose between Circle-in-Ring, Arch Frame, Adjustable Radius Frame, or Cutout Aura, and use the real-time sliders to move the photo up/down, left/right, zoom in/out, and change the corner/circle radius from 0% square to 50% circle.",
  },
  {
    question:
      "Does the studio remove and blend the photo background automatically?",
    answer:
      "Yes. When you upload a portrait, our in-browser background removal and studio framing engine strips the background wall and clips the person cleanly inside your chosen ring, arch, or split frame. Everything runs locally in your browser so your customer photos are never uploaded to external servers.",
  },
  {
    question: "Can I add and resize my own company logo on every template?",
    answer:
      "Yes. Click 'Upload logo' in Step 1 to add your PNG, SVG, JPG, or WEBP brand mark. You can scale the logo from 70% to 145% and switch between an Auto contrast badge, Brand Pill, White Box, Dark Box, or Plain transparent placement across all 14 templates.",
  },
  {
    question: "How many testimonial and quote card templates are included?",
    answer:
      "The studio includes 14 responsive templates: Arch Aura Split, Concentric Ring Portrait, Flagship Studio Split, Editorial Dot-Grid Frame, Curved Wave + 3 Proof Pills, Full-Bleed Magazine Split, Left Portrait + Right Quote, Oversized KPI Stat + Ring, Verified Social Post Card, Founder Memo Note, Before vs. After Case Study, Contrarian Myth vs. Reality, Podcast Waveform Quote, and Quote + 3 Action Takeaways.",
  },
  {
    question: "Can I highlight key ROI phrases in my company's brand color?",
    answer:
      "Yes. Either type your target phrase into the 'Highlighted phrase (brand color)' box or wrap any words in **double asterisks** inside the quote. The renderer highlights those exact words with a soft brand-tinted ribbon and accent typography.",
  },
  {
    question: "Which sizes and export formats are supported?",
    answer:
      "Switch seamlessly between 1:1 Square (1080×1080 for website grids and Instagram), 4:5 Portrait (1080×1350 for maximum LinkedIn mobile feed height), and 16:9 Landscape (1600×900 for B2B sales decks, case studies, and blog headers). Export individual cards as PNG, SVG, or PDF, or download all cards plus a social caption in one ZIP archive.",
  },
  {
    question:
      "Can the AI extract quotable testimonials directly from a blog or case-study URL?",
    answer:
      "Yes. Paste any public blog post or customer case-study URL into the top extractor bar and click Extract & Generate. The tool pulls 5 quotable takeaways and populates them into ready-to-export cards.",
  },
  {
    question: "Is this AI testimonial card generator completely free?",
    answer:
      "Yes—it is 100% free with no signup, no credit card, and no watermark. The brand badge displays your own uploaded logo or your own website domain.",
  },
  {
    question: "Can I also run this workflow inside the Do It AI workspace?",
    answer:
      "Yes. Click 'Use in Do It AI' in the hero bar to open our Do It AI assistant, where you can turn raw client interview transcripts into polished quotes, write the accompanying LinkedIn post, and launch this visual card studio in one connected workflow.",
  },
];

const USE_CASES = [
  {
    title: "SaaS & B2B landing pages",
    body: "Place a named customer quote, 5-star badge, and ring-framed portrait above the fold or next to pricing tiers to lift demo conversions.",
  },
  {
    title: "AI automation & marketing agencies",
    body: "Turn client ROI wins and before-vs-after metrics into branded case-study graphics for client pitches, retainers, and LinkedIn posts.",
  },
  {
    title: "Local businesses & clinics",
    body: "Convert 5-star Google reviews into square and 4:5 testimonial graphics for Google Business updates, Instagram, and Facebook feeds.",
  },
  {
    title: "Coaches, courses & creators",
    body: "Showcase student transformations, podcast soundbites, and 3-step action takeaways across sales pages and email sequences.",
  },
  {
    title: "E-commerce & Shopify brands",
    body: "Transform verified buyer feedback into on-brand product review cards with custom hex colors and trust pills.",
  },
  {
    title: "Founders & B2B executives",
    body: "Publish high-dwell founder memo notes, contrarian myth-vs-reality cards, and verified social post graphics on LinkedIn and X.",
  },
];

const PROMPT_PROMO_CARDS = [
  {
    badge: "83 B2B & LINKEDIN PROMPTS",
    title: "LinkedIn Personal Branding, Carousels & Social Proof Prompts",
    desc: "Copy-paste prompt frameworks to turn customer wins, founder memos, and case-study numbers into high-dwell LinkedIn posts.",
    image: "/prompts/linkedin-personal-branding-b2b-prompts-hero-v2.webp",
    snippet:
      "Act as a B2B Ghostwriter. Turn this client review into a 3-sentence founder story + a 1080x1080 testimonial card hook...",
    href: "/prompts/linkedin-personal-branding-b2b-prompts",
    cta: "Open LinkedIn Prompt Pack",
  },
  {
    badge: "87 REPURPOSING PROMPTS",
    title: "Content Repurposing & Social Quote Extraction Prompt Library",
    desc: "Extract standalone quote cards, myth-vs-reality slides, and newsletter callouts from any long-form blog post or interview.",
    image: "/prompts/content-repurposing-prompts-hero-v2.webp",
    snippet:
      "Extract the 5 most quotable, stat-backed takeaways from [Article Text] and pair each with a 6-word highlight ribbon...",
    href: "/prompts/content-repurposing-prompts",
    cta: "Open Repurposing Prompts",
  },
  {
    badge: "77 VISUAL & CHART PROMPTS",
    title: "Infographic, Data Visualization & KPI Stat Card Prompts",
    desc: "Structure benchmark data, before-and-after metrics, and 2×2 matrices for visual proof cards and digital PR.",
    image: "/prompts/infographic-data-visualization-prompts-hero-v2.webp",
    snippet:
      "Convert these 4 case-study metrics into an oversized KPI stat callout with a 15-word executive proof statement...",
    href: "/prompts/infographic-data-visualization-prompts",
    cta: "Open Visual Prompt Pack",
  },
];

const BLOG_GUIDE_CARDS = [
  {
    category: "Editorial Strategy Guide · 8 Min Read",
    title: "How to Check Google Keyword Rankings & Turn Wins into Social Proof",
    summary:
      "Verify Search Console ranking jumps and package your traffic milestones into high-converting B2B testimonial and KPI cards.",
    image: "/images/articles/check-google-keyword-rankings.jpg",
    author: "Sufian Mustafa",
    href: "/guides",
    cta: "Read Ranking & Proof Guide",
  },
  {
    category: "Content & AEO Playbook · 7 Min Read",
    title: "What to Do After Keyword Research: From Topic Clusters to Visual Proof",
    summary:
      "Why top-ranking pages in 2026 combine 50-word quick answers, original data tables, and embedded customer quote graphics.",
    image: "/images/articles/what-to-do-after-keyword-research.jpg",
    author: "Sufian Mustafa",
    href: "/ai-seo",
    cta: "Explore AI SEO Playbooks",
  },
  {
    category: "Visual Tool Reviews · 6 Min Read",
    title: "Best AI Tools for Visual Content, Testimonials & B2B Distribution",
    summary:
      "Compare browser-based visual studios, automated quote extractors, and multi-channel card generators for lean marketing teams.",
    image: "/prompts/ai-search-aeo-geo-prompts-hero-v2.webp",
    author: "Sufian Mustafa",
    href: "/ai-tools",
    cta: "Browse AI Tool Reviews",
  },
];

const COURSE_LEARNING_CARDS = [
  {
    level: "Free Track · 4 Modules",
    title: "Learn & Earn with AI: Build High-Converting Visual Social Proof Assets",
    outcome:
      "Turn client reviews, podcasts, and articles into retainers and downloadable social proof packages.",
    modules: [
      "Module 1: Extracting high-trust quotes & KPIs",
      "Module 2: Brand color psychology & ring/arch framing",
      "Module 3: LinkedIn, sales deck & landing page placement",
    ],
    href: "/ai-learn-earn",
    cta: "Start Learn & Earn Track",
  },
  {
    level: "No-Code Builder Track · 5 Modules",
    title: "Vibe-Coding & Customizing Standalone AI Marketing Tools",
    outcome:
      "Download a portable tool from our catalog, customize its brand colors and API keys, and deploy it on your own site.",
    modules: [
      "Module 1: Running portable HTML/React tools offline",
      "Module 2: Connecting Gemini/OpenAI keys (BYOK)",
      "Module 3: Embedding interactive studios for lead gen",
    ],
    href: "/ai-code",
    cta: "Explore AI Code & Builders",
  },
  {
    level: "Full Platform Walkthrough · Interactive",
    title: "How to Do It With AI: Complete Multi-Tool & Agent Workflow",
    outcome:
      "See how our 104+ free SEO, content, and visual studios connect inside the Do It AI command center.",
    modules: [
      "Step 1: Research intent & buyer prompts",
      "Step 2: Generate branded quote & infographic cards",
      "Step 3: Validate schema & request indexing",
    ],
    href: "/what-our-ai-tool-can-do",
    cta: "See What DoItWithAI Can Do",
  },
];

const RELATED_TOOLS = [
  {
    slug: "google-review-link-generator",
    label: "Google Review Link & QR Generator",
    why: "Collect the 5-star customer reviews you turn into cards",
  },
  {
    slug: "blog-to-linkedin-carousel",
    label: "LinkedIn PDF Carousel Studio",
    why: "Turn your testimonial cards into a swipeable 10-slide carousel",
  },
  {
    slug: "pinterest-pin-visual-generator",
    label: "Pinterest 1000×1500 Pin Studio",
    why: "Create vertical quote pins from the same customer wins",
  },
  {
    slug: "data-to-chart-visual-card-maker",
    label: "Data & KPI Chart Maker",
    why: "Pair customer quotes with verified ROI bar and line charts",
  },
  {
    slug: "linkedin-post-formatter",
    label: "LinkedIn Post Formatter",
    why: "Format the hook and caption that accompanies your quote graphic",
  },
  {
    slug: "local-business-schema-generator",
    label: "LocalBusiness Schema Generator",
    why: "Add structured review and rating schema markup to your site",
  },
];

const section = "mx-auto max-w-6xl px-4 py-14 sm:px-6";
const prose = "mt-4 text-base leading-8 text-slate-600 dark:text-slate-300";

export default function QuoteStatTestimonialCardStudioPage() {
  const schema = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebApplication",
        name: "Free AI Testimonial Card Generator: Customer Quote & Review Graphics",
        alternateName: [
          "Free AI Testimonial Card Generator",
          "AI Customer Quote Graphic Maker",
          "Quote, Stat & Testimonial Card Studio",
          "Do It With AI Visual Testimonial Studio",
        ],
        url: pageUrl,
        description,
        applicationCategory: "DesignApplication",
        operatingSystem: "Any",
        browserRequirements: "Requires JavaScript",
        isAccessibleForFree: true,
        featureList: [
          `${templateCount} responsive testimonial, ring, arch, and quote card templates`,
          "Customer photo upload with automatic in-browser background removal",
          "Real-time photo position (up/down, left/right), zoom, and circle/corner radius sliders",
          "Custom brand logo upload with adjustable size and badge styles",
          "URL-to-Quote AI extraction for blog posts and case studies",
          "1:1 Square, 4:5 LinkedIn, and 16:9 Sales Deck exports in PNG, SVG, PDF, and ZIP",
        ],
        offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
      },
      {
        "@type": "HowTo",
        name: "How to Create an AI Testimonial Card with Photo, Ring Frame & Logo in 3 Steps",
        description:
          "Turn any customer review, case study stat, or article URL into a high-resolution branded testimonial graphic.",
        step: [
          {
            "@type": "HowToStep",
            position: 1,
            name: "Upload the customer photo, adjust the ring/arch frame, and add your logo",
            text: "Upload a customer portrait (background is removed automatically) or choose one of 4 male executive portraits. Pick Circle-in-Ring, Arch, Rounded, or Cutout framing, adjust up/down position and radius, and upload your brand logo.",
          },
          {
            "@type": "HowToStep",
            position: 2,
            name: "Enter or AI-extract the quote and customize brand hex colors",
            text: "Paste the customer quote (or extract 5 quotes from a URL), highlight the key ROI phrase in your brand color, and add the customer's name, role, and 3 proof pills.",
          },
          {
            "@type": "HowToStep",
            position: 3,
            name: "Download your HD testimonial card",
            text: "Export immediately in 1:1 Square, 4:5 Portrait, or 16:9 Landscape as a crisp PNG, vector SVG, print-ready PDF, or multi-card ZIP bundle.",
          },
        ],
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { name: "Home", item: "https://doitwithai.tools" },
          { name: "Tools", item: "https://doitwithai.tools/tools" },
          {
            name: "Free AI Testimonial Card Generator",
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

      {/* COMPACT UNIFIED HERO: LEFT SEO & CTA COLUMN + RIGHT FRAMED TESTIMONIAL SHOWCASE */}
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
            <span aria-current="page">Free AI Testimonial Card Generator</span>
          </nav>

          <div className="grid items-center gap-8 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)]">
            <div>
              <div className="mb-3 inline-flex flex-wrap items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-xs font-bold text-white backdrop-blur-xs">
                <PlatformBrandIcon
                  slugOrText="quote-stat-testimonial-card-studio"
                  size={18}
                />
                <span>
                  Free AI Testimonial Studio · No Signup · Zero Watermark
                </span>
                <span className="inline-flex items-center gap-0.5 text-amber-300">
                  <Star size={12} fill="currentColor" /> 4.9/5
                </span>
              </div>

              <p className="text-xs font-bold uppercase tracking-widest text-[#b4c3ff]">
                AI TESTIMONIAL CARD GENERATOR · CUSTOMER QUOTE GRAPHICS · SOCIAL
                PROOF
              </p>

              <h1 className="mt-3 text-3xl font-black leading-tight sm:text-4xl lg:text-5xl">
                Free AI Testimonial Card Generator:{" "}
                <span className={toolHeroHeading}>
                  Customer Quote, Photo &amp; Logo Studio
                </span>
              </h1>

              <p className="mt-4 max-w-2xl text-base leading-relaxed text-slate-200">
                Turn any customer review, case-study stat, or blog URL into a
                studio-grade testimonial card. Upload a customer photo (auto
                background removal + real-time ring, arch, position &amp; radius
                controls), add your brand logo and hex colors, choose from{" "}
                {templateCount} responsive templates, and export HD PNG, SVG, or
                PDF.
              </p>

              <PortableToolHeroBar
                slug="quote-stat-testimonial-card-studio"
                title="Free AI Testimonial Card Generator"
                path="/tools/quote-stat-testimonial-card-studio"
                primaryLabel="Use Tool Now: Create Testimonial Card"
                workspaceId="tool-studio-workspace"
              />
            </div>

            <div>
              <HeroAnimatedTestimonialShowcase />
            </div>
          </div>
        </div>
      </header>

      {/* INTERACTIVE STUDIO WORKSPACE */}
      <QuoteStatTestimonialCardStudioClient />

      {/* 50-WORD QUICK ANSWER BOX FOR GOOGLE AI OVERVIEWS & AEO */}
      <section className={section}>
        <div className="rounded-3xl border border-slate-200 bg-slate-50/80 p-7 dark:border-slate-800 dark:bg-slate-900/80">
          <p className="text-xs font-bold uppercase tracking-widest text-[#3452d1] dark:text-blue-300">
            Quick Answer · Free AI Testimonial Card Generator
          </p>
          <h2 className="mt-2 text-2xl font-black sm:text-3xl">
            How do you create a high-converting AI testimonial card?
          </h2>
          <p className={prose}>
            To create a customer testimonial card that lifts landing page and
            LinkedIn conversions, pair a{" "}
            <strong>concise 18–36 word customer quote</strong> with{" "}
            <strong>brand-colored phrase highlighting</strong> on the specific
            ROI outcome, frame a{" "}
            <strong>front-facing customer portrait inside a ring or arch</strong>
            , include <strong>verified 5-star attribution and your logo</strong>
            , and export in{" "}
            <strong>1:1 Square, 4:5 Feed, or 16:9 Sales Deck</strong> format.
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
            How does the Free AI Testimonial Card Generator work?
          </h2>
          <p className="mx-auto mt-3 max-w-2xl text-sm text-slate-600 dark:text-slate-300">
            Go from raw client feedback or a case-study URL to a responsive,
            on-brand quote graphic in under 60 seconds.
          </p>
        </div>
        <div className="mt-10 grid gap-6 md:grid-cols-3">
          {[
            {
              num: "1",
              title: "Upload photo, adjust ring & add logo",
              body: "Upload your customer's portrait (background removed in-browser) or pick a ready-made executive portrait. Adjust up/down position, zoom, and circle/corner radius inside the ring or arch frame, and upload your logo.",
            },
            {
              num: "2",
              title: "Enter or AI-extract the quote & colors",
              body: "Paste a customer review or extract 5 quotable wins from any URL. Highlight the key ROI phrase in your brand color, customize the 3 proof pills, and select your exact hex palette.",
            },
            {
              num: "3",
              title: "Choose from 14 templates & export HD",
              body: "Click any of the 14 live template previews to switch layouts without losing your edits. Download in 1:1, 4:5, or 16:9 as crisp PNG, vector SVG, print-ready PDF, or a complete ZIP bundle.",
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

      {/* 14 TEMPLATES OVERVIEW WITH VISUAL BADGES */}
      <section
        className={`${section} border-t border-slate-200 dark:border-slate-800`}
      >
        <div className="text-center">
          <p className="text-xs font-extrabold uppercase tracking-widest text-[#3452d1] dark:text-blue-300">
            {templateCount} Built-In Testimonial &amp; Quote Card Layouts
          </p>
          <h2 className="mt-2 text-3xl font-black sm:text-4xl">
            Responsive testimonial templates for every marketing channel
          </h2>
          <p className="mx-auto mt-3 max-w-2xl text-sm text-slate-600 dark:text-slate-300">
            Every template automatically adapts to 1:1 Square, 4:5 LinkedIn, and
            16:9 Presentation sizes with strict non-overlapping typography and
            framed portraits.
          </p>
        </div>
        <ul className="mt-8 grid gap-3.5 sm:grid-cols-2 lg:grid-cols-3">
          {QUOTE_TEMPLATES.map((t) => (
            <li
              key={t.id}
              className="flex flex-col justify-between rounded-2xl border border-slate-200 bg-slate-50/70 p-4 transition hover:border-[#3452d1]/50 dark:border-slate-800 dark:bg-slate-900"
            >
              <div>
                <div className="flex items-center justify-between gap-2">
                  <h3 className="text-sm font-black text-slate-900 dark:text-white">
                    {t.label}
                  </h3>
                  <span className="shrink-0 rounded-full bg-[#3452d1]/10 px-2.5 py-0.5 text-[10px] font-extrabold text-[#3452d1] dark:bg-blue-500/20 dark:text-blue-300">
                    {t.badge}
                  </span>
                </div>
                <p className="mt-1.5 text-xs leading-6 text-slate-600 dark:text-slate-300">
                  {t.desc}
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

      {/* USE CASES */}
      <section
        className={`${section} border-t border-slate-200 dark:border-slate-800`}
      >
        <div className="text-center">
          <p className="text-xs font-extrabold uppercase tracking-widest text-[#3452d1] dark:text-blue-300">
            Built for High-Trust Social Proof
          </p>
          <h2 className="mt-2 text-3xl font-black sm:text-4xl">
            Who uses our AI Customer Quote &amp; Testimonial Graphic Maker?
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

      {/* WHAT MAKES IT SPECIAL + COMPETITOR COMPARISON TABLE */}
      <section
        className={`${section} border-t border-slate-200 dark:border-slate-800`}
      >
        <div className="text-center">
          <p className="text-xs font-extrabold uppercase tracking-widest text-[#3452d1] dark:text-blue-300">
            Industrial-Grade Visual Studio
          </p>
          <h2 className="mt-2 text-3xl font-black sm:text-4xl">
            What makes our Free AI Testimonial Card Generator special?
          </h2>
        </div>

        <div className="mt-10 grid gap-6 md:grid-cols-3">
          <div className="rounded-3xl border border-slate-200 bg-slate-50/70 p-6 dark:border-slate-800 dark:bg-slate-900">
            <MessageSquareQuote className="text-[#3452d1]" size={26} />
            <h3 className="mt-4 text-xl font-black">
              Precision ring, arch &amp; radius portrait framing
            </h3>
            <p className="mt-2 text-sm leading-7 text-slate-600 dark:text-slate-300">
              Unlike basic generators that paste square photos over text, our
              engine clips portraits directly inside concentric rings, arches,
              or adjustable-radius frames with real-time up/down, left/right,
              and zoom sliders.
            </p>
          </div>
          <div className="rounded-3xl border border-slate-200 bg-slate-50/70 p-6 dark:border-slate-800 dark:bg-slate-900">
            <Palette className="text-[#EA580C]" size={26} />
            <h3 className="mt-4 text-xl font-black">
              Full brand logo &amp; hex palette control
            </h3>
            <p className="mt-2 text-sm leading-7 text-slate-600 dark:text-slate-300">
              Upload your company logo, adjust its scale and container pill, and
              apply your exact hex colors across the quote highlight ribbon,
              concentric rings, verified badges, and executive footer bar.
            </p>
          </div>
          <div className="rounded-3xl border border-slate-200 bg-slate-50/70 p-6 dark:border-slate-800 dark:bg-slate-900">
            <Layers className="text-emerald-500" size={26} />
            <h3 className="mt-4 text-xl font-black">
              Zero-overlap responsive sizing (1:1, 4:5 &amp; 16:9)
            </h3>
            <p className="mt-2 text-sm leading-7 text-slate-600 dark:text-slate-300">
              Switch effortlessly between <strong>1:1 Square</strong> (website
              grids &amp; Instagram), <strong>4:5 Portrait</strong> (LinkedIn
              mobile feeds), and <strong>16:9 Landscape</strong> (sales decks
              &amp; case studies) with auto-fitting typography.
            </p>
          </div>
        </div>

        <div className="mt-10 overflow-x-auto rounded-3xl border border-slate-200 dark:border-slate-800">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-100 text-xs font-extrabold uppercase text-slate-700 dark:bg-slate-950 dark:text-slate-200">
              <tr>
                <th className="px-4 py-3.5">Capability</th>
                <th className="px-4 py-3.5 text-[#3452d1] dark:text-blue-300">
                  DoItWithAI Testimonial Card Studio
                </th>
                <th className="px-4 py-3.5">Single-Purpose Paid Generators</th>
                <th className="px-4 py-3.5">Manual Design Software</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 bg-white dark:divide-slate-800 dark:bg-slate-900">
              <tr>
                <td className="px-4 py-3.5 font-bold">
                  Visual Card Templates Included
                </td>
                <td className="px-4 py-3.5 font-semibold text-emerald-600 dark:text-emerald-400">
                  {templateCount} Layouts (Concentric Rings, Arch, Split, KPI,
                  Before/After, Waveform)
                </td>
                <td className="px-4 py-3.5">Often 1–2 static layouts</td>
                <td className="px-4 py-3.5">Manual layout alignment</td>
              </tr>
              <tr>
                <td className="px-4 py-3.5 font-bold">
                  Portrait Ring Framing &amp; Position Sliders
                </td>
                <td className="px-4 py-3.5 font-semibold text-emerald-600 dark:text-emerald-400">
                  Auto Background Cutout + Up/Down, Left/Right, Zoom &amp; 0–50%
                  Radius Sliders
                </td>
                <td className="px-4 py-3.5">Fixed crop box only</td>
                <td className="px-4 py-3.5">Manual masking &amp; clipping</td>
              </tr>
              <tr>
                <td className="px-4 py-3.5 font-bold">
                  URL-to-Quote AI Extraction
                </td>
                <td className="px-4 py-3.5 font-semibold text-emerald-600 dark:text-emerald-400">
                  Pulls 5 quotable wins from any blog or case-study URL
                </td>
                <td className="px-4 py-3.5">Manual copy-paste only</td>
                <td className="px-4 py-3.5">Not supported</td>
              </tr>
              <tr>
                <td className="px-4 py-3.5 font-bold">
                  Export Formats &amp; Pricing
                </td>
                <td className="px-4 py-3.5 font-semibold text-emerald-600 dark:text-emerald-400">
                  100% Free · Instant PNG, Vector SVG, PDF, ZIP &amp; Portable
                  App
                </td>
                <td className="px-4 py-3.5">$19–$49/mo subscription</td>
                <td className="px-4 py-3.5">$15+/mo + design hours</td>
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
                Want to automate your entire social proof &amp; SEO workflow?
                Just Do It With AI.
              </h2>
              <p className="mt-3 text-sm leading-7 text-slate-200 sm:text-base">
                Instead of jumping between separate tabs for review collection,
                copywriting, and graphic design, you can{" "}
                <strong>do it with AI</strong> inside our{" "}
                <Link
                  href="/do-it-ai?tool=quote-stat-testimonial-card-studio"
                  className="font-bold text-blue-300 underline hover:text-white"
                >
                  Do It AI Workspace
                </Link>
                . Ask the <strong>Do It AI</strong> agent to pull the strongest
                customer outcomes from a raw transcript, write a high-converting{" "}
                <Link
                  href="/tools/linkedin-post-formatter"
                  className="font-bold text-blue-300 underline hover:text-white"
                >
                  LinkedIn post
                </Link>
                , generate a{" "}
                <Link
                  href="/tools/google-review-link-generator"
                  className="font-bold text-blue-300 underline hover:text-white"
                >
                  Google review QR link
                </Link>
                , and launch this Testimonial Card Studio with pre-filled
                quotes.
              </p>
              <div className="mt-5 flex flex-wrap gap-3 text-xs font-bold text-slate-200">
                <span className="inline-flex items-center gap-1.5 rounded-xl bg-white/10 px-3 py-1.5">
                  <CheckCircle2 size={14} className="text-emerald-400" /> 104+
                  Connected AI SEO &amp; Visual Tools
                </span>
                <span className="inline-flex items-center gap-1.5 rounded-xl bg-white/10 px-3 py-1.5">
                  <CheckCircle2 size={14} className="text-emerald-400" /> 952+
                  Ready-Made Marketing Prompts
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
                href="/do-it-ai?tool=quote-stat-testimonial-card-studio"
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
          Related free AI tools for social proof &amp; distribution
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
              Copy-paste AI prompt packs for testimonials, LinkedIn &amp; visual
              proof
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
              Deep-dive SEO, content distribution &amp; social proof guides
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
              Build, customize &amp; monetize AI workflows step by step
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

      <ToolResources slug="quote-stat-testimonial-card-studio" />
      <ToolFaq
        title="Free AI Testimonial Card Generator FAQs"
        faqs={faqs}
      />
    </div>
  );
}
