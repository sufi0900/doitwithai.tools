"use client";

import { useMemo, useState } from "react";
import {
  AlertTriangle,
  CheckCircle2,
  ChevronDown,
  Clock,
  Globe,
  Info,
  Loader2,
  MapPin,
  Star,
  XCircle,
} from "lucide-react";
import {
  inputClass,
  panelClass,
  primaryButton,
  secondaryButton,
} from "@/features/writing-tools/config";
import {
  breadcrumbFromUrl,
  defaultSnippetState,
  extractRichResultBlocks,
  parseJsonLdInput,
  validateSnippet,
} from "./generator";
import { importSerpData } from "./client";
import type { RichResultBlock, SnippetState } from "./types";

type Mode = "snippet" | "rich";

function StarRating({ value, count }: { value: number | null; count: number | null }) {
  const rating = value ?? 0;
  return (
    <div className="flex items-center gap-1.5">
      <div className="flex">
        {[1, 2, 3, 4, 5].map((index) => (
          <Star
            key={index}
            className={`h-3.5 w-3.5 ${index <= Math.round(rating) ? "fill-amber-400 text-amber-400" : "text-slate-300 dark:text-slate-600"}`}
          />
        ))}
      </div>
      {value !== null && <span className="text-xs text-slate-500 dark:text-slate-400">{value.toFixed(1)}</span>}
      {count !== null && <span className="text-xs text-slate-400">({count.toLocaleString()})</span>}
    </div>
  );
}

function RichResultCard({ block }: { block: RichResultBlock }) {
  if (block.type === "FAQPage") {
    return (
      <div className="divide-y divide-slate-200 rounded-xl border border-slate-200 dark:divide-slate-700 dark:border-slate-700">
        {block.data.slice(0, 4).map((item) => (
          <div key={item.question} className="p-3">
            <div className="flex items-center justify-between gap-2">
              <p className="text-sm font-medium text-blue-800 dark:text-blue-300">{item.question}</p>
              <ChevronDown className="h-4 w-4 shrink-0 text-slate-400" />
            </div>
            <p className="mt-1.5 text-xs leading-6 text-slate-500 dark:text-slate-400">{item.answer}</p>
          </div>
        ))}
      </div>
    );
  }
  if (block.type === "HowTo") {
    return (
      <div className="rounded-xl border border-slate-200 p-3 dark:border-slate-700">
        {block.data.name && <p className="mb-2 text-sm font-bold text-slate-800 dark:text-slate-100">{block.data.name}</p>}
        <ol className="space-y-2">
          {block.data.steps.slice(0, 5).map((step, index) => (
            <li key={index} className="flex gap-2 text-xs leading-6 text-slate-600 dark:text-slate-300">
              <span className="font-bold text-blue-700 dark:text-blue-300">{index + 1}.</span>
              <span>
                <span className="font-semibold text-slate-800 dark:text-slate-100">{step.name}</span>
                {step.text ? ` — ${step.text}` : ""}
              </span>
            </li>
          ))}
        </ol>
      </div>
    );
  }
  if (block.type === "Review" || block.type === "AggregateRating") {
    return (
      <div className="rounded-xl border border-slate-200 p-3 dark:border-slate-700">
        {block.data.itemName && <p className="text-sm font-bold text-slate-800 dark:text-slate-100">{block.data.itemName}</p>}
        <div className="mt-1.5">
          <StarRating value={block.data.ratingValue} count={block.data.reviewCount} />
        </div>
      </div>
    );
  }
  if (block.type === "BreadcrumbList") {
    return (
      <div className="rounded-xl border border-slate-200 p-3 text-xs text-emerald-700 dark:border-slate-700 dark:text-emerald-400">
        {block.data.join(" › ")}
      </div>
    );
  }
  if (block.type === "Article") {
    return (
      <div className="rounded-xl border border-slate-200 p-3 dark:border-slate-700">
        <p className="text-sm font-bold text-slate-800 dark:text-slate-100">{block.data.headline}</p>
        <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
          {[block.data.author, block.data.datePublished].filter(Boolean).join(" · ") || "No author/date set"}
        </p>
      </div>
    );
  }
  if (block.type === "Product") {
    return (
      <div className="rounded-xl border border-slate-200 p-3 dark:border-slate-700">
        <p className="text-sm font-bold text-slate-800 dark:text-slate-100">{block.data.name}</p>
        <div className="mt-1.5 flex flex-wrap items-center gap-3 text-xs">
          {block.data.price && (
            <span className="font-bold text-slate-700 dark:text-slate-200">
              {block.data.currency || ""} {block.data.price}
            </span>
          )}
          {block.data.availability && <span className="text-emerald-600 dark:text-emerald-400">{block.data.availability}</span>}
          {(block.data.ratingValue || block.data.reviewCount) && (
            <StarRating value={block.data.ratingValue} count={block.data.reviewCount} />
          )}
        </div>
      </div>
    );
  }
  if (block.type === "Recipe") {
    return (
      <div className="rounded-xl border border-slate-200 p-3 dark:border-slate-700">
        <p className="text-sm font-bold text-slate-800 dark:text-slate-100">{block.data.name}</p>
        <div className="mt-1.5 flex flex-wrap items-center gap-3 text-xs text-slate-500 dark:text-slate-400">
          {block.data.totalTime && (
            <span className="flex items-center gap-1">
              <Clock className="h-3 w-3" /> {block.data.totalTime}
            </span>
          )}
          {(block.data.ratingValue || block.data.reviewCount) && (
            <StarRating value={block.data.ratingValue} count={block.data.reviewCount} />
          )}
        </div>
      </div>
    );
  }
  if (block.type === "Event") {
    return (
      <div className="rounded-xl border border-slate-200 p-3 dark:border-slate-700">
        <p className="text-sm font-bold text-slate-800 dark:text-slate-100">{block.data.name}</p>
        <div className="mt-1.5 flex flex-wrap items-center gap-3 text-xs text-slate-500 dark:text-slate-400">
          {block.data.startDate && <span>{block.data.startDate}</span>}
          {block.data.location && (
            <span className="flex items-center gap-1">
              <MapPin className="h-3 w-3" /> {block.data.location}
            </span>
          )}
        </div>
      </div>
    );
  }
  return null;
}

