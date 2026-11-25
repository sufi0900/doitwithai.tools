import type { Metadata } from "next";
import PricingPageClient from "@/features/studio/PricingPageClient";
import ToolFaq from "@/features/tool-ui/ToolFaq";

const pageUrl = "https://doitwithai.tools/pricing";
const title =
  "Pricing — Free DIY AI SEO Tools vs. Pro Creator ($12/mo) & Pro Plus | DoItWithAI";
const description =
  "Compare DoItWithAI Free ($0), Pro Creator ($12/mo or $79/yr Founding Pass), and Pro Plus ($29/mo): Flagship AI Content Writer, Infographic Studio V5, Site Audit Snapshots, and AI Tool/Blog Website Builder.";

export const metadata: Metadata = {
  title,
  description,
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

const pricingFaqs = [
  {
    question: "Are the 90+ standalone SEO & content tools on /tools/* still free?",
    answer:
      "Yes. Our 90+ browser-based SEO calculators, SERP pixel checkers, schema generators, and prompt previews remain free with sensible daily fair-use limits, plus 1 free trial Studio article preview.",
  },
  {
    question: "What comes with the Pro Creator ($12/mo or $79/yr Founding Pass)?",
    answer:
      "Pro Creator unlocks the unified /studio workspace for 1 connected website, 15–20 complete publish-ready articles per month (including real internal/external links, Infographic Studio V5 visuals, and 1-Click Social Repurposing Packs), saved keyword backlogs, unified site audit snapshots, AI Tool/Blog Website Builder hosting on an isolated neutral subdomain, and the full 650+ Pro Prompt Vault.",
  },
  {
    question: "When should I choose Pro Plus ($29/mo)?",
    answer:
      "Choose Pro Plus when managing up to 5 websites, producing up to 50 complete articles per month, exporting bulk .ZIP publishing kits, or connecting custom CNAME domains to AI Tool/Blog Website Builder sites.",
  },
  {
    question: "Does DoItWithAI auto-post unreviewed AI articles to my site?",
    answer:
      "Never. DoItWithAI.tools is a 100% hands-on Manual DIY Toolkit—you control every keyword, H1–H3 outline, E-E-A-T note, inline infographic, and manual publication checklist.",
  },
];

export default function PricingPage() {
  const schema = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebPage",
        name: title,
        url: pageUrl,
        description,
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Home", item: "https://doitwithai.tools" },
          { "@type": "ListItem", position: 2, name: "Pricing", item: pageUrl },
        ],
      },
      {
        "@type": "FAQPage",
        mainEntity: pricingFaqs.map((f) => ({
          "@type": "Question",
          name: f.question,
          acceptedAnswer: { "@type": "Answer", text: f.answer },
        })),
      },
    ],
  };

  return (
    <div>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(schema).replace(/</g, "\\u003c"),
        }}
      />
      <PricingPageClient />
      <div className="mx-auto max-w-4xl px-4 pb-16 sm:px-6">
        <ToolFaq title="Pricing & Studio Plan Questions" faqs={pricingFaqs} />
      </div>
    </div>
  );
}
