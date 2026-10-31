import React from "react";
import Link from "next/link";
import { tools } from "@/features/tool-catalog/catalog";
import ToolCard from "@/features/tool-catalog/ToolCard";

export default function SeoListingHero() {
  const selected = [
    "on-page-ai-seo-analyzer",
    "search-intent-checker",
    "meta-title-generator",
  ]
    .map((slug) => tools.find((tool) => tool.slug === slug))
    .filter(Boolean);
  const action =
    "inline-flex min-h-11 items-center justify-center rounded-xl px-5 py-3 text-sm font-semibold focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#5271FF]";
  return (
    <section aria-labelledby="ai-seo-heading" className="mb-12 min-w-0">
      <div className="rounded-3xl bg-[#101e43] px-5 py-10 text-white sm:px-10 sm:py-14">
        <p className="text-sm font-semibold text-blue-200">
          LEARN · APPLY · REVIEW
        </p>
        <h1
          id="ai-seo-heading"
          className="mt-4 max-w-3xl text-3xl font-extrabold leading-tight sm:text-5xl"
        >
          AI SEO tools, guides, and prompts
        </h1>
        <p className="mt-5 max-w-2xl text-base leading-8 text-slate-200 sm:text-lg">
          Learn the reasoning, try a practical tool, and adapt a prompt for your
          next content task. Review every suggestion before publishing.
        </p>
        <nav
          aria-label="Explore the SEO hub"
          className="mt-7 flex flex-wrap gap-3"
        >
          <Link
            href="/tools"
            className={action + " bg-[#5271FF] text-white hover:bg-[#405bdc]"}
          >
            Explore SEO tools
          </Link>
          <a
            href="#seo-hub-guides"
            className={action + " border border-blue-200/40 hover:bg-white/10"}
          >
            Read SEO guides
          </a>
          <Link
            href="/prompts"
            className={action + " border border-blue-200/40 hover:bg-white/10"}
          >
            Browse prompts
          </Link>
          <Link
            href="/free-ai-resources"
            className={action + " text-blue-100 underline underline-offset-4"}
          >
            Free AI resources
          </Link>
        </nav>
      </div>
      <section aria-labelledby="seo-hub-tools" className="mt-10">
        <div className="mb-5 flex flex-wrap items-end justify-between gap-4">
          <div>
            <h2
              id="seo-hub-tools"
              className="text-2xl font-bold text-slate-900 dark:text-white"
            >
              Put the guidance into practice
            </h2>
            <p className="mt-2 max-w-2xl text-base leading-7 text-slate-600 dark:text-slate-300">
              Start with a page review, clarify a reader’s intent, or improve a
              title. Choose the tool that matches your task.
            </p>
          </div>
          <Link
            href="/tools"
            className={
              action +
              " border border-slate-300 text-blue-700 dark:border-slate-600 dark:text-blue-200"
            }
          >
            View all tools
          </Link>
        </div>
        <div className="grid min-w-0 gap-5 md:grid-cols-2 xl:grid-cols-3">
          {selected.map((tool) => (
            <ToolCard key={tool.id} tool={tool} headingLevel={3} />
          ))}
        </div>
      </section>
    </section>
  );
}
