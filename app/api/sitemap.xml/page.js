// pages/api/sitemap.xml.js
import { createClient } from "next-sanity";

const client = createClient({
  projectId: 'gglvlxzt', // Your Sanity project ID
  dataset: 'production', // Your dataset name
  useCdn: false, // Set to false to ensure fresh data
});

export default async function sitemapXml(req, res) {
  const query = `*[_type in ["makemoney", "aitool", "news", "coding", "freeairesources", "seo"]] {
    "slug": slug.current
  }`;
  const posts = await client.fetch(query);

  // Generate the sitemap XML
  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
  <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
    ${posts.map((post) => `<url><loc>https://sufi-blog-website.vercel.app/${post.slug}</loc></url>`).join("")}
  </urlset>`;

  res.setHeader("Content-Type", "text/xml");
  res.write(sitemap);
  res.end();
}
