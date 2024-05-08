// pages/sitemap.xml.js
import { fetchURLs } from "../lib/sanity";

export async function getServerSideProps({ res }) {
  const posts = await fetchURLs();  // Ensure this fetches your posts data

  const sitemapContent = posts.map(post => `
    <url>
      <loc>https://yourwebsite.com/${post._type}/${post.slug}</loc>
      <lastmod>${post._updatedAt || new Date().toISOString()}</lastmod>
      <changefreq>weekly</changefreq>
      <priority>0.7</priority>
    </url>`
  ).join('');

  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
  <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
    ${sitemapContent}
  </urlset>`;

  res.setHeader("Content-Type", "text/xml");
  res.write(sitemap);
  res.end();

  return {
    props: {},
  };
}

export default function Sitemap() {
  return null; // This page returns nothing as it only handles the generation of the sitemap XML.
}
