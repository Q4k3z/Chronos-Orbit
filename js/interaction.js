// ============================================================
//  USER INTERACTION, RAYCASTING, ZOOM & ADVANCED CONTROLS
// ============================================================
import * as THREE from 'three';
import { camera, renderer, controls, updateCameraViewport } from './scene.js';
import { sunMesh } from './sun.js';
import {
  PLANETS,
  SUN_DATA,
  MOON_DATA,
  ASTEROID_BELT_DATA,
  JUPITER_MOONS,
  TITAN_DATA,
  SPACECRAFT_DATA,
  SCALE_MODES,
  AU_SCALE,
  COMETS,
  CORE_STRUCTURES
} from './config.js';
import {
  planetMeshes,
  clickableTargets,
  moonMeshRef,
  issMeshRef,
  jupiterMoonsMeshes,
  titanMeshRef,
  voyager1Group,
  voyager2Group,
  highlightOrbit,
  setShowOrbits,
  setSatelliteVisibility,
  setHalleyVisibility, showHalley, setImmersiveView,
  satelliteVisibility,
  currentScaleMode,
  setScaleMode,
  halleyMeshRef,
  toggleCutaway,
  setCutawayTarget,
  isCutawayActive,
  setScaleComparisonMode,
  isScaleComparisonActive
} from './planets.js';
import { toggleAudio } from './audio.js';
import { setSimulatedDate, simulatedDate, setShowLabels } from './animation.js';
import { setupViewTools } from './view-tools.js';

export let cameraTween = null;
export let isZoomed = false;
export let selectedObject = null;
export let lastHighlightedOrbit = null;

const savedCameraState = { pos: null, target: null };
const compareCameraState = { pos: null, target: null };
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();
let viewTools;
const SETTINGS_KEY = new URLSearchParams(window.location.search).get('test') === '1'
  ? 'astra-test-display-settings-v1' : 'astra-display-settings-v1';
const displayPreferences = {
  showOrbits: true, showLabels: true, showTooltips: true, showHalley: true,
  physicalInfo: true, orbitalInfo: true,
  satellites: Object.fromEntries(Object.keys(satelliteVisibility).map(id => [id, true]))
};
const visualSources = {
  mercury: ['Ảnh MESSENGER, màu khoa học đã giảm độ bão hòa', 'https://science.nasa.gov/resource/enhanced-color-mercury-map/'],
  venus: ['Bản đồ radar Magellan dưới lớp mây', 'https://science.nasa.gov/3d-resources/venus/'],
  earth: ['Ảnh ghép Blue Marble và đèn đêm NASA', 'https://svs.gsfc.nasa.gov/2915/'],
  moon: ['Bản đồ màu và địa hình LRO', 'https://svs.gsfc.nasa.gov/4720/'],
  mars: ['Bản đồ bề mặt Sao Hỏa NASA', 'https://science.nasa.gov/3d-resources/mars/'],
  jupiter: ['Ảnh khí quyển Hubble, năm 2015', 'https://svs.gsfc.nasa.gov/12021/'],
  voyager1: ['Mô hình 3D NASA', 'https://science.nasa.gov/3d-resources/voyager-probe-b/'],
  voyager2: ['Mô hình 3D NASA', 'https://science.nasa.gov/3d-resources/voyager-probe-b/'],
  iss: ['Mô hình 3D NASA', 'https://science.nasa.gov/3d-resources/international-space-station-iss-b/'],
};

function isTargetVisible(object) {
  for (let node = object; node; node = node.parent) {
    if (!node.visible) return false;
  }
  return true;
}

function easeInOutCubic(t) {
  return t < 0.5 ? 4*t*t*t : 1 - Math.pow(-2*t + 2, 3) / 2;
}

export function zoomToObject(mesh, dist, resetDirection = false) {
  const wasComparing = isScaleComparisonActive;
  if (wasComparing) {
    setScaleComparisonMode(false);
    document.getElementById('toggle-compare')?.classList.remove('active');
    document.getElementById('comparison-banner')?.classList.remove('active');
  }
  if (['sun', 'planet', 'moon', 'comet'].includes(mesh.userData?.type)) {
    const radius = mesh.userData.radius || 0.001;
    const mobile = window.innerWidth <= 1100;
    const framing = mesh.userData.data?.hasRings ? (mobile ? 10.5 : 7) : (mobile ? 8.5 : 5.5);
    const minimum = Math.max(radius * framing, currentScaleMode === SCALE_MODES.TRUE ? 0.001 : 2);
    dist = currentScaleMode === SCALE_MODES.TRUE ? minimum : Math.max(dist, minimum);
  }
  if (!isZoomed) {
    savedCameraState.pos = wasComparing && compareCameraState.pos ? compareCameraState.pos.clone() : camera.position.clone();
    savedCameraState.target = wasComparing && compareCameraState.target ? compareCameraState.target.clone() : controls.target.clone();
  }
  isZoomed = true;
  selectedObject = mesh;
  if (isCutawayActive) {
    if (CORE_STRUCTURES[mesh.userData?.id]) setCutawayTarget(mesh.userData.id);
    else {
      toggleCutaway();
      document.getElementById('toggle-cutaway')?.classList.remove('active');
    }
  }

  const worldPos = new THREE.Vector3();
  mesh.getWorldPosition(worldPos);

  const dir = resetDirection ? new THREE.Vector3(0.65, 0.45, 1).normalize()
    : new THREE.Vector3().subVectors(camera.position, worldPos).normalize();
  if (dir.lengthSq() < 0.0001) dir.set(0.5, 0.5, 1).normalize();
  const targetCamPos = worldPos.clone().add(dir.multiplyScalar(dist));
  targetCamPos.y = Math.max(targetCamPos.y, worldPos.y + dist * 0.35);

  cameraTween = {
    startPos: camera.position.clone(),
    endPos: targetCamPos,
    startTarget: controls.target.clone(),
    endTarget: worldPos.clone(),
    trackedObject: mesh,
    endOffset: targetCamPos.clone().sub(worldPos),
    progress: 0,
    duration: 1.4,
  };

  const backBtn = document.getElementById('back-btn');
  if (backBtn) backBtn.style.display = 'block';

  if (mesh.userData && mesh.userData.id) {
    highlightOrbit(mesh.userData.id, true);
    lastHighlightedOrbit = mesh.userData.id;
  }
}

