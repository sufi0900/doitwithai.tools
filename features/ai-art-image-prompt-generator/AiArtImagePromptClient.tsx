"use client";

import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  Copy,
  Download,
  Sparkles,
  Loader2,
  ArrowRight,
  Palette,
  Shuffle,
  Image as ImageIcon,
} from "lucide-react";
import ToolRunOverlay, {
  focusToolSection,
  paintToolFeedback,
} from "@/features/tool-ui/ToolRunOverlay";

export type ArtPreset = {
  id: string;
  label: string;
  subject: string;
  mediumStyle: string;
  lighting: string;
  cameraLens: string;
  colorPalette: string;
  aspectRatio: string;
  exactTextOverlay: string;
};

export const ART_PRESETS: ArtPreset[] = [
  {
    id: "grok-blog-hero",
    label: "Grok & Flux Blog Hero Visual",
    subject: "Futuristic isometric AI command center connecting search intent nodes and glowing content clusters above a sleek glass desk",
    mediumStyle: "3D Isometric Editorial Illustration & Octane Render",
    lighting: "Soft volumetric sapphire and emerald rim lighting with studio reflections",
    cameraLens: "50mm tilt-shift isometric lens, crisp depth of field f/2.8",
    colorPalette: "Deep midnight navy (#0B1120), electric indigo (#5271FF), and emerald mint",
    aspectRatio: "16:9",
    exactTextOverlay: "DO IT WITH AI",
  },
  {
    id: "8k-restoration",
    label: "8K Photo Restoration & Upscaling",
    subject: "Vintage faded portrait photograph restored to ultra-sharp 8K resolution with natural skin micro-textures, crisp fabric weave, and balanced daylight tones",
    mediumStyle: "8K Archival Photo Restoration & High-Fidelity Upscaling",
    lighting: "Balanced natural window key light, zero harsh specular clipping, authentic shadow recovery",
    cameraLens: "85mm f/1.4 prime portrait lens, tack-sharp eye catchlights",
    colorPalette: "True-to-life Kodak Portra 400 neutral skin tones and warm archival highlights",
    aspectRatio: "4:5",
    exactTextOverlay: "",
  },
  {
    id: "midjourney-concept",
    label: "Fine Art & Concept Illustration",
    subject: "Solitary glass observatory perched on a misty alpine ridge at dawn, surrounded by floating bioluminescent botanical lanterns",
    mediumStyle: "Cinematic Matte Painting & Photorealistic Concept Art",
    lighting: "Golden hour crepuscular rays cutting through cool morning mountain fog",
    cameraLens: "24mm wide-angle anamorphic lens, sweeping environmental composition",
    colorPalette: "Warm amber gold, slate teal, and soft alabaster mist",
    aspectRatio: "16:9",
    exactTextOverlay: "",
  },
];

const RANDOM_CONCEPTS: Array<Omit<ArtPreset, "id" | "label">> = [
  {
    subject: "Artisanal clockmaker's workshop inside a giant hollow redwood tree, brass gears suspended in beams of sunlight",
    mediumStyle: "Photorealistic Cinema 4D & Unreal Engine 5 Render",
    lighting: "Warm sunbeams filtering through dust motes and stained glass",
    cameraLens: "35mm cinema prime lens, f/1.8 shallow depth of field",
    colorPalette: "Burnished brass, forest emerald, and warm mahogany",
    aspectRatio: "16:9",
    exactTextOverlay: "",
  },
  {
    subject: "Minimalist Scandinavian coffee bar overlooking a rainy Tokyo alleyway at twilight, steam rising from a ceramic pour-over",
    mediumStyle: "Editorial Architectural & Lifestyle Photography",
    lighting: "Warm tungsten interior glow contrasting with cool blue rain reflections",
    cameraLens: "50mm Leica Summilux lens, natural film grain",
    colorPalette: "Warm cedar, slate blue, and soft neon coral accents",
    aspectRatio: "4:5",
    exactTextOverlay: "",
  },
  {
    subject: "Damaged 1920s architectural blueprint and street photograph restored into a hyper-detailed 8K colorized historical scene",
    mediumStyle: "8K Archival Photo Restoration & High-Fidelity Upscaling",
    lighting: "Crisp overcast daylight with full dynamic range shadow recovery",
    cameraLens: "45mm medium-format Hasselblad lens, edge-to-edge sharpness",
    colorPalette: "Authentic Kodachrome natural tones, zero color bleeding",
    aspectRatio: "16:9",
    exactTextOverlay: "",
  },
  {
    subject: "Sleek transparent mechanical keyboard with glowing holographic keycaps floating above a matte carbon-fiber desk",
    mediumStyle: "Commercial Product Macro Photography",
    lighting: "Three-point studio softbox lighting with crisp rim highlights",
    cameraLens: "90mm f/2.8 macro lens, razor-sharp focus on keycap legends",
    colorPalette: "Matte obsidian, electric cyan, and anodized silver",
    aspectRatio: "1:1",
    exactTextOverlay: "BUILD WITH AI",
  },
];

