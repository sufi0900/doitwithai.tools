// sitemap.js
import { fetchURLs } from '../app/lib/sanity';

const baseURL = 'https://sufi-blog-website.vercel.app';

export default async function sitemap() {
    try {
        const posts = await fetchURLs();
        const sitemapEntries = posts.map(post => ({
            url: `${baseURL}/${post._type}/${post.slug}`,
            lastModified: new Date().toISOString(),
            changeFrequency: 'weekly',
            priority: 0.5
        }));

        const staticRoutes = [{
            url: `${baseURL}/all-posts`,
            lastModified: new Date().toISOString(),
            changeFrequency: 'monthly',
            priority: 0.8
        }];

        const sitemapXML = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  ${[...sitemapEntries, ...staticRoutes].map(entry => `
    <url>
      <loc>${entry.url}</loc>
      <lastmod>${entry.lastModified}</lastmod>
      <changefreq>${entry.changeFrequency}</changefreq>
      <priority>${entry.priority}</priority>
    </url>`).join('')}
</urlset>`;

        return sitemapXML;
    } catch (error) {
        console.error('Error generating sitemap:', error);
        return null;
    }
}
