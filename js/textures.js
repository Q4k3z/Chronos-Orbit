// ============================================================
//  REALISTIC PLANET & CELESTIAL TEXTURES
// ============================================================
import * as THREE from 'three';
import { fbm3D, turbulence3D, clamp, lerpColor, createCanvasTexture } from './noise.js';

export function texMercury() {
  return createCanvasTexture((d, w, h) => {
    for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
      const i = (y * w + x) * 4;
      const nx = x / w * 8, ny = y / h * 4;
      let n = fbm3D(nx + 10, ny + 20, 0, 6);
      const cx = fbm3D(nx * 3 + 50, ny * 3 + 50, 1, 4);
      if (cx > 0.6) n *= 0.6;
      const base = n * 175 + 40;
      d[i] = clamp(base + 10);
      d[i+1] = clamp(base + 7);
      d[i+2] = clamp(base + 4);
      d[i+3] = 255;
    }
  });
}

export function bumpMercury() {
  return createCanvasTexture((d, w, h) => {
    for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
      const i = (y * w + x) * 4;
      const nx = x / w * 8, ny = y / h * 4;
      const b = clamp(fbm3D(nx + 10, ny + 20, 0, 5) * 255);
      d[i] = b; d[i+1] = b; d[i+2] = b; d[i+3] = 255;
    }
  }, { colorSpace: THREE.NoColorSpace });
}

export function texVenus() {
  return createCanvasTexture((d, w, h) => {
    for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
      const i = (y * w + x) * 4;
      const nx = x / w * 6, ny = y / h * 3;
      const n = fbm3D(nx + 5, ny + 15, 0, 6);
      const swirl = turbulence3D(nx * 2 + n * 2, ny * 2, 0.5, 4);
      const v = n * 0.6 + swirl * 0.4;
      d[i] = clamp(225 + v * 30);
      d[i+1] = clamp(185 + v * 40);
      d[i+2] = clamp(95 + v * 40);
      d[i+3] = 255;
    }
  });
}

export function texEarth() {
  return createCanvasTexture((d, w, h) => {
    for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
      const i = (y * w + x) * 4;
      const lat = (y / h - 0.5) * Math.PI;
      const nx = x / w * 8, ny = y / h * 4;
      const elevation = fbm3D(nx + 3.7, ny + 2.1, 0, 6);
      const detail = fbm3D(nx * 4 + 1.2, ny * 4 + 3.5, 1, 4) * 0.3;
      const e = elevation + detail;
      const absLat = Math.abs(lat);
      let r, g, b;

      if (absLat > 1.25) {
        r = 245; g = 250; b = 255;
      } else if (e < 0.38) {
        const depth = e / 0.38;
        [r, g, b] = lerpColor(6, 25, 75, 14, 60, 130, depth);
      } else if (e < 0.42) {
        [r, g, b] = lerpColor(14, 60, 130, 32, 125, 160, (e - 0.38) / 0.04);
      } else if (e < 0.54) {
        const t2 = (e - 0.42) / 0.12;
        [r, g, b] = lerpColor(32, 110, 40, 68, 142, 52, t2);
        if (absLat > 0.56) {
          const snow = (absLat - 0.56) / 0.7;
          [r, g, b] = lerpColor(r, g, b, 215, 225, 235, snow * snow);
        }
      } else if (e < 0.65) {
        const t2 = (e - 0.54) / 0.11;
        [r, g, b] = lerpColor(145, 125, 55, 185, 150, 85, t2);
      } else {
        const t2 = Math.min(1, (e - 0.65) / 0.15);
        [r, g, b] = lerpColor(120, 95, 60, 230, 225, 220, t2);
      }
      d[i] = clamp(r); d[i+1] = clamp(g); d[i+2] = clamp(b); d[i+3] = 255;
    }
  });
}

