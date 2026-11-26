"use client";

import { saveBlogProject } from "@/lib/blog-writer/project-storage-db";
import { normalizeSeoSlug } from "@/lib/blog-writer/deterministic-analyzers";
import { blankProject, patchWorkspace } from "@/features/writer-workspace/model";
import { WRITER_ACTIVE_PROJECT_STORAGE_KEY } from "@/lib/shared/writer-batch-manifest";
import type { ConnectedStudioSite, SavedKeywordItem } from "./types";

function pickRelevantInternalLinks(
  keyword: string,
  site: ConnectedStudioSite | null,
  explicitTargets?: Array<{ url: string; title: string }>,
): Array<{ url: string; title: string }> {
  if (explicitTargets && explicitTargets.length > 0) {
    return explicitTargets.slice(0, 8);
  }
  const all = site?.sitemapUrls || [];
  if (all.length === 0) return [];
  const terms = keyword
    .toLowerCase()
    .split(/\s+/)
    .filter((t) => t.length > 3);

  return [...all]
    .map((entry) => {
      const hay = `${entry.title} ${entry.url}`.toLowerCase();
      let score = 0;
      for (const term of terms) {
        if (hay.includes(term)) score += 2;
      }
      return { entry, score };
    })
    .sort((a, b) => b.score - a.score)
    .slice(0, 8)
    .map((x) => x.entry);
}

export async function seedKeywordIntoWriterStudio(params: {
  keyword: string;
  suggestedTitle?: string;
  suggestedSlug?: string;
  articleAngle?: string;
  internalLinkTargets?: Array<{ url: string; title: string }>;
  customBrief?: string;
  site?: ConnectedStudioSite | null;
}): Promise<string> {
  const base = blankProject();
  const cleanKw = params.keyword.trim();
  const title =
    params.suggestedTitle?.trim() ||
    cleanKw.replace(/\b\w/g, (c) => c.toUpperCase());
  const slug =
    params.suggestedSlug?.trim() || normalizeSeoSlug(title, cleanKw);
  const site = params.site || null;

  const matchedSitemapPages = pickRelevantInternalLinks(
    cleanKw,
    site,
    params.internalLinkTargets,
  );

  const internalLinks = matchedSitemapPages.map((u, idx) => ({
    id: `studio-ilink-${idx + 1}`,
    anchorText: u.title || cleanKw,
    targetTitle: u.title || site?.name || "Related Page",
    targetUrl: u.url,
    category: "pillar-guide" as const,
  }));

  const briefLines = [
    `Write a comprehensive, helpful, search-optimized article on "${title}".`,
    `Primary Focus Keyword: ${cleanKw}`,
    ...(site
      ? [
          `Target Website: ${site.url} (${site.coreOfferSummary || site.niche})`,
        ]
      : []),
    ...(site?.audience ? [`Target Reader / ICP: ${site.audience}`] : []),
    ...(params.articleAngle
      ? [`Strategic Angle & Value Add: ${params.articleAngle}`]
      : []),
    ...(params.customBrief ? [`Additional Instructions:\n${params.customBrief}`] : []),
  ];

  const configured = patchWorkspace(
    {
      ...base,
      projectTitle: title,
      brandSiteUrl: site?.url || "",
      authorName: site?.name || "",
      rawUserBriefOrSourceText: briefLines.join("\n"),
      keywordCluster: {
        ...base.keywordCluster,
        primaryKeyword: cleanKw,
        targetAudience:
          site?.audience || "Search-driven readers and practitioners",
        toneOfVoice: "Authoritative & Human",
      },
      metaPack: {
        ...base.metaPack,
        h1Title: title,
        metaTitle: title.slice(0, 58),
        urlSlug: slug,
        canonicalUrl: site?.url
          ? `${site.url.replace(/\/$/, "")}/blog/${slug}`
          : "",
      },
      internalLinks,
    },
    {
      brand: {
        name: site?.name || "DoItWithAI Studio",
        color: site?.brandColorHex || "#5271FF",
      },
      references: matchedSitemapPages.slice(0, 5).map((u, idx) => ({
        id: `ref-site-${idx + 1}`,
        url: u.url,
        title: u.title || site?.name || "Connected Site Page",
        text: `Verified internal URL on ${site?.name || "connected site"}: ${u.title} (${u.url})`,
        importedAt: new Date().toISOString(),
      })),
    },
  );

  const saved = await saveBlogProject(configured);
  if (typeof window !== "undefined") {
    try {
      window.localStorage.setItem(
        WRITER_ACTIVE_PROJECT_STORAGE_KEY,
        saved.projectId,
      );
      window.localStorage.setItem("prism-writer-active-v1", saved.projectId);
    } catch {
      // Ignore storage mode restrictions
    }
  }
  return saved.projectId;
}

export function classifyManualKeyword(rawKeyword: string): Pick<
  SavedKeywordItem,
  "intent" | "clusterName" | "kdEstimate" | "suggestedTitle" | "suggestedSlug"
> {
  const clean = rawKeyword.replace(/\s+/g, " ").trim().toLowerCase();
  const year = new Date().getUTCFullYear();
  const titleCased = clean.replace(/\b\w/g, (c) => c.toUpperCase());

  let intent: SavedKeywordItem["intent"] = "informational";
  let clusterName = "Core Pillar & Tutorials";
  if (
    /\b(vs|versus|compare|comparison|alternative|alternatives)\b/.test(clean)
  ) {
    intent = "comparison";
    clusterName = "Vs & ROI Comparisons";
  } else if (
    /\b(best|top|review|reviews|software|platform|pricing|cost)\b/.test(clean)
  ) {
    intent = "commercial";
    clusterName = "Commercial Evaluations";
  } else if (
    /\b(template|templates|calculator|generator|tool|free|download|checklist)\b/.test(
      clean,
    )
  ) {
    intent = "transactional";
    clusterName = "Templates & Interactive Tools";
  }

  const wordCount = clean.split(" ").filter(Boolean).length;
  const kdEstimate = Math.max(
    8,
    Math.min(48, 34 - Math.min(4, wordCount - 2) * 5),
  );

  const suggestedTitle =
    intent === "comparison"
      ? `${titleCased}: Side-by-Side Breakdown (${year})`
      : intent === "commercial"
        ? `${titleCased} — Practical Buyer's Guide (${year})`
        : `${titleCased}: Step-by-Step Implementation Guide (${year})`;

  const suggestedSlug = normalizeSeoSlug(clean, clean).slice(0, 60);

  return {
    intent,
    clusterName,
    kdEstimate,
    suggestedTitle,
    suggestedSlug,
  };
}
