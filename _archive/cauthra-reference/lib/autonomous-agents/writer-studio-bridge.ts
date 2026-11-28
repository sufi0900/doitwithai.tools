"use client";

/**
 * Bridge between Autonomous Campaign Studio (`/ai-content-writer/automation`) and
 * the Flagship AI Content Writer Studio (`/ai-content-writer`).
 *
 * Converts every `AutomatedArticleJob` in a batch into a rich `CanonicalBlogProjectState`
 * (including sections, 6-layer infographics, FAQs, internal links, and social distribution packs),
 * persists them into the Content Writer's IndexedDB (`DoItWithAI_BlogStudio_DB`), and stores
 * the active multi-article batch manifest in `localStorage` so the user can switch between
 * Article 1, Article 2, ... Article N directly inside `/ai-content-writer`.
 */

import {
  DEFAULT_FLAGSHIP_BLOG_PROJECT,
  type BlogFaqPair,
  type BlogSectionNode,
  type CanonicalBlogProjectState,
} from "@/lib/blog-writer/canonical-state";
import {
  applyOneClickSeoAutoFixes,
  generateAnchorId,
  measureMetaDescriptionPixelWidth,
  measureTitlePixelWidth,
  normalizeSeoSlug,
  runFullDeterministicSeoScorecard,
} from "@/lib/blog-writer/deterministic-analyzers";
import { saveBlogProject } from "@/lib/blog-writer/project-storage-db";
import {
  buildSectionVisual,
  sectionFromText,
  withPrismLayout,
} from "@/lib/blog-infographic-studio/visual-brief";
import type {
  AutomatedArticleJob,
  ConnectedWebsiteProfile,
} from "./types";

export const WRITER_AUTOMATION_BATCH_STORAGE_KEY =
  "doitwithai_writer_automation_batch_v1";

export const WRITER_ACTIVE_PROJECT_STORAGE_KEY = "prism-writer-active-v1";

export interface WriterAutomationBatchItem {
  jobId: string;
  projectId: string;
  orderIndex: number;
  topicTitle: string;
  primaryKeyword: string;
  urlSlug: string;
  status: AutomatedArticleJob["status"];
  publishedUrl?: string;
}

export interface WriterAutomationBatchManifest {
  campaignId: string;
  campaignName: string;
  websiteId: string;
  siteName: string;
  siteUrl: string;
  publishingMode: ConnectedWebsiteProfile["publishingMode"];
  internalBuilderSlug?: string;
  activeProjectId: string;
  items: WriterAutomationBatchItem[];
  syncedAtIso: string;
}

const PALETTE_CYCLE: Array<
  BlogSectionNode["infographicConfig"]["paletteId"]
> = [
  "indigo-cyber",
  "emerald-growth",
  "amber-executive",
  "blue-trust",
  "violet-saas",
  "cyan-tech",
  "rose-editorial",
  "slate-minimal",
];

/**
 * Converts a completed `AutomatedArticleJob` into a full `CanonicalBlogProjectState`
 * compatible with the `/ai-content-writer` 4-Zone Studio Dashboard.
 */
