import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import {
  countArticlesByKeyword,
  deriveArticleStatus,
  reconcileKeywordStatuses,
  type StudioArticleEntry,
} from "../lib/studio/article-library";
import {
  buildSocialInfographicConfigFromProject,
  buildStandaloneCampaignProject,
  SOCIAL_INFOGRAPHIC_STYLES,
} from "../lib/studio/social-infographic-bridge";
import { buildInfographicScene } from "../lib/blog-infographic-studio/canvas-renderer";
import { blankProject, syncDocument } from "../features/writer-workspace/model";
import type { Project } from "../features/writer-workspace/types";
import type { SavedKeywordItem } from "../lib/studio/types";

const ROOT = path.resolve(__dirname, "..");

function makeKeyword(
  overrides: Partial<SavedKeywordItem> = {},
): SavedKeywordItem {
  return {
    id: "kw-1",
    siteId: "site-1",
    keyword: "ai seo audit checklist",
    clusterName: "Technical SEO",
    intent: "informational",
    kdEstimate: 22,
    suggestedTitle: "AI SEO Audit Checklist (2026)",
    suggestedSlug: "ai-seo-audit-checklist",
    status: "backlog",
    createdAtIso: "2026-11-26T10:00:00.000Z",
    ...overrides,
  };
}

function makeProject(overrides: Partial<Project> = {}): Project {
  const base = blankProject();
  return {
    ...base,
    projectId: "proj-test-1",
    ...overrides,
  };
}

test("deriveArticleStatus accurately classifies brief, in-progress, written, and published", () => {
  const briefProj = makeProject();
  assert.equal(deriveArticleStatus(briefProj, new Set()).status, "brief");

  const doc = {
    type: "doc",
    content: [
      {
        type: "paragraph",
        content: [
          {
            type: "text",
            text: "Just a few starter notes while drafting.",
          },
        ],
      },
    ],
  };
  const inProgressProj = syncDocument(
    makeProject({
      projectId: "proj-prog",
      writerWorkspace: {
        ...blankProject().writerWorkspace!,
        run: { status: "paused", inputHash: "abc", completed: [] },
        document: doc,
      },
    }),
    doc,
  );
  assert.equal(
    deriveArticleStatus(inProgressProj, new Set()).status,
    "in-progress",
  );

  // 320 manually written words counts as "written" even with run.status === "idle"
  const longText = Array.from({ length: 320 }, () => "keyword").join(" ");
  const longDoc = {
    type: "doc",
    content: [{ type: "paragraph", content: [{ type: "text", text: longText }] }],
  };
  const manualWrittenProj = syncDocument(
    makeProject({
      projectId: "proj-manual-written",
      writerWorkspace: {
        ...blankProject().writerWorkspace!,
        document: longDoc,
      },
    }),
    longDoc,
  );
  assert.equal(
    deriveArticleStatus(manualWrittenProj, new Set()).status,
    "written",
  );

  const writtenProj = makeProject({
    projectId: "proj-written",
    writerWorkspace: {
      ...blankProject().writerWorkspace!,
      run: { status: "done", inputHash: "abc", completed: ["sec-1"] },
    },
  });
  assert.equal(deriveArticleStatus(writtenProj, new Set()).status, "written");

  assert.equal(
    deriveArticleStatus(writtenProj, new Set(["proj-written"])).status,
    "published",
  );
});

test("reconcileKeywordStatuses transitions statuses, handles multiple articles per keyword, and resets deleted articles", () => {
  const articles: StudioArticleEntry[] = [
    {
      projectId: "proj-old-draft",
      title: "Old Draft",
      primaryKeyword: "ai seo audit checklist",
      siteUrl: "https://doitwithai.tools",
      updatedAtIso: "2026-11-26T09:00:00.000Z",
      wordCount: 80,
      status: "in-progress",
    },
    {
      projectId: "proj-published",
      title: "Published Guide",
      primaryKeyword: "ai seo audit checklist",
      siteUrl: "https://doitwithai.tools",
      updatedAtIso: "2026-11-26T12:00:00.000Z",
      wordCount: 1650,
      status: "published",
    },
    {
      projectId: "proj-written-2",
      title: "Drafted & Finished",
      primaryKeyword: "programmatic seo guide",
      siteUrl: "https://doitwithai.tools",
      updatedAtIso: "2026-11-26T11:00:00.000Z",
      wordCount: 1400,
      status: "written",
    },
  ];

  const counts = countArticlesByKeyword(articles);
  assert.equal(counts["ai seo audit checklist"], 2);
  assert.equal(counts["programmatic seo guide"], 1);

  const keywords: SavedKeywordItem[] = [
    // Multiple articles exist for same keyword: prefers highest progress ("published")
    makeKeyword({ id: "k1", status: "backlog" }),
    // Linked directly by ID
    makeKeyword({
      id: "k2",
      keyword: "programmatic seo guide",
      status: "drafting",
      articleProjectId: "proj-written-2",
    }),
    // Linked article was deleted -> resets cleanly to backlog
    makeKeyword({
      id: "k3",
      keyword: "deleted topic keyword",
      status: "written",
      articleProjectId: "proj-deleted-404",
    }),
  ];

  const reconciled = reconcileKeywordStatuses(keywords, articles);
  assert.ok(reconciled, "expected reconciled keywords to differ");
  assert.equal(reconciled![0]!.status, "published");
  assert.equal(reconciled![0]!.articleProjectId, "proj-published");
  assert.equal(reconciled![1]!.status, "written");
  assert.equal(reconciled![1]!.articleProjectId, "proj-written-2");
  assert.equal(reconciled![2]!.status, "backlog");
  assert.equal(reconciled![2]!.articleProjectId, undefined);

  // Calling again returns null when already in sync
  assert.equal(reconcileKeywordStatuses(reconciled!, articles), null);
});

