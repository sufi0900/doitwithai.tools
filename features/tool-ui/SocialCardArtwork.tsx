import React from "react";
import { wrapVisualText } from "./visualText";

export interface SocialArtworkTheme {
  textPrimary: string;
  textSecondary: string;
  accent: string;
  accentSecondary: string;
  cardSurface: string;
}

/** Shared, editable artwork. Layout geometry scales with the selected output size. */
export function SocialCardArtwork({
  kind,
  headline,
  body,
  metric = "",
  width: w,
  height: h,
  palette: p,
  image,
  imageStyle = "paper",
  step = "01",
}: {
  kind: string;
  headline: string;
  body: string;
  metric?: string;
  width: number;
  height: number;
  palette: SocialArtworkTheme;
  image?: string;
  imageStyle?: "paper" | "photo";
  step?: string;
}) {
  const pad = 76,
    top = 166,
    bottom = h - 148,
    available = bottom - top;
  const landscape = h / w < 0.8;
  const size = landscape ? 43 : 62;
  const text = (
    value: string,
    x: number,
    y: number,
    font: number,
    maxWidth: number,
    lines: number,
    bold = false,
    color?: string,
  ) =>
    wrapVisualText(
      value,
      Math.max(10, Math.floor(maxWidth / (font * 0.54))),
      lines,
    ).map((line, i) => (
      <text
        key={i}
        x={x}
        y={y + i * font * 1.25}
        fontSize={font}
        fontWeight={bold ? 800 : 450}
        fill={color || (bold ? p.textPrimary : p.textSecondary)}
      >
        {line}
      </text>
    ));
  const steps = body
    .split(/\n+|(?<=[.!?])\s+/)
    .map((s) => s.trim())
    .filter(Boolean)
    .slice(0, 3);
  const heading = (
    maxWidth = w - pad * 2,
    x = pad,
    y = top + size,
    maxLines = 3,
  ) => text(headline, x, y, size, maxWidth, maxLines, true);
  if (/framework|checklist|roadmap/.test(kind)) {
    const titleY = top + size,
      titleLines = landscape ? 2 : 3;
    const lineCount = wrapVisualText(
      headline,
      Math.floor((w - pad * 2) / (size * 0.54)),
      titleLines,
    ).length;
    const start = titleY + (lineCount - 1) * size * 1.25 + 50,
      row = (bottom - start) / Math.max(1, steps.length);
    return (
      <g fontFamily="Arial, Helvetica, sans-serif">
        {heading(w - pad * 2, pad, titleY, titleLines)}
        {steps.map((s, i) => (
          <g key={i}>
            <text
              x={pad}
              y={start + i * row + 35}
              fill={p.accent}
              fontSize={landscape ? 38 : 56}
              fontWeight="800"
            >
              {kind.includes("checklist") ? "✓" : `0${i + 1}`}
            </text>
            {text(
              s,
              pad + 95,
              start + i * row + 22,
              landscape ? 24 : 30,
              w - pad * 2 - 100,
              landscape ? 2 : 3,
            )}
            <line
              x1={pad + 95}
              x2={w - pad}
              y1={start + (i + 1) * row - 10}
              y2={start + (i + 1) * row - 10}
              stroke={p.textSecondary}
              strokeOpacity=".2"
            />
          </g>
        ))}
      </g>
    );
  }
  if (/stat|gauge/.test(kind)) {
    return (
      <g>
        {heading(w - pad * 2, pad, top + size, landscape ? 2 : 3)}
        <text
          x={pad}
          y={top + available * 0.65}
          fill={p.accent}
          fontSize={landscape ? 100 : 160}
          fontWeight="800"
        >
          {metric || step}
        </text>
        {text(
          body,
          pad,
          top + available * 0.8,
          landscape ? 24 : 30,
          w - pad * 2,
          landscape ? 2 : 3,
        )}
      </g>
    );
  }
  if (/before-after|versus|split/.test(kind)) {
    const start = top + (landscape ? 110 : 190),
      cw = (w - pad * 2 - 32) / 2;
    return (
      <g>
        {heading(w - pad * 2, pad, top + size, 2)}
        {["Before", "After"].map((label, i) => (
          <g key={label}>
            <rect
              x={pad + i * (cw + 32)}
              y={start}
              width={cw}
              height={bottom - start}
              rx="20"
              fill={p.cardSurface}
              stroke={p.accent}
              strokeOpacity=".4"
            />
            <text
              x={pad + i * (cw + 32) + 28}
              y={start + 50}
              fontSize="24"
              fontWeight="750"
              fill={p.accent}
            >
              {label}
            </text>
            {text(
              steps[i] || "Add your comparison",
              pad + i * (cw + 32) + 28,
              start + 105,
              landscape ? 24 : 32,
              cw - 56,
              landscape ? 3 : 7,
              true,
            )}
          </g>
        ))}
      </g>
    );
  }
  if (/photo/.test(kind) && image) {
    const ih = available * 0.47;
    return (
      <g>
        <image
          href={image}
          x={pad}
          y={top}
          width={w - pad * 2}
          height={ih}
          preserveAspectRatio="xMidYMid slice"
        />
        {text(
          headline,
          pad,
          top + ih + 60,
          landscape ? 32 : 46,
          w - pad * 2,
          2,
          true,
        )}
        {text(
          body,
          pad,
          top + ih + (landscape ? 140 : 190),
          landscape ? 22 : 28,
          w - pad * 2,
          landscape ? 1 : 3,
        )}
      </g>
    );
  }
  if (/carousel|editorial/.test(kind)) {
    const iw = landscape ? w * 0.36 : w * 0.57;
    const headingWidth = landscape ? w * 0.49 : w - pad * 2;
    return (
      <g>
        {heading(headingWidth, pad, top + size, landscape ? 3 : 3)}
        {text(
          body,
          pad,
          landscape ? top + 210 : top + 260,
          landscape ? 24 : 30,
          headingWidth,
          landscape ? 2 : 3,
        )}
        {image && (
          <image
            href={image}
            x={landscape ? w - iw - 30 : w - iw - 50}
            y={landscape ? top - 10 : bottom - iw * 0.63}
            width={iw}
            height={iw * 0.66}
            preserveAspectRatio={
              imageStyle === "photo" ? "xMidYMid slice" : "xMidYMid meet"
            }
          />
        )}
      </g>
    );
  }
  if (/memo|minimal|swiss/.test(kind)) {
    const cream = kind.includes("memo");
    return (
      <g>
        {cream && (
          <rect
            x={pad - 22}
            y={top - 15}
            width={w - pad * 2 + 44}
            height={available + 35}
            rx="8"
            fill="#fffdf7"
          />
        )}
        <rect x={pad} y={top + 10} width="90" height="8" fill={p.accent} />
        {text(
          headline,
          pad,
          top + 95,
          landscape ? 40 : 58,
          w - pad * 2,
          landscape ? 2 : 4,
          true,
          cream ? "#172554" : undefined,
        )}
        {text(
          body,
          pad,
          top + (landscape ? 225 : 420),
          landscape ? 25 : 32,
          w - pad * 2,
          landscape ? 2 : 4,
          false,
          cream ? "#475569" : undefined,
        )}
      </g>
    );
  }
  return (
    <g>
      <text
        x={pad}
        y={top + 90}
        fill={p.accent}
        fontSize="130"
        fontFamily="Georgia, serif"
      >
        “
      </text>
      {heading(w - pad * 2, pad, top + 140, landscape ? 2 : 4)}
      {text(
        body,
        pad,
        top + (landscape ? 270 : 470),
        landscape ? 25 : 32,
        w - pad * 2,
        landscape ? 2 : 4,
      )}
    </g>
  );
}
