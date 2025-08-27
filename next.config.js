const withPWA = require('next-pwa')({
  dest: 'public',
  register: false, // We'll handle registration manually
  skipWaiting: false,
  disable: process.env.NODE_ENV === 'development',
  
  publicExcludes: ['!robots.txt', '!sitemap.xml'],
  buildExcludes: [
    /app-build-manifest\.json$/,
    /react-loadable-manifest\.json$/,
    /_buildManifest\.js$/,
    /_ssgManifest\.js$/
  ],
  
  fallbacks: {
    document: '/offline.html',
    image: '/offline.html',
    audio: '/offline.html', 
    video: '/offline.html',
    font: '/offline.html'
  },
  
  runtimeCaching: [
    // 1. CRITICAL: Homepage only - Cache First
    {
      urlPattern: /^https:\/\/.*\/(?:\?.*)?$/i, // Root page with optional query params
      handler: 'CacheFirst',
      options: {
        cacheName: 'homepage-v1',
        expiration: {
          maxEntries: 1, // Only homepage
          maxAgeSeconds: 30 * 24 * 60 * 60, // 30 days
        },
        cacheableResponse: {
          statuses: [0, 200],
        },
      },
    },

    // 2. CRITICAL: Offline page - Cache First
    {
      urlPattern: /^https:\/\/.*\/offline\.html$/i,
      handler: 'CacheFirst',
      options: {
        cacheName: 'offline-page-v1',
        expiration: {
          maxEntries: 1,
          maxAgeSeconds: 30 * 24 * 60 * 60, // 30 days
        },
        cacheableResponse: {
          statuses: [0, 200],
        },
      },
    },

    // 3. RECENT PAGES: Only 5 most recent article pages
    {
      urlPattern: /^https:\/\/.*\/(ai-tools|ai-seo|ai-code|ai-learn-earn)\/[^\/]+\/?$/i,
      handler: 'NetworkFirst',
      options: {
        cacheName: 'recent-pages-v1',
        networkTimeoutSeconds: 3,
        expiration: {
          maxEntries: 5, // STRICT: Only 5 recent pages
          maxAgeSeconds: 2 * 60 * 60, // 2 hours only
        },
        cacheableResponse: {
          statuses: [0, 200],
        },
        plugins: [{
          cacheKeyWillBeUsed: async ({ request }) => {
            const url = new URL(request.url);
            return url.origin + url.pathname.replace(/\/$/, '') || '/';
          },
          // Custom LRU eviction for recent pages
          cacheDidUpdate: async ({ cacheName, request }) => {
            const cache = await caches.open(cacheName);
            const keys = await cache.keys();
            
            // If we exceed 5 entries, remove the oldest
            if (keys.length > 5) {
              const oldestKey = keys[0];
              await cache.delete(oldestKey);
              console.log('🗑️ Evicted oldest page from recent cache');
            }
          }
        }]
      },
    },

    // 4. MINIMAL: Essential Next.js data only
    {
      urlPattern: /\/_next\/data\/.*\/(|ai-tools|ai-seo|ai-code|ai-learn-earn)/i,
      handler: 'NetworkFirst',
      options: {
        cacheName: 'essential-data-v1',
        networkTimeoutSeconds: 2,
        expiration: {
          maxEntries: 6, // Homepage + 5 recent pages
          maxAgeSeconds: 1 * 60 * 60, // 1 hour only
        },
        cacheableResponse: {
          statuses: [0, 200],
        },
      },
    },

    // 5. CRITICAL: Next.js static assets (minimal)
    {
      urlPattern: /\/_next\/static\/.*/i,
      handler: 'CacheFirst',
      options: {
        cacheName: 'next-static-minimal-v1',
        expiration: {
          maxEntries: 20, // Very limited
          maxAgeSeconds: 30 * 24 * 60 * 60, // 30 days
        },
        cacheableResponse: {
          statuses: [0, 200],
        },
        plugins: [{
          cacheDidUpdate: async ({ cacheName }) => {
            // Monitor cache size
            const cache = await caches.open(cacheName);
            const keys = await cache.keys();
            console.log(`📦 Static cache size: ${keys.length} entries`);
          }
        }]
      },
    },

    // 6. MINIMAL: Critical images only
    {
      urlPattern: /^https:\/\/.*\.(png|jpg|jpeg|svg|gif|webp|ico)$/i,
      handler: 'NetworkFirst',
      options: {
        cacheName: 'critical-images-v1',
        networkTimeoutSeconds: 3,
        expiration: {
          maxEntries: 10, // Very limited - only critical images
          maxAgeSeconds: 7 * 24 * 60 * 60, // 7 days
        },
        cacheableResponse: {
          statuses: [0, 200],
        },
      },
    },

    // 7. FONTS: Google Fonts only
    {
      urlPattern: /^https:\/\/fonts\.(googleapis|gstatic)\.com\/.*/i,
      handler: 'CacheFirst',
      options: {
        cacheName: 'fonts-v1',
        expiration: {
          maxEntries: 5,
          maxAgeSeconds: 30 * 24 * 60 * 60, // 30 days
        },
        cacheableResponse: {
          statuses: [0, 200],
        },
      },
    },
  ],
});

const nextConfig = {
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },
  
  optimizeFonts: true,
  
  images: {
    domains: ['your-sanity-domain.com'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    formats: ['image/webp'],
    remotePatterns: [{
      protocol: "https",
      hostname: "cdn.sanity.io",
      port: "",
    }],
  },
  
  experimental: {
    serverActions: {
      allowedOrigins: ['localhost:3000', '*.vercel.app'],
    },
    optimizeCss: true,
  },
  
  trailingSlash: true,
  
  async rewrites() {
    return [
      {
        source: '/sw.js',
        destination: '/sw.js',
      },
    ];
  },

  // Force no-cache on service worker
  async headers() {
    return [
      {
        source: '/sw.js',
        headers: [
          {
            key: 'Cache-Control',
            value: 'no-cache, no-store, must-revalidate',
          },
          {
            key: 'Pragma',
            value: 'no-cache',
          },
          {
            key: 'Expires',
            value: '0',
          },
        ],
      },
    ];
  },
};

module.exports = withPWA(nextConfig);