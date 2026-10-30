import type { ImageProbeResult, OgIssue, OgState } from "./types";

export const RECOMMENDED_TITLE_MAX = 70;
export const RECOMMENDED_DESCRIPTION_MAX = 200;
export const RECOMMENDED_IMAGE_WIDTH = 1200;
export const RECOMMENDED_IMAGE_HEIGHT = 630;
export const MIN_IMAGE_WIDTH = 200;
export const MIN_IMAGE_HEIGHT = 200;
export const RECOMMENDED_MAX_IMAGE_BYTES = 5_000_000;

function escapeAttr(value: string) {
  return value.replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;");
}

export function defaultState(): OgState {
  return {
    pageUrl: "",
    siteName: "",
    title: "",
    description: "",
    imageUrl: "",
    twitterHandle: "",
    twitterCardType: "summary_large_image",
  };
}

export function buildMetaTags(state: OgState): string {
  const tags: string[] = [];
  const push = (property: string, content: string, attr: "property" | "name" = "property") => {
    if (!content.trim()) return;
    tags.push(`<meta ${attr}="${property}" content="${escapeAttr(content.trim())}" />`);
  };

  push("og:type", "website");
  push("og:title", state.title);
  push("og:description", state.description);
  push("og:url", state.pageUrl);
  push("og:site_name", state.siteName);
  push("og:image", state.imageUrl);

  push("twitter:card", state.twitterCardType, "name");
  push("twitter:title", state.title || state.pageUrl, "name");
  push("twitter:description", state.description, "name");
  push("twitter:image", state.imageUrl, "name");
  if (state.twitterHandle.trim()) {
    push("twitter:site", state.twitterHandle.trim().startsWith("@") ? state.twitterHandle.trim() : `@${state.twitterHandle.trim()}`, "name");
  }

  return tags.join("\n");
}

export function validateOgState(state: OgState, imageProbe: ImageProbeResult | null): OgIssue[] {
  const issues: OgIssue[] = [];

  if (!state.title.trim()) {
    issues.push({ level: "error", message: "Add a title ; og:title and twitter:title both depend on it." });
  } else if (state.title.trim().length > RECOMMENDED_TITLE_MAX) {
    issues.push({
      level: "warning",
      message: `Title is ${state.title.trim().length} characters. Most platforms truncate well before ${RECOMMENDED_TITLE_MAX}.`,
    });
  }

  if (!state.description.trim()) {
    issues.push({ level: "warning", message: "Add a description ; cards often look empty or pull random page text without one." });
  } else if (state.description.trim().length > RECOMMENDED_DESCRIPTION_MAX) {
    issues.push({
      level: "warning",
      message: `Description is ${state.description.trim().length} characters. Keep it under about ${RECOMMENDED_DESCRIPTION_MAX} to avoid truncation.`,
    });
  }

  if (!state.imageUrl.trim()) {
    issues.push({ level: "warning", message: "Add an image ; cards without one get far less engagement when shared." });
  } else if (!/^https?:\/\//i.test(state.imageUrl.trim())) {
    issues.push({ level: "error", message: "Image URL should be a full absolute URL (https://...), not a relative path." });
  }

  if (state.pageUrl.trim() && !/^https?:\/\//i.test(state.pageUrl.trim())) {
    issues.push({ level: "error", message: "Page URL should be a full absolute URL (https://...)." });
  }

  if (imageProbe) {
    if (imageProbe.width && imageProbe.height) {
      if (imageProbe.width < MIN_IMAGE_WIDTH || imageProbe.height < MIN_IMAGE_HEIGHT) {
        issues.push({
          level: "error",
          message: `Image is ${imageProbe.width}×${imageProbe.height}px ; below the ${MIN_IMAGE_WIDTH}×${MIN_IMAGE_HEIGHT}px minimum most platforms require to show a preview at all.`,
        });
      } else if (imageProbe.width < RECOMMENDED_IMAGE_WIDTH || imageProbe.height < RECOMMENDED_IMAGE_HEIGHT) {
        issues.push({
          level: "warning",
          message: `Image is ${imageProbe.width}×${imageProbe.height}px ; below the recommended ${RECOMMENDED_IMAGE_WIDTH}×${RECOMMENDED_IMAGE_HEIGHT}px, so it may look soft on high-density screens.`,
        });
      }
      const ratio = imageProbe.width / imageProbe.height;
      if (ratio < 1.6 && state.twitterCardType === "summary_large_image") {
        issues.push({
          level: "info",
          message: `Image aspect ratio is ${ratio.toFixed(2)}:1. summary_large_image looks best near 1.91:1 (e.g. 1200×630) ; a near-square image may get cropped.`,
        });
      }
    } else if (imageProbe.format === null) {
      issues.push({ level: "info", message: "Could not auto-detect this image's dimensions (unsupported format for inspection) ; verify manually." });
    }
    if (imageProbe.bytes && imageProbe.bytes > RECOMMENDED_MAX_IMAGE_BYTES) {
      issues.push({
        level: "warning",
        message: `Image is ${(imageProbe.bytes / 1_000_000).toFixed(1)}MB. Some crawlers skip or time out on images over 5MB.`,
      });
    }
  }

  if (!state.siteName.trim()) {
    issues.push({ level: "info", message: "og:site_name is optional but helps your brand show up next to the preview on some platforms." });
  }

  return issues;
}
