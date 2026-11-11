// next.config.js — Optimized by Apex-CWV (Phase 4: AVIF/WebP Image Pipeline & Immutable Cache-Control Headers)
const nextConfig = {
  async redirects() {
    const registry = require('./features/tool-catalog/registry.json');
    const tools = Array.isArray(registry) ? registry : registry.tools || [];
    return [
      ...tools
        .filter((tool) => tool.status === 'live' && tool.legacyPath)
        .map((tool) => ({
          source: tool.legacyPath,
          destination: `/tools/${tool.slug}`,
          permanent: true,
        })),
      {
        source: '/prompts/meta-description-prompts',
        destination: '/prompts/chatgpt-prompts-for-meta-title-and-meta-description',
        permanent: true,
      },
      {
        source: '/prompts/meta-title-prompts',
        destination: '/prompts/chatgpt-prompts-for-meta-title-and-meta-description',
        permanent: true,
      },
      { source: '/ai-seo-tools', destination: '/tools', permanent: true },
      {
        source: '/tools/categories/seo',
        destination: '/tools/categories/ai-seo',
        permanent: true,
      },
      {
        source: '/download-and-embed',
        destination: '/tools/downloadable-ai-tools',
        permanent: true,
      },
    ];
  },

  async headers() {
    return [
      {
        source: '/images/sanity-archive/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      {
        source: '/icons/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
    ];
  },

  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },

  optimizeFonts: true,

  images: {
    domains: ['your-sanity-domain.com'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920],
    imageSizes: [16, 32, 48, 64, 85, 96, 128, 256, 384],
    formats: ['image/avif', 'image/webp'],
    minimumCacheTTL: 31536000,
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'cdn.sanity.io',
        port: '',
      },
    ],
  },

  experimental: {
    serverActions: {
      allowedOrigins: ['localhost:3000', '*.vercel.app'],
    },
    optimizeCss: true,
  },

  trailingSlash: false,
};

module.exports = nextConfig;
