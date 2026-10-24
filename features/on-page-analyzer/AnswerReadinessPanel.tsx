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
import { crawlerReadiness } from "./crawlers";
import type { PageSnapshot, Section } from "./types";
import styles from "./analyzer.module.css";
export default function AnswerReadinessPanel({
  page,
  onEdit,
  onNavigate,
}: {
  page: PageSnapshot;
  onNavigate?: (section: Section) => void;
  onEdit?: (id: string, label: string) => void;
}) {
  const report = useMemo(() => answerReadiness(page), [page]);
  const crawlers = useMemo(() => crawlerReadiness(page), [page]);
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
            {s.label}
          </span>
          <span className={styles.muted}>{label}</span>
        </div>
        <h4>{s.heading?.text || page.title || "Opening passage"}</h4>
      </summary>
      {s.passage && (
        <blockquote className={styles.evidence}>{s.passage.text}</blockquote>
      )}
      <p className={styles.advice}>{s.reason}</p>
      {s.paragraphs.length > 1 && (
        <details className={styles.options}>
          <summary>
            Following paragraph context ({s.paragraphs.length - 1})
          </summary>
          {s.paragraphs.slice(1).map((b) => (
            <p key={b.id} className={styles.contextParagraph}>
              {b.text}
            </p>
          ))}
        </details>
      )}
      {s.passage && onEdit && (
        <button
          className={styles.quiet}
          type="button"
          onClick={() => onEdit(s.passage!.id, "Review the opening answer")}
        >
          <PencilLine size={14} />
          Improve this opening paragraph
        </button>
      )}
    </details>
  );
  return (
    <section
      className={styles.evidencePanel}
      aria-label="AI content readiness signals"
    >
      <span className={styles.eyebrow}>AI content readiness</span>
      <h3>Review clarity, evidence, and original contributions.</h3>
      <p>
        Inspect complete opening paragraphs, search crawler rules, original
        contributions, and attribution. Opening checks are editorial cues, not
        citation probabilities.
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
      <section
        className={styles.crawlerPanel}
        aria-label="Search crawler policy"
      >
        <h4>Can search crawlers access this URL path?</h4>
        <p className={styles.muted}>
          {onNavigate
            ? "Search crawler policy contributes to this audit category. "
            : "These rules describe search crawler policy for this path. "}
          Training preferences remain separate. Firewall access remains
          unverified.
        </p>
        <div className={styles.crawlerGrid}>
          {crawlers
            .filter((c) => c.scored)
            .map((c) => (
              <div key={c.token} data-access={c.status}>
                <strong>{c.token}</strong>
                <span>{c.purpose}</span>
                <b>
                  {c.status === "allowed"
                    ? "No robots block detected"
                    : c.status === "blocked"
                      ? "Blocked by robots.txt"
                      : "Not assessed"}
                </b>
                <small>{c.rule}</small>
                <p>{c.reason}</p>
              </div>
            ))}
        </div>
        <details className={styles.options}>
          <summary>Other AI product policies, not scored</summary>
          {crawlers
            .filter((c) => !c.scored)
            .map((c) => (
              <p key={c.token}>
                <strong>{c.token}:</strong> {c.status} · {c.purpose}. Separate
                from search crawler findings.
              </p>
            ))}
        </details>
        <p className={styles.muted}>
          Retrieved indexing directives:{" "}
          {page.robots.join("; ") ||
            "No directives detected in the supplied evidence"}
          . Inspect technical findings for indexing restrictions.
        </p>
        <Link className={styles.toolLink} href="/tools/robots-txt-generator">
          Open Robots.txt Generator & AI Crawler Checker{" "}
          <ArrowUpRight size={14} />
        </Link>
      </section>
      <div className={styles.quickFields}>
        <div>
          <h4>Original contributions</h4>
          <p>
            {
              page.blocks.filter((b) =>
                /\b(?:we tested|I tested|our (?:test|research|experiment|results)|in my experience|we measured)\b/i.test(
                  b.text,
                ),
              ).length
            }{" "}
            passages mention testing, research, or experience.
          </p>
          <p className={styles.muted}>
            Wording alone cannot verify firsthand experience. Review methods,
            examples, and supporting material.
          </p>
        </div>
        <div>
          <h4>Evidence and attribution</h4>
          <p>
            {report.claims.length} claim passages need editorial attention.{" "}
            {
              page.links.filter((l) => {
                try {
                  return new URL(l.href).origin !== new URL(page.url).origin;
                } catch {
                  return false;
                }
              }).length
            }{" "}
            external links were extracted.
          </p>
          <p className={styles.muted}>
            A source link does not establish that it supports a particular
            claim. Review individual claims in Content and readability.
          </p>
        </div>
      </div>
      {onNavigate && (
        <button
          type="button"
          className={styles.quiet}
          onClick={() => onNavigate("content")}
        >
          Open the claims and readability report <ArrowUpRight size={14} />
        </button>
      )}
      <h4 className={styles.openingsTitle}>
        Do opening paragraphs address their topic?
      </h4>
      <p className={styles.muted}>
        Read the full first paragraph, then expand following context. Not every
        heading needs a definition or immediate answer.
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
          {onNavigate && (
            <Link
              className={styles.toolLink}
              href="/tools/ai-citation-readiness-checker"
            >
              AI Citation Readiness Checker <ArrowUpRight size={14} />
            </Link>
          )}
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
