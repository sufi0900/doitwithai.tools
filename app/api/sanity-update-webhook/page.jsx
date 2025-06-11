
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