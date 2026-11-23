import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowRight,
  Cpu,
  Download,
  HelpCircle,
  Sparkles,
  Wand2,
} from "lucide-react";

const pageUrl = "https://doitwithai.tools/what-our-ai-tool-can-do";
const title =
  "What Our AI Tool Can Do — Do It AI Workspace & 90+ Portable Engines | Do It With AI";
const description =
  "Discover what Do It AI can do for your search rankings and workflows. Put AI to work: 90+ specialized SEO, content, and schema engines in one unified agent. Run audits, craft meta tags, or download offline PC tools.";

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: pageUrl },
  openGraph: {
    title,
    description,
    url: pageUrl,
    type: "website",
    siteName: "Do It With AI Tools",
    images: ["https://doitwithai.tools/ogimage.png"],
  },
  twitter: {
    card: "summary_large_image",
    title,
    description,
    images: ["https://doitwithai.tools/ogimage.png"],
  },
};

const CAPABILITIES = [
  {
    icon: "⚡",
    title: "1. AI Search (GEO & AEO) Optimization",
    desc: "Win recommendations and citations in Perplexity, ChatGPT Search, and Google AI Overviews. Do It AI audits passage clarity, citation readiness, and answer structure so LLMs can quote your pages accurately.",
    actionLink: "/tools/ai-citation-readiness-checker",
    actionText: "Try AI Citation Readiness Checker",
  },
  {
    icon: "🔍",
    title: "2. Deep 36-Factor Technical & On-Page Audits",
    desc: "Audit any public URL or pasted HTML. Inspect title pixel widths, H1–H6 heading hierarchy, schema markup, image alt coverage, internal/external anchor text ratios, and information gain signals.",
    actionLink: "/tools/on-page-ai-seo-analyzer",
    actionText: "Run 36-Factor On-Page Audit",
  },
  {
    icon: "🎯",
    title: "3. Semantic Keyword Clustering & Intent Mapping",
    desc: "Transform raw keyword lists into distinct search-intent clusters. Prevent keyword cannibalization, map primary and secondary keywords to exact URLs, and build complete topical authority maps.",
    actionLink: "/tools/keyword-clustering-tool",
    actionText: "Open Keyword Clustering Tool",
  },
  {
    icon: "📝",
    title: "4. SERP-Safe Meta Title & Description Engineering",
    desc: "Generate high-CTR title tags and meta descriptions measured accurately against Google desktop (580px) and mobile (920px) pixel limits, complete with live SERP preview simulation.",
    actionLink: "/tools/meta-title-generator",
    actionText: "Test SERP Pixel Limits",
  },
  {
    icon: "🔄",
    title: "5. Multi-Channel Visual & Content Repurposing",
    desc: "Turn a single article into a visual infographic, an interactive LinkedIn carousel deck, or shareable chart cards in one workflow.",
    actionLink: "/tools/blog-to-infographic-generator",
    actionText: "Launch Infographic Generator",
  },
  {
    icon: "📦",
    title: "6. 100% Portable Desktop Web Apps (.ZIP)",
    desc: "Download any tool as a standalone HTML application. Double-click Run-Tool.html to execute on your PC with zero installation, or embed inside WordPress, Webflow, and React.",
    actionLink: "/tools/downloadable-ai-tools",
    actionText: "Download 90+ Portable Tools",
  },
];

const ONE_CLICK_WORKFLOWS = [
  {
    label: "Audit On-Page SEO & Schema",
    prompt:
      "Audit on-page SEO, heading hierarchy, and JSON-LD schema for how to check google keyword rankings",
  },
  {
    label: "10-Step Post-Keyword Research Plan",
    prompt:
      "What should I do after keyword research? Give me the complete 10-step execution playbook",
  },
  {
    label: "Write 6 Pixel-Safe Meta Titles",
    prompt:
      "Generate 6 high-CTR meta titles and descriptions under 580px for an AI SEO guide",
  },
  {
    label: "Optimize for Perplexity & AI Overviews",
    prompt:
      "How do I structure my article for AEO and GEO citations in ChatGPT and Perplexity?",
  },
];

