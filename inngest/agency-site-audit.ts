import { deliverChannelDraft } from "@/lib/ai-agency/social-delivery.server";
import { deliveryConnection } from "@/lib/ai-agency/mcp-delivery.server";
import { agencyJobs } from "./ai-agency-pipeline";
import { createSupabaseServiceClient } from "@/features/website-builder/lib/supabase/server";
import { discoverKnowledge } from "@/lib/ai-employee-agency/onboarding.server";
import { inspectPage, inspectCrawlFiles } from "@/lib/ai-agency/refresh.server";

export const scheduleSiteScans = agencyJobs.createFunction(
  { id: "weekly-agency-site-inventory" },
  { cron: "0 4 * * 1" },
  async ({ event, step }) => {
    const cycle = new Date(event.ts ?? Date.now()).toISOString().slice(0, 10);
    let cursor = "";
    for (;;) {
      const ids = await step.run("workspaces-" + cursor, async () => {
        const db = createSupabaseServiceClient();
        if (!db) throw Error("Supabase unavailable");
        let query = db
          .from("tenant_brand_dna")
          .select("workspace_id")
          .not("approved_at", "is", null)
          .order("workspace_id")
          .limit(100);
        if (cursor) query = query.gt("workspace_id", cursor);
        const rows = await query;
        if (rows.error) throw rows.error;
        return rows.data.map((r) => String(r.workspace_id));
      });
      if (!ids.length) break;
      await step.sendEvent(
        "scan-" + cursor,
        ids.map((id) => ({
          name: "agency/site.scan",
          data: { workspace: id, cycle },
        })),
      );
      if (ids.length < 100) break;
      cursor = ids[ids.length - 1];
    }
  },
);

export const scanAgencySite = agencyJobs.createFunction(
  {
    id: "audit-agency-site",
    concurrency: { key: "event.data.workspace", limit: 1 },
  },
  { event: "agency/site.scan" },
  async ({ event, step }) => {
    const db = createSupabaseServiceClient();
    if (!db) throw Error("Supabase unavailable");
    const workspace = String(event.data.workspace),
      cycle = String(event.data.cycle);
    const scan = await step.run("discover-inventory", async () => {
      const { data: brand, error } = await db
        .from("tenant_brand_dna")
        .select("domain,profile,revision")
        .eq("workspace_id", workspace)
        .not("approved_at", "is", null)
        .maybeSingle();
      if (error) throw error;
      if (!brand) return null;
      const current = await discoverKnowledge(brand.domain, workspace, db);
      const prior = await db
        .from("agency_site_scans")
        .select("report")
        .eq("workspace_id", workspace)
        .eq("domain", brand.domain)
        .eq("report->>coverage", "complete")
        .lt("cycle", cycle)
        .order("cycle", { ascending: false })
        .limit(1)
        .maybeSingle();
      if (prior.error) throw prior.error;
      const old = new Set<string>(
        prior.data?.report?.inventory ||
          brand.profile.pages.map((p: { url: string }) => p.url),
      );
      const inventory = Array.from(new Set(current.pages.map((p) => p.url)));
      return {
        domain: brand.domain,
        revision: Number(brand.revision),
        inventory,
        coverage: current.coverage,
        note: current.note,
        added: inventory.filter((url) => !old.has(url)),
        removed:
          current.coverage === "complete"
            ? Array.from(old).filter((url) => !inventory.includes(url))
            : [],
      };
    });
    if (!scan) return;
    const files = await step.run("check-crawl-files", () =>
      inspectCrawlFiles(scan.domain),
    );
    const checks = [];
    const offset = Math.floor(Date.parse(cycle) / 604800000) * 5;
    for (let i = 0; i < Math.min(scan.inventory.length, 5); i++) {
      const url = scan.inventory[(i + offset) % scan.inventory.length];
      checks.push(
        await step.run("inspect-" + i, async () => {
          try {
            const { status, findings } = await inspectPage(url, scan.domain);
            return { url, status, findings };
          } catch {
            return {
              url,
              status: null,
              findings: ["Could not inspect this page within the crawl policy"],
            };
          }
        }),
      );
    }
    await step.run("record-audit", async () => {
      const saved = await db.rpc("agency_record_site_scan", {
        owner: workspace,
        cycle_day: cycle,
        scan_domain: scan.domain,
        observed_revision: scan.revision,
        scan: {
          inventory: scan.inventory,
          coverage: scan.coverage,
          note: scan.note,
          added: scan.added,
          removed: scan.removed,
          checks,
          files,
        },
      });
      if (saved.error) throw saved.error;
    });
  },
);

export const scheduleChannelDelivery = agencyJobs.createFunction(
  { id: "dispatch-approved-channel-queues" },
  { cron: "*/15 * * * *" },
  async ({ step }) => {
    const events = await step.run("eligible-entitlements", async () => {
      const configured = JSON.parse(
        process.env.AGENCY_MCP_CONNECTIONS_JSON || "{}",
      );
      const due: { workspace: string; channel: string }[] = [];
      for (const workspace of Object.keys(configured)) {
        for (const channel of ["pinterest", "linkedin", "facebook", "video"]) {
          if (configured[workspace]?.[channel]?.autoPublish === true)
            due.push({ workspace, channel });
        }
      }
      return due;
    });
    for (let i = 0; i < events.length; i += 100)
      await step.sendEvent(
        "channels-" + i,
        events.slice(i, i + 100).map((data) => ({ name: "agency/channel.deliver", data })),
      );
  },
);

export const publishChannelQueue = agencyJobs.createFunction(
  {
    id: "publish-channel-queue",
    concurrency: { limit: 1, key: "event.data.workspace" },
  },
  { event: "agency/channel.deliver" },
  async ({ event, step }) => {
    const db = createSupabaseServiceClient();
    if (!db) throw Error("Supabase unavailable");
    const workspace = String(event.data.workspace),
      channel = String(event.data.channel);
    const rows = await step.run("due-drafts", async () => {
      if (!deliveryConnection(workspace, channel)?.autoPublish) return [];
      const day = new Date().toISOString().slice(0, 10);
      const brand = await db
        .from("tenant_brand_dna")
        .select("profile")
        .eq("workspace_id", workspace)
        .not("approved_at", "is", null)
        .maybeSingle();
      if (brand.error) throw brand.error;
      if (brand.data?.profile?.is_ymyl !== false) return [];
      const result = await db
        .from("social_ledger")
        .select("id")
        .eq("workspace_id", workspace)
        .eq("payload->>channel", channel)
        .eq("payload->>status", "draft")
        .or("payload->>day.is.null,payload->>day.lte." + day)
        .order("created_at")
        .limit(3);
      if (result.error) throw result.error;
      return result.data.map((r) => String(r.id));
    });
    for (const id of rows)
      await step.run("deliver-" + id, () =>
        deliverChannelDraft(workspace, id, true),
      );
  },
);
