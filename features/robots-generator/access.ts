import { parseRobotsTxt } from "./generator";
import type { RobotsState } from "./types";
export type PathAccess = {
  status: "allowed" | "blocked" | "unknown";
  matchedAgent: string;
  rule: string;
  reason: string;
};
/** Normalize Unicode and percent-encoded unreserved octets without decoding reserved separators. */
function normalizePath(value: string) {
  return Array.from(value)
    .map((c) => (c.codePointAt(0)! > 127 ? encodeURIComponent(c) : c))
    .join("")
    .replace(/%[0-9a-f]{2}/gi, (s) => {
      const c = String.fromCharCode(parseInt(s.slice(1), 16));
      return /[A-Za-z0-9._~-]/.test(c) ? c : s.toUpperCase();
    });
}
/** Bounded wildcard matching avoids exponential regular-expression backtracking. */
function matches(pattern: string, path: string) {
  const exact = pattern.endsWith("$");
  const source = (exact ? pattern.slice(0, -1) : pattern).replace(/\*+/g, "*");
  const target = exact ? source : source + "*";
  let i = 0,
    j = 0,
    star = -1,
    retry = 0;
  while (i < path.length) {
    if (j < target.length && target[j] !== "*" && target[j] === path[i]) {
      i++;
      j++;
    } else if (target[j] === "*") {
      star = j++;
      retry = i;
    } else if (star >= 0) {
      j = star + 1;
      i = ++retry;
    } else return false;
  }
  while (target[j] === "*") j++;
  return j === target.length;
}
const productToken = (value: string) =>
  value
    .trim()
    .toLowerCase()
    .split(/[/*\s]/)[0];
export function inspectCrawlerPath(
  state: RobotsState,
  token: string,
  rawPath: string,
): PathAccess {
  const path = normalizePath(rawPath);
  if (
    path.length > 8192 ||
    state.groups.reduce((n, g) => n + g.rules.length, 0) > 1500
  )
    return {
      status: "unknown",
      matchedAgent: "",
      rule: "",
      reason: "Rules or URL exceed the bounded policy inspection limits.",
    };
  const scored = state.groups.map((group) => ({
    group,
    specificity: Math.max(
      0,
      ...group.userAgents.map((a) =>
        a.trim() !== "*" && productToken(a) === token.toLowerCase() && a.trim()
          ? productToken(a).length
          : 0,
      ),
    ),
  }));
  const specificity = Math.max(0, ...scored.map((g) => g.specificity));
  const groups = specificity
    ? scored.filter((g) => g.specificity === specificity).map((g) => g.group)
    : state.groups.filter((g) => g.userAgents.some((a) => a.trim() === "*"));
  const rules = groups
    .flatMap((g) => g.rules)
    .filter((r) => r.type !== "crawl-delay" && r.path.trim());
  const applicable = rules
    .map((r) => ({ ...r, normalized: normalizePath(r.path.trim()) }))
    .filter((r) => matches(r.normalized, path))
    .map((r) => ({
      ...r,
      length: new TextEncoder().encode(r.normalized).length,
    }));
  applicable.sort(
    (a, b) => b.length - a.length || (a.type === "allow" ? -1 : 1),
  );
  const best = applicable[0];
  return {
    status: best?.type === "disallow" ? "blocked" : "allowed",
    matchedAgent: specificity
      ? groups
          .flatMap((g) => g.userAgents)
          .filter(
            (a) =>
              productToken(a).length === specificity &&
              productToken(a) === token.toLowerCase(),
          )
          .join(", ")
      : groups.length
        ? "*"
        : "No matching group",
    rule: best
      ? `${best.type === "allow" ? "Allow" : "Disallow"}: ${best.path}`
      : "No matching restriction",
    reason: best
      ? "Most specific matching path rule; Allow wins equal-specificity ties."
      : "No applicable Disallow rule was found for this URL path.",
  };
}
export function parseCrawlerPolicy(text: string): RobotsState {
  // Only access directives define these groups. Other fields do not split User-agent lists.
  return parseRobotsTxt(
    text
      .split(/\r?\n/)
      .filter((line) => /^\s*(?:user-agent|allow|disallow)\s*:/i.test(line))
      .join("\n"),
  );
}
