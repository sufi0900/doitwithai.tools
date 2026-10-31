import React from "react";

export type PlatformBrandType =
  | "youtube"
  | "linkedin"
  | "facebook"
  | "instagram"
  | "tiktok"
  | "x-threads"
  | "pinterest"
  | "google-local"
  | "image-zip";

export function detectPlatformBrandBySlug(slug: string): PlatformBrandType | null {
  switch (slug) {
    case "youtube-transcript-generator":
    case "youtube-title-thumbnail-optimizer":
    case "video-transcript-to-blog":
    case "social-media-video-thumbnail-grabber":
      return "youtube";
    case "linkedin-post-formatter":
    case "linkedin-comment-generator":
      return "linkedin";
    case "facebook-post-generator":
      return "facebook";
    case "instagram-caption-generator":
      return "instagram";
    case "tiktok-script-caption-generator":
    case "short-form-video-script-generator":
      return "tiktok";
    case "social-thread-generator":
    case "og-twitter-preview-generator":
      return "x-threads";
    case "pinterest-pin-seo-generator":
      return "pinterest";
    case "google-review-link-generator":
    case "local-business-schema-generator":
    case "google-business-profile-auditor":
    case "nap-consistency-checker":
    case "google-review-response-generator":
    case "local-seo-service-page-planner":
      return "google-local";
    case "webpage-image-extractor":
      return "image-zip";
    default:
      return null;
  }
}

