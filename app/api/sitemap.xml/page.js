import React from 'react'

const page = () => {
  return (
    <div>page</div>
  )
}

export default page
// import { fetchURLs } from "../../lib/sanity";

// const SITE_URL = 'https://sufi-blog-website.vercel.app';

// const createSitemap = (posts) => {
//   const sitemap = `
//     <?xml version="1.0" encoding="UTF-8"?>
//     <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
//       ${posts.map(post => `
//         <url>
//           <loc>${`${SITE_URL}/${post._type}/${post.slug}`}</loc>
//           <lastmod>${new Date().toISOString()}</lastmod>
//           <changefreq>weekly</changefreq>
//           <priority>0.8</priority>
//         </url>
//       `).join('')}
//     </urlset>
//   `;
//   return sitemap;
// };

// // Assuming fetchURLs is correctly implemented and imported// pages/api/sitemap.xml.js
// export default function sitemap(req, res) {
//   try {
//     res.setHeader("Content-Type", "text/xml");
//     res.status(200).send('<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"><url><loc>https://yourwebsite.com/</loc><lastmod>' + new Date().toISOString() + '</lastmod><changefreq>daily</changefreq><priority>1.0</priority></url></urlset>');
//   } catch (error) {
//     console.error("Error generating sitemap:", error);
//     res.status(500).json({ error: 'Internal Server Error', details: error.message });
//   }
// }
