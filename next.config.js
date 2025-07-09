// next.config.js

const withPWA = require('next-pwa')({
  dest: 'public',
  register: true, // Let next-pwa handle the registration
  skipWaiting: true, // Install new SW version immediately
  disable: process.env.NODE_ENV === 'development',
  fallbacks: {
    document: '/offline.html', // The key to showing your offline page!
  },
  runtimeCaching: [
    // Your existing caching strategies are good, but let's refine them.
    // This example uses a NetworkFirst strategy for pages and data.
    {
      urlPattern: ({ request }) => request.mode === 'navigate',
      handler: 'NetworkFirst',
      options: {
        cacheName: 'pages-cache',
        networkTimeoutSeconds: 10,
        expiration: {
          maxEntries: 50,
          maxAgeSeconds: 30 * 24 * 60 * 60, // 30 Days
        },
      },
    },
    {
      urlPattern: /\/_next\/data\/.+\.json$/,
      handler: 'NetworkFirst',
      options: {
        cacheName: 'next-data-cache',
        networkTimeoutSeconds: 10, // Attempt network but fall back to cache
        expiration: {
          maxEntries: 32,
          maxAgeSeconds: 24 * 60 * 60, // 1 Day
        },
      },
    },
     {
      urlPattern: /.*\?_rsc=.*/i, // Catches RSC payloads
      handler: 'NetworkFirst',
      options: {
        cacheName: 'rsc-cache',
        networkTimeoutSeconds: 10,
        expiration: {
          maxEntries: 32,
          maxAgeSeconds: 24 * 60 * 60, // 1 Day
        },
      },
    },
    {
      urlPattern: /\.(?:png|gif|jpg|jpeg|svg|webp)$/,
      handler: 'CacheFirst',
      options: {
        cacheName: 'images-cache',
        expiration: {
          maxEntries: 60,
          maxAgeSeconds: 30 * 24 * 60 * 60, // 30 Days
        },
      },
    },
    {
      urlPattern: /\.(?:js|css)$/,
      handler: 'StaleWhileRevalidate',
      options: {
        cacheName: 'static-resources-cache',
         expiration: {
          maxEntries: 60,
          maxAgeSeconds: 24 * 60 * 60, // 1 Day
        },
      },
    },
     {
      urlPattern: ({ url }) => url.hostname.includes('sanity.io'),
      handler: 'StaleWhileRevalidate',
      options: {
        cacheName: 'sanity-api-cache',
        expiration: {
          maxEntries: 10,
          maxAgeSeconds: 60 * 60, // 1 hour
        },
      },
    },
  ],
});



module.exports = withPWA(nextConfig);
const nextConfig = {
  reactStrictMode: true, // Change back to true

  images: {
    domains: ['your-sanity-domain.com'],
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
  // Important for Vercel Service Worker
  experimental: {
    serverActions: {
      allowedOrigins: ['localhost:3000', '*.vercel.app'],
    }
  }
};

module.exports = withPWA(nextConfig);
