export type SharedVisualThemeId =
  | "midnight-orange"
  | "royal-cobalt"
  | "emerald-authority"
  | "canva-light"
  | "cyber-violet"
  | "crimson-obsidian"
  | "warm-terracotta"
  | "mckinsey-white"
  | "forest-gold"
  | "arctic-sky"
  | "custom-brand";

export type StudioColorThemeId =
  SharedVisualThemeId | "crimson-pinterest" | "midnight-executive";

export interface SharedVisualTheme {
  id: StudioColorThemeId;
  label: string;
  bgStart: string;
  bgEnd: string;
  cardBg: string;
  cardBorder: string;
  accent: string;
  accentSecondary: string;
  accentTertiary: string;
  textMain: string;
  textMuted: string;
  textSub: string;
  isLight: boolean;
}

export type StudioColorTheme = SharedVisualTheme;

export interface CustomStudioColorOverrides {
  bgStart?: string;
  bgEnd?: string;
  cardBg?: string;
  cardBorder?: string;
  accent?: string;
  accentSecondary?: string;
  accentTertiary?: string;
  textMain?: string;
  textSub?: string;
}

export const SHARED_VISUAL_THEMES: Record<
  Exclude<SharedVisualThemeId, "custom-brand">,
  SharedVisualTheme
> = {
  "midnight-orange": {
    id: "midnight-orange",
    label: "Midnight & Electric Orange",
    bgStart: "#0B1120",
    bgEnd: "#1E293B",
    cardBg: "rgba(30, 41, 59, 0.92)",
    cardBorder: "rgba(82, 113, 255, 0.45)",
    accent: "#4058d0",
    accentSecondary: "#38BDF8",
    accentTertiary: "#10B981",
    textMain: "#FFFFFF",
    textMuted: "#CBD5E1",
    textSub: "#CBD5E1",
    isLight: false,
  },
  "royal-cobalt": {
    id: "royal-cobalt",
    label: "DIWAT Blue & Paper",
    bgStart: "#f6f7ff",
    bgEnd: "#eef1ff",
    cardBg: "#ffffff",
    cardBorder: "#c8d2ff",
    accent: "#5271ff",
    accentSecondary: "#8094ff",
    accentTertiary: "#34D399",
    textMain: "#18234b",
    textMuted: "#475569",
    textSub: "#475569",
    isLight: true,
  },
  "emerald-authority": {
    id: "emerald-authority",
    label: "Emerald Authority & Mint",
    bgStart: "#042F2E",
    bgEnd: "#0F172A",
    cardBg: "rgba(15, 39, 39, 0.92)",
    cardBorder: "rgba(16, 185, 129, 0.45)",
    accent: "#10B981",
    accentSecondary: "#FBBF24",
    accentTertiary: "#38BDF8",
    textMain: "#F8FAFC",
    textMuted: "#A7F3D0",
    textSub: "#A7F3D0",
    isLight: false,
  },
  "canva-light": {
    id: "canva-light",
    label: "Canva Daylight & Indigo",
    bgStart: "#F8FAFC",
    bgEnd: "#EEF2FF",
    cardBg: "#FFFFFF",
    cardBorder: "#CBD5E1",
    accent: "#4F46E5",
    accentSecondary: "#EC4899",
    accentTertiary: "#0EA5E9",
    textMain: "#0F172A",
    textMuted: "#475569",
    textSub: "#475569",
    isLight: true,
  },
  "cyber-violet": {
    id: "cyber-violet",
    label: "SaaS Violet & Neon Pink",
    bgStart: "#130924",
    bgEnd: "#2E1065",
    cardBg: "rgba(36, 16, 66, 0.92)",
    cardBorder: "rgba(232, 121, 249, 0.45)",
    accent: "#E879F9",
    accentSecondary: "#38BDF8",
    accentTertiary: "#F59E0B",
    textMain: "#FFFFFF",
    textMuted: "#E9D5FF",
    textSub: "#E9D5FF",
    isLight: false,
  },
  "crimson-obsidian": {
    id: "crimson-obsidian",
    label: "Obsidian & Crimson Rose",
    bgStart: "#18181B",
    bgEnd: "#27272A",
    cardBg: "rgba(39, 39, 46, 0.94)",
    cardBorder: "rgba(244, 63, 94, 0.48)",
    accent: "#F43F5E",
    accentSecondary: "#FB923C",
    accentTertiary: "#38BDF8",
    textMain: "#FAFAFA",
    textMuted: "#D4D4D8",
    textSub: "#D4D4D8",
    isLight: false,
  },
  "warm-terracotta": {
    id: "warm-terracotta",
    label: "Warm Editorial Cream & Terracotta",
    bgStart: "#FFFBEB",
    bgEnd: "#FEF3C7",
    cardBg: "#FFFFFF",
    cardBorder: "#F59E0B",
    accent: "#EA580C",
    accentSecondary: "#0D9488",
    accentTertiary: "#4F46E5",
    textMain: "#1C1917",
    textMuted: "#57534E",
    textSub: "#57534E",
    isLight: true,
  },
  "mckinsey-white": {
    id: "mckinsey-white",
    label: "Boardroom White & Deep Navy",
    bgStart: "#FFFFFF",
    bgEnd: "#F1F5F9",
    cardBg: "#F8FAFC",
    cardBorder: "#94A3B8",
    accent: "#0284C7",
    accentSecondary: "#0F172A",
    accentTertiary: "#0D9488",
    textMain: "#0F172A",
    textMuted: "#334155",
    textSub: "#334155",
    isLight: true,
  },
  "forest-gold": {
    id: "forest-gold",
    label: "Deep Forest & Luxury Gold",
    bgStart: "#0C1F17",
    bgEnd: "#143326",
    cardBg: "rgba(25, 61, 46, 0.94)",
    cardBorder: "rgba(251, 191, 36, 0.45)",
    accent: "#FBBF24",
    accentSecondary: "#34D399",
    accentTertiary: "#38BDF8",
    textMain: "#FEFCE8",
    textMuted: "#D9F99D",
    textSub: "#D9F99D",
    isLight: false,
  },
  "arctic-sky": {
    id: "arctic-sky",
    label: "Arctic Mint & Sky Daylight",
    bgStart: "#F0FDF4",
    bgEnd: "#E0F2FE",
    cardBg: "#FFFFFF",
    cardBorder: "#38BDF8",
    accent: "#0284C7",
    accentSecondary: "#059669",
    accentTertiary: "#6366F1",
    textMain: "#0F172A",
    textMuted: "#334155",
    textSub: "#334155",
    isLight: true,
  },
};

