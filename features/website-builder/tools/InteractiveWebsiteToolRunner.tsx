"use client";

import React, { useEffect, useMemo, useState } from "react";
import {
  Check,
  Code2,
  Copy,
  KeyRound,
  RefreshCw,
  Sparkles,
  Wand2,
  Wrench,
} from "lucide-react";

export type WebsiteToolSpec = {
  id: string;
  title: string;
  summary: string;
  caseStudySlug: string;
  technologies: string[];
  role?: string;
  period?: string;
};

type ToolResultItem = {
  label: string;
  title: string;
  description: string;
  badge?: string;
  score?: number;
};

type ToolRunPayload = {
  ok: boolean;
  provider: "gemini-api" | "deterministic-engine";
  toolSlug: string;
  summary: string;
  overallScore: number;
  metrics: Array<{ label: string; value: string; status: "good" | "warn" | "info" }>;
  items: ToolResultItem[];
  codeBlock: {
    language: string;
    label: string;
    code: string;
  };
};

function getToolPresetInputs(slug: string, siteName: string) {
  if (slug.includes("on-page") || slug.includes("analyzer")) {
    return {
      keywordLabel: "Target Focus Keyword",
      keywordDefault: "On-Page AI SEO Audit",
      contentLabel: "Page H1 & Draft Copy to Audit",
      contentDefault:
        "How to run a 28-point technical and semantic on-page SEO audit that aligns H1-H3 headings, entity density, and Position-Zero answer blocks.",
      intentDefault: "Informational & Technical Audit",
      ctaLabel: "Run 28-Point AI SEO Audit ✨",
    };
  }
  if (slug.includes("schema") || slug.includes("json-ld")) {
    return {
      keywordLabel: "Primary Entity / Application Title",
      keywordDefault: `${siteName} — Structured Data Graph`,
      contentLabel: "Entity Description & Key FAQ Context",
      contentDefault:
        "Build connected Schema.org JSON-LD @graph markup linking Organization, SoftwareApplication, Article, and FAQPage entities with @id references.",
      intentDefault: "Schema.org @graph Markup",
      ctaLabel: "Generate Connected JSON-LD @graph ✨",
    };
  }
  if (slug.includes("cluster") || slug.includes("keyword")) {
    return {
      keywordLabel: "Core Pillar Topic / Seed Keyword",
      keywordDefault: "AI SEO Content Architecture",
      contentLabel: "Raw Keyword List (comma or line separated)",
      contentDefault:
        "ai seo tools, meta title pixel length, json-ld schema generator, keyword clustering workflow, on-page seo checklist, readability grade 8",
      intentDefault: "Hub-and-Spoke Topic Cluster",
      ctaLabel: "Build Topic Clusters & Intent Map ✨",
    };
  }
  if (slug.includes("readability") || slug.includes("clarity")) {
    return {
      keywordLabel: "Target Topic / Audience Benchmark",
      keywordDefault: "Grade 8 Executive Scannability",
      contentLabel: "Draft Paragraph or Article Excerpt to Score & Polish",
      contentDefault:
        "Organizations that implement automated content governance pipelines frequently observe that overly complex sentence structures reduce reader comprehension and lower organic conversion rates.",
      intentDefault: "Grade 7–8 Clarity & E-E-A-T Rewrite",
      ctaLabel: "Score Readability & Generate AI Rewrite ✨",
    };
  }
  if (slug.includes("faq") || slug.includes("snippet") || slug.includes("aeo")) {
    return {
      keywordLabel: "Core Question or Search Topic",
      keywordDefault: "How to win Google AI Overviews & Featured Snippets",
      contentLabel: "Supporting Facts, Product Details, or Context",
      contentDefault:
        "Pages with a 40–55 word direct answer block immediately below an H2 question and matching FAQPage JSON-LD earn significantly more Position-Zero citations.",
      intentDefault: "AEO / People-Also-Ask Snippets",
      ctaLabel: "Generate AEO Answer Block & FAQs ✨",
    };
  }
  return {
    keywordLabel: "Target Keyword / Primary Topic",
    keywordDefault: "AI Meta Title & Description Generator",
    contentLabel: "Meta Description Draft / Value Proposition (140–160 chars)",
    contentDefault:
      "Generate pixel-perfect 600px meta titles and 920px meta descriptions with live Google SERP preview, CTR scoring, and 1-click HTML export.",
    intentDefault: "Commercial & Informational CTR",
    ctaLabel: "Generate 5 AI Variations with Gemini ✨",
  };
}

