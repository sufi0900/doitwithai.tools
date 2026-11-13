"use client";
import React, { useEffect, useMemo, useRef, useState } from "react";
import dynamic from "next/dynamic";
import { createPortal } from "react-dom";
import {
  CheckCircle2,
  Download,
  FileDown,
  FileText,
  Focus,
  FolderOpen,
  ListTree,
  Loader2,
  Moon,
  Plus,
  Sparkles,
  Sun,
  Trash2,
  Upload,
  Wand2,
  X,
} from "lucide-react";
import type { BlogInfographicConfig } from "@/lib/blog-writer/canonical-state";
import { useWorkspace } from "./useWorkspace";
import { useGeneration } from "./useGeneration";
import {
  articleMarkdown,
  articleRevision,
  autoWeaveContextualInternalLinks,
  bodyOf,
  hash,
  id,
  markdownNodes,
  parseBrief,
  parseBriefDirectives,
  patchWorkspace,
  readiness,
  refreshVisual,
  safeUrl,
  sanitizeMarkdownHeadings,
  setSectionBody,
  splitRunOnSentences,
  stripAiClichesAndPolishRhythm,
  syncDocument,
  wordCount,
  workspace,
} from "./model";
import type { Project, ResearchPacket, RichNode } from "./types";
import ArticleEditor, { type EditorHandle } from "./ArticleEditor";
import AssetDeck from "./AssetDeck";
import { OnboardingGate } from "./OnboardingGate";
import { AgentPipelineTheatre } from "./AgentPipelineTheatre";
import {
  LeftStudioPanel,
  type ReadabilityHighlightToggles,
  type StudioLeftTab,
} from "./LeftStudioPanel";
import { SearchAppearancePanel } from "./SearchAppearancePanel";
import { FeaturedBannerArtwork } from "./FeaturedBannerArtwork";
import { BriefSettingsModal } from "./BriefSettingsModal";
import { downloadArticle, saveBlob } from "./assets";
import styles from "./workspace.module.css";

