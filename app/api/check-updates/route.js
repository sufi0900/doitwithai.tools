// app/api/check-updates/route.js
import { NextResponse } from 'next/server';
import { 
  getLatestWebhookTimestamp, 
  getFilteredWebhookUpdates,
  hasPageUpdates,
  getPageSpecificUpdate
} from '../sanity-update-webhook/webhookTracker'; // Correct path

export async function POST(request) {
  try {
    const { lastCheck, pageType } = await request.json();
    
    // Get data using the utility functions
    const lastWebhookUpdate = getLatestWebhookTimestamp();
    const relevantUpdates = getFilteredWebhookUpdates(lastCheck);
    
    // NEW: Check page-specific updates
    const pageHasUpdates = hasPageUpdates(pageType, lastCheck);
    const pageLastUpdate = getPageSpecificUpdate(pageType);
    
    // Check if there have been updates since the last check
    const hasUpdates = lastWebhookUpdate > lastCheck || pageHasUpdates;
    
    console.log('Update check:', {
      pageType,
      lastCheck: new Date(lastCheck),
      lastWebhookUpdate: new Date(lastWebhookUpdate),
      pageLastUpdate: new Date(pageLastUpdate),
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
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}