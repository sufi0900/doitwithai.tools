"use client";

import { useId, useMemo, useRef, useState } from "react";
import { Download, Image as ImageIcon, ShieldCheck, Sparkles } from "lucide-react";
import { brandColors } from "@/lib/blog-infographic-studio/appearance";
import {
  defaultFeaturedBanner,
  evaluateAltText,
  workspace,
} from "./model";
import type { FeaturedBannerState, Project } from "./types";
import s from "./workspace.module.css";

function wrapTextLines(text: string, maxChars: number, maxLines: number): string[] {
  const words = (text || "").trim().split(/\s+/).filter(Boolean);
  const lines: string[] = [];
  let line = "";
  for (const word of words) {
    if (line && `${line} ${word}`.length > maxChars) {
      lines.push(line);
      line = word;
      if (lines.length === maxLines) break;
    } else {
      line = line ? `${line} ${word}` : word;
    }
  }
  if (line && lines.length < maxLines) lines.push(line);
  return lines.length ? lines : ["Editorial Feature Banner"];
}

export function FeaturedBannerArtwork({
  project,
  onUpdateBanner,
  onOptimizeAllAltTexts,
}: {
  project: Project;
  onUpdateBanner: (patch: Partial<FeaturedBannerState>) => void;
  onOptimizeAllAltTexts?: () => void;
}) {
  const svgRef = useRef<SVGSVGElement | null>(null);
  const uid = useId().replace(/:/g, "");
  const [editingAlt, setEditingAlt] = useState(false);
  const w = workspace(project);
  const banner = useMemo(() => defaultFeaturedBanner(project), [project]);
  const palette = brandColors(banner.theme || w.brand.color);
  const accent = palette[0] || "#4f46e5";
  const accentSoft = palette[1] || "#06b6d4";

  const headlineLines = wrapTextLines(banner.headline, 34, 3);
  const subLines = wrapTextLines(banner.subheadline, 62, 2);
  const altEval = useMemo(
    () => evaluateAltText(banner.altText, banner.headline),
    [banner.altText, banner.headline],
  );

  const downloadPng = async () => {
    if (!svgRef.current) return;
    const svgText = new XMLSerializer().serializeToString(svgRef.current);
    const blob = new Blob([svgText], { type: "image/svg+xml;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    try {
      const img = new Image();
      img.width = 1200;
      img.height = 630;
      await new Promise<void>((resolve, reject) => {
        img.onload = () => resolve();
        img.onerror = () => reject(new Error("Could not load banner SVG"));
        img.src = url;
      });
      const canvas = document.createElement("canvas");
      canvas.width = 1200;
      canvas.height = 630;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;
      ctx.drawImage(img, 0, 0, 1200, 630);
      const pngUrl = canvas.toDataURL("image/png");
      const a = document.createElement("a");
      a.href = pngUrl;
      a.download = `${(project.metaPack.urlSlug || "featured-banner").replace(/[^a-z0-9-]+/gi, "-")}-1200x630.png`;
      a.click();
    } finally {
      URL.revokeObjectURL(url);
    }
  };

  let hostLabel = w.brand.name || "";
  if (!hostLabel && project.brandSiteUrl) {
    try {
      hostLabel = new URL(
        /^https?:\/\//i.test(project.brandSiteUrl)
          ? project.brandSiteUrl
          : `https://${project.brandSiteUrl}`,
      ).hostname;
    } catch {}
  }

  return (
    <div className={s.featuredBannerCard}>
      <div className={s.featuredBannerBar}>
        <div className={s.featuredBannerTitleGroup}>
          <ImageIcon className="w-4 h-4" aria-hidden />
          <strong>16:9 Horizontal Featured Image</strong>
          <span className={s.dimBadge}>1200 × 630 px</span>
          <span
            className={altEval.score >= 80 ? s.altScoreGood : s.altScoreWarn}
            title={altEval.verdict}
          >
            <ShieldCheck className="w-3.5 h-3.5 inline mr-1" aria-hidden />
            Alt Score {altEval.score}/100
          </span>
        </div>

        <div className={s.featuredBannerActions}>
          {onOptimizeAllAltTexts ? (
            <button
              type="button"
              className={s.inlineToggleBtn}
              onClick={onOptimizeAllAltTexts}
              title="Auto-optimize Featured Banner and all H2 Section Infographic alt texts for WCAG 2.2 (<125 chars) and Multimodal SEO"
            >
              <ShieldCheck className="w-3.5 h-3.5" aria-hidden />
              Auto-Optimize All Alt Texts
            </button>
          ) : null}
          <button
            type="button"
            className={s.inlineToggleBtn}
            onClick={() => setEditingAlt((v) => !v)}
          >
            <Sparkles className="w-3.5 h-3.5" aria-hidden />
            {editingAlt ? "Hide Banner Settings" : "Edit Headline & Alt Text"}
          </button>
          <button
            type="button"
            className={s.inlineToggleBtn}
            onClick={() => void downloadPng()}
          >
            <Download className="w-3.5 h-3.5" aria-hidden /> Download 1200×630 PNG
          </button>
        </div>
      </div>

      <div className={s.featuredSvgFrame}>
        <svg
          ref={svgRef}
          viewBox="0 0 1200 630"
          width="1200"
          height="630"
          role="img"
          aria-label={banner.altText || banner.headline}
          className={s.featuredSvg}
        >
          <defs>
            <linearGradient id={`bg-${uid}`} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#0f172a" />
              <stop offset="55%" stopColor="#1e293b" />
              <stop offset="100%" stopColor="#090d16" />
            </linearGradient>
            <radialGradient id={`orb1-${uid}`} cx="82%" cy="18%" r="48%">
              <stop offset="0%" stopColor={accent} stopOpacity="0.42" />
              <stop offset="100%" stopColor={accent} stopOpacity="0" />
            </radialGradient>
            <radialGradient id={`orb2-${uid}`} cx="18%" cy="88%" r="42%">
              <stop offset="0%" stopColor={accentSoft} stopOpacity="0.28" />
              <stop offset="100%" stopColor={accentSoft} stopOpacity="0" />
            </radialGradient>
            <pattern id={`grid-${uid}`} width="40" height="40" patternUnits="userSpaceOnUse">
              <path
                d="M 40 0 L 0 0 0 40"
                fill="none"
                stroke="#ffffff"
                strokeOpacity="0.045"
                strokeWidth="1"
              />
            </pattern>
          </defs>

          <rect width="1200" height="630" rx="18" fill={`url(#bg-${uid})`} />
          <rect width="1200" height="630" rx="18" fill={`url(#grid-${uid})`} />
          <rect width="1200" height="630" rx="18" fill={`url(#orb1-${uid})`} />
          <rect width="1200" height="630" rx="18" fill={`url(#orb2-${uid})`} />

          {/* Left accent bar */}
          <rect x="64" y="64" width="6" height="502" rx="3" fill={accent} />

          {/* Topic / Keyword Pill */}
          <rect
            x="96"
            y="76"
            width={Math.min(460, Math.max(180, (banner.badge?.length || 12) * 12 + 44))}
            height="38"
            rx="19"
            fill={accent}
            fillOpacity="0.2"
            stroke={accent}
            strokeOpacity="0.55"
          />
          <text
            x="120"
            y="101"
            fill="#e2e8f0"
            fontSize="16"
            fontWeight="700"
            letterSpacing="1.6"
            fontFamily="system-ui, -apple-system, Segoe UI, sans-serif"
          >
            {(banner.badge || "EDITORIAL GUIDE").slice(0, 32)}
          </text>

          {/* Main Headline */}
          {headlineLines.map((line, i) => (
            <text
              key={i}
              x="96"
              y={184 + i * 68}
              fill="#f8fafc"
              fontSize="52"
              fontWeight="800"
              fontFamily="system-ui, -apple-system, Segoe UI, sans-serif"
            >
              {line}
            </text>
          ))}

          {/* Subheadline */}
          {subLines.map((line, i) => (
            <text
              key={i}
              x="96"
              y={192 + headlineLines.length * 68 + 34 + i * 32}
              fill="#cbd5e1"
              fontSize="22"
              fontWeight="400"
              fontFamily="system-ui, -apple-system, Segoe UI, sans-serif"
            >
              {line}
            </text>
          ))}

          {/* Geometric editorial accent card on right */}
          <rect
            x="900"
            y="148"
            width="236"
            height="332"
            rx="22"
            fill="#ffffff"
            fillOpacity="0.04"
            stroke="#ffffff"
            strokeOpacity="0.14"
          />
          <circle cx="1018" cy="242" r="52" fill={accent} fillOpacity="0.22" stroke={accent} strokeWidth="2" />
          <path
            d="M998 242 L1012 256 L1042 224"
            fill="none"
            stroke="#f8fafc"
            strokeWidth="4"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <rect x="944" y="328" width="148" height="12" rx="6" fill="#94a3b8" fillOpacity="0.35" />
          <rect x="944" y="356" width="116" height="12" rx="6" fill="#94a3b8" fillOpacity="0.25" />
          <rect x="944" y="384" width="132" height="12" rx="6" fill={accent} fillOpacity="0.55" />

          {/* Bottom signature bar */}
          <text
            x="96"
            y="558"
            fill="#94a3b8"
            fontSize="18"
            fontWeight="600"
            fontFamily="system-ui, -apple-system, Segoe UI, sans-serif"
          >
            {hostLabel ? `${hostLabel} · Complete Guide` : "Structured Editorial Visual · 16:9"}
          </text>
        </svg>
      </div>

      <div className={s.altAgentStrip}>
        <div className={s.altAgentRow}>
          <strong>WCAG Alt Text:</strong>
          <span>{banner.altText}</span>
        </div>
        <div className={s.altAgentVerdict}>
          {altEval.verdict} · {altEval.count} chars ({altEval.words} words)
        </div>
      </div>

      {editingAlt ? (
        <div className={s.bannerEditDrawer}>
          <div className={s.onboardingGrid2}>
            <div>
              <label className={s.label} htmlFor="banner-headline-input">
                Banner Headline
              </label>
              <input
                id="banner-headline-input"
                className={s.input}
                value={banner.headline}
                onChange={(e) => onUpdateBanner({ headline: e.target.value })}
              />
            </div>
            <div>
              <label className={s.label} htmlFor="banner-badge-input">
                Top Pill Badge
              </label>
              <input
                id="banner-badge-input"
                className={s.input}
                value={banner.badge || ""}
                onChange={(e) => onUpdateBanner({ badge: e.target.value })}
              />
            </div>
          </div>
          <div>
            <label className={s.label} htmlFor="banner-alt-input">
              Image Alt Text (Recommended: clear description under 125 chars, avoid &ldquo;image of&rdquo;)
            </label>
            <input
              id="banner-alt-input"
              className={s.input}
              value={banner.altText}
              onChange={(e) => {
                const val = e.target.value;
                const check = evaluateAltText(val, banner.headline);
                onUpdateBanner({
                  altText: val,
                  altScore: check.score,
                  altVerdict: check.verdict,
                });
              }}
            />
          </div>
        </div>
      ) : null}
    </div>
  );
}
