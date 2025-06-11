// app/api/check-updates/route.js
import { NextResponse } from 'next/server';
// Import from the new utility file
import { getLatestWebhookTimestamp, getFilteredWebhookUpdates } from '../sanity-update-webhook/webhookTracker'; // Adjust path

export async function POST(request) {
  try {
    const { lastCheck, pageType } = await request.json();

    // Get data using the utility functions
    const lastWebhookUpdate = getLatestWebhookTimestamp();
    const relevantUpdates = getFilteredWebhookUpdates(lastCheck);

    // Check if there have been updates since the last check
    const hasUpdates = lastWebhookUpdate > lastCheck;

    return NextResponse.json({
      hasUpdates,
      updates: relevantUpdates,
      lastWebhookUpdate
    });

  } catch (error) {
    console.error('Error checking for updates:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}