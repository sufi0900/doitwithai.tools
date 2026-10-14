import { randomUUID, createHash } from "node:crypto";
import { Redis } from "@upstash/redis";
import type { NextRequest } from "next/server";

type LimitResult = {
  allowed: boolean;
  remaining: number;
  retryAfterSeconds: number;
  release?: () => Promise<void>;
};

type LimitOptions = {
  dailyLimit?: number;
  burstLimit?: number;
  allowPlanLimitFallback?: boolean;
  refundFailures?: boolean;
};

type WindowValue = { count: number; expiresAt: number };

const memoryStore = new Map<string, WindowValue>();
let redis: Redis | null | undefined;
let planLimitCooldownUntil = 0;

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
  return createHash("sha256").update(address).digest("hex").slice(0, 24);
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

  if (process.env.NODE_ENV === "production")
    throw new Error("Shared Redis rate limiting is required in production");

  return incrementMemoryWindow(key, ttlSeconds);
}

function incrementMemoryWindow(key: string, ttlSeconds: number) {
  const now = Date.now();
  const existing = memoryStore.get(key);
  const next =
    !existing || existing.expiresAt <= now
      ? { count: 1, expiresAt: now + ttlSeconds * 1_000 }
      : { ...existing, count: existing.count + 1 };

  if (!existing && memoryStore.size >= 10_000) {
    for (const [entryKey, value] of memoryStore)
      if (value.expiresAt <= now) memoryStore.delete(entryKey);
    if (memoryStore.size >= 10_000)
      throw new Error("Local rate-limit capacity exceeded");
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

  let dailyLimit = validLimit(
    5,
    options.dailyLimit ?? Number(process.env.AI_TOOLS_DAILY_LIMIT || 5),
  );

  let burstLimit = validLimit(
    3,
    options.burstLimit ?? Number(process.env.AI_TOOLS_BURST_LIMIT || 3),
  );

  const safeToolId = toolId.toLowerCase().replace(/[^a-z0-9-]/g, "");

  if (!safeToolId) {
    throw new Error("A valid AI tool id is required");
  }

  let daily: { count: number; ttl: number };
  let burst: { count: number; ttl: number };
  let usedFallback = false;
  let fallbackKeys: string[] = [];
  let fallbackExpiries: number[] = [];
  const fallback = () => {
    usedFallback = true;
    dailyLimit = Math.min(dailyLimit, 2);
    burstLimit = 1;
    fallbackKeys = [
      `ai-tools:quota:${safeToolId}:day:${clientKey}`,
      `ai-tools:quota:${safeToolId}:burst:${clientKey}`,
    ];
    const now = Date.now();
    const current = fallbackKeys.map((key) => memoryStore.get(key));
    const counts = current.map((value) =>
      value && value.expiresAt > now ? value.count : 0,
    );
    // Reject before mutating either window. Refreshing cannot extend a lockout.
    if (counts[0] >= dailyLimit || counts[1] >= burstLimit) {
      return current.map((value, i) => ({
        count: counts[i] + 1,
        ttl:
          value && value.expiresAt > now
            ? Math.ceil((value.expiresAt - now) / 1000)
            : i === 0
              ? 86400
              : 600,
      }));
    }
    const windows = fallbackKeys.map((key, i) =>
      incrementMemoryWindow(key, i === 0 ? 86400 : 600),
    );
    fallbackExpiries = fallbackKeys.map(
      (key) => memoryStore.get(key)!.expiresAt,
    );
    return windows;
  };
  if (options.allowPlanLimitFallback && planLimitCooldownUntil > Date.now()) {
    [daily, burst] = fallback();
  } else {
    try {
      [daily, burst] = await Promise.all([
        incrementWindow(`ai-tools:${safeToolId}:day:${clientKey}`, 86_400),
        incrementWindow(`ai-tools:${safeToolId}:burst:${clientKey}`, 600),
      ]);
    } catch (cause) {
      // Only a confirmed plan-capacity failure activates the bounded fallback.
      // Missing credentials, authentication failures, and outages remain fail-closed.
      if (
        !options.allowPlanLimitFallback ||
        !(cause instanceof Error) ||
        !/database has reached.*(?:fixed )?plan limits/i.test(cause.message)
      )
        throw cause;
      planLimitCooldownUntil = Date.now() + 60_000;
      [daily, burst] = fallback();
    }
  }

  let released = false;
  const release = async () => {
    if (released) return;
    released = true;
    if (usedFallback) {
      fallbackKeys.forEach((key, i) => {
        const value = memoryStore.get(key);
        if (value && value.expiresAt === fallbackExpiries[i])
          memoryStore.set(key, {
            ...value,
            count: Math.max(0, value.count - 1),
          });
      });
    } else if (getRedis()) {
      // Do not recreate expired counters or decrement them below zero.
      await getRedis()!.eval(
        "for i=1,#KEYS do local n=tonumber(redis.call('GET',KEYS[i]) or '0'); if n>0 then redis.call('DECR',KEYS[i]); end end return 1",
        [
          `ai-tools:${safeToolId}:day:${clientKey}`,
          `ai-tools:${safeToolId}:burst:${clientKey}`,
        ],
        [],
      );
    } else {
      for (const key of [
        `ai-tools:${safeToolId}:day:${clientKey}`,
        `ai-tools:${safeToolId}:burst:${clientKey}`,
      ]) {
        const value = memoryStore.get(key);
        if (value)
          memoryStore.set(key, {
            ...value,
            count: Math.max(0, value.count - 1),
          });
      }
    }
  };
  const allowed = daily.count <= dailyLimit && burst.count <= burstLimit;

  if (!allowed && options.refundFailures && !usedFallback) {
    try {
      await release();
    } catch {}
  }

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
    ...(allowed && options.refundFailures ? { release } : {}),
  };
}

export function checkMetaTitleRateLimit(request: NextRequest) {
  return checkAiToolRateLimit(request, "meta-title");
}

// Classify infrastructure errors without returning Redis commands or credentials.
export function rateLimitFailure(cause: unknown) {
  const raw = cause instanceof Error ? cause.message : "";
  const reason = /database has reached.*(?:fixed )?plan limits/i.test(raw)
    ? "REDIS_PLAN_LIMIT"
    : /Shared Redis rate limiting is required/i.test(raw)
      ? "REDIS_NOT_CONFIGURED"
      : /unauthori[sz]ed|wrongpass|invalid.*token|forbidden/i.test(raw)
        ? "REDIS_AUTH_FAILED"
        : "REDIS_UNAVAILABLE";
  const requestId = randomUUID();
  process.stderr.write(
    JSON.stringify({
      event: "ai_preflight_failure",
      stage: "rate_limit",
      reason,
      requestId,
      gemini: "not_attempted",
      groq: "not_attempted",
    }) + "\n",
  );
  return {
    code: "RATE_LIMIT_UNAVAILABLE",
    message: `Generation stopped before AI requests: ${reason}. Gemini: not attempted. Groq: not attempted. Reference: ${requestId}`,
  };
}