export type ArtPromptCard = {
  id: string;
  title: string;
  engineBadge: string;
  topBorder: string;
  badgeClasses: string;
  promptText: string;
  usageTip: string;
};

export type ArtPromptPack = {
  subject: string;
  negativePrompt: string;
  cards: ArtPromptCard[];
};

export function generateArtPromptPack(params: {
  subject: string;
  mediumStyle: string;
  lighting: string;
  cameraLens: string;
  colorPalette: string;
  aspectRatio: string;
  exactTextOverlay: string;
}): ArtPromptPack {
  const subj = params.subject.trim() || "Futuristic AI creative studio";
  const ar = params.aspectRatio || "16:9";
  const textClause = params.exactTextOverlay.trim()
    ? `, featuring crisp, legible typography reading "${params.exactTextOverlay.trim()}" integrated naturally into the composition`
    : "";

  const midjourneyPrompt = `${subj}${textClause}. Style: ${params.mediumStyle}. Lighting: ${params.lighting}. Camera & Lens: ${params.cameraLens}. Color Palette: ${params.colorPalette}. Ultra-detailed textures, physically accurate materials, 8K resolution --ar ${ar} --v 6.1 --style raw --stylize 250`;

  const grokFluxPrompt = `Create a ${params.mediumStyle.toLowerCase()} image (${ar} aspect ratio) of ${subj}${textClause}. Illuminate the scene with ${params.lighting.toLowerCase()}, captured on a ${params.cameraLens.toLowerCase()}. Use a cohesive color palette of ${params.colorPalette.toLowerCase()} with tack-sharp focal clarity and natural micro-contrast.`;

  const restorationUpscalePrompt = `[8K Image Restoration & High-Fidelity Upscaling Prompt] Restore, de-blur, and upscale "${subj}" to native 8K resolution (7680×4320). Recover fine micro-textures (natural skin pores, fabric weave, architectural edges, and crisp foliage), remove JPEG compression artifacts, motion blur, sensor noise, and scratches, balance dynamic range with ${params.lighting.toLowerCase()}, and preserve 100% original facial/structural geometry without plastic AI over-smoothing.`;

  const negativePrompt =
    "blurry, low resolution, pixelated, JPEG compression artifacts, plastic airbrushed skin, warped hands, extra fingers, misspelled garbled text, watermark, signature, oversaturated neon clipping, unnatural symmetry, muddy shadows";

  const cards: ArtPromptCard[] = [
    {
      id: "midjourney-flux",
      title: "1. Midjourney v6.1 & Flux.1 Pro Master Prompt",
      engineBadge: "Midjourney --v 6.1 · Flux Pro",
      topBorder: "border-t-violet-400",
      badgeClasses: "border-violet-400/50 bg-violet-500/20 text-violet-100",
      promptText: midjourneyPrompt,
      usageTip:
        "Paste directly into Midjourney (/imagine) or Flux.1 Pro. Includes --ar, --v 6.1, and --style raw flags.",
    },
    {
      id: "grok-ideogram",
      title: "2. Grok Aurora & Ideogram 2.0 Prompt (Natural Language + Text)",
      engineBadge: "Grok Aurora · Ideogram 2.0 · DALL·E 3",
      topBorder: "border-t-sky-400",
      badgeClasses: "border-sky-400/50 bg-sky-500/20 text-sky-100",
      promptText: grokFluxPrompt,
      usageTip:
        "Optimized for conversational image models (Grok, Ideogram, Gemini Imagen 3) that follow full-sentence spatial instructions.",
    },
    {
      id: "8k-restoration",
      title: "3. 8K Image Restoration, De-Blurring & Upscaling Prompt",
      engineBadge: "8K Upscaling · Magnific · Topaz · SDXL",
      topBorder: "border-t-emerald-400",
      badgeClasses: "border-emerald-400/50 bg-emerald-500/20 text-emerald-100",
      promptText: restorationUpscalePrompt,
      usageTip:
        "Use in Magnific AI, Krea Enhancer, ComfyUI/SDXL ControlNet Tile, or image restoration models with Creativity/Denoise set between 0.25 and 0.40.",
    },
    {
      id: "negative-guardrails",
      title: "4. Universal Negative Prompt & Quality Guardrails",
      engineBadge: "Artifact Prevention · --no Flag",
      topBorder: "border-t-amber-400",
      badgeClasses: "border-amber-400/50 bg-amber-500/20 text-amber-100",
      promptText: negativePrompt,
      usageTip:
        "Paste into the Negative Prompt box in Stable Diffusion/Flux or append after --no in Midjourney.",
    },
  ];

  return {
    subject: subj,
    negativePrompt,
    cards,
  };
}

