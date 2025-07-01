// lib/redis.js
import Redis from 'ioredis';

// Use a global variable to prevent multiple Redis client instances
// This is important in Next.js development mode due to HMR (Hot Module Replacement)
let redisClient;

if (process.env.NODE_ENV === 'production') {
  // In production, create a new client
  // Using `rediss://` for secure connections, common with cloud providers like Upstash
  redisClient = new Redis(process.env.REDIS_URL);
} else {
  // In development, use a global variable to reuse the client
  // This prevents memory leaks and too many connections during HMR
  if (!global.redisClient) {
    global.redisClient = new Redis(process.env.REDIS_URL || 'redis://localhost:6379');
  }
  redisClient = global.redisClient;
}

// Optional: Add event listeners for connection status logging
redisClient.on('connect', () => {
  console.log('Redis client connected successfully!');
});

redisClient.on('error', (err) => {
  console.error('Redis client connection error:', err);
  // In a real application, you might want more robust error handling here,
  // e.g., graceful degradation, retry logic. For now, just logging.
});

export { redisClient };
