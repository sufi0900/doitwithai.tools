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
  Terminal,
  Wand2,
} from "lucide-react";
import QuoteStatTestimonialCardStudioClient from "@/features/quote-stat-testimonial-card-studio/QuoteStatTestimonialCardStudioClient";
import HeroAnimatedTestimonialShowcase from "@/features/quote-stat-testimonial-card-studio/HeroAnimatedTestimonialShowcase";
import { QUOTE_TEMPLATES } from "@/features/quote-stat-testimonial-card-studio/model";
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
const title = "Free Testimonial Card Generator: Add Your Photo, Logo & Colors";
const description =
  "Make branded testimonial cards, quote graphics and social proof images free. Upload a customer photo (background removed automatically), add your logo, pick brand colors and export PNG, SVG or PDF.";
const templateCount = QUOTE_TEMPLATES.length;

export const metadata: Metadata = {
  title,
  description,
  keywords: [
    "testimonial card generator",
    "free testimonial graphic maker",
    "customer review card maker",
    "social proof graphic generator",
    "quote card maker",
    "AI testimonial generator",
    "testimonial template",
    "do it with AI",
  ],
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
    question: "What is a testimonial card generator and how does it work?",
    answer:
      "A testimonial card generator turns a customer quote, review or case-study line into a designed graphic you can post or embed. In this studio you paste or type the quote, add the customer's photo and your logo, choose a template and brand colors, then download the card as PNG, SVG or PDF.",
  },
  {
    question: "Can I upload my own customer photo and company logo?",
    answer:
      "Yes. Upload a JPG, PNG or WEBP photo and it is placed into every template. Upload your logo and it replaces the default badge in every template too. You can also start from one of the ready-made portraits.",
  },
  {
    question: "Does it remove the photo background automatically?",
    answer:
      "Yes. When you upload a photo, the studio cuts out the person and fits them into the template, so the card looks designed rather than pasted. This runs in your browser and your photo is never uploaded to our servers. If your browser cannot run it, the original photo is used instead.",
  },
  {
    question: "Is the testimonial card maker really free? Is there a watermark?",
    answer:
      "It is free to use with no signup, and exports carry no watermark. The footer badge on a card shows your own logo, or any text you type into the brand field.",
  },
  {
    question: "Which sizes and formats can I export?",
    answer:
      "Choose 1:1 square (1080×1080) for websites and Instagram, 4:5 (1080×1350) for LinkedIn and feed posts, or 16:9 (1600×900) for sales decks and case studies. Export as PNG, vector SVG or print-ready PDF, or download every card at once as a ZIP.",
  },
  {
    question: "Can I highlight key words in my brand color?",
    answer:
      "Yes. Type the phrase into the highlight box, or wrap words in **double asterisks** inside the quote. The phrase is shown in your accent color with a soft highlight behind it.",
  },
  {
    question: "Can I use made-up or sample testimonials?",
    answer:
      "Use only real customer words that you have permission to publish. Regulators such as the US FTC treat fake reviews as deceptive. The people and quotes in our hero and default text are sample designs for illustration only, so replace them with your own before publishing.",
  },
  {
    question: "Can it pull quotes from a blog post or case study URL?",
    answer:
      "Yes. Paste a public article or case-study URL into the extractor at the top of the studio to pull quotable lines, then preview them across all templates.",
  },
  {
    question: "How do I get good testimonials to put on cards?",
    answer:
      "Ask for a specific result in one or two sentences, with a name, role and permission to publish. Our Google review link generator and testimonial prompt packs linked below help you collect and shape them.",
  },
  {
    question: "Can I also do this inside Do It AI?",
    answer:
      "Yes. Open the studio from the Do It AI workspace to turn a raw client transcript into short quotes with the Do It AI agent, then design the cards here.",
  },
];

