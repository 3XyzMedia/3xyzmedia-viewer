                                                                                  
(()=>{'use strict';
const cache=new Map(),clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
function absolute(s,base){const u=new URL(s,base);if(!['http:','https:'].includes(u.protocol))throw Error('LOD: требуется HTTP(S)');return u.href}
async function manifestFor(model,explicit){const url=explicit?absolute(explicit,model):model.replace(/\.ply(?=([?#]|$))/i,'.lod.json');if(url===model)return null;if(cache.has(url))return cache.get(url);
 const task=(async()=>{const abort=new AbortController(),t=setTimeout(()=>abort.abort(),4500);try{const r=await fetch(url,{signal:abort.signal});if(!r.ok)return null;const m=await r.json();if(!m||m.version!==1||!Array.isArray(m.levels)||m.levels.length<2)return null;
 const levels=m.levels.map(l=>({url:absolute(l.url,url),count:Number(l.count)})).filter(l=>Number.isFinite(l.count)&&l.count>0&&/\.ply(?:[?#]|$)/i.test(l.url)).sort((a,b)=>b.count-a.count);
 if(levels.length<2)return null;const b=m.bounds;if(!b||!Array.isArray(b.min)||!Array.isArray(b.max)||b.min.length!==3||b.max.length!==3||!b.min.every(Number.isFinite)||!b.max.every(Number.isFinite))return null;
 const span=Math.max(...b.max.map((v,i)=>v-b.min[i]));if(!(span>0))return null;
 const source=absolute(m.source||levels[0].url,url);if(new URL(source).href!==new URL(model).href)return null;
 return {url,source,levels,bounds:b,span};}catch{return null}finally{clearTimeout(t)}})();cache.set(url,task);return task}
function choose(m,mode,camera,mobile,fpsCap=Infinity){if(!m)return 0;if(mode==='full'||mode==='off')return 0;if(mode==='low')return m.levels.length-1;if(mode==='medium')return Math.min(1,m.levels.length-1);
 const d=Math.max(.001,Number(camera?.d)||200),pix=m.span*(Number(camera?.nativeScale)||100)*(innerHeight||800)/(2*Math.tan(35*Math.PI/180)*d);let cap=pix>400?Infinity:pix>160?Math.min(250000,m.levels[0].count/4):Math.min(62500,m.levels[0].count/16);cap=Math.min(cap,mobile?250000:Infinity,fpsCap);let ix=m.levels.findIndex(l=>l.count<=cap);return ix<0?m.levels.length-1:ix}
window.xyzLODPrepare16=async(model,settings={},camera={},mobile=false)=>{const mode=['auto','off','full','medium','low'].includes(settings.mode)?settings.mode:'auto';const manifest=await manifestFor(model,settings.manifest);const level=choose(manifest,mode,camera,mobile);return {url:manifest?manifest.levels[level].url:model,manifest,level,settings:{mode,manifest:settings.manifest||''}}};
class Manager{
 constructor(info,adapter){this.info=info;this.a=adapter;this.mode=info.settings.mode;this.level=info.level;this.loading=false;this.failed=new Set();this.lastSwap=0;this.pending=-1;this.since=0;this.slow=0;this.fast=0;this.fpsCap=Infinity;this.lastTick=0;this.timer=setInterval(()=>this.tick(),700);this.badge=document.createElement('button');this.badge.id='xyzLodBadge16';this.badge.type='button';Object.assign(this.badge.style,{position:'fixed',right:'10px',bottom:'65px',zIndex:'40',padding:'5px 8px',background:'#07111dde',border:'1px solid #426273',borderRadius:'7px',color:'#bce8ee',font:'11px sans-serif'});this.badge.title='LOD: AUTO → FULL → 250K → минимум';this.badge.addEventListener('click',()=>{const modes=['auto','full','medium','low'];this.setMode(modes[(modes.indexOf(this.mode)+1)%modes.length])});if(adapter.showControl!==false)document.body.appendChild(this.badge);this.update();window.addEventListener('pagehide',()=>this.dispose(),{once:true})}
 shareCapture(){const modes=['full','medium','low'];return {mode:this.mode==='auto'&&this.info.manifest?modes[Math.min(2,this.level)]:this.mode,manifest:this.info.settings.manifest||''}}
 capture(){return {mode:this.mode,manifest:this.info.settings.manifest||''}}
 setMode(mode){if(!['auto','off','full','medium','low'].includes(mode))return;this.mode=mode;this.fpsCap=Infinity;this.slow=this.fast=0;this.pending=-1;this.update();this.tick(true);this.a.onMode?.(mode)}
 update(){const m=this.info.manifest;this.badge.textContent=m?'LOD '+this.mode.toUpperCase()+' · '+Math.round(m.levels[this.level].count/1000)+'K'+(this.loading?' …':''):'LOD: нет уровней';this.badge.disabled=!m;this.a.onStatus?.(this.badge.textContent);if(m)window.xyzLODBounds16=m.bounds}
 paused(){const k=this.a.engine();const mode=Number(k?.get('image.splats.fx_mode'))||0;return this.a.busy?.()||mode!==0&&mode!==10}
 tick(force=false){const m=this.info.manifest,k=this.a.engine();if(!m||!k||this.loading||document.hidden||this.paused())return;const now=performance.now();const fps=Number(k.get('display.currentfps'));
 if(this.mode==='auto'&&fps>0&&fps<22){this.slow++;this.fast=0;if(this.slow>=4){this.fpsCap=m.levels[Math.min(this.level+1,m.levels.length-1)].count;this.slow=0}}else if(fps>45){this.fast++;this.slow=0;if(this.fast>=20){this.fpsCap=Infinity;this.fast=0}}else this.slow=this.fast=0;
 const camera={...this.a.camera()};const mx=k.get('image.splats.mx');camera.nativeScale=mx?.length===16?Math.max(Math.hypot(mx[0],mx[1],mx[2]),Math.hypot(mx[4],mx[5],mx[6]),Math.hypot(mx[8],mx[9],mx[10])):100;const want=choose(m,this.mode,camera,this.a.mobile,this.fpsCap);if(want===this.level){this.pending=-1;return}if(this.failed.has(want))return;if(!force){if(now-this.lastSwap<6500)return;if(this.pending!==want){this.pending=want;this.since=now;return}if(now-this.since<1300)return}this.swap(want)}
 async swap(level){if(this.loading)return;const m=this.info.manifest,k=this.a.engine();if(!m||!k||!k.actions?.loadxml){this.a.onStatus?.('LOD: движок не поддерживает переключение');return}
 this.loading=true;this.update();const old=this.level;try{
 const r=await fetch(m.levels[level].url,{method:'HEAD'});if(!r.ok)throw Error('LOD HTTP '+r.status);
 if(this.paused()){this.loading=false;this.update();return}
 const obj=k.get('image.splats'),props={};for(const key of Object.keys(obj||{})){const val=obj[key];if(!key.startsWith('_')&&['string','number','boolean'].includes(typeof val)&&!['count','format','editable','editselected'].includes(key))props[key]=val}
 for(const key of ['scale','tx','ty','tz','rx','ry','rz','rotationorder','antialias','shader','fx_mode','fx_progress','fx_power','fx_radius']){const val=k.get('image.splats.'+key);if(val!==undefined&&val!==null)props[key]=val}
 props.url=m.levels[level].url;
                                                                             
 for(const kind of ['hotspot','layer','plugin','events'])for(let i=0,n=Math.min(1000,Number(k.get(kind+'.count'))||0);i<n;i++)k.set(kind+'['+i+'].keep',true);
 const esc=v=>String(v).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
 if(k.get('action[xyz_morph46fixed_20261025_shader].content'))props.shader='get:action[xyz_morph46fixed_20261025_shader].content';
 const xml='<krpano><image><splats '+Object.entries(props).filter(([key])=>/^[a-zA-Z][a-zA-Z0-9_]*$/.test(key)).map(([key,value])=>key+'="'+esc(value)+'"').join(' ')+' /></image></krpano>';
 await new Promise((resolve,reject)=>{let done=false;const timer=setTimeout(()=>{done=true;reject(Error('LOD: timeout'))},25000);const check=()=>{if(done)return;if(Number(k.get('image.splats.count'))===m.levels[level].count){done=true;clearTimeout(timer);resolve()}else setTimeout(check,100)};k.actions.loadxml(xml,null,'MERGE|KEEPVIEW|KEEPMOVING','NOBLEND',check,()=>{done=true;clearTimeout(timer);reject(Error('LOD: ошибка загрузки'))});});
 this.level=level;this.lastSwap=performance.now();this.pending=-1;this.a.render();window.dispatchEvent(new CustomEvent('xyz-lod-changed16',{detail:{level,count:m.levels[level].count,url:props.url}}));
 }catch(e){this.failed.add(level);this.level=old;this.a.onStatus?.(e.message);console.warn('LOD:',e.message)}finally{this.loading=false;this.update()}}
 dispose(){clearInterval(this.timer);this.badge.remove()}
}
window.xyzLODManager16=Manager;window.xyzLODChoose16=choose;
})();
