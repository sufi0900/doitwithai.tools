// app/api/sanity-update-webhook/route.js
import { revalidatePath, revalidateTag } from 'next/cache';
import { redisHelpers } from '@/app/lib/redis';
import crypto from 'crypto';

const SANITY_WEBHOOK_SECRET = process.env.SANITY_WEBHOOK_SECRET;

/**
 * Verify Sanity webhook signature using their standard format
 */
function verifySignature(body, signature, secret) {
  if (!signature || !secret) {
    console.log('[Webhook] Missing signature or secret');
    return false;
  }

  try {
    // Sanity signature format: t=timestamp,v1=signature
    const parts = signature.split(',');
    let timestamp, signatureHash;

    for (const part of parts) {
      const [key, value] = part.split('=');
      if (key === 't') {
        timestamp = value;
      } else if (key === 'v1') {
        signatureHash = value;
      }
    }

    if (!timestamp || !signatureHash) {
      console.log('[Webhook] Invalid signature format');
      return false;
    }

    // Create the payload that Sanity signs: timestamp + "." + body
    // This is the correct format for Sanity webhook signature verification
    const payload = `${timestamp}.${body}`;

    // Create HMAC signature
    const expectedSignature = crypto
      .createHmac('sha256', secret)
      .update(payload, 'utf8')
      .digest('base64')
      .replace(/\+/g, '-')   // Convert + to -
      .replace(/\//g, '_')   // Convert / to _
      .replace(/=+$/, '');   // Remove trailing =


    console.log('[Webhook] Timestamp:', timestamp);
    console.log('[Webhook] Received signature:', signatureHash);
    console.log('[Webhook] Expected signature:', expectedSignature);
    console.log('[Webhook] Signatures match:', signatureHash === expectedSignature);

    return signatureHash === expectedSignature;
  } catch (error) {
    console.error('[Webhook] Error in signature verification:', error);
    return false;
  }
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

    // Check for the correct Sanity webhook signature header
    const signature = req.headers.get('sanity-webhook-signature');

    console.log('[Webhook] Signature received:', signature ? 'Yes' : 'No');
    if (signature) {
      console.log('[Webhook] Signature value:', signature);
    }
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

    // Note: Free resources might not always have a slug if they are just files/assets.
    // If you have individual pages for free resources, then slug is relevant.
    // If not, the slug check below might prevent invalidation of the main list.
    // Assuming free resources CAN have slugs for individual pages.
    // If not, you might remove the `if (!slug?.current)` check for `freeResources` type.


    // 6. Define cache keys and tags based on the Sanity document type
    let redisCacheKey; // For individual document pages (if they exist)
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
      // --- NEW CASE FOR FREE RESOURCES ---
      case 'freeResources': // Assuming your Sanity document type for free resources is 'freeResources'
        // Invalidate the main listing cache, featured cache, and counts cache
        // If free resources also have individual slug pages, add that too.
        redisCacheKey = slug?.current ? `article:free-resource:${slug.current}` : null; // If individual page
        revalidationTags = ['freeResource']; // General tag for all free resources
        revalidationPaths = ['/free-ai-resources']; // Invalidate the main listing page
        if (slug?.current) {
          revalidationPaths.push(`/free-ai-resources/${slug.current}`); // If individual page
        }
        // Also invalidate the specific list caches for the main listing page
        // We can't know the exact page/sort/filter combination, so we invalidate the general list tag.
        // For Redis, we need to be more aggressive or use a pattern if possible.
        // For now, relying on `revalidateTag('freeResource')` for the list is sufficient.
        await redisHelpers.del('featured:free-resources'); // Invalidate featured cache
        await redisHelpers.del('counts:free-resources'); // Invalidate counts cache
        console.log(`[Webhook] Invalidated specific free resource caches: featured:free-resources, counts:free-resources`);
        break;
      // --- END NEW CASE ---
      default:
        console.log(`[Webhook] Received webhook for unhandled type: ${_type}`);
        return new Response('No action taken for this document type', { status: 200 });
    }

    // 7. Invalidate Redis Cache (for individual document page if applicable)
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
