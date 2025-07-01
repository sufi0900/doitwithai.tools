// app/api/sanity-update-webhook/route.js
import { revalidatePath, revalidateTag } from 'next/cache';
import { redisHelpers } from '@/app/lib/redis'; // <--- UPDATED IMPORT

// IMPORTANT: Define your Sanity webhook secret as an environment variable.
// This should be a strong, random string.
// You will set this same secret in your Sanity Studio webhook configuration.
const SANITY_WEBHOOK_SECRET = process.env.SANITY_WEBHOOK_SECRET;

/**
 * Handles incoming POST requests from Sanity webhooks.
 * This function is the "Chef's Assistant" that receives the "Urgent Messenger's" call.
 * It invalidates specific Redis cache keys and Next.js data cache tags
 * based on the content changes in Sanity.
 *
 * @param {Request} req - The incoming Next.js request object.
 * @returns {Response} - A JSON response indicating success or failure.
 */
export async function POST(req) {
  // 1. Verify the request method is POST
  if (req.method !== 'POST') {
    return new Response('Method Not Allowed', { status: 405 });
  }

  // 2. Read the request body and verify the secret
  const body = await req.json();
  const signature = req.headers.get('sanity-signature');

  // Basic security check: ensure a secret is configured in both places
  if (!SANITY_WEBHOOK_SECRET) {
    console.error('SANITY_WEBHOOK_SECRET is not set in environment variables.');
    return new Response('Server configuration error: Webhook secret missing.', { status: 500 });
  }

  // For a more robust signature verification (recommended for production):
  // You would typically use a library like `@sanity/webhook` to verify the signature
  // using the raw body and the secret. For simplicity, we'll do a direct comparison
  // if Sanity-signature is just the secret itself, but usually it's a HMAC hash.

  // If your Sanity webhook config sends the actual secret in 'sanity-signature' header:
  if (signature !== SANITY_WEBHOOK_SECRET) {
    console.warn('Invalid Sanity webhook signature.');
    return new Response('Invalid signature', { status: 401 });
  }

  // 3. Extract relevant data from the Sanity payload
  const { _type, slug } = body; // Sanity sends _type and slug (if available)

  if (!_type) {
    return new Response('Bad Request: Missing _type in payload', { status: 400 });
  }

  // Define cache keys and tags based on the Sanity document type
  let redisCacheKey;
  let revalidationTags = [];
  let revalidationPaths = [];

  switch (_type) {
    case 'aitool':
      redisCacheKey = `article:aitool:${slug?.current}`;
      revalidationTags = ['aitool', slug?.current]; // Tag for specific article, and general 'aitool' tag
      revalidationPaths = ['/ai-tools', `/ai-tools/${slug?.current}`]; // Revalidate listing page and specific slug page
      break;

    case 'seo':
      redisCacheKey = `article:seo:${slug?.current}`;
      revalidationTags = ['seo', slug?.current];
      revalidationPaths = ['/ai-seo', `/ai-seo/${slug?.current}`];
      break;

    case 'makemoney': // Assuming this maps to 'ai-learn-earn'
      redisCacheKey = `article:makemoney:${slug?.current}`;
      revalidationTags = ['makemoney', slug?.current];
      revalidationPaths = ['/ai-learn-earn', `/ai-learn-earn/${slug?.current}`];
      break;

    case 'coding':
      redisCacheKey = `article:coding:${slug?.current}`;
      revalidationTags = ['coding', slug?.current];
      revalidationPaths = ['/ai-code', `/ai-code/${slug?.current}`];
      break;

    default:
      // If it's a type you don't explicitly handle, you might still want to revalidate a general path
      // or do nothing. For now, log and ignore.
      console.log(`Received webhook for unhandled type: ${_type}`);
      return new Response('No action taken for this document type', { status: 200 });
  }

  // 4. Invalidate Redis Cache (the "Super-Fast Pantry")
  if (redisCacheKey) {
    try {
      await redisHelpers.del(redisCacheKey); // <--- USE HELPER
      console.log(`[Redis Cache Invalidated] for key: ${redisCacheKey}`);
    } catch (redisError) {
      console.error(`Error invalidating Redis cache for ${redisCacheKey}:`, redisError);
      // Don't stop here, continue to revalidate Next.js cache
    }
  }

  // 5. Invalidate Next.js Data Cache (the "Chef's Internal Notes")
  // Use revalidateTag for more granular invalidation if your fetches use tags.
  // Use revalidatePath for specific paths (e.g., listing pages).
  try {
    revalidationTags.forEach(tag => {
      revalidateTag(tag);
      console.log(`[Next.js Cache Revalidated] for tag: ${tag}`);
    });

    revalidationPaths.forEach(path => {
      revalidatePath(path);
      console.log(`[Next.js Cache Revalidated] for path: ${path}`);
    });
  } catch (nextjsRevalidateError) {
    console.error('Error revalidating Next.js cache:', nextjsRevalidateError);
  }

  return new Response('Webhook processed successfully!', { status: 200 });
}