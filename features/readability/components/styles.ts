import type { IssueType } from "../engine";

export const card =
  "rounded-3xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900 sm:p-7";
export const field =
  "mt-2 w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm leading-7 text-slate-900 outline-none focus:border-[#5271ff] focus:ring-4 focus:ring-blue-100 dark:border-slate-700 dark:bg-slate-950 dark:text-white dark:focus:ring-blue-900";
export const button =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-lg border border-slate-300 px-3 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 focus-visible:ring-4 focus-visible:ring-blue-200 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50";
export const primary =
  "inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-[#4662df] px-5 py-3 text-sm font-bold text-white hover:bg-[#3b55c9] focus-visible:ring-4 focus-visible:ring-blue-300 disabled:cursor-wait disabled:opacity-60";

/** Shared by the textarea and its highlight layer. They must match exactly. */
export const editorText =
  "m-0 block w-full whitespace-pre-wrap break-words border-0 p-5 font-serif text-[17px] leading-[1.9] tracking-normal sm:p-7 sm:text-lg sm:leading-[1.9]";

export const MAX_LOCAL_CHARS = 30000;
export const MAX_AI_CHARS = 4500;
export const MIN_AI_CHARS = 40;

type IssueStyle = {
  label: string;
  short: string;
  /** Highlight layer classes. Each type also has its own underline style. */
  mark: string;
  /** Sidebar card classes. */
  row: string;
  swatch: string;
  hint: string;
};

export const issueStyles: Record<IssueType, IssueStyle> = {
  veryHard: {
    label: "Very hard to read",
    short: "Red",
    mark: "rounded-sm bg-red-300/60 dark:bg-red-500/35",
    row: "border-red-300 bg-red-50 text-red-950 dark:border-red-800 dark:bg-red-950/50 dark:text-red-100",
    swatch: "bg-red-400",
    hint: "Dense sentences. Split them or cut words.",
  },
  hard: {
    label: "Hard to read",
    short: "Amber",
    mark: "rounded-sm bg-amber-300/60 dark:bg-amber-400/30",
    row: "border-amber-300 bg-amber-50 text-amber-950 dark:border-amber-800 dark:bg-amber-950/40 dark:text-amber-100",
    swatch: "bg-amber-400",
    hint: "Long or heavy sentences. Try a shorter version.",
  },
  passive: {
    label: "Passive voice",
    short: "Green wavy",
    mark: "rounded-sm bg-emerald-200/70 underline decoration-wavy decoration-emerald-600 underline-offset-4 dark:bg-emerald-500/25 dark:decoration-emerald-400",
    row: "border-emerald-300 bg-emerald-50 text-emerald-950 dark:border-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-100",
    swatch: "bg-emerald-400",
    hint: "Name who does the action.",
  },
  adverb: {
    label: "Adverbs",
    short: "Sky dotted",
    mark: "rounded-sm bg-sky-200/70 underline decoration-dotted decoration-2 decoration-sky-600 underline-offset-4 dark:bg-sky-500/25 dark:decoration-sky-400",
    row: "border-sky-300 bg-sky-50 text-sky-950 dark:border-sky-800 dark:bg-sky-950/40 dark:text-sky-100",
    swatch: "bg-sky-400",
    hint: "A stronger verb often works better.",
  },
  weakener: {
    label: "Weakeners",
    short: "Blue dashed",
    mark: "rounded-sm bg-blue-200/70 underline decoration-dashed decoration-2 decoration-[#5271ff] underline-offset-4 dark:bg-blue-500/25 dark:decoration-blue-300",
    row: "border-blue-300 bg-blue-50 text-blue-950 dark:border-blue-800 dark:bg-blue-950/40 dark:text-blue-100",
    swatch: "bg-[#5271ff]",
    hint: "Hedges and filler. Keep those that protect accuracy.",
  },
  simpler: {
    label: "Simpler alternatives",
    short: "Purple solid",
    mark: "rounded-sm bg-violet-200/70 underline decoration-solid decoration-2 decoration-violet-600 underline-offset-4 dark:bg-violet-500/25 dark:decoration-violet-300",
    row: "border-violet-300 bg-violet-50 text-violet-950 dark:border-violet-800 dark:bg-violet-950/40 dark:text-violet-100",
    swatch: "bg-violet-400",
    hint: "Plainer words and phrases.",
  },
};

export const exampleText =
  "Readability is something that you should really think about before you publish any article. In order to make sure that your readers can follow along without getting lost, it is important to note that long and complicated sentences, which tend to wander through several ideas before they finally reach a point that the reader can actually use, are often skipped entirely by people who are scanning a page quickly.\n\nYou can utilize a simpler word instead of a complex one. Adverbs, passive voice, and hedging phrases are marked as well. I think the draft was written quickly, and the mistakes were noticed late.\n\nShort paragraphs help. Clear verbs help more. Fix one highlight at a time, then read the whole text aloud.";
