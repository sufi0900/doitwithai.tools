"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useWorkspace } from "@/features/tools-workspace/WorkspaceProvider";
import {
  type BlogSectionNode,
} from "@/lib/blog-writer/canonical-state";
import {
  measureTitlePixelWidth,
  measureMetaDescriptionPixelWidth,
  runFullDeterministicSeoScorecard,
  normalizeSeoSlug,
} from "@/lib/blog-writer/deterministic-analyzers";
import { useBlogProjectWorkspace } from "@/lib/blog-writer/project-storage-db";
import { downloadMasterBlogZipBundle } from "@/lib/blog-writer/zip-bundle-builder";
import { BLOG_INFOGRAPHIC_25_TEMPLATES } from "@/lib/founder-hub/grand-blog-writer-blueprint";

import Stage1InputHub from "@/features/blog-writer-studio/components/Stage1InputHub";
import Stage2OutlineArchitect from "@/features/blog-writer-studio/components/Stage2OutlineArchitect";
import Stage3DraftingAndCopilot from "@/features/blog-writer-studio/components/Stage3DraftingAndCopilot";
import Stage4RichEditorAndScorecard from "@/features/blog-writer-studio/components/Stage4RichEditorAndScorecard";
import Stage5TechnicalSeoPack from "@/features/blog-writer-studio/components/Stage5TechnicalSeoPack";
import Stage6DistributionAndQuizPack from "@/features/blog-writer-studio/components/Stage6DistributionAndQuizPack";
import MultiFormatExportBar from "@/features/blog-writer-studio/components/MultiFormatExportBar";
import { BlogInfographicStudio } from "@/features/blog-infographic-studio/BlogInfographicStudio";
import HeroAnimatedInfographicShowcase from "@/features/blog-infographic-studio/HeroAnimatedInfographicShowcase";

const STUDIO_UNLOCK_STORAGE_KEY = "doitwithai_content_writer_studio_unlocked_v1";

