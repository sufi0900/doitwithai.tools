"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  AlertTriangle,
  CheckCircle2,
  Copy,
  Download,
  Eye,
  FileCode2,
  FileText,
  Monitor,
  Palette,
  Smartphone,
  Sparkles,
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
  analyzeYoutubeTitleAndThumbnail,
  DEFAULT_YOUTUBE_TITLE_INPUT,
  type YoutubeTitleInput,
  type YoutubeTitleVariation,
} from "./model";

export default function YoutubeTitleThumbnailOptimizerClient() {
  const [input, setInput] = useState<YoutubeTitleInput>(
    DEFAULT_YOUTUBE_TITLE_INPUT,
  );
  const [aiVariations, setAiVariations] = useState<
    YoutubeTitleVariation[] | null
  >(null);
  const [feedMode, setFeedMode] = useState<"mobile" | "desktop">("mobile");
  const [themeId, setThemeId] =
    useState<StudioColorThemeId>("crimson-pinterest");
  const [customColors, setCustomColors] = useState<CustomStudioColorOverrides>(
    {},
  );
  const [loadingAi, setLoadingAi] = useState(false);
  const [toast, setToast] = useState("");
  const thumbCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const resultsRef = useRef<HTMLDivElement | null>(null);

  const activeTheme = useMemo(
    () => resolveStudioTheme(themeId, customColors),
    [themeId, customColors],
  );

  const result = useMemo(
    () => analyzeYoutubeTitleAndThumbnail(input),
    [input],
  );
  const variations = aiVariations || result.variations;

  function notify(msg: string) {
    setToast(msg);
    setTimeout(() => setToast(""), 2600);
  }

  function updateField<K extends keyof YoutubeTitleInput>(
    key: K,
    val: YoutubeTitleInput[K],
  ) {
    setInput((prev) => ({ ...prev, [key]: val }));
  }

  async function runGenerateAiPack(overrideInput?: YoutubeTitleInput) {
    const payload = overrideInput || input;
    setLoadingAi(true);
    try {
      const res = await fetch(
        "/api/ai-tools/youtube-title-thumbnail-optimizer",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        },
      );
      const data = await res.json();
      if (data?.variations) {
        setAiVariations(data.variations);
        notify("Generated 5 AI YouTube Title + Thumbnail pairs!");
      }
      focusToolSection(resultsRef.current);
    } catch {
      notify("Updated YouTube title & thumbnail ideas.");
      focusToolSection(resultsRef.current);
    } finally {
      setLoadingAi(false);
    }
  }

  // Render 1280x720 HD YouTube Thumbnail Canvas
  useEffect(() => {
    const canvas = thumbCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const W = 1280;
    const H = 720;
    canvas.width = W;
    canvas.height = H;

    const grad = ctx.createLinearGradient(0, 0, W, H);
    grad.addColorStop(0, activeTheme.bgStart);
    grad.addColorStop(1, activeTheme.bgEnd);
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, W, H);

    // High-contrast radial glow
    const glow = ctx.createRadialGradient(
      W * 0.78,
      H * 0.28,
      20,
      W * 0.78,
      H * 0.28,
      460,
    );
    glow.addColorStop(0, `${activeTheme.accent}55`);
    glow.addColorStop(1, "transparent");
    ctx.fillStyle = glow;
    ctx.fillRect(0, 0, W, H);

    // Kicker Topic Pill
    ctx.fillStyle = `${activeTheme.accent}28`;
    ctx.strokeStyle = activeTheme.accent;
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.roundRect(72, 76, 480, 62, 31);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = activeTheme.textMain;
    ctx.font = "900 24px system-ui, -apple-system, sans-serif";
    ctx.fillText(
      `▶ ${(input.topicOrKeyword || "YOUTUBE GROWTH").toUpperCase().slice(0, 26)}`,
      104,
      116,
    );

    // Giant Thumbnail Hook Banner
    const hookText = (
      input.thumbnailOverlayText || "310 SITES AUDITED"
    ).toUpperCase();
    ctx.fillStyle = "#FACC15";
    ctx.beginPath();
    ctx.roundRect(72, 184, W - 144, 180, 32);
    ctx.fill();

    ctx.fillStyle = "#0F172A";
    ctx.font = "900 84px system-ui, -apple-system, sans-serif";
    ctx.fillText(hookText.slice(0, 22), 112, 304);

    // Sub-Headline Card Below
    ctx.fillStyle = activeTheme.cardBg;
    ctx.strokeStyle = activeTheme.cardBorder;
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.roundRect(72, 404, W - 144, 184, 28);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = activeTheme.textMain;
    ctx.font = "800 42px system-ui, -apple-system, sans-serif";
    const words = (input.draftTitle || "").split(/\s+/);
    const line1 = words.slice(0, 7).join(" ");
    const line2 = words.slice(7, 14).join(" ");
    ctx.fillText(line1, 108, 480);
    if (line2) {
      ctx.fillStyle = activeTheme.textSub;
      ctx.font = "700 36px system-ui, -apple-system, sans-serif";
      ctx.fillText(line2, 108, 536);
    }

    // Channel Badge + Duration Pill
    ctx.fillStyle = activeTheme.accent;
    ctx.font = "900 26px system-ui, -apple-system, sans-serif";
    ctx.fillText(
      `★ ${(input.channelName || "DoItWithAI").toUpperCase()}`,
      76,
      658,
    );

    ctx.fillStyle = "#090D16";
    ctx.beginPath();
    ctx.roundRect(W - 220, H - 96, 148, 56, 14);
    ctx.fill();
    ctx.fillStyle = "#FFFFFF";
    ctx.font = "900 28px monospace";
    ctx.textAlign = "center";
    ctx.fillText(input.videoDuration || "14:28", W - 146, H - 58);
    ctx.textAlign = "left";
  }, [input, activeTheme]);

  return (
    <section
      aria-label="YouTube Title and Thumbnail Text Optimizer Workspace"
      className="mx-auto w-full max-w-6xl overflow-x-clip px-4 py-10 sm:px-6 space-y-6"
    >
      <ToolRunOverlay
        active={loadingAi}
        title="Generating 5 High-CTR YouTube Title & Thumbnail Pairings..."
        description="Auditing mobile truncation, curiosity gap, and 1280×720 thumbnail overlay hooks."
      />

      <UrlArticleExtractorBar
        label="Option 1: Paste Any YouTube Video or Article URL to Audit & Generate 5 High-CTR Title + Thumbnail Pairings"
        placeholder="Paste a YouTube video URL or blog post URL to extract title, topic & channel..."
        onExtracted={(data) => {
          const cleanTitle = (data.title || input.draftTitle)
            .replace(/\s*\|\s*[^|]+$/g, "")
            .trim();
          const nextInput: YoutubeTitleInput = {
            ...input,
            draftTitle: cleanTitle,
            topicOrKeyword: data.focusKeyword || cleanTitle.slice(0, 42),
            channelName: data.author || input.channelName,
            thumbnailOverlayText: (
              data.focusKeyword ||
              cleanTitle.split(/\s+/).slice(0, 3).join(" ")
            )
              .toUpperCase()
              .slice(0, 22),
          };
          setInput(nextInput);
          void runGenerateAiPack(nextInput);
        }}
        onSelectSubTopic={(sub) => {
          const nextInput: YoutubeTitleInput = {
            ...input,
            draftTitle: sub.title,
            topicOrKeyword: sub.title.slice(0, 42),
            thumbnailOverlayText: sub.title
              .split(/\s+/)
              .slice(0, 3)
              .join(" ")
              .toUpperCase()
              .slice(0, 22),
          };
          setInput(nextInput);
          void runGenerateAiPack(nextInput);
        }}
      />

      {toast && (
        <div
          role="status"
          className="flex items-center gap-2 rounded-xl border border-emerald-500/40 bg-emerald-500/10 px-4 py-2.5 text-xs font-bold text-emerald-800 dark:text-emerald-300"
        >
          <CheckCircle2 size={15} />
          <span>{toast}</span>
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1.02fr)_minmax(0,0.98fr)]">
        {/* LEFT COLUMN: VIDEO PACKAGING INPUTS & 5-POINT CTR DIAGNOSTIC */}
        <div className="space-y-6">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-[#111827] sm:p-6">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2.5">
                <PlatformBrandIcon
                  platform="youtube"
                  slug="youtube-title-thumbnail-optimizer"
                  size={38}
                />
                <h2 className="text-lg font-extrabold">
                  1. Video Title &amp; Thumbnail Text Packaging
                </h2>
              </div>
              <button
                type="button"
                onClick={() => void runGenerateAiPack()}
                disabled={loadingAi}
                className="inline-flex items-center gap-1.5 rounded-xl bg-[#3452d1] px-4 py-2 text-xs font-extrabold text-white shadow-sm hover:bg-[#2842b5] disabled:opacity-60"
              >
                <Sparkles size={14} />
                {loadingAi
                  ? "Generating CTR Pack…"
                  : "Generate 5 AI Title + Thumbnail Pairs"}
              </button>
            </div>

            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-200">
                  Primary Topic or Target Keyword
                </label>
                <input
                  type="text"
                  value={input.topicOrKeyword}
                  onChange={(e) =>
                    updateField("topicOrKeyword", e.target.value)
                  }
                  className="mt-1 w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2 text-sm dark:border-slate-700 dark:bg-slate-900"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-200">
                  Bold Thumbnail Overlay Text (2–5 Words)
                </label>
                <input
                  type="text"
                  value={input.thumbnailOverlayText}
                  onChange={(e) =>
                    updateField("thumbnailOverlayText", e.target.value)
                  }
                  placeholder="e.g. 310 SITES AUDITED"
                  className="mt-1 w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2 font-extrabold uppercase text-sm dark:border-slate-700 dark:bg-slate-900"
                />
              </div>

              <div className="sm:col-span-2">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-200">
                    Draft YouTube Video Title
                  </label>
                  <span
                    className={`rounded-full px-2.5 py-0.5 text-[11px] font-extrabold ${
                      result.charCount <= 60
                        ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300"
                        : result.charCount <= 70
                          ? "bg-amber-500/15 text-amber-700 dark:text-amber-300"
                          : "bg-rose-500/15 text-rose-700 dark:text-rose-300"
                    }`}
                  >
                    {result.charCount} / 100 chars (Mobile safe: ≤60)
                  </span>
                </div>
                <input
                  type="text"
                  value={input.draftTitle}
                  onChange={(e) => updateField("draftTitle", e.target.value)}
                  className="mt-1 w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm font-bold dark:border-slate-700 dark:bg-slate-900"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-200">
                  Channel Name (For Feed Preview)
                </label>
                <input
                  type="text"
                  value={input.channelName}
                  onChange={(e) => updateField("channelName", e.target.value)}
                  className="mt-1 w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2 text-sm dark:border-slate-700 dark:bg-slate-900"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-200">
                  Video Duration Badge
                </label>
                <input
                  type="text"
                  value={input.videoDuration}
                  onChange={(e) => updateField("videoDuration", e.target.value)}
                  className="mt-1 w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2 font-mono text-sm dark:border-slate-700 dark:bg-slate-900"
                />
              </div>
            </div>

            {/* Thumbnail Color Palette Bar */}
            <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50/80 p-3 dark:border-slate-800 dark:bg-slate-900/60 space-y-2">
              <div className="flex items-center justify-between">
                <span className="inline-flex items-center gap-1.5 text-[11px] font-extrabold uppercase tracking-wider text-slate-700 dark:text-slate-200">
                  <Palette size={13} className="text-rose-500" />
                  1280×720 HD Thumbnail Color Theme
                </span>
                {Object.keys(customColors).length > 0 && (
                  <button
                    type="button"
                    onClick={() => setCustomColors({})}
                    className="text-[11px] font-bold text-rose-600 hover:underline"
                  >
                    Reset
                  </button>
                )}
              </div>
              <div className="flex flex-wrap gap-1.5">
                {STUDIO_COLOR_THEMES.slice(0, 6).map((t) => (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => {
                      setThemeId(t.id);
                      setCustomColors({});
                    }}
                    className={`inline-flex items-center gap-1 rounded-lg border px-2 py-1 text-[11px] font-bold transition ${
                      themeId === t.id && Object.keys(customColors).length === 0
                        ? "border-rose-600 bg-rose-600 text-white"
                        : "border-slate-200 bg-white text-slate-700 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-200"
                    }`}
                  >
                    <span
                      className="h-2.5 w-2.5 rounded-full"
                      style={{ background: t.accent }}
                    />
                    {t.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* 5-Point CTR & Packaging Audit */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-[#111827] sm:p-6">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-extrabold">
                2. CTR &amp; Title-Thumbnail Synergy Scorecard
              </h3>
              <span className="rounded-full bg-[#3452d1]/15 px-3 py-1 text-xs font-extrabold text-[#3452d1] dark:bg-[#5271ff]/20 dark:text-[#b4c3ff]">
                CTR Score: {result.ctrScore}/100
              </span>
            </div>

            <div className="mt-4 space-y-2.5">
              {result.checks.map((chk) => (
                <div
                  key={chk.label}
                  className="flex items-start gap-2.5 rounded-xl border border-slate-200/80 bg-slate-50/70 p-3 text-xs dark:border-slate-800 dark:bg-slate-900/60"
                >
                  {chk.passed ? (
                    <CheckCircle2
                      size={16}
                      className="mt-0.5 shrink-0 text-emerald-500"
                    />
                  ) : (
                    <AlertTriangle
                      size={16}
                      className="mt-0.5 shrink-0 text-amber-500"
                    />
                  )}
                  <div>
                    <strong className="block font-bold text-slate-900 dark:text-white">
                      {chk.label}
                    </strong>
                    <span className="text-slate-600 dark:text-slate-300">
                      {chk.detail}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: LIVE YOUTUBE FEED PREVIEW CARD & 5 CTR FRAMEWORKS */}
        <div
          ref={resultsRef}
          tabIndex={-1}
          className="space-y-6 focus:outline-none"
        >
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-[#111827] sm:p-6">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h3 className="flex items-center gap-2 text-base font-extrabold">
                <Eye size={18} className="text-[#5271ff]" />
                Live YouTube Feed &amp; 1280×720 Thumbnail Canvas
              </h3>
              <div className="flex gap-1.5">
                <button
                  type="button"
                  onClick={() => setFeedMode("mobile")}
                  className={`inline-flex items-center gap-1 rounded-lg px-3 py-1 text-xs font-bold ${
                    feedMode === "mobile"
                      ? "bg-[#3452d1] text-white"
                      : "border border-slate-300 bg-slate-50 text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
                  }`}
                >
                  <Smartphone size={13} /> Mobile (58c)
                </button>
                <button
                  type="button"
                  onClick={() => setFeedMode("desktop")}
                  className={`inline-flex items-center gap-1 rounded-lg px-3 py-1 text-xs font-bold ${
                    feedMode === "desktop"
                      ? "bg-[#3452d1] text-white"
                      : "border border-slate-300 bg-slate-50 text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
                  }`}
                >
                  <Monitor size={13} /> Desktop (70c)
                </button>
              </div>
            </div>

            {/* Simulated YouTube Video Card with Hover Download Bar on Thumbnail */}
            <div className="mt-4 overflow-hidden rounded-2xl border border-slate-800 bg-[#0F0F0F] p-4 text-white shadow-xl">
              <div className="group relative overflow-hidden rounded-xl ring-1 ring-white/15">
                {/* Floating Hover Export Bar */}
                <div className="pointer-events-none absolute inset-x-3 top-3 z-20 flex flex-wrap items-center justify-between gap-2 rounded-xl border border-white/15 bg-slate-950/90 px-3 py-2 opacity-0 shadow-2xl backdrop-blur-md transition-all duration-200 group-hover:pointer-events-auto group-hover:opacity-100">
                  <span className="text-[11px] font-extrabold uppercase tracking-wider text-white">
                    1280×720 HD Thumbnail
                  </span>
                  <div className="flex flex-wrap items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => {
                        downloadCanvasAsPng(
                          thumbCanvasRef.current,
                          "youtube-thumbnail-1280x720.png",
                        );
                        notify("Downloaded 1280×720 HD Thumbnail (.PNG)!");
                      }}
                      className="inline-flex items-center gap-1 rounded-lg bg-rose-600 px-2.5 py-1 text-[11px] font-extrabold text-white hover:bg-rose-500"
                    >
                      <Download size={12} /> PNG
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        downloadCanvasAsEmbeddedSvg(
                          thumbCanvasRef.current,
                          "youtube-thumbnail-1280x720.svg",
                        );
                        notify("Downloaded Vector Thumbnail (.SVG)!");
                      }}
                      className="inline-flex items-center gap-1 rounded-lg bg-white/15 px-2.5 py-1 text-[11px] font-extrabold text-white hover:bg-white/25"
                    >
                      <FileCode2 size={12} /> SVG
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        printCanvasAsPdfPoster(
                          thumbCanvasRef.current,
                          input.draftTitle,
                          `Thumbnail Overlay: ${input.thumbnailOverlayText}`,
                        );
                      }}
                      className="inline-flex items-center gap-1 rounded-lg bg-white/15 px-2.5 py-1 text-[11px] font-extrabold text-white hover:bg-white/25"
                    >
                      <FileText size={12} /> PDF
                    </button>
                    <button
                      type="button"
                      onClick={async () => {
                        const ok = await copyCanvasImageToClipboard(
                          thumbCanvasRef.current,
                        );
                        notify(
                          ok
                            ? "Copied Thumbnail Image to Clipboard!"
                            : "Use PNG Download on this browser.",
                        );
                      }}
                      className="inline-flex items-center gap-1 rounded-lg bg-emerald-600 px-2.5 py-1 text-[11px] font-extrabold text-white hover:bg-emerald-500"
                    >
                      <Copy size={12} /> Copy
                    </button>
                  </div>
                </div>

                <canvas
                  ref={thumbCanvasRef}
                  className="block aspect-video w-full h-auto"
                />
              </div>

              <div className="mt-3.5 flex items-start gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#3b63fb] text-xs font-black text-white">
                  AI
                </div>
                <div className="min-w-0 flex-1">
                  <strong className="block text-sm font-bold leading-5 text-white">
                    {feedMode === "mobile"
                      ? result.mobilePreviewTitle
                      : result.desktopPreviewTitle}
                  </strong>
                  <span className="mt-1 block text-xs text-slate-400">
                    {input.channelName} · 48K views · 2 days ago
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* 5 High-CTR Title + Thumbnail Frameworks */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-[#111827] sm:p-6">
            <h3 className="text-base font-extrabold">
              5 High-CTR Title + Thumbnail Pairings (Click Any to Test)
            </h3>

            <div className="mt-3.5 space-y-3">
              {variations.map((v, idx) => (
                <div
                  key={idx}
                  className="rounded-xl border border-slate-200 bg-slate-50/70 p-3.5 text-xs dark:border-slate-800 dark:bg-slate-900/60"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="rounded-full bg-[#3452d1]/15 px-2.5 py-0.5 text-[10px] font-extrabold uppercase text-[#3452d1] dark:bg-[#5271ff]/20 dark:text-[#b4c3ff]">
                      {v.framework}
                    </span>
                    <div className="flex gap-1.5">
                      <button
                        type="button"
                        onClick={() => {
                          setInput((prev) => ({
                            ...prev,
                            draftTitle: v.title,
                            thumbnailOverlayText: v.thumbnailText,
                          }));
                          notify("Loaded into live YouTube feed preview!");
                        }}
                        className="rounded border border-slate-300 bg-white px-2 py-0.5 text-[11px] font-bold hover:border-[#5271ff] dark:border-slate-700 dark:bg-slate-800"
                      >
                        Preview
                      </button>
                      <button
                        type="button"
                        onClick={async () => {
                          await navigator.clipboard.writeText(
                            `Title: ${v.title}\nThumbnail Text: ${v.thumbnailText}`,
                          );
                          notify("Copied Title + Thumbnail text!");
                        }}
                        className="inline-flex items-center gap-1 rounded bg-[#3452d1] px-2.5 py-0.5 text-[11px] font-bold text-white"
                      >
                        <Copy size={11} /> Copy
                      </button>
                    </div>
                  </div>

                  <strong className="mt-2 block text-sm font-extrabold text-slate-900 dark:text-white">
                    {v.title}{" "}
                    <span className="font-normal text-slate-500">
                      ({v.charCount}c)
                    </span>
                  </strong>
                  <div className="mt-1.5 flex flex-wrap items-center gap-2">
                    <span className="rounded bg-amber-400 px-2 py-0.5 text-[10px] font-black uppercase text-slate-950">
                      THUMBNAIL: {v.thumbnailText}
                    </span>
                    <span className="text-[11px] text-slate-500 dark:text-slate-400">
                      {v.whyItClicks}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
