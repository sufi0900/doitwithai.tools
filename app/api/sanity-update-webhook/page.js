import { CacheInvalidationService } from '@/components/Blog/cacheInvalidation';

// For Pages Router (pages/api/sanity-update-webhook.js)
export default async function handler(req, res) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Verify the webhook secret
    const receivedSecret = req.headers['sanity-webhook-secret'] || req.body.secret;
    const expectedSecret = 'US3PE3jFjvyQ9Z6Y'; // Your secret key
    
    if (receivedSecret !== expectedSecret) {
      console.error('Invalid webhook secret');
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { _type: documentType, _id, action } = req.body;
    
    console.log('Sanity webhook received:', { documentType, _id, action });

    // Invalidate relevant caches based on document type
    if (documentType) {
      CacheInvalidationService.invalidateByDocumentType(documentType);
    }

    // Store update timestamp for each page type that might be affected
    const timestamp = Date.now().toString();
    const pageTypes = ['seo', 'ai-tools', 'coding', 'makemoney', 'default'];
    
    // Set update flags for all page types (they'll check if they're affected)
    pageTypes.forEach(pageType => {
      // This will be checked by the PageRefreshContext polling
      if (typeof window !== 'undefined') {
        localStorage.setItem(`${pageType}_last_cms_update`, timestamp);
      }
    });

    // Broadcast to all connected clients using Server-Sent Events (optional enhancement)
    broadcastUpdate(documentType, timestamp);

    res.status(200).json({ 
      success: true, 
      message: 'Webhook processed successfully',
      documentType,
      timestamp 
    });

  } catch (error) {
    console.error('Webhook processing error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

// Optional: Broadcast function for real-time updates
function broadcastUpdate(documentType, timestamp) {
  // You can implement Server-Sent Events here for real-time updates
  // This is optional but provides instant updates without polling
  console.log(`Broadcasting update for ${documentType} at ${timestamp}`);
}