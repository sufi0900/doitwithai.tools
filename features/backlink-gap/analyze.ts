import { sourceIdentity } from "./import";
import type { Dataset, Evidence, GapGroup, GapReport, Review } from "./types";
export function buildGap(
  datasets: Dataset[],
  grouping: GapReport["grouping"] = "domain",
  includeInactive = false,
): GapReport {
  if (datasets.length < 2 || datasets.length > 6 || datasets[0].id !== "own")
    throw new Error("Compare your own dataset with one to five competitors.");
  if (
    new Set(datasets.map((d) => d.id)).size !== datasets.length ||
    new Set(datasets.map((d) => d.site)).size !== datasets.length
  )
    throw new Error(
      "Use a different website for your site and each competitor.",
    );
  const owned = new Set(datasets.map((d) => d.site)),
    groups = new Map<string, GapGroup>();
  let excludedInactive = 0,
    excludedSites = 0;
  for (const dataset of datasets)
    for (const record of dataset.rows) {
      if (owned.has(record.domain)) {
        excludedSites++;
        continue;
      }
      // Own-site observations retain membership, even if old or marked lost. Presentation filters cannot invent a missing domain.
      if (
        dataset.id !== "own" &&
        !includeInactive &&
        record.state === "inactive"
      ) {
        excludedInactive++;
        continue;
      }
      const key = grouping === "domain" ? record.domain : record.host;
      let group = groups.get(key);
      if (!group) {
        group = { key, own: [], competitors: {}, matches: 0, records: 0 };
        groups.set(key, group);
      }
      if (dataset.id === "own") group.own.push(record);
      else (group.competitors[dataset.id] ??= []).push(record);
      group.records++;
    }
  for (const group of groups.values())
    group.matches = Object.keys(group.competitors).length;
  return {
    datasets,
    groups: [...groups.values()].sort(
      (a, b) => b.matches - a.matches || a.key.localeCompare(b.key),
    ),
    grouping,
    includeInactive,
    excludedInactive,
    excludedSites,
    createdAt: new Date().toISOString(),
  };
}
export type Filters = {
  kind: "all" | "missing" | "shared" | "own-only" | "all-competitors";
  minimum: number;
  query: string;
  relationship: "any" | Evidence["relationship"];
  excluded: string;
  review: "any" | Review["status"];
};
export const defaultFilters: Filters = {
  kind: "missing",
  minimum: 1,
  query: "",
  relationship: "any",
  excluded: "",
  review: "any",
};
export function filterGroups(
  report: GapReport,
  filters: Filters,
  reviews: Record<string, Review>,
) {
  const excluded = new Set(
    filters.excluded
      .split(/[\s,]+/)
      .filter(Boolean)
      .map((v) => {
        try {
          const id = sourceIdentity(v);
          return report.grouping === "domain" ? id.domain : id.host;
        } catch {
          return v.toLowerCase();
        }
      }),
  );
  const query = filters.query.trim().toLowerCase();
  return report.groups.filter((g) => {
    if (excluded.has(g.key)) return false;
    if (filters.kind === "missing" && (g.own.length || !g.matches))
      return false;
    if (filters.kind === "shared" && (!g.own.length || !g.matches))
      return false;
    if (filters.kind === "own-only" && (!g.own.length || g.matches))
      return false;
    if (
      filters.kind === "all-competitors" &&
      (g.own.length || g.matches !== report.datasets.length - 1)
    )
      return false;
    if (
      filters.kind !== "own-only" &&
      (filters.kind !== "all" || filters.minimum > 1) &&
      g.matches < filters.minimum
    )
      return false;
    const competitorRows = Object.values(g.competitors).flat();
    if (
      filters.kind !== "own-only" &&
      filters.relationship !== "any" &&
      !competitorRows.some((r) => r.relationship === filters.relationship)
    )
      return false;
    if (
      filters.review !== "any" &&
      (reviews[g.key]?.status || "review") !== filters.review
    )
      return false;
    if (
      query &&
      !`${g.key} ${[...g.own, ...competitorRows].map((r) => r.anchor + " " + r.title + " " + r.sourceUrl).join(" ")}`
        .toLowerCase()
        .includes(query)
    )
      return false;
    return true;
  });
}
export const category = (g: GapGroup) =>
  !g.own.length
    ? "Missing from your export"
    : g.matches
      ? "Shared in supplied exports"
      : "Only in your export";
