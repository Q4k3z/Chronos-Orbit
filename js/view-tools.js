import { describeScale } from './scale-guide.js';
import { setupFullscreen } from './fullscreen.js';
import { t, language, onLanguageChange } from './i18n.js';
import { isCompactLayout } from './layout.js';

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
  const openGuide = () => { if (!dialog.open && !document.body.classList.contains('immersive-view')) dialog.showModal(); };
  document.getElementById('view-help')?.addEventListener('click', openGuide);
  closeGuide?.addEventListener('click', () => dialog.close());
  dialog?.addEventListener('close', () => {
    try { localStorage.setItem(GUIDE_KEY, 'seen'); } catch (_) { /* Optional storage. */ }
  });
  const offerGuide = () => {
    let seen = false;
    try { seen = localStorage.getItem(GUIDE_KEY) === 'seen'; } catch (_) { /* Show once per visit. */ }
    const hint = document.getElementById('mobile-onboarding');
    if (hint) hint.hidden = !isCompactLayout() || seen;
  };
  document.getElementById('mobile-onboarding-close')?.addEventListener('click', () => {
    document.getElementById('mobile-onboarding').hidden = true;
    try { localStorage.setItem(GUIDE_KEY, 'seen'); } catch (_) { /* Optional storage. */ }
  });
  offerGuide();
  window.addEventListener('chronos:layout-changed', offerGuide);

  function refreshCollapse() {
    const collapsed = document.body.classList.contains('info-collapsed');
    collapse.textContent = collapsed ? '⌃' : '⌄';
    collapse.setAttribute('aria-expanded', String(!collapsed));
    collapse.setAttribute('aria-label', t(collapsed ? 'Mở rộng thông tin' : 'Thu gọn thông tin'));
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
    const explanation = describeScale(mode, body, language);
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
  onLanguageChange(() => { refreshCollapse(); if (!note.hidden) showScaleNote(); });
  return { refreshCollapse, showScaleNote, hideScaleNote };
}
