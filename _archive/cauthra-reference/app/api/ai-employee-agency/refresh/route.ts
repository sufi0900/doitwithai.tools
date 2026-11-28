import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { agencyWorkspace } from "@/lib/ai-employee-agency/workspace.server";
import { createSupabaseServiceClient } from "@/features/website-builder/lib/supabase/server";
import {
  agencyProviderBindings,
  meteredAgencyCall,
} from "@/lib/ai-agency/billing.server";
import { compilePrompt, promptVersion } from "@/lib/ai-agency/prompt-compiler";
import { specialists } from "@/lib/ai-agency/specialists";
import {
  MODEL_PRICING_CATALOG,
  type AgencyLlmModelId,
} from "@/lib/ai-employee-agency/token-telemetry-store";
import {
  classifyPageMetaHealth,
  fieldFindings,
  inspectCrawlFiles,
  inspectPage,
  repairFields,
  type PageFields,
  type PageImageAudit,
} from "@/lib/ai-agency/refresh.server";

function stripJsonFence(raw: string): string {
  return raw.trim().replace(/^`{3}(?:json)?\s*|\s*`{3}$/gi, "").trim();
}

function resolveModelId(workspaceId: string): AgencyLlmModelId {
  const configured = agencyProviderBindings(workspaceId);
  const ids = Object.keys(MODEL_PRICING_CATALOG) as AgencyLlmModelId[];
  return (
    ids.find((id) => configured[MODEL_PRICING_CATALOG[id].provider]) ||
    "gemini-2.5-flash"
  );
}

export async function GET(request: Request) {
  const ws = await agencyWorkspace(request);
  if (ws instanceof NextResponse) return ws;
  const { data: brand, error } = await ws.db
    .from("tenant_brand_dna")
    .select("domain,profile,approved_at")
    .eq("workspace_id", ws.id)
    .maybeSingle();
  if (error || !brand?.approved_at)
    return NextResponse.json(
      { error: "Approve the website knowledge base first." },
      { status: 409 },
    );
  const target = new URL(request.url).searchParams.get("url");
  if (!target) {
    const scan = await ws.db
      .from("agency_site_scans")
      .select("cycle,report")
      .eq("workspace_id", ws.id)
      .eq("domain", brand.domain)
      .order("cycle", { ascending: false })
      .limit(1)
      .maybeSingle();
    return scan.error
      ? NextResponse.json(
          { error: "Scan history unavailable." },
          { status: 503 },
        )
      : NextResponse.json({ scan: scan.data });
  }
  if (!brand.profile.pages?.some((p: { url: string }) => p.url === target))
    return NextResponse.json(
      { error: "Choose an approved page." },
      { status: 400 },
    );
  const match =
    /^https:\/\/doitwithai\.tools\/p\/([a-z0-9-]+)\/(pages|blog)\/([a-z0-9-]+)$/.exec(
      target,
    );
  if (match && brand.profile.source === "internal_direct") {
    const pub = await ws.db
      .from("website_publications")
      .select("id,document")
      .eq("owner_id", ws.id)
      .eq("slug", match[1])
      .is("superseded_at", null)
      .maybeSingle();
    const item = pub.data?.document.publishing?.[
      match[2] === "blog" ? "posts" : "pages"
    ]?.find((i: { slug: string }) => i.slug === match[3]);
    if (!item)
      return NextResponse.json(
        { error: "Published page changed. Refresh the site inventory." },
        { status: 409 },
      );
    const fields: PageFields = {
      heading: item.title,
      title: item.seoTitle || "",
      description: item.seoDescription || "",
    };
    return NextResponse.json({
      fields,
      metaHealth: classifyPageMetaHealth(fields),
      images: [] as PageImageAudit[],
      suggested: repairFields(
        fields,
        item.excerpt ||
          item.blocks?.find((b: { type: string }) => b.type === "paragraph")
            ?.text ||
          "",
      ),
      findings: fieldFindings(fields),
      publication: pub.data!.id,
    });
  }
  try {
    const result = await inspectPage(target, brand.domain);
    return result.fields
      ? NextResponse.json(result)
      : NextResponse.json(
          { error: "Page returned HTTP " + result.status },
          { status: 422 },
        );
  } catch {
    return NextResponse.json(
      { error: "Page could not be read within the approved crawl policy." },
      { status: 422 },
    );
  }
}

