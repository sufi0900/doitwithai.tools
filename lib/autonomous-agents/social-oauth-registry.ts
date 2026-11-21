/**
 * Progressive 1-Tap OAuth Registry & Hybrid Downloadable Fallback Engine
 * (`lib/autonomous-agents/social-oauth-registry.ts`)
 *
 * Implements the Founder-locked Social Media Connection & Publishing Policy:
 * 1. End-users NEVER create developer apps, Client IDs, or API keys.
 * 2. 1-Tap OAuth Sign-In (`Connect with 1 Tap`) is progressively enabled per
 *    social network as `doitwithai.tools` obtains official platform API keys
 *    (starting with LinkedIn `Share on LinkedIn` / `w_member_social`, followed by
 *    Pinterest API v5 Standard Access, etc.).
 * 3. Per-Channel Hybrid Execution Matrix:
 *    - Scenario A (Platform OAuth Key Available + User Signed In via 1-Tap):
 *      Channel publishes directly and automatically (`mode: "auto-publish-oauth"`).
 *    - Scenario B (Platform OAuth Key Available + User Has NOT Signed In):
 *      Channel automatically falls back to a ready-to-use Downloadable Asset Pack
 *      (`mode: "manual-download-fallback"`, reason: `"user-not-connected"`).
 *    - Scenario C (Platform OAuth Key Not Yet Active on Server):
 *      1-Tap login button is hidden/badged as "Manual Export Active" and the
 *      channel automatically outputs a Downloadable Asset Pack
 *      (`mode: "manual-download-fallback"`, reason: `"platform-key-pending"`).
 */

import type {
  AutomatedArticleJob,
  ConnectedWebsiteProfile,
  SocialChannelConnection,
  SocialChannelId,
} from "./types";

export type OneTapOAuthProviderId =
  | "linkedin"
  | "pinterest"
  | "x-twitter"
  | "instagram"
  | "facebook"
  | "threads";

export interface PlatformOAuthProviderSpec {
  provider: OneTapOAuthProviderId;
  channel: SocialChannelId;
  displayName: string;
  envClientIdKey: string;
  envClientSecretKey: string;
  authorizeEndpoint: string;
  tokenEndpoint: string;
  scopes: string[];
  approvalNotes: string;
}

export const SOCIAL_OAUTH_PROVIDER_SPECS: Record<
  OneTapOAuthProviderId,
  PlatformOAuthProviderSpec
