export const siteUrl = 'https://sufi-blog-website.vercel.app';
export const generateRobotsTxt = true;
export const sitemapSize = 7000;
export const outDir = './public';
export async function transform(config, paths) {
  // Fetch all posts or items you need from Sanity.io
  const fetchedSchemas = await getAllSlugsFromSanity(); // Define this function to fetch your data
  const allPages = fetchedSchemas.map(slug => {
    return { loc: `${config.siteUrl}/${slug}`, changefreq: 'daily', priority: 0.7 };
  });

  return [...paths, ...allPages];
}

// An example function to fetch all unique pages' or posts' slugs across all schemas
async function getAllSlugsFromSanity() {
  const client = require('./sanity/lib/client'); // Update to import your configured Sanity client

  const types = ["makemoney", "aitool", "news", "coding", "freeairesources", "seo"];

  let slugs = [];
  for (let type of types) {
    const query = `*[_type == "${type}"]{ "slug": slug.current }`;
    const data = await client.fetch(query);
    slugs = slugs.concat(data.map(item => `${type}/${item.slug}`));
  }

  return slugs;
}
