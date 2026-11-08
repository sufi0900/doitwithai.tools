import PortableToolHeroBar from "@/features/portable-tool-kit/PortableToolHeroBar";
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
import ToolFaq from "@/features/tool-ui/ToolFaq";
import ToolResources from "@/features/tool-catalog/ToolResources";
import {
  ToolHeroBackground,
  toolHeroHeading,
  toolHeroSurface,
} from "@/features/tool-ui/ToolHero";
import { PlatformBrandIcon } from "@/features/tool-ui/PlatformBrandIcon";

const pageUrl =
  "https://doitwithai.tools/tools/quote-stat-testimonial-card-studio";
const title = "AI Testimonial Card & Customer Quote Graphic Generator";
const description =
  "Turn customer reviews, case study stats, and article quotes into branded testimonial cards with custom male portraits, brand logos, and 1080p exports.";

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
    question: "What is an AI testimonial card generator and how does it work?",
    answer:
      "An AI testimonial card generator turns raw customer reviews, G2/Trustpilot feedback, case study statistics, or article quotes into polished, on-brand social proof graphics. Upload a customer photo (or choose from our 4 executive male portraits), enter your quote and brand colors, and download a high-resolution PNG, SVG, or PDF card in seconds.",
  },
  {
    question:
      "Can I upload my own portrait photo and company logo to the testimonial card?",
    answer:
      "Yes. In Step 1 of the studio above, click 'Upload Your Photo' to add any JPG, PNG, or WEBP portrait, and click 'Upload Brand Logo' to place your company mark directly inside the dark brand footer bar—or test immediately using our 4 built-in male executive portraits.",
  },
  {
    question: "Can I highlight specific words in my company's brand colors?",
    answer:
      "Yes! Either type your key outcome phrase into the 'Brand-Colored Highlight Phrase' box or wrap any words in **double asterisks** inside your quote. The studio automatically highlights those words in your chosen hex accent color.",
  },
  {
    question: "What can I use these testimonial and quote graphics for?",
    answer:
      "You can switch between 1:1 Square (1080×1080), 4:5 Portrait (1080×1350), and 16:9 Landscape (1600×900) to publish customer testimonials, founder memos, KPI stat callouts, and verified post cards across website landing pages, LinkedIn posts, B2B sales decks, case study pages, and email campaigns.",
  },
  {
    question: "Can it extract shareable quotes directly from a blog or case study URL?",
    answer:
      "Yes—paste any public article or case study URL into the extractor bar at the top of the workspace to pull 5 quotable takeaways and preview them across all 13 visual templates.",
  },
  {
    question: "Can I also run this workflow inside the Do It AI workspace?",
    answer:
      "Absolutely. If you want to do it with AI in one conversational flow, click 'Use in Do It AI' in the hero bar to open our Do It AI assistant, where you can turn raw client transcripts into polished testimonials and launch this visual studio directly.",
  },
];

const PROMPT_PROMO_CARDS = [
  {
    badge: "83 B2B & LINKEDIN PROMPTS",
    title: "LinkedIn Personal Branding, Carousels & Social Proof Prompts",
    desc: "Copy-paste prompt frameworks to turn customer wins, founder memos, and case study numbers into high-dwell LinkedIn posts.",
    image: "/prompts/linkedin-personal-branding-b2b-prompts-hero-v2.webp",
    snippet:
      'Act as a B2B Ghostwriter. Turn this client review into a 3-sentence founder story + 1080x1080 testimonial card hook...',
    href: "/prompts/linkedin-personal-branding-b2b-prompts",
    cta: "Open LinkedIn Prompt Pack",
  },
  {
    badge: "87 REPURPOSING PROMPTS",
    title: "Content Repurposing & Social Quote Extraction Prompt Library",
    desc: "Extract 5 standalone quote cards, contrarian myth-vs-reality slides, and newsletter callouts from any long-form blog post.",
    image: "/prompts/content-repurposing-prompts-hero-v2.webp",
    snippet:
      "Extract the 5 most quotable, stat-backed takeaways from [Article Text] and pair each with a 6-word highlight ribbon...",
    href: "/prompts/content-repurposing-social-media-prompts",
    cta: "Open Repurposing Prompts",
  },
  {
    badge: "77 VISUAL & CHART PROMPTS",
    title: "Infographic, Data Visualization & KPI Stat Card Prompts",
    desc: "Structure raw benchmark data, before-and-after metrics, and 2×2 matrices for visual proof cards and digital PR.",
    image: "/prompts/infographic-data-visualization-prompts-hero-v2.webp",
    snippet:
      "Convert these 4 case study metrics into an Oversized KPI Stat Callout card with a 15-word executive proof statement...",
    href: "/prompts/infographic-data-visualization-prompts",
    cta: "Open Visual Prompt Pack",
  },
];

