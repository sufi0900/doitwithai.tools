import type { ClusterInput, ClusterOutput } from "./schema";
export type Group = ClusterOutput["clusters"][number] & {
  id: string;
  edited: boolean;
};
export type Workspace = {
  groups: Group[];
  unassigned: ClusterOutput["unassigned"];
};
export function createWorkspace(result: ClusterOutput): Workspace {
  return {
    groups: result.clusters.map((g, i) => ({
      ...g,
      id: `g${i + 1}`,
      edited: false,
      keywordIds: [...g.keywordIds],
    })),
    unassigned: result.unassigned.map((k) => ({ ...k })),
  };
}
export function assertCoverage(
  workspace: Workspace,
  keywords: ClusterInput["keywords"],
) {
  const ids = [
    ...workspace.groups.flatMap((g) => g.keywordIds),
    ...workspace.unassigned.map((k) => k.keywordId),
  ];
  if (
    ids.length !== keywords.length ||
    new Set(ids).size !== ids.length ||
    keywords.some((k) => !ids.includes(k.id))
  )
    throw Error("Keyword coverage changed");
  if (
    new Set(workspace.groups.map((g) => g.id)).size !==
      workspace.groups.length ||
    workspace.groups.some(
      (g) => !g.keywordIds.length || !g.keywordIds.includes(g.primaryId),
    )
  )
    throw Error("Invalid group membership");
}
export function moveKeywords(
  workspace: Workspace,
  ids: string[],
  target: string,
): Workspace {
  const available = new Set([
    ...workspace.groups.flatMap((g) => g.keywordIds),
    ...workspace.unassigned.map((k) => k.keywordId),
  ]);
  if (
    !ids.length ||
    new Set(ids).size !== ids.length ||
    ids.some((id) => !available.has(id))
  )
    throw Error("Choose valid keywords");
  if (target !== "review" && !workspace.groups.some((g) => g.id === target))
    throw Error("Choose a destination group");
  const moving = new Set(ids);
  const groups = workspace.groups
    .map((g) => {
      const retained = g.keywordIds.filter((id) => !moving.has(id));
      const members = g.id === target ? [...retained, ...ids] : retained;
      const changed = members.join("|") !== g.keywordIds.join("|");
      return {
        ...g,
        keywordIds: members,
        primaryId: members.includes(g.primaryId) ? g.primaryId : members[0],
        edited: g.edited || changed,
      };
    })
    .filter((g) => g.keywordIds.length);
  const unassigned = workspace.unassigned.filter(
    (k) => !moving.has(k.keywordId),
  );
  if (target === "review")
    unassigned.push(
      ...ids.map((keywordId) => ({
        keywordId,
        reason: "Moved here for human review.",
      })),
    );
  return { groups, unassigned };
}
export function splitGroup(
  workspace: Workspace,
  ids: string[],
  label: string,
): Workspace {
  if (!label.trim()) throw Error("Name the new group");
  let n = 1;
  while (workspace.groups.some((g) => g.id === `local${n}`)) n++;
  const group: Group = {
    id: `local${n}`,
    label: label.trim(),
    primaryId: ids[0],
    keywordIds: [],
    intent: "unclear",
    pageType: "needs review",
    focus: "",
    rationale: "Manually created from selected keywords.",
    review: "Review the grouping, primary keyword and content focus.",
    edited: true,
  };
  return moveKeywords(
    { ...workspace, groups: [...workspace.groups, group] },
    ids,
    group.id,
  );
}
export function mergeGroups(
  workspace: Workspace,
  source: string,
  target: string,
) {
  if (source === target || target === "review")
    throw Error("Choose a different group to merge into");
  const group = workspace.groups.find((g) => g.id === source);
  if (!group) throw Error("Source group missing");
  return moveKeywords(workspace, group.keywordIds, target);
}
const csvCell = (text: string) =>
  `"${(/^[\s]*[=+\-@]/.test(text) ? "'" + text : text).replace(/"/g, '""')}"`;
export function exportCsv(
  workspace: Workspace,
  keywords: ClusterInput["keywords"],
) {
  assertCoverage(workspace, keywords);
  const map = new Map(keywords.map((k) => [k.id, k.text]));
  const rows = [
    [
      "Keyword",
      "Group",
      "Primary keyword",
      "Tentative intent",
      "Suggested format",
      "Content focus",
      "Review note",
    ],
  ];
  for (const g of workspace.groups)
    for (const id of g.keywordIds)
      rows.push([
        map.get(id)!,
        g.label,
        map.get(g.primaryId)!,
        g.intent,
        g.pageType,
        g.focus,
        g.edited ? "Manually edited. Review the group again." : g.review,
      ]);
  for (const k of workspace.unassigned)
    rows.push([
      map.get(k.keywordId)!,
      "Review queue",
      "",
      "unclear",
      "needs review",
      "",
      k.reason,
    ]);
  return rows.map((row) => row.map(csvCell).join(",")).join("\r\n");
}
export function groupBrief(g: Group, keywords: ClusterInput["keywords"]) {
  const map = new Map(keywords.map((k) => [k.id, k.text]));
  return `${g.label}\nPrimary keyword: ${map.get(g.primaryId)}\nTentative intent: ${g.intent}\nSuggested format: ${g.pageType}\nContent focus: ${g.focus || "Add a content focus before drafting."}\nSupporting keywords:\n${g.keywordIds
    .filter((id) => id !== g.primaryId)
    .map((id) => `- ${map.get(id)}`)
    .join(
      "\n",
    )}\nReview: ${g.edited ? "Manually edited. Check the grouping and reader task again." : g.review}`;
}
export function exportPlan(
  workspace: Workspace,
  keywords: ClusterInput["keywords"],
) {
  assertCoverage(workspace, keywords);
  return `# Draft keyword plan\n\nSemantic suggestions and manual edits. Validate intent and existing pages before publishing.\n\n${workspace.groups.map((g) => `## ${groupBrief(g, keywords)}`).join("\n\n")}\n\n## Review queue\n${workspace.unassigned.map((k) => `- ${keywords.find((x) => x.id === k.keywordId)?.text}: ${k.reason}`).join("\n")}`;
}
