/* 3XyzMedia v72 original star and star-flight visual routines. VIEW-ONLY module.
   makeStars/drawStars/makeWarpStars and drawSky flight branch taken from v72 studio.html.
   Read-only rendering: no author controls or STUDIO included. */
(()=>{'use strict';
const V=window.XYZViewer;if(!V)return;
const st=V.state||{};
const isMobile=()=>matchMedia('(max-width:700px)').matches;
const effectiveQuality=()=>isMobile()?'low':'high';
const starsEnabledByShare=!!st.zt;
const flightEnabledByShare=st.sk==='flight';
let starsEnabled=false,starsBrightness=Number(st.zb??85),starsDensity=Number(st.zd??75),stars=[],starsFrame=0,starClustersEnabled=!!st.sc,stellarSeed=(Number(st.rs)||314159)>>>0;
let skyStars=[],skyFrame=0,skyLast=0,flightSpeed=Math.max(.35,Math.min(4,Number(st.fs)||1)),flightCount=Math.max(100,Math.min(300,Number(st.fc)||100));
function makeCanvas(id,z){const c=document.createElement('canvas');c.id=id;c.setAttribute('aria-hidden','true');c.style.cssText='position:fixed;inset:0;width:100%;height:100%;z-index:'+z+';pointer-events:none;display:none';document.body.append(c);return c}
const starsCanvas=makeCanvas('v72StarsCanvas',8),starsCtx=starsCanvas.getContext('2d',{alpha:true});
const skyCanvas=makeCanvas('v72SkyFlightCanvas',9),skyCtx=skyCanvas.getContext('2d',{alpha:true});
function resizeCanvas(c,ctx){const dpr=Math.min(devicePixelRatio||1,effectiveQuality()==='low'?0.75:(isMobile()?1.2:1.65));c.width=Math.max(1,Math.round(innerWidth*dpr));c.height=Math.max(1,Math.round(innerHeight*dpr));c.style.width=innerWidth+'px';c.style.height=innerHeight+'px';ctx.setTransform(dpr,0,0,dpr,0,0)}

function seededRandom(seed){let x=(seed>>>0)||1;return function(){x=(x+0x6D2B79F5)>>>0;let t=x;t=Math.imul(t^(t>>>15),t|1);t^=t+Math.imul(t^(t>>>7),t|61);return ((t^(t>>>14))>>>0)/4294967296;};}
function makeStars(){
  const w=window.innerWidth,h=window.innerHeight;
  const count=Math.max(110,Math.min(effectiveQuality()==='low'?850:4600,Math.floor((w*h/(effectiveQuality()==='low'?1500:520))*(starsDensity/42))));
  const rng=seededRandom(stellarSeed+19);const palette=['#ffffff','#d8f0ff','#8edbff','#63aaff','#c4a3ff','#ffb8e8','#ffd8a1','#a6ffe8','#ffe8b5','#ff8b91','#fff1a6'];
  stars=Array.from({length:count},()=>{
    const q=rng(),bright=q>.992,medium=q>.91;
    return {x:rng()*w,y:rng()*h,r:bright?1.35+rng()*1.35:(medium?.62+rng()*.48:.12+rng()*.32),
      base:bright?.86+rng()*.14:(medium?.52+rng()*.42:.28+rng()*.68),
      phase:rng()*Math.PI*2,rate:.45+rng()*4.6,amplitude:.2+rng()*.8,
      color:palette[Math.floor(rng()*palette.length)],bright};
  });
}
let starsLastDraw=0;let starsDrawAt=0;function drawStars(now){
  if(!starsEnabled)return;if(effectiveQuality()==='low'&&now-starsDrawAt<45){starsFrame=requestAnimationFrame(drawStars);return;}starsDrawAt=now;
  if(effectiveQuality()==='low'&&starsLastDraw&&now-starsLastDraw<55){starsFrame=requestAnimationFrame(drawStars);return;}starsLastDraw=now;const w=window.innerWidth,h=window.innerHeight,t=now/1000,boost=starsBrightness/100;
  starsCtx.clearRect(0,0,w,h);
  for(const s of stars){
    const wave=.5+.5*Math.sin(t*s.rate+s.phase);
    const twinkle=.38+.62*(wave*s.amplitude+(1-s.amplitude)*.45);
    const alpha=Math.max(.025,Math.min(1,s.base*twinkle*boost));
    starsCtx.globalAlpha=alpha;starsCtx.fillStyle=s.color;
    starsCtx.beginPath();starsCtx.arc(s.x,s.y,s.r,0,Math.PI*2);starsCtx.fill();
    if(s.bright){
      const pulse=.45+.55*wave;
      starsCtx.globalAlpha=alpha*.8*pulse;starsCtx.strokeStyle=s.color;starsCtx.lineWidth=.8;
      starsCtx.beginPath();starsCtx.moveTo(s.x-5.5*s.r,s.y);starsCtx.lineTo(s.x+5.5*s.r,s.y);starsCtx.moveTo(s.x,s.y-5.5*s.r);starsCtx.lineTo(s.x,s.y+5.5*s.r);starsCtx.stroke();
      starsCtx.globalAlpha=alpha*.2*pulse;starsCtx.beginPath();starsCtx.arc(s.x,s.y,s.r*3.3,0,Math.PI*2);starsCtx.fill();
    }
  }
  // Optional naturalistic star clusters: irregular distribution, mixed sizes and colors.
  // Inspired by Hubble star fields and the Pleiades: a few loose groups, no constellation lines.
  if(starClustersEnabled){
    const crng=seededRandom(stellarSeed+773); const clusters=[
      {x:.22,y:.32,rx:.105,ry:.13,n:46}, {x:.73,y:.24,rx:.075,ry:.10,n:30},
      {x:.62,y:.70,rx:.13,ry:.105,n:38}, {x:.88,y:.78,rx:.06,ry:.085,n:18}
    ];
    starsCtx.save();starsCtx.globalCompositeOperation='screen';
    for(const cl of clusters){
      for(let i=0;i<cl.n;i++){
        // Gaussian-like concentration near group centers with a sparse halo.
        const u=(crng()+crng()+crng()-1.5)*1.18, v=(crng()+crng()+crng()-1.5)*1.18;
        const x=(cl.x+u*cl.rx)*w,y=(cl.y+v*cl.ry)*h;
        if(x<0||x>w||y<0||y>h)continue;
        const q=crng(),r=q>.965?(.9+crng()*1.65):q>.72?(.42+crng()*.58):(.14+crng()*.32);
        const colors=['#ffffff','#d9efff','#a8d8ff','#80baff','#ffe5c4'];
        const color=colors[Math.floor(crng()*colors.length)],alpha=(.22+crng()*.64)*boost;
        if(r>.85){
          const halo=starsCtx.createRadialGradient(x,y,0,x,y,r*(4.8+crng()*3));
          halo.addColorStop(0,'rgba(255,255,255,.92)');halo.addColorStop(.12,'rgba(230,244,255,.58)');halo.addColorStop(.42,color==='#ffe5c4'?'rgba(255,220,180,.16)':'rgba(135,195,255,.16)');halo.addColorStop(1,'rgba(120,175,255,0)');
          starsCtx.globalAlpha=Math.min(.78,alpha);starsCtx.fillStyle=halo;starsCtx.beginPath();starsCtx.arc(x,y,r*6.5,0,Math.PI*2);starsCtx.fill();
        }
        starsCtx.globalAlpha=Math.min(1,alpha);starsCtx.fillStyle=color;starsCtx.beginPath();starsCtx.arc(x,y,r,0,Math.PI*2);starsCtx.fill();
      }
    }
    // A handful of standout stars of varied sizes, scattered independently of the groups.
    for(let i=0;i<9;i++){
      const x=crng()*w,y=crng()*h,r=.75+Math.pow(crng(),2)*2.8;
      const halo=starsCtx.createRadialGradient(x,y,0,x,y,r*7);halo.addColorStop(0,'rgba(255,255,255,.9)');halo.addColorStop(.18,'rgba(225,241,255,.48)');halo.addColorStop(1,'rgba(140,195,255,0)');
      starsCtx.globalAlpha=.75*boost;starsCtx.fillStyle=halo;starsCtx.beginPath();starsCtx.arc(x,y,r*7,0,Math.PI*2);starsCtx.fill();
      starsCtx.globalAlpha=.9*boost;starsCtx.fillStyle='#fff';starsCtx.beginPath();starsCtx.arc(x,y,r*.65,0,Math.PI*2);starsCtx.fill();
    }
    starsCtx.restore();
  }
  starsCtx.restore();starsCtx.globalAlpha=1;starsFrame=requestAnimationFrame(drawStars);
}
function makeWarpStars(){const w=innerWidth,h=innerHeight;
 const baseCount=Math.max(240,Math.min(1050,Math.floor(w*h/(effectiveQuality()==='low'?2300:1250))));
 const count=Math.round(baseCount*flightCount/100);
 skyStars=Array.from({length:count},()=>{const a=Math.random()*Math.PI*2,z=.08+Math.random()*.91;return {a,z,tw:Math.random()*6.28,sz:Math.random()}});
}

function drawFlight(now){
 if(!flightEnabledByShare||window.__xyzViewFXOn===false){skyFrame=0;return}
 const w=innerWidth,h=innerHeight,dt=skyLast?Math.min(.05,Math.max(0,(now-skyLast)/1000)):.016;skyLast=now;
 skyCtx.clearRect(0,0,w,h);

   const cx=w*.5,cy=h*.49,rx=w*.72,ry=h*.60;skyCtx.globalCompositeOperation='lighter';
   for(const st of skyStars){
    // Depth increases smoothly toward the viewer; no random jitter at the vanishing point.
    st.z+=dt*(.055+.025*st.sz)*flightSpeed;
    if(st.z>=1)st.z=.05+(st.z-1);
    const k=st.z*st.z,rad=st.a;
    const x=cx+Math.cos(rad)*rx*k,y=cy+Math.sin(rad)*ry*k;
    const size=(.12+2.0*k)*(st.sz>.75?1.2:.76);
    const sparkle=.78+.22*Math.sin(now*.0026+st.tw*3.1);
    const alpha=Math.min(.97,(.15+.82*k)*sparkle);
    const palette=['210,235,255','255,224,185','186,218,255','220,193,255','171,245,255','255,203,219'];
    const hue=palette[Math.min(palette.length-1,Math.floor(st.sz*palette.length))];
    skyCtx.fillStyle=`rgba(${hue},${alpha})`;
    skyCtx.beginPath();skyCtx.arc(x,y,size,0,6.283185);skyCtx.fill();
    if(k>.59 && st.sz>.82){skyCtx.strokeStyle=`rgba(${hue},${.13*sparkle*k})`;skyCtx.lineWidth=.65;const ray=2.2+size*1.45;skyCtx.beginPath();skyCtx.moveTo(x-ray,y);skyCtx.lineTo(x+ray,y);skyCtx.moveTo(x,y-ray);skyCtx.lineTo(x,y+ray);skyCtx.stroke();}
   }
   skyCtx.globalCompositeOperation='source-over';
 skyFrame=requestAnimationFrame(drawFlight);
}
function stop(){
 starsEnabled=false;
 if(starsFrame)cancelAnimationFrame(starsFrame);starsFrame=0;
 if(skyFrame)cancelAnimationFrame(skyFrame);skyFrame=0;skyLast=0;
 for(const [canvas,ctx] of [[starsCanvas,starsCtx],[skyCanvas,skyCtx]]){ctx.clearRect(0,0,innerWidth,innerHeight);canvas.style.display='none'}
}
function start(){
 stop();if(window.__xyzViewFXOn===false)return;
 if(starsEnabledByShare){starsEnabled=true;resizeCanvas(starsCanvas,starsCtx);makeStars();starsCanvas.style.display='block';starsFrame=requestAnimationFrame(drawStars)}
 if(flightEnabledByShare){resizeCanvas(skyCanvas,skyCtx);makeWarpStars();skyCanvas.style.display='block';skyFrame=requestAnimationFrame(drawFlight)}
}
window.addEventListener('xyz-viewer-fx-off',stop);
window.addEventListener('xyz-viewer-fx-on',start);
window.addEventListener('resize',()=>{if(window.__xyzViewFXOn!==false)start()});
window.addEventListener('pagehide',stop);
start();
})();