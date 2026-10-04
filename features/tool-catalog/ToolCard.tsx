import Link from "next/link";
import {
  AlignLeft,
  ArrowRight,
  BookOpen,
  Braces,
  Heading1,
  Link2,
  ListTree,
  Network,
  ScanText,
  ScanEye,
  Sparkles,
  Type,
} from "lucide-react";
import {
  categories,
  toolPath,
  categoryPath,
  type CatalogTool,
} from "./catalog";
const icons = {
  "meta-title-generator": Type,
  "slug-generator": Link2,
  "schema-markup-generator": Braces,
  "meta-description-generator": AlignLeft,
  "h1-heading-generator": Heading1,
  "article-outline-generator": ListTree,
  "readability-checker": ScanText,
  "image-alt-text-generator": ScanEye,
  "keyword-clustering-tool": Network,
};
export default function ToolCard({
  tool,
  headingLevel = 2,
}: {
  tool: CatalogTool;
  headingLevel?: 2 | 3;
}) {
  const Icon = icons[tool.slug] || Sparkles;
  const Heading = headingLevel === 3 ? "h3" : "h2";
  return (
    <article className="group relative flex h-full flex-col overflow-hidden rounded-[26px] border border-slate-200 bg-white p-6 shadow-sm transition duration-200 hover:border-[#5271ff]/40 hover:shadow-lg hover:shadow-slate-200/40 dark:border-slate-700 dark:bg-[#1D2430] sm:p-7">
      <div
        aria-hidden
        className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-[#5271ff] via-blue-400 to-cyan-300 opacity-0 transition group-hover:opacity-100"
      />
      <div className="mb-5 flex items-center justify-between gap-3">
        <div className="grid h-12 w-12 place-items-center rounded-2xl border border-[#5271ff]/10 bg-[#5271ff]/[0.08] text-[#5271ff] dark:text-blue-300">
          <Icon aria-hidden className="h-6 w-6" />
        </div>
        <span className="rounded-full border border-slate-200 px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:border-slate-700 dark:text-slate-400">
          {tool.kind}
        </span>
      </div>
      <Heading className="text-xl font-extrabold tracking-tight text-slate-950 dark:text-white">
        <Link
          href={toolPath(tool.slug)}
          className="rounded hover:text-[#5271ff] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-blue-300"
        >
          {tool.name}
        </Link>
      </Heading>
      <p className="mt-3 flex-1 text-sm leading-7 text-slate-500 dark:text-slate-400">
        {tool.description}
      </p>
      <Link
        data-open-tool
        href={toolPath(tool.slug)}
        className="mt-6 inline-flex min-h-11 w-fit items-center justify-center gap-3 rounded-lg border border-[#5271ff]/25 bg-[#5271ff]/[0.04] px-4 py-2.5 text-sm font-bold text-[#4662df] transition hover:border-[#5271ff]/50 hover:bg-[#5271ff]/[0.09] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-blue-300 dark:border-blue-400/30 dark:bg-blue-400/10 dark:text-blue-200 dark:hover:bg-blue-400/20"
      >
        <span>
          Open tool<span className="sr-only">: {tool.name}</span>
        </span>
        <span className="inline-flex items-center">
          <ArrowRight
            aria-hidden
            className="h-4 w-4 transition group-hover:translate-x-0.5 motion-reduce:transform-none"
          />
        </span>
      </Link>
      <div className="mt-5 border-t border-slate-100 pt-4 dark:border-slate-700/70">
        <div className="mb-3 flex flex-wrap gap-x-3 gap-y-2">
          {tool.categories.map((slug) => (
            <Link
              key={slug}
              href={categoryPath(slug)}
              className="text-[10px] font-bold uppercase tracking-wider text-slate-500 hover:text-[#4662df] dark:text-slate-400 dark:hover:text-blue-300"
            >
              {categories.find((item) => item.slug === slug)?.name}
            </Link>
          ))}
        </div>
        {tool.relatedGuides.map((guide) => (
          <Link
            key={guide.path}
            href={guide.path}
            className="inline-flex min-h-9 items-center gap-2 text-xs font-medium text-slate-500 transition hover:text-[#5271ff] dark:text-slate-400 dark:hover:text-blue-300"
          >
            <BookOpen aria-hidden className="h-3.5 w-3.5 shrink-0" />
            <span>
              Read guide<span className="sr-only">: {guide.title}</span>
            </span>
            <ArrowRight aria-hidden className="h-3 w-3" />
          </Link>
        ))}
      </div>
    </article>
  );
}
