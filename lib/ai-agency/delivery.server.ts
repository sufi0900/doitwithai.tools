import {
  CMS_PLATFORM_SPECS,
  buildCmsCurlPreview,
  compileCmsReadyHtmlDocument,
  type CmsArticlePayload,
  type CmsConnectionConfig,
  type CmsPublishExecutionResult,
} from "@/lib/ai-employee-agency/cms-connectors";

import { NextResponse } from "next/server";
import { createSupabaseServiceClient } from "@/features/website-builder/lib/supabase/server";

export async function deliverApprovedArticle(
  workspaceId: string,
  reviewId: string,
  config: CmsConnectionConfig,
) {
  const db = createSupabaseServiceClient();
  if (!db) throw Error("Delivery ledger unavailable.");
  const [review, brand] = await Promise.all([
    db
      .from("qa_audit_logs")
      .select("payload,created_at")
      .eq("workspace_id", workspaceId)
      .eq("id", reviewId)
      .maybeSingle(),
    db
      .from("tenant_brand_dna")
      .select("revision,approved_at,profile")
      .eq("workspace_id", workspaceId)
      .maybeSingle(),
  ]);
  const receipt = review.data?.payload;
  if (
    !brand.data?.approved_at ||
    receipt?.disposition !== "approved" ||
    receipt.revision !== brand.data.revision ||
    !receipt.article ||
    (brand.data.profile.is_ymyl !== false && receipt.signedBy !== workspaceId)
  )
    return NextResponse.json(
      { error: "A current approved scorecard is required." },
      { status: 409 },
    );
  const article: CmsArticlePayload = receipt.article;

  const wordpress =
    config.platformId === "wordpress-rest" &&
    config.wpUsername &&
    (config.wpApplicationPassword?.trim().length || 0) >= 8;
  const webhook =
    config.platformId === "universal-webhook" &&
    config.webhookEndpointUrl?.startsWith("https://");
  if (!wordpress && !webhook)
    return NextResponse.json(
      { error: "Configure a WordPress or HTTPS webhook destination." },
      { status: 400 },
    );
  const prior = await db
    .from("agency_production_runs")
    .select("cycle_date")
    .eq("id", receipt.workId)
    .eq("workspace_id", workspaceId)
    .maybeSingle();
  if (prior.error) throw Error("Delivery history unavailable.");
  const cycle = prior.data?.cycle_date || review.data!.created_at.slice(0, 10);
  const reservation = await db
    .from("agency_deliveries")
    .insert({
      workspace_id: workspaceId,
      review_id: reviewId,
      slug: article.slug,
      cycle_date: cycle,
    });
  if (reservation.error) {
    if (reservation.error.code !== "23505")
      throw Error("Could not reserve CMS delivery.");
    const saved = await db
      .from("agency_deliveries")
      .select("receipt")
      .eq("workspace_id", workspaceId)
      .eq("review_id", reviewId)
      .maybeSingle();
    return saved.data?.receipt
      ? NextResponse.json(saved.data.receipt)
      : NextResponse.json(
          {
            error:
              "Delivery already claimed. Check the destination before retrying.",
          },
          { status: 409 },
        );
  }
  async function confirm(result: CmsPublishExecutionResult) {
    const saved = await db!.rpc("agency_confirm_delivery", {
      owner: workspaceId,
      review: reviewId,
      result: { ...result, curlEquivalentSnippet: "" },
    });
    if (saved.error) throw Error("Cannot confirm delivery.");
    return NextResponse.json(result);
  }
  const spec =
    CMS_PLATFORM_SPECS[config.platformId] ||
    CMS_PLATFORM_SPECS["wordpress-rest"];
  const fullHtml =
    article.compiledHtmlBody || compileCmsReadyHtmlDocument(article);
  const postStatus: "published" | "draft" =
    config.autoPublishMode === "auto-publish-live" ? "published" : "draft";
  const cleanSiteUrl =
    config.siteUrl.replace(/\/$/, "") || "https://doitwithai.tools";
  const curlSnippet = buildCmsCurlPreview(config, article.slug, article.title);

  // 1. Live WordPress Application Passwords REST API (`POST /wp-json/wp/v2/posts`)
  if (
    config.platformId === "wordpress-rest" &&
    config.wpUsername &&
    config.wpApplicationPassword &&
    config.wpApplicationPassword.trim().length >= 8
  ) {
    try {
      const wpEndpoint = `${cleanSiteUrl}/wp-json/wp/v2/posts`;
      const authToken = Buffer.from(
        `${config.wpUsername.trim()}:${config.wpApplicationPassword.trim()}`,
      ).toString("base64");

      const wpRes = await fetch(wpEndpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Basic ${authToken}`,
        },
        body: JSON.stringify({
          title: article.title,
          slug: article.slug,
          status: postStatus === "published" ? "publish" : "draft",
          content: fullHtml,
          excerpt: article.aeoDirectAnswer50Words,
        }),
        redirect: "error",
        signal: AbortSignal.timeout(10000),
      });

      if (wpRes.ok) {
        const wpData = (await wpRes.json()) as {
          id?: number | string;
          link?: string;
          status?: string;
        };
        if (!wpData.id || wpData.status !== (postStatus === "published" ? "publish" : "draft"))
          throw Error("WordPress did not confirm the requested post status.");
        const result: CmsPublishExecutionResult = {
          ok: true,
          platformId: "wordpress-rest",
          platformDisplayName: spec.displayName,
          executedMode: "live-cms-api",
          postStatus,
          publishedOrStagedUrl: wpData?.link || "",
          externalPostId: String(wpData.id),
          timestampIso: new Date().toISOString(),
          diagnosticMessage: `Successfully delivered to WordPress via Application Passwords REST API (/wp-json/wp/v2/posts) as ${postStatus.toUpperCase()}.`,
          curlEquivalentSnippet: curlSnippet,
        };
        return await confirm(result);
      }
    } catch {
      // Return the delivery failure below.
    }
  }

  // 2. Live Universal Webhook POST (`POST https://your-domain.com/api/webhook`)
  if (
    config.platformId === "universal-webhook" &&
    config.webhookEndpointUrl &&
    config.webhookEndpointUrl.startsWith("http")
  ) {
    try {
      const whRes = await fetch(config.webhookEndpointUrl.trim(), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Idempotency-Key": workspaceId + "/" + article.slug + "/" + cycle,
          "X-DoItWithAI-Signature":
            config.webhookSecretHeader || "doitwithai-v3-verified",
        },
        body: JSON.stringify({
          event: "agency.article.ready",
          status: postStatus,
          article: {
            ...article,
            compiledHtmlBody: fullHtml,
          },
        }),
        redirect: "error",
        signal: AbortSignal.timeout(10000),
      });

      if (whRes.ok) {
        const received = await whRes.json().catch(() => null);
        if (!received?.id || received.status !== postStatus)
          throw Error("Awaiting confirmation from webhook.");
        const result: CmsPublishExecutionResult = {
          ok: true,
          platformId: "universal-webhook",
          platformDisplayName: spec.displayName,
          executedMode: "live-cms-api",
          postStatus,
          publishedOrStagedUrl:
            typeof received.url === "string" ? received.url : "",
          externalPostId: String(received.id),
          timestampIso: new Date().toISOString(),
          diagnosticMessage: `The configured webhook confirmed the reviewed article as ${postStatus}.`,
          curlEquivalentSnippet: curlSnippet,
        };
        return await confirm(result);
      }
    } catch {
      // Return the delivery failure below.
    }
  }

  return NextResponse.json(
    {
      ok: false,
      error:
        "CMS delivery was not confirmed. Check the connector and credentials.",
    },
    { status: 502 },
  );
}
