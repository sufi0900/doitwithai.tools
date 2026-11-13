"use client";

import { useMemo, useState } from "react";
import {
  Check,
  ExternalLink,
  Link2,
  SlidersHorizontal,
  Sparkles,
  BookOpen,
  SearchCheck,
  Wand2,
  X,
  AlertTriangle,
  Zap,
} from "lucide-react";
import {
  analyzeDocument,
  formatDuration,
  gradeLabel,
  targetPresets,
  type DocumentAnalysis,
  type IssueType,
} from "@/features/readability/engine";
import {
  articleMarkdown,
  auditBurstinessRhythm,
  auditClaimVerification,
  auditContentFreshnessAndDecay,
  auditContextualLinkOpportunities,
  auditEntitySalienceAndQuestions,
  auditFaqPaaReadiness,
  auditSectionSnippetReadiness,
  auditSubtopicCoverageGaps,
  readiness,
  workspace,
} from "./model";
import type { Project } from "./types";
import s from "./workspace.module.css";

export type StudioLeftTab = "helper" | "readability" | "seo";

export type ReadabilityHighlightToggles = {
  veryHard: boolean;
  hard: boolean;
  passive: boolean;
  simpler: boolean;
};

const QUICK_AI_CHIPS = [
  { label: "Tighten & clarify", prompt: "Make this clearer, tighter, and eliminate filler words while preserving every fact and Markdown heading." },
  { label: "Shorten hard sentences", prompt: "Break long complex sentences into short, direct, high-readability 14-word sentences and keep all headings on separate lines." },
  { label: "Convert to bullets", prompt: "Convert dense prose here into crisp scannable bullet points with bold lead-ins." },
  { label: "Add concrete example", prompt: "Keep the meaning intact and add one clear practical example to make it actionable." },
  { label: "Convert to table", prompt: "Organize this comparison or structured criteria into a clean Markdown table." },
  { label: "Decision matrix", prompt: "Add a 3-column Markdown decision matrix (Approach | Best For | Key Tradeoff) comparing the options in this section." },
  { label: "E-E-A-T pro tip", prompt: "Add a concise '> **Practitioner Pro Tip:**' blockquote highlighting a real-world implementation edge case or pitfall to avoid." },
  { label: "Stronger conclusion", prompt: "Rewrite this closing section with an actionable takeaway checklist and zero fluff." },
];

