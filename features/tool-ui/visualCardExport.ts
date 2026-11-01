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

export interface SharedVisualTheme {
  id: SharedVisualThemeId;
  label: string;
  bgStart: string;
  bgEnd: string;
  cardBg: string;
  cardBorder: string;
  accent: string;
  accentSecondary: string;
  textMain: string;
  textMuted: string;
  isLight: boolean;
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
    cardBorder: "rgba(255, 107, 53, 0.45)",
    accent: "#FF6B35",
    accentSecondary: "#38BDF8",
    textMain: "#FFFFFF",
    textMuted: "#CBD5E1",
    isLight: false,
  },
  "royal-cobalt": {
    id: "royal-cobalt",
    label: "Royal Cobalt & Cyan Glow",
    bgStart: "#090D16",
    bgEnd: "#1E3A8A",
    cardBg: "rgba(21, 35, 71, 0.92)",
    cardBorder: "rgba(56, 189, 248, 0.45)",
    accent: "#38BDF8",
    accentSecondary: "#818CF8",
    textMain: "#FFFFFF",
    textMuted: "#DBEAFE",
    isLight: false,
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
    textMain: "#F8FAFC",
    textMuted: "#A7F3D0",
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
    textMain: "#0F172A",
    textMuted: "#475569",
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
    textMain: "#FFFFFF",
    textMuted: "#E9D5FF",
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
    textMain: "#FAFAFA",
    textMuted: "#D4D4D8",
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
    textMain: "#1C1917",
    textMuted: "#57534E",
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
    textMain: "#0F172A",
    textMuted: "#334155",
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
    textMain: "#FEFCE8",
    textMuted: "#D9F99D",
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
    textMain: "#0F172A",
    textMuted: "#334155",
    isLight: true,
  },
};

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
      textMain: custom.textMain,
      textMuted: isLight ? "#475569" : "#CBD5E1",
      isLight,
    };
  }
  return SHARED_VISUAL_THEMES[themeId] || SHARED_VISUAL_THEMES["midnight-orange"];
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
  title: string,
  filename: string,
  onDone?: () => void,
) {
  if (!canvas) return;
  const W = canvas.width;
  const H = canvas.height;
  const dataUrl = canvas.toDataURL("image/png");
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
  if (onDone) onDone();
}

export function printCanvasAsPdfPoster(
  canvas: HTMLCanvasElement | null,
  title: string,
  onDone?: () => void,
) {
  if (!canvas) return;
  const dataUrl = canvas.toDataURL("image/png");
  const win = window.open("", "_blank");
  if (!win) return;
  win.document.write(
    `<!doctype html><html><head><title>${title} - PDF Export</title><style>@page{margin:8mm}body{margin:0;display:flex;justify-content:center;align-items:center;background:#090d16;min-height:100vh}@media print{body{background:#fff}}img{max-width:100%;max-height:95vh;height:auto;width:auto}</style></head><body><img src="${dataUrl}" alt="${title}"/><script>window.onload=()=>{setTimeout(()=>window.print(),300)}</script></body></html>`,
  );
  win.document.close();
  if (onDone) onDone();
}

export function copyCanvasImageToClipboard(
  canvas: HTMLCanvasElement | null,
  onDone?: () => void,
) {
  if (!canvas) return;
  try {
    canvas.toBlob(async (blob) => {
      if (!blob) return;
      await navigator.clipboard.write([
        new ClipboardItem({ "image/png": blob }),
      ]);
      if (onDone) onDone();
    });
  } catch {
    downloadCanvasAsPng(canvas, "visual-card.png", onDone);
  }
}
