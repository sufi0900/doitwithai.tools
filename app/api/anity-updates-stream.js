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