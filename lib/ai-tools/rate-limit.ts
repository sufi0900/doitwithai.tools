import { createHash } from "node:crypto";
import { Redis } from "@upstash/redis";
import type { NextRequest } from "next/server";

type LimitResult = {
  allowed: boolean;
  remaining: number;
  retryAfterSeconds: number;
};

type LimitOptions = {
  dailyLimit?: number;
  burstLimit?: number;
};

type WindowValue = { count: number; expiresAt: number };

const memoryStore = new Map<string, WindowValue>();
let redis: Redis | null | undefined;

function getRedis() {
  if (redis !== undefined) return redis;

  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  redis = url && token ? new Redis({ url, token }) : null;
  return redis;
}

function getClientKey(request: NextRequest) {
  const forwarded = request.headers
    .get("x-forwarded-for")
    ?.split(",")[0]
    ?.trim();
  const address = forwarded || request.headers.get("x-real-ip") || "unknown";
  return createHash("sha256")
    .update(address)
    .digest("hex")
    .slice(0, 24);
}

async function incrementWindow(key: string, ttlSeconds: number) {
  const activeRedis = getRedis();

  if (activeRedis) {
    const count = await activeRedis.incr(key);
    if (count === 1) await activeRedis.expire(key, ttlSeconds);
    const ttl = await activeRedis.ttl(key);
    if (ttl < 0) await activeRedis.expire(key, ttlSeconds);
    return { count, ttl: ttl > 0 ? ttl : ttlSeconds };
  }

  if (process.env.NODE_ENV === "production") throw new Error("Shared Redis rate limiting is required in production");

  const now = Date.now();
  const existing = memoryStore.get(key);
  const next =
    !existing || existing.expiresAt <= now
      ? { count: 1, expiresAt: now + ttlSeconds * 1_000 }
      : { ...existing, count: existing.count + 1 };

  if (!existing && memoryStore.size >= 10_000) {
    for (const [entryKey, value] of memoryStore) if (value.expiresAt <= now) memoryStore.delete(entryKey);
    if (memoryStore.size >= 10_000) throw new Error("Local rate-limit capacity exceeded");
  }
  memoryStore.set(key, next);

  if (memoryStore.size > 2_000) {
    for (const [entryKey, value] of memoryStore) {
      if (value.expiresAt <= now) memoryStore.delete(entryKey);
    }
  }

  return {
    count: next.count,
    ttl: Math.max(1, Math.ceil((next.expiresAt - now) / 1_000)),
  };
}

function validLimit(fallback: number, value: number) {
  return Number.isFinite(value) && value >= 1 ? Math.floor(value) : fallback;
}

export async function checkAiToolRateLimit(
  request: NextRequest,
  toolId: string,
  options: LimitOptions = {},
): Promise<LimitResult> {
  const clientKey = getClientKey(request);

  const dailyLimit = validLimit(
    5,
    options.dailyLimit ?? Number(process.env.AI_TOOLS_DAILY_LIMIT || 5),
  );

  const burstLimit = validLimit(
    3,
    options.burstLimit ?? Number(process.env.AI_TOOLS_BURST_LIMIT || 3),
  );

  const safeToolId = toolId.toLowerCase().replace(/[^a-z0-9-]/g, "");

  if (!safeToolId) {
    throw new Error("A valid AI tool id is required");
  }

  const [daily, burst] = await Promise.all([
    incrementWindow(`ai-tools:${safeToolId}:day:${clientKey}`, 86_400),
    incrementWindow(`ai-tools:${safeToolId}:burst:${clientKey}`, 600),
  ]);

  const allowed = daily.count <= dailyLimit && burst.count <= burstLimit;

  const retryAfterSeconds =
    daily.count > dailyLimit
      ? daily.ttl
      : burst.count > burstLimit
        ? burst.ttl
        : 0;

  return {
    allowed,
    remaining: Math.max(
      0,
      Math.min(dailyLimit - daily.count, burstLimit - burst.count),
    ),
    retryAfterSeconds,
  };
}

export function checkMetaTitleRateLimit(request: NextRequest) {
  return checkAiToolRateLimit(request, "meta-title");
}
