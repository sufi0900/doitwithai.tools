"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  CheckCircle2,
  Copy,
  Download,
  Image as ImageIcon,
  Layers,
  PackageCheck,
  Sparkles,
} from "lucide-react";
import UrlArticleExtractorBar, {
  type ExtractedImageAsset,
} from "@/features/tool-ui/UrlArticleExtractorBar";
import ToolRunOverlay, { focusToolSection } from "@/features/tool-ui/ToolRunOverlay";
import {
  buildDeterministicPinterestVisualPack,
  DEFAULT_PINTEREST_VISUAL_INPUT,
  type PinterestVisualInput,
  type PinterestVisualPack,
  type PinterestVisualTemplateId,
} from "./model";

const PIN_TEMPLATES: {
  id: PinterestVisualTemplateId;
  label: string;
  desc: string;
}[] = [
  {
    id: "listicle-number-pin",
    label: "1. Giant Number Listicle Pin",
    desc: "High-click number badge + bold hook + 4 step preview rows",
  },
  {
    id: "step-mini-infographic",
    label: "2. Step-by-Step Mini Infographic",
    desc: "Vertical 5-step roadmap designed for maximum Pinterest Saves",
  },
  {
    id: "editorial-cover-pin",
    label: "3. Editorial Magazine Cover",
    desc: "Bold magazine typography + extracted article photo backdrop",
  },
  {
    id: "saveable-checklist-pin",
    label: "4. Save-Worthy Checklist Card",
    desc: "Clean checkmarks on high-contrast paper card + domain pill",
  },
  {
    id: "split-photo-headline",
    label: "5. Split Photo + Typography Pin",
    desc: "Top image frame + center ribbon badge + bold lower title",
  },
  {
    id: "comparison-pin",
    label: "6. Mistake vs. Solution Pin",
    desc: "Contrasts 'Stop Doing This' vs. 'Do This Instead' steps",
  },
];

function wrapPinText(
  ctx: CanvasRenderingContext2D,
  text: string,
  maxWidth: number,
  maxLines: number,
): string[] {
  const words = String(text || "")
    .trim()
    .split(/\s+/)
    .filter(Boolean);
  const lines: string[] = [];
  let cur = "";
  for (const w of words) {
    const test = cur ? `${cur} ${w}` : w;
    if (ctx.measureText(test).width > maxWidth && cur) {
      lines.push(cur);
      cur = w;
      if (lines.length >= maxLines - 1) break;
    } else {
      cur = test;
    }
  }
  if (cur && lines.length < maxLines) lines.push(cur);
  return lines;
}

