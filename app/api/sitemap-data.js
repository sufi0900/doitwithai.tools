// pages/api/sitemap-data.js
import { client } from "@/sanity/lib/client";
export default async function handler(req, res) {
  const query = '*[_type == "post"]{slug}';
  const posts = await client.fetch(query);
  res.status(200).json(posts);
}
