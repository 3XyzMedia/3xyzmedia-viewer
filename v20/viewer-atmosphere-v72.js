/* v13: STUDIO atmospheric routines, playback only. */
(()=>{'use strict';const V=window.XYZViewer;if(!V)return;const st=V.state;
let lastAtmosDraw=0,lastAuroraDraw=0;
let fxFrame=0,fxLast=0,fogPhase=0,lightningBolts=[],nextLightningAt=0,flashStartedAt=0,flashDuration=0,flashUntil=0,auroraFrame=0;
const fogIntensity=Math.max(0,Math.min(100,Number(st.fg)||0)),neonEnabled=!!st.ne,neonStrength=st.nb===undefined?75:Number(st.nb),lightningMode=['rare','storm','sheet'].includes(st.lm)?st.lm:'off',sheetRate=st.sr===undefined?50:Number(st.sr);
const auroraEnabled=!!st.au,auroraIntensity=st.ai===undefined?70:Number(st.ai),auroraColor=Number(st.ac)||0;
function layer(id,z){const c=document.createElement('canvas');c.id=id;Object.assign(c.style,{position:'fixed',inset:'0',width:'100%',height:'100%',zIndex:String(z),pointerEvents:'none',display:'none'});document.body.appendChild(c);return c}
const fxCanvas=layer('v13Atmosphere',6),fxCtx=fxCanvas.getContext('2d'),auroraCanvas=layer('v13Aurora',6),auroraCtx=auroraCanvas.getContext('2d');
function size(){const dpr=Math.min(devicePixelRatio||1,V.lowQuality?.7:1.5);for(const[c,x]of [[fxCanvas,fxCtx],[auroraCanvas,auroraCtx]]){c.width=Math.round(innerWidth*dpr);c.height=Math.round(innerHeight*dpr);x.setTransform(dpr,0,0,dpr,0,0)}if(cosmosEnabled)makeCosmosDust()}
const cosmosEnabled=!!st.cx, cosmosStrength=Math.max(0,Math.min(200,Number(st.cs??60)));
const stellarSeed=(Number(st.rs)||314159)>>>0;
let cosmosDust=[],cosmosClusters=[];
function seededRandom(seed){let x=(seed>>>0)||1;return function(){x=(x+0x6D2B79F5)>>>0;let t=x;t=Math.imul(t^(t>>>15),t|1);t^=t+Math.imul(t^(t>>>7),t|61);return ((t^(t>>>14))>>>0)/4294967296;};}
function makeCosmosDust(){
  const w=window.innerWidth,h=window.innerHeight,rng=seededRandom(stellarSeed+71);
  const count=Math.max(650,Math.min(2600,Math.floor(w*h/850)));
  const palette=['#c9b6ff','#79dfff','#ffd0f3','#ffcf9e','#9effe6','#a8aaff','#ff727f','#fff2b0','#76a7ff','#ff9acb'];
  cosmosDust=Array.from({length:V.lowQuality?Math.ceil(count/3):count},()=>({x:rng()*w,y:rng()*h,r:.10+rng()*.28,a:.08+rng()*.42,c:palette[Math.floor(rng()*palette.length)]}));
  // Galaxy catalogue: each object has its own morphology, tilt, curvature and brightness.
  const specs=[
    [.12,.20,.11,.030,'#8b6bff','spiral'],[.34,.15,.083,.022,'#39c9ff','edge'],[.58,.18,.105,.045,'#ff65c8','irregular'],[.84,.19,.12,.025,'#ffb36b','edge'],
    [.20,.47,.095,.025,'#83ffe0','spiral'],[.47,.42,.12,.050,'#a9b5ff','irregular'],[.73,.45,.095,.021,'#ff8de1','edge'],[.91,.57,.065,.034,'#39c9ff','spiral'],
    [.10,.76,.105,.026,'#ff65c8','edge'],[.38,.75,.115,.042,'#ffb36b','irregular'],[.65,.79,.10,.024,'#83ffe0','spiral'],[.86,.83,.08,.040,'#a9b5ff','irregular'],
    [.53,.60,.065,.018,'#ff727f','edge'],[.29,.30,.052,.031,'#fff2b0','spiral'],[.62,.31,.060,.016,'#8ab9ff','edge'],[.42,.89,.065,.027,'#ff92d7','irregular'],
    [.77,.67,.054,.014,'#b4ffe8','edge'],[.17,.60,.052,.020,'#ffc08a','spiral']
  ];
  cosmosClusters=specs.map(([nx,ny,rx,ry,color,morph],idx)=>{
    const cx=w*nx,cy=h*ny,erx=w*rx,ery=h*ry,angle=(rng()-.5)*1.05;
    const points=Array.from({length:(V.lowQuality?65:190)+Math.floor(rng()*(V.lowQuality?70:210))},()=>{
      let u,v;
      if(morph==='edge'){u=(rng()+rng()+rng()-1.5)*1.05;v=(rng()+rng()-1)*.22;}
      else if(morph==='spiral'){u=(rng()+rng()+rng()-1.5)*1.0;v=(rng()+rng()+rng()-1.5)*.52;}
      else {u=(rng()+rng()+rng()-1.5)*1.16;v=(rng()+rng()+rng()-1.5)*.72;}
      const ca=Math.cos(angle),sa=Math.sin(angle),x=u*erx,y=v*ery;
      return {x:x*ca-y*sa,y:x*sa+y*ca,r:.07+rng()*.29,a:.12+rng()*.68,c:rng()<.70?color:palette[Math.floor(rng()*palette.length)],arm:rng()*Math.PI*2};
    });
    return {cx,cy,rx:erx,ry:ery,color,angle,points,seed:idx,morph,brightness:.45+rng()*.95,curve:(rng()-.5)*.65,twist:(rng()-.5)*.9};
  });
  // No decorative quasars or bright accretion rings. Keep only restrained distant astronomical silhouettes.
  const kinds=['pulsar','sun','redDwarf','magnetar','blackHole','crab','pillar','milky','dustCloud'];
  stellarObjects=Array.from({length:Math.max(20,Math.min(34,Math.floor(w/52)))},(_,i)=>({
    x:w*(.025+rng()*.95),y:h*(.045+rng()*.91),kind:kinds[i%kinds.length],r:(i%9===4?8: i%9===1?3.2:1.5)+rng()*2.0,
    color:palette[Math.floor(rng()*palette.length)],phase:rng()*Math.PI*2,angle:(rng()-.5)*1.15,variant:rng(),scale:.65+rng()*1.1,
    dust:Array.from({length:V.lowQuality?76:230},()=>({u:rng()*2-1,v:rng()*2-1,c:palette[Math.floor(rng()*palette.length)],r:.25+rng()*.4,a:.05+rng()*.16}))
  }));
}
let stellarObjects=[];
function drawGalaxyCluster(g, strength, t){
  const a=Math.min(2.25,strength/100),pulse=.94+.06*Math.sin(t*.19+g.cx*.008),bright=g.brightness;
  fxCtx.save();fxCtx.translate(g.cx,g.cy);fxCtx.rotate(g.angle);fxCtx.globalCompositeOperation='screen';
  // A restrained, elongated haze. Shape differs by galaxy morphology; no repeated spherical blobs.
  const grad=fxCtx.createRadialGradient(0,0,0,0,0,g.rx);
  grad.addColorStop(0,`rgba(255,255,255,${.035*a*pulse*bright})`);grad.addColorStop(.22,`rgba(190,175,255,${.035*a*bright})`);
  grad.addColorStop(.58,`rgba(100,125,255,${.018*a})`);grad.addColorStop(1,'rgba(0,0,0,0)');
  fxCtx.globalAlpha=Math.min(.8,.36*a*bright);fxCtx.fillStyle=grad;fxCtx.beginPath();fxCtx.ellipse(0,0,g.rx,g.rx,0,0,Math.PI*2);fxCtx.fill();fxCtx.restore();
  // Fine dust lanes, with individually curved arms in spiral systems and ragged structure in irregular galaxies.
  for(const p of g.points){
    let px=p.x,py=p.y;
    if(g.morph==='spiral'){
      const rad=Math.sqrt((p.x/g.rx)**2+(p.y/Math.max(1,g.ry))**2),ang=Math.atan2(p.y/Math.max(1,g.ry),p.x/g.rx)+g.twist*rad;
      const arm=Math.sin(ang*2.1+rad*7+g.curve)*.5;
      px+=arm*g.rx*.13;py+=Math.cos(ang*2+rad*5)*g.ry*.12;
    }else if(g.morph==='irregular'){
      px+=Math.sin(p.y*.027+g.seed)*g.rx*.035;py+=Math.sin(p.x*.019+g.seed)*g.ry*.15;
    }
    const alpha=Math.min(.82,p.a*a*.62*bright);fxCtx.globalAlpha=alpha;fxCtx.fillStyle=p.c;fxCtx.beginPath();fxCtx.arc(g.cx+px,g.cy+py,p.r,0,Math.PI*2);fxCtx.fill();
  }
  radialGlow(g.cx,g.cy,Math.max(g.rx*.12,g.ry*.6),`rgba(255,255,255,${.018*a*pulse*bright})`,'rgba(0,0,0,0)');
}
function drawStellarObjects(w,h,t,strength){
  const a=Math.min(2.1,strength/100);
  for(const o of stellarObjects){const x=o.x,y=o.y,r=o.r*o.scale,pulse=.78+.22*Math.sin(t*1.5+o.phase);fxCtx.save();fxCtx.globalCompositeOperation='screen';
    if(o.kind==='pulsar'||o.kind==='magnetar'){
      radialGlow(x,y,r*6,`rgba(110,220,255,${.14*a*pulse})`,'rgba(0,0,0,0)');fxCtx.strokeStyle=o.kind==='magnetar'?'#ff8cf4':'#b6f7ff';fxCtx.globalAlpha=.45*a*pulse;fxCtx.lineWidth=.5;fxCtx.beginPath();fxCtx.moveTo(x-r*4,y);fxCtx.lineTo(x+r*4,y);fxCtx.moveTo(x,y-r*4);fxCtx.lineTo(x,y+r*4);fxCtx.stroke();
    }else if(o.kind==='sun'){
      radialGlow(x,y,r*7,`rgba(255,174,65,${.23*a*pulse})`,'rgba(0,0,0,0)');fxCtx.fillStyle='#fff0b0';fxCtx.globalAlpha=.9*a;fxCtx.beginPath();fxCtx.arc(x,y,r,0,Math.PI*2);fxCtx.fill();
    }else if(o.kind==='redDwarf'){
      radialGlow(x,y,r*5,`rgba(255,70,80,${.22*a*pulse})`,'rgba(0,0,0,0)');fxCtx.fillStyle='#ff786e';fxCtx.globalAlpha=.8*a;fxCtx.beginPath();fxCtx.arc(x,y,r*.72,0,Math.PI*2);fxCtx.fill();
    }else if(o.kind==='blackHole'){
      // A quiet dark gravitational silhouette, without the game-like glowing ring.
      radialGlow(x,y,r*7,`rgba(92,105,155,${.10*a*pulse})`,'rgba(0,0,0,0)');fxCtx.globalCompositeOperation='source-over';fxCtx.fillStyle='rgba(0,0,5,.88)';fxCtx.beginPath();fxCtx.ellipse(x,y,r*1.45,r*.95,o.angle,0,Math.PI*2);fxCtx.fill();fxCtx.strokeStyle='rgba(150,170,220,.24)';fxCtx.lineWidth=.7;fxCtx.beginPath();fxCtx.ellipse(x,y,r*1.6,r*1.03,o.angle,0,Math.PI*2);fxCtx.stroke();
    }else if(o.kind==='crab'){
      // Crab-like supernova remnant: asymmetric blue/pink filaments rather than a flat ring.
      radialGlow(x,y,r*9,`rgba(255,75,125,${.12*a*pulse})`,'rgba(0,0,0,0)');
      for(let j=0;j<8;j++){const ang=j*Math.PI/4+o.angle,len=r*(2.4+o.variant*2.2);fxCtx.strokeStyle=j%2?'#ff9acb':'#8fdcff';fxCtx.globalAlpha=.28*a*pulse;fxCtx.lineWidth=.45;fxCtx.beginPath();fxCtx.moveTo(x+Math.cos(ang)*r*.35,y+Math.sin(ang)*r*.35);fxCtx.quadraticCurveTo(x+Math.cos(ang+.6)*len*.7,y+Math.sin(ang-.4)*len*.7,x+Math.cos(ang)*len,y+Math.sin(ang)*len);fxCtx.stroke();}
    }else if(o.kind==='pillar'){
      // Pillars of Creation: three irregular vertical columns made from colored dusty wisps.
      const ph=o.phase;for(let j=0;j<3;j++){const px=x+(j-1)*r*1.55,top=y-r*(3.2+(j%2)*1.1),bottom=y+r*2.1;
        for(let k=0;k<13;k++){const yy=top+(bottom-top)*k/12,wiggle=Math.sin(k*.78+ph+j)*r*.38;radialGlow(px+wiggle,yy,r*(.65+(k%3)*.22),`rgba(${j===1?'100,190,255':j===0?'255,105,180':'190,120,255'},${.07*a*pulse})`,'rgba(0,0,0,0)');}
      }
    }else if(o.kind==='milky'){
      // Milky Way: an oblique band of countless fine colored grains with dark dust lanes.
      fxCtx.translate(x,y);fxCtx.rotate(o.angle);const span=r*15,thick=r*3.6;
      const ng=fxCtx.createLinearGradient(-span,-thick,span,thick);ng.addColorStop(0,'rgba(90,110,255,0)');ng.addColorStop(.35,`rgba(120,170,255,${.09*a})`);ng.addColorStop(.52,`rgba(255,210,235,${.12*a})`);ng.addColorStop(.7,`rgba(130,100,255,${.08*a})`);ng.addColorStop(1,'rgba(0,0,0,0)');fxCtx.fillStyle=ng;fxCtx.fillRect(-span,-thick,span*2,thick*2);
      for(const d of o.dust){fxCtx.globalAlpha=d.a*a;fxCtx.fillStyle=d.c;fxCtx.fillRect(d.u*span,d.v*thick,d.r,d.r);}
    }else if(o.kind==='dustCloud'){
      // Loose diffuse colored nebula cloud with an irregular, non-circular outline.
      for(let j=0;j<11;j++){const ang=j*2.399+o.phase,rr=r*(1.1+(j%4)*.7);radialGlow(x+Math.cos(ang)*rr,y+Math.sin(ang)*rr*.55,r*(2.2+(j%3)*.5),`rgba(${j%3===0?'255,100,180':j%3===1?'90,150,255':'170,100,255'},${.045*a*pulse})`,'rgba(0,0,0,0)');}
    }
    fxCtx.restore();
  }
}
function makeBolt(w,h){
  const x=w*(.12+Math.random()*.76), y=h*(.015+Math.random()*.20), pts=[{x,y}], branches=[];
  let bx=x,by=y;const steps=12+Math.floor(Math.random()*12),targetX=x+(Math.random()-.5)*w*.48;
  for(let i=0;i<steps;i++){
    bx+=(targetX-bx)*.16+(Math.random()-.5)*w*.055;by+=h*(.025+Math.random()*.047);pts.push({x:bx,y:by});
    if(i>2&&Math.random()<.16){let xx=bx,yy=by,bpts=[{x:xx,y:yy}],dir=Math.random()<.5?-1:1;for(let j=0;j<3+Math.floor(Math.random()*5);j++){xx+=dir*(w*.012+Math.random()*w*.032);yy+=h*(.015+Math.random()*.03);bpts.push({x:xx,y:yy});if(Math.random()<.2)dir*=-1;}branches.push(bpts);}
    if(by>h*.92)break;
  }
  return {pts,branches,born:performance.now(),life:220+Math.random()*320,hue:Math.random()<.32?'#a9f4ff':'#f8fcff',flash:Math.random()};
}
function strokeBolt(points,alpha,width,color){if(points.length<2)return;fxCtx.globalAlpha=alpha;fxCtx.strokeStyle=color;fxCtx.lineWidth=width;fxCtx.lineJoin='round';fxCtx.lineCap='round';fxCtx.beginPath();fxCtx.moveTo(points[0].x,points[0].y);for(let i=1;i<points.length;i++)fxCtx.lineTo(points[i].x,points[i].y);fxCtx.stroke();}
function radialGlow(x,y,r,inner,outer){const g=fxCtx.createRadialGradient(x,y,0,x,y,r);g.addColorStop(0,inner);g.addColorStop(1,outer);fxCtx.fillStyle=g;fxCtx.fillRect(0,0,window.innerWidth,window.innerHeight);}
function drawVisualFx(now){if(V.lowQuality&&now-lastAtmosDraw<33){fxFrame=requestAnimationFrame(drawVisualFx);return}lastAtmosDraw=now;
  const w=window.innerWidth,h=window.innerHeight,t=now/1000,dt=fxLast?Math.min(.05,(now-fxLast)/1000):1/60;fxLast=now;fxCtx.clearRect(0,0,w,h);
  // COSMOS: distant colorful galaxies and star clusters; no foreground spiral overlay.
  if(cosmosEnabled){
    const a=cosmosStrength/100;fxCtx.globalCompositeOperation='screen';
    const maxR=Math.max(w,h);
    const clouds=[
      {x:w*.25,y:h*.34,r:maxR*.54,c:`rgba(78,35,210,${.15*a})`},
      {x:w*.72,y:h*.62,r:maxR*.50,c:`rgba(0,150,255,${.14*a})`},
      {x:w*.48,y:h*.19,r:maxR*.38,c:`rgba(255,35,172,${.11*a})`},
      {x:w*.84,y:h*.26,r:maxR*.30,c:`rgba(35,255,218,${.09*a})`},
      {x:w*.13,y:h*.79,r:maxR*.32,c:`rgba(255,100,48,${.08*a})`}
    ];
    for(const n of clouds)radialGlow(n.x,n.y,n.r,n.c,'rgba(0,0,0,0)');
    for(const g of cosmosClusters)drawGalaxyCluster(g,cosmosStrength,t);
    for(const d of cosmosDust){fxCtx.globalAlpha=Math.min(.75,d.a*a);fxCtx.fillStyle=d.c;fxCtx.beginPath();fxCtx.arc(d.x,d.y,d.r,0,Math.PI*2);fxCtx.fill();}
    drawStellarObjects(w,h,t,cosmosStrength);
    fxCtx.globalAlpha=1;fxCtx.globalCompositeOperation='source-over';
  }
  // Fog: large low-frequency moving veils.
  if(fogIntensity>0){
    fogPhase+=dt*(.05+fogIntensity*.001);const a=fogIntensity/100;
    const veils=[{x:((t*9)% (w*1.8))-w*.4,y:h*.42,r:Math.max(w*.62,h*.38),c:`rgba(165,195,225,${a*.14})`},{x:w-(((t*6)%(w*1.7))-w*.35),y:h*.7+Math.sin(fogPhase)*h*.04,r:Math.max(w*.7,h*.42),c:`rgba(128,155,205,${a*.13})`},{x:w*.45+Math.sin(fogPhase*.55)*w*.16,y:h*.28,r:Math.max(w*.5,h*.32),c:`rgba(200,215,235,${a*.08})`}];
    for(const n of veils)radialGlow(n.x,n.y,n.r,n.c,'rgba(140,170,205,0)');
  }
  // NEON: highly saturated broad color fields and smooth glow, no repeated scanline texture.
  if(neonEnabled){
    const a=neonStrength/100,pulse=.78+.22*Math.sin(t*1.15);fxCtx.globalCompositeOperation='screen';
    radialGlow(w*.12+Math.sin(t*.23)*w*.035,h*.30,Math.max(w,h)*.72,`rgba(0,255,255,${.46*a*pulse})`,'rgba(0,0,0,0)');
    radialGlow(w*.86+Math.cos(t*.18)*w*.025,h*.72,Math.max(w,h)*.70,`rgba(255,0,238,${.47*a*pulse})`,'rgba(0,0,0,0)');
    radialGlow(w*.53,h*.06,Math.max(w,h)*.38,`rgba(75,25,255,${.34*a})`,'rgba(0,0,0,0)');
    // A few wide soft diagonal beams, rendered as translucent gradients.
    for(let i=0;i<4;i++){const x=((t*(12+i*5)+i*w*.37)%(w*1.7))-w*.35;const g=fxCtx.createLinearGradient(x,0,x+w*.23,h);g.addColorStop(0,'rgba(0,0,0,0)');g.addColorStop(.48,`rgba(${[0,255,255,255][i]},${[245,35,80,180][i]},${[255,220,255,90][i]},${.095*a})`);g.addColorStop(1,'rgba(0,0,0,0)');fxCtx.fillStyle=g;fxCtx.fillRect(0,0,w,h);}
    fxCtx.globalCompositeOperation='source-over';fxCtx.globalAlpha=1;
  }
  // Lightning: short double flash, thick colored glow, bright core and branching forks.
  if(lightningMode!=='off'){
    if(now>=nextLightningAt){
      if(lightningMode!=='sheet'){const first=makeBolt(w,h);lightningBolts.push(first);}
      if(lightningMode==='storm'){
        const volley=1+Math.floor(Math.random()*2);
        if(lightningMode!=='sheet')for(let i=0;i<volley;i++){const bolt=makeBolt(w,h);bolt.born=now+55+i*(65+Math.random()*75);lightningBolts.push(bolt);}
        flashStartedAt=now;flashDuration=360+Math.random()*360;flashUntil=flashStartedAt+flashDuration;
        nextLightningAt=now+720+Math.random()*1550;
      }else{
        flashStartedAt=now;flashDuration=115;flashUntil=now+flashDuration;
        nextLightningAt=now+(lightningMode==='sheet' ? (1800+(100-sheetRate)*65)+Math.random()*(1600+(100-sheetRate)*45) : 2400+Math.random()*5200);
      }
    }
    const flashAge=now-flashStartedAt;
    if(now<flashUntil){
      const peak=lightningMode==='storm'?.17:.095;
      const fade=Math.max(0,1-flashAge/Math.max(1,flashDuration));
      const pulse=(lightningMode==='storm'?(Math.sin(flashAge*.045)>0?.9:0.35):1);
      fxCtx.fillStyle=`rgba(218,237,255,${peak*fade*pulse})`;fxCtx.fillRect(0,0,w,h);
    }
    lightningBolts=lightningBolts.filter(b=>now-b.born<b.life);
    if(lightningMode!=='sheet')for(const b of lightningBolts){const age=Math.max(0,(now-b.born)/b.life),alpha=Math.max(0,1-age);if(now-b.born<0)continue;strokeBolt(b.pts,alpha*.18,8,b.hue);strokeBolt(b.pts,alpha*.38,3.5,b.hue);strokeBolt(b.pts,alpha*.9,1.55,b.hue);strokeBolt(b.pts,alpha,.72,'#ffffff');for(const branch of b.branches){strokeBolt(branch,alpha*.35,2.8,b.hue);strokeBolt(branch,alpha*.9,.72,'#eafaff');}}
  }
  fxCtx.globalAlpha=1;fxCtx.globalCompositeOperation='source-over';fxFrame=requestAnimationFrame(drawVisualFx);
}
function drawAurora(now){if(V.lowQuality&&now-lastAuroraDraw<33){auroraFrame=requestAnimationFrame(drawAurora);return}lastAuroraDraw=now;
 auroraFrame=0;if(!auroraEnabled)return;
 const w=innerWidth,h=innerHeight,t=now/1000,a=auroraIntensity/100;
 auroraCtx.clearRect(0,0,w,h);auroraCtx.globalCompositeOperation='screen';
 // Only wide translucent Gaussian-like glows; no paths, contours or segmented rays.
 for(let layer=0;layer<5;layer++){
  const hue=[146,177,227,286,324][layer], x=w*(.15+layer*.17+.075*Math.sin(t*.12+layer)),y=h*(.13+.045*Math.cos(t*.18+layer));
  const radius=Math.max(w*.30,h*.47),g=auroraCtx.createRadialGradient(x,y,0,x,y,radius);
  const p=.78+.22*Math.sin(t*.39+layer*1.8),alpha=a*p*(layer<2?.19:.105);
  g.addColorStop(0,`hsla(${hue},100%,65%,${alpha})`);
  g.addColorStop(.30,`hsla(${hue},100%,56%,${alpha*.67})`);
  g.addColorStop(.64,`hsla(${hue},100%,48%,${alpha*.20})`);
  g.addColorStop(1,`hsla(${hue},100%,48%,0)`);
  auroraCtx.fillStyle=g;auroraCtx.fillRect(x-radius,y-radius,radius*2,radius*2);
 }
 auroraCtx.globalCompositeOperation='source-over';
 if(auroraColor>0){const power=auroraColor/100;const colors=[[255,28,87],[60,110,255],[176,50,255],[0,220,225],[255,60,165]];for(let i=0;i<colors.length;i++){const c=colors[i],x=w*(.13+i*.19)+Math.sin(t*.09+i)*w*.05,y=h*(.20+.06*Math.sin(i*2+t*.13)),rad=Math.max(w*.28,h*.32);const g=auroraCtx.createRadialGradient(x,y,0,x,y,rad);g.addColorStop(0,`rgba(${c[0]},${c[1]},${c[2]},${.16*power*a})`);g.addColorStop(.5,`rgba(${c[0]},${c[1]},${c[2]},${.065*power*a})`);g.addColorStop(1,'rgba(0,0,0,0)');auroraCtx.fillStyle=g;auroraCtx.fillRect(x-rad,y-rad,rad*2,rad*2)}}
  auroraFrame=requestAnimationFrame(drawAurora);
}

function stop(){cancelAnimationFrame(fxFrame);cancelAnimationFrame(auroraFrame);fxFrame=auroraFrame=0;lightningBolts=[];for(const c of[fxCanvas,auroraCanvas])c.style.display='none';}
function start(){stop();size();if(st.fm===0&&window.__xyzViewFXOn!==true)return;if(cosmosEnabled||fogIntensity||neonEnabled||lightningMode!=='off'){fxLast=0;nextLightningAt=performance.now()+450;fxCanvas.style.display='block';fxFrame=requestAnimationFrame(drawVisualFx)}if(auroraEnabled){auroraCanvas.style.display='block';auroraFrame=requestAnimationFrame(drawAurora)}}
window.addEventListener('xyz-viewer-fx-off',stop);window.addEventListener('xyz-viewer-fx-on',start);window.addEventListener('pagehide',stop);window.addEventListener('resize',size);start();
})();
