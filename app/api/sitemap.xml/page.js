import { fetchURLs } from "../../lib/sanity";

const SITE_URL = 'https://sufi-blog-website.vercel.app';

const createSitemap = (posts) => {
  const sitemap = `
    <?xml version="1.0" encoding="UTF-8"?>
    <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
      ${posts.map(post => `
        <url>
          <loc>${`${SITE_URL}/${post._type}/${post.slug}`}</loc>
          <lastmod>${new Date().toISOString()}</lastmod>
          <changefreq>weekly</changefreq>
          <priority>0.8</priority>
        </url>
      `).join('')}
    </urlset>
  `;
  return sitemap;
};

export default async function sitemap(req, res) {
  const posts = await fetchURLs(); // Fetch all relevant URLs from your CMS
  const sitemap = createSitemap(posts);
  res.setHeader("Content-Type", "text/xml");
  res.status(200).send(sitemap);
}
