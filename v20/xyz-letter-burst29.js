                                                                                         
window.xyzLetterBurst29 = (() => {
  'use strict';
  const outlines = [
    [[-5,-7],[-2,-7],[0,-3],[2,-7],[5,-7],[2,0],[5,7],[2,7],[0,3],[-2,7],[-5,7],[-2,0]],
    [[-5,-7],[-2,-7],[0,-2],[2,-7],[5,-7],[1.5,1],[1.5,7],[-1.5,7],[-1.5,1]],
    [[-5,-7],[5,-7],[5,-4],[-1,4],[5,4],[5,7],[-5,7],[-5,4],[1,-4],[-5,-4]]
  ];
  const meshes = outlines.map(outline => {
    const n = outline.length;
    const face = outline.map((_, i) => i);
    return {
      points: [1.6, -1.6].flatMap(z => outline.map(([x,y]) => [x/14,y/14,z/14])),
      faces: [face, face.map(i => 2*n-1-i), ...face.map(i => {
        const j = (i+1)%n;
        return [j,i,i+n,j+n];
      })]
    };
  });
  const materials = {
    chrome: ['#f2fbff','#8dabc4','#30394c','#ffffff','#7594b1'],
    steel: ['#e0e5eb','#9aa4af','#596471','#c3cdd7','#77828e'],
    gold: ['#fff5c5','#e7ae42','#785020','#ffe59b','#b77a2d']
  };
  const rgb = ['#ff3e4d','#42ef88','#42a5ff'];
  let canvas = null;
  let frame = 0;

  function bounded(value, fallback, min, max) {
    return Number.isFinite(Number(value)) ? Math.max(min, Math.min(max, Number(value))) : fallback;
  }

  function settings(raw = {}) {
    return {
      layout: ['letters','group','mixed'].includes(raw?.layout) ? raw.layout : 'mixed',
      size: bounded(raw?.size, 1, .4, 2.5),
      material: ['chrome','steel','gold','rgb','custom'].includes(raw?.material) ? raw.material : 'chrome',
      color: /^#[0-9a-f]{6}$/i.test(raw?.color) ? raw.color : '#44cfff',
      power: bounded(raw?.power, 1, .2, 3),
      radius: bounded(raw?.radius, 100, 1, 1500),
      speed: bounded(raw?.speed, 1, .25, 4)
    };
  }

  function stop() {
    cancelAnimationFrame(frame);
    frame = 0;
    canvas?.remove();
    canvas = null;
  }

  function start(raw, {anchor, onEnd} = {}) {
    stop();
    const target = document.getElementById('pano');
    if (!target || typeof anchor !== 'function') return false;
    const layer = document.createElement('canvas');
    const ctx = layer.getContext('2d');
    if (!ctx) return false;
    const config = settings(raw);
    const light = matchMedia('(pointer: coarse), (max-width: 700px)').matches;
                                                                              
    const glyphBudget = light ? 24 : 45;
    const glyphsPerParticle = config.layout === 'group' ? 3 : config.layout === 'mixed' ? 5/3 : 1;
    const count = Math.min(light ? 12 : 27, Math.floor(glyphBudget/glyphsPerParticle));
    const particles = Array.from({length:count}, (_, i) => {
      const grouped = config.layout === 'group' || (config.layout === 'mixed' && i%3 === 0);
      return {
        glyphs: grouped ? [0,1,2] : [config.layout === 'mixed' ? (i-Math.floor(i/3)-1)%3 : i%3],
        angle: i*2.39996 + Math.random()*.3,
        travel: .35 + Math.random()*.65,
        depth: Math.random()*.9-.45,
        spin: (Math.random() < .5 ? -1 : 1) * (.5+Math.random()),
        size: .72 + Math.random()*.52
      };
    });
    canvas = layer;
    canvas.id = 'xyzLetterBurstCanvas29';
    canvas.setAttribute('aria-hidden','true');
    canvas.style.cssText = 'position:absolute;inset:0;width:100%;height:100%;pointer-events:none;z-index:4';
    target.appendChild(canvas);
    const begin = performance.now();
    const duration = 3200/config.speed;
    const dpr = Math.min(devicePixelRatio || 1, light ? 1 : 1.5);
    const kick = (config.power - 1) * .22;
    const palette = materials[config.material];
    const colors = config.material === 'rgb' ? rgb : [config.color, config.color, config.color];
    const fronts = colors.map(color => palette || ['#ffffff',color,color+'bb',color,color+'dd']);
    const sides = colors.map(color => palette ? palette[2] : color+'9e');

    function draw(now) {
      const t = (now-begin)/duration;
      if (t >= 1) {
        stop();
        onEnd?.();
        return;
      }
      frame = requestAnimationFrame(draw);
      const w = target.clientWidth, h = target.clientHeight;
      if (!w || !h) return;
      const cw = Math.round(w*dpr), ch = Math.round(h*dpr);
      if (layer.width !== cw || layer.height !== ch) {
        layer.width = cw;
        layer.height = ch;
      }
      ctx.setTransform(dpr,0,0,dpr,0,0);
      ctx.clearRect(0,0,w,h);
      const span = Math.min(w,h);
      const focal = h/(2*Math.tan(35*Math.PI/180));
      const center = anchor(w,h);
      if (!center) return;
                                                               
      const progress = t * (1 + kick * (1-t));
      const spread = span*.39 * Math.log1p(config.radius/100)/Math.LN2;
      const faces = [];
      for (const p of particles) {
        const scale = span * .078 * config.size * p.size * (.4+.6*progress);
        const yaw = p.spin * (t*5 + .45), pitch = .34*Math.sin(t*7+p.angle);
        const roll = .4*Math.sin(t*5*p.spin+p.angle);
        const cy = Math.cos(yaw), sy = Math.sin(yaw), cx = Math.cos(pitch), sx = Math.sin(pitch);
        const cr = Math.cos(roll), sr = Math.sin(roll);
        p.glyphs.forEach((glyph, i) => {
          const mesh = meshes[glyph];
          const points = mesh.points.map(([x,y,z]) => {
            x += (i-(p.glyphs.length-1)/2)*.86;
            const rx = x*cy + z*sy, rz = z*cy - x*sy;
            const ry = y*cx - rz*sx;
            const depth = (y*sx + rz*cx)*scale + p.depth*spread*progress;
            const zoom = focal / Math.max(focal*.35,focal-depth);
            return {
              x:center.x + ((rx*cr-ry*sr)*scale + Math.cos(p.angle)*p.travel*spread*progress)*zoom,
              y:center.y + ((rx*sr+ry*cr)*scale + Math.sin(p.angle)*p.travel*spread*progress)*zoom,
              z:depth
            };
          });
          for (const [index, face] of mesh.faces.entries()) {
            const path = face.map(i => points[i]);
                                                                                    
            const area = path.reduce((sum,a,i) => {
              const b = path[(i+1)%path.length];
              return sum + a.x*b.y - b.x*a.y;
            },0);
            if (area <= .05) continue;
            faces.push({path,glyph,side:index >= 2,depth:path.reduce((sum,p)=>sum+p.z,0)/path.length});
          }
        });
      }
      faces.sort((a,b)=>a.depth-b.depth);
      ctx.globalAlpha = Math.min(1,t*20,(1-t)*7);
      for (const {path,glyph,side} of faces) {
        if (side) {
          ctx.fillStyle = sides[glyph];
        } else {
          const ys = path.map(p=>p.y);
          const gradient = ctx.createLinearGradient(0,Math.min(...ys),0,Math.max(...ys)+.01);
          fronts[glyph].forEach((shade,i)=>gradient.addColorStop(i/4,shade));
          ctx.fillStyle = gradient;
        }
        ctx.beginPath();
        ctx.moveTo(path[0].x,path[0].y);
        for (const p of path.slice(1)) ctx.lineTo(p.x,p.y);
        ctx.closePath();
        ctx.fill();
      }
      ctx.globalAlpha = 1;
    }
    frame = requestAnimationFrame(draw);
    return true;
  }

  window.addEventListener('pagehide', stop);
  return {settings,start,stop};
})();
