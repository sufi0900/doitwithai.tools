"use client";

import { useEffect, useMemo, useState } from "react";
import {
  AlertTriangle,
  Check,
  CheckCircle2,
  Copy,
  Download,
  Key,
  Loader2,
  RefreshCw,
  Send,
  ShieldCheck,
} from "lucide-react";
import {
  MAX_URLS,
  buildCurl,
  generateKey,
  isValidHost,
  isValidKey,
  keyFileName,
  keyFileUrl,
  normalizeHost,
  parseUrlList,
  type Tone,
} from "./indexnowLib";

const STORAGE_KEY = "indexnow-tool:v1";

const inputClass =
  "min-w-0 w-full rounded-xl border border-white/10 bg-slate-900/70 px-3 py-2.5 text-sm text-white placeholder:text-slate-500 focus:border-[#7f9aff] focus:outline-none focus:ring-2 focus:ring-[#5271ff]/40";
const labelClass = "mb-1.5 block text-xs font-bold uppercase tracking-wider text-slate-400";
const smallButton =
  "inline-flex items-center gap-2 rounded-xl border border-white/15 px-4 py-2.5 text-xs font-bold text-slate-200 transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-50";
const primaryButton =
  "inline-flex items-center gap-2 rounded-xl bg-white px-4 py-2.5 text-xs font-extrabold text-slate-950 transition hover:bg-blue-50 disabled:cursor-not-allowed disabled:opacity-50";

interface Feedback {
  tone: Tone;
  title: string;
  detail: string;
}

const toneClass: Record<Tone, string> = {
  success: "border-emerald-300/30 bg-emerald-300/10 text-emerald-200",
  warning: "border-amber-300/30 bg-amber-300/10 text-amber-200",
  error: "border-rose-300/30 bg-rose-300/10 text-rose-200",
};

async function callApi(payload: Record<string, unknown>): Promise<Record<string, unknown>> {
  const res = await fetch("/api/indexnow", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(payload),
  });
  try {
    return (await res.json()) as Record<string, unknown>;
  } catch {
    return { ok: false, message: "The server returned an unreadable response." };
  }
}

