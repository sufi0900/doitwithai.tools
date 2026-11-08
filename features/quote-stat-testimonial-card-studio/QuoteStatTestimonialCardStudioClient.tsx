"use client";

import { TemplateThumbnail } from "@/features/tool-ui/InfographicArtwork";
import studioStyles from "@/features/tool-ui/visual-studio.module.css";

import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  CheckCircle2,
  Copy,
  Download,
  FileCode2,
  FileText,
  ImagePlus,
  MessageSquareQuote,
  PackageCheck,
  Palette,
  Plus,
  RotateCcw,
  ShieldCheck,
  Sparkles,
  Trash2,
  Type,
  Upload,
  UserCheck,
  X,
  ZoomIn,
  ZoomOut,
} from "lucide-react";
import UrlArticleExtractorBar from "@/features/tool-ui/UrlArticleExtractorBar";
import ToolRunOverlay, {
  focusToolSection,
} from "@/features/tool-ui/ToolRunOverlay";
import PlatformBrandIcon from "@/features/tool-ui/PlatformBrandIcon";
import {
  copyCanvasImageToClipboard,
  downloadCanvasAsEmbeddedSvg,
  downloadCanvasAsPng,
  printCanvasAsPdfPoster,
  resolveStudioTheme,
  STUDIO_COLOR_THEMES,
  type CustomStudioColorOverrides,
  type StudioColorThemeId,
} from "@/features/tool-ui/visualCardExport";
import {
  buildDeterministicQuotePack,
  DEFAULT_QUOTE_STUDIO_INPUT,
  MALE_PORTRAIT_PRESETS,
  type CardAspectRatioId,
  type MalePortraitPresetId,
  type QuoteCardItem,
  type QuoteStudioInput,
  type QuoteStudioPack,
  type QuoteVisualTemplateId,
} from "./model";

const QUOTE_TEMPLATES: {
  id: QuoteVisualTemplateId;
  label: string;
  desc: string;
}[] = [
  {
    id: "aragon-split-testimonial",
    label: "1. Split Portrait Testimonial (Studio Flagship)",
    desc: "Customer portrait on right, highlighted quote, 5 stars, trust pills & dark brand footer",
  },
  {
    id: "verified-post-screenshot",
    label: "2. Verified Post / X Card",
    desc: "Clean social post card with male avatar, verified check & metrics",
  },
  {
    id: "highlighter-quote",
    label: "3. Neon Highlighter Quote",
    desc: "Editorial card with highlighted key opening ribbon phrase",
  },
  {
    id: "founder-memo-note",
    label: "4. Founder Memo / Notes Card",
    desc: "Warm Apple-Notes / executive memo aesthetic that earns saves",
  },
  {
    id: "testimonial-5-star",
    label: "5. 5-Star Social Proof Review",
    desc: "Client testimonial card with 5 golden stars & male portrait badge",
  },
  {
    id: "myth-vs-reality",
    label: "6. Contrarian Myth vs. Reality",
    desc: "Splits common industry myth vs. proven practitioner truth",
  },
  {
    id: "executive-pull-quote",
    label: "7. Magazine Pull-Quote Poster",
    desc: "Oversized quotation marks, serif typography & editorial frame",
  },
  {
    id: "oversized-kpi-stat",
    label: "8. Oversized KPI Metric Callout",
    desc: "Giant benchmark figure + supporting quote & takeaway bar",
  },
  {
    id: "before-after-proof",
    label: "9. Before vs. After Case Study",
    desc: "Contrasts old bottleneck state vs. new quantified outcome",
  },
  {
    id: "podcast-clip-quote",
    label: "10. Podcast Audio Waveform Card",
    desc: "Speaker badge, audio waveform bars & quotable soundbite",
  },
  {
    id: "glassmorphic-saas-card",
    label: "11. Glassmorphic SaaS Insight",
    desc: "Modern frosted glass frame with glowing gradient accents",
  },
  {
    id: "boardroom-white-frame",
    label: "12. Executive Boardroom Frame",
    desc: "Harvard/McKinsey style double-bordered editorial insight",
  },
  {
    id: "checklist-takeaway-card",
    label: "13. Quote + 3 Action Takeaways",
    desc: "Pairs the core quote with 3 checkmarked execution bullets",
  },
];

function wrapQuoteLines(
  ctx: CanvasRenderingContext2D,
  text: string,
  maxWidth: number,
  maxLines: number,
): string[] {
  const words = String(text || "")
    .trim()
    .split(/\s+/)
    .filter(Boolean);
  const lines: string[] = [];
  let cur = "";
  for (const w of words) {
    const test = cur ? `${cur} ${w}` : w;
    if (ctx.measureText(test).width > maxWidth && cur) {
      lines.push(cur);
      cur = w;
      if (lines.length >= maxLines - 1) break;
    } else {
      cur = test;
    }
  }
  if (cur && lines.length < maxLines) lines.push(cur);
  return lines;
}

/**
 * Draws a realistic male executive photographic portrait directly onto the canvas.
 * If the user uploaded a custom photo, it draws that.
 * Otherwise, it draws the selected photographic male preset from presetImages.
 * Strict 100% male executive portraits only.
 */
function drawMalePortraitOnCanvas(
  ctx: CanvasRenderingContext2D,
  boxX: number,
  boxY: number,
  boxW: number,
  boxH: number,
  presetId: MalePortraitPresetId,
  uploadedImg: HTMLImageElement | null,
  presetImages: Record<string, HTMLImageElement | null>,
  accentColor: string,
  isCircularAvatar = false,
) {
  if (presetId === "none" && !uploadedImg) return;

  ctx.save();
  if (isCircularAvatar) {
    const r = Math.min(boxW, boxH) / 2;
    const cx = boxX + r;
    const cy = boxY + r;
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.closePath();
    ctx.clip();
  } else {
    ctx.beginPath();
    ctx.roundRect(boxX, boxY, boxW, boxH, 28);
    ctx.closePath();
    ctx.clip();
  }

  const activeImg =
    uploadedImg || (presetImages ? presetImages[presetId] : null);

  if (activeImg && activeImg.complete && activeImg.naturalWidth > 0) {
    // Backdrop aura glow behind cutout
    const cx = boxX + boxW * 0.5;
    const cy = boxY + boxH * 0.55;
    const rGlow = Math.max(boxW, boxH) * 0.55;
    const bgGrad = ctx.createRadialGradient(cx, cy, 10, cx, cy, rGlow);
    bgGrad.addColorStop(0, `${accentColor}33`);
    bgGrad.addColorStop(1, "rgba(15, 23, 42, 0.35)");
    ctx.fillStyle = bgGrad;
    ctx.fillRect(boxX, boxY, boxW, boxH);

    // Draw the image with cover fit focusing on upper body/face
    const imgRatio = activeImg.naturalWidth / (activeImg.naturalHeight || 1);
    const boxRatio = boxW / (boxH || 1);
    let drawW = boxW;
    let drawH = boxH;
    let drawX = boxX;
    let drawY = boxY;

    if (isCircularAvatar) {
      if (imgRatio > boxRatio) {
        drawW = boxH * imgRatio;
        drawX = boxX - (drawW - boxW) / 2;
        drawY = boxY;
      } else {
        drawH = boxW / imgRatio;
        drawX = boxX;
        drawY = boxY;
      }
    } else {
      if (imgRatio > boxRatio) {
        drawW = boxH * imgRatio;
        drawX = boxX - (drawW - boxW) / 2;
        drawY = boxY;
      } else {
        drawH = boxW / imgRatio;
        drawX = boxX;
        drawY = boxY + boxH - drawH; // align to bottom
      }
    }

    ctx.drawImage(activeImg, drawX, drawY, drawW, drawH);

    if (isCircularAvatar) {
      ctx.strokeStyle = "rgba(255, 255, 255, 0.85)";
      ctx.lineWidth = 2.5;
      ctx.stroke();
    }

    ctx.restore();
    return;
  }

  // Fallback if image is still loading
  const preset =
    MALE_PORTRAIT_PRESETS.find((p) => p.id === presetId) ||
    MALE_PORTRAIT_PRESETS[0];
  ctx.fillStyle = preset.suitColor;
  ctx.fillRect(boxX, boxY, boxW, boxH);
  ctx.restore();
}

const MIN_QUOTE_CARDS = 2;
const MAX_QUOTE_CARDS = 8;

