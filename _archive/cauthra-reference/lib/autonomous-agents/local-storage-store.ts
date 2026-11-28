/**
 * Phase 1 Foundation: Zero-Auth Browser `localStorage` & Cache Persistence Store
 * (`doitwithai_autonomous_studio_v1`).
 *
 * Allows the Founder and QA to test all 12 Autonomous Agents, 1–15 article batch
 * campaigns, Arcads Social Hook matrices, Pinterest 2:3 Pins, Internal (`/p/[slug]`)
 * vs. External Website publishing, and Winner-Clone Memory directly in the browser
 * without requiring sign-in during open preview testing.
 */

import { AUTONOMOUS_AGENT_ROLES } from "./agent-roles";
import {
  buildArcadsSocialPackForJob,
  buildPinterestThreePinSuite,
  discoverLowKdTopicsForWebsite,
  scoreGeoCitationReadiness,
} from "./arcads-social-engine";
import type {
  ArcadsHookArchetype,
  AutomatedArticleJob,
  AutonomousAgentId,
  AutonomousCampaign,
  AutonomousStudioStoreState,
  ConnectedWebsiteProfile,
  PinterestPinCandidate,
  WinnerFormulaRecord,
} from "./types";

export const AUTONOMOUS_STUDIO_STORAGE_KEY =
  "doitwithai_autonomous_studio_v1";

export const LOCAL_BUILDER_SITES_STORAGE_KEY =
  "doitwithai-website-builder-sites-v1";

