import { safeSourceUrl, type EvidenceInput } from "../content-evidence/analyze";
export type Decision = {
  purpose: "unknown" | "editorial" | "paid" | "ugc";
  action: "pending" | "keep" | "update" | "remove";
  note: string;
};
export const EMPTY_DECISION: Decision = {
  purpose: "unknown",
  action: "pending",
  note: "",
};
export type LinkRow = {
  id: string;
  href: string;
  host: string;
  anchor: string;
  rel: string[];
  context: string;
  section: string;
  generic: boolean;
  classification: "External" | "Origin unknown";
  occurrences: number;
};
export function inspectLinks(page: EvidenceInput) {
  const base = safeSourceUrl(page.url),
    origin = base ? new URL(base).origin : "";
  const contexts = new Map<string, { text: string; section: string }>();
  let section = "Opening content";
  for (const block of page.blocks) {
    if (/^h[1-6]$/.test(block.tag)) section = block.text;
    contexts.set(block.id, { text: block.text, section });
  }
  const counts = new Map<string, number>();
  for (const link of page.links) {
    const safe = safeSourceUrl(link.href);
    if (safe) counts.set(safe, (counts.get(safe) || 0) + 1);
  }
  const rows: LinkRow[] = [];
  page.links.forEach((link, index) => {
    const href = safeSourceUrl(link.href);
    if (!href) return;
    const url = new URL(href);
    if (origin && url.origin === origin) return;
    const context = contexts.get(link.blockId || "");
    rows.push({
      id: `link:${index}`,
      href,
      host: url.host,
      anchor: link.text,
      rel: [
        ...new Set(
          link.rel
            .toLowerCase()
            .split(/[\s,]+/)
            .filter(Boolean),
        ),
      ],
      context: context?.text || "",
      section: context?.section || "Context not retained",
      generic:
        !link.text.trim() ||
        /^(?:here|click here|read more|learn more|source|link|website|visit)$/i.test(
          link.text.trim(),
        ),
      classification: origin ? "External" : "Origin unknown",
      occurrences: counts.get(href) || 1,
    });
  });
  return rows;
}
export function relationshipAdvice(row: LinkRow, decision: Decision): string {
  const nofollow = row.rel.includes("nofollow");
  if (decision.purpose === "paid")
    return row.rel.includes("sponsored") || nofollow
      ? "Paid-link qualification is present. Check that the declared relationship matches the placement."
      : "You identified a paid placement. Add sponsored, or the accepted nofollow alternative, in your website editor.";
  if (decision.purpose === "ugc")
    return row.rel.includes("ugc") || nofollow
      ? "A user-generated or nofollow qualification is present. Review whether it matches your content policy."
      : "You identified user-generated content. Review whether ugc or nofollow should qualify this link.";
  return "Ordinary editorial links do not require a special rel value. Decide based on the actual relationship, not the destination's name.";
}
export function linksCsv(rows: LinkRow[], decisions: Record<string, Decision>) {
  const cell = (text: string) =>
    '"' +
    (/^[\s\u0000-\u001f]*[=+@-]/.test(text) ? "'" : "") +
    text.replace(/"/g, '""') +
    '"';
  const data = [
    [
      "Destination",
      "Host",
      "Anchor",
      "Section",
      "Source context",
      "rel",
      "Classification",
      "Occurrences on page",
      "Purpose supplied by reviewer",
      "Saved decision",
      "Reviewer note",
      "Destination status",
    ],
  ];
  for (const row of rows) {
    const d = decisions[row.id] || EMPTY_DECISION;
    data.push([
      row.href,
      row.host,
      row.anchor,
      row.section,
      row.context,
      row.rel.join(" "),
      row.classification,
      String(row.occurrences),
      d.purpose,
      d.action,
      d.note,
      "Not fetched",
    ]);
  }
  return data.map((row) => row.map(cell).join(",")).join("\r\n");
}
