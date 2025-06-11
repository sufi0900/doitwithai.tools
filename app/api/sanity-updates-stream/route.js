// app/api/sanity-updates-stream/route.js
// This file implements a Server-Sent Events (SSE) endpoint
// to push real-time Sanity content updates to connected clients.

// Use a global Set to keep track of connected clients.
// In a production environment with multiple instances, you would replace this
// with a proper pub/sub system like Redis to ensure updates are broadcasted
// across all instances.
const clients = new Set();

/**
 * Handles GET requests for the SSE stream.
 * Clients will connect to this endpoint to receive real-time updates.
 * @param {Request} request - The incoming Next.js Request object.
 * @returns {Response} - The Next.js Response object configured for SSE.
 */
export async function GET(request) {
  // Create a new Response object with SSE specific headers.
  const response = new Response(
    new ReadableStream({
      start(controller) {
        // Encode the initial connection message as a Uint8Array
        const initialMessage = `data: ${JSON.stringify({ type: 'connected', timestamp: Date.now() })}\n\n`;
        controller.enqueue(new TextEncoder().encode(initialMessage));

        // Add the controller to the clients Set.
        // This controller will be used by the broadcastUpdate function to send data.
        clients.add(controller);

        // Set up a listener for when the client disconnects.
        // Remove the controller from the Set to clean up resources.
        request.signal.addEventListener('abort', () => {
          console.log('SSE client disconnected.');
          clients.delete(controller);
        });
      },
      cancel() {
        // Optional: Handle stream cancellation
        console.log('SSE stream cancelled.');
      }
    }),
    {
      // Set the Content-Type header to 'text/event-stream' for SSE.
      'Content-Type': 'text/event-stream',
      // Disable caching for the SSE stream.
      'Cache-Control': 'no-cache, no-transform',
      // Keep the connection alive.
      'Connection': 'keep-alive',
      // Allow cross-origin requests if necessary (adjust as per your needs).
      'Access-Control-Allow-Origin': '*',
      // 'Access-Control-Allow-Headers': 'Cache-Control' // Usually not needed for GET SSE, but can be included if issues arise.
    }
  );

  return response;
}

/**
 * Broadcasts an update message to all currently connected SSE clients.
 * This function can be called from other API routes (like your Sanity webhook POST route)
 * or other server-side logic when an update needs to be pushed.
 * @param {string} documentType - The type of Sanity document that was updated.
 * @param {string} operation - The operation performed (e.g., 'create', 'update', 'delete').
 */
export function broadcastUpdate(documentType, operation) {
  const message = JSON.stringify({
    type: 'sanity-update',
    documentType: documentType,
    operation: operation,
    timestamp: Date.now()
  });

  // Iterate over all connected client controllers and enqueue the message.
  clients.forEach(controller => {
    try {
      // Each message must end with two newlines for SSE spec.
      controller.enqueue(new TextEncoder().encode(`data: ${message}\n\n`));
      console.log(`Broadcasted update for ${documentType} to a client.`);
    } catch (error) {
      console.error('Error broadcasting to client, removing from list:', error);
      clients.delete(controller); // Remove client if there's an error sending data
    }
  });
}

// NOTE: When using this in production, you would need to export and import
// the `broadcastUpdate` function from this file into your `sanity-webhook/route.js`.
// Example in sanity-webhook/route.js:
// import { broadcastUpdate } from '../sanity-updates-stream/route';
// ...
// In your POST handler:
// broadcastUpdate(documentType, action);
