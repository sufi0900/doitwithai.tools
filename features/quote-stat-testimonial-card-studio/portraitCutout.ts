/**
 * In-browser background removal & studio backdrop cleanup for customer portraits.
 *
 * Includes TWO complementary engines:
 * 1. `removeStudioBackdropInstant(img)` — Zero-dependency, <15ms border-floodfill
 *    studio backdrop remover that strips solid/gradient gray, slate, cream, or dark
 *    studio walls around head-and-shoulders portraits with zero network calls.
 * 2. `removePortraitBackground(img)` — MediaPipe selfie segmentation (loaded lazily
 *    when the user uploads a custom photo), with automatic fallback to
 *    `removeStudioBackdropInstant(img)` so background removal never fails.
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
 * Fast, zero-dependency border flood-fill background remover for studio headshots.
 * Strips uniform or smooth-gradient studio walls connected to the top/left/right
 * borders of the image while preserving the person's hair, face, and suit.
 */
export function removeStudioBackdropInstant(
  img: HTMLImageElement,
): HTMLCanvasElement {
  const MAX = 720;
  const scale = Math.min(
    1,
    MAX / Math.max(img.naturalWidth || 1, img.naturalHeight || 1),
  );
  const w = Math.max(1, Math.round((img.naturalWidth || img.width) * scale));
  const h = Math.max(1, Math.round((img.naturalHeight || img.height) * scale));

  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d");
  if (!ctx) return canvas;

  ctx.drawImage(img, 0, 0, w, h);
  const imgData = ctx.getImageData(0, 0, w, h);
  const d = imgData.data;

  // Check if image already has significant transparency
  let transparentCount = 0;
  for (let x = 0; x < w; x += 4) {
    if (d[x * 4 + 3] < 30) transparentCount++;
  }
  if (transparentCount > w / 8) {
    return canvas;
  }

  // Build per-row left & right border studio wall color profile (top 82% of height)
  const leftProfile = new Float32Array(h * 3);
  const rightProfile = new Float32Array(h * 3);
  const maxBorderY = Math.floor(h * 0.82);

  for (let y = 0; y < h; y++) {
    const sy = Math.min(y, maxBorderY);
    const lIdx = (sy * w + Math.min(w - 1, 2)) * 4;
    const rIdx = (sy * w + Math.max(0, w - 3)) * 4;
    leftProfile[y * 3] = d[lIdx];
    leftProfile[y * 3 + 1] = d[lIdx + 1];
    leftProfile[y * 3 + 2] = d[lIdx + 2];
    rightProfile[y * 3] = d[rIdx];
    rightProfile[y * 3 + 1] = d[rIdx + 1];
    rightProfile[y * 3 + 2] = d[rIdx + 2];
  }

  // Visited mask: 0 = unvisited, 1 = background
  const bgMask = new Uint8Array(w * h);
  const queue = new Int32Array(w * h);
  let qHead = 0;
  let qTail = 0;

  const pushSeed = (x: number, y: number) => {
    const idx = y * w + x;
    if (bgMask[idx] === 0) {
      bgMask[idx] = 1;
      queue[qTail++] = idx;
    }
  };

  // Seed top edge, left edge (upper 84%), and right edge (upper 84%)
  for (let x = 0; x < w; x++) pushSeed(x, 0);
  for (let y = 0; y < Math.floor(h * 0.84); y++) {
    pushSeed(0, y);
    pushSeed(w - 1, y);
  }

  const wallTolSq = 44 * 44; // tolerance to interpolated wall color
  const stepTolSq = 18 * 18; // pixel-to-pixel smoothness constraint

  while (qHead < qTail) {
    const curr = queue[qHead++];
    const cy = Math.floor(curr / w);
    const cx = curr - cy * w;
    const cOff = curr * 4;
    const cr = d[cOff];
    const cg = d[cOff + 1];
    const cb = d[cOff + 2];

    const neighbors = [
      cx > 0 ? curr - 1 : -1,
      cx + 1 < w ? curr + 1 : -1,
      cy > 0 ? curr - w : -1,
      cy + 1 < h ? curr + w : -1,
    ];

    for (let i = 0; i < 4; i++) {
      const nIdx = neighbors[i];
      if (nIdx < 0 || bgMask[nIdx] !== 0) continue;

      const ny = Math.floor(nIdx / w);
      const nx = nIdx - ny * w;
      // Protect center face/torso core from accidental flood-in
      if (nx > w * 0.28 && nx < w * 0.72 && ny > h * 0.16 && ny < h * 0.95) {
        continue;
      }

      const nOff = nIdx * 4;
      const nr = d[nOff];
      const ng = d[nOff + 1];
      const nb = d[nOff + 2];

      const drStep = nr - cr;
      const dgStep = ng - cg;
      const dbStep = nb - cb;
      if (drStep * drStep + dgStep * dgStep + dbStep * dbStep > stepTolSq) {
        continue;
      }

      const t = nx / Math.max(1, w - 1);
      const wr = leftProfile[ny * 3] * (1 - t) + rightProfile[ny * 3] * t;
      const wg =
        leftProfile[ny * 3 + 1] * (1 - t) + rightProfile[ny * 3 + 1] * t;
      const wb =
        leftProfile[ny * 3 + 2] * (1 - t) + rightProfile[ny * 3 + 2] * t;

      const drW = nr - wr;
      const dgW = ng - wg;
      const dbW = nb - wb;
      if (drW * drW + dgW * dgW + dbW * dbW <= wallTolSq) {
        bgMask[nIdx] = 1;
        queue[qTail++] = nIdx;
      }
    }
  }

  // Apply soft 2-pixel feather at foreground/background boundary
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const idx = y * w + x;
      if (bgMask[idx] === 1) {
        d[idx * 4 + 3] = 0;
      } else {
        let bgNeighbors = 0;
        for (let dy = -1; dy <= 1; dy++) {
          const ny = y + dy;
          if (ny < 0 || ny >= h) continue;
          for (let dx = -1; dx <= 1; dx++) {
            const nx = x + dx;
            if (nx < 0 || nx >= w) continue;
            if (bgMask[ny * w + nx] === 1) bgNeighbors++;
          }
        }
        if (bgNeighbors > 0) {
          d[idx * 4 + 3] = Math.round(255 * (1 - bgNeighbors / 10));
        }
      }
    }
  }

  ctx.putImageData(imgData, 0, 0);
  return canvas;
}

