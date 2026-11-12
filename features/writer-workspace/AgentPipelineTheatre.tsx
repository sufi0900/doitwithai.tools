"use client";

import {
  BarChart3,
  BrainCircuit,
  CheckCircle2,
  CircleDashed,
  Globe,
  Image as ImageIcon,
  LayoutTemplate,
  Link2,
  ListTree,
  Loader2,
  PauseCircle,
  PenTool,
  Search,
  Share2,
  ShieldCheck,
  Youtube,
  Instagram,
  Linkedin,
  Facebook,
  Sparkles,
} from "lucide-react";
import { workspace } from "./model";
import type { PipelineStageId, Project } from "./types";
import { INITIAL_PIPELINE_STAGES } from "./useGeneration";
import s from "./workspace.module.css";

const STAGE_ICONS: Record<PipelineStageId, React.ComponentType<{ className?: string }>> = {
  analyze: BrainCircuit,
  keywords: Search,
  web_research: Globe,
  internal_links: Link2,
  serp_meta: LayoutTemplate,
  featured_image: ImageIcon,
  outline: ListTree,
  sections: PenTool,
  infographics: BarChart3,
  readability_eeat: ShieldCheck,
  social_video: Share2,
};

export function AgentPipelineTheatre({
  project,
  busy,
  onStop,
}: {
  project: Project;
  busy: boolean;
  onStop: () => void;
}) {
  const w = workspace(project);
  const run = w.run;
  const stages = run.stages?.length ? run.stages : INITIAL_PIPELINE_STAGES;
  const doneCount = stages.filter(
    (st) => st.status === "done" || st.status === "skipped",
  ).length;
  const activeStage =
    stages.find((st) => st.status === "active") ||
    stages[Math.min(stages.length - 1, doneCount)];
  const ActiveIcon = activeStage ? STAGE_ICONS[activeStage.id] || Sparkles : Sparkles;
  const totalSections = project.sections.length;
  const completedSections = run.completed?.length || 0;
  const currentSecObj = project.sections.find((sec) => sec.id === run.current);
  const progressPct = Math.min(
    98,
    Math.max(
      10,
      Math.round(
        ((doneCount + (totalSections ? completedSections / totalSections : 0)) /
          (stages.length + 1)) *
          100,
      ),
    ),
  );
  const research = w.research;

  return (
    <section
      className={s.pipelineTheatre}
      role="status"
      aria-live="polite"
      aria-label="Multi-agent AI article pipeline progress"
    >
      <div className={s.theatreTopBar}>
        <div>
          <div className={s.theatrePulseBadge}>
            <span className={s.pulseDot} aria-hidden />
            {busy ? `Multi-Agent Pipeline Active · ${progressPct}% Complete` : "Pipeline Checkpoint"}
          </div>
          <h2 className={s.theatreTitle}>
            {run.stageLabel || "Orchestrating specialized AI editorial agents..."}
          </h2>
          {currentSecObj ? (
            <p className={s.theatreSub}>
              ✍️ Writing H2 section: <strong>{currentSecObj.h2Text}</strong> ({completedSections + 1} of {Math.max(1, totalSections)}) &amp; composing its inline section infographic…
            </p>
          ) : (
            <p className={s.theatreSub}>
              Your studio unlocks automatically with your H1–H6 article, 16:9 hero banner, inline infographics, internal/external links, and 9 social adapters ready.
            </p>
          )}
        </div>

        <button type="button" className={s.btn} onClick={onStop}>
          <PauseCircle className="w-4 h-4" aria-hidden /> Pause &amp; Keep Progress
        </button>
      </div>

      <div className={s.theatreProgressTrack} aria-hidden>
        <div
          className={s.theatreProgressFill}
          style={{ width: `${progressPct}%` }}
        />
      </div>

      {/* Active Sub-Agent Spotlight & Shimmer Writing Canvas */}
      <div className={s.theatreWorkbenchGrid}>
        <div className={s.theatreSpotlightCard}>
          <div className={s.theatreSpotlightIconWrap}>
            <ActiveIcon className="w-6 h-6" aria-hidden />
            <span className={s.theatreOrbitDot} aria-hidden />
          </div>
          <div className={s.theatreSpotlightBody}>
            <span className={s.eyebrow}>
              Active Sub-Agent ({Math.min(stages.length, doneCount + 1)} of {stages.length})
            </span>
            <strong>{activeStage?.label || "AI Content Writer Agent"}</strong>
            <p>
              {activeStage?.detail ||
                (currentSecObj
                  ? `Structuring "${currentSecObj.h2Text}" with short sentences, bullet points & section visual`
                  : "Analyzing search intent, verified links, and editorial hierarchy")}
            </p>
          </div>
        </div>

        <div className={s.skeletonContainer} aria-hidden>
          <div className={s.skeletonHeaderRow}>
            <div className={s.skeletonPill} />
            <div className={s.skeletonTitleBar} />
          </div>
          <div className={s.skeletonParagraph}>
            <div className={s.skeletonLineFull} />
            <div className={s.skeletonLineFull} />
            <div className={s.skeletonLineMedium} />
          </div>
          {project.sections.length > 0 ? (
            <div className={s.skeletonSectionChips}>
              {project.sections.map((sec, idx) => {
                const isDone =
                  Boolean(sec.bodyMarkdown.trim()) ||
                  sec.subHeadings.some((h) => Boolean(h.bodyMarkdown.trim()));
                const isCurrent = sec.id === run.current;
                return (
                  <div
                    key={sec.id}
                    className={`${s.skeletonChip} ${
                      isDone
                        ? s.skeletonChipDone
                        : isCurrent
                          ? s.skeletonChipCurrent
                          : ""
                    }`}
                  >
                    {isDone ? (
                      <CheckCircle2 className="w-3.5 h-3.5" />
                    ) : isCurrent ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <span>{idx + 1}</span>
                    )}
                    <span>{sec.h2Text}</span>
                  </div>
                );
              })}
            </div>
          ) : null}
        </div>
      </div>

      <div className={s.theatreGrid}>
        {stages.map((stage, idx) => {
          const Icon = STAGE_ICONS[stage.id] || BrainCircuit;
          const active = stage.status === "active";
          const done = stage.status === "done";
          const skipped = stage.status === "skipped";
          return (
            <div
              key={stage.id}
              className={`${s.theatreStageCard} ${
                active
                  ? s.theatreStageActive
                  : done
                    ? s.theatreStageDone
                    : skipped
                      ? s.theatreStageSkipped
                      : ""
              }`}
            >
              <div className={s.theatreStageIcon}>
                {active ? (
                  <Loader2 className="w-4 h-4 animate-spin" aria-hidden />
                ) : done ? (
                  <CheckCircle2 className="w-4 h-4" aria-hidden />
                ) : (
                  <Icon className="w-4 h-4" aria-hidden />
                )}
              </div>
              <div className={s.theatreStageBody}>
                <div className={s.theatreStageTitle}>
                  {String(idx + 1).padStart(2, "0")} · {stage.label}
                </div>
                <div className={s.theatreStageMeta}>
                  {stage.detail ||
                    (active
                      ? "Working now..."
                      : done
                        ? "Completed"
                        : skipped
                          ? "Optional / skipped"
                          : "Queued")}
                </div>
              </div>
              {stage.id === "social_video" ? (
                <div className={s.socialMicroIcons} aria-hidden>
                  <Facebook className="w-3 h-3" />
                  <Instagram className="w-3 h-3" />
                  <Linkedin className="w-3 h-3" />
                  <Youtube className="w-3 h-3" />
                </div>
              ) : null}
            </div>
          );
        })}
      </div>

      {research ? (
        <div className={s.theatrePacketPreview}>
          <div className={s.theatrePacketHeader}>
            <CircleDashed className="w-3.5 h-3.5" aria-hidden />
            Live Research &amp; Link Discovery Packet Active
          </div>
          <div className={s.theatrePacketRow}>
            <span>
              <strong>Intent:</strong> {research.searchIntent}
            </span>
            <span>
              <strong>Focus Keyword:</strong> {research.primaryKeyword || "—"}
            </span>
            <span>
              <strong>Secondary / LSI:</strong>{" "}
              {research.secondaryKeywords.length + research.lsiEntities.length} mapped
            </span>
            <span>
              <strong>Verified Internal Links:</strong>{" "}
              {research.internalLinks.length}
            </span>
            <span>
              <strong>Authority Citations:</strong>{" "}
              {research.externalLinks.length}
            </span>
          </div>
        </div>
      ) : null}
    </section>
  );
}
