// lib/redis.js
// Import the Upstash Redis SDK
import { Redis } from '@upstash/redis';

let redisClient;

// In serverless environments, it's generally best to avoid
// creating new client instances on every invocation.
// The @upstash/redis SDK is designed to be efficient with this.
// We'll use a global singleton pattern for development to prevent hot-reloading issues,
// and rely on Vercel's function lifecycle for production.

if (process.env.NODE_ENV === 'production') {
  // In production, create a new client. Vercel will handle instance reuse.
  // The SDK automatically picks up UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN
  // from environment variables if Redis.fromEnv() is used.
  redisClient = Redis.fromEnv();
} else {
  // In development, use a global variable to reuse the client
  // across hot module reloads to prevent too many connections.
  if (!global.redisClient) {
    // For local development, ensure these env vars are in your .env.local
    global.redisClient = new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL || 'http://localhost:8079', // Fallback for local testing if you run a local Redis REST proxy
      token: process.env.UPSTASH_REDIS_REST_TOKEN || 'local-token', // Dummy token for local
    });
  }
  redisClient = global.redisClient;
}

// With @upstash/redis, you don't typically add .on('connect'), .on('error') etc.
// directly to the client instance like with ioredis, as it's making HTTP calls.
// Errors will be thrown directly from the async operations (get, set, del).

export { redisClient };