export const STUDIO_COLOR_THEMES: StudioColorTheme[] = [
  {
    id: "crimson-pinterest",
    label: "Pinterest Crimson",
    bgStart: "#18060C",
    bgEnd: "#3B0A18",
    cardBg: "rgba(30, 12, 22, 0.94)",
    cardBorder: "rgba(230, 0, 35, 0.55)",
    accent: "#E60023",
    accentSecondary: "#4058d0",
    accentTertiary: "#F59E0B",
    textMain: "#FFFFFF",
    textMuted: "#FFE4E6",
    textSub: "#FFE4E6",
    isLight: false,
  },
  {
    id: "midnight-executive",
    label: "Midnight Executive",
    bgStart: "#090D16",
    bgEnd: "#161F33",
    cardBg: "rgba(24, 34, 56, 0.94)",
    cardBorder: "rgba(148, 163, 184, 0.32)",
    accent: "#4058d0",
    accentSecondary: "#3452D1",
    accentTertiary: "#10B981",
    textMain: "#FFFFFF",
    textMuted: "#CBD5E1",
    textSub: "#CBD5E1",
    isLight: false,
  },
  ...Object.values(SHARED_VISUAL_THEMES),
];

export function resolveVisualTheme(
  themeId: SharedVisualThemeId,
  custom: { bgStart: string; cardBg: string; accent: string; textMain: string },
): SharedVisualTheme {
  if (themeId === "custom-brand") {
    const isLight = custom.textMain.toLowerCase() !== "#ffffff";
    return {
      id: "custom-brand",
      label: "Custom Brand Palette",
      bgStart: custom.bgStart,
      bgEnd: custom.bgStart,
      cardBg: custom.cardBg,
      cardBorder: custom.accent,
      accent: custom.accent,
      accentSecondary: custom.accent,
      accentTertiary: "#10B981",
      textMain: custom.textMain,
      textMuted: isLight ? "#475569" : "#CBD5E1",
      textSub: isLight ? "#475569" : "#CBD5E1",
      isLight,
    };
  }
  return (
    SHARED_VISUAL_THEMES[themeId] || SHARED_VISUAL_THEMES["midnight-orange"]
  );
}

