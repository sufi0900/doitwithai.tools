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
    document: '/offline.html',
    image: '/offline.html',
    audio: '/offline.html', 
    video: '/offline.html',
    font: '/offline.html'
  },
  
  runtimeCaching: [
    // 1. Essential pages - Cache First (Root page, critical static pages)
    {
      urlPattern: /^https:\/\/.*\/(|about|contact|offline\.html)(?:\/)?$/i,
      handler: 'CacheFirst',
      options: {
        cacheName: 'essential-pages-v1',
        expiration: {
          maxEntries: 5, // Limit to essential pages only
          maxAgeSeconds: 30 * 24 * 60 * 60, // 30 days
        },
        cacheableResponse: {
          statuses: [0, 200],
        },
      },
    },

    // 2. Static pages - Stale While Revalidate (with limits)
    {
      urlPattern: /^https:\/\/.*\/(faq|privacy|terms)(?:\/)?$/i,
      handler: 'StaleWhileRevalidate',
      options: {
        cacheName: 'static-pages-v1',
        expiration: {
          maxEntries: 10, // Reduced from 50
          maxAgeSeconds: 7 * 24 * 60 * 60, // 7 days
        },
        cacheableResponse: {
          statuses: [0, 200],
        },
      },
    },

    // 3. Category pages - Network First with limits
    {
      urlPattern: /^https:\/\/.*\/(ai-tools|ai-seo|ai-code|ai-learn-earn)(?:\/)?$/i,
      handler: 'NetworkFirst',
      options: {
        cacheName: 'category-pages-v1',
        networkTimeoutSeconds: 3,
        expiration: {
          maxEntries: 20, // Reduced from 100
          maxAgeSeconds: 6 * 60 * 60, // 6 hours only
        },
        cacheableResponse: {
          statuses: [0, 200],
        },
      },
    },

    // 4. Article/Slug pages - Limited dynamic caching
    {
      urlPattern: /^https:\/\/.*\/(ai-tools|ai-seo|ai-code|ai-learn-earn)\/[^\/]+\/?$/i,
      handler: 'NetworkFirst',
      options: {
        cacheName: 'article-pages-v1',
        networkTimeoutSeconds: 5,
        expiration: {
          maxEntries: 15, // Strict limit on article caching
          maxAgeSeconds: 3 * 60 * 60, // 3 hours only
        },
        cacheableResponse: {
          statuses: [0, 200],
        },
        plugins: [{
          cacheKeyWillBeUsed: async ({ request }) => {
            // Normalize URLs to prevent duplicate caches
            const url = new URL(request.url);
            return url.origin + url.pathname.replace(/\/$/, '') || '/';
          }
        }]
      },
    },

    // 5. Next.js data - Reduced caching
    {
      urlPattern: /\/_next\/data\/.*/i,
      handler: 'StaleWhileRevalidate',
      options: {
        cacheName: 'next-data-v1',
        expiration: {
          maxEntries: 50, // Reduced from 200
          maxAgeSeconds: 2 * 60 * 60, // 2 hours only
        },
        cacheableResponse: {
          statuses: [0, 200],
        },
      },
    },

    // 6. API routes - Very limited caching
    {
      urlPattern: /^https:\/\/.*\/api\/.*/i,
      handler: 'NetworkFirst',
      options: {
        cacheName: 'api-cache-v1',
        networkTimeoutSeconds: 8,
        expiration: {
          maxEntries: 25, // Reduced from 100
          maxAgeSeconds: 15 * 60, // 15 minutes only
        },
        cacheableResponse: {
          statuses: [0, 200],
        },
      },
    },

    // 7. Sanity API - Short-term caching
    {
      urlPattern: /^https:\/\/.*\.sanity\.io\/.*/i,
      handler: 'NetworkFirst',
      options: {
        cacheName: 'sanity-api-v1',
        networkTimeoutSeconds: 10,
        expiration: {
          maxEntries: 30, // Reduced from 100
          maxAgeSeconds: 10 * 60, // 10 minutes only
        },
        cacheableResponse: {
          statuses: [0, 200],
        },
      },
    },

    // 8. Static assets - Long-term but limited
    {
      urlPattern: /\/_next\/static\/.*/i,
      handler: 'CacheFirst',
      options: {
        cacheName: 'next-static-v1',
        expiration: {
          maxEntries: 60, // Reduced from 100
          maxAgeSeconds: 30 * 24 * 60 * 60, // 30 days
        },
        cacheableResponse: {
          statuses: [0, 200],
        },
      },
    },

    // 9. Images - Limited but longer caching
    {
      urlPattern: /^https:\/\/.*\.(png|jpg|jpeg|svg|gif|webp|ico)$/i,
      handler: 'CacheFirst',
      options: {
        cacheName: 'images-v1',
        expiration: {
          maxEntries: 50, // Reduced from 200
          maxAgeSeconds: 7 * 24 * 60 * 60, // 7 days
        },
        cacheableResponse: {
          statuses: [0, 200],
        },
      },
    },

    // 10. Google Fonts
    {
      urlPattern: /^https:\/\/fonts\.(googleapis|gstatic)\.com\/.*/i,
      handler: 'CacheFirst',
      options: {
        cacheName: 'google-fonts-v1',
        expiration: {
          maxEntries: 10,
          maxAgeSeconds: 30 * 24 * 60 * 60, // 30 days
        },
        cacheableResponse: {
          statuses: [0, 200],
        },
      },
    },

    // 11. Fallback for all other requests - Very limited
    {
      urlPattern: /^https?:\/\/.*/,
      handler: 'NetworkFirst',
      options: {
        cacheName: 'general-fallback-v1',
        networkTimeoutSeconds: 3,
        expiration: {
          maxEntries: 20, // Very limited
          maxAgeSeconds: 30 * 60, // 30 minutes only
        },
        cacheableResponse: {
          statuses: [0, 200],
        },
        plugins: [{
          handlerDidError: async ({ request }) => {
            console.log('Handler error for:', request.url);
            // Try to serve from any cache first
            const cachedResponse = await caches.match(request);
            if (cachedResponse) {
              return cachedResponse;
            }
            // Fallback to offline page
            return caches.match('/offline.html');
          }
        }]
      },
    },
  ],
});

const nextConfig = {
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },
  
  // Optimize CSS and fonts
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

  // Add headers for cache control
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