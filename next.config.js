// next.config.js
const withPWA = require('next-pwa')({
  dest: 'public', // Output directory for the generated service worker files
  register: true, // Automatically register the service worker
  skipWaiting: true, // Activate the new service worker immediately
  disable: process.env.NODE_ENV === 'development', // Disable PWA in development for easier debugging
  buildExcludes: [
    /middleware.js$/, // Exclude Next.js middleware files
    /_ssgManifest.js$/, // Exclude Next.js internal manifest
    // If you have any other files in `public` that should NOT be precached by the SW, add them here.
    // For example, if you manually created a `public/sw-custom.js` for push notifications,
    // you might exclude it here if you don't want next-pwa to touch it.
  ],
  // This is the file that next-pwa will generate/use.
  // By default, it's 'sw.js'. You can change it if you want.
  // swSrc: 'public/sw.js', // If you were providing a custom SW source, you'd specify it here.
                          // But for general caching, let next-pwa generate it.

  runtimeCaching: [
    // 1. Next.js Static Assets (JS, CSS, images, etc. from _next/static)
    // These are your main application bundles. Must be CacheFirst for offline.
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
    // 2. Google Fonts (Stylesheets)
    {
      urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
      handler: 'StaleWhileRevalidate',
      options: {
        cacheName: 'google-fonts-stylesheets',
        expiration: {
          maxEntries: 4,
          maxAgeSeconds: 24 * 60 * 60 * 30, // 30 days
        },
      },
    },
    // 3. Google Fonts (Font Files)
    {
      urlPattern: /^https:\/\/fonts\.gstatic\.com\/.*/i,
      handler: 'CacheFirst',
      options: {
        cacheName: 'google-fonts-webfonts',
        expiration: {
          maxEntries: 64,
          maxAgeSeconds: 24 * 60 * 60 * 30, // 30 days
        },
        cacheableResponse: {
          statuses: [0, 200],
        },
      },
    },
    // 4. Sanity Images (cdn.sanity.io)
    {
      urlPattern: /^https:\/\/cdn\.sanity\.io\/.*/i,
      handler: 'CacheFirst',
      options: {
        cacheName: 'sanity-images',
        expiration: {
          maxEntries: 64,
          maxAgeSeconds: 24 * 60 * 60 * 30, // 30 days
        },
        cacheableResponse: {
          statuses: [0, 200],
        },
      },
    },
    // 5. Your Next.js API route for Sanity data (e.g., /api/sanity-cache)
    // This is CRUCIAL for offline data. Change NetworkFirst to StaleWhileRevalidate or CacheFirst.
    {
      urlPattern: ({ url }) => url.pathname.startsWith('/api/sanity-cache'), // <--- CONFIRM THIS IS YOUR ACTUAL API ROUTE PATH
      handler: 'StaleWhileRevalidate', // Serve from cache immediately, then revalidate in background
      options: {
        cacheName: 'local-api-cache',
        expiration: {
          maxEntries: 50,
          maxAgeSeconds: 24 * 60 * 60 * 7, // Cache for 7 days
        },
        cacheableResponse: {
          statuses: [0, 200],
        },
      },
    },
    // 6. Direct Sanity API calls (if any server components directly fetch from Sanity's API)
    {
      urlPattern: /^https:\/\/.*\.sanity\.io\/v\d+\/data\/(query|mutate)\/.*/i,
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
    // 7. HTML Pages (Navigation Requests)
    // This is vital for showing *any* page offline.
    {
      urlPattern: ({ request }) => request.mode === 'navigate',
      handler: 'NetworkFirst', // Try network for fresh page, then fall back to cache
      options: {
        cacheName: 'html-pages',
        expiration: {
          maxEntries: 20,
          maxAgeSeconds: 24 * 60 * 60, // 1 day
        },
      },
    },
    // 8. Other general static assets (if not covered by /_next/static)
    {
      urlPattern: /\.(?:png|jpg|jpeg|webp|svg|gif|ico|json|css)$/,
      handler: 'CacheFirst',
      options: {
        cacheName: 'other-static-assets',
        expiration: {
          maxEntries: 50,
          maxAgeSeconds: 24 * 60 * 60 * 7, // 7 days
        },
      },
    },
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
};

module.exports = withPWA(nextConfig);
