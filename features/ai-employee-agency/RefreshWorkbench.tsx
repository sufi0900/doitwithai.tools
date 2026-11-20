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
  heading: "Page heading",
  title: "SEO title",
  description: "Meta description",
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
  const [url, setUrl] = useState(""),
    [snapshot, setSnapshot] = useState<Snapshot>(),
    [draft, setDraft] = useState<Fields>();
  const [scan, setScan] = useState<Scan>(),
    [notice, setNotice] = useState(""),
    [busy, setBusy] = useState(false),
    [version, refresh] = useState(0);
  useEffect(() => {
    const controller = new AbortController();
    setSnapshot(undefined);
    setDraft(undefined);
    setNotice(url ? "Reading page…" : "");
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
        } else setScan(data.scan);
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
    <section className="space-y-4 rounded-xl border border-slate-700 p-5">
      {audit && !url && (
        <>
          <h2 className="font-semibold">Weekly site scan</h2>
          {scan ? (
            <>
              <p>
                {scan.cycle} · {scan.report.coverage} inventory
              </p>
              {(["added", "removed"] as const).map((key) => (
                <details key={key}>
                  <summary>
                    {scan.report[key].length} URLs {key}
                  </summary>
                  {scan.report[key].map((u) => (
                    <p key={u}>{u}</p>
                  ))}
                </details>
              ))}
              {scan.report.files?.map((f) => (
                <p key={f.url}>
                  {f.url} ·{" "}
                  {f.status === null ? "Unavailable" : "HTTP " + f.status}
                </p>
              ))}
              {scan.report.checks.map((c) => (
                <div key={c.url}>
                  <strong>{c.url}</strong>
                  <p>
                    {c.findings.join(" · ") || "No issues in checked fields"}
                  </p>
                </div>
              ))}
            </>
          ) : (
            <p>No weekly scan loaded.</p>
          )}
        </>
      )}
      <label className="block">
        Inspect an approved URL
        <select
          className="block w-full rounded bg-slate-800 p-2"
          disabled={busy}
          value={url}
          onChange={(e) => setUrl(e.target.value)}
        >
          <option value="">Choose a page</option>
          {pages.map((p) => (
            <option key={p.url} value={p.url}>
              {p.url}
            </option>
          ))}
        </select>
      </label>
      {snapshot && draft && (
        <>
          <p>
            {snapshot.findings.join(" · ") || "No issues in checked fields"}
          </p>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <h3>Current page</h3>
              {keys.map((k) => (
                <div key={k} className="mt-3">
                  <strong>{labels[k]}</strong>
                  <p>{snapshot.fields[k] || "Empty"}</p>
                </div>
              ))}
            </div>
            <div>
              <h3>Proposed update</h3>
              {keys.map((k) => (
                <label className="mt-3 block" key={k}>
                  {labels[k]}
                  <textarea
                    value={draft[k]}
                    disabled={busy}
                    maxLength={{ heading: 120, title: 70, description: 170 }[k]}
                    className="block w-full rounded bg-slate-800 p-2"
                    onChange={(e) =>
                      setDraft({ ...draft, [k]: e.target.value })
                    }
                  />
                </label>
              ))}
            </div>
          </div>
          {snapshot.publication ? (
            <button
              className="rounded bg-blue-700 p-2"
              disabled={
                busy ||
                keys.every((k) => snapshot.fields[k] === draft[k]) ||
                keys.some((k) => !draft[k].trim())
              }
              onClick={apply}
            >
              Approve and update this page
            </button>
          ) : (
            <label className="block">
              HTML patch for this URL
              <textarea
                readOnly
                rows={4}
                className="block w-full rounded bg-slate-800 p-2"
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
        </>
      )}
      <p role="status">{notice}</p>
    </section>
  );
}
