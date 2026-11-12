"use client";
import React, { useEffect, useMemo, useRef, useState } from "react";
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
import type { Project, SocialOverride } from "./types";
import {
  articleRevision,
  bodyOf,
  hash,
  patchWorkspace,
  refreshVisual,
  workspace,
  wordCount,
} from "./model";
import {
  CHANNELS,
  sizes,
  socialDrafts,
  SocialPoster,
  posterSvg,
  svgRaster,
  saveBlob,
  newsletter,
  downloadArticle,
  narration,
  carousel,
  downloadBundle,
} from "./assets";
import type { Channel } from "./assets";
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
    [channel, setChannel] = useState<Channel>("Facebook"),
    [busy, setBusy] = useState(""),
    [message, setMessage] = useState(""),
    [audio, setAudio] = useState<
      { files: Blob[]; revision: string } | undefined
    >();
  const abort = useRef<AbortController | null>(null),
    revision = articleRevision(p),
    w = workspace(p),
    posts = useMemo(() => socialDrafts(p), [p]),
    post = posts.find((x) => x.channel === channel),
    email = useMemo(
      () => (posts.length ? newsletter(p) : null),
      [p, posts.length],
    );
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
  const social = (patch: SocialOverride) =>
    onChange((now) => {
      const nw = workspace(now);
      return patchWorkspace(now, {
        social: {
          ...nw.social,
          [channel]: {
            ...nw.social[channel],
            ...patch,
            sourceRevision: articleRevision(now),
          },
        },
      });
    });
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
  const downloadPost = async () => {
    if (!post) return;
    const svg = await posterSvg(
        p,
        channel,
        post.headline,
        post.body,
        post.settings,
      ),
      zip = new JSZip();
    zip.file("caption.txt", post.caption);
    zip.file("image.svg", svg);
    zip.file("image.png", (await fetch(await svgRaster(svg))).blob());
    saveBlob(
      await zip.generateAsync({ type: "blob" }),
      `${channel.toLowerCase()}-post.zip`,
    );
  };
  const audioZip = async () => {
    if (!audio) return;
    const zip = new JSZip();
    audio.files.forEach((blob, i) => zip.file(`chapter-${i + 1}.mp3`, blob));
    saveBlob(
      await zip.generateAsync({ type: "blob" }),
      "article-narration.zip",
    );
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
          <p className={styles.eyebrow}>Beyond the article</p>
          <h2>Your publishing kit</h2>
          <p>
            Turn the current draft into images, posts, and downloadable files.
          </p>
        </div>
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
          Download everything
        </button>
      </div>
      <div
        role="tablist"
        aria-label="Publishing assets"
        className={styles.assetTabs}
      >
        {[
          ["images", "Section images", ImageIcon],
          ["social", "Social & video", Share2],
          ["email", "Email newsletter", Mail],
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
              Your section images and publishing drafts will appear here as the
              article takes shape.
            </p>
          </div>
        ) : (
          <>
            {tab === "images" && (
              <>
                <p className={styles.muted}>
                  Images use the same infographic studio as the standalone tool.
                  Review the source content and refresh a visual after changing
                  its section.
                </p>
                <div className={styles.imageGrid}>
                  {p.sections.map((s, i) => {
                    const scene = s.infographicConfig.nodes.length
                        ? buildInfographicScene(s.infographicConfig)
                        : null,
                      stale = w.visualRevisions?.[s.id] !== hash(bodyOf(s)),
                      available = scene && !scene.issues.length;
                    return (
                      <article className={styles.imageCard} key={s.id}>
                        <div className={styles.imageCanvas}>
                          {available ? (
                            <img
                              src={`data:image/svg+xml;charset=utf-8,${encodeURIComponent(scene.svg)}`}
                              alt={s.infographicConfig.altText || s.h2Text}
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
                            Section {i + 1}
                            {stale && scene ? " · Review after edits" : ""}
                          </p>
                          <h3>{s.h2Text}</h3>
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
            {tab === "social" && post && (
              <>
                <div
                  className={styles.channelTabs}
                  aria-label="Social platform"
                >
                  {CHANNELS.map((c) => (
                    <button
                      type="button"
                      aria-pressed={channel === c}
                      key={c}
                      onClick={() => setChannel(c)}
                    >
                      {c}
                    </button>
                  ))}
                </div>
                <div className={styles.socialGrid}>
                  <div className={styles.formStack}>
                    <div>
                      <p className={styles.eyebrow}>
                        {channel === "YouTube"
                          ? "Video script"
                          : "Post caption"}
                      </p>
                      <h3>A starting point for {channel}</h3>
                      <p className={styles.muted}>
                        {channel === "YouTube"
                          ? "Choose a short script or a longer video outline. Review before recording."
                          : "Choose an angle, then adjust the wording and visual for your audience."}
                      </p>
                    </div>
                    {post.stale && (
                      <p className={styles.notice}>
                        The article changed after this post was customized.
                        Review it or reset to the current draft.
                      </p>
                    )}
                    <label>
                      Suggested angle
                      <select
                        value=""
                        onChange={(e) => {
                          if (e.target.value !== "")
                            social({
                              caption:
                                post.variants[Number(e.target.value)].content,
                            });
                        }}
                      >
                        <option value="" disabled>
                          Choose an alternative…
                        </option>
                        {post.variants.map((v, i) => (
                          <option value={i} key={i}>
                            {v.label}
                          </option>
                        ))}
                      </select>
                    </label>
                    <label>
                      {channel === "YouTube" ? "Script" : "Caption"}
                      <textarea
                        rows={11}
                        maxLength={18000}
                        value={post.caption}
                        onChange={(e) => social({ caption: e.target.value })}
                      />
                    </label>
                    <label>
                      Image headline
                      <input
                        maxLength={100}
                        value={post.headline}
                        onChange={(e) => social({ headline: e.target.value })}
                      />
                    </label>
                    <label>
                      Image summary
                      <textarea
                        rows={3}
                        maxLength={240}
                        value={post.body}
                        onChange={(e) => social({ body: e.target.value })}
                      />
                    </label>
                    <div className={styles.twoCols}>
                      <label>
                        Visual style
                        <select
                          value={post.settings.variant || "executive-minimal"}
                          onChange={(e) => social({ variant: e.target.value })}
                        >
                          <option value="executive-minimal">Editorial</option>
                          <option value="framework-steps">Key takeaways</option>
                          <option value="quote-card">Statement</option>
                        </select>
                      </label>
                      <label>
                        Color theme
                        <select
                          value={post.settings.theme || "brand"}
                          onChange={(e) => social({ theme: e.target.value })}
                        >
                          <option value="brand">Brand midnight</option>
                          <option value="paper">Brand daylight</option>
                        </select>
                      </label>
                    </div>
                    <div className={styles.buttonRow}>
                      <button
                        type="button"
                        disabled={Boolean(busy)}
                        onClick={() => void run("Preparing post", downloadPost)}
                      >
                        <Download size={14} />
                        Download post ZIP
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          saveBlob(
                            post.caption,
                            `${channel.toLowerCase()}-${channel === "YouTube" ? "script" : "caption"}.txt`,
                          )
                        }
                      >
                        Text only
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          onChange((now) => {
                            const nw = workspace(now),
                              next = { ...nw.social };
                            delete next[channel];
                            return patchWorkspace(now, { social: next });
                          })
                        }
                      >
                        Reset to article
                      </button>
                    </div>
                  </div>
                  <div className={styles.socialPreview}>
                    <div className={styles.previewChrome}>
                      <span>{channel} image</span>
                      <span>{sizes[channel].join(" × ")}</span>
                    </div>
                    <SocialPoster
                      p={p}
                      channel={channel}
                      headline={post.headline}
                      body={post.body}
                      settings={post.settings}
                      width={sizes[channel][0]}
                      height={sizes[channel][1]}
                    />
                    <button
                      type="button"
                      disabled={Boolean(busy)}
                      onClick={() =>
                        void run("Rendering image", async () => {
                          const svg = await posterSvg(
                            p,
                            channel,
                            post.headline,
                            post.body,
                            post.settings,
                          );
                          saveBlob(
                            await (await fetch(await svgRaster(svg))).blob(),
                            `${channel.toLowerCase()}.png`,
                          );
                        })
                      }
                    >
                      <Download size={15} />
                      Image only
                    </button>
                  </div>
                </div>
                <div className={styles.carouselRow}>
                  <div>
                    <h3>LinkedIn carousel</h3>
                    <p className={styles.muted}>
                      A portrait slide deck built from this article’s sections.
                    </p>
                  </div>
                  <button
                    type="button"
                    disabled={Boolean(busy)}
                    onClick={() =>
                      void run("Rendering carousel", async () => {
                        const out = await carousel(p);
                        saveBlob(
                          out.pdf,
                          "article-carousel.pdf",
                          "application/pdf",
                        );
                      })
                    }
                  >
                    Download carousel PDF
                    <Download size={15} />
                  </button>
                </div>
              </>
            )}
            {tab === "email" && email && (
              <div className={styles.emailGrid}>
                <div className={styles.formStack}>
                  <h3>Your email edition</h3>
                  <p className={styles.muted}>
                    Select a subject, then edit the newsletter. Your changes are
                    saved with this project.
                  </p>
                  <label>
                    Subject line
                    <input
                      value={w.email?.subject ?? email.draft.selectedSubject}
                      maxLength={180}
                      onChange={(e) =>
                        onChange((now) =>
                          patchWorkspace(now, {
                            email: {
                              subject: e.target.value,
                              body:
                                workspace(now).email?.body ??
                                newsletter(now).text.replace(
                                  /^Subject:[^\n]*\n*/i,
                                  "",
                                ),
                              sourceRevision: articleRevision(now),
                            },
                          }),
                        )
                      }
                    />
                  </label>
                  <details className={styles.details}>
                    <summary>Try another subject</summary>
                    {email.draft.subjectOptions.map((subject, i) => (
                      <button
                        type="button"
                        className={styles.option}
                        key={i}
                        onClick={() =>
                          onChange((now) =>
                            patchWorkspace(now, {
                              email: {
                                subject,
                                body:
                                  workspace(now).email?.body ??
                                  newsletter(now).text.replace(
                                    /^Subject:[^\n]*\n*/i,
                                    "",
                                  ),
                                sourceRevision: articleRevision(now),
                              },
                            }),
                          )
                        }
                      >
                        {subject}
                      </button>
                    ))}
                  </details>
                  {w.email && w.email.sourceRevision !== revision && (
                    <p className={styles.notice}>
                      Review this newsletter against the latest article
                      revision.
                    </p>
                  )}
                  <div className={styles.buttonRow}>
                    <button
                      type="button"
                      onClick={() => saveBlob(email.text, "newsletter.txt")}
                    >
                      Text
                      <Download size={14} />
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        saveBlob(email.html, "newsletter.html", "text/html")
                      }
                    >
                      HTML
                      <Download size={14} />
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        onChange((now) =>
                          patchWorkspace(now, { email: undefined }),
                        )
                      }
                    >
                      Reset to article
                    </button>
                  </div>
                </div>
                <label>
                  Newsletter body
                  <textarea
                    rows={20}
                    className={styles.newsletter}
                    value={
                      w.email?.body ??
                      email.text.replace(/^Subject:[^\n]*\n*/i, "")
                    }
                    onChange={(e) =>
                      onChange((now) =>
                        patchWorkspace(now, {
                          email: {
                            subject:
                              workspace(now).email?.subject ??
                              email.draft.selectedSubject,
                            body: e.target.value,
                            sourceRevision: articleRevision(now),
                          },
                        }),
                      )
                    }
                  />
                </label>
              </div>
            )}
            {tab === "downloads" && (
              <>
                <div className={styles.downloadGrid}>
                  <div className={styles.downloadCard}>
                    <FileDown />
                    <h3>Article files</h3>
                    <p>
                      Download the current editor content in the format you
                      need.
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
                    <h3>Project backup</h3>
                    <p>
                      Includes the editable article, outline, branding, and your
                      saved asset customizations.
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
                    <h3>Article narration</h3>
                    <p>
                      Optional speech service. Generates complete MP3 chapters;
                      availability and limits depend on the configured provider.
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
