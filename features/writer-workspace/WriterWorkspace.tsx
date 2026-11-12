"use client";
import React, { useEffect, useMemo, useRef, useState } from "react";
import dynamic from "next/dynamic";
import { createPortal } from "react-dom";
import {
  ArrowDown,
  ArrowUp,
  BookOpen,
  Check,
  CheckCircle2,
  ChevronRight,
  Download,
  FileDown,
  FileText,
  Focus,
  FolderOpen,
  ImageIcon,
  LayoutDashboard,
  ListTree,
  Loader2,
  Moon,
  Plus,
  SearchCheck,
  Settings2,
  Sparkles,
  Square,
  Sun,
  Upload,
  Wand2,
  X,
} from "lucide-react";
import type { BlogInfographicConfig } from "@/lib/blog-writer/canonical-state";
import {
  measureMetaDescriptionPixelWidth,
  measureTitlePixelWidth,
  normalizeSeoSlug,
} from "@/lib/blog-writer/deterministic-analyzers";
import { useWorkspace } from "./useWorkspace";
import { useGeneration } from "./useGeneration";
import {
  articleRevision,
  bodyOf,
  hash,
  id,
  makeSection,
  parseBrief,
  patchWorkspace,
  readiness,
  refreshVisual,
  safeUrl,
  syncDocument,
  workspace,
  wordCount,
} from "./model";
import type { Project, RichNode } from "./types";
import ArticleEditor, { type EditorHandle } from "./ArticleEditor";
import AssetDeck from "./AssetDeck";
import ToolUrlInput from "@/features/tool-ui/ToolUrlInput";
import { downloadArticle, saveBlob } from "./assets";
import styles from "./workspace.module.css";

const InfographicStudio = dynamic(
  () => import("@/features/blog-infographic-studio/BlogInfographicStudio"),
  {
    ssr: false,
    loading: () => <p className={styles.loading}>Opening image studio…</p>,
  },
);

const EXAMPLE =
  "Write a practical guide to what to do after keyword research for small business owners. Explain how to clean a keyword list, match search intent, group related queries, map them to pages, and choose what to write first. Use a running example, avoid keyword stuffing, and end with an actionable checklist.";

function errorText(e: unknown) {
  return e instanceof Error
    ? e.message
    : "Something went wrong. Please try again.";
}

