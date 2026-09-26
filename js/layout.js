// Touch devices can request a desktop-sized layout viewport in mobile browsers.
// Keep the controls in the touch layout in that case.
export function isCompactLayout() {
  return window.innerWidth <= 1100 || window.matchMedia('(pointer: coarse)').matches;
}

export function viewportSize() {
  const container = document.getElementById('container');
  return {
    width: Math.max(1, Math.round(container?.clientWidth || window.innerWidth)),
    height: Math.max(1, Math.round(container?.clientHeight || window.innerHeight))
  };
}
