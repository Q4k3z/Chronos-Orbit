// ============================================================
//  PLANETS, MOONS, SPACECRAFT, DAY-NIGHT & DUAL SCALE SYSTEM
// ============================================================
import * as THREE from 'three';
import { scene, controls } from './scene.js';
import {
  texEarthClouds,
  texSaturnRings,
  texIo,
  texEuropa,
  texGanymede,
  texCallisto,
  texTitan
} from './textures.js';
import {
  PLANETS,
  SUN_DATA,
  MOON_DATA,
  ASTEROID_BELT_DATA,
  JUPITER_MOONS,
  TITAN_DATA,
  SPACECRAFT_DATA,
  SCALE_MODES,
  VISUAL_DISTANCES,
  VISUAL_RADII,
  AU_SCALE,
  COMETS,
  CORE_STRUCTURES,
  SCALE_COMPARISON_DATA
} from './config.js';
import { sunCutawayGroup } from './sun.js';
import { sunMesh } from './sun.js';
import { getPlanetOrbitPointAU, getHalleyOrbitPointAU } from './ephemeris.js';
import { getHalleyVisualPosition } from './halley-visual.js';
import { bodyName } from './i18n.js';
import {
  AU_KM, SUN_RADIUS_KM, PLANET_RADIUS_KM,
  JUPITER_MOON_RADIUS_KM, kmToSceneUnits
} from './physical-scale.js';

// Current scale mode: 'visual' (default for comfortable viewing) or 'true' (100% true AU linear scale)
export let currentScaleMode = SCALE_MODES.VISUAL;
export { AU_KM };
export const EARTH_RADIUS_KM = PLANET_RADIUS_KM.earth;
const physicalRadius = km => kmToSceneUnits(km, AU_SCALE);
export let showOrbits = true;
export let showHalley = true;
let immersiveView = false;
export function setImmersiveView(value) {
  immersiveView = Boolean(value);
  updateOrbitVisibility();
}
export function setHalleyVisibility(value) {
  showHalley = Boolean(value);
  updateOrbitVisibility();
}
export const satelliteVisibility = {
  moon: true, io: true, europa: true, ganymede: true,
  callisto: true, titan: true, iss: true, voyager1: true, voyager2: true
};
const OBSERVED_SURFACES = new Set(['mercury', 'venus', 'earth', 'mars', 'jupiter']);

// --- Keplerian 3D Position Calculation ---
export function calculateOrbitPoint(a, e, incDeg, wDeg, theta) {
  const incRad = (incDeg * Math.PI) / 180;
  const wRad = (wDeg * Math.PI) / 180;
  
  // Kepler polar equation with primary focus at origin (Sun)
  const r = (a * (1 - e * e)) / (1 + e * Math.cos(theta - wRad));
  
  // Point in orbital plane
  const xPrime = r * Math.cos(theta);
  const zPrime = r * Math.sin(theta);
  
  // Rotate by inclination around X-axis
  const x = xPrime;
  const y = zPrime * Math.sin(incRad);
  const z = zPrime * Math.cos(incRad);
  
  return new THREE.Vector3(x, y, z);
}

// Distance helper based on active scale mode
export function getPlanetDistance(p, mode = currentScaleMode) {
  if (mode === SCALE_MODES.VISUAL) {
    return VISUAL_DISTANCES[p.id] || (p.a * 35);
  }
  return p.a * AU_SCALE;
}

export function getPlanetRadius(p, mode = currentScaleMode) {
  if (mode === SCALE_MODES.VISUAL) {
    return VISUAL_RADII[p.id] || p.radius;
  }
  return physicalRadius(PLANET_RADIUS_KM[p.id]);
}

export function getSunRadius(mode = currentScaleMode) {
  return mode === SCALE_MODES.VISUAL ? SUN_DATA.radius : physicalRadius(SUN_RADIUS_KM);
}

// --- Atmosphere Fresnel Shader ---
const atmosphereVertexShader = `
  #include <common>
  #include <logdepthbuf_pars_vertex>
  varying vec3 vNormal;
  varying vec3 vViewPos;
  varying float vSunFacing;
  void main() {
    vNormal = normalize(normalMatrix * normal);
    vec3 worldPosition = (modelMatrix * vec4(position, 1.0)).xyz;
    vSunFacing = dot(normalize(-worldPosition), normalize(mat3(modelMatrix) * normal));
    vec4 mvPos = modelViewMatrix * vec4(position, 1.0);
    vViewPos = mvPos.xyz;
    gl_Position = projectionMatrix * mvPos;
    #include <logdepthbuf_vertex>
  }
`;

const atmosphereFragmentShader = `
  #include <logdepthbuf_pars_fragment>
  uniform vec3 uColor;
  uniform float uIntensity;
  uniform float uPower;
  varying vec3 vNormal;
  varying vec3 vViewPos;
  varying float vSunFacing;
  void main() {
    #include <logdepthbuf_fragment>
    vec3 viewDir = normalize(-vViewPos);
    // Back-facing shell normals must not produce a Fresnel value above one.
    float rim = clamp(1.0 - abs(dot(viewDir, normalize(vNormal))), 0.0, 1.0);
    float fresnel = pow(rim, uPower) * uIntensity;
    float daylight = 0.04 + 0.96 * smoothstep(-0.15, 0.45, vSunFacing);
    gl_FragColor = vec4(uColor, clamp(fresnel * daylight, 0.0, 0.75));
    #include <tonemapping_fragment>
    #include <colorspace_fragment>
  }
`;

export function createAtmosphereMesh(radius, color, intensity = 1.2, power = 2.5) {
  const geo = new THREE.SphereGeometry(radius, 64, 32);
  const mat = new THREE.ShaderMaterial({
    vertexShader: atmosphereVertexShader,
    fragmentShader: atmosphereFragmentShader,
    uniforms: {
      uColor: { value: new THREE.Color(color) },
      uIntensity: { value: intensity },
      uPower: { value: power },
    },
    side: THREE.BackSide,
    transparent: true,
    depthWrite: false,
  });
  const mesh = new THREE.Mesh(geo, mat);
  mesh.raycast = () => {};
  return mesh;
}

// --- Orbits & Highlights ---
export const orbitMap = new Map();
export const orbitPaths = [];

export function updateOrbitVisibility() {
  orbitPaths.forEach(line => {
    line.visible = showOrbits && !immersiveView && !isScaleComparisonActive
      && (line.userData.orbitId !== 'halley' || showHalley)
      && (!line.userData.trueScaleOnly || currentScaleMode === SCALE_MODES.TRUE);
  });
  updateSatelliteVisibility();
}