export function zoomOut() {
  if (!savedCameraState.pos) return;
  document.body.classList.remove('viewing-body', 'info-collapsed');
  viewTools?.hideScaleNote();
  updateCameraViewport();
  if (isChaseCamActive) toggleChaseCam();
  if (isTourActive) stopAutoTour();
  if (isCutawayActive) {
    toggleCutaway();
    document.getElementById('toggle-cutaway')?.classList.remove('active');
  }
  if (selectedObject && selectedObject.userData && selectedObject.userData.id) {
    highlightOrbit(selectedObject.userData.id, false);
  }
  isZoomed = false;
  selectedObject = null;
  lastHighlightedOrbit = null;

  cameraTween = {
    startPos: camera.position.clone(),
    endPos: savedCameraState.pos.clone(),
    startTarget: controls.target.clone(),
    endTarget: savedCameraState.target.clone(),
    progress: 0,
    duration: 1.2,
  };

  const backBtn = document.getElementById('back-btn');
  if (backBtn) backBtn.style.display = 'none';

  const infoPanel = document.getElementById('info-panel');
  if (infoPanel) infoPanel.classList.remove('active');

  updateDropdownSelection(null, '🪐', 'Khám Phá Thiên Thể');
}

export function zoomView(factor) {
  const offset = camera.position.clone().sub(controls.target);
  const radius = selectedObject?.userData?.radius || 0;
  const clearance = radius * (selectedObject?.userData?.data?.hasRings ? 3 : 1.5);
  const distance = THREE.MathUtils.clamp(offset.length() * factor,
    Math.max(controls.minDistance, clearance), controls.maxDistance);
  if (offset.lengthSq() === 0) offset.set(0.65, 0.45, 1);
  offset.setLength(distance);
  cameraTween = {
    startPos: camera.position.clone(), endPos: controls.target.clone().add(offset),
    startTarget: controls.target.clone(), endTarget: controls.target.clone(),
    trackedObject: selectedObject, endOffset: offset, progress: 0, duration: 0.25
  };
}

export function resetView() {
  if (selectedObject) {
    zoomToObject(selectedObject, selectedObject.userData.viewDistance ?? selectedObject.userData.radius * 5.5, true);
    return;
  }
  if (isScaleComparisonActive) {
    setScaleComparisonMode(false);
    document.getElementById('toggle-compare')?.classList.remove('active');
    document.getElementById('comparison-banner')?.classList.remove('active');
  }
  cameraTween = {
    startPos: camera.position.clone(), endPos: new THREE.Vector3(65, 85, 160),
    startTarget: controls.target.clone(), endTarget: new THREE.Vector3(),
    progress: 0, duration: 0.6
  };
}

export function updateCameraTween(delta) {
  if (!cameraTween) return;
  if (cameraTween.trackedObject) {
    cameraTween.trackedObject.getWorldPosition(cameraTween.endTarget);
    cameraTween.endPos.copy(cameraTween.endTarget).add(cameraTween.endOffset);
  }
  cameraTween.progress += delta / cameraTween.duration;
  if (cameraTween.progress >= 1) cameraTween.progress = 1;
  const t = easeInOutCubic(cameraTween.progress);
  camera.position.lerpVectors(cameraTween.startPos, cameraTween.endPos, t);
  controls.target.lerpVectors(cameraTween.startTarget, cameraTween.endTarget, t);
  if (cameraTween.progress >= 1) cameraTween = null;
}

// --- Dropdown Menu ---
function updateDropdownSelection(id, icon, name) {
  const currentIcon = document.getElementById('current-icon');
  const currentLabel = document.getElementById('current-label');
  if (currentIcon) currentIcon.textContent = icon || '🪐';
  if (currentLabel) currentLabel.textContent = name || 'Khám Phá Thiên Thể';
  document.querySelectorAll('.dropdown-item').forEach(item => {
    item.classList.toggle('active', item.dataset.target === id);
  });
}

