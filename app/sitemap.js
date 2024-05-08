import React from 'react';
import { fetchUrls } from '../sanity/lib/sanity';  // Update the import path based on your directory structure

class Sitemap extends React.Component {
  static async getInitialProps({ res }) {
    const posts = await fetchUrls();
    const baseUrl = 'https://sufi-blog-website.vercel.app';  // Change this to your domain

    const createSitemap = (posts) => `<?xml version="1.0" encoding="UTF-8"?>
      <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
        ${posts.map(post => `<url>
          <loc>${baseUrl}/${post.type}/${post.slug}</loc>
        </url>`).join('')}
      </urlset>
    `;

    res.setHeader('Content-Type', 'text/xml');
    res.write(createSitemap(posts));
    res.end();
  }
}

export default Sitemap;
