"use client";

import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  Copy,
  Download,
  Sparkles,
  Loader2,
  ArrowRight,
  Video,
  Music,
  Film,
} from "lucide-react";
import ToolRunOverlay, {
  focusToolSection,
  paintToolFeedback,
} from "@/features/tool-ui/ToolRunOverlay";

export type VideoPreset = {
  id: string;
  label: string;
  productTopic: string;
  audience: string;
  engine: string;
  aspectRatio: string;
  cameraStyle: string;
  lightingStyle: string;
  audioMood: string;
};

export const VIDEO_PRESETS: VideoPreset[] = [
  {
    id: "saas-ugc",
    label: "SaaS & AI Tool UGC Ad (9:16)",
    productTopic: "DoItWithAI.tools free keyword grouping and SEO ROI calculator studio",
    audience: "Solo founders and content marketers tired of paying $200/mo for bloated SEO subscriptions",
    engine: "TikTok / Reels UGC + Sora B-Roll",
    aspectRatio: "9:16 Vertical (Shorts / Reels / TikTok)",
    cameraStyle: "Handheld iPhone 16 Pro selfie POV + over-the-shoulder MacBook screen capture",
    lightingStyle: "Natural daytime window light with soft warm desk lamp fill",
    audioMood: "Upbeat lo-fi electronic beat, 112 BPM, clean crisp percussion, no vocals",
  },
  {
    id: "sora-cinema",
    label: "Cinematic Sora / Runway Commercial (16:9)",
    productTopic: "Next-generation autonomous AI workspace transforming messy data into glowing 3D dashboards",
    audience: "Tech executives, SaaS founders, and product teams",
    engine: "OpenAI Sora / Google Veo 2 / Runway Gen-3",
    aspectRatio: "16:9 Widescreen Cinema",
    cameraStyle: "35mm anamorphic lens, slow push-in dolly shot, shallow depth of field f/1.8",
    lightingStyle: "Moody studio rim lighting with subtle sapphire and emerald volumetric glow",
    audioMood: "Cinematic ambient synth pulse building to an inspiring modern orchestral swell, 100 BPM",
  },
  {
    id: "dtc-unboxing",
    label: "DTC Product Unboxing + Suno Audio",
    productTopic: "Minimalist smart desk timer and productivity cube for deep focus work",
    audience: "Remote workers, indie makers, and creators",
    engine: "Kling AI / Luma Dream Machine + Suno v4",
    aspectRatio: "9:16 Vertical (Shorts / Reels / TikTok)",
    cameraStyle: "85mm macro lens, crisp top-down flatlay transitioning to smooth 60fps orbital pan",
    lightingStyle: "Bright golden-hour sunlight casting soft architectural shadows across a walnut desk",
    audioMood: "Warm acoustic indie groove with snappy finger snaps and upbeat bassline, 118 BPM",
  },
];

export type SceneCard = {
  sceneNumber: number;
  timeWindow: string;
  stageLabel: string;
  spokenScript: string;
  bRollPrompt: string;
};

export type VideoPromptPack = {
  masterVideoPrompt: string;
  negativePrompt: string;
  sunoAudioPrompt: string;
  scenes: SceneCard[];
};

