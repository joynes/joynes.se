'use strict';
// Keyboard actions become ordinary mouse input consumed by the original Unity
// runtime. Native scene objects, transforms and physics are never written here.
function installKeyboardPointer(canvas, stage, isRunning) {
  const cursor=document.createElement('span');cursor.id='keyboard-cursor';cursor.hidden=true;cursor.setAttribute('aria-hidden','true');stage.append(cursor);
  // Unity captures keys globally by default. Keep native Tab navigation and
  // HTML controls usable before its event handlers see those keys.
  for(const type of ['keydown','keyup'])window.addEventListener(type,e=>{
    if(!isRunning()||(document.activeElement===canvas&&e.code!=='Tab'))return;
    e.stopImmediatePropagation();
    const control=e.target.closest?.('button,a,summary');
    if(control&&['Enter','NumpadEnter','Space'].includes(e.code)){
      e.preventDefault();if(type==='keydown'&&!e.repeat)control.click();
    }
  },true);
  const held=new Set();let x=canvas.width/2,y=canvas.height/2,dragging=false,last=0;
  function paint(){const r=canvas.getBoundingClientRect(),s=stage.getBoundingClientRect();cursor.style.left=(r.left-s.left+x/canvas.width*r.width)+'px';cursor.style.top=(r.top-s.top+y/canvas.height*r.height)+'px';cursor.dataset.x=String(x);cursor.dataset.y=String(y);cursor.classList.toggle('grabbing',dragging);}
  function mouse(type){const r=canvas.getBoundingClientRect();canvas.dispatchEvent(new MouseEvent(type,{bubbles:true,cancelable:true,clientX:r.left+x/canvas.width*r.width,clientY:r.top+y/canvas.height*r.height,button:0,buttons:dragging?1:0}));}
  function move(dx,dy){x=Math.max(1,Math.min(canvas.width-1,x+dx));y=Math.max(1,Math.min(canvas.height-1,y+dy));paint();mouse('mousemove');}
  function release(){held.clear();if(dragging){dragging=false;mouse('mouseup');}paint();last=0;}
  function grab(){const next=held.has('Space')||held.has('Enter');if(next===dragging)return;dragging=next;mouse(next?'mousedown':'mouseup');paint();}
  canvas.addEventListener('keydown',e=>{
    if(!isRunning()||!['ArrowLeft','ArrowRight','ArrowUp','ArrowDown','Space','Enter','Escape','Home','ShiftLeft','ShiftRight'].includes(e.code))return;
    e.preventDefault();cursor.hidden=false;held.add(e.code);
    if(e.code==='Escape'){release();return;}
    if(e.code==='Home'){release();x=canvas.width/2;y=canvas.height/2;move(0,0);return;}
    if(e.code==='Space'||e.code==='Enter'){mouse('mousemove');grab();return;}
    if(!e.repeat){const d=e.shiftKey?1:10;move(e.code==='ArrowLeft'?-d:e.code==='ArrowRight'?d:0,e.code==='ArrowUp'?-d:e.code==='ArrowDown'?d:0);}
  });
  window.addEventListener('keyup',e=>{if(!held.has(e.code))return;held.delete(e.code);grab();});
  canvas.addEventListener('pointerdown',()=>{release();cursor.hidden=true;});
  canvas.addEventListener('blur',release);window.addEventListener('blur',release);
  document.addEventListener('visibilitychange',()=>{if(document.hidden)release();});
  function frame(now){if(isRunning()&&document.activeElement===canvas&&held.size){if(last){const dt=Math.min((now-last)/1000,.05),d=(held.has('ShiftLeft')||held.has('ShiftRight')?50:360)*dt;move((Number(held.has('ArrowRight'))-Number(held.has('ArrowLeft')))*d,(Number(held.has('ArrowDown'))-Number(held.has('ArrowUp')))*d);}last=now;}else last=0;requestAnimationFrame(frame);}
  window.addEventListener('resize',paint);document.addEventListener('fullscreenchange',paint);paint();requestAnimationFrame(frame);return{release};
}
