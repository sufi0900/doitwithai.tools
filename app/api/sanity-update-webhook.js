// 1. First, create the webhook API endpoint
// pages/api/sanity-update-webhook.js (or app/api/sanity-update-webhook/route.js for App Router)

import { CacheInvalidationService } from '@/components/Blog/cacheInvalidation';

// For Pages Router (pages/api/sanity-update-webhook.js)
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  // Verify webhook secret
  const receivedSecret = req.headers['sanity-webhook-secret'] || req.body.secret;
  const expectedSecret = 'US3PE3jFjvyQ9Z6Y'; // Your secret key
  
  if (receivedSecret !== expectedSecret) {
    console.log('Webhook secret mismatch');
    return res.status(401).json({ message: 'Unauthorized' });
  }

  try {
    const { _type, operation } = req.body;
    
    console.log('Webhook received:', { _type, operation });
    
    // Invalidate cache based on document type
    if (_type) {
      CacheInvalidationService.invalidateByDocumentType(_type);
      
      // Also invalidate page-specific caches
      if (_type === 'seo') {
        CacheInvalidationService.invalidatePageCache('seo');
      }
    }

    // Broadcast update to all clients
    broadcastUpdate(_type, operation);
    
    return res.status(200).json({ 
      message: 'Webhook processed successfully',
      type: _type,
      operation 
    });
    
  } catch (error) {
    console.error('Webhook processing error:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
}

// Simple in-memory broadcast system (for production, use Redis or a proper pub/sub system)
const clients = new Set();

function broadcastUpdate(type, operation) {
  const message = JSON.stringify({
    type: 'sanity-update',
    documentType: type,
    operation,
    timestamp: Date.now()
  });

  clients.forEach(client => {
    try {
      client.write(`data: ${message}\n\n`);
    } catch (error) {
      clients.delete(client);
    }
  });
}

// SSE endpoint for real-time updates
// pages/api/sanity-updates-stream.js
export default function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  // Set up SSE headers
  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    'Connection': 'keep-alive',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Cache-Control'
  });

  // Add client to broadcast list
  clients.add(res);

  // Send initial connection message
  res.write(`data: ${JSON.stringify({ type: 'connected', timestamp: Date.now() })}\n\n`);

  // Handle client disconnect
  req.on('close', () => {
    clients.delete(res);
  });
}

// For App Router (app/api/sanity-update-webhook/route.js)
export async function POST(request) {
  try {
    const body = await request.json();
    const receivedSecret = request.headers.get('sanity-webhook-secret') || body.secret;
    const expectedSecret = 'US3PE3jFjvyQ9Z6Y';
    
    if (receivedSecret !== expectedSecret) {
      return Response.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const { _type, operation } = body;
    
    console.log('Webhook received:', { _type, operation });
    
    if (_type) {
      CacheInvalidationService.invalidateByDocumentType(_type);
      
      if (_type === 'seo') {
        CacheInvalidationService.invalidatePageCache('seo');
      }
    }

    // Store update notification in localStorage for client-side detection
    // This is a fallback method since we can't directly broadcast from API routes
    
    return Response.json({ 
      message: 'Webhook processed successfully',
      type: _type,
      operation 
    });
    
  } catch (error) {
    console.error('Webhook processing error:', error);
    return Response.json({ message: 'Internal server error' }, { status: 500 });
  }
}