export async function POST(request: Request) {
  const ws = await agencyWorkspace(request);
  if (ws instanceof NextResponse) return ws;
  const input = await request.json().catch(() => null);
  if (!input || typeof input !== "object") {
    return NextResponse.json({ error: "Invalid request payload." }, { status: 400 });
  }

  // -------------------------------------------------------------------------
  // ACTION 1: LIVE ZERO-LLM TECHNICAL SITE SCAN (persists to agency_site_scans)
  // -------------------------------------------------------------------------
  if (input.action === "scan-now") {
    const { data: brand, error } = await ws.db
      .from("tenant_brand_dna")
      .select("domain,revision,profile,approved_at")
      .eq("workspace_id", ws.id)
      .maybeSingle();
    if (error || !brand?.approved_at) {
      return NextResponse.json(
        { error: "Approve the website knowledge base first." },
        { status: 409 },
      );
    }

    const pages: Array<{ url: string; title?: string }> = Array.isArray(
      brand.profile?.pages,
    )
      ? brand.profile.pages
      : [];
    const targetUrls = Array.from(
      new Set([brand.domain, ...pages.map((p) => p.url)]),
    ).slice(0, 8);

    const [files, checks] = await Promise.all([
      inspectCrawlFiles(brand.domain),
      Promise.all(
        targetUrls.map(async (u) => {
          try {
            const inspected = await inspectPage(u, brand.domain);
            return {
              url: inspected.url,
              status: inspected.status,
              metaHealth: inspected.metaHealth,
              fields: inspected.fields,
              findings: inspected.findings,
              images: inspected.images,
            };
          } catch {
            return {
              url: u,
              status: null as number | null,
              metaHealth: "needs_fix" as const,
              fields: null as PageFields | null,
              findings: ["Could not inspect this page within the crawl policy"],
              images: [] as PageImageAudit[],
            };
          }
        }),
      ),
    ]);

    const mediaIssues = checks.flatMap((c) =>
      c.images
        .filter((img) => img.missingAlt || img.isOversized || !img.isWebpOrAvif)
        .map((img) => ({
          pageUrl: c.url,
          imageUrl: img.src,
          alt: img.alt,
          missingAlt: img.missingAlt,
          sizeKb: img.sizeKb,
          isOversized: img.isOversized,
          isWebpOrAvif: img.isWebpOrAvif,
          targetGuidance: img.isOversized
            ? `Compress to WebP (< 150 KB target; currently ${img.sizeKb} KB)`
            : !img.isWebpOrAvif
              ? "Convert to WebP/AVIF (< 150 KB target)"
              : "Add descriptive keyword-aligned alt text",
        })),
    );

    const cycle = new Date().toISOString().slice(0, 10);
    const report = {
      inventory: pages.map((p) => p.url),
      coverage: brand.profile?.coverage || "partial",
      added: [] as string[],
      removed: [] as string[],
      files,
      checks,
      mediaIssues,
      summary: {
        totalChecked: checks.length,
        metaOk: checks.filter((c) => c.metaHealth === "ok").length,
        metaNeedsFix: checks.filter((c) => c.metaHealth !== "ok").length,
        missingAltCount: mediaIssues.filter((m) => m.missingAlt).length,
        oversizedImageCount: mediaIssues.filter((m) => m.isOversized).length,
      },
    };

    const admin = createSupabaseServiceClient();
    if (admin) {
      await admin.from("agency_site_scans").upsert(
        {
          workspace_id: ws.id,
          cycle,
          domain: brand.domain,
          revision: brand.revision,
          report,
        },
        { onConflict: "workspace_id,cycle" },
      );
    }

    return NextResponse.json({ ok: true, scan: { cycle, report } });
  }

  // -------------------------------------------------------------------------
  // ACTION 2: AI OPTIMIZE PAGE (Meta Diff, Alt-Text & Content/FAQ Patch)
  // -------------------------------------------------------------------------
  if (input.action === "ai-optimize") {
    const targetUrl = typeof input.url === "string" ? input.url.trim() : "";
    if (!targetUrl) {
      return NextResponse.json({ error: "Select a page URL to optimize." }, { status: 400 });
    }
    const { data: brand, error } = await ws.db
      .from("tenant_brand_dna")
      .select("domain,revision,profile,approved_at")
      .eq("workspace_id", ws.id)
      .maybeSingle();
    if (error || !brand?.approved_at) {
      return NextResponse.json(
        { error: "Approve the website knowledge base first." },
        { status: 409 },
      );
    }

    const currentFields = (input.currentFields || {
      heading: "",
      title: "",
      description: "",
    }) as PageFields;
    const pageKind = typeof input.pageKind === "string" ? input.pageKind : "page";
    const images = Array.isArray(input.images)
      ? (input.images as PageImageAudit[]).slice(0, 8)
      : [];
    const findings = Array.isArray(input.findings)
      ? (input.findings as string[]).slice(0, 10)
      : [];

    const prompt = compilePrompt(
      specialists.find((s) => s.id === "refresh"),
      false,
      brand.profile,
      [],
      [],
      JSON.stringify({
        url: targetUrl,
        pageKind,
        currentFields,
        findings,
        imagesMissingAlt: images
          .filter((i) => i.missingAlt)
          .map((i) => i.src),
      }),
    );
    prompt.systemPrompt = prompt.systemPrompt.replace(
      /Return JSON only:[^\n]*$/,
      'Return JSON only: { "heading": string (<=110 chars), "title": string (<=60 chars), "description": string (<=155 chars), "altSuggestions": [{ "src": string, "suggestedAlt": string }], "schemaAndContentPatch": string (concise Markdown/JSON-LD FAQ + targeted section improvement preserving the URL slug) }. Do not churn fields that are already strong.',
    );

    const call = await meteredAgencyCall(ws.id, "refresh", {
      ...prompt,
      modelId: resolveModelId(ws.id),
      maxOutputTokens: 900,
      temperature: 0.35,
    });
    if (!call.ok) {
      return NextResponse.json({ error: call.apiErrorDetail }, { status: call.status });
    }

    let optimized: {
      heading: string;
      title: string;
      description: string;
      altSuggestions: Array<{ src: string; suggestedAlt: string }>;
      schemaAndContentPatch: string;
    } = {
      heading: currentFields.heading || targetUrl,
      title: currentFields.title || currentFields.heading || targetUrl,
      description: currentFields.description || "",
      altSuggestions: images
        .filter((i) => i.missingAlt)
        .map((i) => ({
          src: i.src,
          suggestedAlt: `${currentFields.heading || brand.profile?.name || "Page"} visual illustration`,
        })),
      schemaAndContentPatch: call.outputText.trim(),
    };

    try {
      const parsed = JSON.parse(stripJsonFence(call.outputText)) as Partial<typeof optimized>;
      optimized = {
        heading:
          typeof parsed.heading === "string" && parsed.heading.trim()
            ? parsed.heading.trim().slice(0, 120)
            : optimized.heading,
        title:
          typeof parsed.title === "string" && parsed.title.trim()
            ? parsed.title.trim().slice(0, 70)
            : optimized.title,
        description:
          typeof parsed.description === "string" && parsed.description.trim()
            ? parsed.description.trim().slice(0, 170)
            : optimized.description,
        altSuggestions: Array.isArray(parsed.altSuggestions)
          ? parsed.altSuggestions.filter(
              (a) =>
                typeof a?.src === "string" &&
                typeof a?.suggestedAlt === "string",
            )
          : optimized.altSuggestions,
        schemaAndContentPatch:
          typeof parsed.schemaAndContentPatch === "string"
            ? parsed.schemaAndContentPatch
            : optimized.schemaAndContentPatch,
      };
    } catch {
      // Keep fallback parsed values
    }

    const admin = createSupabaseServiceClient();
    if (admin) {
      await admin.from("agency_specialist_work").insert({
        workspace_id: ws.id,
        specialist: "refresh",
        prompt_version: promptVersion,
        strategy_version: Number(brand.profile?.strategy_bus_version ?? 1) || 1,
        task: `On-Page Optimization · ${targetUrl}`,
        result: JSON.stringify(optimized, null, 2),
      });
    }

    return NextResponse.json({
      ok: true,
      optimized,
      tokenUsage: {
        modelId: call.modelId,
        totalTokens: call.totalTokens,
        shadowPaidCostUsd: call.shadowPaidCostUsd,
      },
    });
  }

  // -------------------------------------------------------------------------
  // DEFAULT ACTION: APPLY INTERNAL BUILDER PAGE REFRESH
  // -------------------------------------------------------------------------
  if (
    !input.publication ||
    typeof input.url !== "string" ||
    !input.before ||
    !input.after
  )
    return NextResponse.json(
      { error: "Review the existing page first." },
      { status: 400 },
    );
  const fields = (x: PageFields) => ({
    title: x.heading,
    seoTitle: x.title,
    seoDescription: x.description,
  });
  const saved = await ws.db.rpc("agency_refresh_page", {
    target: input.url,
    observed: input.publication,
    previous: fields(input.before),
    proposed: fields(input.after),
  });
  if (saved.error)
    return NextResponse.json(
      {
        error:
          "Could not apply this change. Check field lengths and reload to compare the latest page.",
      },
      { status: 409 },
    );
  revalidatePath(new URL(input.url).pathname);
  revalidatePath(
    new URL(input.url).pathname.split("/").slice(0, 3).join("/"),
    "layout",
  );
  return NextResponse.json({ ok: true });
}