function setupDropdown() {
  const dropdownToggle = document.getElementById('dropdown-toggle');
  const dropdownMenu = document.getElementById('dropdown-menu');
  if (!dropdownToggle || !dropdownMenu) return;

  dropdownToggle.addEventListener('click', (e) => {
    e.stopPropagation();
    const isOpen = dropdownMenu.classList.contains('open');
    dropdownMenu.classList.toggle('open', !isOpen);
    dropdownToggle.classList.toggle('open', !isOpen);
  });

  window.addEventListener('click', (e) => {
    if (!e.target.closest('#dropdown-container')) {
      dropdownMenu.classList.remove('open');
      dropdownToggle.classList.remove('open');
    }
  });

  document.querySelectorAll('.dropdown-item').forEach(item => {
    item.addEventListener('click', (e) => {
      e.stopPropagation();
      const target = item.dataset.target;
      if (Object.hasOwn(satelliteVisibility, target) && !satelliteVisibility[target]) return;
      if (target === 'halley' && !showHalley) return;
      if (isTourActive) stopAutoTour();
      dropdownMenu.classList.remove('open');
      dropdownToggle.classList.remove('open');

      // 1. Sun
      if (target === 'sun') {
        zoomToObject(sunMesh, 38);
        showInfoPanel(SUN_DATA);
        updateDropdownSelection('sun', '☀️', SUN_DATA.nameVi);
      }
      // 2. Earth Moon
      else if (target === 'moon' && moonMeshRef) {
        zoomToObject(moonMeshRef, 2.0);
        showInfoPanel(MOON_DATA);
        updateDropdownSelection('moon', '🌙', MOON_DATA.nameVi);
      }
      // 3. Asteroid belt
      else if (target === 'asteroid-belt') {
        const dummyMesh = {
          getWorldPosition: (v) => v.set(currentScaleMode === SCALE_MODES.VISUAL ? 110
            : (ASTEROID_BELT_DATA.minAU + ASTEROID_BELT_DATA.maxAU) * AU_SCALE / 2, 0, 0),
          userData: { id: 'asteroid-belt', radius: 8, viewDistance: 45, data: ASTEROID_BELT_DATA }
        };
        zoomToObject(dummyMesh, 45);
        showInfoPanel(ASTEROID_BELT_DATA);
        updateDropdownSelection('asteroid-belt', '☄️', ASTEROID_BELT_DATA.nameVi);
      }
      // 4. Spacecraft (Voyager 1, Voyager 2, ISS)
      else if (target === 'voyager1' && voyager1Group) {
        zoomToObject(voyager1Group, 4.5);
        const data = SPACECRAFT_DATA.find(s => s.id === 'voyager1');
        showInfoPanel(data);
        updateDropdownSelection('voyager1', '🛰️', data.nameVi);
      } else if (target === 'voyager2' && voyager2Group) {
        zoomToObject(voyager2Group, 4.5);
        const data = SPACECRAFT_DATA.find(s => s.id === 'voyager2');
        showInfoPanel(data);
        updateDropdownSelection('voyager2', '🛰️', data.nameVi);
      } else if (target === 'iss' && issMeshRef) {
        zoomToObject(issMeshRef, 2.5);
        const data = SPACECRAFT_DATA.find(s => s.id === 'iss');
        showInfoPanel(data);
        updateDropdownSelection('iss', '🛰️', data.nameVi);
      }
      // 5. Jupiter Moons (Io, Europa, Ganymede, Callisto)
      else if (['io', 'europa', 'ganymede', 'callisto'].includes(target)) {
        const jMoonMesh = jupiterMoonsMeshes.find(m => m.userData.id === target);
        if (jMoonMesh) {
          zoomToObject(jMoonMesh, 2.2);
          showInfoPanel(jMoonMesh.userData.data);
          updateDropdownSelection(target, jMoonMesh.userData.icon, jMoonMesh.userData.nameVi);
        }
      }
      // 6. Saturn Titan
      else if (target === 'titan' && titanMeshRef) {
        zoomToObject(titanMeshRef, 2.8);
        showInfoPanel(TITAN_DATA);
        updateDropdownSelection('titan', '🪐', TITAN_DATA.nameVi);
      }
      // 6b. Halley's Comet
      else if (target === 'halley' && halleyMeshRef) {
        zoomToObject(halleyMeshRef, 4.5);
        const data = COMETS[0];
        showInfoPanel(data);
        updateDropdownSelection('halley', '☄️', data.nameVi);
      }
      // 7. Planets
      else {
        const p = PLANETS.find(it => it.id === target);
        const pMesh = planetMeshes.find(m => m.userData.id === target);
        if (p && pMesh) {
          const zoomDist = p.hasRings ? p.radius * 3.5 : Math.max(p.radius * 3.0, 1.8);
          zoomToObject(pMesh, zoomDist);
          showInfoPanel(p);
          updateDropdownSelection(p.id, p.icon, p.nameVi);
        }
      }
    });

    item.addEventListener('mouseenter', () => {
      highlightOrbit(item.dataset.target, true);
    });
    item.addEventListener('mouseleave', () => {
      const target = item.dataset.target;
      if (!selectedObject || selectedObject.userData.id !== target) {
        highlightOrbit(target, false);
      }
    });
  });
}

