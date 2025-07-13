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
    handler: 'StaleWhileRevalidate', // Changed from CacheFirst
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
          // Cache immediately on first visit
          cacheWillUpdate: async ({ response }) => {
            return response.status === 200 ? response : null;
          },
          cacheDidUpdate: async ({ cacheName, request }) => {
            console.log('Static page cached:', request.url);
          }
        }
      ]
    },
  },

  // Semi-dynamic pages (ai-tools, ai-seo, etc.) - Cache shell immediately
  {
    urlPattern: /^https:\/\/.*\/(ai-tools|ai-seo|ai-code|ai-learn-earn)(?:\/)?$/i,
    handler: 'StaleWhileRevalidate', // Changed from NetworkFirst
    options: {
      cacheName: 'semi-dynamic-pages-v2',
      // networkTimeoutSeconds: 3, // Reduced timeout
      expiration: {
        maxEntries: 100,
        maxAgeSeconds: 24 * 60 * 60, // 1 day
      },
      cacheableResponse: {
        statuses: [0, 200],
      },
      plugins: [
        {
          // Serve cached version immediately if available
          cachedResponseWillBeUsed: async ({ cachedResponse, request }) => {
            if (cachedResponse) {
              console.log('Serving cached semi-dynamic page:', request.url);
              return cachedResponse;
            }
            return null;
          }
        }
      ]
    },
  },
  
  // Next.js data - More aggressive caching
  {
    urlPattern: /\/_next\/data\/.*/i,
    handler: 'StaleWhileRevalidate', // Changed from NetworkFirst
    options: {
      cacheName: 'next-data-cache-v2',
      // networkTimeoutSeconds: 5,
      expiration: {
        maxEntries: 200, // Increased
        maxAgeSeconds: 7 * 24 * 60 * 60, // 7 days instead of 1
      },
      cacheableResponse: {
        statuses: [0, 200],
      },
    },
  },
  // RSC (React Server Components) payloads
  {
    urlPattern: /^https:\/\/.*\?_rsc=1$/i,
    handler: 'StaleWhileRevalidate',
    options: {
      cacheName: 'rsc-cache-v1',
      // networkTimeoutSeconds: 5,
      expiration: {
        maxEntries: 100,
        maxAgeSeconds: 24 * 60 * 60, // 1 day
      },
      cacheableResponse: {
        statuses: [0, 200],
      },
    },
  },
   {
    urlPattern: /^https:\/\/.*$/i,
    handler: 'NetworkFirst',
    options: {
      cacheName: 'navigation-v2',
      // networkTimeoutSeconds: 3,
      expiration: {
        maxEntries: 200,
        maxAgeSeconds: 24 * 60 * 60,
      },
      cacheableResponse: {
        statuses: [0, 200],
      },
    },
  },
  // Homepage with better caching
  {
    urlPattern: /^https:\/\/.*\/$/,
    handler: 'StaleWhileRevalidate', // Changed from NetworkFirst
    options: {
      cacheName: 'homepage-cache-v2',
      // networkTimeoutSeconds: 3,
      expiration: {
        maxEntries: 10,
        maxAgeSeconds: 60 * 60, // 1 hour
      },
      cacheableResponse: {
        statuses: [0, 200],
      },
    },
  },


// Enhanced navigation cache
  {
    urlPattern: /^https:\/\/.*$/i,
    handler: 'StaleWhileRevalidate',
    method: 'GET',
    options: {
      cacheName: 'enhanced-navigation-cache-v2',
      // networkTimeoutSeconds: 3, // Reduced timeout
      expiration: {
        maxEntries: 300, // Increased
        maxAgeSeconds: 7 * 24 * 60 * 60, // 7 days
      },
      cacheableResponse: {
        statuses: [0, 200],
      },
      plugins: [
        {
          cacheKeyWillBeUsed: async ({ request }) => {
            const url = new URL(request.url);
            // Normalize URLs to prevent duplicate caches
            return url.origin + url.pathname.replace(/\/$/, '') || '/';
          },
          // Add immediate caching for navigation requests
          requestWillFetch: async ({ request }) => {
            console.log('Navigation request:', request.url);
            return request;
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
        cacheName: 'sanity-api-cache-v2',
        // networkTimeoutSeconds: 10,
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
        cacheName: 'api-cache-v2',
        // networkTimeoutSeconds: 5,
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
        cacheName: 'next-static-cache-v2',
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
        cacheName: 'images-cache-v2',
        expiration: {
          maxEntries: 200,
          maxAgeSeconds: 30 * 24 * 60 * 60, // 30 days
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
          maxAgeSeconds: 365 * 24 * 60 * 60, // 1 year
        },
        cacheableResponse: {
          statuses: [0, 200],
        },
      },
    },
  {
    urlPattern: /^https?:\/\/.*/,
    handler: 'StaleWhileRevalidate',
    options: {
      cacheName: 'fallback-cache-v2',
      // networkTimeoutSeconds: 3, // Reduced timeout
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