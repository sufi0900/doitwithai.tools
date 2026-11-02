export type Status = 301 | 302 | 307 | 308;
export const STATUSES: Status[] = [301, 302, 307, 308];
export type Platform = "nextjs" | "vercel" | "netlify" | "apache" | "nginx";
export type Level = "error" | "warning" | "info";

export const MAX_RULES = 5000;
export const LARGE_LIST_WARNING = 500;

export interface Issue {
  level: Level;
  line: number | null;
  message: string;
}

export interface Rule {
  kind: "exact" | "prefix";
  /** Exact path (no trailing slash except "/") or, for prefix rules, the prefix including its trailing slash. */
  source: string;
  /** Final destination. For prefix rules that carry the remainder, this is the destination base ending in "/". */
  destination: string;
  carry: boolean;
  status: Status;
  line: number;
}

export interface BuildOptions {
  defaultStatus: Status;
  flattenChains: boolean;
  optionalTrailingSlash: boolean; // Apache/Nginx exact rules
}

export interface Analysis {
  rules: Rule[];
  issues: Issue[];
  rowsRead: number;
  chainsFlattened: number;
}

/* --------------------------------- parsing --------------------------------- */

const FORBIDDEN = /[\s$;"\\{}|^<>`]/; // characters that can't be written safely into every config format
const HEADER_SOURCE = /^(old|source|from|url|old[_ ]?url|source[_ ]?url|redirect[_ ]?from)$/i;
const HEADER_DEST = /^(new|target|to|destination|new[_ ]?url|target[_ ]?url|redirect[_ ]?to)$/i;

interface Parts {
  path: string;
  query: string;
  host: string | null;
}

function splitParts(value: string): Parts | null {
  if (/^https?:\/\//i.test(value)) {
    try {
      const url = new URL(value);
      return { path: url.pathname, query: url.search, host: url.host };
    } catch {
      return null;
    }
  }
  if (value.startsWith("//")) return null;
  const withoutHash = value.split("#")[0];
  const queryIndex = withoutHash.indexOf("?");
  const path = queryIndex === -1 ? withoutHash : withoutHash.slice(0, queryIndex);
  const query = queryIndex === -1 ? "" : withoutHash.slice(queryIndex);
  return { path, query, host: null };
}

function trimTrailingSlash(path: string): string {
  return path.length > 1 ? path.replace(/\/+$/, "") || "/" : path;
}

function decodeSafe(value: string): string {
  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
}

function tokenize(line: string): string[] {
  // Prefer explicit separators so a URL that contains a space is reported as an error
  // instead of being silently split into the wrong rule. Fall back to whitespace only
  // when the line has no arrow, comma, or tab.
  const pattern = /->|=>/.test(line) ? /\s*(?:->|=>)\s*|\s*[,\t]\s*/ : /[,\t]/.test(line) ? /\s*[,\t]\s*/ : /\s+/;
  return line
    .split(pattern)
    .map((token) => token.trim().replace(/^["']|["']$/g, ""))
    .filter(Boolean);
}

const DOMAIN_LIKE =
  /^(?:[^/?#]+\.[a-z]{2,}\/|[^/?#.]+(?:\.[^/?#.]+)*\.(?:com|org|net|io|co|ai|dev|app|info|biz|edu|gov|uk|us|de|fr|in|pk|ca|au)(?:[:?#]|$))/i;

export function analyzeRedirects(text: string, options: BuildOptions): Analysis {
  const issues: Issue[] = [];
  const add = (level: Level, line: number | null, message: string) => issues.push({ level, line, message });

  const exact = new Map<string, Rule>();
  const prefixes = new Map<string, Rule>();
  let rowsRead = 0;
  let headerChecked = false;
  let strippedHost = false;
  let strippedHash = false;

  const lines = text.split(/\r?\n/);
  for (let index = 0; index < lines.length; index += 1) {
    const lineNo = index + 1;
    const raw = lines[index].trim();
    if (!raw || raw.startsWith("#")) continue;

    const tokens = tokenize(raw);
    if (!headerChecked) {
      headerChecked = true;
      if (tokens.length >= 2 && HEADER_SOURCE.test(tokens[0]) && HEADER_DEST.test(tokens[1])) continue;
    }
    rowsRead += 1;
    if (rowsRead > MAX_RULES) {
      add("warning", null, `Only the first ${MAX_RULES.toLocaleString()} rules were processed.`);
      break;
    }
    if (tokens.length < 2) {
      add("error", lineNo, "Needs two values: the old URL and the new URL.");
      continue;
    }
    if (tokens.length > 3) add("warning", lineNo, "Extra columns were ignored. Use one rule per line: old, new, optional status.");

    // Status
    let status = options.defaultStatus;
    if (tokens[2]) {
      const parsed = Number(tokens[2]);
      if ((STATUSES as number[]).includes(parsed)) status = parsed as Status;
      else add("warning", lineNo, `Status "${tokens[2]}" isn't supported (use 301, 302, 307, or 308). Using ${options.defaultStatus}.`);
    }

    // Source
    const sourceParts = splitParts(tokens[0]);
    if (!sourceParts) {
      add("error", lineNo, `"${tokens[0]}" isn't a valid URL or path.`);
      continue;
    }
    if (sourceParts.host) strippedHost = true;
    if (tokens[0].includes("#")) strippedHash = true;
    if (sourceParts.query) {
      add("error", lineNo, "Sources with a ?query string aren't supported ; server rules match the path only, so this one would redirect more than you intend. Remove it or configure that rule by hand.");
      continue;
    }
    let sourcePath = sourceParts.path;
    if (!sourcePath.startsWith("/")) {
      if (DOMAIN_LIKE.test(tokens[0])) {
        add("error", lineNo, `"${tokens[0]}" looks like a domain. Add https:// in front, or start a path with /.`);
        continue;
      }
      sourcePath = `/${sourcePath}`;
    }
    if (sourcePath.includes(":")) {
      add("warning", lineNo, `${sourcePath} contains a ":" ; Next.js and Vercel output is escaped, but check how Netlify treats it.`);
    }

    // Wildcards
    const isPrefix = sourcePath.endsWith("/*");
    const starCount = (sourcePath.match(/\*/g) ?? []).length;
    if ((isPrefix && starCount > 1) || (!isPrefix && starCount > 0)) {
      add("error", lineNo, "Wildcards are only supported as a trailing /* (for example /old-blog/*).");
      continue;
    }

    // Destination
    const destRaw = tokens[1];
    let destination: string;
    let carry = false;
    const destStar = (destRaw.match(/\*/g) ?? []).length;
    if (destStar > 0) {
      if (!isPrefix || destStar > 1 || !destRaw.endsWith("/*")) {
        add("error", lineNo, "A * in the destination is only allowed as a trailing /* and only when the source also ends in /*.");
        continue;
      }
      carry = true;
    }
    const destClean = carry ? destRaw.slice(0, -1) : destRaw; // keep trailing "/" of the base

    if (/^https?:\/\//i.test(destClean)) {
      try {
        new URL(destClean);
      } catch {
        add("error", lineNo, `"${destRaw}" isn't a valid destination URL.`);
        continue;
      }
      destination = destClean.split("#")[0];
    } else if (destClean.startsWith("//")) {
      add("error", lineNo, "Destination can't start with //. Use a path beginning with / or a full https:// URL.");
      continue;
    } else if (!destClean.startsWith("/") && DOMAIN_LIKE.test(destClean)) {
      add("error", lineNo, `"${destRaw}" looks like a domain. Add https:// in front, or start a path with /.`);
      continue;
    } else {
      destination = destClean.split("#")[0];
      if (!destination.startsWith("/")) destination = `/${destination}`;
    }
    if (destRaw.includes("#")) strippedHash = true;

    // Character safety
    const sourceDecoded = decodeSafe(sourcePath);
    if (FORBIDDEN.test(sourcePath.replace(/\*$/, "")) || FORBIDDEN.test(destination) || /["\\\u0000-\u001f]/.test(sourceDecoded)) {
      add(
        "error",
        lineNo,
        "A URL contains a space or a character such as $ ; \" \\ { } | ^ < > that can't be written safely into every server config. Percent-encode it (for example a space becomes %20)."
      );
      continue;
    }

    const rule: Rule = {
      kind: isPrefix ? "prefix" : "exact",
      source: isPrefix ? sourcePath.slice(0, -1) : trimTrailingSlash(sourcePath),
      destination,
      carry,
      status,
      line: lineNo,
    };

    // Self-redirect / redirect into itself
    const relativeDest = /^https?:\/\//i.test(destination) ? null : destination;
    if (rule.kind === "exact") {
      if (relativeDest && trimTrailingSlash(relativeDest.split("?")[0]) === rule.source && !relativeDest.includes("?")) {
        add("error", lineNo, `Redirects ${rule.source} to itself.`);
        continue;
      }
    } else if (relativeDest && relativeDest.startsWith(rule.source)) {
      add("error", lineNo, `${rule.source}* redirects into a URL that matches the same rule, which would create a loop.`);
      continue;
    }

    // Duplicates and conflicts
    const store = rule.kind === "exact" ? exact : prefixes;
    const previous = store.get(rule.source);
    if (previous) {
      if (previous.destination === rule.destination && previous.status === rule.status && previous.carry === rule.carry) {
        add("info", lineNo, `Duplicate of line ${previous.line} ; removed.`);
      } else {
        add("error", lineNo, `${rule.source}${rule.kind === "prefix" ? "*" : ""} already redirects elsewhere on line ${previous.line}. The first rule was kept.`);
      }
      continue;
    }
    store.set(rule.source, rule);
  }

  if (strippedHost) add("info", null, "Hostnames were removed from sources. Rules apply on whichever site the config is installed.");
  if (strippedHash) add("info", null, "#fragments were removed ; servers never see them.");

  // Loops and chains (exact rules with path destinations)
  let chainsFlattened = 0;
  const lookup = (path: string): Rule | undefined => exact.get(trimTrailingSlash(path));
  const loopMembers = new Set<string>();

  for (const rule of exact.values()) {
    if (/^https?:\/\//i.test(rule.destination) || rule.destination.includes("?")) continue;
    const visited = [rule.source];
    let current = trimTrailingSlash(rule.destination);
    let next = lookup(current);
    let loop = false;
    while (next) {
      if (visited.includes(next.source)) {
        loop = true;
        break;
      }
      visited.push(next.source);
      if (/^https?:\/\//i.test(next.destination) || next.destination.includes("?")) {
        current = next.destination;
        break;
      }
      current = trimTrailingSlash(next.destination);
      next = lookup(current);
    }
    if (loop) {
      visited.forEach((source) => loopMembers.add(source));
      continue;
    }
    if (visited.length > 1) {
      const path = `${visited.join(" → ")} → ${current}`;
      if (options.flattenChains) {
        rule.destination = current;
        chainsFlattened += 1;
        add("warning", rule.line, `Redirect chain (${path}). Flattened so ${rule.source} goes straight to ${current}.`);
      } else {
        add("warning", rule.line, `Redirect chain (${path}). Visitors and crawlers will hop through ${visited.length} redirects.`);
      }
    }
  }
  for (const source of loopMembers) {
    const rule = exact.get(source);
    if (rule) {
      add("error", rule.line, `${source} is part of a redirect loop and was left out.`);
      exact.delete(source);
    }
  }

  const prefixRules = [...prefixes.values()].sort((a, b) => b.source.length - a.source.length);
  const rules = [...exact.values(), ...prefixRules];
  if (rules.length > LARGE_LIST_WARNING) {
    add("info", null, `${rules.length.toLocaleString()} rules is a long list. Apache and Nginx evaluate line-by-line rules in order, so for thousands of redirects consider a map-based approach or your platform's bulk redirect feature.`);
  }
  issues.sort((a, b) => ({ error: 0, warning: 1, info: 2 })[a.level] - ({ error: 0, warning: 1, info: 2 })[b.level] || (a.line ?? 1e9) - (b.line ?? 1e9));
  return { rules, issues, rowsRead, chainsFlattened };
}

/* -------------------------------- generating -------------------------------- */

function regexEscape(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function pathToRegexpEscape(value: string): string {
  return value.replace(/[:()*+?{}]/g, (char) => `\\${char}`);
}

function destinationFor(rule: Rule, token: string): string {
  return rule.carry ? `${rule.destination}${token}` : rule.destination;
}

function nextVercelEntries(rules: Rule[]) {
  return rules.map((rule) => {
    if (rule.kind === "exact") {
      return { source: pathToRegexpEscape(rule.source), destination: rule.destination, statusCode: rule.status };
    }
    return {
      source: `${pathToRegexpEscape(rule.source)}:path*`,
      destination: rule.carry ? `${rule.destination}:path*` : rule.destination,
      statusCode: rule.status,
    };
  });
}

export function generateOutput(platform: Platform, rules: Rule[], options: BuildOptions): { filename: string; content: string; note: string } {
  if (rules.length === 0) return { filename: "", content: "", note: "" };

  if (platform === "nextjs") {
    const body = nextVercelEntries(rules)
      .map((entry) => `    { source: ${JSON.stringify(entry.source)}, destination: ${JSON.stringify(entry.destination)}, statusCode: ${entry.statusCode} },`)
      .join("\n");
    return {
      filename: "next-redirects.js",
      content: `// next.config.js ; add this inside your config object\nasync redirects() {\n  return [\n${body}\n  ];\n},`,
      note: "Add the redirects() function to next.config.js (or next.config.mjs) and redeploy. A /old/* rule also matches /old itself in Next.js.",
    };
  }

  if (platform === "vercel") {
    const entries = nextVercelEntries(rules);
    return {
      filename: "vercel-redirects.json",
      content: JSON.stringify({ redirects: entries }, null, 2),
      note: "Merge the redirects array into your vercel.json and redeploy. Very large lists may hit platform limits ; check Vercel's docs.",
    };
  }

  if (platform === "netlify") {
    const width = Math.max(...rules.map((rule) => (rule.kind === "prefix" ? rule.source.length + 1 : rule.source.length)));
    const lines = rules.map((rule) => {
      const source = rule.kind === "prefix" ? `${rule.source}*` : rule.source;
      const destination = rule.kind === "prefix" ? (rule.carry ? `${rule.destination}:splat` : rule.destination) : rule.destination;
      return `${source.padEnd(width + 2)}${destination}  ${rule.status}`;
    });
    return {
      filename: "_redirects",
      content: lines.join("\n"),
      note: "Save as a file named _redirects in your publish directory (the same format works on Cloudflare Pages). Rules are processed top to bottom.",
    };
  }

  if (platform === "apache") {
    const lines = rules.map((rule) => {
      const decoded = decodeSafe(rule.source);
      let pattern: string;
      let target: string;
      if (rule.kind === "exact") {
        pattern = `^${regexEscape(decoded)}${options.optionalTrailingSlash && rule.source !== "/" ? "/?" : ""}$`;
        target = rule.destination;
      } else {
        pattern = rule.carry ? `^${regexEscape(decoded)}(.*)$` : `^${regexEscape(decoded)}.*$`;
        target = rule.carry ? `${rule.destination}$1` : rule.destination;
      }
      return `RedirectMatch ${rule.status} "${pattern}" "${target}"`;
    });
    return {
      filename: "redirects.htaccess",
      content: `# Requires mod_alias\n${lines.join("\n")}`,
      note: "Paste into your .htaccess file (or the virtual host config). Order matters: exact rules come first.",
    };
  }

  // nginx
  const lines: string[] = [];
  for (const rule of rules) {
    const decoded = decodeSafe(rule.source);
    if (rule.kind === "exact") {
      const pattern = `^${regexEscape(decoded)}${options.optionalTrailingSlash && rule.source !== "/" ? "/?" : ""}$`;
      if (rule.status === 301) lines.push(`rewrite "${pattern}" "${rule.destination}" permanent;`);
      else if (rule.status === 302) lines.push(`rewrite "${pattern}" "${rule.destination}" redirect;`);
      else lines.push(`if ($uri ~ "${pattern}") { return ${rule.status} "${rule.destination}"; }`);
    } else if (rule.status === 301 || rule.status === 302) {
      const pattern = rule.carry ? `^${regexEscape(decoded)}(.*)$` : `^${regexEscape(decoded)}.*$`;
      const target = rule.carry ? `${rule.destination}$1` : rule.destination;
      lines.push(`rewrite "${pattern}" "${target}" ${rule.status === 301 ? "permanent" : "redirect"};`);
    } else {
      lines.push(`# Skipped: ${rule.status} pattern redirect ${rule.source}* isn't generated for Nginx. Use 301/302 or write it by hand.`);
    }
  }
  return {
    filename: "nginx-redirects.conf",
    content: lines.join("\n"),
    note: "Place these lines inside your server { } block, then run nginx -t and reload. They run in order, top to bottom.",
  };
}

export function buildMappingCsv(rules: Rule[]): string {
  const cell = (value: string) => {
    const safe = /^[=+\-@]/.test(value) ? `'${value}` : value;
    return /[",\n]/.test(safe) ? `"${safe.replace(/"/g, '""')}"` : safe;
  };
  const rows = rules.map((rule) =>
    [
      rule.kind === "prefix" ? `${rule.source}*` : rule.source,
      rule.kind === "prefix" && rule.carry ? `${rule.destination}*` : rule.destination,
      String(rule.status),
    ]
      .map(cell)
      .join(",")
  );
  return ["source,destination,status", ...rows].join("\n");
}

export const SAMPLE_INPUT = `old,new,status
/blog/meta-description-length, /blog/how-to-write-meta-descriptions
/blog/seo-for-beginners, /blog/keyword-research-guide, 301
https://example.com/old-tools/seo, /tools
/old-blog/*, /blog/*
/a, /b
/b, /c
/loop-1, /loop-2
/loop-2, /loop-1
/page?id=4, /new-page
/same, /same`;
