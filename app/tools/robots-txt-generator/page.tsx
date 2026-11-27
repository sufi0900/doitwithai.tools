import ToolResources from "@/features/tool-catalog/ToolResources";
import ToolLandingHero from "@/features/tool-ui/ToolLandingHero";
import type { Metadata } from "next";
import Link from "next/link";
import { CheckCircle2 } from "lucide-react";
import RobotsClient from "@/features/robots-generator/RobotsClient";
import RobotsEducation from "@/features/robots-generator/RobotsEducation";

const pageUrl = "https://doitwithai.tools/tools/robots-txt-generator";

export const metadata: Metadata = {
  title: "Free Robots.txt Generator & AI Crawler Checker",
  description:
    "Build and validate robots.txt rules. Review crawler access and download a file for your website.",
  keywords: [
    "robots.txt generator",
    "robots.txt validator",
    "AI crawler blocker",
    "GPTBot",
    "ClaudeBot",
    "PerplexityBot",
    "Google-Extended",
    "GEO tool",
  ],
  alternates: { canonical: pageUrl },
  openGraph: {
    type: "website",
    url: pageUrl,
    title: "Free Robots.txt Generator & AI Crawler Checker",
    description:
      "Build or validate robots.txt and see which AI crawlers are allowed or blocked, with a live checklist.",
    siteName: "Do It With AI Tools",
    images: [
      {
        url: "https://doitwithai.tools/ogimage.png",
        width: 1200,
        height: 630,
        alt: "Do It With AI Tools Robots.txt Generator",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Free Robots.txt Generator & AI Crawler Checker",
    description:
      "Build or validate robots.txt with a live AI-crawler access matrix.",
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
    question: "Can I edit the file before downloading it?",
    answer:
      "Use the supplied controls to prepare your file, review its contents, and download it when ready.",
  },
  {
    question: "Why does the AI crawler matrix list three bots per company?",
    answer:
      "Most major AI labs run a training crawler, a search/retrieval crawler for their own answer engine, and a user-triggered fetcher for pages a person explicitly asked about. They're controlled separately, and several user-triggered fetchers are documented as ignoring robots.txt by design since a person; not an autonomous crawler; requested the page.",
  },
  {
    question: "Is robots.txt a security measure?",
    answer:
      "No. It only works because well-behaved crawlers choose to respect it, and it does not hide a URL from anyone who already has the link. Use authentication or server-level access rules for anything that actually needs to stay private.",
  },
  {
    question: 'What does "Disallow:" with nothing after it mean?',
    answer:
      "It means allow everything; the opposite of what many people assume. It's the single most common hand-written robots.txt mistake, which is why this tool flags it as a note whenever it appears.",
  },
];

const structuredData = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebApplication",
      "@id": `${pageUrl}#application`,
      name: "Do It With AI Tools Robots.txt Generator",
      url: pageUrl,
      applicationCategory: "SEOApplication",
      operatingSystem: "Any",
      browserRequirements: "Requires JavaScript",
      isAccessibleForFree: true,
      offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
      description: metadata.description,
      featureList: [
        "Editable robots.txt builder",
        "Fetch and validate an existing live robots.txt",
        "AI crawler access matrix with one-click allow/block",
        "Validation checklist",
        "Copy and download",
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
        {
          "@type": "ListItem",
          position: 1,
          name: "Home",
          item: "https://doitwithai.tools",
        },
        {
          "@type": "ListItem",
          position: 2,
          name: "Tools",
          item: "https://doitwithai.tools/tools",
        },
        {
          "@type": "ListItem",
          position: 3,
          name: "Robots.txt Generator",
          item: pageUrl,
        },
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
  ],
};

export default function RobotsTxtGeneratorPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />

      <ToolLandingHero
        slug="robots-txt-generator"
        title="Robots.txt Generator & AI Crawler Access Matrix"
        description="Build a clean robots.txt file from scratch or fetch your live domain's rules. Control Googlebot alongside named AI training, search, and user-fetch bots in one click."
        categoryLabel="Technical SEO & GEO"
        categoryHref="/tools"
        workspaceId="tool-studio-workspace"
      >
        <div className="p-4 sm:p-6">
          <RobotsClient />
        </div>
      </ToolLandingHero>

      <RobotsEducation />

      <section className="border-t border-slate-200 bg-white py-20 dark:border-slate-800 dark:bg-slate-950">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <p className="text-xs font-extrabold uppercase tracking-[0.17em] text-[#5271ff]">
              Common questions
            </p>
            <h2 className="mt-3 text-3xl font-black tracking-tight text-slate-950 dark:text-white sm:text-4xl">
              Robots.txt generator FAQ
            </h2>
          </div>
          <div className="mt-10 grid gap-4 md:grid-cols-2">
            {faqs.map((faq) => (
              <details
                key={faq.question}
                className="group rounded-2xl border border-slate-200 bg-slate-50 p-5 open:bg-white dark:border-slate-800 dark:bg-slate-900 dark:open:bg-slate-900"
              >
                <summary className="flex cursor-pointer list-none items-start justify-between gap-4 text-sm font-extrabold text-slate-950 dark:text-white">
                  {faq.question}
                  <CheckCircle2 className="h-4 w-4 shrink-0 text-[#5271ff]" />
                </summary>
                <p className="mt-3 text-sm leading-7 text-slate-600 dark:text-slate-300">
                  {faq.answer}
                </p>
              </details>
            ))}
          </div>
        </div>
      </section>
      <ToolResources slug="robots-txt-generator" />
    </>
  );
}
