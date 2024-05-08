// pages/api/sitemap.xml.js
import { client } from '@/sanity/lib/client';  // Ensure you import your configured Sanity client

const createSitemap = (posts) => `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  ${posts.map(post => `
    <url>
      <loc>${`https://sufi-blog-website.vercel.app/${post._type}/${post.slug.current}`}</loc>
      <lastmod>${new Date(post._updatedAt).toISOString()}</lastmod>
      <changefreq>weekly</changefreq>
      <priority>0.9</priority>
    </url>
  `).join('')}
</urlset>`;

export default async function sitemapHandler(req, res) {
  try {
    const query = '*[_type in ["makemoney", "aitool", "news", "coding", "freeairesources", "seo"]]{_type, "slug": slug.current, _updatedAt}';
    console.log("Handling request...");

    const posts = await client.fetch(query);
    console.log("Fetched posts:", posts);

    res.setHeader('Content-Type', 'application/xml');
    res.status(200).send(createSitemap(posts));
} catch (error) {
    res.status(500).send("Error generating sitemap.");
}
}



// import React from 'react';
// import { fetchUrls } from '../../sanity/lib/sanity';  // Update the import path based on your directory structure

// class Sitemap extends React.Component {
//   static async getInitialProps({ res }) {
//     const posts = await fetchUrls();
//     const baseUrl = 'https://sufi-blog-website.vercel.app';  // Change this to your domain

//     const createSitemap = (posts) => `<?xml version="1.0" encoding="UTF-8"?>
//       <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
//         ${posts.map(post => `<url>
//           <loc>${baseUrl}/${post.type}/${post.slug}</loc>
//         </url>`).join('')}
//       </urlset>
//     `;

//     res.setHeader('Content-Type', 'text/xml');
//     res.write(createSitemap(posts));
//     res.end();
//   }
// }

// export default Sitemap;
