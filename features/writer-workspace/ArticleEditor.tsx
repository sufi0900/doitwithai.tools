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
  getMarkRange,
  useEditor,
} from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { Plugin } from "@tiptap/pm/state";
import { Decoration, DecorationSet } from "@tiptap/pm/view";
import {
  ArrowDown,
  ArrowUp,
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
  ExternalLink,
  Pencil,
  Copy,
  Unlink,
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
  nodeMarkdown,
  patchWorkspace,
  projectDocument,
  safeImageSrc,
  safeUrl,
  syncDocument,
  workspace,
} from "./model";
import { termMatcher } from "./term-matches";
import { normalizeAiMarkdown } from "./instant-edits";
import type { ReadabilityHighlightToggles } from "./LeftStudioPanel";
import type { Project, RichNode } from "./types";
import styles from "./workspace.module.css";

export type EditorHandle = {
  selection: () => { from: number; to: number; text: string };
  replace: (from: number, to: number, text: string) => boolean;
  findRevisedPassage: (markdown: string, near: number) => { from: number; to: number; text: string } | undefined;
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

function buildContentNodesFromText(raw: string): RichNode[] {
  const text = normalizeAiMarkdown(raw);
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

/** Read-only rich preview of Markdown so lists/tables look like the real result. */
export function RichPreview({ md }: { md: string }) {
  const render = (n: RichNode, key: number): React.ReactNode => {
    const kids = (n.content || []).map(render);
    switch (n.type) {
      case "text": {
        let el: React.ReactNode = n.text || "";
        for (const m of n.marks || []) {
          if (m.type === "bold") el = <strong>{el}</strong>;
          else if (m.type === "italic") el = <em>{el}</em>;
          else if (m.type === "code") el = <code>{el}</code>;
          else if (m.type === "link" && safeUrl(m.attrs?.href))
            el = (
              <a href={safeUrl(m.attrs?.href)} target="_blank" rel="noopener noreferrer">
                {el}
              </a>
            );
        }
        return <React.Fragment key={key}>{el}</React.Fragment>;
      }
      case "hardBreak":
        return <br key={key} />;
      case "heading":
        return (
          <p key={key}>
            <strong>{kids}</strong>
          </p>
        );
      case "bulletList":
        return <ul key={key}>{kids}</ul>;
      case "orderedList":
        return <ol key={key}>{kids}</ol>;
      case "listItem":
        return <li key={key}>{kids}</li>;
      case "blockquote":
        return <blockquote key={key}>{kids}</blockquote>;
      case "table":
        return (
          <table key={key}>
            <tbody>{kids}</tbody>
          </table>
        );
      case "tableRow":
        return <tr key={key}>{kids}</tr>;
      case "tableHeader":
        return <th key={key}>{kids}</th>;
      case "tableCell":
        return <td key={key}>{kids}</td>;
      case "codeBlock":
        return (
          <pre key={key}>
            <code>{kids}</code>
          </pre>
        );
      default:
        return <p key={key}>{kids}</p>;
    }
  };
  const nodes = buildContentNodesFromText(md);
  const inlineOnly = nodes.every((n) => n.type === "text" || n.type === "hardBreak");
  return (
    <div className={styles.proposalRich}>
      {inlineOnly ? <p>{nodes.map(render)}</p> : nodes.map(render)}
    </div>
  );
}

type Props = {
  project: Project;
  toolbarEnd?: React.ReactNode;
  onChange: (doc: RichNode) => void;
  onEditVisual: (id: string) => void;
  onUpdateProject?: (updater: (p: Project) => Project) => void;
  highlights: boolean;
  highlightToggles?: ReadabilityHighlightToggles;
  targetGrade?: number;
  onSelection: (text: string) => void;
  onReady?: () => void;
  onInlineAiRewrite?: (
    instruction: string,
    range: { from: number; to: number; text: string },
    signal: AbortSignal,
    context?: { before: string; after: string; chatHistory?: Array<{ question: string; answer: string }> },
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

const EDIT_AI_CHIPS = [
  { label: "Rewrite", instruction: "Rewrite this passage clearly with sharper prose while keeping all facts intact." },
  { label: "Simplify", instruction: "Simplify complex phrasing and split dense sentences into plain English." },
  { label: "Add example", instruction: "Expand this point with one concrete, practical real-world example." },
  { label: "Shorten", instruction: "Shorten this passage while preserving its facts and qualifications." },
  { label: "Expand", instruction: "Expand the explanation with useful detail without inventing facts." },
];

const FORMAT_AI_CHIPS = [
  { label: "To bullets", instruction: "Convert this passage into crisp, scannable bullet points." },
  { label: "To numbered steps", instruction: "Convert the passage into ordered steps if it describes a sequence. Preserve prerequisites and explain if a sequence would be misleading." },
  { label: "To callout", instruction: "Turn the key message into a Markdown callout. Do not invent a quotation or attribution." },
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
    const searchRef = useRef<{ term: string; index: number } | null>(null);
    const [termNavigation, setTermNavigation] = useState<{ term: string; index: number; count: number } | null>(null);
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

    // Ask AI session lifecycle refs. `useEditor` captures its callbacks once, so
    // anything those callbacks read must live in refs that we refresh each render.
    const aiBusyRef = useRef(false);
    const aiProposalRef = useRef<unknown>(null);
    const aiPanelOpenRef = useRef(false);
    const linkPopoverOpenRef = useRef(false);
    const askRangeRef = useRef<{ from: number; to: number } | null>(null);
    const resetAiSessionRef = useRef<() => void>(() => {});
    const linkCardRef = useRef<HTMLDivElement | null>(null);
    const linkHideTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    aiBusyRef.current = aiBusy;
    aiProposalRef.current = aiProposal;
    aiPanelOpenRef.current = aiPanelOpen;
    linkPopoverOpenRef.current = linkPopoverOpen;
    // The highlighted Ask-AI target lives as long as the AI panel is open — it
    // survives focus loss, outside clicks, processing and the result card.
    const askRange =
      floating && (aiPanelOpen || aiBusy || aiProposal)
        ? { from: floating.from, to: floating.to }
        : null;
    askRangeRef.current = askRange;

    const [linkCard, setLinkCard] = useState<{
      href: string;
      x: number;
      y: number;
      from: number;
      to: number;
      sticky: boolean;
    } | null>(null);

    /** Closes the current Ask-AI/link session (never while a request is in flight). */
    const resetAiSession = (force = false) => {
      if (aiBusyRef.current && !force) return;
      aiAbortRef.current?.abort();
      setAiPanelOpen(false);
      setAiPrompt("");
      setAiBusy(false);
      setAiError("");
      setAiProposal(null);
      setLinkPopoverOpen(false);
    };
    resetAiSessionRef.current = () => resetAiSession();

    const dismissFloating = () => {
      resetAiSession(true);
      setFloating(null);
      setLinkCard(null);
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
                  const search = searchRef.current;
                  const matcher = search ? termMatcher(search.term) : null;
                  let matchIndex = 0;

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

                    if (matcher && search) {
                      for (const match of text.matchAll(matcher)) {
                        const from = pos + 1 + match.index;
                        const active = matchIndex++ === search.index;
                        list.push(Decoration.inline(from, from + match[0].length, {
                          class: active ? styles.hlSearchCurrent : styles.hlSearchMatch,
                        }));
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

                  // 3. Persistent Ask-AI target highlight while panel, processing, or proposal is open
                  const ask = askRangeRef.current;
                  if (ask && ask.to > ask.from) {
                    const docSize = state.doc.content.size;
                    const from = Math.max(0, Math.min(ask.from, docSize));
                    const to = Math.max(from, Math.min(ask.to, docSize));
                    if (to > from) {
                      list.push(
                        Decoration.inline(from, to, {
                          class: styles.askTargetInline,
                        }),
                      );
                      state.doc.nodesBetween(from, to, (node, pos) => {
                        if (node.isTextblock) {
                          list.push(
                            Decoration.node(pos, pos + node.nodeSize, {
                              class: styles.askTargetBlock,
                            }),
                          );
                          return false;
                        }
                      });
                    }
                  }

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

    const showLinkInfoCard = (
      anchor: HTMLAnchorElement,
      sticky: boolean,
    ) => {
      const ed = editorRef.current;
      const surf = surfaceRef.current;
      if (!ed || !surf) return;
      const href = safeUrl(anchor.getAttribute("href"));
      if (!href) return;
      if (linkHideTimerRef.current) {
        clearTimeout(linkHideTimerRef.current);
        linkHideTimerRef.current = null;
      }
      let from = 0;
      let to = 0;
      try {
        const pos = ed.view.posAtDOM(anchor, 0);
        const $pos = ed.state.doc.resolve(Math.min(pos + 1, ed.state.doc.content.size));
        const range = ed.state.schema.marks.link
          ? getMarkRange($pos, ed.state.schema.marks.link)
          : undefined;
        if (range) {
          from = range.from;
          to = range.to;
        } else {
          from = pos;
          to = Math.min(ed.state.doc.content.size, pos + (anchor.textContent?.length || 1));
        }
      } catch {
        // fallback coords still show URL cleanly
      }
      const aRect = anchor.getBoundingClientRect();
      const sRect = surf.getBoundingClientRect();
      const x = Math.max(12, Math.min(sRect.width - 340, aRect.left - sRect.left));
      const y = Math.max(66, aRect.bottom - sRect.top + 6);
      setLinkCard((prev) => ({
        href,
        x,
        y,
        from,
        to,
        sticky: sticky || Boolean(prev?.sticky && prev.href === href && prev.from === from),
      }));
    };

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
        handleDOMEvents: {
          mouseover(_view, event) {
            const target = event.target as HTMLElement | null;
            const anchor = target?.closest?.("a[href]") as HTMLAnchorElement | null;
            if (!anchor) return false;
            showLinkInfoCard(anchor, false);
            return false;
          },
          mouseout(_view, event) {
            const target = event.target as HTMLElement | null;
            const anchor = target?.closest?.("a[href]");
            if (!anchor) return false;
            const related = event.relatedTarget as globalThis.Node | null;
            if (
              related &&
              (anchor.contains(related) || linkCardRef.current?.contains(related))
            ) {
              return false;
            }
            if (linkHideTimerRef.current) clearTimeout(linkHideTimerRef.current);
            linkHideTimerRef.current = setTimeout(() => {
              setLinkCard((prev) => (prev && !prev.sticky ? null : prev));
            }, 200);
            return false;
          },
          click(_view, event) {
            const target = event.target as HTMLElement | null;
            const anchor = target?.closest?.("a[href]") as HTMLAnchorElement | null;
            if (!anchor) return false;
            event.preventDefault();
            showLinkInfoCard(anchor, true);
            return false;
          },
        },
      },
      onUpdate: ({ editor: ed, transaction }) => {
        if (transaction.docChanged && searchRef.current) {
          searchRef.current = null;
          setTermNavigation(null);
        }
        if (skipOnChangeRef.current) return;
        latest.current.onChange(ed.getJSON() as RichNode);
      },
      onSelectionUpdate: ({ editor: ed }) => {
        // Lock active Ask AI processing or result card against accidental editor clicks
        if (aiBusyRef.current || aiProposalRef.current) {
          return;
        }

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

        // Preserve active Link popover while editing a URL
        if (linkPopoverOpenRef.current) return;

        // Selecting/clicking another passage closes any idle Ask AI prompt and updates toolbar
        if (aiPanelOpenRef.current) {
          resetAiSessionRef.current();
        }

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
      if (editor) latest.current.onReady?.();
    }, [editor]);

    useEffect(() => {
      if (!editor) return;
      const desired = projectDocument(props.project);
      if (documentKey(editor.getJSON()) !== documentKey(desired)) {
        const selection = editor.state.selection;
        searchRef.current = null;
        setTermNavigation(null);
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
      if (!editor) return;
      editor.view.dispatch(editor.state.tr.setMeta("askTarget", true));
    }, [editor, askRange?.from, askRange?.to, Boolean(askRange)]);

    useEffect(() => {
      if (!floating && !linkPopoverOpen && !plusMenuOpen && !linkCard) return;
      const onKey = (e: KeyboardEvent) => {
        if (e.key === "Escape") {
          setPlusMenuOpen(false);
          setImageModalOpen(false);
          setLinkCard(null);
          if (!aiBusyRef.current && !aiProposalRef.current) {
            dismissFloating();
          }
        }
      };
      const onMouseDown = (e: MouseEvent) => {
        const target = e.target as globalThis.Node | null;
        if (linkCardRef.current && target && linkCardRef.current.contains(target)) {
          return;
        }
        if (target && !(target as HTMLElement).closest?.("a[href]")) {
          setLinkCard(null);
        }
        if (floatingRef.current && target && floatingRef.current.contains(target)) {
          return;
        }
        // Keep Ask AI locked while processing or displaying a proposal, even on clicks outside
        if (aiBusyRef.current || aiProposalRef.current) {
          return;
        }
        if (target && surfaceRef.current && !surfaceRef.current.contains(target)) {
          dismissFloating();
          setPlusMenuOpen(false);
        }
      };
      window.addEventListener("keydown", onKey);
      window.addEventListener("mousedown", onMouseDown);
      return () => {
        window.removeEventListener("keydown", onKey);
        window.removeEventListener("mousedown", onMouseDown);
      };
    }, [floating, linkPopoverOpen, plusMenuOpen, linkCard]);

    useEffect(() => () => aiAbortRef.current?.abort(), []);

    const clearTermNavigation = () => {
      searchRef.current = null;
      setTermNavigation(null);
      if (editor) editor.view.dispatch(editor.state.tr.setMeta("writerDisplay", true));
    };
    const navigateTerm = (term: string, requestedIndex: number) => {
      if (!editor) return false;
      const matcher = termMatcher(term);
      if (!matcher) return false;
      let count = 0;
      editor.state.doc.descendants((node) => {
        if (node.isTextblock) {
          count += Array.from(node.textBetween(0, node.content.size, "\n", "\n").matchAll(matcher)).length;
        }
      });
      if (!count) {
        clearTermNavigation();
        return false;
      }
      const index = ((requestedIndex % count) + count) % count;
      searchRef.current = { term, index };
      setTermNavigation({ term, index, count });
      editor.view.dispatch(editor.state.tr.setMeta("writerDisplay", true));
      requestAnimationFrame(() => {
        surfaceRef.current?.querySelector("." + styles.hlSearchCurrent)?.scrollIntoView({ behavior: "smooth", block: "center", inline: "nearest" });
      });
      return true;
    };

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
          if (!editor || !Number.isInteger(from) || !Number.isInteger(to) || from < 1 || to <= from || to > editor.state.doc.content.size) return false;
          let protectedNode = false;
          editor.state.doc.nodesBetween(from, to, (node) => {
            if (["image", "sectionVisual"].includes(node.type.name) ||
                (node.type.name === "heading" && Number(node.attrs.level) <= 2)) protectedNode = true;
          });
          if (protectedNode) return false;
          return editor.commands.insertContentAt({ from, to }, buildContentNodesFromText(text));
        },
        findRevisedPassage: (markdown, near) => {
          if (!editor) return;
          const expected = markdownNodes(markdown);
          if (expected.length !== 1 || expected[0].type !== "paragraph") return;
          const plain = (expected[0].content || []).map((node) => node.type === "text" ? node.text || "" : "").join("");
          if (!plain.trim() || expected[0].content?.some((node) => node.type !== "text")) return;
          const matches: Array<{ from: number; to: number; text: string }> = [];
          editor.state.doc.descendants((node, pos) => {
            if (node.type.name !== "paragraph" || !node.textContent.includes(plain)) return;
            let allText = true;
            node.forEach((child) => { if (!child.isText) allText = false; });
            if (!allText) return;
            for (let offset = node.textContent.indexOf(plain); offset >= 0; offset = node.textContent.indexOf(plain, offset + 1)) {
              matches.push({ from: pos + 1 + offset, to: pos + 1 + offset + plain.length, text: markdown });
              if (matches.length > 1) break;
            }
          });
          return matches.length === 1 && Math.abs(matches[0].from - near) <= 1 ? matches[0] : undefined;
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
        highlightAndScrollToTerm: (term) => navigateTerm(term, 0),
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

    const sliceToMarkdown = (from: number, to: number): string => {
      if (!editor || from < 0 || to > editor.state.doc.content.size) return "";
      try {
        const sliced = editor.state.doc.slice(from, to).content.toJSON() as RichNode[];
        const md = nodeMarkdown({ type: "doc", content: sliced }).trim();
        if (md) return md;
      } catch {
        // fallback to plain text below
      }
      return editor.state.doc.textBetween(from, to, "\n");
    };

    const runInlineAi = async (
      instruction: string,
      target: FloatingToolbarState,
    ) => {
      if (!instruction.trim()) return;
      if (!editor || target.to > editor.state.doc.content.size) {
        setAiError("The selected passage changed. Close Ask AI and select the text again.");
        return;
      }
      const sourceDocument = editor.state.doc;
      const selectionMd = sliceToMarkdown(target.from, target.to) || target.text;
      if (!latest.current.onInlineAiRewrite) {
        latest.current.onTellAi?.(
          instruction,
          { from: target.from, to: target.to, text: selectionMd },
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
      const docSize = editor?.state.doc.content.size ?? target.to;
      const contextBefore = editor
        ? editor.state.doc.textBetween(Math.max(0, target.from - 650), target.from, "\n")
        : "";
      const contextAfter = editor
        ? editor.state.doc.textBetween(target.to, Math.min(docSize, target.to + 650), "\n")
        : "";
      try {
        const resultText = await latest.current.onInlineAiRewrite(
          instruction,
          { from: target.from, to: target.to, text: selectionMd },
          ctrl.signal,
          {
            before: contextBefore,
            after: contextAfter,
          },
        );
        if (ctrl.signal.aborted) return;
        if (editor.state.doc !== sourceDocument) {
          setAiError("The article changed while Ask AI was working. Select the passage again.");
          return;
        }
        setAiProposal({
          instruction,
          text: normalizeAiMarkdown(resultText),
          range: { from: target.from, to: target.to, text: selectionMd },
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
          {props.toolbarEnd}
        </div>

        {termNavigation && (
          <div className={styles.termNavigator} aria-label="Find in draft">
            <span title={termNavigation.term}>{termNavigation.term}</span>
            <small role="status">{termNavigation.index + 1} of {termNavigation.count}</small>
            <button type="button" aria-label="Previous match" disabled={termNavigation.count < 2}
              onClick={() => navigateTerm(termNavigation.term, termNavigation.index - 1)}><ArrowUp size={14} /></button>
            <button type="button" aria-label="Next match" disabled={termNavigation.count < 2}
              onClick={() => navigateTerm(termNavigation.term, termNavigation.index + 1)}><ArrowDown size={14} /></button>
            <button type="button" aria-label="Close term navigation" onClick={clearTermNavigation}><X size={14} /></button>
          </div>
        )}

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
              left: floating.x, top: floating.y, maxWidth: floating.maxWidth,
              maxHeight: "min(70dvh, 550px)", overflowY: "auto",
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
                <span>{props.toolbarEnd ? "Ask Article AI" : "Ask AI"}</span>
              </button>

              <span className={styles.floatingDivider} />

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
                    placeholder="Describe an edit…"
                    maxLength={2000}
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
                    <>
                      <button
                        type="submit"
                        disabled={!aiPrompt.trim()}
                        aria-label="Run Ask AI edit"
                      >
                        <Send size={13} />
                      </button>
                      <button
                        type="button"
                        aria-label="Close Ask AI"
                        title="Close Ask AI"
                        onClick={() => resetAiSession(false)}
                      >
                        <X size={13} />
                      </button>
                    </>
                  )}
                </form>

                {!aiBusy && (
                  <div className={styles.floatingQuickChips} style={{ marginBlock: 3 }}>
                    <button type="button" className={styles.openArticleAssistant} aria-haspopup="dialog" onClick={() => {
                      const range = { ...floating, text: sliceToMarkdown(floating.from, floating.to) || floating.text };
                      latest.current.onTellAi?.("", range, true);
                      dismissFloating();
                    }}><Sparkles size={13} /> Open in Article AI</button>
                  </div>
                )}

                {!aiProposal && !aiBusy && [
                  { title: "Edit text", chips: EDIT_AI_CHIPS },
                  { title: "Convert format", chips: FORMAT_AI_CHIPS },
                ].map(({ title, chips }) => (
                  <div key={title}>
                    <strong>{title}</strong>
                    <div className={styles.floatingQuickChips}>
                      {chips.map((chip) => (
                        <button key={chip.label} type="button"
                          onMouseDown={(e) => e.preventDefault()}
                          onClick={() => void runInlineAi(chip.instruction, floating)}>
                          {chip.label}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}

                {aiBusy && (
                  <div className={styles.floatingStatusLine}>
                    <Loader2 size={13} className={styles.spinIcon} />
                    <span>Working on the selected passage…</span>
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
                      <RichPreview md={aiProposal.text} />
                    </div>
                    <div className={styles.floatingProposalActions}>
                      <button
                        type="button"
                        className={styles.primary}
                        onClick={() => {
                          if (!editor) return;
                          if (sliceToMarkdown(aiProposal.range.from, aiProposal.range.to) !== aiProposal.range.text) {
                            setAiError("The selected passage changed. Select it again before applying an edit.");
                            return;
                          }
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
                          if (sliceToMarkdown(aiProposal.range.from, aiProposal.range.to) !== aiProposal.range.text) {
                            setAiError("The selected passage changed. Select it again before applying an edit.");
                            return;
                          }
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
                      <button type="button" onClick={() => dismissFloating()}>
                        Discard
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : null}
          </div>
        )}

        {/* Link Hover / Click Inspector Popover */}
        {linkCard && (
          <div
            ref={linkCardRef}
            className={styles.linkInfoCard}
            style={{ left: linkCard.x, top: linkCard.y }}
            onMouseEnter={() => {
              if (linkHideTimerRef.current) {
                clearTimeout(linkHideTimerRef.current);
                linkHideTimerRef.current = null;
              }
            }}
            onMouseLeave={() => {
              if (!linkCard.sticky) {
                linkHideTimerRef.current = setTimeout(() => {
                  setLinkCard((prev) => (prev && !prev.sticky ? null : prev));
                }, 180);
              }
            }}
          >
            {(() => {
              let isInternal = false;
              try {
                const uHost = new URL(linkCard.href).hostname.replace(/^www\./, "");
                const siteHost = props.project.brandSiteUrl
                  ? new URL(safeUrl(props.project.brandSiteUrl) || "https://doitwithai.tools").hostname.replace(/^www\./, "")
                  : "doitwithai.tools";
                isInternal = uHost === siteHost || uHost.endsWith(`.${siteHost}`);
              } catch {}
              return (
                <span
                  className={`${styles.linkInfoKind} ${!isInternal ? styles.linkInfoKindExternal : ""}`}
                >
                  {isInternal ? "Internal" : "External"}
                </span>
              );
            })()}
            <a
              className={styles.linkInfoUrl}
              href={linkCard.href}
              target="_blank"
              rel="noopener noreferrer"
              title={linkCard.href}
            >
              {linkCard.href}
            </a>
            <button
              type="button"
              title="Open link in new tab"
              onClick={() => window.open(linkCard.href, "_blank", "noopener,noreferrer")}
            >
              <ExternalLink size={12} /> Open
            </button>
            <button
              type="button"
              title="Copy URL"
              onClick={() => {
                void navigator.clipboard?.writeText(linkCard.href);
                setNotice("Link URL copied.");
              }}
            >
              <Copy size={12} />
            </button>
            <button
              type="button"
              title="Edit link URL"
              onClick={() => {
                if (!editor || linkCard.to <= linkCard.from) return;
                const coords = computeCoordsForRange(linkCard.from, linkCard.to);
                const selected = editor.state.doc.textBetween(linkCard.from, linkCard.to, " ");
                setFloating({
                  from: linkCard.from,
                  to: linkCard.to,
                  text: selected || linkCard.href,
                  ...coords,
                });
                setAiPanelOpen(false);
                setLinkTargetRange({ from: linkCard.from, to: linkCard.to });
                setLinkValue(linkCard.href);
                setLinkPopoverOpen(true);
                setLinkCard(null);
              }}
            >
              <Pencil size={12} /> Edit
            </button>
            <button
              type="button"
              title="Remove link"
              onClick={() => {
                if (!editor || linkCard.to <= linkCard.from) return;
                editor
                  .chain()
                  .focus()
                  .setTextSelection({ from: linkCard.from, to: linkCard.to })
                  .unsetMark("link")
                  .run();
                setLinkCard(null);
              }}
            >
              <Unlink size={12} />
            </button>
            <button
              type="button"
              aria-label="Close link preview"
              onClick={() => setLinkCard(null)}
            >
              <X size={12} />
            </button>
          </div>
        )}

        <div
          onContextMenu={(e) => {
            if (!editor || aiBusyRef.current || aiProposalRef.current) return;
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
