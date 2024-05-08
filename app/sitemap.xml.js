import React from 'react';

const EXTERNAL_DATA_URL = 'https://sufi-blog-website.vercel.app/ai-tools';

const createSitemap = (posts) => `<?xml version="1.0" encoding="UTF-8"?>
    <urlset xmln="http://www.sitemaps.org/schemas/sitemap/0.9">
        ${posts
          .map(({ id }) => {
            return `
                <url>
                    <loc>${`${EXTERNAL_DATA_URL}/${id}`}</loc>
                </url>
            `;
          })
          .join('')}
    </urlset>
    `;
    async function fetchAllBlogs(page = 1, limit = 5, categories = []) {
        const start = (page - 1) * limit;
        const query = `*[_type in $categories] | order(publishedAt desc) {formattedDate, tags, readTime , _id, _type, title, slug, mainImage, overview, body, publishedAt }[${start}...${start + limit}]`;
        const result = await client.fetch(query, { categories });
        return result;
      }
      
class Sitemap extends React.Component {
  static async getInitialProps({ res }) {
 
    const request = await fetchAllBlogs(currentPage, 5, [
        "makemoney",
        "aitool",
        "news",
        "coding",
        "freeairesources",
        "seo",
      ]);
    const posts = await request.json();

    res.setHeader('Content-Type', 'text/xml');
    res.write(createSitemap(posts));
    res.end();
  }
}

export default Sitemap;