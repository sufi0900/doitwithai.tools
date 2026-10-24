"use client";
import { useMemo } from "react";
import Link from "next/link";
import { ArrowUpRight, Download } from "lucide-react";
import type { PageSnapshot } from "../on-page-analyzer/types";
import { citationReview, readinessCsv, type ReviewState } from "./review";
import styles from "../content-evidence/evidence.module.css";
const labels: Record<ReviewState, string> = {
  restriction: "Restriction detected",
  review: "Editorial review",
  observed: "Evidence observed",
  unknown: "Not established",
};
const colors: Record<ReviewState, string> = {
  restriction:
    "border-rose-300 bg-rose-50 text-rose-800 dark:border-rose-800 dark:bg-rose-950 dark:text-rose-200",
  review:
    "border-amber-300 bg-amber-50 text-amber-900 dark:border-amber-800 dark:bg-amber-950 dark:text-amber-200",
  observed:
    "border-blue-200 bg-blue-50 text-blue-800 dark:border-blue-800 dark:bg-blue-950 dark:text-blue-200",
  unknown:
    "border-slate-300 bg-slate-100 text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300",
};
const tools: Record<string, string> = {
  "on-page-ai-seo-analyzer": "On-page AI SEO Analyzer",
  "robots-txt-generator": "Robots.txt Generator & AI Crawler Checker",
  "readability-checker": "Readability Checker",
  "content-evidence-review": "Content Evidence Review",
  "structured-data-validator": "Structured Data Validator",
  "heading-structure-analyzer": "Heading Structure Analyzer",
};
function download(body: string, format: "json" | "csv") {
  const url = URL.createObjectURL(
    new Blob([body], {
      type: format === "json" ? "application/json" : "text/csv;charset=utf-8",
    }),
  );
  const a = document.createElement("a");
  a.href = url;
  a.download = `citation-readiness-review.${format}`;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
export default function ReviewWorkspace({ page }: { page: PageSnapshot }) {
  const report = useMemo(() => citationReview(page), [page]);
  return (
    <section
      id="citation-action-plan"
      className={styles.workspace}
      aria-label="Citation readiness action plan"
    >
      <div className={styles.report}>
        <div className={styles.reportTop}>
          <div>
            <span className={styles.eyebrow}>
              Evidence, not a citation prediction
            </span>
            <h2>Your review action plan</h2>
            <p className={styles.small}>
              Observed evidence does not establish eligibility, factual
              accuracy, or citation likelihood. Unknown checks require further
              inspection.
            </p>
            <span className={styles.url}>
              {page.url || "Pasted content"} · {page.checkedAt}
            </span>
          </div>
          <div className={styles.actions}>
            <button
              type="button"
              className={styles.secondary}
              onClick={() => download(JSON.stringify(report, null, 2), "json")}
            >
              <Download size={16} aria-hidden="true" /> Export JSON
            </button>
            <button
              type="button"
              className={styles.secondary}
              onClick={() => download(readinessCsv(report), "csv")}
            >
              <Download size={16} aria-hidden="true" /> Export CSV
            </button>
          </div>
        </div>
        <div className={styles.stats}>
          {(Object.keys(labels) as ReviewState[]).map((state) => (
            <div key={state}>
              <strong>
                {report.rows.filter((r) => r.state === state).length}
              </strong>
              <span>{labels[state]}</span>
            </div>
          ))}
        </div>
        <details className={styles.scope} open={page.partial}>
          <summary>What this report can and cannot establish</summary>
          <p>
            {page.scope}; {page.blocks.length} retained blocks. {report.limits}
          </p>
          {page.warnings.map((w, i) => (
            <p key={i}>{w}</p>
          ))}
          <p>
            HTTP directives are unavailable for pasted content. Search Console
            indexing, destination content, performance, and actual AI citations
            are not checked.
          </p>
          <p>
            Exports include retained opening paragraphs and action items. They
            do not include results from other tools or publish changes.
          </p>
        </details>
        {page.partial && (
          <p className={styles.warning}>
            Partial extraction. Absence in this report does not establish
            absence on the full page.
          </p>
        )}
        <div className="mt-6 grid min-w-0 gap-4 md:grid-cols-2">
          {report.rows.map((row) => (
            <article
              key={row.id}
              className="min-w-0 rounded-xl border border-slate-200 p-5 dark:border-slate-700"
            >
              <span
                className={`inline-flex rounded-md border px-2 py-1 text-xs font-semibold ${colors[row.state]}`}
              >
                {labels[row.state]}
              </span>
              <h3 className="mt-3 text-lg font-bold">{row.label}</h3>
              <p className="mt-3 break-words text-sm leading-7">
                {row.evidence}
              </p>
              <p className={styles.small}>{row.action}</p>
              <Link
                className="mt-4 inline-flex items-center gap-2 text-sm font-bold text-[#4058d0] underline dark:text-blue-200"
                href={`/tools/${row.tool}`}
              >
                {tools[row.tool]}
                <ArrowUpRight size={14} aria-hidden="true" />
              </Link>
            </article>
          ))}
        </div>
        <div className={styles.nextStep}>
          <h3 className="font-bold">Continue with supporting evidence</h3>
          <p>
            <Link href="/tools/content-evidence-review">
              Content Evidence Review
            </Link>{" "}
            records claim-level evidence and editorial decisions.
          </p>
          <p>
            <Link href="/tools/external-link-source-review">
              External Link and Source Review
            </Link>{" "}
            inspects source placement, anchor wording, and link relationships.
          </p>
          <p>
            <Link href="/tools/keyword-density-checker#keyword-coverage">
              Keyword coverage and distribution
            </Link>{" "}
            compares supplied phrases with body text and optional page fields.
          </p>
        </div>
      </div>
    </section>
  );
}
