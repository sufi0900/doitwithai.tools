import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowRight,
  Bot,
  CheckCircle2,
  Cpu,
  Download,
  FileCode2,
  HelpCircle,
  KeyRound,
  Layers,
  Search,
  ShieldCheck,
  Sparkles,
  Terminal,
  Wand2,
  XCircle,
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
    desc: "Win recommendations and citations in Perplexity, ChatGPT Search, and Google Gemini SGE. Do It AI audits passage clarity, citation readiness, and answer structure to ensure your content is chosen by AI engines.",
    actionLink: "/tools/on-page-ai-seo-analyzer",
    actionText: "Try On-Page Analyzer",
  },
  {
    icon: "🔍",
    title: "2. Deep 36-Factor Technical & On-Page Audits",
    desc: "Audit any public URL or pasted HTML. Inspect title pixel widths, H1-H6 heading hierarchy, schema markup, image alt coverage, internal/external anchor text ratios, and information gain signals.",
    actionLink: "/tools/on-page-ai-seo-analyzer",
    actionText: "Run 36-Factor Audit",
  },
  {
    icon: "🎯",
    title: "3. Semantic Keyword Clustering & Intent Mapping",
    desc: "Transform thousands of raw keywords into distinct search-intent clusters. Avoid keyword cannibalization, map primary and secondary keywords to exact URLs, and eliminate redundant content.",
    actionLink: "/tools/keyword-clustering-tool",
    actionText: "Cluster Keywords",
  },
  {
    icon: "📝",
    title: "4. SERP-Safe Meta Title & Description Engineering",
    desc: "Generate high-CTR title tags and meta descriptions measured accurately against Google desktop (580px) and mobile (920px) pixel limits. Includes live SERP preview simulation.",
    actionLink: "/tools/meta-title-generator",
    actionText: "Test SERP Pixel Limits",
  },
  {
    icon: "🔄",
    title: "5. Multi-Channel Content Repurposing",
    desc: "Turn a single blog post into an interactive LinkedIn carousel, 60-second video script, infographic data points, or a newsletter draft in one command.",
    actionLink: "/tools/blog-to-linkedin-carousel",
    actionText: "Create Carousel",
  },
  {
    icon: "📦",
    title: "6. 100% Portable Desktop Web Apps (.ZIP)",
    desc: "Download any tool as a standalone HTML app. Double-click Run-Tool.html to execute on your PC offline or online with zero installation, or embed inside WordPress, Webflow, and React.",
    actionLink: "/download-and-embed",
    actionText: "Download 90+ Portable Tools",
  },
];

const COMPARISON_ROWS = [
  {
    feature: "Specialized SEO & SERP Engines",
    generic: "❌ Hallucinates pixel widths & tag limits",
    doitai: "✅ 90+ hard-coded algorithmic validators",
  },
  {
    feature: "Live URL On-Page Crawling",
    generic: "❌ Often blocked or returns outdated summaries",
    doitai: "✅ 36-factor deep inspection of live HTML & schema",
  },
  {
    feature: "Offline PC Execution",
    generic: "❌ Requires constant cloud connection & subscription",
    doitai: "✅ 1-click standalone .ZIP apps run directly on your PC",
  },
  {
    feature: "Bring Your Own Key (BYOK) Privacy",
    generic: "❌ Tracks usage to train proprietary models",
    doitai: "✅ Plug in your Gemini/OpenAI key for 100% private execution",
  },
  {
    feature: "Pre-Built Infographics & Prompts",
    generic: "❌ Generic plain text replies",
    doitai: "✅ Verified infographics, cheat sheets & copy-paste prompts",
  },
];

const FAQS = [
  {
    q: "What is Do It AI, and why do people search 'Do it with AI'?",
    a: "Do It AI is our flagship AI SEO agent and workspace built by Do It With AI Tools. Users frequently search 'Do it with AI' or 'AI do it' when looking for actionable software that doesn't just chat, but actually executes real marketing tasks—like auditing on-page SEO, verifying SERP pixel limits, grouping keywords, and generating verified schema markup.",
  },
  {
    q: "How does Do It AI differ from standard ChatGPT or Gemini?",
    a: "Standard ChatGPT or Gemini provide conversational text but lack real-time SEO validation. Do It AI is wired into 90+ specialized tools: it measures real SERP pixel widths, verifies JSON-LD structured data against Schema.org standards, inspects heading hierarchy, and allows you to download and run standalone tool apps locally on your PC.",
  },
  {
    q: "Can I run Do It AI tools offline on my local computer?",
    a: "Yes! Every single tool in our catalog is available as a portable web app. You can download a unified .ZIP package from /download-and-embed, extract it, and double-click Run-Tool.html to use it on your PC without Node.js, npm, or terminal commands.",
  },
  {
    q: "What is the Bring Your Own Key (BYOK) privacy policy?",
    a: "When running portable tools, you can use our built-in cloud API for free. However, if you enter your personal Gemini or OpenAI API key, our default cloud API is permanently removed for that tool, and all future AI requests are sent directly and privately from your browser to your AI provider.",
  },
  {
    q: "Is Do It AI free to use?",
    a: "Yes. You can access the Do It AI workspace, execute specialized tools, and download standalone desktop tool packages for free.",
  },
];

