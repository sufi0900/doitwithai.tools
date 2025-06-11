// app/api/sse/route.js
import { NextResponse } from 'next/server';

// Global storage for SSE clients
if (!global.sseClients) {
  global.sseClients = new Set();
}

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const pageType = searchParams.get('pageType') || 'default';
  
  console.log(`New SSE connection for page type: ${pageType}`);

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
            // Remove client if write fails
            global.sseClients.delete(client);
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
      console.log(`SSE client added. Total clients: ${global.sseClients.size}`);

      // Send initial connection message
      client.write(`data: ${JSON.stringify({
        type: 'connected',
        pageType,
        timestamp: Date.now()
      })}\n\n`);

      // Keep-alive ping every 30 seconds
      const keepAlive = setInterval(() => {
        try {
          client.write(`data: ${JSON.stringify({
            type: 'ping',
            timestamp: Date.now()
          })}\n\n`);
        } catch (error) {
          console.error('Keep-alive ping failed:', error);
          clearInterval(keepAlive);
          global.sseClients.delete(client);
        }
      }, 30000);

      // Cleanup on connection close
      const cleanup = () => {
        clearInterval(keepAlive);
        global.sseClients.delete(client);
        console.log(`SSE client removed. Remaining clients: ${global.sseClients.size}`);
      };

      // Handle client disconnect
      if (request.signal) {
        request.signal.addEventListener('abort', cleanup);
      }

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

// Optional: Add a POST endpoint to manually trigger updates (for testing)
export async function POST(request) {
  try {
    const { message, documentType, pageType } = await request.json();
    
    if (global.sseClients && global.sseClients.size > 0) {
      const updateData = {
        type: 'cms_update',
        documentType: documentType || 'test',
        timestamp: Date.now(),
        message: message || 'Test update message'
      };
      
      const broadcastMessage = `data: ${JSON.stringify(updateData)}\n\n`;
      
      // Broadcast to all clients or specific page type
      const clients = Array.from(global.sseClients);
      const targetClients = pageType ? 
        clients.filter(client => client.pageType === pageType) : 
        clients;
      
      targetClients.forEach(client => {
        try {
          client.write(broadcastMessage);
        } catch (error) {
          console.error('Failed to broadcast to client:', error);
          global.sseClients.delete(client);
        }
      });
      
      return NextResponse.json({
        success: true,
        message: 'Update broadcasted',
        clientsNotified: targetClients.length,
        totalClients: global.sseClients.size
      });
    } else {
      return NextResponse.json({
        success: false,
        message: 'No SSE clients connected'
      });
    }
  } catch (error) {
    console.error('SSE POST error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}