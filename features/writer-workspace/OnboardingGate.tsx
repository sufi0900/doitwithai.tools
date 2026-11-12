"use client";

import {
  Globe,
  Sparkles,
  Wand2,
  ArrowRight,
  SlidersHorizontal,
  PenLine,
} from "lucide-react";
import { workspace } from "./model";
import type { Project } from "./types";
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
          placement notes, conclusion style, or your website URL for automatic internal link discovery.
          The studio unlocks once your research-backed draft is ready.
        </p>
      </div>

      {errorMessage ? (
        <div className={s.onboardingAlert} role="alert">
          <strong>Pipeline paused:</strong> {errorMessage}
        </div>
      ) : null}

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
                <option value="Indigo">Royal Indigo</option>
                <option value="Emerald">Emerald Data</option>
                <option value="Amber">Warm Editorial Amber</option>
                <option value="Rose">Vibrant Rose</option>
                <option value="Slate">Executive Slate</option>
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
