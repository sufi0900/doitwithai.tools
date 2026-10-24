"use client";
import { useEffect, useRef, useState } from "react";
import { EditorContent, Extension, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { Plugin } from "@tiptap/pm/state";
import { SafeLink } from "../readability/components/rich-text";
import type { RichDocument } from "../readability/engine/document";
import type { PageSnapshot } from "../on-page-analyzer/types";
import {
  reviewDraft,
  sanitizeArticleHtml,
  snapshotDocument,
  MAX_EDITOR_TEXT,
} from "./rich-snapshot";
import styles from "../content-evidence/evidence.module.css";
import editorStyles from "./content-editor.module.css";
export default function ContentEditor({
  page,
  onReview,
}: {
  page: PageSnapshot;
  onReview: (page: PageSnapshot) => void;
}) {
  const [notice, setNotice] = useState(""),
    [dirty, setDirty] = useState(false);
  const latest = useRef({ page });
  latest.current = { page };
  const editor = useEditor(
    {
      immediatelyRender: false,
      extensions: [
        StarterKit,
        SafeLink,
        Extension.create({
          name: "boundedCitationDraft",
          addProseMirrorPlugins() {
            return [
              new Plugin({
                filterTransaction(tr) {
                  if (
                    tr.docChanged &&
                    tr.doc.textContent.length > MAX_EDITOR_TEXT
                  ) {
                    setNotice(
                      "Keep the review draft within 160,000 text characters.",
                    );
                    return false;
                  }
                  return true;
                },
                props: {
                  handlePaste(_, event) {
                    if (
                      (event.clipboardData?.getData("text/html").length || 0) >
                        750_000 ||
                      (event.clipboardData?.getData("text/plain").length || 0) >
                        MAX_EDITOR_TEXT
                    ) {
                      setNotice(
                        "That paste is too large. Paste a smaller article section.",
                      );
                      return true;
                    }
                    return false;
                  },
                  transformPastedHTML(html) {
                    try {
                      return sanitizeArticleHtml(html);
                    } catch (e) {
                      setNotice(
                        e instanceof Error
                          ? e.message
                          : "Paste the main article section.",
                      );
                      return "";
                    }
                  },
                },
              }),
            ];
          },
        }),
      ],
      content: snapshotDocument(page),
      editorProps: {
        attributes: {
          role: "textbox",
          "aria-multiline": "true",
          "aria-label": "Article review rich text editor",
          spellcheck: "true",
        },
      },
      onUpdate() {
        setDirty(true);
        setNotice("Draft changed. Recheck to update the findings below.");
      },
    },
    [],
  );
  useEffect(() => {
    editor?.commands.setContent(snapshotDocument(page), false);
    setDirty(false);
    setNotice("");
  }, [editor, page]);
  function recheck() {
    if (!editor) return;
    try {
      onReview(
        reviewDraft(latest.current.page, editor.getJSON() as RichDocument),
      );
      setDirty(false);
      setNotice(
        "Draft reviewed. Findings below now use this content; nothing was published.",
      );
    } catch (e) {
      setNotice(
        e instanceof Error ? e.message : "The draft could not be reviewed.",
      );
    }
  }
  const controls = [
    ["Paragraph", () => editor?.chain().focus().setParagraph().run()],
    ["H1", () => editor?.chain().focus().toggleHeading({ level: 1 }).run()],
    ["H2", () => editor?.chain().focus().toggleHeading({ level: 2 }).run()],
    ["H3", () => editor?.chain().focus().toggleHeading({ level: 3 }).run()],
    ["Bold", () => editor?.chain().focus().toggleBold().run()],
    ["Italic", () => editor?.chain().focus().toggleItalic().run()],
    ["List", () => editor?.chain().focus().toggleBulletList().run()],
    ["Numbered list", () => editor?.chain().focus().toggleOrderedList().run()],
    ["Quote", () => editor?.chain().focus().toggleBlockquote().run()],
    ["Undo", () => editor?.chain().focus().undo().run()],
    ["Redo", () => editor?.chain().focus().redo().run()],
  ] as const;
  return (
    <section
      id="citation-article-editor"
      className={`${styles.report} ${editorStyles.container}`}
      aria-label="Retained article content"
    >
      <span className={styles.eyebrow}>Complete retained content</span>
      <h2>Inspect your article, then recheck a draft</h2>
      <p className={styles.small}>
        The URL import fills this editor automatically. Headings and list items
        remain separate; original styling and media are excluded. Pasted table
        cells become separate paragraphs.
      </p>
      <p className={styles.small}>
        You can also paste formatted content here. Editing supports a local
        review, with detailed rewriting and evidence decisions kept in dedicated
        tools.
      </p>
      <div
        role="group"
        aria-label="Article formatting"
        className={editorStyles.toolbar}
      >
        {controls.map(([name, action]) => (
          <button type="button" key={name} onClick={action} disabled={!editor}>
            {name}
          </button>
        ))}
      </div>
      <EditorContent editor={editor} className={editorStyles.editor} />
      <div className={`${styles.actions} mt-4`}>
        <button
          type="button"
          className={styles.primary}
          disabled={!editor}
          onClick={recheck}
        >
          Recheck this draft
        </button>
        <button
          type="button"
          className={styles.secondary}
          disabled={!editor}
          onClick={() => {
            editor?.commands.setContent(snapshotDocument(page), false);
            setDirty(true);
            setNotice(
              "Original retained content restored. Recheck to update findings.",
            );
          }}
        >
          Restore imported content
        </button>
        <span className={styles.small}>
          {dirty
            ? "Draft has unreviewed changes"
            : "Review content without publishing changes"}
        </span>
      </div>
      <p role="status" className={styles.notice}>
        {notice}
      </p>
      <p className={styles.small}>
        Claims are flagged for evidence review, not automatically fact-checked.
        No word count or first-sentence pattern proves citation eligibility.
      </p>
    </section>
  );
}
