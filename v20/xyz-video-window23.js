                                                                           
(() => {
  'use strict';
  const panel = document.getElementById('videoFloat') || document.getElementById('videoBox');
  const handle = document.getElementById('videoDrag') || document.getElementById('videoDrag22');
  if (!panel || !handle) return;
  const video = panel.querySelector('video');
  let compact = matchMedia('(any-pointer: coarse)').matches || Math.min(screen.width, screen.height) <= 600 || innerWidth <= 600;
  let controls = document.getElementById('videoMobileControls');
  if (!controls) {
    controls = document.createElement('div');
    controls.id = 'videoMobileControls';
    controls.innerHTML = '<button id="videoMobilePlay" type="button" aria-label="Воспроизведение / пауза">▶</button><input id="videoMobileSeek" aria-label="Перемотка видео" type="range" min="0" max="1000" step="1" value="0"><button id="videoMobileMute" type="button" aria-label="Включить / выключить звук">🔊</button>';
    panel.append(controls);
  }
  const play = controls.querySelector('#videoMobilePlay');
  const seek = controls.querySelector('#videoMobileSeek');
  const mute = controls.querySelector('#videoMobileMute');
  const expand = document.getElementById('videoExpand52');
  function compactMode() {
    compact = compact || innerWidth <= 600 || matchMedia('(any-pointer: coarse)').matches;
    panel.classList.toggle('video-compact23', compact);
    controls.style.display = compact ? 'flex' : 'none';
    video.controls = !compact;
    if (compact) {
      panel.classList.remove('video-expanded52');
      video.setAttribute('playsinline', '');
      video.setAttribute('webkit-playsinline', '');
      video.setAttribute('controlslist', 'nofullscreen nodownload noremoteplayback');
      video.disablePictureInPicture = true;
      video.disableRemotePlayback = true;
      if (expand) { expand.hidden = true; expand.textContent = '⛶'; }
    }
  }
  play.addEventListener('click', () => {
    if (video.paused) video.play().catch(() => { play.textContent = '▶'; });
    else video.pause();
  });
  function syncPlay() { play.textContent = video.paused ? '▶' : 'Ⅱ'; }
  video.addEventListener('play', syncPlay);
  video.addEventListener('pause', syncPlay);
  video.addEventListener('ended', syncPlay);
  video.addEventListener('timeupdate', () => {
    if (Number.isFinite(video.duration) && video.duration > 0) seek.value = String(Math.round(video.currentTime / video.duration * 1000));
  });
  seek.addEventListener('input', () => {
    if (Number.isFinite(video.duration) && video.duration > 0) video.currentTime = video.duration * Number(seek.value) / 1000;
  });
  mute.addEventListener('click', () => { video.muted = !video.muted; mute.textContent = video.muted ? '🔇' : '🔊'; });
  video.addEventListener('dblclick', event => { if (compact) { event.preventDefault(); event.stopPropagation(); } });
  video.addEventListener('webkitbeginfullscreen', () => { if (compact && video.webkitExitFullscreen) video.webkitExitFullscreen(); });
  document.addEventListener('fullscreenchange', () => {
    if (compact && document.fullscreenElement && panel.contains(document.fullscreenElement)) document.exitFullscreen().catch(() => {});
  });
  compactMode();
  window.addEventListener('resize', compactMode);
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
