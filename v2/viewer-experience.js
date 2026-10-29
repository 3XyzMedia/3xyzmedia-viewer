/* 3XyzMedia spectator playback: FX and media from v72 SHARE, no authoring controls. */
(()=>{'use strict';
const V=window.XYZViewer;if(!V)return;
const $=id=>document.getElementById(id),st=V.state||{},q=V.params;
const clamp=(x,a,b)=>Math.max(a,Math.min(b,x)),number=(v,d=0)=>Number.isFinite(Number(v))?Number(v):d;
const allowFX=q.get('fxui')!=='0',allowMusic=q.get('musicui')!=='0';
let fxOn=true,fxAnim=0,lastFx=0,stars=[],snow=[],meteors=[],fireworks=[],nativeFrame=0,showFire=false;
const fx=$('fx'), burst=$('burst'), label=$('label'), mp3=$('mp3'),audio=$('viewerAudio');
const canvas=$('experienceCanvas'),ctx=canvas.getContext('2d');
const effectsAvailable=!!(st.wx&&st.wx!=='off'||st.sk&&st.sk!=='off'||st.zt||st.cx||st.mt||st.au||st.fw||st.ne||st.h70||st.sb70||st.ef||st.e3||st.lm&&st.lm!=='off');
if(allowFX){fx.hidden=false;fx.classList.add('active');fx.addEventListener('click',()=>{fxOn=!fxOn;fx.classList.toggle('active',fxOn);if(!fxOn)ctx.clearRect(0,0,canvas.width,canvas.height);});}
function safeMusic(src){if(typeof src!=='string')return '';let t=src.trim();if(!t)t='/VIEWER/music/peremen.mp3';
 try{let u=new URL(t, location.origin);if(u.protocol!=='https:'&&u.origin!==location.origin)return '';if(!/\.mp3(?:$|\?)/i.test(u.pathname))return '';
 if(t.startsWith('/VIEWER/music/'))u=new URL('https://3xyzmedia.github.io'+t);return u.href;}catch(e){return ''}}
let musicURL=safeMusic(st.mp||'/VIEWER/music/peremen.mp3'),musicDisabled=false,pending=false;
if(allowMusic&&musicURL){mp3.hidden=false;mp3.textContent='♫ MP3';mp3.title='Нажмите для музыки';audio.volume=clamp(number(st.mv,30)/100,0,1);
 mp3.addEventListener('click',()=>{if(!audio.paused){musicDisabled=true;audio.pause();updateMusic();return;}musicDisabled=false;startMusic();});
 audio.addEventListener('play',updateMusic);audio.addEventListener('pause',updateMusic);audio.addEventListener('error',()=>{mp3.title='MP3 недоступен. Проверьте путь SHARE';});}
function updateMusic(){mp3.textContent=audio.paused?'♫ MP3':'♫ STOP';mp3.classList.toggle('active',!audio.paused)}
function startMusic(){if(!musicURL||pending||!audio.paused)return;if(!audio.src)audio.src=musicURL;
 pending=true;const p=audio.play();if(p&&p.then)p.then(()=>{pending=false;updateMusic()}).catch(()=>{pending=false;updateMusic()});else{pending=false;updateMusic()}}
// Browser audio policies: first trusted gesture, not a synthetic timer. Wheel works on desktop.
function gesture(){if(musicDisabled||!musicURL||!st.me||st.ma===0||st.ma===false)return;startMusic()}
for(const ev of ['pointerdown','touchstart','keydown','wheel'])window.addEventListener(ev,gesture,{capture:true,passive:true});
function sceneSet(key,value){try{let k=V.getEngine();if(!k)return false;k.set('image.splats.'+key,value);return true}catch(e){return false}}
function nativeReset(){cancelAnimationFrame(nativeFrame);nativeFrame=0;showFire=false;sceneSet('fx_progress',0);sceneSet('fx_mode',0);sceneSet('fx_power',1);sceneSet('fx_radius',100);sceneSet('fx_labeldensity',1.1);}
function nativeAnimate(mode,duration=4500,power=2,radius=100){let k=V.getEngine();if(!k)return;nativeReset();sceneSet('fx_power',power);sceneSet('fx_radius',radius);sceneSet('fx_mode',mode);
 const start=performance.now();showFire=mode===6;
 function frame(now){let t=clamp((now-start)/duration,0,1);sceneSet('fx_progress',t*t*(3-2*t));if(t<1)nativeFrame=requestAnimationFrame(frame);else{nativeFrame=0;nativeReset()}}nativeFrame=requestAnimationFrame(frame)}
if(allowFX&&(st.ef||q.get('fxui')==='1')){burst.hidden=false;burst.addEventListener('click',()=>nativeAnimate(clamp(Math.round(number(st.em,1)),1,6),clamp(4300/Math.max(.1,number(st.et,1)),900,25000),number(st.ep,2),number(st.er,90)));}
const morphType=q.get('labelfx')|| (q.get('gpu20k')==='1'?'gpu20k':q.get('morph')==='1'?'morph':'none');
if(morphType==='morph'||morphType==='gpu20k'){
 label.hidden=false;
 label.addEventListener('click',()=>{
 if(morphType==='gpu20k'){if(window.xyzViewer20k){window.xyzViewer20k.start()}else showInfo('MORPH 20K ещё загружается.');return;}
 const size=number(q.get('morphsize'),.065),density=number(q.get('morphdensity'),1.35);
 sceneSet('fx_rotx',number(q.get('morphx'),0));sceneSet('fx_roty',number(q.get('morphy'),0));sceneSet('fx_rotz',number(q.get('morphz'),180));
 sceneSet('fx_logox',number(q.get('morphox'),0));sceneSet('fx_logoy',number(q.get('morphoy'),0));sceneSet('fx_logoz',number(q.get('morphheight'),0));
 sceneSet('fx_labelsize',size);sceneSet('fx_labeldensity',density);
 sceneSet('fx_morphradius',number(q.get('morphradius'),1.5));sceneSet('fx_morphpower',number(q.get('morphpower'),1));sceneSet('fx_textscale',number(q.get('morphscale'),1));
 // shader mode 9 for native old blue morph; 8-second up/down envelope
 const engine=V.getEngine();if(!engine)return;cancelAnimationFrame(nativeFrame);
 const total=clamp(number(q.get('morphduration'),8)*1000,1500,60000),t0=performance.now();sceneSet('fx_mode',9);
 function frame(now){const p=clamp((now-t0)/total,0,1),f=p<.5?p*2:(1-p)*2;sceneSet('fx_progress',f);if(p<1)nativeFrame=requestAnimationFrame(frame);else nativeReset()}nativeFrame=requestAnimationFrame(frame);
 });}
function showInfo(message){let el=$('message');if(el){el.hidden=false;el.textContent=message;setTimeout(()=>{if(el.textContent===message)el.hidden=true},4500)}}
function resize(){let scale=Math.min(devicePixelRatio||1,1.6);canvas.width=Math.max(1,Math.floor(innerWidth*scale));canvas.height=Math.max(1,Math.floor(innerHeight*scale));
 const w=canvas.width,h=canvas.height;stars=Array.from({length:clamp(number(st.zd,70)*2,25,350)|0},()=>({x:Math.random()*w,y:Math.random()*h,r:Math.random()*1.8+.5,t:Math.random()*6.28}));
 snow=Array.from({length:clamp(number(st.wi,60)*1.7,20,220)|0},()=>({x:Math.random()*w,y:Math.random()*h,r:Math.random()*2+.7,v:Math.random()*1.6+.4}));
 meteors=[];fireworks=[];}
window.addEventListener('resize',resize);resize();
function effectFrame(now){let dt=lastFx?clamp((now-lastFx)/16,0,4):1;lastFx=now;const w=canvas.width,h=canvas.height;
 ctx.clearRect(0,0,w,h);fxAnim=requestAnimationFrame(effectFrame);if(!fxOn)return;
 const snowOn=st.wx==='snow',rainOn=st.wx==='rain',starsOn=!!st.zt||st.sk==='stars',auroraOn=!!st.au||st.sk==='aurora',hyperspace=!!st.h70;
 if(auroraOn){const t=now*.00015,alpha=clamp(number(st.ai,50)/100,0.08,.75);ctx.globalAlpha=alpha;
 for(let n=0;n<4;n++){let grd=ctx.createLinearGradient(0,0,0,h*.85);grd.addColorStop(0,'rgba(10,140,255,0)');grd.addColorStop(.45,n%2?'rgba(16,255,180,.16)':'rgba(100,95,255,.2)');grd.addColorStop(1,'rgba(0,0,0,0)');ctx.fillStyle=grd;ctx.beginPath();ctx.moveTo(0,h);for(let x=0;x<=w+40;x+=40){let y=h*.24+Math.sin(x/w*9+t*3+n)*h*.09+n*h*.065;ctx.lineTo(x,y)}ctx.lineTo(w,h);ctx.fill()}ctx.globalAlpha=1;}
 if(st.cx){const cx=w*.5,cy=h*.47,r=Math.min(w,h)*.65;const gradient=ctx.createRadialGradient(cx,cy,0,cx,cy,r);gradient.addColorStop(0,'rgba(36,65,120,.08)');gradient.addColorStop(.7,'rgba(45,15,80,.12)');gradient.addColorStop(1,'transparent');ctx.fillStyle=gradient;ctx.fillRect(0,0,w,h)}
 if(starsOn||hyperspace){const v=hyperspace?clamp(number(st.hs70,3),.5,12):0;ctx.fillStyle='rgba(185,231,255,.85)';ctx.strokeStyle='rgba(119,220,255,.4)';for(const p of stars){if(hyperspace){p.x+=((p.x-w/2)/w)*dt*v*4;p.y+=((p.y-h/2)/h)*dt*v*4;if(p.x<0||p.x>w||p.y<0||p.y>h){p.x=w/2+(Math.random()-.5)*w*.2;p.y=h/2+(Math.random()-.5)*h*.2}ctx.beginPath();ctx.moveTo(p.x,p.y);ctx.lineTo(p.x-(p.x-w/2)*.06,p.y-(p.y-h/2)*.06);ctx.stroke()}else{ctx.globalAlpha=.45+.4*Math.sin(now*.002+p.t);ctx.beginPath();ctx.arc(p.x,p.y,p.r,0,Math.PI*2);ctx.fill()}}ctx.globalAlpha=1;}
 if(snowOn||rainOn){ctx.strokeStyle='rgba(180,225,255,.65)';ctx.fillStyle='rgba(230,249,255,.85)';for(const p of snow){if(rainOn){ctx.beginPath();ctx.moveTo(p.x,p.y);ctx.lineTo(p.x-2,p.y+Math.max(7,p.v*10));ctx.stroke()}else{ctx.beginPath();ctx.arc(p.x,p.y,p.r,0,Math.PI*2);ctx.fill()}p.y+=p.v*dt*(rainOn?8:clamp(number(st.ws,1),.2,10));if(p.y>h){p.y=0;p.x=Math.random()*w}}}
 if(st.mt){if(Math.random()<.008*number(st.mi,60)/50&&meteors.length<10)meteors.push({x:Math.random()*w,y:Math.random()*h*.55,v:8+Math.random()*10,life:1});ctx.strokeStyle='rgba(166,233,255,.8)';ctx.lineWidth=1.6;for(const p of meteors){ctx.beginPath();ctx.moveTo(p.x,p.y);ctx.lineTo(p.x-p.v*5,p.y-p.v*2);ctx.stroke();p.x+=p.v*dt;p.y+=p.v*.6*dt;p.life-=.02*dt}meteors=meteors.filter(p=>p.life>0&&p.x<w)}
 if(st.fw){if(Math.random()<.012*number(st.fr,45)/45&&fireworks.length<12)fireworks.push({x:Math.random()*w,y:Math.random()*h*.6,v:Math.random()*7,life:1});for(const f of fireworks){ctx.strokeStyle=`rgba(170,240,255,${f.life*.75})`;for(let i=0;i<18;i++){let ang=i*Math.PI/9;ctx.beginPath();ctx.moveTo(f.x+Math.cos(ang)*f.v*3,f.y+Math.sin(ang)*f.v*3);ctx.lineTo(f.x+Math.cos(ang)*(f.v*3+9),f.y+Math.sin(ang)*(f.v*3+9));ctx.stroke()}f.v+=dt*.25;f.life-=dt*.022}fireworks=fireworks.filter(p=>p.life>0)}
 if(st.sb70){const hz=clamp(number(st.sh70,2),.3,8),brightness=clamp(number(st.sb70,10)/100,0,.35);let pulse=(Math.sin(now*.001*Math.PI*2*hz)+1)*.5;ctx.fillStyle=`rgba(160,220,255,${brightness*pulse})`;ctx.fillRect(0,0,w,h)}
 if(showFire){let yy=h*.82,base=w*.5;for(let i=0;i<44;i++){const x=base+(Math.random()-.5)*w*.17,hh=h*(.06+Math.random()*.22);const g=ctx.createLinearGradient(x,yy,x,yy-hh);g.addColorStop(0,'rgba(255,70,0,.5)');g.addColorStop(.6,'rgba(255,175,30,.2)');g.addColorStop(1,'transparent');ctx.fillStyle=g;ctx.beginPath();ctx.moveTo(x-12,yy);ctx.lineTo(x+12,yy);ctx.lineTo(x+(Math.random()-.5)*25,yy-hh);ctx.fill()}}
}
fxAnim=requestAnimationFrame(effectFrame);
window.addEventListener('pagehide',()=>{cancelAnimationFrame(fxAnim);nativeReset();audio.pause()});
})();