const InfographicStudio = dynamic(
  () => import("@/features/blog-infographic-studio/BlogInfographicStudio"),
  {
    ssr: false,
    loading: () => <p className={styles.loading}>Opening image studio…</p>,
  },
);

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

  const [leftTab, setLeftTab] = useState<StudioLeftTab>("helper"),
    [briefModalOpen, setBriefModalOpen] = useState(false),
    [researchBusy, setResearchBusy] = useState(false),
    [highlightToggles, setHighlightToggles] =
      useState<ReadabilityHighlightToggles>({
        veryHard: true,
        hard: true,
        passive: false,
        simpler: false,
      }),
    [targetGrade, setTargetGrade] = useState(10),
    [studioUnlocked, setStudioUnlocked] = useState(Boolean(w.studioUnlocked)),
    [darkStudio, setDarkStudio] = useState(true),
    [focus, setFocus] = useState(false),
    [selection, setSelection] = useState(""),
    [rewrite, setRewrite] = useState<{
      original: string;
      proposed: string;
      from: number;
      to: number;
      scope: "selection" | "article";
      revision: string;
    } | null>(null),
    [rewriteBusy, setRewriteBusy] = useState(false),
    [rewriteError, setRewriteError] = useState(""),
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
    setBriefModalOpen(false);
    const hasDraft =
      Boolean(workspace(p).studioUnlocked) ||
      p.sections.some(
        (s) =>
          s.bodyMarkdown.trim() ||
          s.subHeadings.some((h) => h.bodyMarkdown.trim()),
      ) ||
      Boolean(workspace(p).document && readiness(p).words > 0);
    setStudioUnlocked(hasDraft);
    setLeftTab("helper");
    setRewrite(null);
    setRewriteError("");
    setSelection("");
    setMessage("");
    rewriteAbort.current?.abort();
    setRewriteBusy(false);
  }, [p.projectId]);

  useEffect(() => {
    if (bodyPresent || manualDraft || w.run.status === "done" || w.studioUnlocked) {
      setStudioUnlocked(true);
    }
  }, [bodyPresent, manualDraft, w.run.status, w.studioUnlocked]);

  useEffect(() => {
    const key = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setVisualId(null);
        setBriefModalOpen(false);
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

  const meta = (k: keyof Project["metaPack"], value: string) =>
    update((now) => ({
      ...now,
      metaPack: { ...now.metaPack, [k]: value },
    }));

  const field = (k: keyof Project, value: string) =>
    update((now) => ({ ...now, [k]: value }));

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

  const requestRewrite = async (
    customInstruction: string,
    scope: "selection" | "article",
    explicitRange?: { from: number; to: number; text: string },
  ) => {
    const picked = explicitRange || editor.current?.selection();
    const targetText =
      scope === "selection" && picked?.text.trim()
        ? picked.text
        : articleMarkdown(current.current).slice(0, 14000);
    if (!targetText.trim()) {
      setRewriteError("Add or select text in the article first.");
      return;
    }
    if (!customInstruction.trim()) {
      setLeftTab("helper");
      return;
    }
    const revision = articleRevision(current.current),
      pid = p.projectId,
      c = new AbortController();
    rewriteAbort.current = c;
    setRewriteBusy(true);
    setRewriteError("");
    try {
      const res = await gen.rewrite(
        targetText.slice(0, 18000),
        customInstruction,
        c.signal,
      );
      if (current.current.projectId !== pid) return;
      setRewrite({
        original: targetText,
        proposed: res.data.text,
        from: scope === "selection" && picked ? picked.from : 0,
        to: scope === "selection" && picked ? picked.to : 0,
        scope,
        revision,
      });
    } catch (e) {
      setRewriteError(errorText(e));
    } finally {
      setRewriteBusy(false);
    }
  };

  const applyRewriteProposal = () => {
    if (!rewrite) return;
    if (articleRevision(current.current) !== rewrite.revision) {
      setRewriteError(
        "The article changed after this revision was generated. Run the helper again.",
      );
      return;
    }
    if (rewrite.scope === "selection" && rewrite.to > rewrite.from) {
      editor.current?.replace(rewrite.from, rewrite.to, rewrite.proposed);
    } else {
      update((now) => {
        const synced = syncDocument(now, {
          type: "doc",
          content: markdownNodes(rewrite.proposed),
        });
        const refreshedSections = synced.sections.map((sec) => {
          try {
            return refreshVisual(sec, synced);
          } catch {
            return sec;
          }
        });
        return patchWorkspace(
          { ...synced, sections: refreshedSections },
          { document: undefined },
        );
      });
    }
    setRewrite(null);
  };

  const refreshResearchPacket = async () => {
    if (researchBusy) return;
    setResearchBusy(true);
    setMessage("");
    const directives = parseBriefDirectives(
      current.current.rawUserBriefOrSourceText,
    );
    const site = (
      current.current.brandSiteUrl ||
      directives.websiteUrl ||
      "https://doitwithai.tools"
    ).trim();
    try {
      const res = await fetch("/api/writer-workspace/research", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        signal: AbortSignal.timeout(35000),
        body: JSON.stringify({
          requestId: id(),
          brief:
            current.current.rawUserBriefOrSourceText ||
            current.current.metaPack.h1Title ||
            "Article topic",
          keyword: current.current.keywordCluster.primaryKeyword,
          websiteUrl: site,
          audience: current.current.keywordCluster.targetAudience,
          tone: current.current.keywordCluster.toneOfVoice,
          language: workspace(current.current).language,
          includeWebResearch: true,
        }),
      });
      const json = await res.json().catch(() => null);
      if (!res.ok || !json?.ok || !json.packet) {
        throw new Error(json?.error || "Could not refresh research links.");
      }
      const packet = json.packet as ResearchPacket;
      update((now) => {
        const nw = workspace(now);
        const mergedRefs = [...nw.references];
        for (const ext of packet.externalLinks || []) {
          const validUrl = safeUrl(ext.url);
          if (validUrl && !mergedRefs.some((r) => r.url === validUrl)) {
            mergedRefs.push({
              id: id(),
              url: validUrl,
              title: ext.title || validUrl,
              text:
                ext.snippet && ext.snippet.length >= 90
                  ? ext.snippet
                  : `${ext.title || validUrl} — Verified reference material and technical documentation supporting "${packet.primaryTopic || now.projectTitle}".`,
            });
          }
        }
        return {
          ...now,
          brandSiteUrl: now.brandSiteUrl || packet.siteScanned || site,
          keywordCluster: {
            ...now.keywordCluster,
            primaryKeyword:
              now.keywordCluster.primaryKeyword || packet.primaryKeyword || "",
            secondaryKeywords: packet.secondaryKeywords?.length
              ? packet.secondaryKeywords
              : now.keywordCluster.secondaryKeywords,
            lsiEntities: packet.lsiEntities?.length
              ? packet.lsiEntities
              : now.keywordCluster.lsiEntities,
          },
          internalLinks: (packet.internalLinks || []).map((l) => ({
            id: id(),
            anchorText: l.anchorText || l.title,
            targetTitle: l.title,
            targetUrl: l.url,
            category: "pillar-guide" as const,
          })),
          writerWorkspace: {
            ...nw,
            research: packet,
            references: mergedRefs.slice(0, 8),
          },
        };
      });
      setMessage(
        `Research refreshed: ${packet.internalLinks.length} internal links & ${packet.externalLinks.length} authority references ready.`,
      );
    } catch (e) {
      setMessage(errorText(e));
    } finally {
      setResearchBusy(false);
    }
  };

  const openVisual = (sid: string) => setVisualId(sid);

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

  const showOnboardingHero =
    !studioUnlocked && !bodyPresent && !manualDraft && !w.studioUnlocked;

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

  const launchGeneration = async (mode: "all" | "plan") => {
    const parsed = parseBrief(current.current.rawUserBriefOrSourceText);
    const directives = parseBriefDirectives(
      current.current.rawUserBriefOrSourceText,
    );
    if (
      (parsed.keyword && !current.current.keywordCluster.primaryKeyword) ||
      (directives.websiteUrl && !current.current.brandSiteUrl)
    ) {
      update((now) => ({
        ...now,
        brandSiteUrl: now.brandSiteUrl || directives.websiteUrl,
        keywordCluster: {
          ...now.keywordCluster,
          primaryKeyword:
            now.keywordCluster.primaryKeyword || parsed.keyword,
        },
      }));
    }
    if (mode === "all") {
      await gen.generateAll();
    } else {
      await gen.plan();
    }
  };

  return (
    <div
      className={`${styles.shell} ${darkStudio ? styles.darkShell : ""} ${focus ? styles.focusMode : ""}`}
    >
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
          {!showOnboardingHero && !gen.busy ? (
            <>
              <button
                type="button"
                aria-pressed={focus}
                onClick={() => setFocus(!focus)}
              >
                <Focus size={15} />
                <span>{focus ? "Exit focus" : "Focus"}</span>
              </button>
              <a
                href="#writer-assets"
                className={styles.primary}
                onClick={() => setFocus(false)}
              >
                <Download size={15} />
                Publishing kit
              </a>
            </>
          ) : null}
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

      {/* PHASE 1: ANIMATED 11-AGENT PIPELINE THEATRE (HIDES DASHBOARD WHILE RUNNING) */}
      {gen.busy ? (
        <AgentPipelineTheatre
          project={p}
          busy={gen.busy}
          onStop={gen.stop}
        />
      ) : showOnboardingHero ? (
        <OnboardingGate
          project={p}
          busy={gen.busy}
          errorMessage={w.run.error}
          onPatchProject={(patch) => update((now) => ({ ...now, ...patch }))}
          onPatchWorkspace={(patch) => update((now) => patchWorkspace(now, patch))}
          onGenerateAll={() => void launchGeneration("all")}
          onPlanFirst={() => void launchGeneration("plan")}
          onOpenStudioManually={() => {
            setStudioUnlocked(true);
            update((now) => patchWorkspace(now, { studioUnlocked: true }));
          }}
        />
      ) : (
        <>
          {/* FULL 4-ZONE STUDIO DASHBOARD */}
          <div className={styles.workspaceGrid}>
            <LeftStudioPanel
              project={p}
              selection={selection}
              activeTab={leftTab}
              highlightToggles={highlightToggles}
              targetGrade={targetGrade}
              aiRevisionState={{
                busy: rewriteBusy,
                original: rewrite?.original || "",
                proposed: rewrite?.proposed || "",
                scope: rewrite?.scope || "selection",
                error: rewriteError,
              }}
              onChangeTab={setLeftTab}
              onToggleHighlight={(k) =>
                setHighlightToggles((prev) => ({ ...prev, [k]: !prev[k] }))
              }
              onChangeTargetGrade={setTargetGrade}
              onOpenBriefModal={() => setBriefModalOpen(true)}
              onRunAiHelper={(inst, scope) =>
                void requestRewrite(inst, scope)
              }
              onQuickReadabilityPolish={() => {
                update((now) => {
                  const polishedSections = now.sections.map((sec) => {
                    const nextBody = stripAiClichesAndPolishRhythm(bodyOf(sec));
                    const updatedSec = setSectionBody(sec, nextBody);
                    try {
                      return refreshVisual(updatedSec, now);
                    } catch {
                      return updatedSec;
                    }
                  });
                  const polishedIntro = stripAiClichesAndPolishRhythm(
                    now.metaPack.aeoDirectAnswer50Words || "",
                  );
                  return patchWorkspace(
                    {
                      ...now,
                      metaPack: {
                        ...now.metaPack,
                        aeoDirectAnswer50Words: polishedIntro,
                      },
                      sections: polishedSections,
                    },
                    { document: undefined, quickAnswerBox: polishedIntro },
                  );
                });
                setMessage(
                  "Polished sentence rhythm, stripped AI clichés, split headings cleanly, and refreshed section infographics.",
                );
              }}
              onApplyRevision={applyRewriteProposal}
              onDiscardRevision={() => setRewrite(null)}
              onInsertLink={(anchor, url) =>
                editor.current?.insertLink(anchor, url)
              }
              onAutoWeaveInternalLinks={() => {
                let count = 0;
                update((now) => {
                  const res = autoWeaveContextualInternalLinks(now, 4);
                  count = res.linkedCount;
                  return res.project;
                });
                setMessage(
                  count > 0
                    ? `Wove ${count} verified internal link${count === 1 ? "" : "s"} into relevant body sections.`
                    : "All top internal links are already woven into your article.",
                );
              }}
              onRunResearch={() => void refreshResearchPacket()}
              researchBusy={researchBusy}
            />

            <main className={styles.editorColumn} aria-label="Article workspace">
              {/* ZONE 1: SEARCH APPEARANCE, SERP SIMULATOR & SCHEMA */}
              <SearchAppearancePanel
                project={p}
                onUpdateMeta={(patch) =>
                  update((now) => ({
                    ...now,
                    metaPack: { ...now.metaPack, ...patch },
                  }))
                }
              />

              {w.run.error ? (
                <div className={styles.error} role="alert">
                  <div>
                    <strong>Writing checkpoint</strong>
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
              ) : null}

              {/* PHASE 5: CONTENT ORGANIZER — CLICKABLE TOC & 50-WORD AEO DIRECT ANSWER */}
              {p.sections.length > 0 ? (
                <div className={styles.tocStrip} aria-label="Table of contents">
                  <span className={styles.tocLabel}>
                    <ListTree size={14} /> Contents:
                  </span>
                  {p.sections.map((sec, idx) => (
                    <button
                      key={sec.id}
                      type="button"
                      className={styles.tocPill}
                      onClick={() => editor.current?.section(sec.id)}
                    >
                      {idx + 1}. {sec.h2Text}
                    </button>
                  ))}
                </div>
              ) : null}

              {(p.metaPack.aeoDirectAnswer50Words || w.quickAnswerBox) && (
                <section
                  className={styles.aeoAnswerCard}
                  aria-label="50-word quick answer box"
                >
                  <div className={styles.aeoAnswerHeader}>
                    <span>
                      <Sparkles size={13} /> 50-Word AEO Direct Answer Box
                    </span>
                    <small>Featured Snippet / Direct Answer Summary</small>
                  </div>
                  <textarea
                    rows={2}
                    className={styles.aeoAnswerInput}
                    value={
                      p.metaPack.aeoDirectAnswer50Words || w.quickAnswerBox || ""
                    }
                    onChange={(e) => {
                      const val = e.target.value;
                      update((now) =>
                        patchWorkspace(
                          {
                            ...now,
                            metaPack: {
                              ...now.metaPack,
                              aeoDirectAnswer50Words: val,
                            },
                          },
                          { quickAnswerBox: val },
                        ),
                      );
                    }}
                  />
                </section>
              )}

              {/* PHASE 5: 16:9 HORIZONTAL FEATURED BANNER & WCAG ALT TEXT AGENT */}
              <FeaturedBannerArtwork
                project={p}
                onUpdateBanner={(patch) =>
                  update((now) =>
                    patchWorkspace(now, {
                      featuredBanner: {
                        ...(workspace(now).featuredBanner || {
                          headline: now.metaPack.h1Title || now.projectTitle,
                          subheadline: now.metaPack.metaDescription,
                          altText: now.metaPack.h1Title || now.projectTitle,
                          aspectRatio: "16:9",
                          width: 1200,
                          height: 630,
                        }),
                        ...patch,
                      },
                    }),
                  )
                }
              />

              {/* ZONE 3: RICH H1-H6 ARTICLE EDITOR WITH EMBEDDED READABILITY & RIGHT-CLICK TELL AI */}
              <div className={styles.editorLabel}>
                <span>
                  <FileText size={15} />
                  Rich H1–H6 Article &amp; Inline Visual Editor
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
                </div>
              </div>

              <ArticleEditor
                key={p.projectId}
                ref={editor}
                project={p}
                highlights={leftTab === "readability" && Object.values(highlightToggles).some(Boolean)}
                highlightToggles={highlightToggles}
                targetGrade={targetGrade}
                onChange={(doc: RichNode) =>
                  update((now) => syncDocument(now, doc))
                }
                onEditVisual={openVisual}
                onSelection={setSelection}
                onTellAi={(inst, range, openTab) => {
                  if (openTab) setLeftTab("helper");
                  setFocus(false);
                  if (range.text.trim()) setSelection(range.text);
                  if (inst.trim()) {
                    void requestRewrite(inst, "selection", range);
                  }
                }}
              />

              {/* PHASE 5: STRUCTURED FAQ SECTION & SCHEMA ORGANIZER */}
              <section
                className={styles.faqOrganizerCard}
                aria-label="Structured FAQ accordion"
              >
                <div className={styles.faqOrganizerHeader}>
                  <div>
                    <p className={styles.eyebrow}>FAQPage Rich Schema</p>
                    <h3>Frequently Asked Questions ({p.faqs.length})</h3>
                  </div>
                  <button
                    type="button"
                    className={styles.inlineToggleBtn}
                    onClick={() =>
                      update((now) => ({
                        ...now,
                        faqs: [
                          ...now.faqs,
                          {
                            id: id(),
                            question: "What should readers know next?",
                            answer: "Add a clear, direct 2-sentence answer here.",
                          },
                        ],
                      }))
                    }
                  >
                    <Plus size={13} /> Add FAQ Item
                  </button>
                </div>
                {p.faqs.length ? (
                  <div className={styles.faqList}>
                    {p.faqs.map((faq, idx) => {
                      const faqWords = wordCount(faq.answer || "");
                      const faqOptimal = faqWords >= 30 && faqWords <= 60;
                      return (
                      <div key={faq.id || idx} className={styles.faqItemBox}>
                        <div className={styles.linkCardTop}>
                          <span className={styles.eyebrow}>FAQ #{idx + 1} · People Also Ask</span>
                          <span className={faqOptimal ? styles.kwHitBadge : styles.linkNewBadge}>
                            {faqWords}w ·{" "}
                            {faqOptimal
                              ? "PAA Optimal (35–55w)"
                              : faqWords < 30
                                ? "Expand to 35–55w"
                                : "Trim to 35–55w"}
                          </span>
                        </div>
                        <div className={styles.faqItemTop}>
                          <input
                            className={styles.input}
                            value={faq.question}
                            aria-label={`FAQ question ${idx + 1}`}
                            onChange={(e) => {
                              const val = e.target.value;
                              update((now) => ({
                                ...now,
                                faqs: now.faqs.map((f, i) =>
                                  i === idx ? { ...f, question: val } : f,
                                ),
                              }));
                            }}
                          />
                          <button
                            type="button"
                            className={styles.iconDangerBtn}
                            aria-label={`Delete FAQ ${idx + 1}`}
                            onClick={() =>
                              update((now) => ({
                                ...now,
                                faqs: now.faqs.filter((_, i) => i !== idx),
                              }))
                            }
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                        <textarea
                          rows={2}
                          className={styles.area}
                          value={faq.answer}
                          aria-label={`FAQ answer ${idx + 1}`}
                          onChange={(e) => {
                            const val = e.target.value;
                            update((now) => ({
                              ...now,
                              faqs: now.faqs.map((f, i) =>
                                i === idx ? { ...f, answer: val } : f,
                              ),
                            }));
                          }}
                        />
                      </div>
                      );
                    })}
                  </div>
                ) : (
                  <p className={styles.leftMetaSub}>
                    FAQs are auto-generated after drafting and populate FAQPage JSON-LD schema automatically.
                  </p>
                )}
              </section>

              <p className={styles.editorFootnote}>
                Right-click any paragraph or highlight text to &ldquo;Tell AI about it&rdquo;. Click any inline section infographic to customize its layout and WCAG alt text.
              </p>
            </main>
          </div>

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
        </>
      )}

      <BriefSettingsModal
        open={briefModalOpen}
        project={p}
        sourceUrl={sourceUrl}
        sourceBusy={sourceBusy}
        onChangeSourceUrl={setSourceUrl}
        onAddSource={() => void source()}
        onClose={() => setBriefModalOpen(false)}
        onPatchProject={(patch) => update((now) => ({ ...now, ...patch }))}
        onPatchWorkspace={(patch) => update((now) => patchWorkspace(now, patch))}
        onEditSectionTitle={editOutline}
        onTriggerLogoUpload={() => logoInput.current?.click()}
        onRebuildPlan={() => void gen.plan()}
        onDraftMissing={() => void gen.draft()}
        busy={gen.busy}
      />

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
