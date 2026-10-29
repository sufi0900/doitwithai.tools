"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  Copy,
  Download,
  Image as ImageIcon,
  Plus,
  RefreshCw,
  Sparkles,
  Trash2,
} from "lucide-react";
import { zipStored } from "../outreach-email/docx";
import { focusToolSection } from "../tool-ui/ToolRunOverlay";
import { docxMime } from "./docx";
import { filename, validate, type Article } from "./model";
import {
  articleToEpub,
  articleToMarkdown,
  buildLinkedinCarousel,
  buildNewsletter,
  buildPodcastScript,
  buildRasterCarouselPdf,
  buildSocialPosts,
  buildVideoScript,
  carouselPdf,
  CAROUSEL_THEME_PRESETS,
  countWords,
  newsletterDocx,
  newsletterHtml,
  newsletterTxt,
  podcastScriptDocx,
  podcastScriptTxt,
  socialPostsCsv,
  socialPostsTxt,
  videoScriptDocx,
  videoScriptTxt,
  type CarouselBrandConfig,
  type CarouselSlide,
  type CarouselTemplateId,
  type ConversionFormat,
  type NewsletterDraft,
  type PodcastScriptDraft,
  type SocialPost,
  type VideoScriptDraft,
} from "./formats";

const field =
  "w-full rounded-xl border border-slate-300 bg-transparent p-3 text-sm leading-7 focus:outline-none focus:ring-2 focus:ring-[#5271ff] dark:border-slate-600";
const button =
  "inline-flex items-center justify-center gap-2 rounded-xl border border-slate-300 px-4 py-2.5 text-sm font-bold hover:bg-slate-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#5271ff] dark:border-slate-600 dark:hover:bg-slate-800 disabled:opacity-50";
const primary =
  "inline-flex items-center justify-center gap-2 rounded-xl bg-[#3452d1] px-5 py-3 text-sm font-bold text-white hover:bg-[#2943b5] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#5271ff] disabled:opacity-50";

type DownloadAsset = {
  label: string;
  url: string;
  downloadName: string;
  primary?: boolean;
};

function drawRoundedRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number,
) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
}

function wrapCanvasText(
  ctx: CanvasRenderingContext2D,
  text: string,
  maxWidth: number,
  maxLines = 4,
): string[] {
  const words = text.replace(/\s+/g, " ").trim().split(" ");
  const lines: string[] = [];
  let line = "";
  for (const w of words) {
    if (!w) continue;
    const test = (line + " " + w).trim();
    if (ctx.measureText(test).width > maxWidth && line) {
      lines.push(line);
      line = w;
      if (lines.length >= maxLines - 1) break;
    } else {
      line = test;
    }
  }
  if (line && lines.length < maxLines) lines.push(line);
  return lines;
}

/**
 * Studio-grade HTML5 Canvas renderer modeled directly on the user's LinkedIn &
 * Instagram carousel screenshots (image_ad573d.png & image_ad547a.png).
 */
function renderSlideCanvas(
  slide: CarouselSlide,
  totalSlides: number,
  config: CarouselBrandConfig,
  logoImg: HTMLImageElement | null,
): HTMLCanvasElement {
  const width = 1080;
  const height = config.aspect === "portrait" ? 1350 : 1080;
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d")!;

  // 1. Rich Gradient Background + Decorative Geometric Arcs
  const grad = ctx.createLinearGradient(0, 0, width, height);
  grad.addColorStop(0, config.bgColor);
  grad.addColorStop(1, config.bgSecondaryColor || config.bgColor);
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, width, height);

  ctx.save();
  ctx.strokeStyle = config.accentColor;
  ctx.globalAlpha = 0.12;
  ctx.lineWidth = 3;
  for (let r = 220; r <= 560; r += 85) {
    ctx.beginPath();
    ctx.arc(width - 120, 180, r, 0, Math.PI * 2);
    ctx.stroke();
  }
  if (config.template === "blueprint-grid") {
    ctx.lineWidth = 1;
    ctx.globalAlpha = 0.08;
    for (let gx = 0; gx < width; gx += 72) {
      ctx.beginPath();
      ctx.moveTo(gx, 0);
      ctx.lineTo(gx, height);
      ctx.stroke();
    }
    for (let gy = 0; gy < height; gy += 72) {
      ctx.beginPath();
      ctx.moveTo(0, gy);
      ctx.lineTo(width, gy);
      ctx.stroke();
    }
  }
  ctx.restore();

  // 2. Top Brand Header (Custom Uploaded Logo OR Geometric AI Badge + Brand Name)
  const padX = 76;
  let headerY = 74;
  if (logoImg && logoImg.complete && logoImg.naturalWidth > 0) {
    const targetH = 56;
    const targetW = Math.min(180, (logoImg.naturalWidth / logoImg.naturalHeight) * targetH);
    ctx.drawImage(logoImg, padX, headerY, targetW, targetH);
    ctx.fillStyle = config.textColor;
    ctx.font = "bold 28px system-ui, -apple-system, sans-serif";
    ctx.fillText(config.brandName, padX + targetW + 18, headerY + 38);
  } else {
    // Built-in geometric circuit/AI brand badge (like Do It With AI Tools logo)
    ctx.save();
    drawRoundedRect(ctx, padX, headerY, 54, 54, 14);
    ctx.fillStyle = config.accentColor;
    ctx.fill();
    ctx.fillStyle = config.bgColor;
    ctx.font = "900 24px system-ui, sans-serif";
    ctx.fillText("AI", padX + 13, headerY + 36);
    ctx.restore();

    ctx.fillStyle = config.textColor;
    ctx.font = "800 28px system-ui, -apple-system, sans-serif";
    ctx.fillText(config.brandName || "Do It With AI Tools", padX + 70, headerY + 36);
  }

  // Category Kicker Pill
  const kickerText = (slide.kicker || config.categoryKicker || `SLIDE 0${slide.number}`).toUpperCase();
  ctx.font = "800 21px system-ui, -apple-system, sans-serif";
  ctx.fillStyle = config.accentColor;
  ctx.fillText(kickerText, padX, headerY + 98);

  // 3. Giant Headline with Highlighted Phrase in Accent Color (like image_ad573d.png)
  ctx.font = "900 58px system-ui, -apple-system, sans-serif";
  const headLines = wrapCanvasText(ctx, slide.headline, width - padX * 2, 4);
  let y = headerY + 174;
  const hlLower = (slide.highlightPhrase || "").toLowerCase().trim();

  headLines.forEach((line, idx) => {
    const isHighlightedLine =
      (hlLower && line.toLowerCase().includes(hlLower)) ||
      (!hlLower && idx === headLines.length - 1 && headLines.length > 1);
    ctx.fillStyle = isHighlightedLine ? config.accentColor : config.textColor;
    ctx.fillText(line, padX, y);
    y += 70;
  });

  // 4. Subtitle / Lead Copy
  y += 10;
  ctx.font = "500 31px system-ui, -apple-system, sans-serif";
  ctx.fillStyle = config.textColor;
  ctx.globalAlpha = 0.9;
  const bodyLines = wrapCanvasText(ctx, slide.body, width - padX * 2, 3);
  for (const bl of bodyLines) {
    ctx.fillText(bl, padX, y);
    y += 44;
  }
  ctx.globalAlpha = 1;

  // 5. Center Visual Diagram / Connected UI Mockup Cards (modeled on image_ad573d.png & image_ad547a.png)
  const cardAreaTop = Math.max(y + 28, config.aspect === "portrait" ? 640 : 530);
  const cardAreaHeight = config.aspect === "portrait" ? 440 : 320;

  if (config.template === "before-after") {
    // Stacked BEFORE -> AFTER flow boxes with glowing border (like image_ad547a.png)
    const boxH = Math.floor((cardAreaHeight - 36) / 2);
    const drawFlowBox = (
      topY: number,
      badge: string,
      content: string,
      isAfter: boolean,
    ) => {
      ctx.save();
      drawRoundedRect(ctx, padX, topY, width - padX * 2, boxH, 24);
      ctx.fillStyle = config.cardBgColor;
      ctx.globalAlpha = isAfter ? 0.96 : 0.78;
      ctx.fill();
      ctx.lineWidth = isAfter ? 4 : 2;
      ctx.strokeStyle = isAfter ? config.accentColor : "rgba(255,255,255,0.25)";
      ctx.stroke();
      ctx.restore();

      ctx.fillStyle = isAfter ? config.accentColor : "#F59E0B";
      ctx.font = "800 22px system-ui, sans-serif";
      ctx.fillText(badge.toUpperCase(), padX + 32, topY + 46);

      ctx.fillStyle = "#FFFFFF";
      ctx.font = "600 28px system-ui, sans-serif";
      const lines = wrapCanvasText(ctx, content, width - padX * 2 - 64, 2);
      lines.forEach((l, lIdx) => {
        ctx.fillText(l, padX + 32, topY + 92 + lIdx * 38);
      });
    };

    drawFlowBox(
      cardAreaTop,
      slide.cardLeftTitle || "BEFORE / WITHOUT SYSTEM",
      slide.cardLeftBody,
      false,
    );
    drawFlowBox(
      cardAreaTop + boxH + 32,
      slide.cardRightTitle || "AFTER / CONNECTED SYSTEM",
      slide.cardRightBody,
      true,
    );
  } else {
    // Two Overlapping / Connected macOS-style UI Cards + Curved Arrow (like image_ad573d.png)
    const cardW = 470;
    const cardH = config.aspect === "portrait" ? 250 : 210;
    const leftX = padX;
    const leftY = cardAreaTop;
    const rightX = width - padX - cardW;
    const rightY = cardAreaTop + (config.aspect === "portrait" ? 150 : 90);

    // Left / Upper Card (Light elevated window)
    ctx.save();
    ctx.shadowColor = "rgba(0, 0, 0, 0.28)";
    ctx.shadowBlur = 28;
    ctx.shadowOffsetY = 12;
    drawRoundedRect(ctx, leftX, leftY, cardW, cardH, 24);
    ctx.fillStyle = "#FFFFFF";
    ctx.fill();
    ctx.restore();

    // macOS window dots on Left Card
    const dotColors = ["#EF4444", "#F59E0B", "#10B981"];
    dotColors.forEach((dc, dIdx) => {
      ctx.beginPath();
      ctx.arc(leftX + 32 + dIdx * 22, leftY + 30, 6, 0, Math.PI * 2);
      ctx.fillStyle = dc;
      ctx.fill();
    });

    ctx.fillStyle = "#475569";
    ctx.font = "800 18px system-ui, sans-serif";
    ctx.fillText(
      (slide.cardLeftTitle || "YOUR SOURCE INPUT").toUpperCase(),
      leftX + 28,
      leftY + 72,
    );

    ctx.fillStyle = "#0F172A";
    ctx.font = "700 26px system-ui, sans-serif";
    const leftLines = wrapCanvasText(ctx, slide.cardLeftBody, cardW - 56, 3);
    leftLines.forEach((ll, lIdx) => {
      ctx.fillText(ll, leftX + 28, leftY + 114 + lIdx * 36);
    });

    // Right / Lower Card (Dark glass window with accent border)
    ctx.save();
    ctx.shadowColor = "rgba(0, 0, 0, 0.35)";
    ctx.shadowBlur = 32;
    ctx.shadowOffsetY = 14;
    drawRoundedRect(ctx, rightX, rightY, cardW, cardH, 24);
    ctx.fillStyle = config.cardBgColor || "#0F172A";
    ctx.fill();
    ctx.lineWidth = 3;
    ctx.strokeStyle = config.accentColor;
    ctx.stroke();
    ctx.restore();

    dotColors.forEach((dc, dIdx) => {
      ctx.beginPath();
      ctx.arc(rightX + 32 + dIdx * 22, rightY + 30, 6, 0, Math.PI * 2);
      ctx.fillStyle = dc;
      ctx.fill();
    });

    ctx.fillStyle = config.accentColor;
    ctx.font = "800 18px system-ui, sans-serif";
    ctx.fillText(
      (slide.cardRightTitle || "RESULTING SYSTEM").toUpperCase(),
      rightX + 28,
      rightY + 72,
    );

    ctx.fillStyle = "#FFFFFF";
    ctx.font = "700 26px system-ui, sans-serif";
    const rightLines = wrapCanvasText(ctx, slide.cardRightBody, cardW - 56, 3);
    rightLines.forEach((rl, rIdx) => {
      ctx.fillText(rl, rightX + 28, rightY + 114 + rIdx * 36);
    });

    // Glowing Curved Connector Arrow between Left Card and Right Card
    ctx.save();
    ctx.strokeStyle = config.accentColor;
    ctx.lineWidth = 7;
    ctx.lineCap = "round";
    const startX = leftX + cardW * 0.52;
    const startY = leftY + cardH - 18;
    const endX = rightX - 16;
    const endY = rightY + cardH * 0.52;
    ctx.beginPath();
    ctx.moveTo(startX, startY);
    ctx.quadraticCurveTo(startX + 20, endY, endX, endY);
    ctx.stroke();

    // Arrowhead
    ctx.beginPath();
    ctx.moveTo(endX - 18, endY - 14);
    ctx.lineTo(endX + 2, endY);
    ctx.lineTo(endX - 18, endY + 14);
    ctx.stroke();
    ctx.restore();
  }

  // 6. Bottom Footer Bar: Actionable Takeaway + Domain + Slide Counter (01 / 08)
  const footerY = height - 125;
  ctx.fillStyle = config.textColor;
  ctx.font = "800 30px system-ui, -apple-system, sans-serif";
  ctx.fillText(slide.footer.slice(0, 56), padX, footerY);

  ctx.fillStyle = config.accentColor;
  ctx.font = "700 25px system-ui, -apple-system, sans-serif";
  ctx.fillText(config.websiteUrl || "doitwithai.tools", padX, height - 62);

  const counterStr = `${String(slide.number).padStart(2, "0")} / ${String(totalSlides).padStart(2, "0")}`;
  ctx.fillStyle = config.textColor;
  ctx.font = "800 25px system-ui, -apple-system, sans-serif";
  const cw = ctx.measureText(counterStr).width;
  ctx.fillText(counterStr, width - padX - cw, height - 62);

  return canvas;
}

