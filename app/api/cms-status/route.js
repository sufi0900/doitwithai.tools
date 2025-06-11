// app/api/cms-status/route.js
import { NextResponse } from 'next/server';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const pageType = searchParams.get('pageType') || 'default';
    const lastCheck = parseInt(searchParams.get('lastCheck') || '0');
    
    // Check global timestamps
    const globalTimestamps = typeof globalThis !== 'undefined' ? globalThis.cmsUpdateTimestamps : {};
    const globalTimestamp = globalTimestamps['global'] || 0;
    const pageTimestamp = globalTimestamps[pageType] || 0;
    
    const latestTimestamp = Math.max(globalTimestamp, pageTimestamp);
    const hasUpdates = latestTimestamp > lastCheck;
    
    return NextResponse.json({
      hasUpdates,
      latestTimestamp,
      pageType,
      lastCheck,
      globalTimestamps // For debugging
    });
  } catch (error) {
    console.error('CMS status check error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}