const VISUAL_PLAYBOOKS = [
  {
    title: "What Is AI SEO? 12-Module Strategy Guide to AEO & GEO",
    category: "AEO & GEO Pillar",
    href: "/ai-seo/what-is-ai-seo",
    image:
      "https://cdn.sanity.io/images/qyshio4a/production/71f4396b9759402ea2249cf2103164ece7f2c773-1278x733.png",
  },
  {
    title: "How to Check Keyword Rankings in Google (4 Free Methods)",
    category: "Keyword Tracking",
    href: "/ai-seo/check-google-keyword-rankings",
    image:
      "/images/articles/check-google-keyword-rankings/01-how-to-check-keyword-rankings-hero.jpg",
  },
  {
    title: "What to Do After Keyword Research: 10-Step Execution Plan",
    category: "Execution Workflow",
    href: "/ai-seo/what-to-do-after-keyword-research",
    image:
      "/images/articles/what-to-do-after-keyword-research/what-to-do-after-keyword-research-10-step-workflow.webp",
  },
];

const COMPARISON_ROWS = [
  {
    feature: "Specialized SEO & SERP Engines",
    generic: "❌ Hallucinates pixel widths & tag limits",
    doitai: "✅ 90+ deterministic algorithmic validators",
  },
  {
    feature: "Live URL On-Page Crawling",
    generic: "❌ Often blocked or returns surface summaries",
    doitai: "✅ 36-factor deep inspection of live HTML & schema",
  },
  {
    feature: "Offline PC & Website Embed Execution",
    generic: "❌ Locked inside a single cloud chat tab",
    doitai: "✅ 1-click standalone .ZIP apps run on your PC or site",
  },
  {
    feature: "Bring Your Own Key (BYOK) Privacy",
    generic: "❌ Tied to a single subscription account",
    doitai: "✅ Default Cloud API + optional private Gemini/OpenAI key",
  },
  {
    feature: "Visual Infographics & Prompt Libraries",
    generic: "❌ Unstructured plain text replies",
    doitai: "✅ 650+ curated prompts, infographics & interactive cards",
  },
];

const FAQS = [
  {
    q: "What is Do It AI, and why do people search 'Do it with AI'?",
    a: "Do It AI is our flagship AI SEO agent and workspace built by Do It With AI Tools. Users search 'Do it with AI' or 'AI do it' when looking for software that doesn't just chat, but executes real marketing tasks—like auditing on-page SEO, verifying SERP pixel limits, grouping keywords, and generating verified schema markup.",
  },
  {
    q: "How does Do It AI differ from standard ChatGPT or Gemini?",
    a: "Standard ChatGPT or Gemini provide conversational text but lack deterministic SEO validation. Do It AI is wired into 90+ specialized tools: it measures real SERP pixel widths, validates JSON-LD structured data against Schema.org standards, inspects heading hierarchy, and lets you download standalone tool apps locally on your PC.",
  },
  {
    q: "Can I run Do It AI tools offline on my local computer?",
    a: "Yes! Every tool in our catalog is available as a portable web app. Visit /tools/downloadable-ai-tools, download any 1-click .ZIP package, extract it, and double-click Run-Tool.html to run the exact interactive tool on your computer without Node.js, npm, or terminal commands.",
  },
  {
    q: "What is the Bring Your Own Key (BYOK) privacy policy?",
    a: "When running portable tools, you can use our built-in cloud API for free out of the box. If you enter your personal Gemini or OpenAI API key, our default cloud API is bypassed and all AI requests are sent directly from your browser to your AI provider.",
  },
  {
    q: "Is Do It AI free to use?",
    a: "Yes. You can access the Do It AI workspace, execute all 90+ specialized online tools, and download standalone desktop tool packages for free.",
  },
];

