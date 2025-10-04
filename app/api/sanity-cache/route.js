// app/api/sanity-cache/route.js
import { client } from "@/sanity/lib/client";
import { redisHelpers } from '@/app/lib/redis';
import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const { query, params = {}, cacheKey, schemaType } = await request.json();
    
    if (!query || !cacheKey) {
      return NextResponse.json({ error: 'Missing query or cacheKey' }, { status: 400 });
    }

    // Try Redis first
    try {
      const cachedData = await redisHelpers.get(cacheKey);
      if (cachedData) {
        console.log(`[API Cache Hit] Redis for ${cacheKey}`);
        return NextResponse.json({ 
          data: cachedData, 
          source: 'redis',
          cached: true 
        });
      }
    } catch (redisError) {
      console.error(`Redis error for ${cacheKey}:`, redisError);
    }

    // If not in Redis, fetch from Sanity
    console.log(`[API Cache Miss] Fetching from Sanity for ${cacheKey}`);
    
    const data = await client.fetch(query, params, {
      next: { tags: [schemaType, ...(params.currentSlug ? [params.currentSlug] : [])] }
    });

    // Store in Redis for future requests
    if (data) {
      try {
        await redisHelpers.set(cacheKey, data, { ex: 3600 });
        console.log(`[API Cache Set] Redis for ${cacheKey}`);
      } catch (redisSetError) {
        console.error(`Redis set error for ${cacheKey}:`, redisSetError);
      }
    }

    return NextResponse.json({ 
      data, 
      source: 'sanity',
      cached: false 
    });

  } catch (error) {
    console.error('API Cache error:', error);
    return NextResponse.json({ 
      error: 'Internal server error', 
      details: error.message 
    }, { status: 500 });
  }
}