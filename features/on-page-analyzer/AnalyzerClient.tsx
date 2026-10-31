"use client";
import ToolUrlInput from "@/features/tool-ui/ToolUrlInput";
import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  ArrowUpRight,
  Check,
  CheckCircle2,
  ChevronRight,
  CircleHelp,
  Clipboard,
  Download,
  FileCode2,
  Globe2,
  LayoutDashboard,
  Link2,
  ListTree,
  Loader2,
  Monitor,
  PencilLine,
  Play,
  RotateCcw,
  Search,
  ShieldCheck,
  Smartphone,
  Sparkles,
  TriangleAlert,
  X,
} from "lucide-react";
import {
  applyDraft,
  auditPage,
  changesCsv,
  phraseCount,
  summarize,
  words,
} from "./audit";
import {
  SECTIONS,
  STATUS_LABEL,
  type Change,
  type Finding,
  type PageSnapshot,
  type Section,
  type Status,
} from "./types";
import { EXAMPLE_HTML } from "./example";
import styles from "./analyzer.module.css";
import ScoreGauge from "./ScoreGauge";
import SchemaPanel from "@/features/schema-inspector/SchemaPanel";
import AnswerReadinessPanel from "./AnswerReadinessPanel";
import {
  CategoryReport,
  SectionScore,
  ContentReport,
  SocialPreview,
  TechnicalReport,
  EvidenceReviewScope,
} from "./ReportPanels";
import SearchAppearance from "./SearchAppearance";
import { sectionHash, sectionFromHash } from "./navigation";
import { categoryScores } from "./scoring";
import { tools } from "@/features/tool-catalog/catalog";
import { linkReport } from "./metrics";
import type { EditorialReview } from "./review";
import { sampleOpeningReviewBlocks } from "./audit";

