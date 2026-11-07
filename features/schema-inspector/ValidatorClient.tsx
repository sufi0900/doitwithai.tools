"use client";

import ToolRunOverlay, { paintToolFeedback } from "@/features/tool-ui/ToolRunOverlay";
import ToolUrlInput from "@/features/tool-ui/ToolUrlInput";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  Copy,
  Download,
  FileCode2,
  Globe2,
  Loader2,
  RotateCcw,
  Sparkles,
} from "lucide-react";
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

const INITIAL_SCHEMA: PageSnapshot["schemas"] = {
  samples: [EXAMPLE],
  valid: 1,
  invalid: 0,
  types: ["Article", "TechArticle", "Person", "BreadcrumbList"],
};

export default function ValidatorClient() {
  const [mode, setMode] = useState<"url" | "code">("url"),
    [url, setUrl] = useState(""),
    [code, setCode] = useState(EXAMPLE);
  const [original, setOriginal] = useState<PageSnapshot["schemas"] | null>(
      INITIAL_SCHEMA,
    ),
    [schema, setSchema] = useState<PageSnapshot["schemas"] | null>(
      INITIAL_SCHEMA,
    );
  const [scope, setScope] = useState(
      "Illustrative example with intentional review items",
    ),
    [partial, setPartial] = useState(false),
    [reportUrl, setReportUrl] = useState("https://example.com/guide"),
    [busy, setBusy] = useState(false),
    [error, setError] = useState(""),
    [notice, setNotice] = useState(
      "Interactive sample loaded. Expand the Article card below to inspect and fix the invalid calendar date (2026-02-30), or paste your own URL/JSON-LD above.",
    );
  const [edits, setEdits] = useState<Record<string, string>>({});
  const ref = useRef<AbortController | null>(null);

  useEffect(() => {
    const value = new URLSearchParams(window.location.search).get("url");
    if (value && /^https?:\/\//.test(value) && value.length < 2049) {
      setUrl(value);
    }
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
        await paintToolFeedback();
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
          example ? "https://example.com/guide" : "",
        );
        setNotice(
          example
            ? "Example contains an invalid calendar date (2026-02-30). Expand the Article card to inspect and fix it."
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

  function exportAllMarkup(format: "jsonld" | "html" | "copy") {
    if (!schema) return;
    const allBlocks = [
      ...schema.samples,
      ...(schema.invalidSamples || []).map((s) => s.raw),
    ].filter(Boolean);
    const jsonText = allBlocks.join("\n\n");
    const htmlText = allBlocks
      .map(
        (b) =>
          `<script type="application/ld+json">\n${b}\n</script>`,
      )
      .join("\n\n");
    if (format === "copy") {
      void navigator.clipboard.writeText(htmlText);
      setNotice("Copied all JSON-LD <script> blocks to clipboard.");
      return;
    }
    const content = format === "jsonld" ? jsonText : htmlText;
    const blob = new Blob([content], {
      type:
        format === "jsonld"
          ? "application/ld+json;charset=utf-8"
          : "text/html;charset=utf-8",
    });
    const href = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = href;
    a.download =
      format === "jsonld"
        ? "validated-structured-data.jsonld"
        : "validated-structured-data.html";
    a.click();
    setTimeout(() => URL.revokeObjectURL(href), 1000);
    setNotice(`Downloaded ${a.download}.`);
  }

  const editedCount = useMemo(() => Object.keys(edits).length, [edits]);

  return (
    <div id="structured-data-validator" className={styles.validator}>
      <ToolRunOverlay
        active={busy}
        title="Inspecting JSON-LD & structured data blocks"
        description="Validating schema.org types, required fields, and rich result eligibility."
      />
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
            <Sparkles size={14} />
            Load interactive sample
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
            void analyze();
          }}
        >
          <label className={styles.editorLabel}>
            Public page URL{" "}
            {mode === "code" ? "(optional for pasted HTML)" : ""}
            <ToolUrlInput
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
            <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
              <button
                className={styles.button}
                type="button"
                onClick={() => exportAllMarkup("copy")}
              >
                <Copy size={14} />
                Copy &lt;script&gt;
              </button>
              <button
                className={styles.button}
                type="button"
                onClick={() => exportAllMarkup("jsonld")}
              >
                <Download size={14} />
                .JSONLD
              </button>
              <button
                className={styles.button}
                type="button"
                onClick={() => exportAllMarkup("html")}
              >
                <Download size={14} />
                .HTML
              </button>
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
                Reset {editedCount} edit(s)
              </button>
            </div>
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
