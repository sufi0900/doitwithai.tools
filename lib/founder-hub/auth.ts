import type { NextRequest } from "next/server";

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
