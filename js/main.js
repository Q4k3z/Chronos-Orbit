// ============================================================
//  ENTRY POINT - CHRONOS-ORBIT
// ============================================================
import { createStarfield, setupResize } from './scene.js';
import { createSun } from './sun.js';
import {
  createDistanceGuides, createAsteroidBelt, buildPlanets,
  planetMeshes, moonMeshRef, earthNightMesh, issMeshRef, voyager1Group, voyager2Group
} from './planets.js';
import { setupInteraction } from './interaction.js';
import { startAnimation, setSimulationSpeed } from './animation.js';
import { initializeVisualAssets } from './visual-assets.js';
import { t } from './i18n.js';

function init() {
  const loadingText = document.getElementById('loading-text');

  try {
    // 1. Build celestial environment
    createStarfield();
    createSun();
    createDistanceGuides();
    createAsteroidBelt();

    // 2. Build planets & setup interactions immediately
    buildPlanets();
    initializeVisualAssets(planetMeshes, moonMeshRef, earthNightMesh, [
      [voyager1Group, 'voyager'], [voyager2Group, 'voyager'], [issMeshRef, 'iss']
    ]);
    setupInteraction((newSpeed) => {
      setSimulationSpeed(newSpeed);
    });
    setupResize();

    // 3. Start render loop
    startAnimation();

    if (loadingText) loadingText.textContent = t('🚀 Chronos-Orbit đã sẵn sàng!');
    window.astraStartup?.ready();
    if (new URLSearchParams(window.location.search).get('test') === '1') {
      import('../tests/app-probe.js').then(module => module.installProbe());
    }
  } catch (err) {
    console.error('Initialization error:', err);
    window.astraStartup?.fail(t('Không thể khởi tạo mô phỏng 3D. ') + (err?.message || t('Hãy tải lại trang.')));
  }
}

// Ensure execution happens reliably whether DOM is ready or loading
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
