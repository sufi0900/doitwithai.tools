"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import { ArrowRight, Globe2, ShieldCheck } from "lucide-react";
import ToolRunOverlay, {
  focusToolSection,
} from "@/features/tool-ui/ToolRunOverlay";
import { normalizeDomain, type RatingResult } from "./domain";
import ToolUrlInput from "@/features/tool-ui/ToolUrlInput";

const panel =
  "rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-900 sm:p-8";
export default function RatingClient() {
  const [domain, setDomain] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState<RatingResult | null>(null);
  const input = useRef<HTMLInputElement>(null);
  const output = useRef<HTMLElement>(null);
  const errorBox = useRef<HTMLDivElement>(null);
  const controller = useRef<AbortController | null>(null);
  const mounted = useRef(true);
  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
      controller.current?.abort();
    };
  }, []);
  useEffect(() => {
    if (!busy && result) focusToolSection(output.current);
  }, [busy, result]);
  async function submit(event: FormEvent) {
    event.preventDefault();
    if (busy) return;
    setResult(null);
    setError("");
    let target: string;
    try {
      target = normalizeDomain(domain);
    } catch (e) {
      setError((e as Error).message);
      input.current?.focus();
      return;
    }
    const run = new AbortController();
    controller.current = run;
    setBusy(true);
    try {
      const response = await fetch("/api/ai-tools/domain-rating", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ domain: target }),
        signal: AbortSignal.any([run.signal, AbortSignal.timeout(22000)]),
      });
      const data = await response.json();
      if (run.signal.aborted) return;
      if (!response.ok)
        throw new Error(
          data.error?.message ||
            "The check could not finish. Please try again.",
        );
      if (
        !data.result ||
        typeof data.result.rating !== "number" ||
        !Number.isFinite(data.result.rating) ||
        data.result.rating < 0 ||
        data.result.rating > 100
      )
        throw new Error("No valid rating was returned. Please try again.");
      if (mounted.current) setResult(data.result);
    } catch (e) {
      if (mounted.current) {
        setError(
          run.signal.aborted
            ? "Check stopped. You can run another check when ready."
            : e instanceof Error && e.name !== "TimeoutError"
              ? e.message
              : "The check timed out. Please try again.",
        );
        requestAnimationFrame(() => errorBox.current?.focus());
      }
    } finally {
      if (mounted.current) setBusy(false);
    }
  }
  return (
    <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6">
      <form onSubmit={submit} noValidate className={panel} aria-busy={busy}>
        <div className="mb-6 flex items-center gap-3">
          <Globe2 className="text-[#5271ff]" aria-hidden />
          <h2 className="text-2xl font-bold">
            Check your website’s backlink strength
          </h2>
        </div>
        <label htmlFor="rating-domain" className="block text-sm font-bold">
          Website domain <span className="font-normal">(required)</span>
        </label>
        <p
          id="rating-help"
          className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-300"
        >
          Enter one domain or article URL. We check its registered domain,
          rather than an individual page.
        </p>
        <div className="mt-4 flex flex-col gap-3 sm:flex-row">
          <ToolUrlInput
            urlKind="domain"
            ref={input}
            id="rating-domain"
            name="domain"
            type="text"
            inputMode="url"
            autoCapitalize="none"
            autoCorrect="off"
            spellCheck={false}
            maxLength={2048}
            required
            value={domain}
            disabled={busy}
            onChange={(e) => {
              setDomain(e.target.value);
              setError("");
              setResult(null);
            }}
            placeholder="e.g. doitwithai.tools"
            aria-describedby={
              error ? "rating-help rating-error" : "rating-help"
            }
            aria-invalid={Boolean(error)}
            className="min-w-0 flex-1 rounded-xl border border-slate-300 bg-transparent px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#5271ff] dark:border-slate-600"
          />
          <button
            disabled={busy}
            className="flex items-center justify-center gap-2 rounded-xl bg-[#3452d1] px-6 py-3 font-bold text-white hover:bg-[#2943b5] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#5271ff] disabled:opacity-60"
          >
            {busy ? "Checking…" : "Check Domain Rating"}
            <ArrowRight size={18} aria-hidden />
          </button>
        </div>
        {error && (
          <div
            ref={errorBox}
            id="rating-error"
            role="alert"
            tabIndex={-1}
            className="mt-4 rounded-xl border border-red-300 bg-red-50 p-4 text-sm leading-6 text-red-800 dark:border-red-700 dark:bg-red-950 dark:text-red-200"
          >
            {error}
          </div>
        )}
        <p className="mt-4 flex gap-2 text-xs leading-6 text-slate-500 dark:text-slate-400">
          <ShieldCheck size={16} className="mt-1 shrink-0" aria-hidden />
          Your domain is sent to Ahrefs to retrieve its rating. We do not
          request website access or ownership verification.
        </p>
      </form>
      <ToolRunOverlay
        active={busy}
        title="Checking Domain Rating"
        description="Requesting your domain’s backlink-strength score from Ahrefs."
        onCancel={() => controller.current?.abort()}
      />
      {result && (
        <section
          ref={output}
          tabIndex={-1}
          aria-labelledby="rating-result-title"
          className={`${panel} mt-8 scroll-mt-28 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#5271ff]`}
        >
          <p className="text-xs font-bold uppercase tracking-wider text-[#3452d1] dark:text-blue-200">
            Your result
          </p>
          <h2
            id="rating-result-title"
            className="mt-2 break-all text-2xl font-bold"
          >
            {result.domain}
          </h2>
          <div className="mt-6 grid gap-7 sm:grid-cols-[160px_1fr] sm:items-center">
            <div className="flex h-40 w-40 flex-col items-center justify-center rounded-full border-8 border-[#5271ff]/25 bg-[#5271ff]/5">
              <span className="text-5xl font-black">
                {Number(result.rating.toFixed(1))}
              </span>
              <span className="mt-2 text-sm text-slate-600 dark:text-slate-300">
                DR out of 100
              </span>
            </div>
            <div>
              <p className="font-semibold">
                Domain Rating by{" "}
                <a
                  href="https://ahrefs.com/"
                  className="text-[#3452d1] underline dark:text-blue-200"
                >
                  Ahrefs
                </a>
              </p>
              <p className="mt-3 text-sm leading-7 text-slate-600 dark:text-slate-300">
                A relative measure of backlink-profile strength on a logarithmic
                scale. This score does not measure content quality or guarantee
                rankings.
              </p>
              <p className="mt-3 text-xs leading-6 text-slate-500 dark:text-slate-400">
                Retrieved {new Date(result.checkedAt).toLocaleString()}. Model{" "}
                {result.version.toUpperCase()}. Retrieval time is not the
                backlink index’s update date.
              </p>
            </div>
          </div>
          <p className="mt-6 rounded-xl bg-slate-50 p-4 text-sm leading-7 dark:bg-slate-800">
            Compare with relevant websites in your niche. A zero is a returned
            score; unavailable data is shown separately.
          </p>
        </section>
      )}
    </div>
  );
}
