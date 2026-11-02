import { AI_CRAWLERS } from "./ai-crawlers";
import type {
  CrawlerMatrixRow,
  MatchedVia,
  RobotsGroup,
  RobotsIssue,
  RobotsRule,
  RobotsState,
  RootAccess,
} from "./types";

let idCounter = 0;
export function makeId(prefix: string) {
  idCounter += 1;
  return `${prefix}-${Date.now().toString(36)}-${idCounter}`;
}

export function emptyRule(type: RobotsRule["type"] = "disallow"): RobotsRule {
  return {
    id: makeId("rule"),
    type,
    path: type === "crawl-delay" ? "10" : "/",
  };
}

export function emptyGroup(userAgents: string[] = ["*"]): RobotsGroup {
  return { id: makeId("group"), userAgents, rules: [emptyRule("disallow")] };
}

export function defaultState(): RobotsState {
  return {
    groups: [
      {
        id: makeId("group"),
        userAgents: ["*"],
        rules: [{ id: makeId("rule"), type: "disallow", path: "/wp-admin/" }],
      },
    ],
    sitemapUrls: [],
  };
}

export function buildRobotsTxt(state: RobotsState): string {
  const blocks: string[] = [];
  for (const group of state.groups) {
    const agents = group.userAgents
      .map((agent) => agent.trim())
      .filter(Boolean);
    if (!agents.length) continue;
    const lines: string[] = agents.map((agent) => `User-agent: ${agent}`);
    let wrote = false;
    for (const rule of group.rules) {
      if (rule.type === "crawl-delay") {
        if (rule.path.trim()) {
          lines.push(`Crawl-delay: ${rule.path.trim()}`);
          wrote = true;
        }
        continue;
      }
      const label = rule.type === "allow" ? "Allow" : "Disallow";
      lines.push(`${label}: ${rule.path.trim()}`);
      wrote = true;
    }
    if (wrote) blocks.push(lines.join("\n"));
  }

  const sitemapLines = state.sitemapUrls
    .map((url) => url.trim())
    .filter(Boolean)
    .map((url) => `Sitemap: ${url}`);

  const sections = [blocks.join("\n\n"), sitemapLines.join("\n")].filter(
    Boolean,
  );
  return `${sections.join("\n\n").trim()}\n`;
}

export function parseRobotsTxt(text: string): RobotsState {
  const groups: RobotsGroup[] = [];
  const sitemapUrls: string[] = [];
  let pendingAgents: string[] = [];
  let currentGroup: RobotsGroup | null = null;
  let collectingAgents = true;

  function commitGroup() {
    if (pendingAgents.length) {
      currentGroup = {
        id: makeId("group"),
        userAgents: [...pendingAgents],
        rules: [],
      };
      groups.push(currentGroup);
      pendingAgents = [];
    } else {
      currentGroup = null;
    }
  }

  for (const rawLine of text.replace(/\r\n/g, "\n").split("\n")) {
    const line = rawLine.split("#")[0].trim();
    if (!line) continue;
    const colon = line.indexOf(":");
    if (colon === -1) continue;
    const directive = line.slice(0, colon).trim().toLowerCase();
    const value = line.slice(colon + 1).trim();

    if (directive === "user-agent") {
      if (!collectingAgents) {
        currentGroup = null;
        pendingAgents = [];
      }
      pendingAgents.push(value);
      collectingAgents = true;
      continue;
    }

    collectingAgents = false;
    if (!currentGroup) commitGroup();
    if (directive === "sitemap") {
      sitemapUrls.push(value);
      continue;
    }
    if (!currentGroup) continue;
    if (directive === "disallow")
      currentGroup.rules.push({
        id: makeId("rule"),
        type: "disallow",
        path: value,
      });
    else if (directive === "allow")
      currentGroup.rules.push({
        id: makeId("rule"),
        type: "allow",
        path: value,
      });
    else if (directive === "crawl-delay")
      currentGroup.rules.push({
        id: makeId("rule"),
        type: "crawl-delay",
        path: value,
      });
  }

  return { groups, sitemapUrls };
}

