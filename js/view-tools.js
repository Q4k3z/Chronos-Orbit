import { describeScale } from './scale-guide.js';
import { setupFullscreen } from './fullscreen.js';

const GUIDE_KEY = new URLSearchParams(window.location.search).get('test') === '1'
  ? 'astra-test-touch-guide-v1' : 'astra-touch-guide-v1';

export function setupViewTools({ zoom, reset, onLayoutChange, onImmersiveChange, getScale }) {
  setupFullscreen({ onLayoutChange, onImmersiveChange });
  const dialog = document.getElementById('gesture-guide');
  const closeGuide = document.getElementById('gesture-guide-close');
  const collapse = document.getElementById('info-collapse');
  const note = document.getElementById('scale-note');
  let noteTimeout;

  document.getElementById('view-zoom-in')?.addEventListener('click', () => zoom(0.8));
  document.getElementById('view-zoom-out')?.addEventListener('click', () => zoom(1.25));
  document.getElementById('view-reset')?.addEventListener('click', reset);
  const openGuide = () => { if (!dialog.open) dialog.showModal(); };
  document.getElementById('view-help')?.addEventListener('click', openGuide);
  closeGuide?.addEventListener('click', () => dialog.close());
  dialog?.addEventListener('close', () => {
    try { localStorage.setItem(GUIDE_KEY, 'seen'); } catch (_) { /* Optional storage. */ }
  });
  const offerGuide = () => {
    let seen = false;
    try { seen = localStorage.getItem(GUIDE_KEY) === 'seen'; } catch (_) { /* Show once per visit. */ }
    if (window.innerWidth <= 1100 && !seen) openGuide();
  };
  offerGuide();
  window.matchMedia('(max-width: 1100px)').addEventListener('change', offerGuide);

  function refreshCollapse() {
    const collapsed = document.body.classList.contains('info-collapsed');
    collapse.textContent = collapsed ? '⌃' : '⌄';
    collapse.setAttribute('aria-expanded', String(!collapsed));
    collapse.setAttribute('aria-label', collapsed ? 'Mở rộng thông tin' : 'Thu gọn thông tin');
  }
  collapse?.addEventListener('click', () => {
    document.body.classList.toggle('info-collapsed');
    refreshCollapse();
    onLayoutChange();
  });

  function hideScaleNote() {
    clearTimeout(noteTimeout);
    note.hidden = true;
  }
  document.getElementById('scale-note-close')?.addEventListener('click', hideScaleNote);
  function showScaleNote() {
    const { mode, body } = getScale();
    const explanation = describeScale(mode, body);
    document.getElementById('scale-note-title').textContent = explanation.title;
    document.getElementById('scale-note-description').textContent = explanation.description;
    const facts = document.getElementById('scale-note-facts');
    facts.replaceChildren(...explanation.facts.map(text => {
      const item = document.createElement('li');
      item.textContent = text;
      return item;
    }));
    note.hidden = false;
    clearTimeout(noteTimeout);
    noteTimeout = setTimeout(hideScaleNote, 14000);
  }
  document.getElementById('scale-help')?.addEventListener('click', showScaleNote);
  refreshCollapse();
  return { refreshCollapse, showScaleNote, hideScaleNote };
}
