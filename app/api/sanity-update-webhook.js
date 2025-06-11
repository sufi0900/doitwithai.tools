// app/api/sanity-update-webhook/route.js
// This file handles the Sanity webhook for content updates.

import { CacheInvalidationService } from '@/components/Blog/cacheInvalidation';

// Define the POST handler for the webhook
// This function will be called when a POST request is made to /api/sanity-update-webhook
export async function POST(request) {
  try {
    // Parse the request body as JSON
    const body = await request.json();

    // Retrieve the secret from headers or body
    // The 'sanity-webhook-secret' header is the standard way Sanity sends it.
    const receivedSecret = request.headers.get('sanity-webhook-secret') || body.secret;
    const expectedSecret = 'US3PE3jFjvyQ9Z6Y'; // IMPORTANT: Use a secure environment variable for this in production!

    // Verify the webhook secret to ensure the request is legitimate
    if (receivedSecret !== expectedSecret) {
      console.log('Webhook secret mismatch');
      return new Response(JSON.stringify({ message: 'Unauthorized' }), { status: 401, headers: { 'Content-Type': 'application/json' } });
    }

    // Destructure the document type and operation from the webhook payload
    const { _type, operation } = body;

    console.log('Webhook received:', { _type, operation });

    // Invalidate the cache based on the document type
    // This ensures that when content is updated in Sanity, Next.js rebuilds affected pages.
    if (_type) {
      CacheInvalidationService.invalidateByDocumentType(_type);

      // Special handling for 'seo' documents to invalidate specific page caches
      if (_type === 'seo') {
        CacheInvalidationService.invalidatePageCache('seo');
      }
    }

    // Respond with success message
    return new Response(JSON.stringify({
      message: 'Webhook processed successfully',
      type: _type,
      operation
    }), { status: 200, headers: { 'Content-Type': 'application/json' } });

  } catch (error) {
    // Log any errors during webhook processing
    console.error('Webhook processing error:', error);
    // Respond with an internal server error status
    return new Response(JSON.stringify({ message: 'Internal server error' }), { status: 500, headers: { 'Content-Type': 'application/json' } });
  }
}

// NOTE: The SSE (Server-Sent Events) endpoint previously defined in your snippet
// (pages/api/sanity-updates-stream.js) should be a separate file/route if needed.
// This webhook route is purely for receiving and processing Sanity updates.
