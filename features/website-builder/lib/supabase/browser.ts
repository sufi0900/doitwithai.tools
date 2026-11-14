"use client";

import { browserAccounts } from "@/features/tools-workspace/supabase";

/**
 * Reuses the unified doitwithai.tools Google OAuth / Supabase Auth session so users
 * only ever sign in once across SEO Tools, AI Content Writer, Do It AI, and Website Builder.
 */
export async function createSupabaseBrowserClient() {
  const client = await browserAccounts();
  if (!client) {
    throw new Error("Supabase is not configured in this environment.");
  }
  return client;
}

export async function getWebsiteAccessToken(): Promise<string | null> {
  try {
    const client = await browserAccounts();
    if (!client) return null;
    const { data } = await client.auth.getSession();
    return data.session?.access_token ?? null;
  } catch {
    return null;
  }
}

export async function authorizedWebsiteFetch(
  input: RequestInfo | URL,
  init: RequestInit = {},
): Promise<Response> {
  const token = await getWebsiteAccessToken();
  const headers = new Headers(init.headers);
  if (token && !headers.has("authorization")) {
    headers.set("Authorization", `Bearer ${token}`);
  }
  return fetch(input, { ...init, headers });
}
