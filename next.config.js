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
    runtimeCaching: [
        // Navigation requests (most important fix)
        {
            urlPattern: /^https:\/\/.*$/i,
            handler: 'NetworkFirst',
            method: 'GET',
            options: {
                cacheName: 'navigation-cache',
                networkTimeoutSeconds: 3,
                expiration: {
                    maxEntries: 100,
                    maxAgeSeconds: 24 * 60 * 60, // 1 day
                },
                cacheableResponse: {
                    statuses: [0, 200],
                },
            },
        },
        
        // Static pages cache (for /about, /faq, etc.)
{
    urlPattern: /^https:\/\/.*\/(about|faq|contact|privacy|terms)(?:\/)?$/i,
    handler: 'CacheFirst', // Changed from NetworkFirst
    options: {
      cacheName: 'static-pages-cache',
      expiration: {
        maxEntries: 50,
        maxAgeSeconds: 30 * 24 * 60 * 60, // 30 days instead of 7
      },
      cacheableResponse: {
        statuses: [0, 200],
      },
      // Add aggressive caching strategies
      plugins: [
        {
          cacheKeyWillBeUsed: async ({ request }) => {
            // Normalize URLs for consistent caching
            const url = new URL(request.url);
            return `${url.origin}${url.pathname.replace(/\/$/, '')}/`;
          },
        },
      ],
    },
  },

// Add this to your runtimeCaching array in next.config.js
{
  urlPattern: /^https:\/\/.*$/i,
  handler: 'NetworkFirst',
  method: 'GET',
  options: {
    cacheName: 'enhanced-navigation-cache',
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

        
{
    urlPattern: /^https:\/\/.*$/i,
    handler: 'NetworkFirst',
    method: 'GET',
    options: {
      cacheName: 'navigation-cache',
      networkTimeoutSeconds: 5, // Increased timeout
      expiration: {
        maxEntries: 200, // Increased capacity
        maxAgeSeconds: 24 * 60 * 60,
      },
      cacheableResponse: {
        statuses: [0, 200],
      },
    },
  },

        // RSC payload caching
        {
            urlPattern: /.*\?_rsc=.*/i,
            handler: 'NetworkFirst',
            options: {
                cacheName: 'rsc-cache',
                networkTimeoutSeconds: 5,
                expiration: {
                    maxEntries: 50,
                    maxAgeSeconds: 60 * 60, // 1 hour
                },
                cacheableResponse: {
                    statuses: [0, 200],
                },
            },
        },

        // Sanity API caching
        {
            urlPattern: /^https:\/\/.*\.sanity\.io\/.*/i,
            handler: 'NetworkFirst',
            options: {
                cacheName: 'sanity-api-cache',
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

        // Images caching
        {
            urlPattern: /^https:\/\/.*\.(png|jpg|jpeg|svg|gif|webp|ico)$/i,
            handler: 'CacheFirst',
            options: {
                cacheName: 'images-cache',
                expiration: {
                    maxEntries: 200,
                    maxAgeSeconds: 30 * 24 * 60 * 60, // 30 days
                },
                cacheableResponse: {
                    statuses: [0, 200],
                },
            },
        },

        // Font caching
        {
            urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
                cacheName: 'google-fonts-cache',
                expiration: {
                    maxEntries: 30,
                    maxAgeSeconds: 365 * 24 * 60 * 60, // 1 year
                },
                cacheableResponse: {
                    statuses: [0, 200],
                },
            },
        },

        // Font files caching
        {
            urlPattern: /^https:\/\/fonts\.gstatic\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
                cacheName: 'google-fonts-files',
                expiration: {
                    maxEntries: 30,
                    maxAgeSeconds: 365 * 24 * 60 * 60, // 1 year
                },
                cacheableResponse: {
                    statuses: [0, 200],
                },
            },
        },

        // API routes caching
        {
            urlPattern: /^https:\/\/.*\/api\/.*/i,
            handler: 'NetworkFirst',
            options: {
                cacheName: 'api-cache',
                networkTimeoutSeconds: 5,
                expiration: {
                    maxEntries: 50,
                    maxAgeSeconds: 5 * 60, // 5 minutes
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
                cacheName: 'next-static-cache',
                expiration: {
                    maxEntries: 100,
                    maxAgeSeconds: 365 * 24 * 60 * 60, // 1 year
                },
                cacheableResponse: {
                    statuses: [0, 200],
                },
            },
        },
    ],
});

const nextConfig = {
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
    // Important for Vercel Service Worker
    experimental: {
        serverActions: {
            allowedOrigins: ['localhost:3000', '*.vercel.app'],
        }
    },
  
    trailingSlash: true,
    // Add this to ensure proper static file handling
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