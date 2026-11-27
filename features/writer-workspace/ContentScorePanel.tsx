"use client";

import React, { useMemo, useState } from "react";
import {
  AlertTriangle,
  ArrowDown,
  ArrowUp,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Download,
  FileCheck2,
  Globe,
  RefreshCw,
  Sparkles,
} from "lucide-react";
import {
  computeContentScorecard,
  workspace,
  type ContentScoreTermItem,
} from "./model";
import { formatResearchAndVerificationLogMarkdown } from "./niche-policies";
import { saveBlob } from "./assets";
import type { Project } from "./types";
import styles from "./workspace.module.css";

type Props = {
  project: Project;
  collapsed: boolean;
  onToggleCollapse: () => void;
  onSelectTerm: (term: string) => void;
  onSelectHeading: (sectionId: string, headingText: string) => void;
  onRunResearch: () => void;
  researchBusy?: boolean;
};

type ScoreTab = "keywords" | "headings" | "fixes" | "brief_log";

function StatusBadge({
  actual,
  min,
  max,
}: {
  actual: number;
  min: number;
  max: number;
}) {
  if (actual >= min && actual <= max) {
    return (
      <span className={styles.scoreStatOk} title={`Within target ${min}–${max}`}>
        <CheckCircle2 size={13} />
      </span>
    );
  }
  if (actual > max) {
    return (
      <span className={styles.scoreStatOver} title={`Above target ${min}–${max}`}>
        <ArrowUp size={13} />
      </span>
    );
  }
  return (
    <span className={styles.scoreStatUnder} title={`Below target ${min}–${max}`}>
      <ArrowDown size={13} />
    </span>
  );
}

function ResearchModeLabel({
  mode,
}: {
  mode: "live-google-grounding" | "live-serp-api" | "public-reference" | "brief-only";
}) {
  if (mode === "live-google-grounding" || mode === "live-serp-api") {
    return "Live Web Grounded";
  }
  if (mode === "public-reference") return "Public Web Sampled";
  return "Brief Only";
}

