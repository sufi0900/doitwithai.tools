import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import AudienceClient from "@/features/audience-research/Client";
import {
  ToolHeroBackground,
  toolHeroSurface,
} from "@/features/tool-ui/ToolHero";
import ToolResources from "@/features/tool-catalog/ToolResources";
const pageUrl = "https://doitwithai.tools/tools/target-audience-research-tool";
const description =
  "Explore target audience ideas, create working buyer personas, and plan content and channel experiments from your business brief or website context.";
const image = `https://doitwithai.tools/api/og?${new URLSearchParams({ title: "Target Audience Research Tool", category: "Audience Strategy", ctaText: "Understand. Plan. Validate.", features: "Buyer Personas,Content Ideas,Research Plans" })}`;
export const metadata: Metadata = {
  title: "Target Audience Research Tool & Buyer Persona Generator",
  description,
  alternates: { canonical: pageUrl },
  openGraph: {
    title: "Target Audience Research Tool",
    description,
    url: pageUrl,
    type: "website",
    images: [image],
  },
  twitter: {
    card: "summary_large_image",
    title: "Target Audience Research Tool",
    description,
    images: [image],
  },
};
const faqs = [
  [
    "Can I use this before launching a website?",
    "Yes. Describe your offer, the problem it solves, your market, and the decision you need to make. The plan labels unsupported audience ideas as hypotheses.",
  ],
  [
    "Will a website URL reveal my actual customers?",
    "No. Up to three public pages supply business context for suggested audiences. They do not reveal actual visitors, purchases, or verified platform preferences.",
  ],
  [
    "What is the difference between a target audience and a buyer persona?",
    "A target audience is a group you aim to serve. A buyer persona summarizes a specific decision-making context within that group.",
  ],
  [
    "Are the buyer personas verified research?",
    "No. Supplied customer notes can support individual findings, but they are not independently verified. Other findings remain hypotheses or unknowns.",
  ],
  [
    "Can I plan TikTok content for my audience?",
    "Yes. Each plan includes five tailored TikTok ideas alongside other channels. Test them before assuming the platform attracts relevant customers.",
  ],
  [
    "What if my page cannot be imported?",
    "Use your idea or pasted brief instead. Protected pages, access restrictions, and unreadable content can prevent imports without establishing anything about your audience.",
  ],
  [
    "Does the tool estimate market size or search volume?",
    "No. It creates working segments and research tasks. Use suitable first-party research and external datasets to investigate demand and market size.",
  ],
  [
    "Can I export and review the plan?",
    "Yes. Copy or download the full plan as JSON, including your review decisions. Findings CSV contains persona observations and validation questions.",
  ],
];
const sections = [
  [
    "Start with your website or idea",
    "Enter a public website and build your plan directly. Without a website, describe what you plan to publish, sell, or provide.",
  ],
  [
    "Add context without inventing certainty",
    "The tool selects public page passages and relevant business pages. Optional customer notes can help refine the suggested segments.",
  ],
  [
    "Review personas and test the gaps",
    "Inspect each finding, its evidence state, and its validation question. Use small experiments before expanding content production or advertising.",
  ],
];
const p = "mt-4 text-base leading-8 text-slate-600 dark:text-slate-300";
export default function Page() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@graph": [
              {
                "@type": "WebApplication",
                name: "Target Audience Research Tool",
                alternateName: "Buyer Persona Generator",
                url: pageUrl,
                description,
                applicationCategory: "BusinessApplication",
                operatingSystem: "Any",
                featureList: [
                  "Website-only and business idea planning",
                  "Working buyer personas with evidence states",
                  "Content and channel experiments",
                  "Validation questions and report exports",
                ],
              },
              {
                "@type": "FAQPage",
                mainEntity: faqs.map(([name, text]) => ({
                  "@type": "Question",
                  name,
                  acceptedAnswer: { "@type": "Answer", text },
                })),
              },
              {
                "@type": "BreadcrumbList",
                itemListElement: [
                  ["Home", "https://doitwithai.tools"],
                  ["Tools", "https://doitwithai.tools/tools"],
                  ["Target Audience Research Tool", pageUrl],
                ].map(([name, item], i) => ({
                  "@type": "ListItem",
                  position: i + 1,
                  name,
                  item,
                })),
              },
            ],
          }).replace(/</g, "\\u003c"),
        }}
      />
      <section
        className={`relative overflow-hidden ${toolHeroSurface} pb-14 pt-12`}
      >
        <ToolHeroBackground />
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6">
          <nav
            aria-label="Breadcrumb"
            className="mb-7 flex flex-wrap gap-2 text-sm text-blue-100"
          >
            <Link href="/">Home</Link>
            <span>/</span>
            <Link href="/tools">Tools</Link>
            <span>/</span>
            <span aria-current="page">Audience research</span>
          </nav>
          <div className="mb-9 max-w-3xl">
            <p className="text-sm font-semibold text-blue-200">
              AUDIENCE STRATEGY · BUSINESS AND CONTENT PLANNING
            </p>
            <h1 className="mt-4 text-4xl font-black tracking-tight text-white sm:text-5xl">
              Target Audience Research Tool
            </h1>
            <p className="mt-5 text-lg leading-8 text-slate-200">
              Turn a business idea or website brief into working buyer personas,
              content ideas, and a practical research plan.
            </p>
            <p className="mt-3 text-sm leading-7 text-slate-300">
              Understand possible reader needs, buying decisions, and places to
              investigate. Keep assumptions visible and validate them with real
              people.
            </p>
          </div>
          <AudienceClient />
        </div>
      </section>
      <div className="mx-auto max-w-5xl space-y-14 px-4 py-16 sm:px-6">
        <section>
          <h2 className="text-3xl font-bold">
            How to find your target audience
          </h2>
          <ol className="mt-6 grid gap-4 md:grid-cols-3">
            {sections.map(([title, text], i) => (
              <li
                key={title}
                className="rounded-2xl border border-slate-200 p-5 dark:border-slate-700"
              >
                <span className="text-sm font-bold text-blue-700 dark:text-blue-300">
                  Step {i + 1}
                </span>
                <h3 className="mt-3 text-lg font-bold">{title}</h3>
                <p className={p}>{text}</p>
              </li>
            ))}
          </ol>
        </section>
        <section>
          <h2 className="text-3xl font-bold">
            Audience research comes before the persona
          </h2>
          <p className={p}>
            Audience research investigates needs, tasks, constraints, and
            behavior. A persona organizes patterns that help you make specific
            decisions.
          </p>
          <p className={p}>
            A convincing profile can still be fictional. Avoid filling gaps with
            invented ages, income, hobbies, or platform preferences.
          </p>
          <p className={p}>
            Our{" "}
            <Link
              href="/ai-seo/chatgpt-target-audience-research"
              className="font-semibold text-blue-700 underline dark:text-blue-300"
            >
              ChatGPT audience research guide
            </Link>{" "}
            explains how to prepare an evidence pack and keep observations
            separate from assumptions.
          </p>
          <p className={p}>
            This tool applies that workflow. Business context suggests possible
            segments. Customer notes can support specific findings, while
            unestablished details remain unknown.
          </p>
        </section>
        <section>
          <h2 className="text-3xl font-bold">
            What your audience plan includes
          </h2>
          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            {[
              [
                "Working segments and exclusions",
                "Identify whom the offer might serve and which users fall outside the initial focus.",
              ],
              [
                "Buyer and user context",
                "Distinguish the person using a solution from the person approving or paying for it.",
              ],
              [
                "Needs, interests, and objections",
                "Explore goals, pain points, decision criteria, and possible messaging without treating assumptions as findings.",
              ],
              [
                "Content and channel experiments",
                "Plan relevant topics and formats. Explore platform searches without claiming your audience has been found there.",
              ],
              [
                "Questions and evidence gaps",
                "Use interview prompts and validation tasks to investigate the uncertainties that affect your decisions.",
              ],
              [
                "Reviewable exports",
                "Save findings, supporting quotes, and your own decisions before sharing the plan with a collaborator.",
              ],
            ].map(([title, text]) => (
              <article
                key={title}
                className="rounded-2xl bg-slate-100 p-5 dark:bg-slate-800"
              >
                <h3 className="font-bold">{title}</h3>
                <p className={p}>{text}</p>
              </article>
            ))}
          </div>
        </section>
        <section>
          <h2 className="text-3xl font-bold">
            Choose research methods that answer your question
          </h2>
          <p className={p}>
            For a new idea, investigate the problem before polishing a fictional
            profile. Ask people about recent tasks, current alternatives, and
            difficult decisions.
          </p>
          <p className={p}>
            For an existing website, compare customer questions, support issues,
            relevant analytics, and interviews. Public pages explain positioning
            and suggest possible audience needs. They cannot establish the
            composition of actual visitors.
          </p>
          <p className={p}>
            The{" "}
            <a
              href="https://www.sba.gov/counseling/plan-your-business/"
              className="text-blue-700 underline dark:text-blue-300"
            >
              SBA business-planning guide
            </a>{" "}
            describes market research as a way to understand customers and
            investigate a business idea.
          </p>
          <p className={p}>
            <a
              href="https://blog.hubspot.com/marketing/buyer-persona-research"
              className="text-blue-700 underline dark:text-blue-300"
            >
              HubSpot’s buyer persona guide
            </a>{" "}
            also emphasizes research, surveys, and interviews. Use these methods
            to challenge your assumptions, not simply confirm them.
          </p>
        </section>
        <section>
          <h2 className="text-3xl font-bold">
            Find conversations without assuming channel fit
          </h2>
          <p className={p}>
            A Reddit discussion may reveal useful language. A TikTok comment may
            expose a recurring question. Neither establishes the size or
            preferences of an entire audience.
          </p>
          <p className={p}>
            Search for the task, problem, and alternatives your persona
            describes. Review several relevant conversations and record context,
            dates, disagreements, and sampling limits.
          </p>
          <p className={p}>
            Then test one appropriate content format. Observe relevant
            questions, task completion, or qualified visits rather than treating
            raw views as proof of buying intent.
          </p>
          <p className={p}>
            Respect community rules. Research destinations are discovery links,
            not endorsements of a group or permission to send unsolicited
            messages.
          </p>
        </section>
        <section>
          <h2 className="text-3xl font-bold">
            Audience planning for local and offline businesses
          </h2>
          <p className={p}>
            You do not need a website to use this tool. Describe your shop,
            service, product, publication, or business idea in plain language.
          </p>
          <p className={p}>
            For a local service, explain where you can operate, what customers
            need, and which alternatives they currently use.
          </p>
          <p className={p}>
            The offline plan suggests interviews, relevant venues,
            demonstrations, partner conversations, and small pilots. These are
            research options, not confirmed customer locations.
          </p>
          <p className={p}>
            Ask people about their most recent experience with the problem.
            Their actual decisions are more useful than agreement with a
            hypothetical sales pitch.
          </p>
          <p className={p}>
            <a
              className="text-blue-700 underline dark:text-blue-300"
              href="https://www.gov.uk/service-manual/user-research/start-by-learning-user-needs"
            >
              GOV.UK’s user research guidance
            </a>{" "}
            recommends reviewing existing evidence and learning about real user
            needs before defining profiles.
          </p>
        </section>
        <section>
          <h2 className="text-3xl font-bold">
            A detailed persona should help you make decisions
          </h2>
          <p className={p}>
            Review goals, barriers, interests, behavior, buying triggers, and
            decision criteria. These details help you choose useful messages,
            formats, and next actions.
          </p>
          <p className={p}>
            Age, location, gender, hobbies, and purchase budget can matter in
            some markets. They should remain unknown when your evidence does not
            establish them.
          </p>
          <p className={p}>
            A business description cannot reveal a customer’s bank balance.
            Investigate willingness to pay and relevant purchasing constraints
            through appropriate customer research.
          </p>
          <p className={p}>
            For B2B offers, separate the user, buyer, and approver. One person’s
            daily workflow may differ from the concerns of the purchasing team.
          </p>
          <p className={p}>
            Use the profile as a working map. Revise it when interviews, support
            questions, observations, or customer feedback contradict your
            assumptions.
          </p>
        </section>
        <section>
          <h2 className="text-3xl font-bold">
            Reduce wasted content and promotion work
          </h2>
          <p className={p}>
            Without a specific audience problem, a business can produce generic
            content, choose unsuitable channels, or explain features that
            customers do not value.
          </p>
          <p className={p}>
            This workspace organizes the initial questions. It connects a
            possible audience with pain points, useful content, and a small test
            you can observe.
          </p>
          <p className={p}>
            Each channel includes five tailored ideas connected to the offer and
            proposed audience needs. Compare social posts, search content,
            consent-based emails, and offline activities.
          </p>
          <p className={p}>
            Start with a manageable experiment. Look for relevant questions and
            meaningful actions before investing in a larger campaign.
          </p>
          <p className={p}>
            The suggestions do not replace interviews, market data, or sales
            evidence. They help you decide what to investigate next.
          </p>
        </section>
        <section>
          <h2 className="text-3xl font-bold">
            Move from audience needs to useful content
          </h2>
          <div className="mt-6 grid gap-4 sm:grid-cols-3">
            {[
              [
                "/tools/search-intent-checker",
                "Search Intent Checker",
                "Review the task behind a query.",
              ],
              [
                "/tools/seo-content-brief-generator",
                "SEO Content Brief Generator",
                "Turn a reviewed reader need into a writer brief.",
              ],
              [
                "/tools/keyword-clustering-tool",
                "Keyword Clustering Tool",
                "Organize supplied queries around useful page purposes.",
              ],
            ].map(([href, title, text]) => (
              <Link
                key={href}
                href={href}
                className="rounded-xl border border-slate-200 p-5 hover:border-[#5271FF] dark:border-slate-700"
              >
                <h3 className="font-bold">{title}</h3>
                <p className={p}>{text}</p>
              </Link>
            ))}
          </div>
        </section>
        <section>
          <h2 className="text-3xl font-bold">
            Target audience and buyer persona questions
          </h2>
          <div className="mt-6 divide-y divide-slate-200 rounded-2xl border border-slate-200 px-5 dark:divide-slate-700 dark:border-slate-700">
            {faqs.map(([q, a]) => (
              <details key={q} className="py-5">
                <summary className="cursor-pointer font-bold leading-7">
                  {q}
                </summary>
                <p className={p}>{a}</p>
              </details>
            ))}
          </div>
        </section>
      </div>
      <Suspense fallback={null}>
        <ToolResources slug="target-audience-research-tool" />
      </Suspense>
    </>
  );
}
