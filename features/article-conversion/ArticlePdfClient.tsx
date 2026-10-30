"use client";
import { useEffect, useMemo, useRef, useState, type FormEvent } from "react";
import {
  AlertTriangle,
  ArrowDown,
  ArrowUp,
  Download,
  FileText,
  Image as ImageIcon,
  Plus,
  RefreshCw,
  Trash2,
} from "lucide-react";
import styles from "./article-preview.module.css";
import {
  defaults,
  exampleHtml,
  filename,
  fromText,
  safeLink,
  validate,
  type Article,
  type Block,
  type BlockKind,
  type PdfSettings,
} from "./model";
import {
  articleWordDocument,
  docxMime,
  wordDefaults,
  wordFilename,
  type WordSettings,
} from "./docx";
import RepurposePanel, { type RepurposeFormat } from "./RepurposePanel";
import ToolRunOverlay, {
  focusToolSection,
  paintToolFeedback,
} from "@/features/tool-ui/ToolRunOverlay";
import ToolUrlInput from "@/features/tool-ui/ToolUrlInput";

let fontCache: Promise<{ sans: string; arabic: string }> | null = null;
function loadFonts() {
  if (!fontCache)
    fontCache = Promise.all([
      fetch("/fonts/article-export/NotoSans-Regular.ttf").then((r) => {
        if (!r.ok) throw Error("Reader font could not be loaded.");
        return r.arrayBuffer();
      }),
      fetch("/fonts/article-export/NotoNaskhArabic-Regular.ttf").then((r) => {
        if (!r.ok) throw Error("Arabic reader font could not be loaded.");
        return r.arrayBuffer();
      }),
    ]).then(([sans, arabic]) => ({
      sans: toBase64(new Uint8Array(sans)),
      arabic: toBase64(new Uint8Array(arabic)),
    }));
  return fontCache;
}
function toBase64(bytes: Uint8Array) {
  let out = "";
  for (let i = 0; i < bytes.length; i += 8192)
    out += String.fromCharCode(...bytes.subarray(i, i + 8192));
  return btoa(out);
}
const control =
  "w-full rounded-xl border border-slate-300 bg-transparent px-4 py-3 text-sm leading-6 focus:outline-none focus:ring-2 focus:ring-[#5271ff] dark:border-slate-600";
const button =
  "inline-flex items-center justify-center gap-2 rounded-xl border border-slate-300 px-4 py-2.5 text-sm font-semibold hover:bg-slate-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#5271ff] disabled:opacity-50 dark:border-slate-600 dark:hover:bg-slate-800";
const primary =
  "inline-flex items-center justify-center gap-2 rounded-xl bg-[#3452d1] px-5 py-3 text-sm font-bold text-white hover:bg-[#2943b5] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#5271ff] disabled:opacity-50";
const panel =
  "rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-900 sm:p-7";

export type ConversionToolFormat = "pdf" | "docx" | RepurposeFormat;

const FORMAT_LABELS: Record<ConversionToolFormat, string> = {
  pdf: "PDF",
  docx: "Word document",
  "video-script": "video script & visual storyboard",
  "social-posts": "15 social media post ideas",
  markdown: "Markdown file",
  epub: "EPUB e-book",
  newsletter: "email newsletter edition",
  "linkedin-carousel": "LinkedIn carousel deck",
  "podcast-script": "podcast episode script",
};

const STEP1_ACTION_LABELS: Record<ConversionToolFormat, string> = {
  pdf: "Import & Generate PDF",
  docx: "Import & Generate Word (.docx)",
  "video-script": "Import & Generate Video Script",
  "social-posts": "Import & Generate 15 Social Posts",
  markdown: "Import & Convert to Markdown",
  epub: "Import & Build EPUB E-Book",
  newsletter: "Import & Draft Email Newsletter",
  "linkedin-carousel": "Import & Build LinkedIn Carousel",
  "podcast-script": "Import & Generate Podcast Script",
};

