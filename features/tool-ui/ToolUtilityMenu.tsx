"use client";

import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Archive, ArrowUpRight, ChevronDown, Code2 } from "lucide-react";
import { useTransferredToolRuntime } from "@/features/website-builder/tools/TransferredToolRuntimeContext";

export interface ToolUtilityMenuProps {
  slug: string;
  title?: string;
  onCustomizeEmbed?: () => void;
  onDownloadZip?: () => void;
}

export default function ToolUtilityMenu({
  slug,
  title,
  onCustomizeEmbed,
  onDownloadZip,
}: ToolUtilityMenuProps) {
  const transferred = useTransferredToolRuntime();
  const [menuOpen, setMenuOpen] = useState(false);
  const [isEmbedded, setIsEmbedded] = useState(false);
  const menuRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);
    setIsEmbedded(params.get("embed") === "1");
  }, []);

  useEffect(() => {
    if (!menuOpen) return;

    function handlePointerDown(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setMenuOpen(false);
      }
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setMenuOpen(false);
      }
    }

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [menuOpen]);

  if (isEmbedded || transferred?.isTransferredTool) {
    return null;
  }

  const encodedSlug = encodeURIComponent(slug);
  const doItAiHref = `/do-it-ai?tool=${encodedSlug}`;
  const embedHref = `/tools/downloadable-ai-tools?tool=${encodedSlug}&mode=embed`;
  const downloadHref = `/tools/downloadable-ai-tools?tool=${encodedSlug}&mode=download`;

  return (
    <div
      data-tool-utility-menu="true"
      className="flex flex-wrap items-center gap-2 text-xs"
    >
      <Link
        href={doItAiHref}
        className="inline-flex items-center gap-1 rounded-md border border-white/15 bg-white/[0.04] px-2.5 py-1.5 font-medium text-slate-200 transition hover:border-white/30 hover:bg-white/10 hover:text-white"
        title={title ? `Open ${title} in Do It AI` : "Open in Do It AI"}
      >
        <span>Open in Do It AI</span>
        <ArrowUpRight className="h-3.5 w-3.5 text-slate-400" aria-hidden="true" />
      </Link>

      <div ref={menuRef} className="relative">
        <button
          type="button"
          onClick={() => setMenuOpen((prev) => !prev)}
          aria-expanded={menuOpen}
          aria-haspopup="menu"
          className="inline-flex items-center gap-1 rounded-md border border-white/15 bg-white/[0.04] px-2.5 py-1.5 font-medium text-slate-200 transition hover:border-white/30 hover:bg-white/10 hover:text-white"
        >
          <span>Embed / PC App</span>
          <ChevronDown
            className={`h-3.5 w-3.5 text-slate-400 transition-transform ${
              menuOpen ? "rotate-180" : ""
            }`}
            aria-hidden="true"
          />
        </button>

        {menuOpen && (
          <div
            role="menu"
            className="absolute right-0 z-40 mt-2 w-56 rounded-lg border border-slate-700/80 bg-[#1B1F27] p-1.5 shadow-2xl"
          >
            {onCustomizeEmbed ? (
              <button
                type="button"
                role="menuitem"
                onClick={() => {
                  setMenuOpen(false);
                  onCustomizeEmbed();
                }}
                className="flex w-full items-center gap-2.5 rounded-md px-2.5 py-2 text-left text-xs font-medium text-slate-200 transition hover:bg-white/10 hover:text-white"
              >
                <Code2 className="h-4 w-4 text-slate-400" aria-hidden="true" />
                <span>Customize &amp; Embed</span>
              </button>
            ) : (
              <Link
                href={embedHref}
                role="menuitem"
                onClick={() => setMenuOpen(false)}
                className="flex w-full items-center gap-2.5 rounded-md px-2.5 py-2 text-xs font-medium text-slate-200 transition hover:bg-white/10 hover:text-white"
              >
                <Code2 className="h-4 w-4 text-slate-400" aria-hidden="true" />
                <span>Customize &amp; Embed</span>
              </Link>
            )}

            {onDownloadZip ? (
              <button
                type="button"
                role="menuitem"
                onClick={() => {
                  setMenuOpen(false);
                  onDownloadZip();
                }}
                className="flex w-full items-center gap-2.5 rounded-md px-2.5 py-2 text-left text-xs font-medium text-slate-200 transition hover:bg-white/10 hover:text-white"
              >
                <Archive className="h-4 w-4 text-slate-400" aria-hidden="true" />
                <span>Download PC App (.ZIP)</span>
              </button>
            ) : (
              <Link
                href={downloadHref}
                role="menuitem"
                onClick={() => setMenuOpen(false)}
                className="flex w-full items-center gap-2.5 rounded-md px-2.5 py-2 text-xs font-medium text-slate-200 transition hover:bg-white/10 hover:text-white"
              >
                <Archive className="h-4 w-4 text-slate-400" aria-hidden="true" />
                <span>Download PC App (.ZIP)</span>
              </Link>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
