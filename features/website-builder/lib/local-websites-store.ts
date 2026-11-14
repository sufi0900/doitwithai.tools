"use client";

import {
  validateSiteDocument,
  type SiteDocument,
} from "@/features/website-builder/domain/site-document";
import {
  UNIFIED_WEBSITE_TEMPLATES,
  type ConnectedWebsiteSummary,
  type UnifiedTemplateId,
} from "@/features/website-builder/ecosystem-bridge";
import {
  getTemplateDefaultDocument,
} from "@/features/website-builder/domain/template-defaults";
import {
  buildPublicationSnapshot,
  homePublicationGroups,
  publicationChoices,
} from "@/features/website-builder/domain/publication-selection";
import { normalizePublicationSlug } from "@/features/website-builder/domain/publication";
import {
  applyUpsertFromWriterStudioCommand,
  type UpsertFromWriterStudioCommand,
} from "@/features/website-builder/domain/writer-publishing-commands";
import type { TemplateId } from "@/features/website-builder/domain/template-contracts";

export const LOCAL_WEBSITES_STORAGE_KEY = "doitwithai-local-websites-v1";
export const WRITER_TARGET_SITE_STORAGE_KEY = "doitwithai-writer-target-site-id";
export const DEMO_STUDIO_STORAGE_KEY = "voxfolio-demo-document-v2";

export interface LocalWebsiteRecord {
  id: string;
  name: string;
  creationMode: "template" | "guided" | "manual" | "demo";
  templateId: TemplateId;
  revision: number;
  createdAt: string;
  updatedAt: string;
  document: SiteDocument;
  publication: {
    slug: string;
    revision: number;
    published_at: string;
    document: SiteDocument;
  } | null;
}

/**
 * Enables 100% browser localStorage website creation, Studio editing, /p/[slug] live previewing,
 * and AI Content Writer publishing without requiring Google OAuth sign-in on Vercel preview branches.
 * Set NEXT_PUBLIC_REQUIRE_WEBSITE_AUTH="true" in production when ready to enforce mandatory sign-in.
 */
export function isLocalPreviewAuthBypassEnabled(): boolean {
  return process.env.NEXT_PUBLIC_REQUIRE_WEBSITE_AUTH !== "true";
}

function notifyLocalWebsitesUpdated() {
  if (typeof window === "undefined") return;
  try {
    window.dispatchEvent(new CustomEvent("doitwithai-local-websites-updated"));
  } catch {
    /* Ignore event dispatch errors in restricted environments */
  }
}

export function listLocalWebsiteRecords(): LocalWebsiteRecord[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(LOCAL_WEBSITES_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    const valid: LocalWebsiteRecord[] = [];
    for (const item of parsed) {
      if (!item || typeof item !== "object" || typeof item.id !== "string") continue;
      try {
        const doc = validateSiteDocument(item.document);
        const pub =
          item.publication && typeof item.publication.slug === "string"
            ? {
                slug: item.publication.slug,
                revision: Number(item.publication.revision ?? doc.revision),
                published_at: String(item.publication.published_at ?? doc.updatedAt),
                document: item.publication.document
                  ? validateSiteDocument(item.publication.document)
                  : doc,
              }
            : null;
        valid.push({
          id: item.id,
          name: String(item.name || doc.identity.name || "My Website"),
          creationMode: item.creationMode || "template",
          templateId: doc.design.template,
          revision: Number(item.revision ?? doc.revision),
          createdAt: String(item.createdAt || doc.updatedAt),
          updatedAt: String(item.updatedAt || doc.updatedAt),
          document: doc,
          publication: pub,
        });
      } catch {
        /* Skip malformed records */
      }
    }
    return valid.sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
  } catch {
    return [];
  }
}

function writeLocalWebsiteRecords(records: LocalWebsiteRecord[]) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(LOCAL_WEBSITES_STORAGE_KEY, JSON.stringify(records));
    notifyLocalWebsitesUpdated();
  } catch {
    /* Ignore quota errors */
  }
}

