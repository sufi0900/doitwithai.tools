/** Embed bitmap assets so downloaded SVG/PNG files match the editor at Ultra-HD sharpness, including offline and external article images. */
export async function prepareVisualSvg(
  element: SVGSVGElement,
  width: number,
  height: number,
): Promise<string> {
  await document.fonts.ready;
  const clone = element.cloneNode(true) as SVGSVGElement;
  clone.setAttribute("xmlns", "http://www.w3.org/2000/svg");
  clone.setAttribute("xmlns:xlink", "http://www.w3.org/1999/xlink");
  clone.setAttribute("width", String(width));
  clone.setAttribute("height", String(height));
  clone.setAttribute("shape-rendering", "geometricPrecision");
  clone.setAttribute("text-rendering", "geometricPrecision");
  clone.setAttribute(
    "font-family",
    "Inter, system-ui, -apple-system, Arial, Helvetica, sans-serif",
  );
  // Remove interactive selection rings or editor-only markers from downloaded file
  clone.querySelectorAll("[data-editor-only]").forEach((el) => el.remove());

  for (const image of Array.from(clone.querySelectorAll("image"))) {
    image.setAttribute("image-rendering", "optimizeQuality");
    const href = image.getAttribute("href") || image.getAttribute("xlink:href");
    if (!href) continue;
    if (href.startsWith("data:image/")) {
      image.setAttribute("href", href);
      image.setAttributeNS(
        "http://www.w3.org/1999/xlink",
        "xlink:href",
        href,
      );
      continue;
    }

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

    // 1. Try our server-side proxy first for external URLs so original full-resolution bytes are fetched without CORS degradation
    if (/^https?:/i.test(url.protocol) && url.origin !== location.origin) {
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

    // 2. Direct browser fetch (for same-origin or CORS-enabled URLs)
    if (!dataUrl) {
      try {
        const response = await fetch(url.href, {
          credentials: "omit",
          signal: AbortSignal.timeout(8000),
        });
        if (response.ok) {
          const blob = await response.blob();
          if (
            blob.type.startsWith("image/") &&
            blob.size <= 15 * 1024 * 1024
          ) {
            dataUrl = await new Promise<string>((resolve, reject) => {
              const reader = new FileReader();
              reader.onload = () => resolve(String(reader.result));
              reader.onerror = reject;
              reader.readAsDataURL(blob);
            });
          }
        }
      } catch {}
    }

    if (dataUrl) {
      image.setAttribute("href", dataUrl);
      image.setAttributeNS(
        "http://www.w3.org/1999/xlink",
        "xlink:href",
        dataUrl,
      );
    } else {
      image.remove();
    }
  }

  return new XMLSerializer().serializeToString(clone);
}

export async function visualSvgCanvas(
  element: SVGSVGElement,
  width: number,
  height: number,
  scale = 2.5,
): Promise<HTMLCanvasElement> {
  const source = await prepareVisualSvg(element, width, height);
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(width * scale);
  canvas.height = Math.round(height * scale);
  const context = canvas.getContext("2d");
  if (!context) throw new Error("Canvas is unavailable in this browser.");
  context.imageSmoothingEnabled = true;
  context.imageSmoothingQuality = "high";

  const svgDataUrl =
    "data:image/svg+xml;charset=utf-8," + encodeURIComponent(source);
  const image = new Image();
  image.crossOrigin = "anonymous";
  await new Promise<void>((resolve, reject) => {
    image.onload = () => resolve();
    image.onerror = () => reject(new Error("Could not render SVG image."));
    image.src = svgDataUrl;
  });
  // Brief frame wait so nested data:image/ bitmaps inside the SVG finish decoding in Chromium
  await new Promise((r) => setTimeout(r, 40));
  context.drawImage(image, 0, 0, canvas.width, canvas.height);
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
