import { createClient } from "next-sanity";

export const client = createClient({
  projectId: 'gglvlxzt', // find this at manage.sanity.io or your sanity.json
  dataset: 'production', // or the name of your dataset
  useCdn: false, // `false` if you want to ensure fresh data
});

export async function fetchURLs() {
  const query = `*[_type in ["makemoney", "aitool", "news", "coding", "freeairesources", "seo"]] {
    "slug": slug.current,
    _type
  }`;
  const posts = await client.fetch(query);
  return posts;
}
