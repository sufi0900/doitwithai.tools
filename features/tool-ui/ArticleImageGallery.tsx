"use client";

import React, { useId, useState } from "react";
import { Check, ImageOff, Search } from "lucide-react";
import type { ExtractedImageAsset } from "./UrlArticleExtractorBar";

export function ArticleImageGallery({
  images,
  selectedSrc,
  onSelect,
}: {
  images: ExtractedImageAsset[];
  selectedSrc?: string;
  onSelect: (image: ExtractedImageAsset, index: number) => void;
}) {
  const searchId = useId();
  const [query, setQuery] = useState("");
  const [failed, setFailed] = useState<Set<string>>(new Set());
  const [attempt, setAttempt] = useState(0);
  const matches = images
    .map((image, index) => ({ image, index }))
    .filter(({ image, index }) =>
      `${index + 1} ${image.alt} ${image.role}`
        .toLowerCase()
        .includes(query.trim().toLowerCase()),
    );
  return (
    <div className="w-full min-w-0 space-y-3 border-t border-slate-200 pt-4 dark:border-slate-700">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">
            Article images ({images.length})
          </h3>
          <p className="mt-1 text-xs text-slate-600 dark:text-slate-300">
            Choose any image to use in your visual card. Thumbnails show the
            full image.
          </p>
        </div>
        {images.length > 0 && (
          <div className="relative w-full sm:w-64">
            <label htmlFor={searchId} className="sr-only">
              Search article images
            </label>
            <Search
              size={14}
              aria-hidden
              className="absolute left-3 top-3 text-slate-400"
            />
            <input
              id={searchId}
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search image descriptions or numbers"
              className="min-h-10 w-full rounded-xl border border-slate-300 bg-white py-2 pl-9 pr-3 text-xs text-slate-900 focus:outline-[#5271ff] dark:border-slate-600 dark:bg-slate-950 dark:text-white"
            />
          </div>
        )}
      </div>
      {images.length === 0 ? (
        <p className="rounded-xl border border-dashed border-slate-300 p-4 text-xs leading-6 text-slate-600 dark:border-slate-700 dark:text-slate-300">
          Import an article to browse its images, or upload your own photo. Some
          sites only load images after a visitor opens the page.
        </p>
      ) : (
        <>
          <p
            role="status"
            className="text-xs text-slate-500 dark:text-slate-400"
          >
            Showing {matches.length} of {images.length} images
            {selectedSrc ? " · 1 selected" : " · No article image selected"}
          </p>
          <div
            role="group"
            aria-label="Article image choices"
            tabIndex={0}
            className="grid max-h-80 grid-cols-2 gap-2 overflow-y-auto overscroll-contain p-1 sm:grid-cols-4 lg:grid-cols-6"
          >
            {matches.map(({ image, index }) => {
              const selected = selectedSrc === image.src;
              const unavailable = failed.has(image.src);
              return (
                <button
                  key={`${image.src}-${attempt}`}
                  type="button"
                  aria-pressed={selected}
                  aria-label={`Use article image ${index + 1}: ${image.alt || image.role}`}
                  disabled={unavailable}
                  title={image.alt || image.role}
                  onClick={() => onSelect(image, index)}
                  className={`relative min-w-0 overflow-hidden rounded-xl border-2 text-left transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#5271ff] disabled:opacity-60 ${selected ? "border-[#4058d0] bg-indigo-50 dark:bg-indigo-950" : "border-slate-200 bg-white hover:border-[#5271ff] dark:border-slate-700 dark:bg-slate-950"}`}
                >
                  <span className="flex aspect-[4/3] items-center justify-center bg-slate-100 dark:bg-slate-800">
                    {unavailable ? (
                      <span className="flex flex-col items-center gap-1 text-xs text-slate-500">
                        <ImageOff size={22} />
                        Unavailable
                      </span>
                    ) : (
                      // Full-size source is retained for the card and export; loading is deferred off screen.
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={image.src}
                        alt=""
                        loading="lazy"
                        decoding="async"
                        referrerPolicy="no-referrer"
                        onError={() =>
                          setFailed((previous) =>
                            new Set(previous).add(image.src),
                          )
                        }
                        className="h-full w-full object-contain"
                      />
                    )}
                  </span>
                  <span className="block truncate px-2 py-1.5 text-[11px] font-semibold text-slate-700 dark:text-slate-200">
                    {index + 1}. {image.alt || image.role}
                  </span>
                  {selected && (
                    <span className="absolute right-1.5 top-1.5 rounded-full bg-[#4058d0] p-1 text-white">
                      <Check size={13} aria-hidden />
                    </span>
                  )}
                </button>
              );
            })}
          </div>
          {matches.length === 0 && (
            <p className="py-3 text-xs text-slate-600 dark:text-slate-300">
              No matching images.{" "}
              <button
                type="button"
                onClick={() => setQuery("")}
                className="font-bold text-[#4058d0] underline dark:text-indigo-300"
              >
                Clear search
              </button>
            </p>
          )}
          {failed.size > 0 && (
            <p className="text-xs text-amber-800 dark:text-amber-300">
              Some images could not load from the source.{" "}
              <button
                type="button"
                onClick={() => {
                  setFailed(new Set());
                  setAttempt((value) => value + 1);
                }}
                className="font-bold underline"
              >
                Retry images
              </button>{" "}
              or upload a saved copy.
            </p>
          )}
        </>
      )}
    </div>
  );
}