const field =
  "mt-1.5 w-full rounded-xl border border-white/15 bg-slate-950/85 px-3.5 py-2.5 text-sm text-white placeholder:text-slate-500 focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-400/30";

export default function AiArtImagePromptClient() {
  const [activePresetId, setActivePresetId] = useState("grok-blog-hero");
  const [subject, setSubject] = useState(ART_PRESETS[0].subject);
  const [mediumStyle, setMediumStyle] = useState(ART_PRESETS[0].mediumStyle);
  const [lighting, setLighting] = useState(ART_PRESETS[0].lighting);
  const [cameraLens, setCameraLens] = useState(ART_PRESETS[0].cameraLens);
  const [colorPalette, setColorPalette] = useState(ART_PRESETS[0].colorPalette);
  const [aspectRatio, setAspectRatio] = useState(ART_PRESETS[0].aspectRatio);
  const [exactTextOverlay, setExactTextOverlay] = useState(
    ART_PRESETS[0].exactTextOverlay,
  );
  const [randomIdx, setRandomIdx] = useState(0);

  const [pack, setPack] = useState<ArtPromptPack>(() =>
    generateArtPromptPack(ART_PRESETS[0]),
  );
  const [busy, setBusy] = useState(false);
  const [overlayMode, setOverlayMode] = useState<"quick" | "ai">("quick");
  const [status, setStatus] = useState("");
  const [revision, setRevision] = useState(0);
  const resultsRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!busy && revision > 0) {
      focusToolSection(resultsRef.current);
    }
  }, [busy, revision]);

  async function applyPreset(preset: ArtPreset) {
    setActivePresetId(preset.id);
    setSubject(preset.subject);
    setMediumStyle(preset.mediumStyle);
    setLighting(preset.lighting);
    setCameraLens(preset.cameraLens);
    setColorPalette(preset.colorPalette);
    setAspectRatio(preset.aspectRatio);
    setExactTextOverlay(preset.exactTextOverlay);
    setOverlayMode("quick");
    setBusy(true);
    try {
      await paintToolFeedback(450);
      setPack(generateArtPromptPack(preset));
      setRevision((r) => r + 1);
      setStatus(`Loaded ${preset.label} prompt pack.`);
    } finally {
      setBusy(false);
    }
  }

  async function handleRandomize() {
    if (busy) return;
    const nextIdx = (randomIdx + 1) % RANDOM_CONCEPTS.length;
    setRandomIdx(nextIdx);
    const concept = RANDOM_CONCEPTS[nextIdx];
    setActivePresetId("random");
    setSubject(concept.subject);
    setMediumStyle(concept.mediumStyle);
    setLighting(concept.lighting);
    setCameraLens(concept.cameraLens);
    setColorPalette(concept.colorPalette);
    setAspectRatio(concept.aspectRatio);
    setExactTextOverlay(concept.exactTextOverlay);
    setOverlayMode("quick");
    setBusy(true);
    try {
      await paintToolFeedback(400);
      setPack(generateArtPromptPack(concept));
      setRevision((r) => r + 1);
      setStatus("Generated a fresh random art & photography prompt concept!");
    } finally {
      setBusy(false);
    }
  }

  async function handleGenerate(e?: React.FormEvent) {
    e?.preventDefault();
    if (busy) return;
    setOverlayMode("quick");
    setBusy(true);
    try {
      await paintToolFeedback(500);
      setPack(
        generateArtPromptPack({
          subject,
          mediumStyle,
          lighting,
          cameraLens,
          colorPalette,
          aspectRatio,
          exactTextOverlay,
        }),
      );
      setRevision((r) => r + 1);
      setStatus("Generated Midjourney, Grok, Flux & 8K Restoration prompts.");
    } finally {
      setBusy(false);
    }
  }

  async function handleExpandWithAi() {
    if (busy) return;
    setOverlayMode("ai");
    setBusy(true);
    try {
      const res = await fetch("/api/ai-tools/ai-art-image-prompt-generator", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          subject,
          mediumStyle,
          lighting,
          cameraLens,
          colorPalette,
          aspectRatio,
          exactTextOverlay,
        }),
      });
      if (res.ok) {
        const data = (await res.json()) as { pack?: ArtPromptPack };
        if (data.pack) {
          setPack(data.pack);
          setRevision((r) => r + 1);
          setStatus("AI-expanded art, Grok & 8K restoration prompts ready.");
          setBusy(false);
          return;
        }
      }
      setPack(
        generateArtPromptPack({
          subject,
          mediumStyle,
          lighting,
          cameraLens,
          colorPalette,
          aspectRatio,
          exactTextOverlay,
        }),
      );
      setRevision((r) => r + 1);
      setStatus("Generated AI art & 8K image prompt pack.");
    } catch {
      setStatus("Generated AI art & 8K image prompt pack.");
    } finally {
      setBusy(false);
    }
  }

  function exportMarkdown() {
    const md = [
      `# AI Art, Grok & 8K Image Restoration Prompt Pack`,
      `**Concept:** ${pack.subject}`,
      "",
      ...pack.cards.map(
        (c) =>
          `## ${c.title} (${c.engineBadge})\n\`\`\`\n${c.promptText}\n\`\`\`\n*Tip:* ${c.usageTip}\n`,
      ),
    ].join("\n");
    const url = URL.createObjectURL(
      new Blob([md], { type: "text/markdown;charset=utf-8" }),
    );
    const a = document.createElement("a");
    a.href = url;
    a.download = "ai-art-8k-image-prompts.md";
    a.click();
    URL.revokeObjectURL(url);
  }

  function copyAll() {
    const text = pack.cards
      .map((c) => `${c.title}\n${c.promptText}`)
      .join("\n\n");
    navigator.clipboard.writeText(text);
    setStatus("Copied all 4 art & 8K upscaling prompts to clipboard.");
  }

  return (
    <section
      id="ai-art-prompt-workspace"
      aria-label="AI Art, Grok and 8K Image Restoration Prompt Studio"
      className="rounded-[28px] border border-white/10 bg-slate-900/85 p-5 shadow-2xl sm:p-8 space-y-8"
    >
      <ToolRunOverlay
        active={busy}
        title={
          overlayMode === "ai"
            ? "Synthesizing AI Art, Grok & 8K Restoration Prompts"
            : "Building Multi-Model Art, Grok & 8K Upscaling Prompts"
        }
        description={
          overlayMode === "ai"
            ? "Enriching lighting, camera optics, micro-texture recovery, and negative artifact tokens."
            : "Formatting parameters for Midjourney v6.1, Flux.1 Pro, Grok Aurora, Ideogram 2.0, and 8K Upscalers."
        }
      />

      {/* TOP COMMAND PANEL */}
      <form
        onSubmit={(e) => void handleGenerate(e)}
        className="rounded-2xl border border-white/10 bg-slate-950/65 p-5 sm:p-6 space-y-6"
      >
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/10 pb-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-pink-500/15 border border-pink-400/30">
              <Palette aria-hidden className="h-5 w-5 text-pink-300" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-black text-white">
                AI Art, Grok Aurora &amp; 8K Image Restoration Prompt Studio
              </h2>
              <p className="text-xs text-slate-400">
                Describe your scene or click Randomize Art Concept to generate Midjourney, Flux, Grok, and 8K upscaling prompts.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {ART_PRESETS.map((preset) => (
              <button
                key={preset.id}
                type="button"
                onClick={() => void applyPreset(preset)}
                className={`rounded-xl border px-3 py-1.5 text-xs font-bold transition ${
                  activePresetId === preset.id
                    ? "border-pink-400 bg-pink-500/20 text-white"
                    : "border-white/15 bg-slate-900 text-slate-300 hover:text-white"
                }`}
              >
                {preset.label}
              </button>
            ))}
            <button
              type="button"
              onClick={() => void handleRandomize()}
              className="inline-flex items-center gap-1.5 rounded-xl border border-amber-400/45 bg-amber-500/15 px-3.5 py-1.5 text-xs font-extrabold text-amber-200 hover:bg-amber-500/25"
            >
              <Shuffle className="h-3.5 w-3.5" />
              🎲 Random Art Prompt
            </button>
          </div>
        </div>

        <div>
          <label
            htmlFor="art-subject"
            className="block text-xs font-bold uppercase tracking-wider text-pink-300"
          >
            1. Subject, Visual Scene, or Photo Restoration Task
          </label>
          <textarea
            id="art-subject"
            rows={2}
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            placeholder="Describe your artwork, blog hero graphic, or vintage photo to restore & upscale..."
            className={field}
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <div>
            <label
              htmlFor="art-medium"
              className="block text-xs font-bold uppercase tracking-wider text-slate-300"
            >
              2. Artistic Medium / Style
            </label>
            <input
              id="art-medium"
              type="text"
              value={mediumStyle}
              onChange={(e) => setMediumStyle(e.target.value)}
              className={field}
            />
          </div>

          <div>
            <label
              htmlFor="art-lighting"
              className="block text-xs font-bold uppercase tracking-wider text-slate-300"
            >
              3. Lighting &amp; Atmosphere
            </label>
            <input
              id="art-lighting"
              type="text"
              value={lighting}
              onChange={(e) => setLighting(e.target.value)}
              className={field}
            />
          </div>

          <div>
            <label
              htmlFor="art-lens"
              className="block text-xs font-bold uppercase tracking-wider text-slate-300"
            >
              4. Camera Lens &amp; Framing
            </label>
            <input
              id="art-lens"
              type="text"
              value={cameraLens}
              onChange={(e) => setCameraLens(e.target.value)}
              className={field}
            />
          </div>

          <div>
            <label
              htmlFor="art-palette"
              className="block text-xs font-bold uppercase tracking-wider text-slate-300"
            >
              5. Color Palette &amp; Mood
            </label>
            <input
              id="art-palette"
              type="text"
              value={colorPalette}
              onChange={(e) => setColorPalette(e.target.value)}
              className={field}
            />
          </div>

          <div>
            <label
              htmlFor="art-ar"
              className="block text-xs font-bold uppercase tracking-wider text-slate-300"
            >
              6. Aspect Ratio
            </label>
            <select
              id="art-ar"
              value={aspectRatio}
              onChange={(e) => setAspectRatio(e.target.value)}
              className={field}
            >
              <option value="16:9">16:9 (Blog Hero / YouTube / Widescreen)</option>
              <option value="1:1">1:1 (Square Social / Avatar)</option>
              <option value="4:5">4:5 (Portrait Feed / Print Restoration)</option>
              <option value="9:16">9:16 (Vertical Story / Pinterest Pin)</option>
            </select>
          </div>

          <div>
            <label
              htmlFor="art-text"
              className="block text-xs font-bold uppercase tracking-wider text-slate-300"
            >
              7. Exact Text Overlay (Optional for Grok / Ideogram)
            </label>
            <input
              id="art-text"
              type="text"
              value={exactTextOverlay}
              onChange={(e) => setExactTextOverlay(e.target.value)}
              placeholder="e.g., AI SEO GUIDE 2026"
              className={field}
            />
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-white/10 pt-4">
          <div className="flex flex-wrap gap-3">
            <button
              type="submit"
              disabled={busy}
              className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-[#4058D0] px-6 py-3 text-sm font-bold text-white shadow-lg shadow-blue-600/25 transition hover:bg-[#3452D1] disabled:opacity-50"
            >
              <ImageIcon className="h-4 w-4" />
              Generate Art &amp; 8K Prompts
            </button>
            <button
              type="button"
              disabled={busy}
              onClick={() => void handleExpandWithAi()}
              className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-indigo-400/40 bg-indigo-500/15 px-5 py-3 text-sm font-bold text-white transition hover:bg-indigo-500/25 disabled:opacity-50"
            >
              {busy && overlayMode === "ai" ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Sparkles className="h-4 w-4 text-indigo-300" />
              )}
              Enrich Details with AI
            </button>
          </div>
          {status && (
            <span className="text-xs font-medium text-emerald-300">
              {status}
            </span>
          )}
        </div>
      </form>

      {/* BOTTOM FULL-WIDTH RESULTS DASHBOARD */}
      <div
        ref={resultsRef}
        tabIndex={-1}
        className="scroll-mt-24 space-y-6 focus-visible:outline-none"
      >
        <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-white/15 bg-gradient-to-r from-slate-900/95 via-[#0c1631] to-slate-900/95 p-5 shadow-xl">
          <div>
            <span className="inline-flex items-center rounded-full border border-pink-400/35 bg-pink-500/15 px-3 py-0.5 text-xs font-bold uppercase tracking-wider text-pink-300">
              Midjourney v6.1 · Grok Aurora · Flux.1 · 8K Upscaling
            </span>
            <h3 className="mt-1.5 text-xl font-black text-white">
              4 Copy-Ready Art, Grok &amp; 8K Restoration Prompts
            </h3>
          </div>
          <div className="flex flex-wrap gap-2.5">
            <button
              type="button"
              onClick={copyAll}
              className="inline-flex min-h-10 items-center gap-2 rounded-xl border border-white/20 bg-slate-900 px-4 py-2 text-xs font-bold text-white hover:border-blue-400/50"
            >
              <Copy className="h-4 w-4 text-blue-300" />
              Copy All 4 Prompts
            </button>
            <button
              type="button"
              onClick={exportMarkdown}
              className="inline-flex min-h-10 items-center gap-2 rounded-xl border border-white/20 bg-slate-900 px-4 py-2 text-xs font-bold text-white hover:border-emerald-400/50"
            >
              <Download className="h-4 w-4 text-emerald-300" />
              Download .MD Pack
            </button>
          </div>
        </div>

        <div className="grid gap-5 lg:grid-cols-2">
          {pack.cards.map((card) => (
            <article
              key={card.id}
              className={`rounded-2xl border border-t-4 border-white/15 bg-slate-950/85 p-5 shadow-xl flex flex-col justify-between space-y-4 ${card.topBorder}`}
            >
              <div className="space-y-3">
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div>
                    <span
                      className={`inline-block rounded-lg border px-2.5 py-0.5 text-[11px] font-bold ${card.badgeClasses}`}
                    >
                      {card.engineBadge}
                    </span>
                    <h4 className="mt-1.5 text-base sm:text-lg font-black text-white">
                      {card.title}
                    </h4>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      navigator.clipboard.writeText(card.promptText);
                      setStatus(`Copied "${card.title}" to clipboard.`);
                    }}
                    className="rounded-xl bg-blue-600/20 border border-blue-400/40 px-3 py-1.5 text-xs font-bold text-blue-200 hover:bg-blue-600 hover:text-white"
                  >
                    Copy Prompt
                  </button>
                </div>

                <p className="rounded-xl border border-white/10 bg-slate-900 p-3.5 font-mono text-xs leading-6 text-slate-100">
                  {card.promptText}
                </p>

                <p className="text-xs leading-5 text-slate-400">
                  <strong className="text-slate-200">Pro Tip:</strong>{" "}
                  {card.usageTip}
                </p>
              </div>
            </article>
          ))}
        </div>

        <div className="flex flex-wrap items-center gap-3 rounded-2xl border border-white/10 bg-slate-950/70 p-4">
          <Link
            href="/tools/image-alt-text-generator"
            className="inline-flex min-h-10 items-center gap-2 rounded-xl border border-blue-400/35 bg-blue-500/15 px-4 py-2 text-xs font-bold text-blue-200 hover:bg-blue-500/25"
          >
            Generate SEO Image Alt Text
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
          <Link
            href="/tools/ugc-video-prompt-generator"
            className="inline-flex min-h-10 items-center gap-2 rounded-xl border border-emerald-400/35 bg-emerald-500/15 px-4 py-2 text-xs font-bold text-emerald-200 hover:bg-emerald-500/25"
          >
            Animate Image in Sora / Runway Studio
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </div>
    </section>
  );
}
