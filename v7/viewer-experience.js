/* 3XyzMedia spectator playback: FX and media from v72 SHARE, no authoring controls. */
(()=>{'use strict';
const V=window.XYZViewer;if(!V)return;
const $=id=>document.getElementById(id),st=V.state||{},q=V.params;
const clamp=(x,a,b)=>Math.max(a,Math.min(b,x)),number=(v,d=0)=>Number.isFinite(Number(v))?Number(v):d;
const allowFX=q.get('fxui')!=='0',allowMusic=q.get('musicui')!=='0';
let fxOn=true,fxAnim=0,lastFx=0,stars=[],snow=[],meteors=[],fireworks=[],nativeFrame=0,showFire=false,skyFlightStars=[],warpStars=[];
const fx=$('fxToggle'), burst=$('burst'), mp3=$('mp3'),audio=$('viewerAudio');
const canvas=$('experienceCanvas'),ctx=canvas.getContext('2d');
const effectsAvailable=!!(st.wx&&st.wx!=='off'||st.sk&&st.sk!=='off'||st.zt||st.cx||st.mt||st.au||st.fw||st.ne||st.h70||st.ef||st.e3||st.lm&&st.lm!=='off');
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
   meteors=[];fireworks=[];showFire=false;
 }
 window.__xyzViewFXOn=fxOn;
 if(fxOn)window.dispatchEvent(new Event('xyz-viewer-fx-on'));
}
window.xyzViewerFXSetEnabled=setFxEnabled;
if(allowFX){fx.classList.add('active');fx.addEventListener('click',()=>setFxEnabled(!fxOn))}

function safeMusic(src){if(typeof src!=='string')return '';let t=src.trim();if(!t)t='/VIEWER/music/peremen.mp3';
 try{let u=new URL(t, location.origin);if(u.protocol!=='https:'&&u.origin!==location.origin)return '';if(!/\.mp3(?:$|\?)/i.test(u.pathname))return '';
 if(t.startsWith('/VIEWER/music/'))u=new URL('https://3xyzmedia.github.io'+t);return u.href;}catch(e){return ''}}
let musicURL=safeMusic(st.mp||'/VIEWER/music/peremen.mp3'),musicDisabled=false,pending=false;
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
function nativeReset(){cancelAnimationFrame(nativeFrame);nativeFrame=0;showFire=false;sceneSet('fx_progress',0);sceneSet('fx_mode',0);sceneSet('fx_power',1);sceneSet('fx_radius',100);sceneSet('fx_labeldensity',1.1);}
function nativeAnimate(mode,duration=4500,power=2,radius=100){let k=V.getEngine();if(!k)return;nativeReset();sceneSet('fx_power',power);sceneSet('fx_radius',radius);sceneSet('fx_mode',mode);
 const start=performance.now();showFire=mode===6 && !st.e3;
 function frame(now){let t=clamp((now-start)/duration,0,1);sceneSet('fx_progress',t*t*(3-2*t));if(t<1)nativeFrame=requestAnimationFrame(frame);else{nativeFrame=0;nativeReset()}}nativeFrame=requestAnimationFrame(frame)}
window.xyzViewPlayFX=(requested)=>{if(!fxOn)return;const mode=clamp(Math.round(number(requested??st.em,1)),1,6);const duration=clamp((mode===3||mode===4?3600:mode===5?5200:mode===6?5400:4300)/Math.max(.25,number(st.et,1)),900,25000);nativeAnimate(mode,duration,number(st.ep,1),number(st.er,100));if(mode===6 && st.e3)window.dispatchEvent(new CustomEvent('xyz-viewer-fire',{detail:{duration,power:number(st.ep,1),height:number(st.eh,1),anchor:number(st.eo,0),base:!!st.eb,threeD:!!st.e3}}));};
if(allowFX&&(st.ef||q.get('fxui')==='1')){burst.hidden=false;burst.addEventListener('click',()=>window.xyzViewPlayFX());}
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
function resize(){let scale=Math.min(devicePixelRatio||1,1.6);canvas.width=Math.max(1,Math.floor(innerWidth*scale));canvas.height=Math.max(1,Math.floor(innerHeight*scale));
 const w=canvas.width,h=canvas.height;stars=Array.from({length:clamp(number(st.zd,70)*2,25,350)|0},()=>({x:Math.random()*w,y:Math.random()*h,r:Math.random()*1.8+.5,t:Math.random()*6.28}));
 snow=Array.from({length:clamp(number(st.wi,60)*1.7,20,220)|0},()=>({x:Math.random()*w,y:Math.random()*h,r:Math.random()*2+.7,v:Math.random()*1.6+.4}));
 skyFlightStars=Array.from({length:Math.max(140,Math.min(1400,Math.round(number(st.fc,600))))},()=>({a:Math.random()*Math.PI*2,z:Math.random()*.9+.05,tw:Math.random()*6.28,sz:Math.random()}));
 warpStars=[];
 meteors=[];fireworks=[];}