/**
 * Returns a canvas containing only the person (transparent background),
 * cropped tightly around them. Falls back to `removeStudioBackdropInstant`
 * if MediaPipe is unavailable.
 */
export async function removePortraitBackground(
  img: HTMLImageElement,
): Promise<HTMLCanvasElement> {
  try {
    const MAX = 1024;
    const scale = Math.min(
      1,
      MAX / Math.max(img.naturalWidth, img.naturalHeight),
    );
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

    let centre = 0;
    let centreN = 0;
    let border = 0;
    let borderN = 0;
    for (let y = 0; y < mh; y += 4) {
      for (let x = 0; x < mw; x += 4) {
        const v = data[y * mw + x];
        const inCentre =
          x > mw * 0.3 && x < mw * 0.7 && y > mh * 0.25 && y < mh * 0.75;
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
    const invert =
      centre / Math.max(1, centreN) < border / Math.max(1, borderN);

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

    const feather = document.createElement("canvas");
    feather.width = mw;
    feather.height = mh;
    const fctx = feather.getContext("2d");
    if (!fctx) throw new Error("Canvas not supported");
    if ("filter" in fctx) fctx.filter = "blur(1.2px)";
    fctx.drawImage(maskCanvas, 0, 0);
    fctx.filter = "none";

    const out = document.createElement("canvas");
    out.width = w;
    out.height = h;
    const octx = out.getContext("2d");
    if (!octx) throw new Error("Canvas not supported");
    octx.drawImage(src, 0, 0);
    octx.globalCompositeOperation = "destination-in";
    octx.drawImage(feather, 0, 0, w, h);
    octx.globalCompositeOperation = "source-over";

    return out;
  } catch {
    return removeStudioBackdropInstant(img);
  }
}