// --- Info Panel ---
export function showInfoPanel(data) {
  const panel = document.getElementById('info-panel');
  if (!panel) return;
  if (panel.dataset.bodyId !== data.id) document.body.classList.remove('info-collapsed');
  panel.dataset.bodyId = data.id;
  viewTools?.refreshCollapse();
  panel.style.setProperty('--planet-color', data.color || '#38bdf8');
  panel.style.setProperty('--planet-glow', (data.color || '#38bdf8') + '55');
  panel.style.setProperty('--planet-gradient', data.gradient || 'linear-gradient(135deg, #0284c7 0%, #38bdf8 100%)');

  const nameVi = document.getElementById('p-name-vi');
  const nameEn = document.getElementById('p-name-en');
  const tagline = document.getElementById('p-tagline');
  if (nameVi) nameVi.textContent = data.nameVi;
  if (nameEn) nameEn.textContent = data.nameEn;
  if (tagline) tagline.textContent = data.tagline || '';

  const content = document.getElementById('panel-content');
  if (!content) return;
  content.innerHTML = '';
  const info = data.info || {};

  // Weight Calculator
  if (data.gravityRatio !== undefined) {
    const weightSec = document.createElement('div');
    weightSec.className = 'info-section';
    weightSec.innerHTML = `
      <div class="info-section-title">⚖️ CÂN NẶNG CỦA BẠN TẠI ĐÂY</div>
      <div class="weight-box">
        <div class="weight-input-group">
          <span style="font-size:0.82rem;color:#94a3b8;">Cân nặng trên Trái Đất:</span>
          <input type="number" id="weight-input" class="weight-input" value="60" min="5" max="300">
          <span style="font-size:0.82rem;color:#94a3b8;">kg</span>
        </div>
        <div class="weight-result">
          Cân nặng tương đương: <span id="weight-result-val" class="weight-highlight">${(60 * data.gravityRatio).toFixed(1)} kg</span>
        </div>
        <div id="weight-fun-fact" style="font-size:0.78rem;color:#94a3b8;margin-top:8px;line-height:1.5;"></div>
      </div>
    `;
    content.appendChild(weightSec);

    const inputEl = weightSec.querySelector('#weight-input');
    const resEl = weightSec.querySelector('#weight-result-val');
    const factEl = weightSec.querySelector('#weight-fun-fact');

    function updateWeight() {
      const w = parseFloat(inputEl.value) || 0;
      const targetW = (w * data.gravityRatio).toFixed(1);
      resEl.textContent = targetW + ' kg';
      if (data.gravityRatio > 2.0) {
        factEl.textContent = '⚡ Trọng lực cực nặng! Cơ thể bạn sẽ cảm giác như đang gánh 2 người trưởng thành trên vai.';
      } else if (data.gravityRatio < 0.2) {
        factEl.textContent = '🚀 Trọng lực cực nhẹ! Một bước nhảy bình thường có thể đưa bạn bay bổng lơ lửng nhiều mét.';
      } else if (data.gravityRatio === 1.0) {
        factEl.textContent = '🌍 Đây là trọng lực chuẩn 1g mà cơ thể bạn đã tiến hóa để thích nghi hoàn hảo.';
      } else {
        factEl.textContent = `Bạn sẽ cảm thấy cân nặng ${(data.gravityRatio > 1 ? 'tăng' : 'giảm')} ${(Math.abs(1 - data.gravityRatio)*100).toFixed(0)}% so với khi ở Trái Đất.`;
      }
    }
    inputEl.addEventListener('input', updateWeight);
    updateWeight();
  }

  function createInfoSection(title, rows) {
    const sec = document.createElement('div');
    sec.className = 'info-section';
    let html = `<div class="info-section-title">${title}</div>`;
    rows.forEach(([label, value]) => {
      html += `<div class="info-row">
        <span class="info-label">${label}</span>
        <span class="info-value">${value}</span>
      </div>`;
    });
    sec.innerHTML = html;
    return sec;
  }

  if (info.physical && displayPreferences.physicalInfo) content.appendChild(createInfoSection('📐 THÔNG SỐ VẬT LÝ', info.physical));
  if (info.orbital && displayPreferences.orbitalInfo) content.appendChild(createInfoSection('🌐 QUỸ ĐẠO & CHUYỂN ĐỘNG', info.orbital));

  if (info.atmosphere) {
    const sec = document.createElement('div');
    sec.className = 'info-section';
    sec.innerHTML = `<div class="info-section-title">🌬️ KHÍ QUYỂN & ÁP SUẤT</div>
      <div class="info-text" style="margin-bottom:12px;">${info.atmosphere.desc || ''}</div>`;

    if (info.atmosphere.composition) {
      info.atmosphere.composition.forEach(([name, pct]) => {
        const bar = document.createElement('div');
        bar.className = 'atmo-bar';
        bar.innerHTML = `
          <div class="atmo-bar-name">${name}</div>
          <div style="flex:1;background:rgba(255,255,255,0.06);border-radius:4px;overflow:hidden;">
            <div class="atmo-bar-fill" style="width:${Math.max(pct, 1)}%;"></div>
          </div>
          <div class="atmo-bar-label">${pct}%</div>
        `;
        sec.appendChild(bar);
      });
    }
    content.appendChild(sec);
  }

  if (info.temperature) {
    const sec = document.createElement('div');
    sec.className = 'info-section';
    sec.innerHTML = `<div class="info-section-title">🌡️ NHIỆT ĐỘ</div>
      <div class="info-text">${info.temperature}</div>`;
    content.appendChild(sec);
  }

  if (info.moons) {
    const sec = document.createElement('div');
    sec.className = 'info-section';
    sec.innerHTML = `<div class="info-section-title">🛰️ HỆ THỐNG VỆ TINH</div>
      <div class="info-text">${info.moons}</div>`;
    content.appendChild(sec);
  }

  if (info.biosphere) {
    const sec = document.createElement('div');
    sec.className = 'info-section';
    sec.innerHTML = `<div class="info-section-title">🌱 TIỀM NĂNG SỰ SỐNG & SINH QUYỂN</div>
      <div class="info-text" style="white-space:pre-line">${info.biosphere}</div>`;
    content.appendChild(sec);
  }

  if (info.features) {
    const sec = document.createElement('div');
    sec.className = 'info-section';
    sec.innerHTML = `<div class="info-section-title">⭐ ĐẶC ĐIỂM NỔI BẬT & KHÁM PHÁ</div>
      <div class="info-text" style="white-space:pre-line">${info.features}</div>`;
    content.appendChild(sec);
  }

  const source = visualSources[data.id];
  if (source) {
    const sec = document.createElement('div');
    sec.className = 'info-section';
    const label = document.createElement('div');
    label.className = 'info-section-title';
    label.textContent = '🖼️ NGUỒN HÌNH ẢNH';
    const link = document.createElement('a');
    link.href = source[1];
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
    link.textContent = source[0] + ' ↗';
    link.style.cssText = 'color:#93c5fd;font-size:0.82rem;line-height:1.5';
    sec.append(label, link);
    content.appendChild(sec);
  } else if (['saturn', 'uranus', 'neptune', 'pluto'].includes(data.id)) {
    const sec = document.createElement('div');
    sec.className = 'info-section';
    sec.innerHTML = '<div class="info-section-title">🖼️ NGUỒN HÌNH ẢNH</div><div class="info-text">Bề mặt đang dùng hình minh họa.</div>';
    content.appendChild(sec);
  }

  panel.classList.add('active');
  document.body.classList.add('viewing-body');
  updateCameraViewport();
  panel.scrollTop = 0;
  if (isCutawayActive && selectedObject?.userData?.id === data.id && CORE_STRUCTURES[data.id]) {
    renderCutawayInfo(CORE_STRUCTURES[data.id]);
  }
}

// --- Setup Date Picker Modal ---
function setupDatePicker(onDateSelected) {
  const dateDisplay = document.getElementById('date-display');
  const dateModal = document.getElementById('date-modal');
  const dateInput = document.getElementById('date-input');
  const confirmBtn = document.getElementById('date-confirm-btn');

  if (!dateDisplay || !dateModal) return;

  dateDisplay.addEventListener('click', (e) => {
    e.stopPropagation();
    if (dateInput && Number.isFinite(simulatedDate.getTime())) {
      dateInput.value = simulatedDate.toISOString().slice(0, 10);
    }
    dateModal.classList.toggle('open');
  });

  window.addEventListener('click', (e) => {
    if (!e.target.closest('#date-modal') && !e.target.closest('#date-display')) {
      dateModal.classList.remove('open');
    }
  });

  if (confirmBtn && dateInput) {
    confirmBtn.addEventListener('click', () => {
      const val = dateInput.value;
      if (val && dateInput.reportValidity()) {
        setSimulatedDate(new Date(val + 'T12:00:00Z'));
        onDateSelected?.();
        dateModal.classList.remove('open');
      }
    });
  }

  document.querySelectorAll('.landmark-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const dateStr = btn.dataset.date;
      if (dateStr === 'today') {
        setSimulatedDate(new Date());
      } else {
        setSimulatedDate(new Date(dateStr + 'T12:00:00Z'));
      }
      onDateSelected?.();
      dateModal.classList.remove('open');
    });
  });
}

