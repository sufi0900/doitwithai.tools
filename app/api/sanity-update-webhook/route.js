// app/api/sanity-update-webhook/route.js
// This file handles the Sanity webhook for content updates using Next.js App Router conventions.
// It must be named 'route.js' (or .ts/.jsx/.tsx) and placed directly inside the API route folder.

import { CacheInvalidationService } from '@/components/Blog/cacheInvalidation';

// IMPORTANT: The `broadcastUpdate` function as written in your previous code
// is an in-memory system that relies on Server-Sent Events (SSE) clients
// being connected to a *separate* SSE endpoint.
// Since you mentioned removing `app/api/sanity-updates-stream/route.js`,
// this `broadcastUpdate` function (if kept local here) will only log to the console
// and *not* provide real-time updates to connected browser clients.
// If you want real-time updates, you MUST re-implement the SSE endpoint
// (as provided previously in `app/api/sanity-updates-stream/route.js`)
// and ensure `broadcastUpdate` can access its `clients` Set.

// For now, I'm removing the local `broadcastUpdate` function and its call
// to avoid confusion, as it won't broadcast unless the SSE endpoint is active.
// If you reinstate the SSE endpoint, remember to import `broadcastUpdate`
// and the `clients` Set from the SSE route file as discussed previously.

/**
 * Handles POST requests to the Sanity webhook endpoint.
 * This function is automatically recognized by Next.js App Router as an API route handler.
 * @param {Request} request - The incoming Next.js Request object (standard Web Request API).
 * @returns {Response} - The Next.js Response object (standard Web Response API).
 */
export async function POST(request) {
  // Next.js App Router API routes automatically handle method checks.
  // If you only export `POST`, other methods will automatically get a 405 response.
  // So, the `if (req.method !== 'POST')` check is not strictly necessary here,
  // but it's good for explicit clarity if you exported multiple methods.

  try {
    // Parse the request body as JSON. Sanity webhooks send their payload in JSON format.
    // In App Router, you use `request.json()` to get the body.
    const body = await request.json();

    // Retrieve the secret from the 'sanity-webhook-secret' header or the request body.
    // In App Router, use `request.headers.get()` to access headers.
    const receivedSecret = request.headers.get('sanity-webhook-secret') || body.secret;
    // IMPORTANT: For production, use an environment variable (e.g., process.env.SANITY_WEBHOOK_SECRET)
    const expectedSecret = 'US3PE3jFjvyQ9Z6Y';

    // Verify the webhook secret.
    if (receivedSecret !== expectedSecret) {
      console.error('Invalid webhook secret provided. Request unauthorized.');
      // Return a 401 Unauthorized response using the standard `Response` object.
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Destructure relevant data from the Sanity webhook payload.
    const { _type: documentType, _id, action } = body;

    console.log(`Sanity webhook received: Document Type: ${documentType}, ID: ${_id}, Action: ${action}`);

    // Invalidate relevant caches based on the document type.
    if (documentType) {
      CacheInvalidationService.invalidateByDocumentType(documentType);
      // Example of specific invalidation for 'seo' related content:
      if (documentType === 'seo') {
         CacheInvalidationService.invalidatePageCache('seo-related-page-key');
      }
    }

    // Store update timestamp for each page type that might be affected.
    // Note: `localStorage` cannot be used in server-side API routes.
    // If you need client-side cache busting, consider:
    // 1. Next.js `revalidatePath` or `revalidateTag` for ISR.
    // 2. A real-time system (SSE/WebSockets) for immediate client updates.
    // 3. Polling on the client-side against a server endpoint that provides last update time.
    const timestamp = Date.now().toString();
    console.log(`Update timestamp for ${documentType}: ${timestamp}`);

    // Return a success response to Sanity using the standard `Response` object.
    // It's important to respond with a 200 status code so Sanity knows the webhook was processed successfully.
    return new Response(JSON.stringify({
      success: true,
      message: 'Webhook processed successfully',
      documentType,
      timestamp
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Webhook processing error:', error);
    // Return a 500 Internal Server Error response for any unexpected errors.
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

// You can optionally add a GET handler if you want to test the endpoint by visiting it
// in the browser directly (though webhooks are POST requests).
// export async function GET(request) {
//   return new Response(JSON.stringify({ message: 'This is the Sanity webhook endpoint. Please send a POST request.' }), {
//     status: 200,
//     headers: { 'Content-Type': 'application/json' }
//   });
// }
