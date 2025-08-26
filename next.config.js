const withPWA = require('next-pwa')({
  dest: 'public',
  register: true,
  skipWaiting: true,
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
    // 🎯 SIMPLIFIED: Only essential static pages with CacheFirst
    {
      urlPattern: /^https:\/\/.*\/(about|contact|privacy|terms|faq)(?:\/)?$/i,
      handler: 'CacheFirst',
      options: {
        cacheName: 'essential-static-pages-v1',
        expiration: {
          maxEntries: 10, // Reduced from 50
          maxAgeSeconds: 7 * 24 * 60 * 60, // 1 week
        },
        cacheableResponse: {
          statuses: [0, 200],
        },
      },
    },
    
    // 🎯 DYNAMIC PAGES: NetworkFirst with strict limits (NO prefetching)
    {
      urlPattern: /^https:\/\/.*\/(ai-tools|ai-seo|ai-code|ai-learn-earn)\/[^\/]+\/?$/i,
      handler: 'NetworkFirst',
      options: {
        cacheName: 'dynamic-pages-v1',
        networkTimeoutSeconds: 3,
        expiration: {
          maxEntries: 20, // Significantly reduced from 50
          maxAgeSeconds: 30 * 60, // Only 30 minutes
        },
        cacheableResponse: {
          statuses: [0, 200],
        },
        plugins: [{
          // Clean up old entries aggressively
          cacheDidUpdate: async ({ cacheName, request }) => {
            const cache = await caches.open(cacheName);
            const keys = await cache.keys();
            if (keys.length > 15) { // Start cleanup at 15 entries
              const oldestKeys = keys.slice(0, 5);
              await Promise.all(oldestKeys.map(key => cache.delete(key)));
            }
          }
        }]
      },
    },

    // 🎯 HOMEPAGE: StaleWhileRevalidate with limits
    {
      urlPattern: /^https:\/\/.*\/$/,
      handler: 'StaleWhileRevalidate',
      options: {
        cacheName: 'homepage-cache-v1',
        expiration: {
          maxEntries: 5, // Reduced
          maxAgeSeconds: 2 * 60 * 60, // 2 hours
        },
        cacheableResponse: {
          statuses: [0, 200],
        },
      },
    },

    // 🎯 CATEGORY PAGES: NetworkFirst with limits
    {
      urlPattern: /^https:\/\/.*\/(ai-tools|ai-seo|ai-code|ai-learn-earn)(?:\/)?$/i,
      handler: 'NetworkFirst',
      options: {
        cacheName: 'category-pages-v1',
        networkTimeoutSeconds: 5,
        expiration: {
          maxEntries: 10, // Limited
          maxAgeSeconds: 60 * 60, // 1 hour
        },
        cacheableResponse: {
          statuses: [0, 200],
        },
      },
    },

    // 🎯 NEXT.JS DATA: Selective caching with aggressive cleanup
    {
      urlPattern: /\/_next\/data\/.*/i,
      handler: 'NetworkFirst',
      options: {
        cacheName: 'next-data-cache-v1',
        networkTimeoutSeconds: 3,
        expiration: {
          maxEntries: 30, // Reduced from 200
          maxAgeSeconds: 60 * 60, // 1 hour only
        },
        cacheableResponse: {
          statuses: [0, 200],
        },
        plugins: [{
          // Aggressive cleanup for data cache
          cacheDidUpdate: async ({ cacheName }) => {
            const cache = await caches.open(cacheName);
            const keys = await cache.keys();
            if (keys.length > 25) { // Cleanup threshold
              const keysToDelete = keys.slice(0, 10);
              await Promise.all(keysToDelete.map(key => cache.delete(key)));
            }
          }
        }]
      },
    },

    // 🎯 API ROUTES: Minimal caching
    {
      urlPattern: /^https:\/\/.*\/api\/.*/i,
      handler: 'NetworkFirst',
      options: {
        cacheName: 'api-cache-v1',
        networkTimeoutSeconds: 5,
        expiration: {
          maxEntries: 20, // Reduced
          maxAgeSeconds: 10 * 60, // Only 10 minutes
        },
        cacheableResponse: {
          statuses: [0, 200],
        },
      },
    },

    // 🎯 SANITY API: Limited caching
    {
      urlPattern: /^https:\/\/.*\.sanity\.io\/.*/i,
      handler: 'NetworkFirst',
      options: {
        cacheName: 'sanity-api-cache-v1',
        networkTimeoutSeconds: 10,
        expiration: {
          maxEntries: 25, // Reduced
          maxAgeSeconds: 15 * 60, // 15 minutes
        },
        cacheableResponse: {
          statuses: [0, 200],
        },
      },
    },

    // 🎯 STATIC ASSETS: Long-term caching (safe)
    {
      urlPattern: /\/_next\/static\/.*/i,
      handler: 'CacheFirst',
      options: {
        cacheName: 'next-static-cache-v1',
        expiration: {
          maxEntries: 100,
          maxAgeSeconds: 365 * 24 * 60 * 60, // 1 year
        },
        cacheableResponse: {
          statuses: [0, 200],
        },
      },
    },

    // 🎯 IMAGES: Conservative caching
    {
      urlPattern: /^https:\/\/.*\.(png|jpg|jpeg|svg|gif|webp|ico)$/i,
      handler: 'CacheFirst',
      options: {
        cacheName: 'images-cache-v1',
        expiration: {
          maxEntries: 50, // Reduced from 200
          maxAgeSeconds: 20 * 24 * 60 * 60, // 1 week
        },
        cacheableResponse: {
          statuses: [0, 200],
        },
        plugins: [{
          // Size-based cleanup for images
          cacheDidUpdate: async ({ cacheName }) => {
            const cache = await caches.open(cacheName);
            const keys = await cache.keys();
            if (keys.length > 45) {
              const keysToDelete = keys.slice(0, 10);
              await Promise.all(keysToDelete.map(key => cache.delete(key)));
            }
          }
        }]
      },
    },

    // 🎯 FONTS: Long-term but limited
    {
      urlPattern: /^https:\/\/fonts\.(googleapis|gstatic)\.com\/.*/i,
      handler: 'CacheFirst',
      options: {
        cacheName: 'google-fonts-cache-v1',
        expiration: {
          maxEntries: 15, // Reduced
          maxAgeSeconds: 365 * 24 * 60 * 60, // 1 year
        },
        cacheableResponse: {
          statuses: [0, 200],
        },
      },
    },

    // 🎯 NAVIGATION: Very selective
    {
      urlPattern: ({ url, request }) => {
        const isSlugPage = /\/(ai-tools|ai-seo|ai-code|ai-learn-earn)\/[^\/]+/.test(url.pathname);
        return request.mode === 'navigate' && !isSlugPage;
      },
      handler: 'NetworkFirst',
      options: {
        cacheName: 'navigation-cache-v1',
        networkTimeoutSeconds: 3,
        expiration: {
          maxEntries: 15, // Reduced
          maxAgeSeconds: 20 * 24 * 60 * 60, // 1 week
        },
        cacheableResponse: {
          statuses: [0, 200],
        },
      },
    }
  ]
});

const nextConfig = {
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },
  optimizeFonts: true,
  images: {
    domains: ['cdn.sanity.io'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    formats: ['image/webp'],
    remotePatterns: [{
      protocol: "https",
      hostname: "cdn.sanity.io",
      port: "",
    }],
  },
  
  async rewrites() {
    return [{
      source: '/sw.js',
      destination: '/sw.js',
    }];
  },
};

module.exports = withPWA(nextConfig);