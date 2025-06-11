import { CacheInvalidationService } from '@/components/Blog/cacheInvalidation';

export async function POST(request) {
  try {
    const body = await request.json();
    const receivedSecret = request.headers.get('sanity-webhook-secret') || body.secret;
    const expectedSecret = 'US3PE3jFjvyQ9Z6Y';
    
    if (receivedSecret !== expectedSecret) {
      console.error('Invalid webhook secret');
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { _type: documentType, _id, action } = body;
    
    console.log('Sanity webhook received:', { documentType, _id, action });

    if (documentType) {
      CacheInvalidationService.invalidateByDocumentType(documentType);
    }

    const timestamp = Date.now().toString();
    
    // For App Router, we'll use a different approach since localStorage isn't available
    // We'll store in a global variable or use a different state management solution
    
    return Response.json({ 
      success: true, 
      message: 'Webhook processed successfully',
      documentType,
      timestamp 
    });

  } catch (error) {
    console.error('Webhook processing error:', error);
    return Response.json({ error: 'Internal server error' }, { status: 500 });
  }
}