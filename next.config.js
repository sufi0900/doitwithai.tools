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
    urlPattern: /^https:\/\/.*\/(about|faq|contact|privacy|terms|ai-tools|ai-seo|ai-code|ai-learn-earn)(?:\/)?$/i,
    handler: 'CacheFirst', // Changed from NetworkFirst to CacheFirst
    options: {
      cacheName: 'static-pages-precache-v2',
      expiration: {
        maxEntries: 50,
        maxAgeSeconds: 30 * 24 * 60 * 60, // 30 days
      },
      cacheableResponse: {
        statuses: [0, 200],
      },
      plugins: [
        {
          cacheWillUpdate: async ({ request, response }) => {
            // Only cache successful responses
            return response && response.status === 200;
          }
        }
      ]
    },
  },
    // Dynamic pages with Network First
    {
    urlPattern: /^https:\/\/.*\/(ai-tools|ai-seo|ai-code|ai-learn-earn)(?:\/)?$/i,
    handler: 'NetworkFirst',
    options: {
      cacheName: 'dynamic-pages-v2',
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
   {
    urlPattern: /^https:\/\/.*$/i,
    handler: 'NetworkFirst',
    options: {
      cacheName: 'navigation-v2',
      networkTimeoutSeconds: 3,
      expiration: {
        maxEntries: 200,
        maxAgeSeconds: 24 * 60 * 60,
      },
      cacheableResponse: {
        statuses: [0, 200],
      },
    },
  },
    // Homepage
    {
      urlPattern: /^https:\/\/.*\/$/, 
      handler: 'NetworkFirst',
      options: {
        cacheName: 'homepage-cache-v2',
        networkTimeoutSeconds: 3,
        expiration: {
          maxEntries: 5,
          maxAgeSeconds: 30 * 60, // 30 minutes
        },
        cacheableResponse: {
          statuses: [0, 200],
        },
      },
    },

// Add this to your runtimeCaching array in next.config.js
{
  urlPattern: /^https:\/\/.*$/i,
  handler: 'NetworkFirst',
  method: 'GET',
  options: {
    cacheName: 'enhanced-navigation-cache-v2',
    networkTimeoutSeconds: 5,
    expiration: {
      maxEntries: 200, // Increased from 100
      maxAgeSeconds: 7 * 24 * 60 * 60, // 7 days instead of 1 day
    },
    cacheableResponse: {
      statuses: [0, 200],
    },
    // Add cache key will help with versioning
    plugins: [{
      cacheKeyWillBeUsed: async ({ request }) => {
        const url = new URL(request.url);
        // Normalize URLs to prevent duplicate caches
        return url.origin + url.pathname.replace(/\/$/, '') || '/';
      }
    }]
  },
},


    // Next.js data
    {
      urlPattern: /\/_next\/data\/.*/i,
      handler: 'NetworkFirst',
      options: {
        cacheName: 'next-data-cache-v2',
        networkTimeoutSeconds: 10,
        expiration: {
          maxEntries: 100,
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
        cacheName: 'sanity-api-cache-v2',
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
        cacheName: 'api-cache-v2',
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
    // Add this as the LAST item in your runtimeCaching array
{
  urlPattern: /^https?:\/\/.*/,
  handler: 'NetworkFirst',
  options: {
    cacheName: 'fallback-cache-v2',
    networkTimeoutSeconds: 5,
    expiration: {
      maxEntries: 50,
      maxAgeSeconds: 24 * 60 * 60, // 1 day
    },
    cacheableResponse: {
      statuses: [0, 200],
    },
    plugins: [
      {
        handlerDidError: async () => {
          return caches.match('/offline.html');
        },
        handlerDidComplete: async ({ response }) => {
          if (!response || response.status !== 200) {
            return caches.match('/offline.html');
          }
          return response;
        }
      }
    ]
  },
},
  ],
  
});

const nextConfig = {
// Add this to your existing nextConfig object
env: {
  NEXT_PUBLIC_BUILD_ID: process.env.NEXT_BUILD_ID || 'build'
},

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