export function setShowOrbits(value) {
  showOrbits = value;
  updateOrbitVisibility();
}

export function setSatelliteVisibility(id, visible) {
  if (!Object.hasOwn(satelliteVisibility, id)) return;
  satelliteVisibility[id] = Boolean(visible);
  updateSatelliteVisibility();
}

function updateSatelliteVisibility() {
  const normalView = !isScaleComparisonActive;
  const orbitVisible = showOrbits && !immersiveView;
  if (halleyHolder) halleyHolder.visible = normalView && showHalley;
  if (moonOrbitGroup) moonOrbitGroup.visible = normalView && satelliteVisibility.moon;
  if (moonOrbitLine) moonOrbitLine.visible = normalView && orbitVisible && satelliteVisibility.moon;
  if (issOrbitGroup) issOrbitGroup.visible = normalView && satelliteVisibility.iss;
  if (voyager1Group) voyager1Group.visible = normalView && satelliteVisibility.voyager1;
  if (voyager2Group) voyager2Group.visible = normalView && satelliteVisibility.voyager2;
  voyagerTrajectoryLines.forEach(({ line, target }) => {
    line.visible = normalView && orbitVisible && satelliteVisibility[target.userData.id];
  });
  if (jupiterMoonsGroup) jupiterMoonsGroup.visible = normalView;
  jupiterMoonsMeshes.forEach((mesh, index) => {
    const visible = normalView && satelliteVisibility[mesh.userData.id];
    if (mesh.userData.orbitGroup) mesh.userData.orbitGroup.visible = visible;
    if (jupiterMoonOrbitLines[index]) jupiterMoonOrbitLines[index].visible = visible && orbitVisible;
    if (jupiterMoonShadows[index]) {
      jupiterMoonShadows[index].visible = visible && currentScaleMode === SCALE_MODES.VISUAL;
    }
  });
  if (titanOrbitGroup) titanOrbitGroup.visible = normalView && satelliteVisibility.titan;
  if (solarEclipseSpot) {
    solarEclipseSpot.visible = normalView && satelliteVisibility.moon && currentScaleMode === SCALE_MODES.VISUAL;
  }
}

export function createEllipticalOrbitPath(id, a, e, incDeg, wDeg, color = 0x38bdf8, baseOpacity = 0.70) {
  const segments = 360;
  const points = [];
  const planet = PLANETS.find(p => p.id === id);
  const sourceAxis = planet ? planet.a : COMETS[0].a;
  for (let i = 0; i <= segments; i++) {
    const theta = (i / segments) * Math.PI * 2;
    const auPoint = planet ? getPlanetOrbitPointAU(id, theta) : id === 'halley' ? getHalleyOrbitPointAU(theta) : null;
    if (!auPoint) {
      points.push(calculateOrbitPoint(a, e, incDeg, wDeg, theta));
    } else if (id === 'halley' && currentScaleMode === SCALE_MODES.VISUAL) {
      points.push(new THREE.Vector3(...getHalleyVisualPosition(auPoint)));
    } else {
      points.push(new THREE.Vector3(...auPoint).multiplyScalar(a / sourceAxis));
    }
  }
  const geo = new THREE.BufferGeometry().setFromPoints(points);
  const mat = new THREE.LineBasicMaterial({
    color: color,
    transparent: true,
    opacity: baseOpacity,
  });
  const line = new THREE.Line(geo, mat);
  line.userData.orbitId = id;
  line.raycast = () => {};
  scene.add(line);
  orbitPaths.push(line);
  orbitMap.set(id, { line, geo, defaultOpacity: baseOpacity, defaultColor: color, a, e, incDeg, wDeg });
  updateOrbitVisibility();
  return line;
}

export function createDistanceGuides() {
  const auGuides = [1.0, 5.2, 9.58, 19.2, 30.0];
  auGuides.forEach(au => {
    const radius = au * AU_SCALE;
    const segments = 180;
    const points = [];
    for (let i = 0; i <= segments; i++) {
      const theta = (i / segments) * Math.PI * 2;
      points.push(new THREE.Vector3(Math.cos(theta) * radius, 0, Math.sin(theta) * radius));
    }
    const geo = new THREE.BufferGeometry().setFromPoints(points);
    const mat = new THREE.LineDashedMaterial({
      color: 0x475569, transparent: true, opacity: 0.15,
      dashSize: 4, gapSize: 4,
    });
    const line = new THREE.Line(geo, mat);
    line.userData.trueScaleOnly = true;
    line.computeLineDistances();
    line.raycast = () => {};
    scene.add(line);
    orbitPaths.push(line);
  });
  updateOrbitVisibility();
}

export function highlightOrbit(id, active = true) {
  const entry = orbitMap.get(id);
  if (!entry) return;
  if (active) {
    entry.line.material.opacity = 0.95;
    entry.line.material.color.setHex(0xffffff);
  } else {
    entry.line.material.opacity = entry.defaultOpacity;
    entry.line.material.color.setHex(entry.defaultColor);
  }
}

// --- Asteroid Belt ---
export let asteroidBeltMesh;
const asteroidCount = 2600;
const asteroidSeeds = Array.from({ length: asteroidCount }, () => ({
  radius: (Math.random() + Math.random()) / 2, theta: Math.random() * Math.PI * 2,
  height: (Math.random() + Math.random() - 1) * 0.5,
  size: 0.22 + Math.pow(Math.random(), 4) * 2.1,
  stretch: [0.55 + Math.random() * 0.9, 0.55 + Math.random() * 0.9, 0.55 + Math.random() * 0.9],
  rotation: [Math.random() * Math.PI, Math.random() * Math.PI, Math.random() * Math.PI]
}));

