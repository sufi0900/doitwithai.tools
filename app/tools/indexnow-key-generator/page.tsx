import PortableToolHeroBar from "@/features/portable-tool-kit/PortableToolHeroBar";
import ToolFaq from "@/features/tool-ui/ToolFaq";
import { ToolHeroBackground, toolHeroSurface, toolHeroHeading } from "@/features/tool-ui/ToolHero";
import ToolResources from "@/features/tool-catalog/ToolResources";
import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowRight,
  CheckCircle2,
  Key,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import IndexNowClient from "@/features/indexnow/IndexNowClient";
import IndexNowTutorial from "@/features/indexnow/IndexNowTutorial";
import IndexNowEducation from "@/features/indexnow/IndexNowEducation";

const pageUrl = "https://doitwithai.tools/tools/indexnow-key-generator";

export const metadata: Metadata = {
  title: "Free IndexNow Key Generator & URL Submitter",
  description:
    "Generate an IndexNow key, download the key file, verify it on your site, and submit new or updated URLs to participating search engines. ",
  keywords: [
    "indexnow key generator",
    "indexnow submit urls",
    "indexnow tool",
    "bing indexnow",
    "submit url to search engines",
    "indexnow key file",
  ],
  alternates: { canonical: pageUrl },
  openGraph: {
    type: "website",
    url: pageUrl,
    title: "Free IndexNow Key Generator & URL Submitter",
    description: "Generate your key, verify the key file, and notify search engines about new or updated pages.",
    siteName: "Do It With AI Tools",
    images: [
      {
        url: "https://doitwithai.tools/ogimage.png",
        width: 1200,
        height: 630,
        alt: "Do It With AI Tools IndexNow Key Generator and URL Submitter",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Free IndexNow Key Generator & URL Submitter",
    description: "Generate an IndexNow key and submit changed URLs in minutes.",
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
    question: "Can I review the results before using them?",
    answer: "Yes. Review the output and highlighted issues before making changes to your website.",
  },
  {
    question: "Does IndexNow work for Google?",
    answer:
      "Google is not a participating IndexNow engine at the time of writing. For Google, keep an up-to-date XML sitemap and use Search Console. The current list of participating engines is published at indexnow.org.",
  },
  {
    question: "Does submitting a URL guarantee it will be indexed?",
    answer:
      "No. IndexNow only notifies search engines that a URL changed. Each engine decides whether and when to crawl, index, and rank it.",
  },
  {
    question: "Where exactly should the key file go?",
    answer:
      "At the root of your host, so it opens at https://your-domain/your-key.txt and returns only the key. This tool's \"Check key file\" button confirms that before you submit.",
  },
  {
    question: "Is my key or domain stored on your server?",
    answer:
      "The tool's server route forwards your request to IndexNow and does not store it. Your domain and key are saved only in your own browser so you can reuse them, and you can clear them by clearing site data.",
  },
  {
    question: "How many URLs can I submit at once?",
    answer:
      "The IndexNow protocol allows up to 10,000 URLs per request. This tool limits each submission to 1,000 to keep requests quick and reliable.",
  },
];

const structuredData = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebApplication",
      "@id": `${pageUrl}#application`,
      name: "Do It With AI Tools IndexNow Key Generator & URL Submitter",
      url: pageUrl,
      applicationCategory: "SEOApplication",
      operatingSystem: "Any",
      browserRequirements: "Requires JavaScript",
      isAccessibleForFree: true,
      offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
      description: metadata.description,
      featureList: [
        "Generate a random IndexNow key in your browser",
        "Download the ready-to-upload key file",
        "Verify the key file is live on your site",
        "Validate and de-duplicate URLs against your host",
        "Submit URLs to IndexNow and read the response in plain language",
        "Copy the equivalent cURL command",
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
        { "@type": "ListItem", position: 3, name: "IndexNow Key Generator & URL Submitter", item: pageUrl },
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
      name: "How to set up IndexNow and submit URLs",
      step: [
        { "@type": "HowToStep", name: "Enter your domain and generate a key", text: "Type your exact host and generate a random IndexNow key." },
        { "@type": "HowToStep", name: "Download the key file and upload it to your site root", text: "Host the key file so it opens at https://your-domain/your-key.txt." },
        { "@type": "HowToStep", name: "Check that the key file is live", text: "Use the key file check to confirm the file is reachable and its contents match the key." },
        { "@type": "HowToStep", name: "List the URLs that changed", text: "Paste one URL per line; the tool validates them against your host." },
        { "@type": "HowToStep", name: "Submit to IndexNow", text: "Submit the URLs and read the response status." },
        { "@type": "HowToStep", name: "Repeat whenever content changes", text: "Submit again when you publish, update, or delete pages." },
      ],
    },
  ],
};

export default function IndexNowKeyGeneratorPage() {
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
            <span aria-current="page">IndexNow Key Generator & URL Submitter</span>
          </nav>

          <div className="grid items-center gap-8 lg:grid-cols-[minmax(0,1.35fr)_minmax(0,0.85fr)]">
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-[#b4c3ff]">
                Technical SEO · Instant Search Engine Ping & Key Setup
              </p>
              <h1 className="mt-4 text-3xl font-black leading-tight sm:text-4xl lg:text-5xl">
                IndexNow Key Generator 
                <span className={toolHeroHeading}>
                  & Instant URL Submitter
                </span>
              </h1>
              <p className="mt-5 max-w-2xl text-base leading-8 text-slate-300">
                Generate a cryptographic IndexNow API key, download the verification .txt file, verify live hosting on your domain, and submit updated URLs to participating search engines.
              </p>
              <div className="mt-7 flex flex-wrap gap-3 text-xs font-semibold text-slate-200">
                <span className="rounded-lg border border-white/15 px-3 py-2">
                  1-click .txt key download
                </span>
                <span className="rounded-lg border border-white/15 px-3 py-2">
                  Live key-file verification
                </span>
                <span className="rounded-lg border border-white/15 px-3 py-2">
                  Bulk URL ping submission
                </span>
              </div>
              <PortableToolHeroBar />
            </div>

            <div className="rounded-2xl border border-[#9aabff]/30 bg-[#101b30]/90 p-6 shadow-xl">
              <p className="text-xs font-bold uppercase tracking-wider text-[#b4c3ff]">
                4 Steps to Instant Indexing
              </p>
              <ul className="mt-4 space-y-2.5 text-xs text-slate-300">
                <li>
                  <strong className="text-emerald-300">Generate Key:</strong> Creates a spec-compliant hexadecimal IndexNow key in your browser.
                </li>
                <li>
                  <strong className="text-indigo-300">Host Key File:</strong> Download the [key].txt file and place it in your site's root folder.
                </li>
                <li>
                  <strong className="text-sky-300">Verify Live URL:</strong> Confirm your key file returns HTTP 200 and matches your key.
                </li>
                <li>
                  <strong className="text-amber-300">Submit URLs:</strong> Ping IndexNow endpoints whenever you publish or update pages.
                </li>
              </ul>
            </div>
          </div>

          <div className="mt-8">
            <IndexNowClient />
          </div>
        </div>
      </div>

      <IndexNowTutorial />
      <IndexNowEducation />

      <ToolFaq title="IndexNow key generator FAQ" faqs={faqs} />
      <ToolResources slug="indexnow-key-generator" />
    </>
  );
}
