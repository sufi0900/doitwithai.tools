import React from "react";
import { wrapVisualText } from "./visualText";

export interface SocialArtworkTheme {
  textPrimary: string;
  textSecondary: string;
  accent: string;
  accentSecondary: string;
  cardSurface: string;
}

export type SocialEditableField = "headline" | "body" | "metric" | "badge" | "handle";

/** Shared, editable artwork. Layout geometry scales and vertically centers with the selected output size. */
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
  imageFitMode = "contain",
  step = "01",
  selectedField,
  onSelectField,
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
  imageFitMode?: "contain" | "cover";
  step?: string;
  selectedField?: SocialEditableField | null;
  onSelectField?: (field: SocialEditableField) => void;
}) {
  const landscape = h / w < 0.8;
  const pad = landscape ? 64 : 76;
  const top = landscape ? 136 : 158;
  const bottom = h - (landscape ? 116 : 138);
  const available = bottom - top;
  const midY = top + available / 2;

  // Reject generic paper-sculpture fallback so only real article/uploaded photos render
  const validImage =
    image && !image.includes("paper-sculpture.png") ? image : undefined;
  const preserveRatio =
    imageFitMode === "cover" ? "xMidYMid slice" : "xMidYMid meet";

  const interactiveProps = (field: SocialEditableField) =>
    onSelectField
      ? {
          style: { cursor: "text" } as React.CSSProperties,
          onClick: (e: React.MouseEvent) => {
            e.stopPropagation();
            onSelectField(field);
          },
        }
      : {};

  const renderLines = (
    lines: string[],
    x: number,
    firstBaselineY: number,
    font: number,
    lineHeight: number,
    bold = false,
    color?: string,
    field?: SocialEditableField,
  ) => {
    const isSelected = field && selectedField === field;
    const totalH = lines.length * lineHeight;
    return (
      <g {...(field ? interactiveProps(field) : {})}>
        {isSelected && lines.length > 0 && (
          <rect
            x={x - 14}
            y={firstBaselineY - font - 6}
            width={Math.min(w - x - pad + 28, w - pad * 2 + 28)}
            height={totalH + 14}
            rx={12}
            fill="none"
            stroke={p.accent}
            strokeWidth={2.5}
            strokeDasharray="8 5"
          />
        )}
        {lines.map((line, i) => (
          <text
            key={i}
            x={x}
            y={firstBaselineY + i * lineHeight}
            fontSize={font}
            fontWeight={bold ? 800 : 500}
            fill={color || (bold ? p.textPrimary : p.textSecondary)}
            fontFamily="system-ui, -apple-system, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif"
          >
            {line}
          </text>
        ))}
      </g>
    );
  };

  const rawSteps = body
    .split(/\n+|(?<=[.!?])\s+/)
    .map((s) => s.trim())
    .filter(Boolean)
    .slice(0, 3);
  const steps =
    rawSteps.length > 0
      ? rawSteps
      : [
          "Lead with a high-contrast, concrete takeaway.",
          "Break complex ideas into scannable visual steps.",
          "End with a clear action your audience can save.",
        ];

  // 1. FRAMEWORK / CHECKLIST / ROADMAP
  if (/framework|checklist|roadmap/.test(kind)) {
    const titleFont = landscape ? 38 : 50;
    const titleLH = Math.round(titleFont * 1.2);
    const titleMaxChars = Math.max(
      16,
      Math.floor((w - pad * 2) / (titleFont * 0.53)),
    );
    const titleLines = wrapVisualText(
      headline || "Key Strategic Playbook",
      titleMaxChars,
      landscape ? 2 : 3,
    );
    const titleBlockH = titleLines.length * titleLH;

    const stepFont = landscape ? 22 : 28;
    const stepLH = Math.round(stepFont * 1.26);
    const stepTextW = w - pad * 2 - 126;
    const stepMaxChars = Math.max(18, Math.floor(stepTextW / (stepFont * 0.52)));
    const wrappedSteps = steps.map((s) =>
      wrapVisualText(s, stepMaxChars, landscape ? 2 : 2),
    );

    const cardGap = landscape ? 14 : 20;
    const stepCardHeights = wrappedSteps.map((lines) =>
      Math.max(landscape ? 74 : 96, lines.length * stepLH + (landscape ? 28 : 38)),
    );
    const totalStepsH =
      stepCardHeights.reduce((acc, v) => acc + v, 0) +
      Math.max(0, stepCardHeights.length - 1) * cardGap;

    const headerGap = landscape ? 24 : 36;
    const totalContentH = titleBlockH + headerGap + totalStepsH;
    const startY = Math.max(top, midY - totalContentH / 2);
    const titleFirstY = startY + titleFont * 0.88;
    let cursorY = startY + titleBlockH + headerGap;

    return (
      <g>
        {renderLines(
          titleLines,
          pad,
          titleFirstY,
          titleFont,
          titleLH,
          true,
          p.textPrimary,
          "headline",
        )}
        {wrappedSteps.map((sLines, i) => {
          const cardH = stepCardHeights[i];
          const cardY = cursorY;
          cursorY += cardH + cardGap;
          const badgeSize = landscape ? 46 : 58;
          const badgeY = cardY + (cardH - badgeSize) / 2;
          const textBlockH = sLines.length * stepLH;
          const textFirstY =
            cardY + (cardH - textBlockH) / 2 + stepFont * 0.84;

          return (
            <g key={i} {...interactiveProps("body")}>
              <rect
                x={pad}
                y={cardY}
                width={w - pad * 2}
                height={cardH}
                rx={18}
                fill={p.cardSurface}
                fillOpacity={0.78}
                stroke={p.accent}
                strokeOpacity={0.32}
                strokeWidth={1.5}
              />
              <rect
                x={pad + 20}
                y={badgeY}
                width={badgeSize}
                height={badgeSize}
                rx={14}
                fill={p.accent}
                fillOpacity={0.18}
                stroke={p.accent}
                strokeWidth={1.8}
              />
              <text
                x={pad + 20 + badgeSize / 2}
                y={badgeY + badgeSize * 0.64}
                textAnchor="middle"
                fill={p.accent}
                fontSize={landscape ? 22 : 26}
                fontWeight="900"
                fontFamily="system-ui, -apple-system, sans-serif"
              >
                {kind.includes("checklist") ? "✓" : `0${i + 1}`}
              </text>
              {sLines.map((line, li) => (
                <text
                  key={li}
                  x={pad + 20 + badgeSize + 22}
                  y={textFirstY + li * stepLH}
                  fontSize={stepFont}
                  fontWeight={600}
                  fill={p.textPrimary}
                  fontFamily="system-ui, -apple-system, sans-serif"
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

  // 2. STAT SPOTLIGHT / GAUGE
  if (/stat|gauge/.test(kind)) {
    const titleFont = landscape ? 36 : 48;
    const titleLH = Math.round(titleFont * 1.2);
    const titleLines = wrapVisualText(
      headline || "Key Performance Benchmark",
      Math.max(16, Math.floor((w - pad * 2) / (titleFont * 0.53))),
      landscape ? 2 : 3,
    );
    const bodyFont = landscape ? 24 : 30;
    const bodyLH = Math.round(bodyFont * 1.3);
    const bodyLines = wrapVisualText(
      body || "Verified impact across production workflows.",
      Math.max(20, Math.floor((w - pad * 2 - 48) / (bodyFont * 0.52))),
      landscape ? 2 : 3,
    );

    const statFont = landscape ? 92 : 138;
    const statBoxH = landscape ? 150 : 210;
    const gap1 = landscape ? 24 : 36;
    const gap2 = landscape ? 22 : 34;

    const totalH =
      titleLines.length * titleLH +
      gap1 +
      statBoxH +
      gap2 +
      bodyLines.length * bodyLH;
    const startY = Math.max(top, midY - totalH / 2);
    const titleFirstY = startY + titleFont * 0.88;
    const statBoxY = startY + titleLines.length * titleLH + gap1;
    const bodyFirstY = statBoxY + statBoxH + gap2 + bodyFont * 0.86;

    return (
      <g>
        {renderLines(
          titleLines,
          pad,
          titleFirstY,
          titleFont,
          titleLH,
          true,
          p.textPrimary,
          "headline",
        )}
        <g {...interactiveProps("metric")}>
          <rect
            x={pad}
            y={statBoxY}
            width={w - pad * 2}
            height={statBoxH}
            rx={24}
            fill={p.cardSurface}
            fillOpacity={0.82}
            stroke={p.accent}
            strokeOpacity={0.45}
            strokeWidth={2}
          />
          <text
            x={pad + 36}
            y={statBoxY + statBoxH * 0.68}
            fill={p.accent}
            fontSize={statFont}
            fontWeight="900"
            fontFamily="system-ui, -apple-system, sans-serif"
          >
            {metric || step || "3.4x"}
          </text>
        </g>
        {renderLines(
          bodyLines,
          pad,
          bodyFirstY,
          bodyFont,
          bodyLH,
          false,
          p.textSecondary,
          "body",
        )}
      </g>
    );
  }

  // 3. BEFORE / AFTER SPLIT COMPARISON
  if (/before-after|versus|split/.test(kind)) {
    const titleFont = landscape ? 36 : 48;
    const titleLH = Math.round(titleFont * 1.2);
    const titleLines = wrapVisualText(
      headline || "Old Workflow vs. Upgraded System",
      Math.max(16, Math.floor((w - pad * 2) / (titleFont * 0.53))),
      2,
    );
    const titleBlockH = titleLines.length * titleLH;
    const gap = landscape ? 24 : 36;
    const cardH = Math.min(
      available - titleBlockH - gap,
      landscape ? 270 : 520,
    );
    const totalH = titleBlockH + gap + cardH;
    const startY = Math.max(top, midY - totalH / 2);
    const cardsY = startY + titleBlockH + gap;
    const cw = (w - pad * 2 - 28) / 2;

    const colFont = landscape ? 22 : 28;
    const colLH = Math.round(colFont * 1.3);
    const colMaxChars = Math.max(14, Math.floor((cw - 56) / (colFont * 0.53)));

    const leftCopy =
      steps[0] || "Manual, fragmented steps that slow down publishing.";
    const rightCopy =
      steps[1] ||
      steps[0] ||
      "Streamlined, repeatable system built for high engagement.";

    return (
      <g>
        {renderLines(
          titleLines,
          pad,
          startY + titleFont * 0.88,
          titleFont,
          titleLH,
          true,
          p.textPrimary,
          "headline",
        )}
        {[
          { label: "BEFORE / OLD WAY", copy: leftCopy, isAfter: false },
          { label: "AFTER / NEW WAY", copy: rightCopy, isAfter: true },
        ].map((col, i) => {
          const cx = pad + i * (cw + 28);
          const lines = wrapVisualText(
            col.copy,
            colMaxChars,
            landscape ? 4 : 6,
          );
          const textBlockH = lines.length * colLH;
          const bodyAreaTop = cardsY + 74;
          const bodyAreaH = cardH - 94;
          const firstLineY =
            bodyAreaTop +
            Math.max(0, (bodyAreaH - textBlockH) / 2) +
            colFont * 0.85;

          return (
            <g key={col.label} {...interactiveProps("body")}>
              <rect
                x={cx}
                y={cardsY}
                width={cw}
                height={cardH}
                rx="22"
                fill={p.cardSurface}
                fillOpacity={col.isAfter ? 0.95 : 0.65}
                stroke={col.isAfter ? p.accent : p.textSecondary}
                strokeOpacity={col.isAfter ? 0.65 : 0.3}
                strokeWidth={col.isAfter ? 2.2 : 1.5}
              />
              <rect
                x={cx + 24}
                y={cardsY + 22}
                width={Math.min(cw - 48, 210)}
                height={34}
                rx={17}
                fill={col.isAfter ? p.accent : p.textSecondary}
                fillOpacity={0.18}
              />
              <text
                x={cx + 40}
                y={cardsY + 45}
                fontSize="16"
                fontWeight="800"
                letterSpacing="1"
                fill={col.isAfter ? p.accent : p.textSecondary}
                fontFamily="system-ui, -apple-system, sans-serif"
              >
                {col.label}
              </text>
              {lines.map((line, li) => (
                <text
                  key={li}
                  x={cx + 28}
                  y={firstLineY + li * colLH}
                  fontSize={colFont}
                  fontWeight={col.isAfter ? 700 : 500}
                  fill={col.isAfter ? p.textPrimary : p.textSecondary}
                  fontFamily="system-ui, -apple-system, sans-serif"
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

  // 4. PHOTO CARD OR EDITORIAL / CAROUSEL WITH ACTUAL IMAGE
  if (/photo/.test(kind) || (/carousel|editorial/.test(kind) && validImage)) {
    const isLandscapeSplit = landscape && validImage;
    if (isLandscapeSplit) {
      const imgW = Math.round((w - pad * 2) * 0.44);
      const imgH = available - 16;
      const imgX = w - pad - imgW;
      const imgY = top + 8;
      const textW = w - pad * 2 - imgW - 36;

      const titleFont = 34;
      const titleLH = 42;
      const titleLines = wrapVisualText(
        headline || "Key Strategic Insight",
        Math.max(16, Math.floor(textW / (titleFont * 0.54))),
        3,
      );
      const bodyFont = 22;
      const bodyLH = 29;
      const bodyLines = wrapVisualText(
        body || "",
        Math.max(18, Math.floor(textW / (bodyFont * 0.52))),
        3,
      );
      const gap = 20;
      const totalTextH =
        titleLines.length * titleLH +
        (bodyLines.length > 0 ? gap + bodyLines.length * bodyLH : 0);
      const textStartY = midY - totalTextH / 2;
      const clipId = `sc-photo-clip-land-${w}-${h}`;

      return (
        <g>
          <defs>
            <clipPath id={clipId}>
              <rect x={imgX} y={imgY} width={imgW} height={imgH} rx={20} />
            </clipPath>
          </defs>
          {renderLines(
            titleLines,
            pad,
            textStartY + titleFont * 0.86,
            titleFont,
            titleLH,
            true,
            p.textPrimary,
            "headline",
          )}
          {bodyLines.length > 0 &&
            renderLines(
              bodyLines,
              pad,
              textStartY +
                titleLines.length * titleLH +
                gap +
                bodyFont * 0.86,
              bodyFont,
              bodyLH,
              false,
              p.textSecondary,
              "body",
            )}
          <rect
            x={imgX}
            y={imgY}
            width={imgW}
            height={imgH}
            rx={20}
            fill="#0b1120"
            fillOpacity={0.55}
            stroke={p.accent}
            strokeOpacity={0.4}
            strokeWidth={2}
          />
          <image
            href={validImage}
            x={imgX}
            y={imgY}
            width={imgW}
            height={imgH}
            preserveAspectRatio={preserveRatio}
            clipPath={`url(#${clipId})`}
          />
        </g>
      );
    }

    // Portrait / Square with Image (or Photo Card placeholder)
    const ih = Math.round(available * 0.5);
    const imgY = top;
    const imgW = w - pad * 2;
    const clipId = `sc-photo-clip-${w}-${h}`;

    const textAreaTop = top + ih + 24;
    const textAreaBottom = bottom;
    const textAreaMid = (textAreaTop + textAreaBottom) / 2;

    const titleFont = landscape ? 30 : 42;
    const titleLH = Math.round(titleFont * 1.2);
    const titleLines = wrapVisualText(
      headline || "Featured Visual Insight",
      Math.max(16, Math.floor(imgW / (titleFont * 0.53))),
      2,
    );
    const bodyFont = landscape ? 20 : 26;
    const bodyLH = Math.round(bodyFont * 1.28);
    const bodyLines = wrapVisualText(
      body || "",
      Math.max(20, Math.floor(imgW / (bodyFont * 0.52))),
      landscape ? 1 : 3,
    );
    const gap = 16;
    const totalTextH =
      titleLines.length * titleLH +
      (bodyLines.length > 0 ? gap + bodyLines.length * bodyLH : 0);
    const startTextY = Math.max(textAreaTop, textAreaMid - totalTextH / 2);

    return (
      <g>
        <defs>
          <clipPath id={clipId}>
            <rect x={pad} y={imgY} width={imgW} height={ih} rx={22} />
          </clipPath>
        </defs>
        <rect
          x={pad}
          y={imgY}
          width={imgW}
          height={ih}
          rx={22}
          fill="#0b1120"
          fillOpacity={0.5}
          stroke={p.accent}
          strokeOpacity={0.35}
          strokeWidth={2}
        />
        {validImage ? (
          <image
            href={validImage}
            x={pad}
            y={imgY}
            width={imgW}
            height={ih}
            preserveAspectRatio={preserveRatio}
            clipPath={`url(#${clipId})`}
          />
        ) : (
          <g>
            <circle
              cx={w / 2}
              cy={imgY + ih / 2 - 18}
              r={36}
              fill={p.accent}
              fillOpacity={0.18}
            />
            <text
              x={w / 2}
              y={imgY + ih / 2 - 8}
              textAnchor="middle"
              fill={p.accent}
              fontSize={28}
              fontWeight="900"
            >
              +
            </text>
            <text
              x={w / 2}
              y={imgY + ih / 2 + 46}
              textAnchor="middle"
              fill={p.textSecondary}
              fontSize={22}
              fontWeight="700"
              fontFamily="system-ui, -apple-system, sans-serif"
            >
              Upload a Custom Photo or Extract an Article Image
            </text>
          </g>
        )}
        {renderLines(
          titleLines,
          pad,
          startTextY + titleFont * 0.86,
          titleFont,
          titleLH,
          true,
          p.textPrimary,
          "headline",
        )}
        {bodyLines.length > 0 &&
          renderLines(
            bodyLines,
            pad,
            startTextY +
              titleLines.length * titleLH +
              gap +
              bodyFont * 0.86,
            bodyFont,
            bodyLH,
            false,
            p.textSecondary,
            "body",
          )}
      </g>
    );
  }

  // 5. FOUNDER MEMO / MINIMAL / SWISS
  if (/memo|minimal|swiss/.test(kind)) {
    const cream = kind.includes("memo");
    const innerPad = pad + (cream ? 24 : 0);
    const maxW = w - innerPad * 2;
    const titleFont = landscape ? 38 : 54;
    const titleLH = Math.round(titleFont * 1.2);
    const titleLines = wrapVisualText(
      headline || "Founder's Strategic Note",
      Math.max(15, Math.floor(maxW / (titleFont * 0.54))),
      landscape ? 2 : 4,
    );
    const bodyFont = landscape ? 24 : 31;
    const bodyLH = Math.round(bodyFont * 1.32);
    const bodyLines = wrapVisualText(
      body || "",
      Math.max(18, Math.floor(maxW / (bodyFont * 0.52))),
      landscape ? 2 : 4,
    );

    const barH = 8;
    const gap1 = 26;
    const gap2 = bodyLines.length > 0 ? (landscape ? 20 : 30) : 0;
    const totalH =
      barH +
      gap1 +
      titleLines.length * titleLH +
      gap2 +
      bodyLines.length * bodyLH;
    const startY = Math.max(top + 20, midY - totalH / 2);

    return (
      <g>
        {cream && (
          <rect
            x={pad - 12}
            y={top - 8}
            width={w - pad * 2 + 24}
            height={available + 16}
            rx="20"
            fill="#fffdf7"
            stroke="#e2e8f0"
            strokeWidth={2}
          />
        )}
        <rect
          x={innerPad}
          y={startY}
          width="96"
          height={barH}
          rx={4}
          fill={p.accent}
        />
        {renderLines(
          titleLines,
          innerPad,
          startY + barH + gap1 + titleFont * 0.86,
          titleFont,
          titleLH,
          true,
          cream ? "#0f172a" : p.textPrimary,
          "headline",
        )}
        {bodyLines.length > 0 &&
          renderLines(
            bodyLines,
            innerPad,
            startY +
              barH +
              gap1 +
              titleLines.length * titleLH +
              gap2 +
              bodyFont * 0.86,
            bodyFont,
            bodyLH,
            false,
            cream ? "#334155" : p.textSecondary,
            "body",
          )}
      </g>
    );
  }

  // 6. CAROUSEL SLIDE / QUOTE CARD / CONTRARIAN BANNER (MATHEMATICALLY VERTICALLY CENTERED)
  const isCarousel = /carousel|editorial/.test(kind);
  const titleFont = landscape ? 40 : 56;
  const titleLH = Math.round(titleFont * 1.2);
  const titleLines = wrapVisualText(
    headline || "Key Strategic Insight",
    Math.max(15, Math.floor((w - pad * 2) / (titleFont * 0.54))),
    landscape ? 3 : 4,
  );
  const bodyFont = landscape ? 24 : 31;
  const bodyLH = Math.round(bodyFont * 1.32);
  const bodyLines = wrapVisualText(
    body || "",
    Math.max(18, Math.floor((w - pad * 2) / (bodyFont * 0.52))),
    landscape ? 2 : 4,
  );

  const kickerH = isCarousel ? 14 : 54;
  const gap1 = isCarousel ? 24 : 18;
  const gap2 = bodyLines.length > 0 ? (landscape ? 22 : 32) : 0;
  const totalH =
    kickerH +
    gap1 +
    titleLines.length * titleLH +
    gap2 +
    bodyLines.length * bodyLH;
  const startY = Math.max(top, midY - totalH / 2);

  return (
    <g>
      {isCarousel ? (
        <g>
          <rect
            x={pad}
            y={startY}
            width={110}
            height={10}
            rx={5}
            fill={p.accent}
          />
          <circle
            cx={pad + 132}
            cy={startY + 5}
            r={5}
            fill={p.accentSecondary}
          />
        </g>
      ) : (
        <text
          x={pad - 6}
          y={startY + 68}
          fill={p.accent}
          fillOpacity={0.85}
          fontSize="120"
          fontFamily="Georgia, serif"
        >
          “
        </text>
      )}
      {renderLines(
        titleLines,
        pad,
        startY + kickerH + gap1 + titleFont * 0.86,
        titleFont,
        titleLH,
        true,
        p.textPrimary,
        "headline",
      )}
      {bodyLines.length > 0 &&
        renderLines(
          bodyLines,
          pad,
          startY +
            kickerH +
            gap1 +
            titleLines.length * titleLH +
            gap2 +
            bodyFont * 0.86,
          bodyFont,
          bodyLH,
          false,
          p.textSecondary,
          "body",
        )}
    </g>
  );
}
