import { Inngest, NonRetriableError } from "inngest";
import { createSupabaseServiceClient } from "@/features/website-builder/lib/supabase/server";
import { calendarDays, type CalendarPlan } from "@/lib/ai-agency/calendar";
import {
  compilePrompt,
  verifiedReply,
  promptVersion,
} from "@/lib/ai-agency/prompt-compiler";
import { specialists } from "@/lib/ai-agency/specialists";
import { research, type Evidence } from "@/lib/ai-agency/web-research";
import {
  prepareArticle,
  validateArticle,
  type ReviewDraft,
} from "@/lib/ai-agency/qa-validators";
import { readScore, rubric } from "@/lib/ai-agency/quality-score";
import {
  executeAgencyLlmCall,
  providerBindings,
} from "@/lib/ai-employee-agency/llm-gateway";
import {
  MODEL_PRICING_CATALOG,
  type AgencyLlmModelId,
} from "@/lib/ai-employee-agency/token-telemetry-store";
import { recordAgencyUsage } from "@/lib/ai-employee-agency/workspace.server";

import { deliverApprovedArticle } from "@/lib/ai-agency/delivery.server";
import type { CmsConnectionConfig } from "@/lib/ai-employee-agency/cms-connectors";

export const agencyJobs = new Inngest({ id: "doitwithai-agency" });
function database() {
  const db = createSupabaseServiceClient();
  if (!db) throw Error("Configure Supabase service access.");
  return db;
}

export const scheduleAgencyRuns = agencyJobs.createFunction(
  { id: "schedule-agency-production" },
  { cron: "*/10 * * * *" },
  async ({ step, event }) => {
    const day = new Date(event.ts ?? Date.now()).toISOString().slice(0, 10);
    for (let offset = 0; ; offset += 200) {
      const plans = await step.run("plans-" + offset, async () => {
        const { data, error } = await database()
          .from("agency_calendar_quotas")
          .select("*")
          .lte("start_date", day)
          .gte("end_date", day)
          .order("id")
          .range(offset, offset + 199);
        if (error) throw error;
        return data as (CalendarPlan & { workspace_id: string })[];
      });
      if (plans.length)
        await step.sendEvent(
          "dispatch-" + offset,
          plans.map((p) => ({
            name: "agency/calendar.due",
            data: { planId: p.id, workspace: p.workspace_id },
          })),
        );
      if (plans.length < 200) break;
    }
  },
);

