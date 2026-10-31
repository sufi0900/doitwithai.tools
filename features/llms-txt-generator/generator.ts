import type { LlmsIssue, LlmsTxtState } from "./schema";

// Spec reference: https://llmstxt.org — an H1 title, an optional blockquote
// summary, optional free-text context, then H2 sections of Markdown link
// lists. The "Optional" section name is reserved by the spec for pages a
// crawler can skip first when it is short on context.
export const OPTIONAL_SECTION_HEADING = "Optional";
export const MAX_RECOMMENDED_LINKS = 40;
export const MAX_SUMMARY_LENGTH = 200;

function escapeLinkText(value: string) {
  return value.replace(/\]/g, "\\]");
}

export function buildLlmsTxt(state: LlmsTxtState): string {
  const lines: string[] = [];
  const siteName = state.site.siteName.trim() || "Untitled Site";
  lines.push(`# ${siteName}`);

  const summary = state.site.summary.trim();
  if (summary) {
    lines.push("", `> ${summary}`);
  }

  const notes = state.site.notes.trim();
  if (notes) {
    lines.push(
      "",
      ...notes
        .split(/\n{2,}/)
        .map((paragraph) => paragraph.trim())
        .filter(Boolean),
    );
  }

  for (const section of state.sections) {
    const links = section.links.filter((link) => link.url.trim());
    if (!links.length) continue;

    lines.push("", `## ${section.heading.trim() || "Links"}`);
    for (const link of links) {
      const title = escapeLinkText(link.title.trim() || link.url.trim());
      const url = link.url.trim();
      const description = link.description.trim();
      lines.push(
        description
          ? `- [${title}](${url}): ${description}`
          : `- [${title}](${url})`,
      );
    }
  }

  return `${lines.join("\n").trim()}\n`;
}

export function validateLlmsTxt(state: LlmsTxtState): LlmsIssue[] {
  const issues: LlmsIssue[] = [];

  if (!state.site.siteName.trim()) {
    issues.push({
      level: "error",
      message: "Add a site or project name for the H1 title.",
    });
  }
  if (!state.site.summary.trim()) {
    issues.push({
      level: "warning",
      message:
        "Add a one-sentence summary. It becomes the blockquote AI crawlers read first.",
    });
  } else if (state.site.summary.trim().length > MAX_SUMMARY_LENGTH) {
    issues.push({
      level: "warning",
      message: `Summary is over ${MAX_SUMMARY_LENGTH} characters. Keep it to one clear sentence.`,
    });
  }

  const allLinks = state.sections.flatMap((section) => section.links);
  const filledLinks = allLinks.filter((link) => link.url.trim());

  if (!filledLinks.length) {
    issues.push({ level: "error", message: "Add at least one page link." });
  }
  if (filledLinks.length > MAX_RECOMMENDED_LINKS) {
    issues.push({
      level: "warning",
      message: `${filledLinks.length} links is a lot for one file. Keep llms.txt to your highest-value pages and list the rest in llms-full.txt.`,
    });
  }

  const seen = new Set<string>();
  for (const link of filledLinks) {
    const url = link.url.trim();
    let parsed: URL | null = null;
    try {
      parsed = new URL(url);
    } catch {
      parsed = null;
    }
    if (!parsed || !/^https?:$/.test(parsed.protocol)) {
      issues.push({
        level: "error",
        message: `"${url || "(empty)"}" is not a valid http(s) URL.`,
      });
      continue;
    }
    if (seen.has(url)) {
      issues.push({
        level: "warning",
        message: `"${url}" is listed more than once.`,
      });
    }
    seen.add(url);
    if (!link.description.trim()) {
      issues.push({
        level: "warning",
        message: `"${link.title.trim() || url}" has no description. A short one helps a model decide whether to open it.`,
      });
    }
  }

  const emptySections = state.sections.filter(
    (section) => section.links.filter((link) => link.url.trim()).length === 0,
  );
  if (emptySections.length) {
    issues.push({
      level: "warning",
      message: `${emptySections.length} section${emptySections.length === 1 ? "" : "s"} have no links yet and will be left out of the file.`,
    });
  }

  return issues;
}

let idCounter = 0;
export function makeId(prefix: string) {
  idCounter += 1;
  return `${prefix}-${Date.now().toString(36)}-${idCounter}`;
}

export function emptyLink(): LlmsLinkDraft {
  return { id: makeId("link"), title: "", url: "", description: "" };
}

export function emptySection(heading: string): LlmsSectionDraft {
  return { id: makeId("section"), heading, links: [emptyLink()] };
}

type LlmsLinkDraft = {
  id: string;
  title: string;
  url: string;
  description: string;
};
type LlmsSectionDraft = { id: string; heading: string; links: LlmsLinkDraft[] };

export function defaultState(): LlmsTxtState {
  return {
    site: { siteName: "", summary: "", notes: "" },
    sections: [emptySection("Docs"), emptySection(OPTIONAL_SECTION_HEADING)],
  };
}
