"use client";

import { useMemo, useRef, useState, type FormEvent } from "react";
import {
  AlertTriangle,
  CheckCircle2,
  Copy,
  Download,
  Eye,
  FileText,
  Globe,
  ListTree,
  Sparkles,
  Trash2,
} from "lucide-react";
import ToolRunOverlay, {
  focusToolSection,
  paintToolFeedback,
} from "@/features/tool-ui/ToolRunOverlay";
import ToolUrlInput from "@/features/tool-ui/ToolUrlInput";
import {
  buildTocOutputs,
  extractTocHeadings,
  type TocDepth,
  type TocHeadingItem,
  type TocListStyle,
} from "./model";

const SAMPLE_ARTICLE_CONTENT = `<h2>What Is On-Page SEO Optimization?</h2>
<p>On-page SEO aligns headings, semantic entities, and structured passages with user intent.</p>
<h2>How to Audit Heading Hierarchy &amp; Jump Links</h2>
<p>Every H2 and H3 subheading should carry a clean id attribute so search engines can generate jump-to sitelinks.</p>
<h3>1. Use Descriptive Question &amp; Topic Headings</h3>
<p>Avoid vague labels like 'Introduction' or 'Conclusion'.</p>
<h3>2. Deduplicate Repeated Subheading Slugs</h3>
<p>Ensure identical subheadings receive numbered suffixes (-2, -3).</p>
<h2>How Jump Links Improve Featured Snippets &amp; CTR</h2>
<p>Clickable section links appear directly in Google SERP snippets and improve mobile navigation.</p>
<h2>Frequently Asked Questions</h2>
<p>Common questions answered below.</p>`;

const control =
  "w-full rounded-xl border border-slate-300 bg-transparent px-4 py-3 text-sm leading-6 focus:outline-none focus:ring-2 focus:ring-[#5271ff] dark:border-slate-600";
const panel =
  "rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-900 sm:p-7";
const primaryBtn =
  "inline-flex items-center justify-center gap-2 rounded-xl bg-[#3452d1] px-5 py-3 text-sm font-bold text-white hover:bg-[#2943b5] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#5271ff] disabled:opacity-50";
const secondaryBtn =
  "inline-flex items-center justify-center gap-2 rounded-xl border border-slate-300 px-4 py-2.5 text-sm font-semibold hover:bg-slate-100 focus-visible:outline-[#5271ff] dark:border-slate-600 dark:hover:bg-slate-800";
const clearBtn =
  "inline-flex items-center justify-center gap-2 rounded-xl border-2 border-rose-300 bg-rose-50/80 px-4 py-2.5 text-xs font-extrabold text-rose-700 transition hover:bg-rose-100 focus-visible:outline-[#5271ff] dark:border-rose-800 dark:bg-rose-950/40 dark:text-rose-200 dark:hover:bg-rose-900/50";

