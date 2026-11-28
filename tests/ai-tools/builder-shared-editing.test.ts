import assert from "node:assert/strict";
import test from "node:test";
import { applySiteCommand } from "../../features/website-builder/domain/commands";
import {
  DEFAULT_SITE_DOCUMENT,
  validateSiteDocument,
} from "../../features/website-builder/domain/site-document";
import {
  getEditedToolPageFields,
  isToolPageFieldEdited,
  toolGradientPresets,
  toolPageFields,
} from "../../features/website-builder/domain/tool-page-properties";
import {
  buildPublicationSnapshot,
  homePublicationGroups,
} from "../../features/website-builder/domain/publication-selection";

test("toolPageFields registry exposes all 25 hero, input, gradient, theme, story, FAQ, and SEO properties", () => {
  assert.equal(toolPageFields.length, 25);
  assert.ok(toolPageFields.includes("inputLabel"));
  assert.ok(toolPageFields.includes("secondaryInputLabel"));
  assert.ok(toolPageFields.includes("toolSecondaryAccentHex"));
  assert.ok(toolPageFields.includes("toolSurfaceHex"));
  assert.ok(toolPageFields.includes("toolGradientPreset"));
  assert.equal(toolGradientPresets.length, 7);
});

test("project.update captures version-1 baselines once and project.resetPageProperty restores original values", () => {
  const doc = validateSiteDocument({
    ...DEFAULT_SITE_DOCUMENT,
    projectId: "project-1",
  });
  const tool = doc.content.projects[0];
  assert.ok(tool);
  const originalTitle = tool.title;

  let updated1 = applySiteCommand(doc, {
    type: "project.update",
    itemId: tool.id,
    field: "title",
    value: "Custom SEO Title Studio",
  });
  updated1 = applySiteCommand(updated1, {
    type: "project.update",
    itemId: tool.id,
    field: "inputLabel",
    value: "Primary Target URL",
  });
  updated1 = applySiteCommand(updated1, {
    type: "project.update",
    itemId: tool.id,
    field: "toolAccentHex",
    value: "#10b981",
  });
  updated1 = applySiteCommand(updated1, {
    type: "project.update",
    itemId: tool.id,
    field: "toolSecondaryAccentHex",
    value: "#06b6d4",
  });
  updated1 = applySiteCommand(updated1, {
    type: "project.update",
    itemId: tool.id,
    field: "toolGradientPreset",
    value: "emerald-cyan",
  });

  const editedTool1 = updated1.content.projects[0];
  assert.equal(editedTool1.title, "Custom SEO Title Studio");
  assert.equal(editedTool1.inputLabel, "Primary Target URL");
  assert.equal(editedTool1.toolAccentHex, "#10b981");
  assert.equal(editedTool1.toolSecondaryAccentHex, "#06b6d4");
  assert.equal(editedTool1.toolGradientPreset, "emerald-cyan");
  assert.ok(isToolPageFieldEdited(editedTool1, "title"));
  assert.ok(isToolPageFieldEdited(editedTool1, "inputLabel"));
  assert.ok(isToolPageFieldEdited(editedTool1, "toolGradientPreset"));

  // Second edit to title must not overwrite original baseline
  const updated2 = applySiteCommand(updated1, {
    type: "project.update",
    itemId: tool.id,
    field: "title",
    value: "Second Custom Title",
  });
  assert.equal(updated2.content.projects[0].toolPageEdits?.baseline.title, originalTitle);

  // Resetting title restores originalTitle and clears title from baseline
  const afterReset = applySiteCommand(updated2, {
    type: "project.resetPageProperty",
    itemId: tool.id,
    field: "title",
  });
  const resetTool = afterReset.content.projects[0];
  assert.equal(resetTool.title, originalTitle);
  assert.equal(isToolPageFieldEdited(resetTool, "title"), false);
  assert.equal(isToolPageFieldEdited(resetTool, "inputLabel"), true);
});

