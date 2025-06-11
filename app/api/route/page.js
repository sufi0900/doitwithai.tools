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