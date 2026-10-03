import Link from "next/link";
import { getRelatedGuides } from "@/features/guides/data";
import { tools, toolPath } from "./catalog";

export default async function ToolResources({ slug }: { slug: string }) {
  const tool = tools.find((item) => item.slug === slug);
  if (!tool) return null;
  // The executable tool remains available if optional CMS recommendations fail.
  let guides: Array<{ _id: string; slug: string; title: string }> = [];
  try { guides = await getRelatedGuides(slug); } catch { console.error("Unable to load supporting guides"); }
  const related = tools.filter((item) => tool.relatedToolSlugs.includes(item.slug));
  return <aside aria-label="Supporting guides and related tools" className="mx-auto my-12 max-w-5xl rounded-2xl border border-slate-200 p-6 dark:border-slate-700">
    <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Continue your workflow</h2>
    <div className="mt-5 grid gap-6 sm:grid-cols-2">
      <div><h3 className="font-semibold">Learn how to review your output</h3><ul className="mt-3 space-y-3">
        {tool.relatedGuides.map((guide) => <li key={guide.path}><Link href={guide.path} className="text-primary underline dark:text-blue-200">{guide.title}</Link></li>)}
        {guides.map((guide) => <li key={guide._id}><Link href={`/guides/${guide.slug}`} className="text-primary underline dark:text-blue-200">{guide.title}</Link></li>)}
      </ul></div>
      <div><h3 className="font-semibold">Try a related tool</h3><ul className="mt-3 space-y-3">{related.map((item) => <li key={item.id}><Link href={toolPath(item.slug)} className="text-primary underline dark:text-blue-200">{item.name}</Link></li>)}</ul></div>
    </div>
  </aside>;
}
