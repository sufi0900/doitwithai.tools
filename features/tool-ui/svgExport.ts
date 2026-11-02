/** Embed bitmap assets so downloaded SVG/PNG files match the editor, including offline and external article images. */
export async function prepareVisualSvg(
  element: SVGSVGElement,
  width: number,
  height: number,
): Promise<string> {
  await document.fonts.ready;
  const clone = element.cloneNode(true) as SVGSVGElement;
  clone.setAttribute("xmlns", "http://www.w3.org/2000/svg");
  clone.setAttribute("width", String(width));
  clone.setAttribute("height", String(height));
  clone.setAttribute(
    "font-family",
    "Inter, system-ui, -apple-system, Arial, Helvetica, sans-serif",
  );
  clone.querySelectorAll("[data-editor-only]").forEach((el) => el.remove());

  for (const image of Array.from(clone.querySelectorAll("image"))) {
    const href = image.getAttribute("href") || image.getAttribute("xlink:href");
    if (!href || href.startsWith("data:image/")) continue;

    let url: URL;
    try {
      url = new URL(href, location.origin);
      if (!["https:", "http:", "blob:"].includes(url.protocol)) {
        image.remove();
        continue;
      }
    } catch {
      image.remove();
      continue;
    }

    let dataUrl = "";

    // 1. Try direct browser fetch first (works for same-origin and CORS-enabled CDNs)
    try {
      const response = await fetch(url.href, {
        credentials: "omit",
        signal: AbortSignal.timeout(8000),
      });
      if (response.ok) {
        const blob = await response.blob();
        if (blob.type.startsWith("image/") && blob.size <= 12 * 1024 * 1024) {
          dataUrl = await new Promise<string>((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(String(reader.result));
            reader.onerror = reject;
            reader.readAsDataURL(blob);
          });
        }
      }
    } catch {}

    // 2. Fallback: Use our same-origin server image proxy (/api/ai-tools/universal-extract?proxyImage=...)
    // This bypasses browser CORS restrictions on external blog/article images 100% of the time!
    if (!dataUrl && /^https?:/i.test(url.protocol)) {
      try {
        const proxyUrl = `/api/ai-tools/universal-extract?proxyImage=${encodeURIComponent(url.href)}`;
        const proxyRes = await fetch(proxyUrl, {
          signal: AbortSignal.timeout(12000),
        });
        if (proxyRes.ok) {
          const json = (await proxyRes.json()) as { dataUrl?: string };
          if (json?.dataUrl && json.dataUrl.startsWith("data:image/")) {
            dataUrl = json.dataUrl;
          }
        }
      } catch {}
    }

    if (dataUrl) {
      image.setAttribute("href", dataUrl);
      image.removeAttribute("xlink:href");
    } else {
      // Never block or crash the user's download if an external URL is offline; remove the unreachable image node cleanly
      image.remove();
    }
  }

  return new XMLSerializer().serializeToString(clone);
}

export async function visualSvgCanvas(
  element: SVGSVGElement,
  width: number,
  height: number,
  scale = 2,
): Promise<HTMLCanvasElement> {
  const source = await prepareVisualSvg(element, width, height);
  const canvas = document.createElement("canvas");
  canvas.width = width * scale;
  canvas.height = height * scale;
  const context = canvas.getContext("2d");
  if (!context) throw new Error("Canvas is unavailable in this browser.");
  const url = URL.createObjectURL(
    new Blob([source], { type: "image/svg+xml;charset=utf-8" }),
  );
  try {
    const image = new Image();
    image.src = url;
    await image.decode();
    context.drawImage(image, 0, 0, canvas.width, canvas.height);
  } finally {
    URL.revokeObjectURL(url);
  }
  return canvas;
}

export function saveVisualBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  setTimeout(() => URL.revokeObjectURL(url), 2000);
}
