"use client";
import { useEffect, useRef, useState } from "react";
import { Copy, Download, Sparkles } from "lucide-react";
import { zipStored } from "../outreach-email/docx";
import { focusToolSection } from "../tool-ui/ToolRunOverlay";
import { filename, validate, type Article } from "./model";
import {
  articleToEpub,
  articleToMarkdown,
  buildLinkedinCarousel,
  buildNewsletter,
  buildPodcastScript,
  buildSocialPosts,
  buildVideoScript,
  carouselPdf,
  docxMime,
  newsletterDocx,
  newsletterHtml,
  newsletterTxt,
  podcastScriptDocx,
  podcastScriptTxt,
  socialPostsCsv,
  socialPostsTxt,
  videoScriptDocx,
  videoScriptTxt,
  type CarouselSlide,
  type ConversionFormat,
  type NewsletterDraft,
  type PodcastScriptDraft,
  type SocialPost,
  type VideoScriptDraft,
} from "./formats";

const field =
  "w-full rounded-xl border border-slate-300 bg-transparent p-3 text-sm leading-7 focus:outline-none focus:ring-2 focus:ring-[#5271ff] dark:border-slate-600";
const button =
  "inline-flex items-center justify-center gap-2 rounded-xl border border-slate-300 px-4 py-3 text-sm font-bold hover:bg-slate-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#5271ff] dark:border-slate-600 dark:hover:bg-slate-800 disabled:opacity-50";
const primary =
  "inline-flex items-center justify-center gap-2 rounded-xl bg-[#3452d1] px-5 py-3 text-sm font-bold text-white hover:bg-[#2943b5] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#5271ff] disabled:opacity-50";

type DownloadAsset = {
  label: string;
  url: string;
  downloadName: string;
  primary?: boolean;
};

async function renderCarouselPngZip(
  slides: CarouselSlide[],
  theme: "coral" | "navy" | "slate",
  aspect: "portrait" | "square",
): Promise<Uint8Array | null> {
  if (typeof document === "undefined") return null;
  const width = 1080;
  const height = aspect === "portrait" ? 1350 : 1080;
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) return null;

  const colors =
    theme === "navy"
      ? { bg: "#0F172A", accent: "#5271FF", text: "#FFFFFF", sub: "#CBD5E1" }
      : theme === "slate"
        ? { bg: "#F8FAFC", accent: "#1E293B", text: "#0F172A", sub: "#475569" }
        : { bg: "#291B26", accent: "#F97316", text: "#FFFFFF", sub: "#FED7AA" };

  const entries: Record<string, Uint8Array> = {};

  for (let i = 0; i < slides.length; i++) {
    const s = slides[i];
    ctx.fillStyle = colors.bg;
    ctx.fillRect(0, 0, width, height);

    ctx.fillStyle = colors.accent;
    ctx.fillRect(84, 96, 140, 12);

    ctx.fillStyle = colors.accent;
    ctx.font = "bold 28px system-ui, sans-serif";
    ctx.fillText(`SLIDE ${i + 1} OF ${slides.length}`, 84, 160);

    ctx.fillStyle = colors.text;
    ctx.font = "bold 54px system-ui, sans-serif";
    const headWords = s.headline.split(" ");
    let line = "";
    let y = 260;
    for (const w of headWords) {
      const test = (line + " " + w).trim();
      if (ctx.measureText(test).width > width - 168 && line) {
        ctx.fillText(line, 84, y);
        line = w;
        y += 68;
      } else {
        line = test;
      }
    }
    if (line) {
      ctx.fillText(line, 84, y);
      y += 84;
    }

    ctx.fillStyle = colors.sub;
    ctx.font = "36px system-ui, sans-serif";
    const bodyWords = s.body.split(" ");
    line = "";
    for (const w of bodyWords) {
      const test = (line + " " + w).trim();
      if (ctx.measureText(test).width > width - 168 && line) {
        ctx.fillText(line, 84, y);
        line = w;
        y += 52;
      } else {
        line = test;
      }
    }
    if (line) ctx.fillText(line, 84, y);

    ctx.fillStyle = colors.sub;
    ctx.font = "26px system-ui, sans-serif";
    ctx.fillText(s.footer.slice(0, 75), 84, height - 84);

    const dataUrl = canvas.toDataURL("image/png");
    const b64 = dataUrl.split(",")[1] || "";
    if (b64) {
      const bin = atob(b64);
      const bytes = new Uint8Array(bin.length);
      for (let k = 0; k < bin.length; k++) bytes[k] = bin.charCodeAt(k);
      entries[`slide-${String(i + 1).padStart(2, "0")}.png`] = bytes;
    }
  }
  return Object.keys(entries).length ? zipStored(entries) : null;
}

