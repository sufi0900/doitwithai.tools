const withPWA = require('next-pwa')({
  dest: 'public',
  register: false, // Keep false since you're registering manually
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
    // Static pages - CacheFirst for immediate offline access
    // Add this as the FIRST item in your runtimeCaching array
    {
      urlPattern: /^https:\/\/.*\/(about|faq|contact|privacy|terms)(?:\/)?$/i,
      handler: 'StaleWhileRevalidate', // No networkTimeoutSeconds here, so StaleWhileRevalidate is fine
      options: {
        cacheName: 'static-pages-v2',
        expiration: {
          maxEntries: 50,
          maxAgeSeconds: 30 * 24 * 60 * 60, // 30 days
        },
        cacheableResponse: {
          statuses: [0, 200],
        },
        plugins: [
          {
            cacheWillUpdate: async ({ response }) => {
              return response.status === 200 ? response : null;
            },
            cacheDidUpdate: async ({ cacheName, request }) => {
              console.log('Static page cached:', request.url);
              // Notify clients about cache update
              const clients = await self.clients.matchAll();
              clients.forEach(client => {
                client.postMessage({
                  type: 'CACHE_UPDATED',
                  url: request.url,
                  cacheName: cacheName
                });
              });
            }
          }
        ]
      },
    },

    // Semi-dynamic pages with enhanced offline support
    {
      urlPattern: /^https:\/\/.*\/(ai-tools|ai-seo|ai-code|ai-learn-earn)(?:\/)?$/i,
      handler: 'NetworkFirst', // CHANGED from 'StaleWhileRevalidate' to 'NetworkFirst'
      options: {
        cacheName: 'semi-dynamic-pages-v2',
        networkTimeoutSeconds: 3,
        expiration: {
          maxEntries: 100,
          maxAgeSeconds: 24 * 60 * 60, // 1 day
        },
        cacheableResponse: {
          statuses: [0, 200],
        },
        plugins: [
          {
            cachedResponseWillBeUsed: async ({ cachedResponse, request }) => {
              if (cachedResponse) {
                console.log('Serving cached semi-dynamic page:', request.url);
                return cachedResponse;
              }
              return null;
            },
            cacheDidUpdate: async ({ cacheName, request }) => {
              const clients = await self.clients.matchAll();
              clients.forEach(client => {
                client.postMessage({
                  type: 'CACHE_UPDATED',
                  url: request.url,
                  cacheName: cacheName
                });
              });
            }
          }
        ]
      },
    },

    // Next.js data with message handling
    {
      urlPattern: /\/_next\/data\/.*/i,
      handler: 'NetworkFirst', // CHANGED from 'StaleWhileRevalidate' to 'NetworkFirst'
      options: {
        cacheName: 'next-data-cache-v2',
        networkTimeoutSeconds: 5,
        expiration: {
          maxEntries: 200,
          maxAgeSeconds: 7 * 24 * 60 * 60, // 7 days
        },
        cacheableResponse: {
          statuses: [0, 200],
        },
        plugins: [
          {
            cacheDidUpdate: async ({ cacheName, request }) => {
              const clients = await self.clients.matchAll();
              clients.forEach(client => {
                client.postMessage({
                  type: 'DATA_CACHE_UPDATED',
                  url: request.url
                });
              });
            }
          }
        ]
      },
    },

    // RSC (React Server Components) payloads
    {
      urlPattern: /^https:\/\/.*\?_rsc=1$/i,
      handler: 'NetworkFirst', // CHANGED from 'StaleWhileRevalidate' to 'NetworkFirst'
      options: {
        cacheName: 'rsc-cache-v1',
        networkTimeoutSeconds: 5,
        expiration: {
          maxEntries: 100,
          maxAgeSeconds: 24 * 60 * 60, // 1 day
        },
        cacheableResponse: {
          statuses: [0, 200],
        },
      },
    },

    // Homepage with better caching
    {
      urlPattern: /^https:\/\/.*\/$/,
      handler: 'NetworkFirst', // CHANGED from 'StaleWhileRevalidate' to 'NetworkFirst'
      options: {
        cacheName: 'homepage-cache-v2',
        networkTimeoutSeconds: 3,
        expiration: {
          maxEntries: 10,
          maxAgeSeconds: 60 * 60, // 1 hour
        },
        cacheableResponse: {
          statuses: [0, 200],
        },
      },
    },

    // Enhanced navigation cache with custom message handling
    {
      urlPattern: /^https:\/\/.*$/i,
      handler: 'NetworkFirst', // CHANGED from 'StaleWhileRevalidate' to 'NetworkFirst'
      method: 'GET',
      options: {
        cacheName: 'enhanced-navigation-cache-v2',
        networkTimeoutSeconds: 3,
        expiration: {
          maxEntries: 300,
          maxAgeSeconds: 7 * 24 * 60 * 60, // 7 days
        },
        cacheableResponse: {
          statuses: [0, 200],
        },
        plugins: [
          {
            cacheKeyWillBeUsed: async ({ request }) => {
              const url = new URL(request.url);
              return url.origin + url.pathname.replace(/\/$/, '') || '/';
            },
            requestWillFetch: async ({ request }) => {
              console.log('Navigation request:', request.url);
              return request;
            },
            // Add message handling for prefetch requests
            cacheDidUpdate: async ({ cacheName, request }) => {
              const clients = await self.clients.matchAll();
              clients.forEach(client => {
                client.postMessage({
                  type: 'NAVIGATION_CACHE_UPDATED',
                  url: request.url
                });
              });
            }
          }
        ]
      },
    },

    // Sanity API
    {
      urlPattern: /^https:\/\/.*\.sanity\.io\/.*/i,
      handler: 'NetworkFirst',
      options: {
        cacheName: 'sanity-api-cache-v1',
        networkTimeoutSeconds: 10,
        expiration: {
          maxEntries: 100,
          maxAgeSeconds: 30 * 60, // 30 minutes
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
        cacheName: 'api-cache-v1',
        networkTimeoutSeconds: 5,
        expiration: {
          maxEntries: 100,
          maxAgeSeconds: 30 * 60, // 30 minutes
        },
        cacheableResponse: {
          statuses: [0, 200],
        },
      },
    },

    // Static assets
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

    // Images
    {
      urlPattern: /^https:\/\/.*\.(png|jpg|jpeg|svg|gif|webp|ico)$/i,
      handler: 'CacheFirst',
      options: {
        cacheName: 'images-cache-v1',
        expiration: {
          maxEntries: 200,
          maxAgeSeconds: 30 * 24 * 60 * 60, // 30 days
        },
        cacheableResponse: {
          statuses: [0, 200],
        },
      },
    },

    // Google Fonts
    {
      urlPattern: /^https:\/\/fonts\.(googleapis|gstatic)\.com\/.*/i,
      handler: 'CacheFirst',
      options: {
        cacheName: 'google-fonts-cache-v1',
        expiration: {
          maxEntries: 30,
          maxAgeSeconds: 365 * 24 * 60 * 60, // 1 year
        },
        cacheableResponse: {
          statuses: [0, 200],
        },
      },
    },

    // Enhanced fallback with custom message handling (MUST BE LAST)
    {
      urlPattern: /^https?:\/\/.*/,
      handler: 'NetworkFirst', // CHANGED from 'StaleWhileRevalidate' to 'NetworkFirst'
      options: {
        cacheName: 'fallback-cache-v2',
        networkTimeoutSeconds: 3,
        expiration: {
          maxEntries: 100,
          maxAgeSeconds: 24 * 60 * 60, // 1 day
        },
        cacheableResponse: {
          statuses: [0, 200],
        },
        plugins: [
          {
            handlerDidError: async ({ request }) => {
              console.log('Handler error for:', request.url);
              // Try to serve from any cache first
              const cachedResponse = await caches.match(request);
              if (cachedResponse) {
                return cachedResponse;
              }
              // Fallback to offline page
              return caches.match('/offline.html');
            },
            handlerDidComplete: async ({ response, request }) => {
              if (!response || response.status !== 200) {
                console.log('Handler completed with error for:', request.url);
                return caches.match('/offline.html');
              }
              return response;
            }
          }
        ]
      },
    },
  ]

});

const nextConfig = {
  // Add this to your existing nextConfig object
  webpack: (config, { dev, isServer }) => {
    if (!dev && !isServer) {
      // Generate pages manifest during build
      require('./scripts/generate-pages-manifest.js');
    }
    return config;
  },
  reactStrictMode: true,
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
    }
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
};

module.exports = withPWA(nextConfig);