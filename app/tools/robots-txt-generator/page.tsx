import {
  ToolHeroBackground,
  toolHeroSurface,
  toolHeroHeading,
} from "@/features/tool-ui/ToolHero";
import ToolResources from "@/features/tool-catalog/ToolResources";
import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowRight,
  Bot,
  CheckCircle2,
  Globe,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import RobotsClient from "@/features/robots-generator/RobotsClient";
import RobotsEducation from "@/features/robots-generator/RobotsEducation";

const pageUrl = "https://doitwithai.tools/tools/robots-txt-generator";

export const metadata: Metadata = {
  title: "Free Robots.txt Generator & AI Crawler Checker",
  description:
    "Build and validate robots.txt rules. Review crawler access and download a file for your website.",
  keywords: [
    "robots.txt generator",
    "robots.txt validator",
    "AI crawler blocker",
    "GPTBot",
    "ClaudeBot",
    "PerplexityBot",
    "Google-Extended",
    "GEO tool",
  ],
  alternates: { canonical: pageUrl },
  openGraph: {
    type: "website",
    url: pageUrl,
    title: "Free Robots.txt Generator & AI Crawler Checker",
    description:
      "Build or validate robots.txt and see which AI crawlers are allowed or blocked, with a live checklist.",
    siteName: "Do It With AI Tools",
    images: [
      {
        url: "https://doitwithai.tools/ogimage.png",
        width: 1200,
        height: 630,
        alt: "Do It With AI Tools Robots.txt Generator",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Free Robots.txt Generator & AI Crawler Checker",
    description:
      "Build or validate robots.txt with a live AI-crawler access matrix.",
    images: ["https://doitwithai.tools/ogimage.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
  other: { "ai-content-declaration": "human-created, ai-assisted" },
};

const faqs = [
  {
    question: "Can I edit the file before downloading it?",
    answer:
      "Use the supplied controls to prepare your file, review its contents, and download it when ready.",
  },
  {
    question: "Why does the AI crawler matrix list three bots per company?",
    answer:
      "Most major AI labs run a training crawler, a search/retrieval crawler for their own answer engine, and a user-triggered fetcher for pages a person explicitly asked about. They're controlled separately, and several user-triggered fetchers are documented as ignoring robots.txt by design since a person; not an autonomous crawler; requested the page.",
  },
  {
    question: "Is robots.txt a security measure?",
    answer:
      "No. It only works because well-behaved crawlers choose to respect it, and it does not hide a URL from anyone who already has the link. Use authentication or server-level access rules for anything that actually needs to stay private.",
  },
  {
    question: 'What does "Disallow:" with nothing after it mean?',
    answer:
      "It means allow everything; the opposite of what many people assume. It's the single most common hand-written robots.txt mistake, which is why this tool flags it as a note whenever it appears.",
  },
];

const structuredData = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebApplication",
      "@id": `${pageUrl}#application`,
      name: "Do It With AI Tools Robots.txt Generator",
      url: pageUrl,
      applicationCategory: "SEOApplication",
      operatingSystem: "Any",
      browserRequirements: "Requires JavaScript",
      isAccessibleForFree: true,
      offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
      description: metadata.description,
      featureList: [
        "Editable robots.txt builder",
        "Fetch and validate an existing live robots.txt",
        "AI crawler access matrix with one-click allow/block",
        "Validation checklist",
        "Copy and download",
      ],
      creator: {
        "@type": "Person",
        name: "Sufian Mustafa",
        url: "https://doitwithai.tools/author/sufian-mustafa",
      },
    },
    {
      "@type": "BreadcrumbList",
      itemListElement: [
        {
          "@type": "ListItem",
          position: 1,
          name: "Home",
          item: "https://doitwithai.tools",
        },
        {
          "@type": "ListItem",
          position: 2,
          name: "Tools",
          item: "https://doitwithai.tools/tools",
        },
        {
          "@type": "ListItem",
          position: 3,
          name: "Robots.txt Generator",
          item: pageUrl,
        },
      ],
    },
    {
      "@type": "FAQPage",
      mainEntity: faqs.map((faq) => ({
        "@type": "Question",
        name: faq.question,
        acceptedAnswer: { "@type": "Answer", text: faq.answer },
      })),
    },
  ],
};

export default function RobotsTxtGeneratorPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />

      <div className={`relative overflow-hidden ${toolHeroSurface} text-white`}
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
            <span aria-current="page">Robots.txt Generator</span>
          </nav>

          <div className="grid items-center gap-8 lg:grid-cols-[minmax(0,1.35fr)_minmax(0,0.85fr)]">
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-[#b4c3ff]">
                Technical SEO & GEO · Crawler Directives & AI Bot Matrix
              </p>
              <h1 className="mt-4 text-3xl font-black leading-tight sm:text-4xl lg:text-5xl">
                Robots.txt Generator 
                <span className={toolHeroHeading}>
                  & AI Crawler Access Matrix
                </span>
              </h1>
              <p className="mt-5 max-w-2xl text-base leading-8 text-slate-300">
                Build a clean robots.txt file from scratch or fetch your live domain's rules. Control Googlebot alongside named AI training, search, and user-fetch bots in one click.
              </p>
              <div className="mt-7 flex flex-wrap gap-3 text-xs font-semibold text-slate-200">
                <span className="rounded-lg border border-white/15 px-3 py-2">
                  Live robots.txt import & audit
                </span>
                <span className="rounded-lg border border-white/15 px-3 py-2">
                  Named AI bot access toggles
                </span>
                <span className="rounded-lg border border-white/15 px-3 py-2">
                  Sitemap & path-rule validator
                </span>
              </div>
            </div>

            <div className="rounded-2xl border border-[#9aabff]/30 bg-[#101b30]/90 p-6 shadow-xl">
              <p className="text-xs font-bold uppercase tracking-wider text-[#b4c3ff]">
                3 AI & Search Bot Categories
              </p>
              <ul className="mt-4 space-y-2.5 text-xs text-slate-300">
                <li>
                  <strong className="text-emerald-300">Search Indexing:</strong> Googlebot, Bingbot, and core web search indexing crawlers.
                </li>
                <li>
                  <strong className="text-indigo-300">AI Search & Citations:</strong> OAI-SearchBot, PerplexityBot, and chat-citation fetchers.
                </li>
                <li>
                  <strong className="text-sky-300">Model Training:</strong> GPTBot, ClaudeBot, Google-Extended, and CCBot training crawlers.
                </li>
                <li>
                  <strong className="text-amber-300">Rule Validation:</strong> Flags accidental root Disallow: / blocks and syntax errors.
                </li>
              </ul>
            </div>
          </div>

          <div className="mt-8">
            <RobotsClient />
          </div>
        </div>
      </div>

      <RobotsEducation />

      <section className="border-t border-slate-200 bg-white py-20 dark:border-slate-800 dark:bg-slate-950">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <p className="text-xs font-extrabold uppercase tracking-[0.17em] text-[#5271ff]">
              Common questions
            </p>
            <h2 className="mt-3 text-3xl font-black tracking-tight text-slate-950 dark:text-white sm:text-4xl">
              Robots.txt generator FAQ
            </h2>
          </div>
          <div className="mt-10 grid gap-4 md:grid-cols-2">
            {faqs.map((faq) => (
              <details
                key={faq.question}
                className="group rounded-2xl border border-slate-200 bg-slate-50 p-5 open:bg-white dark:border-slate-800 dark:bg-slate-900 dark:open:bg-slate-900"
              >
                <summary className="flex cursor-pointer list-none items-start justify-between gap-4 text-sm font-extrabold text-slate-950 dark:text-white">
                  {faq.question}
                  <CheckCircle2 className="h-4 w-4 shrink-0 text-[#5271ff]" />
                </summary>
                <p className="mt-3 text-sm leading-7 text-slate-600 dark:text-slate-300">
                  {faq.answer}
                </p>
              </details>
            ))}
          </div>
        </div>
      </section>
      <ToolResources slug="robots-txt-generator" />
    </>
  );
}
