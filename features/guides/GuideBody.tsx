import React from "react";
import Image from "next/image";
import { PortableText } from "@portabletext/react";
import type { PortableTextComponents } from "@portabletext/react";
import { urlForImage } from "@/sanity/lib/image";
import { safeContentHref } from "@/features/tool-catalog/catalog-core.mjs";

const generateAnchor = (text: string): string => {
  if (!text) return "";
  return String(text)
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-+|-+$/g, "");
};

const extractHeadingText = (value: any, children: React.ReactNode): string => {
  if (value && Array.isArray(value.children)) {
    const fromSpans = value.children
      .map((span: any) => (typeof span?.text === "string" ? span.text : ""))
      .join("")
      .trim();
    if (fromSpans) return fromSpans;
  }
  const walk = (node: React.ReactNode): string => {
    if (node == null || typeof node === "boolean") return "";
    if (typeof node === "string" || typeof node === "number") return String(node);
    if (Array.isArray(node)) return node.map(walk).join("");
    if (React.isValidElement(node) && (node as React.ReactElement<any>).props) {
      return walk((node as React.ReactElement<any>).props.children);
    }
    return "";
  };
  return walk(children).trim();
};

const GuideTable = ({ value }: { value: any }) => {
  const rows = Array.isArray(value?.rows) ? value.rows : [];
  if (!rows.length) return null;
  const hasHeader = rows.length > 1;
  const theadRows = hasHeader ? rows.slice(0, 1) : [];
  const tbodyRows = hasHeader ? rows.slice(1) : rows;

  const renderCell = (cell: any) => {
    if (cell == null || cell === "") return "—";
    if (typeof cell === "string" || typeof cell === "number") return String(cell);
    if (typeof cell === "object" && (cell.text || cell.value)) return String(cell.text || cell.value);
    return "—";
  };

  return (
    <div className="my-8 overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-700">
      <table className="w-full border-collapse text-left text-sm">
        {theadRows.length > 0 && (
          <thead className="bg-slate-100 dark:bg-slate-800">
            {theadRows.map((row: any, rIdx: number) => (
              <tr key={row?._key || rIdx} className="border-b border-slate-200 dark:border-slate-700">
                {(Array.isArray(row?.cells) ? row.cells : []).map((cell: any, cIdx: number) => (
                  <th key={cIdx} scope="col" className="px-4 py-3 font-bold text-slate-900 dark:text-white">
                    {renderCell(cell)}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
        )}
        <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
          {tbodyRows.map((row: any, rIdx: number) => (
            <tr key={row?._key || rIdx} className="bg-white dark:bg-slate-900">
              {(Array.isArray(row?.cells) ? row.cells : []).map((cell: any, cIdx: number) => (
                <td key={cIdx} className="px-4 py-3 text-slate-700 dark:text-slate-300">
                  {renderCell(cell)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

const components: PortableTextComponents = {
  block: {
    normal: ({ children }) => <p className="my-5 leading-8">{children}</p>,
    h2: ({ children, value }) => {
      const id = generateAnchor(extractHeadingText(value, children));
      return <h2 id={id || undefined} className="scroll-mt-24 mb-4 mt-12 text-3xl font-bold">{children}</h2>;
    },
    h3: ({ children, value }) => {
      const id = generateAnchor(extractHeadingText(value, children));
      return <h3 id={id || undefined} className="scroll-mt-24 mb-3 mt-8 text-2xl font-bold">{children}</h3>;
    },
    h4: ({ children, value }) => {
      const id = generateAnchor(extractHeadingText(value, children));
      return <h4 id={id || undefined} className="scroll-mt-24 mb-3 mt-6 text-xl font-bold">{children}</h4>;
    },
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
    image: ({ value }) => value?.asset ? <figure className="my-8">
      <Image src={urlForImage(value).width(1200).fit("max").url()} alt={value.alt || ""} width={value.asset.metadata?.dimensions?.width || 1200} height={value.asset.metadata?.dimensions?.height || 675} className="h-auto w-full rounded-xl" />
      {value.caption && <figcaption className="mt-3 text-sm text-slate-600 dark:text-slate-300">{value.caption}</figcaption>}
    </figure> : null,
    table: GuideTable,
    richTable: GuideTable,
    complexTable: GuideTable,
  },
};

export default function GuideBody({ value }: { value: any[] }) {
  return <PortableText value={Array.isArray(value) ? value : []} components={components} />;
}