export function createAsteroidBelt() {
  asteroidBeltMesh = new THREE.Group();
  // Four shared jagged rock shapes retain low draw-call cost on phones.
  const palette = [0x81776c, 0x575c62, 0x9c8974, 0x6d6660];
  for (let variant = 0; variant < 4; variant++) {
    const geometry = new THREE.IcosahedronGeometry(0.32, 1);
    const positions = geometry.attributes.position;
    for (let vertex = 0; vertex < positions.count; vertex++) {
      const x = positions.getX(vertex), y = positions.getY(vertex), z = positions.getZ(vertex);
      // Coordinate-based deformation keeps duplicate triangle vertices joined.
      const relief = 0.84 + 0.17 * Math.sin(x * 19 + y * 23 + variant * 2.7)
        + 0.12 * Math.cos(z * 31 - x * 17 + variant);
      positions.setXYZ(vertex, x * relief, y * relief, z * relief);
    }
    geometry.computeVertexNormals();
    const material = new THREE.MeshStandardMaterial({
      color: 0xffffff, roughness: 1, metalness: 0, flatShading: true,
    });
    const rocks = new THREE.InstancedMesh(geometry, material, asteroidCount / 4);
    rocks.raycast = () => {};
    for (let index = 0; index < rocks.count; index++) {
      const color = new THREE.Color(palette[(index + variant) % palette.length]);
      color.multiplyScalar(0.72 + Math.random() * 0.4);
      rocks.setColorAt(index, color);
    }
    asteroidBeltMesh.add(rocks);
  }
  asteroidBeltMesh.userData = {
    isTarget: true,
    type: 'asteroid-belt',
    id: 'asteroid-belt',
    nameVi: ASTEROID_BELT_DATA.nameVi,
    nameEn: ASTEROID_BELT_DATA.nameEn,
    icon: ASTEROID_BELT_DATA.icon,
    data: ASTEROID_BELT_DATA
  };
  asteroidBeltMesh.raycast = () => {};

  updateAsteroidBeltPositions(currentScaleMode);
  scene.add(asteroidBeltMesh);

  // Inner and outer boundaries
  const innerA = currentScaleMode === SCALE_MODES.VISUAL ? 100.0 : (ASTEROID_BELT_DATA.minAU * AU_SCALE);
  const outerA = currentScaleMode === SCALE_MODES.VISUAL ? 122.0 : (ASTEROID_BELT_DATA.maxAU * AU_SCALE);
  createEllipticalOrbitPath('asteroid-belt-inner', innerA, 0.04, 1.5, 0, 0x818cf8, 0.25);
  createEllipticalOrbitPath('asteroid-belt-outer', outerA, 0.06, 1.8, 0, 0x818cf8, 0.25);
}

export function updateAsteroidBeltPositions(mode) {
  if (!asteroidBeltMesh) return;
  const dummy = new THREE.Object3D();
  const minRadius = mode === SCALE_MODES.VISUAL ? 100.0 : (ASTEROID_BELT_DATA.minAU * AU_SCALE);
  const maxRadius = mode === SCALE_MODES.VISUAL ? 122.0 : (ASTEROID_BELT_DATA.maxAU * AU_SCALE);
  const ySpread = mode === SCALE_MODES.VISUAL ? 6.0 : 12.0;

  for (let i = 0; i < asteroidCount; i++) {
    const seed = asteroidSeeds[i];
    // Sparse lanes and a soft vertical profile avoid a uniform necklace of balls.
    let radial = seed.radius;
    if (radial > 0.34 && radial < 0.38) radial += 0.045;
    if (radial > 0.65 && radial < 0.68) radial += 0.035;
    const radius = minRadius + radial * (maxRadius - minRadius);
    const theta = seed.theta;
    const y = seed.height * ySpread;

    dummy.position.set(
      Math.cos(theta) * radius,
      y,
      Math.sin(theta) * radius
    );

    const s = seed.size * (mode === SCALE_MODES.TRUE ? 0.001 : 1);
    dummy.scale.set(...seed.stretch.map(stretch => s * stretch));

    dummy.rotation.set(
      ...seed.rotation
    );

    dummy.updateMatrix();
    asteroidBeltMesh.children[i % 4].setMatrixAt(Math.floor(i / 4), dummy.matrix);
  }
  asteroidBeltMesh.children.forEach(rocks => {
    rocks.instanceMatrix.needsUpdate = true;
    rocks.computeBoundingSphere();
  });
}

// --- Spacecraft Models (Voyager 1, Voyager 2, ISS) ---
export const spacecraftMeshes = [];

function createVoyagerModel(data) {
  const group = new THREE.Group();

  // 1. High-Gain Parabolic Antenna Dish (White)
  const dishGeo = new THREE.CylinderGeometry(0.9, 0.15, 0.28, 24, 1, true);
  const dishMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.25, side: THREE.DoubleSide });
  const dish = new THREE.Mesh(dishGeo, dishMat);
  dish.rotation.x = Math.PI / 2;
  group.add(dish);

  // Subreflector & feed horn
  const feedGeo = new THREE.CylinderGeometry(0.04, 0.04, 0.55, 8);
  const feedMat = new THREE.MeshStandardMaterial({ color: 0xe2e8f0, metalness: 0.8 });
  const feed = new THREE.Mesh(feedGeo, feedMat);
  feed.position.z = 0.35;
  feed.rotation.x = Math.PI / 2;
  group.add(feed);

  // 2. 10-sided main electronics bus
  const busGeo = new THREE.CylinderGeometry(0.4, 0.4, 0.35, 10);
  const busMat = new THREE.MeshStandardMaterial({ color: 0x94a3b8, metalness: 0.7, roughness: 0.3 });
  const bus = new THREE.Mesh(busGeo, busMat);
  bus.position.z = -0.22;
  bus.rotation.x = Math.PI / 2;
  group.add(bus);

  // 3. RTG Nuclear Power Boom (Amber gold)
  const boomGeo = new THREE.CylinderGeometry(0.035, 0.035, 1.4, 8);
  const boomMat = new THREE.MeshStandardMaterial({ color: 0xd97706, metalness: 0.8, roughness: 0.2 });
  const boom = new THREE.Mesh(boomGeo, boomMat);
  boom.position.set(0.7, -0.25, -0.2);
  boom.rotation.z = Math.PI / 3;
  group.add(boom);

  // 4. Magnetometer Boom
  const magBoom = new THREE.Mesh(boomGeo, boomMat);
  magBoom.position.set(-0.7, 0.25, -0.2);
  magBoom.rotation.z = -Math.PI / 3;
  group.add(magBoom);

  group.userData = {
    isTarget: true,
    type: 'spacecraft',
    id: data.id,
    nameVi: data.nameVi,
    nameEn: data.nameEn,
    icon: data.icon,
    radius: 1.5,
    data: data
  };

  return group;
}

