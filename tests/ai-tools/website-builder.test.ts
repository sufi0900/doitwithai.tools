import test from "node:test";
import assert from "node:assert/strict";
import {
  DEFAULT_SITE_DOCUMENT,
  validateSiteDocument,
} from "../../features/website-builder/domain/site-document";
import { applySiteCommand } from "../../features/website-builder/domain/commands";
import {
  PORTFOLIO_TEMPLATES,
  getTemplate,
} from "../../features/website-builder/domain/templates";
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

test("Single-Tool, Multi-Tool, Blogging, Newsletter, Magazine, Creator, Advisory & Agency templates ship unique 5-post SEO packs", () => {
  for (const tpl of PORTFOLIO_TEMPLATES) {
    const validated = validateSiteDocument(tpl.document);
    assert.equal(validated.design.template, tpl.id);
    assert.notEqual(
      validated.identity.name,
      "Sufian Mustafa",
      `Template ${tpl.id} should not use generic portfolio identity`,
    );
  }

  const singleTool = getTemplate("micro-saas-launchpad")!;
  assert.equal(singleTool.document.content.projects.length, 1);
  assert.match(singleTool.document.content.projects[0].title, /Meta Title/i);
  assert.equal(singleTool.document.publishing.posts.length, 5);
  assert.equal(singleTool.document.publishing.pages.length, 3);

  const multiTool = getTemplate("doitwithai-flagship")!;
  assert.equal(multiTool.document.content.projects.length, 5);
  assert.equal(multiTool.document.publishing.posts.length, 5);
  assert.equal(multiTool.document.publishing.pages.length, 3);

  const deepTemplates = [
    "micro-saas-launchpad",
    "doitwithai-flagship",
    "authority-niche-blog",
    "creator-newsletter-hub",
    "olive-journal",
    "founder-authority-brand",
    "consultant-lead-engine",
    "startup-service-agency",
  ] as const;

  const seenLeadSlugs = new Set<string>();
  for (const id of deepTemplates) {
    const tpl = getTemplate(id)!;
    assert.equal(tpl.document.publishing.posts.length, 5, `Expected 5 posts in ${id}`);
    assert.ok(tpl.document.publishing.pages.length >= 2, `Expected >= 2 pages in ${id}`);
    const leadSlug = tpl.document.publishing.posts[0].slug;
    assert.equal(
      seenLeadSlugs.has(leadSlug),
      false,
      `Template ${id} should have a unique lead blog post slug (${leadSlug})`,
    );
    seenLeadSlugs.add(leadSlug);
  }
});

test("project.installCatalogTool installs a tool from the catalog with zero AI tokens and optional companion SEO blog post", () => {
  const updated = applySiteCommand(DEFAULT_SITE_DOCUMENT, {
    type: "project.installCatalogTool",
    slug: "schema-markup-generator",
    title: "JSON-LD Schema Markup Generator",
    summary: "Generate connected JSON-LD @graph structured data for Google and AI search.",
    technologies: ["JSON-LD", "Schema.org", "Rich Results"],
    link: "https://doitwithai.tools/tools/schema-markup-generator",
    role: "Interactive AI SEO Utility",
    period: "Live on DoItWithAI",
    challenge: "Manual schema writing is error-prone.",
    approach: "Automated @graph builder.",
    outcome: "Valid structured data in 1 click.",
    includeCompanionPost: true,
  });

  assert.ok(
    updated.content.projects.some(
      (p) => p.caseStudySlug === "schema-markup-generator",
    ),
  );
  assert.ok(
    updated.publishing.posts.some(
      (post) => post.pillarClusterSlug === "schema-markup-generator",
    ),
  );
});
