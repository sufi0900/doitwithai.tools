import Link from "next/link";
import {
  ArrowRight,
  ArrowRightLeft,
  FileText,
  FileType2,
  Headphones,
  Clapperboard,
} from "lucide-react";
import ToolCatalog from "../tool-catalog/ToolCatalog";
import { collectionSchema, type CatalogTool } from "../tool-catalog/catalog";
import { conversionCollection, conversionPlan } from "./collection";

export default function ConversionCollection({
  items,
}: {
  items: CatalogTool[];
}) {
  const available = new Set(items.map((item) => item.slug));
  const planned = conversionPlan.filter((item) => !available.has(item.slug));
  return (
    <main className="bg-white text-slate-900 dark:bg-[#0F1523] dark:text-white">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(
            collectionSchema(
              "Content Conversion Tools",
              "/tools/categories/content-conversion",
              items,
            ),
          ).replace(/</g, "\\u003c"),
        }}
      />
      <header className="relative isolate overflow-hidden bg-[#241B25] text-white">
        <div
          aria-hidden
          className="pointer-events-none absolute -right-24 -top-28 h-96 w-96 rounded-full bg-orange-500/20 blur-3xl"
        />
        <div className="relative mx-auto max-w-6xl px-4 py-12 sm:px-6 sm:py-16">
          <nav
            aria-label="Breadcrumb"
            className="mb-8 flex flex-wrap gap-2 text-xs text-orange-100/75"
          >
            <Link href="/tools">Tools</Link>
            <span>/</span>
            <Link href="/tools/categories">Categories</Link>
            <span>/</span>
            <span aria-current="page">Content conversion</span>
          </nav>
          <div className="grid items-center gap-10 lg:grid-cols-[1.15fr_0.85fr]">
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-orange-200">
                One article. More useful formats.
              </p>
              <h1 className="mt-4 text-4xl font-black leading-tight sm:text-5xl">
                Content Conversion{" "}
                <span className="text-orange-300">Tools</span>
              </h1>
              <p className="mt-5 max-w-2xl text-base leading-8 text-orange-50/80">
                A collection for turning blog articles into clean documents,
                listening experiences, video scripts, and social content.
              </p>
              <p className="mt-6 inline-flex items-center gap-2 rounded-full border border-orange-300/25 bg-orange-300/10 px-4 py-2 text-xs font-semibold text-orange-100">
                <ArrowRightLeft size={15} aria-hidden />
                {items.length
                  ? `${items.length} ${items.length === 1 ? "tool" : "tools"} available`
                  : "Collection in preparation"}
              </p>
              <a
                href={items.length ? "#conversion-tools" : "#conversion-plan"}
                className="mt-7 flex w-fit items-center gap-2 rounded-xl bg-orange-200 px-5 py-3 text-sm font-bold text-orange-950 hover:bg-orange-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-orange-200"
              >
                {items.length
                  ? "Browse available tools"
                  : "Explore planned formats"}
                <ArrowRight size={16} aria-hidden />
              </a>
            </div>
            <div
              className="rounded-3xl border border-orange-200/20 bg-white/[0.04] p-6 sm:p-7"
              aria-label="Article conversion roadmap"
            >
              <div className="flex items-center gap-4 rounded-2xl border border-orange-200/15 bg-[#352630] p-5">
                <span className="rounded-xl bg-orange-200/10 p-3 text-orange-200">
                  <FileText size={26} aria-hidden />
                </span>
                <div>
                  <p className="text-lg font-bold">Your article</p>
                  <p className="mt-1 text-xs leading-6 text-orange-100/65">
                    Start with a URL or supplied text
                  </p>
                </div>
              </div>
              <p className="my-5 text-center text-xs font-semibold uppercase tracking-widest text-orange-200/75">
                Output roadmap
              </p>
              <div className="grid grid-cols-2 gap-3">
                {[
                  [
                    FileText,
                    available.has("article-to-pdf")
                      ? "PDF · Available"
                      : "PDF · Planned",
                  ],
                  [
                    FileType2,
                    available.has("article-to-word")
                      ? "DOCX · Available"
                      : "DOCX · Planned",
                  ],
                  [Headphones, "Audio · Planned"],
                  [Clapperboard, "Script · Planned"],
                ].map(([Icon, label]) => {
                  const Graphic = Icon as typeof FileText;
                  return (
                    <div
                      key={String(label)}
                      className="flex items-center gap-3 rounded-xl border border-orange-200/15 p-4 text-sm"
                    >
                      <Graphic
                        size={19}
                        aria-hidden
                        className="shrink-0 text-orange-300"
                      />
                      <span>{String(label)}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </header>
      <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
        {items.length ? (
          <section id="conversion-tools" className="scroll-mt-28">
            <h2 className="text-2xl font-extrabold">
              Available conversion tools
            </h2>
            <ToolCatalog category={conversionCollection.slug} />
          </section>
        ) : (
          <section className="rounded-2xl border border-orange-200 bg-orange-50/60 p-6 dark:border-orange-300/20 dark:bg-orange-300/[0.04]">
            <p className="text-xs font-bold uppercase tracking-wider text-orange-800 dark:text-orange-200">
              Build sequence
            </p>
            <h2 className="mt-3 text-2xl font-extrabold">
              First planned tool · Article to PDF
            </h2>
            <p className="mt-4 max-w-3xl text-sm leading-7 text-slate-600 dark:text-slate-300">
              The first release will focus on a readable article export. The
              individual converters are being developed one at a time.
            </p>
          </section>
        )}
        <section id="conversion-plan" className="scroll-mt-28 py-12">
          <p className="text-xs font-bold uppercase tracking-wider text-orange-800 dark:text-orange-200">
            Planned formats
          </p>
          <h2 className="mt-3 text-3xl font-extrabold">
            Keep the idea. Change the format.
          </h2>
          <p className="mt-4 max-w-3xl text-base leading-8 text-slate-600 dark:text-slate-300">
            These are planned additions, with each output designed for a
            different reading, editing, or publishing task.
          </p>
          <ol className="mt-8 divide-y divide-slate-200 rounded-2xl border border-slate-200 dark:divide-slate-700 dark:border-slate-700">
            {planned.map((item, index) => (
              <li
                key={item.slug}
                className="grid gap-3 p-5 sm:grid-cols-[48px_1fr_auto] sm:items-center sm:p-6"
              >
                <span className="text-sm font-black text-orange-800 dark:text-orange-200">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <div>
                  <h3 className="text-lg font-bold">{item.name}</h3>
                  <p className="mt-2 text-sm leading-7 text-slate-600 dark:text-slate-300">
                    {item.purpose}
                  </p>
                </div>
                <span className="w-fit rounded-lg border border-orange-200 bg-orange-50 px-3 py-1.5 text-[10px] font-bold tracking-wider text-orange-800 dark:border-orange-300/20 dark:bg-orange-300/10 dark:text-orange-200">
                  {item.format} · PLANNED
                </span>
              </li>
            ))}
          </ol>
        </section>
        <section className="border-t border-slate-200 py-10 dark:border-slate-700">
          <h2 className="text-2xl font-extrabold">
            A simple workflow across the collection
          </h2>
          <div className="mt-6 grid gap-6 md:grid-cols-3">
            {[
              [
                "Start with the article",
                "The planned flow accepts an article URL, with supplied text available when a page cannot be imported.",
              ],
              [
                "Review the source",
                "Check the extracted title, headings, text, and images before creating an export or adapting the article.",
              ],
              [
                "Choose a useful output",
                "Keep the original wording for document exports, or review a rewritten draft for scripts and social posts.",
              ],
            ].map(([heading, text]) => (
              <div key={heading}>
                <h3 className="text-base font-bold text-orange-800 dark:text-orange-200">
                  {heading}
                </h3>
                <p className="mt-3 text-sm leading-7 text-slate-600 dark:text-slate-300">
                  {text}
                </p>
              </div>
            ))}
          </div>
          <p className="mt-8 rounded-xl bg-slate-50 p-4 text-sm leading-7 text-slate-600 dark:bg-slate-900 dark:text-slate-300">
            Read-aloud playback and downloadable audio are different outputs. A
            video script is a writing draft, rather than a rendered video file.
          </p>
        </section>
        <Link
          href="/tools"
          className="inline-flex items-center gap-2 text-sm font-bold text-orange-800 hover:underline dark:text-orange-200"
        >
          Browse current tools
          <ArrowRight size={16} aria-hidden />
        </Link>
      </div>
    </main>
  );
}
