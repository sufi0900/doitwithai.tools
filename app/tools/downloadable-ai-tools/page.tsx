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
  "125+ Free Downloadable & Embeddable AI SEO Tools (PC App, HTML5 & React Component)";
const description =
  "Download unified Next.js + HTML5 desktop and web app packages for 125+ AI SEO tools. Run on your Windows or Mac PC with zero terminal setup, use our Default Cloud API or custom BYOK key, customize brand colors, and embed on WordPress, Webflow, or Shopify.";

export const metadata: Metadata = {
  title,
  description,
  keywords: [
    "downloadable AI SEO tools",
    "embeddable SEO widgets for WordPress",
    "offline SEO tools for PC",
    "free HTML5 SEO tools",
    "portable React SEO components",
    "standalone client side SEO calculator",
    "white label SEO tools with BYOK",
    "vibe coding SEO tools",
    "Next.js embeddable SEO widgets",
    "zero install desktop SEO app",
    "Do It With AI Tools",
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
    question: "How do I run a downloaded tool on my Windows or Mac PC without terminal commands?",
    answer:
      "Click 'App + Manual' on any tool card below to save the unified .html app and User Manual (.md) to your PC. Simply double-click the .html file—it opens directly in Chrome, Edge, Brave, or Safari like a desktop app with zero terminal commands, npm installs, or coding required.",
  },
  {
    question: "Does the downloaded tool use your API key by default, or can I use my own API key?",
    answer:
      "By default, when your PC is connected to the internet, every AI-powered downloaded tool connects to DoItWithAI.tools' built-in Cloud API automatically so you can use it immediately without entering an API key. For long-term local PC usage, we recommend clicking 'Use Your Own API Key' to enter your own Gemini or OpenAI key. Caution: Once you save your own API key, our default API key is permanently removed from that downloaded tool.",
  },
  {
    question: "Can I edit the tool's content, colors, and branding before or after downloading?",
    answer:
      "Yes. You can pick any custom brand color using the 'Custom Color' picker wheel, edit the tool's heading, subtitle, and brand label before downloading, or click 'Edit Content & Color' right inside the downloaded app. You can also click directly inside any generated result block to edit the text before exporting.",
  },
  {
    question: "How do I embed these tools on WordPress, Webflow, Shopify, or Next.js?",
    answer:
      "Click 'Edit & Embed' on any tool card and open Tab 2 ('Website Embed <iframe>') to copy a clean, chromeless iframe snippet styled with your exact accent and background colors, or open Tab 4 ('React .tsx') to download a ready-to-use Next.js component.",
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
                Download &amp; Embed 125+{" "}
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
