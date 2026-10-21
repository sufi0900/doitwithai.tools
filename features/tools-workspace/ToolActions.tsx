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
    <div className="flex flex-wrap items-center gap-2">
      <button
        disabled={!!w.user && (!w.ready || w.pending.includes("bookmark" + id))}
        aria-label={saved ? "Remove bookmark" : "Bookmark tool"}
        aria-busy={w.pending.includes("bookmark" + id)}
        aria-pressed={saved}
        onClick={() => w.toggle(id, "bookmark")}
        className="workspace-icon"
      >
        <Bookmark
          size={17}
          className={saved ? "fill-primary text-primary" : ""}
        />
        {!compact && (
          <span className="text-xs">
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
          disabled={!!w.user && (!w.ready || w.pending.includes("like" + id))}
          aria-label={liked ? "Remove like" : "Like tool"}
          aria-busy={w.pending.includes("like" + id)}
          aria-pressed={liked}
          onClick={() => w.toggle(id, "like")}
          className="workspace-icon"
        >
          <Heart
            size={17}
            className={liked ? "fill-rose-500 text-rose-500" : ""}
          />
          <span className="text-xs">
            {w.pending.includes("like" + id)
              ? "Saving…"
              : (w.counts[id] ?? "Like")}
          </span>
        </button>
      )}
    </div>
  );
}
