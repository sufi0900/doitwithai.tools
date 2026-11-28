import { NextResponse } from "next/server";
import {
  ALL_LIVE_TOOLS,
  ALL_PUBLISHED_ARTICLES,
  ALL_SITE_PROMPTS,
} from "@/features/do-it-ai/server-knowledge";

export const dynamic = "force-dynamic";

function mapArticleToTrack(category: string, tags: string[]): string {
  const hay = `${category} ${tags.join(" ")}`.toLowerCase();
  if (/keyword|cluster|topical|intent/.test(hay))
    return "Track 1 · Keyword & Topical Authority";
  if (/schema|technical|crawl|robot|speed|vital|index/.test(hay))
    return "Track 4 · Technical SEO & Schema";
  if (/backlink|link|outreach|pr|authority/.test(hay))
    return "Track 5 · Off-Page & Digital PR";
  if (/on-page|meta|heading|readability|internal/.test(hay))
    return "Track 3 · On-Page & Internal Linking";
  return "Track 2 · AI Content Writing & GEO";
}

function formatSlugFallbackName(slug: string): string {
  return slug
    .replace(/-/g, " ")
    .replace(/\b(ai|seo|geo|aeo|url|urls|faq|html|pdf|utm|nap|cta)\b/gi, (m) =>
      m.toUpperCase(),
    )
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const q = (url.searchParams.get("q") || "").trim().toLowerCase();
  const category = (url.searchParams.get("category") || "all").trim();
  const limit = Math.min(
    120,
    Math.max(12, Number(url.searchParams.get("limit") || 60)),
  );

  const toolNameBySlug = new Map(ALL_LIVE_TOOLS.map((t) => [t.slug, t.name]));

  const promptCategories = Array.from(
    new Set(ALL_SITE_PROMPTS.map((p) => p.category)),
  );
  const toolCategories = Array.from(
    new Set(ALL_LIVE_TOOLS.map((t) => t.category)),
  );

  const mappedPlaybooks = ALL_PUBLISHED_ARTICLES.map((art) => ({
    slug: art.slug,
    title: art.title,
    url: art.url,
    summary: art.summary,
    track: mapArticleToTrack(art.category, art.topicTags),
    topicTags: art.topicTags.slice(0, 4),
    relatedToolSlugs: art.relatedToolSlugs.slice(0, 3),
    relatedTools: art.relatedToolSlugs.slice(0, 3).map((slug) => ({
      slug,
      name: toolNameBySlug.get(slug) || formatSlugFallbackName(slug),
    })),
  }));

  const playbookTracks = Array.from(
    new Set(mappedPlaybooks.map((p) => p.track)),
  ).sort();

  const filteredPrompts = ALL_SITE_PROMPTS.filter((p) => {
    if (
      category !== "all" &&
      promptCategories.includes(category) &&
      p.category !== category
    ) {
      return false;
    }
    if (!q) return true;
    return (
      p.title.toLowerCase().includes(q) ||
      p.prompt.toLowerCase().includes(q) ||
      p.category.toLowerCase().includes(q)
    );
  }).slice(0, limit);

  const filteredTools = ALL_LIVE_TOOLS.filter((t) => {
    if (
      category !== "all" &&
      (toolCategories.includes(category) || t.categories.includes(category)) &&
      t.category !== category &&
      !t.categories.includes(category)
    ) {
      return false;
    }
    if (!q) return true;
    return (
      t.name.toLowerCase().includes(q) ||
      t.shortDescription.toLowerCase().includes(q) ||
      t.tags.some((tag) => tag.toLowerCase().includes(q))
    );
  }).slice(0, 150);

  const playbooks = mappedPlaybooks
    .filter((pb) => {
      if (
        category !== "all" &&
        playbookTracks.includes(category) &&
        pb.track !== category
      ) {
        return false;
      }
      if (!q) return true;
      return (
        pb.title.toLowerCase().includes(q) ||
        pb.summary.toLowerCase().includes(q) ||
        pb.topicTags.some((tag) => tag.toLowerCase().includes(q))
      );
    })
    .slice(0, 80);

  return NextResponse.json(
    {
      ok: true,
      totals: {
        prompts: ALL_SITE_PROMPTS.length,
        tools: ALL_LIVE_TOOLS.length,
        playbooks: ALL_PUBLISHED_ARTICLES.length,
      },
      promptCategories,
      toolCategories,
      playbookTracks,
      prompts: filteredPrompts,
      tools: filteredTools,
      playbooks,
    },
    {
      headers: { "Cache-Control": "public, max-age=120" },
    },
  );
}