test("project.syncCatalogToolVersion preserves user overrides and revertCatalogToolVersion restores full 25-field snapshot", () => {
  const doc = validateSiteDocument({
    ...DEFAULT_SITE_DOCUMENT,
    projectId: "project-2",
  });
  const tool = doc.content.projects[0];

  let customized = applySiteCommand(doc, {
    type: "project.update",
    itemId: tool.id,
    field: "title",
    value: "My Branded Meta Generator",
  });
  customized = applySiteCommand(customized, {
    type: "project.update",
    itemId: tool.id,
    field: "toolAccentHex",
    value: "#a855f7",
  });
  customized = applySiteCommand(customized, {
    type: "project.update",
    itemId: tool.id,
    field: "toolSecondaryAccentHex",
    value: "#ec4899",
  });
  customized = applySiteCommand(customized, {
    type: "project.update",
    itemId: tool.id,
    field: "toolGradientPreset",
    value: "violet-rose",
  });
  customized = applySiteCommand(customized, {
    type: "project.update",
    itemId: tool.id,
    field: "customCtaLabel",
    value: "Generate Branded Meta Tags",
  });

  const syncedPreserve = applySiteCommand(customized, {
    type: "project.syncCatalogToolVersion",
    itemId: tool.id,
    versionLabel: "2.4.0",
    overwriteCustomCopy: false,
  });

  const syncedTool = syncedPreserve.content.projects[0];
  assert.equal(syncedTool.installedToolVersion, "2.4.0");
  assert.equal(syncedTool.title, "My Branded Meta Generator");
  assert.equal(syncedTool.toolGradientPreset, "violet-rose");
  assert.ok(syncedTool.previousToolSnapshot?.pageProperties);

  // Sync with overwrite and then revert back to customized snapshot
  const syncedOverwrite = applySiteCommand(customized, {
    type: "project.syncCatalogToolVersion",
    itemId: tool.id,
    versionLabel: "3.0.0",
    overwriteCustomCopy: true,
    title: "Upstream Default Title 3.0",
    summary: "Upstream summary",
  });
  assert.equal(syncedOverwrite.content.projects[0].title, "Upstream Default Title 3.0");

  const reverted = applySiteCommand(syncedOverwrite, {
    type: "project.revertCatalogToolVersion",
    itemId: tool.id,
  });
  const revertedTool = reverted.content.projects[0];
  assert.equal(revertedTool.title, "My Branded Meta Generator");
  assert.equal(revertedTool.toolAccentHex, "#a855f7");
  assert.equal(revertedTool.toolSecondaryAccentHex, "#ec4899");
  assert.equal(revertedTool.toolGradientPreset, "violet-rose");
  assert.equal(revertedTool.customCtaLabel, "Generate Branded Meta Tags");
  assert.ok(getEditedToolPageFields(revertedTool).includes("title"));
});

test("selective publication includes updated tool page properties when projects group is selected", () => {
  const baseDoc = validateSiteDocument({
    ...DEFAULT_SITE_DOCUMENT,
    projectId: "project-3",
  });
  const tool = baseDoc.content.projects[0];
  let draftDoc = applySiteCommand(baseDoc, {
    type: "project.update",
    itemId: tool.id,
    field: "title",
    value: "Published Launchpad Tool",
  });
  draftDoc = applySiteCommand(draftDoc, {
    type: "project.update",
    itemId: tool.id,
    field: "toolGradientPreset",
    value: "indigo-cyan",
  });

  const withoutProjectsSelection = homePublicationGroups
    .map(String)
    .filter((key) => key !== "projects");
  const publishedWithoutProjects = buildPublicationSnapshot(
    draftDoc,
    baseDoc,
    withoutProjectsSelection
  );
  assert.equal(publishedWithoutProjects.content.projects[0].title, tool.title);

  const withProjectsSelection = [...homePublicationGroups.map(String)];
  const publishedWithProjects = buildPublicationSnapshot(
    draftDoc,
    baseDoc,
    withProjectsSelection
  );
  assert.equal(publishedWithProjects.content.projects[0].title, "Published Launchpad Tool");
  assert.equal(publishedWithProjects.content.projects[0].toolGradientPreset, "indigo-cyan");
});
