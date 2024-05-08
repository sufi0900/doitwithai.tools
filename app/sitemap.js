// sitemap.js
import Sitemap from 'next-sitemap';
import { fetchURLs } from '../app/lib/sanity'; // Adjust the path

export default new Sitemap()
  .add({
    url: '/', // Homepage
    changefreq: 'daily', // Change frequency (e.g., daily)
    priority: 1.0, // Priority (0.0 to 1.0)
  })
  .add({
    url: '/blog', // Blog page
    changefreq: 'weekly',
    priority: 0.8,
  })
  .add({
    url: '/about', // About page
    changefreq: 'monthly',
    priority: 0.5,
  })
  .add(await fetchURLs()) // Add dynamic post URLs
  .build(); // Build the sitemap









//  Import the Sanity client module
// // import { sanity } from '$lib/sanity';

// import { client } from "@/sanity/lib/client";

// // Base URL for the website
// const baseUrl = 'https://www.example.com';

// // Document types in Sanity CMS to include in the sitemap
// const docTypes = ["page", "business"];

// // Main function to fetch data and generate sitemap
// export async function GET() {
//   try {
//     // Fetch data from Sanity
//     const data = await fetchDataFromSanity();

//     // Generate sitemap XML from data
//     const sitemapXml = createSitemapXml(data);

//     // Return the XML response
//     return new Response(sitemapXml, {
//       headers: { 'Content-Type': 'application/xml' }
//     });
//   } catch (error) {
//     // Log and return error response
//     console.error(error);
//     return new Response('An error occurred while processing your request.', {
//       status: 500,
//       headers: { 'Content-Type': 'text/plain' }
//     });
//   }
// }

// // Fetch data from Sanity CMS
// async function fetchDataFromSanity() {
//   // GROQ query to select active documents of specified types and their translations
//   const query = `
//     *[_type in [
//       ${docTypes.map(type => `"${type}"`).join(", ")}] && isActive == true
//     ] {
//     "translations": *[_type == "translation.metadata" && references(^._id)]
//     .translations[].value->{
//       title, slug, language
//     }
//   }`;
//   // Fetch and return the query result
//   return await client.fetch(query);
// }

// // Generate sitemap XML from fetched data
// const createSitemapXml = (sanity_data) => {
//   // XML header
//   let sitemapXml = '<?xml version="1.0" encoding="UTF-8"?>\n' +
//     '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" ' +
//     'xmlns:xhtml="http://www.w3.org/1999/xhtml">\n';

//   // Set to track processed URLs
//   let parsedUrl = new Set();

//   // Iterate over each document and its translations
//   sanity_data.forEach(sanity_document => {
//     sanity_document.translations.forEach(tx => {
//       if (!tx) return;
//       if (parsedUrl.has(tx.slug.current)) return;
//       parsedUrl.add(tx.slug.current);
//       sitemapXml += ` <url>\n  <loc>${baseUrl}${tx.slug.current}</loc>\n`;
//       sanity_document.translations.forEach(tx2 => {
//         if (!tx2) return;
//         sitemapXml += '   <xhtml:link rel="alternate" hreflang="' + tx2.language + 
//               '" href="' + baseUrl + tx2.slug.current + '"/>\n';
//       });
//       sitemapXml += ` </url>\n`;
//     });
//   });

//   // Close XML tags
//   sitemapXml += `</urlset>`;
//   return sitemapXml;
// }