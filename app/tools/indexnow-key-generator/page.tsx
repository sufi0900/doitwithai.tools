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

      <div className={`relative overflow-hidden ${toolHeroSurface} pb-20 pt-10 text-white sm:pt-16 lg:pb-28`}>
        <ToolHeroBackground />

        <div className="relative mx-auto max-w-[1500px] px-4 sm:px-6 lg:px-8">
          <nav
            aria-label="Breadcrumb"
            className="mb-10 flex flex-wrap items-center gap-2 text-xs font-semibold text-slate-400"
          >
            <Link href="/" className="transition hover:text-white">
              Home
            </Link>
            <span>/</span>
            <Link href="/tools" className="transition hover:text-white">
              Tools
            </Link>
            <span>/</span>
            <span className="text-blue-200">IndexNow Key Generator & URL Submitter</span>
          </nav>

          <div className="mx-auto max-w-5xl text-center">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-2 text-xs font-extrabold uppercase tracking-[0.16em] text-blue-100 backdrop-blur">
              <Sparkles className="h-4 w-4 text-cyan-300" /> Technical SEO
            </div>
            <h1 className="mt-7 text-4xl font-black leading-[1.06] tracking-[-0.045em] sm:text-6xl lg:text-7xl">
              IndexNow Key Generator
              <span className={`block ${toolHeroHeading}`}>
                And Instant URL Submitter
              </span>
            </h1>
            <p className="mx-auto mt-6 max-w-3xl text-base leading-8 text-slate-300 sm:text-lg">
              Create your IndexNow key, download the key file, confirm it&apos;s live on your site, and
              tell participating search engines about new, updated, or deleted pages ; all from one
              page.
            </p>
            <div className="mt-7 flex flex-wrap justify-center gap-3 text-xs font-bold text-slate-300">
              {[
                [Key, "Key file ready to download"],
                [ShieldCheck, "Review before publishing"],
              ].map(([Icon, label]) => {
                const FeatureIcon = Icon as typeof Key;
                return (
                  <span
                    key={label as string}
                    className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.06] px-3 py-2"
                  >
                    <FeatureIcon className="h-3.5 w-3.5 text-blue-300" />
                    {label as string}
                  </span>
                );
              })}
            </div>
            <a
              href="#indexnow-key-generator"
              className="mt-8 inline-flex items-center gap-2 rounded-xl bg-white px-5 py-3.5 text-sm font-extrabold text-slate-950 shadow-xl transition hover:-translate-y-0.5 hover:bg-blue-50"
            >
              Generate your key <ArrowRight className="h-4 w-4" />
            </a>
          </div>

          <div className="mt-14">
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
