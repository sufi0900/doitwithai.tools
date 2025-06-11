// app/api/sanity-update-webhook/route.js
// This file handles the Sanity webhook for content updates using Next.js App Router conventions.

import { CacheInvalidationService } from '@/components/Blog/cacheInvalidation';
// Import the broadcastUpdate function from your new SSE stream route
import { broadcastUpdate } from '../sanity-updates-stream/page'; // Adjust path if necessary

/**
 * Handles POST requests to the Sanity webhook endpoint.
 * This function is automatically recognized by Next.js App Router as an API route handler.
 * @param {Request} request - The incoming Next.js Request object.
 * @returns {Response} - The Next.js Response object.
 */
export async function POST(request) {
  try {
    // Parse the request body as JSON. Sanity webhooks send their payload in JSON format.
    const body = await request.json();

    // Retrieve the secret from the 'sanity-webhook-secret' header or the request body.
    // The header is the standard and more secure way Sanity sends it.
    const receivedSecret = request.headers.get('sanity-webhook-secret') || body.secret;
    const expectedSecret = 'US3PE3jFjvyQ9Z6Y'; // IMPORTANT: For production, use an environment variable (e.g., process.env.SANITY_WEBHOOK_SECRET)

    // Verify the webhook secret. This prevents unauthorized access to your webhook.
    if (receivedSecret !== expectedSecret) {
      console.error('Invalid webhook secret provided. Request unauthorized.');
      // Return a 401 Unauthorized response with a JSON message.
      return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers: { 'Content-Type': 'application/json' } });
    }

    // Destructure relevant data from the Sanity webhook payload.
    // _type is the document type (e.g., 'post', 'author', 'settings').
    // _id is the document ID.
    // action indicates the type of change (e.g., 'create', 'update', 'delete').
    const { _type: documentType, _id, action } = body;

    console.log(`Sanity webhook received: Document Type: ${documentType}, ID: ${_id}, Action: ${action}`);

    // Invalidate relevant caches based on the document type.
    // This is crucial for ensuring your Next.js frontend displays the latest content
    // after a Sanity update without requiring a full redeploy or manual refresh.
    if (documentType) {
      CacheInvalidationService.invalidateByDocumentType(documentType);
      // Example of specific invalidation for 'seo' related content if needed:
      if (documentType === 'seo') {
         CacheInvalidationService.invalidatePageCache('seo-related-page-key');
      }
    }

    // Call the broadcastUpdate function to push real-time updates to connected SSE clients.
    broadcastUpdate(clients, documentType, action); // <--- MODIFIED CALL

    // A simple timestamp is sufficient for server-side logging or for the client to poll.
    const timestamp = Date.now().toString();
    console.log(`Update timestamp for ${documentType}: ${timestamp}`);

    // Return a success response to Sanity.
    // It's important to respond with a 200 status code so Sanity knows the webhook was processed.
    return new Response(JSON.stringify({
      success: true,
      message: 'Webhook processed successfully',
      documentType,
      timestamp
    }), { status: 200, headers: { 'Content-Type': 'application/json' } });

  } catch (error) {
    console.error('Webhook processing error:', error);
    // Return a 500 Internal Server Error response for any unexpected errors.
    return new Response(JSON.stringify({ error: 'Internal server error' }), { status: 500, headers: { 'Content-Type': 'application/json' } });
  }
}

// NOTE: The 'broadcastUpdate' function is now imported from a separate SSE route.
// This 'route.js' file should only handle the POST request logic.