export default function WriterWorkspace() {
  const store = useWorkspace(),
    { project: p, update, current } = store,
    gen = useGeneration(store),
    w = workspace(p),
    report = useMemo(() => readiness(p), [p]);

  const manualDraft = Boolean(w.document && report.words > 0);
  const bodyPresent = p.sections.some(
    (s) =>
      s.bodyMarkdown.trim() || s.subHeadings.some((h) => h.bodyMarkdown.trim()),
  );

  const [tab, setTab] = useState("brief"),
    [studioUnlocked, setStudioUnlocked] = useState(false),
    [darkStudio, setDarkStudio] = useState(true),
    [focus, setFocus] = useState(false),
    [highlights, setHighlights] = useState(false),
    [selection, setSelection] = useState(""),
    [instruction, setInstruction] = useState(
      "Make this clearer and more concise.",
    ),
    [rewrite, setRewrite] = useState<{
      text: string;
      from: number;
      to: number;
      revision: string;
    } | null>(null),
    [rewriteBusy, setRewriteBusy] = useState(false),
    [exportBusy, setExportBusy] = useState(""),
    [message, setMessage] = useState(""),
    [sourceUrl, setSourceUrl] = useState(""),
    [sourceBusy, setSourceBusy] = useState(false),
    [visualId, setVisualId] = useState<string | null>(null),
    [menu, setMenu] = useState(false);

  const dialog = useRef<HTMLDivElement>(null);
  const editor = useRef<EditorHandle>(null),
    importInput = useRef<HTMLInputElement>(null),
    logoInput = useRef<HTMLInputElement>(null),
    rewriteAbort = useRef<AbortController | null>(null);

  useEffect(() => {
    setVisualId(null);
    setFocus(false);
    const hasDraft =
      p.sections.some(
        (s) =>
          s.bodyMarkdown.trim() ||
          s.subHeadings.some((h) => h.bodyMarkdown.trim()),
      ) || Boolean(workspace(p).document && readiness(p).words > 0);
    setStudioUnlocked(hasDraft);
    setTab(hasDraft ? "outline" : "brief");
    setRewrite(null);
    setSelection("");
    setMessage("");
    rewriteAbort.current?.abort();
    setRewriteBusy(false);
  }, [p.projectId]);

  // Automatically unlock the full Studio Dashboard and focus Outline/Review once drafting completes
  useEffect(() => {
    if (bodyPresent || manualDraft || w.run.status === "done") {
      setStudioUnlocked(true);
      if (tab === "brief" && p.sections.length > 0) {
        setTab("outline");
      }
    }
  }, [bodyPresent, manualDraft, w.run.status, p.sections.length]);

  useEffect(() => {
    const key = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setVisualId(null);
        setFocus(false);
        setMenu(false);
      }
    };
    window.addEventListener("keydown", key);
    return () => {
      window.removeEventListener("keydown", key);
      rewriteAbort.current?.abort();
    };
  }, []);

  useEffect(() => {
    if (!visualId) return;
    const previous = document.activeElement as HTMLElement | null,
      overflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const raf = requestAnimationFrame(() =>
      dialog.current?.querySelector<HTMLButtonElement>("button")?.focus(),
    );
    const trap = (e: KeyboardEvent) => {
      if (e.key !== "Tab") return;
      const focusable = [
        ...(dialog.current?.querySelectorAll<HTMLElement>(
          'button:not([disabled]),input:not([disabled]),textarea:not([disabled]),select:not([disabled]),a[href],[tabindex="0"]',
        ) || []),
      ].filter((el) => el.offsetParent !== null);
      const first = focusable[0],
        last = focusable.at(-1);
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last?.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first?.focus();
      }
    };
    document.addEventListener("keydown", trap);
    return () => {
      cancelAnimationFrame(raf);
      document.body.style.overflow = overflow;
      document.removeEventListener("keydown", trap);
      previous?.focus();
    };
  }, [visualId]);

  const meta = (field: keyof Project["metaPack"], value: string) =>
    update((now) => ({
      ...now,
      metaPack: { ...now.metaPack, [field]: value },
    }));

  const field = (field: keyof Project, value: string) =>
    update((now) => ({ ...now, [field]: value }));

  const keyword = (field: string, value: string) =>
    update((now) => ({
      ...now,
      keywordCluster: { ...now.keywordCluster, [field]: value },
    }));

  const editOutline = (sid: string, title: string) =>
    update((now) => {
      const sections = now.sections.map((s) =>
          s.id === sid ? { ...s, h2Text: title } : s,
        ),
        doc = workspace(now).document;
      if (doc)
        doc.content = doc.content?.map((n) =>
          n.type === "heading" && n.attrs?.sectionId === sid
            ? { ...n, content: [{ type: "text", text: title }] }
            : n,
        );
      return patchWorkspace(
        { ...now, sections },
        { document: doc ? structuredClone(doc) : undefined },
      );
    });

  const source = async () => {
    if (sourceBusy) return;
    const url = safeUrl(sourceUrl);
    if (!url) {
      setMessage("Enter a complete HTTP or HTTPS article URL.");
      return;
    }
    if (w.references.length >= 4) {
      setMessage("Use up to four focused references per article.");
      return;
    }
    if (w.references.some((r) => r.url === url)) {
      setMessage("That reference is already included.");
      return;
    }
    setSourceBusy(true);
    setMessage("");
    const pid = p.projectId;
    try {
      const res = await fetch("/api/ai-tools/universal-extract", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url, purpose: "infographic" }),
        signal: AbortSignal.timeout(35000),
      });
      const result = await res.json();
      if (!res.ok)
        throw new Error(
          result.error ||
            "This page could not be read. Paste relevant text into the brief instead.",
        );
      const text = result.cleanText || result.data?.cleanText || result.text;
      if (typeof text !== "string" || text.length < 100)
        throw new Error(
          "This page returned too little readable text. Paste the relevant passage into your brief.",
        );
      if (current.current.projectId !== pid) return;
      update((now) => {
        const nw = workspace(now);
        return patchWorkspace(now, {
          references: [
            ...nw.references,
            {
              id: id(),
              url,
              title: String(
                result.title || result.data?.title || new URL(url).hostname,
              ).slice(0, 300),
              text: text.slice(0, 8000),
              importedAt: new Date().toISOString(),
            },
          ].slice(0, 4),
        });
      });
      setSourceUrl("");
    } catch (e) {
      setMessage(errorText(e));
    } finally {
      setSourceBusy(false);
    }
  };

  const importProject = async (file: File) => {
    setMenu(false);
    if (file.size > 8_000_000) {
      setMessage("Use a project backup smaller than 8 MB.");
      return;
    }
    try {
      gen.stop();
      await store.importProject(await file.text());
    } catch (e) {
      setMessage(errorText(e));
    }
  };

  const uploadLogo = async (file: File) => {
    if (!/^image\/(png|jpeg|webp)$/.test(file.type) || file.size > 2_000_000) {
      setMessage("Use a PNG, JPEG or WebP logo under 2 MB.");
      return;
    }
    const url = URL.createObjectURL(file);
    try {
      const image = new Image();
      await new Promise<void>((ok, no) => {
        image.onload = () => ok();
        image.onerror = () => no(new Error("This image could not be loaded."));
        image.src = url;
      });
      const scale = Math.min(1, 500 / Math.max(image.width, image.height)),
        canvas = document.createElement("canvas");
      canvas.width = Math.max(1, Math.round(image.width * scale));
      canvas.height = Math.max(1, Math.round(image.height * scale));
      const ctx = canvas.getContext("2d");
      if (!ctx) throw new Error("Image resizing is unavailable.");
      ctx.drawImage(image, 0, 0, canvas.width, canvas.height);
      update((now) =>
        patchWorkspace(now, {
          brand: {
            ...workspace(now).brand,
            logo: canvas.toDataURL("image/png"),
          },
        }),
      );
    } catch (e) {
      setMessage(errorText(e));
    } finally {
      URL.revokeObjectURL(url);
    }
  };

  const requestRewrite = async () => {
    const picked = editor.current?.selection();
    if (!picked?.text.trim()) {
      setMessage("Select a passage in the article first.");
      return;
    }
    if (picked.text.length > 12000) {
      setMessage("Select up to 12,000 characters at a time.");
      return;
    }
    const revision = articleRevision(current.current),
      pid = p.projectId,
      c = new AbortController();
    rewriteAbort.current = c;
    setRewriteBusy(true);
    setMessage("");
    try {
      const res = await gen.rewrite(picked.text, instruction, c.signal);
      if (current.current.projectId !== pid) return;
      setRewrite({
        text: res.data.text,
        from: picked.from,
        to: picked.to,
        revision,
      });
    } catch (e) {
      setMessage(errorText(e));
    } finally {
      setRewriteBusy(false);
    }
  };

  const openVisual = (sid: string) => {
    setVisualId(sid);
  };

  const saveVisual = (config: BlogInfographicConfig) => {
    const sid = visualId;
    update((now) =>
      patchWorkspace(
        {
          ...now,
          sections: now.sections.map((s) =>
            s.id === sid ? { ...s, infographicConfig: config } : s,
          ),
        },
        {
          visualRevisions: {
            ...workspace(now).visualRevisions,
            [sid!]: hash(bodyOf(now.sections.find((s) => s.id === sid)!)),
          },
        },
      ),
    );
    setVisualId(null);
  };

  const visualSection = p.sections.find((s) => s.id === visualId);
  const completedCount = p.sections.filter(
    (s) =>
      s.bodyMarkdown.trim() || s.subHeadings.some((h) => h.bodyMarkdown.trim()),
  ).length;
  const missing = p.sections.length - completedCount;
  const activeSectionIdx = p.sections.findIndex((s) => s.id === w.run.current);
  const progressPercent = gen.busy
    ? w.run.status === "planning"
      ? 22
      : p.sections.length > 0
        ? Math.min(
            95,
            Math.round(
              28 +
                ((completedCount + 0.35) / Math.max(1, p.sections.length)) * 67,
            ),
          )
        : 35
    : bodyPresent && !missing
      ? 100
      : p.sections.length > 0
        ? 25
        : 0;

  const statusLabel = gen.busy
    ? w.run.status === "planning"
      ? "Planning your outline & metadata options"
      : `Writing section ${activeSectionIdx >= 0 ? activeSectionIdx + 1 : completedCount + 1} of ${p.sections.length}`
    : w.run.status === "done" || (bodyPresent && !missing)
      ? "Draft complete · ready for your review"
      : w.run.status === "failed"
        ? "This step needs another try"
        : w.run.status === "paused"
          ? "Writing paused"
          : p.sections.length
            ? "Outline ready"
            : "Start with your idea";

  const showOnboardingHero = !studioUnlocked && !bodyPresent && !manualDraft;

  const handleQuickExport = async (format: string) => {
    if (exportBusy) return;
    setExportBusy(format);
    setMessage("");
    try {
      const warnings = await downloadArticle(p, format);
      setMessage(
        warnings.length
          ? warnings.join(" ")
          : `Downloaded ${format.toUpperCase()} file.`,
      );
    } catch (e) {
      setMessage(errorText(e));
    } finally {
      setExportBusy("");
    }
  };

  if (!store.ready)
    return (
      <div className={`${styles.shell} ${darkStudio ? styles.darkShell : ""}`}>
        <p className={styles.loading}>
          <Loader2 size={18} />
          Opening your writing workspace…
        </p>
      </div>
    );

  const titlePx = Math.round(measureTitlePixelWidth(p.metaPack.metaTitle));
  const descPx = Math.round(
    measureMetaDescriptionPixelWidth(p.metaPack.metaDescription),
  );

  return (
    <div
      className={`${styles.shell} ${darkStudio ? styles.darkShell : ""} ${focus ? styles.focusMode : ""}`}
    >
      {/* Top Studio Header Bar */}
      <header className={styles.workspaceHeader}>
        <div className={styles.projectTitle}>
          <span className={styles.appIcon}>
            <FileText size={20} />
          </span>
          <div>
            <p className={styles.eyebrow}>
              DoItWithAI · Flagship Writing &amp; Visual Studio
            </p>
            <input
              aria-label="Project name"
              maxLength={180}
              value={p.projectTitle}
              onChange={(e) => field("projectTitle", e.target.value)}
            />
          </div>
        </div>
        <div className={styles.headerActions}>
          <span className={styles.saveStatus} role="status">
            {store.saving ? (
              <>
                <Loader2 size={13} />
                Saving…
              </>
            ) : store.saved ? (
              <>
                <CheckCircle2 size={13} />
                Saved in this browser
              </>
            ) : store.persistent ? (
              "Unsaved changes"
            ) : (
              "Temporary session"
            )}
          </span>
          <button
            type="button"
            title={
              darkStudio
                ? "Switch to Daylight Paper theme"
                : "Switch to DoItWithAI Dark Studio theme"
            }
            onClick={() => setDarkStudio(!darkStudio)}
          >
            {darkStudio ? <Sun size={15} /> : <Moon size={15} />}
            <span>{darkStudio ? "Daylight" : "Dark Studio"}</span>
          </button>
          <button
            type="button"
            onClick={async () => {
              gen.stop();
              await store.create();
              setStudioUnlocked(false);
              setTab("brief");
            }}
          >
            <Wand2 size={15} />
            <span>New Article Wizard</span>
          </button>
          <div className={styles.projectMenu}>
            <button
              type="button"
              aria-expanded={menu}
              onClick={() => setMenu(!menu)}
            >
              <FolderOpen size={15} />
              Projects
            </button>
            {menu && (
              <div className={styles.dropdown}>
                <button
                  type="button"
                  onClick={async () => {
                    gen.stop();
                    await store.create();
                    setMenu(false);
                    setStudioUnlocked(false);
                    setTab("brief");
                  }}
                >
                  <Plus size={14} />
                  New article
                </button>
                <label>
                  Open a project
                  <select
                    value={p.projectId}
                    onChange={async (e) => {
                      gen.stop();
                      try {
                        await store.switchProject(e.target.value);
                        setMenu(false);
                      } catch (error) {
                        setMessage(errorText(error));
                      }
                    }}
                  >
                    <option value={p.projectId}>{p.projectTitle}</option>
                    {store.projects
                      .filter((x) => x.projectId !== p.projectId)
                      .map((x) => (
                        <option value={x.projectId} key={x.projectId}>
                          {x.projectTitle}
                        </option>
                      ))}
                  </select>
                </label>
                <button
                  type="button"
                  onClick={() => importInput.current?.click()}
                >
                  <Upload size={14} />
                  Import backup
                </button>
                <button
                  type="button"
                  onClick={() => {
                    saveBlob(
                      store.backup(),
                      `${p.metaPack.urlSlug || "article"}.blogproject.json`,
                      "application/json",
                    );
                    setMenu(false);
                  }}
                >
                  <Download size={14} />
                  Download backup
                </button>
              </div>
            )}
          </div>
          <button
            type="button"
            aria-pressed={focus}
            onClick={() => {
              setStudioUnlocked(true);
              setFocus(!focus);
            }}
          >
            <Focus size={15} />
            <span>{focus ? "Exit focus" : "Focus"}</span>
          </button>
          <a
            href="#writer-assets"
            className={styles.primary}
            onClick={() => {
              setStudioUnlocked(true);
              setFocus(false);
            }}
          >
            <Download size={15} />
            Publishing kit
          </a>
        </div>
      </header>

      <input
        ref={importInput}
        type="file"
        accept="application/json,.json"
        hidden
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) void importProject(f);
          e.target.value = "";
        }}
      />
      <input
        ref={logoInput}
        type="file"
        accept="image/png,image/jpeg,image/webp"
        hidden
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) void uploadLogo(f);
          e.target.value = "";
        }}
      />

      {store.saveError && (
        <p className={styles.error} role="alert">
          {store.saveError}
        </p>
      )}
      {message && (
        <div className={styles.notice} role="status">
          <span>{message}</span>
          <button
            type="button"
            aria-label="Dismiss notification"
            onClick={() => setMessage("")}
          >
            <X size={15} />
          </button>
        </div>
      )}

      {/* =====================================================================
          PHASE 1: GUIDED ONBOARDING & LIVE STEP-BY-STEP GENERATION PIPELINE
         ===================================================================== */}
      {showOnboardingHero && (
        <section
          className={styles.onboardingCard}
          aria-label="Article onboarding wizard"
        >
          <div className={styles.onboardingHeader}>
            <div>
              <span className={styles.onboardingBadge}>
                <Sparkles size={14} />
                Step-by-Step Guided Onboarding · AI Content, Blog &amp; Article
                Studio
              </span>
              <h2>Start with a topic, prompt, outline, or reference URL</h2>
              <p className={styles.muted}>
                Share your rough idea, keywords, or custom H2/H3 outline below.
                Our studio will plan your search metadata, engineer your outline,
                write each section with live progress, render inline section
                infographics, and unlock the full editing &amp; social studio
                once your draft is ready.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setStudioUnlocked(true)}
              className={styles.skipOnboardingBtn}
            >
              <LayoutDashboard size={15} />
              Open Full Studio Editor Directly →
            </button>
          </div>

          <div className={styles.onboardingGrid}>
            <div className={styles.formStack}>
              <label htmlFor="onboarding-brief-input">
                1. Your Topic, Detailed Prompt, or Custom Outline (H2: / H3:)
              </label>
              <textarea
                id="onboarding-brief-input"
                rows={6}
                maxLength={16000}
                value={p.rawUserBriefOrSourceText}
                onChange={(e) =>
                  field("rawUserBriefOrSourceText", e.target.value)
                }
                placeholder={
                  "Example: Write a comprehensive guide on 'What is AI SEO for Blogs?' covering how AI search overviews work, practical optimization steps, common pitfalls, and a pre-publish checklist.\n\n(Optional: Include 'Keyword: ...' or 'H2: ...' / 'H3: ...' headings right here!)"
                }
              />
              <div className={styles.inputFooter}>
                <button
                  type="button"
                  className={styles.textButton}
                  onClick={() => field("rawUserBriefOrSourceText", EXAMPLE)}
                >
                  ✨ Load sample prompt &amp; topic
                </button>
                <span>
                  {p.rawUserBriefOrSourceText.length.toLocaleString()} / 16,000
                  chars
                </span>
              </div>

              <div className={styles.onboardingPrefsGrid}>
                <label>
                  Focus keyword (optional)
                  <input
                    maxLength={160}
                    value={p.keywordCluster.primaryKeyword}
                    onChange={(e) => keyword("primaryKeyword", e.target.value)}
                    placeholder="e.g. AI SEO for blogs"
                  />
                </label>
                <label>
                  Target audience
                  <input
                    maxLength={500}
                    value={p.keywordCluster.targetAudience}
                    onChange={(e) => keyword("targetAudience", e.target.value)}
                    placeholder="e.g. Content marketers & founders"
                  />
                </label>
                <label>
                  Tone of voice
                  <input
                    maxLength={100}
                    value={p.keywordCluster.toneOfVoice}
                    onChange={(e) => keyword("toneOfVoice", e.target.value)}
                    placeholder="Authoritative & Human"
                  />
                </label>
                <label>
                  Target article length
                  <select
                    value={w.targetWords}
                    onChange={(e) =>
                      update((now) =>
                        patchWorkspace(now, {
                          targetWords: Number(e.target.value),
                        }),
                      )
                    }
                  >
                    {[800, 1200, 1600, 2400, 3200, 4000].map((n) => (
                      <option key={n} value={n}>
                        {n.toLocaleString()} words
                      </option>
                    ))}
                  </select>
                </label>
              </div>

              <div className={styles.onboardingActionRow}>
                <button
                  type="button"
                  className={styles.primary}
                  disabled={
                    gen.busy ||
                    sourceBusy ||
                    p.rawUserBriefOrSourceText.trim().length < 3
                  }
                  onClick={async () => {
                    const parsed = parseBrief(
                      current.current.rawUserBriefOrSourceText,
                    );
                    if (
                      parsed.keyword &&
                      !current.current.keywordCluster.primaryKeyword
                    )
                      keyword("primaryKeyword", parsed.keyword);
                    await gen.generateAll();
                    if (
                      current.current.sections.some(
                        (s) =>
                          s.bodyMarkdown.trim() ||
                          s.subHeadings.some((h) => h.bodyMarkdown.trim()),
                      )
                    ) {
                      setStudioUnlocked(true);
                      setTab("outline");
                    }
                  }}
                >
                  {gen.busy ? (
                    <Loader2 size={16} className={styles.spinIcon} />
                  ) : (
                    <Sparkles size={16} />
                  )}
                  Generate Complete Article, Visuals &amp; Unlock Studio
                  <ChevronRight size={15} />
                </button>

                <button
                  type="button"
                  disabled={
                    gen.busy ||
                    sourceBusy ||
                    p.rawUserBriefOrSourceText.trim().length < 3
                  }
                  onClick={async () => {
                    const parsed = parseBrief(
                      current.current.rawUserBriefOrSourceText,
                    );
                    if (
                      parsed.keyword &&
                      !current.current.keywordCluster.primaryKeyword
                    )
                      keyword("primaryKeyword", parsed.keyword);
                    await gen.plan();
                    if (current.current.sections.length) setTab("outline");
                  }}
                >
                  <ListTree size={15} />
                  Step 1 Only: Build &amp; Review Outline First
                </button>
              </div>
            </div>

            {/* Right Column of Onboarding: Live Outline Preview or Pipeline Overview */}
            <div className={styles.onboardingSideCard}>
              {p.sections.length > 0 ? (
                <div className={styles.formStack}>
                  <div className={styles.outlineLabel}>
                    <span>STEP 2 READY · REVIEW YOUR OUTLINE</span>
                    <span>{p.sections.length} H2 Sections</span>
                  </div>
                  <h3>{p.metaPack.h1Title || p.projectTitle}</h3>
                  <p className={styles.muted}>
                    Your outline and metadata are ready! Review the sections
                    below or click{" "}
                    <strong>Write Complete Article &amp; Unlock Studio</strong>{" "}
                    to generate the full draft and section infographics.
                  </p>
                  <div className={styles.onboardingOutlineList}>
                    {p.sections.map((s, idx) => (
                      <div key={s.id} className={styles.onboardingOutlineRow}>
                        <strong>
                          H2 · {String(idx + 1).padStart(2, "0")}: {s.h2Text}
                        </strong>
                        {s.subHeadings.length > 0 && (
                          <span>
                            {s.subHeadings.map((h) => h.h3Text).join(" · ")}
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                  <div className={styles.buttonRow}>
                    <button
                      type="button"
                      className={styles.primary}
                      disabled={gen.busy || !missing}
                      onClick={async () => {
                        await gen.draft();
                        setStudioUnlocked(true);
                        setTab("outline");
                      }}
                    >
                      <Sparkles size={15} />
                      Write Complete Article &amp; Unlock Studio →
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setStudioUnlocked(true);
                        setTab("outline");
                      }}
                    >
                      Customize Outline in Studio
                    </button>
                  </div>
                </div>
              ) : (
                <div className={styles.formStack}>
                  <p className={styles.eyebrow}>
                    How the 5-Stage Studio Pipeline Works
                  </p>
                  <h3>From One Prompt to a Complete Publishing Package</h3>
                  <ul className={styles.onboardingStepList}>
                    <li>
                      <span>01</span>
                      <div>
                        <strong>Intent, Focus Keyword &amp; SERP Meta</strong>
                        <p>
                          Generates your H1 headline plus 4 selectable Meta
                          Title and Meta Description variations.
                        </p>
                      </div>
                    </li>
                    <li>
                      <span>02</span>
                      <div>
                        <strong>Structured H2 &amp; H3 Outline</strong>
                        <p>
                          Builds a logical heading hierarchy (or preserves your
                          exact custom outline verbatim).
                        </p>
                      </div>
                    </li>
                    <li>
                      <span>03</span>
                      <div>
                        <strong>Auto-Healing Section Drafting</strong>
                        <p>
                          Writes each section step-by-step with live progress
                          and zero subheading mismatch errors.
                        </p>
                      </div>
                    </li>
                    <li>
                      <span>04</span>
                      <div>
                        <strong>Inline Blog Section Infographics</strong>
                        <p>
                          Automatically pairs every H2 section with an editable
                          vector infographic from our visual engine.
                        </p>
                      </div>
                    </li>
                    <li>
                      <span>05</span>
                      <div>
                        <strong>
                          Social Studio, Carousel, Newsletter &amp; ZIP
                        </strong>
                        <p>
                          Prepares Facebook, Instagram, LinkedIn, X, Pinterest,
                          YouTube scripts, PDF, DOCX, EPUB, and MP3 exports.
                        </p>
                      </div>
                    </li>
                  </ul>
                </div>
              )}
            </div>
          </div>
        </section>
      )}

      {/* =====================================================================
          LIVE STEP-BY-STEP GENERATION PROGRESS & SHIMMER SKELETON THEATRE
         ===================================================================== */}
      {gen.busy && (
        <section
          className={styles.pipelineTheatre}
          role="status"
          aria-live="polite"
        >
          <div className={styles.pipelineHeader}>
            <div className={styles.pipelineTitleGroup}>
              <span className={styles.pipelinePulse}>
                <Loader2 size={18} className={styles.spinIcon} />
              </span>
              <div>
                <p className={styles.eyebrow}>
                  Live Step-by-Step AI Production Pipeline · {progressPercent}%
                  Complete
                </p>
                <h3>{statusLabel}</h3>
                <p className={styles.muted}>
                  {w.run.status === "planning"
                    ? "Analyzing your topic, search intent, 4 meta title/description options, and H2/H3 outline structure…"
                    : `Drafting H2 section "${p.sections[activeSectionIdx]?.h2Text || "current section"}" and composing its inline section infographic…`}
                </p>
              </div>
            </div>
            <button type="button" onClick={gen.stop}>
              <Square size={13} />
              Pause generation
            </button>
          </div>

          <div className={styles.pipelineProgressBar}>
            <div
              className={styles.pipelineProgressFill}
              style={{ width: `${progressPercent}%` }}
            />
          </div>

          <div className={styles.pipelineStepsGrid}>
            <div
              className={`${styles.pipelineStepCard} ${w.run.status === "planning" ? styles.pipelineStepActive : styles.pipelineStepDone}`}
            >
              <span>01</span>
              <div>
                <strong>Topic &amp; Meta Options</strong>
                <p>H1 + 4 Title &amp; Description variations</p>
              </div>
            </div>
            <div
              className={`${styles.pipelineStepCard} ${w.run.status === "planning" ? styles.pipelineStepActive : p.sections.length > 0 ? styles.pipelineStepDone : ""}`}
            >
              <span>02</span>
              <div>
                <strong>H2/H3 Outline Tree</strong>
                <p>
                  {p.sections.length
                    ? `${p.sections.length} structured sections ready`
                    : "Structuring headings…"}
                </p>
              </div>
            </div>
            <div
              className={`${styles.pipelineStepCard} ${w.run.status === "drafting" ? styles.pipelineStepActive : completedCount > 0 && !missing ? styles.pipelineStepDone : ""}`}
            >
              <span>03</span>
              <div>
                <strong>Section-by-Section Drafting</strong>
                <p>
                  {completedCount} of {p.sections.length || "?"} sections
                  written
                </p>
              </div>
            </div>
            <div
              className={`${styles.pipelineStepCard} ${w.run.status === "drafting" ? styles.pipelineStepActive : ""}`}
            >
              <span>04</span>
              <div>
                <strong>Inline Section Visuals &amp; Kit</strong>
                <p>Auto-rendering section infographics &amp; social cards</p>
              </div>
            </div>
          </div>

          {/* Animated Shimmer Skeleton Placeholder while Fetching */}
          <div className={styles.skeletonContainer}>
            <div className={styles.skeletonHeaderRow}>
              <div className={styles.skeletonPill} />
              <div className={styles.skeletonTitleBar} />
            </div>
            <div className={styles.skeletonParagraph}>
              <div className={styles.skeletonLineFull} />
              <div className={styles.skeletonLineFull} />
              <div className={styles.skeletonLineMedium} />
            </div>
            {p.sections.length > 0 && (
              <div className={styles.skeletonSectionChips}>
                {p.sections.map((sec, idx) => {
                  const isDone =
                    Boolean(sec.bodyMarkdown.trim()) ||
                    sec.subHeadings.some((h) => Boolean(h.bodyMarkdown.trim()));
                  const isCurrent = sec.id === w.run.current;
                  return (
                    <div
                      key={sec.id}
                      className={`${styles.skeletonChip} ${isDone ? styles.skeletonChipDone : isCurrent ? styles.skeletonChipCurrent : ""}`}
                    >
                      {isDone ? (
                        <Check size={13} />
                      ) : isCurrent ? (
                        <Loader2 size={13} className={styles.spinIcon} />
                      ) : (
                        <span>{idx + 1}</span>
                      )}
                      <span>{sec.h2Text}</span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </section>
      )}

      {/* =====================================================================
          PHASE 2: THE 4-ZONE STUDIO DASHBOARD (LEFT PANEL + TOP META + BIG EDITOR + BOTTOM SUITE)
         ===================================================================== */}
      <div className={styles.workspaceGrid}>
        {/* ZONE 2: LEFT STUDIO PANEL (Unified Score Banner + Brief / Outline / Review) */}
        <aside className={styles.sidebar} aria-label="Writing assistant">
          {/* Compact Live Readiness & Word Count Summary Bar Always Visible */}
          <div className={styles.sidebarScoreBanner}>
            <div
              className={styles.miniScoreBadge}
              style={{
                background:
                  report.score >= 80
                    ? "#10b981"
                    : report.score >= 50
                      ? "#f59e0b"
                      : "#6366f1",
              }}
            >
              {report.score}
            </div>
            <div className={styles.sidebarScoreMeta}>
              <strong>Readiness &amp; SEO Score</strong>
              <span>
                {report.words.toLocaleString()} words · {report.minutes} min
                read
              </span>
            </div>
            <button
              type="button"
              className={styles.textButton}
              onClick={() => setTab("review")}
            >
              Details
            </button>
          </div>

          <div
            role="tablist"
            aria-label="Writing steps"
            className={styles.sideTabs}
          >
            {[
              ["brief", "Brief", BookOpen],
              ["outline", "Outline", ListTree],
              ["review", "Review", SearchCheck],
            ].map(([key, label, Icon]: any) => (
              <button
                type="button"
                role="tab"
                aria-selected={tab === key}
                aria-controls={`writer-panel-${key}`}
                id={`writer-tab-${key}`}
                onClick={() => setTab(key)}
                key={key}
              >
                <Icon size={16} />
                {label}
                {key === "outline" && p.sections.length > 0 ? (
                  <span>{p.sections.length}</span>
                ) : null}
              </button>
            ))}
          </div>

          <div
            role="tabpanel"
            aria-labelledby={`writer-tab-${tab}`}
            id={`writer-panel-${tab}`}
            className={styles.sideBody}
          >
            {tab === "brief" && (
              <div className={styles.formStack}>
                <div>
                  <p className={styles.eyebrow}>01 · Tell your story</p>
                  <h2>What are you writing?</h2>
                  <p className={styles.muted}>
                    A rough idea is enough. Or include your keywords, outline,
                    audience, and specific instructions.
                  </p>
                </div>
                <label className={styles.srOnly} htmlFor="writer-brief">
                  Your article brief
                </label>
                <textarea
                  id="writer-brief"
                  rows={8}
                  maxLength={16000}
                  value={p.rawUserBriefOrSourceText}
                  onChange={(e) =>
                    field("rawUserBriefOrSourceText", e.target.value)
                  }
                  placeholder={
                    "For example: write a practical guide to starting a balcony garden. For beginners, with an affordable setup and a month-by-month plan.\n\nAlready have an outline? Paste H2: and H3: headings here."
                  }
                />
                <div className={styles.inputFooter}>
                  <button
                    type="button"
                    className={styles.textButton}
                    onClick={() => field("rawUserBriefOrSourceText", EXAMPLE)}
                  >
                    Try an example
                  </button>
                  <span>
                    {p.rawUserBriefOrSourceText.length.toLocaleString()} /
                    16,000
                  </span>
                </div>

                {/* 1-Click Full Article Generation Button */}
                <button
                  type="button"
                  className={styles.primary}
                  disabled={
                    gen.busy ||
                    sourceBusy ||
                    p.rawUserBriefOrSourceText.trim().length < 3 ||
                    bodyPresent ||
                    manualDraft
                  }
                  onClick={async () => {
                    const parsed = parseBrief(
                      current.current.rawUserBriefOrSourceText,
                    );
                    if (
                      parsed.keyword &&
                      !current.current.keywordCluster.primaryKeyword
                    )
                      keyword("primaryKeyword", parsed.keyword);
                    await gen.generateAll();
                    if (current.current.sections.length) {
                      setStudioUnlocked(true);
                      setTab("outline");
                    }
                  }}
                >
                  {gen.busy ? (
                    <Loader2 size={16} className={styles.spinIcon} />
                  ) : (
                    <Sparkles size={16} />
                  )}
                  Generate full article &amp; visuals
                  <ChevronRight size={15} />
                </button>

                <button
                  type="button"
                  disabled={
                    gen.busy ||
                    sourceBusy ||
                    p.rawUserBriefOrSourceText.trim().length < 3 ||
                    bodyPresent ||
                    manualDraft
                  }
                  onClick={async () => {
                    const parsed = parseBrief(
                      current.current.rawUserBriefOrSourceText,
                    );
                    if (
                      parsed.keyword &&
                      !current.current.keywordCluster.primaryKeyword
                    )
                      keyword("primaryKeyword", parsed.keyword);
                    await gen.plan();
                    if (current.current.sections.length) setTab("outline");
                  }}
                >
                  {gen.busy ? (
                    <Loader2 size={16} className={styles.spinIcon} />
                  ) : (
                    <ListTree size={16} />
                  )}
                  Build my outline
                  <ChevronRight size={15} />
                </button>

                {bodyPresent || manualDraft ? (
                  <p className={styles.muted}>
                    This project has a draft. Start a new article to plan a
                    different topic, or edit this outline directly.
                  </p>
                ) : (
                  <p className={styles.muted}>
                    Generate the full article in one click, or build and review
                    the outline first.
                  </p>
                )}

                <details className={styles.details} open>
                  <summary>
                    <Settings2 size={15} />
                    Writing preferences<span>Optional</span>
                  </summary>
                  <div className={styles.formStack}>
                    <label>
                      Focus keyword
                      <input
                        maxLength={160}
                        value={p.keywordCluster.primaryKeyword}
                        onChange={(e) =>
                          keyword("primaryKeyword", e.target.value)
                        }
                        placeholder="e.g. balcony vegetable garden"
                      />
                    </label>
                    <label>
                      Audience
                      <input
                        maxLength={500}
                        value={p.keywordCluster.targetAudience}
                        onChange={(e) =>
                          keyword("targetAudience", e.target.value)
                        }
                        placeholder="Who should this help?"
                      />
                    </label>
                    <label>
                      Tone
                      <input
                        maxLength={100}
                        value={p.keywordCluster.toneOfVoice}
                        onChange={(e) => keyword("toneOfVoice", e.target.value)}
                      />
                    </label>
                    <div className={styles.twoCols}>
                      <label>
                        Target words
                        <select
                          value={w.targetWords}
                          onChange={(e) =>
                            update((now) =>
                              patchWorkspace(now, {
                                targetWords: Number(e.target.value),
                              }),
                            )
                          }
                        >
                          {[800, 1200, 1600, 2400, 3200, 4000].map((n) => (
                            <option key={n} value={n}>
                              {n.toLocaleString()}
                            </option>
                          ))}
                        </select>
                      </label>
                      <label>
                        Language
                        <select
                          value={w.language}
                          onChange={(e) =>
                            update((now) =>
                              patchWorkspace(now, { language: e.target.value }),
                            )
                          }
                        >
                          {[
                            "English",
                            "Urdu",
                            "Hindi",
                            "Spanish",
                            "French",
                            "German",
                            "Arabic",
                          ].map((s) => (
                            <option key={s}>{s}</option>
                          ))}
                        </select>
                      </label>
                    </div>
                    <label>
                      Additional instructions
                      <textarea
                        maxLength={2000}
                        rows={3}
                        value={p.customUserInstructions}
                        onChange={(e) =>
                          field("customUserInstructions", e.target.value)
                        }
                        placeholder="Facts to include, phrases to avoid, your own experience…"
                      />
                    </label>
                  </div>
                </details>

                <details className={styles.details}>
                  <summary>
                    <BookOpen size={15} />
                    Reference material<span>{w.references.length} / 4</span>
                  </summary>
                  <div className={styles.formStack}>
                    <p className={styles.muted}>
                      Import useful source passages. The writer uses these as
                      reference material; check facts before publishing.
                    </p>
                    <label>
                      Article URL
                      <ToolUrlInput
                        type="url"
                        value={sourceUrl}
                        onChange={(e) => setSourceUrl(e.target.value)}
                        placeholder="https://example.com/article"
                      />
                    </label>
                    <button
                      type="button"
                      disabled={
                        sourceBusy || gen.busy || w.references.length >= 4
                      }
                      onClick={() => void source()}
                    >
                      {sourceBusy ? (
                        <Loader2 size={14} className={styles.spinIcon} />
                      ) : (
                        <Plus size={14} />
                      )}
                      Import reference
                    </button>
                    {w.references.map((r) => (
                      <div className={styles.reference} key={r.id}>
                        <a
                          href={safeUrl(r.url)}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          {r.title}
                        </a>
                        <span>
                          {r.text.length.toLocaleString()} characters imported
                        </span>
                        <button
                          type="button"
                          aria-label={`Remove reference ${r.title}`}
                          onClick={() =>
                            update((now) =>
                              patchWorkspace(now, {
                                references: workspace(now).references.filter(
                                  (x) => x.id !== r.id,
                                ),
                              }),
                            )
                          }
                        >
                          <X size={14} />
                        </button>
                      </div>
                    ))}
                  </div>
                </details>

                <details className={styles.details}>
                  <summary>
                    <Settings2 size={15} />
                    Brand &amp; author<span>Optional</span>
                  </summary>
                  <div className={styles.formStack}>
                    <label>
                      Website / brand name
                      <input
                        maxLength={100}
                        value={w.brand.name}
                        onChange={(e) =>
                          update((now) =>
                            patchWorkspace(now, {
                              brand: {
                                ...workspace(now).brand,
                                name: e.target.value,
                              },
                            }),
                          )
                        }
                      />
                    </label>
                    <label>
                      Brand color
                      <div className={styles.colorInput}>
                        <input
                          type="color"
                          value={w.brand.color}
                          onChange={(e) =>
                            update((now) =>
                              patchWorkspace(now, {
                                brand: {
                                  ...workspace(now).brand,
                                  color: e.target.value,
                                },
                              }),
                            )
                          }
                        />
                        <span>{w.brand.color.toUpperCase()}</span>
                      </div>
                    </label>
                    <div className={styles.logoRow}>
                      {w.brand.logo && (
                        <img src={w.brand.logo} alt="Your brand logo" />
                      )}
                      <button
                        type="button"
                        onClick={() => logoInput.current?.click()}
                      >
                        <Upload size={14} />
                        {w.brand.logo ? "Replace logo" : "Upload logo"}
                      </button>
                      {w.brand.logo && (
                        <button
                          type="button"
                          aria-label="Remove logo"
                          onClick={() =>
                            update((now) =>
                              patchWorkspace(now, {
                                brand: {
                                  ...workspace(now).brand,
                                  logo: undefined,
                                },
                              }),
                            )
                          }
                        >
                          <X size={14} />
                        </button>
                      )}
                    </div>
                    <label>
                      Author name
                      <input
                        maxLength={100}
                        value={p.authorName}
                        onChange={(e) => field("authorName", e.target.value)}
                      />
                    </label>
                    <label>
                      Website URL
                      <ToolUrlInput
                        type="url"
                        maxLength={1500}
                        value={p.brandSiteUrl}
                        onChange={(e) => field("brandSiteUrl", e.target.value)}
                        placeholder="https://your-site.com"
                      />
                    </label>
                    <p className={styles.muted}>
                      Branding applies to new visuals. Refresh existing images
                      to update their branding.
                    </p>
                  </div>
                </details>
              </div>
            )}

            {tab === "outline" && (
              <div className={styles.formStack}>
                <div>
                  <p className={styles.eyebrow}>02 · Shape the article</p>
                  <h2>Your outline &amp; sections</h2>
                  <p className={styles.muted}>
                    Click any section to jump to it in the editor, edit
                    headings, or generate remaining sections.
                  </p>
                </div>
                {p.sections.length === 0 ? (
                  <div className={styles.assetEmpty}>
                    <ListTree size={28} />
                    <p>
                      Build an outline from your brief, or add your own section.
                    </p>
                  </div>
                ) : (
                  p.sections.map((s, i) => {
                    const isWritten =
                      Boolean(s.bodyMarkdown.trim()) ||
                      s.subHeadings.some((h) => Boolean(h.bodyMarkdown.trim()));
                    return (
                      <div className={styles.outlineItem} key={s.id}>
                        <div className={styles.outlineLabel}>
                          <span>H2 · {String(i + 1).padStart(2, "0")}</span>
                          <span>
                            {isWritten ? (
                              <>
                                <Check size={13} /> Written
                              </>
                            ) : (
                              "To write"
                            )}
                          </span>
                        </div>
                        <input
                          aria-label={`Section ${i + 1} heading`}
                          value={s.h2Text}
                          maxLength={180}
                          disabled={gen.busy}
                          onChange={(e) => editOutline(s.id, e.target.value)}
                        />
                        <label className={styles.outlineSub}>
                          H3 subheadings, one per line
                          <textarea
                            rows={Math.max(2, s.subHeadings.length)}
                            disabled={gen.busy || Boolean(s.bodyMarkdown.trim())}
                            value={s.subHeadings
                              .map((h) => h.h3Text)
                              .join("\n")}
                            onChange={(e) =>
                              update((now) =>
                                patchWorkspace(
                                  {
                                    ...now,
                                    sections: now.sections.map((x) =>
                                      x.id === s.id
                                        ? {
                                            ...x,
                                            subHeadings: e.target.value
                                              .split("\n")
                                              .slice(0, 8)
                                              .map((h, n) => ({
                                                id:
                                                  x.subHeadings[n]?.id || id(),
                                                h3Text: h,
                                                keyPoints: [],
                                                bodyMarkdown:
                                                  x.subHeadings[n]
                                                    ?.bodyMarkdown || "",
                                              })),
                                          }
                                        : x,
                                    ),
                                  },
                                  { document: undefined },
                                ),
                              )
                            }
                          />
                        </label>
                        <div className={styles.outlineActions}>
                          <button
                            type="button"
                            aria-label={`Go to section ${i + 1}`}
                            onClick={() => {
                              setStudioUnlocked(true);
                              editor.current?.section(s.id);
                            }}
                          >
                            Go to section
                          </button>
                          <button
                            type="button"
                            onClick={() => openVisual(s.id)}
                            title="Customize this section's infographic"
                          >
                            <ImageIcon size={12} />
                            Visual
                          </button>
                          {[-1, 1].map((d) => (
                            <button
                              type="button"
                              key={d}
                              aria-label={`Move section ${i + 1} ${d < 0 ? "up" : "down"}`}
                              disabled={
                                gen.busy ||
                                bodyPresent ||
                                i + d < 0 ||
                                i + d >= p.sections.length
                              }
                              onClick={() =>
                                update((now) => {
                                  const sections = [...now.sections];
                                  [sections[i], sections[i + d]] = [
                                    sections[i + d],
                                    sections[i],
                                  ];
                                  return patchWorkspace(
                                    {
                                      ...now,
                                      sections: sections.map((s, j) => ({
                                        ...s,
                                        orderIndex: j + 1,
                                      })),
                                    },
                                    { document: undefined },
                                  );
                                })
                              }
                            >
                              {d < 0 ? (
                                <ArrowUp size={13} />
                              ) : (
                                <ArrowDown size={13} />
                              )}
                            </button>
                          ))}
                          <button
                            type="button"
                            aria-label={`Remove section ${i + 1}`}
                            disabled={gen.busy || bodyPresent}
                            onClick={() =>
                              update((now) =>
                                patchWorkspace(
                                  {
                                    ...now,
                                    sections: now.sections.filter(
                                      (x) => x.id !== s.id,
                                    ),
                                  },
                                  { document: undefined },
                                ),
                              )
                            }
                          >
                            <X size={13} />
                          </button>
                        </div>
                      </div>
                    );
                  })
                )}
                <button
                  type="button"
                  disabled={gen.busy || bodyPresent || p.sections.length >= 10}
                  onClick={() =>
                    update((now) =>
                      patchWorkspace(
                        {
                          ...now,
                          sections: [
                            ...now.sections,
                            makeSection(
                              {
                                heading: `New section ${now.sections.length + 1}`,
                                subheadings: [],
                              },
                              now.sections.length,
                            ),
                          ],
                        },
                        { document: undefined },
                      ),
                    )
                  }
                >
                  <Plus size={15} />
                  Add section
                </button>
                <button
                  type="button"
                  className={styles.primary}
                  disabled={
                    gen.busy ||
                    !missing ||
                    p.sections.some((s) => s.h2Text.trim().length < 2)
                  }
                  onClick={async () => {
                    await gen.draft();
                    setStudioUnlocked(true);
                  }}
                >
                  <Sparkles size={16} />
                  {bodyPresent
                    ? "Write remaining sections"
                    : "Write my article"}
                  <ChevronRight size={15} />
                </button>
                {bodyPresent && (
                  <p className={styles.muted}>
                    Your written sections are kept. Change structure directly in
                    the editor to preserve your text.
                  </p>
                )}
              </div>
            )}

            {tab === "review" && (
              <div className={styles.formStack}>
                <div>
                  <p className={styles.eyebrow}>
                    03 · Unified SEO &amp; Readability Scorecard
                  </p>
                  <h2>Article review</h2>
                  <p className={styles.muted}>
                    Live readability, structure, metadata, keyword, and visual
                    checks to guide your edits.
                  </p>
                </div>
                <div className={styles.scoreCard}>
                  <div
                    className={styles.scoreRing}
                    style={{
                      background: `conic-gradient(#10b981 ${report.score * 3.6}deg, rgba(148,163,184,0.2) 0)`,
                    }}
                  >
                    <span>
                      {report.score}
                      <small>/100</small>
                    </span>
                  </div>
                  <div>
                    <strong>Editorial &amp; SEO readiness</strong>
                    <p>
                      {report.words.toLocaleString()} words · {report.minutes}{" "}
                      min read
                    </p>
                  </div>
                </div>
                {report.checks.map((c) => (
                  <div className={styles.checkRow} key={c.id}>
                    <span
                      className={c.ok ? styles.checkOk : styles.checkPending}
                    >
                      {c.ok ? <Check size={12} /> : <span>•</span>}
                    </span>
                    <div>
                      <strong>{c.label}</strong>
                      <p>{c.detail}</p>
                    </div>
                    <span>
                      {c.ok ? c.weight : 0}/{c.weight}
                    </span>
                  </div>
                ))}
                <label className={styles.toggle}>
                  <input
                    type="checkbox"
                    checked={highlights}
                    onChange={(e) => setHighlights(e.target.checked)}
                  />
                  Highlight long sentences in the editor
                </label>
                <details className={styles.details}>
                  <summary>How this score works</summary>
                  <p className={styles.muted}>
                    Readability 35 points, structure 20, metadata 20, topic
                    alignment 10, reference presence 10, visuals 5. Source
                    presence does not verify a claim. English readability
                    heuristics may be less useful in other languages. No
                    AI-detection or plagiarism score is claimed.
                  </p>
                </details>
              </div>
            )}
          </div>

          <div className={styles.sidebarFooter}>
            <span className={styles.statusDot} />
            <span>{statusLabel}</span>
            {gen.busy && (
              <button type="button" onClick={gen.stop}>
                <Square size={12} />
                Stop
              </button>
            )}
          </div>
        </aside>

        {/* ZONE 1 (TOP META) + ZONE 3 (BIG RICH-TEXT & VISUAL EDITOR) */}
        <main className={styles.editorColumn} aria-label="Article workspace">
          {/* ZONE 1: Search Appearance (Recommended Meta Title & Description + Multiple Selectable Options) */}
          <section className={styles.metaPanel} aria-label="Search appearance">
            <div className={styles.metaTop}>
              <div>
                <p className={styles.eyebrow}>
                  Search appearance · Recommended &amp; AI Alternatives
                </p>
                <h2>Meta Title, Meta Description &amp; URL Slug</h2>
              </div>
              <span className={styles.subtleTag}>
                {p.metaPack.titleVariations.length
                  ? `${p.metaPack.titleVariations.length} Title Options Ready`
                  : "Editable"}
              </span>
            </div>

            <div className={styles.metaFieldsGrid}>
              <label>
                Meta title (Recommended)
                <span>
                  {p.metaPack.metaTitle.length} chars · {titlePx}/580 px
                </span>
                <input
                  maxLength={100}
                  placeholder="Your search result title"
                  value={p.metaPack.metaTitle}
                  onChange={(e) => meta("metaTitle", e.target.value)}
                />
              </label>

              <label>
                URL slug
                <span>Canonical path</span>
                <input
                  maxLength={180}
                  value={p.metaPack.urlSlug}
                  onChange={(e) =>
                    meta("urlSlug", normalizeSeoSlug(e.target.value))
                  }
                  placeholder="your-article-slug"
                />
              </label>
            </div>

            <label>
              Meta description (Recommended)
              <span>
                {p.metaPack.metaDescription.length} chars · {descPx}/920 px
              </span>
              <textarea
                rows={2}
                maxLength={220}
                placeholder="A useful, honest summary of the article"
                value={p.metaPack.metaDescription}
                onChange={(e) => meta("metaDescription", e.target.value)}
              />
            </label>

            <details
              className={styles.metaDetails}
              open={p.metaPack.titleVariations.length > 1}
            >
              <summary>
                ✨ Switch Meta Title or Description Option (
                {p.metaPack.titleVariations.length || 0} Title Options ·{" "}
                {w.metaDescriptions.length || 0} Description Options) &amp;
                Canonical URL
              </summary>
              <div className={styles.metaOptions}>
                <div>
                  <p className={styles.eyebrow}>
                    Select a Meta Title Variation
                  </p>
                  {p.metaPack.titleVariations.length ? (
                    p.metaPack.titleVariations.map((v, i) => (
                      <button
                        type="button"
                        className={styles.option}
                        aria-pressed={v.title === p.metaPack.metaTitle}
                        key={i}
                        onClick={() => meta("metaTitle", v.title)}
                      >
                        {v.title === p.metaPack.metaTitle && (
                          <Check size={14} />
                        )}
                        <span>
                          {i === 0 ? "★ Recommended: " : `Option ${i + 1}: `}
                          {v.title}
                        </span>
                      </button>
                    ))
                  ) : (
                    <p className={styles.muted}>
                      Build an outline to get tailored title suggestions.
                    </p>
                  )}
                </div>
                <div>
                  <p className={styles.eyebrow}>
                    Select a Meta Description Variation
                  </p>
                  {w.metaDescriptions.length ? (
                    w.metaDescriptions.map((s, i) => (
                      <button
                        type="button"
                        className={styles.option}
                        aria-pressed={s === p.metaPack.metaDescription}
                        key={i}
                        onClick={() => meta("metaDescription", s)}
                      >
                        {s === p.metaPack.metaDescription && (
                          <Check size={14} />
                        )}
                        <span>
                          {i === 0 ? "★ Recommended: " : `Option ${i + 1}: `}
                          {s}
                        </span>
                      </button>
                    ))
                  ) : (
                    <p className={styles.muted}>
                      Build an outline to get tailored meta description
                      suggestions.
                    </p>
                  )}
                </div>
              </div>
              <div className={styles.twoCols}>
                <label>
                  Canonical URL, if known
                  <ToolUrlInput
                    type="url"
                    maxLength={1500}
                    value={p.metaPack.canonicalUrl}
                    onChange={(e) => meta("canonicalUrl", e.target.value)}
                    placeholder="https://your-site.com/article"
                  />
                </label>
                <div className={styles.serpPreviewMini}>
                  <p className={styles.eyebrow}>Live Google SERP Preview</p>
                  <strong>
                    {p.metaPack.metaTitle ||
                      p.metaPack.h1Title ||
                      "Your Article Title"}
                  </strong>
                  <span>
                    {safeUrl(p.metaPack.canonicalUrl) ||
                      `https://doitwithai.tools/${p.metaPack.urlSlug || "article-slug"}`}
                  </span>
                  <p>
                    {p.metaPack.metaDescription ||
                      "Your meta description will appear here in search results."}
                  </p>
                </div>
              </div>
            </details>
          </section>

          {w.run.error && !gen.busy && (
            <div className={styles.error} role="alert">
              <div>
                <strong>{statusLabel}</strong>
                <p>{w.run.error}</p>
              </div>
              <button
                type="button"
                onClick={() =>
                  missing && p.sections.length
                    ? void gen.draft()
                    : void gen.plan()
                }
              >
                Retry step
              </button>
            </div>
          )}

          {/* ZONE 3: BIG RICH TEXT & INLINE VISUAL ARTICLE EDITOR HEADER */}
          <div className={styles.editorLabel}>
            <span>
              <FileText size={15} />
              Rich Article &amp; Inline Visual Editor
            </span>
            <div className={styles.editorQuickBar}>
              <span className={styles.wordCountPill}>
                {report.words.toLocaleString()} words · {report.minutes} min
                read
              </span>
              {report.words > 0 && (
                <div
                  className={styles.quickDownloadRow}
                  aria-label="Quick article downloads"
                >
                  {["pdf", "docx", "html", "markdown"].map((fmt) => (
                    <button
                      key={fmt}
                      type="button"
                      disabled={Boolean(exportBusy)}
                      onClick={() => void handleQuickExport(fmt)}
                      title={`Download article as ${fmt.toUpperCase()}`}
                    >
                      <FileDown size={12} />
                      {fmt === "markdown" ? "MD" : fmt.toUpperCase()}
                    </button>
                  ))}
                </div>
              )}
              <button
                type="button"
                className={styles.textButton}
                onClick={() => {
                  setTab("review");
                  setFocus(false);
                }}
              >
                Review checks ({report.score}/100)
                <ChevronRight size={13} />
              </button>
            </div>
          </div>

          <ArticleEditor
            key={p.projectId}
            ref={editor}
            project={p}
            highlights={highlights}
            onChange={(doc: RichNode) =>
              update((now) => syncDocument(now, doc))
            }
            onEditVisual={openVisual}
            onSelection={setSelection}
          />

          <div className={styles.assistantBar}>
            <span>
              <Sparkles size={15} />
              Revise a passage
            </span>
            <input
              aria-label="Revision instruction"
              maxLength={2000}
              value={instruction}
              onChange={(e) => setInstruction(e.target.value)}
            />
            <button
              type="button"
              disabled={
                !selection.trim() ||
                !instruction.trim() ||
                rewriteBusy ||
                gen.busy
              }
              onClick={() => void requestRewrite()}
            >
              {rewriteBusy ? (
                <Loader2 size={14} className={styles.spinIcon} />
              ) : (
                <Sparkles size={14} />
              )}
              Suggest revision
            </button>
          </div>

          {rewrite && (
            <section
              className={styles.rewritePreview}
              aria-label="Suggested revision"
            >
              <div>
                <h3>Review the suggested revision</h3>
                <button
                  type="button"
                  aria-label="Dismiss revision"
                  onClick={() => setRewrite(null)}
                >
                  <X size={15} />
                </button>
              </div>
              <textarea
                aria-label="Suggested text"
                rows={5}
                value={rewrite.text}
                onChange={(e) =>
                  setRewrite({ ...rewrite, text: e.target.value })
                }
              />
              <div className={styles.buttonRow}>
                <button
                  type="button"
                  className={styles.primary}
                  onClick={() => {
                    if (articleRevision(current.current) !== rewrite.revision) {
                      setMessage(
                        "The article changed after this suggestion. Select the passage again to request a fresh revision.",
                      );
                      return;
                    }
                    editor.current?.replace(
                      rewrite.from,
                      rewrite.to,
                      rewrite.text,
                    );
                    setRewrite(null);
                  }}
                >
                  Apply to selection
                </button>
                <button type="button" onClick={() => setRewrite(null)}>
                  Keep original
                </button>
              </div>
            </section>
          )}

          <p className={styles.editorFootnote}>
            Your draft stays editable. Click any inline section infographic to
            customize its layout, explanations, or color palette, or scroll
            below for social media cards, carousels, newsletters, and downloads.
          </p>
        </main>
      </div>

      {/* ZONE 4 (BOTTOM): OMNICHANNEL SOCIAL, VISUALS, CAROUSEL, NEWSLETTER & DOWNLOADS SUITE */}
      {!focus && (
        <AssetDeck
          key={p.projectId}
          project={p}
          onChange={update}
          onEditVisual={openVisual}
          onInsertVisual={(sid) => {
            editor.current?.insertVisual(sid);
            editor.current?.section(sid);
          }}
        />
      )}

      {visualSection &&
        typeof document !== "undefined" &&
        createPortal(
          <div
            ref={dialog}
            className={styles.modalBackdrop}
            role="dialog"
            aria-modal="true"
            aria-label="Customize section infographic"
          >
            <div className={styles.modal}>
              <div className={styles.modalHeader}>
                <div>
                  <p className={styles.eyebrow}>Section image studio</p>
                  <h2>{visualSection.h2Text}</h2>
                </div>
                <button
                  type="button"
                  aria-label="Close image studio"
                  onClick={() => setVisualId(null)}
                >
                  <X size={20} />
                </button>
              </div>
              <InfographicStudio
                mode="embedded-modal"
                initialConfig={
                  visualSection.infographicConfig.nodes.length
                    ? visualSection.infographicConfig
                    : refreshVisual(visualSection, p).infographicConfig
                }
                sourceSection={visualSection}
                onSaveConfig={saveVisual}
                onClose={() => setVisualId(null)}
              />
            </div>
          </div>,
          document.body,
        )}
    </div>
  );
}
