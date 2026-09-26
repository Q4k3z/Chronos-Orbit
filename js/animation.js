// ============================================================
//  MAIN SIMULATION LOOP, KEPLERIAN DYNAMICS & MOON ORBITS
// ============================================================
import * as THREE from 'three';
import { scene, camera, renderer, controls, updateStarfield, updateCelestialBackground } from './scene.js';
import { PLANETS, SPEED_FACTOR, MS_PER_DAY, MS_PER_YEAR, EPOCH_DATE, SCALE_MODES, AU_SCALE } from './config.js';
import {
  planetMeshes,
  planetHolders,
  labelElements,
  earthCloudsMesh,
  moonOrbitGroup,
  moonMeshRef,
  issOrbitGroup,
  jupiterMoonsMeshes,
  titanOrbitGroup,
  asteroidBeltMesh,
  getPlanetDistance,
  getPlanetRadius,
  getSunRadius,
  currentScaleMode,
  halleyHolder,
  halleyIonTail,
  halleyDustTail,
  earthCloudShadowMesh,
  venusCloudsMesh,
  solarEclipseSpot,
  jupiterMoonShadows,
  isScaleComparisonActive
} from './planets.js';
import { COMETS, SCALE_COMPARISON_CONFIG } from './config.js';
import { updateSunShader } from './sun.js';
import { updateChaseCam, isChaseCamActive, updateAutoTour, isTourActive } from './interaction.js';
import { sunMesh } from './sun.js';
import { getPlanetPositionAU, getHalleyPositionAU } from './ephemeris.js';
import { getHalleyVisualPosition } from './halley-visual.js';
import { isZoomed, selectedObject, cameraTween, updateCameraTween } from './interaction.js';
import { updateVisualAssets } from './visual-assets.js';
import { EARTH_TURN_SECONDS, advanceRotation, rotationStep } from './rotation.js';
import { language } from './i18n.js';
import { isCompactLayout, viewportSize } from './layout.js';
const englishDate = new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' });

const clock = new THREE.Clock();
export let simulatedDate = new Date();
export let simulationSpeed = 1;
export let showLabels = true;

export function setSimulationSpeed(s) {
  simulationSpeed = s;
}

export function getSimulationSpeed() {
  return simulationSpeed;
}

export function setSimulatedDate(newDate) {
  simulatedDate = new Date(newDate);
}

export function setShowLabels(val) {
  showLabels = val;
}

