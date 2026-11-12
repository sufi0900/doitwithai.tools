"use client";

import { createPortal } from "react-dom";
import { Plus, Trash2, Upload, X, RefreshCw } from "lucide-react";
import { id, makeSection, workspace } from "./model";
import type { Project } from "./types";
import s from "./workspace.module.css";

export function BriefSettingsModal({
  open,
  project,
  sourceUrl,
  sourceBusy,
  onChangeSourceUrl,
  onAddSource,
  onClose,
  onPatchProject,
  onPatchWorkspace,
  onEditSectionTitle,
  onTriggerLogoUpload,
  onRebuildPlan,
  onDraftMissing,
  busy,
}: {
  open: boolean;
  project: Project;
  sourceUrl: string;
  sourceBusy: boolean;
  onChangeSourceUrl: (v: string) => void;
  onAddSource: () => void;
  onClose: () => void;
  onPatchProject: (patch: Partial<Project>) => void;
  onPatchWorkspace: (patch: Partial<ReturnType<typeof workspace>>) => void;
  onEditSectionTitle: (sid: string, title: string) => void;
  onTriggerLogoUpload: () => void;
  onRebuildPlan: () => void;
  onDraftMissing: () => void;
  busy: boolean;
}) {
  if (!open || typeof document === "undefined") return null;
  const w = workspace(project);

  return createPortal(
    <div
      className={s.modalBackdrop}
      role="dialog"
      aria-modal="true"
      aria-label="Edit article brief, outline, brand and references"
    >
      <div className={`${s.modal} ${s.briefModal}`}>
        <div className={s.modalHeader}>
          <div>
            <p className={s.eyebrow}>Article Setup &amp; Outline Editor</p>
            <h2>Brief, Outline Sections, Brand &amp; References</h2>
          </div>
          <button type="button" aria-label="Close modal" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <div className={s.briefModalBody}>
          <div className={s.formStack}>
            <label className={s.label} htmlFor="modal-brief-textarea">
              Article Brief / Prompt Instructions
            </label>
            <textarea
              id="modal-brief-textarea"
              className={s.area}
              rows={5}
              value={project.rawUserBriefOrSourceText}
              onChange={(e) =>
                onPatchProject({ rawUserBriefOrSourceText: e.target.value })
              }
            />

            <div className={s.onboardingGrid2}>
              <div>
                <label className={s.label} htmlFor="modal-website-input">
                  Website URL (for Internal Links)
                </label>
                <input
                  id="modal-website-input"
                  className={s.input}
                  value={project.brandSiteUrl}
                  onChange={(e) =>
                    onPatchProject({ brandSiteUrl: e.target.value })
                  }
                  placeholder="https://yoursite.com"
                />
              </div>
              <div>
                <label className={s.label} htmlFor="modal-keyword-input">
                  Focus SEO Keyword
                </label>
                <input
                  id="modal-keyword-input"
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
                />
              </div>
              <div>
                <label className={s.label} htmlFor="modal-audience-input">
                  Target Audience
                </label>
                <input
                  id="modal-audience-input"
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
                />
              </div>
              <div>
                <label className={s.label} htmlFor="modal-tone-input">
                  Tone &amp; Language
                </label>
                <div className={s.onboardingGrid2}>
                  <select
                    id="modal-tone-input"
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
                  <input
                    className={s.input}
                    aria-label="Language"
                    value={w.language}
                    onChange={(e) =>
                      onPatchWorkspace({ language: e.target.value })
                    }
                  />
                </div>
              </div>
            </div>

            <div className={s.briefModalSectionBlock}>
              <div className={s.seoBlockHeader}>
                <strong>Outline H2 Sections ({project.sections.length})</strong>
                <div className={s.inlineBtnRow}>
                  <button
                    type="button"
                    className={s.inlineToggleBtn}
                    disabled={busy}
                    onClick={() => {
                      onPatchProject({
                        sections: [
                          ...project.sections,
                          makeSection(
                            { heading: "New Section", subheadings: [] },
                            project.sections.length,
                          ),
                        ],
                      });
                    }}
                  >
                    <Plus size={13} /> Add H2
                  </button>
                  <button
                    type="button"
                    className={s.inlineToggleBtn}
                    disabled={busy || !project.sections.length}
                    onClick={() => {
                      onDraftMissing();
                      onClose();
                    }}
                  >
                    <RefreshCw size={13} /> Draft Empty Sections
                  </button>
                  <button
                    type="button"
                    className={s.inlineToggleBtn}
                    disabled={busy}
                    onClick={() => {
                      onRebuildPlan();
                      onClose();
                    }}
                  >
                    Rebuild Full Plan
                  </button>
                </div>
              </div>

              <div className={s.modalOutlineList}>
                {project.sections.map((sec, idx) => (
                  <div key={sec.id} className={s.modalOutlineItem}>
                    <span>H2.{idx + 1}</span>
                    <input
                      className={s.input}
                      value={sec.h2Text}
                      onChange={(e) =>
                        onEditSectionTitle(sec.id, e.target.value)
                      }
                    />
                    <button
                      type="button"
                      className={s.iconDangerBtn}
                      aria-label={`Remove section ${sec.h2Text}`}
                      onClick={() =>
                        onPatchProject({
                          sections: project.sections
                            .filter((x) => x.id !== sec.id)
                            .map((x, i) => ({ ...x, orderIndex: i + 1 })),
                        })
                      }
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <div className={s.briefModalSectionBlock}>
              <strong>Brand &amp; Visual Preferences</strong>
              <div className={s.onboardingGrid2}>
                <input
                  className={s.input}
                  value={w.brand.name}
                  placeholder="Brand name"
                  onChange={(e) =>
                    onPatchWorkspace({
                      brand: { ...w.brand, name: e.target.value },
                    })
                  }
                />
                <div className={s.inlineBtnRow}>
                  <select
                    className={s.input}
                    value={w.brand.color}
                    onChange={(e) =>
                      onPatchWorkspace({
                        brand: { ...w.brand, color: e.target.value },
                      })
                    }
                  >
                    <option value="#5271FF">Indigo</option>
                    <option value="#10B981">Emerald</option>
                    <option value="#F59E0B">Amber</option>
                    <option value="#F43F5E">Rose</option>
                    <option value="#475569">Slate</option>
                  </select>
                  <button
                    type="button"
                    className={s.inlineToggleBtn}
                    onClick={onTriggerLogoUpload}
                  >
                    <Upload size={13} /> Logo
                  </button>
                </div>
              </div>
            </div>

            <div className={s.briefModalSectionBlock}>
              <strong>Reference URLs ({w.references.length}/4)</strong>
              <div className={s.sourceAddRow}>
                <input
                  type="url"
                  className={s.input}
                  value={sourceUrl}
                  onChange={(e) => onChangeSourceUrl(e.target.value)}
                  placeholder="https://example.com/reference-article"
                />
                <button
                  type="button"
                  className={s.btn}
                  disabled={sourceBusy || w.references.length >= 4}
                  onClick={onAddSource}
                >
                  {sourceBusy ? "Reading…" : "Add Source"}
                </button>
              </div>
              {w.references.map((ref) => (
                <div key={ref.id} className={s.modalRefRow}>
                  <span>{ref.title || ref.url}</span>
                  <button
                    type="button"
                    onClick={() =>
                      onPatchWorkspace({
                        references: w.references.filter((r) => r.id !== ref.id),
                      })
                    }
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>,
    document.body,
  );
}