function setupSettings() {
  try {
    const saved = JSON.parse(localStorage.getItem(SETTINGS_KEY) || '{}');
    for (const key of ['showOrbits', 'showLabels', 'showTooltips', 'physicalInfo', 'orbitalInfo', 'showHalley']) {
      if (typeof saved[key] === 'boolean') displayPreferences[key] = saved[key];
    }
    for (const id of Object.keys(satelliteVisibility)) {
      if (typeof saved.satellites?.[id] === 'boolean') {
        displayPreferences.satellites[id] = saved.satellites[id];
      }
    }
  } catch (_) { /* Storage may be unavailable or contain old data. */ }

  const panel = document.getElementById('settings-panel');
  const backdrop = document.getElementById('settings-backdrop');
  const openButton = document.getElementById('open-settings');
  const closeButton = document.getElementById('settings-close');

  function apply(refreshInfo = false) {
    setShowOrbits(displayPreferences.showOrbits);
    setShowLabels(displayPreferences.showLabels);
    setHalleyVisibility(displayPreferences.showHalley);
    for (const [id, visible] of Object.entries(displayPreferences.satellites)) {
      setSatelliteVisibility(id, visible);
    }
    document.getElementById('toggle-orbits')?.classList.toggle('active', displayPreferences.showOrbits);
    document.getElementById('toggle-labels')?.classList.toggle('active', displayPreferences.showLabels);
    document.querySelectorAll('[data-setting]').forEach(input => {
      input.checked = displayPreferences[input.dataset.setting];
    });
    document.querySelectorAll('[data-satellite]').forEach(input => {
      input.checked = displayPreferences.satellites[input.dataset.satellite];
    });
    document.querySelectorAll('.dropdown-item[data-target]').forEach(item => {
      const id = item.dataset.target;
      item.classList.toggle('hidden-by-setting', (Object.hasOwn(satelliteVisibility, id) && !satelliteVisibility[id])
        || (id === 'halley' && !displayPreferences.showHalley));
    });
    if (!displayPreferences.showTooltips) {
      const tooltip = document.getElementById('tooltip');
      if (tooltip) tooltip.style.display = 'none';
    }
    if (refreshInfo && selectedObject?.userData?.data) showInfoPanel(selectedObject.userData.data);
    try { localStorage.setItem(SETTINGS_KEY, JSON.stringify(displayPreferences)); } catch (_) { /* Optional persistence. */ }
  }

  function updateSetting(key, value) {
    if (!Object.hasOwn(displayPreferences, key) || key === 'satellites') return;
    displayPreferences[key] = Boolean(value);
    if (key === 'showHalley' && !value && selectedObject?.userData?.id === 'halley') zoomOut();
    apply(key === 'physicalInfo' || key === 'orbitalInfo');
  }

  function updateSatellite(id, visible) {
    if (!Object.hasOwn(satelliteVisibility, id)) return;
    displayPreferences.satellites[id] = Boolean(visible);
    if (!visible && selectedObject?.userData?.id === id) zoomOut();
    apply();
  }

  function close() {
    panel?.classList.remove('open');
    backdrop?.classList.remove('open');
    openButton?.setAttribute('aria-expanded', 'false');
    openButton?.focus();
  }

  openButton?.addEventListener('click', () => {
    const content = panel?.querySelector('.settings-content');
    if (content) content.scrollTop = 0;
    panel?.classList.add('open');
    backdrop?.classList.add('open');
    openButton.setAttribute('aria-expanded', 'true');
    closeButton?.focus();
  });
  closeButton?.addEventListener('click', close);
  backdrop?.addEventListener('click', close);
  panel?.querySelectorAll('[data-setting]').forEach(input => {
    input.addEventListener('change', () => updateSetting(input.dataset.setting, input.checked));
  });
  panel?.querySelectorAll('[data-satellite]').forEach(input => {
    input.addEventListener('change', () => updateSatellite(input.dataset.satellite, input.checked));
  });
  for (const [buttonId, visible] of [['show-all-satellites', true], ['hide-all-satellites', false]]) {
    document.getElementById(buttonId)?.addEventListener('click', () => {
      for (const id of Object.keys(satelliteVisibility)) displayPreferences.satellites[id] = visible;
      if (!visible && selectedObject && Object.hasOwn(satelliteVisibility, selectedObject.userData?.id)) zoomOut();
      apply();
    });
  }

  apply();
  return { updateSetting, close, panel };
}

