//app/api/sanity-update-webhook/route.js
import { NextResponse } from 'next/server';
import { recordWebhookUpdate } from './webhookTracker';
import { CacheInvalidationService } from '@/components/Blog/cacheInvalidation';

export async function POST(request) {
  try {
    const body = await request.json();
    const receivedSecret = request.headers.get('sanity-webhook-secret') || body.secret;
    const expectedSecret = process.env.SANITY_WEBHOOK_SECRET || 'US3PE3jFjvyQ9Z6Y';

    if (receivedSecret !== expectedSecret) {
      console.error('Invalid webhook secret');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { _type: documentType, _id, action } = body;
    console.log('Sanity webhook received:', { documentType, _id, action });

    const timestamp = Date.now();

    // Record the update for the polling system
    recordWebhookUpdate(documentType, timestamp);

    // Invalidate relevant caches based on document type
    CacheInvalidationService.invalidateByDocumentType(documentType);

    // Store the update in a way that can be checked by the client
    // This is a simple approach - in production, use Redis or a database
    if (typeof global !== 'undefined') {
      if (!global.lastCMSUpdates) {
        global.lastCMSUpdates = {};
      }
      global.lastCMSUpdates[documentType] = timestamp;
      global.lastCMSUpdates['global'] = timestamp;
    }

    // Broadcast update to all connected clients via Server-Sent Events
    if (global.sseClients) {
      const updateMessage = {
        type: 'cms-update',
        documentType,
        timestamp,
        action
      };
      
      global.sseClients.forEach(client => {
        try {
          client.write(`data: ${JSON.stringify(updateMessage)}\n\n`);
        } catch (error) {
          console.error('Failed to send SSE update:', error);
        }
      });
    }

    return NextResponse.json({
      success: true,
      message: 'Webhook processed successfully',
      documentType,
      timestamp
    });
  } catch (error) {
    console.error('Webhook processing error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({ 
    message: 'Webhook endpoint is working',
    status: 'active',
    timestamp: new Date().toISOString()
  });
}