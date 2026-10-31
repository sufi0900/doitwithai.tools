// lib/redis.js
// Import the Upstash Redis SDK
import { Redis } from '@upstash/redis';

let redisClient;

if (process.env.NODE_ENV === 'production') {
 
  redisClient = Redis.fromEnv();
} else {
 
  if (!global.redisClient) {
    global.redisClient = new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL || 'http://localhost:8079', // Fallback for local testing if you run a local Redis REST proxy
      token: process.env.UPSTASH_REDIS_REST_TOKEN || 'local-token', // Dummy token for local
    });
  }
  redisClient = global.redisClient;
}

export const redisHelpers = {
  async get(key) {
    try {
      const data = await redisClient.get(key);
      console.log(`[Redis Cache Hit] for ${key}`);
      return data; // This is already parsed by Upstash
    } catch (error) {
      console.error(`Error getting Redis key ${key}:`, error);
      throw error;
    }
  },

  async set(key, value, options = {}) {
    try {
      // Upstash Redis automatically handles JSON stringification
      if (options.ex) {
        await redisClient.set(key, value, { ex: options.ex });
      } else {
        await redisClient.set(key, value);
      }
      console.log(`[Redis Cache Set] for ${key}`);
    } catch (error) {
      console.error(`Error setting Redis key ${key}:`, error);
      throw error;
    }
  },

  async del(key) {
    try {
      await redisClient.del(key);
      console.log(`[Redis Cache Deleted] for ${key}`);
    } catch (error) {
      console.error(`Error deleting Redis key ${key}:`, error);
      throw error;
    }
  }
};

export { redisClient };