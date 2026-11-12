"use client";
import React, {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  EditorContent,
  Node,
  NodeViewWrapper,
  ReactNodeViewRenderer,
  Extension,
  useEditor,
} from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { Plugin } from "@tiptap/pm/state";
import { Decoration, DecorationSet } from "@tiptap/pm/view";
import {
  Bold,
  Italic,
  List,
  ListOrdered,
  Undo2,
  Redo2,
  Link2,
  Quote,
  Table2,
  ImageIcon,
} from "lucide-react";
import { SafeLink } from "@/features/readability/components/rich-text";
import { analyzeReadability } from "@/features/readability/analyzer";
import { buildInfographicScene } from "@/lib/blog-infographic-studio/canvas-renderer";
import { projectDocument, safeUrl } from "./model";
import type { Project, RichNode } from "./types";
import styles from "./workspace.module.css";
export type EditorHandle = {
  selection: () => { from: number; to: number; text: string };
  replace: (from: number, to: number, text: string) => void;
  section: (id: string) => void;
  insertVisual: (id: string) => void;
};
const documentKey = (doc: unknown) =>
  JSON.stringify(doc, (key, value) => {
    if (key !== "attrs") return value;
    const attrs = Object.fromEntries(
      Object.entries(value || {}).filter(
        ([k, v]) =>
          v !== null && v !== undefined && !(k === "start" && v === 1),
      ),
    );
    return Object.keys(attrs).length ? attrs : undefined;
  });