export function buildVideoPromptPack(params: {
  productTopic: string;
  audience: string;
  engine: string;
  aspectRatio: string;
  cameraStyle: string;
  lightingStyle: string;
  audioMood: string;
}): VideoPromptPack {
  const topic = params.productTopic.trim() || "AI productivity and SEO studio";
  const aud = params.audience.trim() || "creators and solo founders";

  const masterVideoPrompt = `[Engine: ${params.engine} | Aspect Ratio: ${params.aspectRatio}] Photorealistic 4K sequence showcasing ${topic} designed for ${aud}. Camera & Lens: ${params.cameraStyle}. Lighting & Atmosphere: ${params.lightingStyle}. Smooth natural motion, physically accurate reflections, micro-texture detail on skin and surfaces, zero morphing, 24fps cinematic motion blur.`;

  const negativePrompt =
    "warped hands, extra fingers, garbled Gibberish text on screens, flickering lighting, unnatural face distortion, blurry low-resolution textures, jittery camera shake, watermark, oversaturated neon artifacts";

  const sunoAudioPrompt = `[Suno v4 / Udio Prompt] Style: ${params.audioMood}. Structure: [Intro 0:00-0:03 Punchy Hook Drop] -> [Verse 0:03-0:20 Steady Driving Groove, Warm Sub-Bass, Subtle High-Hat] -> [Outro 0:20-0:30 Clean Uplifting Resolve]. Instrumental only, broadcast-mastered EQ, leaves clean midrange pocket for spoken voiceover.`;

  const scenes: SceneCard[] = [
    {
      sceneNumber: 1,
      timeWindow: "0:00 – 0:03",
      stageLabel: "Scene 1 · Pattern-Interrupt Hook",
      spokenScript: `"Stop wasting three hours a day doing this manually—watch what happens when you run ${topic.slice(0, 55)} instead."`,
      bRollPrompt: `[${params.aspectRatio}] Close-up ${params.cameraStyle} of a founder looking surprised at their laptop screen, ${params.lightingStyle}, natural facial expressions, crisp focus on eyes, subtle rack focus to glowing interface.`,
    },
    {
      sceneNumber: 2,
      timeWindow: "0:03 – 0:10",
      stageLabel: "Scene 2 · Pain Point & Contrast",
      spokenScript: `"Most ${aud.slice(0, 50)} get stuck juggling messy spreadsheets and guesswork while competitors capture all the traffic."`,
      bRollPrompt: `[${params.aspectRatio}] Dynamic split-screen or over-the-shoulder shot showing cluttered tabs transforming into a clean, organized dark-mode dashboard for ${topic.slice(0, 50)}, ${params.lightingStyle}.`,
    },
    {
      sceneNumber: 3,
      timeWindow: "0:10 – 0:22",
      stageLabel: "Scene 3 · Product Proof & Magic Moment",
      spokenScript: `"You just enter your topic, click once, and get instant color-coded results and downloadable reports in seconds."`,
      bRollPrompt: `[${params.aspectRatio}] Macro close-up shot (${params.cameraStyle}) of a cursor clicking a glowing blue 'Run Now' button; smooth emerald and sky-blue data cards animate into view with crisp typography aesthetic, ${params.lightingStyle}.`,
    },
    {
      sceneNumber: 4,
      timeWindow: "0:22 – 0:30",
      stageLabel: "Scene 4 · High-Intent Call to Action",
      spokenScript: `"Test it free right now in your browser—no login required. Link is right below."`,
      bRollPrompt: `[${params.aspectRatio}] Confident creator smiling and pointing toward the bottom caption area while holding a smartphone displaying the finished dashboard, ${params.lightingStyle}, clean depth of field.`,
    },
  ];

  return {
    masterVideoPrompt,
    negativePrompt,
    sunoAudioPrompt,
    scenes,
  };
}

const field =
  "mt-1.5 w-full rounded-xl border border-white/15 bg-slate-950/85 px-3.5 py-2.5 text-sm text-white placeholder:text-slate-500 focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-400/30";

