// app/lib/redis.js
// External Upstash Redis REST SDK uses HTTP POST with `cache: "no-store"` and
// 5 exponential retries (~4.2s per call). On Next.js 14 App Router ISR routes
// deployed to Cloudflare Workers, calling `fetch(..., { cache: "no-store" })`
// during static/ISR renders triggers `app-static-to-dynamic-error` (HTTP 500)
// and stalls SSR when Upstash is paused or slow.
//
// Caching is now handled natively on Cloudflare via OpenNext KV + Regional
// Incremental Cache (`NEXT_INC_CACHE_KV`). Only activate Upstash Redis if
// explicitly opted in via `ENABLE_UPSTASH_REDIS=true`.
import { Redis } from '@upstash/redis';

let redisClient;

function getRedisClient() {
  if (process.env.ENABLE_UPSTASH_REDIS !== 'true') {
    return null;
  }

  if (redisClient) {
    return redisClient;
  }

  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;

  if (!url || !token) {
    return null;
  }

  const config = {
    url,
    token,
    retry: false,
  };

  if (process.env.NODE_ENV === 'production') {
    redisClient = new Redis(config);
  } else {
    if (!global.redisClient) {
      global.redisClient = new Redis(config);
    }
    redisClient = global.redisClient;
  }

  return redisClient;
}

export const redisHelpers = {
  async get(key) {
    const client = getRedisClient();
    if (!client) {
      return null;
    }
    try {
      return await client.get(key);
    } catch (error) {
      console.error(`Error getting Redis key ${key}:`, error);
      return null;
    }
  },

  async set(key, value, options = {}) {
    const client = getRedisClient();
    if (!client) {
      return;
    }
    try {
      if (options.ex) {
        await client.set(key, value, { ex: options.ex });
      } else {
        await client.set(key, value);
      }
    } catch (error) {
      console.error(`Error setting Redis key ${key}:`, error);
    }
  },

  async del(key) {
    const client = getRedisClient();
    if (!client) {
      return;
    }
    try {
      await client.del(key);
    } catch (error) {
      console.error(`Error deleting Redis key ${key}:`, error);
    }
  }
};

export { redisClient };
