export function setupFullscreen({ onLayoutChange, onImmersiveChange }) {
  const button = document.getElementById('fullscreen-toggle');
  let nativeRequested = false;
  let pending = false;
  const active = () => document.body.classList.contains('immersive-view');
  function apply(value) {
    document.body.classList.toggle('immersive-view', value);
    button.textContent = value ? '⤡' : '⤢';
    const label = value ? 'Thoát toàn màn hình' : 'Toàn màn hình, ẩn giao diện';
    button.setAttribute('aria-label', label);
    button.setAttribute('aria-pressed', String(value));
    button.title = label;
    if (value) {
      const guide = document.getElementById('gesture-guide');
      if (guide?.open) guide.close();
    }
    onImmersiveChange(value);
    onLayoutChange();
  }
  async function leave() {
    apply(false);
    if (document.fullscreenElement === document.documentElement) {
      try { await document.exitFullscreen(); } catch (_) { /* UI is already restored. */ }
    }
    nativeRequested = false;
  }
  button.addEventListener('click', async () => {
    if (pending) return;
    if (active()) { await leave(); return; }
    pending = true;
    apply(true);
    try {
      if (document.fullscreenEnabled && document.documentElement.requestFullscreen) {
        await document.documentElement.requestFullscreen();
        nativeRequested = true;
      }
    } catch (_) { /* Unsupported or embedded browsers still offer an uncluttered view. */ }
    finally { pending = false; }
  });
  document.addEventListener('fullscreenchange', () => {
    if (!document.fullscreenElement && nativeRequested) {
      nativeRequested = false;
      apply(false);
    }
    onLayoutChange();
  });
  window.addEventListener('keydown', event => {
    if (event.key === 'Escape' && active()) {
      event.preventDefault(); event.stopImmediatePropagation(); leave();
    }
  }, true);
}
