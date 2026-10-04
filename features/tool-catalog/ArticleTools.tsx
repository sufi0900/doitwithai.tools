import Link from "next/link";
import { tools, toolPath } from "./catalog";

export default function ArticleTools({ slugs }: { slugs?: string[] }) {
  const related = tools.filter((tool) => slugs?.includes(tool.slug));
  if (!related.length) return null;
  return <aside aria-label="Related interactive tools" className="mx-auto my-10 max-w-5xl rounded-2xl border border-slate-200 p-6 dark:border-slate-700"><h2 className="text-2xl font-bold">Put this guide into practice</h2><ul className="mt-5 flex flex-wrap gap-6">{related.map((tool) => <li key={tool.id}><Link href={toolPath(tool.slug)} className="font-semibold text-primary underline dark:text-blue-200">{tool.name}</Link></li>)}</ul></aside>;
}
