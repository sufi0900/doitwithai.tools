module.exports = {
    siteUrl: 'https://sufi-blog-website.vercel.app/', // replace with your domain
    generateRobotsTxt: true, // generate robots.txt
    sitemapSize: 7000,
    robotsTxtOptions: {
      policies: [
        {
          userAgent: '*',
          allow: '/',
        }
      ],
      additionalSitemaps: [
        'https://sufi-blog-website.vercel.app/server-sitemap.xml', // optional: if you have multiple sitemaps
      ],
    },
    // Generate sitemap for dynamic paths
    transform: async (config, path) => {
      return {
        loc: path, // Return the path (i.e. URL) without changes
        changefreq: 'daily',
        priority: 0.7,
        lastmod: new Date().toISOString(),
      }
    },
  };
  