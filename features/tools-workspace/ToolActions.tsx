"use client";
import { Bookmark, Heart } from "lucide-react";
import { useWorkspace } from "./WorkspaceProvider";

export function ToolActions({
  id,
  compact = false,
}: {
  id: string;
  compact?: boolean;
}) {
  const w = useWorkspace();
  if (!w) return null;
  const saved = w.saved.includes(id),
    liked = w.likes.includes(id);
  return (
    <div className="flex flex-wrap items-center gap-1.5">
      <button
        type="button"
        disabled={!!w.user && (!w.ready || w.pending.includes("bookmark" + id))}
        aria-label={saved ? "Remove bookmark" : "Bookmark tool"}
        title={saved ? "Remove from saved tools" : "Save tool to workspace"}
        aria-busy={w.pending.includes("bookmark" + id)}
        aria-pressed={saved}
        onClick={() => w.toggle(id, "bookmark")}
        className={`workspace-icon ${
          saved
            ? "!border-[#5271FF]/40 !bg-[#5271FF]/10 !text-[#4A6CF7] dark:!border-[#5271FF]/50 dark:!bg-[#5271FF]/20 dark:!text-[#AEBBFF]"
            : ""
        }`}
      >
        <Bookmark
          size={15}
          className={
            saved
              ? "fill-[#5271FF] text-[#5271FF] dark:fill-[#93B4FF] dark:text-[#93B4FF]"
              : ""
          }
        />
        {!compact && (
          <span className="text-xs font-semibold">
            {w.pending.includes("bookmark" + id)
              ? "Saving…"
              : saved
                ? "Saved"
                : "Save"}
          </span>
        )}
      </button>
      {!compact && (
        <button
          type="button"
          disabled={!!w.user && (!w.ready || w.pending.includes("like" + id))}
          aria-label={liked ? "Remove like" : "Like tool"}
          title={liked ? "Remove vote" : "Upvote this tool"}
          aria-busy={w.pending.includes("like" + id)}
          aria-pressed={liked}
          onClick={() => w.toggle(id, "like")}
          className={`workspace-icon ${
            liked
              ? "!border-rose-500/40 !bg-rose-500/10 !text-rose-600 dark:!border-rose-400/50 dark:!bg-rose-500/20 dark:!text-rose-300"
              : ""
          }`}
        >
          <Heart
            size={15}
            className={liked ? "fill-rose-500 text-rose-500" : ""}
          />
          <span className="text-xs font-semibold">
            {w.pending.includes("like" + id)
              ? "Saving…"
              : (w.counts[id] ?? "Like")}
          </span>
        </button>
      )}
    </div>
  );
}