export function texEarthRoughness() {
  return createCanvasTexture((d, w, h) => {
    for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
      const i = (y * w + x) * 4;
      const nx = x / w * 8, ny = y / h * 4;
      const e = fbm3D(nx + 3.7, ny + 2.1, 0, 5);
      const isOcean = e < 0.42;
      const val = isOcean ? 25 : 225;
      d[i] = val; d[i+1] = val; d[i+2] = val; d[i+3] = 255;
    }
  }, { colorSpace: THREE.NoColorSpace });
}

export function bumpEarth() {
  return createCanvasTexture((d, w, h) => {
    for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
      const i = (y * w + x) * 4;
      const nx = x / w * 8, ny = y / h * 4;
      const elevation = fbm3D(nx + 3.7, ny + 2.1, 0, 6);
      const val = elevation < 0.42 ? 0 : clamp((elevation - 0.42) * 420);
      d[i] = val; d[i+1] = val; d[i+2] = val; d[i+3] = 255;
    }
  }, { colorSpace: THREE.NoColorSpace });
}

export function texEarthClouds() {
  return createCanvasTexture((d, w, h) => {
    for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
      const i = (y * w + x) * 4;
      // Sample a sphere so the cloud field joins across the map seam and poles.
      const lon = x / w * Math.PI * 2;
      const lat = (0.5 - y / h) * Math.PI;
      const nx = Math.cos(lat) * Math.cos(lon) * 3.2;
      const ny = Math.sin(lat) * 3.2;
      const nz = Math.cos(lat) * Math.sin(lon) * 3.2;
      const weather = fbm3D(nx + 10.2, ny + 5.1, nz + 2.7, 5);
      const wisps = turbulence3D(nx * 3 + 1.5, ny * 2 + 3.2, nz * 3, 4);
      const coverage = clamp((weather + wisps * 0.22 - 0.46) / 0.23, 0, 1);
      const alpha = coverage * coverage * (3 - 2 * coverage) * 245;
      d[i] = 255; d[i+1] = 255; d[i+2] = 255;
      d[i+3] = clamp(alpha);
    }
  });
}

export function texMoon() {
  return createCanvasTexture((d, w, h) => {
    for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
      const i = (y * w + x) * 4;
      const nx = x / w * 8, ny = y / h * 4;
      const n = fbm3D(nx + 40, ny + 25, 0, 6);
      const maria = fbm3D(nx * 1.5 + 5, ny * 1.5 + 5, 1, 3);
      let val = n * 180 + 50;
      if (maria < 0.38) val *= 0.65;
      const crater = fbm3D(nx * 4 + 10, ny * 4 + 10, 2, 4);
      if (crater > 0.72) val += 35;
      d[i] = clamp(val); d[i+1] = clamp(val); d[i+2] = clamp(val + 4); d[i+3] = 255;
    }
  });
}

export function texMars() {
  return createCanvasTexture((d, w, h) => {
    for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
      const i = (y * w + x) * 4;
      const lat = Math.abs(y / h - 0.5) * 2;
      const nx = x / w * 8, ny = y / h * 4;
      const n = fbm3D(nx + 7, ny + 3, 0, 6);
      const canyon = turbulence3D(nx * 3 + 20, ny * 1.5 + 10, 1, 4);
      let r, g, b;
      if (lat > 0.88) {
        const t = (lat - 0.88) / 0.12;
        [r, g, b] = lerpColor(190, 110, 70, 248, 240, 235, t);
      } else {
        const base = n * 0.7 + canyon * 0.3;
        r = clamp(170 + base * 80);
        g = clamp(75 + base * 45);
        b = clamp(40 + base * 25);
        if (n < 0.35) { r *= 0.7; g *= 0.65; b *= 0.6; }
      }
      d[i] = clamp(r); d[i+1] = clamp(g); d[i+2] = clamp(b); d[i+3] = 255;
    }
  });
}

export function bumpMars() {
  return createCanvasTexture((d, w, h) => {
    for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
      const i = (y * w + x) * 4;
      const nx = x / w * 8, ny = y / h * 4;
      const val = clamp(fbm3D(nx + 7, ny + 3, 0, 5) * 255);
      d[i] = val; d[i+1] = val; d[i+2] = val; d[i+3] = 255;
    }
  }, { colorSpace: THREE.NoColorSpace });
}

