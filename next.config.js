const withPWA = require('next-pwa')({
  dest: 'public',
  register: true,
  skipWaiting: false, // Changed to false to prevent automatic activation
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
  
  // OPTIMIZED Runtime Caching with Storage Limits
  runtimeCaching: [
    // ROOT PAGE - Highest Priority (Always cached first)
    {
      urlPattern: /^https:\/\/.*\/$/,
      handler: 'CacheFirst',
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

    // STATIC PAGES - Limited and Essential Only
    {
      urlPattern: /^https:\/\/.*\/(about|faq|contact|privacy|terms)(?:\/)?$/i,
      handler: 'CacheFirst',
      options: {
        cacheName: 'static-pages-v4',
        expiration: {
          maxEntries: 5, // Limited to 5 static pages
          maxAgeSeconds: 30 * 24 * 60 * 60, // 30 days
        },
        cacheableResponse: {
          statuses: [0, 200],
        },
        plugins: [
          {
            cacheKeyWillBeUsed: async ({ request }) => {
              const url = new URL(request.url);
              return url.origin + url.pathname.replace(/\/$/, '') || '/';
            }
          }
        ]
      },
    },

    // DYNAMIC CONTENT PAGES - STRICT LIMITS
    {
      urlPattern: /^https:\/\/.*\/(ai-tools|ai-seo|ai-code|ai-learn-earn)\/[^/]+\/?$/i,
      handler: 'StaleWhileRevalidate',
      options: {
        cacheName: 'dynamic-content-v3',
        // REMOVED: networkTimeoutSeconds: 5,
        expiration: {
          maxEntries: 10, // STRICT LIMIT: Only 10 dynamic pages
          maxAgeSeconds: 24 * 60 * 60, // 1 day only
          purgeOnQuotaError: true, // Auto-purge on storage error
        },
        cacheableResponse: {
          statuses: [0, 200],
        },
        plugins: [
          {
            cacheKeyWillBeUsed: async ({ request }) => {
              const url = new URL(request.url);
              // Normalize URLs to prevent duplicate entries
              return url.origin + url.pathname.replace(/\/$/, '');
            },
            cacheWillUpdate: async ({ response }) => {
              // Only cache successful responses with reasonable size
              if (!response || response.status !== 200) return null;
              
              // Check response size (approximate)
              const contentLength = response.headers.get('content-length');
              if (contentLength && parseInt(contentLength) > 500 * 1024) { // 500KB limit
                console.warn('Response too large for caching:', response.url);
                return null;
              }
              
              return response;
            }
          }
        ]
      },
    },

    // CATEGORY PAGES - Limited caching
    {
      urlPattern: /^https:\/\/.*\/(ai-tools|ai-seo|ai-code|ai-learn-earn)(?:\/)?$/i,
      handler: 'StaleWhileRevalidate',
      options: {
        cacheName: 'category-pages-v2',
        // REMOVED: networkTimeoutSeconds: 3,
        expiration: {
          maxEntries: 4, // Only 4 category pages
          maxAgeSeconds: 2 * 60 * 60, // 2 hours
        },
        cacheableResponse: {
          statuses: [0, 200],
        },
      },
    },

    // NEXT.JS DATA - Controlled caching
    {
      urlPattern: /\/_next\/data\/.*/i,
      handler: 'StaleWhileRevalidate',
      options: {
        cacheName: 'next-data-v3',
        networkTimeoutSeconds: 5,
        expiration: {
          maxEntries: 20, // Limited data entries
          maxAgeSeconds: 24 * 60 * 60, // 1 day
          purgeOnQuotaError: true,
        },
        cacheableResponse: {
          statuses: [0, 200],
        },
      },
    },

    // RSC PAYLOADS - Minimal caching
    {
      urlPattern: /^https:\/\/.*\?_rsc=1$/i,
      handler: 'NetworkFirst',
      options: {
        cacheName: 'rsc-payloads-v2',
        networkTimeoutSeconds: 3,
        expiration: {
          maxEntries: 15, // Very limited
          maxAgeSeconds: 60 * 60, // 1 hour only
        },
        cacheableResponse: {
          statuses: [0, 200],
        },
      },
    },

    // API ROUTES - Minimal and short-term
    {
      urlPattern: /^https:\/\/.*\/api\/.*/i,
      handler: 'NetworkFirst',
      options: {
        cacheName: 'api-cache-v3',
        networkTimeoutSeconds: 3,
        expiration: {
          maxEntries: 10, // Very limited API caching
          maxAgeSeconds: 10 * 60, // 10 minutes only
        },
        cacheableResponse: {
          statuses: [0, 200],
        },
      },
    },

    // SANITY API - Short-term caching
    {
      urlPattern: /^https:\/\/.*\.sanity\.io\/.*/i,
      handler: 'NetworkFirst',
      options: {
        cacheName: 'sanity-api-v3',
        networkTimeoutSeconds: 5,
        expiration: {
          maxEntries: 20,
          maxAgeSeconds: 15 * 60, // 15 minutes
        },
        cacheableResponse: {
          statuses: [0, 200],
        },
      },
    },

    // STATIC ASSETS - Long-term but size-limited
    {
      urlPattern: /\/_next\/static\/.*/i,
      handler: 'CacheFirst',
      options: {
        cacheName: 'next-static-v3',
        expiration: {
          maxEntries: 50, // Limited static entries
          maxAgeSeconds: 365 * 24 * 60 * 60, // 1 year
        },
        cacheableResponse: {
          statuses: [0, 200],
        },
      },
    },

    // IMAGES - Size and count limited
    {
      urlPattern: /^https:\/\/.*\.(png|jpg|jpeg|svg|gif|webp|ico)$/i,
      handler: 'CacheFirst',
      options: {
        cacheName: 'images-v3',
        expiration: {
          maxEntries: 30, // Limited image cache
          maxAgeSeconds: 7 * 24 * 60 * 60, // 7 days
          purgeOnQuotaError: true,
        },
        cacheableResponse: {
          statuses: [0, 200],
        },
        plugins: [
          {
            cacheWillUpdate: async ({ response }) => {
              // Don't cache very large images
              const contentLength = response.headers.get('content-length');
              if (contentLength && parseInt(contentLength) > 200 * 1024) { // 200KB limit
                return null;
              }
              return response;
            }
          }
        ]
      },
    },

    // FONTS - Essential only
    {
      urlPattern: /^https:\/\/fonts\.(googleapis|gstatic)\.com\/.*/i,
      handler: 'CacheFirst',
      options: {
        cacheName: 'fonts-v2',
        expiration: {
          maxEntries: 10, // Limited font files
          maxAgeSeconds: 365 * 24 * 60 * 60, // 1 year
        },
        cacheableResponse: {
          statuses: [0, 200],
        },
      },
    },

    // FALLBACK - Very limited
    {
      urlPattern: /^https?:\/\/.*/,
      handler: 'NetworkFirst',
      options: {
        cacheName: 'fallback-v3',
        networkTimeoutSeconds: 3,
        expiration: {
          maxEntries: 5, // Very limited fallback
          maxAgeSeconds: 60 * 60, // 1 hour
          purgeOnQuotaError: true,
        },
        cacheableResponse: {
          statuses: [0, 200],
        },
        plugins: [
          {
            handlerDidError: async () => {
              // Always try to serve offline page on error
              return caches.match('/offline.html');
            },
            requestWillFetch: async ({ request }) => {
              // Add storage check before making requests
              if ('storage' in navigator && 'estimate' in navigator.storage) {
                const estimate = await navigator.storage.estimate();
                const usedMB = (estimate.usage || 0) / (1024 * 1024);
                
                if (usedMB > 150) { // 150MB warning threshold
                  console.warn('Storage usage high:', usedMB.toFixed(2), 'MB');
                  // Could trigger cleanup here
                }
              }
              
              return request;
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
  
  // Optimize fonts and CSS
  optimizeFonts: true,
  
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
  
  experimental: {
    serverActions: {
      allowedOrigins: ['localhost:3000', '*.vercel.app'],
    },
    optimizeCss: true
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

  // Add headers for better caching control
  async headers() {
    return [
      {
        source: '/offline.html',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      {
        source: '/(about|faq|contact|privacy|terms)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=3600, stale-while-revalidate=86400',
          },
        ],
      },
    ];
  },
};

module.exports = withPWA(nextConfig);