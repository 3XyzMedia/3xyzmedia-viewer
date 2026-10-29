/* 3XyzMedia VIEWER 20K: viewer-only playback based on the 20K renderer, no editor UI. */
(()=>{'use strict';
const V=window.XYZViewer, params=new URLSearchParams(location.search);if(!V||params.get('gpu20k')!=='1')return;
const mobile=(navigator.maxTouchPoints>0&&innerWidth<900)||/Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
const pano=document.getElementById('pano');
if(mobile){return;} // v72: desktop-only GPU 20K
const BASE_N=20000, N=20000;
let gl=null,prog=null,vao=null,uniforms={},buffers=[],source=null,target=null,seed=null,sourceColor=null,labelColor=null,ready=false,loading=null,active=false,frame=0,startCam=null,originalOpacity=1;
const canvas=document.createElement('canvas');canvas.id='viewer20k';Object.assign(canvas.style,{position:'fixed',inset:'0',width:'100%',height:'100%',zIndex:'9',pointerEvents:'none',display:'none'});document.body.appendChild(canvas);
function cfg(name,fallback){let n=Number(params.get('g57'+name));return Number.isFinite(n)&&params.has('g57'+name)?n:fallback}
function shader(type,src){let x=gl.createShader(type);gl.shaderSource(x,src);gl.compileShader(x);if(!gl.getShaderParameter(x,gl.COMPILE_STATUS))throw Error(gl.getShaderInfoLog(x));return x}
const vert=`#version 300 es
precision highp float;
layout(location=0) in vec3 aSource; layout(location=1) in vec3 aTarget; layout(location=2) in vec3 aSeed; layout(location=3) in vec3 aSourceColor; layout(location=4) in vec3 aLabelColor;
uniform float uProgress,uSpread,uSize,uAspect,uYaw,uPitch,uDistance,uColorMode;
uniform float uStartYaw,uStartPitch,uFrontYaw,uFrontPitch;
out vec3 vColor; out float vAlpha;
float ease(float x){x=clamp(x,0.,1.);return x*x*(3.-2.*x);} 
mat3 ry(float a){float c=cos(a),s=sin(a);return mat3(c,0.,-s,0.,1.,0.,s,0.,c);} 
mat3 rx(float a){float c=cos(a),s=sin(a);return mat3(1.,0.,0.,0.,c,s,0.,-s,c);} 
void main(){
  float p=clamp(uProgress,0.,1.);
  float t;
  if (p < 0.40) t = ease(p / 0.40);
  else if (p > 0.60) t = ease((1.0 - p) / 0.40);
  else t = 1.0;
  float burstIn = smoothstep(0.015, 0.20, p) * (1.0 - smoothstep(0.34, 0.48, p));
  float burstOut = smoothstep(0.52, 0.66, p) * (1.0 - smoothstep(0.80, 0.985, p));
  float burst = max(burstIn, burstOut);
  vec3 dir=normalize(aSeed*2.0-1.0+vec3(.001));
  vec3 swirl=normalize(cross(dir,vec3(.31,.78,.54))+vec3(.01));
  // Camera compensation: the edited target is shown from the SAVED author front
  // when launched, even if the viewer was orbited beforehand. The correction
  // remains constant during playback, so orbiting AFTER launch still works.
  vec3 frontTarget=rx(-uStartPitch)*ry(-uStartYaw)*ry(uFrontYaw)*rx(uFrontPitch)*aTarget;
  vec3 path=normalize(frontTarget-aSource+vec3(.001,.002,.003));
  float magic = smoothstep(0.08,0.28,p) * (1.0 - smoothstep(0.72,0.92,p));
  vec3 pos=mix(aSource,frontTarget,t)+uSpread*burst*(dir*(1.55+2.10*aSeed.x)+swirl*(0.80+0.35*magic)*sin(8.0*t+11.0*aSeed.y)+path*(0.56+0.36*magic)*cos(7.0*t+9.0*aSeed.z));
  vec3 view=ry(uYaw)*rx(uPitch)*pos-vec3(0.,0.,uDistance);
  float f=2.1445069;
  gl_Position=vec4(view.x*f/uAspect, view.y*f, -view.z*1.0002-0.20002, -view.z);
  gl_PointSize=clamp(uSize*12.5/max(1.0,-view.z), 1.2, 22.0);
  vec3 targetColor=aLabelColor;
  if(uColorMode>0.5&&uColorMode<1.5) targetColor=vec3(1.,.045,.16);
  else if(uColorMode>1.5&&uColorMode<2.5) targetColor=vec3(.18,1.,.02);
  else if(uColorMode>2.5&&uColorMode<3.5) targetColor=vec3(.045,.22,1.);
  else if(uColorMode>3.5&&uColorMode<4.5) targetColor=vec3(.73,.07,1.);
  else if(uColorMode>4.5) targetColor=vec3(.005,.94,1.);
  vColor = mix(aSourceColor, targetColor, t);
  float overlay = smoothstep(0.03,0.14,p) * (1.0-smoothstep(0.86,0.98,p));
  float linger = smoothstep(0.08,0.22,p) * (1.0-smoothstep(0.78,0.92,p));
  vAlpha = (0.34 + 0.48*linger + 0.18*burst) * overlay;
}`;

const frag=`#version 300 es
precision mediump float;
in vec3 vColor; in float vAlpha; out vec4 outColor;
void main(){ vec2 q=gl_PointCoord*2.0-1.0; float r=dot(q,q); float a=pow(max(0.0,1.0-r),1.1)*vAlpha; if(a<.01) discard; outColor=vec4(vColor,a); }`;

function initGL(){gl=canvas.getContext('webgl2',{alpha:true,premultipliedAlpha:false,powerPreference:'high-performance'});if(!gl)throw Error('WebGL2 недоступен');prog=gl.createProgram();gl.attachShader(prog,shader(gl.VERTEX_SHADER,vert));gl.attachShader(prog,shader(gl.FRAGMENT_SHADER,frag));gl.linkProgram(prog);if(!gl.getProgramParameter(prog,gl.LINK_STATUS))throw Error(gl.getProgramInfoLog(prog));for(const n of ['uProgress','uSpread','uSize','uAspect','uYaw','uPitch','uDistance','uColorMode','uStartYaw','uStartPitch','uFrontYaw','uFrontPitch'])uniforms[n]=gl.getUniformLocation(prog,n);vao=gl.createVertexArray();gl.bindVertexArray(vao);for(let i=0;i<5;i++){const b=gl.createBuffer();buffers.push(b);gl.bindBuffer(gl.ARRAY_BUFFER,b);gl.bufferData(gl.ARRAY_BUFFER,N*3*4,gl.DYNAMIC_DRAW);gl.vertexAttribPointer(i,3,gl.FLOAT,false,0,0);gl.enableVertexAttribArray(i)}gl.bindVertexArray(null);gl.enable(gl.BLEND);gl.blendFunc(gl.SRC_ALPHA,gl.ONE_MINUS_SRC_ALPHA);gl.disable(gl.DEPTH_TEST)}
function bounds(arr){let lo=[1e9,1e9,1e9],hi=[-1e9,-1e9,-1e9]; for(let i=0;i<arr.length;i+=3){for(let d=0;d<3;d++){const v=arr[i+d]; if(v<lo[d])lo[d]=v; if(v>hi[d])hi[d]=v;}} return {mid:lo.map((x,d)=>(x+hi[d])/2),span:Math.max(1e-6,hi[0]-lo[0],hi[1]-lo[1],hi[2]-lo[2])}; }
function normalize(a,scale){const b=bounds(a); for(let i=0;i<a.length;i+=3) for(let d=0;d<3;d++) a[i+d]=(a[i+d]-b.mid[d])*scale/b.span; return a; }
function parsePLY(buf){ const bytes=new Uint8Array(buf), head=new TextDecoder('ascii').decode(bytes.subarray(0,Math.min(bytes.length,131072))); const m=/end_header\r?\n/.exec(head); if(!m) throw Error('PLY без end_header'); const lines=head.slice(0,m.index).split(/\r?\n/); const binary=lines.some(x=>x.includes('format binary_little_endian')); if(!binary) throw Error('нужен binary PLY'); const elements=[]; let el=null; for(const l of lines){const a=l.trim().split(/\s+/); if(a[0]==='element'){el={name:a[1],count:Number(a[2]),props:[]}; elements.push(el);} else if(a[0]==='property'&&el&&a[1]!=='list'){el.props.push({type:a[1],name:a[2]});}}
 const sz={char:1,uchar:1,int8:1,uint8:1,short:2,ushort:2,int16:2,uint16:2,int:4,uint:4,int32:4,uint32:4,float:4,float32:4,double:8,float64:8}; let off=m.index+m[0].length; for(const e of elements){let stride=0; for(const p of e.props){p.off=stride; stride+=sz[p.type]||0;} e.offset=off; e.stride=stride; off+=stride*e.count; } const vt=elements.find(e=>e.name==='vertex'); const ch=elements.find(e=>e.name==='chunk'); if(!vt) throw Error('нет vertex'); const names=Object.fromEntries(vt.props.map(p=>[p.name,p])); const dv=new DataView(buf); function rd(e,i,n){const p=typeof n==='string'?Object.fromEntries(e.props.map(x=>[x.name,x]))[n]:n; const o=e.offset+i*e.stride+p.off; switch(p.type){case 'uchar':case 'uint8': return dv.getUint8(o); case 'char':case 'int8': return dv.getInt8(o); case 'ushort':case 'uint16': return dv.getUint16(o,true); case 'short':case 'int16': return dv.getInt16(o,true); case 'uint':case 'uint32': return dv.getUint32(o,true); case 'int':case 'int32': return dv.getInt32(o,true); case 'double':case 'float64': return dv.getFloat64(o,true); default: return dv.getFloat32(o,true);} }
 const baseCount=Math.min(BASE_N, vt.count); const raw=new Float32Array(baseCount*3), cols=new Float32Array(baseCount*3);
 for(let i=0;i<baseCount;i++){ const j=Math.min(vt.count-1,Math.floor((i+0.5)*vt.count/baseCount)), o=3*i; if(names.x&&names.y&&names.z){ raw[o]=rd(vt,j,names.x); raw[o+1]=rd(vt,j,names.y); raw[o+2]=rd(vt,j,names.z);} else if(names.packed_position && ch){const pk=rd(vt,j,names.packed_position)>>>0, k=Math.min(ch.count-1,Math.floor(j/256)); for(let d=0;d<3;d++){ const axis=['x','y','z'][d], lo=rd(ch,k,'min_'+axis), hi=rd(ch,k,'max_'+axis), t=d===0?(pk>>>21)/2047:d===1?((pk>>>11)&1023)/1023:(pk&2047)/2047; raw[o+d]=lo+(hi-lo)*t; }} else throw Error('XYZ не распознаны'); if(names.red&&names.green&&names.blue){ cols[o]=rd(vt,j,names.red)/255.0; cols[o+1]=rd(vt,j,names.green)/255.0; cols[o+2]=rd(vt,j,names.blue)/255.0; } else if(names.f_dc_0&&names.f_dc_1&&names.f_dc_2){ cols[o]=Math.max(0.0,Math.min(1.0,0.5+0.28209479*rd(vt,j,names.f_dc_0))); cols[o+1]=Math.max(0.0,Math.min(1.0,0.5+0.28209479*rd(vt,j,names.f_dc_1))); cols[o+2]=Math.max(0.0,Math.min(1.0,0.5+0.28209479*rd(vt,j,names.f_dc_2))); } else { cols[o]=.9; cols[o+1]=.94; cols[o+2]=1.0; } }
 normalize(raw,5.1); return {raw,cols}; }
function rotate(x,y,z,rx,ry,rz){ const cx=Math.cos(rx),sx=Math.sin(rx), cy=Math.cos(ry),sy=Math.sin(ry), cz=Math.cos(rz),sz=Math.sin(rz); let Y=y*cx-z*sx, Z=y*sx+z*cx, X=x; let X2=X*cy+Z*sy, Z2=-X*sy+Z*cy; let X3=X2*cz-Y*sz, Y3=X2*sz+Y*cz; return [X3,Y3,Z2]; }

async function prepare(){if(ready)return;if(loading)return loading;loading=(async()=>{
  if(!gl)initGL();
  const result=await fetch(V.model);if(!result.ok)throw Error('PLY HTTP '+result.status);
  const data=parsePLY(await result.arrayBuffer());source=new Float32Array(N*3);sourceColor=new Float32Array(N*3);
  const count=data.raw.length/3;for(let i=0;i<N;i++){let o=i*3,s=(i%count)*3;for(let j=0;j<3;j++){source[o+j]=data.raw[s+j];sourceColor[o+j]=data.cols[s+j]}}
  const raw=params.get('g69Target')||'LABEL_RGB_20000.xyzrgb.bin';let url;
  if(/^https:\/\//i.test(raw))url=new URL(raw);
  else if(raw==='LABEL_RGB_20000.xyzrgb.bin')url=new URL('./'+raw,location.href);
  else if(/^(?:morph-targets\/)?[\w.-]+\.xyzrgb\.bin$/i.test(raw)&&!raw.includes('..'))url=new URL('./morph-targets/'+raw.replace(/^morph-targets\//i,''),location.href);
  else throw Error('Неверный адрес BIN 20K');
  const response=await fetch(url.href);if(!response.ok)throw Error('BIN HTTP '+response.status);let buf=await response.arrayBuffer();if(buf.byteLength!==N*24)throw Error('BIN должен содержать 20000 XYZ+RGB (480000 байт)');let blob=new Float32Array(buf);
  target=new Float32Array(N*3);labelColor=new Float32Array(N*3);for(let i=0;i<N;i++){let a=i*3,s=i*6;target[a]=blob[s];target[a+1]=blob[s+1];target[a+2]=blob[s+2];labelColor[a]=blob[s+3];labelColor[a+1]=blob[s+4];labelColor[a+2]=blob[s+5]}
  normalize(target,9.2);
  let rx=cfg('RotX',0)*Math.PI/180,ry=cfg('RotY',0)*Math.PI/180,rz=cfg('RotZ',0)*Math.PI/180,scale=cfg('Scale',1)*2.15;
  for(let i=0;i<N;i++){let a=i*3,v=rotate(target[a],target[a+1],target[a+2],rx,ry,rz);target[a]=v[0]*scale+cfg('OffX',0);target[a+1]=v[1]*scale+cfg('OffY',0);target[a+2]=v[2]*scale+cfg('OffZ',0)}
  seed=new Float32Array(N*3);for(let i=0;i<seed.length;i++)seed[i]=((Math.sin(i*12.9898+4.2)*43758.5453)%1+1)%1;
  gl.bindVertexArray(vao);[source,target,seed,sourceColor,labelColor].forEach((arr,i)=>{gl.bindBuffer(gl.ARRAY_BUFFER,buffers[i]);gl.bufferSubData(gl.ARRAY_BUFFER,0,arr)});gl.bindVertexArray(null);ready=true;
})();try{await loading}finally{loading=null}}
const rad=v=>v*Math.PI/180;
function draw(p){if(!ready)return;let w=Math.floor(innerWidth*Math.min(devicePixelRatio||1,1.5)),h=Math.floor(innerHeight*Math.min(devicePixelRatio||1,1.5));if(canvas.width!==w||canvas.height!==h){canvas.width=w;canvas.height=h;gl.viewport(0,0,w,h)}let cam=V.getCamera(),u=cam.o;let k=V.getEngine();const smooth=x=>{x=Math.max(0,Math.min(1,x));return x*x*(3-2*x)};
  // Original model still receives a native spatial BURST before target text assembly.
  let env=p<.25?smooth(p/.25):p<.59?1:1-smooth((p-.59)/.41);
  try{if(k){k.set('image.splats.fx_mode',1);k.set('image.splats.fx_radius',Math.min(3000,Math.max(1,Number(params.get('g67ModelRadius'))||80)));k.set('image.splats.fx_power',Math.min(30,Math.max(1,Number(params.get('g67ModelPower'))||4)));k.set('image.splats.fx_progress',env*.5)}}catch(e){}
  let vis=p<=.11?1:p<.29?1-smooth((p-.11)/.18):p<=.67?0:p<.955?smooth((p-.67)/.285):1;pano.style.opacity=String(vis);
  gl.clearColor(0,0,0,0);gl.clear(gl.COLOR_BUFFER_BIT);gl.useProgram(prog);gl.bindVertexArray(vao);
  const frontYaw=Number(params.get('g71FrontYaw')),frontPitch=Number(params.get('g71FrontPitch'));
  const front={yaw:Number.isFinite(frontYaw)&&params.has('g71FrontYaw')?frontYaw:startCam[0],pitch:Number.isFinite(frontPitch)&&params.has('g71FrontPitch')?frontPitch:startCam[1]};
  const col={blender:0,red:1,green:2,blue:3,purple:4,cyan:5}[params.get('gpucolor')||'blender']||0;
  for(const [n,val] of Object.entries({uProgress:p,uSpread:cfg('Spread',5),uSize:cfg('Size',5),uAspect:w/h,uYaw:rad(u[0]),uPitch:rad(u[1]),uDistance:Math.max(3,Math.min(50,11.2*cam.d/Math.max(1,startCam[2]))),uColorMode:col,uStartYaw:rad(startCam[0]),uStartPitch:rad(startCam[1]),uFrontYaw:rad(front.yaw),uFrontPitch:rad(front.pitch)}))gl.uniform1f(uniforms[n],val);
  gl.drawArrays(gl.POINTS,0,N);
}
function restore(){active=false;cancelAnimationFrame(frame);frame=0;canvas.style.display='none';pano.style.opacity=String(originalOpacity);try{let k=V.getEngine();k&&k.set('image.splats.fx_progress',0);k&&k.set('image.splats.fx_mode',0)}catch(e){}}
async function start(){if(active){restore();return}try{await prepare();originalOpacity=Number(pano.style.opacity||1);startCam=[...V.getCamera().o.slice(0,2),V.getCamera().d];active=true;canvas.style.display='block';let t0=performance.now(),total=Math.max(1000,cfg('Duration',8)*1000),hold=Math.max(0,cfg('Hold',0)*1000),half=total/2;
function render(t){if(!active)return;const e=t-t0;let p=e<half?.5*(e/half):e<half+hold?.5:.5+.5*Math.min(1,(e-half-hold)/half);draw(p);if(e<total+hold)frame=requestAnimationFrame(render);else restore()};frame=requestAnimationFrame(render)}catch(e){restore();const el=document.getElementById('message');if(el){el.hidden=false;el.textContent='MORPH 20K: '+e.message}}finally{}}
window.xyzViewer20k={start,stop:restore};
window.addEventListener('xyz-brand-label',event=>{if(window.__xyzViewFXOn!==false&&event.detail?.mode==='gpu20k')start()});
window.addEventListener('pagehide',restore);
})();
