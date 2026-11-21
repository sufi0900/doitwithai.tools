/**
 * Phase 5 & 5B: External CMS & Hybrid Progressive 1-Tap OAuth + Downloadable Fallback Publisher
 * (`lib/autonomous-agents/publishers/external-cms-publisher.ts`).
 *
 * Enforces `copilot-review-queue` vs `confidence-gated-90` guardrails and implements
 * the Founder-locked 3-Scenario Social Delivery Policy:
 * - Scenario 1: Platform API key is active on server (e.g., LinkedIn), but user has NOT connected
 *   -> automatically falls back to generating a 1-click Downloadable Asset Pack.
 * - Scenario 2: User connects LinkedIn via 1-Tap OAuth, leaves Pinterest / X unconnected
 *   -> LinkedIn auto-publishes directly while Pinterest / X generate Downloadable Asset Packs.
 * - Scenario 3: Platform API key is pending approval -> channel operates in Manual Downloadable
 *   Pack Mode automatically with zero errors or user friction.
 */

import { buildCompleteJobExportBundle } from "../pinterest-carousel-exporter";
import {
  detectConfiguredPlatformOAuthProviders,
  executeHybridSocialDeliveryForJob,
  type HybridSocialExecutionReport,
  type OneTapOAuthProviderId,
  type PlatformOAuthAvailabilityMap,
  type UserOAuthTokenRecord,
} from "../social-oauth-registry";
import type {
  AutomatedArticleJob,
  AutopilotApprovalMode,
  ConnectedWebsiteProfile,
  SocialChannelConnection,
  SocialChannelId,
  SocialConnectorMode,
  WebsitePublishingMode,
} from "../types";

export interface ExternalPublishDispatchInput {
  job: AutomatedArticleJob;
  website: ConnectedWebsiteProfile;
  approvalMode: AutopilotApprovalMode;
  confidenceThreshold?: number;
  socialConnections?: SocialChannelConnection[];
  platformOAuthAvailability?: PlatformOAuthAvailabilityMap;
  connectedOAuthTokens?: Partial<Record<OneTapOAuthProviderId, UserOAuthTokenRecord>>;
  fetchImpl?: typeof fetch;
}

export interface SocialChannelDispatchItem {
  channel: SocialChannelId;
  connectorMode: SocialConnectorMode;
  status: "scheduled" | "staged";
  deliveryMode?: "auto-publish-oauth" | "manual-download-fallback";
  payloadPreview: Record<string, unknown>;
}

export interface ExternalPublishDispatchResult {
  ok: boolean;
  mode: WebsitePublishingMode;
  effectiveStatus: "published" | "draft" | "staged";
  passedConfidenceGate: boolean;
  targetUrl: string;
  cmsResponseStatus?: number;
  socialDispatched: SocialChannelDispatchItem[];
  hybridSocialReport: HybridSocialExecutionReport;
  message: string;
  dispatchedAtIso: string;
}

