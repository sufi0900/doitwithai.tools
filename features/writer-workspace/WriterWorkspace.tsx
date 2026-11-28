"use client";
import React, { useEffect, useMemo, useRef, useState } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTheme } from "next-themes";
import { createPortal } from "react-dom";
import {
  CheckCircle2,
  ChevronDown,
  ClipboardCopy,
  PanelRightOpen,
  MoreHorizontal,
  Download,
  FileDown,
  FileText,
  Focus,
  FolderOpen,
  ListTree,
  Loader2,
  Moon,
  PanelLeft,
  Plus,
  Sparkles,
  Sun,
  Trash2,
  Upload,
  Wand2,
  X,
} from "lucide-react";
import type { BlogInfographicConfig } from "@/lib/blog-writer/canonical-state";
import {
  clearWriterAutomationBatchManifest,
  loadWriterAutomationBatchManifest,
  type WriterAutomationBatchManifest,
} from "@/lib/shared/writer-batch-manifest";
import { useWorkspace } from "./useWorkspace";
import { useGeneration } from "./useGeneration";
import { WRITER_OPEN_PROJECT_EVENT } from "@/lib/studio/article-library";
import {
  articleMarkdown,
  computeContentScorecard,
  auditContextualLinkOpportunities,
  auditSerpPixelAndCtrReadiness,
  applyContentRefreshUpgrade,
  auditQuickAnswerBoxReadiness,
  autoWeaveContextualInternalLinks,
  bodyOf,
  convertStatementHeadingsToQuestions,
  generateArticleComprehensionQuiz,
  injectUncoveredQuestionsIntoFaqs,
  normalizeFaqPaaLengths,
  optimizeQuickAnswerBox50Words,
  optimizeVisualAltTexts,
  runMasterAeoAndReadinessPolish,
  hash,
  id,
  markdownNodes,
  parseBrief,
  parseBriefDirectives,
  patchWorkspace,
  readiness,
  refreshVisual,
  safeUrl,
  projectDocument,
  syncDocument,
  weaveSectionTakeawayCallouts,
  wordCount,
  workspace,
} from "./model";
import type { Project, ResearchPacket, RichNode } from "./types";
import ArticleEditor, { type EditorHandle } from "./ArticleEditor";
import AssetDeck from "./AssetDeck";
import { ConnectedWebsitePublishBar } from "./ConnectedWebsitePublishBar";
import { authorizedWebsiteFetch } from "@/features/website-builder/lib/supabase/browser";
import type {
  ConnectedWebsiteSummary,
  WriterArticleBridgeInput,
} from "@/features/website-builder/ecosystem-bridge";
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
import { ContentScorePanel } from "./ContentScorePanel";
import { downloadArticle, htmlArticle, saveBlob } from "./assets";
import styles from "./workspace.module.css";
import WriterMenu from "./WriterMenu";
import WriterInspector, { WriterOutline, type InspectorTab } from "./WriterInspector";
import assistantStyles from "./article-assistant.module.css";
import { ArticleAssistant, type AssistantLaunch } from "./ArticleAssistant";
import { articleDownloads, type AssistantReply, type Passage, type SavedProposal } from "./article-assistant";

const InfographicStudio = dynamic(
  () => import("@/features/blog-infographic-studio/BlogInfographicStudio"),
  {
    ssr: false,
    loading: () => <p className={styles.loading}>Opening image studio…</p>,
  },
);

function assistantRevision(project: Project) {
  return hash(JSON.stringify(projectDocument(project)));
}

function errorText(e: unknown) {
  return e instanceof Error
    ? e.message
    : "Something went wrong. Please try again.";
}

