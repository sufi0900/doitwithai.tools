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

  if (pathname.startsWith("/founder-hub") || pathname.startsWith("/api/founder-hub")) {
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
    "/founder-hub",
    "/founder-hub/:path*",
    "/api/founder-hub/:path*",
    "/api/ai-tools/:path*",
    "/api/tools/:path*",
    "/api/indexnow/:path*",
    "/api/ai-assistant/:path*",
  ],
};