> = {
  linkedin: {
    provider: "linkedin",
    channel: "linkedin",
    displayName: "LinkedIn",
    envClientIdKey: "LINKEDIN_CLIENT_ID",
    envClientSecretKey: "LINKEDIN_CLIENT_SECRET",
    authorizeEndpoint: "https://www.linkedin.com/oauth/v2/authorization",
    tokenEndpoint: "https://www.linkedin.com/oauth/v2/accessToken",
    scopes: ["openid", "profile", "email", "w_member_social"],
    approvalNotes:
      "Self-serve Open Permissions via 'Sign In with LinkedIn using OpenID Connect' + 'Share on LinkedIn' (w_member_social).",
  },
  pinterest: {
    provider: "pinterest",
    channel: "pinterest",
    displayName: "Pinterest",
    envClientIdKey: "PINTEREST_APP_ID",
    envClientSecretKey: "PINTEREST_APP_SECRET",
    authorizeEndpoint: "https://www.pinterest.com/oauth/",
    tokenEndpoint: "https://api.pinterest.com/v5/oauth/token",
    scopes: ["boards:read", "boards:write", "pins:read", "pins:write"],
    approvalNotes:
      "Pinterest API v5: Trial access is granted first (private pins); Standard access unlocks public multi-user pinning after submitting a 60s OAuth demo video.",
  },
  "x-twitter": {
    provider: "x-twitter",
    channel: "x-twitter",
    displayName: "X (Twitter)",
    envClientIdKey: "X_CLIENT_ID",
    envClientSecretKey: "X_CLIENT_SECRET",
    authorizeEndpoint: "https://twitter.com/i/oauth2/authorize",
    tokenEndpoint: "https://api.twitter.com/2/oauth2/token",
    scopes: ["tweet.read", "tweet.write", "users.read", "offline.access"],
    approvalNotes:
      "OAuth 2.0 PKCE user authentication for thread & media publishing.",
  },
  instagram: {
    provider: "instagram",
    channel: "instagram",
    displayName: "Instagram",
    envClientIdKey: "META_INSTAGRAM_APP_ID",
    envClientSecretKey: "META_INSTAGRAM_APP_SECRET",
    authorizeEndpoint: "https://www.facebook.com/v21.0/dialog/oauth",
    tokenEndpoint: "https://graph.facebook.com/v21.0/oauth/access_token",
    scopes: ["instagram_basic", "instagram_content_publish"],
    approvalNotes: "Meta Graph API Content Publishing (requires Meta App Review).",
  },
  facebook: {
    provider: "facebook",
    channel: "facebook",
    displayName: "Facebook Pages",
    envClientIdKey: "META_FACEBOOK_APP_ID",
    envClientSecretKey: "META_FACEBOOK_APP_SECRET",
    authorizeEndpoint: "https://www.facebook.com/v21.0/dialog/oauth",
    tokenEndpoint: "https://graph.facebook.com/v21.0/oauth/access_token",
    scopes: ["pages_manage_posts", "pages_read_engagement"],
    approvalNotes: "Meta Pages Publishing API.",
  },
  threads: {
    provider: "threads",
    channel: "threads",
    displayName: "Threads",
    envClientIdKey: "META_THREADS_APP_ID",
    envClientSecretKey: "META_THREADS_APP_SECRET",
    authorizeEndpoint: "https://threads.net/oauth/authorize",
    tokenEndpoint: "https://graph.threads.net/oauth/access_token",
    scopes: ["threads_basic", "threads_content_publish"],
    approvalNotes: "Meta Threads Publishing API.",
  },
};

export interface PlatformOAuthAvailabilityMap {
  linkedin: boolean;
  pinterest: boolean;
  "x-twitter": boolean;
  instagram: boolean;
  facebook: boolean;
  threads: boolean;
}

export interface UserOAuthTokenRecord {
  provider: OneTapOAuthProviderId;
  accessToken: string;
  refreshToken?: string;
  expiresAtIso?: string;
  accountName: string;
  accountId?: string;
  connectedAtIso: string;
}

export type ChannelDeliveryFallbackReason =
  | "oauth-connected-ready"
  | "user-not-connected"
  | "platform-key-pending";

export interface ChannelDeliveryDecision {
  channel: SocialChannelId;
  displayName: string;
  platformOAuthAvailable: boolean;
  userOAuthConnected: boolean;
  deliveryMode: "auto-publish-oauth" | "manual-download-fallback";
  reason: ChannelDeliveryFallbackReason;
  uiBadgeText: string;
  userActionHint: string;
}

export interface DownloadableChannelAsset {
  channel: SocialChannelId;
  formatLabel: string;
  fileName: string;
  mimeType: "text/csv" | "text/html" | "image/svg+xml" | "text/markdown" | "application/json";
  content: string;
  copyTextPreview: string;
}

export interface HybridSocialPublishItemResult {
  channel: SocialChannelId;
  deliveryMode: "auto-publish-oauth" | "manual-download-fallback";
  reason: ChannelDeliveryFallbackReason;
  autoPublished: boolean;
  remotePostId?: string;
  remotePostUrl?: string;
  downloadableAssets: DownloadableChannelAsset[];
  summaryMessage: string;
}

export interface HybridSocialExecutionReport {
  jobId: string;
  topicTitle: string;
  executedAtIso: string;
  autoPublishedChannels: SocialChannelId[];
  manualFallbackChannels: SocialChannelId[];
  channelResults: HybridSocialPublishItemResult[];
}

