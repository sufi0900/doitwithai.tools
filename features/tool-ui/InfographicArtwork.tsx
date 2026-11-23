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

export type InfographicImageFitMode = "contain" | "cover";

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

export const EDITORIAL_LAYOUTS = new Set([
  "side-image-editorial-split",
  "side-image-right-spotlight",
  "side-image-horizontal-board",
]);

/**
 * Magazine-grade Informational & Editorial Split Infographic Layouts
 * - Supports both Horizontal (16:9 banners/diagrams) and Vertical images without distortion or cropping!
 * - Zero foggy gradient overlay over the user's image and zero overlapping badges covering image text!
 * - Never duplicates Section #1 in a separate box!
 * - Vertically centers Title + Body text inside every narrative row and card!
 */
export function InfographicArtwork({
  template,
  nodes,
  palette: p,
  width,
  top,
  height,
  artwork,
  imageFitMode = "contain",
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
  imageFitMode?: InfographicImageFitMode;
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
  const preserveRatio =
    imageFitMode === "cover" ? "xMidYMid slice" : "xMidYMid meet";

  // =========================================================================
  // MODE A: On Vertical / Portrait / Square Canvases, "side-image-editorial-split"
  // uses a WIDE 16:9 HERO VISUAL SHOWCASE BANNER AT THE TOP + BALANCED EDITORIAL GRID BELOW
  // so horizontal blog images/diagrams are NEVER squished or sliced in a narrow side column!
  // =========================================================================
  const useTopHeroBanner =
    template === "side-image-editorial-split" && width < 1400;

  if (useTopHeroBanner) {
    const heroBoxH = Math.floor(availH * (width === height ? 0.36 : 0.33));
    const gridTopY = top + heroBoxH + 22;
    const gridAvailH = availH - heroBoxH - 22;
    const cols = count === 1 ? 1 : 2;
    const rows = Math.ceil(count / cols);
    const gap = 18;
    const cardW = Math.floor((availW - gap * (cols - 1)) / cols);
    const cardH = Math.floor((gridAvailH - gap * (rows - 1)) / rows);

    const titleFontSize = Math.min(
      23,
      Math.max(16.5, Math.floor(cardH * 0.13)),
    );
    const bodyFontSize = Math.min(
      16.5,
      Math.max(13.5, Math.floor(cardH * 0.095)),
    );
    const textLeftOffset = 88;
    const textMaxW = cardW - textLeftOffset - 24;
    const maxTitleChars = Math.max(
      18,
      Math.floor(textMaxW / (titleFontSize * 0.56)),
    );
    const maxBodyChars = Math.max(
      24,
      Math.floor(textMaxW / (bodyFontSize * 0.53)),
    );
    const maxBodyLines = Math.max(
      1,
      Math.min(
        count <= 2 ? 5 : count <= 4 ? 4 : 3,
        Math.floor((cardH - 36 - titleFontSize * 1.4) / (bodyFontSize * 1.36)),
      ),
    );

    const innerPad = 12;
    const innerImgX = pad + innerPad;
    const innerImgY = top + innerPad;
    const innerImgW = availW - innerPad * 2;
    const innerImgH = heroBoxH - innerPad * 2;

    return (
      <g fontFamily="Inter, system-ui, -apple-system, sans-serif">
        <defs>
          <clipPath id="editorialTopHeroClip">
            <rect
              x={innerImgX}
              y={innerImgY}
              width={innerImgW}
              height={innerImgH}
              rx={18}
            />
          </clipPath>
        </defs>

        {/* Top Full-Width Framed Studio Image Showcase */}
        <rect
          x={pad}
          y={top}
          width={availW}
          height={heroBoxH}
          rx={24}
          fill={p.cardBg}
          stroke={p.accent}
          strokeWidth={2.5}
          filter="url(#card3dShadow)"
        />
        {/* Studio Mat Backdrop behind "contain" images so any aspect ratio looks intentional */}
        <rect
          x={innerImgX}
          y={innerImgY}
          width={innerImgW}
          height={innerImgH}
          rx={18}
          fill={p.bgStart}
          fillOpacity={0.65}
        />
        <g clipPath="url(#editorialTopHeroClip)">
          {artwork ? (
            <image
              href={artwork}
              x={innerImgX}
              y={innerImgY}
              width={innerImgW}
              height={innerImgH}
              preserveAspectRatio={preserveRatio}
              imageRendering="optimizeQuality"
            />
          ) : (
            <g>
              <rect
                x={innerImgX}
                y={innerImgY}
                width={innerImgW}
                height={innerImgH}
                fill="url(#accentGrad)"
                fillOpacity={0.14}
              />
              <circle
                cx={pad + availW / 2}
                cy={top + heroBoxH / 2}
                r={Math.min(availW, heroBoxH) * 0.24}
                fill={p.accent}
                fillOpacity={0.16}
              />
              {nodes[0] &&
                icon(
                  nodes[0],
                  pad + availW / 2,
                  top + heroBoxH / 2,
                  60,
                  p.accent,
                )}
            </g>
          )}
        </g>

        {/* Balanced Editorial Cards Grid Below Hero Visual (Vertically Centered Content!) */}
        {nodes.map((n, i) => {
          const isLastOdd = count % 2 === 1 && i === count - 1 && cols === 2;
          const c = isLastOdd ? 0 : i % cols;
          const r = Math.floor(i / cols);
          const actualCardW = isLastOdd ? availW : cardW;
          const x = pad + c * (cardW + gap);
          const y = gridTopY + r * (cardH + gap);
          const col = i % 2 === 0 ? p.accent : p.accentSecondary;
          const isSelected = selectedNodeId === n.id;

          const curTextMaxW = actualCardW - textLeftOffset - 24;
          const curTitleChars = Math.max(
            18,
            Math.floor(curTextMaxW / (titleFontSize * 0.56)),
          );
          const curBodyChars = Math.max(
            24,
            Math.floor(curTextMaxW / (bodyFontSize * 0.53)),
          );
          const tLines = wrapVisualText(n.title, curTitleChars, 2);
          const bLines = wrapVisualText(n.body, curBodyChars, maxBodyLines);

          const titleLineH = titleFontSize * 1.22;
          const bodyLineH = bodyFontSize * 1.36;
          const blockH =
            tLines.length * titleLineH + 6 + bLines.length * bodyLineH;
          const startTextY =
            y + Math.max(20, Math.floor((cardH - blockH) / 2)) + titleFontSize * 0.85;

          return (
            <g
              key={n.id}
              onClick={() => onSelect(n.id)}
              style={{ cursor: "pointer" }}
            >
              <rect
                x={x}
                y={y}
                width={actualCardW}
                height={cardH}
                rx={22}
                fill={p.cardBg}
                stroke={isSelected ? "#5271ff" : col}
                strokeWidth={isSelected ? 4 : 2.2}
                filter="url(#card3dShadow)"
              />
              {isSelected && (
                <rect
                  data-editor-only="true"
                  x={x - 4}
                  y={y - 4}
                  width={actualCardW + 8}
                  height={cardH + 8}
                  rx={25}
                  fill="none"
                  stroke="#5271ff"
                  strokeWidth={2.5}
                  strokeDasharray="8 5"
                />
              )}
              <rect
                x={x}
                y={y}
                width={10}
                height={cardH}
                rx={5}
                fill={col}
              />

              {/* Vertically Centered Medallion */}
              <circle
                cx={x + 48}
                cy={y + cardH / 2}
                r={26}
                fill={`${col}20`}
                stroke={col}
                strokeWidth={2}
              />
              {icon(n, x + 48, y + cardH / 2, 24, col)}

              {/* Vertically Centered Title + Body Block */}
              {tLines.map((tl, ti) => (
                <text
                  key={ti}
                  x={x + textLeftOffset}
                  y={startTextY + ti * titleLineH}
                  fill={p.textPrimary}
                  fontSize={titleFontSize}
                  fontWeight={800}
                >
                  {ti === 0 && (
                    <tspan fill={col} fontWeight={900}>
                      {n.badge || `0${i + 1}`}.{" "}
                    </tspan>
                  )}
                  {tl}
                </text>
              ))}

              {n.metricValue && (
                <text
                  x={x + actualCardW - 20}
                  y={y + 28}
                  textAnchor="end"
                  fill={col}
                  fontSize={13.5}
                  fontWeight={800}
                >
                  {n.metricValue.slice(0, 14)}
                </text>
              )}

              {bLines.map((bl, bi) => (
                <text
                  key={bi}
                  x={x + textLeftOffset}
                  y={
                    startTextY +
                    tLines.length * titleLineH +
                    6 +
                    bi * bodyLineH
                  }
                  fill={p.textSecondary}
                  fontSize={bodyFontSize}
                  fontWeight={500}
                >
                  {bl}
                </text>
              ))}
            </g>
          );
        })}
      </g>
    );
  }

  // =========================================================================
  // MODE B: SIDE-BY-SIDE EDITORIAL SPLIT ("side-image-horizontal-board" & "side-image-right-spotlight")
  // - Full-height Studio Visual Showcase on Left (or Right) with ZERO foggy overlay, ZERO cropping by default,
  //   and ZERO duplicate Section #1 card!
  // - Unified Narrative Sheet on the opposite side with vertically centered rows!
  // =========================================================================
  const isRightImage = template === "side-image-right-spotlight";
  const visualW = Math.floor(availW * (width >= 1400 ? 0.44 : 0.42));
  const gap = 28;
  const editorialW = availW - visualW - gap;
  const visualX = isRightImage ? pad + editorialW + gap : pad;
  const editorialX = isRightImage ? pad : pad + visualW + gap;

  const captionBarH = 66;
  const framePad = 14;
  const innerImgX = visualX + framePad;
  const innerImgY = top + framePad;
  const innerImgW = visualW - framePad * 2;
  const innerImgH = availH - captionBarH - framePad * 2;

  // Flowing Editorial Narrative Sheet on the opposite side (with vertically centered rows!)
  const itemH = Math.floor((availH - 32) / count);
  const titleFontSize = Math.min(
    24,
    Math.max(17, Math.floor(itemH * (count <= 3 ? 0.16 : 0.19))),
  );
  const bodyFontSize = Math.min(
    17,
    Math.max(13.5, Math.floor(itemH * (count <= 3 ? 0.115 : 0.135))),
  );
  const textStartOffset = 92;
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
      count <= 2 ? 6 : count <= 4 ? 4 : 3,
      Math.floor((itemH - 28 - titleFontSize * 1.4) / (bodyFontSize * 1.36)),
    ),
  );

  return (
    <g fontFamily="Inter, system-ui, -apple-system, sans-serif">
      <defs>
        <clipPath id="editorialSideImgClip">
          <rect
            x={innerImgX}
            y={innerImgY}
            width={innerImgW}
            height={innerImgH}
            rx={18}
          />
        </clipPath>
      </defs>

      {/* ================================================================= */}
      {/* FULL-HEIGHT STUDIO VISUAL SHOWCASE COLUMN (NO DUPLICATE CARD!)    */}
      {/* ================================================================= */}
      <g>
        <rect
          x={visualX}
          y={top}
          width={visualW}
          height={availH}
          rx={28}
          fill={p.cardBg}
          stroke={p.accent}
          strokeWidth={2.5}
          filter="url(#card3dShadow)"
        />
        {/* Subtle Matted Studio Canvas inside Frame so both horizontal & vertical images look crisp */}
        <rect
          x={innerImgX}
          y={innerImgY}
          width={innerImgW}
          height={innerImgH}
          rx={18}
          fill={p.bgStart}
          fillOpacity={0.7}
          stroke={p.cardBorder}
          strokeOpacity={0.4}
          strokeWidth={1.5}
        />

        <g clipPath="url(#editorialSideImgClip)">
          {artwork ? (
            <image
              href={artwork}
              x={innerImgX}
              y={innerImgY}
              width={innerImgW}
              height={innerImgH}
              preserveAspectRatio={preserveRatio}
              imageRendering="optimizeQuality"
            />
          ) : (
            <g>
              <rect
                x={innerImgX}
                y={innerImgY}
                width={innerImgW}
                height={innerImgH}
                fill="url(#accentGrad)"
                fillOpacity={0.15}
              />
              <circle
                cx={visualX + visualW / 2}
                cy={innerImgY + innerImgH / 2}
                r={Math.min(innerImgW, innerImgH) * 0.28}
                fill={p.accent}
                fillOpacity={0.18}
              />
              {nodes[0] &&
                icon(
                  nodes[0],
                  visualX + visualW / 2,
                  innerImgY + innerImgH / 2,
                  68,
                  p.accent,
                )}
            </g>
          )}
        </g>

        {/* Clean Studio Caption Bar Below Image (Never overlaps the image itself!) */}
        <rect
          x={visualX + 20}
          y={top + availH - captionBarH + 10}
          width={142}
          height={28}
          rx={14}
          fill={p.accent}
        />
        <text
          x={visualX + 91}
          y={top + availH - captionBarH + 29}
          textAnchor="middle"
          fill={p.badgeText}
          fontSize={12}
          fontWeight={800}
          letterSpacing={1.1}
        >
          VISUAL SUMMARY
        </text>
        <text
          x={visualX + 174}
          y={top + availH - captionBarH + 29}
          fill={p.textSecondary}
          fontSize={14}
          fontWeight={700}
        >
          {count} Key Takeaways Breakdown
        </text>
      </g>

      {/* ================================================================= */}
      {/* EDITORIAL INFORMATION SHEET COLUMN (VERTICALLY CENTERED ROWS!)    */}
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
      <rect
        x={editorialX + 24}
        y={top}
        width={editorialW - 48}
        height={6}
        rx={3}
        fill="url(#accentGrad)"
      />

      {nodes.map((n, i) => {
        const rowY = top + 16 + i * itemH;
        const centerY = rowY + itemH / 2;
        const col = i % 2 === 0 ? p.accent : p.accentSecondary;
        const isSelected = selectedNodeId === n.id;
        const tLines = wrapVisualText(n.title, maxTitleChars, 2);
        const bLines = wrapVisualText(n.body, maxBodyChars, maxBodyLines);

        // True vertical centering of Title + Body inside each narrative row!
        const titleLineH = titleFontSize * 1.22;
        const bodyLineH = bodyFontSize * 1.38;
        const textBlockH =
          tLines.length * titleLineH + 6 + bLines.length * bodyLineH;
        const firstLineY =
          rowY +
          Math.max(20, Math.floor((itemH - textBlockH) / 2)) +
          titleFontSize * 0.85;

        return (
          <g
            key={n.id}
            onClick={() => onSelect(n.id)}
            style={{ cursor: "pointer" }}
          >
            {isSelected && (
              <rect
                data-editor-only="true"
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

            {i < count - 1 && (
              <line
                x1={editorialX + 48}
                y1={centerY + 28}
                x2={editorialX + 48}
                y2={rowY + itemH + itemH / 2 - 28}
                stroke={col}
                strokeOpacity={0.35}
                strokeWidth={2.5}
                strokeDasharray="4 4"
              />
            )}

            <circle
              cx={editorialX + 48}
              cy={centerY}
              r={26}
              fill={`${col}22`}
              stroke={col}
              strokeWidth={2}
            />
            {icon(n, editorialX + 48, centerY, 24, col)}

            {tLines.map((tl, ti) => (
              <text
                key={ti}
                x={editorialX + textStartOffset}
                y={firstLineY + ti * titleLineH}
                fill={p.textPrimary}
                fontSize={titleFontSize}
                fontWeight={800}
              >
                {ti === 0 && (
                  <tspan fill={col} fontWeight={900}>
                    {n.badge || `0${i + 1}`}.{" "}
                  </tspan>
                )}
                {tl}
              </text>
            ))}

            {n.metricValue && (
              <text
                x={editorialX + editorialW - 24}
                y={firstLineY}
                textAnchor="end"
                fill={col}
                fontSize={14}
                fontWeight={800}
              >
                {n.metricValue.slice(0, 14)}
              </text>
            )}

            {bLines.map((line, li) => (
              <text
                key={li}
                x={editorialX + textStartOffset}
                y={
                  firstLineY +
                  tLines.length * titleLineH +
                  6 +
                  li * bodyLineH
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
