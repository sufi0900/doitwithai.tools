"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import { EditorContent, Extension, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { Decoration, DecorationSet } from "@tiptap/pm/view";
import type { Review } from "../content-evidence/analyze";
import {
  reviewBlockPositions,
  locateReviewBlock,
  normalizePassage,
} from "./editor-markers";
import { articleMarkerTones, type PassageFlag } from "./workspace";
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
  reviewPage,
  flags = [],
  reviews = {},
  focusRequest,
}: {
  page: PageSnapshot;
  onReview: (page: PageSnapshot) => void;
  reviewPage?: PageSnapshot;
  flags?: PassageFlag[];
  reviews?: Record<string, Review>;
  focusRequest?: { blockId: string; nonce: number } | null;
}) {
  const [notice, setNotice] = useState(""),
    [dirty, setDirty] = useState(false);
  const tones = useMemo(
    () => articleMarkerTones(flags, reviews),
    [flags, reviews],
  );
  const latest = useRef({
    page,
    reviewPage: reviewPage || page,
    flags,
    reviews,
    dirty,
    tones,
    focusRequest,
  });
  latest.current = {
    page,
    reviewPage: reviewPage || page,
    flags,
    reviews,
    dirty,
    tones,
    focusRequest,
  };
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
                  decorations(state) {
                    const current = latest.current;
                    if (current.dirty) return DecorationSet.empty;
                    const decorations: Decoration[] = [];
                    reviewBlockPositions(state.doc).forEach(
                      (position, index) => {
                        const block = current.reviewPage.blocks[index];
                        if (
                          !block ||
                          normalizePassage(block.text) !== position.text
                        )
                          return;
                        const tone = current.tones.get(block.id);
                        const selected =
                          current.focusRequest?.blockId === block.id;
                        if (tone || selected)
                          decorations.push(
                            Decoration.node(
                              position.pos,
                              position.pos + position.size,
                              {
                                "data-review-tone": tone || "selected",
                                "data-citation-selected": selected
                                  ? "true"
                                  : "false",
                                "data-citation-block": block.id,
                                title: !tone
                                  ? "Selected passage"
                                  : tone === "recorded"
                                    ? "Evidence recorded by you, not independently verified"
                                    : tone === "revision"
                                      ? "Marked for revision by you"
                                      : "Editorial review cue",
                              },
                            ),
                          );
                      },
                    );
                    return DecorationSet.create(state.doc, decorations);
                  },
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
  useEffect(() => {
    if (editor)
      editor.view.dispatch(editor.state.tr.setMeta("citation-markers", true));
  }, [editor, flags, reviews, reviewPage, dirty, focusRequest]);
  useEffect(() => {
    if (!editor || !focusRequest) return;
    if (dirty) {
      setNotice(
        "The draft has changed. Update the review before locating earlier findings.",
      );
      return;
    }
    const index = (reviewPage || page).blocks.findIndex(
      (b) => b.id === focusRequest.blockId,
    );
    const source = (reviewPage || page).blocks[index];
    const target = source
      ? locateReviewBlock(editor.state.doc, index, source.text)
      : null;
    if (target !== null) {
      editor.commands.setTextSelection(target);
      editor.commands.focus(undefined, { scrollIntoView: false });
      const dom = editor.view.domAtPos(target).node;
      const element = dom instanceof Element ? dom : dom.parentElement;
      element?.scrollIntoView({
        block: "center",
        behavior: matchMedia("(prefers-reduced-motion: reduce)").matches
          ? "auto"
          : "smooth",
      });
      setNotice(
        "Selected passage located. Review its highlighted context before editing.",
      );
    }
  }, [editor, focusRequest, page, reviewPage, dirty]);
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
      <h2>Review flagged passages in your article</h2>
      <p className={styles.small}>
        Highlighted passages show editorial cues and your saved decisions.
        Headings and list items remain separate. Original styling and media are
        excluded.
      </p>
      <p className={styles.small}>
        Yellow means review a cue. Green means evidence recorded by you. Red
        means you marked a revision. These colors do not establish factual
        accuracy.
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
          {page.blocks.length
            ? "Update review from draft"
            : "Analyze this article"}
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
          Restore original content
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
        Updating the draft resets saved claim decisions for this report. Claims
        are not automatically fact-checked. No word count or first-sentence
        pattern proves citation eligibility.
      </p>
    </section>
  );
}
