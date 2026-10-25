import {
  ToolHeroBackground,
  toolHeroSurface,
} from "@/features/tool-ui/ToolHero";
import type { Metadata } from "next";
import { Suspense } from "react";
import Link from "next/link";
import { Search, Compass, ListChecks, ArrowRight } from "lucide-react";
import SearchIntentClient from "@/features/search-intent/Client";
import ToolResources from "@/features/tool-catalog/ToolResources";
const pageUrl = "https://doitwithai.tools/tools/search-intent-checker";
const description =
  "Free keyword intent checker for search intent analysis. Identify informational, navigational, commercial, or transactional queries and choose a suitable page format.";
const image = `https://doitwithai.tools/api/og?${new URLSearchParams({ title: "Search Intent Checker", category: "AI SEO · Content Planning", ctaText: "Understand. Verify. Plan.", features: "Reader Tasks,Intent Cues,Content Angles" })}`;
export const metadata: Metadata = {
  title: "Keyword Intent Checker | Free Search Intent Analysis",
  description,
  alternates: { canonical: pageUrl },
  openGraph: {
    title: "Keyword Intent Checker | Search Intent Analysis",
    description,
    url: pageUrl,
    type: "website",
    images: [{ url: image, width: 1200, height: 630 }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Keyword Intent Checker | Search Intent Analysis",
    description,
    images: [image],
  },
};
const faqs = [
  [
    "Is keyword intent different from search intent?",
    "Both describe the task behind a search query. This keyword intent checker and search intent checker use the same workspace and intent categories.",
  ],
  [
    "Does this tool check live Google results?",
    "No. Quick check uses query wording. AI review interprets your supplied text. Optional result notes are user-provided and are not independently verified.",
  ],
  [
    "Can I check several keywords at once?",
    "Yes. Enter up to ten distinct queries. Use one query when adding result notes so evidence cannot be assigned to the wrong keyword.",
  ],
  [
    "Is the intent label a ranking signal or confidence score?",
    "No. It is a planning interpretation. The checker does not measure ranking impact, search volume, keyword difficulty, or statistical confidence.",
  ],
  [
    "Why does a keyword return mixed or unclear intent?",
    "A short query may support several reader tasks. Conflicting modifiers also create ambiguity. Check current results before selecting a format.",
  ],
  [
    "What if a review cannot be completed?",
    "Your inputs and previous results stay available. Try again later, or use Quick check for a wording-based estimate.",
  ],
  [
    "What does Quick check include?",
    "Quick check estimates intent from keyword wording. Use a detailed review to include audience context and pasted search-result notes.",
  ],
  [
    "Are my market and audience independently researched?",
    "No. They are context you supply for AI review. The checker does not verify demographics, local search results, or audience behavior.",
  ],
  [
    "What should I do after checking intent?",
    "Verify the result mix, choose one primary reader task, and plan a page that completes it. Then draft an outline and review your evidence.",
  ],
];
const examples = [
  [
    "how to write a meta title",
    "Informational",
    "A practical guide with a worked example",
  ],
  ["ChatGPT login", "Navigational", "The official sign-in destination"],
  [
    "best AI writing tools",
    "Commercial investigation",
    "A comparison with useful selection criteria",
  ],
  [
    "buy a keyword research course",
    "Transactional",
    "A course page with requirements and terms",
  ],
  [
    "AI writing",
    "Mixed / unclear",
    "Validate the result mix before choosing a format",
  ],
];
const prose = "mt-4 text-base leading-8 text-slate-600 dark:text-slate-300";
export default function Page() {
  const schema = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebApplication",
        name: "Search Intent Checker",
        alternateName: "Keyword Intent Checker",
        featureList: [
          "Check up to ten keyword queries",
          "Identify likely primary and secondary intent",
          "Review supporting wording cues and suggested page formats",
          "Copy results or download CSV",
        ],
        url: pageUrl,
        description,
        applicationCategory: "BusinessApplication",
        operatingSystem: "Any",
        browserRequirements: "Requires JavaScript",
      },
      {
        "@type": "FAQPage",
        mainEntity: faqs.map(([question, answer]) => ({
          "@type": "Question",
          name: question,
          acceptedAnswer: { "@type": "Answer", text: answer },
        })),
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { name: "Home", item: "https://doitwithai.tools" },
          { name: "Tools", item: "https://doitwithai.tools/tools" },
          { name: "Search Intent Checker", item: pageUrl },
        ].map((item, index) => ({
          "@type": "ListItem",
          position: index + 1,
          ...item,
        })),
      },
    ],
  };
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(schema).replace(/</g, "\\u003c"),
        }}
      />
      <section
        className={`relative overflow-hidden ${toolHeroSurface} pb-16 pt-10 sm:pt-16`}
      >
        <ToolHeroBackground />
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <nav
            aria-label="Breadcrumb"
            className="mb-10 flex flex-wrap gap-2 text-xs text-slate-400"
          >
            <Link href="/" className="hover:text-white">
              Home
            </Link>
            <span aria-hidden>/</span>
            <Link href="/tools" className="hover:text-white">
              Tools
            </Link>
            <span aria-hidden>/</span>
            <span aria-current="page" className="text-blue-200">
              Search intent checker
            </span>
          </nav>
          <div className="mb-10 max-w-3xl">
            <span className="inline-flex items-center gap-2 rounded-full border border-blue-300/20 bg-blue-400/10 px-4 py-2 text-xs font-semibold text-blue-200">
              <Compass aria-hidden className="h-4 w-4" />
              Free content planning tool
            </span>
            <h1 className="mt-6 text-4xl font-black tracking-tight text-white sm:text-5xl lg:text-6xl">
              Search Intent Checker
            </h1>
            <p className="mt-5 text-lg leading-8 text-slate-300">
              Use this free keyword intent checker to understand what readers
              want. Check likely intent, inspect the wording, and choose a
              suitable page format before writing.
            </p>
            <p className="mt-4 text-sm leading-7 text-slate-400">
              Check one keyword or compare up to ten queries. See clear intent
              labels, practical reader tasks, and suggested next steps.
            </p>
          </div>
          <SearchIntentClient />
          <div className="mt-8 grid gap-4 sm:grid-cols-3">
            {[
              [
                Search,
                "Wording before assumptions",
                "Inspect explicit cues and keep broad queries uncertain.",
              ],
              [
                Compass,
                "A decision beyond a label",
                "Choose a format, useful angle, and proportionate next step.",
              ],
              [
                ListChecks,
                "Evidence you can review",
                "Check quoted cues and compare them with current results.",
              ],
            ].map(([Icon, title, text]) => {
              const Badge = Icon as typeof Search;
              return (
                <div
                  key={String(title)}
                  className="rounded-2xl border border-white/10 bg-white/[0.03] p-5"
                >
                  <Badge aria-hidden className="h-5 w-5 text-blue-300" />
                  <h2 className="mt-3 font-bold text-white">{String(title)}</h2>
                  <p className="mt-2 text-sm leading-7 text-slate-400">
                    {String(text)}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>
      <div className="mx-auto max-w-5xl space-y-16 px-4 py-16 sm:px-6">
        <section>
          <h2 className="text-3xl font-black">How to check keyword intent</h2>
          <ol className="mt-6 grid gap-5 sm:grid-cols-3">
            {[
              [
                "1. Enter real queries",
                "Use the wording readers search, rather than a broad topic list. Add audience and market context for AI review.",
              ],
              [
                "2. Review the interpretation",
                "Check the reader task, suggested format, and uncertainty. Inspect supporting cues before accepting an intent label.",
              ],
              [
                "3. Verify before writing",
                "Search the query in your target market. Compare page types and decide which reader task your page can satisfy.",
              ],
            ].map(([title, text]) => (
              <li
                key={title}
                className="rounded-2xl border border-slate-200 p-5 dark:border-slate-700"
              >
                <h3 className="font-bold">{title}</h3>
                <p className={prose}>{text}</p>
              </li>
            ))}
          </ol>
        </section>
        <section>
          <h2 className="text-3xl font-black">
            Keyword intent and search intent explained
          </h2>
          <p className={prose}>
            Keyword intent, also called search intent, is the task behind a
            query. Someone may want to understand, compare, purchase, or reach a
            known destination.
          </p>
          <p className={prose}>
            The same topic can support several tasks. “Meta title examples” and
            “meta title generator” may need different page experiences.
          </p>
          <div className="mt-6 overflow-x-auto rounded-2xl border border-slate-200 dark:border-slate-700">
            <table className="w-full text-left text-sm">
              <caption className="p-4 text-left text-xs text-slate-500 dark:text-slate-400">
                Illustrative wording-based interpretations, not current
                search-result measurements
              </caption>
              <thead className="bg-slate-100 dark:bg-slate-800">
                <tr>
                  {[
                    "Example query",
                    "Likely intent",
                    "Useful starting format",
                  ].map((label) => (
                    <th key={label} scope="col" className="p-4 font-bold">
                      {label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {examples.map((row) => (
                  <tr
                    key={row[0]}
                    className="border-t border-slate-200 dark:border-slate-700"
                  >
                    {row.map((cell, index) =>
                      index === 0 ? (
                        <th key={index} scope="row" className="p-4 font-medium">
                          {cell}
                        </th>
                      ) : (
                        <td key={index} className="p-4 leading-6">
                          {cell}
                        </td>
                      ),
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className={prose}>
            The four common intent types describe different reader goals. A
            mixed result needs more context, rather than an arbitrary confidence
            score. Semrush’s{" "}
            <a
              href="https://www.semrush.com/blog/keyword-intent/"
              rel="noopener noreferrer"
              className="text-primary underline dark:text-blue-300"
            >
              keyword intent guide
            </a>{" "}
            also explains why one keyword can support multiple intents.
          </p>
          <p className={prose}>
            A brand name alone does not prove navigational intent. Readers may
            be researching features, pricing, alternatives, or account access.
          </p>
        </section>
        <section className="rounded-2xl border border-[#5271FF]/30 bg-[#5271FF]/5 p-6">
          <h2 className="text-2xl font-bold">
            Use ChatGPT prompts to explore keyword intent
          </h2>
          <p className={prose}>
            Review wording cues, compare supplied search-result notes, and turn
            mixed intent into a focused content brief.
          </p>
          <Link
            href="/prompts/chatgpt-prompts-for-search-intent"
            className="mt-4 inline-flex min-h-11 items-center font-bold text-primary underline dark:text-blue-300"
          >
            Read the search intent prompt guide
          </Link>
        </section>
        <section aria-labelledby="intent-strategies">
          <h2 id="intent-strategies" className="text-3xl font-black">
            Different intents need different content strategies
          </h2>
          <p className={prose}>
            Match the page to the reader’s next task. These starting strategies
            help you turn an intent label into a useful experience.
          </p>
          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            {[
              [
                "Informational",
                "Readers want an explanation or practical guidance.",
                "Give a clear answer, useful steps, and worked examples. Link to relevant next learning steps.",
              ],
              [
                "Navigational",
                "Readers want a known website, account, or destination.",
                "Make the destination easy to identify. Keep access instructions short and avoid unrelated introductions.",
              ],
              [
                "Commercial investigation",
                "Readers are evaluating alternatives before choosing.",
                "Compare meaningful criteria, costs, limitations, and suitable use cases. Support recommendations with evidence.",
              ],
              [
                "Transactional",
                "Readers want to buy, book, download, or register.",
                "Explain the offer, requirements, and terms. Provide a clear action that matches the query.",
              ],
              [
                "Mixed or unclear",
                "The wording supports several tasks or lacks enough context.",
                "Inspect current results in your target market. Choose a primary purpose before combining competing page formats.",
              ],
            ].map(([name, overview, strategy]) => (
              <article
                key={name}
                className="rounded-2xl border border-slate-200 p-5 dark:border-slate-700"
              >
                <h3 className="text-lg font-bold">{name}</h3>
                <p className={prose}>{overview}</p>
                <p className="mt-3 text-sm leading-7 text-slate-600 dark:text-slate-300">
                  <strong>Content strategy</strong> {strategy}
                </p>
              </article>
            ))}
          </div>
        </section>
        <section>
          <h2 className="text-3xl font-black">
            Choose the type, format, and angle separately
          </h2>
          <p className={prose}>
            An intent label does not tell you exactly what to publish. Make
            three practical decisions after checking the reader task.
          </p>
          <dl className="mt-6 space-y-4">
            {[
              [
                "Content type",
                "Choose between an article, tool, product page, service page, or official destination.",
              ],
              [
                "Content format",
                "For an article, consider a tutorial, comparison, checklist, review, or explanation.",
              ],
              [
                "Content angle",
                "Decide which reader, constraint, or practical problem your page will address. Avoid copying a competitor’s wording.",
              ],
            ].map(([title, text]) => (
              <div
                key={title}
                className="rounded-xl bg-slate-100 p-5 dark:bg-slate-800"
              >
                <dt className="font-bold">{title}</dt>
                <dd className="mt-2 text-sm leading-7 text-slate-600 dark:text-slate-300">
                  {text}
                </dd>
              </div>
            ))}
          </dl>
          <p className={prose}>
            If results mix tutorials and product pages, do not force every task
            into one article. Select a clear primary purpose and connect related
            pages.
          </p>
        </section>
        <section>
          <h2 className="text-3xl font-black">
            Use your audience to sharpen the reader task
          </h2>
          <p className={prose}>
            Our{" "}
            <Link
              href="/ai-seo/chatgpt-target-audience-research"
              className="text-primary underline dark:text-blue-300"
            >
              target audience research guide
            </Link>{" "}
            examines needs, pain points, experience, and content preferences.
            Bring those details into your planning.
          </p>
          <p className={prose}>
            For example, beginners comparing writing tools may need setup
            difficulty and free-plan limits. An experienced team may prioritize
            review controls and integrations.
          </p>
          <p className={prose}>
            These are possible planning angles, not verified audience findings.
            Support your chosen angle with customer questions, interviews,
            feedback, or other relevant evidence.
          </p>
        </section>
        <section>
          <h2 className="text-3xl font-black">
            Verify the interpretation with actual results
          </h2>
          <ul className="mt-5 list-disc space-y-3 pl-5 text-base leading-8 text-slate-600 dark:text-slate-300">
            <li>
              Inspect current results for the exact query, market, and language.
            </li>
            <li>Record which page types and formats appear repeatedly.</li>
            <li>
              Separate informational explanations from comparisons and direct
              action pages.
            </li>
            <li>Look for conflicting meanings or a mix of reader tasks.</li>
            <li>
              Paste short notes into this tool for one query, then request an AI
              review.
            </li>
          </ul>
          <p className={prose}>
            The AI can interpret supplied notes. It cannot establish that they
            are complete, current, representative, or accurate.
          </p>
          <p className={prose}>
            Our{" "}
            <Link
              href="/ai-seo/what-is-ai-seo"
              className="text-primary underline dark:text-blue-300"
            >
              AI SEO guide
            </Link>{" "}
            separates AI-assisted work from visibility outcomes. Apply that
            distinction here: an interpretation helps planning but does not
            prove search performance.
          </p>
        </section>
        <section>
          <h2 className="text-3xl font-black">
            Move from intent to a focused content plan
          </h2>
          <p className={prose}>
            Start with the research questions in our{" "}
            <Link
              href="/ai-seo/chatgpt-keyword-research"
              className="text-primary underline dark:text-blue-300"
            >
              ChatGPT keyword research guide
            </Link>
            . Keep keyword ideas separate from verified demand and difficulty
            data.
          </p>
          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            {[
              [
                "/tools/keyword-clustering-tool",
                "Group related reader tasks",
                "Organize a supplied keyword list after reviewing its intent.",
              ],
              [
                "/tools/article-outline-generator",
                "Build the right outline",
                "Use your chosen reader task and content angle as the brief.",
              ],
              [
                "/tools/meta-title-generator",
                "Write a faithful page title",
                "Describe the page’s real purpose instead of promising an unrelated outcome.",
              ],
              [
                "/tools/internal-link-opportunity-finder",
                "Connect relevant next steps",
                "Help readers reach useful supporting pages once your draft is ready.",
              ],
            ].map(([href, title, text]) => (
              <Link
                key={href}
                href={href}
                className="rounded-2xl border border-slate-200 p-5 transition hover:border-[#5271ff] dark:border-slate-700"
              >
                <h3 className="flex items-center gap-2 font-bold">
                  {title}
                  <ArrowRight aria-hidden className="h-4 w-4 shrink-0" />
                </h3>
                <p className="mt-2 text-sm leading-7 text-slate-600 dark:text-slate-300">
                  {text}
                </p>
              </Link>
            ))}
          </div>
        </section>
        <section className="rounded-2xl border border-amber-300/50 bg-amber-50 p-6 dark:bg-amber-400/5">
          <h2 className="text-2xl font-black">
            What this checker can and cannot establish
          </h2>
          <p className={prose}>
            The tool suggests intent and content decisions from supplied text.
            It does not fetch websites, inspect live rankings, or provide
            proprietary keyword metrics.
          </p>
          <p className={prose}>
            An empty modifier pattern is not a failed check. It means a cautious
            interpretation needs more context. Do not invent certainty to fill
            the gap.
          </p>
          <p className={prose}>
            Google’s{" "}
            <a
              href="https://developers.google.com/search/docs/fundamentals/creating-helpful-content"
              rel="noopener noreferrer"
              className="text-primary underline dark:text-blue-300"
            >
              people-first content guidance
            </a>{" "}
            emphasizes useful content for an intended audience. Use this checker
            to clarify that purpose, then apply your own evidence and judgment.
          </p>
        </section>
        <section>
          <h2 className="text-3xl font-black">
            Keyword intent checker questions
          </h2>
          <div className="mt-6 divide-y divide-slate-200 rounded-2xl border border-slate-200 px-5 dark:divide-slate-700 dark:border-slate-700">
            {faqs.map(([question, answer]) => (
              <details key={question} className="py-5">
                <summary className="cursor-pointer font-bold leading-7">
                  {question}
                </summary>
                <p className={prose}>{answer}</p>
              </details>
            ))}
          </div>
        </section>
      </div>
      <Suspense fallback={null}>
        <ToolResources slug="search-intent-checker" />
      </Suspense>
    </>
  );
}
