"use client";

import { useEffect, useState } from "react";
import { agencyRequest } from "./agency-request";
import type { KnowledgeRow } from "./KnowledgeReview";

const endpoint = "/api/ai-employee-agency/visual-studio";

export function VisualBrandStudio({ website }: { website: KnowledgeRow }) {
  const [brief, setBrief] = useState(""),
    [kind, setKind] = useState("Blog hero"),
    [optIn, setOptIn] = useState(false);
  const [steps, setSteps] = useState("");
  const [image, setImage] = useState(""),
    [references, setReferences] = useState<{ name: string; url: string }[]>([]);
  const [available, setAvailable] = useState(false),
    [status, setStatus] = useState(""),
    [busy, setBusy] = useState(false);

  const colors = (website.profile.colors || []).filter((c) =>
    /^#[0-9a-f]{3,8}$/i.test(c),
  );

  async function load() {
    const res = await agencyRequest(endpoint),
      data = await res.json();
    if (!res.ok) throw Error(data.error);
    setReferences(data.references);
    setAvailable(data.aiAvailable);
  }

  useEffect(() => {
    load().catch((err) => setStatus(err.message));
  }, []);

  async function act(body: FormData | { optIn: true; prompt: string }) {
    setBusy(true);
    setStatus("");
    try {
      const upload = body instanceof FormData;
      const res = await agencyRequest(endpoint, {
        method: "POST",
        headers: upload ? undefined : { "Content-Type": "application/json" },
        body: upload ? body : JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) throw Error(data.error);
      if (upload) await load();
      else setImage(data.image);
    } catch (err) {
      setStatus(err instanceof Error ? err.message : "Request failed.");
    } finally {
      setBusy(false);
    }
  }

  const width = kind === "Pin template" ? 1000 : 1200,
    height =
      kind === "Pin template"
        ? 1500
        : kind === "Process infographic"
          ? 1200
          : 675;

  const escape = (s: string) =>
    s.replace(
      /[<>&"']/g,
      (c) =>
        ({
          "<": "&lt;",
          ">": "&gt;",
          "&": "&amp;",
          '"': "&quot;",
          "'": "&#39;",
        })[c]!,
    );

  const lines = brief.trim().match(/.{1,30}(?:\s+|$)|.{1,30}/gu) || [];
  const foreground = colors[1] || "#2563EB";
  const items = steps
    .split("\n")
    .map((s) => s.trim())
    .filter(Boolean)
    .slice(0, 5);

  const textLines = (rows: string[], x: number, y: number, size: number) =>
    rows
      .map(
        (s, i) =>
          '<text fill="white" font-family="sans-serif" font-size="' +
          size +
          '" x="' +
          x +
          '" y="' +
          (y + i * (size + 12)) +
          '">' +
          escape(s.trim()) +
          "</text>",
      )
      .join("");

  const diagram =
    kind === "Process infographic"
      ? items
          .map((s, i) => {
            const y = 440 + i * 140;
            const rows = s.match(/.{1,45}(?:\s+|$)|.{1,45}/gu) || [];
            return (
              '<rect x="75" y="' +
              y +
              '" width="1050" height="125" rx="18" fill="#1e293b"/><circle cx="118" cy="' +
              (y + 60) +
              '" r="12" fill="' +
              foreground +
              '"/>' +
              textLines(rows, 160, y + 50, 28)
            );
          })
          .join("")
      : "";

  const svg =
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ' +
    width +
    " " +
    height +
    '"><rect width="100%" height="100%" fill="' +
    (colors[0] || "#0B0F17") +
    '"/><rect x="5%" y="8%" width="90%" height="84%" rx="24" fill="#111827"/><rect x="9%" y="13%" width="14%" height="12" fill="' +
    foreground +
    '"/>' +
    textLines(lines, width * 0.09, height * 0.2, 38) +
    diagram +
    "</svg>";

  const asset = optIn
    ? image
    : brief.trim()
      ? "data:image/svg+xml;charset=utf-8," + encodeURIComponent(svg)
      : "";

  return (
    <section className="space-y-5 rounded-xl border border-slate-800 bg-[#111827] p-5">
      <header className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-4">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-wider text-blue-400">
            Visual &amp; Brand Studio · {width}×{height}px
          </p>
          <h2 className="text-base font-semibold text-white">
            Brand-Locked Graphic &amp; Infographic Generator
          </h2>
        </div>
        {!!colors.length && (
          <div className="flex flex-wrap items-center gap-2" aria-label="Approved palette">
            {colors.map((c, i) => (
              <span
                key={i}
                className="inline-flex items-center gap-1.5 rounded-md border border-slate-800 bg-[#0B0F17] px-2 py-1 font-mono text-[11px] text-slate-300"
              >
                <i className="inline-block h-3 w-3 rounded-sm" style={{ background: c }} />
                {c}
              </span>
            ))}
          </div>
        )}
      </header>

      <div className="grid gap-5 lg:grid-cols-2">
        {/* Left Controls */}
        <div className="min-w-0 space-y-4">
          <label className="block space-y-1.5 text-xs font-medium text-slate-300">
            <span>Asset format</span>
            <select
              className="block w-full rounded-lg border border-slate-700 bg-[#0B0F17] px-3 py-2 text-sm text-slate-100"
              disabled={busy}
              value={kind}
              onChange={(e) => {
                setKind(e.target.value);
                setImage("");
              }}
            >
              <option value="Blog hero">Blog hero (1200×675)</option>
              <option value="Pin template">Pin template (1000×1500)</option>
              <option value="Process infographic">Process infographic (1200×1200)</option>
            </select>
          </label>

          <label className="block space-y-1.5 text-xs font-medium text-slate-300">
            <span>Headline or image brief</span>
            <input
              maxLength={180}
              placeholder="e.g., 2026 Technical SEO Audit Framework"
              className="block w-full rounded-lg border border-slate-700 bg-[#0B0F17] px-3 py-2.5 text-sm text-slate-100 placeholder:text-slate-500"
              value={brief}
              disabled={busy}
              onChange={(e) => {
                setBrief(e.target.value);
                setImage("");
              }}
            />
          </label>

          {kind === "Process infographic" && (
            <label className="block space-y-1.5 text-xs font-medium text-slate-300">
              <span>Steps (one per line, up to five)</span>
              <textarea
                rows={4}
                placeholder="1. Crawl live sitemap&#10;2. Map topic clusters&#10;3. Verify citations"
                className="block w-full rounded-lg border border-slate-700 bg-[#0B0F17] px-3 py-2.5 text-sm text-slate-100 placeholder:text-slate-500"
                value={steps}
                disabled={busy}
                onChange={(e) => {
                  setSteps(
                    e.target.value
                      .split("\n")
                      .slice(0, 5)
                      .map((s) => s.slice(0, 85))
                      .join("\n"),
                  );
                  setImage("");
                }}
              />
            </label>
          )}

          <label className="flex items-center gap-2 rounded-lg border border-slate-800 bg-[#0B0F17] px-3 py-2.5 text-xs text-slate-300">
            <input
              type="checkbox"
              checked={optIn}
              disabled={!available || busy}
              onChange={(e) => setOptIn(e.target.checked)}
            />
            <span>
              Use AI image generation{" "}
              <span className="text-slate-500">
                {available ? "(metered image allowance applies)" : "(provider not configured)"}
              </span>
            </span>
          </label>

          {optIn && (
            <button
              type="button"
              disabled={!brief.trim() || busy}
              onClick={() =>
                act({
                  optIn: true,
                  prompt: (
                    kind +
                    ": " +
                    brief +
                    (kind === "Process infographic" ? " " + items.join(". ") : "")
                  ).slice(0, 500),
                })
              }
              className="rounded-lg bg-[#2563EB] px-4 py-2 text-xs font-semibold text-white transition hover:bg-blue-500 disabled:opacity-50"
            >
              {busy ? "Generating…" : "Generate AI Image"}
            </button>
          )}

          <label className="block space-y-1.5 pt-2 text-xs font-medium text-slate-300">
            <span>Upload brand reference screenshot (PNG/JPEG/WebP, max 2 MiB)</span>
            <input
              type="file"
              accept="image/png,image/jpeg,image/webp"
              disabled={busy}
              className="block w-full rounded-lg border border-slate-800 bg-[#0B0F17] p-2 text-xs text-slate-400 file:mr-3 file:rounded-md file:border-0 file:bg-slate-800 file:px-3 file:py-1 file:text-xs file:font-semibold file:text-slate-200 hover:file:bg-slate-700"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (!file) return;
                if (file.size > 2097152) {
                  setStatus("Choose a reference up to 2 MiB.");
                  return;
                }
                const form = new FormData();
                form.set("reference", file);
                void act(form);
                e.target.value = "";
              }}
            />
          </label>
        </div>

        {/* Right Live Preview & Reference Gallery */}
        <div className="min-w-0 space-y-4">
          <div className="flex min-h-[240px] flex-col items-center justify-center rounded-xl border border-slate-800 bg-[#0B0F17] p-4">
            {asset ? (
              <div className="w-full space-y-3 text-center">
                <img
                  src={asset}
                  className="mx-auto max-h-64 rounded-lg border border-slate-800 object-contain"
                  alt={brief}
                />
                <a
                  className="inline-flex items-center rounded-lg bg-[#2563EB] px-3.5 py-1.5 text-xs font-semibold text-white hover:bg-blue-500"
                  download={kind.toLowerCase().replace(/\s+/g, "-") + (optIn ? ".jpg" : ".svg")}
                  href={asset}
                >
                  Download {optIn ? "JPG Image" : "Vector SVG"}
                </a>
              </div>
            ) : (
              <p className="text-center text-xs text-slate-500">
                Enter a headline or brief on the left to preview your brand-locked {kind.toLowerCase()}.
              </p>
            )}
          </div>

          {references.length > 0 && (
            <div className="space-y-2">
              <p className="text-xs font-semibold text-slate-300">
                Uploaded Brand References ({references.length})
              </p>
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                {references.map((r) => (
                  <a
                    key={r.url}
                    href={r.url}
                    target="_blank"
                    rel="noreferrer"
                    className="overflow-hidden rounded-lg border border-slate-800 bg-[#0B0F17] p-1 hover:border-blue-500/60"
                  >
                    <img
                      className="h-20 w-full object-contain"
                      alt={r.name}
                      src={r.url}
                    />
                  </a>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {(busy || status) && (
        <p className="text-xs text-slate-400" role="status">
          {busy ? "Working…" : status}
        </p>
      )}
    </section>
  );
}
