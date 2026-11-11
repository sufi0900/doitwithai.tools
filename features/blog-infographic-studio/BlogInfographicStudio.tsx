"use client";
import React, {
  useDeferredValue,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  ArrowDown,
  ArrowUp,
  Check,
  ChevronDown,
  Copy,
  Download,
  FileCode2,
  FolderArchive,
  Image as ImageIcon,
  Plus,
  Printer,
  Redo2,
  RotateCcw,
  Sparkles,
  Trash2,
  Undo2,
  Upload,
  ZoomIn,
  ZoomOut,
} from "lucide-react";
import { UrlArticleExtractorBar } from "@/features/tool-ui/UrlArticleExtractorBar";
import { printCanvasAsPdfPoster } from "@/features/tool-ui/visualCardExport";
import type {
  BlogInfographicConfig,
  BlogInfographicNodeItem,
  BlogSectionNode,
} from "@/lib/blog-writer/canonical-state";
import {
  PRISM_LAYOUTS,
  autoRecommendPrismLayout,
  buildSectionVisual,
  createPrismSample,
  sectionFromText,
  visualFromWriterSection,
  withPrismLayout,
} from "@/lib/blog-infographic-studio/visual-brief";
import type { PrismLayout } from "@/lib/blog-infographic-studio/visual-brief";
import { autoRecommendInfographicTemplate } from "@/lib/blog-writer/deterministic-analyzers";
import { BLOG_INFOGRAPHIC_25_TEMPLATES } from "@/lib/blog-infographic-studio/templates";
import {
  ASPECT_RATIO_DIMENSIONS,
  BLOG_INFOGRAPHIC_PALETTES,
  buildInfographicScene,
  createSampleInfographicConfig,
  generateBlogInfographicSvg,
  isSafeInfographicImage,
  renderBlogInfographicToCanvas,
  renderBlogInfographicToPngDataUrl,
} from "@/lib/blog-infographic-studio/canvas-renderer";
import {
  importInfographicProject,
  patchInfographic,
  selectInfographicTemplate,
} from "@/lib/blog-infographic-studio/project";

export interface BlogInfographicStudioProps {
  mode?: "standalone" | "embedded-modal";
  initialConfig?: BlogInfographicConfig;
  sourceSection?: BlogSectionNode;
  onSaveConfig?: (updated: BlogInfographicConfig) => void;
  onClose?: () => void;
}

