import Link from "next/link";
import { ToolActions } from "../tools-workspace/ToolActions";
import { ArrowRight } from "lucide-react";
import { toolPath, type CatalogTool } from "./catalog";
import { getTopicMeta } from "./discovery";
import { PlatformBrandIcon } from "../tool-ui/PlatformBrandIcon";

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
  const Heading = headingLevel === 3 ? "h3" : "h2";
  const primaryTopic = tool.topics?.[0] ? getTopicMeta(tool.topics[0]) : null;
  const disciplineLabel = primaryTopic?.shortName || tool.kind;

  if (list) {
    return (
      <article
        data-tool-slug={tool.slug}
        className={`${workspace ? "workspace-topic-card" : ""} group relative grid min-w-0 grid-cols-[minmax(0,1fr)_auto] items-center gap-3 px-4 py-2.5 transition hover:bg-slate-50/90 dark:hover:bg-slate-800/40 sm:grid-cols-[minmax(0,1fr)_160px_100px] sm:gap-4`}
      >
        <div className="flex min-w-0 items-center gap-3">
          <div
            data-topic-icon
            className="grid h-7 w-7 shrink-0 place-items-center rounded-md border border-slate-200/80 bg-slate-50 dark:border-slate-700/80 dark:bg-slate-800/80"
          >
            <PlatformBrandIcon slug={tool.slug} size={17} />
          </div>
          <div className="min-w-0 flex-1">
            <Heading className="truncate text-sm font-semibold text-slate-900 dark:text-slate-100">
              <Link
                prefetch={false}
                href={toolPath(tool.slug)}
                className="rounded transition after:absolute after:inset-0 group-hover:text-[#4A6CF7] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#5271FF] dark:group-hover:text-[#93B4FF]"
              >
                {tool.name}
              </Link>
            </Heading>
            <p className="truncate text-xs text-slate-500 dark:text-slate-400">
              {tool.description}
            </p>
          </div>
        </div>
        <span className="hidden truncate text-xs font-medium text-slate-500 dark:text-slate-400 sm:block">
          {disciplineLabel}
        </span>
        <div className="flex shrink-0 items-center justify-end gap-2">
          {workspace && (
            <div className="relative z-10 shrink-0">
              <ToolActions id={tool.id} compact />
            </div>
          )}
          <span
            data-open-tool
            className="inline-flex items-center gap-1 text-xs font-semibold text-slate-500 transition group-hover:text-[#4A6CF7] dark:text-slate-400 dark:group-hover:text-[#93B4FF]"
          >
            Open
            <ArrowRight
              aria-hidden
              className="h-3.5 w-3.5 transition group-hover:translate-x-0.5 motion-reduce:transform-none"
            />
          </span>
        </div>
      </article>
    );
  }

  return (
    <article
      data-tool-slug={tool.slug}
      className={`${workspace ? "workspace-topic-card" : ""} ${
        homepage ? "home-tool-card" : ""
      } group relative flex h-full flex-col rounded-xl border border-slate-200 bg-white p-4 transition hover:border-slate-300 hover:shadow-sm dark:border-slate-800 dark:bg-slate-900 dark:hover:border-slate-700`}
    >
      <div className="flex items-start justify-between gap-2.5">
        <div className="flex min-w-0 flex-1 items-start gap-3">
          <div
            data-topic-icon
            className="grid h-8 w-8 shrink-0 place-items-center rounded-lg border border-slate-200/80 bg-slate-50 dark:border-slate-700/80 dark:bg-slate-800/80"
          >
            <PlatformBrandIcon slug={tool.slug} size={20} />
          </div>
          <Heading className="min-w-0 flex-1 text-sm font-semibold leading-snug text-slate-900 dark:text-slate-100">
            <Link
              prefetch={false}
              href={toolPath(tool.slug)}
              className="rounded transition after:absolute after:inset-0 group-hover:text-[#4A6CF7] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#5271FF] dark:group-hover:text-[#93B4FF]"
            >
              {tool.name}
            </Link>
          </Heading>
        </div>
        {workspace && (
          <div className="relative z-10 shrink-0">
            <ToolActions id={tool.id} compact />
          </div>
        )}
      </div>

      <p className="mt-2.5 flex-1 line-clamp-2 text-xs leading-5 text-slate-600 dark:text-slate-400">
        {tool.description}
      </p>

      <div className="mt-3.5 flex items-center justify-between gap-2 border-t border-slate-100 pt-2.5 text-xs dark:border-slate-800/80">
        <span className="truncate font-medium text-slate-500 dark:text-slate-400">
          {disciplineLabel}
        </span>
        <span
          data-open-tool
          className="inline-flex shrink-0 items-center gap-1 font-semibold text-slate-500 transition group-hover:text-[#4A6CF7] dark:text-slate-400 dark:group-hover:text-[#93B4FF]"
        >
          Open
          <ArrowRight
            aria-hidden
            className="h-3.5 w-3.5 transition group-hover:translate-x-0.5 motion-reduce:transform-none"
          />
        </span>
      </div>
    </article>
  );
}