export default function WhatOurAiToolCanDoPage() {
  const schema = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebApplication",
        name: "Do It AI — Unified AI SEO & Content Workspace",
        alternateName: [
          "Do It AI",
          "AI do it",
          "Do it with AI Tool",
          "What Our AI Tool Can Do",
        ],
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
          { name: "What Our AI Tool Can Do", item: pageUrl },
        ].map((item, i) => ({
          "@type": "ListItem",
          position: i + 1,
          ...item,
        })),
      },
      {
        "@type": "FAQPage",
        mainEntity: FAQS.map((faq) => ({
          "@type": "Question",
          name: faq.q,
          acceptedAnswer: {
            "@type": "Answer",
            text: faq.a,
          },
        })),
      },
    ],
  };

  return (
    <div className="min-h-screen bg-white text-slate-900 dark:bg-[#0B1120] dark:text-white">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(schema).replace(/</g, "\\u003c"),
        }}
      />

      {/* Hero Section */}
      <section className="relative overflow-hidden border-b border-slate-200/80 bg-gradient-to-b from-slate-50 via-white to-slate-50/60 pb-20 pt-28 dark:border-slate-800/80 dark:from-[#070D19] dark:via-[#0B1120] dark:to-[#0B1120]">
        <div className="pointer-events-none absolute left-1/2 top-0 h-[420px] w-[860px] -translate-x-1/2 rounded-full bg-[#5271FF]/15 blur-[140px]" />

        <div className="relative z-10 mx-auto max-w-5xl px-4 text-center sm:px-6">
          <div className="inline-flex items-center gap-2 rounded-full border border-[#5271FF]/30 bg-[#5271FF]/10 px-4 py-1.5 text-xs font-extrabold uppercase tracking-wider text-[#5271FF] dark:border-[#5271FF]/40 dark:bg-[#5271FF]/15 dark:text-[#b4c2ff]">
            <Sparkles size={14} className="text-[#5271FF]" />
            <span>Official Guide &amp; Capability Showcase</span>
          </div>

          <h1 className="mt-5 text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white sm:text-5xl sm:leading-tight">
            What Our AI Tool Can Do:{" "}
            <span className="bg-gradient-to-r from-[#5271FF] to-[#4361EE] bg-clip-text text-transparent">
              Put AI to Work with Do It AI
            </span>
          </h1>

          <p className="mx-auto mt-4 max-w-3xl text-sm leading-relaxed text-slate-600 dark:text-slate-300 sm:text-base">
            Stop switching between ten browser tabs and guessing prompt words.{" "}
            <strong>Do It AI</strong> connects you directly to{" "}
            <strong>90+ specialized SEO, content, and visual engines</strong>.
            From live 36-factor on-page audits and AI search (GEO/AEO)
            optimization to standalone desktop PC tools, here is everything our
            ecosystem delivers.
          </p>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-3.5">
            <Link
              href="/do-it-ai"
              className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-[#5271FF] to-[#4361EE] px-6 py-3.5 text-sm font-extrabold text-white shadow-xl shadow-[#5271FF]/25 transition hover:opacity-95"
            >
              <Wand2 size={16} />
              <span>Launch Do It AI Workspace Free</span>
            </Link>

            <Link
              href="/tools/downloadable-ai-tools"
              className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-6 py-3.5 text-sm font-bold text-slate-700 shadow-sm transition hover:border-[#5271FF] hover:text-[#5271FF] dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:border-[#5271FF]"
            >
              <Download size={16} />
              <span>Download 90+ Portable Tools (.ZIP)</span>
            </Link>
          </div>

          {/* Instant One-Click Prompt Launchers */}
          <div className="mx-auto mt-8 max-w-3xl rounded-2xl border border-slate-200/90 bg-white/90 p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900/70">
            <p className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Click any task below to execute it live inside Do It AI:
            </p>
            <div className="mt-3 flex flex-wrap justify-center gap-2">
              {ONE_CLICK_WORKFLOWS.map((wf) => (
                <Link
                  key={wf.label}
                  href={`/do-it-ai?prompt=${encodeURIComponent(wf.prompt)}`}
                  className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-semibold text-slate-700 transition hover:border-[#5271FF] hover:bg-[#5271FF]/10 hover:text-[#5271FF] dark:border-slate-700 dark:bg-slate-800/80 dark:text-slate-200 dark:hover:border-[#5271FF] dark:hover:text-[#b4c2ff]"
                >
                  <span>{wf.label}</span>
                  <ArrowRight size={12} />
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* 6 Core Capabilities */}
      <section className="py-20">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="text-center">
            <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white sm:text-4xl">
              6 Ways Do It AI Powers Modern SEO &amp; Content Workflows
            </h2>
            <p className="mx-auto mt-2.5 max-w-2xl text-xs text-slate-600 dark:text-slate-400 sm:text-sm">
              Each capability is backed by deterministic algorithms, Google
              Search Essentials, and modern GEO/AEO research.
            </p>
          </div>

          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {CAPABILITIES.map((cap, i) => (
              <div
                key={i}
                className="flex flex-col justify-between rounded-3xl border border-slate-200/90 bg-slate-50/70 p-6 shadow-sm transition hover:border-[#5271FF]/50 hover:bg-white hover:shadow-lg dark:border-slate-800 dark:bg-slate-900/70 dark:hover:bg-slate-900"
              >
                <div>
                  <div className="text-3xl">{cap.icon}</div>
                  <h3 className="mt-4 text-lg font-bold text-slate-900 dark:text-white">
                    {cap.title}
                  </h3>
                  <p className="mt-2.5 text-xs leading-relaxed text-slate-600 dark:text-slate-300">
                    {cap.desc}
                  </p>
                </div>
                <Link
                  href={cap.actionLink}
                  className="mt-5 inline-flex items-center gap-1.5 text-xs font-extrabold text-[#5271FF] transition hover:underline dark:text-[#9aabff]"
                >
                  <span>{cap.actionText}</span>
                  <ArrowRight size={13} />
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Comparison Table: Generic Chatbots vs Do It AI */}
      <section className="border-y border-slate-200/80 bg-slate-50/80 py-20 dark:border-slate-800/80 dark:bg-slate-950/70">
        <div className="mx-auto max-w-5xl px-4 sm:px-6">
          <div className="text-center">
            <div className="inline-flex items-center gap-2 rounded-full border border-[#5271FF]/30 bg-[#5271FF]/10 px-3.5 py-1 text-xs font-bold text-[#5271FF] dark:text-[#b4c2ff]">
              <Cpu size={14} />
              <span>Engine Architecture Comparison</span>
            </div>
            <h2 className="mt-3 text-2xl font-extrabold text-slate-900 dark:text-white sm:text-4xl">
              Generic Chatbots vs. Do It AI Specialized Workspace
            </h2>
            <p className="mx-auto mt-2 max-w-2xl text-xs text-slate-600 dark:text-slate-400 sm:text-sm">
              Why purpose-built SEO engines outperform raw prompt wrappers.
            </p>
          </div>

          <div className="mt-10 overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-xl dark:border-slate-800 dark:bg-slate-900/90">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs sm:text-sm">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-100/80 text-slate-700 dark:border-slate-800 dark:bg-slate-950/80 dark:text-slate-300">
                    <th className="p-4 font-extrabold sm:p-5">
                      Capability / Task
                    </th>
                    <th className="p-4 font-extrabold text-slate-500 dark:text-slate-400 sm:p-5">
                      Generic AI (ChatGPT, etc.)
                    </th>
                    <th className="p-4 font-extrabold text-[#5271FF] dark:text-[#9aabff] sm:p-5">
                      Do It AI Workspace
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200/70 text-slate-700 dark:divide-slate-800/70 dark:text-slate-300">
                  {COMPARISON_ROWS.map((row, idx) => (
                    <tr
                      key={idx}
                      className="transition hover:bg-slate-50 dark:hover:bg-slate-800/40"
                    >
                      <td className="p-4 font-bold text-slate-900 dark:text-white sm:p-5">
                        {row.feature}
                      </td>
                      <td className="p-4 text-rose-600 dark:text-rose-300/90 sm:p-5">
                        {row.generic}
                      </td>
                      <td className="p-4 font-semibold text-emerald-700 dark:text-emerald-300 sm:p-5">
                        {row.doitai}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Visual Playbooks & Guides */}
      <section className="py-20">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="text-center">
            <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white sm:text-4xl">
              Deep-Dive SEO &amp; AEO Playbooks Grounding Do It AI
            </h2>
            <p className="mx-auto mt-2 max-w-2xl text-xs text-slate-600 dark:text-slate-400 sm:text-sm">
              Explore the step-by-step frameworks and visual guides built into
              our knowledge engine.
            </p>
          </div>

          <div className="mt-10 grid gap-6 md:grid-cols-3">
            {VISUAL_PLAYBOOKS.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="group overflow-hidden rounded-3xl border border-slate-200/90 bg-white shadow-sm transition hover:border-[#5271FF]/50 hover:shadow-xl dark:border-slate-800 dark:bg-slate-900/80"
              >
                <div className="aspect-[16/10] w-full overflow-hidden bg-slate-900">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={item.image}
                    alt={item.title}
                    className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                    loading="lazy"
                  />
                </div>
                <div className="p-5">
                  <span className="inline-block rounded-md bg-[#5271FF]/10 px-2.5 py-0.5 text-[10px] font-bold uppercase text-[#5271FF] dark:bg-[#5271FF]/20 dark:text-[#b4c2ff]">
                    {item.category}
                  </span>
                  <h3 className="mt-2 text-base font-bold text-slate-900 group-hover:text-[#5271FF] dark:text-white dark:group-hover:text-[#9aabff]">
                    {item.title}
                  </h3>
                  <span className="mt-3 inline-flex items-center gap-1 text-xs font-bold text-[#5271FF] dark:text-[#9aabff]">
                    Read Complete Guide <ArrowRight size={13} />
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* In-Depth FAQs */}
      <section className="border-t border-slate-200/80 bg-slate-50/60 py-20 dark:border-slate-800/80 dark:bg-slate-950/40">
        <div className="mx-auto max-w-4xl px-4 sm:px-6">
          <div className="text-center">
            <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white sm:text-4xl">
              Frequently Asked Questions About Do It AI
            </h2>
            <p className="mt-2 text-xs text-slate-600 dark:text-slate-400 sm:text-sm">
              Everything you need to know about our tools, SEO methodology, and
              offline portable apps.
            </p>
          </div>

          <div className="mt-10 space-y-4">
            {FAQS.map((item, idx) => (
              <div
                key={idx}
                className="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900/80"
              >
                <h3 className="flex items-center gap-2 text-base font-bold text-slate-900 dark:text-white">
                  <HelpCircle size={17} className="shrink-0 text-[#5271FF]" />
                  <span>{item.q}</span>
                </h3>
                <p className="mt-2.5 pl-6 text-xs leading-relaxed text-slate-600 dark:text-slate-300 sm:text-sm">
                  {item.a}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Conversion Banner */}
      <section className="border-t border-slate-200/80 bg-white py-16 text-center dark:border-slate-800/80 dark:bg-[#0B1120]">
        <div className="mx-auto max-w-3xl px-4">
          <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white sm:text-4xl">
            Ready to Put AI to Work on Your SEO?
          </h2>
          <p className="mx-auto mt-3 text-sm text-slate-600 dark:text-slate-300">
            Open the free Do It AI workspace now or download the complete 90+
            portable tool suite for your computer.
          </p>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Link
              href="/do-it-ai"
              className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-[#5271FF] to-[#4361EE] px-6 py-3.5 text-sm font-extrabold text-white shadow-xl shadow-[#5271FF]/25 transition hover:opacity-95"
            >
              <span>Launch Do It AI Workspace</span>
              <ArrowRight size={16} />
            </Link>
            <Link
              href="/tools/downloadable-ai-tools"
              className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-slate-50 px-6 py-3.5 text-sm font-bold text-slate-700 transition hover:border-[#5271FF] hover:text-[#5271FF] dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
            >
              <span>Browse 90+ Portable Tools</span>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
