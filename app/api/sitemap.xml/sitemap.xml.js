// import { fetchURLs } from "../../../app/lib/sanity"; // Adjust the import according to your project structure

// const createSitemap = (posts) => {
//   let sitemap = `<?xml version="1.0" encoding="UTF-8"?>
//   <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">`;

//   posts.forEach(post => {
//     sitemap += `
//       <url>
//         <loc>${`https://www.doitwithai.tools/${post._type}/${post.slug}`}</loc>
//         <changefreq>weekly</changefreq>
//         <priority>0.9</priority>
//       </url>
//     `;
//   });

//   sitemap += `</urlset>`;
//   return sitemap;
// };

// export default async function sitemap(req, res) {
//   try {
//     const posts = await fetchURLs(); // Fetch all relevant URLs
//     const sitemap = createSitemap(posts);

//     res.setHeader("Content-Type", "text/xml");
//     res.write(sitemap);
//     res.end();
//   } catch (error) {
//     console.error('Error generating sitemap:', error);
//     if (res && res.status) {
//       res.status(500).send(JSON.stringify(error));
//     } else {
//       console.error('Unable to send error response: Response object not properly defined.');
//     }
//   }
// }
