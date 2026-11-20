"use client";

import { useEffect, useState } from "react";
import { agencyRequest } from "./agency-request";
import type { KnowledgeRow } from "./KnowledgeReview";

type Fields = { heading: string; title: string; description: string };
type Snapshot = {
  fields: Fields;
  suggested?: Fields;
  publication?: string;
  findings: string[];
};
type Scan = {
  cycle: string;
  report: {
    files?: { url: string; status: number | null }[];
    added: string[];
    removed: string[];
    coverage: string;
    checks: { url: string; findings: string[] }[];
  };
};

const labels: Record<keyof Fields, string> = {
  heading: "Page heading (H1)",
  title: "SEO title",
  description: "Meta description",
};
const maxLengths: Record<keyof Fields, number> = {
  heading: 120,
  title: 70,
  description: 170,
};
const keys = Object.keys(labels) as (keyof Fields)[];
const endpoint = "/api/ai-employee-agency/refresh";

export function RefreshWorkbench({
  website,
  audit,
}: {
  website: KnowledgeRow;
  audit: boolean;
}) {
  const pages = website.profile.pages || [];
  const [url, setUrl] = useState("");
  const [snapshot, setSnapshot] = useState<Snapshot>();
  const [draft, setDraft] = useState<Fields>();
  const [scan, setScan] = useState<Scan>();
  const [notice, setNotice] = useState("");
  const [busy, setBusy] = useState(false);
  const [version, refresh] = useState(0);

  useEffect(() => {
    const controller = new AbortController();
    setSnapshot(undefined);
    setDraft(undefined);
    setNotice(url ? "Reading live page metadata…" : "");
    setScan(undefined);
    agencyRequest(endpoint + (url ? "?url=" + encodeURIComponent(url) : ""), {
      signal: controller.signal,
    })
      .then(async (r) => {
        const data = await r.json();
        if (!r.ok) throw Error(data.error);
        if (controller.signal.aborted) return;
        if (url) {
          setSnapshot(data);
          setDraft(data.suggested || data.fields);
        } else {
          setScan(data.scan);
        }
        setNotice("");
      })
      .catch((err) => {
        if (!controller.signal.aborted) setNotice(err.message);
      });
    return () => controller.abort();
  }, [url, version]);

  async function apply() {
    if (!snapshot || !draft) return;
    setBusy(true);
    try {
      const r = await agencyRequest(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          url,
          publication: snapshot.publication,
          before: snapshot.fields,
          after: draft,
        }),
      });
      const data = await r.json();
      if (!r.ok) throw Error(data.error);
      refresh((v) => v + 1);
      setNotice("Page metadata updated and revalidated.");
    } catch (err) {
      setNotice(err instanceof Error ? err.message : "Update failed.");
    } finally {
      setBusy(false);
    }
  }

  const escape = (s: string) =>
    s.replace(
      /[&<>"']/g,
      (c) =>
        ({
          "&": "&amp;",
          "<": "&lt;",
          ">": "&gt;",
          '"': "&quot;",
          "'": "&#39;",
        })[c]!,
    );

  return (
    <section className="space-y-5 rounded-xl border border-slate-800 bg-[#111827] p-5">
      {audit && !url && (
        <div className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 pb-3">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-wider text-blue-400">
                Technical Site Audit
              </p>
              <h2 className="text-base font-semibold text-white">Weekly Site Scan &amp; Crawl Files</h2>
            </div>
            {scan && (
              <span className="rounded-full border border-slate-700 bg-[#0B0F17] px-3 py-1 font-mono text-xs text-slate-300">
                {scan.cycle} · {scan.report.coverage} inventory
              </span>
            )}
          </div>

          {scan ? (
            <div className="space-y-4">
              {scan.report.files && scan.report.files.length > 0 && (
                <div className="grid gap-2.5 sm:grid-cols-3">
                  {scan.report.files.map((f) => {
                    const ok = f.status === 200;
                    return (
                      <div
                        key={f.url}
                        className="rounded-lg border border-slate-800 bg-[#0B0F17] p-3"
                      >
                        <div className="flex items-center justify-between gap-2">
                          <span className="truncate font-mono text-xs text-slate-300">
                            {f.url.replace(/^https?:\/\/[^/]+/, "") || "/"}
                          </span>
                          <span
                            className={`rounded-full px-2 py-0.5 font-mono text-[10px] font-semibold ${
                              ok
                                ? "bg-emerald-500/15 text-emerald-300"
                                : "bg-slate-800 text-slate-400"
                            }`}
                          >
                            {f.status === null ? "Unavailable" : `HTTP ${f.status}`}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              <div className="grid gap-3 sm:grid-cols-2">
                {(["added", "removed"] as const).map((key) => (
                  <details
                    key={key}
                    className="rounded-lg border border-slate-800 bg-[#0B0F17] p-3"
                  >
                    <summary className="cursor-pointer text-xs font-semibold text-slate-200">
                      {scan.report[key].length} URLs {key}
                    </summary>
                    <div className="mt-2 max-h-40 space-y-1 overflow-y-auto">
                      {scan.report[key].length === 0 ? (
                        <p className="text-xs text-slate-500">None in this cycle.</p>
                      ) : (
                        scan.report[key].map((u) => (
                          <p key={u} className="truncate font-mono text-[11px] text-slate-400">
                            {u}
                          </p>
                        ))
                      )}
                    </div>
                  </details>
                ))}
              </div>

              {scan.report.checks.length > 0 && (
                <div className="space-y-2">
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                    Inspected Pages ({scan.report.checks.length})
                  </h3>
                  <div className="space-y-2">
                    {scan.report.checks.map((c) => (
                      <div
                        key={c.url}
                        className="rounded-lg border border-slate-800 bg-[#0B0F17] p-3"
                      >
                        <strong className="block truncate font-mono text-xs text-slate-200">
                          {c.url}
                        </strong>
                        <p className="mt-1 text-xs text-slate-400">
                          {c.findings.join(" · ") || "No issues in checked fields"}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <p className="rounded-lg border border-slate-800 bg-[#0B0F17] p-4 text-sm text-slate-400">
              No weekly scan recorded yet. Select any approved URL below to inspect and refresh its live on-page metadata immediately.
            </p>
          )}
        </div>
      )}

      <div className="space-y-2">
        <label className="block space-y-1.5 text-xs font-medium text-slate-300">
          <span>Inspect &amp; refresh an approved URL ({pages.length} indexed)</span>
          <select
            className="block w-full rounded-lg border border-slate-700 bg-[#0B0F17] px-3 py-2.5 text-sm text-slate-100"
            disabled={busy}
            value={url}
            onChange={(e) => setUrl(e.target.value)}
          >
            <option value="">Choose an indexed page…</option>
            {pages.map((p) => (
              <option key={p.url} value={p.url}>
                {p.url}
              </option>
            ))}
          </select>
        </label>
      </div>

      {snapshot && draft && (
        <div className="space-y-4 border-t border-slate-800 pt-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-blue-400">
              On-Page Diagnostics
            </span>
            <span className="rounded-full border border-slate-700 bg-[#0B0F17] px-3 py-0.5 text-xs text-slate-300">
              {snapshot.findings.join(" · ") || "No issues in checked fields"}
            </span>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-3 rounded-xl border border-slate-800 bg-[#0B0F17] p-4">
              <h3 className="text-sm font-semibold text-slate-200">Current live page</h3>
              {keys.map((k) => (
                <div key={k} className="space-y-1">
                  <strong className="text-xs text-slate-400">{labels[k]}</strong>
                  <p className="rounded-lg border border-slate-800/80 bg-[#111827] p-2.5 text-xs text-slate-200">
                    {snapshot.fields[k] || "Empty"}
                  </p>
                </div>
              ))}
            </div>

            <div className="space-y-3 rounded-xl border border-slate-800 bg-[#0B0F17] p-4">
              <h3 className="text-sm font-semibold text-white">Proposed SEO update</h3>
              {keys.map((k) => (
                <label className="block space-y-1" key={k}>
                  <div className="flex items-center justify-between text-xs text-slate-400">
                    <span>{labels[k]}</span>
                    <span className="font-mono text-[11px]">
                      {draft[k].length}/{maxLengths[k]}
                    </span>
                  </div>
                  <textarea
                    rows={k === "description" ? 3 : 2}
                    value={draft[k]}
                    disabled={busy}
                    maxLength={maxLengths[k]}
                    className="block w-full rounded-lg border border-slate-700 bg-[#111827] p-2.5 text-xs text-slate-100 focus:border-blue-500 focus:outline-none"
                    onChange={(e) => setDraft({ ...draft, [k]: e.target.value })}
                  />
                </label>
              ))}
            </div>
          </div>

          {snapshot.publication ? (
            <button
              type="button"
              className="rounded-lg bg-[#2563EB] px-4 py-2 text-xs font-semibold text-white transition hover:bg-blue-500 disabled:opacity-50"
              disabled={
                busy ||
                keys.every((k) => snapshot.fields[k] === draft[k]) ||
                keys.some((k) => !draft[k].trim())
              }
              onClick={() => void apply()}
            >
              {busy ? "Applying Update…" : "Approve & Update Live Page"}
            </button>
          ) : (
            <label className="block space-y-1.5 text-xs font-medium text-slate-300">
              <span>Copy-ready HTML patch for external CMS</span>
              <textarea
                readOnly
                rows={4}
                className="block w-full rounded-lg border border-slate-700 bg-[#0B0F17] p-3 font-mono text-xs text-slate-200"
                onFocus={(e) => e.target.select()}
                value={
                  "<title>" +
                  escape(draft.title) +
                  '</title>\n<meta name="description" content="' +
                  escape(draft.description) +
                  '">\n<h1>' +
                  escape(draft.heading) +
                  "</h1>"
                }
              />
            </label>
          )}
        </div>
      )}

      {notice && (
        <p className="text-xs text-slate-400" role="status">
          {notice}
        </p>
      )}
    </section>
  );
}