// --- Setup All Interaction Handlers ---
export function setupInteraction(onSpeedChange) {
  const tooltip = document.getElementById('tooltip');
  const settingsController = setupSettings();
  viewTools = setupViewTools({
    zoom: zoomView, reset: resetView, onLayoutChange: updateCameraViewport,
    onImmersiveChange: active => { settingsController.close(); setImmersiveView(active); },
    getScale: () => ({ mode: currentScaleMode, body: selectedObject?.userData?.data })
  });
  const layout = () => window.innerWidth > 1100 ? 'desktop'
    : window.innerWidth > window.innerHeight ? 'landscape' : 'portrait';
  let previousLayout = layout();
  window.addEventListener('resize', () => {
    const nextLayout = layout();
    if (nextLayout !== previousLayout && selectedObject) {
      // Refit after rotation so a desktop close-up is not clipped on a phone.
      zoomToObject(selectedObject, selectedObject.userData.viewDistance ?? selectedObject.userData.radius * 3.5);
    }
    previousLayout = nextLayout;
  });

  function targetAt(clientX, clientY) {
    const bounds = renderer.domElement.getBoundingClientRect();
    mouse.x = ((clientX - bounds.left) / bounds.width) * 2 - 1;
    mouse.y = -((clientY - bounds.top) / bounds.height) * 2 + 1;
    raycaster.setFromCamera(mouse, camera);
    for (const hit of raycaster.intersectObjects(clickableTargets, true)) {
      if (!isTargetVisible(hit.object)) continue;
      for (let current = hit.object; current; current = current.parent) {
        if (current.userData?.isTarget && current.userData?.nameVi) return current;
      }
    }
    return null;
  }

  function selectTarget(target) {
    if (!target?.userData?.data || !isTargetVisible(target)) return;
    if (isTourActive) stopAutoTour();
    const u = target.userData;
    if (u.type === 'sun') {
      zoomToObject(target, 38);
      showInfoPanel(u.data);
      updateDropdownSelection('sun', '☀️', u.nameVi);
    } else if (u.type === 'moon') {
      zoomToObject(target, 2.0);
      showInfoPanel(u.data);
      updateDropdownSelection('moon', '🌙', u.nameVi);
    } else if (u.type === 'spacecraft') {
      zoomToObject(target, u.id === 'iss' ? 2.5 : 4.5);
      showInfoPanel(u.data);
      updateDropdownSelection(u.id, u.icon, u.nameVi);
    } else {
      const p = u.data;
      const zoomDist = p.hasRings ? p.radius * 3.5 : Math.max((p.radius || 1) * 3.0, 1.8);
      zoomToObject(target, zoomDist);
      showInfoPanel(u.data);
      updateDropdownSelection(u.id, u.icon, u.nameVi);
    }
  }

  renderer.domElement.addEventListener('mousemove', (e) => {
    if (document.body.classList.contains('immersive-view')) return;
    const targetObj = targetAt(e.clientX, e.clientY);
    if (targetObj) {
      const u = targetObj.userData;
      renderer.domElement.style.cursor = 'pointer';
      if (tooltip) {
        tooltip.style.display = displayPreferences.showTooltips ? 'block' : 'none';
        tooltip.style.left = (e.clientX + 16) + 'px';
        tooltip.style.top = (e.clientY + 16) + 'px';
        tooltip.textContent = (u.icon ? u.icon + ' ' : '') + u.nameVi + (u.nameEn ? ' — ' + u.nameEn : '');
      }
      if (lastHighlightedOrbit && lastHighlightedOrbit !== u.id) {
        highlightOrbit(lastHighlightedOrbit, false);
      }
      highlightOrbit(u.id, true);
      lastHighlightedOrbit = u.id;
      return;
    }

    if (lastHighlightedOrbit && (!selectedObject || selectedObject.userData.id !== lastHighlightedOrbit)) {
      highlightOrbit(lastHighlightedOrbit, false);
      lastHighlightedOrbit = null;
    }
    if (tooltip) {
      tooltip.style.display = 'none';
      tooltip.textContent = '';
    }
    renderer.domElement.style.cursor = 'grab';
  });

  let pointerStart = null;
  let dragged = false;
  const pointers = new Set();
  renderer.domElement.addEventListener('pointerdown', event => {
    if (pointers.size === 0) dragged = false;
    pointers.add(event.pointerId);
    if (pointers.size > 1) dragged = true;
    pointerStart = { id: event.pointerId, x: event.clientX, y: event.clientY };
  });
  renderer.domElement.addEventListener('pointermove', event => {
    if (pointerStart?.id === event.pointerId &&
        Math.hypot(event.clientX - pointerStart.x, event.clientY - pointerStart.y) > 12) dragged = true;
  });
  const endPointer = event => { pointers.delete(event.pointerId); };
  renderer.domElement.addEventListener('pointerup', endPointer);
  renderer.domElement.addEventListener('pointercancel', endPointer);
  renderer.domElement.addEventListener('click', event => {
    if (!dragged && !document.body.classList.contains('immersive-view')) selectTarget(targetAt(event.clientX, event.clientY));
    dragged = false;
  });

  const backBtn = document.getElementById('back-btn');
  if (backBtn) backBtn.addEventListener('click', zoomOut);

  window.addEventListener('keydown', (e) => {
    if (e.key !== 'Escape') return;
    if (settingsController.panel?.classList.contains('open')) settingsController.close();
    else if (isZoomed) zoomOut();
  });

  setupDropdown();
  setupDatePicker(() => setSpeedUI(0));

  // Scale Mode Toggle (Visual vs True Scale)
  const toggleScaleBtn = document.getElementById('toggle-scale');
  if (toggleScaleBtn) {
    toggleScaleBtn.addEventListener('click', () => {
      const newMode = currentScaleMode === SCALE_MODES.VISUAL ? SCALE_MODES.TRUE : SCALE_MODES.VISUAL;
      setScaleMode(newMode);
      if (newMode === SCALE_MODES.VISUAL) {
        toggleScaleBtn.innerHTML = '🔭 Trực quan';
        toggleScaleBtn.classList.add('active');
      } else {
        toggleScaleBtn.innerHTML = '📐 Tỉ lệ thực';
        toggleScaleBtn.classList.remove('active');
      }
      if (selectedObject) zoomToObject(selectedObject, selectedObject.userData.viewDistance ?? Math.max((selectedObject.userData.radius || 1) * 3.5, 1.8));
      viewTools.showScaleNote();
    });
  }

  // Discrete slider stops keep the slower values easy to select.
  const speedSteps = [0.1, 0.25, 0.5, 1, 5, 10, 20, 50, 100];
  const speedSlider = document.getElementById('speed-slider');
  const speedLabel = document.getElementById('speed-label');
  const pauseButton = document.getElementById('speed-pause');
  const speedMenus = {
    decrease: document.getElementById('speed-decrease-menu'),
    increase: document.getElementById('speed-increase-menu')
  };
  let currentSpeed = 1;
  let resumeSpeed = 1;

  function closeSpeedMenus() {
    Object.entries(speedMenus).forEach(([kind, menu]) => {
      menu?.classList.remove('open');
      document.getElementById(`speed-${kind}`)?.setAttribute('aria-expanded', 'false');
    });
  }

  function setSpeedUI(value) {
    const speed = Number(value);
    if (!Number.isFinite(speed) || speed < 0) return;
    currentSpeed = speed;
    if (speed > 0) resumeSpeed = speed;
    if (speedSlider && speed > 0) {
      speedSlider.value = String(speedSteps.indexOf(speed) >= 0 ? speedSteps.indexOf(speed) : 3);
    }
    speedSlider?.setAttribute('aria-valuetext', speed === 0 ? 'Đã dừng' : `${String(speed).replace('.', ',')} lần`);
    if (speedLabel) speedLabel.textContent = `${String(speed).replace('.', ',')}×`;
    if (pauseButton) {
      pauseButton.textContent = speed === 0 ? '▶ Tiếp tục' : '⏸ Dừng';
      pauseButton.setAttribute('aria-label', speed === 0 ? 'Tiếp tục mô phỏng' : 'Dừng mô phỏng');
      pauseButton.classList.toggle('active', speed === 0);
    }
    document.querySelectorAll('.speed-menu [data-speed]').forEach(button => {
      button.classList.toggle('active', Number(button.dataset.speed) === speed);
    });
    onSpeedChange?.(speed);
  }

  pauseButton?.addEventListener('click', () => setSpeedUI(currentSpeed === 0 ? resumeSpeed : 0));
  for (const kind of ['decrease', 'increase']) {
    const button = document.getElementById(`speed-${kind}`);
    const menu = speedMenus[kind];
    button?.addEventListener('click', event => {
      event.stopPropagation();
      const opening = !menu.classList.contains('open');
      closeSpeedMenus();
      if (!opening) return;
      menu.classList.add('open');
      menu.style.left = `${Math.max(12, Math.min(button.getBoundingClientRect().left, window.innerWidth - menu.offsetWidth - 12))}px`;
      button.setAttribute('aria-expanded', 'true');
    });
    menu?.querySelectorAll('[data-speed]').forEach(option => {
      option.addEventListener('click', () => {
        setSpeedUI(Number(option.dataset.speed));
        closeSpeedMenus();
      });
    });
  }
  document.addEventListener('click', event => {
    if (!event.target.closest('.speed-menu, #speed-decrease, #speed-increase')) closeSpeedMenus();
  });
  window.addEventListener('keydown', event => {
    if (event.key === 'Escape') closeSpeedMenus();
  });
  speedSlider?.addEventListener('input', () => {
    setSpeedUI(speedSteps[Number(speedSlider.value)]);
  });
  setSpeedUI(1);

  // Toggles
  const toggleOrbits = document.getElementById('toggle-orbits');
  if (toggleOrbits) {
    toggleOrbits.addEventListener('click', () => {
      settingsController.updateSetting('showOrbits', !displayPreferences.showOrbits);
    });
  }
  document.getElementById('toggle-labels')?.addEventListener('click', () => {
    settingsController.updateSetting('showLabels', !displayPreferences.showLabels);
  });

  const toggleAudioBtn = document.getElementById('toggle-audio');
  if (toggleAudioBtn) {
    toggleAudioBtn.addEventListener('click', toggleAudio);
  }

  // Scale Comparison Button
  const toggleCompareBtn = document.getElementById('toggle-compare');
  if (toggleCompareBtn) {
    toggleCompareBtn.addEventListener('click', () => {
      const nextActive = !isScaleComparisonActive;
      setScaleComparisonMode(nextActive);
      toggleCompareBtn.classList.toggle('active', nextActive);

      const banner = document.getElementById('comparison-banner');
      if (nextActive) {
        if (banner) banner.classList.add('active');
        // Leave a focused planet before framing the lineup. Otherwise the
        // animation loop keeps following it and the info panel covers the view.
        const wasZoomed = isZoomed;
        compareCameraState.pos = wasZoomed && savedCameraState.pos
          ? savedCameraState.pos.clone() : camera.position.clone();
        compareCameraState.target = wasZoomed && savedCameraState.target
          ? savedCameraState.target.clone() : controls.target.clone();
        if (wasZoomed) zoomOut();
        if (isChaseCamActive) toggleChaseCam();
        if (isTourActive) stopAutoTour();
        cameraTween = {
          startPos: camera.position.clone(),
          endPos: window.innerWidth <= 860 ? new THREE.Vector3(0, 35, 400) : new THREE.Vector3(0, 30, 205),
          startTarget: controls.target.clone(),
          endTarget: new THREE.Vector3(0, 0, 0),
          progress: 0,
          duration: 1.2
        };
      } else {
        if (banner) banner.classList.remove('active');
        const endPos = compareCameraState.pos ? compareCameraState.pos.clone() : new THREE.Vector3(65, 85, 160);
        const endTarget = compareCameraState.target ? compareCameraState.target.clone() : new THREE.Vector3(0, 0, 0);
        cameraTween = {
          startPos: camera.position.clone(),
          endPos: endPos,
          startTarget: controls.target.clone(),
          endTarget: endTarget,
          progress: 0,
          duration: 1.2
        };
      }
    });
  }

  // Stop tour if user manually drags camera
  controls.addEventListener('start', () => {
    if (isTourActive) stopAutoTour();
    if (isChaseCamActive) toggleChaseCam();
  });
}