type Props = {
  project: Project;
  onChange: (doc: RichNode) => void;
  onEditVisual: (id: string) => void;
  highlights: boolean;
  onSelection: (text: string) => void;
};
const ArticleEditor = forwardRef<EditorHandle, Props>(
  function ArticleEditor(props, ref) {
    const latest = useRef(props);
    latest.current = props;
    const [notice, setNotice] = useState("");
    const extensions = useMemo(() => {
      const table = Node.create({
        name: "table",
        group: "block",
        content: "tableRow+",
        isolating: true,
        parseHTML: () => [{ tag: "table" }],
        renderHTML: () => ["table", {}, ["tbody", 0]],
      });
      const row = Node.create({
        name: "tableRow",
        content: "(tableCell|tableHeader)+",
        parseHTML: () => [{ tag: "tr" }],
        renderHTML: () => ["tr", {}, 0],
      });
      const cell = (name: string, tag: string) =>
        Node.create({
          name,
          content: "block+",
          isolating: true,
          parseHTML: () => [{ tag }],
          renderHTML: () => [tag, {}, 0],
        });
      const headingIDs = Extension.create({
        name: "writerSectionIds",
        addGlobalAttributes() {
          return [
            {
              types: ["heading"],
              attributes: {
                sectionId: {
                  default: null,
                  parseHTML: (el) => el.getAttribute("data-section-id"),
                  renderHTML: (attrs) =>
                    attrs.sectionId
                      ? { "data-section-id": attrs.sectionId }
                      : {},
                },
              },
            },
          ];
        },
      });
      const visual = Node.create({
        name: "sectionVisual",
        group: "block",
        atom: true,
        draggable: true,
        addAttributes: () => ({ sectionId: { default: "" } }),
        parseHTML: () => [],
        renderHTML: ({ HTMLAttributes }) => [
          "figure",
          { "data-section-id": HTMLAttributes.sectionId },
          ["figcaption", {}, "Article section infographic"],
        ],
        addNodeView() {
          return ReactNodeViewRenderer(function SectionImage({
            node,
            editor,
          }: any) {
            const [, redraw] = useState(0);
            useEffect(() => {
              const changed = () => redraw((n) => n + 1);
              editor.on("transaction", changed);
              return () => {
                editor.off("transaction", changed);
              };
            }, [editor]);
            const section = latest.current.project.sections.find(
              (s) => s.id === node.attrs.sectionId,
            );
            const scene = section?.infographicConfig.nodes.length
              ? buildInfographicScene(section.infographicConfig)
              : null;
            return (
              <NodeViewWrapper
                contentEditable={false}
                className={styles.visual}
              >
                <button
                  type="button"
                  onClick={() =>
                    latest.current.onEditVisual(node.attrs.sectionId)
                  }
                  aria-label={`Customize image for ${section?.h2Text || "section"}`}
                >
                  <span className={styles.visualBar}>
                    <ImageIcon size={15} />
                    Section infographic<span>Customize</span>
                  </span>
                  {scene && !scene.issues.length ? (
                    <img
                      src={`data:image/svg+xml;charset=utf-8,${encodeURIComponent(scene.svg)}`}
                      alt={
                        section?.infographicConfig.altText || section?.h2Text
                      }
                    />
                  ) : (
                    <span className={styles.visualEmpty}>
                      Add or refresh the visual from this section’s explanation.
                    </span>
                  )}
                </button>
              </NodeViewWrapper>
            );
          });
        },
      });
      const hints = Extension.create({
        name: "writerReadability",
        addProseMirrorPlugins() {
          return [
            new Plugin({
              filterTransaction(tr, state) {
                if (!tr.docChanged) return true;
                if (
                  tr.doc.textContent.length > 80000 &&
                  tr.doc.textContent.length > state.doc.textContent.length
                ) {
                  setNotice("Use up to 80,000 characters per article.");
                  return false;
                }
                return true;
              },
              props: {
                decorations(state) {
                  if (!latest.current.highlights) return DecorationSet.empty;
                  const list: Decoration[] = [];
                  state.doc.descendants((node, pos) => {
                    if (node.type.name !== "paragraph") return;
                    const text = node.textBetween(
                      0,
                      node.content.size,
                      "\n",
                      "\n",
                    );
                    for (const sentence of analyzeReadability(text)
                      .longSentences) {
                      list.push(
                        Decoration.inline(
                          pos + 1 + sentence.start,
                          pos + 1 + sentence.end,
                          {
                            class: styles.longSentence,
                            title:
                              "Long sentence: consider splitting it for readability",
                          },
                        ),
                      );
                    }
                  });
                  return DecorationSet.create(state.doc, list);
                },
                transformPastedHTML(html) {
                  const doc = new DOMParser().parseFromString(
                    html,
                    "text/html",
                  );
                  doc
                    .querySelectorAll(
                      "script,style,iframe,object,embed,svg,form,input,button,img,video,audio",
                    )
                    .forEach((n) => n.remove());
                  doc.querySelectorAll("*").forEach((el) => {
                    for (const a of [...el.attributes])
                      if (
                        a.name.startsWith("on") ||
                        a.name === "style" ||
                        a.name === "srcdoc" ||
                        (a.name === "href" && !safeUrl(a.value))
                      )
                        el.removeAttribute(a.name);
                  });
                  return doc.body.innerHTML;
                },
              },
            }),
          ];
        },
      });
      return [
        StarterKit.configure({ heading: { levels: [1, 2, 3] } }),
        SafeLink,
        headingIDs,
        table,
        row,
        cell("tableCell", "td"),
        cell("tableHeader", "th"),
        visual,
        hints,
      ];
    }, []);
    const editor = useEditor({
      extensions,
      content: projectDocument(props.project),
      immediatelyRender: false,
      editorProps: {
        attributes: {
          class: styles.paper,
          "aria-label": "Article editor",
          role: "textbox",
          "aria-multiline": "true",
        },
      },
      onUpdate: ({ editor }) =>
        latest.current.onChange(editor.getJSON() as RichNode),
      onSelectionUpdate: ({ editor }) => {
        const { from, to } = editor.state.selection;
        latest.current.onSelection(editor.state.doc.textBetween(from, to, " "));
      },
    });
    useEffect(() => {
      if (!editor) return;
      const desired = projectDocument(props.project);
      if (documentKey(editor.getJSON()) !== documentKey(desired)) {
        const selection = editor.state.selection;
        editor.commands.setContent(desired, false);
        if (selection.from <= editor.state.doc.content.size)
          editor.commands.setTextSelection({
            from: selection.from,
            to: Math.min(selection.to, editor.state.doc.content.size),
          });
      }
      editor.view.dispatch(editor.state.tr.setMeta("writerDisplay", true));
    }, [editor, props.project, props.highlights]);
    useImperativeHandle(
      ref,
      () => ({
        selection: () => {
          if (!editor) return { from: 0, to: 0, text: "" };
          const { from, to } = editor.state.selection;
          return {
            from,
            to,
            text: editor.state.doc.textBetween(from, to, " "),
          };
        },
        replace: (from, to, text) =>
          editor
            ?.chain()
            .focus()
            .insertContentAt(
              { from, to },
              text
                .split("\n")
                .flatMap((t, i) => [
                  ...(i ? [{ type: "hardBreak" }] : []),
                  ...(t ? [{ type: "text", text: t }] : []),
                ]),
            )
            .run(),
        section: (sid) => {
          if (!editor) return;
          let found = -1;
          editor.state.doc.descendants((n, pos) => {
            if (n.type.name === "heading" && n.attrs.sectionId === sid)
              found = pos;
          });
          if (found >= 0)
            editor
              .chain()
              .focus()
              .setTextSelection(found + 1)
              .scrollIntoView()
              .run();
        },
        insertVisual: (sid) => {
          if (!editor) return;
          let found = -1,
            inside = false,
            exists = false;
          editor.state.doc.forEach((n, pos) => {
            if (n.type.name === "heading" && n.attrs.level === 2) {
              if (inside && found < 0) found = pos;
              inside = n.attrs.sectionId === sid;
            }
            if (
              inside &&
              n.type.name === "sectionVisual" &&
              n.attrs.sectionId === sid
            )
              exists = true;
          });
          if (exists) return;
          editor
            .chain()
            .focus()
            .insertContentAt(
              found >= 0 ? found : editor.state.doc.content.size,
              { type: "sectionVisual", attrs: { sectionId: sid } },
            )
            .run();
        },
      }),
      [editor],
    );
    const action = (
      label: string,
      icon: React.ReactNode,
      run: () => void,
      pressed?: boolean,
    ) => (
      <button
        type="button"
        title={label}
        aria-label={label}
        aria-pressed={pressed}
        onClick={run}
        disabled={!editor}
      >
        {icon}
      </button>
    );
    return (
      <div className={styles.editorSurface}>
        <div
          role="toolbar"
          aria-label="Article formatting"
          className={styles.toolbar}
        >
          <select
            aria-label="Text style"
            value={
              editor?.isActive("heading")
                ? String(editor.getAttributes("heading").level)
                : "paragraph"
            }
            onChange={(e) =>
              e.target.value === "paragraph"
                ? editor?.chain().focus().setParagraph().run()
                : editor
                    ?.chain()
                    .focus()
                    .toggleHeading({
                      level: Number(e.target.value) as 1 | 2 | 3,
                    })
                    .run()
            }
          >
            <option value="paragraph">Paragraph</option>
            <option value="1">Heading 1</option>
            <option value="2">Heading 2</option>
            <option value="3">Heading 3</option>
          </select>
          {action(
            "Bold",
            <Bold size={16} />,
            () => editor?.chain().focus().toggleBold().run(),
            editor?.isActive("bold"),
          )}
          {action(
            "Italic",
            <Italic size={16} />,
            () => editor?.chain().focus().toggleItalic().run(),
            editor?.isActive("italic"),
          )}
          {action("Bullet list", <List size={16} />, () =>
            editor?.chain().focus().toggleBulletList().run(),
          )}
          {action("Numbered list", <ListOrdered size={16} />, () =>
            editor?.chain().focus().toggleOrderedList().run(),
          )}
          {action("Quote", <Quote size={16} />, () =>
            editor?.chain().focus().toggleBlockquote().run(),
          )}
          {action("Add link", <Link2 size={16} />, () => {
            const value = window.prompt(
              "Link URL (https://…)",
              editor?.getAttributes("link").href || "",
            );
            if (value === null) return;
            if (!value) editor?.chain().focus().unsetMark("link").run();
            else if (safeUrl(value))
              editor
                ?.chain()
                .focus()
                .setMark("link", { href: safeUrl(value) })
                .run();
            else setNotice("Use a public HTTP or HTTPS link.");
          })}
          {action("Insert table", <Table2 size={16} />, () =>
            editor
              ?.chain()
              .focus()
              .insertContent({
                type: "table",
                content: Array.from({ length: 3 }, (_, row) => ({
                  type: "tableRow",
                  content: Array.from({ length: 2 }, () => ({
                    type: row ? "tableCell" : "tableHeader",
                    content: [{ type: "paragraph" }],
                  })),
                })),
              })
              .run(),
          )}
          <span className={styles.toolbarSpacer} />
          {action("Undo typing", <Undo2 size={16} />, () =>
            editor?.chain().focus().undo().run(),
          )}
          {action("Redo typing", <Redo2 size={16} />, () =>
            editor?.chain().focus().redo().run(),
          )}
        </div>
        {notice && (
          <p role="status" className={styles.notice}>
            {notice}
          </p>
        )}
        {editor?.isEmpty && (
          <div className={styles.emptyHint}>
            Your article starts here. Type a heading, paste a draft, or describe
            your idea in the brief.
          </div>
        )}
        <EditorContent editor={editor} />
      </div>
    );
  },
);
export default ArticleEditor;
