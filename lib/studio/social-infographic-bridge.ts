/**
 * Studio Social & Email Infographic Bridge
 * ----------------------------------------
 * Unified bridge connecting Content Writer articles AND standalone keyword/prompt
 * campaigns to the 25-template Blog Section Infographic engine (`canvas-renderer.ts`)
 * and platform-native copy/script generators (`assets.tsx`).
 */

import type {
  BlogInfographicConfig,
  BlogInfographicNodeItem,
} from "@/lib/blog-writer/canonical-state";
import { loadBlogProjectById } from "@/lib/blog-writer/project-storage-db";
import { BLOG_INFOGRAPHIC_25_TEMPLATES } from "@/lib/blog-infographic-studio/templates";
import { BLOG_INFOGRAPHIC_PALETTES } from "@/lib/blog-infographic-studio/palettes";
import { blankProject, patchWorkspace } from "@/features/writer-workspace/model";
import type { Project } from "@/features/writer-workspace/types";
import type { SocialVisualChannel } from "@/features/writer-workspace/adapters/socialVisualRegistry";
import {
  filterArticlesForSite,
  loadStudioArticleLibrary,
  type StudioArticleStatus,
} from "./article-library";
import type { ConnectedStudioSite } from "./types";

export type StudioSocialChannelId = SocialVisualChannel;

export interface StudioSocialChannelMeta {
  id: StudioSocialChannelId;
  label: string;
  shortLabel: string;
  studioTitle: string;
  subtitle: string;
  aspectLabel: string;
  defaultTemplateId: number;
  defaultPaletteId: BlogInfographicConfig["paletteId"];
  supportsCarousel?: boolean;
  isVideo?: boolean;
}

export const STUDIO_SOCIAL_CHANNELS: StudioSocialChannelMeta[] = [
  {
    id: "Instagram",
    label: "Instagram",
    shortLabel: "Instagram",
    studioTitle: "Instagram Visual & Carousel Studio",
    subtitle: "High-craft 4:5 infographic carousels, step visuals, and saveable feed cards.",
    aspectLabel: "1080 × 1350 (4:5)",
    defaultTemplateId: 11,
    defaultPaletteId: "indigo-cyber",
    supportsCarousel: true,
  },
  {
    id: "Facebook",
    label: "Facebook",
    shortLabel: "Facebook",
    studioTitle: "Facebook Visual & Post Studio",
    subtitle: "Scroll-stopping landscape infographics, discussion hooks, and shareable cards.",
    aspectLabel: "1600 × 900 (16:9)",
    defaultTemplateId: 1,
    defaultPaletteId: "blue-trust",
  },
  {
    id: "LinkedIn",
    label: "LinkedIn",
    shortLabel: "LinkedIn",
    studioTitle: "LinkedIn Authority & Carousel Studio",
    subtitle: "Executive frameworks, comparison boards, and B2B takeaway graphics.",
    aspectLabel: "1080 × 1350 (4:5)",
    defaultTemplateId: 3,
    defaultPaletteId: "slate-minimal",
    supportsCarousel: true,
  },
  {
    id: "X",
    label: "X (Twitter)",
    shortLabel: "X",
    studioTitle: "X Thread & Visual Card Studio",
    subtitle: "Punchy thread breakdowns paired with widescreen data & comparison graphics.",
    aspectLabel: "1600 × 900 (16:9)",
    defaultTemplateId: 6,
    defaultPaletteId: "cyan-tech",
    supportsCarousel: true,
  },
  {
    id: "Pinterest",
    label: "Pinterest",
    shortLabel: "Pinterest",
    studioTitle: "Pinterest Tall Infographic Pin Studio",
    subtitle: "Vertical 9:16 step-by-step roadmaps, checklists, and evergreen resource pins.",
    aspectLabel: "1080 × 1920 (9:16)",
    defaultTemplateId: 2,
    defaultPaletteId: "rose-editorial",
  },
  {
    id: "YouTube",
    label: "YouTube & Video",
    shortLabel: "YouTube",
    studioTitle: "YouTube Thumbnail & Video Script Studio",
    subtitle: "Widescreen video cover graphics alongside Short/Reel and Long-Form scripts.",
    aspectLabel: "1600 × 900 (16:9)",
    defaultTemplateId: 25,
    defaultPaletteId: "amber-executive",
    isVideo: true,
  },
  {
    id: "Threads",
    label: "Threads",
    shortLabel: "Threads",
    studioTitle: "Threads Story & Takeaway Studio",
    subtitle: "Conversational takeaway hooks with portrait infographic visuals.",
    aspectLabel: "1080 × 1350 (4:5)",
    defaultTemplateId: 12,
    defaultPaletteId: "violet-saas",
  },
  {
    id: "Reddit",
    label: "Reddit",
    shortLabel: "Reddit",
    studioTitle: "Reddit TL;DR Breakdown Studio",
    subtitle: "Zero-fluff community breakdowns paired with clear do's/don'ts visuals.",
    aspectLabel: "1600 × 900 (16:9)",
    defaultTemplateId: 10,
    defaultPaletteId: "emerald-growth",
  },
  {
    id: "Quora",
    label: "Quora",
    shortLabel: "Quora",
    studioTitle: "Quora Expert Answer Studio",
    subtitle: "Structured comparison explanations with visual reference cards.",
    aspectLabel: "1600 × 900 (16:9)",
    defaultTemplateId: 23,
    defaultPaletteId: "slate-minimal",
  },
];

