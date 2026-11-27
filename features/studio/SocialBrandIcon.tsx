"use client";

import React from "react";

export interface SocialBrandStyleMeta {
  color: string;
  tintBg: string;
  borderTint: string;
  gradientCss?: string;
}

export const SOCIAL_BRAND_META: Record<string, SocialBrandStyleMeta> = {
  Instagram: {
    color: "#E1306C",
    tintBg: "rgba(225, 48, 108, 0.14)",
    borderTint: "rgba(225, 48, 108, 0.38)",
    gradientCss: "linear-gradient(135deg, #F58529 0%, #DD2A7B 55%, #8134AF 100%)",
  },
  Facebook: {
    color: "#1877F2",
    tintBg: "rgba(24, 119, 242, 0.14)",
    borderTint: "rgba(24, 119, 242, 0.38)",
  },
  LinkedIn: {
    color: "#0A66C2",
    tintBg: "rgba(10, 102, 194, 0.16)",
    borderTint: "rgba(10, 102, 194, 0.42)",
  },
  X: {
    color: "#1D9BF0",
    tintBg: "rgba(29, 155, 240, 0.14)",
    borderTint: "rgba(29, 155, 240, 0.38)",
  },
  Pinterest: {
    color: "#E60023",
    tintBg: "rgba(230, 0, 35, 0.14)",
    borderTint: "rgba(230, 0, 35, 0.38)",
  },
  YouTube: {
    color: "#FF0000",
    tintBg: "rgba(255, 0, 0, 0.14)",
    borderTint: "rgba(255, 0, 0, 0.38)",
  },
  Threads: {
    color: "#A855F7",
    tintBg: "rgba(168, 85, 247, 0.14)",
    borderTint: "rgba(168, 85, 247, 0.38)",
  },
  Reddit: {
    color: "#FF4500",
    tintBg: "rgba(255, 69, 0, 0.14)",
    borderTint: "rgba(255, 69, 0, 0.38)",
  },
  Quora: {
    color: "#B92B27",
    tintBg: "rgba(185, 43, 39, 0.14)",
    borderTint: "rgba(185, 43, 39, 0.38)",
  },
  Email: {
    color: "#10B981",
    tintBg: "rgba(16, 185, 129, 0.14)",
    borderTint: "rgba(16, 185, 129, 0.38)",
  },
  All: {
    color: "#5271FF",
    tintBg: "rgba(82, 113, 255, 0.14)",
    borderTint: "rgba(82, 113, 255, 0.38)",
  },
};

export function getSocialBrandMeta(channel: string): SocialBrandStyleMeta {
  return SOCIAL_BRAND_META[channel] || SOCIAL_BRAND_META.All!;
}