export default function IndexNowClient() {
  const [hostInput, setHostInput] = useState("");
  const [key, setKey] = useState("");
  const [urlsText, setUrlsText] = useState("");
  const [verifying, setVerifying] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [verifyResult, setVerifyResult] = useState<Feedback | null>(null);
  const [submitResult, setSubmitResult] = useState<Feedback | null>(null);
  const [copied, setCopied] = useState("");

  // Restore the last host and key from this browser only.
  useEffect(() => {
    try {
      const saved = window.localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved) as { host?: string; key?: string };
        if (typeof parsed.host === "string") setHostInput(parsed.host);
        if (typeof parsed.key === "string") setKey(parsed.key);
      }
    } catch {
      /* storage unavailable ; ignore */
    }
  }, []);

  useEffect(() => {
    try {
      if (hostInput || key) window.localStorage.setItem(STORAGE_KEY, JSON.stringify({ host: hostInput, key }));
    } catch {
      /* ignore */
    }
  }, [hostInput, key]);

  const host = useMemo(() => normalizeHost(hostInput), [hostInput]);
  const hostOk = isValidHost(host);
  const keyOk = isValidKey(key);
  const parsedUrls = useMemo(() => (hostOk ? parseUrlList(urlsText, host) : null), [urlsText, host, hostOk]);
  const validCount = parsedUrls?.valid.length ?? 0;
  const tooMany = validCount > MAX_URLS;
  const canSubmit = hostOk && keyOk && validCount > 0 && !tooMany && !submitting;

  const copy = async (label: string, value: string) => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(label);
      window.setTimeout(() => setCopied(""), 1800);
    } catch {
      setCopied("");
    }
  };

  const downloadKeyFile = () => {
    const blob = new Blob([key], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = keyFileName(key);
    link.click();
    URL.revokeObjectURL(url);
  };

  const verify = async () => {
    setVerifying(true);
    setVerifyResult(null);
    try {
      const data = await callApi({ action: "verify", host, key });
      setVerifyResult({
        tone: data.ok === true ? "success" : "error",
        title: data.ok === true ? "Key file verified" : "Key file problem",
        detail: typeof data.message === "string" ? data.message : "Something went wrong.",
      });
    } catch {
      setVerifyResult({ tone: "error", title: "Check failed", detail: "Couldn't reach the tool's server. Try again." });
    } finally {
      setVerifying(false);
    }
  };

  const submit = async () => {
    if (!parsedUrls) return;
    setSubmitting(true);
    setSubmitResult(null);
    try {
      const data = await callApi({ action: "submit", host, key, urls: parsedUrls.valid });
      if (typeof data.status === "number" && typeof data.title === "string") {
        setSubmitResult({
          tone: (data.tone as Tone) ?? "warning",
          title: data.title,
          detail: `${typeof data.detail === "string" ? data.detail : ""}${
            typeof data.submitted === "number" ? ` (${data.submitted} URL${data.submitted === 1 ? "" : "s"} sent.)` : ""
          }`,
        });
      } else {
        setSubmitResult({
          tone: "error",
          title: "Not submitted",
          detail: typeof data.message === "string" ? data.message : "Something went wrong.",
        });
      }
    } catch {
      setSubmitResult({ tone: "error", title: "Not submitted", detail: "Couldn't reach the tool's server. Try again." });
    } finally {
      setSubmitting(false);
    }
  };

  const CopyIcon = ({ label }: { label: string }) =>
    copied === label ? <Check className="h-4 w-4 text-emerald-300" aria-hidden="true" /> : <Copy className="h-4 w-4" aria-hidden="true" />;

  return (
    <div
      id="indexnow-key-generator"
      className="mx-auto max-w-6xl scroll-mt-24 rounded-3xl border border-white/10 bg-white/[0.06] p-5 text-left backdrop-blur sm:p-8"
    >
      <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
        {/* Step 1 */}
        <div>
          <p className={labelClass}>1. Generate your key and key file</p>
          <label className="mb-1 block text-xs font-semibold text-slate-300" htmlFor="indexnow-host">
            Your website domain
          </label>
          <input
            id="indexnow-host"
            type="text"
            value={hostInput}
            onChange={(event) => setHostInput(event.target.value)}
            placeholder="www.example.com"
            autoComplete="off"
            className={inputClass}
          />
          <p className="mt-1.5 text-xs text-slate-400">
            Use the exact host your URLs use ; <span className="font-semibold">www.example.com</span> and{" "}
            <span className="font-semibold">example.com</span> count as different hosts.
          </p>
          {hostInput && !hostOk && (
            <p role="alert" className="mt-1.5 text-xs font-semibold text-amber-300">
              Enter a public domain such as example.com (no IP address, port, or local name).
            </p>
          )}

          <label className="mb-1 mt-4 block text-xs font-semibold text-slate-300" htmlFor="indexnow-key">
            IndexNow key
          </label>
          <div className="flex gap-2">
            <input
              id="indexnow-key"
              type="text"
              value={key}
              onChange={(event) => setKey(event.target.value.trim())}
              placeholder="Generate or paste a key"
              spellCheck={false}
              className={`${inputClass} font-mono text-xs`}
            />
            <button type="button" onClick={() => setKey(generateKey())} className={primaryButton}>
              {key ? <RefreshCw className="h-4 w-4" aria-hidden="true" /> : <Key className="h-4 w-4" aria-hidden="true" />}
              {key ? "New" : "Generate"}
            </button>
          </div>
          {key && !keyOk && (
            <p role="alert" className="mt-1.5 text-xs font-semibold text-amber-300">
              Keys must be 8–128 characters: letters, numbers, and dashes only.
            </p>
          )}

          {keyOk && (
            <div className="mt-4 rounded-2xl border border-white/10 bg-slate-900/60 p-4">
              <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Key file to host</p>
              <p className="mt-2 break-all font-mono text-xs text-blue-200">{keyFileName(key)}</p>
              <p className="mt-1 text-xs leading-6 text-slate-400">
                A plain text file containing only the key, placed at the root of your site
                {hostOk ? (
                  <>
                    {" "}so it opens at <span className="break-all font-mono text-slate-300">{keyFileUrl(host, key)}</span>
                  </>
                ) : null}
                .
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                <button type="button" onClick={downloadKeyFile} className={primaryButton}>
                  <Download className="h-4 w-4" aria-hidden="true" /> Download key file
                </button>
                <button type="button" onClick={() => void copy("key", key)} className={smallButton}>
                  <CopyIcon label="key" /> Copy key
                </button>
                <button type="button" onClick={verify} disabled={!hostOk || verifying} className={smallButton}>
                  {verifying ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> : <ShieldCheck className="h-4 w-4" aria-hidden="true" />}
                  Check key file
                </button>
              </div>
              {verifyResult && (
                <p role="status" className={`mt-3 rounded-xl border p-3 text-xs leading-6 ${toneClass[verifyResult.tone]}`}>
                  <span className="font-extrabold">{verifyResult.title}.</span> {verifyResult.detail}
                </p>
              )}
            </div>
          )}
          <p className="mt-3 text-xs leading-6 text-slate-400">
            Your domain and key are remembered in this browser only, so you can reuse the same key later.
          </p>
        </div>

        {/* Step 2 */}
        <div>
          <p className={labelClass}>2. Submit new or updated URLs</p>
          <label className="mb-1 block text-xs font-semibold text-slate-300" htmlFor="indexnow-urls">
            URLs (one per line, up to {MAX_URLS.toLocaleString()})
          </label>
          <textarea
            id="indexnow-urls"
            value={urlsText}
            onChange={(event) => setUrlsText(event.target.value)}
            rows={9}
            spellCheck={false}
            placeholder={"https://www.example.com/new-post\nhttps://www.example.com/updated-page"}
            className={`${inputClass} font-mono text-xs`}
          />

          {parsedUrls && urlsText.trim() && (
            <ul className="mt-2 space-y-1 text-xs leading-6" aria-live="polite">
              <li className="flex items-center gap-2 text-emerald-300">
                <CheckCircle2 className="h-3.5 w-3.5" aria-hidden="true" /> {validCount.toLocaleString()} valid URL{validCount === 1 ? "" : "s"} on {host}
              </li>
              {parsedUrls.wrongHost.length > 0 && (
                <li className="flex items-start gap-2 text-amber-300">
                  <AlertTriangle className="mt-1 h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                  {parsedUrls.wrongHost.length} URL(s) are on a different host and must be removed (e.g. {parsedUrls.wrongHost[0]})
                </li>
              )}
              {parsedUrls.invalid.length > 0 && (
                <li className="flex items-start gap-2 text-amber-300">
                  <AlertTriangle className="mt-1 h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                  {parsedUrls.invalid.length} entr{parsedUrls.invalid.length === 1 ? "y isn't" : "ies aren't"} a valid URL (e.g. {parsedUrls.invalid[0]})
                </li>
              )}
              {parsedUrls.insecure > 0 && (
                <li className="flex items-start gap-2 text-slate-300">
                  <AlertTriangle className="mt-1 h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                  {parsedUrls.insecure} URL(s) use http:// ; submit the https:// version if that is your canonical URL.
                </li>
              )}
              {parsedUrls.duplicates > 0 && <li className="text-slate-400">{parsedUrls.duplicates} duplicate(s) removed.</li>}
              {tooMany && <li className="text-amber-300">Too many URLs ; submit {MAX_URLS.toLocaleString()} or fewer at a time.</li>}
            </ul>
          )}
          {!hostOk && urlsText.trim() && <p className="mt-2 text-xs text-slate-400">Enter your domain in step 1 to validate these URLs.</p>}

          <div className="mt-4 flex flex-wrap gap-2">
            <button type="button" onClick={submit} disabled={!canSubmit || parsedUrls?.wrongHost.length !== 0 || parsedUrls?.invalid.length !== 0} className={primaryButton}>
              {submitting ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> : <Send className="h-4 w-4" aria-hidden="true" />}
              Submit to IndexNow
            </button>
            <button
              type="button"
              disabled={!hostOk || !keyOk || validCount === 0}
              onClick={() => parsedUrls && void copy("curl", buildCurl(host, key, parsedUrls.valid))}
              className={smallButton}
            >
              <CopyIcon label="curl" /> Copy as cURL
            </button>
          </div>
          {keyOk && hostOk && !verifyResult && validCount > 0 && (
            <p className="mt-2 text-xs text-slate-400">Tip: run &ldquo;Check key file&rdquo; first ; a missing key file is the most common cause of a 403 error.</p>
          )}
          {submitResult && (
            <p role="status" className={`mt-3 rounded-xl border p-3 text-xs leading-6 ${toneClass[submitResult.tone]}`}>
              <span className="font-extrabold">{submitResult.title}.</span> {submitResult.detail}
            </p>
          )}
          <p className="mt-3 text-xs leading-6 text-slate-400">
            Submitting tells participating search engines these pages changed. It doesn&apos;t guarantee indexing or rankings.
          </p>
        </div>
      </div>
    </div>
  );
}
