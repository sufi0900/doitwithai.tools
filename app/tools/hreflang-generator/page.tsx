import ToolFaq from "@/features/tool-ui/ToolFaq";
import ToolLandingHero from "@/features/tool-ui/ToolLandingHero";
import ToolResources from "@/features/tool-catalog/ToolResources";
import type { Metadata } from "next";
import Link from "next/link";
import HreflangClient from "@/features/hreflang-generator/HreflangClient";
import HreflangTutorial from "@/features/hreflang-generator/HreflangTutorial";
import HreflangEducation from "@/features/hreflang-generator/HreflangEducation";

const pageUrl = "https://doitwithai.tools/tools/hreflang-generator";

export const metadata: Metadata = {
  title: "Free Hreflang Tag Generator & Validator",
  description:
    "Build reciprocal hreflang tags for your language and region page versions, or check a live page's existing tags. Quick-add common codes, HTML and HTTP header output. ",
  keywords: [
    "hreflang generator",
    "hreflang tag generator",
    "hreflang validator",
    "international SEO",
    "multilingual SEO",
    "x-default",
  ],
  alternates: { canonical: pageUrl },
  openGraph: {
    type: "website",
    url: pageUrl,
    title: "Free Hreflang Tag Generator & Validator",
    description: "Build reciprocal hreflang tags for your language/region page versions, or validate a live page.",
    siteName: "Do It With AI Tools",
    images: [
      {
        url: "https://doitwithai.tools/ogimage.png",
        width: 1200,
        height: 630,
        alt: "Do It With AI Tools Hreflang Tag Generator",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Free Hreflang Tag Generator & Validator",
    description: "Build and validate reciprocal hreflang tags for multilingual and multi-region pages.",
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
    question: "Why does the tool keep saying \"must be reciprocal\"?",
    answer:
      "hreflang only works when every listed version links to every other version, including itself. If Page A lists Page B but Page B doesn't list Page A back, search engines commonly ignore the relationship. This tool's output is the same block for every page by construction, so copying it onto each version keeps them reciprocal automatically.",
  },
  {
    question: "What's the difference between the HTML and HTTP header output?",
    answer:
      "The HTML <link> tags go in a page's <head> section. The HTTP Link header format does the same job for files where you can't add HTML, like PDFs ; it's set at the server/CDN level instead.",
  },
  {
    question: "Do I need a region code, or is a language code enough?",
    answer:
      "A bare language code like \"en\" or \"ar\" is valid and often the right choice if your content doesn't actually vary by region. Add a region (en-US, ar-AE) only when you have genuinely different content for that specific region.",
  },
];

const structuredData = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebApplication",
      "@id": `${pageUrl}#application`,
      name: "Do It With AI Tools Hreflang Tag Generator",
      url: pageUrl,
      applicationCategory: "SEOApplication",
      operatingSystem: "Any",
      browserRequirements: "Requires JavaScript",
      isAccessibleForFree: true,
      offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
      description: metadata.description,
      featureList: [
        "Deterministic hreflang tag builder",
        "Fetch and validate an existing live page's hreflang tags",
        "Quick-add common language/region codes",
        "HTML <link> and HTTP Link header output",
        "Validation checklist",
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
        { "@type": "ListItem", position: 3, name: "Hreflang Tag Generator", item: pageUrl },
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
      name: "How to use the Hreflang Tag Generator",
      step: [
        { "@type": "HowToStep", name: "Add each language or region version of this page", text: "Add the code and full absolute URL for every language/region version." },
        { "@type": "HowToStep", name: "Add x-default", text: "Add x-default as the fallback for visitors who don't match any listed version." },
        { "@type": "HowToStep", name: "Review the checklist", text: "Check for duplicate codes, invalid formats, non-absolute URLs, and a missing x-default." },
        { "@type": "HowToStep", name: "Copy the exact same block onto every listed page", text: "Paste the identical, self-referencing hreflang block onto every page version so they remain reciprocal." },
        { "@type": "HowToStep", name: "Validate after publishing", text: "Use \"Check a live page\" on a published URL to confirm the tags are live and correct." },
      ],
    },
  ],
};

export default function HreflangGeneratorPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />

      <ToolLandingHero
        slug="hreflang-generator"
        title="Hreflang Tag Generator & Live Return-Tag Validator"
        description="Generate reciprocal hreflang annotations for multi-language and multi-region pages, or fetch a live URL to audit language codes, x-default fallback, and HTML/sitemap output."
        categoryLabel="International SEO"
        categoryHref="/tools"
        workspaceId="tool-studio-workspace"
      >
        <div className="p-4 sm:p-6">
          <HreflangClient />
        </div>
      </ToolLandingHero>

      <HreflangTutorial />
      <HreflangEducation />

      <ToolFaq title="Hreflang generator FAQ" faqs={faqs} />
      <ToolResources slug="hreflang-generator" />
    </>
  );
}
