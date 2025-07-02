// app/api/cached-sanity/route.js
import { client } from '@/sanity/lib/client'; // Your Sanity client for server-side operations
import { redisHelpers } from '@/app/lib/redis'; // Your Redis helpers for server-side operations
import { revalidateTag, revalidatePath } from 'next/cache'; // For Next.js cache revalidation

// Helper function to hash strings consistently (should ideally be shared with client-side cacheSystem)
const hashString = (str) => {
  if (typeof str !== 'string' || str === null) {
    return 'invalid_hash_input';
  }
  if (str.length === 0) {
    return 'empty_string_hash';
  }
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return Math.abs(hash).toString(36);
};

// POST handler for fetching and caching data, or for pattern invalidation
export async function POST(req) {
  try {
    const requestBody = await req.json();
    const { cacheKeyIdentifier, query, params = {}, cacheOptions = {}, action, pattern } = requestBody;

    // Handle pattern invalidation if action is specified
    if (action === 'invalidatePattern') {
      if (!pattern) {
        return new Response(JSON.stringify({ error: 'Missing pattern for invalidatePattern action' }), { status: 400 });
      }
      console.warn(`[API Route] Pattern invalidation requested for: ${pattern}.`);
      // --- IMPORTANT: Implement actual Redis pattern deletion here ---
      // For Upstash Redis, you can use `scan` and then `del` for each key.
      // Example (conceptual, assuming redisHelpers has a scanAndDelPattern method):
      // await redisHelpers.scanAndDelPattern(pattern);
      // As a fallback, we'll just log for now.
      console.warn(`[API Route] Redis pattern deletion for "${pattern}" needs to be implemented in redisHelpers.`);
      return new Response(JSON.stringify({ success: true, message: `Pattern invalidation for "${pattern}" initiated.` }), { status: 200 });
    }

    // Default behavior: Fetch and cache data
    if (!query || !cacheKeyIdentifier) {
      return new Response(JSON.stringify({ error: 'Missing query or cacheKeyIdentifier' }), { status: 400 });
    }

    // Generate the full cache key consistently with the client-side `cacheSystem`
    const fullCacheKey = `${cacheKeyIdentifier}_${hashString(query)}`;

    // 1. Try to get data from Redis
    try {
      const cachedData = await redisHelpers.get(fullCacheKey);
      if (cachedData) {
        console.log(`[API Route Redis Hit] ${fullCacheKey}`);
        // Return data with source 'redis' and indicate it's not stale (fresh from server-side cache)
        return new Response(JSON.stringify({ data: cachedData, source: 'redis', isStale: false }), { status: 200 });
      }
    } catch (redisError) {
      console.error(`[API Route] Error accessing Redis for ${fullCacheKey}:`, redisError);
      // Continue to fetch from Sanity if Redis fails
    }

    // 2. If not in Redis, fetch from Sanity
    console.log(`[API Route Sanity Fetch] ${fullCacheKey}`);
    const sanityData = await client.fetch(query, params, {
      // Pass tags from cacheOptions to Next.js for server-side revalidation
      next: { tags: cacheOptions.tags || [] }
    });

    // 3. Store the fetched data in Redis
    try {
      // Use `ex` from cacheOptions or default to 1 hour (3600 seconds)
      await redisHelpers.set(fullCacheKey, sanityData, { ex: cacheOptions.ex || 3600 });
      console.log(`[API Route Redis Set] ${fullCacheKey}`);
    } catch (redisSetError) {
      console.error(`[API Route] Error setting Redis cache for ${fullCacheKey}:`, redisSetError);
    }

    // Return the fresh data from the network
    return new Response(JSON.stringify({ data: sanityData, source: 'network', isStale: false }), { status: 200 });

  } catch (error) {
    console.error('[API Route] Error in /api/cached-sanity/ POST:', error);
    return new Response(JSON.stringify({ error: error.message || 'Internal Server Error' }), { status: 500 });
  }
}

// DELETE handler for invalidating Redis cache (called by client-side cacheSystem)
export async function DELETE(req) {
  try {
    const { fullCacheKey, revalidateTags = [], revalidatePaths = [] } = await req.json();

    if (!fullCacheKey) {
      return new Response(JSON.stringify({ error: 'Missing fullCacheKey' }), { status: 400 });
    }

    // 1. Invalidate from Redis
    try {
      await redisHelpers.del(fullCacheKey);
      console.log(`[API Route Redis Delete] ${fullCacheKey}`);
    } catch (redisError) {
      console.error(`[API Route] Error deleting Redis key ${fullCacheKey}:`, redisError);
    }

    // 2. Invalidate Next.js Data Cache (if specific tags/paths are provided)
    revalidateTags.forEach(tag => {
      revalidateTag(tag);
      console.log(`[API Route] Revalidated Next.js tag: ${tag}`);
    });
    revalidatePaths.forEach(path => {
      revalidatePath(path);
      console.log(`[API Route] Revalidated Next.js path: ${path}`);
    });

    return new Response(JSON.stringify({ success: true }), { status: 200 });
  } catch (error) {
    console.error('[API Route] Error in /api/cached-sanity/ DELETE:', error);
    return new Response(JSON.stringify({ error: error.message || 'Internal Server Error' }), { status: 500 });
  }
}
