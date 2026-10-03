import Link from "next/link";
import ToolCard from "./ToolCard";
import { featuredTools } from "./catalog";
export default function HomeTools() {
  return (
    <section
      aria-labelledby="home-tools-title"
      className="bg-slate-50 py-14 dark:bg-[#171C28]"
    >
      <div className="container">
        <div className="mb-7 flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="mb-2 text-sm font-semibold text-primary dark:text-blue-200">
              Built to help you do the work
            </p>
            <h2
              id="home-tools-title"
              className="text-3xl font-bold text-slate-900 dark:text-white"
            >
              Featured tools
            </h2>
          </div>
          <Link
            href="/tools"
            className="rounded-lg bg-primary px-5 py-3 font-semibold text-white"
          >
            Browse all tools →
          </Link>
        </div>
        <div className="grid gap-5 md:grid-cols-3">
          {featuredTools.slice(0, 3).map((tool) => (
            <ToolCard key={tool.id} tool={tool} headingLevel={3} />
          ))}
        </div>
      </div>
    </section>
  );
}
