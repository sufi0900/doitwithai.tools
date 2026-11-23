import { NextResponse, type NextRequest } from "next/server";
import { COOKIE_NAME, getExpectedPasskeys } from "@/lib/founder-hub/auth";

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
