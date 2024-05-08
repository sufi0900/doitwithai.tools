// pages/api/sitemap.xml.js
import { client } from '@/sanity/lib/client';

const createSitemapXML = (posts) => {
  const baseUrl = 'https://sufi-blog-website.vercel.app';
  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  ${posts.map(post => `
    <url>
      <loc>${baseUrl}/${post._type}/${post.slug.current}</loc>
      <lastmod>${new Date(post._updatedAt).toISOString()}</lastmod>
      <changefreq>weekly</changefreq>
      <priority>0.9</priority>
    </url>`).join('')}
</urlset>`;
  return sitemap;
};

export default async function sitemapHandler(req, res) {
    try {
        const query = '*[_type in ["makemoney", "aitool", "news", "coding", "freeairesources", "seo"]]{_type, "slug": slug.current, _updatedAt}';
        const posts = await client.fetch(query);
        const sitemapXML = createSitemapXML(posts);

        res.setHeader('Content-Type', 'application/xml');
        res.status(200).send(sitemapXML);
    } catch (error) {
        console.error("Failed to generate sitemap:", error);
        res.status(500).send("Error generating sitemap.");
    }
}
