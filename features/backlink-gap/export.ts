import { category } from "./analyze";
import { parseTable } from "./import";
import { emptyMapping, type Field } from "./types";
import type {
  Dataset,
  DatasetInput,
  GapGroup,
  GapReport,
  Review,
} from "./types";
const cell = (v: unknown) =>
  '"' +
  (/^[\s\u0000-\u001f]*[=+@-]/.test(String(v ?? "")) ? "'" : "") +
  String(v ?? "").replace(/"/g, '""') +
  '"';
const csv = (rows: unknown[][]) =>
  "\uFEFF" + rows.map((row) => row.map(cell).join(",")).join("\r\n");
export function gapCsv(
  report: GapReport,
  groups: GapGroup[],
  reviews: Record<string, Review>,
) {
  const competitors = report.datasets.slice(1);
  return csv([
    [
      "Referring group",
      "Grouping",
      "Classification",
      "Your imported records",
      "Competitors matched",
      ...competitors.map((d) => d.site + " imported records"),
      "Review status",
      "Review note",
      "Generated at",
    ],
    ...groups.map((g) => [
      g.key,
      report.grouping,
      category(g),
      g.own.length,
      g.matches,
      ...competitors.map((d) => g.competitors[d.id]?.length || 0),
      reviews[g.key]?.status || "review",
      reviews[g.key]?.note || "",
      report.createdAt,
    ]),
  ]);
}
export function evidenceCsv(report: GapReport, groups: GapGroup[]) {
  const datasets = new Map(report.datasets.map((d) => [d.id, d]));
  const rows: unknown[][] = [
    [
      "Referring group",
      "Assigned website",
      "Data provider",
      "Export date",
      "File or input",
      "Record number",
      "Referring page supplied",
      "Referring host",
      "Target URL supplied",
      "Anchor supplied",
      "Title supplied",
      "Link rel supplied",
      "Relationship interpretation",
      "Imported status",
      "Raw status supplied",
      "Imported metric name",
      "Imported metric value",
      "Verification",
    ],
  ];
  for (const group of groups)
    for (const record of [
      ...group.own,
      ...Object.values(group.competitors).flat(),
    ]) {
      const d = datasets.get(record.datasetId)!;
      rows.push([
        group.key,
        d.site,
        d.provider,
        d.date,
        d.name,
        record.record,
        record.sourceUrl,
        record.host,
        record.target,
        record.anchor,
        record.title,
        record.rel.join(" "),
        record.relationship,
        record.state,
        record.rawState,
        record.metricName,
        record.metric,
        "Imported evidence; not live verified",
      ]);
    }
  return csv(rows);
}
export function issuesCsv(datasets: Dataset[]) {
  return csv([
    ["Assigned website", "Input", "Record", "Reason", "Source value"],
    ...datasets.flatMap((d) =>
      d.issues.map((issue) => [
        d.site,
        d.name,
        issue.record,
        issue.reason,
        issue.value,
      ]),
    ),
  ]);
}
export function verificationSources(group: GapGroup) {
  return [
    ...new Set(
      Object.values(group.competitors)
        .flat()
        .map((r) => r.sourceUrl)
        .filter(Boolean),
    ),
  ];
}
export type Project = {
  version: 1;
  inputs: DatasetInput[];
  grouping: GapReport["grouping"];
  includeInactive: boolean;
  reviews: Record<string, Review>;
};
export function readProject(text: string): Project {
  if (text.length > 14_000_000)
    throw new Error("Choose a project smaller than 14 MB.");
  let data: Project;
  try {
    data = JSON.parse(text);
  } catch {
    throw new Error("This project is not valid JSON.");
  }
  if (
    !data ||
    typeof data !== "object" ||
    data.version !== 1 ||
    !Array.isArray(data.inputs) ||
    data.inputs.length < 2 ||
    data.inputs.length > 6 ||
    data.inputs[0]?.id !== "own" ||
    !["domain", "host"].includes(data.grouping) ||
    typeof data.includeInactive !== "boolean"
  )
    throw new Error(
      "Choose a version 1 backlink gap project with your site and one to five competitors.",
    );
  if (
    data.inputs.some(
      (d) => !d || typeof d !== "object" || typeof d.id !== "string",
    ) ||
    new Set(data.inputs.map((d) => d.id)).size !== data.inputs.length ||
    data.inputs.some((d) => !/^own$|^competitor-[a-z0-9-]+$/.test(d.id))
  )
    throw new Error("The project contains invalid dataset identifiers.");
  let total = 0;
  for (const d of data.inputs) {
    if (
      typeof d.text !== "string" ||
      d.text.length > 2_000_000 ||
      typeof d.site !== "string" ||
      d.site.length > 2048 ||
      typeof d.provider !== "string" ||
      d.provider.length > 100 ||
      typeof d.date !== "string" ||
      d.date.length > 20 ||
      typeof d.name !== "string" ||
      d.name.length > 300 ||
      typeof d.emptyConfirmed !== "boolean"
    )
      throw new Error(
        "The project contains invalid or oversized input fields.",
      );
    total += d.text.length;
    // Rebuild the grid from raw text, then validate and restore only the mapping choices.
    const saved = d.table;
    if (d.text.trim()) {
      d.table = parseTable(
        d.text,
        typeof saved?.hasHeader === "boolean" ? saved.hasHeader : undefined,
      );
      if (saved?.mapping) {
        for (const field of Object.keys(emptyMapping) as Field[]) {
          const value = saved.mapping[field];
          if (
            !Number.isInteger(value) ||
            value < -1 ||
            value >= d.table.headers.length
          )
            throw new Error("The project contains an invalid column mapping.");
          d.table.mapping[field] = value;
        }
      }
    } else d.table = null;
  }
  if (total > 12_000_000)
    throw new Error("The project's combined source text exceeds 12 MB.");
  if (
    !data.reviews ||
    typeof data.reviews !== "object" ||
    Array.isArray(data.reviews) ||
    Object.keys(data.reviews).length > 30000
  )
    throw new Error("The saved review format is invalid.");
  for (const [domain, review] of Object.entries(data.reviews))
    if (
      domain.length > 253 ||
      !review ||
      !["review", "shortlist", "skip"].includes(review.status) ||
      typeof review.note !== "string" ||
      review.note.length > 1000
    )
      throw new Error("A saved review contains invalid fields.");
  return data;
}
export const exampleInputs: Pick<
  DatasetInput,
  "id" | "site" | "provider" | "date" | "name" | "text"
>[] = [
  {
    id: "own",
    site: "https://your-site.example",
    provider: "Illustrative example",
    date: "2026-10-26",
    name: "Own-site sample",
    text: "Site\nshared.example\nyour-publisher.example",
  },
  {
    id: "competitor-one",
    site: "https://competitor-one.example",
    provider: "Illustrative example",
    date: "2026-10-26",
    name: "Competitor one sample",
    text: "Referring page URL,Target URL,Anchor,Nofollow,Status\nhttps://journal.example/resources,https://competitor-one.example/guide,Research guide,false,Live\nhttps://shared.example/roundup,https://competitor-one.example/,A useful site,true,Live\nhttps://old.example/article,https://competitor-one.example/,Older mention,false,Lost",
  },
  {
    id: "competitor-two",
    site: "https://competitor-two.example",
    provider: "Illustrative example",
    date: "2026-10-26",
    name: "Competitor two sample",
    text: "Source URL,Target URL,Anchor,rel,Status\nhttps://journal.example/resources,https://competitor-two.example/guide,Another guide,nofollow,Live\nhttps://directory.example/list,https://competitor-two.example/,Useful service,sponsored,Live",
  },
];