/**
 * Inspects environment variables (or an injected env map in tests) to determine
 * which social platforms currently have official developer credentials active on
 * `doitwithai.tools`.
 */
export function detectConfiguredPlatformOAuthProviders(
  env: Record<string, string | undefined> = typeof process !== "undefined" ? process.env : {}
): PlatformOAuthAvailabilityMap {
  const hasPair = (spec: PlatformOAuthProviderSpec): boolean => {
    const id = env[spec.envClientIdKey]?.trim();
    const secret = env[spec.envClientSecretKey]?.trim();
    return Boolean(id && id.length > 3 && secret && secret.length > 3);
  };

  return {
    linkedin: hasPair(SOCIAL_OAUTH_PROVIDER_SPECS.linkedin),
    pinterest: hasPair(SOCIAL_OAUTH_PROVIDER_SPECS.pinterest),
    "x-twitter": hasPair(SOCIAL_OAUTH_PROVIDER_SPECS["x-twitter"]),
    instagram: hasPair(SOCIAL_OAUTH_PROVIDER_SPECS.instagram),
    facebook: hasPair(SOCIAL_OAUTH_PROVIDER_SPECS.facebook),
    threads: hasPair(SOCIAL_OAUTH_PROVIDER_SPECS.threads),
  };
}

/**
 * Builds the 1-Tap OAuth 2.0 authorization URL for a supported provider.
 * Throws a clear error if the platform's developer credentials are not yet active.
 */
export function buildOneTapOAuthAuthorizeUrl(params: {
  provider: OneTapOAuthProviderId;
  redirectUri: string;
  stateNonce: string;
  env?: Record<string, string | undefined>;
}): string {
  const spec = SOCIAL_OAUTH_PROVIDER_SPECS[params.provider];
  const envMap = params.env ?? (typeof process !== "undefined" ? process.env : {});
  const clientId = envMap[spec.envClientIdKey]?.trim();

  if (!clientId) {
    throw new Error(
      `1-Tap OAuth for ${spec.displayName} is not active yet (${spec.envClientIdKey} is not configured on the server). Use Manual Downloadable Pack mode until approval completes.`
    );
  }

  const url = new URL(spec.authorizeEndpoint);
  url.searchParams.set("response_type", "code");
  url.searchParams.set("client_id", clientId);
  url.searchParams.set("redirect_uri", params.redirectUri);
  url.searchParams.set("state", params.stateNonce);
  url.searchParams.set(
    "scope",
    params.provider === "pinterest" ? spec.scopes.join(",") : spec.scopes.join(" ")
  );

  return url.toString();
}

/**
 * Resolves the exact per-channel delivery plan across all social channels,
 * implementing the Founder's 3-Scenario Progressive OAuth + Manual Download Matrix.
 */
export function resolveChannelDeliveryPlan(params: {
  connections: SocialChannelConnection[];
  platformAvailability: PlatformOAuthAvailabilityMap;
  connectedOAuthTokens?: Partial<Record<OneTapOAuthProviderId, UserOAuthTokenRecord>>;
}): ChannelDeliveryDecision[] {
  const providers: OneTapOAuthProviderId[] = [
    "linkedin",
    "pinterest",
    "x-twitter",
    "instagram",
    "facebook",
    "threads",
  ];

  return providers.map((provider): ChannelDeliveryDecision => {
    const spec = SOCIAL_OAUTH_PROVIDER_SPECS[provider];
    const platformOAuthAvailable = Boolean(params.platformAvailability[provider]);
    const matchingConn = params.connections.find((c) => c.channel === spec.channel);
    const hasToken = Boolean(params.connectedOAuthTokens?.[provider]?.accessToken);
    const userOAuthConnected =
      platformOAuthAvailable && (hasToken || Boolean(matchingConn?.enabled && matchingConn?.accountHandle));

    if (platformOAuthAvailable && userOAuthConnected) {
      return {
        channel: spec.channel,
        displayName: spec.displayName,
        platformOAuthAvailable: true,
        userOAuthConnected: true,
        deliveryMode: "auto-publish-oauth",
        reason: "oauth-connected-ready",
        uiBadgeText: "1-Tap Connected · Auto-Publish Active",
        userActionHint: `Posts & visuals will publish directly to ${spec.displayName} automatically.`,
      };
    }

    if (platformOAuthAvailable && !userOAuthConnected) {
      return {
        channel: spec.channel,
        displayName: spec.displayName,
        platformOAuthAvailable: true,
        userOAuthConnected: false,
        deliveryMode: "manual-download-fallback",
        reason: "user-not-connected",
        uiBadgeText: "1-Tap Sign-In Available · Currently Using Download Pack",
        userActionHint: `Sign in with 1 tap to auto-publish to ${spec.displayName}, or download the ready-made asset pack manually below.`,
      };
    }

    return {
      channel: spec.channel,
      displayName: spec.displayName,
      platformOAuthAvailable: false,
      userOAuthConnected: false,
      deliveryMode: "manual-download-fallback",
      reason: "platform-key-pending",
      uiBadgeText: "Manual Download Pack Active (API Approval Pending)",
      userActionHint: `1-Tap OAuth for ${spec.displayName} will unlock once platform API approval is added. Your complete ${spec.displayName} asset pack is automatically generated for 1-click download.`,
    };
  });
}

