"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import {
  ArrowUpRight,
  CheckCircle2,
  ChevronDown,
  Code2,
  Download,
  PencilLine,
  TriangleAlert,
  X,
} from "lucide-react";
import {
  inspectSchemas,
  RULES_DATE,
  schemaSources,
  type SchemaSource,
} from "./inspect";
import type { PageSnapshot } from "@/features/on-page-analyzer/types";
import styles from "./schema.module.css";
export default function SchemaPanel({
  schema,
  pageUrl = "",
  partial = false,
  onApply,
}: {
  schema: PageSnapshot["schemas"];
  pageUrl?: string;
  partial?: boolean;
  onApply?: (field: string, raw: string) => void;
}) {
  const sources = useMemo(() => schemaSources(schema), [schema]);
  const report = useMemo(() => inspectSchemas(sources), [sources]);
  const [filter, setFilter] = useState("all"),
    [editing, setEditing] = useState<SchemaSource | null>(null),
    [text, setText] = useState(""),
    [editError, setEditError] = useState("");
  const [view, setView] = useState("all");
  const dialogRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!editing) return;
    const opener = document.activeElement as HTMLElement,
      previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    dialogRef.current?.querySelector("textarea")?.focus();
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setEditing(null);
      if (event.key === "Tab") {
        const nodes = Array.from(
            dialogRef.current?.querySelectorAll<HTMLElement>(
              "button:not([disabled]),textarea,a[href]",
            ) || [],
          ),
          first = nodes[0],
          last = nodes[nodes.length - 1];
        if (event.shiftKey && document.activeElement === first) {
          event.preventDefault();
          last?.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault();
          first?.focus();
        }
      }
    };
    document.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = previous;
      document.removeEventListener("keydown", onKey);
      opener?.focus();
    };
  }, [editing]);
  const visible = report.items.filter(
    (i) =>
      (filter === "all" || i.types.includes(filter)) &&
      (view !== "top" || !i.nested),
  );
  const hasMissingSources = schema.valid + schema.invalid > sources.length;
  function edit(source: SchemaSource) {
    setEditing(source);
    setText(source.raw);
    setEditError("");
  }
  const live = useMemo(
    () => (editing ? inspectSchemas([{ ...editing, raw: text }]) : null),
    [editing, text],
  );
  function apply() {
    if (!editing || !onApply) return;
    try {
      const v = JSON.parse(text);
      if (!v || typeof v !== "object") throw new Error();
    } catch {
      setEditError(
        "Enter a valid JSON object or array before applying this draft.",
      );
      return;
    }
    onApply(editing.field, text);
    setEditing(null);
    setFilter("all");
  }
  function exportMarkup() {
    const content = sources
      .map(
        (s) =>
          `<!-- ${s.label} -->\n<script type="application/ld+json">\n${s.raw.replace(/</g, "\\u003c")}\n</script>`,
      )
      .join("\n\n");
    const u = URL.createObjectURL(
      new Blob([content], { type: "text/plain;charset=utf-8" }),
    );
    const a = document.createElement("a");
    a.href = u;
    a.download = "structured-data-draft.txt";
    a.click();
    setTimeout(() => URL.revokeObjectURL(u), 1000);
  }
  return (
    <section className={styles.panel} aria-label="Structured data inspection">
      <header className={styles.header}>
        <div>
          <span className={styles.eyebrow}>Your page’s structured data</span>
          <h3>See every retained schema item.</h3>
          <p>
            Script blocks contain entities. A single graph can describe several
            items, each shown separately below.
          </p>
        </div>
        <button
          type="button"
          onClick={exportMarkup}
          disabled={!sources.length}
          className={styles.button}
        >
          <Download size={15} />
          Export source
        </button>
      </header>
      <div className={styles.stats}>
        <div>
          <strong>{sources.length}</strong>
          <span>Retained markup sources</span>
        </div>
        <div>
          <strong>{report.items.length}</strong>
          <span>Typed entities inspected</span>
        </div>
        <div>
          <strong>{report.types.length}</strong>
          <span>Distinct types</span>
        </div>
        <div className={report.errors ? styles.badStat : ""}>
          <strong>{report.errors}</strong>
          <span>Inspection errors</span>
        </div>
        <div className={report.warnings ? styles.warnStat : ""}>
          <strong>{report.warnings}</strong>
          <span>Review suggestions</span>
        </div>
      </div>
      {schema.markupWarnings?.map((w) => (
        <p key={w} className={styles.alert}>
          {w}
        </p>
      ))}
      <p className={styles.scope}>
        Checks include JSON syntax, typed entities, selected property formats,
        local references, and documented field profiles. They do not certify
        Google eligibility.
      </p>
      {(partial || report.limited || hasMissingSources) && (
        <p className={styles.alert}>
          <TriangleAlert size={16} />
          Coverage is limited. Some markup was not retained or inspected. Counts
          describe the inspected sample.
        </p>
      )}
      <div className={styles.controls}>
        <label>
          Schema type
          <select value={filter} onChange={(e) => setFilter(e.target.value)}>
            <option value="all">All detected types</option>
            {report.types.map((t) => (
              <option key={t}>{t}</option>
            ))}
          </select>
        </label>
        <label>
          Entities
          <select value={view} onChange={(e) => setView(e.target.value)}>
            <option value="all">All, including nested items</option>
            <option value="top">Top-level items only</option>
          </select>
        </label>
      </div>
      {report.syntax.map((s, i) => (
        <article className={styles.syntaxError} key={`${s.source.field}:${i}`}>
          <div>
            <Code2 size={18} />
            <strong>{s.source.label}: source needs attention</strong>
          </div>
          <p>{s.error}</p>
          {onApply && (
            <button
              className={styles.button}
              type="button"
              onClick={() => edit(s.source)}
            >
              <PencilLine size={14} />
              Correct source
            </button>
          )}
        </article>
      ))}
      <div className={styles.cards}>
        {visible.map((item) => {
          const errors = item.issues.filter((i) => i.severity === "error"),
            warnings = item.issues.filter((i) => i.severity === "warning");
          return (
            <details className={styles.card} key={item.key}>
              <summary>
                <span
                  className={`${styles.typeIcon} ${errors.length ? styles.badIcon : warnings.length ? styles.warnIcon : item.covered ? styles.goodIcon : ""}`}
                >
                  {errors.length || warnings.length ? (
                    <TriangleAlert size={19} />
                  ) : (
                    <CheckCircle2 size={19} />
                  )}
                </span>
                <span className={styles.itemName}>
                  <strong>{item.types.join(" / ")}</strong>
                  <small>
                    {item.name ||
                      item.id ||
                      (item.nested ? "Nested entity" : "Unnamed entity")}
                  </small>
                </span>
                <span className={styles.counts}>
                  <b className={errors.length ? styles.red : ""}>
                    {errors.length} errors
                  </b>
                  <b className={warnings.length ? styles.amber : ""}>
                    {warnings.length} reviews
                  </b>
                </span>
                <ChevronDown size={17} className={styles.chevron} />
              </summary>
              <div className={styles.cardBody}>
                <div className={styles.itemMeta}>
                  <span>{item.nested ? "Nested item" : "Top-level item"}</span>
                  <span>{item.source.label}</span>
                  <span>
                    {item.covered
                      ? "Supported field profile"
                      : "Basic checks only"}
                  </span>
                </div>
                {item.id && <p className={styles.identifier}>{item.id}</p>}
                <p className={styles.note}>
                  {!errors.length && !warnings.length
                    ? "No issues found in this item’s completed local checks. Unchecked rules may still apply."
                    : "Review each finding in context. A recommendation is not automatically a required property."}
                </p>
                {item.issues.map((issue, i) => (
                  <div
                    className={`${styles.issue} ${styles[issue.severity]}`}
                    key={i}
                  >
                    <b>
                      {issue.severity === "error"
                        ? "Error"
                        : issue.severity === "warning"
                          ? "Review"
                          : "Note"}
                    </b>
                    <code>{issue.path}</code>
                    <p>{issue.message}</p>
                  </div>
                ))}
                <div className={styles.propertyTable}>
                  <table>
                    <thead>
                      <tr>
                        <th>Property</th>
                        <th>Detected value</th>
                      </tr>
                    </thead>
                    <tbody>
                      {item.properties.map(([key, value]) => (
                        <tr key={key}>
                          <th scope="row">{key}</th>
                          <td>
                            {typeof value === "string" ||
                            typeof value === "number" ||
                            typeof value === "boolean"
                              ? String(value)
                              : JSON.stringify(value).slice(0, 1800)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                {onApply && (
                  <button
                    className={styles.button}
                    type="button"
                    onClick={() => edit(item.source)}
                  >
                    <PencilLine size={14} />
                    Edit this source block
                  </button>
                )}
              </div>
            </details>
          );
        })}
      </div>
      {!visible.length && (
        <div className={styles.empty}>
          <Code2 size={28} />
          <h4>
            {report.items.length
              ? "No items match these filters."
              : "No typed entities could be inspected."}
          </h4>
          <p>
            No markup found in returned HTML is not proof that the rendered page
            has none. Some websites insert markup after JavaScript runs. Paste
            the rendered page HTML or JSON-LD into the dedicated validator to
            inspect it.
          </p>
          <Link
            className={styles.button}
            href="/tools/structured-data-validator"
          >
            Open Structured Data Validator <ArrowUpRight size={14} />
          </Link>
        </div>
      )}
      <details className={styles.method}>
        <summary>
          What this validation covers <ChevronDown size={14} />
        </summary>
        <p>
          Profiles were reviewed on {RULES_DATE}. Article fields are
          recommendations, not mandatory Google properties.
        </p>
        <p>
          Unknown types remain visible with basic checks. Custom contexts,
          remote references, and full vocabulary conformance are not validated.
          Basic embedded Microdata and Schema.org RDFa are normalized for
          inspection.
        </p>
        <p>
          Visible-content accuracy, Google feature policies, and actual
          rich-result eligibility require further review. No source code is
          executed.
        </p>
        <div className={styles.links}>
          <a
            href={
              pageUrl
                ? `https://search.google.com/test/rich-results?url=${encodeURIComponent(pageUrl)}`
                : "https://search.google.com/test/rich-results"
            }
            target="_blank"
            rel="noreferrer"
          >
            Google Rich Results Test <ArrowUpRight size={13} />
          </a>
          <a
            href={
              pageUrl
                ? `https://validator.schema.org/#url=${encodeURIComponent(pageUrl)}`
                : "https://validator.schema.org/"
            }
            target="_blank"
            rel="noreferrer"
          >
            Schema.org Validator <ArrowUpRight size={13} />
          </a>
        </div>
      </details>
      <Link
        href={
          pageUrl
            ? `/tools/structured-data-validator?url=${encodeURIComponent(pageUrl)}`
            : "/tools/structured-data-validator"
        }
        className={styles.fullTool}
      >
        Open the dedicated Structured Data Validator <ArrowUpRight size={15} />
      </Link>
      {editing && (
        <div
          className={styles.editorOverlay}
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) setEditing(null);
          }}
        >
          <div
            ref={dialogRef}
            className={styles.sourceEditor}
            role="dialog"
            aria-modal="true"
            aria-labelledby="schema-source-heading"
          >
            <div className={styles.header}>
              <div>
                <span className={styles.eyebrow}>
                  Review source corrections
                </span>
                <h4 id="schema-source-heading">{editing.label}</h4>
              </div>
              <button
                className={styles.button}
                type="button"
                onClick={() => setEditing(null)}
                aria-label="Close source editor"
              >
                <X size={16} />
              </button>
            </div>
            <label className={styles.editorLabel}>
              JSON-LD draft
              <textarea
                value={text}
                onChange={(e) => {
                  setText(e.target.value);
                  setEditError("");
                }}
                rows={12}
                maxLength={150000}
                spellCheck={false}
              />
            </label>
            <p role="status" className={styles.note}>
              {live?.syntax.length
                ? "JSON needs correction."
                : `${live?.items.length || 0} typed item(s). JSON parsed; review field findings after applying.`}
            </p>
            {live?.syntax.map((e, i) => (
              <p className={styles.alert} key={i}>
                {e.error}
              </p>
            ))}
            {editError && (
              <p role="alert" className={styles.alert}>
                {editError}
              </p>
            )}
            <div className={styles.editorFooter}>
              <span>
                Updates the working draft. Your website stays under your
                control.
              </span>
              <button
                className={styles.primary}
                type="button"
                onClick={apply}
                disabled={Boolean(live?.syntax.length)}
              >
                Apply source correction
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
