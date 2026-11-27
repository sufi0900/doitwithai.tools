import ToolFaq from "@/features/tool-ui/ToolFaq";
import ToolLandingHero from "@/features/tool-ui/ToolLandingHero";
import ToolResources from "@/features/tool-catalog/ToolResources";
import type { Metadata } from "next";
import Link from "next/link";
import OgPreviewClient from "@/features/og-preview/OgPreviewClient";
import OgPreviewTutorial from "@/features/og-preview/OgPreviewTutorial";
import OgPreviewEducation from "@/features/og-preview/OgPreviewEducation";

const pageUrl = "https://doitwithai.tools/tools/og-twitter-preview-generator";

export const metadata: Metadata = {
  title: "Free OG & Twitter Card Preview Generator",
  description:
    "Build and preview Open Graph and Twitter Card meta tags before you publish. Import existing tags from a URL, check image dimensions, and copy clean meta tags. ",
  keywords: [
    "open graph generator",
    "og tags generator",
    "twitter card generator",
    "social preview tool",
    "meta tags generator",
    "social media preview checker",
  ],
  alternates: { canonical: pageUrl },
  openGraph: {
    type: "website",
    url: pageUrl,
    title: "Free OG & Twitter Card Preview Generator",
    description: "Build, preview, and validate Open Graph and Twitter Card tags before you publish.",
    siteName: "Do It With AI Tools",
    images: [
      {
        url: "https://doitwithai.tools/ogimage.png",
        width: 1200,
        height: 630,
        alt: "Do It With AI Tools OG & Twitter Card Preview Generator",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Free OG & Twitter Card Preview Generator",
    description: "Build, preview, and validate social card meta tags before you publish.",
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
    question: "How do I check the image for a social card?",
    answer: "Enter its public image URL and choose Check dimensions. Review the reported size and the card preview before publishing.",
  },
  {
    question: "Why do I need both og:image and twitter:image?",
    answer:
      "X/Twitter checks its own twitter:* tags before falling back to Open Graph tags. Setting both means the card looks intentional on X as well as on Facebook, LinkedIn, Slack, Discord, and anywhere else that reads Open Graph.",
  },
  {
    question: "I updated my tags but the old card still shows when I share the link",
    answer:
      "That's the platform's cache, not your tags. Use Facebook's Sharing Debugger, X's Card Validator, or LinkedIn's Post Inspector to force a re-scrape of the URL.",
  },
];

const structuredData = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebApplication",
      "@id": `${pageUrl}#application`,
      name: "Do It With AI Tools OG & Twitter Card Preview Generator",
      url: pageUrl,
      applicationCategory: "SEOApplication",
      operatingSystem: "Any",
      browserRequirements: "Requires JavaScript",
      isAccessibleForFree: true,
      offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
      description: metadata.description,
      featureList: [
        "Live Facebook/LinkedIn and X/Twitter card previews",
        "Import existing OG/Twitter tags from a live URL",
        "Real image dimension and file-size check from the image's own header bytes",
        "Validation checklist",
        "Copy generated meta tags",
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
        { "@type": "ListItem", position: 3, name: "OG & Twitter Card Preview Generator", item: pageUrl },
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
      name: "How to use the OG & Twitter Card Preview Generator",
      step: [
        { "@type": "HowToStep", name: "Paste your page URL and import existing tags", text: "Paste the live page URL and click \"Import existing tags\" to pull in any Open Graph and Twitter tags the page already has." },
        { "@type": "HowToStep", name: "Write a clear title and description", text: "Keep the title under about 70 characters and the description under about 200 characters." },
        { "@type": "HowToStep", name: "Add your image and check its real dimensions", text: "Paste the image URL and click \"Check dimensions\" to confirm it is at least 1200×630px." },
        { "@type": "HowToStep", name: "Compare both live previews", text: "Review the Facebook/LinkedIn card and the X/Twitter card side by side, since they crop and truncate differently." },
        { "@type": "HowToStep", name: "Copy the generated tags into your site", text: "Copy the generated meta tags into your page's head section or hand them to whoever manages your CMS or theme." },
        { "@type": "HowToStep", name: "Re-scrape with the platform's own debugger", text: "After publishing, force a fresh scrape with Facebook's Sharing Debugger, X's Card Validator, or LinkedIn's Post Inspector." },
      ],
    },
  ],
};

export default function OgPreviewGeneratorPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />

      <ToolLandingHero
        slug="og-twitter-preview-generator"
        title="Open Graph & X Card Preview & Meta Tag Generator"
        description="Import any live URL or edit fields directly to preview how your link renders on Facebook, LinkedIn, X (Twitter), and Discord—complete with live image dimension checks."
        categoryLabel="Technical SEO"
        categoryHref="/tools"
        workspaceId="tool-studio-workspace"
      >
        <div className="p-4 sm:p-6">
          <OgPreviewClient />
        </div>
      </ToolLandingHero>

      <OgPreviewTutorial />
      <OgPreviewEducation />

      <ToolFaq title="OG & Twitter card generator FAQ" faqs={faqs} />
      <ToolResources slug="og-twitter-preview-generator" />
    </>
  );
}