function escapeHtml(s: string): string {
  return String(s || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function encodeBase64Utf8(value: string): string {
  if (typeof Buffer !== "undefined") {
    return Buffer.from(value, "utf8").toString("base64");
  }
  if (typeof btoa === "function") {
    return btoa(unescape(encodeURIComponent(value)));
  }
  return "";
}

function isUsableSecret(secret: string | undefined): secret is string {
  const s = String(secret || "").trim();
  return s.length >= 4 && !s.includes("***") && !s.includes("••••");
}

function compileHtmlArticleForCms(
  job: AutomatedArticleJob,
  website: ConnectedWebsiteProfile,
  bundle: ReturnType<typeof buildCompleteJobExportBundle>,
): string {
  const sectionsHtml = job.outlineSections
    .map((sec, idx) => {
      const svg = bundle.sectionInfographicSvgs[idx]?.svg || "";
      const pts = sec.points
        .map(
          (p) =>
            `<li><strong>${escapeHtml(p.badge)} · ${escapeHtml(p.title)}</strong>: ${escapeHtml(p.detail)}</li>`,
        )
        .join("");
      return `<section>
  <h2>${escapeHtml(sec.h2)}</h2>
  <p>${escapeHtml(sec.summary)}</p>
  ${svg ? `<figure>${svg}</figure>` : ""}
  <ul>${pts}</ul>
</section>`;
    })
    .join("\n");

  const toolUrl =
    website.installedTools.find((t) => t.slug === job.matchedInternalToolSlug)?.url ||
    `${website.siteUrl.replace(/\/$/, "")}/tools/${job.matchedInternalToolSlug || "blog-section-infographic-generator"}`;

  return `<article>
  <p><strong>Direct Answer:</strong> ${escapeHtml(job.aeoDirectAnswer50Words)}</p>
  ${sectionsHtml}
  <p><strong>Recommended Tool:</strong> <a href="${escapeHtml(toolUrl)}">${escapeHtml(job.matchedInternalToolTitle || website.siteName)}</a></p>
  <script type="application/ld+json">${JSON.stringify(bundle.jsonLdSchema)}</script>
</article>`;
}

/**
 * Builds the exact WordPress REST API v2 request payload (`POST /wp-json/wp/v2/posts`).
 */
export function buildWordPressRestPostPayload(
  job: AutomatedArticleJob,
  website: ConnectedWebsiteProfile,
  effectiveStatus: "publish" | "draft",
): {
  endpoint: string;
  headers: Record<string, string>;
  body: Record<string, unknown>;
} {
  const bundle = buildCompleteJobExportBundle(job, website);
  const baseEndpoint = (
    website.wordpressConfig?.endpointUrl || website.siteUrl
  ).replace(/\/$/, "");
  const endpoint = `${baseEndpoint}/wp-json/wp/v2/posts`;

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };
  const wpUser = website.wordpressConfig?.username?.trim();
  const wpPass = website.wordpressConfig?.appPasswordMasked;
  if (wpUser && isUsableSecret(wpPass)) {
    headers.Authorization = `Basic ${encodeBase64Utf8(`${wpUser}:${wpPass.trim()}`)}`;
  }

  return {
    endpoint,
    headers,
    body: {
      title: job.topicTitle,
      slug: job.urlSlug,
      status: effectiveStatus,
      excerpt: job.aeoDirectAnswer50Words,
      content: compileHtmlArticleForCms(job, website, bundle),
      meta: {
        _yoast_wpseo_title: job.metaTitle,
        _yoast_wpseo_metadesc: job.metaDescription,
      },
    },
  };
}

/**
 * Builds multi-channel social scheduling payloads for 1-Tap OAuth, Buffer MCP,
 * Postiz, and Pinterest API v5 (`POST /v5/pins`).
 */
export function buildSocialConnectorPayloads(
  job: AutomatedArticleJob,
  website: ConnectedWebsiteProfile,
  connections: SocialChannelConnection[] = [],
  scheduleMode: "scheduled" | "staged" = "staged",
): SocialChannelDispatchItem[] {
  const enabledConns = connections.filter((c) => c.enabled);
  const targets: SocialChannelConnection[] =
    enabledConns.length > 0
      ? enabledConns
      : [
          {
            channel: "pinterest",
            label: "Pinterest 2:3 Pins",
            enabled: true,
            connectorMode: "buffer-mcp",
            accountHandle: website.siteName,
            defaultBoardOrTarget: website.primaryNiche,
            bufferMcpConnected: true,
          },
          {
            channel: "linkedin",
            label: "LinkedIn Carousel",
            enabled: true,
            connectorMode: "buffer-mcp",
            accountHandle: website.siteName,
            defaultBoardOrTarget: "Company Feed",
            bufferMcpConnected: true,
          },
        ];

  return targets.map((conn): SocialChannelDispatchItem => {
    const variation =
      job.arcadsVariations.find((v) => v.channel === conn.channel) ||
      job.arcadsVariations[0];

    if (conn.channel === "pinterest") {
      return {
        channel: conn.channel,
        connectorMode: conn.connectorMode,
        status: scheduleMode,
        payloadPreview: {
          endpoint:
            conn.connectorMode === "pinterest-api-v5"
              ? "https://api.pinterest.com/v5/pins"
              : conn.connectorMode === "postiz-open-source"
                ? "/api/postiz/posts"
                : "https://mcp.buffer.com/mcp",
          pinsCount: job.pinterestPins.length,
          pins: job.pinterestPins.map((pin) => ({
            board_name: conn.defaultBoardOrTarget || pin.boardName,
            title: pin.pinTitle,
            description: pin.pinDescription,
            alt_text: pin.altText,
            link: pin.destinationUrl,
            dimensions: pin.dimensions,
            scheduledDayOffset: pin.scheduledDayOffset,
          })),
        },
      };
    }

    return {
      channel: conn.channel,
      connectorMode: conn.connectorMode,
      status: scheduleMode,
      payloadPreview: {
        endpoint:
          conn.connectorMode === "postiz-open-source"
            ? "/api/postiz/posts"
            : "https://mcp.buffer.com/mcp",
        accountHandle: conn.accountHandle,
        hookArchetype: variation?.archetype || "contrarian-data",
        text: variation
          ? `${variation.hookLine}\n\n${variation.bodyCopy}\n\n${variation.ctaLine}`
          : job.topicTitle,
        visualFormat: variation?.visualFormat || "linkedin-4x5-carousel",
        targetUrl:
          variation?.targetUrl ||
          `${website.siteUrl.replace(/\/$/, "")}/blog/${job.urlSlug}`,
      },
    };
  });
}

/**
 * Executes Phase 5 & 5B external CMS + Progressive 1-Tap OAuth & Downloadable Fallback
 * social dispatch while strictly enforcing the Confidence Gate (`>= threshold`).
 */
export async function dispatchExternalCmsAndSocialPublish(
  input: ExternalPublishDispatchInput,
): Promise<ExternalPublishDispatchResult> {
  const { job, website, approvalMode } = input;
  const threshold = input.confidenceThreshold ?? 90;
  const passedConfidenceGate =
    approvalMode === "confidence-gated-90" &&
    job.geoReadiness.overallScore >= threshold;

  const wpTargetStatus: "publish" | "draft" = passedConfidenceGate
    ? "publish"
    : "draft";
  const fetcher =
    input.fetchImpl || (typeof fetch === "function" ? fetch : undefined);
  const nowIso = new Date().toISOString();
  const baseUrl = website.siteUrl.replace(/\/$/, "");
  const fallbackTargetUrl =
    website.publishingMode === "internal-doitwithai-site" &&
    website.internalBuilderSlug
      ? `/p/${website.internalBuilderSlug}/blog/${job.urlSlug}`
      : `${baseUrl}/blog/${job.urlSlug}`;

  const platformAvailability =
    input.platformOAuthAvailability ?? detectConfiguredPlatformOAuthProviders();
  const hybridSocialReport = await executeHybridSocialDeliveryForJob({
    job,
    website,
    connections: input.socialConnections ?? [],
    platformAvailability,
    connectedOAuthTokens: input.connectedOAuthTokens,
  });

  const socialScheduleStatus: "scheduled" | "staged" = passedConfidenceGate
    ? "scheduled"
    : "staged";
  const socialDispatched = buildSocialConnectorPayloads(
    job,
    website,
    input.socialConnections,
    socialScheduleStatus,
  ).map((item): SocialChannelDispatchItem => {
    const channelRes = hybridSocialReport.channelResults.find(
      (r) => r.channel === item.channel,
    );
    return {
      ...item,
      deliveryMode: channelRes?.deliveryMode ?? "manual-download-fallback",
    };
  });

  const socialSummarySuffix =
    hybridSocialReport.autoPublishedChannels.length > 0
      ? ` Auto-published via 1-Tap OAuth: ${hybridSocialReport.autoPublishedChannels.join(", ")}; Downloadable packs ready for: ${hybridSocialReport.manualFallbackChannels.join(", ")}.`
      : ` Downloadable social asset packs ready for manual publishing (${hybridSocialReport.manualFallbackChannels.join(", ")}).`;

  // Path A: WordPress REST API v2
  if (website.publishingMode === "external-wordpress-rest") {
    const wpReq = buildWordPressRestPostPayload(job, website, wpTargetStatus);
    const hasAuth = Boolean(wpReq.headers.Authorization);
    if (fetcher && hasAuth) {
      try {
        const res = await fetcher(wpReq.endpoint, {
          method: "POST",
          headers: wpReq.headers,
          body: JSON.stringify(wpReq.body),
        });
        const data = (await res.json().catch(() => ({}))) as { link?: string };
        const effectiveStatus: ExternalPublishDispatchResult["effectiveStatus"] =
          res.ok
            ? wpTargetStatus === "publish"
              ? "published"
              : "draft"
            : "staged";
        return {
          ok: true,
          mode: website.publishingMode,
          effectiveStatus,
          passedConfidenceGate,
          targetUrl: data.link || fallbackTargetUrl,
          cmsResponseStatus: res.status,
          socialDispatched,
          hybridSocialReport,
          message:
            (res.ok
              ? `WordPress REST API accepted post with status "${wpTargetStatus}".`
              : `WordPress endpoint returned HTTP ${res.status}; saved to Workspace Staging Queue.`) +
            socialSummarySuffix,
          dispatchedAtIso: nowIso,
        };
      } catch {
        return {
          ok: true,
          mode: website.publishingMode,
          effectiveStatus: "staged",
          passedConfidenceGate,
          targetUrl: fallbackTargetUrl,
          socialDispatched,
          hybridSocialReport,
          message:
            `WordPress endpoint unreachable; article (${wpTargetStatus}) & social pack staged cleanly.` +
            socialSummarySuffix,
          dispatchedAtIso: nowIso,
        };
      }
    }

    return {
      ok: true,
      mode: website.publishingMode,
      effectiveStatus: wpTargetStatus === "publish" ? "draft" : "staged",
      passedConfidenceGate,
      targetUrl: fallbackTargetUrl,
      socialDispatched,
      hybridSocialReport,
      message:
        `WordPress Application Password not configured in sandbox; generated ready-to-push WP REST v2 payload (status: ${wpTargetStatus}) in Staging Queue.` +
        socialSummarySuffix,
      dispatchedAtIso: nowIso,
    };
  }

  // Path B: Custom Webhook JSON Dispatcher
  if (
    website.publishingMode === "external-custom-webhook" &&
    website.webhookUrl &&
    fetcher
  ) {
    const bundle = buildCompleteJobExportBundle(job, website);
    try {
      const res = await fetcher(website.webhookUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          event: "doitwithai.article.ready",
          effectiveStatus: passedConfidenceGate ? "published" : "draft",
          job: {
            id: job.id,
            title: job.topicTitle,
            slug: job.urlSlug,
            geoScore: job.geoReadiness.overallScore,
          },
          bundle: {
            articleMarkdown: bundle.articleMarkdown,
            jsonLdSchema: bundle.jsonLdSchema,
            sectionInfographicsCount: bundle.sectionInfographicSvgs.length,
            pinterestPinsCount: bundle.pinterestPins.length,
          },
          socialDispatched,
          hybridSocialReport,
        }),
      });
      return {
        ok: true,
        mode: website.publishingMode,
        effectiveStatus: res.ok
          ? passedConfidenceGate
            ? "published"
            : "draft"
          : "staged",
        passedConfidenceGate,
        targetUrl: fallbackTargetUrl,
        cmsResponseStatus: res.status,
        socialDispatched,
        hybridSocialReport,
        message:
          (res.ok
            ? `Dispatched webhook payload (HTTP ${res.status}) with ${bundle.sectionInfographicSvgs.length} SVG infographics and ${socialDispatched.length} social packs.`
            : `Webhook returned HTTP ${res.status}; article & social pack preserved in Staging Queue.`) +
          socialSummarySuffix,
        dispatchedAtIso: nowIso,
      };
    } catch {
      return {
        ok: true,
        mode: website.publishingMode,
        effectiveStatus: "staged",
        passedConfidenceGate,
        targetUrl: fallbackTargetUrl,
        socialDispatched,
        hybridSocialReport,
        message:
          "Webhook offline; preserved full article + social pack in Staging Queue." +
          socialSummarySuffix,
        dispatchedAtIso: nowIso,
      };
    }
  }

  // Path C: Workspace Staging Queue (zero-auth default for external websites)
  return {
    ok: true,
    mode: website.publishingMode,
    effectiveStatus: "staged",
    passedConfidenceGate,
    targetUrl: fallbackTargetUrl,
    socialDispatched,
    hybridSocialReport,
    message:
      `Staged Markdown/HTML, JSON-LD, 4 section SVGs & ${socialDispatched.length} social payloads in Workspace Staging Queue.` +
      socialSummarySuffix,
    dispatchedAtIso: nowIso,
  };
}
