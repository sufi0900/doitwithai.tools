"use client";

import { useMemo, useState } from "react";
import {
  Check,
  Code2,
  Copy,
  Monitor,
  Smartphone,
  Sparkles,
} from "lucide-react";
import SerpCanvas, { type Layouts, type Scene } from "@/features/serp-preview/SerpCanvas";
import RichResultCard from "@/features/serp-preview/RichResultCard";
import { PRESETS, textLayout, type Device } from "@/features/serp-preview/preview";
import {
  measureMetaDescriptionPixelWidth,
  measureTitlePixelWidth,
  normalizeSeoSlug,
} from "@/lib/blog-writer/deterministic-analyzers";
import { buildArticleSchemaJsonLd, safeUrl, workspace } from "./model";
import type { Project } from "./types";
import s from "./workspace.module.css";

export function SearchAppearancePanel({
  project,
  onUpdateMeta,
}: {
  project: Project;
  onUpdateMeta: (patch: Partial<Project["metaPack"]>) => void;
}) {
  const [device, setDevice] = useState<Device>("desktop");
  const [showSchema, setShowSchema] = useState(false);
  const [showSerpPreview, setShowSerpPreview] = useState(true);
  const [showVariations, setShowVariations] = useState(false);
  const [copiedJsonLd, setCopiedJsonLd] = useState(false);

  const w = workspace(project);
  const title = project.metaPack.metaTitle || "";
  const description = project.metaPack.metaDescription || "";
  const slug = project.metaPack.urlSlug || "";
  const baseOrigin =
    safeUrl(project.metaPack.canonicalUrl) ||
    safeUrl(project.brandSiteUrl) ||
    "https://example.com";
  let displayUrl = "https://example.com/article";
  try {
    const u = new URL(baseOrigin);
    displayUrl = `${u.origin}/${slug.replace(/^\/+/, "") || "article"}`;
  } catch {
    displayUrl = `https://example.com/${slug.replace(/^\/+/, "") || "article"}`;
  }

  const titlePx = Math.round(measureTitlePixelWidth(title));
  const descPx = Math.round(measureMetaDescriptionPixelWidth(description));

  const titleOptions = useMemo(() => {
    const list = [
      ...(w.serpTitles || []),
      project.metaPack.h1Title,
      project.metaPack.metaTitle,
    ].filter((x, i, a) => Boolean(x?.trim()) && a.indexOf(x) === i);
    return list.slice(0, 5);
  }, [w.serpTitles, project.metaPack.h1Title, project.metaPack.metaTitle]);

  const descOptions = useMemo(() => {
    const list = [
      ...(w.metaDescriptions || []),
      project.metaPack.metaDescription,
    ].filter((x, i, a) => Boolean(x?.trim()) && a.indexOf(x) === i);
    return list.slice(0, 4);
  }, [w.metaDescriptions, project.metaPack.metaDescription]);

  const preset = PRESETS[device];
  const layouts: Layouts = useMemo(
    () => ({
      title: textLayout(
        title || project.metaPack.h1Title || "Article title",
        preset.titleWidth,
        preset.titleLines,
        (t) => t.length * (device === "desktop" ? 9.6 : 8.8),
      ),
      description: textLayout(
        description || "Write a clear description for readers searching Google.",
        preset.descriptionWidth,
        preset.descriptionLines,
        (d) => d.length * 7.2,
      ),
    }),
    [title, project.metaPack.h1Title, description, preset, device],
  );

  let hostLabel = "example.com";
  try {
    hostLabel = new URL(displayUrl).hostname;
  } catch {}

  const scene: Scene = {
    device,
    country: "US",
    query: project.keywordCluster.primaryKeyword || "",
    siteName: w.brand.name || hostLabel,
    faviconUrl: "",
    date: "",
    rating: "",
    reviews: "",
    aiOverview: false,
    heatmap: false,
  };

  const schemaData = useMemo(() => buildArticleSchemaJsonLd(project), [project]);
  const schemaString = useMemo(
    () => JSON.stringify(schemaData.combinedGraph, null, 2),
    [schemaData],
  );

  const faqPreview = useMemo(
    () =>
      (project.faqs || [])
        .filter((f) => f.question?.trim() && f.answer?.trim())
        .map((f) => ({ question: f.question.trim(), answer: f.answer.trim() })),
    [project.faqs],
  );

  return (
    <section className={s.metaPanel} aria-label="Search appearance, SERP preview and structured data">
      <div className={s.metaHeader}>
        <div>
          <span className={s.eyebrow}>Search Appearance &amp; Rich Results</span>
          <h2>Meta Title, Description, SERP Simulator &amp; Schema</h2>
        </div>

        <div className={s.serpHeaderActions}>
          <button
            type="button"
            className={s.inlineToggleBtn}
            onClick={() => setShowSerpPreview((v) => !v)}
          >
            {showSerpPreview ? "Hide SERP Canvas" : "Show SERP Canvas"}
          </button>
          <button
            type="button"
            className={s.inlineToggleBtn}
            onClick={() => setShowSchema((v) => !v)}
          >
            <Code2 className="w-3.5 h-3.5" aria-hidden />
            JSON-LD ({faqPreview.length ? "Article + FAQPage" : "Article"})
          </button>
        </div>
      </div>

      <div className={s.metaGrid}>
        <div>
          <label className={s.label} htmlFor="meta-title-input">
            Meta Title{" "}
            <span className={titlePx > 600 ? s.pixelWarn : s.pixelOk}>
              ({title.length} chars · {titlePx}/580 px)
            </span>
          </label>
          <input
            id="meta-title-input"
            className={s.input}
            value={title}
            onChange={(e) => onUpdateMeta({ metaTitle: e.target.value })}
            placeholder="SEO title shown in Google search results"
          />
          <div className={s.pixelTrack} aria-hidden>
            <div
              className={titlePx > 580 ? s.pixelFillWarn : s.pixelFillOk}
              style={{ width: `${Math.min(100, Math.round((titlePx / 580) * 100))}%` }}
            />
          </div>
        </div>

        <div>
          <label className={s.label} htmlFor="meta-slug-input">
            URL Slug / Canonical Path
          </label>
          <input
            id="meta-slug-input"
            className={s.input}
            value={slug}
            onChange={(e) =>
              onUpdateMeta({
                urlSlug: e.target.value
                  .toLowerCase()
                  .replace(/[^a-z0-9-/]+/g, "-")
                  .replace(/^\/+/, ""),
              })
            }
            onBlur={() =>
              onUpdateMeta({ urlSlug: normalizeSeoSlug(slug || title) })
            }
            placeholder="clean-article-slug"
          />
          <div className={s.leftMetaSub}>Canonical preview: {displayUrl}</div>
        </div>

        <div className={s.metaFullWidth}>
          <label className={s.label} htmlFor="meta-desc-input">
            Meta Description{" "}
            <span className={descPx > 960 ? s.pixelWarn : s.pixelOk}>
              ({description.length} chars · {descPx}/920 px)
            </span>
          </label>
          <textarea
            id="meta-desc-input"
            className={`${s.area} ${s.metaDescArea}`}
            value={description}
            onChange={(e) => onUpdateMeta({ metaDescription: e.target.value })}
            placeholder="Compelling 140–160 character summary for searchers"
          />
          <div className={s.pixelTrack} aria-hidden>
            <div
              className={descPx > 920 ? s.pixelFillWarn : s.pixelFillOk}
              style={{ width: `${Math.min(100, Math.round((descPx / 920) * 100))}%` }}
            />
          </div>
        </div>
      </div>

      {titleOptions.length > 1 || descOptions.length > 1 ? (
        <div className={s.variationsBar}>
          <button
            type="button"
            className={s.variationsTrigger}
            onClick={() => setShowVariations((v) => !v)}
          >
            <Sparkles className="w-3.5 h-3.5" aria-hidden />
            Switch Title &amp; Description Variations ({titleOptions.length} Titles · {descOptions.length} Descriptions)
          </button>

          {showVariations ? (
            <div className={s.variationsGrid}>
              <div>
                <div className={s.label}>Meta Title Options</div>
                <div className={s.variationStack}>
                  {titleOptions.map((opt, idx) => (
                    <button
                      key={`${opt}-${idx}`}
                      type="button"
                      className={`${s.variationBtn} ${opt === title ? s.variationBtnOn : ""}`}
                      onClick={() => onUpdateMeta({ metaTitle: opt })}
                    >
                      <span>{idx === 0 ? "★ Best Pick: " : `Option ${idx + 1}: `}</span>
                      {opt}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <div className={s.label}>Meta Description Options</div>
                <div className={s.variationStack}>
                  {descOptions.map((opt, idx) => (
                    <button
                      key={`${opt}-${idx}`}
                      type="button"
                      className={`${s.variationBtn} ${opt === description ? s.variationBtnOn : ""}`}
                      onClick={() => onUpdateMeta({ metaDescription: opt })}
                    >
                      <span>{idx === 0 ? "★ Best Pick: " : `Option ${idx + 1}: `}</span>
                      {opt}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          ) : null}
        </div>
      ) : null}

      {showSerpPreview ? (
        <div className={s.serpPreviewFrame}>
          <div className={s.serpPreviewTop}>
            <strong>Interactive Google Search Preview</strong>
            <div className={s.deviceSwitch}>
              <button
                type="button"
                className={device === "desktop" ? s.deviceOn : ""}
                onClick={() => setDevice("desktop")}
              >
                <Monitor className="w-3.5 h-3.5" aria-hidden /> Desktop
              </button>
              <button
                type="button"
                className={device === "mobile" ? s.deviceOn : ""}
                onClick={() => setDevice("mobile")}
              >
                <Smartphone className="w-3.5 h-3.5" aria-hidden /> Mobile
              </button>
            </div>
          </div>

          <div className={device === "mobile" ? s.serpMobileWrap : s.serpDesktopWrap}>
            <SerpCanvas
              snippet={{
                title: title || project.metaPack.h1Title || "Article title",
                url: displayUrl,
                description:
                  description || "Write a clear summary of your article.",
              }}
              scene={scene}
              layouts={layouts}
            />
          </div>

          {faqPreview.length ? (
            <div className={s.richFaqWrap}>
              <div className={s.label}>FAQ Rich Result Simulation ({faqPreview.length} Questions)</div>
              <RichResultCard block={{ type: "FAQPage", data: faqPreview }} />
            </div>
          ) : null}
        </div>
      ) : null}

      {showSchema ? (
        <div className={s.schemaDrawer}>
          <div className={s.schemaDrawerTop}>
            <strong>Schema.org JSON-LD (Ready to Paste in &lt;head&gt;)</strong>
            <button
              type="button"
              className={s.btn}
              onClick={() => {
                void navigator.clipboard.writeText(
                  `<script type="application/ld+json">\n${schemaString}\n</script>`,
                );
                setCopiedJsonLd(true);
                setTimeout(() => setCopiedJsonLd(false), 1800);
              }}
            >
              {copiedJsonLd ? (
                <>
                  <Check className="w-3.5 h-3.5" aria-hidden /> Copied!
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" aria-hidden /> Copy JSON-LD Script
                </>
              )}
            </button>
          </div>
          <pre className={s.schemaCode}>{schemaString}</pre>
        </div>
      ) : null}
    </section>
  );
}