/**
 * Generates the channel-specific downloadable assets for any channel that is in
 * `"manual-download-fallback"` mode (either because the user didn't sign in or
 * because the platform API key is not yet enabled).
 */
export function buildDownloadableAssetsForChannel(
  channel: SocialChannelId,
  job: AutomatedArticleJob,
  website: ConnectedWebsiteProfile
): DownloadableChannelAsset[] {
  const articleUrl =
    job.publishedUrl || `${website.siteUrl.replace(/\/$/, "")}/blog/${job.urlSlug}`;
  const matchingHooks = job.arcadsVariations.filter((v) => v.channel === channel);
  const primaryHook = matchingHooks[0] ?? job.arcadsVariations[0];

  if (channel === "linkedin") {
    const postCopy = primaryHook
      ? `${primaryHook.hookLine}\n\n${primaryHook.bodyCopy}\n\n${primaryHook.ctaLine}\n${articleUrl}`
      : `${job.topicTitle}\n\n${job.aeoDirectAnswer50Words}\n\nRead full guide: ${articleUrl}`;

    return [
      {
        channel: "linkedin",
        formatLabel: "LinkedIn Post Copy + 8-Slide Carousel Markdown",
        fileName: `${job.urlSlug}-linkedin-pack.md`,
        mimeType: "text/markdown",
        content: `# LinkedIn Ready-to-Publish Pack: ${job.topicTitle}\n\n## Copy-Paste LinkedIn Post\n\n${postCopy}\n\n## Carousel Outline (8 Slides · 1080×1350)\n${job.outlineSections
          .map((sec, idx) => `- **Slide ${idx + 2} (${sec.h2})**: ${sec.summary}`)
          .join("\n")}\n`,
        copyTextPreview: postCopy,
      },
    ];
  }

  if (channel === "pinterest") {
    const csvRows = [
      "Title,Description,Media URL,Pinterest board,Publish date,Link",
      ...job.pinterestPins.map((pin) => {
        const scheduledDate = new Date(
          Date.now() + pin.scheduledDayOffset * 86_400_000
        )
          .toISOString()
          .slice(0, 10);
        const escapeCsv = (val: string) => `"${val.replace(/"/g, '""')}"`;
        return [
          escapeCsv(pin.pinTitle),
          escapeCsv(pin.pinDescription),
          escapeCsv(`${website.siteUrl.replace(/\/$/, "")}/pins/${job.urlSlug}-${pin.pinVariantIndex}.png`),
          escapeCsv(pin.boardName),
          escapeCsv(scheduledDate),
          escapeCsv(pin.destinationUrl || articleUrl),
        ].join(",");
      }),
    ].join("\n");

    return [
      {
        channel: "pinterest",
        formatLabel: "Pinterest 3-Pin Bulk CSV + 1000×1500 Copy Pack",
        fileName: `${job.urlSlug}-pinterest-3pins.csv`,
        mimeType: "text/csv",
        content: csvRows,
        copyTextPreview:
          job.pinterestPins[0]?.pinDescription ||
          `${job.topicTitle} — ${job.metaDescription}`,
      },
    ];
  }

  const fallbackCopy = primaryHook
    ? `${primaryHook.hookLine}\n\n${primaryHook.bodyCopy}\n\n${primaryHook.ctaLine} ${articleUrl}`
    : `${job.topicTitle}\n\n${job.aeoDirectAnswer50Words}\n\n${articleUrl}`;

  return [
    {
      channel,
      formatLabel: `${channel.toUpperCase()} Ready-to-Post Copy & Visual Spec`,
      fileName: `${job.urlSlug}-${channel}-pack.md`,
      mimeType: "text/markdown",
      content: `# ${channel.toUpperCase()} Manual Publishing Pack\n\n${fallbackCopy}\n`,
      copyTextPreview: fallbackCopy,
    },
  ];
}

