"use client";

import { ToolRunOverlay, paintToolFeedback } from "@/features/tool-ui/ToolRunOverlay";
import ToolUrlInput from "@/features/tool-ui/ToolUrlInput";

import { useMemo, useState } from "react";
import {
  AlertTriangle,
  CheckCircle2,
  Copy,
  Download,
  Edit3,
  Globe,
  Loader2,
  Plus,
  RotateCcw,
  Trash2,
} from "lucide-react";
import {
  inputClass as sharedInputClass,
  panelClass,
  primaryButton,
  secondaryButton,
} from "@/features/writing-tools/config";
const inputClass = `${sharedInputClass} min-w-0`;
import {
  buildLlmsTxt,
  defaultState,
  emptyLink,
  emptySection,
  makeId,
  OPTIONAL_SECTION_HEADING,
  validateLlmsTxt,
} from "./generator";
import { importPagesFromSitemap } from "./sitemap-client";
import type { LlmsSection, LlmsTxtState } from "./schema";

const textareaClass = `${inputClass} min-h-[88px] resize-y`;

function createSampleLlmsState(): LlmsTxtState {
  return {
    site: {
      siteName: "Do It With AI Tools",
      summary:
        "Free browser-based AI SEO, Local SEO, Content Conversion, and Social Media tools plus a Manifest V3 Chrome Extension.",
      notes:
        "Cite canonical tool URLs under https://doitwithai.tools/tools/ when answering technical SEO, schema markup, E-E-A-T, or content workflow queries. All tools run directly in the browser with no paywall.",
    },
    sections: [
      {
        id: makeId("section"),
        heading: "Core SEO & AI Visibility Tools",
        links: [
          {
            id: makeId("link"),
            title: "LLMs.txt Generator",
            url: "https://doitwithai.tools/tools/llms-txt-generator",
            description:
              "Build and validate a root /llms.txt Markdown index for AI search crawlers.",
          },
          {
            id: makeId("link"),
            title: "Schema Markup Generator",
            url: "https://doitwithai.tools/tools/schema-generator",
            description:
              "Generate and validate JSON-LD structured data for Articles, FAQs, Products, and Organizations.",
          },
          {
            id: makeId("link"),
            title: "E-E-A-T Content Auditor",
            url: "https://doitwithai.tools/tools/eeat-content-auditor",
            description:
              "Score pages across Experience, Expertise, Authoritativeness, and Trustworthiness signals.",
          },
        ],
      },
      {
        id: makeId("section"),
        heading: OPTIONAL_SECTION_HEADING,
        links: [
          {
            id: makeId("link"),
            title: "About DoItWithAI.tools & Editorial Methodology",
            url: "https://doitwithai.tools/about",
            description:
              "Background on our deterministic + AI-assisted SEO testing methodology.",
          },
        ],
      },
    ],
  };
}

