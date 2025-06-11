// Simple in-memory broadcast system (for production, use Redis or a proper pub/sub system)
const clients = new Set();

// SSE endpoint for real-time updates
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

// Function to broadcast updates (can be called from other parts of the application)
export function broadcastUpdate(type, operation) {
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