window.addEventListener('resize',resize);resize();
function effectFrame(now){let dt=lastFx?clamp((now-lastFx)/16,0,4):1;lastFx=now;const w=canvas.width,h=canvas.height;
 ctx.clearRect(0,0,w,h);fxAnim=requestAnimationFrame(effectFrame);if(!fxOn)return;
 const snowOn=st.wx==='snow',rainOn=st.wx==='rain',starsOn=false,auroraOn=!!st.au||st.sk==='aurora',hyperspace=!!st.h70; // stars now rendered by exact v72 module
 if(auroraOn){const t=now*.00015,alpha=clamp(number(st.ai,50)/100,0.08,.75);ctx.globalAlpha=alpha;
 for(let n=0;n<4;n++){let grd=ctx.createLinearGradient(0,0,0,h*.85);grd.addColorStop(0,'rgba(10,140,255,0)');grd.addColorStop(.45,n%2?'rgba(16,255,180,.16)':'rgba(100,95,255,.2)');grd.addColorStop(1,'rgba(0,0,0,0)');ctx.fillStyle=grd;ctx.beginPath();ctx.moveTo(0,h);for(let x=0;x<=w+40;x+=40){let y=h*.24+Math.sin(x/w*9+t*3+n)*h*.09+n*h*.065;ctx.lineTo(x,y)}ctx.lineTo(w,h);ctx.fill()}ctx.globalAlpha=1;}
 if(st.cx){const cx=w*.5,cy=h*.47,r=Math.min(w,h)*.65;const gradient=ctx.createRadialGradient(cx,cy,0,cx,cy,r);gradient.addColorStop(0,'rgba(36,65,120,.08)');gradient.addColorStop(.7,'rgba(45,15,80,.12)');gradient.addColorStop(1,'transparent');ctx.fillStyle=gradient;ctx.fillRect(0,0,w,h)}
 if(false){ // replaced by v72 exact Sky Flight module
   // Port of the static-sky star-flight renderer in STUDIO v72: depth-based stars, not streaks.
   const cx=w*.5,cy=h*.49,rx=w*.72,ry=h*.60;
   const speed=clamp(number(st.fs,1),.1,12),dts=clamp(dt/60,0,.05);
   ctx.globalCompositeOperation='lighter';
   for(const star of skyFlightStars){
     star.z+=dts*(.055+.025*star.sz)*speed;
     if(star.z>=1)star.z=.05+(star.z-1);
     const k=star.z*star.z,x=cx+Math.cos(star.a)*rx*k,y=cy+Math.sin(star.a)*ry*k;
     const size=(.12+2*k)*(star.sz>.75?1.2:.76);
     const sparkle=.78+.22*Math.sin(now*.0026+star.tw*3.1);
     const alpha=Math.min(.97,(.15+.82*k)*sparkle);
     const palette=['210,235,255','255,224,185','186,218,255','220,193,255','171,245,255','255,203,219'];
     const rgb=palette[Math.min(palette.length-1,Math.floor(star.sz*palette.length))];
     ctx.fillStyle=`rgba(${rgb},${alpha})`;
     ctx.beginPath();ctx.arc(x,y,size,0,Math.PI*2);ctx.fill();
     if(k>.59&&star.sz>.82){ctx.strokeStyle=`rgba(${rgb},${.13*sparkle*k})`;ctx.lineWidth=.65;const rr=2.2+size*1.45;ctx.beginPath();ctx.moveTo(x-rr,y);ctx.lineTo(x+rr,y);ctx.moveTo(x,y-rr);ctx.lineTo(x,y+rr);ctx.stroke()}
   }
   ctx.globalCompositeOperation='source-over';
 }
 if(starsOn){ctx.fillStyle='rgba(185,231,255,.86)';for(const star of stars){ctx.globalAlpha=.45+.4*Math.sin(now*.002+star.t);ctx.beginPath();ctx.arc(star.x,star.y,star.r,0,Math.PI*2);ctx.fill()}ctx.globalAlpha=1;}
 if(hyperspace){
   // Original v72 HYPERSPACE behavior: only enable when h70 explicitly true.
   const speed=clamp(number(st.hs70,3),.2,12),density=clamp(number(st.hd70,65)/100,.05,1);
   const desired=clamp(Math.round(number(st.hc70,250)*density),1,1200);
   while(warpStars.length<desired){if(warpStars.length>=desired)break;warpStars.push({a:Math.random()*Math.PI*2,r:Math.random()*18+1,v:.55+Math.random()*.95,alpha:.5+Math.random()*.5,width:.45+Math.random()*.9})}
   if(warpStars.length>desired)warpStars.length=desired;
   const maxr=Math.hypot(w,h)*.65,cx=w*.5,cy=h*.5;
   ctx.globalCompositeOperation='lighter';
   for(const star of warpStars){const prev=star.r;star.r+=clamp(dt/60,0,.05)*(90+star.r*.7)*speed*star.v;
     if(star.r>maxr){star.r=1+Math.random()*8;star.a=Math.random()*Math.PI*2;continue}
     const x1=cx+Math.cos(star.a)*prev,y1=cy+Math.sin(star.a)*prev;
     const x2=cx+Math.cos(star.a)*star.r,y2=cy+Math.sin(star.a)*star.r;
     const shine=Math.min(1,star.r/Math.max(65,w*.35))*.8+.12;
     ctx.strokeStyle=`rgba(125,220,255,${shine*star.alpha*.8})`;
     ctx.lineWidth=star.width+shine*.45;ctx.beginPath();ctx.moveTo(x1,y1);ctx.lineTo(x2,y2);ctx.stroke();
   }
   ctx.globalCompositeOperation='source-over';
 }
 if(snowOn||rainOn){ctx.strokeStyle='rgba(180,225,255,.65)';ctx.fillStyle='rgba(230,249,255,.85)';for(const p of snow){if(rainOn){ctx.beginPath();ctx.moveTo(p.x,p.y);ctx.lineTo(p.x-2,p.y+Math.max(7,p.v*10));ctx.stroke()}else{ctx.beginPath();ctx.arc(p.x,p.y,p.r,0,Math.PI*2);ctx.fill()}p.y+=p.v*dt*(rainOn?8:clamp(number(st.ws,1),.2,10));if(p.y>h){p.y=0;p.x=Math.random()*w}}}
 if(st.mt){if(Math.random()<.008*number(st.mi,60)/50&&meteors.length<10)meteors.push({x:Math.random()*w,y:Math.random()*h*.55,v:8+Math.random()*10,life:1});ctx.strokeStyle='rgba(166,233,255,.8)';ctx.lineWidth=1.6;for(const p of meteors){ctx.beginPath();ctx.moveTo(p.x,p.y);ctx.lineTo(p.x-p.v*5,p.y-p.v*2);ctx.stroke();p.x+=p.v*dt;p.y+=p.v*.6*dt;p.life-=.02*dt}meteors=meteors.filter(p=>p.life>0&&p.x<w)}
 if(st.fw){if(Math.random()<.012*number(st.fr,45)/45&&fireworks.length<12)fireworks.push({x:Math.random()*w,y:Math.random()*h*.6,v:Math.random()*7,life:1});for(const f of fireworks){ctx.strokeStyle=`rgba(170,240,255,${f.life*.75})`;for(let i=0;i<18;i++){let ang=i*Math.PI/9;ctx.beginPath();ctx.moveTo(f.x+Math.cos(ang)*f.v*3,f.y+Math.sin(ang)*f.v*3);ctx.lineTo(f.x+Math.cos(ang)*(f.v*3+9),f.y+Math.sin(ang)*(f.v*3+9));ctx.stroke()}f.v+=dt*.25;f.life-=dt*.022}fireworks=fireworks.filter(p=>p.life>0)}
 // STROBE is never enabled by brightness alone. Original v72 does not autoplay it.
 if(showFire){let yy=h*.82,base=w*.5;for(let i=0;i<44;i++){const x=base+(Math.random()-.5)*w*.17,hh=h*(.06+Math.random()*.22);const g=ctx.createLinearGradient(x,yy,x,yy-hh);g.addColorStop(0,'rgba(255,70,0,.5)');g.addColorStop(.6,'rgba(255,175,30,.2)');g.addColorStop(1,'transparent');ctx.fillStyle=g;ctx.beginPath();ctx.moveTo(x-12,yy);ctx.lineTo(x+12,yy);ctx.lineTo(x+(Math.random()-.5)*25,yy-hh);ctx.fill()}}
}
fxAnim=requestAnimationFrame(effectFrame);
window.addEventListener('pagehide',()=>{cancelAnimationFrame(fxAnim);nativeReset();window.dispatchEvent(new Event('xyz-viewer-fx-off'));audio.pause()});
})();