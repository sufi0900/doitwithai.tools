import type { Metadata } from "next";
import Link from "next/link";
import { Code2, Globe, Laptop, ShieldCheck } from "lucide-react";
import DownloadableToolsHubClient from "@/features/portable-tool-kit/DownloadableToolsHubClient";
import ToolFaq from "@/features/tool-ui/ToolFaq";
import ToolResources from "@/features/tool-catalog/ToolResources";
import {
  ToolHeroBackground,
  toolHeroHeading,
  toolHeroSurface,
} from "@/features/tool-ui/ToolHero";

const pageUrl = "https://doitwithai.tools/tools/downloadable-ai-tools";
const title =
  "90+ Free Downloadable & Embeddable AI SEO Tools (HTML & React Code)";
const description =
  "Download standalone HTML5 and React (.tsx) versions of 90+ AI SEO, content, and marketing tools. Run them offline on your PC, embed them on WordPress, or customize them with AI prompts.";

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
    question: "How do I run a downloaded .html tool on my Windows or Mac PC?",
    answer:
      "Simply click '1-Click .HTML' on any tool card below to save the standalone .html file to your computer, then double-click it. It opens directly in Chrome, Edge, Brave, or Safari with zero installation, terminal commands, or coding required.",
  },
  {
    question: "Can I embed these tools on my own WordPress, Webflow, or Next.js website?",
    answer:
      "Yes. Click 'Customize & TSX' on any tool to copy a responsive <iframe> embed snippet for WordPress/Webflow, download the self-contained HTML file to host on Netlify Drop or Cloudflare Pages, or copy the React (.tsx) component for Next.js.",
  },
  {
    question: "Do the downloaded tools require a paid API key to work?",
    answer:
      "No. Every downloaded tool includes a built-in deterministic JavaScript engine that runs 100% locally in the browser at zero cost. If you want optional live AI expansion, you can paste your own free Google Gemini API key into the local settings drawer (stored only in your browser's localStorage).",
  },
  {
    question: "How can I customize a downloaded tool for my specific niche without coding?",
    answer:
      "Open the 'Customize & TSX' modal on any tool and select Tab 4 ('Vibe-Coding Prompts'). You will find 4 sequential copy-paste prompts you can feed into ChatGPT, Claude, or Cursor to adapt the tool's niche, scoring rules, and lead-capture CTA.",
  },
];

const section = "mx-auto max-w-6xl px-4 py-12 sm:px-6";
const prose = "mt-4 text-base leading-8 text-slate-600 dark:text-slate-300";

export default function DownloadableAiToolsPage() {
  const schema = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebApplication",
        name: "Downloadable & Embeddable AI SEO Tools Studio",
        url: pageUrl,
        description,
        applicationCategory: "DeveloperApplication",
        operatingSystem: "Any",
        isAccessibleForFree: true,
        offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { name: "Home", item: "https://doitwithai.tools" },
          { name: "Tools", item: "https://doitwithai.tools/tools" },
          { name: "Downloadable AI Tools", item: pageUrl },
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
            <span aria-current="page">Downloadable AI Tools</span>
          </nav>

          <div className="grid items-center gap-8 lg:grid-cols-[minmax(0,1.35fr)_minmax(0,0.85fr)]">
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-[#b4c3ff]">
                Build with AI · Portable HTML, React &amp; Vibe-Coding Kit
              </p>
              <h1 className="mt-4 text-3xl font-black leading-tight sm:text-4xl lg:text-5xl">
                Download &amp; Embed 90+{" "}
                <span className={toolHeroHeading}>
                  Portable AI &amp; SEO Tools
                </span>
              </h1>
              <p className="mt-5 max-w-2xl text-base leading-8 text-slate-300">
                Don&apos;t just use our tools online—download the self-contained
                HTML5 or React (<code>.tsx</code>) code for any tool to run
                locally on your PC, embed on your WordPress or Next.js website,
                or customize using our Vibe-Coding prompt blueprints.
              </p>
              <div className="mt-7 flex flex-wrap gap-3 text-xs font-semibold text-slate-200">
                <span className="rounded-lg border border-white/15 px-3 py-2">
                  Zero-install single-file .HTML for PC
                </span>
                <span className="rounded-lg border border-white/15 px-3 py-2">
                  WordPress &lt;iframe&gt; &amp; React .TSX
                </span>
                <span className="rounded-lg border border-white/15 px-3 py-2">
                  Vibe-coding customization prompts
                </span>
              </div>
            </div>

            <div className="rounded-2xl border border-[#9aabff]/30 bg-[#101b30]/90 p-6 shadow-xl">
              <p className="text-xs font-bold uppercase tracking-wider text-[#b4c3ff]">
                4 Formats Included for Every Tool
              </p>
              <ul className="mt-4 space-y-2.5 text-xs text-slate-300">
                <li>
                  <strong className="text-emerald-300">
                    1. Standalone .HTML:
                  </strong>{" "}
                  Double-click on Windows or Mac to run offline in any browser.
                </li>
                <li>
                  <strong className="text-indigo-300">
                    2. Website Embed:
                  </strong>{" "}
                  Paste into WordPress, Webflow, or Shopify as an interactive
                  lead magnet.
                </li>
                <li>
                  <strong className="text-sky-300">3. React Component:</strong>{" "}
                  Clean <code>.tsx</code> widget ready for Next.js, Cursor, or
                  Bolt.
                </li>
                <li>
                  <strong className="text-amber-300">
                    4. Vibe-Coding Prompts:
                  </strong>{" "}
                  Step-by-step AI prompts explaining how we built it and how to
                  customize it.
                </li>
              </ul>
            </div>
          </div>
        </div>
      </header>

      <DownloadableToolsHubClient />

      <section
        className={`${section} border-t border-slate-200 dark:border-slate-800`}
      >
        <p className="text-xs font-bold uppercase tracking-wider text-[#5271ff]">
          Build &amp; Sell with AI — Without Writing Code
        </p>
        <h2 className="mt-3 text-3xl font-extrabold">
          Three ways to use our portable tool packages
        </h2>
        <p className={prose}>
          Whether you want a fast offline utility on your desktop, an
          interactive calculator on your blog to attract backlinks, or a
          starting template to learn AI vibe-coding, every package is ready to
          run in one click.
        </p>

        <div className="mt-8 grid gap-5 md:grid-cols-3">
          {[
            [
              Laptop,
              "Run Locally on Your PC",
              "Download the single-file .html package and open it directly in Chrome or Edge. All deterministic analysis runs locally in your browser.",
            ],
            [
              Globe,
              "Embed on Your Website for SEO",
              "Add useful interactive tools to your articles using the responsive embed snippet or standalone HTML file to boost dwell time and earn natural backlinks.",
            ],
            [
              Code2,
              "Customize with Vibe-Coding Prompts",
              "Use the included 4-step prompt blueprint in ChatGPT, Claude, or Cursor to adapt colors, fields, and industry presets without manual coding.",
            ],
          ].map(([Icon, heading, body]) => {
            const I = Icon as typeof ShieldCheck;
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

      <ToolResources slug="downloadable-ai-tools" />
      <ToolFaq
        title="Downloadable & embeddable AI tools questions"
        faqs={faqs}
      />
    </div>
  );
}