export function startAnimation() {
  const dateDisplay = document.getElementById('date-display');

  function animate() {
    requestAnimationFrame(animate);
    const delta = clock.getDelta();
    const elapsed = clock.getElapsedTime();
    updateCelestialBackground(camera.position);
    updateStarfield(elapsed);

    // 1x = 1 simulated day per real second; Earth surface turns once in 30 seconds.
    simulatedDate.setTime(simulatedDate.getTime() + delta * simulationSpeed * SPEED_FACTOR * 1000);

    const d = simulatedDate;
    if (dateDisplay) {
      const day = String(d.getUTCDate()).padStart(2, '0');
      const month = String(d.getUTCMonth() + 1).padStart(2, '0');
      dateDisplay.textContent = isCompactLayout()
        ? `📅 ${day}/${month}/${d.getUTCFullYear()}`
        : language === 'en' ? englishDate.format(d) : `Ngày ${day} Tháng ${month} Năm ${d.getUTCFullYear()}`;
    }

    const msSinceEpoch = simulatedDate.getTime() - EPOCH_DATE.getTime();

    // 1. Planetary Movement (Orbits vs Scale Comparison Lineup)
    if (isScaleComparisonActive) {
      if (sunMesh) {
        const sunCfg = SCALE_COMPARISON_CONFIG.sun;
        sunMesh.position.lerp(new THREE.Vector3(sunCfg.posX, 0, 0), 0.16);
        sunMesh.scale.lerp(new THREE.Vector3(sunCfg.targetScale, sunCfg.targetScale, sunCfg.targetScale), 0.16);
      }
      PLANETS.forEach((p, idx) => {
        const holder = planetHolders[idx];
        const mesh = planetMeshes[idx];
        const cfg = SCALE_COMPARISON_CONFIG[p.id];
        if (holder && cfg) {
          holder.position.lerp(new THREE.Vector3(cfg.posX, 0, 0), 0.16);
        }
        if (mesh && cfg) {
          const obl = p.oblate || 1.0;
          mesh.scale.lerp(new THREE.Vector3(cfg.targetScale, cfg.targetScale * obl, cfg.targetScale), 0.16);
        }
      });
    } else {
      // Smoothly return Sun to exact origin (0, 0, 0) and normal scale (1, 1, 1)
      if (sunMesh) {
        sunMesh.position.lerp(new THREE.Vector3(0, 0, 0), 0.15);
        const sunScale = getSunRadius(currentScaleMode) / 14;
        sunMesh.scale.lerp(new THREE.Vector3(sunScale, sunScale, sunScale), 0.15);
        if (sunMesh.position.lengthSq() < 0.001) {
          sunMesh.position.set(0, 0, 0);
        }
      }
      PLANETS.forEach((p, idx) => {
        const holder = planetHolders[idx];
        const mesh = planetMeshes[idx];
        if (holder) {
          const positionAU = getPlanetPositionAU(p.id, simulatedDate);
          const factor = currentScaleMode === SCALE_MODES.VISUAL ? getPlanetDistance(p, currentScaleMode) / p.a : AU_SCALE;
          holder.position.set(positionAU[0] * factor, positionAU[1] * factor, positionAU[2] * factor);
        }
        if (mesh) {
          const obl = currentScaleMode === SCALE_MODES.TRUE ? 1.0 : (p.oblate || 1.0);
          const radiusScale = getPlanetRadius(p, currentScaleMode) / getPlanetRadius(p, SCALE_MODES.VISUAL);
          mesh.scale.lerp(new THREE.Vector3(radiusScale, radiusScale * obl, radiusScale), 0.15);
        }
      });
    }

    // All surfaces share Earth's 30-second reference, including comparison view.
    PLANETS.forEach((p, idx) => {
      const mesh = planetMeshes[idx];
      if (mesh) mesh.rotation.y = advanceRotation(mesh.rotation.y, delta, simulationSpeed, p.rotationPeriod);
    });

    // 1b. Boiling Convection Granules on Sun Surface
    updateSunShader(clock.getElapsedTime());

    // 1c. Venus Dual Atmosphere & Cloud Rotation
    if (venusCloudsMesh) {
      // This shell inherits the surface spin; add only the relative cloud drift.
      const venusPeriod = PLANETS.find(p => p.id === 'venus').rotationPeriod;
      venusCloudsMesh.rotation.y = (venusCloudsMesh.rotation.y
        + rotationStep(delta, simulationSpeed, -4.0)
        - rotationStep(delta, simulationSpeed, venusPeriod)) % (2 * Math.PI);
    }

    // 2. Earth Clouds & Orbiting Satellites (Moon & ISS)
    if (earthCloudsMesh) {
      // Clouds are children of Earth, so add only their small relative drift.
      earthCloudsMesh.rotation.y = (earthCloudsMesh.rotation.y +
        delta * simulationSpeed * 2 * Math.PI * (1 / 0.95 - 1) / EARTH_TURN_SECONDS) % (2 * Math.PI);
    }
    if (earthCloudShadowMesh && earthCloudsMesh) {
      earthCloudShadowMesh.rotation.y = earthCloudsMesh.rotation.y - 0.012;
    }
    if (moonOrbitGroup) {
      moonOrbitGroup.rotation.y = (msSinceEpoch / MS_PER_DAY) / 27.32 * 2 * Math.PI;
    }
    if (solarEclipseSpot && moonMeshRef && planetMeshes[2]) {
      const mDir = moonMeshRef.position.clone().normalize();
      solarEclipseSpot.position.copy(mDir.multiplyScalar(planetMeshes[2].userData.radius * 1.004));
      solarEclipseSpot.lookAt(planetMeshes[2].position.clone().add(mDir));
    }
    if (moonMeshRef) {
      moonMeshRef.rotation.y = (msSinceEpoch / MS_PER_DAY) / 27.32 * 2 * Math.PI;
    }
    if (issOrbitGroup) {
      // ISS orbits Earth once every ~92.68 minutes
      const msPerISSRun = 92.68 * 60 * 1000;
      issOrbitGroup.rotation.y = (msSinceEpoch / msPerISSRun) * 2 * Math.PI;
    }

    // 3. Jupiter 4 Galilean Moons & Transit Shadows
    jupiterMoonsMeshes.forEach((m, mIdx) => {
      const grp = m.userData.orbitGroup;
      if (grp && m.userData.periodDays) {
        grp.rotation.y = (msSinceEpoch / MS_PER_DAY) / m.userData.periodDays * 2 * Math.PI;
      }
      m.rotation.y += delta * 0.5;

      const shadow = jupiterMoonShadows[mIdx];
      if (shadow && planetMeshes[4]) {
        const jmDir = m.position.clone().normalize();
        shadow.position.copy(jmDir.multiplyScalar(planetMeshes[4].userData.radius * 1.003));
        shadow.lookAt(planetMeshes[4].position.clone().add(jmDir));
      }
    });

    // 4. Saturn Titan Moon & Ring Shadow Alignment
    if (titanOrbitGroup) {
      titanOrbitGroup.rotation.y = (msSinceEpoch / MS_PER_DAY) / 15.945 * 2 * Math.PI;
    }
// Saturn's rings use standard lighting

    // 4b. Halley's Comet Keplerian Dynamics & Dual Tails
    if (halleyHolder && COMETS[0]) {
      const positionAU = getHalleyPositionAU(simulatedDate);
      const position = currentScaleMode === SCALE_MODES.VISUAL
        ? getHalleyVisualPosition(positionAU)
        : positionAU.map(value => value * AU_SCALE);
      halleyHolder.position.set(...position);

      // Comet tails always point strictly away from the Sun (origin 0,0,0)
      const sunToComet = halleyHolder.position.clone();
      const distToSun = sunToComet.length();
      const antiSunDir = sunToComet.clone().normalize();

      if (halleyIonTail) {
        halleyIonTail.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), antiSunDir);
        // Tail flares longer and brighter when approaching Sun
        const tailScale = Math.max(0.2, Math.min(2.8, 220.0 / (distToSun + 20.0)));
        halleyIonTail.scale.set(tailScale, tailScale, tailScale);
      }
      if (halleyDustTail) {
        const lagDir = antiSunDir.clone().add(new THREE.Vector3(0.18, 0, 0.18)).normalize();
        halleyDustTail.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), lagDir);
        const dustScale = Math.max(0.15, Math.min(2.4, 190.0 / (distToSun + 25.0)));
        halleyDustTail.scale.set(dustScale, dustScale, dustScale);
      }
    }

    // 5. Asteroid Belt Slow Rotation (~4.5 Earth years)
    if (asteroidBeltMesh) {
      asteroidBeltMesh.rotation.y = (msSinceEpoch / MS_PER_YEAR) * 0.22 * 2 * Math.PI;
    }

    // 6. Sun Solar Rotation (~27 days)
    if (sunMesh) {
      sunMesh.rotation.y = advanceRotation(sunMesh.rotation.y, delta, simulationSpeed, 27.0);
    }

    // 7. Dynamic Star Twinkling

    // 8. Smooth Camera Tween
    updateCameraTween(delta);

    // 9. Follow focused target / Chase Camera / Auto Tour
    if (isChaseCamActive && !cameraTween) {
      updateChaseCam(delta);
    } else if (isZoomed && selectedObject && !cameraTween) {
      const worldPos = new THREE.Vector3();
      selectedObject.getWorldPosition(worldPos);
      camera.position.add(worldPos.clone().sub(controls.target));
      controls.target.copy(worldPos);
    }

    if (isTourActive) {
      updateAutoTour(delta);
    }

    controls.update();
    updateVisualAssets(camera, selectedObject);

    // 10. 2D Screen-space Planet Labels
    if (showLabels && !isScaleComparisonActive) {
      const viewport = viewportSize();
      planetMeshes.forEach((mesh, idx) => {
        const label = labelElements[idx];
        if (!label) return;
        const worldPos = new THREE.Vector3();
        mesh.getWorldPosition(worldPos);
         worldPos.y += mesh.userData.radius + (currentScaleMode === SCALE_MODES.TRUE ? 0.002 : 1.2);

        const screenPos = worldPos.clone().project(camera);
         if (screenPos.z > 1 || screenPos.z < -1 || Math.abs(screenPos.x) > 1.1 || Math.abs(screenPos.y) > 1.1) {
          label.style.opacity = '0';
          return;
        }
        const x = (screenPos.x * 0.5 + 0.5) * viewport.width;
        const y2 = (-screenPos.y * 0.5 + 0.5) * viewport.height;
        label.style.left = x + 'px';
        label.style.top = y2 + 'px';

        const dist = camera.position.distanceTo(worldPos);
        const opacity = Math.max(0, Math.min(1, 1 - (dist - 25) / 1200));
        label.style.opacity = opacity;
      });
    } else {
      labelElements.forEach(l => {
        if (l) l.style.opacity = '0';
      });
    }

    renderer.render(scene, camera);
  }

  animate();
}
