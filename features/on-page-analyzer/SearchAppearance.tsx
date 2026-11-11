"use client";
import { useEffect, useRef, useState } from "react";
import {
  BatteryFull,
  Copy,
  Globe2,
  Monitor,
  RotateCcw,
  Search,
  Smartphone,
  Wifi,
} from "lucide-react";
import { PRESETS, textLayout } from "@/features/serp-preview/preview";
import type { PageSnapshot } from "./types";
import styles from "./analyzer.module.css";

function SiteIcon({ src }: { src?: string }) {
  const [failed, setFailed] = useState("");
  return (
    <span className={styles.previewFavicon}>
      {src && failed !== src ? (
        <img
          src={src}
          alt=""
          width={28}
          height={28}
          loading="lazy"
          referrerPolicy="no-referrer"
          onError={() => setFailed(src)}
        />
      ) : (
        <Globe2 size={21} />
      )}
    </span>
  );
}

export default function SearchAppearance({
  page,
  keyword = "",
}: {
  page: PageSnapshot;
  keyword?: string;
}) {
  const [device, setDevice] = useState<"desktop" | "mobile">("desktop");
  const [customTitle, setCustomTitle] = useState<string | null>(null);
  const [customDescription, setCustomDescription] = useState<string | null>(
    null,
  );
  const [copiedNotice, setCopiedNotice] = useState("");
  const contentRef = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(600);
  const [layouts, setLayouts] = useState<{
    title: ReturnType<typeof textLayout>;
    description: ReturnType<typeof textLayout>;
  } | null>(null);

  const activeTitle = customTitle ?? page.title;
  const activeDescription = customDescription ?? page.description;

  useEffect(() => {
    setCustomTitle(null);
    setCustomDescription(null);
  }, [page.title, page.description]);

  useEffect(() => {
    const element = contentRef.current;
    if (!element) return;
    const update = () =>
      setWidth(Math.max(100, element.getBoundingClientRect().width));
    update();
    const observer = new ResizeObserver(update);
    observer.observe(element);
    return () => observer.disconnect();
  }, [device]);

  useEffect(() => {
    const context = document.createElement("canvas").getContext("2d");
    if (!context) {
      setLayouts(null);
      return;
    }
    const preset = PRESETS[device];
    context.font = "400 20px Arial";
    const title = textLayout(
      activeTitle,
      Math.min(width, preset.titleWidth),
      preset.titleLines,
      (t) => context.measureText(t).width,
    );
    context.font = "400 14px Arial";
    const description = textLayout(
      activeDescription,
      Math.min(width, preset.descriptionWidth),
      preset.descriptionLines,
      (t) => context.measureText(t).width,
    );
    setLayouts({ title, description });
  }, [device, activeTitle, activeDescription, width]);

  let host = "Your website",
    path = "your-website.com › page";
  try {
    const url = new URL(page.url);
    host = url.hostname;
    path =
      host +
      url.pathname
        .split("/")
        .filter(Boolean)
        .map((p) => ` › ${p}`)
        .join("");
  } catch {}

  const isEdited = customTitle !== null || customDescription !== null;

  return (
    <section
      className={styles.previewCard}
      aria-label="Illustrative search preview"
    >
      <div className={styles.panelTitle}>
        <div>
          <h3>Search appearance</h3>
          <p className={styles.muted}>
            See how your page could appear in search and test snippet edits
            live.
          </p>
        </div>
        <div className={styles.segment}>
          {(["desktop", "mobile"] as const).map((d) => (
            <button
              key={d}
              type="button"
              aria-pressed={device === d}
              onClick={() => setDevice(d)}
            >
              {d === "desktop" ? (
                <Monitor size={15} />
              ) : (
                <Smartphone size={15} />
              )}
              {d === "desktop" ? "Desktop" : "Mobile"}
            </button>
          ))}
        </div>
      </div>
      <div
        className={`${styles.searchMockup} ${device === "mobile" ? styles.phoneMockup : ""}`}
      >
        {device === "mobile" && (
          <div className={styles.phoneStatus} aria-hidden="true">
            <span>9:41</span>
            <span>
              <Wifi size={13} />
              <BatteryFull size={17} />
            </span>
          </div>
        )}
        <div className={styles.searchChrome} aria-hidden="true">
          <div className={styles.googleWordmark}>
            {"Google".split("").map((c, i) => (
              <span
                key={i}
                style={{
                  color: [
                    "#4285f4",
                    "#ea4335",
                    "#fbbc05",
                    "#4285f4",
                    "#34a853",
                    "#ea4335",
                  ][i],
                }}
              >
                {c}
              </span>
            ))}
          </div>
          <div className={styles.mockQuery}>
            <Search size={16} />
            <span>{keyword || "Example search query"}</span>
          </div>
          <div className={styles.mockTabs}>
            <b>All</b>
            <span>Images</span>
            <span>Videos</span>
            <span>News</span>
          </div>
        </div>
        <div className={styles.mockResult}>
          <div ref={contentRef}>
            <div className={styles.siteLine}>
              <SiteIcon src={page.favicon} />
              <span>
                <strong>{page.siteName || host}</strong>
                <small>{path}</small>
              </span>
            </div>
            <div className={styles.mockResultTitle}>
              {layouts?.title.lines.join("\n") ||
                activeTitle ||
                "Add a descriptive page title"}
            </div>
            <p className={styles.mockDescription}>
              {layouts?.description.lines.join("\n") ||
                activeDescription ||
                "Add a page-specific summary to preview your search snippet."}
            </p>
          </div>
        </div>
        {device === "mobile" && (
          <div className={styles.phoneHandle} aria-hidden="true" />
        )}
      </div>
      <div className={styles.previewStats}>
        <span>
          Title {layouts ? `≈ ${layouts.title.pixels} px · ` : ""}
          {Array.from(activeTitle).length} characters
        </span>
        <span>
          Description {layouts ? `≈ ${layouts.description.pixels} px · ` : ""}
          {Array.from(activeDescription).length} characters
        </span>
      </div>
      {layouts && (
        <p className={styles.muted}>
          {layouts.title.truncated
            ? "Title may be clipped. "
            : "Title fits this preview guide. "}
          {layouts.description.truncated
            ? "Description may be clipped."
            : "Description fits this preview guide."}
        </p>
      )}
      <div className="mt-4 space-y-3 rounded-xl border border-slate-200/80 bg-slate-50/70 p-3.5 dark:border-slate-700 dark:bg-slate-900/50">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <span className="text-xs font-bold uppercase tracking-wider text-[#4058D0] dark:text-blue-300">
            Live Snippet Sandbox (Edit to test pixel fit)
          </span>
          <div className="flex flex-wrap gap-2">
            {isEdited && (
              <button
                type="button"
                onClick={() => {
                  setCustomTitle(null);
                  setCustomDescription(null);
                  setCopiedNotice("Restored original page metadata.");
                }}
                className="inline-flex items-center gap-1 rounded-lg border border-slate-300 px-2.5 py-1 text-xs font-semibold hover:bg-slate-100 dark:border-slate-600 dark:hover:bg-slate-800"
              >
                <RotateCcw size={12} /> Reset
              </button>
            )}
            <button
              type="button"
              onClick={async () => {
                const snippetHtml = `<title>${activeTitle}</title>\n<meta name="description" content="${activeDescription.replace(/"/g, "&quot;")}" />`;
                try {
                  await navigator.clipboard.writeText(snippetHtml);
                  setCopiedNotice("Copied <title> & <meta> HTML tags!");
                } catch {
                  setCopiedNotice("Clipboard unavailable.");
                }
              }}
              className="inline-flex items-center gap-1 rounded-lg bg-[#4058D0] px-2.5 py-1 text-xs font-bold text-white hover:bg-[#3452D1]"
            >
              <Copy size={12} /> Copy HTML Tags
            </button>
          </div>
        </div>
        <label className="block text-xs font-semibold">
          Test Title Tag
          <input
            type="text"
            value={activeTitle}
            onChange={(e) => {
              setCustomTitle(e.target.value);
              setCopiedNotice("");
            }}
            className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-900 focus:border-[#4058D0] focus:outline-none dark:border-slate-700 dark:bg-slate-950 dark:text-white"
          />
        </label>
        <label className="block text-xs font-semibold">
          Test Meta Description
          <textarea
            rows={2}
            value={activeDescription}
            onChange={(e) => {
              setCustomDescription(e.target.value);
              setCopiedNotice("");
            }}
            className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs text-slate-900 focus:border-[#4058D0] focus:outline-none dark:border-slate-700 dark:bg-slate-950 dark:text-white"
          />
        </label>
        {copiedNotice && (
          <p role="status" className="text-xs font-bold text-emerald-700 dark:text-emerald-300">
            {copiedNotice}
          </p>
        )}
      </div>
      <p className={styles.muted}>
        Illustrative Google-style preview. Available width, device, and search
        engine rewrites can change the actual appearance.
      </p>
    </section>
  );
}
