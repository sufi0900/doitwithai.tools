import type { SupabaseClient } from "@supabase/supabase-js";
export const accountsConfigured = Boolean(
  process.env.NEXT_PUBLIC_SUPABASE_URL &&
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
);
let pending: Promise<SupabaseClient> | undefined;
export function browserAccounts() {
  if (!accountsConfigured) return Promise.resolve(null);
  return (pending ||= import("@supabase/supabase-js").then(({ createClient }) =>
    createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
      {
        auth: {
          flowType: "pkce",
          detectSessionInUrl: false,
          persistSession: true,
          autoRefreshToken: true,
        },
      },
    ),
  ));
}
export function safeReturnPath(value: string | null) {
  if (
    !value ||
    value.length > 4096 ||
    /[\\\u0000-\u0020]/.test(value) ||
    !/^\/tools(?:\/|\?|#|$)/.test(value)
  )
    return "/tools";
  const target = new URL(value, "https://return.invalid");
  if (
    target.origin !== "https://return.invalid" ||
    !/^\/tools(?:\/|$)/.test(target.pathname)
  )
    return "/tools";
  return value;
}
