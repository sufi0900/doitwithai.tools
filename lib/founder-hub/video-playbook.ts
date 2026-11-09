import MarkdownIt from "markdown-it";

export const VIDEO_PLAYBOOK_PATH = "docs/FOUNDER_VIDEO_PRODUCTION.md";

const promptTitles = {
  master: "Master brief",
  research: "Research and script",
  storyboard: "Assets and visual edit",
  review: "Review and revise",
} as const;

export type VideoPlaybook = {
  html: string;
  prompts: { id: keyof typeof promptTitles; title: string; text: string }[];
};

const markdown = new MarkdownIt({ html: false });
markdown.renderer.rules.table_open = () =>
  '<div class="founder-video-table"><table>';
markdown.renderer.rules.table_close = () => "</table></div>";

export function parseVideoPlaybook(source: string): VideoPlaybook {
  const normalized = source.replace(/\r\n/g, "\n");
  const promptSection = "\n## Copyable production prompts\n";
  const separator = normalized.indexOf(promptSection);
  const handbook = separator < 0 ? normalized : normalized.slice(0, separator);
  const promptSource = separator < 0 ? "" : normalized.slice(separator + promptSection.length);
  const promptTokens = markdown.parse(promptSource, {});

  return {
    // The dashboard supplies its own heading. Markdown's raw HTML is disabled.
    html: markdown.render(handbook.replace(/^# [^\n]+\n+/, "")),
    prompts: (Object.keys(promptTitles) as (keyof typeof promptTitles)[]).flatMap((id) => {
      const text = promptTokens
        .find((token) => token.type === "fence" && token.info.trim() === "text founder-prompt=" + id)
        ?.content.trim();

      return text ? [{ id, title: promptTitles[id], text }] : [];
    }),
  };
}
