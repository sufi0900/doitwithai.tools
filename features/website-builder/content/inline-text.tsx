import React, { Fragment, type ReactNode } from "react";

export function renderInlineText(value: string): ReactNode {
  const pattern = /(\[[^\]]+\]\(https:\/\/[^)\s]+\)|\*\*[^*]+\*\*|\+\+[^+]+\+\+|\*[^*]+\*)/g;
  return value.split(pattern).filter(Boolean).map((part, index) => {
    const link = part.match(/^\[([^\]]+)\]\((https:\/\/[^)\s]+)\)$/);
    if (link) return <a key={index} href={link[2]} target="_blank" rel="noreferrer">{link[1]}</a>;
    if (part.startsWith("**") && part.endsWith("**")) return <strong key={index}>{part.slice(2, -2)}</strong>;
    if (part.startsWith("++") && part.endsWith("++")) return <u key={index}>{part.slice(2, -2)}</u>;
    if (part.startsWith("*") && part.endsWith("*")) return <em key={index}>{part.slice(1, -1)}</em>;
    return <Fragment key={index}>{part}</Fragment>;
  });
}
