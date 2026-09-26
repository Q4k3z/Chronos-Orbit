// NASA imagery is kept local. Small maps load on startup; detailed maps and
// spacecraft geometry are requested only when the camera approaches them.
import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { DRACOLoader } from 'three/addons/loaders/DRACOLoader.js';
import { texMoon, texEarthNight } from './textures.js';

const surfaceFiles = {
  mercury: 'mercury',
  venus: 'venus',
  earth: 'earth',
  moon: 'moon',
  mars: 'mars',
  jupiter: 'jupiter',
};

const textureLoader = new THREE.TextureLoader();
const gltfLoader = new GLTFLoader();
const dracoLoader = new DRACOLoader();
dracoLoader.setDecoderPath('assets/draco/');
gltfLoader.setDRACOLoader(dracoLoader);
const texturePromises = new Map();
const modelPromises = new Map();
const bodyEntries = [];
const craftEntries = [];
const worldPosition = new THREE.Vector3();
let lastCheck = 0;

function loadTexture(file, colorSpace = THREE.SRGBColorSpace) {
  if (!texturePromises.has(file)) {
    const promise = new Promise(resolve => {
      textureLoader.load(`assets/textures/${file}`, texture => {
        texture.colorSpace = colorSpace;
        texture.anisotropy = 4;
        resolve(texture);
      }, undefined, error => {
        console.warn(`Không tải được ảnh ${file}:`, error);
        resolve(null);
      });
    });
    texturePromises.set(file, promise);
  }
  return texturePromises.get(file);
}

function applySurface(entry) {
  const texture = (entry.wantsDetail && entry.detail) || entry.overview;
  if (!texture || entry.mesh.material.map === texture) return;
  const material = entry.mesh.material;
  material.map = texture;
  material.color.set(0xffffff);

  // The old procedural height and roughness maps have unrelated geography.
  if (entry.id === 'mercury' || entry.id === 'earth' || entry.id === 'mars') {
    material.bumpMap?.dispose();
    material.displacementMap = null;
    material.bumpMap = null;
  }
  if (entry.id === 'earth') {
    material.roughnessMap?.dispose();
    material.roughnessMap = null;
    material.roughness = 0.82;
    material.metalness = 0;
  }
  material.needsUpdate = true;
  if (entry.original) {
    entry.original.dispose();
    entry.original = null;
  }
}

function registerBody(mesh, id) {
  if (!mesh || !surfaceFiles[id]) return;
  const entry = {
    mesh, id, original: mesh.material.map,
    overview: null, detail: null, wantsDetail: false, detailRequested: false,
  };
  bodyEntries.push(entry);
  loadTexture(`${id}-overview.webp`).then(texture => {
    entry.overview = texture || (id === 'moon' ? texMoon() : mesh.userData.data.texFn());
    applySurface(entry);
  });
}

function registerCraft(group, kind) {
  if (!group) return;
  craftEntries.push({ group, kind, fallback: [...group.children], detail: null, requested: false });
}

function loadModel(kind) {
  if (!modelPromises.has(kind)) {
    const promise = new Promise(resolve => {
      gltfLoader.load(`assets/models/${kind}.glb`, gltf => resolve(gltf.scene), undefined, error => {
        console.warn(`Không tải được mô hình ${kind}:`, error);
        resolve(null);
      });
    });
    modelPromises.set(kind, promise);
  }
  return modelPromises.get(kind);
}

function fittedModel(source, kind) {
  const model = source.clone(true);
  const box = new THREE.Box3().setFromObject(model);
  const center = box.getCenter(new THREE.Vector3());
  const size = box.getSize(new THREE.Vector3());
  const extent = Math.max(size.x, size.y, size.z);
  if (!Number.isFinite(extent) || extent <= 0) return null;
  const wrapper = new THREE.Group();
  model.position.sub(center);
  wrapper.scale.setScalar((kind === 'iss' ? 3.1 : 2.9) / extent);
  wrapper.add(model);
  wrapper.visible = false;
  return wrapper;
}

function useCraftDetail(entry, visible) {
  if (!entry.detail) return;
  entry.detail.visible = visible;
  entry.fallback.forEach(child => { child.visible = !visible; });
}

export function initializeVisualAssets(planetMeshes, moonMesh, earthNightMesh, spacecraft) {
  for (const mesh of planetMeshes) registerBody(mesh, mesh.userData.id);
  registerBody(moonMesh, 'moon');
  for (const [group, kind] of spacecraft) registerCraft(group, kind);

  if (earthNightMesh) {
    loadTexture('earth-night.webp').then(texture => {
      if (!texture) texture = texEarthNight();
      const old = earthNightMesh.material.uniforms.uMap.value;
      earthNightMesh.material.uniforms.uMap.value = texture;
      old.dispose();
    });
  }
}

export function updateVisualAssets(camera, selectedObject = null) {
  const now = performance.now();
  if (now - lastCheck < 200) return;
  lastCheck = now;

  for (const entry of bodyEntries) {
    entry.mesh.getWorldPosition(worldPosition);
    const scale = entry.mesh.getWorldScale(new THREE.Vector3());
    const radius = entry.mesh.geometry.parameters.radius * Math.max(scale.x, scale.y, scale.z);
    const distance = camera.position.distanceTo(worldPosition);
    entry.wantsDetail = distance < radius * 7.5 ||
      (selectedObject === entry.mesh && distance < radius * 13);
    if (entry.wantsDetail && !entry.detailRequested) {
      entry.detailRequested = true;
      loadTexture(`${entry.id}-detail.webp`).then(texture => {
        entry.detail = texture;
        applySurface(entry);
      });
      if (entry.id === 'moon') {
        loadTexture('moon-height.jpg', THREE.NoColorSpace).then(height => {
          if (!height) return;
          const material = entry.mesh.material;
          material.bumpMap = height;
          const baseRadius = entry.mesh.geometry.parameters.radius;
          material.bumpScale = entry.mesh.userData.radius * 0.018;
          material.displacementMap = height;
          material.displacementScale = baseRadius * 0.01;
          material.displacementBias = -baseRadius * 0.005;
          material.needsUpdate = true;
        });
      }
    }
    applySurface(entry);
  }

  for (const entry of craftEntries) {
    entry.group.getWorldPosition(worldPosition);
    const radius = entry.group.userData.radius || 1;
    const close = camera.position.distanceTo(worldPosition) < Math.max(radius * 14, 0.5);
    if (close && !entry.requested) {
      entry.requested = true;
      loadModel(entry.kind).then(source => {
        if (!source) return;
        entry.detail = fittedModel(source, entry.kind);
        if (!entry.detail) return;
        entry.group.add(entry.detail);
        entry.group.getWorldPosition(worldPosition);
        useCraftDetail(entry, camera.position.distanceTo(worldPosition) < Math.max(entry.group.userData.radius * 14, 0.5));
      });
    }
    useCraftDetail(entry, close);
  }
}
