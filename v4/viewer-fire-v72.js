/* v72 FIRE playback: GPU hotspots and original CSS3D firebed, VIEWER-only. */
(()=>{'use strict';const V=window.XYZViewer;if(!V)return;const st=V.state;
const max=(x,a)=>Math.max(x,a);let active=false,raf=0,stopAt=0,prev=0,firebedChoice=null,particles={flame:[],spark:[],smoke:[]},opts={power:1,height:1,anchor:0,base:true,threeD:false};
const k=()=>V.getEngine();const set=(name,prop,value)=>{try{k()?.set('hotspot['+name+'].'+prop,value)}catch(e){}};
const names={flame:'xyz_fire40_f_',spark:'xyz_fire40_k_',smoke:'xyz_fire40_s_'},counts={flame:24,spark:10,smoke:10};
function base(){const engine=k();if(!engine)return{x:0,y:0,z:0};const a=n=>{try{return Number(engine.get('image.splats.t'+n))||0}catch(e){return 0}};return{x:a('x'),y:a('y')+opts.anchor,z:a('z')}}
function reset(p,type){const h=Math.max(0,opts.height),pow=Math.max(.2,opts.power);p.life=0;p.phase=Math.random()*6.28;
 if(type==='flame')Object.assign(p,{x:(Math.random()-.5)*(1.05+pow*.6),y:(Math.random()-.5)*(.58+pow*.28),z:.02+Math.random()*.18,vx:(Math.random()-.5)*(.08+pow*.05),vy:(Math.random()-.5)*(.04+pow*.02),vz:(.42+Math.random()*1.05)*(.60+h*.62),max:.65+Math.random()*.55,scale:(.055+Math.random()*.065)*(.65+pow*.28),alpha:.22+Math.random()*.24});
 else if(type==='spark')Object.assign(p,{x:(Math.random()-.5)*.22,y:(Math.random()-.5)*.10,z:.05+Math.random()*.10,vx:(Math.random()-.5)*(.18+pow*.10),vy:(Math.random()-.5)*(.10+pow*.05),vz:(.85+Math.random()*1.8)*(.6+h*.55),max:.35+Math.random()*.45,scale:(.016+Math.random()*.024)*(.65+pow*.25),alpha:.65+Math.random()*.25});
 else Object.assign(p,{x:(Math.random()-.5)*(.28+pow*.16),y:(Math.random()-.5)*(.12+pow*.08),z:.18+Math.random()*.22,vx:(Math.random()-.5)*(.05+pow*.03),vy:(Math.random()-.5)*(.03+pow*.02),vz:(.12+Math.random()*.28)*(.55+h*.35),max:1.35+Math.random()*1.45,scale:(.09+Math.random()*.12)*(.75+pow*.18),alpha:.10+Math.random()*.12})}
function init(){for(const type of Object.keys(counts)){particles[type]=[];for(let i=0;i<counts[type];i++){const p={name:names[type]+i};reset(p,type);p.life=Math.random()*p.max;particles[type].push(p)}}}
function bed(enabled){try{k()?.set('hotspot[xyz_fire44_host].visible',!!enabled)}catch(e){}}
function stop(){active=false;cancelAnimationFrame(raf);raf=0;bed(false);for(const [type,list] of Object.entries(particles))for(const p of list)set(p.name,'visible',false)}
function sendBed(){try{for(const iframe of document.querySelectorAll('iframe')){if(iframe.src.includes('fire_canvas_v56.html')) iframe.contentWindow?.postMessage({type:'xyz-firebed-v54',enabled:opts.base},location.origin)}}catch(e){}}
window.addEventListener('message',e=>{if(e.origin===location.origin&&e.data?.type==='xyz-firebed-ready-v54')sendBed()});
function start(d){stop();opts={power:Math.max(.2,Number(d.power)||1),height:Math.max(0,Number(d.height)||1),anchor:Number(d.anchor)||0,base:d.base!==false,threeD:!!d.threeD};if(opts.height<=0)return;active=true;init();stopAt=performance.now()+d.duration;prev=0;if(opts.threeD){bed(true);sendBed();}}
window.addEventListener('xyz-viewer-fire',ev=>start(ev.detail||{}));window.addEventListener('pagehide',stop);
function animate(now){raf=requestAnimationFrame(animate);if(!active||!k())return;if(!prev)prev=now;const dt=Math.min(.05,Math.max(0,(now-prev)/1000));prev=now;const remaining=stopAt-now,fade=Math.max(0,Math.min(1,remaining/850));if(remaining< -950){stop();return}
 const b=base();if(opts.threeD){set('xyz_fire44_host','tx',b.x);set('xyz_fire44_host','ty',b.y);set('xyz_fire44_host','tz',b.z);set('xyz_fire44_host','alpha',fade);set('xyz_fire44_host','scale',Math.min(2.6,.24*opts.power*(.72+opts.height*.28)))}
 for(const [type,arr] of Object.entries(particles))for(const p of arr){p.life+=dt;if(p.life>=p.max){if(remaining>0)reset(p,type);else{set(p.name,'visible',false);continue}}let t=p.life/p.max;const turb=Math.sin(now*.0024+p.phase+p.z*5);p.vx+=turb*.012*dt;p.vx*=.985;p.y+=p.vy*dt;p.x+=p.vx*dt;p.z+=p.vz*dt;let env=type==='flame'?Math.sin(Math.PI*Math.min(1,t)):1-t;let alpha=Math.max(0,env)*p.alpha*fade;let scale=p.scale*(type==='smoke'?(0.7+1.8*t):(0.55+.9*env))*Math.max(.3,opts.power);set(p.name,'tx',b.x+p.x);set(p.name,'ty',b.y+p.y);set(p.name,'tz',b.z+p.z);set(p.name,'alpha',alpha);set(p.name,'scale',Math.max(.001,scale));set(p.name,'visible',alpha>.008);}
}
raf=requestAnimationFrame(animate);
})();