export default function TableOfContentsGeneratorClient() {
  // Start completely EMPTY on initial visit so users are never confused by pre-filled dummy content!
  const [mode, setMode] = useState<"paste" | "url">("paste");
  const [articleUrl, setArticleUrl] = useState("");
  const [inputContent, setInputContent] = useState("");
  const [maxDepth, setMaxDepth] = useState<TocDepth>(3);
  const [listStyle, setListStyle] = useState<TocListStyle>("ol");
  const [tocTitle, setTocTitle] = useState("Table of Contents");
  const [slugPrefix, setSlugPrefix] = useState("");
  const [pageUrl, setPageUrl] = useState(
    "https://doitwithai.tools/guides/on-page-seo",
  );
  const [customSlugs, setCustomSlugs] = useState<
    Record<number, { slug?: string; included?: boolean }>
  >({});
  const [activeTab, setActiveTab] = useState<
    "visual-preview" | "toc-html" | "full-html" | "markdown" | "schema"
  >("toc-html");
  const [selectedJumpSlug, setSelectedJumpSlug] = useState<string>("");
  const [wrapCode, setWrapCode] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [feedback, setFeedback] = useState("");

  const studioRef = useRef<HTMLDivElement>(null);
  const outputBoxRef = useRef<HTMLDivElement>(null);

  const baseItems = useMemo(
    () => extractTocHeadings(inputContent, maxDepth, slugPrefix),
    [inputContent, maxDepth, slugPrefix],
  );

  const mergedItems: TocHeadingItem[] = useMemo(
    () =>
      baseItems.map((it) => ({
        ...it,
        slug: customSlugs[it.index]?.slug ?? it.slug,
        included: customSlugs[it.index]?.included ?? it.included,
      })),
    [baseItems, customSlugs],
  );

  const built = useMemo(
    () =>
      buildTocOutputs({
        inputContent,
        items: mergedItems,
        tocTitle,
        listStyle,
        pageUrl,
      }),
    [inputContent, mergedItems, tocTitle, listStyle, pageUrl],
  );

  const currentCode =
    activeTab === "toc-html"
      ? built.tocHtml
      : activeTab === "full-html"
        ? built.updatedArticleHtml
        : activeTab === "markdown"
          ? built.tocMarkdown
          : built.jsonLdSchema;

  function triggerDownload(blob: Blob, filename: string) {
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }

  async function handleGenerateOrFetch(e: FormEvent) {
    e.preventDefault();
    if (busy) return;
    setError("");
    setFeedback("");

    if (mode === "url") {
      const rawUrl = articleUrl.trim();
      if (!rawUrl) {
        setError(
          "Enter a public article URL to extract headings from, or switch to 'Paste HTML or Markdown'.",
        );
        return;
      }
      setBusy(true);
      try {
        await paintToolFeedback();
        const normUrl = /^https?:\/\//i.test(rawUrl)
          ? rawUrl
          : `https://${rawUrl}`;
        const res = await fetch("/api/ai-tools/article-import", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ url: normUrl }),
        });
        const data = await res.json();
        if (!res.ok || !data?.article) {
          setError(
            data?.error?.message ||
              "Could not fetch headings from this URL. Switch to 'Paste HTML or Markdown' instead.",
          );
          return;
        }
        const art = data.article;
        const reconstructedHtml = (art.blocks || [])
          .map((b: any) => {
            if (b.kind === "heading") {
              const lvl = b.level && b.level >= 2 && b.level <= 4 ? b.level : 2;
              return `<h${lvl}>${b.text}</h${lvl}>`;
            }
            if (b.kind === "paragraph" && b.text) {
              return `<p>${b.text}</p>`;
            }
            return "";
          })
          .filter(Boolean)
          .join("\n");

        if (!reconstructedHtml.trim()) {
          setError(
            "No H2–H4 headings were found on that page. Try pasting your article HTML or Markdown.",
          );
          return;
        }
        setInputContent(reconstructedHtml);
        setPageUrl(art.source || normUrl);
        setCustomSlugs({});
        setFeedback(
          `Extracted headings from "${art.title}" and generated jump-link Table of Contents.`,
        );
        setTimeout(() => focusToolSection(studioRef.current), 60);
      } catch {
        setError(
          "Could not import that URL. Switch to 'Paste HTML or Markdown' mode.",
        );
      } finally {
        setBusy(false);
      }
      return;
    }

    if (!inputContent.trim()) {
      setError(
        "Paste your HTML or Markdown article first (or click 'Load Sample Article' to test).",
      );
      return;
    }

    setBusy(true);
    try {
      await paintToolFeedback();
      await new Promise((r) => setTimeout(r, 450));
      setFeedback(
        `Generated Table of Contents with ${mergedItems.filter((i) => i.included).length} jump-link anchors.`,
      );
      setTimeout(() => focusToolSection(studioRef.current), 50);
    } finally {
      setBusy(false);
    }
  }

  function handleLoadSample() {
    setMode("paste");
    setInputContent(SAMPLE_ARTICLE_CONTENT);
    setCustomSlugs({});
    setError("");
    setFeedback(
      "Loaded sample HTML article with 5 H2/H3 headings. Scroll or click any tab below to inspect the generated TOC.",
    );
    setTimeout(() => focusToolSection(studioRef.current), 80);
  }

  function handleClearAll() {
    setInputContent("");
    setArticleUrl("");
    setCustomSlugs({});
    setSelectedJumpSlug("");
    setError("");
    setFeedback("Cleared article input and reset Table of Contents studio.");
  }

  return (
    <div className="mx-auto w-full max-w-6xl overflow-x-clip px-4 py-12 sm:px-6">
      <ToolRunOverlay
        active={busy}
        title="Generating SEO Table of Contents & Jump Links"
        description="Extracting H2–H4 heading hierarchy, deduplicating URL-safe #anchor slugs, and building <nav> HTML & ItemList JSON-LD."
      />

      <form
        onSubmit={handleGenerateOrFetch}
        noValidate
        className={`${panel} min-w-0`}
      >
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="flex items-center gap-2.5 text-2xl font-extrabold">
              <ListTree aria-hidden className="text-[#5271ff]" />
              Generate SEO Table of Contents &amp; Inject Heading Anchor IDs
            </h2>
            <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
              Paste your HTML/Markdown article or fetch a live URL to build a
              crawlable, JavaScript-free Table of Contents, inject{" "}
              <code>id</code> attributes into headings, and generate Jump-Link
              JSON-LD schema.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2.5">
            <button
              type="button"
              onClick={handleLoadSample}
              className={secondaryBtn}
            >
              <Sparkles size={16} className="text-[#5271ff]" />
              Load Sample Article
            </button>
            {(inputContent.trim().length > 0 ||
              articleUrl.trim().length > 0) && (
              <button
                type="button"
                onClick={handleClearAll}
                className={clearBtn}
              >
                <Trash2 size={15} />
                Clear Input
              </button>
            )}
          </div>
        </div>

        {/* Input Mode Tabs */}
        <div
          role="tablist"
          aria-label="TOC source input mode"
          className="mt-6 grid gap-3 sm:grid-cols-2"
        >
          {[
            {
              id: "paste" as const,
              label: "1. Paste HTML or Markdown Article",
              sub: "Paste <h2>/<h3> HTML or ## / ### Markdown headings",
              icon: FileText,
            },
            {
              id: "url" as const,
              label: "2. Fetch Live Article URL",
              sub: "Automatically extract headings & sections from a live URL",
              icon: Globe,
            },
          ].map((tab) => {
            const Icon = tab.icon;
            const active = mode === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                role="tab"
                aria-selected={active}
                onClick={() => {
                  setMode(tab.id);
                  setError("");
                }}
                className={`flex items-start gap-3 rounded-xl border p-4 text-left transition ${
                  active
                    ? "border-[#3452d1] bg-[#3452d1]/5 ring-2 ring-[#3452d1]/20 dark:border-[#5271ff] dark:bg-[#5271ff]/10"
                    : "border-slate-200 hover:bg-slate-50 dark:border-slate-700 dark:hover:bg-slate-800/60"
                }`}
              >
                <Icon
                  size={20}
                  className={
                    active
                      ? "mt-0.5 shrink-0 text-[#3452d1] dark:text-[#9aabff]"
                      : "mt-0.5 shrink-0 text-slate-400"
                  }
                />
                <div>
                  <p className="text-sm font-bold">{tab.label}</p>
                  <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
                    {tab.sub}
                  </p>
                </div>
              </button>
            );
          })}
        </div>

        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <label htmlFor="toc-title" className="block text-xs font-bold">
              TOC Heading Title
            </label>
            <input
              id="toc-title"
              type="text"
              value={tocTitle}
              onChange={(e) => setTocTitle(e.target.value)}
              className={`${control} mt-1`}
            />
          </div>
          <div>
            <label htmlFor="toc-depth" className="block text-xs font-bold">
              Heading Levels Included
            </label>
            <select
              id="toc-depth"
              value={maxDepth}
              onChange={(e) =>
                setMaxDepth(Number(e.target.value) as TocDepth)
              }
              className={`${control} mt-1 dark:bg-slate-900`}
            >
              <option value={2}>H2 Headings Only</option>
              <option value={3}>H2 + H3 Headings (Recommended)</option>
              <option value={4}>H2 + H3 + H4 Headings</option>
            </select>
          </div>
          <div>
            <label htmlFor="toc-style" className="block text-xs font-bold">
              HTML List Tag
            </label>
            <select
              id="toc-style"
              value={listStyle}
              onChange={(e) => setListStyle(e.target.value as TocListStyle)}
              className={`${control} mt-1 dark:bg-slate-900`}
            >
              <option value="ol">Ordered List (&lt;ol&gt;)</option>
              <option value="ul">Unordered List (&lt;ul&gt;)</option>
            </select>
          </div>
          <div>
            <label htmlFor="toc-page-url" className="block text-xs font-bold">
              Canonical Page URL (for JSON-LD)
            </label>
            <input
              id="toc-page-url"
              type="url"
              value={pageUrl}
              onChange={(e) => setPageUrl(e.target.value)}
              className={`${control} mt-1`}
            />
          </div>
        </div>

        {mode === "url" ? (
          <div className="mt-5">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <label
                htmlFor="toc-live-url"
                className="block text-sm font-bold"
              >
                Public Article URL (required)
              </label>
              {articleUrl.trim().length > 0 && (
                <button
                  type="button"
                  onClick={handleClearAll}
                  className={clearBtn}
                >
                  <Trash2 size={14} />
                  Clear URL
                </button>
              )}
            </div>
            <ToolUrlInput
              id="toc-live-url"
              value={articleUrl}
              onChange={(e) => {
                setArticleUrl(e.target.value);
                setError("");
              }}
              placeholder="https://example.com/your-article"
              className={`${control} mt-1.5`}
            />
          </div>
        ) : (
          <div className="mt-5">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <label
                htmlFor="toc-source-input"
                className="block text-sm font-bold"
              >
                Paste HTML or Markdown Article
              </label>
              <button
                type="button"
                onClick={handleClearAll}
                disabled={!inputContent.trim()}
                className={`${clearBtn} disabled:opacity-40`}
              >
                <Trash2 size={14} />
                Clear Input
              </button>
            </div>
            <textarea
              id="toc-source-input"
              rows={7}
              value={inputContent}
              onChange={(e) => {
                setInputContent(e.target.value);
                setCustomSlugs({});
                setError("");
              }}
              placeholder="Paste your article HTML with <h2>/<h3> tags or Markdown with ## / ### headings here (or click 'Load Sample Article' above)..."
              className={`${control} mt-1.5 font-mono text-xs`}
            />
          </div>
        )}

        {error && (
          <div
            role="alert"
            className="mt-4 flex items-start gap-2.5 rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm font-semibold text-rose-800 dark:border-rose-900/60 dark:bg-rose-950/40 dark:text-rose-200"
          >
            <AlertTriangle size={18} className="mt-0.5 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {feedback && !error && (
          <p
            role="status"
            className="mt-4 flex items-center gap-2 text-sm font-semibold text-emerald-700 dark:text-emerald-300"
          >
            <CheckCircle2 size={16} className="shrink-0" />
            <span>{feedback}</span>
          </p>
        )}

        <div className="mt-5 flex flex-wrap items-center gap-3">
          <button type="submit" disabled={busy} className={primaryBtn}>
            <ListTree size={18} />
            {mode === "url"
              ? "Fetch URL & Generate Table of Contents"
              : "Generate Table of Contents & Jump Links"}
          </button>
        </div>
      </form>

      {/* Interactive Heading Slug Editor & Output Code Studio */}
      {mergedItems.length > 0 ? (
        <div
          ref={studioRef}
          tabIndex={-1}
          className={`${panel} mt-8 min-w-0 scroll-mt-24 focus:outline-none`}
        >
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 pb-4 dark:border-slate-700">
            <div>
              <span className="text-xs font-extrabold uppercase tracking-wider text-[#5271ff]">
                Step 2 · Interactive Jump-Link Studio
              </span>
              <h3 className="mt-0.5 text-xl font-black">
                {mergedItems.filter((i) => i.included).length} Active Jump-Link
                Headings Ready
              </h3>
            </div>
          </div>

          <div className="mt-6 grid min-w-0 grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.25fr)]">
            <div className="min-w-0 rounded-xl border border-slate-200 p-4 dark:border-slate-700">
              <h4 className="text-base font-extrabold">
                Detected Headings &amp; Editable Anchor Slugs (
                {mergedItems.length})
              </h4>
              <p className="mt-1 text-xs text-slate-500">
                Click any heading to preview its jump link in the studio on the
                right, uncheck to exclude, or edit its <code>#anchor-slug</code>.
              </p>
              <div className="mt-3 max-h-[420px] space-y-2 overflow-y-auto overflow-x-hidden pr-1">
                {mergedItems.map((it) => {
                  const isHighlighted = selectedJumpSlug === it.slug;
                  return (
                    <div
                      key={it.index}
                      className={`flex min-w-0 flex-col gap-2 rounded-xl border p-2.5 text-xs transition ${
                        isHighlighted
                          ? "border-[#3452d1] bg-blue-50/70 ring-2 ring-[#3452d1]/20 dark:border-[#5271ff] dark:bg-blue-950/30"
                          : "border-slate-200 hover:bg-slate-50 dark:border-slate-700 dark:hover:bg-slate-800/40"
                      }`}
                    >
                      <div className="flex min-w-0 items-start gap-2 font-semibold">
                        <input
                          type="checkbox"
                          checked={it.included}
                          aria-label={`Include ${it.text}`}
                          onChange={() =>
                            setCustomSlugs((prev) => ({
                              ...prev,
                              [it.index]: {
                                ...prev[it.index],
                                included: !it.included,
                              },
                            }))
                          }
                          className="mt-0.5 h-4 w-4 shrink-0 rounded border-slate-300 text-[#3452d1]"
                        />
                        <span className="shrink-0 rounded bg-slate-100 px-1.5 py-0.5 font-mono text-[10px] font-bold dark:bg-slate-800">
                          H{it.level}
                        </span>
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedJumpSlug(it.slug);
                            setActiveTab("visual-preview");
                            focusToolSection(outputBoxRef.current);
                          }}
                          className="min-w-0 break-words text-left font-bold text-slate-800 hover:text-[#3452d1] hover:underline dark:text-slate-100 dark:hover:text-[#9aabff]"
                        >
                          {it.text}
                        </button>
                      </div>
                      <input
                        type="text"
                        aria-label={`Anchor slug for ${it.text}`}
                        value={it.slug}
                        onChange={(e) =>
                          setCustomSlugs((prev) => ({
                            ...prev,
                            [it.index]: {
                              ...prev[it.index],
                              slug: e.target.value,
                            },
                          }))
                        }
                        className="w-full min-w-0 rounded-lg border border-slate-300 bg-transparent px-2.5 py-1.5 font-mono text-[11px] dark:border-slate-600"
                      />
                    </div>
                  );
                })}
              </div>
            </div>

            <div
              ref={outputBoxRef}
              tabIndex={-1}
              className="min-w-0 scroll-mt-24 rounded-xl border border-slate-200 p-4 focus:outline-none dark:border-slate-700"
            >
              <div className="flex min-w-0 flex-wrap items-center justify-between gap-2">
                <div className="flex min-w-0 flex-wrap gap-1.5">
                  {[
                    { id: "toc-html" as const, label: "1. TOC <nav> HTML" },
                    {
                      id: "full-html" as const,
                      label: "2. Full HTML + Injected IDs",
                    },
                    { id: "markdown" as const, label: "3. Markdown TOC" },
                    { id: "schema" as const, label: "4. ItemList JSON-LD" },
                    {
                      id: "visual-preview" as const,
                      label: "5. Live Interactive Preview",
                    },
                  ].map((t) => (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => {
                        setActiveTab(t.id);
                        focusToolSection(outputBoxRef.current);
                      }}
                      className={`rounded-lg border px-2.5 py-1.5 text-xs font-bold transition ${
                        activeTab === t.id
                          ? "border-[#3452d1] bg-[#3452d1] text-white shadow-xs"
                          : "border-slate-300 hover:bg-slate-100 dark:border-slate-600 dark:hover:bg-slate-800"
                      }`}
                    >
                      {t.label}
                    </button>
                  ))}
                </div>
                {activeTab !== "visual-preview" && (
                  <div className="flex flex-wrap gap-1.5">
                    <button
                      type="button"
                      aria-pressed={wrapCode}
                      onClick={() => setWrapCode((v) => !v)}
                      className={secondaryBtn}
                    >
                      {wrapCode ? "No Wrap" : "Wrap Lines"}
                    </button>
                    <button
                      type="button"
                      onClick={async () => {
                        await navigator.clipboard.writeText(currentCode);
                        setFeedback("Copied output code to clipboard.");
                      }}
                      className={primaryBtn}
                    >
                      <Copy size={14} />
                      Copy
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        const ext =
                          activeTab === "markdown"
                            ? "md"
                            : activeTab === "schema"
                              ? "json"
                              : "html";
                        triggerDownload(
                          new Blob([currentCode], {
                            type: "text/plain;charset=utf-8",
                          }),
                          `seo-table-of-contents.${ext}`,
                        );
                        setFeedback(`Downloaded seo-table-of-contents.${ext}`);
                      }}
                      className={secondaryBtn}
                    >
                      <Download size={14} />
                      Save
                    </button>
                  </div>
                )}
              </div>

              {activeTab === "visual-preview" ? (
                <div className="mt-3 space-y-4">
                  <div className="rounded-xl border border-blue-200 bg-blue-50/40 p-4 dark:border-blue-900/50 dark:bg-blue-950/20">
                    <p className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[#3452d1] dark:text-[#9aabff]">
                      <Eye size={14} />
                      Rendered Table of Contents Box (Click any jump link)
                    </p>
                    <p className="mt-2 text-base font-extrabold">{tocTitle}</p>
                    <ul className="mt-2.5 space-y-1.5 text-xs">
                      {mergedItems
                        .filter((i) => i.included)
                        .map((item, idx) => (
                          <li
                            key={item.index}
                            style={{
                              paddingLeft: `${Math.max(0, item.level - 2) * 16}px`,
                            }}
                          >
                            <button
                              type="button"
                              onClick={() => setSelectedJumpSlug(item.slug)}
                              className={`break-words text-left font-semibold hover:underline ${
                                selectedJumpSlug === item.slug
                                  ? "font-extrabold text-[#3452d1] underline dark:text-[#9aabff]"
                                  : "text-slate-700 dark:text-slate-200"
                              }`}
                            >
                              {listStyle === "ol" ? `${idx + 1}. ` : "• "}
                              {item.text}{" "}
                              <span className="break-all font-mono text-[10px] text-slate-400">
                                (#{item.slug})
                              </span>
                            </button>
                          </li>
                        ))}
                    </ul>
                  </div>

                  {selectedJumpSlug && (
                    <div className="rounded-xl border-2 border-emerald-400 bg-emerald-50/60 p-3.5 text-xs dark:border-emerald-700 dark:bg-emerald-950/30">
                      <p className="font-extrabold text-emerald-900 dark:text-emerald-200">
                        Active Target Jump-Link Section:{" "}
                        <code className="break-all">#{selectedJumpSlug}</code>
                      </p>
                      <p className="mt-1 break-all font-mono text-[11px] text-emerald-800 dark:text-emerald-300">
                        Full SERP Jump URL: {pageUrl.replace(/#.*$/, "")}#
                        {selectedJumpSlug}
                      </p>
                    </div>
                  )}
                </div>
              ) : (
                <pre
                  className={`mt-3 max-h-[380px] w-full max-w-full overflow-auto rounded-xl border border-slate-200 bg-slate-950 p-4 font-mono text-xs leading-6 text-emerald-300 dark:border-slate-700 ${
                    wrapCode
                      ? "whitespace-pre-wrap break-words"
                      : "whitespace-pre"
                  }`}
                >
                  {currentCode}
                </pre>
              )}
            </div>
          </div>
        </div>
      ) : (
        <div className="mt-6 rounded-2xl border border-dashed border-slate-300 bg-slate-50/50 p-8 text-center dark:border-slate-700 dark:bg-slate-900/40">
          <ListTree
            size={28}
            className="mx-auto text-[#5271ff]"
            aria-hidden="true"
          />
          <h3 className="mt-3 text-base font-extrabold">
            Ready to Generate Your SEO Table of Contents
          </h3>
          <p className="mx-auto mt-1 max-w-xl text-xs leading-5 text-slate-500 dark:text-slate-400">
            Paste your article HTML or Markdown above, enter a live article URL,
            or click <strong>Load Sample Article</strong> to inspect crawlable{" "}
            <code>&lt;nav&gt;</code> jump links and JSON-LD schema.
          </p>
        </div>
      )}
    </div>
  );
}
