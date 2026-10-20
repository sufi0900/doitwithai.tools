import { Code2, Eye, ShieldAlert } from "lucide-react";

export default function SerpPreviewEducation() {
  return (
    <section className="border-t border-slate-200 bg-white py-20 dark:border-slate-800 dark:bg-slate-950">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <p className="text-xs font-extrabold uppercase tracking-[0.17em] text-[#5271ff]">
            Before you trust the preview
          </p>
          <h2 className="mt-3 text-3xl font-black tracking-tight text-slate-950 dark:text-white sm:text-4xl">
            What this preview can and can't promise
          </h2>
        </div>

        <p className="mt-6 text-sm leading-7 text-slate-600 dark:text-slate-300">
          Check the <a className="text-[#5271ff] underline" href="https://developers.google.com/search/docs/appearance/structured-data/sd-policies">Google structured data guidelines</a> before publishing.
          Our cards illustrate data fields, including older formats. They do not certify eligibility for a current Google Search feature.
        </p>
        <div className="mt-10 grid gap-4 sm:grid-cols-3">
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5 dark:border-slate-800 dark:bg-slate-900">
            <Eye className="h-6 w-6 text-[#4662df] dark:text-blue-300" />
            <p className="mt-3 text-sm font-bold text-slate-950 dark:text-white">Google doesn't always use your title</p>
            <p className="mt-1.5 text-xs leading-6 text-slate-600 dark:text-slate-300">
              Google sometimes rewrites the displayed title or description based on the query, even
              when valid meta tags are present. This preview shows what you're providing, not a
              guarantee it's what gets shown.
            </p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5 dark:border-slate-800 dark:bg-slate-900">
            <Code2 className="h-6 w-6 text-[#4662df] dark:text-blue-300" />
            <p className="mt-3 text-sm font-bold text-slate-950 dark:text-white">Valid markup ≠ guaranteed rich result</p>
            <p className="mt-1.5 text-xs leading-6 text-slate-600 dark:text-slate-300">
              Technically valid JSON-LD is necessary but not sufficient. Google applies its own
              content-quality and eligibility criteria per rich result type, and can choose not to
              show one even for perfectly valid markup.
            </p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5 dark:border-slate-800 dark:bg-slate-900">
            <ShieldAlert className="h-6 w-6 text-[#4662df] dark:text-blue-300" />
            <p className="mt-3 text-sm font-bold text-slate-950 dark:text-white">Markup must match visible content</p>
            <p className="mt-1.5 text-xs leading-6 text-slate-600 dark:text-slate-300">
              FAQ and Review markup is only meant for Q&As and reviews an ordinary visitor can
              actually see on the page. Markup for content that isn't genuinely present is a
              structured-data policy violation, not just a wasted effort.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