export default function ArticlePdfClient({
  format = "pdf",
}: {
  format?: ConversionToolFormat;
} = {}) {
  const label = FORMAT_LABELS[format];
  const isDocExport = format === "pdf" || format === "docx";

  const [mode, setMode] = useState<"url" | "text" | "html">("url");
  const [source, setSource] = useState("");
  const [content, setContent] = useState("");
  const [article, setArticle] = useState<Article | null>(null);
  const [settings, setSettings] = useState<PdfSettings & WordSettings>(
    format === "docx" ? { ...defaults, ...wordDefaults } : defaults,
  );
  const [busy, setBusy] = useState<"" | "import" | "export">("");
  const [message, setMessage] = useState("");
  const [errors, setErrors] = useState<{
    source?: string;
    content?: string;
    review?: string;
  }>({});
  const [result, setResult] = useState<{
    url: string;
    name: string;
    pages: number;
    bytes: number;
  } | null>(null);
  const [editing, setEditing] = useState(false);
  const [expandedPreview, setExpandedPreview] = useState(false);
  const [revision, setRevision] = useState(0);
  const [autoRunSignal, setAutoRunSignal] = useState(0);
  const [destination, setDestination] = useState<"review" | "done" | null>(
    null,
  );
  const abort = useRef<AbortController | null>(null);
  const mounted = useRef(true);
  const review = useRef<HTMLElement>(null);
  const done = useRef<HTMLElement>(null);

  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
      abort.current?.abort();
    };
  }, []);
  useEffect(
    () => () => {
      if (result?.url) URL.revokeObjectURL(result.url);
    },
    [result],
  );
  useEffect(() => {
    if (busy || revision === 0) return;
    if (destination === "done") focusToolSection(done.current);
    if (destination === "review") focusToolSection(review.current);
  }, [busy, destination, revision]);

  const counts = useMemo(() => {
    const blocks = article?.blocks || [];
    const words = blocks
      .map((b) => b.text)
      .join(" ")
      .trim()
      .split(/\s+/)
      .filter(Boolean).length;
    return {
      words,
      blocks: blocks.length,
      tables: blocks.filter((b) => b.kind === "table").length,
      images: blocks.filter((b) => b.kind === "image" && b.included).length,
    };
  }, [article]);

  async function buildDocExport(
    targetArticle: Article,
    currentSettings: PdfSettings & WordSettings,
    signal?: AbortSignal,
  ) {
    const reviewError = validate(targetArticle);
    setErrors((old) => ({ ...old, review: reviewError || undefined }));
    if (reviewError) {
      setMessage(reviewError);
      return;
    }
    const c = new AbortController();
    abort.current = c;
    const activeSignal = signal
      ? AbortSignal.any([signal, c.signal])
      : c.signal;
    setBusy("export");
    setMessage(`Preparing your ${label}…`);
    try {
      await paintToolFeedback();
      const images: Record<string, string> = {};
      const warnings: string[] = [];
      for (const b of targetArticle.blocks.filter(
        (x) => x.kind === "image" && x.included && x.src,
      )) {
        activeSignal.throwIfAborted();
        const res = await fetch("/api/ai-tools/article-image", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ url: b.src }),
          signal: AbortSignal.any([activeSignal, AbortSignal.timeout(9000)]),
        });
        const data = await res.json();
        if (res.ok && data.data) images[b.src!] = data.data;
        else warnings.push(`Image omitted (${b.alt || b.src}): ${data.error?.message || "import failed"}.`);
      }
      const out =
        format === "docx"
          ? await articleWordDocument(targetArticle, currentSettings, {
              images,
              signal: activeSignal,
            })
          : await (async () => {
              const fonts = await loadFonts();
              const { articlePdf } = await import("./pdf");
              return articlePdf(targetArticle, currentSettings, {
                ...fonts,
                images,
                signal: activeSignal,
              });
            })();
      activeSignal.throwIfAborted();
      const blob = new Blob([out.bytes as unknown as BlobPart], {
        type: format === "docx" ? docxMime : "application/pdf",
      });
      const url = URL.createObjectURL(blob);
      const name =
        format === "docx"
          ? wordFilename(targetArticle.title)
          : filename(targetArticle.title);
      if (!mounted.current) {
        URL.revokeObjectURL(url);
        return;
      }
      setArticle((old) =>
        old
          ? {
              ...old,
              warnings: [...new Set([...old.warnings, ...warnings, ...out.warnings])],
            }
          : old,
      );
      setResult((old) => {
        if (old?.url) URL.revokeObjectURL(old.url);
        return { url, name, pages: out.pages, bytes: out.bytes.byteLength };
      });
      setDestination("done");
      setRevision((n) => n + 1);
      setMessage(
        format === "docx"
          ? `Word document ready (${(out.bytes.byteLength / 1024).toFixed(0)} KB). Download above or customize layout below.`
          : `PDF ready (${out.pages} ${out.pages === 1 ? "page" : "pages"}). Download above or customize layout below.`,
      );
    } catch (error) {
      if (mounted.current)
        setMessage(
          activeSignal.aborted
            ? `${label} creation cancelled. Your previous file has been kept.`
            : error instanceof Error
              ? error.message
              : `${label} creation failed. Check the article and retry.`,
        );
    } finally {
      if (mounted.current) setBusy("");
    }
  }

  async function preview(e: FormEvent) {
    e.preventDefault();
    if (busy) return;
    setMessage("");
    const issues: { source?: string; content?: string } = {};
    const url = source.trim()
      ? safeLink(
          /^https?:\/\//i.test(source.trim())
            ? source.trim()
            : `https://${source.trim()}`,
        )
      : "";
    if ((mode === "url" && !url) || (source.trim() && !url))
      issues.source =
        "Enter a public article URL, such as https://example.com/article.";
    if (
      mode !== "url" &&
      (!content.trim() || content.length > (mode === "text" ? 80000 : 500000))
    )
      issues.content = `Paste non-empty ${mode === "text" ? "text within 80,000 characters" : "HTML within 500,000 characters"}.`;
    setErrors(issues);
    if (Object.keys(issues).length) {
      setArticle(null);
      setResult(null);
      setDestination(null);
      document
        .getElementById(issues.source ? "article-source" : "article-content")
        ?.focus();
      return;
    }
    const c = new AbortController();
    abort.current = c;
    setBusy("import");
    try {
      await paintToolFeedback();
      c.signal.throwIfAborted();
      let next: Article;
      if (mode === "url") {
        const res = await fetch("/api/ai-tools/article-import", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ url }),
          signal: AbortSignal.any([c.signal, AbortSignal.timeout(26000)]),
        });
        const data = await res.json();
        if (!res.ok || !data.article)
          throw Error(
            data.error?.message ||
              "This page could not be imported. Use pasted content.",
          );
        next = data.article;
      } else if (mode === "text") next = fromText(content, url);
      else {
        const { extractArticle } = await import("./extract");
        next = extractArticle(content, url);
      }
      c.signal.throwIfAborted();
      if (mounted.current) {
        setArticle(next);
        setEditing(false);
        setExpandedPreview(false);

        // 2-Step Direct Flow: Immediately generate the target output so Step 2 opens with ready download buttons!
        if (isDocExport) {
          await buildDocExport(next, settings, c.signal);
        } else {
          setDestination("review");
          setRevision((n) => n + 1);
          setAutoRunSignal((n) => n + 1);
          setMessage(
            `Article imported. Preparing your ${label} and download buttons…`,
          );
        }
      }
    } catch (error) {
      if (mounted.current) {
        const msg = c.signal.aborted
          ? `Import cancelled. Your existing preview and ${label} have been kept.`
          : error instanceof Error
            ? error.message
            : "The import failed. Try pasted content.";
        setMessage(msg);
        if (!c.signal.aborted) {
          // Critical fix: Clear stale article & result when a new import fails so old articles/logos never remain displayed below the error!
          setArticle(null);
          setResult(null);
          setDestination(null);
          setErrors(mode === "url" ? { source: msg } : { content: msg });
          setTimeout(() => {
            document
              .getElementById(
                mode === "url" ? "article-source" : "article-content",
              )
              ?.focus();
          }, 30);
        }
      }
    } finally {
      if (mounted.current) setBusy("");
    }
  }

  async function create() {
    if (!article || busy) return;
    await buildDocExport(article, settings);
  }

  return (
    <div className={`${styles.root} mx-auto max-w-6xl px-4 py-12 sm:px-6`}>
      <form onSubmit={preview} noValidate className={panel} aria-busy={!!busy}>
        <p className="text-xs font-bold uppercase tracking-widest text-[#9A3412] dark:text-[#FDBA74]">
          Step 1 · Enter your article &amp; convert directly
        </p>
        <h2 className="mt-2 flex items-center gap-3 text-2xl font-extrabold">
          <FileText
            aria-hidden
            className="text-[#9A3412] dark:text-[#FDBA74]"
          />
          {STEP1_ACTION_LABELS[format]}
        </h2>
        <p className="mt-3 text-sm leading-7 text-slate-600 dark:text-slate-300">
          Enter a public article URL, or paste content when a page blocks
          imports. One click imports your article and prepares your{" "}
          {label} download immediately.
        </p>
        <fieldset disabled={!!busy} className="mt-6">
          <legend className="sr-only">Article input</legend>
          <div
            className="mb-6 flex flex-wrap gap-2"
            role="group"
            aria-label="Article input type"
          >
            {(
              [
                ["url", "Article URL"],
                ["text", "Paste text"],
                ["html", "Paste HTML"],
              ] as const
            ).map(([id, label]) => (
              <button
                type="button"
                key={id}
                className={`${button} ${mode === id ? "border-[#9A3412] bg-orange-50 text-[#9A3412] dark:bg-orange-950/40 dark:text-[#FDBA74]" : ""}`}
                aria-pressed={mode === id}
                onClick={() => {
                  setMode(id);
                  setErrors({});
                }}
              >
                {label}
              </button>
            ))}
          </div>
          <label
            htmlFor="article-source"
            className="mb-2 block text-sm font-bold"
          >
            {mode === "url"
              ? "Article URL (required)"
              : "Source URL (optional)"}
          </label>
          <p
            id="article-source-help"
            className="mb-2 text-sm leading-6 text-slate-600 dark:text-slate-300"
          >
            {mode === "url"
              ? "One public page, without credentials or a custom port."
              : "Used for source attribution and relative links or images."}
          </p>
          <ToolUrlInput
            id="article-source"
            className={control}
            value={source}
            onChange={(e) => {
              setSource(e.target.value);
              setErrors((old) => ({ ...old, source: undefined }));
            }}
            placeholder="https://example.com/article"
            maxLength={2048}
            required={mode === "url"}
            aria-invalid={!!errors.source}
            aria-describedby={`article-source-help ${errors.source ? "article-source-error" : ""}`}
          />
          {errors.source && (
            <div
              id="article-source-error"
              role="alert"
              className="mt-3 flex items-start gap-2.5 rounded-xl border border-red-200 bg-red-50 p-3.5 text-sm font-semibold text-red-800 dark:border-red-900/60 dark:bg-red-950/40 dark:text-red-200"
            >
              <AlertTriangle size={18} className="mt-0.5 shrink-0" />
              <span>{errors.source}</span>
            </div>
          )}
          {mode !== "url" && (
            <div className="mt-5">
              <label
                htmlFor="article-content"
                className="mb-2 block text-sm font-bold"
              >
                {mode === "text" ? "Article text" : "Copied article HTML"}{" "}
                (required)
              </label>
              <textarea
                id="article-content"
                dir="auto"
                rows={9}
                className={control}
                value={content}
                maxLength={mode === "text" ? 80000 : 500000}
                onChange={(e) => {
                  setContent(e.target.value);
                  setErrors((old) => ({ ...old, content: undefined }));
                }}
                required
                aria-invalid={!!errors.content}
                aria-describedby={`article-content-help ${errors.content ? "article-content-error" : ""}`}
                placeholder={
                  mode === "text"
                    ? "Paste paragraphs here. Use # Heading for headings."
                    : "<article><h1>Title</h1><p>Article text...</p></article>"
                }
              />
              <p
                id="article-content-help"
                className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-300"
              >
                {mode === "text"
                  ? "Blank lines separate paragraphs. Text stays in this browser."
                  : "HTML is parsed locally without running scripts. The source URL resolves relative references."}
              </p>
              {errors.content && (
                <div
                  id="article-content-error"
                  role="alert"
                  className="mt-3 flex items-start gap-2.5 rounded-xl border border-red-200 bg-red-50 p-3.5 text-sm font-semibold text-red-800 dark:border-red-900/60 dark:bg-red-950/40 dark:text-red-200"
                >
                  <AlertTriangle size={18} className="mt-0.5 shrink-0" />
                  <span>{errors.content}</span>
                </div>
              )}
            </div>
          )}
          <div className="mt-6 flex flex-wrap gap-3">
            <button type="submit" className={primary}>
              {STEP1_ACTION_LABELS[format]}
            </button>
            <button
              type="button"
              className={button}
              onClick={() => {
                setMode("html");
                setContent(exampleHtml);
                setSource("");
                setErrors({});
                setMessage(
                  `Fictional example loaded. Click "${STEP1_ACTION_LABELS[format]}" to test the 2-step workflow.`,
                );
              }}
            >
              Load fictional example
            </button>
          </div>
        </fieldset>
      </form>
      <p
        role="status"
        aria-live="polite"
        className="my-5 text-sm font-semibold leading-7 text-slate-700 dark:text-slate-200"
      >
        {message}
      </p>

      {/* STEP 2: ONE UNIFIED CONNECTED CONTAINER — Ready Download & Studio at the TOP, Connected Article Review Below */}
      {article && (
        <section
          ref={review}
          tabIndex={-1}
          aria-labelledby="article-review-title"
          className={`${panel} scroll-mt-28 focus:outline focus:outline-2 focus:outline-[#5271ff]`}
        >
          {/* 1. Ready Result Download Card at the very TOP for PDF & DOCX */}
          {result && isDocExport && (
            <div
              ref={done as any}
              tabIndex={-1}
              aria-labelledby="article-result-title"
              className="mb-7 rounded-2xl border-2 border-[#3452d1] bg-blue-50/40 p-5 focus:outline focus:outline-2 focus:outline-[#5271ff] dark:border-[#5271ff] dark:bg-blue-950/20 sm:p-7"
            >
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <p className="text-xs font-bold uppercase tracking-widest text-[#9A3412] dark:text-[#FDBA74]">
                    Step 2 · Your {label} is ready to download
                  </p>
                  <h2
                    id="article-result-title"
                    className="mt-1 text-2xl font-extrabold"
                  >
                    {article.title}
                  </h2>
                  <p className="mt-1 break-words text-sm leading-7 text-slate-600 dark:text-slate-300">
                    {format === "pdf"
                      ? `${result.pages} ${result.pages === 1 ? "page" : "pages"} · `
                      : "Editable DOCX · "}
                    {(result.bytes / 1024).toFixed(0)} KB · {result.name}
                  </p>
                </div>
                <div className="flex flex-wrap gap-3">
                  <a
                    href={result.url}
                    download={result.name}
                    className={primary}
                  >
                    <Download size={16} aria-hidden />
                    {format === "docx"
                      ? "Download Word (.docx)"
                      : "Download PDF (.pdf)"}
                  </a>
                  <button
                    type="button"
                    className={button}
                    disabled={!!busy}
                    onClick={create}
                  >
                    <RefreshCw size={15} aria-hidden />
                    Regenerate {label}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* 2. For the 7 Repurpose Formats, render the interactive Studio + Top Download Buttons right here */}
          {!isDocExport && (
            <div className="mb-8">
              <RepurposePanel
                article={article}
                format={format as RepurposeFormat}
                autoRunSignal={autoRunSignal}
              />
            </div>
          )}

          {/* 3. Connected Source Article Summary & Collapsible Editor */}
          <div className="border-t border-slate-200 pt-6 dark:border-slate-700">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <p className="text-xs font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400">
                  Imported Source Article · {article.method}
                </p>
                <h2
                  id="article-review-title"
                  className="mt-1 text-xl font-extrabold"
                >
                  {article.title}
                </h2>
                <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
                  {counts.words} words · {counts.blocks} blocks ·{" "}
                  {counts.tables} tables · {counts.images} included images
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  className={button}
                  disabled={!!busy}
                  onClick={() => setEditing((v) => !v)}
                >
                  {editing
                    ? "Close section editor"
                    : "Edit extracted blocks or layout"}
                </button>
              </div>
            </div>

            {article.warnings.length > 0 && (
              <div className="mt-4 rounded-xl border border-amber-300 bg-amber-50 p-4 text-sm text-amber-950 dark:border-amber-700 dark:bg-amber-950/40 dark:text-amber-100">
                <p className="flex items-center gap-2 font-bold">
                  <AlertTriangle size={16} aria-hidden />
                  Extraction notes
                </p>
                <ul className="mt-2 list-disc space-y-1 pl-5">
                  {article.warnings.map((w) => (
                    <li key={w}>{w}</li>
                  ))}
                </ul>
              </div>
            )}

            {errors.review && (
              <p
                role="alert"
                className="mt-4 text-sm font-bold text-red-700 dark:text-red-300"
              >
                {errors.review}
              </p>
            )}

            {/* PDF / DOCX Layout Settings (shown when PDF or DOCX is active) */}
            {isDocExport && (
              <fieldset
                disabled={!!busy}
                className="mt-6 grid gap-4 rounded-xl border border-slate-200 bg-slate-50/60 p-4 dark:border-slate-700 dark:bg-slate-800/40 sm:grid-cols-2 lg:grid-cols-4"
              >
                <legend className="sr-only">{label} layout settings</legend>
                <div>
                  <label
                    htmlFor="pdf-size"
                    className="mb-1 block text-xs font-bold"
                  >
                    Page size
                  </label>
                  <select
                    id="pdf-size"
                    className={control}
                    value={settings.size}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        size: e.target.value as PdfSettings["size"],
                      })
                    }
                  >
                    <option value="a4">A4</option>
                    <option value="letter">Letter</option>
                  </select>
                </div>
                <div>
                  <label
                    htmlFor="pdf-margins"
                    className="mb-1 block text-xs font-bold"
                  >
                    Margins
                  </label>
                  <select
                    id="pdf-margins"
                    className={control}
                    value={settings.margins}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        margins: e.target.value as PdfSettings["margins"],
                      })
                    }
                  >
                    <option value="compact">Compact</option>
                    <option value="comfortable">Comfortable</option>
                    <option value="wide">Wide</option>
                  </select>
                </div>
                <div>
                  <label
                    htmlFor="pdf-font-size"
                    className="mb-1 block text-xs font-bold"
                  >
                    Body text size
                  </label>
                  <select
                    id="pdf-font-size"
                    className={control}
                    value={settings.fontSize}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        fontSize: Number(
                          e.target.value,
                        ) as PdfSettings["fontSize"],
                      })
                    }
                  >
                    <option value={10}>10 pt</option>
                    <option value={11}>11 pt</option>
                    <option value={12}>12 pt</option>
                  </select>
                </div>
                <div>
                  <label
                    htmlFor="pdf-line-height"
                    className="mb-1 block text-xs font-bold"
                  >
                    Line spacing
                  </label>
                  <select
                    id="pdf-line-height"
                    className={control}
                    value={settings.lineHeight}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        lineHeight: Number(
                          e.target.value,
                        ) as PdfSettings["lineHeight"],
                      })
                    }
                  >
                    <option value={1.35}>1.35</option>
                    <option value={1.5}>1.5</option>
                    <option value={1.65}>1.65</option>
                  </select>
                </div>
                {format === "docx" && (
                  <>
                    <div>
                      <label
                        htmlFor="word-font"
                        className="mb-1 block text-xs font-bold"
                      >
                        Word font family
                      </label>
                      <select
                        id="word-font"
                        className={control}
                        value={settings.fontFamily}
                        onChange={(e) =>
                          setSettings({
                            ...settings,
                            fontFamily: e.target
                              .value as WordSettings["fontFamily"],
                          })
                        }
                      >
                        <option value="Calibri">Calibri</option>
                        <option value="Arial">Arial</option>
                        <option value="Georgia">Georgia</option>
                        <option value="Times New Roman">Times New Roman</option>
                      </select>
                    </div>
                    <div>
                      <label
                        htmlFor="word-heading"
                        className="mb-1 block text-xs font-bold"
                      >
                        Heading style
                      </label>
                      <select
                        id="word-heading"
                        className={control}
                        value={settings.headingTone}
                        onChange={(e) =>
                          setSettings({
                            ...settings,
                            headingTone: e.target
                              .value as WordSettings["headingTone"],
                          })
                        }
                      >
                        <option value="editorial">Editorial dark</option>
                        <option value="classic">Classic black</option>
                        <option value="slate">Slate accent</option>
                      </select>
                    </div>
                  </>
                )}
                <div className="flex flex-wrap gap-5 sm:col-span-2 lg:col-span-4">
                  {(
                    [
                      ["includeMeta", "Include source metadata"],
                      ["includeNumbers", "Include page numbers"],
                      ["includeLinks", "Include reference list"],
                      ...(format === "docx"
                        ? ([
                            ["includeOutline", "Include heading summary"],
                          ] as const)
                        : []),
                    ] as const
                  ).map(([key, text]) => (
                    <label
                      key={key}
                      className="flex items-center gap-2 text-sm font-semibold"
                    >
                      <input
                        type="checkbox"
                        className="h-5 w-5 accent-[#5271ff]"
                        checked={Boolean(
                          settings[key as keyof typeof settings],
                        )}
                        onChange={(e) =>
                          setSettings({ ...settings, [key]: e.target.checked })
                        }
                      />
                      <span>{text}</span>
                    </label>
                  ))}
                  {isDocExport && (
                    <button
                      type="button"
                      className={`${primary} ml-auto py-2 text-xs`}
                      onClick={create}
                    >
                      Apply Layout &amp; Update {label}
                    </button>
                  )}
                </div>
              </fieldset>
            )}

            {/* Collapsible Metadata & Block Editor */}
            {editing ? (
              <div className="mt-6 space-y-4">
                <div className="grid gap-4 md:grid-cols-3">
                  <div>
                    <label
                      htmlFor="article-title"
                      className="mb-1 block text-xs font-bold"
                    >
                      Title (required)
                    </label>
                    <input
                      id="article-title"
                      dir="auto"
                      className={control}
                      value={article.title}
                      onChange={(e) =>
                        setArticle({ ...article, title: e.target.value })
                      }
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="article-byline"
                      className="mb-1 block text-xs font-bold"
                    >
                      Author or publication
                    </label>
                    <input
                      id="article-byline"
                      dir="auto"
                      className={control}
                      value={article.byline}
                      onChange={(e) =>
                        setArticle({ ...article, byline: e.target.value })
                      }
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="article-date"
                      className="mb-1 block text-xs font-bold"
                    >
                      Published date
                    </label>
                    <input
                      id="article-date"
                      dir="auto"
                      className={control}
                      value={article.published}
                      onChange={(e) =>
                        setArticle({ ...article, published: e.target.value })
                      }
                    />
                  </div>
                </div>
                <BlockEditor
                  blocks={article.blocks}
                  onChange={(blocks) => setArticle({ ...article, blocks })}
                />
              </div>
            ) : (
              <div className="mt-5">
                <div
                  className={`${styles.paper} relative overflow-hidden rounded-xl border border-slate-200 p-5 dark:border-slate-700 ${
                    expandedPreview ? "" : "max-h-72"
                  }`}
                >
                  <h3 dir="auto" className="text-xl font-bold">
                    {article.title}
                  </h3>
                  {(article.byline || article.published || article.source) && (
                    <p
                      dir="auto"
                      className="mt-1 break-words text-xs leading-6 text-slate-600 dark:text-slate-300"
                    >
                      {[article.byline, article.published, article.source]
                        .filter(Boolean)
                        .join(" · ")}
                    </p>
                  )}
                  <div className="mt-4 space-y-3 text-sm leading-7">
                    {article.blocks.slice(0, expandedPreview ? 300 : 8).map((b) => (
                      <PreviewBlock key={b.id} block={b} />
                    ))}
                  </div>
                  {!expandedPreview && article.blocks.length > 8 && (
                    <div className="pointer-events-none absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-white to-transparent dark:from-slate-900" />
                  )}
                </div>
                {article.blocks.length > 8 && (
                  <button
                    type="button"
                    className="mt-3 text-xs font-bold text-[#3452d1] underline dark:text-blue-300"
                    onClick={() => setExpandedPreview((v) => !v)}
                  >
                    {expandedPreview
                      ? "Collapse source article preview"
                      : `Show all ${article.blocks.length} extracted article blocks`}
                  </button>
                )}
              </div>
            )}
          </div>
        </section>
      )}
      <ToolRunOverlay
        active={!!busy}
        title={
          busy === "import"
            ? `Importing article & building ${label}`
            : `Generating ${label} download`
        }
        description={
          busy === "import"
            ? "Extracting clean article headings, body text, and brand styling."
            : `Formatting your ${label} file in the browser.`
        }
        onCancel={() => abort.current?.abort()}
      />
    </div>
  );
}

