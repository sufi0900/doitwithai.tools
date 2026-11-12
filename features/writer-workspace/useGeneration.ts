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
  const verifiedLinks = [
    ...(research?.internalLinks || []).slice(0, 6).map((l) => ({
      url: l.url,
      title: l.title,
      kind: "internal" as const,
    })),
    ...(research?.externalLinks || []).slice(0, 4).map((l) => ({
      url: l.url,
      title: l.title,
      kind: "external" as const,
    })),
  ];
  return {
    brief:
      p.rawUserBriefOrSourceText ||
      `Write an article titled ${p.metaPack.h1Title || p.projectTitle}.`,
    keyword: p.keywordCluster.primaryKeyword,
    audience: p.keywordCluster.targetAudience,
    tone: p.keywordCluster.toneOfVoice,
    language: w.language,
    targetWords: w.targetWords,
    outline: p.sections.map((s) => ({
      id: s.id,
      heading: s.h2Text,
      subheadings: s.subHeadings.map((h) => h.h3Text.trim()).filter(Boolean),
      words: Math.max(100, Math.min(800, s.targetWordCount)),
    })),
    sources: w.references.map((r) => ({
      url: r.url,
      title: r.title,
      text: r.text.slice(0, 8000),
    })),
    verifiedLinks,
    researchSummary: research?.analyzedIntent || "",
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
  if (!res.ok || !data?.ok)
    throw new Error(
      data?.error ||
        "The writing service did not return a complete response. Retry this step.",
    );
  if (data.requestId !== requestId || data.operation !== operation)
    throw new Error(
      "The writing response did not match this request. Please retry.",
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
      active.current === current.current.projectId &&
      ["planning", "drafting"].includes(workspace(current.current).run.status)
    ) {
      const p = status({
        status: "paused",
        current: undefined,
        error:
          "Writing paused. Completed sections are saved; resume to fill the remaining sections.",
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
    active.current = current.current.projectId;
    const ticket = ++epoch.current;
    setBusy(true);
    return { abort, ticket, pid: active.current };
  };

  const fail = (error: unknown, ticket: number) => {
    if (ticket !== epoch.current) return;
    const message =
      error instanceof Error
        ? error.message
        : "This step could not be completed.";
    const p = status({ status: "failed", error: message, current: undefined });
    void save(p);
  };

  const runResearchStep = async (
    abort: AbortController,
    ticket: number,
  ) => {
    const p = current.current;
    const directives = parseBriefDirectives(p.rawUserBriefOrSourceText);
    const targetSite = (p.brandSiteUrl || directives.websiteUrl || "").trim();
    status({
      status: "planning",
      stage: "analyze",
      stageLabel: "Analyzing your prompt, search intent & instructions...",
      stages: buildStageList(INITIAL_PIPELINE_STAGES, {
        analyze: { status: "active", detail: "Reading structure & instructions" },
        keywords: { status: "active", detail: "Mapping primary & LSI entities" },
        web_research: { status: "active", detail: "Checking authority sources" },
        internal_links: {
          status: targetSite ? "active" : "skipped",
          detail: targetSite ? `Scanning ${targetSite}` : "No website URL supplied",
        },
      }),
    });

    try {
      const requestId = id();
      const res = await fetch("/api/writer-workspace/research", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        signal: AbortSignal.any([abort.signal, AbortSignal.timeout(35000)]),
        body: JSON.stringify({
          requestId,
          brief:
            p.rawUserBriefOrSourceText ||
            `Write an article titled ${p.metaPack.h1Title || p.projectTitle}.`,
          keyword: p.keywordCluster.primaryKeyword,
          websiteUrl: targetSite,
          audience: p.keywordCluster.targetAudience,
          tone: p.keywordCluster.toneOfVoice,
          language: workspace(p).language,
          includeWebResearch: true,
        }),
      });
      const json = await res.json().catch(() => null);
      if (ticket !== epoch.current) return false;
      if (res.ok && json?.ok && json.packet) {
        const packet = json.packet as ResearchPacket;
        update((now) => {
          const w = workspace(now);
          const mergedRefs = [...w.references];
          for (const ext of packet.externalLinks || []) {
            const validUrl = safeUrl(ext.url);
            if (validUrl && !mergedRefs.some((r) => r.url === validUrl)) {
              mergedRefs.push({
                id: id(),
                url: validUrl,
                title: ext.title || validUrl,
                text: ext.snippet || ext.title || validUrl,
              });
            }
          }
          return {
            ...now,
            brandSiteUrl: now.brandSiteUrl || packet.siteScanned || targetSite,
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
              research: packet,
              references: mergedRefs.slice(0, 8),
              run: {
                ...w.run,
                stages: buildStageList(w.run.stages, {
                  analyze: { status: "done", detail: packet.searchIntent },
                  keywords: {
                    status: "done",
                    detail: `${packet.secondaryKeywords.length} related keywords`,
                  },
                  web_research: {
                    status: "done",
                    detail: `${packet.externalLinks.length} authority references`,
                  },
                  internal_links: {
                    status: targetSite ? "done" : "skipped",
                    detail: targetSite
                      ? `${packet.internalLinks.length} site links found`
                      : "Optional",
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
        web_research: { status: "done" },
        internal_links: {
          status:
            p.brandSiteUrl || parseBriefDirectives(p.rawUserBriefOrSourceText).websiteUrl
              ? "done"
              : "skipped",
        },
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
    next.sections = next.sections.map((s) => ({
      ...s,
      targetWordCount: Math.max(
        100,
        Math.min(
          800,
          Math.round(workspace(next).targetWords / next.sections.length),
        ),
      ),
    }));
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
        subHeadings: s.subHeadings
          .filter((h) => h.h3Text.trim())
          .map((h) => ({ ...h, h3Text: h.h3Text.trim() })),
      })),
    }));
    const fingerprint = inputRevision(current.current);
    status({
      status: "drafting",
      inputHash: fingerprint,
      error: undefined,
      stage: "sections",
      stageLabel: "Writing sections & designing infographics...",
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
    await draftPendingSections({
      get: () => current.current,
      commit: update,
      save,
      signal: abort.signal,
      active: () => ticket === epoch.current,
      request: (p, section, previousEnding) =>
        requestWithAutoRetry(p, "section", abort.signal, {
          section: {
            id: section.id,
            heading: section.h2Text,
            subheadings: section.subHeadings.map((h) => h.h3Text),
            words: Math.max(100, Math.min(800, section.targetWordCount)),
          },
          previousEnding,
        }),
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
    const p = current.current;
    try {
      const res = await request(p, "enrichment", abort.signal, {
        selection: articleMarkdown(p).slice(0, 14000),
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
              stageLabel: "Studio complete — all 11 AI agents finished.",
              stages: buildStageList(w.run.stages, {
                infographics: { status: "done", detail: "All visuals + WCAG alt text scored" },
                readability_eeat: {
                  status: "done",
                  detail: `${data.faqs?.length || 0} FAQ pairs generated`,
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
      const doneProject = status({
        status: "done",
        current: undefined,
        error: undefined,
        stage: "social_video",
        stageLabel: "Article drafted — Studio ready.",
        stages: buildStageList(workspace(current.current).run.stages, {
          infographics: { status: "done" },
          readability_eeat: { status: "done", detail: "Deterministic audit ready" },
          social_video: { status: "done", detail: "Draft templates ready" },
        }),
      });
      const unlocked = patchWorkspace(doneProject, { studioUnlocked: true });
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

  /**
   * 1-Click Full 11-Agent Onboarding-to-Studio Pipeline:
   * Research & Link Discovery -> SERP + Featured Banner + Outline ->
   * Section Drafting -> Alt-Text + FAQ + Social & Video Enrichment -> Unlock Studio.
   */
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
  ) =>
    request(current.current, "rewrite", signal, {
      selection: text,
      instruction,
    });

  return { busy, plan, draft, generateAll, stop, rewrite };
}
