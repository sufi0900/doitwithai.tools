// next.config.js - CORRECTED VERSION

const withPWA = require('next-pwa')({
  dest: 'public',
  register: false,
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
  // CORRECTED: Use proper handler names and remove conflicting options
  runtimeCaching: [
    // Static pages - Use CacheFirst with no networkTimeout
    {
      urlPattern: /^https:\/\/.*\/(about|faq|contact|privacy|terms)(?:\/)?$/i,
      handler: 'CacheFirst',
      options: {
        cacheName: 'static-pages-v3',
        expiration: {
          maxEntries: 50,
          maxAgeSeconds: 30 * 24 * 60 * 60, // 30 days
        },
        cacheableResponse: {
          statuses: [0, 200],
        },
      },
    },

    // Semi-dynamic pages - Use NetworkFirst with timeout
    {
      urlPattern: /^https:\/\/.*\/(ai-tools|ai-seo|ai-code|ai-learn-earn)(?:\/)?$/i,
      handler: 'NetworkFirst',
      options: {
        cacheName: 'semi-dynamic-pages-v3',
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

    // Next.js data - NetworkFirst with timeout
    {
      urlPattern: /\/_next\/data\/.*/i,
      handler: 'NetworkFirst',
      options: {
        cacheName: 'next-data-cache-v3',
        networkTimeoutSeconds: 10,
        expiration: {
          maxEntries: 200,
          maxAgeSeconds: 7 * 24 * 60 * 60, // 7 days
        },
        cacheableResponse: {
          statuses: [0, 200],
        },
      },
    },

    // RSC payloads - NetworkFirst with timeout
    {
      urlPattern: /^https:\/\/.*\?_rsc=1$/i,
      handler: 'NetworkFirst',
      options: {
        cacheName: 'rsc-cache-v3',
        networkTimeoutSeconds: 8,
        expiration: {
          maxEntries: 100,
          maxAgeSeconds: 24 * 60 * 60, // 1 day
        },
        cacheableResponse: {
          statuses: [0, 200],
        },
      },
    },

    // Homepage - NetworkFirst with timeout
    {
      urlPattern: /^https:\/\/.*\/$/,
      handler: 'NetworkFirst',
      options: {
        cacheName: 'homepage-cache-v3',
        networkTimeoutSeconds: 5,
        expiration: {
          maxEntries: 10,
          maxAgeSeconds: 60 * 60, // 1 hour
        },
        cacheableResponse: {
          statuses: [0, 200],
        },
      },
    },

    // General navigation - NetworkFirst with timeout
    {
      urlPattern: /^https:\/\/.*$/i,
      handler: 'NetworkFirst',
      method: 'GET',
      options: {
        cacheName: 'enhanced-navigation-cache-v3',
        networkTimeoutSeconds: 5,
        expiration: {
          maxEntries: 300,
          maxAgeSeconds: 7 * 24 * 60 * 60, // 7 days
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
        cacheName: 'sanity-api-cache-v3',
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
        cacheName: 'api-cache-v3',
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

    // Static assets - CacheFirst (no networkTimeout needed)
    {
      urlPattern: /\/_next\/static\/.*/i,
      handler: 'CacheFirst',
      options: {
        cacheName: 'next-static-cache-v3',
        expiration: {
          maxEntries: 100,
          maxAgeSeconds: 365 * 24 * 60 * 60, // 1 year
        },
        cacheableResponse: {
          statuses: [0, 200],
        },
      },
    },

    // Images - CacheFirst (no networkTimeout needed)
    {
      urlPattern: /^https:\/\/.*\.(png|jpg|jpeg|svg|gif|webp|ico)$/i,
      handler: 'CacheFirst',
      options: {
        cacheName: 'images-cache-v3',
        expiration: {
          maxEntries: 200,
          maxAgeSeconds: 30 * 24 * 60 * 60, // 30 days
        },
        cacheableResponse: {
          statuses: [0, 200],
        },
      },
    },

    // Fonts - CacheFirst (no networkTimeout needed)
    {
      urlPattern: /^https:\/\/fonts\.(googleapis|gstatic)\.com\/.*/i,
      handler: 'CacheFirst',
      options: {
        cacheName: 'google-fonts-cache-v3',
        expiration: {
          maxEntries: 30,
          maxAgeSeconds: 365 * 24 * 60 * 60, // 1 year
        },
        cacheableResponse: {
          statuses: [0, 200],
        },
      },
    },

    // Fallback - NetworkFirst with timeout (should be LAST)
    {
      urlPattern: /^https?:\/\/.*/,
      handler: 'NetworkFirst',
      options: {
        cacheName: 'fallback-cache-v3',
        networkTimeoutSeconds: 3,
        expiration: {
          maxEntries: 50,
          maxAgeSeconds: 24 * 60 * 60, // 1 day
        },
        cacheableResponse: {
          statuses: [0, 200],
        },
      },
    },
  ],
});

// Rest of your next.config.js remains the same
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