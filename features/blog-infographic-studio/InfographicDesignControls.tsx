"use client";
import React from "react";
import type { BlogInfographicConfig } from "@/lib/blog-writer/canonical-state";
import type { InfographicStyleOverrides } from "@/lib/blog-infographic-studio/types";
import {
  BACKGROUND_PATTERNS,
  CARD_STYLES,
  DEPTH_PRESETS,
  FONT_FAMILIES,
  normalizeDepth,
  normalizeSignature,
} from "@/lib/blog-infographic-studio/appearance";
import type {
  BackgroundPattern,
  InfographicCardStyle,
  InfographicFontFamily,
} from "@/lib/blog-infographic-studio/appearance";
import { VECTOR_SCENE_CATALOG } from "@/lib/visual-stock/vector-scenes";

const field =
  "mt-2 w-full rounded-lg border border-slate-300 bg-transparent p-2.5 text-sm dark:border-slate-700";
const heading = "text-sm font-bold text-slate-900 dark:text-white";
type Props = {
  config: BlogInfographicConfig;
  onChange: (patch: Partial<BlogInfographicConfig>) => void;
};

const BRAND_BG_MODES: Array<{
  id: NonNullable<InfographicStyleOverrides["brandBackgroundMode"]>;
  label: string;
  desc: string;
}> = [
  {
    id: "theme-default",
    label: "Theme Default",
    desc: "Use the active palette background with brand accent highlights",
  },
  {
    id: "brand-vibrant",
    label: "Vibrant Brand Fill",
    desc: "Full saturated brand canvas (Hero Blue / Neil Patel Orange) with crisp white cards",
  },
  {
    id: "brand-dark",
    label: "Deep Brand Dark",
    desc: "Executive dark brand canvas with high-contrast luminous cards",
  },
  {
    id: "brand-soft",
    label: "Soft Brand Tint",
    desc: "Light editorial brand wash with dark ink typography",
  },
];

