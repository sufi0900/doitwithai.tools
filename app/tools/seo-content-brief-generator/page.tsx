import {
  ToolHeroBackground,
  toolHeroHeading,
  toolHeroSurface,
} from "@/features/tool-ui/ToolHero";
import type { Metadata } from "next";
import { Suspense } from "react";
import Link from "next/link";
import ContentBriefClient from "@/features/content-brief/Client";
import ToolResources from "@/features/tool-catalog/ToolResources";
const pageUrl = "https://doitwithai.tools/tools/seo-content-brief-generator";
const description =
  "Create an editable SEO content brief with reader goals, writer instructions, research gaps, and suggested internal links. Export your brief as Markdown.";
export const metadata: Metadata = {
  title: "SEO Content Brief Generator | Free Writer Brief Template",
  description,
  alternates: { canonical: pageUrl },
  openGraph: {
    title: "SEO Content Brief Generator",
    description,
    url: pageUrl,
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "SEO Content Brief Generator",
    description,
  },
};
const sections = [
  [
    "How to create a useful content brief",
    "Start with a specific topic, intended reader, and clear outcome. Add first-hand insights, constraints, and relevant existing pages. Generate a draft, then review every section before writing.",
  ],
  [
    "A brief gives the writer a clear purpose",
    "An outline lists headings. A brief explains who the page serves, what readers need, and how the writer should support each section. It also sets boundaries so the article stays focused.",
  ],
  [
    "Bring your own evidence and experience",
    "Add customer questions, test observations, product constraints, or lessons from your work. Treat supplied claims as unverified until checked. Use research gaps to assign evidence collection before drafting.",
  ],
  [
    "Keep the scope useful",
    "Cover the main reader task before adding related questions. A longer article does not automatically serve readers better. There is no required word count or keyword density in this tool.",
  ],
  [
    "Plan internal links with a reader purpose",
    "Supply existing page titles and URLs you control. AI may suggest an anchor and placement for relevant candidates. No pages are crawled, so verify each destination and its actual content.",
  ],
  [
    "Keep your source focused",
    "Add up to 6,000 characters of relevant notes and eight candidate links. Include useful insights, constraints, and destinations for the writer.",
  ],
  [
    "Review before handing off",
    "Check the audience, intent, angle, scope, and evidence requests. Replace vague instructions with concrete examples. Edit the Markdown directly, then share the reviewed brief with your writer.",
  ],
];
export default function Page() {
  const schema = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebApplication",
        name: "SEO Content Brief Generator",
        url: pageUrl,
        description,
        applicationCategory: "BusinessApplication",
        operatingSystem: "Any",
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { name: "Home", item: "https://doitwithai.tools" },
          { name: "Tools", item: "https://doitwithai.tools/tools" },
          { name: "SEO Content Brief Generator", item: pageUrl },
        ].map((x, i) => ({ "@type": "ListItem", position: i + 1, ...x })),
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
      <section className={`relative overflow-hidden ${toolHeroSurface} text-white`}
      >
        <ToolHeroBackground />
        <div className="relative mx-auto max-w-6xl px-4 py-6 sm:px-6 sm:py-8">
          <nav
            aria-label="Breadcrumb"
            className="mb-4 flex flex-wrap gap-2 text-xs text-slate-300"
          >
            <Link href="/">Home</Link>
            <span>/</span>
            <Link href="/tools">Tools</Link>
            <span>/</span>
            <span aria-current="page">SEO content brief generator</span>
          </nav>

          <div className="mb-8 grid items-center gap-8 lg:grid-cols-[minmax(0,1.35fr)_minmax(0,0.85fr)]">
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-[#b4c3ff]">
                AI SEO · Editorial Handoff & Outline Brief Builder
              </p>
              <h1 className="mt-4 text-3xl font-black leading-tight sm:text-4xl lg:text-5xl">
                AI-Assisted SEO 
                <span className={toolHeroHeading}>
                  Content Brief Generator
                </span>
              </h1>
              <p className="mt-5 max-w-2xl text-base leading-8 text-slate-300">
                Turn a target keyword, audience, and topic into a structured writer handoff—complete with search intent, H2/H3 section plan, reader questions, and internal link targets.
              </p>
              <div className="mt-7 flex flex-wrap gap-3 text-xs font-semibold text-slate-200">
                <span className="rounded-lg border border-white/15 px-3 py-2">
                  Instant template or AI draft
                </span>
                <span className="rounded-lg border border-white/15 px-3 py-2">
                  Editable writer handoff
                </span>
                <span className="rounded-lg border border-white/15 px-3 py-2">
                  Markdown brief download
                </span>
              </div>
            </div>

            <div className="rounded-2xl border border-[#9aabff]/30 bg-[#101b30]/90 p-6 shadow-xl">
              <p className="text-xs font-bold uppercase tracking-wider text-[#b4c3ff]">
                What Every Content Brief Includes
              </p>
              <ul className="mt-4 space-y-2.5 text-xs text-slate-300">
                <li>
                  <strong className="text-emerald-300">Search Intent & Goal:</strong> Defines the primary reader task, target persona, and page angle.
                </li>
                <li>
                  <strong className="text-indigo-300">Heading Architecture:</strong> Structured H2/H3 outline with talking points for each section.
                </li>
                <li>
                  <strong className="text-sky-300">Evidence Checklist:</strong> Specifies original examples, data points, and claims to verify.
                </li>
                <li>
                  <strong className="text-amber-300">Internal Link Plan:</strong> Maps relevant existing URLs and anchor concepts to include.
                </li>
              </ul>
            </div>
          </div>
          <ContentBriefClient />
        </div>
      </section>
      <div className="mx-auto max-w-6xl space-y-12 px-4 py-16 sm:px-6">
        {sections.map(([heading, text]) => (
          <section key={heading}>
            <h2 className="text-2xl font-black sm:text-3xl">{heading}</h2>
            <p className="mt-4 text-base leading-8 text-slate-600 dark:text-slate-300">
              {text}
            </p>
          </section>
        ))}
        <section>
          <h2 className="text-3xl font-black">
            Build your brief on a clear reader task
          </h2>
          <p className="mt-4 leading-8">
            Use the{" "}
            <Link
              className="text-primary underline"
              href="/tools/search-intent-checker"
            >
              Search Intent Checker
            </Link>{" "}
            before choosing a format. Our{" "}
            <Link
              className="text-primary underline"
              href="/ai-seo/chatgpt-target-audience-research"
            >
              audience research guide
            </Link>{" "}
            supports a reader-focused planning workflow.
          </p>
          <p className="mt-4 leading-8">
            For deeper heading options, use the{" "}
            <Link
              className="text-primary underline"
              href="/tools/article-outline-generator"
            >
              Article Outline Generator
            </Link>
            . Review the draft with our{" "}
            <Link
              className="text-primary underline"
              href="/tools/readability-checker"
            >
              Readability Checker
            </Link>{" "}
            before publishing.
          </p>
        </section>
        <section>
          <h2 className="text-3xl font-black">Content brief questions</h2>
          <div className="mt-6 divide-y rounded-2xl border border-slate-200 px-5 dark:divide-slate-700 dark:border-slate-700">
            {[
              [
                "Does this tool research live search results?",
                "No. It uses supplied text. Validate current results, audience needs, sources, and product details yourself.",
              ],
              [
                "Can I create a brief without AI?",
                "Yes. Choose Build free template for a starting structure you can edit yourself.",
              ],
              [
                "Does a brief guarantee rankings?",
                "No. It supports planning. Search visibility depends on many factors, including the usefulness and accuracy of the published page.",
              ],
              [
                "Are candidate URLs downloaded?",
                "No. Only their titles and URLs are supplied as context. Suggested placements need manual review.",
              ],
              [
                "What happens if generation fails?",
                "Your inputs and previous brief remain available. Try again later, or use the brief template as a starting point.",
              ],
              [
                "Does the tool write the entire article?",
                "No. It creates instructions and research tasks for a writer. Review the draft and collect evidence before writing.",
              ],
            ].map(([q, a]) => (
              <details className="py-5" key={q}>
                <summary className="cursor-pointer font-bold leading-7">
                  {q}
                </summary>
                <p className="mt-3 leading-8 text-slate-600 dark:text-slate-300">
                  {a}
                </p>
              </details>
            ))}
          </div>
        </section>
      </div>
      <Suspense fallback={null}>
        <ToolResources slug="seo-content-brief-generator" />
      </Suspense>
    </>
  );
}