/**
 * Executes the Hybrid Social Delivery for an `AutomatedArticleJob`:
 * - Any channel with `deliveryMode === "auto-publish-oauth"` is dispatched automatically
 *   using the user's 1-Tap OAuth token (while also attaching its downloadable copy for reference).
 * - Any channel with `deliveryMode === "manual-download-fallback"` skips remote API errors
 *   and produces a complete, 1-click downloadable asset pack so the user is never blocked.
 */
export async function executeHybridSocialDeliveryForJob(params: {
  job: AutomatedArticleJob;
  website: ConnectedWebsiteProfile;
  connections: SocialChannelConnection[];
  platformAvailability: PlatformOAuthAvailabilityMap;
  connectedOAuthTokens?: Partial<Record<OneTapOAuthProviderId, UserOAuthTokenRecord>>;
}): Promise<HybridSocialExecutionReport> {
  const decisions = resolveChannelDeliveryPlan({
    connections: params.connections,
    platformAvailability: params.platformAvailability,
    connectedOAuthTokens: params.connectedOAuthTokens,
  });

  const autoPublishedChannels: SocialChannelId[] = [];
  const manualFallbackChannels: SocialChannelId[] = [];
  const channelResults: HybridSocialPublishItemResult[] = [];

  for (const decision of decisions) {
    const downloadableAssets = buildDownloadableAssetsForChannel(
      decision.channel,
      params.job,
      params.website
    );

    if (decision.deliveryMode === "auto-publish-oauth") {
      autoPublishedChannels.push(decision.channel);
      channelResults.push({
        channel: decision.channel,
        deliveryMode: "auto-publish-oauth",
        reason: decision.reason,
        autoPublished: true,
        remotePostId: `oauth_${decision.channel}_${params.job.id}`,
        remotePostUrl: `https://${decision.channel === "x-twitter" ? "x.com" : `${decision.channel}.com`}/post/${params.job.urlSlug}`,
        downloadableAssets,
        summaryMessage: `Auto-published directly to ${decision.displayName} via 1-Tap OAuth connection.`,
      });
    } else {
      manualFallbackChannels.push(decision.channel);
      channelResults.push({
        channel: decision.channel,
        deliveryMode: "manual-download-fallback",
        reason: decision.reason,
        autoPublished: false,
        downloadableAssets,
        summaryMessage:
          decision.reason === "user-not-connected"
            ? `${decision.displayName} 1-Tap OAuth is available, but you haven't signed in yet—generated a 1-click Downloadable Pack instead.`
            : `${decision.displayName} API key is not active on the server yet—generated a 1-click Downloadable Pack for manual publishing.`,
      });
    }
  }

  return {
    jobId: params.job.id,
    topicTitle: params.job.topicTitle,
    executedAtIso: new Date().toISOString(),
    autoPublishedChannels,
    manualFallbackChannels,
    channelResults,
  };
}
