// app/api/sse/route.js
import { NextResponse } from 'next/server';

// Global storage for SSE clients
if (!global.sseClients) {
  global.sseClients = new Set();
}

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const pageType = searchParams.get('pageType') || 'default';

  // Create a readable stream for Server-Sent Events
  const stream = new ReadableStream({
    start(controller) {
      const encoder = new TextEncoder();
      
      // Client connection handler
      const client = {
        pageType,
        write: (data) => {
          try {
            controller.enqueue(encoder.encode(data));
          } catch (error) {
            console.error('SSE write error:', error);
          }
        },
        close: () => {
          try {
            controller.close();
          } catch (error) {
            console.error('SSE close error:', error);
          }
        }
      };

      // Add client to global set
      global.sseClients.add(client);

      // Send initial connection message
      client.write(`data: ${JSON.stringify({ type: 'connected', pageType, timestamp: Date.now() })}\n\n`);

      // Keep-alive ping every 30 seconds
      const keepAlive = setInterval(() => {
        try {
          client.write(`data: ${JSON.stringify({ type: 'ping', timestamp: Date.now() })}\n\n`);
        } catch (error) {
          clearInterval(keepAlive);
          global.sseClients.delete(client);
        }
      }, 30000);

      // Cleanup on connection close
      const cleanup = () => {
        clearInterval(keepAlive);
        global.sseClients.delete(client);
      };

      // Handle client disconnect
      request.signal.addEventListener('abort', cleanup);
      
      return {
        cancel: cleanup
      };
    }
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'Cache-Control',
    },
  });
}