export function texJupiter() {
  return createCanvasTexture((d, w, h) => {
    for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
      const i = (y * w + x) * 4;
      const nx = x / w * 10, ny = y / h;
      const bandFreq = ny * 20;
      const bandNoise = fbm3D(nx * 2, bandFreq * 0.5, 0, 3) * 0.35;
      const band = Math.sin(bandFreq + bandNoise * 4) * 0.5 + 0.5;
      const turb = turbulence3D(nx + 30, ny * 6 + 40, 1, 4) * 0.18;
      const v = band + turb;

      const colors = [
        [210, 180, 130],
        [190, 140, 90],
        [230, 210, 170],
        [170, 120, 70],
      ];
      const ci = Math.floor(v * 3.99);
      const ct = (v * 3.99) - ci;
      const c1 = colors[Math.min(ci, 3)];
      const c2 = colors[Math.min(ci + 1, 3)];
      let [r, g, b] = lerpColor(c1[0], c1[1], c1[2], c2[0], c2[1], c2[2], ct);

      const spotX = 0.38, spotY = 0.62;
      const dx = (x / w - spotX), dy2 = (y / h - spotY);
      const dist = Math.sqrt(dx * dx * 2.0 + dy2 * dy2 * 9);
      if (dist < 0.055) {
        const st = 1 - dist / 0.055;
        const swirl2 = turbulence3D(nx * 5 + 100, ny * 10 + 100, 2, 3);
        r = clamp(r + st * (95 + swirl2 * 30));
        g = clamp(g - st * 45);
        b = clamp(b - st * 35);
      }
      d[i] = clamp(r); d[i+1] = clamp(g); d[i+2] = clamp(b); d[i+3] = 255;
    }
  });
}

export function texSaturn() {
  return createCanvasTexture((d, w, h) => {
    for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
      const i = (y * w + x) * 4;
      const nx = x / w * 8, ny = y / h;
      const band = Math.sin(ny * 24 + fbm3D(nx * 2, ny * 8, 0, 3) * 2) * 0.5 + 0.5;
      const turb = turbulence3D(nx + 50, ny * 5 + 60, 1, 4) * 0.12;
      const v = band + turb;
      d[i] = clamp(210 + v * 35);
      d[i+1] = clamp(185 + v * 30);
      d[i+2] = clamp(135 + v * 28);
      d[i+3] = 255;
    }
  });
}

export function texSaturnRings() {
  const canvas = document.createElement('canvas');
  canvas.width = 1024; canvas.height = 64;
  const ctx = canvas.getContext('2d');
  const imageData = ctx.createImageData(1024, 64);
  const d = imageData.data;
  for (let x = 0; x < 1024; x++) {
    const t = x / 1024;
    let density = 0;
    if (t > 0.08 && t < 0.22) density = 0.35 + fbm3D(t * 50, 0, 0, 2) * 0.2;
    if (t > 0.25 && t < 0.54) density = 0.85 + fbm3D(t * 80, 1, 0, 2) * 0.2;
    if (t > 0.54 && t < 0.58) density = 0.04;
    if (t > 0.58 && t < 0.82) density = 0.55 + fbm3D(t * 60, 2, 0, 2) * 0.25;
    if (t > 0.74 && t < 0.75) density = 0.05;
    if (t > 0.84 && t < 0.88) density = 0.4;

    const r = clamp(220 + fbm3D(t * 30, 3, 0, 2) * 30);
    const g = clamp(195 + fbm3D(t * 30, 4, 0, 2) * 25);
    const b = clamp(155 + fbm3D(t * 30, 5, 0, 2) * 20);
    for (let y2 = 0; y2 < 64; y2++) {
      const j = (y2 * 1024 + x) * 4;
      d[j] = r; d[j+1] = g; d[j+2] = b;
      const fineBands = 0.83 + 0.17 * Math.sin(t * 1700 + Math.sin(t * 90) * 2);
      d[j+3] = clamp(density * fineBands * 220);
    }
  }
  ctx.putImageData(imageData, 0, 0);
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

export function texUranus() {
  return createCanvasTexture((d, w, h) => {
    for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
      const i = (y * w + x) * 4;
      const nx = x / w * 6, ny = y / h;
      const band = Math.sin(ny * 12 + fbm3D(nx, ny * 4, 0, 3) * 1.5) * 0.5 + 0.5;
      const n = fbm3D(nx + 70, ny * 3 + 80, 1, 4) * 0.15;
      const v = band * 0.3 + n + 0.5;
      d[i] = clamp(135 + v * 40);
      d[i+1] = clamp(210 + v * 30);
      d[i+2] = clamp(225 + v * 25);
      d[i+3] = 255;
    }
  });
}

