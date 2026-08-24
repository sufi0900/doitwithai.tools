import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowRight,
  Bot,
  Braces,
  Check,
  Gauge,
  Layers3,
  Link2,
  Network,
  ScanSearch,
  Search,
  ShieldCheck,
  Sparkles,
  Type,
} from "lucide-react";

const pageUrl = "https://doitwithai.tools/ai-seo-tools";
const ogUrl = `https://doitwithai.tools/api/og?${new URLSearchParams({
  title: "Free AI SEO Tools for Titles, URLs & Schema",
  category: "Do It With AI Tools",
  ctaText: "Explore the AI SEO Toolkit",
  features: "Meta Titles,Short URL Slugs,Complete JSON-LD",
}).toString()}`;

export const metadata: Metadata = {
  title: "Free AI SEO Tools: Title, Slug & Schema Generators",
  description:
    "Use free AI SEO tools to create better meta titles, short URL slugs, and complete JSON-LD schema with context-aware generation and practical checks.",
  keywords: [
    "AI SEO tools",
    "free SEO tools",
    "meta title generator",
    "SEO slug generator",
    "schema markup generator",
    "JSON-LD generator",
  ],
  authors: [
    {
      name: "Sufian Mustafa",
      url: "https://doitwithai.tools/author/sufian-mustafa",
    },
  ],
  creator: "Sufian Mustafa",
  publisher: "Do It With AI Tools",
  alternates: { canonical: pageUrl },
  openGraph: {
    type: "website",
    url: pageUrl,
    siteName: "Do It With AI Tools",
    title: "Free AI SEO Tools for Titles, URLs and Structured Data",
    description:
      "Explore context-aware generators for meta titles, SEO-friendly URL slugs, and complete JSON-LD schema markup.",
    images: [
      {
        url: ogUrl,
        width: 1200,
        height: 630,
        alt: "AI SEO Tools by Do It With AI Tools",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Free AI SEO Tools by Do It With AI Tools",
    description:
      "Generate meta titles, concise URL slugs, and complete schema markup from one focused AI SEO toolkit.",
    images: [ogUrl],
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

const tools = [
  {
    name: "Meta Title Generator",
    label: "Search appearance",
    href: "/ai-seo/meta-title-generator",
    description:
      "Turn a page brief into title ideas for search engines, human readers, and AI-readable clarity—then compare the strongest recommendations.",
    features: [
      "Four optimization lenses",
      "Pixel-aware SERP preview",
      "Recommendations with reasoning",
    ],
    icon: Type,
    accent: "blue",
    cta: "Open Meta Title Generator",
  },
  {
    name: "SEO Slug Generator",
    label: "URL structure",
    href: "/ai-seo/slug-url-generator",
    description:
      "Generate a short, durable URL from the meaning and intent of your page instead of mechanically adding hyphens to an entire sentence.",
    features: [
      "Context-aware topic analysis",
      "Meaning-preserving compression",
      "SEO quality and permanence checks",
    ],
    icon: Link2,
    accent: "cyan",
    cta: "Open SEO Slug Generator",
  },
  {
    name: "Schema Markup Generator",
    label: "Structured data",
    href: "/ai-seo/schema-markup-generator",
    description:
      "Build type-specific, connected JSON-LD from reviewed facts, with optional page analysis, readiness checks, validation, and downloads.",
    features: [
      "Sixteen schema workflows",
      "Connected entity graph",
      "Copy, validate, and download",
    ],
    icon: Braces,
    accent: "violet",
    cta: "Open Schema Markup Generator",
  },
] as const;

const structuredData = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "CollectionPage",
      "@id": `${pageUrl}#webpage`,
      url: pageUrl,
      name: metadata.title,
      description: metadata.description,
      isPartOf: {
        "@type": "WebSite",
        "@id": "https://doitwithai.tools/#website",
        name: "Do It With AI Tools",
        url: "https://doitwithai.tools",
      },
      creator: {
        "@type": "Person",
        name: "Sufian Mustafa",
        url: "https://doitwithai.tools/author/sufian-mustafa",
      },
      mainEntity: {
        "@type": "ItemList",
        name: "Do It With AI Tools AI SEO generators",
        numberOfItems: tools.length,
        itemListElement: tools.map((tool, index) => ({
          "@type": "ListItem",
          position: index + 1,
          item: {
            "@type": "WebApplication",
            name: tool.name,
            url: new URL(tool.href, pageUrl).toString(),
            description: tool.description,
            applicationCategory: "SEOApplication",
            operatingSystem: "Any",
            isAccessibleForFree: true,
            offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
          },
        })),
      },
    },
    {
      "@type": "BreadcrumbList",
      "@id": `${pageUrl}#breadcrumb`,
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
          name: "AI SEO Tools",
          item: pageUrl,
        },
      ],
    },
  ],
};

