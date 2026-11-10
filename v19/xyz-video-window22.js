                                                                           
(() => {
  'use strict';
  const panel = document.getElementById('videoFloat') || document.getElementById('videoBox');
  const handle = document.getElementById('videoDrag') || document.getElementById('videoDrag22');
  if (!panel || !handle) return;
  let gesture = null;
  const expanded = () => panel.classList.contains('video-expanded52');
  function place(left, top) {
    const maxX = Math.max(0, innerWidth - panel.offsetWidth);
    const maxY = Math.max(0, innerHeight - panel.offsetHeight);
    panel.style.left = Math.max(0, Math.min(maxX, left)) + 'px';
    panel.style.top = Math.max(0, Math.min(maxY, top)) + 'px';
    panel.style.right = 'auto';
    panel.style.bottom = 'auto';
  }
  handle.addEventListener('pointerdown', event => {
    if (expanded() || event.button !== 0 || event.target.closest('button,input,select,a')) return;
    const rect = panel.getBoundingClientRect();
    gesture = { id: event.pointerId, x: event.clientX, y: event.clientY, left: rect.left, top: rect.top };
    place(rect.left, rect.top);
    handle.setPointerCapture(event.pointerId);
    handle.classList.add('dragging-video');
    event.preventDefault();
    event.stopPropagation();
  });
  handle.addEventListener('pointermove', event => {
    if (!gesture || gesture.id !== event.pointerId) return;
    place(gesture.left + event.clientX - gesture.x, gesture.top + event.clientY - gesture.y);
    event.preventDefault();
    event.stopPropagation();
  });
  function finish(event) {
    if (!gesture || gesture.id !== event.pointerId) return;
    gesture = null;
    handle.classList.remove('dragging-video');
    if (handle.hasPointerCapture(event.pointerId)) handle.releasePointerCapture(event.pointerId);
  }
  for (const type of ['pointerup', 'pointercancel', 'lostpointercapture']) handle.addEventListener(type, finish);
  function keepInBounds() {
    if (expanded() || panel.hidden || getComputedStyle(panel).display === 'none' || !panel.style.left) return;
    const rect = panel.getBoundingClientRect();
    const maxX = Math.max(0, innerWidth - panel.offsetWidth);
    const maxY = Math.max(0, innerHeight - panel.offsetHeight);
    if (rect.left < 0 || rect.top < 0 || rect.left > maxX || rect.top > maxY) place(rect.left, rect.top);
  }
  window.addEventListener('resize', keepInBounds);
  new MutationObserver(keepInBounds).observe(panel, {attributes:true, attributeFilter:['hidden','style','class']});
  new ResizeObserver(keepInBounds).observe(panel);
})();
