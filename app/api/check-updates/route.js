import { NextResponse } from 'next/server';

// In-memory store for webhook updates (in production, use Redis or database)
let lastWebhookUpdate = 0;
let webhookUpdates = [];

// This will be called by your main webhook to record updates
export function recordWebhookUpdate(documentType, timestamp) {
  lastWebhookUpdate = Math.max(lastWebhookUpdate, timestamp);
  webhookUpdates.push({
    documentType,
    timestamp,
    id: Date.now() + Math.random()
  });
  
  // Keep only last 100 updates to prevent memory issues
  if (webhookUpdates.length > 100) {
    webhookUpdates = webhookUpdates.slice(-100);
  }
}

export async function POST(request) {
  try {
    const { lastCheck, pageType } = await request.json();
    
    // Check if there have been updates since the last check
    const hasUpdates = lastWebhookUpdate > lastCheck;
    
    // Filter updates relevant to the page type
    const relevantUpdates = webhookUpdates.filter(update => 
      update.timestamp > lastCheck
    );

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