"use client";

import { useMemo, useRef, useState } from "react";
import { AlertTriangle, Check, CheckCircle2, Copy, Download, Info, Lock, Upload } from "lucide-react";
import {
  SAMPLE_INPUT,
  STATUSES,
  analyzeRedirects,
  buildMappingCsv,
  generateOutput,
  type BuildOptions,
  type Level,
  type Platform,
  type Status,
} from "./redirectLib";

const MAX_FILE_BYTES = 5 * 1024 * 1024;

const PLATFORMS: { value: Platform; label: string }[] = [
  { value: "nextjs", label: "Next.js" },
  { value: "vercel", label: "Vercel" },
  { value: "netlify", label: "Netlify / Cloudflare Pages" },
  { value: "apache", label: "Apache (.htaccess)" },
  { value: "nginx", label: "Nginx" },
];

const STATUS_LABEL: Record<Status, string> = {
  301: "301 ; permanent",
  302: "302 ; temporary",
  307: "307 ; temporary (keeps method)",
  308: "308 ; permanent (keeps method)",
};

const LEVEL_CLASS: Record<Level, string> = {
  error: "border-rose-300/30 bg-rose-300/10 text-rose-200",
  warning: "border-amber-300/30 bg-amber-300/10 text-amber-200",
  info: "border-sky-300/20 bg-sky-300/10 text-sky-200",
};
const LEVEL_LABEL: Record<Level, string> = { error: "Error", warning: "Warning", info: "Note" };

const inputClass =
  "min-w-0 w-full rounded-xl border border-white/10 bg-slate-900/70 px-3 py-2.5 text-sm text-white placeholder:text-slate-500 focus:border-[#7f9aff] focus:outline-none focus:ring-2 focus:ring-[#5271ff]/40";
const labelClass = "mb-1.5 block text-xs font-bold uppercase tracking-wider text-slate-400";
const smallButton =
  "inline-flex items-center gap-2 rounded-xl border border-white/15 px-4 py-2.5 text-xs font-bold text-slate-200 transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-50";
const primaryButton =
  "inline-flex items-center gap-2 rounded-xl bg-white px-4 py-2.5 text-xs font-extrabold text-slate-950 transition hover:bg-blue-50 disabled:cursor-not-allowed disabled:opacity-50";

function download(name: string, content: string, type = "text/plain;charset=utf-8") {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = name;
  link.click();
  URL.revokeObjectURL(url);
}

