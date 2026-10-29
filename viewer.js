/* 3XyzMedia RGB Bridge: standalone VIEW-ONLY runtime. No STUDIO/editor code. */
(()=>{"use strict";
const q=new URLSearchParams(location.search),$=id=>document.getElementById(id);
const clamp=(v,a,b)=>Math.min(b,Math.max(a,v)),rad=v=>v*Math.PI/180,deg=v=>v*180/Math.PI;
const num=(v,d=0)=>Number.isFinite(Number(v))?Number(v):d;
const triple=(a,d)=>Array.isArray(a)&&a.length===3?a.map((x,i)=>clamp(num(x,d[i]),-1e7,1e7)):d.slice();
function decode(v){if(!v||v.length>40000)return{};try{
const z=v.startsWith('j')?v.slice(1):v;
const b=atob(z.replace(/-/g,'+').replace(/_/g,'/').padEnd(Math.ceil(z.length/4)*4,'='));
if(v[0]==='j'){const a=JSON.parse(b);return a&&Array.isArray(a.p)&&Array.isArray(a.o)&&Array.isArray(a.m)?a:{}}
if(b.length<45||b.charCodeAt(0)!==1)return{};
const bytes=Uint8Array.from(b,x=>x.charCodeAt(0)),d=new DataView(bytes.buffer),a=[];
for(let i=0;i<10;i++)a.push(d.getFloat32(1+i*4,true));
return{p:a.slice(0,3),o:a.slice(3,6),d:a[6],m:a.slice(7,10),u:'Z',s:bytes[41],a:bytes[42],q:bytes[43],r:bytes[44]};
}catch(e){return{}}}
function ply(v){const name=(v||'SOY2.ply').trim();
if(/^https:\/\//i.test(name)){try{const u=new URL(name);if(u.protocol==='https:'&&u.pathname.toLowerCase().endsWith('.ply'))return u.href}catch(e){}return null}
const n=name.replace(/^model\//i,'');if(!/^[\w.-]+\.ply$/i.test(n)||n.includes('..'))return null;
return'https://raw.githubusercontent.com/3XyzMedia/3d-models/main/model/'+n}
const model=ply(q.get('model')||'SOY2.ply'),saved=decode(q.get('v'));
const original={p:triple(saved.p,[0,0,0]),o:triple(saved.o,[0,0,0]),m:triple(saved.m,[0,0,0]),d:clamp(num(saved.d,200)||200,1,1e7),u:['Z','-Z','Y','-Y','X','-X'].includes(saved.u)?saved.u:'Z',s:clamp(num(saved.s,.25),.01,3),a:clamp(num(saved.a,.3),0,2),q:clamp(num(saved.q,0)|0,0,3),r:saved.r===undefined?1:num(saved.r,1)};
let cam=JSON.parse(JSON.stringify(original)),k=null,playing=false,playFrame=0,lastPlay=0,touring=false,tourFrame=0,gesture=null;
const axes={Z:[0,0,180],'-Z':[180,0,180],Y:[-90,0,0],'-Y':[90,0,0],X:[0,90,0],'-X':[0,-90,0]};
const vec=(x,y,z)=>({x,y,z}),norm=v=>{const d=Math.hypot(v.x,v.y,v.z)||1;return vec(v.x/d,v.y/d,v.z/d)},cross=(a,b)=>vec(a.y*b.z-a.z*b.y,a.z*b.x-a.x*b.z,a.x*b.y-a.y*b.x);
function cameraMath(){
const yaw=rad(cam.o[0]),pitch=rad(cam.o[1]),r=rad(cam.o[2]),d=cam.d;
const off=vec(Math.sin(yaw)*Math.cos(pitch)*d,Math.sin(pitch)*d,Math.cos(yaw)*Math.cos(pitch)*d);
const target=cam.p.map((x,i)=>x+cam.m[i]),pos=vec(target[0]+off.x,target[1]+off.y,target[2]+off.z);
const look=norm(vec(-off.x,-off.y,-off.z));let right=cross(look,vec(0,1,0));
if(Math.hypot(right.x,right.y,right.z)<.000001)right=vec(Math.cos(yaw),0,-Math.sin(yaw));
right=norm(right);const up=norm(cross(right,look)),cr=Math.cos(r),sr=Math.sin(r);
return{pos,look,right:vec(right.x*cr+up.x*sr,right.y*cr+up.y*sr,right.z*cr+up.z*sr),up:vec(up.x*cr-right.x*sr,up.y*cr-right.y*sr,up.z*cr-right.z*sr)}}
function render(){if(!k)return;const c=cameraMath();try{
k.set('view.tx',c.pos.x);k.set('view.ty',c.pos.y);k.set('view.tz',c.pos.z);
k.set('view.hlookat',deg(Math.atan2(c.look.x,c.look.z)));
k.set('view.vlookat',deg(Math.atan2(c.look.y,Math.hypot(c.look.x,c.look.z))));
k.set('view.roll',cam.o[2]);
k.call('view.update()')
}catch(e){}}
function apply(){if(!k)return;try{
const a=axes[cam.u]||axes.Z;
k.set('image.splats.rx',a[0]);k.set('image.splats.ry',a[1]);k.set('image.splats.rz',a[2]);
k.set('display.splats.scale',cam.s>1?cam.s/100:cam.s);
k.set('image.splats.antialias',cam.a>2?cam.a/20:cam.a);
k.set('display.splats.sortmode',['distance','depth','accurate','off'][cam.q]);
k.set('display.splats.rendermode',cam.r?'perspective':'standard');
k.set('control.locked',true);
}catch(e){}render()}
function error(msg){$('message').hidden=false;$('message').textContent=msg;$('phase').textContent=msg;clearInterval(meter)}
let pct=0;const meter=setInterval(()=>{if(pct<94){pct+=pct<50?3:1;$('percent').textContent=pct+'%';$('fill').style.width=pct+'%'}},250);
window.xyzViewerLoaded=()=>{clearInterval(meter);$('percent').textContent='100%';$('fill').style.width='100%';$('phase').textContent='Модель загружена';setTimeout(()=>$('loading').classList.add('done'),450)};
window.xyzViewerError=()=>error('Не удалось загрузить модель или сцену.');
setTimeout(()=>{if(!$('loading').classList.contains('done')&&pct>0)error('Долгая загрузка модели: проверьте доступность PLY и браузер WebGL.');},60000);
function start(){if(!model)return error('Некорректное имя модели PLY');if(typeof embedpano!=='function')return error('krpano.js не загрузился');
try{embedpano({target:'pano',xml:'scene.xml',initvars:{xyz_modelply:model},html5:'only+webgl',focus:true,mobilescale:1,bgcolor:'#030710',onready:viewer=>{k=viewer;apply()}})}
catch(e){error('Ошибка запуска Gaussian Viewer.')}}
function loadRuntime(){const s=document.createElement('script');s.src='./krpano.js';s.onload=start;s.onerror=()=>error('Не удалось получить krpano.js');document.head.appendChild(s)}
function stopPlay(){if(playFrame)cancelAnimationFrame(playFrame);playFrame=0;playing=false;lastPlay=0;$('play').textContent='▶ PLAY'}
function stopTour(){if(tourFrame)cancelAnimationFrame(tourFrame);tourFrame=0;touring=false;$('tour').textContent='🎬 TOUR'}
function interrupt(){stopPlay();stopTour()}
function tickPlay(t){if(!playing)return;if(lastPlay){cam.o[0]+=clamp((t-lastPlay)/1000,0,.1)*clamp(num(saved.w,3),.5,12);render()}lastPlay=t;playFrame=requestAnimationFrame(tickPlay)}
$('play').addEventListener('click',()=>{stopTour();if(playing){stopPlay();return}playing=true;$('play').textContent='■ STOP';playFrame=requestAnimationFrame(tickPlay)});
$('home').addEventListener('click',()=>{interrupt();cam=JSON.parse(JSON.stringify(original));apply()});
const points=Array.isArray(saved.tour)?saved.tour.filter(p=>Array.isArray(p)&&p.length===11&&p.every(v=>Number.isFinite(Number(v)))).slice(0,100).map(p=>p.map(Number)):[];
function tourVec(){return[...cam.p,...cam.o,cam.d,...cam.m,0]}
function setPt(p){cam.p=p.slice(0,3);cam.o=p.slice(3,6);cam.d=clamp(p[6],1,1e7);cam.m=p.slice(7,10);render()}
const ease=t=>t*t*(3-2*t),angle=(a,b,t)=>a+(((b-a+540)%360)-180)*t;
function approach(a,b,t){const v=ease(clamp(t,0,1));return a.map((x,i)=>[3,4,5].includes(i)?angle(x,b[i],v):i===6?Math.max(.001,x)*Math.pow(Math.max(.001,b[i])/Math.max(.001,x),v):x+(b[i]-x)*v)}
function cost(a,b){const distance=Math.hypot(...[0,1,2,7,8,9].map(i=>b[i]-a[i])),spin=Math.hypot(...[3,4,5].map(i=>(((b[i]-a[i]+540)%360)-180))),zoom=Math.abs(Math.log(Math.max(.001,b[6])/Math.max(.001,a[6])));return Math.max(.02,distance+spin*.07+zoom*5)}
const unwrap=(a,b)=>a+(((b-a+540)%360)-180);
function curve(seg,t,stop){const a=points[Math.max(0,seg-1)],b=points[seg],c=points[seg+1],d=points[Math.min(points.length-1,seg+2)],u=stop?ease(t):t;
return b.map((x,i)=>{if(stop)return [3,4,5].includes(i)?angle(x,c[i],u):x+(c[i]-x)*u;
const ang=[3,4,5].includes(i),a1=ang?x+(x-unwrap(x,a[i])):a[i],c1=ang?unwrap(x,c[i]):c[i],d1=ang?c1+(unwrap(c1,d[i])-c1):d[i];
const t2=u*u,t3=t2*u,value=.5*((2*x)+(-a1+c1)*u+(2*a1-5*x+4*c1-d1)*t2+(-a1+3*x-3*c1+d1)*t3);
return i===6?Math.max(.001,value):value})}
function arcTable(n){const segs=[],sum=[0];for(let i=0;i<n;i++){const distances=[0];let last=curve(i,0,false);for(let j=1;j<=24;j++){const p=curve(i,j/24,false);distances.push(distances[j-1]+cost(last,p));last=p}const len=Math.max(.001,distances[24]);segs.push(distances);sum.push(sum[i]+len)}return{segs,sum,total:sum[n]}}
function beginTour(){if(points.length<2)return;interrupt();const from=tourVec(),per=clamp(num(saved.ts,5),.1,120)*1000,stops=!!saved.tp,segments=points.length-1,entry=cost(from,points[0])>.05?per:0,started=performance.now(),arc=stops?null:arcTable(segments);
touring=true;$('tour').textContent='Ⅱ PAUSE';
function frame(now){if(!touring)return;const elapsed=Math.max(0,now-started);
if(elapsed<entry){setPt(approach(from,points[0],elapsed/entry));tourFrame=requestAnimationFrame(frame);return}
const p=clamp((elapsed-entry)/(per*segments),0,1);if(p>=1){setPt(points.at(-1));stopTour();return}
let seg,t;if(stops){const x=p*segments;seg=Math.min(segments-1,Math.floor(x));t=x-seg}
else{const target=ease(p)*arc.total;seg=0;while(seg<segments-1&&target>arc.sum[seg+1])seg++;const row=arc.segs[seg],local=target-arc.sum[seg];let j=0;while(j<23&&local>row[j+1])j++;t=(j+clamp((local-row[j])/Math.max(.000001,row[j+1]-row[j]),0,1))/24}
setPt(curve(seg,t,stops));tourFrame=requestAnimationFrame(frame)}
tourFrame=requestAnimationFrame(frame)}
if(points.length>=2&&q.get('tourui')!=='0'){$('tour').hidden=false;$('tour').addEventListener('click',()=>touring?stopTour():beginTour())}
const surface=$('surface'),active=new Map();let drag=null;
function pos(e){return{x:e.clientX,y:e.clientY,button:e.button,shift:e.shiftKey}}
function measure(){const v=[...active.values()];if(v.length<2)return null;const a=v[0],b=v[1];return{cx:(a.x+b.x)/2,cy:(a.y+b.y)/2,span:Math.hypot(a.x-b.x,a.y-b.y)}}
function begin(){if(active.size>=2){drag={type:'pinch',...measure(),d:cam.d,m:cam.m.slice()};return}
if(active.size===1){const p=[...active.values()][0];drag={type:p.button===2?'pan':p.shift?'roll':'orbit',...p,o:cam.o.slice(),m:cam.m.slice()}}else drag=null}
surface.addEventListener('pointerdown',e=>{e.preventDefault();interrupt();active.set(e.pointerId,pos(e));try{surface.setPointerCapture(e.pointerId)}catch(x){}begin()});
surface.addEventListener('pointermove',e=>{if(!active.has(e.pointerId))return;e.preventDefault();active.set(e.pointerId,pos(e));if(active.size>1){const m=measure();if(!drag||drag.type!=='pinch')begin();if(!m||!drag)return;cam.d=clamp(drag.d*Math.max(.001,drag.span)/Math.max(.001,m.span),1,1e7);const c=cameraMath(),s=Math.max(.00001,drag.d*.0024),dx=m.cx-drag.cx,dy=m.cy-drag.cy;cam.m=drag.m.map((x,i)=>x+[c.right.x,c.right.y,c.right.z][i]*dx*s+[c.up.x,c.up.y,c.up.z][i]*(-dy*s));render();return}
if(!drag||drag.type==='pinch')begin();if(!drag)return;const dx=e.clientX-drag.x,dy=e.clientY-drag.y;
if(drag.type==='orbit'){cam.o[0]=drag.o[0]+dx*.32;cam.o[1]=clamp(drag.o[1]-dy*.24,-179,179)}
if(drag.type==='roll')cam.o[2]=drag.o[2]+dx*.3;
if(drag.type==='pan'){const c=cameraMath(),s=Math.max(.00001,cam.d*.0024);cam.m=drag.m.map((x,i)=>x+[c.right.x,c.right.y,c.right.z][i]*dx*s+[c.up.x,c.up.y,c.up.z][i]*(-dy*s))}
render()});
for(const n of ['pointerup','pointercancel','lostpointercapture'])surface.addEventListener(n,e=>{if(!active.has(e.pointerId))return;active.delete(e.pointerId);begin()});
surface.addEventListener('wheel',e=>{e.preventDefault();interrupt();cam.d=clamp(cam.d*(e.deltaY>0?1.085:1/1.085),1,1e7);render()},{passive:false});
surface.addEventListener('contextmenu',e=>e.preventDefault());
['mousedown','mouseup','mousemove','click','dblclick'].forEach(n=>surface.addEventListener(n,e=>e.stopPropagation()));
const video=typeof saved.vu==='string'?( /^https:\/\//i.test(saved.vu)?saved.vu:(/^\/VIEWER\/video\/[\w.-]+\.mp4$/i.test(saved.vu)?'https://3xyzmedia.github.io'+saved.vu:'')):'';
if(video&&q.get('videoui')!=='0'){$('video').hidden=false;$('video').addEventListener('click',()=>{$('videoBox').hidden=false;$('player').src=video;$('player').play().catch(()=>{})});$('closeVideo').addEventListener('click',()=>{$('videoBox').hidden=true;$('player').pause()})}
const canvas=$('fxCanvas'),ctx=canvas.getContext('2d');let particles=[];
function resize(){canvas.width=Math.min(1800,innerWidth*devicePixelRatio);canvas.height=Math.min(1200,innerHeight*devicePixelRatio);particles=[];const count=saved.wx==='snow'?100:(saved.zt?120:0);for(let i=0;i<count;i++)particles.push({x:Math.random()*canvas.width,y:Math.random()*canvas.height,r:Math.random()*1.7+.3,v:Math.random()*1.4+.3})}
addEventListener('resize',resize);resize();if(particles.length){let last=0;function frame(t){const dt=clamp((t-last)/16,0,3)||1;last=t;ctx.clearRect(0,0,canvas.width,canvas.height);ctx.fillStyle='rgba(210,241,255,.8)';for(const p of particles){ctx.beginPath();ctx.arc(p.x,p.y,p.r,0,Math.PI*2);ctx.fill();if(saved.wx==='snow'){p.y+=p.v*dt;if(p.y>canvas.height)p.y=0}}requestAnimationFrame(frame)}requestAnimationFrame(frame)}
loadRuntime();
})();