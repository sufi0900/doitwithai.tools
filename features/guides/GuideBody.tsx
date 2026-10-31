import Image from "next/image";
import { PortableText } from "@portabletext/react";
import type { PortableTextComponents } from "@portabletext/react";
import { urlForImage } from "@/sanity/lib/image";
import { safeContentHref } from "@/features/tool-catalog/catalog-core.mjs";

const components: PortableTextComponents = {
  block: {
    normal: ({ children }) => <p className="my-5 leading-8">{children}</p>,
    h2: ({ children }) => <h2 className="mb-4 mt-12 text-3xl font-bold">{children}</h2>,
    h3: ({ children }) => <h3 className="mb-3 mt-8 text-2xl font-bold">{children}</h3>,
    h4: ({ children }) => <h4 className="mb-3 mt-6 text-xl font-bold">{children}</h4>,
    blockquote: ({ children }) => <blockquote className="my-6 border-l-4 border-primary pl-5 italic">{children}</blockquote>,
  },
  list: {
    bullet: ({ children }) => <ul className="my-5 ml-6 list-disc space-y-3">{children}</ul>,
    number: ({ children }) => <ol className="my-5 ml-6 list-decimal space-y-3">{children}</ol>,
  },
  marks: {
    link: ({ value, children }) => {
      const href = safeContentHref(value?.href);
      if (!href) return <>{children}</>;
      return <a href={href} target={value?.blank ? "_blank" : undefined} rel={value?.blank ? "noopener noreferrer" : undefined} className="text-primary underline underline-offset-4 dark:text-blue-200">{children}</a>;
    },
  },
  types: {
    image: ({ value }) => value.asset ? <figure className="my-8">
      <Image src={urlForImage(value).width(1200).fit("max").url()} alt={value.alt || ""} width={value.asset.metadata?.dimensions?.width || 1200} height={value.asset.metadata?.dimensions?.height || 675} className="h-auto w-full rounded-xl" />
      {value.caption && <figcaption className="mt-3 text-sm text-slate-600 dark:text-slate-300">{value.caption}</figcaption>}
    </figure> : null,
  },
};

export default function GuideBody({ value }: { value: any[] }) {
  return <PortableText value={Array.isArray(value) ? value : []} components={components} />;
}