export default function RedirectRuleClient() {
  const fileRef = useRef<HTMLInputElement>(null);
  const [text, setText] = useState("");
  const [fileError, setFileError] = useState("");
  const [platform, setPlatform] = useState<Platform>("nextjs");
  const [defaultStatus, setDefaultStatus] = useState<Status>(301);
  const [flattenChains, setFlattenChains] = useState(true);
  const [optionalSlash, setOptionalSlash] = useState(true);
  const [copied, setCopied] = useState("");

  const options: BuildOptions = useMemo(
    () => ({ defaultStatus, flattenChains, optionalTrailingSlash: optionalSlash }),
    [defaultStatus, flattenChains, optionalSlash]
  );

  const analysis = useMemo(() => analyzeRedirects(text, options), [text, options]);
  const output = useMemo(() => generateOutput(platform, analysis.rules, options), [platform, analysis.rules, options]);
  const errors = analysis.issues.filter((issue) => issue.level === "error").length;
  const warnings = analysis.issues.filter((issue) => issue.level === "warning").length;
  const hasInput = text.trim() !== "";

  const copy = async (label: string, value: string) => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(label);
      window.setTimeout(() => setCopied(""), 1800);
    } catch {
      setCopied("");
    }
  };

  const loadFile = async (file: File | undefined) => {
    setFileError("");
    if (!file) return;
    if (file.size > MAX_FILE_BYTES) {
      setFileError("That file is larger than 5 MB. Split it into smaller batches.");
      return;
    }
    if (/\.(xlsx|xls|zip)$/i.test(file.name)) {
      setFileError("Please load a .csv or .txt file. In Excel or Sheets, use Save as / Download → CSV.");
      return;
    }
    setText(await file.text());
  };

  const CopyIcon = ({ label }: { label: string }) =>
    copied === label ? <Check className="h-4 w-4 text-emerald-300" aria-hidden="true" /> : <Copy className="h-4 w-4" aria-hidden="true" />;

  return (
    <div
      id="redirect-rule-generator"
      className="mx-auto max-w-6xl scroll-mt-24 rounded-3xl border border-white/10 bg-white/[0.06] p-5 text-left backdrop-blur sm:p-8"
    >
      <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)]">
        <div>
          <label className={labelClass} htmlFor="rr-input">
            1. Paste your redirects (old URL, new URL, optional status)
          </label>
          <textarea
            id="rr-input"
            value={text}
            onChange={(event) => setText(event.target.value)}
            rows={13}
            spellCheck={false}
            placeholder={"/old-page, /new-page\n/old-blog/*, /blog/*\nhttps://example.com/legacy, /current, 302"}
            className={`${inputClass} font-mono text-xs`}
          />
          <div className="mt-2 flex flex-wrap gap-2">
            <button type="button" onClick={() => fileRef.current?.click()} className={primaryButton}>
              <Upload className="h-4 w-4" aria-hidden="true" /> Load CSV / TXT
            </button>
            <button type="button" onClick={() => setText(SAMPLE_INPUT)} className={smallButton}>
              Try sample data
            </button>
            {text && (
              <button type="button" onClick={() => setText("")} className={smallButton}>
                Clear
              </button>
            )}
            <input ref={fileRef} type="file" accept=".csv,.txt,text/csv,text/plain" className="sr-only" aria-label="Choose a CSV or text file" onChange={(e) => void loadFile(e.target.files?.[0])} />
          </div>
          {fileError && (
            <p role="alert" className="mt-2 text-xs font-semibold text-amber-300">
              {fileError}
            </p>
          )}
          <p className="mt-2 flex items-start gap-2 text-xs leading-6 text-slate-400">
            <Lock className="mt-1 h-3.5 w-3.5 shrink-0 text-emerald-300" aria-hidden="true" />
            Runs in your browser. Your URLs are not uploaded or stored.
          </p>
          <p className="mt-2 text-xs leading-6 text-slate-400">
            One rule per line, separated by a comma, tab, or <span className="font-mono">-&gt;</span>. Use a trailing{" "}
            <span className="font-mono">/*</span> on both sides to move a whole section, like{" "}
            <span className="font-mono">/old-blog/*, /blog/*</span>. A header row is fine.
          </p>

          <p className={`${labelClass} mt-6`}>2. Options</p>
          <div className="space-y-3 rounded-2xl border border-white/10 bg-slate-900/50 p-4">
            <div>
              <label className="mb-1 block text-xs font-semibold text-slate-300" htmlFor="rr-status">
                Default status for rules without one
              </label>
              <select id="rr-status" value={defaultStatus} onChange={(e) => setDefaultStatus(Number(e.target.value) as Status)} className={inputClass}>
                {STATUSES.map((status) => (
                  <option key={status} value={status}>
                    {STATUS_LABEL[status]}
                  </option>
                ))}
              </select>
            </div>
            <label className="flex items-start gap-2 text-xs font-semibold leading-5 text-slate-200">
              <input type="checkbox" checked={flattenChains} onChange={(e) => setFlattenChains(e.target.checked)} className="mt-0.5 h-4 w-4 rounded border-white/20 bg-slate-900" />
              Flatten redirect chains (send A → B → C straight to C)
            </label>
            <label className="flex items-start gap-2 text-xs font-semibold leading-5 text-slate-200">
              <input type="checkbox" checked={optionalSlash} onChange={(e) => setOptionalSlash(e.target.checked)} className="mt-0.5 h-4 w-4 rounded border-white/20 bg-slate-900" />
              Also match a trailing slash (Apache and Nginx rules)
            </label>
          </div>
        </div>

        <div aria-live="polite">
          <p className={labelClass}>3. Choose your platform and copy the rules</p>
          <div role="tablist" aria-label="Platform" className="flex flex-wrap gap-1.5">
            {PLATFORMS.map((item) => (
              <button
                key={item.value}
                role="tab"
                type="button"
                aria-selected={platform === item.value}
                onClick={() => setPlatform(item.value)}
                className={`rounded-lg px-3 py-2 text-xs font-extrabold transition ${
                  platform === item.value ? "bg-white text-slate-950" : "border border-white/15 text-slate-300 hover:bg-white/10"
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>

          {!hasInput ? (
            <p className="mt-4 rounded-2xl border border-white/10 bg-slate-900/50 p-5 text-sm text-slate-400">
              Paste your redirects on the left and the rules will appear here.
            </p>
          ) : (
            <>
              <div className="mt-4 grid grid-cols-3 gap-3">
                {[
                  ["Rules ready", analysis.rules.length.toLocaleString()],
                  ["Errors", errors.toLocaleString()],
                  ["Warnings", warnings.toLocaleString()],
                ].map(([label, value]) => (
                  <div key={label} className="rounded-2xl border border-white/10 bg-slate-900/60 p-3">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">{label}</p>
                    <p className="mt-1 text-xl font-black text-white">{value}</p>
                  </div>
                ))}
              </div>

              {output.content ? (
                <div className="mt-4 rounded-2xl border border-white/10 bg-slate-900/60 p-4">
                  <pre className="max-h-80 overflow-auto rounded-xl bg-slate-950/80 p-3 text-[11px] leading-5 text-slate-300">{output.content}</pre>
                  <p className="mt-3 flex items-start gap-2 text-xs leading-6 text-slate-300">
                    <Info className="mt-1 h-3.5 w-3.5 shrink-0 text-sky-300" aria-hidden="true" />
                    {output.note}
                  </p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <button type="button" onClick={() => void copy("rules", output.content)} className={primaryButton}>
                      <CopyIcon label="rules" /> Copy rules
                    </button>
                    <button type="button" onClick={() => download(output.filename, output.content)} className={smallButton}>
                      <Download className="h-4 w-4" aria-hidden="true" /> Download {output.filename}
                    </button>
                    <button type="button" onClick={() => download("redirect-map.csv", buildMappingCsv(analysis.rules), "text/csv;charset=utf-8")} className={smallButton}>
                      <Download className="h-4 w-4" aria-hidden="true" /> Cleaned map (CSV)
                    </button>
                  </div>
                  <p className="mt-3 text-xs leading-6 text-slate-400">
                    After deploying, test a few URLs with <span className="font-mono text-slate-300">curl -I https://your-domain.com/old-page</span> and
                    check for the status code and a <span className="font-mono text-slate-300">location</span> header.
                  </p>
                </div>
              ) : (
                <p className="mt-4 flex items-start gap-2 rounded-2xl border border-amber-300/30 bg-amber-300/10 p-4 text-sm text-amber-200">
                  <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
                  No valid rules yet. Fix the errors below and the output will appear.
                </p>
              )}

              {analysis.rules.length > 0 && errors === 0 && (
                <p className="mt-3 flex items-center gap-2 text-xs font-bold text-emerald-300">
                  <CheckCircle2 className="h-4 w-4" aria-hidden="true" /> All {analysis.rules.length.toLocaleString()} rules passed the safety checks.
                </p>
              )}

              {analysis.issues.length > 0 && (
                <ul className="mt-3 max-h-72 space-y-2 overflow-auto pr-1">
                  {analysis.issues.map((issue, index) => (
                    <li key={`${issue.line}-${index}`} className={`rounded-xl border p-3 text-xs leading-6 ${LEVEL_CLASS[issue.level]}`}>
                      <span className="font-extrabold">{LEVEL_LABEL[issue.level]}</span>
                      {issue.line ? ` · line ${issue.line}` : ""}: {issue.message}
                    </li>
                  ))}
                </ul>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
