"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import { FileCode2, Globe2, Loader2, RotateCcw } from "lucide-react";
import SchemaPanel from "./SchemaPanel";
import type { PageSnapshot } from "@/features/on-page-analyzer/types";
import styles from "./schema.module.css";
const EXAMPLE = JSON.stringify(
  {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": ["Article", "TechArticle"],
        "@id": "https://example.com/guide#article",
        headline: "A practical guide to content planning",
        datePublished: "2026-02-30",
        author: { "@id": "https://example.com/#author" },
      },
      {
        "@type": "Person",
        "@id": "https://example.com/#author",
        name: "Example author",
        url: "https://example.com/about",
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          {
            "@type": "ListItem",
            position: 1,
            name: "Home",
            item: "https://example.com",
          },
          { "@type": "ListItem", position: 2, name: "Guide" },
        ],
      },
    ],
  },
  null,
  2,
);
export default function ValidatorClient() {
  const [mode, setMode] = useState<"url" | "code">("url"),
    [url, setUrl] = useState(""),
    [code, setCode] = useState("");
  const [original, setOriginal] = useState<PageSnapshot["schemas"] | null>(
      null,
    ),
    [schema, setSchema] = useState<PageSnapshot["schemas"] | null>(null);
  const [scope, setScope] = useState(""),
    [partial, setPartial] = useState(false),
    [reportUrl, setReportUrl] = useState(""),
    [busy, setBusy] = useState(false),
    [error, setError] = useState(""),
    [notice, setNotice] = useState("");
  const [edits, setEdits] = useState<Record<string, string>>({});
  const ref = useRef<AbortController | null>(null);
  useEffect(() => {
    const value = new URLSearchParams(window.location.search).get("url");
    if (value && /^https?:\/\//.test(value) && value.length < 2049)
      setUrl(value);
    return () => ref.current?.abort();
  }, []);
  function keep(
    next: PageSnapshot["schemas"],
    label: string,
    finalUrl = "",
    limited = false,
  ) {
    setOriginal(next);
    setSchema(next);
    setEdits({});
    setScope(label);
    setReportUrl(finalUrl);
    setPartial(limited);
  }
  async function analyze(example = false) {
    ref.current?.abort();
    const controller = new AbortController();
    ref.current = controller;
    setError("");
    setNotice("");
    setBusy(true);
    const raw = example ? EXAMPLE : code.trim();
    try {
      if (example || (mode === "code" && !/^</.test(raw))) {
        if (raw.length > 150000)
          throw new Error(
            "Paste JSON-LD up to 150,000 characters, or inspect a smaller source block.",
          );
        let value: PageSnapshot["schemas"];
        try {
          const parsed = JSON.parse(raw);
          if (!parsed || typeof parsed !== "object") throw new Error();
          value = { samples: [raw], valid: 1, invalid: 0, types: [] };
        } catch {
          value = {
            samples: [],
            valid: 0,
            invalid: 1,
            types: [],
            invalidSamples: [{ raw, block: 1 }],
          };
        }
        keep(
          value,
          example
            ? "Illustrative example with intentional review items"
            : "Pasted JSON-LD",
        );
        setNotice(
          example
            ? "Example contains an invalid calendar date. Expand the Article card to inspect it."
            : "JSON-LD inspected locally. Review each detected item below.",
        );
      } else {
        const res = await fetch("/api/ai-tools/on-page/analyze", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            url: url.trim(),
            html: mode === "code" ? raw : "",
          }),
          signal: controller.signal,
        });
        const data = await res.json();
        if (!res.ok)
          throw new Error(
            data.error?.message || "The page could not be imported.",
          );
        const p = data.result as PageSnapshot;
        keep(
          p.schemas,
          p.source === "url"
            ? "Returned HTML; JavaScript was not executed"
            : "Pasted HTML",
          p.url,
          p.partial,
        );
        setNotice(p.warnings.join(" "));
      }
    } catch (e) {
      if (!controller.signal.aborted)
        setError(
          e instanceof Error
            ? e.message
            : "Could not inspect this source. Your previous report is preserved.",
        );
    } finally {
      if (!controller.signal.aborted) setBusy(false);
    }
  }
  function apply(field: string, raw: string) {
    if (!original) return;
    const nextEdits = { ...edits, [field]: raw },
      next = {
        ...original,
        samples: [...original.samples],
        invalidSamples: (original.invalidSamples || []).map((s) => ({ ...s })),
      };
    let corrected = 0;
    for (const [key, text] of Object.entries(nextEdits)) {
      if (key.startsWith("schema:"))
        next.samples[Number(key.split(":")[1])] = text;
      else if (next.invalidSamples[Number(key.split(":")[1])]) {
        next.invalidSamples[Number(key.split(":")[1])].raw = text;
        try {
          JSON.parse(text);
          corrected++;
        } catch {}
      }
    }
    next.valid = original.valid + corrected;
    next.invalid = Math.max(0, original.invalid - corrected);
    setEdits(nextEdits);
    setSchema(next);
    setNotice(
      "Source correction applied to this draft. Export reviewed markup and publish it through your website editor.",
    );
  }
  const editedCount = useMemo(() => Object.keys(edits).length, [edits]);
  return (
    <div id="structured-data-validator" className={styles.validator}>
      <section className={styles.inputPanel}>
        <div className={styles.header}>
          <div>
            <span className={styles.eyebrow}>Inspect, understand, correct</span>
            <h2>Validate your page’s structured data</h2>
          </div>
          <button
            className={styles.button}
            type="button"
            disabled={busy}
            onClick={() => analyze(true)}
          >
            Try example
          </button>
        </div>
        <div className={styles.inputTabs}>
          <button
            type="button"
            aria-pressed={mode === "url"}
            onClick={() => setMode("url")}
          >
            <Globe2 size={15} />
            Page URL
          </button>
          <button
            type="button"
            aria-pressed={mode === "code"}
            onClick={() => setMode("code")}
          >
            <FileCode2 size={15} />
            JSON-LD or HTML
          </button>
        </div>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            analyze();
          }}
        >
          <label className={styles.editorLabel}>
            Public page URL{" "}
            {mode === "code" ? "(optional for pasted HTML)" : ""}
            <input
              type="url"
              value={url}
              maxLength={2048}
              required={mode === "url"}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://your-website.com/article"
            />
          </label>
          {mode === "code" && (
            <label className={styles.editorLabel}>
              JSON-LD, page HTML, or rendered HTML
              <textarea
                value={code}
                rows={8}
                maxLength={750000}
                onChange={(e) => setCode(e.target.value)}
                required
                placeholder='{"@context":"https://schema.org","@type":"Article",...}'
              />
            </label>
          )}
          <button className={styles.primary} type="submit" disabled={busy}>
            {busy && <Loader2 size={16} className={styles.spin} />}
            {busy ? "Inspecting structured data…" : "Inspect structured data"}
          </button>
        </form>
        <p className={styles.note}>
          For dynamically inserted markup, open browser Inspect, copy the
          rendered page HTML, and use JSON-LD or HTML mode. Scripts are never
          executed.
        </p>
        {error && (
          <p className={styles.alert} role="alert">
            {error}
          </p>
        )}
      </section>
      {schema && (
        <>
          <div className={styles.reportBar}>
            <div>
              <strong>{scope}</strong>
              <p>{reportUrl || "Supplied source"}</p>
            </div>
            <button
              className={styles.button}
              type="button"
              disabled={!editedCount}
              onClick={() => {
                setSchema(original);
                setEdits({});
                setNotice("Original imported markup restored.");
              }}
            >
              <RotateCcw size={14} />
              Reset {editedCount} source edit(s)
            </button>
          </div>
          {notice && (
            <p className={styles.alert} role="status">
              {notice}
            </p>
          )}
          <SchemaPanel
            schema={schema}
            pageUrl={reportUrl}
            partial={partial}
            onApply={apply}
          />
        </>
      )}
    </div>
  );
}
