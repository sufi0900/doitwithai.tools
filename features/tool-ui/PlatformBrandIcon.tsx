import React from "react";

export type PlatformBrandType =
  | "youtube"
  | "linkedin"
  | "facebook"
  | "instagram"
  | "tiktok"
  | "x-threads"
  | "x"
  | "pinterest"
  | "google-local"
  | "image-zip"
  | "infographic"
  | "data-chart"
  | "matrix-diagram"
  | "quote-card"
  | "carousel-slides"
  | "audio-mp3"
  | "ai-search-aeo"
  | "keyword-cluster"
  | "technical-schema"
  | "backlink-pr"
  | "onpage-writer";

export function detectPlatformBrandBySlug(
  slug: string,
): PlatformBrandType | null {
  const s = String(slug || "").toLowerCase();
  if (!s) return null;

  // Social & Video Platforms
  if (
    s.includes("youtube") ||
    s === "video-transcript-to-blog" ||
    s === "social-media-video-thumbnail-grabber"
  ) {
    return "youtube";
  }
  if (s.includes("linkedin")) return "linkedin";
  if (s.includes("facebook")) return "facebook";
  if (s.includes("instagram")) return "instagram";
  if (s.includes("tiktok") || s.includes("short-form-video-script")) {
    return "tiktok";
  }
  if (
    s.includes("social-thread") ||
    s.includes("twitter") ||
    s === "x" ||
    s === "og-twitter-preview-generator"
  ) {
    return "x-threads";
  }
  if (s.includes("pinterest")) return "pinterest";

  // Visual & Design Studios
  if (s.includes("carousel")) return "carousel-slides";
  if (s.includes("infographic") || s.includes("cheatsheet")) {
    return "infographic";
  }
  if (s.includes("data-to-chart") || s.includes("chart")) return "data-chart";
  if (s.includes("matrix") || s.includes("diagram")) return "matrix-diagram";
  if (s.includes("quote-stat") || s.includes("testimonial")) {
    return "quote-card";
  }
  if (s.includes("image-extractor") || s.includes("image-alt")) {
    return "image-zip";
  }

  // Audio & Speech
  if (s.includes("mp3") || s.includes("audio") || s.includes("speech")) {
    return "audio-mp3";
  }

  // Local SEO & Google Business Profile
  if (
    s.includes("local-") ||
    s.includes("google-business") ||
    s.includes("google-review") ||
    s.includes("nap-")
  ) {
    return "google-local";
  }

  // AI Search, AEO, GEO & Citations
  if (
    s.includes("ai-citation") ||
    s.includes("llms-txt") ||
    s.includes("ai-brand") ||
    s.includes("entity-") ||
    s.includes("semantic-entity") ||
    s.includes("information-gain") ||
    s.includes("eeat")
  ) {
    return "ai-search-aeo";
  }

  // Keyword Research, Topic Clusters & Search Intent
  if (
    s.includes("keyword") ||
    s.includes("topical-map") ||
    s.includes("search-intent") ||
    s.includes("striking-distance") ||
    s.includes("cannibalization") ||
    s.includes("audience-research")
  ) {
    return "keyword-cluster";
  }

  // Technical SEO, Schema, Robots, Sitemaps & CWV
  if (
    s.includes("schema") ||
    s.includes("structured-data") ||
    s.includes("robots") ||
    s.includes("sitemap") ||
    s.includes("redirect") ||
    s.includes("hreflang") ||
    s.includes("core-web-vitals") ||
    s.includes("indexnow") ||
    s.includes("serp-") ||
    s.includes("slug")
  ) {
    return "technical-schema";
  }

  // Backlinks, Digital PR & Outreach
  if (
    s.includes("backlink") ||
    s.includes("broken-link") ||
    s.includes("brand-mention") ||
    s.includes("outreach") ||
    s.includes("journalist") ||
    s.includes("digital-pr") ||
    s.includes("anchor") ||
    s.includes("link-placement") ||
    s.includes("internal-link") ||
    s.includes("utm-")
  ) {
    return "backlink-pr";
  }

  // On-Page SEO, Content Writing, Meta Tags & Document Converters
  return "onpage-writer";
}