test("Studio V2 UI & ToolsShell source guards prevent regressions", () => {
  const shellSrc = fs.readFileSync(
    path.join(ROOT, "features/studio/StudioShell.tsx"),
    "utf8",
  );
  assert.equal(shellSrc.includes("Primary Focus"), false);
  assert.equal(shellSrc.includes("Content Writer & Ideas"), false);
  assert.ok(shellSrc.includes('"Content Writer"'));

  const vaultSrc = fs.readFileSync(
    path.join(ROOT, "features/studio/StudioVaultClient.tsx"),
    "utf8",
  );
  assert.equal(vaultSrc.includes("Run Inside Dashboard"), false);
  assert.equal(vaultSrc.includes("Apply with Matched Tool"), false);
  assert.equal(vaultSrc.includes("without leaving Studio"), false);
  assert.ok(vaultSrc.includes("Open Playbook"));

  const toolsShellSrc = fs.readFileSync(
    path.join(ROOT, "features/tools-workspace/ToolsShell.tsx"),
    "utf8",
  );
  assert.equal(
    toolsShellSrc.includes(".diwai-embedded-tool-root > div > section"),
    false,
  );
  assert.equal(
    toolsShellSrc.includes(".diwai-embedded-tool-root > div > div + div"),
    false,
  );
  assert.ok(toolsShellSrc.includes("interactiveIndices.length === 0"));

  const drawerSrc = fs.readFileSync(
    path.join(ROOT, "features/studio/StudioGlobalDrawer.tsx"),
    "utf8",
  );
  assert.equal(drawerSrc.includes("zero context loss"), false);
  assert.ok(drawerSrc.includes('drawer.type !== "open-copilot"'));

  const inlinePanelSrc = fs.readFileSync(
    path.join(ROOT, "features/studio/StudioInlineEmbedPanel.tsx"),
    "utf8",
  );
  assert.ok(inlinePanelSrc.includes('item.type === "playbook"'));

  assert.ok(vaultSrc.includes("Back to Tools"));
  assert.ok(vaultSrc.includes("StudioInlineEmbedPanel"));

  const writerSrc = fs.readFileSync(
    path.join(ROOT, "features/studio/StudioWriterClient.tsx"),
    "utf8",
  );
  assert.equal(writerSrc.includes("Fullscreen"), false);
  assert.ok(writerSrc.includes('viewMode === "table"'));
  assert.ok(
    writerSrc.includes("Search by article title, meta title, or keyword"),
  );
  assert.ok(writerSrc.includes('role="listbox"'));

  // Sidebar dedicated Social & Email studios
  assert.ok(shellSrc.includes("/studio/social"));
  assert.ok(shellSrc.includes("/studio/email"));
  for (const ch of ["Instagram", "Facebook", "LinkedIn", "YouTube"]) {
    assert.ok(shellSrc.includes(ch), `Expected sidebar channel link: ${ch}`);
  }

  const workspaceProviderSrc = fs.readFileSync(
    path.join(ROOT, "features/tools-workspace/WorkspaceProvider.tsx"),
    "utf8",
  );
  assert.equal(
    workspaceProviderSrc.includes(
      "Your saved tools could not load. Reload this page to retry.",
    ),
    false,
  );
});

test("Social & Email Infographic Bridge renders 4 distinct high-craft SVG templates for articles and standalone campaigns", () => {
  const standalone = buildStandaloneCampaignProject({
    keyword: "ai seo workflow",
    title: "AI SEO Workflow Blueprint",
    angle: "Four steps to build compounding search visibility.",
  });

  assert.equal(standalone.sections.length, 4);
  assert.equal(SOCIAL_INFOGRAPHIC_STYLES.length, 4);

  const usedTemplates = new Set<number>();
  for (const style of SOCIAL_INFOGRAPHIC_STYLES) {
    const cfg = buildSocialInfographicConfigFromProject(standalone, {
      channel: "Instagram",
      templateId: style.portraitTemplateId,
      paletteId: style.defaultPaletteId,
    });
    usedTemplates.add(cfg.templateId);
    const scene = buildInfographicScene(cfg);
    assert.ok(scene.svg.startsWith("<svg"), `Expected SVG for ${style.id}`);
    assert.ok(
      scene.svg.includes("AI SEO Workflow Blueprint") ||
        scene.svg.includes("Clarify") ||
        scene.svg.includes(cfg.headline),
      `Expected content inside SVG for ${style.id}`,
    );
  }
  assert.equal(usedTemplates.size, 4);
});
