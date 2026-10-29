"use client";
import styles from "./article-preview.module.css";
import dynamic from "next/dynamic";
const Reader = dynamic(() => import("../read-aloud/Reader"), { ssr: false });
const RepurposePanel = dynamic(() => import("./RepurposePanel"), {
  ssr: false,
});
import { useEffect, useRef, useState, type FormEvent } from "react";
import { Download, FileText, Pencil, Trash2, ChevronDown } from "lucide-react";
import ToolRunOverlay, {
  focusToolSection,
  paintToolFeedback,
} from "../tool-ui/ToolRunOverlay";
import ToolUrlInput from "../tool-ui/ToolUrlInput";
import type { ConversionFormat } from "./formats";
import {
  defaults,
  exampleHtml,
  filename,
  safeLink,
  fromText,
  validate,
  type Article,
  type Block,
} from "./model";
const control =
  "w-full rounded-xl border border-slate-300 bg-transparent px-4 py-3 text-sm leading-7 focus:outline-none focus:ring-2 focus:ring-[#5271ff] dark:border-slate-600";
const panel =
  "rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-700 dark:bg-slate-900 sm:p-7";
const button =
  "inline-flex items-center justify-center gap-2 rounded-xl border border-slate-300 px-4 py-3 text-sm font-semibold hover:bg-slate-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#5271ff] dark:border-slate-600 dark:hover:bg-slate-800 disabled:opacity-50";
const primary =
  "inline-flex items-center justify-center gap-2 rounded-xl bg-[#3452d1] px-5 py-3 text-sm font-bold text-white hover:bg-[#2943b5] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#5271ff] disabled:opacity-50";
type Result = {
  url: string;
  name: string;
  pages?: number;
  bytes: number;
  warnings: string[];
  snapshot: string;
};

const FORMAT_LABELS: Record<ConversionFormat, string> = {
  pdf: "PDF",
  docx: "Word document",
  audio: "audio",
  "video-script": "video script",
  "social-posts": "social media drafts",
  markdown: "Markdown file",
  epub: "EPUB e-book",
  newsletter: "newsletter draft",
  "linkedin-carousel": "LinkedIn carousel",
  "podcast-script": "podcast script",
};

const STEP1_ACTION_LABELS: Record<ConversionFormat, string> = {
  pdf: "Convert Article to PDF",
  docx: "Convert Article to Word (DOCX)",
  audio: "Convert Article to MP3 Audio",
  "video-script": "Generate Video Script",
  "social-posts": "Generate Social Media Posts",
  markdown: "Convert Article to Markdown",
  epub: "Convert Article to EPUB",
  newsletter: "Generate Newsletter Edition",
  "linkedin-carousel": "Generate LinkedIn Carousel",
  "podcast-script": "Generate Podcast Script",
};

