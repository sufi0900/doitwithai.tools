"use client";
import {
  useCallback,
  useDeferredValue,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  Copy,
  Download,
  PenLine,
  ScanText,
  Sparkles,
  Undo2,
  Upload,
} from "lucide-react";
import {
  analyzeDocument,
  applyFix,
  formatDuration,
  issueTypes,
  targetPresets,
  type Annotation,
  type IssueType,
} from "./engine";
import AiControls, { type AiTarget } from "./components/AiControls";
import AiResults from "./components/AiResults";
import HighlightEditor, { type EditorHandle } from "./components/HighlightEditor";
import InsightsPanel from "./components/InsightsPanel";
import IssueCard from "./components/IssueCard";
import {
  button,
  card,
  exampleText,
  issueStyles,
  MAX_AI_CHARS,
  MAX_LOCAL_CHARS,
  MIN_AI_CHARS,
} from "./components/styles";
import { clearStoredDraft, useDraft } from "./hooks/useDraft";
import { useRevisions } from "./hooks/useRevisions";

type Mode = "write" | "edit" | "improve";

const modes: Array<{ id: Mode; label: string; icon: typeof PenLine; hint: string }> = [
  { id: "write", label: "Write", icon: PenLine, hint: "A clean page with no highlights" },
  { id: "edit", label: "Edit", icon: ScanText, hint: "Highlights, grade, and fixes" },
  { id: "improve", label: "Improve", icon: Sparkles, hint: "Compare AI revisions" },
];

const allVisible = Object.fromEntries(issueTypes.map((t) => [t, true])) as Record<
  IssueType,
  boolean
>;

