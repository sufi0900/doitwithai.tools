"use client";
import { useMemo } from "react";
import Link from "next/link";
import {
  ArrowUpRight,
  CheckCircle2,
  PencilLine,
  TriangleAlert,
  UserRound,
} from "lucide-react";
import { answerReadiness, type AnswerSection } from "./readiness";
import type { PageSnapshot } from "./types";
import styles from "./analyzer.module.css";
export default function AnswerReadinessPanel({
  page,
  onEdit,
}: {
  page: PageSnapshot;
  onEdit?: (id: string, label: string) => void;
}) {
  const report = useMemo(() => answerReadiness(page), [page]);
  const renderPassage = (s: AnswerSection, label: string) => (
    <details
      key={s.heading?.id || "opening"}
      className={styles.answerSection}
      open={label === "Article opening"}
    >
      <summary>
        <div className={styles.findingTop}>
          <span
            className={`${styles.badge} ${s.status === "review" ? styles.warning : s.status === "unknown" ? styles.unchecked : styles.info}`}
          >
            {s.status === "review" ? (
              <TriangleAlert size={12} />
            ) : (
              <CheckCircle2 size={12} />
            )}
            {s.status === "review"
              ? "Review placement"
              : s.status === "unknown"
                ? "Needs context"
                : "Passage detected"}
          </span>
          <span className={styles.muted}>{label}</span>
        </div>
        <h4>{s.heading?.text || page.title || "Opening passage"}</h4>
      </summary>
      {s.passage && (
        <blockquote className={styles.evidence}>
          {s.passage.text.slice(0, 900)}
          {s.passage.text.length > 900 ? "…" : ""}
        </blockquote>
      )}
      <p className={styles.advice}>{s.reason}</p>
      {s.passage && onEdit && (
        <button
          className={styles.quiet}
          type="button"
          onClick={() => onEdit(s.passage!.id, "Review the opening answer")}
        >
          <PencilLine size={14} />
          Improve this passage
        </button>
      )}
    </details>
  );
  return (
    <section
      className={styles.evidencePanel}
      aria-label="AI content readiness signals"
    >
      <span className={styles.eyebrow}>Reader clarity & answer placement</span>
      <h3>Make the useful answer easy to find.</h3>
      <p>
        Review how your opening and sections introduce their key points. A
        direct answer can help readers when it fits the topic.
      </p>
      <div className={styles.readinessStats}>
        <div>
          <strong>
            {report.sections.filter((s) => s.status === "review").length}
          </strong>
          <span>Section openings to review</span>
        </div>
        <div>
          <strong>{report.authors.length}</strong>
          <span>Authorship entries detected</span>
        </div>
        <div>
          <strong>{report.claims.length}</strong>
          <span>Passages with claim cues</span>
        </div>
      </div>
      <p className={styles.muted}>
        These are content review signals, not measured visibility or citation
        probabilities. There is no required answer length or fixed AI writing
        format.
      </p>
      <div className={styles.answerGrid}>
        {renderPassage(report.opening, "Article opening")}
        {report.sections.map((s) =>
          renderPassage(s, s.heading?.tag.toUpperCase() || "Section"),
        )}
      </div>
      {report.totalSectionHeadings > report.sections.length && (
        <p className={styles.muted}>
          Showing the first {report.sections.length} section openings out of{" "}
          {report.totalSectionHeadings} retained H2/H3 headings.
        </p>
      )}
      <div className={styles.authorPanel}>
        <h4>
          <UserRound size={17} />
          Authorship evidence
        </h4>
        {report.authors.length ? (
          report.authors.map((a, i) => (
            <div key={i}>
              <strong>{a.name || "Author reference"}</strong>
              {a.id && <small>{a.id}</small>}
              {typeof a.url === "string" && <small>{a.url}</small>}
            </div>
          ))
        ) : (
          <p>
            No author metadata or locally resolved author name was found. A
            visible byline may still exist on the page.
          </p>
        )}
        <p className={styles.muted}>
          Confirm that these details identify the actual author. Metadata does
          not prove expertise or authority.
        </p>
      </div>
      {report.claims.length > 0 && (
        <details className={styles.schemaBlock}>
          <summary>
            Claims and statistics worth checking ({report.claims.length})
          </summary>
          {report.claims.slice(0, 12).map((b) => (
            <div key={b.id} className={styles.claimPassage}>
              <blockquote>{b.text.slice(0, 800)}</blockquote>
              {onEdit && (
                <button
                  className={styles.quiet}
                  type="button"
                  onClick={() => onEdit(b.id, "Review claim wording")}
                >
                  Review wording
                </button>
              )}
            </div>
          ))}
          <p className={styles.muted}>
            These phrases are cues for editorial review. They do not establish
            that a statement is wrong or unsupported.
          </p>
        </details>
      )}
      <div className={styles.technicalOverview}>
        <h4>Discovery and technical access</h4>
        <p>
          Response:{" "}
          {page.status
            ? `HTTP ${page.status}`
            : "not checked for pasted content"}
          . Robots.txt: {page.resources.robots}. Review access restrictions
          before assuming search engines can discover the page.
        </p>
        <div className={styles.technicalLinks}>
          <Link className={styles.toolLink} href="/tools/robots-txt-generator">
            Detailed crawler checks <ArrowUpRight size={14} />
          </Link>
          <Link
            className={styles.toolLink}
            href="/tools/core-web-vitals-checker"
          >
            Performance report <ArrowUpRight size={14} />
          </Link>
          <Link
            className={styles.toolLink}
            href="/tools/structured-data-validator"
          >
            Structured data validation <ArrowUpRight size={14} />
          </Link>
        </div>
      </div>
    </section>
  );
}