export function getLocalWebsiteRecord(projectId: string): LocalWebsiteRecord | null {
  return listLocalWebsiteRecords().find((r) => r.id === projectId) ?? null;
}

export function getLocalWebsiteBySlug(slug: string): LocalWebsiteRecord | null {
  const clean = normalizePublicationSlug(slug);
  const records = listLocalWebsiteRecords();
  return (
    records.find((r) => r.publication?.slug === clean) ??
    records.find((r) => normalizePublicationSlug(r.name) === clean) ??
    records.find((r) => r.id === slug) ??
    null
  );
}

function uniqueLocalPublicSlug(desired: string, exceptProjectId?: string): string {
  const base = normalizePublicationSlug(desired) || "my-ai-website";
  const safeBase = base.length >= 3 ? base : `${base}-site`;
  const existing = new Set(
    listLocalWebsiteRecords()
      .filter((r) => r.id !== exceptProjectId)
      .map((r) => r.publication?.slug)
      .filter(Boolean),
  );
  let candidate = safeBase;
  let suffix = 2;
  while (existing.has(candidate)) {
    candidate = `${safeBase.slice(0, 56)}-${suffix++}`;
  }
  return candidate;
}

export function createLocalWebsiteProject(input: {
  id?: string;
  name: string;
  templateId: TemplateId;
  creationMode?: "template" | "guided" | "manual" | "demo";
  document?: SiteDocument;
  autoPublish?: boolean;
}): LocalWebsiteRecord {
  const projectId = input.id || crypto.randomUUID();
  const now = new Date().toISOString();
  const baseDoc = input.document ?? getTemplateDefaultDocument(input.templateId);
  const doc: SiteDocument = validateSiteDocument({
    ...baseDoc,
    projectId,
    revision: 0,
    updatedAt: now,
  });

  const slug = uniqueLocalPublicSlug(input.name || doc.identity.name, projectId);
  const shouldPublish = input.autoPublish !== false;
  const record: LocalWebsiteRecord = {
    id: projectId,
    name: (input.name || doc.identity.name || "My Website").trim().slice(0, 80),
    creationMode: input.creationMode ?? "template",
    templateId: doc.design.template,
    revision: doc.revision,
    createdAt: now,
    updatedAt: now,
    document: doc,
    publication: shouldPublish
      ? {
          slug,
          revision: doc.revision,
          published_at: now,
          document: doc,
        }
      : null,
  };

  const current = listLocalWebsiteRecords().filter((r) => r.id !== projectId);
  writeLocalWebsiteRecords([record, ...current]);
  setSelectedWriterTargetSiteId(projectId);
  return record;
}

export function saveLocalWebsiteDraft(
  projectId: string,
  document: SiteDocument,
  name?: string,
): LocalWebsiteRecord {
  const now = new Date().toISOString();
  const validated = validateSiteDocument({
    ...document,
    projectId,
    updatedAt: now,
  });
  const records = listLocalWebsiteRecords();
  const existing = records.find((r) => r.id === projectId);

  const nextRecord: LocalWebsiteRecord = existing
    ? {
        ...existing,
        name: name?.trim() || existing.name,
        templateId: validated.design.template,
        revision: validated.revision,
        updatedAt: now,
        document: validated,
        publication: existing.publication
          ? {
              ...existing.publication,
              revision: validated.revision,
              published_at: now,
              document: validated,
            }
          : null,
      }
    : {
        id: projectId,
        name: name?.trim() || validated.identity.name || "Local Website",
        creationMode: "template",
        templateId: validated.design.template,
        revision: validated.revision,
        createdAt: now,
        updatedAt: now,
        document: validated,
        publication: {
          slug: uniqueLocalPublicSlug(validated.identity.name, projectId),
          revision: validated.revision,
          published_at: now,
          document: validated,
        },
      };

  const remaining = records.filter((r) => r.id !== projectId);
  writeLocalWebsiteRecords([nextRecord, ...remaining]);
  return nextRecord;
}

