import ToolLandingHero from "@/features/tool-ui/ToolLandingHero";
import type { Metadata } from "next";
import Link from "next/link";
import {
  Calendar,
  Link2,
  Megaphone,
  ShieldCheck,
  Video,
} from "lucide-react";
import MarketingCampaignAgentClient from "@/features/ai-marketing-campaign-agent/MarketingCampaignAgentClient";
import ToolFaq from "@/features/tool-ui/ToolFaq";
import ToolResources from "@/features/tool-catalog/ToolResources";

const pageUrl = "https://doitwithai.tools/tools/ai-marketing-campaign-agent";
const title =
  "Omnichannel Content & Marketing Campaign AI Agent | Work Intake, Capacity Plan, Video & UTM Builder";
const description =
  "Turn one product launch or article brief into a complete marketing campaign: work-intake capacity/sprint plan, LinkedIn post + carousel, X thread, short-form video script, paid traffic ad copy angles, and UTM tracking links.";

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
    question: "How does the marketing work intake AI agent handle capacity planning?",
    answer:
      "Enter your team's available weekly hours alongside your campaign brief. The agent calculates a 5-day role-by-role sprint plan (strategy, social, video, paid ads, and analytics) and flags if planned hours exceed your capacity.",
  },
  {
    question: "What is the difference between an AI marketing agent vs ChatGPT?",
    answer:
      "Raw ChatGPT requires repetitive prompting across separate chats and lacks deterministic UTM builders or sprint capacity math. This agent executes a unified 5-part pipeline from a single brief or live URL.",
  },
  {
    question: "How does the agent support paid traffic analysis and marketing automation?",
    answer:
      "Every run produces 3 distinct paid ad copy angles (LinkedIn Sponsored, Meta/Instagram, and Google Search) paired with conversion hypotheses and pre-tagged UTM links for clean attribution.",
  },
  {
    question: "Can I export the entire campaign and UTM sheet in one click?",
    answer:
      "Yes. Click 'Copy All Assets' or 'Export .MD' to download the complete sprint plan, social posts, 60-second video script, ad copy variations, and UTM links.",
  },
];

const section = "mx-auto max-w-6xl px-4 py-12 sm:px-6";
const prose = "mt-4 text-base leading-8 text-slate-600 dark:text-slate-300";

export default function AiMarketingCampaignAgentPage() {
  const schema = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebApplication",
        name: "Omnichannel Content & Marketing Campaign AI Agent",
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
          { name: "AI Tools", item: "https://doitwithai.tools/tools" },
          { name: "Omnichannel Marketing Campaign Agent", item: pageUrl },
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
        slug="ai-marketing-campaign-agent"
        title="Omnichannel Content & Marketing Campaign Agent"
        description="Turn one product launch or article into a complete campaign in a single run: work-intake sprint & capacity plan, LinkedIn post + carousel, X thread, 60-second short-form video script, paid traffic ad copy angles, and UTM tracking links."
        categoryLabel="1-Brief-to-Full-Campaign Agent Â"
        categoryHref="/tools"
        workspaceId="tool-studio-workspace"
      >
        <div className="p-4 sm:p-6">
          <MarketingCampaignAgentClient />
        </div>
      </ToolLandingHero>

      <section
        className={`${section} border-t border-slate-200 dark:border-slate-800`}
      >
        <p className="text-xs font-bold uppercase tracking-wider text-[#5271ff]">
          Full-funnel marketing automation
        </p>
        <h2 className="mt-3 text-3xl font-extrabold">
          Plan capacity, creative angles, and UTM tracking in one unified run
        </h2>
        <p className={prose}>
          High-performing marketing teams connect work intake and capacity
          planning directly to creative execution and paid traffic attribution.
        </p>

        <div className="mt-8 grid gap-5 md:grid-cols-3">
          {[
            [
              Calendar,
              "Marketing Work Intake & Capacity",
              "Balance weekly team hours across content, video, and paid acquisition before launching.",
            ],
            [
              Video,
              "Multi-Format Creative Pack",
              "Generate synchronized LinkedIn carousels, X threads, and 60-second short-form video scripts.",
            ],
            [
              Megaphone,
              "Paid Traffic Angles & UTM Links",
              "Pair Meta, LinkedIn, and Google ad variations with clean UTM tracking URLs.",
            ],
          ].map(([Icon, heading, body]) => {
            const I = Icon as typeof ShieldCheck | typeof Link2;
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

      <ToolResources slug="ai-marketing-campaign-agent" />
      <ToolFaq
        title="Omnichannel Marketing Campaign Agent questions"
        faqs={faqs}
      />
    </div>
  );
}