export function PlatformBrandIcon({
  slug,
  brand,
  size = 26,
}: {
  slug?: string;
  brand?: PlatformBrandType;
  size?: number;
}) {
  const resolved = brand || (slug ? detectPlatformBrandBySlug(slug) : null);
  if (!resolved) return null;

  if (resolved === "youtube") {
    return (
      <svg
        width={size}
        height={size}
        viewBox="0 0 32 32"
        fill="none"
        aria-hidden="true"
      >
        <rect x="2" y="6" width="28" height="20" rx="6" fill="#FF0000" />
        <path d="M13 11.5L21 16L13 20.5V11.5Z" fill="#FFFFFF" />
      </svg>
    );
  }

  if (resolved === "linkedin") {
    return (
      <svg
        width={size}
        height={size}
        viewBox="0 0 32 32"
        fill="none"
        aria-hidden="true"
      >
        <rect x="3" y="3" width="26" height="26" rx="6" fill="#0A66C2" />
        <circle cx="10.5" cy="10.5" r="2.1" fill="#FFFFFF" />
        <rect x="8.8" y="14" width="3.4" height="10" rx="1" fill="#FFFFFF" />
        <path
          d="M14.8 14H18V15.4C18.7 14.4 19.9 13.8 21.4 13.8C23.9 13.8 25.2 15.4 25.2 18.2V24H21.8V18.8C21.8 17.4 21.2 16.6 20 16.6C18.8 16.6 18.2 17.5 18.2 18.8V24H14.8V14Z"
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
        viewBox="0 0 32 32"
        fill="none"
        aria-hidden="true"
      >
        <rect x="3" y="3" width="26" height="26" rx="13" fill="#1877F2" />
        <path
          d="M18.4 29V18.8H21.8L22.3 14.8H18.4V12.3C18.4 11.1 18.8 10.3 20.4 10.3H22.5V6.7C22.1 6.6 20.9 6.5 19.4 6.5C16.3 6.5 14.2 8.4 14.2 11.9V14.8H10.8V18.8H14.2V29H18.4Z"
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
        viewBox="0 0 32 32"
        fill="none"
        aria-hidden="true"
      >
        <defs>
          <linearGradient id="igGrad" x1="3" y1="29" x2="29" y2="3" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#FD5949" />
            <stop offset="45%" stopColor="#D6249F" />
            <stop offset="100%" stopColor="#285AEB" />
          </linearGradient>
        </defs>
        <rect x="3" y="3" width="26" height="26" rx="7" fill="url(#igGrad)" />
        <rect
          x="7.5"
          y="7.5"
          width="17"
          height="17"
          rx="4.8"
          stroke="#FFFFFF"
          strokeWidth="2.2"
        />
        <circle cx="16" cy="16" r="3.8" stroke="#FFFFFF" strokeWidth="2.2" />
        <circle cx="21.3" cy="10.7" r="1.3" fill="#FFFFFF" />
      </svg>
    );
  }

  if (resolved === "tiktok") {
    return (
      <svg
        width={size}
        height={size}
        viewBox="0 0 32 32"
        fill="none"
        aria-hidden="true"
      >
        <rect x="3" y="3" width="26" height="26" rx="7" fill="#0F172A" />
        <path
          d="M19.5 8.5C20.2 10.5 21.7 11.8 23.8 12.1V15.1C22.2 15.1 20.8 14.6 19.6 13.7V19.6C19.6 22.7 17.1 25.1 14 25.1C10.9 25.1 8.5 22.7 8.5 19.6C8.5 16.5 10.9 14.1 14 14.1C14.4 14.1 14.8 14.1 15.1 14.2V17.4C14.8 17.3 14.4 17.2 14 17.2C12.7 17.2 11.6 18.3 11.6 19.6C11.6 20.9 12.7 22 14 22C15.3 22 16.5 20.9 16.5 19.6V8.5H19.5Z"
          fill="#25F4EE"
          transform="translate(-0.7, -0.5)"
        />
        <path
          d="M19.5 8.5C20.2 10.5 21.7 11.8 23.8 12.1V15.1C22.2 15.1 20.8 14.6 19.6 13.7V19.6C19.6 22.7 17.1 25.1 14 25.1C10.9 25.1 8.5 22.7 8.5 19.6C8.5 16.5 10.9 14.1 14 14.1C14.4 14.1 14.8 14.1 15.1 14.2V17.4C14.8 17.3 14.4 17.2 14 17.2C12.7 17.2 11.6 18.3 11.6 19.6C11.6 20.9 12.7 22 14 22C15.3 22 16.5 20.9 16.5 19.6V8.5H19.5Z"
          fill="#FE2C55"
          transform="translate(0.7, 0.5)"
        />
        <path
          d="M19.5 8.5C20.2 10.5 21.7 11.8 23.8 12.1V15.1C22.2 15.1 20.8 14.6 19.6 13.7V19.6C19.6 22.7 17.1 25.1 14 25.1C10.9 25.1 8.5 22.7 8.5 19.6C8.5 16.5 10.9 14.1 14 14.1C14.4 14.1 14.8 14.1 15.1 14.2V17.4C14.8 17.3 14.4 17.2 14 17.2C12.7 17.2 11.6 18.3 11.6 19.6C11.6 20.9 12.7 22 14 22C15.3 22 16.5 20.9 16.5 19.6V8.5H19.5Z"
          fill="#FFFFFF"
        />
      </svg>
    );
  }

  if (resolved === "x-threads") {
    return (
      <svg
        width={size}
        height={size}
        viewBox="0 0 32 32"
        fill="none"
        aria-hidden="true"
      >
        <rect x="3" y="3" width="26" height="26" rx="7" fill="#0F172A" />
        <path
          d="M18.1 14.4L24.2 7.5H22.7L17.5 13.5L13.3 7.5H8.5L14.9 16.6L8.5 23.8H10L15.5 17.5L19.9 23.8H24.7L18.1 14.4ZM16.1 16.7L15.4 15.7L10.5 8.7H12.7L16.8 14.5L17.5 15.5L22.7 22.7H20.5L16.1 16.7Z"
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
        viewBox="0 0 32 32"
        fill="none"
        aria-hidden="true"
      >
        <circle cx="16" cy="16" r="13" fill="#E60023" />
        <path
          d="M16.2 8.5C11.9 8.5 9.5 11.5 9.5 14.8C9.5 16.5 10.4 18.1 11.9 18.7C12.1 18.8 12.3 18.7 12.4 18.4L12.7 17.2C12.8 17 12.7 16.8 12.5 16.6C12 16 11.7 15.2 11.7 14.3C11.7 12.1 13.4 10.3 16.1 10.3C18.5 10.3 20.1 11.8 20.1 14.1C20.1 16.9 18.8 19.1 17 19.1C16 19.1 15.2 18.3 15.5 17.2L16.2 14.2C16.4 13.4 15.9 12.6 15 12.6C14 12.6 13.2 13.6 13.2 15C13.2 15.9 13.5 16.5 13.5 16.5L12.1 22.3C11.8 23.5 12 25 12.1 25.2C12.9 24.2 13.6 22.9 13.9 21.8L14.5 19.5C15 20.3 16 20.9 17.2 20.9C20.6 20.9 22.9 17.8 22.9 14C22.9 10.6 20 8.5 16.2 8.5Z"
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
        viewBox="0 0 32 32"
        fill="none"
        aria-hidden="true"
      >
        <path
          d="M16 3C10.5 3 6 7.5 6 13C6 20.2 16 29 16 29C16 29 26 20.2 26 13C26 7.5 21.5 3 16 3Z"
          fill="#EA4335"
        />
        <path
          d="M16 3C10.5 3 6 7.5 6 13C6 15.4 7.1 18.1 8.8 20.6L21.5 5C19.9 3.7 18 3 16 3Z"
          fill="#4285F4"
        />
        <path
          d="M26 13C26 10.1 24.8 7.5 22.8 5.7L10.3 22.4C13.2 26.1 16 29 16 29C16 29 26 20.2 26 13Z"
          fill="#34A853"
        />
        <circle cx="16" cy="13" r="4.5" fill="#FFFFFF" />
      </svg>
    );
  }

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      aria-hidden="true"
    >
      <rect x="3" y="5" width="26" height="22" rx="5" fill="#059669" />
      <circle cx="11" cy="12" r="2.5" fill="#A7F3D0" />
      <path
        d="M6 23L12.5 16.5L17 21L21 17L26 23H6Z"
        fill="#FFFFFF"
      />
    </svg>
  );
}

export default PlatformBrandIcon;
