// ============================================================
//  SUN, CONVECTION GRANULES, PROMINENCES & INTERIOR CUTAWAY
// ============================================================
import * as THREE from 'three';
import { scene } from './scene.js';
import { texSun } from './textures.js';
import { SUN_DATA, CORE_STRUCTURES } from './config.js';

export let sunMesh;
export let sunShaderMat = null;
export let sunCutawayGroup = null;

function createGlowTexture(size, innerColor, outerColor) {
  const canvas = document.createElement('canvas');
  canvas.width = size; canvas.height = size;
  const ctx = canvas.getContext('2d');
  const g = ctx.createRadialGradient(size/2, size/2, 0, size/2, size/2, size/2);
  g.addColorStop(0, innerColor);
  g.addColorStop(0.25, innerColor + 'cc');
  g.addColorStop(0.65, outerColor + '55');
  g.addColorStop(1, 'transparent');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, size, size);
  return new THREE.CanvasTexture(canvas);
}

export function createSun() {
  const radius = SUN_DATA.radius || 14;
  const sunGeo = new THREE.SphereGeometry(radius, 64, 32);
  const baseSunTex = texSun();

  // Dynamic Boiling Photosphere Shader (NASA SDO Granulation effect)
  sunShaderMat = new THREE.ShaderMaterial({
    uniforms: {
      uTex: { value: baseSunTex },
      uTime: { value: 0.0 }
    },
    vertexShader: `
      #include <common>
      #include <logdepthbuf_pars_vertex>
      varying vec2 vUv;
      varying vec3 vNormal;
      varying vec3 vViewPosition;
      void main() {
        vUv = uv;
        vNormal = normalize(normalMatrix * normal);
        vec4 mvPos = modelViewMatrix * vec4(position, 1.0);
        vViewPosition = -mvPos.xyz;
        gl_Position = projectionMatrix * mvPos;
        #include <logdepthbuf_vertex>
      }
    `,
    fragmentShader: `
      #include <logdepthbuf_pars_fragment>
      uniform sampler2D uTex;
      uniform float uTime;
      varying vec2 vUv;
      varying vec3 vNormal;
      varying vec3 vViewPosition;

      float hash(vec2 p) {
        return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
      }

      float voronoi(vec2 x) {
        vec2 n = floor(x);
        vec2 f = fract(x);
        float m_dist = 1.0;
        for (int j = -1; j <= 1; j++) {
          for (int i = -1; i <= 1; i++) {
            vec2 g = vec2(float(i), float(j));
            vec2 o = vec2(hash(n + g), hash(n + g + 13.7));
            vec2 r = g + o - f;
            float d = dot(r, r);
            m_dist = min(m_dist, d);
          }
        }
        return sqrt(m_dist);
      }

      void main() {
        #include <logdepthbuf_fragment>
        vec4 texCol = texture2D(uTex, vUv);
        vec2 uvAnim = vUv * 48.0 + vec2(uTime * 0.15, sin(uTime * 0.2 + vUv.x * 10.0) * 0.1);
        float cells = voronoi(uvAnim);
        cells = smoothstep(0.1, 0.7, cells);
        float pulse = 0.92 + 0.08 * sin(uTime * 1.8 + vUv.y * 30.0);
        vec3 viewDir = normalize(vViewPosition);
        float NdotV = max(0.0, dot(vNormal, viewDir));
        float limb = pow(1.0 - NdotV, 1.8);
        vec3 solarColor = mix(texCol.rgb * 1.25, vec3(1.0, 0.95, 0.7), cells * 0.35);
        solarColor += vec3(1.0, 0.45, 0.1) * limb * 0.75;
        solarColor *= pulse;
        gl_FragColor = vec4(solarColor, 1.0);
      }
    `
  });

  sunMesh = new THREE.Mesh(sunGeo, sunShaderMat);
  sunMesh.userData = {
    isTarget: true,
    type: 'sun',
    id: 'sun',
    nameVi: SUN_DATA.nameVi,
    nameEn: SUN_DATA.nameEn,
    icon: SUN_DATA.icon,
    radius: radius,
    data: SUN_DATA
  };
  scene.add(sunMesh);

  // Inner Corona Glow
  const spriteTex = createGlowTexture(256, '#fef08a', '#f97316');
  const spriteMat = new THREE.SpriteMaterial({
    map: spriteTex, transparent: true, opacity: 0.75,
    depthWrite: false, blending: THREE.AdditiveBlending,
  });
  const sprite = new THREE.Sprite(spriteMat);
  sprite.scale.set(radius * 3.8, radius * 3.8, 1);
  sprite.raycast = () => {};
  sunMesh.add(sprite);

  // Outer Corona Flare
  const spriteTex2 = createGlowTexture(256, '#ea580c', '#000000');
  const spriteMat2 = new THREE.SpriteMaterial({
    map: spriteTex2, transparent: true, opacity: 0.35,
    depthWrite: false, blending: THREE.AdditiveBlending,
  });
  const sprite2 = new THREE.Sprite(spriteMat2);
  sprite2.scale.set(radius * 6.5, radius * 6.5, 1);
  sprite2.raycast = () => {};
  sunMesh.add(sprite2);

  // Build Solar Interior Cutaway Group
  buildSunCutaway(radius);
}

function buildSunCutaway(radius) {
  sunCutawayGroup = new THREE.Group();
  sunCutawayGroup.visible = false;
  sunMesh.add(sunCutawayGroup);

  const struct = CORE_STRUCTURES.sun;
  if (!struct) return;

  struct.layers.forEach((layer) => {
    const layerRad = radius * layer.radiusRatio;
    const geo = new THREE.SphereGeometry(layerRad, 48, 24, 0, Math.PI * 1.5);
    const mat = new THREE.MeshStandardMaterial({
      color: layer.color,
      emissive: layer.emissive || 0x000000,
      emissiveIntensity: layer.emissiveIntensity || 0.0,
      roughness: 0.4,
      metalness: 0.2,
      side: THREE.DoubleSide
    });
    const mesh = new THREE.Mesh(geo, mat);
    mesh.rotation.y = -Math.PI / 4;
    sunCutawayGroup.add(mesh);
  });
}

export function updateSunShader(time) {
  if (sunShaderMat && sunShaderMat.uniforms.uTime) {
    sunShaderMat.uniforms.uTime.value = time;
  }
}
