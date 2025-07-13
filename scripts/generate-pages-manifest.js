// 1. Create: scripts/generate-pages-manifest.js
const fs = require('fs');
const path = require('path');

function generatePagesManifest() {
  const pagesDir = path.join(process.cwd(), 'app');
  const staticPages = [];
  
  // Define your static pages
  const knownStaticPages = [
    { url: '/', title: 'Home', priority: 'high' },
    { url: '/about', title: 'About', priority: 'medium' },
    { url: '/faq', title: 'FAQ', priority: 'medium' },
    { url: '/contact', title: 'Contact', priority: 'medium' },
    { url: '/privacy', title: 'Privacy Policy', priority: 'low' },
    { url: '/terms', title: 'Terms of Service', priority: 'low' },
    { url: '/ai-tools', title: 'AI Tools', priority: 'high' },
    { url: '/ai-seo', title: 'AI SEO', priority: 'high' },
    { url: '/ai-code', title: 'AI Code', priority: 'high' },
    { url: '/ai-learn-earn', title: 'AI Learn & Earn', priority: 'high' },
    { url: '/free-ai-resources', title: 'Free AI Resources', priority: 'medium' },
    { url: '/ai-news', title: 'AI News', priority: 'medium' }
  ];

  // Add all static pages to the manifest
  knownStaticPages.forEach(page => {
    staticPages.push({
      url: page.url,
      title: page.title,
      priority: page.priority,
      type: 'static',
      lastModified: new Date().toISOString()
    });
  });

  const manifest = {
    version: '1.0.0',
    generated: new Date().toISOString(),
    static_pages: staticPages,
    total_pages: staticPages.length
  };

  // Write manifest to public directory
  const manifestPath = path.join(process.cwd(), 'public', 'pages-manifest.json');
  fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2));
  
  console.log(`✅ Generated pages manifest with ${staticPages.length} static pages`);
}

// Run if called directly
if (require.main === module) {
  generatePagesManifest();
}

module.exports = generatePagesManifest;