import type { Metadata } from "next";
import Link from "next/link";
import { Network, ListTree, FileCheck2 } from "lucide-react";
import KeywordClusteringClient from "@/features/keyword-clustering/KeywordClusteringClient";
import ToolResources from "@/features/tool-catalog/ToolResources";
const pageUrl = "https://doitwithai.tools/tools/keyword-clustering-tool";
const description =
  "Group supplied keywords by reader task or topic. Edit memberships, choose primary keywords, split or merge groups, and export a reviewed content plan.";
const image = `https://doitwithai.tools/api/og?${new URLSearchParams({ title: "AI Keyword Clustering Tool", category: "AI SEO · Content Writing", ctaText: "Group. Review. Plan.", features: "CSV Import,Editable Groups,Content Planning" })}`;
export const metadata: Metadata = {
  title: "AI Keyword Clustering Tool: Group, Review and Export",
  description,
  alternates: { canonical: pageUrl },
  openGraph: {
    title: "AI Keyword Clustering Tool",
    description,
    url: pageUrl,
    type: "website",
    images: [{ url: image, width: 1200, height: 630 }],
  },
  twitter: {
    card: "summary_large_image",
    title: "AI Keyword Clustering Tool",
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
        name: "AI Keyword Clustering Tool",
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
          { name: "Keyword Clustering Tool", item: pageUrl },
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
              Keyword Clustering Tool
            </span>
          </nav>
          <header className="mx-auto mb-14 mt-12 max-w-5xl text-center text-white">
            <p className="inline-flex rounded-full border border-white/15 bg-white/10 px-4 py-2 text-xs font-bold uppercase tracking-widest text-blue-100">
              AI SEO · Content Writing
            </p>
            <h1 className="mt-7 text-balance text-4xl font-black tracking-tight sm:text-6xl lg:text-7xl">
              AI Keyword Clustering Tool
              <span className="mt-3 block text-balance bg-gradient-to-r from-blue-300 via-cyan-300 to-violet-300 bg-clip-text text-transparent">
                Turn Keyword Lists Into a Clearer Plan
              </span>
            </h1>
            <p className="mx-auto mt-6 max-w-3xl text-base leading-8 text-slate-300 sm:text-lg">
              Organize related searches, separate different reader tasks, and
              build a content plan you can review before drafting.
            </p>
            <div className="mt-7 flex flex-wrap justify-center gap-3 text-xs font-bold text-slate-300">
              {[
                [Network, "Paste or import"],
                [ListTree, "Intent-aware suggestions"],
                [FileCheck2, "Editable planning workspace"],
              ].map(([Icon, label]) => {
                const I = Icon as typeof Network;
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
          <KeywordClusteringClient />
        </div>
      </div>
      <div className="mx-auto max-w-7xl space-y-20 px-4 py-20 sm:px-6 lg:px-8">
        <section className="grid gap-8 lg:grid-cols-2">
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-[#4662df] dark:text-blue-300">
              Reader tasks before page counts
            </p>
            <h2 className="mt-3 text-3xl font-black sm:text-4xl">
              What keyword clustering helps you organize
            </h2>
            <p className={prose}>
              A keyword list can mix different needs. Someone searching for
              title examples may want guidance, while someone searching for a
              generator wants a utility.
            </p>
            <p className={prose}>
              Clustering makes those relationships easier to inspect. This tool
              suggests groups from the wording you supply, your audience, and
              your project context.
            </p>
            <p className={prose}>
              Each draft group includes a representative keyword, tentative
              intent, a possible page format, and a suggested content focus. You
              can change every planning decision.
            </p>
            <p className={prose}>
              Google recommends useful content created for people. Treat
              grouping as preparation for serving a reader, rather than a reason
              to publish many similar pages.
            </p>
            <p className={prose}>
              <a
                className="font-semibold text-[#4662df] underline dark:text-blue-300"
                href="https://developers.google.com/search/docs/fundamentals/creating-helpful-content"
                target="_blank"
                rel="noopener noreferrer"
              >
                Read Google&apos;s people-first content guidance
              </a>
              .
            </p>
          </div>
          <aside className="rounded-3xl bg-slate-950 p-8 text-white">
            <h3 className="text-2xl font-bold">
              Semantic grouping, with human review
            </h3>
            <p className="mt-4 text-sm leading-8 text-slate-300">
              These suggestions use keyword meaning and your brief. The tool
              does not fetch current search results, search volumes, keyword
              difficulty, or competitor rankings.
            </p>
            <p className="mt-4 text-sm leading-8 text-slate-300">
              A shared word does not establish a shared reader task. A primary
              keyword is a planning choice, not a measured traffic winner.
            </p>
            <p className="mt-4 text-sm leading-8 text-slate-300">
              Check real search results and your existing pages before deciding
              whether a group belongs on one page, several pages, or no new
              page.
            </p>
          </aside>
        </section>
        <section>
          <h2 className="text-3xl font-black">
            Choose the grouping approach that fits your work
          </h2>
          <div className="mt-7 grid gap-6 md:grid-cols-2">
            {[
              [
                "Shared reader task",
                "Use this approach when preparing individual page briefs. The AI is asked to separate different tasks and likely formats, even within one subject.",
                "For example, meta title examples and how to write meta titles may support a guide. Meta title generator may need a separate executable tool.",
                "The suggested separation still needs review. A guide can contain examples, and a tool page can include supporting explanations.",
              ],
              [
                "Broader topic groups",
                "Use this approach when sorting a content inventory or investigating subject coverage. Related themes can stay together without implying one destination page.",
                "A title-writing theme might contain tutorials, examples, and generators. Those keywords belong to a common subject but can serve different purposes.",
                "Use the workspace to split a broad group once you understand the specific task each page should address.",
              ],
            ].map(([title, ...paragraphs]) => (
              <article
                key={title}
                className="rounded-3xl border border-slate-200 p-7 dark:border-slate-800"
              >
                <h3 className="text-xl font-bold">{title}</h3>
                {paragraphs.map((p) => (
                  <p key={p} className={prose}>
                    {p}
                  </p>
                ))}
              </article>
            ))}
          </div>
        </section>
        <section>
          <h2 className="text-3xl font-black">
            A practical workflow from list to draft brief
          </h2>
          <div className="mt-7 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {[
              [
                "01",
                "Prepare a focused batch",
                "Paste 2–80 unique keywords. Use a CSV or TSV column when importing an existing list. Review duplicate cleanup and input errors before generating.",
              ],
              [
                "02",
                "Describe your reader",
                "Add your site's purpose and intended audience. Context helps explain terminology without forcing unrelated searches into your niche.",
              ],
              [
                "03",
                "Inspect the suggested groups",
                "Read the focus and review question. Check whether every keyword belongs to the same task. Ambiguous terms can remain in the review queue.",
              ],
              [
                "04",
                "Refine the workspace",
                "Move selected keywords, split a mixed group, or merge closely related groups. Pick a representative primary keyword and write a precise content focus.",
              ],
              [
                "05",
                "Map existing coverage",
                "Compare groups with pages you already maintain. Consider updating a useful existing page before adding another page with substantially similar coverage.",
              ],
              [
                "06",
                "Export and draft",
                "Export the complete plan, including uncertain terms. Copy a reviewed group brief into the Article Outline Generator, then verify the resulting structure.",
              ],
            ].map(([n, title, body]) => (
              <article
                key={n}
                className="rounded-3xl bg-slate-50 p-6 dark:bg-slate-900"
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
        <section>
          <h2 className="text-3xl font-black">
            Example: separate related topics from different tasks
          </h2>
          <p className={prose}>
            These illustrative groups explain the workflow. They are not
            measured keyword opportunities or findings from current search
            results.
          </p>
          <div className="mt-7 grid gap-6 md:grid-cols-3">
            {[
              [
                "Writing title tags",
                "how to write meta titles · meta title examples",
                "Possible format: educational guide",
                "Explain a practical writing process, then show examples with their context. Check whether the audience needs beginner instruction or a review checklist.",
              ],
              [
                "Generating title drafts",
                "meta title generator · AI title generator",
                "Possible format: interactive tool",
                "Help users generate and compare title drafts. Confirm that AI title generator means website titles rather than another kind of title.",
              ],
              [
                "Ambiguous meaning",
                "apple",
                "Possible destination: review queue",
                "The term could refer to fruit, a company, or another meaning. Add context or research the intended use before assigning a topic.",
              ],
            ].map(([title, keywords, format, focus]) => (
              <article
                key={title}
                className="rounded-3xl border border-slate-200 p-6 dark:border-slate-800"
              >
                <h3 className="text-xl font-bold">{title}</h3>
                <p className="mt-4 break-words rounded-xl bg-blue-50 p-4 text-sm leading-7 text-blue-900 dark:bg-blue-950 dark:text-blue-200">
                  {keywords}
                </p>
                <p className="mt-4 text-sm font-bold">{format}</p>
                <p className={prose}>{focus}</p>
              </article>
            ))}
          </div>
        </section>
        <section className="grid gap-8 lg:grid-cols-2">
          <div>
            <h2 className="text-3xl font-black">
              Build a page brief, not a publishing quota
            </h2>
            <p className={prose}>
              Before drafting, write the reader&apos;s problem in one sentence.
              Describe what they should understand, compare, or accomplish after
              using the page.
            </p>
            <p className={prose}>
              Choose supporting questions that belong to that task. Related
              vocabulary can guide coverage, but every phrase does not need its
              own heading or repetition.
            </p>
            <p className={prose}>
              Review the suggested format against actual results for your
              intended audience and location. Search intent can be mixed, and
              the tool cannot observe those results.
            </p>
            <p className={prose}>
              Keep a record of the existing URL, proposed change, evidence
              needed, and editorial owner outside this workspace. These
              decisions need information beyond keyword wording.
            </p>
            <p className={prose}>
              An outline can then translate your reviewed focus into sections.
              Recheck examples, factual claims, and the final content against
              the original reader need.
            </p>
            <Link
              href="/tools/article-outline-generator"
              className="mt-5 inline-flex min-h-11 items-center rounded-lg border border-blue-200 px-4 py-2 text-sm font-bold text-[#4662df] dark:border-blue-900 dark:text-blue-300"
            >
              Plan the article structure
            </Link>
          </div>
          <aside className="rounded-3xl border border-slate-200 p-7 dark:border-slate-800">
            <h3 className="text-xl font-bold">Review before publishing</h3>
            <ul className="mt-5 list-disc space-y-4 pl-5 text-sm leading-7 text-slate-600 dark:text-slate-300">
              <li>
                Do group members share a useful reader task, rather than only a
                word?
              </li>
              <li>
                Have you checked ambiguous terms and tentative intent labels?
              </li>
              <li>Does an existing page already satisfy this need?</li>
              <li>
                Can you provide useful examples, evidence, and a clear next
                action?
              </li>
              <li>
                Are the primary keyword and proposed format sensible for your
                audience?
              </li>
              <li>
                Have you reviewed group notes again after changing membership?
              </li>
            </ul>
          </aside>
        </section>
        <section>
          <h2 className="text-3xl font-black">Keyword clustering questions</h2>
          <div className="mt-7 divide-y divide-slate-200 rounded-3xl border border-slate-200 px-6 dark:divide-slate-800 dark:border-slate-800">
            {[
              [
                "Is this a search-result clustering tool?",
                "No. It groups supplied keyword wording with AI assistance. It does not compare live ranking URLs or calculate search-result overlap.",
              ],
              [
                "Can I import search volume and difficulty columns?",
                "You can upload a CSV with multiple columns, but only the selected keyword column is used. Other metrics are neither imported nor evaluated.",
              ],
              [
                "Why are duplicate keywords removed?",
                "Repeated terms do not add a distinct planning item. Cleanup compares case, spacing, and Unicode compatibility forms while preserving meaningful punctuation.",
              ],
              [
                "Does each group require its own page?",
                "No. A topic group can contain several tasks, and a task group may belong on an existing page. Review coverage and reader needs first.",
              ],
              [
                "Can I split or merge the AI suggestions?",
                "Yes. Select keywords to move or create a group. Merge whole groups into a chosen destination. Undo restores recent edits without dropping keywords.",
              ],
              [
                "What does primary keyword mean here?",
                "It is a representative term for organizing the brief. The tool has no demand or difficulty data to establish the best ranking target.",
              ],
              [
                "Where does my uploaded file go?",
                "The browser reads the file locally. Generation sends the cleaned keyword list and optional brief through our API to the AI provider.",
              ],
              [
                "Does the tool save my plan or guarantee rankings?",
                "No. Unsaved drafts disappear on refresh. Save locally or export a project. Grouping is a planning aid and cannot guarantee search visibility, traffic, or business results.",
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
        <section className="grid gap-8 lg:grid-cols-2">
          <div>
            <h2 className="text-3xl font-black">
              Keep a research trail for every page decision
            </h2>
            <p className={prose}>
              Clustering is only the first step. Record whether a group needs a
              new page, an existing-page update, or more research.
            </p>
            <p className={prose}>
              Add an existing or proposed URL and notes from your research.
              These references are never fetched, and their contents are not
              checked automatically.
            </p>
            <p className={prose}>
              When groups share a URL, the workspace asks you to review their
              relationship. Sharing a destination does not prove a ranking
              conflict.
            </p>
            <p className={prose}>
              Use the checklist to record your review of membership, actual
              search results, and existing coverage. Changing the brief or
              membership clears those checks.
            </p>
          </div>
          <aside className="rounded-3xl border border-slate-200 p-7 dark:border-slate-800">
            <h3 className="text-xl font-bold">A project you can return to</h3>
            <p className={prose}>
              Save manually in your browser, or download a project JSON file
              that keeps your source keywords, edited groups, and planning
              notes.
            </p>
            <p className={prose}>
              Imported projects are checked for supported structure and complete
              keyword coverage. Invalid files leave the open workspace
              unchanged.
            </p>
            <p className={prose}>
              Browser saves stay on the same browser and site. Clearing browser
              data can remove them. Keep an exported project when the plan
              matters.
            </p>
            <p className={prose}>
              Review progress represents your recorded decisions. It is not an
              SEO score, research verification, or promise of search
              performance.
            </p>
          </aside>
        </section>
        <ToolResources slug="keyword-clustering-tool" />
      </div>
    </>
  );
}
