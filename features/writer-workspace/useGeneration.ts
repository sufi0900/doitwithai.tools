"use client";
import { useEffect, useRef, useState } from "react";
import type {
  PipelineStageId,
  PipelineStageRecord,
  Plan,
  Project,
  ResearchPacket,
} from "./types";
import {
  applyPlan,
  articleMarkdown,
  articleRevision,
  defaultFeaturedBanner,
  evaluateAltText,
  id,
  inputRevision,
  parseBrief,
  parseBriefDirectives,
  patchWorkspace,
  safeUrl,
  workspace,
} from "./model";
import type { useWorkspace } from "./useWorkspace";
import { canApplyResponse, draftPendingSections } from "./jobs";
import {
  allocateRoleWeightedSectionBudgets,
  auditAndRepairArticleFactualIntegrity,
  matchSectionLinksByCapability,
} from "./niche-policies";
export { canApplyResponse } from "./jobs";

export const INITIAL_PIPELINE_STAGES: PipelineStageRecord[] = [
  { id: "analyze", label: "Deep Brief & Prompt Analyzer", status: "pending" },
  { id: "keywords", label: "Keyword, Intent & Entity Strategist", status: "pending" },
  { id: "web_research", label: "Live Web & Authority Source Research", status: "pending" },
  { id: "internal_links", label: "Website Internal Link Discovery", status: "pending" },
  { id: "serp_meta", label: "SERP Meta Titles, Descriptions & Slug", status: "pending" },
  { id: "featured_image", label: "16:9 Featured Banner + Alt Text Agent", status: "pending" },
  { id: "outline", label: "Semantic Outline & 50-Word AEO Box", status: "pending" },
  { id: "sections", label: "Section-by-Section Content Writer", status: "pending" },
  { id: "infographics", label: "Visual Infographics + WCAG Alt Text", status: "pending" },
  { id: "readability_eeat", label: "Readability, FAQ & E-E-A-T Reviewer", status: "pending" },
  { id: "social_video", label: "Omnichannel Social & Video Scripts", status: "pending" },
];

function buildStageList(
  current: PipelineStageRecord[] | undefined,
  updates: Partial<Record<PipelineStageId, { status: PipelineStageRecord["status"]; detail?: string }>>,
): PipelineStageRecord[] {
  const base = current?.length ? current : INITIAL_PIPELINE_STAGES;
  return base.map((s) => (updates[s.id] ? { ...s, ...updates[s.id] } : s));
}

