import { AlertTriangle, ListChecks, ShieldAlert } from "lucide-react";

export default function CitationReadinessEducation() {
  return (
    <section className="border-t border-slate-200 bg-white py-20 dark:border-slate-800 dark:bg-slate-950">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <p className="text-xs font-extrabold uppercase tracking-[0.17em] text-[#5271ff]">
            Before you trust the score
          </p>
          <h2 className="mt-3 text-3xl font-black tracking-tight text-slate-950 dark:text-white sm:text-4xl">
            What this checker actually measures
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-sm leading-7 text-slate-600 dark:text-slate-300">
            No outside party publishes how ChatGPT, Perplexity, or Google AI
            Overviews actually pick what to cite. This tool does not call any of
            them. It checks structural patterns that widely-cited pages tend to
            share; clear headings, direct answers, evidence, and structured
            data; and shows the results of each check so you can see exactly
            why.
          </p>
        </div>

        <div className="mt-10 grid gap-4 sm:grid-cols-3">
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5 dark:border-slate-800 dark:bg-slate-900">
            <ListChecks className="h-6 w-6 text-[#4662df] dark:text-blue-300" />
            <p className="mt-3 text-sm font-bold text-slate-950 dark:text-white">
              12 explainable checks
            </p>
            <p className="mt-1.5 text-xs leading-6 text-slate-600 dark:text-slate-300">
              Every point in the score traces back to a check you can review.
            </p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5 dark:border-slate-800 dark:bg-slate-900">
            <ShieldAlert className="h-6 w-6 text-[#4662df] dark:text-blue-300" />
            <p className="mt-3 text-sm font-bold text-slate-950 dark:text-white">
              Reviewable page checks
            </p>
            <p className="mt-1.5 text-xs leading-6 text-slate-600 dark:text-slate-300">
              Analyze a public page or paste a draft, then review the suggested
              improvements.
            </p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5 dark:border-slate-800 dark:bg-slate-900">
            <AlertTriangle className="h-6 w-6 text-[#4662df] dark:text-blue-300" />
            <p className="mt-3 text-sm font-bold text-slate-950 dark:text-white">
              Not a citation guarantee
            </p>
            <p className="mt-1.5 text-xs leading-6 text-slate-600 dark:text-slate-300">
              A high score means your structure follows good practice; it does
              not promise a mention in any AI answer.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
