// next.config.js
const withPWA = require('next-pwa')({
  dest: 'public',
  register: true, // Let PWA handle registration
  skipWaiting: true,
  disable: process.env.NODE_ENV === 'development',
  publicExcludes: ['!robots.txt', '!sitemap.xml'],
  buildExcludes: [/app-build-manifest\.json$/],
  runtimeCaching: [
    // Navigation requests - Network first for dynamic content
    {
      urlPattern: /^https:\/\/doitwithai\.tools\/.*$/,
      handler: 'NetworkFirst',
      options: {
        cacheName: 'pages-cache',
        networkTimeoutSeconds: 10,
        expiration: {
          maxEntries: 200,
          maxAgeSeconds: 24 * 60 * 60, // 1 day
        },
        cacheableResponse: {
          statuses: [0, 200],
        },
      },
    },
    // Sanity API
    {
      urlPattern: /^https:\/\/.*\.sanity\.io\/.*/i,
      handler: 'NetworkFirst',
      options: {
        cacheName: 'sanity-api',
        networkTimeoutSeconds: 10,
        expiration: {
          maxEntries: 50,
          maxAgeSeconds: 24 * 60 * 60 * 7, // 7 days
        },
        cacheableResponse: {
          statuses: [0, 200],
        },
      },
    },
    // Sanity Images
    {
      urlPattern: /^https:\/\/cdn\.sanity\.io\/.*/i,
      handler: 'CacheFirst',
      options: {
        cacheName: 'sanity-images',
        expiration: {
          maxEntries: 100,
          maxAgeSeconds: 24 * 60 * 60 * 30, // 30 days
        },
      },
    },
    // Static assets
    {
      urlPattern: /\.(?:js|css|woff2?|png|jpg|jpeg|webp|svg|ico)$/,
      handler: 'CacheFirst',
      options: {
        cacheName: 'static-resources',
        expiration: {
          maxEntries: 100,
          maxAgeSeconds: 24 * 60 * 60 * 30, // 30 days
        },
      },
    },
  ],
});

const nextConfig = {
  reactStrictMode: false, // Keep false to avoid hydration conflicts
  swcMinify: false, // Disable for debugging
  

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