export function generationContext(p: Project) {
  const w = workspace(p);
  const research = w.research;
  const linkMetaByUrl = new Map<string, string>();
  for (const rl of research?.internalLinks || []) {
    if (rl.snippet) linkMetaByUrl.set(rl.url, rl.snippet);
  }
  const internalFromProject = (p.internalLinks || []).slice(0, 6).map((l) => ({
    url: l.targetUrl,
    title: l.targetTitle || l.anchorText,
    kind: "internal" as const,
    ...(linkMetaByUrl.get(l.targetUrl)
      ? { snippet: linkMetaByUrl.get(l.targetUrl)!.slice(0, 220) }
      : {}),
  }));
  const internalFromResearch = (research?.internalLinks || []).slice(0, 6).map((l) => ({
    url: l.url,
    title: l.title,
    kind: "internal" as const,
    ...(l.snippet ? { snippet: l.snippet.slice(0, 220) } : {}),
  }));
  const verifiedLinks = [
    ...(internalFromProject.length ? internalFromProject : internalFromResearch),
    ...(research?.externalLinks || []).slice(0, 4).map((l) => ({
      url: l.url,
      title: l.title,
      kind: "external" as const,
      ...(l.snippet ? { snippet: l.snippet.slice(0, 220) } : {}),
    })),
  ].filter((l) => Boolean(safeUrl(l.url)));

  const brandVoice = p.brandSiteUrl.trim()
    ? w.brandVoiceOverride?.voiceSummary ||
      research?.brandVoice?.voiceSummary
      ? [
          w.brandVoiceOverride?.voiceSummary ||
            research?.brandVoice?.voiceSummary ||
            "",
          w.brandVoiceOverride?.pointOfView ||
            research?.brandVoice?.pointOfView ||
            "",
          w.brandVoiceOverride?.sentenceRhythm ||
            research?.brandVoice?.sentenceRhythm ||
            "",
        ]
          .filter(Boolean)
          .join(" · ")
          .slice(0, 800)
      : ""
    : "";

  const contract = research?.briefContract;
  const resolvedTargetWords =
    w.lengthMode !== "custom" && contract
      ? contract.recommendedTargetWords
      : w.targetWords;
  const resolvedTone =
    w.toneMode !== "custom" && contract
      ? contract.resolvedTone
      : p.keywordCluster.toneOfVoice;

  const briefContractSummary = contract
    ? `Format: ${contract.archetypeLabel} | Niche: ${contract.nicheLabel} (${contract.editorialStrictness} accuracy) | Auto Length: ${contract.targetWordsMin}-${contract.targetWordsMax}w | Tone: ${resolvedTone} | Qualifiers: ${contract.requiredQualifiers.join("; ")} | Avoid: ${contract.prohibitedClaims.join("; ")}`
    : "";

  const evidenceLines = (research?.evidencePassages || [])
    .slice(0, 8)
    .map((ev) => `- ${ev.claimOrFact} (${ev.sourceTitle})`)
    .join("\n");

  const researchSummary = [
    research?.analyzedIntent || "",
    research?.groundedSummary
      ? `Live Web Findings:\n${research.groundedSummary.slice(0, 2800)}`
      : "",
    evidenceLines ? `Extracted Source Passages:\n${evidenceLines}` : "",
    research?.competitorAngles?.length
      ? `Information Gain Angles: ${research.competitorAngles.slice(0, 5).join(" | ")}`
      : "",
  ]
    .filter(Boolean)
    .join("\n\n")
    .slice(0, 6000);

  // Prioritize external/primary evidence first so internal site links never crowd out research
  const prioritizedSources = [
    ...w.references.filter(
      (r) =>
        !p.brandSiteUrl ||
        !r.url.startsWith(p.brandSiteUrl.replace(/\/+$/, "")),
    ),
    ...w.references.filter(
      (r) =>
        Boolean(p.brandSiteUrl) &&
        r.url.startsWith(p.brandSiteUrl.replace(/\/+$/, "")),
    ),
  ].slice(0, 8);

  return {
    brief:
      p.rawUserBriefOrSourceText ||
      `Write an article titled ${p.metaPack.h1Title || p.projectTitle}.`,
    keyword: p.keywordCluster.primaryKeyword,
    audience: p.keywordCluster.targetAudience,
    tone: resolvedTone,
    language: w.language,
    targetWords: resolvedTargetWords,
    outline: p.sections.slice(0, 10).map((s) => ({
      id: s.id,
      heading: s.h2Text,
      subheadings: s.subHeadings
        .map((h) => h.h3Text.trim())
        .filter(Boolean)
        .slice(0, 8),
      words: Math.max(100, Math.min(800, s.targetWordCount || 300)),
    })),
    sources: prioritizedSources.map((r) => ({
      url: r.url,
      title: r.title,
      text: r.text.slice(0, 8000),
    })),
    verifiedLinks,
    researchSummary,
    briefContractSummary,
    archetype: contract?.archetype || "",
    semanticTerms: (research?.semanticTerms || []).map((t) => t.term).slice(0, 20),
    brandVoiceSummary: brandVoice,
    instruction: p.customUserInstructions.slice(0, 2000),
  };
}

async function request(
  p: Project,
  operation: "plan" | "section" | "rewrite" | "enrichment",
  signal: AbortSignal,
  extra: Record<string, unknown> = {},
) {
  const requestId = id();
  const res = await fetch("/api/writer-workspace/generate", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    signal: AbortSignal.any([signal, AbortSignal.timeout(55000)]),
    body: JSON.stringify({
      ...generationContext(p),
      operation,
      requestId,
      ...extra,
    }),
  });
  const data = await res.json().catch(() => null);
  if (!res.ok || !data?.ok || data.requestId !== requestId)
    throw new Error(
      data?.error ||
        "The writing service did not return a valid response. Retry this step.",
    );
  return data;
}

async function requestWithAutoRetry(
  p: Project,
  operation: "plan" | "section" | "rewrite" | "enrichment",
  signal: AbortSignal,
  extra: Record<string, unknown> = {},
) {
  try {
    return await request(p, operation, signal, extra);
  } catch (err) {
    if (signal.aborted) throw err;
    const msg = err instanceof Error ? err.message : "";
    if (/not configured|usage limit/i.test(msg)) throw err;
    await new Promise((r) => setTimeout(r, 900));
    if (signal.aborted) throw err;
    return await request(p, operation, signal, extra);
  }
}

