// app/api/sanity-update-webhook/route.js
import { NextResponse } from 'next/server';
// Import from the correct path - notice the path correction
import { recordWebhookUpdate } from './webhookTracker'; // Adjust path if needed

export async function POST(request) {
  try {
    const body = await request.json();
    const receivedSecret = request.headers.get('sanity-webhook-secret') || body.secret;
    const expectedSecret = 'US3PE3jFjvyQ9Z6Y'; // Store this in environment variable

    if (receivedSecret !== expectedSecret) {
      console.error('Invalid webhook secret');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { _type: documentType, _id, action } = body;
    console.log('Sanity webhook received:', { documentType, _id, action });

    const timestamp = Date.now();
    
    // Record the update for the polling system
    recordWebhookUpdate(documentType, timestamp);

    // CRITICAL: Also update localStorage-like server state that client can poll
    // Since we can't directly update client localStorage from server,
    // we'll store this in our webhook tracker and let the polling system handle it

    console.log('Webhook processed successfully:', { documentType, timestamp });

    return NextResponse.json({
      success: true,
      message: 'Webhook processed successfully',
      documentType,
      timestamp
    });
  } catch (error) {
    console.error('Webhook processing error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({ message: 'Webhook endpoint is working' });
}