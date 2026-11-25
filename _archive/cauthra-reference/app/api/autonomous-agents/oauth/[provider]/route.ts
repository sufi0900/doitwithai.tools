import { NextRequest, NextResponse } from "next/server";
import {
  buildOneTapOAuthAuthorizeUrl,
  detectConfiguredPlatformOAuthProviders,
  SOCIAL_OAUTH_PROVIDER_SPECS,
  type OneTapOAuthProviderId,
} from "@/lib/autonomous-agents/social-oauth-registry";

/**
 * GET /api/autonomous-agents/oauth/[provider]
 *
 * Supports two actions for progressive 1-tap social sign-in:
 * 1. Initiate 1-Tap OAuth Redirect (`/api/autonomous-agents/oauth/linkedin?action=connect`)
 * 2. Handle OAuth Callback (`/api/autonomous-agents/oauth/linkedin?code=...&state=...`)
 *    and redirect back to `/ai-content-writer/automation?oauth_connected=linkedin`.
 */
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ provider: string }> }
) {
  const { provider } = await context.params;
  if (!(provider in SOCIAL_OAUTH_PROVIDER_SPECS)) {
    return NextResponse.json(
      {
        ok: false,
        error: `Unsupported social OAuth provider: ${provider}`,
      },
      { status: 400 }
    );
  }

  const providerId = provider as OneTapOAuthProviderId;
  const availability = detectConfiguredPlatformOAuthProviders();
  const origin = request.nextUrl.origin;
  const redirectUri = `${origin}/api/autonomous-agents/oauth/${providerId}`;
  const code = request.nextUrl.searchParams.get("code");

  if (!availability[providerId]) {
    return NextResponse.json(
      {
        ok: false,
        provider: providerId,
        platformOAuthAvailable: false,
        fallbackMode: "manual-download-fallback",
        message: `${SOCIAL_OAUTH_PROVIDER_SPECS[providerId].displayName} 1-Tap OAuth is not active on the server yet. Campaigns will automatically generate downloadable asset packs for ${SOCIAL_OAUTH_PROVIDER_SPECS[providerId].displayName}.`,
      },
      { status: 200 }
    );
  }

  if (code) {
    const returnUrl = new URL("/ai-content-writer/automation", origin);
    returnUrl.searchParams.set("oauth_connected", providerId);
    return NextResponse.redirect(returnUrl.toString());
  }

  const stateNonce = `doitwithai_${providerId}_${Date.now()}`;
  const authorizeUrl = buildOneTapOAuthAuthorizeUrl({
    provider: providerId,
    redirectUri,
    stateNonce,
  });

  return NextResponse.redirect(authorizeUrl);
}
