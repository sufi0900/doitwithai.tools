"use client";
import ToolUrlInput from "@/features/tool-ui/ToolUrlInput";

import React, { useMemo, useState } from "react";
import {
  AlertTriangle,
  CheckCircle2,
  Copy,
  Download,
  Globe,
  ImageIcon,
  Info,
  Loader2,
  Upload,
  XCircle,
  ZoomIn,
  ZoomOut,
} from "lucide-react";
import {
  inputClass as sharedInputClass,
  panelClass,
  primaryButton,
  secondaryButton,
} from "@/features/writing-tools/config";
const inputClass = `${sharedInputClass} min-w-0`;
import { buildMetaTags, defaultState, validateOgState } from "./generator";
import { checkImage, importOgTags } from "./client";
import type { ImageProbeResult, OgState, TwitterCardType } from "./types";

function FacebookPreview({
  state,
  fitMode,
}: {
  state: OgState;
  fitMode: "contain" | "cover";
}) {
  const host = (() => {
    try {
      return new URL(state.pageUrl).hostname.toUpperCase();
    } catch {
      return state.siteName || "EXAMPLE.COM";
    }
  })();
  return (
    <div className="overflow-hidden rounded-xl border border-slate-300 bg-white dark:border-slate-600 dark:bg-slate-900">
      <div className="aspect-[1.91/1] w-full bg-slate-900/90 dark:bg-slate-800">
        {state.imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={state.imageUrl}
            alt=""
            className={`h-full w-full ${fitMode === "contain" ? "object-contain" : "object-cover"}`}
          />
        ) : (
          <div className="flex h-full items-center justify-center text-slate-400">
            <ImageIcon className="h-8 w-8" />
          </div>
        )}
      </div>
      <div className="space-y-1 border-t border-slate-200 p-3 dark:border-slate-700">
        <p className="text-[11px] uppercase tracking-wide text-slate-500 dark:text-slate-400">
          {host}
        </p>
        <p className="truncate text-sm font-bold text-slate-900 dark:text-white">
          {state.title || "Your page title"}
        </p>
        <p className="line-clamp-2 text-xs text-slate-500 dark:text-slate-400">
          {state.description || "Your page description will show here."}
        </p>
      </div>
    </div>
  );
}

function TwitterPreview({
  state,
  fitMode,
}: {
  state: OgState;
  fitMode: "contain" | "cover";
}) {
  const host = (() => {
    try {
      return new URL(state.pageUrl).hostname;
    } catch {
      return state.siteName || "example.com";
    }
  })();
  const large = state.twitterCardType === "summary_large_image";
  return (
    <div
      className={`overflow-hidden rounded-2xl border border-slate-300 bg-white dark:border-slate-600 dark:bg-slate-900 ${large ? "" : "flex"}`}
    >
      <div
        className={
          large
            ? "aspect-[1.91/1] w-full bg-slate-900/90 dark:bg-slate-800"
            : "h-28 w-28 shrink-0 bg-slate-900/90 dark:bg-slate-800"
        }
      >
        {state.imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={state.imageUrl}
            alt=""
            className={`h-full w-full ${fitMode === "contain" ? "object-contain" : "object-cover"}`}
          />
        ) : (
          <div className="flex h-full items-center justify-center text-slate-400">
            <ImageIcon className="h-6 w-6" />
          </div>
        )}
      </div>
      <div className="min-w-0 flex-1 space-y-1 border-t border-slate-200 p-3 dark:border-slate-700">
        <p className="truncate text-sm font-bold text-slate-900 dark:text-white">
          {state.title || "Your page title"}
        </p>
        <p className="line-clamp-2 text-xs text-slate-500 dark:text-slate-400">
          {state.description || "Your page description will show here."}
        </p>
        <p className="text-xs text-slate-400">{host}</p>
      </div>
    </div>
  );
}

function SlackWhatsAppPreview({
  state,
  fitMode,
}: {
  state: OgState;
  fitMode: "contain" | "cover";
}) {
  return (
    <div className="flex overflow-hidden rounded-xl border border-slate-200 bg-slate-50 p-3 dark:border-slate-700 dark:bg-slate-900">
      <div className="mr-3 w-1 shrink-0 rounded-full bg-[#4058d0]" />
      <div className="min-w-0 flex-1 space-y-1.5">
        <p className="text-xs font-extrabold text-slate-600 dark:text-slate-300">
          {state.siteName || "Do It With AI Tools"}
        </p>
        <p className="truncate text-sm font-bold text-[#3452d1] dark:text-[#9aabff]">
          {state.title || "Your page title"}
        </p>
        <p className="line-clamp-2 text-xs text-slate-600 dark:text-slate-300">
          {state.description || "Your page description will show here."}
        </p>
        {state.imageUrl && (
          <div className="mt-2 aspect-[1.91/1] max-w-xs overflow-hidden rounded-lg border border-slate-200 bg-slate-900 dark:border-slate-700">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={state.imageUrl}
              alt=""
              className={`h-full w-full ${fitMode === "contain" ? "object-contain" : "object-cover"}`}
            />
          </div>
        )}
      </div>
    </div>
  );
}

