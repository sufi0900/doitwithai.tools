import {
  AlertTriangle,
  CheckCircle2,
  ClipboardPaste,
  Globe,
  LayoutList,
  Type,
} from "lucide-react";

const STEPS = [
  {
    icon: Globe,
    title: "Import from a live URL, or start from scratch",
    body: 'Paste a published page\'s URL and click "Import from URL" to pull in its current title, description, and any JSON-LD schema it already has. or skip this and fill in the fields yourself.',
  },
  {
    icon: Type,
    title: "Compare mobile and desktop",
    body: "Compare title wrapping and description clipping in both device presets. Review pixel measurements rather than judging length from character counts alone.",
  },
  {
    icon: ClipboardPaste,
    title: "Review imported structured data",
    body: 'Paste the exact contents of a <script type="application/ld+json"> block. your own, or the output straight from the Schema Markup Generator. to see which rich result types it would render.',
  },
  {
    icon: LayoutList,
    title: "Compare against what's actually on the page",
    body: "For FAQ, Review, and HowTo markup especially, confirm every piece of marked-up content is something a visitor can actually see and read on the live page. not just present in the schema.",
  },
  {
    icon: CheckCircle2,
    title: "Validate with Google's own tools before relying on it",
    body: "Once published, run the URL through Google's Rich Results Test or URL Inspection tool. the final word on eligibility is Google's, not any preview tool's.",
  },
];

const PRACTICES = [
  {
    title: "Keep titles unique per page",
    body: "Duplicate titles across pages make it harder for Google to pick the one you intend. and harder for searchers to tell your pages apart in results.",
  },
  {
    title: "Write descriptions that earn the click",
    body: "Treat the description as ad copy for your own content. specific and useful beats generic and keyword-stuffed.",
  },
  {
    title: "Only mark up visible content",
    body: "FAQ and Review rich results should mirror exactly what a visitor sees on the page. not expanded, invented, or third-party content.",
  },
  {
    title: "Re-test after every schema change",
    body: "A small edit to JSON-LD can silently break a rich result's eligibility. Re-check here, then re-validate with Google's Rich Results Test.",
  },
];

const MISTAKES = [
  "Assuming valid JSON-LD guarantees the rich result will actually show in search. eligibility also depends on Google's content-quality and policy checks.",
  "Marking up FAQ or Review content that doesn't appear anywhere on the visible page.",
  "Forgetting to re-validate with Google's own Rich Results Test after publishing. this tool is a preview, not the final authority.",
];

export default function SerpPreviewTutorial() {
  return (
    <section className="border-t border-slate-200 bg-slate-50 py-20 dark:border-slate-800 dark:bg-slate-900/40">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <p className="text-xs font-extrabold uppercase tracking-[0.17em] text-[#5271ff]">
            Step-by-step
          </p>
          <h2 className="mt-3 text-3xl font-black tracking-tight text-slate-950 dark:text-white sm:text-4xl">
            How to use the SERP & Rich Result Preview
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-sm leading-7 text-slate-600 dark:text-slate-300">
            Five steps from a URL or a blank form to a reviewed,
            checklist-passed preview.
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
                  <p className="mt-1.5 text-sm leading-7 text-slate-600 dark:text-slate-300">
                    {step.body}
                  </p>
                </div>
              </li>
            );
          })}
        </ol>

        <div className="mt-14 grid gap-8 md:grid-cols-2">
          <div>
            <h3 className="flex items-center gap-2 text-xl font-black text-slate-950 dark:text-white">
              <CheckCircle2 className="h-5 w-5 text-[#4662df] dark:text-blue-300" />
              SERP & rich result best practices
            </h3>
            <ul className="mt-4 space-y-3">
              {PRACTICES.map((practice) => (
                <li
                  key={practice.title}
                  className="flex gap-2.5 text-sm leading-7 text-slate-600 dark:text-slate-300"
                >
                  <CheckCircle2 className="mt-1 h-4 w-4 shrink-0 text-emerald-500" />
                  <span>
                    <span className="font-bold text-slate-900 dark:text-white">
                      {practice.title}.
                    </span>{" "}
                    {practice.body}
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
                <li
                  key={mistake}
                  className="flex gap-2.5 text-sm leading-7 text-slate-600 dark:text-slate-300"
                >
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
