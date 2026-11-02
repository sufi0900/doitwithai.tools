"use client";
import { forwardRef, useId } from "react";
import {
  PRESETS,
  highlightParts,
  safeWebUrl,
  type Device,
  type textLayout,
} from "./preview";
import type { SnippetState } from "./types";
export type Layouts = {
  title: ReturnType<typeof textLayout>;
  description: ReturnType<typeof textLayout>;
};
export type Scene = {
  device: Device;
  country: string;
  query: string;
  siteName: string;
  faviconUrl: string;
  date: string;
  rating: string;
  reviews: string;
  aiOverview: boolean;
  heatmap: boolean;
};
const SerpCanvas = forwardRef<
  SVGSVGElement,
  { snippet: SnippetState; scene: Scene; layouts: Layouts | null }
>(function SerpCanvas({ snippet, scene, layouts }, ref) {
  const id = useId().replace(/:/g, "");
  const preset = PRESETS[scene.device];
  const width = preset.width;
  const titleLines = layouts?.title.lines.length
    ? layouts.title.lines
    : [snippet.title || "Your page title appears here"];
  const descriptionLines = layouts?.description.lines.length
    ? layouts.description.lines
    : [
        snippet.description
          ? "Measuring description…"
          : "Write a helpful description that matches the page.",
      ];
  let hostname = "example.com",
    path = "";
  try {
    const parsed = new URL(snippet.url);
    hostname = parsed.hostname;
    path = parsed.pathname
      .split("/")
      .filter(Boolean)
      .map((s) => {
        try {
          return decodeURIComponent(s).replace(/[-_]/g, " ");
        } catch {
          return s;
        }
      })
      .join(" › ");
  } catch {}
  const start = 138 + (scene.aiOverview ? 156 : 0),
    titleY = start + 54,
    descriptionY = titleY + titleLines.length * 26 + 5;
  const ratingValue = Number(scene.rating);
  const showRating = ratingValue > 0 && ratingValue <= 5;
  const bottom =
    descriptionY + descriptionLines.length * 21 + (showRating ? 30 : 0) + 35;
  const height = bottom + 120;
  const title = titleLines.map((line, i) => (
    <text key={i} x="24" y={titleY + i * 26} fill="#1a0dab" fontSize="20">
      {line}
    </text>
  ));
  return (
    <svg
      ref={ref}
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      role="img"
      aria-label={`Illustrative ${scene.device} search preview for ${scene.country}`}
      className="block h-auto w-full rounded-2xl font-sans"
      style={{ fontFamily: "Arial, sans-serif" }}
    >
      <defs>
        <linearGradient id={`ai-${id}`}>
          <stop stopColor="#eff2ff" />
          <stop offset="1" stopColor="#f6edff" />
        </linearGradient>
        <radialGradient id={`heat-${id}`}>
          <stop stopColor="#ef4444" stopOpacity=".42" />
          <stop offset=".48" stopColor="#facc15" stopOpacity=".2" />
          <stop offset="1" stopColor="#22c55e" stopOpacity="0" />
        </radialGradient>
        <clipPath id={`content-${id}`}>
          <rect x="24" y="0" width={width - 48} height={height} />
        </clipPath>
      </defs>
      <rect width={width} height={height} rx="16" fill="white" />
      <text x="24" y="39" fill="#4285f4" fontSize="24" fontWeight="600">
        <tspan fill="#4285f4">G</tspan>
        <tspan fill="#ea4335">o</tspan>
        <tspan fill="#fbbc05">o</tspan>
        <tspan fill="#4285f4">g</tspan>
        <tspan fill="#34a853">l</tspan>
        <tspan fill="#ea4335">e</tspan>
      </text>
      <rect
        x="24"
        y="54"
        width={width - 48}
        height="36"
        rx="18"
        fill="#f1f3f4"
      />
      <text x="40" y="77" fontSize="13" fill="#202124">
        {(scene.query || "Your search query").slice(
          0,
          scene.device === "mobile" ? 40 : 85,
        )}
      </text>
      <text x="25" y="117" fill="#1a73e8" fontSize="12">
        All
      </text>
      <text x="65" y="117" fill="#5f6368" fontSize="12">
        Images
      </text>
      <text x="125" y="117" fill="#5f6368" fontSize="12">
        Videos
      </text>
      <text x="185" y="117" fill="#5f6368" fontSize="12">
        News
      </text>
      <path d={`M0 128 H${width}`} stroke="#e8eaed" />
      <path d="M24 127 H44" stroke="#1a73e8" strokeWidth="3" />
      {scene.aiOverview && (
        <g>
          <rect
            x="16"
            y="140"
            width={width - 32}
            height="138"
            rx="16"
            fill={`url(#ai-${id})`}
          />
          <text x="30" y="164" fontSize="14" fill="#374151" fontWeight="700">
            ✦ AI Overview placement
          </text>
          <text x="30" y="186" fontSize="11" fill="#64748b">
            Illustrative layout. No AI answer was retrieved.
          </text>
          {[0, 1, 2].map((i) => (
            <rect
              key={i}
              x="30"
              y={201 + i * 14}
              width={width - 80 - i * 24}
              height="6"
              rx="3"
              fill="#ccd4eb"
            />
          ))}
          <text x="30" y="262" fontSize="11" fill="#64748b">
            Availability and placement vary by search.
          </text>
        </g>
      )}
      <g clipPath={`url(#content-${id})`}>
        <circle cx="37" cy={start + 12} r="12" fill="#e8f0fe" />
        <text
          x="37"
          y={start + 17}
          textAnchor="middle"
          fontSize="13"
          fill="#4866dc"
        >
          {(scene.siteName || hostname).slice(0, 1).toUpperCase()}
        </text>
        {safeWebUrl(scene.faviconUrl) && (
          <image
            data-site-icon="true"
            href={safeWebUrl(scene.faviconUrl)}
            x="25"
            y={start}
            width="24"
            height="24"
            onError={(e) => {
              e.currentTarget.style.display = "none";
            }}
          />
        )}
        <text x="58" y={start + 8} fontSize="14" fill="#202124">
          {(scene.siteName || hostname).slice(0, 65)}
        </text>
        <text x="58" y={start + 26} fontSize="11" fill="#4d5156">
          {`${hostname}${path && scene.device === "desktop" ? ` › ${path}` : ""}`.slice(
            0,
            scene.device === "mobile" ? 48 : 95,
          )}
        </text>
        {title}
        {descriptionLines.map((line, i) => (
          <text
            key={i}
            x="24"
            y={descriptionY + i * 21}
            fill="#4d5156"
            fontSize="14"
          >
            {highlightParts(line, scene.query).map((part, index) => (
              <tspan key={index} fontWeight={part.bold ? 700 : 400}>
                {part.text}
              </tspan>
            ))}
          </text>
        ))}
        {showRating && (
          <text
            x="24"
            y={descriptionY + descriptionLines.length * 21 + 7}
            fontSize="13"
            fill="#8a5b00"
          >{`${"★".repeat(Math.round(ratingValue))}${"☆".repeat(5 - Math.round(ratingValue))}  ${ratingValue.toFixed(1)}${scene.reviews ? ` (${scene.reviews})` : ""}`}</text>
        )}
      </g>
      {scene.heatmap && (
        <ellipse
          cx={width * 0.42}
          cy={titleY + 10}
          rx={width * 0.5}
          ry="80"
          fill={`url(#heat-${id})`}
          pointerEvents="none"
        />
      )}
      <line x1="24" x2={width - 24} y1={bottom} y2={bottom} stroke="#e8eaed" />
      <circle cx="36" cy={bottom + 28} r="11" fill="#e5e7eb" />
      {[0, 1, 2].map((i) => (
        <rect
          key={i}
          x={i === 2 ? 24 : 56}
          y={bottom + 19 + i * 16}
          width={(width - 80) * (i === 0 ? 0.36 : i === 1 ? 0.75 : 0.9)}
          height={i === 2 ? 16 : 7}
          rx="3"
          fill={i === 2 ? "#dce4ff" : "#e5e7eb"}
        />
      ))}
      <text x="24" y={height - 15} fill="#64748b" fontSize="10">
        {scene.country} · {scene.device} · Layout simulation, not live rankings
      </text>
    </svg>
  );
});
export default SerpCanvas;
