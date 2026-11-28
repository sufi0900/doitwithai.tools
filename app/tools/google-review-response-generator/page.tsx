import type { Metadata } from "next";
import ToolLandingHero from "@/features/tool-ui/ToolLandingHero";
import Link from "next/link";
import {
  MessageSquare,
  ShieldAlert,
  Star,
} from "lucide-react";
import GoogleReviewResponseGeneratorClient from "@/features/google-review-response-generator/GoogleReviewResponseGeneratorClient";
import ToolFaq from "@/features/tool-ui/ToolFaq";
import ToolResources from "@/features/tool-catalog/ToolResources";

const pageUrl =
  "https://doitwithai.tools/tools/google-review-response-generator";
const title =
  "Free Google Review Response Generator (5-Star SEO & 1-Star Crisis Replies)";
const description =
  "Generate local-keyword-optimized owner responses for 5-star Google reviews and calm, reputation-saving de-escalation replies for 1-star reviews.";

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

const faqs = [
  {
    question: "Does replying to Google reviews help Local SEO?",
    answer:
      "Yes. Google's official Google Business Profile documentation confirms that responding to reviews builds customer trust and signals active engagement. Naturally mentioning your city and service in 5-star replies also reinforces semantic relevance.",
  },
  {
    question: "Should I include keywords in my 1-star review responses?",
    answer:
      "No. For 1-star or negative reviews, avoid putting your primary service keywords in the reply so the negative review is less likely to surface for keyword searches. Focus 100% on empathy, professionalism, and moving the conversation offline.",
  },
  {
    question: "How fast should a business owner reply to a new Google review?",
    answer:
      "Aim to reply to all positive reviews within 24–48 hours and any 1-star or 2-star reviews within 12 hours so prospective customers see responsive, accountable management.",
  },
  {
    question: "How should medical, dental, or legal practices reply without violating privacy?",
    answer:
      "Never confirm clinical or confidential case details in a public review reply. Use our 'Empathy & Offline Resolution' template, which states general service standards and invites the reviewer to contact your office manager directly.",
  },
];

const section = "mx-auto max-w-6xl px-4 py-12 sm:px-6";
const prose = "mt-4 text-base leading-8 text-slate-600 dark:text-slate-300";

export default function GoogleReviewResponseGeneratorPage() {
  const schema = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebApplication",
        name: "Google Review Response Generator",
        url: pageUrl,
        description,
        applicationCategory: "BusinessApplication",
        operatingSystem: "Any",
        isAccessibleForFree: true,
        offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { name: "Home", item: "https://doitwithai.tools" },
          { name: "Tools", item: "https://doitwithai.tools/tools" },
          { name: "Google Review Response Generator", item: pageUrl },
        ].map((item, i) => ({ "@type": "ListItem", position: i + 1, ...item })),
      },
      {
        "@type": "FAQPage",
        mainEntity: faqs.map((f) => ({
          "@type": "Question",
          name: f.question,
          acceptedAnswer: { "@type": "Answer", text: f.answer },
        })),
      },
    ],
  };

  return (
    <div className="bg-white text-slate-900 dark:bg-[#0F1523] dark:text-white">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(schema).replace(/</g, "\\u003c"),
        }}
      />

      <ToolLandingHero
        slug="google-review-response-generator"
        title="Google Review Response & Crisis Reply Generator"
        description="Draft warm, local-entity-rich owner replies for 5-star reviews and calm, privacy-safe de-escalation responses for 1-star or mixed feedback in seconds."
        categoryLabel="Local SEO"
        categoryHref="/tools"
        workspaceId="tool-studio-workspace"
      >
        <div className="p-4 sm:p-6">
          <GoogleReviewResponseGeneratorClient />
        </div>
      </ToolLandingHero>

      <section
        className={`${section} border-t border-slate-200 dark:border-slate-800`}
      >
        <h2 className="text-3xl font-extrabold">
          Turn every review into a trust signal for future local buyers
        </h2>
        <p className={prose}>
          Prospective customers read owner responses almost as closely as the
          reviews themselves—especially when evaluating how a business handles a
          complaint.
        </p>

        <div className="mt-8 grid gap-5 md:grid-cols-3">
          {[
            [
              Star,
              "Natural Local Relevance",
              "Weaves your city and service into positive replies without awkward keyword stuffing.",
            ],
            [
              ShieldAlert,
              "1-Star De-Escalation",
              "Protects your brand reputation by acknowledging concerns calmly and moving resolution offline.",
            ],
            [
              MessageSquare,
              "Zero Copy-Paste Fatigue",
              "Generates 3 distinct phrasings per review so your profile never looks like a bot copy-pasted the same line.",
            ],
          ].map(([Icon, heading, body]) => {
            const I = Icon as typeof Star;
            return (
              <div
                key={String(heading)}
                className="rounded-2xl border border-slate-200 p-6 dark:border-slate-700"
              >
                <I aria-hidden className="text-[#5271ff]" size={22} />
                <h3 className="mt-4 text-lg font-bold">{String(heading)}</h3>
                <p className="mt-2 text-sm leading-7 text-slate-600 dark:text-slate-300">
                  {String(body)}
                </p>
              </div>
            );
          })}
        </div>
      </section>

      <ToolResources slug="google-review-response-generator" />
      <ToolFaq title="Google Review Response Generator FAQs" faqs={faqs} />
    </div>
  );
}
