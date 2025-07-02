// app/api/test-cache/route.js
// This API route is for testing the performance difference between Redis and direct Sanity fetches.
// It should NOT be used in production for regular data fetching.

import { client } from '@/sanity/lib/client'; // Your Sanity client
import { redisHelpers } from '@/app/lib/redis'; // Your Redis helpers

export const dynamic = 'force-dynamic'; // Ensure this route is always dynamic

export async function GET(req) {
  let redisTime = 'N/A';
  let sanityTime = 'N/A';
  let redisHasData = false;
  let sanityHasData = false;
  let speedup = 'N/A';
  let errorMessages = [];

  const testKey = 'test-article-for-cache-speed'; // A unique key for Redis testing
  const testSanityQuery = `*[_type=="aitool"][0]{_id, title, slug}`; // A simple Sanity query

  // --- Test Redis Fetch ---
  try {
    const redisStart = Date.now();
    let redisData = await redisHelpers.get(testKey);
    if (!redisData) {
      // If Redis doesn't have it, fetch from Sanity and set it for future Redis tests
      console.log(`[Test Cache API] Redis cache miss for ${testKey}. Fetching from Sanity to populate Redis.`);
      const dataFromSanity = await client.fetch(testSanityQuery);
      if (dataFromSanity) {
        await redisHelpers.set(testKey, dataFromSanity, { ex: 600 }); // Cache for 10 minutes
        redisData = dataFromSanity; // Use the data that was just set
      }
    }
    redisTime = Date.now() - redisStart;
    redisHasData = !!redisData;
  } catch (error) {
    console.error(`[Test Cache API] Redis test failed:`, error);
    errorMessages.push(`Redis test failed: ${error.message}`);
  }

  // --- Test Direct Sanity Fetch ---
  try {
    const sanityStart = Date.now();
    const sanityData = await client.fetch(testSanityQuery);
    sanityTime = Date.now() - sanityStart;
    sanityHasData = !!sanityData;
  } catch (error) {
    console.error(`[Test Cache API] Sanity direct fetch test failed:`, error);
    errorMessages.push(`Sanity direct fetch test failed: ${error.message}`);
  }

  if (typeof redisTime === 'number' && typeof sanityTime === 'number' && redisTime > 0) {
    speedup = `${(sanityTime / redisTime).toFixed(2)}x faster`;
  } else if (typeof redisTime === 'number' && redisTime === 0 && typeof sanityTime === 'number' && sanityTime > 0) {
    speedup = `Infinitely faster (Redis was immediate)`;
  } else if (typeof redisTime === 'number' && typeof sanityTime === 'number') {
    speedup = `Cannot calculate speedup (one or both times are zero/invalid)`;
  }


  return new Response(JSON.stringify({
    redis: { time: redisTime, hasData: redisHasData },
    sanity: { time: sanityTime, hasData: sanityHasData },
    speedup: speedup,
    notes: "This endpoint tests server-side Redis vs. direct Sanity fetch. Reload multiple times to see Redis hits. If Redis is empty, the first Redis test will include a Sanity fetch to populate it.",
    errors: errorMessages.length > 0 ? errorMessages : undefined,
  }), {
    status: 200,
    headers: {
      'Content-Type': 'application/json',
    },
  });
}
