import { client } from "@/sanity/lib/client";
import Link from "next/link";

async function fetchSubcategories() {
  const query = `*[_type == "seoSubcategory"] {
    title,
    slug,
    description
  }`;
  return await client.fetch(query);
}

export default async function SubcategoriesPage() {
  const subcategories = await fetchSubcategories();

  return (
   <></>
  );
}
