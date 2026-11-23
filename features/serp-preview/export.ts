export async function savePreviewPng(svg: SVGSVGElement) {
  const clone = svg.cloneNode(true) as SVGSVGElement;
  // XMLSerializer supplies the namespace from the SVG element itself.
  clone.removeAttribute("xmlns");
  // External images taint canvas without CORS permission. Keep the built-in site initial.
  clone.querySelectorAll("image").forEach((image) => image.remove());
  const data = new XMLSerializer().serializeToString(clone);
  const blobUrl = URL.createObjectURL(
    new Blob([data], { type: "image/svg+xml;charset=utf-8" }),
  );
  try {
    const image = new Image();
    await new Promise<void>((resolve, reject) => {
      image.onload = () => resolve();
      image.onerror = () =>
        reject(new Error("The preview image could not be created."));
      image.src = blobUrl;
    });
    const canvas = document.createElement("canvas");
    canvas.width = Number(svg.getAttribute("width")) * 2;
    canvas.height = Number(svg.getAttribute("height")) * 2;
    const context = canvas.getContext("2d");
    if (!context)
      throw new Error("Image export is unavailable in this browser.");
    context.scale(2, 2);
    context.drawImage(image, 0, 0);
    const png = await new Promise<Blob>((resolve, reject) =>
      canvas.toBlob(
        (b) =>
          b
            ? resolve(b)
            : reject(new Error("Could not save the preview image.")),
        "image/png",
      ),
    );
    const href = URL.createObjectURL(png),
      anchor = document.createElement("a");
    anchor.href = href;
    anchor.download = "serp-preview.png";
    anchor.click();
    setTimeout(() => URL.revokeObjectURL(href), 1000);
  } finally {
    URL.revokeObjectURL(blobUrl);
  }
}