function PreviewBlock({ block }: { block: Block }) {
  if (block.kind === "heading")
    return (
      <h4 dir="auto" className="pt-2 text-base font-bold">
        {block.text}
      </h4>
    );
  if (block.kind === "quote")
    return (
      <blockquote
        dir="auto"
        className="border-l-4 border-[#9A3412] pl-4 italic"
      >
        {block.text}
      </blockquote>
    );
  if (block.kind === "code")
    return (
      <pre className="overflow-x-auto rounded-lg bg-slate-100 p-3 text-xs dark:bg-slate-800">
        {block.text}
      </pre>
    );
  if (block.kind === "table")
    return (
      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-xs">
          <tbody>
            {(block.cells || []).map((r, i) => (
              <tr key={i}>
                {r.map((c, j) => (
                  <td
                    key={j}
                    dir="auto"
                    className="border border-slate-300 p-2 dark:border-slate-600"
                  >
                    {c}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  if (block.kind === "image")
    return (
      <p className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-300">
        <ImageIcon size={15} aria-hidden />
        {block.included ? "Included image:" : "Image omitted by default:"}{" "}
        {block.alt || block.src}
      </p>
    );
  return <p dir="auto">{block.text}</p>;
}

function BlockEditor({
  blocks,
  onChange,
}: {
  blocks: Block[];
  onChange: (b: Block[]) => void;
}) {
  function patch(index: number, next: Partial<Block>) {
    onChange(blocks.map((b, i) => (i === index ? { ...b, ...next } : b)));
  }
  function move(index: number, delta: number) {
    const target = index + delta;
    if (target < 0 || target >= blocks.length) return;
    const copy = [...blocks];
    [copy[index], copy[target]] = [copy[target], copy[index]];
    onChange(copy);
  }
  return (
    <div className="space-y-4">
      {blocks.map((b, i) => (
        <div
          key={b.id}
          className="rounded-xl border border-slate-200 p-4 dark:border-slate-700"
        >
          <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
            <label className="text-xs font-bold">
              Section {i + 1}
              <select
                aria-label={`Section ${i + 1} type`}
                className="ml-2 rounded-lg border border-slate-300 bg-transparent px-2 py-1 text-xs dark:border-slate-600"
                value={b.kind}
                onChange={(e) =>
                  patch(i, {
                    kind: e.target.value as BlockKind,
                    cells:
                      e.target.value === "table"
                        ? b.cells || [["Column", "Value"]]
                        : undefined,
                  })
                }
              >
                {(
                  [
                    "heading",
                    "paragraph",
                    "list",
                    "quote",
                    "code",
                    "table",
                    "image",
                  ] as const
                ).map((k) => (
                  <option key={k} value={k}>
                    {k}
                  </option>
                ))}
              </select>
            </label>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                className={button}
                disabled={i === 0}
                onClick={() => move(i, -1)}
                aria-label={`Move section ${i + 1} up`}
              >
                <ArrowUp size={15} aria-hidden />
              </button>
              <button
                type="button"
                className={button}
                disabled={i === blocks.length - 1}
                onClick={() => move(i, 1)}
                aria-label={`Move section ${i + 1} down`}
              >
                <ArrowDown size={15} aria-hidden />
              </button>
              <button
                type="button"
                className={button}
                onClick={() => onChange(blocks.filter((_, j) => j !== i))}
                aria-label={`Remove section ${i + 1}`}
              >
                <Trash2 size={15} aria-hidden />
              </button>
            </div>
          </div>
          {b.kind === "image" ? (
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                className="h-5 w-5 accent-[#5271ff]"
                checked={!!b.included}
                onChange={(e) => patch(i, { included: e.target.checked })}
              />
              <span>
                Include remote image from {b.src || "missing URL"} (
                {b.alt || "no alt text"})
              </span>
            </label>
          ) : b.kind === "table" ? (
            <textarea
              dir="auto"
              rows={4}
              aria-label={`Section ${i + 1} table rows, pipe separated`}
              className={control}
              value={(b.cells || []).map((r) => r.join(" | ")).join("\n")}
              onChange={(e) =>
                patch(i, {
                  cells: e.target.value
                    .split(/\r?\n/)
                    .filter(Boolean)
                    .map((r) => r.split(/\s*\|\s*/)),
                })
              }
            />
          ) : (
            <textarea
              dir="auto"
              rows={3}
              aria-label={`Section ${i + 1} text`}
              className={control}
              value={b.text}
              onChange={(e) => patch(i, { text: e.target.value })}
            />
          )}
        </div>
      ))}
      <button
        type="button"
        className={button}
        onClick={() =>
          onChange([
            ...blocks,
            { id: `u${Date.now()}`, kind: "paragraph", text: "New paragraph." },
          ])
        }
      >
        <Plus size={16} aria-hidden />
        Add paragraph
      </button>
    </div>
  );
}
