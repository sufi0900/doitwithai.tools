import {
  AlertTriangle,
  CheckCircle2,
  Download,
  Globe,
  Image as ImageIcon,
  RefreshCw,
  Ruler,
  ScanEye,
  Type,
} from "lucide-react";

const STEPS = [
  {
    icon: Globe,
    title: "Paste your page URL and import existing tags",
    body: "Start with the live URL. Click \"Import existing tags\" and the tool pulls in whatever Open Graph and Twitter tags the page already has ; you're editing a real starting point instead of guessing from a blank form.",
  },
  {
    icon: Type,
    title: "Write a clear title and description",
    body: "Keep the title under about 70 characters and the description under about 200. Write for the person deciding whether to click, not for a crawler ; the character counters update as you type.",
  },
  {
    icon: Ruler,
    title: "Add your image and check its real dimensions",
    body: "Paste the image URL, then click \"Check dimensions.\" The tool reads the image's own file header and reports its actual pixel size, so you confirm it's at least 1200×630px before you publish ; not after a platform silently drops the preview.",
  },
  {
    icon: ScanEye,
    title: "Compare both live previews",
    body: "Look at the Facebook/LinkedIn card and the X/Twitter card side by side. They crop, truncate, and lay out differently ; a title that looks fine on one can get cut off on the other.",
  },
  {
    icon: Download,
    title: "Copy the generated tags into your site's <head>",
    body: "Copy the output block and paste it into your page template, CMS field, or hand it to whoever manages your theme. Every tag is generated from the values you just reviewed, so nothing is guessed.",
  },
  {
    icon: RefreshCw,
    title: "Re-scrape with the platform's own debugger",
    body: "After publishing, force a fresh scrape with Facebook's Sharing Debugger, X's Card Validator, or LinkedIn's Post Inspector. Platforms cache cards, so a link shared before your update can keep showing the old preview until you trigger a re-scrape.",
  },
];

const PRACTICES = [
  {
    title: "Use a 1.91:1 image ratio",
    body: "1200×630px is the standard size for summary_large_image cards. A near-square image gets cropped on most platforms.",
  },
  {
    title: "Keep titles under ~70 characters",
    body: "Longer titles get truncated, usually mid-word, on Facebook, LinkedIn, and X alike.",
  },
  {
    title: "Lead your description with the point",
    body: "Descriptions get cut off around 200 characters ; put the most important sentence first, not last.",
  },
  {
    title: "Set both og:* and twitter:* tags",
    body: "X/Twitter reads twitter:* tags first and only falls back to Open Graph when they're missing. Setting both removes the guesswork.",
  },
  {
    title: "Use one canonical og:url per page",
    body: "If the same content is reachable through multiple URLs (tracking parameters, trailing slashes), point og:url at the one you want engagement credited to.",
  },
];

const MISTAKES = [
  "Leaving og:image empty ; most platforms show no preview at all, not a text-only fallback.",
  "Using a relative image path (/images/cover.jpg) instead of a full https:// URL that crawlers outside your site can actually resolve.",
  "Assuming an updated page immediately shows an updated card ; re-scrape the URL with the platform's own debugger first.",
];

export default function OgPreviewTutorial() {
  return (
    <section className="border-t border-slate-200 bg-slate-50 py-20 dark:border-slate-800 dark:bg-slate-900/40">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <p className="text-xs font-extrabold uppercase tracking-[0.17em] text-[#5271ff]">
            Step-by-step
          </p>
          <h2 className="mt-3 text-3xl font-black tracking-tight text-slate-950 dark:text-white sm:text-4xl">
            How to use the OG & Twitter Card Preview Generator
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-sm leading-7 text-slate-600 dark:text-slate-300">
            Six steps from a blank form to a published, verified card ; using the tool above.
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
              <ImageIcon className="h-5 w-5 text-[#4662df] dark:text-blue-300" />
              Open Graph & Twitter Card best practices
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