export default function OgPreviewClient() {
  const [state, setState] = useState<OgState>(() => defaultState());
  const [imageProbe, setImageProbe] = useState<ImageProbeResult | null>(null);
  const [fitMode, setFitMode] = useState<"contain" | "cover">("cover");
  const [zoomScale, setZoomScale] = useState<number>(1);
  const [importing, setImporting] = useState(false);
  const [checkingImage, setCheckingImage] = useState(false);
  const [message, setMessage] = useState<{
    tone: "error" | "success";
    text: string;
  } | null>(null);
  const [copied, setCopied] = useState(false);

  const output = useMemo(() => buildMetaTags(state), [state]);
  const issues = useMemo(
    () => validateOgState(state, imageProbe),
    [state, imageProbe],
  );
  const errorCount = issues.filter((issue) => issue.level === "error").length;

  function update<K extends keyof OgState>(key: K, value: OgState[K]) {
    setState((previous) => ({ ...previous, [key]: value }));
  }

  function handleCustomImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") {
        update("imageUrl", reader.result);
        setMessage({
          tone: "success",
          text: `Loaded local image "${file.name}" into social card preview!`,
        });
      }
    };
    reader.readAsDataURL(file);
  }

  async function handleImport() {
    if (!state.pageUrl.trim()) return;
    setImporting(true);
    setMessage(null);
    const outcome = await importOgTags(state.pageUrl.trim());
    setImporting(false);
    if (outcome.ok === false) {
      setMessage({ tone: "error", text: outcome.message });
      return;
    }
    setState((previous) => ({
      ...previous,
      ...outcome.state,
      pageUrl: outcome.finalUrl,
    }));
    setMessage({
      tone: "success",
      text: `Imported existing tags from ${outcome.finalUrl}. Review and edit below.`,
    });
  }

  async function handleCheckImage() {
    if (!state.imageUrl.trim()) return;
    setCheckingImage(true);
    setMessage(null);
    const outcome = await checkImage(state.imageUrl.trim());
    setCheckingImage(false);
    if (outcome.ok === false) {
      setImageProbe(null);
      setMessage({ tone: "error", text: outcome.message });
      return;
    }
    setImageProbe(outcome.result);
  }

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(output);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setMessage({
        tone: "error",
        text: "Could not copy automatically; select the text and copy manually.",
      });
    }
  }

  function handleDownloadHtml() {
    const blob = new Blob([output], { type: "text/html;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "open-graph-meta-tags.html";
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    setMessage({
      tone: "success",
      text: "Downloaded open-graph-meta-tags.html!",
    });
  }

  return (
    <div id="og-twitter-preview-generator" className={`${panelClass} p-5 sm:p-8`}>
      <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
        <div className="space-y-5">
          <div>
            <label className="text-xs font-bold text-slate-600 dark:text-slate-300">
              Page URL
            </label>
            <div className="mt-1.5 flex flex-col gap-2 sm:flex-row">
              <ToolUrlInput
                className={inputClass}
                value={state.pageUrl}
                onChange={(event) => update("pageUrl", event.target.value)}
                placeholder="https://example.com/article"
                inputMode="url"
              />
              <button
                type="button"
                onClick={handleImport}
                disabled={importing || !state.pageUrl.trim()}
                className={`${secondaryButton} shrink-0`}
              >
                {importing ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <Globe className="h-3.5 w-3.5" />
                )}
                {importing ? "Importing…" : "Import existing tags"}
              </button>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="text-xs font-bold text-slate-600 dark:text-slate-300">
                Site name
              </label>
              <input
                className={`${inputClass} mt-1.5`}
                value={state.siteName}
                onChange={(event) => update("siteName", event.target.value)}
                placeholder="Do It With AI Tools"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-slate-600 dark:text-slate-300">
                Twitter / X handle
              </label>
              <input
                className={`${inputClass} mt-1.5`}
                value={state.twitterHandle}
                onChange={(event) =>
                  update("twitterHandle", event.target.value)
                }
                placeholder="@doitwithai"
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-600 dark:text-slate-300">
                Title
              </label>
              <span
                className={`rounded-full px-2 py-0.5 text-[11px] font-bold ${
                  state.title.length >= 35 && state.title.length <= 65
                    ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300"
                    : "bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400"
                }`}
              >
                {state.title.length} / 60 chars (Optimal 45–60c)
              </span>
            </div>
            <input
              className={`${inputClass} mt-1.5`}
              value={state.title}
              onChange={(event) => update("title", event.target.value)}
              placeholder="A clear, specific title"
              maxLength={200}
            />
          </div>

          <div>
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-600 dark:text-slate-300">
                Description
              </label>
              <span
                className={`rounded-full px-2 py-0.5 text-[11px] font-bold ${
                  state.description.length >= 100 &&
                  state.description.length <= 165
                    ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300"
                    : "bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400"
                }`}
              >
                {state.description.length} / 160 chars (Optimal 110–160c)
              </span>
            </div>
            <textarea
              className={`${inputClass} mt-1.5 min-h-[80px] resize-y`}
              value={state.description}
              onChange={(event) => update("description", event.target.value)}
              placeholder="One or two sentences describing the page"
              maxLength={400}
            />
          </div>

          <div>
            <div className="flex flex-wrap items-center justify-between gap-2">
              <label className="text-xs font-bold text-slate-600 dark:text-slate-300">
                OG Image URL or Upload Local Image
              </label>
              <div className="flex items-center gap-2">
                <label className="inline-flex cursor-pointer items-center gap-1 rounded-lg bg-[#4058d0] px-2.5 py-1 text-[11px] font-extrabold text-white hover:bg-[#3452d1]">
                  <Upload size={12} /> Upload Local Image
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleCustomImageUpload}
                    className="hidden"
                  />
                </label>
                <div className="inline-flex items-center rounded-lg border border-slate-300 bg-white p-0.5 text-[10px] font-bold dark:border-slate-700 dark:bg-slate-900">
                  <button
                    type="button"
                    onClick={() => setFitMode("cover")}
                    className={`rounded px-2 py-0.5 ${
                      fitMode === "cover"
                        ? "bg-[#3452d1] text-white"
                        : "text-slate-600 dark:text-slate-300"
                    }`}
                  >
                    Fill Frame
                  </button>
                  <button
                    type="button"
                    onClick={() => setFitMode("contain")}
                    className={`rounded px-2 py-0.5 ${
                      fitMode === "contain"
                        ? "bg-[#3452d1] text-white"
                        : "text-slate-600 dark:text-slate-300"
                    }`}
                  >
                    Fit Full (No Crop)
                  </button>
                </div>
              </div>
            </div>
            <div className="mt-1.5 flex flex-col gap-2 sm:flex-row">
              <ToolUrlInput
                className={inputClass}
                value={state.imageUrl}
                onChange={(event) => {
                  update("imageUrl", event.target.value);
                  setImageProbe(null);
                }}
                placeholder="https://example.com/cover.jpg"
                inputMode="url"
              />
              <button
                type="button"
                onClick={handleCheckImage}
                disabled={checkingImage || !state.imageUrl.trim()}
                className={`${secondaryButton} shrink-0`}
              >
                {checkingImage ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <ImageIcon className="h-3.5 w-3.5" />
                )}
                {checkingImage ? "Checking…" : "Check dimensions"}
              </button>
            </div>
            {imageProbe && (
              <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
                {imageProbe.width && imageProbe.height
                  ? `Detected: ${imageProbe.width}×${imageProbe.height}px${imageProbe.format ? ` (${imageProbe.format})` : ""}${imageProbe.bytes ? `, ${(imageProbe.bytes / 1_000_000).toFixed(1)}MB` : ""}.`
                  : "Dimensions could not be auto-detected for this format."}
              </p>
            )}
          </div>

          <div>
            <label className="text-xs font-bold text-slate-600 dark:text-slate-300">
              Twitter card type
            </label>
            <select
              className={`${inputClass} mt-1.5`}
              value={state.twitterCardType}
              onChange={(event) =>
                update("twitterCardType", event.target.value as TwitterCardType)
              }
            >
              <option value="summary_large_image">
                summary_large_image (full-width image)
              </option>
              <option value="summary">summary (small thumbnail)</option>
            </select>
          </div>
        </div>

        <div className="min-w-0 space-y-5 lg:sticky lg:top-24 lg:self-start">
          {message && (
            <div
              role={message.tone === "error" ? "alert" : "status"}
              className={`flex items-center gap-2 rounded-xl border px-3.5 py-2.5 text-xs font-bold ${
                message.tone === "error"
                  ? "border-rose-500/40 bg-rose-500/10 text-rose-700 dark:text-rose-300"
                  : "border-emerald-500/40 bg-emerald-500/10 text-emerald-800 dark:text-emerald-300"
              }`}
            >
              {message.tone === "error" ? (
                <AlertTriangle size={14} />
              ) : (
                <CheckCircle2 size={14} />
              )}
              <span>{message.text}</span>
            </div>
          )}

          {/* Zoom Bar for Live Social Card Previews */}
          <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2 dark:border-slate-700 dark:bg-slate-900">
            <span className="text-xs font-black uppercase tracking-wider text-[#4058d0]">
              Live Multi-Platform Social Card Previews
            </span>
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => setZoomScale(1)}
                className={`rounded-lg px-2 py-1 text-[11px] font-bold ${
                  zoomScale === 1
                    ? "bg-[#4058d0] text-white"
                    : "bg-white text-slate-700 dark:bg-slate-800 dark:text-slate-200"
                }`}
              >
                <ZoomOut size={11} className="mr-1 inline" /> 100%
              </button>
              <button
                type="button"
                onClick={() => setZoomScale(1.18)}
                className={`rounded-lg px-2 py-1 text-[11px] font-bold ${
                  zoomScale > 1
                    ? "bg-[#4058d0] text-white"
                    : "bg-white text-slate-700 dark:bg-slate-800 dark:text-slate-200"
                }`}
              >
                <ZoomIn size={11} className="mr-1 inline" /> 120% Zoom
              </button>
            </div>
          </div>

          <div
            style={{
              transform: zoomScale > 1 ? `scale(${zoomScale})` : "none",
              transformOrigin: "top center",
              transition: "transform 0.16s ease-out",
            }}
            className="space-y-5"
          >
            <section>
              <h2 className="text-xs font-black uppercase tracking-wider text-[#4662df] dark:text-blue-300">
                1. Facebook / LinkedIn Feed Card
              </h2>
              <div className="mt-2">
                <FacebookPreview state={state} fitMode={fitMode} />
              </div>
            </section>

            <section>
              <h2 className="text-xs font-black uppercase tracking-wider text-[#4662df] dark:text-blue-300">
                2. X / Twitter Card ({state.twitterCardType})
              </h2>
              <div className="mt-2">
                <TwitterPreview state={state} fitMode={fitMode} />
              </div>
            </section>

            <section>
              <h2 className="text-xs font-black uppercase tracking-wider text-[#4662df] dark:text-blue-300">
                3. Slack / Discord / WhatsApp Link Unfurl
              </h2>
              <div className="mt-2">
                <SlackWhatsAppPreview state={state} fitMode={fitMode} />
              </div>
            </section>
          </div>

          <section className="rounded-2xl border border-slate-200 p-4 dark:border-slate-700">
            <h2 className="text-sm font-black uppercase tracking-wider text-[#4662df] dark:text-blue-300">
              Checks you can inspect
            </h2>
            {issues.length === 0 ? (
              <p className="mt-3 flex items-center gap-2 text-sm font-semibold text-emerald-600 dark:text-emerald-400">
                <CheckCircle2 className="h-4 w-4" /> No issues found.
              </p>
            ) : (
              <ul className="mt-3 space-y-2">
                {issues.map((issue, index) => {
                  const Icon =
                    issue.level === "error"
                      ? XCircle
                      : issue.level === "warning"
                        ? AlertTriangle
                        : Info;
                  const className =
                    issue.level === "error"
                      ? "text-rose-600 dark:text-rose-400"
                      : issue.level === "warning"
                        ? "text-amber-600 dark:text-amber-400"
                        : "text-slate-500 dark:text-slate-400";
                  return (
                    <li
                      key={`${issue.level}-${index}`}
                      className={`flex items-start gap-2 text-xs font-semibold leading-5 ${className}`}
                    >
                      <Icon className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                      {issue.message}
                    </li>
                  );
                })}
              </ul>
            )}
            <p className="mt-3 text-[11px] leading-5 text-slate-400">
              {errorCount > 0
                ? "Resolve the errors above first."
                : "Each platform renders and caches cards slightly differently; always spot-check with the platform's own debugger."}
            </p>
          </section>

          <section>
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h2 className="text-sm font-black uppercase tracking-wider text-[#4662df] dark:text-blue-300">
                Ready-to-Paste HTML Meta Tags
              </h2>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleDownloadHtml}
                  className={secondaryButton}
                >
                  <Download className="h-4 w-4" /> .HTML
                </button>
                <button
                  type="button"
                  onClick={handleCopy}
                  className={primaryButton}
                >
                  {copied ? (
                    <CheckCircle2 className="h-4 w-4" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                  {copied ? "Copied" : "Copy tags"}
                </button>
              </div>
            </div>
            <pre className="mt-3 max-h-[280px] overflow-auto whitespace-pre-wrap break-words rounded-2xl border border-slate-200 bg-slate-950 p-4 font-mono text-xs leading-6 text-slate-100 dark:border-slate-700">
              {output || "Fill in the fields above to generate tags."}
            </pre>
          </section>
        </div>
      </div>
    </div>
  );
}