function createISSModel(data) {
  const group = new THREE.Group();

  // Central pressurized modules
  const modGeo = new THREE.CylinderGeometry(0.1, 0.1, 1.0, 12);
  const modMat = new THREE.MeshStandardMaterial({ color: 0xf8fafc, metalness: 0.7, roughness: 0.3 });
  const mod = new THREE.Mesh(modGeo, modMat);
  mod.rotation.z = Math.PI / 2;
  group.add(mod);

  // Integrated Truss Structure
  const trussGeo = new THREE.CylinderGeometry(0.04, 0.04, 2.0, 8);
  const trussMat = new THREE.MeshStandardMaterial({ color: 0x64748b, metalness: 0.8 });
  const truss = new THREE.Mesh(trussGeo, trussMat);
  group.add(truss);

  // Solar Array Panels (blue-gold photovoltaic cells)
  const panelGeo = new THREE.BoxGeometry(0.45, 0.015, 0.2);
  const panelMat = new THREE.MeshStandardMaterial({ color: 0x1e3a8a, metalness: 0.9, roughness: 0.2 });

  [-0.8, -0.5, 0.5, 0.8].forEach(yPos => {
    const p1 = new THREE.Mesh(panelGeo, panelMat);
    p1.position.set(0.35, yPos, 0);
    group.add(p1);
    const p2 = new THREE.Mesh(panelGeo, panelMat);
    p2.position.set(-0.35, yPos, 0);
    group.add(p2);
  });

  group.scale.set(0.6, 0.6, 0.6);
  group.userData = {
    isTarget: true,
    type: 'spacecraft',
    id: 'iss',
    nameVi: data.nameVi,
    nameEn: data.nameEn,
    icon: data.icon,
    radius: 0.6,
    data: data
  };

  return group;
}

// --- Planet, Moon & Spacecraft Meshes Registry ---
export const planetMeshes = [];
export const planetHolders = [];
export const labelElements = [];
export const clickableTargets = [];
export const satelliteObjects = [];

export let earthMeshRef = null;
export let earthNightMesh = null;
export let earthCloudsMesh = null;
export let moonMeshRef = null;
export let moonOrbitGroup = null;
let moonOrbitLine = null;
export let issMeshRef = null;
export let issOrbitGroup = null;

// Jupiter Galilean moons
export const jupiterMoonsMeshes = [];
const jupiterMoonOrbitLines = [];
export let jupiterMoonsGroup = null;

// Saturn Titan
export let titanMeshRef = null;
export let titanOrbitGroup = null;

// Voyager probes
export let voyager1Group = null;
export let voyager2Group = null;
const voyagerTrajectoryLines = [];

// Dual Clouds & Venus Clouds
export let earthCloudShadowMesh = null;
export let venusCloudsMesh = null;

// Shadows & Eclipse Spots
export let saturnGlobeRingShadow = null;
export let solarEclipseSpot = null;
export const jupiterMoonShadows = [];

// Interior Cutaways
export const cutawayGroups = {};
export let isCutawayActive = false;

// Scale Comparison Mode
export let isScaleComparisonActive = false;

// Halley's Comet
export let halleyHolder = null;
export let halleyMeshRef = null;
export let halleyIonTail = null;
export let halleyDustTail = null;
export let saturnRingShadowRef = null;