export default function SerpPreviewClient() {
  const [mode, setMode] = useState<Mode>("snippet");
  const [snippet, setSnippet] = useState<SnippetState>(() => defaultSnippetState());
  const [jsonLdText, setJsonLdText] = useState("");
  const [importUrl, setImportUrl] = useState("");
  const [importing, setImporting] = useState(false);
  const [message, setMessage] = useState<{ tone: "error" | "success"; text: string } | null>(null);

  const issues = useMemo(() => validateSnippet(snippet), [snippet]);
  const breadcrumb = useMemo(() => breadcrumbFromUrl(snippet.url), [snippet.url]);

  const { richBlocks, jsonLdError } = useMemo(() => {
    if (!jsonLdText.trim()) return { richBlocks: [] as RichResultBlock[], jsonLdError: "" };
    try {
      const parsed = parseJsonLdInput(jsonLdText);
      return { richBlocks: extractRichResultBlocks(parsed), jsonLdError: "" };
    } catch {
      return {
        richBlocks: [] as RichResultBlock[],
        jsonLdError: "That doesn't look like valid JSON. Paste the exact contents of a <script type=\"application/ld+json\"> tag.",
      };
    }
  }, [jsonLdText]);

  function update<K extends keyof SnippetState>(key: K, value: SnippetState[K]) {
    setSnippet((previous) => ({ ...previous, [key]: value }));
  }

  async function handleImport() {
    if (!importUrl.trim()) return;
    setImporting(true);
    setMessage(null);
    const outcome = await importSerpData(importUrl.trim());
    setImporting(false);
    if (outcome.ok === false) {
      setMessage({ tone: "error", text: outcome.message });
      return;
    }
    setSnippet({ title: outcome.title, description: outcome.description, url: outcome.finalUrl });
    if (outcome.jsonLd.length) {
      setJsonLdText(JSON.stringify(outcome.jsonLd.length === 1 ? outcome.jsonLd[0] : outcome.jsonLd, null, 2));
    }
    setMessage({
      tone: "success",
      text: outcome.jsonLd.length
        ? `Imported the title, description, and ${outcome.jsonLd.length} JSON-LD block(s) from ${outcome.finalUrl}.`
        : `Imported the title and description from ${outcome.finalUrl}. No JSON-LD structured data was found on that page.`,
    });
  }

  return (
    <div id="serp-rich-result-preview" className={`${panelClass} p-5 sm:p-8`}>
      <div className="flex flex-col gap-3 sm:flex-row">
        <input
          aria-label="Page URL to import"
          maxLength={2048}
          className={`${inputClass} min-w-0 flex-1`}
          value={importUrl}
          onChange={(event) => setImportUrl(event.target.value)}
          placeholder="https://example.com/page (optional — import title, description & schema)"
          inputMode="url"
        />
        <button type="button" onClick={handleImport} disabled={importing || !importUrl.trim()} className={`${secondaryButton} shrink-0`}>
          {importing ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Globe className="h-3.5 w-3.5" />}
          {importing ? "Importing…" : "Import from URL"}
        </button>
      </div>
      {message && (
        <p className={`mt-2 text-xs font-semibold ${message.tone === "error" ? "text-rose-600 dark:text-rose-400" : "text-emerald-600 dark:text-emerald-400"}`}>
          {message.text}
        </p>
      )}

      <div className="mt-5 flex flex-wrap gap-2">
        <button type="button" onClick={() => setMode("snippet")} className={mode === "snippet" ? primaryButton : secondaryButton}>
          SERP snippet
        </button>
        <button type="button" onClick={() => setMode("rich")} className={mode === "rich" ? primaryButton : secondaryButton}>
          Rich result preview
        </button>
      </div>

      {mode === "snippet" ? (
        <div className="mt-6 grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
          <div className="space-y-4">
            <div>
              <div className="flex items-center justify-between">
                <label htmlFor="serp-title" className="text-xs font-bold text-slate-600 dark:text-slate-300">Title</label>
                <span className="text-[11px] text-slate-400">{snippet.title.length} chars</span>
              </div>
              <input id="serp-title" className={`${inputClass} mt-1.5`} value={snippet.title} onChange={(event) => update("title", event.target.value)} placeholder="A clear, specific page title" maxLength={200} />
            </div>
            <div>
              <label htmlFor="serp-url" className="text-xs font-bold text-slate-600 dark:text-slate-300">URL</label>
              <input id="serp-url" maxLength={2048} className={`${inputClass} mt-1.5`} value={snippet.url} onChange={(event) => update("url", event.target.value)} placeholder="https://example.com/category/page" inputMode="url" />
            </div>
            <div>
              <div className="flex items-center justify-between">
                <label htmlFor="serp-description" className="text-xs font-bold text-slate-600 dark:text-slate-300">Description</label>
                <span className="text-[11px] text-slate-400">{snippet.description.length} chars</span>
              </div>
              <textarea
                id="serp-description" className={`${inputClass} mt-1.5 min-h-[90px] resize-y`}
                value={snippet.description}
                onChange={(event) => update("description", event.target.value)}
                placeholder="A one or two sentence summary a searcher would want to read"
                maxLength={400}
              />
            </div>

            <div className="rounded-2xl border border-slate-200 p-4 dark:border-slate-700">
              <h2 className="text-sm font-black uppercase tracking-wider text-[#4662df] dark:text-blue-300">Checks you can inspect</h2>
              {issues.length === 0 ? (
                <p className="mt-3 flex items-center gap-2 text-sm font-semibold text-emerald-600 dark:text-emerald-400">
                  <CheckCircle2 className="h-4 w-4" /> No issues found.
                </p>
              ) : (
                <ul className="mt-3 space-y-2">
                  {issues.map((issue, index) => {
                    const Icon = issue.level === "error" ? XCircle : issue.level === "warning" ? AlertTriangle : Info;
                    const className =
                      issue.level === "error" ? "text-rose-600 dark:text-rose-400" : issue.level === "warning" ? "text-amber-600 dark:text-amber-400" : "text-slate-500 dark:text-slate-400";
                    return (
                      <li key={`${issue.level}-${index}`} className={`flex items-start gap-2 text-xs font-semibold leading-5 ${className}`}>
                        <Icon className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                        {issue.message}
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
          </div>

          <div className="lg:sticky lg:top-24 lg:self-start">
            <h2 className="text-sm font-black uppercase tracking-wider text-[#4662df] dark:text-blue-300">Google SERP preview</h2>
            <div className="mt-3 max-w-xl rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-900">
              <div className="flex items-center gap-2">
                <div className="h-6 w-6 shrink-0 rounded-full bg-slate-200 dark:bg-slate-700" />
                <div className="min-w-0">
                  <p className="truncate text-xs text-slate-700 dark:text-slate-300">{breadcrumb.length ? breadcrumb.join(" › ") : snippet.url || "example.com"}</p>
                </div>
              </div>
              <p className="mt-1 truncate text-lg text-[#1a0dab] dark:text-[#8ab4f8]">{snippet.title || "Your page title will show here"}</p>
              <p className="mt-1 line-clamp-2 text-sm text-slate-600 dark:text-slate-400">
                {snippet.description || "Your meta description will show here — or Google may generate one from the page itself."}
              </p>
            </div>
            <p className="mt-3 text-[11px] leading-5 text-slate-400">
              This is an illustrative mock, not a pixel-identical render — Google truncates by on-screen
              width, which varies by character set and device. For precise pixel-width testing, use the
              Meta Title Generator.
            </p>
          </div>
        </div>
      ) : (
        <div className="mt-6 grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
          <div>
            <label htmlFor="serp-jsonld" className="text-xs font-bold text-slate-600 dark:text-slate-300">Paste JSON-LD</label>
            <textarea
              id="serp-jsonld" maxLength={300000} className={`${inputClass} mt-1.5 min-h-[320px] resize-y font-mono text-xs`}
              value={jsonLdText}
              onChange={(event) => setJsonLdText(event.target.value)}
              placeholder={'Paste the contents of a <script type="application/ld+json"> tag — e.g. output from the Schema Markup Generator'}
            />
            {jsonLdError && <p className="mt-2 text-xs font-semibold text-rose-600 dark:text-rose-400">{jsonLdError}</p>}
            <p className="mt-2 text-xs leading-6 text-slate-500 dark:text-slate-400">
              Supports FAQPage, HowTo, Review, AggregateRating, BreadcrumbList, Article, Product,
              Recipe, and Event. Other types are parsed but won't render a preview card here.
            </p>
          </div>

          <div className="lg:sticky lg:top-24 lg:self-start">
            <h2 className="text-sm font-black uppercase tracking-wider text-[#4662df] dark:text-blue-300">Structured data preview</h2>
            <p className="mt-3 rounded-xl border border-amber-300 bg-amber-50 p-3 text-xs leading-6 text-amber-950 dark:border-amber-800 dark:bg-amber-950 dark:text-amber-100">These cards illustrate your markup. HowTo rich results are retired in Google Search. FAQ visibility is restricted. A rendered card does not confirm search eligibility.</p>
            {richBlocks.length ? (
              <div className="mt-3 space-y-3">
                {richBlocks.map((block, index) => (
                  <RichResultCard key={`${block.type}-${index}`} block={block} />
                ))}
              </div>
            ) : (
              <div className="mt-3 rounded-2xl border border-dashed border-slate-300 p-8 text-center text-sm text-slate-400 dark:border-slate-700">
                Paste JSON-LD with a recognized type to see a preview.
              </div>
            )}
            <p className="mt-3 text-[11px] leading-5 text-slate-400">
              Illustrative only — whether Google actually shows a rich result depends on their current
              guidelines, page quality, and search context, not just valid markup.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
