import { isCompactLayout } from './layout.js';

// Reuse the same controls and state, but place them in a dedicated mobile grid.
// There are no duplicated control IDs or parallel simulation event handlers.
const root = document.documentElement;
const shell = document.getElementById('mobile-shell');
const more = document.getElementById('mobile-more-panel');
const moreButton = document.getElementById('mobile-more-toggle');
const homes = new Map();
let mobile;
let orientation;

function move(id, destination) {
  const element = document.getElementById(id);
  if (!homes.has(element)) {
    const marker = document.createComment(`desktop:${id}`);
    element.before(marker);
    homes.set(element, marker);
  }
  document.getElementById(destination).append(element);
}
function closeMore() {
  more.hidden = true;
  moreButton.setAttribute('aria-expanded', 'false');
}
export function closeMobileOverlays() {
  closeMore();
  for (const id of ['dropdown-menu', 'dropdown-toggle', 'date-modal', 'settings-panel', 'settings-backdrop', 'speed-increase-menu', 'speed-decrease-menu']) {
    document.getElementById(id)?.classList.remove('open');
  }
  for (const id of ['open-settings', 'speed-increase', 'speed-decrease']) document.getElementById(id)?.setAttribute('aria-expanded', 'false');
  const guide = document.getElementById('gesture-guide');
  if (guide?.open) guide.close();
  document.getElementById('scale-note').hidden = true;
}
function sync() {
  const compact = isCompactLayout();
  const visual = window.visualViewport;
  const height = visual && Math.abs(visual.scale - 1) < .01 ? visual.height : window.innerHeight;
  root.style.setProperty('--app-height', `${Math.round(height)}px`);
  // The on-screen keyboard shrinks the visual viewport without rotating the device.
  const nextOrientation = window.innerWidth > window.innerHeight ? 'landscape' : 'portrait';
  if (mobile !== compact || orientation !== nextOrientation) closeMobileOverlays();
  orientation = nextOrientation;
  root.dataset.orientation = orientation;
  root.dataset.layout = compact ? 'mobile' : 'desktop';
  if (mobile === compact) return;
  mobile = compact;
  if (compact) {
    for (const id of ['dropdown-container', 'date-display', 'open-settings']) move(id, 'mobile-header');
    for (const id of ['container', 'labels-container', 'camera-tools', 'fullscreen-toggle']) move(id, 'mobile-scene');
    move('info-panel', 'mobile-detail');
    // Keep the information actions attached to their header when content scrolls.
    const header = document.querySelector('#info-panel .panel-header');
    if (!header.id) header.id = 'detail-heading';
    for (const id of ['back-btn', 'info-collapse']) move(id, 'detail-heading');
    move('controls', 'mobile-footer');
    for (const id of ['toggle-compare', 'toggle-audio', 'scale-help', 'view-help']) move(id, 'mobile-more-content');
    move('mobile-more-toggle', 'view-controls');
    moreButton.hidden = false;
    shell.hidden = false;
  } else {
    for (const [element, marker] of homes) marker.after(element);
    shell.hidden = true;
    moreButton.hidden = true;
  }
  window.dispatchEvent(new Event('chronos:layout-changed'));
}
moreButton.addEventListener('click', event => {
  event.stopPropagation();
  more.hidden = !more.hidden;
  moreButton.setAttribute('aria-expanded', String(!more.hidden));
});
more.addEventListener('click', event => { if (event.target.closest('button')) closeMore(); });
document.addEventListener('click', event => { if (!more.contains(event.target) && event.target !== moreButton) closeMore(); });
window.addEventListener('keydown', event => { if (event.key === 'Escape') closeMobileOverlays(); });
window.addEventListener('resize', sync);
window.visualViewport?.addEventListener('resize', sync);
window.matchMedia('(pointer: coarse)').addEventListener('change', sync);
sync();
