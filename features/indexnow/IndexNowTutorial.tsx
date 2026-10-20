import {
  AlertTriangle,
  CheckCircle2,
  Download,
  Key,
  ListOrdered,
  RefreshCw,
  Send,
  ShieldCheck,
} from "lucide-react";

const STEPS = [
  {
    icon: Key,
    title: "Enter your domain and generate a key",
    body: "Type the exact host your pages use, such as www.example.com, then click Generate. The tool creates a random 32-character key in your browser. You can also paste an existing key if you already have one.",
  },
  {
    icon: Download,
    title: "Download the key file and upload it to your site root",
    body: "Download the .txt file ; its name is your key and it contains only the key. Place it at the root of your site so it opens at https://your-domain/your-key.txt. On a Next.js site, that means putting the file in the public folder and deploying.",
  },
  {
    icon: ShieldCheck,
    title: "Check that the key file is live",
    body: "Click \"Check key file\" after deploying. The tool requests the file and confirms its contents match your key. Fix any redirect, 404, or HTML response before submitting, because search engines use the same file to confirm you own the site.",
  },
  {
    icon: ListOrdered,
    title: "List the URLs that were added, updated, or removed",
    body: "Paste one URL per line. The tool checks that each one is valid and on the same host as your key, removes duplicates, and flags anything that would be rejected.",
  },
  {
    icon: Send,
    title: "Submit to IndexNow",
    body: "Click Submit. A 200 or 202 response means IndexNow received your URLs. A 202 simply means key validation is still pending. Prefer your own scripts? \"Copy as cURL\" gives you the same request to run yourself.",
  },
  {
    icon: RefreshCw,
    title: "Repeat whenever content changes",
    body: "Submit again when you publish, substantially update, or delete a page. Check your server logs or the webmaster tools of participating search engines to see that their crawlers are visiting.",
  },
];

const PRACTICES = [
  {
    title: "Submit only URLs that actually changed",
    body: "New pages, meaningful updates, and removed pages are worth sending. Re-sending unchanged URLs repeatedly adds nothing.",
  },
  {
    title: "Keep the key file in place permanently",
    body: "Search engines may re-check it. If you delete it or move it, later submissions can fail with a 403.",
  },
  {
    title: "Use your canonical https:// URLs",
    body: "Submit the version of each URL you want indexed, matching your canonical tags and sitemap.",
  },
  {
    title: "Report deleted pages too",
    body: "Removed pages that now return 404 or 410 can be submitted so engines can drop them sooner.",
  },
  {
    title: "Automate it once it works",
    body: "After a manual test succeeds, send the same request from your publishing workflow so every new post is announced automatically.",
  },
];

const MISTAKES = [
  "Putting the key file in a subfolder or behind a redirect, so the URL search engines request doesn't return the key.",
  "Submitting URLs from a different host ; www.example.com and example.com are separate hosts and can't be mixed in one request.",
  "Expecting guaranteed indexing or a ranking boost. IndexNow is a change notification; each search engine still decides what to crawl and index.",
];

export default function IndexNowTutorial() {
  return (
    <section className="border-t border-slate-200 bg-slate-50 py-20 dark:border-slate-800 dark:bg-slate-900/40">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <p className="text-xs font-extrabold uppercase tracking-[0.17em] text-[#5271ff]">
            Step-by-step
          </p>
          <h2 className="mt-3 text-3xl font-black tracking-tight text-slate-950 dark:text-white sm:text-4xl">
            How to set up IndexNow and submit URLs with this tool
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-sm leading-7 text-slate-600 dark:text-slate-300">
            Six steps from generating a key to notifying search engines about your latest changes.
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
              <RefreshCw className="h-5 w-5 text-[#4662df] dark:text-blue-300" />
              IndexNow best practices
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
