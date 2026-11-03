import{WIDTH,HEIGHT,LABELS,createWorld,step,move,solved}from'./core.mjs';
const $=s=>document.querySelector(s),board=$('#board');
let world=createWorld(),running=false,last=0,acc=0,active=null,pointer=null,point=null,wasSolved=null;
const buttons=[...board.querySelectorAll('.object')];
function render(){
 for(const o of world.objects){const b=buttons.find(b=>b.dataset.id===o.id);b.style.left=`${o.x/WIDTH*100}%`;b.style.top=`${o.y/HEIGHT*100}%`;b.setAttribute('aria-pressed',String(o.dragging));}
 const ok=solved(world);
 if(ok!==wasSolved){$('#feedback').textContent=ok?'Rätt! Ballongen står till höger om raketen. Du kan fortsätta leka eller börja om.':'Placera ballongen nära raketens högra sida. Båda ska stå på en hylla eller på golvet.';$('#feedback').classList.toggle('correct',ok);$('#again').hidden=!ok;wasSolved=ok;}
}
function release(){if(active)active.dragging=false;active=null;pointer=null;point=null;$('#selection').textContent='';render();}
function reset(){release();world=createWorld();last=0;acc=0;wasSolved=null;render();}
function start(){running=true;document.body.dataset.state='playing';$('#intro').hidden=true;$('#play').hidden=false;reset();buttons[0].focus();}
function position(e){const r=board.getBoundingClientRect();return{x:(e.clientX-r.left)/r.width*WIDTH,y:(e.clientY-r.top)/r.height*HEIGHT};}
for(const b of buttons){
 b.addEventListener('pointerdown',e=>{if(pointer!==null||!running||e.button!==0)return;e.preventDefault();release();point=position(e);active=[...world.objects].sort((a,b)=>Math.hypot(a.x-point.x,a.y-point.y)-Math.hypot(b.x-point.x,b.y-point.y))[0];active.dragging=true;pointer=e.pointerId;const selected=buttons.find(button=>button.dataset.id===active.id);selected.setPointerCapture(e.pointerId);selected.focus();$('#selection').textContent=`${LABELS[active.id]} är upptagen.`;render();});
 b.addEventListener('pointermove',e=>{if(e.pointerId!==pointer||!active)return;const p=position(e);move(active,p.x-point.x,p.y-point.y);point=p;render();});
 for(const event of['pointerup','pointercancel','lostpointercapture'])b.addEventListener(event,e=>{if(e.pointerId===pointer)release();});
 b.addEventListener('keydown',e=>{
  if(e.key===' '||e.key==='Enter'){e.preventDefault();if(e.repeat)return;const o=world.objects.find(o=>o.id===b.dataset.id);if(active===o){release();return;}release();active=o;active.dragging=true;$('#selection').textContent=`${LABELS[o.id]} är upptagen. Flytta med piltangenterna.`;render();}
  else if(e.key==='Escape'){e.preventDefault();release();}
  else if(e.key.startsWith('Arrow')&&active?.id===b.dataset.id){e.preventDefault();const d=e.shiftKey?2:10;move(active,e.key==='ArrowLeft'?-d:e.key==='ArrowRight'?d:0,e.key==='ArrowUp'?-d:e.key==='ArrowDown'?d:0);render();}
 });
 b.addEventListener('blur',()=>{if(active?.id===b.dataset.id)release();});
}
window.addEventListener('blur',release);document.addEventListener('visibilitychange',()=>{release();last=0;});
$('#start').addEventListener('click',start);$('#reset').addEventListener('click',()=>{reset();buttons[0].focus();});$('#again').addEventListener('click',()=>{reset();buttons[0].focus();});
function frame(now){if(running&&!document.hidden){if(last)acc+=Math.min((now-last)/1000,.1);while(acc>=1/60){step(world);acc-=1/60;}render();}last=now;requestAnimationFrame(frame);}requestAnimationFrame(frame);
