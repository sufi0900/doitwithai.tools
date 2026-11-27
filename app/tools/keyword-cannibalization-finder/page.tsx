import ToolFaq from "@/features/tool-ui/ToolFaq";
import ToolLandingHero from "@/features/tool-ui/ToolLandingHero";
import ToolResources from "@/features/tool-catalog/ToolResources";
import type { Metadata } from "next";
import Link from "next/link";
import KeywordCannibalizationClient from "@/features/keyword-cannibalization/KeywordCannibalizationClient";
import KeywordCannibalizationTutorial from "@/features/keyword-cannibalization/KeywordCannibalizationTutorial";
import KeywordCannibalizationEducation from "@/features/keyword-cannibalization/KeywordCannibalizationEducation";

const pageUrl = "https://doitwithai.tools/tools/keyword-cannibalization-finder";

export const metadata: Metadata = {
  title: "Free Keyword Cannibalization Finder for Search Console Data",
  description:
    "Upload a Query + Page CSV from Google Search Console and find queries where several of your pages compete. See the leading page, impression split, and a suggested next step. Runs in your browser ; review before publishing.",
  keywords: [
    "keyword cannibalization checker",
    "keyword cannibalization tool",
    "find cannibalized keywords",
    "search console cannibalization",
    "duplicate keyword targeting",
    "seo content audit tool",
  ],
  alternates: { canonical: pageUrl },
  openGraph: {
    type: "website",
    url: pageUrl,
    title: "Free Keyword Cannibalization Finder for Search Console Data",
    description: "Find queries where your own pages compete, and decide which page should own each one.",
    siteName: "Do It With AI Tools",
    images: [
      {
        url: "https://doitwithai.tools/ogimage.png",
        width: 1200,
        height: 630,
        alt: "Do It With AI Tools Keyword Cannibalization Finder",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Free Keyword Cannibalization Finder for Search Console Data",
    description: "Turn a Query + Page CSV into a clear list of competing pages.",
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
    question: "Which file do I need to use this tool?",
    answer:
      "Upload a Search Console CSV or ZIP for a performance preview. To compare competing pages, use a combined Query + Page CSV. Alternatively, upload query exports filtered to individual pages and assign each page URL. Separate overall Queries and Pages totals cannot establish overlap.",
  },
  {
    question: "Is my Search Console data uploaded anywhere?",
    answer:
      "No. The file is read and analyzed inside your browser tab. Nothing is sent to a server, and closing the tab discards it.",
  },
  {
    question: "Does a query ranking with two of my pages always mean a problem?",
    answer:
      "No. Search engines sometimes show two results from one site, and two pages can serve different intents. This tool highlights where pages overlap so you can review them, not to prove an error.",
  },
  {
    question: "What does \"split impressions\" mean?",
    answer:
      "It is the number of impressions that go to the competing pages other than the leader ; the page with the most clicks for that query. A larger number means more of the query's visibility is spread across your pages.",
  },
  {
    question: "Why isn't a query I expected showing up?",
    answer:
      "A page only counts as competing if it passes your minimum impressions and minimum share settings. Lower those thresholds, or turn off exclusions, to widen the net.",
  },
  {
    question: "Does the tool tell me which pages to delete?",
    answer:
      "No. It gives rule-based suggestions such as merging, differentiating, or fixing internal links. You should always review the pages and their intent before changing or removing anything.",
  },
];

const structuredData = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebApplication",
      "@id": `${pageUrl}#application`,
      name: "Do It With AI Tools Keyword Cannibalization Finder",
      url: pageUrl,
      applicationCategory: "SEOApplication",
      operatingSystem: "Any",
      browserRequirements: "Requires JavaScript",
      isAccessibleForFree: true,
      offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
      description: metadata.description,
      featureList: [
        "Find queries where two or more of your pages compete",
        "Leading page, position, impressions, clicks, and share for each competing page",
        "Adjustable thresholds and brand-term exclusion",
        "Treats URL parameters and trailing slashes as the same page",
        "Rule-based suggested next steps",
        "Page pairs that compete most often",
        "Export the report as CSV",
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
        { "@type": "ListItem", position: 3, name: "Keyword Cannibalization Finder", item: pageUrl },
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
      name: "How to find keyword cannibalization with Search Console data",
      step: [
        { "@type": "HowToStep", name: "Get a combined Query + Page export", text: "Export a CSV that contains Query, Page, Clicks, Impressions, and Position columns." },
        { "@type": "HowToStep", name: "Load the CSV into the tool", text: "Drop the file onto the upload box or paste the CSV text. It is analyzed in your browser." },
        { "@type": "HowToStep", name: "Set what counts as a competing page", text: "Adjust the minimum impressions and share, and exclude brand terms." },
        { "@type": "HowToStep", name: "Review the queries with the most split impressions", text: "Open each query to compare the leading page with the pages competing against it." },
        { "@type": "HowToStep", name: "Choose one action per query", text: "Merge and redirect, re-target the weaker page, or fix internal links." },
        { "@type": "HowToStep", name: "Re-export and compare after a few weeks", text: "Check whether a single page now takes a larger share of impressions." },
      ],
    },
  ],
};

export default function KeywordCannibalizationFinderPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />

      <ToolLandingHero
        slug="keyword-cannibalization-finder"
        title="Keyword Cannibalization & Competing Page Finder"
        description="Import a Google Search Console query-and-page export to spot search terms where multiple URLs on your domain split impressions and clicks—plus see which page leads."
        categoryLabel="Search Console SEO"
        categoryHref="/tools"
        workspaceId="tool-studio-workspace"
      >
        <div className="p-4 sm:p-6">
          <KeywordCannibalizationClient />
        </div>
      </ToolLandingHero>

      <KeywordCannibalizationTutorial />
      <KeywordCannibalizationEducation />

      <ToolFaq title="Keyword cannibalization finder FAQ" faqs={faqs} />
      <ToolResources slug="keyword-cannibalization-finder" />
    </>
  );
}
