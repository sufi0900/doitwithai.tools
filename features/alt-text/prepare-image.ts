import { MAX_IMAGE_BYTES } from "./schema";
export async function prepareImage(file: File) {
  if (!["image/jpeg", "image/png", "image/webp"].includes(file.type))
    throw Error(
      "Choose a PNG, JPEG, or WebP file. SVG and animated formats are not supported.",
    );
  if (file.size > 10_000_000)
    throw Error("Choose an original file smaller than 10 MB.");
  if (typeof createImageBitmap !== "function")
    throw Error(
      "Image upload is unavailable in this browser. Use a written description instead.",
    );
  let bitmap: ImageBitmap;
  try {
    bitmap = await createImageBitmap(file);
  } catch {
    throw Error(
      "This file cannot be decoded. Choose another image or use a written description.",
    );
  }
  try {
    if (bitmap.width * bitmap.height > 24_000_000)
      throw Error("Choose an image below 24 megapixels.");
    const ratio = Math.min(1, 1600 / Math.max(bitmap.width, bitmap.height));
    const canvas = document.createElement("canvas");
    canvas.width = Math.max(1, Math.round(bitmap.width * ratio));
    canvas.height = Math.max(1, Math.round(bitmap.height * ratio));
    const ctx = canvas.getContext("2d");
    if (!ctx)
      throw Error(
        "This browser cannot prepare images. Use a written description instead.",
      );
    ctx.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
    const data = canvas.toDataURL("image/webp", 0.85);
    const payload = data.split(",")[1];
    const bytes =
      (payload.length * 3) / 4 -
      (payload.endsWith("==") ? 2 : payload.endsWith("=") ? 1 : 0);
    if (bytes > MAX_IMAGE_BYTES)
      throw Error(
        "The prepared image is too large. Resize the original or use a written description.",
      );
    return {
      data,
      name: file.name,
      width: canvas.width,
      height: canvas.height,
      bytes,
    };
  } finally {
    bitmap.close();
  }
}
