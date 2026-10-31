import test from "node:test";
import assert from "node:assert/strict";
import {
  readProject,
  writeProject,
  reviewIssues,
  emptyPlanning,
  safePageUrl,
  type Project,
} from "../../features/keyword-clustering/project";
import {
  createWorkspace,
  moveKeywords,
  mergeGroups,
  exportCsv,
} from "../../features/keyword-clustering/workspace";
import { clusterInputSchema } from "../../features/keyword-clustering/schema";
const source = clusterInputSchema.parse({
  keywords: [
    { id: "k1", text: "title examples" },
    { id: "k2", text: "title generator" },
  ],
});
const group = {
  label: "Title examples",
  primaryId: "k1",
  keywordIds: ["k1"],
  intent: "informational" as const,
  pageType: "guide" as const,
  focus: "Explain title writing with practical contextual examples.",
  rationale: "A focused educational task about writing title tags.",
  review: "Review actual results and existing coverage before drafting.",
};
const result = {
  clusters: [
    group,
    { ...group, label: "Title generator", primaryId: "k2", keywordIds: ["k2"] },
  ],
  unassigned: [],
  review: [
    "Review the actual search results before planning pages.",
    "Review existing coverage for each reader task.",
  ],
};
const project = (): Project => ({
  version: 1,
  name: "Title plan",
  source,
  result,
  workspace: createWorkspace(result),
});
test("portable projects preserve edits, planning decisions and exact keyword coverage", () => {
  const p = project();
  p.workspace.groups[0].planning = {
    action: "update",
    url: "https://example.com/titles",
    notes: "Reviewed intended reader tasks.",
    checked: ["task", "results", "coverage"],
  };
  assert.deepEqual(readProject(writeProject(p)), p);
  assert.match(
    exportCsv(p.workspace, source.keywords),
    /https:\/\/example.com\/titles/,
  );
});
test("project import rejects bad versions, missing terms, foreign IDs and oversized files", () => {
  for (const change of [
    { ...project(), version: 2 },
    { ...project(), workspace: { groups: [], unassigned: [] } },
    {
      ...project(),
      workspace: {
        groups: [{ ...createWorkspace(result).groups[0], keywordIds: ["k99"] }],
        unassigned: [],
      },
    },
  ])
    assert.throws(() => readProject(JSON.stringify(change)));
  assert.throws(() => readProject("x".repeat(250001)));
  assert.throws(() => readProject("not json"));
  const p = project();
  p.workspace.groups[0].planning = {
    ...emptyPlanning(),
    url: "javascript:alert(1)",
  };
  assert.throws(() => writeProject(p));
});
test("URL references accept only credential-free HTTP links and normalize fragments for conflict review", () => {
  assert.equal(
    safePageUrl("https://example.com/titles#section"),
    "https://example.com/titles",
  );
  for (const url of [
    "javascript:alert(1)",
    "data:text/html,x",
    "https://user:password@example.com",
    "/relative",
  ])
    assert.throws(() => safePageUrl(url));
  assert.equal(safePageUrl(""), "");
});
test("review checklist requires concrete page decisions and flags shared URLs without diagnosing cannibalization", () => {
  const p = project(),
    g = p.workspace.groups[0];
  assert.equal(reviewIssues(g, p.workspace).length, 4);
  g.planning = {
    action: "update",
    url: "",
    notes: "",
    checked: ["task", "results", "coverage"],
  };
  assert.match(reviewIssues(g, p.workspace).join(" "), /existing page URL/);
  g.planning.url = "https://example.com/titles";
  assert.equal(reviewIssues(g, p.workspace).length, 0);
  p.workspace.groups[1].planning = {
    ...emptyPlanning(),
    url: "https://example.com/titles#heading",
  };
  assert.match(
    reviewIssues(g, p.workspace).join(" "),
    /Another group uses this URL/,
  );
  g.planning = { ...emptyPlanning(), action: "hold" };
  assert.match(reviewIssues(g, p.workspace).join(" "), /Explain why/);
});
test("membership changes reset review checks and undo snapshots retain the original decisions", () => {
  const p = project();
  p.workspace.groups[0].planning = {
    action: "update",
    url: "https://example.com/titles",
    notes: "Reviewed",
    checked: ["task", "results", "coverage"],
  };
  p.workspace.groups[1].planning = { ...emptyPlanning(), checked: ["task"] };
  const moved = moveKeywords(p.workspace, ["k1"], "g2");
  assert.deepEqual(moved.groups[0].planning?.checked, []);
  assert.equal(p.workspace.groups[0].planning?.checked.length, 3);
});

test("merging preserves source research notes and blocks oversized combined notes", () => {
  const p = project();
  p.workspace.groups[0].planning = {
    ...emptyPlanning(),
    url: "https://example.com/source",
    notes: "Evidence from the source group.",
  };
  const merged = mergeGroups(p.workspace, "g1", "g2");
  assert.match(
    merged.groups[0].planning!.notes,
    /Evidence from the source group/,
  );
  assert.match(
    merged.groups[0].planning!.notes,
    /https:\/\/example.com\/source/,
  );
  p.workspace.groups[1].planning = {
    ...emptyPlanning(),
    notes: "x".repeat(1950),
  };
  assert.throws(() => mergeGroups(p.workspace, "g1", "g2"));
  assert.equal(p.workspace.groups.length, 2);
});