export function texNeptune() {
  return createCanvasTexture((d, w, h) => {
    for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
      const i = (y * w + x) * 4;
      const nx = x / w * 8, ny = y / h;
      const band = Math.sin(ny * 14 + fbm3D(nx * 1.5, ny * 6, 0, 3) * 2) * 0.5 + 0.5;
      const storm = turbulence3D(nx * 2 + 90, ny * 4 + 100, 1, 4);
      const v = band * 0.4 + storm * 0.15;
      d[i] = clamp(40 + v * 45);
      d[i+1] = clamp(75 + v * 55);
      d[i+2] = clamp(190 + v * 60);
      d[i+3] = 255;
    }
  });
}

export function texPluto() {
  return createCanvasTexture((d, w, h) => {
    for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
      const i = (y * w + x) * 4;
      const nx = x / w * 8, ny = y / h * 4;
      const n = fbm3D(nx + 88, ny + 44, 0, 6);
      let r = 165 + n * 50;
      let g = 125 + n * 40;
      let b = 100 + n * 30;

      const hx = (x / w - 0.5) * 3.2;
      const hy = -(y / h - 0.52) * 3.2;
      const f = Math.pow(hx*hx + hy*hy - 0.35, 3) - hx*hx * Math.pow(hy, 3);
      if (f < 0.05) {
        const edge = Math.min(1, Math.max(0, (0.05 - f) / 0.05));
        r = r * (1 - edge) + 245 * edge;
        g = g * (1 - edge) + 230 * edge;
        b = b * (1 - edge) + 215 * edge;
      }
      d[i] = clamp(r); d[i+1] = clamp(g); d[i+2] = clamp(b); d[i+3] = 255;
    }
  });
}

export function texSun() {
  return createCanvasTexture((d, w, h) => {
    for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
      const i = (y * w + x) * 4;
      const nx = x / w * 12, ny = y / h * 6;
      const n1 = fbm3D(nx + 1, ny + 2, 0, 5);
      const n2 = turbulence3D(nx * 2 + 5, ny * 2 + 8, 1, 4) * 0.35;
      const v = n1 + n2;
      d[i] = 255;
      d[i+1] = clamp(175 + v * 75);
      d[i+2] = clamp(35 + v * 60);
      d[i+3] = 255;
    }
  });
}

export function texEarthNight() {
  return createCanvasTexture((d, w, h) => {
    for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
      const i = (y * w + x) * 4;
      const lat = (y / h - 0.5) * Math.PI;
      const nx = x / w * 8, ny = y / h * 4;
      const elevation = fbm3D(nx + 3.7, ny + 2.1, 0, 6);
      const isLand = elevation >= 0.42 && Math.abs(lat) < 1.25;

      if (isLand) {
        // City clusters along coasts and rivers
        const cityNoise = fbm3D(nx * 8 + 12, ny * 8 + 15, 2, 5);
        const microNoise = turbulence3D(nx * 16, ny * 16, 0, 3);
        if (cityNoise > 0.52) {
          const intensity = Math.pow((cityNoise - 0.52) / 0.48, 1.8) * (0.6 + microNoise * 0.4);
          d[i]   = clamp(intensity * 255);       // Gold-white light
          d[i+1] = clamp(intensity * 200);       // Warm amber
          d[i+2] = clamp(intensity * 110);       // Soft glow
          d[i+3] = clamp(intensity * 255);
          continue;
        }
      }
      d[i] = d[i+1] = d[i+2] = d[i+3] = 0;
    }
  });
}

