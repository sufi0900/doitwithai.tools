import React from "react";
import type {
  InfographicColorPalette,
  InfographicNodeItem,
} from "./EditableInfographicStudio";
import { wrapVisualText } from "./visualText";

export type InfographicBgWaveStyle =
  | "waves"
  | "aurora"
  | "rings"
  | "grid"
  | "minimal";

export function TemplateThumbnail({
  id,
  category = "roadmap",
}: {
  id: string;
  category?: string;
}) {
  const pyramid = /pyramid|funnel|stair|temple|iceberg/.test(id);
  const radial = /radial|flywheel|honeycomb|anatomy/.test(id);
  const split =
    /side-image|photo|carousel|editorial|versus|before-after|donts/.test(id);
  return (
    <svg
      viewBox="0 0 240 150"
      aria-hidden="true"
      className="w-full rounded-lg"
      fontFamily="Inter, Arial, sans-serif"
    >
      <rect width="240" height="150" rx="10" fill="#eef1ff" />
      <path
        d="M0 120 Q60 105 120 120 T240 115 L240 150 L0 150 Z"
        fill="#dce3ff"
      />
      <rect x="16" y="14" width="92" height="8" rx="4" fill="#243469" />
      <rect x="16" y="28" width="140" height="4" rx="2" fill="#8094ff" />
      {pyramid ? (
        [0, 1, 2, 3].map((i) => (
          <path
            key={i}
            d={`M${106 - i * 22} ${45 + i * 23} L${134 + i * 22} ${45 + i * 23} L${155 + i * 22} ${64 + i * 23} L${85 - i * 22} ${64 + i * 23} Z`}
            fill={i % 2 ? "#8094ff" : "#4058d0"}
          />
        ))
      ) : radial ? (
        <g>
          <circle cx="120" cy="92" r="22" fill="#4058d0" />
          {[0, 1, 2, 3, 4, 5].map((i) => {
            const a = (i * Math.PI) / 3;
            const x = 120 + 70 * Math.cos(a),
              y = 92 + 40 * Math.sin(a);
            return (
              <g key={i}>
                <line
                  x1="120"
                  y1="92"
                  x2={x}
                  y2={y}
                  stroke="#8094ff"
                  strokeWidth="3"
                />
                <circle cx={x} cy={y} r="11" fill="#5271ff" />
              </g>
            );
          })}
        </g>
      ) : split ? (
        <g>
          <rect x="16" y="45" width="94" height="89" rx="8" fill="#4058d0" />
          <rect x="124" y="45" width="100" height="89" rx="8" fill="white" />
          {[0, 1, 2].map((i) => (
            <g key={i}>
              <circle cx="138" cy={64 + i * 24} r="5" fill="#5271ff" />
              <rect
                x="148"
                y={61 + i * 24}
                width="64"
                height="6"
                rx="3"
                fill="#8094ff"
              />
            </g>
          ))}
        </g>
      ) : category === "statistical" ? (
        <g>
          {[0, 1, 2, 3].map((i) => (
            <rect
              key={i}
              x={25 + i * 49}
              y={105 - i * 14}
              width="30"
              height={28 + i * 14}
              rx="5"
              fill={i % 2 ? "#8094ff" : "#4058d0"}
            />
          ))}
        </g>
      ) : (
        <g>
          <path d="M36 51 L36 125" stroke="#8094ff" strokeWidth="4" />
          {[0, 1, 2].map((i) => (
            <g key={i}>
              <circle cx="36" cy={54 + i * 33} r="10" fill="#4058d0" />
              <rect
                x="58"
                y={46 + i * 33}
                width={140 - i * 15}
                height="8"
                rx="4"
                fill="#243469"
              />
              <rect
                x="58"
                y={60 + i * 33}
                width="120"
                height="5"
                rx="2"
                fill="#8094ff"
              />
            </g>
          ))}
        </g>
      )}
    </svg>
  );
}

/**
 * Renders rich, graphic-designer SVG background waves, aurora ribbons, orbital rings,
 * or architectural grids behind the infographic so designs feel 3D and crafted.
 */
