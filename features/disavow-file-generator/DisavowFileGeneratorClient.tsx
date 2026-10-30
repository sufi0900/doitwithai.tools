"use client";

import { useEffect, useMemo, useRef, useState, type ChangeEvent, type FormEvent } from "react";
import {
  AlertTriangle,
  CheckCircle2,
  Copy,
  Download,
  FileCheck2,
  FileSpreadsheet,
  GitMerge,
  RefreshCw,
  ShieldCheck,
  Sparkles,
  Upload,
} from "lucide-react";
import ToolRunOverlay, {
  focusToolSection,
  paintToolFeedback,
} from "@/features/tool-ui/ToolRunOverlay";
import {
  buildDisavowDocx,
  exportDisavowAuditCsv,
  parseAndBuildDisavowReport,
  type DisavowInputMode,
  type DisavowScope,
} from "./model";

const SAMPLE_TOXIC_INPUT = `https://cheap-seo-backlinks-247.xyz/free-links?id=991
http://www.casino-slots-bonus-2026.top/directory/marketing-sites
https://auto-scraper-links8842.icu/tag/seo-tools/
domain:https://broken-syntax-example.loan/path/should-be-stripped
https://cheap-seo-backlinks-247.xyz/another-redundant-page.html
https://medium.com/@spammer-account-991/paid-link-scheme-post-12345
https://doitwithai.tools/accidental-self-link-should-be-blocked
pbn-linkfarm-directory.work/links.php?id=42`;

const SAMPLE_EXISTING_DISAVOW = `# Previous Q3 Disavow File
domain:old-toxic-directory.xyz
domain:https://invalid-existing-rule.click/bad-path`;

const control =
  "w-full rounded-xl border border-slate-300 bg-transparent px-4 py-3 text-sm leading-6 focus:outline-none focus:ring-2 focus:ring-[#5271ff] dark:border-slate-600";
const panel =
  "rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-900 sm:p-7";
const primaryBtn =
  "inline-flex items-center justify-center gap-2 rounded-xl bg-[#3452d1] px-5 py-3 text-sm font-bold text-white hover:bg-[#2943b5] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#5271ff] disabled:opacity-50";
const secondaryBtn =
  "inline-flex items-center justify-center gap-2 rounded-xl border border-slate-300 px-4 py-2.5 text-sm font-semibold hover:bg-slate-100 focus-visible:outline-[#5271ff] dark:border-slate-600 dark:hover:bg-slate-800";

