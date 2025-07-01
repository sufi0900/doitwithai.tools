// app/api/sanity-update-webhook/route.js
import { revalidatePath, revalidateTag } from 'next/cache';
import { redisHelpers } from '@/app/lib/redis'; // Use redisHelpers instead of redisClient
import crypto from 'crypto';

const SANITY_WEBHOOK_SECRET = process.env.SANITY_WEBHOOK_SECRET;

/**
 * Verify Sanity webhook signature using HMAC-SHA256
 */
function verifySignature(body, signature, secret) {
  if (!signature || !secret) {
    return false;
  }

  // Remove 'sha256=' prefix if present
  const cleanSignature = signature.replace(/^sha256=/, '');
  
  // Create HMAC signature
  const expectedSignature = crypto
    .createHmac('sha256', secret)
    .update(body, 'utf8')
    .digest('hex');

  // Use timingSafeEqual to prevent timing attacks
  return crypto.timingSafeEqual(
    Buffer.from(cleanSignature, 'hex'),
    Buffer.from(expectedSignature, 'hex')
  );
}

/**
 * Handles incoming POST requests from Sanity webhooks.
 */
export async function POST(req) {
  console.log('[Webhook] Received webhook request');

  // 1. Verify the request method is POST
  if (req.method !== 'POST') {
    return new Response('Method Not Allowed', { status: 405 });
  }

  try {
    // 2. Read the raw body for signature verification
    const rawBody = await req.text();
    const body = JSON.parse(rawBody);
    
    const signature = req.headers.get('sanity-signature');
    
    console.log('[Webhook] Signature received:', signature ? 'Yes' : 'No');
    console.log('[Webhook] Document type:', body._type);
    console.log('[Webhook] Slug:', body.slug?.current);

    // 3. Basic security check
    if (!SANITY_WEBHOOK_SECRET) {
      console.error('[Webhook] SANITY_WEBHOOK_SECRET is not set in environment variables.');
      return new Response('Server configuration error: Webhook secret missing.', { status: 500 });
    }

    // 4. Verify signature
    if (!verifySignature(rawBody, signature, SANITY_WEBHOOK_SECRET)) {
      console.warn('[Webhook] Invalid Sanity webhook signature.');
      return new Response('Invalid signature', { status: 401 });
    }

    console.log('[Webhook] Signature verified successfully');

    // 5. Extract relevant data from the Sanity payload
    const { _type, slug } = body;

    if (!_type) {
      return new Response('Bad Request: Missing _type in payload', { status: 400 });
    }

    if (!slug?.current) {
      console.warn('[Webhook] No slug found in payload, skipping cache invalidation');
      return new Response('No slug found - no cache to invalidate', { status: 200 });
    }

    // 6. Define cache keys and tags based on the Sanity document type
    let redisCacheKey;
    let revalidationTags = [];
    let revalidationPaths = [];

    switch (_type) {
      case 'aitool':
        redisCacheKey = `article:aitool:${slug.current}`;
        revalidationTags = ['aitool', slug.current];
        revalidationPaths = ['/ai-tools', `/ai-tools/${slug.current}`];
        break;

      case 'seo':
        redisCacheKey = `article:seo:${slug.current}`;
        revalidationTags = ['seo', slug.current];
        revalidationPaths = ['/ai-seo', `/ai-seo/${slug.current}`];
        break;

      case 'makemoney':
        redisCacheKey = `article:makemoney:${slug.current}`;
        revalidationTags = ['makemoney', slug.current];
        revalidationPaths = ['/ai-learn-earn', `/ai-learn-earn/${slug.current}`];
        break;

      case 'coding':
        redisCacheKey = `article:coding:${slug.current}`;
        revalidationTags = ['coding', slug.current];
        revalidationPaths = ['/ai-code', `/ai-code/${slug.current}`];
        break;

      default:
        console.log(`[Webhook] Received webhook for unhandled type: ${_type}`);
        return new Response('No action taken for this document type', { status: 200 });
    }

    // 7. Invalidate Redis Cache
    if (redisCacheKey) {
      try {
        await redisHelpers.del(redisCacheKey);
        console.log(`[Webhook] Redis cache invalidated for key: ${redisCacheKey}`);
      } catch (redisError) {
        console.error(`[Webhook] Error invalidating Redis cache for ${redisCacheKey}:`, redisError);
        // Continue to revalidate Next.js cache even if Redis fails
      }
    }

    // 8. Invalidate Next.js Data Cache
    try {
      revalidationTags.forEach(tag => {
        revalidateTag(tag);
        console.log(`[Webhook] Next.js cache revalidated for tag: ${tag}`);
      });

      revalidationPaths.forEach(path => {
        revalidatePath(path);
        console.log(`[Webhook] Next.js cache revalidated for path: ${path}`);
      });
    } catch (nextjsRevalidateError) {
      console.error('[Webhook] Error revalidating Next.js cache:', nextjsRevalidateError);
    }

    console.log('[Webhook] Webhook processed successfully!');
    return new Response('Webhook processed successfully!', { status: 200 });

  } catch (error) {
    console.error('[Webhook] Error processing webhook:', error);
    return new Response('Internal server error', { status: 500 });
  }
}