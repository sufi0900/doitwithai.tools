// next.config.js
const withPWA = require('next-pwa')({
  dest: 'public',
  register: false, // <--- Keep this as false since you're using the manual component
  skipWaiting: true, // This is good, makes the new SW activate immediately once installed
  disable: process.env.NODE_ENV === 'development',
  buildExcludes: [
    /middleware.js$/, // Exclude middleware files from PWA build
    /_ssgManifest.js$/, // Exclude SSG manifest (Next.js internal)
  ],
  // Do NOT specify swSrc unless you have a completely custom Workbox-integrated SW.
  // Let next-pwa generate its own /public/sw.js based on your config.

  runtimeCaching: [
    // Next.js static assets (JS, CSS bundles) - CacheFirst is ideal for these
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
    // Google Fonts Stylesheets - StaleWhileRevalidate is good
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
    // Google Fonts Webfonts - CacheFirst is ideal for performance
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
    // Sanity Images - CacheFirst (they rarely change, use maxAgeSeconds for fresh)
    {
      urlPattern: /^https:\/\/cdn\.sanity\.io\/.*/i,
      handler: 'CacheFirst',
      options: {
        cacheName: 'sanity-images',
        expiration: {
          maxEntries: 100, // Increased entries for more images
          maxAgeSeconds: 24 * 60 * 60 * 30, // 30 days, adjust if images change often
        },
        cacheableResponse: {
          statuses: [0, 200],
        },
      },
    },
    // Your Next.js API route for Sanity data (e.g., /api/sanity-cache)
    // StaleWhileRevalidate is critical for data that needs to be fresh but also offline
    {
      urlPattern: ({ url }) => url.pathname.startsWith('/api/sanity-cache'), // <--- CONFIRM THIS IS YOUR ACTUAL API ROUTE PATH
      handler: 'StaleWhileRevalidate', // <--- Recommended for fresh data + offline
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
    // Direct Sanity API calls (if any client components fetch directly from Sanity's API)
    // StaleWhileRevalidate for similar reasons as your local API
    {
      urlPattern: /^https:\/\/.*\.sanity\.io\/v\d+\/data\/(query|mutate)\/.*/i,
      handler: 'StaleWhileRevalidate', // <--- Recommended for fresh data + offline
      options: {
        cacheName: 'sanity-direct-api',
        expiration: {
          maxEntries: 32,
          maxAgeSeconds: 24 * 60 * 60, // 1 day, adjust based on content update frequency
        },
        cacheableResponse: {
          statuses: [0, 200],
        },
      },
    },
    // Generic static resources (other images, fonts not from Google, etc.)
    {
      urlPattern: /\.(?:png|jpg|jpeg|webp|svg|gif|ico|json|css|woff2?|ttf|otf)$/,
      handler: 'CacheFirst',
      options: {
        cacheName: 'other-static-resources',
        expiration: {
          maxEntries: 100,
          maxAgeSeconds: 24 * 60 * 60 * 7, // 7 days
        },
        cacheableResponse: {
          statuses: [0, 200],
        },
      },
    },
    // HTML Pages (Navigation Requests) - NetworkFirst to prioritize fresh content, but with cache fallback
    {
      urlPattern: ({ request }) => request.mode === 'navigate',
      handler: 'NetworkFirst',
      options: {
        cacheName: 'html-pages',
        expiration: {
          maxEntries: 20, // Cache a reasonable number of recent pages
          maxAgeSeconds: 24 * 60 * 60, // 1 day, revalidate daily
        },
        networkTimeoutSeconds: 10, // Max 10 seconds to wait for network
      },
    },
    // If you have third-party scripts (e.g., analytics, external libraries)
    // They are often good candidates for StaleWhileRevalidate
    // Example:
    // {
    //   urlPattern: /^https:\/\/www\.googletagmanager\.com\/.*/i,
    //   handler: 'StaleWhileRevalidate',
    //   options: {
    //     cacheName: 'third-party-scripts',
    //     expiration: {
    //       maxEntries: 10,
    //       maxAgeSeconds: 24 * 60 * 60 * 7, // 7 days
    //     },
    //   },
    // },
  ],
});

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
  images: {
    domains: ['cdn.sanity.io'],
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
  experimental: {
    // Keep this if you need it for Server Actions, otherwise it's not strictly PWA-related.
    serverActions: {
      allowedOrigins: ['localhost:3000', '*.vercel.app']
    }
  }
};

module.exports = withPWA(nextConfig);
