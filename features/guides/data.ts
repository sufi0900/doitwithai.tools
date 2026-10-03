import { cache } from "react";
import { groq } from "next-sanity";
import { client } from "@/sanity/lib/client";

const publishedClient = client.withConfig({ perspective: "published", useCdn: false });
const fields = groq`
  _id, title, "slug": slug.current, overview, publishedAt, _updatedAt,
  authorName, metatitle, metadesc,
  mainImage{asset->{_id, url, metadata{dimensions}}, alt, caption},
  relatedToolSlugs,
  "relatedArticles": relatedArticles[]->{_id, _type, title, "slug": slug.current}
`;
const visible = groq`_type == "guide" && defined(slug.current) && defined(publishedAt) && publishedAt <= now()`;

export const getGuides = cache(async (page = 1) => {
  const current = Number.isInteger(page) && page > 0 ? Math.min(page, 1000) : 1;
  const start = (current - 1) * 12;
  return publishedClient.fetch(groq`{
    "items": *[${visible}] | order(publishedAt desc, _id asc)[${start}...${start + 12}]{${fields}},
    "total": count(*[${visible}])
  }`, {}, { next: { revalidate: 3600, tags: ["guide"] } });
});

export const getGuide = cache(async (slug: string) => publishedClient.fetch(
  groq`*[${visible} && slug.current == $slug][0]{${fields}, content[]{..., _type == "image" => {asset->{_id, url, metadata{dimensions}}}}}`,
  { slug },
  { next: { revalidate: 3600, tags: ["guide", `guide:${slug}`] } },
));

export const getRelatedGuides = cache(async (slug: string) => publishedClient.fetch(
  groq`*[${visible} && $slug in relatedToolSlugs] | order(publishedAt desc, _id asc)[0...3]{_id, title, "slug": slug.current}`,
  { slug },
  { next: { revalidate: 3600, tags: ["guide"] } },
));
