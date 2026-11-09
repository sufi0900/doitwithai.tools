"use client";

import studioStyles from "@/features/tool-ui/visual-studio.module.css";

import React, {
  useDeferredValue,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import type { ChangeEvent } from "react";
import Image from "next/image";
import JSZip from "jszip";
import {
  CheckCircle2,
  Copy,
  Download,
  FileCode2,
  FileText,
  ImagePlus,
  Loader2,
  MessageSquareQuote,
  PackageCheck,
  Palette,
  Plus,
  RotateCcw,
  ShieldCheck,
  Sparkles,
  Trash2,
  Type,
  Upload,
  X,
  ZoomIn,
  ZoomOut,
} from "lucide-react";
import UrlArticleExtractorBar from "@/features/tool-ui/UrlArticleExtractorBar";
import ToolRunOverlay, {
  focusToolSection,
} from "@/features/tool-ui/ToolRunOverlay";
import PlatformBrandIcon from "@/features/tool-ui/PlatformBrandIcon";
import {
  copyCanvasImageToClipboard,
  downloadCanvasAsEmbeddedSvg,
  downloadCanvasAsPng,
  printCanvasAsPdfPoster,
  resolveStudioTheme,
  STUDIO_COLOR_THEMES,
  type CustomStudioColorOverrides,
  type StudioColorThemeId,
} from "@/features/tool-ui/visualCardExport";
import {
  buildDeterministicQuotePack,
  DEFAULT_QUOTE_STUDIO_INPUT,
  MALE_PORTRAIT_PRESETS,
  QUOTE_TEMPLATES,
  type CardAspectRatioId,
  type MalePortraitPresetId,
  type QuoteCardItem,
  type QuoteStudioInput,
  type QuoteStudioPack,
  type QuoteVisualTemplateId,
} from "./model";
import {
  renderQuoteCard,
  type PortraitSource,
  type RenderParams,
} from "./cardRenderer";
import {
  loadImageFromFile,
  removePortraitBackground,
} from "./portraitCutout";

const MIN_QUOTE_CARDS = 2;
const MAX_QUOTE_CARDS = 8;

type BgStatus = "idle" | "working" | "done" | "failed";

/** Live mini-preview of one template, using the visitor's own quote, photo and logo. */
function TemplateThumb({
  params,
  template,
  label,
  desc,
  active,
  onPick,
}: {
  params: RenderParams | null;
  template: QuoteVisualTemplateId;
  label: string;
  desc: string;
  active: boolean;
  onPick: () => void;
}) {
  const ref = useRef<HTMLCanvasElement | null>(null);
  const deferred = useDeferredValue(params);
  useEffect(() => {
    if (!ref.current || !deferred) return;
    renderQuoteCard(
      ref.current,
      {
        ...deferred,
        input: { ...deferred.input, template, aspectRatio: "1:1" },
      },
      0.34,
    );
  }, [deferred, template]);
  return (
    <button
      type="button"
      onClick={onPick}
      aria-pressed={active}
      className={`rounded-xl border p-2 text-left transition ${
        active
          ? "border-[#4058d0] bg-[#4058d0]/10 ring-2 ring-[#4058d0]/30"
          : "border-slate-200 bg-white hover:border-slate-300 dark:border-slate-800 dark:bg-slate-950"
      }`}
    >
      <canvas
        ref={ref}
        role="img"
        aria-label={`${label} template preview`}
        className="block h-auto w-full rounded-lg"
      />
      <strong className="mt-1.5 block text-xs font-extrabold text-slate-900 dark:text-white">
        {label}
      </strong>
      <span className="mt-0.5 block text-[10px] leading-4 text-slate-500 dark:text-slate-400">
        {desc}
      </span>
    </button>
  );
}

export default function QuoteStatTestimonialCardStudioClient() {
  const [input, setInput] = useState<QuoteStudioInput>(
    DEFAULT_QUOTE_STUDIO_INPUT,
  );
  const [aiPack, setAiPack] = useState<QuoteStudioPack | null>(null);
  const [cards, setCards] = useState<QuoteCardItem[]>(
    () => buildDeterministicQuotePack(DEFAULT_QUOTE_STUDIO_INPUT).cards,
  );
  const [activeCardIdx, setActiveCardIdx] = useState(0);
  const [themeId, setThemeId] = useState<StudioColorThemeId>("royal-cobalt");
  const [customColors, setCustomColors] = useState<CustomStudioColorOverrides>(
    {},
  );

  // Person photo state
  const [presetImg, setPresetImg] = useState<HTMLImageElement | null>(null);
  const [uploadedImg, setUploadedImg] = useState<HTMLImageElement | null>(null);
  const [uploadedCutout, setUploadedCutout] =
    useState<HTMLCanvasElement | null>(null);
  const [uploadedName, setUploadedName] = useState("");
  const [autoRemoveBg, setAutoRemoveBg] = useState(true);
  const [bgStatus, setBgStatus] = useState<BgStatus>("idle");

  // Logo state
  const [uploadedLogo, setUploadedLogo] = useState<HTMLImageElement | null>(
    null,
  );
  const [uploadedLogoName, setUploadedLogoName] = useState("");

  const [zoomLevel, setZoomLevel] = useState<number>(1);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState("");

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const resultsRef = useRef<HTMLDivElement | null>(null);
  const personFileInputRef = useRef<HTMLInputElement | null>(null);
  const logoFileInputRef = useRef<HTMLInputElement | null>(null);
  const presetCache = useRef<Record<string, HTMLImageElement>>({});

  const activeTheme = useMemo(
    () => resolveStudioTheme(themeId, customColors),
    [themeId, customColors],
  );

  // Cards are rebuilt only when the SOURCE TEXT changes, so switching template,
  // size or colors never wipes the quote the visitor has been editing.
  const fallbackPack = useMemo(
    () =>
      buildDeterministicQuotePack({
        ...DEFAULT_QUOTE_STUDIO_INPUT,
        sourceContent: input.sourceContent,
        brandDomain: input.brandDomain,
      }),
    [input.sourceContent, input.brandDomain],
  );
  const pack = aiPack || fallbackPack;

  useEffect(() => {
    setCards(pack.cards);
    setActiveCardIdx(0);
  }, [pack]);

  const activeCard = cards[activeCardIdx] || cards[0];
  const canAddCard = cards.length < MAX_QUOTE_CARDS;
  const canRemoveCard = cards.length > MIN_QUOTE_CARDS;

  function notify(msg: string) {
    setToast(msg);
    setTimeout(() => setToast(""), 3600);
  }

  // Load only the selected preset (the PNGs are large, so no eager preloading)
  useEffect(() => {
    const id = input.portraitPreset;
    if (!id || id === "none" || id === "custom-upload") {
      setPresetImg(null);
      return;
    }
    const preset = MALE_PORTRAIT_PRESETS.find((p) => p.id === id);
    if (!preset) {
      setPresetImg(null);
      return;
    }
    const cached = presetCache.current[id];
    if (cached) {
      setPresetImg(cached);
      return;
    }
    let cancelled = false;
    const img = new window.Image();
    img.onload = () => {
      presetCache.current[id] = img;
      if (!cancelled) setPresetImg(img);
    };
    img.src = preset.imageSrc;
    return () => {
      cancelled = true;
    };
  }, [input.portraitPreset]);

  const portrait = useMemo<{ src: PortraitSource | null; cutout: boolean }>(() => {
    if (input.portraitPreset === "custom-upload" && uploadedImg) {
      if (autoRemoveBg && uploadedCutout) {
        return { src: uploadedCutout, cutout: true };
      }
      return { src: uploadedImg, cutout: false };
    }
    if (input.portraitPreset === "none") return { src: null, cutout: false };
    return { src: presetImg, cutout: true };
  }, [input.portraitPreset, uploadedImg, uploadedCutout, autoRemoveBg, presetImg]);

  async function runCutout(img: HTMLImageElement) {
    setBgStatus("working");
    try {
      const cut = await removePortraitBackground(img);
      setUploadedCutout(cut);
      setBgStatus("done");
      notify("Background removed. Your photo now fits every template.");
    } catch {
      setUploadedCutout(null);
      setBgStatus("failed");
      notify(
        "Auto background removal isn't available right now, so your original photo is used.",
      );
    }
  }

  async function handlePersonPhotoUpload(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const img = await loadImageFromFile(file);
      setUploadedImg(img);
      setUploadedName(file.name);
      setUploadedCutout(null);
      setBgStatus("idle");
      setInput((prev) => ({ ...prev, portraitPreset: "custom-upload" }));
      if (autoRemoveBg) await runCutout(img);
      else notify(`Loaded photo: ${file.name}`);
    } catch {
      notify("Could not open that image. Please use a JPG, PNG or WEBP file.");
    }
  }

  function toggleAutoRemoveBg(next: boolean) {
    setAutoRemoveBg(next);
    if (next && uploadedImg && !uploadedCutout && bgStatus !== "working") {
      void runCutout(uploadedImg);
    }
  }

  function handleClearPersonPhoto() {
    setUploadedImg(null);
    setUploadedCutout(null);
    setUploadedName("");
    setBgStatus("idle");
    setInput((prev) => ({ ...prev, portraitPreset: "marcus-saas-vp" }));
    if (personFileInputRef.current) personFileInputRef.current.value = "";
    notify("Reverted to the default portrait.");
  }

  async function handleLogoUpload(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const img = await loadImageFromFile(file);
      setUploadedLogo(img);
      setUploadedLogoName(file.name);
      notify(`Logo added to every template: ${file.name}`);
    } catch {
      notify("Could not open that logo. Please use a PNG, JPG, WEBP or SVG file.");
    }
  }

  function handleClearLogo() {
    setUploadedLogo(null);
    setUploadedLogoName("");
    if (logoFileInputRef.current) logoFileInputRef.current.value = "";
    notify("Logo removed (using the domain badge).");
  }

  function selectPreset(presetId: MalePortraitPresetId) {
    const found = MALE_PORTRAIT_PRESETS.find((p) => p.id === presetId);
    setInput((prev) => ({
      ...prev,
      portraitPreset: presetId,
      authorName: found ? found.authorSample : prev.authorName,
      authorHandleOrRole: found ? found.roleSample : prev.authorHandleOrRole,
    }));
  }

  function handleAddQuoteCard() {
    if (!canAddCard) return;
    const nextIdx = cards.length + 1;
    const newCard: QuoteCardItem = {
      id: `quote-custom-${Date.now()}`,
      badgeLabel: `CUSTOMER WIN #0${nextIdx}`,
      highlightPhrase: "in one afternoon",
      quoteText:
        "Replace this with your customer's own words. Short, specific results read best.",
      subContextOrReality: "Pair every quote with a real portrait and your brand logo.",
    };
    setCards((prev) => [...prev, newCard]);
    setActiveCardIdx(cards.length);
    notify(`Added card #0${nextIdx}.`);
  }

  function handleRemoveQuoteCard() {
    if (!canRemoveCard) return;
    const nextCards = cards.filter((_, idx) => idx !== activeCardIdx);
    setCards(nextCards);
    setActiveCardIdx(Math.max(0, activeCardIdx - 1));
    notify(`Removed card (${nextCards.length} remaining).`);
  }

  async function runGenerateAiQuotes(overrideInput?: QuoteStudioInput) {
    const payload = overrideInput || input;
    setLoading(true);
    try {
      const res = await fetch(
        "/api/ai-tools/quote-stat-testimonial-card-studio",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        },
      );
      const data = await res.json();
      if (data?.pack) {
        setAiPack(data.pack);
        setCards(data.pack.cards);
        setActiveCardIdx(0);
        notify("Generated quote cards from your text.");
      }
      focusToolSection(resultsRef.current);
    } catch {
      notify("Updated your quote cards.");
      focusToolSection(resultsRef.current);
    } finally {
      setLoading(false);
    }
  }

  function updateActiveCard(field: keyof QuoteCardItem, value: string) {
    setCards((prev) =>
      prev.map((c, idx) =>
        idx === activeCardIdx ? { ...c, [field]: value } : c,
      ),
    );
  }

  const renderParams = useMemo<RenderParams | null>(() => {
    if (!activeCard) return null;
    return {
      input,
      card: activeCard,
      theme: activeTheme,
      portrait: portrait.src,
      portraitIsCutout: portrait.cutout,
      logo: uploadedLogo,
      customSurface: customColors.cardBg,
      customText: customColors.textMain,
    };
  }, [input, activeCard, activeTheme, portrait, uploadedLogo, customColors]);

  useEffect(() => {
    if (canvasRef.current && renderParams) {
      renderQuoteCard(canvasRef.current, renderParams, 1);
    }
  }, [renderParams]);

  function downloadActiveQuotePng() {
    downloadCanvasAsPng(
      canvasRef.current,
      `testimonial-card-0${activeCardIdx + 1}.png`,
    );
    notify(`Downloaded card #0${activeCardIdx + 1} (PNG).`);
  }

  async function downloadAllCardsZip() {
    if (!renderParams) return;
    notify("Preparing all cards...");
    const zip = new JSZip();
    const c = document.createElement("canvas");
    for (let i = 0; i < cards.length; i++) {
      renderQuoteCard(c, { ...renderParams, card: cards[i] }, 1);
      const blob: Blob | null = await new Promise((res) =>
        c.toBlob(res, "image/png"),
      );
      if (blob) {
        zip.file(`testimonial-card-${String(i + 1).padStart(2, "0")}.png`, blob);
      }
    }
    zip.file("social-caption.txt", pack.socialCaption);
    const out = await zip.generateAsync({ type: "blob" });
    const url = URL.createObjectURL(out);
    const a = document.createElement("a");
    a.href = url;
    a.download = "testimonial-cards.zip";
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1500);
    notify(`Downloaded ${cards.length} cards + caption (ZIP).`);
  }

  function downloadQuoteAndCaptionPackage() {
    downloadActiveQuotePng();
    navigator.clipboard?.writeText(pack.socialCaption);
    const blob = new Blob([pack.socialCaption], {
      type: "text/plain;charset=utf-8",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "testimonial-social-caption.txt";
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    notify("Downloaded PNG card + social caption.");
  }

  const label =
    "block text-[11px] font-bold text-slate-700 dark:text-slate-200";
  const field =
    "mt-1 w-full rounded-lg border border-slate-300 bg-white px-2.5 py-1.5 text-xs dark:border-slate-700 dark:bg-slate-950";
  const panel =
    "rounded-xl border border-slate-200 bg-slate-50/80 p-3.5 dark:border-slate-800 dark:bg-slate-900/60";
  const stepTitle =
    "inline-flex items-center gap-1.5 text-xs font-black uppercase tracking-wider text-[#4058d0] dark:text-blue-300";

  return (
    <section
      id="tool-studio-workspace"
      data-tool-workspace="true"
      aria-label="AI Testimonial Card and Customer Quote Studio"
      className={`${studioStyles.studio} mx-auto w-full max-w-6xl space-y-6 px-4 py-8 sm:px-6`}
    >
      <ToolRunOverlay
        active={loading}
        title="Designing your testimonial cards..."
        description="Building branded social proof, memo and quote cards."
      />

      <UrlArticleExtractorBar
        label="Optional: paste a blog or case-study URL to pull quotable lines into cards"
        placeholder="Paste an article or case study URL..."
        onExtracted={(data) => {
          setAiPack(null);
          let domain = "doitwithai.tools";
          try {
            domain = new URL(data.url).hostname.replace(/^www\./, "");
          } catch {}
          const nextInput: QuoteStudioInput = {
            ...input,
            authorName: data.author || input.authorName,
            brandDomain: domain,
            sourceContent:
              (data.paragraphs || []).slice(0, 6).join("\n\n") ||
              data.cleanText ||
              input.sourceContent,
          };
          setInput(nextInput);
          void runGenerateAiQuotes(nextInput);
        }}
        onSelectSubTopic={(sub) => {
          setAiPack(null);
          const nextInput: QuoteStudioInput = {
            ...input,
            sourceContent: sub.content,
          };
          setInput(nextInput);
          void runGenerateAiQuotes(nextInput);
        }}
      />

      <div
        ref={resultsRef}
        tabIndex={-1}
        className="space-y-5 rounded-2xl border-2 border-[#4058d0]/25 bg-white p-5 shadow-xs focus:outline-none dark:border-[#4058d0]/35 dark:bg-[#111827] sm:p-6"
      >
        {toast && (
          <div
            role="status"
            className="flex items-center gap-2 rounded-xl border border-emerald-500/40 bg-emerald-500/10 px-4 py-2.5 text-xs font-bold text-emerald-800 dark:text-emerald-300"
          >
            <CheckCircle2 size={15} />
            <span>{toast}</span>
          </div>
        )}

        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 pb-4 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <PlatformBrandIcon
              platform="x"
              slug="quote-stat-testimonial-card-studio"
              size={42}
            />
            <div>
              <span className="inline-flex items-center gap-1.5 text-xs font-extrabold uppercase tracking-wider text-[#4058d0]">
                <MessageSquareQuote size={14} />
                {QUOTE_TEMPLATES.length} portrait-ready templates
              </span>
              <h2 className="text-lg font-black text-slate-900 dark:text-white">
                AI Testimonial Card &amp; Customer Quote Studio
              </h2>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => void runGenerateAiQuotes()}
              disabled={loading}
              className="inline-flex items-center gap-1.5 rounded-xl bg-[#3452d1] px-4 py-2.5 text-xs font-extrabold text-white shadow-sm hover:bg-[#2842b5] disabled:opacity-60"
            >
              <Sparkles size={14} />
              Generate cards from my text
            </button>
            <button
              type="button"
              onClick={downloadQuoteAndCaptionPackage}
              className="inline-flex items-center gap-1.5 rounded-xl border border-[#4058d0] px-4 py-2.5 text-xs font-extrabold text-[#4058d0] hover:bg-[#4058d0]/10 dark:text-blue-300"
            >
              <PackageCheck size={15} />
              PNG + caption
            </button>
          </div>
        </div>

        <div className="grid items-start gap-6 lg:grid-cols-12">
          {/* ============ SINGLE LEFT PANEL: every control lives here ============ */}
          <div className="order-2 space-y-4 lg:order-1 lg:col-span-5 lg:sticky lg:top-4 lg:max-h-[calc(100vh-2rem)] lg:overflow-y-auto lg:pr-1">
            {/* STEP 1 — PHOTO & LOGO */}
            <div className={panel}>
              <span className={stepTitle}>
                <ImagePlus size={14} />
                1 · Customer photo &amp; brand logo
              </span>

              <div className="mt-2.5 grid grid-cols-2 gap-2">
                <div>
                  <button
                    type="button"
                    onClick={() => personFileInputRef.current?.click()}
                    className="inline-flex w-full items-center justify-center gap-1.5 rounded-xl bg-gradient-to-r from-[#3452D1] via-[#4361EE] to-[#5271FF] px-3 py-2 text-xs font-extrabold text-white shadow-md shadow-[#3452D1]/25 transition hover:brightness-110"
                  >
                    {bgStatus === "working" ? (
                      <Loader2 size={13} className="animate-spin" />
                    ) : (
                      <Upload size={13} />
                    )}
                    <span className="truncate">
                      {uploadedName ? `${uploadedName.slice(0, 14)}…` : "Upload photo"}
                    </span>
                  </button>
                  {uploadedName && (
                    <button
                      type="button"
                      onClick={handleClearPersonPhoto}
                      className="mt-1 flex w-full items-center justify-center gap-1 text-[10px] font-bold text-slate-500 hover:text-rose-500"
                    >
                      <X size={10} /> Remove photo
                    </button>
                  )}
                  <input
                    ref={personFileInputRef}
                    type="file"
                    accept="image/png,image/jpeg,image/webp"
                    onChange={handlePersonPhotoUpload}
                    className="sr-only"
                  />
                </div>
                <div>
                  <button
                    type="button"
                    onClick={() => logoFileInputRef.current?.click()}
                    className="inline-flex w-full items-center justify-center gap-1.5 rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs font-extrabold text-slate-800 transition hover:border-[#4058d0] dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
                  >
                    <ShieldCheck size={13} className="text-[#4058d0]" />
                    <span className="truncate">
                      {uploadedLogoName ? `${uploadedLogoName.slice(0, 14)}…` : "Upload logo"}
                    </span>
                  </button>
                  {uploadedLogoName && (
                    <button
                      type="button"
                      onClick={handleClearLogo}
                      className="mt-1 flex w-full items-center justify-center gap-1 text-[10px] font-bold text-slate-500 hover:text-rose-500"
                    >
                      <X size={10} /> Remove logo
                    </button>
                  )}
                  <input
                    ref={logoFileInputRef}
                    type="file"
                    accept="image/png,image/jpeg,image/webp,image/svg+xml"
                    onChange={handleLogoUpload}
                    className="sr-only"
                  />
                </div>
              </div>

              <label className="mt-3 flex cursor-pointer items-start gap-2 rounded-lg border border-slate-200 bg-white p-2.5 text-[11px] dark:border-slate-800 dark:bg-slate-950">
                <input
                  type="checkbox"
                  checked={autoRemoveBg}
                  onChange={(e) => toggleAutoRemoveBg(e.target.checked)}
                  className="mt-0.5"
                />
                <span>
                  <strong className="text-slate-900 dark:text-white">
                    Auto-remove photo background
                  </strong>
                  <span className="block text-slate-500 dark:text-slate-400">
                    Runs in your browser. Your photo is never uploaded.
                    {bgStatus === "working" && " Working…"}
                    {bgStatus === "done" && " Done."}
                    {bgStatus === "failed" && " Unavailable, using original photo."}
                  </span>
                </span>
              </label>

              <div className="mt-3">
                <span className="block text-[11px] font-bold text-slate-600 dark:text-slate-300">
                  Or pick a ready-made portrait:
                </span>
                <div className="mt-1.5 grid grid-cols-2 gap-1.5">
                  {MALE_PORTRAIT_PRESETS.map((mp) => {
                    const selected = input.portraitPreset === mp.id;
                    return (
                      <button
                        key={mp.id}
                        type="button"
                        onClick={() => selectPreset(mp.id)}
                        aria-pressed={selected}
                        className={`flex items-center gap-2 rounded-xl border p-1.5 text-left transition ${
                          selected
                            ? "border-[#4058d0] bg-[#4058d0]/15 ring-2 ring-[#4058d0]/30"
                            : "border-slate-200 bg-white hover:border-slate-300 dark:border-slate-800 dark:bg-slate-950"
                        }`}
                      >
                        <span className="relative h-8 w-8 shrink-0 overflow-hidden rounded-full border border-slate-300 bg-slate-700 dark:border-slate-700">
                          <Image
                            src={mp.imageSrc}
                            alt={mp.authorSample}
                            fill
                            sizes="32px"
                            className="object-cover object-top"
                          />
                        </span>
                        <span className="min-w-0">
                          <span className="block truncate text-[11px] font-extrabold text-slate-900 dark:text-white">
                            {mp.authorSample}
                          </span>
                          <span className="block truncate text-[9px] text-slate-500 dark:text-slate-400">
                            {mp.roleSample.split("·")[0]}
                          </span>
                        </span>
                      </button>
                    );
                  })}
                </div>
                <button
                  type="button"
                  onClick={() => selectPreset("none")}
                  className={`mt-1.5 flex w-full items-center justify-center rounded-xl border py-1 text-[11px] font-extrabold transition ${
                    input.portraitPreset === "none"
                      ? "border-[#4058d0] bg-[#4058d0]/15 text-[#4058d0] dark:text-blue-300"
                      : "border-slate-200 bg-white text-slate-600 hover:border-slate-300 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-300"
                  }`}
                >
                  No photo (text only)
                </button>
              </div>

              {portrait.src && (
                <div className="mt-3 grid grid-cols-2 gap-3">
                  <label className={label}>
                    Photo size
                    <input
                      type="range"
                      min={0.8}
                      max={1.25}
                      step={0.01}
                      value={input.portraitScale ?? 1}
                      onChange={(e) =>
                        setInput((p) => ({ ...p, portraitScale: Number(e.target.value) }))
                      }
                      className="mt-1 w-full"
                    />
                  </label>
                  <label className={label}>
                    Photo position
                    <input
                      type="range"
                      min={-0.15}
                      max={0.15}
                      step={0.01}
                      value={input.portraitOffsetX ?? 0}
                      onChange={(e) =>
                        setInput((p) => ({ ...p, portraitOffsetX: Number(e.target.value) }))
                      }
                      className="mt-1 w-full"
                    />
                  </label>
                </div>
              )}
            </div>

            {/* STEP 2 — TEXT */}
            {activeCard && (
              <div className={`${panel} space-y-3`}>
                <span className={stepTitle}>
                  <Type size={14} />
                  2 · Quote &amp; customer details
                </span>
                <div className="grid gap-2 sm:grid-cols-2">
                  <div>
                    <label className={label}>Customer name</label>
                    <input
                      type="text"
                      value={input.authorName}
                      onChange={(e) => setInput((p) => ({ ...p, authorName: e.target.value }))}
                      className={`${field} font-bold`}
                    />
                  </div>
                  <div>
                    <label className={label}>Role / company</label>
                    <input
                      type="text"
                      value={input.authorHandleOrRole}
                      onChange={(e) => setInput((p) => ({ ...p, authorHandleOrRole: e.target.value }))}
                      className={field}
                    />
                  </div>
                </div>
                <div>
                  <div className="flex items-center justify-between text-[11px] font-bold text-slate-700 dark:text-slate-200">
                    <span>Customer quote</span>
                    <span className="text-[10px] text-[#4058d0]">
                      {activeCard.quoteText.length}/240 · wrap **words** to highlight
                    </span>
                  </div>
                  <textarea
                    rows={4}
                    maxLength={240}
                    value={activeCard.quoteText}
                    onChange={(e) => updateActiveCard("quoteText", e.target.value)}
                    className={`${field} leading-5`}
                  />
                </div>
                <div>
                  <label className={label}>Highlighted phrase (brand color)</label>
                  <input
                    type="text"
                    value={activeCard.highlightPhrase}
                    onChange={(e) => updateActiveCard("highlightPhrase", e.target.value)}
                    placeholder="e.g. in one afternoon"
                    className={`${field} font-bold`}
                  />
                </div>
                <div className="grid gap-2 sm:grid-cols-3">
                  {(["trustBadge1", "trustBadge2", "trustBadge3"] as const).map((k, i) => (
                    <div key={k}>
                      <label className={label}>Proof pill {i + 1}</label>
                      <input
                        type="text"
                        value={input[k] || ""}
                        onChange={(e) => setInput((p) => ({ ...p, [k]: e.target.value }))}
                        className={field}
                      />
                    </div>
                  ))}
                </div>
                <div className="grid gap-2 sm:grid-cols-2">
                  <div>
                    <label className={label}>Brand / domain badge (used when no logo)</label>
                    <input
                      type="text"
                      value={input.brandDomain}
                      onChange={(e) => setInput((p) => ({ ...p, brandDomain: e.target.value }))}
                      className={field}
                    />
                  </div>
                  <div>
                    <label className={label}>Rating label</label>
                    <input
                      type="text"
                      value={input.starRatingLabel || ""}
                      onChange={(e) => setInput((p) => ({ ...p, starRatingLabel: e.target.value }))}
                      className={field}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* STEP 3 — COLORS */}
            <div className={`${panel} space-y-2.5`}>
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className={stepTitle}>
                  <Palette size={14} />
                  3 · Brand colors
                </span>
                {Object.keys(customColors).length > 0 && (
                  <button
                    type="button"
                    onClick={() => setCustomColors({})}
                    className="text-[11px] font-bold text-[#4058d0] hover:underline"
                  >
                    Reset
                  </button>
                )}
              </div>
              <div className="flex flex-wrap gap-1">
                {STUDIO_COLOR_THEMES.map((t) => (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => {
                      setThemeId(t.id);
                      setCustomColors({});
                    }}
                    className={`inline-flex items-center gap-1.5 rounded-lg border px-2 py-1 text-[10px] font-bold transition ${
                      themeId === t.id && Object.keys(customColors).length === 0
                        ? "border-[#4058d0] bg-[#4058d0] text-white"
                        : "border-slate-200 bg-white text-slate-700 hover:border-slate-300 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-200"
                    }`}
                  >
                    <span
                      className="h-2.5 w-2.5 rounded-full border border-white/40"
                      style={{ background: t.accent }}
                    />
                    {t.label}
                  </button>
                ))}
              </div>
              <div className="grid grid-cols-2 gap-1.5 pt-1 sm:grid-cols-4">
                {(
                  [
                    ["Backdrop", activeTheme.bgStart, (v: string) => ({ bgStart: v, bgEnd: v })],
                    ["Card", customColors.cardBg || "#FFFDF9", (v: string) => ({ cardBg: v })],
                    ["Accent", activeTheme.accent, (v: string) => ({ accent: v })],
                    ["Text", customColors.textMain || "#0F172A", (v: string) => ({ textMain: v })],
                  ] as const
                ).map(([name, value, build]) => (
                  <label
                    key={name}
                    className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-2 py-1 text-[10px] font-bold text-slate-700 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-200"
                  >
                    <input
                      type="color"
                      value={value}
                      onChange={(e) =>
                        setCustomColors((prev) => ({ ...prev, ...build(e.target.value) }))
                      }
                      className="h-4 w-5 cursor-pointer rounded border-0 bg-transparent p-0"
                    />
                    <span>{name}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* STEP 4 — SIZE */}
            <div className={panel}>
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className={stepTitle}>4 · Size</span>
                <div className="flex items-center gap-1">
                  {(["1:1", "4:5", "16:9"] as CardAspectRatioId[]).map((ar) => (
                    <button
                      key={ar}
                      type="button"
                      onClick={() => setInput((p) => ({ ...p, aspectRatio: ar }))}
                      className={`rounded-lg px-2.5 py-1 text-[11px] font-extrabold transition ${
                        (input.aspectRatio || "1:1") === ar
                          ? "bg-[#4058d0] text-white"
                          : "border border-slate-300 bg-white text-slate-700 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-300"
                      }`}
                    >
                      {ar === "1:1" ? "Square" : ar === "4:5" ? "4:5 Feed" : "16:9 Deck"}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* ============ RIGHT: live canvas + template gallery ============ */}
          <div className="order-1 space-y-4 lg:order-2 lg:col-span-7">
            {/* card tabs */}
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex flex-wrap gap-1">
                {cards.map((c, idx) => (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => setActiveCardIdx(idx)}
                    className={`rounded-lg px-2.5 py-1 text-[11px] font-extrabold transition ${
                      activeCardIdx === idx
                        ? "bg-[#4058d0] text-white"
                        : "border border-slate-200 bg-white text-slate-700 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-200"
                    }`}
                  >
                    Card {idx + 1}
                  </button>
                ))}
              </div>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={handleAddQuoteCard}
                  disabled={!canAddCard}
                  className="inline-flex items-center gap-0.5 rounded-lg bg-[#4058d0] px-2 py-1 text-[11px] font-bold text-white disabled:opacity-40"
                >
                  <Plus size={12} /> Add
                </button>
                <button
                  type="button"
                  onClick={handleRemoveQuoteCard}
                  disabled={!canRemoveCard}
                  aria-label="Remove this card"
                  className="inline-flex items-center rounded-lg bg-rose-600 px-2 py-1 text-[11px] font-bold text-white disabled:opacity-40"
                >
                  <Trash2 size={12} />
                </button>
              </div>
            </div>

            <div className="overflow-hidden rounded-2xl border-2 border-slate-300 bg-[#070b14] shadow-xl dark:border-slate-700">
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 bg-slate-900 px-4 py-2.5">
                <span className="text-[11px] font-black uppercase tracking-wider text-white">
                  Card {activeCardIdx + 1} · {input.aspectRatio || "1:1"} HD
                </span>
                <div className="flex flex-wrap items-center gap-1.5">
                  <button
                    type="button"
                    onClick={downloadActiveQuotePng}
                    className="inline-flex items-center gap-1 rounded-lg bg-[#3452d1] px-3 py-1.5 text-xs font-black text-white hover:bg-[#2842b5]"
                  >
                    <Download size={13} /> PNG
                  </button>
                  <button
                    type="button"
                    onClick={() => void downloadAllCardsZip()}
                    className="inline-flex items-center gap-1 rounded-lg bg-emerald-600 px-2.5 py-1.5 text-xs font-bold text-white hover:bg-emerald-500"
                  >
                    <PackageCheck size={12} /> All ({cards.length}) .ZIP
                  </button>
                  <button
                    type="button"
                    onClick={async () => {
                      const ok = await copyCanvasImageToClipboard(canvasRef.current);
                      notify(ok ? "Copied card image." : "Use the PNG download in this browser.");
                    }}
                    className="inline-flex items-center gap-1 rounded-lg bg-white/15 px-2.5 py-1.5 text-xs font-bold text-white hover:bg-white/25"
                  >
                    <Copy size={12} /> Copy
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      downloadCanvasAsEmbeddedSvg(
                        canvasRef.current,
                        `testimonial-card-0${activeCardIdx + 1}.svg`,
                      );
                      notify("Downloaded SVG.");
                    }}
                    className="inline-flex items-center gap-1 rounded-lg bg-white/15 px-2.5 py-1.5 text-xs font-bold text-white hover:bg-white/25"
                  >
                    <FileCode2 size={12} /> SVG
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      printCanvasAsPdfPoster(
                        canvasRef.current,
                        `${input.authorName} testimonial card ${activeCardIdx + 1}`,
                        activeCard?.quoteText || "",
                      );
                      notify("Opened print-ready PDF view.");
                    }}
                    className="inline-flex items-center gap-1 rounded-lg bg-white/15 px-2.5 py-1.5 text-xs font-bold text-white hover:bg-white/25"
                  >
                    <FileText size={12} /> PDF
                  </button>
                  <button
                    type="button"
                    onClick={async () => {
                      await navigator.clipboard.writeText(pack.socialCaption);
                      notify("Copied social caption.");
                    }}
                    className="inline-flex items-center gap-1 rounded-lg bg-white/15 px-2.5 py-1.5 text-xs font-bold text-white hover:bg-white/25"
                  >
                    <Copy size={12} /> Caption
                  </button>
                </div>
              </div>

              <div
                onWheel={(e) => {
                  if (e.ctrlKey || e.metaKey) {
                    e.preventDefault();
                    setZoomLevel((z) =>
                      Math.min(2.25, Math.max(0.6, +(z + (e.deltaY < 0 ? 0.12 : -0.12)).toFixed(2))),
                    );
                  }
                }}
                className="overflow-auto p-3 sm:p-5"
              >
                <div
                  style={{
                    width: zoomLevel === 1 ? "100%" : `${Math.round(zoomLevel * 100)}%`,
                    maxWidth: zoomLevel === 1 ? "620px" : "none",
                    transition: "width 0.16s ease-out",
                  }}
                  className="mx-auto"
                >
                  <canvas
                    ref={canvasRef}
                    role="img"
                    aria-label="Live testimonial card preview"
                    className="mx-auto block h-auto w-full rounded-2xl shadow-2xl"
                  />
                </div>
              </div>

              <div className="flex flex-wrap items-center justify-between gap-2 border-t border-slate-800 bg-[#0d1424] px-3.5 py-2 text-xs text-slate-300">
                <span className="text-[11px] text-slate-400">Ctrl + scroll to zoom</span>
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    aria-label="Zoom out"
                    onClick={() => setZoomLevel((z) => Math.max(0.6, +(z - 0.15).toFixed(2)))}
                    className="rounded-lg bg-slate-800 px-2 py-1 text-white hover:bg-slate-700"
                  >
                    <ZoomOut size={12} />
                  </button>
                  <button
                    type="button"
                    onClick={() => setZoomLevel(1)}
                    className={`rounded-lg px-2.5 py-1 text-[11px] font-extrabold ${
                      zoomLevel === 1 ? "bg-[#4058d0] text-white" : "bg-slate-800 text-slate-200"
                    }`}
                  >
                    Fit ({Math.round(zoomLevel * 100)}%)
                  </button>
                  <button
                    type="button"
                    aria-label="Zoom in"
                    onClick={() => setZoomLevel((z) => Math.min(2.25, +(z + 0.15).toFixed(2)))}
                    className="rounded-lg bg-slate-800 px-2 py-1 text-white hover:bg-slate-700"
                  >
                    <ZoomIn size={12} />
                  </button>
                  {zoomLevel !== 1 && (
                    <button
                      type="button"
                      aria-label="Reset zoom"
                      onClick={() => setZoomLevel(1)}
                      className="rounded-lg border border-slate-700 px-2 py-1 text-slate-300"
                    >
                      <RotateCcw size={11} />
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* TEMPLATE GALLERY: live previews with the visitor's own content */}
            <div className={`${panel} p-4`}>
              <span className={stepTitle}>
                <MessageSquareQuote size={14} />
                Choose a layout ({QUOTE_TEMPLATES.length} templates)
              </span>
              <p className="mt-1 text-xs text-slate-600 dark:text-slate-300">
                Every preview below uses your own quote, photo, logo and colors. Click one to apply it.
              </p>
              <div className="mt-3.5 grid grid-cols-2 gap-2.5 md:grid-cols-3">
                {QUOTE_TEMPLATES.map((tpl) => (
                  <TemplateThumb
                    key={tpl.id}
                    params={renderParams}
                    template={tpl.id}
                    label={tpl.label}
                    desc={tpl.desc}
                    active={input.template === tpl.id}
                    onPick={() => setInput((p) => ({ ...p, template: tpl.id }))}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