// --- Build All Celestial Objects ---
export function buildPlanets() {
  if (sunMesh) {
    clickableTargets.push(sunMesh);
  }

  const labelsContainer = document.getElementById('labels-container');

  PLANETS.forEach((p, idx) => {
    const aCurrent = getPlanetDistance(p, currentScaleMode);
    createEllipticalOrbitPath(p.id, aCurrent, p.e, p.inc, p.w, p.orbitColor, 0.70);

    // Holder manages 3D Keplerian position
    const holder = new THREE.Group();
    scene.add(holder);

    const radCurrent = getPlanetRadius(p, currentScaleMode);
    const geo = new THREE.SphereGeometry(radCurrent, 256, 128);
    const hasObservedMap = OBSERVED_SURFACES.has(p.id);
    const tex = hasObservedMap ? null : p.texFn();
    const mat = new THREE.MeshStandardMaterial({
      map: tex,
      color: hasObservedMap ? p.color : 0xffffff,
      roughness: p.id === 'earth' ? 0.82 : 0.65,
      metalness: hasObservedMap ? 0 : 0.1,
    });

    if (p.bumpFn && !hasObservedMap) {
      const bumpTex = p.bumpFn();
      mat.bumpMap = bumpTex;
      mat.bumpScale = 0.05;
      mat.displacementMap = bumpTex;
      mat.displacementScale = radCurrent * 0.04;
      mat.displacementBias = -radCurrent * 0.02;
    }

    const mesh = new THREE.Mesh(geo, mat);
    mesh.rotation.z = p.tilt;
    if (p.oblate) {
      mesh.scale.set(1.0, p.oblate, 1.0);
    }

    mesh.userData = {
      isTarget: true,
      type: 'planet',
      id: p.id,
      nameVi: p.nameVi,
      nameEn: p.nameEn,
      icon: p.icon,
      planetIndex: idx,
      radius: radCurrent,
      baseRadius: p.radius,
      data: p
    };
    holder.add(mesh);
    planetMeshes.push(mesh);
    planetHolders.push(holder);
    clickableTargets.push(mesh);

    if (p.atmosphere) {
      const atmo = createAtmosphereMesh(
        radCurrent * p.atmosphere.scale,
        p.atmosphere.color,
        p.atmosphere.intensity,
        p.atmosphere.power
      );
      mesh.add(atmo);
    }

    // --- VENUS: Outer Sulfuric Acid Cloud Vortex ---
    if (p.id === 'venus') {
      const vCloudGeo = new THREE.SphereGeometry(radCurrent * 1.018, 64, 32);
      const vCloudMat = new THREE.MeshStandardMaterial({
        map: p.texFn(), transparent: true, opacity: 0.45, depthWrite: false, roughness: 0.7
      });
      venusCloudsMesh = new THREE.Mesh(vCloudGeo, vCloudMat);
      venusCloudsMesh.raycast = () => {};
      mesh.add(venusCloudsMesh);
    }

    if (p.id === 'mars') {
      buildPlanetCutaway('mars', radCurrent, mesh);
    }

    // --- EARTH: Atmosphere, Clouds, Night Lights, Moon & ISS ---
    if (p.id === 'earth') {
      earthMeshRef = mesh;

      // Earth Night Lights Glow Shell (City Lights facing away from Sun)
      const nightGeo = new THREE.SphereGeometry(radCurrent * 1.002, 128, 64);
      const nightTex = new THREE.DataTexture(new Uint8Array([0, 0, 0, 0]), 1, 1, THREE.RGBAFormat);
      nightTex.colorSpace = THREE.SRGBColorSpace;
      nightTex.needsUpdate = true;
      const nightMat = new THREE.ShaderMaterial({
        uniforms: { uMap: { value: nightTex } },
        vertexShader: `
          #include <common>
          #include <logdepthbuf_pars_vertex>
          varying vec2 vUv;
          varying vec3 vWorldPosition;
          varying vec3 vWorldNormal;
          void main() {
            vUv = uv;
            vWorldPosition = (modelMatrix * vec4(position, 1.0)).xyz;
            vWorldNormal = normalize(mat3(modelMatrix) * normal);
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
            #include <logdepthbuf_vertex>
          }
        `,
        fragmentShader: `
          #include <logdepthbuf_pars_fragment>
          uniform sampler2D uMap;
          varying vec2 vUv;
          varying vec3 vWorldPosition;
          varying vec3 vWorldNormal;
          void main() {
            #include <logdepthbuf_fragment>
            float night = 1.0 - smoothstep(-0.18, 0.05,
              dot(normalize(-vWorldPosition), normalize(vWorldNormal)));
            vec4 lights = texture2D(uMap, vUv);
            gl_FragColor = vec4(lights.rgb * night, lights.a * night * 0.9);
            #include <tonemapping_fragment>
            #include <colorspace_fragment>
          }
        `,
        transparent: true,
        blending: THREE.AdditiveBlending,
        depthWrite: false
      });
      earthNightMesh = new THREE.Mesh(nightGeo, nightMat);
      earthNightMesh.raycast = () => {};
      mesh.add(earthNightMesh);

      // Dual-layer Clouds & Cloud Shadow
      const cloudTex = texEarthClouds();
      const shadowGeo = new THREE.SphereGeometry(radCurrent * 1.0025, 64, 32);
      const shadowMat = new THREE.MeshBasicMaterial({
        map: cloudTex, color: 0x0a1020, transparent: true, opacity: 0.12, depthWrite: false
      });
      earthCloudShadowMesh = new THREE.Mesh(shadowGeo, shadowMat);
      earthCloudShadowMesh.rotation.y = -0.02;
      earthCloudShadowMesh.raycast = () => {};
      mesh.add(earthCloudShadowMesh);

      const cloudGeo = new THREE.SphereGeometry(radCurrent * 1.008, 128, 64);
      const cloudMat = new THREE.MeshStandardMaterial({
        map: cloudTex, transparent: true, opacity: 0.9, blending: THREE.NormalBlending,
        depthWrite: false, roughness: 1, metalness: 0, alphaTest: 0.015
      });
      earthCloudsMesh = new THREE.Mesh(cloudGeo, cloudMat);
      earthCloudsMesh.raycast = () => {};
      mesh.add(earthCloudsMesh);

      // Solar Eclipse Umbra/Penumbra Shadow Decal on Earth
      const eclipseCanvas = document.createElement('canvas');
      eclipseCanvas.width = eclipseCanvas.height = 64;
      const eCtx = eclipseCanvas.getContext('2d');
      const eg = eCtx.createRadialGradient(32, 32, 0, 32, 32, 32);
      eg.addColorStop(0, 'rgba(0, 0, 0, 0.95)');
      eg.addColorStop(0.35, 'rgba(0, 0, 0, 0.65)');
      eg.addColorStop(0.7, 'rgba(0, 0, 0, 0.25)');
      eg.addColorStop(1, 'rgba(0, 0, 0, 0)');
      eCtx.fillStyle = eg;
      eCtx.fillRect(0, 0, 64, 64);
      const eclipseTex = new THREE.CanvasTexture(eclipseCanvas);

      const eclipseGeo = new THREE.SphereGeometry(radCurrent * 1.004, 32, 16, 0, Math.PI * 0.12, 0, Math.PI * 0.12);
      const eclipseMat = new THREE.MeshBasicMaterial({
        map: eclipseTex, transparent: true, opacity: 0.85, depthWrite: false, side: THREE.DoubleSide
      });
      solarEclipseSpot = new THREE.Mesh(eclipseGeo, eclipseMat);
      solarEclipseSpot.raycast = () => {};
      holder.add(solarEclipseSpot);
      satelliteObjects.push(solarEclipseSpot);

      // Interior Cutaway for Earth
      buildPlanetCutaway('earth', radCurrent, mesh);

      // Moon
      moonOrbitGroup = new THREE.Group();
      holder.add(moonOrbitGroup);
      satelliteObjects.push(moonOrbitGroup);

      const moonRadius = currentScaleMode === SCALE_MODES.VISUAL ? VISUAL_RADII.moon : MOON_DATA.radius;
      const moonGeo = new THREE.SphereGeometry(moonRadius, 128, 64);
      const moonMat = new THREE.MeshStandardMaterial({
        color: 0xb8b6b0, roughness: 0.96, metalness: 0
      });
      moonMeshRef = new THREE.Mesh(moonGeo, moonMat);
      const moonDist = currentScaleMode === SCALE_MODES.VISUAL ? 5.2 : MOON_DATA.orbitRadius;
      moonMeshRef.position.set(moonDist, 0.4, 0);
      moonMeshRef.userData = {
        isTarget: true,
        type: 'moon',
        id: 'moon',
        nameVi: MOON_DATA.nameVi,
        nameEn: MOON_DATA.nameEn,
        icon: MOON_DATA.icon,
        radius: moonRadius,
        data: MOON_DATA
      };
      moonOrbitGroup.add(moonMeshRef);
      clickableTargets.push(moonMeshRef);

      // Moon Orbit Ring
      const moonRingGeo = new THREE.BufferGeometry();
      const mPoints = [];
      for (let mi = 0; mi <= 64; mi++) {
        const mTh = (mi / 64) * Math.PI * 2;
        mPoints.push(new THREE.Vector3(Math.cos(mTh) * moonDist, 0.4, Math.sin(mTh) * moonDist));
      }
      moonRingGeo.setFromPoints(mPoints);
      const moonLine = new THREE.Line(moonRingGeo, new THREE.LineBasicMaterial({
        color: 0x94a3b8, transparent: true, opacity: 0.35,
      }));
      moonLine.raycast = () => {};
      holder.add(moonLine);
      moonOrbitLine = moonLine;
      satelliteObjects.push(moonLine);

      // ISS (International Space Station)
      const issData = SPACECRAFT_DATA.find(s => s.id === 'iss');
      issOrbitGroup = new THREE.Group();
      holder.add(issOrbitGroup);
      satelliteObjects.push(issOrbitGroup);
      issMeshRef = createISSModel(issData);
      const issDist = radCurrent * 1.35;
      issMeshRef.position.set(issDist, 0, 0);
      issOrbitGroup.add(issMeshRef);
      clickableTargets.push(issMeshRef);
    }

    // --- JUPITER: 4 Galilean Moons (Io, Europa, Ganymede, Callisto) ---
    if (p.id === 'jupiter') {
      jupiterMoonsGroup = new THREE.Group();
      holder.add(jupiterMoonsGroup);

      JUPITER_MOONS.forEach(m => {
        const mOrbitGrp = new THREE.Group();
        jupiterMoonsGroup.add(mOrbitGrp);

        const mRad = currentScaleMode === SCALE_MODES.VISUAL ? m.radius * 1.6 : m.radius;
        const mDist = currentScaleMode === SCALE_MODES.VISUAL ? (radCurrent + m.orbitRadius * 0.6) : m.orbitRadius;
        const mGeo = new THREE.SphereGeometry(mRad, 64, 32);
        const mTex = m.texFn();
        const mMat = new THREE.MeshStandardMaterial({ map: mTex, roughness: 0.8 });
        const mMesh = new THREE.Mesh(mGeo, mMat);
        mMesh.position.set(mDist, 0, 0);

        mMesh.userData = {
          isTarget: true,
          type: 'moon',
          id: m.id,
          nameVi: m.nameVi,
          nameEn: m.nameEn,
          icon: m.icon,
          radius: mRad,
          data: m,
          orbitGroup: mOrbitGrp,
          periodDays: m.periodDays
        };
        mOrbitGrp.add(mMesh);
        jupiterMoonsMeshes.push(mMesh);
        clickableTargets.push(mMesh);

        // Transit Shadow Spot on Jupiter's cloud bands
        const shadowDecalGeo = new THREE.SphereGeometry(radCurrent * 1.003, 32, 16, 0, Math.PI * 0.08, 0, Math.PI * 0.08);
        const shadowDecalMat = new THREE.MeshBasicMaterial({
          color: 0x010204, transparent: true, opacity: 0.88, depthWrite: false, side: THREE.DoubleSide
        });
        const shadowDecal = new THREE.Mesh(shadowDecalGeo, shadowDecalMat);
        shadowDecal.raycast = () => {};
        holder.add(shadowDecal);
        satelliteObjects.push(shadowDecal);
        jupiterMoonShadows.push(shadowDecal);

        // Orbit ring line
        const rGeo = new THREE.BufferGeometry();
        const rPts = [];
        for (let ri = 0; ri <= 64; ri++) {
          const rTh = (ri / 64) * Math.PI * 2;
          rPts.push(new THREE.Vector3(Math.cos(rTh) * mDist, 0, Math.sin(rTh) * mDist));
        }
        rGeo.setFromPoints(rPts);
        const rLine = new THREE.Line(rGeo, new THREE.LineBasicMaterial({
          color: 0xfbbf24, transparent: true, opacity: 0.28
        }));
        rLine.raycast = () => {};
        holder.add(rLine);
        jupiterMoonOrbitLines.push(rLine);
        satelliteObjects.push(rLine);
      });
      buildPlanetCutaway('jupiter', radCurrent, mesh);
    }

    // --- SATURN: Rings & Titan ---
    if (p.hasRings) {
      const ringInner = radCurrent * 1.35;
      const ringOuter = radCurrent * 2.45;
      const ringGeo = new THREE.RingGeometry(ringInner, ringOuter, 256);
      const pos = ringGeo.attributes.position;
      const uv = ringGeo.attributes.uv;
      for (let i2 = 0; i2 < pos.count; i2++) {
        const x2 = pos.getX(i2), z2 = pos.getY(i2);
        const dist = Math.sqrt(x2*x2 + z2*z2);
        uv.setXY(i2, (dist - ringInner) / (ringOuter - ringInner), 0.5);
      }
      const ringTex = texSaturnRings();
      const ringMat = new THREE.MeshStandardMaterial({
        map: ringTex, side: THREE.DoubleSide,
        transparent: true, opacity: 0.82, alphaTest: 0.015,
        depthWrite: false, roughness: 1, metalness: 0,
      });
      const ringMesh = new THREE.Mesh(ringGeo, ringMat);
      ringMesh.rotation.x = -Math.PI / 2;
      ringMesh.raycast = () => {};
      mesh.add(ringMesh);

      // Saturn's rings are rendered with natural standard PBR lighting

      // Titan
      titanOrbitGroup = new THREE.Group();
      holder.add(titanOrbitGroup);
      satelliteObjects.push(titanOrbitGroup);
      const titanRad = currentScaleMode === SCALE_MODES.VISUAL ? 0.9 : TITAN_DATA.radius;
      const titanDist = currentScaleMode === SCALE_MODES.VISUAL ? (radCurrent + 22.0) : TITAN_DATA.orbitRadius;
      const titanGeo = new THREE.SphereGeometry(titanRad, 64, 32);
      const titanTex = TITAN_DATA.texFn();
      const titanMat = new THREE.MeshStandardMaterial({ map: titanTex, roughness: 0.6 });
      titanMeshRef = new THREE.Mesh(titanGeo, titanMat);
      titanMeshRef.position.set(titanDist, 0, 0);
      titanMeshRef.userData = {
        isTarget: true,
        type: 'moon',
        id: 'titan',
        nameVi: TITAN_DATA.nameVi,
        nameEn: TITAN_DATA.nameEn,
        icon: TITAN_DATA.icon,
        radius: titanRad,
        data: TITAN_DATA,
        periodDays: TITAN_DATA.periodDays
      };
      titanOrbitGroup.add(titanMeshRef);
      clickableTargets.push(titanMeshRef);

      // Titan atmosphere haze
      const tAtmo = createAtmosphereMesh(titanRad * 1.15, '#f97316', 1.2, 2.5);
      titanMeshRef.add(tAtmo);
    }

    const label = document.createElement('div');
    label.className = 'planet-label';
    label.textContent = bodyName(p);
    if (labelsContainer) labelsContainer.appendChild(label);
    labelElements.push(label);
  });

  // Halley's comet: nucleus and schematic ion/dust tails.
  const comet = COMETS[0];
  halleyHolder = new THREE.Group();
  halleyMeshRef = new THREE.Mesh(
    new THREE.IcosahedronGeometry(VISUAL_RADII.halley, 2),
    new THREE.MeshStandardMaterial({ color: 0x9ca3af, roughness: 0.95 })
  );
  halleyMeshRef.userData = {
    isTarget: true, type: 'comet', id: comet.id, nameVi: comet.nameVi,
    nameEn: comet.nameEn, icon: comet.icon, radius: VISUAL_RADII.halley, data: comet
  };
  halleyHolder.add(halleyMeshRef);
  clickableTargets.push(halleyMeshRef);
  function addTail(color, length, width, opacity) {
    const group = new THREE.Group();
    const cone = new THREE.Mesh(
      new THREE.ConeGeometry(width, length, 16, 1, true),
      new THREE.MeshBasicMaterial({ color, transparent: true, opacity, depthWrite: false, side: THREE.DoubleSide })
    );
    cone.position.y = length / 2;
    cone.raycast = () => {};
    group.add(cone);
    halleyHolder.add(group);
    return group;
  }
  halleyIonTail = addTail(0x38bdf8, 16, 0.32, 0.45);
  halleyDustTail = addTail(0xfbbf24, 12, 0.55, 0.30);
  scene.add(halleyHolder);
  satelliteObjects.push(halleyHolder);
  createEllipticalOrbitPath('halley', VISUAL_DISTANCES.halley, comet.e, comet.inc, comet.w, comet.orbitColor, 0.4);

  // --- VOYAGER 1 & VOYAGER 2 (Deep Space Interstellar Probes) ---
  const v1Data = SPACECRAFT_DATA.find(s => s.id === 'voyager1');
  const v2Data = SPACECRAFT_DATA.find(s => s.id === 'voyager2');

  voyager1Group = createVoyagerModel(v1Data);
  voyager2Group = createVoyagerModel(v2Data);

  // Position along actual hyperbolic escape vectors
  // Voyager 1: 35 degrees North of ecliptic
  const v1Dist = currentScaleMode === SCALE_MODES.VISUAL ? 420.0 : (v1Data.distAU * AU_SCALE);
  const v1Pos = new THREE.Vector3(
    v1Dist * Math.cos(35 * Math.PI / 180) * Math.cos(250 * Math.PI / 180),
    v1Dist * Math.sin(35 * Math.PI / 180),
    v1Dist * Math.cos(35 * Math.PI / 180) * Math.sin(250 * Math.PI / 180)
  );
  voyager1Group.position.copy(v1Pos);
  voyager1Group.lookAt(0, 0, 0); // Antenna aims at Earth/Sun
  scene.add(voyager1Group);
  clickableTargets.push(voyager1Group);
  spacecraftMeshes.push(voyager1Group);
  satelliteObjects.push(voyager1Group);

  // Voyager 2: 48 degrees South of ecliptic
  const v2Dist = currentScaleMode === SCALE_MODES.VISUAL ? 380.0 : (v2Data.distAU * AU_SCALE);
  const v2Pos = new THREE.Vector3(
    v2Dist * Math.cos(-48 * Math.PI / 180) * Math.cos(290 * Math.PI / 180),
    v2Dist * Math.sin(-48 * Math.PI / 180),
    v2Dist * Math.cos(-48 * Math.PI / 180) * Math.sin(290 * Math.PI / 180)
  );
  voyager2Group.position.copy(v2Pos);
  voyager2Group.lookAt(0, 0, 0);
  scene.add(voyager2Group);
  clickableTargets.push(voyager2Group);
  spacecraftMeshes.push(voyager2Group);
  satelliteObjects.push(voyager2Group);

  // Trajectory dashed lines
  [
    { from: new THREE.Vector3(0, 0, 0), to: v1Pos, target: voyager1Group, color: 0x38bdf8 },
    { from: new THREE.Vector3(0, 0, 0), to: v2Pos, target: voyager2Group, color: 0x818cf8 }
  ].forEach(traj => {
    const tGeo = new THREE.BufferGeometry().setFromPoints([traj.from, traj.to]);
    const tMat = new THREE.LineDashedMaterial({
      color: traj.color, transparent: true, opacity: 0.35,
      dashSize: 6, gapSize: 6
    });
    const tLine = new THREE.Line(tGeo, tMat);
    tLine.computeLineDistances();
    tLine.raycast = () => {};
    scene.add(tLine);
    satelliteObjects.push(tLine);
    orbitPaths.push(tLine);
    voyagerTrajectoryLines.push({ line: tLine, target: traj.target });
  });
  updateOrbitVisibility();
}