function rootAccessForGroup(rules: RobotsRule[]): RootAccess {
  // "Disallow:" with an empty path is a documented no-op (allow everything),
  // not a block — the single most common hand-authored robots.txt mistake.
  const meaningful = rules.filter(
    (rule) =>
      rule.type !== "crawl-delay" &&
      !(rule.type === "disallow" && rule.path.trim() === ""),
  );
  const rootRules = meaningful.filter(
    (rule) => rule.path.trim() === "/" || rule.path.trim() === "",
  );
  const otherDisallow = meaningful.some(
    (rule) =>
      rule.type === "disallow" &&
      rule.path.trim() !== "/" &&
      rule.path.trim() !== "",
  );

  if (!rootRules.length) return otherDisallow ? "restricted" : "open";

  const maxLen = Math.max(...rootRules.map((rule) => rule.path.trim().length));
  const topRules = rootRules.filter(
    (rule) => rule.path.trim().length === maxLen,
  );
  const hasAllow = topRules.some((rule) => rule.type === "allow");
  if (hasAllow) return otherDisallow ? "restricted" : "open";
  return "blocked";
}

function findGroupForToken(
  state: RobotsState,
  token: string,
): { group: RobotsGroup | null; matchedVia: MatchedVia } {
  const lowerToken = token.toLowerCase();
  const exact = state.groups.find((group) =>
    group.userAgents.some((agent) => agent.trim().toLowerCase() === lowerToken),
  );
  if (exact) return { group: exact, matchedVia: "exact" };
  const wildcard = state.groups.find((group) =>
    group.userAgents.some((agent) => agent.trim() === "*"),
  );
  if (wildcard) return { group: wildcard, matchedVia: "wildcard" };
  return { group: null, matchedVia: "none" };
}

export function buildCrawlerMatrix(state: RobotsState): CrawlerMatrixRow[] {
  return AI_CRAWLERS.map((crawler) => {
    const { group, matchedVia } = findGroupForToken(state, crawler.token);
    const access: RootAccess = group ? rootAccessForGroup(group.rules) : "open";
    return { ...crawler, matchedVia, access };
  });
}

export function validateRobotsTxt(state: RobotsState): RobotsIssue[] {
  const issues: RobotsIssue[] = [];
  const nonEmptyGroups = state.groups.filter((group) =>
    group.userAgents.some((agent) => agent.trim()),
  );

  if (!nonEmptyGroups.length) {
    issues.push({
      level: "error",
      message: "Add at least one User-agent group.",
    });
  }

  const seenAgents = new Map<string, number>();
  for (const group of nonEmptyGroups) {
    for (const agent of group.userAgents) {
      const key = agent.trim().toLowerCase();
      if (!key) continue;
      seenAgents.set(key, (seenAgents.get(key) || 0) + 1);
    }

    for (const rule of group.rules) {
      if (rule.type === "crawl-delay") continue;
      const path = rule.path.trim();
      if (path && !path.startsWith("/") && !path.startsWith("*")) {
        issues.push({
          level: "error",
          message: `"${path}" should start with / (or be left empty to mean "allow everything").`,
        });
      }
      if (rule.type === "disallow" && path === "") {
        issues.push({
          level: "info",
          message: `An empty "Disallow:" for ${group.userAgents.join(", ")} means allow everything, not block everything. Use "/" if you meant to block the whole group.`,
        });
      }
    }

    const access = rootAccessForGroup(group.rules);
    if (
      access === "blocked" &&
      group.userAgents.some((agent) => agent.trim() === "*")
    ) {
      issues.push({
        level: "warning",
        message:
          "User-agent: * is set to Disallow: / — this blocks every crawler, including search engines, from your entire site.",
      });
    }
  }

  for (const [agent, count] of seenAgents) {
    if (count > 1) {
      issues.push({
        level: "warning",
        message: `"${agent}" appears in more than one group. Only the first matching group is used — combine its rules into one group.`,
      });
    }
  }

  if (!state.sitemapUrls.some((url) => url.trim())) {
    issues.push({
      level: "warning",
      message:
        "No Sitemap directive — add your sitemap.xml URL so crawlers can find it.",
    });
  }
  for (const url of state.sitemapUrls) {
    if (url.trim() && !/^https?:\/\//i.test(url.trim())) {
      issues.push({
        level: "error",
        message: `Sitemap "${url}" should be a full absolute URL starting with https://.`,
      });
    }
  }

  return issues;
}
