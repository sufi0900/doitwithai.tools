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
    // 🔥 FIX 1: EXCLUDE slug pages from aggressive caching to allow client-side JS
    {
      urlPattern: /^https:\/\/.*\/(ai-tools|ai-seo|ai-code|ai-learn-earn)\/[^\/]+\/?$/i,
      handler: 'NetworkFirst', // Changed back to NetworkFirst for dynamic behavior
      options: {
        cacheName: 'slug-pages-dynamic-v1',
        networkTimeoutSeconds: 3, // Quick timeout
        expiration: {
          maxEntries: 50,
          maxAgeSeconds: 60 * 60, // Only 1 hour cache
        },
        cacheableResponse: {
          statuses: [0, 200],
        },
        plugins: [
          {
            // 🔥 CRITICAL: Don't cache if it contains interactive elements
            cacheWillUpdate: async ({ response, request }) => {
              const url = new URL(request.url);
              const isSlugPage = /\/(ai-tools|ai-seo|ai-code|ai-learn-earn)\/[^\/]+\/?$/.test(url.pathname);
              
              if (isSlugPage) {
                console.log('Allowing network-first for slug page:', url.pathname);
                return response.status === 200 ? response : null;
              }
              return response;
            }
          }
        ]
      },
    },

    // Static pages - keep as CacheFirst
    {
      urlPattern: /^https:\/\/.*\/(about|faq|contact|privacy|terms)(?:\/)?$/i,
      handler: 'CacheFirst',
      options: {
        cacheName: 'static-pages-navigation-v3',
        expiration: {
          maxEntries: 50,
          maxAgeSeconds: 30 * 24 * 60 * 60,
        },
        cacheableResponse: {
          statuses: [0, 200],
        },
      },
    },

    // 🔥 FIX 2: More selective Next.js data caching
    {
      urlPattern: /\/_next\/data\/.*\/(ai-tools|ai-seo|ai-code|ai-learn-earn)\/[^\/]+\.json$/i,
      handler: 'NetworkFirst', // Changed from StaleWhileRevalidate
      options: {
        cacheName: 'next-data-slug-pages-v1',
        networkTimeoutSeconds: 5,
        expiration: {
          maxEntries: 100,
          maxAgeSeconds: 60 * 60, // 1 hour only
        },
        cacheableResponse: {
          statuses: [0, 200],
        },
      },
    },

    // Regular Next.js data (non-slug pages)
    {
      urlPattern: /\/_next\/data\/.*/i,
      handler: 'StaleWhileRevalidate',
      options: {
        cacheName: 'next-data-cache-v2',
        expiration: {
          maxEntries: 200,
          maxAgeSeconds: 7 * 24 * 60 * 60,
        },
        cacheableResponse: {
          statuses: [0, 200],
        },
      },
    },

    // 🔥 FIX 3: RSC payloads - be more selective
    {
      urlPattern: ({ url, request }) => {
        const isRSC = url.searchParams.get('_rsc') === '1';
        const isSlugPage = /\/(ai-tools|ai-seo|ai-code|ai-learn-earn)\/[^\/]+/.test(url.pathname);
        return isRSC && !isSlugPage; // Don't cache RSC for slug pages
      },
      handler: 'StaleWhileRevalidate',
      options: {
        cacheName: 'rsc-cache-v1',
        expiration: {
          maxEntries: 50,
          maxAgeSeconds: 60 * 60,
        },
        cacheableResponse: {
          statuses: [0, 200],
        },
      },
    },

    // Homepage
    {
      urlPattern: /^https:\/\/.*\/$/,
      handler: 'StaleWhileRevalidate',
      options: {
        cacheName: 'homepage-cache-v2',
        expiration: {
          maxEntries: 10,
          maxAgeSeconds: 60 * 60,
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
        cacheName: 'sanity-api-cache-v2',
        networkTimeoutSeconds: 10,
        expiration: {
          maxEntries: 100,
          maxAgeSeconds: 30 * 60,
        },
        cacheableResponse: {
          statuses: [0, 200],
        },
      },
    },

    // API routes
    {
      urlPattern: /^https:\/\/.*\/api\/.*/i,
      handler: 'NetworkFirst',
      options: {
        cacheName: 'api-cache-v2',
        networkTimeoutSeconds: 5,
        expiration: {
          maxEntries: 100,
          maxAgeSeconds: 30 * 60,
        },
        cacheableResponse: {
          statuses: [0, 200],
        },
      },
    },

    // Static Next.js assets
    {
      urlPattern: /\/_next\/static\/.*/i,
      handler: 'CacheFirst',
      options: {
        cacheName: 'next-static-cache-v2',
        expiration: {
          maxEntries: 100,
          maxAgeSeconds: 365 * 24 * 60 * 60,
        },
        cacheableResponse: {
          statuses: [0, 200],
        },
      },
    },

    // Images
    {
      urlPattern: /^https:\/\/.*\.(png|jpg|jpeg|svg|gif|webp|ico)$/i,
      handler: 'CacheFirst',
      options: {
        cacheName: 'images-cache-v2',
        expiration: {
          maxEntries: 200,
          maxAgeSeconds: 30 * 24 * 60 * 60,
        },
        cacheableResponse: {
          statuses: [0, 200],
        },
      },
    },

    // Fonts
    {
      urlPattern: /^https:\/\/fonts\.(googleapis|gstatic)\.com\/.*/i,
      handler: 'CacheFirst',
      options: {
        cacheName: 'google-fonts-cache-v2',
        expiration: {
          maxEntries: 30,
          maxAgeSeconds: 365 * 24 * 60 * 60,
        },
        cacheableResponse: {
          statuses: [0, 200],
        },
      },
    },

    // 🔥 FIX 4: Final navigation cache - exclude slug pages
    {
      urlPattern: ({ url, request }) => {
        const isSlugPage = /\/(ai-tools|ai-seo|ai-code|ai-learn-earn)\/[^\/]+/.test(url.pathname);
        return request.mode === 'navigate' && !isSlugPage;
      },
      handler: 'NetworkFirst',
      options: {
        cacheName: 'navigation-cache-v3',
        networkTimeoutSeconds: 3,
        expiration: {
          maxEntries: 50,
          maxAgeSeconds: 24 * 60 * 60,
        },
        cacheableResponse: {
          statuses: [0, 200],
        },
      },
    },

    // Fallback cache (very selective)
    {
      urlPattern: /^https?:\/\/.*/,
      handler: 'NetworkFirst', // Changed back to NetworkFirst
      options: {
        cacheName: 'fallback-cache-v3',
        networkTimeoutSeconds: 2, // Very quick timeout
        expiration: {
          maxEntries: 50,
          maxAgeSeconds: 60 * 60, // Only 1 hour
        },
        cacheableResponse: {
          statuses: [0, 200],
        },
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

  // 🔥 FIX 5: Remove trailingSlash which can cause routing issues
  // trailingSlash: true, // REMOVE THIS LINE

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