import { NextResponse, type NextRequest } from "next/server";

/**
 * CORS for tool APIs so downloaded portable tools (opened from file:// or
 * embedded on a customer's own site) can call the live DoItWithAI cloud.
 * No cookies/credentials are allowed cross-origin, only plain JSON requests.
 */
const CORS_HEADERS: Record<string, string> = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
  "Access-Control-Max-Age": "86400",
};

const NOINDEX_HEADERS: Record<string, string> = {
  "X-Robots-Tag": "noindex, nofollow, noarchive, nosnippet, noimageindex",
  "Cache-Control": "private, no-store, no-cache, must-revalidate",
};

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Clean up malformed relative links indexed as /https:... or /http:... in GSC
  if (/^\/https?:/i.test(pathname)) {
    const rawTarget = pathname.replace(/^\/+/, "");
    const fixedScheme = rawTarget.replace(/^(https?):\/?(?!\/)/i, "$1://");
    let destination = "/";
    if (/^https?:\/\/(?:www\.)?doitwithai\.tools(?=[/?#]|$)/i.test(fixedScheme)) {
      destination =
        fixedScheme.replace(/^https?:\/\/(?:www\.)?doitwithai\.tools/i, "") || "/";
    }
    const redirectUrl = new URL(destination, request.url);
    const res = NextResponse.redirect(redirectUrl, 301);
    res.headers.set("X-Robots-Tag", "noindex, nofollow");
    return res;
  }

  if (
    pathname.startsWith("/founder-hub") ||
    pathname.startsWith("/api/founder-hub") ||
    pathname === "/studio" ||
    pathname.startsWith("/studio/") ||
    pathname.startsWith("/api/studio") ||
    pathname === "/auth" ||
    pathname.startsWith("/auth/")
  ) {
    const response = NextResponse.next();
    for (const [key, value] of Object.entries(NOINDEX_HEADERS)) {
      response.headers.set(key, value);
    }
    return response;
  }

  if (request.method === "OPTIONS") {
    return new NextResponse(null, { status: 204, headers: CORS_HEADERS });
  }
  const response = NextResponse.next();
  for (const [key, value] of Object.entries(CORS_HEADERS)) {
    response.headers.set(key, value);
  }
  return response;
}

export const config = {
  matcher: [
    "/https\\::path*",
    "/http\\::path*",
    "/studio",
    "/studio/:path*",
    "/api/studio/:path*",
    "/auth",
    "/auth/:path*",
    "/founder-hub",
    "/founder-hub/:path*",
    "/api/founder-hub/:path*",
    "/api/ai-tools/:path*",
    "/api/tools/:path*",
    "/api/indexnow/:path*",
    "/api/ai-assistant/:path*",
  ],
};
