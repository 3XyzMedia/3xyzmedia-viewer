                                                                           
                                                                                  
(() => {
'use strict';
const viewer=window.XYZViewer;
if (!viewer) return;
const st=viewer.state;
const effectiveQuality=()=>viewer.lowQuality?'low':'high';
const setting=(value,fallback,min,max)=>Math.max(min,Math.min(max,Number(value)||fallback));
function layer(id,z){
  const canvas=document.createElement('canvas');
  canvas.id=id;
  canvas.setAttribute('aria-hidden','true');
  Object.assign(canvas.style,{position:'fixed',inset:'0',pointerEvents:'none',zIndex:String(z),display:'none'});
  document.body.append(canvas);
  return canvas;
}
function resizeOverlayCanvas(canvas, ctx){
  const autoMobile = window.matchMedia('(max-width: 700px)').matches; const dpr = Math.min(window.devicePixelRatio || 1, effectiveQuality()==='low'?.75:(autoMobile?1.2:1.65));
  canvas.width = Math.round(window.innerWidth * dpr);
  canvas.height = Math.round(window.innerHeight * dpr);
  canvas.style.width = window.innerWidth + 'px'; canvas.style.height = window.innerHeight + 'px';
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  return {w:window.innerWidth,h:window.innerHeight,dpr};
}
const fwCanvas=layer('fireworksOverlay', 7), fwCtx=fwCanvas.getContext('2d',{alpha:true});
const fireworksEnabled=!!st.fw, fireworksIntensity=setting(st.fi,70,20,100), fireworksRate=setting(st.fr,45,10,100);
let fwFrame=0, fwLast=0, fwNextAt=0, fwRockets=[], fwParticles=[], fwLastLaunch=0;
const fwPalette=['#fff7d6','#ffd36a','#ff9d45','#ff5c8a','#ff64d8','#b99bff','#7cecff','#8affc1','#ffffff'];
function resizeFireworks(){resizeOverlayCanvas(fwCanvas,fwCtx)}
function fwRand(a,b){return a+Math.random()*(b-a)}
function launchFirework(x,y,manual=false){
  const w=window.innerWidth,h=window.innerHeight;
  x=x==null?fwRand(w*.12,w*.88):x; y=y==null?fwRand(h*.12,h*.55):y;
  const startY=h+fwRand(10,h*.14), color=fwPalette[Math.floor(Math.random()*fwPalette.length)];
  fwRockets.push({x,y:startY,tx:x,ty:y,v:fwRand(5.4,8.6),color,age:0,manual});
  if(fwRockets.length>10)fwRockets.shift();
}
function burstFirework(x,y,color){
  const level=fireworksIntensity/100;
  const styles=['chrysanthemum','peony','ring','willow','palm'];
  const style=styles[Math.floor(Math.random()*styles.length)];
  const count=Math.round((style==='ring'?68:style==='willow'?95:82)*(.55+level*.72));
  const base=fwPalette[Math.floor(Math.random()*fwPalette.length)];
  for(let i=0;i<count;i++){
    const angle=(Math.PI*2*i/count)+fwRand(-.025,.025);
    let speed=style==='ring'?fwRand(2.2,3.8):style==='willow'?fwRand(1.0,3.4):fwRand(1.4,4.8);
    if(style==='palm'&&i%5===0)speed*=1.3;
    const hueColor=(Math.random()<.58?base:(Math.random()<.5?color:fwPalette[Math.floor(Math.random()*fwPalette.length)]));
    fwParticles.push({x,y,vx:Math.cos(angle)*speed,vy:Math.sin(angle)*speed,life:style==='willow'?fwRand(100,165):fwRand(55,105),age:0,color:hueColor,r:style==='willow'?fwRand(.65,1.45):fwRand(.7,1.8),gravity:style==='willow'?.035:.055,drag:style==='willow'?.986:.978,twinkle:Math.random()<.28,trail:style==='willow'||Math.random()<.28});
  }
                                                                                              
  const glitter=Math.round(24+level*22);
  for(let i=0;i<glitter;i++){const a=Math.random()*Math.PI*2,sp=fwRand(.6,2.2);fwParticles.push({x,y,vx:Math.cos(a)*sp,vy:Math.sin(a)*sp,life:fwRand(65,125),age:0,color:Math.random()<.7?'#fff2bc':base,r:fwRand(.35,.85),gravity:.04,drag:.985,twinkle:true,trail:true});}
  if(fwParticles.length>2600)fwParticles.splice(0,fwParticles.length-2600);
}
function drawFireworks(now){
  const w=window.innerWidth,h=window.innerHeight,dt=fwLast?Math.min(2,(now-fwLast)/16.67):1;fwLast=now;
  fwCtx.clearRect(0,0,w,h);fwCtx.globalCompositeOperation='lighter';
  if(fireworksEnabled&&now>=fwNextAt){launchFirework();const base=2800-(fireworksRate*22);fwNextAt=now+base+Math.random()*Math.max(600,2400-fireworksRate*14)}
  const nextR=[];
  for(const r of fwRockets){r.age+=dt;const dx=r.tx-r.x,dy=r.ty-r.y,dist=Math.hypot(dx,dy);const step=Math.min(dist,r.v*dt*2.2);r.x+=dx/(dist||1)*step;r.y+=dy/(dist||1)*step;
    fwCtx.globalAlpha=.9;fwCtx.strokeStyle=r.color;fwCtx.lineWidth=1.2;fwCtx.beginPath();fwCtx.moveTo(r.x,r.y+9);fwCtx.lineTo(r.x-dx/(dist||1)*9,r.y-dy/(dist||1)*9);fwCtx.stroke();fwCtx.fillStyle='#fff9df';fwCtx.beginPath();fwCtx.arc(r.x,r.y,1.7,0,Math.PI*2);fwCtx.fill();
    if(dist<r.v*dt*2.6||r.age>95)burstFirework(r.tx,r.ty,r.color);else nextR.push(r);
  }
  fwRockets=nextR;
  const alive=[];
  for(const p of fwParticles){p.age+=dt;if(p.age>=p.life)continue;p.vx*=Math.pow(p.drag,dt);p.vy=p.vy*Math.pow(p.drag,dt)+p.gravity*dt;p.x+=p.vx*dt;p.y+=p.vy*dt;
    const fade=Math.max(0,1-p.age/p.life),tw=p.twinkle?(.55+.45*Math.sin(p.age*.65)):1;fwCtx.globalAlpha=fade*tw*(fireworksIntensity/78);fwCtx.fillStyle=p.color;
    if(p.trail){fwCtx.strokeStyle=p.color;fwCtx.lineWidth=Math.max(.35,p.r*.7);fwCtx.beginPath();fwCtx.moveTo(p.x-p.vx*1.9,p.y-p.vy*1.9);fwCtx.lineTo(p.x,p.y);fwCtx.stroke()}
    fwCtx.beginPath();fwCtx.arc(p.x,p.y,p.r,0,Math.PI*2);fwCtx.fill();alive.push(p);
  }
  fwParticles=alive;fwCtx.globalAlpha=1;fwCtx.globalCompositeOperation='source-over';if(!fireworksEnabled&&fwParticles.length===0&&fwRockets.length===0){fwFrame=0;fwCanvas.style.display='none';fwCtx.clearRect(0,0,fwCanvas.width,fwCanvas.height);return;}fwFrame=requestAnimationFrame(drawFireworks);
}
const meteorCanvas=layer('meteorOverlay', 8), meteorCtx=meteorCanvas.getContext('2d',{alpha:true});
const meteorEnabled=!!st.mt, meteorIntensity=setting(st.mi,55,10,100), meteorSpeed=setting(st.ms,100,50,200);
let meteorParticles=[], meteorFrame=0, meteorLast=0, meteorNext=0;
function resizeMeteor(){resizeOverlayCanvas(meteorCanvas,meteorCtx)}
function spawnMeteor(force=false){const w=window.innerWidth,h=window.innerHeight;const angle=(Math.PI/180)*(22+Math.random()*36);const len=(35+Math.random()*120)*(0.55+meteorIntensity/100);const x=Math.random()*w*.95, y=-Math.random()*h*.15;const speed=(4+Math.random()*8)*meteorSpeed/100;const hue=[190,205,215,35,45,0][Math.floor(Math.random()*6)];meteorParticles.push({x,y,vx:Math.cos(angle)*speed,vy:Math.sin(angle)*speed+speed*.25,life:0,max:Math.max(18,len/(speed*.55)),len,hue,width:.7+Math.random()*1.8,glow:5+Math.random()*14});}
function drawMeteors(now){meteorFrame=0;const dt=Math.min(2.5,(now-(meteorLast||now))/16.67);meteorLast=now;const w=window.innerWidth,h=window.innerHeight;meteorCtx.clearRect(0,0,w,h);if(meteorEnabled&&now>=meteorNext){spawnMeteor();if(meteorIntensity>65&&Math.random()<.35)spawnMeteor();meteorNext=now+Math.max(90,950-(meteorIntensity*8))+Math.random()*700;}
 meteorCtx.globalCompositeOperation='lighter';const alive=[];for(const m of meteorParticles){m.x+=m.vx*dt;m.y+=m.vy*dt;m.life+=dt;if(m.life>m.max||m.x>w+200||m.y>h+200)continue;const fade=Math.min(1,m.life/3,Math.max(0,(m.max-m.life)/7));const tailX=m.x-m.vx*m.len/7,tailY=m.y-m.vy*m.len/7;const g=meteorCtx.createLinearGradient(m.x,m.y,tailX,tailY);g.addColorStop(0,`hsla(${m.hue},100%,95%,${fade})`);g.addColorStop(.15,`hsla(${m.hue},100%,75%,${fade*.7})`);g.addColorStop(1,`hsla(${m.hue},100%,60%,0)`);meteorCtx.strokeStyle=g;meteorCtx.lineWidth=m.width;meteorCtx.shadowColor=`hsl(${m.hue},100%,75%)`;meteorCtx.shadowBlur=m.glow;meteorCtx.beginPath();meteorCtx.moveTo(m.x,m.y);meteorCtx.lineTo(tailX,tailY);meteorCtx.stroke();meteorCtx.fillStyle=`rgba(255,255,255,${fade})`;meteorCtx.beginPath();meteorCtx.arc(m.x,m.y,1.1+m.width*.55,0,Math.PI*2);meteorCtx.fill();alive.push(m)}meteorParticles=alive;meteorCtx.shadowBlur=0;meteorCtx.globalCompositeOperation='source-over';if(meteorEnabled||meteorParticles.length){meteorFrame=requestAnimationFrame(drawMeteors)}else{meteorCanvas.style.display='none';meteorLast=0;meteorParticles=[];}}

const weatherMode=['snow','rain','heavy'].includes(st.wx)?st.wx:'off';
const weatherIntensity=setting(st.wi,50,10,100);
const weatherSpeed=setting(st.ws,1,.5,3);
const skyMode=['day','sunset'].includes(st.sk)?st.sk:'off';
const snowCanvas=layer('snowOverlay',5), snowCtx=snowCanvas.getContext('2d');
const rippleCanvas=layer('rainRippleOverlay',6), rippleCtx=rippleCanvas.getContext('2d');
const skyCanvas=layer('skyOverlay',3), skyCtx=skyCanvas.getContext('2d');
let snowW=0,snowH=0,snowParticles=[],snowFrame=0,snowLastTime=0;
let skyClouds=[],skyFrame=0,skyLast=0;
let ripples=[],rippleFrame=0,rippleLast=0,rippleSpawnAt=0;
function makeWeatherParticle(randomY = false){
  const depth = 0.25 + Math.random() * 0.75;
  return {
    x: Math.random() * Math.max(1, snowW),
    y: randomY ? Math.random() * Math.max(1, snowH) : -10 - Math.random() * 35,
    r: 0.45 + depth * 1.65,
    vy: (0.45 + depth * 1.65) * weatherSpeed,
    vx: (Math.random() - 0.5) * 0.55,
    drift: Math.random() * Math.PI * 2,
    driftSpeed: 0.35 + Math.random() * 0.9,
    alpha: 0.22 + depth * 0.63,
    depth,
    length: 7 + depth * 17,
    rainLength: 5 + depth * 17,
    rainWidth: 0.45 + depth * 0.75,
    rainDrift: (Math.random() - 0.5) * 0.55,
    rainAlpha: 0.12 + depth * 0.30
  };
}
function drawScreenWeather(now){
  if(weatherMode === 'off') return;
  const dtSeconds = snowLastTime ? Math.min(0.05, Math.max(0, (now - snowLastTime) / 1000)) : 1/60;
  const dt = dtSeconds * 60; snowLastTime = now;
  snowCtx.clearRect(0, 0, snowW, snowH);
  for(const p of snowParticles){
    if(weatherMode === 'snow'){
      p.y += p.vy * dt;
      p.drift += 0.012 * p.driftSpeed * dt;
      p.x += (p.vx + Math.sin(p.drift) * 0.38) * dt;
      if(p.y > snowH + 30){ Object.assign(p, makeWeatherParticle(false)); p.y = -10; }
      if(p.x < -25) p.x = snowW + 10; else if(p.x > snowW + 25) p.x = -10;
      snowCtx.globalAlpha = p.alpha; snowCtx.fillStyle = '#ffffff';
      snowCtx.beginPath(); snowCtx.arc(p.x, p.y, p.r, 0, Math.PI * 2); snowCtx.fill();
    } else {
                                                                                                        
      const heavy = weatherMode === 'heavy';
      const fall = (2.5 + p.depth * (heavy ? 8.2 : 6.2)) * weatherSpeed;
      const drift = (heavy ? 1.05 : 0.72) + p.rainDrift;
      p.y += fall * dt; p.x += drift * dt;
      if(p.y > snowH + p.rainLength + 10){ Object.assign(p, makeWeatherParticle(false)); p.y = -p.rainLength - Math.random()*40; p.x=Math.random()*snowW; }
      if(p.x > snowW + 15) p.x = -10;
      snowCtx.globalAlpha = Math.min(0.62, p.rainAlpha * (heavy ? 1.25 : 1));
      snowCtx.strokeStyle = p.depth > 0.72 ? 'rgba(225,239,255,0.95)' : 'rgba(170,205,238,0.9)';
      snowCtx.lineWidth = p.rainWidth * (heavy ? 1.15 : 0.82);
      snowCtx.beginPath(); snowCtx.moveTo(p.x, p.y);
      snowCtx.lineTo(p.x - drift * (p.rainLength / Math.max(2,fall)), p.y + p.rainLength);
      snowCtx.stroke();
                                                                                 
      if(p.depth > 0.84 && Math.random() > 0.72){ snowCtx.globalAlpha *= 0.45; snowCtx.fillStyle='#e8f4ff'; snowCtx.beginPath(); snowCtx.arc(p.x,p.y,0.55,0,Math.PI*2); snowCtx.fill(); }
    }
  }
  snowCtx.globalAlpha = 1;
  snowFrame = requestAnimationFrame(drawScreenWeather);
}
function makeSkyClouds(){const w=window.innerWidth,h=window.innerHeight;skyClouds=Array.from({length:Math.max(7,Math.floor(w/150))},(_,i)=>({x:Math.random()*w,y:h*(.07+Math.random()*.43),scale:.45+Math.random()*1.15,alpha:.10+Math.random()*.17,speed:(Math.random()-.5)*.025,phase:Math.random()*6.28}))}
function drawPuffyCloud(ctx,x,y,scale,alpha,tint){ctx.save();ctx.translate(x,y);ctx.scale(scale,scale);ctx.fillStyle=tint.replace('ALPHA',alpha.toFixed(3));ctx.beginPath();ctx.ellipse(0,5,62,18,0,0,Math.PI*2);ctx.ellipse(-35,0,25,22,0,0,Math.PI*2);ctx.ellipse(-12,-12,31,32,0,0,Math.PI*2);ctx.ellipse(20,-5,37,27,0,0,Math.PI*2);ctx.ellipse(48,5,24,17,0,0,Math.PI*2);ctx.fill();ctx.restore()}
function drawSky(now){skyFrame=0;if(skyMode==='off'){skyCanvas.style.display='none';skyCtx.clearRect(0,0,skyCanvas.width,skyCanvas.height);return}skyCanvas.style.display='block';const w=window.innerWidth,h=window.innerHeight;const dt=skyLast?Math.min(.05,(now-skyLast)/1000):.016;skyLast=now;skyCtx.clearRect(0,0,w,h);
 if(skyMode==='day'){
  const g=skyCtx.createLinearGradient(0,0,0,h*.85);g.addColorStop(0,'rgba(78,177,255,0.65)');g.addColorStop(.48,'rgba(144,219,255,0.38)');g.addColorStop(1,'rgba(235,248,255,0.11)');skyCtx.fillStyle=g;skyCtx.fillRect(0,0,w,h);
  const sx=w*.82,sy=h*.16,rad=Math.min(48,w*.055);const halo=skyCtx.createRadialGradient(sx,sy,rad*.1,sx,sy,rad*2.8);halo.addColorStop(0,'rgba(255,248,205,.65)');halo.addColorStop(1,'rgba(255,238,170,0)');skyCtx.fillStyle=halo;skyCtx.beginPath();skyCtx.arc(sx,sy,rad*2.8,0,Math.PI*2);skyCtx.fill();skyCtx.fillStyle='rgba(255,251,229,.96)';skyCtx.beginPath();skyCtx.arc(sx,sy,rad*.53,0,Math.PI*2);skyCtx.fill();
  for(const c of skyClouds){c.x+=c.speed*dt*60;if(c.x>w+140)c.x=-140;if(c.x<-140)c.x=w+140;drawPuffyCloud(skyCtx,c.x,c.y,c.scale,c.alpha,'rgba(255,255,255,ALPHA)')}
 } else if(skyMode==='sunset'){
  const g=skyCtx.createLinearGradient(0,0,0,h);g.addColorStop(0,'rgba(30,20,72,.28)');g.addColorStop(.34,'rgba(118,37,91,.25)');g.addColorStop(.62,'rgba(225,70,67,.22)');g.addColorStop(.82,'rgba(255,125,66,.16)');g.addColorStop(1,'rgba(32,20,58,.05)');skyCtx.fillStyle=g;skyCtx.fillRect(0,0,w,h);
  const sx=w*.76,sy=h*.62,rad=Math.min(86,w*.11);const halo=skyCtx.createRadialGradient(sx,sy,rad*.2,sx,sy,rad*2.4);halo.addColorStop(0,'rgba(255,93,67,.25)');halo.addColorStop(1,'rgba(255,55,80,0)');skyCtx.fillStyle=halo;skyCtx.beginPath();skyCtx.arc(sx,sy,rad*2.4,0,Math.PI*2);skyCtx.fill();skyCtx.fillStyle='rgba(255,154,111,.045)';skyCtx.beginPath();skyCtx.arc(sx,sy,rad*.55,0,Math.PI*2);skyCtx.fill();
  for(const c of skyClouds){c.x+=c.speed*dt*35;if(c.x>w+160)c.x=-160;drawPuffyCloud(skyCtx,c.x,c.y+h*.12,c.scale*1.05,c.alpha*.9,'rgba(93,39,75,ALPHA)')}
  }
  skyFrame=requestAnimationFrame(drawSky);
}
function spawnRipple(){const w=window.innerWidth,h=window.innerHeight;ripples.push({x:Math.random()*w,y:h*(.12+Math.random()*.76),r:1,life:0,max:36+Math.random()*44,alpha:.2+Math.random()*.34,stretch:.45+Math.random()*.35})}
function drawRainRipples(now){rippleFrame=0;const mode=weatherMode;if(mode!=='rain'&&mode!=='heavy'&&ripples.length===0){rippleCanvas.style.display='none';rippleCtx.clearRect(0,0,rippleCanvas.width,rippleCanvas.height);return}rippleCanvas.style.display='block';const w=window.innerWidth,h=window.innerHeight;const dt=rippleLast?Math.min(.05,(now-rippleLast)/1000):.016;rippleLast=now;rippleCtx.clearRect(0,0,w,h);if((mode==='rain'||mode==='heavy')&&now>=rippleSpawnAt){const n=mode==='heavy'?2:1;for(let i=0;i<n;i++)spawnRipple();rippleSpawnAt=now+(mode==='heavy'?90:180)+Math.random()*(mode==='heavy'?170:420)}const alive=[];for(const r of ripples){r.life+=dt*60;r.r+=(.45+r.stretch*.7)*dt*60;if(r.life>=r.max)continue;const fade=(1-r.life/r.max)*r.alpha;rippleCtx.lineWidth=.6+(1-r.life/r.max)*.9;rippleCtx.strokeStyle=`rgba(190,220,246,${fade})`;rippleCtx.beginPath();rippleCtx.ellipse(r.x,r.y,r.r,r.r*r.stretch,0,0,Math.PI*2);rippleCtx.stroke();if(r.life<r.max*.6){rippleCtx.strokeStyle=`rgba(235,245,255,${fade*.42})`;rippleCtx.lineWidth=.55;rippleCtx.beginPath();rippleCtx.ellipse(r.x,r.y,r.r*.62,r.r*r.stretch*.62,0,0,Math.PI*2);rippleCtx.stroke()}alive.push(r)}ripples=alive;if(mode==='rain'||mode==='heavy'||ripples.length)rippleFrame=requestAnimationFrame(drawRainRipples);else{rippleCanvas.style.display='none';rippleLast=0}}

function stop(){
  for(const frame of [fwFrame,meteorFrame,snowFrame,skyFrame,rippleFrame]) cancelAnimationFrame(frame);
  fwFrame=meteorFrame=snowFrame=skyFrame=rippleFrame=0;
  fwLast=meteorLast=snowLastTime=skyLast=rippleLast=0;
  fwRockets=[];fwParticles=[];meteorParticles=[];ripples=[];snowParticles=[];
  for(const canvas of [fwCanvas,meteorCanvas,snowCanvas,skyCanvas,rippleCanvas]) canvas.style.display='none';
}
function start(){
  stop();
  if(window.__xyzViewFXOn===false || (st.fm===0 && window.__xyzViewFXOn!==true)) return;
  const now=performance.now();
  if(skyMode!=='off'){
    resizeOverlayCanvas(skyCanvas,skyCtx);
    makeSkyClouds();
    skyFrame=requestAnimationFrame(drawSky);
  }
  if(weatherMode!=='off'){
    ({w:snowW,h:snowH}=resizeOverlayCanvas(snowCanvas,snowCtx));
    const mobile=matchMedia('(max-width: 700px)').matches;
    const low=viewer.lowQuality;
    const cap=low?(mobile?100:180):(mobile?450:850);
    const base=Math.min(cap,Math.max(100,Math.floor(snowW*snowH/(low?4200:1900))));
    snowParticles=Array.from({length:Math.max(60,Math.floor(base*weatherIntensity/50))},()=>makeWeatherParticle(true));
    snowCanvas.style.display='block';
    snowFrame=requestAnimationFrame(drawScreenWeather);
    if(weatherMode!=='snow'){
      resizeOverlayCanvas(rippleCanvas,rippleCtx);
      rippleSpawnAt=now+80;
      rippleFrame=requestAnimationFrame(drawRainRipples);
    }
  }
  if(fireworksEnabled){
    resizeFireworks();
    fwCanvas.style.display='block';
    fwNextAt=now+250;
    fwFrame=requestAnimationFrame(drawFireworks);
  }
  if(meteorEnabled){
    resizeMeteor();
    meteorCanvas.style.display='block';
    meteorNext=now+100;
    meteorFrame=requestAnimationFrame(drawMeteors);
  }
}
window.addEventListener('xyz-viewer-fx-off',stop);
window.addEventListener('xyz-viewer-fx-on',start);
window.addEventListener('resize',start);
window.addEventListener('pagehide',stop);
window.addEventListener('pageshow',event=>{if(event.persisted)start()});
start();
})();
