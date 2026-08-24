import { ExternalLink, Sparkles } from "lucide-react";
import type { ReactNode } from "react";
import type { SiteAssistantMessage } from "../types";

function renderInline(text: string) {
  const pattern =
    /(\[[^\]]+\]\(https?:\/\/[^)]+\)|https?:\/\/[^\s]+|\*\*[^*]+\*\*)/g;
  return text
    .split(pattern)
    .filter(Boolean)
    .map((part, index) => {
      const markdownLink = part.match(/^\[([^\]]+)\]\((https?:\/\/[^)]+)\)$/);
      if (markdownLink) {
        return (
          <a
            key={`${part}-${index}`}
            href={markdownLink[2]}
            target="_blank"
            rel="noopener noreferrer"
            className="font-semibold text-[#3659dc] underline decoration-[#5271ff]/30 underline-offset-2 hover:decoration-[#5271ff] dark:text-blue-300"
          >
            {markdownLink[1]}
          </a>
        );
      }
      if (/^https?:\/\//.test(part)) {
        const url = part.replace(/[.,;!?]+$/, "");
        const suffix = part.slice(url.length);
        return (
          <span key={`${part}-${index}`}>
            <a
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              className="font-semibold text-[#3659dc] underline decoration-[#5271ff]/30 underline-offset-2 hover:decoration-[#5271ff] dark:text-blue-300"
            >
              {url}
            </a>
            {suffix}
          </span>
        );
      }
      if (part.startsWith("**") && part.endsWith("**")) {
        return <strong key={`${part}-${index}`}>{part.slice(2, -2)}</strong>;
      }
      return part;
    });
}

function formatText(content: string) {
  const blocks: ReactNode[] = [];
  let list: string[] = [];
  const flushList = () => {
    if (!list.length) return;
    blocks.push(
      <ul key={`list-${blocks.length}`} className="my-2 space-y-1.5 pl-4">
        {list.map((item, index) => (
          <li key={`${item}-${index}`} className="list-disc pl-1">
            {renderInline(item)}
          </li>
        ))}
      </ul>,
    );
    list = [];
  };

  content.split(/\n+/).forEach((rawLine) => {
    const line = rawLine.trim();
    if (!line) return;
    if (/^[-*]\s+/.test(line)) {
      list.push(line.replace(/^[-*]\s+/, ""));
      return;
    }
    flushList();
    blocks.push(
      <p
        key={`paragraph-${blocks.length}`}
        className="my-1.5 first:mt-0 last:mb-0"
      >
        {renderInline(line.replace(/^#{1,4}\s+/, ""))}
      </p>,
    );
  });
  flushList();
  return blocks;
}

type Props = {
  message: SiteAssistantMessage;
  onSourceClick?: () => void;
};

export default function AssistantMessage({ message, onSourceClick }: Props) {
  const isAssistant = message.role === "assistant";
  return (
    <article
      className={`flex gap-2.5 ${isAssistant ? "items-start" : "justify-end"}`}
      aria-label={isAssistant ? "Assistant message" : "Your message"}
    >
      {isAssistant && (
        <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-[#5271ff] to-[#7657ff] text-white shadow-sm">
          <Sparkles className="h-3.5 w-3.5" aria-hidden="true" />
        </div>
      )}
      <div className={`max-w-[86%] ${isAssistant ? "min-w-0" : ""}`}>
        <div
          className={
            isAssistant
              ? "rounded-2xl rounded-tl-md border border-slate-200 bg-white px-3.5 py-3 text-[13.5px] leading-6 text-slate-700 shadow-sm dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
              : "rounded-2xl rounded-br-md bg-gradient-to-br from-[#5271ff] to-[#4562e8] px-3.5 py-2.5 text-[13.5px] leading-5 text-white shadow-sm"
          }
        >
          {formatText(message.content)}
        </div>
        {isAssistant && message.sources && message.sources.length > 0 && (
          <div className="mt-2 space-y-1.5">
            <p className="px-1 text-[10px] font-black uppercase tracking-[0.14em] text-slate-400">
              Sources from this site
            </p>
            {message.sources.map((source) => (
              <a
                key={source.url}
                href={source.url}
                onClick={onSourceClick}
                className="group flex items-center justify-between gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-left shadow-sm transition hover:border-[#5271ff]/50 hover:bg-blue-50/60 dark:border-slate-700 dark:bg-slate-900 dark:hover:bg-slate-800"
              >
                <span className="min-w-0">
                  <span className="block truncate text-[11.5px] font-bold text-slate-700 dark:text-slate-200">
                    {source.title}
                  </span>
                  <span className="block text-[9px] font-bold uppercase tracking-wider text-[#5271ff]">
                    {source.kind.replace(/-/g, " ")}
                  </span>
                </span>
                <ExternalLink className="h-3.5 w-3.5 shrink-0 text-slate-400 transition group-hover:text-[#5271ff]" />
              </a>
            ))}
          </div>
        )}
      </div>
    </article>
  );
}
