"use client";
import styles from "./article-preview.module.css";
import { useEffect, useRef, useState, type FormEvent } from "react";
import { Download, FileText, Pencil, Trash2, ChevronDown } from "lucide-react";
import ToolRunOverlay, {
  focusToolSection,
  paintToolFeedback,
} from "../tool-ui/ToolRunOverlay";
import ToolUrlInput from "../tool-ui/ToolUrlInput";
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
  pages: number;
  bytes: number;
  warnings: string[];
  snapshot: string;
};
export default function ArticlePdfClient() {
  const [mode, setMode] = useState<"url" | "text" | "html">("url"),
    [source, setSource] = useState(""),
    [content, setContent] = useState(""),
    [article, setArticle] = useState<Article | null>(null),
    [settings, setSettings] = useState(defaults),
    [editing, setEditing] = useState(false),
    [busy, setBusy] = useState<"" | "import" | "pdf">(""),
    [errors, setErrors] = useState<{ source?: string; content?: string }>({}),
    [message, setMessage] = useState(""),
    [result, setResult] = useState<Result | null>(null),
    [revision, setRevision] = useState(0),
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
        destination === "review" ? review.current : done.current,
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
      ...a,
      blocks: a.blocks.map((b) => (b.id === id ? { ...b, ...value } : b)),
    }));
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
        setDestination("review");
        setRevision((n) => n + 1);
        setMessage(
          "Preview ready. Check the source and text before creating the PDF.",
        );
      }
    } catch (error) {
      if (mounted.current) {
        const msg = c.signal.aborted
          ? "Import cancelled. Your existing preview and PDF have been kept."
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
    const err = validate(article);
    if (err) {
      setMessage(err);
      if (!article.title.trim())
        document.getElementById("article-title")?.focus();
      return;
    }
    const c = new AbortController();
    abort.current = c;
    setBusy("pdf");
    setMessage("");
    try {
      await paintToolFeedback();
      c.signal.throwIfAborted();
      const { articlePdf, loadFonts } = await import("./pdf");
      const fonts = await loadFonts(
        AbortSignal.any([c.signal, AbortSignal.timeout(18000)]),
      );
      const images: Record<string, string> = {};
      for (const image of article.blocks
        .filter((b) => b.kind === "image" && b.included)
        .slice(0, 6)) {
        c.signal.throwIfAborted();
        try {
          const res = await fetch("/api/ai-tools/article-image", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ url: image.src }),
            signal: AbortSignal.any([c.signal, AbortSignal.timeout(10000)]),
          });
          const data = await res.json();
          if (
            res.ok &&
            typeof data.data === "string" &&
            /^data:image\/(png|jpeg);base64,/.test(data.data)
          )
            images[image.id] = data.data;
        } catch {
          c.signal.throwIfAborted();
        }
      }
      const built = await articlePdf(article, settings, {
        ...fonts,
        images,
        signal: c.signal,
        yield: () => new Promise((r) => setTimeout(r, 0)),
      });
      c.signal.throwIfAborted();
      const blob = new Blob([built.bytes], { type: "application/pdf" }),
        url = URL.createObjectURL(blob);
      if (mounted.current) {
        setResult({
          url,
          name: filename(article.title),
          pages: built.pages,
          bytes: blob.size,
          warnings: built.warnings,
          snapshot: JSON.stringify({ article, settings }),
        });
        setDestination("result");
        setRevision((n) => n + 1);
        setMessage("PDF ready. Download your file below.");
      } else URL.revokeObjectURL(url);
    } catch (error) {
      if (mounted.current)
        setMessage(
          c.signal.aborted
            ? "PDF creation cancelled. Your previous file has been kept."
            : error instanceof Error
              ? error.message
              : "PDF creation failed. Check the article and retry.",
        );
    } finally {
      if (mounted.current) setBusy("");
    }
  }
  return (
    <div className={`${styles.root} mx-auto max-w-6xl px-4 py-12 sm:px-6`}>
      <form onSubmit={preview} noValidate className={panel} aria-busy={!!busy}>
        <h2 className="flex items-center gap-3 text-2xl font-extrabold">
          <FileText
            aria-hidden
            className="text-[#9A3412] dark:text-[#FDBA74]"
          />
          Import your article
        </h2>
        <p className="mt-3 text-sm leading-7 text-slate-600 dark:text-slate-300">
          Use a public URL, or paste content when a page blocks imports or needs
          JavaScript.
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
              Create article preview
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
                  "Fictional example loaded. Create a preview to test the workflow.",
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
      {article && (
        <section
          ref={review}
          tabIndex={-1}
          aria-labelledby="article-review-title"
          className={`${panel} scroll-mt-28 focus:outline focus:outline-2 focus:outline-[#5271ff]`}
        >
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-[#9A3412] dark:text-[#FDBA74]">
                Step 2 · Review the source
              </p>
              <h2
                id="article-review-title"
                className="mt-2 text-2xl font-extrabold"
              >
                Review your article
              </h2>
            </div>
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
          <p className="mt-3 text-sm leading-7 text-slate-600 dark:text-slate-300">
            {article.method}. Metadata is copied only when found. Review the
            attribution and date; missing fields remain blank.
          </p>
          <details
            open
            className="mt-5 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm leading-7 text-amber-900 dark:border-amber-900 dark:bg-amber-950/30 dark:text-amber-200"
          >
            <summary className="cursor-pointer font-bold">
              Import notes ({article.warnings.length})
            </summary>
            <ul className="mt-2 list-disc space-y-2 pl-5">
              {article.warnings.map((w) => (
                <li key={w}>{w}</li>
              ))}
            </ul>
          </details>
          <div className="mt-6 grid gap-5 sm:grid-cols-2">
            {(
              [
                ["title", "Article title (required)"],
                ["byline", "Byline (review source attribution)"],
                ["published", "Date from source (optional)"],
              ] as const
            ).map(([id, label]) => (
              <div key={id} className={id === "title" ? "sm:col-span-2" : ""}>
                <label
                  htmlFor={`article-${id}`}
                  className="mb-2 block text-sm font-bold"
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
                    setArticle((a) => ({ ...a, [id]: e.target.value }))
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
            <p className="mt-5 break-all text-sm leading-7">
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
          <div className="mt-7 space-y-5">
            {article.blocks.map((b, n) => (
              <div
                key={b.id}
                className={
                  editing
                    ? "rounded-xl border border-slate-200 p-4 dark:border-slate-700"
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
                          ...a,
                          blocks: a.blocks.filter((old) => old.id !== b.id),
                        }))
                      }
                    >
                      <Trash2 size={17} aria-hidden />
                    </button>
                  </div>
                )}
                {b.kind === "image" ? (
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
                    <p className="mt-2 text-xs leading-6 text-slate-600 dark:text-slate-300">
                      Only selected images are requested during export. PNG/JPEG
                      up to 1.5 MB and 12 megapixels are supported.
                    </p>
                  </div>
                ) : editing ? (
                  <>
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
                    {b.kind === "table" && (
                      <p className="mt-2 text-xs leading-6">
                        Table editing: one row per line, tabs between cells.
                        Paste from a spreadsheet if needed.
                      </p>
                    )}
                  </>
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
                  <h3 dir="auto" className="pt-3 text-xl font-bold">
                    {b.text}
                  </h3>
                ) : (
                  <p
                    dir="auto"
                    className={`whitespace-pre-wrap break-words text-base leading-8 ${b.kind === "quote" ? "italic text-slate-600 dark:text-slate-300" : ""} ${b.kind === "code" ? "rounded-xl bg-slate-50 p-4 font-mono text-sm dark:bg-slate-800" : ""}`}
                  >
                    {b.text}
                  </p>
                )}
              </div>
            ))}
          </div>
          {article.links.length > 0 && (
            <details className="mt-6 rounded-xl border border-slate-200 p-4 dark:border-slate-700">
              <summary className="cursor-pointer text-sm font-bold">
                Article link references ({article.links.length})
              </summary>
              <ol className="mt-3 list-decimal space-y-2 pl-5">
                {article.links.map((l, n) => (
                  <li key={n} className="break-all text-sm leading-7">
                    <a
                      href={safeLink(l.url)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[#3452d1] underline dark:text-[#b4c3ff]"
                    >
                      {l.label}
                    </a>
                  </li>
                ))}
              </ol>
            </details>
          )}
          <details className="mt-7 rounded-xl border border-slate-200 p-4 dark:border-slate-700">
            <summary className="flex cursor-pointer list-none items-center justify-between text-sm font-bold">
              PDF layout options
              <ChevronDown size={18} aria-hidden />
            </summary>
            <div className="mt-5 grid gap-5 sm:grid-cols-2">
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
                    className="mb-2 block text-sm font-bold"
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
          </details>
          <p className="mt-5 text-sm leading-7 text-slate-600 dark:text-slate-300">
            The PDF preserves the reviewed wording in a reading layout. Links
            become numbered references. Website styling, media, and complex
            table layouts are simplified.
          </p>
          <button
            type="button"
            className={`${primary} mt-5`}
            disabled={!!busy}
            onClick={create}
          >
            <FileText size={17} aria-hidden />
            Create downloadable PDF
          </button>
        </section>
      )}
      {result && (
        <section
          ref={done}
          tabIndex={-1}
          aria-labelledby="article-result-title"
          className={`${panel} mt-7 scroll-mt-28 focus:outline focus:outline-2 focus:outline-[#5271ff]`}
        >
          <p className="text-xs font-bold uppercase tracking-widest text-[#9A3412] dark:text-[#FDBA74]">
            Step 3 · Save your reading copy
          </p>
          <h2
            id="article-result-title"
            className="mt-2 text-2xl font-extrabold"
          >
            Your PDF is ready
          </h2>
          <p className="mt-3 break-words text-sm leading-7 text-slate-600 dark:text-slate-300">
            {result.pages} {result.pages === 1 ? "page" : "pages"} ·{" "}
            {(result.bytes / 1024).toFixed(0)} KB · {result.name}
          </p>
          {result.snapshot !== JSON.stringify({ article, settings }) && (
            <p className="mt-4 text-sm font-bold text-amber-800 dark:text-amber-200">
              The article or layout changed. Create the PDF again to include
              your latest edits.
            </p>
          )}
          {result.warnings.length > 0 && (
            <ul className="mt-4 list-disc space-y-2 pl-5 text-sm leading-7 text-amber-800 dark:text-amber-200">
              {result.warnings.map((w) => (
                <li key={w}>{w}</li>
              ))}
            </ul>
          )}
          <div className="mt-5 flex flex-wrap gap-3">
            <a href={result.url} download={result.name} className={primary}>
              <Download size={17} aria-hidden />
              Download PDF
            </a>
            <a
              href={result.url}
              target="_blank"
              rel="noopener noreferrer"
              className={button}
            >
              Open PDF preview
            </a>
          </div>
          <p className="mt-4 text-xs leading-6 text-slate-600 dark:text-slate-300">
            Download before leaving. Edits and generated files are not saved
            between visits.
          </p>
        </section>
      )}
      <ToolRunOverlay
        active={!!busy}
        title={busy === "pdf" ? "Creating your PDF" : "Importing your article"}
        description={
          busy === "pdf"
            ? "Laying out reviewed text and selected images."
            : "Preparing a clean article preview."
        }
        onCancel={() => abort.current?.abort()}
        cancelLabel="Cancel"
        hint="The completed preview or PDF will open below."
      />
    </div>
  );
}
