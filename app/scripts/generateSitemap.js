const { client } = require('../../sanity/lib/client'); // import your configured sanity client
const fs = require('fs');
const path = require('path');

async function generateSitemap() {
  const query = '*[_type in ["makemoney", "aitool", "news", "coding", "freeairesources", "seo"]]';
  const posts = await client.fetch(query);

  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  ${posts.map(post => `
    <url>
      <loc>${`https://sufi-blog-website.vercel.app/${post._type}/${post.slug.current}`}</loc>
      <lastmod>${new Date(post._updatedAt).toISOString()}</lastmod>
      <priority>0.9</priority>
    </url>`).join('')}
</urlset>`;

  fs.writeFileSync(path.resolve(__dirname, '../public/sitemap.xml'), sitemap);
}

generateSitemap();
