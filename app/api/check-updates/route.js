//app/api/check-updates/route.js
import { NextResponse } from 'next/server';
import { 
  getLatestWebhookTimestamp, 
  getFilteredWebhookUpdates, 
  hasPageUpdates, 
  getPageSpecificUpdate 
} from '../sanity-update-webhook/webhookTracker';

export async function POST(request) {
  try {
    const { lastCheck, pageType } = await request.json();
    
    // Get data using the utility functions
    const lastWebhookUpdate = getLatestWebhookTimestamp();
    const relevantUpdates = getFilteredWebhookUpdates(lastCheck);
    
    // Check page-specific updates
    const pageHasUpdates = hasPageUpdates(pageType, lastCheck);
    const pageLastUpdate = getPageSpecificUpdate(pageType);
    
    // Check if there have been updates since the last check
    const hasUpdates = lastWebhookUpdate > lastCheck || pageHasUpdates;
    
    console.log('Update check:', {
      pageType,
      lastCheck: new Date(lastCheck).toISOString(),
      lastWebhookUpdate: new Date(lastWebhookUpdate).toISOString(),
      pageLastUpdate: new Date(pageLastUpdate).toISOString(),
      hasUpdates,
      pageHasUpdates
    });
    
    return NextResponse.json({
      hasUpdates,
      updates: relevantUpdates,
      lastWebhookUpdate,
      pageSpecificUpdate: pageLastUpdate
    });
  } catch (error) {
    console.error('Error checking for updates:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// Add GET method for debugging
export async function GET() {
  try {
    const lastWebhookUpdate = getLatestWebhookTimestamp();
    const recentUpdates = getFilteredWebhookUpdates(0); // Get all recent updates
    
    return NextResponse.json({
      status: 'Check updates endpoint is working',
      lastWebhookUpdate,
      lastWebhookUpdateFormatted: lastWebhookUpdate ? new Date(lastWebhookUpdate).toISOString() : 'None',
      totalRecentUpdates: recentUpdates.length,
      recentUpdates: recentUpdates.slice(-5), // Show last 5
      usage: {
        method: 'POST',
        body: {
          lastCheck: 'timestamp',
          pageType: 'string (e.g., "seo", "ai-tools")'
        }
      }
    });
  } catch (error) {
    console.error('Check updates GET error:', error);
    return NextResponse.json({ error: 'Failed to get status' }, { status: 500 });
  }
}