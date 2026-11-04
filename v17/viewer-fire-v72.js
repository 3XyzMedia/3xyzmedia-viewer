/* v13: spectator port of STUDIO v72 FIRE (2D and CSS3D), no editor code/UI. */
(()=>{'use strict';const V=window.XYZViewer;if(!V)return;
let k=null,opts={scale:false,threeD:false,anchor:0,base:true};
const fireCanvas=document.createElement('canvas');fireCanvas.id='fireOverlay';
Object.assign(fireCanvas.style,{position:'fixed',inset:'0',width:'100%',height:'100%',zIndex:'7',pointerEvents:'none',display:'none'});document.body.appendChild(fireCanvas);
const fireCtx=fireCanvas.getContext('2d',{alpha:true});
const effectiveQuality=()=>V.lowQuality?'low':'high';
function resizeOverlayCanvas(canvas,ctx){const dpr=Math.min(devicePixelRatio||1,V.lowQuality?.7:1.5);canvas.width=Math.round(innerWidth*dpr);canvas.height=Math.round(innerHeight*dpr);ctx.setTransform(dpr,0,0,dpr,0,0)}
function xyzFire40Base(){const get=a=>{try{return Number(k?.get('image.splats.t'+a))||0}catch{return 0}};return{x:get('x'),y:get('y'),z:get('z')}}
function xyzFire39Stop(){/* old unused hotspot particle system stays disabled */}
let bedState=null;
function sendBed(running){const state=JSON.stringify([opts.base,running]);if(bedState===state)return;let sent=false;for(const f of document.querySelectorAll('iframe'))if(f.src.includes('fire_canvas_v56.html'))f.contentWindow?.postMessage({type:'xyz-firebed-v54',enabled:opts.base,running},location.origin),sent=true;if(sent)bedState=state;}
window.addEventListener('message',e=>{if(e.origin===location.origin&&e.data?.type==='xyz-firebed-ready-v54'){bedState=null;sendBed(xyzFire44Active)}});
let fireFxActive=false, fireFxFrame=0, fireFxParticles=[], fireFxSparks=[], fireFxStart=0, fireFxDuration=0, fireFxStrength=1, fireFxSpeed=1, fireFxHeight=1, fireFxOpacity=0, fireFxScaleEnabled=false, fireFxCameraStart=200, fireFx3DEnabled=false;
function resizeFireCanvas(){resizeOverlayCanvas(fireCanvas,fireCtx)}
function spawnFireParticles(count){
  const w=innerWidth,h=innerHeight,cx=w*0.5,baseY=h*0.78,spread=Math.min(w*0.22,150+fireFxStrength*55);
  for(let i=0;i<count;i++){
    const side=(Math.random()*2-1), x=cx+side*spread*(Math.random()*0.95), y=baseY+Math.random()*18;
    fireFxParticles.push({x,y,vx:side*(0.04+Math.random()*0.22),vy:-(0.8+Math.random()*2.6)*fireFxHeight,life:28+Math.random()*28,max:28+Math.random()*28,size:(18+Math.random()*38)*(0.75+fireFxStrength*0.45),hue:18+Math.random()*32,wob:Math.random()*6.28318,swirl:(Math.random()*2-1)*(0.2+Math.random()*0.8)});
  }
}
function spawnFireSparks(count){
  const w=innerWidth,h=innerHeight,cx=w*0.5,baseY=h*0.76,spread=Math.min(w*0.18,120+fireFxStrength*48);
  for(let i=0;i<count;i++){
    const side=(Math.random()*2-1), x=cx+side*spread*Math.random(), y=baseY+Math.random()*10;
    fireFxSparks.push({x,y,vx:side*(0.2+Math.random()*0.9),vy:-(1.5+Math.random()*4.6)*fireFxHeight,life:30+Math.random()*45,max:30+Math.random()*45,size:1+Math.random()*2.4,wob:Math.random()*6.28318});
  }
}
function startFireFx(strength=1,speed=1,height=1,duration=5200){
  fireFxActive=true;fireFxStrength=Math.max(0.2,Number(strength)||1);fireFxSpeed=Math.max(0.25,Number(speed)||1);fireFxHeight=Math.max(0,Math.min(5,Number(height)));fireFxScaleEnabled=!!opts.scale;fireFx3DEnabled=!!opts.threeD;fireFxCameraStart=Math.max(0.00001,(V.getCamera().d));fireFxDuration=Math.max(800,Number(duration)||5200);fireFxStart=performance.now();fireFxOpacity=0;xyzFire39Stop();if(fireFx3DEnabled){if(fireFxHeight>0)xyzFire44Start(fireFxDuration,fireFxStrength,fireFxHeight, opts.anchor);}else xyzFire44Stop();if(!(opts.screen)){stopFireFx(true);return;}fireFx3DEnabled=false;if(fireFxHeight===0){stopFireFx(true);return;}resizeFireCanvas();fireCanvas.style.display='block';
  if(!fireFxFrame) fireFxFrame=requestAnimationFrame(drawFireFx);
}
function stopFireFx(force=false){
  fireFxActive=false; if(force){fireFxOpacity=0;fireFxParticles=[];fireFxSparks=[];if(fireFxFrame)cancelAnimationFrame(fireFxFrame);fireFxFrame=0;fireCtx.clearRect(0,0,fireCanvas.width,fireCanvas.height);fireCanvas.style.display='none';}
}

// Project the *model-space* local origin, not the camera orbit pivot.
// Camera pivot and pan move the camera target; the model origin stays in PLY space.
// Rotation of the model about local (0,0,0) does not change the anchor location.
// This is a screen-space billboard with a real world projection, not a depth-aware 3D volume.
function projectFireAnchor36(){
  if(!k) return null;
  // v43: use documented krpano actions for space->sphere->screen conversion.
  // This should be more reliable than reading stagex/stagey from the hotspot DOM wrapper.
  try{
    const base=xyzFire40Base();
    k.set('fire_tmp_x', base.x);
    k.set('fire_tmp_y', base.y);
    k.set('fire_tmp_z', base.z);
    k.call('spacetosphere(fire_tmp_x,fire_tmp_y,fire_tmp_z, fire_tmp_h,fire_tmp_v,fire_tmp_d); spheretoscreen(fire_tmp_h,fire_tmp_v, fire_tmp_sx,fire_tmp_sy);');
    const sx=Number(k.get('fire_tmp_sx'));
    const sy=Number(k.get('fire_tmp_sy'));
    const d =Number(k.get('fire_tmp_d'));
    if(Number.isFinite(sx) && Number.isFinite(sy) && sx>-100000 && sy>-100000){
      const ref=Math.max(0.01, fireFxCameraStart || d || 1);
      const dep=Math.max(0.01, d || V.getCamera().d || ref);
      return {x:sx, y:sy, zoom:Math.max(.10,Math.min(12,ref/dep))};
    }
  }catch(e){}
  // fallback only if actions fail
  try{
    if(typeof cameraState!=='function') return null;
    const c=cameraState(),base=xyzFire40Base();
    const diff={x:base.x-c.cam.x,y:base.y-c.cam.y,z:base.z-c.cam.z};
    const depth=dot(diff,c.f); if(!Number.isFinite(depth)||depth<=0.01) return null;
    const focal=innerHeight/(2*Math.tan((Number(k.get('view.fov'))||70)*Math.PI/360));
    return {x:innerWidth*.5+dot(diff,c.right)*focal/depth,y:innerHeight*.5-dot(diff,c.up)*focal/depth,zoom:Math.max(.10,Math.min(12,fireFxCameraStart/depth))};
  }catch(e){ return null; }
}

function drawFireFx(now){
  fireFxFrame=0; const w=innerWidth,h=innerHeight; fireCtx.clearRect(0,0,w,h);
  const elapsed=(now-fireFxStart); let envelope=0;
  if(fireFxActive){ const p=Math.min(1,elapsed/fireFxDuration); envelope=Math.sin(Math.PI*p); if(p>=1) fireFxActive=false; }
  fireFxOpacity += ((fireFxActive?Math.max(0.15,envelope):0)-fireFxOpacity)*0.12;
  if(!fireFxActive && fireFxOpacity<0.02){fireFxParticles=[];fireFxSparks=[];fireCtx.clearRect(0,0,w,h);fireCanvas.style.display='none';return;}
  fireCanvas.style.display='block';
  // Optional approximation: scale screen-space fire about its base using camera distance.
  // Original v34 pixels are unchanged with checkbox OFF.
  // v36: optional world-anchored billboard projection. Preserve v35 unchanged when OFF.
  let zoomFactor=fireFxScaleEnabled?Math.max(0.2,Math.min(8,fireFxCameraStart/Math.max(0.00001,V.getCamera().d))):1;
  let fireCenterX=w*.5, fireCenterY=h*.78;
  if(fireFx3DEnabled){
    const projected=projectFireAnchor36();
    if(projected){fireCenterX=projected.x;fireCenterY=projected.y;zoomFactor=projected.zoom;}
    else{fireCenterX=-w*5;fireCenterY=-h*5;zoomFactor=0.2;}
  }
  fireCtx.save();fireCtx.translate(fireCenterX,fireCenterY);fireCtx.scale(zoomFactor,zoomFactor);fireCtx.translate(-w*.5,-h*.78);
  const strength=(0.5+fireFxStrength*0.6)*Math.max(0.2,fireFxOpacity);
  if(fireFxActive)spawnFireParticles(Math.max(2, Math.round((effectiveQuality()==='low'?4:8)*strength)));
  if(fireFxActive && Math.random() < 0.9) spawnFireSparks(Math.max(1, Math.round((effectiveQuality()==='low'?2:5)*strength)));
  fireCtx.globalCompositeOperation='source-over';
  // no dark overlay: retain transparent fire canvas
  fireCtx.globalCompositeOperation='lighter';
  for(let i=fireFxParticles.length-1;i>=0;i--){
    const p=fireFxParticles[i]; p.life-=1; if(p.life<=0){fireFxParticles.splice(i,1); continue}
    const age=1-p.life/p.max; p.wob+=0.08*fireFxSpeed; p.vx += Math.sin(p.wob)*0.014*p.swirl; p.x += p.vx; p.y += p.vy*(0.8+age*0.8); const a=(p.life/p.max)*0.34*fireFxOpacity; const r=p.size*(0.35+0.65*(p.life/p.max));
    const g=fireCtx.createRadialGradient(p.x,p.y,0,p.x,p.y,r);
    g.addColorStop(0,'rgba(255,255,220,'+(a*0.85)+')');
    g.addColorStop(0.18,'rgba(255,'+(180+Math.round(Math.random()*50))+',70,'+(a)+')');
    g.addColorStop(0.42,'rgba(255,'+(70+Math.round(Math.random()*60))+',25,'+(a*0.82)+')');
    g.addColorStop(0.74,'rgba(220,30,10,'+(a*0.38)+')');
    g.addColorStop(1,'rgba(60,0,0,0)');
    fireCtx.fillStyle=g; fireCtx.beginPath(); fireCtx.arc(p.x,p.y,r,0,Math.PI*2); fireCtx.fill();
  }
  for(let i=fireFxSparks.length-1;i>=0;i--){
    const s=fireFxSparks[i]; s.life-=1; if(s.life<=0){fireFxSparks.splice(i,1); continue}
    const age=1-s.life/s.max; s.wob+=0.14; s.x += s.vx + Math.sin(s.wob)*0.35; s.y += s.vy + age*0.35;
    const a=(s.life/s.max)*0.95*fireFxOpacity; fireCtx.fillStyle='rgba(255,'+(180+Math.round(50*Math.random()))+','+(80+Math.round(80*Math.random()))+','+a.toFixed(3)+')'; fireCtx.beginPath(); fireCtx.arc(s.x,s.y,s.size*(1-age*0.4),0,Math.PI*2); fireCtx.fill();
  }
  fireCtx.globalCompositeOperation='source-over';
  fireCtx.restore();
  fireFxFrame=requestAnimationFrame(drawFireFx);
}

let xyzFire44Active=false, xyzFire44Frame=0, xyzFire44StartAt=0, xyzFire44Length=0, xyzFire44Power=1, xyzFire44Height=1, xyzFire44Anchor=0;
function xyzFire44Stop(){
  xyzFire44Active=false;sendBed(false);
  if(xyzFire44Frame)cancelAnimationFrame(xyzFire44Frame);xyzFire44Frame=0;
  if(k)try{k.set('hotspot[xyz_fire44_host].visible',false)}catch(e){}
}
function xyzFire44Start(duration,power,height,anchorZ=0){
  xyzFire44Stop();
  if(!k||height<=0)return;
  xyzFire44Active=true;xyzFire44StartAt=performance.now();xyzFire44Length=duration;xyzFire44Power=power;xyzFire44Height=height;xyzFire44Anchor=Number(anchorZ)||0;
  try{k.set('hotspot[xyz_fire44_host].visible',true)}catch(e){}
  const update=now=>{
    if(!xyzFire44Active)return;
    sendBed(true);
    // Consistent image/world-space point; same anchor as the successful v39 3D hotspots.
    const base=xyzFire40Base();
    try{
      k.set('hotspot[xyz_fire44_host].tx',base.x);
      k.set('hotspot[xyz_fire44_host].ty',base.y + (opts.anchor));
      k.set('hotspot[xyz_fire44_host].tz',base.z);
      k.set('hotspot[xyz_fire44_host].alpha', Math.min(1,Math.sin(Math.PI*Math.min(1,(now-xyzFire44StartAt)/xyzFire44Length))*1.4));
      k.set('hotspot[xyz_fire44_host].scale', Math.max(.02,Math.min(2.6,.24*xyzFire44Power*(.72+xyzFire44Height*.28))));
    }catch(e){}
    if(now<xyzFire44StartAt+xyzFire44Length){xyzFire44Frame=requestAnimationFrame(update)}else xyzFire44Stop();
  };
  xyzFire44Frame=requestAnimationFrame(update);
}


function stop(){xyzFire44Stop();xyzFire39Stop();stopFireFx(true);sendBed(false)}
window.addEventListener('xyz-viewer-fire',e=>{stop();k=V.getEngine();if(!k)return;const d=e.detail||{};
opts={screen:d.screen??!d.threeD,scale:!!d.scale,threeD:!!d.threeD,anchor:Number(d.anchor)||0,base:d.base!==false};
startFireFx(d.power,d.speed,d.height,d.duration);});
window.addEventListener('xyz-viewer-fx-off',stop);window.addEventListener('xyz-viewer-native-reset',stop);
window.addEventListener('pagehide',stop);window.addEventListener('resize',()=>{if(fireFxActive)resizeFireCanvas()});
})();