export function getStudioSocialChannelMeta(
  channelId: string | null | undefined,
): StudioSocialChannelMeta {
  const normalized = (channelId || "").trim().toLowerCase();
  return (
    STUDIO_SOCIAL_CHANNELS.find((c) => c.id.toLowerCase() === normalized) ||
    STUDIO_SOCIAL_CHANNELS[0]!
  );
}

export interface SocialInfographicStylePreset {
  id: string;
  label: string;
  description: string;
  landscapeTemplateId: number;
  portraitTemplateId: number;
  defaultPaletteId: BlogInfographicConfig["paletteId"];
}

export const SOCIAL_INFOGRAPHIC_STYLES: SocialInfographicStylePreset[] = [
  {
    id: "roadmap",
    label: "Process Blueprint",
    description: "Step-by-step workflow cards with clean connectors",
    landscapeTemplateId: 1,
    portraitTemplateId: 2,
    defaultPaletteId: "indigo-cyber",
  },
  {
    id: "bento",
    label: "Bento Highlight Grid",
    description: "4-tile modern executive card grid",
    landscapeTemplateId: 11,
    portraitTemplateId: 11,
    defaultPaletteId: "blue-trust",
  },
  {
    id: "tldr",
    label: "TL;DR Summary Card",
    description: "High-scannability takeaway stack",
    landscapeTemplateId: 25,
    portraitTemplateId: 21,
    defaultPaletteId: "slate-minimal",
  },
  {
    id: "checklist",
    label: "Action Checklist",
    description: "Structured checklist & best-practice board",
    landscapeTemplateId: 10,
    portraitTemplateId: 20,
    defaultPaletteId: "emerald-growth",
  },
];

export const STUDIO_STANDALONE_CAMPAIGNS_KEY =
  "doitwithai_studio_standalone_campaigns_v1";
export const STUDIO_SOCIAL_STATUS_KEY = "doitwithai_studio_social_status_v1";
export const STUDIO_CAMPAIGNS_CHANGED_EVENT =
  "doitwithai-studio-campaigns-changed";

export type ChannelAssetStatus = "ready" | "customized" | "posted";

export interface StudioStandaloneCampaign {
  id: string;
  siteId: string;
  keyword: string;
  title: string;
  angle: string;
  points: Array<{ title: string; detail: string; metricValue?: string }>;
  createdAtIso: string;
  updatedAtIso: string;
}

export interface StudioSocialCampaignSource {
  id: string;
  kind: "article" | "standalone";
  title: string;
  primaryKeyword: string;
  siteUrl: string;
  articleStatus: StudioArticleStatus | "standalone";
  updatedAtIso: string;
  wordCount: number;
  project: Project;
}

