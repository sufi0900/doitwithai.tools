// next.config.js - Optimized with strict storage limits
const withPWA = require('next-pwa')({
  dest: 'public',
  register: true,
  skipWaiting: false, // Changed to false for better UX
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
  runtimeCaching: [
    // 1. ESSENTIAL PAGES - Always cached (Root + Offline)
    {
      urlPattern: /^https:\/\/.*\/$/,
      handler: 'StaleWhileRevalidate',
      options: {
        cacheName: 'root-page-v1',
        expiration: {
          maxEntries: 1, // Only root page
          maxAgeSeconds: 7 * 24 * 60 * 60, // 7 days
        },
        cacheableResponse: {
          statuses: [0, 200],
        },
      },
    },

    // 2. STATIC PAGES - Limited caching
    {
      urlPattern: /^https:\/\/.*\/(about|faq|contact|privacy|terms)(?:\/)?$/i,
      handler: 'CacheFirst',
      options: {
        cacheName: 'static-pages-v4',
        expiration: {
          maxEntries: 10, // Reduced from unlimited
          maxAgeSeconds: 30 * 24 * 60 * 60, // 30 days
        },
        cacheableResponse: {
          statuses: [0, 200],
        },
      },
    },

    // 3. DYNAMIC PAGES - Strict limits with LRU eviction
    {
      urlPattern: /^https:\/\/.*\/(ai-tools|ai-seo|ai-code|ai-learn-earn|free-ai-resources|ai-news)\/.*$/i,
      handler: 'NetworkFirst',
      options: {
        cacheName: 'dynamic-pages-v4',
        networkTimeoutSeconds: 3,
        expiration: {
          maxEntries: 15, // Strict limit - only 15 recent articles
          maxAgeSeconds: 24 * 60 * 60, // 1 day
          purgeOnQuotaError: true, // Auto-cleanup on storage errors
        },
        cacheableResponse: {
          statuses: [0, 200],
        },
        plugins: [
          {
            cacheDidUpdate: async ({ cacheName, request }) => {
              // Monitor cache size
              const cache = await caches.open(cacheName);
              const keys = await cache.keys();
              console.log(`Dynamic cache size: ${keys.length}/15 entries`);
            }
          }
        ]
      },
    },

    // 4. CATEGORY PAGES - Limited
    {
      urlPattern: /^https:\/\/.*\/(ai-tools|ai-seo|ai-code|ai-learn-earn)(?:\/)?$/i,
      handler: 'NetworkFirst',
      options: {
        cacheName: 'category-pages-v2',
        networkTimeoutSeconds: 3,
        expiration: {
          maxEntries: 5, // Only 5 category pages
          maxAgeSeconds: 12 * 60 * 60, // 12 hours
        },
        cacheableResponse: {
          statuses: [0, 200],
        },
      },
    },

    // 5. NEXT.JS DATA - Heavily limited
    {
      urlPattern: /\/_next\/data\/.*/i,
      handler: 'NetworkFirst',
      options: {
        cacheName: 'next-data-v4',
        networkTimeoutSeconds: 5,
        expiration: {
          maxEntries: 25, // Reduced from 200
          maxAgeSeconds: 6 * 60 * 60, // 6 hours instead of 7 days
          purgeOnQuotaError: true,
        },
        cacheableResponse: {
          statuses: [0, 200],
        },
      },
    },

    // 6. API ROUTES - Very limited
    {
      urlPattern: /^https:\/\/.*\/api\/.*/i,
      handler: 'NetworkFirst',
      options: {
        cacheName: 'api-cache-v4',
        networkTimeoutSeconds: 5,
        expiration: {
          maxEntries: 20, // Reduced from 100
          maxAgeSeconds: 15 * 60, // 15 minutes instead of 30
          purgeOnQuotaError: true,
        },
        cacheableResponse: {
          statuses: [0, 200],
        },
      },
    },

    // 7. SANITY API - Minimal caching
    {
      urlPattern: /^https:\/\/.*\.sanity\.io\/.*/i,
      handler: 'NetworkFirst',
      options: {
        cacheName: 'sanity-api-v4',
        networkTimeoutSeconds: 8,
        expiration: {
          maxEntries: 15, // Reduced significantly
          maxAgeSeconds: 10 * 60, // 10 minutes
          purgeOnQuotaError: true,
        },
        cacheableResponse: {
          statuses: [0, 200],
        },
      },
    },

    // 8. STATIC ASSETS - Reasonable limits
    {
      urlPattern: /\/_next\/static\/.*/i,
      handler: 'CacheFirst',
      options: {
        cacheName: 'next-static-v4',
        expiration: {
          maxEntries: 50, // Reduced from 100
          maxAgeSeconds: 30 * 24 * 60 * 60, // 30 days
          purgeOnQuotaError: true,
        },
        cacheableResponse: {
          statuses: [0, 200],
        },
      },
    },

    // 9. IMAGES - Limited with size awareness
    {
      urlPattern: /^https:\/\/.*\.(png|jpg|jpeg|svg|gif|webp|ico)$/i,
      handler: 'CacheFirst',
      options: {
        cacheName: 'images-v4',
        expiration: {
          maxEntries: 30, // Significantly reduced
          maxAgeSeconds: 7 * 24 * 60 * 60, // 7 days
          purgeOnQuotaError: true,
        },
        cacheableResponse: {
          statuses: [0, 200],
        },
        plugins: [
          {
            requestWillFetch: async ({ request }) => {
              // Skip caching large images
              try {
                const response = await fetch(request.clone(), { method: 'HEAD' });
                const contentLength = response.headers.get('content-length');
                if (contentLength && parseInt(contentLength) > 500 * 1024) { // 500KB limit
                  throw new Error('Image too large for caching');
                }
              } catch (error) {
                // Skip caching this image
                throw error;
              }
              return request;
            }
          }
        ]
      },
    },

    // 10. FONTS - Essential only
    {
      urlPattern: /^https:\/\/fonts\.(googleapis|gstatic)\.com\/.*/i,
      handler: 'CacheFirst',
      options: {
        cacheName: 'fonts-v2',
        expiration: {
          maxEntries: 10, // Reduced from 30
          maxAgeSeconds: 365 * 24 * 60 * 60, // 1 year
        },
        cacheableResponse: {
          statuses: [0, 200],
        },
      },
    },

    // 11. FALLBACK - Last resort with cleanup
    {
      urlPattern: /^https?:\/\/.*/,
      handler: 'NetworkFirst',
      options: {
        cacheName: 'fallback-v4',
        networkTimeoutSeconds: 3,
        expiration: {
          maxEntries: 10, // Very limited
          maxAgeSeconds: 60 * 60, // 1 hour
          purgeOnQuotaError: true,
        },
        cacheableResponse: {
          statuses: [0, 200],
        },
        plugins: [
          {
            handlerDidError: async () => {
              return caches.match('/offline.html');
            },
            cacheDidUpdate: async ({ cacheName }) => {
              // Monitor total cache usage
              const estimate = await navigator.storage.estimate();
              if (estimate.usage > 50 * 1024 * 1024) { // 50MB total limit
                console.warn('Cache size limit approaching, triggering cleanup');
                // Trigger cache cleanup
                const cacheNames = await caches.keys();
                for (const name of cacheNames) {
                  if (name.includes('dynamic-pages') || name.includes('fallback')) {
                    const cache = await caches.open(name);
                    const keys = await cache.keys();
                    // Remove oldest entries
                    for (let i = 0; i < Math.floor(keys.length * 0.3); i++) {
                      await cache.delete(keys[i]);
                    }
                  }
                }
              }
            }
          }
        ]
      },
    },
  ]
});

const nextConfig = {
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },
  optimizeFonts: true,
  images: {
    deviceSizes: [640, 750, 828, 1080, 1200],
    imageSizes: [16, 32, 48, 64, 96, 128],
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
    serverActions: {
      allowedOrigins: ['localhost:3000', '*.vercel.app'],
    },
    optimizeCss: true
  },
  // Remove trailingSlash to prevent duplicate caching
  async rewrites() {
    return [
      {
        source: '/sw.js',
        destination: '/sw.js',
      },
    ];
  },
};

module.exports = withPWA(nextConfig);