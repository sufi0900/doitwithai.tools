/** Embed bitmap assets so downloaded SVG/PNG files match the editor, including offline. */
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
  clone.setAttribute("font-family", "Arial, Helvetica, sans-serif");
  clone.querySelectorAll("[data-editor-only]").forEach((el) => el.remove());
  for (const image of Array.from(clone.querySelectorAll("image"))) {
    const href = image.getAttribute("href") || image.getAttribute("xlink:href");
    if (!href || href.startsWith("data:image/")) continue;
    const url = new URL(href, location.origin);
    if (!["https:", "http:", "blob:"].includes(url.protocol))
      throw new Error("Choose an image file or a valid image URL.");
    let blob: Blob;
    try {
      const response = await fetch(url.href, {
        credentials: "omit",
        signal: AbortSignal.timeout(12000),
      });
      if (!response.ok) throw new Error("Image request failed");
      blob = await response.blob();
      if (!blob.type.startsWith("image/")) throw new Error("Not an image");
      if (blob.size > 10 * 1024 * 1024) throw new Error("Image too large");
    } catch {
      throw new Error(
        "This image cannot be included in the download. Upload the image file, choose built-in artwork, or remove it.",
      );
    }
    const data = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result));
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
    image.setAttribute("href", data);
    image.removeAttribute("xlink:href");
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
