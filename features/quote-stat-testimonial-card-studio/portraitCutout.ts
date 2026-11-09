/**
 * In-browser background removal for the customer photo.
 *
 * - Runs 100% in the visitor's browser (MediaPipe selfie segmentation, Apache-2.0).
 *   The photo is never uploaded to any server.
 * - The library and the ~250 KB model are fetched lazily the first time the
 *   user uploads a photo, so they add nothing to normal page load.
 * - If anything fails (offline, blocked CDN, old browser) the caller keeps the
 *   original photo, so the tool never breaks.
 */

const VISION_VERSION = "0.10.14";
const VISION_BASE = `https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@${VISION_VERSION}`;
const MODEL_URL =
  "https://storage.googleapis.com/mediapipe-models/image_segmenter/selfie_segmenter/float16/latest/selfie_segmenter.tflite";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
let segmenterPromise: Promise<any> | null = null;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function getSegmenter(): Promise<any> {
  if (!segmenterPromise) {
    segmenterPromise = (async () => {
      const url = `${VISION_BASE}/+esm`;
      // webpackIgnore: load straight from the CDN, do not bundle
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const mod: any = await import(/* webpackIgnore: true */ url);
      const fileset = await mod.FilesetResolver.forVisionTasks(
        `${VISION_BASE}/wasm`,
      );
      return mod.ImageSegmenter.createFromOptions(fileset, {
        baseOptions: { modelAssetPath: MODEL_URL },
        runningMode: "IMAGE",
        outputConfidenceMasks: true,
        outputCategoryMask: false,
      });
    })().catch((err) => {
      segmenterPromise = null;
      throw err;
    });
  }
  return segmenterPromise;
}

export function loadImageFromFile(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error("Could not read the file"));
    reader.onload = () => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = () => reject(new Error("Unsupported image format"));
      img.src = String(reader.result);
    };
    reader.readAsDataURL(file);
  });
}

/**
 * Returns a canvas containing only the person (transparent background),
 * cropped tightly around them.
 */
export async function removePortraitBackground(
  img: HTMLImageElement,
): Promise<HTMLCanvasElement> {
  const MAX = 1024;
  const scale = Math.min(1, MAX / Math.max(img.naturalWidth, img.naturalHeight));
  const w = Math.max(1, Math.round(img.naturalWidth * scale));
  const h = Math.max(1, Math.round(img.naturalHeight * scale));

  const src = document.createElement("canvas");
  src.width = w;
  src.height = h;
  const sctx = src.getContext("2d");
  if (!sctx) throw new Error("Canvas not supported");
  sctx.drawImage(img, 0, 0, w, h);

  const segmenter = await getSegmenter();
  const result = segmenter.segment(src);
  const mask = result.confidenceMasks?.[0];
  if (!mask) throw new Error("Segmentation returned no mask");
  const mw: number = mask.width;
  const mh: number = mask.height;
  const data: Float32Array = mask.getAsFloat32Array();

  // The model's mask polarity is not guaranteed, so decide which class is the
  // person: the person is whichever class dominates the centre of the frame
  // compared with the borders.
  let centre = 0;
  let centreN = 0;
  let border = 0;
  let borderN = 0;
  for (let y = 0; y < mh; y += 4) {
    for (let x = 0; x < mw; x += 4) {
      const v = data[y * mw + x];
      const inCentre = x > mw * 0.3 && x < mw * 0.7 && y > mh * 0.25 && y < mh * 0.75;
      const onBorder = x < mw * 0.06 || x > mw * 0.94 || y < mh * 0.04;
      if (inCentre) {
        centre += v;
        centreN++;
      } else if (onBorder) {
        border += v;
        borderN++;
      }
    }
  }
  const invert = centre / Math.max(1, centreN) < border / Math.max(1, borderN);

  // Build a soft alpha mask
  const maskCanvas = document.createElement("canvas");
  maskCanvas.width = mw;
  maskCanvas.height = mh;
  const mctx = maskCanvas.getContext("2d");
  if (!mctx) throw new Error("Canvas not supported");
  const md = mctx.createImageData(mw, mh);
  const lo = 0.35;
  const hi = 0.65;
  for (let i = 0; i < mw * mh; i++) {
    let v = data[i];
    if (invert) v = 1 - v;
    const t = Math.min(1, Math.max(0, (v - lo) / (hi - lo)));
    const a = t * t * (3 - 2 * t);
    md.data[i * 4] = 255;
    md.data[i * 4 + 1] = 255;
    md.data[i * 4 + 2] = 255;
    md.data[i * 4 + 3] = Math.round(a * 255);
  }
  mctx.putImageData(md, 0, 0);
  try {
    mask.close?.();
    result.close?.();
  } catch {
    /* ignore */
  }

  // Slightly feather the edge where the browser supports canvas filters
  const feather = document.createElement("canvas");
  feather.width = mw;
  feather.height = mh;
  const fctx = feather.getContext("2d");
  if (!fctx) throw new Error("Canvas not supported");
  if ("filter" in fctx) fctx.filter = "blur(1.2px)";
  fctx.drawImage(maskCanvas, 0, 0);
  fctx.filter = "none";

  // Apply mask to the photo
  const out = document.createElement("canvas");
  out.width = w;
  out.height = h;
  const octx = out.getContext("2d");
  if (!octx) throw new Error("Canvas not supported");
  octx.drawImage(src, 0, 0);
  octx.globalCompositeOperation = "destination-in";
  octx.drawImage(feather, 0, 0, w, h);
  octx.globalCompositeOperation = "source-over";

  // Crop to the person's bounding box
  const px = octx.getImageData(0, 0, w, h).data;
  let minX = w, minY = h, maxX = 0, maxY = 0, hits = 0;
  for (let y = 0; y < h; y += 2) {
    for (let x = 0; x < w; x += 2) {
      if (px[(y * w + x) * 4 + 3] > 40) {
        hits++;
        if (x < minX) minX = x;
        if (x > maxX) maxX = x;
        if (y < minY) minY = y;
        if (y > maxY) maxY = y;
      }
    }
  }
  // If almost nothing was detected as a person, treat it as a failure so the
  // caller falls back to the original photo instead of an empty image.
  if (hits < (w * h) / 4 / 40) throw new Error("No person detected");

  const padX = Math.round((maxX - minX) * 0.02);
  const padY = Math.round((maxY - minY) * 0.02);
  const cx0 = Math.max(0, minX - padX);
  const cy0 = Math.max(0, minY - padY);
  const cw = Math.min(w - cx0, maxX - minX + padX * 2);
  const chh = Math.min(h - cy0, maxY - minY + padY * 2);
  const cropped = document.createElement("canvas");
  cropped.width = cw;
  cropped.height = chh;
  cropped.getContext("2d")?.drawImage(out, cx0, cy0, cw, chh, 0, 0, cw, chh);
  return cropped;
}
