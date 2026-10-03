import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getGuides } from "@/features/guides/data";
import { siteOrigin } from "@/features/tool-catalog/catalog";

export const revalidate = 3600;
const pageNumber = (value?: string) => {
  if (!value) return 1;
  if (!/^[1-9]\d*$/.test(value) || Number(value) > 1000) notFound();
  return Number(value);
};
type Props = { searchParams: { page?: string } };

export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  const page = pageNumber(searchParams.page);
  const { total } = await getGuides(page);
  return {
    title: `${page > 1 ? `Page ${page} | ` : ""}Practical AI Tool Guides | Do It With AI Tools`,
    description: "Learn to plan, write, review, and organize your work with practical AI tool guides.",
    alternates: { canonical: `${siteOrigin}/guides${page > 1 ? `?page=${page}` : ""}` },
    robots: { index: total > 0, follow: true },
  };
}

export default async function GuidesPage({ searchParams }: Props) {
  const page = pageNumber(searchParams.page);
  const { items, total } = await getGuides(page);
  if (page > 1 && !items.length) notFound();
  const pages = Math.ceil(total / 12);
  return <main className="mx-auto max-w-7xl px-4 py-16 text-slate-900 dark:text-white">
    <nav aria-label="Breadcrumb" className="mb-8 text-sm"><Link href="/">Home</Link><span aria-hidden="true"> / </span><span aria-current="page">Guides</span></nav>
    <h1 className="text-4xl font-bold">Practical guides for useful work</h1>
    <p className="mt-5 max-w-3xl leading-8">Learn how to use our tools, review their output, and make informed decisions about your content and workflow.</p>
    <div className="mt-6 flex gap-6 text-primary dark:text-blue-200"><Link href="/tools">Explore tools →</Link><Link href="/ai-seo">Read SEO articles →</Link></div>
    {items.length ? <div className="mt-10 grid gap-6 md:grid-cols-2 xl:grid-cols-3">{items.map((guide) => <article key={guide._id} className="rounded-2xl border border-slate-200 p-6 dark:border-slate-700">
      <h2 className="text-2xl font-bold"><Link href={`/guides/${guide.slug}`}>{guide.title}</Link></h2>
      <p className="my-4 leading-7 text-slate-600 dark:text-slate-300">{guide.overview}</p>
      <Link href={`/guides/${guide.slug}`} className="font-semibold text-primary dark:text-blue-200">Read guide →<span className="sr-only"> {guide.title}</span></Link>
    </article>)}</div> : <section className="mt-10 rounded-2xl border border-dashed border-slate-300 p-8 dark:border-slate-600"><h2 className="text-2xl font-bold">New guides are being prepared</h2><p className="mt-3">Explore our existing SEO articles and available tools while we prepare these guides.</p></section>}
    {pages > 1 && <nav aria-label="Guide pagination" className="mt-10 flex gap-6">{page > 1 && <Link href={page === 2 ? "/guides" : `/guides?page=${page - 1}`} rel="prev">Previous</Link>}<span>Page {page} of {pages}</span>{page < pages && <Link href={`/guides?page=${page + 1}`} rel="next">Next</Link>}</nav>}
  </main>;
}
