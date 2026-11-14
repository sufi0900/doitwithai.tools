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
import { resolveCatalogToolSlug } from "../../features/website-builder/domain/catalog-tool-resolver";

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

  const updatedDoc = applyUpsertFromWriterStudioCommand(syncedDoc, {
    ...payload,
    title: "AI Website Builder SEO Blueprint (Updated)",
  });
  assert.equal(updatedDoc.publishing.posts.length, 1);
  assert.equal(
    updatedDoc.publishing.posts[0].title,
    "AI Website Builder SEO Blueprint (Updated)",
  );

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
  assert.equal(singleTool.document.content.projects[0].link, "");
  assert.equal(singleTool.document.content.visibility.experience, false);
  assert.equal(singleTool.document.content.visibility.skills, false);
  assert.equal(singleTool.document.content.visibility.projects, false);
  assert.match(singleTool.document.content.projects[0].title, /Meta Title/i);
  assert.equal(singleTool.document.publishing.posts.length, 5);
  assert.equal(singleTool.document.publishing.pages.length, 3);

  const multiTool = getTemplate("doitwithai-flagship")!;
  assert.equal(multiTool.document.content.projects.length, 6);
  assert.equal(multiTool.document.content.projects.every((p) => p.link === ""), true);
  assert.equal(multiTool.document.content.visibility.experience, false);
  assert.equal(multiTool.document.content.visibility.skills, false);
  assert.equal(multiTool.document.publishing.posts.length, 5);
  assert.equal(multiTool.document.publishing.pages.length, 3);

  const seenAllPostSlugs = new Set<string>();
  const seenIdentityNames = new Set<string>();
  for (const tpl of PORTFOLIO_TEMPLATES) {
    assert.equal(tpl.document.publishing.posts.length, 5, `Expected 5 posts in ${tpl.id}`);
    assert.ok(tpl.document.publishing.pages.length >= 2, `Expected >= 2 pages in ${tpl.id}`);
    assert.ok(tpl.document.content.projects.length >= 1, `Expected >= 1 project in ${tpl.id}`);
    assert.equal(
      seenIdentityNames.has(tpl.document.identity.name),
      false,
      `Template ${tpl.id} should have a unique identity name (${tpl.document.identity.name})`,
    );
    seenIdentityNames.add(tpl.document.identity.name);
    for (const post of tpl.document.publishing.posts) {
      assert.equal(
        seenAllPostSlugs.has(post.slug),
        false,
        `Template ${tpl.id} post slug (${post.slug}) should be globally unique across all 80 default posts`,
      );
      seenAllPostSlugs.add(post.slug);
    }
  }
  assert.equal(seenAllPostSlugs.size, 80);
});

test("project.installCatalogTool installs a tool from the catalog with zero AI tokens and optional companion SEO blog post", () => {
  const updated = applySiteCommand(DEFAULT_SITE_DOCUMENT, {
    type: "project.installCatalogTool",
    slug: "schema-markup-generator",
    title: "JSON-LD Schema Markup Generator",
    summary: "Generate connected JSON-LD @graph structured data for Google and AI search.",
    technologies: ["JSON-LD", "Schema.org", "Rich Results"],
    link: "",
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

test("resolveCatalogToolSlug resolves all flagship default tools and suffixed copies cleanly", () => {
  const multiTool = getTemplate("doitwithai-flagship")!;
  for (const project of multiTool.document.content.projects) {
    const resolved = resolveCatalogToolSlug(project);
    assert.ok(
      resolved,
      `Expected catalog slug resolution for default tool "${project.title}" (${project.caseStudySlug})`,
    );
  }
  assert.equal(resolveCatalogToolSlug({ caseStudySlug: "ai-faq-snippet-generator" }), "ai-faq-generator");
  assert.equal(resolveCatalogToolSlug({ caseStudySlug: "meta-title-generator-2" }), "meta-title-generator");
  assert.equal(resolveCatalogToolSlug({ caseStudySlug: "custom-non-catalog-project" }), null);
});

test("Tool landing page customization fields and flagship swap persist via applySiteCommand", () => {
  const singleToolDoc = validateSiteDocument(getTemplate("micro-saas-launchpad")!.document);
  const flagshipId = singleToolDoc.content.projects[0].id;

  const swapped = applySiteCommand(singleToolDoc, {
    type: "project.installCatalogTool",
    slug: "readability-checker",
    title: "Readability Checker",
    summary: "Audit clarity and sentence structure.",
    technologies: ["Clarity", "Grade 8"],
    link: "",
    role: "Interactive AI Web Utility",
    period: "Live on Your Website",
    challenge: "",
    approach: "",
    outcome: "",
    includeCompanionPost: false,
    replaceItemId: flagshipId,
  });

  assert.equal(swapped.content.projects.length, 1);
  assert.equal(swapped.content.projects[0].id, flagshipId);
  assert.equal(swapped.content.projects[0].caseStudySlug, "readability-checker");

  let customized = applySiteCommand(swapped, {
    type: "project.update",
    itemId: flagshipId,
    field: "defaultInput",
    value: "Custom prefilled headline topic",
  });
  customized = applySiteCommand(customized, {
    type: "project.update",
    itemId: flagshipId,
    field: "defaultSecondaryInput",
    value: "Sample article paragraph to pre-load inside the workspace.",
  });
  customized = applySiteCommand(customized, {
    type: "project.update",
    itemId: flagshipId,
    field: "customCtaLabel",
    value: "Analyze Clarity Now",
  });
  customized = applySiteCommand(customized, {
    type: "project.update",
    itemId: flagshipId,
    field: "heroHighlights",
    value: ["Grade 8 Meter: Highlight long sentences"],
  });
  customized = applySiteCommand(customized, {
    type: "project.update",
    itemId: flagshipId,
    field: "toolAccentHex",
    value: "#10b981",
  });
  customized = applySiteCommand(customized, {
    type: "project.update",
    itemId: flagshipId,
    field: "toolThemeMode",
    value: "dark",
  });
  customized = applySiteCommand(customized, {
    type: "project.update",
    itemId: flagshipId,
    field: "hideEducationSection",
    value: true,
  });
  customized = applySiteCommand(customized, {
    type: "project.update",
    itemId: flagshipId,
    field: "hideFaqSection",
    value: false,
  });
  customized = applySiteCommand(customized, {
    type: "project.update",
    itemId: flagshipId,
    field: "customFaqs",
    value: [{ question: "Is it free?", answer: "Yes, 100% browser-based." }],
  });

  const target = customized.content.projects[0];
  assert.equal(target.defaultInput, "Custom prefilled headline topic");
  assert.equal(target.customCtaLabel, "Analyze Clarity Now");
  assert.deepEqual(target.heroHighlights, ["Grade 8 Meter: Highlight long sentences"]);
  assert.equal(target.toolAccentHex, "#10b981");
  assert.equal(target.toolThemeMode, "dark");
  assert.equal(target.hideEducationSection, true);
  assert.equal(target.customFaqs?.length, 1);
});
