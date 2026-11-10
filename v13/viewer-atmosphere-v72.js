                                                      
(()=>{'use strict';const V=window.XYZViewer;if(!V)return;const st=V.state;
let lastAtmosDraw=0,lastAuroraDraw=0;
let fxFrame=0,fxLast=0,fogPhase=0,lightningBolts=[],nextLightningAt=0,flashStartedAt=0,flashDuration=0,flashUntil=0,auroraFrame=0;
const fogIntensity=Math.max(0,Math.min(100,Number(st.fg)||0)),neonEnabled=!!st.ne,neonStrength=st.nb===undefined?75:Number(st.nb),lightningMode=['rare','storm','sheet'].includes(st.lm)?st.lm:'off',sheetRate=st.sr===undefined?50:Number(st.sr);
const auroraEnabled=!!st.au,auroraIntensity=st.ai===undefined?70:Number(st.ai),auroraColor=Number(st.ac)||0;
function layer(id,z){const c=document.createElement('canvas');c.id=id;Object.assign(c.style,{position:'fixed',inset:'0',width:'100%',height:'100%',zIndex:String(z),pointerEvents:'none',display:'none'});document.body.appendChild(c);return c}
const fxCanvas=layer('v13Atmosphere',6),fxCtx=fxCanvas.getContext('2d'),auroraCanvas=layer('v13Aurora',6),auroraCtx=auroraCanvas.getContext('2d');
function size(){const dpr=Math.min(devicePixelRatio||1,V.lowQuality?.7:1.5);for(const[c,x]of [[fxCanvas,fxCtx],[auroraCanvas,auroraCtx]]){c.width=Math.round(innerWidth*dpr);c.height=Math.round(innerHeight*dpr);x.setTransform(dpr,0,0,dpr,0,0)}}
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
                                                                                       
                                           
  if(fogIntensity>0){
    fogPhase+=dt*(.05+fogIntensity*.001);const a=fogIntensity/100;
    const veils=[{x:((t*9)% (w*1.8))-w*.4,y:h*.42,r:Math.max(w*.62,h*.38),c:`rgba(165,195,225,${a*.14})`},{x:w-(((t*6)%(w*1.7))-w*.35),y:h*.7+Math.sin(fogPhase)*h*.04,r:Math.max(w*.7,h*.42),c:`rgba(128,155,205,${a*.13})`},{x:w*.45+Math.sin(fogPhase*.55)*w*.16,y:h*.28,r:Math.max(w*.5,h*.32),c:`rgba(200,215,235,${a*.08})`}];
    for(const n of veils)radialGlow(n.x,n.y,n.r,n.c,'rgba(140,170,205,0)');
  }
                                                                                             
  if(neonEnabled){
    const a=neonStrength/100,pulse=.78+.22*Math.sin(t*1.15);fxCtx.globalCompositeOperation='screen';
    radialGlow(w*.12+Math.sin(t*.23)*w*.035,h*.30,Math.max(w,h)*.72,`rgba(0,255,255,${.46*a*pulse})`,'rgba(0,0,0,0)');
    radialGlow(w*.86+Math.cos(t*.18)*w*.025,h*.72,Math.max(w,h)*.70,`rgba(255,0,238,${.47*a*pulse})`,'rgba(0,0,0,0)');
    radialGlow(w*.53,h*.06,Math.max(w,h)*.38,`rgba(75,25,255,${.34*a})`,'rgba(0,0,0,0)');
                                                                         
    for(let i=0;i<4;i++){const x=((t*(12+i*5)+i*w*.37)%(w*1.7))-w*.35;const g=fxCtx.createLinearGradient(x,0,x+w*.23,h);g.addColorStop(0,'rgba(0,0,0,0)');g.addColorStop(.48,`rgba(${[0,255,255,255][i]},${[245,35,80,180][i]},${[255,220,255,90][i]},${.095*a})`);g.addColorStop(1,'rgba(0,0,0,0)');fxCtx.fillStyle=g;fxCtx.fillRect(0,0,w,h);}
    fxCtx.globalCompositeOperation='source-over';fxCtx.globalAlpha=1;
  }
                                                                                        
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
function start(){stop();size();if(st.fm===0&&window.__xyzViewFXOn!==true)return;if(fogIntensity||neonEnabled||lightningMode!=='off'){fxLast=0;nextLightningAt=performance.now()+450;fxCanvas.style.display='block';fxFrame=requestAnimationFrame(drawVisualFx)}if(auroraEnabled){auroraCanvas.style.display='block';auroraFrame=requestAnimationFrame(drawAurora)}}
window.addEventListener('xyz-viewer-fx-off',stop);window.addEventListener('xyz-viewer-fx-on',start);window.addEventListener('pagehide',stop);window.addEventListener('resize',size);start();
})();
