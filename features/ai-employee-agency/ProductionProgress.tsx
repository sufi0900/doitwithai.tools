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
          5 + (i * 590) / (data.length - 1) + "," + (95 - (d[key] * 90) / max),
      )
      .join(" ");
  return (
    <section className="rounded-xl border border-slate-700 p-5">
      <div className="flex items-center justify-between">
        <h2>Daily production</h2>
        <select
          className="rounded bg-slate-800 p-2"
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
      {status && <p role="status">{status}</p>}
      {!!data.length && (
        <>
          <p className="text-blue-300">
            Started · {data.reduce((s, d) => s + d.started, 0)}
          </p>
          <p className="text-emerald-300">
            Published · {data.reduce((s, d) => s + d.published, 0)}
          </p>
          <svg
            viewBox="0 0 600 100"
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
          <details>
            <summary>Daily counts (UTC)</summary>
            <table>
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Started</th>
                  <th>Published</th>
                </tr>
              </thead>
              <tbody>
                {data.map((d) => (
                  <tr key={d.day}>
                    <td>{d.day}</td>
                    <td>{d.started}</td>
                    <td>{d.published}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </details>
        </>
      )}
    </section>
  );
}
