"use client";

import { useMemo, useRef, useState } from "react";
import {
  AlertTriangle,
  Check,
  CheckCircle2,
  Copy,
  Download,
  FileCode2,
  Info,
  Lock,
  Upload,
} from "lucide-react";
import {
  CHANGEFREQ_VALUES,
  MAX_INPUT_URLS,
  SAMPLE_URLS,
  SAMPLE_XML,
  analyzeInput,
  generateSitemaps,
  validateSitemap,
  type GenerateOptions,
  type Level,
} from "./sitemapLib";

type Tab = "generate" | "validate";

const MAX_FILE_BYTES = 60 * 1024 * 1024;
const PREVIEW_CHARS = 5000;

const inputClass =
  "min-w-0 w-full rounded-xl border border-white/10 bg-slate-900/70 px-3 py-2.5 text-sm text-white placeholder:text-slate-500 focus:border-[#7f9aff] focus:outline-none focus:ring-2 focus:ring-[#5271ff]/40";
const labelClass = "mb-1.5 block text-xs font-bold uppercase tracking-wider text-slate-400";
const smallButton =
  "inline-flex items-center gap-2 rounded-xl border border-white/15 px-4 py-2.5 text-xs font-bold text-slate-200 transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-50";
const primaryButton =
  "inline-flex items-center gap-2 rounded-xl bg-white px-4 py-2.5 text-xs font-extrabold text-slate-950 transition hover:bg-blue-50 disabled:cursor-not-allowed disabled:opacity-50";

const LEVEL_CLASS: Record<Level, string> = {
  error: "border-rose-300/30 bg-rose-300/10 text-rose-200",
  warning: "border-amber-300/30 bg-amber-300/10 text-amber-200",
  info: "border-sky-300/20 bg-sky-300/10 text-sky-200",
};

const LEVEL_LABEL: Record<Level, string> = { error: "Error", warning: "Warning", info: "Note" };

function parseXml(text: string): Document {
  const doc = new DOMParser().parseFromString(text, "application/xml");
  const problem = doc.getElementsByTagName("parsererror")[0];
  if (problem) throw new Error((problem.textContent ?? "").trim().replace(/\s+/g, " ").slice(0, 200));
  return doc;
}

