"use client";

import { useMemo, useState } from "react";
import {
  AlertTriangle,
  CheckCircle2,
  Copy,
  Download,
  MapPin,
  XCircle,
} from "lucide-react";
import {
  auditNapConsistency,
  DEFAULT_NAP_INPUT,
  type NapMasterInput,
} from "./model";

export default function NapConsistencyCheckerClient() {
  const [input, setInput] = useState<NapMasterInput>(DEFAULT_NAP_INPUT);
  const [toast, setToast] = useState("");

  const result = useMemo(() => auditNapConsistency(input), [input]);

  function notify(msg: string) {
    setToast(msg);
    setTimeout(() => setToast(""), 2600);
  }

  function updateField<K extends keyof NapMasterInput>(
    key: K,
    val: NapMasterInput[K],
  ) {
    setInput((prev) => ({ ...prev, [key]: val }));
  }

  function downloadMasterCsv() {
    const blob = new Blob([result.csvExportString], {
      type: "text/csv;charset=utf-8",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "local-citation-master-sheet.csv";
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    notify("Downloaded Master Citation Tracker (.CSV)!");
  }

  return (
    <section
      aria-label="NAP Consistency Checker and Citation Formatter Workspace"
      className="mx-auto w-full max-w-6xl overflow-x-clip px-4 py-10 sm:px-6"
    >
      {toast && (
        <div
          role="status"
          className="mb-5 flex items-center gap-2 rounded-xl border border-emerald-500/40 bg-emerald-500/10 px-4 py-2.5 text-xs font-bold text-emerald-800 dark:text-emerald-300"
        >
          <CheckCircle2 size={15} />
          <span>{toast}</span>
        </div>
      )}

      {/* Standardized Master NAP Banner */}
      <div className="mb-6 rounded-3xl border border-slate-200 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-[#111827] sm:p-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <span className="text-xs font-extrabold uppercase tracking-wider text-[#3452d1] dark:text-[#9aabff]">
              Canonical USPS-Normalized NAP Record
            </span>
            <h2 className="mt-1 text-xl font-black text-slate-900 dark:text-white">
              {input.masterName}
            </h2>
            <p className="mt-0.5 font-mono text-xs text-slate-600 dark:text-slate-300">
              {result.standardizedUspsLine} · {result.standardizedPhoneLocal} (
              {result.standardizedPhoneE164})
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-center dark:border-slate-800 dark:bg-slate-900">
              <span className="block text-[10px] font-extrabold uppercase text-slate-500">
                NAP Consistency Score
              </span>
              <strong className="text-2xl font-black text-emerald-600 dark:text-emerald-400">
                {result.overallConsistencyScore}/100
              </strong>
            </div>
            <button
              type="button"
              onClick={downloadMasterCsv}
              className="inline-flex items-center gap-2 rounded-xl bg-[#3452d1] px-4 py-3 text-xs font-extrabold text-white shadow-sm hover:bg-[#2842b5]"
            >
              <Download size={15} />
              Download Citation Master Sheet (.CSV)
            </button>
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.05fr)]">
        {/* LEFT COLUMN: MASTER NAP & CITATION INPUT */}
        <div className="space-y-6">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-[#111827] sm:p-6">
            <h3 className="flex items-center gap-2 text-base font-extrabold">
              <MapPin size={18} className="text-[#5271ff]" />
              1. Master Business NAP (Source of Truth)
            </h3>

            <div className="mt-4 grid gap-3.5 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-200">
                  Official Business Name (Match GBP)
                </label>
                <input
                  type="text"
                  value={input.masterName}
                  onChange={(e) => updateField("masterName", e.target.value)}
                  className="mt-1 w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2 text-sm dark:border-slate-700 dark:bg-slate-900"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-200">
                  Street Address
                </label>
                <input
                  type="text"
                  value={input.masterStreet}
                  onChange={(e) => updateField("masterStreet", e.target.value)}
                  className="mt-1 w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2 text-sm dark:border-slate-700 dark:bg-slate-900"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-200">
                  Suite / Unit (USPS Format)
                </label>
                <input
                  type="text"
                  value={input.masterSuite}
                  onChange={(e) => updateField("masterSuite", e.target.value)}
                  className="mt-1 w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2 text-sm dark:border-slate-700 dark:bg-slate-900"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-200">
                  City
                </label>
                <input
                  type="text"
                  value={input.masterCity}
                  onChange={(e) => updateField("masterCity", e.target.value)}
                  className="mt-1 w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2 text-sm dark:border-slate-700 dark:bg-slate-900"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-200">
                    State
                  </label>
                  <input
                    type="text"
                    value={input.masterState}
                    onChange={(e) => updateField("masterState", e.target.value)}
                    className="mt-1 w-full rounded-xl border border-slate-300 bg-white px-2.5 py-2 text-sm dark:border-slate-700 dark:bg-slate-900"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-200">
                    ZIP / Postal
                  </label>
                  <input
                    type="text"
                    value={input.masterPostal}
                    onChange={(e) =>
                      updateField("masterPostal", e.target.value)
                    }
                    className="mt-1 w-full rounded-xl border border-slate-300 bg-white px-2.5 py-2 text-sm dark:border-slate-700 dark:bg-slate-900"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-200">
                  Primary Local Phone
                </label>
                <input
                  type="text"
                  value={input.masterPhone}
                  onChange={(e) => updateField("masterPhone", e.target.value)}
                  className="mt-1 w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2 text-sm dark:border-slate-700 dark:bg-slate-900"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-200">
                  Website URL
                </label>
                <input
                  type="url"
                  value={input.masterWebsite}
                  onChange={(e) => updateField("masterWebsite", e.target.value)}
                  className="mt-1 w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2 text-sm dark:border-slate-700 dark:bg-slate-900"
                />
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-[#111827] sm:p-6">
            <h3 className="text-base font-extrabold">
              2. Paste Existing Directory Citations to Audit
            </h3>
            <p className="mt-1 text-xs text-slate-600 dark:text-slate-300">
              Format: <code>Directory | Business Name | Address | Phone</code>{" "}
              (one directory per line).
            </p>
            <textarea
              rows={8}
              value={input.citationLines}
              onChange={(e) => updateField("citationLines", e.target.value)}
              className="mt-3 w-full rounded-xl border border-slate-300 bg-slate-50 p-3 font-mono text-xs leading-6 dark:border-slate-700 dark:bg-slate-900"
            />
          </div>
        </div>

        {/* RIGHT COLUMN: LINE-BY-LINE AUDIT RESULTS & CITATION DIRECTORY SHEET */}
        <div className="space-y-6">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-[#111827] sm:p-6">
            <h3 className="text-base font-extrabold">
              Line-by-Line Citation Consistency Audit ({result.auditedRows.length}{" "}
              Listings)
            </h3>

            <div className="mt-4 space-y-3">
              {result.auditedRows.map((row, idx) => (
                <div
                  key={idx}
                  className="rounded-xl border border-slate-200/90 bg-slate-50/70 p-3.5 text-xs dark:border-slate-800 dark:bg-slate-900/60"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <strong className="text-sm font-black text-slate-900 dark:text-white">
                      {row.source}
                    </strong>
                    <div className="flex flex-wrap gap-1.5">
                      {(
                        [
                          ["Name", row.nameMatch],
                          ["Address", row.addressMatch],
                          ["Phone", row.phoneMatch],
                        ] as const
                      ).map(([lbl, status]) => (
                        <span
                          key={lbl}
                          className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-extrabold uppercase ${
                            status === "exact"
                              ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300"
                              : status === "normalized"
                                ? "bg-blue-500/15 text-blue-700 dark:text-blue-300"
                                : "bg-rose-500/15 text-rose-700 dark:text-rose-300"
                          }`}
                        >
                          {status === "exact" ? (
                            <CheckCircle2 size={11} />
                          ) : status === "normalized" ? (
                            <AlertTriangle size={11} />
                          ) : (
                            <XCircle size={11} />
                          )}
                          {lbl}: {status}
                        </span>
                      ))}
                    </div>
                  </div>

                  <p className="mt-2 font-mono text-[11px] text-slate-600 dark:text-slate-300">
                    {row.rawName} · {row.rawAddress} · {row.rawPhone}
                  </p>

                  {row.issues.length > 0 && (
                    <ul className="mt-2 space-y-1 border-t border-slate-200/80 pt-2 text-[11px] font-semibold text-amber-700 dark:border-slate-800 dark:text-amber-300">
                      {row.issues.map((iss, i) => (
                        <li key={i}>• {iss}</li>
                      ))}
                    </ul>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-[#111827] sm:p-6">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h3 className="text-base font-extrabold">
                Top 12 Core Citation &amp; Data Aggregator Checklist
              </h3>
              <button
                type="button"
                onClick={async () => {
                  await navigator.clipboard.writeText(
                    `${input.masterName}\n${result.standardizedUspsLine}\n${result.standardizedPhoneLocal}\n${input.masterWebsite}`,
                  );
                  notify("Copied canonical NAP block!");
                }}
                className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-bold dark:border-slate-700 dark:bg-slate-800"
              >
                <Copy size={13} />
                Copy Canonical NAP Block
              </button>
            </div>

            <div className="mt-3 overflow-x-auto">
              <table className="w-full border-collapse text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-500 dark:border-slate-800">
                    <th className="py-2 pr-3 font-extrabold">Directory</th>
                    <th className="px-3 py-2 font-extrabold">Tier</th>
                    <th className="py-2 pl-3 font-extrabold">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                  {result.topDirectories.map((dir) => (
                    <tr key={dir.directory}>
                      <td className="py-2 pr-3 font-bold">{dir.directory}</td>
                      <td className="px-3 py-2 text-slate-500">{dir.tier}</td>
                      <td className="py-2 pl-3">
                        <a
                          href={dir.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="font-bold text-[#3452d1] hover:underline dark:text-[#9aabff]"
                        >
                          Open Directory ↗
                        </a>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