export default function UgcVideoPromptClient() {
  const [activePresetId, setActivePresetId] = useState("saas-ugc");
  const [productTopic, setProductTopic] = useState(
    VIDEO_PRESETS[0].productTopic,
  );
  const [audience, setAudience] = useState(VIDEO_PRESETS[0].audience);
  const [engine, setEngine] = useState(VIDEO_PRESETS[0].engine);
  const [aspectRatio, setAspectRatio] = useState(VIDEO_PRESETS[0].aspectRatio);
  const [cameraStyle, setCameraStyle] = useState(VIDEO_PRESETS[0].cameraStyle);
  const [lightingStyle, setLightingStyle] = useState(
    VIDEO_PRESETS[0].lightingStyle,
  );
  const [audioMood, setAudioMood] = useState(VIDEO_PRESETS[0].audioMood);

  const [pack, setPack] = useState<VideoPromptPack>(() =>
    buildVideoPromptPack(VIDEO_PRESETS[0]),
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

  async function applyPreset(preset: VideoPreset) {
    setActivePresetId(preset.id);
    setProductTopic(preset.productTopic);
    setAudience(preset.audience);
    setEngine(preset.engine);
    setAspectRatio(preset.aspectRatio);
    setCameraStyle(preset.cameraStyle);
    setLightingStyle(preset.lightingStyle);
    setAudioMood(preset.audioMood);
    setOverlayMode("quick");
    setBusy(true);
    try {
      await paintToolFeedback(450);
      setPack(buildVideoPromptPack(preset));
      setRevision((r) => r + 1);
      setStatus(`Loaded ${preset.label} prompt pack.`);
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
        buildVideoPromptPack({
          productTopic,
          audience,
          engine,
          aspectRatio,
          cameraStyle,
          lightingStyle,
          audioMood,
        }),
      );
      setRevision((r) => r + 1);
      setStatus("Generated 4-scene UGC storyboard, Sora/Runway video prompts & Suno audio prompt.");
    } finally {
      setBusy(false);
    }
  }

  async function handleGenerateWithAi() {
    if (busy) return;
    setOverlayMode("ai");
    setBusy(true);
    try {
      const res = await fetch("/api/ai-tools/ugc-video-prompt-generator", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productTopic,
          audience,
          engine,
          aspectRatio,
          cameraStyle,
          lightingStyle,
          audioMood,
        }),
      });
      if (res.ok) {
        const data = (await res.json()) as { pack?: VideoPromptPack };
        if (data.pack) {
          setPack(data.pack);
          setRevision((r) => r + 1);
          setStatus("AI-enhanced 4-scene UGC & Sora storyboard ready.");
          setBusy(false);
          return;
        }
      }
      setPack(
        buildVideoPromptPack({
          productTopic,
          audience,
          engine,
          aspectRatio,
          cameraStyle,
          lightingStyle,
          audioMood,
        }),
      );
      setRevision((r) => r + 1);
      setStatus("Generated UGC & text-to-video prompt pack.");
    } catch {
      setStatus("Generated UGC & text-to-video prompt pack.");
    } finally {
      setBusy(false);
    }
  }

  function exportMarkdown() {
    const md = [
      `# UGC Ad, Sora Video & Suno Audio Prompt Pack`,
      `**Topic / Offer:** ${productTopic}`,
      `**Target Engine:** ${engine} (${aspectRatio})`,
      "",
      `## 1. Master Text-to-Video Prompt (Sora / Runway / Veo / Kling)`,
      `\`\`\`\n${pack.masterVideoPrompt}\n\`\`\``,
      "",
      `## 2. Negative Prompt Guardrails`,
      `\`\`\`\n${pack.negativePrompt}\n\`\`\``,
      "",
      `## 3. Suno v4 / Udio Background Audio Prompt`,
      `\`\`\`\n${pack.sunoAudioPrompt}\n\`\`\``,
      "",
      `## 4. 4-Scene UGC Storyboard & B-Roll Prompts`,
      ...pack.scenes.map(
        (s) =>
          `### ${s.stageLabel} (${s.timeWindow})\n- **Spoken Script:** ${s.spokenScript}\n- **AI Video B-Roll Prompt:** \`${s.bRollPrompt}\`\n`,
      ),
    ].join("\n");
    const url = URL.createObjectURL(
      new Blob([md], { type: "text/markdown;charset=utf-8" }),
    );
    const a = document.createElement("a");
    a.href = url;
    a.download = "ugc-sora-video-prompt-pack.md";
    a.click();
    URL.revokeObjectURL(url);
  }

  function copyAll() {
    const text = [
      `MASTER VIDEO PROMPT:\n${pack.masterVideoPrompt}`,
      `NEGATIVE PROMPT:\n${pack.negativePrompt}`,
      `SUNO AUDIO PROMPT:\n${pack.sunoAudioPrompt}`,
      ...pack.scenes.map(
        (s) =>
          `${s.stageLabel} (${s.timeWindow})\nScript: ${s.spokenScript}\nB-Roll Prompt: ${s.bRollPrompt}`,
      ),
    ].join("\n\n");
    navigator.clipboard.writeText(text);
    setStatus("Copied complete UGC, Sora & Suno prompt pack to clipboard.");
  }

  return (
    <section
      id="ugc-video-prompt-workspace"
      aria-label="UGC Ad, Sora Video and Text-to-Video Prompt Studio"
      className="rounded-[28px] border border-white/10 bg-slate-900/85 p-5 shadow-2xl sm:p-8 space-y-8"
    >
      <ToolRunOverlay
        active={busy}
        title={
          overlayMode === "ai"
            ? "Crafting AI UGC Script & Sora Cinematic Prompts"
            : "Building 4-Scene UGC, Text-to-Video & Suno Prompt Pack"
        }
        description={
          overlayMode === "ai"
            ? "Writing pattern-interrupt hooks, camera/lens movement tokens, and synchronized B-roll prompts."
            : "Assembling camera angles, lighting tokens, negative guardrails, and Suno v4 audio tags."
        }
      />

      {/* TOP COMMAND PANEL */}
      <form
        onSubmit={(e) => void handleGenerate(e)}
        className="rounded-2xl border border-white/10 bg-slate-950/65 p-5 sm:p-6 space-y-6"
      >
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/10 pb-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-500/15 border border-violet-400/30">
              <Video aria-hidden className="h-5 w-5 text-violet-300" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-black text-white">
                UGC Ad, Sora Text-to-Video &amp; Suno Audio Prompt Builder
              </h2>
              <p className="text-xs text-slate-400">
                Configure your product offer, camera movement, lighting, and audio vibe to generate a complete 4-scene production pack.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            {VIDEO_PRESETS.map((preset) => (
              <button
                key={preset.id}
                type="button"
                onClick={() => void applyPreset(preset)}
                className={`rounded-xl border px-3 py-1.5 text-xs font-bold transition ${
                  activePresetId === preset.id
                    ? "border-violet-400 bg-violet-500/20 text-white"
                    : "border-white/15 bg-slate-900 text-slate-300 hover:text-white"
                }`}
              >
                {preset.label}
              </button>
            ))}
          </div>
        </div>

        <div className="grid gap-4 lg:grid-cols-2">
          <div>
            <label
              htmlFor="vp-topic"
              className="block text-xs font-bold uppercase tracking-wider text-violet-300"
            >
              1. Product, Offer, or Video Scene Concept
            </label>
            <textarea
              id="vp-topic"
              rows={2}
              value={productTopic}
              onChange={(e) => setProductTopic(e.target.value)}
              placeholder="Describe your product, app, or visual scene..."
              className={field}
            />
          </div>
          <div>
            <label
              htmlFor="vp-audience"
              className="block text-xs font-bold uppercase tracking-wider text-violet-300"
            >
              2. Target Audience &amp; Core Pain Point
            </label>
            <textarea
              id="vp-audience"
              rows={2}
              value={audience}
              onChange={(e) => setAudience(e.target.value)}
              placeholder="Who is watching and what problem are they solving?"
              className={field}
            />
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <label
              htmlFor="vp-engine"
              className="block text-xs font-bold uppercase tracking-wider text-slate-300"
            >
              3. Target AI Video Engine
            </label>
            <select
              id="vp-engine"
              value={engine}
              onChange={(e) => setEngine(e.target.value)}
              className={field}
            >
              <option value="TikTok / Reels UGC + Sora B-Roll">
                TikTok / Reels UGC + Sora B-Roll
              </option>
              <option value="OpenAI Sora / Google Veo 2 / Runway Gen-3">
                OpenAI Sora / Google Veo 2 / Runway Gen-3
              </option>
              <option value="Kling AI / Luma Dream Machine + Suno v4">
                Kling AI / Luma Dream Machine + Suno v4
              </option>
              <option value="Pika Labs / Hailuo Minimax Commercial">
                Pika Labs / Hailuo Minimax Commercial
              </option>
            </select>
          </div>

          <div>
            <label
              htmlFor="vp-ratio"
              className="block text-xs font-bold uppercase tracking-wider text-slate-300"
            >
              4. Aspect Ratio
            </label>
            <select
              id="vp-ratio"
              value={aspectRatio}
              onChange={(e) => setAspectRatio(e.target.value)}
              className={field}
            >
              <option value="9:16 Vertical (Shorts / Reels / TikTok)">
                9:16 Vertical (Shorts / Reels / TikTok)
              </option>
              <option value="16:9 Widescreen Cinema">
                16:9 Widescreen Cinema
              </option>
              <option value="1:1 Square Social Feed">
                1:1 Square Social Feed
              </option>
            </select>
          </div>

          <div>
            <label
              htmlFor="vp-camera"
              className="block text-xs font-bold uppercase tracking-wider text-slate-300"
            >
              5. Camera &amp; Lens Movement
            </label>
            <input
              id="vp-camera"
              type="text"
              value={cameraStyle}
              onChange={(e) => setCameraStyle(e.target.value)}
              className={field}
            />
          </div>

          <div>
            <label
              htmlFor="vp-lighting"
              className="block text-xs font-bold uppercase tracking-wider text-slate-300"
            >
              6. Lighting &amp; Color Grade
            </label>
            <input
              id="vp-lighting"
              type="text"
              value={lightingStyle}
              onChange={(e) => setLightingStyle(e.target.value)}
              className={field}
            />
          </div>
        </div>

        <div>
          <label
            htmlFor="vp-audio"
            className="block text-xs font-bold uppercase tracking-wider text-emerald-300"
          >
            7. Suno v4 / Udio Background Music &amp; Sound Design Vibe
          </label>
          <input
            id="vp-audio"
            type="text"
            value={audioMood}
            onChange={(e) => setAudioMood(e.target.value)}
            className={field}
          />
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-white/10 pt-4">
          <div className="flex flex-wrap gap-3">
            <button
              type="submit"
              disabled={busy}
              className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-[#4058D0] px-6 py-3 text-sm font-bold text-white shadow-lg shadow-blue-600/25 transition hover:bg-[#3452D1] disabled:opacity-50"
            >
              <Film className="h-4 w-4" />
              Generate Video &amp; UGC Prompt Pack
            </button>
            <button
              type="button"
              disabled={busy}
              onClick={() => void handleGenerateWithAi()}
              className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-indigo-400/40 bg-indigo-500/15 px-5 py-3 text-sm font-bold text-white transition hover:bg-indigo-500/25 disabled:opacity-50"
            >
              {busy && overlayMode === "ai" ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Sparkles className="h-4 w-4 text-indigo-300" />
              )}
              Expand Storyboard with AI
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
            <span className="inline-flex items-center rounded-full border border-violet-400/35 bg-violet-500/15 px-3 py-0.5 text-xs font-bold uppercase tracking-wider text-violet-300">
              {engine} · {aspectRatio}
            </span>
            <h3 className="mt-1.5 text-xl font-black text-white">
              Master Text-to-Video Prompt, 4-Scene UGC Script &amp; Suno Audio Pack
            </h3>
          </div>
          <div className="flex flex-wrap gap-2.5">
            <button
              type="button"
              onClick={copyAll}
              className="inline-flex min-h-10 items-center gap-2 rounded-xl border border-white/20 bg-slate-900 px-4 py-2 text-xs font-bold text-white hover:border-blue-400/50"
            >
              <Copy className="h-4 w-4 text-blue-300" />
              Copy Full Prompt Pack
            </button>
            <button
              type="button"
              onClick={exportMarkdown}
              className="inline-flex min-h-10 items-center gap-2 rounded-xl border border-white/20 bg-slate-900 px-4 py-2 text-xs font-bold text-white hover:border-emerald-400/50"
            >
              <Download className="h-4 w-4 text-emerald-300" />
              Download .MD Storyboard
            </button>
          </div>
        </div>

        {/* Master Video Prompt + Suno Audio Prompt Row */}
        <div className="grid gap-5 lg:grid-cols-2">
          <div className="rounded-2xl border border-t-4 border-white/15 border-t-violet-400 bg-slate-950/90 p-5 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-violet-300">
                🎬 Master Text-to-Video Prompt (Sora / Runway / Veo / Kling)
              </span>
              <button
                type="button"
                onClick={() => {
                  navigator.clipboard.writeText(pack.masterVideoPrompt);
                  setStatus("Copied Master Video Prompt.");
                }}
                className="rounded-lg bg-violet-500/20 border border-violet-400/40 px-2.5 py-1 text-xs font-bold text-violet-200 hover:bg-violet-600 hover:text-white"
              >
                Copy Prompt
              </button>
            </div>
            <p className="rounded-xl bg-slate-900 p-3.5 font-mono text-xs leading-6 text-slate-100 border border-white/10">
              {pack.masterVideoPrompt}
            </p>
            <div className="text-[11px] text-rose-300">
              <strong>Negative Guardrail:</strong> {pack.negativePrompt}
            </div>
          </div>

          <div className="rounded-2xl border border-t-4 border-white/15 border-t-emerald-400 bg-slate-950/90 p-5 space-y-3">
            <div className="flex items-center justify-between">
              <span className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-emerald-300">
                <Music className="h-4 w-4" />
                Suno v4 / Udio Background Music Prompt
              </span>
              <button
                type="button"
                onClick={() => {
                  navigator.clipboard.writeText(pack.sunoAudioPrompt);
                  setStatus("Copied Suno Audio Prompt.");
                }}
                className="rounded-lg bg-emerald-500/20 border border-emerald-400/40 px-2.5 py-1 text-xs font-bold text-emerald-200 hover:bg-emerald-600 hover:text-white"
              >
                Copy Audio Prompt
              </button>
            </div>
            <p className="rounded-xl bg-slate-900 p-3.5 font-mono text-xs leading-6 text-slate-100 border border-white/10">
              {pack.sunoAudioPrompt}
            </p>
            <p className="text-[11px] text-slate-400">
              Engineered to leave a clean midrange vocal pocket so spoken UGC dialogue stays crisp.
            </p>
          </div>
        </div>

        {/* 4-Scene UGC Storyboard & B-Roll Grid */}
        <div className="grid gap-5 lg:grid-cols-2">
          {pack.scenes.map((scene) => (
            <article
              key={scene.sceneNumber}
              className="rounded-2xl border border-t-4 border-white/15 border-t-sky-400 bg-slate-950/85 p-5 shadow-xl space-y-3"
            >
              <div className="flex items-center justify-between">
                <h4 className="text-base font-black text-white">
                  {scene.stageLabel}
                </h4>
                <span className="rounded-lg bg-sky-500/20 border border-sky-400/40 px-2.5 py-0.5 font-mono text-xs font-bold text-sky-200">
                  {scene.timeWindow}
                </span>
              </div>

              <div className="rounded-xl border border-white/10 bg-slate-900/90 p-3.5">
                <div className="text-[11px] font-bold uppercase text-amber-300 mb-1">
                  Spoken UGC Hook / Voiceover Line:
                </div>
                <p className="text-sm font-medium leading-6 text-white">
                  {scene.spokenScript}
                </p>
              </div>

              <div className="rounded-xl border border-white/10 bg-slate-950 p-3.5 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold uppercase text-sky-300">
                    AI Video B-Roll Generation Prompt:
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      navigator.clipboard.writeText(scene.bRollPrompt);
                      setStatus(`Copied Scene ${scene.sceneNumber} B-Roll prompt.`);
                    }}
                    className="rounded bg-white/10 px-2 py-0.5 text-[11px] font-bold text-white hover:bg-blue-600"
                  >
                    Copy B-Roll
                  </button>
                </div>
                <p className="font-mono text-xs leading-5 text-slate-300">
                  {scene.bRollPrompt}
                </p>
              </div>
            </article>
          ))}
        </div>

        <div className="flex flex-wrap items-center gap-3 rounded-2xl border border-white/10 bg-slate-950/70 p-4">
          <Link
            href="/tools/short-form-video-script-generator"
            className="inline-flex min-h-10 items-center gap-2 rounded-xl border border-blue-400/35 bg-blue-500/15 px-4 py-2 text-xs font-bold text-blue-200 hover:bg-blue-500/25"
          >
            Open Short-Form Video Script Studio
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
          <Link
            href="/tools/tiktok-script-caption-generator"
            className="inline-flex min-h-10 items-center gap-2 rounded-xl border border-emerald-400/35 bg-emerald-500/15 px-4 py-2 text-xs font-bold text-emerald-200 hover:bg-emerald-500/25"
          >
            Generate TikTok Captions &amp; SEO Tags
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </div>
    </section>
  );
}
