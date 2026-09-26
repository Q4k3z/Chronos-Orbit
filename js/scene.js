// ============================================================
//  SCENE, CAMERA, LIGHTS & ELEGANT PINPOINT STARFIELD
// ============================================================
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { fbm3D, turbulence3D, clamp } from './noise.js';
import { isCompactLayout, viewportSize } from './layout.js';
import './mobile-ui.js';

// --- Scene Setup ---
export const scene = new THREE.Scene();
// Deep astronomical cosmic background
scene.background = new THREE.Color(0x060a1c);

const initialViewport = viewportSize();
export const camera = new THREE.PerspectiveCamera(55, initialViewport.width / initialViewport.height, 0.000005, 50000);
camera.position.set(65, 85, 160);

export const renderer = new THREE.WebGLRenderer({ antialias: true, logarithmicDepthBuffer: true, powerPreference: 'high-performance' });
renderer.setSize(initialViewport.width, initialViewport.height);
const renderPixelRatio = (width, height) => Math.min(window.devicePixelRatio || 1, 2,
  isCompactLayout() ? Math.sqrt(3200000 / (width * height)) : 2);
renderer.setPixelRatio(renderPixelRatio(initialViewport.width, initialViewport.height));
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.30;
document.getElementById('container').appendChild(renderer.domElement);

export const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.05;
controls.minDistance = 1.5;
controls.maxDistance = 1500;

// --- Lighting ---
export const sunLight = new THREE.PointLight(0xfff8ee, 3.6, 0, 0);
sunLight.position.set(0, 0, 0);
scene.add(sunLight);

const hemiLight = new THREE.HemisphereLight(0x7095d8, 0x101524, 0.12);
scene.add(hemiLight);

const ambientLight = new THREE.AmbientLight(0x405580, 0.045);
scene.add(ambientLight);

const cameraLight = new THREE.PointLight(0xdde8ff, 0.035, 0, 0.5);
camera.add(cameraLight);
scene.add(camera);

