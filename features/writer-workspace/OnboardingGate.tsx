"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
  Globe,
  Sparkles,
  Wand2,
  ArrowRight,
  SlidersHorizontal,
  PenLine,
  Layers,
  Plus,
} from "lucide-react";
import { workspace } from "./model";
import type { Project } from "./types";
import { authorizedWebsiteFetch } from "@/features/website-builder/lib/supabase/browser";
import type { ConnectedWebsiteSummary } from "@/features/website-builder/ecosystem-bridge";
import {
  getSelectedWriterTargetSiteId,
  listLocalWebsiteInternalLinks,
  listLocalWebsitesAsConnectedSummaries,
  setSelectedWriterTargetSiteId,
} from "@/features/website-builder/lib/local-websites-store";
import s from "./workspace.module.css";

const SAMPLE_BRIEF = `Topic: AI SEO vs Traditional SEO: Which Strategy Wins in 2026?
Keyword: AI SEO vs Traditional SEO
Website: https://doitwithai.tools

Write a detailed, practical comparison guide for marketing founders and content leads.
H2: What Actually Separates AI SEO From Traditional SEO
H3: Research Speed and Intent Clustering
H3: Editorial Quality, E-E-A-T, and Brand Voice
H2: Side-by-Side Comparison: Cost, Speed, and Durability
Include a comparison table and a section infographic here.
H2: How to Build a Hybrid AI + Human SEO Workflow
Include step-by-step workflow instructions and an FAQ section at the end.
Finish with an actionable 30-day conclusion checklist.`;