export function publishLocalWebsiteProject(
  projectId: string,
  desiredSlug: string,
  selection?: string[],
  itemAction?: { kind: "page" | "post"; id: string; status: "draft" | "published" },
): {
  publication: NonNullable<LocalWebsiteRecord["publication"]>;
  document: SiteDocument;
} {
  const records = listLocalWebsiteRecords();
  let record = records.find((r) => r.id === projectId);
  if (!record) {
    throw new Error("Local website project not found.");
  }
  const cleanSlug = uniqueLocalPublicSlug(desiredSlug, projectId);
  const liveDoc = record.publication?.document;
  const effectiveSelection =
    selection && selection.length > 0
      ? selection
      : publicationChoices(record.document, liveDoc)
          .filter((row) => !row.missing.length)
          .map((row) => row.key);

  let snapshot: SiteDocument;
  try {
    snapshot = buildPublicationSnapshot(
      record.document,
      liveDoc,
      effectiveSelection,
      itemAction,
    );
  } catch {
    snapshot = record.document;
  }

  const now = new Date().toISOString();
  const publication = {
    slug: cleanSlug,
    revision: snapshot.revision,
    published_at: now,
    document: snapshot,
  };
  record = {
    ...record,
    updatedAt: now,
    document: snapshot,
    publication,
  };
  writeLocalWebsiteRecords([
    record,
    ...records.filter((r) => r.id !== projectId),
  ]);
  return { publication, document: snapshot };
}

export function unpublishLocalWebsiteProject(projectId: string): void {
  const records = listLocalWebsiteRecords();
  const existing = records.find((r) => r.id === projectId);
  if (!existing) return;
  const updated: LocalWebsiteRecord = {
    ...existing,
    publication: null,
    updatedAt: new Date().toISOString(),
  };
  writeLocalWebsiteRecords([
    updated,
    ...records.filter((r) => r.id !== projectId),
  ]);
}

export function listLocalWebsitesAsConnectedSummaries(): ConnectedWebsiteSummary[] {
  return listLocalWebsiteRecords().map((rec) => {
    const doc = rec.document;
    const templateId = (doc.design.template || rec.templateId || "doitwithai-flagship") as UnifiedTemplateId;
    const templateMeta = UNIFIED_WEBSITE_TEMPLATES.find((t) => t.id === templateId);
    const posts = doc.publishing.posts ?? [];
    const pages = doc.publishing.pages ?? [];
    const publishedPosts = posts.filter((p) => p.status === "published");
    const publishedPages = pages.filter((p) => p.status === "published");
    const pubSlug = rec.publication?.slug ?? uniqueLocalPublicSlug(rec.name, rec.id);

    return {
      projectId: rec.id,
      name: rec.name,
      templateId,
      templateName: templateMeta?.name ?? templateId.replaceAll("-", " "),
      templateCategory: templateMeta?.category ?? "blog-editorial",
      mode:
        templateMeta?.mode ??
        (doc.scene.family === "professional-2d" ||
        doc.scene.family === "doitwithai-editorial-grid"
          ? "2d"
          : "3d"),
      revision: rec.revision,
      updatedAt: rec.updatedAt,
      publicSlug: pubSlug,
      customDomain: null,
      isPublished: Boolean(rec.publication?.slug),
      publishedAt: rec.publication?.published_at ?? null,
      publishedPostCount: publishedPosts.length,
      draftPostCount: posts.length - publishedPosts.length,
      publishedPageCount: publishedPages.length,
      totalPageCount: pages.length,
      visitorAgentEnabled: Boolean(doc.visitor.enabled),
      seoHealthScore: Math.min(
        100,
        55 +
          (publishedPosts.length > 0 ? 25 : 0) +
          (doc.content.projects.length > 0 ? 20 : 0),
      ),
    };
  });
}

