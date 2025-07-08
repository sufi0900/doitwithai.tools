const withPWA = require('next-pwa')({
  dest: 'public',
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === 'development', // Disable in dev
  buildExcludes: [/middleware.js$/, /_ssgManifest.js$/], // Add _ssgManifest.js to exclusions

  runtimeCaching: [
    {
      // Cache Google Fonts stylesheets
      urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
      handler: 'CacheFirst',
      options: {
        cacheName: 'google-fonts-stylesheets',
        expiration: {
          maxEntries: 4,
          maxAgeSeconds: 24 * 60 * 60 * 30, // 30 days
        },
      },
    },
    {
      // Cache Google Fonts font files
      urlPattern: /^https:\/\/fonts\.gstatic\.com\/.*/i,
      handler: 'CacheFirst',
      options: {
        cacheName: 'google-fonts-webfonts',
        expiration: {
          maxEntries: 64,
          maxAgeSeconds: 24 * 60 * 60 * 30, // 30 days
        },
      },
    },
    {
      // Sanity Images (cdn.sanity.io) - CacheFirst is generally good for images
      urlPattern: /^https:\/\/cdn\.sanity\.io\/.*/i,
      handler: 'CacheFirst',
      options: {
        cacheName: 'sanity-images',
        expiration: {
          maxEntries: 64,
          maxAgeSeconds: 24 * 60 * 60 * 30, // 30 days
        },
        cacheableResponse: {
          statuses: [0, 200], // Cache opaque responses too (for cross-origin images)
        },
      },
    },
    {
      // Your Next.js API route for Sanity data (e.g., /api/sanity-cache)
      // This is CRUCIAL for offline data.
      // If your useUnifiedCache relies on this, it must be available offline.
      // A NetworkFirst strategy will FAIL OFFLINE. Use StaleWhileRevalidate or CacheFirst.
      // Assuming your API route is /api/sanity-cache
      urlPattern: ({ url }) => url.pathname.startsWith('/api/sanity-cache'), // <--- ADJUST THIS TO YOUR ACTUAL API ROUTE PATH
      handler: 'StaleWhileRevalidate', // Serve from cache immediately, then revalidate in background
      options: {
        cacheName: 'local-api-cache',
        expiration: {
          maxEntries: 50, // Keep a reasonable number of API responses cached
          maxAgeSeconds: 24 * 60 * 60 * 7, // Cache for 7 days
        },
        cacheableResponse: {
          statuses: [0, 200], // Important for cross-origin fetches if applicable, and for 200 OK
        },
      },
    },
    {
      // General Sanity API calls (if directly hitting Sanity's API, not your /api/ route)
      // This might be the Sanity client in your server components.
      // For these, StaleWhileRevalidate is often a good balance.
      urlPattern: /^https:\/\/.*\.sanity\.io\/v\d+\/data\/query\/.*|.*\.sanity\.io\/v\d+\/data\/mutate\/.*/i, // Adjust if your Sanity API calls use a different pattern
      handler: 'StaleWhileRevalidate',
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
      urlPattern: /\.(?:js|css|json|webp|png|jpg|jpeg|svg|gif|ico)$/, // Added json, webp, gif
      handler: 'CacheFirst',
      options: {
        cacheName: 'static-resources',
        expiration: {
          maxEntries: 100, // Increased entries
          maxAgeSeconds: 24 * 60 * 60 * 7, // 7 days
        },
      },
    },
    {
      // Fallback for HTML pages (very important for offline navigation)
      // This will cache and serve your HTML pages.
      urlPattern: ({ request }) => request.mode === 'navigate',
      handler: 'NetworkFirst', // Try network for fresh page, then fall back to cache
      options: {
        cacheName: 'html-pages',
        expiration: {
          maxEntries: 20, // Cache up to 20 HTML pages
          maxAgeSeconds: 24 * 60 * 60, // Cache for 1 day
        },
      },
    },
  ],
});

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
  images: {
    domains: ['your-sanity-domain.com'], // Ensure this matches your actual Sanity domain, e.g., "cdn.sanity.io"
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
};

module.exports = withPWA(nextConfig);
