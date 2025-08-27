const withPWA = require('next-pwa')({
  dest: 'public',
  register: true,
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
    document: '/offline.html'
  },
  
  // MINIMAL RUNTIME CACHING - Only essentials
  runtimeCaching: [
    // 1. Homepage ONLY - Most critical
    {
      urlPattern: /^https:\/\/.*\/(|index\.html)?(?:\?.*)?$/i,
      handler: 'CacheFirst',
      options: {
        cacheName: 'homepage-cache-v1',
        expiration: {
          maxEntries: 1, // Only homepage
          maxAgeSeconds: 7 * 24 * 60 * 60, // 7 days
        },
        cacheableResponse: {
          statuses: [0, 200],
        },
      },
    },

    // 2. Offline page - Critical
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

    // 3. Recently visited pages - LIMITED to 5 pages max
    {
      urlPattern: /^https:\/\/.*\/(ai-tools|ai-seo|ai-code|ai-learn-earn|free-ai-resources|ai-news)\/[^\/]+\/?$/i,
      handler: 'NetworkFirst',
      options: {
        cacheName: 'recent-pages-v1',
        networkTimeoutSeconds: 3,
        expiration: {
          maxEntries: 5, // STRICT LIMIT - Only 5 recent pages
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
          // Custom plugin to enforce strict limits
          cacheWillUpdate: async ({ request, response, event }) => {
            // Only cache if it's a successful response
            if (!response || response.status !== 200) {
              return null;
            }
            
            // Check current cache size before adding
            const cache = await caches.open('recent-pages-v1');
            const keys = await cache.keys();
            
            // If we're at limit, remove oldest entry
            if (keys.length >= 5) {
              await cache.delete(keys[0]); // Remove first (oldest) entry
            }
            
            return response;
          }
        }]
      },
    },

    // 4. Critical static assets only
    {
      urlPattern: /\/_next\/static\/.*(css|js)$/i,
      handler: 'CacheFirst',
      options: {
        cacheName: 'critical-static-v1',
        expiration: {
          maxEntries: 20, // Very limited
          maxAgeSeconds: 7 * 24 * 60 * 60, // 7 days
        },
        cacheableResponse: {
          statuses: [0, 200],
        },
      },
    },

    // 5. Essential images only (homepage + offline page)
    {
      urlPattern: /^https:\/\/.*\.(png|jpg|jpeg|svg|webp|ico)$/i,
      handler: 'NetworkFirst',
      options: {
        cacheName: 'essential-images-v1',
        networkTimeoutSeconds: 3,
        expiration: {
          maxEntries: 10, // Very limited
          maxAgeSeconds: 3 * 24 * 60 * 60, // 3 days
        },
        cacheableResponse: {
          statuses: [0, 200],
        },
        plugins: [{
          // Only cache images from specific pages
          requestWillFetch: async ({ request }) => {
            const referer = request.headers.get('referer') || '';
            const isEssentialPage = referer.includes('/offline.html') || 
                                  referer.endsWith('/') || 
                                  referer.includes('/?');
            
            if (!isEssentialPage) {
              // Don't cache images from non-essential pages
              throw new Error('Non-essential image');
            }
            
            return request;
          }
        }]
      },
    },

    // 6. Google Fonts - Essential only
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
    }

    // NO OTHER CACHING - Removed API, data, and general fallback caches
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