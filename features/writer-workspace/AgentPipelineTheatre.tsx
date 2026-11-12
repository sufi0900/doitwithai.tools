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
  const totalSections = project.sections.length;
  const completedSections = run.completed?.length || 0;
  const progressPct = Math.min(
    98,
    Math.max(
      8,
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
            {busy ? "Multi-Agent Pipeline Active" : "Pipeline Checkpoint"}
          </div>
          <h2 className={s.theatreTitle}>
            {run.stageLabel || "Orchestrating specialized AI editorial agents..."}
          </h2>
          {run.current ? (
            <p className={s.theatreSub}>
              Currently drafting section: <strong>{run.current}</strong> ({completedSections}/{Math.max(1, totalSections)})
            </p>
          ) : (
            <p className={s.theatreSub}>
              Your studio unlocks automatically with your article, 16:9 banner, alt texts, internal links, and 9 social adapters ready.
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

      <div className={s.theatreGrid}>
        {stages.map((stage) => {
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
                <div className={s.theatreStageTitle}>{stage.label}</div>
                <div className={s.theatreStageMeta}>
                  {stage.detail ||
                    (active
                      ? "Running now..."
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
            Live Research Packet Ready
          </div>
          <div className={s.theatrePacketRow}>
            <span>
              <strong>Intent:</strong> {research.searchIntent}
            </span>
            <span>
              <strong>Focus Keyword:</strong> {research.primaryKeyword || "—"}
            </span>
            <span>
              <strong>Secondary / LSI:</strong> {research.secondaryKeywords.length + research.lsiEntities.length} mapped
            </span>
            <span>
              <strong>Verified Site Links:</strong> {research.internalLinks.length}
            </span>
            <span>
              <strong>Authority Sources:</strong> {research.externalLinks.length}
            </span>
          </div>
        </div>
      ) : null}
    </section>
  );
}
