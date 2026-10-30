"use client";
import { Sparkles } from "lucide-react";
import type { Revisions } from "../hooks/useRevisions";
import { field, MAX_AI_CHARS, MIN_AI_CHARS, primary } from "./styles";

export type AiTarget = {
  start: number;
  end: number;
  length: number;
  snippet: string;
  fromSelection: boolean;
  valid: boolean;
};

export default function AiControls({
  rev,
  target,
  onGenerate,
}: {
  rev: Revisions;
  target: AiTarget;
  onGenerate: () => void;
}) {
  return (
    <section aria-labelledby="readability-ai-title" aria-busy={rev.busy} className="space-y-4">
      <div className="flex items-center gap-2">
        <Sparkles aria-hidden className="h-5 w-5 text-[#4662df] dark:text-blue-300" />
        <h2 id="readability-ai-title" className="text-sm font-black uppercase tracking-widest text-slate-500 dark:text-slate-400">
          AI editing partner
        </h2>
      </div>
      <p className="text-xs leading-6 text-slate-500 dark:text-slate-400">
        Select a passage in the editor, or click a hard sentence and choose
        rewrite. You get three revisions to compare. Nothing changes until you
        replace the passage yourself.
      </p>

      <div className="rounded-xl bg-slate-50 p-4 text-xs leading-6 dark:bg-slate-950" data-readability-target>
        <p className="font-black">
          {target.fromSelection ? "Selected passage" : "Whole text"}: {target.length.toLocaleString()} characters
        </p>
        {target.length > 0 && (
          <p className="mt-1 text-slate-500 dark:text-slate-400">
            {target.snippet}
          </p>
        )}
        {!target.valid && (
          <p className="mt-2 font-bold text-amber-700 dark:text-amber-300">
            Select between {MIN_AI_CHARS} and {MAX_AI_CHARS.toLocaleString()} characters.
          </p>
        )}
      </div>

      <label className="block text-xs font-bold">
        Intended reader
        <input
          name="audience"
          className={`${field} !mt-1 !py-2`}
          maxLength={250}
          value={rev.audience}
          onChange={(e) => rev.setAudience(e.target.value)}
        />
      </label>
      <label className="block text-xs font-bold">
        Terms to preserve
        <input
          name="terms"
          className={`${field} !mt-1 !py-2`}
          maxLength={600}
          value={rev.terms}
          placeholder="Names or terms, separated by commas"
          onChange={(e) => rev.setTerms(e.target.value)}
        />
      </label>
      <label className="block text-xs font-bold">
        Tone
        <select
          name="tone"
          className={`${field} !mt-1 !py-2`}
          value={rev.tone}
          onChange={(e) => rev.setTone(e.target.value as typeof rev.tone)}
        >
          {["clear", "professional", "friendly"].map((t) => (
            <option key={t}>{t}</option>
          ))}
        </select>
      </label>
      <label className="flex items-start gap-3 rounded-xl bg-slate-50 p-3 text-xs dark:bg-slate-950">
        <input
          type="checkbox"
          name="splitParagraphs"
          checked={rev.splitParagraphs}
          onChange={(e) => rev.setSplitParagraphs(e.target.checked)}
          className="mt-1 h-4 w-4 accent-[#5271ff]"
        />
        <span>
          <strong className="block">Split dense paragraphs</strong>
          <span className="mt-1 block leading-5 text-slate-500 dark:text-slate-400">
            Group related sentences. Turn off to keep existing paragraph breaks.
          </span>
        </span>
      </label>

      <button
        type="button"
        data-readability-generate
        className={`${primary} w-full`}
        disabled={rev.busy || !target.valid}
        onClick={onGenerate}
      >
        <Sparkles aria-hidden className="h-4 w-4" />
        {rev.busy ? "Preparing revisions..." : "Compare AI revisions"}
      </button>
      {rev.result && (
        <p className="text-xs leading-6 text-slate-500 dark:text-slate-400">
          Generating again replaces the previous revisions and their edits.
        </p>
      )}
      {rev.error && (
        <p role="alert" className="rounded-xl bg-red-50 p-4 text-sm text-red-800 dark:bg-red-950 dark:text-red-200">
          {rev.error}
        </p>
      )}
      <p role="status" className="text-xs font-bold text-[#4662df] dark:text-blue-300">
        {rev.busy ? "Working on three revisions. This may take up to a minute." : rev.status}
      </p>
    </section>
  );
}
