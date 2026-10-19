import { BookOpen, FileCode2, Map, ShieldAlert } from "lucide-react";

const comparisons = [
  {
    icon: ShieldAlert,
    file: "robots.txt",
    role: "Tells crawlers where they may and may not go.",
  },
  {
    icon: Map,
    file: "sitemap.xml",
    role: "Lists every URL that exists, for discovery and indexing.",
  },
  {
    icon: FileCode2,
    file: "llms.txt",
    role: "Curates the pages worth an AI model's limited context; a short, human-written index, not a full crawl list.",
  },
];

export default function LlmsTxtEducation() {
  return (
    <section className="border-t border-slate-200 bg-white py-20 dark:border-slate-800 dark:bg-slate-950">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <p className="text-xs font-extrabold uppercase tracking-[0.17em] text-[#5271ff]">
            Before you publish
          </p>
          <h2 className="mt-3 text-3xl font-black tracking-tight text-slate-950 dark:text-white sm:text-4xl">
            What llms.txt actually does
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-sm leading-7 text-slate-600 dark:text-slate-300">
            llms.txt is a proposed convention (llmstxt.org), not a web standard.
            No major AI search engine has documented that it uses the file to
            decide what to cite. Treat it as a cheap, reviewable signal
            alongside real content quality and structured data; not a
            replacement for either.
          </p>
        </div>

        <div className="mt-10 grid gap-4 sm:grid-cols-3">
          {comparisons.map((item) => {
            const Icon = item.icon;
            return (
              <div
                key={item.file}
                className="rounded-2xl border border-slate-200 bg-slate-50 p-5 dark:border-slate-800 dark:bg-slate-900"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#5271ff]/10 text-[#4662df] dark:text-blue-300">
                  <Icon className="h-5 w-5" />
                </div>
                <p className="mt-4 font-mono text-sm font-bold text-slate-950 dark:text-white">
                  {item.file}
                </p>
                <p className="mt-1.5 text-xs leading-6 text-slate-600 dark:text-slate-300">
                  {item.role}
                </p>
              </div>
            );
          })}
        </div>

        <div className="mt-10 flex items-start gap-3 rounded-2xl border border-blue-200 bg-blue-50 p-5 text-sm leading-7 text-slate-700 dark:border-blue-900/50 dark:bg-blue-950/30 dark:text-slate-300">
          <BookOpen className="mt-0.5 h-5 w-5 shrink-0 text-[#4662df] dark:text-blue-300" />
          <p>
            Keep{" "}
            <code className="rounded bg-white px-1.5 py-0.5 font-mono text-xs dark:bg-slate-900">
              llms.txt
            </code>{" "}
            short; 10 to 20 of your highest-value pages with honest, specific
            one-line descriptions. If you maintain extensive documentation, list
            the rest in a separate{" "}
            <code className="rounded bg-white px-1.5 py-0.5 font-mono text-xs dark:bg-slate-900">
              llms-full.txt
            </code>{" "}
            instead of inflating this file.
          </p>
        </div>
      </div>
    </section>
  );
}
