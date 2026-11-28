"use client";

import React, { useEffect, useState } from "react";
import {
  ArrowRight,
  PenLine,
  SlidersHorizontal,
  Sparkles,
  Wand2,
} from "lucide-react";
import { patchWorkspace, workspace } from "./model";
import type { Project } from "./types";
import { authorizedWebsiteFetch } from "@/features/website-builder/lib/supabase/browser";
import type { ConnectedWebsiteSummary } from "@/features/website-builder/ecosystem-bridge";
import {
  listLocalWebsiteInternalLinks,
  listLocalWebsitesAsConnectedSummaries,
  setSelectedWriterTargetSiteId,
} from "@/features/website-builder/lib/local-websites-store";
import s from "./workspace.module.css";

const SAMPLE_BRIEF = `Topic: AI SEO vs Traditional SEO: Which Strategy Wins in 2026?
Keyword: AI SEO vs Traditional SEO

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
    !busy &&
    (project.keywordCluster.primaryKeyword.trim().length >= 2 ||
      project.rawUserBriefOrSourceText.trim().length >= 3);

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
        onPatchProject({ brandSiteUrl: "" });
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
    [
      detectedLinks,
      detectedWebsites,
      onPatchProject,
      onPatchWorkspace,
      project.internalLinks,
      w.brand,
    ],
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

      // Stay neutral when no site is configured on this project
      const currentSite = project.brandSiteUrl.trim();
      if (currentSite) {
        const matched = mergedSites.find(
          (item) =>
            (item.publicSlug && currentSite.includes(`/p/${item.publicSlug}`)) ||
            currentSite.includes(item.projectId),
        );
        if (matched) setSelectedSiteId(matched.projectId);
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

  const ensureBriefBeforeLaunch = (thenRun: () => void) => {
    if (
      !project.rawUserBriefOrSourceText.trim() &&
      project.keywordCluster.primaryKeyword.trim()
    ) {
      const kw = project.keywordCluster.primaryKeyword.trim();
      onPatchProject({
        rawUserBriefOrSourceText: `Topic: ${kw}\nKeyword: ${kw}`,
      });
    }
    thenRun();
  };

  return (
    <section
      className={s.onboardingCard}
      aria-label="Article creation onboarding wizard"
    >
      <div className={s.onboardingHero}>
        <div className={s.heroBadgeRow}>
          <span className={s.badge}>
            <Sparkles className="w-3.5 h-3.5" aria-hidden /> Editorial Brief
          </span>
          <span className={s.heroSubBadge}>
            Web Grounded · Competitor SERP Analysis · Custom Infographics &amp; Rich Editor
          </span>
        </div>
        <h2>Start a new article brief</h2>
        <p>
          Enter your target keyword and instructions. Optionally connect a site to match its brand voice and pull verified internal links.
        </p>
      </div>

      {errorMessage ? (
        <div className={s.onboardingAlert} role="alert">
          <strong>Pipeline paused:</strong> {errorMessage}
        </div>
      ) : null}

      <div className={s.formStack}>
        <div>
          <label className={s.label} htmlFor="onboarding-keyword">
            Primary SEO Keyword or Core Topic
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
            placeholder="e.g. indoor herb gardening for beginners, or AI workflow automation"
          />
        </div>

        <div>
          <div className={s.briefLabelRow}>
            <label className={s.label} htmlFor="onboarding-brief">
              Article Brief &amp; Editorial Angle
            </label>
            <button
              type="button"
              className={s.samplePromptBtn}
              onClick={() => {
                onPatchProject({
                  rawUserBriefOrSourceText: SAMPLE_BRIEF,
                  keywordCluster: {
                    ...project.keywordCluster,
                    primaryKeyword:
                      project.keywordCluster.primaryKeyword ||
                      "AI SEO vs Traditional SEO",
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
            placeholder="Describe who this is for, specific angles or custom H2 headings to cover, comparison tables to include, and any real-world context you want grounded."
          />
        </div>

        {/* Clean primary configuration strip (Length & Tone default to Auto) */}
        <div className={s.onboardingCompactRow}>
          <div>
            <label className={s.label} htmlFor="onboarding-detected-site">
              Connected Website
            </label>
            <select
              id="onboarding-detected-site"
              className={s.input}
              value={selectedSiteId}
              onChange={(e) => applyDetectedWebsite(e.target.value)}
            >
              <option value="__external__">
                No website (neutral brand voice)
              </option>
              {detectedWebsites.map((site) => (
                <option key={site.projectId} value={site.projectId}>
                  {site.name} ({site.publishedPostCount} posts)
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className={s.label} htmlFor="onboarding-lang">
              Language
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
            <span className={s.label}>Length &amp; Editorial Tone</span>
            <div className={s.autoModeReadout}>
              <Sparkles className="w-3.5 h-3.5" aria-hidden />
              <span>
                {w.lengthMode === "custom" ? `~${w.targetWords.toLocaleString()}w` : "Auto length"} ·{" "}
                {w.toneMode === "custom" ? project.keywordCluster.toneOfVoice : "Auto tone"}
              </span>
            </div>
          </div>
        </div>

        <details className={s.onboardingAdvanced}>
          <summary>
            <SlidersHorizontal
              className="w-3.5 h-3.5 inline mr-1.5"
              aria-hidden
            />
            Advanced Overrides: Target Length, Editorial Tone, Website URL &amp; Audience
          </summary>
          <div className={s.onboardingAdvancedGrid}>
            <div>
              <label className={s.label} htmlFor="onboarding-words">
                Target Length (default: Auto)
              </label>
              <select
                id="onboarding-words"
                className={s.input}
                value={w.lengthMode === "custom" ? String(w.targetWords) : "auto"}
                onChange={(e) => {
                  if (e.target.value === "auto") {
                    onPatchWorkspace({ lengthMode: "auto" });
                  } else {
                    onPatchWorkspace({
                      lengthMode: "custom",
                      targetWords: Number(e.target.value) || 1600,
                    });
                  }
                }}
              >
                <option value="auto">
                  Auto (Matched to intent, format &amp; web depth)
                </option>
                <option value="900">Short (~900 words)</option>
                <option value="1400">Standard (~1,400 words)</option>
                <option value="1800">Deep guide (~1,800 words)</option>
                <option value="2600">Pillar guide (~2,600 words)</option>
                <option value="3200">Comprehensive pillar (~3,200 words)</option>
              </select>
            </div>

            <div>
              <label className={s.label} htmlFor="onboarding-tone">
                Editorial Tone (default: Auto)
              </label>
              <select
                id="onboarding-tone"
                className={s.input}
                value={
                  w.toneMode === "custom"
                    ? project.keywordCluster.toneOfVoice
                    : "auto"
                }
                onChange={(e) => {
                  if (e.target.value === "auto") {
                    onPatchWorkspace({ toneMode: "auto" });
                  } else {
                    onPatchWorkspace({ toneMode: "custom" });
                    onPatchProject({
                      keywordCluster: {
                        ...project.keywordCluster,
                        toneOfVoice: e.target
                          .value as Project["keywordCluster"]["toneOfVoice"],
                      },
                    });
                  }
                }}
              >
                <option value="auto">
                  Auto (Matched to niche, intent &amp; brand voice)
                </option>
                <option value="Authoritative & Human">Authoritative &amp; Human</option>
                <option value="Conversational First-Person">
                  Conversational First-Person
                </option>
                <option value="Technical & Data-Driven">
                  Technical &amp; Data-Driven
                </option>
                <option value="Executive B2B">Executive B2B</option>
              </select>
            </div>

            <div>
              <label className={s.label} htmlFor="onboarding-website">
                External Website URL (optional — samples voice &amp; links)
              </label>
              <input
                id="onboarding-website"
                type="text"
                className={s.input}
                value={project.brandSiteUrl}
                onChange={(e) => onPatchProject({ brandSiteUrl: e.target.value })}
                placeholder="https://yoursite.com"
              />
            </div>

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
                placeholder="Founders, practitioners, beginners..."
              />
            </div>

            <div>
              <label className={s.label} htmlFor="onboarding-secondary">
                Secondary Keywords (comma separated)
              </label>
              <input
                id="onboarding-secondary"
                className={s.input}
                value={project.keywordCluster.secondaryKeywords.join(", ")}
                onChange={(e) =>
                  onPatchProject({
                    keywordCluster: {
                      ...project.keywordCluster,
                      secondaryKeywords: e.target.value
                        .split(",")
                        .map((item) => item.trim())
                        .filter(Boolean),
                    },
                  })
                }
                placeholder="term one, term two, term three"
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
                placeholder="Neutral editorial author if blank"
              />
            </div>

            <div>
              <label className={s.label} htmlFor="onboarding-voice-notes">
                Custom Brand Voice Notes (optional)
              </label>
              <input
                id="onboarding-voice-notes"
                className={s.input}
                value={w.brandVoiceOverride?.voiceSummary || ""}
                onChange={(e) => {
                  const nextVal = e.target.value;
                  onPatchWorkspace({
                    brandVoiceOverride: {
                      ...(w.brandVoiceOverride || {}),
                      voiceSummary: nextVal,
                    },
                  });
                }}
                placeholder="e.g. Concise, practitioner-first, zero buzzwords"
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
            onClick={() => ensureBriefBeforeLaunch(onGenerateAll)}
          >
            <Sparkles className="w-4 h-4" aria-hidden />
            Generate Full Article
            <ArrowRight className="w-4 h-4" aria-hidden />
          </button>

          <button
            type="button"
            className={s.btn}
            disabled={!canLaunch}
            onClick={() => ensureBriefBeforeLaunch(onPlanFirst)}
          >
            Build Outline First
          </button>

          <button
            type="button"
            className={s.onboardingSkipBtn}
            disabled={busy}
            onClick={() => {
              if (!w.brand.name && !project.brandSiteUrl) {
                patchWorkspace(project, {});
              }
              onOpenStudioManually();
            }}
          >
            <PenLine className="w-3.5 h-3.5" aria-hidden /> Open Blank Editor
          </button>
        </div>
      </div>
    </section>
  );
}

function originId(value: string) {
  return value.trim();
}
