import React from "react";

const ORIGIN = "https://doitwithai.tools";

export function toAbsolute(href: unknown): string {
  const raw =
    typeof href === "string"
      ? href
      : href && typeof href === "object" && "pathname" in (href as object)
        ? String((href as { pathname?: string }).pathname || "/")
        : "#";
  if (raw.startsWith("/")) return ORIGIN + raw;
  return raw;
}

/** Standalone replacement for next/link: plain anchors that open the live site. */
export default function Link(props: Record<string, unknown>) {
  const {
    href,
    children,
    prefetch: _prefetch,
    replace: _replace,
    scroll: _scroll,
    shallow: _shallow,
    passHref: _passHref,
    legacyBehavior: _legacy,
    locale: _locale,
    ...rest
  } = props;
  const abs = toAbsolute(href);
  const external = abs.startsWith("http") || abs.startsWith("mailto:");
  return (
    <a
      {...(rest as React.AnchorHTMLAttributes<HTMLAnchorElement>)}
      href={abs}
      {...(external && !abs.startsWith("#")
        ? { target: "_blank", rel: "noopener noreferrer" }
        : {})}
    >
      {children as React.ReactNode}
    </a>
  );
}