function download(name: string, content: string) {
  const blob = new Blob([content], { type: "application/xml;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = name;
  link.click();
  URL.revokeObjectURL(url);
}

export default function SitemapXmlClient() {
  const fileRef = useRef<HTMLInputElement>(null);
  const [tab, setTab] = useState<Tab>("generate");

  // Generate
  const [urlsText, setUrlsText] = useState("");
  const [includeLastmod, setIncludeLastmod] = useState(false);
  const [globalLastmod, setGlobalLastmod] = useState("");
  const [includeChangefreq, setIncludeChangefreq] = useState(false);
  const [changefreq, setChangefreq] = useState("weekly");
  const [includePriority, setIncludePriority] = useState(false);
  const [priority, setPriority] = useState("0.5");
  const [activeFile, setActiveFile] = useState(0);
  const [copied, setCopied] = useState("");

  // Validate
  const [xmlText, setXmlText] = useState("");
  const [fileError, setFileError] = useState("");

  const options: GenerateOptions = useMemo(
    () => ({ includeLastmod, globalLastmod, includeChangefreq, changefreq, includePriority, priority }),
    [includeLastmod, globalLastmod, includeChangefreq, changefreq, includePriority, priority]
  );

  const analysis = useMemo(() => analyzeInput(urlsText, options), [urlsText, options]);
  const files = useMemo(() => generateSitemaps(analysis.entries, options), [analysis.entries, options]);
  const current = files[Math.min(activeFile, Math.max(files.length - 1, 0))];
  const robotsLine = analysis.hosts.length > 0 && files.length > 0 ? `Sitemap: ${new URL(analysis.entries[0].url).origin}/${files[0].name}` : "";

  const validation = useMemo(() => (xmlText.trim() ? validateSitemap(xmlText, parseXml) : null), [xmlText]);
  const errorCount = validation?.issues.filter((issue) => issue.level === "error").length ?? 0;

  const copy = async (label: string, value: string) => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(label);
      window.setTimeout(() => setCopied(""), 1800);
    } catch {
      setCopied("");
    }
  };

  const loadXmlFile = async (file: File | undefined) => {
    setFileError("");
    if (!file) return;
    if (file.size > MAX_FILE_BYTES) {
      setFileError("That file is larger than 60 MB. Paste a smaller sitemap, or validate the pieces separately.");
      return;
    }
    if (/\.gz$/i.test(file.name)) {
      setFileError("Please unzip the .gz file first and load the .xml inside it.");
      return;
    }
    setXmlText(await file.text());
  };

  const CopyIcon = ({ label }: { label: string }) =>
    copied === label ? <Check className="h-4 w-4 text-emerald-300" aria-hidden="true" /> : <Copy className="h-4 w-4" aria-hidden="true" />;

  return (
    <div
      id="sitemap-xml-generator"
      className="mx-auto max-w-6xl scroll-mt-24 rounded-3xl border border-white/10 bg-white/[0.06] p-5 text-left backdrop-blur sm:p-8"
    >
      <div role="tablist" aria-label="Sitemap tool mode" className="mb-6 inline-flex rounded-xl border border-white/10 bg-slate-900/60 p-1">
        {(
          [
            ["generate", "Generate sitemap"],
            ["validate", "Validate sitemap"],
          ] as [Tab, string][]
        ).map(([value, label]) => (
          <button
            key={value}
            role="tab"
            type="button"
            aria-selected={tab === value}
            onClick={() => setTab(value)}
            className={`rounded-lg px-4 py-2 text-xs font-extrabold transition ${
              tab === value ? "bg-white text-slate-950" : "text-slate-300 hover:text-white"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {tab === "generate" && (
        <div className="grid gap-8 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)]">
          <div>
            <label className={labelClass} htmlFor="sm-urls">
              1. Paste your URLs (one per line)
            </label>
            <textarea
              id="sm-urls"
              value={urlsText}
              onChange={(event) => {
                setUrlsText(event.target.value);
                setActiveFile(0);
              }}
              rows={12}
              spellCheck={false}
              placeholder={"https://example.com/\nhttps://example.com/about\nhttps://example.com/blog/post, 2026-10-02"}
              className={`${inputClass} font-mono text-xs`}
            />
            <div className="mt-2 flex flex-wrap items-center gap-2">
              <button type="button" onClick={() => setUrlsText(SAMPLE_URLS)} className={smallButton}>
                Try sample URLs
              </button>
              {urlsText && (
                <button type="button" onClick={() => setUrlsText("")} className={smallButton}>
                  Clear
                </button>
              )}
              <span className="text-xs text-slate-400">
                Add a date after a comma (YYYY-MM-DD) to set that page&apos;s last-modified date.
              </span>
            </div>
            <p className="mt-2 flex items-start gap-2 text-xs leading-6 text-slate-400">
              <Lock className="mt-1 h-3.5 w-3.5 shrink-0 text-emerald-300" aria-hidden="true" />
              Everything runs in your browser. Your URLs are not uploaded or stored.
            </p>

            <p className={`${labelClass} mt-6`}>2. Optional fields</p>
            <div className="space-y-3 rounded-2xl border border-white/10 bg-slate-900/50 p-4">
              <div>
                <label className="flex items-center gap-2 text-xs font-semibold text-slate-200">
                  <input type="checkbox" checked={includeLastmod} onChange={(e) => setIncludeLastmod(e.target.checked)} className="h-4 w-4 rounded border-white/20 bg-slate-900" />
                  Include &lt;lastmod&gt; (only if the dates are accurate)
                </label>
                {includeLastmod && (
                  <div className="mt-2 flex flex-wrap items-center gap-2">
                    <label className="text-xs text-slate-400" htmlFor="sm-global-lastmod">
                      Default date for lines without one:
                    </label>
                    <input id="sm-global-lastmod" type="text" value={globalLastmod} onChange={(e) => setGlobalLastmod(e.target.value)} placeholder="YYYY-MM-DD (optional)" className={`${inputClass} max-w-[200px]`} />
                  </div>
                )}
              </div>
              <div>
                <label className="flex items-center gap-2 text-xs font-semibold text-slate-200">
                  <input type="checkbox" checked={includeChangefreq} onChange={(e) => setIncludeChangefreq(e.target.checked)} className="h-4 w-4 rounded border-white/20 bg-slate-900" />
                  Include &lt;changefreq&gt;
                </label>
                {includeChangefreq && (
                  <select aria-label="Change frequency" value={changefreq} onChange={(e) => setChangefreq(e.target.value)} className={`${inputClass} mt-2 max-w-[200px]`}>
                    {CHANGEFREQ_VALUES.map((value) => (
                      <option key={value} value={value}>
                        {value}
                      </option>
                    ))}
                  </select>
                )}
              </div>
              <div>
                <label className="flex items-center gap-2 text-xs font-semibold text-slate-200">
                  <input type="checkbox" checked={includePriority} onChange={(e) => setIncludePriority(e.target.checked)} className="h-4 w-4 rounded border-white/20 bg-slate-900" />
                  Include &lt;priority&gt;
                </label>
                {includePriority && (
                  <input aria-label="Priority from 0.0 to 1.0" type="number" min={0} max={1} step={0.1} value={priority} onChange={(e) => setPriority(e.target.value)} className={`${inputClass} mt-2 max-w-[120px]`} />
                )}
              </div>
              <p className="flex items-start gap-2 text-xs leading-6 text-slate-400">
                <Info className="mt-1 h-3.5 w-3.5 shrink-0 text-sky-300" aria-hidden="true" />
                Google says it ignores &lt;changefreq&gt; and &lt;priority&gt;, so they&apos;re off by default. A consistently accurate &lt;lastmod&gt; is the one optional field worth including.
              </p>
            </div>
          </div>

          <div aria-live="polite">
            <p className={labelClass}>3. Your sitemap</p>
            {urlsText.trim() === "" ? (
              <p className="rounded-2xl border border-white/10 bg-slate-900/50 p-5 text-sm text-slate-400">
                Paste some URLs on the left and your sitemap.xml will appear here.
              </p>
            ) : (
              <>
                <ul className="space-y-1 text-xs leading-6">
                  <li className="flex items-center gap-2 text-emerald-300">
                    <CheckCircle2 className="h-3.5 w-3.5" aria-hidden="true" />
                    {analysis.entries.length.toLocaleString()} URL{analysis.entries.length === 1 ? "" : "s"} included
                    {files.length > 1 ? ` ; split into ${files.length - 1} sitemaps plus an index` : ""}
                  </li>
                  {analysis.invalid.length > 0 && (
                    <li className="flex items-start gap-2 text-amber-300">
                      <AlertTriangle className="mt-1 h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                      {analysis.invalid.length} line(s) skipped ; not valid http(s) URLs (e.g. {analysis.invalid[0].slice(0, 60)})
                    </li>
                  )}
                  {analysis.duplicates > 0 && <li className="text-slate-300">{analysis.duplicates} duplicate URL(s) removed.</li>}
                  {analysis.fragmentsStripped > 0 && <li className="text-slate-300">#fragments removed from {analysis.fragmentsStripped} URL(s).</li>}
                  {analysis.hosts.length > 1 && (
                    <li className="flex items-start gap-2 text-amber-300">
                      <AlertTriangle className="mt-1 h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                      URLs from {analysis.hosts.length} different hosts. A sitemap should only list its own host.
                    </li>
                  )}
                  {analysis.mixedProtocol && (
                    <li className="flex items-start gap-2 text-amber-300">
                      <AlertTriangle className="mt-1 h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                      Mixed http:// and https:// URLs. List only your canonical version.
                    </li>
                  )}
                  {analysis.badLastmod.length > 0 && (
                    <li className="flex items-start gap-2 text-amber-300">
                      <AlertTriangle className="mt-1 h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                      {analysis.badLastmod.length} invalid date(s) ignored (e.g. {analysis.badLastmod[0].slice(0, 70)})
                    </li>
                  )}
                  {analysis.tooLong.length > 0 && <li className="text-amber-300">{analysis.tooLong.length} URL(s) over 2,048 characters were skipped.</li>}
                  {analysis.overLimit && <li className="text-amber-300">Only the first {MAX_INPUT_URLS.toLocaleString()} URLs were processed.</li>}
                </ul>

                {files.length > 0 && current && (
                  <div className="mt-4 rounded-2xl border border-white/10 bg-slate-900/60 p-4">
                    {files.length > 1 && (
                      <div className="mb-3 flex flex-wrap gap-1.5" role="tablist" aria-label="Generated files">
                        {files.map((file, index) => (
                          <button
                            key={file.name}
                            role="tab"
                            type="button"
                            aria-selected={index === activeFile}
                            onClick={() => setActiveFile(index)}
                            className={`rounded-lg px-2.5 py-1.5 text-[11px] font-bold transition ${
                              index === activeFile ? "bg-white text-slate-950" : "border border-white/15 text-slate-300 hover:bg-white/10"
                            }`}
                          >
                            {file.name}
                          </button>
                        ))}
                      </div>
                    )}
                    <div className="flex items-center justify-between gap-2">
                      <p className="flex items-center gap-2 text-xs font-bold text-blue-200">
                        <FileCode2 className="h-4 w-4" aria-hidden="true" /> {current.name}
                        <span className="font-normal text-slate-400">
                          · {current.count.toLocaleString()} {current.name.includes("index") ? "sitemaps" : "URLs"} · {(current.bytes / 1024).toFixed(1)} KB
                        </span>
                      </p>
                    </div>
                    <pre className="mt-3 max-h-72 overflow-auto rounded-xl bg-slate-950/80 p-3 text-[11px] leading-5 text-slate-300">
                      {current.xml.slice(0, PREVIEW_CHARS)}
                      {current.xml.length > PREVIEW_CHARS ? "\n… (preview truncated ; download or copy for the full file)" : ""}
                    </pre>
                    <div className="mt-3 flex flex-wrap gap-2">
                      <button type="button" onClick={() => download(current.name, current.xml)} className={primaryButton}>
                        <Download className="h-4 w-4" aria-hidden="true" /> Download {current.name}
                      </button>
                      <button type="button" onClick={() => void copy("xml", current.xml)} className={smallButton}>
                        <CopyIcon label="xml" /> Copy XML
                      </button>
                    </div>
                    {files.length > 2 && (
                      <p className="mt-2 text-xs text-slate-400">Download each file, upload them all to your site root, and submit the index file.</p>
                    )}
                  </div>
                )}

                {robotsLine && (
                  <div className="mt-4 rounded-2xl border border-white/10 bg-slate-900/60 p-4">
                    <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Add this line to robots.txt</p>
                    <p className="mt-2 break-all font-mono text-xs text-blue-200">{robotsLine}</p>
                    <button type="button" onClick={() => void copy("robots", robotsLine)} className={`${smallButton} mt-3`}>
                      <CopyIcon label="robots" /> Copy line
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      )}

      {tab === "validate" && (
        <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
          <div>
            <label className={labelClass} htmlFor="sm-xml">
              Paste your sitemap.xml
            </label>
            <textarea
              id="sm-xml"
              value={xmlText}
              onChange={(event) => setXmlText(event.target.value)}
              rows={14}
              spellCheck={false}
              placeholder={'<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n  …\n</urlset>'}
              className={`${inputClass} font-mono text-xs`}
            />
            <div className="mt-2 flex flex-wrap gap-2">
              <button type="button" onClick={() => fileRef.current?.click()} className={primaryButton}>
                <Upload className="h-4 w-4" aria-hidden="true" /> Load .xml file
              </button>
              <button type="button" onClick={() => setXmlText(SAMPLE_XML)} className={smallButton}>
                Try a sample with problems
              </button>
              {xmlText && (
                <button type="button" onClick={() => setXmlText("")} className={smallButton}>
                  Clear
                </button>
              )}
              <input ref={fileRef} type="file" accept=".xml,text/xml,application/xml" className="sr-only" aria-label="Choose a sitemap XML file" onChange={(e) => void loadXmlFile(e.target.files?.[0])} />
            </div>
            {fileError && (
              <p role="alert" className="mt-2 text-xs font-semibold text-amber-300">
                {fileError}
              </p>
            )}
            <p className="mt-2 flex items-start gap-2 text-xs leading-6 text-slate-400">
              <Lock className="mt-1 h-3.5 w-3.5 shrink-0 text-emerald-300" aria-hidden="true" />
              Checked in your browser ; nothing is uploaded. This tool validates the text you paste; it doesn&apos;t fetch live URLs or test whether each page returns 200.
            </p>
          </div>

          <div aria-live="polite">
            <p className={labelClass}>Results</p>
            {!validation ? (
              <p className="rounded-2xl border border-white/10 bg-slate-900/50 p-5 text-sm text-slate-400">
                Paste or load a sitemap and the checks will appear here.
              </p>
            ) : (
              <>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    ["Type", validation.kind === "urlset" ? "URL sitemap" : validation.kind === "sitemapindex" ? "Sitemap index" : "Unknown"],
                    [validation.kind === "sitemapindex" ? "Sitemaps listed" : "URLs", validation.entryCount.toLocaleString()],
                    ["Size", `${(validation.bytes / 1024).toFixed(1)} KB`],
                  ].map(([label, value]) => (
                    <div key={label} className="rounded-2xl border border-white/10 bg-slate-900/60 p-3">
                      <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">{label}</p>
                      <p className="mt-1 text-sm font-black text-white">{value}</p>
                    </div>
                  ))}
                </div>

                <p
                  className={`mt-4 flex items-center gap-2 rounded-xl border p-3 text-xs font-bold ${
                    errorCount === 0 ? "border-emerald-300/30 bg-emerald-300/10 text-emerald-200" : "border-rose-300/30 bg-rose-300/10 text-rose-200"
                  }`}
                >
                  {errorCount === 0 ? <CheckCircle2 className="h-4 w-4" aria-hidden="true" /> : <AlertTriangle className="h-4 w-4" aria-hidden="true" />}
                  {errorCount === 0 ? "No errors found in the structure." : `${errorCount} type${errorCount === 1 ? "" : "s"} of error to fix.`}
                </p>

                <ul className="mt-3 space-y-2">
                  {validation.issues.map((issue) => (
                    <li key={issue.message} className={`rounded-xl border p-3 text-xs leading-6 ${LEVEL_CLASS[issue.level]}`}>
                      <span className="font-extrabold">{LEVEL_LABEL[issue.level]}</span>
                      {issue.count > 1 ? ` (${issue.count.toLocaleString()}×)` : ""}: {issue.message}
                      {issue.examples.length > 0 && (
                        <span className="mt-1 block break-all font-mono text-[11px] opacity-80">e.g. {issue.examples.join(" · ")}</span>
                      )}
                    </li>
                  ))}
                </ul>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