export function createDefaultAutonomousStudioState(): AutonomousStudioStoreState {
  const nowIso = new Date().toISOString();

  const defaultWebsite: ConnectedWebsiteProfile = {
    id: "site-doitwithai-flagship",
    siteName: "DoItWithAI.tools",
    siteUrl: "https://doitwithai.tools",
    publishingMode: "external-workspace-staging",
    primaryNiche: "AI SEO, Content Writing & Marketing Tools",
    brandPrimaryHex: "#4867FF",
    brandSecondaryHex: "#10B981",
    darkThemePreferred: true,
    installedTools: [
      {
        slug: "blog-section-infographic-generator",
        title: "Free AI Blog Section Infographic Generator",
        url: "https://doitwithai.tools/tools/blog-section-infographic-generator",
      },
      {
        slug: "meta-title-generator",
        title: "AI Meta Title & SERP Pixel Optimizer",
        url: "https://doitwithai.tools/tools/meta-title-generator",
      },
      {
        slug: "on-page-ai-seo-analyzer",
        title: "On-Page AI SEO Analyzer & Repair Agent",
        url: "https://doitwithai.tools/tools/on-page-ai-seo-analyzer",
      },
      {
        slug: "schema-markup-generator",
        title: "JSON-LD Schema Markup & @graph Generator",
        url: "https://doitwithai.tools/tools/schema-markup-generator",
      },
      {
        slug: "readability-checker",
        title: "AI Readability, Sentence Clarity & E-E-A-T Scorer",
        url: "https://doitwithai.tools/tools/readability-checker",
      },
    ],
  };

  const internalBuilderWebsite: ConnectedWebsiteProfile = {
    id: "site-internal-builder-demo",
    siteName: "DoItWithAI Multi-Tool Directory (/p/doitwithai-multi-tool-directory-publication)",
    siteUrl: "https://doitwithai.tools",
    publishingMode: "internal-doitwithai-site",
    internalBuilderSlug: "doitwithai-multi-tool-directory-publication",
    primaryNiche: "AI SEO Utilities & Editorial Publication",
    brandPrimaryHex: "#4F46E5",
    brandSecondaryHex: "#F59E0B",
    darkThemePreferred: true,
    installedTools: defaultWebsite.installedTools,
  };

  const defaultWinners: WinnerFormulaRecord[] = [
    {
      id: "winner-pinterest-timeline-indigo",
      label: "Pinterest 2:3 Step-by-Step Timeline · Indigo Cyber + Playbook Contrast",
      sourceChannel: "pinterest",
      winningHookArchetype: "numbered-playbook",
      winningPrismLayout: "timeline",
      winningPaletteId: "indigo-cyber",
      winningCardStyle: "playbook-contrast",
      WinningBackgroundPattern: "dots-glow",
      observedSaveRatePercent: 7.4,
      observedCtrPercent: 3.8,
      lockedAtIso: nowIso,
    },
    {
      id: "winner-linkedin-bento-royal",
      label: "LinkedIn 4:5 Carousel · DIWAT Royal Blue + Bordered Bento",
      sourceChannel: "linkedin",
      winningHookArchetype: "contrarian-data",
      winningPrismLayout: "editorial",
      winningPaletteId: "blue-trust",
      winningCardStyle: "bordered-bento",
      WinningBackgroundPattern: "mesh-grid",
      observedSaveRatePercent: 5.9,
      observedCtrPercent: 4.5,
      lockedAtIso: nowIso,
    },
  ];

  const seedJobs = discoverLowKdTopicsForWebsite(
    defaultWebsite,
    [
      "How to Optimize Blog Sections for AI Search Citations & Google AI Overviews",
      "5-Step ChatGPT Content Editing Workflow for Technical SEO Teams",
      "Programmatic Section Infographics vs Generic Stock Images for Pinterest SEO",
      "JSON-LD @graph Entity Linking for Multi-Tool AI Websites",
      "Zero-Click Search Playbook: Writing 50-Word AEO Direct Answer Blocks",
    ].join("\n"),
    5,
    defaultWinners,
  );

  const defaultCampaign: AutonomousCampaign = {
    id: "campaign-2027-flagship-pilot",
    name: "Q1 2027 AI SEO & Visual Authority Sprint (5-Article Pilot)",
    createdAtIso: nowIso,
    updatedAtIso: nowIso,
    websiteId: defaultWebsite.id,
    seedTopicsOrPrompt:
      "Focus on AI SEO, answer engine citations, programmatic section infographics, and technical content workflows.",
    targetArticleCount: 5,
    cadence: "weekly-2-articles",
    approvalMode: "confidence-gated-90",
    confidenceThreshold: 90,
    status: "running",
    jobs: seedJobs,
  };

  return {
    version: 1,
    activeCampaignId: defaultCampaign.id,
    websites: [defaultWebsite, internalBuilderWebsite],
    campaigns: [defaultCampaign],
    socialConnections: [
      {
        channel: "pinterest",
        label: "Pinterest Business (2:3 Visual Pin Agent)",
        enabled: true,
        connectorMode: "buffer-mcp",
        accountHandle: "@doitwithaitools",
        defaultBoardOrTarget: "AI SEO & Content Workflows",
        bufferMcpConnected: true,
        lastSyncedAtIso: nowIso,
      },
      {
        channel: "linkedin",
        label: "LinkedIn Company Page (1080×1350 PDF Carousel Agent)",
        enabled: true,
        connectorMode: "buffer-mcp",
        accountHandle: "Do It With AI Tools",
        defaultBoardOrTarget: "Company Feed · PDF Carousels",
        bufferMcpConnected: true,
        lastSyncedAtIso: nowIso,
      },
      {
        channel: "x-twitter",
        label: "X / Twitter (5-Post Visual Thread Agent)",
        enabled: true,
        connectorMode: "buffer-mcp",
        accountHandle: "@doitwithaitools",
        defaultBoardOrTarget: "Technical Threads",
        bufferMcpConnected: true,
        lastSyncedAtIso: nowIso,
      },
      {
        channel: "instagram",
        label: "Instagram (4:5 Carousel & Visual Cards)",
        enabled: false,
        connectorMode: "local-browser-sandbox",
        accountHandle: "@doitwithai.tools",
        defaultBoardOrTarget: "Carousel Feed",
        bufferMcpConnected: false,
      },
      {
        channel: "newsletter",
        label: "Email Newsletter Digest Edition",
        enabled: true,
        connectorMode: "local-browser-sandbox",
        accountHandle: "Weekly AI SEO Dispatch",
        defaultBoardOrTarget: "Subscribers List",
        bufferMcpConnected: false,
      },
    ],
    byokConfig: {
      usePlatformFreeTier: true,
      geminiFreeKeyMasked: "",
      groqFreeKeyMasked: "",
      rpmCooldownSeconds: 45,
      maxArticlesPerCampaign: 15,
      dailyTokenCap: 250000,
    },
    winnerFormulas: defaultWinners,
    lastSavedAtIso: nowIso,
  };
}

