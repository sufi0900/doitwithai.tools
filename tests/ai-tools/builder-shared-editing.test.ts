import test from "node:test";
import assert from "node:assert/strict";
import { initialStudioState, studioReducer } from "../../features/website-builder/studio/studio-reducer";
import { applySiteCommand } from "../../features/website-builder/domain/commands";

test("canvas text command shares history and survives default upstream sync", () => {
  const id = initialStudioState.present.content.projects[0].id;
  const edited = studioReducer(initialStudioState, { type: "execute", source: "manual", command: { type: "project.update", itemId: id, field: "title", value: "My custom tool" } });
  assert.equal(edited.lastCommandError, null);
  assert.equal(edited.present.content.projects[0].title, "My custom tool");
  const undone = studioReducer(edited, { type: "undo", source: "manual" });
  assert.equal(undone.present.content.projects[0].title, initialStudioState.present.content.projects[0].title);
  const redone = studioReducer(undone, { type: "redo" });
  assert.equal(redone.present.content.projects[0].title, "My custom tool");
  const synced = applySiteCommand(redone.present, { type: "project.syncCatalogToolVersion", itemId: id, versionLabel: "test-v2", title: "Upstream title", summary: "Upstream summary" });
  assert.equal(synced.content.projects[0].title, "My custom tool");
  assert.equal(synced.content.projects[0].installedToolVersion, "test-v2");
});

test("property baseline is captured once, reset is undoable and old documents need no migration", () => {
  const id = initialStudioState.present.content.projects[0].id;
  const original = initialStudioState.present.content.projects[0].title;
  let state = initialStudioState;
  for (const title of ["First edit", "Second edit"]) state = studioReducer(state, { type: "execute", source: "manual", command: { type: "project.update", itemId: id, field: "title", value: title } });
  assert.equal(state.present.content.projects[0].toolPageEdits?.baseline.title, original);
  const reset = studioReducer(state, { type: "execute", source: "manual", command: { type: "project.resetPageProperty", itemId: id, field: "title" } });
  assert.equal(reset.lastCommandError, null);
  assert.equal(reset.present.content.projects[0].title, original);
  assert.equal(Object.hasOwn(reset.present.content.projects[0].toolPageEdits!.baseline, "title"), false);
  assert.equal(studioReducer(reset, { type: "undo", source: "manual" }).present.content.projects[0].title, "Second edit");
});

test("upstream sync and version revert preserve theme, FAQ, input and visibility overrides", () => {
  let doc = initialStudioState.present;
  const id = doc.content.projects[0].id;
  const edits = { toolThemeMode: "light", toolAccentHex: "#123456", toolBackgroundHex: "#f0f0f0", defaultInput: "My input", defaultSecondaryInput: "My context", hideEducationSection: true, hideFaqSection: false, customFaqs: [{ question: "Custom question?", answer: "Custom answer." }], heroHighlights: ["First advantage", "Second advantage"] } as const;
  for (const [field, value] of Object.entries(edits)) doc = applySiteCommand(doc, { type: "project.update", itemId: id, field, value });
  const before = doc.content.projects[0];
  doc = applySiteCommand(doc, { type: "project.syncCatalogToolVersion", itemId: id, versionLabel: "new-release", title: "Upstream" });
  for (const [field, value] of Object.entries(edits)) assert.deepEqual(doc.content.projects[0][field as keyof typeof before], value);
  doc = applySiteCommand(doc, { type: "project.update", itemId: id, field: "customFaqs", value: [] });
  doc = applySiteCommand(doc, { type: "project.update", itemId: id, field: "toolThemeMode", value: "dark" });
  doc = applySiteCommand(doc, { type: "project.revertCatalogToolVersion", itemId: id });
  for (const [field, value] of Object.entries(edits)) assert.deepEqual(doc.content.projects[0][field as keyof typeof before], value);
  assert.deepEqual(doc.content.projects[0].toolPageEdits, before.toolPageEdits);
});

test("selected publication carries property values and reset metadata without leaking unselected draft edits", async () => {
  const { buildPublicationSnapshot } = await import("../../features/website-builder/domain/publication-selection");
  const live = initialStudioState.present;
  const id = live.content.projects[0].id;
  const draft = applySiteCommand(live, { type: "project.update", itemId: id, field: "title", value: "Published customized title" });
  const selected = buildPublicationSnapshot(draft, live, ["projects"]);
  assert.equal(selected.content.projects[0].title, "Published customized title");
  assert.equal(selected.content.projects[0].toolPageEdits?.baseline.title, live.content.projects[0].title);
  const unselected = buildPublicationSnapshot(draft, live, ["design"]);
  assert.equal(unselected.content.projects[0].title, live.content.projects[0].title);
});

test("property metadata is optional for legacy documents and rejects unknown schema versions or keys", async () => {
  const { siteDocumentSchema } = await import("../../features/website-builder/domain/site-document");
  const legacy = structuredClone(initialStudioState.present);
  delete legacy.content.projects[0].toolPageEdits;
  assert.equal(siteDocumentSchema.safeParse(legacy).success, true);
  const project = legacy.content.projects[0];
  const candidate = (metadata: unknown) => ({ ...legacy, content: { ...legacy.content, projects: [{ ...project, toolPageEdits: metadata }, ...legacy.content.projects.slice(1)] } });
  assert.equal(siteDocumentSchema.safeParse(candidate({ schemaVersion: 2, baseline: {} })).success, false);
  assert.equal(siteDocumentSchema.safeParse(candidate({ schemaVersion: 1, baseline: { arbitraryProperty: "x" } })).success, false);
});
