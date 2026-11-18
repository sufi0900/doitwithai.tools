// lib/redis.js
// Import the Upstash Redis SDK
import { Redis } from '@upstash/redis';

let redisClient;

function getRedisClient() {
  if (redisClient) {
    return redisClient;
  }

  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;

  if (!url || !token) {
    return null;
  }

  if (process.env.NODE_ENV === 'production') {
    redisClient = new Redis({ url, token });
  } else {
    if (!global.redisClient) {
      global.redisClient = new Redis({ url, token });
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
      const data = await client.get(key);
      console.log(`[Redis Cache Hit] for ${key}`);
      return data; // This is already parsed by Upstash
    } catch (error) {
      console.error(`Error getting Redis key ${key}:`, error);
      throw error;
    }
  },

  async set(key, value, options = {}) {
    const client = getRedisClient();
    if (!client) {
      return;
    }
    try {
      // Upstash Redis automatically handles JSON stringification
      if (options.ex) {
        await client.set(key, value, { ex: options.ex });
      } else {
        await client.set(key, value);
      }
      console.log(`[Redis Cache Set] for ${key}`);
    } catch (error) {
      console.error(`Error setting Redis key ${key}:`, error);
      throw error;
    }
  },

  async del(key) {
    const client = getRedisClient();
    if (!client) {
      return;
    }
    try {
      await client.del(key);
      console.log(`[Redis Cache Deleted] for ${key}`);
    } catch (error) {
      console.error(`Error deleting Redis key ${key}:`, error);
      throw error;
    }
  }
};

export { redisClient };