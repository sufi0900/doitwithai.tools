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
  const foreground = colors[1] || "#599dff";
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
    (colors[0] || "#152238") +
    '"/><rect x="5%" y="8%" width="90%" height="84%" rx="24" fill="#101828"/><rect x="9%" y="13%" width="14%" height="12" fill="' +
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
    <section className="space-y-4 rounded-xl border border-slate-700 p-5">
      <label>
        Asset format{" "}
        <select
          className="rounded bg-slate-800 p-2"
          disabled={busy}
          value={kind}
          onChange={(e) => {
            setKind(e.target.value);
            setImage("");
          }}
        >
          <option>Blog hero</option>
          <option>Pin template</option>
          <option>Process infographic</option>
        </select>
      </label>
      {!!colors.length && (
        <div className="flex flex-wrap gap-3" aria-label="Approved palette">
          {colors.map((c, i) => (
            <span key={i}>
              <i
                className="mr-1 inline-block h-3 w-3 rounded"
                style={{ background: c }}
              />
              {c}
            </span>
          ))}
        </div>
      )}
      <label className="block">
        Headline or image brief
        <input
          maxLength={180}
          className="block w-full rounded bg-slate-800 p-3"
          value={brief}
          disabled={busy}
          onChange={(e) => {
            setBrief(e.target.value);
            setImage("");
          }}
        />
      </label>
      {kind === "Process infographic" && (
        <label className="block">
          Steps (one per line, up to five)
          <textarea
            className="block w-full rounded bg-slate-800 p-3"
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
      <label className="block">
        <input
          type="checkbox"
          checked={optIn}
          disabled={!available || busy}
          onChange={(e) => setOptIn(e.target.checked)}
        />{" "}
        Use AI image generation{" "}
        {available ? "(provider usage applies)" : "(provider unavailable)"}
      </label>
      {optIn && (
        <button
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
        >
          Generate image
        </button>
      )}
      {asset && (
        <div>
          <img src={asset} className="mb-2 max-h-64 rounded" alt={brief} />
          <a
            className="underline"
            download={kind + (optIn ? ".jpg" : ".svg")}
            href={asset}
          >
            Download {optIn ? "image" : "SVG"}
          </a>
        </div>
      )}
      <label className="block">
        Reference screenshots
        <input
          type="file"
          accept="image/png,image/jpeg,image/webp"
          disabled={busy}
          className="block"
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
      <div className="flex flex-wrap gap-3">
        {references.map((r) => (
          <a key={r.url} href={r.url} target="_blank" rel="noreferrer">
            <img
              className="h-20 max-w-40 object-contain"
              alt={r.name}
              src={r.url}
            />
          </a>
        ))}
      </div>
      <p role="status">{busy ? "Working…" : status}</p>
    </section>
  );
}