export default function WhatOurAiToolCanDoPage() {
  const schema = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebApplication",
        name: "Do It AI — Unified AI SEO & Content Workspace",
        alternateName: ["Do It AI", "AI do it", "Do it with AI Tool", "What Our AI Tool Can Do"],
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
        ].map((item, i) => ({ "@type": "ListItem", position: i + 1, ...item })),
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
    <div className="min-h-screen bg-[#070D19] text-white">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(schema).replace(/</g, "\\u003c"),
        }}
      />

      {/* Hero Section */}
      <section className="relative overflow-hidden border-b border-slate-800/80 pt-28 pb-20">
        <div className="pointer-events-none absolute left-1/2 top-0 -translate-x-1/2 h-[500px] w-[900px] rounded-full bg-[#5271FF]/20 blur-[150px]" />

        <div className="mx-auto max-w-5xl px-4 text-center sm:px-6 relative z-10">
          <div className="inline-flex items-center gap-2 rounded-full border border-[#5271FF]/40 bg-[#5271FF]/15 px-4 py-1.5 text-xs font-black uppercase tracking-wider text-[#9aabff]">
            <Sparkles size={14} className="text-[#5271FF]" />
            <span>Official Guide &amp; Capability Showcase</span>
          </div>

          <h1 className="mt-5 text-3xl font-extrabold tracking-tight sm:text-5xl sm:leading-tight">
            What Our AI Tool Can Do:{" "}
            <span className="bg-gradient-to-r from-[#5271FF] via-[#7B96FF] to-cyan-400 bg-clip-text text-transparent">
              Put AI to Work with Do It AI
            </span>
          </h1>

          <p className="mx-auto mt-4 max-w-3xl text-sm leading-relaxed text-slate-300 sm:text-base">
            Stop switching between ten tabs and guessing prompt words.{" "}
            <strong>Do It AI</strong> connects you directly to <strong>90+ specialized SEO, content, and visual engines</strong>.
            From live 36-factor on-page audits and AI search (GEO/AEO) optimization to standalone desktop PC tools, here is everything our tool suite delivers.
          </p>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-3.5">
            <Link
              href="/do-it-ai"
              className="inline-flex items-center gap-2 rounded-2xl bg-[#5271FF] px-6 py-3.5 text-sm font-extrabold text-white shadow-xl shadow-[#5271FF]/30 transition hover:bg-[#4361EE] active:scale-95"
            >
              <Wand2 size={16} />
              <span>Launch Do It AI Workspace Free</span>
            </Link>

            <Link
              href="/download-and-embed"
              className="inline-flex items-center gap-2 rounded-2xl border border-slate-700 bg-slate-900/90 px-6 py-3.5 text-sm font-bold text-slate-200 transition hover:border-slate-500 hover:text-white"
            >
              <Download size={16} />
              <span>Download 90+ Portable Tools</span>
            </Link>
          </div>
        </div>
      </section>

      {/* 6 Core Capabilities */}
      <section className="py-20">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="text-center">
            <h2 className="text-2xl font-extrabold text-white sm:text-4xl">
              6 Ways Do It AI Powers Modern SEO &amp; Content Workflows
            </h2>
            <p className="mx-auto mt-2.5 max-w-2xl text-xs text-slate-400 sm:text-sm">
              Each capability is backed by real deterministic algorithms, Google guidelines, and modern GEO/AEO research.
            </p>
          </div>

          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {CAPABILITIES.map((cap, i) => (
              <div
                key={i}
                className="flex flex-col justify-between rounded-3xl border border-slate-800 bg-slate-900/70 p-6 shadow-lg transition hover:border-[#5271FF]/50"
              >
                <div>
                  <div className="text-3xl">{cap.icon}</div>
                  <h3 className="mt-4 text-lg font-bold text-white">
                    {cap.title}
                  </h3>
                  <p className="mt-2.5 text-xs leading-relaxed text-slate-300">
                    {cap.desc}
                  </p>
                </div>
                <Link
                  href={cap.actionLink}
                  className="mt-5 inline-flex items-center gap-1.5 text-xs font-extrabold text-[#7B96FF] hover:text-white transition"
                >
                  <span>{cap.actionText}</span>
                  <ArrowRight size={13} />
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Comparison Table: ChatGPT vs Do It AI */}
      <section className="border-y border-slate-800/80 bg-slate-950/70 py-20">
        <div className="mx-auto max-w-5xl px-4 sm:px-6">
          <div className="text-center">
            <div className="inline-flex items-center gap-2 rounded-full border border-purple-500/40 bg-purple-500/15 px-3.5 py-1 text-xs font-bold text-purple-300">
              <Cpu size={14} />
              <span>Engine Architecture Comparison</span>
            </div>
            <h2 className="mt-3 text-2xl font-extrabold text-white sm:text-4xl">
              Generic Chatbots vs. Do It AI Specialized Workspace
            </h2>
            <p className="mx-auto mt-2 max-w-2xl text-xs text-slate-400 sm:text-sm">
              Why specialized workflows outperform generic chatbot prompts every time.
            </p>
          </div>

          <div className="mt-10 overflow-hidden rounded-3xl border border-slate-800 bg-slate-900/90 shadow-2xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs sm:text-sm">
                <thead>
                  <tr className="border-b border-slate-800 bg-slate-950/80 text-slate-300">
                    <th className="p-4 sm:p-5 font-extrabold">Capability / Task</th>
                    <th className="p-4 sm:p-5 font-extrabold text-slate-400">Generic AI (ChatGPT, etc.)</th>
                    <th className="p-4 sm:p-5 font-extrabold text-[#7B96FF]">Do It AI Workspace</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/70 text-slate-300">
                  {COMPARISON_ROWS.map((row, idx) => (
                    <tr key={idx} className="hover:bg-slate-800/40 transition">
                      <td className="p-4 sm:p-5 font-bold text-white">
                        {row.feature}
                      </td>
                      <td className="p-4 sm:p-5 text-rose-300/90">
                        {row.generic}
                      </td>
                      <td className="p-4 sm:p-5 font-semibold text-emerald-300">
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

      {/* In-Depth FAQs */}
      <section className="py-20">
        <div className="mx-auto max-w-4xl px-4 sm:px-6">
          <div className="text-center">
            <h2 className="text-2xl font-extrabold text-white sm:text-4xl">
              Frequently Asked Questions About Do It AI
            </h2>
            <p className="mt-2 text-xs text-slate-400 sm:text-sm">
              Everything you need to know about our tools, SEO methodology, and offline portable apps.
            </p>
          </div>

          <div className="mt-10 space-y-4">
            {FAQS.map((item, idx) => (
              <div
                key={idx}
                className="rounded-2xl border border-slate-800 bg-slate-900/80 p-5 shadow-sm"
              >
                <h3 className="flex items-center gap-2 text-base font-bold text-white">
                  <HelpCircle size={17} className="text-[#5271FF] shrink-0" />
                  <span>{item.q}</span>
                </h3>
                <p className="mt-2.5 pl-6 text-xs sm:text-sm leading-relaxed text-slate-300">
                  {item.a}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Conversion Banner */}
      <section className="border-t border-slate-800/80 bg-gradient-to-r from-slate-950 via-[#0C152B] to-slate-950 py-16 text-center">
        <div className="mx-auto max-w-3xl px-4">
          <h2 className="text-2xl font-extrabold text-white sm:text-4xl">
            Ready to Put AI to Work on Your SEO?
          </h2>
          <p className="mx-auto mt-3 text-sm text-slate-300">
            Open the free Do It AI workspace now or download the complete 90+ portable tool suite for your computer.
          </p>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Link
              href="/do-it-ai"
              className="inline-flex items-center gap-2 rounded-2xl bg-[#5271FF] px-6 py-3.5 text-sm font-extrabold text-white shadow-xl shadow-[#5271FF]/30 transition hover:bg-[#4361EE]"
            >
              <span>Launch Do It AI Workspace</span>
              <ArrowRight size={16} />
            </Link>
            <Link
              href="/download-and-embed"
              className="inline-flex items-center gap-2 rounded-2xl border border-slate-700 bg-slate-900 px-6 py-3.5 text-sm font-bold text-slate-200 transition hover:border-slate-500 hover:text-white"
            >
              <span>Browse 90+ Portable Tools</span>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
