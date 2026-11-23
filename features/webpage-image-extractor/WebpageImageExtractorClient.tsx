"use client";

import { useMemo, useRef, useState } from "react";
import ToolRunOverlay, {
  focusToolSection,
} from "@/features/tool-ui/ToolRunOverlay";
import {
  AlertTriangle,
  CheckCircle2,
  Copy,
  Download,
  ExternalLink,
  Globe,
  Image as ImageIcon,
  Maximize2,
  Sparkles,
  X,
  ZoomIn,
  ZoomOut,
} from "lucide-react";
import {
  buildImageFilename,
  DEFAULT_EXTRACTED_IMAGES,
  DEFAULT_IMAGE_EXTRACTOR_URL,
  type ExtractedPageImage,
} from "./model";

export default function WebpageImageExtractorClient() {
  const [url, setUrl] = useState(DEFAULT_IMAGE_EXTRACTOR_URL);
  const [images, setImages] = useState<ExtractedPageImage[]>(
    DEFAULT_EXTRACTED_IMAGES,
  );
  const [selectedIds, setSelectedIds] = useState<Record<string, boolean>>({
    "img-1": true,
    "img-2": true,
    "img-3": true,
  });
  const [roleFilter, setRoleFilter] = useState<string>("all");
  const [inspectedImg, setInspectedImg] = useState<ExtractedPageImage | null>(
    null,
  );
  const [zoomLevel, setZoomLevel] = useState<number>(1);
  const [loadingExtract, setLoadingExtract] = useState(false);
  const [loadingZip, setLoadingZip] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [toast, setToast] = useState("");
  const resultsRef = useRef<HTMLDivElement>(null);

  function notify(msg: string) {
    setError(null);
    setToast(msg);
    setTimeout(() => setToast(""), 2800);
  }

  const filteredImages = useMemo(() => {
    if (roleFilter === "all") return images;
    return images.filter((img) => img.role === roleFilter);
  }, [images, roleFilter]);

  const selectedList = useMemo(
    () => images.filter((img) => selectedIds[img.id]),
    [images, selectedIds],
  );

  const missingAltCount = useMemo(
    () => images.filter((img) => !img.alt || !img.alt.trim()).length,
    [images],
  );

  function updateImageAlt(id: string, newAlt: string) {
    setImages((prev) =>
      prev.map((img) => (img.id === id ? { ...img, alt: newAlt } : img)),
    );
  }

  function autoFillMissingAltText() {
    let domain = "webpage";
    try {
      domain = new URL(url).hostname.replace(/^www\./, "");
    } catch {}
    setImages((prev) =>
      prev.map((img, idx) => {
        if (img.alt && img.alt.trim()) return img;
        const cleanName = img.filename
          .replace(/\.[a-z0-9]+$/i, "")
          .replace(/[-_]+/g, " ")
          .trim();
        return {
          ...img,
          alt: `${img.role} visual (${cleanName || `image ${idx + 1}`}) from ${domain}`,
        };
      }),
    );
    notify("Auto-generated descriptive SEO alt text for all missing images!");
  }

  async function handleExtractImages(e?: React.FormEvent) {
    if (e) e.preventDefault();
    if (!url.trim()) {
      setError("Please enter a public webpage URL to extract images.");
      return;
    }
    setLoadingExtract(true);
    setError(null);
    try {
      const res = await fetch("/api/ai-tools/universal-extract", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: url.trim() }),
      });
      const data = await res.json();
      if (
        data?.images &&
        Array.isArray(data.images) &&
        data.images.length > 0
      ) {
        const mapped: ExtractedPageImage[] = data.images.map(
          (item: any, idx: number) => ({
            id: `img-${idx + 1}`,
            src: item.src,
            filename: buildImageFilename(item.src, idx, item.format || "JPG"),
            alt: item.alt || "",
            width: item.width || 800,
            height: item.height || 500,
            format: item.format || "JPG",
            role: item.role || "Article Content",
          }),
        );
        setImages(mapped);
        const nextSel: Record<string, boolean> = {};
        mapped.forEach((m) => {
          nextSel[m.id] = true;
        });
        setSelectedIds(nextSel);
        notify(`Extracted ${mapped.length} images from ${data.domain}!`);
        setTimeout(() => focusToolSection(resultsRef.current), 120);
      } else {
        setError(
          data?.error?.message || "No public <img> tags detected on that URL.",
        );
      }
    } catch {
      setError("Could not reach URL. Check that it is publicly accessible.");
    } finally {
      setLoadingExtract(false);
    }
  }

  async function handleDownloadZipBundle() {
    if (selectedList.length === 0) {
      setError("Select at least 1 image first.");
      return;
    }
    setLoadingZip(true);
    setError(null);
    try {
      const res = await fetch("/api/ai-tools/webpage-image-extractor", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          pageUrl: url,
          images: selectedList.slice(0, 25).map((img) => ({
            src: img.src,
            filename: img.filename,
            alt: img.alt,
          })),
        }),
      });
      if (!res.ok) {
        setError("Could not package ZIP archive.");
        return;
      }
      const blob = await res.blob();
      const dlUrl = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = dlUrl;
      a.download = "webpage-images-bundle.zip";
      a.click();
      setTimeout(() => URL.revokeObjectURL(dlUrl), 1000);
      notify(
        `Downloaded ${selectedList.length} images + manifest as webpage-images-bundle.zip!`,
      );
    } catch {
      setError("Error downloading ZIP bundle.");
    } finally {
      setLoadingZip(false);
    }
  }

  return (
    <section
      aria-label="Webpage Image Extractor and Bulk ZIP Downloader Workspace"
      className="mx-auto w-full max-w-6xl space-y-6 overflow-x-clip px-4 py-10 sm:px-6"
    >
      <ToolRunOverlay
        active={loadingExtract || loadingZip}
        title={
          loadingZip
            ? "Packaging Images into .ZIP Archive"
            : "Scanning Webpage DOM for Images"
        }
        description={
          loadingZip
            ? "Fetching binary image files and generating 00-images-manifest.csv…"
            : "Discovering <img> tags, Open Graph covers, and lazy-loaded media assets…"
        }
      />

      {/* Top URL Input & Bulk ZIP Action Bar */}
      <form
        onSubmit={handleExtractImages}
        className="shadow-xs rounded-3xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-[#111827] sm:p-6"
      >
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <span className="text-xs font-extrabold uppercase tracking-wider text-[#3452d1] dark:text-[#9aabff]">
              1-Click Visual Asset, Alt-Text Auditor &amp; OG Image Extractor
            </span>
            <h2 className="mt-0.5 text-lg font-black">
              Enter Any Article or Webpage URL to Extract &amp; Audit All Images
            </h2>
          </div>

          <div className="flex flex-wrap gap-2">
            {missingAltCount > 0 && (
              <button
                type="button"
                onClick={autoFillMissingAltText}
                className="inline-flex items-center gap-1.5 rounded-xl border border-[#4058d0] bg-[#4058d0]/10 px-3.5 py-2.5 text-xs font-extrabold text-[#4058d0] hover:bg-[#4058d0] hover:text-white"
              >
                <Sparkles size={14} />
                Auto-Fill {missingAltCount} Missing Alt Texts
              </button>
            )}
            <button
              type="button"
              onClick={handleDownloadZipBundle}
              disabled={loadingZip || selectedList.length === 0}
              className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-xs font-extrabold text-white shadow-sm hover:bg-emerald-700 disabled:opacity-60"
            >
              <Download size={15} />
              {loadingZip
                ? "Packaging .ZIP Archive…"
                : `Download Selected (${selectedList.length}) as .ZIP`}
            </button>
          </div>
        </div>

        <div className="mt-4 flex flex-col gap-3 sm:flex-row">
          <div className="relative flex min-w-0 flex-1 items-center">
            <Globe
              size={15}
              className="pointer-events-none absolute left-3.5 text-slate-400"
            />
            <input
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://example.com/article"
              className="w-full min-w-0 rounded-xl border border-slate-300 bg-white py-2.5 pl-9 pr-3.5 font-mono text-xs dark:border-slate-700 dark:bg-slate-900"
            />
          </div>
          <button
            type="submit"
            disabled={loadingExtract}
            className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-[#3452d1] px-5 py-2.5 text-xs font-extrabold text-white shadow-sm hover:bg-[#2842b5] disabled:opacity-60"
          >
            <ImageIcon size={15} />
            {loadingExtract ? "Scanning Page DOM…" : "Extract All Page Images"}
          </button>
        </div>

        {error && (
          <div
            role="alert"
            className="mt-4 flex items-center justify-between gap-2 rounded-xl border border-rose-500/40 bg-rose-500/10 px-4 py-2.5 text-xs font-bold text-rose-700 dark:text-rose-300"
          >
            <span className="inline-flex items-center gap-2">
              <AlertTriangle size={15} />
              {error}
            </span>
            <button
              type="button"
              onClick={() => setError(null)}
              className="underline"
            >
              Dismiss
            </button>
          </div>
        )}

        {toast && (
          <div
            role="status"
            className="mt-4 flex items-center gap-2 rounded-xl border border-emerald-500/40 bg-emerald-500/10 px-4 py-2.5 text-xs font-bold text-emerald-800 dark:text-emerald-300"
          >
            <CheckCircle2 size={15} />
            <span>{toast}</span>
          </div>
        )}
      </form>

      {/* ZOOMABLE HD IMAGE INSPECTOR STAGE */}
      {inspectedImg && (
        <div className="overflow-hidden rounded-2xl border-2 border-[#4058d0] bg-[#070b14] text-white shadow-2xl">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 bg-slate-900 px-4 py-2.5">
            <span className="text-xs font-extrabold text-[#9aabff]">
              HD Asset Zoom Inspector · {inspectedImg.filename} (
              {inspectedImg.width}×{inspectedImg.height}px · {inspectedImg.role})
            </span>
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() =>
                  setZoomLevel((z) => Math.max(0.6, +(z - 0.2).toFixed(2)))
                }
                className="rounded-lg bg-slate-800 px-2 py-1 text-xs font-bold text-white hover:bg-slate-700"
              >
                <ZoomOut size={13} />
              </button>
              {[1, 1.5, 2].map((preset) => (
                <button
                  key={preset}
                  type="button"
                  onClick={() => setZoomLevel(preset)}
                  className={`rounded-lg px-2.5 py-1 text-xs font-bold ${
                    Math.abs(zoomLevel - preset) < 0.05
                      ? "bg-[#4058d0] text-white"
                      : "bg-slate-800 text-slate-300"
                  }`}
                >
                  {Math.round(preset * 100)}%
                </button>
              ))}
              <button
                type="button"
                onClick={() =>
                  setZoomLevel((z) => Math.min(2.5, +(z + 0.2).toFixed(2)))
                }
                className="rounded-lg bg-slate-800 px-2 py-1 text-xs font-bold text-white hover:bg-slate-700"
              >
                <ZoomIn size={13} />
              </button>
              <button
                type="button"
                onClick={() => setInspectedImg(null)}
                className="inline-flex items-center gap-1 rounded-lg bg-rose-600 px-2.5 py-1 text-xs font-bold text-white hover:bg-rose-500"
              >
                <X size={13} /> Close
              </button>
            </div>
          </div>
          <div className="max-h-[540px] overflow-auto p-4">
            <div
              style={{
                width:
                  zoomLevel === 1 ? "100%" : `${Math.round(zoomLevel * 100)}%`,
                maxWidth: zoomLevel === 1 ? "720px" : "none",
                transition: "width 0.16s ease-out",
              }}
              className="mx-auto"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={inspectedImg.src}
                alt={inspectedImg.alt || inspectedImg.filename}
                className="mx-auto block h-auto w-full rounded-xl object-contain shadow-2xl"
              />
            </div>
          </div>
        </div>
      )}

      {/* Filter & Bulk Selection Controls */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap gap-1.5">
          {[
            ["all", `All Images (${images.length})`],
            ["Open Graph / Social", "Open Graph / Social"],
            ["Article Content", "Article Content"],
            ["Logo / Icon", "Logos & Icons"],
          ].map(([val, lbl]) => (
            <button
              key={val}
              type="button"
              onClick={() => setRoleFilter(val)}
              className={`rounded-xl px-3 py-1.5 text-xs font-bold transition ${
                roleFilter === val
                  ? "bg-[#3452d1] text-white"
                  : "border border-slate-300 bg-white text-slate-700 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
              }`}
            >
              {lbl}
            </button>
          ))}
        </div>

        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => {
              const all: Record<string, boolean> = {};
              images.forEach((i) => {
                all[i.id] = true;
              });
              setSelectedIds(all);
            }}
            className="rounded-lg border border-slate-300 bg-white px-3 py-1 text-xs font-bold dark:border-slate-700 dark:bg-slate-800"
          >
            Select All
          </button>
          <button
            type="button"
            onClick={() => setSelectedIds({})}
            className="rounded-lg border border-slate-300 bg-white px-3 py-1 text-xs font-bold dark:border-slate-700 dark:bg-slate-800"
          >
            Clear Selection
          </button>
        </div>
      </div>

      {/* Image Cards Grid with Inline Alt-Text Editor & Zoom */}
      <div
        ref={resultsRef}
        tabIndex={-1}
        className="grid gap-4 focus:outline-none sm:grid-cols-2 lg:grid-cols-3"
      >
        {filteredImages.map((img) => {
          const checked = Boolean(selectedIds[img.id]);
          return (
            <div
              key={img.id}
              className={`shadow-xs flex flex-col justify-between rounded-2xl border p-4 transition ${
                checked
                  ? "border-[#3452d1] bg-white dark:border-[#5271ff] dark:bg-[#111827]"
                  : "border-slate-200 bg-slate-50/70 opacity-80 dark:border-slate-800 dark:bg-slate-900/50"
              }`}
            >
              <div>
                <div className="flex items-center justify-between gap-2">
                  <label className="flex cursor-pointer items-center gap-2 text-xs font-extrabold">
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={(e) =>
                        setSelectedIds((prev) => ({
                          ...prev,
                          [img.id]: e.target.checked,
                        }))
                      }
                      className="h-4 w-4 accent-[#3452d1]"
                    />
                    <span className="truncate">{img.filename}</span>
                  </label>
                  <span className="rounded bg-[#3452d1]/15 px-2 py-0.5 font-mono text-[10px] font-extrabold text-[#3452d1] dark:text-[#9aabff]">
                    {img.format}
                  </span>
                </div>

                {/* Click-to-Zoom Visual Preview Box */}
                <div
                  onClick={() => {
                    setInspectedImg(img);
                    setZoomLevel(1.25);
                  }}
                  title="Click to zoom and inspect image"
                  className="mt-3 flex h-40 cursor-zoom-in items-center justify-center overflow-hidden rounded-xl border border-slate-200 bg-slate-900/90 p-2 dark:border-slate-800"
                >
                  <div
                    role="img"
                    aria-label={img.alt || img.filename}
                    className="h-full w-full bg-contain bg-center bg-no-repeat"
                    style={{ backgroundImage: `url("${img.src}")` }}
                  />
                </div>

                <div className="mt-2.5">
                  <label className="flex items-center justify-between text-[11px] font-bold text-slate-600 dark:text-slate-300">
                    <span>Editable SEO Alt Text:</span>
                    {!img.alt.trim() && (
                      <span className="text-[10px] font-extrabold text-rose-500">
                        ⚠ Missing alt
                      </span>
                    )}
                  </label>
                  <input
                    type="text"
                    value={img.alt}
                    onChange={(e) => updateImageAlt(img.id, e.target.value)}
                    placeholder="Add descriptive SEO alt text..."
                    className="mt-1 w-full rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs font-semibold text-slate-900 focus:border-[#4058d0] focus:bg-white focus:outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                  />
                </div>

                <p className="mt-1.5 truncate font-mono text-[11px] text-slate-500">
                  {img.width} × {img.height}px · {img.role}
                </p>
              </div>

              <div className="mt-3.5 flex items-center justify-between gap-2 border-t border-slate-200/80 pt-3 text-xs dark:border-slate-800">
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={async () => {
                      await navigator.clipboard.writeText(img.src);
                      notify("Copied direct image URL!");
                    }}
                    className="inline-flex items-center gap-1 font-bold text-slate-700 hover:text-[#3452d1] dark:text-slate-200"
                  >
                    <Copy size={12} /> Copy URL
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setInspectedImg(img);
                      setZoomLevel(1.25);
                    }}
                    className="inline-flex items-center gap-1 font-bold text-[#4058d0] hover:underline"
                  >
                    <Maximize2 size={12} /> Zoom
                  </button>
                </div>
                <a
                  href={img.src}
                  target="_blank"
                  rel="noopener noreferrer"
                  download={img.filename}
                  className="inline-flex items-center gap-1 font-extrabold text-[#3452d1] hover:underline dark:text-[#9aabff]"
                >
                  Open / Save <ExternalLink size={12} />
                </a>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
