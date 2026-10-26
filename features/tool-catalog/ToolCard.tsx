import Link from "next/link";
import { ToolActions } from "../tools-workspace/ToolActions";
import {
  ClipboardList,
  Bot,
  FileCode2,
  ListChecks,
  TextSearch,
  MessageCircleQuestion,
  AlignLeft,
  ArrowRight,
  BookOpen,
  Braces,
  Heading1,
  Link2,
  ListTree,
  Network,
  GitBranch,
  ScanText,
  ScanEye,
  Search,
  Sparkles,
  Type,
} from "lucide-react";
import {
  categories,
  toolPath,
  categoryPath,
  type CatalogTool,
} from "./catalog";
import { getTopicMeta, topicStyle } from "./discovery";

const icons: Record<string, typeof Sparkles> = {
  "backlink-verification-tool": Link2,
  "competitor-backlink-gap-analyzer": Network,
  "on-page-ai-seo-analyzer": ScanText,
  "keyword-research-tool": Search,
  "structured-data-validator": Braces,
  "serp-rich-result-preview-generator": Search,
  "entity-sameas-finder": Network,
  "heading-structure-analyzer": ListTree,
  "gsc-striking-distance-finder": Search,
  "indexnow-key-generator": Link2,
  "keyword-cannibalization-finder": Network,
  "sitemap-xml-generator": FileCode2,
  "redirect-rule-generator": GitBranch,
  "og-twitter-preview-generator": ScanEye,
  "hreflang-generator": Link2,
  "core-web-vitals-checker": ListChecks,
  "robots-txt-generator": Bot,
  "llms-txt-generator": FileCode2,
  "ai-citation-readiness-checker": ListChecks,
  "keyword-density-checker": TextSearch,
  "ai-faq-generator": MessageCircleQuestion,
  "seo-content-brief-generator": ClipboardList,
  "meta-title-generator": Type,
  "slug-generator": Link2,
  "schema-markup-generator": Braces,
  "meta-description-generator": AlignLeft,
  "h1-heading-generator": Heading1,
  "article-outline-generator": ListTree,
  "readability-checker": ScanText,
  "image-alt-text-generator": ScanEye,
  "keyword-clustering-tool": Network,
  "topical-map-generator": GitBranch,
  "internal-link-opportunity-finder": Link2,
  "search-intent-checker": Search,
};