export default function ReadabilityClient() {
  const [text, setText] = useState("");
  const [mode, setMode] = useState<Mode>("edit");
  const [target, setTarget] = useState(targetPresets[0].grade);
  const [visible, setVisible] = useState(allVisible);
  const [longThreshold, setLongThreshold] = useState(25);
  const [history, setHistory] = useState<string[]>([]);
  const [selection, setSelection] = useState({ start: 0, end: 0 });
  const [status, setStatus] = useState("");
  const [reviewOpen, setReviewOpen] = useState(false);
  const [context, setContext] = useState<{ x: number; y: number; issue: Annotation } | null>(null);
  const contextDialog = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const dialog = contextDialog.current;
    if (context && dialog && !dialog.open) dialog.showModal();
    if (!context && dialog?.open) dialog.close();
  }, [context]);
  const reviewDialog = useRef<HTMLDialogElement>(null);
  const returnFocus = useRef<HTMLElement | null>(null);
  useEffect(() => {
    const dialog = reviewDialog.current;
    if (reviewOpen && dialog && !dialog.open) {
      returnFocus.current = editor.current?.textarea ?? document.activeElement as HTMLElement | null;
      dialog.showModal();
    }
    if (!reviewOpen && dialog?.open) dialog.close();
  }, [reviewOpen]);
  function closeReview() {
    setReviewOpen(false);
    returnFocus.current?.focus({ preventScroll: true });
  }


  const editor = useRef<EditorHandle>(null);
  const fileInput = useRef<HTMLInputElement>(null);
  const pendingSelection = useRef<[number, number] | null>(null);
  const jumpIndex = useRef<Partial<Record<IssueType, number>>>({});
  const rev = useRevisions();

  const { saved } = useDraft({ text, mode, target: String(target) }, (draft) => {
    setText(draft.text.slice(0, MAX_LOCAL_CHARS));
    if (draft.mode) setMode(draft.mode);
    const grade = Number(draft.target);
    if (targetPresets.some((p) => p.grade === grade)) setTarget(grade);
  });

  const deferredText = useDeferredValue(text);
  const analysis = useMemo(
    () => analyzeDocument(deferredText, { longThreshold, targetGrade: target }),
    [deferredText, longThreshold, target],
  );
  const inSync = deferredText === text;
  const highlights = mode !== "write";
  const shown = useMemo(
    () => analysis.annotations.filter((a) => visible[a.type]),
    [analysis.annotations, visible],
  );

  const hasSelection = selection.end > selection.start;
  const caretIssues = useMemo(() => {
    if (!highlights || !inSync || hasSelection) return [] as Annotation[];
    const pos = selection.start;
    return shown
      .filter((a) => a.start <= pos && pos <= a.end)
      .sort((a, b) => a.end - a.start - (b.end - b.start))
      .slice(0, 2);
  }, [highlights, inSync, hasSelection, selection.start, shown]);
  const activeId = caretIssues[0]?.id ?? null;

  const aiTarget = useMemo<AiTarget>(() => {
    const range = hasSelection
      ? { start: selection.start, end: Math.min(selection.end, text.length) }
      : { start: 0, end: text.length };
    const passage = text.slice(range.start, range.end);
    const length = passage.length;
    return {
      ...range,
      length,
      snippet: passage.length > 140 ? `${passage.slice(0, 137)}...` : passage,
      fromSelection: hasSelection,
      valid: passage.trim().length >= MIN_AI_CHARS && length <= MAX_AI_CHARS,
    };
  }, [hasSelection, selection, text]);

  // Restore the caret or selection after a programmatic change.
  useLayoutEffect(() => {
    const pending = pendingSelection.current;
    const el = editor.current?.textarea;
    if (!pending || !el) return;
    pendingSelection.current = null;
    el.focus({ preventScroll: true });
    el.setSelectionRange(pending[0], pending[1]);
    setSelection({ start: pending[0], end: pending[1] });
  }, [text]);

  const commit = useCallback(
    (next: string, selectionAfter?: [number, number]) => {
      setHistory((h) => [...h.slice(-49), text]);
      pendingSelection.current = selectionAfter ?? null;
      setText(next);
    },
    [text],
  );

  const onSelection = useCallback((start: number, end: number) => {
    setSelection((prev) =>
      prev.start === start && prev.end === end ? prev : { start, end },
    );
  }, []);

  function onType(value: string) {
    setText(value);
  }

  function fix(issue: Annotation) {
    const result = applyFix(text, issue);
    if (!result) return;
    commit(result.text, [result.caret, result.caret]);
    setStatus("Fix applied. Use Undo to restore the previous text.");
  }

  function jump(type: IssueType) {
    const list = analysis.annotations.filter((a) => a.type === type);
    if (!list.length || !inSync) return;
    const after = (jumpIndex.current[type] ?? -1) + 1;
    const index = after < list.length ? after : 0;
    jumpIndex.current[type] = index;
    const a = list[index];
    const el = editor.current?.textarea;
    if (!el) return;
    el.focus({ preventScroll: true });
    el.setSelectionRange(a.start, a.start);
    setSelection({ start: a.start, end: a.start });
    editor.current?.reveal(a.start);
  }

  function undo() {
    setHistory((h) => {
      if (!h.length) return h;
      pendingSelection.current = null;
      setText(h[h.length - 1]);
      setStatus("Previous text restored.");
      return h.slice(0, -1);
    });
  }

  async function copy(value: string) {
    try {
      await navigator.clipboard.writeText(value);
      setStatus("Copied to clipboard.");
    } catch {
      setStatus("Clipboard unavailable. Use Download instead.");
    }
  }

  function download() {
    const url = URL.createObjectURL(new Blob([text], { type: "text/plain;charset=utf-8" }));
    const a = document.createElement("a");
    a.href = url;
    a.download = "draft.txt";
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }

  async function upload(file: File | undefined) {
    if (!file) return;
    if (file.size > 2_000_000) {
      setStatus("That file is too large. Use a text or Markdown file under 2 MB.");
      return;
    }
    const content = await file.text();
    commit(content.slice(0, MAX_LOCAL_CHARS));
    setStatus(
      content.length > MAX_LOCAL_CHARS
        ? `Loaded the first ${MAX_LOCAL_CHARS.toLocaleString()} characters of ${file.name}.`
        : `Loaded ${file.name}.`,
    );
    if (fileInput.current) fileInput.current.value = "";
  }

  async function runAi(range = aiTarget) {
    const passage = text.slice(range.start, range.end);
    setReviewOpen(true);
    await rev.generate(passage, { start: range.start, end: range.end },
      `Write for ${targetPresets.find((p) => p.grade === target)?.label ?? "general readers"}`);
  }

  function rewriteSentence(start: number, end: number) {
    setMode("improve");
    const el = editor.current?.textarea;
    el?.setSelectionRange(start, end);
    setSelection({ start, end });
    void runAi({
      start,
      end,
      length: end - start,
      snippet: "",
      fromSelection: true,
      valid: true,
    });
  }

  function replacePassage(snapshot: string, replacement: string) {
    const current = rev.range;
    const index =
      current && text.slice(current.start, current.end) === snapshot
        ? current.start
        : text.indexOf(snapshot) === text.lastIndexOf(snapshot) ? text.indexOf(snapshot) : -1;
    if (index < 0)
      return "The original passage changed or was removed. Select it again, then compare revisions.";
    const next = text.slice(0, index) + replacement + text.slice(index + snapshot.length);
    if (next.length > MAX_LOCAL_CHARS)
      return `The result would pass the ${MAX_LOCAL_CHARS.toLocaleString()} character limit. Copy the revision instead.`;
    commit(next, [index, index + replacement.length]);
    rev.setRange({ start: index, end: index + replacement.length });
    setReviewOpen(false);
    setStatus("Passage replaced. Your editing position is preserved. Use Undo to restore it.");
    return null;
  }

  const showSidebar = mode !== "write";

  return (
    <div className="text-slate-900 dark:text-white">
      <section className={card} aria-labelledby="readability-input-title">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 id="readability-input-title" className="text-2xl font-black">
              Your text, under a clearer lens
            </h2>
            <p className="mt-1 text-xs leading-6 text-slate-500 dark:text-slate-400">
              Highlights update as you type. Choose a target reader to tailor the editing cues.
            </p>
          </div>
          <div role="group" aria-label="Editor mode" className="inline-flex rounded-xl border border-slate-200 bg-slate-50 p-1 dark:border-slate-700 dark:bg-slate-950">
            {modes.map((m) => {
              const Icon = m.icon;
              return (
                <button
                  key={m.id}
                  type="button"
                  aria-pressed={mode === m.id}
                  title={m.hint}
                  data-readability-mode={m.id}
                  onClick={() => setMode(m.id)}
                  className={`inline-flex min-h-10 items-center gap-2 rounded-lg px-4 text-xs font-bold focus-visible:ring-4 focus-visible:ring-blue-300 ${mode === m.id ? "bg-[#4662df] text-white shadow" : "text-slate-600 hover:text-[#4662df] dark:text-slate-300"}`}
                >
                  <Icon aria-hidden className="h-4 w-4" />
                  {m.label}
                </button>
              );
            })}
          </div>
        </div>

        <div className="sticky top-20 z-20 mt-5 flex flex-wrap items-center gap-2 rounded-xl border border-slate-200 bg-white p-3 shadow-sm dark:border-slate-700 dark:bg-slate-900">
          <button type="button" className={button} onClick={() => commit(exampleText)}>
            Try an example
          </button>
          <button type="button" className={button} onClick={() => fileInput.current?.click()}>
            <Upload aria-hidden className="h-4 w-4" />
            Upload .txt or .md
          </button>
          <input
            ref={fileInput}
            type="file"
            accept=".txt,.md,.markdown,text/plain,text/markdown"
            className="sr-only"
            tabIndex={-1}
            aria-label="Upload a text or Markdown file"
            onChange={(e) => void upload(e.target.files?.[0])}
          />
          <button type="button" className={button} disabled={!text} onClick={() => copy(text)}>
            <Copy aria-hidden className="h-4 w-4" />
            Copy text
          </button>
          <button type="button" className={button} disabled={!text} onClick={download}>
            <Download aria-hidden className="h-4 w-4" />
            Download
          </button>
          <button
            type="button"
            className={button}
            disabled={!text}
            onClick={() => {
              commit("");
              clearStoredDraft();
            }}
          >
            Clear text
          </button>
          <button type="button" className={button} disabled={!history.length} onClick={undo}>
            <Undo2 aria-hidden className="h-4 w-4" />
            Undo change
          </button>
        </div>

        <div className={`mt-6 grid items-start gap-6 ${showSidebar ? "lg:grid-cols-[minmax(0,1fr)_340px]" : ""}`}>
          <div className="min-w-0">
            {highlights && (
              <div className="mb-4 max-h-56 overflow-y-auto">
                <IssueCard
                  issues={caretIssues}
                  text={text}
                  sentences={analysis.sentences}
                  onFix={fix}
                  onRewrite={rewriteSentence}
                />
              </div>
            )}
            {mode === "edit" && hasSelection && aiTarget.valid && (
              <div className="mb-4 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-[#5271ff]/30 bg-[#5271ff]/[0.06] px-4 py-3 text-xs">
                <span className="font-bold">
                  {aiTarget.length.toLocaleString()} characters selected.
                </span>
                <button type="button" className={button} onClick={() => setMode("improve")}>
                  <Sparkles aria-hidden className="h-4 w-4" />
                  Improve this selection with AI
                </button>
              </div>
            )}
            <HighlightEditor
              ref={editor}
              text={text}
              analysedText={deferredText}
              annotations={shown}
              activeId={activeId}
              showHighlights={highlights}
              maxLength={MAX_LOCAL_CHARS}
              placeholder="Paste a section, introduction, email, or article. English prose works best."
              onChange={onType}
              onSelection={onSelection}
              onContextIssue={(x, y, issue) => {
                setSelection({ start: issue.start, end: issue.start });
                setContext({ x: Math.max(8, Math.min(x, window.innerWidth - 304)), y: Math.max(8, Math.min(y, window.innerHeight - 230)), issue });
              }}
            />
            <div className="mt-3 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-500 dark:text-slate-400">
              <span>
                {text.length.toLocaleString()} / {MAX_LOCAL_CHARS.toLocaleString()} characters
                {mode === "write" &&
                  ` · ${analysis.words.toLocaleString()} words · ${formatDuration(analysis.readingSeconds)} to read`}
              </span>
              <span>
                {saved === "saved" && "Draft saved in this browser."}
                {saved === "unavailable" && "Autosave is unavailable in this browser."}
              </span>
            </div>
            {highlights && (
              <ul
                aria-label="Highlight legend"
                className="mt-4 flex flex-wrap gap-x-5 gap-y-2 text-[11px] text-slate-600 dark:text-slate-300"
              >
                {issueTypes.map((t) => (
                  <li key={t} className="inline-flex items-center gap-2">
                    <span aria-hidden className={`h-3 w-3 rounded-sm ${issueStyles[t].swatch}`} />
                    <span className="font-bold">{issueStyles[t].label}</span>
                    <span className="text-slate-400">{issueStyles[t].short}</span>
                  </li>
                ))}
              </ul>
            )}
            <p role="status" className="mt-3 min-h-5 text-xs font-bold text-[#4662df] dark:text-blue-300">
              {status}
            </p>
            <p className="mt-2 text-xs leading-6 text-slate-500 dark:text-slate-400">
              Avoid confidential information. Your draft is saved only in this
              browser, and AI revisions send just the passage you choose.
            </p>
          </div>

          {showSidebar && (
            <aside className="min-w-0 lg:sticky lg:top-44 lg:max-h-[calc(100dvh-12rem)] lg:overflow-y-auto" aria-label={mode === "edit" ? "Readability insights" : "AI revisions"}>
              {mode === "edit" ? (
                <InsightsPanel
                  analysis={analysis}
                  text={deferredText}
                  target={target}
                  onTarget={setTarget}
                  visible={visible}
                  onToggle={(t) => setVisible((v) => ({ ...v, [t]: !v[t] }))}
                  onJump={jump}
                  longThreshold={longThreshold}
                  onThreshold={setLongThreshold}
                />
              ) : (
                <AiControls rev={rev} target={aiTarget} onGenerate={() => void runAi()} />
              )}
            </aside>
          )}
        </div>
      </section>

      <dialog ref={contextDialog} aria-label="Highlighted text actions"
        onCancel={(e) => { e.preventDefault(); setContext(null); }}
        onClose={() => setContext(null)}
        style={{ left: context?.x ?? 8, top: context?.y ?? 8 }}
        className="fixed m-0 w-72 max-w-[calc(100vw-1rem)] max-h-[80dvh] overflow-auto rounded-xl border border-slate-200 bg-white p-4 text-slate-900 shadow-xl backdrop:bg-transparent dark:border-slate-700 dark:bg-slate-900 dark:text-white">
        {context && <>
            <button autoFocus type="button" className={button} onClick={() => setContext(null)}>Close actions</button>
            <p className="mt-3 text-sm">{context.issue.message}</p>
            {context.issue.replacement !== undefined && <button type="button" className={`${button} mt-3`} onClick={() => { fix(context.issue); setContext(null); }}>Apply suggested fix</button>}
            {analysis.sentences[context.issue.sentenceIndex] && <button type="button" className={`${button} mt-3`} disabled={rev.busy} onClick={() => {
              const sentence = analysis.sentences[context.issue.sentenceIndex];
              setContext(null); rewriteSentence(sentence.start, sentence.end);
            }}>Rewrite this sentence with AI</button>}
        </>}
      </dialog>
      {mode === "improve" && rev.result && <button type="button" className={`${button} mt-4`} onClick={() => setReviewOpen(true)}>Open latest revisions</button>}
      <dialog ref={reviewDialog} onCancel={(e) => { e.preventDefault(); closeReview(); }}
        onClose={() => setReviewOpen(false)} aria-labelledby="revision-dialog-title"
        className="fixed inset-0 m-auto max-h-[90dvh] w-[min(1100px,96vw)] max-w-none overflow-y-auto rounded-2xl bg-white p-4 text-slate-900 shadow-2xl backdrop:bg-slate-950/60 dark:bg-slate-900 dark:text-white sm:p-6">
        <div className="sticky top-0 z-10 flex flex-wrap items-center justify-between gap-3 bg-white pb-3 dark:bg-slate-900">
          <h2 id="revision-dialog-title" className="text-xl font-black">Compare passage revisions</h2>
          <button type="button" className={button} onClick={closeReview}>Back to editor</button>
        </div>
        <p role="status" className="mt-3 text-sm">{rev.busy ? "Preparing three revisions. Your editing position is saved." : rev.status}</p>
        {rev.error && <p role="alert" className="mt-3 text-sm text-red-600 dark:text-red-300">{rev.error}</p>}
        {!rev.busy && <AiResults rev={rev} onCopy={copy} onReplace={replacePassage} />}
      </dialog>
    </div>
  );
}
