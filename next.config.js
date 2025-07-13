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
  
  // Enhanced runtime caching for better offline support
  runtimeCaching: [
    // CRITICAL: Custom offline fallback page
    {
      urlPattern: /^https:\/\/.*$/,
      handler: 'NetworkFirst',
      options: {
        cacheName: 'offline-fallback-v1',
        networkTimeoutSeconds: 5,
        plugins: [
          {
            handlerDidError: async (params) => {
              // Return custom offline page when network fails
              return caches.match('/offline.html') || 
                     caches.match('/') ||
                     new Response('Offline - Please check your connection', {
                       status: 503,
                       statusText: 'Service Unavailable'
                     });
            },
            cacheWillUpdate: async ({ request, response }) => {
              // Only cache successful responses
              return response.status === 200 ? response : null;
            }
          }
        ]
      }
    },

    // Static pages with aggressive caching
    {
      urlPattern: /^https:\/\/.*\/(about|faq|contact|privacy|terms)(?:\/)?$/i,
      handler: 'CacheFirst',
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
            cacheKeyWillBeUsed: async ({ request }) => {
              // Normalize URLs for consistent caching
              const url = new URL(request.url);
              return url.origin + url.pathname.replace(/\/$/, '') || '/';
            }
          }
        ]
      }
    },

    // Semi-dynamic pages (category listing pages)
    {
      urlPattern: /^https:\/\/.*\/(ai-tools|ai-seo|ai-code|ai-learn-earn)(?:\/)?$/i,
      handler: 'StaleWhileRevalidate', // Better for semi-dynamic content
      options: {
        cacheName: 'semi-dynamic-pages-v2',
        expiration: {
          maxEntries: 100,
          maxAgeSeconds: 4 * 60 * 60, // 4 hours
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
            handlerDidError: async (params) => {
              // Return cached version or offline page for semi-dynamic pages
              const cachedResponse = await caches.match(params.request);
              if (cachedResponse) {
                return cachedResponse;
              }
              
              // Return basic offline page with layout
              return new Response(`
                <!DOCTYPE html>
                <html>
                  <head>
                    <title>Offline - ${params.request.url}</title>
                    <meta name="viewport" content="width=device-width, initial-scale=1">
                    <style>
                      body { 
                        font-family: Arial, sans-serif; 
                        text-align: center; 
                        padding: 50px;
                        background: #f5f5f5;
                      }
                      .offline-container {
                        max-width: 600px;
                        margin: 0 auto;
                        background: white;
                        padding: 40px;
                        border-radius: 10px;
                        box-shadow: 0 2px 10px rgba(0,0,0,0.1);
                      }
                      h1 { color: #333; }
                      p { color: #666; }
                      .retry-btn {
                        background: #0070f3;
                        color: white;
                        padding: 10px 20px;
                        border: none;
                        border-radius: 5px;
                        cursor: pointer;
                        margin-top: 20px;
                      }
                    </style>
                  </head>
                  <body>
                    <div class="offline-container">
                      <h1>🔌 You're Offline</h1>
                      <p>This page requires an internet connection to load fresh content.</p>
                      <p>Please check your connection and try again.</p>
                      <button class="retry-btn" onclick="window.location.reload()">Try Again</button>
                    </div>
                  </body>
                </html>
              `, {
                headers: { 'Content-Type': 'text/html' },
                status: 503
              });
            }
          }
        ]
      }
    },

    // Homepage with special handling
    {
      urlPattern: /^https:\/\/.*\/$/,
      handler: 'NetworkFirst',
      options: {
        cacheName: 'homepage-cache-v2',
        networkTimeoutSeconds: 3,
        expiration: {
          maxEntries: 5,
          maxAgeSeconds: 60 * 60, // 1 hour
        },
        cacheableResponse: {
          statuses: [0, 200],
        },
        plugins: [
          {
            handlerDidError: async (params) => {
              // Return cached homepage or offline page
              const cachedResponse = await caches.match('/');
              return cachedResponse || caches.match('/offline.html');
            }
          }
        ]
      }
    },

    // Article/slug pages
    {
      urlPattern: /^https:\/\/.*\/(ai-tools|ai-seo|ai-code|ai-learn-earn)\/[^\/]+\/?$/,
      handler: 'NetworkFirst',
      options: {
        cacheName: 'article-pages-v1',
        networkTimeoutSeconds: 5,
        expiration: {
          maxEntries: 200,
          maxAgeSeconds: 24 * 60 * 60, // 24 hours
        },
        cacheableResponse: {
          statuses: [0, 200],
        },
        plugins: [
          {
            handlerDidError: async (params) => {
              // For articles, show offline message
              return new Response(`
                <!DOCTYPE html>
                <html>
                  <head>
                    <title>Article Offline</title>
                    <meta name="viewport" content="width=device-width, initial-scale=1">
                    <style>
                      body { 
                        font-family: Arial, sans-serif; 
                        text-align: center; 
                        padding: 50px;
                        background: #f5f5f5;
                      }
                      .offline-container {
                        max-width: 600px;
                        margin: 0 auto;
                        background: white;
                        padding: 40px;
                        border-radius: 10px;
                        box-shadow: 0 2px 10px rgba(0,0,0,0.1);
                      }
                    </style>
                  </head>
                  <body>
                    <div class="offline-container">
                      <h1>📄 Article Unavailable Offline</h1>
                      <p>This article needs to be visited online first to be available offline.</p>
                      <button onclick="history.back()">← Go Back</button>
                    </div>
                  </body>
                </html>
              `, {
                headers: { 'Content-Type': 'text/html' },
                status: 503
              });
            }
          }
        ]
      }
    },

    // Enhanced navigation caching with better fallback
    {
      urlPattern: /^https:\/\/.*$/i,
      handler: 'NetworkFirst',
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
            handlerDidError: async (params) => {
              // Progressive fallback strategy
              const url = new URL(params.request.url);
              
              // Try to find cached version of the page
              const cachedResponse = await caches.match(params.request);
              if (cachedResponse) {
                return cachedResponse;
              }
              
              // Try to find offline.html
              const offlinePage = await caches.match('/offline.html');
              if (offlinePage) {
                return offlinePage;
              }
              
              // Try to find homepage
              const homepage = await caches.match('/');
              if (homepage) {
                return homepage;
              }
              
              // Last resort: basic offline message
              return new Response(`
                <!DOCTYPE html>
                <html>
                  <head>
                    <title>Offline</title>
                    <meta name="viewport" content="width=device-width, initial-scale=1">
                    <style>
                      body { 
                        font-family: Arial, sans-serif; 
                        text-align: center; 
                        padding: 50px;
                        background: #f5f5f5;
                      }
                      .offline-container {
                        max-width: 600px;
                        margin: 0 auto;
                        background: white;
                        padding: 40px;
                        border-radius: 10px;
                        box-shadow: 0 2px 10px rgba(0,0,0,0.1);
                      }
                      h1 { color: #333; }
                      p { color: #666; }
                      .nav-links {
                        margin-top: 30px;
                      }
                      .nav-links a {
                        display: inline-block;
                        margin: 0 10px;
                        padding: 10px 20px;
                        background: #0070f3;
                        color: white;
                        text-decoration: none;
                        border-radius: 5px;
                      }
                    </style>
                  </head>
                  <body>
                    <div class="offline-container">
                      <h1>🔌 You're Offline</h1>
                      <p>This page is not available offline.</p>
                      <p>Please check your internet connection and try again.</p>
                      <div class="nav-links">
                        <a href="/">Home</a>
                        <a href="/about">About</a>
                        <a href="/contact">Contact</a>
                      </div>
                    </div>
                  </body>
                </html>
              `, {
                headers: { 'Content-Type': 'text/html' },
                status: 503
              });
            }
          }
        ]
      }
    },

    // Next.js data caching
    {
      urlPattern: /\/_next\/data\/.*/i,
      handler: 'StaleWhileRevalidate',
      options: {
        cacheName: 'next-data-cache-v2',
        expiration: {
          maxEntries: 100,
          maxAgeSeconds: 24 * 60 * 60, // 1 day
        },
        cacheableResponse: {
          statuses: [0, 200],
        },
      }
    },

    // API routes with better caching
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
      }
    },

    // Static assets (long-term caching)
    {
      urlPattern: /\/_next\/static\/.*/i,
      handler: 'CacheFirst',
      options: {
        cacheName: 'next-static-cache-v2',
        expiration: {
          maxEntries: 200,
          maxAgeSeconds: 365 * 24 * 60 * 60, // 1 year
        },
        cacheableResponse: {
          statuses: [0, 200],
        },
      }
    },

    // Images with better caching
    {
      urlPattern: /^https:\/\/.*\.(png|jpg|jpeg|svg|gif|webp|ico|avif)$/i,
      handler: 'CacheFirst',
      options: {
        cacheName: 'images-cache-v2',
        expiration: {
          maxEntries: 300,
          maxAgeSeconds: 30 * 24 * 60 * 60, // 30 days
        },
        cacheableResponse: {
          statuses: [0, 200],
        },
      }
    },

    // Fonts (long-term caching)
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
      }
    },

    // Sanity API with better offline handling
    {
      urlPattern: /^https:\/\/.*\.sanity\.io\/.*/i,
      handler: 'NetworkFirst',
      options: {
        cacheName: 'sanity-api-cache-v2',
        networkTimeoutSeconds: 10,
        expiration: {
          maxEntries: 200,
          maxAgeSeconds: 60 * 60, // 1 hour
        },
        cacheableResponse: {
          statuses: [0, 200],
        },
      }
    }
  ]
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
      // Add offline page rewrite
      {
        source: '/offline',
        destination: '/offline.html',
      }
    ];
  },
  
  // Add headers for better caching
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
            key: 'Service-Worker-Allowed',
            value: '/',
          },
        ],
      },
      {
        source: '/offline.html',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
    ];
  }
};

module.exports = withPWA(nextConfig);