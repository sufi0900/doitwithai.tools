// next.config.js — Optimized by Apex-CWV (Phase 4: AVIF/WebP Image Pipeline & Immutable Cache-Control Headers)
const path = require("path");

const nextConfig = {
  webpack(config, { isServer }) {
    // Extraction needs DOM parsing, not the optional native canvas adapter.
    // Keep normal imports for CommonJS test runners; bundle the DOM-only build.
    config.resolve.alias = {
      ...config.resolve.alias,
      "linkedom$": require.resolve("linkedom/package.json").replace(/package\.json$/, "worker.js"),
      ...(isServer
        ? {
            "@/features/website-builder/tools/transferred-tool-registry$": path.resolve(
              __dirname,
              "features/website-builder/tools/transferred-tool-registry.server-stub.ts",
            ),
            [path.resolve(
              __dirname,
              "features/website-builder/tools/transferred-tool-registry",
            )]: path.resolve(
              __dirname,
              "features/website-builder/tools/transferred-tool-registry.server-stub.ts",
            ),
            [path.resolve(
              __dirname,
              "features/website-builder/tools/transferred-tool-registry.ts",
            )]: path.resolve(
              __dirname,
              "features/website-builder/tools/transferred-tool-registry.server-stub.ts",
            ),
          }
        : {}),
    };
    if (!isServer) {
      config.module.rules.push({
        test: /[\\/]app[\\/](?:tools|agents)[\\/].+[\\/]page\.tsx$/,
        enforce: "pre",
        use: [
          {
            loader: path.resolve(__dirname, "scripts/strip-client-page-metadata-loader.cjs"),
          },
        ],
      });
    }
    return config;
  },

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

  eslint: {
    ignoreDuringBuilds: true,
  },

  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },

  optimizeFonts: true,

  images: {
    unoptimized: true,
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
    webpackBuildWorker: true,
    cpus: 1,
    workerThreads: false,
    serverActions: {
      allowedOrigins: [
        'localhost:3000',
        'doitwithai.tools',
        'www.doitwithai.tools',
        '*.workers.dev',
      ],
    },
  },

  trailingSlash: false,
};

module.exports = nextConfig;
