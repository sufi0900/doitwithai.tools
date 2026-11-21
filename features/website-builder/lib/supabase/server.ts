import { createClient } from "@supabase/supabase-js";
import { createServerClient } from "@supabase/ssr";
import { cookies, headers } from "next/headers";
import {
  getSecretSupabaseKey,
  getSupabaseConfig,
  hasSupabaseConfig,
} from "./config";

function extractBearerToken(authorizationHeader: string | null): string | null {
  if (!authorizationHeader) return null;
  const match = authorizationHeader.match(/^Bearer\s+(.+)$/i);
  const token = match?.[1]?.trim();
  // Exclude external `vf_` connection keys from user JWT parsing.
  if (!token || token.startsWith("vf_")) return null;
  return token;
}

/**
 * Unified server Supabase client for Website Builder routes and RSCs.
 * Supports:
 * 1. `Authorization: Bearer <jwt>` from doitwithai.tools `browserAccounts()` PKCE sessions
 *    (so Postgres RLS `auth.uid()` and RPCs work natively).
 * 2. `@supabase/ssr` HTTP cookies when available.
 */
export async function createSupabaseServerClient() {
  const { url, key } = getSupabaseConfig();
  let bearer: string | null = null;
  try {
    const reqHeaders = headers();
    bearer = extractBearerToken(reqHeaders.get("authorization"));
  } catch {
    bearer = null;
  }

  if (bearer) {
    const client = createClient(url, key, {
      global: {
        headers: {
          Authorization: `Bearer ${bearer}`,
        },
      },
      auth: {
        persistSession: false,
        autoRefreshToken: false,
        detectSessionInUrl: false,
      },
    });
    const originalGetUser = client.auth.getUser.bind(client.auth);
    client.auth.getUser = (jwt?: string) => originalGetUser(jwt ?? bearer!);
    return client;
  }

  const cookieStore = cookies();
  return createServerClient(url, key, {
    cookies: {
      getAll: () => cookieStore.getAll(),
      setAll(values) {
        try {
          values.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options),
          );
        } catch {
          // Read-only cookie store in Server Components
        }
      },
    },
  });
}

/**
 * Public anon client without cookies/headers for static or ISR public `/p/[slug]` pages.
 */
export function createSupabasePublicClient() {
  if (!hasSupabaseConfig) return null;
  const { url, key } = getSupabaseConfig();
  return createClient(url, key, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false,
    },
  });
}

/**
 * Privileged service-role client for rate-metering and admin lookups.
 */
export function createSupabaseServiceClient() {
  if (!hasSupabaseConfig) return null;
  const { url } = getSupabaseConfig();
  const secret = getSecretSupabaseKey();
  if (!secret) return null;
  return createClient(url, secret, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false,
    },
  });
}