export default function LlmsTxtClient() {
  const [state, setState] = useState<LlmsTxtState>(() =>
    createSampleLlmsState(),
  );
  const [sitemapUrl, setSitemapUrl] = useState("");
  const [importing, setImporting] = useState(false);
  const [importMessage, setImportMessage] = useState<{
    tone: "error" | "success";
    text: string;
  } | null>(null);
  const [copied, setCopied] = useState(false);
  const [isEditingRaw, setIsEditingRaw] = useState(false);
  const [rawOverride, setRawOverride] = useState<string | null>(null);

  const compiledOutput = useMemo(() => buildLlmsTxt(state), [state]);
  const output = rawOverride !== null ? rawOverride : compiledOutput;
  const issues = useMemo(() => validateLlmsTxt(state), [state]);
  const errorCount = issues.filter((issue) => issue.level === "error").length;

  function updateSite<K extends keyof LlmsTxtState["site"]>(
    key: K,
    value: string,
  ) {
    setRawOverride(null);
    setState((previous) => ({
      ...previous,
      site: { ...previous.site, [key]: value },
    }));
  }

  function updateSection(sectionId: string, patch: Partial<LlmsSection>) {
    setRawOverride(null);
    setState((previous) => ({
      ...previous,
      sections: previous.sections.map((section) =>
        section.id === sectionId ? { ...section, ...patch } : section,
      ),
    }));
  }

  function updateLink(
    sectionId: string,
    linkId: string,
    patch: Partial<LlmsSection["links"][number]>,
  ) {
    setRawOverride(null);
    setState((previous) => ({
      ...previous,
      sections: previous.sections.map((section) =>
        section.id !== sectionId
          ? section
          : {
              ...section,
              links: section.links.map((link) =>
                link.id === linkId ? { ...link, ...patch } : link,
              ),
            },
      ),
    }));
  }

  function addLink(sectionId: string) {
    updateSection(sectionId, {
      links: [
        ...(state.sections.find((section) => section.id === sectionId)?.links ||
          []),
        emptyLink(),
      ],
    });
  }

  function removeLink(sectionId: string, linkId: string) {
    const section = state.sections.find((item) => item.id === sectionId);
    if (!section) return;
    updateSection(sectionId, {
      links: section.links.filter((link) => link.id !== linkId),
    });
  }

  function addSection() {
    setRawOverride(null);
    setState((previous) => {
      const optionalIndex = previous.sections.findIndex(
        (section) => section.heading.trim() === OPTIONAL_SECTION_HEADING,
      );
      const next = emptySection("");
      const sections = [...previous.sections];
      if (optionalIndex === -1) sections.push(next);
      else sections.splice(optionalIndex, 0, next);
      return { ...previous, sections };
    });
  }

  function removeSection(sectionId: string) {
    setRawOverride(null);
    setState((previous) => ({
      ...previous,
      sections: previous.sections.filter((section) => section.id !== sectionId),
    }));
  }

  async function handleImport() {
    if (!sitemapUrl.trim()) return;
    setImporting(true);
    setImportMessage(null);
    const result = await importPagesFromSitemap(sitemapUrl.trim());
    setImporting(false);
    if (result.ok === false) {
      setImportMessage({ tone: "error", text: result.message });
      return;
    }
    const imported = emptySection(
      `Imported from ${new URL(result.data.sourceUrl).hostname}`,
    );
    imported.links = result.data.pages.map((page) => ({
      id: `${imported.id}-${page.url}`,
      title: page.title,
      url: page.url,
      description: "",
    }));
    setRawOverride(null);
    setState((previous) => {
      const optionalIndex = previous.sections.findIndex(
        (section) => section.heading.trim() === OPTIONAL_SECTION_HEADING,
      );
      const sections = [...previous.sections];
      if (optionalIndex === -1) sections.push(imported);
      else sections.splice(optionalIndex, 0, imported);
      return { ...previous, sections };
    });
    setImportMessage({
      tone: "success",
      text: `Imported ${result.data.pages.length} page${result.data.pages.length === 1 ? "" : "s"}${
        result.data.truncated
          ? " (list was capped; trim it down to your highest-value pages)."
          : "."
      } Edit titles and add descriptions, then remove anything that isn't worth an AI crawler's time.`,
    });
  }

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(output);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setImportMessage({
        tone: "error",
        text: "Could not copy automatically; select the text and copy manually.",
      });
    }
  }

  function handleDownload() {
    const blob = new Blob([output], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = "llms.txt";
    anchor.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div id="llms-txt-generator" className={`${panelClass} p-5 sm:p-8`}>
      <ToolRunOverlay
        active={importing}
        title="Scanning site pages to build llms.txt"
        description="Importing sitemap and navigation links to curate your Markdown AI documentation index."
      />
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 pb-4 dark:border-slate-800">
        <div>
          <span className="text-xs font-extrabold uppercase tracking-wider text-[#3452d1] dark:text-[#9aabff]">
            llmstxt.org Specification Builder
          </span>
          <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
            Pre-loaded with a valid sample directory so you can inspect the
            Markdown structure immediately or replace it with your own site.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => {
              setRawOverride(null);
              setState(createSampleLlmsState());
            }}
            className={secondaryButton}
          >
            <RotateCcw className="h-3.5 w-3.5" /> Load Sample llms.txt
          </button>
          <button
            type="button"
            onClick={() => {
              setRawOverride(null);
              setState(defaultState());
            }}
            className={secondaryButton}
          >
            Clear Form
          </button>
        </div>
      </div>

      <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
        {/* Builder */}
        <div className="space-y-6">
          <section>
            <h2 className="text-sm font-black uppercase tracking-wider text-[#4662df] dark:text-blue-300">
              1. Site basics
            </h2>
            <div className="mt-3 space-y-3">
              <div>
                <label className="text-xs font-bold text-slate-600 dark:text-slate-300">
                  Site or project name
                </label>
                <input
                  className={`${inputClass} mt-1.5`}
                  value={state.site.siteName}
                  onChange={(event) =>
                    updateSite("siteName", event.target.value)
                  }
                  placeholder="Do It With AI Tools"
                  maxLength={120}
                />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-600 dark:text-slate-300">
                  One-sentence summary (becomes the blockquote)
                </label>
                <input
                  className={`${inputClass} mt-1.5`}
                  value={state.site.summary}
                  onChange={(event) =>
                    updateSite("summary", event.target.value)
                  }
                  placeholder="Free AI SEO tools and practical guides for title tags, URLs, and structured data."
                  maxLength={240}
                />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-600 dark:text-slate-300">
                  Optional context (a paragraph or two for the crawler)
                </label>
                <textarea
                  className={`${textareaClass} mt-1.5`}
                  value={state.site.notes}
                  onChange={(event) => updateSite("notes", event.target.value)}
                  placeholder="Mention anything a model should know before citing you: scope, what you don't cover, or how recently content is updated."
                  maxLength={1200}
                />
              </div>
            </div>
          </section>

          <section>
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h2 className="text-sm font-black uppercase tracking-wider text-[#4662df] dark:text-blue-300">
                2. Import pages (optional)
              </h2>
            </div>
            <p className="mt-2 text-xs leading-6 text-slate-500 dark:text-slate-400">
              Paste a single sitemap.xml URL to pull in its page list, then edit
              titles and descriptions yourself. Review before publishing; this
              only reads public XML.
            </p>
            <div className="mt-3 flex flex-col gap-2 sm:flex-row">
              <ToolUrlInput
                className={inputClass}
                value={sitemapUrl}
                onChange={(event) => setSitemapUrl(event.target.value)}
                placeholder="https://example.com/sitemap.xml"
                inputMode="url"
              />
              <button
                type="button"
                onClick={handleImport}
                disabled={importing || !sitemapUrl.trim()}
                className={`${secondaryButton} shrink-0`}
              >
                {importing ? (
                  <Loader2 className="animate-spin h-3.5 w-3.5" />
                ) : (
                  <Globe className="h-3.5 w-3.5" />
                )}
                {importing ? "Importing…" : "Import"}
              </button>
            </div>
            {importMessage && (
              <p
                className={`mt-2 text-xs font-semibold ${
                  importMessage.tone === "error"
                    ? "text-rose-600 dark:text-rose-400"
                    : "text-emerald-600 dark:text-emerald-400"
                }`}
              >
                {importMessage.text}
              </p>
            )}
          </section>

          <section>
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h2 className="text-sm font-black uppercase tracking-wider text-[#4662df] dark:text-blue-300">
                3. Sections and links
              </h2>
              <button
                type="button"
                onClick={addSection}
                className={secondaryButton}
              >
                <Plus className="h-3.5 w-3.5" /> Add section
              </button>
            </div>

            <div className="mt-3 space-y-4">
              {state.sections.map((section) => (
                <div
                  key={section.id}
                  className="rounded-2xl border border-slate-200 p-4 dark:border-slate-700"
                >
                  <div className="flex items-center gap-2">
                    <input
                      className={`${inputClass} font-bold`}
                      value={section.heading}
                      onChange={(event) =>
                        updateSection(section.id, {
                          heading: event.target.value,
                        })
                      }
                      placeholder="Section heading (e.g. Docs, Guides, Optional)"
                      maxLength={60}
                    />
                    <button
                      type="button"
                      onClick={() => removeSection(section.id)}
                      className="shrink-0 rounded-lg border border-slate-200 p-2.5 text-slate-500 transition hover:border-rose-300 hover:text-rose-600 dark:border-slate-700 dark:text-slate-400"
                      aria-label="Remove section"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>

                  <div className="mt-3 space-y-3">
                    {section.links.map((link) => (
                      <div
                        key={link.id}
                        className="grid gap-2 rounded-xl bg-slate-50 p-3 dark:bg-slate-950/60 sm:grid-cols-2"
                      >
                        <input
                          className={inputClass}
                          value={link.title}
                          onChange={(event) =>
                            updateLink(section.id, link.id, {
                              title: event.target.value,
                            })
                          }
                          placeholder="Page title"
                          maxLength={120}
                        />
                        <ToolUrlInput
                          className={inputClass}
                          value={link.url}
                          onChange={(event) =>
                            updateLink(section.id, link.id, {
                              url: event.target.value,
                            })
                          }
                          placeholder="https://example.com/page"
                          inputMode="url"
                        />
                        <div className="flex gap-2 sm:col-span-2">
                          <input
                            className={inputClass}
                            value={link.description}
                            onChange={(event) =>
                              updateLink(section.id, link.id, {
                                description: event.target.value,
                              })
                            }
                            placeholder="Short description (what a model would learn from this page)"
                            maxLength={200}
                          />
                          <button
                            type="button"
                            onClick={() => removeLink(section.id, link.id)}
                            className="shrink-0 rounded-lg border border-slate-200 p-2.5 text-slate-500 transition hover:border-rose-300 hover:text-rose-600 dark:border-slate-700 dark:text-slate-400"
                            aria-label="Remove link"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                    <button
                      type="button"
                      onClick={() => addLink(section.id)}
                      className={secondaryButton}
                    >
                      <Plus className="h-3.5 w-3.5" /> Add link
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>

        {/* Preview + checklist */}
        <div className="min-w-0 space-y-5 lg:sticky lg:top-24 lg:self-start">
          <section>
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h2 className="text-sm font-black uppercase tracking-wider text-[#4662df] dark:text-blue-300">
                Live preview {rawOverride !== null ? "(Custom Edited)" : ""}
              </h2>
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-slate-400">
                  {output.length.toLocaleString()} chars
                </span>
                <button
                  type="button"
                  onClick={() => {
                    if (!isEditingRaw && rawOverride === null) {
                      setRawOverride(compiledOutput);
                    }
                    setIsEditingRaw((prev) => !prev);
                  }}
                  className="inline-flex items-center gap-1 rounded-lg border border-slate-300 px-2.5 py-1 text-xs font-bold text-slate-700 hover:border-[#3452d1] dark:border-slate-700 dark:text-slate-200"
                >
                  <Edit3 className="h-3 w-3" />
                  {isEditingRaw ? "Compiled View" : "Edit Text"}
                </button>
              </div>
            </div>
            {isEditingRaw ? (
              <textarea
                rows={16}
                value={output}
                onChange={(e) => setRawOverride(e.target.value)}
                spellCheck={false}
                aria-label="Direct llms.txt Markdown editor"
                className="mt-3 w-full rounded-2xl border border-[#5271ff] bg-slate-950 p-4 font-mono text-xs leading-6 text-slate-100 focus:outline-none"
              />
            ) : (
              <pre className="mt-3 max-h-[420px] overflow-auto whitespace-pre-wrap break-words rounded-2xl border border-slate-200 bg-slate-950 p-4 font-mono text-xs leading-6 text-slate-100 dark:border-slate-700">
                {output}
              </pre>
            )}
            <div className="mt-3 flex flex-wrap gap-2">
              <button
                type="button"
                onClick={handleCopy}
                className={primaryButton}
              >
                {copied ? (
                  <CheckCircle2 className="h-4 w-4" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
                {copied ? "Copied" : "Copy llms.txt"}
              </button>
              <button
                type="button"
                onClick={handleDownload}
                className={secondaryButton}
              >
                <Download className="h-3.5 w-3.5" /> Download file
              </button>
            </div>
          </section>

          <section className="rounded-2xl border border-slate-200 p-4 dark:border-slate-700">
            <h2 className="text-sm font-black uppercase tracking-wider text-[#4662df] dark:text-blue-300">
              Checks you can inspect
            </h2>
            {issues.length === 0 ? (
              <p className="mt-3 flex items-center gap-2 text-sm font-semibold text-emerald-600 dark:text-emerald-400">
                <CheckCircle2 className="h-4 w-4" /> No issues found. Ready to
                publish at /llms.txt.
              </p>
            ) : (
              <ul className="mt-3 space-y-2">
                {issues.map((issue, index) => (
                  <li
                    key={`${issue.level}-${index}`}
                    className={`flex items-start gap-2 text-xs font-semibold leading-5 ${
                      issue.level === "error"
                        ? "text-rose-600 dark:text-rose-400"
                        : "text-amber-600 dark:text-amber-400"
                    }`}
                  >
                    <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                    {issue.message}
                  </li>
                ))}
              </ul>
            )}
            <p className="mt-3 text-[11px] leading-5 text-slate-400">
              {errorCount > 0
                ? "Resolve the errors above before publishing; warnings are judgment calls."
                : "This is a reviewable starting point, not a guarantee any AI engine will read or cite it."}
            </p>
          </section>

          <section className="rounded-2xl border border-dashed border-slate-300 p-4 text-xs leading-6 text-slate-500 dark:border-slate-700 dark:text-slate-400">
            Save the downloaded file as{" "}
            <code className="rounded bg-slate-100 px-1.5 py-0.5 font-mono dark:bg-slate-800">
              llms.txt
            </code>{" "}
            at your site&apos;s root (e.g.{" "}
            <code className="rounded bg-slate-100 px-1.5 py-0.5 font-mono dark:bg-slate-800">
              /llms.txt
            </code>
            ). Check path-specific crawler rules before assuming the file can be retrieved.
            This file does not guarantee crawling or citations.
          </section>
        </div>
      </div>
    </div>
  );
}