export function PlatformBrandIcon({
  slug,
  slugOrText,
  brand,
  platform,
  size = 32,
  className,
}: {
  slug?: string;
  slugOrText?: string;
  brand?: PlatformBrandType | string;
  platform?: PlatformBrandType | string;
  size?: number;
  className?: string;
}) {
  const key = slug || slugOrText || "";
  const rawBrand = brand || platform;
  const normalizedBrand: PlatformBrandType | null =
    rawBrand === "x"
      ? "x-threads"
      : (rawBrand as PlatformBrandType | undefined) || null;
  const resolved =
    (key ? detectPlatformBrandBySlug(key) : null) ||
    normalizedBrand ||
    "onpage-writer";
  if (!resolved) return null;

  // Common 3D SVG defs (inner top highlight + soft 3D base shadow)
  const uid = `ico-${resolved}`;

  if (resolved === "youtube") {
    return (
      <svg
        width={size}
        height={size}
        viewBox="0 0 36 36"
        fill="none"
        className={className}
        aria-hidden="true"
      >
        <defs>
          <linearGradient id={`${uid}-g`} x1="4" y1="4" x2="32" y2="32" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#FF3B3B" />
            <stop offset="55%" stopColor="#E60000" />
            <stop offset="100%" stopColor="#990000" />
          </linearGradient>
        </defs>
        {/* 3D Base Shadow Plate */}
        <rect x="3" y="8" width="30" height="22" rx="8" fill="#7F1D1D" />
        {/* 3D Main Glossy Tile */}
        <rect
          x="3"
          y="5"
          width="30"
          height="22"
          rx="8"
          fill={`url(#${uid}-g)`}
          stroke="#FCA5A5"
          strokeOpacity="0.45"
          strokeWidth="1.2"
        />
        {/* Top Specular Shine */}
        <path
          d="M7 7.5H29C30 7.5 31 8.5 31 9.5V12C24 14 12 14 5 12V9.5C5 8.5 6 7.5 7 7.5Z"
          fill="#FFFFFF"
          fillOpacity="0.18"
        />
        {/* 3D Play Triangle */}
        <path
          d="M14.5 11.2L23.8 16.5L14.5 21.8V11.2Z"
          fill="#7F1D1D"
          fillOpacity="0.45"
        />
        <path
          d="M14.5 10.5L23.8 15.8L14.5 21.1V10.5Z"
          fill="#FFFFFF"
        />
      </svg>
    );
  }

  if (resolved === "linkedin") {
    return (
      <svg
        width={size}
        height={size}
        viewBox="0 0 36 36"
        fill="none"
        className={className}
        aria-hidden="true"
      >
        <defs>
          <linearGradient id={`${uid}-g`} x1="4" y1="3" x2="32" y2="33" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#2589F5" />
            <stop offset="55%" stopColor="#0A66C2" />
            <stop offset="100%" stopColor="#004182" />
          </linearGradient>
        </defs>
        <rect x="4" y="6" width="28" height="27" rx="8" fill="#002952" />
        <rect
          x="4"
          y="3"
          width="28"
          height="27"
          rx="8"
          fill={`url(#${uid}-g)`}
          stroke="#93C5FD"
          strokeOpacity="0.5"
          strokeWidth="1.2"
        />
        <path
          d="M8 5H28C29.5 5 30.5 6 30.5 7.5V11C23 13 13 13 5.5 11V7.5C5.5 6 6.5 5 8 5Z"
          fill="#FFFFFF"
          fillOpacity="0.16"
        />
        <circle cx="11.8" cy="11.2" r="2.4" fill="#FFFFFF" />
        <rect x="9.9" y="15" width="3.8" height="10.5" rx="1.2" fill="#FFFFFF" />
        <path
          d="M16.2 15H19.8V16.6C20.6 15.5 21.9 14.8 23.6 14.8C26.4 14.8 27.8 16.6 27.8 19.7V25.5H24V20.1C24 18.6 23.3 17.8 22 17.8C20.6 17.8 20 18.8 20 20.1V25.5H16.2V15Z"
          fill="#FFFFFF"
        />
      </svg>
    );
  }

  if (resolved === "facebook") {
    return (
      <svg
        width={size}
        height={size}
        viewBox="0 0 36 36"
        fill="none"
        className={className}
        aria-hidden="true"
      >
        <defs>
          <linearGradient id={`${uid}-g`} x1="4" y1="3" x2="32" y2="33" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#3B82F6" />
            <stop offset="55%" stopColor="#1877F2" />
            <stop offset="100%" stopColor="#1D4ED8" />
          </linearGradient>
        </defs>
        <circle cx="18" cy="19.5" r="14" fill="#1E3A8A" />
        <circle
          cx="18"
          cy="17"
          r="14"
          fill={`url(#${uid}-g)`}
          stroke="#93C5FD"
          strokeOpacity="0.5"
          strokeWidth="1.2"
        />
        <path
          d="M20.4 30.5V20.2H24L24.6 15.8H20.4V13.1C20.4 11.8 20.8 10.9 22.6 10.9H24.8V7C24.3 6.9 23 6.8 21.4 6.8C18 6.8 15.8 8.9 15.8 12.7V15.8H12.2V20.2H15.8V30.5H20.4Z"
          fill="#FFFFFF"
        />
      </svg>
    );
  }

  if (resolved === "instagram") {
    return (
      <svg
        width={size}
        height={size}
        viewBox="0 0 36 36"
        fill="none"
        className={className}
        aria-hidden="true"
      >
        <defs>
          <linearGradient id={`${uid}-g`} x1="4" y1="32" x2="32" y2="4" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#F59E0B" />
            <stop offset="35%" stopColor="#EF4444" />
            <stop offset="70%" stopColor="#D946EF" />
            <stop offset="100%" stopColor="#4F46E5" />
          </linearGradient>
        </defs>
        <rect x="4" y="6" width="28" height="27" rx="8.5" fill="#4A044E" />
        <rect
          x="4"
          y="3"
          width="28"
          height="27"
          rx="8.5"
          fill={`url(#${uid}-g)`}
          stroke="#FBCFE8"
          strokeOpacity="0.55"
          strokeWidth="1.2"
        />
        <rect
          x="9"
          y="8"
          width="18"
          height="17"
          rx="5.2"
          stroke="#FFFFFF"
          strokeWidth="2.4"
        />
        <circle cx="18" cy="16.5" r="4" stroke="#FFFFFF" strokeWidth="2.4" />
        <circle cx="23.4" cy="11.2" r="1.4" fill="#FFFFFF" />
      </svg>
    );
  }

  if (resolved === "tiktok") {
    return (
      <svg
        width={size}
        height={size}
        viewBox="0 0 36 36"
        fill="none"
        className={className}
        aria-hidden="true"
      >
        <rect x="4" y="6" width="28" height="27" rx="8.5" fill="#020617" />
        <rect
          x="4"
          y="3"
          width="28"
          height="27"
          rx="8.5"
          fill="#0F172A"
          stroke="#38BDF8"
          strokeOpacity="0.5"
          strokeWidth="1.3"
        />
        <path
          d="M21 8.5C21.8 10.7 23.4 12.1 25.6 12.4V15.6C23.9 15.6 22.4 15.1 21.1 14.1V20.4C21.1 23.7 18.5 26.2 15.2 26.2C11.9 26.2 9.4 23.7 9.4 20.4C9.4 17.1 11.9 14.6 15.2 14.6C15.6 14.6 16 14.6 16.4 14.7V18.1C16 18 15.6 17.9 15.2 17.9C13.8 17.9 12.7 19 12.7 20.4C12.7 21.8 13.8 22.9 15.2 22.9C16.6 22.9 17.8 21.8 17.8 20.4V8.5H21Z"
          fill="#25F4EE"
          transform="translate(-1, -0.7)"
        />
        <path
          d="M21 8.5C21.8 10.7 23.4 12.1 25.6 12.4V15.6C23.9 15.6 22.4 15.1 21.1 14.1V20.4C21.1 23.7 18.5 26.2 15.2 26.2C11.9 26.2 9.4 23.7 9.4 20.4C9.4 17.1 11.9 14.6 15.2 14.6C15.6 14.6 16 14.6 16.4 14.7V18.1C16 18 15.6 17.9 15.2 17.9C13.8 17.9 12.7 19 12.7 20.4C12.7 21.8 13.8 22.9 15.2 22.9C16.6 22.9 17.8 21.8 17.8 20.4V8.5H21Z"
          fill="#FE2C55"
          transform="translate(1, 0.7)"
        />
        <path
          d="M21 8.5C21.8 10.7 23.4 12.1 25.6 12.4V15.6C23.9 15.6 22.4 15.1 21.1 14.1V20.4C21.1 23.7 18.5 26.2 15.2 26.2C11.9 26.2 9.4 23.7 9.4 20.4C9.4 17.1 11.9 14.6 15.2 14.6C15.6 14.6 16 14.6 16.4 14.7V18.1C16 18 15.6 17.9 15.2 17.9C13.8 17.9 12.7 19 12.7 20.4C12.7 21.8 13.8 22.9 15.2 22.9C16.6 22.9 17.8 21.8 17.8 20.4V8.5H21Z"
          fill="#FFFFFF"
        />
      </svg>
    );
  }

  if (resolved === "x-threads" || resolved === "x") {
    return (
      <svg
        width={size}
        height={size}
        viewBox="0 0 36 36"
        fill="none"
        className={className}
        aria-hidden="true"
      >
        <rect x="4" y="6" width="28" height="27" rx="8" fill="#020617" />
        <rect
          x="4"
          y="3"
          width="28"
          height="27"
          rx="8"
          fill="#1E293B"
          stroke="#94A3B8"
          strokeOpacity="0.45"
          strokeWidth="1.2"
        />
        <path
          d="M19.8 15.2L26.2 7.8H24.6L19.1 14.2L14.7 7.8H9.5L16.3 17.5L9.5 25.2H11.1L17 18.4L21.7 25.2H26.9L19.8 15.2ZM17.6 17.6L16.9 16.6L11.7 9.1H14.1L18.4 15.3L19.1 16.3L24.6 24H22.2L17.6 17.6Z"
          fill="#FFFFFF"
        />
      </svg>
    );
  }

  if (resolved === "pinterest") {
    return (
      <svg
        width={size}
        height={size}
        viewBox="0 0 36 36"
        fill="none"
        className={className}
        aria-hidden="true"
      >
        <circle cx="18" cy="19.5" r="14" fill="#881337" />
        <circle
          cx="18"
          cy="17"
          r="14"
          fill="#E60023"
          stroke="#FDA4AF"
          strokeOpacity="0.55"
          strokeWidth="1.2"
        />
        <path
          d="M18.2 9C13.6 9 11 12.2 11 15.8C11 17.6 12 19.3 13.6 20C13.8 20.1 14 20 14.1 19.7L14.4 18.4C14.5 18.2 14.4 18 14.2 17.7C13.7 17.1 13.4 16.2 13.4 15.2C13.4 12.9 15.2 11 18.1 11C20.7 11 22.4 12.6 22.4 15.1C22.4 18.1 21 20.4 19.1 20.4C18 20.4 17.2 19.5 17.5 18.4L18.2 15.1C18.4 14.3 17.9 13.4 16.9 13.4C15.8 13.4 15 14.5 15 16C15 17 15.3 17.6 15.3 17.6L13.8 23.8C13.5 25.1 13.7 26.7 13.8 26.9C14.7 25.8 15.4 24.4 15.7 23.2L16.4 20.8C16.9 21.7 18 22.3 19.3 22.3C22.9 22.3 25.4 19 25.4 14.9C25.4 11.3 22.3 9 18.2 9Z"
          fill="#FFFFFF"
        />
      </svg>
    );
  }

  if (resolved === "google-local") {
    return (
      <svg
        width={size}
        height={size}
        viewBox="0 0 36 36"
        fill="none"
        className={className}
        aria-hidden="true"
      >
        <rect x="4" y="6" width="28" height="27" rx="8" fill="#064E3B" />
        <rect
          x="4"
          y="3"
          width="28"
          height="27"
          rx="8"
          fill="#0F172A"
          stroke="#34D399"
          strokeOpacity="0.5"
          strokeWidth="1.2"
        />
        <path
          d="M18 6.5C13.3 6.5 9.5 10.3 9.5 15C9.5 21.1 18 27.8 18 27.8C18 27.8 26.5 21.1 26.5 15C26.5 10.3 22.7 6.5 18 6.5Z"
          fill="#EA4335"
        />
        <path
          d="M18 6.5C13.3 6.5 9.5 10.3 9.5 15C9.5 17 10.4 19.3 11.9 21.4L22.7 8.2C21.3 7.1 19.7 6.5 18 6.5Z"
          fill="#4285F4"
        />
        <path
          d="M26.5 15C26.5 12.5 25.5 10.3 23.8 8.8L13.1 23C15.6 26.1 18 27.8 18 27.8C18 27.8 26.5 21.1 26.5 15Z"
          fill="#34A853"
        />
        <circle cx="18" cy="15" r="4" fill="#FFFFFF" />
      </svg>
    );
  }

  if (resolved === "infographic") {
    return (
      <svg
        width={size}
        height={size}
        viewBox="0 0 36 36"
        fill="none"
        className={className}
        aria-hidden="true"
      >
        <defs>
          <linearGradient id={`${uid}-g`} x1="4" y1="3" x2="32" y2="32" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#8094ff" />
            <stop offset="55%" stopColor="#4058d0" />
            <stop offset="100%" stopColor="#C2410C" />
          </linearGradient>
        </defs>
        <rect x="5" y="6" width="26" height="27" rx="7" fill="#7C2D12" />
        <rect
          x="5"
          y="3"
          width="26"
          height="27"
          rx="7"
          fill={`url(#${uid}-g)`}
          stroke="#FED7AA"
          strokeOpacity="0.6"
          strokeWidth="1.2"
        />
        <rect x="9" y="7.5" width="18" height="3.8" rx="1.8" fill="#FFFFFF" />
        <circle cx="11.8" cy="15.8" r="2.6" fill="#FFFFFF" />
        <rect x="16" y="14.2" width="11" height="3.2" rx="1.5" fill="#FFEDD5" />
        <circle cx="24.2" cy="22.5" r="2.6" fill="#FFFFFF" />
        <rect x="9" y="21" width="11" height="3.2" rx="1.5" fill="#FFEDD5" />
      </svg>
    );
  }

  if (resolved === "carousel-slides") {
    return (
      <svg
        width={size}
        height={size}
        viewBox="0 0 36 36"
        fill="none"
        className={className}
        aria-hidden="true"
      >
        <defs>
          <linearGradient id={`${uid}-g`} x1="4" y1="4" x2="32" y2="32" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#EC4899" />
            <stop offset="55%" stopColor="#8B5CF6" />
            <stop offset="100%" stopColor="#4F46E5" />
          </linearGradient>
        </defs>
        <rect x="4" y="6" width="28" height="27" rx="8" fill="#311042" />
        <rect
          x="4"
          y="3"
          width="28"
          height="27"
          rx="8"
          fill={`url(#${uid}-g)`}
          stroke="#F5D0FE"
          strokeOpacity="0.55"
          strokeWidth="1.2"
        />
        {/* 3D Layered Slide Cards */}
        <rect x="13" y="9" width="14" height="16" rx="3" fill="#FFFFFF" fillOpacity="0.35" />
        <rect x="9" y="7.5" width="14" height="16" rx="3" fill="#FFFFFF" />
        <rect x="11.5" y="11" width="9" height="2.4" rx="1" fill="#6D28D9" />
        <rect x="11.5" y="15" width="6.5" height="2" rx="1" fill="#EC4899" />
      </svg>
    );
  }

  if (resolved === "data-chart") {
    return (
      <svg
        width={size}
        height={size}
        viewBox="0 0 36 36"
        fill="none"
        className={className}
        aria-hidden="true"
      >
        <defs>
          <linearGradient id={`${uid}-g`} x1="4" y1="3" x2="32" y2="32" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#60A5FA" />
            <stop offset="55%" stopColor="#3452D1" />
            <stop offset="100%" stopColor="#1E3A8A" />
          </linearGradient>
        </defs>
        <rect x="4" y="6" width="28" height="27" rx="8" fill="#172554" />
        <rect
          x="4"
          y="3"
          width="28"
          height="27"
          rx="8"
          fill={`url(#${uid}-g)`}
          stroke="#BFDBFE"
          strokeOpacity="0.55"
          strokeWidth="1.2"
        />
        <rect x="9.5" y="17" width="4.2" height="9" rx="1.5" fill="#93C5FD" />
        <rect x="15.9" y="12" width="4.2" height="14" rx="1.5" fill="#FFFFFF" />
        <rect x="22.3" y="8" width="4.2" height="18" rx="1.5" fill="#34D399" />
      </svg>
    );
  }

  if (resolved === "matrix-diagram") {
    return (
      <svg
        width={size}
        height={size}
        viewBox="0 0 36 36"
        fill="none"
        className={className}
        aria-hidden="true"
      >
        <defs>
          <linearGradient id={`${uid}-g`} x1="4" y1="3" x2="32" y2="32" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#A855F7" />
            <stop offset="55%" stopColor="#7C3AED" />
            <stop offset="100%" stopColor="#4C1D95" />
          </linearGradient>
        </defs>
        <rect x="4" y="6" width="28" height="27" rx="8" fill="#2E1065" />
        <rect
          x="4"
          y="3"
          width="28"
          height="27"
          rx="8"
          fill={`url(#${uid}-g)`}
          stroke="#E9D5FF"
          strokeOpacity="0.55"
          strokeWidth="1.2"
        />
        <rect x="8.5" y="7.5" width="8.2" height="8.2" rx="2.4" fill="#FFFFFF" />
        <rect x="19.3" y="7.5" width="8.2" height="8.2" rx="2.4" fill="#34D399" />
        <rect x="8.5" y="18.2" width="8.2" height="8.2" rx="2.4" fill="#DDD6FE" />
        <rect x="19.3" y="18.2" width="8.2" height="8.2" rx="2.4" fill="#FBBF24" />
      </svg>
    );
  }

  if (resolved === "quote-card") {
    return (
      <svg
        width={size}
        height={size}
        viewBox="0 0 36 36"
        fill="none"
        className={className}
        aria-hidden="true"
      >
        <rect x="4" y="6" width="28" height="27" rx="8" fill="#020617" />
        <rect
          x="4"
          y="3"
          width="28"
          height="27"
          rx="8"
          fill="#0F172A"
          stroke="#F59E0B"
          strokeOpacity="0.55"
          strokeWidth="1.2"
        />
        <path
          d="M10.5 16.5C10.5 13.2 12.6 11.1 15.8 10.6V13.2C14 13.6 13.3 14.6 13.3 16H15.8V21.2H10.5V16.5ZM19.5 16.5C19.5 13.2 21.6 11.1 24.8 10.6V13.2C23 13.6 22.3 14.6 22.3 16H24.8V21.2H19.5V16.5Z"
          fill="#4058d0"
        />
      </svg>
    );
  }

  if (resolved === "audio-mp3") {
    return (
      <svg
        width={size}
        height={size}
        viewBox="0 0 36 36"
        fill="none"
        className={className}
        aria-hidden="true"
      >
        <defs>
          <linearGradient id={`${uid}-g`} x1="4" y1="3" x2="32" y2="32" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#06B6D4" />
            <stop offset="55%" stopColor="#2563EB" />
            <stop offset="100%" stopColor="#1E1B4B" />
          </linearGradient>
        </defs>
        <rect x="4" y="6" width="28" height="27" rx="8" fill="#0F172A" />
        <rect
          x="4"
          y="3"
          width="28"
          height="27"
          rx="8"
          fill={`url(#${uid}-g)`}
          stroke="#A5F3FC"
          strokeOpacity="0.55"
          strokeWidth="1.2"
        />
        <rect x="9" y="14" width="2.8" height="6" rx="1.4" fill="#A5F3FC" />
        <rect x="13.5" y="10" width="2.8" height="14" rx="1.4" fill="#FFFFFF" />
        <rect x="18" y="7.5" width="2.8" height="19" rx="1.4" fill="#FBBF24" />
        <rect x="22.5" y="11.5" width="2.8" height="11" rx="1.4" fill="#FFFFFF" />
        <rect x="27" y="14.5" width="2.4" height="5" rx="1.2" fill="#A5F3FC" />
      </svg>
    );
  }

  if (resolved === "ai-search-aeo") {
    return (
      <svg
        width={size}
        height={size}
        viewBox="0 0 36 36"
        fill="none"
        className={className}
        aria-hidden="true"
      >
        <defs>
          <linearGradient id={`${uid}-g`} x1="4" y1="3" x2="32" y2="32" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#818CF8" />
            <stop offset="50%" stopColor="#4F46E5" />
            <stop offset="100%" stopColor="#1E1B4B" />
          </linearGradient>
        </defs>
        <rect x="4" y="6" width="28" height="27" rx="8" fill="#1E1B4B" />
        <rect
          x="4"
          y="3"
          width="28"
          height="27"
          rx="8"
          fill={`url(#${uid}-g)`}
          stroke="#C7D2FE"
          strokeOpacity="0.6"
          strokeWidth="1.2"
        />
        <path
          d="M18 7.5L20.3 13.8L26.5 16.1L20.3 18.4L18 24.7L15.7 18.4L9.5 16.1L15.7 13.8L18 7.5Z"
          fill="#FFFFFF"
        />
        <circle cx="25.5" cy="9.5" r="2" fill="#FBBF24" />
      </svg>
    );
  }

  if (resolved === "keyword-cluster") {
    return (
      <svg
        width={size}
        height={size}
        viewBox="0 0 36 36"
        fill="none"
        className={className}
        aria-hidden="true"
      >
        <defs>
          <linearGradient id={`${uid}-g`} x1="4" y1="3" x2="32" y2="32" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#34D399" />
            <stop offset="55%" stopColor="#059669" />
            <stop offset="100%" stopColor="#064E3B" />
          </linearGradient>
        </defs>
        <rect x="4" y="6" width="28" height="27" rx="8" fill="#022C22" />
        <rect
          x="4"
          y="3"
          width="28"
          height="27"
          rx="8"
          fill={`url(#${uid}-g)`}
          stroke="#A7F3D0"
          strokeOpacity="0.55"
          strokeWidth="1.2"
        />
        <line x1="18" y1="16" x2="11" y2="10.5" stroke="#FFFFFF" strokeWidth="2.2" />
        <line x1="18" y1="16" x2="25" y2="10.5" stroke="#FFFFFF" strokeWidth="2.2" />
        <line x1="18" y1="16" x2="18" y2="24" stroke="#FFFFFF" strokeWidth="2.2" />
        <circle cx="18" cy="16" r="4.2" fill="#FFFFFF" />
        <circle cx="11" cy="10.5" r="2.8" fill="#FDE68A" />
        <circle cx="25" cy="10.5" r="2.8" fill="#FDE68A" />
        <circle cx="18" cy="24" r="2.8" fill="#FDE68A" />
      </svg>
    );
  }

  if (resolved === "technical-schema") {
    return (
      <svg
        width={size}
        height={size}
        viewBox="0 0 36 36"
        fill="none"
        className={className}
        aria-hidden="true"
      >
        <defs>
          <linearGradient id={`${uid}-g`} x1="4" y1="3" x2="32" y2="32" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#38BDF8" />
            <stop offset="55%" stopColor="#0284C7" />
            <stop offset="100%" stopColor="#0F172A" />
          </linearGradient>
        </defs>
        <rect x="4" y="6" width="28" height="27" rx="8" fill="#082F49" />
        <rect
          x="4"
          y="3"
          width="28"
          height="27"
          rx="8"
          fill={`url(#${uid}-g)`}
          stroke="#BAE6FD"
          strokeOpacity="0.55"
          strokeWidth="1.2"
        />
        <path
          d="M14 11.5L9.5 16.5L14 21.5M22 11.5L26.5 16.5L22 21.5M19.5 10L16.5 23"
          stroke="#FFFFFF"
          strokeWidth="2.4"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    );
  }

  if (resolved === "backlink-pr") {
    return (
      <svg
        width={size}
        height={size}
        viewBox="0 0 36 36"
        fill="none"
        className={className}
        aria-hidden="true"
      >
        <defs>
          <linearGradient id={`${uid}-g`} x1="4" y1="3" x2="32" y2="32" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#FB7185" />
            <stop offset="55%" stopColor="#E11D48" />
            <stop offset="100%" stopColor="#881337" />
          </linearGradient>
        </defs>
        <rect x="4" y="6" width="28" height="27" rx="8" fill="#4C0519" />
        <rect
          x="4"
          y="3"
          width="28"
          height="27"
          rx="8"
          fill={`url(#${uid}-g)`}
          stroke="#FECDD3"
          strokeOpacity="0.55"
          strokeWidth="1.2"
        />
        <path
          d="M15 19.5L21 13.5M13.5 15L11.5 17C9.8 18.7 9.8 21.4 11.5 23.1C13.2 24.8 15.9 24.8 17.6 23.1L19.5 21.2M16.5 11.8L18.4 9.9C20.1 8.2 22.8 8.2 24.5 9.9C26.2 11.6 26.2 14.3 24.5 16L22.5 18"
          stroke="#FFFFFF"
          strokeWidth="2.5"
          strokeLinecap="round"
        />
      </svg>
    );
  }

  if (resolved === "image-zip") {
    return (
      <svg
        width={size}
        height={size}
        viewBox="0 0 36 36"
        fill="none"
        className={className}
        aria-hidden="true"
      >
        <defs>
          <linearGradient id={`${uid}-g`} x1="4" y1="3" x2="32" y2="32" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#34D399" />
            <stop offset="55%" stopColor="#0D9488" />
            <stop offset="100%" stopColor="#115E59" />
          </linearGradient>
        </defs>
        <rect x="4" y="6" width="28" height="27" rx="8" fill="#042F2E" />
        <rect
          x="4"
          y="3"
          width="28"
          height="27"
          rx="8"
          fill={`url(#${uid}-g)`}
          stroke="#99F6E4"
          strokeOpacity="0.55"
          strokeWidth="1.2"
        />
        <circle cx="13" cy="12" r="2.6" fill="#FDE68A" />
        <path d="M8.5 24L14.5 17L19 21.5L23 17.5L27.5 24H8.5Z" fill="#FFFFFF" />
      </svg>
    );
  }

  // Default: On-Page SEO & Editorial Content Studio 3D Tile
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 36 36"
      fill="none"
      className={className}
      aria-hidden="true"
    >
      <defs>
        <linearGradient id={`${uid}-g`} x1="4" y1="3" x2="32" y2="32" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#6366F1" />
          <stop offset="55%" stopColor="#3452D1" />
          <stop offset="100%" stopColor="#1E3A8A" />
        </linearGradient>
      </defs>
      <rect x="4" y="6" width="28" height="27" rx="8" fill="#172554" />
      <rect
        x="4"
        y="3"
        width="28"
        height="27"
        rx="8"
        fill={`url(#${uid}-g)`}
        stroke="#C7D2FE"
        strokeOpacity="0.55"
        strokeWidth="1.2"
      />
      <rect x="10" y="9.5" width="16" height="3" rx="1.5" fill="#FFFFFF" />
      <rect x="10" y="15" width="12" height="2.6" rx="1.3" fill="#E0E7FF" />
      <rect x="10" y="20" width="14" height="2.6" rx="1.3" fill="#E0E7FF" />
      <circle cx="25.5" cy="19.5" r="3" fill="#4058d0" />
    </svg>
  );
}

export default PlatformBrandIcon;
