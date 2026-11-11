// /app/image-sitemap.xml/route.js
// FULLY DYNAMIC IMAGE SITEMAP
// Automatically reads from brandImagesData.js
// Add/remove images there → sitemap updates automatically

import { getImagesForPage, brandImages } from '../brand-assets/brandImagesData';

const BASE_URL = 'https://doitwithai.tools';

export async function GET() {
  const currentDate = new Date().toISOString();
  
  const pagesWithImages = [
    {
      url: '/',
      lastmod: currentDate,
      changefreq: 'daily',
      priority: '1.0',
      images: getImagesForPage('homepage'), // ← AUTO-FETCHED ✅
    },
    {
      url: '/brand-assets',
      lastmod: currentDate,
      changefreq: 'weekly',
      priority: '0.9',
      images: getImagesForPage('brand-assets'), // ← AUTO-FETCHED ✅
    },
    {
      url: '/about',
      lastmod: currentDate,
      changefreq: 'monthly',
      priority: '0.8',
      images: getImagesForPage('about'), // ← AUTO-FETCHED ✅
    }
  ];

  const validPages = pagesWithImages.filter(p => p.images?.length > 0);
  
  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
${validPages.map(page => `  <url>
    <loc>${BASE_URL}${page.url}</loc>
    <lastmod>${page.lastmod}</lastmod>
    <changefreq>${page.changefreq}</changefreq>
    <priority>${page.priority}</priority>${page.images.map(img => `
    <image:image>
      <image:loc>${escapeXml(BASE_URL + img.src)}</image:loc>
      <image:title>${escapeXml(img.title)}</image:title>
      <image:caption>${escapeXml(img.description)}</image:caption>
      <image:geo_location>Islamabad, Pakistan</image:geo_location>${img.license ? `
      <image:license>${escapeXml(img.license)}</image:license>` : ''}
    </image:image>`).join('')}
  </url>`).join('\n')}
</urlset>`;

  return new Response(sitemap, {
    headers: { 'Content-Type': 'application/xml' }
  });
}

function escapeXml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

/**
 * DYNAMIC BEHAVIOR:
 * 
 * This sitemap automatically updates when you:
 * 1. Add image to brandImagesData.js → Appears in sitemap
 * 2. Remove image from brandImagesData.js → Removed from sitemap
 * 3. Update image metadata → Sitemap reflects changes
 * 
 * NO MANUAL EDITING REQUIRED!
 * 
 * HOW TO TEST:
 * 
 * Local:
 * - npm run dev
 * - Visit: http://localhost:3000/image-sitemap.xml
 * - Verify all images from brandImagesData.js appear
 * 
 * Production:
 * - Deploy to Vercel
 * - Visit: https://doitwithai.tools/image-sitemap.xml
 * - Verify XML is valid
 * 
 * Validate:
 * - https://www.xml-sitemaps.com/validate-xml-sitemap.html
 * - Enter: https://doitwithai.tools/image-sitemap.xml
 * 
 * Submit to Google:
 * - Google Search Console → Sitemaps
 * - Add: image-sitemap.xml
 * - Monitor processing status
 * 
 * MAINTENANCE:
 * 
 * To add new image:
 * 1. Upload file to /public/
 * 2. Add entry to brandImagesData.js
 * 3. Deploy
 * ✅ Sitemap automatically includes it!
 * 
 * To remove image:
 * 1. Delete from brandImagesData.js
 * 2. Deploy
 * ✅ Sitemap automatically removes it!
 * 
 * To update metadata:
 * 1. Edit entry in brandImagesData.js
 * 2. Deploy
 * ✅ Sitemap automatically updates!
 */

// ============================================
// TESTING GUIDE
// ============================================

/*
HOW TO TEST YOUR IMAGE SITEMAP:

1. LOCAL TESTING:
   - Run: npm run dev
   - Visit: http://localhost:3000/image-sitemap.xml
   - Should see XML with all images listed
   - Check for proper formatting

2. PRODUCTION TESTING:
   - Deploy to Vercel
   - Visit: https://doitwithai.tools/image-sitemap.xml
   - Verify all URLs are correct
   - Check that images load

3. VALIDATION:
   - Go to: https://www.xml-sitemaps.com/validate-xml-sitemap.html
   - Enter: https://doitwithai.tools/image-sitemap.xml
   - Fix any errors shown

4. GOOGLE SEARCH CONSOLE:
   - Go to: https://search.google.com/search-console
   - Select your property: doitwithai.tools
   - Navigate to: Sitemaps (left sidebar)
   - Add new sitemap: image-sitemap.xml
   - Click "Submit"
   - Wait 24-48 hours for processing

5. VERIFY INDEXING (After 1-2 weeks):
   Google Search:
   - site:doitwithai.tools filetype:png
   - site:doitwithai.tools filetype:jpg
   
   Google Images:
   - Search: "do it with ai tools logo"
   - Search: "do it with ai tools screenshot"
   
   GSC Performance:
   - Performance → Search Type: "Image"
   - Check impressions/clicks

EXPECTED TIMELINE:
- Week 1: Sitemap discovered
- Week 2-3: Images start indexing
- Week 4+: Images appear in Google Images
*/

// ============================================
// UPDATE YOUR robots.txt
// ============================================

/*
FILE: /public/robots.txt

User-agent: *
Allow: /

# Sitemaps
Sitemap: https://doitwithai.tools/sitemap.xml
Sitemap: https://doitwithai.tools/image-sitemap.xml

# Image-specific directives
User-agent: Googlebot-Image
Allow: /

# Crawl optimization
User-agent: Googlebot
Crawl-delay: 0
*/

// ============================================
// ALTERNATIVE: Update Main Sitemap
// ============================================

/*
If you have /app/sitemap.js, you can also add image sitemaps there:

export default function sitemap() {
  return [
    {
      url: 'https://doitwithai.tools',
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
      images: [
        {
          url: 'https://doitwithai.tools/logoForHeader.png',
          title: 'Do It With AI Tools Logo',
          caption: 'Official logo for Do It With AI Tools'
        }
      ]
    }
  ]
}

But separate image-sitemap.xml is better for organization!
*/