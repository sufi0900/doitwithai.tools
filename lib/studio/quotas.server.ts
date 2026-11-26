import { createHash } from "node:crypto";
import { Redis } from "@upstash/redis";
import { isStudioUnlimitedTesting } from "./studio-llm-gateway.server";
import type { PlanTierId } from "./types";

export interface PlanEntitlements {
  tier: PlanTierId;
  label: string;
  maxSites: number;
  monthlyArticles: number;
  dailySnapshots: number;
  customCnameAllowed: boolean;
}

export const UNLIMITED_TESTING_ENTITLEMENTS: PlanEntitlements = {
  tier: "pro_plus",
  label: "Preview Unlimited Testing",
  maxSites: 25,
  monthlyArticles: 9999,
  dailySnapshots: 9999,
  customCnameAllowed: true,
};

export const PLAN_ENTITLEMENTS: Record<PlanTierId, PlanEntitlements> = {
  free: {
    tier: "free",
    label: "Free ($0)",
    maxSites: 1,
    monthlyArticles: 1,
    dailySnapshots: 5,
    customCnameAllowed: false,
  },
  pro_creator: {
    tier: "pro_creator",
    label: "Pro Creator ($12/mo)",
    maxSites: 1,
    monthlyArticles: 20,
    dailySnapshots: 50,
    customCnameAllowed: false,
  },
  pro_plus: {
    tier: "pro_plus",
    label: "Pro Plus ($29/mo)",
    maxSites: 5,
    monthlyArticles: 50,
    dailySnapshots: 200,
    customCnameAllowed: true,
  },
};

type MemoryCounter = { count: number; expiresAt: number };
const localQuotaWindows = new Map<string, MemoryCounter>();
let cachedRedis: Redis | null | undefined;

function getQuotaRedis(): Redis | null {
  if (cachedRedis !== undefined) return cachedRedis;
  const url = process.env.UPSTASH_REDIS_REST_URL?.trim();
  const token = process.env.UPSTASH_REDIS_REST_TOKEN?.trim();
  cachedRedis = url && token ? new Redis({ url, token }) : null;
  return cachedRedis;
}

export function resolveRequestSubjectKey(request: Request, explicitUserId?: string): string {
  if (explicitUserId && explicitUserId.trim()) {
    return `usr:${createHash("sha256").update(explicitUserId.trim()).digest("hex").slice(0, 20)}`;
  }
  const forwarded = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim();
  const ip = forwarded || request.headers.get("x-real-ip") || "anon";
  return `ip:${createHash("sha256").update(ip).digest("hex").slice(0, 20)}`;
}

export function normalizePlanTier(raw: unknown): PlanTierId {
  if (raw === "pro_creator" || raw === "pro_plus") return raw;
  return "free";
}

async function incrementQuotaCounter(
  key: string,
  ttlSeconds: number,
): Promise<{ count: number; ttl: number }> {
  const redis = getQuotaRedis();
  if (redis) {
    try {
      const count = await redis.incr(key);
      if (count === 1) await redis.expire(key, ttlSeconds);
      return { count, ttl: ttlSeconds };
    } catch {
      // Graceful local window fallback if Redis hits plan limits
    }
  }

  const now = Date.now();
  const existing = localQuotaWindows.get(key);
  const next =
    !existing || existing.expiresAt <= now
      ? { count: 1, expiresAt: now + ttlSeconds * 1000 }
      : { count: existing.count + 1, expiresAt: existing.expiresAt };

  if (localQuotaWindows.size > 4000) {
    for (const [k, v] of localQuotaWindows) {
      if (v.expiresAt <= now) localQuotaWindows.delete(k);
    }
  }
  localQuotaWindows.set(key, next);
  return {
    count: next.count,
    ttl: Math.max(1, Math.ceil((next.expiresAt - now) / 1000)),
  };
}

export async function enforceStudioQuota(params: {
  request: Request;
  action: "snapshot" | "article";
  planTier: PlanTierId;
  userId?: string;
}): Promise<{
  allowed: boolean;
  used: number;
  limit: number;
  unlimitedTesting?: boolean;
  entitlements: PlanEntitlements;
  upgradeRequired?: PlanTierId;
  message?: string;
}> {
  if (isStudioUnlimitedTesting()) {
    return {
      allowed: true,
      used: 0,
      limit: UNLIMITED_TESTING_ENTITLEMENTS.monthlyArticles,
      unlimitedTesting: true,
      entitlements: UNLIMITED_TESTING_ENTITLEMENTS,
    };
  }

  const entitlements = PLAN_ENTITLEMENTS[params.planTier];
  const subject = resolveRequestSubjectKey(params.request, params.userId);
  const now = new Date();
  const dayKey = now.toISOString().slice(0, 10);
  const monthKey = `${now.getUTCFullYear()}-${String(now.getUTCMonth() + 1).padStart(2, "0")}`;

  if (params.action === "snapshot") {
    const limit = entitlements.dailySnapshots;
    const key = `studio:quota:snapshot:${dayKey}:${subject}`;
    const { count } = await incrementQuotaCounter(key, 86_400);
    if (count > limit) {
      return {
        allowed: false,
        used: count - 1,
        limit,
        entitlements,
        upgradeRequired: params.planTier === "free" ? "pro_creator" : "pro_plus",
        message: `Daily Site Snapshot limit reached (${limit}/day on ${entitlements.label}). Upgrade to Pro Creator for 50 daily site snapshots.`,
      };
    }
    return { allowed: true, used: count, limit, entitlements };
  }

  const limit = entitlements.monthlyArticles;
  const key = `studio:quota:article:${monthKey}:${subject}`;
  const { count } = await incrementQuotaCounter(key, 32 * 86_400);
  if (count > limit) {
    return {
      allowed: false,
      used: count - 1,
      limit,
      entitlements,
      upgradeRequired: params.planTier === "free" ? "pro_creator" : "pro_plus",
      message: `Monthly Studio Article limit reached (${limit}/month on ${entitlements.label}). Upgrade to Pro Creator ($12/mo or $79/yr) for 20 publish-ready articles/month.`,
    };
  }
  return { allowed: true, used: count, limit, entitlements };
}