/**
 * Loads the autonomous studio state from `localStorage` (falling back cleanly to
 * the seeded default state during SSR or fresh browser sessions).
 */
export function loadAutonomousStudioState(
  storage?: Pick<Storage, "getItem">,
): AutonomousStudioStoreState {
  const store =
    storage || (typeof window !== "undefined" ? window.localStorage : undefined);
  const fallback = createDefaultAutonomousStudioState();
  if (!store) return fallback;

  try {
    const raw = store.getItem(AUTONOMOUS_STUDIO_STORAGE_KEY);
    if (!raw) return fallback;
    const parsed = JSON.parse(raw) as Partial<AutonomousStudioStoreState>;
    if (
      !parsed ||
      parsed.version !== 1 ||
      !Array.isArray(parsed.campaigns) ||
      !parsed.campaigns.length ||
      !Array.isArray(parsed.websites) ||
      !parsed.websites.length
    ) {
      return fallback;
    }
    return {
      ...fallback,
      ...parsed,
      byokConfig: { ...fallback.byokConfig, ...(parsed.byokConfig || {}) },
    };
  } catch {
    return fallback;
  }
}

export function saveAutonomousStudioState(
  state: AutonomousStudioStoreState,
  storage?: Pick<Storage, "setItem">,
): AutonomousStudioStoreState {
  const next: AutonomousStudioStoreState = {
    ...state,
    lastSavedAtIso: new Date().toISOString(),
  };
  const store =
    storage || (typeof window !== "undefined" ? window.localStorage : undefined);
  if (store) {
    try {
      store.setItem(AUTONOMOUS_STUDIO_STORAGE_KEY, JSON.stringify(next));
    } catch {
      // Ignore quota errors in restricted private browsing modes
    }
  }
  return next;
}

export function resetAutonomousStudioState(
  storage?: Pick<Storage, "removeItem" | "setItem">,
): AutonomousStudioStoreState {
  const fresh = createDefaultAutonomousStudioState();
  const store =
    storage || (typeof window !== "undefined" ? window.localStorage : undefined);
  if (store) {
    try {
      store.removeItem(AUTONOMOUS_STUDIO_STORAGE_KEY);
      store.setItem(AUTONOMOUS_STUDIO_STORAGE_KEY, JSON.stringify(fresh));
    } catch {}
  }
  return fresh;
}

/**
 * Advances a single queued article job by one Autonomous Agent step (or completes all
 * remaining steps when `completeAll === true`), updating its status, GEO Citation
 * Readiness report, Arcads variations, Pinterest Pins, and published URL in `localStorage`.
 */