export function ContentScorePanel({
  project,
  collapsed,
  onToggleCollapse,
  onSelectTerm,
  onSelectHeading,
  onRunResearch,
  researchBusy,
}: Props) {
  const [activeTab, setActiveTab] = useState<ScoreTab>("keywords");
  const scorecard = useMemo(() => computeContentScorecard(project), [project]);
  const w = workspace(project);

  const score = Math.max(0, Math.min(100, scorecard.overallScore));
  const arcLen = Math.PI * 82; // ~257.6
  const dashOffset = arcLen * (1 - score / 100);
  const theta = Math.PI - (score / 100) * Math.PI;
  const markerX = 110 + 82 * Math.cos(theta);
  const markerY = 108 - 82 * Math.sin(theta);

  const scoreToneClass =
    score >= 78
      ? styles.scoreToneGood
      : score >= 55
        ? styles.scoreToneMid
        : styles.scoreToneLow;

  if (collapsed) {
    return (
      <aside className={styles.scoreRailCollapsed} aria-label="Content Score summary">
        <button
          type="button"
          className={styles.scoreExpandRailBtn}
          onClick={onToggleCollapse}
          aria-label="Open Content Score inspector"
          title="Open Content Score & SERP benchmarks"
        >
          <ChevronLeft size={16} />
          <span className={`${styles.scoreRailBadge} ${scoreToneClass}`}>
            {score}
          </span>
          <span className={styles.scoreRailLabel}>Score</span>
        </button>
      </aside>
    );
  }

  return (
    <aside className={styles.scoreSidebar} aria-label="Content Score and SEO Benchmarks">
      <div className={styles.scoreTopBar}>
        <div className={styles.scoreTopTitle}>
          <span>Content Score</span>
          <span className={styles.scoreModePill}>
            <ResearchModeLabel mode={scorecard.researchMode} />
          </span>
        </div>
        <button
          type="button"
          className={styles.scoreCollapseBtn}
          onClick={onToggleCollapse}
          aria-label="Collapse Content Score panel"
          title="Collapse score inspector"
        >
          <ChevronRight size={15} />
        </button>
      </div>

      {/* Semi-Circular Speedometer Gauge */}
      <div className={styles.scoreGaugeWrap}>
        <svg
          viewBox="0 0 220 124"
          className={styles.scoreGaugeSvg}
          role="img"
          aria-label={`Content score ${score} out of 100`}
        >
          <defs>
            <linearGradient id="writerScoreGrad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#ef4444" />
              <stop offset="52%" stopColor="#f59e0b" />
              <stop offset="100%" stopColor="#10b981" />
            </linearGradient>
          </defs>
          <path
            d="M 28 108 A 82 82 0 0 1 192 108"
            fill="none"
            stroke="currentColor"
            className={styles.scoreGaugeTrack}
            strokeWidth="12"
            strokeLinecap="round"
          />
          <path
            d="M 28 108 A 82 82 0 0 1 192 108"
            fill="none"
            stroke="url(#writerScoreGrad)"
            strokeWidth="12"
            strokeLinecap="round"
            strokeDasharray={arcLen}
            strokeDashoffset={dashOffset}
          />
          <circle
            cx={markerX}
            cy={markerY}
            r="6.5"
            className={styles.scoreGaugeKnob}
            strokeWidth="2.5"
          />
        </svg>
        <div className={styles.scoreGaugeCenter}>
          <span className={styles.scoreBenchmarkChip}>
            Target {scorecard.targetBenchmark}+
          </span>
          <strong className={`${styles.scoreBigNumber} ${scoreToneClass}`}>
            {score}
            <span>/100</span>
          </strong>
        </div>

        {scorecard.researchMode === "brief-only" ? (
          <button
            type="button"
            className={styles.scoreGroundBtn}
            onClick={onRunResearch}
            disabled={researchBusy}
          >
            <RefreshCw size={12} className={researchBusy ? styles.spinIcon : undefined} />
            {researchBusy ? "Benchmarking SERP…" : "Run Live Competitor Analysis"}
          </button>
        ) : null}
      </div>

      {/* 2x2 Structure Grid */}
      <div className={styles.scoreSectionHead}>
        <span>Structure</span>
        <small>
          {w.research?.competitorBenchmarks?.analyzedPages.length
            ? `Based on ${w.research.competitorBenchmarks.analyzedPages.length} SERP pages`
            : "Editorial benchmark"}
        </small>
      </div>
      <div className={styles.scoreStructGrid}>
        <div className={styles.scoreStructCell}>
          <span>Words</span>
          <strong>
            {scorecard.structure.words.actual.toLocaleString()}
            <StatusBadge
              actual={scorecard.structure.words.actual}
              min={scorecard.structure.words.min}
              max={scorecard.structure.words.max}
            />
          </strong>
          <small>
            {scorecard.structure.words.min.toLocaleString()} –{" "}
            {scorecard.structure.words.max.toLocaleString()}
          </small>
        </div>
        <div className={styles.scoreStructCell}>
          <span>Headings (H2)</span>
          <strong>
            {scorecard.structure.headings.actual}
            <StatusBadge
              actual={scorecard.structure.headings.actual}
              min={scorecard.structure.headings.min}
              max={scorecard.structure.headings.max}
            />
          </strong>
          <small>
            {scorecard.structure.headings.min} – {scorecard.structure.headings.max}
          </small>
        </div>
        <div className={styles.scoreStructCell}>
          <span>Paragraphs</span>
          <strong>
            {scorecard.structure.paragraphs.actual}
            <StatusBadge
              actual={scorecard.structure.paragraphs.actual}
              min={scorecard.structure.paragraphs.min}
              max={scorecard.structure.paragraphs.max}
            />
          </strong>
          <small>
            {Math.round(scorecard.structure.paragraphs.min)} –{" "}
            {Math.round(scorecard.structure.paragraphs.max)}
          </small>
        </div>
        <div className={styles.scoreStructCell}>
          <span>Images</span>
          <strong>
            {scorecard.structure.images.actual}
            <StatusBadge
              actual={scorecard.structure.images.actual}
              min={scorecard.structure.images.min}
              max={scorecard.structure.images.max}
            />
          </strong>
          <small>
            {scorecard.structure.images.min} – {scorecard.structure.images.max}
          </small>
        </div>
      </div>

      {/* Anti-stuffing alert */}
      {scorecard.stuffedPrimary && (
        <button
          type="button"
          className={styles.scoreStuffAlert}
          onClick={() =>
            project.keywordCluster.primaryKeyword.trim() &&
            onSelectTerm(project.keywordCluster.primaryKeyword.trim())
          }
        >
          <AlertTriangle size={14} />
          <span>
            Primary keyword is overused. Click to jump &amp; vary wording naturally.
          </span>
        </button>
      )}

      {/* Collapsible Research Brief & Verification Log Summary Drawer */}
      {(w.research || w.verificationLog) && (
        <details className={styles.scoreLogDrawer}>
          <summary className={styles.scoreLogDrawerSummary}>
            <FileCheck2 size={14} className="shrink-0" />
            <span className={styles.scoreLogTitle}>Brief &amp; Verify Log</span>
            <small>
              {w.verificationLog
                ? w.verificationLog.verificationStatus === "passed"
                  ? "Verified"
                  : w.verificationLog.verificationStatus === "passed-with-repairs"
                    ? `${w.verificationLog.repairsApplied.length} repaired`
                    : "Review needed"
                : w.research?.briefContract
                  ? "Brief ready"
                  : "Ready"}
            </small>
          </summary>
          <div className={styles.scoreLogDrawerBody}>
            {w.research?.briefContract ? (
              <p>
                <strong>Strategy:</strong> {w.research.briefContract.archetypeLabel} ·{" "}
                {w.research.briefContract.nicheLabel} ({w.research.briefContract.lengthMode} length ·{" "}
                {w.research.briefContract.resolvedTone})
              </p>
            ) : null}
            {w.verificationLog ? (
              <p>
                <strong>Audit:</strong>{" "}
                {w.verificationLog.fullTextCharsAudited.toLocaleString()} chars ·{" "}
                {w.verificationLog.repairsApplied.length} repair(s) ·{" "}
                {w.verificationLog.warnings.length} warning(s)
              </p>
            ) : null}
            <div className={styles.scoreLogActionRow}>
              <button
                type="button"
                className={styles.scoreGroundBtn}
                onClick={() => setActiveTab("brief_log")}
              >
                Open Full Brief &amp; Log Tab
              </button>
              <button
                type="button"
                className={styles.scoreGroundBtn}
                onClick={() => {
                  const mdLog = formatResearchAndVerificationLogMarkdown(project);
                  const slug =
                    project.metaPack.urlSlug ||
                    project.keywordCluster.primaryKeyword
                      .toLowerCase()
                      .replace(/[^a-z0-9]+/g, "-") ||
                    "article";
                  saveBlob(
                    `${slug}-research-verification-log.md`,
                    mdLog,
                    "text/markdown;charset=utf-8",
                  );
                }}
              >
                <Download size={13} className="shrink-0" /> Export Log (.md)
              </button>
            </div>
          </div>
        </details>
      )}

      {/* Inspector Tabs: Keywords | Headings | Fixes | Brief & Log */}
      <div className={styles.scoreTabs} role="tablist" aria-label="Score details">
        <button
          type="button"
          role="tab"
          aria-selected={activeTab === "keywords"}
          onClick={() => setActiveTab("keywords")}
        >
          Terms ({scorecard.terms.length})
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={activeTab === "headings"}
          onClick={() => setActiveTab("headings")}
        >
          Headings ({project.sections.length})
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={activeTab === "fixes"}
          onClick={() => setActiveTab("fixes")}
        >
          Fixes ({scorecard.issues.length})
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={activeTab === "brief_log"}
          onClick={() => setActiveTab("brief_log")}
        >
          Brief &amp; Log
        </button>
      </div>

        <div className={styles.scoreTabBody}>
        {activeTab === "keywords" && (
          <div className={styles.scoreTermList}>
            {scorecard.terms.length ? (
              scorecard.terms.map((item: ContentScoreTermItem) => (
                <button
                  key={`${item.category}-${item.term}`}
                  type="button"
                  className={`${styles.scoreTermPill} ${
                    item.status === "optimal"
                      ? styles.scoreTermOk
                      : item.status === "stuffed"
                        ? styles.scoreTermOver
                        : styles.scoreTermUnder
                  }`}
                  onClick={() => onSelectTerm(item.term)}
                  title={`Click to locate "${item.term}" in draft`}
                >
                  <span>{item.term}</span>
                  <em>
                    {item.actual}/{item.min === item.max ? item.max : `${item.min}–${item.max}`}
                  </em>
                </button>
              ))
            ) : (
              <p className={styles.leftMetaSub}>
                Add a primary keyword or run live web analysis to see topic-neutral semantic terms.
              </p>
            )}
          </div>
        )}

        {activeTab === "headings" && (
          <div className={styles.scoreHeadingList}>
            {project.metaPack.h1Title ? (
              <button
                type="button"
                className={styles.scoreHeadingItem}
                onClick={() => onSelectHeading("", project.metaPack.h1Title)}
              >
                <span className={styles.scoreHeadingTag}>H1</span>
                <strong>{project.metaPack.h1Title}</strong>
              </button>
            ) : null}
            {project.sections.map((sec, idx) => (
              <button
                key={sec.id}
                type="button"
                className={styles.scoreHeadingItem}
                onClick={() => onSelectHeading(sec.id, sec.h2Text)}
              >
                <span className={styles.scoreHeadingTag}>H2.{idx + 1}</span>
                <span>{sec.h2Text}</span>
              </button>
            ))}
            {scorecard.repeatedOpeners.length > 0 && (
              <p className={styles.scoreWarnNote}>
                Repeated opening hook detected ({scorecard.repeatedOpeners[0]}…). Vary H2 leads.
              </p>
            )}
          </div>
        )}

        {activeTab === "fixes" && (
          <div className={styles.scoreFixList}>
            {scorecard.issues.length ? (
              scorecard.issues.map((issue) => (
                <button
                  key={issue.id}
                  type="button"
                  className={`${styles.scoreFixCard} ${
                    issue.severity === "error"
                      ? styles.scoreFixErr
                      : styles.scoreFixWarn
                  }`}
                  onClick={() => {
                    if (issue.searchTerm) onSelectTerm(issue.searchTerm);
                  }}
                >
                  <strong>{issue.label}</strong>
                  <span>{issue.detail}</span>
                </button>
              ))
            ) : (
              <div className={styles.scoreAllClear}>
                <Sparkles size={14} /> Structure, diversity, and readability look well-balanced.
              </div>
            )}

            <div className={styles.scoreVoiceBox}>
              <div className={styles.scoreVoiceTitle}>
                <Globe size={13} />
                <strong>Brand Voice DNA</strong>
              </div>
              <p>
                {w.research?.brandVoice
                  ? `${w.research.brandVoice.voiceSummary} (${w.research.brandVoice.pointOfView}, ${w.research.brandVoice.sentenceRhythm})`
                  : w.brandVoiceOverride?.voiceSummary
                    ? w.brandVoiceOverride.voiceSummary
                    : project.brandSiteUrl
                      ? `Connected: ${project.brandSiteUrl}`
                      : "Neutral editorial voice (no website connected)"}
              </p>
            </div>
          </div>
        )}

        {activeTab === "brief_log" && (
          <div className={styles.scoreBriefLogPanel}>
            {w.verificationLog ? (
              <div className={styles.scoreAxisGrid}>
                <div>
                  <span>Research</span>
                  <strong>{w.verificationLog.researchStatus}</strong>
                </div>
                <div>
                  <span>Draft</span>
                  <strong>{w.verificationLog.draftStatus}</strong>
                </div>
                <div>
                  <span>Verifier</span>
                  <strong>{w.verificationLog.verificationStatus}</strong>
                </div>
                <div>
                  <span>Assets</span>
                  <strong>{w.verificationLog.enrichmentStatus}</strong>
                </div>
              </div>
            ) : null}

            {w.research?.briefContract ? (
              <div className={styles.scoreVoiceBox}>
                <strong>{w.research.briefContract.archetypeLabel}</strong>
                <p>
                  <strong>Niche Policy:</strong> {w.research.briefContract.nicheLabel} (
                  {w.research.briefContract.editorialStrictness})
                </p>
                <p>
                  <strong>Length ({w.research.briefContract.lengthMode}):</strong>{" "}
                  {w.research.briefContract.lengthRationale}
                </p>
                <p>
                  <strong>Tone ({w.research.briefContract.toneMode}):</strong>{" "}
                  {w.research.briefContract.resolvedTone}
                </p>
              </div>
            ) : null}

            {w.verificationLog?.repairsApplied.length ? (
              <div className={styles.scoreVoiceBox}>
                <strong>
                  Auto-Repairs Applied ({w.verificationLog.repairsApplied.length})
                </strong>
                <ul className={styles.scoreLogList}>
                  {w.verificationLog.repairsApplied.map((rep, idx) => (
                    <li key={`rep-${idx}`}>{rep}</li>
                  ))}
                </ul>
              </div>
            ) : null}

            {w.verificationLog?.claimsChecked.length ? (
              <div className={styles.scoreVoiceBox}>
                <strong>
                  Verification Ledger ({w.verificationLog.fullTextCharsAudited.toLocaleString()} chars)
                </strong>
                <ul className={styles.scoreLogList}>
                  {w.verificationLog.claimsChecked.map((c) => (
                    <li key={c.id}>
                      <em>[{c.status}]</em> {c.claimText} — {c.detail}
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}

            {w.research?.externalLinks.length ? (
              <div className={styles.scoreVoiceBox}>
                <strong>Grounded Sources ({w.research.externalLinks.length})</strong>
                <ul className={styles.scoreLogList}>
                  {w.research.externalLinks.map((ext) => (
                    <li key={ext.url}>
                      <a href={ext.url} target="_blank" rel="noreferrer noopener">
                        {ext.title}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}

            <button
              type="button"
              className={styles.scoreGroundBtn}
              onClick={() => {
                const mdLog = formatResearchAndVerificationLogMarkdown(project);
                const slug =
                  project.metaPack.urlSlug ||
                  project.keywordCluster.primaryKeyword
                    .toLowerCase()
                    .replace(/[^a-z0-9]+/g, "-") ||
                  "article";
                saveBlob(
                  `${slug}-research-verification-log.md`,
                  mdLog,
                  "text/markdown;charset=utf-8",
                );
              }}
            >
              <Download size={13} className="shrink-0" /> Export Research &amp; Verification Log (.md)
            </button>
          </div>
        )}
      </div>
    </aside>
  );
}
