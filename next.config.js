// next.config.js
const withPWA = require('next-pwa')({
  dest: 'public',
  register: true, // <--- CHANGE THIS BACK TO TRUE! Let next-pwa handle registration.
  skipWaiting: true,
  disable: process.env.NODE_ENV === 'development',
  buildExcludes: [
    /middleware.js$/,
    /_ssgManifest.js$/,
  ],
  // Do NOT specify swSrc unless you have a completely custom Workbox-integrated SW.
  // Let next-pwa generate its own.

  runtimeCaching: [
    {
      urlPattern: ({ url }) => url.pathname.startsWith('/_next/static/'),
      handler: 'CacheFirst',
      options: {
        cacheName: 'next-static-assets',
        expiration: {
          maxEntries: 100,
          maxAgeSeconds: 24 * 60 * 60 * 30, // 30 days
        },
        cacheableResponse: {
          statuses: [0, 200],
        },
      },
    },
    {
      urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
      handler: 'StaleWhileRevalidate',
      options: {
        cacheName: 'google-fonts-stylesheets',
        expiration: {
          maxEntries: 4,
          maxAgeSeconds: 24 * 60 * 60 * 30,
        },
      },
    },
    {
      urlPattern: /^https:\/\/fonts\.gstatic\.com\/.*/i,
      handler: 'CacheFirst',
      options: {
        cacheName: 'google-fonts-webfonts',
        expiration: {
          maxEntries: 64,
          maxAgeSeconds: 24 * 60 * 60 * 30,
        },
        cacheableResponse: {
          statuses: [0, 200],
        },
      },
    },
    {
      urlPattern: /^https:\/\/cdn\.sanity\.io\/.*/i,
      handler: 'CacheFirst',
      options: {
        cacheName: 'sanity-images',
        expiration: {
          maxEntries: 64,
          maxAgeSeconds: 24 * 60 * 60 * 30,
        },
        cacheableResponse: {
          statuses: [0, 200],
        },
      },
    },
    {
      // Your Next.js API route for Sanity data (e.g., /api/sanity-cache)
      // CHANGE TO STALEWHILEREVALIDATE FOR OFFLINE RESILIENCE
      urlPattern: ({ url }) => url.pathname.startsWith('/api/sanity-cache'), // <--- CONFIRM THIS IS YOUR ACTUAL API ROUTE PATH
      handler: 'StaleWhileRevalidate', // <--- CRITICAL CHANGE
      options: {
        cacheName: 'local-api-cache',
        expiration: {
          maxEntries: 50,
          maxAgeSeconds: 24 * 60 * 60 * 7, // 7 days
        },
        cacheableResponse: {
          statuses: [0, 200],
        },
      },
    },
    {
      // Direct Sanity API calls (if any server components directly fetch from Sanity's API)
      // CHANGE TO STALEWHILEREVALIDATE FOR OFFLINE RESILIENCE
      urlPattern: /^https:\/\/.*\.sanity\.io\/v\d+\/data\/(query|mutate)\/.*/i,
      handler: 'StaleWhileRevalidate', // <--- CRITICAL CHANGE
      options: {
        cacheName: 'sanity-direct-api',
        expiration: {
          maxEntries: 32,
          maxAgeSeconds: 24 * 60 * 60, // 1 day
        },
        cacheableResponse: {
          statuses: [0, 200],
        },
      },
    },
    {
      // Next.js dynamic assets (JS, CSS, images for dynamic routes)
      // Cache first is often ideal for ensuring the app shell loads offline.
      urlPattern: /\.(?:js|css|json|webp|png|jpg|jpeg|svg|gif|ico)$/,
      handler: 'CacheFirst',
      options: {
        cacheName: 'static-resources',
        expiration: {
          maxEntries: 100,
          maxAgeSeconds: 24 * 60 * 60 * 7, // 7 days
        },
      },
    },
    {
      // HTML Pages (Navigation Requests)
      // NetworkFirst is generally good for HTML to ensure freshness, but falls back to cache.
      urlPattern: ({ request }) => request.mode === 'navigate',
      handler: 'NetworkFirst',
      options: {
        cacheName: 'html-pages',
        expiration: {
          maxEntries: 20,
          maxAgeSeconds: 24 * 60 * 60, // 1 day
        },
      },
    },
    // IMPORTANT: Remove or adjust the vercel-pages rule if it's causing issues.
    // The previous `html-pages` and `next-static-assets` should cover most Vercel-served content.
    // If you're seeing issues with Vercel's internal asset paths, ensure the urlPattern is correct.
    // For now, let's remove it to simplify.
    // {
    //   urlPattern: /^https:\/\/.*\.vercel\.app\/.*/i,
    //   handler: 'NetworkFirst',
    //   options: {
    //     cacheName: 'vercel-pages',
    //     networkTimeoutSeconds: 10,
    //     expiration: {
    //       maxEntries: 50,
    //       maxAgeSeconds: 24 * 60 * 60, // 1 day
    //     },
    //   },
    // },
  ],
});

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
  images: {
    domains: ['cdn.sanity.io'], // Ensure this matches your actual Sanity domain
    deviceSizes: [640, 750, 828, 1080, 1200, 1920],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    formats: ['image/webp'],
    remotePatterns: [
      {
        protocol: "https",
        hostname: "cdn.sanity.io",
        port: "",
      },
    ],
  },
  // Keep this if you need it for Server Actions, but it's unrelated to PWA core.
  experimental: {
    serverActions: {
      allowedOrigins: ['localhost:3000', '*.vercel.app']
    }
  }
};

module.exports = withPWA(nextConfig);
