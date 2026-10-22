"use client";
import {
  createContext,
  useContext,
  useMemo,
  useState,
  type ReactNode,
  type Dispatch,
  type SetStateAction,
} from "react";
import Link from "next/link";
import { ArrowUpRight, ChevronRight } from "lucide-react";
import { categoryScores } from "./scoring";
import {
  claimPassages,
  keywordReport,
  linkReport,
  readabilityReport,
} from "./metrics";
import type { Finding, PageSnapshot, Section } from "./types";
import styles from "./analyzer.module.css";
const band = (score: number | null) =>
  score === null
    ? "unknown"
    : score < 50
      ? "poor"
      : score < 80
        ? "review"
        : "good";
export function CategoryReport({
  findings,
  onSelect,
  active,
}: {
  active: Section;
  findings: Finding[];
  onSelect: (s: Section) => void;
}) {
  return (
    <section
      className={styles.categoryGrid}
      aria-label="Category scores and contributions"
    >
      {categoryScores(findings).map((c) => (
        <button
          type="button"
          className={styles.categoryCard}
          key={c.id}
          onClick={() => onSelect(c.id)}
          aria-pressed={active === c.id}
          aria-controls="audit-category-content"
          data-band={c.critical ? "poor" : band(c.score)}
        >
          <span className={styles.categoryTitle}>
            {c.label}
            <ChevronRight size={16} />
          </span>
          <strong>
            {c.score ?? "Not assessed"}
            {c.score !== null && <small>/100</small>}
          </strong>
          <progress
            max={100}
            value={c.score ?? 0}
            aria-label={`${c.label} score`}
          />
          <span>
            {c.contribution.toFixed(1)} / {c.weight} audit points earned
          </span>
          <small>
            {c.coverage}% check coverage{c.coverage < 90 ? " · Partial" : ""}
            {c.critical ? ` · ${c.critical} critical` : ""}
          </small>
        </button>
      ))}
    </section>
  );
}
export function SectionScore({
  category,
  findings,
}: {
  category: ReturnType<typeof categoryScores>[number];
  findings: Finding[];
}) {
  const warnings = findings.filter((f) => f.status === "warning").length;
  const passed = findings.filter((f) => f.status === "passed").length;
  return (
    <header
      className={styles.sectionScore}
      data-band={category.critical ? "poor" : band(category.score)}
    >
      <div>
        <span className={styles.eyebrow}>Category overview</span>
        <h3>{category.label}</h3>
        <p>
          {category.contribution.toFixed(1)} of {category.weight} possible audit
          points earned · {category.coverage}% check coverage
        </p>
        <p className={styles.muted}>
          {passed} passed · {warnings} warnings · {category.critical} critical
          findings
        </p>
      </div>
      <div className={styles.sectionScoreNumber}>
        <strong>{category.score ?? "Not assessed"}</strong>
        {category.score !== null && <span>/ 100</span>}
        <small>
          {category.coverage < 90 ? "Partial measurement" : "Measured checks"}
        </small>
      </div>
    </header>
  );
}
export function SocialPreview({ page }: { page: PageSnapshot }) {
  const [platform, setPlatform] = useState("LinkedIn");
  const [failed, setFailed] = useState("");
  const isX = platform === "X";
  const image = isX ? page.twitterImage || page.ogImage : page.ogImage;
  const title = isX
    ? page.twitterTitle || page.ogTitle || page.title
    : page.ogTitle || page.title;
  const description = isX
    ? page.twitterDescription || page.ogDescription || page.description
    : page.ogDescription || page.description;
  let host = "Your website";
  try {
    host = new URL(page.url).hostname;
  } catch {}
  return (
    <section className={styles.previewCard} aria-label="Social sharing preview">
      <div className={styles.panelTitle}>
        <h3>Social sharing preview</h3>
        <div className={styles.segment}>
          {["LinkedIn", "Facebook", "X"].map((p) => (
            <button
              key={p}
              type="button"
              aria-pressed={p === platform}
              onClick={() => setPlatform(p)}
            >
              {p}
            </button>
          ))}
        </div>
      </div>
      <div
        className={styles.socialPreview}
        data-platform={platform}
        data-card={isX ? page.twitterCard : "large"}
      >
        {image && failed !== image ? (
          <img
            key={image}
            src={image}
            alt="Page sharing preview"
            loading="lazy"
            referrerPolicy="no-referrer"
            onError={() => setFailed(image)}
          />
        ) : (
          <div className={styles.socialPlaceholder}>
            {image
              ? "The sharing image could not be displayed."
              : "No sharing image was detected."}
          </div>
        )}
        <div>
          <small>{host}</small>
          <h4>{title || "No sharing title detected"}</h4>
          <p>{description || "No sharing description detected"}</p>
        </div>
      </div>
      <p className={styles.muted}>
        {isX && !page.twitterTitle
          ? "Using available Open Graph or page fields as a fallback. "
          : ""}
        Illustrative {platform} preview. Platforms may cache metadata or display
        different crops.
      </p>
      {image && (
        <a
          className={styles.toolLink}
          href={image}
          target="_blank"
          rel="noreferrer"
        >
          View source image <ArrowUpRight size={14} />
        </a>
      )}
      <Link
        className={styles.toolLink}
        href="/tools/og-twitter-preview-generator"
      >
        Open Open Graph & Twitter Card Preview <ArrowUpRight size={14} />
      </Link>
    </section>
  );
}
type ReviewState = {
  reviewed: Record<string, boolean>;
  setReviewed: Dispatch<SetStateAction<Record<string, boolean>>>;
};
const ReviewContext = createContext<ReviewState | null>(null);
export function EvidenceReviewScope({ children }: { children: ReactNode }) {
  const [reviewed, setReviewed] = useState<Record<string, boolean>>({});
  const value = useMemo(() => ({ reviewed, setReviewed }), [reviewed]);
  return (
    <ReviewContext.Provider value={value}>{children}</ReviewContext.Provider>
  );
}
export function EvidenceReview({ page }: { page: PageSnapshot }) {
  const claims = useMemo(() => claimPassages(page), [page]);
  const shared = useContext(ReviewContext);
  const reviewed = shared?.reviewed || {};
  const setReviewed = shared?.setReviewed;
  const key = (id: string, text: string) => `${page.checkedAt}:${id}:${text}`;
  const completed = claims.filter((b) => reviewed[key(b.id, b.text)]).length;
  return (
    <section
      className={styles.evidencePanel}
      aria-label="Manual evidence review"
    >
      <div className={styles.panelTitle}>
        <h3>Claims and evidence review</h3>
        <span>
          {completed}/{claims.length} manually reviewed
        </span>
      </div>
      <p className={styles.muted}>
        Flagged wording may need evidence. This checklist records your review
        and does not verify facts or change measured audit health.
      </p>
      {claims.length ? (
        <>
          <progress
            max={claims.length}
            value={completed}
            aria-label="Manual claim review progress"
          />
          {claims.slice(0, 40).map((b) => (
            <label className={styles.claimCheck} key={b.id}>
              <input
                type="checkbox"
                checked={Boolean(reviewed[key(b.id, b.text)])}
                onChange={(e) => {
                  const checked = e.target.checked;
                  setReviewed?.((v) => ({
                    ...v,
                    [key(b.id, b.text)]: checked,
                  }));
                }}
              />
              <span>
                <strong>
                  {reviewed[key(b.id, b.text)]
                    ? "Marked reviewed by you"
                    : "Check supporting evidence"}
                </strong>
                <span>{b.text}</span>
              </span>
            </label>
          ))}
          {claims.length > 40 && (
            <p>
              Showing 40 claim passages. The full extracted text remains
              available in the report export.
            </p>
          )}
        </>
      ) : (
        <p>
          No claim cues matched these checks. This does not establish factual
          accuracy.
        </p>
      )}
      <details className={styles.options}>
        <summary>Extracted external sources</summary>
        <p className={styles.muted}>
          These links are not automatically matched to individual claims.
        </p>
        {linkReport(page)
          .filter((l) => l.type === "External")
          .slice(0, 30)
          .map((l, i) => (
            <p key={i}>
              <a href={l.href} target="_blank" rel="noreferrer">
                {l.text || l.host} <ArrowUpRight size={12} />
              </a>
            </p>
          ))}
      </details>
    </section>
  );
}
export function ContentReport({
  page,
  primary,
  secondary,
  related,
  targetGrade,
}: {
  page: PageSnapshot;
  primary: string;
  secondary: string;
  related: string;
  targetGrade: number;
}) {
  const report = useMemo(
    () => readabilityReport(page, targetGrade),
    [page, targetGrade],
  );
  const terms = useMemo(
    () => keywordReport(page, primary, secondary, related),
    [page, primary, secondary, related],
  );
  const [copied, setCopied] = useState("");
  const english = /^en(?:-|$)/i.test(page.language);
  return (
    <>
      <section className={styles.evidencePanel}>
        <div className={styles.panelTitle}>
          <h3>Whole-article readability</h3>
          <span>{page.partial ? "Retained sample" : "Extracted article"}</span>
        </div>
        <div className={styles.dataGrid}>
          {[
            [
              "Reading grade",
              english && report.sentenceCount
                ? report.grade.toFixed(1)
                : "Not assessed",
            ],
            [
              "Flesch reading ease",
              english && report.fleschEase !== null
                ? report.fleschEase.toFixed(1)
                : "Not assessed",
            ],
            ["Words", report.words.toLocaleString()],
            ["Sentences", report.sentenceCount],
            ["Average sentence", `${report.averageSentenceWords} words`],
            ["Over 25 words", report.longSentences],
            ["Paragraphs", report.paragraphs],
            ["List items", report.listItems],
          ].map(([label, value]) => (
            <div key={label}>
              <span>{label}</span>
              <strong>{value}</strong>
            </div>
          ))}
        </div>
        <p className={styles.muted}>
          The shared readability engine preserves list and paragraph boundaries.
          English grade estimates depend on the selected reader target.
        </p>
        {!english && (
          <p className={styles.warningNote}>
            English reading formulas are unavailable without a matching English
            document language declaration. Structural counts remain available.
          </p>
        )}
        <div className={styles.findingActions}>
          <button
            type="button"
            className={styles.quiet}
            onClick={async () => {
              try {
                await navigator.clipboard.writeText(
                  page.blocks
                    .map((b) =>
                      b.tag === "li" || b.listItem !== undefined
                        ? `• ${b.text}`
                        : b.text,
                    )
                    .join("\n\n"),
                );
                setCopied(
                  "Content copied. Paste it into the Readability Editor.",
                );
              } catch {
                setCopied(
                  "Copy is unavailable. Export the report to retrieve the content.",
                );
              }
            }}
          >
            Copy extracted article
          </button>
          <Link className={styles.toolLink} href="/tools/readability-checker">
            Open Readability Editor <ArrowUpRight size={14} />
          </Link>
        </div>
        {copied && <p role="status">{copied}</p>}
      </section>
      <section className={styles.evidencePanel}>
        <h3>Keyword coverage and distribution</h3>
        <p className={styles.muted}>
          Counts use exact phrases in body text. Density means phrase
          occurrences per 100 body words, without a universal target percentage.
        </p>
        {terms.length ? (
          <div className={styles.tableWrap}>
            <table>
              <thead>
                <tr>
                  {[
                    "Phrase",
                    "Group",
                    "Body",
                    "Density",
                    "Title / H1",
                    "Other headings",
                    "Start / middle / end",
                  ].map((h) => (
                    <th key={h}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {terms.map((t) => (
                  <tr key={t.term}>
                    <td>{t.term}</td>
                    <td>{t.group}</td>
                    <td>{t.count}</td>
                    <td>{t.density}%</td>
                    <td>
                      {t.title} / {t.h1}
                    </td>
                    <td>{t.headings}</td>
                    <td>{t.distribution.join(" / ")}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p>
            Add your primary keyword and optional related terms above to inspect
            coverage.
          </p>
        )}
        <p className={styles.muted}>
          Distribution uses three equal groups of retained content blocks.
          Related concepts and natural wording may communicate relevance without
          exact matches.
        </p>
        <Link
          href="/tools/keyword-cannibalization-finder"
          className={styles.toolLink}
        >
          Open Keyword Cannibalization Finder for multiple-page analysis{" "}
          <ArrowUpRight size={14} />
        </Link>
      </section>
      <EvidenceReview key={page.checkedAt} page={page} />
      <details className={styles.evidencePanel}>
        <summary>Inspect extracted text</summary>
        {page.blocks.slice(0, 200).map((b) => (
          <p key={b.id}>
            <small>{b.tag.toUpperCase()}</small> {b.text}
          </p>
        ))}
        <p className={styles.muted}>
          Showing up to 200 retained blocks. Export the report for all retained
          evidence.
        </p>
      </details>
    </>
  );
}
export function TechnicalReport({ page }: { page: PageSnapshot }) {
  const entries = [
    [
      "HTTP response",
      page.source === "url"
        ? `HTTP ${page.status ?? "unknown"}`
        : "Not checked for pasted HTML",
    ],
    ["Final URL", page.url || "Not supplied"],
    [
      "Redirects followed",
      page.source === "url" ? page.redirects : "Not checked",
    ],
    ["Canonical", page.canonical || "Not detected"],
    ["Canonical declarations", page.canonicalCount],
    [
      "Robots directives",
      page.robots.join("; ") || "None detected in supplied response",
    ],
    ["Document language", page.language || "Not declared"],
    ["Mobile viewport", page.viewport || "Not detected"],
    ["Robots.txt retrieval", page.resources.robots],
    ["Evidence downloaded", `${Math.round(page.bytesRead / 1024)} KB`],
    ["Content scope", page.scope],
    [
      "Extraction status",
      page.partial ? "Partial evidence" : "Returned HTML inspected",
    ],
  ];
  return (
    <section className={styles.evidencePanel}>
      <h3>Technical evidence</h3>
      <dl className={styles.technicalData}>
        {entries.map(([label, value]) => (
          <div key={label}>
            <dt>{label}</dt>
            <dd>{value}</dd>
          </div>
        ))}
      </dl>
      <p className={styles.muted}>
        JavaScript was not executed. A successful response and absent noindex
        directive do not prove Google indexing or crawler access.
      </p>
      {page.resources.robotsText && (
        <details className={styles.options}>
          <summary>Retrieved robots.txt text</summary>
          <pre className={styles.rawEvidence}>{page.resources.robotsText}</pre>
        </details>
      )}
      <div className={styles.technicalLinks}>
        <Link href="/tools/core-web-vitals-checker" className={styles.toolLink}>
          Open Core Web Vitals Checker <ArrowUpRight size={14} />
        </Link>
        <Link href="/tools/robots-txt-generator" className={styles.toolLink}>
          Open Robots.txt Generator <ArrowUpRight size={14} />
        </Link>
      </div>
      <p className={styles.muted}>
        Performance and destination health require separate tests. They are not
        marked passed in this audit.
      </p>
    </section>
  );
}