// ============================================================
//  CINEMATIC CHASE CAMERA & AUTOMATED SYSTEM TOUR
// ============================================================
export let isChaseCamActive = false;

export function toggleChaseCam() {
  if (!isChaseCamActive && isTourActive) stopAutoTour();
  if (!selectedObject) {
    const earthMesh = planetMeshes.find(m => m.userData.id === 'earth');
    if (earthMesh) {
      zoomToObject(earthMesh, 8.0);
      showInfoPanel(earthMesh.userData.data);
      updateDropdownSelection('earth', earthMesh.userData.icon, earthMesh.userData.nameVi);
    }
  }
  isChaseCamActive = !isChaseCamActive;
  const btn = document.getElementById('toggle-chase');
  if (btn) btn.classList.toggle('active', isChaseCamActive);
}

export function updateChaseCam(delta) {
  if (!isChaseCamActive || !selectedObject) return;
  const worldPos = new THREE.Vector3();
  selectedObject.getWorldPosition(worldPos);

  const rad = selectedObject.userData.radius || 2.0;
  const camDist = rad * 3.8 + 2.5;

  const toSun = worldPos.clone().normalize();
  const tangent = new THREE.Vector3(-toSun.z, 0, toSun.x);
  const desiredPos = worldPos.clone().sub(tangent.multiplyScalar(camDist)).add(new THREE.Vector3(0, camDist * 0.45, 0));

  camera.position.lerp(desiredPos, 0.06);
  controls.target.lerp(worldPos, 0.1);
}

export let isTourActive = false;
let tourStepIndex = 0;
let tourTimer = 0;

