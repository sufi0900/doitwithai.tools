export type ExtractedPageImage = {
  id: string;
  src: string;
  filename: string;
  alt: string;
  width: number;
  height: number;
  format: string;
  role: "Open Graph / Social" | "Article Content" | "Logo / Icon";
};

export const DEFAULT_IMAGE_EXTRACTOR_URL =
  "https://doitwithai.tools/prompts/keyword-research-prompts";

export const DEFAULT_EXTRACTED_IMAGES: ExtractedPageImage[] = [
  {
    id: "img-1",
    src: "https://doitwithai.tools/ogimage.png",
    filename: "01-ogimage.png",
    alt: "Do It With AI Tools — 100 Keyword Research Prompts Social Banner",
    width: 1600,
    height: 900,
    format: "PNG",
    role: "Open Graph / Social",
  },
  {
    id: "img-2",
    src: "https://doitwithai.tools/homepage-hero-screenshot.png",
    filename: "02-homepage-hero-screenshot.png",
    alt: "AI SEO and Content Workspace Preview",
    width: 1280,
    height: 720,
    format: "PNG",
    role: "Article Content",
  },
  {
    id: "img-3",
    src: "https://doitwithai.tools/logoForHeader.png",
    filename: "03-logoForHeader.png",
    alt: "Do It With AI Tools Official Logo",
    width: 434,
    height: 575,
    format: "PNG",
    role: "Logo / Icon",
  },
];

export function buildImageFilename(
  src: string,
  index: number,
  format: string,
): string {
  try {
    const u = new URL(src);
    const base =
      u.pathname
        .split("/")
        .filter(Boolean)
        .pop()
        ?.replace(/[^a-zA-Z0-9._-]/g, "-") || `image-${index + 1}`;
    const ext = format.toLowerCase();
    const hasExt = /\.(png|jpg|jpeg|webp|svg|gif|avif)$/i.test(base);
    const prefix = String(index + 1).padStart(2, "0");
    return hasExt ? `${prefix}-${base}` : `${prefix}-${base}.${ext}`;
  } catch {
    return `${String(index + 1).padStart(2, "0")}-image.${format.toLowerCase()}`;
  }
}