export function OnboardingGate({
  project,
  busy,
  errorMessage,
  onPatchProject,
  onPatchWorkspace,
  onGenerateAll,
  onPlanFirst,
  onOpenStudioManually,
}: {
  project: Project;
  busy: boolean;
  errorMessage?: string;
  onPatchProject: (patch: Partial<Project>) => void;
  onPatchWorkspace: (patch: Partial<ReturnType<typeof workspace>>) => void;
  onGenerateAll: () => void;
  onPlanFirst: () => void;
  onOpenStudioManually: () => void;
}) {
  const w = workspace(project);
  const canLaunch =
    !busy && project.rawUserBriefOrSourceText.trim().length >= 3;

  const [detectedWebsites, setDetectedWebsites] = useState<
    ConnectedWebsiteSummary[]
  >([]);
  const [detectedLinks, setDetectedLinks] = useState<
    Array<{
      siteProjectId: string;
      siteName: string;
      publicSlug: string;
      title: string;
      slug: string;
      url: string;
    }>
  >([]);
  const [selectedSiteId, setSelectedSiteId] = useState<string>("__external__");

  const applyDetectedWebsite = React.useCallback(
    (
      siteId: string,
      sites = detectedWebsites,
      links = detectedLinks,
    ) => {
      setSelectedSiteId(siteId);
      if (siteId === "__external__" || !siteId) {
        setSelectedWriterTargetSiteId("");
        return;
      }
      setSelectedWriterTargetSiteId(siteId);
      const chosen = sites.find((item) => item.projectId === originId(siteId));
      if (!chosen) return;
      const origin =
        typeof window !== "undefined"
          ? window.location.origin
          : "https://doitwithai.tools";
      const siteUrl = chosen.publicSlug
        ? `${origin}/p/${chosen.publicSlug}`
        : `${origin}/ai-website-builder/studio/${chosen.projectId}`;

      const siteLinks = links
        .filter((l) => l.siteProjectId === chosen.projectId)
        .map((item) => ({
          id: `site-${chosen.projectId.slice(0, 8)}-${item.slug}`,
          anchorText: item.title,
          targetTitle: item.title,
          targetUrl: item.url,
          category: "pillar-guide" as const,
        }));

      onPatchProject({
        brandSiteUrl: siteUrl,
        ...(siteLinks.length > 0
          ? {
              internalLinks: [
                ...siteLinks,
                ...project.internalLinks.filter(
                  (existing) =>
                    !siteLinks.some((sl) => sl.targetUrl === existing.targetUrl),
                ),
              ].slice(0, 24),
            }
          : {}),
      });
      onPatchWorkspace({
        brand: {
          ...w.brand,
          name: chosen.name,
        },
      });
    },
    [detectedLinks, detectedWebsites, onPatchProject, onPatchWorkspace, project.internalLinks, w.brand],
  );

  useEffect(() => {
    let cancelled = false;
    async function detectUserWebsites() {
      const localSites = listLocalWebsitesAsConnectedSummaries();
      const localLinks = listLocalWebsiteInternalLinks();
      let serverSites: ConnectedWebsiteSummary[] = [];
      let serverLinks: typeof localLinks = [];

      try {
        const res = await authorizedWebsiteFetch("/api/website-builder/overview", {
          cache: "no-store",
        });
        if (res.ok) {
          const data = (await res.json()) as {
            websites?: ConnectedWebsiteSummary[];
            internalLinks?: typeof localLinks;
          };
          if (Array.isArray(data.websites)) serverSites = data.websites;
          if (Array.isArray(data.internalLinks)) serverLinks = data.internalLinks;
        }
      } catch {
        /* Local websites still work offline or without Google OAuth */
      }

      if (cancelled) return;
      const seen = new Set<string>();
      const mergedSites = [...localSites, ...serverSites].filter((item) => {
        if (seen.has(item.projectId)) return false;
        seen.add(item.projectId);
        return true;
      });
      const mergedLinks = [...localLinks, ...serverLinks];

      setDetectedWebsites(mergedSites);
      setDetectedLinks(mergedLinks);

      const preferred =
        getSelectedWriterTargetSiteId() || mergedSites[0]?.projectId || "";
      if (
        preferred &&
        mergedSites.some((item) => item.projectId === preferred)
      ) {
        setSelectedSiteId(preferred);
        setSelectedWriterTargetSiteId(preferred);
        const chosen = mergedSites.find((item) => item.projectId === preferred)!;
        const origin =
          typeof window !== "undefined"
            ? window.location.origin
            : "https://doitwithai.tools";
        const siteUrl = chosen.publicSlug
          ? `${origin}/p/${chosen.publicSlug}`
          : `${origin}/ai-website-builder/studio/${chosen.projectId}`;
        if (!project.brandSiteUrl) {
          onPatchProject({ brandSiteUrl: siteUrl });
        }
        if (!w.brand.name) {
          onPatchWorkspace({ brand: { ...w.brand, name: chosen.name } });
        }
      }
    }

    void detectUserWebsites();
    const onStorageUpdate = () => void detectUserWebsites();
    window.addEventListener("storage", onStorageUpdate);
    window.addEventListener("doitwithai-local-websites-updated", onStorageUpdate);
    return () => {
      cancelled = true;
      window.removeEventListener("storage", onStorageUpdate);
      window.removeEventListener(
        "doitwithai-local-websites-updated",
        onStorageUpdate,
      );
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <section
      className={s.onboardingCard}
      aria-label="Article creation onboarding wizard"
    >
      <div className={s.onboardingHero}>
        <div className={s.heroBadgeRow}>
          <span className={s.badge}>
            <Sparkles className="w-3.5 h-3.5" aria-hidden /> 11-Agent AI Content Engine
          </span>
          <span className={s.heroSubBadge}>
            Research + Internal Links + SERP + H1–H6 Draft + Featured 16:9 + Alt Text + Social/Video
          </span>
        </div>
        <h2>Brief your AI editorial team before opening the studio</h2>
        <p>
          Describe your article in natural human language — include custom H2/H3 headings, visual
          placement notes, conclusion style, or select one of your created websites below for
          automatic internal link discovery and 1-click publishing.
        </p>
      </div>

      {errorMessage ? (
        <div className={s.onboardingAlert} role="alert">
          <strong>Pipeline paused:</strong> {errorMessage}
        </div>
      ) : null}

      {/* AUTO-DETECTED USER WEBSITES SELECTOR */}
      <div
        style={{
          marginBottom: "16px",
          padding: "14px 16px",
          borderRadius: "14px",
          border: "1px solid rgba(99, 102, 241, 0.38)",
          background:
            "linear-gradient(135deg, rgba(12, 19, 44, 0.94), rgba(15, 23, 42, 0.92))",
          display: "grid",
          gap: "10px",
        }}
      >
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            alignItems: "center",
            justifyContent: "space-between",
            gap: "8px",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <Layers className="w-4 h-4 text-indigo-400" aria-hidden />
            <strong style={{ fontSize: "13px", color: "#f8fafc" }}>
              {detectedWebsites.length > 0
                ? `Connected Website Auto-Detected (${detectedWebsites.length} Website${detectedWebsites.length === 1 ? "" : "s"} Found)`
                : "Write for a DoItWithAI Website or Any External Domain"}
            </strong>
          </div>
          <Link
            href="/ai-website-builder/start"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "5px",
              fontSize: "11.5px",
              fontWeight: 700,
              color: "#818cf8",
              textDecoration: "none",
            }}
          >
            <Plus className="w-3.5 h-3.5" aria-hidden /> Create Another Website
          </Link>
        </div>

        {detectedWebsites.length > 0 ? (
          <div style={{ display: "grid", gap: "8px" }}>
            <label
              htmlFor="onboarding-detected-site"
              style={{ fontSize: "12px", color: "#cbd5e1" }}
            >
              Which website are you writing this blog post for?
            </label>
            <select
              id="onboarding-detected-site"
              value={selectedSiteId}
              onChange={(e) => applyDetectedWebsite(e.target.value)}
              style={{
                padding: "9px 12px",
                borderRadius: "10px",
                border: "1px solid rgba(99, 102, 241, 0.45)",
                background: "#060b18",
                color: "#f8fafc",
                fontSize: "13px",
              }}
            >
              {detectedWebsites.map((site) => (
                <option key={site.projectId} value={site.projectId}>
                  🌐 {site.name} ({site.templateName || site.templateId} ·{" "}
                  {site.publicSlug ? `/p/${site.publicSlug}` : "Local Draft"} ·{" "}
                  {site.publishedPostCount} posts)
                </option>
              ))}
              <option value="__external__">
                ✍️ Write for another / external website (enter custom URL below)
              </option>
            </select>
            {selectedSiteId !== "__external__" && (
              <small style={{ color: "#6ee7b7", fontSize: "11.5px" }}>
                ✓ Brand name, website URL, and existing blog/tool internal links are synced for 1-click publishing.
              </small>
            )}
          </div>
        ) : (
          <p style={{ margin: 0, fontSize: "12px", color: "#94a3b8" }}>
            No created websites detected in this browser yet. You can write for any external URL below, or{" "}
            <Link
              href="/ai-website-builder/start"
              style={{ color: "#38bdf8", textDecoration: "underline" }}
            >
              launch an AI Website or Blog in 60 seconds
            </Link>{" "}
            and publish articles to it in 1 click.
          </p>
        )}
      </div>

      <div className={s.formStack}>
        <div className={s.briefLabelRow}>
          <label className={s.label} htmlFor="onboarding-brief">
            Article brief, human prompt, or outline instructions
          </label>
          <button
            type="button"
            className={s.samplePromptBtn}
            onClick={() => {
              onPatchProject({
                rawUserBriefOrSourceText: SAMPLE_BRIEF,
                brandSiteUrl: project.brandSiteUrl || "https://doitwithai.tools",
                keywordCluster: {
                  ...project.keywordCluster,
                  primaryKeyword:
                    project.keywordCluster.primaryKeyword || "AI SEO vs Traditional SEO",
                  targetAudience:
                    project.keywordCluster.targetAudience ||
                    "Marketing leads and SaaS founders",
                },
              });
            }}
          >
            <Wand2 className="w-3.5 h-3.5" aria-hidden /> Load sample brief
          </button>
        </div>

        <textarea
          id="onboarding-brief"
          className={`${s.area} ${s.onboardingBriefArea}`}
          value={project.rawUserBriefOrSourceText}
          onChange={(e) =>
            onPatchProject({ rawUserBriefOrSourceText: e.target.value })
          }
          placeholder={`Example:\nTopic: Technical SEO Audit Checklist for SaaS Sites\nKeyword: technical SEO checklist\nWebsite: https://yourdomain.com\n\nExplain each step clearly, include a comparison table in Section 2, add an infographic after Core Web Vitals, and close with an actionable checklist conclusion.`}
        />

        <div className={s.onboardingGrid2}>
          <div>
            <label className={s.label} htmlFor="onboarding-website">
              <Globe className="w-3.5 h-3.5 inline mr-1" aria-hidden /> Target Website URL (for Internal Links)
            </label>
            <input
              id="onboarding-website"
              type="url"
              className={s.input}
              value={project.brandSiteUrl}
              onChange={(e) => onPatchProject({ brandSiteUrl: e.target.value })}
              placeholder="https://yoursite.com (optional — scans real pages)"
            />
          </div>

          <div>
            <label className={s.label} htmlFor="onboarding-keyword">
              Focus SEO Keyword
            </label>
            <input
              id="onboarding-keyword"
              className={s.input}
              value={project.keywordCluster.primaryKeyword}
              onChange={(e) =>
                onPatchProject({
                  keywordCluster: {
                    ...project.keywordCluster,
                    primaryKeyword: e.target.value,
                  },
                })
              }
              placeholder="e.g. AI content marketing workflow"
            />
          </div>
        </div>

        <details className={s.onboardingAdvanced}>
          <summary>
            <SlidersHorizontal className="w-3.5 h-3.5 inline mr-1.5" aria-hidden />
            Audience, Tone, Word Count, Language &amp; Brand Styling
          </summary>
          <div className={s.onboardingAdvancedGrid}>
            <div>
              <label className={s.label} htmlFor="onboarding-audience">
                Target Audience
              </label>
              <input
                id="onboarding-audience"
                className={s.input}
                value={project.keywordCluster.targetAudience}
                onChange={(e) =>
                  onPatchProject({
                    keywordCluster: {
                      ...project.keywordCluster,
                      targetAudience: e.target.value,
                    },
                  })
                }
                placeholder="Founders, marketers, practitioners"
              />
            </div>

            <div>
              <label className={s.label} htmlFor="onboarding-tone">
                Tone of Voice
              </label>
              <select
                id="onboarding-tone"
                className={s.input}
                value={project.keywordCluster.toneOfVoice}
                onChange={(e) =>
                  onPatchProject({
                    keywordCluster: {
                      ...project.keywordCluster,
                      toneOfVoice: e.target.value as Project["keywordCluster"]["toneOfVoice"],
                    },
                  })
                }
              >
                <option value="Authoritative & Human">Authoritative &amp; Human</option>
                <option value="Conversational First-Person">Conversational First-Person</option>
                <option value="Technical & Data-Driven">Technical &amp; Data-Driven</option>
                <option value="Executive B2B">Executive B2B</option>
              </select>
            </div>

            <div>
              <label className={s.label} htmlFor="onboarding-words">
                Target Length (words)
              </label>
              <select
                id="onboarding-words"
                className={s.input}
                value={w.targetWords}
                onChange={(e) =>
                  onPatchWorkspace({ targetWords: Number(e.target.value) || 1600 })
                }
              >
                <option value={900}>Short guide (~900 words)</option>
                <option value={1400}>Standard article (~1,400 words)</option>
                <option value={1800}>Deep guide (~1,800 words)</option>
                <option value={2600}>Comprehensive pillar (~2,600 words)</option>
              </select>
            </div>

            <div>
              <label className={s.label} htmlFor="onboarding-lang">
                Article Language
              </label>
              <input
                id="onboarding-lang"
                className={s.input}
                value={w.language}
                onChange={(e) => onPatchWorkspace({ language: e.target.value })}
                placeholder="English"
              />
            </div>

            <div>
              <label className={s.label} htmlFor="onboarding-brand">
                Brand Name (optional)
              </label>
              <input
                id="onboarding-brand"
                className={s.input}
                value={w.brand.name}
                onChange={(e) =>
                  onPatchWorkspace({ brand: { ...w.brand, name: e.target.value } })
                }
                placeholder="e.g. Acme Studio"
              />
            </div>

            <div>
              <label className={s.label} htmlFor="onboarding-color">
                Visual Accent Palette
              </label>
              <select
                id="onboarding-color"
                className={s.input}
                value={w.brand.color}
                onChange={(e) =>
                  onPatchWorkspace({ brand: { ...w.brand, color: e.target.value } })
                }
              >
                <option value="#5271FF">Royal Indigo</option>
                <option value="#10B981">Emerald Data</option>
                <option value="#F59E0B">Warm Editorial Amber</option>
                <option value="#F43F5E">Vibrant Rose</option>
                <option value="#475569">Executive Slate</option>
              </select>
            </div>
          </div>
        </details>

        <div className={s.onboardingActions}>
          <button
            type="button"
            className={`${s.btn} ${s.primary}`}
            disabled={!canLaunch}
            onClick={onGenerateAll}
          >
            <Sparkles className="w-4 h-4" aria-hidden />
            Research, Plan &amp; Write Complete Article
            <ArrowRight className="w-4 h-4" aria-hidden />
          </button>

          <button
            type="button"
            className={s.btn}
            disabled={!canLaunch}
            onClick={onPlanFirst}
          >
            Research &amp; Outline First
          </button>

          <button
            type="button"
            className={s.onboardingSkipBtn}
            disabled={busy}
            onClick={onOpenStudioManually}
          >
            <PenLine className="w-3.5 h-3.5" aria-hidden /> Open Blank Studio Manually
          </button>
        </div>
      </div>
    </section>
  );
}

function originId(value: string) {
  return value.trim();
}
