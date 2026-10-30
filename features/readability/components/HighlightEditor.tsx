"use client";
import { forwardRef, useEffect, useLayoutEffect, useImperativeHandle, useMemo, useRef } from "react";
import { EditorContent, Extension, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { Plugin } from "@tiptap/pm/state";
import { Decoration, DecorationSet } from "@tiptap/pm/view";
import { Fragment } from "@tiptap/pm/model";
import { documentPosition, projectDocument, textPosition, type Annotation, type RichDocument } from "../engine";
import { button, issueStyles } from "./styles";
import { replacementEdits, SafeLink } from "./rich-text";
import styles from "./ReadabilityEditor.module.css";

export type EditorHandle = {
  element: HTMLElement | null;
  select: (start: number, end: number) => void;
  reveal: (offset: number) => void;
  replace: (start: number, end: number, replacement: string) => string | null;
  html: () => string;
};
type Props = {
  document: RichDocument;
  analysedText: string;
  annotations: Annotation[];
  activeId: string | null;
  showHighlights: boolean;
  maxLength: number;
  onChange: (doc: RichDocument) => void;
  onSelection: (start: number, end: number) => void;
  onContextIssue: (x: number, y: number, issue: Annotation) => void;
  onNotice: (message: string) => void;
  expanded: boolean;
};

const HighlightEditor = forwardRef<EditorHandle, Props>(function HighlightEditor(props, ref) {
  const latest = useRef(props);
  latest.current = props;
  const scroll = useRef<HTMLDivElement>(null);
  const extension = useMemo(() => Extension.create({
    name: "readabilityHighlights",
    addProseMirrorPlugins() {
      return [new Plugin({
        filterTransaction(tr, state) {
          if (!tr.docChanged) return true;
          const length = projectDocument(tr.doc.toJSON()).text.length;
          if (length <= latest.current.maxLength || length < projectDocument(state.doc.toJSON()).text.length) return true;
          latest.current.onNotice(`Keep the draft within ${latest.current.maxLength.toLocaleString()} characters. Paste a smaller section.`);
          return false;
        },
        props: {
          decorations(state) {
            const current = latest.current;
            const p = projectDocument(state.doc.toJSON());
            if (!current.showHighlights || p.text !== current.analysedText) return DecorationSet.empty;
            return DecorationSet.create(state.doc, current.annotations.map((a) => Decoration.inline(
              documentPosition(p, a.start), documentPosition(p, a.end, "end"),
              { class: `${issueStyles[a.type].mark} ${a.id === current.activeId ? "outline outline-2 outline-[#5271ff]" : ""}`, "data-issue": a.type, "data-from": String(a.start) },
            )));
          },
          handlePaste(_, event) {
            const clipboard = event.clipboardData;
            if ((clipboard?.getData("text/html").length ?? 0) > 1_000_000 || (clipboard?.getData("text/plain").length ?? 0) > 100_000) {
              latest.current.onNotice("That paste is too large. Paste a smaller article section.");
              return true;
            }
            return false;
          },
          transformPastedHTML(html) {
            const doc = new DOMParser().parseFromString(html, "text/html");
            doc.querySelectorAll("script,style,iframe,object,embed,img,video,audio,svg,form,input,button").forEach((node) => node.remove());
            return doc.body.innerHTML;
          },
          handleDOMEvents: {
            contextmenu(view, event) {
              const current = latest.current;
              const p = projectDocument(view.state.doc.toJSON());
              if (!current.showHighlights || p.text !== current.analysedText) return false;
              const hit = event.clientX || event.clientY ? view.posAtCoords({ left: event.clientX, top: event.clientY })?.pos : view.state.selection.from;
              if (hit === undefined) return false;
              const offset = textPosition(p, hit);
              const issue = current.annotations.filter((a) => a.start <= offset && offset < a.end).sort((a, b) => a.end - a.start - (b.end - b.start))[0];
              if (!issue) return false;
              event.preventDefault();
              current.onContextIssue(event.clientX || 24, event.clientY || 160, issue);
              return true;
            },
          },
        },
      })];
    },
  }), []);
  const editor = useEditor({
    immediatelyRender: false,
    extensions: [StarterKit, SafeLink, extension],
    content: props.document,
    editorProps: { attributes: { role: "textbox", "aria-multiline": "true", "aria-label": "Rich text article editor", "data-readability-editor": "true" } },
    onUpdate({ editor }) { latest.current.onChange((editor.getJSON() as RichDocument)); },
    onSelectionUpdate({ editor }) {
      const p = projectDocument((editor.getJSON() as RichDocument));
      latest.current.onSelection(textPosition(p, editor.state.selection.from), textPosition(p, editor.state.selection.to));
    },
  });

  useLayoutEffect(() => {
    if (!editor) return;
    if (JSON.stringify((editor.getJSON() as RichDocument)) !== JSON.stringify(props.document)) {
      const top = scroll.current?.scrollTop ?? 0;
      editor.commands.setContent(props.document, false);
      if (scroll.current) scroll.current.scrollTop = top;
    }
  }, [editor, props.document]);
  useEffect(() => {
    if (editor) editor.view.dispatch(editor.state.tr.setMeta("readability", true).setMeta("addToHistory", false));
  }, [editor, props.analysedText, props.annotations, props.activeId, props.showHighlights]);

  useImperativeHandle(ref, () => ({
    get element() { return editor?.view.dom ?? null; },
    html: () => editor?.getHTML() ?? "",
    select(start, end) {
      if (!editor) return;
      const p = projectDocument((editor.getJSON() as RichDocument));
      editor.commands.setTextSelection({ from: documentPosition(p, start), to: documentPosition(p, end, "end") });
      editor.view.dom.focus({ preventScroll: true });
    },
    reveal(offset) {
      if (!editor || !scroll.current) return;
      const p = projectDocument((editor.getJSON() as RichDocument));
      const coords = editor.view.coordsAtPos(documentPosition(p, offset));
      scroll.current.scrollTo({ top: Math.max(0, scroll.current.scrollTop + coords.top - scroll.current.getBoundingClientRect().top - scroll.current.clientHeight / 2), behavior: "auto" });
    },
    replace(start, end, replacement) {
      if (!editor) return "The editor is still loading. Please try again.";
      const p = projectDocument((editor.getJSON() as RichDocument));
      if (p.text.length - (end - start) + replacement.length > latest.current.maxLength) return "The revision exceeds the draft length limit.";
      const plan = replacementEdits(p, start, end, replacement);
      if (plan.error) return plan.error;
      const top = scroll.current?.scrollTop ?? 0;
      let tr = editor.state.tr;
      for (const edit of [...plan.edits!].reverse()) {
        let marks = editor.state.doc.resolve(edit.from).marks();
        let first = true;
        editor.state.doc.nodesBetween(edit.from, edit.to, (node) => {
          if (!node.isText) return;
          marks = first ? node.marks : marks.filter((mark) => node.marks.some((other) => mark.eq(other)));
          first = false;
        });
        const nodes = edit.text.split("\n").flatMap((line, i) => [
          ...(i ? [editor.schema.nodes.hardBreak.create()] : []),
          ...(line ? [editor.schema.text(line, marks)] : []),
        ]);
        tr = tr.replaceWith(edit.from, edit.to, Fragment.fromArray(nodes));
      }
      editor.view.dispatch(tr);
      editor.view.dom.focus({ preventScroll: true });
      if (scroll.current) scroll.current.scrollTop = top;
      return null;
    },
  }), [editor]);

  return <div className={`${styles.surface} min-w-0 overflow-hidden rounded-2xl border border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-950`}>
    <div role="toolbar" aria-label="Text formatting" className="flex flex-wrap items-center gap-1 border-b border-slate-200 bg-slate-50 p-2 dark:border-slate-700 dark:bg-slate-900">
      <label className="sr-only" htmlFor="readability-block">Block style</label>
      <select id="readability-block" aria-label="Block style" className="min-h-10 max-w-full rounded-lg border border-slate-300 bg-white px-2 text-xs dark:border-slate-700 dark:bg-slate-950"
        value={editor?.isActive("heading") ? String(editor.getAttributes("heading").level) : "paragraph"}
        onChange={(e) => e.target.value === "paragraph" ? editor?.chain().focus().setParagraph().run() : editor?.chain().focus().toggleHeading({ level: Number(e.target.value) as 1 | 2 | 3 | 4 | 5 | 6 }).run()}>
        <option value="paragraph">Paragraph</option><option value="1">Heading 1</option><option value="2">Heading 2</option><option value="3">Heading 3</option><option value="4">Heading 4</option><option value="5">Heading 5</option><option value="6">Heading 6</option>
      </select>
      {[
        ["Bold", "bold", () => editor?.chain().focus().toggleBold().run()],
        ["Italic", "italic", () => editor?.chain().focus().toggleItalic().run()],
        ["Bullet list", "bulletList", () => editor?.chain().focus().toggleBulletList().run()],
        ["Numbered list", "orderedList", () => editor?.chain().focus().toggleOrderedList().run()],
        ["Quote", "blockquote", () => editor?.chain().focus().toggleBlockquote().run()],
      ].map(([label, name, action]) => <button key={label as string} type="button" aria-pressed={editor?.isActive(name as string) ?? false}
        disabled={!editor} className={`${button} !min-h-10 !px-2 !py-1 aria-pressed:bg-blue-100 dark:aria-pressed:bg-blue-950`}
        onMouseDown={(e) => e.preventDefault()} onClick={() => (action as () => void)()}>{label as string}</button>)}
      <button type="button" disabled={!editor?.can().undo()} className={`${button} !min-h-10 !px-2 !py-1`} onClick={() => editor?.chain().focus().undo().run()}>Undo typing</button>
      <button type="button" disabled={!editor?.can().redo()} className={`${button} !min-h-10 !px-2 !py-1`} onClick={() => editor?.chain().focus().redo().run()}>Redo</button>
    </div>
    <div ref={scroll} data-readability-scroll style={{ minHeight: "min(500px, 68dvh)" }} className={`overflow-y-auto overscroll-contain ${props.expanded ? "max-h-[78dvh]" : "max-h-[68dvh]"}`}>
      <EditorContent editor={editor} />
    </div>
    {!projectDocument(props.document).text && <p className="px-5 pb-4 text-sm text-slate-500">Paste your article here. Headings, lists, quotes, bold, italic, and links are kept.</p>}
  </div>;
});
export default HighlightEditor;