const uid = () =>
  `id-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;

const field =
  "mt-1.5 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-900 shadow-2xs focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 dark:border-slate-700 dark:bg-slate-950 dark:text-white";
const button =
  "inline-flex items-center justify-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 shadow-2xs transition hover:border-indigo-400 hover:text-indigo-600 disabled:cursor-not-allowed disabled:opacity-45 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:border-indigo-400";
const primary =
  "inline-flex items-center justify-center gap-1.5 rounded-xl bg-indigo-600 px-3.5 py-2 text-xs font-bold text-white shadow-xs transition hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-45";

function svgSource(svg: string) {
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}

function saveFile(blob: Blob, name: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = name;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1500);
}

function escapeHtml(s: string) {
  return String(s || "").replace(
    /[&<>"']/g,
    (c) =>
      ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;",
      })[c] || c,
  );
}

function PrismTemplateCard({
  config,
  layout,
  onSelect,
}: {
  config: BlogInfographicConfig;
  layout: PrismLayout;
  onSelect: () => void;
}) {
  const spec = PRISM_LAYOUTS.find((l) => l.id === layout)!;
  const candidate = useMemo(
    () => withPrismLayout(config, layout),
    [config, layout],
  );
  const scene = useMemo(() => buildInfographicScene(candidate), [candidate]);
  const dims =
    ASPECT_RATIO_DIMENSIONS[candidate.aspectRatio] ||
    ASPECT_RATIO_DIMENSIONS["4:5"];
  const selected =
    config.visualEngine === "prism-antv" && config.prismLayout === layout;
  return (
    <button
      type="button"
      aria-pressed={selected}
      onClick={onSelect}
      className={`group flex flex-col overflow-hidden rounded-2xl border-2 text-left transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 ${
        selected
          ? "border-indigo-500 bg-indigo-50/70 shadow-md dark:bg-indigo-950/35"
          : "border-slate-200/80 bg-white hover:border-indigo-300 dark:border-slate-800 dark:bg-slate-900"
      }`}
    >
      <div className="relative flex h-72 w-full items-center justify-center overflow-hidden bg-slate-100/90 p-3 dark:bg-slate-950/80">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={svgSource(scene.svg)}
          alt={`${spec.name} with your current text`}
          loading="lazy"
          className="h-full w-full object-contain drop-shadow-md transition-transform duration-200 group-hover:scale-[1.01]"
        />
        <span className="pointer-events-none absolute right-2.5 top-2.5 rounded-md bg-slate-900/75 px-2 py-0.5 text-[10px] font-bold text-white backdrop-blur-xs">
          {dims.width} × {dims.height}
        </span>
      </div>
      <div className="flex flex-1 flex-col justify-between border-t border-slate-200/80 bg-white p-3.5 dark:border-slate-800 dark:bg-slate-900">
        <div>
          <p className="text-sm font-bold text-slate-900 dark:text-white">
            {selected ? "✓ " : ""}
            {spec.name}
          </p>
          <p className="mt-1 text-xs leading-relaxed text-slate-500 dark:text-slate-300">
            {spec.description}
          </p>
        </div>
        {scene.issues.length > 0 && (
          <p className="mt-2 text-xs font-semibold text-amber-700 dark:text-amber-300">
            Needs a text adjustment
          </p>
        )}
      </div>
    </button>
  );
}

function TemplateCard({
  config,
  id,
  selected,
  onSelect,
}: {
  config: BlogInfographicConfig;
  id: number;
  selected: boolean;
  onSelect: () => void;
}) {
  const spec = BLOG_INFOGRAPHIC_25_TEMPLATES[id - 1];
  const scene = useMemo(
    () => buildInfographicScene(selectInfographicTemplate(config, id)),
    [config, id],
  );
  return (
    <button
      type="button"
      aria-pressed={selected}
      onClick={onSelect}
      className={`flex flex-col overflow-hidden rounded-xl border-2 text-left transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 ${
        selected
          ? "border-indigo-500 bg-indigo-50 dark:bg-indigo-950/30"
          : "border-transparent bg-slate-100 hover:border-indigo-300 dark:bg-slate-800"
      }`}
    >
      <div className="relative flex h-52 w-full items-center justify-center overflow-hidden bg-slate-200/60 p-2.5 dark:bg-slate-950/50">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={svgSource(scene.svg)}
          alt={`${spec.name} preview`}
          loading="lazy"
          className="h-full w-full object-contain shadow-sm"
        />
      </div>
      <div className="border-t border-slate-200/60 p-3 dark:border-slate-700/60">
        <p className="text-[10px] font-bold uppercase tracking-wider text-indigo-500">
          #{spec.id} · {spec.family}
        </p>
        <p className="mt-0.5 text-sm font-bold text-slate-900 dark:text-white">
          {selected ? "✓ " : ""}
          {spec.name}
        </p>
        <p className="mt-1 text-xs text-slate-500 dark:text-slate-300">
          {spec.bestForSectionType}
        </p>
      </div>
    </button>
  );
}

const familyLabels = [
  "All 25",
  "Steps & Process",
  "Compare",
  "Numbers & Charts",
  "Frameworks",
  "Checklists",
  "Blog Covers",
] as const;

function familyIndex(id: number) {
  if (id <= 5) return 1;
  if (id <= 10) return 2;
  if (id <= 15) return 3;
  if (id <= 19) return 4;
  if (id <= 24) return 5;
  return 6;
}

export function BlogInfographicStudio({
  mode = "standalone",
  initialConfig,
  sourceSection,
  onSaveConfig,
  onClose,
}: BlogInfographicStudioProps) {
  const [cards, setCards] = useState<BlogInfographicConfig[]>(() => [
    initialConfig || createPrismSample(),
  ]);
  const [activeIdx, setActiveIdx] = useState(0),
    [panel, setPanel] = useState<"content" | "design" | "brand">("content"),
    [family, setFamily] = useState(0),
    [query, setQuery] = useState(""),
    [paste, setPaste] = useState(""),
    [toast, setToast] = useState(""),
    [error, setError] = useState(""),
    [busy, setBusy] = useState(false),
    [zoom, setZoom] = useState(1);
  const [classicOpen, setClassicOpen] = useState(false);
  const [past, setPast] = useState<BlogInfographicConfig[][]>([]),
    [future, setFuture] = useState<BlogInfographicConfig[][]>([]);
  const toastTimer = useRef<ReturnType<typeof setTimeout>>();
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const projectInputRef = useRef<HTMLInputElement | null>(null);
  const logoInputRef = useRef<HTMLInputElement | null>(null);

  const active = cards[activeIdx] || cards[0];
  const deferred = useDeferredValue(active);
  const scene = useMemo(() => buildInfographicScene(active), [active]);
  const dims =
    ASPECT_RATIO_DIMENSIONS[active.aspectRatio] ||
    ASPECT_RATIO_DIMENSIONS["4:5"];
  const spec =
    BLOG_INFOGRAPHIC_25_TEMPLATES.find((t) => t.id === active.templateId) ||
    BLOG_INFOGRAPHIC_25_TEMPLATES[0];

  const templates = useMemo(
    () =>
      BLOG_INFOGRAPHIC_25_TEMPLATES.filter((t) => {
        if (family !== 0 && familyIndex(t.id) !== family) return false;
        if (!query.trim()) return true;
        const q = query.toLowerCase();
        return (
          t.name.toLowerCase().includes(q) ||
          t.family.toLowerCase().includes(q) ||
          t.bestForSectionType.toLowerCase().includes(q)
        );
      }),
    [family, query],
  );

  function notify(msg: string) {
    setError("");
    setToast(msg);
    if (toastTimer.current) clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(""), 3800);
  }

  function commit(next: BlogInfographicConfig[]) {
    setPast((p) => [...p.slice(-24), cards]);
    setFuture([]);
    setCards(next);
  }

  function update(patch: Partial<BlogInfographicConfig>) {
    setError("");
    const merged = patchInfographic(active, patch);
    const finalized =
      merged.visualEngine === "prism-antv"
        ? withPrismLayout(merged, merged.prismLayout || "editorial")
        : merged;
    commit(cards.map((c, i) => (i === activeIdx ? finalized : c)));
  }

  function updateNode(id: string, patch: Partial<BlogInfographicNodeItem>) {
    update({
      nodes: active.nodes.map((n) => (n.id === id ? { ...n, ...patch } : n)),
    });
  }

  function updateBrand(
    patch: Partial<NonNullable<BlogInfographicConfig["brand"]>>,
  ) {
    update({
      brand: {
        ...active.brand,
        ...patch,
      },
    });
  }

  function choose(id: number) {
    update(selectInfographicTemplate(active, id));
  }

  useEffect(() => {
    const onSelect = (e: Event) => {
      const detail = (e as CustomEvent<{ templateId?: number }>).detail;
      if (detail?.templateId) {
        setCards((curr) =>
          curr.map((c, i) =>
            i === activeIdx
              ? selectInfographicTemplate(c, detail.templateId!)
              : c,
          ),
        );
      }
    };
    window.addEventListener("select-blog-infographic-template", onSelect);
    return () =>
      window.removeEventListener("select-blog-infographic-template", onSelect);
  }, [activeIdx]);

  useEffect(() => {
    if (!canvasRef.current) return;
    void renderBlogInfographicToCanvas(canvasRef.current, active).catch(
      () => {},
    );
  }, [active]);

  const filename =
    (active.headline || "infographic")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "")
      .slice(0, 60) || "infographic";

  async function run(task: () => Promise<void>) {
    setError("");
    setBusy(true);
    try {
      await task();
    } catch (e) {
      setError(
        e instanceof Error
          ? e.message
          : "Fix the reported issues before exporting.",
      );
    } finally {
      setBusy(false);
    }
  }

  async function handleLogoUpload(file: File) {
    if (!["image/png", "image/jpeg", "image/webp"].includes(file.type)) {
      setError("Upload a PNG, JPG, or WebP logo file.");
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      setError("Logo image must be under 2 MB.");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = String(reader.result || "");
      if (!isSafeInfographicImage(dataUrl)) {
        setError("Unsupported logo image format.");
        return;
      }
      updateBrand({ logoDataUrl: dataUrl });
      notify("Logo applied to your infographic.");
    };
    reader.readAsDataURL(file);
  }

  function addSection() {
    if (cards.length >= 12) return;
    const card = {
      ...createPrismSample(),
      paletteId: active.paletteId,
      id: uid(),
      sectionId: uid(),
      headline: "Your next section",
      subheadline: "Paste the section body to create its visual summary.",
      nodes: [],
      visualBrief: undefined,
      footerSourceLabel: "Source: supplied section text",
      altText: "",
      brand: { ...active.brand },
    };
    commit([...cards, card]);
    setActiveIdx(cards.length);
  }

  function pastePoints() {
    if (
      paste.length > 90000 ||
      paste.split(/\n+/).filter((s) => s.trim()).length > 1200
    ) {
      setError(
        "This section exceeds the source limit (90,000 characters or 1,200 blocks). Split it into smaller sections before creating a visual.",
      );
      return;
    }
    const headline =
      paste.match(/^#{1,2}\s+([^\n]+)/m)?.[1]?.trim() || active.headline;
    const result = buildSectionVisual(
      sectionFromText(headline, paste, active.sectionId),
    );
    if (result.nodes.length < 2) {
      setError(
        "Paste at least two explanatory points, not just headings. Include the section body.",
      );
      return;
    }
    update({
      ...withPrismLayout(
        {
          ...active,
          headline,
          subheadline: "",
          nodes: result.nodes,
          visualBrief: result.brief,
          altText: `${headline}: ${result.nodes.map((n) => n.title).join("; ")}`,
          footerSourceLabel: active.footerSourceLabel.includes(
            "Illustrative framework",
          )
            ? "Source: supplied section text"
            : active.footerSourceLabel,
        },
        active.prismLayout || "editorial",
      ),
    });
    notify(
      "Created a source-based draft. Check the explanations and source coverage before exporting.",
    );
  }

  return (
    <div
      id="tool-studio-workspace"
      className="mx-auto max-w-7xl space-y-5 text-slate-900 dark:text-white"
    >
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
            Blog Section Infographic Studio
          </p>
          <h2 className="text-lg font-extrabold text-slate-900 dark:text-white">
            Turn section explanations into clear, editable visuals
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Pre-built template dimensions · 9 original editorial layouts + 25
            classic layouts
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <a
            className={button + " lg:hidden"}
            href={`#${mode}-infographic-preview`}
          >
            See preview
          </a>
          <button
            type="button"
            className={button}
            disabled={!past.length}
            onClick={() => {
              const prev = past[past.length - 1];
              setPast((p) => p.slice(0, -1));
              setFuture((f) => [cards, ...f]);
              setCards(prev);
            }}
          >
            <Undo2 size={14} />
            Undo
          </button>
          <button
            type="button"
            className={button}
            disabled={!future.length}
            onClick={() => {
              const [next, ...rest] = future;
              setFuture(rest);
              setPast((p) => [...p, cards]);
              setCards(next);
            }}
          >
            <Redo2 size={14} />
            Redo
          </button>
          {mode === "embedded-modal" && onSaveConfig && (
            <button
              type="button"
              className={primary}
              onClick={() => onSaveConfig(active)}
            >
              <Check size={14} />
              Save to section
            </button>
          )}
          {mode === "embedded-modal" && onClose && (
            <button type="button" className={button} onClick={onClose}>
              Close
            </button>
          )}
        </div>
      </div>

      {toast && (
        <div
          role="status"
          className="rounded-xl border border-emerald-300 bg-emerald-50 px-4 py-2.5 text-xs font-semibold text-emerald-800 dark:border-emerald-500/40 dark:bg-emerald-950/40 dark:text-emerald-200"
        >
          {toast}
        </div>
      )}
      {error && (
        <div
          role="alert"
          className="rounded-xl border border-rose-300 bg-rose-50 px-4 py-2.5 text-xs font-semibold text-rose-800 dark:border-rose-500/40 dark:bg-rose-950/40 dark:text-rose-200"
        >
          {error}
        </div>
      )}

      {mode === "standalone" && (
        <details
          open
          className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900"
        >
          <summary className="flex cursor-pointer items-center justify-between text-sm font-bold text-slate-800 dark:text-white">
            <span className="flex items-center gap-2">
              <Sparkles size={16} className="text-indigo-500" />
              Start from an article URL
            </span>
            <ChevronDown size={16} />
          </summary>
          <div className="mt-4">
            <UrlArticleExtractorBar
              extractionPurpose="infographic"
              label="Create from an article section"
              buttonLabel="Read article sections"
              onExtracted={(data) => {
                const section = data.sections?.find(
                  (s) => s.id === data.selectedSectionId,
                );
                const input =
                  section || sectionFromText(data.title, data.cleanText);
                const result = buildSectionVisual(input, data.url);
                if (result.nodes.length < 2) {
                  setError(
                    result.brief.warnings.join(" ") ||
                      "Choose a section with explanatory text, not just a heading.",
                  );
                  return;
                }
                const next = withPrismLayout(
                  {
                    ...active,
                    id: active.id,
                    sectionId: input.id,
                    headline: input.title,
                    subheadline: "",
                    nodes: result.nodes,
                    visualBrief: {
                      ...result.brief,
                      articleCoverage: data.coverage,
                    },
                    footerSourceLabel: `Source: ${data.domain}`,
                    altText: `${input.title}: ${result.nodes.map((n) => n.title).join("; ")}`,
                  },
                  active.prismLayout || "editorial",
                );
                // Selecting a source replaces the current visual; it never creates a separate card for every paragraph.
                update(next);
                notify(
                  `${result.nodes.length} supported points from the selected section.${data.coverage?.truncated ? " Article exceeded extraction limits; inspect source coverage." : " Review the source text before publishing."}`,
                );
              }}
            />
          </div>
        </details>
      )}

      {mode === "standalone" && (
        <div className="flex flex-wrap items-center gap-2">
          {cards.map((c, i) => (
            <button
              key={c.id}
              type="button"
              onClick={() => setActiveIdx(i)}
              className={`rounded-xl border px-3 py-1.5 text-xs font-bold transition ${
                i === activeIdx
                  ? "border-indigo-600 bg-indigo-600 text-white"
                  : "border-slate-200 bg-white text-slate-700 hover:border-indigo-400 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
              }`}
            >
              Section {i + 1}: {(c.headline || "Untitled").slice(0, 24)}
            </button>
          ))}
          <button
            type="button"
            className={button}
            disabled={cards.length >= 12}
            onClick={addSection}
          >
            <Plus size={14} />
            Add section
          </button>
          {cards.length > 1 && (
            <button
              type="button"
              className={button}
              onClick={() => {
                const next = cards.filter((_, i) => i !== activeIdx);
                commit(next);
                setActiveIdx(Math.max(0, activeIdx - 1));
              }}
            >
              <Trash2 size={14} />
              Remove section
            </button>
          )}
        </div>
      )}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[380px_minmax(0,1fr)]">
        <aside className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div
            role="tablist"
            aria-label="Editor controls"
            className="grid grid-cols-3 border-b border-slate-200 bg-slate-50 p-1.5 dark:border-slate-800 dark:bg-slate-950"
          >
            {(["content", "design", "brand"] as const).map((t) => (
              <button
                key={t}
                id={`infographic-tab-${t}`}
                type="button"
                role="tab"
                aria-selected={panel === t}
                aria-controls={`infographic-panel-${t}`}
                tabIndex={panel === t ? 0 : -1}
                onClick={() => setPanel(t)}
                className={`rounded-xl py-2 text-xs font-bold capitalize transition ${
                  panel === t
                    ? "bg-white text-indigo-600 shadow-2xs dark:bg-slate-900 dark:text-indigo-400"
                    : "text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
                }`}
              >
                {t}
              </button>
            ))}
          </div>

          <div
            id={`infographic-panel-${panel}`}
            role="tabpanel"
            aria-labelledby={`infographic-tab-${panel}`}
            className="space-y-6 p-4 sm:p-5 lg:max-h-[calc(100vh-190px)] lg:overflow-y-auto"
          >
            {panel === "content" && (
              <>
                {sourceSection && (
                  <button
                    type="button"
                    className={primary + " w-full"}
                    onClick={() => {
                      const result = visualFromWriterSection(sourceSection);
                      if (result.nodes.length < 2) {
                        setError(
                          "Write the section body first. An outline alone cannot provide explanations.",
                        );
                        return;
                      }
                      update(result);
                      notify(
                        "Rebuilt from this writer section’s body. Review the draft before saving.",
                      );
                    }}
                  >
                    Build from this section’s content
                  </button>
                )}
                {active.visualBrief && (
                  <details className="rounded-xl border border-indigo-200 bg-indigo-50/50 p-3 text-xs dark:border-indigo-500/30 dark:bg-indigo-950/30">
                    <summary className="cursor-pointer font-bold text-indigo-700 dark:text-indigo-300">
                      Source & coverage ·{" "}
                      {
                        new Set(
                          active.nodes.flatMap((n) => n.sourceBlockIds || []),
                        ).size
                      }{" "}
                      cited blocks /{" "}
                      {
                        active.visualBrief.sourceBlocks.filter(
                          (b) => b.kind !== "heading",
                        ).length
                      }{" "}
                      source blocks
                    </summary>
                    <p className="mt-3 leading-relaxed text-slate-600 dark:text-slate-300">
                      This is an extractive draft, not a fact check. Read the
                      source and edit for clarity.{" "}
                      {active.visualBrief.excludedBlocks} unsuitable blocks
                      excluded; {active.visualBrief.omittedPoints} additional
                      points kept in the source below.
                    </p>
                    {active.visualBrief.sourceUrl && (
                      <a
                        className="mt-2 inline-block font-bold text-indigo-600 underline dark:text-indigo-300"
                        href={active.visualBrief.sourceUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        Open source article
                      </a>
                    )}
                    {active.visualBrief.articleCoverage && (
                      <p className="mt-2 text-slate-600 dark:text-slate-300">
                        Article coverage:{" "}
                        {active.visualBrief.articleCoverage.sectionsIncluded}/
                        {active.visualBrief.articleCoverage.sectionsFound}{" "}
                        sections and{" "}
                        {active.visualBrief.articleCoverage.blocksIncluded}/
                        {active.visualBrief.articleCoverage.blocksFound} blocks.
                        {active.visualBrief.articleCoverage.truncated
                          ? " Extraction limit reached. Paste missing section text manually."
                          : ""}
                      </p>
                    )}
                    {active.visualBrief.warnings.map((w, i) => (
                      <p
                        key={i}
                        className="mt-2 text-amber-700 dark:text-amber-300"
                      >
                        {w}
                      </p>
                    ))}
                    <div className="mt-3 max-h-64 space-y-3 overflow-auto">
                      {active.visualBrief.sourceBlocks.map((b) => (
                        <p
                          key={b.id}
                          className="whitespace-pre-wrap leading-relaxed text-slate-600 dark:text-slate-300"
                        >
                          <span className="font-bold">
                            {b.kind === "heading"
                              ? b.text
                              : b.heading
                                ? `${b.heading}: `
                                : ""}
                          </span>
                          {b.kind !== "heading" && b.text}
                        </p>
                      ))}
                    </div>
                  </details>
                )}
                <div className="space-y-4">
                  <label className="block text-xs font-bold text-slate-600 dark:text-slate-300">
                    Headline
                    <input
                      className={field}
                      maxLength={140}
                      value={active.headline}
                      onChange={(e) => update({ headline: e.target.value })}
                    />
                  </label>
                  <label className="block text-xs font-bold text-slate-600 dark:text-slate-300">
                    Subtitle
                    <textarea
                      className={field}
                      rows={2}
                      maxLength={240}
                      value={active.subheadline}
                      onChange={(e) => update({ subheadline: e.target.value })}
                    />
                  </label>
                </div>
                <details className="rounded-xl border border-indigo-200 bg-indigo-50/70 p-3 dark:border-indigo-500/30 dark:bg-indigo-950/30">
                  <summary className="cursor-pointer text-xs font-bold text-indigo-700 dark:text-indigo-300">
                    Create from section text
                  </summary>
                  <p className="mt-2 text-xs leading-relaxed text-slate-500 dark:text-slate-400">
                    Paste paragraphs or lists, including their explanations.
                    Subheadings help identify the main concepts. No facts or
                    statistics are invented.
                  </p>
                  <textarea
                    aria-label="Section text for infographic"
                    className={field}
                    rows={5}
                    value={paste}
                    onChange={(e) => setPaste(e.target.value)}
                    placeholder="Paste a blog section with headings and explanatory paragraphs..."
                  />
                  <button
                    type="button"
                    className={primary + " mt-2.5 w-full"}
                    onClick={pastePoints}
                  >
                    Build points from text
                  </button>
                </details>
                <div>
                  <div className="mb-2 flex items-center justify-between">
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                      Your points{" "}
                      <span className="text-slate-400">
                        {active.nodes.length}/{active.visualEngine ? 6 : 8}
                      </span>
                    </h3>
                    <button
                      type="button"
                      className={button}
                      disabled={
                        active.nodes.length >= (active.visualEngine ? 6 : 8)
                      }
                      onClick={() =>
                        update({
                          nodes: [
                            ...active.nodes,
                            {
                              id: uid(),
                              badge: String(active.nodes.length + 1).padStart(
                                2,
                                "0",
                              ),
                              title: `Point ${active.nodes.length + 1}`,
                              detail:
                                "Add a clear, complete explanation from your section.",
                              metricValue: "",
                            },
                          ],
                        })
                      }
                    >
                      <Plus size={13} />
                      Add
                    </button>
                  </div>
                  <p className="mb-3 text-xs leading-relaxed text-slate-500 dark:text-slate-400">
                    {active.visualEngine
                      ? "Give each concept a short title and a complete explanation. Icons follow the topic; no statistics are added."
                      : "For comparison layouts, points alternate between columns. Charts use only the figures you enter."}
                  </p>
                  <div className="space-y-3">
                    {active.nodes.map((n, i) => (
                      <details
                        key={n.id}
                        open={i === 0}
                        className="rounded-xl border border-slate-200 p-3 dark:border-slate-700"
                      >
                        <summary className="flex cursor-pointer items-center gap-2 text-sm font-bold text-slate-800 dark:text-white">
                          <span className="inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-md bg-indigo-500/15 text-[11px] font-extrabold text-indigo-600 dark:text-indigo-300">
                            {i + 1}
                          </span>
                          <span className="flex-1 truncate">
                            {n.title || `Point ${i + 1}`}
                          </span>
                          <ChevronDown size={13} />
                        </summary>
                        <div className="mt-3 space-y-3">
                          {active.visualEngine && (
                            <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400">
                              Illustration
                              <select
                                className={field}
                                value={n.icon || "auto"}
                                onChange={(e) =>
                                  updateNode(n.id, {
                                    icon:
                                      e.target.value === "auto"
                                        ? undefined
                                        : (e.target
                                            .value as BlogInfographicNodeItem["icon"]),
                                  })
                                }
                              >
                                <option value="auto">
                                  Match the topic automatically
                                </option>
                                {[
                                  "answer",
                                  "evidence",
                                  "workflow",
                                  "search",
                                  "target",
                                  "chart",
                                  "check",
                                  "idea",
                                ].map((icon) => (
                                  <option key={icon} value={icon}>
                                    {icon}
                                  </option>
                                ))}
                              </select>
                            </label>
                          )}
                          <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400">
                            Title
                            <input
                              className={field}
                              maxLength={90}
                              value={n.title}
                              onChange={(e) =>
                                updateNode(n.id, { title: e.target.value })
                              }
                            />
                          </label>
                          <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400">
                            Explanation
                            <textarea
                              className={field}
                              rows={3}
                              maxLength={320}
                              value={n.detail}
                              onChange={(e) =>
                                updateNode(n.id, { detail: e.target.value })
                              }
                            />
                          </label>
                          <div className="grid grid-cols-2 gap-2">
                            <label className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                              Short label
                              <input
                                className={field}
                                maxLength={16}
                                value={n.badge}
                                onChange={(e) =>
                                  updateNode(n.id, { badge: e.target.value })
                                }
                              />
                            </label>
                            {!active.visualEngine && (
                              <label className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                                Value / metric
                                <input
                                  className={field}
                                  value={n.metricValue || ""}
                                  maxLength={30}
                                  placeholder="e.g. 42%"
                                  onChange={(e) =>
                                    updateNode(n.id, {
                                      metricValue: e.target.value,
                                    })
                                  }
                                />
                              </label>
                            )}
                          </div>
                          <div className="flex justify-end gap-1">
                            <button
                              type="button"
                              aria-label={`Move point ${i + 1} up`}
                              className={button}
                              disabled={i === 0}
                              onClick={() => {
                                const copy = [...active.nodes];
                                [copy[i - 1], copy[i]] = [copy[i], copy[i - 1]];
                                update({ nodes: copy });
                              }}
                            >
                              <ArrowUp size={13} />
                            </button>
                            <button
                              type="button"
                              aria-label={`Move point ${i + 1} down`}
                              className={button}
                              disabled={i === active.nodes.length - 1}
                              onClick={() => {
                                const copy = [...active.nodes];
                                [copy[i], copy[i + 1]] = [copy[i + 1], copy[i]];
                                update({ nodes: copy });
                              }}
                            >
                              <ArrowDown size={13} />
                            </button>
                            <button
                              type="button"
                              aria-label={`Delete point ${i + 1}`}
                              className={button}
                              disabled={active.nodes.length <= 2}
                              onClick={() =>
                                update({
                                  nodes: active.nodes.filter(
                                    (item) => item.id !== n.id,
                                  ),
                                })
                              }
                            >
                              <Trash2 size={13} />
                            </button>
                          </div>
                        </div>
                      </details>
                    ))}
                  </div>
                </div>
              </>
            )}

            {panel === "design" && (
              <>
                <div className="rounded-xl border border-indigo-200/80 bg-indigo-50/40 p-3.5 dark:border-indigo-500/30 dark:bg-indigo-950/25">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-bold text-slate-800 dark:text-slate-100">
                      Pre-built template dimensions
                    </span>
                    <span className="rounded-full bg-indigo-600/15 px-2.5 py-0.5 text-[11px] font-bold text-indigo-700 dark:text-indigo-300">
                      {dims.width} × {dims.height} px · Locked
                    </span>
                  </div>
                  <p className="mt-1.5 text-xs leading-relaxed text-slate-500 dark:text-slate-400">
                    Each template’s width and height are pre-built and
                    automatically fitted to your point count so the layout stays
                    pixel-perfect.
                  </p>
                </div>

                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                    Color palette
                  </h3>
                  <div className="mt-2.5 grid grid-cols-2 gap-2">
                    {Object.values(BLOG_INFOGRAPHIC_PALETTES).map((p) => (
                      <button
                        type="button"
                        key={p.id}
                        aria-pressed={active.paletteId === p.id}
                        onClick={() => update({ paletteId: p.id })}
                        className={`flex items-center gap-2 rounded-xl border p-2.5 text-left text-xs font-semibold transition ${
                          active.paletteId === p.id
                            ? "border-indigo-600 bg-indigo-50/70 dark:border-indigo-400 dark:bg-indigo-950/40"
                            : "border-slate-200 hover:border-indigo-300 dark:border-slate-700"
                        }`}
                      >
                        <span
                          className="h-5 w-5 shrink-0 rounded-full border border-black/10"
                          style={{
                            background: `linear-gradient(135deg, ${p.bgStart}, ${p.accent})`,
                          }}
                        />
                        <span className="truncate">{p.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {(active.visualEngine
                  ? active.prismLayout === "versus"
                  : [6, 8, 9, 10, 23].includes(active.templateId)) && (
                  <div className="grid grid-cols-2 gap-2">
                    {[0, 1].map((col) => (
                      <label
                        key={col}
                        className="text-xs font-bold text-slate-600 dark:text-slate-300"
                      >
                        Column {col + 1} header
                        <input
                          className={field}
                          maxLength={40}
                          value={
                            active.comparisonLabels?.[col] ||
                            (col === 0 ? "Perspective A" : "Perspective B")
                          }
                          onChange={(e) => {
                            const next: [string, string] = [
                              active.comparisonLabels?.[0] || "Perspective A",
                              active.comparisonLabels?.[1] || "Perspective B",
                            ];
                            next[col] = e.target.value;
                            update({ comparisonLabels: next });
                          }}
                        />
                      </label>
                    ))}
                  </div>
                )}

                {(active.visualEngine
                  ? active.prismLayout === "constellation"
                  : [3, 19].includes(active.templateId)) && (
                  <label className="block text-xs font-bold text-slate-600 dark:text-slate-300">
                    Center label
                    <input
                      className={field}
                      maxLength={45}
                      value={active.centerLabel || ""}
                      placeholder={
                        active.visualEngine
                          ? "Key ideas"
                          : active.templateId === 3
                            ? "Cycle"
                            : "Topic"
                      }
                      onChange={(e) => update({ centerLabel: e.target.value })}
                    />
                  </label>
                )}

                <div className="rounded-xl border border-slate-200 p-4 dark:border-slate-700">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-indigo-500">
                    Selected layout ·{" "}
                    {active.visualEngine
                      ? "Editorial collection"
                      : `${active.templateId}/25`}
                  </p>
                  <h3 className="mt-1 text-base font-bold text-slate-900 dark:text-white">
                    {active.templateName}
                  </h3>
                  <p className="mt-2 text-xs leading-relaxed text-slate-500 dark:text-slate-400">
                    {active.visualEngine
                      ? PRISM_LAYOUTS.find((l) => l.id === active.prismLayout)
                          ?.description ||
                        "Concepts and source-based explanations"
                      : spec.bestForSectionType}
                    . Choose a different layout in the gallery; your writing
                    stays in place.
                  </p>
                  <button
                    type="button"
                    className={button + " mt-3 w-full"}
                    onClick={() => {
                      if (active.visualEngine) {
                        const layout = autoRecommendPrismLayout(
                          active.headline,
                          active.nodes,
                        );
                        update(withPrismLayout(active, layout));
                        notify(
                          `Suggested "${PRISM_LAYOUTS.find((l) => l.id === layout)?.name}" for this section.`,
                        );
                        return;
                      }
                      const rec = autoRecommendInfographicTemplate(
                        active.headline,
                        active.nodes.map((n) => n.detail).join(" "),
                      );
                      choose(rec.templateId);
                      notify(`Suggested layout: ${rec.templateName}`);
                    }}
                  >
                    <Sparkles size={14} />
                    Suggest a layout
                  </button>
                </div>

                {!active.visualEngine && (
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                      Editorial illustration
                    </h3>
                    <p className="mt-2 text-xs leading-relaxed text-slate-500 dark:text-slate-400">
                      Optional reusable artwork. All wording and figures stay
                      editable.
                    </p>
                    <div className="mt-3 grid grid-cols-2 gap-2">
                      {(["none", "paper-steps"] as const).map((v) => (
                        <button
                          type="button"
                          key={v}
                          aria-pressed={
                            (active.brand?.illustration || "none") === v
                          }
                          className={
                            (active.brand?.illustration || "none") === v
                              ? primary
                              : button
                          }
                          onClick={() => updateBrand({ illustration: v })}
                        >
                          {v === "none" ? "Type only" : "Paper & progress"}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}

            {panel === "brand" && (
              <>
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                    Brand logo
                  </h3>
                  <p className="mt-1 text-xs leading-relaxed text-slate-500 dark:text-slate-400">
                    Upload a PNG, JPG, or WebP logo (under 2 MB) to appear in
                    the footer of your infographic.
                  </p>
                  <input
                    ref={logoInputRef}
                    type="file"
                    accept="image/png,image/jpeg,image/webp"
                    className="hidden"
                    onChange={(e) => {
                      const f = e.target.files?.[0];
                      if (f) void handleLogoUpload(f);
                      e.target.value = "";
                    }}
                  />
                  <div className="mt-3 flex flex-wrap gap-2">
                    <button
                      type="button"
                      className={button}
                      onClick={() => logoInputRef.current?.click()}
                    >
                      <Upload size={14} />
                      Upload logo
                    </button>
                    {active.brand?.logoDataUrl && (
                      <button
                        type="button"
                        className={button}
                        onClick={() => updateBrand({ logoDataUrl: undefined })}
                      >
                        <Trash2 size={14} />
                        Remove logo
                      </button>
                    )}
                  </div>
                  {active.brand?.logoDataUrl && (
                    <div className="mt-4 space-y-3 rounded-xl border border-slate-200 p-3 dark:border-slate-700">
                      <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300">
                        Logo size ({Math.round((active.brand.logoScale || 1) * 100)}%)
                        <input
                          type="range"
                          min="0.7"
                          max="1.5"
                          step="0.05"
                          value={active.brand.logoScale || 1}
                          onChange={(e) =>
                            updateBrand({ logoScale: Number(e.target.value) })
                          }
                          className="mt-1.5 w-full"
                        />
                      </label>
                      <div>
                        <span className="block text-xs font-semibold text-slate-600 dark:text-slate-300">
                          Logo badge style
                        </span>
                        <div className="mt-1.5 grid grid-cols-3 gap-2">
                          {(["plain", "white", "dark"] as const).map((st) => (
                            <button
                              type="button"
                              key={st}
                              className={
                                (active.brand?.logoStyle || "plain") === st
                                  ? primary
                                  : button
                              }
                              onClick={() => updateBrand({ logoStyle: st })}
                            >
                              {st}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                <div>
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                      Custom brand colors
                    </h3>
                    {active.brand?.customColors && (
                      <button
                        type="button"
                        className="inline-flex items-center gap-1 text-xs font-semibold text-indigo-600 dark:text-indigo-400"
                        onClick={() => updateBrand({ customColors: undefined })}
                      >
                        <RotateCcw size={12} />
                        Reset
                      </button>
                    )}
                  </div>
                  <div className="mt-2.5 grid grid-cols-2 gap-2.5">
                    {(
                      [
                        ["bgStart", "Background"],
                        ["surface", "Card surface"],
                        ["accent", "Primary accent"],
                        ["textMain", "Main text"],
                      ] as const
                    ).map(([key, label]) => {
                      const pal =
                        BLOG_INFOGRAPHIC_PALETTES[active.paletteId] ||
                        BLOG_INFOGRAPHIC_PALETTES["blue-trust"];
                      const val =
                        active.brand?.customColors?.[key] || pal[key];
                      return (
                        <label
                          key={key}
                          className="text-xs font-semibold text-slate-600 dark:text-slate-300"
                        >
                          {label}
                          <div className="mt-1 flex items-center gap-1.5">
                            <input
                              type="color"
                              value={val}
                              onChange={(e) =>
                                updateBrand({
                                  customColors: {
                                    ...active.brand?.customColors,
                                    [key]: e.target.value,
                                  },
                                })
                              }
                              className="h-8 w-9 cursor-pointer rounded border border-slate-200 bg-transparent p-0.5 dark:border-slate-700"
                            />
                            <input
                              type="text"
                              value={val}
                              maxLength={7}
                              onChange={(e) =>
                                updateBrand({
                                  customColors: {
                                    ...active.brand?.customColors,
                                    [key]: e.target.value,
                                  },
                                })
                              }
                              className={field + " !mt-0 font-mono"}
                            />
                          </div>
                        </label>
                      );
                    })}
                  </div>
                </div>

                <div className="space-y-4">
                  <label className="block text-xs font-bold text-slate-600 dark:text-slate-300">
                    Source / footer label
                    <input
                      className={field}
                      maxLength={120}
                      value={active.footerSourceLabel}
                      onChange={(e) =>
                        update({ footerSourceLabel: e.target.value })
                      }
                    />
                  </label>
                  <label className="block text-xs font-bold text-slate-600 dark:text-slate-300">
                    Image alt text (accessibility & SEO)
                    <textarea
                      className={field}
                      rows={2}
                      maxLength={260}
                      value={active.altText}
                      onChange={(e) => update({ altText: e.target.value })}
                    />
                  </label>
                </div>
              </>
            )}
          </div>
        </aside>

        <div
          id={`${mode}-infographic-preview`}
          className="min-w-0 scroll-mt-28 space-y-6"
        >
          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <div className="flex flex-wrap items-center gap-2 border-b border-slate-200 p-3 dark:border-slate-800">
              <div className="mr-auto flex items-center gap-2 text-xs font-semibold text-slate-500 dark:text-slate-400">
                <span>
                  {dims.width} × {dims.height} · {active.aspectRatio}
                </span>
                <span className="text-indigo-600 dark:text-indigo-400">
                  Editable source included in ZIP
                </span>
              </div>

              <div className="flex items-center gap-1">
                <button
                  type="button"
                  aria-label="Zoom out"
                  className={button}
                  onClick={() =>
                    setZoom((z) => Math.max(0.6, Number((z - 0.1).toFixed(2))))
                  }
                >
                  <ZoomOut size={14} />
                </button>
                <span className="px-1.5 text-xs font-bold text-slate-600 dark:text-slate-300">
                  {Math.round(zoom * 100)}%
                </span>
                <button
                  type="button"
                  aria-label="Zoom in"
                  className={button}
                  onClick={() =>
                    setZoom((z) => Math.min(1.4, Number((z + 0.1).toFixed(2))))
                  }
                >
                  <ZoomIn size={14} />
                </button>
              </div>

              <button
                type="button"
                className={primary}
                disabled={busy}
                onClick={() =>
                  void run(async () => {
                    const dataUrl =
                      await renderBlogInfographicToPngDataUrl(active);
                    const res = await fetch(dataUrl);
                    saveFile(await res.blob(), `${filename}.png`);
                    notify("Downloaded high-resolution PNG.");
                  })
                }
              >
                <Download size={14} />
                PNG
              </button>

              <button
                type="button"
                className={button}
                disabled={busy}
                onClick={() =>
                  void run(async () => {
                    saveFile(
                      new Blob([generateBlogInfographicSvg(active)], {
                        type: "image/svg+xml",
                      }),
                      `${filename}.svg`,
                    );
                    notify("Downloaded vector SVG.");
                  })
                }
              >
                SVG
              </button>

              <button
                type="button"
                className={button}
                disabled={busy}
                onClick={() =>
                  void run(async () => {
                    if (!canvasRef.current) return;
                    if (
                      active.visualEngine === "prism-antv" &&
                      scene.issues.length
                    ) {
                      throw new Error(
                        scene.issues
                          .map((i) => `${i.field}: ${i.message}`)
                          .join(" "),
                      );
                    }
                    await renderBlogInfographicToCanvas(
                      canvasRef.current,
                      active,
                    );
                    const blob = await new Promise<Blob | null>((r) =>
                      canvasRef.current!.toBlob(r, "image/webp", 0.94),
                    );
                    if (blob) saveFile(blob, `${filename}.webp`);
                    notify("Downloaded WebP image.");
                  })
                }
              >
                <ImageIcon size={14} />
                WebP
              </button>

              <button
                type="button"
                className={button}
                disabled={busy}
                onClick={() =>
                  void run(async () => {
                    if (!canvasRef.current) return;
                    if (
                      active.visualEngine === "prism-antv" &&
                      scene.issues.length
                    ) {
                      throw new Error(
                        scene.issues
                          .map((i) => `${i.field}: ${i.message}`)
                          .join(" "),
                      );
                    }
                    await renderBlogInfographicToCanvas(
                      canvasRef.current,
                      active,
                    );
                    printCanvasAsPdfPoster(canvasRef.current, active.headline);
                  })
                }
              >
                <Printer size={14} />
                PDF
              </button>

              <button
                type="button"
                className={button}
                disabled={busy}
                onClick={() =>
                  void run(async () => {
                    const svg = generateBlogInfographicSvg(active);
                    const html = `<figure class="blog-section-infographic" style="aspect-ratio:${dims.width}/${dims.height};max-width:${dims.width}px;margin:1.5rem auto;"><img src="data:image/svg+xml;utf8,${encodeURIComponent(svg)}" alt="${escapeHtml(active.altText || active.headline)}" width="${dims.width}" height="${dims.height}" loading="lazy" decoding="async" style="width:100%;height:auto;display:block;border-radius:12px;" /><figcaption>${escapeHtml(active.headline)} — ${escapeHtml(active.footerSourceLabel)}</figcaption></figure>`;
                    await navigator.clipboard.writeText(html);
                    notify("Copied embeddable HTML figure to clipboard.");
                  })
                }
              >
                <FileCode2 size={14} />
                HTML
              </button>
            </div>

            {scene.issues.length > 0 && (
              <div
                role="alert"
                className="border-b border-amber-200 bg-amber-50/90 px-4 py-3 text-xs text-amber-900 dark:border-amber-500/30 dark:bg-amber-950/40 dark:text-amber-200"
              >
                <p className="font-bold">Review before exporting:</p>
                <ul className="mt-1 list-disc space-y-1 pl-4">
                  {scene.issues.map((issue, idx) => (
                    <li key={idx}>
                      <strong>{issue.field}:</strong> {issue.message}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <div className="flex items-center justify-center overflow-auto bg-[radial-gradient(#cbd5e1_1px,transparent_1px)] [background-size:20px_20px] p-4 sm:p-8 dark:bg-[radial-gradient(#1e293b_1px,transparent_1px)]">
              <canvas
                ref={canvasRef}
                width={dims.width}
                height={dims.height}
                style={{
                  aspectRatio: `${dims.width} / ${dims.height}`,
                  maxWidth: `${Math.round(560 * zoom)}px`,
                }}
                className="h-auto w-full rounded-xl shadow-2xl ring-1 ring-black/10 dark:ring-white/10"
              />
            </div>
          </div>

          <div className="rounded-2xl border border-indigo-200 bg-white p-4 dark:border-indigo-500/30 dark:bg-slate-900 sm:p-5">
            <div className="flex flex-wrap items-end justify-between gap-2">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[.18em] text-indigo-500">
                  Pre-built editorial collection · {PRISM_LAYOUTS.length}{" "}
                  compositions
                </p>
                <h3 className="mt-1 text-xl font-bold text-slate-900 dark:text-white">
                  An editorial collection for your section
                </h3>
                <p className="mt-1 text-xs leading-relaxed text-slate-500 dark:text-slate-400">
                  Nine original compositions with pre-built dimensions. Your
                  explanations, palette and logo stay in place when you switch.
                </p>
              </div>
            </div>
            <div className="mt-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {PRISM_LAYOUTS.map((layout) => (
                <PrismTemplateCard
                  key={layout.id}
                  config={deferred}
                  layout={layout.id}
                  onSelect={() => update(withPrismLayout(active, layout.id))}
                />
              ))}
            </div>
          </div>

          <details
            open={classicOpen}
            onToggle={(e) => setClassicOpen(e.currentTarget.open)}
            className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900 sm:p-5"
          >
            <summary className="cursor-pointer text-sm font-bold text-slate-700 dark:text-slate-200">
              Classic collection · 25 legacy layouts
            </summary>
            {classicOpen && (
              <>
                <div className="mt-4 flex flex-wrap items-end justify-between gap-3">
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-[.18em] text-indigo-500">
                      25 ways to tell the story
                    </p>
                    <h3 className="mt-1 text-xl font-bold tracking-tight text-slate-900 dark:text-white">
                      Find the right visual structure.
                    </h3>
                    <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                      Live previews use your content, colors, logo and format.
                    </p>
                  </div>
                  <label>
                    <span className="sr-only">Search layouts</span>
                    <input
                      className={field + " !mt-0 max-w-[200px]"}
                      placeholder="Search layouts…"
                      value={query}
                      onChange={(e) => setQuery(e.target.value)}
                    />
                  </label>
                </div>
                <div className="my-5 flex flex-wrap gap-2">
                  {familyLabels.map((f, i) => (
                    <button
                      type="button"
                      key={f}
                      aria-pressed={family === i}
                      onClick={() => setFamily(i)}
                      className={`rounded-full border px-3 py-2 text-xs font-semibold ${
                        family === i
                          ? "border-indigo-600 bg-indigo-600 text-white"
                          : "border-slate-200 text-slate-600 hover:border-indigo-400 dark:border-slate-700 dark:text-slate-300"
                      }`}
                    >
                      {f}
                    </button>
                  ))}
                </div>
                <div className="grid grid-cols-1 gap-4 min-[520px]:grid-cols-2 xl:grid-cols-3">
                  {templates.map((t) => (
                    <TemplateCard
                      key={t.id}
                      id={t.id}
                      config={deferred}
                      selected={
                        !active.visualEngine && active.templateId === t.id
                      }
                      onSelect={() => choose(t.id)}
                    />
                  ))}
                </div>
                {!templates.length && (
                  <p className="py-10 text-center text-sm text-slate-500">
                    No layouts match. Try a different search or category.
                  </p>
                )}
              </>
            )}
          </details>

          <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-dashed border-slate-300 p-4 dark:border-slate-700">
            <div>
              <h3 className="text-sm font-bold text-slate-800 dark:text-white">
                Save or reopen your editable project
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Keep the project JSON so you can update wording, icons or
                branding later without starting over.
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <input
                ref={projectInputRef}
                type="file"
                accept="application/json,.json"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (!file) return;
                  const reader = new FileReader();
                  reader.onload = () => {
                    try {
                      const imported = importInfographicProject(
                        String(reader.result || ""),
                      );
                      commit(imported);
                      setActiveIdx(0);
                      notify(
                        `Loaded ${imported.length} section visual${imported.length > 1 ? "s" : ""} from project JSON.`,
                      );
                    } catch (err) {
                      setError(
                        err instanceof Error
                          ? err.message
                          : "Could not import project JSON.",
                      );
                    }
                  };
                  reader.readAsText(file);
                  e.target.value = "";
                }}
              />
              <button
                type="button"
                className={button}
                onClick={() =>
                  saveFile(
                    new Blob([JSON.stringify({ version: 1, cards }, null, 2)], {
                      type: "application/json",
                    }),
                    `${filename}-project.json`,
                  )
                }
              >
                <FolderArchive size={14} />
                Save project JSON
              </button>
              <button
                type="button"
                className={button}
                onClick={() => projectInputRef.current?.click()}
              >
                <Upload size={14} />
                Open project JSON
              </button>
              <button
                type="button"
                className={button}
                onClick={() => {
                  void navigator.clipboard?.writeText(
                    generateBlogInfographicSvg(active),
                  );
                  notify("Copied raw SVG markup to clipboard.");
                }}
              >
                <Copy size={14} />
                Copy SVG
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default BlogInfographicStudio;
