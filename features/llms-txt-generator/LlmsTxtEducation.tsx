import Link from "next/link";

export default function LlmsTxtEducation() {
  return (
    <section className="border-t border-slate-200 bg-white py-16 dark:border-slate-800 dark:bg-slate-950">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        <h2 className="text-3xl font-black tracking-tight text-slate-950 dark:text-white">A practical guide to creating llms.txt</h2>
        <div className="mt-8 grid gap-6 md:grid-cols-2">
          <article className="min-w-0 rounded-2xl border border-slate-200 bg-slate-50 p-6 dark:border-slate-800 dark:bg-slate-900">
            <h3 className="text-lg font-bold text-slate-950 dark:text-white">What an llms.txt file is for</h3>
            <p className="mt-3 text-sm leading-7 text-slate-600 dark:text-slate-300">Llms.txt is a proposed Markdown convention for giving agents a concise route into useful website information. It can summarize your site and organize links.</p>
            <p className="mt-3 text-sm leading-7 text-slate-600 dark:text-slate-300">Treat it as a maintained reading guide. It does not replace accessible pages, internal navigation, or a clear explanation of your products and expertise.</p>
            <p className="mt-3 text-sm leading-7 text-slate-600 dark:text-slate-300">Publishing the file does not guarantee rankings or citations. Google states that special AI text files are unnecessary for its Search AI features.</p>
          </article>
          <article className="min-w-0 rounded-2xl border border-slate-200 bg-slate-50 p-6 dark:border-slate-800 dark:bg-slate-900">
            <h3 className="text-lg font-bold text-slate-950 dark:text-white">How to use this llms.txt generator</h3>
            <p className="mt-3 text-sm leading-7 text-slate-600 dark:text-slate-300">Enter your site name and a short summary. Explain who the site serves and what visitors can learn, using plain language.</p>
            <p className="mt-3 text-sm leading-7 text-slate-600 dark:text-slate-300">Add sections for distinct needs, such as getting started, tutorials, product documentation, and policies. Place your most useful resources first.</p>
            <p className="mt-3 text-sm leading-7 text-slate-600 dark:text-slate-300">You can import candidate links from a sitemap, then curate them. Imported titles and URLs are starting points, not finished editorial descriptions.</p>
          </article>
          <article className="min-w-0 rounded-2xl border border-slate-200 bg-slate-50 p-6 dark:border-slate-800 dark:bg-slate-900">
            <h3 className="text-lg font-bold text-slate-950 dark:text-white">Choose links that answer real questions</h3>
            <p className="mt-3 text-sm leading-7 text-slate-600 dark:text-slate-300">Include pages that explain your core topic, resolve common problems, or provide original reference material. Remove duplicate and outdated destinations.</p>
            <p className="mt-3 text-sm leading-7 text-slate-600 dark:text-slate-300">A focused selection is easier to maintain than a full website dump. There is no universal required link count, so choose by usefulness.</p>
            <p className="mt-3 text-sm leading-7 text-slate-600 dark:text-slate-300">Use descriptive link names. Where available, link to accurate Markdown versions that represent the same information as their public pages.</p>
          </article>
          <article className="min-w-0 rounded-2xl border border-slate-200 bg-slate-50 p-6 dark:border-slate-800 dark:bg-slate-900">
            <h3 className="text-lg font-bold text-slate-950 dark:text-white">Write descriptions that help readers choose</h3>
            <p className="mt-3 text-sm leading-7 text-slate-600 dark:text-slate-300">Replace generic notes such as useful guide with a specific description. Tell readers what task the destination helps them complete.</p>
            <p className="mt-3 text-sm leading-7 text-slate-600 dark:text-slate-300">For example, describe a title guide as a walkthrough of title length, search intent, and editing examples. Avoid unsupported best-tool claims.</p>
            <p className="mt-3 text-sm leading-7 text-slate-600 dark:text-slate-300">Missing-description notices are editing prompts. Add meaningful summaries before publishing rather than repeating the page title in every description field.</p>
          </article>
          <article className="min-w-0 rounded-2xl border border-slate-200 bg-slate-50 p-6 dark:border-slate-800 dark:bg-slate-900">
            <h3 className="text-lg font-bold text-slate-950 dark:text-white">Understand the format and file location</h3>
            <p className="mt-3 text-sm leading-7 text-slate-600 dark:text-slate-300">The proposal starts with a site or project heading. A short summary, background notes, and grouped Markdown links can follow.</p>
            <p className="mt-3 text-sm leading-7 text-slate-600 dark:text-slate-300">Publish at /llms.txt for a site overview. The current proposal also supports scoped files, such as /docs/llms.txt, covering their own path.</p>
            <p className="mt-3 text-sm leading-7 text-slate-600 dark:text-slate-300">Robots.txt expresses crawler rules. A sitemap lists discoverable URLs. Llms.txt supplies a curated overview, so keep these files consistent without treating them as interchangeable.</p>
          </article>
          <article className="min-w-0 rounded-2xl border border-slate-200 bg-slate-50 p-6 dark:border-slate-800 dark:bg-slate-900">
            <h3 className="text-lg font-bold text-slate-950 dark:text-white">Publish, review, and maintain your file</h3>
            <p className="mt-3 text-sm leading-7 text-slate-600 dark:text-slate-300">Copy or download the output, then open the published address in a browser. Check that the response contains the intended Markdown.</p>
            <p className="mt-3 text-sm leading-7 text-slate-600 dark:text-slate-300">Test each destination and remove broken links. Review the overview after changing product names, moving guides, or retiring old material.</p>
            <p className="mt-3 text-sm leading-7 text-slate-600 dark:text-slate-300">Keep the summary factual and concise. Improve the underlying pages first when information is missing, unclear, or unsupported by evidence.</p>
          </article>
        </div>
        <nav aria-label="Related tools" className="mt-8 flex flex-wrap gap-3">
          <Link href="/tools/robots-txt-generator" className="rounded-xl border border-blue-200 px-4 py-3 text-sm font-bold text-[#4662df] hover:underline dark:border-slate-700 dark:text-blue-300">Robots.txt Generator</Link>
          <Link href="/tools/ai-citation-readiness-checker" className="rounded-xl border border-blue-200 px-4 py-3 text-sm font-bold text-[#4662df] hover:underline dark:border-slate-700 dark:text-blue-300">AI Citation Readiness Checker</Link>
        </nav>
        <div className="mt-8 text-sm leading-7 text-slate-600 dark:text-slate-300"><h3 className="font-bold">Further reading</h3><ul className="mt-2 list-disc space-y-2 pl-5">
          <li><a href="https://llmstxt.org/" className="text-[#4662df] underline dark:text-blue-300">The llms.txt proposal</a></li>
          <li><a href="https://developers.google.com/search/docs/appearance/ai-features" className="text-[#4662df] underline dark:text-blue-300">Google AI features guidance</a></li>
        </ul></div>
      </div>
    </section>
  );
}
