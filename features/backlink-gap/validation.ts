import { sourceIdentity } from "./import";
import type { DatasetInput } from "./types";

export type DatasetProblems = { site?: string; data?: string };
export type InputProblems = Record<string, DatasetProblems>;

export function requiredInputProblems(inputs: DatasetInput[]): InputProblems {
  const problems: InputProblems = {};
  const sites = new Set<string>();
  for (const input of inputs) {
    const current: DatasetProblems = {};
    try {
      const site = sourceIdentity(input.site).domain;
      if (sites.has(site))
        current.site =
          "This website is already added. Enter a different competitor domain.";
      sites.add(site);
    } catch {
      current.site =
        input.id === "own"
          ? "Enter your website domain, such as yourwebsite.com."
          : "Enter this competitor's website domain, such as competitor.com.";
    }
    if (!input.text.trim() && !(input.id === "own" && input.emptyConfirmed)) {
      current.data =
        "Add backlink data here. Upload a CSV, TSV, or TXT file, or paste linking pages or referring domains.";
    } else if (input.table && input.table.mapping.source < 0) {
      current.data =
        "Choose the referring-page or domain column under Review column mapping.";
    }
    if (Object.keys(current).length) problems[input.id] = current;
  }
  return problems;
}
