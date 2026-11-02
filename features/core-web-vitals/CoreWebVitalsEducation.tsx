import { Database, FlaskConical, Gauge } from "lucide-react";

export default function CoreWebVitalsEducation() {
  return (
    <section className="border-t border-slate-200 bg-white py-20 dark:border-slate-800 dark:bg-slate-950">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <p className="text-xs font-extrabold uppercase tracking-[0.17em] text-[#5271ff]">
            Before you act on a score
          </p>
          <h2 className="mt-3 text-3xl font-black tracking-tight text-slate-950 dark:text-white sm:text-4xl">
            Field data vs. lab data
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-sm leading-7 text-slate-600 dark:text-slate-300">
            Compare real visitor measurements with a simulated Lighthouse test.
            Use field data to understand user experience and lab results to investigate specific improvements.
          </p>
        </div>

        <div className="mt-10 grid gap-4 sm:grid-cols-3">
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5 dark:border-slate-800 dark:bg-slate-900">
            <Database className="h-6 w-6 text-[#4662df] dark:text-blue-300" />
            <p className="mt-3 text-sm font-bold text-slate-950 dark:text-white">Field data is what Google ranks on</p>
            <p className="mt-1.5 text-xs leading-6 text-slate-600 dark:text-slate-300">
              Field data comes from the Chrome User Experience Report ; real visitors, real devices,
              real networks, over the past 28 days. It's what Search Console's Core Web Vitals
              report is built from.
            </p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5 dark:border-slate-800 dark:bg-slate-900">
            <FlaskConical className="h-6 w-6 text-[#4662df] dark:text-blue-300" />
            <p className="mt-3 text-sm font-bold text-slate-950 dark:text-white">Lab data is one simulated run</p>
            <p className="mt-1.5 text-xs leading-6 text-slate-600 dark:text-slate-300">
              Lab data is a single Lighthouse test under controlled, simulated network conditions.
              It's useful for debugging a specific page, but it can vary noticeably between runs and
              doesn't reflect your real traffic.
            </p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5 dark:border-slate-800 dark:bg-slate-900">
            <Gauge className="h-6 w-6 text-[#4662df] dark:text-blue-300" />
            <p className="mt-3 text-sm font-bold text-slate-950 dark:text-white">New or low-traffic pages have no field data</p>
            <p className="mt-1.5 text-xs leading-6 text-slate-600 dark:text-slate-300">
              Google needs a minimum amount of real Chrome traffic before it publishes field data
              for a URL. A brand-new page will often show lab data only ; that's expected, not a bug.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