function clampText(raw: string, maxLen: number): string {
  const clean = (raw || "")
    .replace(/\*\*|__|`|#{1,6}\s*/g, "")
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
    .replace(/\s+/g, " ")
    .trim();
  if (clean.length <= maxLen) return clean;
  return `${clean.slice(0, maxLen - 1).replace(/\s+\S*$/, "")}…`;
}

function firstSentence(raw: string, maxLen = 100): string {
  const cleaned = clampText(raw, 240);
  if (!cleaned) return "";
  const match = cleaned.match(/^[^.!?]{16,130}[.!?]/);
  return clampText(match ? match[0] : cleaned, maxLen);
}

/**
 * Extracts 4–5 crisp infographic nodes from a writer Project (article or standalone
 * campaign) so every channel gets genuine content-backed infographic artwork.
 */
export function extractInfographicNodesFromProject(
  project: Project,
): BlogInfographicNodeItem[] {
  const nodes: BlogInfographicNodeItem[] = [];

  for (let i = 0; i < (project.sections || []).length && nodes.length < 5; i++) {
    const s = project.sections[i]!;
    if (s.infographicConfig?.nodes?.length && nodes.length === 0 && project.sections.length === 1) {
      return s.infographicConfig.nodes.slice(0, 5).map((n, idx) => ({
        id: n.id || `social-node-${idx + 1}`,
        badge: n.badge || String(idx + 1).padStart(2, "0"),
        title: clampText(n.title || `Key Point ${idx + 1}`, 38),
        detail: clampText(n.detail || "Actionable insight tailored to your audience.", 105),
        metricValue: n.metricValue || String(idx + 1),
      }));
    }

    const heading = clampText(s.h2Text || "", 38);
    const bodyText =
      s.bodyMarkdown?.trim() ||
      s.subHeadings?.find((h) => h.bodyMarkdown?.trim())?.bodyMarkdown ||
      "";
    const detail =
      firstSentence(bodyText, 102) ||
      clampText(
        s.keyTakeawayText ||
          `Essential strategy step for ${project.keywordCluster?.primaryKeyword || "this topic"}.`,
        102,
      );

    if (heading) {
      nodes.push({
        id: `social-sec-${i + 1}`,
        badge: String(nodes.length + 1).padStart(2, "0"),
        title: heading,
        detail,
        metricValue: String(nodes.length + 1),
      });
    }
  }

  if (nodes.length >= 3) return nodes;

  const topic =
    clampText(
      project.keywordCluster?.primaryKeyword ||
        project.metaPack?.h1Title ||
        project.projectTitle ||
        "SEO Content Strategy",
      42,
    ) || "SEO Content Strategy";

  const fallbackNodes: BlogInfographicNodeItem[] = [
    {
      id: "social-fb-1",
      badge: "01",
      title: "Clarify Search Intent",
      detail: clampText(
        `Match ${topic} directly to what buyers or practitioners need first.`,
        100,
      ),
      metricValue: "1",
    },
    {
      id: "social-fb-2",
      badge: "02",
      title: "Structure Clear Proof",
      detail: clampText(
        `Lead with verified workflows, examples, and step-by-step checklists.`,
        100,
      ),
      metricValue: "2",
    },
    {
      id: "social-fb-3",
      badge: "03",
      title: "Format for Scannability",
      detail: clampText(
        `Use crisp headings, visual callouts, and concise 50-word direct answers.`,
        100,
      ),
      metricValue: "3",
    },
    {
      id: "social-fb-4",
      badge: "04",
      title: "Distribute & Repurpose",
      detail: clampText(
        `Adapt core takeaways across social visuals, video scripts, and newsletters.`,
        100,
      ),
      metricValue: "4",
    },
  ];

  return nodes.length > 0
    ? [...nodes, ...fallbackNodes.slice(nodes.length)].slice(0, 4)
    : fallbackNodes;
}

/**
 * Builds a complete `BlogInfographicConfig` compatible with `buildInfographicScene`
 * for any social channel, email newsletter header, or infographic preset style.
 */
export function buildSocialInfographicConfigFromProject(
  project: Project,
  options: {
    channel?: string;
    templateId?: number;
    paletteId?: BlogInfographicConfig["paletteId"];
    customHeadline?: string;
    customSubheadline?: string;
    customNodes?: BlogInfographicNodeItem[];
    brandName?: string;
    brandColor?: string;
  } = {},
): BlogInfographicConfig {
  const channelMeta = getStudioSocialChannelMeta(options.channel);
  const templateId = options.templateId ?? channelMeta.defaultTemplateId;
  const tplSpec =
    BLOG_INFOGRAPHIC_25_TEMPLATES.find((t) => t.id === templateId) ||
    BLOG_INFOGRAPHIC_25_TEMPLATES[0]!;
  const paletteId =
    options.paletteId && BLOG_INFOGRAPHIC_PALETTES[options.paletteId]
      ? options.paletteId
      : channelMeta.defaultPaletteId;

  const rawTitle =
    options.customHeadline?.trim() ||
    project.metaPack?.h1Title?.trim() ||
    project.projectTitle?.trim() ||
    project.keywordCluster?.primaryKeyword?.trim() ||
    "Key Takeaways";
  const headline = clampText(rawTitle, 58);

  const rawSub =
    options.customSubheadline?.trim() ||
    project.metaPack?.aeoDirectAnswer50Words?.trim() ||
    project.metaPack?.metaDescription?.trim() ||
    project.keywordCluster?.primaryKeyword?.trim() ||
    `Practical breakdown for ${channelMeta.label}`;
  const subheadline = clampText(firstSentence(rawSub, 88) || rawSub, 88);

  const nodes = (
    options.customNodes && options.customNodes.length > 0
      ? options.customNodes
      : extractInfographicNodesFromProject(project)
  ).slice(0, 6);

  const siteHost = project.brandSiteUrl
    ? project.brandSiteUrl.replace(/^https?:\/\//i, "").replace(/\/.*$/, "")
    : "";
  const brandLabel =
    options.brandName ||
    project.authorName ||
    siteHost ||
    "DoItWithAI Studio";

  const isVerticalChannel = ["Instagram", "LinkedIn", "Pinterest", "Threads"].includes(
    channelMeta.id,
  );
  const aspectRatio: BlogInfographicConfig["aspectRatio"] =
    channelMeta.id === "Pinterest"
      ? "9:16"
      : isVerticalChannel
        ? "4:5"
        : "16:9";

  return {
    id: `social-infog-${project.projectId}-${channelMeta.id}-${templateId}`,
    sectionId: `social-${channelMeta.id.toLowerCase()}`,
    templateId: tplSpec.id,
    templateSlug: tplSpec.slug,
    templateName: tplSpec.name,
    headline,
    subheadline,
    paletteId,
    aspectRatio,
    nodes,
    footerSourceLabel: `${brandLabel}${siteHost && brandLabel !== siteHost ? ` · ${siteHost}` : ""}`,
    altText: `${headline} — infographic summary for ${channelMeta.label}`,
    brand: {
      logoDataUrl: project.writerWorkspace?.brand?.logo,
      illustration: "paper-steps",
    },
  };
}

/**
 * Generates structured sections and text so a standalone keyword/prompt campaign
 * renders rich social posts, 4 infographic styles, video scripts, and newsletters
 * without going through the full long-form Content Writer first.
 */
export function buildStandaloneCampaignProject(
  params: {
    id?: string;
    keyword: string;
    title?: string;
    angle?: string;
    points?: Array<{ title: string; detail: string; metricValue?: string }>;
    site?: ConnectedStudioSite | null;
  },
): Project {
  const base = blankProject();
  const cleanKw = params.keyword.trim() || "AI SEO workflow";
  const titleCasedKw = cleanKw.replace(/\b\w/g, (c) => c.toUpperCase());
  const title = (params.title || "").trim() || `${titleCasedKw}: Practical Playbook`;
  const angle =
    (params.angle || "").trim() ||
    `Practical, high-impact breakdown of ${cleanKw} built for fast execution and clear results.`;
  const projectId = params.id || `standalone-${Date.now()}`;
  const site = params.site || null;

  const defaultPoints = [
    {
      title: `Audit & Baseline ${titleCasedKw}`,
      detail: `Identify current gaps, baseline metrics, and top opportunities around ${cleanKw}.`,
      metricValue: "1",
    },
    {
      title: "Prioritize High-Impact Actions",
      detail: `Focus first on changes with clearest audience value and lowest friction.`,
      metricValue: "2",
    },
    {
      title: "Ship Consistent Formats",
      detail: `Pair concise visual breakdowns with concrete examples your audience can apply today.`,
      metricValue: "3",
    },
    {
      title: "Measure & Iterate",
      detail: `Track saves, replies, and organic clicks weekly to double down on winning angles.`,
      metricValue: "4",
    },
  ];

  const sourcePoints =
    params.points && params.points.length >= 2 ? params.points : defaultPoints;

  const nowIso = new Date().toISOString();
  const sections = sourcePoints.slice(0, 5).map((pt, idx) => ({
    ...base.sections[0]!,
    id: `${projectId}-sec-${idx + 1}`,
    orderIndex: idx,
    h2Text: pt.title,
    anchorId: `step-${idx + 1}`,
    targetWordCount: 150,
    actualWordCount: pt.detail.split(/\s+/).length,
    searchIntentRole: "step-by-step" as const,
    bodyMarkdown: pt.detail,
    subHeadings: [],
    includeComparisonTable: false,
    includeKeyTakeawayCallout: false,
    infographicConfig: {
      id: `cfg-${projectId}-${idx + 1}`,
      sectionId: `${projectId}-sec-${idx + 1}`,
      templateId: 1,
      templateSlug: "horizontal-step-pipeline",
      templateName: "Connected Process Steps",
      headline: title,
      subheadline: angle,
      paletteId: "indigo-cyber" as const,
      aspectRatio: "16:9" as const,
      nodes: sourcePoints.map((n, nIdx) => ({
        id: `n-${nIdx + 1}`,
        badge: String(nIdx + 1).padStart(2, "0"),
        title: clampText(n.title, 38),
        detail: clampText(n.detail, 102),
        metricValue: n.metricValue || String(nIdx + 1),
      })),
      footerSourceLabel: site?.name || "DoItWithAI Studio",
      altText: `${title} visual breakdown`,
    },
  }));

  const docNodes = [
    {
      type: "heading",
      attrs: { level: 1 },
      content: [{ type: "text", text: title }],
    },
    {
      type: "paragraph",
      content: [{ type: "text", text: angle }],
    },
    ...sections.flatMap((sec) => [
      {
        type: "heading",
        attrs: { level: 2 },
        content: [{ type: "text", text: sec.h2Text }],
      },
      {
        type: "paragraph",
        content: [{ type: "text", text: sec.bodyMarkdown }],
      },
    ]),
  ];

  const seeded: Project = {
    ...base,
    projectId,
    projectTitle: title,
    brandSiteUrl: site?.url || "",
    authorName: site?.name || "Editorial Team",
    updatedAtIso: nowIso,
    keywordCluster: {
      ...base.keywordCluster,
      primaryKeyword: cleanKw,
      targetAudience: site?.audience || "Practitioners and decision-makers",
    },
    metaPack: {
      ...base.metaPack,
      h1Title: title,
      metaTitle: title.slice(0, 60),
      metaDescription: angle.slice(0, 155),
      aeoDirectAnswer50Words: angle,
      canonicalUrl: site?.url || "",
    },
    sections,
  };

  return patchWorkspace(seeded, {
    brand: {
      name: site?.name || "DoItWithAI Studio",
      color: site?.brandColorHex || "#5271FF",
    },
    document: { type: "doc", content: docNodes },
  });
}

export function loadStandaloneCampaigns(
  siteId?: string,
): StudioStandaloneCampaign[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(STUDIO_STANDALONE_CAMPAIGNS_KEY);
    const parsed: unknown = raw ? JSON.parse(raw) : [];
    if (!Array.isArray(parsed)) return [];
    const list = parsed.filter(
      (item): item is StudioStandaloneCampaign =>
        Boolean(item && typeof item === "object" && "id" in item && "keyword" in item),
    );
    return siteId
      ? list.filter((c) => !c.siteId || c.siteId === "general" || c.siteId === siteId)
      : list;
  } catch {
    return [];
  }
}

export function saveStandaloneCampaign(
  campaign: StudioStandaloneCampaign,
): StudioStandaloneCampaign[] {
  if (typeof window === "undefined") return [];
  const all = loadStandaloneCampaigns().filter((c) => c.id !== campaign.id);
  const next = [campaign, ...all].slice(0, 100);
  try {
    window.localStorage.setItem(
      STUDIO_STANDALONE_CAMPAIGNS_KEY,
      JSON.stringify(next),
    );
    window.dispatchEvent(new CustomEvent(STUDIO_CAMPAIGNS_CHANGED_EVENT));
  } catch {
    /* ignore */
  }
  return next;
}

export function deleteStandaloneCampaign(id: string): void {
  if (typeof window === "undefined") return;
  const next = loadStandaloneCampaigns().filter((c) => c.id !== id);
  try {
    window.localStorage.setItem(
      STUDIO_STANDALONE_CAMPAIGNS_KEY,
      JSON.stringify(next),
    );
    window.dispatchEvent(new CustomEvent(STUDIO_CAMPAIGNS_CHANGED_EVENT));
  } catch {
    /* ignore */
  }
}

export function getChannelStatusMap(): Record<string, ChannelAssetStatus> {
  if (typeof window === "undefined") return {};
  try {
    const raw = window.localStorage.getItem(STUDIO_SOCIAL_STATUS_KEY);
    const parsed: unknown = raw ? JSON.parse(raw) : {};
    return parsed && typeof parsed === "object"
      ? (parsed as Record<string, ChannelAssetStatus>)
      : {};
  } catch {
    return {};
  }
}

export function channelStatusKey(sourceId: string, channelKey: string): string {
  return `${sourceId}::${channelKey.toLowerCase()}`;
}

export function setChannelAssetStatus(
  sourceId: string,
  channelKey: string,
  status: ChannelAssetStatus,
): Record<string, ChannelAssetStatus> {
  const current = getChannelStatusMap();
  const next = {
    ...current,
    [channelStatusKey(sourceId, channelKey)]: status,
  };
  if (typeof window !== "undefined") {
    try {
      window.localStorage.setItem(STUDIO_SOCIAL_STATUS_KEY, JSON.stringify(next));
    } catch {
      /* ignore */
    }
  }
  return next;
}

/**
 * Loads every article project + standalone keyword campaign for the connected website
 * so Instagram, Facebook, LinkedIn, X, Pinterest, YouTube, and Email studios stay synced.
 */
export async function loadStudioCampaignSources(
  site: ConnectedStudioSite | null,
): Promise<StudioSocialCampaignSource[]> {
  const articleEntries = filterArticlesForSite(
    await loadStudioArticleLibrary(),
    site,
  );

  const articleSources = await Promise.all(
    articleEntries.slice(0, 60).map(async (entry): Promise<StudioSocialCampaignSource | null> => {
      try {
        const project = await loadBlogProjectById(entry.projectId);
        return {
          id: entry.projectId,
          kind: "article",
          title: entry.title,
          primaryKeyword: entry.primaryKeyword,
          siteUrl: entry.siteUrl,
          articleStatus: entry.status,
          updatedAtIso: entry.updatedAtIso,
          wordCount: entry.wordCount,
          project,
        };
      } catch {
        return null;
      }
    }),
  );

  const standaloneCampaigns = loadStandaloneCampaigns(site?.id).map(
    (c): StudioSocialCampaignSource => {
      const proj = buildStandaloneCampaignProject({
        id: c.id,
        keyword: c.keyword,
        title: c.title,
        angle: c.angle,
        points: c.points,
        site,
      });
      return {
        id: c.id,
        kind: "standalone",
        title: c.title,
        primaryKeyword: c.keyword,
        siteUrl: site?.url || "",
        articleStatus: "standalone",
        updatedAtIso: c.updatedAtIso,
        wordCount: c.points.reduce(
          (sum, pt) => sum + pt.detail.split(/\s+/).length,
          c.angle.split(/\s+/).length,
        ),
        project: proj,
      };
    },
  );

  return [
    ...articleSources.filter((x): x is StudioSocialCampaignSource => Boolean(x)),
    ...standaloneCampaigns,
  ].sort((a, b) => (b.updatedAtIso || "").localeCompare(a.updatedAtIso || ""));
}
