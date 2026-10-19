import { AlertTriangle, Bot, ShieldAlert } from "lucide-react";

export default function RobotsEducation() {
  return (
    <section className="border-t border-slate-200 bg-white py-20 dark:border-slate-800 dark:bg-slate-950">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <p className="text-xs font-extrabold uppercase tracking-[0.17em] text-[#5271ff]">
            Before you publish
          </p>
          <h2 className="mt-3 text-3xl font-black tracking-tight text-slate-950 dark:text-white sm:text-4xl">
            What robots.txt can and can't do
          </h2>
        </div>

        <div className="mt-10 grid gap-4 sm:grid-cols-3">
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5 dark:border-slate-800 dark:bg-slate-900">
            <ShieldAlert className="h-6 w-6 text-[#4662df] dark:text-blue-300" />
            <p className="mt-3 text-sm font-bold text-slate-950 dark:text-white">
              It's a request, not a lock
            </p>
            <p className="mt-1.5 text-xs leading-6 text-slate-600 dark:text-slate-300">
              robots.txt only works because well-behaved crawlers choose to
              honor it. It is not authentication and does not hide or protect a
              URL; use a login or server rules for that.
            </p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5 dark:border-slate-800 dark:bg-slate-900">
            <Bot className="h-6 w-6 text-[#4662df] dark:text-blue-300" />
            <p className="mt-3 text-sm font-bold text-slate-950 dark:text-white">
              Training ≠ search ≠ chat fetch
            </p>
            <p className="mt-1.5 text-xs leading-6 text-slate-600 dark:text-slate-300">
              Most AI labs run separate crawlers for model training, for their
              own answer engine's index, and for fetching a page a user
              explicitly asked about. Blocking one doesn't block the others; the
              matrix above lists them separately.
            </p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5 dark:border-slate-800 dark:bg-slate-900">
            <AlertTriangle className="h-6 w-6 text-[#4662df] dark:text-blue-300" />
            <p className="mt-3 text-sm font-bold text-slate-950 dark:text-white">
              User-fetch bots may ignore this file
            </p>
            <p className="mt-1.5 text-xs leading-6 text-slate-600 dark:text-slate-300">
              Several vendors document that a bot fetching a page because a
              person asked about it (ChatGPT-User, Perplexity-User, and similar)
              may not consult robots.txt at all, since the request wasn't
              autonomous crawling.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
