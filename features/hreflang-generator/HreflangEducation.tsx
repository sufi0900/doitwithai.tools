import { ArrowLeftRight, Globe2, ShieldAlert } from "lucide-react";

export default function HreflangEducation() {
  return (
    <section className="border-t border-slate-200 bg-white py-20 dark:border-slate-800 dark:bg-slate-950">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <p className="text-xs font-extrabold uppercase tracking-[0.17em] text-[#5271ff]">
            Before you publish
          </p>
          <h2 className="mt-3 text-3xl font-black tracking-tight text-slate-950 dark:text-white sm:text-4xl">
            Why hreflang implementations usually break
          </h2>
        </div>

        <div className="mt-10 grid gap-4 sm:grid-cols-3">
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5 dark:border-slate-800 dark:bg-slate-900">
            <ArrowLeftRight className="h-6 w-6 text-[#4662df] dark:text-blue-300" />
            <p className="mt-3 text-sm font-bold text-slate-950 dark:text-white">Reciprocity is mandatory</p>
            <p className="mt-1.5 text-xs leading-6 text-slate-600 dark:text-slate-300">
              If your English page links to your Arabic page, the Arabic page must link back ; to
              the English page and to itself. A one-way link is commonly ignored entirely. This
              tool's output is the same block for every version by design, so reciprocity isn't
              something you have to remember separately.
            </p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5 dark:border-slate-800 dark:bg-slate-900">
            <Globe2 className="h-6 w-6 text-[#4662df] dark:text-blue-300" />
            <p className="mt-3 text-sm font-bold text-slate-950 dark:text-white">Codes are language-first, region-optional</p>
            <p className="mt-1.5 text-xs leading-6 text-slate-600 dark:text-slate-300">
              A region code narrows a language, it doesn't replace it. "ar-AE" (Arabic, UAE) is
              valid; "AE" alone is not. When in doubt, a bare language code like "en" or "ar" is
              safer than guessing a region code.
            </p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5 dark:border-slate-800 dark:bg-slate-900">
            <ShieldAlert className="h-6 w-6 text-[#4662df] dark:text-blue-300" />
            <p className="mt-3 text-sm font-bold text-slate-950 dark:text-white">Canonical tags can cancel hreflang out</p>
            <p className="mt-1.5 text-xs leading-6 text-slate-600 dark:text-slate-300">
              Each language/region version should be self-canonical ; canonical to itself, not to
              the English version. A canonical pointing at a different language page tells search
              engines to treat that version as a duplicate, not an alternate.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
