// scripts/generate-sitemap.js
const fs = require('fs');
const fetch = require('isomorphic-unfetch');

const BASE_URL = 'https://sufi-blog-website.vercel.app/'; // Change this to your domain
const SITEMAP_PATH = './public/sitemap.xml';

const fetchPosts = async () => {
  const res = await fetch(`${BASE_URL}/api/sitemap-data`);
  const posts = await res.json();
  return posts;
};

const generateSitemap = async () => {
  const posts = await fetchPosts();

  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  ${posts
    .map(post => {
      return `<url>
    <loc>${BASE_URL}/${post.slug.current}</loc>
    <changefreq>daily</changefreq>
    <priority>0.9</priority>
  </url>`;
    })
    .join('')}
</urlset>`;

  fs.writeFileSync(SITEMAP_PATH, sitemap);
};

generateSitemap();
