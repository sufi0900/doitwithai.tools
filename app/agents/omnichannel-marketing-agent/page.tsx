import type { Metadata } from "next";
import Link from "next/link";
import { Mail, MessageSquare, Share2, ShieldCheck } from "lucide-react";
import OmnichannelMarketingAgentClient from "@/features/omnichannel-marketing-agent/OmnichannelMarketingAgentClient";
import PortableToolHeroBar from "@/features/portable-tool-kit/PortableToolHeroBar";
import ToolFaq from "@/features/tool-ui/ToolFaq";
import ToolResources from "@/features/tool-catalog/ToolResources";
import {
  ToolHeroBackground,
  toolHeroHeading,
  toolHeroSurface,
} from "@/features/tool-ui/ToolHero";

const pageUrl = "https://doitwithai.tools/agents/omnichannel-marketing-agent";
const title =
  "Free Omni-Channel Content Repurposing & Safe Marketing Agent | LinkedIn, X, Reddit & Email";
const description =
  "Turn one published blog post or tool URL into a complete, spam-safe 4-channel distribution campaign: LinkedIn post + carousel outline, X thread, value-first Reddit answer, and newsletter.";

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
      "How does the Omni-Channel Marketing Agent keep Reddit and LinkedIn distribution 'safe and green'?",
    answer:
      "Automated spam bots get accounts shadowbanned. This agent follows a white-hat Hub-and-Spoke model: it extracts the genuine educational takeaways from your article and drafts 90%-value-first replies and native posts for human 1-click review before publishing.",
  },
  {
    question:
      "What 4 channels are generated in each campaign pack?",
    answer:
      "Every run produces: (1) a formatted LinkedIn thought-leadership post + 6-slide document carousel outline, (2) a 5-post X/Twitter thread with character counts, (3) a non-promotional, value-first Reddit community reply, and (4) a Mailchimp-ready email newsletter edition with 3 subject lines.",
  },
  {
    question: "Can I import any live blog post or tool URL automatically?",
    answer:
      "Yes. Paste your published URL into the top extractor bar to pull its title and core takeaways directly into the campaign brief.",
  },
  {
    question: "Can I download the entire multi-channel campaign in one file?",
    answer:
      "Yes. Click 'Download .MD' or 'Copy All 4 Channels' to export the complete synchronized campaign bundle for Notion, Buffer, or your team workspace.",
  },
];

const section = "mx-auto max-w-6xl px-4 py-12 sm:px-6";
const prose = "mt-4 text-base leading-8 text-slate-600 dark:text-slate-300";

export default function OmnichannelMarketingAgentPage() {
  const schema = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebApplication",
        name: "Omni-Channel Content Repurposing & Safe Marketing Agent",
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
          { name: "Omni-Channel Marketing Agent", item: pageUrl },
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
            <span aria-current="page">Omni-Channel Marketing Agent</span>
          </nav>

          <div className="grid items-center gap-8 lg:grid-cols-[minmax(0,1.35fr)_minmax(0,0.85fr)]">
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-[#b4c3ff]">
                Safe Digital Marketing Agent · Hub-and-Spoke Distribution Studio
              </p>
              <h1 className="mt-4 text-3xl font-black leading-tight sm:text-4xl lg:text-5xl">
                Omni-Channel Content{" "}
                <span className={toolHeroHeading}>
                  Repurposing &amp; Marketing Agent
                </span>
              </h1>
              <p className="mt-5 max-w-2xl text-base leading-8 text-slate-300">
                Turn a single blog guide or free tool into a synchronized,
                spam-safe 4-channel distribution campaign—complete with a
                LinkedIn post &amp; carousel outline, 5-post X thread,
                value-first Reddit community reply, and email newsletter.
              </p>
              <div className="mt-7 flex flex-wrap gap-3 text-xs font-semibold text-slate-200">
                <span className="rounded-lg border border-white/15 px-3 py-2">
                  LinkedIn post + 6-slide carousel
                </span>
                <span className="rounded-lg border border-white/15 px-3 py-2">
                  Shadowban-safe Reddit answers
                </span>
                <span className="rounded-lg border border-white/15 px-3 py-2">
                  X thread + Mailchimp newsletter
                </span>
              </div>
              <PortableToolHeroBar slug="omnichannel-marketing-agent" />
            </div>

            <div className="rounded-2xl border border-[#9aabff]/30 bg-[#101b30]/90 p-6 shadow-xl">
              <p className="text-xs font-bold uppercase tracking-wider text-[#b4c3ff]">
                1 Hub URL → 4 Native Channel Assets
              </p>
              <ul className="mt-4 space-y-2.5 text-xs text-slate-300">
                <li>
                  <strong className="text-emerald-300">
                    LinkedIn Authority:
                  </strong>{" "}
                  Hook-driven post + 6-slide document carousel breakdown.
                </li>
                <li>
                  <strong className="text-indigo-300">
                    X / Twitter Thread:
                  </strong>{" "}
                  5 character-checked posts with clear practitioner takeaways.
                </li>
                <li>
                  <strong className="text-sky-300">
                    Reddit Community Reply:
                  </strong>{" "}
                  90% standalone answer value so moderators welcome your post.
                </li>
                <li>
                  <strong className="text-amber-300">
                    Email Newsletter:
                  </strong>{" "}
                  3 subject line options + scannable subscriber edition.
                </li>
              </ul>
            </div>
          </div>
        </div>
      </header>

      <OmnichannelMarketingAgentClient />

      <section
        className={`${section} border-t border-slate-200 dark:border-slate-800`}
      >
        <p className="text-xs font-bold uppercase tracking-wider text-[#5271ff]">
          White-hat distribution at scale
        </p>
        <h2 className="mt-3 text-3xl font-extrabold">
          Distribute every guide across four channels without sounding like a bot
        </h2>
        <p className={prose}>
          Publishing great SEO guides or interactive tools is only half the
          battle—consistent distribution brings in initial traffic, natural
          backlinks, and brand search demand. By adapting your core takeaways to
          each platform&apos;s native format, you earn engagement safely.
        </p>

        <div className="mt-8 grid gap-5 md:grid-cols-3">
          {[
            [
              Share2,
              "LinkedIn & X Thought Leadership",
              "Transform technical guides into scannable frameworks and carousel slides that earn saves and profile visits.",
            ],
            [
              MessageSquare,
              "Spam-Safe Reddit Community Replies",
              "Draft genuinely helpful, detailed answers to subreddit questions before casually referencing your free tool or guide.",
            ],
            [
              Mail,
              "Instant Newsletter Editions",
              "Send a clean, high-value weekly email update to your Mailchimp or ConvertKit list in minutes.",
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

      <ToolResources slug="omnichannel-marketing-agent" />
      <ToolFaq title="Omni-Channel Marketing Agent questions" faqs={faqs} />
    </div>
  );
}