export function InteractiveWebsiteToolRunner({
  tool,
  siteName,
  siteSlug,
  accentColor = "#22d3ee",
  compact = false,
  allTools,
  onSelectTool,
}: {
  tool: WebsiteToolSpec;
  siteName: string;
  siteSlug?: string;
  accentColor?: string;
  compact?: boolean;
  allTools?: WebsiteToolSpec[];
  onSelectTool?: (tool: WebsiteToolSpec) => void;
}) {
  const cleanBrand = useMemo(
    () => siteName.split(/[—·|]/)[0]?.trim() || "MetaCraft AI",
    [siteName],
  );
  const preset = useMemo(
    () => getToolPresetInputs(tool.caseStudySlug || tool.id, cleanBrand),
    [tool.caseStudySlug, tool.id, cleanBrand],
  );

  const [keyword, setKeyword] = useState(preset.keywordDefault);
  const [brand, setBrand] = useState(cleanBrand);
  const [intent, setIntent] = useState(preset.intentDefault);
  const [content, setContent] = useState(preset.contentDefault);
  const [customApiKey, setCustomApiKey] = useState("");
  const [showApiKeyBox, setShowApiKeyBox] = useState(false);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<"results" | "serp" | "code">("results");
  const [copiedKey, setCopiedKey] = useState<string>("");
  const [result, setResult] = useState<ToolRunPayload | null>(null);

  const siteDisplayPath = useMemo(() => {
    const slugPart = (siteSlug || cleanBrand.toLowerCase().replace(/[^a-z0-9]+/g, "-")).replace(/^\/+|\/+$/g, "");
    const toolPart = (tool.caseStudySlug || "meta-title-generator").replace(/^\/+|\/+$/g, "");
    return `/p/${slugPart} › ${toolPart}`;
  }, [siteSlug, cleanBrand, tool.caseStudySlug]);

  const canonicalSiteUrl = useMemo(() => {
    const slugPart = (siteSlug || cleanBrand.toLowerCase().replace(/[^a-z0-9]+/g, "-")).replace(/^\/+|\/+$/g, "");
    return `/p/${slugPart}`;
  }, [siteSlug, cleanBrand]);

  useEffect(() => {
    const nextPreset = getToolPresetInputs(tool.caseStudySlug || tool.id, cleanBrand);
    setKeyword(nextPreset.keywordDefault);
    setBrand(cleanBrand);
    setIntent(nextPreset.intentDefault);
    setContent(nextPreset.contentDefault);
    void executeToolRun({
      toolSlug: tool.caseStudySlug || tool.id,
      toolTitle: tool.title,
      keyword: nextPreset.keywordDefault,
      brand: cleanBrand,
      intent: nextPreset.intentDefault,
      content: nextPreset.contentDefault,
      pageUrl: canonicalSiteUrl,
      customKey: customApiKey,
      silent: true,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tool.id, tool.caseStudySlug, cleanBrand]);

  async function executeToolRun(params: {
    toolSlug: string;
    toolTitle: string;
    keyword: string;
    brand: string;
    intent: string;
    content: string;
    pageUrl: string;
    customKey: string;
    silent?: boolean;
  }) {
    if (!params.silent) setLoading(true);
    try {
      const response = await fetch("/api/website-builder/run-tool", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          toolSlug: params.toolSlug,
          toolTitle: params.toolTitle,
          keyword: params.keyword,
          brand: params.brand,
          intent: params.intent,
          content: params.content,
          pageUrl: params.pageUrl,
          customApiKey: params.customKey || undefined,
        }),
      });
      if (response.ok) {
        const data = (await response.json()) as ToolRunPayload;
        setResult(data);
      }
    } catch {
      // Keep current state if offline
    } finally {
      if (!params.silent) setLoading(false);
    }
  }

  function handleCopy(text: string, key: string) {
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      void navigator.clipboard.writeText(text);
    }
    setCopiedKey(key);
    window.setTimeout(() => setCopiedKey(""), 2200);
  }

  const liveTitle = useMemo(() => {
    const base = `${keyword.trim() || tool.title} — Free 2026 Tool | ${brand.trim() || cleanBrand}`;
    return base.slice(0, 68);
  }, [keyword, brand, tool.title, cleanBrand]);

  const titleChars = liveTitle.length;
  const titlePixels = Math.round(titleChars * 9.3);
  const descText = (content.trim() || tool.summary).slice(0, 168);
  const descChars = descText.length;
  const descPixels = Math.round(descChars * 5.7);

  return (
    <div
      id="tool-workspace"
      className="interactive-tool-runner"
      style={{
        background: "linear-gradient(160deg, #050b18 0%, #0a1529 100%)",
        border: `1px solid ${accentColor}55`,
        borderRadius: "20px",
        overflow: "hidden",
        boxShadow: "0 24px 64px rgba(0, 0, 0, 0.55)",
        color: "#f8fafc",
        textAlign: "left",
      }}
    >
      <div
        style={{
          background: "rgba(12, 24, 46, 0.95)",
          padding: "12px 18px",
          borderBottom: "1px solid rgba(148, 163, 184, 0.18)",
          display: "flex",
          flexWrap: "wrap",
          justifyContent: "space-between",
          alignItems: "center",
          gap: "10px",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
          <span
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "6px",
              padding: "4px 10px",
              borderRadius: "999px",
              background: "rgba(16, 185, 129, 0.16)",
              border: "1px solid rgba(16, 185, 129, 0.4)",
              color: "#6ee7b7",
              fontSize: "10.5px",
              fontWeight: 800,
              letterSpacing: "0.08em",
            }}
          >
            <Wrench size={12} /> LIVE IN-SITE AI TOOL WORKSPACE
          </span>
          <strong style={{ fontSize: "13.5px", color: "#ffffff" }}>{tool.title}</strong>
          <code
            style={{
              fontSize: "11px",
              color: "#94a3b8",
              background: "rgba(255,255,255,0.05)",
              padding: "2px 8px",
              borderRadius: "6px",
            }}
          >
            {siteDisplayPath}
          </code>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
          <span
            style={{
              fontSize: "10.5px",
              fontWeight: 700,
              padding: "3px 9px",
              borderRadius: "999px",
              background:
                result?.provider === "gemini-api"
                  ? "rgba(99, 102, 241, 0.22)"
                  : "rgba(34, 211, 238, 0.14)",
              border: "1px solid rgba(99, 102, 241, 0.4)",
              color: "#c7d2fe",
            }}
          >
            {result?.provider === "gemini-api"
              ? "⚡ Powered by Gemini AI Key"
              : "⚡ Instant AI + Pixel Engine Ready"}
          </span>
          <button
            type="button"
            onClick={() => setShowApiKeyBox((prev) => !prev)}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "5px",
              padding: "4px 10px",
              borderRadius: "8px",
              border: "1px solid rgba(148, 163, 184, 0.28)",
              background: "rgba(15, 23, 42, 0.8)",
              color: "#cbd5e1",
              fontSize: "11px",
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            <KeyRound size={12} />
            {customApiKey.trim() ? "Custom API Key Active" : "API Key Settings"}
          </button>
        </div>
      </div>

      {allTools && allTools.length > 1 && onSelectTool && (
        <div
          style={{
            padding: "10px 18px",
            background: "rgba(7, 13, 27, 0.9)",
            borderBottom: "1px solid rgba(148, 163, 184, 0.14)",
            display: "flex",
            alignItems: "center",
            gap: "8px",
            overflowX: "auto",
          }}
        >
          <span
            style={{
              fontSize: "10.5px",
              fontWeight: 800,
              letterSpacing: "0.08em",
              color: "#94a3b8",
              whiteSpace: "nowrap",
            }}
          >
            SWITCH TOOL ({allTools.length}):
          </span>
          {allTools.map((candidate, idx) => {
            const active = candidate.id === tool.id;
            return (
              <button
                key={candidate.id}
                type="button"
                onClick={() => onSelectTool(candidate)}
                style={{
                  padding: "6px 12px",
                  borderRadius: "999px",
                  border: active
                    ? `1px solid ${accentColor}`
                    : "1px solid rgba(148, 163, 184, 0.22)",
                  background: active ? "rgba(34, 211, 238, 0.16)" : "rgba(15, 23, 42, 0.7)",
                  color: active ? "#ffffff" : "#cbd5e1",
                  fontSize: "11.5px",
                  fontWeight: active ? 800 : 600,
                  cursor: "pointer",
                  whiteSpace: "nowrap",
                }}
              >
                0{idx + 1}. {candidate.title}
              </button>
            );
          })}
        </div>
      )}

      {showApiKeyBox && (
        <div
          style={{
            padding: "12px 18px",
            background: "rgba(15, 23, 42, 0.95)",
            borderBottom: "1px solid rgba(56, 189, 248, 0.28)",
            display: "flex",
            flexWrap: "wrap",
            alignItems: "center",
            justifyContent: "space-between",
            gap: "10px",
            fontSize: "12px",
          }}
        >
          <div style={{ color: "#cbd5e1" }}>
            <strong>Gemini API Key Configuration:</strong> Uses the built-in server{" "}
            <code>process.env.GEMINI_API_KEY</code> automatically. You can optionally enter a custom Gemini API key below:
          </div>
          <div style={{ display: "flex", gap: "8px", flex: "1 1 280px", maxWidth: "420px" }}>
            <input
              type="password"
              value={customApiKey}
              onChange={(e) => setCustomApiKey(e.target.value)}
              placeholder="Optional: Paste custom AIzaSy... Gemini key"
              style={{
                flex: 1,
                padding: "7px 10px",
                borderRadius: "8px",
                border: "1px solid rgba(56, 189, 248, 0.35)",
                background: "#050b16",
                color: "#f8fafc",
                fontSize: "12px",
              }}
            />
            <button
              type="button"
              onClick={() => setShowApiKeyBox(false)}
              style={{
                padding: "7px 12px",
                borderRadius: "8px",
                border: 0,
                background: accentColor,
                color: "#04101c",
                fontWeight: 700,
                fontSize: "12px",
                cursor: "pointer",
              }}
            >
              Save
            </button>
          </div>
        </div>
      )}

      <div
        style={{
          padding: compact ? "18px" : "22px",
          display: "grid",
          gridTemplateColumns: compact
            ? "1fr"
            : "repeat(auto-fit, minmax(320px, 1fr))",
          gap: "20px",
          alignItems: "start",
        }}
      >
        <div
          style={{
            background: "rgba(15, 23, 42, 0.72)",
            border: "1px solid rgba(148, 163, 184, 0.18)",
            borderRadius: "16px",
            padding: "18px",
            display: "grid",
            gap: "14px",
          }}
        >
          <div>
            <span
              style={{
                fontSize: "10.5px",
                fontWeight: 800,
                letterSpacing: "0.12em",
                color: accentColor,
                textTransform: "uppercase",
              }}
            >
              STEP 1 · CONFIGURE INPUTS
            </span>
            <h3 style={{ margin: "4px 0 0", fontSize: "17px", color: "#ffffff" }}>
              {tool.title}
            </h3>
            <p style={{ margin: "4px 0 0", fontSize: "12.5px", color: "#94a3b8", lineHeight: 1.5 }}>
              {tool.summary}
            </p>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
              gap: "10px",
            }}
          >
            <label style={{ display: "grid", gap: "5px", fontSize: "11.5px", color: "#cbd5e1", fontWeight: 600 }}>
              <span>{preset.keywordLabel}</span>
              <input
                type="text"
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                style={{
                  padding: "9px 11px",
                  borderRadius: "9px",
                  background: "#050b16",
                  border: "1px solid rgba(56, 189, 248, 0.35)",
                  color: "#ffffff",
                  fontSize: "13px",
                }}
              />
            </label>

            <label style={{ display: "grid", gap: "5px", fontSize: "11.5px", color: "#cbd5e1", fontWeight: 600 }}>
              <span>Website / Brand Name</span>
              <input
                type="text"
                value={brand}
                onChange={(e) => setBrand(e.target.value)}
                style={{
                  padding: "9px 11px",
                  borderRadius: "9px",
                  background: "#050b16",
                  border: "1px solid rgba(148, 163, 184, 0.28)",
                  color: "#ffffff",
                  fontSize: "13px",
                }}
              />
            </label>
          </div>

          <label style={{ display: "grid", gap: "5px", fontSize: "11.5px", color: "#cbd5e1", fontWeight: 600 }}>
            <span>Search Intent / Optimization Mode</span>
            <select
              value={intent}
              onChange={(e) => setIntent(e.target.value)}
              style={{
                padding: "9px 11px",
                borderRadius: "9px",
                background: "#050b16",
                border: "1px solid rgba(148, 163, 184, 0.28)",
                color: "#ffffff",
                fontSize: "12.5px",
              }}
            >
              <option value={preset.intentDefault}>{preset.intentDefault} (Recommended)</option>
              <option value="High-CTR Commercial & Comparison">High-CTR Commercial &amp; Comparison</option>
              <option value="Informational Pillar & AEO Answer">Informational Pillar &amp; AEO Answer</option>
              <option value="Transactional Landing Page">Transactional Tool / Product Page</option>
              <option value="Technical E-E-A-T Benchmark">Technical E-E-A-T Benchmark</option>
            </select>
          </label>

          <label style={{ display: "grid", gap: "5px", fontSize: "11.5px", color: "#cbd5e1", fontWeight: 600 }}>
            <span>{preset.contentLabel}</span>
            <textarea
              rows={3}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              style={{
                padding: "9px 11px",
                borderRadius: "9px",
                background: "#050b16",
                border: "1px solid rgba(56, 189, 248, 0.35)",
                color: "#ffffff",
                fontSize: "12.5px",
                lineHeight: 1.5,
                resize: "vertical",
              }}
            />
          </label>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "10px",
              padding: "10px 12px",
              borderRadius: "10px",
              background: "rgba(5, 11, 22, 0.78)",
              border: "1px solid rgba(148, 163, 184, 0.16)",
              fontSize: "11px",
            }}
          >
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", color: "#94a3b8" }}>
                <span>Title Pixel Gauge</span>
                <strong style={{ color: titlePixels <= 580 ? "#4ade80" : "#f87171" }}>
                  {titleChars} chars · ~{titlePixels}px / 600px
                </strong>
              </div>
              <div
                style={{
                  marginTop: "5px",
                  height: "6px",
                  borderRadius: "999px",
                  background: "rgba(255,255,255,0.08)",
                  overflow: "hidden",
                }}
              >
                <div
                  style={{
                    width: `${Math.min(100, Math.round((titlePixels / 600) * 100))}%`,
                    height: "100%",
                    background: titlePixels <= 580 ? "#22c55e" : "#ef4444",
                  }}
                />
              </div>
            </div>

            <div>
              <div style={{ display: "flex", justifyContent: "space-between", color: "#94a3b8" }}>
                <span>Description Gauge</span>
                <strong style={{ color: descPixels <= 900 ? "#4ade80" : "#f87171" }}>
                  {descChars} chars · ~{descPixels}px / 920px
                </strong>
              </div>
              <div
                style={{
                  marginTop: "5px",
                  height: "6px",
                  borderRadius: "999px",
                  background: "rgba(255,255,255,0.08)",
                  overflow: "hidden",
                }}
              >
                <div
                  style={{
                    width: `${Math.min(100, Math.round((descPixels / 920) * 100))}%`,
                    height: "100%",
                    background: descPixels <= 900 ? "#38bdf8" : "#ef4444",
                  }}
                />
              </div>
            </div>
          </div>

          <button
            type="button"
            disabled={loading}
            onClick={() =>
              void executeToolRun({
                toolSlug: tool.caseStudySlug || tool.id,
                toolTitle: tool.title,
                keyword,
                brand,
                intent,
                content,
                pageUrl: canonicalSiteUrl,
                customKey: customApiKey,
              })
            }
            style={{
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "8px",
              padding: "12px 18px",
              borderRadius: "11px",
              border: 0,
              background: "linear-gradient(135deg, #22d3ee 0%, #6366f1 100%)",
              color: "#04101c",
              fontWeight: 800,
              fontSize: "13.5px",
              cursor: loading ? "wait" : "pointer",
              boxShadow: "0 10px 28px rgba(34, 211, 238, 0.25)",
            }}
          >
            {loading ? (
              <>
                <RefreshCw size={15} /> Running AI Tool Engine…
              </>
            ) : (
              <>
                <Wand2 size={15} /> {preset.ctaLabel}
              </>
            )}
          </button>
        </div>

        <div
          style={{
            background: "rgba(15, 23, 42, 0.72)",
            border: "1px solid rgba(148, 163, 184, 0.18)",
            borderRadius: "16px",
            padding: "18px",
            display: "grid",
            gap: "14px",
          }}
        >
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              justifyContent: "space-between",
              alignItems: "center",
              gap: "8px",
              borderBottom: "1px solid rgba(148, 163, 184, 0.16)",
              paddingBottom: "10px",
            }}
          >
            <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
              <button
                type="button"
                onClick={() => setActiveTab("results")}
                style={{
                  padding: "6px 12px",
                  borderRadius: "8px",
                  border: 0,
                  background: activeTab === "results" ? "#6366f1" : "rgba(255,255,255,0.06)",
                  color: "#ffffff",
                  fontSize: "12px",
                  fontWeight: 700,
                  cursor: "pointer",
                }}
              >
                <Sparkles size={12} style={{ marginRight: "5px", verticalAlign: "middle" }} />
                AI Outputs ({result?.items.length ?? 5})
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("serp")}
                style={{
                  padding: "6px 12px",
                  borderRadius: "8px",
                  border: 0,
                  background: activeTab === "serp" ? "#6366f1" : "rgba(255,255,255,0.06)",
                  color: "#ffffff",
                  fontSize: "12px",
                  fontWeight: 700,
                  cursor: "pointer",
                }}
              >
                Google SERP Preview
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("code")}
                style={{
                  padding: "6px 12px",
                  borderRadius: "8px",
                  border: 0,
                  background: activeTab === "code" ? "#6366f1" : "rgba(255,255,255,0.06)",
                  color: "#ffffff",
                  fontSize: "12px",
                  fontWeight: 700,
                  cursor: "pointer",
                }}
              >
                <Code2 size={12} style={{ marginRight: "5px", verticalAlign: "middle" }} />
                HTML / JSON-LD Export
              </button>
            </div>

            {result && (
              <span
                style={{
                  padding: "4px 10px",
                  borderRadius: "999px",
                  background: "rgba(16, 185, 129, 0.16)",
                  border: "1px solid rgba(16, 185, 129, 0.4)",
                  color: "#6ee7b7",
                  fontSize: "11px",
                  fontWeight: 800,
                }}
              >
                Score: {result.overallScore}/100
              </span>
            )}
          </div>

          {result?.metrics && (
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(135px, 1fr))",
                gap: "8px",
              }}
            >
              {result.metrics.map((m) => (
                <div
                  key={m.label}
                  style={{
                    padding: "8px 10px",
                    borderRadius: "10px",
                    background: "rgba(5, 11, 22, 0.75)",
                    border: "1px solid rgba(148, 163, 184, 0.14)",
                    display: "grid",
                    gap: "2px",
                  }}
                >
                  <span style={{ fontSize: "10px", color: "#94a3b8" }}>{m.label}</span>
                  <strong
                    style={{
                      fontSize: "11.5px",
                      color:
                        m.status === "good"
                          ? "#4ade80"
                          : m.status === "warn"
                            ? "#fbbf24"
                            : "#38bdf8",
                    }}
                  >
                    {m.value}
                  </strong>
                </div>
              ))}
            </div>
          )}

          {activeTab === "results" && (
            <div style={{ display: "grid", gap: "10px", maxHeight: "420px", overflowY: "auto", paddingRight: "4px" }}>
              {(result?.items ?? []).map((item, idx) => {
                const copyId = `item-${idx}`;
                const fullCopy = `${item.title}\n${item.description}`;
                return (
                  <div
                    key={`${item.label}-${idx}`}
                    style={{
                      padding: "12px 14px",
                      borderRadius: "12px",
                      background: "rgba(5, 11, 22, 0.85)",
                      border: "1px solid rgba(99, 102, 241, 0.28)",
                      display: "grid",
                      gap: "6px",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        gap: "8px",
                        flexWrap: "wrap",
                      }}
                    >
                      <span
                        style={{
                          fontSize: "10.5px",
                          fontWeight: 800,
                          color: accentColor,
                          letterSpacing: "0.06em",
                        }}
                      >
                        {item.label}
                      </span>
                      <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                        {item.badge && (
                          <span
                            style={{
                              fontSize: "10px",
                              padding: "2px 8px",
                              borderRadius: "999px",
                              background: "rgba(16, 185, 129, 0.14)",
                              color: "#6ee7b7",
                              fontWeight: 700,
                            }}
                          >
                            {item.badge}
                          </span>
                        )}
                        <button
                          type="button"
                          onClick={() => handleCopy(fullCopy, copyId)}
                          style={{
                            display: "inline-flex",
                            alignItems: "center",
                            gap: "4px",
                            padding: "3px 8px",
                            borderRadius: "6px",
                            border: "1px solid rgba(148, 163, 184, 0.25)",
                            background: "rgba(255,255,255,0.05)",
                            color: "#e2e8f0",
                            fontSize: "10.5px",
                            fontWeight: 700,
                            cursor: "pointer",
                          }}
                        >
                          {copiedKey === copyId ? (
                            <>
                              <Check size={11} color="#4ade80" /> Copied
                            </>
                          ) : (
                            <>
                              <Copy size={11} /> Copy
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                    <strong style={{ fontSize: "14px", color: "#ffffff", lineHeight: 1.35 }}>
                      {item.title}
                    </strong>
                    <p style={{ margin: 0, fontSize: "12px", color: "#cbd5e1", lineHeight: 1.5 }}>
                      {item.description}
                    </p>
                  </div>
                );
              })}
            </div>
          )}

          {activeTab === "serp" && (
            <div style={{ display: "grid", gap: "12px" }}>
              <div
                style={{
                  padding: "16px",
                  borderRadius: "14px",
                  background: "#ffffff",
                  color: "#1e293b",
                  display: "grid",
                  gap: "6px",
                  boxShadow: "0 10px 25px rgba(0,0,0,0.25)",
                }}
              >
                <div
                  style={{
                    fontSize: "11.5px",
                    color: "#475569",
                    display: "flex",
                    justifyContent: "space-between",
                    flexWrap: "wrap",
                    gap: "6px",
                  }}
                >
                  <span>
                    <strong>{brand}</strong> · {siteDisplayPath}
                  </span>
                  <span
                    style={{
                      color: titlePixels <= 580 ? "#16a34a" : "#dc2626",
                      fontWeight: 700,
                    }}
                  >
                    {titleChars} chars · ~{titlePixels}px / 600px
                  </span>
                </div>
                <div
                  style={{
                    fontSize: "18px",
                    fontWeight: 700,
                    color: "#1a0dab",
                    lineHeight: 1.3,
                  }}
                >
                  {result?.items[0]?.title || liveTitle}
                </div>
                <div
                  style={{
                    fontSize: "13px",
                    color: "#334155",
                    lineHeight: 1.55,
                  }}
                >
                  {result?.items[0]?.description || descText}
                </div>
              </div>
              <small style={{ color: "#94a3b8", fontSize: "11.5px" }}>
                ✓ Verified in-site SERP preview for <code>{canonicalSiteUrl}</code> — zero external redirects.
              </small>
            </div>
          )}

          {activeTab === "code" && result?.codeBlock && (
            <div style={{ display: "grid", gap: "8px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontSize: "11.5px", fontWeight: 700, color: "#cbd5e1" }}>
                  {result.codeBlock.label}
                </span>
                <button
                  type="button"
                  onClick={() => handleCopy(result.codeBlock.code, "code-block")}
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "5px",
                    padding: "5px 10px",
                    borderRadius: "7px",
                    border: 0,
                    background: "#22d3ee",
                    color: "#04101c",
                    fontSize: "11px",
                    fontWeight: 800,
                    cursor: "pointer",
                  }}
                >
                  {copiedKey === "code-block" ? (
                    <>
                      <Check size={12} /> Copied Snippet!
                    </>
                  ) : (
                    <>
                      <Copy size={12} /> Copy Code
                    </>
                  )}
                </button>
              </div>
              <pre
                style={{
                  margin: 0,
                  padding: "12px",
                  borderRadius: "10px",
                  background: "#030712",
                  border: "1px solid rgba(148, 163, 184, 0.22)",
                  color: "#a5f3fc",
                  fontSize: "11.5px",
                  lineHeight: 1.5,
                  overflowX: "auto",
                  maxHeight: "320px",
                }}
              >
                <code>{result.codeBlock.code}</code>
              </pre>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
