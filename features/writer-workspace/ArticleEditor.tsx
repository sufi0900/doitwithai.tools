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
  ImagePlus,
  Sparkles,
  Trash2,
  RemoveFormatting,
  Upload,
  RotateCcw,
  Plus,
  Send,
  X,
  Check,
  Loader2,
  RefreshCw,
} from "lucide-react";
import { SafeLink } from "@/features/readability/components/rich-text";
import {
  annotate,
  scoreSentences,
} from "@/features/readability/engine";
import { buildInfographicScene } from "@/lib/blog-infographic-studio/canvas-renderer";
import {
  compressUploadedImageFile,
  id as createWriterId,
  inline,
  markdownNodes,
  patchWorkspace,
  projectDocument,
  safeImageSrc,
  safeUrl,
  syncDocument,
  workspace,
} from "./model";
import type { ReadabilityHighlightToggles } from "./LeftStudioPanel";
import type { Project, RichNode } from "./types";
import styles from "./workspace.module.css";

export type EditorHandle = {
  selection: () => { from: number; to: number; text: string };
  replace: (from: number, to: number, text: string) => void;
  insertLink: (anchor: string, url: string) => void;
  section: (id: string) => void;
  insertVisual: (id: string) => void;
  highlightAndScrollToTerm: (term: string) => boolean;
  scrollToHeading: (headingText: string) => boolean;
  insertImageBlock: (payload: {
    imageId?: string;
    src: string;
    alt: string;
    caption?: string;
  }) => void;
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

function trimEdgeWhitespace(nodes: RichNode[]): RichNode[] {
  const cloned = nodes.map((n) => ({ ...n }));
  while (cloned.length > 0 && cloned[0].type === "text" && !cloned[0].text?.trim()) {
    cloned.shift();
  }
  while (
    cloned.length > 0 &&
    cloned[cloned.length - 1].type === "text" &&
    !cloned[cloned.length - 1].text?.trim()
  ) {
    cloned.pop();
  }
  if (cloned.length > 0 && cloned[0].type === "text" && cloned[0].text) {
    cloned[0].text = cloned[0].text.replace(/^\s+/, "");
  }
  if (
    cloned.length > 0 &&
    cloned[cloned.length - 1].type === "text" &&
    cloned[cloned.length - 1].text
  ) {
    cloned[cloned.length - 1].text = cloned[cloned.length - 1].text.replace(/\s+$/, "");
  }
  return cloned.filter((n) => n.type !== "text" || Boolean(n.text));
}

function buildContentNodesFromText(text: string): RichNode[] {
  const hasBlockMd =
    /(?:^|\n)\s*(?:#{1,6}\s|[-*+]\s|\d+[.)]\s|>|\|)|\n\s*\n/.test(text);
  return hasBlockMd
    ? markdownNodes(text)
    : text
        .split("\n")
        .flatMap((t, i) => [
          ...(i ? [{ type: "hardBreak" }] : []),
          ...(t ? inline(t) : []),
        ]);
}

type Props = {
  project: Project;
  onChange: (doc: RichNode) => void;
  onEditVisual: (id: string) => void;
  onUpdateProject?: (updater: (p: Project) => Project) => void;
  highlights: boolean;
  highlightToggles?: ReadabilityHighlightToggles;
  targetGrade?: number;
  onSelection: (text: string) => void;
  onInlineAiRewrite?: (
    instruction: string,
    range: { from: number; to: number; text: string },
    signal: AbortSignal,
  ) => Promise<string>;
  onTellAi?: (
    instruction: string,
    range: { from: number; to: number; text: string },
    openHelperTab?: boolean,
  ) => void;
};

type FloatingToolbarState = {
  from: number;
  to: number;
  text: string;
  x: number;
  y: number;
  maxWidth: number;
};

const QUICK_AI_CHIPS = [
  { label: "Rewrite", instruction: "Rewrite this passage clearly with sharper prose while keeping all facts intact." },
  { label: "Simplify", instruction: "Simplify complex phrasing and split dense sentences into plain English." },
  { label: "Add example", instruction: "Expand this point with one concrete, practical real-world example." },
  { label: "To bullets", instruction: "Convert this passage into crisp, scannable bullet points." },
  { label: "To table", instruction: "Turn these points into a compact, readable Markdown comparison table." },
];

const ArticleEditor = forwardRef<EditorHandle, Props>(
  function ArticleEditor(props, ref) {
    const latest = useRef(props);
    latest.current = props;

    const surfaceRef = useRef<HTMLDivElement | null>(null);
    const toolbarRef = useRef<HTMLDivElement | null>(null);
    const floatingRef = useRef<HTMLDivElement | null>(null);
    const savedSelectionRef = useRef<{ from: number; to: number } | null>(null);
    const searchTermRef = useRef("");
    const searchClearTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const aiAbortRef = useRef<AbortController | null>(null);
    const uploadImgInputRef = useRef<HTMLInputElement | null>(null);
    const skipOnChangeRef = useRef(false);
    const suppressFloatingRef = useRef(false);

    const [notice, setNotice] = useState("");
    const [floating, setFloating] = useState<FloatingToolbarState | null>(null);
    const [aiPanelOpen, setAiPanelOpen] = useState(false);
    const [aiPrompt, setAiPrompt] = useState("");
    const [aiBusy, setAiBusy] = useState(false);
    const [aiError, setAiError] = useState("");
    const [aiProposal, setAiProposal] = useState<{
      instruction: string;
      text: string;
      range: { from: number; to: number; text: string };
    } | null>(null);

    const [linkPopoverOpen, setLinkPopoverOpen] = useState(false);
    const [linkValue, setLinkValue] = useState("");
    const [linkTargetRange, setLinkTargetRange] = useState<{ from: number; to: number } | null>(null);

    const [imageModalOpen, setImageModalOpen] = useState(false);
    const [imgUrlDraft, setImgUrlDraft] = useState("");
    const [imgAltDraft, setImgAltDraft] = useState("");
    const [imgCaptionDraft, setImgCaptionDraft] = useState("");
    const [imgUploadBusy, setImgUploadBusy] = useState(false);

    const [emptyLinePos, setEmptyLinePos] = useState<{ pos: number; top: number } | null>(null);
    const [plusMenuOpen, setPlusMenuOpen] = useState(false);

    const floatingLockRef = useRef(false);
    floatingLockRef.current = Boolean(
      aiPanelOpen || aiBusy || aiProposal || linkPopoverOpen,
    );

    const dismissFloating = () => {
      aiAbortRef.current?.abort();
      setFloating(null);
      setAiPanelOpen(false);
      setAiPrompt("");
      setAiBusy(false);
      setAiError("");
      setAiProposal(null);
      setLinkPopoverOpen(false);
    };

    const computeCoordsForRange = (from: number, to: number, fallbackClient?: { x: number; y: number }) => {
      const surf = surfaceRef.current;
      if (!surf) return { x: 16, y: 74, maxWidth: 460 };
      const surfRect = surf.getBoundingClientRect();
      const toolbarBottom =
        toolbarRef.current
          ? Math.max(66, toolbarRef.current.getBoundingClientRect().bottom - surfRect.top + 8)
          : 66;
      const maxWidth = Math.min(480, Math.max(280, surfRect.width - 24));
      try {
        if (editorRef.current) {
          const cFrom = editorRef.current.view.coordsAtPos(from);
          const cTo = editorRef.current.view.coordsAtPos(to);
          const centerX = (cFrom.left + cTo.right) / 2 - surfRect.left;
          const x = Math.max(12, Math.min(surfRect.width - maxWidth - 12, centerX - maxWidth / 2));
          const belowY = cTo.bottom - surfRect.top + 10;
          const viewportBottomOffset = cTo.bottom + 150 > window.innerHeight;
          const y = viewportBottomOffset
            ? Math.max(toolbarBottom, cFrom.top - surfRect.top - 72)
            : Math.max(toolbarBottom, belowY);
          return { x, y, maxWidth };
        }
      } catch {
        // fallback below
      }
      if (fallbackClient) {
        const x = Math.max(12, Math.min(surfRect.width - maxWidth - 12, fallbackClient.x - surfRect.left - 80));
        const y = Math.max(toolbarBottom, fallbackClient.y - surfRect.top + 12);
        return { x, y, maxWidth };
      }
      return { x: 16, y: toolbarBottom, maxWidth };
    };

    const editorRef = useRef<ReturnType<typeof useEditor>>(null);

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
            const fileInputRef = useRef<HTMLInputElement | null>(null);

            useEffect(() => {
              const changed = () => redraw((n) => n + 1);
              editor.on("transaction", changed);
              return () => {
                editor.off("transaction", changed);
              };
            }, [editor]);

            const w = workspace(latest.current.project);
            const section = latest.current.project.sections.find(
              (s) => s.id === node.attrs.sectionId,
            );
            const override = w.sectionVisualOverrides?.[node.attrs.sectionId];
            const overrideSrc = override?.dataUrl ? safeImageSrc(override.dataUrl) : "";
            const scene = section?.infographicConfig.nodes.length
              ? buildInfographicScene(section.infographicConfig)
              : null;

            const handleUploadOverride = async (file: File) => {
              try {
                const compressed = await compressUploadedImageFile(file);
                const sid = String(node.attrs.sectionId || "");
                if (!sid) return;
                const altText =
                  override?.altText ||
                  w.sectionAltTexts?.[sid]?.altText ||
                  section?.infographicConfig.altText ||
                  section?.h2Text ||
                  file.name;
                latest.current.onUpdateProject?.((now) => {
                  const nw = workspace(now);
                  return patchWorkspace(now, {
                    sectionVisualOverrides: {
                      ...(nw.sectionVisualOverrides || {}),
                      [sid]: {
                        dataUrl: compressed.dataUrl,
                        altText,
                      },
                    },
                  });
                });
                setNotice("Custom section image uploaded.");
              } catch (err) {
                setNotice(
                  err instanceof Error ? err.message : "Could not upload section image.",
                );
              }
            };

            const handleRestoreInfographic = () => {
              const sid = String(node.attrs.sectionId || "");
              if (!sid) return;
              latest.current.onUpdateProject?.((now) => {
                const nw = workspace(now);
                const nextOverrides = { ...(nw.sectionVisualOverrides || {}) };
                delete nextOverrides[sid];
                return patchWorkspace(now, {
                  sectionVisualOverrides: nextOverrides,
                });
              });
              setNotice("Restored section infographic.");
            };

            return (
              <NodeViewWrapper
                contentEditable={false}
                className={styles.visual}
              >
                <div className={styles.visualCard}>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/png,image/jpeg,image/webp"
                    hidden
                    onChange={(e) => {
                      const f = e.target.files?.[0];
                      e.target.value = "";
                      if (f) void handleUploadOverride(f);
                    }}
                  />
                  <div className={styles.visualBar}>
                    <ImageIcon size={15} />
                    <strong>
                      {overrideSrc
                        ? "Custom section image"
                        : "Section infographic"}
                    </strong>
                    <div className={styles.visualBarActions}>
                      {latest.current.onUpdateProject ? (
                        <button
                          type="button"
                          onMouseDown={(e) => e.preventDefault()}
                          onClick={() => fileInputRef.current?.click()}
                        >
                          <Upload size={12} />
                          {overrideSrc ? "Swap Image" : "Upload Image"}
                        </button>
                      ) : null}
                      {overrideSrc && latest.current.onUpdateProject ? (
                        <button
                          type="button"
                          onMouseDown={(e) => e.preventDefault()}
                          onClick={handleRestoreInfographic}
                        >
                          <RotateCcw size={12} />
                          Restore Infographic
                        </button>
                      ) : (
                        <button
                          type="button"
                          onMouseDown={(e) => e.preventDefault()}
                          onClick={() =>
                            latest.current.onEditVisual(node.attrs.sectionId)
                          }
                        >
                          Customize
                        </button>
                      )}
                    </div>
                  </div>
                  {overrideSrc ? (
                    <img
                      src={overrideSrc}
                      alt={override?.altText || section?.h2Text || "Section image"}
                      className={styles.visualImgClickable}
                      onClick={() => fileInputRef.current?.click()}
                    />
                  ) : scene && !scene.issues.length ? (
                    <img
                      src={`data:image/svg+xml;charset=utf-8,${encodeURIComponent(scene.svg)}`}
                      alt={
                        section?.infographicConfig.altText || section?.h2Text
                      }
                      className={styles.visualImgClickable}
                      onClick={() =>
                        latest.current.onEditVisual(node.attrs.sectionId)
                      }
                    />
                  ) : (
                    <span className={styles.visualEmpty}>
                      Add or refresh the visual from this section’s explanation, or upload a custom image.
                    </span>
                  )}
                </div>
              </NodeViewWrapper>
            );
          });
        },
      });

      const articleImage = Node.create({
        name: "articleImage",
        group: "block",
        atom: true,
        draggable: true,
        addAttributes: () => ({
          imageId: { default: "" },
          src: { default: "" },
          alt: { default: "Article illustration" },
          caption: { default: "" },
        }),
        parseHTML: () => [
          {
            tag: "img[src]",
            getAttrs: (el) => {
              const imgEl = el as HTMLElement;
              const rawSrc = imgEl.getAttribute("src") || "";
              const safe = safeImageSrc(rawSrc);
              if (!safe) return false;
              return {
                imageId: imgEl.getAttribute("data-writer-image-id") || "",
                src: safe,
                alt: imgEl.getAttribute("alt") || "Article illustration",
                caption: "",
              };
            },
          },
        ],
        renderHTML: ({ HTMLAttributes }) => {
          const imageId = String(HTMLAttributes.imageId || "");
          const safe = safeImageSrc(HTMLAttributes.src);
          return [
            "figure",
            { "data-writer-image": imageId || "inline" },
            [
              "img",
              {
                src: safe || (imageId ? `writer-image:${imageId}` : ""),
                alt: String(HTMLAttributes.alt || "Article illustration"),
                ...(imageId ? { "data-writer-image-id": imageId } : {}),
              },
            ],
            ...(HTMLAttributes.caption
              ? [["figcaption", {}, String(HTMLAttributes.caption)]]
              : []),
          ];
        },
        addNodeView() {
          return ReactNodeViewRenderer(function ArticleImageView({
            node,
            editor,
            updateAttributes,
            deleteNode,
          }: any) {
            const [, redraw] = useState(0);
            const replaceInputRef = useRef<HTMLInputElement | null>(null);

            useEffect(() => {
              const changed = () => redraw((n) => n + 1);
              editor.on("transaction", changed);
              return () => {
                editor.off("transaction", changed);
              };
            }, [editor]);

            const w = workspace(latest.current.project);
            const imageId = String(node.attrs.imageId || "");
            const stored = imageId ? w.customImages?.[imageId] : undefined;
            const resolvedSrc =
              stored?.src || safeImageSrc(node.attrs.src);
            const altText =
              stored?.alt || String(node.attrs.alt || "Article image");
            const captionText =
              stored?.caption || String(node.attrs.caption || "");

            const handleReplaceFile = async (file: File) => {
              try {
                const compressed = await compressUploadedImageFile(file);
                const nextId = imageId || createWriterId();
                if (latest.current.onUpdateProject) {
                  skipOnChangeRef.current = true;
                  try {
                    updateAttributes({ imageId: nextId, src: "", alt: altText });
                  } finally {
                    skipOnChangeRef.current = false;
                  }
                  const nextDoc = editor.getJSON() as RichNode;
                  latest.current.onUpdateProject((now) => {
                    const synced = syncDocument(now, nextDoc);
                    const nw = workspace(synced);
                    return patchWorkspace(synced, {
                      customImages: {
                        ...(nw.customImages || {}),
                        [nextId]: {
                          id: nextId,
                          src: compressed.dataUrl,
                          alt: altText || file.name,
                          caption: captionText,
                        },
                      },
                    });
                  });
                } else {
                  updateAttributes({ src: compressed.dataUrl, alt: altText });
                }
              } catch (err) {
                setNotice(
                  err instanceof Error ? err.message : "Could not replace image.",
                );
              }
            };

            return (
              <NodeViewWrapper contentEditable={false} className={styles.visual}>
                <div className={styles.visualCard}>
                  <input
                    ref={replaceInputRef}
                    type="file"
                    accept="image/png,image/jpeg,image/webp"
                    hidden
                    onChange={(e) => {
                      const f = e.target.files?.[0];
                      e.target.value = "";
                      if (f) void handleReplaceFile(f);
                    }}
                  />
                  <div className={styles.visualBar}>
                    <ImageIcon size={15} />
                    <strong>Uploaded article image</strong>
                    <div className={styles.visualBarActions}>
                      <button
                        type="button"
                        onMouseDown={(e) => e.preventDefault()}
                        onClick={() => replaceInputRef.current?.click()}
                      >
                        <Upload size={12} /> Replace
                      </button>
                      <button
                        type="button"
                        onMouseDown={(e) => e.preventDefault()}
                        onClick={() => deleteNode()}
                        title="Remove image"
                      >
                        <Trash2 size={12} /> Remove
                      </button>
                    </div>
                  </div>
                  {resolvedSrc ? (
                    <img src={resolvedSrc} alt={altText} />
                  ) : (
                    <span className={styles.visualEmpty}>
                      Image unavailable. Use Replace to upload a PNG, JPEG, or WebP file.
                    </span>
                  )}
                  <div className={styles.customImgMetaRow}>
                    <label>
                      <span>Alt:</span>
                      <input
                        type="text"
                        value={altText}
                        onChange={(e) => {
                          const nextAlt = e.target.value;
                          updateAttributes({ alt: nextAlt });
                          if (imageId && latest.current.onUpdateProject) {
                            latest.current.onUpdateProject((now) => {
                              const nw = workspace(now);
                              const existing = nw.customImages?.[imageId];
                              if (!existing) return now;
                              return patchWorkspace(now, {
                                customImages: {
                                  ...(nw.customImages || {}),
                                  [imageId]: { ...existing, alt: nextAlt },
                                },
                              });
                            });
                          }
                        }}
                        placeholder="Describe image for readers and search engines"
                      />
                    </label>
                    {captionText ? (
                      <span className={styles.customImgCaption}>{captionText}</span>
                    ) : null}
                  </div>
                </div>
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
                  const list: Decoration[] = [];
                  const activeSearch = searchTermRef.current.trim().toLowerCase();

                  state.doc.descendants((node, pos) => {
                    if (!node.isTextblock) return;
                    const text = node.textBetween(
                      0,
                      node.content.size,
                      "\n",
                      "\n",
                    );
                    if (!text.trim()) return;
                    const maxPos = pos + 1 + node.content.size;

                    // 1. Live keyword/issue navigation highlight (always active when searching)
                    if (activeSearch.length >= 2) {
                      const lowerText = text.toLowerCase();
                      let idx = 0;
                      while ((idx = lowerText.indexOf(activeSearch, idx)) !== -1) {
                        const from = Math.min(maxPos, pos + 1 + idx);
                        const to = Math.min(maxPos, from + activeSearch.length);
                        if (to > from) {
                          list.push(
                            Decoration.inline(from, to, {
                              class: styles.hlSearchMatch,
                            }),
                          );
                        }
                        idx += activeSearch.length;
                      }
                    }

                    // 2. Readability highlights on body paragraphs when toggled
                    if (!latest.current.highlights || node.type.name !== "paragraph") {
                      return;
                    }
                    const grade = latest.current.targetGrade || 10;
                    const toggles = latest.current.highlightToggles || {
                      veryHard: true,
                      hard: true,
                      passive: true,
                      simpler: true,
                    };
                    const anns = annotate(text, scoreSentences(text, grade));
                    for (const ann of anns) {
                      const band =
                        ann.type === "veryHard" && toggles.veryHard
                          ? styles.hlSpanVeryHard
                          : ann.type === "hard" && toggles.hard
                            ? styles.hlSpanHard
                            : ann.type === "passive" && toggles.passive
                              ? styles.hlSpanPassive
                              : (ann.type === "simpler" ||
                                    ann.type === "weakener" ||
                                    ann.type === "adverb") &&
                                  toggles.simpler
                                ? styles.hlSpanSimpler
                                : null;
                      if (!band) continue;
                      const from = Math.min(maxPos, pos + 1 + ann.start);
                      const to = Math.min(maxPos, pos + 1 + ann.end);
                      if (to > from) {
                        list.push(
                          Decoration.inline(from, to, {
                            class: band,
                            title: ann.message,
                          }),
                        );
                      }
                    }
                  });

                  return list.length ? DecorationSet.create(state.doc, list) : DecorationSet.empty;
                },
                transformPastedHTML(html) {
                  const doc = new DOMParser().parseFromString(
                    html,
                    "text/html",
                  );
                  doc
                    .querySelectorAll(
                      "script,style,iframe,object,embed,svg,form,input,button,video,audio",
                    )
                    .forEach((n) => n.remove());
                  doc.querySelectorAll("*").forEach((el) => {
                    for (const a of [...el.attributes])
                      if (
                        a.name.startsWith("on") ||
                        a.name === "style" ||
                        a.name === "srcdoc" ||
                        (a.name === "href" && !safeUrl(a.value)) ||
                        (a.name === "src" && !safeImageSrc(a.value))
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
        StarterKit.configure({ heading: { levels: [1, 2, 3, 4, 5, 6] } }),
        SafeLink,
        headingIDs,
        table,
        row,
        cell("tableCell", "td"),
        cell("tableHeader", "th"),
        visual,
        articleImage,
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
      onUpdate: ({ editor: ed }) => {
        if (skipOnChangeRef.current) return;
        latest.current.onChange(ed.getJSON() as RichNode);
      },
      onSelectionUpdate: ({ editor: ed }) => {
        const { from, to } = ed.state.selection;
        savedSelectionRef.current = { from, to };
        const selected = ed.state.doc.textBetween(from, to, " ");
        latest.current.onSelection(selected);

        // Empty-line `+` quick inserter position check
        if (from === to && !ed.isEmpty) {
          const $from = ed.state.doc.resolve(from);
          const isTopEmptyPara =
            $from.depth === 1 &&
            $from.parent.type.name === "paragraph" &&
            !$from.parent.textContent.trim();
          if (isTopEmptyPara && surfaceRef.current) {
            try {
              const coords = ed.view.coordsAtPos(from);
              const surfRect = surfaceRef.current.getBoundingClientRect();
              setEmptyLinePos({
                pos: from,
                top: Math.max(70, coords.top - surfRect.top - 2),
              });
            } catch {
              setEmptyLinePos(null);
            }
          } else {
            setEmptyLinePos(null);
            setPlusMenuOpen(false);
          }
        } else {
          setEmptyLinePos(null);
          setPlusMenuOpen(false);
        }

        if (suppressFloatingRef.current) {
          setFloating(null);
          return;
        }

        // Preserve active Ask-AI / Link popover if user is typing inside it
        if (floatingLockRef.current) return;

        if (selected.trim().length >= 2 && to > from) {
          const coords = computeCoordsForRange(from, to);
          setFloating({ from, to, text: selected, ...coords });
        } else {
          setFloating(null);
        }
      },
    });

    editorRef.current = editor;

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
    }, [
      editor,
      props.project,
      props.highlights,
      props.highlightToggles,
      props.targetGrade,
    ]);

    useEffect(() => {
      if (!floating && !linkPopoverOpen && !plusMenuOpen) return;
      const onKey = (e: KeyboardEvent) => {
        if (e.key === "Escape") {
          dismissFloating();
          setPlusMenuOpen(false);
          setImageModalOpen(false);
        }
      };
      const onMouseDown = (e: MouseEvent) => {
        const target = e.target as globalThis.Node | null;
        if (floatingRef.current && target && floatingRef.current.contains(target)) {
          return;
        }
        if (target && surfaceRef.current && !surfaceRef.current.contains(target)) {
          if (!aiBusy) dismissFloating();
          setPlusMenuOpen(false);
        }
      };
      window.addEventListener("keydown", onKey);
      window.addEventListener("mousedown", onMouseDown);
      return () => {
        window.removeEventListener("keydown", onKey);
        window.removeEventListener("mousedown", onMouseDown);
      };
    }, [floating, linkPopoverOpen, plusMenuOpen, aiBusy]);

    useEffect(() => () => aiAbortRef.current?.abort(), []);

    const applyBlockStyle = (
      styleValue: string,
      explicitRange?: { from: number; to: number },
    ) => {
      if (!editor) return;
      const range =
        explicitRange || savedSelectionRef.current || editor.state.selection;
      const from = Math.min(range.from, editor.state.doc.content.size);
      const to = Math.min(range.to, editor.state.doc.content.size);

      if (styleValue === "paragraph") {
        editor.chain().focus().setTextSelection({ from, to }).setParagraph().run();
        return;
      }

      const level = Math.min(6, Math.max(1, Number(styleValue) || 2)) as
        | 1
        | 2
        | 3
        | 4
        | 5
        | 6;

      if (to > from) {
        const $from = editor.state.doc.resolve(from);
        const $to = editor.state.doc.resolve(to);
        if (
          $from.depth === 1 &&
          $from.sameParent($to) &&
          $from.parent.isTextblock
        ) {
          const parentNode = $from.parent;
          const parentStart = $from.start(1);
          const parentEnd = $from.end(1);
          const relFrom = Math.max(0, from - parentStart);
          const relTo = Math.min(parentNode.content.size, to - parentStart);
          const beforeSlice = parentNode.content.cut(0, relFrom);
          const midSlice = parentNode.content.cut(relFrom, relTo);
          const afterSlice = parentNode.content.cut(
            relTo,
            parentEnd - parentStart,
          );
          const beforeText = beforeSlice.textBetween(0, beforeSlice.size, " ").trim();
          const midText = midSlice.textBetween(0, midSlice.size, " ").trim();
          const afterText = afterSlice.textBetween(0, afterSlice.size, " ").trim();

          if (midText && (beforeText || afterText)) {
            const blockFrom = $from.before(1);
            const blockTo = $from.after(1);
            const replacements: RichNode[] = [];
            if (beforeText) {
              replacements.push({
                type: "paragraph",
                content: trimEdgeWhitespace((beforeSlice.toJSON() || []) as RichNode[]),
              });
            }
            replacements.push({
              type: "heading",
              attrs: { level },
              content: trimEdgeWhitespace((midSlice.toJSON() || []) as RichNode[]),
            });
            if (afterText) {
              replacements.push({
                type: "paragraph",
                content: trimEdgeWhitespace((afterSlice.toJSON() || []) as RichNode[]),
              });
            }
            editor
              .chain()
              .focus()
              .insertContentAt({ from: blockFrom, to: blockTo }, replacements)
              .run();
            return;
          }
        }
      }

      editor
        .chain()
        .focus()
        .setTextSelection({ from, to })
        .setHeading({ level })
        .run();
    };

    const insertImageIntoEditor = ({
      imageId,
      src,
      alt,
      caption,
    }: {
      imageId?: string;
      src: string;
      alt: string;
      caption?: string;
    }) => {
      if (!editor) return;
      const safe = imageId ? src : safeImageSrc(src);
      if (!imageId && !safe) {
        setNotice("Use a valid HTTPS image URL or upload a PNG/JPEG/WebP image.");
        return;
      }
      const attrs = {
        imageId: imageId || "",
        src: imageId ? "" : safe,
        alt: alt.trim() || "Article image",
        caption: caption?.trim() || "",
      };
      const pos = savedSelectionRef.current?.to ?? editor.state.selection.to;
      const $pos = editor.state.doc.resolve(
        Math.min(pos, editor.state.doc.content.size),
      );
      const insertPos = $pos.depth >= 1 ? $pos.after(1) : pos;
      editor
        .chain()
        .focus()
        .insertContentAt(Math.min(insertPos, editor.state.doc.content.size), {
          type: "articleImage",
          attrs,
        })
        .run();
    };

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
        replace: (from, to, text) => {
          if (!editor) return;
          editor
            .chain()
            .focus()
            .insertContentAt({ from, to }, buildContentNodesFromText(text))
            .run();
        },
        insertLink: (anchor, url) => {
          if (!editor) return;
          if (anchor.startsWith("__MD_BLOCK__:")) {
            const mdPayload = anchor.slice("__MD_BLOCK__:".length).trim();
            if (!mdPayload) return;
            editor.chain().focus().insertContent(markdownNodes(mdPayload)).run();
            return;
          }
          const valid = safeUrl(url);
          if (!valid) return;
          const { from, to } = editor.state.selection;
          if (to > from) {
            editor
              .chain()
              .focus()
              .setMark("link", { href: valid })
              .run();
          } else {
            editor
              .chain()
              .focus()
              .insertContent({
                type: "text",
                text: anchor || valid,
                marks: [{ type: "link", attrs: { href: valid } }],
              })
              .run();
          }
        },
        section: (sid) => {
          if (!editor) return;
          let found = -1;
          editor.state.doc.descendants((n, pos) => {
            if (n.type.name === "heading" && n.attrs.sectionId === sid)
              found = pos;
          });
          if (found >= 0) {
            suppressFloatingRef.current = true;
            setFloating(null);
            editor.chain().focus().setTextSelection(found + 1).run();
            requestAnimationFrame(() => {
              suppressFloatingRef.current = false;
              try {
                const dom = editor.view.domAtPos(found + 1).node;
                const el = dom instanceof Element ? dom : dom.parentElement;
                el?.scrollIntoView({ behavior: "smooth", block: "center" });
              } catch {}
            });
          }
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
        highlightAndScrollToTerm: (term: string) => {
          if (!editor || !term.trim()) return false;
          const needle = term.trim().toLowerCase();
          let firstMatch = -1;
          editor.state.doc.descendants((node, pos) => {
            if (firstMatch >= 0 || !node.isTextblock) return;
            const text = node.textBetween(0, node.content.size, "\n", "\n");
            const idx = text.toLowerCase().indexOf(needle);
            if (idx >= 0) {
              firstMatch = pos + 1 + idx;
            }
          });
          searchTermRef.current = term.trim();
          if (searchClearTimerRef.current) {
            clearTimeout(searchClearTimerRef.current);
          }
          searchClearTimerRef.current = setTimeout(() => {
            searchTermRef.current = "";
            if (editorRef.current && !editorRef.current.isDestroyed) {
              editorRef.current.view.dispatch(
                editorRef.current.state.tr.setMeta("writerDisplay", true),
              );
            }
          }, 4200);
          editor.view.dispatch(editor.state.tr.setMeta("writerDisplay", true));

          if (firstMatch >= 0) {
            suppressFloatingRef.current = true;
            setFloating(null);
            setAiPanelOpen(false);
            const matchEnd = Math.min(
              editor.state.doc.content.size,
              firstMatch + term.trim().length,
            );
            editor.commands.setTextSelection({ from: firstMatch, to: matchEnd });
            requestAnimationFrame(() => {
              suppressFloatingRef.current = false;
              try {
                const dom = editor.view.domAtPos(firstMatch).node;
                const el = dom instanceof Element ? dom : dom.parentElement;
                el?.scrollIntoView({ behavior: "smooth", block: "center" });
              } catch {}
            });
            return true;
          }
          setNotice(`"${term}" does not appear yet in the draft.`);
          return false;
        },
        scrollToHeading: (headingText: string) => {
          if (!editor || !headingText.trim()) return false;
          const needle = headingText.trim().toLowerCase();
          let found = -1;
          editor.state.doc.descendants((node, pos) => {
            if (found >= 0 || node.type.name !== "heading") return;
            if (node.textContent.trim().toLowerCase().includes(needle)) {
              found = pos;
            }
          });
          if (found >= 0) {
            suppressFloatingRef.current = true;
            setFloating(null);
            editor.chain().focus().setTextSelection(found + 1).run();
            requestAnimationFrame(() => {
              suppressFloatingRef.current = false;
              try {
                const dom = editor.view.domAtPos(found + 1).node;
                const el = dom instanceof Element ? dom : dom.parentElement;
                el?.scrollIntoView({ behavior: "smooth", block: "center" });
              } catch {}
            });
            return true;
          }
          return false;
        },
        insertImageBlock: insertImageIntoEditor,
      }),
      [editor],
    );

    const runInlineAi = async (
      instruction: string,
      target: FloatingToolbarState,
    ) => {
      if (!instruction.trim()) return;
      if (!latest.current.onInlineAiRewrite) {
        latest.current.onTellAi?.(
          instruction,
          { from: target.from, to: target.to, text: target.text },
          true,
        );
        return;
      }
      aiAbortRef.current?.abort();
      const ctrl = new AbortController();
      aiAbortRef.current = ctrl;
      setAiPanelOpen(true);
      setAiBusy(true);
      setAiError("");
      setAiProposal(null);
      try {
        const resultText = await latest.current.onInlineAiRewrite(
          instruction,
          { from: target.from, to: target.to, text: target.text },
          ctrl.signal,
        );
        if (ctrl.signal.aborted) return;
        setAiProposal({
          instruction,
          text: resultText,
          range: { from: target.from, to: target.to, text: target.text },
        });
      } catch (err) {
        if (ctrl.signal.aborted) return;
        setAiError(
          err instanceof Error
            ? err.message
            : "AI edit could not be completed. Try again.",
        );
      } finally {
        if (!ctrl.signal.aborted) setAiBusy(false);
      }
    };

    const handleUploadImageFile = async (file: File) => {
      setImgUploadBusy(true);
      try {
        const compressed = await compressUploadedImageFile(file);
        const imageId = createWriterId();
        const alt = imgAltDraft.trim() || file.name.replace(/\.[^.]+$/, "");
        const caption = imgCaptionDraft.trim();
        if (latest.current.onUpdateProject && editor) {
          skipOnChangeRef.current = true;
          try {
            insertImageIntoEditor({ imageId, src: "", alt, caption });
          } finally {
            skipOnChangeRef.current = false;
          }
          const nextDoc = editor.getJSON() as RichNode;
          latest.current.onUpdateProject((now) => {
            const synced = syncDocument(now, nextDoc);
            const nw = workspace(synced);
            return patchWorkspace(synced, {
              customImages: {
                ...(nw.customImages || {}),
                [imageId]: { id: imageId, src: compressed.dataUrl, alt, caption },
              },
            });
          });
        } else {
          insertImageIntoEditor({ src: compressed.dataUrl, alt, caption });
        }
        setImageModalOpen(false);
        setImgUrlDraft("");
        setImgAltDraft("");
        setImgCaptionDraft("");
      } catch (err) {
        setNotice(err instanceof Error ? err.message : "Image upload failed.");
      } finally {
        setImgUploadBusy(false);
      }
    };

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
        onMouseDown={(e) => e.preventDefault()}
        onClick={run}
        disabled={!editor}
      >
        {icon}
      </button>
    );

    const openInlineLinkPopover = (range?: { from: number; to: number }) => {
      if (!editor) return;
      const r = range || savedSelectionRef.current || editor.state.selection;
      setLinkTargetRange({ from: r.from, to: r.to });
      setLinkValue(editor.getAttributes("link").href || "");
      setLinkPopoverOpen(true);
    };

    const applyInlineLink = () => {
      if (!editor) return;
      const range = linkTargetRange || editor.state.selection;
      const trimmed = linkValue.trim();
      if (!trimmed) {
        editor
          .chain()
          .focus()
          .setTextSelection(range)
          .unsetMark("link")
          .run();
        setLinkPopoverOpen(false);
        return;
      }
      const valid = safeUrl(trimmed);
      if (!valid) {
        setNotice("Use a valid HTTP or HTTPS URL (e.g. https://example.com).");
        return;
      }
      editor
        .chain()
        .focus()
        .setTextSelection(range)
        .setMark("link", { href: valid })
        .run();
      setLinkPopoverOpen(false);
    };

    return (
      <div ref={surfaceRef} className={styles.editorSurface}>
        <div
          ref={toolbarRef}
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
            onMouseDown={() => {
              if (editor) {
                const { from, to } = editor.state.selection;
                savedSelectionRef.current = { from, to };
              }
            }}
            onChange={(e) => applyBlockStyle(e.target.value)}
          >
            <option value="paragraph">Paragraph</option>
            <option value="1">Heading 1</option>
            <option value="2">Heading 2</option>
            <option value="3">Heading 3</option>
            <option value="4">Heading 4</option>
            <option value="5">Heading 5</option>
            <option value="6">Heading 6</option>
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
          {action(
            "Bullet list",
            <List size={16} />,
            () => editor?.chain().focus().toggleBulletList().run(),
            editor?.isActive("bulletList"),
          )}
          {action(
            "Numbered list",
            <ListOrdered size={16} />,
            () => editor?.chain().focus().toggleOrderedList().run(),
            editor?.isActive("orderedList"),
          )}
          {action(
            "Quote",
            <Quote size={16} />,
            () => editor?.chain().focus().toggleBlockquote().run(),
            editor?.isActive("blockquote"),
          )}
          {action(
            "Add link",
            <Link2 size={16} />,
            () => {
              dismissFloating();
              openInlineLinkPopover();
            },
            editor?.isActive("link"),
          )}
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
          {action("Insert image", <ImagePlus size={16} />, () => {
            if (editor) {
              const { from, to } = editor.state.selection;
              savedSelectionRef.current = { from, to };
            }
            dismissFloating();
            setImageModalOpen((prev) => !prev);
          }, imageModalOpen)}
          {action("Clear formatting", <RemoveFormatting size={16} />, () =>
            editor?.chain().focus().unsetAllMarks().clearNodes().run(),
          )}
          <span className={styles.toolbarSpacer} />
          {action("Undo typing", <Undo2 size={16} />, () =>
            editor?.chain().focus().undo().run(),
          )}
          {action("Redo typing", <Redo2 size={16} />, () =>
            editor?.chain().focus().redo().run(),
          )}
        </div>

        {/* Inline Toolbar Link Popover */}
        {linkPopoverOpen && !floating ? (
          <div className={styles.toolbarInlinePopover} role="dialog" aria-label="Insert or edit link">
            <Link2 size={14} />
            <input
              type="text"
              value={linkValue}
              onChange={(e) => setLinkValue(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  applyInlineLink();
                }
              }}
              placeholder="Paste public URL (https://...)"
              autoFocus
            />
            <button type="button" onClick={applyInlineLink}>
              Apply
            </button>
            <button
              type="button"
              onClick={() => {
                setLinkValue("");
                editor?.chain().focus().unsetMark("link").run();
                setLinkPopoverOpen(false);
              }}
            >
              Unlink
            </button>
            <button type="button" onClick={() => setLinkPopoverOpen(false)}>
              <X size={13} />
            </button>
          </div>
        ) : null}

        {/* Centered Viewport Image Upload & URL Modal (never clipped by sticky header) */}
        {imageModalOpen ? (
          <div
            className={styles.imageInsertBackdrop}
            onClick={() => setImageModalOpen(false)}
          >
            <div
              className={styles.imageInsertModal}
              role="dialog"
              aria-modal="true"
              aria-label="Insert article image"
              onClick={(e) => e.stopPropagation()}
            >
              <div className={styles.imageInsertHead}>
                <strong>
                  <ImagePlus size={15} /> Insert Image into Article
                </strong>
                <button type="button" onClick={() => setImageModalOpen(false)} aria-label="Close image dialog">
                  <X size={14} />
                </button>
              </div>
              <div className={styles.imageInsertFields}>
                <input
                  ref={uploadImgInputRef}
                  type="file"
                  accept="image/png,image/jpeg,image/webp"
                  hidden
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    e.target.value = "";
                    if (file) void handleUploadImageFile(file);
                  }}
                />
                <button
                  type="button"
                  className={styles.uploadPrimaryBtn}
                  disabled={imgUploadBusy}
                  onClick={() => uploadImgInputRef.current?.click()}
                >
                  {imgUploadBusy ? <Loader2 size={14} className={styles.spinIcon} /> : <Upload size={14} />}
                  <span>Upload PNG / JPEG / WebP from Computer</span>
                </button>
                <div className={styles.imageInsertOr}>
                  <span>or paste public image URL</span>
                </div>
                <input
                  type="text"
                  value={imgUrlDraft}
                  onChange={(e) => setImgUrlDraft(e.target.value)}
                  placeholder="https://example.com/chart.png"
                />
                <input
                  type="text"
                  value={imgAltDraft}
                  onChange={(e) => setImgAltDraft(e.target.value)}
                  placeholder="Alt text (describes image for accessibility & SEO)"
                />
                <input
                  type="text"
                  value={imgCaptionDraft}
                  onChange={(e) => setImgCaptionDraft(e.target.value)}
                  placeholder="Optional caption"
                />
                <div className={styles.imageInsertActions}>
                  <button
                    type="button"
                    className={styles.primary}
                    disabled={!imgUrlDraft.trim()}
                    onClick={() => {
                      insertImageIntoEditor({
                        src: imgUrlDraft,
                        alt: imgAltDraft || "Article illustration",
                        caption: imgCaptionDraft,
                      });
                      setImageModalOpen(false);
                      setImgUrlDraft("");
                      setImgAltDraft("");
                      setImgCaptionDraft("");
                    }}
                  >
                    Insert URL Image
                  </button>
                  <button type="button" onClick={() => setImageModalOpen(false)}>
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        ) : null}

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

        {/* Empty-Line `+` Quick Block Inserter Pill */}
        {emptyLinePos && !floating && (
          <div
            className={styles.emptyLinePlusWrap}
            style={{ top: emptyLinePos.top }}
          >
            <button
              type="button"
              className={styles.emptyLinePlusBtn}
              aria-label="Insert block at cursor"
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => setPlusMenuOpen((prev) => !prev)}
            >
              <Plus size={14} />
            </button>
            {plusMenuOpen ? (
              <div className={styles.emptyLineMenu} role="menu">
                <button
                  type="button"
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => {
                    setPlusMenuOpen(false);
                    dismissFloating();
                    setImageModalOpen(true);
                  }}
                >
                  <ImagePlus size={13} /> Image
                </button>
                <button
                  type="button"
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => {
                    setPlusMenuOpen(false);
                    editor?.chain().focus().setHeading({ level: 2 }).run();
                  }}
                >
                  H2 Heading
                </button>
                <button
                  type="button"
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => {
                    setPlusMenuOpen(false);
                    editor?.chain().focus().toggleBulletList().run();
                  }}
                >
                  <List size={13} /> Bullets
                </button>
                <button
                  type="button"
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => {
                    setPlusMenuOpen(false);
                    editor?.chain().focus().toggleBlockquote().run();
                  }}
                >
                  <Quote size={13} /> Quote
                </button>
                <button
                  type="button"
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => {
                    setPlusMenuOpen(false);
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
                      .run();
                  }}
                >
                  <Table2 size={13} /> Table
                </button>
              </div>
            ) : null}
          </div>
        )}

        {/* Unified Cursor-Anchored Floating Selection Toolbar + Inline Ask AI + Proposal Card */}
        {floating && (
          <div
            ref={floatingRef}
            className={styles.floatingAnchorBox}
            style={{
              left: floating.x,
              top: floating.y,
              maxWidth: floating.maxWidth,
            }}
            role="toolbar"
            aria-label="Selection formatting and AI toolbar"
          >
            <div className={styles.floatingMainRow}>
              <button
                type="button"
                className={`${styles.floatingAiBtn} ${aiPanelOpen ? styles.floatingAiBtnActive : ""}`}
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => {
                  setAiPanelOpen((prev) => !prev);
                  setLinkPopoverOpen(false);
                }}
              >
                <Sparkles size={13} />
                <span>Ask AI</span>
              </button>

              <span className={styles.floatingDivider} />

              <button
                type="button"
                title="Convert selected text or sentence to H2"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => {
                  applyBlockStyle("2", floating);
                  setFloating(null);
                }}
              >
                H2
              </button>
              <button
                type="button"
                title="Convert selected text or sentence to H3"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => {
                  applyBlockStyle("3", floating);
                  setFloating(null);
                }}
              >
                H3
              </button>
              <button
                type="button"
                title="Bold"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() =>
                  editor
                    ?.chain()
                    .focus()
                    .setTextSelection({ from: floating.from, to: floating.to })
                    .toggleBold()
                    .run()
                }
              >
                <Bold size={13} />
              </button>
              <button
                type="button"
                title="Italic"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() =>
                  editor
                    ?.chain()
                    .focus()
                    .setTextSelection({ from: floating.from, to: floating.to })
                    .toggleItalic()
                    .run()
                }
              >
                <Italic size={13} />
              </button>
              <button
                type="button"
                title="Bullet list (instant)"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => {
                  editor
                    ?.chain()
                    .focus()
                    .setTextSelection({ from: floating.from, to: floating.to })
                    .toggleBulletList()
                    .run();
                  setFloating(null);
                }}
              >
                <List size={13} />
              </button>
              <button
                type="button"
                title="Quote"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => {
                  editor
                    ?.chain()
                    .focus()
                    .setTextSelection({ from: floating.from, to: floating.to })
                    .toggleBlockquote()
                    .run();
                  setFloating(null);
                }}
              >
                <Quote size={13} />
              </button>
              <button
                type="button"
                title="Link"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => openInlineLinkPopover(floating)}
              >
                <Link2 size={13} />
              </button>
              <button
                type="button"
                title="Clear formatting"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() =>
                  editor
                    ?.chain()
                    .focus()
                    .setTextSelection({ from: floating.from, to: floating.to })
                    .unsetAllMarks()
                    .clearNodes()
                    .run()
                }
              >
                <RemoveFormatting size={13} />
              </button>
              <button
                type="button"
                title="Delete selected text"
                className={styles.floatingDangerBtn}
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => {
                  editor
                    ?.chain()
                    .focus()
                    .deleteRange({ from: floating.from, to: floating.to })
                    .run();
                  dismissFloating();
                }}
              >
                <Trash2 size={13} />
              </button>
            </div>

            {/* Floating inline link input */}
            {linkPopoverOpen ? (
              <div className={styles.floatingSubPanel}>
                <div className={styles.floatingInputRow}>
                  <input
                    type="text"
                    value={linkValue}
                    onChange={(e) => setLinkValue(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        applyInlineLink();
                      }
                    }}
                    placeholder="https://example.com"
                    autoFocus
                  />
                  <button type="button" onClick={applyInlineLink}>
                    Apply
                  </button>
                  <button type="button" onClick={() => setLinkPopoverOpen(false)}>
                    <X size={12} />
                  </button>
                </div>
              </div>
            ) : null}

            {/* Inline Ask AI prompt + quick suggestion chips */}
            {aiPanelOpen ? (
              <div className={styles.floatingSubPanel}>
                <form
                  className={styles.floatingInputRow}
                  onSubmit={(e) => {
                    e.preventDefault();
                    if (!aiBusy && aiPrompt.trim()) {
                      void runInlineAi(aiPrompt.trim(), floating);
                    }
                  }}
                >
                  <Sparkles size={13} className={styles.floatingAiSparkle} />
                  <input
                    type="text"
                    value={aiPrompt}
                    onChange={(e) => setAiPrompt(e.target.value)}
                    placeholder="Ask AI how to edit…"
                    autoFocus
                  />
                  {aiBusy ? (
                    <button
                      type="button"
                      onClick={() => {
                        aiAbortRef.current?.abort();
                        setAiBusy(false);
                      }}
                    >
                      Cancel
                    </button>
                  ) : (
                    <button
                      type="submit"
                      disabled={!aiPrompt.trim()}
                      aria-label="Run Ask AI edit"
                    >
                      <Send size={13} />
                    </button>
                  )}
                </form>

                {!aiProposal && !aiBusy && (
                  <div className={styles.floatingQuickChips}>
                    {QUICK_AI_CHIPS.map((chip) => (
                      <button
                        key={chip.label}
                        type="button"
                        onMouseDown={(e) => e.preventDefault()}
                        onClick={() => void runInlineAi(chip.instruction, floating)}
                      >
                        {chip.label}
                      </button>
                    ))}
                  </div>
                )}

                {aiBusy && (
                  <div className={styles.floatingStatusLine}>
                    <Loader2 size={13} className={styles.spinIcon} />
                    <span>Rewriting selected passage in place…</span>
                  </div>
                )}

                {aiError && (
                  <div className={styles.floatingErrorLine} role="alert">
                    <span>{aiError}</span>
                    <button type="button" onClick={() => setAiError("")}>
                      Dismiss
                    </button>
                  </div>
                )}

                {aiProposal && (
                  <div className={styles.floatingProposalBox}>
                    <div className={styles.floatingProposalPreview}>
                      {aiProposal.text}
                    </div>
                    <div className={styles.floatingProposalActions}>
                      <button
                        type="button"
                        className={styles.primary}
                        onClick={() => {
                          if (!editor) return;
                          editor
                            .chain()
                            .focus()
                            .insertContentAt(
                              {
                                from: aiProposal.range.from,
                                to: aiProposal.range.to,
                              },
                              buildContentNodesFromText(aiProposal.text),
                            )
                            .run();
                          dismissFloating();
                        }}
                      >
                        <Check size={12} /> Replace
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          if (!editor) return;
                          const $to = editor.state.doc.resolve(aiProposal.range.to);
                          const insertAt =
                            $to.depth >= 1 ? $to.after(1) : aiProposal.range.to;
                          editor
                            .chain()
                            .focus()
                            .insertContentAt(
                              Math.min(insertAt, editor.state.doc.content.size),
                              buildContentNodesFromText(aiProposal.text),
                            )
                            .run();
                          dismissFloating();
                        }}
                      >
                        Insert Below
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          void runInlineAi(aiProposal.instruction, floating)
                        }
                      >
                        <RefreshCw size={12} /> Retry
                      </button>
                      <button type="button" onClick={() => setAiProposal(null)}>
                        Discard
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : null}
          </div>
        )}

        <div
          onContextMenu={(e) => {
            if (!editor) return;
            const { from, to } = editor.state.selection;
            let rangeFrom = from;
            let rangeTo = to;
            let selected = editor.state.doc.textBetween(from, to, " ");
            if (!selected.trim()) {
              const $pos = editor.state.doc.resolve(from);
              if ($pos.parent && $pos.depth >= 1) {
                rangeFrom = $pos.start($pos.depth);
                rangeTo = $pos.end($pos.depth);
                selected = editor.state.doc.textBetween(rangeFrom, rangeTo, " ");
              }
            }
            if (!selected.trim()) return;
            e.preventDefault();
            editor.commands.setTextSelection({ from: rangeFrom, to: rangeTo });
            const coords = computeCoordsForRange(rangeFrom, rangeTo, {
              x: e.clientX,
              y: e.clientY,
            });
            setAiProposal(null);
            setAiError("");
            setLinkPopoverOpen(false);
            setFloating({
              from: rangeFrom,
              to: rangeTo,
              text: selected,
              ...coords,
            });
            setAiPanelOpen(true);
          }}
        >
          <EditorContent editor={editor} />
        </div>
      </div>
    );
  },
);

export default ArticleEditor;