// --- Toggle Scale Mode (Visual vs True Scale) ---
export function setScaleMode(newMode) {
  if (currentScaleMode === newMode) return;
  currentScaleMode = newMode;
  if (controls) {
    controls.maxDistance = newMode === SCALE_MODES.VISUAL ? 1500 : 25000;
    controls.minDistance = newMode === SCALE_MODES.VISUAL ? 1.5 : 0.0002;
  }

  PLANETS.forEach((p, idx) => {
    if (planetMeshes[idx]) planetMeshes[idx].userData.radius = getPlanetRadius(p, newMode);
  });
  if (sunMesh) sunMesh.userData.radius = getSunRadius(newMode);

  // Recompute orbit path lines
  PLANETS.forEach(p => {
    const entry = orbitMap.get(p.id);
    if (entry) {
      const aNew = getPlanetDistance(p, currentScaleMode);
      const points = [];
      for (let i = 0; i <= 360; i++) {
        const theta = (i / 360) * Math.PI * 2;
        points.push(new THREE.Vector3(...getPlanetOrbitPointAU(p.id, theta)).multiplyScalar(aNew / p.a));
      }
      entry.geo.setFromPoints(points);
      entry.a = aNew;
    }
  });

  // Update asteroid belt
  updateAsteroidBeltPositions(currentScaleMode);
  for (const [id, au] of [['asteroid-belt-inner', ASTEROID_BELT_DATA.minAU], ['asteroid-belt-outer', ASTEROID_BELT_DATA.maxAU]]) {
    const entry = orbitMap.get(id);
    if (entry) {
      const newA = newMode === SCALE_MODES.VISUAL ? (id.endsWith('inner') ? 100 : 122) : au * AU_SCALE;
      entry.geo.setFromPoints(Array.from({ length: 361 }, (_, n) => calculateOrbitPoint(newA, entry.e, entry.incDeg, entry.wDeg, n / 360 * Math.PI * 2)));
      entry.a = newA;
    }
  }

  if (moonMeshRef) {
    const radius = newMode === SCALE_MODES.VISUAL ? VISUAL_RADII.moon : physicalRadius(1737.4);
    const distance = newMode === SCALE_MODES.VISUAL ? 5.2 : physicalRadius(384400);
    moonMeshRef.scale.setScalar(radius / VISUAL_RADII.moon);
    moonMeshRef.position.set(distance, newMode === SCALE_MODES.VISUAL ? 0.4 : 0, 0);
    moonMeshRef.userData.radius = radius;
    moonMeshRef.material.bumpScale = radius * 0.018;
    if (moonOrbitLine) moonOrbitLine.scale.set(distance / 5.2, newMode === SCALE_MODES.VISUAL ? 1 : 0, distance / 5.2);
  }
  JUPITER_MOONS.forEach((moon, index) => {
    const mesh = jupiterMoonsMeshes[index];
    if (!mesh) return;
    const visualRadius = moon.radius * 1.6;
    const radius = newMode === SCALE_MODES.VISUAL ? visualRadius : physicalRadius(JUPITER_MOON_RADIUS_KM[moon.id]);
    const visualDistance = VISUAL_RADII.jupiter + moon.orbitRadius * 0.6;
    const physicalDistances = [421700, 671100, 1070400, 1882700];
    const distance = newMode === SCALE_MODES.VISUAL ? visualDistance : physicalRadius(physicalDistances[index]);
    mesh.scale.setScalar(radius / visualRadius);
    mesh.position.x = distance;
    mesh.userData.radius = radius;
    if (jupiterMoonOrbitLines[index]) jupiterMoonOrbitLines[index].scale.setScalar(distance / visualDistance);
  });
  if (titanMeshRef) {
    const radius = newMode === SCALE_MODES.VISUAL ? 0.9 : physicalRadius(2574.7);
    titanMeshRef.scale.setScalar(radius / 0.9);
    titanMeshRef.position.x = newMode === SCALE_MODES.VISUAL ? VISUAL_RADII.saturn + 22 : physicalRadius(1221870);
    titanMeshRef.userData.radius = radius;
  }
  if (issMeshRef) {
    issMeshRef.position.x = newMode === SCALE_MODES.VISUAL ? VISUAL_RADII.earth * 1.35 : physicalRadius(EARTH_RADIUS_KM + 408);
    issMeshRef.scale.setScalar(newMode === SCALE_MODES.VISUAL ? 0.6 : 0.00005);
    issMeshRef.userData.radius = newMode === SCALE_MODES.VISUAL ? 0.6 : 0.0001;
  }
  updateSatelliteVisibility();

  // Update Voyager positions
  const v1Data = SPACECRAFT_DATA.find(s => s.id === 'voyager1');
  const v2Data = SPACECRAFT_DATA.find(s => s.id === 'voyager2');
  if (voyager1Group && v1Data) {
    const v1Dist = currentScaleMode === SCALE_MODES.VISUAL ? 420.0 : (v1Data.distAU * AU_SCALE);
    voyager1Group.position.set(
      v1Dist * Math.cos(35 * Math.PI / 180) * Math.cos(250 * Math.PI / 180),
      v1Dist * Math.sin(35 * Math.PI / 180),
      v1Dist * Math.cos(35 * Math.PI / 180) * Math.sin(250 * Math.PI / 180)
    );
  }
  if (voyager2Group && v2Data) {
    const v2Dist = currentScaleMode === SCALE_MODES.VISUAL ? 380.0 : (v2Data.distAU * AU_SCALE);
    voyager2Group.position.set(
      v2Dist * Math.cos(-48 * Math.PI / 180) * Math.cos(290 * Math.PI / 180),
      v2Dist * Math.sin(-48 * Math.PI / 180),
      v2Dist * Math.cos(-48 * Math.PI / 180) * Math.sin(290 * Math.PI / 180)
    );
  }
  voyagerTrajectoryLines.forEach(({ line, target }) => {
    line.geometry.setFromPoints([new THREE.Vector3(0, 0, 0), target.position]);
    line.computeLineDistances();
  });

  // Update Halley orbit path
  const halleyEntry = orbitMap.get('halley');
  if (halleyEntry) {
    const c = COMETS[0];
    const aNew = currentScaleMode === SCALE_MODES.VISUAL ? (VISUAL_DISTANCES.halley || 165.0) : (c.a * AU_SCALE);
    const points = [];
    for (let i = 0; i <= 360; i++) {
      const theta = (i / 360) * Math.PI * 2;
      const pointAU = getHalleyOrbitPointAU(theta);
      points.push(currentScaleMode === SCALE_MODES.VISUAL
        ? new THREE.Vector3(...getHalleyVisualPosition(pointAU))
        : new THREE.Vector3(...pointAU).multiplyScalar(AU_SCALE));
    }
    halleyEntry.geo.setFromPoints(points);
    halleyEntry.a = aNew;
  }
  updateOrbitVisibility();
}


