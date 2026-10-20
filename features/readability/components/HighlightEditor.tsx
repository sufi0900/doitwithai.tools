"use client";
import {
  forwardRef,
  useImperativeHandle,
  useLayoutEffect,
  useMemo,
  useRef,
  type ReactNode,
} from "react";
import type { Annotation } from "../engine";
import { editorText, issueStyles } from "./styles";

export type EditorHandle = {
  textarea: HTMLTextAreaElement | null;
  /** Scrolls the page so the highlight that starts at this offset is visible. */
  reveal: (offset: number) => void;
};

type Props = {
  text: string;
  /** The text the annotations were computed from. It can lag `text` while typing. */
  analysedText: string;
  annotations: Annotation[];
  activeId: string | null;
  showHighlights: boolean;
  maxLength: number;
  placeholder: string;
  onChange: (value: string) => void;
  onSelection: (start: number, end: number) => void;
};

const isSentence = (a: Annotation) => a.type === "hard" || a.type === "veryHard";

/**
 * A real textarea sits above a mirrored layer that draws the highlights.
 * Both share the same box model, so the colors line up with the text.
 */
const HighlightEditor = forwardRef<EditorHandle, Props>(
  function HighlightEditor(
    {
      text,
      analysedText,
      annotations,
      activeId,
      showHighlights,
      maxLength,
      placeholder,
      onChange,
      onSelection,
    },
    ref,
  ) {
    const area = useRef<HTMLTextAreaElement>(null);
    const layerEl = useRef<HTMLDivElement>(null);
    useImperativeHandle(ref, () => ({
      get textarea() {
        return area.current;
      },
      reveal(offset: number) {
        const target = layerEl.current?.querySelector(`[data-from="${offset}"]`);
        const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
        (target as HTMLElement | null)?.scrollIntoView({
          block: "center",
          behavior: reduce ? "auto" : "smooth",
        });
      },
    }));

    useLayoutEffect(() => {
      const el = area.current;
      if (!el) return;
      el.style.height = "auto";
      el.style.height = `${Math.max(el.scrollHeight, 360)}px`;
    }, [text]);

    const layer = useMemo<ReactNode[]>(() => {
      if (!showHighlights || !annotations.length) return [analysedText];
      const sentences = annotations.filter(isSentence);
      const inline = annotations.filter((a) => !isSentence(a));
      const cuts = new Set<number>([0, analysedText.length]);
      for (const a of annotations) {
        cuts.add(a.start);
        cuts.add(a.end);
      }
      const points = Array.from(cuts).sort((x, y) => x - y);
      const nodes: ReactNode[] = [];
      let si = 0;
      let ii = 0;
      for (let i = 0; i < points.length - 1; i++) {
        const from = points[i];
        const to = points[i + 1];
        while (si < sentences.length && sentences[si].end <= from) si++;
        while (ii < inline.length && inline[ii].end <= from) ii++;
        const s = sentences[si] && sentences[si].start <= from ? sentences[si] : null;
        const n = inline[ii] && inline[ii].start <= from ? inline[ii] : null;
        const slice = analysedText.slice(from, to);
        if (!s && !n) {
          nodes.push(slice);
          continue;
        }
        const active = (s && s.id === activeId) || (n && n.id === activeId);
        nodes.push(
          <span
            key={from}
            data-from={from}
            data-issue={(n || s)!.type}
            className={`${s ? issueStyles[s.type].mark : ""} ${n ? issueStyles[n.type].mark : ""} ${active ? "outline outline-2 outline-[#5271ff]" : ""}`}
          >
            {slice}
          </span>,
        );
      }
      return nodes;
    }, [analysedText, annotations, activeId, showHighlights]);

    const sync = (el: HTMLTextAreaElement) =>
      onSelection(el.selectionStart, el.selectionEnd);

    return (
      <div className="relative overflow-hidden rounded-2xl border border-slate-200 bg-white focus-within:border-[#5271ff] focus-within:ring-4 focus-within:ring-blue-100 dark:border-slate-700 dark:bg-slate-950 dark:focus-within:ring-blue-900">
        <div
          ref={layerEl}
          aria-hidden="true"
          data-readability-highlight
          className={`${editorText} pointer-events-none absolute inset-0 overflow-hidden text-transparent`}
        >
          {layer}
          {"\n"}
        </div>
        <textarea
          ref={area}
          name="text"
          aria-label="Text to review"
          spellCheck
          value={text}
          maxLength={maxLength}
          placeholder={placeholder}
          onChange={(e) => {
            onChange(e.target.value);
            sync(e.target);
          }}
          onSelect={(e) => sync(e.currentTarget)}
          onClick={(e) => sync(e.currentTarget)}
          onKeyUp={(e) => sync(e.currentTarget)}
          className={`${editorText} relative min-h-[360px] resize-none overflow-hidden bg-transparent text-slate-900 caret-[#5271ff] outline-none placeholder:text-slate-400 dark:text-slate-100`}
        />
      </div>
    );
  },
);

export default HighlightEditor;
