import type { Metadata } from "next";
import Link from "next/link";
import { GitBranch, ListTree, FileCheck2 } from "lucide-react";
import TopicalMapClient from "@/features/topical-map/TopicalMapClient";
import ToolResources from "@/features/tool-catalog/ToolResources";
const pageUrl = "https://doitwithai.tools/tools/topical-map-generator";
const description =
  "Generate an editable topic hierarchy from a seed or brief. Plan pillars, supporting topics, and page decisions while keeping keyword metrics clearly unverified.";
const image = `https://doitwithai.tools/api/og?${new URLSearchParams({ title: "AI Topical Map Generator", category: "AI SEO · Content Writing", ctaText: "Explore. Map. Refine.", features: "Topic Hierarchy,Editable Branches,Content Planning" })}`;
export const metadata: Metadata = {
  title: "AI Topical Map Generator for Content Planning",
  description,
  alternates: { canonical: pageUrl },
  openGraph: {
    title: "AI Topical Map Generator",
    description,
    url: pageUrl,
    type: "website",
    images: [{ url: image, width: 1200, height: 630 }],
  },
  twitter: {
    card: "summary_large_image",
    title: "AI Topical Map Generator",
    description,
    images: [image],
  },
};
const prose = "mt-4 text-sm leading-8 text-slate-600 dark:text-slate-300";
export default function Page() {
  const schema = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebApplication",
        name: "AI Topical Map Generator",
        url: pageUrl,
        description,
        applicationCategory: "BusinessApplication",
        operatingSystem: "Any",
        browserRequirements: "Requires JavaScript",
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { name: "Home", item: "https://doitwithai.tools" },
          { name: "Tools", item: "https://doitwithai.tools/tools" },
          { name: "Topical Map Generator", item: pageUrl },
        ].map((s, i) => ({ "@type": "ListItem", position: i + 1, ...s })),
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
      <div className="relative overflow-hidden bg-slate-950 pb-20 pt-10 sm:pt-16">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,rgba(255,255,255,0.08)_1px,transparent_0)] bg-[size:28px_28px]"
        />
        <div
          aria-hidden
          className="absolute -left-32 top-10 h-96 w-96 rounded-full bg-[#5271ff]/25 blur-3xl"
        />
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <nav
            aria-label="Breadcrumb"
            className="flex flex-wrap gap-2 text-xs text-slate-400"
          >
            <Link href="/">Home</Link>
            <span>/</span>
            <Link href="/tools">Tools</Link>
            <span>/</span>
            <span aria-current="page" className="text-blue-200">
              Topical Map Generator
            </span>
          </nav>
          <header className="mx-auto mb-14 mt-12 max-w-5xl text-center text-white">
            <p className="inline-flex rounded-full border border-white/15 bg-white/10 px-4 py-2 text-xs font-bold uppercase tracking-widest text-blue-100">
              AI SEO · Content Writing
            </p>
            <h1 className="mt-7 text-balance text-4xl font-black tracking-tight sm:text-6xl lg:text-7xl">
              AI Topical Map Generator
              <span className="mt-3 block text-balance bg-gradient-to-r from-blue-300 via-cyan-300 to-violet-300 bg-clip-text text-transparent">
                Connect Broad Themes With Useful Reader Tasks
              </span>
            </h1>
            <p className="mx-auto mt-6 max-w-3xl text-base leading-8 text-slate-300 sm:text-lg">
              Organize related searches, separate different reader tasks, and
              build a content plan you can review before drafting.
            </p>
            <div className="mt-7 flex flex-wrap justify-center gap-3 text-xs font-bold text-slate-300">
              {[
                [GitBranch, "Seed or project brief"],
                [ListTree, "Editable topic branches"],
                [FileCheck2, "Human review"],
              ].map(([Icon, label]) => {
                const I = Icon as typeof GitBranch;
                return (
                  <span
                    key={label as string}
                    className="inline-flex items-center gap-2 rounded-full border border-white/10 px-3 py-2"
                  >
                    <I aria-hidden className="h-4 w-4 text-blue-300" />
                    {label as string}
                  </span>
                );
              })}
            </div>
          </header>
          <TopicalMapClient />
        </div>
      </div>
      <div className="mx-auto max-w-7xl space-y-20 px-4 py-20 sm:px-6 lg:px-8">
        <section className="grid gap-8 lg:grid-cols-2">
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-[#4662df] dark:text-blue-300">
              A hierarchy with a purpose
            </p>
            <h2 className="mt-3 text-3xl font-black sm:text-4xl">
              Explore topics before deciding what to publish
            </h2>
            <p className={prose}>
              A broad subject can lead to many different reader tasks. A topical
              map organizes those possibilities into a root subject, pillar
              themes, and supporting topics.
            </p>
            <p className={prose}>
              This generator starts from a seed keyword, an introduction, a
              summary, or a project brief. Gemini proposes relationships you can
              inspect and change.
            </p>
            <p className={prose}>
              Each topic includes keyword ideas, tentative intent, a suggested
              format, and a reader-focused explanation. The tree provides an
              initial planning structure, not verified keyword research.
            </p>
            <p className={prose}>
              Google encourages content that serves an intended audience and
              helps people accomplish their goals. Use the map to clarify those
              needs before drafting.
            </p>
            <p className={prose}>
              <a
                href="https://developers.google.com/search/docs/fundamentals/creating-helpful-content"
                target="_blank"
                rel="noopener noreferrer"
                className="font-semibold text-[#4662df] underline dark:text-blue-300"
              >
                Read Google&apos;s people-first content guidance
              </a>
              .
            </p>
          </div>
          <aside className="rounded-3xl bg-slate-950 p-8 text-white">
            <h3 className="text-2xl font-bold">
              Breadth, intent, and difficulty are different
            </h3>
            <p className="mt-4 text-sm leading-8 text-slate-300">
              The top of the map contains a broad theme. Lower branches contain
              narrower tasks. Their position does not establish ranking
              difficulty or commercial value.
            </p>
            <p className="mt-4 text-sm leading-8 text-slate-300">
              An informational question can be highly competitive. A specific
              query can also be difficult. This tool does not determine either
              condition from wording alone.
            </p>
            <p className="mt-4 text-sm leading-8 text-slate-300">
              Difficulty and volume remain “Not verified.” No live results,
              keyword metrics, competition measurements, or factual research
              have been retrieved.
            </p>
          </aside>
        </section>
        <section>
          <h2 className="text-3xl font-black">
            Choose the map that matches your project
          </h2>
          <div className="mt-7 grid gap-6 md:grid-cols-3">
            {[
              [
                "A website or content hub",
                "Start with the subject your site serves and the audience you want to help. Pillars suggest themes; supporting branches suggest more focused tasks.",
                "Compare the map with your existing pages. Some branches can become sections, while others may justify separate resources.",
              ],
              [
                "A blog article",
                "Paste an introduction or summary that explains the article's purpose. The hierarchy can suggest sections and supporting questions within one useful article.",
                "Avoid turning every related phrase into a new URL. First decide which questions belong together in the same reader experience.",
              ],
              [
                "A landing page",
                "Describe the offer and audience without inventing benefits or customer results. Explore user needs, objections, explanations, and supporting resources.",
                "The suggestions are planning ideas. Verify every offer detail, factual statement, and claim before incorporating it into a page.",
              ],
            ].map(([title, a, b]) => (
              <article
                key={title}
                className="rounded-3xl border border-slate-200 p-7 dark:border-slate-800"
              >
                <h3 className="text-xl font-bold">{title}</h3>
                <p className={prose}>{a}</p>
                <p className={prose}>{b}</p>
              </article>
            ))}
          </div>
        </section>
        <section>
          <h2 className="text-3xl font-black">
            An example hierarchy for SEO with AI
          </h2>
          <p className={prose}>
            The examples below illustrate topic relationships. They are not a
            difficulty order or a list of measured search opportunities.
          </p>
          <div className="mt-7 grid gap-6 md:grid-cols-3">
            {[
              [
                "Root subject",
                "SEO with AI",
                "Define the overall audience and scope. A broad hub can introduce practical workflows and connect visitors with focused resources.",
              ],
              [
                "Pillar theme",
                "AI-assisted content planning",
                "Explore related tasks such as audience research, topic discovery, keyword grouping, and outlining. Review whether they belong within one guide or several resources.",
              ],
              [
                "Supporting task",
                "How to review an AI-generated article outline",
                "Focus on one concrete task. Show what to check, explain common problems, and provide useful examples before suggesting the next step.",
              ],
            ].map(([level, title, body]) => (
              <article
                key={level}
                className="rounded-3xl bg-slate-50 p-7 dark:bg-slate-900"
              >
                <span className="text-xs font-bold uppercase tracking-widest text-[#4662df] dark:text-blue-300">
                  {level}
                </span>
                <h3 className="mt-4 text-xl font-bold">{title}</h3>
                <p className={prose}>{body}</p>
                <p className="mt-4 text-xs font-semibold text-slate-500 dark:text-slate-400">
                  Difficulty and search volume: Not verified
                </p>
              </article>
            ))}
          </div>
        </section>
        <section>
          <h2 className="text-3xl font-black">
            From topic discovery to an actionable content plan
          </h2>
          <div className="mt-7 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {[
              [
                "01",
                "Define the reader",
                "Describe who the project serves and what they need to accomplish. Add country context when it helps explain the audience.",
              ],
              [
                "02",
                "Generate a focused map",
                "Choose a compact map before exploring a larger structure. A small hierarchy can be easier to review and refine thoughtfully.",
              ],
              [
                "03",
                "Check the relationships",
                "Read each relationship note. Move misplaced topics, add useful tasks, and remove irrelevant branches. The structure supports up to three levels.",
              ],
              [
                "04",
                "Choose pages or sections",
                "Decide whether each topic needs research, belongs within a parent page, deserves a separate page, or supports an existing-page update.",
              ],
              [
                "05",
                "Validate the opportunities",
                "Review actual search results and existing content. Use a keyword-data provider when you need volume or difficulty estimates, and retain its source and location.",
              ],
              [
                "06",
                "Save and continue",
                "Save the project or export the map. Copy keyword ideas into the clustering tool, then use reviewed topic briefs to develop article outlines.",
              ],
            ].map(([n, title, body]) => (
              <article
                key={n}
                className="rounded-3xl border border-slate-200 p-6 dark:border-slate-800"
              >
                <span className="font-black text-[#4662df] dark:text-blue-300">
                  {n}
                </span>
                <h3 className="mt-3 text-lg font-bold">{title}</h3>
                <p className={prose}>{body}</p>
              </article>
            ))}
          </div>
        </section>
        <section className="grid gap-8 lg:grid-cols-2">
          <div>
            <h2 className="text-3xl font-black">
              Topical mapping and keyword clustering serve different steps
            </h2>
            <p className={prose}>
              Topical mapping discovers possible themes from a seed or brief.
              Keyword clustering organizes a list you already supply into groups
              you can review.
            </p>
            <p className={prose}>
              Use this map to explore coverage without treating every suggestion
              as a publication requirement. The proposed keywords are ideas, not
              confirmed searches or measured opportunities.
            </p>
            <p className={prose}>
              Then refine the list through research and clustering. Choose
              representative terms and reader tasks before turning the strongest
              briefs into article structures.
            </p>
            <p className={prose}>
              Internal links should connect useful resources in context.
              Parent-child relationships can inform that plan, but the tool does
              not insert links into your website.
            </p>
            <div className="mt-5 flex flex-wrap gap-3">
              <Link
                href="/tools/keyword-clustering-tool"
                className="inline-flex min-h-11 items-center rounded-lg border border-blue-200 px-4 py-2 text-sm font-bold text-[#4662df] dark:border-blue-900 dark:text-blue-300"
              >
                Review keyword groups
              </Link>
              <Link
                href="/tools/article-outline-generator"
                className="inline-flex min-h-11 items-center rounded-lg border border-blue-200 px-4 py-2 text-sm font-bold text-[#4662df] dark:border-blue-900 dark:text-blue-300"
              >
                Build a reviewed outline
              </Link>
            </div>
          </div>
          <aside className="rounded-3xl border border-slate-200 p-7 dark:border-slate-800">
            <h3 className="text-xl font-bold">Keep your planning evidence</h3>
            <p className={prose}>
              Record research notes and existing URLs beside the topics.
              References are never fetched, and recorded review flags are not
              independent verification.
            </p>
            <p className={prose}>
              Editing a topic clears its review flag. Structural changes clear
              map reviews because the relationships may need another look.
            </p>
            <p className={prose}>
              Browser saves are manual and stay in the same browser and site.
              Export a project JSON file when you want a portable copy.
            </p>
            <p className={prose}>
              Project imports validate hierarchy and field limits before
              replacing the workspace. Invalid files preserve the open map.
              Unsaved edits disappear on refresh.
            </p>
          </aside>
        </section>
        <section>
          <h2 className="text-3xl font-black">Topical map questions</h2>
          <div className="mt-7 divide-y divide-slate-200 rounded-3xl border border-slate-200 px-6 dark:divide-slate-800 dark:border-slate-800">
            {[
              [
                "Can I start without a keyword list?",
                "Yes. Supply a seed topic or a project brief. An introduction or summary can explain the planned article, website, or landing page.",
              ],
              [
                "Does a lower branch mean lower keyword difficulty?",
                "No. The hierarchy shows thematic relationships. Difficulty depends on factors this generator does not measure. Every topic's difficulty remains unverified.",
              ],
              [
                "Are the suggested keywords real search queries?",
                "They are AI-generated keyword ideas. The tool does not confirm search demand or query frequency. Validate them through research before targeting them.",
              ],
              [
                "Can I change the hierarchy?",
                "Yes. Select a topic to edit its brief, move it to a valid parent, add children, or remove a branch. Undo restores recent changes.",
              ],
              [
                "Does every supporting topic need a separate page?",
                "No. Related tasks may belong within one article or landing page. Review existing content and the reader's needs before deciding on separate pages.",
              ],
              [
                "Does country context provide local search data?",
                "No. It informs the project brief. The generator does not retrieve live results, location-specific volumes, rankings, or competition data.",
              ],
              [
                "Can I save the map and return later?",
                "Yes. Save manually in the browser or download a project JSON file. CSV and Markdown exports provide readable planning records.",
              ],
              [
                "Does Gemini guarantee a correct map or better rankings?",
                "No. Gemini generates tentative suggestions from your brief. Human research and editing remain necessary. The tool cannot guarantee rankings, traffic, citations, or business results.",
              ],
            ].map(([q, a]) => (
              <details key={q} className="py-5">
                <summary className="cursor-pointer text-base font-bold leading-7">
                  {q}
                </summary>
                <p className={prose}>{a}</p>
              </details>
            ))}
          </div>
        </section>
        <ToolResources slug="topical-map-generator" />
      </div>
    </>
  );
}
