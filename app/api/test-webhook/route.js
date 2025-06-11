// app/api/test-webhook/route.js
import { NextResponse } from 'next/server';
import { recordWebhookUpdate, getAllRecentUpdates, getLatestWebhookTimestamp } from '../sanity-update-webhook/webhookTracker';

export async function POST(request) {
  try {
    const { documentType = 'seo', action = 'update' } = await request.json();
    
    // Simulate a webhook call
    const timestamp = Date.now();
    recordWebhookUpdate(documentType, timestamp);
    
    // Broadcast to SSE clients if available
    if (global.sseClients) {
      const updateMessage = {
        type: 'cms-update',
        documentType,
        timestamp,
        action,
        test: true
      };
      
      global.sseClients.forEach(client => {
        try {
          client.write(`data: ${JSON.stringify(updateMessage)}\n\n`);
        } catch (error) {
          console.error('Failed to send test SSE update:', error);
        }
      });
    }
    
    return NextResponse.json({
      success: true,
      message: 'Test webhook triggered successfully',
      documentType,
      timestamp,
      broadcasted: global.sseClients ? global.sseClients.size : 0
    });
    
  } catch (error) {
    console.error('Test webhook error:', error);
    return NextResponse.json({ error: 'Test webhook failed' }, { status: 500 });
  }
}

export async function GET() {
  try {
    const recentUpdates = getAllRecentUpdates(20);
    const latestTimestamp = getLatestWebhookTimestamp();
    const activeConnections = global.sseClients ? global.sseClients.size : 0;
    
    return NextResponse.json({
      status: 'Webhook test endpoint is working',
      latestTimestamp,
      latestTimestampFormatted: latestTimestamp ? new Date(latestTimestamp).toISOString() : 'None',
      recentUpdates,
      activeSSEConnections: activeConnections,
      testInstructions: {
        triggerTest: 'POST to /api/test-webhook with { "documentType": "seo", "action": "update" }',
        checkStatus: 'GET /api/test-webhook',
        checkUpdates: 'POST to /api/check-updates with { "lastCheck": timestamp, "pageType": "seo" }'
      }
    });
    
  } catch (error) {
    console.error('Test webhook status error:', error);
    return NextResponse.json({ error: 'Failed to get status' }, { status: 500 });
  }
}