import ToolLandingHero from "@/features/tool-ui/ToolLandingHero";
import type { Metadata } from "next";
import Link from "next/link";
import {
  Code2,
  MessageCircle,
  ShieldCheck,
  Users,
} from "lucide-react";
import WhatsappInstagramAgentStudioClient from "@/features/whatsapp-instagram-ai-agent-studio/WhatsappInstagramAgentStudioClient";
import ToolFaq from "@/features/tool-ui/ToolFaq";
import ToolResources from "@/features/tool-catalog/ToolResources";

const pageUrl =
  "https://doitwithai.tools/tools/whatsapp-instagram-ai-agent-studio";
const title =
  "WhatsApp, Telegram & Instagram DM Sales Agent Studio | ManyChat & n8n JSON Templates";
const description =
  "Build automated conversational Instagram Shop DM, WhatsApp Business, and Telegram flows for price inquiries, booking, objection handling, and community managementâ€”with copy-paste ManyChat and n8n JSON templates.";

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
    question:
      "How do I set up a ManyChat AI agent for Instagram Shop price inquiries?",
    answer:
      "Enter your shop name, pricing tiers, and trigger keyword (e.g., 'PRICE'). The studio builds a 3-step Comment-to-DM price inquiry funnel with quick-reply buttons and exports a ready-to-import ManyChat JSON flow template.",
  },
  {
    question:
      "How do AI agents for community management in Telegram and WhatsApp work?",
    answer:
      "Inside the 'TG & WA Community' tab, the agent generates pinned welcome messages, automated anti-spam rules for newly joined accounts, keyword price cards, and daily engagement prompts.",
  },
  {
    question: "What are the latest trends in AI agents for WhatsApp Business?",
    answer:
      "Modern WhatsApp AI agents combine instant keyword-triggered catalog replies within the official 24-hour Meta service window with empathetic objection handling and 1-click checkout or calendar links.",
  },
  {
    question: "Can I use these flows with n8n as well as ManyChat?",
    answer:
      "Yes. Both a ManyChat flow schema and an n8n webhook + LangChain agent router JSON template are generated automatically.",
  },
];

const section = "mx-auto max-w-6xl px-4 py-12 sm:px-6";
const prose = "mt-4 text-base leading-8 text-slate-600 dark:text-slate-300";

export default function WhatsappInstagramAiAgentStudioPage() {
  const schema = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebApplication",
        name: "WhatsApp, Telegram & Instagram DM Sales Agent Studio",
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
          { name: "WhatsApp, Telegram & IG DM Studio", item: pageUrl },
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
        slug="whatsapp-instagram-ai-agent-studio"
        title="WhatsApp, Telegram & Instagram DM Sales Agent Studio"
        description="Build automated conversational DM & WhatsApp/Telegram flows for Instagram Shop price inquiries, appointment booking, objection handling, and community moderationâ€”complete with copy-paste ManyChat and n8n JSON templates."
        categoryLabel="AI SEO Tools"
        categoryHref="/tools"
        workspaceId="tool-studio-workspace"
      >
        <div className="p-4 sm:p-6">
          <WhatsappInstagramAgentStudioClient />
        </div>
      </ToolLandingHero>

      <section
        className={`${section} border-t border-slate-200 dark:border-slate-800`}
      >
        <p className="text-xs font-bold uppercase tracking-wider text-[#5271ff]">
          Conversational commerce &amp; community management
        </p>
        <h2 className="mt-3 text-3xl font-extrabold">
          Turn Instagram comments, WhatsApp inquiries, and Telegram groups into revenue
        </h2>
        <p className={prose}>
          Buyers in DMs want fast, clear pricing and zero-friction checkout
          links. By pairing keyword triggers with structured quick replies and
          community moderation rules, you convert inquiries 24/7.
        </p>

        <div className="mt-8 grid gap-5 md:grid-cols-3">
          {[
            [
              MessageCircle,
              "Instagram Shop Price Inquiries",
              "Reply to 'PRICE' comments and DMs in seconds with package options and direct checkout buttons.",
            ],
            [
              Users,
              "Telegram & WhatsApp Communities",
              "Onboard new group members automatically while blocking spam links and routing VIP questions.",
            ],
            [
              Code2,
              "ManyChat & n8n JSON Blueprints",
              "Export structured JSON templates so you can launch your DM automation without starting from scratch.",
            ],
          ].map(([Icon, heading, body]) => {
            const I = Icon as typeof ShieldCheck;
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

      <ToolResources slug="whatsapp-instagram-ai-agent-studio" />
      <ToolFaq
        title="WhatsApp, Telegram & Instagram DM Studio questions"
        faqs={faqs}
      />
    </div>
  );
}
