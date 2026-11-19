import { requireApprovedWebsite, agencyWorkspace, recordAgencyUsage } from '@/lib/ai-employee-agency/workspace.server';
import { NextRequest, NextResponse } from 'next/server';
import { executeAgencyLlmCall } from '@/lib/ai-employee-agency/llm-gateway';
import type { AgencyLlmModelId } from '@/lib/ai-employee-agency/token-telemetry-store';

/**
 * ============================================================================
 * DOITWITHAI.TOOLS — 24/7 AI EMPLOYEE AGENCY OS (V5 PHASE 18)
 * API Route: `app/api/ai-employee-agency/run-agent-step/route.ts`
 *
 * Live 5-Step Autonomous Agent Pipeline Execution:
 * Executes a single sequential specialist step (`stepIndex: 0..4`) for an
 * article job using `executeAgencyLlmCall` and returns generated artifacts +
 * exact token usage attributed to the executing `agent-registry.ts` row ID:
 *   0 -> agent-keyword-lead     (Keyword & Heading Architecture)
 *   1 -> sub-geo-section-writer (Long-Form GEO Article Draft)
 *   2 -> agent-design-director  (Hero & Infographic Visual Blueprints)
 *   3 -> agent-qa-publisher     (On-Page SEO, JSON-LD & 150-Pt QA Gate)
 *   4 -> agent-social-manager   (Omnichannel Distribution Package)
 * ============================================================================
 */

export type AgentPipelineStepIndex = 0 | 1 | 2 | 3 | 4;

interface RunAgentStepRequestBody {
  stepIndex?: number;
  siteName?: string;
  siteUrl?: string;
  niche?: string;
  jobTitle?: string;
  targetKeyword?: string;
  secondaryKeywords?: string[];
  previousStepOutput?: string;
  modelId?: AgencyLlmModelId;
  isFreeTierKey?: boolean;
  apiKeyOverride?: string;
}

interface PipelineStepContext {
  siteName: string;
  siteUrl: string;
  niche: string;
  jobTitle: string;
  targetKeyword: string;
  secondaryKeywords: string[];
  previousStepOutput: string;
}

interface PipelineStageSpec {
  stepIndex: AgentPipelineStepIndex;
  rowId: string;
  agentName: string;
  stageLabel: string;
  targetJobStatus:
    | 'drafting-article'
    | 'generating-visuals'
    | 'qa-critic-review'
    | 'ready-for-review';
  maxOutputTokens: number;
  temperature: number;
  systemPrompt: string;
  buildUserPrompt: (ctx: PipelineStepContext) => string;
  buildFallbackOutput: (ctx: PipelineStepContext) => string;
}

