import React from "react";

const ORIGIN = "https://doitwithai.tools";

/** Standalone replacement for next/image. */
export default function Image(props: Record<string, unknown>) {
  const {
    src,
    alt,
    fill,
    priority: _p,
    quality: _q,
    placeholder: _ph,
    blurDataURL: _b,
    loader: _l,
    unoptimized: _u,
    style,
    ...rest
  } = props;
  let url = typeof src === "string" ? src : (src as { src?: string })?.src || "";
  if (url.startsWith("/")) url = ORIGIN + url;
  const fillStyle = fill
    ? { position: "absolute", inset: 0, width: "100%", height: "100%" }
    : {};
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      {...(rest as React.ImgHTMLAttributes<HTMLImageElement>)}
      src={url}
      alt={String(alt ?? "")}
      style={{ ...(fillStyle as object), ...((style as object) || {}) }}
    />
  );
}
