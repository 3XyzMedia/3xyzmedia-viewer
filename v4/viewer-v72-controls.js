/* 3XyzMedia RGB Bridge - viewer-only v72 presentation and help. No authoring UI. */
(()=>{'use strict';const V=window.XYZViewer;if(!V)return;
const $=id=>document.getElementById(id),st=V.state,q=V.params;
const $help=$('help'),$toggle=$('helpToggle');
$toggle.addEventListener('click',()=>{const show=$help.classList.toggle('hidden')===false;$toggle.setAttribute('aria-expanded',String(show));});
$('reset').addEventListener('click',()=>{try{const k=V.getEngine();for(const [n,x] of Object.entries({fx_progress:0,fx_mode:0,fx_power:1,fx_radius:100,fx_labeldensity:1.1}))k&&k.set('image.splats.'+n,x)}catch(e){} if(window.xyzViewer20k)window.xyzViewer20k.stop();});
const axes=$('axes'),canvas=$('axesCanvas'),ctx=canvas.getContext('2d');let axesOn=st.x!==0;
function axis(){ctx.clearRect(0,0,132,132);if(!axesOn)return;const c=V.getCamera(),yaw=(c.o?.[0]||0)*Math.PI/180,pitch=(c.o?.[1]||0)*Math.PI/180;const coords=[['X',1,0,0,'#f35a61'],['Y',0,1,0,'#43e88d'],['Z',0,0,1,'#4cadff']];ctx.strokeStyle='#adbed240';ctx.lineWidth=3;ctx.beginPath();ctx.arc(66,66,55,0,Math.PI*2);ctx.stroke();for(const [name,x,y,z,color] of coords){const vx=x*Math.cos(yaw)-y*Math.sin(yaw),vy=x*Math.sin(yaw)+y*Math.cos(yaw),wx=vx,wy=vy*Math.cos(pitch)-z*Math.sin(pitch);const ex=66+wx*41,ey=66-wy*41;ctx.strokeStyle=color;ctx.lineWidth=4;ctx.beginPath();ctx.moveTo(66,66);ctx.lineTo(ex,ey);ctx.stroke();ctx.fillStyle=color;ctx.beginPath();ctx.arc(ex,ey,5,0,7);ctx.fill();ctx.font='bold 13px Arial';ctx.fillText(name,ex+7,ey+4)}ctx.fillStyle='white';ctx.beginPath();ctx.arc(66,66,5,0,7);ctx.fill();}
$('axes').addEventListener('click',()=>{axesOn=!axesOn;axes.title=axesOn?'Скрыть XYZ':'Показать XYZ';axis()});
const draw=V.render;V.render=()=>{draw();axis()};
window.addEventListener('xyz-viewer-engine',axis);axis();let lastAxes=0;function refreshAxes(t){if(t-lastAxes>100){lastAxes=t;if(axesOn)axis()}requestAnimationFrame(refreshAxes)}requestAnimationFrame(refreshAxes);
const chosen=q.get('labelfx')|| (q.get('gpu20k')==='1'?'gpu20k':q.get('morph')==='1'?'morph':'none');
const isVisitorMorph=q.get('morph')==='1',isVisitor20k=q.get('gpu20k')==='1';
const gb=$('gpuGuest'), mb=$('morphGuest');if(isVisitor20k && !((navigator.maxTouchPoints>0&&innerWidth<900)||/Android|iPhone|iPad|iPod/i.test(navigator.userAgent))){gb.hidden=false;gb.addEventListener('click',()=>window.dispatchEvent(new CustomEvent('xyz-brand-label',{detail:{mode:'gpu20k'}})))}
if(isVisitorMorph){mb.hidden=false;mb.addEventListener('click',()=>window.dispatchEvent(new CustomEvent('xyz-brand-label',{detail:{mode:'morph'}})))}
const lab=$('lab'),panel=$('fxChoices');if(q.get('fxlab')==='1'){lab.hidden=false;lab.addEventListener('click',()=>{panel.hidden=!panel.hidden});$('closeFxChoices').addEventListener('click',()=>panel.hidden=true);panel.querySelectorAll('[data-view-fxmode]').forEach(b=>b.addEventListener('click',()=>{panel.hidden=true;window.xyzViewPlayFX?.(Number(b.dataset.viewFxmode))}))}
if(q.get('fxui')==='1' || st.ef){$('burst').hidden=false}
if(chosen==='none')$('brand').title='3XyzMedia RGB Bridge™ — информация';
})();