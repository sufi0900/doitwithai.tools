"use client";
import React, { useMemo, useRef, useState } from "react";
import Link from "next/link";
import {
  ArrowUpRight,
  Download,
  CheckCircle2,
  CircleHelp,
  TriangleAlert,
  XCircle,
} from "lucide-react";
import type { PageSpeedResult, Strategy } from "../core-web-vitals/types";
import type { PageSnapshot } from "../on-page-analyzer/types";
import { answerReadiness } from "../on-page-analyzer/readiness";
import {
  safeSourceUrl,
  evidenceCsv,
  type Review,
} from "../content-evidence/analyze";
import {
  citationReview,
  readinessCsv,
  type ReviewRow,
  type ReviewState,
} from "./review";
import {
  CATEGORIES,
  categoryRows,
  evidenceCoverage,
  workspaceReport,
  type Category,
} from "./workspace";
import ClaimsPanel from "./ClaimsPanel";
import PerformancePanel from "./PerformancePanel";
import SchemaPanel from "../schema-inspector/SchemaPanel";
import styles from "../content-evidence/evidence.module.css";
import dashboard from "./dashboard.module.css";
const state = {
  restriction: {
    label: "Restriction detected",
    icon: XCircle,
    tone: "restriction",
  },
  review: { label: "Review needed", icon: TriangleAlert, tone: "review" },
  observed: {
    label: "Evidence observed",
    icon: CheckCircle2,
    tone: "observed",
  },
  unknown: { label: "Not established", icon: CircleHelp, tone: "unknown" },
};
function Row({ row }: { row: ReviewRow }) {
  const Icon = state[row.state].icon;
  return (
    <article
      className={dashboard.finding}
      data-tone={row.optional && row.state === "observed" ? "info" : row.state}
    >
      <span className={dashboard.badge}>
        <Icon size={15} aria-hidden="true" />
        {row.optional && row.state === "observed"
          ? "Optional context"
          : state[row.state].label}
      </span>
      <h4>{row.label}</h4>
      <p>{row.evidence}</p>
      <p className={styles.small}>{row.action}</p>
      <details className="mt-3">
        <summary className="cursor-pointer text-sm font-semibold">
          Basis: {row.basis.label}
        </summary>
        <p className={styles.small}>{row.basis.explanation}</p>
        {row.basis.references.map((r) => (
          <a
            key={r.url}
            className="mt-2 block text-sm text-[#4058d0] underline dark:text-blue-200"
            href={r.url}
            rel="noopener noreferrer"
            target="_blank"
          >
            {r.name}
          </a>
        ))}
      </details>
    </article>
  );
}
function download(content: string, type: "json" | "csv", suffix = "review") {
  const href = URL.createObjectURL(
    new Blob([content], {
      type: type === "json" ? "application/json" : "text/csv;charset=utf-8",
    }),
  );
  const a = document.createElement("a");
  a.href = href;
  a.download = `citation-${suffix}.${type}`;
  a.click();
  setTimeout(() => URL.revokeObjectURL(href), 1000);
}
export default function Dashboard({
  page,
  reviews,
  onSave,
  onLocate,
  onOpenArticle,
}: {
  page: PageSnapshot;
  reviews: Record<string, Review>;
  onSave: (id: string, value: Review) => void;
  onLocate: (id: string) => void;
  onOpenArticle: () => void;
}) {
  const [category, setCategory] = useState<Category>("overview");
  const panel = useRef<HTMLDivElement>(null);
  const [performance, setPerformance] = useState<
    Partial<Record<Strategy, PageSpeedResult>>
  >({});
  const report = useMemo(() => citationReview(page), [page]),
    answers = useMemo(() => answerReadiness(page), [page]);
  const exported = useMemo(
      () => workspaceReport(page, reviews),
      [page, reviews],
    ),
    coverage = exported.coverage,
    progress = exported.manualProgress;
  const rows = categoryRows(report, category);
  function select(value: Category) {
    setCategory(value);
    requestAnimationFrame(() => {
      const node = panel.current;
      if (!node) return;
      node.focus({ preventScroll: true });
      node.scrollIntoView({
        block: "start",
        behavior: matchMedia("(prefers-reduced-motion: reduce)").matches
          ? "auto"
          : "smooth",
      });
    });
  }
  const contentFlags = [answers.opening, ...answers.sections].filter(
    (s) => s.status === "review",
  );
  return (
    <section
      aria-label="Citation readiness results dashboard"
      className={dashboard.dashboard}
    >
      <div className={dashboard.overview}>
        <div className={dashboard.ringWrap}>
          <div
            className={dashboard.ring}
            role="img"
            aria-label={`Audit evidence coverage ${coverage.percentage ?? 0} percent`}
            style={{
              background: `conic-gradient(#5271ff ${(coverage.percentage ?? 0) * 3.6}deg, var(--line) 0deg)`,
            }}
          >
            <div>
              <strong>{coverage.percentage ?? "?"}%</strong>
              <span>Audit coverage</span>
            </div>
          </div>
          <p>
            {coverage.available} of {coverage.total} non-optional checks have
            evidence.
          </p>
        </div>
        <div>
          <span className={styles.eyebrow}>Your citation readiness review</span>
          <h2>See the findings, then review flagged passages</h2>
          <p className={styles.small}>
            Coverage measures available evidence, not quality or citation
            probability. Unknown checks are never treated as passes. High
            coverage can include restrictions; it is not a pass score.
          </p>
          <div className={dashboard.counts}>
            {(Object.keys(state) as ReviewState[]).map((key) => {
              const Icon = state[key].icon;
              return (
                <div key={key} data-tone={key}>
                  <Icon size={17} aria-hidden="true" />
                  <strong>
                    {
                      report.rows.filter((r) => !r.optional && r.state === key)
                        .length
                    }
                  </strong>
                  <span>{state[key].label}</span>
                </div>
              );
            })}
          </div>
          <div className={`${styles.actions} mt-4`}>
            <button
              type="button"
              className={styles.primary}
              onClick={onOpenArticle}
            >
              Open article review <ArrowUpRight size={16} />
            </button>
            <button
              type="button"
              className={styles.secondary}
              onClick={() =>
                download(
                  JSON.stringify({ ...exported, performance }, null, 2),
                  "json",
                )
              }
            >
              <Download size={16} />
              Export JSON
            </button>
            <button
              type="button"
              className={styles.secondary}
              onClick={() => download(readinessCsv(report), "csv")}
            >
              Export checks CSV
            </button>
            <button
              type="button"
              className={styles.secondary}
              onClick={() =>
                download(
                  evidenceCsv(
                    { input: page, claims: report.claims, sourceCount: 0 },
                    exported.manualReviews,
                  ),
                  "csv",
                  "claim-decisions",
                )
              }
            >
              Export claim decisions
            </button>
          </div>
        </div>
      </div>
      <div className={dashboard.progress}>
        <strong>
          Manual claim review: {progress.reviewed} of {progress.total} passages
        </strong>
        <progress
          value={progress.reviewed}
          max={Math.max(1, progress.total)}
          aria-label="Manual claim review progress"
        />
        <p>
          Saved decisions update this progress only. A tick records your review;
          it does not verify a fact automatically.{" "}
          {progress.revise > 0 && (
            <>{progress.revise} passages remain marked for revision.</>
          )}
        </p>
      </div>
      {page.partial && (
        <p className={styles.warning}>
          Partial extraction. The report covers retained content only; absent
          evidence can exist elsewhere.
        </p>
      )}
      <nav className={dashboard.categories} aria-label="Review categories">
        {CATEGORIES.map((item) => {
          const values = categoryRows(report, item.id),
            summary = evidenceCoverage(values);
          return (
            <button
              type="button"
              key={item.id}
              onClick={() => select(item.id)}
              aria-pressed={category === item.id}
            >
              <strong>{item.name}</strong>
              <span>
                {item.id === "performance"
                  ? "Optional live test"
                  : item.id === "overview"
                    ? `${coverage.available}/${coverage.total} evidenced`
                    : `${summary.available}/${summary.total} evidenced`}
              </span>
            </button>
          );
        })}
      </nav>
      <div ref={panel} tabIndex={-1} className={dashboard.panel}>
        <h3 className="text-2xl font-bold">
          {CATEGORIES.find((c) => c.id === category)?.name}
        </h3>
        {category !== "performance" && (
          <p className={styles.small}>
            {category === "overview"
              ? "Start with restrictions and unresolved reviews. Article edits and manual decisions are not published."
              : `${evidenceCoverage(rows).available} of ${evidenceCoverage(rows).total} non-optional checks have evidence. Optional measurements do not change citation eligibility.`}
          </p>
        )}
        {category === "overview" && (
          <>
            <div className={dashboard.grid}>
              {report.rows
                .filter(
                  (r) =>
                    !r.optional &&
                    (r.state === "restriction" || r.state === "review"),
                )
                .slice(0, 6)
                .map((row) => (
                  <Row key={row.id} row={row} />
                ))}
            </div>
            {!report.rows.some(
              (r) => !r.optional && ["restriction", "review"].includes(r.state),
            ) && (
              <p className={styles.small}>
                No automated restriction or editorial cue was retained. Unknown
                evidence and factual accuracy still require review.
              </p>
            )}
            <div className={dashboard.grid}>
              <article className={dashboard.finding}>
                <h4>{contentFlags.length} opening paragraphs to review</h4>
                <p>
                  Review topic clarity and standalone context without forcing
                  every introduction into a fixed format.
                </p>
                <button
                  type="button"
                  className={styles.secondary}
                  onClick={() => select("content")}
                >
                  Review opening paragraphs
                </button>
              </article>
              <article className={dashboard.finding}>
                <h4>{report.claims.length} passages with claim cues</h4>
                <p>
                  Review extracted source candidates and record your evidence
                  decisions.
                </p>
                <button
                  type="button"
                  className={styles.secondary}
                  onClick={() => select("claims")}
                >
                  Review claims and authorship
                </button>
              </article>
            </div>
          </>
        )}
        {category === "access" && (
          <div className={dashboard.grid}>
            {rows.map((row) => (
              <Row key={row.id} row={row} />
            ))}
          </div>
        )}
        {category === "content" && (
          <>
            <div className={dashboard.grid}>
              {rows.map((row) => (
                <Row key={row.id} row={row} />
              ))}
            </div>
            <h4 className="mt-7 text-xl font-bold">
              Complete opening paragraphs
            </h4>
            <p className={styles.small}>
              These English cues support editorial judgment. They do not prove
              that a passage is complete, accurate, or likely to be cited.
            </p>
            {[answers.opening, ...answers.sections].map((opening, i) => (
              <article
                className={dashboard.finding}
                key={opening.heading?.id || "article-opening"}
                data-tone={
                  opening.status === "review"
                    ? "review"
                    : opening.status === "unknown"
                      ? "unknown"
                      : "observed"
                }
              >
                <h4>{i ? opening.heading?.text : "Article opening"}</h4>
                <span className={dashboard.badge}>{opening.label}</span>
                {opening.passage && (
                  <blockquote>{opening.passage.text}</blockquote>
                )}
                <p>{opening.reason}</p>
                <details>
                  <summary>Show detection details</summary>
                  <p>
                    Rule: {opening.signals.rule}. Framing phrase:{" "}
                    {opening.signals.framing || "none"}. Matched topic words:{" "}
                    {opening.signals.matchedTerms.join(", ") || "none"}.
                  </p>
                  <p>
                    Explanatory cue: {opening.signals.explanationCue || "none"}.
                    Retained words: {opening.signals.wordCount}, without a
                    length-based citation verdict.
                  </p>
                </details>
                {opening.passage && (
                  <button
                    type="button"
                    className={styles.secondary}
                    onClick={() => onLocate(opening.passage!.id)}
                  >
                    Review this passage in article
                  </button>
                )}
              </article>
            ))}
          </>
        )}
        <div hidden={category !== "claims"}>
          <h4 className="mt-5 text-xl font-bold">Authorship evidence</h4>
          {answers.authors.length ? (
            answers.authors.map((author, i) => (
              <div key={i} className={dashboard.finding}>
                <strong>{author.name || "Author reference"}</strong>
                {typeof author.url === "string" &&
                  (safeSourceUrl(author.url) ? (
                    <a
                      href={author.url}
                      rel="noopener noreferrer"
                      target="_blank"
                      className="block break-all underline"
                    >
                      {author.url}
                    </a>
                  ) : (
                    <p>{author.url}</p>
                  ))}
              </div>
            ))
          ) : (
            <p className={styles.small}>
              No author metadata was resolved. A visible byline may still exist.
              This does not establish missing expertise.
            </p>
          )}
          <p className={styles.small}>
            Modified metadata: {page.modified || "Not retained"}. Names and
            dates cannot establish reliability or first-hand experience.
          </p>
          <ClaimsPanel
            claims={report.claims}
            reviews={reviews}
            onSave={onSave}
            onLocate={onLocate}
          />
        </div>
        {category === "schema" && (
          <>
            <div className={dashboard.grid}>
              {rows.map((row) => (
                <Row key={row.id} row={row} />
              ))}
            </div>
            <p className={styles.small}>
              Markup and optional file presence do not provide a citation bonus.
              Validate markup against visible published content.
            </p>
            {page.contentEdited && (
              <p className={styles.warning}>
                This markup belongs to the original import. Editing article text
                does not rewrite its structured data.
              </p>
            )}
            <SchemaPanel
              schema={page.schemas}
              pageUrl={page.url}
              partial={page.partial}
            />
          </>
        )}
        <div hidden={category !== "performance"}>
          <PerformancePanel
            url={page.source === "url" ? page.url : ""}
            edited={Boolean(page.contentEdited)}
            onResult={(value) =>
              setPerformance((old) => ({ ...old, [value.strategy]: value }))
            }
          />
        </div>
      </div>
      <details className="mt-6 rounded-xl border border-slate-200 p-5 dark:border-slate-700">
        <summary className="cursor-pointer font-bold">
          Scope, warnings, and supporting tools
        </summary>
        <p className={styles.small}>
          {page.scope}. {report.limits}
        </p>
        {page.warnings.map((warning, i) => (
          <p key={i} className={styles.small}>
            {warning}
          </p>
        ))}
        <div className={`${styles.actions} mt-4`}>
          <Link
            href="/tools/content-evidence-review"
            className={styles.secondary}
          >
            Content Evidence Review
          </Link>
          <Link
            href="/tools/on-page-ai-seo-analyzer"
            className={styles.secondary}
          >
            On-page AI SEO Analyzer
          </Link>
          <Link href="#citation-methodology" className={styles.secondary}>
            Read the criteria
          </Link>
        </div>
      </details>
    </section>
  );
}