export const produceAgencyArticle = agencyJobs.createFunction(
  {
    id: "produce-agency-article",
    retries: 2,
    concurrency: { limit: 1, key: "event.data.workspace" },
    onFailure: async ({ event }) => {
      const db = database();
      const failed = await db
        .from("agency_production_runs")
        .update({ status: "blocked" })
        .eq("invocation", event.data.run_id)
        .eq("status", "drafting")
        .select("item_id")
        .maybeSingle();
      if (failed.error) throw failed.error;
      if (failed.data) {
        const item = await db
          .from("content_items")
          .update({ status: "paused" })
          .eq("id", failed.data.item_id)
          .eq("status", "drafting");
        if (item.error) throw item.error;
      }
    },
  },
  { event: "agency/calendar.due" },
  async ({ step, event, runId }) => {
    const db = database();
    const run = await step.run("claim", async () => {
      const { data: plan, error } = await db
        .from("agency_calendar_quotas")
        .select("*")
        .eq("id", event.data.planId)
        .eq("workspace_id", event.data.workspace)
        .single();
      if (error) throw error;
      const today = new Date().toISOString().slice(0, 10);
      const target = calendarDays(plan).find((d) => d.date === today);
      if (target?.pins) {
        const pins = await db.rpc("agency_queue_calendar_pins", {
          plan: plan.id,
          daily_limit: target.pins,
        });
        if (pins.error) throw pins.error;
      }
      const limit = target?.articles ?? 0;
      if (!limit) return null;
      if (!Object.values(providerBindings()).some(Boolean)) {
        throw new NonRetriableError(
          "Configure a model provider before claiming queued work.",
        );
      }
      const claim = await db.rpc("agency_claim_production", {
        plan: plan.id,
        daily_limit: limit,
        run_key: runId,
      });
      if (claim.error) throw claim.error;
      if (!claim.data) return null;
      const row = await db
        .from("agency_production_runs")
        .select("*")
        .eq("id", claim.data)
        .single();
      if (row.error) throw row.error;
      const item = await db
        .from("content_items")
        .select("content")
        .eq("id", row.data.item_id)
        .single();
      if (item.error) throw item.error;
      const brand = await db
        .from("tenant_brand_dna")
        .select("profile,domain")
        .eq("workspace_id", plan.workspace_id)
        .eq("revision", row.data.revision)
        .single();
      if (brand.error) throw brand.error;
      return {
        id: String(claim.data),
        workspace: String(plan.workspace_id),
        item: String(row.data.item_id),
        topic: String(item.data.content.topic),
        slug: String(row.data.target_slug),
        revision: Number(row.data.revision),
        profile: brand.data.profile,
        domain: String(brand.data.domain),
        cooldown: Number(plan.cooldown_minutes),
      };
    });
    if (!run) return;
    async function generate(
      role: string,
      task: string,
      evidence: Evidence[],
      format?: string,
    ) {
      if (!run) throw Error("Missing production run");
      const configured = providerBindings();
      const modelId = (
        Object.keys(MODEL_PRICING_CATALOG) as AgencyLlmModelId[]
      ).find((id) => configured[MODEL_PRICING_CATALOG[id].provider]);
      if (!modelId) throw new NonRetriableError("Configure a model provider.");
      const budget = await db.rpc("agency_reserve_model_call", {
        run: run.id,
        specialist: role,
      });
      if (budget.error) throw budget.error;
      if (!budget.data)
        throw new NonRetriableError(
          "Call limit reached or brand approval changed.",
        );
      const prompt = compilePrompt(
        specialists.find((s) => s.id === role),
        false,
        run.profile,
        [],
        evidence,
        task,
      );
      if (format)
        prompt.systemPrompt = prompt.systemPrompt.replace(
          /Return JSON only:[^\n]*$/,
          format,
        );
      const call = await executeAgencyLlmCall({
        ...prompt,
        modelId,
        maxOutputTokens: role === "writer" ? 3200 : 900,
      });
      if (!call.ok) throw Error("Agency provider unavailable.");
      await recordAgencyUsage(run.workspace, role, call);
      return call.outputText;
    }
    const sources = (await step.run("research", () =>
      research(run.topic, run.profile.competitor_blocklist || []),
    )) as Evidence[];
    const brief = await step.run("keyword-brief", async () =>
      verifiedReply(await generate("keywords", run.topic, sources), sources),
    );
    const hero = await step.run("prepare-visual", async () => {
      const color = run.profile.brand_colors?.primary;
      const fill =
        typeof color === "string" && /^#[0-9a-f]{6}$/i.test(color)
          ? color
          : "#162544";
      const label = run.topic.replace(
        /[&<>"']/g,
        (c) =>
          ({
            "&": "&amp;",
            "<": "&lt;",
            ">": "&gt;",
            '"': "&quot;",
            "'": "&#39;",
          })[c]!,
      );
      const hero =
        '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 675"><rect width="1200" height="675" fill="' +
        fill +
        '"/><text x="60" y="350" fill="white" font-size="36">' +
        label +
        "</text></svg>";
      return hero;
    });
    let feedback = "";
    let disposition = "quarantined";
    for (const attempt of [1, 2]) {
      const draft = (await step.run("write-" + attempt, async () => {
        const output = await generate(
          "writer",
          JSON.stringify({ brief, topic: run.topic, feedback }),
          sources,
          "Return JSON with title (10–60 characters), description (50–160 characters), and blocks. Each block has text and may have url and quote. Every external statistic needs a retrieved URL and exact quote with its value. Do not embed URLs in text.",
        );
        const parsed = JSON.parse(
          output.trim().replace(/^`{3}(?:json)?\s*|\s*`{3}$/gi, ""),
        );
        if (
          typeof parsed.title !== "string" ||
          typeof parsed.description !== "string"
        )
          throw Error("Invalid writer metadata");
        return {
          title: parsed.title,
          description: parsed.description,
          slug: run.slug,
          body: verifiedReply(JSON.stringify(parsed), sources),
        };
      })) as ReviewDraft;
      const article = prepareArticle(draft);
      article.featuredHeroSvg = hero;
      article.compiledHtmlBody = hero + article.compiledHtmlBody;
      const checks = await step.run("validate-" + attempt, () =>
        validateArticle(article, run.domain, run.profile),
      );
      const score = await step.run("review-" + attempt, async () => {
        if (checks.issues.length)
          return {
            disposition: "quarantined",
            feedback: checks.issues.join("\n"),
            criticalFail: true,
          };
        const output = await generate(
          "qa",
          JSON.stringify(draft),
          checks.evidence as Evidence[],
          "Return JSON with integer scores (maxima " +
            JSON.stringify(rubric) +
            "), criticalFail for fabricated statistics, requiresHuman for sensitive advice, and actionable feedback.",
        );
        return readScore(output, run.profile.is_ymyl !== false, attempt);
      });
      await step.run("save-review-" + attempt, async () => {
        const saved = await db.rpc("agency_record_pipeline_review", {
          run: run.id,
          attempt_no: attempt,
          article,
          card: score,
        });
        if (saved.error) throw saved.error;
      });
      feedback = score.feedback;
      disposition = score.disposition;
      if (disposition !== "revision") break;
    }
    if (disposition === "approved") {
      await step.run("deliver-approved-snapshot", async () => {
        const config: CmsConnectionConfig | undefined = JSON.parse(
          process.env.AGENCY_CMS_CONNECTIONS_JSON || "{}",
        )[run.workspace];
        if (!config) return { status: "awaiting_cms" };
        const review = await db
          .from("qa_audit_logs")
          .select("id")
          .eq("workspace_id", run.workspace)
          .eq("payload->>workId", run.id)
          .eq("payload->>disposition", "approved")
          .single();
        if (review.error) throw review.error;
        const response = await deliverApprovedArticle(
          run.workspace,
          review.data.id,
          config,
          true,
        );
        if (!response.ok)
          throw new NonRetriableError("CMS delivery requires operator review.");
        return { status: "confirmed" };
      });
    }
    await step.sleep("workspace-cooldown", run.cooldown + "m");
    return { run: run.id, disposition };
  },
);
