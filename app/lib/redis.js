// lib/redis.js
import Redis from 'ioredis';

let redisClient;

// Common Redis options for serverless environments
const commonRedisOptions = {
  // `keepAlive` sends PING commands periodically to keep the connection alive.
  // This helps prevent idle connections from being closed by firewalls/load balancers.
  keepAlive: 10000, // Send PING every 10 seconds (adjust as needed, e.g., 5000-30000ms)

  // `enableOfflineQueue`: When true, commands are queued while the client is offline
  // and sent once the connection is re-established. This is crucial for resilience.
  enableOfflineQueue: true,

  // `reconnectOnError`: A function to determine if the client should reconnect on error.
  // Returning true will trigger a reconnect.
  reconnectOnError: (err) => {
    const targetErrors = ['ECONNRESET', 'ETIMEDOUT', 'EHOSTUNREACH'];
    if (targetErrors.some(errorType => err.message.includes(errorType))) {
      console.warn(`Redis reconnecting on error: ${err.message}`);
      return true; // Reconnect on these specific network errors
    }
    return false; // Do not reconnect on other errors (e.g., authentication failure)
  },

  // `maxRetriesPerRequest`: How many times a command will be retried if the connection
  // is lost. Set to null for infinite retries (common in serverless for resilience).
  // Or set a specific number like 5. Infinite retries can cause timeouts if the issue persists.
  // Let's try `null` for now, but be aware it can contribute to timeouts if the connection is truly broken.
  maxRetriesPerRequest: 3,

  // `retryStrategy`: A function that returns the delay before the next retry.
  // This implements exponential backoff.
  retryStrategy: (times) => {
    const delay = Math.min(times * 50, 2000); // Max 2 seconds delay
    console.log(`Redis retry attempt ${times}, delaying for ${delay}ms`);
    return delay;
  },

  // `connectTimeout`: The maximum time in milliseconds to wait for a connection to be established.
  // Default is 10000 (10 seconds). You might want to increase this if connections are slow.
  // Vercel timeout is 10s, so making this slightly less than 10s might be good, or equal.
  // Let's keep it default or slightly less for now to avoid hitting Vercel timeout too often.
  // connectTimeout: 9000,
};

if (process.env.NODE_ENV === 'production') {
  // In production, create a new client with robust options
  redisClient = new Redis(process.env.REDIS_URL, commonRedisOptions);
} else {
  // In development, use a global variable to reuse the client
  // and apply the same robust options
  if (!global.redisClient) {
    global.redisClient = new Redis(process.env.REDIS_URL || 'redis://localhost:6379', commonRedisOptions);
  }
  redisClient = global.redisClient;
}

// Optional: Add event listeners for connection status logging
// These will now log more details about connection lifecycle
redisClient.on('connect', () => {
  console.log('Redis client connected successfully!');
});

redisClient.on('ready', () => {
  console.log('Redis client is ready (connection established and authenticated)!');
});

redisClient.on('reconnecting', (delay) => {
  console.log(`Redis client reconnecting... next retry in ${delay}ms`);
});

redisClient.on('error', (err) => {
  console.error('Redis client connection error:', err.message);
  // Log the full error object for more details in Vercel logs
  console.error(err);
});

redisClient.on('end', () => {
  console.log('Redis client connection ended.');
});

export { redisClient };