// --- Star Dot Texture (Small soft glowing circular dot) ---
function createCircularStarTexture() {
  const size = 32;
  const canvas = document.createElement('canvas');
  canvas.width = size; canvas.height = size;
  const ctx = canvas.getContext('2d');
  const cx = size / 2, cy = size / 2;

  const g = ctx.createRadialGradient(cx, cy, 0, cx, cy, size / 2);
  g.addColorStop(0, 'rgba(255, 255, 255, 1)');
  g.addColorStop(0.2, 'rgba(245, 250, 255, 0.9)');
  g.addColorStop(0.55, 'rgba(190, 225, 255, 0.3)');
  g.addColorStop(1, 'rgba(0, 0, 0, 0)');

  ctx.fillStyle = g;
  ctx.fillRect(0, 0, size, size);

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

// --- Delicate Pinpoint Glowing Stars ---
export let starMesh = null;
export let skyMesh = null;
export let starfieldMat1 = null;

export function createStarfield() {
  const starTex = createCircularStarTexture();

  // 20,000 tiny glittering pinpoint dots (chấm sáng nhỏ li ti)
  const count = 20000;
  const pos = new Float32Array(count * 3);
  const col = new Float32Array(count * 3);
  const siz = new Float32Array(count);
  const phase = new Float32Array(count);

  // Soft astronomical spectral palette
  const spectralPalette = [
    [0.65, 0.85, 1.00], // Soft Ice Blue
    [0.75, 0.90, 1.00], // Sky Blue
    [1.00, 1.00, 1.00], // Diamond White
    [1.00, 0.98, 0.95], // Pearl White
    [1.00, 0.94, 0.80], // Warm Solar Cream
    [1.00, 0.85, 0.65], // Soft Amber
    [1.00, 0.72, 0.55], // Warm Tangerine
    [1.00, 0.58, 0.55], // Soft Ruby Pink
    [0.85, 0.75, 1.00], // Lavender Violet
    [0.65, 0.95, 0.90], // Turquoise
  ];

  for (let i = 0; i < count; i++) {
    const u = Math.random();
    const v = Math.random();
    const theta = u * 2.0 * Math.PI;
    const phi = Math.acos(2.0 * v - 1.0);
    const r = 14000 + Math.random() * 6000;

    pos[i*3]     = r * Math.sin(phi) * Math.cos(theta);
    pos[i*3 + 1] = r * Math.cos(phi);
    pos[i*3 + 2] = r * Math.sin(phi) * Math.sin(theta);

    const c = spectralPalette[Math.floor(Math.random() * spectralPalette.length)];
    const varFactor = 0.85 + Math.random() * 0.25;
    col[i*3]     = Math.min(1.0, c[0] * varFactor);
    col[i*3 + 1] = Math.min(1.0, c[1] * varFactor);
    col[i*3 + 2] = Math.min(1.0, c[2] * varFactor);

    // Natural distribution: 85% tiny pinpricks, 15% medium glowing dots
    if (Math.random() < 0.85) {
      siz[i] = 1.0 + Math.random() * 1.2; // 1.0 - 2.2px
    } else {
      siz[i] = 2.2 + Math.random() * 1.4; // 2.2 - 3.6px
    }
    phase[i] = Math.random() * Math.PI * 2;
  }

  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  geo.setAttribute('color', new THREE.BufferAttribute(col, 3));
  geo.setAttribute('size', new THREE.BufferAttribute(siz, 1));
  geo.setAttribute('phase', new THREE.BufferAttribute(phase, 1));

  starfieldMat1 = new THREE.ShaderMaterial({
    uniforms: {
      uTexture: { value: starTex },
      uTime: { value: 0.0 }
    },
    vertexShader: `
      attribute float size;
      attribute float phase;
      uniform float uTime;
      varying vec3 vColor;
      varying float vAlpha;
      void main() {
        vColor = color;
        // Subtle natural scintillation
        float twinkle = 0.75 + 0.25 * sin(uTime * 2.0 + phase * 4.0);
        vAlpha = twinkle;
        vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
        // Clean pinpoint dot sizes independent of distance on the celestial sphere
        gl_PointSize = size * twinkle;
        gl_Position = projectionMatrix * mvPosition;
      }
    `,
    fragmentShader: `
      uniform sampler2D uTexture;
      varying vec3 vColor;
      varying float vAlpha;
      void main() {
        vec4 texColor = texture2D(uTexture, gl_PointCoord);
        gl_FragColor = vec4(vColor * 1.3, 1.0) * texColor * vAlpha;
      }
    `,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
    transparent: true,
    vertexColors: true
  });

  starMesh = new THREE.Points(geo, starfieldMat1);
  starMesh.raycast = () => {};
  starMesh.renderOrder = -1;
  scene.add(starMesh);

  // Soft atmospheric deep space nebula backdrop
  createCosmicNebula();
}

// Procedural soft cosmic nebula (smooth, organic, no distracting circular blobs)
function createCosmicNebula() {
  const w = 1024, h = 512;
  const canvas = document.createElement('canvas');
  canvas.width = w; canvas.height = h;
  const ctx = canvas.getContext('2d');
  const img = ctx.createImageData(w, h);
  const d = img.data;

  for (let y = 0; y < h; y++) {
    const v = y / h;
    const phi = (0.5 - v) * Math.PI;
    const cosPhi = Math.cos(phi);
    const sinPhi = Math.sin(phi);

    for (let x = 0; x < w; x++) {
      const u = x / w;
      const theta = u * Math.PI * 2;
      const i = (y * w + x) * 4;

      const px = cosPhi * Math.cos(theta);
      const py = sinPhi;
      const pz = cosPhi * Math.sin(theta);

      // Deep space ambient gradient (smooth, elegant midnight blue)
      const baseLat = 1.0 - Math.abs(sinPhi);
      let r = 8 + baseLat * 7;
      let g = 12 + baseLat * 10;
      let b = 28 + baseLat * 18;

      // Milky Way Galactic Dust Lane (inclined across the sphere)
      const gDist = Math.abs(px * 0.42 + py * 0.78 + pz * 0.46);

      if (gDist < 0.38) {
        const gFactor = Math.pow(1.0 - gDist / 0.38, 1.8);

        // Smooth fractal noise
        const n1 = fbm3D(px * 2.8 + 5.0, py * 2.8 + 2.0, pz * 2.8, 4);
        const n2 = turbulence3D(px * 4.2 + 9.0, py * 4.2, pz * 4.2 + 4.0, 3);
        const cloud = Math.max(0, n1 * 0.65 + n2 * 0.35 - 0.32) * 1.2;

        // Subtle, elegant interstellar colors (gentle violet, sapphire & warm starlight)
        const violet = cloud * gFactor * 65;
        const cyan = Math.max(0, n2 * 0.7 - 0.15) * gFactor * 55;
        const gold = Math.max(0, n1 * 0.8 - 0.4) * gFactor * 45;

        r += violet * 0.85 + gold * 1.0;
        g += violet * 0.30 + cyan * 0.65 + gold * 0.70;
        b += violet * 1.15 + cyan * 1.20 + gold * 0.25;

        // Soft dust absorption lanes
        const dust = fbm3D(px * 5.5, py * 5.5, pz * 5.5, 3);
        if (dust > 0.65 && gDist < 0.15) {
          const absorb = (dust - 0.65) / 0.35 * 0.35;
          r *= (1.0 - absorb);
          g *= (1.0 - absorb);
          b *= (1.0 - absorb);
        }
      }

      d[i]   = clamp(r);
      d[i+1] = clamp(g);
      d[i+2] = clamp(b);
      d[i+3] = 255;
    }
  }

  ctx.putImageData(img, 0, 0);
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;

  const skyGeo = new THREE.SphereGeometry(24000, 64, 32);
  const skyMat = new THREE.MeshBasicMaterial({
    map: tex,
    side: THREE.BackSide,
    depthWrite: false
  });
  skyMesh = new THREE.Mesh(skyGeo, skyMat);
  skyMesh.raycast = () => {};
  skyMesh.renderOrder = -2;
  scene.add(skyMesh);
}


// Keep starry sky & cosmic nebula centered on camera so user never flies outside the celestial sphere
export function updateCelestialBackground(camPos) {
  if (starMesh) starMesh.position.copy(camPos);
  if (skyMesh) skyMesh.position.copy(camPos);
}

// Function to animate star twinkling
export function updateStarfield(time) {
  if (starfieldMat1 && starfieldMat1.uniforms.uTime) {
    starfieldMat1.uniforms.uTime.value = time;
  }
}

// --- Resize and framing for the visible part of a mobile scene ---
export function updateCameraViewport() {
  const { width, height } = viewportSize();
  camera.aspect = width / height;
  if (!isCompactLayout() && document.body.classList.contains('viewing-body') && !document.body.classList.contains('immersive-view')) {
    camera.setViewOffset(width, height, 240, 0, width, height);
  } else {
    camera.clearViewOffset();
  }
  camera.updateProjectionMatrix();
}

export function setupResize() {
  let lastWidth = 0;
  let lastHeight = 0;
  let frame = 0;
  const sync = () => {
    frame = 0;
    const { width, height } = viewportSize();
    if (width === lastWidth && height === lastHeight) return;
    lastWidth = width;
    lastHeight = height;
    updateCameraViewport();
    const nextRatio = renderPixelRatio(width, height);
    if (Math.abs(renderer.getPixelRatio() - nextRatio) > 0.02) renderer.setPixelRatio(nextRatio);
    renderer.setSize(width, height);
    window.dispatchEvent(new Event('chronos:viewport-resized'));
  };
  const schedule = () => { if (!frame) frame = requestAnimationFrame(sync); };
  window.addEventListener('resize', schedule);
  window.addEventListener('chronos:layout-changed', schedule);
  window.addEventListener('orientationchange', schedule);
  window.visualViewport?.addEventListener('resize', schedule);
  if (window.ResizeObserver) new ResizeObserver(schedule).observe(document.getElementById('container'));
  schedule();
}