export default function ToolCard({
  tool,
  headingLevel = 2,
  homepage = false,
  workspace = false,
  list = false,
}: {
  tool: CatalogTool;
  headingLevel?: 2 | 3;
  homepage?: boolean;
  workspace?: boolean;
  list?: boolean;
}) {
  const Icon = icons[tool.slug] || Sparkles;
  const Heading = headingLevel === 3 ? "h3" : "h2";
  const primaryTopic = tool.topics?.[0] ? getTopicMeta(tool.topics[0]) : null;

  if (list) {
    return (
      <article
        data-tool-slug={tool.slug}
        data-flagship={
          tool.slug === "on-page-ai-seo-analyzer" ? "true" : undefined
        }
        style={workspace && primaryTopic ? topicStyle(primaryTopic) : undefined}
        className={`${workspace ? "workspace-topic-card" : ""} group flex min-w-0 flex-col justify-between gap-4 rounded-2xl border border-slate-200/90 bg-white p-5 shadow-sm transition duration-200 hover:border-[#5271FF]/50 hover:shadow-md dark:border-slate-800 dark:bg-[#161F30] sm:flex-row sm:items-center`}
      >
        <div className="flex min-w-0 flex-1 items-start gap-4">
          <div
            data-topic-icon
            className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl border border-[#5271FF]/20 bg-gradient-to-br from-[#5271FF]/[0.15] to-[#4361EE]/5 text-[#4A6CF7] dark:from-[#5271FF]/25 dark:to-[#4361EE]/10 dark:text-[#93B4FF]"
          >
            <Icon size={22} />
          </div>
          <div className="min-w-0 flex-1">
            <div className="mb-1.5 flex flex-wrap items-center gap-2">
              {primaryTopic && (
                <span
                  className={`rounded-md border px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${primaryTopic.badgeColor}`}
                >
                  {primaryTopic.shortName}
                </span>
              )}
              <span className="rounded-md border border-slate-200 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-slate-500 dark:border-slate-700 dark:text-slate-400">
                {tool.kind}
              </span>
            </div>
            <Heading className="text-lg font-extrabold text-slate-900 dark:text-white">
              <Link
                prefetch={false}
                href={toolPath(tool.slug)}
                className="transition hover:text-[#4A6CF7] dark:hover:text-[#93B4FF]"
              >
                {tool.name}
              </Link>
            </Heading>
            <p className="mt-1.5 text-sm leading-6 text-slate-600 dark:text-slate-300">
              {tool.description}
            </p>
            {tool.tags?.length > 0 && (
              <div className="mt-2.5 flex flex-wrap gap-1.5">
                {tool.tags.slice(0, 3).map((tag) => (
                  <span
                    key={tag}
                    className="rounded-md bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-600 dark:bg-slate-800 dark:text-slate-300"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
        <div className="flex shrink-0 flex-wrap items-center gap-2.5">
          {workspace && <ToolActions id={tool.id} />}
          <Link
            prefetch={false}
            href={toolPath(tool.slug)}
            aria-label={`Open ${tool.name}`}
            className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-gradient-to-r from-[#5271FF] to-[#4361EE] px-4 py-2 text-sm font-bold text-white shadow-sm shadow-[#5271FF]/25 transition hover:opacity-95"
          >
            Open tool <ArrowRight size={16} />
          </Link>
        </div>
      </article>
    );
  }

  return (
    <article
      data-tool-slug={tool.slug}
      data-flagship={
        tool.slug === "on-page-ai-seo-analyzer" ? "true" : undefined
      }
      style={workspace && primaryTopic ? topicStyle(primaryTopic) : undefined}
      className={`${workspace ? "workspace-topic-card" : ""} ${
        homepage ? "home-tool-card" : ""
      } group relative flex h-full flex-col overflow-hidden rounded-[24px] border border-slate-200/90 bg-white p-6 shadow-sm transition duration-200 hover:-translate-y-0.5 hover:border-[#5271FF]/50 hover:shadow-xl hover:shadow-[#5271FF]/[0.07] dark:border-slate-800 dark:bg-[#161F30] dark:hover:border-[#5271FF]/50 sm:p-6`}
    >
      <div
        aria-hidden
        data-topic-stripe
        className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-[#5271FF] via-[#4A6CF7] to-cyan-400 opacity-75 transition group-hover:opacity-100"
      />

      <div className="mb-4 flex items-start justify-between gap-3">
        <div
          data-topic-icon
          className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl border border-[#5271FF]/[0.15] bg-gradient-to-br from-[#5271FF]/[0.15] to-[#4361EE]/5 text-[#4A6CF7] transition group-hover:scale-105 dark:border-[#5271FF]/30 dark:from-[#5271FF]/25 dark:to-[#4361EE]/10 dark:text-[#93B4FF]"
        >
          <Icon aria-hidden className="h-6 w-6" />
        </div>
        <div className="flex flex-wrap items-center justify-end gap-1.5">
          {primaryTopic && (
            <span
              className={`rounded-full border px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider ${primaryTopic.badgeColor}`}
            >
              {primaryTopic.shortName}
            </span>
          )}
          <span className="rounded-full border border-slate-200/90 bg-slate-50 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-600 dark:border-slate-700 dark:bg-slate-800/80 dark:text-slate-300">
            {tool.kind}
          </span>
        </div>
      </div>

      {tool.slug === "on-page-ai-seo-analyzer" && (
        <span className="mb-3 inline-flex w-fit items-center gap-1.5 rounded-full bg-[#5271ff]/10 px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-widest text-[#3959db] dark:text-blue-200">
          <Sparkles size={12} />
          Flagship workspace
        </span>
      )}
      <Heading className="text-xl font-extrabold tracking-tight text-slate-950 dark:text-white">
        <Link
          prefetch={false}
          href={toolPath(tool.slug)}
          className="rounded transition focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-blue-300 group-hover:text-[#4A6CF7] dark:group-hover:text-[#93B4FF]"
        >
          {tool.name}
        </Link>
      </Heading>

      <p className="mt-2.5 flex-1 text-sm leading-6 text-slate-600 dark:text-slate-300">
        {tool.description}
      </p>

      {tool.tags?.length > 0 && (
        <div className="mt-4 flex flex-wrap gap-1.5">
          {tool.tags.slice(0, 3).map((tag) => (
            <span
              key={tag}
              className="rounded-md border border-slate-200/70 bg-slate-50/90 px-2 py-0.5 text-[11px] font-medium text-slate-600 dark:border-slate-700/70 dark:bg-slate-800/70 dark:text-slate-300"
            >
              #{tag}
            </span>
          ))}
        </div>
      )}

      {/* Primary Open Tool Link — kept as direct child of <article> above relatedGuides for smoke-test compatibility */}
      <Link
        data-open-tool
        prefetch={false}
        href={toolPath(tool.slug)}
        className="mt-5 inline-flex min-h-11 w-fit items-center justify-center gap-2.5 rounded-xl border border-[#5271FF]/30 bg-[#5271FF]/[0.08] px-4 py-2.5 text-sm font-bold text-[#4662df] transition hover:border-[#5271FF] hover:bg-[#5271FF] hover:text-white focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-blue-300 dark:border-[#5271FF]/40 dark:bg-[#5271FF]/[0.15] dark:text-[#AEBBFF] dark:hover:bg-[#5271FF] dark:hover:text-white"
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

      {workspace && (
        <div className="mt-3.5">
          <ToolActions id={tool.id} />
        </div>
      )}

      <div className="mt-4 border-t border-slate-100 pt-3.5 dark:border-slate-800">
        <div className="mb-2 flex flex-wrap gap-x-3 gap-y-1.5">
          {tool.categories.map((slug) => (
            <Link
              key={slug}
              href={categoryPath(slug)}
              className="text-[10px] font-bold uppercase tracking-wider text-slate-500 hover:text-[#4662df] dark:text-slate-400 dark:hover:text-[#93B4FF]"
            >
              {categories.find((item) => item.slug === slug)?.name}
            </Link>
          ))}
        </div>
        {(homepage ? tool.relatedGuides.slice(0, 1) : tool.relatedGuides).map(
          (guide) => (
            <Link
              key={guide.path}
              href={guide.path}
              className="inline-flex min-h-8 items-center gap-1.5 text-xs font-semibold text-slate-500 transition hover:text-[#5271FF] dark:text-slate-400 dark:hover:text-[#93B4FF]"
            >
              <BookOpen aria-hidden className="h-3.5 w-3.5 shrink-0" />
              <span>
                Read guide<span className="sr-only">: {guide.title}</span>
              </span>
              <ArrowRight aria-hidden className="h-3 w-3" />
            </Link>
          ),
        )}
      </div>
    </article>
  );
}
