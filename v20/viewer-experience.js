/* 3XyzMedia spectator playback: FX and media from v72 SHARE, no authoring controls. */
(()=>{'use strict';
const V=window.XYZViewer;if(!V)return;
const $=id=>document.getElementById(id),st=V.state||{},q=V.params;
const clamp=(x,a,b)=>Math.max(a,Math.min(b,x)),number=(v,d=0)=>Number.isFinite(Number(v))?Number(v):d;
const allowFX=q.get('fxui')!=='0',allowMusic=q.get('musicui')!=='0';
let fxOn=true,fxAnim=0,lastFx=0,nativeFrame=0,warpStars=[];
const fx=$('fxToggle'), burst=$('burst'), mp3=$('mp3'),audio=$('viewerAudio');
const canvas=$('experienceCanvas'),ctx=canvas.getContext('2d');
const effectsAvailable=!!st.h70;
function setFxEnabled(on){
 fxOn=!!on;fx.classList.toggle('off',!fxOn);fx.classList.toggle('active',fxOn);
 fx.textContent=fxOn?'FX ON':'FX OFF';fx.setAttribute('aria-pressed',String(fxOn));
 // Clear and hide EVERY overlay, not just experienceCanvas.
 for(const id of ['experienceCanvas','fxCanvas']){
   const el=$(id);if(!el)continue;el.style.visibility=fxOn?'visible':'hidden';
   if(!fxOn){const cc=el.getContext('2d');cc&&cc.clearRect(0,0,el.width,el.height);}
 }
 if(!fxOn){
   nativeReset();morphRestore();window.xyzViewer20k?.stop();
   window.dispatchEvent(new Event('xyz-viewer-fx-off'));
 }
 window.__xyzViewFXOn=fxOn;
 cancelAnimationFrame(fxAnim);
 fxAnim=0;
 lastFx=0;
 if(fxOn&&effectsAvailable)fxAnim=requestAnimationFrame(effectFrame);
 if(fxOn)window.dispatchEvent(new Event('xyz-viewer-fx-on'));
}
window.xyzViewerFXSetEnabled=setFxEnabled;
// v8: the top FX ON/OFF master is always available, exactly like STUDIO v72.
// The fxui=0 share flag only restricts author/guest FX tools; it MUST NOT make the visible master button inert.
fx.classList.add('active');fx.addEventListener('click',()=>setFxEnabled(!fxOn));

function safeMusic(src){if(typeof src!=='string')return '';let t=src.trim();if(!t)t='https://3xyzmedia.github.io/3xyzmedia-viewer/assets/music/peremen.mp3';
 try{let u=new URL(t, location.origin);if(u.protocol!=='https:'&&u.origin!==location.origin)return '';if(!/\.mp3(?:$|\?)/i.test(u.pathname))return '';
 if(t.startsWith('/VIEWER/music/'))u=new URL('https://3xyzmedia.github.io'+t);return u.href;}catch(e){return ''}}
let musicURL=safeMusic(st.mp||'https://3xyzmedia.github.io/3xyzmedia-viewer/assets/music/peremen.mp3'),musicDisabled=false,pending=false;
// STUDIO v72 starts MP3 on the first trusted action even if the panel toggle me is OFF.
// A deliberate author ma=0 still prevents automatic playback.
if(allowMusic&&musicURL){mp3.hidden=false;mp3.textContent='▶/ MP3';mp3.title='Нажмите для музыки';audio.volume=clamp(number(st.mv,30)/100,0,1);
 mp3.addEventListener('click',()=>{if(!audio.paused){musicDisabled=true;audio.pause();updateMusic();return;}musicDisabled=false;startMusic();});
 audio.addEventListener('play',updateMusic);audio.addEventListener('pause',updateMusic);audio.addEventListener('error',()=>{mp3.title='MP3 недоступен. Проверьте путь SHARE';});}
function updateMusic(){mp3.textContent=audio.paused?'▶/ MP3':'Ⅱ MP3';mp3.classList.toggle('active',!audio.paused)}
function startMusic(){if(!musicURL||pending||!audio.paused)return;if(!audio.src)audio.src=musicURL;
 pending=true;const p=audio.play();if(p&&p.then)p.then(()=>{pending=false;updateMusic()}).catch(()=>{pending=false;updateMusic()});else{pending=false;updateMusic()}}
// Browser audio policies: first trusted gesture, not a synthetic timer. Wheel works on desktop.
function gesture(ev){if(!ev?.isTrusted||musicDisabled||!musicURL||st.ma===0||st.ma===false)return;startMusic()}
for(const ev of ['pointerdown','pointerup','touchstart','touchend','click','keydown','wheel'])window.addEventListener(ev,gesture,{capture:true,passive:true});
function sceneSet(key,value){try{let k=V.getEngine();if(!k)return false;k.set('image.splats.'+key,value);return true}catch(e){return false}}
function nativeReset(){window.dispatchEvent(new Event('xyz-viewer-native-reset'));cancelAnimationFrame(nativeFrame);nativeFrame=0;sceneSet('fx_progress',0);sceneSet('fx_mode',0);sceneSet('fx_power',1);sceneSet('fx_radius',100);sceneSet('fx_labeldensity',1.1);}
function nativeAnimate(mode,duration=4500,power=2,radius=100){let k=V.getEngine();if(!k)return;nativeReset();sceneSet('fx_power',power);sceneSet('fx_radius',radius);sceneSet('fx_mode',mode);
 const start=performance.now();
 function frame(now){let t=clamp((now-start)/duration,0,1);sceneSet('fx_progress',mode===1?t:t*t*(3-2*t));if(t<1)nativeFrame=requestAnimationFrame(frame);else{nativeFrame=0;if(mode===3||mode===4)sceneSet('fx_progress',1);else if(mode===6){sceneSet("fx_progress",0);sceneSet("fx_mode",0)}else nativeReset()}}nativeFrame=requestAnimationFrame(frame)}
let selectedMode=Number(st.em)||1;
const fireLayers=st.fl||{screen:selectedMode!==10&&!st.e3,attached:selectedMode!==10&&!!st.e3,model:selectedMode===10};
if(selectedMode===10)selectedMode=6;
for(const [id,key] of [['fireScreen17','screen'],['fireAttached17','attached'],['fireModel17','model']]){
 const input=$(id); input.checked=!!fireLayers[key];
 input.addEventListener('change',()=>{fireLayers[key]=input.checked;selectedMode=6});
}
window.xyzViewPlayFX=(requested)=>{if(!fxOn)return;if(requested!==undefined)selectedMode=Number(requested);const mode=clamp(Math.round(number(selectedMode,1)),1,6);const effect=st.fxSettings?.[mode]||{};const power=number(effect.power,number(st.ep,1)),radius=number(effect.radius,number(st.er,100)),speed=number(effect.speed,number(st.et,1));const duration=clamp((mode===3||mode===4?3600:mode===5?5200:mode===6?5400:4300)/Math.max(.25,speed),900,25000);const layers=fireLayers;
 if(mode===6&&!layers.screen&&!layers.attached){nativeReset();if(layers.model)window.xyzNativeFire16?.play(true);return;}
 nativeAnimate(mode,duration,power,radius);if(mode===6)window.dispatchEvent(new CustomEvent('xyz-viewer-fire',{detail:{duration,power,height:number(st.eh,1),speed,scale:!!st.ez,anchor:number(st.eo,0),base:st.eb===undefined?true:!!st.eb,threeD:layers.attached,screen:layers.screen,screenFire:st.screenFire}}));if(mode===6&&layers.model)window.xyzNativeFire16?.play(true);};
const customButtons=Array.isArray(st.fxButtons);
if(customButtons&&st.ef&&allowFX)window.xyzFxButtons.render(st.fxButtons,id=>{
 if(!fxOn)return;
 if(morphFrame)morphRestore();
 window.xyzViewer20k?.stop();
 window.xyzViewPlayFX(id);
});
if(!customButtons&&allowFX&&(st.ef||q.get('fxui')==='1')){burst.hidden=false;burst.addEventListener('click',()=>window.xyzViewPlayFX());}
const launch=$('fxLaunch');if(!customButtons&&launch&&allowFX&&(st.ef||q.get('fxui')==='1')){launch.hidden=false;launch.textContent=Number(st.em)===10?'🔥 МОДЕЛЬ':Number(st.em)===6?'🔥 FIRE':'✨ FX';launch.addEventListener('click',()=>window.xyzViewPlayFX());}
let initialFxStarted=false;
window.addEventListener('xyz-viewer-configured',()=>{if(fxOn&&allowFX&&!customButtons&&!initialFxStarted&&st.ef&&st.ea&&st.fm!==0){initialFxStarted=true;window.xyzViewPlayFX();}});
const morphType=q.get('labelfx') || (q.get('gpu20k')==='1'?'gpu20k':q.get('morph')==='1'?'morph':'none');
let morphFrame=0, morphSettings=null;
function morphRestore(){
 cancelAnimationFrame(morphFrame);morphFrame=0;
 const eng=V.getEngine();if(!eng)return;
 try{eng.set('image.splats.fx_progress',0);eng.set('image.splats.fx_mode',0);if(morphSettings){eng.set('display.splats.scale',morphSettings.scale);eng.set('image.splats.antialias',morphSettings.aa)}}catch(e){}
 morphSettings=null;
}
function launchBlueMorph(){
 if(!fxOn)return;
 const eng=V.getEngine();if(!eng)return showInfo('Модель ещё загружается.');
 morphRestore();
 const val=(name,d)=>{const raw=q.get(name);const v=Number(raw);return raw!==null&&Number.isFinite(v)?v:d};
 const size=clamp(val('morphsize',.065),.004,.120),density=clamp(val('morphdensity',1.35),.5,3);
 const screenFloor=clamp(size*13*(.72+.34*density),.10,2.10);
 morphSettings={scale:V.getInitial().s>1?V.getInitial().s/100:V.getInitial().s,aa:V.getInitial().a>2?V.getInitial().a/20:V.getInitial().a};
 const uniform={fx_power:q.get('morphdepth')==='1'?2:1,fx_radius:q.get('morphmirror')==='1'?-100:100,
 fx_rotx:val('morphx',0),fx_roty:val('morphy',0),fx_rotz:val('morphz',180),
 fx_logox:val('morphox',0),fx_logoy:val('morphoy',0),fx_logoz:val('morphheight',0),
 fx_labelsize:size,fx_labeldensity:density,fx_morphradius:clamp(val('morphradius',1.5),.5,20),
 fx_morphpower:clamp(val('morphpower',1),0,30),fx_textscale:clamp(val('morphscale',1),.1,10)};
 try{for(const [key,value] of Object.entries(uniform))eng.set('image.splats.'+key,value);
 eng.set('display.splats.scale',.48);eng.set('image.splats.antialias',screenFloor);eng.set('image.splats.fx_mode',9)}
 catch(e){morphRestore();showInfo('MORPH: '+e.message);return}
 const total=clamp(val('morphduration',8)*1000,2500,40000),t0=performance.now();
 function frame(now){const a=clamp((now-t0)/total,0,1),up=.5,hold=.012,down=1-up-hold;const p=a<up?a/up:a<up+hold?1:1-(a-up-hold)/down;
 try{eng.set('image.splats.fx_progress',clamp(p,0,1))}catch(e){morphRestore();return}
 if(a<1)morphFrame=requestAnimationFrame(frame);else morphRestore()}
 morphFrame=requestAnimationFrame(frame);
}
window.addEventListener('xyz-brand-label',event=>{if(fxOn && event.detail?.mode==='morph'&&morphType==='morph')launchBlueMorph()});
function showInfo(message){let el=$('message');if(el){el.hidden=false;el.textContent=message;setTimeout(()=>{if(el.textContent===message)el.hidden=true},4500)}}
function resize(){
 if(!effectsAvailable)return;
 const dpr=Math.min(devicePixelRatio||1,V.lowQuality?.75:1.5);
 canvas.width=Math.max(1,Math.round(innerWidth*dpr));
 canvas.height=Math.max(1,Math.round(innerHeight*dpr));
 ctx.setTransform(dpr,0,0,dpr,0,0);
 warpStars=[];
}
window.addEventListener('resize',resize);resize();
function effectFrame(now){
 const dt=lastFx?clamp((now-lastFx)/1000,0,.05):1/60;
 lastFx=now;
 const w=innerWidth,h=innerHeight;
 fxAnim=requestAnimationFrame(effectFrame);
 if(!fxOn)return;
 ctx.clearRect(0,0,w,h);
 const speed=clamp(number(st.hs70,3),.2,12);
 const density=clamp(number(st.hd70,65)/100,.05,1);
 const wanted=Math.round(clamp(number(st.hc70,250),1,1200)*density);
 const cx=w*.5,cy=h*.5;
 // Refill at center with gradual acceleration.
 if(warpStars.length<wanted){const add=Math.min(wanted-warpStars.length,Math.max(2,Math.ceil(90*dt*speed*density)));for(let i=0;i<add;i++)warpStars.push(spawnWarp(1+Math.random()*17));}
 else if(warpStars.length>wanted)warpStars.length=wanted;
 const maxr=Math.hypot(w,h)*.65;
 ctx.globalCompositeOperation='lighter';
 for(const st of warpStars){const prev=st.r;st.r+=dt*(90+st.r*.7)*speed*st.v;
  if(st.r>maxr){Object.assign(st,spawnWarp(1+Math.random()*7));continue}
  const x1=cx+Math.cos(st.a)*prev,y1=cy+Math.sin(st.a)*prev;
  const x2=cx+Math.cos(st.a)*st.r,y2=cy+Math.sin(st.a)*st.r;
  const shine=Math.min(1,st.r/Math.max(65,w*.35))*.8+.12;
  ctx.strokeStyle='hsla('+st.h+',100%,78%,'+(shine*st.alpha*.8)+')';ctx.lineWidth=st.width+(shine*.45);ctx.beginPath();ctx.moveTo(x1,y1);ctx.lineTo(x2,y2);ctx.stroke();
 }
 ctx.globalCompositeOperation='source-over';
}
function spawnWarp(radius){
 return {a:Math.random()*Math.PI*2,r:radius,v:.55+Math.random()*.95,h:180+Math.random()*50,alpha:.5+Math.random()*.5,width:.45+Math.random()*.9};
}
setFxEnabled(st.fm!==0);
window.addEventListener('pageshow',event=>{if(event.persisted)setFxEnabled(fxOn)});
window.addEventListener('xyz-model-fire-start16',()=>{nativeReset();morphRestore();});
window.addEventListener('pagehide',()=>{cancelAnimationFrame(fxAnim);nativeReset();window.dispatchEvent(new Event('xyz-viewer-fx-off'));audio.pause()});

let uiAudio=null,lastTone=0;
function uiTone(e){if(!st.ue||!e.isTrusted||performance.now()-lastTone<95)return;const vol=clamp(number(st.uv,85)/100,0,1);if(!vol)return;lastTone=performance.now();
 const AC=window.AudioContext||window.webkitAudioContext;if(!AC)return;uiAudio=uiAudio||new AC();
 const sound=()=>{if(uiAudio.state!=='running')return;const ac=uiAudio,t=ac.currentTime,osc=ac.createOscillator(),gain=ac.createGain();
 const zoom=e.type==='wheel';osc.type='sine';osc.frequency.setValueAtTime(zoom?420:660,t);osc.frequency.exponentialRampToValueAtTime(zoom?340:820,t+.055);gain.gain.setValueAtTime(.0001,t);gain.gain.exponentialRampToValueAtTime(Math.max(.0002,vol*.22),t+.008);gain.gain.exponentialRampToValueAtTime(.0001,t+.055);osc.connect(gain);gain.connect(ac.destination);osc.start(t);osc.stop(t+.065)};
 if(uiAudio.state==='running')sound();else uiAudio.resume().then(sound).catch(()=>{});
}
window.addEventListener('pointerdown',uiTone,{passive:true});window.addEventListener('wheel',uiTone,{passive:true});
})();