export function SocialBrandIcon({
  channel,
  size = 15,
  className = "",
  withBadge = false,
  solidColor,
}: {
  channel: string;
  size?: number;
  className?: string;
  withBadge?: boolean;
  solidColor?: string;
}) {
  const meta = getSocialBrandMeta(channel);
  const iconColor = solidColor || (withBadge ? "#FFFFFF" : meta.color);

  const glyph = (() => {
    switch (channel) {
      case "Instagram":
        return (
          <svg
            width={size}
            height={size}
            viewBox="0 0 24 24"
            fill="none"
            aria-hidden="true"
            className={className}
          >
            <rect
              x="2.5"
              y="2.5"
              width="19"
              height="19"
              rx="5.5"
              stroke={iconColor}
              strokeWidth="2.1"
            />
            <circle
              cx="12"
              cy="12"
              r="4.3"
              stroke={iconColor}
              strokeWidth="2.1"
            />
            <circle cx="17.5" cy="6.5" r="1.4" fill={iconColor} />
          </svg>
        );
      case "Facebook":
        return (
          <svg
            width={size}
            height={size}
            viewBox="0 0 24 24"
            fill="none"
            aria-hidden="true"
            className={className}
          >
            <path
              d="M14.5 21v-8h2.7l.4-3.1h-3.1V7.9c0-.9.3-1.5 1.6-1.5h1.7V3.6c-.3 0-1.3-.1-2.5-.1-2.5 0-4.2 1.5-4.2 4.3v2.1H8.4V13h2.7v8h3.4Z"
              fill={iconColor}
            />
          </svg>
        );
      case "LinkedIn":
        return (
          <svg
            width={size}
            height={size}
            viewBox="0 0 24 24"
            fill="none"
            aria-hidden="true"
            className={className}
          >
            <rect
              x="2.5"
              y="2.5"
              width="19"
              height="19"
              rx="4"
              stroke={iconColor}
              strokeWidth="2"
            />
            <circle cx="7.8" cy="8.2" r="1.35" fill={iconColor} />
            <rect x="6.7" y="10.8" width="2.2" height="6.8" rx="0.6" fill={iconColor} />
            <path
              d="M11.2 10.8h2.1v1c.5-.7 1.3-1.2 2.4-1.2 1.9 0 3.1 1.2 3.1 3.5v3.5h-2.2v-3.2c0-1.1-.5-1.8-1.5-1.8-1 0-1.7.7-1.7 1.8v3.2h-2.2v-6.8Z"
              fill={iconColor}
            />
          </svg>
        );
      case "X":
        return (
          <svg
            width={size}
            height={size}
            viewBox="0 0 24 24"
            fill="none"
            aria-hidden="true"
            className={className}
          >
            <path
              d="M18.2 3.5h3l-6.6 7.5 7.7 9.5h-6l-4.7-6.1-5.4 6.1H3.1l7-8-7.4-9h6.2l4.2 5.5 5.1-5.5Zm-1.1 15.2h1.7L8 5.2H6.2l10.9 13.5Z"
              fill={iconColor}
            />
          </svg>
        );
      case "Pinterest":
        return (
          <svg
            width={size}
            height={size}
            viewBox="0 0 24 24"
            fill="none"
            aria-hidden="true"
            className={className}
          >
            <circle
              cx="12"
              cy="12"
              r="9.5"
              stroke={iconColor}
              strokeWidth="2"
            />
            <path
              d="M10.4 18.8c-.2-1 .1-2.2.5-3.4l.8-3.3s-.2-.4-.2-1c0-1 .6-1.7 1.3-1.7.6 0 .9.5.9 1 0 .6-.4 1.6-.6 2.5-.2.7.4 1.3 1.1 1.3 1.3 0 2.3-1.4 2.3-3.4 0-1.8-1.3-3-3.1-3-2.1 0-3.4 1.6-3.4 3.2 0 .6.2 1.3.5 1.7.1.1.1.2.1.3l-.2.8c0 .1-.1.2-.3.1-1-.5-1.6-1.9-1.6-3.1 0-2.5 1.8-4.8 5.3-4.8 2.8 0 4.9 2 4.9 4.6 0 2.8-1.7 5-4.1 5-.8 0-1.6-.4-1.8-.9l-.5 2c-.2.7-.7 1.5-1.1 2l-.9-.9Z"
              fill={iconColor}
            />
          </svg>
        );
      case "YouTube":
        return (
          <svg
            width={size}
            height={size}
            viewBox="0 0 24 24"
            fill="none"
            aria-hidden="true"
            className={className}
          >
            <rect
              x="2"
              y="4.8"
              width="20"
              height="14.4"
              rx="4.2"
              stroke={iconColor}
              strokeWidth="2"
            />
            <path d="M10 9.1L15.8 12 10 14.9V9.1Z" fill={iconColor} />
          </svg>
        );
      case "Threads":
        return (
          <svg
            width={size}
            height={size}
            viewBox="0 0 24 24"
            fill="none"
            aria-hidden="true"
            className={className}
          >
            <path
              d="M16.5 10.6c-.4-2.2-2-3.4-4.3-3.4-2.7 0-4.7 2-4.7 4.8 0 2.9 2 4.8 4.8 4.8 2.2 0 3.7-1 4.4-2.5m-1.7-2.4c-.3 1.4-1.3 2.3-2.6 2.3-1.2 0-2.1-.8-2.1-2s.9-2 2.2-2c1.5 0 2.5 1.1 2.5 2.7 0 2.2-1.2 3.8-3.2 4.3"
              stroke={iconColor}
              strokeWidth="2"
              strokeLinecap="round"
            />
            <circle cx="12" cy="12" r="9.5" stroke={iconColor} strokeWidth="1.8" />
          </svg>
        );
      case "Reddit":
        return (
          <svg
            width={size}
            height={size}
            viewBox="0 0 24 24"
            fill="none"
            aria-hidden="true"
            className={className}
          >
            <circle cx="12" cy="13.5" r="7" stroke={iconColor} strokeWidth="2" />
            <path d="M12 6.5l1.5-3.3 3.2.8" stroke={iconColor} strokeWidth="1.9" strokeLinecap="round" />
            <circle cx="9.6" cy="13" r="1" fill={iconColor} />
            <circle cx="14.4" cy="13" r="1" fill={iconColor} />
            <path d="M9.7 16c.7.6 1.5.9 2.3.9s1.6-.3 2.3-.9" stroke={iconColor} strokeWidth="1.8" strokeLinecap="round" />
          </svg>
        );
      case "Email":
        return (
          <svg
            width={size}
            height={size}
            viewBox="0 0 24 24"
            fill="none"
            aria-hidden="true"
            className={className}
          >
            <rect
              x="2.5"
              y="4.5"
              width="19"
              height="15"
              rx="3"
              stroke={iconColor}
              strokeWidth="2"
            />
            <path
              d="M3.5 6.5L12 13l8.5-6.5"
              stroke={iconColor}
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        );
      default:
        return (
          <svg
            width={size}
            height={size}
            viewBox="0 0 24 24"
            fill="none"
            aria-hidden="true"
            className={className}
          >
            <circle cx="18" cy="5" r="2.8" stroke={iconColor} strokeWidth="2" />
            <circle cx="6" cy="12" r="2.8" stroke={iconColor} strokeWidth="2" />
            <circle cx="18" cy="19" r="2.8" stroke={iconColor} strokeWidth="2" />
            <path
              d="M8.5 10.7l7-4.4m-7 7l7 4.4"
              stroke={iconColor}
              strokeWidth="2"
              strokeLinecap="round"
            />
          </svg>
        );
    }
  })();

  if (!withBadge) return glyph;

  return (
    <span
      className="inline-flex shrink-0 items-center justify-center rounded-xl shadow-xs"
      style={{
        width: size + 16,
        height: size + 16,
        background: meta.gradientCss || meta.color,
      }}
    >
      {glyph}
    </span>
  );
}
