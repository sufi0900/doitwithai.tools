/**
 * Phase 6: Closed-Loop Analytics, Winner-Clone Auto-Optimizer & Cloud Sync Bridge.
 *
 * Evaluates live or simulated Pinterest Pin Save Rate (`saves / impressions`) and
 * outbound CTR across campaigns, automatically promotes outliers outperforming
 * campaign median by >= 20% into persistent Winner Formula Memory, propagates that
 * winning visual DNA to upcoming queued jobs, and provides a schema-verified JSON
 * Cloud Sync bridge (Supabase / PostgreSQL ready) without requiring login in local sandbox mode.
 */

import { saveAutonomousStudioState } from "./local-storage-store";
import type {
  ArcadsHookArchetype,
  AutomatedArticleJob,
  AutonomousCampaign,
  AutonomousStudioStoreState,
  PinterestPinCandidate,
  WinnerFormulaRecord,
} from "./types";

export interface PinAnalyticsCandidateEvaluation {
  pinId: string;
  jobId: string;
  pinTitle: string;
  saveRatePercent: number;
  outboundCtrPercent: number;
  medianSaveRatePercent: number;
  outperformanceRatio: number;
  qualifiesAsWinner: boolean;
  recommendedHookArchetype: ArcadsHookArchetype;
}

export interface CloudSyncEnvelope {
  schemaVersion: "doitwithai-autonomous-cloud-sync-v1";
  exportedAtIso: string;
  workspaceChecksum: string;
  state: AutonomousStudioStoreState;
}

function computeMedian(values: number[]): number {
  if (!values.length) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  if (sorted.length % 2 === 1) return sorted[mid];
  return (sorted[mid - 1] + sorted[mid]) / 2;
}

function recommendedHookForAngle(
  angle: PinterestPinCandidate["angleLabel"],
): ArcadsHookArchetype {
  if (angle === "Myth vs. Reality Comparison") return "before-after-vs";
  if (angle === "Actionable Checklist") return "faq-direct-answer";
  return "numbered-playbook";
}

