import type { HreflangEntry, HreflangIssue, HreflangState, OutputFormat } from "./types";

// IANA-style check: a 2–3 letter language subtag, optionally followed by a
// 4-letter script subtag and/or a 2-letter region or 3-digit region code.
// Not a full BCP 47 validator ; it catches the mistakes people actually make
// (typos, swapped case, made-up codes) without rejecting legitimate rarer tags.
const CODE_PATTERN = /^[a-z]{2,3}(-[A-Z][a-z]{3})?(-([A-Z]{2}|\d{3}))?$/;

export function isValidHreflangCode(code: string) {
  const trimmed = code.trim();
  return trimmed === "x-default" || CODE_PATTERN.test(trimmed);
}

export const COMMON_CODES: { code: string; label: string }[] = [
  { code: "x-default", label: "x-default (fallback / language selector)" },
  { code: "en", label: "English (generic)" },
  { code: "en-US", label: "English (United States)" },
  { code: "en-GB", label: "English (United Kingdom)" },
  { code: "en-AE", label: "English (UAE)" },
  { code: "ar", label: "Arabic (generic)" },
  { code: "ar-AE", label: "Arabic (UAE)" },
  { code: "ar-SA", label: "Arabic (Saudi Arabia)" },
  { code: "fr", label: "French (generic)" },
  { code: "es", label: "Spanish (generic)" },
  { code: "de", label: "German (generic)" },
  { code: "zh-Hans", label: "Chinese (Simplified)" },
];

let idCounter = 0;
export function makeId(prefix: string) {
  idCounter += 1;
  return `${prefix}-${Date.now().toString(36)}-${idCounter}`;
}

export function emptyEntry(code = "", url = ""): HreflangEntry {
  return { id: makeId("entry"), code, url };
}

export function defaultState(): HreflangState {
  return {
    entries: [emptyEntry("en", ""), emptyEntry("x-default", "")],
  };
}

export function buildHreflangTags(state: HreflangState, format: OutputFormat): string {
  const filled = state.entries.filter((entry) => entry.code.trim() && entry.url.trim());
  if (format === "header") {
    return filled
      .map((entry) => `<${entry.url.trim()}>; rel="alternate"; hreflang="${entry.code.trim()}"`)
      .join(",\n");
  }
  return filled
    .map((entry) => `<link rel="alternate" hreflang="${entry.code.trim()}" href="${entry.url.trim()}" />`)
    .join("\n");
}

export function validateHreflang(state: HreflangState): HreflangIssue[] {
  const issues: HreflangIssue[] = [];
  const filled = state.entries.filter((entry) => entry.code.trim() || entry.url.trim());

  if (!filled.length) {
    issues.push({ level: "error", message: "Add at least two language/region versions." });
    return issues;
  }
  if (filled.length < 2) {
    issues.push({
      level: "warning",
      message: "hreflang only matters when two or more versions exist ; add the other language or region versions of this page.",
    });
  }

  const codeCounts = new Map<string, number>();
  const urlCounts = new Map<string, string[]>();

  for (const entry of filled) {
    const code = entry.code.trim();
    const url = entry.url.trim();

    if (!code) {
      issues.push({ level: "error", message: `"${url || "(empty)"}" has no language/region code.` });
    } else if (!isValidHreflangCode(code)) {
      issues.push({
        level: "error",
        message: `"${code}" doesn't look like a valid code. Use a lowercase language code, optionally with an uppercase region (e.g. en, en-US, ar-AE) or "x-default".`,
      });
    }
    if (!url) {
      issues.push({ level: "error", message: `"${code || "(empty)"}" has no URL.` });
    } else if (!/^https?:\/\//i.test(url)) {
      issues.push({ level: "error", message: `"${url}" should be a full absolute URL starting with https://.` });
    }

    if (code) codeCounts.set(code.toLowerCase(), (codeCounts.get(code.toLowerCase()) || 0) + 1);
    if (url) urlCounts.set(url, [...(urlCounts.get(url) || []), code]);
  }

  for (const [code, count] of codeCounts) {
    if (count > 1) {
      issues.push({ level: "error", message: `"${code}" is used more than once ; each code should point to exactly one URL.` });
    }
  }

  for (const [url, codes] of urlCounts) {
    if (codes.length > 1) {
      issues.push({
        level: "warning",
        message: `${codes.join(", ")} all point to the same URL (${url}). Make sure that's intentional and not a copy-paste leftover.`,
      });
    }
  }

  if (!filled.some((entry) => entry.code.trim().toLowerCase() === "x-default")) {
    issues.push({
      level: "info",
      message: "No x-default set. It's optional, but recommended as the fallback for visitors whose language/region doesn't match any version listed.",
    });
  }

  return issues;
}

export function parseHreflangFromHtml(linkTags: { hreflang: string; href: string }[]): HreflangState {
  return {
    entries: linkTags.map((tag) => emptyEntry(tag.hreflang, tag.href)),
  };
}