// ============================================================
//  INTERIOR GEOLOGICAL CUTAWAY & SCALE COMPARISON SYSTEMS
// ============================================================
export function buildPlanetCutaway(planetId, radius, parentMesh) {
  const struct = CORE_STRUCTURES[planetId];
  if (!struct) return;

  const grp = new THREE.Group();
  grp.visible = false;
  parentMesh.add(grp);
  cutawayGroups[planetId] = grp;

  struct.layers.forEach((layer) => {
    const layerRad = radius * layer.radiusRatio;
    const geo = new THREE.SphereGeometry(layerRad, 48, 24, 0, Math.PI * 1.5);
    const mat = new THREE.MeshStandardMaterial({
      color: layer.color,
      emissive: layer.emissive ? new THREE.Color(layer.emissive) : new THREE.Color(0x000000),
      emissiveIntensity: layer.emissiveIntensity || 0.0,
      roughness: 0.5,
      metalness: 0.15,
      side: THREE.DoubleSide
    });
    const shell = new THREE.Mesh(geo, mat);
    shell.rotation.y = -Math.PI / 4;
    grp.add(shell);

    // Cross-section cut disc
    const discGeo = new THREE.RingGeometry(0, layerRad, 32, 1, 0, Math.PI * 0.5);
    const discMat = new THREE.MeshBasicMaterial({ color: layer.color, side: THREE.DoubleSide });
    const disc = new THREE.Mesh(discGeo, discMat);
    disc.rotation.y = Math.PI / 2;
    grp.add(disc);
  });
}

export function setCutawayTarget(planetId) {
  // Sun cutaway
  if (sunCutawayGroup) {
    sunCutawayGroup.visible = isCutawayActive && (!planetId || planetId === 'sun');
  }

  // Planet cutaways
  Object.keys(cutawayGroups).forEach(id => {
    const grp = cutawayGroups[id];
    if (grp) {
      grp.visible = isCutawayActive && (!planetId || planetId === id);
    }
  });

  return isCutawayActive;
}

export function toggleCutaway(planetId) {
  isCutawayActive = !isCutawayActive;
  return setCutawayTarget(planetId);
}

export function setScaleComparisonMode(active) {
  isScaleComparisonActive = active;
  if (asteroidBeltMesh) asteroidBeltMesh.visible = !active;
  satelliteObjects.forEach(obj => { if (obj) obj.visible = !active; });
  updateOrbitVisibility();
}
