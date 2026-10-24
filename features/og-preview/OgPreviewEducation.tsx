import { Clock, ImageIcon, RefreshCw } from "lucide-react";

export default function OgPreviewEducation() {
  return (
    <section className="border-t border-slate-200 bg-white py-20 dark:border-slate-800 dark:bg-slate-950">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <p className="text-xs font-extrabold uppercase tracking-[0.17em] text-[#5271ff]">
            Before you publish
          </p>
          <h2 className="mt-3 text-3xl font-black tracking-tight text-slate-950 dark:text-white sm:text-4xl">
            Why cards look different per platform
          </h2>
        </div>

        <div className="mt-10 grid gap-4 sm:grid-cols-3">
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5 dark:border-slate-800 dark:bg-slate-900">
            <ImageIcon className="h-6 w-6 text-[#4662df] dark:text-blue-300" />
            <p className="mt-3 text-sm font-bold text-slate-950 dark:text-white">Open Graph vs Twitter tags</p>
            <p className="mt-1.5 text-xs leading-6 text-slate-600 dark:text-slate-300">
              X/Twitter reads its own twitter:* tags first and falls back to og:* tags when they're
              missing. This tool sets both, so a card looks intentional everywhere it's shared.
            </p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5 dark:border-slate-800 dark:bg-slate-900">
            <RefreshCw className="h-6 w-6 text-[#4662df] dark:text-blue-300" />
            <p className="mt-3 text-sm font-bold text-slate-950 dark:text-white">Platforms cache cards</p>
            <p className="mt-1.5 text-xs leading-6 text-slate-600 dark:text-slate-300">
              Updating your tags doesn't update a card someone already shared. Use each platform's
              own debugger (Facebook Sharing Debugger, X Card Validator, LinkedIn Post Inspector) to
              force a re-scrape.
            </p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5 dark:border-slate-800 dark:bg-slate-900">
            <Clock className="h-6 w-6 text-[#4662df] dark:text-blue-300" />
            <p className="mt-3 text-sm font-bold text-slate-950 dark:text-white">The preview here is illustrative</p>
            <p className="mt-1.5 text-xs leading-6 text-slate-600 dark:text-slate-300">
              It mirrors each platform's general layout, not pixel-identical rendering ; line
              clamping, cropping, and card width all vary by app version. Treat it as a strong guide,
              then verify with the real debugger before anything high-stakes.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