const PIPELINE_STAGE_SPECS: readonly PipelineStageSpec[] = [
  {
    stepIndex: 0,
    rowId: 'agent-keyword-lead',
    agentName: 'Keyword & Cluster Lead',
    stageLabel: 'Keyword & H2/H3 Architecture',
    targetJobStatus: 'drafting-article',
    maxOutputTokens: 480,
    temperature: 0.35,
    systemPrompt:
      'You are the Keyword & Cluster Lead at a senior SEO & GEO editorial agency. Output crisp, scannable Markdown with zero filler preamble.',
    buildUserPrompt: (ctx) =>
      [
        `Site: ${ctx.siteName} (${ctx.siteUrl})`,
        `Niche: ${ctx.niche}`,
        `Primary Keyword: "${ctx.targetKeyword}"`,
        `Secondary Keywords: ${ctx.secondaryKeywords.join(', ') || 'None specified'}`,
        `Article Title: "${ctx.jobTitle}"`,
        '',
        'Deliver:',
        '1. Confirmed Search Intent & GEO Direct-Answer Angle (2 lines).',
        '2. 5 SEO/GEO H2 Headings with 1 bullet talking point each.',
        '3. 3 high-signal FAQ questions for AI Overview citation.',
      ].join('\n'),
    buildFallbackOutput: (ctx) =>
      [
        `### Keyword & Heading Brief — ${ctx.targetKeyword}`,
        `- **Search Intent:** Commercial-educational decision guide for ${ctx.siteName}`,
        `- **Primary Keyword:** \`${ctx.targetKeyword}\``,
        `- **H2 Architecture:**`,
        `  1. Why ${ctx.targetKeyword} Matters for ${ctx.niche} Teams`,
        `  2. Core Evaluation Criteria & Cost Benchmarks`,
        `  3. Step-by-Step Implementation Playbook`,
        `  4. Common Pitfalls & Technical Checks`,
        `  5. Quick Comparison Matrix & Next Steps`,
      ].join('\n'),
  },
  {
    stepIndex: 1,
    rowId: 'sub-geo-section-writer',
    agentName: 'Long-Form GEO Writer',
    stageLabel: 'Long-Form GEO Draft Synthesis',
    targetJobStatus: 'drafting-article',
    maxOutputTokens: 1150,
    temperature: 0.5,
    systemPrompt:
      'You are the Long-Form GEO Section Writer. Write clear, authoritative, structured Markdown sections designed for human readers and AI search engines. Use direct definitions, short paragraphs, concrete checklists, and clean H2/H3 headings.',
    buildUserPrompt: (ctx) =>
      [
        `Write the core publication-ready Markdown draft for "${ctx.jobTitle}" targeting "${ctx.targetKeyword}" for ${ctx.siteName} (${ctx.siteUrl}).`,
        ctx.previousStepOutput
          ? `Follow this approved keyword outline:\n${ctx.previousStepOutput.slice(0, 1200)}`
          : '',
        '',
        'Include: a 50-word Direct Answer intro block, 4 structured H2 sections with actionable bullets/examples, a quick comparison table, and a 3-item FAQ section.',
      ]
        .filter(Boolean)
        .join('\n\n'),
    buildFallbackOutput: (ctx) =>
      [
        `# ${ctx.jobTitle}`,
        '',
        `> **Quick Summary:** For ${ctx.siteName} operators scaling ${ctx.niche}, mastering \`${ctx.targetKeyword}\` combines structured intent mapping, scannable proof blocks, and schema-backed clarity so both organic searchers and AI answer engines cite your workflow.`,
        '',
        `## 1. Strategic Context for ${ctx.niche}`,
        `Teams evaluating \`${ctx.targetKeyword}\` need transparent workflows, verified benchmarks, and clear internal links rather than generic filler. Align every page section directly to a buyer or practitioner question.`,
        '',
        `## 2. Practical Execution Checklist`,
        `- **Direct Answer Block:** Summarize the recommendation in the opening 50 words.`,
        `- **Supporting Terms:** Incorporate ${ctx.secondaryKeywords.slice(0, 3).join(', ') || ctx.targetKeyword} naturally in subheadings.`,
        `- **Proof & Internal Links:** Link each framework recommendation back to live resources on ${ctx.siteUrl}.`,
        '',
        `## 3. Frequently Asked Questions`,
        `**How quickly does ${ctx.targetKeyword} impact visibility?** Focused topical clusters paired with clean on-page schema typically show indexing movement within 2–4 weeks.`,
      ].join('\n'),
  },
  {
    stepIndex: 2,
    rowId: 'agent-design-director',
    agentName: 'Design & Infographic Director',
    stageLabel: 'Hero & Infographic Asset Specs',
    targetJobStatus: 'generating-visuals',
    maxOutputTokens: 450,
    temperature: 0.45,
    systemPrompt:
      'You are the Creative Design Director. Produce concise visual production specs (Hero Image + Infographic Plate + Social Carousel visual direction) tailored to the brand UI.',
    buildUserPrompt: (ctx) =>
      [
        `Brand: ${ctx.siteName} (${ctx.niche})`,
        `Article: "${ctx.jobTitle}"`,
        `Keyword: "${ctx.targetKeyword}"`,
        '',
        'Provide exact production prompts and alt-text for:',
        '1. 16:9 Editorial Featured Hero Visual (style, focal subject, accessible alt-text).',
        '2. Vertical 6-Block Architecture Infographic (chart type, key data callouts, palette).',
      ].join('\n'),
    buildFallbackOutput: (ctx) =>
      [
        `### Visual Asset Production Brief`,
        `- **Featured Hero (16:9):** Clean SaaS editorial illustration highlighting \`${ctx.targetKeyword}\` workflow metrics on crisp slate & royal cobalt surfaces.`,
        `- **Alt Text:** "${ctx.jobTitle} visual workflow architecture for ${ctx.siteName}"`,
        `- **Infographic Plate:** 5-step horizontal process comparison with KPI callouts and scannable checklist badges.`,
      ].join('\n'),
  },
  {
    stepIndex: 3,
    rowId: 'agent-qa-publisher',
    agentName: 'On-Page & 150-Pt QA Publisher',
    stageLabel: 'On-Page SEO, JSON-LD & 150-Pt QA',
    targetJobStatus: 'qa-critic-review',
    maxOutputTokens: 480,
    temperature: 0.25,
    systemPrompt:
      'You are the Technical On-Page SEO & 150-Pt Readability QA Gate. Audit the article draft concisely and provide exact SEO title tag (<=60 chars), meta description (<=155 chars), slug, internal link anchors, and FAQPage schema summary.',
    buildUserPrompt: (ctx) =>
      [
        `Site: ${ctx.siteUrl}`,
        `Title: "${ctx.jobTitle}"`,
        `Target Keyword: "${ctx.targetKeyword}"`,
        ctx.previousStepOutput
          ? `Draft Excerpt:\n${ctx.previousStepOutput.slice(0, 1200)}`
          : '',
        '',
        'Return strictly:',
        '- SEO Title Tag (<=60 chars)',
        '- Meta Description (<=155 chars)',
        '- Canonical URL Slug',
        '- 150-Pt QA Pass Verdict & top 3 refinements applied',
      ]
        .filter(Boolean)
        .join('\n'),
    buildFallbackOutput: (ctx) => {
      const slug = ctx.targetKeyword
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '')
        .slice(0, 56);
      return [
        `### On-Page SEO & QA Verification (138 / 150 Pass)`,
        `- **SEO Title:** ${ctx.jobTitle.slice(0, 58)}`,
        `- **Meta Description:** Actionable ${ctx.targetKeyword} playbook for ${ctx.siteName} with benchmarks, checklists, and live implementation steps.`,
        `- **Suggested Slug:** \`/${slug || 'editorial-guide'}\``,
        `- **Schema Ready:** \`Article\` + \`FAQPage\` JSON-LD validated.`,
      ].join('\n');
    },
  },
  {
    stepIndex: 4,
    rowId: 'agent-social-manager',
    agentName: 'Social & Distribution Manager',
    stageLabel: 'Omnichannel Social Distribution Kit',
    targetJobStatus: 'ready-for-review',
    maxOutputTokens: 480,
    temperature: 0.55,
    systemPrompt:
      'You are the Omnichannel Social & Distribution Manager. Generate high-signal, zero-fluff social posts (LinkedIn post, X/Threads hook + 3 bullets, and Pinterest Pin title/caption).',
    buildUserPrompt: (ctx) =>
      [
        `Article Published/Ready: "${ctx.jobTitle}" on ${ctx.siteName} (${ctx.siteUrl})`,
        `Core Keyword: "${ctx.targetKeyword}"`,
        '',
        'Create ready-to-publish copy for:',
        '1. LinkedIn Insight Post (max 90 words, 3 concise takeaways)',
        '2. X / Threads Hook + Summary',
        '3. Pinterest 2:3 Pin Title & Description',
      ].join('\n'),
    buildFallbackOutput: (ctx) =>
      [
        `### Social Distribution Kit — Ready`,
        `- **LinkedIn:** Most ${ctx.niche} teams waste cycles guessing \`${ctx.targetKeyword}\`. We published the complete breakdown on ${ctx.siteName} covering evaluation benchmarks, QA checklists, and implementation steps.`,
        `- **X / Threads:** New playbook on \`${ctx.targetKeyword}\` for ${ctx.siteName}: clear workflows, zero fluff, live benchmarks.`,
        `- **Pinterest Pin:** "${ctx.jobTitle}" — Step-by-Step Visual Playbook & Checklist.`,
      ].join('\n'),
  },
];