export default function ArticlePdfClient({
  format = "pdf",
}: {
  format?: ConversionFormat;
}) {
  const label = FORMAT_LABELS[format] || "PDF";
  const fileLabel = format === "docx" ? "DOCX" : "PDF";
  const isDocExport = format === "pdf" || format === "docx";
  const [mode, setMode] = useState<"url" | "text" | "html">("url"),
    [source, setSource] = useState(""),
    [content, setContent] = useState(""),
    [article, setArticle] = useState<Article | null>(null),
    [settings, setSettings] = useState(defaults),
    [editing, setEditing] = useState(false),
    [expandedPreview, setExpandedPreview] = useState(false),
    [busy, setBusy] = useState<"" | "import" | "pdf">(""),
    [errors, setErrors] = useState<{ source?: string; content?: string }>({}),
    [message, setMessage] = useState(""),
    [result, setResult] = useState<Result | null>(null),
    [revision, setRevision] = useState(0),
    [autoRunSignal, setAutoRunSignal] = useState(0),
    [destination, setDestination] = useState<"review" | "result">("review");
  const abort = useRef<AbortController | null>(null),
    mounted = useRef(true),
    review = useRef<HTMLElement>(null),
    done = useRef<HTMLElement>(null);
  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
      abort.current?.abort();
    };
  }, []);
  useEffect(() => {
    if (!busy && revision)
      focusToolSection(
        destination === "result" && done.current
          ? done.current
          : review.current,
      );
  }, [busy, revision, destination]);
  useEffect(
    () => () => {
      if (result) URL.revokeObjectURL(result.url);
    },
    [result],
  );
  function update(id: string, value: Partial<Block>) {
    setArticle((a) => ({
      ...a!,
      blocks: a!.blocks.map((b) => (b.id === id ? { ...b, ...value } : b)),
    }));
  }

  async function buildDocExport(
    targetArticle: Article,
    currentSettings = settings,
    signal?: AbortSignal,
  ) {
    const err = validate(targetArticle);
    if (err) {
      setMessage(err);
      if (!targetArticle.title.trim())
        document.getElementById("article-title")?.focus();
      return;
    }
    const localController = signal ? null : new AbortController();
    const activeSignal = signal || localController!.signal;
    if (localController) abort.current = localController;
    setBusy("pdf");
    try {
      await paintToolFeedback();
      activeSignal.throwIfAborted();
      const images: Record<string, string> = {};
      for (const image of targetArticle.blocks
        .filter((b) => b.kind === "image" && b.included)
        .slice(0, 6)) {
        activeSignal.throwIfAborted();
        try {
          const res = await fetch("/api/ai-tools/article-image", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ url: image.src }),
            signal: AbortSignal.any([
              activeSignal,
              AbortSignal.timeout(10000),
            ]),
          });
          const data = await res.json();
          if (
            res.ok &&
            typeof data.data === "string" &&
            /^data:image\/(png|jpeg);base64,/.test(data.data)
          )
            images[image.id] = data.data;
        } catch {
          activeSignal.throwIfAborted();
        }
      }
      let built: {
        bytes: ArrayBuffer | Uint8Array<ArrayBuffer>;
        pages?: number;
        warnings: string[];
      };
      const shared = {
        images,
        signal: activeSignal,
        yield: () => new Promise<void>((r) => setTimeout(r, 0)),
      };
      if (format === "docx") {
        const { articleDocx } = await import("./docx");
        built = await articleDocx(targetArticle, currentSettings, shared);
      } else {
        const { articlePdf, loadFonts } = await import("./pdf");
        const fonts = await loadFonts(
          AbortSignal.any([activeSignal, AbortSignal.timeout(18000)]),
        );
        built = await articlePdf(targetArticle, currentSettings, {
          ...shared,
          ...fonts,
        });
      }
      activeSignal.throwIfAborted();
      const blob = new Blob([built.bytes as any], {
          type:
            format === "pdf"
              ? "application/pdf"
              : "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        }),
        url = URL.createObjectURL(blob);
      if (mounted.current) {
        setResult({
          url,
          name:
            format === "docx"
              ? filename(targetArticle.title).replace(/\.pdf$/, ".docx")
              : filename(targetArticle.title),
          pages: built.pages,
          bytes: blob.size,
          warnings: built.warnings,
          snapshot: JSON.stringify({
            article: targetArticle,
            settings: currentSettings,
          }),
        });
        setDestination("result");
        setRevision((n) => n + 1);
        setMessage(
          `Your ${label} and article preview are ready! Click Download ${fileLabel} below.`,
        );
      } else URL.revokeObjectURL(url);
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
        if (!c.signal.aborted)
          setErrors(mode === "url" ? { source: msg } : { content: msg });
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
            <p
              id="article-source-error"
              className="mt-2 text-sm text-red-700 dark:text-red-300"
            >
              {errors.source}
            </p>
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
                <p
                  id="article-content-error"
                  className="mt-2 text-sm text-red-700 dark:text-red-300"
                >
                  {errors.content}
                </p>
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
                    <Download size={17} aria-hidden />
                    Download {fileLabel}
                  </a>
                  {format === "pdf" && (
                    <a
                      href={result.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={button}
                    >
                      Open PDF preview
                    </a>
                  )}
                </div>
              </div>
              {result.snapshot !== JSON.stringify({ article, settings }) && (
                <div className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-xl bg-amber-100/70 p-3 dark:bg-amber-950/40">
                  <p className="text-sm font-bold text-amber-900 dark:text-amber-200">
                    The article or layout changed. Update the {fileLabel} to
                    include your latest edits.
                  </p>
                  <button
                    type="button"
                    className={primary}
                    disabled={!!busy}
                    onClick={create}
                  >
                    <FileText size={16} aria-hidden />
                    Create downloadable {fileLabel}
                  </button>
                </div>
              )}
              {result.warnings.length > 0 && (
                <ul className="mt-4 list-disc space-y-1 pl-5 text-xs leading-6 text-amber-800 dark:text-amber-200">
                  {result.warnings.map((w) => (
                    <li key={w}>{w}</li>
                  ))}
                </ul>
              )}
            </div>
          )}

          {/* 2. Ready Audio Player & Download Card at the TOP for Article to MP3 */}
          {format === "audio" && (
            <div className="mb-8">
              <Reader
                key={revision}
                article={article}
                autoRunSignal={autoRunSignal}
              />
            </div>
          )}

          {/* 3. Ready Interactive Studio & Download Card at the TOP for the 7 Repurpose Tools */}
          {!isDocExport && format !== "audio" && (
            <div className="mb-8">
              <RepurposePanel
                key={revision}
                article={article}
                format={format}
                autoRunSignal={autoRunSignal}
              />
            </div>
          )}

          {/* 4. Connected Source Article Review & Section Editor right below inside the same card */}
          <div className="border-t border-slate-200 pt-6 dark:border-slate-700">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <p className="text-xs font-bold uppercase tracking-widest text-[#9A3412] dark:text-[#FDBA74]">
                  Connected Source Article · Review or edit sections
                </p>
                <h2
                  id="article-review-title"
                  className="mt-1 text-xl font-extrabold"
                >
                  Review your article
                </h2>
              </div>
              <div className="flex flex-wrap items-center gap-3">
                <button
                  type="button"
                  className={button}
                  aria-pressed={editing}
                  onClick={() => setEditing((v) => !v)}
                >
                  <Pencil size={16} aria-hidden />
                  {editing ? "Finish editing" : "Edit article sections"}
                </button>
              </div>
            </div>

            {isDocExport && (
              <details className="mt-4 rounded-xl border border-slate-300 bg-slate-50/50 p-4 dark:border-slate-700 dark:bg-slate-800/40">
                <summary className="flex cursor-pointer list-none items-center justify-between text-sm font-bold">
                  {fileLabel} layout options (Page size, font size, margins)
                  <ChevronDown size={18} aria-hidden />
                </summary>
                <div className="mt-4 grid gap-4 sm:grid-cols-2">
                  {(
                    [
                      [
                        "size",
                        "Page size",
                        [
                          ["a4", "A4"],
                          ["letter", "Letter"],
                        ],
                      ],
                      [
                        "fontSize",
                        "Text size",
                        [
                          [10, "10 pt"],
                          [11, "11 pt"],
                          [12, "12 pt"],
                          [14, "14 pt"],
                        ],
                      ],
                      [
                        "margin",
                        "Page margins",
                        [
                          [36, "Compact"],
                          [54, "Comfortable"],
                          [72, "Wide"],
                        ],
                      ],
                      [
                        "direction",
                        "Text direction",
                        [
                          ["auto", "Automatic"],
                          ["ltr", "Left to right"],
                          ["rtl", "Right to left"],
                        ],
                      ],
                    ] as const
                  ).map(([id, label, options]) => (
                    <div key={id}>
                      <label
                        htmlFor={`article-${id}`}
                        className="mb-1 block text-xs font-bold"
                      >
                        {label}
                      </label>
                      <select
                        id={`article-${id}`}
                        dir="auto"
                        className={control}
                        value={settings[id]}
                        onChange={(e) =>
                          setSettings((s) => ({
                            ...s,
                            [id]:
                              id === "fontSize" || id === "margin"
                                ? Number(e.target.value)
                                : e.target.value,
                          }))
                        }
                      >
                        {options.map(([value, label]) => (
                          <option
                            key={value}
                            value={value}
                            className="bg-white text-slate-900 dark:bg-slate-900 dark:text-white"
                          >
                            {label}
                          </option>
                        ))}
                      </select>
                    </div>
                  ))}
                </div>
                <button
                  type="button"
                  className={`${primary} mt-4`}
                  disabled={!!busy}
                  onClick={create}
                >
                  <FileText size={16} aria-hidden />
                  Create downloadable {fileLabel}
                </button>
              </details>
            )}

            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              {(
                [
                  ["title", "Article title (required)"],
                  ["byline", "Byline (review source attribution)"],
                  ["published", "Date from source (optional)"],
                ] as const
              ).map(([id, label]) => (
                <div
                  key={id}
                  className={id === "title" ? "sm:col-span-2" : ""}
                >
                  <label
                    htmlFor={`article-${id}`}
                    className="mb-1 block text-xs font-bold"
                  >
                    {label}
                  </label>
                  <input
                    id={`article-${id}`}
                    dir="auto"
                    className={control}
                    value={article[id]}
                    required={id === "title"}
                    aria-invalid={id === "title" && !article.title.trim()}
                    aria-describedby={
                      id === "title" && !article.title.trim()
                        ? "article-title-error"
                        : undefined
                    }
                    maxLength={id === "published" ? 100 : 300}
                    onChange={(e) =>
                      setArticle((a) => ({ ...a!, [id]: e.target.value }))
                    }
                  />
                  {id === "title" && !article.title.trim() && (
                    <p
                      id="article-title-error"
                      className="mt-2 text-sm text-red-700 dark:text-red-300"
                    >
                      Add an article title before exporting.
                    </p>
                  )}
                </div>
              ))}
            </div>

            {article.source && (
              <p className="mt-3 break-all text-xs leading-6">
                Source:{" "}
                <a
                  href={safeLink(article.source)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#3452d1] underline dark:text-[#b4c3ff]"
                >
                  {article.source}
                </a>
              </p>
            )}

            <div className="mt-5 rounded-xl border border-slate-200 bg-slate-50/50 p-4 dark:border-slate-700 dark:bg-slate-800/30">
              <div className="mb-3 flex flex-wrap items-center justify-between gap-2 border-b border-slate-200 pb-3 dark:border-slate-700">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300">
                  Extracted article content ({article.blocks.length} sections)
                </span>
                {article.blocks.length > 5 && (
                  <button
                    type="button"
                    className="text-xs font-bold text-[#3452d1] underline dark:text-[#b4c3ff]"
                    onClick={() => setExpandedPreview((v) => !v)}
                  >
                    {expandedPreview
                      ? "Compact scrollable view"
                      : "Expand full article height"}
                  </button>
                )}
              </div>
              <div
                className={`space-y-4 pr-1 ${
                  expandedPreview || editing
                    ? ""
                    : "max-h-[340px] overflow-y-auto"
                }`}
              >
                {article.blocks.map((b, n) => (
                  <div
                    key={b.id}
                    className={
                      editing
                        ? "rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-900"
                        : ""
                    }
                  >
                    {editing && (
                      <div className="mb-3 flex items-center justify-between gap-3">
                        <label
                          htmlFor={`article-block-${b.id}`}
                          className="text-xs font-bold uppercase text-slate-600 dark:text-slate-300"
                        >
                          Section {n + 1} · {b.kind}
                        </label>
                        <button
                          type="button"
                          aria-label={`Remove section ${n + 1}`}
                          className="rounded-lg p-2 text-red-700 focus-visible:outline-[#5271ff] dark:text-red-300"
                          onClick={() =>
                            setArticle((a) => ({
                              ...a!,
                              blocks: a!.blocks.filter((old) => old.id !== b.id),
                            }))
                          }
                        >
                          <Trash2 size={17} aria-hidden />
                        </button>
                      </div>
                    )}
                    {b.kind === "image" && !isDocExport ? (
                      <p className="text-sm leading-7">
                        Image reference: {b.alt}.
                      </p>
                    ) : b.kind === "image" ? (
                      <div className="rounded-xl border border-dashed border-orange-300 p-4 dark:border-orange-800">
                        <label className="flex cursor-pointer items-start gap-3 text-sm leading-7">
                          <input
                            type="checkbox"
                            checked={!!b.included}
                            onChange={(e) =>
                              update(b.id, { included: e.target.checked })
                            }
                            className="mt-1 h-5 w-5 shrink-0 accent-[#5271ff]"
                          />
                          <span>
                            Include image: {b.alt}
                            <span className="block break-all text-xs text-slate-600 dark:text-slate-300">
                              {b.src}
                            </span>
                          </span>
                        </label>
                      </div>
                    ) : editing ? (
                      <textarea
                        id={`article-block-${b.id}`}
                        dir="auto"
                        className={control}
                        rows={
                          b.kind === "table"
                            ? 6
                            : Math.min(
                                10,
                                Math.max(3, Math.ceil(b.text.length / 120)),
                              )
                        }
                        maxLength={b.kind === "table" ? 30000 : 12000}
                        value={
                          b.kind === "table"
                            ? b.cells?.map((r) => r.join("\t")).join("\n")
                            : b.text
                        }
                        onChange={(e) =>
                          update(
                            b.id,
                            b.kind === "table"
                              ? {
                                  cells: e.target.value
                                    .split("\n")
                                    .map((r) => r.split("\t")),
                                }
                              : { text: e.target.value },
                          )
                        }
                      />
                    ) : b.kind === "table" ? (
                      <div
                        className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-700"
                        role="region"
                        aria-label={`Article table ${n + 1}`}
                        tabIndex={0}
                      >
                        <table className="w-full text-left text-sm">
                          <tbody>
                            {b.cells?.map((row, r) => (
                              <tr key={r}>
                                {row.map((cell, c) =>
                                  b.header && r === 0 ? (
                                    <th
                                      key={c}
                                      className="border border-slate-200 bg-slate-50 p-3 dark:border-slate-700 dark:bg-slate-800"
                                    >
                                      {cell}
                                    </th>
                                  ) : (
                                    <td
                                      key={c}
                                      className="border border-slate-200 p-3 dark:border-slate-700"
                                    >
                                      {cell}
                                    </td>
                                  ),
                                )}
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    ) : b.kind === "heading" ? (
                      <h3 dir="auto" className="pt-2 text-lg font-bold">
                        {b.text}
                      </h3>
                    ) : (
                      <p
                        dir="auto"
                        className={`whitespace-pre-wrap break-words text-sm leading-7 ${b.kind === "quote" ? "italic text-slate-600 dark:text-slate-300" : ""} ${b.kind === "code" ? "rounded-xl bg-slate-50 p-4 font-mono text-xs dark:bg-slate-800" : ""}`}
                      >
                        {b.text}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      )}

      <ToolRunOverlay
        active={!!busy}
        title={
          busy === "pdf"
            ? `Creating your ${label}`
            : `Importing & converting your article to ${label}`
        }
        description={
          busy === "pdf"
            ? "Preparing your download file."
            : "Extracting article sections and generating your download."
        }
        onCancel={() => abort.current?.abort()}
        cancelLabel="Cancel"
        hint={`Your ready ${label} download button will appear immediately below.`}
      />
    </div>
  );
}