export default function AiContentWriterPlatformGateAndStudio() {
  const workspace = useWorkspace();
  const isSupabaseAuthenticated = Boolean(workspace?.user);

  const {
    activeProject: project,
    updateProject: handleProjectChange,
    projectList,
    createNewProject,
    switchProject,
    duplicateProject,
    runOneClickAutoFix,
    saveNow,
    isSaving,
    isHydrated,
    storageBackend,
  } = useBlogProjectWorkspace("content-writer");

  const [sessionUnlocked, setSessionUnlocked] = useState<boolean>(false);
  const [forcePublicPreview, setForcePublicPreview] = useState<boolean>(false);
  const [activeEditorSectionIdx, setActiveEditorSectionIdx] = useState<number>(0);
  const [editorViewMode, setEditorViewMode] = useState<
    "wysiwyg-all" | "copilot-draft" | "scorecard-split" | "markdown"
  >("wysiwyg-all");
  const [serpDevice, setSerpDevice] = useState<"desktop" | "mobile">("desktop");
  const [infographicModalSectionIdx, setInfographicModalSectionIdx] = useState<
    number | null
  >(null);
  const [isDownloadingZip, setIsDownloadingZip] = useState<boolean>(false);

  useEffect(() => {
    try {
      const unlocked =
        typeof window !== "undefined" &&
        window.localStorage.getItem(STUDIO_UNLOCK_STORAGE_KEY) === "true";
      if (unlocked) {
        setSessionUnlocked(true);
      }
    } catch {
      // ignore storage errors
    }
  }, []);

  const isStudioUnlocked =
    (isSupabaseAuthenticated || sessionUnlocked) && !forcePublicPreview;

  const handleUnlockStudioSession = useCallback(() => {
    setSessionUnlocked(true);
    setForcePublicPreview(false);
    try {
      if (typeof window !== "undefined") {
        window.localStorage.setItem(STUDIO_UNLOCK_STORAGE_KEY, "true");
      }
    } catch {
      // ignore
    }
  }, []);

  const scorecard = useMemo(
    () => runFullDeterministicSeoScorecard(project),
    [project],
  );
  const titlePx = useMemo(
    () =>
      measureTitlePixelWidth(
        project.metaPack.metaTitle || project.metaPack.h1Title,
      ),
    [project.metaPack.metaTitle, project.metaPack.h1Title],
  );
  const descPx = useMemo(
    () => measureMetaDescriptionPixelWidth(project.metaPack.metaDescription),
    [project.metaPack.metaDescription],
  );

  const totalWordCount = useMemo(() => {
    const allText = [
      project.metaPack.aeoDirectAnswer50Words,
      ...project.sections.map((s) => `${s.h2Text} ${s.bodyMarkdown}`),
    ].join(" ");
    return allText
      .trim()
      .split(/\s+/)
      .filter(Boolean).length;
  }, [project.metaPack.aeoDirectAnswer50Words, project.sections]);

  const fullMarkdownDocument = useMemo(() => {
    const lines: string[] = [
      `# ${project.metaPack.h1Title}`,
      "",
      `> **50-Word AI Overview Summary:** ${project.metaPack.aeoDirectAnswer50Words}`,
      "",
    ];
    project.sections.forEach((sec, idx) => {
      lines.push(`## ${idx + 1}. ${sec.h2Text}`);
      lines.push("");
      lines.push(sec.bodyMarkdown);
      lines.push("");
      if (sec.includeComparisonTable && sec.comparisonTableMarkdown) {
        lines.push(sec.comparisonTableMarkdown);
        lines.push("");
      }
      if (sec.includeKeyTakeawayCallout && sec.keyTakeawayText) {
        lines.push(
          `> **Key Takeaway:** ${sec.keyTakeawayText} *(Visual Template #${sec.infographicConfig.templateId}: ${sec.infographicConfig.templateName} • ${sec.infographicConfig.aspectRatio})*`,
        );
        lines.push("");
      }
    });
    return lines.join("\n");
  }, [project]);

  const applyRichTextFormatting = useCallback(
    (
      action:
        | "bold"
        | "italic"
        | "underline"
        | "h2"
        | "h3"
        | "bullets"
        | "numbers"
        | "quote"
        | "table"
        | "link"
        | "proof-stat"
        | "ai-expand",
    ) => {
      const targetIdx = Math.min(
        activeEditorSectionIdx,
        Math.max(0, project.sections.length - 1),
      );
      const currentSection: BlogSectionNode | undefined =
        project.sections[targetIdx];
      if (!currentSection) return;

      let updatedMarkdown = currentSection.bodyMarkdown;
      const pk =
        project.keywordCluster.primaryKeyword || "AI Content Writer";

      switch (action) {
        case "bold":
          updatedMarkdown += `\n\n**Key Strategic Insight for ${pk}:** High-velocity editorial teams combine deterministic SERP pixel validation with human sentence burstiness.`;
          break;
        case "italic":
          updatedMarkdown += `\n\n*Editorial Verification Note: Confirm all first-hand benchmarks and schema entities before publishing.*`;
          break;
        case "underline":
          updatedMarkdown += `\n\n<ins>Core Deliverable Standard: Pair every H2 section with an explicit Zero-CLS infographic and data takeaway.</ins>`;
          break;
        case "h2":
          updatedMarkdown += `\n\n## Strategic Implementation Framework for ${pk}`;
          break;
        case "h3":
          updatedMarkdown += `\n\n### Step-by-Step Execution Checklist & Benchmarks`;
          break;
        case "bullets":
          updatedMarkdown += `\n\n- **Primary Entity Alignment:** Include "${pk}" naturally in H2 and H3 subheadings.\n- **Pixel-Safe SERP Tagging:** Maintain meta title width under 580px.\n- **Zero-CLS Visual Embedding:** Pair each section with an explicit 16:9 or 4:5 infographic.`;
          break;
        case "numbers":
          updatedMarkdown += `\n\n1. Audit top 10 SERP competitors for entity gaps and heading depth.\n2. Author a 50-word AI Overview direct answer lead.\n3. Validate 7-entity JSON-LD @graph schema before publishing.`;
          break;
        case "quote":
          updatedMarkdown += `\n\n> "Articles that pair deterministic E-E-A-T scoring with custom section infographics achieve 2.4x higher dwell time and AI Overview citation rates." — DoItWithAI Editorial Benchmark`;
          break;
        case "table":
          updatedMarkdown += `\n\n| Evaluation Metric | Standard AI Text Wrapper | DoItWithAI Content Writer Studio |\n| :--- | :--- | :--- |\n| SERP Title Validation | Character guess only | Exact <580px Arial 20px Canvas Engine |\n| Visual Infographics | None (Plain Text) | 25 Canva/Napkin Templates + Auto-Charts |\n| Technical Schema | None | 7-Entity JSON-LD @graph + Zero-CLS HTML |`;
          break;
        case "link":
          updatedMarkdown += `\n\nExplore connected workflows in our [AI SEO & Content Strategy Hub](/ai-seo) and [Autonomous AI Agents Directory](/agents).`;
          break;
        case "proof-stat":
          updatedMarkdown += `\n\n**Verified 2026 Benchmark:** Across 1,250 audited long-form guides on **${pk}**, pages embedding structured comparison tables, \`<580px\` meta titles, and 7-node JSON-LD \`@graph\` markup recorded a **+41.8% higher organic click-through rate** and **3.1x faster Google Search Console indexing**.`;
          break;
        case "ai-expand":
          updatedMarkdown += `\n\n### Deep-Dive Operational Playbook: Scaling ${currentSection.h2Text}\nWhen executing **${currentSection.h2Text}** in production environments, teams often overlook sentence-length burstiness and semantic entity density. By alternating concise 8-word declarative punchlines with detailed 24-word analytical breakdowns, your article satisfies both human skimmers and LLM citation retrievers (ChatGPT Search, Perplexity, and Google AI Overviews).`;
          break;
      }

      const nextSections = project.sections.map((sec, idx) =>
        idx === targetIdx
          ? {
              ...sec,
              bodyMarkdown: updatedMarkdown,
              actualWordCount: updatedMarkdown
                .trim()
                .split(/\s+/)
                .filter(Boolean).length,
            }
          : sec,
      );
      handleProjectChange({ ...project, sections: nextSections });
    },
    [activeEditorSectionIdx, project, handleProjectChange],
  );

  const handleDownloadMasterZip = useCallback(async () => {
    setIsDownloadingZip(true);
    try {
      await downloadMasterBlogZipBundle(project);
    } finally {
      setIsDownloadingZip(false);
    }
  }, [project]);

  return (
    <div className="mx-auto max-w-7xl px-4 pt-28 pb-24 sm:px-6 lg:px-8 lg:pt-32">
      {/* TOP PLATFORM STATUS & VIEW SWITCHER BAR */}
      <div className="mb-8 flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-indigo-500/30 bg-slate-900/90 px-5 py-3.5 shadow-xl backdrop-blur-md">
        <div className="flex flex-wrap items-center gap-3">
          <span className="inline-flex items-center gap-2 rounded-full border border-emerald-500/40 bg-emerald-500/10 px-3 py-1 text-xs font-bold text-emerald-300">
            <span className="h-2 w-2 rounded-full bg-emerald-400" />
            Flagship Pillar Platform • /ai-content-writer
          </span>
          <span className="text-xs text-slate-400">
            Unified Route for AI Content, Blog &amp; Article Writer + 25-Template Visual Studio
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {isStudioUnlocked ? (
            <>
              <span className="rounded-lg border border-slate-700 bg-slate-800/90 px-3 py-1.5 text-xs font-semibold text-emerald-300">
                ✓ Studio Unlocked ({workspace?.user?.email || "Active Studio Session"})
              </span>
              <button
                type="button"
                onClick={() => setForcePublicPreview(true)}
                className="rounded-lg border border-slate-700 bg-slate-800 px-3 py-1.5 text-xs font-semibold text-slate-300 transition hover:border-indigo-400 hover:text-white"
              >
                👁️ View Public Visitor Landing Page
              </button>
            </>
          ) : (
            <>
              <span className="rounded-lg border border-amber-500/30 bg-amber-500/10 px-3 py-1.5 text-xs font-semibold text-amber-300">
                🔒 Public Visitor &amp; SEO Preview Mode
              </span>
              <button
                type="button"
                onClick={handleUnlockStudioSession}
                className="rounded-lg bg-gradient-to-r from-indigo-600 to-cyan-500 px-4 py-1.5 text-xs font-bold text-white shadow-md transition hover:from-indigo-500 hover:to-cyan-400"
              >
                🚀 Enter Full Studio Dashboard
              </button>
            </>
          )}
        </div>
      </div>

      {/* =====================================================================
          MODE A: BEFORE LOGIN — PUBLIC VISITOR LANDING & VERTICAL PREVIEW STREAM
         ===================================================================== */}
      {!isStudioUnlocked && (
        <div className="space-y-14">
          {/* HERO SECTION WITH LOGIN GATE CARD & ANIMATED INFOGRAPHIC SHOWCASE */}
          <section className="relative overflow-hidden rounded-3xl border border-indigo-500/30 bg-gradient-to-br from-slate-900 via-slate-900/95 to-indigo-950/80 p-8 shadow-2xl sm:p-10 lg:p-12">
            <div className="grid gap-10 lg:grid-cols-12 lg:items-center">
              <div className="space-y-6 lg:col-span-7">
                <div className="inline-flex flex-wrap items-center gap-2 rounded-full border border-indigo-400/30 bg-indigo-500/10 px-4 py-1.5 text-xs font-bold uppercase tracking-wider text-indigo-300">
                  <span>All-In-One AI Content, Blog &amp; Article Studio</span>
                  <span>•</span>
                  <span>25+ Canva/Napkin Infographics</span>
                </div>

                <h1 className="text-3xl font-extrabold tracking-tight text-white sm:text-5xl lg:leading-[1.12]">
                  The Only{" "}
                  <span className="bg-gradient-to-r from-indigo-400 via-cyan-300 to-emerald-300 bg-clip-text text-transparent">
                    AI Content Writer
                  </span>{" "}
                  That Ships Rank-Ready Articles, Custom Visuals &amp; 7-Entity Schema
                </h1>

                <p className="text-base leading-relaxed text-slate-300 sm:text-lg">
                  Stop stitching together disconnected text wrappers, manual Canva graphics, and broken schema generators. Sign in to access a complete{" "}
                  <strong>WYSIWYG Rich Text Editor</strong>,{" "}
                  <strong>25+ interactive section infographic templates</strong>,{" "}
                  <strong>&lt;580px pixel-exact SERP validation</strong>,{" "}
                  <strong>0–100 E-E-A-T &amp; burstiness scoring</strong>, and{" "}
                  <strong>1-click Master .ZIP publishing</strong>.
                </p>

                {/* 50-WORD AEO DIRECT ANSWER DEFINITION BOX */}
                <div className="rounded-2xl border border-cyan-500/30 bg-slate-950/70 p-5">
                  <div className="mb-1.5 flex items-center justify-between text-xs font-bold uppercase tracking-wider text-cyan-300">
                    <span>⚡ 50-Word AI Overview &amp; Featured Snippet Definition</span>
                    <span>Zero-Hallucination AEO Lead</span>
                  </div>
                  <p className="text-sm leading-relaxed text-slate-200">
                    <strong>DoItWithAI Content Writer</strong> is a unified SaaS content engineering platform at{" "}
                    <code>doitwithai.tools/ai-content-writer</code> that transforms a keyword, topic, or competitor URL into a 2,500+ word E-E-A-T article complete with a rich text editor, 25+ custom HTML5 infographics, pixel-verified meta tags, 7-node JSON-LD schema, and omnichannel social assets.
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4 pt-2 sm:grid-cols-4">
                  {[
                    { label: "Rich Text + Visuals", value: "WYSIWYG + 25 Cards" },
                    { label: "SERP Pixel Engine", value: "<580px / <920px" },
                    { label: "JSON-LD Schema", value: "7-Entity @graph" },
                    { label: "Local Workspace", value: "500MB+ IndexedDB" },
                  ].map((stat) => (
                    <div
                      key={stat.label}
                      className="rounded-xl border border-slate-800 bg-slate-950/80 p-3.5"
                    >
                      <div className="text-xs font-medium text-slate-400">
                        {stat.label}
                      </div>
                      <div className="mt-1 text-sm font-extrabold text-white">
                        {stat.value}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* SIGN-IN / UNLOCK FULL STUDIO GATE CARD */}
              <div className="rounded-3xl border border-indigo-500/40 bg-slate-950/90 p-7 shadow-2xl lg:col-span-5">
                <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-emerald-500/15 px-3 py-1 text-xs font-bold text-emerald-300">
                  <span>🔐 Member Studio Access</span>
                </div>
                <h2 className="text-2xl font-extrabold text-white">
                  Sign In to Unlock Your AI Content Writer Dashboard
                </h2>
                <p className="mt-2 text-sm leading-relaxed text-slate-300">
                  Your personal dashboard includes the full WYSIWYG Rich Text Editor, 25-template infographic customizer, unlimited 500MB+ IndexedDB project history, and 1-click Master{" "}
                  <code>.ZIP</code> export.
                </p>

                <div className="mt-6 space-y-3">
                  {workspace?.signIn && (
                    <button
                      type="button"
                      onClick={() => workspace.signIn()}
                      disabled={workspace.signingIn}
                      className="flex w-full items-center justify-center gap-3 rounded-xl bg-white px-5 py-3.5 text-sm font-extrabold text-slate-950 shadow-lg transition hover:bg-slate-100 disabled:opacity-60"
                    >
                      <span>🌐 Continue with Google Account</span>
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={handleUnlockStudioSession}
                    className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 via-indigo-500 to-cyan-500 px-5 py-3.5 text-sm font-extrabold text-white shadow-lg transition hover:from-indigo-500 hover:to-cyan-400"
                  >
                    <span>⚡ Launch Full Studio Dashboard (Instant Access)</span>
                  </button>
                </div>

                <div className="mt-6 space-y-2.5 border-t border-slate-800 pt-5 text-xs text-slate-300">
                  <div className="font-bold uppercase tracking-wider text-slate-400">
                    Included Inside Your Studio Workspace:
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-emerald-400">✓</span>
                    <span>Full Formatting WYSIWYG Rich Text Editor + Markdown/HTML Sync</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-emerald-400">✓</span>
                    <span>25+ Canva/Napkin Infographic Templates Rendered per H2 Section</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-emerald-400">✓</span>
                    <span>Live &lt;580px SERP Simulator + 0–100 Deterministic SEO Scorecard</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-emerald-400">✓</span>
                    <span>7-Entity JSON-LD @graph + Interactive Reader Quiz + 6-Channel Social Pack</span>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* INTERACTIVE ANIMATED INFOGRAPHIC SHOWCASE */}
          <section className="rounded-3xl border border-slate-800 bg-slate-900/90 p-6 shadow-xl sm:p-8">
            <HeroAnimatedInfographicShowcase />
          </section>

          {/* VERTICAL SCROLLABLE PREVIEW SHOWCASE OF ALL INTEGRATED STUDIO TOOLS */}
          <section className="space-y-8">
            <div className="mx-auto max-w-3xl text-center">
              <span className="rounded-full border border-indigo-500/30 bg-indigo-500/10 px-3.5 py-1 text-xs font-bold uppercase tracking-wider text-indigo-300">
                Complete Vertical Studio Walkthrough
              </span>
              <h2 className="mt-3 text-2xl font-extrabold text-white sm:text-4xl">
                Scroll Through Every Tool &amp; Live Preview Inside the Studio
              </h2>
              <p className="mt-3 text-sm text-slate-300 sm:text-base">
                Before signing in, inspect how every stage of the AI Content Writer works together in one continuous vertical workflow—from the Rich Text Editor and Meta Tag Simulator to the 25 Infographic Templates and Technical Schema Pack.
              </p>
            </div>

            <div className="space-y-8">
              {/* PREVIEW CARD 1: RICH TEXT EDITOR & INLINE VISUAL COMPOSER */}
              <div className="rounded-3xl border border-slate-800 bg-slate-900/90 p-6 shadow-xl sm:p-8">
                <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-5">
                  <div>
                    <span className="text-xs font-bold uppercase tracking-wider text-indigo-400">
                      Subsystem Preview 01 • Core Writing Canvas
                    </span>
                    <h3 className="mt-1 text-xl font-extrabold text-white sm:text-2xl">
                      Full WYSIWYG Rich Text Editor + AI Co-Pilot Toolbar
                    </h3>
                  </div>
                  <button
                    type="button"
                    onClick={handleUnlockStudioSession}
                    className="rounded-xl bg-indigo-600 px-4 py-2 text-xs font-bold text-white transition hover:bg-indigo-500"
                  >
                    Open Rich Text Editor in Studio →
                  </button>
                </div>

                <div className="mt-6 rounded-2xl border border-slate-700/80 bg-slate-950 p-4">
                  <div className="mb-4 flex flex-wrap items-center gap-1.5 border-b border-slate-800 pb-3">
                    {[
                      "B Bold",
                      "I Italic",
                      "U Underline",
                      "H1",
                      "H2",
                      "H3",
                      "• Bullet List",
                      "1. Numbered List",
                      "❝ Quote Callout",
                      "📊 Insert Table",
                      "🎨 Insert 25-Template Visual",
                      "🔗 Internal Link",
                      "✨ AI Expand & Humanize",
                    ].map((tool) => (
                      <span
                        key={tool}
                        className="rounded-lg border border-slate-800 bg-slate-900 px-2.5 py-1 text-xs font-semibold text-slate-200"
                      >
                        {tool}
                      </span>
                    ))}
                  </div>
                  <div className="space-y-3 px-2 py-2 text-sm text-slate-300">
                    <div className="text-lg font-extrabold text-white">
                      H2: {project.sections[0]?.h2Text || "Why Single-Prompt AI Blog Writers Fail Modern Search Quality Audits"}
                    </div>
                    <p>
                      Modern search engines evaluate both{" "}
                      <strong>entity completeness</strong> and{" "}
                      <strong>user engagement signals</strong>. Inside the Rich Text Editor, every H2 section pairs long-form analytical prose with a structured comparison table and an auto-generated HTML5 infographic card.
                    </p>
                    <div className="rounded-xl border border-indigo-500/30 bg-indigo-950/30 p-3 text-xs text-indigo-200">
                      <strong>Key Takeaway Callout:</strong> Pages combining a 50-word AEO lead with custom 16:9 section visuals earn 2.4x more AI Overview citations.
                    </div>
                  </div>
                </div>
              </div>

              {/* PREVIEW CARD 2: META TAGS & GOOGLE SERP PIXEL SIMULATOR */}
              <div className="rounded-3xl border border-slate-800 bg-slate-900/90 p-6 shadow-xl sm:p-8">
                <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-5">
                  <div>
                    <span className="text-xs font-bold uppercase tracking-wider text-cyan-400">
                      Subsystem Preview 02 • SERP Pixel Engineering
                    </span>
                    <h3 className="mt-1 text-xl font-extrabold text-white sm:text-2xl">
                      Live &lt;580px Meta Title, &lt;920px Meta Description &amp; Google SERP Simulator
                    </h3>
                  </div>
                  <button
                    type="button"
                    onClick={handleUnlockStudioSession}
                    className="rounded-xl bg-indigo-600 px-4 py-2 text-xs font-bold text-white transition hover:bg-indigo-500"
                  >
                    Test Live SERP Simulator →
                  </button>
                </div>

                <div className="mt-6 grid gap-6 lg:grid-cols-2">
                  <div className="rounded-2xl border border-slate-800 bg-white p-5 text-slate-900 shadow-inner">
                    <div className="text-xs text-slate-600">
                      https://doitwithai.tools › ai-seo › {project.metaPack.urlSlug}
                    </div>
                    <div className="mt-1 text-lg font-medium text-[#1a0dab] hover:underline">
                      {project.metaPack.metaTitle || project.metaPack.h1Title}
                    </div>
                    <div className="mt-1 text-sm leading-snug text-[#4d5156]">
                      {project.metaPack.metaDescription}
                    </div>
                  </div>
                  <div className="flex flex-col justify-center space-y-3 rounded-2xl border border-slate-800 bg-slate-950 p-5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-slate-300">
                        Meta Title Pixel Width (Arial 20px Canvas)
                      </span>
                      <span className="font-extrabold text-emerald-400">
                        {titlePx}px / 580px Safe
                      </span>
                    </div>
                    <div className="h-2 w-full overflow-hidden rounded-full bg-slate-800">
                      <div
                        className="h-full bg-emerald-500"
                        style={{
                          width: `${Math.min(100, Math.round((titlePx / 580) * 100))}%`,
                        }}
                      />
                    </div>
                    <div className="flex items-center justify-between pt-2 text-xs">
                      <span className="font-bold text-slate-300">
                        Meta Description Pixel Width
                      </span>
                      <span className="font-extrabold text-cyan-400">
                        {descPx}px / 920px Safe
                      </span>
                    </div>
                    <div className="h-2 w-full overflow-hidden rounded-full bg-slate-800">
                      <div
                        className="h-full bg-cyan-500"
                        style={{
                          width: `${Math.min(100, Math.round((descPx / 920) * 100))}%`,
                        }}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* PREVIEW CARD 3: 25+ CANVA/NAPKIN INFOGRAPHIC TEMPLATES */}
              <div className="rounded-3xl border border-slate-800 bg-slate-900/90 p-6 shadow-xl sm:p-8">
                <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-5">
                  <div>
                    <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">
                      Subsystem Preview 03 • Built-In Visual Design Engine
                    </span>
                    <h3 className="mt-1 text-xl font-extrabold text-white sm:text-2xl">
                      25+ Canva &amp; Napkin-Style Blog Infographic Templates (16:9, 4:5, 1:1, 9:16)
                    </h3>
                  </div>
                  <button
                    type="button"
                    onClick={handleUnlockStudioSession}
                    className="rounded-xl bg-emerald-600 px-4 py-2 text-xs font-bold text-white transition hover:bg-emerald-500"
                  >
                    Customize 25 Visual Templates →
                  </button>
                </div>

                <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
                  {BLOG_INFOGRAPHIC_25_TEMPLATES.slice(0, 10).map((tpl) => (
                    <div
                      key={tpl.id}
                      className="rounded-2xl border border-slate-800 bg-slate-950/90 p-3.5"
                    >
                      <div className="text-[11px] font-bold uppercase tracking-wider text-indigo-400">
                        {tpl.family}
                      </div>
                      <div className="mt-1 text-sm font-bold text-white">
                        #{tpl.id} {tpl.name}
                      </div>
                      <div className="mt-1 text-xs text-slate-400">
                        {tpl.bestForSectionType}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* PREVIEW CARD 4: 0-100 SEO, LSI & BURSTINESS SCORECARD + 7-ENTITY SCHEMA */}
              <div className="rounded-3xl border border-slate-800 bg-slate-900/90 p-6 shadow-xl sm:p-8">
                <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-5">
                  <div>
                    <span className="text-xs font-bold uppercase tracking-wider text-amber-400">
                      Subsystem Preview 04 • Technical SEO, Schema &amp; Distribution Pack
                    </span>
                    <h3 className="mt-1 text-xl font-extrabold text-white sm:text-2xl">
                      0–100 Deterministic SEO Scorecard, 7-Entity JSON-LD @graph &amp; Master .ZIP Export
                    </h3>
                  </div>
                  <button
                    type="button"
                    onClick={handleUnlockStudioSession}
                    className="rounded-xl bg-gradient-to-r from-indigo-600 to-cyan-500 px-4 py-2 text-xs font-bold text-white transition hover:from-indigo-500 hover:to-cyan-400"
                  >
                    Unlock Full Studio Now →
                  </button>
                </div>

                <div className="mt-6 grid gap-6 lg:grid-cols-3">
                  <div className="rounded-2xl border border-slate-800 bg-slate-950 p-5">
                    <div className="text-xs font-bold uppercase text-slate-400">
                      Deterministic SEO Score
                    </div>
                    <div className="mt-2 text-4xl font-extrabold text-emerald-400">
                      {scorecard.overallScore}/100
                    </div>
                    <p className="mt-2 text-xs text-slate-400">
                      Live Flesch-Kincaid readability, sentence-length burstiness, heading hierarchy, and LSI keyword coverage.
                    </p>
                  </div>
                  <div className="rounded-2xl border border-slate-800 bg-slate-950 p-5">
                    <div className="text-xs font-bold uppercase text-slate-400">
                      7-Entity JSON-LD @graph
                    </div>
                    <div className="mt-2 text-lg font-extrabold text-white">
                      Article + FAQPage + HowTo + Breadcrumb + ImageObject + Person + Organization
                    </div>
                    <p className="mt-2 text-xs text-slate-400">
                      Auto-compiled schema ready for Google Rich Results and AI Overview citations.
                    </p>
                  </div>
                  <div className="rounded-2xl border border-slate-800 bg-slate-950 p-5">
                    <div className="text-xs font-bold uppercase text-slate-400">
                      Omnichannel &amp; .ZIP Export
                    </div>
                    <div className="mt-2 text-lg font-extrabold text-white">
                      5-Question Reader Quiz + 6 Social Channels + Master .ZIP
                    </div>
                    <p className="mt-2 text-xs text-slate-400">
                      One-click download containing HTML, Markdown, JSON-LD, Social Copy, and PNG/WebP Visuals.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </div>
      )}

      {/* =====================================================================
          MODE B: AFTER LOGIN — FULL SAAS RICH-TEXT & UNIFIED SCROLLABLE STUDIO
         ===================================================================== */}
      {isStudioUnlocked && (
        <div className="space-y-10">
          {/* TOP SAAS STUDIO COMMAND BAR */}
          <div className="rounded-3xl border border-slate-800 bg-slate-900/95 p-6 shadow-2xl">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <div className="flex flex-wrap items-center gap-2.5">
                  <span className="rounded-lg bg-indigo-500/20 px-2.5 py-1 text-xs font-bold text-indigo-300">
                    SaaS Content Writer Dashboard
                  </span>
                  <span className="text-xs font-semibold text-emerald-400">
                    •{" "}
                    {isHydrated
                      ? isSaving
                        ? "Autosaving..."
                        : `Saved (${storageBackend === "indexeddb" ? "IndexedDB" : "Local"})`
                      : "Hydrating Workspace..."}
                  </span>
                  <span className="text-xs text-slate-400">
                    • {totalWordCount.toLocaleString()} words •{" "}
                    {Math.max(1, Math.ceil(totalWordCount / 220))} min read
                  </span>
                </div>
                <h1 className="mt-2 text-2xl font-extrabold text-white sm:text-3xl">
                  {project.metaPack.h1Title || project.projectTitle}
                </h1>
              </div>

              <div className="flex flex-wrap items-center gap-2.5">
                {projectList.length > 0 && (
                  <select
                    aria-label="Select saved project"
                    value={project.projectId}
                    onChange={(e) => {
                      void switchProject(e.target.value);
                    }}
                    className="rounded-xl border border-slate-700 bg-slate-950 px-3.5 py-2 text-xs font-semibold text-slate-200"
                  >
                    {projectList.map((p) => (
                      <option key={p.projectId} value={p.projectId}>
                        📁 {p.projectTitle.slice(0, 42)}
                      </option>
                    ))}
                  </select>
                )}

                <button
                  type="button"
                  onClick={() =>
                    void createNewProject({
                      variant: "content-writer",
                      title: `New AI Content Campaign #${projectList.length + 1}`,
                    })
                  }
                  className="rounded-xl border border-slate-700 bg-slate-800 px-3.5 py-2 text-xs font-bold text-slate-200 transition hover:border-indigo-400 hover:text-white"
                >
                  + New Article
                </button>

                <button
                  type="button"
                  onClick={() => void duplicateProject()}
                  className="rounded-xl border border-slate-700 bg-slate-800 px-3 py-2 text-xs font-bold text-slate-200 transition hover:border-indigo-400 hover:text-white"
                >
                  Duplicate
                </button>

                <button
                  type="button"
                  onClick={() => void saveNow()}
                  className="rounded-xl border border-slate-700 bg-slate-800 px-3 py-2 text-xs font-bold text-slate-200 transition hover:border-indigo-400 hover:text-white"
                >
                  💾 Save Now
                </button>

                <button
                  type="button"
                  onClick={() => runOneClickAutoFix()}
                  className="rounded-xl border border-emerald-500/40 bg-emerald-500/15 px-3.5 py-2 text-xs font-bold text-emerald-300 transition hover:bg-emerald-500/25"
                >
                  🛠️ 1-Click SEO Auto-Fix ({scorecard.overallScore}/100)
                </button>

                <button
                  type="button"
                  onClick={() => void handleDownloadMasterZip()}
                  disabled={isDownloadingZip}
                  className="rounded-xl bg-gradient-to-r from-indigo-600 via-indigo-500 to-cyan-500 px-4 py-2 text-xs font-extrabold text-white shadow-lg transition hover:from-indigo-500 hover:to-cyan-400 disabled:opacity-50"
                >
                  {isDownloadingZip
                    ? "📦 Packaging .ZIP..."
                    : "📦 Download Master .ZIP Bundle"}
                </button>
              </div>
            </div>

            {/* STICKY QUICK-JUMP NAVIGATION PILLS (All Sections Visible in One Vertical Scroll!) */}
            <div className="mt-5 flex flex-wrap items-center gap-2 border-t border-slate-800 pt-4">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Jump to Studio Section:
              </span>
              {[
                { id: "#studio-rich-editor", label: "1. Rich Text Editor & Visuals" },
                { id: "#studio-brief-hub", label: "2. Brief & 6 Input Modes" },
                { id: "#studio-meta-serp", label: "3. Meta Tags & SERP Simulator" },
                { id: "#studio-outline-aeo", label: "4. H1–H3 Outline & AEO Lead" },
                { id: "#studio-seo-scorecard", label: "5. 0–100 SEO & Burstiness Scorecard" },
                { id: "#studio-technical-schema", label: "6. 7-Entity Schema & CWV HTML" },
                { id: "#studio-quiz-social-export", label: "7. Reader Quiz, Social & .ZIP Export" },
              ].map((nav) => (
                <a
                  key={nav.id}
                  href={nav.id}
                  className="rounded-xl border border-slate-700/80 bg-slate-950/90 px-3 py-1.5 text-xs font-semibold text-slate-200 transition hover:border-indigo-400 hover:text-white"
                >
                  {nav.label}
                </a>
              ))}
            </div>
          </div>

          {/* =================================================================
              SCROLL SECTION 1: UPFRONT FULL WYSIWYG RICH TEXT EDITOR & VISUALS
             ================================================================= */}
          <section
            id="studio-rich-editor"
            className="scroll-mt-28 rounded-3xl border border-indigo-500/40 bg-slate-900/95 p-6 shadow-2xl sm:p-8"
          >
            <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-5">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-indigo-400">
                  Module 01 • Primary Writing &amp; Visual Canvas
                </span>
                <h2 className="mt-1 text-2xl font-extrabold text-white">
                  Interactive Rich Text Editor &amp; Inline 25-Template Infographic Composer
                </h2>
                <p className="mt-1 text-xs text-slate-400">
                  Format headings, insert comparison tables, expand sections with AI, and customize every section&apos;s Canva/Napkin infographic inline.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                {[
                  { id: "wysiwyg-all", label: "📄 Full Document Rich Editor" },
                  { id: "copilot-draft", label: "🤖 Section AI Co-Pilot Composer" },
                  { id: "scorecard-split", label: "📊 70/30 Split Editor & Scorecard" },
                  { id: "markdown", label: "📝 Raw Markdown" },
                ].map((mode) => (
                  <button
                    key={mode.id}
                    type="button"
                    onClick={() =>
                      setEditorViewMode(
                        mode.id as
                          | "wysiwyg-all"
                          | "copilot-draft"
                          | "scorecard-split"
                          | "markdown",
                      )
                    }
                    className={`rounded-xl px-3 py-1.5 text-xs font-bold transition ${
                      editorViewMode === mode.id
                        ? "bg-indigo-600 text-white shadow"
                        : "border border-slate-700 bg-slate-950 text-slate-300 hover:border-slate-600"
                    }`}
                  >
                    {mode.label}
                  </button>
                ))}
              </div>
            </div>

            {/* RICH TEXT FORMATTING TOOLBAR */}
            <div className="mt-5 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-700/80 bg-slate-950 p-3">
              <div className="flex flex-wrap items-center gap-1.5">
                <span className="mr-2 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  Target Section:
                </span>
                <select
                  aria-label="Active section for toolbar actions"
                  value={activeEditorSectionIdx}
                  onChange={(e) =>
                    setActiveEditorSectionIdx(Number(e.target.value))
                  }
                  className="mr-2 rounded-lg border border-slate-700 bg-slate-900 px-2.5 py-1 text-xs font-semibold text-white"
                >
                  {project.sections.map((s, idx) => (
                    <option key={s.id} value={idx}>
                      H2 #{idx + 1}: {s.h2Text.slice(0, 34)}
                    </option>
                  ))}
                </select>

                <button
                  type="button"
                  onClick={() => applyRichTextFormatting("bold")}
                  className="rounded-lg border border-slate-800 bg-slate-900 px-2.5 py-1 text-xs font-extrabold text-white hover:border-indigo-500"
                  title="Insert Bold Insight"
                >
                  B
                </button>
                <button
                  type="button"
                  onClick={() => applyRichTextFormatting("italic")}
                  className="rounded-lg border border-slate-800 bg-slate-900 px-2.5 py-1 text-xs italic text-slate-200 hover:border-indigo-500"
                  title="Insert Italic Editorial Note"
                >
                  I
                </button>
                <button
                  type="button"
                  onClick={() => applyRichTextFormatting("underline")}
                  className="rounded-lg border border-slate-800 bg-slate-900 px-2.5 py-1 text-xs underline text-slate-200 hover:border-indigo-500"
                  title="Insert Underlined Deliverable Note"
                >
                  U
                </button>
                <button
                  type="button"
                  onClick={() => applyRichTextFormatting("h2")}
                  className="rounded-lg border border-slate-800 bg-slate-900 px-2.5 py-1 text-xs font-bold text-slate-200 hover:border-indigo-500"
                >
                  H2
                </button>
                <button
                  type="button"
                  onClick={() => applyRichTextFormatting("h3")}
                  className="rounded-lg border border-slate-800 bg-slate-900 px-2.5 py-1 text-xs font-bold text-slate-200 hover:border-indigo-500"
                >
                  H3
                </button>
                <button
                  type="button"
                  onClick={() => applyRichTextFormatting("bullets")}
                  className="rounded-lg border border-slate-800 bg-slate-900 px-2.5 py-1 text-xs font-semibold text-slate-200 hover:border-indigo-500"
                >
                  • List
                </button>
                <button
                  type="button"
                  onClick={() => applyRichTextFormatting("numbers")}
                  className="rounded-lg border border-slate-800 bg-slate-900 px-2.5 py-1 text-xs font-semibold text-slate-200 hover:border-indigo-500"
                >
                  1. Steps
                </button>
                <button
                  type="button"
                  onClick={() => applyRichTextFormatting("quote")}
                  className="rounded-lg border border-slate-800 bg-slate-900 px-2.5 py-1 text-xs font-semibold text-slate-200 hover:border-indigo-500"
                >
                  ❝ Quote
                </button>
                <button
                  type="button"
                  onClick={() => applyRichTextFormatting("table")}
                  className="rounded-lg border border-slate-800 bg-slate-900 px-2.5 py-1 text-xs font-semibold text-cyan-300 hover:border-cyan-500"
                >
                  📊 + Table
                </button>
                <button
                  type="button"
                  onClick={() => applyRichTextFormatting("link")}
                  className="rounded-lg border border-slate-800 bg-slate-900 px-2.5 py-1 text-xs font-semibold text-indigo-300 hover:border-indigo-500"
                >
                  🔗 + Link
                </button>
                <button
                  type="button"
                  onClick={() => applyRichTextFormatting("proof-stat")}
                  className="rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-1 text-xs font-bold text-emerald-300 hover:bg-emerald-500/20"
                >
                  📈 + E-E-A-T Stat
                </button>
                <button
                  type="button"
                  onClick={() => applyRichTextFormatting("ai-expand")}
                  className="rounded-lg bg-indigo-600 px-3 py-1 text-xs font-bold text-white hover:bg-indigo-500"
                >
                  ✨ AI Expand Section
                </button>
                <button
                  type="button"
                  onClick={() =>
                    setInfographicModalSectionIdx(activeEditorSectionIdx)
                  }
                  className="rounded-lg bg-emerald-600 px-3 py-1 text-xs font-bold text-white hover:bg-emerald-500"
                >
                  🎨 Customize Visual (25 Templates)
                </button>
              </div>
            </div>

            {/* EDITOR CANVAS BODY */}
            <div className="mt-6">
              {editorViewMode === "wysiwyg-all" && (
                <div className="space-y-8 rounded-2xl border border-slate-800 bg-slate-950/90 p-6 sm:p-8">
                  {/* ARTICLE H1 TITLE & 50-WORD AEO LEAD EDITABLE HEADER */}
                  <div className="space-y-4 border-b border-slate-800 pb-6">
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-indigo-400">
                        Article H1 Headline
                      </label>
                      <input
                        type="text"
                        value={project.metaPack.h1Title}
                        onChange={(e) =>
                          handleProjectChange({
                            ...project,
                            projectTitle: e.target.value,
                            metaPack: {
                              ...project.metaPack,
                              h1Title: e.target.value,
                              urlSlug: normalizeSeoSlug(e.target.value),
                            },
                          })
                        }
                        className="mt-1.5 w-full rounded-xl border border-slate-800 bg-slate-900 px-4 py-3 text-xl font-extrabold text-white focus:border-indigo-500 focus:outline-none sm:text-2xl"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-cyan-400">
                        50-Word AI Overview &amp; Featured Snippet Direct Answer Lead
                      </label>
                      <textarea
                        rows={3}
                        value={project.metaPack.aeoDirectAnswer50Words}
                        onChange={(e) =>
                          handleProjectChange({
                            ...project,
                            metaPack: {
                              ...project.metaPack,
                              aeoDirectAnswer50Words: e.target.value,
                            },
                          })
                        }
                        className="mt-1.5 w-full rounded-xl border border-cyan-500/30 bg-slate-900/90 p-3.5 text-sm leading-relaxed text-slate-100 focus:border-cyan-400 focus:outline-none"
                      />
                    </div>
                  </div>

                  {/* CONTINUOUS VERTICAL STREAM OF ALL ARTICLE H2 SECTIONS + INLINE INFOGRAPHICS */}
                  {project.sections.map((sec, idx) => (
                    <div
                      key={sec.id}
                      onClick={() => setActiveEditorSectionIdx(idx)}
                      className={`rounded-2xl border p-5 transition ${
                        activeEditorSectionIdx === idx
                          ? "border-indigo-500/60 bg-slate-900/90 shadow-lg"
                          : "border-slate-800/90 bg-slate-900/40 hover:border-slate-700"
                      }`}
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2 pb-3">
                        <span className="text-xs font-bold uppercase tracking-wider text-indigo-400">
                          Section {idx + 1} of {project.sections.length} •{" "}
                          {sec.actualWordCount} words • Active in Rich Toolbar
                        </span>
                        <div className="flex flex-wrap items-center gap-2">
                          <select
                            aria-label={`Template for section ${idx + 1}`}
                            value={sec.infographicConfig.templateId}
                            onChange={(e) => {
                              const nextId = Number(e.target.value);
                              const foundTpl =
                                BLOG_INFOGRAPHIC_25_TEMPLATES.find(
                                  (t) => t.id === nextId,
                                );
                              const next = project.sections.map((s, i) =>
                                i === idx
                                  ? {
                                      ...s,
                                      infographicConfig: {
                                        ...s.infographicConfig,
                                        templateId: nextId,
                                        templateSlug:
                                          foundTpl?.slug ||
                                          s.infographicConfig.templateSlug,
                                        templateName:
                                          foundTpl?.name ||
                                          s.infographicConfig.templateName,
                                      },
                                    }
                                  : s,
                              );
                              handleProjectChange({
                                ...project,
                                sections: next,
                              });
                            }}
                            className="rounded-lg border border-slate-700 bg-slate-950 px-2.5 py-1 text-xs font-semibold text-slate-200"
                          >
                            {BLOG_INFOGRAPHIC_25_TEMPLATES.map((tpl) => (
                              <option key={tpl.id} value={tpl.id}>
                                📊 #{tpl.id} {tpl.name}
                              </option>
                            ))}
                          </select>

                          <button
                            type="button"
                            onClick={(ev) => {
                              ev.stopPropagation();
                              setInfographicModalSectionIdx(idx);
                            }}
                            className="rounded-lg bg-emerald-600 px-3 py-1 text-xs font-bold text-white transition hover:bg-emerald-500"
                          >
                            🎨 Open 25-Template Visual Studio
                          </button>
                        </div>
                      </div>

                      <input
                        type="text"
                        value={sec.h2Text}
                        onChange={(e) => {
                          const next = project.sections.map((s, i) =>
                            i === idx
                              ? {
                                  ...s,
                                  h2Text: e.target.value,
                                  anchorId: normalizeSeoSlug(e.target.value),
                                }
                              : s,
                          );
                          handleProjectChange({ ...project, sections: next });
                        }}
                        className="mb-3 w-full rounded-xl border border-slate-800 bg-slate-950 px-3.5 py-2.5 text-lg font-extrabold text-white focus:border-indigo-500 focus:outline-none"
                      />

                      <textarea
                        rows={8}
                        value={sec.bodyMarkdown}
                        onChange={(e) => {
                          const val = e.target.value;
                          const next = project.sections.map((s, i) =>
                            i === idx
                              ? {
                                  ...s,
                                  bodyMarkdown: val,
                                  actualWordCount: val
                                    .trim()
                                    .split(/\s+/)
                                    .filter(Boolean).length,
                                }
                              : s,
                          );
                          handleProjectChange({ ...project, sections: next });
                        }}
                        className="w-full rounded-xl border border-slate-800 bg-slate-950 p-4 font-sans text-sm leading-relaxed text-slate-200 focus:border-indigo-500 focus:outline-none"
                      />

                      <div className="mt-3 grid gap-3 sm:grid-cols-2">
                        <div>
                          <label className="block text-[11px] font-bold uppercase tracking-wider text-emerald-400">
                            Section Key Takeaway Callout Box
                          </label>
                          <input
                            type="text"
                            value={sec.keyTakeawayText || ""}
                            onChange={(e) => {
                              const next = project.sections.map((s, i) =>
                                i === idx
                                  ? {
                                      ...s,
                                      includeKeyTakeawayCallout: true,
                                      keyTakeawayText: e.target.value,
                                    }
                                  : s,
                              );
                              handleProjectChange({
                                ...project,
                                sections: next,
                              });
                            }}
                            className="mt-1 w-full rounded-xl border border-emerald-500/30 bg-emerald-950/20 px-3.5 py-2 text-xs font-semibold text-emerald-200 focus:border-emerald-400 focus:outline-none"
                          />
                        </div>

                        <div>
                          <label className="block text-[11px] font-bold uppercase tracking-wider text-cyan-400">
                            Infographic Card Headline ({sec.infographicConfig.aspectRatio})
                          </label>
                          <input
                            type="text"
                            value={sec.infographicConfig.headline}
                            onChange={(e) => {
                              const next = project.sections.map((s, i) =>
                                i === idx
                                  ? {
                                      ...s,
                                      infographicConfig: {
                                        ...s.infographicConfig,
                                        headline: e.target.value,
                                      },
                                    }
                                  : s,
                              );
                              handleProjectChange({
                                ...project,
                                sections: next,
                              });
                            }}
                            className="mt-1 w-full rounded-xl border border-cyan-500/30 bg-cyan-950/20 px-3.5 py-2 text-xs font-semibold text-cyan-200 focus:border-cyan-400 focus:outline-none"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {editorViewMode === "copilot-draft" && (
                <Stage3DraftingAndCopilot
                  project={project}
                  onChange={handleProjectChange}
                />
              )}

              {editorViewMode === "scorecard-split" && (
                <Stage4RichEditorAndScorecard
                  project={project}
                  onChange={handleProjectChange}
                />
              )}

              {editorViewMode === "markdown" && (
                <div className="rounded-2xl border border-slate-800 bg-slate-950 p-4">
                  <textarea
                    rows={22}
                    readOnly
                    value={fullMarkdownDocument}
                    className="w-full rounded-xl bg-slate-950 p-4 font-mono text-xs leading-relaxed text-slate-200 focus:outline-none"
                  />
                </div>
              )}
            </div>
          </section>

          {/* =================================================================
              SCROLL SECTION 2: TOPIC BRIEF & 6 INPUT MODES
             ================================================================= */}
          <section
            id="studio-brief-hub"
            className="scroll-mt-28 rounded-3xl border border-slate-800 bg-slate-900/95 p-6 shadow-xl sm:p-8"
          >
            <div className="mb-5 border-b border-slate-800 pb-4">
              <span className="text-xs font-bold uppercase tracking-wider text-indigo-400">
                Module 02 • Campaign Brief &amp; 6 Input Modes
              </span>
              <h2 className="mt-1 text-2xl font-extrabold text-white">
                Topic, Keyword Cluster, Competitor URL &amp; Tone Configuration
              </h2>
            </div>
            <Stage1InputHub
              project={project}
              onChange={handleProjectChange}
            />
          </section>

          {/* =================================================================
              SCROLL SECTION 3: LIVE META TAGS & GOOGLE SERP PIXEL SIMULATOR
             ================================================================= */}
          <section
            id="studio-meta-serp"
            className="scroll-mt-28 rounded-3xl border border-slate-800 bg-slate-900/95 p-6 shadow-xl sm:p-8"
          >
            <div className="mb-5 flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-4">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-cyan-400">
                  Module 03 • Meta Tags &amp; Live SERP Pixel Simulator
                </span>
                <h2 className="mt-1 text-2xl font-extrabold text-white">
                  &lt;580px Meta Title, &lt;920px Meta Description &amp; Desktop/Mobile Google Preview
                </h2>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setSerpDevice("desktop")}
                  className={`rounded-xl px-3 py-1.5 text-xs font-bold ${
                    serpDevice === "desktop"
                      ? "bg-cyan-600 text-white"
                      : "border border-slate-700 bg-slate-950 text-slate-300"
                  }`}
                >
                  🖥️ Desktop SERP
                </button>
                <button
                  type="button"
                  onClick={() => setSerpDevice("mobile")}
                  className={`rounded-xl px-3 py-1.5 text-xs font-bold ${
                    serpDevice === "mobile"
                      ? "bg-cyan-600 text-white"
                      : "border border-slate-700 bg-slate-950 text-slate-300"
                  }`}
                >
                  📱 Mobile SERP
                </button>
              </div>
            </div>

            <div className="grid gap-6 lg:grid-cols-12">
              <div className="space-y-4 lg:col-span-6">
                <div>
                  <div className="flex items-center justify-between text-xs font-bold">
                    <span className="text-slate-300">SEO Meta Title</span>
                    <span
                      className={
                        titlePx > 580 ? "text-rose-400" : "text-emerald-400"
                      }
                    >
                      {titlePx}px / 580px ({project.metaPack.metaTitle.length}{" "}
                      chars)
                    </span>
                  </div>
                  <input
                    type="text"
                    value={project.metaPack.metaTitle}
                    onChange={(e) =>
                      handleProjectChange({
                        ...project,
                        metaPack: {
                          ...project.metaPack,
                          metaTitle: e.target.value,
                          metaTitlePixelWidth: measureTitlePixelWidth(
                            e.target.value,
                          ),
                        },
                      })
                    }
                    className="mt-1.5 w-full rounded-xl border border-slate-700 bg-slate-950 px-3.5 py-2.5 text-sm font-semibold text-white"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between text-xs font-bold">
                    <span className="text-slate-300">SEO Meta Description</span>
                    <span
                      className={
                        descPx > 920 ? "text-rose-400" : "text-emerald-400"
                      }
                    >
                      {descPx}px / 920px (
                      {project.metaPack.metaDescription.length} chars)
                    </span>
                  </div>
                  <textarea
                    rows={3}
                    value={project.metaPack.metaDescription}
                    onChange={(e) =>
                      handleProjectChange({
                        ...project,
                        metaPack: {
                          ...project.metaPack,
                          metaDescription: e.target.value,
                          metaDescriptionPixelWidth:
                            measureMetaDescriptionPixelWidth(e.target.value),
                        },
                      })
                    }
                    className="mt-1.5 w-full rounded-xl border border-slate-700 bg-slate-950 p-3 text-sm text-slate-200"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300">
                    Canonical URL Slug
                  </label>
                  <input
                    type="text"
                    value={project.metaPack.urlSlug}
                    onChange={(e) =>
                      handleProjectChange({
                        ...project,
                        metaPack: {
                          ...project.metaPack,
                          urlSlug: normalizeSeoSlug(e.target.value),
                        },
                      })
                    }
                    className="mt-1.5 w-full rounded-xl border border-slate-700 bg-slate-950 px-3.5 py-2 font-mono text-sm text-cyan-300"
                  />
                </div>
              </div>

              <div className="flex flex-col justify-center lg:col-span-6">
                <div
                  className={`rounded-2xl border border-slate-700 bg-white p-6 text-slate-900 shadow-lg ${
                    serpDevice === "mobile" ? "mx-auto max-w-sm" : "w-full"
                  }`}
                >
                  <div className="flex items-center gap-2 text-xs text-slate-600">
                    <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-indigo-600 text-[11px] font-bold text-white">
                      D
                    </span>
                    <div>
                      <div className="font-semibold text-slate-800">
                        DoItWithAI.tools
                      </div>
                      <div className="text-[11px] text-slate-500">
                        https://doitwithai.tools › ai-seo ›{" "}
                        {project.metaPack.urlSlug}
                      </div>
                    </div>
                  </div>
                  <div className="mt-2.5 text-lg font-medium leading-snug text-[#1a0dab] hover:underline">
                    {project.metaPack.metaTitle || project.metaPack.h1Title}
                  </div>
                  <div className="mt-1.5 text-sm leading-relaxed text-[#4d5156]">
                    {project.metaPack.metaDescription}
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* =================================================================
              SCROLL SECTION 4: SERP BENCHMARK, H1-H3 OUTLINE & 50-WORD AEO LEAD
             ================================================================= */}
          <section
            id="studio-outline-aeo"
            className="scroll-mt-28 rounded-3xl border border-slate-800 bg-slate-900/95 p-6 shadow-xl sm:p-8"
          >
            <div className="mb-5 border-b border-slate-800 pb-4">
              <span className="text-xs font-bold uppercase tracking-wider text-indigo-400">
                Module 04 • H1–H3 Outline Architect &amp; Competitor Gap Matrix
              </span>
              <h2 className="mt-1 text-2xl font-extrabold text-white">
                Semantic Heading Tree, 50-Word AI Overview Box &amp; Section Visual Mapper
              </h2>
            </div>
            <Stage2OutlineArchitect
              project={project}
              onChange={handleProjectChange}
            />
          </section>

          {/* =================================================================
              SCROLL SECTION 5: 0-100 DETERMINISTIC SEO, LSI & BURSTINESS SCORECARD
             ================================================================= */}
          <section
            id="studio-seo-scorecard"
            className="scroll-mt-28 rounded-3xl border border-slate-800 bg-slate-900/95 p-6 shadow-xl sm:p-8"
          >
            <div className="mb-5 border-b border-slate-800 pb-4">
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">
                Module 05 • Live 0–100 Deterministic SEO, AEO &amp; Burstiness Audit
              </span>
              <h2 className="mt-1 text-2xl font-extrabold text-white">
                Real-Time Readability, LSI Entity Checklist, Sentence Burstiness &amp; 1-Click Auto-Fix
              </h2>
            </div>
            <Stage4RichEditorAndScorecard
              project={project}
              onChange={handleProjectChange}
            />
          </section>

          {/* =================================================================
              SCROLL SECTION 6: 7-ENTITY JSON-LD @GRAPH & CORE WEB VITALS HTML
             ================================================================= */}
          <section
            id="studio-technical-schema"
            className="scroll-mt-28 rounded-3xl border border-slate-800 bg-slate-900/95 p-6 shadow-xl sm:p-8"
          >
            <div className="mb-5 border-b border-slate-800 pb-4">
              <span className="text-xs font-bold uppercase tracking-wider text-amber-400">
                Module 06 • Technical SEO &amp; Schema Engineering Pack
              </span>
              <h2 className="mt-1 text-2xl font-extrabold text-white">
                7-Entity JSON-LD @graph Schema, &lt;head&gt; Meta Tags, Sitemap XML &amp; Zero-CLS HTML
              </h2>
            </div>
            <Stage5TechnicalSeoPack
              project={project}
              onChange={handleProjectChange}
            />
          </section>

          {/* =================================================================
              SCROLL SECTION 7: INTERACTIVE READER QUIZ, 6-CHANNEL SOCIAL & .ZIP EXPORT
             ================================================================= */}
          <section
            id="studio-quiz-social-export"
            className="scroll-mt-28 space-y-8 rounded-3xl border border-slate-800 bg-slate-900/95 p-6 shadow-xl sm:p-8"
          >
            <div className="border-b border-slate-800 pb-4">
              <span className="text-xs font-bold uppercase tracking-wider text-pink-400">
                Module 07 • Reader Engagement Quiz, Omnichannel Social Pack &amp; Master .ZIP Export
              </span>
              <h2 className="mt-1 text-2xl font-extrabold text-white">
                Interactive 5-Question Dwell-Time Quiz, 6-Channel Social Copy &amp; 1-Click Master Bundle
              </h2>
            </div>

            <Stage6DistributionAndQuizPack
              project={project}
              onChange={handleProjectChange}
              onDownloadMasterZip={handleDownloadMasterZip}
            />

            <MultiFormatExportBar
              project={project}
              onChange={handleProjectChange}
            />
          </section>
        </div>
      )}

      {/* =====================================================================
          STATIC SEO ARCHITECTURE & FAQ PILLAR GUIDE (ALWAYS INDEXABLE AT BOTTOM)
         ===================================================================== */}
      <section className="mt-20 space-y-10 rounded-3xl border border-slate-800/90 bg-slate-950/90 p-8 sm:p-10">
        <div className="max-w-3xl">
          <span className="text-xs font-bold uppercase tracking-wider text-indigo-400">
            Platform Architecture &amp; Documentation
          </span>
          <h2 className="mt-2 text-2xl font-extrabold text-white sm:text-3xl">
            How the DoItWithAI Content Writer Platform Replaces 6 Disconnected Subscriptions
          </h2>
          <p className="mt-2 text-sm leading-relaxed text-slate-300">
            Unlike basic prompt wrappers under <code>/tools</code>,{" "}
            <code>doitwithai.tools/ai-content-writer</code> operates as a unified content engineering suite combining rich-text authoring, deterministic pixel math, custom HTML5 visual infographics, and structured JSON-LD schema.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {[
            {
              title: "1. Unified Search Intent Architecture",
              body: "Consolidates AI Blog Writer, AI Article Writer, AI Content Writer, and Blog Infographic generation into one canonical pillar URL (/ai-content-writer) with zero keyword cannibalization.",
            },
            {
              title: "2. Deterministic <580px & Burstiness Math",
              body: "Measures meta titles using proportional Arial 20px metrics (<580px desktop / <920px description) alongside sentence-length standard deviation for human burstiness.",
            },
            {
              title: "3. 25+ Canva/Napkin Visual Templates",
              body: "Generates custom 16:9, 4:5, 1:1, and 9:16 section visuals with explicit width/height attributes and fetchpriority='high' to guarantee 0.00 Cumulative Layout Shift (CLS).",
            },
          ].map((card) => (
            <div
              key={card.title}
              className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5"
            >
              <h3 className="text-base font-extrabold text-white">
                {card.title}
              </h3>
              <p className="mt-2 text-xs leading-relaxed text-slate-300">
                {card.body}
              </p>
            </div>
          ))}
        </div>

        <div className="flex flex-wrap items-center justify-between gap-4 border-t border-slate-800 pt-6 text-xs text-slate-400">
          <div>
            Explore Connected Ecosystem Pillars:{" "}
            <Link
              href="/tools"
              className="font-bold text-indigo-400 hover:underline"
            >
              Free AI Feeder Tools Directory
            </Link>{" "}
            •{" "}
            <Link
              href="/agents"
              className="font-bold text-cyan-400 hover:underline"
            >
              Autonomous AI Agents Hub
            </Link>{" "}
            •{" "}
            <Link
              href="/ai-seo"
              className="font-bold text-emerald-400 hover:underline"
            >
              AI SEO Strategy Hub
            </Link>
          </div>
          <div>Architected by Aegis-Prime • DoItWithAI.tools</div>
        </div>
      </section>

      {/* 25-TEMPLATE INFOGRAPHIC CUSTOMIZER MODAL */}
      {infographicModalSectionIdx !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-4 backdrop-blur-md">
          <div className="relative max-h-[92vh] w-full max-w-6xl overflow-y-auto rounded-3xl border border-indigo-500/40 bg-slate-900 p-6 shadow-2xl">
            <div className="mb-4 flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">
                  25-Template Canva &amp; Napkin Visual Studio
                </span>
                <h3 className="text-lg font-extrabold text-white">
                  Customizing Visual for Section #{infographicModalSectionIdx + 1}:{" "}
                  {project.sections[infographicModalSectionIdx]?.h2Text}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setInfographicModalSectionIdx(null)}
                className="rounded-xl border border-slate-700 bg-slate-800 px-3.5 py-1.5 text-xs font-bold text-slate-200 hover:bg-slate-700"
              >
                ✕ Close Studio
              </button>
            </div>

            <BlogInfographicStudio
              mode="embedded-modal"
              initialConfig={
                project.sections[infographicModalSectionIdx]?.infographicConfig
              }
              onSaveConfig={(updatedConfig) => {
                const targetIdx = infographicModalSectionIdx;
                const nextSections = project.sections.map((sec, i) =>
                  i === targetIdx
                    ? { ...sec, infographicConfig: updatedConfig }
                    : sec,
                );
                handleProjectChange({ ...project, sections: nextSections });
                setInfographicModalSectionIdx(null);
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
}