export default function DisavowFileGeneratorClient() {
  const [mode, setMode] = useState<DisavowInputMode>("paste");
  const [rawInput, setRawInput] = useState("");
  const [existingDisavowTxt, setExistingDisavowTxt] = useState("");
  const [ownDomain, setOwnDomain] = useState("doitwithai.tools");
  const [defaultScope, setDefaultScope] = useState<"auto" | "domain" | "url">(
    "auto",
  );
  const [collapseSubdomains, setCollapseSubdomains] = useState(true);
  const [auditNote, setAuditNote] = useState(
    "Manual link audit — disavowing unnatural scraper, PBN, and spam-TLD backlinks.",
  );
  const [overrides, setOverrides] = useState<
    Record<string, { scope?: DisavowScope; included?: boolean }>
  >({});

  const [hasGenerated, setHasGenerated] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [feedback, setFeedback] = useState("");
  const [revision, setRevision] = useState(0);

  const resultRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (!busy && revision > 0) {
      focusToolSection(resultRef.current);
    }
  }, [busy, revision]);

  const report = useMemo(() => {
    if (!hasGenerated) return null;
    return parseAndBuildDisavowReport({
      rawInput,
      existingDisavowTxt: mode === "merge" ? existingDisavowTxt : "",
      defaultScope,
      collapseSubdomains,
      ownDomain,
      auditNote,
      overrides,
    });
  }, [
    hasGenerated,
    rawInput,
    existingDisavowTxt,
    mode,
    defaultScope,
    collapseSubdomains,
    ownDomain,
    auditNote,
    overrides,
  ]);

  function loadSample() {
    setMode("merge");
    setOwnDomain("doitwithai.tools");
    setRawInput(SAMPLE_TOXIC_INPUT);
    setExistingDisavowTxt(SAMPLE_EXISTING_DISAVOW);
    setDefaultScope("auto");
    setCollapseSubdomains(true);
    setOverrides({});
    setError("");
    setHasGenerated(true);
    setRevision((r) => r + 1);
    setFeedback(
      "Loaded sample toxic URLs + existing Q3 disavow file, fixed syntax issues, and blocked self-disavow.",
    );
  }

  async function handleFileUpload(
    e: ChangeEvent<HTMLInputElement>,
    target: "new" | "existing",
  ) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      setError("Uploaded file exceeds 5 MB limit.");
      return;
    }
    const text = await file.text();
    if (target === "new") {
      setRawInput(text);
      setFeedback(`Loaded ${file.name} into toxic backlinks input.`);
    } else {
      setExistingDisavowTxt(text);
      setFeedback(`Loaded existing disavow file (${file.name}) for merging.`);
    }
    setError("");
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (busy) return;
    setError("");
    setFeedback("");

    if (!rawInput.trim() && !(mode === "merge" && existingDisavowTxt.trim())) {
      setError(
        "Paste at least one toxic URL/domain or upload a backlink audit CSV (or click 'Load Sample Audit').",
      );
      return;
    }

    setBusy(true);
    try {
      await paintToolFeedback();
      setHasGenerated(true);
      setRevision((r) => r + 1);
    } finally {
      setBusy(false);
    }
  }

  function toggleRowScope(id: string, currentScope: DisavowScope) {
    const nextScope: DisavowScope =
      currentScope === "domain" ? "url" : "domain";
    setOverrides((prev) => ({
      ...prev,
      [id]: { ...prev[id], scope: nextScope },
    }));
  }

  function toggleRowIncluded(id: string, currentIncluded: boolean) {
    setOverrides((prev) => ({
      ...prev,
      [id]: { ...prev[id], included: !currentIncluded },
    }));
  }

  function triggerDownload(blob: Blob, filename: string) {
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }

  async function handleDownload(kind: "txt" | "csv" | "docx") {
    if (!report) return;
    if (kind === "txt") {
      triggerDownload(
        new Blob([report.disavowTxtContent], {
          type: "text/plain;charset=utf-8",
        }),
        "disavow.txt",
      );
      setFeedback(
        "Downloaded UTF-8 disavow.txt ready for Google Search Console upload.",
      );
    } else if (kind === "csv") {
      triggerDownload(
        new Blob([exportDisavowAuditCsv(report)], {
          type: "text/csv;charset=utf-8",
        }),
        "disavow-audit-log.csv",
      );
      setFeedback("Downloaded disavow audit log CSV.");
    } else {
      const bytes = buildDisavowDocx(report, ownDomain);
      triggerDownload(
        new Blob([bytes as unknown as BlobPart], {
          type: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        }),
        "disavow-audit-documentation.docx",
      );
      setFeedback("Downloaded editable Word (.docx) disavow documentation.");
    }
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
      <ToolRunOverlay
        active={busy}
        title="Validating & normalizing disavow rules"
        description="Stripping protocols from domain rules, collapsing redundant URLs, checking whitelist protections, and formatting UTF-8 disavow.txt."
      />

      <form onSubmit={handleSubmit} noValidate className={panel}>
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="flex items-center gap-2.5 text-2xl font-extrabold">
              <ShieldCheck aria-hidden className="text-[#5271ff]" />
              Build or Validate Your Google Search Console Disavow File
            </h2>
            <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
              Everything runs privately in your browser. Turn messy toxic URLs
              or audit CSVs into a clean, syntax-verified{" "}
              <code>disavow.txt</code>.
            </p>
          </div>
          <button type="button" onClick={loadSample} className={secondaryBtn}>
            <Sparkles size={16} className="text-[#5271ff]" />
            Load Sample Audit + Merge Demo
          </button>
        </div>

        {/* Mode Switcher */}
        <div
          role="tablist"
          aria-label="Disavow generator input mode"
          className="mt-6 grid gap-2 sm:grid-cols-3"
        >
          {[
            {
              id: "paste" as const,
              label: "1. Paste Toxic URLs or Domains",
              sub: "Auto-normalizes mixed URLs & domains",
              icon: FileCheck2,
            },
            {
              id: "csv" as const,
              label: "2. Upload Backlink Audit CSV",
              sub: "Import from Ahrefs, Semrush, Moz, or GSC",
              icon: FileSpreadsheet,
            },
            {
              id: "merge" as const,
              label: "3. Validate & Merge Existing disavow.txt",
              sub: "Combine new links with your prior GSC file",
              icon: GitMerge,
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

        {/* Settings Row */}
        <div className="mt-6 grid gap-5 md:grid-cols-3">
          <div>
            <label
              htmlFor="disavow-own-domain"
              className="block text-sm font-bold"
            >
              Your Protected Domain (Self-Disavow Guard)
            </label>
            <p className="mb-2 mt-1 text-xs text-slate-500 dark:text-slate-400">
              Automatically blocks any rule matching your own domain.
            </p>
            <input
              id="disavow-own-domain"
              type="text"
              value={ownDomain}
              onChange={(e) => setOwnDomain(e.target.value)}
              placeholder="e.g. doitwithai.tools"
              className={control}
            />
          </div>

          <div>
            <label
              htmlFor="disavow-default-scope"
              className="block text-sm font-bold"
            >
              Default Rule Scope
            </label>
            <p className="mb-2 mt-1 text-xs text-slate-500 dark:text-slate-400">
              Google recommends <code>domain:</code> for spam networks.
            </p>
            <select
              id="disavow-default-scope"
              value={defaultScope}
              onChange={(e) =>
                setDefaultScope(e.target.value as "auto" | "domain" | "url")
              }
              className={`${control} dark:bg-slate-900`}
            >
              <option value="auto">
                Smart Auto (Domain for spam sites, URL for major platforms)
              </option>
              <option value="domain">
                Always Domain-Level (domain:example.com)
              </option>
              <option value="url">
                Keep Exact Page URLs Where Path Exists
              </option>
            </select>
          </div>

          <div>
            <label
              htmlFor="disavow-audit-note"
              className="block text-sm font-bold"
            >
              Header Audit Comment (Optional)
            </label>
            <p className="mb-2 mt-1 text-xs text-slate-500 dark:text-slate-400">
              Added as <code>#</code> comments at the top of{" "}
              <code>disavow.txt</code>.
            </p>
            <input
              id="disavow-audit-note"
              type="text"
              value={auditNote}
              onChange={(e) => setAuditNote(e.target.value)}
              placeholder="e.g. Q4 Toxic Backlink Cleanup"
              className={control}
            />
          </div>
        </div>

        <div className="mt-4 flex items-center gap-2.5">
          <input
            id="disavow-collapse-subdomains"
            type="checkbox"
            checked={collapseSubdomains}
            onChange={(e) => setCollapseSubdomains(e.target.checked)}
            className="h-4 w-4 rounded border-slate-300 text-[#3452d1] focus:ring-[#5271ff]"
          />
          <label
            htmlFor="disavow-collapse-subdomains"
            className="text-xs font-medium text-slate-700 dark:text-slate-300"
          >
            Collapse subdomains to registrable root domain (while preserving
            multi-tenant blog hosts like <code>*.blogspot.com</code> and{" "}
            <code>*.wordpress.com</code>)
          </label>
        </div>

        {/* Input Textarea(s) */}
        <div
          className={`mt-6 grid gap-5 ${mode === "merge" ? "lg:grid-cols-2" : ""}`}
        >
          <div>
            <div className="flex flex-wrap items-center justify-between gap-2">
              <label
                htmlFor="disavow-raw-input"
                className="block text-sm font-bold"
              >
                {mode === "merge"
                  ? "New Toxic URLs or Domains to Add"
                  : "Toxic URLs, Domains, or Audit CSV Rows"}
              </label>
              <label className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-semibold hover:bg-slate-100 dark:border-slate-600 dark:hover:bg-slate-800">
                <Upload size={14} />
                Upload .CSV / .TXT
                <input
                  type="file"
                  accept=".csv,.tsv,.txt"
                  onChange={(e) => handleFileUpload(e, "new")}
                  className="sr-only"
                />
              </label>
            </div>
            <textarea
              id="disavow-raw-input"
              rows={8}
              value={rawInput}
              onChange={(e) => setRawInput(e.target.value)}
              placeholder={`https://spam-directory-example.xyz/links\nhttp://casino-backlinks.top/post-1\ndomain:linkfarm-network.icu`}
              className={`${control} mt-2 font-mono text-xs`}
            />
          </div>

          {mode === "merge" && (
            <div>
              <div className="flex flex-wrap items-center justify-between gap-2">
                <label
                  htmlFor="disavow-existing-input"
                  className="block text-sm font-bold"
                >
                  Existing Google Search Console <code>disavow.txt</code>
                </label>
                <label className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-semibold hover:bg-slate-100 dark:border-slate-600 dark:hover:bg-slate-800">
                  <Upload size={14} />
                  Upload Existing disavow.txt
                  <input
                    type="file"
                    accept=".txt"
                    onChange={(e) => handleFileUpload(e, "existing")}
                    className="sr-only"
                  />
                </label>
              </div>
              <textarea
                id="disavow-existing-input"
                rows={8}
                value={existingDisavowTxt}
                onChange={(e) => setExistingDisavowTxt(e.target.value)}
                placeholder={`# Previous disavow file downloaded from Search Console\ndomain:old-spam-domain.xyz\nhttps://example-forum.org/spam-thread-99`}
                className={`${control} mt-2 font-mono text-xs`}
              />
            </div>
          )}
        </div>

        {error && (
          <div
            role="alert"
            className="mt-5 flex items-start gap-2.5 rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-800 dark:border-rose-900/60 dark:bg-rose-950/40 dark:text-rose-200"
          >
            <AlertTriangle size={18} className="mt-0.5 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {feedback && !error && (
          <p
            role="status"
            className="mt-4 text-sm font-medium text-emerald-700 dark:text-emerald-300"
          >
            {feedback}
          </p>
        )}

        <div className="mt-6 flex flex-wrap items-center gap-3">
          <button type="submit" disabled={busy} className={primaryBtn}>
            <ShieldCheck size={18} />
            Validate & Generate disavow.txt
          </button>
          {report && (
            <button
              type="button"
              onClick={() => {
                setHasGenerated(false);
                setOverrides({});
                setFeedback("");
              }}
              className={secondaryBtn}
            >
              <RefreshCw size={15} />
              Reset
            </button>
          )}
        </div>
      </form>

      {report && (
        <section
          ref={resultRef}
          tabIndex={-1}
          aria-label="Generated disavow file and validation report"
          className="mt-10 space-y-8 focus:outline-none"
        >
          {/* Summary & Download Header */}
          <div className={panel}>
            <div className="flex flex-wrap items-start justify-between gap-4 border-b border-slate-200 pb-6 dark:border-slate-700">
              <div>
                <span className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                  <CheckCircle2 size={15} />
                  {report.withinGscLimits
                    ? "100% Google Search Console Spec Compliant"
                    : "Exceeds GSC File Size / Line Limit"}
                </span>
                <h3 className="mt-1 text-2xl font-black">
                  Ready-to-Upload <code>disavow.txt</code> & Validation Summary
                </h3>
                <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
                  {report.activeDomainCount} domain-level rules and{" "}
                  {report.activeUrlCount} single-URL rules formatted in strict
                  UTF-8 syntax.
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => handleDownload("txt")}
                  className={primaryBtn}
                >
                  <Download size={16} />
                  Download disavow.txt
                </button>
                <button
                  type="button"
                  onClick={() => handleDownload("csv")}
                  className={secondaryBtn}
                >
                  <Download size={16} />
                  Audit Log (.CSV)
                </button>
                <button
                  type="button"
                  onClick={() => handleDownload("docx")}
                  className={secondaryBtn}
                >
                  <Download size={16} />
                  Documentation (.DOCX)
                </button>
              </div>
            </div>

            <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
              <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-4 dark:border-slate-700 dark:bg-slate-800/40">
                <p className="text-xs font-semibold uppercase text-slate-500">
                  Domain Rules (domain:)
                </p>
                <p className="mt-2 text-3xl font-black text-[#3452d1] dark:text-[#9aabff]">
                  {report.activeDomainCount}
                </p>
                <p className="mt-1 text-xs text-slate-500">
                  Blocks entire toxic domains
                </p>
              </div>

              <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-4 dark:border-slate-700 dark:bg-slate-800/40">
                <p className="text-xs font-semibold uppercase text-slate-500">
                  Page URL Rules
                </p>
                <p className="mt-2 text-3xl font-black">
                  {report.activeUrlCount}
                </p>
                <p className="mt-1 text-xs text-slate-500">
                  Single page disavows
                </p>
              </div>

              <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-4 dark:border-slate-700 dark:bg-slate-800/40">
                <p className="text-xs font-semibold uppercase text-slate-500">
                  Duplicates & Collapsed
                </p>
                <p className="mt-2 text-3xl font-black">
                  {report.DuplicateRemovedCount + report.collapsedUrlCount}
                </p>
                <p className="mt-1 text-xs text-slate-500">
                  Cleaned redundant lines
                </p>
              </div>

              <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-4 dark:border-slate-700 dark:bg-slate-800/40">
                <p className="text-xs font-semibold uppercase text-slate-500">
                  Syntax Fixes & Guards
                </p>
                <p className="mt-2 text-3xl font-black text-amber-600 dark:text-amber-400">
                  {report.validationIssues.length}
                </p>
                <p className="mt-1 text-xs text-slate-500">
                  {report.protectedSkippedCount} self-disavow blocked
                </p>
              </div>

              <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-4 dark:border-slate-700 dark:bg-slate-800/40">
                <p className="text-xs font-semibold uppercase text-slate-500">
                  GSC Size Budget
                </p>
                <p className="mt-2 text-2xl font-black text-emerald-600 dark:text-emerald-400">
                  {(report.byteLength / 1024).toFixed(1)} KB
                </p>
                <p className="mt-1 text-xs text-slate-500">
                  {report.lineCount} / 100,000 max lines
                </p>
              </div>
            </div>
          </div>

          {/* Syntax Auto-Fixes & Safety Warnings */}
          {report.validationIssues.length > 0 && (
            <div className={panel}>
              <h3 className="flex items-center gap-2 text-lg font-extrabold">
                <AlertTriangle size={18} className="text-amber-500" />
                Syntax Auto-Corrections & Safety Guards Applied (
                {report.validationIssues.length})
              </h3>
              <ul className="mt-4 space-y-2.5 text-xs">
                {report.validationIssues.map((issue, i) => (
                  <li
                    key={`${issue.lineNumber}-${i}`}
                    className="rounded-xl border border-amber-200 bg-amber-50/70 p-3 dark:border-amber-900/50 dark:bg-amber-950/30"
                  >
                    <span className="font-bold">Line {issue.lineNumber}:</span>{" "}
                    <code className="rounded bg-white/80 px-1.5 py-0.5 dark:bg-slate-900">
                      {issue.rawLine}
                    </code>{" "}
                    — {issue.message}
                    {issue.autoFixedTo && (
                      <span className="ml-2 font-semibold text-emerald-700 dark:text-emerald-300">
                        → Auto-fixed to <code>{issue.autoFixedTo}</code>
                      </span>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Side-by-Side Interactive Rule Editor & Live disavow.txt Output */}
          <div className="grid gap-6 lg:grid-cols-[1.25fr_0.95fr]">
            <div className={panel}>
              <h3 className="text-lg font-extrabold">
                Interactive Rule Inspector ({report.entries.length} Entries)
              </h3>
              <p className="mt-1 text-xs text-slate-600 dark:text-slate-300">
                Toggle any row between <code>domain:</code> and single{" "}
                <code>URL</code> scope, or uncheck rows you want to keep.
              </p>

              <div className="mt-4 max-h-[520px] overflow-y-auto pr-1">
                <table className="w-full border-collapse text-left text-xs">
                  <thead>
                    <tr className="border-b border-slate-200 uppercase text-slate-500 dark:border-slate-700">
                      <th className="py-2.5 pr-2">Include</th>
                      <th className="px-2 py-2.5">GSC Rule</th>
                      <th className="px-2 py-2.5">Scope Toggle</th>
                      <th className="py-2.5 pl-2">Signal / Note</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                    {report.entries.map((entry) => (
                      <tr
                        key={entry.id}
                        className={
                          !entry.included || entry.coveredByDomain
                            ? "opacity-55"
                            : ""
                        }
                      >
                        <td className="py-3 pr-2">
                          <input
                            type="checkbox"
                            aria-label={`Include ${entry.formattedRule}`}
                            checked={entry.included}
                            onChange={() =>
                              toggleRowIncluded(entry.id, entry.included)
                            }
                            className="h-4 w-4 rounded border-slate-300 text-[#3452d1]"
                          />
                        </td>
                        <td className="px-2 py-3 font-mono font-semibold">
                          {entry.formattedRule}
                          {entry.sourceOrigin === "existing-disavow" && (
                            <span className="ml-2 rounded bg-slate-100 px-1.5 py-0.5 font-sans text-[10px] font-bold text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                              Merged
                            </span>
                          )}
                        </td>
                        <td className="px-2 py-3">
                          <button
                            type="button"
                            onClick={() =>
                              toggleRowScope(entry.id, entry.scope)
                            }
                            className="rounded-lg border border-slate-300 px-2.5 py-1 text-[11px] font-bold hover:bg-slate-100 dark:border-slate-600 dark:hover:bg-slate-800"
                          >
                            {entry.scope === "domain"
                              ? "Domain → Switch to URL"
                              : "URL → Switch to Domain"}
                          </button>
                        </td>
                        <td className="py-3 pl-2">
                          <span className="block font-medium text-slate-700 dark:text-slate-300">
                            {entry.reasonTag}
                          </span>
                          {entry.coveredByDomain && (
                            <span className="text-[11px] text-amber-600 dark:text-amber-400">
                              Auto-collapsed (covered by domain:{entry.domainValue})
                            </span>
                          )}
                          {entry.warning && (
                            <span className="block text-[11px] font-semibold text-rose-600 dark:text-rose-400">
                              {entry.warning}
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className={panel}>
              <div className="flex items-center justify-between gap-2">
                <h3 className="text-lg font-extrabold">
                  Live <code>disavow.txt</code> File Preview
                </h3>
                <button
                  type="button"
                  onClick={async () => {
                    await navigator.clipboard.writeText(
                      report.disavowTxtContent,
                    );
                    setFeedback("Copied disavow.txt content to clipboard.");
                  }}
                  className={secondaryBtn}
                >
                  <Copy size={14} />
                  Copy File Text
                </button>
              </div>
              <p className="mt-1 text-xs text-slate-600 dark:text-slate-300">
                Exact UTF-8 plain-text file formatted for Google Search Console
                › Disavow links.
              </p>
              <pre className="mt-4 max-h-[500px] overflow-auto rounded-xl border border-slate-200 bg-slate-950 p-4 font-mono text-xs leading-6 text-emerald-300 dark:border-slate-700">
                {report.disavowTxtContent}
              </pre>
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