export function listLocalWebsiteInternalLinks(): Array<{
  siteProjectId: string;
  siteName: string;
  publicSlug: string;
  postId: string;
  title: string;
  slug: string;
  url: string;
  tags: string[];
}> {
  const links: Array<{
    siteProjectId: string;
    siteName: string;
    publicSlug: string;
    postId: string;
    title: string;
    slug: string;
    url: string;
    tags: string[];
  }> = [];

  for (const rec of listLocalWebsiteRecords()) {
    const pubSlug = rec.publication?.slug || uniqueLocalPublicSlug(rec.name, rec.id);
    for (const post of rec.document.publishing.posts) {
      links.push({
        siteProjectId: rec.id,
        siteName: rec.name,
        publicSlug: pubSlug,
        postId: post.id,
        title: post.title,
        slug: post.slug,
        url: `/p/${pubSlug}/blog/${post.slug}`,
        tags: post.tags ?? [],
      });
    }
    for (const proj of rec.document.content.projects) {
      if (proj.caseStudySlug) {
        links.push({
          siteProjectId: rec.id,
          siteName: rec.name,
          publicSlug: pubSlug,
          postId: proj.id,
          title: proj.title,
          slug: proj.caseStudySlug,
          url: proj.link || `/p/${pubSlug}/projects/${proj.caseStudySlug}`,
          tags: proj.technologies ?? [],
        });
      }
    }
  }
  return links;
}

export function upsertWriterArticleIntoLocalWebsite(
  websiteId: string,
  payload: UpsertFromWriterStudioCommand,
  publishImmediately: boolean,
): {
  ok: boolean;
  liveUrl?: string;
  studioUrl?: string;
  message?: string;
  error?: string;
} {
  try {
    const rec = getLocalWebsiteRecord(websiteId);
    if (!rec) {
      return {
        ok: false,
        error: "Target website was not found in browser storage.",
      };
    }
    const updatedDoc = applyUpsertFromWriterStudioCommand(rec.document, {
      ...payload,
      publishImmediately,
    });
    const syncedPost = updatedDoc.publishing.posts.find(
      (post) =>
        post.sourceArticleProjectId === payload.sourceArticleProjectId ||
        post.slug === payload.slug,
    );
    const saved = saveLocalWebsiteDraft(websiteId, updatedDoc);
    const pubSlug =
      saved.publication?.slug || uniqueLocalPublicSlug(saved.name, saved.id);

    if (publishImmediately || saved.publication) {
      const allHome = [...homePublicationGroups.map(String)];
      const postKeys = updatedDoc.publishing.posts.map((p) => `post:${p.id}`);
      const pageKeys = updatedDoc.publishing.pages.map((p) => `page:${p.id}`);
      publishLocalWebsiteProject(
        websiteId,
        pubSlug,
        [...allHome, ...pageKeys, ...postKeys],
        syncedPost
          ? {
              kind: "post",
              id: syncedPost.id,
              status: publishImmediately ? "published" : syncedPost.status,
            }
          : undefined,
      );
    }

    const postSlug = syncedPost?.slug || payload.slug;
    const liveUrl = publishImmediately
      ? `/p/${pubSlug}/blog/${postSlug}`
      : `/ai-website-builder/studio/${websiteId}`;

    return {
      ok: true,
      liveUrl,
      studioUrl: `/ai-website-builder/studio/${websiteId}`,
      message: publishImmediately
        ? `Published "${payload.title}" live to "${saved.name}" at /p/${pubSlug}/blog/${postSlug}!`
        : `Saved "${payload.title}" as a draft inside "${saved.name}".`,
    };
  } catch (err) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : "Could not sync article to local website.",
    };
  }
}

export function getSelectedWriterTargetSiteId(): string {
  if (typeof window === "undefined") return "";
  try {
    return (
      new URLSearchParams(window.location.search).get("targetSiteId") ||
      window.localStorage.getItem(WRITER_TARGET_SITE_STORAGE_KEY) ||
      ""
    );
  } catch {
    return "";
  }
}

export function setSelectedWriterTargetSiteId(siteId: string): void {
  if (typeof window === "undefined") return;
  try {
    if (siteId) {
      window.localStorage.setItem(WRITER_TARGET_SITE_STORAGE_KEY, siteId);
    } else {
      window.localStorage.removeItem(WRITER_TARGET_SITE_STORAGE_KEY);
    }
    window.dispatchEvent(
      new CustomEvent("doitwithai-target-site-changed", { detail: { siteId } }),
    );
  } catch {
    /* Ignore storage errors */
  }
}