export function advanceCampaignJobStep(
  state: AutonomousStudioStoreState,
  campaignId: string,
  jobId: string,
  completeAll = false,
): AutonomousStudioStoreState {
  const allAgentIds: AutonomousAgentId[] = AUTONOMOUS_AGENT_ROLES.map(
    (r) => r.id,
  );
  const nowIso = new Date().toISOString();

  const campaigns: AutonomousCampaign[] = state.campaigns.map(
    (camp): AutonomousCampaign => {
      if (camp.id !== campaignId) return camp;
      const website =
        state.websites.find((w) => w.id === camp.websiteId) || state.websites[0];

      const jobs: AutomatedArticleJob[] = camp.jobs.map(
        (job): AutomatedArticleJob => {
          if (job.id !== jobId) return job;

          let nextCompleted: AutonomousAgentId[];
          if (completeAll) {
            nextCompleted = [...allAgentIds];
          } else {
            const missing = allAgentIds.filter(
              (id) => !job.completedAgents.includes(id),
            );
            nextCompleted = missing.length
              ? [...job.completedAgents, missing[0]]
              : [...allAgentIds];
          }

          const remaining = allAgentIds.filter(
            (id) => !nextCompleted.includes(id),
          );
          const activeAgent = remaining[0];
          const geoReadiness = scoreGeoCitationReadiness(job);
          const arcadsVariations =
            job.arcadsVariations.length > 0
              ? job.arcadsVariations
              : buildArcadsSocialPackForJob(job, website, state.winnerFormulas);
          const pinterestPins =
            job.pinterestPins.length > 0
              ? job.pinterestPins
              : buildPinterestThreePinSuite(job, website, state.winnerFormulas);

          let status: AutomatedArticleJob["status"] = job.status;
          let publishedUrl = job.publishedUrl;

          if (remaining.length === 0) {
            const autoPublishAllowed =
              camp.approvalMode === "confidence-gated-90" &&
              geoReadiness.overallScore >= camp.confidenceThreshold;
            status = autoPublishAllowed ? "published" : "ready-for-review";
            if (autoPublishAllowed) {
              publishedUrl =
                website.publishingMode === "internal-doitwithai-site" &&
                website.internalBuilderSlug
                  ? `/p/${website.internalBuilderSlug}/blog/${job.urlSlug}`
                  : `${website.siteUrl.replace(/\/$/, "")}/blog/${job.urlSlug}`;
            }
          } else if (nextCompleted.length <= 3) {
            status = "researching";
          } else if (nextCompleted.length <= 5) {
            status = "drafting-article";
          } else if (nextCompleted.length === 6) {
            status = "generating-visuals";
          } else if (nextCompleted.length <= 10) {
            status = "building-social-matrix";
          } else {
            status = "qa-critic-review";
          }

          const updatedPins: PinterestPinCandidate[] = pinterestPins.map(
            (pin): PinterestPinCandidate => ({
              ...pin,
              status:
                status === "published" ? "scheduled-buffer" : pin.status,
            }),
          );

          return {
            ...job,
            completedAgents: nextCompleted,
            activeAgent,
            status,
            publishedUrl,
            geoReadiness,
            arcadsVariations,
            pinterestPins: updatedPins,
            updatedAtIso: nowIso,
          };
        },
      );

      const allDone = jobs.every(
        (j) => j.status === "published" || j.status === "ready-for-review",
      );
      const nextCampaignStatus: AutonomousCampaign["status"] = allDone
        ? "completed"
        : "running";

      return {
        ...camp,
        status: nextCampaignStatus,
        updatedAtIso: nowIso,
        jobs,
      };
    },
  );

  return {
    ...state,
    campaigns,
    lastSavedAtIso: nowIso,
  };
}

/**
 * Locks a high-performing Pinterest Pin or LinkedIn Carousel visual + hook
 * combination into the user's persistent Winner Formula Memory (`localStorage`).
 */
export function lockPinAsWinnerFormula(
  state: AutonomousStudioStoreState,
  pin: PinterestPinCandidate,
  hookArchetype: ArcadsHookArchetype = "numbered-playbook",
): AutonomousStudioStoreState {
  const nowIso = new Date().toISOString();
  const record: WinnerFormulaRecord = {
    id: `winner-${pin.id}-${Date.now()}`,
    label: `Pinterest 2:3 ${pin.angleLabel} · ${pin.paletteId} + ${pin.cardStyle}`,
    sourceChannel: "pinterest",
    winningHookArchetype: hookArchetype,
    winningPrismLayout: pin.prismLayout,
    winningPaletteId: pin.paletteId,
    winningCardStyle: pin.cardStyle,
    WinningBackgroundPattern: pin.backgroundPattern,
    observedSaveRatePercent: pin.simulatedMetrics?.saveRatePercent || 7.5,
    observedCtrPercent: 4.1,
    lockedAtIso: nowIso,
  };

  return {
    ...state,
    winnerFormulas: [
      record,
      ...state.winnerFormulas.filter((w) => w.id !== record.id),
    ].slice(0, 8),
    lastSavedAtIso: nowIso,
  };
}