export default function WriterWorkspace({ documentNavigation, articleSwitcher, repurposeActions }: {
  documentNavigation?: React.ReactNode;
  articleSwitcher?: React.ReactNode;
  repurposeActions?: React.ReactNode;
} = {}) {
  const pathname = usePathname() || "";
  const isStudioEmbedded = pathname === "/studio" || pathname.startsWith("/studio/");
  const { resolvedTheme } = useTheme();
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

  const [leftTab, setLeftTab] = useState<StudioLeftTab>("readability"),
    [leftOpen, setLeftOpen] = useState(false),
    [rightScoreOpen, setRightScoreOpen] = useState(true),
    [workspaceMode, setWorkspaceMode] = useState<
      "editor" | "meta" | "visuals" | "faqs"
    >("editor"),
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
    [standaloneDark, setStandaloneDark] = useState(true),
    [focusRequested, setFocus] = useState(false),
    [exportBusy, setExportBusy] = useState(""),
    [message, setMessage] = useState(""),
    [sourceUrl, setSourceUrl] = useState(""),
    [sourceBusy, setSourceBusy] = useState(false),
    [visualId, setVisualId] = useState<string | null>(null),
    [menu, setMenu] = useState(false),
    [connectedWebsites, setConnectedWebsites] = useState<
      ConnectedWebsiteSummary[]
    >([]),
    [websiteInternalLinks, setWebsiteInternalLinks] = useState<
      Array<{
        siteProjectId: string;
        siteName: string;
        publicSlug: string;
        title: string;
        slug: string;
        url: string;
      }>
    >([]),
    [targetSiteId, setTargetSiteId] = useState<string>(""),
    [batchManifest, setBatchManifest] =
      useState<WriterAutomationBatchManifest | null>(null);

  const syncSiteInternalLinks = React.useCallback(
    (
      siteId: string,
      linksSource = websiteInternalLinks,
    ) => {
      if (!siteId || !linksSource.length) return;
      const matching = linksSource.filter((l) => l.siteProjectId === siteId);
      if (!matching.length) return;
      update((now) => {
        const existingUrls = new Set(now.internalLinks.map((l) => l.targetUrl));
        const additions = matching
          .filter((item) => !existingUrls.has(item.url))
          .map((item) => ({
            id: `site-${siteId.slice(0, 8)}-${item.slug}`,
            anchorText: item.title,
            targetTitle: item.title,
            targetUrl: item.url,
            category: "pillar-guide" as const,
          }));
        if (!additions.length) return now;
        return {
          ...now,
          internalLinks: [...additions, ...now.internalLinks].slice(0, 24),
        };
      });
    },
    [update, websiteInternalLinks],
  );

  const loadConnectedWebsites = React.useCallback(async () => {
    try {
      const res = await authorizedWebsiteFetch("/api/website-builder/overview", {
        cache: "no-store",
      });
      if (!res.ok) return;
      const data = (await res.json()) as {
        websites?: ConnectedWebsiteSummary[];
        internalLinks?: Array<{
          siteProjectId: string;
          siteName: string;
          publicSlug: string;
          title: string;
          slug: string;
          url: string;
        }>;
      };
      const sites = Array.isArray(data.websites) ? data.websites : [];
      const links = Array.isArray(data.internalLinks) ? data.internalLinks : [];
      setConnectedWebsites(sites);
      setWebsiteInternalLinks(links);
      const preferredId =
        (typeof window !== "undefined"
          ? new URLSearchParams(window.location.search).get("targetSiteId")
          : "") ||
        sites[0]?.projectId ||
        "";
      if (preferredId) {
        setTargetSiteId(preferredId);
        syncSiteInternalLinks(preferredId, links);
      }
    } catch {
      /* Website bridge metadata is optional when offline or unauthenticated. */
    }
  }, [syncSiteInternalLinks]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const fromQuery =
        new URLSearchParams(window.location.search).get("targetSiteId") || "";
      if (fromQuery) setTargetSiteId(fromQuery);
      const manifest = loadWriterAutomationBatchManifest();
      if (manifest) {
        setBatchManifest(manifest);
        setStudioUnlocked(true);
      }
    }
    void loadConnectedWebsites();
    // Load once on mount; re-synced explicitly after publish.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const focus = focusRequested && workspaceMode === "editor";
  const [assistant, setAssistant] = useState<AssistantLaunch | null>(null);
  const [assistantExpanded, setAssistantExpanded] = useState(false);
  const [inspectorTab, setInspectorTab] = useState<InspectorTab>("score");
  const [inspectorOpen, setInspectorOpen] = useState(false);
  const [barSlots, setBarSlots] = useState<{ document: HTMLElement; modes: HTMLElement; actions: HTMLElement }>();
  useEffect(() => {
    if (!isStudioEmbedded) return;
    const title = document.getElementById("studio-writer-document");
    const modes = document.getElementById("studio-writer-modes");
    const actions = document.getElementById("studio-writer-actions");
    if (title && modes && actions) setBarSlots({ document: title, modes, actions });
    setInspectorOpen(window.matchMedia("(min-width: 1024px)").matches);
  }, [isStudioEmbedded]);
  const dialog = useRef<HTMLDivElement>(null);
  const editor = useRef<EditorHandle>(null),
    importInput = useRef<HTMLInputElement>(null),
    logoInput = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setVisualId(null);
    setAssistant(null);
    setAssistantExpanded(false);
    setInspectorTab("score");
    setFocus(false);
    setBriefModalOpen(false);
    setWorkspaceMode("editor");
    const hasDraft =
      Boolean(workspace(p).studioUnlocked) ||
      p.sections.some(
        (s) =>
          s.bodyMarkdown.trim() ||
          s.subHeadings.some((h) => h.bodyMarkdown.trim()),
      ) ||
      Boolean(workspace(p).document && readiness(p).words > 0);
    setStudioUnlocked(hasDraft);
    setLeftTab("readability");
    setMessage("");
  }, [p.projectId]);

  useEffect(() => {
    if (bodyPresent || manualDraft || w.run.status === "done" || w.studioUnlocked) {
      setStudioUnlocked(true);
    }
  }, [bodyPresent, manualDraft, w.run.status, w.studioUnlocked]);

  useEffect(() => {
    const key = (e: KeyboardEvent) => {
      if (e.key === "\\" && (e.metaKey || e.ctrlKey) && !e.repeat && !gen.busy && studioUnlocked && workspaceMode === "editor") {
        e.preventDefault();
        setAssistantExpanded(false);
        setFocus((previous) => !previous);
      }
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
    };
  }, [gen.busy, studioUnlocked, workspaceMode]);

  const studioActionsRef = useRef({ gen, store, current });
  studioActionsRef.current = { gen, store, current };

  useEffect(() => {
    const onOpenProject = (event: Event) => {
      const detail = (event as CustomEvent<{ projectId?: string; create?: boolean }>)
        .detail;
      if (!detail) return;
      const { gen: g, store: s, current: cur } = studioActionsRef.current;
      if (detail.create) {
        g.stop();
        void s.create().then(() => setStudioUnlocked(false));
        return;
      }
      if (detail.projectId && detail.projectId !== cur.current.projectId) {
        g.stop();
        void s.switchProject(detail.projectId);
      }
    };
    window.addEventListener(WRITER_OPEN_PROJECT_EVENT, onOpenProject);
    return () =>
      window.removeEventListener(WRITER_OPEN_PROJECT_EVENT, onOpenProject);
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

  const applyAssistantProposal = (proposal: SavedProposal): string | Passage | undefined => {
    const now = current.current;
    if (assistantRevision(now) !== proposal.revision)
      return "The draft has changed since this proposal was created. Ask Article AI to update it using the current draft.";
    const body = markdownNodes(proposal.markdown);
    if (!body.length) return "There is no text to apply.";
    const isHeading = (node: RichNode, level: number) => node.type === "heading" && Number(node.attrs?.level) === level;
    const changesTitle = (node: RichNode) => isHeading(node, 1) || isHeading(node, 2);
    if (proposal.kind === "passage") {
      if (body.some(changesTitle)) return "Ask for a passage revision that preserves the article headings.";
      const selected = proposal.passage;
      if (!selected || !editor.current || workspaceMode !== "editor") return "Open the article editor to apply this passage revision.";
      try {
        if (!editor.current.replace(selected.from, selected.to, proposal.markdown)) return "The selection is no longer available. Select the passage again.";
      } catch { return "The selected passage could not be replaced. Select it again to retry."; }
      const revised = editor.current.findRevisedPassage(proposal.markdown, selected.from);
      const revision = assistantRevision(current.current);
      return revised && revision !== proposal.revision ? { ...revised, revision } : undefined;
    }
    const doc = projectDocument(now);
    const content = doc.content || [];
    const start = proposal.sectionId ? content.findIndex((node) => isHeading(node, 2) && node.attrs?.sectionId === proposal.sectionId) : -1;
    if (proposal.sectionId && start < 0) return "The target section could not be found in the current draft.";
    const next = start < 0 ? -1 : content.findIndex((node, index) => index > start && isHeading(node, 2));
    const end = next < 0 ? content.length : next;
    if (proposal.kind === "insert-section") {
      if (!isHeading(body[0], 2) || !body.slice(1).length || body.slice(1).some(changesTitle))
        return "A new section needs one H2 heading followed by content. Ask Article AI to update the proposal.";
      update((project) => syncDocument(project, { ...doc, content: [...content.slice(0, end), ...body, ...content.slice(end)] }));
      return;
    }
    if (proposal.kind === "section") {
      if (start < 0 || body.some(changesTitle)) return "This proposal needs a specific section and a body-only revision.";
      const existing = content.slice(start + 1, end);
      const visual = (node: RichNode) => node.type === "sectionVisual" || node.type === "image";
      const hasNestedVisual = (node: RichNode): boolean => Boolean(node.content?.some((child) => visual(child) || hasNestedVisual(child)));
      if (existing.some(hasNestedVisual)) return "This section contains embedded images. Select the paragraphs you want to revise.";
      update((project) => syncDocument(project, {
        ...doc, content: [...content.slice(0, start + 1), ...body, ...existing.filter(visual), ...content.slice(end)],
      }));
      return;
    }
    if (articleMarkdown(now).length > 48000 || computeContentScorecard(now).structure.images.actual > 0)
      return "To safely revise this draft and preserve its content, choose a section or passage.";
    if (!isHeading(body[0], 1) || body.slice(1).some((node) => isHeading(node, 1)))
      return "Ask Article AI for a replacement draft that keeps the article title and section structure.";
    update((project) => syncDocument(project, { ...doc, content: body }));
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
      ""
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
                  : "",
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

  const closeInspector = () => {
    setInspectorOpen(false);
    setAssistantExpanded(false);
  };

  const closeAssistant = () => {
    setAssistant(null);
    setAssistantExpanded(false);
    if (isStudioEmbedded) closeInspector();
  };

  const openInspector = (tab: InspectorTab) => {
    setInspectorTab(tab);
    setInspectorOpen(true);
    setFocus(false);
    if (tab === "ai") setAssistant((session) => session || { id: id() });
    else setAssistantExpanded(false);
  };

  const openAssistant = (range?: { from: number; to: number; text: string }, prompt?: string) => {
    if (isStudioEmbedded) {
      openInspector("ai");
      if (!range?.text.trim() && !prompt) return;
    }
    setAssistantExpanded(false);
    setAssistant({ id: id(), prompt, ...(range?.text.trim() && range.to > range.from
      ? { passage: { ...range, revision: assistantRevision(current.current) } } : {}) });
  };

  const assistantScore = useMemo(() => assistant ? computeContentScorecard(p) : null, [assistant, p]);

  const assistantContext = () => {
    const article = articleMarkdown(p);
    const score = assistantScore || computeContentScorecard(p);

    const site = parseBriefDirectives(p.rawUserBriefOrSourceText).websiteUrl || p.brandSiteUrl || w.research?.siteScanned || "";
    const hostname = (value: string) => {
      try { return new URL(value).hostname.toLowerCase().replace(/^www\./, ""); } catch { return ""; }
    };
    const brandHost = hostname(site);
    const sitePages = [
      ...(w.research?.internalLinks || []).map((link) => ({ url: link.url, title: link.title, anchor: link.anchorText })),
      ...(p.internalLinks || []).map((link) => ({ url: link.targetUrl, title: link.targetTitle, anchor: link.anchorText })),
    ].filter((link, index, links) => brandHost && hostname(link.url) === brandHost &&
      links.findIndex((candidate) => candidate.url === link.url) === index).slice(0, 30);
    return {
      title: (p.metaPack.h1Title || p.projectTitle || "Article draft").slice(0, 250),
      site: site.slice(0, 700),
      revision: assistantRevision(p),
      article: article.slice(0, 48000),
      diagnostics: JSON.stringify({
        truncated: article.length > 48000,
        site, brand: w.brand.name,
        brandVoice: { ...w.research?.brandVoice, ...w.brandVoiceOverride },
        sitePages,
        brief: p.rawUserBriefOrSourceText.slice(0, 650),
        audience: p.keywordCluster.targetAudience,
        language: w.language,
        words: report.words, readingMinutes: report.minutes,
        score: score.overallScore, targetScore: score.targetBenchmark,
        structure: score.structure, terms: score.terms, issues: score.issues.slice(0, 12),
        readability: { longSentences: report.readability.longSentences.length, longParagraphs: report.readability.longParagraphs.length }, editorialChecks: report.checks,
        keyword: p.keywordCluster.primaryKeyword,
        meta: { title: p.metaPack.metaTitle, description: p.metaPack.metaDescription,
          characters: p.metaPack.metaDescription.length, slug: p.metaPack.urlSlug,
          ...auditSerpPixelAndCtrReadiness(p) },
        faqs: { count: p.faqs.length, entries: p.faqs.slice(0, 8) },
        includedImages: score.structure.images.actual,
        featuredBanner: w.featuredBanner?.headline || null,
        headings: p.sections.map((section) => ({ id: section.id, heading: section.h2Text,
          visual: Boolean(section.infographicConfig.nodes.length || w.sectionVisualOverrides?.[section.id]?.dataUrl),
          subheadings: section.subHeadings.map((heading) => heading.h3Text) })),
        contextualLinkOpportunities: auditContextualLinkOpportunities(p).slice(0, 6),
        downloads: articleDownloads.map(({ label }) => label),
      }, (_key, value) => Array.isArray(value) ? value.slice(0, 30) : typeof value === "string" ? value.slice(0, 650) : value).slice(0, 24000),
    };
  };

  const directAssistantReply = (question: string): AssistantReply | undefined => {
    const q = question.toLowerCase().trim();
    if (/^(?:what(?:'s| is) (?:the |my )?(?:current )?(?:content )?score|(?:show )?(?:my |the )?content score)[.?!]?$/.test(q) && assistantScore)
      return { reply: `The current Content Score is **${assistantScore.overallScore}/100**, with **${assistantScore.issues.length} flagged issues**.`, cards: ["score"] };
    if (/^(?:how long is|what(?:'s| is) the length of) (?:my |the )?meta description[.?!]?$/.test(q))
      return { reply: `The saved meta description is **${p.metaPack.metaDescription.length} characters** long.`, cards: ["meta"] };
    if (/^(?:how many words|what is (?:the |my )?word count|word count)[^?]*\??$/.test(q) && !/\band\b/.test(q))
      return { reply: `Your draft has **${report.words.toLocaleString()} words**.`, cards: [] };
    if (/^(?:what(?:'s| is) (?:the |my |this article's )?(?:estimated )?reading time|reading time|how long (?:does|will) it take to read)[^?]*\??$/.test(q) && !/\band\b/.test(q))
      return { reply: report.words ? `The estimated reading time is **${report.minutes} min**.` : "Add draft text to calculate reading time.", cards: [] };
    if (/^(?:how many faqs|faq count)[^?]*\??$/.test(q) && !/\band\b/.test(q))
      return { reply: `This draft has **${p.faqs.length} saved FAQ entries**.`, cards: ["faqs"] };
    if (/^(?:how do i download|how can i download|download this article|export formats)\b/.test(q) && !/\band\b/.test(q))
      return { reply: "Choose PDF for sharing, Word for editing, HTML for web use, or Markdown for a portable text copy.", cards: ["downloads"] };
    if (/^show (?:my |the )?meta(?: & serp)? (?:details|information)[.?!]?$/.test(q))
      return { reply: "Here’s the metadata saved for this draft.", cards: ["meta"] };
    return undefined;
  };

  const openEditorDestination = (target: "meta" | "faqs" | "visuals" | "score" | "readability" | "seo" | "headings", headingId?: string) => {
    if (isStudioEmbedded) {
      setAssistantExpanded(false);
      if (target === "readability" || target === "seo" || target === "score") {
        openInspector(target);
        return;
      }
      closeInspector();
    } else closeAssistant();
    setFocus(false);
    if (target === "meta" || target === "faqs" || target === "visuals") {
      setWorkspaceMode(target);
      return;
    }
    setWorkspaceMode("editor");
    if (target === "readability" || target === "seo") {
      setLeftOpen(true);
      setLeftTab(target);
    } else if (headingId) {
      requestAnimationFrame(() => editor.current?.section(headingId));
    } else {
      setRightScoreOpen(true);
    }
  };

  const assistantActions = (answer: AssistantReply) => {
    const score = assistantScore;
    const selectedHeading = p.sections.find((section) => section.id === answer.headingId);
    const selectedVisual = p.sections.find((section) => section.id === answer.visualId);
    const sectionCard = (title: string, content: React.ReactNode, action: () => void, label: string) => (
      <div className={assistantStyles.card}><small>Live article data</small><strong>{title}</strong>{content}<button type="button" onClick={action}>{label}</button></div>
    );
    return <div className={assistantStyles.cards}>
      {[...new Set(answer.cards)].map((card) => <React.Fragment key={card}>
        {card === "meta" && sectionCard("Meta & SERP", <>
          <small>Meta title</small><b>{p.metaPack.metaTitle || "No meta title saved"}</b>
          <small>Meta description · {p.metaPack.metaDescription.length} characters</small>
          <div>{p.metaPack.metaDescription || "No description saved"}</div>
        </>, () => openEditorDestination("meta"), "Open Google search preview")}
        {card === "faqs" && sectionCard(`FAQs · ${p.faqs.length} entries`, <>
          {p.faqs.slice(0, 5).map((faq, index) => <details key={index}><summary>{faq.question}</summary><p>{faq.answer}</p></details>)}
        </>, () => openEditorDestination("faqs"), "Open FAQ organizer")}
        {card === "visuals" && sectionCard("Banner & visuals", <>
          <span>{score?.structure.images.actual ?? 0} images in article</span>
          <span>{w.featuredBanner?.headline || "No saved featured banner"}</span>
          <nav>{p.sections.filter((section) => section.infographicConfig.nodes.length || w.sectionVisualOverrides?.[section.id]?.dataUrl).slice(0, 8).map((section) =>
            <button key={section.id} type="button" onClick={() => {
              openEditorDestination("visuals");
              openVisual(section.id);
            }}>{section.h2Text}</button>)}</nav>
        </>, () => openEditorDestination("visuals"), "Open visuals")}
        {card === "score" && sectionCard("Content Score", <>
          <span>{score?.overallScore ?? 0}/100 · {score?.issues.length ?? 0} flagged issues</span>
          {score?.issues.slice(0, 3).map((issue) => <span key={issue.id}>{issue.label}</span>)}
        </>, () => openEditorDestination("score"), "Open score inspector")}
        {card === "readability" && sectionCard("Readability", <span>{report.words.toLocaleString()} words · {report.minutes} min · {report.readability.longSentences.length} long sentences</span>, () => openEditorDestination("readability"), "Open readability tools")}
        {card === "seo" && sectionCard("SEO & Links", <><span>{score?.terms.length ?? 0} tracked terms · {p.internalLinks.length} saved internal-link targets</span>
          {score?.terms.filter((term) => term.status !== "optimal").slice(0, 4).map((term) =>
            <span key={term.term}>{term.term} · {term.actual} uses (target {term.min}–{term.max})</span>)}</>, () => openEditorDestination("seo"), "Open SEO & Links")}
        {card === "headings" && <details className={assistantStyles.card}><summary>Headings · {p.sections.length} sections</summary>
          <nav>{p.sections.map((section) => <button key={section.id} type="button" onClick={() => openEditorDestination("headings", section.id)}>{section.h2Text}</button>)}</nav>
        </details>}
        {card === "downloads" && <div className={assistantStyles.card}><strong>Download article</strong><nav>
          {articleDownloads.map(({ id: format, label }) => <button key={format} type="button" disabled={!report.words || Boolean(exportBusy)} onClick={() => void handleQuickExport(format)}>{exportBusy === format ? "Preparing…" : label}</button>)}
        </nav>{message && <small role="status">{message}</small>}</div>}
      </React.Fragment>)}
      {selectedHeading && <button type="button" onClick={() => openEditorDestination("headings", selectedHeading.id)}>Go to {selectedHeading.h2Text}</button>}
      {selectedVisual && <button type="button" onClick={() => { openEditorDestination("visuals"); openVisual(selectedVisual.id); }}>Open visual for {selectedVisual.h2Text}</button>}
    </div>;
  };

  const darkStudio = isStudioEmbedded ? resolvedTheme === "dark" : standaloneDark;
  const writerShellClass = [
    styles.shell,
    isStudioEmbedded && styles.studioEmbedded,
    darkStudio && styles.darkShell,
  ].filter(Boolean).join(" ");

  if (!store.ready)
    return (
      <div className={writerShellClass}>
        <p className={styles.loading}>
          <Loader2 size={18} />
          Opening your writing workspace…
        </p>
      </div>
    );

  const launchGeneration = async (mode: "all" | "plan") => {
    const rawBrief = current.current.rawUserBriefOrSourceText.trim();
    const kw = current.current.keywordCluster.primaryKeyword.trim();
    const effectiveBrief = !rawBrief && kw ? `Topic: ${kw}\nKeyword: ${kw}` : rawBrief;
    const parsed = parseBrief(effectiveBrief);
    const directives = parseBriefDirectives(effectiveBrief);
    if (
      (!rawBrief && kw) ||
      (parsed.keyword && !current.current.keywordCluster.primaryKeyword) ||
      (directives.websiteUrl && !current.current.brandSiteUrl)
    ) {
      update((now) => ({
        ...now,
        rawUserBriefOrSourceText: now.rawUserBriefOrSourceText.trim()
          ? now.rawUserBriefOrSourceText
          : effectiveBrief,
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

  const isEditing = !showOnboardingHero && !gen.busy;
  const dismissSheetForEditor = () => {
    if (matchMedia("(max-width: 1023px)").matches) closeInspector();
  };
  const openBrief = () => {
    dismissSheetForEditor();
    setBriefModalOpen(true);
  };
  const navigateEditor = (action: (handle: EditorHandle) => void) => {
    setWorkspaceMode("editor");
    if (isStudioEmbedded) dismissSheetForEditor();
    requestAnimationFrame(() => {
      if (editor.current) action(editor.current);
    });
  };
  const jumpToHeading = (index: number) => {
    setWorkspaceMode("editor");
    dismissSheetForEditor();
    requestAnimationFrame(() => {
      document.querySelectorAll("[data-writer-canvas] .tiptap :is(h1,h2,h3,h4,h5,h6)")[index]
        ?.scrollIntoView({ block: "start", behavior: "smooth" });
    });
  };
  const scorePanelProps = {
    project: p,
    collapsed: false,
    onToggleCollapse: () => setRightScoreOpen((prev) => !prev),
    onSelectTerm: (term: string) => navigateEditor((handle) => handle.highlightAndScrollToTerm(term)),
    onSelectHeading: (sectionId: string, heading: string) => navigateEditor((handle) => {
      if (sectionId) handle.section(sectionId);
      else handle.scrollToHeading(heading);
    }),
    onJumpToHeading: jumpToHeading,
    onRunResearch: () => void refreshResearchPacket(),
    researchBusy,
  };
  const assistantPanel = assistant && <ArticleAssistant key={p.projectId} projectId={p.projectId} embedded={isStudioEmbedded}
    title={p.metaPack.h1Title || p.projectTitle} launch={assistant} dark={darkStudio}
    expanded={assistantExpanded} onExpand={() => setAssistantExpanded((expanded) => !expanded)}
    onClose={closeAssistant} getContext={assistantContext} getDirectReply={directAssistantReply}
    renderActions={assistantActions} applyProposal={applyAssistantProposal}
  />;
  const copyArticleHtml = async () => {
    try {
      const html = new DOMParser().parseFromString(htmlArticle(p), "text/html");
      await navigator.clipboard.writeText(html.body.innerHTML);
      setMessage("Article HTML copied.");
    } catch (error) {
      setMessage(errorText(error));
    }
  };
  const toggleFocus = () => {
    setAssistantExpanded(false);
    setFocus((previous) => !previous);
  };
  const switchMode = (mode: typeof workspaceMode) => {
    if (mode !== "editor") setFocus(false);
    setAssistantExpanded(false);
    setWorkspaceMode(mode);
    document.querySelector("[data-studio-scroll]")?.scrollTo({ top: 0 });
  };
  const openPublishingKit = () => {
    setFocus(false);
    if (assistantExpanded) closeInspector();
    setWorkspaceMode("visuals");
    requestAnimationFrame(() => document.getElementById("writer-assets")?.scrollIntoView({ block: "start" }));
  };
  const modes = [
    { id: "editor", label: "Editor" },
    { id: "meta", label: "Meta & SERP" },
    { id: "visuals", label: `Visuals (${p.sections.length})` },
    { id: "faqs", label: `FAQs & Quiz (${p.faqs.length})` },
  ] as const;
  const backupActions = <>
    <button type="button" onClick={() => importInput.current?.click()}><Upload size={14} /> Import backup</button>
    <button type="button" onClick={() => saveBlob(store.backup(), `${p.metaPack.urlSlug || "article"}.blogproject.json`, "application/json")}>
      <Download size={14} /> Download backup
    </button>
  </>;
  const studioTopBar = barSlots && <>
    {createPortal(<div className={styles.documentHeading}>
      {documentNavigation}
      <input className={styles.documentTitle} aria-label="Project name" title={p.projectTitle} value={p.projectTitle}
        maxLength={180} onChange={(event) => field("projectTitle", event.target.value)} />
      <span className={styles.documentSaved} role="status" title={store.saving ? "Saving…" : store.saved ? "Saved in this browser" : "Unsaved changes"}>
        {store.saving ? <Loader2 size={13} className={styles.spinIcon} /> : store.saved ? <CheckCircle2 size={13} /> : null}
        <span className={styles.srOnly}>{store.saving ? "Saving…" : store.saved ? "Saved in this browser" : "Unsaved changes"}</span>
      </span>
      <WriterMenu align="start" className={styles.articleSwitcher} label={<><ChevronDown size={15} /><span className={styles.srOnly}>Switch article</span></>}>
        {articleSwitcher}
        {backupActions}
      </WriterMenu>
    </div>, barSlots.document)}
    {isEditing && createPortal(<>
      <nav className={styles.studioModeTabs} aria-label="Workspace sections">
        {modes.map((mode) => <button type="button" key={mode.id} aria-pressed={workspaceMode === mode.id}
          onClick={() => switchMode(mode.id)}>{mode.label}</button>)}
      </nav>
      <select className={styles.studioModeSelect} aria-label="Workspace section" value={workspaceMode}
        onChange={(event) => switchMode(event.target.value as typeof workspaceMode)}>
        {modes.map((mode) => <option key={mode.id} value={mode.id}>{mode.label}</option>)}
      </select>
    </>, barSlots.modes)}
    {isEditing && createPortal(<div className={styles.studioWriterActions}>
      <button type="button" aria-label="Open inspector" title="Editorial inspector" aria-controls="writer-inspector"
        aria-expanded={inspectorOpen && !focus} onClick={() => inspectorOpen && !focus ? closeInspector() : openInspector("score")}>
        <PanelRightOpen size={16} />
      </button>
      <button type="button" aria-label="Article AI" title="Article AI" aria-controls="writer-inspector"
        aria-pressed={inspectorOpen && inspectorTab === "ai" && !focus}
        onClick={() => inspectorOpen && inspectorTab === "ai" && !focus ? closeInspector() : openAssistant()}>
        <Sparkles size={16} /> <span>Article AI</span>
      </button>
      <WriterMenu label={<><FileDown size={15} /><span className={styles.actionText}>Export</span><ChevronDown size={12} /></>}>
        {articleDownloads.map(({ id: format, label }) => <button key={format} type="button" disabled={!report.words || Boolean(exportBusy)}
          onClick={() => void handleQuickExport(format)}><FileDown size={14} /> Download {label}</button>)}
        <button type="button" disabled={!report.words} onClick={() => void copyArticleHtml()}><ClipboardCopy size={14} /> Copy Clean HTML</button>
      </WriterMenu>
      <button type="button" className={styles.publishingAction} title="Publishing kit" aria-label="Publishing kit" onClick={openPublishingKit}>
        <Download size={15} /><span>Publishing Kit</span>
      </button>
      {workspaceMode === "editor" && <button type="button" className={styles.focusAction} aria-label="Focus mode" title="Focus mode (Ctrl/⌘ + \)" aria-pressed={focus}
        onClick={toggleFocus}><Focus size={16} /></button>}
      <WriterMenu label={<><MoreHorizontal size={17} /><span className={styles.srOnly}>More article actions</span></>}>
        <div className={styles.mobileArticleActions}>
          <label>Project name<input value={p.projectTitle} maxLength={180} onChange={(event) => field("projectTitle", event.target.value)} /></label>
          <button type="button" onClick={openPublishingKit}><Download size={14} /> Publishing Kit</button>
          {workspaceMode === "editor" && <button type="button" onClick={toggleFocus}><Focus size={14} /> {focus ? "Exit focus mode" : "Focus mode"}</button>}
          {backupActions}
        </div>
        {repurposeActions && <div className={styles.menuSection}><small>Repurpose</small>{repurposeActions}</div>}
      </WriterMenu>
    </div>, barSlots.actions)}
  </>;

  const editorialTools = (
    <LeftStudioPanel
      project={p}
      embedded={isStudioEmbedded}
      activeTab={isStudioEmbedded && inspectorTab === "seo" ? "seo" : isStudioEmbedded ? "readability" : leftTab}
      highlightToggles={highlightToggles}
      targetGrade={targetGrade}
      aiRevisionState={{ busy: false, original: "", proposed: "", scope: "article" }}
      onChangeTab={setLeftTab}
      onToggleHighlight={(k) => {
        if (isStudioEmbedded) { setWorkspaceMode("editor"); dismissSheetForEditor(); }
        setHighlightToggles((prev) => ({ ...prev, [k]: !prev[k] }));
      }}
      onChangeTargetGrade={setTargetGrade}
      onOpenBriefModal={openBrief}
      onRunAiHelper={(instruction, scope) => openAssistant(scope === "selection" ? editor.current?.selection() : undefined, instruction)}
      onQuickReadabilityPolish={() => openAssistant(editor.current?.selection(),
        "Improve readability. Remove filler and repetitive openings while preserving facts, Markdown links and headings.",
      )}
      onInsertLink={(anchor, url) => navigateEditor((handle) => handle.insertLink(anchor, url))}
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
      onNormalizeFaqsPaa={() => {
        let count = 0;
        update((now) => {
          const res = normalizeFaqPaaLengths(now);
          count = res.normalizedCount;
          return res.project;
        });
        setMessage(
          count > 0
            ? `Normalized ${count} FAQ item${count === 1 ? "" : "s"} into the 35–55 word Google PAA & voice-search extraction window.`
            : "All FAQ answers are already within the optimal 35–55 word PAA window.",
        );
      }}
      onInjectUncoveredQuestions={() => {
        let count = 0;
        update((now) => {
          const res = injectUncoveredQuestionsIntoFaqs(now, 3);
          count = res.addedCount;
          return res.project;
        });
        setMessage(
          count > 0
            ? `Added ${count} uncovered research question${count === 1 ? "" : "s"} with 40–50w PAA answers to your FAQPage schema.`
            : "All research questions are already covered in your article or FAQs.",
        );
      }}
      onConvertH2sToQuestions={() => {
        let count = 0;
        update((now) => {
          const res = convertStatementHeadingsToQuestions(now, 50);
          count = res.convertedCount;
          return res.project;
        });
        setMessage(
          count > 0
            ? `Converted ${count} statement H2 heading${count === 1 ? "" : "s"} into AEO question headings for higher AI citation eligibility.`
            : "Your H2 headings already meet the 35%–75% AEO question-heading benchmark.",
        );
      }}
      onApplyContentRefresh={() => {
        let count = 0;
        update((now) => {
          const res = applyContentRefreshUpgrade(now);
          count = res.changesApplied;
          return res.project;
        });
        setMessage(
          count > 0
            ? `Applied ${count} content refresh & anti-decay upgrade${count === 1 ? "" : "s"} (2026 recency signals, decision matrix & editorial verification note).`
            : "Your article already meets all 2026 content freshness and anti-decay benchmarks.",
        );
      }}
      onWeaveSectionTakeaways={() => {
        let count = 0;
        update((now) => {
          const res = weaveSectionTakeawayCallouts(now);
          count = res.addedCount;
          return res.project;
        });
        setMessage(
          count > 0
            ? `Wove ${count} Key Takeaway callout box${count === 1 ? "" : "es"} into sections missing summary callouts.`
            : "Every H2 section already includes a Key Takeaway callout box.",
        );
      }}
      onRunMasterAeoPolish={() => {
        let count = 0;
        update((now) => {
          const res = runMasterAeoAndReadinessPolish(now);
          count = res.totalUpgrades;
          return res.project;
        });
        setMessage(
          count > 0
            ? `Master AEO Polish complete: applied ${count} deterministic optimization${count === 1 ? "" : "s"} across metadata, the direct answer, and visual descriptions. Review the edits before publishing.`
            : "No automatic changes were needed. Review facts, accessibility, and search intent manually.",
        );
      }}
      onRunResearch={() => void refreshResearchPacket()}
      researchBusy={researchBusy}
    />
  );

  return (
    <div
      className={`${writerShellClass} ${focus && !isStudioEmbedded ? styles.focusMode : ""}`}
      data-writer-document={isStudioEmbedded && isEditing ? "true" : undefined}
      data-writer-focus={isStudioEmbedded && focus && isEditing ? "true" : undefined}
      style={
        {
          "--writer-sticky-top": isStudioEmbedded ? "0px" : "80px",
        } as React.CSSProperties
      }
    >
      {barSlots ? studioTopBar : (
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
          <button type="button" className={styles.workspaceSideToggle} onClick={() => openAssistant()} aria-haspopup="dialog">
            <Sparkles size={15} /> Article AI
          </button>
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
          {!isStudioEmbedded && (
            <button
              type="button"
              title={standaloneDark ? "Switch to light mode" : "Switch to dark mode"}
              onClick={() => setStandaloneDark(!standaloneDark)}
            >
              {standaloneDark ? <Sun size={15} /> : <Moon size={15} />}
              <span>{standaloneDark ? "Daylight" : "Dark Studio"}</span>
            </button>
          )}
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
              {workspaceMode === "editor" && <button
                type="button"
                aria-pressed={focus}
                onClick={toggleFocus}
              >
                <Focus size={15} />
                <span>{focus ? "Exit focus" : "Focus"}</span>
              </button>}
              <a
                href="#writer-assets"
                className={styles.primary}
                onClick={() => {
                  setFocus(false);
                  setWorkspaceMode("visuals");
                }}
              >
                <Download size={15} />
                Publishing kit
              </a>
            </>
          ) : null}
        </div>
      </header>
      )}

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
          {/* MULTI-ARTICLE BATCH SWITCHER BAR (When synced from /ai-content-writer/automation) */}
          {batchManifest && batchManifest.items.length > 0 && (
            <section
              aria-label="Multi-article automation batch switcher"
              style={{
                marginBottom: "18px",
                padding: "14px 18px",
                borderRadius: "16px",
                border: "1px solid rgba(56, 189, 248, 0.35)",
                background:
                  "linear-gradient(135deg, rgba(15, 23, 42, 0.96), rgba(12, 26, 48, 0.94))",
                display: "grid",
                gap: "12px",
              }}
            >
              <div
                style={{
                  display: "flex",
                  flexWrap: "wrap",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: "10px",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
                  <span
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "6px",
                      padding: "4px 10px",
                      borderRadius: "999px",
                      background: "rgba(16, 185, 129, 0.16)",
                      border: "1px solid rgba(16, 185, 129, 0.4)",
                      color: "#6ee7b7",
                      fontSize: "11px",
                      fontWeight: 800,
                      letterSpacing: "0.04em",
                    }}
                  >
                    ⚡ Multi-Article Batch Studio ({batchManifest.items.length} Articles)
                  </span>
                  <strong style={{ fontSize: "13.5px", color: "#f8fafc" }}>
                    {batchManifest.siteName} ({batchManifest.siteUrl})
                  </strong>
                  <span style={{ fontSize: "12px", color: "#94a3b8" }}>
                    Click any article tab below to edit its content, infographics, SEO meta &amp; social pack:
                  </span>
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <Link
                    href="/ai-content-writer/automation"
                    style={{
                      padding: "6px 12px",
                      borderRadius: "9px",
                      border: "1px solid rgba(56, 189, 248, 0.4)",
                      background: "rgba(56, 189, 248, 0.12)",
                      color: "#7dd3fc",
                      fontSize: "12px",
                      fontWeight: 700,
                      textDecoration: "none",
                    }}
                  >
                    ← Back to AI Automation Hub
                  </Link>
                  <button
                    type="button"
                    onClick={() => {
                      clearWriterAutomationBatchManifest();
                      setBatchManifest(null);
                    }}
                    style={{
                      padding: "6px 10px",
                      borderRadius: "9px",
                      border: "1px solid rgba(148, 163, 184, 0.25)",
                      background: "transparent",
                      color: "#94a3b8",
                      fontSize: "11.5px",
                      cursor: "pointer",
                    }}
                    title="Hide batch switcher bar"
                  >
                    Dismiss Bar ✕
                  </button>
                </div>
              </div>

              <div
                style={{
                  display: "flex",
                  flexWrap: "wrap",
                  gap: "8px",
                }}
              >
                {batchManifest.items.map((item, idx) => {
                  const isCurrent = p.projectId === item.projectId;
                  return (
                    <button
                      key={item.projectId}
                      type="button"
                      onClick={async () => {
                        gen.stop();
                        try {
                          await store.switchProject(item.projectId);
                          setStudioUnlocked(true);
                        } catch (err) {
                          setMessage(errorText(err));
                        }
                      }}
                      style={{
                        padding: "8px 14px",
                        borderRadius: "11px",
                        border: isCurrent
                          ? "1.5px solid #38bdf8"
                          : "1px solid rgba(148, 163, 184, 0.25)",
                        background: isCurrent
                          ? "linear-gradient(135deg, rgba(56, 189, 248, 0.24), rgba(16, 185, 129, 0.2))"
                          : "rgba(15, 23, 42, 0.8)",
                        color: isCurrent ? "#ffffff" : "#cbd5e1",
                        fontSize: "12px",
                        fontWeight: isCurrent ? 800 : 600,
                        cursor: "pointer",
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "7px",
                        maxWidth: "320px",
                      }}
                    >
                      <span
                        style={{
                          padding: "2px 6px",
                          borderRadius: "6px",
                          background: isCurrent ? "#38bdf8" : "rgba(51, 65, 85, 0.9)",
                          color: isCurrent ? "#020617" : "#94a3b8",
                          fontSize: "10.5px",
                          fontWeight: 800,
                        }}
                      >
                        #{idx + 1}
                      </span>
                      <span
                        style={{
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {item.topicTitle}
                      </span>
                    </button>
                  );
                })}
              </div>
            </section>
          )}

          {/* ARTICLE-FIRST STUDIO WORKSPACE WITH COLLAPSIBLE TOOLS & RIGHT SCORE GAUGE */}
          <div
            style={!isStudioEmbedded && assistantExpanded ? { display: "none" } : undefined}
            data-inspector-open={isStudioEmbedded && inspectorOpen && !focus}
            data-inspector-expanded={isStudioEmbedded && assistantExpanded && !focus}
            className={[
              styles.workspaceLayout,
              isStudioEmbedded ? styles.studioWriterGrid : "",
              !isStudioEmbedded && !focus && leftOpen ? styles.workspaceHasLeft : "",
              !isStudioEmbedded && !focus && (rightScoreOpen ? styles.workspaceHasScoreExpanded : styles.workspaceHasScoreRail),
            ]
              .filter(Boolean)
              .join(" ")}
          >
            {!isStudioEmbedded && !focus && leftOpen ? editorialTools : null}

            <main className={styles.editorColumn} aria-label="Article workspace" data-writer-canvas={isStudioEmbedded || undefined}>
              {/* Article-First Workspace Mode Switcher */}
              {!isStudioEmbedded && (<div className={styles.workspaceModeBar}>
                <button
                  type="button"
                  className={`${styles.workspaceSideToggle} ${leftOpen ? styles.workspaceSideToggleOn : ""}`}
                  onClick={() => {
                    setFocus(false);
                    setLeftOpen((prev) => !prev);
                  }}
                  aria-expanded={leftOpen}
                  title="Toggle Editorial Tools Sidebar (SEO, Readability & Links)"
                >
                  <PanelLeft size={14} />
                  <span>Editorial Tools</span>
                </button>

                <div
                  className={styles.workspaceModeTabs}
                  role="tablist"
                  aria-label="Workspace sections"
                >
                  <button
                    type="button"
                    role="tab"
                    aria-selected={workspaceMode === "editor"}
                    onClick={() => switchMode("editor")}
                  >
                    Article Editor
                  </button>
                  <button
                    type="button"
                    role="tab"
                    aria-selected={workspaceMode === "meta"}
                    onClick={() => switchMode("meta")}
                  >
                    Meta &amp; SERP
                  </button>
                  <button
                    type="button"
                    role="tab"
                    aria-selected={workspaceMode === "visuals"}
                    onClick={() => switchMode("visuals")}
                  >
                    Banner &amp; Visuals ({p.sections.length})
                  </button>
                  <button
                    type="button"
                    role="tab"
                    aria-selected={workspaceMode === "faqs"}
                    onClick={() => switchMode("faqs")}
                  >
                    FAQs &amp; Quiz ({p.faqs.length})
                  </button>
                </div>

                {!focus && (
                  <button
                    type="button"
                    className={`${styles.workspaceSideToggle} ${rightScoreOpen ? styles.workspaceSideToggleOn : ""}`}
                    onClick={() => setRightScoreOpen((prev) => !prev)}
                    aria-expanded={rightScoreOpen}
                    title="Toggle Content Score Inspector"
                  >
                    <Sparkles size={13} />
                    <span>Score</span>
                  </button>
                )}
              </div>)}

              {workspaceMode === "meta" && (
                <>
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
                </>
              )}

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
              {!isStudioEmbedded && workspaceMode === "editor" && p.sections.length > 0 ? (
                <div className={styles.tocStrip} aria-label="Table of contents">
                  <span className={styles.tocLabel}>
                    <ListTree size={14} /> Jump to:
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

              {workspaceMode === "meta" && (
                <section
                  className={styles.aeoAnswerCard}
                  aria-label="50-word quick answer box"
                >
                  <div className={styles.aeoAnswerHeader}>
                    <span>
                      <Sparkles size={13} /> 50-Word AEO Direct Answer Box (
                      {auditQuickAnswerBoxReadiness(p).words}w ·{" "}
                      {auditQuickAnswerBoxReadiness(p).status === "optimal"
                        ? "Optimal 40–58w"
                        : "Target 40–58w"}
                    </span>
                    <button
                      type="button"
                      className={styles.inlineToggleBtn}
                      onClick={() => {
                        update((now) => optimizeQuickAnswerBox50Words(now).project);
                        setMessage(
                          "Optimized 50-Word AEO Direct Answer Box into the 42–56 word inverted-pyramid snippet window.",
                        );
                      }}
                    >
                      <Wand2 size={12} /> Shorten Answer
                    </button>
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
              {workspaceMode === "visuals" && (
                <>
                  <FeaturedBannerArtwork
                    project={p}
                    onOptimizeAllAltTexts={() => {
                      let count = 0;
                      update((now) => {
                        const res = optimizeVisualAltTexts(now);
                        count = res.optimizedCount;
                        return res.project;
                      });
                      setMessage(
                        count > 0
                          ? `Optimized ${count} visual alt text${count === 1 ? "" : "s"} from the featured banner and infographic labels. Review each description against its image.`
                          : "The generated descriptions are unchanged. Check them against the actual images.",
                      );
                    }}
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
                  <AssetDeck
                    key={p.projectId}
                    project={p}
                    onChange={update}
                    onEditVisual={openVisual}
                    onInsertVisual={(sid) => {
                      setWorkspaceMode("editor");
                      requestAnimationFrame(() => {
                        editor.current?.insertVisual(sid);
                        editor.current?.section(sid);
                      });
                    }}
                  />
                </>
              )}

              {/* ZONE 3: RICH H1-H6 ARTICLE EDITOR WITH EMBEDDED READABILITY & INLINE ASK AI */}
              {workspaceMode === "editor" && (
                <>
                  {!isStudioEmbedded && (<div className={styles.editorLabel}>
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
                  </div>)}

                  <ArticleEditor
                    key={p.projectId}
                    ref={editor}
                    project={p}
                    toolbarEnd={isStudioEmbedded && <span className={styles.toolbarCount}>
                      {report.words.toLocaleString()} words <span>· {report.minutes} min</span>
                    </span>}
                    highlights={(isStudioEmbedded ? !focus && inspectorTab === "readability" : leftOpen && leftTab === "readability") && Object.values(highlightToggles).some(Boolean)}
                    highlightToggles={highlightToggles}
                    targetGrade={targetGrade}
                    onChange={(doc: RichNode) =>
                      update((now) => syncDocument(now, doc))
                    }
                    onUpdateProject={update}
                    onEditVisual={openVisual}
                    onSelection={() => {}}
                    onInlineAiRewrite={async (inst, range, signal, ctx) => {
                      const res = await gen.rewrite(range.text, inst, signal, ctx);
                      return res.data.text;
                    }}
                    onTellAi={(inst, range) => {
                      openAssistant(range, inst.trim() || undefined);
                    }}
                  />
                </>
              )}

              {/* PHASE 5: STRUCTURED FAQ SECTION & SCHEMA ORGANIZER */}
              {workspaceMode === "faqs" && (
              <section
                className={styles.faqOrganizerCard}
                aria-label="Structured FAQ accordion"
              >
                <div className={styles.faqOrganizerHeader}>
                  <div>
                    <p className={styles.eyebrow}>FAQPage Rich Schema</p>
                    <h3>Frequently Asked Questions ({p.faqs.length})</h3>
                  </div>
                  <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                    <button
                      type="button"
                      className={styles.inlineToggleBtn}
                      onClick={() => {
                        let summaryText = "";
                        update((now) => {
                          const res = generateArticleComprehensionQuiz(now);
                          summaryText = res.summary;
                          return res.project;
                        });
                        if (summaryText) setMessage(summaryText);
                      }}
                      title="Create three section-recall questions using the article’s own text"
                    >
                      ⚡ Generate 3-Q Reader Quiz ({(w.quizQuestions || []).length})
                    </button>
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
                {(w.quizQuestions || []).length > 0 && (
                  <div className={styles.faqList} style={{ marginTop: "14px" }}>
                    {(w.quizQuestions || []).map((q, qIdx) => (
                      <div key={q.id || qIdx} className={styles.faqItemBox}>
                        <div className={styles.linkCardTop}>
                          <span className={styles.eyebrow}>
                            Reader Comprehension Quiz Q#{qIdx + 1} · +148% Dwell-Time Signal
                          </span>
                          <span className={styles.kwHitBadge}>
                            Correct Option #{q.correctIndex + 1}
                          </span>
                        </div>
                        <div className={styles.faqItemTop}>
                          <input
                            className={styles.input}
                            value={q.question}
                            aria-label={`Quiz question ${qIdx + 1}`}
                            onChange={(e) => {
                              const val = e.target.value;
                              update((now) => {
                                const currentQuiz = workspace(now).quizQuestions || [];
                                return patchWorkspace(now, {
                                  quizQuestions: currentQuiz.map((item, i) =>
                                    i === qIdx ? { ...item, question: val } : item,
                                  ),
                                });
                              });
                            }}
                          />
                        </div>
                        <p className={styles.leftMetaSub} style={{ marginTop: "6px" }}>
                          <strong>Verified Answer:</strong> {q.options[q.correctIndex]} — <em>{q.explanation}</em>
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </section>
              )}

              {workspaceMode === "editor" && (
              <ConnectedWebsitePublishBar
                article={{
                  articleProjectId: p.projectId,
                  title: p.metaPack.h1Title || p.projectTitle || "Untitled Article",
                  slug:
                    p.metaPack.urlSlug ||
                    (p.projectTitle || "article")
                      .toLowerCase()
                      .replace(/[^a-z0-9]+/g, "-")
                      .replace(/^-+|-+$/g, "")
                      .slice(0, 80) ||
                    "article",
                  seoTitle: (p.metaPack.metaTitle || p.metaPack.h1Title || p.projectTitle).slice(0, 70),
                  seoDescription: (
                    p.metaPack.metaDescription ||
                    p.metaPack.aeoDirectAnswer50Words ||
                    p.rawUserBriefOrSourceText
                  ).slice(0, 170),
                  excerpt: (
                    p.metaPack.aeoDirectAnswer50Words ||
                    p.metaPack.metaDescription ||
                    p.rawUserBriefOrSourceText ||
                    "Published from DoItWithAI Content Writer Studio."
                  ).slice(0, 320),
                  tags: [
                    p.keywordCluster.primaryKeyword,
                    ...p.keywordCluster.secondaryKeywords,
                  ]
                    .filter(Boolean)
                    .slice(0, 8),
                  markdownBody: articleMarkdown(p),
                  publishImmediately: false,
                }}
                connectedWebsites={connectedWebsites}
                initialSelectedSiteId={targetSiteId}
                onSelectWebsite={(siteId) => {
                  setTargetSiteId(siteId);
                  syncSiteInternalLinks(siteId);
                }}
                onSyncToWebsite={async (websiteId, payload, publishImmediately) => {
                  const res = await authorizedWebsiteFetch(
                    "/api/website-builder/publish-from-writer",
                    {
                      method: "POST",
                      headers: { "content-type": "application/json" },
                      body: JSON.stringify({
                        websiteId,
                        payload,
                        publishImmediately,
                      }),
                    },
                  );
                  const data = (await res.json().catch(() => ({}))) as {
                    ok?: boolean;
                    liveUrl?: string;
                    message?: string;
                    error?: string;
                  };
                  if (!res.ok || !data.ok) {
                    return {
                      ok: false,
                      error: data.error || "Failed to publish article to website.",
                    };
                  }
                  if (data.message) setMessage(data.message);
                  void loadConnectedWebsites();
                  return { ok: true, liveUrl: data.liveUrl };
                }}
              />
              )}

              {!isStudioEmbedded && workspaceMode === "editor" && (
              <p className={styles.editorFootnote}>
                Highlight any passage for instant formatting or inline &ldquo;Ask AI&rdquo;, or click &ldquo;+&rdquo; on an empty line to insert an uploaded image.
              </p>
              )}
            </main>

            {isStudioEmbedded ? (
              <WriterInspector tab={inspectorTab} open={inspectorOpen && !focus} expanded={assistantExpanded}
                onTab={openInspector} onClose={closeInspector} assistant={assistantPanel}>
                {inspectorTab === "score" && <ContentScorePanel {...scorePanelProps} inspectorView="score" />}
                {inspectorTab === "readability" && editorialTools}
                {inspectorTab === "seo" && <>
                  <ContentScorePanel {...scorePanelProps} inspectorView="fixes"
                    onFixWithAi={(label, detail) => openAssistant(undefined, `Help me address this issue: ${label}. ${detail}`)} />
                  {editorialTools}
                </>}
                {inspectorTab === "outline" && <WriterOutline project={p} onJump={jumpToHeading}>
                  <details className={styles.outlineLog}>
                    <summary>Brief &amp; Verify Log {w.verificationLog?.verificationStatus === "passed" && <small>Verified</small>}</summary>
                    <ContentScorePanel {...scorePanelProps} inspectorView="brief_log" />
                  </details>
                  <button className={styles.inspectorBrief} type="button" onClick={openBrief}>Edit article brief</button>
                </WriterOutline>}
              </WriterInspector>
            ) : !focus && <ContentScorePanel {...scorePanelProps} collapsed={!rightScoreOpen} />}
          </div>
        </>
      )}

      {!isStudioEmbedded && assistantPanel}

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
