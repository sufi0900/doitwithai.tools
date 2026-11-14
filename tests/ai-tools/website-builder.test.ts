import test from "node:test";
import assert from "node:assert/strict";
import {
  DEFAULT_SITE_DOCUMENT,
  validateSiteDocument,
} from "../../features/website-builder/domain/site-document";
import {
  DEFAULT_WEBSITE_TEMPLATE_ID,
  getTemplatesByCategory,
  UNIFIED_WEBSITE_TEMPLATES,
} from "../../features/website-builder/ecosystem-bridge";
import {
  isBlogFirstTemplate,
  isCollectionTemplate,
  isLightTemplate,
} from "../../features/website-builder/domain/template-contracts";
import { isEditorialFlagshipTemplate } from "../../features/website-builder/portfolio/editorial-flagship-templates";
import { applyUpsertFromWriterStudioCommand } from "../../features/website-builder/domain/writer-publishing-commands";
import {
  buildPublicationSnapshot,
  homePublicationGroups,
  missingPublicationFields,
} from "../../features/website-builder/domain/publication-selection";

test("website builder exposes 16 curated templates across all 4 categories with doitwithai-flagship default", () => {
  assert.equal(DEFAULT_WEBSITE_TEMPLATE_ID, "doitwithai-flagship");
  assert.equal(UNIFIED_WEBSITE_TEMPLATES.length, 16);

  const categories = [
    "blog-editorial",
    "personal-brand",
    "startup-saas",
    "interactive-3d-portfolio",
  ] as const;

  let categorizedCount = 0;
  for (const cat of categories) {
    const items = getTemplatesByCategory(cat);
    assert.ok(items.length >= 3, `Expected >= 3 templates in ${cat}`);
    categorizedCount += items.length;
  }
  assert.equal(categorizedCount, 16);

  assert.equal(isEditorialFlagshipTemplate("doitwithai-flagship"), true);
  assert.equal(isBlogFirstTemplate("doitwithai-flagship"), true);
  assert.equal(isCollectionTemplate("doitwithai-flagship"), false);
  assert.equal(isCollectionTemplate("rose-studio"), true);
  assert.equal(isLightTemplate("olive-journal"), true);
  assert.equal(isLightTemplate("doitwithai-flagship"), false);
});

test("DEFAULT_SITE_DOCUMENT validates cleanly with DoItWithAI flagship defaults", () => {
  const doc = validateSiteDocument(DEFAULT_SITE_DOCUMENT);
  assert.equal(doc.design.template, "doitwithai-flagship");
  assert.equal(doc.design.accent, "indigo");
  assert.equal(doc.design.background, "obsidian");
  assert.equal(doc.scene.family, "doitwithai-editorial-grid");
});

test("applyUpsertFromWriterStudioCommand syncs and updates an article idempotently and allows instant publication snapshot", () => {
  const baseDoc = validateSiteDocument({
    ...DEFAULT_SITE_DOCUMENT,
    projectId: "site-test-1",
  });

  const payload = {
    type: "publishing.upsertFromWriterStudio" as const,
    sourceArticleProjectId: "writer-proj-99",
    title: "AI Website Builder SEO Blueprint",
    slug: "ai-website-builder-seo-blueprint",
    seoTitle: "AI Website Builder SEO Blueprint 2026",
    seoDescription: "How to unify blog writing, internal linking, and 3D websites.",
    excerpt: "Learn how AI Content Writer and AI Website Builder publish live posts in one click.",
    tags: ["ai seo", "website builder"],
    pillarClusterSlug: "ai-seo-guide",
    blocks: [
      {
        id: "blk-h2-1",
        type: "heading" as const,
        headingLevel: "h2" as const,
        text: "Why Unified Content & Website Publishing Wins",
        mediaId: "",
        items: [],
      },
      {
        id: "blk-p-1",
        type: "paragraph" as const,
        headingLevel: "h2" as const,
        text: "Eliminating copy-paste preserves structured headings, schema, and internal links automatically.",
        mediaId: "",
        items: [],
      },
    ],
    publishImmediately: true,
  };

  const syncedDoc = applyUpsertFromWriterStudioCommand(baseDoc, payload);
  assert.equal(syncedDoc.revision, baseDoc.revision + 1);
  assert.equal(syncedDoc.publishing.posts.length, 1);
  const syncedPost = syncedDoc.publishing.posts[0];
  assert.equal(syncedPost.sourceArticleProjectId, "writer-proj-99");
  assert.equal(syncedPost.pillarClusterSlug, "ai-seo-guide");
  assert.equal(syncedPost.status, "published");
  assert.equal(missingPublicationFields(syncedPost, "post", syncedDoc).length, 0);

  // Upsert again with updated title -> updates existing post in place instead of duplicating
  const updatedDoc = applyUpsertFromWriterStudioCommand(syncedDoc, {
    ...payload,
    title: "AI Website Builder SEO Blueprint (Updated)",
  });
  assert.equal(updatedDoc.publishing.posts.length, 1);
  assert.equal(
    updatedDoc.publishing.posts[0].title,
    "AI Website Builder SEO Blueprint (Updated)",
  );

  // Build atomic live snapshot for first publication
  const selection = [...homePublicationGroups.map(String), `post:${syncedPost.id}`];
  const snapshot = buildPublicationSnapshot(updatedDoc, undefined, selection, {
    kind: "post",
    id: syncedPost.id,
    status: "published",
  });
  assert.equal(snapshot.publishing.posts.length, 1);
  assert.equal(snapshot.publishing.posts[0].status, "published");
});