export function LeftStudioPanel({
  project,
  selection,
  activeTab,
  highlightToggles,
  targetGrade,
  aiRevisionState,
  onChangeTab,
  onToggleHighlight,
  onChangeTargetGrade,
  onOpenBriefModal,
  onRunAiHelper,
  onQuickReadabilityPolish,
  onApplyRevision,
  onDiscardRevision,
  onInsertLink,
  onAutoWeaveInternalLinks,
  onNormalizeFaqsPaa,
  onInjectUncoveredQuestions,
  onConvertH2sToQuestions,
  onApplyContentRefresh,
  onRunResearch,
  researchBusy,
}: {
  project: Project;
  selection: string;
  activeTab: StudioLeftTab;
  highlightToggles: ReadabilityHighlightToggles;
  targetGrade: number;
  aiRevisionState: {
    busy: boolean;
    original: string;
    proposed: string;
    scope: "selection" | "article";
    error?: string;
  };
  onChangeTab: (tab: StudioLeftTab) => void;
  onToggleHighlight: (key: keyof ReadabilityHighlightToggles) => void;
  onChangeTargetGrade: (grade: number) => void;
  onOpenBriefModal: () => void;
  onRunAiHelper: (instruction: string, scope: "selection" | "article") => void;
  onQuickReadabilityPolish?: () => void;
  onApplyRevision: () => void;
  onDiscardRevision: () => void;
  onInsertLink: (title: string, url: string) => void;
  onAutoWeaveInternalLinks?: () => void;
  onNormalizeFaqsPaa?: () => void;
  onInjectUncoveredQuestions?: () => void;
  onConvertH2sToQuestions?: () => void;
  onApplyContentRefresh?: () => void;
  onRunResearch?: () => void;
  researchBusy?: boolean;
}) {
  const [instruction, setInstruction] = useState(
    "Make this clearer, tighter, and easier to scan.",
  );
  const [scope, setScope] = useState<"selection" | "article">(
    selection.trim() ? "selection" : "article",
  );

  const w = workspace(project);
  const md = useMemo(() => articleMarkdown(project), [project]);
  const r = useMemo(() => readiness(project), [project]);
  const claimAudit = useMemo(() => auditClaimVerification(md), [md]);
  const burstiness = useMemo(() => auditBurstinessRhythm(md), [md]);
  const snippetAudit = useMemo(
    () => auditSectionSnippetReadiness(project),
    [project],
  );
  const linkOpportunities = useMemo(
    () => auditContextualLinkOpportunities(project),
    [project],
  );
  const faqPaaAudit = useMemo(
    () => auditFaqPaaReadiness(project),
    [project],
  );
  const salienceAudit = useMemo(
    () => auditEntitySalienceAndQuestions(project),
    [project],
  );
  const subtopicGaps = useMemo(
    () => auditSubtopicCoverageGaps(project),
    [project],
  );
  const freshnessAudit = useMemo(
    () => auditContentFreshnessAndDecay(project),
    [project],
  );
  const infoGainAngles = useMemo(() => {
    const angles = [
      ...(w.research?.competitorAngles || []).map((text) => ({ tag: "Info Gain", text })),
      ...(w.research?.eeatSignals || []).map((text) => ({ tag: "E-E-A-T", text })),
      ...(w.research?.questionsToAnswer || []).slice(0, 3).map((text) => ({ tag: "User Query", text })),
    ];
    return angles.slice(0, 6);
  }, [w.research]);
  const docAnalysis: DocumentAnalysis = useMemo(
    () => analyzeDocument(md, { longThreshold: 22, targetGrade }),
    [md, targetGrade],
  );

  const effectiveScope: "selection" | "article" =
    selection.trim() && scope === "selection" ? "selection" : scope;

  const isEnglish = !w.language || /^en(g|glish)?/i.test(w.language.trim());

  const kw = project.keywordCluster.primaryKeyword.trim();
  const secondaryKws = useMemo(
    () => [
      ...(project.keywordCluster.secondaryKeywords || []),
      ...(w.research?.secondaryKeywords || []),
      ...(w.research?.lsiEntities || []),
    ].filter((v, idx, arr) => Boolean(v) && arr.indexOf(v) === idx),
    [project.keywordCluster.secondaryKeywords, w.research],
  );

  const lowerMd = md.toLowerCase();
  const internalLinks = useMemo(() => {
    if (project.internalLinks?.length) {
      return project.internalLinks.map((l) => ({
        title: l.targetTitle || l.anchorText,
        anchor: l.anchorText || l.targetTitle,
        url: l.targetUrl,
        reason: l.category || "Verified site link",
      }));
    }
    return (w.research?.internalLinks || []).map((l) => ({
      title: l.title,
      anchor: l.anchorText || l.title,
      url: l.url,
      reason: l.snippet || "Matched site page",
    }));
  }, [project.internalLinks, w.research?.internalLinks]);

  const externalLinks = useMemo(
    () => [
      ...(w.research?.externalLinks || []).map((l) => ({
        title: l.title,
        url: l.url,
        snippet: l.snippet || "",
      })),
      ...w.references
        .filter(
          (ref) =>
            !(w.research?.externalLinks || []).some((e) => e.url === ref.url),
        )
        .map((ref) => ({
          title: ref.title || ref.url,
          url: ref.url,
          snippet: ref.text.slice(0, 140),
        })),
    ],
    [w.research?.externalLinks, w.references],
  );

  const countFlagged = (type: IssueType) => docAnalysis.counts[type] || 0;
  const totalSentences = Math.max(1, r.readability.sentences.length);
  const readableSentencePct =
    r.words > 0
      ? Math.max(
          0,
          Math.min(
            100,
            Math.round(
              ((totalSentences - r.readability.longSentences.length) /
                totalSentences) *
                100,
            ),
          ),
        )
      : 0;
  const keywordHitsCount = secondaryKws.filter((t) =>
    lowerMd.includes(t.toLowerCase()),
  ).length;
  const keywordCoveragePct = secondaryKws.length
    ? Math.round((keywordHitsCount / Math.min(14, secondaryKws.length)) * 100)
    : kw && lowerMd.includes(kw.toLowerCase())
      ? 100
      : 0;

  return (
    <aside className={s.sidebar} aria-label="Editorial studio controls">
      <div className={s.leftHeaderBar}>
        <div className={s.leftScoreHeaderTop}>
          <div className={s.scoreBar}>
            <span className={s.scoreNum}>{r.score}</span>
            <div>
              <strong>Readiness &amp; SEO Score</strong>
              <div className={s.leftMetaSub}>
                {r.words.toLocaleString()} words · {formatDuration(docAnalysis.readingSeconds)} read
              </div>
            </div>
          </div>
          <button
            type="button"
            className={s.briefTriggerBtn}
            onClick={onOpenBriefModal}
            title="Edit onboarding brief, outline headings, brand & references"
          >
            <SlidersHorizontal className="w-3.5 h-3.5" aria-hidden />
            Brief
          </button>
        </div>

        {/* Visual Overall Readiness Progress Bar */}
        <div className={s.leftScoreProgressWrap}>
          <div className={s.leftScoreProgressLabels}>
            <span>Editorial &amp; Technical Readiness</span>
            <strong>{r.score}/100</strong>
          </div>
          <div className={s.scoreGaugeTrack} aria-hidden>
            <div
              className={
                r.score >= 80
                  ? s.scoreGaugeFillGood
                  : r.score >= 55
                    ? s.scoreGaugeFillWarn
                    : s.scoreGaugeFillLow
              }
              style={{ width: `${Math.max(4, Math.min(100, r.score))}%` }}
            />
          </div>
        </div>
      </div>

      <div className={s.tabs3} role="tablist" aria-label="Studio assistant panels">
        <button
          type="button"
          role="tab"
          aria-selected={activeTab === "helper"}
          className={activeTab === "helper" ? s.tabOn : ""}
          onClick={() => onChangeTab("helper")}
        >
          <Sparkles className="w-3.5 h-3.5" aria-hidden />
          AI Helper
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={activeTab === "readability"}
          className={activeTab === "readability" ? s.tabOn : ""}
          onClick={() => onChangeTab("readability")}
        >
          <BookOpen className="w-3.5 h-3.5" aria-hidden />
          Readability
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={activeTab === "seo"}
          className={activeTab === "seo" ? s.tabOn : ""}
          onClick={() => onChangeTab("seo")}
        >
          <SearchCheck className="w-3.5 h-3.5" aria-hidden />
          SEO &amp; Links
        </button>
      </div>

      {activeTab === "helper" ? (
        <div className={s.panelSection}>
          <div className={s.helperScopeRow}>
            <span className={s.label}>Target Scope</span>
            <div className={s.scopePills}>
              <button
                type="button"
                className={`${s.scopePill} ${effectiveScope === "selection" ? s.scopePillOn : ""}`}
                onClick={() => setScope("selection")}
              >
                Selected {selection.trim() ? `(${selection.trim().split(/\s+/).length}w)` : ""}
              </button>
              <button
                type="button"
                className={`${s.scopePill} ${effectiveScope === "article" ? s.scopePillOn : ""}`}
                onClick={() => setScope("article")}
              >
                Full Article Intro/Body
              </button>
            </div>
          </div>

          {effectiveScope === "selection" && !selection.trim() ? (
            <div className={s.helperSelectionHint}>
              Highlight any sentence, paragraph, or heading inside the article editor (or right-click a block → <strong>Tell AI about it</strong>) to target a specific passage.
            </div>
          ) : effectiveScope === "selection" ? (
            <div className={s.selectionQuoteBox}>
              <span>Selected text preview:</span>
              <p>{selection.trim().slice(0, 180)}{selection.trim().length > 180 ? "…" : ""}</p>
            </div>
          ) : null}

          <label className={s.label} htmlFor="left-ai-helper-input">
            Tell AI what to change or restructure
          </label>
          <textarea
            id="left-ai-helper-input"
            className={`${s.area} ${s.helperPromptArea}`}
            value={instruction}
            onChange={(e) => setInstruction(e.target.value)}
            placeholder="e.g. Rewrite this in simpler everyday language, convert the comparison into a Markdown table, or add a clear takeaway..."
          />

          <div className={s.chipGrid}>
            {QUICK_AI_CHIPS.map((chip) => (
              <button
                key={chip.label}
                type="button"
                className={s.helperChip}
                disabled={aiRevisionState.busy}
                onClick={() => {
                  setInstruction(chip.prompt);
                  onRunAiHelper(chip.prompt, effectiveScope);
                }}
              >
                {chip.label}
              </button>
            ))}
          </div>

          <button
            type="button"
            className={`${s.btn} ${s.primary} ${s.fullWidthBtn}`}
            disabled={aiRevisionState.busy || !instruction.trim()}
            onClick={() => onRunAiHelper(instruction, effectiveScope)}
          >
            <Wand2 className="w-4 h-4" aria-hidden />
            {aiRevisionState.busy ? "Revising with AI..." : "Run AI Revision"}
          </button>

          <div className={s.seoBlock}>
            <div className={s.seoBlockHeader}>
              <strong>Instant Markdown Block Generators (0 Tokens)</strong>
              <span>1-Click Insert</span>
            </div>
            <div className={s.blockGenGrid}>
              <button
                type="button"
                className={s.blockGenBtn}
                onClick={() =>
                  onInsertLink(
                    `__MD_BLOCK__:| Evaluation Criterion | Baseline Approach | Optimized ${kw || "AI SEO"} Workflow |\n| --- | --- | --- |\n| Primary Objective | Manual section drafting | Intent-aligned 40–60w answer blocks |\n| Verification Standard | Unchecked claims | Grounded citations & schema markup |\n| Reader Scannability | Dense text walls | Grade 8 rhythm, tables & visuals |`,
                    "https://doitwithai.tools",
                  )
                }
              >
                + Comparison Table
              </button>
              <button
                type="button"
                className={s.blockGenBtn}
                onClick={() =>
                  onInsertLink(
                    `__MD_BLOCK__:- **Verify Search Intent Alignment:** Confirm the H2 heading and opening 40–60 word answer directly resolve the reader's primary question.\n- **Audit Quantitative Claims:** Attach a verified primary documentation link to every benchmark or statistic.\n- **Check Mobile Scannability:** Keep paragraphs to 2–3 crisp sentences with bold lead-ins.`,
                    "https://doitwithai.tools",
                  )
                }
              >
                + Action Checklist
              </button>
              <button
                type="button"
                className={s.blockGenBtn}
                onClick={() =>
                  onInsertLink(
                    `__MD_BLOCK__:> **Key Takeaway:** Focusing on a direct 40–60 word opening answer beneath each heading, supported by comparison tables and verified citations, maximizes both reader comprehension and AI Overview citation eligibility.`,
                    "https://doitwithai.tools",
                  )
                }
              >
                + Key Takeaway Box
              </button>
              <button
                type="button"
                className={s.blockGenBtn}
                onClick={() =>
                  onInsertLink(
                    `__MD_BLOCK__:1. **Define the Core Question:** Frame the section heading around the exact problem your audience needs to solve.\n2. **Lead with a 50-Word Answer:** State the direct takeaway in the opening two sentences before expanding.\n3. **Validate with Evidence:** Pair every recommendation with a concrete example or verified source link.\n4. **Review Readability Rhythm:** Keep sentences under 20 words on average for effortless scanning.`,
                    "https://doitwithai.tools",
                  )
                }
              >
                + 4-Step Framework
              </button>
            </div>
          </div>

          {aiRevisionState.error ? (
            <div className={s.helperError}>{aiRevisionState.error}</div>
          ) : null}

          {aiRevisionState.proposed ? (
            <div className={s.diffBox}>
              <div className={s.diffHeader}>
                <strong>Proposed Revision ({aiRevisionState.scope})</strong>
                <div className={s.diffActions}>
                  <button
                    type="button"
                    className={s.diffAcceptBtn}
                    onClick={onApplyRevision}
                  >
                    <Check className="w-3.5 h-3.5" aria-hidden /> Apply
                  </button>
                  <button
                    type="button"
                    className={s.diffDiscardBtn}
                    onClick={onDiscardRevision}
                  >
                    <X className="w-3.5 h-3.5" aria-hidden /> Discard
                  </button>
                </div>
              </div>
              <pre className={s.diffPreview}>
                {aiRevisionState.proposed.slice(0, 650)}
                {aiRevisionState.proposed.length > 650 ? "…" : ""}
              </pre>
            </div>
          ) : null}
        </div>
      ) : null}

      {activeTab === "readability" ? (
        <div className={s.panelSection}>
          {!isEnglish ? (
            <div className={s.langGuardNotice}>
              <AlertTriangle className="w-4 h-4 shrink-0" aria-hidden />
              <span>
                Language is set to <strong>{w.language}</strong>. Automated English syllable/passive heuristics are informational only.
              </span>
            </div>
          ) : null}

          <div className={s.readabilityHeroGrid}>
            <div className={s.readabilityMetricCard}>
              <span>Grade Level</span>
              <strong>Grade {docAnalysis.grade}</strong>
              <small>{gradeLabel(docAnalysis.grade, docAnalysis.words > 0)}</small>
            </div>
            <div className={s.readabilityMetricCard}>
              <span>Flesch Ease</span>
              <strong>{docAnalysis.fleschEase ?? "—"}</strong>
              <small>Avg {docAnalysis.averageSentenceWords} words/sentence</small>
            </div>
          </div>

          <div className={s.leftScoreProgressWrap}>
            <div className={s.leftScoreProgressLabels}>
              <span>Sentence Clarity Rate (&le;25w)</span>
              <strong>{readableSentencePct}%</strong>
            </div>
            <div className={s.scoreGaugeTrack} aria-hidden>
              <div
                className={
                  readableSentencePct >= 80
                    ? s.scoreGaugeFillGood
                    : s.scoreGaugeFillWarn
                }
                style={{ width: `${Math.max(5, readableSentencePct)}%` }}
              />
            </div>
          </div>

          <div>
            <label className={s.label} htmlFor="readability-target-grade">
              Target Reading Audience
            </label>
            <select
              id="readability-target-grade"
              className={s.input}
              value={targetGrade}
              onChange={(e) => onChangeTargetGrade(Number(e.target.value))}
            >
              {targetPresets.map((preset) => (
                <option key={preset.id} value={preset.grade}>
                  {preset.label}
                </option>
              ))}
            </select>
          </div>

          <div className={s.highlightCounters}>
            <div className={s.label}>Inline Highlight Overlays in Editor</div>
            <button
              type="button"
              className={`${s.highlightToggle} ${s.hlVeryHard} ${highlightToggles.veryHard ? s.hlActive : ""}`}
              onClick={() => onToggleHighlight("veryHard")}
            >
              <span className={s.hlCountBadge}>{countFlagged("veryHard")}</span>
              <span>Very hard sentences (split or simplify)</span>
            </button>
            <button
              type="button"
              className={`${s.highlightToggle} ${s.hlHard} ${highlightToggles.hard ? s.hlActive : ""}`}
              onClick={() => onToggleHighlight("hard")}
            >
              <span className={s.hlCountBadge}>{countFlagged("hard")}</span>
              <span>Hard-to-read sentences (22+ words)</span>
            </button>
            <button
              type="button"
              className={`${s.highlightToggle} ${s.hlPassive} ${highlightToggles.passive ? s.hlActive : ""}`}
              onClick={() => onToggleHighlight("passive")}
            >
              <span className={s.hlCountBadge}>{countFlagged("passive")}</span>
              <span>Passive voice constructions</span>
            </button>
            <button
              type="button"
              className={`${s.highlightToggle} ${s.hlSimpler} ${highlightToggles.simpler ? s.hlActive : ""}`}
              onClick={() => onToggleHighlight("simpler")}
            >
              <span className={s.hlCountBadge}>
                {countFlagged("simpler") + countFlagged("weakener")}
              </span>
              <span>Wordy phrases &amp; weak qualifiers</span>
            </button>
          </div>

          <div className={s.seoBlock}>
            <div className={s.seoBlockHeader}>
              <strong>Human Burstiness &amp; Sentence Rhythm</strong>
              <span>{burstiness.burstinessScore}/100 · &sigma;={burstiness.stdDev}w</span>
            </div>
            <div className={s.rhythmBandBar} aria-hidden>
              <div
                className={s.rhythmBandShort}
                style={{ width: `${Math.max(8, burstiness.shortPct)}%` }}
                title={`Short sentences (<=11w): ${burstiness.shortPct}%`}
              />
              <div
                className={s.rhythmBandMed}
                style={{ width: `${Math.max(8, burstiness.mediumPct)}%` }}
                title={`Medium sentences (12-20w): ${burstiness.mediumPct}%`}
              />
              <div
                className={s.rhythmBandLong}
                style={{ width: `${Math.max(4, burstiness.longPct)}%` }}
                title={`Long sentences (>=21w): ${burstiness.longPct}%`}
              />
            </div>
            <div className={s.rhythmLegendRow}>
              <span>Short (&le;11w): <strong>{burstiness.shortPct}%</strong></span>
              <span>Med (12–20w): <strong>{burstiness.mediumPct}%</strong></span>
              <span>Long (&ge;21w): <strong>{burstiness.longPct}%</strong></span>
            </div>
            <div className={s.leftMetaSub}>
              {burstiness.clichesFound.length === 0
                ? `Zero AI clichés detected · ${burstiness.monotoneRuns} monotone runs`
                : `Flagged clichés: ${burstiness.clichesFound.join(", ")}`}
            </div>
          </div>

          <div className={s.readabilityStructureList}>
            <div>Paragraphs: <strong>{docAnalysis.paragraphs}</strong></div>
            <div>Lists: <strong>{docAnalysis.listItems}</strong></div>
            <div>Headings: <strong>{docAnalysis.headings}</strong></div>
            <div>Longest sentence: <strong>{docAnalysis.longestSentenceWords}w</strong></div>
          </div>

          {onQuickReadabilityPolish ? (
            <button
              type="button"
              className={`${s.btn} ${s.primary} ${s.fullWidthBtn}`}
              onClick={onQuickReadabilityPolish}
            >
              <Zap className="w-4 h-4" aria-hidden /> Instant Auto-Polish Rhythm, Clichés &amp; Headings
            </button>
          ) : null}

          {countFlagged("veryHard") + countFlagged("hard") > 0 ? (
            <button
              type="button"
              className={`${s.btn} ${s.fullWidthBtn}`}
              disabled={aiRevisionState.busy}
              onClick={() => {
                onChangeTab("helper");
                onRunAiHelper(
                  `Improve readability to Grade ${targetGrade}: shorten sentences over 18 words, add bullet points with bold lead-ins, keep all ## and ### headings on their own lines, and preserve all facts.`,
                  "article",
                );
              }}
            >
              <Wand2 className="w-4 h-4" aria-hidden /> Simplify Dense Prose with AI
            </button>
          ) : null}
        </div>
      ) : null}

      {activeTab === "seo" ? (
        <div className={s.panelSection}>
          <div className={s.seoBlock}>
            <div className={s.seoBlockHeader}>
              <strong>Keyword &amp; Entity Coverage</strong>
              {onRunResearch ? (
                <button
                  type="button"
                  className={s.inlineRefreshBtn}
                  disabled={researchBusy}
                  onClick={onRunResearch}
                >
                  {researchBusy ? "Scanning..." : "Refresh Research"}
                </button>
              ) : null}
            </div>
            {kw ? (
              <div className={s.primaryKwStatus}>
                <span
                  className={
                    lowerMd.includes(kw.toLowerCase()) ? s.kwHitBadge : s.kwMissBadge
                  }
                >
                  {lowerMd.includes(kw.toLowerCase()) ? "Covered" : "Missing"}
                </span>
                <span>{kw}</span>
              </div>
            ) : (
              <div className={s.leftMetaSub}>No focus keyword set yet.</div>
            )}

            <div className={s.leftScoreProgressWrap}>
              <div className={s.leftScoreProgressLabels}>
                <span>Semantic Entity Coverage</span>
                <strong>{keywordCoveragePct}%</strong>
              </div>
              <div className={s.scoreGaugeTrack} aria-hidden>
                <div
                  className={
                    keywordCoveragePct >= 65
                      ? s.scoreGaugeFillGood
                      : s.scoreGaugeFillWarn
                  }
                  style={{ width: `${Math.max(6, keywordCoveragePct)}%` }}
                />
              </div>
            </div>

            {secondaryKws.length ? (
              <div className={s.entityCloud}>
                {secondaryKws.slice(0, 14).map((term) => {
                  const hit = lowerMd.includes(term.toLowerCase());
                  return (
                    <span
                      key={term}
                      className={`${s.entityPill} ${hit ? s.entityHit : s.entityMiss}`}
                      title={hit ? "Used in article" : "Consider weaving naturally"}
                    >
                      {hit ? "✓ " : "+ "}
                      {term}
                    </span>
                  );
                })}
              </div>
            ) : null}
          </div>

          <div className={s.seoBlock}>
            <div className={s.seoBlockHeader}>
              <strong>Entity Salience &amp; Question-Heading AEO</strong>
              <span>{salienceAudit.salienceScore}% salience</span>
            </div>
            <div className={s.leftScoreProgressWrap}>
              <div className={s.leftScoreProgressLabels}>
                <span>Google NLP Subject Salience &amp; Entity Spread</span>
                <strong>{salienceAudit.salienceScore}/100</strong>
              </div>
              <div className={s.scoreGaugeTrack} aria-hidden>
                <div
                  className={
                    salienceAudit.salienceScore >= 75
                      ? s.scoreGaugeFillGood
                      : s.scoreGaugeFillWarn
                  }
                  style={{ width: `${Math.max(8, salienceAudit.salienceScore)}%` }}
                />
              </div>
            </div>
            <div className={s.snippetBadgeRow}>
              <span className={`${s.snippetFormatPill} ${salienceAudit.inH1 ? s.snippetFormatPillOn : ""}`}>
                {salienceAudit.inH1 ? "✓ H1 Entity" : "○ H1 Entity"}
              </span>
              <span className={`${s.snippetFormatPill} ${salienceAudit.inOpeningSentence ? s.snippetFormatPillOn : ""}`}>
                {salienceAudit.inOpeningSentence ? "✓ 1st Sentence SPO" : "○ 1st Sentence SPO"}
              </span>
              <span className={`${s.snippetFormatPill} ${salienceAudit.inFirst60Words ? s.snippetFormatPillOn : ""}`}>
                {salienceAudit.inFirst60Words ? "✓ First 60w" : "○ First 60w"}
              </span>
              <span className={`${s.snippetFormatPill} ${salienceAudit.questionRatioOptimal ? s.snippetFormatPillOn : ""}`}>
                H2 Questions: {salienceAudit.questionH2Count}/{salienceAudit.totalH2Count} ({salienceAudit.questionHeadingRatioPct}%)
              </span>
            </div>
            {onConvertH2sToQuestions &&
            salienceAudit.totalH2Count > 0 &&
            salienceAudit.questionHeadingRatioPct < 35 ? (
              <button
                type="button"
                className={`${s.btn} ${s.primary} ${s.fullWidthBtn}`}
                onClick={onConvertH2sToQuestions}
              >
                <Zap className="w-3.5 h-3.5" aria-hidden /> Convert H2s to AEO Question Headings (0 Tokens)
              </button>
            ) : null}
          </div>

          <div className={s.seoBlock}>
            <div className={s.seoBlockHeader}>
              <strong>Content Freshness &amp; Anti-Decay Audit</strong>
              <span>{freshnessAudit.freshnessScore}/100 fresh</span>
            </div>
            <div className={s.leftScoreProgressWrap}>
              <div className={s.leftScoreProgressLabels}>
                <span>AI Citation Recency &amp; First-30% Extractability</span>
                <strong>{freshnessAudit.freshnessScore}%</strong>
              </div>
              <div className={s.scoreGaugeTrack} aria-hidden>
                <div
                  className={
                    freshnessAudit.freshnessScore >= 80
                      ? s.scoreGaugeFillGood
                      : s.scoreGaugeFillWarn
                  }
                  style={{ width: `${Math.max(8, freshnessAudit.freshnessScore)}%` }}
                />
              </div>
            </div>
            <div className={s.snippetBadgeRow}>
              <span className={`${s.snippetFormatPill} ${freshnessAudit.frontLoadedCitationReady ? s.snippetFormatPillOn : ""}`}>
                {freshnessAudit.frontLoadedCitationReady ? "✓ First-30% Answer" : "○ First-30% Answer"}
              </span>
              <span className={`${s.snippetFormatPill} ${freshnessAudit.hasCurrentYearSignal ? s.snippetFormatPillOn : ""}`}>
                {freshnessAudit.hasCurrentYearSignal ? "✓ 2026 Recency" : "○ 2026 Recency"}
              </span>
              <span className={`${s.snippetFormatPill} ${freshnessAudit.hasComparisonTable ? s.snippetFormatPillOn : ""}`}>
                {freshnessAudit.hasComparisonTable ? "✓ Matrix Table" : "○ Matrix Table"}
              </span>
              <span className={`${s.snippetFormatPill} ${freshnessAudit.staleYearsFound.length === 0 ? s.snippetFormatPillOn : ""}`}>
                {freshnessAudit.staleYearsFound.length === 0
                  ? "✓ Zero Stale Years"
                  : `Stale: ${freshnessAudit.staleYearsFound.join(", ")}`}
              </span>
            </div>
            {onApplyContentRefresh && freshnessAudit.freshnessScore < 100 ? (
              <button
                type="button"
                className={`${s.btn} ${s.primary} ${s.fullWidthBtn}`}
                onClick={onApplyContentRefresh}
              >
                <Zap className="w-3.5 h-3.5" aria-hidden /> Run 1-Click Content Refresh &amp; Decay Upgrade
              </button>
            ) : null}
          </div>

          <div className={s.seoBlock}>
            <div className={s.seoBlockHeader}>
              <strong>
                <Link2 className="w-3.5 h-3.5 inline mr-1" aria-hidden />
                Verified Internal Links ({internalLinks.length})
              </strong>
              <span className={s.leftMetaSub}>
                {(() => {
                  if (!project.brandSiteUrl) return "doitwithai.tools";
                  try {
                    return new URL(
                      /^https?:\/\//i.test(project.brandSiteUrl)
                        ? project.brandSiteUrl
                        : `https://${project.brandSiteUrl}`,
                    ).hostname;
                  } catch {
                    return project.brandSiteUrl;
                  }
                })()}
              </span>
            </div>
            {onAutoWeaveInternalLinks &&
            internalLinks.some((l) => !md.includes(l.url)) ? (
              <button
                type="button"
                className={`${s.btn} ${s.primary} ${s.fullWidthBtn}`}
                onClick={onAutoWeaveInternalLinks}
              >
                <Zap className="w-3.5 h-3.5" aria-hidden /> Auto-Weave Unlinked Internal Links in Body
              </button>
            ) : null}
            {internalLinks.length ? (
              <div className={s.linkSuggestionList}>
                {internalLinks.map((link) => {
                  const alreadyInDraft = md.includes(link.url);
                  const contextOpp = linkOpportunities.find(
                    (o) => o.url === link.url,
                  );
                  return (
                    <div key={link.url} className={s.linkCard}>
                      <div className={s.linkCardTop}>
                        <strong>{link.title}</strong>
                        <span className={alreadyInDraft ? s.kwHitBadge : s.linkNewBadge}>
                          {alreadyInDraft ? "Linked" : "Ready"}
                        </span>
                      </div>
                      <div className={s.linkUrlText}>{link.url}</div>
                      {!alreadyInDraft && contextOpp ? (
                        <div className={s.linkContextMatchBox}>
                          <span>
                            Context match in <strong>{contextOpp.sectionHeading}</strong>:
                          </span>
                          <em>&ldquo;{contextOpp.sentencePreview}&rdquo;</em>
                        </div>
                      ) : null}
                      <div className={s.linkActionDualRow}>
                        <button
                          type="button"
                          className={s.insertLinkBtn}
                          onClick={() => onInsertLink(link.anchor || link.title, link.url)}
                        >
                          Insert [{link.anchor || link.title}]
                        </button>
                        <button
                          type="button"
                          className={s.insertLinkBtn}
                          onClick={() =>
                            onInsertLink(
                              `__MD_BLOCK__:> **Related Tool:** Explore [${link.title}](${link.url}) to apply this workflow step by step.`,
                              link.url,
                            )
                          }
                        >
                          + Context Callout
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className={s.leftMetaSub}>
                Click <strong>Refresh Research</strong> above to discover verified internal pages to interlink.
              </p>
            )}
          </div>

          <div className={s.seoBlock}>
            <div className={s.seoBlockHeader}>
              <strong>
                <ExternalLink className="w-3.5 h-3.5 inline mr-1" aria-hidden />
                Authority External References ({externalLinks.length})
              </strong>
            </div>
            {externalLinks.length ? (
              <div className={s.linkSuggestionList}>
                {externalLinks.slice(0, 6).map((ext) => {
                  const alreadyCited = md.includes(ext.url);
                  return (
                    <div key={ext.url} className={s.linkCard}>
                      <div className={s.linkCardTop}>
                        <strong>{ext.title}</strong>
                        <span className={alreadyCited ? s.kwHitBadge : s.linkNewBadge}>
                          {alreadyCited ? "Cited" : "Verified"}
                        </span>
                      </div>
                      <div className={s.linkUrlText}>{ext.url}</div>
                      <div className={s.linkActionDualRow}>
                        <button
                          type="button"
                          className={s.insertLinkBtn}
                          onClick={() => onInsertLink(ext.title, ext.url)}
                        >
                          Cite inline link
                        </button>
                        <button
                          type="button"
                          className={s.insertLinkBtn}
                          onClick={() =>
                            onInsertLink(
                              `__MD_BLOCK__:> **Authority Citation:** According to [${ext.title}](${ext.url}), aligning technical structure and people-first clarity strengthens search visibility.`,
                              ext.url,
                            )
                          }
                        >
                          + Cited Callout
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className={s.leftMetaSub}>
                Click <strong>Refresh Research</strong> to load verified authority citations.
              </p>
            )}
          </div>

          <div className={s.seoBlock}>
            <div className={s.seoBlockHeader}>
              <strong>Information Gain &amp; E-E-A-T Angles ({infoGainAngles.length})</strong>
              <span>{subtopicGaps.coverageScore}% subtopics</span>
            </div>
            {subtopicGaps.totalTargets > 0 ? (
              <div className={s.leftScoreProgressWrap}>
                <div className={s.leftScoreProgressLabels}>
                  <span>Research Subtopic &amp; Question Coverage</span>
                  <strong>
                    {subtopicGaps.coveredCount}/{subtopicGaps.totalTargets} covered
                  </strong>
                </div>
                <div className={s.scoreGaugeTrack} aria-hidden>
                  <div
                    className={
                      subtopicGaps.coverageScore >= 75
                        ? s.scoreGaugeFillGood
                        : s.scoreGaugeFillWarn
                    }
                    style={{ width: `${Math.max(8, subtopicGaps.coverageScore)}%` }}
                  />
                </div>
              </div>
            ) : null}
            {onInjectUncoveredQuestions && subtopicGaps.uncoveredQuestions.length > 0 ? (
              <button
                type="button"
                className={`${s.btn} ${s.primary} ${s.fullWidthBtn}`}
                onClick={onInjectUncoveredQuestions}
              >
                <Zap className="w-3.5 h-3.5" aria-hidden /> + Add {subtopicGaps.uncoveredQuestions.length} Uncovered Research Question{subtopicGaps.uncoveredQuestions.length === 1 ? "" : "s"} to FAQ
              </button>
            ) : null}
            {infoGainAngles.length ? (
              <div className={s.infoGainList}>
                {infoGainAngles.map((item, idx) => (
                  <div key={`${item.tag}-${idx}`} className={s.infoGainCard}>
                    <div className={s.infoGainTop}>
                      <span className={s.infoGainTag}>{item.tag}</span>
                    </div>
                    <div>{item.text}</div>
                    <div className={s.linkActionDualRow}>
                      <button
                        type="button"
                        className={s.insertLinkBtn}
                        onClick={() =>
                          onInsertLink(
                            `__MD_BLOCK__:> **${item.tag} Insight:** ${item.text}`,
                            "https://doitwithai.tools",
                          )
                        }
                      >
                        + Insert Callout
                      </button>
                      <button
                        type="button"
                        className={s.insertLinkBtn}
                        onClick={() => {
                          onChangeTab("helper");
                          onRunAiHelper(
                            `Weave this specific Information Gain / E-E-A-T angle naturally into the article with a concrete practical example: "${item.text}"`,
                            "article",
                          );
                        }}
                      >
                        Weave with AI
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className={s.leftMetaSub}>
                Click <strong>Refresh Research</strong> to generate unique Information Gain angles and E-E-A-T proof cues.
              </p>
            )}
          </div>

          <div className={s.seoBlock}>
            <div className={s.seoBlockHeader}>
              <strong>Claim &amp; Citation Fact-Check Guardrail</strong>
              <span>{claimAudit.groundingScore}% grounded</span>
            </div>
            <div className={s.leftScoreProgressWrap}>
              <div className={s.leftScoreProgressLabels}>
                <span>Quantitative &amp; Research Claim Grounding</span>
                <strong>
                  {claimAudit.citedClaims}/{claimAudit.totalClaims} cited
                </strong>
              </div>
              <div className={s.scoreGaugeTrack} aria-hidden>
                <div
                  className={
                    claimAudit.groundingScore >= 80
                      ? s.scoreGaugeFillGood
                      : s.scoreGaugeFillWarn
                  }
                  style={{ width: `${Math.max(8, claimAudit.groundingScore)}%` }}
                />
              </div>
            </div>
            {claimAudit.unverifiedClaims.length ? (
              <div className={s.infoGainList}>
                {claimAudit.unverifiedClaims.map((uc, idx) => (
                  <div key={idx} className={s.claimAuditCard}>
                    <strong>Unlinked Claim #{idx + 1}</strong>
                    <span className={s.claimAuditQuote}>&ldquo;{uc.sentence}&rdquo;</span>
                    <small className={s.checkItemDetail}>{uc.cue}</small>
                    <button
                      type="button"
                      className={s.insertLinkBtn}
                      onClick={() => {
                        onChangeTab("helper");
                        onRunAiHelper(
                          `Review this sentence for E-E-A-T accuracy: "${uc.sentence}". Either attribute it to one of our verified external references via Markdown [Source](url) or rephrase it into an honest, verifiable practitioner observation without invented statistics.`,
                          "article",
                        );
                      }}
                    >
                      Verify or Soften Claim with AI
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <p className={s.leftMetaSub}>
                Zero unlinked statistical or research claims detected in your draft.
              </p>
            )}
          </div>

          <div className={s.seoBlock}>
            <div className={s.seoBlockHeader}>
              <strong>Section AEO Snippet &amp; Format Readiness</strong>
              <span>{snippetAudit.snippetReadyCount}/{snippetAudit.totalSections} ready</span>
            </div>
            <div className={s.leftScoreProgressWrap}>
              <div className={s.leftScoreProgressLabels}>
                <span>40–60w Direct Answer &amp; Structural Format Score</span>
                <strong>{snippetAudit.averageScore}%</strong>
              </div>
              <div className={s.scoreGaugeTrack} aria-hidden>
                <div
                  className={
                    snippetAudit.averageScore >= 75
                      ? s.scoreGaugeFillGood
                      : s.scoreGaugeFillWarn
                  }
                  style={{ width: `${Math.max(8, snippetAudit.averageScore)}%` }}
                />
              </div>
            </div>
            {snippetAudit.sections.length ? (
              <div className={s.infoGainList}>
                {snippetAudit.sections.map((sec, idx) => (
                  <div key={sec.id || idx} className={s.snippetSectionCard}>
                    <div className={s.linkCardTop}>
                      <strong>H2 #{idx + 1}: {sec.h2}</strong>
                      <span
                        className={
                          sec.leadStatus === "optimal" ? s.kwHitBadge : s.linkNewBadge
                        }
                      >
                        {sec.leadWords}w lead ·{" "}
                        {sec.leadStatus === "optimal"
                          ? "Optimal 40-60w"
                          : sec.leadStatus === "short"
                            ? "Expand to 40-60w"
                            : "Trim to 40-60w"}
                      </span>
                    </div>
                    <div className={s.snippetBadgeRow}>
                      <span className={`${s.snippetFormatPill} ${sec.hasList ? s.snippetFormatPillOn : ""}`}>
                        {sec.hasList ? "✓ List" : "○ List"}
                      </span>
                      <span className={`${s.snippetFormatPill} ${sec.hasTable ? s.snippetFormatPillOn : ""}`}>
                        {sec.hasTable ? "✓ Table" : "○ Table"}
                      </span>
                      <span className={`${s.snippetFormatPill} ${sec.hasCallout ? s.snippetFormatPillOn : ""}`}>
                        {sec.hasCallout ? "✓ Callout" : "○ Callout"}
                      </span>
                      <span className={`${s.snippetFormatPill} ${sec.hasCitation ? s.snippetFormatPillOn : ""}`}>
                        {sec.hasCitation ? "✓ Cited" : "○ Cited"}
                      </span>
                    </div>
                    <div className={s.linkActionDualRow}>
                      <button
                        type="button"
                        className={s.insertLinkBtn}
                        onClick={() => {
                          onChangeTab("helper");
                          onRunAiHelper(
                            `In H2 section "${sec.h2}", rewrite the opening paragraph immediately beneath the H2 into a direct, self-contained 45 to 55 word answer paragraph (inverted pyramid, zero throat-clearing) while keeping all ### subheadings, bullet lists, and links intact.`,
                            "article",
                          );
                        }}
                      >
                        Optimize 40–60w Lead
                      </button>
                      <button
                        type="button"
                        className={s.insertLinkBtn}
                        onClick={() =>
                          onInsertLink(
                            `__MD_BLOCK__:| ${sec.h2.slice(0, 32)} Dimension | Common Pitfall | Snippet-Ready Best Practice |\n| --- | --- | --- |\n| Opening Answer | Burying the answer after filler | State a 40–60 word direct answer first |\n| Structural Format | Long unstructured paragraphs | Pair bullet lists with a comparison table |\n| Proof & Grounding | Unlinked claims | Cite verified primary documentation |`,
                            "https://doitwithai.tools",
                          )
                        }
                      >
                        + Comparison Table
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : null}
          </div>

          <div className={s.seoBlock}>
            <div className={s.seoBlockHeader}>
              <strong>FAQ &amp; People Also Ask (PAA) Readiness</strong>
              <span>
                {faqPaaAudit.optimalCount}/{faqPaaAudit.totalFaqs} PAA-ready
              </span>
            </div>
            <div className={s.leftScoreProgressWrap}>
              <div className={s.leftScoreProgressLabels}>
                <span>35–55w Voice &amp; AI Overview Answer Score</span>
                <strong>{faqPaaAudit.paaReadyScore}%</strong>
              </div>
              <div className={s.scoreGaugeTrack} aria-hidden>
                <div
                  className={
                    faqPaaAudit.paaReadyScore >= 75
                      ? s.scoreGaugeFillGood
                      : s.scoreGaugeFillWarn
                  }
                  style={{ width: `${Math.max(6, faqPaaAudit.paaReadyScore)}%` }}
                />
              </div>
            </div>
            <div className={s.leftMetaSub}>
              {faqPaaAudit.totalFaqs === 0
                ? "Add FAQ items below the editor to capture Google People Also Ask and FAQPage rich results."
                : `${faqPaaAudit.optimalCount} of ${faqPaaAudit.totalFaqs} FAQ answers are in the 30–60 word PAA extraction window.`}
            </div>
            {onNormalizeFaqsPaa &&
            faqPaaAudit.totalFaqs > 0 &&
            faqPaaAudit.optimalCount < faqPaaAudit.totalFaqs ? (
              <button
                type="button"
                className={`${s.btn} ${s.primary} ${s.fullWidthBtn}`}
                onClick={onNormalizeFaqsPaa}
              >
                <Zap className="w-3.5 h-3.5" aria-hidden /> Normalize FAQs to 35–55w PAA Window
              </button>
            ) : null}
          </div>

          <div className={s.seoBlock}>
            <div className={s.seoBlockHeader}>
              <strong>Readiness &amp; Schema Checklist</strong>
              <span>{r.score}/100</span>
            </div>
            <div className={s.checklist}>
              {r.checks.map((c) => {
                const itemPct = c.ok ? 100 : r.words > 0 ? 38 : 0;
                return (
                  <div key={c.id} className={s.checkItemCard}>
                    <div className={s.checkItemHeader}>
                      <div className={s.checkItemTitleWrap}>
                        <span className={c.ok ? s.okDot : s.warnDot} />
                        <strong>{c.label}</strong>
                      </div>
                      <span className={c.ok ? s.checkPtsGood : s.checkPtsWarn}>
                        {c.ok ? `${c.weight}/${c.weight} pts` : `0/${c.weight} pts`}
                      </span>
                    </div>
                    <small className={s.checkItemDetail}>{c.detail}</small>
                    <div className={s.checkMiniBarTrack} aria-hidden>
                      <div
                        className={c.ok ? s.scoreGaugeFillGood : s.scoreGaugeFillWarn}
                        style={{ width: `${itemPct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      ) : null}
    </aside>
  );
}