export function InfographicProceduralStyleControls({
  config,
  onChange,
}: Props) {
  const activePattern = config.backgroundPattern || "dots-glow";
  const activeCardStyle = config.cardStyle || "glass-editorial";
  const activeFont = config.fontFamily || "system-arial";
  const activeScene = config.sceneIllustration || "";
  const ov: InfographicStyleOverrides = config.styleOverrides || {};
  const activeBrandMode = ov.brandBackgroundMode || "theme-default";

  const patchOverrides = (nextPatch: Partial<InfographicStyleOverrides>) => {
    onChange({
      styleOverrides: {
        ...ov,
        ...nextPatch,
      },
    });
  };

  return (
    <section
      className="space-y-4 border-t border-slate-200 pt-5 dark:border-slate-700"
      aria-label="Procedural visual style"
    >
      <div>
        <h3 className={heading}>Website brand background mode</h3>
        <p className="mt-1 text-xs leading-relaxed text-slate-500 dark:text-slate-400">
          Lock your website’s primary brand color across the canvas background
          and cards.
        </p>
        <div className="mt-2.5 grid grid-cols-2 gap-2">
          {BRAND_BG_MODES.map((m) => (
            <button
              type="button"
              key={m.id}
              aria-pressed={activeBrandMode === m.id}
              onClick={() => patchOverrides({ brandBackgroundMode: m.id })}
              className={`rounded-xl border px-3 py-2 text-left text-xs transition ${
                activeBrandMode === m.id
                  ? "border-indigo-500 bg-indigo-600 text-white"
                  : "border-slate-300 hover:border-indigo-400 dark:border-slate-700"
              }`}
            >
              <span className="block font-bold">{m.label}</span>
              <span
                className={`mt-0.5 block text-[10px] leading-snug ${
                  activeBrandMode === m.id
                    ? "text-indigo-100"
                    : "text-slate-500 dark:text-slate-400"
                }`}
              >
                {m.desc}
              </span>
            </button>
          ))}
        </div>
      </div>

      <div>
        <h3 className={heading}>Background shader &amp; pattern</h3>
        <p className="mt-1 text-xs leading-relaxed text-slate-500 dark:text-slate-400">
          Procedural SVG vector shaders keep backgrounds crisp at any zoom.
        </p>
        <div className="mt-2.5 grid grid-cols-1 gap-2">
          {BACKGROUND_PATTERNS.map((pat) => (
            <button
              type="button"
              key={pat.id}
              aria-pressed={activePattern === pat.id}
              onClick={() =>
                onChange({ backgroundPattern: pat.id as BackgroundPattern })
              }
              className={`rounded-xl border px-3 py-2 text-left text-xs transition ${
                activePattern === pat.id
                  ? "border-indigo-500 bg-indigo-600 text-white"
                  : "border-slate-300 hover:border-indigo-400 dark:border-slate-700"
              }`}
            >
              <span className="block font-bold">{pat.label}</span>
              <span
                className={`mt-0.5 block text-[11px] ${
                  activePattern === pat.id
                    ? "text-indigo-100"
                    : "text-slate-500 dark:text-slate-400"
                }`}
              >
                {pat.description}
              </span>
            </button>
          ))}
        </div>
      </div>

      <div>
        <h3 className={heading}>Card surface style</h3>
        <div className="mt-2 grid grid-cols-2 gap-2">
          {CARD_STYLES.map((st) => (
            <button
              type="button"
              key={st.id}
              aria-pressed={activeCardStyle === st.id}
              onClick={() =>
                onChange({ cardStyle: st.id as InfographicCardStyle })
              }
              className={`min-h-10 rounded-xl border px-3 py-2 text-xs font-semibold ${
                activeCardStyle === st.id
                  ? "border-indigo-500 bg-indigo-600 text-white"
                  : "border-slate-300 dark:border-slate-700"
              }`}
            >
              {st.label}
            </button>
          ))}
        </div>
      </div>

      <label className="block text-xs font-semibold">
        Typography font family
        <select
          className={field}
          value={activeFont}
          onChange={(e) =>
            onChange({
              fontFamily: e.target.value as InfographicFontFamily,
            })
          }
        >
          {FONT_FAMILIES.map((f) => (
            <option key={f.id} value={f.id}>
              {f.label}
            </option>
          ))}
        </select>
      </label>

      <div className="space-y-2">
        <label className="block text-xs font-semibold">
          Editable vector scene illustration (MIT / CC0 stock)
          <select
            className={field}
            value={activeScene}
            onChange={(e) =>
              onChange({
                sceneIllustration: e.target.value || undefined,
              })
            }
          >
            <option value="">Auto-match section topic</option>
            <option value="none">No scene illustration</option>
            {VECTOR_SCENE_CATALOG.map((scene) => (
              <option key={scene.id} value={scene.id}>
                {scene.title} ({scene.category})
              </option>
            ))}
          </select>
        </label>
        <div className="flex flex-wrap items-center gap-2">
          <label className="inline-flex min-h-9 flex-1 cursor-pointer items-center justify-center rounded-xl border border-slate-300 px-3 py-1.5 text-xs font-semibold hover:border-indigo-400 dark:border-slate-700">
            {config.customSceneImageUrl
              ? "Replace custom illustration / object"
              : "Upload custom illustration / object (PNG, JPG, WebP)"}
            <input
              type="file"
              accept="image/png,image/jpeg,image/webp"
              className="sr-only"
              onChange={(e) => {
                const file = e.target.files?.[0];
                e.target.value = "";
                if (!file || file.size > 2_000_000) return;
                const reader = new FileReader();
                reader.onload = () => {
                  const dataUrl = String(reader.result || "");
                  if (/^data:image\/(png|jpeg|webp);base64,/i.test(dataUrl)) {
                    onChange({ customSceneImageUrl: dataUrl });
                  }
                };
                reader.readAsDataURL(file);
              }}
            />
          </label>
          {config.customSceneImageUrl && (
            <button
              type="button"
              onClick={() => onChange({ customSceneImageUrl: undefined })}
              className="rounded-xl border border-slate-300 px-2.5 py-1.5 text-xs font-semibold text-slate-600 hover:border-red-400 dark:border-slate-700 dark:text-slate-300"
            >
              Remove custom image
            </button>
          )}
        </div>
      </div>

      <details
        id="canva-fine-layout-controls"
        className="rounded-xl border border-slate-200 p-3 text-xs dark:border-slate-700"
      >
        <summary className="cursor-pointer font-bold text-slate-800 dark:text-slate-100">
          Canva-style typography, spacing &amp; banner controls
        </summary>
        <div className="mt-4 space-y-3.5">
          <label className="block">
            Headline size{" "}
            <span className="float-right font-semibold">
              {Math.round((ov.headlineScale ?? 1) * 100)}%
            </span>
            <input
              aria-label="Headline size scale"
              type="range"
              min={0.75}
              max={1.3}
              step={0.05}
              value={ov.headlineScale ?? 1}
              onChange={(e) =>
                patchOverrides({ headlineScale: Number(e.target.value) })
              }
              className="mt-1.5 w-full accent-indigo-600"
            />
          </label>
          <label className="block">
            Card heading size{" "}
            <span className="float-right font-semibold">
              {Math.round((ov.cardTitleScale ?? 1) * 100)}%
            </span>
            <input
              aria-label="Card heading size scale"
              type="range"
              min={0.75}
              max={1.3}
              step={0.05}
              value={ov.cardTitleScale ?? 1}
              onChange={(e) =>
                patchOverrides({ cardTitleScale: Number(e.target.value) })
              }
              className="mt-1.5 w-full accent-indigo-600"
            />
          </label>
          <label className="block">
            Card body text size{" "}
            <span className="float-right font-semibold">
              {Math.round((ov.bodyScale ?? 1) * 100)}%
            </span>
            <input
              aria-label="Card body text size scale"
              type="range"
              min={0.75}
              max={1.3}
              step={0.05}
              value={ov.bodyScale ?? 1}
              onChange={(e) =>
                patchOverrides({ bodyScale: Number(e.target.value) })
              }
              className="mt-1.5 w-full accent-indigo-600"
            />
          </label>
          <label className="block">
            Card vertical padding{" "}
            <span className="float-right font-semibold">
              {(ov.cardPaddingY ?? 0) >= 0
                ? `+${ov.cardPaddingY ?? 0}px`
                : `${ov.cardPaddingY}px`}
            </span>
            <input
              aria-label="Card vertical padding"
              type="range"
              min={-12}
              max={36}
              step={2}
              value={ov.cardPaddingY ?? 0}
              onChange={(e) =>
                patchOverrides({ cardPaddingY: Number(e.target.value) })
              }
              className="mt-1.5 w-full accent-indigo-600"
            />
          </label>
          <label className="block">
            Gap between cards{" "}
            <span className="float-right font-semibold">
              {(ov.cardGap ?? 0) >= 0
                ? `+${ov.cardGap ?? 0}px`
                : `${ov.cardGap}px`}
            </span>
            <input
              aria-label="Gap between cards"
              type="range"
              min={-12}
              max={44}
              step={2}
              value={ov.cardGap ?? 0}
              onChange={(e) =>
                patchOverrides({ cardGap: Number(e.target.value) })
              }
              className="mt-1.5 w-full accent-indigo-600"
            />
          </label>
          <label className="block">
            Card corner radius{" "}
            <span className="float-right font-semibold">
              {ov.cardRadius ?? 22}px
            </span>
            <input
              aria-label="Card corner radius"
              type="range"
              min={8}
              max={36}
              step={2}
              value={ov.cardRadius ?? 22}
              onChange={(e) =>
                patchOverrides({ cardRadius: Number(e.target.value) })
              }
              className="mt-1.5 w-full accent-indigo-600"
            />
          </label>
          <label className="block">
            Left accent bar width{" "}
            <span className="float-right font-semibold">
              {ov.accentBarWidth ?? 8}px
            </span>
            <input
              aria-label="Left accent bar width"
              type="range"
              min={0}
              max={14}
              step={1}
              value={ov.accentBarWidth ?? 8}
              onChange={(e) =>
                patchOverrides({ accentBarWidth: Number(e.target.value) })
              }
              className="mt-1.5 w-full accent-indigo-600"
            />
          </label>
          <label className="block font-semibold">
            Bottom callout banner style
            <select
              className={field}
              value={ov.calloutStyle || "default"}
              onChange={(e) =>
                patchOverrides({
                  calloutStyle: e.target
                    .value as InfographicStyleOverrides["calloutStyle"],
                })
              }
            >
              <option value="default">Editorial border banner</option>
              <option value="gold-pill">High-contrast Gold formula bar</option>
              <option value="accent-pill">Brand accent banner</option>
              <option value="hidden">Hide bottom callout banner</option>
            </select>
          </label>
          <label className="block font-semibold">
            Bottom footer &amp; logo dock style
            <select
              className={field}
              value={ov.footerBarStyle || "minimal"}
              onChange={(e) =>
                patchOverrides({
                  footerBarStyle: e.target
                    .value as InfographicStyleOverrides["footerBarStyle"],
                })
              }
            >
              <option value="minimal">Minimal divider line</option>
              <option value="pill-banner">Rounded pill banner</option>
              <option value="dark-dock">Dark executive footer dock</option>
              <option value="light-dock">Crisp white footer dock</option>
            </select>
          </label>
          <button
            type="button"
            onClick={() =>
              onChange({
                styleOverrides: {
                  brandBackgroundMode: ov.brandBackgroundMode,
                },
              })
            }
            className="mt-1 text-xs font-semibold text-indigo-600 hover:underline dark:text-indigo-400"
          >
            Reset typography &amp; spacing sliders
          </button>
        </div>
      </details>
    </section>
  );
}

