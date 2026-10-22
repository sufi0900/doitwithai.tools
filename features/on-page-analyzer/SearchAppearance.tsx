"use client";
import { useEffect, useRef, useState } from "react";
import {
  BatteryFull,
  Globe2,
  Monitor,
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
  const contentRef = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(600);
  const [layouts, setLayouts] = useState<{
    title: ReturnType<typeof textLayout>;
    description: ReturnType<typeof textLayout>;
  } | null>(null);
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
      page.title,
      Math.min(width, preset.titleWidth),
      preset.titleLines,
      (t) => context.measureText(t).width,
    );
    context.font = "400 14px Arial";
    const description = textLayout(
      page.description,
      Math.min(width, preset.descriptionWidth),
      preset.descriptionLines,
      (t) => context.measureText(t).width,
    );
    setLayouts({ title, description });
  }, [device, page.title, page.description, width]);
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
  return (
    <section
      className={styles.previewCard}
      aria-label="Illustrative search preview"
    >
      <div className={styles.panelTitle}>
        <div>
          <h3>Search appearance</h3>
          <p className={styles.muted}>
            See how your page could appear in search.
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
                page.title ||
                "Add a descriptive page title"}
            </div>
            <p className={styles.mockDescription}>
              {layouts?.description.lines.join("\n") ||
                page.description ||
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
          {Array.from(page.title).length} characters
        </span>
        <span>
          Description {layouts ? `≈ ${layouts.description.pixels} px · ` : ""}
          {Array.from(page.description).length} characters
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
      <p className={styles.muted}>
        Illustrative Google-style preview. Available width, device, and search
        engine rewrites can change the actual appearance.
      </p>
    </section>
  );
}