const BLOG_GUIDE_CARDS = [
  {
    category: "Editorial Strategy Guide · 8 Min Read",
    title: "How to Check Google Keyword Rankings & Turn Wins into Social Proof",
    summary:
      "Learn how to verify Search Console ranking jumps and package your traffic milestones into high-converting B2B testimonial and KPI cards.",
    image: "/images/articles/check-google-keyword-rankings.jpg",
    author: "Sufian Mustafa",
    href: "/guides",
    cta: "Explore SEO & Content Guides",
  },
  {
    category: "Content & AEO Playbook · 7 Min Read",
    title: "What to Do After Keyword Research: From Topic Clusters to Visual Proof",
    summary:
      "Why top-ranking pages in 2026 combine 50-word quick answers, original data tables, and embedded customer quote graphics to win AI citations.",
    image: "/images/articles/what-to-do-after-keyword-research.jpg",
    author: "Sufian Mustafa",
    href: "/ai-seo",
    cta: "Read AI SEO Playbooks",
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
      "Master turning client reviews, podcasts, and articles into retainers and downloadable social proof packages.",
    modules: [
      "Module 1: Extracting High-Trust Quotes & KPIs",
      "Module 2: Brand Color Psychology & Portrait Framing",
      "Module 3: LinkedIn, Sales Deck & Landing Page Placement",
    ],
    href: "/ai-learn-earn",
    cta: "Start Learn & Earn Track",
  },
  {
    level: "No-Code Builder Track · 5 Modules",
    title: "Vibe-Coding & Customizing Standalone AI Marketing Tools",
    outcome:
      "Download any portable tool from our catalog, customize its brand colors and API keys, and deploy it on your own site.",
    modules: [
      "Module 1: Running Portable HTML/React Tools Offline",
      "Module 2: Connecting Gemini/OpenAI Keys (BYOK)",
      "Module 3: Embedding Interactive Studios for Lead Gen",
    ],
    href: "/ai-code",
    cta: "Explore AI Code & Builders",
  },
  {
    level: "Full Platform Walkthrough · Interactive",
    title: "How to Do It With AI: Complete Multi-Tool & Agent Workflow",
    outcome:
      "See how our 100+ free SEO, content, and visual studios connect inside the Do It AI command center.",
    modules: [
      "Step 1: Research Intent & Buyer Prompts",
      "Step 2: Generate Branded Quote & Infographic Cards",
      "Step 3: Validate Schema & Rapid Indexing",
    ],
    href: "/what-our-ai-tool-can-do",
    cta: "See What DoItWithAI Can Do",
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
        name: "AI Testimonial Card & Customer Quote Graphic Generator",
        alternateName: [
          "AI Testimonial Card Generator: Customer Quote Graphics",
          "Quote, Stat & Testimonial Card Studio",
          "Free Social Proof & Founder Memo Graphic Maker",
          "Do It With AI Visual Testimonial Studio",
        ],
        url: pageUrl,
        description,
        applicationCategory: "DesignApplication",
        operatingSystem: "Any",
        browserRequirements: "Requires JavaScript",
        isAccessibleForFree: true,
        offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
      },
      {
        "@type": "HowTo",
        name: "How to Create a Branded Customer Testimonial Card in 3 Steps",
        description:
          "Turn any customer quote, review, or article insight into a high-resolution testimonial graphic.",
        step: [
          {
            "@type": "HowToStep",
            position: 1,
            name: "Add your photo or choose a male executive portrait",
            text: "Upload your customer's portrait photo and brand logo, or click one of the 4 built-in male executive portraits.",
          },
          {
            "@type": "HowToStep",
            position: 2,
            name: "Enter the quote, highlight key phrases, and pick brand colors",
            text: "Paste the customer quote, specify the phrase to highlight in your brand accent color, and add the customer's name, role, and trust pills.",
          },
          {
            "@type": "HowToStep",
            position: 3,
            name: "Download your high-resolution testimonial card",
            text: "Export your finished card in 1:1 Square, 4:5 Portrait, or 16:9 Landscape as a crisp PNG, vector SVG, or print-ready PDF.",
          },
        ],
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { name: "Home", item: "https://doitwithai.tools" },
          { name: "Tools", item: "https://doitwithai.tools/tools" },
          {
            name: "AI Testimonial & Quote Card Studio",
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
    <div className="bg-white text-slate-900 dark:bg-[#0F1523] dark:text-white">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(schema).replace(/</g, "\\u003c"),
        }}
      />

      {/* COMPACT UNIFIED HERO WITH LEFT CONTENT & RIGHT AUTO-CYCLING TESTIMONIAL SHOWCASE */}
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
              AI Testimonial &amp; Quote Card Studio
            </span>
          </nav>

          <div className="grid items-center gap-8 lg:grid-cols-[minmax(0,1.25fr)_minmax(0,0.95fr)]">
            {/* LEFT HERO COLUMN */}
            <div>
              <div className="mb-3 inline-flex flex-wrap items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-xs font-bold text-white backdrop-blur-xs">
                <PlatformBrandIcon
                  slugOrText="quote-stat-testimonial-card-studio"
                  size={18}
                />
                <span>#1 Free AI Testimonial &amp; Quote Card Studio</span>
                <span className="inline-flex items-center gap-0.5 text-amber-300">
                  <Star size={12} fill="currentColor" /> 4.9/5
                </span>
              </div>

              <p className="text-xs font-bold uppercase tracking-widest text-[#b4c3ff]">
                CUSTOMER QUOTE GRAPHICS · B2B SOCIAL PROOF · FOUNDER MEMOS
              </p>

              <h1 className="mt-3 text-3xl font-black leading-tight sm:text-4xl lg:text-5xl">
                AI Testimonial Card Generator:{" "}
                <span className={toolHeroHeading}>
                  Customer Quote Graphics
                </span>
              </h1>

              <p className="mt-4 max-w-2xl text-base leading-relaxed text-slate-200">
                Turn a customer quote, case study stat, or article insight into
                a polished, on-brand testimonial card. Add a portrait photo,
                pick your brand hex colors and logo, highlight key outcome
                words, and export in high resolution—100% free to use.
              </p>

              {/* PRIMARY BUTTON = USE TOOL NOW, SECONDARY = DO IT AI / CUSTOMIZE / DOWNLOAD */}
              <PortableToolHeroBar
                slug="quote-stat-testimonial-card-studio"
                title="AI Testimonial Card & Customer Quote Graphic Generator"
                path="/tools/quote-stat-testimonial-card-studio"
                primaryLabel="Use Tool Now — Create Testimonial Card"
                workspaceId="tool-studio-workspace"
              />
            </div>

            {/* RIGHT HERO COLUMN: LIVE AUTO-CYCLING MALE EXECUTIVE TESTIMONIAL CARDS */}
            <div>
              <HeroAnimatedTestimonialShowcase />
            </div>
          </div>
        </div>
      </header>

      {/* INTERACTIVE STUDIO WORKSPACE */}
      <QuoteStatTestimonialCardStudioClient />

      {/* 50-WORD QUICK ANSWER BOX FOR GOOGLE AI OVERVIEWS & PERPLEXITY */}
      <section className={section}>
        <div className="rounded-3xl border border-slate-200 bg-slate-50/80 p-7 dark:border-slate-800 dark:bg-slate-900/80">
          <p className="text-xs font-bold uppercase tracking-widest text-[#3452d1] dark:text-blue-300">
            Quick Answer · Customer Quote Graphics &amp; Social Proof
          </p>
          <h2 className="mt-2 text-2xl font-black sm:text-3xl">
            How to Design High-Converting Customer Testimonial Cards
          </h2>
          <p className={prose}>
            To create a customer testimonial card that lifts landing page and
            LinkedIn conversions, pair a{" "}
            <strong>clear 18–36 word customer quote</strong> with{" "}
            <strong>brand-colored phrase highlighting</strong> on the specific
            ROI outcome, a{" "}
            <strong>front-facing portrait photo</strong>,{" "}
            <strong>verified 5-star attribution</strong> (name, role, and
            company logo), and export in{" "}
            <strong>1:1 Square, 4:5 Feed, or 16:9 Sales Deck</strong> format.
          </p>
        </div>
      </section>

      {/* HOW DOES IT WORK? (3-STEP VISUAL WORKFLOW) */}
      <section
        className={`${section} border-t border-slate-200 dark:border-slate-800`}
      >
        <div className="text-center">
          <p className="text-xs font-extrabold uppercase tracking-widest text-[#3452d1] dark:text-blue-300">
            Simple 3-Step Workflow
          </p>
          <h2 className="mt-2 text-3xl font-black sm:text-4xl">
            How does the AI Testimonial Card Generator work?
          </h2>
          <p className="mx-auto mt-3 max-w-2xl text-sm text-slate-600 dark:text-slate-300">
            Go from raw client feedback or an article URL to a studio-grade
            customer quote graphic in under 60 seconds.
          </p>
        </div>

        <div className="mt-10 grid gap-6 md:grid-cols-3">
          {[
            {
              num: "1",
              title: "Add your photo or choose a portrait",
              body: "Upload a front-facing photo of the customer being quoted (or your own founder portrait), upload your company logo, or click one of our 4 ready-made male executive portraits.",
            },
            {
              num: "2",
              title: "Enter the quote & brand details",
              body: "Paste the customer quote or extract 5 quotes from any URL. Add the customer's name, title, and company, highlight the key ROI phrase, and pick your brand hex colors.",
            },
            {
              num: "3",
              title: "Download your testimonial card",
              body: "Your testimonial graphic renders live on the HD canvas. Download immediately in high-resolution PNG, scalable vector SVG, or print-ready PDF for your website, sales deck, or LinkedIn.",
            },
          ].map((step) => (
            <div
              key={step.num}
              className="rounded-3xl border border-slate-200 bg-white p-6 shadow-xs dark:border-slate-800 dark:bg-slate-900/80"
            >
              <div className="flex items-center gap-3">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#EA580C] to-[#F97316] text-sm font-black text-white shadow">
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

      {/* WHAT MAKES IT SPECIAL? (3 DEEP-DIVE CARDS + COMPETITOR COMPARISON TABLE) */}
      <section
        className={`${section} border-t border-slate-200 dark:border-slate-800`}
      >
        <div className="text-center">
          <p className="text-xs font-extrabold uppercase tracking-widest text-[#3452d1] dark:text-blue-300">
            Industrial-Grade Visual Studio
          </p>
          <h2 className="mt-2 text-3xl font-black sm:text-4xl">
            What makes our Testimonial &amp; Quote Card Studio special?
          </h2>
        </div>

        <div className="mt-10 grid gap-6 md:grid-cols-3">
          <div className="rounded-3xl border border-slate-200 bg-slate-50/70 p-6 dark:border-slate-800 dark:bg-slate-900">
            <MessageSquareQuote className="text-[#3452d1]" size={26} />
            <h3 className="mt-4 text-xl font-black">
              Designed for customer quotes, not generic captions
            </h3>
            <p className="mt-2 text-sm leading-7 text-slate-600 dark:text-slate-300">
              Every template features a dedicated quote hierarchy, executive
              portrait framing, verified star badges, customer name and title
              attribution, and two customizable proof pills purpose-built for B2B
              and e-commerce social proof.
            </p>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-slate-50/70 p-6 dark:border-slate-800 dark:bg-slate-900">
            <Palette className="text-[#EA580C]" size={26} />
            <h3 className="mt-4 text-xl font-black">
              Your brand colors &amp; logo applied throughout
            </h3>
            <p className="mt-2 text-sm leading-7 text-slate-600 dark:text-slate-300">
              Pick your company&apos;s exact hex colors from the color wheel and
              upload your logo. The studio applies your brand palette
              consistently across the quote highlight ribbon, stars, trust
              badges, avatar ring, and footer bar.
            </p>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-slate-50/70 p-6 dark:border-slate-800 dark:bg-slate-900">
            <Layers className="text-emerald-500" size={26} />
            <h3 className="mt-4 text-xl font-black">
              Built for B2B &amp; social distribution channels
            </h3>
            <p className="mt-2 text-sm leading-7 text-slate-600 dark:text-slate-300">
              Switch effortlessly between <strong>1:1 Square</strong> (website
              grids &amp; Instagram), <strong>4:5 Portrait</strong> (maximum
              LinkedIn mobile feed real estate), and{" "}
              <strong>16:9 Landscape</strong> (sales decks, case studies &amp;
              email headers).
            </p>
          </div>
        </div>

        {/* COMPETITOR COMPARISON TABLE */}
        <div className="mt-10 overflow-x-auto rounded-3xl border border-slate-200 dark:border-slate-800">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-100 text-xs font-extrabold uppercase text-slate-700 dark:bg-slate-950 dark:text-slate-200">
              <tr>
                <th className="px-4 py-3.5">Capability</th>
                <th className="px-4 py-3.5 text-[#3452d1] dark:text-blue-300">
                  DoItWithAI Testimonial &amp; Quote Studio
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
                  13 Templates (Split Portrait, 5-Star, Tweet, Memo, KPI Stat)
                </td>
                <td className="px-4 py-3.5">1–2 static layouts</td>
                <td className="px-4 py-3.5">Requires manual layout alignment</td>
              </tr>
              <tr>
                <td className="px-4 py-3.5 font-bold">
                  Custom Portrait &amp; Brand Logo Upload
                </td>
                <td className="px-4 py-3.5 font-semibold text-emerald-600 dark:text-emerald-400">
                  Instant Local Upload + 4 Executive Male Presets
                </td>
                <td className="px-4 py-3.5">Requires account signup &amp; queue</td>
                <td className="px-4 py-3.5">Manual masking &amp; cropping</td>
              </tr>
              <tr>
                <td className="px-4 py-3.5 font-bold">
                  URL-to-Quote AI Extraction
                </td>
                <td className="px-4 py-3.5 font-semibold text-emerald-600 dark:text-emerald-400">
                  Pulls 5 quotable wins from any blog or case study URL
                </td>
                <td className="px-4 py-3.5">Manual copy-paste only</td>
                <td className="px-4 py-3.5">Not supported</td>
              </tr>
              <tr>
                <td className="px-4 py-3.5 font-bold">
                  Export Formats &amp; Pricing
                </td>
                <td className="px-4 py-3.5 font-semibold text-emerald-600 dark:text-emerald-400">
                  100% Free · Instant PNG, Vector SVG, PDF &amp; Portable App
                </td>
                <td className="px-4 py-3.5">$19–$49/mo subscription</td>
                <td className="px-4 py-3.5">$15+/mo + design time</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      {/* STRATEGIC "DO IT WITH AI" (/do-it-ai) NATURAL WORKFLOW INTEGRATION */}
      <section
        className={`${section} border-t border-slate-200 dark:border-slate-800`}
      >
        <div className="rounded-3xl border-2 border-[#3452d1]/30 bg-gradient-to-br from-[#0B1325] via-[#111C35] to-[#19284C] p-7 text-white shadow-2xl sm:p-10">
          <div className="grid items-center gap-8 lg:grid-cols-12">
            <div className="lg:col-span-8">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-500/20 px-3.5 py-1 text-xs font-extrabold uppercase tracking-wider text-blue-300 ring-1 ring-blue-400/30">
                <Sparkles size={13} /> Do It With AI · Unified Multi-Tool Command Center
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
                . Ask the <strong>Do It AI</strong> agent to extract customer
                outcomes from a raw transcript, format a high-converting{" "}
                <Link
                  href="/tools/linkedin-post-formatter"
                  className="font-bold text-blue-300 underline hover:text-white"
                >
                  LinkedIn hook
                </Link>
                , generate your{" "}
                <Link
                  href="/tools/google-review-link-generator"
                  className="font-bold text-blue-300 underline hover:text-white"
                >
                  Google Review QR link
                </Link>
                , and launch this Testimonial Card Studio with pre-filled quotes.
              </p>
              <div className="mt-5 flex flex-wrap gap-3 text-xs font-bold text-slate-200">
                <span className="inline-flex items-center gap-1.5 rounded-xl bg-white/10 px-3 py-1.5">
                  <CheckCircle2 size={14} className="text-emerald-400" />
                  104 Connected AI SEO &amp; Visual Tools
                </span>
                <span className="inline-flex items-center gap-1.5 rounded-xl bg-white/10 px-3 py-1.5">
                  <CheckCircle2 size={14} className="text-emerald-400" />
                  952+ Ready-Made Marketing Prompts
                </span>
                <span className="inline-flex items-center gap-1.5 rounded-xl bg-white/10 px-3 py-1.5">
                  <CheckCircle2 size={14} className="text-emerald-400" />
                  Zero Signup · Instant Browser Execution
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
              <Link
                href="/tools/google-review-link-generator"
                className="inline-flex items-center justify-between rounded-xl border border-white/15 bg-white/5 px-4 py-2.5 text-xs font-bold text-slate-200 transition hover:bg-white/10"
              >
                <span>Collect More 5★ Google Reviews</span>
                <ArrowRight size={14} />
              </Link>
              <Link
                href="/tools/blog-to-linkedin-carousel"
                className="inline-flex items-center justify-between rounded-xl border border-white/15 bg-white/5 px-4 py-2.5 text-xs font-bold text-slate-200 transition hover:bg-white/10"
              >
                <span>Build a 10-Slide LinkedIn Carousel</span>
                <ArrowRight size={14} />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* DISTINCT PROMOTIONAL CARDS SECTION 1: READY-MADE AI PROMPT PACKS (IMAGE + TERMINAL SNIPPET STYLE) */}
      <section
        className={`${section} border-t border-slate-200 dark:border-slate-800`}
      >
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-purple-500/10 px-3 py-1 text-xs font-extrabold uppercase tracking-wider text-purple-600 dark:text-purple-300">
              <Terminal size={13} /> Ready-Made Prompt Libraries
            </span>
            <h2 className="mt-2 text-2xl font-black sm:text-3xl">
              Copy-Paste AI Prompt Packs for Testimonials, LinkedIn &amp; Visual Proof
            </h2>
          </div>
          <Link
            href="/prompts"
            className="inline-flex items-center gap-1 text-xs font-extrabold text-[#3452d1] underline dark:text-blue-300"
          >
            Browse All 952+ Prompts <ArrowRight size={14} />
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
                    className="h-full w-full object-cover opacity-85 transition duration-300 hover:scale-105"
                  />
                  <span className="absolute top-3 left-3 rounded-full bg-purple-600/95 px-3 py-1 text-[10px] font-black uppercase tracking-wider text-white shadow">
                    {card.badge}
                  </span>
                </div>
                <div className="p-5">
                  <h3 className="text-base font-black leading-snug text-white">
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

      {/* DISTINCT PROMOTIONAL CARDS SECTION 2: EDITORIAL BLOG & STRATEGY GUIDES (MAGAZINE ARTICLE CARD STYLE) */}
      <section
        className={`${section} border-t border-slate-200 dark:border-slate-800`}
      >
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-500/10 px-3 py-1 text-xs font-extrabold uppercase tracking-wider text-[#3452d1] dark:text-blue-300">
              <BookOpen size={13} /> Editorial Playbooks &amp; Blog Guides
            </span>
            <h2 className="mt-2 text-2xl font-black sm:text-3xl">
              Deep-Dive SEO, Content Distribution &amp; Social Proof Guides
            </h2>
          </div>
          <Link
            href="/guides"
            className="inline-flex items-center gap-1 text-xs font-extrabold text-[#3452d1] underline dark:text-blue-300"
          >
            View All Editorial Guides <ArrowRight size={14} />
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
                    className="h-full w-full object-cover transition duration-300 hover:scale-105"
                  />
                </div>
                <div className="p-6">
                  <span className="text-[11px] font-extrabold uppercase tracking-wider text-[#3452d1] dark:text-blue-300">
                    {post.category}
                  </span>
                  <h3 className="mt-2 text-lg font-black leading-snug text-slate-900 dark:text-white">
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

      {/* DISTINCT PROMOTIONAL CARDS SECTION 3: FREE AI COURSES & LEARN-AND-EARN TRACKS (CURRICULUM MODULE STYLE) */}
      <section
        className={`${section} border-t border-slate-200 dark:border-slate-800`}
      >
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-extrabold uppercase tracking-wider text-emerald-600 dark:text-emerald-300">
              <GraduationCap size={14} /> Free AI Courses &amp; Learn-and-Earn Tracks
            </span>
            <h2 className="mt-2 text-2xl font-black sm:text-3xl">
              Build, Customize &amp; Monetize AI Workflows Step by Step
            </h2>
          </div>
          <Link
            href="/ai-learn-earn"
            className="inline-flex items-center gap-1 text-xs font-extrabold text-emerald-600 underline dark:text-emerald-300"
          >
            Explore All Learning Tracks <ArrowRight size={14} />
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
                  <Wand2 size={16} className="text-emerald-600 dark:text-emerald-400" />
                </div>
                <h3 className="mt-3.5 text-lg font-black leading-snug text-slate-900 dark:text-white">
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
        title="AI Testimonial Card & Customer Quote Studio FAQs"
        faqs={faqs}
      />
    </div>
  );
}
