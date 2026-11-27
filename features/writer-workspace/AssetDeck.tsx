"use client";
import React, { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import {
  Download,
  ImageIcon,
  Mail,
  Share2,
  FileDown,
  RefreshCw,
  ArrowUpRight,
  Volume2,
  X,
  Check,
} from "lucide-react";
import JSZip from "jszip";
import {
  buildInfographicScene,
  generateBlogInfographicSvg,
} from "@/lib/blog-infographic-studio/canvas-renderer";
import { serializeBlogProjectToJson } from "@/lib/blog-writer/project-storage-db";
import type { Project } from "./types";
import {
  articleRevision,
  bodyOf,
  evaluateAltText,
  hash,
  patchWorkspace,
  refreshVisual,
  workspace,
  wordCount,
} from "./model";
import {
  socialDrafts,
  saveBlob,
  svgRaster,
  downloadArticle,
  narration,
  downloadBundle,
} from "./assets";
import styles from "./workspace.module.css";

export default function AssetDeck({
  project: p,
  onChange,
  onEditVisual,
  onInsertVisual,
}: {
  project: Project;
  onChange: (f: (p: Project) => Project) => unknown;
  onEditVisual: (id: string) => void;
  onInsertVisual: (id: string) => void;
}) {
  const [tab, setTab] = useState("images"),
    [busy, setBusy] = useState(""),
    [message, setMessage] = useState(""),
    [audio, setAudio] = useState<
      { files: Blob[]; revision: string } | undefined
    >();
  const abort = useRef<AbortController | null>(null),
    revision = articleRevision(p),
    w = workspace(p),
    posts = useMemo(() => socialDrafts(p), [p]);

  useEffect(() => () => abort.current?.abort(), []);

  const run = async (label: string, task: () => Promise<unknown>) => {
    if (busy) return;
    setBusy(label);
    setMessage("");
    try {
      const result = await task();
      setMessage(
        Array.isArray(result) && result.length
          ? result.join(" ")
          : "Your download is ready.",
      );
    } catch (e) {
      setMessage(
        e instanceof Error
          ? e.message
          : "This asset could not be prepared. Try again.",
      );
    } finally {
      setBusy("");
    }
  };

  const refresh = (sid: string) =>
    onChange((now) => {
      const s = now.sections.find((s) => s.id === sid);
      if (!s) return now;
      return patchWorkspace(
        {
          ...now,
          sections: now.sections.map((s) =>
            s.id === sid ? refreshVisual(s, now) : s,
          ),
        },
        {
          visualRevisions: {
            ...workspace(now).visualRevisions,
            [sid]: hash(bodyOf(s)),
          },
        },
      );
    });

  const audioZip = async () => {
    if (!audio?.files.length) return [];
    const zip = new JSZip();
    audio.files.forEach((file, i) => {
      zip.file(`chapter-${i + 1}.mp3`, file);
    });
    const blob = await zip.generateAsync({
      type: "blob",
      compression: "DEFLATE",
      compressionOptions: { level: 3 },
    });
    saveBlob(blob, `${p.metaPack.urlSlug || "article"}-narration.zip`);
    return [];
  };

  const hasContent = posts.length > 0;

  return (
    <section
      className={styles.assetDeck}
      aria-label="Article assets"
      id="writer-assets"
    >
      <div className={styles.assetHeader}>
        <div>
          <p className={styles.eyebrow}>
            Section Visuals &amp; Publishing Downloads
          </p>
          <h2>Section Infographics &amp; Article Exports</h2>
          <p>
            Customize inline H2 infographic illustrations, WCAG alt text, and
            article exports — or open this article directly in your dedicated
            Social &amp; Email Studios.
          </p>
        </div>
        <div className={styles.buttonRow}>
          <Link
            href={`/studio/social?articleId=${encodeURIComponent(p.projectId)}&mode=workbench`}
            className="inline-flex items-center gap-1.5 rounded-xl border border-slate-700/80 bg-slate-900/70 px-3.5 py-2 text-xs font-bold text-slate-100 transition hover:border-[#5271FF]"
          >
            <Share2 size={14} className="text-[#9aabff]" />
            <span>Open in Social &amp; Video Studio</span>
            <ArrowUpRight size={13} />
          </Link>
          <Link
            href={`/studio/email?articleId=${encodeURIComponent(p.projectId)}&mode=workbench`}
            className="inline-flex items-center gap-1.5 rounded-xl border border-slate-700/80 bg-slate-900/70 px-3.5 py-2 text-xs font-bold text-slate-100 transition hover:border-[#5271FF]"
          >
            <Mail size={14} className="text-[#9aabff]" />
            <span>Open in Email Newsletter Studio</span>
            <ArrowUpRight size={13} />
          </Link>
          <button
            type="button"
            className={styles.primary}
            disabled={!hasContent || Boolean(busy)}
            onClick={() =>
              void run("Preparing your kit", () =>
                downloadBundle(p, setBusy, audio),
              )
            }
          >
            <Download size={16} />
            Download everything (.ZIP)
          </button>
        </div>
      </div>

      <div
        role="tablist"
        aria-label="Publishing assets"
        className={styles.assetTabs}
      >
        {[
          ["images", "Section images", ImageIcon],
          ["downloads", "Downloads & audio", FileDown],
        ].map(([key, label, Icon]: any) => (
          <button
            type="button"
            role="tab"
            id={`asset-tab-${key}`}
            aria-controls={`asset-panel-${key}`}
            aria-selected={tab === key}
            key={key}
            onClick={() => {
              setTab(key);
              setMessage("");
            }}
          >
            <Icon size={16} />
            {label}
          </button>
        ))}
      </div>

      {busy && (
        <p className={styles.progress} role="status">
          {busy}…
        </p>
      )}
      {message && (
        <p className={styles.notice} role="status">
          {message}
        </p>
      )}

      <div
        role="tabpanel"
        id={`asset-panel-${tab}`}
        aria-labelledby={`asset-tab-${tab}`}
        className={styles.assetBody}
      >
        {!hasContent ? (
          <div className={styles.assetEmpty}>
            <ImageIcon size={30} />
            <h3>Write first. Repurpose next.</h3>
            <p>
              Your section infographics, Facebook/Instagram/LinkedIn social
              cards, YouTube video scripts, email newsletter, and downloadable
              files will appear here automatically once your article draft is
              generated.
            </p>
          </div>
        ) : (
          <>
            {tab === "images" && (
              <>
                <p className={styles.muted}>
                  Every H2 section pairs with our Blog Section Infographic
                  Generator. Click <strong>Customize</strong> on any card to
                  switch layout compositions, color themes, or explanations.
                </p>
                <div className={styles.imageGrid}>
                  {p.sections.map((s, i) => {
                    const scene = s.infographicConfig.nodes.length
                        ? buildInfographicScene(s.infographicConfig)
                        : null,
                      stale = w.visualRevisions?.[s.id] !== hash(bodyOf(s)),
                      available = scene && !scene.issues.length,
                      altTextVal =
                        w.sectionAltTexts?.[s.id]?.altText ||
                        s.infographicConfig.altText ||
                        s.h2Text,
                      altEval = evaluateAltText(altTextVal, s.h2Text);
                    return (
                      <article className={styles.imageCard} key={s.id}>
                        <div className={styles.imageCanvas}>
                          {available ? (
                            <img
                              src={`data:image/svg+xml;charset=utf-8,${encodeURIComponent(scene.svg)}`}
                              alt={altTextVal}
                            />
                          ) : (
                            <div className={styles.assetEmpty}>
                              <ImageIcon />
                              <p>
                                {scene?.issues[0]?.message ||
                                  "Add an explanation to this section, then build its visual."}
                              </p>
                            </div>
                          )}
                        </div>
                        <div className={styles.imageInfo}>
                          <p className={styles.eyebrow}>
                            Section {i + 1} · Alt Score {altEval.score}/100
                            {stale && scene ? " · Review after edits" : ""}
                          </p>
                          <h3>{s.h2Text}</h3>
                          <label className={styles.inlineAltBox}>
                            <span>WCAG Alt Text:</span>
                            <input
                              value={altTextVal}
                              onChange={(e) => {
                                const val = e.target.value;
                                const nextCheck = evaluateAltText(val, s.h2Text);
                                onChange((now) => {
                                  const nw = workspace(now);
                                  return {
                                    ...now,
                                    sections: now.sections.map((sec) =>
                                      sec.id === s.id
                                        ? {
                                            ...sec,
                                            infographicConfig: {
                                              ...sec.infographicConfig,
                                              altText: val,
                                            },
                                          }
                                        : sec,
                                    ),
                                    writerWorkspace: {
                                      ...nw,
                                      sectionAltTexts: {
                                        ...(nw.sectionAltTexts || {}),
                                        [s.id]: {
                                          altText: val,
                                          score: nextCheck.score,
                                          verdict: nextCheck.verdict,
                                        },
                                      },
                                    },
                                  };
                                });
                              }}
                              placeholder={`Describe visual for ${s.h2Text}`}
                            />
                          </label>
                          <div className={styles.buttonRow}>
                            <button
                              type="button"
                              disabled={wordCount(bodyOf(s)) < 35}
                              onClick={() => refresh(s.id)}
                            >
                              <RefreshCw size={14} />
                              {scene ? "Refresh" : "Build visual"}
                            </button>
                            <button
                              type="button"
                              onClick={() => onEditVisual(s.id)}
                            >
                              Customize
                              <ArrowUpRight size={14} />
                            </button>
                          </div>
                          <div className={styles.buttonRow}>
                            <button
                              type="button"
                              disabled={!available || Boolean(busy)}
                              onClick={() =>
                                void run("Rendering PNG", async () => {
                                  saveBlob(
                                    await (
                                      await fetch(
                                        await svgRaster(
                                          generateBlogInfographicSvg(
                                            s.infographicConfig,
                                          ),
                                        ),
                                      )
                                    ).blob(),
                                    `section-${i + 1}.png`,
                                  );
                                })
                              }
                            >
                              PNG
                            </button>
                            <button
                              type="button"
                              disabled={!available}
                              onClick={() =>
                                saveBlob(
                                  generateBlogInfographicSvg(
                                    s.infographicConfig,
                                  ),
                                  `section-${i + 1}.svg`,
                                  "image/svg+xml",
                                )
                              }
                            >
                              SVG
                            </button>
                            <button
                              type="button"
                              disabled={!available}
                              onClick={() => onInsertVisual(s.id)}
                            >
                              Insert in article
                            </button>
                          </div>
                        </div>
                      </article>
                    );
                  })}
                </div>
                {!p.sections.length && (
                  <p>
                    Create an H2 heading and add its explanation to make a
                    section visual.
                  </p>
                )}
              </>
            )}

            {tab === "downloads" && (
              <>
                <div className={styles.downloadGrid}>
                  <div className={styles.downloadCard}>
                    <FileDown />
                    <h3>Article files (Individual Downloads)</h3>
                    <p>
                      Download the current editor content in PDF, Word (.DOCX),
                      Clean HTML, Markdown, or EPUB format with embedded section
                      infographics.
                    </p>
                    <div className={styles.buttonRow}>
                      {["pdf", "docx", "html", "markdown", "epub"].map(
                        (format) => (
                          <button
                            type="button"
                            key={format}
                            disabled={Boolean(busy)}
                            onClick={() =>
                              void run(
                                `Preparing ${format.toUpperCase()}`,
                                () => downloadArticle(p, format),
                              )
                            }
                          >
                            {format.toUpperCase()}
                            <Download size={13} />
                          </button>
                        ),
                      )}
                    </div>
                  </div>
                  <div className={styles.downloadCard}>
                    <Download />
                    <h3>Project backup (.JSON)</h3>
                    <p>
                      Includes the editable article, outline, branding, and your
                      saved social &amp; visual customizations.
                    </p>
                    <button
                      type="button"
                      onClick={() =>
                        saveBlob(
                          serializeBlogProjectToJson(p),
                          `${p.metaPack.urlSlug || "article"}.blogproject.json`,
                          "application/json",
                        )
                      }
                    >
                      Download project JSON
                      <Download size={14} />
                    </button>
                  </div>
                  <div className={styles.downloadCard}>
                    <Volume2 />
                    <h3>Article audio narration (MP3)</h3>
                    <p>
                      Optional speech service. Generates complete MP3 audio
                      chapters from your article draft.
                    </p>
                    {audio && (
                      <p className={styles.notice}>
                        {audio.revision === revision ? (
                          <>
                            <Check size={14} /> {audio.files.length} MP3
                            chapters ready
                          </>
                        ) : (
                          "Article changed. Regenerate narration for this revision."
                        )}
                      </p>
                    )}
                    <div className={styles.buttonRow}>
                      <button
                        type="button"
                        disabled={Boolean(busy)}
                        onClick={() =>
                          void run("Starting narration", async () => {
                            const c = new AbortController();
                            abort.current = c;
                            setAudio(await narration(p, c.signal, setBusy));
                          })
                        }
                      >
                        Generate narration
                      </button>
                      {busy.includes("Narrat") || busy.includes("narrat") ? (
                        <button
                          type="button"
                          onClick={() => abort.current?.abort()}
                        >
                          <X size={14} />
                          Stop
                        </button>
                      ) : null}
                      {audio && (
                        <button
                          type="button"
                          disabled={Boolean(busy)}
                          onClick={() =>
                            void run("Preparing audio ZIP", audioZip)
                          }
                        >
                          Download MP3 ZIP
                        </button>
                      )}
                    </div>
                  </div>
                </div>
                <p className={styles.muted}>
                  Downloads are generated from this draft when requested. The
                  full ZIP includes a manifest listing files and any formats
                  that could not be prepared. No publishing happens here.
                </p>
              </>
            )}
          </>
        )}
      </div>
    </section>
  );
}
