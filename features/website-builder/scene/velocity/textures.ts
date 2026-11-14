import * as THREE from "three";

/** Small procedural textures. Generated once on the client from a 2D canvas; no image files are loaded. */
function canvas(width: number, height: number) {
  const el = document.createElement("canvas");
  el.width = width; el.height = height;
  return { el, ctx: el.getContext("2d")! };
}
const finish = (texture: THREE.CanvasTexture, srgb = true) => { texture.colorSpace = srgb ? THREE.SRGBColorSpace : THREE.NoColorSpace; texture.anisotropy = 4; texture.needsUpdate = true; return texture; };

/** Soft radial glow for light flares and sprites. */
export function makeGlowTexture(): THREE.CanvasTexture {
  const { el, ctx } = canvas(128, 128);
  const g = ctx.createRadialGradient(64, 64, 0, 64, 64, 64);
  g.addColorStop(0, "rgba(255,255,255,1)"); g.addColorStop(0.22, "rgba(255,255,255,.55)"); g.addColorStop(0.55, "rgba(255,255,255,.12)"); g.addColorStop(1, "rgba(255,255,255,0)");
  ctx.fillStyle = g; ctx.fillRect(0, 0, 128, 128);
  return finish(new THREE.CanvasTexture(el));
}

/** Vertical fade used as an alpha map for headlight beams (bright at the lamp, gone at the far end). */
export function makeBeamTexture(): THREE.CanvasTexture {
  const { el, ctx } = canvas(8, 256);
  const g = ctx.createLinearGradient(0, 0, 0, 256);
  g.addColorStop(0, "#fff"); g.addColorStop(0.25, "#8a8a8a"); g.addColorStop(1, "#000");
  ctx.fillStyle = g; ctx.fillRect(0, 0, 8, 256);
  return finish(new THREE.CanvasTexture(el), false);
}

/** Metallic-flake micro-relief for the paint's bump map. */
export function makeFlakeTexture(): THREE.CanvasTexture {
  const { el, ctx } = canvas(256, 256);
  ctx.fillStyle = "#808080"; ctx.fillRect(0, 0, 256, 256);
  let seed = 1337;
  const rand = () => { seed = (seed * 16807) % 2147483647; return seed / 2147483647; };
  for (let i = 0; i < 5200; i += 1) {
    const v = Math.floor(rand() * 255);
    ctx.fillStyle = `rgb(${v},${v},${v})`;
    const size = 0.7 + rand() * 1.6;
    ctx.fillRect(rand() * 256, rand() * 256, size, size);
  }
  const texture = finish(new THREE.CanvasTexture(el), false);
  texture.wrapS = texture.wrapT = THREE.RepeatWrapping; texture.repeat.set(11, 11);
  return texture;
}

/** Fine hex-style mesh for the grille and air intakes. */
export function makeMeshTexture(): THREE.CanvasTexture {
  const { el, ctx } = canvas(128, 128);
  ctx.fillStyle = "#050607"; ctx.fillRect(0, 0, 128, 128);
  ctx.strokeStyle = "#2b2f36"; ctx.lineWidth = 3;
  for (let i = -128; i < 256; i += 16) { ctx.beginPath(); ctx.moveTo(i, 0); ctx.lineTo(i + 128, 128); ctx.stroke(); ctx.beginPath(); ctx.moveTo(i + 128, 0); ctx.lineTo(i, 128); ctx.stroke(); }
  const texture = finish(new THREE.CanvasTexture(el));
  texture.wrapS = texture.wrapT = THREE.RepeatWrapping; texture.repeat.set(3, 3);
  return texture;
}