function ToolVisual({ accent }: { accent: (typeof tools)[number]["accent"] }) {
  if (accent === "blue") {
    return (
      <div className="relative h-28 overflow-hidden rounded-2xl border border-blue-300/15 bg-slate-950/70 p-4">
        <div className="flex items-center gap-2 text-[9px] font-bold uppercase tracking-[0.16em] text-blue-200/70">
          <Search className="h-3 w-3" /> Search preview
        </div>
        <div className="mt-3 space-y-2">
          <div className="h-2.5 w-[82%] rounded-full bg-gradient-to-r from-[#5271ff] to-cyan-300" />
          <div className="h-1.5 w-[58%] rounded-full bg-slate-600" />
          <div className="flex items-center gap-2 pt-1">
            <span className="h-1.5 w-14 rounded-full bg-emerald-400/70" />
            <span className="text-[9px] font-bold text-emerald-300">
              Pixel fit
            </span>
          </div>
        </div>
      </div>
    );
  }

  if (accent === "cyan") {
    return (
      <div className="relative flex h-28 items-center overflow-hidden rounded-2xl border border-cyan-300/15 bg-slate-950/70 p-4">
        <div className="w-full rounded-xl border border-white/10 bg-white/[0.05] px-3 py-3 font-mono text-[11px] text-slate-400">
          <span className="text-slate-500">doitwithai.tools/</span>
          <span className="font-bold text-cyan-300">ai-seo-tools</span>
          <div className="mt-2 flex items-center gap-2 font-sans text-[9px] font-bold uppercase tracking-wider text-emerald-300">
            <Check className="h-3 w-3" /> Short and readable
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative h-28 overflow-hidden rounded-2xl border border-violet-300/15 bg-slate-950/70 p-4 font-mono text-[10px] leading-5 text-slate-400">
      <span className="text-violet-300">{"{"}</span>
      <div className="pl-4">
        <span className="text-cyan-300">&quot;@type&quot;</span>:&nbsp;
        <span className="text-blue-200">&quot;WebApplication&quot;</span>,
      </div>
      <div className="pl-4">
        <span className="text-cyan-300">&quot;isAccessibleForFree&quot;</span>
        :&nbsp;
        <span className="text-emerald-300">true</span>
      </div>
      <span className="text-violet-300">{"}"}</span>
    </div>
  );
}

export default function AiSeoToolsPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />

      <main className="overflow-hidden bg-slate-950 text-white">
        <section className="relative border-b border-white/10 pb-20 pt-10 sm:pt-14 lg:pb-28">
          <div className="pointer-events-none absolute inset-0 overflow-hidden">
            <div className="absolute -left-40 -top-28 h-[440px] w-[440px] rounded-full bg-[#5271ff]/25 blur-3xl" />
            <div className="absolute -right-28 top-16 h-80 w-80 rounded-full bg-cyan-400/10 blur-3xl" />
            <div className="absolute left-1/2 top-28 h-72 w-72 -translate-x-1/2 rounded-full bg-violet-500/10 blur-3xl" />
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,rgba(255,255,255,0.085)_1px,transparent_0)] bg-[size:30px_30px] [mask-image:linear-gradient(to_bottom,white,transparent_88%)]" />
            <div className="motion-safe:animate-pulse motion-reduce:animate-none absolute left-[14%] top-32 h-1.5 w-1.5 rounded-full bg-cyan-300 shadow-[0_0_18px_5px_rgba(103,232,249,0.45)]" />
            <div className="motion-safe:animate-pulse motion-reduce:animate-none absolute right-[18%] top-52 h-1.5 w-1.5 rounded-full bg-[#8da1ff] shadow-[0_0_18px_5px_rgba(82,113,255,0.45)] [animation-delay:700ms]" />
          </div>

          <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <nav
              aria-label="Breadcrumb"
              className="mb-9 flex items-center gap-2 text-xs font-semibold text-slate-400"
            >
              <Link href="/" className="transition-colors hover:text-white">
                Home
              </Link>
              <span aria-hidden="true">/</span>
              <span className="text-blue-200">AI SEO Tools</span>
            </nav>

            <div className="mx-auto max-w-4xl text-center">
              <div className="inline-flex items-center gap-2 rounded-full border border-[#7f95ff]/30 bg-[#5271ff]/10 px-4 py-2 text-[11px] font-black uppercase tracking-[0.17em] text-blue-100 backdrop-blur">
                <Sparkles className="h-4 w-4 text-cyan-300" /> Free AI SEO
                toolkit
              </div>

              <h1 className="mt-6 text-4xl font-black leading-[1.05] tracking-[-0.045em] sm:text-6xl lg:text-7xl">
                Build Stronger Search Elements with
                <span className="mt-2 block bg-gradient-to-r from-[#8ea2ff] via-cyan-300 to-violet-300 bg-clip-text text-transparent">
                  Context-Aware AI SEO Tools
                </span>
              </h1>

              <p className="mx-auto mt-6 max-w-3xl text-base leading-8 text-slate-300 sm:text-lg">
                Move from a page idea to a clearer title, a concise URL, and
                connected structured data. Each generator combines AI-assisted
                analysis with practical, visible checks you can review before
                publishing.
              </p>

              <div className="mt-7 flex flex-wrap justify-center gap-2.5 text-xs font-bold text-slate-300">
                {[
                  [Bot, "Context-aware generation"],
                  [ShieldCheck, "Reviewable quality checks"],
                  [Gauge, "Fast, focused workflows"],
                ].map(([Icon, label]) => {
                  const FeatureIcon = Icon as typeof Bot;
                  return (
                    <span
                      key={label as string}
                      className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.055] px-3 py-2"
                    >
                      <FeatureIcon className="h-3.5 w-3.5 text-[#8ea2ff]" />
                      {label as string}
                    </span>
                  );
                })}
              </div>
            </div>

            <div
              id="tools"
              className="mt-14 grid gap-5 md:grid-cols-2 lg:grid-cols-3"
            >
              {tools.map((tool, index) => {
                const Icon = tool.icon;
                const iconStyles =
                  tool.accent === "blue"
                    ? "border-blue-300/25 bg-[#5271ff]/15 text-[#9aabff]"
                    : tool.accent === "cyan"
                      ? "border-cyan-300/25 bg-cyan-400/10 text-cyan-300"
                      : "border-violet-300/25 bg-violet-400/10 text-violet-300";
                const numberStyles =
                  tool.accent === "blue"
                    ? "text-blue-300/55"
                    : tool.accent === "cyan"
                      ? "text-cyan-300/55"
                      : "text-violet-300/55";

                return (
                  <article
                    key={tool.name}
                    className="group relative flex min-h-full flex-col overflow-hidden rounded-[26px] border border-white/10 bg-gradient-to-b from-white/[0.075] to-white/[0.035] p-2 shadow-[0_24px_80px_rgba(0,0,0,0.2)] transition duration-300 hover:-translate-y-1 hover:border-[#718bff]/45 hover:shadow-[0_30px_90px_rgba(42,61,150,0.23)] motion-reduce:transform-none"
                  >
                    <div className="pointer-events-none absolute inset-x-8 -top-px h-px bg-gradient-to-r from-transparent via-[#88a0ff]/70 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                    <div className="flex flex-1 flex-col rounded-[20px] border border-white/[0.045] bg-slate-950/35 p-5 sm:p-6">
                      <div className="flex items-start justify-between gap-3">
                        <div
                          className={`flex h-11 w-11 items-center justify-center rounded-2xl border ${iconStyles}`}
                        >
                          <Icon className="h-5 w-5" aria-hidden="true" />
                        </div>
                        <span
                          className={`font-mono text-sm font-bold ${numberStyles}`}
                        >
                          0{index + 1}
                        </span>
                      </div>

                      <p className="mt-5 text-[10px] font-black uppercase tracking-[0.17em] text-[#8ea2ff]">
                        {tool.label}
                      </p>
                      <h2 className="mt-2 text-2xl font-black tracking-tight text-white">
                        {tool.name}
                      </h2>
                      <p className="mt-3 min-h-[84px] text-sm leading-7 text-slate-300">
                        {tool.description}
                      </p>

                      <div className="mt-5">
                        <ToolVisual accent={tool.accent} />
                      </div>

                      <ul className="mt-5 space-y-2.5" aria-label="Features">
                        {tool.features.map((feature) => (
                          <li
                            key={feature}
                            className="flex items-start gap-2.5 text-xs font-semibold leading-5 text-slate-300"
                          >
                            <span className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-[#5271ff]/15 text-[#8ea2ff]">
                              <Check className="h-2.5 w-2.5" />
                            </span>
                            {feature}
                          </li>
                        ))}
                      </ul>

                      <Link
                        href={tool.href}
                        className="mt-6 inline-flex min-h-12 items-center justify-between gap-3 rounded-xl border border-white/10 bg-white/[0.07] px-4 py-3 text-sm font-extrabold text-white transition duration-300 hover:border-[#728cff]/60 hover:bg-[#5271ff] focus:outline-none focus:ring-4 focus:ring-[#5271ff]/30"
                      >
                        {tool.cta}
                        <ArrowRight className="h-4 w-4 shrink-0 transition-transform duration-300 group-hover:translate-x-0.5 motion-reduce:transform-none" />
                      </Link>
                    </div>
                  </article>
                );
              })}
            </div>
          </div>
        </section>

        <section className="relative bg-white py-20 text-slate-950 dark:bg-slate-900 dark:text-white sm:py-24">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="grid items-start gap-12 lg:grid-cols-[0.78fr_1.22fr] lg:gap-16">
              <div className="lg:sticky lg:top-28">
                <p className="text-xs font-black uppercase tracking-[0.18em] text-[#5271ff]">
                  One connected workflow
                </p>
                <h2 className="mt-4 text-3xl font-black tracking-[-0.035em] sm:text-5xl">
                  Optimize the elements around your content—not just the body
                  copy.
                </h2>
                <p className="mt-5 text-base leading-8 text-slate-600 dark:text-slate-300">
                  A useful page needs more than well-written paragraphs. Its
                  search title, URL, and structured data should describe the
                  same subject consistently. These tools help you work through
                  those layers without turning one form into an overwhelming SEO
                  audit.
                </p>
                <Link
                  href="/ai-seo"
                  className="mt-7 inline-flex items-center gap-2 text-sm font-extrabold text-[#4562e8] transition-colors hover:text-[#294bd4] dark:text-[#8ea2ff] dark:hover:text-white"
                >
                  Explore the AI SEO knowledge hub
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>

              <ol className="grid gap-4">
                {[
                  {
                    icon: ScanSearch,
                    number: "01",
                    title: "Shape the search result",
                    text: "Create a concise meta title that communicates relevance while remaining readable and appealing across search contexts.",
                  },
                  {
                    icon: Link2,
                    number: "02",
                    title: "Compress the URL",
                    text: "Preserve the page's durable topic in a short slug without carrying headline filler, temporary details, or an entire sentence into the path.",
                  },
                  {
                    icon: Network,
                    number: "03",
                    title: "Describe the entities",
                    text: "Represent supported, visible facts through connected JSON-LD that matches the page type and can be checked before implementation.",
                  },
                ].map((step) => {
                  const Icon = step.icon;
                  return (
                    <li
                      key={step.number}
                      className="group grid gap-4 rounded-3xl border border-slate-200 bg-slate-50 p-5 transition duration-300 hover:border-[#5271ff]/35 hover:bg-blue-50/50 dark:border-slate-700 dark:bg-slate-950/60 dark:hover:border-[#5271ff]/50 dark:hover:bg-slate-950 sm:grid-cols-[auto_1fr_auto] sm:items-center sm:p-6"
                    >
                      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#5271ff]/10 text-[#5271ff] dark:bg-[#5271ff]/15 dark:text-[#9aabff]">
                        <Icon className="h-5 w-5" />
                      </div>
                      <div>
                        <h3 className="text-lg font-black">{step.title}</h3>
                        <p className="mt-1.5 text-sm leading-6 text-slate-600 dark:text-slate-300">
                          {step.text}
                        </p>
                      </div>
                      <span className="font-mono text-sm font-bold text-slate-300 dark:text-slate-600">
                        {step.number}
                      </span>
                    </li>
                  );
                })}
              </ol>
            </div>
          </div>
        </section>

        <section className="border-y border-white/10 bg-slate-950 py-20 sm:py-24">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-3xl text-center">
              <p className="text-xs font-black uppercase tracking-[0.18em] text-[#8ea2ff]">
                Designed for review, not blind automation
              </p>
              <h2 className="mt-4 text-3xl font-black tracking-[-0.035em] sm:text-5xl">
                AI assistance with visible reasoning and deterministic checks
              </h2>
              <p className="mt-5 text-base leading-8 text-slate-300">
                The generators help analyze context and create candidates. Exact
                measurements, required fields, format rules, and quality signals
                are handled through application logic wherever a deterministic
                check is more reliable than an AI estimate.
              </p>
            </div>

            <div className="mt-12 grid gap-5 md:grid-cols-3">
              {[
                {
                  icon: Bot,
                  title: "Context before output",
                  text: "Each workflow asks for the page information needed to understand the subject and intended result.",
                },
                {
                  icon: Gauge,
                  title: "Checks you can inspect",
                  text: "Lengths, required values, formats, and readiness signals remain visible instead of being hidden behind one score.",
                },
                {
                  icon: ShieldCheck,
                  title: "You remain the editor",
                  text: "Generated results are candidates. Confirm accuracy, intent, visible page content, and brand fit before publishing.",
                },
              ].map((item) => {
                const Icon = item.icon;
                return (
                  <article
                    key={item.title}
                    className="rounded-3xl border border-white/10 bg-white/[0.045] p-6"
                  >
                    <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#5271ff]/15 text-[#9aabff]">
                      <Icon className="h-5 w-5" />
                    </div>
                    <h3 className="mt-5 text-lg font-black">{item.title}</h3>
                    <p className="mt-2 text-sm leading-7 text-slate-400">
                      {item.text}
                    </p>
                  </article>
                );
              })}
            </div>
          </div>
        </section>

        <section className="relative bg-gradient-to-br from-[#4562e8] via-[#5271ff] to-[#694ce0] py-16 sm:py-20">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,rgba(255,255,255,0.16)_1px,transparent_0)] bg-[size:26px_26px] opacity-30" />
          <div className="relative mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
            <Layers3 className="mx-auto h-9 w-9 text-blue-100" />
            <h2 className="mt-5 text-3xl font-black tracking-[-0.035em] sm:text-5xl">
              Start with the SEO element your page needs next.
            </h2>
            <p className="mx-auto mt-5 max-w-2xl text-base leading-8 text-blue-100">
              Use one focused generator or move through the complete workflow.
              Every tool is free to try and built for practical implementation.
            </p>
            <a
              href="#tools"
              className="mt-7 inline-flex min-h-12 items-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-black text-[#3956d6] shadow-xl transition duration-300 hover:-translate-y-0.5 hover:bg-blue-50 focus:outline-none focus:ring-4 focus:ring-white/30 motion-reduce:transform-none"
            >
              Compare the three AI SEO tools
              <ArrowRight className="h-4 w-4" />
            </a>
          </div>
        </section>
      </main>
    </>
  );
}
