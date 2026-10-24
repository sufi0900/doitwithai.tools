"use client";
import { useDeferredValue, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { z } from "zod";
import {
  Globe,
  Loader2,
  Monitor,
  Smartphone,
  Download,
  Copy,
  Share2,
  RotateCcw,
  Sparkles,
} from "lucide-react";
import {
  inputClass,
  panelClass,
  primaryButton,
  secondaryButton,
} from "@/features/writing-tools/config";
import {
  defaultSnippetState,
  extractRichResultBlocks,
  parseJsonLdInput,
  validateSnippet,
} from "./generator";
import {
  PRESETS,
  textLayout,
  highlightParts,
  metadataHtml,
  type Device,
} from "./preview";
import { importSerpData } from "./client";
import SerpCanvas, { type Layouts, type Scene } from "./SerpCanvas";
import RichResultCard from "./RichResultCard";
import { savePreviewPng } from "./export";
import type { SnippetState } from "./types";

const countries = {
  US: "United States",
  GB: "United Kingdom",
  CA: "Canada",
  AU: "Australia",
  PK: "Pakistan",
  IN: "India",
  DE: "Germany",
  FR: "France",
  AE: "United Arab Emirates",
  SG: "Singapore",
};
const initialScene: Scene = {
  device: "desktop",
  country: "US",
  query: "",
  siteName: "",
  faviconUrl: "",
  date: "",
  rating: "",
  reviews: "",
  aiOverview: false,
  heatmap: false,
};
const shareSchema = z.object({
  snippet: z.object({
    title: z.string().max(1000),
    description: z.string().max(3000),
    url: z.string().max(2048),
  }),
  scene: z.object({
    device: z.enum(["desktop", "mobile"]),
    country: z.string().max(2),
    query: z.string().max(100),
    siteName: z.string().max(200),
    faviconUrl: z.string().max(2048),
    date: z.string().max(30),
    rating: z.string().max(10),
    reviews: z.string().max(20),
    aiOverview: z.boolean(),
    heatmap: z.boolean(),
  }),
  jsonLd: z.string().max(8000),
});
function PixelMeter({
  label,
  block,
  width,
  lines,
  characters,
}: {
  label: string;
  block: Layouts["title"] | undefined;
  width: number;
  lines: number;
  characters: number;
}) {
  return (
    <div
      className={`mt-2 rounded-xl border p-3 text-xs ${block?.truncated ? "border-amber-300 bg-amber-50 text-amber-950 dark:border-amber-800 dark:bg-amber-950/40 dark:text-amber-100" : "border-slate-200 bg-slate-50 text-slate-600 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300"}`}
    >
      <div className="flex flex-wrap justify-between gap-2">
        <strong>
          {label}: {block ? `${block.pixels} px` : "measuring…"}
        </strong>
        <span>{characters} characters</span>
      </div>
      <div className="my-2 h-1.5 overflow-hidden rounded bg-slate-200 dark:bg-slate-700">
        <div
          className={`h-full ${block?.truncated ? "bg-amber-500" : "bg-emerald-500"}`}
          style={{
            width: `${Math.min(100, ((block?.pixels || 0) / (width * lines)) * 100)}%`,
          }}
        />
      </div>
      <p className="leading-5">
        {width} px per line · {lines} line{lines > 1 ? "s" : ""} ·{" "}
        {block
          ? block.truncated
            ? "Likely clipped in this preset"
            : "Fits this preview preset"
          : "Pixel measurement requires browser canvas"}
      </p>
    </div>
  );
}

export default function SerpPreviewClient() {
  const [snippet, setSnippet] = useState<SnippetState>(defaultSnippetState);
  const [scene, setScene] = useState<Scene>(initialScene);
  const [importUrl, setImportUrl] = useState("");
  const [includeSchema, setIncludeSchema] = useState(true);
  const [importing, setImporting] = useState(false);
  const [message, setMessage] = useState<{
    error: boolean;
    text: string;
  } | null>(null);
  const [jsonLdText, setJsonLdText] = useState("");
  const [mode, setMode] = useState<"snippet" | "rich">("snippet");
  const [layouts, setLayouts] = useState<Layouts | null>(null);
  const [exporting, setExporting] = useState(false);
  const [hiddenBlocks, setHiddenBlocks] = useState<number[]>([]);
  const active = useRef<AbortController | null>(null);
  const svg = useRef<SVGSVGElement>(null);
  useEffect(
    () => () => {
      active.current?.abort();
      active.current = null;
    },
    [],
  );
  useEffect(() => {
    if (!window.location.hash.startsWith("#preview=")) return;
    try {
      if (window.location.hash.length > 12000) throw new Error();
      const parsed = shareSchema.parse(
        JSON.parse(decodeURIComponent(window.location.hash.slice(9))),
      );
      setSnippet(parsed.snippet);
      setScene({
        ...parsed.scene,
        faviconUrl: "",
        country:
          parsed.scene.country in countries ? parsed.scene.country : "US",
      });
      setJsonLdText(parsed.jsonLd);
      setMessage({
        error: false,
        text: "Shared preview loaded. No webpage was fetched automatically.",
      });
    } catch {
      setMessage({
        error: true,
        text: "This shared preview is invalid or too large. Enter your metadata to start a new preview.",
      });
    }
  }, []);
  const deferredJsonLdText = useDeferredValue(jsonLdText);
  const { richBlocks, jsonError } = useMemo(() => {
    try {
      return {
        richBlocks: extractRichResultBlocks(
          parseJsonLdInput(deferredJsonLdText),
        ),
        jsonError: "",
      };
    } catch {
      return {
        richBlocks: [],
        jsonError:
          "Enter valid JSON-LD. Copy only the contents of the structured data script, without the script tags.",
      };
    }
  }, [deferredJsonLdText]);
  const issues = useMemo(() => validateSnippet(snippet), [snippet]);
  const preset = PRESETS[scene.device];
  const dateLabel = useMemo(() => {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(scene.date)) return "";
    const date = new Date(scene.date + "T12:00:00Z");
    if (!Number.isFinite(date.getTime())) return "";
    return date.toLocaleDateString(scene.country === "US" ? "en-US" : "en-GB", {
      year: "numeric",
      month: "short",
      day: "numeric",
      timeZone: "UTC",
    });
  }, [scene.date, scene.country]);
  useEffect(() => {
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    if (!ctx) {
      setLayouts(null);
      return;
    }
    ctx.font = "400 20px Arial";
    const title = textLayout(
      snippet.title,
      preset.titleWidth,
      preset.titleLines,
      (s) => ctx.measureText(s).width,
    );
    const description = textLayout(
      `${dateLabel ? `${dateLabel} · ` : ""}${snippet.description}`,
      preset.descriptionWidth,
      preset.descriptionLines,
      (s) =>
        highlightParts(s, scene.query).reduce((sum, part) => {
          ctx.font = `${part.bold ? 700 : 400} 14px Arial`;
          return sum + ctx.measureText(part.text).width;
        }, 0),
    );
    setLayouts({ title, description });
  }, [snippet.title, snippet.description, preset, dateLabel, scene.query]);
  function update(key: keyof SnippetState, value: string) {
    setSnippet((previous) => ({ ...previous, [key]: value }));
  }
  function changeScene<K extends keyof Scene>(key: K, value: Scene[K]) {
    setScene((previous) => ({ ...previous, [key]: value }));
  }
  async function handleImport(e: React.FormEvent) {
    e.preventDefault();
    let url: string;
    try {
      const parsed = new URL(
        /^https?:\/\//i.test(importUrl.trim())
          ? importUrl.trim()
          : `https://${importUrl.trim()}`,
      );
      if (
        !importUrl.trim() ||
        !/^https?:$/.test(parsed.protocol) ||
        parsed.username ||
        parsed.password
      )
        throw new Error();
      url = parsed.toString();
    } catch {
      setMessage({
        error: true,
        text: "Enter a public http:// or https:// webpage URL.",
      });
      return;
    }
    active.current?.abort();
    const controller = new AbortController();
    active.current = controller;
    const timer = setTimeout(() => controller.abort(), 24000);
    setImporting(true);
    setMessage(null);
    try {
      const outcome = await importSerpData(
        url,
        includeSchema,
        controller.signal,
      );
      if (active.current !== controller) return;
      if (outcome.ok === false) {
        setMessage({
          error: true,
          text: controller.signal.aborted
            ? "The import timed out. Try quick import by turning off the structured data scan."
            : `${outcome.message} The preview still shows your previous values.`,
        });
        return;
      }
      setSnippet({
        title: outcome.title,
        description: outcome.description,
        url: outcome.finalUrl,
      });
      setScene((previous) => ({
        ...previous,
        siteName: outcome.siteName,
        faviconUrl: outcome.faviconUrl,
        date: "",
        rating: "",
        reviews: "",
      }));
      setJsonLdText(
        outcome.jsonLd.length ? JSON.stringify(outcome.jsonLd) : "",
      );
      setHiddenBlocks([]);
      setMessage({
        error: false,
        text: `Imported available metadata and ${outcome.jsonLd.length} structured data block(s). ${outcome.warnings.join(" ")}${!outcome.title ? " No title was found in the returned HTML." : ""}${!outcome.description ? " No meta description was found." : ""} Recent imports may be reused for five minutes.`,
      });
    } finally {
      clearTimeout(timer);
      if (active.current === controller) {
        setImporting(false);
        active.current = null;
      }
    }
  }
  async function copy(kind: "html" | "share") {
    try {
      let value: string;
      if (kind === "html")
        value = metadataHtml(
          snippet.title,
          snippet.description,
          scene.siteName,
          jsonLdText,
        );
      else {
        const data = JSON.stringify({
          snippet,
          scene: { ...scene, faviconUrl: "" },
          jsonLd: jsonLdText,
        });
        const url = new URL(window.location.href);
        url.hash = `preview=${encodeURIComponent(data)}`;
        if (url.toString().length > 12000)
          throw new Error(
            "This preview is too large for a share link. Reduce the structured data or copy HTML instead.",
          );
        value = url.toString();
      }
      await navigator.clipboard.writeText(value);
      setMessage({
        error: false,
        text:
          kind === "share"
            ? "Share link copied. Anyone with this link can read its preview content."
            : "Metadata HTML copied. Paste it into your website editor or implementation.",
      });
    } catch (e) {
      setMessage({
        error: true,
        text:
          e instanceof Error && e.message.includes("too large")
            ? e.message
            : "Copy failed. Check clipboard permission. Make sure the structured data is valid before copying HTML.",
      });
    }
  }
  function example() {
    setSnippet({
      title: "AI SEO guide for creators and small businesses",
      url: "https://example.com/guides/ai-seo",
      description:
        "Learn how to research topics, improve content, and review search visibility with a practical AI SEO workflow.",
    });
    setScene({
      ...initialScene,
      siteName: "Creator Learning Hub",
      query: "AI SEO",
    });
    setJsonLdText(
      JSON.stringify(
        {
          "@context": "https://schema.org",
          "@graph": [
            {
              "@type": "Article",
              headline: "AI SEO guide for creators",
              author: [{ "@type": "Person", name: "Example Author" }],
              datePublished: "2026-10-01",
            },
            {
              "@type": "BreadcrumbList",
              itemListElement: [
                { "@type": "ListItem", position: 1, name: "Guides" },
                { "@type": "ListItem", position: 2, name: "AI SEO" },
              ],
            },
          ],
        },
        null,
        2,
      ),
    );
    setHiddenBlocks([]);
    setMessage({
      error: false,
      text: "Example loaded. This is sample content, not an imported search result.",
    });
  }
  return (
    <section
      id="serp-rich-result-preview"
      aria-label="SERP simulator workspace"
      className={`${panelClass} min-w-0 p-4 sm:p-7`}
    >
      <form
        onSubmit={handleImport}
        className="rounded-2xl border border-[#5271ff]/30 bg-[#5271ff]/5 p-4 sm:p-5"
      >
        <label
          htmlFor="serp-import-url"
          className="block text-sm font-bold text-slate-900 dark:text-white"
        >
          Start with a webpage URL
        </label>
        <div className="mt-3 flex flex-col gap-3 sm:flex-row">
          <input
            id="serp-import-url"
            disabled={importing}
            className={`${inputClass} min-w-0 flex-1`}
            maxLength={2048}
            value={importUrl}
            onChange={(e) => setImportUrl(e.target.value)}
            placeholder="https://example.com/article"
            inputMode="url"
          />
          <button
            disabled={importing || !importUrl.trim()}
            className={`${primaryButton} shrink-0`}
          >
            {importing ? (
              <Loader2
                size={17}
                className="animate-spin motion-reduce:animate-none"
              />
            ) : (
              <Globe size={17} />
            )}{" "}
            {importing ? "Importing page…" : "Import from URL"}
          </button>
        </div>
        <label className="mt-3 flex items-start gap-2 text-xs leading-6 text-slate-600 dark:text-slate-300">
          <input
            type="checkbox"
            disabled={importing}
            checked={includeSchema}
            onChange={(e) => setIncludeSchema(e.target.checked)}
            className="mt-1.5 accent-[#5271ff]"
          />
          <span>
            Also scan structured data in the page body. Turn this off for a
            faster metadata-only import.
          </span>
        </label>
        <p className="mt-2 text-xs leading-6 text-slate-500 dark:text-slate-400">
          Or edit the fields below. Manual edits do not require another import.
        </p>
      </form>
      {message && (
        <p
          role={message.error ? "alert" : "status"}
          className={`mt-4 break-words rounded-xl border p-3 text-xs leading-6 ${message.error ? "border-rose-300 bg-rose-50 text-rose-900 dark:border-rose-800 dark:bg-rose-950/40 dark:text-rose-200" : "border-blue-200 bg-blue-50 text-blue-900 dark:border-blue-800 dark:bg-blue-950/40 dark:text-blue-100"}`}
        >
          {message.text}
        </p>
      )}
      {importing && (
        <div
          role="status"
          className="mt-4 flex items-center gap-3 rounded-xl bg-[#5271ff]/10 p-4 text-sm text-slate-700 dark:text-slate-200"
        >
          <Loader2
            size={20}
            className="animate-spin motion-reduce:animate-none shrink-0"
          />
          Reading metadata and selected structured data. Images and videos are
          not downloaded.
        </div>
      )}
      <div className="mt-6 grid items-start gap-6 xl:grid-cols-[minmax(0,0.85fr)_minmax(0,1.25fr)]">
        <fieldset disabled={importing} className="min-w-0 space-y-4">
          <legend className="sr-only">Edit your search preview</legend>
          <div
            className="flex flex-wrap gap-2 rounded-xl bg-slate-100 p-1 dark:bg-slate-800"
            role="group"
            aria-label="Editor section"
          >
            {(
              [
                ["snippet", "Snippet editor"],
                ["rich", `Structured data (${richBlocks.length})`],
              ] as const
            ).map(([key, label]) => (
              <button
                key={key}
                type="button"
                aria-pressed={mode === key}
                onClick={() => setMode(key)}
                className={`min-h-11 rounded-lg px-3 py-2 text-sm font-semibold ${mode === key ? "bg-white text-[#4662df] shadow-sm dark:bg-slate-950 dark:text-blue-200" : "text-slate-600 dark:text-slate-300"}`}
              >
                {label}
              </button>
            ))}
          </div>
          {mode === "snippet" ? (
            <>
              <label
                className="block text-xs font-bold text-slate-700 dark:text-slate-200"
                htmlFor="serp-site"
              >
                Site name
                <input
                  id="serp-site"
                  className={`${inputClass} mt-2`}
                  value={scene.siteName}
                  maxLength={200}
                  onChange={(e) => changeScene("siteName", e.target.value)}
                  placeholder="Your brand or website name"
                />
              </label>
              <label
                className="block text-xs font-bold text-slate-700 dark:text-slate-200"
                htmlFor="serp-title"
              >
                Title
                <input
                  id="serp-title"
                  className={`${inputClass} mt-2`}
                  value={snippet.title}
                  maxLength={1000}
                  onChange={(e) => update("title", e.target.value)}
                  placeholder="Write a clear page title"
                />
                <PixelMeter
                  label="Title width"
                  block={layouts?.title}
                  width={preset.titleWidth}
                  lines={preset.titleLines}
                  characters={snippet.title.length}
                />
              </label>
              <label
                className="block text-xs font-bold text-slate-700 dark:text-slate-200"
                htmlFor="serp-url"
              >
                Display URL
                <input
                  id="serp-url"
                  className={`${inputClass} mt-2`}
                  value={snippet.url}
                  maxLength={2048}
                  onChange={(e) => update("url", e.target.value)}
                  placeholder="https://example.com/page"
                />
              </label>
              <label
                className="block text-xs font-bold text-slate-700 dark:text-slate-200"
                htmlFor="serp-description"
              >
                Description
                <textarea
                  id="serp-description"
                  className={`${inputClass} mt-2 min-h-28 resize-y`}
                  value={snippet.description}
                  maxLength={3000}
                  onChange={(e) => update("description", e.target.value)}
                  placeholder="Explain what readers will find on this page."
                />
                <PixelMeter
                  label="Description width"
                  block={layouts?.description}
                  width={preset.descriptionWidth}
                  lines={preset.descriptionLines}
                  characters={snippet.description.length}
                />
              </label>
              <div className="rounded-xl border border-slate-200 p-4 text-xs leading-6 text-slate-600 dark:border-slate-700 dark:text-slate-300">
                <strong>Preview checks</strong>
                {issues.length ? (
                  <ul className="mt-2 space-y-2">
                    {issues.map((issue, i) => (
                      <li
                        key={i}
                        className={
                          issue.level === "error"
                            ? "text-rose-600 dark:text-rose-300"
                            : "text-amber-700 dark:text-amber-200"
                        }
                      >
                        {issue.message}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="mt-2 text-emerald-700 dark:text-emerald-300">
                    Title, description, and URL checks passed. Review the pixel
                    preview for clipping.
                  </p>
                )}
                <p className="mt-3">
                  Pixel widths use Arial at 20 px for titles and 14 px for
                  descriptions. These presets are estimates, not Google limits.
                </p>
              </div>
            </>
          ) : (
            <div>
              <label
                htmlFor="serp-jsonld"
                className="text-xs font-bold text-slate-700 dark:text-slate-200"
              >
                JSON-LD from your page
              </label>
              <textarea
                id="serp-jsonld"
                value={jsonLdText}
                onChange={(e) => {
                  setJsonLdText(e.target.value);
                  setHiddenBlocks([]);
                }}
                maxLength={500000}
                className={`${inputClass} mt-2 min-h-80 resize-y font-mono text-xs`}
                placeholder="Paste one JSON object, an array, or an @graph"
              />
              {jsonError && (
                <p
                  role="alert"
                  className="mt-2 text-xs text-rose-600 dark:text-rose-300"
                >
                  {jsonError}
                </p>
              )}
              <p className="mt-3 text-xs leading-6 text-slate-500 dark:text-slate-400">
                Multiple recognized items appear below the search preview. Empty
                or unsupported types may not produce a card.
              </p>
            </div>
          )}
          <details className="rounded-xl border border-slate-200 p-4 dark:border-slate-700">
            <summary className="cursor-pointer text-sm font-bold text-slate-800 dark:text-slate-100">
              Display options and search context
            </summary>
            <div className="mt-4 space-y-4">
              <label
                className="block text-xs font-bold text-slate-700 dark:text-slate-200"
                htmlFor="serp-query"
              >
                Search query or phrases to highlight
                <input
                  id="serp-query"
                  className={`${inputClass} mt-2`}
                  value={scene.query}
                  onChange={(e) => changeScene("query", e.target.value)}
                  maxLength={100}
                  placeholder="AI SEO, content strategy"
                />
              </label>
              <label
                className="block text-xs font-bold text-slate-700 dark:text-slate-200"
                htmlFor="serp-country"
              >
                Country
                <select
                  id="serp-country"
                  className={`${inputClass} mt-2`}
                  value={scene.country}
                  onChange={(e) => changeScene("country", e.target.value)}
                >
                  {Object.entries(countries).map(([code, name]) => (
                    <option key={code} value={code}>
                      {name}
                    </option>
                  ))}
                </select>
              </label>
              <p className="text-xs leading-6 text-slate-500 dark:text-slate-400">
                Country changes the preview context and date format. It does not
                fetch local rankings or change Google results.
              </p>
              <label
                className="block text-xs font-bold text-slate-700 dark:text-slate-200"
                htmlFor="serp-date"
              >
                Date to simulate (optional)
                <input
                  id="serp-date"
                  type="date"
                  className={`${inputClass} mt-2`}
                  value={scene.date}
                  onChange={(e) => changeScene("date", e.target.value)}
                />
              </label>
              <div className="grid grid-cols-2 gap-3">
                <label
                  className="block text-xs font-bold text-slate-700 dark:text-slate-200"
                  htmlFor="serp-rating"
                >
                  Rating (optional)
                  <input
                    id="serp-rating"
                    type="number"
                    min="0"
                    max="5"
                    step="0.1"
                    className={`${inputClass} mt-2`}
                    value={scene.rating}
                    onChange={(e) => changeScene("rating", e.target.value)}
                  />
                </label>
                <label
                  className="block text-xs font-bold text-slate-700 dark:text-slate-200"
                  htmlFor="serp-reviews"
                >
                  Review count
                  <input
                    id="serp-reviews"
                    type="number"
                    min="0"
                    max="1000000000"
                    className={`${inputClass} mt-2`}
                    value={scene.reviews}
                    onChange={(e) => changeScene("reviews", e.target.value)}
                  />
                </label>
              </div>
              <p className="text-xs leading-6 text-slate-500 dark:text-slate-400">
                Dates and ratings here are manual simulations. Imported schema
                values remain visible in the structured data cards.
              </p>
              {[
                ["aiOverview", "AI Overview placement"],
                ["heatmap", "Visual emphasis overlay"],
              ].map(([key, label]) => (
                <label
                  key={key}
                  className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-200"
                >
                  <input
                    type="checkbox"
                    checked={scene[key as "aiOverview" | "heatmap"]}
                    onChange={(e) =>
                      changeScene(
                        key as "aiOverview" | "heatmap",
                        e.target.checked,
                      )
                    }
                    className="accent-[#5271ff]"
                  />
                  {label}
                </label>
              ))}
              <p className="text-xs leading-6 text-slate-500 dark:text-slate-400">
                The overlay illustrates visual emphasis. It does not measure
                clicks, eye movement, or ranking potential.
              </p>
            </div>
          </details>
          <div className="flex flex-wrap gap-2">
            <button type="button" onClick={example} className={secondaryButton}>
              <Sparkles size={15} />
              Try example
            </button>
            <button
              type="button"
              className={secondaryButton}
              onClick={() => {
                setSnippet(defaultSnippetState());
                setScene(initialScene);
                setJsonLdText("");
                setImportUrl("");
                setHiddenBlocks([]);
                setMessage(null);
                window.history.replaceState(
                  null,
                  "",
                  window.location.pathname + window.location.search,
                );
              }}
            >
              <RotateCcw size={15} />
              Reset
            </button>
          </div>
          <div className="rounded-xl bg-[#5271ff]/5 p-4 text-xs leading-6 text-slate-600 dark:text-slate-300">
            Need stronger wording? Try our{" "}
            <Link
              className="font-bold text-[#4662df] underline dark:text-blue-300"
              href="/tools/meta-title-generator"
            >
              Meta Title Generator
            </Link>{" "}
            or{" "}
            <Link
              className="font-bold text-[#4662df] underline dark:text-blue-300"
              href="/tools/meta-description-generator"
            >
              Meta Description Generator
            </Link>
            .
          </div>
        </fieldset>
        <div className="min-w-0 space-y-4 xl:sticky xl:top-24">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-sm font-bold text-slate-900 dark:text-white">
              Search appearance studio
            </h2>
            <div
              className="flex rounded-xl border border-slate-200 p-1 dark:border-slate-700"
              role="group"
              aria-label="Preview device"
            >
              {(
                [
                  ["desktop", Monitor],
                  ["mobile", Smartphone],
                ] as const
              ).map(([key, Icon]) => (
                <button
                  key={key}
                  type="button"
                  aria-pressed={scene.device === key}
                  className={`inline-flex min-h-10 items-center gap-2 rounded-lg px-3 text-xs font-bold ${scene.device === key ? "bg-[#5271ff] text-white" : "text-slate-600 dark:text-slate-300"}`}
                  onClick={() => changeScene("device", key)}
                >
                  <Icon size={15} />
                  {key === "desktop" ? "Desktop" : "Mobile"}
                </button>
              ))}
            </div>
          </div>
          <div
            className={`mx-auto overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-lg dark:border-slate-700 ${scene.device === "mobile" ? "max-w-[388px]" : "w-full"}`}
          >
            <SerpCanvas
              ref={svg}
              snippet={snippet}
              scene={scene}
              layouts={layouts}
            />
          </div>
          <p className="text-xs leading-6 text-slate-500 dark:text-slate-400">
            The preview scales to fit your screen. Measurements refer to its
            internal pixel preset. Google may rewrite text, choose another
            favicon, or show different features.
          </p>
          {scene.heatmap && (
            <p className="rounded-xl bg-amber-50 p-3 text-xs leading-6 text-amber-950 dark:bg-amber-950/40 dark:text-amber-100">
              Illustrative emphasis overlay enabled. This is not behavioral
              research or a click prediction.
            </p>
          )}
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              disabled={exporting || !layouts}
              className={secondaryButton}
              onClick={async () => {
                if (!svg.current) return;
                setExporting(true);
                try {
                  await savePreviewPng(svg.current);
                  setMessage({
                    error: false,
                    text: "Preview image saved. External favicons use the site initial in exports for reliable downloads.",
                  });
                } catch (e) {
                  setMessage({
                    error: true,
                    text:
                      e instanceof Error ? e.message : "Image export failed.",
                  });
                } finally {
                  setExporting(false);
                }
              }}
            >
              <Download size={15} />
              {exporting ? "Saving…" : "Save image"}
            </button>
            <button
              type="button"
              onClick={() => void copy("html")}
              className={secondaryButton}
            >
              <Copy size={15} />
              Copy HTML
            </button>
            <button
              type="button"
              onClick={() => void copy("share")}
              className={secondaryButton}
            >
              <Share2 size={15} />
              Share link
            </button>
          </div>
          <div className="rounded-2xl border border-slate-200 p-4 dark:border-slate-700">
            <h2 className="text-sm font-bold text-slate-900 dark:text-white">
              Structured data inspector{" "}
              <span className="text-[#5271ff]">({richBlocks.length})</span>
            </h2>
            <p className="mt-2 text-xs leading-6 text-slate-500 dark:text-slate-400">
              Cards reflect recognized fields in your markup. The inspector
              checks up to 1,000 objects and displays up to 100 matching items.
              They do not confirm eligibility or guarantee a Google rich result.
            </p>
            {richBlocks.length > 0 ? (
              <div className="mt-4 max-h-[700px] space-y-3 overflow-y-auto pr-1">
                {richBlocks.slice(0, 100).map((block, index) => (
                  <article
                    key={`${block.type}-${index}`}
                    className="min-w-0 break-words rounded-xl border border-slate-200 p-3 dark:border-slate-700"
                  >
                    <label className="mb-3 flex items-center gap-2 text-xs font-bold text-slate-700 dark:text-slate-200">
                      <input
                        type="checkbox"
                        className="accent-[#5271ff]"
                        checked={!hiddenBlocks.includes(index)}
                        onChange={(e) =>
                          setHiddenBlocks((previous) =>
                            e.target.checked
                              ? previous.filter((i) => i !== index)
                              : [...previous, index],
                          )
                        }
                      />
                      {block.type} · Item {index + 1}
                    </label>
                    {!hiddenBlocks.includes(index) && (
                      <RichResultCard block={block} />
                    )}
                  </article>
                ))}
              </div>
            ) : (
              <p className="mt-4 rounded-xl border border-dashed border-slate-300 p-4 text-xs leading-6 text-slate-500 dark:border-slate-700 dark:text-slate-400">
                {jsonError
                  ? "Correct the JSON-LD to inspect its items."
                  : jsonLdText.trim()
                    ? "No supported preview fields were found. This does not prove that the markup is invalid."
                    : "Import a page with structured data, paste JSON-LD, or try the example."}
              </p>
            )}
            <p className="mt-4 text-xs leading-6 text-amber-700 dark:text-amber-200">
              FAQ and HowTo rich results are retired in Google Search. Their
              cards are markup inspections only. Review the current rules before
              relying on any rich result.
            </p>
            <a
              href="https://search.google.com/test/rich-results"
              target="_blank"
              rel="noopener noreferrer"
              className="mt-3 inline-block text-xs font-bold text-[#4662df] underline dark:text-blue-300"
            >
              Open Google Rich Results Test
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