export default function PinterestPinVisualGeneratorClient() {
  const [input, setInput] = useState<PinterestVisualInput>(
    DEFAULT_PINTEREST_VISUAL_INPUT,
  );
  const [aiPack, setAiPack] = useState<PinterestVisualPack | null>(null);
  const [activeVarIdx, setActiveVarIdx] = useState(0);
  const [pinPalette, setPinPalette] = useState<
    "pinterest-crimson" | "navy-orange" | "warm-editorial" | "emerald-gold"
  >("pinterest-crimson");
  const [extractedImages, setExtractedImages] = useState<ExtractedImageAsset[]>(
    [],
  );
  const [selectedPhotoUrl, setSelectedPhotoUrl] = useState<string>("");
  const [loadedPhotoEl, setLoadedPhotoEl] = useState<HTMLImageElement | null>(
    null,
  );
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState("");

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const resultsRef = useRef<HTMLDivElement | null>(null);

  const fallbackPack = useMemo(
    () => buildDeterministicPinterestVisualPack(input),
    [input],
  );
  const pack = aiPack || fallbackPack;
  const activePin =
    pack.pinVariations[activeVarIdx] || pack.pinVariations[0];

  const [customBadge, setCustomBadge] = useState(activePin.pinBadge);
  const [customHeadline, setCustomHeadline] = useState(
    activePin.pinHeadlineOverlay,
  );
  const [customSubtext, setCustomSubtext] = useState(
    activePin.pinSubtextOverlay,
  );

  useEffect(() => {
    setCustomBadge(activePin.pinBadge);
    setCustomHeadline(activePin.pinHeadlineOverlay);
    setCustomSubtext(activePin.pinSubtextOverlay);
  }, [activePin]);

  useEffect(() => {
    if (!selectedPhotoUrl) {
      setLoadedPhotoEl(null);
      return;
    }
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => setLoadedPhotoEl(img);
    img.onerror = () => setLoadedPhotoEl(null);
    img.src = selectedPhotoUrl;
  }, [selectedPhotoUrl]);

  function notify(msg: string) {
    setToast(msg);
    setTimeout(() => setToast(""), 2600);
  }

  async function handleGenerateAiPins() {
    setLoading(true);
    try {
      const res = await fetch("/api/ai-tools/pinterest-pin-visual-generator", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input),
      });
      const data = await res.json();
      if (data?.pack) {
        setAiPack(data.pack);
        setActiveVarIdx(0);
        notify("Generated 3 Pinterest Pin Designs & SEO Descriptions!");
      }
      focusToolSection(resultsRef.current);
    } catch {
      notify("Updated Pinterest Pin visuals.");
      focusToolSection(resultsRef.current);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const W = 1000;
    const H = 1500;
    canvas.width = W;
    canvas.height = H;

    const themeColors = {
      "pinterest-crimson": {
        bg1: "#18060C",
        bg2: "#3B0A18",
        accent: "#E60023",
        card: "rgba(255,255,255,0.95)",
        cardText: "#0F172A",
        textMain: "#FFFFFF",
      },
      "navy-orange": {
        bg1: "#0B1120",
        bg2: "#1E293B",
        accent: "#FF6B35",
        card: "rgba(30,41,59,0.92)",
        cardText: "#FFFFFF",
        textMain: "#FFFFFF",
      },
      "warm-editorial": {
        bg1: "#FFFBEB",
        bg2: "#FEF3C7",
        accent: "#D97706",
        card: "#FFFFFF",
        cardText: "#1C1917",
        textMain: "#1C1917",
      },
      "emerald-gold": {
        bg1: "#042F2E",
        bg2: "#0F172A",
        accent: "#10B981",
        card: "rgba(15,23,42,0.9)",
        cardText: "#F8FAFC",
        textMain: "#FFFFFF",
      },
    }[pinPalette];

    const grad = ctx.createLinearGradient(0, 0, W, H);
    grad.addColorStop(0, themeColors.bg1);
    grad.addColorStop(1, themeColors.bg2);
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, W, H);

    const padX = 64;

    // Optional Photo Header for Editorial or Split Photo Templates
    if (
      loadedPhotoEl &&
      (input.template === "editorial-cover-pin" ||
        input.template === "split-photo-headline")
    ) {
      const imgH = 540;
      ctx.save();
      ctx.beginPath();
      ctx.roundRect(padX, 56, W - padX * 2, imgH, 32);
      ctx.clip();
      const scale = Math.max(
        (W - padX * 2) / loadedPhotoEl.width,
        imgH / loadedPhotoEl.height,
      );
      const dw = loadedPhotoEl.width * scale;
      const dh = loadedPhotoEl.height * scale;
      ctx.drawImage(
        loadedPhotoEl,
        padX + (W - padX * 2 - dw) / 2,
        56 + (imgH - dh) / 2,
        dw,
        dh,
      );
      ctx.restore();
    }

    let curY =
      loadedPhotoEl &&
      (input.template === "editorial-cover-pin" ||
        input.template === "split-photo-headline")
        ? 630
        : 76;

    // Top Badge Pill
    ctx.fillStyle = themeColors.accent;
    ctx.beginPath();
    ctx.roundRect(padX, curY, 340, 52, 26);
    ctx.fill();
    ctx.fillStyle = "#FFFFFF";
    ctx.font = "900 22px system-ui, -apple-system, sans-serif";
    ctx.fillText(
      (customBadge || "MUST-SAVE GUIDE").toUpperCase().slice(0, 22),
      padX + 26,
      curY + 34,
    );
    curY += 76;

    // Big Pin Headline Overlay
    ctx.fillStyle = themeColors.textMain;
    ctx.font = "900 56px system-ui, -apple-system, sans-serif";
    const hLines = wrapPinText(ctx, customHeadline, W - padX * 2, 3);
    for (const l of hLines) {
      ctx.fillText(l, padX, curY + 52);
      curY += 68;
    }

    // Subtext
    curY += 10;
    ctx.fillStyle =
      pinPalette === "warm-editorial" ? "#57534E" : "rgba(255,255,255,0.82)";
    ctx.font = "600 28px system-ui, -apple-system, sans-serif";
    const subLines = wrapPinText(ctx, customSubtext, W - padX * 2, 2);
    for (const l of subLines) {
      ctx.fillText(l, padX, curY + 28);
      curY += 38;
    }
    curY += 28;

    // Steps / Checklist Container in Lower Half of Tall Pin
    const footerH = 96;
    const availH = H - footerH - curY - 24;
    const steps = pack.bulletSteps.slice(0, 5);
    const stepCount = Math.max(1, steps.length);
    const rowGap = 16;
    const rowH = Math.min(
      132,
      Math.max(84, Math.floor((availH - rowGap * (stepCount - 1)) / stepCount)),
    );

    steps.forEach((stepText, idx) => {
      const y = curY + idx * (rowH + rowGap);
      ctx.fillStyle = themeColors.card;
      ctx.strokeStyle = themeColors.accent;
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.roundRect(padX, y, W - padX * 2, rowH, 22);
      ctx.fill();
      ctx.stroke();

      // Number / Check Badge inside Row
      ctx.fillStyle = themeColors.accent;
      ctx.beginPath();
      ctx.roundRect(padX + 22, y + (rowH - 52) / 2, 56, 52, 14);
      ctx.fill();
      ctx.fillStyle = "#FFFFFF";
      ctx.font = "900 24px system-ui, -apple-system, sans-serif";
      ctx.fillText(
        input.template === "saveable-checklist-pin" ? "✓" : `0${idx + 1}`,
        padX + (input.template === "saveable-checklist-pin" ? 40 : 35),
        y + rowH / 2 + 9,
      );

      ctx.fillStyle = themeColors.cardText;
      ctx.font = "800 26px system-ui, -apple-system, sans-serif";
      const sLines = wrapPinText(ctx, stepText, W - padX * 2 - 116, 2);
      let sy =
        sLines.length === 1 ? y + rowH / 2 + 9 : y + rowH / 2 - 8;
      for (const l of sLines) {
        ctx.fillText(l, padX + 98, sy);
        sy += 32;
      }
    });

    // Bottom Domain Banner
    ctx.fillStyle = themeColors.accent;
    ctx.fillRect(0, H - footerH, W, footerH);
    ctx.fillStyle = "#FFFFFF";
    ctx.font = "900 28px system-ui, -apple-system, sans-serif";
    ctx.fillText(
      `🌐 ${(input.destinationDomain || "doitwithai.tools").toUpperCase()}`,
      padX,
      H - 36,
    );
    ctx.font = "800 24px system-ui, -apple-system, sans-serif";
    ctx.fillText("SAVE THIS PIN FOR LATER ★", W - padX - 340, H - 38);
  }, [
    input.template,
    input.destinationDomain,
    pinPalette,
    customBadge,
    customHeadline,
    customSubtext,
    pack.bulletSteps,
    loadedPhotoEl,
  ]);

  function downloadTallPinPng() {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const a = document.createElement("a");
    a.download = `pinterest-pin-1000x1500-${activeVarIdx + 1}.png`;
    a.href = canvas.toDataURL("image/png");
    a.click();
    notify("Downloaded 1000×1500 Tall Pinterest Pin (.PNG)!");
  }

  function downloadPinAndSeoPackage() {
    downloadTallPinPng();
    const seoText = `PINTEREST PIN TITLE:\n${activePin.pinTitle}\n\nPINTEREST SEO DESCRIPTION:\n${activePin.seoDescription}\n\nHASHTAGS:\n${pack.hashtags.join(" ")}\n\nALT TEXT:\n${activePin.altText}\n\nSUGGESTED BOARD:\n${activePin.suggestedBoard}`;
    navigator.clipboard.writeText(
      `${activePin.pinTitle}\n\n${activePin.seoDescription}`,
    );
    const blob = new Blob([seoText], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "pinterest-pin-seo-pack.txt";
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    notify("Downloaded 1000×1500 Pin PNG + Pinterest SEO Copy Package!");
  }

  return (
    <section
      aria-label="Pinterest Tall Pin Visual Generator and SEO Studio"
      className="mx-auto w-full max-w-6xl overflow-x-clip px-4 py-10 sm:px-6 space-y-6"
    >
      <ToolRunOverlay
        active={loading}
        title="Designing 1000×1500 Tall Pinterest Pins & SEO Copy..."
        description="Building 2:3 vertical Pin graphics, overlay hooks, and keyword-indexed descriptions."
      />

      <UrlArticleExtractorBar
        label="Option 1: Paste Any Blog Post URL to Extract Steps, Photos & Auto-Design 1000×1500 Pinterest Pins"
        placeholder="Paste a blog URL to extract sub-topics, article images & generate tall Pins..."
        onExtracted={(data) => {
          setAiPack(null);
          const cleanTitle = (data.title || input.topicOrHeadline)
            .replace(/\s*\|\s*[^|]+$/g, "")
            .trim();
          let domain = "doitwithai.tools";
          try {
            domain = new URL(data.url).hostname.replace(/^www\./, "");
          } catch {}
          setInput((prev) => ({
            ...prev,
            topicOrHeadline: cleanTitle,
            targetKeyword: data.focusKeyword || prev.targetKeyword,
            destinationDomain: domain,
            sourceStepsOrNotes:
              (data.keyTakeaways || []).join("\n") ||
              data.subTopics?.map((s) => s.title).join("\n") ||
              prev.sourceStepsOrNotes,
          }));
          if (data.images?.length) {
            setExtractedImages(data.images);
          }
          notify(`Loaded Pinterest Pin brief from "${cleanTitle}"!`);
          focusToolSection(resultsRef.current);
        }}
        onSelectSubTopic={(sub) => {
          setAiPack(null);
          setInput((prev) => ({
            ...prev,
            topicOrHeadline: sub.title,
            sourceStepsOrNotes: sub.content,
          }));
          notify(`Focused Pinterest Pin on sub-topic: "${sub.title}"!`);
          focusToolSection(resultsRef.current);
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

      <div
        ref={resultsRef}
        tabIndex={-1}
        className="rounded-2xl border-2 border-[#E60023]/25 bg-white p-5 shadow-xs dark:border-[#E60023]/35 dark:bg-[#111827] sm:p-6 space-y-6 focus:outline-none"
      >
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 pb-4 dark:border-slate-800">
          <div>
            <span className="inline-flex items-center gap-1.5 text-xs font-extrabold uppercase tracking-wider text-[#E60023]">
              <Layers size={14} />6 Editable 2:3 Tall Pin Templates (1000×1500
              HD)
            </span>
            <h2 className="text-lg font-black text-slate-900 dark:text-white">
              Pinterest Tall Pin Visual Designer &amp; Search SEO Studio
            </h2>
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={handleGenerateAiPins}
              disabled={loading}
              className="inline-flex items-center gap-1.5 rounded-xl bg-[#E60023] px-4 py-2.5 text-xs font-extrabold text-white shadow-sm hover:bg-[#c8001e]"
            >
              <Sparkles size={14} />
              Generate 3 AI Pin Variations
            </button>
            <button
              type="button"
              onClick={downloadPinAndSeoPackage}
              className="inline-flex items-center gap-1.5 rounded-xl bg-slate-900 px-4 py-2.5 text-xs font-extrabold text-white shadow-sm hover:bg-slate-800 dark:bg-[#3452d1]"
            >
              <PackageCheck size={15} />
              Download 1000×1500 Pin + SEO Package
            </button>
          </div>
        </div>

        {/* 6 Template Selector */}
        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {PIN_TEMPLATES.map((tpl) => (
            <button
              key={tpl.id}
              type="button"
              onClick={() =>
                setInput((prev) => ({ ...prev, template: tpl.id }))
              }
              className={`rounded-xl border p-3 text-left transition ${
                input.template === tpl.id
                  ? "border-[#E60023] bg-[#E60023]/10 dark:border-[#E60023] dark:bg-[#E60023]/20"
                  : "border-slate-200 bg-slate-50/70 hover:border-slate-300 dark:border-slate-800 dark:bg-slate-900/60"
              }`}
            >
              <strong className="block text-xs font-extrabold text-slate-900 dark:text-white">
                {tpl.label}
              </strong>
              <span className="mt-0.5 block text-[11px] text-slate-500 dark:text-slate-400">
                {tpl.desc}
              </span>
            </button>
          ))}
        </div>

        {/* 1-Click Extracted Article Photo Picker (If article images were extracted) */}
        {extractedImages.length > 0 && (
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-3.5 dark:border-slate-800 dark:bg-slate-900">
            <div className="mb-2 flex items-center justify-between">
              <span className="inline-flex items-center gap-1.5 text-xs font-extrabold text-slate-800 dark:text-slate-200">
                <ImageIcon size={14} className="text-[#E60023]" />
                Click Any Extracted Article Image to Feature on Your Tall Pin:
              </span>
              {selectedPhotoUrl && (
                <button
                  type="button"
                  onClick={() => setSelectedPhotoUrl("")}
                  className="text-xs font-bold text-rose-600 hover:underline"
                >
                  Clear Photo
                </button>
              )}
            </div>
            <div className="flex gap-2.5 overflow-x-auto pb-1">
              {extractedImages.slice(0, 8).map((img, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => {
                    setSelectedPhotoUrl(img.src);
                    setInput((prev) => ({
                      ...prev,
                      template: "editorial-cover-pin",
                    }));
                    notify("Applied article photo to 1000×1500 Pinterest Pin!");
                  }}
                  className={`shrink-0 overflow-hidden rounded-lg border-2 transition ${
                    selectedPhotoUrl === img.src
                      ? "border-[#E60023] ring-2 ring-[#E60023]/30"
                      : "border-slate-200 dark:border-slate-700"
                  }`}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={img.src}
                    alt={img.alt || `Article visual ${idx + 1}`}
                    className="h-14 w-20 object-cover"
                  />
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,0.95fr)] items-start">
          {/* LEFT: PIN VARIATION SWITCHER, INLINE TEXT OVERLAY EDITOR & SEO COPY */}
          <div className="space-y-4">
            <div className="flex flex-wrap gap-2">
              {pack.pinVariations.map((v, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setActiveVarIdx(i)}
                  className={`rounded-xl px-3.5 py-2 text-xs font-extrabold transition ${
                    activeVarIdx === i
                      ? "bg-[#E60023] text-white shadow-xs"
                      : "border border-slate-200 bg-slate-50 text-slate-700 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
                  }`}
                >
                  Pin Angle #{i + 1}: {v.pinBadge}
                </button>
              ))}
            </div>

            <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-4 space-y-3 dark:border-slate-800 dark:bg-slate-900/60">
              <div className="grid gap-2.5 sm:grid-cols-2">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-200">
                    Pin Color Theme
                  </label>
                  <select
                    value={pinPalette}
                    onChange={(e) =>
                      setPinPalette(
                        e.target.value as
                          | "pinterest-crimson"
                          | "navy-orange"
                          | "warm-editorial"
                          | "emerald-gold",
                      )
                    }
                    className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-2.5 py-1.5 text-xs font-bold dark:border-slate-700 dark:bg-slate-950"
                  >
                    <option value="pinterest-crimson">
                      Pinterest Crimson &amp; White
                    </option>
                    <option value="navy-orange">
                      Navy &amp; High-Contrast Orange
                    </option>
                    <option value="warm-editorial">
                      Warm Cream &amp; Editorial Amber
                    </option>
                    <option value="emerald-gold">
                      Deep Emerald Authority
                    </option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-200">
                    Top Badge Overlay
                  </label>
                  <input
                    type="text"
                    value={customBadge}
                    onChange={(e) => setCustomBadge(e.target.value)}
                    className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-2.5 py-1.5 text-xs font-bold dark:border-slate-700 dark:bg-slate-950"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-200">
                  Pin Canvas Headline Overlay
                </label>
                <input
                  type="text"
                  value={customHeadline}
                  onChange={(e) => setCustomHeadline(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-bold dark:border-slate-700 dark:bg-slate-950"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-200">
                  Pin Subtext Overlay
                </label>
                <input
                  type="text"
                  value={customSubtext}
                  onChange={(e) => setCustomSubtext(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs dark:border-slate-700 dark:bg-slate-950"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-200">
                  Checklist / Roadmap Steps Rendered on Pin (One per line)
                </label>
                <textarea
                  rows={4}
                  value={input.sourceStepsOrNotes}
                  onChange={(e) => {
                    setAiPack(null);
                    setInput((prev) => ({
                      ...prev,
                      sourceStepsOrNotes: e.target.value,
                    }));
                  }}
                  className="mt-1 w-full rounded-lg border border-slate-300 bg-white p-2.5 text-xs leading-5 dark:border-slate-700 dark:bg-slate-950"
                />
              </div>
            </div>

            {/* PINTEREST SEO TITLE, DESCRIPTION & ALT TEXT */}
            <div className="rounded-xl border border-slate-200 bg-white p-4 space-y-3 dark:border-slate-800 dark:bg-slate-950">
              <div className="flex items-center justify-between">
                <span className="text-xs font-extrabold uppercase tracking-wider text-[#E60023]">
                  Pinterest Search SEO Copy (Title + Description + Alt Text)
                </span>
                <button
                  type="button"
                  onClick={async () => {
                    await navigator.clipboard.writeText(
                      `${activePin.pinTitle}\n\n${activePin.seoDescription}`,
                    );
                    notify("Copied Pin Title + SEO Description!");
                  }}
                  className="inline-flex items-center gap-1 rounded-lg bg-slate-900 px-3 py-1 text-xs font-bold text-white"
                >
                  <Copy size={12} /> Copy Pin SEO
                </button>
              </div>

              <div className="text-xs space-y-2">
                <div>
                  <strong className="text-slate-500">Pin Title (100c): </strong>
                  <span className="font-bold text-slate-900 dark:text-white">
                    {activePin.pinTitle}
                  </span>
                </div>
                <div>
                  <strong className="text-slate-500">SEO Description: </strong>
                  <p className="mt-0.5 text-slate-700 dark:text-slate-300 leading-relaxed">
                    {activePin.seoDescription}
                  </p>
                </div>
                <div>
                  <strong className="text-slate-500">Suggested Board: </strong>
                  <span className="font-semibold text-[#E60023]">
                    {activePin.suggestedBoard}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT: LIVE 1000x1500 (2:3) TALL PINTEREST PIN CANVAS */}
          <div className="space-y-3">
            <div className="overflow-hidden rounded-2xl border-2 border-slate-300 bg-slate-950 p-2 shadow-lg dark:border-slate-700">
              <canvas
                ref={canvasRef}
                className="mx-auto block h-auto max-h-[680px] w-full object-contain rounded-xl"
              />
            </div>

            <button
              type="button"
              onClick={downloadTallPinPng}
              className="w-full inline-flex items-center justify-center gap-1.5 rounded-xl bg-[#E60023] px-4 py-3 text-xs font-extrabold text-white shadow-sm hover:bg-[#c8001e]"
            >
              <Download size={15} />
              Download 1000×1500 Tall Pin (.PNG)
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
