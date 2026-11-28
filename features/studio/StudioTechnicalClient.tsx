"use client";

import React, { useEffect, useState } from "react";
import {
  Check,
  CheckCircle2,
  Copy,
  Loader2,
  ShieldCheck,
  Wrench,
  XCircle,
} from "lucide-react";
import {
  createDefaultStudioState,
  dispatchStudioDrawer,
  loadStudioState,
  subscribeStudioState,
} from "@/lib/studio/store";
import type { StudioWorkspaceState } from "@/lib/studio/types";
import ToolUrlInput from "@/features/tool-ui/ToolUrlInput";

interface TechnicalInspectionResult {
  inspectedUrl: string;
  httpStatus: number;
  httpsEnabled: boolean;
  metaRobots: string;
  isIndexable: boolean;
  canonical: string;
  viewportConfigured: boolean;
  htmlLang: string;
  openGraphComplete: boolean;
  hasRobotsTxt: boolean;
  robotsTxtPreview: string;
  hasLlmsTxt: boolean;
  llmsTxtPreview: string;
  hasSitemapXml: boolean;
  schemaTypes: string[];
  rawJsonLdCount: number;
  generatedGraphSchema: string;
  linkChecks: Array<{ url: string; status: number; ok: boolean }>;
  checkedAtIso: string;
}

const TECHNICAL_DRAWER_TOOLS = [
  { slug: "schema-markup-generator", label: "@graph Schema Builder" },
  { slug: "robots-txt-generator", label: "robots.txt Generator" },
  { slug: "llms-txt-generator", label: "llms.txt AI Crawler Builder" },
  { slug: "sitemap-xml-generator", label: "XML Sitemap Builder" },
  { slug: "core-web-vitals-checker", label: "Core Web Vitals Checker" },
  { slug: "faq-schema-validator", label: "FAQ Schema Validator" },
];

