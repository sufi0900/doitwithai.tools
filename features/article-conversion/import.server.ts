import { fetchPublic, publicUrl } from "../backlink-verifier/fetch.server";
import { extractArticle } from "./extract";
export async function importArticle(
  raw: string,
  signal?: AbortSignal,
  fetcher = fetchPublic,
) {
  const r = await fetcher(publicUrl(raw).href, {
    bytes: 500000,
    timeout: 18000,
    signal,
  });
  if ([401, 403].includes(r.status))
    throw Error("This page blocked access. Paste article text or copied HTML.");
  if (r.status === 429)
    throw Error(
      "The publisher is limiting requests. Wait or use pasted content.",
    );
  if (r.status < 200 || r.status >= 300)
    throw Error(
      `The publisher returned HTTP ${r.status}. Check the URL or use pasted content.`,
    );
  return extractArticle(r.html, r.url);
}
export async function importImage(
  raw: string,
  signal?: AbortSignal,
  fetcher = fetchPublic,
) {
  const r = await fetcher(publicUrl(raw).href, {
    image: true,
    bytes: 1500000,
    timeout: 7000,
    signal,
  });
  if (r.status !== 200 || !r.data?.length)
    throw Error("This image could not be imported. Continue without it.");
  const png = r.data
      .subarray(0, 8)
      .equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10])),
    jpeg = r.data[0] === 255 && r.data[1] === 216 && r.data[2] === 255;
  if (!png && !jpeg)
    throw Error("Image bytes were not a supported PNG or JPEG.");
  // Inspect dimensions before the browser decoder allocates image pixels.
  let width = 0,
    height = 0;
  if (png && r.data.length >= 24) {
    if (
      r.data.readUInt32BE(8) !== 13 ||
      r.data.toString("ascii", 12, 16) !== "IHDR"
    )
      throw Error("Image PNG header was invalid.");
    width = r.data.readUInt32BE(16);
    height = r.data.readUInt32BE(20);
  } else if (jpeg) {
    let offset = 2;
    while (offset + 4 <= r.data.length) {
      if (r.data[offset++] !== 255) break;
      while (r.data[offset] === 255) offset++;
      const marker = r.data[offset++];
      if (marker === 217 || marker === 218) break;
      if (marker === 1 || (marker >= 208 && marker <= 215)) continue;
      if (offset + 2 > r.data.length) break;
      const length = r.data.readUInt16BE(offset);
      if (length < 2 || offset + length > r.data.length) break;
      if (
        [
          192, 193, 194, 195, 197, 198, 199, 201, 202, 203, 205, 206, 207,
        ].includes(marker) &&
        length >= 8
      ) {
        height = r.data.readUInt16BE(offset + 3);
        width = r.data.readUInt16BE(offset + 5);
        break;
      }
      offset += length;
    }
  }
  if (!width || !height || width * height > 12000000)
    throw Error("Image dimensions were invalid or exceeded 12 megapixels.");
  return {
    data: `data:image/${png ? "png" : "jpeg"};base64,${r.data.toString("base64")}`,
  };
}
