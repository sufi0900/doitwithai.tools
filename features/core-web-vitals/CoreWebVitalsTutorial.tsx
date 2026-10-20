import {
  AlertTriangle,
  CheckCircle2,
  Gauge,
  ListChecks,
  Smartphone,
  TrendingDown,
} from "lucide-react";

const STEPS = [
  {
    icon: Gauge,
    title: "Paste the exact URL you care about",
    body: "Core Web Vitals are measured per URL, not per site. Check the specific page ; a product page, a landing page ; not just your homepage.",
  },
  {
    icon: Smartphone,
    title: "Check mobile first",
    body: "Mobile is the default because most real traffic and most ranking evaluation happens there. Run desktop afterward for comparison, not instead of it.",
  },
  {
    icon: ListChecks,
    title: "Read field data before lab data",
    body: "If field data is present, that's the number that reflects real visitors and what Search Console reports on. Treat lab data as a debugging detail, not the headline.",
  },
  {
    icon: TrendingDown,
    title: "Fix the worst-rated metric first",
    body: "A page with one \"Poor\" metric and two \"Good\" ones usually gets more benefit from fixing the one weak spot than from marginally improving metrics that already pass.",
  },
  {
    icon: AlertTriangle,
    title: "Re-check after deploying a fix",
    body: "Lab data updates immediately. Field data can take time to reflect a fix, since it's a rolling 28-day window of real visitor data ; don't expect the field numbers to move the same day.",
  },
];

const PRACTICES = [
  {
    title: "Optimize images for LCP",
    body: "The largest content element ; usually a hero image ; is almost always the biggest lever for Largest Contentful Paint.",
  },
  {
    title: "Reserve space for images and embeds",
    body: "Set explicit width/height (or aspect-ratio) on images and ads so they don't shift layout after loading ; the main driver of Cumulative Layout Shift.",
  },
  {
    title: "Break up long JavaScript tasks",
    body: "Interaction to Next Paint suffers most from long-running scripts blocking the main thread when someone taps or clicks.",
  },
  {
    title: "Track trends, not single runs",
    body: "A single lab score can swing between runs. Check back over days or weeks, and prioritize field data, which already averages real usage.",
  },
];

const MISTAKES = [
  "Optimizing only the homepage ; Core Web Vitals is evaluated per URL, and your highest-traffic landing pages matter more for rankings.",
  "Chasing a perfect lab score while ignoring field data ; a 100 lab score with poor field data means the lab test doesn't reflect real conditions for real visitors.",
  "Re-checking seconds after a deploy and expecting field data to already reflect it ; give the CrUX dataset time to update.",
];

export default function CoreWebVitalsTutorial() {
  return (
    <section className="border-t border-slate-200 bg-slate-50 py-20 dark:border-slate-800 dark:bg-slate-900/40">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <p className="text-xs font-extrabold uppercase tracking-[0.17em] text-[#5271ff]">
            Step-by-step
          </p>
          <h2 className="mt-3 text-3xl font-black tracking-tight text-slate-950 dark:text-white sm:text-4xl">
            How to use the Core Web Vitals Checker
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-sm leading-7 text-slate-600 dark:text-slate-300">
            Five steps from pasting a URL to knowing exactly what to fix first.
          </p>
        </div>

        <ol className="mt-10 space-y-4">
          {STEPS.map((step, index) => {
            const Icon = step.icon;
            return (
              <li
                key={step.title}
                className="flex gap-4 rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-950"
              >
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#5271ff]/10 text-[#4662df] dark:text-blue-300">
                  <Icon className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-sm font-extrabold text-slate-950 dark:text-white">
                    <span className="mr-2 text-[#5271ff]">{index + 1}.</span>
                    {step.title}
                  </h3>
                  <p className="mt-1.5 text-sm leading-7 text-slate-600 dark:text-slate-300">{step.body}</p>
                </div>
              </li>
            );
          })}
        </ol>

        <div className="mt-14 grid gap-8 md:grid-cols-2">
          <div>
            <h3 className="flex items-center gap-2 text-xl font-black text-slate-950 dark:text-white">
              <CheckCircle2 className="h-5 w-5 text-[#4662df] dark:text-blue-300" />
              Core Web Vitals best practices
            </h3>
            <ul className="mt-4 space-y-3">
              {PRACTICES.map((practice) => (
                <li key={practice.title} className="flex gap-2.5 text-sm leading-7 text-slate-600 dark:text-slate-300">
                  <CheckCircle2 className="mt-1 h-4 w-4 shrink-0 text-emerald-500" />
                  <span>
                    <span className="font-bold text-slate-900 dark:text-white">{practice.title}.</span> {practice.body}
                  </span>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="flex items-center gap-2 text-xl font-black text-slate-950 dark:text-white">
              <AlertTriangle className="h-5 w-5 text-amber-500" />
              Common mistakes to avoid
            </h3>
            <ul className="mt-4 space-y-3">
              {MISTAKES.map((mistake) => (
                <li key={mistake} className="flex gap-2.5 text-sm leading-7 text-slate-600 dark:text-slate-300">
                  <AlertTriangle className="mt-1 h-4 w-4 shrink-0 text-amber-500" />
                  <span>{mistake}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
