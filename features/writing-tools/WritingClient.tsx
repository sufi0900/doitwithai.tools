"use client";
import { useRef, useState, type FormEvent } from "react";
import { writingChecks, writingInputSchema, writingOutputSchema, type WritingKind, type WritingOutput } from "./schema";
export default function WritingClient({ kind }: { kind: WritingKind }) {
  const [result, setResult] = useState<WritingOutput | null>(null);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [keyword, setKeyword] = useState("");
  const [title, setTitle] = useState("");
  const [copied, setCopied] = useState<number | null>(null);
  const resultsRef = useRef<HTMLHeadingElement>(null);
  const label = kind === "meta-description" ? "meta descriptions" : "H1 headings";
  const field = "mt-2 w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-slate-950 focus:outline-none focus:ring-2 focus:ring-[#5271FF]";
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const input = writingInputSchema.safeParse(Object.fromEntries(form));
    if (!input.success) { setMessage("Please provide at least 40 characters of page context."); return; }
    setBusy(true); setMessage(""); setCopied(null); setResult(null);
    const controller = new AbortController();
    const timeout = window.setTimeout(() => controller.abort(), 40_000);
    try {
      const response = await fetch(`/api/ai-tools/${kind}`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(input.data), signal: controller.signal });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error?.message || "Generation is unavailable.");
      setResult(writingOutputSchema.parse(data.result)); setKeyword(input.data.keyword); setTitle(input.data.pageTitle);
      setMessage("Three options are ready. Review and edit them before use.");
      window.setTimeout(() => resultsRef.current?.focus(), 0);
    } catch (e) { setMessage(e instanceof Error && e.name !== "AbortError" ? e.message : "The request timed out. Please try again later."); }
    finally { window.clearTimeout(timeout); setBusy(false); }
  }
  async function copy(text: string, index: number) {
    try { await navigator.clipboard.writeText(text); setCopied(index); }
    catch { setMessage("Copy is unavailable. Select the text and copy it manually."); }
  }
  return <div className="mx-auto max-w-5xl">
    <form onSubmit={submit} aria-busy={busy} className="rounded-3xl bg-white p-5 text-slate-950 shadow-xl sm:p-8">
      <label className="block font-semibold" htmlFor={`${kind}-brief`}>What does your page actually offer?</label>
      <p id={`${kind}-help`} className="mt-2 text-sm text-slate-600">Include the topic, useful details, and facts the page supports. Avoid confidential information. Your brief is sent to our AI provider.</p>
      <textarea id={`${kind}-brief`} name="brief" aria-describedby={`${kind}-help`} required minLength={40} maxLength={5000} rows={6} className={field} placeholder="Describe the page, its audience, and the information or features it contains." />
      <div className="mt-5 grid gap-5 sm:grid-cols-2">
        <label className="font-semibold">Primary keyword (optional)<input name="keyword" maxLength={100} className={field} /></label>
        <label className="font-semibold">Audience (optional)<input name="audience" maxLength={200} className={field} /></label>
        <label className="font-semibold">Page title (optional)<input name="pageTitle" maxLength={160} className={field} /></label>
        <label className="font-semibold">Tone<select name="tone" className={field}><option value="clear">Clear</option><option value="professional">Professional</option><option value="friendly">Friendly</option></select></label>
      </div>
      <button disabled={busy} className="mt-6 rounded-xl bg-[#5271FF] px-6 py-3 font-bold text-white hover:bg-blue-700 disabled:opacity-60">{busy ? "Generating options…" : `Generate ${label}`}</button>
      <p role="status" aria-live="polite" className="mt-4 text-sm text-slate-700">{message}</p>
    </form>
    {result && <section className="mt-8 rounded-3xl bg-slate-50 p-5 text-slate-950 sm:p-8" aria-labelledby={`${kind}-results`}>
      <h2 id={`${kind}-results`} ref={resultsRef} tabIndex={-1} className="text-2xl font-bold">Compare your options</h2>
      <p className="mt-2 text-sm text-slate-600">Checks describe the text. They do not predict rankings, clicks, or AI citations.</p>
      <div className="mt-6 space-y-5">{result.candidates.map((candidate, index) => {
        const checks = writingChecks(candidate.text, keyword, kind);
        return <article key={index} className="rounded-2xl border border-slate-200 bg-white p-5">
          <h3 className="font-bold">Option {index + 1}: {candidate.approach}</h3>
          <label className="mt-4 block text-sm font-semibold">Edit option {index + 1}<textarea value={candidate.text} maxLength={320} rows={3} className={field} onChange={e => { const candidates = result.candidates.map((c, i) => i === index ? { ...c, text: e.target.value } : c); setResult({ candidates }); setCopied(null); }} /></label>
          <p className="mt-3 text-sm text-slate-600">{checks.count} characters. {checks.lengthNote}</p>
          {checks.keywordIncluded !== null && <p className="mt-2 text-sm">Keyword word check: {checks.keywordIncluded ? "all entered words appear" : "some entered words are absent"}. This is a literal text check.</p>}
          <p className="mt-3 text-sm text-slate-600">AI explanation for the original option: {candidate.explanation}</p>
          {kind === "meta-description" && <div className="mt-4 rounded-xl bg-slate-50 p-4"><p className="text-xs text-slate-600">Illustrative snippet preview</p><p className="mt-2 break-words text-lg text-blue-700">{title || "Your page title"}</p><p className="mt-1 break-words text-sm text-slate-700">{candidate.text}</p></div>}
          <button type="button" onClick={() => copy(candidate.text, index)} className="mt-4 rounded-lg border border-slate-300 px-4 py-2 font-semibold">{copied === index ? "Copied" : "Copy text"}</button>
        </article>;
      })}</div>
    </section>}
  </div>;
}