const USE_CASES = [
  {
    title: "SaaS & B2B landing pages",
    body: "Put a named customer and a one-line result above the fold, in a card sized to your site grid.",
  },
  {
    title: "Agencies & freelancers",
    body: "Turn client feedback into case-study cards and LinkedIn posts without opening a design tool.",
  },
  {
    title: "Local businesses",
    body: "Convert Google reviews into square cards for Instagram, Facebook and Google Business posts.",
  },
  {
    title: "Coaches, courses & creators",
    body: "Show student results as portrait cards on sales pages, emails and launch decks.",
  },
  {
    title: "E-commerce stores",
    body: "Add product review cards to product pages, ads and email campaigns.",
  },
  {
    title: "Founders & marketers",
    body: "Publish founder memos, KPI callouts and verified-post style cards for LinkedIn and X.",
  },
];

const PROMPT_PROMO_CARDS = [
  {
    badge: "83 B2B & LINKEDIN PROMPTS",
    title: "LinkedIn Personal Branding, Carousels & Social Proof Prompts",
    desc: "Copy-paste prompt frameworks to turn customer wins, founder memos and case-study numbers into high-dwell LinkedIn posts.",
    image: "/prompts/linkedin-personal-branding-b2b-prompts-hero-v2.webp",
    snippet:
      "Act as a B2B Ghostwriter. Turn this client review into a 3-sentence founder story + a testimonial card hook...",
    href: "/prompts/linkedin-personal-branding-b2b-prompts",
    cta: "Open LinkedIn Prompt Pack",
  },
  {
    badge: "87 REPURPOSING PROMPTS",
    title: "Content Repurposing & Social Quote Extraction Prompt Library",
    desc: "Extract standalone quote cards, myth-vs-reality slides and newsletter callouts from any long-form post.",
    image: "/prompts/content-repurposing-prompts-hero-v2.webp",
    snippet:
      "Extract the 5 most quotable, stat-backed takeaways from [Article Text] and pair each with a 6-word highlight ribbon...",
    href: "/prompts/content-repurposing-social-media-prompts",
    cta: "Open Repurposing Prompts",
  },
  {
    badge: "77 VISUAL & CHART PROMPTS",
    title: "Infographic, Data Visualization & KPI Stat Card Prompts",
    desc: "Structure benchmark data, before-and-after metrics and 2×2 matrices for visual proof cards.",
    image: "/prompts/infographic-data-visualization-prompts-hero-v2.webp",
    snippet:
      "Convert these 4 case-study metrics into an oversized KPI stat callout with a 15-word proof statement...",
    href: "/prompts/infographic-data-visualization-prompts",
    cta: "Open Visual Prompt Pack",
  },
];

const BLOG_GUIDE_CARDS = [
  {
    category: "Editorial Strategy Guide · 8 Min Read",
    title: "How to Check Google Keyword Rankings & Turn Wins into Social Proof",
    summary:
      "Verify Search Console ranking jumps and package your traffic milestones into testimonial and KPI cards.",
    image: "/images/articles/check-google-keyword-rankings.jpg",
    author: "Sufian Mustafa",
    href: "/guides",
    cta: "Explore SEO & Content Guides",
  },
  {
    category: "Content & AEO Playbook · 7 Min Read",
    title: "What to Do After Keyword Research: From Topic Clusters to Visual Proof",
    summary:
      "Why strong pages pair quick answers, original data and embedded customer quote graphics.",
    image: "/images/articles/what-to-do-after-keyword-research.jpg",
    author: "Sufian Mustafa",
    href: "/ai-seo",
    cta: "Read AI SEO Playbooks",
  },
  {
    category: "Visual Tool Reviews · 6 Min Read",
    title: "Best AI Tools for Visual Content, Testimonials & B2B Distribution",
    summary:
      "Compare browser-based visual studios, quote extractors and multi-channel card generators for lean teams.",
    image: "/prompts/ai-search-aeo-geo-prompts-hero-v2.webp",
    author: "Sufian Mustafa",
    href: "/ai-tools",
    cta: "Browse AI Tool Reviews",
  },
];

