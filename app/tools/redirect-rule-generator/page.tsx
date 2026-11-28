import ToolFaq from "@/features/tool-ui/ToolFaq";
import ToolLandingHero from "@/features/tool-ui/ToolLandingHero";
import ToolResources from "@/features/tool-catalog/ToolResources";
import type { Metadata } from "next";
import Link from "next/link";
import RedirectRuleClient from "@/features/redirect-rules/RedirectRuleClient";
import RedirectRuleTutorial from "@/features/redirect-rules/RedirectRuleTutorial";
import RedirectRuleEducation from "@/features/redirect-rules/RedirectRuleEducation";

const pageUrl = "https://doitwithai.tools/tools/redirect-rule-generator";

export const metadata: Metadata = {
  title: "Free 301 Redirect Rule Generator for Next.js, Apache & Nginx",
  description:
    "Turn a list of old and new URLs into redirect rules for Next.js, Vercel, Netlify, Cloudflare Pages, Apache, and Nginx. Detects loops, flattens chains, and runs in your browser ; ",
  keywords: [
    "301 redirect generator",
    "redirect rule generator",
    "htaccess redirect generator",
    "nginx redirect generator",
    "next.js redirects generator",
    "bulk redirect tool",
  ],
  alternates: { canonical: pageUrl },
  openGraph: {
    type: "website",
    url: pageUrl,
    title: "Free 301 Redirect Rule Generator for Next.js, Apache & Nginx",
    description: "Bulk-convert old and new URLs into safe redirect rules for your hosting platform.",
    siteName: "Do It With AI Tools",
    images: [
      {
        url: "https://doitwithai.tools/ogimage.png",
        width: 1200,
        height: 630,
        alt: "Do It With AI Tools Redirect Rule Generator",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Free 301 Redirect Rule Generator for Next.js, Apache & Nginx",
    description: "Generate and check redirect rules in seconds.",
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
    question: "Which platforms does the redirect generator support?",
    answer:
      "Next.js (next.config.js), Vercel (vercel.json), Netlify and Cloudflare Pages (_redirects), Apache (.htaccess using mod_alias), and Nginx (rewrite rules).",
  },
  {
    question: "What is the difference between a 301 and a 302 redirect?",
    answer:
      "A 301 signals a permanent move, so search engines treat the new URL as the replacement. A 302 signals a temporary move. Use 301 for permanent URL changes. 308 and 307 are the permanent and temporary equivalents that also preserve the request method.",
  },
  {
    question: "Can I redirect a whole folder?",
    answer:
      "Yes. End both the old and new URL with /*, for example /old-blog/*, /blog/*. Everything under the old folder is redirected to the same path under the new one. You can also send a whole section to a single page by leaving the * off the destination.",
  },
  {
    question: "Why were some of my rules rejected?",
    answer:
      "The tool leaves out rules that would loop, redirect a URL to itself, conflict with an earlier rule, match on a ?query string, or contain characters that can't be written safely into server configs. Each rejection is listed with its line number and the reason.",
  },
  {
    question: "Does this redirect www to non-www or http to https?",
    answer:
      "No. Those are host-level rules, usually set up in your hosting or DNS settings. This tool creates path-level redirects for individual URLs and sections.",
  },
  {
    question: "Is my list of URLs uploaded anywhere?",
    answer:
      "No. Everything runs in your browser, and nothing is sent to a server.",
  },
];

const structuredData = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebApplication",
      "@id": `${pageUrl}#application`,
      name: "Do It With AI Tools Redirect Rule Generator",
      url: pageUrl,
      applicationCategory: "SEOApplication",
      operatingSystem: "Any",
      browserRequirements: "Requires JavaScript",
      isAccessibleForFree: true,
      offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
      description: metadata.description,
      featureList: [
        "Bulk-convert old and new URLs into redirect rules",
        "Output for Next.js, Vercel, Netlify, Cloudflare Pages, Apache, and Nginx",
        "Section redirects with a trailing /* wildcard",
        "Loop, duplicate, and self-redirect detection",
        "Automatic redirect chain flattening",
        "Cleaned redirect map export as CSV",
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
        { "@type": "ListItem", position: 3, name: "Redirect Rule Generator", item: pageUrl },
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
      name: "How to create 301 redirect rules",
      step: [
        { "@type": "HowToStep", name: "List every old URL and where it should go", text: "Write one rule per line: old URL, new URL, and an optional status code." },
        { "@type": "HowToStep", name: "Pick the closest matching destination", text: "Send each old URL to the most relevant new page." },
        { "@type": "HowToStep", name: "Read the safety checks", text: "Review flagged loops, conflicts, and chains before copying the rules." },
        { "@type": "HowToStep", name: "Choose your platform and copy the rules", text: "Select Next.js, Vercel, Netlify, Apache, or Nginx and add the rules to your configuration." },
        { "@type": "HowToStep", name: "Deploy and test with curl", text: "Check the status code and location header for several old URLs." },
        { "@type": "HowToStep", name: "Update links and your sitemap", text: "Point internal links and your sitemap at the new URLs and monitor Search Console." },
      ],
    },
  ],
};

export default function RedirectRuleGeneratorPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />

      <ToolLandingHero
        slug="redirect-rule-generator"
        title="301 Redirect Rule Generator & Chain Checker"
        description="Convert a list of old and new URLs into production-ready redirect rules for Next.js, Apache (.htaccess), Nginx, Cloudflare, and Vercel—while automatically flattening chains."
        categoryLabel="Technical SEO"
        categoryHref="/tools"
        workspaceId="tool-studio-workspace"
      >
        <div className="p-4 sm:p-6">
          <RedirectRuleClient />
        </div>
      </ToolLandingHero>

      <RedirectRuleTutorial />
      <RedirectRuleEducation />

      <ToolFaq title="Redirect rule generator FAQ" faqs={faqs} />
      <ToolResources slug="redirect-rule-generator" />
    </>
  );
}
