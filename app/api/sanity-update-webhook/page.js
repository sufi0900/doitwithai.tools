import { NextResponse } from 'next/server';
import { recordWebhookUpdate } from '../check-updates/page';

export async function POST(request) {
  try {
    const body = await request.json();
    const receivedSecret = request.headers.get('sanity-webhook-secret') || body.secret;
    const expectedSecret = 'US3PE3jFjvyQ9Z6Y';

    if (receivedSecret !== expectedSecret) {
      console.error('Invalid webhook secret');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { _type: documentType, _id, action } = body;
    console.log('Sanity webhook received:', { documentType, _id, action });

    const timestamp = Date.now();
    
    // Record the update for the polling system
    recordWebhookUpdate(documentType, timestamp);

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
  return NextResponse.json({ message: 'Webhook endpoint is working' });
}