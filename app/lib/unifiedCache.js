import { redisHelpers } from './redis';

export const unifiedCacheHelpers = {
  // Server-side function to get data (uses Redis + Sanity)
  async getServerData(cacheKey, query, params = {}, options = {}) {
    const { client } = await import('@/sanity/lib/client');
    const { ex = 3600 } = options;
    
    try {
      // Try Redis first
      const cachedData = await redisHelpers.get(cacheKey);
      if (cachedData) {
        console.log(`[Redis Cache Hit] for ${cacheKey}`);
        return {
          data: cachedData,
          source: 'redis',
          fromCache: true
        };
      }
    } catch (redisError) {
      console.error(`Redis error for ${cacheKey}:`, redisError);
    }

    // Fallback to Sanity
    console.log(`[Sanity Fetch] for ${cacheKey}`);
    try {
      const data = await client.fetch(query, params);
      
      if (data) {
        // Cache in Redis
        try {
          await redisHelpers.set(cacheKey, data, { ex });
          console.log(`[Redis Cache Set] for ${cacheKey}`);
        } catch (redisSetError) {
          console.error(`Redis set error for ${cacheKey}:`, redisSetError);
        }
      }
      
      return {
        data,
        source: 'sanity',
        fromCache: false
      };
    } catch (error) {
      console.error(`Sanity fetch error for ${cacheKey}:`, error);
      throw error;
    }
  },

  // Client-side function to get data (uses API route that leverages Redis)
  async getClientData(cacheKey, query, params = {}, options = {}) {
    try {
      const response = await fetch('/api/unified-cache', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          cacheKey,
          query,
          params,
          options
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      return result;
    } catch (error) {
      console.error(`Client cache fetch error for ${cacheKey}:`, error);
      throw error;
    }
  },

  // Generate consistent cache keys
  generateCacheKey(type, identifier, suffix = '') {
    // Ensure consistent format: article:schemaType:slug
    const base = `article:${type}:${identifier}`;
    return suffix ? `${base}:${suffix}` : base;
  },

  // Add a method to extract slug from params consistently
  extractSlugFromParams(params) {
    return params.currentSlug || params.slug || params.identifier || 'unknown';
  }
};
