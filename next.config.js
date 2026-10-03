// next.config.js - Without next-pwa
const nextConfig = {
  async redirects() {
    const { tools } = require('./features/tool-catalog/registry.json');
    return [...tools.filter(tool => tool.status === 'live' && tool.legacyPath).map(tool => ({
      source: tool.legacyPath,
      destination: `/tools/${tool.slug}`,
      permanent: true,
    })),
    { source: '/ai-seo-tools', destination: '/tools', permanent: true },
    { source: '/tools/categories/seo', destination: '/tools/categories/ai-seo', permanent: true },
    ];
  },
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
  
  trailingSlash: false, // Changed to false for cleaner URLs
  
 

  // Add headers for cache control
 
};

module.exports = nextConfig;
