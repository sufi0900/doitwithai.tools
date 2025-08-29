const withPWA = require('next-pwa')({
  dest: 'public',
  register: false, // We'll handle registration manually
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
    // 1. ESSENTIAL PAGES - Always cached (Root + Offline)
    {
      urlPattern: /^https:\/\/.*\/(|offline\.html)(?:\/)?$/i,
      handler: 'CacheFirst',
      options: {
        cacheName: 'essential-v1',
        expiration: {
          maxEntries: 2, // Only root and offline page
          maxAgeSeconds: 30 * 24 * 60 * 60, // 30 days
        },
        cacheableResponse: {
          statuses: [0, 200],
        },
        plugins: [{
          cacheKeyWillBeUsed: async ({ request }) => {
            const url = new URL(request.url);
            return url.origin + (url.pathname === '/' ? '/' : url.pathname.replace(/\/$/, ''));
          }
        }]
      },
    },

    // 2. ABOUT PAGE - Desktop only, limited caching
    {
      urlPattern: /^https:\/\/.*\/about(?:\/)?$/i,
      handler: 'StaleWhileRevalidate',
      options: {
        cacheName: 'about-page-v1',
        expiration: {
          maxEntries: 1, // Only about page
          maxAgeSeconds: 7 * 24 * 60 * 60, // 7 days
        },
        cacheableResponse: {
          statuses: [0, 200],
        },
        plugins: [{
          requestWillFetch: async ({ request }) => {
            // Only cache for desktop devices
            const userAgent = request.headers.get('user-agent') || '';
            const isMobile = /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(userAgent.toLowerCase());
            
            if (isMobile) {
              // Return network-only request for mobile
              return new Request(request.url, { mode: 'cors', credentials: 'same-origin' });
            }
            
            return request;
          }
        }]
      },
    },

    // 3. RECENT ARTICLES - Very limited (Desktop: 5, Tablet: 3, Mobile: 0)
    {
      urlPattern: /^https:\/\/.*\/(ai-tools|ai-seo|ai-code|ai-learn-earn)\/[^\/]+\/?$/i,
      handler: 'NetworkFirst',
      options: {
        cacheName: 'recent-articles-v1',
        networkTimeoutSeconds: 5,
        expiration: {
          maxEntries: 5, // Will be limited by device type in SW
          maxAgeSeconds: 2 * 60 * 60, // 2 hours only
        },
        cacheableResponse: {
          statuses: [0, 200],
        },
        plugins: [{
          requestWillFetch: async ({ request }) => {
            // Check device type via user agent
            const userAgent = request.headers.get('user-agent') || '';
            const isMobile = /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(userAgent.toLowerCase());
            
            if (isMobile) {
              // Don't cache articles on mobile - return network-only
              return fetch(request.url, { mode: 'cors', credentials: 'same-origin' });
            }
            
            return request;
          },
          cacheKeyWillBeUsed: async ({ request }) => {
            const url = new URL(request.url);
            return url.origin + url.pathname.replace(/\/$/, '');
          }
        }]
      },
    },

    // 4. Next.js data - Minimal caching
    {
      urlPattern: /\/_next\/data\/.*/i,
      handler: 'NetworkFirst',
      options: {
        cacheName: 'next-data-v1',
        networkTimeoutSeconds: 3,
        expiration: {
          maxEntries: 10, // Very limited
          maxAgeSeconds: 30 * 60, // 30 minutes only
        },
        cacheableResponse: {
          statuses: [0, 200],
        },
        plugins: [{
          requestWillFetch: async ({ request }) => {
            const userAgent = request.headers.get('user-agent') || '';
            const isMobile = /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(userAgent.toLowerCase());
            
            if (isMobile) {
              // Skip caching for mobile
              return fetch(request.url, { mode: 'cors', credentials: 'same-origin' });
            }
            
            return request;
          }
        }]
      },
    },

    // 5. Static assets - Limited but longer caching
    {
      urlPattern: /\/_next\/static\/.*/i,
      handler: 'CacheFirst',
      options: {
        cacheName: 'next-static-v1',
        expiration: {
          maxEntries: 30, // Limited static assets
          maxAgeSeconds: 30 * 24 * 60 * 60, // 30 days
        },
        cacheableResponse: {
          statuses: [0, 200],
        },
      },
    },

    // 6. Critical Images only - Very limited
    {
      urlPattern: /^https:\/\/.*\.(png|jpg|jpeg|svg|webp|ico)$/i,
      handler: 'CacheFirst',
      options: {
        cacheName: 'critical-images-v1',
        expiration: {
          maxEntries: 15, // Very limited images
          maxAgeSeconds: 7 * 24 * 60 * 60, // 7 days
        },
        cacheableResponse: {
          statuses: [0, 200],
        },
        plugins: [{
          requestWillFetch: async ({ request }) => {
            const userAgent = request.headers.get('user-agent') || '';
            const isMobile = /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(userAgent.toLowerCase());
            
            if (isMobile) {
              // Skip image caching for mobile
              return fetch(request.url, { mode: 'cors', credentials: 'same-origin' });
            }
            
            return request;
          }
        }]
      },
    },

    // 7. Google Fonts - Desktop only
    {
      urlPattern: /^https:\/\/fonts\.(googleapis|gstatic)\.com\/.*/i,
      handler: 'CacheFirst',
      options: {
        cacheName: 'google-fonts-v1',
        expiration: {
          maxEntries: 5,
          maxAgeSeconds: 30 * 24 * 60 * 60, // 30 days
        },
        cacheableResponse: {
          statuses: [0, 200],
        },
        plugins: [{
          requestWillFetch: async ({ request }) => {
            const userAgent = request.headers.get('user-agent') || '';
            const isMobile = /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(userAgent.toLowerCase());
            
            if (isMobile) {
              return fetch(request.url, { mode: 'cors', credentials: 'same-origin' });
            }
            
            return request;
          }
        }]
      },
    },

    // 8. Fallback - Network only for all other requests
    {
      urlPattern: /^https?:\/\/.*/,
      handler: 'NetworkOnly', // Changed from NetworkFirst to NetworkOnly
      options: {
        // No caching for fallback - everything goes through network
        plugins: [{
          handlerDidError: async ({ request }) => {
            console.log('Network error for:', request.url);
            
            // Try to serve from any existing cache first
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

  // Add workbox options for better control
  workboxOptions: {
    swDest: 'public/sw.js',
    mode: process.env.NODE_ENV === 'production' ? 'production' : 'development',
    clientsClaim: true,
    skipWaiting: false,
    cleanupOutdatedCaches: true,
    
    // Add runtime configuration
    runtimeCaching: undefined, // We define this above
    
    // Exclude certain files from precaching
    exclude: [
      /^manifest.*\.js$/,
      /\.map$/,
      /^sw\.js$/,
      /workbox-.*\.js$/,
      /_app-.*\.js$/,
      /_error.*\.js$/,
    ],
    
    // Maximum cache entries
    maximumFileSizeToCacheInBytes: 5 * 1024 * 1024, // 5MB max file size
  }
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

  // Enhanced headers for cache control
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
      // Add cache headers for static pages
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Device-Cache-Strategy',
            value: 'device-aware',
          },
        ],
      },
    ];
  },

  // Add webpack configuration for better optimization
  webpack: (config, { dev, isServer }) => {
    if (!dev && !isServer) {
      // Optimize for production
      config.optimization = {
        ...config.optimization,
        splitChunks: {
          ...config.optimization.splitChunks,
          cacheGroups: {
            ...config.optimization.splitChunks.cacheGroups,
            // Separate chunk for PWA-related code
            pwa: {
              name: 'pwa',
              test: /[\\/]node_modules[\\/](next-pwa|workbox-).*[\\/]/,
              chunks: 'all',
              priority: 30,
            },
          },
        },
      };
    }
    
    return config;
  },
};

module.exports = withPWA(nextConfig);