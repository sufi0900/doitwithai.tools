import type { Metadata } from "next";
import AiContentWriterPlatformGateAndStudio from "@/features/blog-writer-studio/AiContentWriterPlatformGateAndStudio";

export const metadata: Metadata = {
  title:
    "AI Content Writer Studio: Rich Text Editor, 25 Visuals, SEO & Schema | DoItWithAI.tools",
  description:
    "Write rank-ready blog posts and authority articles in our flagship AI Content Writer Studio. Includes a full WYSIWYG Rich Text Editor, 25+ Canva/Napkin infographic templates, <580px SERP simulator, 0-100 E-E-A-T scorecard, and 7-entity JSON-LD @graph.",
  alternates: {
    canonical: "https://doitwithai.tools/ai-content-writer",
  },
  openGraph: {
    title:
      "AI Content Writer Flagship Studio — Rich Text, 25 Infographics & 7-Entity Schema",
    description:
      "All-in-one AI Content, Blog & Article Writer Studio with interactive WYSIWYG editing, 25 Canva/Napkin visual templates, pixel-exact SERP preview, and 1-click Master .ZIP export.",
    url: "https://doitwithai.tools/ai-content-writer",
    type: "website",
  },
};

const jsonLdGraph = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "SoftwareApplication",
      "@id": "https://doitwithai.tools/ai-content-writer#app",
      name: "DoItWithAI Flagship AI Content Writer Studio",
      applicationCategory: "BusinessApplication",
      operatingSystem: "Web Browser",
      url: "https://doitwithai.tools/ai-content-writer",
      offers: {
        "@type": "Offer",
        price: "0",
        priceCurrency: "USD",
      },
      featureList: [
        "Interactive WYSIWYG Rich Text Editor with Markdown & Clean HTML sync",
        "25+ Canva and Napkin-style Blog Infographic HTML5 Canvas Templates",
        "Deterministic <580px Meta Title and <920px Meta Description SERP Pixel Simulator",
        "0-100 E-E-A-T, Flesch-Kincaid Readability, LSI Entity & Sentence Burstiness Scorecard",
        "7-Entity JSON-LD @graph Schema Compiler (Article, FAQPage, HowTo, BreadcrumbList, ImageObject, Person, Organization)",
        "Interactive 5-Question Reader Quiz & 6-Channel Omnichannel Social Pack with Master .ZIP Export",
      ],
    },
    {
      "@type": "FAQPage",
      "@id": "https://doitwithai.tools/ai-content-writer#faq",
      mainEntity: [
        {
          "@type": "Question",
          name: "Why is the AI Content Writer located at /ai-content-writer instead of /tools?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "Unlike single-purpose micro-utilities under /tools, the DoItWithAI Content Writer is a full SaaS workspace combining a WYSIWYG Rich Text Editor, a 25-template infographic design engine, deterministic SERP pixel math, 7-node JSON-LD schema generation, and local IndexedDB project storage.",
          },
        },
        {
          "@type": "Question",
          name: "Does /ai-content-writer serve AI Blog Writer, AI Article Writer, and AI Content Writer intents together?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "Yes. To prevent keyword cannibalization and split domain authority, /ai-content-writer unifies all long-form blog, article, and SEO content writing workflows into one flagship platform.",
          },
        },
      ],
    },
  ],
};

export default function AiContentWriterFlagshipPage() {
  return (
    <main className="min-h-screen bg-slate-950 text-slate-100">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdGraph) }}
      />
      <AiContentWriterPlatformGateAndStudio />
    </main>
  );
}
