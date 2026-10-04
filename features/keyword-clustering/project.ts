import { z } from "zod";
import {
  clusterInputSchema,
  clusterOutputSchema,
  validateClusterOutput,
  intents,
  pageTypes,
  type ClusterInput,
  type ClusterOutput,
} from "./schema";
import { assertCoverage, type Workspace, type Group } from "./workspace";
export const actions = ["undecided", "create", "update", "hold"] as const;
export const checks = ["task", "results", "coverage"] as const;
export type Planning = {
  action: (typeof actions)[number];
  url: string;
  notes: string;
  checked: (typeof checks)[number][];
};
export const emptyPlanning = (): Planning => ({
  action: "undecided",
  url: "",
  notes: "",
  checked: [],
});
export function safePageUrl(value: string) {
  if (!value.trim()) return "";
  try {
    const url = new URL(value.trim());
    if (
      !["https:", "http:"].includes(url.protocol) ||
      url.username ||
      url.password
    )
      throw Error();
    url.hash = "";
    return url.href;
  } catch {
    throw Error("Use a complete HTTP or HTTPS page URL without credentials.");
  }
}
const planningSchema = z
  .object({
    action: z.enum(actions),
    url: z.string().max(2000),
    notes: z.string().max(2000),
    checked: z.array(z.enum(checks)).max(3),
  })
  .strict()
  .superRefine((p, ctx) => {
    if (new Set(p.checked).size !== p.checked.length)
      ctx.addIssue({ code: "custom", message: "Repeated review checks" });
    try {
      safePageUrl(p.url);
    } catch {
      ctx.addIssue({ code: "custom", message: "Invalid page URL" });
    }
  });
const editableGroup = z
  .object({
    id: z
      .string()
      .regex(/^(g|local)[1-9]\d*$/)
      .max(20),
    edited: z.boolean(),
    label: z.string().max(100),
    primaryId: z.string().max(5),
    keywordIds: z.array(z.string().max(5)).min(1).max(80),
    intent: z.enum(intents),
    pageType: z.enum(pageTypes),
    focus: z.string().max(1000),
    rationale: z.string().max(350),
    review: z.string().max(350),
    planning: planningSchema.optional(),
  })
  .strict();
const projectSchema = z
  .object({
    version: z.literal(1),
    name: z.string().trim().min(1).max(100),
    source: clusterInputSchema,
    result: clusterOutputSchema,
    workspace: z
      .object({
        groups: z.array(editableGroup).max(80),
        unassigned: clusterOutputSchema.shape.unassigned,
      })
      .strict(),
  })
  .strict();
export type Project = {
  version: 1;
  name: string;
  source: ClusterInput;
  result: ClusterOutput;
  workspace: Workspace;
};
export const storageKey = "doitwithai.keyword-clustering.project.v1";
export function readProject(text: string): Project {
  if (new TextEncoder().encode(text).length > 250_000)
    throw Error("Choose a project file under 250 KB.");
  const parsed = projectSchema.safeParse(JSON.parse(text));
  if (!parsed.success)
    throw Error(
      "Project fields are invalid. Check the name, page URLs, and saved draft structure.",
    );
  const p = parsed.data;
  validateClusterOutput(p.result, p.source.keywords);
  assertCoverage(p.workspace, p.source.keywords);
  return p as Project;
}
export function writeProject(project: Project) {
  const text = JSON.stringify(project, null, 2);
  readProject(text);
  return text;
}
export function reviewIssues(group: Group, workspace: Workspace) {
  const p = group.planning || emptyPlanning();
  const issues: string[] = [];
  if (!group.label.trim()) issues.push("Add a group name.");
  if (!group.focus.trim())
    issues.push("Define the reader task in the content focus.");
  if (group.intent === "unclear" || group.intent === "mixed")
    issues.push("Resolve or explain the tentative intent.");
  if (p.action === "undecided") issues.push("Choose a page decision.");
  if (p.action === "update" && !p.url.trim())
    issues.push("Add the existing page URL.");
  if (p.action === "hold" && !p.notes.trim())
    issues.push("Explain why this group is on hold.");
  let url = "";
  try {
    url = safePageUrl(p.url);
  } catch {
    issues.push("Check the page URL format.");
  }
  if (
    url &&
    workspace.groups.some(
      (g) =>
        g.id !== group.id &&
        g.planning?.url &&
        (() => {
          try {
            return safePageUrl(g.planning.url) === url;
          } catch {
            return false;
          }
        })(),
    )
  )
    issues.push(
      "Another group uses this URL. Review whether their tasks belong together.",
    );
  for (const check of checks)
    if (!p.checked.includes(check))
      issues.push(
        {
          task: "Review the reader task and keyword membership.",
          results: "Review actual search results outside this tool.",
          coverage: "Review existing content before deciding on a page.",
        }[check],
      );
  return issues;
}
