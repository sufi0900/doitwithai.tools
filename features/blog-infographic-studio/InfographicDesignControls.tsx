"use client";
import React from "react";
import type { BlogInfographicConfig } from "@/lib/blog-writer/canonical-state";
import {
  DEPTH_PRESETS,
  normalizeDepth,
  normalizeSignature,
} from "@/lib/blog-infographic-studio/appearance";

const field =
  "mt-2 w-full rounded-lg border border-slate-300 bg-transparent p-2.5 text-sm dark:border-slate-700";
const heading = "text-sm font-bold text-slate-900 dark:text-white";
type Props = {
  config: BlogInfographicConfig;
  onChange: (patch: Partial<BlogInfographicConfig>) => void;
};
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
