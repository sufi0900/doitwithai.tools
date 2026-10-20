import {
  AlertTriangle,
  CheckCircle2,
  Copy,
  Globe,
  ListChecks,
  RefreshCw,
  Tags,
} from "lucide-react";

const STEPS = [
  {
    icon: Tags,
    title: "Add each language or region version of this page",
    body: "For every version ; en-US, ar-AE, fr, and so on ; add its code and the full, absolute URL it lives at. Use the quick-add buttons for common codes, then fill in the URL.",
  },
  {
    icon: Globe,
    title: "Add x-default",
    body: "x-default is the fallback shown to a visitor whose language or region doesn't match any version you've listed ; usually your language-selector page or your main international page.",
  },
  {
    icon: ListChecks,
    title: "Review the checklist",
    body: "It flags duplicate codes, invalid code formats, non-absolute URLs, and a missing x-default before you ever publish anything.",
  },
  {
    icon: Copy,
    title: "Copy the exact same block onto every listed page",
    body: "This is the part people get wrong most often: the identical set of hreflang tags ; including a self-referencing entry ; needs to go on every single page listed, not just the first one.",
  },
  {
    icon: RefreshCw,
    title: "Validate after publishing",
    body: "Switch to \"Check a live page,\" paste one of the published URLs, and confirm the tags are actually live and match what you intended.",
  },
];

const PRACTICES = [
  {
    title: "Make every version self-referencing",
    body: "Each page's hreflang block should include an entry pointing at itself, not just at the other versions.",
  },
  {
    title: "Use absolute URLs only",
    body: "Relative paths are not valid in hreflang ; always use the full https:// URL.",
  },
  {
    title: "One code, one URL",
    body: "A language/region code should point to exactly one page. If two codes point to the same URL, that's usually a mistake.",
  },
  {
    title: "Keep canonical tags self-referencing too",
    body: "Each language version should canonicalize to itself, not to a different language version ; otherwise the canonical signal can override the hreflang signal.",
  },
];

const MISTAKES = [
  "One-way links ; Page A references Page B, but Page B doesn't reference Page A back.",
  "Made-up or swapped-case codes ; hreflang codes are lowercase language, uppercase region (en-US, not EN-us or en-us).",
  "Pointing hreflang at a page that then redirects ; the target URL should resolve directly, not through a chain of redirects.",
];

export default function HreflangTutorial() {
  return (
    <section className="border-t border-slate-200 bg-slate-50 py-20 dark:border-slate-800 dark:bg-slate-900/40">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <p className="text-xs font-extrabold uppercase tracking-[0.17em] text-[#5271ff]">
            Step-by-step
          </p>
          <h2 className="mt-3 text-3xl font-black tracking-tight text-slate-950 dark:text-white sm:text-4xl">
            How to use the Hreflang Tag Generator
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-sm leading-7 text-slate-600 dark:text-slate-300">
            Five steps from a single-language page to a correctly cross-linked, reciprocal set of
            language and region versions.
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
              Hreflang best practices
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
