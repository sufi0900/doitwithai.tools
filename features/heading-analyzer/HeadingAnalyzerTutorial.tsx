import {
  AlertTriangle,
  CheckCircle2,
  ClipboardPaste,
  Hammer,
  ListTree,
  RefreshCw,
  SlidersHorizontal,
  Target,
} from "lucide-react";

const STEPS = [
  {
    icon: ClipboardPaste,
    title: "Enter your website or article URL",
    body: "Enter a public page address and select Analyze headings. For unpublished drafts, use Paste content with HTML or Markdown.",
  },
  {
    icon: SlidersHorizontal,
    title: "Choose what to analyze",
    body: "Leave \"Analyze main content only\" on to check just the article or <main> area, so navigation, footer, and sidebar headings don't distract you. Turn it off to audit the entire page.",
  },
  {
    icon: ListTree,
    title: "Read the outline top to bottom",
    body: "The tool lists every heading in order, indented by level, with a count per level. It should read like a clean table of contents: one main topic, then sections, then sub-points.",
  },
  {
    icon: Target,
    title: "Optionally add a target phrase",
    body: "Enter the topic you want the page to cover. The tool shows whether it appears in the H1 and how many headings use it, and warns if it is repeated in most of them.",
  },
  {
    icon: Hammer,
    title: "Fix errors first, then warnings",
    body: "Errors are things like a missing H1 or empty headings. Warnings include skipped levels, repeated or generic headings, and hidden headings. Each issue lists the exact headings affected.",
  },
  {
    icon: RefreshCw,
    title: "Export and re-check after editing",
    body: "Copy the outline as Markdown or download the CSV report to share with a writer or developer. After editing, check the page again. URL reports may reuse results for up to five minutes.",
  },
];

const PRACTICES = [
  {
    title: "Give the page one clear H1",
    body: "It should state the page's main topic in plain words, and be the first heading readers meet.",
  },
  {
    title: "Nest headings in order",
    body: "Follow H1 with H2 sections, and use H3 only inside an H2. Don't jump from H2 straight to H4.",
  },
  {
    title: "Describe each section specifically",
    body: "A reader scanning only the headings should understand what each section answers.",
  },
  {
    title: "Use headings for structure, not looks",
    body: "If you want bigger or bolder text, change the style with CSS rather than choosing a heading level.",
  },
  {
    title: "Work keywords in where they fit",
    body: "Name a topic in a heading when the section is really about it, and vary the wording across sections.",
  },
];

const MISTAKES = [
  "Picking heading levels by font size, which creates skipped levels and a confusing outline.",
  "Copying the same heading, such as \"Overview\" or \"Tips\", into several sections.",
  "Repeating the exact keyword in nearly every heading, which reads as forced to people and adds little for search.",
];

export default function HeadingAnalyzerTutorial() {
  return (
    <section className="border-t border-slate-200 bg-slate-50 py-20 dark:border-slate-800 dark:bg-slate-900/40">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <p className="text-xs font-extrabold uppercase tracking-[0.17em] text-[#5271ff]">
            Step-by-step
          </p>
          <h2 className="mt-3 text-3xl font-black tracking-tight text-slate-950 dark:text-white sm:text-4xl">
            How to check your heading structure with this tool
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-sm leading-7 text-slate-600 dark:text-slate-300">
            Six steps from entering a URL to reviewing a clear heading outline.
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
              Heading structure best practices
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
