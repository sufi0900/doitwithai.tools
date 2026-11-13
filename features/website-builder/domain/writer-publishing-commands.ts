import { z } from "zod";
import { siteDocumentSchema, structuredBlockSchema, type SiteDocument } from "./site-document";
import { legacyRichDocument } from "./legacy-rich-document";

export const upsertFromWriterStudioCommandSchema = z.object({
  type: z.literal("publishing.upsertFromWriterStudio"),
  sourceArticleProjectId: z.string().trim().min(1).max(120),
  title: z.string().trim().min(1).max(120),
  slug: z.string().trim().min(1).max(80),
  seoTitle: z.string().trim().max(70),
  seoDescription: z.string().trim().max(170),
  excerpt: z.string().trim().max(320),
  tags: z.array(z.string().trim().min(1).max(32)).max(8).default([]),
  pillarClusterSlug: z.string().trim().max(80).optional(),
  blocks: z.array(structuredBlockSchema).max(200),
  publishImmediately: z.boolean().default(false),
});

export type UpsertFromWriterStudioCommand = z.infer<typeof upsertFromWriterStudioCommandSchema>;

function normalizePublishingSlug(value: string) {
  return value.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 80);
}

function uniquePostSlug(document: SiteDocument, value: string, exceptId?: string) {
  const base = normalizePublishingSlug(value) || "post";
  let candidate = base;
  let suffix = 2;
  while (document.publishing.posts.some((item) => item.id !== exceptId && item.slug === candidate)) {
    candidate = `${base}-${suffix++}`;
  }
  return candidate;
}

/**
 * Governed handler for syncing an article from the AI Content Writer Studio
 * (`/ai-content-writer`) directly into a Website Builder project's `publishing.posts`.
 */
export function applyUpsertFromWriterStudioCommand(
  current: SiteDocument,
  rawCommand: unknown
): SiteDocument {
  const command = upsertFromWriterStudioCommandSchema.parse(rawCommand);
  const existing = current.publishing.posts.find(
    (entry) =>
      entry.sourceArticleProjectId === command.sourceArticleProjectId ||
      entry.slug === normalizePublishingSlug(command.slug)
  );
  if (!existing && current.publishing.posts.length >= 24) {
    throw new Error("This website already has the maximum of 24 blog articles.");
  }
  const cleanSlug = existing
    ? existing.slug
    : uniquePostSlug(current, command.slug || command.title);
  const richContent = legacyRichDocument({ blocks: command.blocks }, current);
  const canMarkPublished = Boolean(command.publishImmediately && existing?.coverMediaId);
  const nextStatus = canMarkPublished ? ("published" as const) : ("draft" as const);

  const updatedPost = {
    id: existing?.id ?? `post-${command.sourceArticleProjectId.slice(0, 24)}`,
    sourceArticleProjectId: command.sourceArticleProjectId,
    pillarClusterSlug: command.pillarClusterSlug,
    title: command.title,
    slug: cleanSlug,
    seoTitle: command.seoTitle || command.title.slice(0, 70),
    seoDescription: command.seoDescription || command.excerpt.slice(0, 170),
    coverMediaId: existing?.coverMediaId ?? "",
    excerpt: command.excerpt,
    tags: command.tags,
    status: nextStatus,
    publishedAt:
      nextStatus === "published"
        ? new Date().toISOString()
        : existing?.publishedAt ?? null,
    blocks: command.blocks,
    richContent,
  };

  const posts = existing
    ? current.publishing.posts.map((entry) =>
        entry.id === existing.id ? updatedPost : entry
      )
    : [updatedPost, ...current.publishing.posts];

  const next: SiteDocument = {
    ...current,
    revision: current.revision + 1,
    updatedAt: new Date().toISOString(),
    publishing: {
      ...current.publishing,
      posts,
    },
  };

  return siteDocumentSchema.parse(next);
}

export function describeWriterPublishingCommand(command: UpsertFromWriterStudioCommand): string {
  return `Synced "${command.title}" from AI Content Writer Studio.`;
}
