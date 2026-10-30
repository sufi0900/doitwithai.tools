"use client";

import { useMemo, useState } from "react";
import {
  Copy,
  Download,
  ListTree,
  RefreshCw,
  Sparkles,
} from "lucide-react";
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

export default function TableOfContentsGeneratorClient() {
  const [inputContent, setInputContent] = useState(SAMPLE_ARTICLE_CONTENT);
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
    "toc-html" | "full-html" | "markdown" | "schema"
  >("toc-html");
  const [feedback, setFeedback] = useState("");

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

  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
      <div className={panel}>
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="flex items-center gap-2.5 text-2xl font-extrabold">
              <ListTree aria-hidden className="text-[#5271ff]" />
              Generate SEO Table of Contents & Inject Heading Anchor IDs
            </h2>
            <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
              Paste your HTML or Markdown article to generate a crawlable,
              JavaScript-free Table of Contents, inject <code>id</code>{" "}
              attributes into your headings, and build Jump-Link JSON-LD schema.
            </p>
          </div>
          <button
            type="button"
            onClick={() => {
              setInputContent(SAMPLE_ARTICLE_CONTENT);
              setCustomSlugs({});
              setFeedback("Loaded sample HTML article with H2 & H3 headings.");
            }}
            className={secondaryBtn}
          >
            <Sparkles size={16} className="text-[#5271ff]" />
            Load Sample Article
          </button>
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

        <div className="mt-5">
          <div className="flex items-center justify-between">
            <label
              htmlFor="toc-source-input"
              className="block text-sm font-bold"
            >
              Paste HTML or Markdown Article
            </label>
            <button
              type="button"
              onClick={() => {
                setInputContent("");
                setCustomSlugs({});
              }}
              className="inline-flex items-center gap-1 text-xs font-semibold text-slate-500 hover:text-slate-800"
            >
              <RefreshCw size={12} />
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
            }}
            placeholder="Paste HTML with <h2>/<h3> tags or Markdown with ## / ### headings..."
            className={`${control} mt-1.5 font-mono text-xs`}
          />
        </div>

        {feedback && (
          <p
            role="status"
            className="mt-4 text-sm font-medium text-emerald-700 dark:text-emerald-300"
          >
            {feedback}
          </p>
        )}

        {/* Interactive Heading Slug Editor & Output Code Studio */}
        <div className="mt-8 grid gap-6 lg:grid-cols-[1.05fr_1.15fr]">
          <div className="rounded-xl border border-slate-200 p-4 dark:border-slate-700">
            <h3 className="text-base font-extrabold">
              Detected Headings & Editable Jump-Link Slugs ({mergedItems.length})
            </h3>
            <p className="mt-1 text-xs text-slate-500">
              Uncheck any heading to exclude it from the TOC or customize its{" "}
              <code>#anchor-slug</code>.
            </p>
            <div className="mt-3 max-h-[380px] space-y-2 overflow-y-auto pr-1">
              {mergedItems.map((it) => (
                <div
                  key={it.index}
                  className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-slate-200 p-2.5 text-xs dark:border-slate-700"
                >
                  <label className="flex items-center gap-2 font-semibold">
                    <input
                      type="checkbox"
                      checked={it.included}
                      onChange={() =>
                        setCustomSlugs((prev) => ({
                          ...prev,
                          [it.index]: {
                            ...prev[it.index],
                            included: !it.included,
                          },
                        }))
                      }
                      className="h-4 w-4 rounded border-slate-300 text-[#3452d1]"
                    />
                    <span className="rounded bg-slate-100 px-1.5 py-0.5 font-mono text-[10px] dark:bg-slate-800">
                      H{it.level}
                    </span>
                    <span>{it.text}</span>
                  </label>
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
                    className="w-44 rounded border border-slate-300 bg-transparent px-2 py-1 font-mono text-[11px] dark:border-slate-600"
                  />
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-xl border border-slate-200 p-4 dark:border-slate-700">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex flex-wrap gap-1.5">
                {[
                  { id: "toc-html" as const, label: "1. TOC <nav> HTML" },
                  {
                    id: "full-html" as const,
                    label: "2. Full HTML + Injected IDs",
                  },
                  { id: "markdown" as const, label: "3. Markdown TOC" },
                  { id: "schema" as const, label: "4. ItemList JSON-LD" },
                ].map((t) => (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => setActiveTab(t.id)}
                    className={`rounded-lg border px-2.5 py-1.5 text-xs font-bold ${
                      activeTab === t.id
                        ? "border-[#3452d1] bg-[#3452d1] text-white"
                        : "border-slate-300 dark:border-slate-600"
                    }`}
                  >
                    {t.label}
                  </button>
                ))}
              </div>
              <div className="flex gap-1.5">
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
            </div>

            <pre className="mt-3 max-h-[360px] overflow-auto rounded-xl border border-slate-200 bg-slate-950 p-4 font-mono text-xs leading-6 text-emerald-300 dark:border-slate-700">
              {currentCode}
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
}
