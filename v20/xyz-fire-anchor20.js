                                                                                  
(() => {
  'use strict';
  const cache = new Map();
  const byId = id => document.getElementById(id);
  const clamp = (value, lo, hi) => Math.max(lo, Math.min(hi, value));
  const defaults = { anchored: false, scale: 1, offset: [0, 0, 0] };
  function settings(value = {}) {
    return {
      anchored: !!value.anchored,
      scale: clamp(Number(value.scale) || 1, .1, 4),
      offset: [0, 1, 2].map(i => clamp(Number(value.offset?.[i]) || 0, -1000000, 1000000))
    };
  }
  function capture() {
    return settings({
      anchored: byId('fireFollow20')?.checked,
      scale: byId('fireFollowScale20')?.value,
      offset: ['X', 'Y', 'Z'].map(axis => byId('fireFollow' + axis + '20')?.value)
    });
  }
  function restore(value) {
    const state = settings(value);
    if (!byId('fireFollow20')) return;
    byId('fireFollow20').checked = state.anchored;
    byId('fireFollowScale20').value = state.scale;
    ['X', 'Y', 'Z'].forEach((axis, i) => byId('fireFollow' + axis + '20').value = state.offset[i]);
    byId('fireFollowControls20').hidden = !state.anchored;
  }
  function bind() {
    byId('fireFollow20')?.addEventListener('change', () => restore(capture()));
  }
  function validBounds(bounds) {
    return bounds && ['min', 'max'].every(key => Array.isArray(bounds[key]) &&
      bounds[key].length === 3 && bounds[key].every(Number.isFinite)) &&
      bounds.max.every((n, i) => n >= bounds.min[i]);
  }
                                                                                  
  async function readBounds(url) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 5000);
    let reader;
    try {
      const response = await fetch(url, {
        headers: { Range: 'bytes=0-1048575' },
        signal: controller.signal
      });
      if (!response.ok || !response.body) return null;
      reader = response.body.getReader();
      let bytes = new Uint8Array(0), layout;
      while (bytes.length < 1048576) {
        const part = await reader.read();
        if (part.done) break;
        const data = part.value.subarray(0, 1048576 - bytes.length);
        const joined = new Uint8Array(bytes.length + data.length);
        joined.set(bytes); joined.set(data, bytes.length); bytes = joined;
        if (!layout) {
          const header = new TextDecoder('ascii').decode(bytes.subarray(0, 131072));
          const end = /end_header\r?\n/.exec(header);
          if (!end) { if (bytes.length >= 131072) return null; continue; }
          if (!header.includes('format binary_little_endian 1.0')) return null;
          const elements = [];
          for (const line of header.slice(0, end.index).split(/\r?\n/)) {
            const words = line.trim().split(/\s+/);
            if (words[0] === 'element') elements.push({ name: words[1], count: Number(words[2]), props: [] });
            if (words[0] === 'property') elements.at(-1)?.props.push(words.slice(1));
          }
          const chunk = elements[0];
          if (chunk?.name !== 'chunk' || !Number.isInteger(chunk.count) || chunk.count < 1 ||
              chunk.props.some(p => !['float', 'float32'].includes(p[0]))) return null;
          const names = chunk.props.map(p => p[1]);
          const offsets = ['min_x', 'min_y', 'min_z', 'max_x', 'max_y', 'max_z'].map(n => names.indexOf(n) * 4);
          if (offsets.some(n => n < 0)) return null;
          layout = { start: end.index + end[0].length, stride: names.length * 4, count: chunk.count, offsets };
          if (layout.start + layout.stride * layout.count > 1048576) return null;
        }
        if (bytes.length >= layout.start + layout.stride * layout.count) {
          const view = new DataView(bytes.buffer);
          const bounds = { min: [Infinity, Infinity, Infinity], max: [-Infinity, -Infinity, -Infinity] };
          for (let i = 0; i < layout.count; i++) for (let d = 0; d < 3; d++) {
            const start = layout.start + i * layout.stride;
            bounds.min[d] = Math.min(bounds.min[d], view.getFloat32(start + layout.offsets[d], true));
            bounds.max[d] = Math.max(bounds.max[d], view.getFloat32(start + layout.offsets[d + 3], true));
          }
          return validBounds(bounds) ? bounds : null;
        }
      }
      return null;
    } catch { return null; }
    finally { clearTimeout(timer); if (reader) await reader.cancel().catch(() => {}); controller.abort(); }
  }
  function boundsFor(model, supplied) {
    if (validBounds(supplied)) return supplied;
    if (!model) return null;
    if (!cache.has(model)) {
      const entry = { bounds: null };
      cache.set(model, entry);
      readBounds(model).then(bounds => entry.bounds = bounds);
    }
    return cache.get(model).bounds;
  }
  function worldPoint(matrix, point) {
    const p = [0, 1, 2].map(i => matrix[i] * point[0] + matrix[i + 4] * point[1] +
      matrix[i + 8] * point[2] + matrix[i + 12]);
                                                                                 
                                                  
    return [p[2], p[1], -p[0]];
  }
  function projection(engine, camera, width, height) {
    const focal = height / (2 * Math.tan(35 * Math.PI / 180));
    const dot = (a, b) => a[0] * b.x + a[1] * b.y + a[2] * b.z;
    return point => {
      const relative = point.map((n, i) => n - camera.cam['xyz'[i]]);
      const depth = dot(relative, camera.f);
      if (!Number.isFinite(depth) || depth <= .01) return null;
      if (engine.actions?.spacetosphere && engine.actions?.spheretoscreen) {
        const direction = engine.actions.spacetosphere(...relative);
        const point = engine.actions.spheretoscreen(direction.h, direction.v);
        if (!point || !Number.isFinite(point.x) || !Number.isFinite(point.y)) return null;
        return { x: point.x, y: point.y, depth };
      }
      return { x: width * .5 - dot(relative, camera.right) * focal / depth,
        y: height * .5 + dot(relative, camera.up) * focal / depth, depth };
    };
  }
  function modelCenter(box) {
    return box ? box.min.map((n, i) => (n + box.max[i]) * .5) : [0, 0, 0];
  }
  function projectCenter(engine, camera, bounds, model, width, height) {
    const matrix = engine?.get('image.splats.mx');
    if (!matrix || matrix.length !== 16 || !camera) return null;
    const center = modelCenter(boundsFor(model, bounds));
    return projection(engine, camera, width, height)(worldPoint(matrix, center));
  }
  function project(engine, camera, value, bounds, model, power, width, height) {
    const state = settings(value);
    if (!state.anchored || !engine || !camera) return null;
    const box = boundsFor(model, bounds);
    const matrix = engine.get('image.splats.mx');
    if (!matrix || matrix.length !== 16) return null;
    const origin = worldPoint(matrix, modelCenter(box).map((n, i) => n + state.offset[i]));
    const screen = projection(engine, camera, width, height);
    const anchor = screen(origin);
    if (!anchor) return null;
    let extent;
    if (box) {
      const points = [];
      for (let mask = 0; mask < 8; mask++) {
        const point = [0, 1, 2].map(i => box[(mask & (1 << i)) ? 'max' : 'min'][i] + state.offset[i]);
        const projected = screen(worldPoint(matrix, point));
        if (projected) points.push(projected);
      }
      if (points.length !== 8) return null;
      extent = Math.max(...['x', 'y'].map(key => Math.max(...points.map(p => p[key])) - Math.min(...points.map(p => p[key]))));
    } else {
      const scale = Math.hypot(matrix[0], matrix[1], matrix[2]);
      extent = scale * height / (2 * Math.tan(35 * Math.PI / 180) * anchor.depth);
    }
    const oldWidth = 2 * Math.min(width * .22, 150 + power * 55) + 140;
    const status = byId('fireFollowStatus20');
    const message = box ? 'Якорь — центр габаритов модели' : 'Габариты недоступны: якорь в начале PLY. Подстройте X/Y/Z.';
    if (status && status.textContent !== message) status.textContent = message;
    return { x: anchor.x, y: anchor.y, zoom: clamp(extent / oldWidth * state.scale, .005, 6),
      geometricCenter: !!box, world: origin };
  }
  window.xyzScreenFire20 = { capture, restore, bind, project, projectCenter, boundsFor, settings, readBounds };
})();
