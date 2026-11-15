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
