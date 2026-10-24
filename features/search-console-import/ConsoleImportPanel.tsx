"use client";
import { useMemo, useRef, useState } from "react";
import { Dataset, readConsoleFile, reportInfo, csvCell } from "./import";
import { parseGscCsv } from "@/features/gsc-striking-distance/gscAnalysis";
const control =
  "min-w-0 w-full rounded-xl border border-white/15 bg-slate-950 p-3 text-sm text-white";
export default function ConsoleImportPanel({
  onChange,
  sample,
  cannibalization = false,
}: {
  onChange: (text: string) => void;
  sample: string;
  cannibalization?: boolean;
}) {
  const input = useRef<HTMLInputElement>(null);
  const [datasets, setDatasets] = useState<Dataset[]>([]),
    [contexts, setContexts] = useState<Record<number, string>>({}),
    [error, setError] = useState(""),
    [busy, setBusy] = useState(false),
    [selected, setSelected] = useState(0);
  const reports = useMemo(
    () => datasets.map((d) => reportInfo(d.text)),
    [datasets],
  );
  async function load(files: FileList | null) {
    if (!files) return;
    setBusy(true);
    setDatasets([]);
    onChange("");
    setError("");
    try {
      if (
        Array.from(files).reduce((sum, file) => sum + file.size, 0) >
        25 * 1024 * 1024
      )
        throw new Error("Choose files totalling 25 MB or less.");
      if (files.length > 20)
        throw new Error("Choose at most 20 files at once.");
      const all: Dataset[] = [];
      for (const file of Array.from(files))
        all.push(...(await readConsoleFile(file)));
      if (all.reduce((sum, d) => sum + d.text.length, 0) > 25 * 1024 * 1024)
        throw new Error(
          "The combined exports exceed 25 MB. Choose fewer files.",
        );
      setDatasets(all);
      setContexts({});
      const best = all.findIndex(
        (d) =>
          reportInfo(d.text).kind ===
          (cannibalization ? "query-pages" : "queries"),
      );
      const i =
        best < 0
          ? Math.max(
              0,
              all.findIndex((d) =>
                ["pages", "queries", "summary"].includes(
                  reportInfo(d.text).kind,
                ),
              ),
            )
          : best;
      setSelected(i);
      onChange(all[i]?.text || "");
    } catch (e) {
      setError(
        e instanceof Error ? e.message : "The file could not be opened.",
      );
    } finally {
      setBusy(false);
      if (input.current) input.current.value = "";
    }
  }
  function combine() {
    const rows = [["Query", "Page", "Clicks", "Impressions", "Position"]];
    let added = 0;
    for (let i = 0; i < datasets.length; i++) {
      const info = reportInfo(datasets[i].text);
      if (info.kind !== "queries" || !contexts[i]) continue;
      let url: URL;
      try {
        url = new URL(contexts[i]);
        if (!/^https?:$/.test(url.protocol)) throw Error();
      } catch {
        setError("Enter a full page URL for each filtered query export.");
        return;
      }
      const parsed = parseGscCsv(datasets[i].text);
      if (!parsed.rows.length) continue;
      for (const row of parsed.rows)
        rows.push([
          row.query,
          url.href,
          String(row.clicks),
          String(row.impressions),
          String(row.position),
        ]);
      added++;
    }
    if (added < 2) {
      setError(
        "Add URLs for at least two query exports, each filtered to a different page in Search Console.",
      );
      return;
    }
    setError("");
    onChange(rows.map((r) => r.map(csvCell).join(",")).join("\n"));
  }
  return (
    <div onDragOver={event=>event.preventDefault()} onDrop={event=>{event.preventDefault();if(!busy)void load(event.dataTransfer.files);}} className="rounded-2xl border border-dashed border-blue-300/40 bg-slate-950/40 p-5">
      <p className="font-bold text-white">
        Upload CSV files or the original Search Console ZIP
      </p>
      <p className="mt-2 text-xs leading-6 text-slate-300">
        Queries and Pages exports are supported. ZIP files show a report
        selector. Files stay in this browser.
      </p>
      <div className="mt-4 flex flex-wrap gap-2">
        <button
          type="button"
          disabled={busy}
          onClick={() => input.current?.click()}
          className="rounded-xl bg-[#5271ff] px-4 py-3 text-sm font-bold text-white disabled:opacity-50"
        >
          {busy ? "Reading files…" : "Choose CSV or ZIP"}
        </button>
        <button
          type="button"
          onClick={() => {
            setDatasets([]);
            setError("");
            onChange(sample);
          }}
          className="rounded-xl border border-white/20 px-4 py-3 text-sm text-white"
        >
          Try sample data
        </button>
        <button
          type="button"
          onClick={() => {
            setDatasets([]);
            setContexts({});
            setError("");
            onChange("");
          }}
          className="rounded-xl border border-white/20 px-4 py-3 text-sm text-white"
        >
          Clear
        </button>
      </div>
      <input
        ref={input}
        type="file"
        multiple
        accept=".csv,.zip,.tsv,text/csv,application/zip"
        aria-label="Upload Search Console CSV or ZIP files"
        className="sr-only"
        onChange={(e) => void load(e.target.files)}
      />
      {datasets.length > 0 && (
        <label className="mt-4 block text-xs text-slate-300">
          Report to review
          <select
            className={control + " mt-2"}
            value={selected}
            onChange={(e) => {
              const i = Number(e.target.value);
              setSelected(i);
              onChange(datasets[i].text);
            }}
          >
            {datasets.map((d, i) => (
              <option key={i} value={i}>
                {d.name} ({reports[i].kind})
              </option>
            ))}
          </select>
        </label>
      )}
      {cannibalization && reports.some((r) => r.kind === "queries") && (
        <details className="mt-4 rounded-xl border border-white/15 p-3">
          <summary className="cursor-pointer text-sm font-bold text-blue-200">
            Compare query exports filtered to individual pages
          </summary>
          <p className="mt-2 text-xs leading-6 text-slate-300">
            Export Queries after applying an exact Page filter in Search
            Console. Upload at least two exports from the same date range.
            Assign each its filtered page URL. Unfiltered query exports cannot
            identify competing pages.
          </p>
          {datasets.map((d, i) =>
            reports[i].kind === "queries" ? (
              <label
                key={i}
                className="mt-3 block break-words text-xs text-slate-300"
              >
                {d.name}
                <input
                  aria-label={"Filtered page URL for " + d.name}
                  className={control + " mt-1"}
                  value={contexts[i] || ""}
                  placeholder="https://example.com/article"
                  onChange={(e) =>
                    setContexts({ ...contexts, [i]: e.target.value })
                  }
                />
              </label>
            ) : null,
          )}
          <button
            type="button"
            onClick={combine}
            className="mt-3 rounded-xl bg-[#5271ff] px-4 py-3 text-sm font-bold text-white"
          >
            Compare assigned pages
          </button>
        </details>
      )}
      {error && (
        <p role="alert" className="mt-3 text-sm leading-6 text-amber-200">
          {error}
        </p>
      )}
    </div>
  );
}
