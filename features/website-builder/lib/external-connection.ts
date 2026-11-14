import { createHash } from "node:crypto";
import { createClient } from "@supabase/supabase-js";
import { getSupabaseConfig } from "@/features/website-builder/lib/supabase/config";

export function connectionHash(key: string) { return createHash("sha256").update(key).digest("hex"); }
export function connectionAdmin() {
  const secret = (process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY);
  if (!secret) throw new Error("External connection is not configured.");
  return createClient(getSupabaseConfig().url, secret, { auth: { persistSession: false, autoRefreshToken: false } });
}
export function bearerHash(request: Request) {
  const authorization = request.headers.get("authorization") ?? "";
  const token = authorization.match(/^Bearer (vf_[a-f0-9]{64})$/)?.[1];
  return token ? connectionHash(token) : null;
}