export default function RepurposePanel({
  article,
  format,
}: {
  article: Article;
  format: Exclude<ConversionFormat, "pdf" | "docx" | "audio">;
}) {
  // Format-specific options
  const [videoMode, setVideoMode] = useState<"youtube" | "shorts">("youtube");
  const [videoWpm, setVideoWpm] = useState<120 | 140 | 160>(140);
  const [videoHook, setVideoHook] = useState(0);
  const [videoCta, setVideoCta] = useState(
    "Read the full article at the source link in the description.",
  );

  const [socialAngle, setSocialAngle] = useState<
    "takeaways" | "educational" | "discussion"
  >("takeaways");
  const [socialIncludeLink, setSocialIncludeLink] = useState(true);

  const [mdFrontmatter, setMdFrontmatter] = useState(true);
  const [mdReferences, setMdReferences] = useState(true);

  const [epubTheme, setEpubTheme] = useState<"serif" | "sans">("serif");
  const [epubLang, setEpubLang] = useState("en");

  const [carouselTheme, setCarouselTheme] = useState<
    "coral" | "navy" | "slate"
  >("coral");
  const [carouselAspect, setCarouselAspect] = useState<"portrait" | "square">(
    "portrait",
  );
  const [carouselCount, setCarouselCount] = useState(8);

  const [podcastMode, setPodcastMode] = useState<"cohost" | "solo">("cohost");
  const [podcastWpm, setPodcastWpm] = useState<130 | 150 | 170>(150);

  // Generated state
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
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [revision, setRevision] = useState(0);
  const doneRef = useRef<HTMLElement>(null);

  useEffect(
    () => () => {
      for (const a of assets) URL.revokeObjectURL(a.url);
    },
    [assets],
  );

  useEffect(() => {
    if (revision > 0) focusToolSection(doneRef.current);
  }, [revision]);

  const baseName = filename(article.title).replace(/\.pdf$/, "");

  function rebuildDownloads(
    nextVideo = videoDraft,
    nextSocial = socialDraft,
    nextMd = markdownText,
    nextNewsletter = newsletterDraft,
    nextSlides = carouselSlides,
    nextPodcast = podcastDraft,
  ) {
    for (const a of assets) URL.revokeObjectURL(a.url);
    const nextAssets: DownloadAsset[] = [];

    if (format === "video-script" && nextVideo) {
      const txt = videoScriptTxt(article, nextVideo);
      const docx = videoScriptDocx(article, nextVideo);
      nextAssets.push(
        {
          label: "Download DOCX script",
          url: URL.createObjectURL(new Blob([docx], { type: docxMime })),
          downloadName: `${baseName}-video-script.docx`,
          primary: true,
        },
        {
          label: "Download TXT script",
          url: URL.createObjectURL(
            new Blob([txt], { type: "text/plain;charset=utf-8" }),
          ),
          downloadName: `${baseName}-video-script.txt`,
        },
      );
    } else if (format === "social-posts" && nextSocial) {
      const txt = socialPostsTxt(article, nextSocial);
      const csv = socialPostsCsv(article, nextSocial);
      nextAssets.push(
        {
          label: "Download CSV schedule",
          url: URL.createObjectURL(
            new Blob([csv], { type: "text/csv;charset=utf-8" }),
          ),
          downloadName: `${baseName}-social-posts.csv`,
          primary: true,
        },
        {
          label: "Download TXT posts",
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
          label: "Download plain text (.txt)",
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
          label: "Download EPUB e-book (.epub)",
          url: URL.createObjectURL(
            new Blob([epubBytes], { type: "application/epub+zip" }),
          ),
          downloadName: `${baseName}.epub`,
          primary: true,
        },
        {
          label: "Download XHTML reading copy",
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
          label: "Download HTML email (.html)",
          url: URL.createObjectURL(
            new Blob([html], { type: "text/html;charset=utf-8" }),
          ),
          downloadName: `${baseName}-newsletter.html`,
          primary: true,
        },
        {
          label: "Download TXT version",
          url: URL.createObjectURL(
            new Blob([txt], { type: "text/plain;charset=utf-8" }),
          ),
          downloadName: `${baseName}-newsletter.txt`,
        },
        {
          label: "Download DOCX draft",
          url: URL.createObjectURL(new Blob([docx], { type: docxMime })),
          downloadName: `${baseName}-newsletter.docx`,
        },
      );
    } else if (format === "podcast-script" && nextPodcast) {
      const txt = podcastScriptTxt(article, nextPodcast);
      const docx = podcastScriptDocx(article, nextPodcast);
      nextAssets.push(
        {
          label: "Download DOCX podcast script",
          url: URL.createObjectURL(new Blob([docx], { type: docxMime })),
          downloadName: `${baseName}-podcast-script.docx`,
          primary: true,
        },
        {
          label: "Download TXT podcast script",
          url: URL.createObjectURL(
            new Blob([txt], { type: "text/plain;charset=utf-8" }),
          ),
          downloadName: `${baseName}-podcast-script.txt`,
        },
      );
    }

    setAssets(nextAssets);
  }

  async function generate() {
    const err = validate(article);
    setError(err);
    setMessage("");
    if (err) return;

    try {
      if (format === "video-script") {
        const draft = buildVideoScript(
          article,
          videoMode,
          videoWpm,
          videoHook,
          videoCta,
        );
        setVideoDraft(draft);
        rebuildDownloads(draft, null, "", null, null, null);
        setMessage("Video script ready. Edit any scene below or download DOCX and TXT.");
      } else if (format === "social-posts") {
        const posts = buildSocialPosts(article, socialAngle, socialIncludeLink);
        setSocialDraft(posts);
        rebuildDownloads(null, posts, "", null, null, null);
        setMessage("Social posts ready. Edit any channel draft or download CSV and TXT.");
      } else if (format === "markdown") {
        const md = articleToMarkdown(article, {
          includeFrontmatter: mdFrontmatter,
          includeReferences: mdReferences,
        });
        setMarkdownText(md);
        rebuildDownloads(null, null, md, null, null, null);
        setMessage("Markdown ready. Review or edit the Markdown below and download your .md file.");
      } else if (format === "epub") {
        rebuildDownloads(null, null, "", null, null, null);
        setMessage("EPUB e-book ready. Download the .epub file for your e-reader.");
      } else if (format === "newsletter") {
        const draft = buildNewsletter(article);
        setNewsletterDraft(draft);
        rebuildDownloads(null, null, "", draft, null, null);
        setMessage("Newsletter draft ready. Customize the subject or body and download HTML, TXT, or DOCX.");
      } else if (format === "linkedin-carousel") {
        const slides = buildLinkedinCarousel(article, carouselCount);
        setCarouselSlides(slides);
        const pdfBytes = carouselPdf(slides, carouselTheme, carouselAspect);
        const pngZip = await renderCarouselPngZip(
          slides,
          carouselTheme,
          carouselAspect,
        );
        for (const a of assets) URL.revokeObjectURL(a.url);
        const nextAssets: DownloadAsset[] = [
          {
            label: "Download Carousel PDF (.pdf)",
            url: URL.createObjectURL(
              new Blob([pdfBytes], { type: "application/pdf" }),
            ),
            downloadName: `${baseName}-linkedin-carousel.pdf`,
            primary: true,
          },
        ];
        if (pngZip) {
          nextAssets.push({
            label: "Download Slide PNGs (.zip)",
            url: URL.createObjectURL(
              new Blob([pngZip], { type: "application/zip" }),
            ),
            downloadName: `${baseName}-carousel-slides.zip`,
          });
        }
        setAssets(nextAssets);
        setMessage("LinkedIn carousel ready. Edit any slide and download the PDF deck or PNG slide bundle.");
      } else if (format === "podcast-script") {
        const draft = buildPodcastScript(article, podcastMode, podcastWpm);
        setPodcastDraft(draft);
        rebuildDownloads(null, null, "", null, null, draft);
        setMessage("Podcast script ready. Edit dialogue segments below or download DOCX and TXT.");
      }
      setRevision((n) => n + 1);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Conversion failed.");
    }
  }

  async function copyText(text: string) {
    try {
      await navigator.clipboard.writeText(text);
      setMessage("Copied to clipboard.");
    } catch {
      setError("Clipboard access was denied. Use the download button instead.");
    }
  }

  const buttonTitle: Record<typeof format, string> = {
    "video-script": "Create video script",
    "social-posts": "Create social posts",
    markdown: "Create Markdown file",
    epub: "Create downloadable EPUB",
    newsletter: "Create newsletter draft",
    "linkedin-carousel": "Create LinkedIn carousel",
    "podcast-script": "Create podcast script",
  };

  return (
    <div className="mt-7 border-t border-slate-200 pt-7 dark:border-slate-700">
      <div className="rounded-2xl border border-orange-200 bg-orange-50/40 p-5 dark:border-orange-900 dark:bg-orange-950/10 sm:p-7">
        <p className="text-xs font-bold uppercase tracking-widest text-[#9A3412] dark:text-[#FDBA74]">
          Step 3 · Configure output settings
        </p>
        <h3 className="mt-2 text-2xl font-extrabold">
          {format === "video-script" && "Prepare your video script"}
          {format === "social-posts" && "Prepare your social media drafts"}
          {format === "markdown" && "Configure Markdown export"}
          {format === "epub" && "Configure EPUB e-book export"}
          {format === "newsletter" && "Prepare your email newsletter"}
          {format === "linkedin-carousel" && "Design your LinkedIn carousel"}
          {format === "podcast-script" && "Prepare your podcast script"}
        </h3>

        {format === "video-script" && (
          <div className="mt-4 grid gap-4 sm:grid-cols-3">
            <div>
              <label htmlFor="video-mode" className="mb-2 block text-sm font-bold">
                Video format
              </label>
              <select
                id="video-mode"
                className={field}
                value={videoMode}
                onChange={(e) =>
                  setVideoMode(e.target.value as "youtube" | "shorts")
                }
              >
                <option value="youtube">YouTube Long-Form (up to 10 scenes)</option>
                <option value="shorts">Shorts / Reels / TikTok (vertical hook + 3 beats)</option>
              </select>
            </div>
            <div>
              <label htmlFor="video-wpm" className="mb-2 block text-sm font-bold">
                Speaking rate assumption
              </label>
              <select
                id="video-wpm"
                className={field}
                value={videoWpm}
                onChange={(e) =>
                  setVideoWpm(Number(e.target.value) as 120 | 140 | 160)
                }
              >
                <option value={120}>120 WPM (deliberate)</option>
                <option value={140}>140 WPM (conversational)</option>
                <option value={160}>160 WPM (energetic)</option>
              </select>
            </div>
            <div>
              <label htmlFor="video-hook" className="mb-2 block text-sm font-bold">
                Opening hook style
              </label>
              <select
                id="video-hook"
                className={field}
                value={videoHook}
                onChange={(e) => setVideoHook(Number(e.target.value))}
              >
                <option value={0}>Headline + lead premise</option>
                <option value={1}>Direct opening claim</option>
                <option value={2}>Topic overview hook</option>
              </select>
            </div>
            <div className="sm:col-span-3">
              <label htmlFor="video-cta" className="mb-2 block text-sm font-bold">
                Closing call to action
              </label>
              <input
                id="video-cta"
                className={field}
                value={videoCta}
                onChange={(e) => setVideoCta(e.target.value)}
              />
            </div>
          </div>
        )}

        {format === "social-posts" && (
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="social-angle" className="mb-2 block text-sm font-bold">
                Drafting angle
              </label>
              <select
                id="social-angle"
                className={field}
                value={socialAngle}
                onChange={(e) =>
                  setSocialAngle(
                    e.target.value as "takeaways" | "educational" | "discussion",
                  )
                }
              >
                <option value="takeaways">Key takeaways list</option>
                <option value="educational">Educational step-by-step breakdown</option>
                <option value="discussion">Question &amp; discussion starter</option>
              </select>
            </div>
            <div className="flex items-end pb-2">
              <label className="flex items-center gap-3 text-sm font-semibold">
                <input
                  type="checkbox"
                  className="h-5 w-5 accent-[#5271ff]"
                  checked={socialIncludeLink}
                  onChange={(e) => setSocialIncludeLink(e.target.checked)}
                />
                <span>Include source URL in posts</span>
              </label>
            </div>
          </div>
        )}

        {format === "markdown" && (
          <div className="mt-4 flex flex-wrap gap-6">
            <label className="flex items-center gap-3 text-sm font-semibold">
              <input
                type="checkbox"
                className="h-5 w-5 accent-[#5271ff]"
                checked={mdFrontmatter}
                onChange={(e) => setMdFrontmatter(e.target.checked)}
              />
              <span>Include YAML frontmatter (title, author, date, source)</span>
            </label>
            <label className="flex items-center gap-3 text-sm font-semibold">
              <input
                type="checkbox"
                className="h-5 w-5 accent-[#5271ff]"
                checked={mdReferences}
                onChange={(e) => setMdReferences(e.target.checked)}
              />
              <span>Append numbered reference links section</span>
            </label>
          </div>
        )}

        {format === "epub" && (
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="epub-theme" className="mb-2 block text-sm font-bold">
                E-reader typography style
              </label>
              <select
                id="epub-theme"
                className={field}
                value={epubTheme}
                onChange={(e) =>
                  setEpubTheme(e.target.value as "serif" | "sans")
                }
              >
                <option value="serif">Book Serif (Georgia / Times)</option>
                <option value="sans">Clean Sans-Serif (System UI)</option>
              </select>
            </div>
            <div>
              <label htmlFor="epub-lang" className="mb-2 block text-sm font-bold">
                Document language tag
              </label>
              <select
                id="epub-lang"
                className={field}
                value={epubLang}
                onChange={(e) => setEpubLang(e.target.value)}
              >
                <option value="en">English (en)</option>
                <option value="ur">Urdu (ur)</option>
              </select>
            </div>
          </div>
        )}

        {format === "newsletter" && (
          <p className="mt-3 text-sm leading-7 text-slate-600 dark:text-slate-300">
            Creates an editable email newsletter with three subject-line options,
            preheader text, a key-takeaways callout box, section highlights, and
            a responsive HTML email template alongside plain-text and DOCX files.
          </p>
        )}

        {format === "linkedin-carousel" && (
          <div className="mt-4 grid gap-4 sm:grid-cols-3">
            <div>
              <label htmlFor="carousel-theme" className="mb-2 block text-sm font-bold">
                Visual theme
              </label>
              <select
                id="carousel-theme"
                className={field}
                value={carouselTheme}
                onChange={(e) =>
                  setCarouselTheme(
                    e.target.value as "coral" | "navy" | "slate",
                  )
                }
              >
                <option value="coral">Editorial Coral &amp; Plum</option>
                <option value="navy">Executive Navy &amp; Cobalt</option>
                <option value="slate">Clean Light Slate</option>
              </select>
            </div>
            <div>
              <label htmlFor="carousel-aspect" className="mb-2 block text-sm font-bold">
                Slide dimensions
              </label>
              <select
                id="carousel-aspect"
                className={field}
                value={carouselAspect}
                onChange={(e) =>
                  setCarouselAspect(e.target.value as "portrait" | "square")
                }
              >
                <option value="portrait">Portrait 4:5 (1080 × 1350)</option>
                <option value="square">Square 1:1 (1080 × 1080)</option>
              </select>
            </div>
            <div>
              <label htmlFor="carousel-count" className="mb-2 block text-sm font-bold">
                Target slide count
              </label>
              <select
                id="carousel-count"
                className={field}
                value={carouselCount}
                onChange={(e) => setCarouselCount(Number(e.target.value))}
              >
                <option value={6}>6 slides (concise)</option>
                <option value={8}>8 slides (standard)</option>
                <option value={10}>10 slides (deep dive)</option>
              </select>
            </div>
          </div>
        )}

        {format === "podcast-script" && (
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="podcast-mode" className="mb-2 block text-sm font-bold">
                Podcast speaker format
              </label>
              <select
                id="podcast-mode"
                className={field}
                value={podcastMode}
                onChange={(e) =>
                  setPodcastMode(e.target.value as "cohost" | "solo")
                }
              >
                <option value="cohost">Two-Host Conversation (Host A &amp; Host B)</option>
                <option value="solo">Solo Host Monologue</option>
              </select>
            </div>
            <div>
              <label htmlFor="podcast-wpm" className="mb-2 block text-sm font-bold">
                Speaking pace assumption
              </label>
              <select
                id="podcast-wpm"
                className={field}
                value={podcastWpm}
                onChange={(e) =>
                  setPodcastWpm(Number(e.target.value) as 130 | 150 | 170)
                }
              >
                <option value={130}>130 WPM (relaxed)</option>
                <option value={150}>150 WPM (natural broadcast)</option>
                <option value={170}>170 WPM (upbeat)</option>
              </select>
            </div>
          </div>
        )}

        <button type="button" className={`${primary} mt-5`} onClick={generate}>
          <Sparkles size={17} aria-hidden />
          {buttonTitle[format]}
        </button>
      </div>

      {error && (
        <p role="alert" className="my-4 text-sm font-bold text-red-700 dark:text-red-300">
          {error}
        </p>
      )}
      {message && (
        <p role="status" className="my-4 text-sm font-semibold leading-7">
          {message}
        </p>
      )}

      {assets.length > 0 && (
        <section
          ref={doneRef}
          tabIndex={-1}
          aria-labelledby="repurpose-result-title"
          className="mt-6 scroll-mt-28 rounded-2xl border-2 border-[#3452d1] bg-blue-50/30 p-5 focus:outline focus:outline-2 focus:outline-[#5271ff] dark:border-[#5271ff] dark:bg-blue-950/20 sm:p-7"
        >
          <p className="text-xs font-bold uppercase tracking-widest text-[#9A3412] dark:text-[#FDBA74]">
            Step 4 · Review, edit, and download
          </p>
          <div className="mt-2 flex flex-wrap items-center justify-between gap-4">
            <h3 id="repurpose-result-title" className="text-2xl font-extrabold">
              Your converted output is ready
            </h3>
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

          {format === "video-script" && videoDraft && (
            <div className="mt-5 space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <p className="text-sm font-semibold">
                  {videoDraft.scenes.length} scenes · {videoDraft.totalWords} spoken words · ~
                  {Math.floor(videoDraft.totalSeconds / 60)}m {videoDraft.totalSeconds % 60}s at{" "}
                  {videoDraft.wpm} WPM
                </p>
                <button
                  type="button"
                  className={button}
                  onClick={() => copyText(videoScriptTxt(article, videoDraft))}
                >
                  <Copy size={15} aria-hidden />
                  Copy full script
                </button>
              </div>
              <div className="max-h-96 space-y-3 overflow-y-auto pr-1">
                {videoDraft.scenes.map((scene, idx) => (
                  <div
                    key={scene.id}
                    className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-900"
                  >
                    <p className="text-xs font-bold uppercase text-[#9A3412] dark:text-[#FDBA74]">
                      {scene.title} (~{scene.seconds}s)
                    </p>
                    <label className="mt-2 block text-xs font-bold">
                      Spoken narration
                      <textarea
                        rows={3}
                        className={`${field} mt-1`}
                        value={scene.narration}
                        onChange={(e) => {
                          const nextScenes = videoDraft.scenes.map((s, i) =>
                            i === idx ? { ...s, narration: e.target.value } : s,
                          );
                          const next = { ...videoDraft, scenes: nextScenes };
                          setVideoDraft(next);
                          rebuildDownloads(next, null, "", null, null, null);
                        }}
                      />
                    </label>
                    <p className="mt-2 text-xs text-slate-600 dark:text-slate-300">
                      <strong>Visual:</strong> {scene.visual} ·{" "}
                      <strong>On-screen:</strong> {scene.onScreenText}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {format === "social-posts" && socialDraft && (
            <div className="mt-5 grid gap-4 md:grid-cols-2">
              {socialDraft.map((post, idx) => (
                <div
                  key={post.id}
                  className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-900"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-bold text-[#9A3412] dark:text-[#FDBA74]">
                      {post.platform}
                    </span>
                    <button
                      type="button"
                      className="text-xs font-bold underline"
                      onClick={() => copyText(post.content)}
                    >
                      Copy post
                    </button>
                  </div>
                  <textarea
                    rows={7}
                    className={`${field} mt-3`}
                    value={post.content}
                    onChange={(e) => {
                      const next = socialDraft.map((p, i) =>
                        i === idx ? { ...p, content: e.target.value } : p,
                      );
                      setSocialDraft(next);
                      rebuildDownloads(null, next, "", null, null, null);
                    }}
                  />
                  <p className="mt-1 text-xs text-slate-500">
                    {post.content.length} / {post.charLimit} characters
                  </p>
                </div>
              ))}
            </div>
          )}

          {format === "markdown" && (
            <div className="mt-5">
              <div className="mb-2 flex justify-end">
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
                rows={12}
                className={`${field} font-mono text-xs`}
                value={markdownText}
                onChange={(e) => {
                  setMarkdownText(e.target.value);
                  rebuildDownloads(null, null, e.target.value, null, null, null);
                }}
              />
            </div>
          )}

          {format === "newsletter" && newsletterDraft && (
            <div className="mt-5 space-y-4">
              <div>
                <label className="mb-1 block text-xs font-bold">
                  Subject line
                </label>
                <input
                  className={field}
                  value={newsletterDraft.selectedSubject}
                  onChange={(e) => {
                    const next = {
                      ...newsletterDraft,
                      selectedSubject: e.target.value,
                    };
                    setNewsletterDraft(next);
                    rebuildDownloads(null, null, "", next, null, null);
                  }}
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-bold">
                  Intro paragraph
                </label>
                <textarea
                  rows={3}
                  className={field}
                  value={newsletterDraft.intro}
                  onChange={(e) => {
                    const next = { ...newsletterDraft, intro: e.target.value };
                    setNewsletterDraft(next);
                    rebuildDownloads(null, null, "", next, null, null);
                  }}
                />
              </div>
            </div>
          )}

          {format === "linkedin-carousel" && carouselSlides && (
            <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {carouselSlides.map((slide, idx) => (
                <div
                  key={slide.number}
                  className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-900"
                >
                  <p className="text-xs font-bold uppercase text-[#9A3412] dark:text-[#FDBA74]">
                    Slide {slide.number} · {slide.kind}
                  </p>
                  <input
                    className={`${field} mt-2 font-bold`}
                    value={slide.headline}
                    onChange={(e) => {
                      const next = carouselSlides.map((s, i) =>
                        i === idx ? { ...s, headline: e.target.value } : s,
                      );
                      setCarouselSlides(next);
                    }}
                  />
                  <textarea
                    rows={4}
                    className={`${field} mt-2`}
                    value={slide.body}
                    onChange={(e) => {
                      const next = carouselSlides.map((s, i) =>
                        i === idx ? { ...s, body: e.target.value } : s,
                      );
                      setCarouselSlides(next);
                    }}
                  />
                </div>
              ))}
            </div>
          )}

          {format === "podcast-script" && podcastDraft && (
            <div className="mt-5 space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <p className="text-sm font-semibold">
                  {podcastDraft.segments.length} segments · {podcastDraft.totalWords} words · ~
                  {Math.floor(podcastDraft.totalSeconds / 60)}m{" "}
                  {podcastDraft.totalSeconds % 60}s at {podcastDraft.wpm} WPM
                </p>
                <button
                  type="button"
                  className={button}
                  onClick={() => copyText(podcastScriptTxt(article, podcastDraft))}
                >
                  <Copy size={15} aria-hidden />
                  Copy podcast script
                </button>
              </div>
              <div className="max-h-96 space-y-3 overflow-y-auto pr-1">
                {podcastDraft.segments.map((seg, idx) => (
                  <div
                    key={seg.id}
                    className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-900"
                  >
                    <p className="text-xs font-bold text-[#9A3412] dark:text-[#FDBA74]">
                      {seg.speaker} · {seg.topic} (~{seg.seconds}s) {seg.cue}
                    </p>
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
                        rebuildDownloads(null, null, "", null, null, next);
                      }}
                    />
                  </div>
                ))}
              </div>
            </div>
          )}
        </section>
      )}
    </div>
  );
}