export function resolveStudioTheme(
  themeId: StudioColorThemeId | string,
  overrides: CustomStudioColorOverrides = {},
): StudioColorTheme {
  const base =
    STUDIO_COLOR_THEMES.find((t) => t.id === themeId) || STUDIO_COLOR_THEMES[0];
  return {
    ...base,
    bgStart: overrides.bgStart || base.bgStart,
    bgEnd: overrides.bgEnd || overrides.bgStart || base.bgEnd,
    cardBg: overrides.cardBg || base.cardBg,
    cardBorder: overrides.cardBorder || overrides.accent || base.cardBorder,
    accent: overrides.accent || base.accent,
    accentSecondary: overrides.accentSecondary || base.accentSecondary,
    accentTertiary: overrides.accentTertiary || base.accentTertiary,
    textMain: overrides.textMain || base.textMain,
    textMuted: overrides.textSub || base.textMuted,
    textSub: overrides.textSub || base.textSub,
  };
}

export function downloadCanvasAsPng(
  canvas: HTMLCanvasElement | null,
  filename: string,
  onDone?: () => void,
) {
  if (!canvas) return;
  const a = document.createElement("a");
  a.download = filename.endsWith(".png") ? filename : `${filename}.png`;
  a.href = canvas.toDataURL("image/png");
  a.click();
  if (onDone) onDone();
}

export function downloadCanvasAsEmbeddedSvg(
  canvas: HTMLCanvasElement | null,
  titleOrFilename: string,
  filenameOrCallback?: string | (() => void),
  onDone?: () => void,
) {
  if (!canvas) return;
  const W = canvas.width;
  const H = canvas.height;
  const dataUrl = canvas.toDataURL("image/png");

  const filename =
    typeof filenameOrCallback === "string"
      ? filenameOrCallback
      : titleOrFilename;
  const title =
    typeof filenameOrCallback === "string" ? titleOrFilename : "Visual Asset";
  const cb =
    typeof filenameOrCallback === "function" ? filenameOrCallback : onDone;

  const escTitle = String(title || "Visual Asset")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
  const svgStr = `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}">
  <title>${escTitle}</title>
  <image width="${W}" height="${H}" href="${dataUrl}" />
</svg>`;
  const blob = new Blob([svgStr], { type: "image/svg+xml;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename.endsWith(".svg") ? filename : `${filename}.svg`;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
  if (cb) cb();
}

export async function printCanvasAsPdfPoster(
  canvas: HTMLCanvasElement | null,
  title: string,
  subtitleOrOnDone?: string | (() => void),
  onDone?: () => void,
) {
  if (!canvas) return;
  const { jsPDF } = await import("jspdf");
  const pdf = new jsPDF({
    orientation: canvas.width > canvas.height ? "landscape" : "portrait",
    unit: "px",
    format: [canvas.width, canvas.height],
  });
  pdf.addImage(
    canvas.toDataURL("image/png"),
    "PNG",
    0,
    0,
    canvas.width,
    canvas.height,
  );
  pdf.save(
    `${title.replace(/[^a-z0-9]+/gi, "-").slice(0, 80) || "visual"}.pdf`,
  );
  const cb = typeof subtitleOrOnDone === "function" ? subtitleOrOnDone : onDone;
  cb?.();
}

export async function copyCanvasImageToClipboard(
  canvas: HTMLCanvasElement | null,
  onDone?: () => void,
): Promise<boolean> {
  if (!canvas) return false;
  try {
    const blob = await new Promise<Blob | null>((resolve) =>
      canvas.toBlob((b) => resolve(b), "image/png"),
    );
    if (!blob) return false;
    await navigator.clipboard.write([new ClipboardItem({ "image/png": blob })]);
    if (onDone) onDone();
    return true;
  } catch {
    downloadCanvasAsPng(canvas, "visual-card.png", onDone);
    return false;
  }
}