const TOUR_STOPS = [
  { id: 'sun', dist: 45, duration: 5.5, title: '☀️ Mặt Trời (Sol)', desc: 'Trái tim của hệ hành tinh, chiếm 99.86% toàn bộ khối lượng hệ' },
  { id: 'mercury', dist: 3.2, duration: 4.5, title: '☿ Sao Thủy (Mercury)', desc: 'Hành tinh nhỏ nhất và gần Mặt Trời nhất, bề mặt phủ đầy hố va chạm' },
  { id: 'venus', dist: 4.2, duration: 4.5, title: '♀ Sao Kim (Venus)', desc: 'Nhiệt độ 462°C do hiệu ứng nhà kính cực độ của khí quyển CO₂ dày đặc' },
  { id: 'earth', dist: 5.2, duration: 5.5, title: '🌍 Trái Đất (Earth)', desc: 'Hành tinh xanh — cái nôi duy nhất của sự sống được biết đến trong vũ trụ' },
  { id: 'iss', dist: 2.2, duration: 4.5, title: '🛰️ Trạm Vũ Trụ ISS', desc: 'Phòng thí nghiệm vi trọng lực bay quanh Trái Đất ở vận tốc 27.600 km/h' },
  { id: 'mars', dist: 3.6, duration: 5.0, title: '🔴 Sao Hỏa (Mars)', desc: 'Hành tinh Đỏ với núi lửa Olympus Mons cao 22 km và hẻm núi Valles Marineris' },
  { id: 'halley', dist: 4.5, duration: 5.5, title: '☄️ Sao Chổi Halley', desc: 'Sao chổi chu kỳ 76 năm với hai dải đuôi ion xanh neon và bụi vàng dài hàng triệu km' },
  { id: 'jupiter', dist: 16.0, duration: 5.5, title: '🟤 Sao Mộc (Jupiter)', desc: 'Chúa tể các hành tinh cùng Vết Đỏ Lớn và đại dương ngầm Europa' },
  { id: 'saturn', dist: 15.0, duration: 6.0, title: '🪐 Sao Thổ (Saturn)', desc: 'Hệ thống vành đai băng tráng lệ và bóng đổ thực tế tuyệt đẹp' },
  { id: 'voyager1', dist: 5.5, duration: 6.0, title: '🛰️ Tàu Voyager 1', desc: 'Tàu thám hiểm nhân tạo bay xa nhất, đang tiến vào không gian giữa các vì sao' }
];

export function startAutoTour() {
  if (isChaseCamActive) toggleChaseCam();
  isTourActive = true;
  tourStepIndex = 0;
  tourTimer = 0;
  const btn = document.getElementById('toggle-tour');
  if (btn) btn.classList.add('active');
  executeTourStep();
}

export function stopAutoTour() {
  if (!isTourActive) return;
  isTourActive = false;
  const btn = document.getElementById('toggle-tour');
  if (btn) btn.classList.remove('active');
  const card = document.getElementById('tour-card');
  if (card) card.classList.remove('active');
}

function executeTourStep() {
  if (!isTourActive) return;
  if (tourStepIndex >= TOUR_STOPS.length) {
    tourStepIndex = 0;
  }
  const stop = TOUR_STOPS[tourStepIndex];

  let targetMesh = null;
  if (stop.id === 'sun') targetMesh = sunMesh;
  else if (stop.id === 'iss') targetMesh = issMeshRef;
  else if (stop.id === 'halley') targetMesh = halleyMeshRef;
  else if (stop.id === 'voyager1') targetMesh = voyager1Group;
  else targetMesh = planetMeshes.find(m => m.userData.id === stop.id);

  if (targetMesh) {
    zoomToObject(targetMesh, stop.dist);
    if (targetMesh.userData && targetMesh.userData.data) {
      showInfoPanel(targetMesh.userData.data);
    }
    showTourCard(stop.title, stop.desc, tourStepIndex + 1, TOUR_STOPS.length);
  }
}

function showTourCard(title, desc, current, total) {
  let card = document.getElementById('tour-card');
  if (!card) {
    card = document.createElement('div');
    card.id = 'tour-card';
    document.body.appendChild(card);
  }
  card.innerHTML = `
    <div class="tour-badge">🎬 THAM QUAN HỆ MẶT TRỜI (${current}/${total})</div>
    <div class="tour-title">${title}</div>
    <div class="tour-desc">${desc}</div>
  `;
  card.classList.add('active');
}

export function updateAutoTour(delta) {
  if (!isTourActive) return;
  tourTimer += delta;
  const currentStop = TOUR_STOPS[tourStepIndex];
  if (currentStop && tourTimer >= currentStop.duration) {
    tourTimer = 0;
    tourStepIndex++;
    executeTourStep();
  }
}



function renderCutawayInfo(struct) {
  const content = document.getElementById('panel-content');
  if (!content) return;

  const existingCutaway = content.querySelector('.cutaway-info-box');
  if (existingCutaway) existingCutaway.remove();

  const box = document.createElement('div');
  box.className = 'info-section cutaway-info-box';
  box.innerHTML = `
    <div class="info-section-title" style="color:#f59e0b;">🔪 CẤU TRÚC ĐỊA CHẤT LÕI (3D CUTAWAY)</div>
    <div style="font-size:0.8rem;color:#94a3b8;margin-bottom:12px;">Đang mở mặt cắt 90° để quan sát các tầng vật chất bên trong:</div>
  `;

  struct.layers.forEach(layer => {
    const layerItem = document.createElement('div');
    layerItem.style.cssText = 'background:rgba(255,255,255,0.04);border-left:3px solid ' + layer.color + ';border-radius:6px;padding:8px 12px;margin-bottom:8px;';
    layerItem.innerHTML = `
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:4px;">
        <span style="font-weight:600;font-size:0.85rem;color:#f1f5f9;">${layer.name}</span>
        <span style="font-size:0.75rem;color:#fbbf24;font-family:'Be Vietnam Pro',sans-serif;">${layer.temp}</span>
      </div>
      <div style="font-size:0.78rem;color:#cbd5e1;line-height:1.4;">${layer.desc}</div>
    `;
    box.appendChild(layerItem);
  });

  content.insertBefore(box, content.firstChild);
}