type Editor = {
  field: string;
  label: string;
  value: string;
  kind: "title" | "description" | "heading" | "passage" | "alt" | "schema";
};
const icons = [
  LayoutDashboard,
  Search,
  ListTree,
  PencilLine,
  Link2,
  Globe2,
  ShieldCheck,
  FileCode2,
  Sparkles,
];
const statusOrder: Record<Status, number> = {
  critical: 0,
  warning: 1,
  unchecked: 2,
  info: 3,
  passed: 4,
};
function download(name: string, content: string, mime: string) {
  const blob = new Blob([content], { type: mime }),
    url = URL.createObjectURL(blob),
    anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = name;
  anchor.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
function Badge({ status }: { status: Status }) {
  return (
    <span className={`${styles.badge} ${styles[status]}`}>
      {status === "passed" ? (
        <Check size={12} />
      ) : status === "critical" || status === "warning" ? (
        <TriangleAlert size={12} />
      ) : (
        <CircleHelp size={12} />
      )}
      {STATUS_LABEL[status]}
    </span>
  );
}
export default function AnalyzerClient() {
  const [source, setSource] = useState<"url" | "paste">("url"),
    [url, setUrl] = useState(""),
    [html, setHtml] = useState("");
  const [keyword, setKeyword] = useState(""),
    [audience, setAudience] = useState("");
  const [secondary, setSecondary] = useState(""),
    [related, setRelated] = useState(""),
    [targetGrade, setTargetGrade] = useState(9);
  const [page, setPage] = useState<PageSnapshot | null>(null),
    [changes, setChanges] = useState<Change[]>([]);
  const [mode, setMode] = useState<"audit" | "improve">("audit"),
    [section, setSection] = useState<Section>("overview"),
    [filter, setFilter] = useState("all");
  const [loading, setLoading] = useState(false),
    [error, setError] = useState(""),
    [notice, setNotice] = useState("");
  const [editor, setEditor] = useState<Editor | null>(null),
    [edited, setEdited] = useState(""),
    [editError, setEditError] = useState("");
  const [suggesting, setSuggesting] = useState(false),
    [suggestions, setSuggestions] = useState<
      { text: string; reason: string }[]
    >([]),
    [imageContext, setImageContext] = useState("");
  const [methodology, setMethodology] = useState(false);
  const [review, setReview] = useState<{
    result: EditorialReview;
    fingerprint: string;
    blocks: number;
  } | null>(null);
  const [reviewBusy, setReviewBusy] = useState(false),
    [reviewError, setReviewError] = useState("");
  const reviewRef = useRef<AbortController | null>(null);
  const requestRef = useRef<AbortController | null>(null),
    suggestRef = useRef<AbortController | null>(null),
    editorRef = useRef<HTMLTextAreaElement>(null),
    openerRef = useRef<HTMLElement | null>(null),
    drawerRef = useRef<HTMLElement>(null),
    reportRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLDivElement>(null);
  const pendingNavigation = useRef(false);
  const importScroll = useRef<ReturnType<typeof setTimeout> | null>(null);
  const draft = useMemo(
    () => (page ? applyDraft(page, changes) : null),
    [page, changes],
  );
  const active = mode === "improve" ? draft : page;
  const findings = useMemo(
    () => (active ? auditPage(active, keyword, targetGrade) : []),
    [active, keyword, targetGrade],
  );
  const summary = summarize(findings);
  const categorySummaries = categoryScores(findings);
  const reviewFingerprint = useMemo(
    () => JSON.stringify({ blocks: active?.blocks, keyword, audience }),
    [active, keyword, audience],
  );
  const originalSummary = useMemo(
    () => summarize(page ? auditPage(page, keyword, targetGrade) : []),
    [page, keyword, targetGrade],
  );
  const visible = findings
    .filter(
      (f) =>
        (section === "overview"
          ? f.status === "critical" || f.status === "warning"
          : f.section === section) &&
        (filter === "all" || f.status === filter),
    )
    .sort((a, b) => statusOrder[a.status] - statusOrder[b.status]);
  const headings = active?.blocks.filter((b) => /^h[1-6]$/.test(b.tag)) || [];
  function scrollToCategory(target: Section = section) {
    const pane = target === "overview" ? reportRef.current : canvasRef.current;
    if (!pane) return;
    pane.focus({ preventScroll: true });
    pane.scrollIntoView({
      block: "start",
      behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches
        ? "auto"
        : "smooth",
    });
  }
  function navigateSection(next: Section, updateHistory = true) {
    if (importScroll.current) clearTimeout(importScroll.current);
    setFilter("all");
    if (updateHistory && window.location.hash !== sectionHash(next))
      window.history.pushState(window.history.state, "", sectionHash(next));
    if (next === section) {
      requestAnimationFrame(() => scrollToCategory(next));
      return;
    }
    pendingNavigation.current = true;
    setSection(next);
  }
  useLayoutEffect(() => {
    if (!pendingNavigation.current || !active) return;
    pendingNavigation.current = false;
    scrollToCategory(section);
  }, [section, active]);
  useEffect(() => {
    const restore = () => {
      const next = sectionFromHash(window.location.hash) || "overview";
      pendingNavigation.current = true;
      setSection(next);
      setFilter("all");
    };
    const initial = sectionFromHash(window.location.hash);
    if (initial) setSection(initial);
    window.addEventListener("popstate", restore);
    window.addEventListener("hashchange", restore);
    return () => {
      window.removeEventListener("popstate", restore);
      window.removeEventListener("hashchange", restore);
    };
  }, []);
  useEffect(
    () => () => {
      requestRef.current?.abort();
      suggestRef.current?.abort();
      reviewRef.current?.abort();
      if (importScroll.current) clearTimeout(importScroll.current);
    },
    [],
  );
  useEffect(() => {
    if (!editor) return;
    editorRef.current?.focus();
  }, [editor]);
  useEffect(() => {
    if (!editor) return;
    const before = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        suggestRef.current?.abort();
        setEditor(null);
        openerRef.current?.focus({ preventScroll: true });
      }
      if (e.key === "Tab") {
        const nodes = Array.from(
          drawerRef.current?.querySelectorAll<HTMLElement>(
            "button:not([disabled]),textarea,input,a[href]",
          ) || [],
        );
        const first = nodes[0],
          last = nodes[nodes.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last?.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first?.focus();
        }
      }
    };
    document.addEventListener("keydown", handleKey);
    return () => {
      document.body.style.overflow = before;
      document.removeEventListener("keydown", handleKey);
    };
  }, [editor]);
  async function runAudit(example = false) {
    requestRef.current?.abort();
    suggestRef.current?.abort();
    reviewRef.current?.abort();
    setReviewBusy(false);
    const controller = new AbortController();
    requestRef.current = controller;
    setLoading(true);
    setError("");
    setNotice("");
    const currentUrl = example
      ? "https://example.com/content-planning"
      : url.trim();
    try {
      const response = await fetch("/api/ai-tools/on-page/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          url: currentUrl,
          html: example ? EXAMPLE_HTML : source === "paste" ? html : "",
        }),
        signal: controller.signal,
      });
      const data = await response.json();
      if (!response.ok)
        throw new Error(
          data.error?.message || "The page could not be analyzed.",
        );
      setPage(data.result);
      setChanges([]);
      setSection(sectionFromHash(window.location.hash) || "overview");
      setMode("audit");
      setFilter("all");
      setReview(null);
      setReviewError("");
      if (example)
        setNotice(
          "Example report. This sample contains intentional issues and an illustrative, unverified claim.",
        );
      else if (data.cached)
        setNotice(
          "Recent audit reused. URL imports may reuse results for up to two minutes.",
        );
      else
        setNotice(
          "Audit complete. Review the coverage and priority findings below.",
        );
      importScroll.current = setTimeout(
        () =>
          scrollToCategory(sectionFromHash(window.location.hash) || "overview"),
        80,
      );
    } catch (e) {
      if (!controller.signal.aborted)
        setError(
          e instanceof Error
            ? e.message
            : "The check could not be completed. Your previous report is preserved.",
        );
    } finally {
      if (!controller.signal.aborted) setLoading(false);
    }
  }
  function selectEditor(field: string, label: string, kind: Editor["kind"]) {
    if (!draft) return;
    suggestRef.current?.abort();
    setSuggesting(false);
    openerRef.current = document.activeElement as HTMLElement;
    const value =
      field === "title"
        ? draft.title
        : field === "description"
          ? draft.description
          : field.startsWith("image:")
            ? draft.images[Number(field.split(":")[1])]?.alt || ""
            : field.startsWith("schema:")
              ? draft.schemas.samples[Number(field.split(":")[1])] || ""
              : draft.blocks.find((b) => b.id === field)?.text || "";
    setEditor({ field, label, value, kind });
    setEdited(value);
    setSuggestions([]);
    setEditError("");
    setImageContext("");
    setMode("improve");
  }
  function editFinding(f: Finding) {
    if (!f.field || !draft) return;
    const block = draft.blocks.find((b) => b.id === f.field);
    selectEditor(
      f.field,
      f.field === "title"
        ? "Page title"
        : f.field === "description"
          ? "Meta description"
          : block
            ? `${block.tag.toUpperCase()} · ${block.text.slice(0, 60)}`
            : "Image alternative",
      f.field === "title"
        ? "title"
        : f.field === "description"
          ? "description"
          : f.field.startsWith("image:")
            ? "alt"
            : block && /^h/.test(block.tag)
              ? "heading"
              : "passage",
    );
  }
  function fieldLabel(field: string) {
    if (field === "title") return "Page title";
    if (field === "description") return "Meta description";
    if (field.startsWith("image:"))
      return `Image ${Number(field.split(":")[1]) + 1} alternative`;
    if (field.startsWith("schema-invalid:"))
      return `JSON-LD source correction ${Number(field.split(":")[1]) + 1}`;
    if (field.startsWith("schema:"))
      return `JSON-LD block ${Number(field.split(":")[1]) + 1}`;
    const level = field.startsWith("level:"),
      block = page?.blocks.find(
        (b) => b.id === (level ? field.slice(6) : field),
      );
    return block
      ? `${level ? "Heading level" : block.tag.toUpperCase() + " text"}: ${block.text.slice(0, 60)}`
      : "Content change";
  }
  function updateChange(field: string, value: string) {
    if (!page) return;
    const original =
      field === "title"
        ? page.title
        : field === "description"
          ? page.description
          : field.startsWith("image:")
            ? page.images[Number(field.split(":")[1])]?.alt || ""
            : field.startsWith("schema-invalid:")
              ? page.schemas.invalidSamples?.[Number(field.split(":")[1])]
                  ?.raw || ""
              : field.startsWith("schema:")
                ? page.schemas.samples[Number(field.split(":")[1])] || ""
                : field.startsWith("level:")
                  ? page.blocks.find((b) => b.id === field.slice(6))?.tag || ""
                  : page.blocks.find((b) => b.id === field)?.text || "";
    setChanges((previous) => [
      ...previous.filter((c) => c.field !== field),
      ...(original !== value
        ? [{ field, before: original, after: value }]
        : []),
    ]);
    setNotice(
      "Draft updated. Your live website has not changed. Export, publish in your editor, then recheck.",
    );
  }
  function applyEdit() {
    if (!editor) return;
    if (editor.kind !== "alt" && !edited.trim()) {
      setEditError("Add text before applying this change.");
      return;
    }
    if (editor.kind === "schema")
      try {
        const value = JSON.parse(edited);
        if (!value || typeof value !== "object") throw new Error();
      } catch {
        setEditError(
          "Enter a valid JSON object or array. Schema eligibility requires further validation.",
        );
        return;
      }
    updateChange(editor.field, edited.trim());
    closeEditor();
  }
  function closeEditor() {
    suggestRef.current?.abort();
    setEditor(null);
    setSuggesting(false);
    openerRef.current?.focus({ preventScroll: true });
  }
  async function suggest() {
    if (!editor || !draft || editor.kind === "schema") return;
    if (editor.kind === "alt" && imageContext.trim().length < 30) {
      setEditError(
        "Describe what the image shows and its purpose using at least 30 characters.",
      );
      return;
    }
    const controller = new AbortController();
    suggestRef.current?.abort();
    suggestRef.current = controller;
    setSuggesting(true);
    setEditError("");
    setSuggestions([]);
    const blockIndex = draft.blocks.findIndex((b) => b.id === editor.field);
    const surrounding =
      blockIndex >= 0
        ? draft.blocks.slice(Math.max(0, blockIndex - 1), blockIndex + 3)
        : draft.blocks.slice(0, 14);
    const context =
      `${draft.title}\n${draft.description}\n${editor.kind === "alt" ? imageContext : surrounding.map((b) => `${b.tag}: ${b.text}`).join("\n")}`.slice(
        0,
        6000,
      );
    try {
      const res = await fetch("/api/ai-tools/on-page/improve", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          kind: editor.kind,
          original: editor.value.slice(0, 12000),
          context,
          keyword,
          audience,
        }),
        signal: controller.signal,
      });
      const data = await res.json();
      if (!res.ok)
        throw new Error(
          data.error?.message || "Suggestions could not be completed.",
        );
      setSuggestions(data.result.options);
    } catch (e) {
      if (!controller.signal.aborted)
        setEditError(
          e instanceof Error
            ? e.message
            : "Suggestions are unavailable. You can still edit manually.",
        );
    } finally {
      if (!controller.signal.aborted) setSuggesting(false);
    }
  }
  async function reviewContent() {
    if (!active) return;
    const controller = new AbortController();
    reviewRef.current?.abort();
    reviewRef.current = controller;
    const fingerprint = reviewFingerprint,
      blocks = sampleOpeningReviewBlocks(active);
    if (!blocks.some((b) => !/^h[1-6]$/.test(b.tag))) {
      setReviewError(
        "No opening paragraphs were extracted. Import the rendered HTML before requesting a contextual review.",
      );
      return;
    }
    setReviewBusy(true);
    setReviewError("");
    try {
      const response = await fetch("/api/ai-tools/on-page/review", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: active.title,
          keyword,
          audience,
          blocks,
        }),
        signal: controller.signal,
      });
      const data = await response.json();
      if (!response.ok)
        throw new Error(data.error?.message || "Review unavailable.");
      setReview({
        result: data.result,
        fingerprint,
        blocks: data.sampledBlocks,
      });
    } catch (e) {
      if (!controller.signal.aborted)
        setReviewError(e instanceof Error ? e.message : "Review unavailable.");
    } finally {
      if (!controller.signal.aborted) setReviewBusy(false);
    }
  }
  const reportExport = () =>
    download(
      "on-page-seo-report.json",
      JSON.stringify(
        {
          version: 1,
          original: page,
          keyword,
          audience,
          secondary,
          related,
          targetGrade,
          categoryScores: categoryScores(findings),
          scoringCoverage: summary.coverage,
          findings: page ? auditPage(page, keyword, targetGrade) : [],
          proposedChanges: changes,
          draftFindings: draft ? auditPage(draft, keyword, targetGrade) : [],
          editorialReview:
            review?.fingerprint === reviewFingerprint ? review.result : null,
          note: "Draft changes have not been published. Scores reflect completed checks, not rankings.",
        },
        null,
        2,
      ),
      "application/json",
    );
  return (
    <div className={styles.app} id="on-page-analyzer">
      <section className={styles.inputCard} aria-label="Start a page audit">
        <div className={styles.panelTitle}>
          <div>
            <span className={styles.eyebrow}>Your page, under the lens</span>
            <h2>Start with one page.</h2>
          </div>
          <button
            className={styles.quiet}
            type="button"
            disabled={loading}
            onClick={() => runAudit(true)}
          >
            <Play size={15} />
            Try example
          </button>
        </div>
        <div className={styles.segment}>
          <button
            type="button"
            aria-pressed={source === "url"}
            onClick={() => setSource("url")}
          >
            <Globe2 size={16} />
            Page URL
          </button>
          <button
            type="button"
            aria-pressed={source === "paste"}
            onClick={() => setSource("paste")}
          >
            <FileCode2 size={16} />
            Paste HTML
          </button>
        </div>
        {!page && section !== "overview" && (
          <p className={styles.notice}>
            Selected report: {SECTIONS.find((s) => s.id === section)?.label}.
            Import a page to open this view. Audit data is not stored in the
            link.
          </p>
        )}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            runAudit();
          }}
        >
          <label className={styles.label} htmlFor="audit-url">
            {source === "url"
              ? "Public page URL"
              : "Page URL for resolving links (optional)"}
          </label>
          <div className={styles.urlRow}>
            <ToolUrlInput
              id="audit-url"
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              required={source === "url"}
              maxLength={2048}
              placeholder="https://your-website.com/article"
            />
            <button className={styles.primary} type="submit" disabled={loading}>
              {loading ? (
                <Loader2 size={18} className={styles.spin} />
              ) : (
                <Search size={18} />
              )}
              {loading ? "Analyzing page…" : "Analyze page"}
            </button>
          </div>
          {source === "paste" && (
            <>
              <label className={styles.label} htmlFor="audit-html">
                Page HTML
              </label>
              <textarea
                id="audit-html"
                className={styles.codeInput}
                required
                value={html}
                maxLength={750000}
                rows={6}
                onChange={(e) => setHtml(e.target.value)}
                placeholder="Paste the page HTML, including its head and main content."
              />
              <p className={styles.muted}>
                HTML is parsed without executing scripts. Live response and
                crawler checks require a URL import.
              </p>
            </>
          )}
          <details open className={styles.options}>
            <summary>
              Keyword and reader context{" "}
              <span>Optional, useful for targeted improvements</span>
            </summary>
            <div className={styles.contextGrid}>
              <label>
                Primary keyword
                <input
                  value={keyword}
                  onChange={(e) => setKeyword(e.target.value)}
                  maxLength={100}
                  placeholder="e.g. content planning"
                />
              </label>
              <label>
                Secondary keywords
                <input
                  value={secondary}
                  onChange={(e) => setSecondary(e.target.value)}
                  maxLength={600}
                  placeholder="Comma-separated supporting phrases"
                />
              </label>
              <label>
                Related topics and terms
                <input
                  value={related}
                  onChange={(e) => setRelated(e.target.value)}
                  maxLength={600}
                  placeholder="Comma-separated concepts to inspect"
                />
              </label>
              <label>
                Reading level
                <select
                  value={targetGrade}
                  onChange={(e) => setTargetGrade(Number(e.target.value))}
                >
                  <option value={9}>General readers</option>
                  <option value={11}>Professional readers</option>
                  <option value={13}>Technical readers</option>
                </select>
              </label>
              <label>
                Target reader
                <input
                  value={audience}
                  onChange={(e) => setAudience(e.target.value)}
                  maxLength={160}
                  placeholder="e.g. beginner content marketers"
                />
              </label>
            </div>
          </details>
        </form>
        {changes.length > 0 && (
          <p className={styles.muted}>
            Starting another audit replaces this draft. Export your changes
            first if you want to keep them.
          </p>
        )}
        {error && (
          <p className={styles.error} role="alert">
            {error}
          </p>
        )}
        {loading && (
          <div className={styles.progress} role="status">
            <div className={styles.scanLine} />
            <Loader2 className={styles.spin} size={22} />
            <div>
              <strong>Reading the page and organizing evidence</strong>
              <p>
                Extracting text, headings, links, and metadata. Large pages may
                return a clearly marked partial report.
              </p>
            </div>
          </div>
        )}
      </section>
      {!page && (
        <section
          className={styles.emptyGrid}
          aria-label="What your audit includes"
        >
          {[
            [
              Search,
              "Inspect the essentials",
              "Titles, headings, links, images, directives, and structured data in one report.",
            ],
            [
              PencilLine,
              "Improve with context",
              "Edit selected fields, compare suggestions, and keep a reviewable change list.",
            ],
            [
              ShieldCheck,
              "Know what was checked",
              "Clear evidence, visible coverage, and honest limits. No ranking promises.",
            ],
          ].map(([Icon, title, text]) => {
            const I = Icon as typeof Search;
            return (
              <div key={title as string}>
                <I size={22} />
                <h3>{title as string}</h3>
                <p>{text as string}</p>
              </div>
            );
          })}
        </section>
      )}
      {page && active && (
        <EvidenceReviewScope key={page.checkedAt}>
          <div
            ref={reportRef}
            tabIndex={-1}
            aria-label="Page audit overview"
            className={styles.report}
            aria-busy={loading}
          >
            <header className={styles.reportHeader}>
              <div className={styles.reportIdentity}>
                <span className={styles.eyebrow}>
                  {page.source === "paste" ? "HTML snapshot" : "Page audit"} ·{" "}
                  {page.partial ? "Partial coverage" : "Returned HTML"}
                </span>
                <h2>{page.title || "Your page audit"}</h2>
                <p>{page.url || "Pasted page HTML"}</p>
                <small>
                  Checked {new Date(page.checkedAt).toLocaleString()} ·{" "}
                  {page.scope}
                </small>
              </div>
              <div className={styles.headerActions}>
                <button
                  className={styles.quiet}
                  type="button"
                  onClick={reportExport}
                >
                  <Download size={15} />
                  Export report
                </button>
                <button
                  className={styles.quiet}
                  type="button"
                  onClick={() => setMethodology((v) => !v)}
                  aria-expanded={methodology}
                >
                  <CircleHelp size={15} />
                  How scoring works
                </button>
              </div>
            </header>
            {notice && (
              <p role="status" className={styles.notice}>
                {notice}
              </p>
            )}
            {page.warnings.map((w) => (
              <p key={w} className={styles.warningNote}>
                <TriangleAlert size={16} />
                {w}
              </p>
            ))}
            {methodology && (
              <div className={styles.method}>
                <h3>A checklist score, with visible limits</h3>
                <p>
                  Eight categories contribute up to 100 points. Within each
                  category, measured checks earn full points when passed, half
                  for warnings, and zero for critical findings.
                </p>
                <p>
                  Unknown checks earn no points and reduce visible coverage.
                  Scores use assessed weight only. Below 60% coverage, the
                  overall score is withheld.
                </p>
                <p>
                  Below 90% coverage, scores are provisional. Manual
                  acknowledgments never increase audit health. Product weights
                  are not Google ranking factors.
                </p>
                <p>
                  Blocked search crawler policies earn zero access points.
                  Training policies never change this score.
                </p>
                <div className={styles.weightList}>
                  {categorySummaries.map((c) => (
                    <span key={c.id}>
                      {c.label} <b>{c.weight} pts</b>
                    </span>
                  ))}
                </div>
              </div>
            )}
            <section
              className={styles.scoreHero}
              aria-label="Page audit summary"
            >
              <ScoreGauge
                score={summary.score}
                critical={summary.critical > 0}
              />
              <div>
                <span className={styles.eyebrow}>
                  {mode === "improve"
                    ? "Your working draft"
                    : "Your page audit"}
                </span>
                <h3>
                  {summary.critical
                    ? "Resolve the critical findings first."
                    : summary.score === null
                      ? "More evidence is needed."
                      : summary.score >= 80
                        ? "A good foundation to build on."
                        : summary.score >= 50
                          ? "Useful improvements are within reach."
                          : "Start with the essentials."}
                </h3>
                <p>
                  {mode === "improve"
                    ? `Draft estimate. Original snapshot: ${originalSummary.score ?? "not available"}/100.`
                    : "Your checklist score reflects completed checks. Inspect the evidence before making changes."}
                </p>
                <small>
                  {summary.coverage}% weighted coverage ·{" "}
                  {summary.provisional
                    ? "Provisional score"
                    : "Measured checklist"}{" "}
                  · {summary.assessed} of {summary.total} checks assessed ·{" "}
                  {page.partial ? "Partial extraction" : "Returned HTML"} ·
                  Rankings and AI citations are not predicted.
                </small>
              </div>
            </section>
            <div className={styles.metrics}>
              <div>
                <span>Needs attention</span>
                <strong className={styles.redText}>
                  {summary.critical}
                  <small> critical</small>
                </strong>
                <p>{summary.warnings} review item(s)</p>
              </div>
              <div>
                <span>Checks passed</span>
                <strong className={styles.greenText}>{summary.passed}</strong>
                <p>Inspect the evidence behind each result</p>
              </div>
              <div>
                <span>Coverage</span>
                <strong>
                  {summary.coverage}
                  <small>%</small>
                </strong>
                <p>
                  {summary.unchecked} not checked · {summary.informational}{" "}
                  informational · {page.partial ? "Partial page" : "HTML only"}
                </p>
              </div>
            </div>
            <CategoryReport
              findings={findings}
              active={section}
              onSelect={navigateSection}
            />
            <div className={styles.modeBar}>
              <div className={styles.segment}>
                <button
                  type="button"
                  onClick={() => {
                    setMode("audit");
                    setFilter("all");
                  }}
                  aria-pressed={mode === "audit"}
                >
                  <Search size={16} />
                  Audit
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setMode("improve");
                    setFilter("all");
                  }}
                  aria-pressed={mode === "improve"}
                >
                  <PencilLine size={16} />
                  Improve <span>{changes.length}</span>
                </button>
              </div>
              <p>
                {mode === "audit"
                  ? "Original page evidence. Start with the highest priority findings."
                  : "Working draft. Changes here do not update your live website."}
              </p>
            </div>
            <div className={styles.workspace}>
              <nav className={styles.auditNav} aria-label="Audit sections">
                {SECTIONS.map((s, i) => {
                  const I = icons[i],
                    count = findings.filter(
                      (f) =>
                        f.section === s.id &&
                        ["critical", "warning"].includes(f.status),
                    ).length;
                  return (
                    <button
                      key={s.id}
                      type="button"
                      aria-current={section === s.id ? "page" : undefined}
                      onClick={() => navigateSection(s.id)}
                    >
                      <I size={17} />
                      <span>
                        {s.label}
                        {s.id !== "overview" && (
                          <small className={styles.navScore}>
                            {categorySummaries.find((c) => c.id === s.id)
                              ?.score ?? "Not assessed"}
                            {categorySummaries.find((c) => c.id === s.id)
                              ?.score !== null
                              ? "/100"
                              : ""}
                          </small>
                        )}
                      </span>
                      {count > 0 && <b>{count}</b>}
                    </button>
                  );
                })}
                <div className={styles.navNote}>
                  <ShieldCheck size={18} />
                  <p>
                    Inspect evidence. Review changes. Verify after publishing.
                  </p>
                </div>
              </nav>
              <div
                ref={canvasRef}
                tabIndex={-1}
                className={styles.canvas}
                id="audit-category-content"
                aria-label={`${SECTIONS.find((s) => s.id === section)?.label} report`}
              >
                <span className={styles.srOnly} role="status">
                  Viewing {SECTIONS.find((s) => s.id === section)?.label}
                </span>
                {section !== "overview" && (
                  <SectionScore
                    category={categorySummaries.find((c) => c.id === section)!}
                    findings={findings.filter((f) => f.section === section)}
                  />
                )}

                {section === "overview" && (
                  <>
                    <div className={styles.sectionHeading}>
                      <div>
                        <span className={styles.eyebrow}>
                          Your next best actions
                        </span>
                        <h3>Start where it matters.</h3>
                      </div>
                      <span className={styles.muted}>
                        Priority reflects our checklist
                      </span>
                    </div>
                    <SearchAppearance page={active} keyword={keyword} />
                  </>
                )}
                {section === "search" && (
                  <>
                    <SearchAppearance page={active} keyword={keyword} />
                    <SocialPreview page={active} />
                    <div className={styles.quickFields}>
                      {[
                        ["title", "Page title", active.title],
                        ["description", "Meta description", active.description],
                      ].map(([field, label, text]) => (
                        <div key={field}>
                          <span className={styles.eyebrow}>{label}</span>
                          <p>{text || "Not found"}</p>
                          <button
                            className={styles.quiet}
                            type="button"
                            onClick={() =>
                              selectEditor(
                                field,
                                label,
                                field as "title" | "description",
                              )
                            }
                          >
                            <PencilLine size={14} />
                            Edit & compare
                          </button>
                        </div>
                      ))}
                    </div>
                  </>
                )}
                {section === "headings" && (
                  <section className={styles.outline}>
                    <div className={styles.panelTitle}>
                      <h3>Your heading hierarchy</h3>
                      <span>{headings.length} headings</span>
                    </div>
                    {headings.length ? (
                      headings.map((b, i) => (
                        <div
                          key={b.id}
                          className={`${styles.headingRow} ${b.tag === "h1" ? styles.mainHeading : ""}`}
                          style={
                            {
                              "--level": Number(b.tag[1]) - 1,
                            } as React.CSSProperties
                          }
                        >
                          <span className={styles.headingBadge}>
                            {b.tag.toUpperCase()}
                          </span>
                          <span className={styles.headingText}>
                            {b.tag !== "h1" && <ChevronRight size={14} />}
                            {b.text || "Empty heading"}
                          </span>
                          <span className={styles.headingNumber}>{i + 1}</span>
                          <button
                            type="button"
                            className={styles.iconButton}
                            aria-label={`Edit ${b.tag}: ${b.text}`}
                            onClick={() =>
                              selectEditor(
                                b.id,
                                `${b.tag.toUpperCase()} heading`,
                                "heading",
                              )
                            }
                          >
                            <PencilLine size={15} />
                          </button>
                          {mode === "improve" && (
                            <select
                              aria-label={`Heading level for ${b.text}`}
                              value={b.tag}
                              onChange={(e) =>
                                updateChange(`level:${b.id}`, e.target.value)
                              }
                            >
                              {[1, 2, 3, 4, 5, 6].map((l) => (
                                <option key={l} value={`h${l}`}>
                                  H{l}
                                </option>
                              ))}
                            </select>
                          )}
                        </div>
                      ))
                    ) : (
                      <p className={styles.muted}>
                        No visible headings extracted. Check coverage before
                        changing the page.
                      </p>
                    )}
                  </section>
                )}
                {section === "content" && (
                  <ContentReport
                    page={active}
                    primary={keyword}
                    secondary={secondary}
                    related={related}
                    targetGrade={targetGrade}
                  />
                )}
                {section === "links" && (
                  <section className={styles.evidencePanel}>
                    <h3>Links and anchor review</h3>
                    <div className={styles.dataGrid}>
                      {["Internal", "External", "Unknown"].map((type) => (
                        <div key={type}>
                          <span>{type} links</span>
                          <strong>
                            {
                              linkReport(active).filter((l) => l.type === type)
                                .length
                            }
                          </strong>
                        </div>
                      ))}
                    </div>
                    <p className={styles.muted}>
                      Relevant competitor sources can be useful citations.
                      Destination authority, accuracy, and competitor status
                      were not independently verified.
                    </p>
                    <p className={styles.muted}>
                      Destinations were not fetched. Counts cover {active.scope}
                      .
                    </p>
                    <div className={`${styles.tableWrap} ${styles.linkTable}`}>
                      <table>
                        <thead>
                          <tr>
                            <th>Anchor</th>
                            <th>Destination</th>
                            <th>Type</th>
                            <th>Link attributes</th>
                          </tr>
                        </thead>
                        <tbody>
                          {active.links.slice(0, 120).map((l, i) => (
                            <tr key={i}>
                              <td>
                                <span
                                  className={styles.linkAnchor}
                                  title={l.text}
                                >
                                  {l.text || "No text anchor"}
                                </span>
                              </td>
                              <td>
                                <a
                                  href={l.href}
                                  title={l.href}
                                  rel="noreferrer"
                                  target="_blank"
                                >
                                  {l.href}
                                  <ArrowUpRight size={12} />
                                </a>
                              </td>
                              <td>
                                {page.url &&
                                new URL(l.href).origin ===
                                  new URL(page.url).origin
                                  ? "Internal"
                                  : "External"}
                              </td>
                              <td>{l.rel || "No rel attributes"}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                    {!active.links.length && <p>No links were extracted.</p>}
                    <Link
                      href="/tools/internal-link-opportunity-finder"
                      className={styles.toolLink}
                    >
                      Discover relevant internal link targets{" "}
                      <ArrowRight size={15} />
                    </Link>
                  </section>
                )}
                {section === "media" && (
                  <section className={styles.evidencePanel}>
                    <h3>Image alternatives</h3>
                    <p className={styles.muted}>
                      Images are listed without downloading their files. Review
                      purpose before adding alternative text.
                    </p>
                    {active.images.slice(0, 100).map((image, i) => (
                      <div className={styles.imageRow} key={i}>
                        <div>
                          <strong>Image {i + 1}</strong>
                          <small>{image.src || "Source unavailable"}</small>
                          <p>
                            {image.alt === null
                              ? "Missing alt attribute"
                              : image.alt === ""
                                ? "Empty alt attribute · may be decorative"
                                : image.alt}
                          </p>
                        </div>
                        <button
                          className={styles.quiet}
                          type="button"
                          onClick={() =>
                            selectEditor(
                              `image:${i}`,
                              `Image ${i + 1} alternative`,
                              "alt",
                            )
                          }
                        >
                          <PencilLine size={14} />
                          Edit alt
                        </button>
                      </div>
                    ))}
                    {!active.images.length && (
                      <p>
                        No images extracted from the selected content scope.
                      </p>
                    )}
                  </section>
                )}
                {section === "schema" && (
                  <SchemaPanel
                    schema={active.schemas}
                    pageUrl={active.url}
                    partial={active.partial}
                    onApply={(field, raw) => {
                      updateChange(field, raw);
                      setMode("improve");
                    }}
                  />
                )}
                {section === "technical" && <TechnicalReport page={active} />}
                {section === "ai-search" && (
                  <AnswerReadinessPanel
                    page={active}
                    onNavigate={navigateSection}
                    onEdit={(field, label) => {
                      const b = active.blocks.find((b) => b.id === field);
                      if (b)
                        selectEditor(
                          field,
                          label,
                          /^h/.test(b.tag) ? "heading" : "passage",
                        );
                    }}
                  />
                )}
                {section === "ai-search" && (
                  <section className={styles.evidencePanel}>
                    <span className={styles.eyebrow}>
                      Clarity, evidence, and access
                    </span>
                    <h3>Review opening paragraphs in context.</h3>
                    <p className={styles.muted}>
                      Optional review checks opening paragraphs with their
                      headings and nearby context against your page promise. It
                      does not verify facts or search rankings. Long paragraphs
                      may be shortened in this optional sample.
                    </p>
                    <button
                      className={styles.suggestButton}
                      type="button"
                      disabled={reviewBusy || !active.blocks.length}
                      onClick={reviewContent}
                    >
                      {reviewBusy ? (
                        <Loader2 size={16} className={styles.spin} />
                      ) : (
                        <Sparkles size={16} />
                      )}
                      {reviewBusy
                        ? "Reviewing opening paragraphs…"
                        : "Review opening answers in context"}
                    </button>
                    {reviewError && (
                      <p role="alert" className={styles.error}>
                        {reviewError}
                      </p>
                    )}
                    {review && review.fingerprint !== reviewFingerprint && (
                      <p className={styles.warningNote}>
                        Your content or context changed. Run the editorial
                        review again for this version.
                      </p>
                    )}
                    {review && review.fingerprint === reviewFingerprint && (
                      <div className={styles.editorialReview}>
                        <p>{review.result.summary}</p>
                        <p className={styles.muted}>
                          {review.blocks} sampled blocks reviewed. These are
                          editorial suggestions, separate from your checklist
                          score.
                        </p>
                        {review.result.insights.map((insight, i) => (
                          <article className={styles.finding} key={i}>
                            <span className={styles.badge + " " + styles.info}>
                              {insight.topic} · editorial review
                            </span>
                            <blockquote className={styles.evidence}>
                              {insight.quote}
                            </blockquote>
                            <p>{insight.observation}</p>
                            <p className={styles.advice}>{insight.action}</p>
                            <button
                              type="button"
                              className={styles.quiet}
                              onClick={() => {
                                const b = active.blocks.find(
                                  (b) => b.id === insight.blockId,
                                );
                                if (b)
                                  selectEditor(
                                    b.id,
                                    "Review selected passage",
                                    /^h/.test(b.tag) ? "heading" : "passage",
                                  );
                              }}
                            >
                              <PencilLine size={14} />
                              Review passage
                            </button>
                          </article>
                        ))}
                        {!review.result.insights.length && (
                          <p className={styles.muted}>
                            No additional evidence-backed suggestions were
                            returned for this sample. This does not certify the
                            full page.
                          </p>
                        )}
                      </div>
                    )}

                    <p className={styles.muted}>
                      This review describes content and access signals. Actual
                      citation frequency requires observed search results or
                      first-party reporting.
                    </p>
                    <Link
                      href="/tools/ai-citation-readiness-checker"
                      className={styles.toolLink}
                    >
                      Open AI Citation Readiness Checker{" "}
                      <ArrowRight size={15} />
                    </Link>
                    <a
                      href="https://developers.google.com/search/docs/appearance/ai-features"
                      target="_blank"
                      rel="noreferrer"
                      className={styles.toolLink}
                    >
                      Google guidance on AI search features{" "}
                      <ArrowUpRight size={15} />
                    </a>
                  </section>
                )}
                <div className={styles.findingHeader}>
                  <h3>
                    {section === "overview"
                      ? "Priority findings"
                      : "Findings & next steps"}
                  </h3>
                  <label className={styles.filter}>
                    Show
                    <select
                      value={filter}
                      onChange={(e) => setFilter(e.target.value)}
                    >
                      <option value="all">All findings</option>
                      <option value="critical">Critical</option>
                      <option value="warning">Review</option>
                      {section !== "overview" && (
                        <>
                          <option value="passed">Passed</option>
                          <option value="info">Opportunities</option>
                          <option value="unchecked">Not checked</option>
                        </>
                      )}
                    </select>
                  </label>
                </div>
                <div className={styles.findings}>
                  {visible.map((f) => (
                    <article
                      key={f.id}
                      className={`${styles.finding} ${styles[`finding_${f.status}`]}`}
                    >
                      <div className={styles.findingTop}>
                        <Badge status={f.status} />
                        <span className={styles.muted}>
                          {SECTIONS.find((s) => s.id === f.section)?.short}
                        </span>
                      </div>
                      <h4>{f.title}</h4>
                      <p className={styles.evidence}>{f.evidence}</p>
                      <p className={styles.advice}>{f.advice}</p>
                      <div className={styles.findingActions}>
                        {f.field && (
                          <button
                            className={styles.quiet}
                            type="button"
                            onClick={() => editFinding(f)}
                          >
                            <PencilLine size={14} />
                            Review & improve
                          </button>
                        )}
                        <Link
                          className={styles.toolLink}
                          href={`/tools/${f.tool}`}
                        >
                          Open{" "}
                          {tools.find((t) => t.slug === f.tool)?.name ||
                            f.tool.replace(/-/g, " ")}{" "}
                          <ArrowUpRight size={14} />
                        </Link>
                      </div>
                    </article>
                  ))}
                </div>
                {!visible.length && (
                  <div className={styles.noFindings}>
                    <CheckCircle2 size={28} />
                    <h4>
                      {filter === "all"
                        ? "No priority issues found in these checks."
                        : "No findings match this filter."}
                    </h4>
                    <p>
                      Review coverage and unchecked items before drawing
                      conclusions about the whole page.
                    </p>
                  </div>
                )}
                {mode === "improve" && (
                  <section className={styles.changePanel}>
                    <div className={styles.panelTitle}>
                      <div>
                        <span className={styles.eyebrow}>
                          Your working draft
                        </span>
                        <h3>{changes.length} proposed change(s)</h3>
                      </div>
                      <button
                        className={styles.quiet}
                        type="button"
                        disabled={!changes.length}
                        onClick={() =>
                          download(
                            "on-page-changes.csv",
                            changesCsv(
                              changes.map((c) => ({
                                ...c,
                                field: fieldLabel(c.field),
                              })),
                            ),
                            "text/csv;charset=utf-8",
                          )
                        }
                      >
                        <Download size={14} />
                        Export changes
                      </button>
                    </div>
                    {changes.length ? (
                      changes.map((c) => (
                        <div className={styles.change} key={c.field}>
                          <div>
                            <strong>{fieldLabel(c.field)}</strong>
                            <del>{c.before || "Not present"}</del>
                            <ins>{c.after || "Empty alternative"}</ins>
                          </div>
                          <button
                            className={styles.iconButton}
                            type="button"
                            aria-label={`Undo ${fieldLabel(c.field)}`}
                            onClick={() =>
                              setChanges((old) =>
                                old.filter((x) => x.field !== c.field),
                              )
                            }
                          >
                            <RotateCcw size={16} />
                          </button>
                        </div>
                      ))
                    ) : (
                      <p className={styles.muted}>
                        Choose a field or passage to edit. Accepted changes
                        appear here, with undo available.
                      </p>
                    )}
                    <p className={styles.muted}>
                      Publish approved changes in your website editor, then run
                      a new URL audit. Recent imports may be cached for two
                      minutes.
                    </p>
                  </section>
                )}
              </div>
            </div>
          </div>
        </EvidenceReviewScope>
      )}
      {editor && (
        <div
          className={styles.overlay}
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) closeEditor();
          }}
        >
          <section
            ref={drawerRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby="improve-heading"
            className={styles.drawer}
          >
            <header>
              <div>
                <span className={styles.eyebrow}>Improve your draft</span>
                <h2 id="improve-heading">{editor.label}</h2>
              </div>
              <button
                className={styles.iconButton}
                type="button"
                onClick={closeEditor}
                aria-label="Close editor"
              >
                <X size={20} />
              </button>
            </header>
            <div className={styles.drawerBody}>
              <label className={styles.label} htmlFor="draft-edit">
                Proposed text
              </label>
              <textarea
                id="draft-edit"
                ref={editorRef}
                value={edited}
                maxLength={
                  editor.kind === "schema"
                    ? 100000
                    : editor.kind === "title" || editor.kind === "heading"
                      ? 140
                      : editor.kind === "description"
                        ? 320
                        : editor.kind === "alt"
                          ? 1000
                          : 12000
                }
                rows={
                  editor.kind === "schema" || editor.kind === "passage" ? 9 : 4
                }
                onChange={(e) => setEdited(e.target.value)}
              />
              <small className={styles.muted}>
                {edited.length.toLocaleString()} characters ·{" "}
                {editor.kind === "alt"
                  ? "Empty text can be appropriate for decorative images."
                  : "Review accuracy before applying."}
              </small>
              <details className={styles.original}>
                <summary>Original draft text</summary>
                <p>{editor.value || "Not present"}</p>
              </details>
              {editor.kind === "alt" && (
                <label className={styles.label}>
                  Describe the image before requesting suggestions
                  <textarea
                    rows={3}
                    value={imageContext}
                    maxLength={1500}
                    onChange={(e) => setImageContext(e.target.value)}
                    placeholder="What does the image show, and how does it help the reader?"
                  />
                </label>
              )}
              {editor.kind !== "schema" && (
                <button
                  className={styles.suggestButton}
                  type="button"
                  disabled={suggesting}
                  onClick={suggest}
                >
                  {suggesting ? (
                    <Loader2 size={17} className={styles.spin} />
                  ) : (
                    <Sparkles size={17} />
                  )}
                  {suggesting
                    ? "Preparing alternatives…"
                    : "Suggest three alternatives"}
                </button>
              )}
              {editError && (
                <p className={styles.error} role="alert">
                  {editError}
                </p>
              )}
              <div className={styles.suggestions}>
                {suggestions.map((s, i) => (
                  <article
                    key={i}
                    className={edited === s.text ? styles.chosen : ""}
                  >
                    <span className={styles.eyebrow}>Alternative {i + 1}</span>
                    <p>{s.text}</p>
                    <small>{s.reason}</small>
                    <button
                      type="button"
                      className={styles.quiet}
                      onClick={() => setEdited(s.text)}
                    >
                      {edited === s.text ? (
                        <Check size={14} />
                      ) : (
                        <Clipboard size={14} />
                      )}
                      {edited === s.text ? "Selected" : "Use this version"}
                    </button>
                  </article>
                ))}
              </div>
            </div>
            <footer>
              <p>Applies to your draft only.</p>
              <button
                className={styles.primary}
                type="button"
                onClick={applyEdit}
                disabled={suggesting}
              >
                <Check size={16} />
                Apply to draft
              </button>
            </footer>
          </section>
        </div>
      )}
    </div>
  );
}