export default function RepurposePanel({
  article,
  format,
  autoRunSignal = 0,
}: {
  article: Article;
  format: Exclude<ConversionFormat, "pdf" | "docx" | "audio">;
  autoRunSignal?: number;
}) {
  // Video Script options
  const [videoMode, setVideoMode] = useState<"youtube" | "shorts">("youtube");
  const [videoWpm, setVideoWpm] = useState<120 | 140 | 160>(140);
  const [videoHook, setVideoHook] = useState(0);
  const [videoCta, setVideoCta] = useState(
    "If you want the complete written breakdown and checklist, visit the link in the description.",
  );
  const [videoViewMode, setVideoViewMode] = useState<"storyboard" | "voiceover">(
    "storyboard",
  );

  // Social Posts options
  const [socialAngle, setSocialAngle] = useState<
    "takeaways" | "educational" | "discussion"
  >("takeaways");
  const [socialIncludeLink, setSocialIncludeLink] = useState(true);
  const [selectedIdeaByPlatform, setSelectedIdeaByPlatform] = useState<
    Record<string, number>
  >({});

  // Markdown options
  const [mdFrontmatter, setMdFrontmatter] = useState(true);
  const [mdReferences, setMdReferences] = useState(true);

  // EPUB options
  const [epubTheme, setEpubTheme] = useState<"serif" | "sans">("serif");
  const [epubLang, setEpubLang] = useState("en");

  // Newsletter options
  const [newsletterStyle, setNewsletterStyle] = useState<
    "executive" | "founder" | "checklist"
  >("executive");

  // Grand LinkedIn Carousel Studio options
  const [carouselConfig, setCarouselConfig] = useState<CarouselBrandConfig>({
    ...CAROUSEL_THEME_PRESETS["saas-comparison"],
    brandName: "Do It With AI Tools",
    websiteUrl: "doitwithai.tools",
    categoryKicker: "AI & SEO PLAYBOOK",
    aspect: "portrait",
  });
  const [carouselCount, setCarouselCount] = useState(8);
  const [slidePreviewUrls, setSlidePreviewUrls] = useState<string[]>([]);
  const logoImageRef = useRef<HTMLImageElement | null>(null);

  // Podcast Script options
  const [podcastMode, setPodcastMode] = useState<"cohost" | "solo">("cohost");
  const [podcastWpm, setPodcastWpm] = useState<130 | 150 | 170>(150);

  // Generated Draft State
  const [videoDraft, setVideoDraft] = useState<VideoScriptDraft | null>(null);
  const [socialDraft, setSocialDraft] = useState<SocialPost[] | null>(null);
  const [markdownText, setMarkdownText] = useState("");
  const [newsletterDraft, setNewsletterDraft] =
    useState<NewsletterDraft | null>(null);
  const [carouselSlides, setCarouselSlides] = useState<CarouselSlide[] | null>(
    null,
  );
  const [podcastDraft, setPodcastDraft] = useState<PodcastScriptDraft | null>(
    null,
  );

  const [assets, setAssets] = useState<DownloadAsset[]>([]);
  const [aiBusy, setAiBusy] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [revision, setRevision] = useState(0);
  const doneRef = useRef<HTMLElement>(null);

  const baseName = filename(article.title).replace(/\.pdf$/, "");

  const updateCarouselPreviewsAndAssets = useCallback(
    (slides: CarouselSlide[], cfg: CarouselBrandConfig) => {
      if (typeof document === "undefined" || !slides.length) return;
      const previewUrls: string[] = [];
      const pngEntries: Record<string, Uint8Array> = {};
      const jpegPages: Array<{ bytes: Uint8Array; width: number; height: number }> = [];

      slides.forEach((s, i) => {
        const numbered = { ...s, number: i + 1 };
        const canvas = renderSlideCanvas(
          numbered,
          slides.length,
          cfg,
          logoImageRef.current,
        );
        const pngUrl = canvas.toDataURL("image/png");
        previewUrls.push(pngUrl);

        const pngB64 = pngUrl.split(",")[1] || "";
        if (pngB64) {
          const bin = atob(pngB64);
          const bytes = new Uint8Array(bin.length);
          for (let k = 0; k < bin.length; k++) bytes[k] = bin.charCodeAt(k);
          pngEntries[`slide-${String(i + 1).padStart(2, "0")}.png`] = bytes;
        }

        const jpgUrl = canvas.toDataURL("image/jpeg", 0.92);
        const jpgB64 = jpgUrl.split(",")[1] || "";
        if (jpgB64) {
          const bin = atob(jpgB64);
          const bytes = new Uint8Array(bin.length);
          for (let k = 0; k < bin.length; k++) bytes[k] = bin.charCodeAt(k);
          jpegPages.push({
            bytes,
            width: canvas.width,
            height: canvas.height,
          });
        }
      });

      setSlidePreviewUrls(previewUrls);

      const pageH = cfg.aspect === "portrait" ? 675 : 540;
      const pdfBytes =
        jpegPages.length > 0
          ? buildRasterCarouselPdf(jpegPages, 540, pageH)
          : carouselPdf(slides, cfg, cfg.aspect);
      const zipBytes = zipStored(pngEntries);

      setAssets((old) => {
        for (const a of old) URL.revokeObjectURL(a.url);
        return [
          {
            label: "Download Carousel PDF (.pdf)",
            url: URL.createObjectURL(
              new Blob([pdfBytes], { type: "application/pdf" }),
            ),
            downloadName: `${baseName}-linkedin-carousel.pdf`,
            primary: true,
          },
          {
            label: "Download All Slide PNGs (.zip)",
            url: URL.createObjectURL(
              new Blob([zipBytes], { type: "application/zip" }),
            ),
            downloadName: `${baseName}-carousel-slides.zip`,
          },
        ];
      });
    },
    [baseName],
  );

  const rebuildNonCarouselDownloads = useCallback(
    (
      nextVideo = videoDraft,
      nextSocial = socialDraft,
      nextMd = markdownText,
      nextNewsletter = newsletterDraft,
      nextPodcast = podcastDraft,
    ) => {
      const nextAssets: DownloadAsset[] = [];

      if (format === "video-script" && nextVideo) {
        const txt = videoScriptTxt(article, nextVideo);
        const docx = videoScriptDocx(article, nextVideo);
        const voiceoverOnly = nextVideo.scenes.map((s) => s.narration).join("\n\n");
        nextAssets.push(
          {
            label: "Download Storyboard DOCX (.docx)",
            url: URL.createObjectURL(new Blob([docx], { type: docxMime })),
            downloadName: `${baseName}-video-script.docx`,
            primary: true,
          },
          {
            label: "Download Full Storyboard (.txt)",
            url: URL.createObjectURL(
              new Blob([txt], { type: "text/plain;charset=utf-8" }),
            ),
            downloadName: `${baseName}-video-storyboard.txt`,
          },
          {
            label: "Download Voiceover Only (.txt)",
            url: URL.createObjectURL(
              new Blob([voiceoverOnly], { type: "text/plain;charset=utf-8" }),
            ),
            downloadName: `${baseName}-voiceover-only.txt`,
          },
        );
      } else if (format === "social-posts" && nextSocial) {
        const txt = socialPostsTxt(article, nextSocial);
        const csv = socialPostsCsv(article, nextSocial);
        nextAssets.push(
          {
            label: "Download All 15 Ideas CSV (.csv)",
            url: URL.createObjectURL(
              new Blob([csv], { type: "text/csv;charset=utf-8" }),
            ),
            downloadName: `${baseName}-social-posts.csv`,
            primary: true,
          },
          {
            label: "Download Campaign Pack (.txt)",
            url: URL.createObjectURL(
              new Blob([txt], { type: "text/plain;charset=utf-8" }),
            ),
            downloadName: `${baseName}-social-posts.txt`,
          },
        );
      } else if (format === "markdown" && nextMd) {
        nextAssets.push(
          {
            label: "Download Markdown (.md)",
            url: URL.createObjectURL(
              new Blob([nextMd], { type: "text/markdown;charset=utf-8" }),
            ),
            downloadName: `${baseName}.md`,
            primary: true,
          },
          {
            label: "Download Plain Text (.txt)",
            url: URL.createObjectURL(
              new Blob([nextMd], { type: "text/plain;charset=utf-8" }),
            ),
            downloadName: `${baseName}.txt`,
          },
        );
      } else if (format === "epub") {
        const { epubBytes, xhtml } = articleToEpub(article, {
          theme: epubTheme,
          lang: epubLang,
        });
        nextAssets.push(
          {
            label: "Download EPUB E-Book (.epub)",
            url: URL.createObjectURL(
              new Blob([epubBytes], { type: "application/epub+zip" }),
            ),
            downloadName: `${baseName}.epub`,
            primary: true,
          },
          {
            label: "Download XHTML Copy (.xhtml)",
            url: URL.createObjectURL(
              new Blob([xhtml], { type: "application/xhtml+xml;charset=utf-8" }),
            ),
            downloadName: `${baseName}.xhtml`,
          },
        );
      } else if (format === "newsletter" && nextNewsletter) {
        const html = newsletterHtml(article, nextNewsletter);
        const txt = newsletterTxt(article, nextNewsletter);
        const docx = newsletterDocx(article, nextNewsletter);
        nextAssets.push(
          {
            label: "Download HTML Email (.html)",
            url: URL.createObjectURL(
              new Blob([html], { type: "text/html;charset=utf-8" }),
            ),
            downloadName: `${baseName}-newsletter.html`,
            primary: true,
          },
          {
            label: "Download Word Draft (.docx)",
            url: URL.createObjectURL(new Blob([docx], { type: docxMime })),
            downloadName: `${baseName}-newsletter.docx`,
          },
          {
            label: "Download Plain Text (.txt)",
            url: URL.createObjectURL(
              new Blob([txt], { type: "text/plain;charset=utf-8" }),
            ),
            downloadName: `${baseName}-newsletter.txt`,
          },
        );
      } else if (format === "podcast-script" && nextPodcast) {
        const txt = podcastScriptTxt(article, nextPodcast);
        const docx = podcastScriptDocx(article, nextPodcast);
        nextAssets.push(
          {
            label: "Download Podcast Script (.docx)",
            url: URL.createObjectURL(new Blob([docx], { type: docxMime })),
            downloadName: `${baseName}-podcast-script.docx`,
            primary: true,
          },
          {
            label: "Download Script & Show Notes (.txt)",
            url: URL.createObjectURL(
              new Blob([txt], { type: "text/plain;charset=utf-8" }),
            ),
            downloadName: `${baseName}-podcast-script.txt`,
          },
        );
      }

      setAssets((old) => {
        for (const a of old) URL.revokeObjectURL(a.url);
        return nextAssets;
      });
    },
    [article, baseName, epubLang, epubTheme, format, markdownText, newsletterDraft, podcastDraft, socialDraft, videoDraft],
  );

  const generateAll = useCallback(
    async (withAiEnhance = true) => {
      const err = validate(article);
      setError(err);
      if (err) return;

      try {
        if (format === "video-script") {
          const local = buildVideoScript(
            article,
            videoMode,
            videoWpm,
            videoHook,
            videoCta,
          );
          setVideoDraft(local);
          rebuildNonCarouselDownloads(local, null, "", null, null);
          setMessage(
            "Video script and sentence-by-sentence visual storyboard ready! Download your DOCX or TXT above.",
          );
        } else if (format === "social-posts") {
          const local = buildSocialPosts(article, socialAngle, socialIncludeLink);
          setSocialDraft(local);
          rebuildNonCarouselDownloads(null, local, "", null, null);
          setMessage(
            "15 social media post ideas across 5 platforms are ready! Switch ideas or download the CSV/TXT pack above.",
          );
        } else if (format === "markdown") {
          const md = articleToMarkdown(article, {
            includeFrontmatter: mdFrontmatter,
            includeReferences: mdReferences,
          });
          setMarkdownText(md);
          rebuildNonCarouselDownloads(null, null, md, null, null);
          setMessage("Markdown file ready! Download your .md or .txt file above.");
        } else if (format === "epub") {
          rebuildNonCarouselDownloads(null, null, "", null, null);
          setMessage("EPUB 3 e-book ready! Download your .epub file above.");
        } else if (format === "newsletter") {
          const local = buildNewsletter(article, newsletterStyle);
          setNewsletterDraft(local);
          rebuildNonCarouselDownloads(null, null, "", local, null);
          setMessage(
            "Newsletter edition ready! Choose from 5 subject lines and download HTML, DOCX, or TXT above.",
          );
        } else if (format === "linkedin-carousel") {
          const localSlides = buildLinkedinCarousel(article, carouselCount);
          setCarouselSlides(localSlides);
          updateCarouselPreviewsAndAssets(localSlides, carouselConfig);
          setMessage(
            "LinkedIn Carousel Studio ready! Customize templates, brand colors, or upload your logo, then download the PDF or PNG slides.",
          );
        } else if (format === "podcast-script") {
          const local = buildPodcastScript(article, podcastMode, podcastWpm);
          setPodcastDraft(local);
          rebuildNonCarouselDownloads(null, null, "", null, local);
          setMessage(
            "Broadcast podcast script and show notes ready! Download DOCX or TXT above.",
          );
        }

        // Optional background AI enhancement via /api/ai-tools/article-repurpose
        if (
          withAiEnhance &&
          ["video-script", "social-posts", "newsletter", "linkedin-carousel", "podcast-script"].includes(
            format,
          ) &&
          typeof window !== "undefined"
        ) {
          setAiBusy(true);
          try {
            const articleText = article.blocks
              .map((b) => (b.kind === "heading" ? `## ${b.text}` : b.text))
              .filter(Boolean)
              .join("\n\n")
              .slice(0, 24000);
            const res = await fetch("/api/ai-tools/article-repurpose", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                format,
                title: article.title,
                source: article.source,
                articleText,
                options: {
                  mode: videoMode,
                  cta: videoCta,
                  angle: socialAngle,
                  style: newsletterStyle,
                  slideCount: carouselCount,
                  format: podcastMode,
                },
              }),
            });
            if (res.ok) {
              const data = await res.json();
              if (data?.result) {
                if (format === "video-script" && Array.isArray(data.result.scenes)) {
                  const aiScenes = data.result.scenes.map((sc: any, sIdx: number) => {
                    const beats = (sc.beats || []).map((b: any, bIdx: number) => {
                      const words = countWords(b.spokenSentence || "");
                      return {
                        id: `ai-beat-${sIdx + 1}-${bIdx + 1}`,
                        spokenSentence: b.spokenSentence,
                        visualType: b.visualType || "B-ROLL VIDEO",
                        visualDirection: b.visualDirection,
                        onScreenText: b.onScreenText,
                        seconds: Math.max(2, Math.ceil((words / videoWpm) * 60)),
                      };
                    });
                    const narration = beats.map((b: any) => b.spokenSentence).join(" ");
                    const seconds = beats.reduce((n: number, b: any) => n + b.seconds, 0);
                    return {
                      id: `ai-scene-${sIdx + 1}`,
                      title: sc.title,
                      narration,
                      visual: beats.map((b: any) => `[${b.visualType}] ${b.visualDirection}`).join(" | "),
                      onScreenText: beats[0]?.onScreenText || sc.title,
                      seconds,
                      beats,
                    };
                  });
                  const enhanced: VideoScriptDraft = {
                    mode: videoMode,
                    wpm: videoWpm,
                    hookIndex: videoHook,
                    cta: videoCta,
                    scenes: aiScenes,
                    totalWords: aiScenes.reduce((n: number, s: any) => n + countWords(s.narration), 0),
                    totalSeconds: aiScenes.reduce((n: number, s: any) => n + s.seconds, 0),
                  };
                  setVideoDraft(enhanced);
                  rebuildNonCarouselDownloads(enhanced, null, "", null, null);
                } else if (format === "social-posts" && Array.isArray(data.result.posts)) {
                  const enhanced: SocialPost[] = data.result.posts.map((p: any, idx: number) => ({
                    id: `ai-social-${idx}`,
                    platform: p.platform,
                    angle: socialAngle,
                    content: p.ideas?.[0]?.content || "",
                    charLimit: p.platform === "Threads" ? 500 : 3000,
                    ideas: (p.ideas || []).map((idObj: any, iIdx: number) => ({
                      id: `ai-idea-${idx}-${iIdx}`,
                      label: idObj.label,
                      content: idObj.content,
                    })),
                  }));
                  setSocialDraft(enhanced);
                  rebuildNonCarouselDownloads(null, enhanced, "", null, null);
                } else if (format === "newsletter" && data.result.subjectOptions) {
                  const enhanced: NewsletterDraft = {
                    style: newsletterStyle,
                    subjectOptions: data.result.subjectOptions,
                    selectedSubject: data.result.subjectOptions[0],
                    preheader: data.result.preheader,
                    greeting: "Hello,",
                    intro: data.result.intro,
                    whyItMatters: data.result.whyItMatters,
                    takeaways: data.result.takeaways,
                    sections: data.result.sections,
                    checklist: data.result.checklist,
                    ctaLabel: "Read the full article on our website →",
                    ctaUrl: article.source || "https://doitwithai.tools",
                  };
                  setNewsletterDraft(enhanced);
                  rebuildNonCarouselDownloads(null, null, "", enhanced, null);
                } else if (format === "linkedin-carousel" && Array.isArray(data.result.slides)) {
                  const enhanced: CarouselSlide[] = data.result.slides.map(
                    (s: any, idx: number) => ({
                      number: idx + 1,
                      kind: s.kind || "point",
                      kicker: s.kicker || `SLIDE 0${idx + 1}`,
                      headline: s.headline,
                      highlightPhrase: s.highlightPhrase,
                      body: s.body,
                      cardLeftTitle: s.cardLeftTitle,
                      cardLeftBody: s.cardLeftBody,
                      cardRightTitle: s.cardRightTitle,
                      cardRightBody: s.cardRightBody,
                      footer: s.footer,
                    }),
                  );
                  setCarouselSlides(enhanced);
                  updateCarouselPreviewsAndAssets(enhanced, carouselConfig);
                } else if (format === "podcast-script" && Array.isArray(data.result.segments)) {
                  const segs = data.result.segments.map((s: any, idx: number) => ({
                    id: `ai-pod-${idx + 1}`,
                    speaker: s.speaker,
                    topic: s.topic,
                    dialogue: s.dialogue,
                    cue: s.cue,
                    seconds: Math.max(4, Math.ceil((countWords(s.dialogue) / podcastWpm) * 60)),
                  }));
                  const enhanced: PodcastScriptDraft = {
                    format: podcastMode,
                    wpm: podcastWpm,
                    showNotes: data.result.showNotes || [],
                    segments: segs,
                    totalWords: segs.reduce((n: number, s: any) => n + countWords(s.dialogue), 0),
                    totalSeconds: segs.reduce((n: number, s: any) => n + s.seconds, 0),
                  };
                  setPodcastDraft(enhanced);
                  rebuildNonCarouselDownloads(null, null, "", null, enhanced);
                }
              }
            }
          } catch {
            // Keep rich local synthesis if offline
          } finally {
            setAiBusy(false);
          }
        }
        setRevision((n) => n + 1);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Conversion failed.");
      }
    },
    [
      article,
      carouselConfig,
      carouselCount,
      format,
      mdFrontmatter,
      mdReferences,
      newsletterStyle,
      podcastMode,
      podcastWpm,
      rebuildNonCarouselDownloads,
      socialAngle,
      socialIncludeLink,
      updateCarouselPreviewsAndAssets,
      videoCta,
      videoHook,
      videoMode,
      videoWpm,
    ],
  );

  // Auto-generate immediately when article is imported (2-Step Direct Flow!)
  const hasAutoRunRef = useRef(-1);
  useEffect(() => {
    if (hasAutoRunRef.current !== autoRunSignal) {
      hasAutoRunRef.current = autoRunSignal;
      generateAll(true);
    }
  }, [autoRunSignal, generateAll]);

  useEffect(() => {
    if (revision === 1) focusToolSection(doneRef.current);
  }, [revision]);

  function handleLogoUpload(file: File | undefined) {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = typeof reader.result === "string" ? reader.result : "";
      if (!dataUrl) return;
      const img = new Image();
      img.onload = () => {
        logoImageRef.current = img;
        const nextCfg = { ...carouselConfig, logoDataUrl: dataUrl };
        setCarouselConfig(nextCfg);
        if (carouselSlides) {
          updateCarouselPreviewsAndAssets(carouselSlides, nextCfg);
        }
      };
      img.src = dataUrl;
    };
    reader.readAsDataURL(file);
  }

  async function copyText(text: string) {
    try {
      await navigator.clipboard.writeText(text);
      setMessage("Copied to clipboard.");
    } catch {
      setError("Clipboard access was denied. Use the download button instead.");
    }
  }

  return (
    <div className="space-y-6">
      {/* STEP 2 TOP DOWNLOAD & INTERACTIVE STUDIO PANEL (Ready immediately after Step 1!) */}
      {assets.length > 0 && (
        <section
          ref={doneRef}
          tabIndex={-1}
          aria-labelledby="repurpose-result-title"
          className="scroll-mt-28 rounded-2xl border-2 border-[#3452d1] bg-blue-50/30 p-5 focus:outline focus:outline-2 focus:outline-[#5271ff] dark:border-[#5271ff] dark:bg-blue-950/20 sm:p-7"
        >
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 pb-5 dark:border-slate-700">
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-[#9A3412] dark:text-[#FDBA74]">
                Step 2 · Ready to download &amp; customize
                {aiBusy ? " · Refining with deep synthesis…" : ""}
              </p>
              <h2
                id="repurpose-result-title"
                className="mt-1 text-2xl font-extrabold"
              >
                {article.title}
              </h2>
            </div>
            <div className="flex flex-wrap gap-3">
              {assets.map((a) => (
                <a
                  key={a.downloadName}
                  href={a.url}
                  download={a.downloadName}
                  className={a.primary ? primary : button}
                >
                  <Download size={16} aria-hidden />
                  {a.label}
                </a>
              ))}
            </div>
          </div>

          {message && (
            <p role="status" className="mt-4 text-sm font-semibold text-slate-700 dark:text-slate-200">
              {message}
            </p>
          )}
          {error && (
            <p role="alert" className="mt-4 text-sm font-bold text-red-700 dark:text-red-300">
              {error}
            </p>
          )}

          {/* ============================================================== */}
          {/* 1. VIDEO SCRIPT STUDIO UI                                      */}
          {/* ============================================================== */}
          {format === "video-script" && videoDraft && (
            <div className="mt-6 space-y-5">
              <div className="grid gap-4 rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-900 sm:grid-cols-4">
                <div>
                  <label htmlFor="video-mode" className="mb-1 block text-xs font-bold">
                    Video Format
                  </label>
                  <select
                    id="video-mode"
                    className={field}
                    value={videoMode}
                    onChange={(e) => {
                      const nextMode = e.target.value as "youtube" | "shorts";
                      setVideoMode(nextMode);
                      const d = buildVideoScript(
                        article,
                        nextMode,
                        videoWpm,
                        videoHook,
                        videoCta,
                      );
                      setVideoDraft(d);
                      rebuildNonCarouselDownloads(d, null, "", null, null);
                    }}
                  >
                    <option value="youtube">YouTube Full Deep-Dive (All Sections)</option>
                    <option value="shorts">Shorts / Reels / TikTok (60–90s)</option>
                  </select>
                </div>
                <div>
                  <label htmlFor="video-wpm" className="mb-1 block text-xs font-bold">
                    Speaking Pace
                  </label>
                  <select
                    id="video-wpm"
                    className={field}
                    value={videoWpm}
                    onChange={(e) => {
                      const nextWpm = Number(e.target.value) as 120 | 140 | 160;
                      setVideoWpm(nextWpm);
                      const d = buildVideoScript(
                        article,
                        videoMode,
                        nextWpm,
                        videoHook,
                        videoCta,
                      );
                      setVideoDraft(d);
                      rebuildNonCarouselDownloads(d, null, "", null, null);
                    }}
                  >
                    <option value={120}>120 WPM (Deliberate)</option>
                    <option value={140}>140 WPM (Natural YouTube)</option>
                    <option value={160}>160 WPM (Fast / Energetic)</option>
                  </select>
                </div>
                <div>
                  <label htmlFor="video-hook" className="mb-1 block text-xs font-bold">
                    Opening Hook Angle
                  </label>
                  <select
                    id="video-hook"
                    className={field}
                    value={videoHook}
                    onChange={(e) => {
                      const nextH = Number(e.target.value);
                      setVideoHook(nextH);
                      const d = buildVideoScript(
                        article,
                        videoMode,
                        videoWpm,
                        nextH,
                        videoCta,
                      );
                      setVideoDraft(d);
                      rebuildNonCarouselDownloads(d, null, "", null, null);
                    }}
                  >
                    <option value={0}>Problem → Solution Hook</option>
                    <option value={1}>Direct Premise Hook</option>
                    <option value={2}>Mistake / Warning Hook</option>
                  </select>
                </div>
                <div className="flex items-end gap-2">
                  <button
                    type="button"
                    className={`${button} w-full`}
                    onClick={() =>
                      setVideoViewMode((m) =>
                        m === "storyboard" ? "voiceover" : "storyboard",
                      )
                    }
                  >
                    {videoViewMode === "storyboard"
                      ? "Switch to Teleprompter View"
                      : "Switch to Visual Storyboard"}
                  </button>
                </div>
              </div>

              <div className="flex flex-wrap items-center justify-between gap-3">
                <p className="text-sm font-bold">
                  {videoDraft.scenes.length} Scenes ·{" "}
                  {videoDraft.scenes.reduce((n, s) => n + (s.beats?.length || 1), 0)}{" "}
                  Sentence-by-Sentence Visual Beats · {videoDraft.totalWords} words (~
                  {Math.floor(videoDraft.totalSeconds / 60)}m{" "}
                  {videoDraft.totalSeconds % 60}s)
                </p>
                <button
                  type="button"
                  className={button}
                  onClick={() => copyText(videoScriptTxt(article, videoDraft))}
                >
                  <Copy size={15} aria-hidden />
                  Copy Complete Script
                </button>
              </div>

              {videoViewMode === "voiceover" ? (
                <div className="rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-700 dark:bg-slate-900">
                  <h3 className="text-base font-bold">
                    Clean Teleprompter / Voiceover Script
                  </h3>
                  <textarea
                    rows={16}
                    className={`${field} mt-3 font-sans text-base leading-8`}
                    value={videoDraft.scenes
                      .map((s) => `[${s.title}]\n${s.narration}`)
                      .join("\n\n")}
                    readOnly
                  />
                </div>
              ) : (
                <div className="max-h-[620px] space-y-5 overflow-y-auto pr-1">
                  {videoDraft.scenes.map((scene, sIdx) => (
                    <div
                      key={scene.id}
                      className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-700 dark:bg-slate-900"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3 dark:border-slate-800">
                        <h3 className="text-base font-extrabold text-[#9A3412] dark:text-[#FDBA74]">
                          {scene.title}
                        </h3>
                        <span className="rounded-lg bg-orange-100 px-3 py-1 text-xs font-bold text-[#9A3412] dark:bg-orange-950/60 dark:text-orange-200">
                          ~{scene.seconds}s · {scene.beats?.length || 1} sentence beats
                        </span>
                      </div>

                      <div className="mt-4 space-y-4">
                        {(scene.beats || []).map((beat, bIdx) => (
                          <div
                            key={beat.id}
                            className="grid gap-4 rounded-xl border border-slate-200/80 bg-slate-50/60 p-4 dark:border-slate-800 dark:bg-slate-800/40 lg:grid-cols-[1.15fr_0.85fr]"
                          >
                            <div>
                              <div className="flex items-center justify-between gap-2">
                                <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                                  Spoken Sentence {sIdx + 1}.{bIdx + 1} (~{beat.seconds}s)
                                </span>
                              </div>
                              <textarea
                                rows={3}
                                className={`${field} mt-2 bg-white dark:bg-slate-900`}
                                value={beat.spokenSentence}
                                onChange={(e) => {
                                  const nextScenes = videoDraft.scenes.map(
                                    (sc, i) => {
                                      if (i !== sIdx) return sc;
                                      const nextBeats = sc.beats.map((b, j) =>
                                        j === bIdx
                                          ? { ...b, spokenSentence: e.target.value }
                                          : b,
                                      );
                                      return {
                                        ...sc,
                                        beats: nextBeats,
                                        narration: nextBeats
                                          .map((b) => b.spokenSentence)
                                          .join(" "),
                                      };
                                    },
                                  );
                                  const next = { ...videoDraft, scenes: nextScenes };
                                  setVideoDraft(next);
                                  rebuildNonCarouselDownloads(
                                    next,
                                    null,
                                    "",
                                    null,
                                    null,
                                  );
                                }}
                              />
                            </div>
                            <div className="flex flex-col justify-between rounded-xl border border-blue-200/70 bg-blue-50/40 p-3.5 dark:border-blue-900/50 dark:bg-blue-950/20">
                              <div>
                                <span className="inline-block rounded-md bg-[#3452d1] px-2.5 py-0.5 text-[11px] font-extrabold uppercase tracking-wider text-white">
                                  {beat.visualType}
                                </span>
                                <p className="mt-2 text-xs leading-6 text-slate-700 dark:text-slate-200">
                                  <strong>What to show in background:</strong>{" "}
                                  {beat.visualDirection}
                                </p>
                              </div>
                              <p className="mt-2 border-t border-blue-200/60 pt-2 text-xs font-semibold text-[#3452d1] dark:border-blue-900/50 dark:text-blue-300">
                                On-Screen Text: &ldquo;{beat.onScreenText}&rdquo;
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ============================================================== */}
          {/* 2. SOCIAL MEDIA MULTI-IDEA STUDIO UI                           */}
          {/* ============================================================== */}
          {format === "social-posts" && socialDraft && (
            <div className="mt-6 space-y-5">
              <div className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-900">
                <div className="flex flex-wrap items-center gap-4">
                  <label htmlFor="social-angle" className="text-sm font-bold">
                    Default Angle:
                  </label>
                  <select
                    id="social-angle"
                    className="rounded-xl border border-slate-300 bg-transparent px-3 py-2 text-sm font-semibold dark:border-slate-600"
                    value={socialAngle}
                    onChange={(e) => {
                      const nextAngle = e.target.value as
                        | "takeaways"
                        | "educational"
                        | "discussion";
                      setSocialAngle(nextAngle);
                      const nextPosts = buildSocialPosts(
                        article,
                        nextAngle,
                        socialIncludeLink,
                      );
                      setSocialDraft(nextPosts);
                      rebuildNonCarouselDownloads(null, nextPosts, "", null, null);
                    }}
                  >
                    <option value="takeaways">
                      Idea 1 · Problem → Checklist &amp; Practical Review
                    </option>
                    <option value="educational">
                      Idea 2 · Contrarian Hook &amp; Deep-Dive
                    </option>
                    <option value="discussion">
                      Idea 3 · Before vs. After Playbook
                    </option>
                  </select>
                </div>
                <label className="flex items-center gap-2 text-sm font-semibold">
                  <input
                    type="checkbox"
                    className="h-5 w-5 accent-[#5271ff]"
                    checked={socialIncludeLink}
                    onChange={(e) => {
                      setSocialIncludeLink(e.target.checked);
                      const nextPosts = buildSocialPosts(
                        article,
                        socialAngle,
                        e.target.checked,
                      );
                      setSocialDraft(nextPosts);
                      rebuildNonCarouselDownloads(null, nextPosts, "", null, null);
                    }}
                  />
                  <span>Include article CTA link</span>
                </label>
              </div>

              <div className="grid gap-5 lg:grid-cols-2">
                {socialDraft.map((post, idx) => {
                  const activeIdeaIdx = selectedIdeaByPlatform[post.id] ?? 0;
                  const ideas = post.ideas || [];
                  return (
                    <div
                      key={post.id}
                      className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-700 dark:bg-slate-900"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <span className="text-base font-extrabold text-[#9A3412] dark:text-[#FDBA74]">
                          {post.platform}
                        </span>
                        <button
                          type="button"
                          className={button}
                          onClick={() => copyText(post.content)}
                        >
                          <Copy size={14} aria-hidden />
                          Copy {post.platform} Post
                        </button>
                      </div>

                      {ideas.length > 1 && (
                        <div className="mt-3 flex flex-wrap gap-2">
                          {ideas.map((idea, iIdx) => (
                            <button
                              key={idea.id}
                              type="button"
                              className={`rounded-lg border px-3 py-1.5 text-xs font-bold ${
                                activeIdeaIdx === iIdx
                                  ? "border-[#3452d1] bg-[#3452d1] text-white"
                                  : "border-slate-300 text-slate-700 dark:border-slate-600 dark:text-slate-200"
                              }`}
                              onClick={() => {
                                setSelectedIdeaByPlatform((old) => ({
                                  ...old,
                                  [post.id]: iIdx,
                                }));
                                const next = socialDraft.map((p, pIndex) =>
                                  pIndex === idx
                                    ? { ...p, content: idea.content }
                                    : p,
                                );
                                setSocialDraft(next);
                                rebuildNonCarouselDownloads(
                                  null,
                                  next,
                                  "",
                                  null,
                                  null,
                                );
                              }}
                            >
                              {idea.label}
                            </button>
                          ))}
                        </div>
                      )}

                      <textarea
                        rows={10}
                        className={`${field} mt-3 font-sans text-sm leading-6`}
                        value={post.content}
                        onChange={(e) => {
                          const next = socialDraft.map((p, i) =>
                            i === idx ? { ...p, content: e.target.value } : p,
                          );
                          setSocialDraft(next);
                          rebuildNonCarouselDownloads(null, next, "", null, null);
                        }}
                      />
                      <p className="mt-2 text-xs font-semibold text-slate-500">
                        {post.content.length} / {post.charLimit} characters
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* ============================================================== */}
          {/* 3. MARKDOWN STUDIO UI                                          */}
          {/* ============================================================== */}
          {format === "markdown" && (
            <div className="mt-6 space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div className="flex flex-wrap gap-5">
                  <label className="flex items-center gap-2 text-sm font-semibold">
                    <input
                      type="checkbox"
                      className="h-5 w-5 accent-[#5271ff]"
                      checked={mdFrontmatter}
                      onChange={(e) => {
                        setMdFrontmatter(e.target.checked);
                        const md = articleToMarkdown(article, {
                          includeFrontmatter: e.target.checked,
                          includeReferences: mdReferences,
                        });
                        setMarkdownText(md);
                        rebuildNonCarouselDownloads(null, null, md, null, null);
                      }}
                    />
                    <span>Include YAML frontmatter</span>
                  </label>
                  <label className="flex items-center gap-2 text-sm font-semibold">
                    <input
                      type="checkbox"
                      className="h-5 w-5 accent-[#5271ff]"
                      checked={mdReferences}
                      onChange={(e) => {
                        setMdReferences(e.target.checked);
                        const md = articleToMarkdown(article, {
                          includeFrontmatter: mdFrontmatter,
                          includeReferences: e.target.checked,
                        });
                        setMarkdownText(md);
                        rebuildNonCarouselDownloads(null, null, md, null, null);
                      }}
                    />
                    <span>Append reference links</span>
                  </label>
                </div>
                <button
                  type="button"
                  className={button}
                  onClick={() => copyText(markdownText)}
                >
                  <Copy size={15} aria-hidden />
                  Copy Markdown
                </button>
              </div>
              <textarea
                rows={14}
                className={`${field} bg-white font-mono text-xs dark:bg-slate-900`}
                value={markdownText}
                onChange={(e) => {
                  setMarkdownText(e.target.value);
                  rebuildNonCarouselDownloads(
                    null,
                    null,
                    e.target.value,
                    null,
                    null,
                  );
                }}
              />
            </div>
          )}

          {/* ============================================================== */}
          {/* 4. EPUB STUDIO UI                                              */}
          {/* ============================================================== */}
          {format === "epub" && (
            <div className="mt-6 grid gap-4 rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-900 sm:grid-cols-2">
              <div>
                <label htmlFor="epub-theme" className="mb-1 block text-xs font-bold">
                  E-Reader Typography
                </label>
                <select
                  id="epub-theme"
                  className={field}
                  value={epubTheme}
                  onChange={(e) => {
                    const nextT = e.target.value as "serif" | "sans";
                    setEpubTheme(nextT);
                    rebuildNonCarouselDownloads(null, null, "", null, null);
                  }}
                >
                  <option value="serif">Book Serif (Georgia / Times)</option>
                  <option value="sans">Clean Sans-Serif (System UI)</option>
                </select>
              </div>
              <div>
                <label htmlFor="epub-lang" className="mb-1 block text-xs font-bold">
                  Language Metadata Tag
                </label>
                <select
                  id="epub-lang"
                  className={field}
                  value={epubLang}
                  onChange={(e) => {
                    setEpubLang(e.target.value);
                    rebuildNonCarouselDownloads(null, null, "", null, null);
                  }}
                >
                  <option value="en">English (en)</option>
                  <option value="ur">Urdu (ur)</option>
                </select>
              </div>
            </div>
          )}

          {/* ============================================================== */}
          {/* 5. NEWSLETTER STUDIO UI                                        */}
          {/* ============================================================== */}
          {format === "newsletter" && newsletterDraft && (
            <div className="mt-6 space-y-5">
              <div className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-900">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="flex flex-wrap gap-2">
                    {(
                      [
                        ["executive", "Executive Briefing"],
                        ["founder", "Founder Deep-Dive"],
                        ["checklist", "Tactical Team Checklist"],
                      ] as const
                    ).map(([stId, stLabel]) => (
                      <button
                        key={stId}
                        type="button"
                        className={`rounded-lg border px-3 py-1.5 text-xs font-bold ${
                          newsletterStyle === stId
                            ? "border-[#3452d1] bg-[#3452d1] text-white"
                            : "border-slate-300 dark:border-slate-600"
                        }`}
                        onClick={() => {
                          setNewsletterStyle(stId);
                          const d = buildNewsletter(article, stId);
                          setNewsletterDraft(d);
                          rebuildNonCarouselDownloads(null, null, "", d, null);
                        }}
                      >
                        {stLabel}
                      </button>
                    ))}
                  </div>
                  <button
                    type="button"
                    className={button}
                    onClick={() =>
                      copyText(newsletterTxt(article, newsletterDraft))
                    }
                  >
                    <Copy size={15} aria-hidden />
                    Copy Newsletter Text
                  </button>
                </div>

                <div className="mt-4">
                  <p className="mb-2 text-xs font-bold uppercase text-slate-500">
                    Choose or edit subject line (5 angles):
                  </p>
                  <div className="mb-3 flex flex-wrap gap-2">
                    {newsletterDraft.subjectOptions.map((sub, sIdx) => (
                      <button
                        key={sIdx}
                        type="button"
                        className={`rounded-lg border px-3 py-1.5 text-left text-xs font-semibold ${
                          newsletterDraft.selectedSubject === sub
                            ? "border-[#9A3412] bg-orange-50 text-[#9A3412] dark:bg-orange-950/50 dark:text-orange-200"
                            : "border-slate-200 dark:border-slate-700"
                        }`}
                        onClick={() => {
                          const next = {
                            ...newsletterDraft,
                            selectedSubject: sub,
                          };
                          setNewsletterDraft(next);
                          rebuildNonCarouselDownloads(null, null, "", next, null);
                        }}
                      >
                        {sub}
                      </button>
                    ))}
                  </div>
                  <input
                    className={`${field} font-bold`}
                    value={newsletterDraft.selectedSubject}
                    onChange={(e) => {
                      const next = {
                        ...newsletterDraft,
                        selectedSubject: e.target.value,
                      };
                      setNewsletterDraft(next);
                      rebuildNonCarouselDownloads(null, null, "", next, null);
                    }}
                  />
                </div>

                <div className="mt-4 grid gap-4 md:grid-cols-2">
                  <div>
                    <label className="mb-1 block text-xs font-bold">
                      Opening Hook
                    </label>
                    <textarea
                      rows={4}
                      className={field}
                      value={newsletterDraft.intro}
                      onChange={(e) => {
                        const next = {
                          ...newsletterDraft,
                          intro: e.target.value,
                        };
                        setNewsletterDraft(next);
                        rebuildNonCarouselDownloads(null, null, "", next, null);
                      }}
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-xs font-bold">
                      Why This Matters Callout
                    </label>
                    <textarea
                      rows={4}
                      className={field}
                      value={newsletterDraft.whyItMatters}
                      onChange={(e) => {
                        const next = {
                          ...newsletterDraft,
                          whyItMatters: e.target.value,
                        };
                        setNewsletterDraft(next);
                        rebuildNonCarouselDownloads(null, null, "", next, null);
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ============================================================== */}
          {/* 6. GRAND LINKEDIN CAROUSEL STUDIO UI                           */}
          {/* ============================================================== */}
          {format === "linkedin-carousel" && carouselSlides && (
            <div className="mt-6 space-y-6">
              {/* Template Picker + Brand Color & Logo Studio */}
              <div className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-700 dark:bg-slate-900">
                <h3 className="text-base font-extrabold">
                  1. Choose a Carousel Design Template
                </h3>
                <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {Object.values(CAROUSEL_THEME_PRESETS).map((preset) => (
                    <button
                      key={preset.template}
                      type="button"
                      className={`flex flex-col items-start rounded-xl border-2 p-3.5 text-left transition ${
                        carouselConfig.template === preset.template
                          ? "border-[#3452d1] bg-blue-50/50 dark:border-[#5271ff] dark:bg-blue-950/30"
                          : "border-slate-200 hover:border-slate-300 dark:border-slate-700"
                      }`}
                      onClick={() => {
                        const nextCfg: CarouselBrandConfig = {
                          ...carouselConfig,
                          template: preset.template,
                          bgColor: preset.bgColor,
                          bgSecondaryColor: preset.bgSecondaryColor,
                          accentColor: preset.accentColor,
                          textColor: preset.textColor,
                          cardBgColor: preset.cardBgColor,
                        };
                        setCarouselConfig(nextCfg);
                        updateCarouselPreviewsAndAssets(
                          carouselSlides,
                          nextCfg,
                        );
                      }}
                    >
                      <div className="flex w-full items-center justify-between gap-2">
                        <span className="text-xs font-extrabold">
                          {preset.name}
                        </span>
                        <span className="flex items-center gap-1">
                          <span
                            className="h-4 w-4 rounded-full border border-slate-300"
                            style={{ backgroundColor: preset.bgColor }}
                          />
                          <span
                            className="h-4 w-4 rounded-full border border-slate-300"
                            style={{ backgroundColor: preset.accentColor }}
                          />
                        </span>
                      </div>
                      <p className="mt-1.5 text-[11px] leading-5 text-slate-600 dark:text-slate-300">
                        {preset.description}
                      </p>
                    </button>
                  ))}
                </div>

                <h3 className="mt-6 text-base font-extrabold">
                  2. Customize Brand Colors, Logo, &amp; Website Identity
                </h3>
                <div className="mt-3 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                  <div>
                    <label className="mb-1 block text-xs font-bold">
                      Brand / Page Name
                    </label>
                    <input
                      className={field}
                      value={carouselConfig.brandName}
                      onChange={(e) => {
                        const nextCfg = {
                          ...carouselConfig,
                          brandName: e.target.value,
                        };
                        setCarouselConfig(nextCfg);
                        updateCarouselPreviewsAndAssets(
                          carouselSlides,
                          nextCfg,
                        );
                      }}
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-xs font-bold">
                      Website / Footer Domain
                    </label>
                    <input
                      className={field}
                      value={carouselConfig.websiteUrl}
                      onChange={(e) => {
                        const nextCfg = {
                          ...carouselConfig,
                          websiteUrl: e.target.value,
                        };
                        setCarouselConfig(nextCfg);
                        updateCarouselPreviewsAndAssets(
                          carouselSlides,
                          nextCfg,
                        );
                      }}
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-xs font-bold">
                      Upload Brand Logo (PNG/JPG/SVG)
                    </label>
                    <div className="flex items-center gap-2">
                      <label className={`${button} w-full cursor-pointer text-xs`}>
                        <ImageIcon size={15} aria-hidden />
                        {carouselConfig.logoDataUrl ? "Change Logo" : "Upload Logo"}
                        <input
                          type="file"
                          accept="image/*"
                          className="sr-only"
                          onChange={(e) => handleLogoUpload(e.target.files?.[0])}
                        />
                      </label>
                      {carouselConfig.logoDataUrl && (
                        <button
                          type="button"
                          className="rounded-lg border border-red-300 px-2.5 py-2 text-xs font-bold text-red-700"
                          onClick={() => {
                            logoImageRef.current = null;
                            const nextCfg = {
                              ...carouselConfig,
                              logoDataUrl: undefined,
                            };
                            setCarouselConfig(nextCfg);
                            updateCarouselPreviewsAndAssets(
                              carouselSlides,
                              nextCfg,
                            );
                          }}
                        >
                          Clear
                        </button>
                      )}
                    </div>
                  </div>
                  <div>
                    <label htmlFor="carousel-aspect" className="mb-1 block text-xs font-bold">
                      Slide Dimensions
                    </label>
                    <select
                      id="carousel-aspect"
                      className={field}
                      value={carouselConfig.aspect}
                      onChange={(e) => {
                        const nextCfg = {
                          ...carouselConfig,
                          aspect: e.target.value as "portrait" | "square",
                        };
                        setCarouselConfig(nextCfg);
                        updateCarouselPreviewsAndAssets(
                          carouselSlides,
                          nextCfg,
                        );
                      }}
                    >
                      <option value="portrait">Portrait 4:5 (1080 × 1350)</option>
                      <option value="square">Square 1:1 (1080 × 1080)</option>
                    </select>
                  </div>
                </div>

                {/* Custom Color Pickers */}
                <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-4">
                  <div>
                    <label className="mb-1 block text-xs font-bold">
                      Background Color
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        className="h-10 w-12 cursor-pointer rounded border border-slate-300"
                        value={carouselConfig.bgColor}
                        onChange={(e) => {
                          const nextCfg = {
                            ...carouselConfig,
                            bgColor: e.target.value,
                          };
                          setCarouselConfig(nextCfg);
                          updateCarouselPreviewsAndAssets(
                            carouselSlides,
                            nextCfg,
                          );
                        }}
                      />
                      <input
                        className={`${field} py-2 font-mono text-xs`}
                        value={carouselConfig.bgColor}
                        onChange={(e) => {
                          const nextCfg = {
                            ...carouselConfig,
                            bgColor: e.target.value,
                          };
                          setCarouselConfig(nextCfg);
                          updateCarouselPreviewsAndAssets(
                            carouselSlides,
                            nextCfg,
                          );
                        }}
                      />
                    </div>
                  </div>
                  <div>
                    <label className="mb-1 block text-xs font-bold">
                      Accent / Highlight Color
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        className="h-10 w-12 cursor-pointer rounded border border-slate-300"
                        value={carouselConfig.accentColor}
                        onChange={(e) => {
                          const nextCfg = {
                            ...carouselConfig,
                            accentColor: e.target.value,
                          };
                          setCarouselConfig(nextCfg);
                          updateCarouselPreviewsAndAssets(
                            carouselSlides,
                            nextCfg,
                          );
                        }}
                      />
                      <input
                        className={`${field} py-2 font-mono text-xs`}
                        value={carouselConfig.accentColor}
                        onChange={(e) => {
                          const nextCfg = {
                            ...carouselConfig,
                            accentColor: e.target.value,
                          };
                          setCarouselConfig(nextCfg);
                          updateCarouselPreviewsAndAssets(
                            carouselSlides,
                            nextCfg,
                          );
                        }}
                      />
                    </div>
                  </div>
                  <div>
                    <label className="mb-1 block text-xs font-bold">
                      Diagram Card Color
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        className="h-10 w-12 cursor-pointer rounded border border-slate-300"
                        value={carouselConfig.cardBgColor}
                        onChange={(e) => {
                          const nextCfg = {
                            ...carouselConfig,
                            cardBgColor: e.target.value,
                          };
                          setCarouselConfig(nextCfg);
                          updateCarouselPreviewsAndAssets(
                            carouselSlides,
                            nextCfg,
                          );
                        }}
                      />
                      <input
                        className={`${field} py-2 font-mono text-xs`}
                        value={carouselConfig.cardBgColor}
                        onChange={(e) => {
                          const nextCfg = {
                            ...carouselConfig,
                            cardBgColor: e.target.value,
                          };
                          setCarouselConfig(nextCfg);
                          updateCarouselPreviewsAndAssets(
                            carouselSlides,
                            nextCfg,
                          );
                        }}
                      />
                    </div>
                  </div>
                  <div>
                    <label htmlFor="carousel-count" className="mb-1 block text-xs font-bold">
                      Number of Slides
                    </label>
                    <select
                      id="carousel-count"
                      className={field}
                      value={carouselCount}
                      onChange={(e) => {
                        const cnt = Number(e.target.value);
                        setCarouselCount(cnt);
                        const nextSlides = buildLinkedinCarousel(article, cnt);
                        setCarouselSlides(nextSlides);
                        updateCarouselPreviewsAndAssets(
                          nextSlides,
                          carouselConfig,
                        );
                      }}
                    >
                      <option value={6}>6 Slides</option>
                      <option value={8}>8 Slides</option>
                      <option value={10}>10 Slides</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Live Visual Slide Gallery + Per-Slide Editor */}
              <div className="flex flex-wrap items-center justify-between gap-3">
                <h3 className="text-lg font-extrabold">
                  3. Live Slide Previews &amp; Per-Slide Editor ({carouselSlides.length} Slides)
                </h3>
                <button
                  type="button"
                  className={button}
                  onClick={() => {
                    const nextSlides: CarouselSlide[] = [
                      ...carouselSlides,
                      {
                        number: carouselSlides.length + 1,
                        kind: "point",
                        kicker: `SLIDE 0${carouselSlides.length + 1}`,
                        headline: "New carousel insight slide",
                        highlightPhrase: "insight slide",
                        body: "Edit this slide text and comparison diagram cards below.",
                        cardLeftTitle: "BEFORE",
                        cardLeftBody: "Previous approach or common mistake.",
                        cardRightTitle: "AFTER",
                        cardRightBody: "Improved workflow or actionable fix.",
                        footer: carouselConfig.websiteUrl,
                      },
                    ];
                    setCarouselSlides(nextSlides);
                    updateCarouselPreviewsAndAssets(nextSlides, carouselConfig);
                  }}
                >
                  <Plus size={16} aria-hidden />
                  Add Slide
                </button>
              </div>

              <div className="grid gap-6 md:grid-cols-2">
                {carouselSlides.map((slide, idx) => (
                  <div
                    key={idx}
                    className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-900"
                  >
                    <div className="mb-3 flex items-center justify-between gap-2">
                      <span className="text-xs font-extrabold uppercase text-[#9A3412] dark:text-[#FDBA74]">
                        Slide {String(idx + 1).padStart(2, "0")} of{" "}
                        {String(carouselSlides.length).padStart(2, "0")}
                      </span>
                      <div className="flex items-center gap-2">
                        {slidePreviewUrls[idx] && (
                          <a
                            href={slidePreviewUrls[idx]}
                            download={`${baseName}-slide-${String(idx + 1).padStart(2, "0")}.png`}
                            className="text-xs font-bold text-[#3452d1] underline dark:text-blue-300"
                          >
                            Save Slide PNG
                          </a>
                        )}
                        {carouselSlides.length > 3 && (
                          <button
                            type="button"
                            aria-label={`Remove slide ${idx + 1}`}
                            className="rounded p-1 text-red-600 hover:bg-red-50"
                            onClick={() => {
                              const next = carouselSlides
                                .filter((_, i) => i !== idx)
                                .map((s, i) => ({ ...s, number: i + 1 }));
                              setCarouselSlides(next);
                              updateCarouselPreviewsAndAssets(
                                next,
                                carouselConfig,
                              );
                            }}
                          >
                            <Trash2 size={15} aria-hidden />
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Live Rendered Canvas Image Preview */}
                    {slidePreviewUrls[idx] && (
                      <div className="mb-4 overflow-hidden rounded-xl border border-slate-200 dark:border-slate-700">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={slidePreviewUrls[idx]}
                          alt={`Slide ${idx + 1} preview`}
                          className="h-auto w-full object-contain"
                        />
                      </div>
                    )}

                    {/* Editable Fields for This Slide */}
                    <details className="rounded-xl border border-slate-200 p-3 dark:border-slate-700">
                      <summary className="cursor-pointer text-xs font-bold">
                        Edit Slide {idx + 1} Text &amp; Diagram Boxes
                      </summary>
                      <div className="mt-3 space-y-2.5">
                        <div>
                          <label className="block text-[11px] font-bold">
                            Headline
                          </label>
                          <input
                            className={`${field} py-2 text-xs font-bold`}
                            value={slide.headline}
                            onChange={(e) => {
                              const next = carouselSlides.map((s, i) =>
                                i === idx ? { ...s, headline: e.target.value } : s,
                              );
                              setCarouselSlides(next);
                              updateCarouselPreviewsAndAssets(
                                next,
                                carouselConfig,
                              );
                            }}
                          />
                        </div>
                        <div>
                          <label className="block text-[11px] font-bold">
                            Highlighted Accent Words (painted in Accent Color)
                          </label>
                          <input
                            className={`${field} py-2 text-xs`}
                            value={slide.highlightPhrase}
                            onChange={(e) => {
                              const next = carouselSlides.map((s, i) =>
                                i === idx
                                  ? { ...s, highlightPhrase: e.target.value }
                                  : s,
                              );
                              setCarouselSlides(next);
                              updateCarouselPreviewsAndAssets(
                                next,
                                carouselConfig,
                              );
                            }}
                          />
                        </div>
                        <div>
                          <label className="block text-[11px] font-bold">
                            Subtitle / Lead Text
                          </label>
                          <textarea
                            rows={2}
                            className={`${field} py-2 text-xs`}
                            value={slide.body}
                            onChange={(e) => {
                              const next = carouselSlides.map((s, i) =>
                                i === idx ? { ...s, body: e.target.value } : s,
                              );
                              setCarouselSlides(next);
                              updateCarouselPreviewsAndAssets(
                                next,
                                carouselConfig,
                              );
                            }}
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <label className="block text-[11px] font-bold">
                              Box 1 Title (e.g. BEFORE)
                            </label>
                            <input
                              className={`${field} py-1.5 text-xs`}
                              value={slide.cardLeftTitle}
                              onChange={(e) => {
                                const next = carouselSlides.map((s, i) =>
                                  i === idx
                                    ? { ...s, cardLeftTitle: e.target.value }
                                    : s,
                                );
                                setCarouselSlides(next);
                                updateCarouselPreviewsAndAssets(
                                  next,
                                  carouselConfig,
                                );
                              }}
                            />
                            <textarea
                              rows={2}
                              className={`${field} mt-1 py-1.5 text-xs`}
                              value={slide.cardLeftBody}
                              onChange={(e) => {
                                const next = carouselSlides.map((s, i) =>
                                  i === idx
                                    ? { ...s, cardLeftBody: e.target.value }
                                    : s,
                                );
                                setCarouselSlides(next);
                                updateCarouselPreviewsAndAssets(
                                  next,
                                  carouselConfig,
                                );
                              }}
                            />
                          </div>
                          <div>
                            <label className="block text-[11px] font-bold">
                              Box 2 Title (e.g. AFTER)
                            </label>
                            <input
                              className={`${field} py-1.5 text-xs`}
                              value={slide.cardRightTitle}
                              onChange={(e) => {
                                const next = carouselSlides.map((s, i) =>
                                  i === idx
                                    ? { ...s, cardRightTitle: e.target.value }
                                    : s,
                                );
                                setCarouselSlides(next);
                                updateCarouselPreviewsAndAssets(
                                  next,
                                  carouselConfig,
                                );
                              }}
                            />
                            <textarea
                              rows={2}
                              className={`${field} mt-1 py-1.5 text-xs`}
                              value={slide.cardRightBody}
                              onChange={(e) => {
                                const next = carouselSlides.map((s, i) =>
                                  i === idx
                                    ? { ...s, cardRightBody: e.target.value }
                                    : s,
                                );
                                setCarouselSlides(next);
                                updateCarouselPreviewsAndAssets(
                                  next,
                                  carouselConfig,
                                );
                              }}
                            />
                          </div>
                        </div>
                        <div>
                          <label className="block text-[11px] font-bold">
                            Bottom Takeaway Line
                          </label>
                          <input
                            className={`${field} py-1.5 text-xs`}
                            value={slide.footer}
                            onChange={(e) => {
                              const next = carouselSlides.map((s, i) =>
                                i === idx ? { ...s, footer: e.target.value } : s,
                              );
                              setCarouselSlides(next);
                              updateCarouselPreviewsAndAssets(
                                next,
                                carouselConfig,
                              );
                            }}
                          />
                        </div>
                      </div>
                    </details>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ============================================================== */}
          {/* 7. PODCAST SCRIPT STUDIO UI                                    */}
          {/* ============================================================== */}
          {format === "podcast-script" && podcastDraft && (
            <div className="mt-6 space-y-5">
              <div className="grid gap-4 rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-900 sm:grid-cols-3">
                <div>
                  <label htmlFor="podcast-mode" className="mb-1 block text-xs font-bold">
                    Show Format
                  </label>
                  <select
                    id="podcast-mode"
                    className={field}
                    value={podcastMode}
                    onChange={(e) => {
                      const nextM = e.target.value as "cohost" | "solo";
                      setPodcastMode(nextM);
                      const d = buildPodcastScript(article, nextM, podcastWpm);
                      setPodcastDraft(d);
                      rebuildNonCarouselDownloads(null, null, "", null, d);
                    }}
                  >
                    <option value="cohost">
                      Two-Host Conversation (Host A &amp; Host B)
                    </option>
                    <option value="solo">Solo Host Episode</option>
                  </select>
                </div>
                <div>
                  <label htmlFor="podcast-wpm" className="mb-1 block text-xs font-bold">
                    Speaking Pace
                  </label>
                  <select
                    id="podcast-wpm"
                    className={field}
                    value={podcastWpm}
                    onChange={(e) => {
                      const nextW = Number(e.target.value) as 130 | 150 | 170;
                      setPodcastWpm(nextW);
                      const d = buildPodcastScript(article, podcastMode, nextW);
                      setPodcastDraft(d);
                      rebuildNonCarouselDownloads(null, null, "", null, d);
                    }}
                  >
                    <option value={130}>130 WPM (Relaxed)</option>
                    <option value={150}>150 WPM (Natural Broadcast)</option>
                    <option value={170}>170 WPM (Upbeat)</option>
                  </select>
                </div>
                <div className="flex items-end">
                  <button
                    type="button"
                    className={`${button} w-full`}
                    onClick={() =>
                      copyText(podcastScriptTxt(article, podcastDraft))
                    }
                  >
                    <Copy size={15} aria-hidden />
                    Copy Full Podcast Script
                  </button>
                </div>
              </div>

              <div className="max-h-[540px] space-y-3 overflow-y-auto pr-1">
                {podcastDraft.segments.map((seg, idx) => (
                  <div
                    key={seg.id}
                    className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-900"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <span className="text-xs font-extrabold text-[#9A3412] dark:text-[#FDBA74]">
                        {seg.speaker} · {seg.topic} (~{seg.seconds}s)
                      </span>
                      <span className="text-xs text-slate-500">{seg.cue}</span>
                    </div>
                    <textarea
                      rows={3}
                      className={`${field} mt-2`}
                      value={seg.dialogue}
                      onChange={(e) => {
                        const nextSegs = podcastDraft.segments.map((s, i) =>
                          i === idx ? { ...s, dialogue: e.target.value } : s,
                        );
                        const next = { ...podcastDraft, segments: nextSegs };
                        setPodcastDraft(next);
                        rebuildNonCarouselDownloads(null, null, "", null, next);
                      }}
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-slate-200 pt-4 dark:border-slate-700">
            <p className="text-xs text-slate-600 dark:text-slate-300">
              All edits above automatically update your download buttons.
            </p>
            <button
              type="button"
              className={button}
              disabled={aiBusy}
              onClick={() => generateAll(true)}
            >
              <RefreshCw size={15} aria-hidden />
              {aiBusy ? "Synthesizing…" : "Regenerate from article"}
            </button>
          </div>
        </section>
      )}
    </div>
  );
}
