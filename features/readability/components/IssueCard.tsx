"use client";
import { Sparkles, Wand2 } from "lucide-react";
import type { Annotation, SentenceInfo } from "../engine";
import { button, issueStyles, MAX_AI_CHARS, MIN_AI_CHARS } from "./styles";

type Props = {
  issues: Annotation[];
  text: string;
  sentences: SentenceInfo[];
  onFix: (issue: Annotation) => void;
  onRewrite: (start: number, end: number) => void;
};

/** Explains the highlight under the caret and offers a one-click fix. */
export default function IssueCard({ issues, text, sentences, onFix, onRewrite }: Props) {
  if (!issues.length)
    return (
      <p className="rounded-xl bg-slate-50 px-4 py-3 text-xs leading-6 text-slate-500 dark:bg-slate-950 dark:text-slate-400" role="status">
        Click any highlighted text to see why it is marked and how to fix it.
      </p>
    );
  return (
    <div className="space-y-3" role="status" aria-live="polite" data-readability-issue-card>
      {issues.map((issue) => {
        const s = issueStyles[issue.type];
        const sentence = sentences[issue.sentenceIndex];
        const rewriteLength = sentence ? sentence.end - sentence.start : 0;
        const canRewrite =
          sentence &&
          rewriteLength >= MIN_AI_CHARS &&
          rewriteLength <= MAX_AI_CHARS &&
          issue.replacement === undefined;
        const original = text.slice(issue.start, issue.end);
        return (
          <div key={issue.id} className={`rounded-xl border p-4 ${s.row}`}>
            <p className="text-xs font-black uppercase tracking-wider">
              {s.label}
              <span className="ml-2 font-medium normal-case tracking-normal opacity-80">
                {original.length > 60 ? `${original.slice(0, 57)}...` : original}
              </span>
            </p>
            <p className="mt-2 text-sm leading-6">{issue.message}</p>
            <div className="mt-3 flex flex-wrap gap-2">
              {issue.replacement !== undefined && (
                <button type="button" className={`${button} bg-white/70 dark:bg-black/20`} onClick={() => onFix(issue)}>
                  <Wand2 aria-hidden className="h-4 w-4" />
                  {issue.replacement === null ? "Remove it" : `Use "${issue.replacement}"`}
                </button>
              )}
              {canRewrite && (
                <button
                  type="button"
                  className={`${button} bg-white/70 dark:bg-black/20`}
                  onClick={() => onRewrite(sentence.start, sentence.end)}
                >
                  <Sparkles aria-hidden className="h-4 w-4" />
                  Rewrite this sentence with AI
                </button>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
