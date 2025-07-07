
// API Route: app/api/unified-cache/route.js
import { NextResponse } from 'next/server';
import { unifiedCacheHelpers } from '@/app/lib/unifiedCache';

export async function POST(request) {
  try {
    const { cacheKey, query, params, options } = await request.json();
    
    const result = await unifiedCacheHelpers.getServerData(
      cacheKey, 
      query, 
      params, 
      options
    );
    
    return NextResponse.json(result);
  } catch (error) {
    console.error('Unified cache API error:', error);
    return NextResponse.json(
      { error: 'Cache fetch failed', details: error.message },
      { status: 500 }
    );
  }
}