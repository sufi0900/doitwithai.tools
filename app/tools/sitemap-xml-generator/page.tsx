import PortableToolHeroBar from "@/features/portable-tool-kit/PortableToolHeroBar";
import ToolFaq from "@/features/tool-ui/ToolFaq";
import { ToolHeroBackground, toolHeroSurface, toolHeroHeading } from "@/features/tool-ui/ToolHero";
import ToolResources from "@/features/tool-catalog/ToolResources";
import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowRight,
  CheckCircle2,
  FileCode2,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import SitemapXmlClient from "@/features/sitemap-xml/SitemapXmlClient";
import SitemapXmlTutorial from "@/features/sitemap-xml/SitemapXmlTutorial";
import SitemapXmlEducation from "@/features/sitemap-xml/SitemapXmlEducation";

const pageUrl = "https://doitwithai.tools/tools/sitemap-xml-generator";

export const metadata: Metadata = {
  title: "Free Sitemap.xml Generator & Validator",
  description:
    "Create a valid sitemap.xml from a list of URLs, or paste an existing sitemap to check it for errors. Handles escaping, duplicates, 50,000-URL splitting, and sitemap index files. ",
  keywords: [
    "sitemap xml generator",
    "sitemap validator",
    "xml sitemap generator free",
    "sitemap index generator",
    "validate sitemap xml",
    "create sitemap from url list",
  ],
  alternates: { canonical: pageUrl },
  openGraph: {
    type: "website",
    url: pageUrl,
    title: "Free Sitemap.xml Generator & Validator",
    description: "Generate a clean sitemap.xml or validate your existing one ; right in your browser.",
    siteName: "Do It With AI Tools",
    images: [
      {
        url: "https://doitwithai.tools/ogimage.png",
        width: 1200,
        height: 630,
        alt: "Do It With AI Tools Sitemap.xml Generator and Validator",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Free Sitemap.xml Generator & Validator",
    description: "Build and check XML sitemaps in seconds.",
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
    question: "Do I need to include changefreq and priority?",
    answer:
      "No. Google says it ignores both fields, so they are off by default in this tool. A <lastmod> date is the one optional field worth adding, as long as it reflects real content changes.",
  },
  {
    question: "How many URLs can one sitemap contain?",
    answer:
      "Up to 50,000 URLs and 50 MB uncompressed. If your list is longer, this tool splits it into several sitemap files and creates a sitemap index that lists them.",
  },
  {
    question: "Does a sitemap guarantee my pages will be indexed?",
    answer:
      "No. A sitemap helps search engines discover URLs, but they decide what to crawl, index, and rank. Pages should be canonical, indexable, and worth indexing.",
  },
  {
    question: "Where do I put the sitemap file?",
    answer:
      "Upload it to your site root so it opens at https://your-domain/sitemap.xml, reference it with a Sitemap: line in robots.txt, and submit it in Google Search Console and Bing Webmaster Tools.",
  },
  {
    question: "Does the validator check my live site?",
    answer:
      "It checks the sitemap text you paste or load: XML structure, namespace, URL formats, dates, duplicates, and size limits. It does not fetch your pages, so it can't tell whether each URL returns a 200 status.",
  },
  {
    question: "Is my list of URLs uploaded anywhere?",
    answer:
      "No. Generation and validation run entirely in your browser, and nothing is sent to a server.",
  },
];

const structuredData = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebApplication",
      "@id": `${pageUrl}#application`,
      name: "Do It With AI Tools Sitemap.xml Generator & Validator",
      url: pageUrl,
      applicationCategory: "SEOApplication",
      operatingSystem: "Any",
      browserRequirements: "Requires JavaScript",
      isAccessibleForFree: true,
      offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
      description: metadata.description,
      featureList: [
        "Generate sitemap.xml from a list of URLs",
        "Automatic XML escaping, de-duplication, and #fragment removal",
        "Optional lastmod, changefreq, and priority",
        "Automatic splitting and sitemap index for more than 50,000 URLs",
        "Validate an existing sitemap or sitemap index",
        "Ready-to-copy robots.txt Sitemap line",
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
        { "@type": "ListItem", position: 1, name: "Home", item: "https://doitwithai.tools" },
        { "@type": "ListItem", position: 2, name: "Tools", item: "https://doitwithai.tools/tools" },
        { "@type": "ListItem", position: 3, name: "Sitemap.xml Generator & Validator", item: pageUrl },
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
    {
      "@type": "HowTo",
      name: "How to create and validate a sitemap.xml",
      step: [
        { "@type": "HowToStep", name: "Collect the URLs you want indexed", text: "Paste one canonical, indexable URL per line." },
        { "@type": "HowToStep", name: "Review the checks", text: "The tool removes duplicates and fragments and warns about invalid or mixed URLs." },
        { "@type": "HowToStep", name: "Choose optional fields", text: "Add lastmod only when accurate; changefreq and priority are ignored by Google." },
        { "@type": "HowToStep", name: "Download sitemap.xml and upload it to your site root", text: "Large lists are split automatically with a sitemap index." },
        { "@type": "HowToStep", name: "Reference and submit the sitemap", text: "Add the Sitemap line to robots.txt and submit it in Search Console and Bing Webmaster Tools." },
        { "@type": "HowToStep", name: "Validate after every change", text: "Paste your sitemap into the Validate tab to check structure, dates, duplicates, and limits." },
      ],
    },
  ],
};

export default function SitemapXmlGeneratorPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />

      <div className={`relative overflow-hidden ${toolHeroSurface} text-white`}>
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
            <span aria-current="page">Sitemap.xml Generator & Validator</span>
          </nav>

          <div className="grid items-center gap-8 lg:grid-cols-[minmax(0,1.35fr)_minmax(0,0.85fr)]">
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-[#b4c3ff]">
                Technical SEO · XML Sitemap Compiler & Protocol Auditor
              </p>
              <h1 className="mt-4 text-3xl font-black leading-tight sm:text-4xl lg:text-5xl">
                Sitemap.xml Generator 
                <span className={toolHeroHeading}>
                  & Live XML Validator
                </span>
              </h1>
              <p className="mt-5 max-w-2xl text-base leading-8 text-slate-300">
                Turn a list of canonical URLs into a standards-compliant XML sitemap (with automatic 50,000-URL index splitting) or paste an existing sitemap.xml to audit protocol errors.
              </p>
              <div className="mt-7 flex flex-wrap gap-3 text-xs font-semibold text-slate-200">
                <span className="rounded-lg border border-white/15 px-3 py-2">
                  Generate or validate XML
                </span>
                <span className="rounded-lg border border-white/15 px-3 py-2">
                  Auto-splits large URL lists
                </span>
                <span className="rounded-lg border border-white/15 px-3 py-2">
                  Instant .xml & robots.txt snippet
                </span>
              </div>
              <PortableToolHeroBar />
            </div>

            <div className="rounded-2xl border border-[#9aabff]/30 bg-[#101b30]/90 p-6 shadow-xl">
              <p className="text-xs font-bold uppercase tracking-wider text-[#b4c3ff]">
                4 Sitemap Protocol Checks
              </p>
              <ul className="mt-4 space-y-2.5 text-xs text-slate-300">
                <li>
                  <strong className="text-emerald-300">URL Normalization:</strong> Checks absolute HTTPS URLs, duplicates, and fragment exclusions.
                </li>
                <li>
                  <strong className="text-indigo-300">Metadata Tags:</strong> Formats ISO-8601 &lt;lastmod&gt;, &lt;changefreq&gt;, and &lt;priority&gt; nodes.
                </li>
                <li>
                  <strong className="text-sky-300">Size & Index Limits:</strong> Enforces the 50,000-URL / 50MB sitemaps.org protocol thresholds.
                </li>
                <li>
                  <strong className="text-amber-300">Validator Diagnostics:</strong> Catches malformed XML tags, non-canonical URLs, and namespace errors.
                </li>
              </ul>
            </div>
          </div>

          <div className="mt-8">
            <SitemapXmlClient />
          </div>
        </div>
      </div>

      <SitemapXmlTutorial />
      <SitemapXmlEducation />

      <ToolFaq title="Sitemap generator FAQ" faqs={faqs} />
      <ToolResources slug="sitemap-xml-generator" />
    </>
  );
}