export async function POST(req: NextRequest): Promise<NextResponse> {
  const workspace = await agencyWorkspace(req);
  if (workspace instanceof NextResponse) return workspace;
  const blocked = await requireApprovedWebsite(workspace);
  if (blocked) return blocked;
  try {
    const body = (await req.json()) as RunAgentStepRequestBody;
    const rawStep = typeof body.stepIndex === 'number' ? body.stepIndex : 0;
    const normalizedStep = Math.max(0, Math.min(4, Math.floor(rawStep))) as AgentPipelineStepIndex;

    const spec =
      PIPELINE_STAGE_SPECS.find((s) => s.stepIndex === normalizedStep) || PIPELINE_STAGE_SPECS[0];

    const ctx: PipelineStepContext = {
      siteName: (body.siteName || 'DoItWithAI Workspace').trim(),
      siteUrl: (body.siteUrl || 'https://doitwithai.tools').trim(),
      niche: (body.niche || 'B2B SaaS & AI Workflows').trim(),
      jobTitle: (body.jobTitle || 'High-Intent Editorial Guide').trim(),
      targetKeyword: (body.targetKeyword || 'ai workflow automation').trim(),
      secondaryKeywords: Array.isArray(body.secondaryKeywords)
        ? body.secondaryKeywords.slice(0, 6)
        : [],
      previousStepOutput: (body.previousStepOutput || '').trim(),
    };

    const llmCall = await executeAgencyLlmCall({
      modelId: body.modelId || 'gemini-2.5-flash',
      systemPrompt: spec.systemPrompt,
      userPrompt: spec.buildUserPrompt(ctx),
      temperature: spec.temperature,
      maxOutputTokens: spec.maxOutputTokens,
      isFreeTierKey: body.isFreeTierKey ?? true,
      apiKeyOverride: body.apiKeyOverride,
    });
    if (!llmCall.ok) return NextResponse.json({ error: llmCall.apiErrorDetail }, { status: 503 });
    await recordAgencyUsage(workspace.id, 'run-agent-step', llmCall);


    const resolvedContent = llmCall.outputText;

    return NextResponse.json({
      ok: true,
      stepIndex: spec.stepIndex,
      rowId: spec.rowId,
      agentName: spec.agentName,
      stageLabel: spec.stageLabel,
      targetJobStatus: spec.targetJobStatus,
      generatedContent: resolvedContent,
      llmGatewayStatus: {
        usedLiveApiKey: llmCall.usedLiveApiKey,
        apiKeySlot: llmCall.apiKeySlot,
        telemetryNote: llmCall.telemetryNote,
        apiErrorDetail: llmCall.apiErrorDetail,
      },
      tokenUsage: {
        modelId: llmCall.modelId,
        apiKeySlot: llmCall.apiKeySlot,
        usedLiveApiKey: llmCall.usedLiveApiKey,
        isFreeTierKey: llmCall.isFreeTierKey,
        promptTokens: llmCall.promptTokens,
        completionTokens: llmCall.completionTokens,
        thinkingTokens: llmCall.thinkingTokens,
        totalTokens: llmCall.totalTokens,
        shadowPaidCostUsd: llmCall.shadowPaidCostUsd,
        actualCostUsd: llmCall.actualCostUsd,
        latencyMs: llmCall.latencyMs,
      },
      executedAtIso: new Date().toISOString(),
    });
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        error:
          error instanceof Error ? error.message : 'Failed to execute live agent pipeline step.',
      },
      { status: 500 }
    );
  }
}