export default function StudioTechnicalClient() {
  const [studio, setStudio] = useState<StudioWorkspaceState>(
    createDefaultStudioState,
  );
  const [urlInput, setUrlInput] = useState("");
  const [inspecting, setInspecting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [report, setReport] = useState<TechnicalInspectionResult | null>(null);
  const [copiedSchema, setCopiedSchema] = useState(false);

  useEffect(() => {
    const initial = loadStudioState();
    setStudio(initial);
    const active =
      initial.sites.find((s) => s.id === initial.activeSiteId) ||
      initial.sites[0];
    if (active?.url) setUrlInput(active.url);
    return subscribeStudioState(() => setStudio(loadStudioState()));
  }, []);

  const handleRunTechnicalAudit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    if (!urlInput.trim()) {
      setErrorMsg("Enter a domain or page URL to inspect.");
      return;
    }

    setInspecting(true);
    try {
      const res = await fetch("/api/studio/seo-audit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mode: "technical",
          url: urlInput.trim(),
        }),
      });
      const payload = (await res.json()) as {
        error?: string;
        technical?: TechnicalInspectionResult;
      };
      if (!res.ok || payload.error || !payload.technical) {
        throw new Error(payload.error || "Technical inspection failed.");
      }
      setReport(payload.technical);
    } catch (err) {
      setErrorMsg(
        err instanceof Error ? err.message : "Technical inspection failed.",
      );
    } finally {
      setInspecting(false);
    }
  };

  const handleCopySchema = () => {
    if (!report?.generatedGraphSchema) return;
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      void navigator.clipboard.writeText(
        `<script type="application/ld+json">\n${report.generatedGraphSchema}\n</script>`,
      );
      setCopiedSchema(true);
      setTimeout(() => setCopiedSchema(false), 1800);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header + Slide-Over Technical Tools */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs dark:border-slate-800 dark:bg-[#0D1526]">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-xl font-bold text-slate-900 dark:text-white">
              Technical SEO, Crawlability &amp; Schema Workbench
            </h1>
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
              Inspect live HTTP status, indexability, canonicals,{" "}
              <code>robots.txt</code>, <code>llms.txt</code>, XML sitemap,
              sampled link health, and <code>@graph</code> JSON-LD schema.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-1.5">
            {TECHNICAL_DRAWER_TOOLS.map((tool) => (
              <button
                key={tool.slug}
                type="button"
                onClick={() =>
                  dispatchStudioDrawer({
                    type: "open-tool",
                    slug: tool.slug,
                    title: tool.label,
                  })
                }
                className="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-2.5 py-1.5 text-[11px] font-semibold text-slate-600 transition hover:border-[#5271FF] hover:text-[#5271FF] dark:border-slate-700 dark:text-slate-300"
              >
                <Wrench size={11} />
                <span>{tool.label}</span>
              </button>
            ))}
          </div>
        </div>

        <form onSubmit={handleRunTechnicalAudit} className="mt-5 flex flex-col gap-3 sm:flex-row">
          <ToolUrlInput
            value={urlInput}
            onChange={(e) => setUrlInput(e.target.value)}
            urlKind="domain"
            placeholder="https://yourdomain.com"
            className="flex-1 rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-xs text-slate-900 focus:border-[#5271FF] focus:outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-white"
          />
          <button
            type="submit"
            disabled={inspecting}
            className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-[#5271FF] px-5 py-2.5 text-xs font-bold text-white transition hover:bg-[#4361EE] disabled:opacity-60"
          >
            {inspecting ? (
              <>
                <Loader2 size={14} className="animate-spin" />
                <span>Running Technical Crawl...</span>
              </>
            ) : (
              <>
                <ShieldCheck size={14} />
                <span>Inspect Technical Health</span>
              </>
            )}
          </button>
        </form>

        {errorMsg && (
          <p className="mt-3 rounded-xl border border-rose-500/30 bg-rose-500/10 px-3.5 py-2 text-xs text-rose-600 dark:text-rose-300">
            {errorMsg}
          </p>
        )}
      </div>

      {report && (
        <div className="space-y-6">
          {/* Core Crawlability & Protocol Matrix */}
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {[
              {
                label: "HTTP & Indexability",
                ok: report.httpStatus === 200 && report.isIndexable,
                value: `HTTP ${report.httpStatus} · ${report.isIndexable ? "Indexable" : "NOINDEX"}`,
                detail: `meta robots: ${report.metaRobots}`,
              },
              {
                label: "Canonical & HTTPS",
                ok: Boolean(report.canonical) && report.httpsEnabled,
                value: report.canonical ? "Canonical Present" : "Missing Canonical",
                detail: report.canonical || "Add <link rel='canonical'>",
              },
              {
                label: "robots.txt & XML Sitemap",
                ok: report.hasRobotsTxt && report.hasSitemapXml,
                value: `${report.hasRobotsTxt ? "robots.txt OK" : "No robots.txt"} · ${report.hasSitemapXml ? "Sitemap OK" : "No Sitemap"}`,
                detail: report.hasLlmsTxt
                  ? "llms.txt AI crawler manifest active"
                  : "Optional: add /llms.txt for AI crawlers",
              },
              {
                label: "@graph JSON-LD Schema",
                ok: report.schemaTypes.length > 0,
                value:
                  report.schemaTypes.length > 0
                    ? `${report.schemaTypes.length} Entity Types`
                    : "No JSON-LD Found",
                detail:
                  report.schemaTypes.join(", ") ||
                  "Copy generated @graph schema below",
              },
            ].map((card) => (
              <div
                key={card.label}
                className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs dark:border-slate-800 dark:bg-[#0D1526]"
              >
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                    {card.label}
                  </span>
                  {card.ok ? (
                    <CheckCircle2 size={15} className="text-emerald-500" />
                  ) : (
                    <XCircle size={15} className="text-amber-500" />
                  )}
                </div>
                <p className="mt-1.5 text-sm font-bold text-slate-900 dark:text-white">
                  {card.value}
                </p>
                <p className="mt-1 truncate text-xs text-slate-500 dark:text-slate-400">
                  {card.detail}
                </p>
              </div>
            ))}
          </div>

          <div className="grid gap-6 lg:grid-cols-12">
            {/* Sampled Link HTTP Status Check */}
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs lg:col-span-6 dark:border-slate-800 dark:bg-[#0D1526]">
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                Live Link Status Sample ({report.linkChecks.length} URLs Checked)
              </h2>
              <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
                Verifies live HTTP status codes across sampled internal and
                outbound links on the inspected URL.
              </p>

              <div className="mt-4 divide-y divide-slate-100 rounded-xl border border-slate-200/80 dark:divide-slate-800 dark:border-slate-800">
                {report.linkChecks.map((lnk) => (
                  <div
                    key={lnk.url}
                    className="flex items-center justify-between gap-2 px-3.5 py-2.5 text-xs"
                  >
                    <span className="truncate text-slate-700 dark:text-slate-300">
                      {lnk.url}
                    </span>
                    <span
                      className={`shrink-0 rounded-md px-2 py-0.5 text-[11px] font-bold ${
                        lnk.ok
                          ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300"
                          : "bg-rose-500/15 text-rose-700 dark:text-rose-300"
                      }`}
                    >
                      {lnk.status ? `HTTP ${lnk.status}` : "Timeout"}
                    </span>
                  </div>
                ))}
              </div>

              {report.robotsTxtPreview && (
                <div className="mt-5">
                  <p className="mb-1.5 text-xs font-bold text-slate-800 dark:text-slate-200">
                    Live <code>/robots.txt</code> Preview
                  </p>
                  <pre className="max-h-40 overflow-auto rounded-xl border border-slate-200 bg-slate-50 p-3 text-[11px] text-slate-700 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-300">
                    {report.robotsTxtPreview}
                  </pre>
                </div>
              )}
            </div>

            {/* Ready-to-Paste @graph JSON-LD Schema */}
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs lg:col-span-6 dark:border-slate-800 dark:bg-[#0D1526]">
              <div className="flex items-center justify-between gap-2">
                <div>
                  <h2 className="text-base font-bold text-slate-900 dark:text-white">
                    Ready-to-Deploy <code>@graph</code> JSON-LD Schema
                  </h2>
                  <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
                    Connects Organization, WebSite, and WebPage entities cleanly.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleCopySchema}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-[#5271FF] px-3 py-1.5 text-xs font-bold text-white transition hover:bg-[#4361EE]"
                >
                  {copiedSchema ? (
                    <>
                      <Check size={13} /> Copied Script
                    </>
                  ) : (
                    <>
                      <Copy size={13} /> Copy &lt;script&gt;
                    </>
                  )}
                </button>
              </div>

              <pre className="mt-4 max-h-80 overflow-auto rounded-xl border border-slate-200 bg-slate-50 p-4 text-[11px] leading-relaxed text-slate-800 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-200">
                {report.generatedGraphSchema}
              </pre>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
