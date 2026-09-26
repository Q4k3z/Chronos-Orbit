// ============================================================
//  SEAMLESS 3D SPHERICAL NOISE UTILITIES
// ============================================================
import * as THREE from 'three';

export function hash3(x, y, z) {
  let h = (Math.imul(x, 374761393) ^ Math.imul(y, 668265263) ^ Math.imul(z, 1274126177)) | 0;
  h = Math.imul(h ^ (h >>> 13), 1274126177);
  return ((h ^ (h >>> 16)) >>> 0) / 4294967296;
}

export function noise3D(x, y, z) {
  const ix = Math.floor(x), iy = Math.floor(y), iz = Math.floor(z);
  const fx = x - ix, fy = y - iy, fz = z - iz;
  const sx = fx * fx * (3 - 2 * fx);
  const sy = fy * fy * (3 - 2 * fy);
  const sz = fz * fz * (3 - 2 * fz);
  const n000 = hash3(ix, iy, iz);
  const n100 = hash3(ix + 1, iy, iz);
  const n010 = hash3(ix, iy + 1, iz);
  const n110 = hash3(ix + 1, iy + 1, iz);
  const n001 = hash3(ix, iy, iz + 1);
  const n101 = hash3(ix + 1, iy, iz + 1);
  const n011 = hash3(ix, iy + 1, iz + 1);
  const n111 = hash3(ix + 1, iy + 1, iz + 1);
  const nx00 = n000 * (1 - sx) + n100 * sx;
  const nx10 = n010 * (1 - sx) + n110 * sx;
  const nx01 = n001 * (1 - sx) + n101 * sx;
  const nx11 = n011 * (1 - sx) + n111 * sx;
  const nxy0 = nx00 * (1 - sy) + nx10 * sy;
  const nxy1 = nx01 * (1 - sy) + nx11 * sy;
  return nxy0 * (1 - sz) + nxy1 * sz;
}

export function fbm3D(x, y, z, octaves = 5) {
  let v = 0, a = 0.5, f = 1;
  for (let i = 0; i < octaves; i++) {
    v += a * noise3D(x * f, y * f, z * f);
    a *= 0.5; f *= 2.0;
  }
  return v;
}

export function turbulence3D(x, y, z, octaves = 4) {
  let v = 0, a = 0.5, f = 1;
  for (let i = 0; i < octaves; i++) {
    v += a * Math.abs(noise3D(x * f, y * f, z * f) * 2 - 1);
    a *= 0.5; f *= 2.0;
  }
  return v;
}

export function clamp(v, min = 0, max = 255) {
  return Math.max(min, Math.min(max, v));
}

export function lerpColor(r1, g1, b1, r2, g2, b2, t) {
  return [
    r1 + (r2 - r1) * t,
    g1 + (g2 - g1) * t,
    b1 + (b2 - b1) * t,
  ];
}

export const TEX_W = 1024, TEX_H = 512;

export function createCanvasTexture(drawFn, { colorSpace = THREE.SRGBColorSpace } = {}) {
  const canvas = document.createElement('canvas');
  canvas.width = TEX_W; canvas.height = TEX_H;
  const ctx = canvas.getContext('2d');
  const imageData = ctx.createImageData(TEX_W, TEX_H);
  const data = imageData.data;
  drawFn(data, TEX_W, TEX_H);
  ctx.putImageData(imageData, 0, 0);
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = colorSpace;
  return tex;
}
