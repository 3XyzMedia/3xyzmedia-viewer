/* 3XyzMedia RGB Bridge — read-only viewer. Deliberately NO authoring controls or studio code. */
(()=>{'use strict';
const qs=new URLSearchParams(location.search);
const $=id=>document.getElementById(id);
const limit=(v,min,max)=>Math.max(min,Math.min(max,v));
const rad=x=>x*Math.PI/180;
const deg=x=>x*180/Math.PI;
const finite=(v,fallback=0)=>Number.isFinite(Number(v))?Number(v):fallback;
const safeTriple=(a,defaults)=>Array.isArray(a)&&a.length===3?a.map((v,i)=>limit(finite(v,defaults[i]),-1e7,1e7)):defaults.slice();
function decodeState(token){if(!token||token.length>40000)return null;try{
 if(token[0]==='j'){
  const s=token.slice(1).replace(/-/g,'+').replace(/_/g,'/');
  const json=atob(s.padEnd(Math.ceil(s.length/4)*4,'='));
  const obj=JSON.parse(json);
  return obj&&Array.isArray(obj.p)&&Array.isArray(obj.o)&&Array.isArray(obj.m)?obj:null;
 }
 const s=token.replace(/-/g,'+').replace(/_/g,'/');const raw=atob(s.padEnd(Math.ceil(s.length/4)*4,'='));
 if(raw.length<45||raw.charCodeAt(0)!==1)return null;
 const buf=new ArrayBuffer(raw.length),bytes=new Uint8Array(buf);for(let i=0;i<raw.length;i++)bytes[i]=raw.charCodeAt(i);
 const d=new DataView(buf),a=[];for(let i=0;i<10;i++)a.push(d.getFloat32(1+i*4,true));
 return {p:a.slice(0,3),o:a.slice(3,6),d:a[6],m:a.slice(7,10),u:'Z',s:bytes[41],a:bytes[42],q:bytes[43],r:bytes[44],x:1};
}catch{return null}}
function resolveModel(raw){const name=(raw||'SOY2.ply').trim();
 if(/^https:\/\//i.test(name)){
  try{const u=new URL(name);if(u.protocol==='https:'&&u.pathname.toLowerCase().endsWith('.ply'))return u.href}catch{}return null;
 }
 const n=name.replace(/^model\//i,'');
 if(!/^[\w.-]+\.ply$/i.test(n)||n.includes('..'))return null;
 return 'https://raw.githubusercontent.com/3XyzMedia/3d-models/main/model/'+n;
}
const model=resolveModel(qs.get('model')||'SOY2.ply');
const shared=decodeState(qs.get('v'))||{};
const initial={p:safeTriple(shared.p,[0,0,0]),o:safeTriple(shared.o,[0,0,0]),m:safeTriple(shared.m,[0,0,0]),d:limit(finite(shared.d,200)||200,1,1e7),u:['Z','-Z','Y','-Y','X','-X'].includes(shared.u)?shared.u:'Z',s:limit(finite(shared.s,.25),.01,2),a:limit(finite(shared.a,.3),0,2),q:limit(finite(shared.q,0)|0,0,3),r:shared.r===undefined?1:Number(shared.r)};
let camera=JSON.parse(JSON.stringify(initial)),engine=null,playFrame=0,playLast=0,playing=false,tourFrame=0,tourPlaying=false,gest=null;
window.XYZViewer={state:shared,params:qs,model,getEngine:()=>engine,getCamera:()=>camera,getInitial:()=>initial,render:()=>render(),restoreHome:()=>home(),playState:()=>playing,tourState:()=>tourPlaying};
const upAxisRotations={'Z':{rx:0,ry:0,rz:180},'-Z':{rx:180,ry:0,rz:180},'Y':{rx:-90,ry:0,rz:0},'-Y':{rx:90,ry:0,rz:0},'X':{rx:0,ry:90,rz:0},'-X':{rx:0,ry:-90,rz:0}};
function norm(v){const l=Math.hypot(v.x,v.y,v.z)||1;return{x:v.x/l,y:v.y/l,z:v.z/l}}
function cross(a,b){return {x:a.y*b.z-a.z*b.y,y:a.z*b.x-a.x*b.z,z:a.x*b.y-a.y*b.x}}
function camMath(){const yaw=rad(camera.o[0]),pitch=rad(camera.o[1]);const d=camera.d;
 const off={x:Math.sin(yaw)*Math.cos(pitch)*d,y:Math.sin(pitch)*d,z:Math.cos(yaw)*Math.cos(pitch)*d};
 const target={x:camera.p[0]+camera.m[0],y:camera.p[1]+camera.m[1],z:camera.p[2]+camera.m[2]};
 const cam={x:target.x+off.x,y:target.y+off.y,z:target.z+off.z};
 const f=norm({x:-off.x,y:-off.y,z:-off.z});
 let right=cross(f,{x:0,y:1,z:0});if(Math.hypot(right.x,right.y,right.z)<1e-6)right={x:Math.cos(yaw),y:0,z:-Math.sin(yaw)};
 right=norm(right);const up=norm(cross(right,f));const r=rad(camera.o[2]),cr=Math.cos(r),sr=Math.sin(r);
 return{cam,f,right:{x:right.x*cr+up.x*sr,y:right.y*cr+up.y*sr,z:right.z*cr+up.z*sr},up:{x:up.x*cr-right.x*sr,y:up.y*cr-right.y*sr,z:up.z*cr-right.z*sr}};
}
function render(){if(!engine)return;const c=camMath();
 try{engine.set('view.tx',c.cam.x);engine.set('view.ty',c.cam.y);engine.set('view.tz',c.cam.z);
 engine.set('view.hlookat',deg(Math.atan2(c.f.x,c.f.z)));engine.set('view.vlookat',deg(Math.atan2(c.f.y,Math.hypot(c.f.x,c.f.z))));
 engine.set('view.roll',camera.o[2]);engine.set('view.fov',70);engine.call('view.update()');}catch(e){showError('Ошибка управления камерой.')} }
function setupEngine(){const r=upAxisRotations[camera.u]||upAxisRotations.Z;
 try{engine.set('image.splats.rx',r.rx);engine.set('image.splats.ry',r.ry);engine.set('image.splats.rz',r.rz);
 engine.set('display.splats.scale',camera.s>1?camera.s/100:camera.s);
 engine.set('image.splats.antialias',camera.a>2?camera.a/20:camera.a);
 // v6: unsorted Gaussian blending (q=3/off) can create black occlusion bands.
 // When a shared scene requests OFF, use DISTANCE for stable spectator playback.
 // Keep ?sort=off for explicit author comparisons and ?sort=accurate for max fidelity.
 const requested=['distance','depth','accurate','off'][camera.q];
 const sortOverride=qs.get('sort');
 const safeSort=['distance','depth','accurate','off'].includes(sortOverride)?sortOverride:(requested==='off'?'distance':requested);
 engine.set('display.splats.sortmode',safeSort);
 engine.set('display.splats.rendermode',camera.r?'perspective':'standard');engine.set('control.locked','true');}catch(e){}render()}
function showError(msg){$('message').hidden=false;$('message').textContent=msg;$('phase').textContent=msg;}
let loadPct=0;const meter=setInterval(()=>{if(loadPct>=94)return;loadPct+=loadPct<50?3:1;$('percent').textContent=loadPct+'%';$('fill').style.width=loadPct+'%';},230);
// STUDIO v72 applies rendering state when XML has finished loading, not only at embedpano onready.
// Reapply on loadcomplete: otherwise XML defaults can replace splat scale/sort/axis settings.
let sceneComplete=false;
window.xyzViewerLoaded=function(){
 if(!sceneComplete){sceneComplete=true;requestAnimationFrame(()=>{
   if(engine){setupEngine();window.dispatchEvent(new Event('xyz-viewer-configured'));}
 });}
 if(shared.b&&!playing)togglePlay();window.dispatchEvent(new Event('xyz-viewer-loaded'));clearInterval(meter);$('percent').textContent='100%';$('fill').style.width='100%';$('phase').textContent='Модель готова';setTimeout(()=>$('loading').classList.add('done'),500);
};
window.xyzViewerError=function(){clearInterval(meter);showError('Не удалось загрузить модель или сцену. Проверьте ссылку PLY.');};
window.xyz70LoaderDone=()=>window.xyzViewerLoaded?.();window.xyz70LoaderError=()=>window.xyzViewerError?.();
function loadKrpano(){if(!model){showError('Некорректная ссылка на PLY');return;}
 if(typeof embedpano!=='function'){showError('Движок krpano не загрузился.');return;}
 embedpano({target:'pano',xml:'scene.xml',initvars:{xyz_modelply:model},html5:'only+webgl',focus:true,mobilescale:1,bgcolor:'#03070d',onready:k=>{engine=k;setupEngine();window.dispatchEvent(new Event('xyz-viewer-engine'));if(sceneComplete)requestAnimationFrame(setupEngine);}});
}
function stopPlay(){if(playFrame)cancelAnimationFrame(playFrame);playFrame=0;playing=false;playLast=0;$('play').textContent='▶ PLAY'}
// v9: preserve PLAY during manual gestures; avoid adding automatic yaw while dragging.
// Advance playLast even when a pointer is down so there is no accumulated jump on release.
function tickPlay(t){if(!playing)return;if(playLast&&pointers.size===0){camera.o[0]+=limit((t-playLast)/1000,0,.1)*limit(finite(shared.w,3),.5,12);render()}playLast=t;playFrame=requestAnimationFrame(tickPlay)}
function togglePlay(){stopTour();if(playing){stopPlay();return}playing=true;playLast=0;$('play').textContent='■ STOP';playFrame=requestAnimationFrame(tickPlay)}
// HOME restores the shared starting viewpoint, never turns off PLAY.
// It still cancels an active TOUR (explicit camera path) to avoid camera ownership conflict.
function home(){stopTour();camera=JSON.parse(JSON.stringify(initial));playLast=0;setupEngine()}
// v72 TOUR interpolation: seamless entry from the CURRENT view, then the stored route.
const tourPoints=Array.isArray(shared.tour)?shared.tour.filter(p=>Array.isArray(p)&&p.length===11&&p.every(x=>Number.isFinite(Number(x)))).slice(0,100).map(p=>p.map(Number)):[];
function tourVector(){return [...camera.p,...camera.o,camera.d,...camera.m,0]}
function setTourPoint(p){camera.p=p.slice(0,3);camera.o=p.slice(3,6);camera.d=limit(p[6],1,1e7);camera.m=p.slice(7,10);render()}
function smoothstep(t){return t*t*(3-2*t)}
function angleLerp(a,b,t){return a+(((b-a+540)%360)-180)*t}
function tourCost(a,b){const dp=Math.hypot(a[0]-b[0],a[1]-b[1],a[2]-b[2]);const pd=Math.hypot(a[7]-b[7],a[8]-b[8],a[9]-b[9]);const da=Math.hypot(...[3,4,5].map(i=>(((b[i]-a[i]+540)%360)-180)));const zoom=Math.abs(Math.log(Math.max(.001,b[6])/Math.max(.001,a[6])));return Math.max(.02,Math.sqrt(dp*dp+pd*pd)+da*.07+zoom*5)}
function approach(from,to,t){const u=smoothstep(limit(t,0,1));return from.map((v,i)=>{if([3,4,5].includes(i))return angleLerp(v,to[i],u);if(i===6)return Math.max(.001,v)*Math.pow(Math.max(.001,to[i])/Math.max(.001,v),u);return v+(to[i]-v)*u})}
function catmull(a,b,c,d,t){const t2=t*t,t3=t2*t;return .5*((2*b)+(-a+c)*t+(2*a-5*b+4*c-d)*t2+(-a+3*b-3*c+d)*t3)}
function tourUnwrap(base,v){return base+(((v-base+540)%360)-180)}
function interpolate(seg,t,stops){const a=tourPoints[Math.max(0,seg-1)],b=tourPoints[seg],c=tourPoints[seg+1],d=tourPoints[Math.min(tourPoints.length-1,seg+2)];const u=stops?smoothstep(t):t;
 return b.map((val,i)=>{const angular=[3,4,5].includes(i),cv=angular?tourUnwrap(val,c[i]):c[i];if(stops)return angular?val+(cv-val)*u:val+(c[i]-val)*u;const av=angular?val+(val-tourUnwrap(val,a[i])):a[i];const dv=angular?cv+(tourUnwrap(cv,d[i])-cv):d[i];const value=catmull(av,val,cv,dv,u);return i===6?Math.max(.001,value):value});}
function arcTable(nseg){const segs=[],totals=[0];for(let i=0;i<nseg;i++){const distances=[0];let prev=interpolate(i,0,false);for(let j=1;j<=24;j++){const p=interpolate(i,j/24,false);distances.push(distances[j-1]+tourCost(prev,p));prev=p}const len=Math.max(.001,distances[24]);segs.push({distances,len});totals.push(totals[i]+len)}return{segs,totals,total:totals[nseg]}}
function stopTour(){tourPlaying=false;if(tourFrame)cancelAnimationFrame(tourFrame);tourFrame=0;$('tour').textContent='🎬 TOUR'}
function playTour(){if(tourPoints.length<2)return;stopPlay();stopTour();const from=tourVector(),first=tourPoints[0],per=limit(finite(shared.ts,5),.1,120)*1000,stops=!!shared.tp,nseg=tourPoints.length-1,entry=tourCost(from,first)>.05?per:0,start=performance.now(),arc=stops?null:arcTable(nseg);
 tourPlaying=true;$('tour').textContent='Ⅱ PAUSE';function frame(now){if(!tourPlaying)return;const elapsed=Math.max(0,now-start);
 if(elapsed<entry){setTourPoint(approach(from,first,elapsed/entry));tourFrame=requestAnimationFrame(frame);return}
 const p=limit((elapsed-entry)/(per*nseg),0,1);if(p>=1){setTourPoint(tourPoints.at(-1));stopTour();return}
 let seg,t;if(stops){const cursor=p*nseg;seg=Math.min(nseg-1,Math.floor(cursor));t=cursor-seg}else{const easing=smoothstep(p),target=easing*arc.total;seg=0;while(seg<nseg-1&&target>arc.totals[seg+1])seg++;const table=arc.segs[seg].distances,local=target-arc.totals[seg];let j=0;while(j<23&&local>table[j+1])j++;const fraction=(local-table[j])/Math.max(.000001,table[j+1]-table[j]);t=(j+limit(fraction,0,1))/24}
 setTourPoint(interpolate(seg,t,stops));tourFrame=requestAnimationFrame(frame)}tourFrame=requestAnimationFrame(frame)}
// Viewer-only gestures (not krpano's built-in navigation): wheel, LMB, RMB, 2-finger zoom+pan.
const surface=$('surface'),pointers=new Map();
function point(ev){return{x:ev.clientX,y:ev.clientY,button:ev.button,shift:ev.shiftKey}}
function metrics(){const v=[...pointers.values()];if(v.length<2)return null;const[a,b]=v;return{cx:(a.x+b.x)/2,cy:(a.y+b.y)/2,span:Math.hypot(a.x-b.x,a.y-b.y)}}
function begin(){if(pointers.size>=2){const m=metrics();gest={type:'pinch',...m,camD:camera.d,pan:camera.m.slice()};return}if(pointers.size===1){const p=[...pointers.values()][0];gest={type:p.button===2?'pan':p.shift?'roll':'orbit',...p,o:camera.o.slice(),pan:camera.m.slice()}}else gest=null}
function interrupt(){stopTour()} // manual orbit/pan/zoom never stops PLAY
surface.addEventListener('pointerdown',ev=>{ev.preventDefault();ev.stopPropagation();interrupt();pointers.set(ev.pointerId,point(ev));try{surface.setPointerCapture(ev.pointerId)}catch{}begin()});
surface.addEventListener('pointermove',ev=>{if(!pointers.has(ev.pointerId))return;ev.preventDefault();ev.stopPropagation();pointers.set(ev.pointerId,point(ev));if(pointers.size>1){const m=metrics();if(!gest||gest.type!=='pinch')begin();if(!gest||!m)return;camera.d=limit(gest.camD*Math.max(.001,gest.span)/Math.max(.001,m.span),1,1e7);const c=camMath();const ss=Math.max(.00001,gest.camD*.0024),dx=m.cx-gest.cx,dy=m.cy-gest.cy;camera.m=gest.pan.map((v,i)=>v+[c.right.x,c.right.y,c.right.z][i]*dx*ss+[c.up.x,c.up.y,c.up.z][i]*(-dy*ss));render();return}
 if(!gest||gest.type==='pinch')begin();if(!gest)return;const dx=ev.clientX-gest.x,dy=ev.clientY-gest.y;
 if(gest.type==='orbit'){camera.o[0]=gest.o[0]+dx*.32;camera.o[1]=limit(gest.o[1]-dy*.24,-179,179)}
 else if(gest.type==='roll'){camera.o[2]=gest.o[2]+dx*.3}
 else if(gest.type==='pan'){const c=camMath(),scale=Math.max(.00001,camera.d*.0024);camera.m=gest.pan.map((v,i)=>v+[c.right.x,c.right.y,c.right.z][i]*dx*scale+[c.up.x,c.up.y,c.up.z][i]*(-dy*scale))}render()});
function end(ev){if(!pointers.has(ev.pointerId))return;ev.preventDefault();pointers.delete(ev.pointerId);begin()}
for(const name of ['pointerup','pointercancel','lostpointercapture'])surface.addEventListener(name,end);
surface.addEventListener('wheel',e=>{e.preventDefault();e.stopPropagation();camera.d=limit(camera.d*(e.deltaY>0?1.085:1/1.085),1,1e7);render()},{passive:false});
surface.addEventListener('contextmenu',e=>e.preventDefault());
['mousedown','mouseup','mousemove','click','dblclick'].forEach(n=>surface.addEventListener(n,e=>{e.stopPropagation();if(n==='dblclick')e.preventDefault()}));
$('play').addEventListener('click',togglePlay);$('home').addEventListener('click',home);
// The original v72 brand expands to the glowing frame and launches the selected shared LABEL.
const brand=$('brand');if(brand){brand.addEventListener('click',()=>{
 const opened=!brand.classList.contains('expanded');brand.classList.toggle('expanded',opened);
 brand.setAttribute('aria-expanded',String(opened));
 const selected=qs.get('labelfx')||(qs.get('gpu20k')==='1'?'gpu20k':qs.get('morph')==='1'?'morph':'none');
 // The public phone viewer has no separate bottom FX button. Its command lives on the brand.
 // Preserve v72 LABEL precedence when the selected MORPH is actually available.
 const phoneLayout=window.matchMedia('(max-width:600px)').matches;
 const playableLabel=selected==='morph'||(selected==='gpu20k'&&!phoneLayout);
 if(playableLabel){
   window.dispatchEvent(new CustomEvent('xyz-brand-label',{detail:{mode:selected}}));
 }else if(phoneLayout&&(qs.get('fxui')==='1'||!!shared.ef)){
   window.xyzViewPlayFX?.();
 }
});}

if(tourPoints.length>=2&&qs.get('tourui')!=='0'){$('tour').hidden=false;$('tour').addEventListener('click',()=>tourPlaying?stopTour():playTour())}
const videoSrc=typeof shared.vu==='string' ? (/^https:\/\//i.test(shared.vu)?shared.vu:(/^\/VIEWER\/video\/[\w.-]+\.mp4$/i.test(shared.vu)?'https://3xyzmedia.github.io'+shared.vu:'')) : '';
if(videoSrc&&qs.get('videoui')!=='0'){$('video').hidden=false;$('video').addEventListener('click',()=>{$('videoBox').hidden=false;$('player').src=videoSrc;$('player').play().catch(()=>{})});$('closeVideo').addEventListener('click',()=>{$('videoBox').hidden=true;$('player').pause()})}
// FX layers are controlled only by viewer-experience.js. No second snow/stars loop.
function injectRuntime(){const script=document.createElement('script');script.src='./krpano.js';script.onload=loadKrpano;script.onerror=()=>{const fallback=document.createElement('script');fallback.src='https://3xyzmedia.github.io/VIEWER/krpano.js';fallback.onload=loadKrpano;fallback.onerror=()=>showError('krpano.js недоступен.');document.head.appendChild(fallback)};document.head.appendChild(script)}
injectRuntime();
})();
