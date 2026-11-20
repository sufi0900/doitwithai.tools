"use client";

import { useEffect, useState } from "react";
import { agencyRequest } from "./agency-request";

type Point = { day: string; started: number; published: number };
export function ProductionProgress() {
  const [range, setRange] = useState(7);
  const [data, setData] = useState<Point[]>([]);
  const [status, setStatus] = useState("");
  useEffect(() => {
    const controller = new AbortController();
    setData([]);
    setStatus("Loading progress…");
    agencyRequest("/api/ai-employee-agency/progress?days=" + range, {
      signal: controller.signal,
    })
      .then(async (r) => {
        if (!r.ok) throw Error();
        const result = await r.json();
        if (!controller.signal.aborted) {
          setData(result.days);
          setStatus("");
        }
      })
      .catch(() => {
        if (!controller.signal.aborted) setStatus("Progress unavailable.");
      });
    return () => controller.abort();
  }, [range]);
  const max = Math.max(1, ...data.flatMap((d) => [d.started, d.published]));
  const points = (key: "started" | "published") =>
    data
      .map(
        (d, i) =>
          5 +
          (i * 590) / Math.max(1, data.length - 1) +
          "," +
          (95 - (d[key] * 90) / max),
      )
      .join(" ");
  return (
    <section className="space-y-4 rounded-xl border border-slate-800 bg-[#111827] p-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-wider text-blue-400">
            Velocity Telemetry
          </p>
          <h2 className="text-base font-semibold text-white">Daily production</h2>
        </div>
        <select
          className="rounded-lg border border-slate-700 bg-[#0B0F17] px-3 py-1.5 text-xs font-medium text-slate-100 focus:border-blue-500 focus:outline-none"
          aria-label="Progress period"
          value={range}
          onChange={(e) => setRange(Number(e.target.value))}
        >
          {[7, 30, 90].map((n) => (
            <option key={n} value={n}>
              {n} days
            </option>
          ))}
        </select>
      </div>
      {status && (
        <p role="status" className="text-xs text-slate-400">
          {status}
        </p>
      )}
      {!!data.length && (
        <>
          <div className="flex flex-wrap items-center gap-3 text-xs">
            <span className="inline-flex items-center gap-2 rounded-lg border border-slate-800 bg-[#0B0F17] px-3 py-1.5 font-mono text-blue-300">
              <i className="h-2 w-2 rounded-full bg-blue-400" />
              Started · {data.reduce((s, d) => s + d.started, 0)}
            </span>
            <span className="inline-flex items-center gap-2 rounded-lg border border-slate-800 bg-[#0B0F17] px-3 py-1.5 font-mono text-emerald-300">
              <i className="h-2 w-2 rounded-full bg-emerald-400" />
              Published · {data.reduce((s, d) => s + d.published, 0)}
            </span>
          </div>
          <svg
            viewBox="0 0 600 100"
            preserveAspectRatio="none"
            className="h-32 w-full rounded-lg border border-slate-800/80 bg-[#0B0F17] p-2"
            role="img"
            aria-label="Daily production starts and confirmed publications"
          >
            <polyline
              fill="none"
              stroke="#93c5fd"
              strokeWidth="2"
              points={points("started")}
            />
            <polyline
              fill="none"
              stroke="#6ee7b7"
              strokeWidth="2"
              points={points("published")}
            />
          </svg>
          <details className="rounded-lg border border-slate-800 bg-[#0B0F17] p-3 text-xs">
            <summary className="cursor-pointer font-medium text-slate-200">
              Daily counts (UTC)
            </summary>
            <div className="mt-3 overflow-x-auto rounded-lg border border-slate-800">
              <table className="w-full text-left text-xs">
                <thead className="border-b border-slate-800 bg-[#111827] text-[11px] uppercase tracking-wider text-slate-400">
                  <tr>
                    <th className="px-3 py-2 font-semibold">Date</th>
                    <th className="px-3 py-2 font-semibold">Started</th>
                    <th className="px-3 py-2 font-semibold">Published</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/70">
                  {data.map((d) => (
                    <tr key={d.day} className="text-slate-300">
                      <td className="px-3 py-2 font-mono">{d.day}</td>
                      <td className="px-3 py-2 font-mono">{d.started}</td>
                      <td className="px-3 py-2 font-mono">{d.published}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </details>
        </>
      )}
    </section>
  );
}