const COURSE_LEARNING_CARDS = [
  {
    level: "Free Track · 4 Modules",
    title: "Learn & Earn with AI: Build Visual Social Proof Assets",
    outcome:
      "Turn client reviews, podcasts and articles into social proof packages you can offer as a service.",
    modules: [
      "Module 1: Extracting high-trust quotes & KPIs",
      "Module 2: Brand color psychology & portrait framing",
      "Module 3: LinkedIn, sales deck & landing page placement",
    ],
    href: "/ai-learn-earn",
    cta: "Start Learn & Earn Track",
  },
  {
    level: "No-Code Builder Track · 5 Modules",
    title: "Vibe-Coding & Customizing Standalone AI Marketing Tools",
    outcome:
      "Download a portable tool from the catalog, customize its colors and API keys, and deploy it on your own site.",
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
      "See how the free SEO, content and visual studios connect inside the Do It AI workspace.",
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
  { slug: "google-review-link-generator", label: "Google Review Link & QR Generator", why: "Collect the reviews you turn into cards" },
  { slug: "blog-to-linkedin-carousel", label: "LinkedIn PDF Carousel Studio", why: "Turn the cards into a swipeable carousel" },
  { slug: "pinterest-pin-visual-generator", label: "Pinterest 1000×1500 Pin Studio", why: "Make tall pins from the same quotes" },
  { slug: "data-to-chart-visual-card-maker", label: "Data & KPI Chart Maker", why: "Back a quote with a result chart" },
  { slug: "linkedin-post-formatter", label: "LinkedIn Post Formatter", why: "Write the caption that goes with the card" },
  { slug: "local-business-schema-generator", label: "LocalBusiness Schema Generator", why: "Mark up the reviews on your page" },
];

const section = "mx-auto max-w-6xl px-4 py-14 sm:px-6";
const prose = "mt-4 text-base leading-8 text-slate-600 dark:text-slate-300";

export default function QuoteStatTestimonialCardStudioPage() {
  const schema = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebApplication",
        name: "Free Testimonial Card Generator",
        alternateName: [
          "AI Testimonial Card Generator",
          "Customer Quote Graphic Maker",
          "Social Proof Graphic Generator",
          "Do It With AI Testimonial Studio",
        ],
        url: pageUrl,
        description,
        applicationCategory: "DesignApplication",
        operatingSystem: "Any",
        browserRequirements: "Requires JavaScript",
        isAccessibleForFree: true,
        featureList: [
          `${templateCount} testimonial and quote card templates`,
          "Customer photo upload with automatic background removal",
          "Brand logo and brand color customization",
          "1:1, 4:5 and 16:9 sizes",
          "PNG, SVG and PDF export",
        ],
        offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
      },
      {
        "@type": "HowTo",
        name: "How to make a testimonial card in 3 steps",
        description:
          "Turn a customer quote into a branded testimonial graphic you can publish.",
        step: [
          {
            "@type": "HowToStep",
            position: 1,
            name: "Add the customer photo and your logo",
            text: "Upload the customer's photo (the background is removed automatically) and your logo, or pick a ready-made portrait.",
          },
          {
            "@type": "HowToStep",
            position: 2,
            name: "Enter the quote and choose a template",
            text: "Type the quote, highlight the key result, add name, role and proof pills, then pick one of the templates and your brand colors.",
          },
          {
            "@type": "HowToStep",
            position: 3,
            name: "Download the card",
            text: "Export as PNG, SVG or PDF in square, 4:5 or 16:9, or download every card as a ZIP.",
          },
        ],
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { name: "Home", item: "https://doitwithai.tools" },
          { name: "Tools", item: "https://doitwithai.tools/tools" },
          { name: "Testimonial Card Generator", item: pageUrl },
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

      {/* HERO: content left, animated sample cards right */}
      <header className={`relative overflow-hidden ${toolHeroSurface} text-white`}>
        <ToolHeroBackground />
        <div className="relative mx-auto max-w-6xl px-4 py-6 sm:px-6 sm:py-8">
          <nav aria-label="Breadcrumb" className="mb-4 flex flex-wrap gap-2 text-xs text-slate-300">
            <Link href="/">Home</Link>
            <span>/</span>
            <Link href="/tools">Tools</Link>
            <span>/</span>
            <span aria-current="page">Testimonial Card Generator</span>
          </nav>

          <div className="grid items-center gap-8 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)]">
            <div>
              <div className="mb-3 inline-flex flex-wrap items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-xs font-bold text-white backdrop-blur-xs">
                <PlatformBrandIcon slugOrText="quote-stat-testimonial-card-studio" size={18} />
                <span>Free · No signup · No watermark</span>
              </div>

              <p className="text-xs font-bold uppercase tracking-widest text-[#b4c3ff]">
                TESTIMONIAL CARDS · QUOTE GRAPHICS · SOCIAL PROOF
              </p>

              <h1 className="mt-3 text-3xl font-black leading-tight sm:text-4xl lg:text-5xl">
                Free Testimonial Card Generator:{" "}
                <span className={toolHeroHeading}>Your Photo, Logo &amp; Colors</span>
              </h1>

              <p className="mt-4 max-w-2xl text-base leading-relaxed text-slate-200">
                Turn a customer quote into a polished, on-brand testimonial card.
                Upload the customer&apos;s photo and we remove the background for
                you, add your logo, pick your colors, choose from {templateCount}{" "}
                layouts and export in high resolution.
              </p>

              <PortableToolHeroBar
                slug="quote-stat-testimonial-card-studio"
                title="Free Testimonial Card Generator"
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

      <QuoteStatTestimonialCardStudioClient />

      {/* QUICK ANSWER */}
      <section className={section}>
        <div className="rounded-3xl border border-slate-200 bg-slate-50/80 p-7 dark:border-slate-800 dark:bg-slate-900/80">
          <p className="text-xs font-bold uppercase tracking-widest text-[#3452d1] dark:text-blue-300">
            Quick answer · testimonial graphics
          </p>
          <h2 className="mt-2 text-2xl font-black sm:text-3xl">
            How do you design a testimonial card that gets trusted?
          </h2>
          <p className={prose}>
            Keep the <strong>quote to 18–36 words</strong>, highlight the{" "}
            <strong>specific result</strong> in your brand color, show a real{" "}
            <strong>front-facing photo</strong>, and add{" "}
            <strong>name, role and company</strong> so readers can verify it.
            Export <strong>square for your site, 4:5 for LinkedIn</strong> and{" "}
            <strong>16:9 for decks</strong>. Always use real quotes you have
            permission to publish.
          </p>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className={`${section} border-t border-slate-200 dark:border-slate-800`}>
        <div className="text-center">
          <p className="text-xs font-extrabold uppercase tracking-widest text-[#3452d1] dark:text-blue-300">
            Simple 3-step workflow
          </p>
          <h2 className="mt-2 text-3xl font-black sm:text-4xl">
            How does the testimonial card generator work?
          </h2>
          <p className="mx-auto mt-3 max-w-2xl text-sm text-slate-600 dark:text-slate-300">
            From raw customer feedback to a designed card in about a minute.
          </p>
        </div>
        <div className="mt-10 grid gap-6 md:grid-cols-3">
          {[
            { num: "1", title: "Add the photo and your logo", body: "Upload the customer's photo and the background is removed automatically. Add your logo, or pick a ready-made portrait." },
            { num: "2", title: "Enter the quote, pick a layout", body: "Paste the quote or pull lines from a URL, highlight the result, add name, role and proof pills, then choose a template and brand colors." },
            { num: "3", title: "Download your card", body: "Export PNG, SVG or PDF in square, 4:5 or 16:9, or grab every card at once as a ZIP." },
          ].map((step) => (
            <div key={step.num} className="rounded-3xl border border-slate-200 bg-white p-6 shadow-xs dark:border-slate-800 dark:bg-slate-900/80">
              <div className="flex items-center gap-3">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#3452d1] to-[#5271ff] text-sm font-black text-white shadow">
                  {step.num}
                </span>
                <h3 className="text-lg font-black">{step.title}</h3>
              </div>
              <p className="mt-3 text-sm leading-7 text-slate-600 dark:text-slate-300">{step.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* TEMPLATES (keyword-rich, links to the studio) */}
      <section className={`${section} border-t border-slate-200 dark:border-slate-800`}>
        <div className="text-center">
          <p className="text-xs font-extrabold uppercase tracking-widest text-[#3452d1] dark:text-blue-300">
            {templateCount} testimonial card templates
          </p>
          <h2 className="mt-2 text-3xl font-black sm:text-4xl">
            Testimonial templates for every channel
          </h2>
        </div>
        <ul className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {QUOTE_TEMPLATES.map((t) => (
            <li key={t.id} className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4 dark:border-slate-800 dark:bg-slate-900">
              <h3 className="text-sm font-black">{t.label}</h3>
              <p className="mt-1 text-xs leading-6 text-slate-600 dark:text-slate-300">{t.desc}</p>
            </li>
          ))}
        </ul>
      </section>

      {/* USE CASES */}
      <section className={`${section} border-t border-slate-200 dark:border-slate-800`}>
        <div className="text-center">
          <h2 className="text-3xl font-black sm:text-4xl">
            Who uses a customer quote graphic maker?
          </h2>
        </div>
        <div className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {USE_CASES.map((u) => (
            <div key={u.title} className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900/80">
              <h3 className="text-base font-black">{u.title}</h3>
              <p className="mt-1.5 text-sm leading-7 text-slate-600 dark:text-slate-300">{u.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* WHAT MAKES IT SPECIAL + COMPARISON */}
      <section className={`${section} border-t border-slate-200 dark:border-slate-800`}>
        <div className="text-center">
          <p className="text-xs font-extrabold uppercase tracking-widest text-[#3452d1] dark:text-blue-300">
            Built for real use
          </p>
          <h2 className="mt-2 text-3xl font-black sm:text-4xl">
            What makes this testimonial maker different?
          </h2>
        </div>

        <div className="mt-10 grid gap-6 md:grid-cols-3">
          <div className="rounded-3xl border border-slate-200 bg-slate-50/70 p-6 dark:border-slate-800 dark:bg-slate-900">
            <MessageSquareQuote className="text-[#3452d1]" size={26} />
            <h3 className="mt-4 text-xl font-black">Made for customer quotes</h3>
            <p className="mt-2 text-sm leading-7 text-slate-600 dark:text-slate-300">
              Every template has a quote hierarchy, portrait framing, star rating,
              verified name line and proof pills built for social proof.
            </p>
          </div>
          <div className="rounded-3xl border border-slate-200 bg-slate-50/70 p-6 dark:border-slate-800 dark:bg-slate-900">
            <Palette className="text-[#EA580C]" size={26} />
            <h3 className="mt-4 text-xl font-black">Your logo and colors everywhere</h3>
            <p className="mt-2 text-sm leading-7 text-slate-600 dark:text-slate-300">
              Pick exact hex colors and upload your logo. The same brand styling
              carries across the highlight, stars, pills, avatar ring and footer.
            </p>
          </div>
          <div className="rounded-3xl border border-slate-200 bg-slate-50/70 p-6 dark:border-slate-800 dark:bg-slate-900">
            <Layers className="text-emerald-500" size={26} />
            <h3 className="mt-4 text-xl font-black">Sized for where it is posted</h3>
            <p className="mt-2 text-sm leading-7 text-slate-600 dark:text-slate-300">
              <strong>Square</strong> for site grids and Instagram, <strong>4:5</strong> for
              LinkedIn mobile feeds, <strong>16:9</strong> for decks, case studies and emails.
            </p>
          </div>
        </div>

        <div className="mt-10 overflow-x-auto rounded-3xl border border-slate-200 dark:border-slate-800">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-100 text-xs font-extrabold uppercase text-slate-700 dark:bg-slate-950 dark:text-slate-200">
              <tr>
                <th className="px-4 py-3.5">Capability</th>
                <th className="px-4 py-3.5 text-[#3452d1] dark:text-blue-300">This studio</th>
                <th className="px-4 py-3.5">Typical paid generators</th>
                <th className="px-4 py-3.5">Manual design software</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 bg-white dark:divide-slate-800 dark:bg-slate-900">
              <tr>
                <td className="px-4 py-3.5 font-bold">Templates</td>
                <td className="px-4 py-3.5 font-semibold text-emerald-600 dark:text-emerald-400">{templateCount} portrait-ready layouts</td>
                <td className="px-4 py-3.5">Often 1–2 layouts</td>
                <td className="px-4 py-3.5">You build each layout</td>
              </tr>
              <tr>
                <td className="px-4 py-3.5 font-bold">Photo &amp; logo</td>
                <td className="px-4 py-3.5 font-semibold text-emerald-600 dark:text-emerald-400">Upload, auto background removal, applied to every template</td>
                <td className="px-4 py-3.5">Often needs an account</td>
                <td className="px-4 py-3.5">Manual masking and cropping</td>
              </tr>
              <tr>
                <td className="px-4 py-3.5 font-bold">Quote from a URL</td>
                <td className="px-4 py-3.5 font-semibold text-emerald-600 dark:text-emerald-400">Pull quotable lines from a blog or case study</td>
                <td className="px-4 py-3.5">Usually copy-paste only</td>
                <td className="px-4 py-3.5">Not supported</td>
              </tr>
              <tr>
                <td className="px-4 py-3.5 font-bold">Export &amp; price</td>
                <td className="px-4 py-3.5 font-semibold text-emerald-600 dark:text-emerald-400">Free · PNG, SVG, PDF, ZIP of all cards</td>
                <td className="px-4 py-3.5">Monthly subscription</td>
                <td className="px-4 py-3.5">Subscription plus design time</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      {/* DO IT WITH AI */}
      <section className={`${section} border-t border-slate-200 dark:border-slate-800`}>
        <div className="rounded-3xl border-2 border-[#3452d1]/30 bg-gradient-to-br from-[#0B1325] via-[#111C35] to-[#19284C] p-7 text-white shadow-2xl sm:p-10">
          <div className="grid items-center gap-8 lg:grid-cols-12">
            <div className="lg:col-span-8">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-500/20 px-3.5 py-1 text-xs font-extrabold uppercase tracking-wider text-blue-300 ring-1 ring-blue-400/30">
                <Sparkles size={13} /> Do It With AI
              </span>
              <h2 className="mt-3 text-2xl font-black sm:text-3xl">
                Want to do it with AI instead of switching tabs?
              </h2>
              <p className="mt-3 text-sm leading-7 text-slate-200 sm:text-base">
                Inside the{" "}
                <Link href="/do-it-ai?tool=quote-stat-testimonial-card-studio" className="font-bold text-blue-300 underline hover:text-white">
                  Do It AI workspace
                </Link>{" "}
                you can ask the Do It AI agent to pull the strongest outcomes from a
                raw client transcript, write the{" "}
                <Link href="/tools/linkedin-post-formatter" className="font-bold text-blue-300 underline hover:text-white">
                  LinkedIn post
                </Link>
                , build a{" "}
                <Link href="/tools/google-review-link-generator" className="font-bold text-blue-300 underline hover:text-white">
                  Google review link
                </Link>{" "}
                for the next customer, and open this studio with the quotes already filled in.
              </p>
              <div className="mt-5 flex flex-wrap gap-3 text-xs font-bold text-slate-200">
                <span className="inline-flex items-center gap-1.5 rounded-xl bg-white/10 px-3 py-1.5">
                  <CheckCircle2 size={14} className="text-emerald-400" /> Connected SEO &amp; visual tools
                </span>
                <span className="inline-flex items-center gap-1.5 rounded-xl bg-white/10 px-3 py-1.5">
                  <CheckCircle2 size={14} className="text-emerald-400" /> Ready-made marketing prompts
                </span>
                <span className="inline-flex items-center gap-1.5 rounded-xl bg-white/10 px-3 py-1.5">
                  <CheckCircle2 size={14} className="text-emerald-400" /> No signup
                </span>
              </div>
            </div>
            <div className="flex flex-col gap-3 rounded-2xl border border-white/15 bg-slate-950/60 p-5 lg:col-span-4">
              <p className="text-xs font-extrabold uppercase tracking-wider text-blue-300">Connected workflows</p>
              <Link href="/do-it-ai?tool=quote-stat-testimonial-card-studio" className="inline-flex items-center justify-between rounded-xl bg-gradient-to-r from-[#3452d1] to-[#5271ff] px-4 py-3 text-xs font-black text-white shadow-lg transition hover:brightness-110">
                <span>Open in Do It AI</span>
                <ArrowRight size={15} />
              </Link>
              {RELATED_TOOLS.slice(0, 2).map((r) => (
                <Link key={r.slug} href={`/tools/${r.slug}`} className="inline-flex items-center justify-between rounded-xl border border-white/15 bg-white/5 px-4 py-2.5 text-xs font-bold text-slate-200 transition hover:bg-white/10">
                  <span>{r.label}</span>
                  <ArrowRight size={14} />
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* RELATED TOOLS (internal links) */}
      <section className={`${section} border-t border-slate-200 dark:border-slate-800`}>
        <h2 className="text-2xl font-black sm:text-3xl">Related free tools for social proof</h2>
        <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {RELATED_TOOLS.map((r) => (
            <Link key={r.slug} href={`/tools/${r.slug}`} className="group rounded-2xl border border-slate-200 bg-white p-4 transition hover:border-[#3452d1] dark:border-slate-800 dark:bg-slate-900">
              <span className="flex items-center justify-between text-sm font-black">
                {r.label}
                <ArrowRight size={14} className="text-[#3452d1] transition group-hover:translate-x-0.5" />
              </span>
              <span className="mt-1 block text-xs text-slate-600 dark:text-slate-300">{r.why}</span>
            </Link>
          ))}
        </div>
      </section>

      {/* PROMPT PACK CARDS (image + terminal snippet style) */}
      <section className={`${section} border-t border-slate-200 dark:border-slate-800`}>
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-purple-500/10 px-3 py-1 text-xs font-extrabold uppercase tracking-wider text-purple-600 dark:text-purple-300">
              <Terminal size={13} /> Ready-made prompt libraries
            </span>
            <h2 className="mt-2 text-2xl font-black sm:text-3xl">
              Copy-paste prompts for testimonials, LinkedIn &amp; visual proof
            </h2>
          </div>
          <Link href="/prompts" className="inline-flex items-center gap-1 text-xs font-extrabold text-[#3452d1] underline dark:text-blue-300">
            Browse all prompts <ArrowRight size={14} />
          </Link>
        </div>
        <div className="mt-7 grid gap-6 md:grid-cols-3">
          {PROMPT_PROMO_CARDS.map((card) => (
            <article key={card.href} className="flex flex-col justify-between overflow-hidden rounded-3xl border-2 border-purple-500/25 bg-slate-950 text-white shadow-xl transition hover:border-purple-400/60">
              <div>
                <div className="relative h-40 w-full overflow-hidden bg-slate-900">
                  <img src={card.image} alt={card.title} loading="lazy" className="h-full w-full object-cover opacity-85" />
                  <span className="absolute left-3 top-3 rounded-full bg-purple-600/95 px-3 py-1 text-[10px] font-black uppercase tracking-wider text-white shadow">
                    {card.badge}
                  </span>
                </div>
                <div className="p-5">
                  <h3 className="text-base font-black leading-snug">{card.title}</h3>
                  <p className="mt-2 text-xs leading-6 text-slate-300">{card.desc}</p>
                  <pre className="mt-3 overflow-x-auto whitespace-pre-wrap rounded-xl border border-purple-500/30 bg-slate-900/90 p-3 font-mono text-[11px] leading-5 text-purple-200">
                    {card.snippet}
                  </pre>
                </div>
              </div>
              <div className="border-t border-slate-800 px-5 py-3.5">
                <Link href={card.href} className="inline-flex w-full items-center justify-between text-xs font-black text-purple-300 hover:text-white">
                  <span>{card.cta}</span>
                  <ArrowRight size={14} />
                </Link>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* BLOG CARDS (magazine style) */}
      <section className={`${section} border-t border-slate-200 dark:border-slate-800`}>
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-500/10 px-3 py-1 text-xs font-extrabold uppercase tracking-wider text-[#3452d1] dark:text-blue-300">
              <BookOpen size={13} /> Editorial playbooks &amp; guides
            </span>
            <h2 className="mt-2 text-2xl font-black sm:text-3xl">
              SEO, content distribution &amp; social proof guides
            </h2>
          </div>
          <Link href="/guides" className="inline-flex items-center gap-1 text-xs font-extrabold text-[#3452d1] underline dark:text-blue-300">
            View all guides <ArrowRight size={14} />
          </Link>
        </div>
        <div className="mt-7 grid gap-6 md:grid-cols-3">
          {BLOG_GUIDE_CARDS.map((post) => (
            <article key={post.title} className="flex flex-col justify-between overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm transition hover:shadow-lg dark:border-slate-800 dark:bg-slate-900">
              <div>
                <div className="h-44 w-full overflow-hidden bg-slate-100 dark:bg-slate-800">
                  <img src={post.image} alt={post.title} loading="lazy" className="h-full w-full object-cover" />
                </div>
                <div className="p-6">
                  <span className="text-[11px] font-extrabold uppercase tracking-wider text-[#3452d1] dark:text-blue-300">{post.category}</span>
                  <h3 className="mt-2 text-lg font-black leading-snug">{post.title}</h3>
                  <p className="mt-2.5 text-xs leading-6 text-slate-600 dark:text-slate-300">{post.summary}</p>
                </div>
              </div>
              <div className="flex items-center justify-between border-t border-slate-100 px-6 py-4 text-xs dark:border-slate-800">
                <span className="font-semibold text-slate-500 dark:text-slate-400">By {post.author}</span>
                <Link href={post.href} className="inline-flex items-center gap-1 font-extrabold text-[#3452d1] hover:underline dark:text-blue-300">
                  <span>{post.cta}</span>
                  <ArrowRight size={13} />
                </Link>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* COURSE CARDS (curriculum style) */}
      <section className={`${section} border-t border-slate-200 dark:border-slate-800`}>
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-extrabold uppercase tracking-wider text-emerald-600 dark:text-emerald-300">
              <GraduationCap size={14} /> Free AI courses &amp; learn-and-earn tracks
            </span>
            <h2 className="mt-2 text-2xl font-black sm:text-3xl">
              Build, customize &amp; monetize AI workflows step by step
            </h2>
          </div>
          <Link href="/ai-learn-earn" className="inline-flex items-center gap-1 text-xs font-extrabold text-emerald-600 underline dark:text-emerald-300">
            Explore all tracks <ArrowRight size={14} />
          </Link>
        </div>
        <div className="mt-7 grid gap-6 md:grid-cols-3">
          {COURSE_LEARNING_CARDS.map((course) => (
            <article key={course.title} className="flex flex-col justify-between rounded-3xl border-2 border-emerald-500/25 bg-emerald-50/40 p-6 dark:border-emerald-500/30 dark:bg-emerald-950/15">
              <div>
                <div className="flex items-center justify-between gap-2">
                  <span className="rounded-full bg-emerald-600 px-3 py-1 text-[10px] font-black uppercase tracking-wider text-white">{course.level}</span>
                  <Wand2 size={16} className="text-emerald-600 dark:text-emerald-400" />
                </div>
                <h3 className="mt-3.5 text-lg font-black leading-snug">{course.title}</h3>
                <p className="mt-2 text-xs leading-6 text-slate-600 dark:text-slate-300">{course.outcome}</p>
                <ul className="mt-4 space-y-2 rounded-2xl border border-emerald-500/20 bg-white/80 p-3.5 text-xs font-semibold text-slate-700 dark:bg-slate-900/80 dark:text-slate-200">
                  {course.modules.map((m) => (
                    <li key={m} className="flex items-start gap-2">
                      <ShieldCheck size={14} className="mt-0.5 shrink-0 text-emerald-500" />
                      <span>{m}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="mt-5 pt-2">
                <Link href={course.href} className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-xs font-black text-white shadow transition hover:bg-emerald-500">
                  <span>{course.cta}</span>
                  <ArrowRight size={14} />
                </Link>
              </div>
            </article>
          ))}
        </div>
      </section>

      <ToolResources slug="quote-stat-testimonial-card-studio" />
      <ToolFaq title="Testimonial Card Generator FAQs" faqs={faqs} />
    </div>
  );
}
