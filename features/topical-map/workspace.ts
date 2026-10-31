import { z } from "zod";
import {
  nodeSchema,
  inputSchema,
  validateTree,
  decisions,
  type MapNode,
  type MapInput,
  type MapOutput,
} from "./schema";
export type Topic = MapNode & {
  decision: (typeof decisions)[number];
  url: string;
  notes: string;
  reviewed: boolean;
  edited: boolean;
};
export const toTopics = (result: MapOutput): Topic[] =>
  result.nodes.map((n) => ({
    ...n,
    relatedKeywords: [...n.relatedKeywords],
    decision: "research",
    url: "",
    notes: "",
    reviewed: false,
    edited: false,
  }));
export function depth(node: MapNode, nodes: MapNode[]) {
  let d = 0,
    p = node;
  const seen = new Set<string>();
  while (p.parentId) {
    if (seen.has(p.id)) throw Error("Invalid hierarchy");
    seen.add(p.id);
    p = nodes.find((n) => n.id === p.parentId)!;
    if (!p) throw Error("Missing parent");
    d++;
  }
  return d;
}
export function descendants(id: string, nodes: MapNode[]) {
  const ids = new Set([id]);
  let changed = true;
  while (changed) {
    changed = false;
    for (const n of nodes)
      if (n.parentId && ids.has(n.parentId) && !ids.has(n.id)) {
        ids.add(n.id);
        changed = true;
      }
  }
  return ids;
}
export function moveTopic(nodes: Topic[], id: string, parentId: string) {
  const node = nodes.find((n) => n.id === id);
  if (!node || node.parentId === null)
    throw Error("The root topic cannot be moved.");
  if (
    !nodes.some((n) => n.id === parentId) ||
    descendants(id, nodes).has(parentId)
  )
    throw Error("Choose a parent outside this branch.");
  const next = nodes.map((n) => ({
    ...n,
    parentId: n.id === id ? parentId : n.parentId,
    reviewed: false,
    edited: n.edited || n.id === id,
  }));
  validateTree(next);
  return next;
}
export function addTopic(nodes: Topic[], parentId: string) {
  const parent = nodes.find((n) => n.id === parentId);
  if (!parent || depth(parent, nodes) >= 2 || nodes.length >= 25)
    throw Error("Add topics within three levels and 25 nodes.");
  let i = 1;
  while (nodes.some((n) => n.id === `n${i}`)) i++;
  const topic: Topic = {
    id: `n${i}`,
    parentId,
    title: "New topic",
    keyword: "New topic idea",
    relatedKeywords: [],
    intent: "unclear",
    format: "guide",
    focus: "Define the reader task before drafting.",
    why: "Manually added. Review its relationship to the parent.",
    decision: "research",
    url: "",
    notes: "",
    reviewed: false,
    edited: true,
  };
  return [...nodes.map((n) => ({ ...n, reviewed: false })), topic];
}
export function removeTopic(nodes: Topic[], id: string) {
  if (nodes.find((n) => n.id === id)?.parentId === null)
    throw Error("Keep the root topic.");
  if (!nodes.some((n) => n.id === id)) throw Error("Topic missing.");
  const ids = descendants(id, nodes);
  const next = nodes
    .filter((n) => !ids.has(n.id))
    .map((n) => ({ ...n, reviewed: false }));
  validateTree(next);
  return next;
}
export function safeUrl(value: string) {
  if (!value.trim()) return "";
  try {
    const u = new URL(value);
    if (!["https:", "http:"].includes(u.protocol) || u.username || u.password)
      throw Error();
    return u.href;
  } catch {
    throw Error("Use a complete HTTP or HTTPS URL without credentials.");
  }
}
export function ordered(nodes: Topic[]) {
  const root = validateTree(nodes),
    list: Topic[] = [];
  function visit(id: string) {
    list.push(nodes.find((n) => n.id === id)!);
    for (const child of nodes.filter((n) => n.parentId === id)) visit(child.id);
  }
  visit(root.id);
  return list;
}
export function keywords(nodes: Topic[]) {
  return [
    ...new Set(
      ordered(nodes)
        .flatMap((n) => [n.keyword, ...n.relatedKeywords])
        .map((s) => s.trim())
        .filter(Boolean),
    ),
  ].join("\n");
}
export function brief(node: Topic) {
  return `${node.title}\nRepresentative keyword idea: ${node.keyword}\nRelated keyword ideas: ${node.relatedKeywords.join(", ")}\nTentative intent: ${node.intent}\nSuggested format: ${node.format}\nReader task: ${node.focus}\nPage decision: ${node.decision}\nExisting URL: ${node.url || "Not mapped"}\nResearch notes: ${node.notes || "Not recorded"}\nDifficulty and volume: Not verified.`;
}
export function markdown(nodes: Topic[]) {
  return `# Draft topical map\n\nAI-assisted topic suggestions with manual edits. Topic hierarchy does not indicate ranking difficulty. Metrics are not verified.\n\n${ordered(
    nodes,
  )
    .map(
      (n) =>
        `${"#".repeat(depth(n, nodes) + 2)} ${brief(n)}\nHuman review recorded: ${n.reviewed ? "Yes" : "No"}`,
    )
    .join("\n\n")}`;
}
const cell = (s: string) =>
  `"${(/^[\s]*[=+\-@]/.test(s) ? "'" + s : s).replace(/"/g, '""')}"`;
export function csv(nodes: Topic[]) {
  return [
    [
      "Topic",
      "Parent topic",
      "Level",
      "Keyword idea",
      "Related ideas",
      "Tentative intent",
      "Suggested format",
      "Reader task",
      "Page decision",
      "Existing URL",
      "Research notes",
      "Human review",
      "Difficulty",
      "Volume",
    ],
    ...ordered(nodes).map((n) => [
      n.title,
      nodes.find((p) => p.id === n.parentId)?.title || "",
      String(depth(n, nodes) + 1),
      n.keyword,
      n.relatedKeywords.join("; "),
      n.intent,
      n.format,
      n.focus,
      n.decision,
      n.url,
      n.notes,
      n.reviewed ? "Recorded" : "Pending",
      "Not verified",
      "Not verified",
    ]),
  ]
    .map((row) => row.map(cell).join(","))
    .join("\r\n");
}
const editableSchema = nodeSchema
  .extend({
    decision: z.enum(decisions),
    url: z
      .string()
      .max(2000)
      .refine((v) => {
        try {
          safeUrl(v);
          return true;
        } catch {
          return false;
        }
      }),
    notes: z.string().max(2000),
    reviewed: z.boolean(),
    edited: z.boolean(),
  })
  .strict();
const projectSchema = z
  .object({
    version: z.literal(1),
    name: z.string().trim().min(1).max(100),
    source: inputSchema,
    nodes: z.array(editableSchema).min(1).max(25),
    review: z.array(z.string().max(300)).max(5),
  })
  .strict();
export type Project = {
  version: 1;
  name: string;
  source: MapInput;
  nodes: Topic[];
  review: string[];
};
export const storageKey = "doitwithai.topical-map.project.v1";
export function parseProject(text: string): Project {
  if (new TextEncoder().encode(text).length > 250_000)
    throw Error("Use a project under 250 KB.");
  const p = projectSchema.safeParse(JSON.parse(text));
  if (!p.success) throw Error("Project fields or version are invalid.");
  validateTree(p.data.nodes);
  return p.data as Project;
}
export function serializeProject(p: Project) {
  const text = JSON.stringify(p, null, 2);
  parseProject(text);
  return text;
}
