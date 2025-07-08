// app/api/cms-status/route.js
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic'; // Add this line
export const revalidate = 0; // Add this line

export async function GET(request) {
  try {
    // Your existing CMS status check logic
    const status = await checkCMSStatus();
    
    return NextResponse.json({ 
      status: 'healthy',
      timestamp: new Date().toISOString(),
      ...status 
    });
  } catch (error) {
    console.error('CMS status check error:', error);
    return NextResponse.json(
      { status: 'error', message: error.message },
      { status: 500 }
    );
  }
}