export function texIo() {
  return createCanvasTexture((d, w, h) => {
    for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
      const i = (y * w + x) * 4;
      const nx = x / w * 8, ny = y / h * 4;
      const n = fbm3D(nx + 15, ny + 10, 0, 5);
      const volcanic = turbulence3D(nx * 4 + 30, ny * 4 + 20, 1, 4);

      // Sulfur yellow base, orange-red volcanic hotspots, black calderas
      let r = 230 + n * 25;
      let g = 190 + n * 20;
      let b = 50 + n * 30;

      if (volcanic > 0.65) {
        // Red-orange volcanic deposits
        r = 210; g = 75; b = 25;
      }
      if (volcanic > 0.82) {
        // Black lava calderas
        r = 40; g = 30; b = 25;
      }
      d[i] = clamp(r); d[i+1] = clamp(g); d[i+2] = clamp(b); d[i+3] = 255;
    }
  });
}

export function texEuropa() {
  return createCanvasTexture((d, w, h) => {
    for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
      const i = (y * w + x) * 4;
      const nx = x / w * 10, ny = y / h * 5;
      const ice = fbm3D(nx + 20, ny + 30, 0, 5);
      const crack = turbulence3D(nx * 6 + 10, ny * 3 + 40, 2, 4);

      // Smooth white ice with reddish-brown fractures (lineae)
      let r = 225 + ice * 30;
      let g = 235 + ice * 20;
      let b = 245 + ice * 10;

      if (crack > 0.58 && crack < 0.68) {
        // Linear cracked streaks
        r = 175; g = 105; b = 75;
      }
      d[i] = clamp(r); d[i+1] = clamp(g); d[i+2] = clamp(b); d[i+3] = 255;
    }
  });
}

export function texGanymede() {
  return createCanvasTexture((d, w, h) => {
    for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
      const i = (y * w + x) * 4;
      const nx = x / w * 8, ny = y / h * 4;
      const darkTerrain = fbm3D(nx + 5, ny + 5, 0, 5);
      const grooved = turbulence3D(nx * 4, ny * 4, 1, 3);
      let val = 120 + darkTerrain * 80;
      if (grooved > 0.6) val += 40; // Bright grooved terrain
      d[i] = clamp(val); d[i+1] = clamp(val - 5); d[i+2] = clamp(val - 10); d[i+3] = 255;
    }
  });
}

export function texCallisto() {
  return createCanvasTexture((d, w, h) => {
    for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
      const i = (y * w + x) * 4;
      const nx = x / w * 8, ny = y / h * 4;
      const n = fbm3D(nx + 50, ny + 50, 0, 6);
      const crater = fbm3D(nx * 5 + 20, ny * 5 + 20, 2, 4);
      let val = 85 + n * 60; // Very dark ancient cratered crust
      if (crater > 0.72) val += 55; // White ice impact ejecta
      d[i] = clamp(val); d[i+1] = clamp(val); d[i+2] = clamp(val + 5); d[i+3] = 255;
    }
  });
}

export function texTitan() {
  return createCanvasTexture((d, w, h) => {
    for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
      const i = (y * w + x) * 4;
      const nx = x / w * 6, ny = y / h * 3;
      const n = fbm3D(nx + 10, ny + 10, 0, 4);
      const band = Math.sin(ny * 8) * 0.1;
      // Dense smoggy golden-orange nitrogen atmosphere
      const r = clamp(235 + (n + band) * 20);
      const g = clamp(140 + (n + band) * 25);
      const b = clamp(40 + (n + band) * 20);
      d[i] = r; d[i+1] = g; d[i+2] = b; d[i+3] = 255;
    }
  });
}