export function convertAutomatedJobToBlogProject(
  job: AutomatedArticleJob,
  website: ConnectedWebsiteProfile,
  campaignId: string,
): CanonicalBlogProjectState {
  const nowIso = new Date().toISOString();
  const projectId = `auto-proj-${campaignId.slice(-8)}-${job.id}`;
  const slug =
    job.urlSlug || normalizeSeoSlug(job.topicTitle, job.primaryKeyword);
  const baseUrl = website.siteUrl.replace(/\/$/, "");
  const canonicalUrl =
    website.publishingMode === "internal-doitwithai-site" &&
    website.internalBuilderSlug
      ? `${baseUrl}/p/${website.internalBuilderSlug}/blog/${slug}`
      : `${baseUrl}/blog/${slug}`;

  // Extract per-section prose from compiledArticleMarkdown if available
  const rawMd = job.compiledArticleMarkdown || "";
  const sectionBlocks = rawMd.split(/^##\s+/m).slice(1);

  const nonFaqOutline = job.outlineSections.filter(
    (s) => s.archetype !== "faq",
  );
  const effectiveSections =
    nonFaqOutline.length > 0 ? nonFaqOutline : job.outlineSections;

  const builtSections: BlogSectionNode[] = effectiveSections.map((sec, idx) => {
    const sectionId = `sec-auto-${idx + 1}`;
    const rawBlock = sectionBlocks[idx] || "";
    const blockLines = rawBlock.split(/\r?\n/).slice(1).join("\n").trim();

    const bodyProse =
      blockLines.length > 60
        ? blockLines
        : [
            `${sec.summary} When implementing **${job.primaryKeyword}** for ${website.siteName}, focusing on verifiable steps and clear milestones ensures reliable outcomes.`,
            ...sec.points.map(
              (pt) => `- **${pt.badge} · ${pt.title}**: ${pt.detail}`,
            ),
          ].join("\n\n");

    const visualResult = buildSectionVisual(
      sectionFromText(sec.h2, bodyProse, sectionId),
    );
    const paletteId = PALETTE_CYCLE[idx % PALETTE_CYCLE.length]!;

    const infographicConfig = withPrismLayout(
      {
        id: `vis-${sectionId}`,
        sectionId,
        templateId: (idx % 6) + 1,
        templateSlug: "prism-editorial",
        templateName: "Editorial Atlas",
        headline: sec.h2,
        subheadline: sec.summary,
        paletteId,
        aspectRatio: "16:9",
        nodes:
          visualResult.nodes.length >= 2
            ? visualResult.nodes
            : sec.points.map((pt, pIdx) => ({
                id: `${sectionId}-n-${pIdx + 1}`,
                badge: pt.badge || String(pIdx + 1).padStart(2, "0"),
                title: pt.title,
                detail: pt.detail,
              })),
        footerSourceLabel: `${website.siteName} · Visual Summary`,
        altText: `${sec.h2} — infographic summary for ${job.primaryKeyword}`,
        renderedSvgMarkup: job.sectionInfographicSvgs?.[idx],
        visualBrief: visualResult.brief,
      },
      sec.archetype === "process"
        ? "timeline"
        : sec.archetype === "comparison"
          ? "comparison"
          : sec.archetype === "checklist"
            ? "checklist"
            : "editorial",
    );

    const words = bodyProse.split(/\s+/).filter(Boolean).length;

    return {
      id: sectionId,
      orderIndex: idx + 1,
      h2Text: sec.h2,
      anchorId: generateAnchorId(sec.h2, idx),
      targetWordCount: 360,
      actualWordCount: words,
      searchIntentRole:
        sec.archetype === "process"
          ? "step-by-step"
          : sec.archetype === "comparison"
            ? "comparison-matrix"
            : sec.archetype === "checklist"
              ? "checklist-action"
              : "definition-aeo",
      bodyMarkdown: bodyProse,
      subHeadings: sec.points.slice(0, 2).map((pt, sIdx) => ({
        id: `${sectionId}-sub-${sIdx + 1}`,
        h3Text: pt.title,
        keyPoints: [pt.detail],
        bodyMarkdown: pt.detail,
      })),
      includeComparisonTable: sec.archetype === "comparison",
      includeKeyTakeawayCallout: true,
      keyTakeawayText: sec.summary,
      infographicConfig,
    };
  });

  const faqSection = job.outlineSections.find((s) => s.archetype === "faq");
  const faqs: BlogFaqPair[] = (
    faqSection?.points && faqSection.points.length > 0
      ? faqSection.points
      : [
          {
            badge: "Q1",
            title: `What is the best way to start with ${job.primaryKeyword}?`,
            detail: `Begin with a clear baseline assessment and follow the step-by-step checklist in this guide before making advanced adjustments.`,
          },
          {
            badge: "Q2",
            title: `How often should you review your ${job.primaryKeyword} routine?`,
            detail: `Review key progress indicators every two to four weeks so you can refine what works best for your specific situation.`,
          },
        ]
  ).map((pt, idx) => ({
    id: `faq-auto-${idx + 1}`,
    question: /\?$/.test(pt.title.trim()) ? pt.title.trim() : `${pt.title.trim()}?`,
    answer: pt.detail,
  }));

  const linkedinVar = job.arcadsVariations.find((v) => v.channel === "linkedin");
  const twitterVar = job.arcadsVariations.find((v) => v.channel === "x-twitter");

  const projectDraft: CanonicalBlogProjectState = {
    ...DEFAULT_FLAGSHIP_BLOG_PROJECT,
    projectId,
    projectTitle: job.topicTitle,
    createdAtIso: nowIso,
    updatedAtIso: nowIso,
    activeStage: 4,
    workflowMode: "express-one-click",
    inputMode: "keyword-cluster",
    rawUserBriefOrSourceText: `Topic: ${job.topicTitle}\nPrimary Keyword: ${job.primaryKeyword}\nWebsite: ${website.siteUrl}\nNiche: ${website.primaryNiche}`,
    customUserInstructions: `Tailored for ${website.siteName} (${website.primaryNiche}).`,
    authorName: website.siteName,
    authorRoleAndCredentials: `Editorial Team at ${website.siteName}`,
    brandSiteUrl: website.siteUrl,
    keywordCluster: {
      ...DEFAULT_FLAGSHIP_BLOG_PROJECT.keywordCluster,
      primaryKeyword: job.primaryKeyword,
      secondaryKeywords: job.secondaryKeywords || [],
      lsiEntities: [
        job.primaryKeyword,
        ...job.outlineSections.flatMap((s) => s.points.map((p) => p.title.toLowerCase())),
      ].slice(0, 8),
      questionKeywords: faqs.map((f) => f.question),
      targetAudience: `Readers and customers of ${website.siteName} interested in ${website.primaryNiche}`,
    },
    metaPack: {
      h1Title: job.topicTitle,
      metaTitle: job.metaTitle || job.topicTitle.slice(0, 58),
      metaTitlePixelWidth: measureTitlePixelWidth(
        job.metaTitle || job.topicTitle.slice(0, 58),
      ),
      metaDescription: job.metaDescription,
      metaDescriptionPixelWidth: measureMetaDescriptionPixelWidth(
        job.metaDescription,
      ),
      urlSlug: slug,
      canonicalUrl,
      aeoDirectAnswer50Words: job.aeoDirectAnswer50Words,
      tldrBullets: job.outlineSections.map((s) => `${s.h2}: ${s.summary}`),
      titleVariations: [
        {
          title: job.metaTitle || job.topicTitle.slice(0, 58),
          pixelWidth: measureTitlePixelWidth(
            job.metaTitle || job.topicTitle.slice(0, 58),
          ),
          ctrScore: 96,
          angle: "Primary Search Intent Match",
        },
        {
          title: `${job.topicTitle.slice(0, 44)} (2026 Checklist)`,
          pixelWidth: measureTitlePixelWidth(
            `${job.topicTitle.slice(0, 44)} (2026 Checklist)`,
          ),
          ctrScore: 93,
          angle: "Actionable Checklist Hook",
        },
      ],
    },
    sections: builtSections,
    faqs,
    internalLinks: website.installedTools.map((t, idx) => ({
      id: `ilink-auto-${idx + 1}`,
      anchorText: t.title,
      targetTitle: t.title,
      targetUrl: t.url,
      category: "tool",
      insertedInSectionId: builtSections[idx % Math.max(1, builtSections.length)]?.id,
    })),
    distributionPack: {
      ...DEFAULT_FLAGSHIP_BLOG_PROJECT.distributionPack,
      linkedinLongFormPost: linkedinVar
        ? `${linkedinVar.hookLine}\n\n${linkedinVar.bodyCopy}\n\n${linkedinVar.ctaLine}`
        : DEFAULT_FLAGSHIP_BLOG_PROJECT.distributionPack.linkedinLongFormPost,
      twitterThreadPosts: twitterVar
        ? [twitterVar.hookLine, ...twitterVar.bodyCopy.split("\n\n"), twitterVar.ctaLine]
        : DEFAULT_FLAGSHIP_BLOG_PROJECT.distributionPack.twitterThreadPosts,
    },
    writerWorkspace: {
      version: 1,
      studioUnlocked: true,
      references: [],
      targetWords: 1600,
      language: "English",
      metaDescriptions: [job.metaDescription],
      serpTitles: [job.metaTitle, job.topicTitle.slice(0, 58)],
      quickAnswerBox: job.aeoDirectAnswer50Words,
      run: {
        status: "done",
        inputHash: "",
        completed: builtSections.map((s) => s.id),
        stage: "social_video",
        stageLabel: "Imported from Autonomous Multi-Article Studio",
      },
      brand: {
        name: website.siteName,
        color: website.brandPrimaryHex || "#5271FF",
      },
      social: {},
      visualRevisions: {},
    },
  };

  const autoFixed = applyOneClickSeoAutoFixes(projectDraft);
  autoFixed.scorecard = runFullDeterministicSeoScorecard(autoFixed);
  return autoFixed;
}

/**
 * Saves a batch of automated article jobs into the Content Writer Studio's IndexedDB
 * and records the batch manifest in `localStorage` so `/ai-content-writer` renders
 * a Multi-Article Switcher Bar at the top of the workspace.
 */
export async function syncAutomatedBatchToWriterStudio(params: {
  campaignId: string;
  campaignName: string;
  website: ConnectedWebsiteProfile;
  jobs: AutomatedArticleJob[];
  selectedJobId?: string;
}): Promise<WriterAutomationBatchManifest> {
  const { campaignId, campaignName, website, jobs, selectedJobId } = params;
  const items: WriterAutomationBatchItem[] = [];
  let activeProjectId = "";

  for (let i = 0; i < jobs.length; i++) {
    const job = jobs[i]!;
    const project = convertAutomatedJobToBlogProject(job, website, campaignId);
    const saved = await saveBlogProject(project);
    items.push({
      jobId: job.id,
      projectId: saved.projectId,
      orderIndex: i + 1,
      topicTitle: job.topicTitle,
      primaryKeyword: job.primaryKeyword,
      urlSlug: job.urlSlug,
      status: job.status,
      publishedUrl: job.publishedUrl,
    });
    if (job.id === selectedJobId || (!activeProjectId && i === 0)) {
      activeProjectId = saved.projectId;
    }
  }

  if (!activeProjectId && items[0]) {
    activeProjectId = items[0].projectId;
  }

  const manifest: WriterAutomationBatchManifest = {
    campaignId,
    campaignName,
    websiteId: website.id,
    siteName: website.siteName,
    siteUrl: website.siteUrl,
    publishingMode: website.publishingMode,
    internalBuilderSlug: website.internalBuilderSlug,
    activeProjectId,
    items,
    syncedAtIso: new Date().toISOString(),
  };

  if (typeof window !== "undefined") {
    try {
      window.localStorage.setItem(
        WRITER_AUTOMATION_BATCH_STORAGE_KEY,
        JSON.stringify(manifest),
      );
      if (activeProjectId) {
        window.localStorage.setItem(
          WRITER_ACTIVE_PROJECT_STORAGE_KEY,
          activeProjectId,
        );
      }
    } catch {
      // Ignore storage errors in private mode
    }
  }

  return manifest;
}

export function loadWriterAutomationBatchManifest(): WriterAutomationBatchManifest | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(WRITER_AUTOMATION_BATCH_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as WriterAutomationBatchManifest;
    if (!parsed || !Array.isArray(parsed.items) || parsed.items.length === 0) {
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
}

export function clearWriterAutomationBatchManifest(): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.removeItem(WRITER_AUTOMATION_BATCH_STORAGE_KEY);
  } catch {}
}
