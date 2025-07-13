const fs = require('fs');
const path = require('path');

function generatePagesManifest() {
  const staticPages = [
    '/',
    '/about',
    '/faq', 
    '/contact',
    '/privacy',
    '/terms',
    '/ai-tools',
    '/ai-seo',
    '/ai-code',
    '/ai-learn-earn'
  ];

  const manifest = {
    static_pages: staticPages.map(page => ({
      url: page,
      revision: Date.now().toString()
    }))
  };

  fs.writeFileSync(
    path.join(process.cwd(), 'public/pages-manifest.json'),
    JSON.stringify(manifest, null, 2)
  );
  
  console.log('✅ Pages manifest generated');
}

generatePagesManifest();