export default function QuoteStatTestimonialCardStudioClient() {
  const [input, setInput] = useState<QuoteStudioInput>(
    DEFAULT_QUOTE_STUDIO_INPUT,
  );
  const [aiPack, setAiPack] = useState<QuoteStudioPack | null>(null);
  const [cards, setCards] = useState<QuoteCardItem[]>(
    () => buildDeterministicQuotePack(DEFAULT_QUOTE_STUDIO_INPUT).cards,
  );
  const [activeCardIdx, setActiveCardIdx] = useState(0);
  const [themeId, setThemeId] = useState<StudioColorThemeId>("royal-cobalt");
  const [customColors, setCustomColors] = useState<CustomStudioColorOverrides>(
    {},
  );
  const [uploadedPortrait, setUploadedPortrait] =
    useState<HTMLImageElement | null>(null);
  const [uploadedPortraitName, setUploadedPortraitName] = useState<string>("");
  const [uploadedLogo, setUploadedLogo] = useState<HTMLImageElement | null>(
    null,
  );
  const [uploadedLogoName, setUploadedLogoName] = useState<string>("");
  const [presetImages, setPresetImages] = useState<
    Record<string, HTMLImageElement | null>
  >({});
  const [zoomLevel, setZoomLevel] = useState<number>(1);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState("");

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const resultsRef = useRef<HTMLDivElement | null>(null);
  const personFileInputRef = useRef<HTMLInputElement | null>(null);
  const logoFileInputRef = useRef<HTMLInputElement | null>(null);

  // Preload realistic photographic male executive portraits
  useEffect(() => {
    if (typeof window === "undefined") return;
    const map: Record<string, HTMLImageElement> = {};
    MALE_PORTRAIT_PRESETS.forEach((preset) => {
      const img = new window.Image();
      img.src = preset.imageSrc;
      img.onload = () => {
        map[preset.id] = img;
        setPresetImages((prev) => ({ ...prev, [preset.id]: img }));
      };
    });
  }, []);

  const activeTheme = useMemo(
    () => resolveStudioTheme(themeId, customColors),
    [themeId, customColors],
  );

  const fallbackPack = useMemo(
    () => buildDeterministicQuotePack(input),
    [input],
  );
  const pack = aiPack || fallbackPack;

  useEffect(() => {
    setCards(pack.cards);
    setActiveCardIdx(0);
  }, [pack]);

  const activeCard = cards[activeCardIdx] || cards[0];
  const canAddCard = cards.length < MAX_QUOTE_CARDS;
  const canRemoveCard = cards.length > MIN_QUOTE_CARDS;

  function notify(msg: string) {
    setToast(msg);
    setTimeout(() => setToast(""), 3200);
  }

  function handlePersonPhotoUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const img = new Image();
      img.onload = () => {
        setUploadedPortrait(img);
        setUploadedPortraitName(file.name);
        setInput((prev) => ({ ...prev, portraitPreset: "custom-upload" }));
        notify(`Loaded custom portrait photo: ${file.name}`);
      };
      img.src = String(reader.result);
    };
    reader.readAsDataURL(file);
  }

  function handleClearPersonPhoto() {
    setUploadedPortrait(null);
    setUploadedPortraitName("");
    setInput((prev) => ({ ...prev, portraitPreset: "marcus-saas-vp" }));
    if (personFileInputRef.current) personFileInputRef.current.value = "";
    notify("Reverted to default male executive portrait.");
  }

  function handleLogoUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const img = new Image();
      img.onload = () => {
        setUploadedLogo(img);
        setUploadedLogoName(file.name);
        notify(`Loaded custom brand logo: ${file.name}`);
      };
      img.src = String(reader.result);
    };
    reader.readAsDataURL(file);
  }

  function handleClearLogo() {
    setUploadedLogo(null);
    setUploadedLogoName("");
    if (logoFileInputRef.current) logoFileInputRef.current.value = "";
    notify("Cleared custom brand logo (using domain badge).");
  }

  function selectMalePortraitPreset(presetId: MalePortraitPresetId) {
    setUploadedPortrait(null);
    setUploadedPortraitName("");
    if (personFileInputRef.current) personFileInputRef.current.value = "";
    const found = MALE_PORTRAIT_PRESETS.find((p) => p.id === presetId);
    setInput((prev) => ({
      ...prev,
      portraitPreset: presetId,
      authorName: found ? found.authorSample : prev.authorName,
      authorHandleOrRole: found ? found.roleSample : prev.authorHandleOrRole,
    }));
    notify(
      found
        ? `Switched portrait to ${found.label}`
        : "Switched to typography-only layout",
    );
  }

  function handleAddQuoteCard() {
    if (!canAddCard) return;
    const nextIdx = cards.length + 1;
    const newCard: QuoteCardItem = {
      id: `quote-custom-${Date.now()}`,
      badgeLabel: `VERIFIED WIN #0${nextIdx}`,
      highlightPhrase: "lifted conversions by 2.8x",
      quoteText:
        "Turning our raw client feedback into branded testimonial graphics lifted conversions by 2.8x across our landing pages and LinkedIn posts.",
      subContextOrReality:
        "Pair every customer quote with a verified portrait and brand accent color.",
    };
    setCards((prev) => [...prev, newCard]);
    setActiveCardIdx(cards.length);
    notify(`Added Testimonial Card #0${nextIdx}!`);
  }

  function handleRemoveQuoteCard() {
    if (!canRemoveCard) return;
    const nextCards = cards.filter((_, idx) => idx !== activeCardIdx);
    setCards(nextCards);
    setActiveCardIdx(Math.max(0, activeCardIdx - 1));
    notify(`Removed card (${nextCards.length} cards remaining).`);
  }

  async function runGenerateAiQuotes(overrideInput?: QuoteStudioInput) {
    const payload = overrideInput || input;
    setLoading(true);
    try {
      const res = await fetch(
        "/api/ai-tools/quote-stat-testimonial-card-studio",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        },
      );
      const data = await res.json();
      if (data?.pack) {
        setAiPack(data.pack);
        setCards(data.pack.cards);
        setActiveCardIdx(0);
        notify("Generated 5 high-converting quote & testimonial cards!");
      }
      focusToolSection(resultsRef.current);
    } catch {
      notify("Updated visual testimonial & quote cards.");
      focusToolSection(resultsRef.current);
    } finally {
      setLoading(false);
    }
  }

  function updateActiveCard(field: keyof QuoteCardItem, value: string) {
    setCards((prev) =>
      prev.map((c, idx) =>
        idx === activeCardIdx ? { ...c, [field]: value } : c,
      ),
    );
  }

  // Render Canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !activeCard) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const ratio: CardAspectRatioId = input.aspectRatio || "1:1";
    const W = ratio === "16:9" ? 1600 : 1080;
    const H = ratio === "4:5" ? 1350 : ratio === "16:9" ? 900 : 1080;
    canvas.width = W;
    canvas.height = H;

    const grad = ctx.createLinearGradient(0, 0, W, H);
    grad.addColorStop(0, activeTheme.bgStart);
    grad.addColorStop(1, activeTheme.bgEnd);
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, W, H);

    // Ambient corner glow
    const glow = ctx.createRadialGradient(
      W * 0.85,
      H * 0.15,
      20,
      W * 0.85,
      H * 0.15,
      380,
    );
    glow.addColorStop(0, `${activeTheme.accent}38`);
    glow.addColorStop(1, "transparent");
    ctx.fillStyle = glow;
    ctx.fillRect(0, 0, W, H);

    const cardX = Math.round(W * 0.065);
    const cardY = Math.round(H * 0.075);
    const cardW = W - cardX * 2;
    const cardH = H - cardY * 2;

    const currentPreset = input.portraitPreset || "marcus-saas-vp";
    const hasPortrait =
      currentPreset !== "none" || Boolean(uploadedPortrait);

    // TEMPLATE #1: ARAGON STUDIO SPLIT-PORTRAIT CUSTOMER TESTIMONIAL CARD
    if (input.template === "aragon-split-testimonial") {
      const footerH = Math.round(cardH * 0.175);
      const isDefaultDarkSurface =
        !customColors.cardBg &&
        (activeTheme.cardBg === "#0f172a" ||
          activeTheme.cardBg === "#111827" ||
          activeTheme.cardBg === "#1e293b");
      const surfaceColor = isDefaultDarkSurface
        ? "#FFFDF9"
        : activeTheme.cardBg;
      const bodyTextColor = isDefaultDarkSurface
        ? "#0F172A"
        : activeTheme.textMain;

      ctx.save();
      ctx.fillStyle = surfaceColor;
      ctx.strokeStyle = "#0F172A";
      ctx.lineWidth = 5;
      ctx.beginPath();
      ctx.roundRect(cardX, cardY, cardW, cardH, 42);
      ctx.fill();
      ctx.stroke();
      ctx.clip();

      const contentLeftX = cardX + 58;
      const textColumnW = hasPortrait
        ? Math.round(cardW * 0.54)
        : cardW - 116;

      // Giant Brand-Colored Quote Mark “
      ctx.fillStyle = activeTheme.accent;
      ctx.font = "900 112px Georgia, serif";
      ctx.fillText("“", contentLeftX - 8, cardY + 118);

      // 5 Stars + Rating Label
      ctx.fillStyle = activeTheme.accent;
      ctx.font = "900 28px system-ui, -apple-system, sans-serif";
      ctx.fillText(
        input.starRatingLabel || "★★★★★ 5.0",
        contentLeftX + 78,
        cardY + 86,
      );

      // Multi-line Quote with Brand-Colored Highlighted Phrase
      const fontSize = ratio === "16:9" ? 34 : 38;
      const lineHeight = Math.round(fontSize * 1.32);
      ctx.font = `800 ${fontSize}px system-ui, -apple-system, sans-serif`;
      const qLines = wrapQuoteLines(
        ctx,
        activeCard.quoteText,
        textColumnW,
        7,
      );
      const hlLower = (activeCard.highlightPhrase || "")
        .trim()
        .toLowerCase();

      let qy = cardY + 175;
      for (const line of qLines) {
        const lineLower = line.toLowerCase();
        const isHighlightedLine =
          (hlLower.length >= 4 &&
            (lineLower.includes(hlLower) || hlLower.includes(lineLower))) ||
          line.includes("**");
        const cleanLine = line.replace(/\*\*/g, "");

        if (isHighlightedLine) {
          const textW = ctx.measureText(cleanLine).width;
          ctx.fillStyle = `${activeTheme.accent}1E`;
          ctx.beginPath();
          ctx.roundRect(
            contentLeftX - 8,
            qy - fontSize + 4,
            Math.min(textColumnW + 12, textW + 16),
            fontSize + 10,
            10,
          );
          ctx.fill();
          ctx.fillStyle = activeTheme.accent;
        } else {
          ctx.fillStyle = bodyTextColor;
        }
        ctx.fillText(cleanLine, contentLeftX, qy);
        qy += lineHeight;
      }

      // 2 Bottom Trust Badges above footer bar
      const badgeY = cardY + cardH - footerH - 68;
      const badges = [
        input.trustBadge1 || "Verified Customer",
        input.trustBadge2 || "2.8x Conversion Lift",
      ].filter(Boolean);

      let bx = contentLeftX;
      ctx.font = "800 18px system-ui, -apple-system, sans-serif";
      for (const bText of badges) {
        const label = `✓ ${bText}`;
        const bw = ctx.measureText(label).width + 32;
        ctx.fillStyle = `${activeTheme.accent}18`;
        ctx.strokeStyle = `${activeTheme.accent}55`;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.roundRect(bx, badgeY, bw, 42, 21);
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = activeTheme.accent;
        ctx.fillText(label, bx + 16, badgeY + 27);
        bx += bw + 14;
      }

      // Right-Side Executive Male Photographic Cutout Portrait (or Uploaded Photo)
      if (hasPortrait) {
        const pW = Math.round(cardW * 0.39);
        const pH = cardH - footerH - 44;
        const pX = cardX + cardW - pW - 24;
        const pY = cardY + 44;
        drawMalePortraitOnCanvas(
          ctx,
          pX,
          pY,
          pW,
          pH,
          currentPreset,
          uploadedPortrait,
          presetImages,
          activeTheme.accent,
          false,
        );
      }

      // Full-Width Dark/Brand Footer Bar
      const footerY = cardY + cardH - footerH;
      ctx.fillStyle = "#0B1325";
      ctx.fillRect(cardX, footerY, cardW, footerH);

      // Circular Avatar inside Footer Bar
      const avSize = Math.min(82, footerH - 34);
      const avX = contentLeftX;
      const avY = footerY + Math.round((footerH - avSize) / 2);
      drawMalePortraitOnCanvas(
        ctx,
        avX,
        avY,
        avSize,
        avSize,
        currentPreset,
        uploadedPortrait,
        presetImages,
        activeTheme.accent,
        true,
      );

      // Name & Title in Footer
      const textStartX = hasPortrait ? avX + avSize + 22 : contentLeftX;
      ctx.fillStyle = "#FFFFFF";
      ctx.font = "900 24px system-ui, -apple-system, sans-serif";
      ctx.fillText(input.authorName, textStartX, footerY + 46);

      // Verified check badge next to author name
      const authorW = ctx.measureText(input.authorName).width;
      ctx.fillStyle = activeTheme.accent;
      ctx.beginPath();
      ctx.arc(textStartX + authorW + 18, footerY + 38, 11, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "#FFFFFF";
      ctx.font = "900 13px system-ui, -apple-system, sans-serif";
      ctx.fillText("✓", textStartX + authorW + 14, footerY + 43);

      ctx.fillStyle = "#94A3B8";
      ctx.font = "600 18px system-ui, -apple-system, sans-serif";
      ctx.fillText(
        input.authorHandleOrRole || "Verified Customer",
        textStartX,
        footerY + 76,
      );

      // Right Side of Footer: Uploaded Brand Logo OR Custom Brand Pill
      if (uploadedLogo) {
        const maxLogoH = footerH - 42;
        const maxLogoW = 190;
        const lRatio = uploadedLogo.width / (uploadedLogo.height || 1);
        const drawH = Math.min(maxLogoH, maxLogoW / lRatio);
        const drawW = drawH * lRatio;
        ctx.drawImage(
          uploadedLogo,
          cardX + cardW - drawW - 48,
          footerY + (footerH - drawH) / 2,
          drawW,
          drawH,
        );
      } else {
        ctx.font = "900 19px system-ui, -apple-system, sans-serif";
        const brandLabel = (
          input.brandDomain || "doitwithai.tools"
        ).toUpperCase();
        const bWidth = ctx.measureText(brandLabel).width + 38;
        const bX = cardX + cardW - bWidth - 44;
        const bY = footerY + (footerH - 46) / 2;
        ctx.fillStyle = `${activeTheme.accent}28`;
        ctx.strokeStyle = activeTheme.accent;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.roundRect(bX, bY, bWidth, 46, 14);
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = "#FFFFFF";
        ctx.fillText(brandLabel, bX + 19, bY + 29);
      }

      ctx.restore();
      return;
    }

    // BASE CARD CONTAINER FOR TEMPLATES 2-13
    ctx.fillStyle = activeTheme.cardBg;
    ctx.strokeStyle =
      input.template === "boardroom-white-frame" ||
      input.template === "glassmorphic-saas-card"
        ? activeTheme.accent
        : activeTheme.cardBorder;
    ctx.lineWidth = input.template === "boardroom-white-frame" ? 4 : 3;
    ctx.beginPath();
    ctx.roundRect(cardX, cardY, cardW, cardH, 36);
    ctx.fill();
    ctx.stroke();

    if (input.template === "boardroom-white-frame") {
      ctx.strokeStyle = `${activeTheme.accent}55`;
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.roundRect(cardX + 16, cardY + 16, cardW - 32, cardH - 32, 28);
      ctx.stroke();
    }

    const innerX = cardX + 54;
    const innerW = cardW - 108;
    const bodyRegionTop = cardY + 110;
    const bodyRegionBottom = cardY + cardH - 110;
    const bodyRegionMid = (bodyRegionTop + bodyRegionBottom) / 2;

    if (input.template === "verified-post-screenshot") {
      drawMalePortraitOnCanvas(
        ctx,
        cardX + 44,
        cardY + 44,
        88,
        88,
        currentPreset,
        uploadedPortrait,
        presetImages,
        activeTheme.accent,
        true,
      );

      ctx.fillStyle = activeTheme.textMain;
      ctx.font = "800 28px system-ui, -apple-system, sans-serif";
      ctx.fillText(input.authorName, cardX + 148, cardY + 78);

      const nameW = ctx.measureText(input.authorName).width;
      ctx.fillStyle = activeTheme.accent;
      ctx.beginPath();
      ctx.arc(cardX + 148 + nameW + 18, cardY + 70, 11, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "#FFFFFF";
      ctx.font = "900 13px system-ui, -apple-system, sans-serif";
      ctx.fillText("✓", cardX + 148 + nameW + 14, cardY + 75);

      ctx.fillStyle = activeTheme.textSub;
      ctx.font = "500 20px system-ui, -apple-system, sans-serif";
      ctx.fillText(input.authorHandleOrRole, cardX + 148, cardY + 112);

      ctx.font = "500 37px system-ui, -apple-system, sans-serif";
      const qLines = wrapQuoteLines(
        ctx,
        activeCard.quoteText,
        cardW - 88,
        6,
      );
      const totalH = qLines.length * 52;
      let qy = Math.max(bodyRegionTop + 40, bodyRegionMid - totalH / 2);

      ctx.fillStyle = activeTheme.textMain;
      for (const l of qLines) {
        ctx.fillText(l, cardX + 44, qy);
        qy += 52;
      }

      const boxY = Math.min(cardY + cardH - 168, qy + 16);
      ctx.fillStyle = `${activeTheme.accent}12`;
      ctx.strokeStyle = `${activeTheme.accent}40`;
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.roundRect(innerX, boxY, innerW, 68, 18);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = activeTheme.accent;
      ctx.font = "700 20px system-ui, -apple-system, sans-serif";
      ctx.fillText(
        `💡 ${activeCard.subContextOrReality.slice(0, 62)}`,
        innerX + 24,
        boxY + 52,
      );
    } else if (input.template === "testimonial-5-star") {
      ctx.fillStyle = "#F59E0B";
      ctx.font = "900 44px system-ui, -apple-system, sans-serif";
      ctx.fillText("★ ★ ★ ★ ★", innerX, cardY + 102);

      ctx.fillStyle = activeTheme.accent;
      ctx.font = "800 20px system-ui, -apple-system, sans-serif";
      ctx.fillText(
        activeCard.badgeLabel.toUpperCase(),
        innerX + 275,
        cardY + 96,
      );

      ctx.font = "700 39px Georgia, serif";
      const qLines = wrapQuoteLines(
        ctx,
        `"${activeCard.quoteText}"`,
        innerW,
        6,
      );
      const totalH = qLines.length * 52 + 110;
      let qy = Math.max(
        bodyRegionTop + 36,
        bodyRegionMid - totalH / 2 + 36,
      );

      ctx.fillStyle = activeTheme.textMain;
      for (const l of qLines) {
        ctx.fillText(l, innerX, qy);
        qy += 52;
      }

      drawMalePortraitOnCanvas(
        ctx,
        innerX,
        qy + 12,
        74,
        74,
        currentPreset === "none" ? "marcus-saas-vp" : currentPreset,
        uploadedPortrait,
        presetImages,
        activeTheme.accent,
        true,
      );

      ctx.fillStyle = activeTheme.textMain;
      ctx.font = "800 28px system-ui, -apple-system, sans-serif";
      ctx.fillText(input.authorName, innerX + 92, qy + 44);

      ctx.fillStyle = activeTheme.textSub;
      ctx.font = "500 22px system-ui, -apple-system, sans-serif";
      ctx.fillText(input.authorHandleOrRole, innerX + 92, qy + 74);
    } else if (
      input.template === "myth-vs-reality" ||
      input.template === "before-after-proof"
    ) {
      const boxH = Math.floor((cardH - 185) / 2);
      const isBeforeAfter = input.template === "before-after-proof";

      ctx.fillStyle = "rgba(244, 63, 94, 0.14)";
      ctx.strokeStyle = "rgba(244, 63, 94, 0.4)";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.roundRect(innerX, cardY + 54, innerW, boxH, 24);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = "#F43F5E";
      ctx.font = "900 20px system-ui, -apple-system, sans-serif";
      ctx.fillText(
        isBeforeAfter ? "❌ BEFORE (THE BOTTLENECK)" : "❌ COMMON MYTH",
        innerX + 32,
        cardY + 98,
      );

      ctx.fillStyle = activeTheme.textMain;
      ctx.font = "700 32px system-ui, -apple-system, sans-serif";
      const mythLines = wrapQuoteLines(
        ctx,
        activeCard.quoteText,
        innerW - 64,
        4,
      );
      let my = cardY + 148;
      for (const l of mythLines) {
        ctx.fillText(l, innerX + 32, my);
        my += 44;
      }

      const rY = cardY + 54 + boxH + 20;
      ctx.fillStyle = `${activeTheme.accent}1E`;
      ctx.strokeStyle = `${activeTheme.accent}55`;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.roundRect(innerX, rY, innerW, boxH, 24);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = activeTheme.accent;
      ctx.font = "900 20px system-ui, -apple-system, sans-serif";
      ctx.fillText(
        isBeforeAfter ? "✅ AFTER (THE WIN)" : "✅ PRACTITIONER REALITY",
        innerX + 32,
        rY + 44,
      );

      ctx.fillStyle = activeTheme.textMain;
      ctx.font = "700 32px system-ui, -apple-system, sans-serif";
      const realityLines = wrapQuoteLines(
        ctx,
        activeCard.subContextOrReality || activeCard.highlightPhrase,
        innerW - 64,
        4,
      );
      let ry = rY + 94;
      for (const l of realityLines) {
        ctx.fillText(l, innerX + 32, ry);
        ry += 44;
      }
    } else if (input.template === "oversized-kpi-stat") {
      const statMatch =
        activeCard.quoteText.match(
          /\d+(?:\.\d+)?(?:\s*%|\s*x|\+)/i,
        )?.[0] ||
        activeCard.highlightPhrase.match(
          /\d+(?:\.\d+)?(?:\s*%|\s*x|\+)/i,
        )?.[0] ||
        "2.8x";
      const qLines = wrapQuoteLines(ctx, activeCard.quoteText, innerW, 5);
      const totalH = 148 + 44 + qLines.length * 48;
      const startY = Math.max(cardY + 64, bodyRegionMid - totalH / 2);

      ctx.fillStyle = `${activeTheme.accent}20`;
      ctx.strokeStyle = activeTheme.accent;
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.roundRect(innerX, startY, 280, 148, 26);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = activeTheme.accent;
      ctx.font = "900 76px system-ui, -apple-system, sans-serif";
      ctx.textAlign = "center";
      ctx.fillText(statMatch, innerX + 140, startY + 98);
      ctx.textAlign = "left";

      ctx.fillStyle = activeTheme.textMain;
      ctx.font = "900 28px system-ui, -apple-system, sans-serif";
      ctx.fillText(
        activeCard.badgeLabel.toUpperCase(),
        innerX + 310,
        startY + 50,
      );
      ctx.fillStyle = activeTheme.textSub;
      ctx.font = "600 24px system-ui, -apple-system, sans-serif";
      const hlLines = wrapQuoteLines(
        ctx,
        activeCard.highlightPhrase,
        innerW - 310,
        2,
      );
      hlLines.forEach((l, li) =>
        ctx.fillText(l, innerX + 310, startY + 90 + li * 32),
      );

      ctx.fillStyle = activeTheme.textMain;
      ctx.font = "700 36px system-ui, -apple-system, sans-serif";
      let qy = startY + 148 + 44 + 30;
      for (const l of qLines) {
        ctx.fillText(l, innerX, qy);
        qy += 48;
      }
    } else if (input.template === "podcast-clip-quote") {
      ctx.fillStyle = activeTheme.accent;
      ctx.beginPath();
      ctx.roundRect(innerX, cardY + 62, 260, 44, 22);
      ctx.fill();
      ctx.fillStyle = "#FFFFFF";
      ctx.font = "900 18px system-ui, -apple-system, sans-serif";
      ctx.fillText("🎙️ AUDIO CLIP HIGHLIGHT", innerX + 20, cardY + 90);

      ctx.font = "800 36px system-ui, -apple-system, sans-serif";
      const qLines = wrapQuoteLines(
        ctx,
        `"${activeCard.quoteText}"`,
        innerW,
        5,
      );
      const qH = qLines.length * 48;
      const totalH = qH + 80;
      let qy = Math.max(cardY + 145, bodyRegionMid - totalH / 2);

      ctx.fillStyle = activeTheme.textMain;
      for (const l of qLines) {
        ctx.fillText(l, innerX, qy);
        qy += 48;
      }

      // Audio waveform bars
      const waveY = qy + 24;
      const barCount = 38;
      const barW = Math.floor((innerW - (barCount - 1) * 8) / barCount);
      for (let i = 0; i < barCount; i++) {
        const hVal = Math.sin(i * 0.42) * 26 + 32;
        ctx.fillStyle =
          i % 3 === 0 ? activeTheme.accent : `${activeTheme.accent}66`;
        ctx.beginPath();
        ctx.roundRect(
          innerX + i * (barW + 8),
          waveY - hVal / 2,
          barW,
          hVal,
          4,
        );
        ctx.fill();
      }
    } else if (input.template === "checklist-takeaway-card") {
      ctx.font = "800 34px system-ui, -apple-system, sans-serif";
      const qLines = wrapQuoteLines(ctx, activeCard.quoteText, innerW, 4);
      let qy = cardY + 92;
      ctx.fillStyle = activeTheme.textMain;
      for (const l of qLines) {
        ctx.fillText(l, innerX, qy);
        qy += 46;
      }

      const bullets = [
        activeCard.highlightPhrase,
        activeCard.subContextOrReality,
        "Ready to implement in under 15 minutes today",
      ].filter(Boolean);

      let by = qy + 36;
      for (let idx = 0; idx < bullets.length; idx++) {
        const b = bullets[idx];
        ctx.fillStyle = `${activeTheme.accent}1C`;
        ctx.strokeStyle = activeTheme.accent;
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.roundRect(innerX, by, innerW, 64, 18);
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = activeTheme.accent;
        ctx.font = "900 24px system-ui, -apple-system, sans-serif";
        ctx.fillText("✓", innerX + 24, by + 40);

        ctx.fillStyle = activeTheme.textMain;
        ctx.font = "700 23px system-ui, -apple-system, sans-serif";
        ctx.fillText(b.slice(0, 56), innerX + 64, by + 40);
        by += 78;
      }
    } else if (input.template === "founder-memo-note") {
      ctx.fillStyle = "#F59E0B";
      ctx.fillRect(cardX, cardY, cardW, 18);

      ctx.fillStyle = activeTheme.textSub;
      ctx.font = "800 20px system-ui, -apple-system, sans-serif";
      ctx.fillText(
        `MEMO · ${input.authorName.toUpperCase()}`,
        innerX,
        cardY + 68,
      );

      ctx.font = "700 38px Georgia, serif";
      const qLines = wrapQuoteLines(ctx, activeCard.quoteText, innerW, 6);
      const totalH = qLines.length * 52;
      let qy = Math.max(bodyRegionTop + 36, bodyRegionMid - totalH / 2);

      ctx.fillStyle = activeTheme.textMain;
      for (const l of qLines) {
        ctx.fillText(l, innerX, qy);
        qy += 52;
      }
    } else {
      // DEFAULT EDITORIAL / HIGHLIGHTER / GLASSMORPHIC
      ctx.fillStyle = activeTheme.accent;
      ctx.font = "900 22px system-ui, -apple-system, sans-serif";
      ctx.fillText(
        activeCard.badgeLabel.toUpperCase(),
        innerX,
        cardY + 84,
      );

      if (input.template === "highlighter-quote") {
        ctx.fillStyle = activeTheme.accent;
        ctx.beginPath();
        ctx.roundRect(innerX, cardY + 116, innerW, 10, 5);
        ctx.fill();
      }

      ctx.font =
        input.template === "executive-pull-quote"
          ? "700 38px Georgia, serif"
          : "800 37px system-ui, -apple-system, sans-serif";

      if (input.template === "executive-pull-quote") {
        ctx.fillStyle = `${activeTheme.accent}33`;
        ctx.font = "900 130px Georgia, serif";
        ctx.fillText("“", innerX - 10, cardY + 205);
      }

      const qLines = wrapQuoteLines(
        ctx,
        `"${activeCard.quoteText}"`,
        innerW,
        6,
      );
      const totalH = qLines.length * 50;
      let qy = Math.max(
        cardY + 160,
        bodyRegionMid - totalH / 2 + (input.template === "highlighter-quote" ? 20 : 0),
      );

      ctx.fillStyle = activeTheme.textMain;
      ctx.font =
        input.template === "executive-pull-quote"
          ? "700 38px Georgia, serif"
          : "800 37px system-ui, -apple-system, sans-serif";
      for (const l of qLines) {
        ctx.fillText(l, innerX, qy);
        qy += 50;
      }
    }

    // Bottom Attribution Strip with Optional Avatar & Uploaded Logo
    if (hasPortrait) {
      drawMalePortraitOnCanvas(
        ctx,
        innerX,
        cardY + cardH - 74,
        48,
        48,
        currentPreset,
        uploadedPortrait,
        presetImages,
        activeTheme.accent,
        true,
      );
    }
    ctx.fillStyle = activeTheme.textSub;
    ctx.font = "700 20px system-ui, -apple-system, sans-serif";
    ctx.fillText(
      `${input.authorName} · ${input.brandDomain}`,
      hasPortrait ? innerX + 62 : innerX,
      cardY + cardH - 42,
    );
    if (uploadedLogo) {
      ctx.drawImage(
        uploadedLogo,
        cardX + cardW - 140,
        cardY + cardH - 68,
        84,
        36,
      );
    }
  }, [
    input,
    activeCard,
    activeTheme,
    customColors,
    uploadedPortrait,
    uploadedLogo,
    presetImages,
  ]);

  function downloadActiveQuotePng() {
    downloadCanvasAsPng(
      canvasRef.current,
      `testimonial-quote-card-0${activeCardIdx + 1}.png`,
    );
    notify(`Downloaded Testimonial Card #0${activeCardIdx + 1} (.PNG)!`);
  }

  function downloadQuoteAndCaptionPackage() {
    downloadActiveQuotePng();
    navigator.clipboard.writeText(pack.socialCaption);
    const blob = new Blob([pack.socialCaption], {
      type: "text/plain;charset=utf-8",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "testimonial-quote-social-caption.txt";
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    notify("Downloaded PNG Card + Social Caption Bundle!");
  }

  return (
    <section
      id="tool-studio-workspace"
      data-tool-workspace="true"
      aria-label="AI Testimonial Card, Customer Quote & Stat Visual Studio"
      className={`${studioStyles.studio} mx-auto w-full max-w-6xl space-y-6 px-4 py-8 sm:px-6`}
    >
      <ToolRunOverlay
        active={loading}
        title="Designing Customer Testimonial & Quote Graphics..."
        description="Building branded social proof, founder memo, and quote cards."
      />

      <UrlArticleExtractorBar
        label="Option 1: Paste Any Blog URL or Case Study Link to Auto-Extract 5 Quotable Customer Wins"
        placeholder="Paste an article or case study URL to extract quotable insights & build cards..."
        onExtracted={(data) => {
          setAiPack(null);
          let domain = "doitwithai.tools";
          try {
            domain = new URL(data.url).hostname.replace(/^www\./, "");
          } catch {}
          const nextInput: QuoteStudioInput = {
            ...input,
            authorName: data.author || input.authorName,
            brandDomain: domain,
            sourceContent:
              (data.paragraphs || []).slice(0, 6).join("\n\n") ||
              data.cleanText ||
              input.sourceContent,
          };
          setInput(nextInput);
          void runGenerateAiQuotes(nextInput);
        }}
        onSelectSubTopic={(sub) => {
          setAiPack(null);
          const nextInput: QuoteStudioInput = {
            ...input,
            sourceContent: sub.content,
          };
          setInput(nextInput);
          void runGenerateAiQuotes(nextInput);
        }}
      />

      <div
        ref={resultsRef}
        tabIndex={-1}
        className="space-y-6 rounded-2xl border-2 border-[#4058d0]/25 bg-white p-5 shadow-xs focus:outline-none dark:border-[#4058d0]/35 dark:bg-[#111827] sm:p-6"
      >
        {toast && (
          <div
            role="status"
            className="flex items-center gap-2 rounded-xl border border-emerald-500/40 bg-emerald-500/10 px-4 py-2.5 text-xs font-bold text-emerald-800 dark:text-emerald-300"
          >
            <CheckCircle2 size={15} />
            <span>{toast}</span>
          </div>
        )}

        {/* TOP BRAND HEADER & PRIMARY ACTIONS */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 pb-4 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <PlatformBrandIcon
              platform="x"
              slug="quote-stat-testimonial-card-studio"
              size={42}
            />
            <div>
              <span className="inline-flex items-center gap-1.5 text-xs font-extrabold uppercase tracking-wider text-[#4058d0]">
                <MessageSquareQuote size={14} />
                13 Built-In Testimonial, Stat &amp; Quote Card Templates
              </span>
              <h2 className="text-lg font-black text-slate-900 dark:text-white">
                AI Testimonial Card, Customer Quote &amp; Founder Memo Studio
              </h2>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => void runGenerateAiQuotes()}
              disabled={loading}
              className="inline-flex items-center gap-1.5 rounded-xl bg-[#3452d1] px-4 py-2.5 text-xs font-extrabold text-white shadow-sm hover:bg-[#2842b5]"
            >
              <Sparkles size={14} />
              AI Generate 5 Quote Cards
            </button>
            <button
              type="button"
              onClick={downloadQuoteAndCaptionPackage}
              className="inline-flex items-center gap-1.5 rounded-xl bg-[#4058d0] px-4 py-2.5 text-xs font-extrabold text-white shadow-sm hover:bg-[#3452d1]"
            >
              <PackageCheck size={15} />
              Download PNG + Caption Bundle
            </button>
          </div>
        </div>

        {/* 2-COLUMN UNIFIED STUDIO GRID */}
        <div className="grid items-start gap-6 lg:grid-cols-12">
          {/* LEFT CONTROL PANEL (lg:col-span-5) */}
          <div className="space-y-4 lg:col-span-5">
            {/* ASPECT RATIO & CARD SWITCHER */}
            <div className="rounded-xl border border-slate-200 bg-slate-50/80 p-3.5 dark:border-slate-800 dark:bg-slate-900/60">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="text-xs font-black uppercase tracking-wider text-slate-700 dark:text-slate-200">
                  Aspect Ratio
                </span>
                <div className="flex items-center gap-1">
                  {(["1:1", "4:5", "16:9"] as CardAspectRatioId[]).map((ar) => (
                    <button
                      key={ar}
                      type="button"
                      onClick={() =>
                        setInput((prev) => ({ ...prev, aspectRatio: ar }))
                      }
                      className={`rounded-lg px-2.5 py-1 text-[11px] font-extrabold transition ${
                        (input.aspectRatio || "1:1") === ar
                          ? "bg-[#4058d0] text-white shadow-xs"
                          : "border border-slate-300 bg-white text-slate-700 hover:border-slate-400 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-300"
                      }`}
                    >
                      {ar === "1:1"
                        ? "1:1 Square"
                        : ar === "4:5"
                          ? "4:5 Feed"
                          : "16:9 Deck"}
                    </button>
                  ))}
                </div>
              </div>

              {/* CARD TABS (Card #1, Card #2...) */}
              <div className="mt-3 flex flex-wrap items-center justify-between gap-2 border-t border-slate-200/80 pt-2.5 dark:border-slate-800">
                <div className="flex flex-wrap gap-1">
                  {cards.map((c, idx) => (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() => setActiveCardIdx(idx)}
                      className={`rounded-lg px-2.5 py-1 text-[11px] font-extrabold transition ${
                        activeCardIdx === idx
                          ? "bg-[#4058d0] text-white shadow-xs"
                          : "border border-slate-200 bg-white text-slate-700 hover:border-slate-300 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-200"
                      }`}
                    >
                      Card #{idx + 1}
                    </button>
                  ))}
                </div>
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={handleAddQuoteCard}
                    disabled={!canAddCard}
                    className="inline-flex items-center gap-0.5 rounded-lg bg-[#4058d0] px-2 py-1 text-[11px] font-bold text-white disabled:opacity-40"
                  >
                    <Plus size={12} /> Add
                  </button>
                  <button
                    type="button"
                    onClick={handleRemoveQuoteCard}
                    disabled={!canRemoveCard}
                    className="inline-flex items-center gap-0.5 rounded-lg bg-rose-600 px-2 py-1 text-[11px] font-bold text-white disabled:opacity-40"
                  >
                    <Trash2 size={12} />
                  </button>
                </div>
              </div>
            </div>

            {/* STEP 1: PHOTO & BRAND LOGO UPLOADS + MALE PORTRAITS */}
            <div className="rounded-xl border border-slate-200 bg-slate-50/80 p-3.5 dark:border-slate-800 dark:bg-slate-900/60">
              <span className="inline-flex items-center gap-1.5 text-xs font-black uppercase tracking-wider text-[#4058d0] dark:text-blue-300">
                <ImagePlus size={14} />
                Step 1 · Customer Photo &amp; Brand Logo
              </span>

              {/* Upload Buttons */}
              <div className="mt-2.5 grid grid-cols-2 gap-2">
                <div>
                  <button
                    type="button"
                    onClick={() => personFileInputRef.current?.click()}
                    className="inline-flex w-full items-center justify-center gap-1.5 rounded-xl bg-gradient-to-r from-[#EA580C] to-[#F97316] px-3 py-2 text-xs font-extrabold text-white shadow-xs transition hover:brightness-110"
                  >
                    <Upload size={13} />
                    <span className="truncate">
                      {uploadedPortraitName
                        ? `${uploadedPortraitName.slice(0, 12)}...`
                        : "Upload Photo ↑"}
                    </span>
                  </button>
                  {uploadedPortraitName && (
                    <button
                      type="button"
                      onClick={handleClearPersonPhoto}
                      className="mt-1 flex w-full items-center justify-center gap-1 text-[10px] font-bold text-slate-500 hover:text-rose-500"
                    >
                      <X size={10} /> Clear Uploaded Photo
                    </button>
                  )}
                  <input
                    ref={personFileInputRef}
                    type="file"
                    accept="image/png,image/jpeg,image/webp"
                    onChange={handlePersonPhotoUpload}
                    className="sr-only"
                  />
                </div>

                <div>
                  <button
                    type="button"
                    onClick={() => logoFileInputRef.current?.click()}
                    className="inline-flex w-full items-center justify-center gap-1.5 rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs font-extrabold text-slate-800 shadow-2xs transition hover:border-[#4058d0] dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
                  >
                    <ShieldCheck size={13} className="text-[#4058d0]" />
                    <span className="truncate">
                      {uploadedLogoName
                        ? `${uploadedLogoName.slice(0, 12)}...`
                        : "Upload Logo"}
                    </span>
                  </button>
                  {uploadedLogoName && (
                    <button
                      type="button"
                      onClick={handleClearLogo}
                      className="mt-1 flex w-full items-center justify-center gap-1 text-[10px] font-bold text-slate-500 hover:text-rose-500"
                    >
                      <X size={10} /> Clear Logo
                    </button>
                  )}
                  <input
                    ref={logoFileInputRef}
                    type="file"
                    accept="image/png,image/jpeg,image/webp,image/svg+xml"
                    onChange={handleLogoUpload}
                    className="sr-only"
                  />
                </div>
              </div>

              {/* Ready-Made Photographic Male Executive Portraits */}
              <div className="mt-3">
                <span className="block text-[11px] font-bold text-slate-600 dark:text-slate-300">
                  Or click a ready-made male executive portrait:
                </span>
                <div className="mt-1.5 grid grid-cols-2 gap-1.5">
                  {MALE_PORTRAIT_PRESETS.map((mp) => {
                    const isSelected =
                      !uploadedPortrait &&
                      (input.portraitPreset || "marcus-saas-vp") === mp.id;
                    return (
                      <button
                        key={mp.id}
                        type="button"
                        onClick={() => selectMalePortraitPreset(mp.id)}
                        className={`flex items-center gap-2 rounded-xl border p-1.5 text-left transition ${
                          isSelected
                            ? "border-[#4058d0] bg-[#4058d0]/15 ring-2 ring-[#4058d0]/30 dark:border-blue-400"
                            : "border-slate-200 bg-white hover:border-slate-300 dark:border-slate-800 dark:bg-slate-950"
                        }`}
                      >
                        <div className="relative h-8 w-8 shrink-0 overflow-hidden rounded-full border border-slate-300 bg-slate-800 dark:border-slate-700">
                          <img
                            src={mp.imageSrc}
                            alt={mp.authorSample}
                            className="h-full w-full object-cover object-top"
                          />
                        </div>
                        <div className="min-w-0">
                          <span className="block truncate text-[11px] font-extrabold text-slate-900 dark:text-white">
                            {mp.authorSample.split(" ")[0]}{" "}
                            {mp.authorSample.split(" ")[1]?.[0]}.
                          </span>
                          <span className="block truncate text-[9px] text-slate-500 dark:text-slate-400">
                            {mp.label.split("(")[1]?.replace(")", "") || "Exec"}
                          </span>
                        </div>
                      </button>
                    );
                  })}
                </div>

                <button
                  type="button"
                  onClick={() => selectMalePortraitPreset("none")}
                  className={`mt-1.5 flex w-full items-center justify-center rounded-xl border py-1 text-center text-[11px] font-extrabold transition ${
                    !uploadedPortrait && input.portraitPreset === "none"
                      ? "border-[#4058d0] bg-[#4058d0]/15 text-[#4058d0] dark:text-blue-300"
                      : "border-slate-200 bg-white text-slate-600 hover:border-slate-300 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-300"
                  }`}
                >
                  No Photo (Text Only)
                </button>
              </div>
            </div>

            {/* STEP 2: TESTIMONIAL QUOTE & AUTHOR DETAILS */}
            {activeCard && (
              <div className="space-y-3 rounded-xl border border-slate-200 bg-slate-50/80 p-3.5 dark:border-slate-800 dark:bg-slate-900/60">
                <span className="inline-flex items-center gap-1.5 text-xs font-black uppercase tracking-wider text-[#4058d0] dark:text-blue-300">
                  <Type size={14} />
                  Step 2 · Quote Text &amp; Author Details
                </span>

                <div className="grid gap-2 sm:grid-cols-2">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-200">
                      Customer / Author Name
                    </label>
                    <input
                      type="text"
                      value={input.authorName}
                      onChange={(e) =>
                        setInput((prev) => ({
                          ...prev,
                          authorName: e.target.value,
                        }))
                      }
                      className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-2.5 py-1 text-xs font-bold dark:border-slate-700 dark:bg-slate-950"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-200">
                      Brand / Company Badge
                    </label>
                    <input
                      type="text"
                      value={input.brandDomain}
                      onChange={(e) =>
                        setInput((prev) => ({
                          ...prev,
                          brandDomain: e.target.value,
                        }))
                      }
                      className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-2.5 py-1 text-xs font-bold dark:border-slate-700 dark:bg-slate-950"
                    />
                  </div>
                </div>

                <div className="grid gap-2 sm:grid-cols-2">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-200">
                      Role / Title / Handle
                    </label>
                    <input
                      type="text"
                      value={input.authorHandleOrRole}
                      onChange={(e) =>
                        setInput((prev) => ({
                          ...prev,
                          authorHandleOrRole: e.target.value,
                        }))
                      }
                      className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-2.5 py-1 text-xs dark:border-slate-700 dark:bg-slate-950"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-200">
                      Brand-Colored Highlight Phrase
                    </label>
                    <input
                      type="text"
                      value={activeCard.highlightPhrase}
                      onChange={(e) =>
                        updateActiveCard("highlightPhrase", e.target.value)
                      }
                      placeholder="e.g. lifted signups by 2.8x"
                      className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-2.5 py-1 text-xs font-bold dark:border-slate-700 dark:bg-slate-950"
                    />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between text-[11px] font-bold text-slate-700 dark:text-slate-200">
                    <span>Main Customer Quote</span>
                    <span className="text-[10px] text-[#4058d0]">
                      {activeCard.quoteText.length}/240c · Wrap **words** to highlight
                    </span>
                  </div>
                  <textarea
                    rows={3}
                    value={activeCard.quoteText}
                    onChange={(e) =>
                      updateActiveCard("quoteText", e.target.value)
                    }
                    className="mt-1 w-full rounded-lg border border-slate-300 bg-white p-2 text-xs leading-5 dark:border-slate-700 dark:bg-slate-950"
                  />
                </div>

                <div className="grid gap-2 sm:grid-cols-2">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-200">
                      Trust Pill #1
                    </label>
                    <input
                      type="text"
                      value={input.trustBadge1 || ""}
                      onChange={(e) =>
                        setInput((prev) => ({
                          ...prev,
                          trustBadge1: e.target.value,
                        }))
                      }
                      className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-2.5 py-1 text-xs dark:border-slate-700 dark:bg-slate-950"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-200">
                      Trust Pill #2
                    </label>
                    <input
                      type="text"
                      value={input.trustBadge2 || ""}
                      onChange={(e) =>
                        setInput((prev) => ({
                          ...prev,
                          trustBadge2: e.target.value,
                        }))
                      }
                      className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-2.5 py-1 text-xs dark:border-slate-700 dark:bg-slate-950"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-200">
                    Secondary Takeaway / Reality
                  </label>
                  <input
                    type="text"
                    value={activeCard.subContextOrReality}
                    onChange={(e) =>
                      updateActiveCard("subContextOrReality", e.target.value)
                    }
                    className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-2.5 py-1 text-xs dark:border-slate-700 dark:bg-slate-950"
                  />
                </div>
              </div>
            )}

            {/* STEP 3: BRAND COLOR PALETTES & CUSTOM HEX */}
            <div className="space-y-2.5 rounded-xl border border-slate-200 bg-slate-50/80 p-3.5 dark:border-slate-800 dark:bg-slate-900/60">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="inline-flex items-center gap-1.5 text-xs font-black uppercase tracking-wider text-[#4058d0] dark:text-blue-300">
                  <Palette size={14} />
                  Step 3 · Brand Palette &amp; Hex Color Wheel
                </span>
                {Object.keys(customColors).length > 0 && (
                  <button
                    type="button"
                    onClick={() => setCustomColors({})}
                    className="text-[11px] font-bold text-[#4058d0] hover:underline"
                  >
                    Reset Colors
                  </button>
                )}
              </div>

              {/* 10 Color Theme Pills */}
              <div className="flex flex-wrap gap-1">
                {STUDIO_COLOR_THEMES.map((t) => (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => {
                      setThemeId(t.id);
                      setCustomColors({});
                    }}
                    className={`inline-flex items-center gap-1.5 rounded-lg border px-2 py-1 text-[10px] font-bold transition ${
                      themeId === t.id && Object.keys(customColors).length === 0
                        ? "border-[#4058d0] bg-[#4058d0] text-white shadow-2xs"
                        : "border-slate-200 bg-white text-slate-700 hover:border-slate-300 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-200"
                    }`}
                  >
                    <span
                      className="h-2.5 w-2.5 rounded-full border border-white/40"
                      style={{ background: t.accent }}
                    />
                    {t.label}
                  </button>
                ))}
              </div>

              {/* 4 Custom Color Wheels */}
              <div className="grid grid-cols-2 gap-1.5 pt-1 sm:grid-cols-4">
                <label className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-2 py-1 text-[10px] font-bold text-slate-700 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-200">
                  <input
                    type="color"
                    value={activeTheme.bgStart}
                    onChange={(e) =>
                      setCustomColors((prev) => ({
                        ...prev,
                        bgStart: e.target.value,
                        bgEnd: e.target.value,
                      }))
                    }
                    className="h-4 w-5 cursor-pointer rounded border-0 bg-transparent p-0"
                  />
                  <span>Backdrop</span>
                </label>
                <label className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-2 py-1 text-[10px] font-bold text-slate-700 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-200">
                  <input
                    type="color"
                    value={
                      activeTheme.cardBg.startsWith("#")
                        ? activeTheme.cardBg
                        : "#FFFDF9"
                    }
                    onChange={(e) =>
                      setCustomColors((prev) => ({
                        ...prev,
                        cardBg: e.target.value,
                      }))
                    }
                    className="h-4 w-5 cursor-pointer rounded border-0 bg-transparent p-0"
                  />
                  <span>Surface</span>
                </label>
                <label className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-2 py-1 text-[10px] font-bold text-slate-700 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-200">
                  <input
                    type="color"
                    value={activeTheme.accent}
                    onChange={(e) =>
                      setCustomColors((prev) => ({
                        ...prev,
                        accent: e.target.value,
                      }))
                    }
                    className="h-4 w-5 cursor-pointer rounded border-0 bg-transparent p-0"
                  />
                  <span>Accent</span>
                </label>
                <label className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-2 py-1 text-[10px] font-bold text-slate-700 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-200">
                  <input
                    type="color"
                    value={activeTheme.textMain}
                    onChange={(e) =>
                      setCustomColors((prev) => ({
                        ...prev,
                        textMain: e.target.value,
                      }))
                    }
                    className="h-4 w-5 cursor-pointer rounded border-0 bg-transparent p-0"
                  />
                  <span>Text</span>
                </label>
              </div>
            </div>
          </div>

          {/* RIGHT CANVAS & TEMPLATES PANEL (lg:col-span-7) */}
          <div className="space-y-4 lg:col-span-7">
            {/* CANVAS BEZEL CONTAINER */}
            <div className="overflow-hidden rounded-2xl border-2 border-slate-300 bg-[#070b14] shadow-xl dark:border-slate-700">
              {/* TOP ACTION & EXPORT BAR */}
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 bg-slate-900 px-4 py-2.5">
                <span className="text-[11px] font-black uppercase tracking-wider text-white">
                  Card #{activeCardIdx + 1} · {input.aspectRatio || "1:1"} HD Canvas
                </span>
                <div className="flex flex-wrap items-center gap-1.5">
                  <button
                    type="button"
                    onClick={downloadActiveQuotePng}
                    className="inline-flex items-center gap-1 rounded-lg bg-[#3452d1] px-3 py-1.5 text-xs font-black text-white shadow-sm hover:bg-[#2842b5]"
                  >
                    <Download size={13} /> PNG (1080p)
                  </button>
                  <button
                    type="button"
                    onClick={async () => {
                      const ok = await copyCanvasImageToClipboard(
                        canvasRef.current,
                      );
                      notify(
                        ok
                          ? "Copied Card Image to Clipboard!"
                          : "Use PNG Download on this browser.",
                      );
                    }}
                    className="inline-flex items-center gap-1 rounded-lg bg-emerald-600 px-2.5 py-1.5 text-xs font-bold text-white hover:bg-emerald-500"
                  >
                    <Copy size={12} /> Copy
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      downloadCanvasAsEmbeddedSvg(
                        canvasRef.current,
                        `testimonial-quote-card-0${activeCardIdx + 1}.svg`,
                      );
                      notify("Downloaded Scalable Vector Card (.SVG)!");
                    }}
                    className="inline-flex items-center gap-1 rounded-lg bg-white/15 px-2.5 py-1.5 text-xs font-bold text-white hover:bg-white/25"
                  >
                    <FileCode2 size={12} /> SVG
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      printCanvasAsPdfPoster(
                        canvasRef.current,
                        `${input.authorName} Testimonial Card #${activeCardIdx + 1}`,
                        activeCard?.quoteText || "",
                      );
                      notify("Opened Print-Ready PDF View!");
                    }}
                    className="inline-flex items-center gap-1 rounded-lg bg-white/15 px-2.5 py-1.5 text-xs font-bold text-white hover:bg-white/25"
                  >
                    <FileText size={12} /> PDF
                  </button>
                  <button
                    type="button"
                    onClick={async () => {
                      await navigator.clipboard.writeText(pack.socialCaption);
                      notify("Copied Social Caption!");
                    }}
                    className="inline-flex items-center gap-1 rounded-lg bg-white/15 px-2.5 py-1.5 text-xs font-bold text-white hover:bg-white/25"
                  >
                    <Copy size={12} /> Caption
                  </button>
                </div>
              </div>

              {/* LIVE CANVAS STAGE */}
              <div
                onWheel={(e) => {
                  if (e.ctrlKey || e.metaKey) {
                    e.preventDefault();
                    setZoomLevel((z) =>
                      Math.min(
                        2.25,
                        Math.max(
                          0.6,
                          +(z + (e.deltaY < 0 ? 0.12 : -0.12)).toFixed(2),
                        ),
                      ),
                    );
                  }
                }}
                className="overflow-auto p-3 sm:p-5"
              >
                <div
                  style={{
                    width:
                      zoomLevel === 1
                        ? "100%"
                        : `${Math.round(zoomLevel * 100)}%`,
                    maxWidth: zoomLevel === 1 ? "560px" : "none",
                    transition: "width 0.16s ease-out",
                  }}
                  className="mx-auto"
                >
                  <canvas
                    ref={canvasRef}
                    className="mx-auto block h-auto w-full rounded-2xl shadow-2xl"
                  />
                </div>
              </div>

              {/* ZOOM CONTROLS BAR */}
              <div className="flex flex-wrap items-center justify-between gap-2 border-t border-slate-800 bg-[#0d1424] px-3.5 py-2 text-xs text-slate-300">
                <span className="text-[11px] text-slate-400">
                  Ctrl + Scroll to zoom
                </span>
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() =>
                      setZoomLevel((z) => Math.max(0.6, +(z - 0.15).toFixed(2)))
                    }
                    className="rounded-lg bg-slate-800 px-2 py-1 text-[11px] font-bold text-white hover:bg-slate-700"
                  >
                    <ZoomOut size={12} />
                  </button>
                  <button
                    type="button"
                    onClick={() => setZoomLevel(1)}
                    className={`rounded-lg px-2.5 py-1 text-[11px] font-extrabold ${
                      zoomLevel === 1
                        ? "bg-[#4058d0] text-white"
                        : "bg-slate-800 text-slate-200"
                    }`}
                  >
                    Auto Fit ({Math.round(zoomLevel * 100)}%)
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      setZoomLevel((z) =>
                        Math.min(2.25, +(z + 0.15).toFixed(2)),
                      )
                    }
                    className="rounded-lg bg-slate-800 px-2 py-1 text-[11px] font-bold text-white hover:bg-slate-700"
                  >
                    <ZoomIn size={12} />
                  </button>
                  {zoomLevel !== 1 && (
                    <button
                      type="button"
                      onClick={() => setZoomLevel(1)}
                      className="rounded-lg border border-slate-700 px-2 py-1 text-[11px] font-bold text-slate-300"
                    >
                      <RotateCcw size={11} />
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* STEP 4: CHOOSE LAYOUT (13 CARD TEMPLATES) DIRECTLY BELOW CANVAS */}
            <div className="rounded-xl border border-slate-200 bg-slate-50/80 p-4 dark:border-slate-800 dark:bg-slate-900/60">
              <span className="inline-flex items-center gap-1.5 text-xs font-black uppercase tracking-wider text-[#4058d0] dark:text-blue-300">
                <MessageSquareQuote size={14} />
                Step 4 · Choose Card Layout (13 Professional Templates)
              </span>
              <p className="mt-1 text-xs text-slate-600 dark:text-slate-300">
                Click any layout below to instantly transform your live canvas while keeping your quotes, photo, logo, and brand colors.
              </p>

              <div className="mt-3.5 grid gap-2.5 sm:grid-cols-2 md:grid-cols-3">
                {QUOTE_TEMPLATES.map((tpl) => (
                  <button
                    key={tpl.id}
                    type="button"
                    onClick={() =>
                      setInput((prev) => ({ ...prev, template: tpl.id }))
                    }
                    className={`rounded-xl border p-2 text-left transition ${
                      input.template === tpl.id
                        ? "border-[#4058d0] bg-[#4058d0]/10 ring-2 ring-[#4058d0]/30 dark:border-[#4058d0] dark:bg-[#4058d0]/20"
                        : "border-slate-200 bg-white hover:border-slate-300 dark:border-slate-800 dark:bg-slate-950"
                    }`}
                  >
                    <TemplateThumbnail
                      id={
                        tpl.id === "aragon-split-testimonial"
                          ? "testimonial-5-star"
                          : tpl.id
                      }
                      category="viral-list"
                    />
                    <strong className="mt-1 block text-xs font-extrabold text-slate-900 dark:text-white">
                      {tpl.label}
                    </strong>
                    <span className="mt-0.5 block text-[10px] leading-4 text-slate-500 dark:text-slate-400">
                      {tpl.desc}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