export function useGeneration(store: ReturnType<typeof useWorkspace>) {
  const [busy, setBusy] = useState(false);
  const controller = useRef<AbortController | null>(null),
    epoch = useRef(0),
    active = useRef(""),
    locked = useRef(false);
  const { current, update, save } = store;

  const status = (patch: Partial<ReturnType<typeof workspace>["run"]>) =>
    update((p) =>
      patchWorkspace(p, { run: { ...workspace(p).run, ...patch } }),
    );

  const stop = () => {
    locked.current = false;
    controller.current?.abort();
    epoch.current++;
    setBusy(false);
    if (
      workspace(current.current).run.status === "planning" ||
      workspace(current.current).run.status === "drafting"
    ) {
      const p = status({
        status: "paused",
        current: undefined,
        error: undefined,
      });
      void save(p);
    }
  };

  useEffect(
    () => () => {
      controller.current?.abort();
      epoch.current++;
    },
    [],
  );

  useEffect(() => {
    if (active.current && active.current !== store.project.projectId) {
      controller.current?.abort();
      epoch.current++;
      locked.current = false;
      setBusy(false);
    }
  }, [store.project.projectId]);

  const start = () => {
    locked.current = true;
    const abort = new AbortController();
    controller.current = abort;
    const ticket = ++epoch.current;
    active.current = current.current.projectId;
    setBusy(true);
    return { abort, ticket, pid: active.current };
  };

  const fail = (error: unknown, ticket: number) => {
    if (ticket !== epoch.current) return;
    const message =
      error instanceof Error ? error.message : "Could not complete this step.";
    const p = status({ status: "failed", error: message, current: undefined });
    void save(p);
  };

  const runResearchStep = async (
    abort: AbortController,
    ticket: number,
  ) => {
    const p = current.current;
    const directives = parseBriefDirectives(p.rawUserBriefOrSourceText);
    const wCurrent = workspace(p);
    const targetSite = (
      directives.websiteUrl ||
      p.brandSiteUrl ||
      ""
    ).trim();
    status({
      status: "planning",
      stage: "analyze",
      stageLabel: "Classifying intent, checking primary sources & matching internal tool capabilities...",
      stages: buildStageList(INITIAL_PIPELINE_STAGES, {
        analyze: { status: "active", detail: "Classifying format & niche policy" },
        keywords: { status: "active", detail: "Mapping primary & LSI entities" },
        web_research: { status: "active", detail: "Gathering live grounded web sources" },
        internal_links: {
          status: "active",
          detail: targetSite ? `Scanning ${targetSite}` : "No website supplied",
        },
      }),
    });

    try {
      const requestId = id();
      const res = await fetch("/api/writer-workspace/research", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        signal: AbortSignal.any([abort.signal, AbortSignal.timeout(42000)]),
        body: JSON.stringify({
          requestId,
          brief:
            p.rawUserBriefOrSourceText ||
            `Write an article titled ${p.metaPack.h1Title || p.projectTitle}.`,
          keyword: p.keywordCluster.primaryKeyword,
          websiteUrl: targetSite,
          audience: p.keywordCluster.targetAudience,
          tone:
            wCurrent.toneMode === "custom"
              ? p.keywordCluster.toneOfVoice
              : "auto",
          language: wCurrent.language,
          targetWords: wCurrent.targetWords,
          lengthMode: wCurrent.lengthMode || "auto",
          toneMode: wCurrent.toneMode || "auto",
          includeWebResearch: true,
        }),
      });
      const json = await res.json().catch(() => null);
      if (ticket !== epoch.current) return false;
      if (!res.ok || !json?.ok || !json.packet) {
        throw new Error("Research unavailable");
      }
      if (json.packet) {
        const packet = json.packet as ResearchPacket;
        update((now) => {
          const w = workspace(now);
          const mergedRefs = [...w.references];
          for (const ext of packet.externalLinks || []) {
            const validUrl = safeUrl(ext.url);
            if (validUrl && !mergedRefs.some((r) => r.url === validUrl)) {
              const richText = ext.snippet || "";
              mergedRefs.push({
                id: id(),
                url: validUrl,
                title: ext.title || validUrl,
                text: richText,
              });
            }
          }
          const isLive =
            packet.researchMode === "live-google-grounding" ||
            packet.researchMode === "live-serp-api";
          const nextTargetWords =
            w.lengthMode !== "custom" && packet.briefContract
              ? packet.briefContract.recommendedTargetWords
              : w.targetWords;
          return {
            ...now,
            brandSiteUrl: targetSite || now.brandSiteUrl || packet.siteScanned || "",
            keywordCluster: {
              ...now.keywordCluster,
              primaryKeyword:
                now.keywordCluster.primaryKeyword || packet.primaryKeyword || "",
              secondaryKeywords: now.keywordCluster.secondaryKeywords.length
                ? now.keywordCluster.secondaryKeywords
                : packet.secondaryKeywords || [],
              lsiEntities: now.keywordCluster.lsiEntities.length
                ? now.keywordCluster.lsiEntities
                : packet.lsiEntities || [],
            },
            internalLinks: (packet.internalLinks || []).map((l) => ({
              id: id(),
              anchorText: l.anchorText || l.title,
              targetTitle: l.title,
              targetUrl: l.url,
              category: "pillar-guide" as const,
            })),
            writerWorkspace: {
              ...w,
              targetWords: nextTargetWords,
              research: packet,
              references: mergedRefs.slice(0, 10),
              run: {
                ...w.run,
                stages: buildStageList(w.run.stages, {
                  analyze: {
                    status: "done",
                    detail: packet.briefContract
                      ? `${packet.briefContract.archetypeLabel} · ${packet.briefContract.nicheLabel}`
                      : packet.searchIntent,
                  },
                  keywords: {
                    status: "done",
                    detail: `${packet.secondaryKeywords.length} related keywords`,
                  },
                  web_research: {
                    status: isLive ? "done" : packet.externalLinks.length ? "done" : "skipped",
                    detail: isLive
                      ? `${packet.externalLinks.length} live web sources · ${(packet.evidencePassages || []).length} passages`
                      : packet.externalLinks.length
                        ? `${packet.externalLinks.length} public fallback refs (verify facts)`
                        : "Brief-only mode (no live web search)",
                  },
                  internal_links: {
                    status: targetSite ? "done" : "skipped",
                    detail: targetSite ? `${packet.internalLinks.length} site links indexed` : "No website supplied",
                  },
                }),
              },
            },
          };
        });
        await save(current.current);
      }
    } catch {
      if (ticket !== epoch.current) return false;
      status({
        stages: buildStageList(workspace(current.current).run.stages, {
          analyze: { status: "done", detail: "Brief parsed" },
          keywords: { status: "done", detail: "Focus keyword active" },
          web_research: { status: "skipped", detail: "Offline fallback" },
          internal_links: { status: "skipped", detail: "Offline fallback" },
        }),
      });
    }
    return true;
  };

  const runPlanStep = async (
    abort: AbortController,
    ticket: number,
    pid: string,
  ) => {
    const p = current.current,
      fingerprint = inputRevision(p),
      revision = articleRevision(p);
    status({
      status: "planning",
      inputHash: fingerprint,
      error: undefined,
      completed: [],
      stage: "serp_meta",
      stageLabel: "Designing SERP titles, featured banner & semantic outline...",
      stages: buildStageList(workspace(p).run.stages, {
        analyze: { status: "done" },
        keywords: { status: "done" },
        serp_meta: { status: "active", detail: "Generating 4 title & 3 description options" },
        featured_image: { status: "active", detail: "Preparing 16:9 horizontal hero" },
        outline: { status: "active", detail: "Structuring H2/H3 flow & AEO box" },
      }),
    });
    const supplied = p.sections.length
      ? generationContext(p).outline
      : parseBrief(p.rawUserBriefOrSourceText).outline;
    const res = await requestWithAutoRetry(p, "plan", abort.signal, {
      outline: supplied,
    });
    if (ticket !== epoch.current) return false;
    if (!canApplyResponse(current.current, pid, fingerprint, revision))
      throw new Error(
        "Your brief or article changed while planning. The response was left unapplied; review your changes and retry.",
      );
    const planPayload = res.data as Plan;
    const next = applyPlan(current.current, planPayload, supplied);
    const wApplied = workspace(next);
    const planWordTarget =
      wApplied.lengthMode !== "custom" && wApplied.research?.briefContract
        ? wApplied.research.briefContract.recommendedTargetWords
        : wApplied.targetWords;
    next.sections = allocateRoleWeightedSectionBudgets(
      next.sections,
      planWordTarget,
    );
    const wNext = workspace(next);
    const banner = defaultFeaturedBanner(next);
    const bannerAltCheck = evaluateAltText(banner.altText, banner.headline);
    const withMeta = patchWorkspace(next, {
      serpTitles: planPayload.titles,
      quickAnswerBox: planPayload.introduction || next.metaPack.aeoDirectAnswer50Words,
      featuredBanner: {
        ...banner,
        altScore: bannerAltCheck.score,
        altVerdict: bannerAltCheck.verdict,
      },
      run: {
        ...wNext.run,
        stage: "sections",
        stageLabel: `Outlined ${next.sections.length} sections — starting section writer...`,
        stages: buildStageList(wNext.run.stages, {
          serp_meta: { status: "done", detail: `${planPayload.titles.length} title variations` },
          featured_image: { status: "done", detail: "1200×630 banner drafted" },
          outline: { status: "done", detail: `${next.sections.length} sections` },
        }),
      },
    });
    update(withMeta);
    await save(current.current);
    return true;
  };

  const runDraftStep = async (abort: AbortController, ticket: number) => {
    update((now) => ({
      ...now,
      sections: now.sections.map((s) => ({
        ...s,
        h2Text: s.h2Text.trim(),
        subHeadings: s.subHeadings
          .map((h) => ({ ...h, h3Text: h.h3Text.trim() }))
          .filter((h) => h.h3Text),
      })),
    }));
    const fingerprint = inputRevision(current.current);
    status({
      status: "drafting",
      inputHash: fingerprint,
      error: undefined,
      stage: "sections",
      stageLabel: "Writing sections & designing inline infographics...",
      stages: buildStageList(workspace(current.current).run.stages, {
        sections: { status: "active", detail: `0 / ${current.current.sections.length} sections` },
      }),
      completed: current.current.sections
        .filter(
          (s) =>
            s.bodyMarkdown.trim() ||
            s.subHeadings.some((h) => h.bodyMarkdown.trim()),
        )
        .map((s) => s.id),
    });
    const usedInternalUrls = new Set<string>();
    const usedExternalUrls = new Set<string>();

    await draftPendingSections({
      get: () => current.current,
      commit: update,
      save,
      signal: abort.signal,
      active: () => ticket === epoch.current,
      request: (p, section, previousEnding) => {
        const ctx = generationContext(p);
        const wNow = workspace(p);
        const secIdx = Math.max(0, p.sections.findIndex((x) => x.id === section.id));
        const researchInternal = wNow.research?.internalLinks?.length
          ? wNow.research.internalLinks
          : (p.internalLinks || []).map((l) => ({
              url: l.targetUrl,
              title: l.targetTitle || l.anchorText,
              anchorText: l.anchorText,
              sourceKind: "internal" as const,
            }));
        const researchExternal = wNow.research?.externalLinks || [];

        const sectionLinks = matchSectionLinksByCapability({
          sectionHeading: section.h2Text,
          subheadings: section.subHeadings.map((h) => h.h3Text),
          topicText: `${p.keywordCluster.primaryKeyword} ${p.rawUserBriefOrSourceText.slice(0, 400)}`,
          internalPool: researchInternal,
          externalPool: researchExternal,
          usedInternalUrls,
          usedExternalUrls,
        });
        for (const matched of sectionLinks) {
          if (matched.kind === "internal") usedInternalUrls.add(matched.url);
          else usedExternalUrls.add(matched.url);
        }

        const openingStyles = [
          "Open with a direct, plain-language explanation of the core mechanism or decision.",
          "Open with a concrete real-world scenario or operational trade-off readers actually face.",
          "Open by clarifying an important distinction or common mistake before explaining what works.",
          "Open directly with the first actionable premise and why sequence matters.",
          "Open with a verified technical or practical cause-and-effect observation.",
        ];
        const priorSecs = p.sections
          .slice(0, secIdx)
          .filter((ps) => ps.bodyMarkdown.trim() || ps.subHeadings.some((h) => h.bodyMarkdown.trim()))
          .map((ps) => {
            const fullSecText = [
              ps.bodyMarkdown,
              ...ps.subHeadings.map((h) => `${h.h3Text}\n${h.bodyMarkdown}`),
            ]
              .filter(Boolean)
              .join("\n");
            const linksInserted = Array.from(
              fullSecText.matchAll(/\[[^\]]+\]\((https?:\/\/[^)]+)\)/g),
            )
              .map((m) => m[1])
              .slice(0, 4);
            const rawBody = fullSecText
              .replace(/[#*_`>]/g, "")
              .replace(/\s+/g, " ")
              .trim();
            const firstSent = rawBody.match(/^[^.!?]{12,240}[.!?]/)?.[0] || rawBody.slice(0, 180);
            return {
              heading: ps.h2Text,
              openingSentence: firstSent.slice(0, 280),
              summary: rawBody.slice(0, 360),
              coveredConcepts: ps.subHeadings.map((h) => h.h3Text).slice(0, 5),
              linksInserted,
            };
          });

        const contract = wNow.research?.briefContract;
        const secLower = `${section.h2Text} ${section.subHeadings.map((h) => h.h3Text).join(" ")}`.toLowerCase();
        const sectionAssetDirective = contract
          ? /\b(workflow|step|prompt|export|diagnos|setup|audit|how to)\b/i.test(secLower)
            ? `Include concrete exact input schemas/column requirements or copyable templates/prompts where genuinely useful (${contract.requiredAssets[0] || ""}).`
            : /\b(matrix|compare|decision|merge|vs\.|trade|keep)\b/i.test(secLower)
              ? `Include explicit decision criteria and a worked counterexample showing when NOT to merge or act.`
              : /\b(checklist|verify|monitor|measure)\b/i.test(secLower)
                ? `Provide a verifiable pre/post check so readers measure the real impact rather than vanity fluctuations.`
                : contract.requiredAssets[secIdx % contract.requiredAssets.length] || ""
          : "";

        const primaryKwLower = p.keywordCluster.primaryKeyword.trim().toLowerCase();
        const writtenBefore = [
          p.metaPack.aeoDirectAnswer50Words,
          ...p.sections.slice(0, secIdx).map((s) => `${s.h2Text}\n${s.bodyMarkdown}\n${s.subHeadings.map((h) => `${h.h3Text}\n${h.bodyMarkdown}`).join("\n")}`),
        ]
          .join("\n")
          .toLowerCase();
        let primaryKeywordUsesSoFar = 0;
        if (primaryKwLower.length >= 3) {
          let idx = 0;
          while ((idx = writtenBefore.indexOf(primaryKwLower, idx)) !== -1) {
            primaryKeywordUsesSoFar++;
            idx += primaryKwLower.length;
          }
        }

        return requestWithAutoRetry(p, "section", abort.signal, {
          section: {
            id: section.id,
            heading: section.h2Text,
            subheadings: section.subHeadings.map((h) => h.h3Text),
            words: Math.max(120, Math.min(800, section.targetWordCount)),
          },
          previousEnding,
          verifiedLinks: sectionLinks,
          priorSections: priorSecs,
          openingStyle: openingStyles[secIdx % openingStyles.length]!,
          primaryKeywordUsesSoFar,
          sectionAssetDirective,
        });
      },
    });
    if (ticket === epoch.current) {
      status({
        stage: "infographics",
        stageLabel: "Scoring readability, alt texts & social distribution kit...",
        stages: buildStageList(workspace(current.current).run.stages, {
          sections: {
            status: "done",
            detail: `${current.current.sections.length} sections written`,
          },
          infographics: { status: "done", detail: "Section visuals synchronized" },
          readability_eeat: { status: "active", detail: "Generating FAQs & alt texts" },
          social_video: { status: "active", detail: "Adapting 9 social & video angles" },
        }),
      });
    }
  };

  const runEnrichmentStep = async (abort: AbortController, ticket: number) => {
    const initialP = current.current;
    const mode = workspace(initialP).research?.researchMode || "brief-only";
    const researchStatus =
      mode === "live-google-grounding" || mode === "live-serp-api"
        ? ("live-verified" as const)
        : mode === "public-reference"
          ? ("partial-web" as const)
          : ("brief-only" as const);
    const hasPending = initialP.sections.some(
      (s) =>
        !s.bodyMarkdown.trim() &&
        !s.subHeadings.some((h) => h.bodyMarkdown.trim()),
    );
    const draftStatus = hasPending ? ("partial" as const) : ("complete" as const);

    // Whole-article factual verification & surgical auto-repair across 100% of sections (no 14k slicing!)
    const auditResult = auditAndRepairArticleFactualIntegrity({
      project: initialP,
      researchStatus,
      draftStatus,
      enrichmentStatus: "complete",
    });

    if (auditResult.repairedCount > 0) {
      update((now) => ({
        ...now,
        sections: auditResult.updatedSections,
        writerWorkspace: {
          ...workspace(now),
          verificationLog: auditResult.report,
        },
      }));
    } else {
      update((now) => ({
        ...now,
        writerWorkspace: {
          ...workspace(now),
          verificationLog: auditResult.report,
        },
      }));
    }

    const p = current.current;
    try {
      const fullMd = articleMarkdown(p);
      const res = await request(p, "enrichment", abort.signal, {
        selection: fullMd.slice(0, 28000),
      });
      if (ticket !== epoch.current) return;
      const data = res.data as {
        quickAnswer50Words?: string;
        featuredBanner?: {
          headline: string;
          subheadline: string;
          badge: string;
          altText: string;
        };
        faqs?: Array<{ question: string; answer: string }>;
        sectionAltTexts?: Array<{ heading: string; altText: string }>;
        socialPack?: {
          hook: string;
          keyTakeaway: string;
          discussionPrompt: string;
          thumbnailHeadline: string;
          shortVideoScript: string;
          youtubeLongOutline: string;
        };
      };
      update((now) => {
        const w = workspace(now);
        const rev = articleRevision(now);
        const bannerAlt =
          data.featuredBanner?.altText || defaultFeaturedBanner(now).altText;
        const altEval = evaluateAltText(
          bannerAlt,
          data.featuredBanner?.headline || now.metaPack.h1Title,
        );
        const sectionAltTexts = { ...(w.sectionAltTexts || {}) };
        const updatedSections = now.sections.map((sec) => {
          const match = data.sectionAltTexts?.find(
            (x) => x.heading.toLowerCase() === sec.h2Text.toLowerCase(),
          );
          const candidateAlt =
            match?.altText ||
            sec.infographicConfig.altText ||
            `Visual diagram illustrating ${sec.h2Text}`;
          const secEval = evaluateAltText(candidateAlt, sec.h2Text);
          sectionAltTexts[sec.id] = {
            altText: candidateAlt,
            score: secEval.score,
            verdict: secEval.verdict,
          };
          return {
            ...sec,
            infographicConfig: {
              ...sec.infographicConfig,
              altText: candidateAlt,
            },
          };
        });

        const nextSocial = { ...w.social };
        if (data.socialPack?.hook && !nextSocial.X?.caption) {
          nextSocial.X = {
            ...(nextSocial.X || {}),
            headline: now.metaPack.h1Title || now.projectTitle,
            caption: `${data.socialPack.hook}\n\n${data.socialPack.keyTakeaway}`,
            sourceRevision: rev,
          };
        }
        if (data.socialPack?.discussionPrompt && !nextSocial.LinkedIn?.caption) {
          nextSocial.LinkedIn = {
            ...(nextSocial.LinkedIn || {}),
            headline: now.metaPack.h1Title || now.projectTitle,
            caption: `${data.socialPack.keyTakeaway}\n\n${data.socialPack.discussionPrompt}`,
            sourceRevision: rev,
          };
        }

        return {
          ...now,
          sections: updatedSections,
          metaPack: {
            ...now.metaPack,
            aeoDirectAnswer50Words:
              data.quickAnswer50Words || now.metaPack.aeoDirectAnswer50Words,
          },
          faqs: data.faqs?.length
            ? data.faqs.map((f) => ({
                id: id(),
                question: f.question,
                answer: f.answer,
              }))
            : now.faqs,
          writerWorkspace: {
            ...w,
            studioUnlocked: true,
            quickAnswerBox: data.quickAnswer50Words || w.quickAnswerBox,
            featuredBanner: {
              ...defaultFeaturedBanner(now),
              headline:
                data.featuredBanner?.headline ||
                defaultFeaturedBanner(now).headline,
              subheadline:
                data.featuredBanner?.subheadline ||
                defaultFeaturedBanner(now).subheadline,
              badge:
                data.featuredBanner?.badge || defaultFeaturedBanner(now).badge,
              altText: bannerAlt,
              altScore: altEval.score,
              altVerdict: altEval.verdict,
              sourceRevision: rev,
            },
            sectionAltTexts,
            social: nextSocial,
            videoScripts: data.socialPack
              ? {
                  thumbnailHeadline: data.socialPack.thumbnailHeadline,
                  shortForm: data.socialPack.shortVideoScript,
                  youtubeLong: data.socialPack.youtubeLongOutline,
                }
              : w.videoScripts,
            run: {
              ...w.run,
              status: "done",
              current: undefined,
              error: undefined,
              stage: "social_video",
              stageLabel:
                auditResult.repairedCount > 0
                  ? `Reviewed & repaired ${auditResult.repairedCount} factual check(s) — article ready for final human review.`
                  : auditResult.report.status === "needs-review"
                    ? "Draft ready — inspect flagged verification items in Brief & Log."
                    : "Reviewed draft complete — inspect Research Brief & Log before publishing.",
              stages: buildStageList(w.run.stages, {
                infographics: { status: "done", detail: "All visuals + WCAG alt text scored" },
                readability_eeat: {
                  status: "done",
                  detail: `${(auditResult.report.fullTextCharsAudited).toLocaleString()} chars audited · ${auditResult.repairedCount} auto-repairs · ${data.faqs?.length || 0} FAQs`,
                },
                social_video: { status: "done", detail: "All 9 channels + video ready" },
              }),
            },
          },
        };
      });
      await save(current.current);
    } catch {
      if (ticket !== epoch.current) return;
      const failedAudit = auditAndRepairArticleFactualIntegrity({
        project: current.current,
        researchStatus,
        draftStatus,
        enrichmentStatus: "failed",
      });
      const doneProject = status({
        status: "done",
        current: undefined,
        error: "Social/FAQ enrichment could not complete; your drafted article was verified locally and saved.",
        stage: "readability_eeat",
        stageLabel: "Draft saved & locally verified — optional enrichment step failed.",
        stages: buildStageList(workspace(current.current).run.stages, {
          infographics: { status: "done", detail: "Section diagrams ready" },
          readability_eeat: {
            status: "done",
            detail: `${failedAudit.report.fullTextCharsAudited.toLocaleString()} chars audited · ${failedAudit.repairedCount} auto-repairs`,
          },
          social_video: { status: "skipped", detail: "Enrichment failed — using offline channel templates" },
        }),
      });
      const unlocked = patchWorkspace(
        {
          ...doneProject,
          sections:
            failedAudit.repairedCount > 0
              ? failedAudit.updatedSections
              : doneProject.sections,
        },
        {
          studioUnlocked: true,
          verificationLog: failedAudit.report,
        },
      );
      update(unlocked);
      await save(unlocked);
    }
  };

  const plan = async () => {
    if (locked.current) return;
    const { abort, ticket, pid } = start();
    try {
      await runResearchStep(abort, ticket);
      if (ticket !== epoch.current) return;
      await runPlanStep(abort, ticket, pid);
      if (ticket === epoch.current) {
        const done = status({
          status: "idle",
          stage: "outline",
          stageLabel: "Outline ready — click Draft Article or Edit Structure.",
        });
        update(patchWorkspace(done, { studioUnlocked: true }));
        await save(current.current);
      }
    } catch (e) {
      fail(e, ticket);
    } finally {
      if (ticket === epoch.current) {
        locked.current = false;
        setBusy(false);
      }
    }
  };

  const draft = async () => {
    if (locked.current || !current.current.sections.length) return;
    const { abort, ticket } = start();
    try {
      await runDraftStep(abort, ticket);
      if (ticket === epoch.current) {
        await runEnrichmentStep(abort, ticket);
      }
    } catch (e) {
      fail(e, ticket);
    } finally {
      if (ticket === epoch.current) {
        locked.current = false;
        setBusy(false);
      }
    }
  };

  const generateAll = async () => {
    if (locked.current) return;
    const { abort, ticket, pid } = start();
    try {
      if (!workspace(current.current).research) {
        await runResearchStep(abort, ticket);
        if (ticket !== epoch.current) return;
      }
      if (!current.current.sections.length) {
        const planned = await runPlanStep(abort, ticket, pid);
        if (!planned || ticket !== epoch.current) return;
      }
      if (current.current.sections.length) {
        await runDraftStep(abort, ticket);
      }
      if (ticket === epoch.current) {
        await runEnrichmentStep(abort, ticket);
      }
    } catch (e) {
      fail(e, ticket);
    } finally {
      if (ticket === epoch.current) {
        locked.current = false;
        setBusy(false);
      }
    }
  };

  const rewrite = async (
    text: string,
    instruction: string,
    signal: AbortSignal,
    context: { before?: string; after?: string } = {},
  ) => {
    // Lean payload: an inline edit only needs the selection, the instruction and
    // a little neighbouring text — not the whole brief, 8 source pages and outline
    // (which previously made every Ask AI call slow and expensive).
    const p = current.current;
    const w = workspace(p);
    const requestId = id();
    const res = await fetch("/api/writer-workspace/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      signal: AbortSignal.any([signal, AbortSignal.timeout(40000)]),
      body: JSON.stringify({
        operation: "rewrite",
        requestId,
        brief: (p.metaPack.h1Title || p.projectTitle || "Article").slice(0, 300),
        keyword: (p.keywordCluster.primaryKeyword || "").slice(0, 160),
        tone: (p.keywordCluster.toneOfVoice || "Clear and helpful").slice(0, 100),
        language: w.language || "English",
        brandVoiceSummary: (
          w.brandVoiceOverride?.voiceSummary || ""
        ).slice(0, 800),
        selection: text,
        instruction,
        contextBefore: (context.before || "").slice(-1400),
        contextAfter: (context.after || "").slice(0, 1400),
      }),
    });
    const data = await res.json().catch(() => null);
    if (!res.ok || !data?.ok || data.requestId !== requestId)
      throw new Error(
        data?.error ||
          "The writing service did not return a valid response. Retry this step.",
      );
    return data;
  };

  return { busy, plan, draft, generateAll, stop, rewrite };
}
