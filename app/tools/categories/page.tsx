import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, ArrowRightLeft } from "lucide-react";
import {
  categories,
  categoryPath,
  tools,
} from "@/features/tool-catalog/catalog";

export const metadata: Metadata = {
  title: "Tool Categories | Do It With AI Tools",
  description:
    "Browse practical SEO, content writing, and article conversion tools.",
  alternates: { canonical: "https://doitwithai.tools/tools/categories" },
};
export default function CategoriesPage() {
  return (
    <main className="mx-auto max-w-7xl px-4 py-16 text-slate-900 dark:text-white">
      <Link href="/tools" className="text-primary dark:text-blue-200">
        ← All tools
      </Link>
      <h1 className="my-6 text-4xl font-bold">Browse by task</h1>
      <p className="mb-10 text-slate-600 dark:text-slate-300">
        Choose the work you want to do. Available tools and collections in
        preparation are labeled separately.
      </p>
      <div className="grid gap-6 md:grid-cols-2">
        {categories.map((category) => {
          const count = tools.filter((tool) =>
            tool.categories.includes(category.slug),
          ).length;
          const conversion = category.slug === "content-conversion";
          return (
            <article
              key={category.slug}
              className={`rounded-2xl border p-8 ${conversion ? "border-orange-200 bg-orange-50/60 dark:border-orange-300/25 dark:bg-orange-300/[0.04]" : "border-slate-200 dark:border-slate-700"}`}
            >
              {conversion && (
                <div className="mb-5 flex items-center justify-between gap-3">
                  <span className="rounded-xl bg-orange-100 p-3 text-orange-800 dark:bg-orange-300/10 dark:text-orange-200">
                    <ArrowRightLeft size={23} aria-hidden />
                  </span>
                  <span className="rounded-full border border-orange-200 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-orange-800 dark:border-orange-300/20 dark:text-orange-200">
                    {count ? "Available tools" : "In preparation"}
                  </span>
                </div>
              )}
              <h2 className="text-2xl font-bold">
                <Link href={categoryPath(category.slug)}>{category.name}</Link>
              </h2>
              <p className="my-4 leading-7 text-slate-600 dark:text-slate-300">
                {category.description}
              </p>
              <Link
                href={categoryPath(category.slug)}
                className={`inline-flex items-center gap-2 font-semibold ${conversion ? "text-orange-800 dark:text-orange-200" : "text-primary dark:text-blue-200"}`}
              >
                {count
                  ? `Explore ${count} tools`
                  : conversion
                    ? "View the collection plan"
                    : "View planned collection"}
                <ArrowRight size={16} aria-hidden />
              </Link>
            </article>
          );
        })}
      </div>
    </main>
  );
}
