"use client";
import { useEffect, useRef, useState, type FormEvent } from "react";
import Link from "next/link";
import { ArrowUpRight, Loader2 } from "lucide-react";
import type { EvidenceInput } from "../content-evidence/analyze";
import {
  EMPTY_DECISION,
  inspectLinks,
  linksCsv,
  relationshipAdvice,
  type Decision,
  type LinkRow,
} from "./analyze";
import styles from "../content-evidence/evidence.module.css";
const example =
  '<main><h1>Illustrative source review</h1><p>Read <a href="https://developers.google.com/search/docs/crawling-indexing/links-crawlable">Google’s link guidance</a> for anchor examples.</p><h2>Compare the context</h2><p>For a second reference, <a href="https://developers.google.com/search/docs/crawling-indexing/qualify-outbound-links" rel="nofollow,ugc">click here</a>.</p><p>This example placement needs a relationship decision: <a href="https://example.org/product">View the example product</a>.</p></main>';
function Row({
  row,
  saved,
  onSave,
}: {
  row: LinkRow;
  saved: Decision;
  onSave: (d: Decision) => void;
}) {
  const [draft, setDraft] = useState(saved),
    [notice, setNotice] = useState("");
  const prefix = row.id.replace(":", "-");
  const update = (change: Partial<Decision>) => {
    setDraft((d) => ({ ...d, ...change }));
    setNotice("Unsaved changes");
  };
  return (
    <article className={styles.claim}>
      <div className={styles.claimHeader}>
        <div>
          <span className={styles.eyebrow}>
            {row.classification} · {row.section}
          </span>
          <h3>{row.anchor || "No anchor text retained"}</h3>
        </div>
        <span className={styles.reviewBadge}>
          {saved.action === "pending"
            ? "Not reviewed"
            : `Your decision: ${saved.action}`}
        </span>
      </div>
      <a
        href={row.href}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex max-w-full items-center gap-2 break-all text-sm text-[#4058d0] underline dark:text-blue-200"
      >
        {row.href}
        <ArrowUpRight size={15} aria-hidden="true" />
      </a>
      <div className={styles.tags}>
        <span>{row.host}</span>
        <span>
          {row.rel.length
            ? `rel: ${row.rel.join(", ")}`
            : "No rel values declared"}
        </span>
        <span>
          {row.occurrences} occurrence{row.occurrences === 1 ? "" : "s"} on page
        </span>
      </div>
      {row.generic && (
        <p className={styles.warning}>
          Review the anchor wording. A clearer description may help readers
          understand the destination.
        </p>
      )}
      {row.context ? (
        <blockquote>
          {row.context.length > 1500 ? (
            <details>
              <summary>{row.context.slice(0, 300)}… Show full context</summary>
              {row.context}
            </details>
          ) : (
            row.context
          )}
        </blockquote>
      ) : (
        <p className={styles.small}>
          No passage association was retained. Open the page and inspect the
          link in context.
        </p>
      )}
      <p className={styles.small}>{relationshipAdvice(row, saved)}</p>
      <form
        className={styles.reviewForm}
        onSubmit={(e) => {
          e.preventDefault();
          onSave({ ...draft, note: draft.note.trim() });
          setNotice("Decision saved. Your live website is unchanged.");
        }}
      >
        <div className={styles.fieldGrid}>
          <label htmlFor={`${prefix}-purpose`}>
            Relationship, in your judgment
            <select
              id={`${prefix}-purpose`}
              value={draft.purpose}
              onChange={(e) =>
                update({ purpose: e.target.value as Decision["purpose"] })
              }
            >
              <option value="unknown">Not determined</option>
              <option value="editorial">Editorial reference</option>
              <option value="paid">Paid or sponsored placement</option>
              <option value="ugc">User-generated content</option>
            </select>
          </label>
          <label htmlFor={`${prefix}-action`}>
            Your next action
            <select
              id={`${prefix}-action`}
              value={draft.action}
              onChange={(e) =>
                update({ action: e.target.value as Decision["action"] })
              }
            >
              <option value="pending">Not reviewed</option>
              <option value="keep">Keep</option>
              <option value="update">Update</option>
              <option value="remove">Remove</option>
            </select>
          </label>
        </div>
        <label htmlFor={`${prefix}-note`}>
          Review note
          <textarea
            id={`${prefix}-note`}
            rows={3}
            maxLength={2000}
            value={draft.note}
            onChange={(e) => update({ note: e.target.value })}
            placeholder="Record source relevance, original evidence, date, or changes needed."
          />
        </label>
        <div className={styles.saveRow}>
          <button className={styles.secondary}>Save decision</button>
          <p role="status">{notice || "Only saved decisions are exported."}</p>
        </div>
      </form>
    </article>
  );
}
export default function Client() {
  const [mode, setMode] = useState<"url" | "html">("url"),
    [url, setUrl] = useState(""),
    [html, setHtml] = useState(""),
    [page, setPage] = useState<EvidenceInput | null>(null),
    [rows, setRows] = useState<LinkRow[]>([]),
    [decisions, setDecisions] = useState<Record<string, Decision>>({}),
    [busy, setBusy] = useState(false),
    [error, setError] = useState(""),
    [notice, setNotice] = useState(""),
    [filter, setFilter] = useState("all"),
    [visible, setVisible] = useState(20),
    [version, setVersion] = useState(0);
  const active = useRef<AbortController | null>(null),
    sequence = useRef(0);
  useEffect(
    () => () => {
      sequence.current++;
      active.current?.abort();
    },
    [],
  );
  async function run(event?: FormEvent, useExample = false) {
    event?.preventDefault();
    const token = ++sequence.current;
    active.current?.abort();
    const controller = new AbortController();
    active.current = controller;
    const timer = window.setTimeout(() => controller.abort(), 28000);
    setBusy(true);
    setError("");
    setNotice("");
    try {
      const response = await fetch("/api/ai-tools/on-page/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          url: useExample ? "https://example.com/article" : url.trim(),
          html: useExample ? example : mode === "html" ? html : "",
        }),
        signal: controller.signal,
      });
      const data = await response.json().catch(() => {
        throw new Error("The import did not finish. Try pasted HTML.");
      });
      if (!response.ok)
        throw new Error(
          data.error?.message || "Could not import the page. Try pasted HTML.",
        );
      if (
        !Array.isArray(data.result?.links) ||
        !Array.isArray(data.result?.blocks)
      )
        throw new Error("The import was incomplete. Try again or paste HTML.");
      if (token !== sequence.current) return;
      setPage(data.result);
      setRows(inspectLinks(data.result));
      setDecisions({});
      setFilter("all");
      setVisible(20);
      setVersion((v) => v + 1);
      setNotice(
        useExample
          ? "Illustrative example. Link relationships are left for your review."
          : "Report ready. Open destinations and review their relevance before saving decisions.",
      );
    } catch (e) {
      if (token === sequence.current)
        setError(
          controller.signal.aborted
            ? "Import timed out. Try pasted HTML or retry later."
            : e instanceof Error
              ? e.message
              : "Import failed. Your previous report is preserved.",
        );
    } finally {
      window.clearTimeout(timer);
      if (token === sequence.current) setBusy(false);
    }
  }
  function download(format: "csv" | "json") {
    if (!page) return;
    const body =
      format === "csv"
        ? "\uFEFF" + linksCsv(rows, decisions)
        : JSON.stringify(
            {
              source: page.url,
              checkedAt: page.checkedAt,
              scope: page.scope,
              partial: page.partial,
              warnings: page.warnings,
              destinationStatus: "Not fetched",
              limitations:
                "Links are not authority scores, confirmed citations, or factual verification. Decisions are supplied by the reviewer.",
              links: rows.map((row) => ({
                ...row,
                review: decisions[row.id] || EMPTY_DECISION,
              })),
            },
            null,
            2,
          );
    const href = URL.createObjectURL(
      new Blob([body], {
        type: format === "csv" ? "text/csv;charset=utf-8" : "application/json",
      }),
    );
    const a = document.createElement("a");
    a.href = href;
    a.download = `external-link-review.${format}`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    window.setTimeout(() => URL.revokeObjectURL(href), 1000);
    setNotice(
      "Report exported with saved decisions. Unsaved changes are not included.",
    );
  }
  const filtered = rows.filter(
    (row) =>
      filter === "all" ||
      (filter === "generic" && row.generic) ||
      (filter === "pending" &&
        (decisions[row.id]?.action || "pending") === "pending") ||
      (filter === "qualified" &&
        row.rel.some((value) =>
          ["nofollow", "sponsored", "ugc"].includes(value),
        )),
  );
  return (
    <div className={styles.workspace} id="external-link-workspace">
      <section className={styles.inputPanel}>
        <span className={styles.eyebrow}>REVIEW YOUR OUTBOUND REFERENCES</span>
        <h2>See each link in its source context</h2>
        <div className={styles.modes}>
          {(
            [
              ["url", "Page URL"],
              ["html", "Paste HTML"],
            ] as const
          ).map(([id, label]) => (
            <button
              key={id}
              type="button"
              disabled={busy}
              aria-pressed={mode === id}
              onClick={() => setMode(id)}
            >
              {label}
            </button>
          ))}
        </div>
        <form onSubmit={(e) => void run(e)}>
          <label htmlFor="external-page-url">
            {mode === "url"
              ? "Public article URL"
              : "Page URL, optional but needed to separate internal links"}
            <input
              id="external-page-url"
              type="url"
              required={mode === "url"}
              value={url}
              maxLength={2048}
              disabled={busy}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://yourwebsite.com/article"
            />
          </label>
          {mode === "html" && (
            <label htmlFor="external-page-html">
              Page HTML
              <textarea
                id="external-page-html"
                rows={9}
                required
                maxLength={750000}
                disabled={busy}
                value={html}
                onChange={(e) => setHtml(e.target.value)}
              />
              <small>{html.length.toLocaleString()} / 750,000 characters</small>
            </label>
          )}
          <div className={styles.actions}>
            <button className={styles.primary} disabled={busy}>
              {busy ? (
                <Loader2
                  className={styles.spinner}
                  size={17}
                  aria-hidden="true"
                />
              ) : null}
              {busy ? "Importing link context…" : "Import and review links"}
            </button>
            {busy ? (
              <button
                type="button"
                className={styles.secondary}
                onClick={() => {
                  sequence.current++;
                  active.current?.abort();
                  setBusy(false);
                  setNotice(
                    "Import canceled. Your previous report is preserved.",
                  );
                }}
              >
                Cancel
              </button>
            ) : (
              <button
                type="button"
                className={styles.secondary}
                onClick={() => void run(undefined, true)}
              >
                Try an example
              </button>
            )}
          </div>
        </form>
        <p className={styles.small}>
          Returned HTML is inspected. Script-loaded links may require pasted
          rendered HTML. Destinations are not fetched or checked for broken
          links.
        </p>
        <p className={styles.small}>
          Export before leaving. Reports and decisions clear when this page
          reloads.
        </p>
        {error && (
          <p role="alert" className={styles.error}>
            {error}
          </p>
        )}
        <p role="status" className={styles.notice}>
          {notice}
        </p>
      </section>
      {page && (
        <section
          className={styles.report}
          aria-label="External link report"
          aria-busy={busy}
        >
          <div className={styles.reportTop}>
            <div>
              <span className={styles.eyebrow}>YOUR SOURCE REVIEW DESK</span>
              <h2>{page.title || "External link report"}</h2>
              <p className={styles.url}>
                {page.url || "Pasted HTML, origin unknown"}
              </p>
            </div>
            <div className={styles.actions}>
              <button
                className={styles.secondary}
                onClick={() => download("csv")}
              >
                Export CSV
              </button>
              <button
                className={styles.secondary}
                onClick={() => download("json")}
              >
                Export JSON
              </button>
            </div>
          </div>
          {page.partial && (
            <p className={styles.warning}>
              Partial extraction. The report covers retained links, not the full
              page.
            </p>
          )}
          {page.warnings.map((warning, i) => (
            <p className={styles.warning} key={i}>
              {warning}
            </p>
          ))}
          {!page.url && (
            <p className={styles.warning}>
              No page origin was supplied. Listed links may be internal or
              external, and unresolved relative links may be absent.
            </p>
          )}
          <div className={styles.stats}>
            <div>
              <strong>{rows.length}</strong>
              <span>
                {page.url
                  ? "External link occurrences"
                  : "Unclassified link occurrences"}
              </span>
            </div>
            <div>
              <strong>{new Set(rows.map((row) => row.host)).size}</strong>
              <span>Distinct destination hosts</span>
            </div>
            <div>
              <strong>{rows.filter((row) => row.generic).length}</strong>
              <span>Anchors worth reviewing</span>
            </div>
            <div>
              <strong>
                {
                  rows.filter(
                    (row) =>
                      decisions[row.id]?.action &&
                      decisions[row.id].action !== "pending",
                  ).length
                }
              </strong>
              <span>Reviewed by you</span>
            </div>
          </div>
          <p className={styles.small}>
            Scope: {page.scope}. Repeated links stay separate because their
            anchor, attributes, and context can differ.
          </p>
          <label htmlFor="external-filter">
            Filter links
            <select
              id="external-filter"
              value={filter}
              onChange={(e) => {
                setFilter(e.target.value);
                setVisible(20);
              }}
            >
              <option value="all">All retained outbound links</option>
              <option value="generic">Anchors worth reviewing</option>
              <option value="pending">Not reviewed</option>
              <option value="qualified">
                Links with nofollow, sponsored, or ugc
              </option>
            </select>
          </label>
          <p className={styles.small} aria-live="polite">
            Showing {Math.min(visible, filtered.length)} of {filtered.length}{" "}
            matching links.
          </p>
          {filtered.slice(0, visible).map((row) => (
            <Row
              key={`${version}:${row.id}`}
              row={row}
              saved={decisions[row.id] || EMPTY_DECISION}
              onSave={(d) =>
                setDecisions((previous) => ({ ...previous, [row.id]: d }))
              }
            />
          ))}
          {filtered.length > visible && (
            <button
              className={styles.secondary}
              onClick={() => setVisible((n) => n + 20)}
            >
              Show 20 more links
            </button>
          )}
          {!filtered.length && (
            <div className={styles.empty}>
              <h3>
                {rows.length
                  ? "No links match this filter"
                  : "No outbound links were retained"}
              </h3>
              <p>
                External links are not required on every page. This result does
                not establish source quality or completeness.
              </p>
            </div>
          )}
          <div className={styles.nextStep}>
            <strong>Review claims alongside their sources</strong>
            <p>
              Use{" "}
              <Link href="/tools/content-evidence-review">
                Content Evidence Review
              </Link>{" "}
              for claim cues and evidence notes, or return to the{" "}
              <Link href="/tools/on-page-ai-seo-analyzer">
                On-page AI SEO Analyzer
              </Link>
              .
            </p>
          </div>
        </section>
      )}
    </div>
  );
}