export function InfographicBackgroundDecor({
  width: W,
  height: H,
  palette: p,
  style = "waves",
}: {
  width: number;
  height: number;
  palette: InfographicColorPalette;
  style?: InfographicBgWaveStyle;
}) {
  if (style === "minimal") return null;

  if (style === "waves") {
    return (
      <g pointerEvents="none">
        {/* Top-Right Ambient Orb & Layered Header Wave */}
        <circle
          cx={W * 0.9}
          cy={H * 0.08}
          r={Math.min(W, H) * 0.32}
          fill={p.accent}
          fillOpacity={0.11}
        />
        <circle
          cx={W * 0.08}
          cy={H * 0.24}
          r={Math.min(W, H) * 0.22}
          fill={p.accentSecondary}
          fillOpacity={0.08}
        />
        <path
          d={`M 0 ${H * 0.18} C ${W * 0.28} ${H * 0.08}, ${W * 0.68} ${H * 0.24}, ${W} ${H * 0.13} L ${W} 0 L 0 0 Z`}
          fill={p.accent}
          fillOpacity={0.09}
        />
        <path
          d={`M 0 ${H * 0.14} C ${W * 0.36} ${H * 0.21}, ${W * 0.72} ${H * 0.06}, ${W} ${H * 0.16} L ${W} 0 L 0 0 Z`}
          fill={p.accentSecondary}
          fillOpacity={0.065}
        />
        {/* Mid-Canvas Flowing Silk Wave Ribbon + Contour Stroke */}
        <path
          d={`M 0 ${H * 0.48} C ${W * 0.32} ${H * 0.39}, ${W * 0.66} ${H * 0.57}, ${W} ${H * 0.46} L ${W} ${H * 0.61} C ${W * 0.66} ${H * 0.71}, ${W * 0.32} ${H * 0.54}, 0 ${H * 0.63} Z`}
          fill={p.accentSecondary}
          fillOpacity={0.085}
        />
        <path
          d={`M 0 ${H * 0.48} C ${W * 0.32} ${H * 0.39}, ${W * 0.66} ${H * 0.57}, ${W} ${H * 0.46}`}
          fill="none"
          stroke={p.accent}
          strokeOpacity={0.16}
          strokeWidth={2}
        />
        {/* Bottom Multi-Layered 3D Waves */}
        <path
          d={`M 0 ${H * 0.84} C ${W * 0.35} ${H * 0.76}, ${W * 0.65} ${H * 0.92}, ${W} ${H * 0.82} L ${W} ${H} L 0 ${H} Z`}
          fill={p.accent}
          fillOpacity={0.11}
        />
        <path
          d={`M 0 ${H * 0.9} C ${W * 0.28} ${H * 0.97}, ${W * 0.72} ${H * 0.85}, ${W} ${H * 0.92} L ${W} ${H} L 0 ${H} Z`}
          fill={p.accentSecondary}
          fillOpacity={0.13}
        />
      </g>
    );
  }

  if (style === "aurora") {
    return (
      <g pointerEvents="none">
        <path
          d={`M -80 ${H * 0.22} Q ${W * 0.45} ${H * 0.04} ${W + 80} ${H * 0.28} L ${W + 80} ${H * 0.44} Q ${W * 0.45} ${H * 0.18} -80 ${H * 0.38} Z`}
          fill={p.accent}
          fillOpacity={0.11}
        />
        <path
          d={`M -80 ${H * 0.66} Q ${W * 0.55} ${H * 0.86} ${W + 80} ${H * 0.6} L ${W + 80} ${H * 0.76} Q ${W * 0.55} ${H * 0.98} -80 ${H * 0.82} Z`}
          fill={p.accentSecondary}
          fillOpacity={0.11}
        />
        <circle
          cx={W * 0.14}
          cy={H * 0.82}
          r={Math.min(W, H) * 0.25}
          fill={p.accent}
          fillOpacity={0.09}
        />
      </g>
    );
  }

  if (style === "rings") {
    return (
      <g pointerEvents="none">
        {[0.22, 0.34, 0.46].map((rFactor, idx) => (
          <circle
            key={idx}
            cx={W * 0.85}
            cy={H * 0.18}
            r={Math.min(W, H) * rFactor}
            fill="none"
            stroke={p.accent}
            strokeOpacity={0.14 - idx * 0.03}
            strokeWidth={2.5}
            strokeDasharray={idx % 2 === 1 ? "10 8" : undefined}
          />
        ))}
        {[0.2, 0.32, 0.44].map((rFactor, idx) => (
          <circle
            key={`b-${idx}`}
            cx={W * 0.14}
            cy={H * 0.82}
            r={Math.min(W, H) * rFactor}
            fill="none"
            stroke={p.accentSecondary}
            strokeOpacity={0.14 - idx * 0.03}
            strokeWidth={2.5}
          />
        ))}
      </g>
    );
  }

  // "grid"
  return (
    <g pointerEvents="none">
      <rect width={W} height={H} fill="url(#dotGrid)" />
      <path
        d={`M 0 ${H * 0.88} Q ${W * 0.5} ${H * 0.8} ${W} ${H * 0.88} L ${W} ${H} L 0 ${H} Z`}
        fill={p.accent}
        fillOpacity={0.09}
      />
    </g>
  );
}

