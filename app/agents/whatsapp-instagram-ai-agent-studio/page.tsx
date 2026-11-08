import type { Metadata } from "next";
import Link from "next/link";
import { Code2, MessageCircle, ShieldCheck, Users } from "lucide-react";
import WhatsappInstagramAgentStudioClient from "@/features/whatsapp-instagram-ai-agent-studio/WhatsappInstagramAgentStudioClient";
import PortableToolHeroBar from "@/features/portable-tool-kit/PortableToolHeroBar";
import ToolFaq from "@/features/tool-ui/ToolFaq";
import ToolResources from "@/features/tool-catalog/ToolResources";
import {
  ToolHeroBackground,
  toolHeroHeading,
  toolHeroSurface,
} from "@/features/tool-ui/ToolHero";

const pageUrl =
  "https://doitwithai.tools/agents/whatsapp-instagram-ai-agent-studio";
const title =
  "WhatsApp, Telegram & Instagram DM Sales Agent Studio | ManyChat & n8n JSON Templates";
const description =
  "Build automated conversational Instagram Shop DM, WhatsApp Business, and Telegram flows for price inquiries, booking, objection handling, and community management—with copy-paste ManyChat and n8n JSON templates.";

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
          { name: "AI Agents", item: "https://doitwithai.tools/agents" },
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

      <header
        className={`relative overflow-hidden ${toolHeroSurface} text-white`}
      >
        <ToolHeroBackground />
        <div className="relative mx-auto max-w-6xl px-4 py-6 sm:px-6 sm:py-8">
          <nav
            aria-label="Breadcrumb"
            className="mb-4 flex flex-wrap gap-2 text-xs text-slate-300"
          >
            <Link href="/">Home</Link>
            <span>/</span>
            <Link href="/agents">AI Agents</Link>
            <span>/</span>
            <span aria-current="page">
              WhatsApp, Telegram &amp; Instagram DM Studio
            </span>
          </nav>

          <div className="grid items-center gap-8 lg:grid-cols-[minmax(0,1.35fr)_minmax(0,0.85fr)]">
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-[#b4c3ff]">
                Conversational DM Commerce &amp; Community Management Studio
              </p>
              <h1 className="mt-4 text-3xl font-black leading-tight sm:text-4xl lg:text-5xl">
                WhatsApp, Telegram &amp;{" "}
                <span className={toolHeroHeading}>
                  Instagram DM Sales Agent Studio
                </span>
              </h1>
              <p className="mt-5 max-w-2xl text-base leading-8 text-slate-300">
                Build automated conversational DM &amp; WhatsApp/Telegram flows
                for Instagram Shop price inquiries, appointment booking,
                objection handling, and community moderation—complete with
                copy-paste ManyChat and n8n JSON templates.
              </p>
              <div className="mt-7 flex flex-wrap gap-3 text-xs font-semibold text-slate-200">
                <span className="rounded-lg border border-white/15 px-3 py-2">
                  IG Shop Price Inquiry Flows
                </span>
                <span className="rounded-lg border border-white/15 px-3 py-2">
                  TG &amp; WhatsApp Community Rules
                </span>
                <span className="rounded-lg border border-white/15 px-3 py-2">
                  ManyChat &amp; n8n JSON Export
                </span>
              </div>
              <PortableToolHeroBar slug="whatsapp-instagram-ai-agent-studio" />
            </div>

            <div className="rounded-2xl border border-[#9aabff]/30 bg-[#101b30]/90 p-6 shadow-xl">
              <p className="text-xs font-bold uppercase tracking-wider text-[#b4c3ff]">
                1 Catalog Brief → 4 Conversational Assets
              </p>
              <ul className="mt-4 space-y-2.5 text-xs text-slate-300">
                <li>
                  <strong className="text-emerald-300">
                    1. Price Inquiry Funnel:
                  </strong>{" "}
                  3-step Comment-to-DM &amp; WhatsApp keyword conversation.
                </li>
                <li>
                  <strong className="text-indigo-300">
                    2. Objection Playbook:
                  </strong>{" "}
                  Empathetic DM replies for price, setup, and policy questions.
                </li>
                <li>
                  <strong className="text-sky-300">
                    3. Community Management:
                  </strong>{" "}
                  Telegram &amp; WhatsApp pinned welcome + anti-spam rules.
                </li>
                <li>
                  <strong className="text-amber-300">
                    4. Automation JSONs:
                  </strong>{" "}
                  Copy-paste ManyChat flow + n8n webhook router templates.
                </li>
              </ul>
            </div>
          </div>
        </div>
      </header>

      <WhatsappInstagramAgentStudioClient />

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