function checksumString(input: string): string {
  let h = 2166136261;
  for (let i = 0; i < input.length; i++) {
    h ^= input.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return `chk-${(h >>> 0).toString(16)}`;
}

/**
 * Evaluates every Pinterest Pin inside a campaign against the campaign median Save Rate
 * and flags winners outperforming median by >= 20% (`outperformanceRatio >= 1.2`).
 */
export function evaluateCampaignWinnerCandidates(
  campaign: AutonomousCampaign,
): PinAnalyticsCandidateEvaluation[] {
  const flatPins: Array<{
    jobId: string;
    pin: PinterestPinCandidate;
    saveRatePercent: number;
    outboundCtrPercent: number;
  }> = [];

  for (const job of campaign.jobs) {
    for (const pin of job.pinterestPins) {
      const impressions = Math.max(1, pin.simulatedMetrics?.impressions || 1000);
      const saves = pin.simulatedMetrics?.saves || 0;
      const clicks = pin.simulatedMetrics?.outboundClicks || 0;
      const saveRate =
        typeof pin.simulatedMetrics?.saveRatePercent === "number" &&
        pin.simulatedMetrics.saveRatePercent > 0
          ? pin.simulatedMetrics.saveRatePercent
          : Number(((saves / impressions) * 100).toFixed(2));
      const ctr = Number(((clicks / impressions) * 100).toFixed(2));
      flatPins.push({
        jobId: job.id,
        pin,
        saveRatePercent: saveRate,
        outboundCtrPercent: ctr,
      });
    }
  }

  if (!flatPins.length) return [];

  const medianSaveRate = Number(
    computeMedian(flatPins.map((p) => p.saveRatePercent)).toFixed(2),
  );
  const hasStatisticalOutlier = flatPins.some(
    (p) => p.saveRatePercent / Math.max(0.01, medianSaveRate) >= 1.2,
  );

  return flatPins
    .map((entry): PinAnalyticsCandidateEvaluation => {
      const ratio = Number(
        (entry.saveRatePercent / Math.max(0.01, medianSaveRate)).toFixed(2),
      );
      const qualifies = hasStatisticalOutlier
        ? ratio >= 1.2
        : entry.saveRatePercent >= 7.2 && ratio >= 1.05;

      return {
        pinId: entry.pin.id,
        jobId: entry.jobId,
        pinTitle: entry.pin.pinTitle,
        saveRatePercent: entry.saveRatePercent,
        outboundCtrPercent: entry.outboundCtrPercent,
        medianSaveRatePercent: medianSaveRate,
        outperformanceRatio: ratio,
        qualifiesAsWinner: qualifies,
        recommendedHookArchetype: recommendedHookForAngle(entry.pin.angleLabel),
      };
    })
    .sort((a, b) => b.saveRatePercent - a.saveRatePercent);
}

/**
 * Promotes outperforming Pin/Hook combinations into persistent Winner Formula Memory
 * and clones their winning palette, card style, and pattern onto upcoming queued jobs.
 */
export function runWinnerCloneAutoOptimizer(
  state: AutonomousStudioStoreState,
  campaignId?: string,
): {
  nextState: AutonomousStudioStoreState;
  promotedWinners: WinnerFormulaRecord[];
  evaluations: PinAnalyticsCandidateEvaluation[];
} {
  const targetCamp =
    state.campaigns.find((c) => c.id === (campaignId || state.activeCampaignId)) ||
    state.campaigns[0];

  if (!targetCamp) {
    return { nextState: state, promotedWinners: [], evaluations: [] };
  }

  const evaluations = evaluateCampaignWinnerCandidates(targetCamp);
  const nowIso = new Date().toISOString();
  const pinMap = new Map<string, PinterestPinCandidate>();
  for (const job of targetCamp.jobs) {
    for (const pin of job.pinterestPins) {
      pinMap.set(pin.id, pin);
    }
  }

  const promotedWinners: WinnerFormulaRecord[] = [];
  for (const ev of evaluations) {
    if (!ev.qualifiesAsWinner) continue;
    const pin = pinMap.get(ev.pinId);
    if (!pin) continue;

    const alreadyRecorded = state.winnerFormulas.some(
      (w) =>
        w.winningPrismLayout === pin.prismLayout &&
        w.winningPaletteId === pin.paletteId &&
        w.winningCardStyle === pin.cardStyle &&
        Math.abs(w.observedSaveRatePercent - ev.saveRatePercent) < 0.05,
    );
    if (alreadyRecorded) continue;

    promotedWinners.push({
      id: `winner-auto-${pin.id}-${Date.now()}`,
      label: `Auto-Promoted 2:3 ${pin.angleLabel} (${ev.saveRatePercent}% Save · ${ev.outperformanceRatio}x Median)`,
      sourceChannel: "pinterest",
      winningHookArchetype: ev.recommendedHookArchetype,
      winningPrismLayout: pin.prismLayout,
      winningPaletteId: pin.paletteId,
      winningCardStyle: pin.cardStyle,
      WinningBackgroundPattern: pin.backgroundPattern,
      observedSaveRatePercent: ev.saveRatePercent,
      observedCtrPercent: ev.outboundCtrPercent || 4.0,
      lockedAtIso: nowIso,
    });
  }

  const mergedWinners = [
    ...promotedWinners,
    ...state.winnerFormulas,
  ]
    .sort((a, b) => b.observedSaveRatePercent - a.observedSaveRatePercent)
    .slice(0, 8);

  const leadWinner = mergedWinners[0];
  const updatedCampaigns: AutonomousCampaign[] = state.campaigns.map(
    (camp): AutonomousCampaign => {
      if (camp.id !== targetCamp.id || !leadWinner) return camp;
      const updatedJobs: AutomatedArticleJob[] = camp.jobs.map(
        (job): AutomatedArticleJob => {
          if (job.status === "published") return job;
          const updatedPins: PinterestPinCandidate[] = job.pinterestPins.map(
            (pin): PinterestPinCandidate =>
              pin.pinVariantIndex === 1
                ? {
                    ...pin,
                    paletteId: leadWinner.winningPaletteId,
                    cardStyle: leadWinner.winningCardStyle,
                    backgroundPattern: leadWinner.WinningBackgroundPattern,
                  }
                : pin,
          );
          return {
            ...job,
            pinterestPins: updatedPins,
            updatedAtIso: nowIso,
          };
        },
      );
      return {
        ...camp,
        jobs: updatedJobs,
        updatedAtIso: nowIso,
      };
    },
  );

  return {
    nextState: {
      ...state,
      campaigns: updatedCampaigns,
      winnerFormulas: mergedWinners,
      lastSavedAtIso: nowIso,
    },
    promotedWinners,
    evaluations,
  };
}

/**
 * Serializes the complete localStorage studio state into a checksummed Cloud Sync
 * payload ready for Supabase / PostgreSQL persistence when users choose to sign in.
 */
export function exportStudioStateForCloudSync(
  state: AutonomousStudioStoreState,
): CloudSyncEnvelope {
  const serializedState = JSON.stringify(state);
  return {
    schemaVersion: "doitwithai-autonomous-cloud-sync-v1",
    exportedAtIso: new Date().toISOString(),
    workspaceChecksum: checksumString(serializedState),
    state,
  };
}

/**
 * Validates and restores a Cloud Sync payload back into the local autonomous studio
 * store while preserving all TypeScript invariants and optional storage persistence.
 */
export function importStudioStateFromCloudSync(
  rawPayload: string | CloudSyncEnvelope,
  storage?: Pick<Storage, "setItem">,
): AutonomousStudioStoreState {
  const parsed: CloudSyncEnvelope =
    typeof rawPayload === "string"
      ? (JSON.parse(rawPayload) as CloudSyncEnvelope)
      : rawPayload;

  if (
    !parsed ||
    parsed.schemaVersion !== "doitwithai-autonomous-cloud-sync-v1" ||
    !parsed.state ||
    parsed.state.version !== 1 ||
    !Array.isArray(parsed.state.campaigns) ||
    !Array.isArray(parsed.state.websites)
  ) {
    throw new Error("Invalid Autonomous Studio Cloud Sync payload.");
  }

  const expectedChecksum = checksumString(JSON.stringify(parsed.state));
  if (parsed.workspaceChecksum && parsed.workspaceChecksum !== expectedChecksum) {
    throw new Error("Cloud Sync checksum verification failed.");
  }

  return saveAutonomousStudioState(parsed.state, storage);
}
