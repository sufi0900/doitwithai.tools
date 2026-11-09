import { NextResponse, type NextRequest } from "next/server";

export const COOKIE_NAME = "doitwithai_founder_session";
export const DEFAULT_FOUNDER_PASSKEY = "doitwithai-founder-2026";

export function getExpectedPasskeys(): string[] {
  const keys = new Set<string>([DEFAULT_FOUNDER_PASSKEY]);
  if (process.env.FOUNDER_DASHBOARD_KEY?.trim()) {
    keys.add(process.env.FOUNDER_DASHBOARD_KEY.trim());
  }
  if (process.env.NEXT_PUBLIC_FOUNDER_DASHBOARD_KEY?.trim()) {
    keys.add(process.env.NEXT_PUBLIC_FOUNDER_DASHBOARD_KEY.trim());
  }
  return Array.from(keys);
}

export function isAuthorizedFounderRequest(req: NextRequest): boolean {
  const cookieVal = req.cookies.get(COOKIE_NAME)?.value;
  const headerVal = req.headers.get("x-founder-key");
  const expected = getExpectedPasskeys();
  if (cookieVal && expected.includes(cookieVal)) return true;
  if (headerVal && expected.includes(headerVal)) return true;
  return false;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const passkey = String(body?.passkey || "").trim();
    const expected = getExpectedPasskeys();

    if (!passkey || !expected.includes(passkey)) {
      return NextResponse.json(
        { ok: false, error: "Invalid Founder Passkey. Access denied." },
        {
          status: 401,
          headers: {
            "X-Robots-Tag": "noindex, nofollow, noarchive",
          },
        }
      );
    }

    const res = NextResponse.json(
      { ok: true, authenticated: true },
      {
        status: 200,
        headers: {
          "X-Robots-Tag": "noindex, nofollow, noarchive",
        },
      }
    );

    res.cookies.set(COOKIE_NAME, passkey, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 60 * 60 * 24 * 30, // 30 days
    });

    return res;
  } catch {
    return NextResponse.json(
      { ok: false, error: "Authentication request failed." },
      { status: 500 }
    );
  }
}

export async function DELETE() {
  const res = NextResponse.json(
    { ok: true, authenticated: false },
    {
      status: 200,
      headers: {
        "X-Robots-Tag": "noindex, nofollow, noarchive",
      },
    }
  );
  res.cookies.delete(COOKIE_NAME);
  return res;
}
