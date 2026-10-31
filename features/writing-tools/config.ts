import type { WritingInput, WritingKind } from "./schema";
export const inputClass =
  "w-full rounded-xl border border-slate-200 bg-white px-3.5 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-[#5271ff] focus:ring-4 focus:ring-[#5271ff]/10 disabled:opacity-60 dark:border-slate-700 dark:bg-slate-950 dark:text-white";
export const panelClass =
  "overflow-hidden rounded-[30px] border border-slate-200 bg-white shadow-[0_28px_80px_-36px_rgba(15,23,42,0.48)] dark:border-slate-800 dark:bg-slate-900";
export const primaryButton =
  "inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-[#4662df] px-5 py-3 text-sm font-extrabold text-white shadow-lg shadow-[#5271ff]/20 transition hover:bg-[#425fe4] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-blue-300 disabled:cursor-wait disabled:opacity-60";
export const secondaryButton =
  "inline-flex min-h-10 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs font-bold text-slate-600 transition hover:border-[#5271ff]/40 hover:text-[#5271ff] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#5271ff]/20 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300";
export const emptyBrief: WritingInput = {
  brief: "",
  keyword: "",
  audience: "",
  pageTitle: "",
  tone: "clear",
  pageType: "guide",
  intent: "informational",
  currentText: "",
  uniqueValue: "",
  brand: "",
};
export const sampleBrief: WritingInput = {
  brief:
    "A practical guide for content marketers who want to write accurate meta titles with AI. The guide explains the role of title tags, keyword placement, illustrative search previews, and human review. It includes prompts, worked examples, and a checklist for checking unsupported claims before publishing.",
  keyword: "meta titles with AI",
  audience: "Content marketers and website owners",
  pageTitle: "How to Write Meta Titles with AI",
  tone: "clear",
  pageType: "guide",
  intent: "informational",
  currentText: "",
  uniqueValue:
    "Worked examples, reusable prompts, and a human review checklist.",
  brand: "Do It With AI Tools",
};
export const strategies: Record<WritingKind, string[]> = {
  "meta-description": ["Clear summary", "Reader benefit", "Next step"],
  "h1-heading": ["Topic first", "Task first", "Audience first"],
};
export const strategyHints: Record<string, string> = {
  "Clear summary":
    "Explain what the page contains, without headline repetition.",
  "Reader benefit": "Make the page's supported value easy to understand.",
  "Next step": "Invite an action that genuinely fits the page.",
  "Topic first": "Name the main subject directly.",
  "Task first": "Start with the task the page helps readers complete.",
  "Audience first":
    "Make the reader's situation clear without narrowing it unnecessarily.",
};