export function InfographicDepthControls({ config, onChange }: Props) {
  const depth = normalizeDepth(config.depth);
  const update = (key: keyof typeof depth, value: number | string) =>
    onChange({ depth: normalizeDepth({ ...depth, [key]: value }) });
  return (
    <section
      className="space-y-3 border-t border-slate-200 pt-5 dark:border-slate-700"
      aria-label="Infographic depth"
    >
      <h3 className={heading}>Depth &amp; shadows</h3>
      <p className="text-xs leading-relaxed text-slate-500 dark:text-slate-400">
        Add subtle depth to illustration medallions and panels. Text stays
        crisp.
      </p>
      <div className="grid grid-cols-2 gap-2">
        {DEPTH_PRESETS.map((preset) => (
          <button
            type="button"
            key={preset}
            aria-pressed={depth.preset === preset}
            onClick={() =>
              onChange({
                depth: normalizeDepth({ preset, strength: depth.strength }),
              })
            }
            className={`min-h-10 rounded-xl border px-3 py-2 text-xs font-semibold capitalize ${depth.preset === preset ? "border-indigo-500 bg-indigo-600 text-white" : "border-slate-300 dark:border-slate-700"}`}
          >
            {preset}
          </button>
        ))}
      </div>
      <label className="block text-xs font-semibold">
        Shadow strength{" "}
        <span className="float-right">{Math.round(depth.strength)}%</span>
        <input
          className="mt-3 w-full accent-indigo-600"
          type="range"
          min={0}
          max={100}
          step={5}
          disabled={depth.preset === "flat"}
          value={depth.strength}
          onChange={(e) => update("strength", Number(e.target.value))}
        />
      </label>
      <details className="rounded-xl border border-slate-200 p-3 text-xs dark:border-slate-700">
        <summary className="cursor-pointer font-semibold">
          Fine-tune shadows
        </summary>
        <fieldset
          disabled={depth.preset === "flat"}
          className="mt-4 space-y-4 disabled:opacity-40"
        >
          {(
            [
              ["softness", "Softness", 18, 1],
              ["distance", "Distance", 18, 1],
              ["opacity", "Opacity", 0.35, 0.01],
            ] as const
          ).map(([key, label, max, step]) => (
            <label key={key} className="block">
              {label}
              <span className="float-right">
                {key === "opacity"
                  ? `${Math.round(depth[key] * 100)}%`
                  : depth[key]}
              </span>
              <input
                aria-label={`Shadow ${label.toLowerCase()}`}
                className="mt-2 w-full accent-indigo-600"
                type="range"
                min={0}
                max={max}
                step={step}
                value={depth[key]}
                onChange={(e) => update(key, Number(e.target.value))}
              />
            </label>
          ))}
          <label className="block">
            Light direction
            <select
              className={field}
              value={depth.direction}
              onChange={(e) => update("direction", e.target.value)}
            >
              <option value="down">From above</option>
              <option value="right">From upper left</option>
              <option value="left">From upper right</option>
            </select>
          </label>
        </fieldset>
      </details>
    </section>
  );
}
export function InfographicSignatureControls({ config, onChange }: Props) {
  const signature = normalizeSignature(config.signature);
  const update = (patch: Partial<typeof signature>) =>
    onChange({ signature: { ...signature, ...patch } });
  return (
    <section
      className="space-y-3 border-t border-slate-200 pt-5 dark:border-slate-700"
      aria-label="Website signature"
    >
      <h3 className={heading}>Website signature</h3>
      <label className="block text-xs font-semibold">
        Website / display name
        <input
          className={field}
          value={signature.name}
          maxLength={64}
          placeholder="YourBrand.com"
          onChange={(e) => update({ name: e.target.value })}
        />
      </label>
      <div className="flex flex-wrap gap-4 text-xs">
        <label>
          <input
            className="mr-2 accent-indigo-600"
            type="checkbox"
            checked={signature.visible}
            onChange={(e) => update({ visible: e.target.checked })}
          />
          Show signature
        </label>
        <label>
          <input
            className="mr-2 accent-indigo-600"
            type="checkbox"
            checked={signature.showLogo}
            onChange={(e) => update({ showLogo: e.target.checked })}
          />
          Show logo
        </label>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <label className="text-xs">
          Position
          <select
            className={field}
            value={signature.placement}
            onChange={(e) =>
              update({ placement: e.target.value as "header" | "footer" })
            }
          >
            <option value="footer">Footer</option>
            <option value="header">Header</option>
          </select>
        </label>
        <label className="text-xs">
          Alignment
          <select
            className={field}
            value={signature.align}
            onChange={(e) =>
              update({ align: e.target.value as "left" | "right" })
            }
          >
            <option value="right">Right</option>
            <option value="left">Left</option>
          </select>
        </label>
      </div>
      <label className="block text-xs">
        Signature padding{" "}
        <span className="float-right">{signature.padding}px</span>
        <input
          className="mt-2 w-full accent-indigo-600"
          type="range"
          min={8}
          max={24}
          step={2}
          value={signature.padding}
          onChange={(e) => update({ padding: Number(e.target.value) })}
        />
      </label>
      <p className="text-xs leading-relaxed text-slate-500 dark:text-slate-400">
        Your source credit stays separate. Upload a logo below; its size and
        background are adjustable.
      </p>
    </section>
  );
}
