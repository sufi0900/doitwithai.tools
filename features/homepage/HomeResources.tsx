"use client";
import { useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  ArrowRight,
  Copy,
  X,
  Gift,
  FileText,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import type { HomeResource } from "./data";
function ResourceCard({ resource: r }: { resource: HomeResource }) {
  const dialog = useRef<HTMLDialogElement>(null);
  const [copied, setCopied] = useState("");
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(r.prompt);
      setCopied("Prompt copied.");
    } catch {
      setCopied(
        "Copy is unavailable. Select the prompt text and copy it manually.",
      );
    }
  };
  return (
    <article className="home-learning-card">
      <div className="relative aspect-[16/10] overflow-hidden bg-slate-100 dark:bg-slate-800">
        <FileText
          aria-hidden
          className="absolute left-1/2 top-1/2 h-12 w-12 -translate-x-1/2 -translate-y-1/2 text-[#5271ff]/50"
        />
        {r.image ? (
          <Image
            src={`${r.image}?w=640&h=400&fit=crop&auto=format`}
            alt={r.imageAlt || r.title}
            fill
            sizes="(max-width: 767px) 100vw, 33vw"
            className="object-cover"
          />
        ) : (
          <FileText
            aria-hidden
            className="absolute left-1/2 top-1/2 h-12 w-12 -translate-x-1/2 -translate-y-1/2 text-[#5271ff]"
          />
        )}
      </div>
      <div className="flex flex-1 flex-col p-6">
        <p className="home-eyebrow text-xs">
          {r.prompt
            ? "Free prompt"
            : r.format === "image"
              ? "Learning visual"
              : "Free resource"}
        </p>
        <h3 className="mt-2 text-lg font-bold leading-relaxed text-slate-900 dark:text-white">
          {r.title}
        </h3>
        <p className="mt-3 line-clamp-3 text-sm leading-7 text-slate-600 dark:text-slate-300">
          {r.overview ||
            "Open this resource to see its details and how you can use it."}
        </p>
        {r.prompt ? (
          <button
            type="button"
            className="home-text-link mt-auto pt-5"
            onClick={() => {
              setCopied("");
              dialog.current?.showModal();
            }}
          >
            View prompt <ArrowRight aria-hidden className="h-4 w-4" />
            <span className="sr-only">: {r.title}</span>
          </button>
        ) : (
          <a
            className="home-text-link mt-auto pt-5"
            href={r.href}
            target="_blank"
            rel="noopener noreferrer"
          >
            {r.action} <ArrowRight aria-hidden className="h-4 w-4" />
            <span className="sr-only">: {r.title} (opens in a new tab)</span>
          </a>
        )}
      </div>
      {r.prompt && (
        <dialog
          ref={dialog}
          aria-labelledby={`prompt-${r._id}`}
          className="home-prompt-dialog"
          onClick={(e) => {
            if (e.target === e.currentTarget) dialog.current?.close();
          }}
        >
          <div className="flex items-start justify-between gap-4">
            <h4 id={`prompt-${r._id}`} className="text-xl font-bold">
              {r.title}
            </h4>
            <button
              type="button"
              aria-label="Close prompt"
              className="home-focus grid min-h-11 min-w-11 place-items-center rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
              onClick={() => dialog.current?.close()}
            >
              <X aria-hidden className="h-5 w-5" />
            </button>
          </div>
          <p className="mt-5 whitespace-pre-wrap rounded-xl bg-slate-50 p-5 text-sm leading-7 dark:bg-slate-800">
            {r.prompt}
          </p>
          <button
            type="button"
            onClick={copy}
            className="home-primary-button mt-5"
          >
            <Copy aria-hidden className="h-4 w-4" />
            Copy prompt
          </button>
          <p role="status" className="mt-3 text-sm">
            {copied}
          </p>
        </dialog>
      )}
    </article>
  );
}
export default function HomeResources({
  resources,
}: {
  resources: HomeResource[];
}) {
  const track = useRef<HTMLDivElement>(null);
  const move = (direction: number) => {
    const element = track.current;
    if (!element) return;
    element.scrollBy({
      left:
        direction *
        (element.firstElementChild?.getBoundingClientRect().width ||
          element.clientWidth),
      behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches
        ? "auto"
        : "smooth",
    });
  };
  return (
    <section
      aria-labelledby="resources-title"
      className="home-section bg-slate-50 dark:bg-[#0D1422]"
    >
      <div className="home-shell">
        <div className="home-section-head">
          <div>
            <p className="home-eyebrow">Useful starting points</p>
            <h2 id="resources-title" className="home-title">
              Free resources to put AI into practice
            </h2>
            <p className="home-description">
              Explore prompts and learning resources you can adapt to your next
              task, with clear details about what each resource provides.
            </p>
          </div>
          <Link className="home-text-link shrink-0" href="/free-ai-resources">
            Explore free resources{" "}
            <ArrowRight aria-hidden className="h-4 w-4" />
          </Link>
        </div>
        {resources.length ? (
          <div
            className="home-resource-track"
            ref={track}
            aria-label="Free AI resources"
            tabIndex={0}
          >
            {resources.map((r) => (
              <div className="home-resource-slide" key={r._id}>
                <ResourceCard resource={r} />
              </div>
            ))}
          </div>
        ) : (
          <div className="home-fallback">
            <Gift aria-hidden className="h-7 w-7 text-[#5271ff]" />
            <p>Find prompts and learning resources in our free collection.</p>
            <Link className="home-text-link" href="/free-ai-resources">
              Open the resource collection{" "}
              <ArrowRight aria-hidden className="h-4 w-4" />
            </Link>
          </div>
        )}
        {resources.length > 1 && (
          <div className="home-carousel-controls">
            <p className="text-sm text-slate-600 dark:text-slate-300">
              Swipe or use the arrows to explore.
            </p>
            <div className="flex gap-2">
              <button
                type="button"
                className="home-carousel-button"
                aria-label="Previous resource"
                onClick={() => move(-1)}
              >
                <ChevronLeft aria-hidden />
              </button>
              <button
                type="button"
                className="home-carousel-button"
                aria-label="Next resource"
                onClick={() => move(1)}
              >
                <ChevronRight aria-hidden />
              </button>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