/**
 * Only side-image editorial split layouts delegate to InfographicArtwork;
 * all other templates use their dedicated 3D vector geometries in EditableInfographicStudio!
 */
export const EDITORIAL_LAYOUTS = new Set([
  "side-image-editorial-split",
  "side-image-right-spotlight",
  "side-image-horizontal-board",
]);

/**
 * Magazine-grade Informational & Editorial Split Infographic Layouts
 * (Supports 1 to 6 points cleanly — features a framed hero visual + definition card on one side
 * and a flowing editorial narrative spine with custom icons/images on the other side!)
 */
export function InfographicArtwork({
  template,
  nodes,
  palette: p,
  width,
  top,
  height,
  artwork,
  selectedNodeId,
  onSelect,
  icon,
}: {
  template: string;
  nodes: InfographicNodeItem[];
  palette: InfographicColorPalette;
  width: number;
  top: number;
  height: number;
  artwork?: string;
  selectedNodeId?: string | null;
  onSelect: (id: string) => void;
  icon: (
    node: InfographicNodeItem,
    x: number,
    y: number,
    size: number,
    color: string,
  ) => React.ReactNode;
}) {
  const pad = width >= 1400 ? 64 : 52;
  const availW = width - pad * 2;
  const availH = Math.max(320, height - 8);
  const count = Math.max(1, nodes.length);
  const isRightImage = template === "side-image-right-spotlight";
  const isHorizontalBoard =
    template === "side-image-horizontal-board" || width >= 1400;

  // Split proportions: 41% Visual Showcase Panel, 56% Flowing Editorial Information Sheet
  const visualW = Math.floor(availW * (isHorizontalBoard ? 0.39 : 0.41));
  const gap = 28;
  const editorialW = availW - visualW - gap;
  const visualX = isRightImage ? pad + editorialW + gap : pad;
  const editorialX = isRightImage ? pad : pad + visualW + gap;

  const primaryNode = nodes[0];
  const imgBoxH = Math.floor(availH * 0.56);
  const defBoxY = top + imgBoxH + 18;
  const defBoxH = Math.max(120, availH - imgBoxH - 18);

  // Flowing Editorial Narrative Sheet on the opposite side (single elevated sheet with divided narrative items)
  const itemH = Math.floor((availH - 36) / count);
  const titleFontSize = Math.min(24, Math.max(16.5, Math.floor(itemH * 0.19)));
  const bodyFontSize = Math.min(17, Math.max(13.5, Math.floor(itemH * 0.135)));
  const textStartOffset = 88;
  const textMaxW = editorialW - textStartOffset - 28;
  const maxTitleChars = Math.max(
    20,
    Math.floor(textMaxW / (titleFontSize * 0.56)),
  );
  const maxBodyChars = Math.max(
    28,
    Math.floor(textMaxW / (bodyFontSize * 0.53)),
  );
  const maxBodyLines = Math.max(
    1,
    Math.min(
      count <= 3 ? 4 : 3,
      Math.floor((itemH - titleFontSize * 1.8 - 18) / (bodyFontSize * 1.35)),
    ),
  );

  const defMaxChars = Math.max(20, Math.floor((visualW - 52) / (15.5 * 0.55)));
  const defLines = wrapVisualText(
    primaryNode?.body ||
      "Key definition and strategic context for this visual guide.",
    defMaxChars,
    Math.max(1, Math.min(4, Math.floor((defBoxH - 92) / 22))),
  );

  return (
    <g fontFamily="Inter, system-ui, -apple-system, sans-serif">
      <defs>
        <clipPath id="editorialHeroImgClip">
          <rect
            x={visualX}
            y={top}
            width={visualW}
            height={imgBoxH}
            rx={26}
          />
        </clipPath>
      </defs>

      {/* ================================================================= */}
      {/* VISUAL SHOWCASE COLUMN (FRAMED HERO ARTWORK + DEFINITION CALLOUT) */}
      {/* ================================================================= */}
      <g
        onClick={() => primaryNode && onSelect(primaryNode.id)}
        style={{ cursor: "pointer" }}
      >
        <rect
          x={visualX}
          y={top}
          width={visualW}
          height={imgBoxH}
          rx={26}
          fill={p.cardBg}
          stroke={p.accent}
          strokeWidth={2.5}
          filter="url(#card3dShadow)"
        />
        <g clipPath="url(#editorialHeroImgClip)">
          {artwork ? (
            <>
              <image
                href={artwork}
                x={visualX}
                y={top}
                width={visualW}
                height={imgBoxH}
                preserveAspectRatio="xMidYMid slice"
              />
              <rect
                x={visualX}
                y={top + imgBoxH * 0.55}
                width={visualW}
                height={imgBoxH * 0.45}
                fill="url(#bgGrad)"
                fillOpacity={0.72}
              />
            </>
          ) : (
            <g>
              <rect
                x={visualX}
                y={top}
                width={visualW}
                height={imgBoxH}
                fill="url(#accentGrad)"
                fillOpacity={0.18}
              />
              <circle
                cx={visualX + visualW / 2}
                cy={top + imgBoxH * 0.44}
                r={Math.min(visualW, imgBoxH) * 0.28}
                fill={p.accent}
                fillOpacity={0.18}
              />
              {primaryNode &&
                icon(
                  primaryNode,
                  visualX + visualW / 2,
                  top + imgBoxH * 0.44,
                  64,
                  p.accent,
                )}
            </g>
          )}

          {/* Top-Left Floating Visual Pill inside Image Frame */}
          <rect
            x={visualX + 20}
            y={top + 20}
            width={168}
            height={34}
            rx={17}
            fill={p.bgStart}
            fillOpacity={0.86}
            stroke={p.accent}
            strokeWidth={1.5}
          />
          <text
            x={visualX + 104}
            y={top + 42}
            textAnchor="middle"
            fill={p.textPrimary}
            fontSize={13}
            fontWeight={800}
            letterSpacing={1.2}
          >
            VISUAL OVERVIEW
          </text>
        </g>

        {/* Bottom Definition & Key Takeaway Card under the Hero Image */}
        <rect
          x={visualX}
          y={defBoxY}
          width={visualW}
          height={defBoxH}
          rx={26}
          fill={p.cardBg}
          stroke={
            primaryNode && selectedNodeId === primaryNode.id
              ? "#5271ff"
              : p.cardBorder
          }
          strokeWidth={
            primaryNode && selectedNodeId === primaryNode.id ? 3.5 : 2
          }
          filter="url(#card3dShadow)"
        />
        <rect
          x={visualX + 24}
          y={defBoxY + 20}
          width={148}
          height={26}
          rx={13}
          fill={p.accent}
        />
        <text
          x={visualX + 98}
          y={defBoxY + 38}
          textAnchor="middle"
          fill={p.badgeText}
          fontSize={12}
          fontWeight={800}
          letterSpacing={1}
        >
          KEY TAKEAWAY
        </text>

        <text
          x={visualX + 26}
          y={defBoxY + 76}
          fill={p.textPrimary}
          fontSize={21}
          fontWeight={800}
        >
          {
            wrapVisualText(
              primaryNode?.title || "Core Concept",
              Math.max(16, Math.floor((visualW - 52) / 13)),
              1,
            )[0]
          }
        </text>

        {defLines.map((line, idx) => (
          <text
            key={idx}
            x={visualX + 26}
            y={defBoxY + 104 + idx * 22}
            fill={p.textSecondary}
            fontSize={15}
            fontWeight={500}
          >
            {line}
          </text>
        ))}
      </g>

      {/* ================================================================= */}
      {/* EDITORIAL INFORMATION SHEET COLUMN (CLEAN UNIFIED NARRATIVE FLOW) */}
      {/* ================================================================= */}
      <rect
        x={editorialX}
        y={top}
        width={editorialW}
        height={availH}
        rx={28}
        fill={p.cardBg}
        stroke={p.cardBorder}
        strokeWidth={2}
        filter="url(#card3dShadow)"
      />
      {/* Top 3D Specular Highlight Bar */}
      <rect
        x={editorialX + 24}
        y={top}
        width={editorialW - 48}
        height={6}
        rx={3}
        fill="url(#accentGrad)"
      />

      {nodes.map((n, i) => {
        const rowY = top + 18 + i * itemH;
        const centerY = rowY + itemH / 2;
        const col = i % 2 === 0 ? p.accent : p.accentSecondary;
        const isSelected = selectedNodeId === n.id;
        const tLines = wrapVisualText(n.title, maxTitleChars, 1);
        const bLines = wrapVisualText(n.body, maxBodyChars, maxBodyLines);
        const titleBaselineY =
          rowY + Math.max(26, Math.min(44, Math.floor(itemH * 0.28)));

        return (
          <g
            key={n.id}
            onClick={() => onSelect(n.id)}
            style={{ cursor: "pointer" }}
          >
            {/* Active Selection Highlight Ring inside Editorial Sheet */}
            {isSelected && (
              <rect
                x={editorialX + 14}
                y={rowY + 4}
                width={editorialW - 28}
                height={itemH - 8}
                rx={16}
                fill="#5271ff"
                fillOpacity={0.1}
                stroke="#5271ff"
                strokeWidth={2.5}
                strokeDasharray="6 4"
              />
            )}

            {/* Subtle Row Divider */}
            {i > 0 && (
              <line
                x1={editorialX + 28}
                y1={rowY}
                x2={editorialX + editorialW - 28}
                y2={rowY}
                stroke={p.textSecondary}
                strokeOpacity={0.18}
                strokeWidth={1.5}
              />
            )}

            {/* Vertical Spine Connector Line between Medallions */}
            {i < count - 1 && (
              <line
                x1={editorialX + 48}
                y1={centerY + 26}
                x2={editorialX + 48}
                y2={rowY + itemH + itemH / 2 - 26}
                stroke={col}
                strokeOpacity={0.35}
                strokeWidth={2.5}
                strokeDasharray="4 4"
              />
            )}

            {/* Icon or Custom Uploaded Image Medallion */}
            <circle
              cx={editorialX + 48}
              cy={centerY}
              r={25}
              fill={`${col}22`}
              stroke={col}
              strokeWidth={2}
            />
            {icon(n, editorialX + 48, centerY, 24, col)}

            {/* Step Number + Section Heading */}
            <text
              x={editorialX + textStartOffset}
              y={titleBaselineY}
              fill={p.textPrimary}
              fontSize={titleFontSize}
              fontWeight={800}
            >
              <tspan fill={col} fontWeight={900}>
                {n.badge || `0${i + 1}`}.{" "}
              </tspan>
              {tLines[0]}
            </text>

            {/* Metric Badge on Top-Right of Row if provided */}
            {n.metricValue && (
              <text
                x={editorialX + editorialW - 24}
                y={titleBaselineY}
                textAnchor="end"
                fill={col}
                fontSize={14}
                fontWeight={800}
              >
                {n.metricValue.slice(0, 14)}
              </text>
            )}

            {/* Concise Narrative Explanation */}
            {bLines.map((line, li) => (
              <text
                key={li}
                x={editorialX + textStartOffset}
                y={
                  titleBaselineY +
                  titleFontSize * 1.15 +
                  li * (bodyFontSize * 1.35)
                }
                fill={p.textSecondary}
                fontSize={bodyFontSize}
                fontWeight={500}
              >
                {line}
              </text>
            ))}
          </g>
        );
      })}
    </g>
  );
}
