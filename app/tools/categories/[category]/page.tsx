import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import ToolCatalog from "@/features/tool-catalog/ToolCatalog";
import { categories, categoryPath, collectionSchema, tools, siteOrigin } from "@/features/tool-catalog/catalog";
type Props = { params: { category: string } };
export const dynamicParams = false;
export function generateStaticParams() { return categories.map(({ slug }) => ({ category: slug })); }
export function generateMetadata({ params }: Props): Metadata {
  const category = categories.find((item) => item.slug === params.category);
  if (!category) notFound();
  return { title: `${category.name} | Do It With AI Tools`, description: category.description, alternates: { canonical: `${siteOrigin}${categoryPath(category.slug)}` } };
}
export default function CategoryPage({ params }: Props) {
  const category = categories.find((item) => item.slug === params.category);
  if (!category) notFound();
  const items = tools.filter((tool) => tool.categories.includes(category.slug));
  return <main className="bg-slate-50 py-16 text-slate-900 dark:bg-[#171C28] dark:text-white"><div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8"><script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(collectionSchema(category.name, categoryPath(category.slug), items)).replace(/</g, "\\u003c") }} /><nav aria-label="Breadcrumb" className="mb-8 text-sm"><Link href="/tools">Tools</Link><span aria-hidden="true"> / </span><Link href="/tools/categories">Categories</Link><span aria-hidden="true"> / </span><span aria-current="page">{category.name}</span></nav><h1 className="text-4xl font-bold">{category.name}</h1><p className="mt-5 max-w-3xl leading-8 text-slate-600 dark:text-slate-300">{category.description}</p><ToolCatalog category={category.slug} /><Link href={category.guidePath} className="mt-10 inline-block font-semibold text-primary dark:text-blue-200">Explore related guides →</Link></div></main>;
}
