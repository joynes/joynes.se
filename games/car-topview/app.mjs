import{createCar,step,speed,pitch}from'./core.mjs';
import{bindFullscreen,bindGameAction}from'../../assets/game-view.mjs?v=9a65005d59b1';
const $=s=>document.querySelector(s),canvas=$('#view'),ctx=canvas.getContext('2d');
const keys=new Set(),touch={up:false,down:false,left:false,right:false},input={...touch};
const thumb=$('#thumbpad'),knob=$('#thumb-knob');let pointer=null;
let car=createCar(),running=false,paused=false,loading=false,last=0,acc=0,image=null,audio=null,source=null,gain=null,sound=true;
const bindings={ArrowUp:'up',KeyW:'up',ArrowDown:'down',KeyS:'down',ArrowLeft:'left',KeyA:'left',ArrowRight:'right',KeyD:'right'};
function radius(){return thumb.getBoundingClientRect().width/2;}
function sync(){
 for(const key of Object.keys(input)){input[key]=[...keys].some(k=>bindings[k]===key)||touch[key];thumb.dataset[key]=String(input[key]);}
 thumb.classList.toggle('moving',Object.values(input).some(Boolean));
 if(!pointer){thumb.style.left='';thumb.style.top='';const dx=Number(input.right)-Number(input.left),dy=Number(input.down)-Number(input.up),scale=radius()*.5/(Math.hypot(dx,dy)||1);knob.style.transform=`translate(${dx*scale}px,${dy*scale}px)`;}
}
function releaseTouch(){const id=pointer?.id;pointer=null;for(const key of Object.keys(touch))touch[key]=false;if(id!==undefined&&canvas.hasPointerCapture(id))canvas.releasePointerCapture(id);sync();}
function release(){keys.clear();releaseTouch();}
function draw(){
 ctx.fillStyle='#338033';ctx.fillRect(0,0,1024,600);ctx.fillStyle='#4d4d4d';ctx.fillRect(0,0,1024,20);ctx.fillRect(0,580,1024,20);ctx.fillRect(0,0,20,600);ctx.fillRect(1004,0,20,600);
 if(image){ctx.save();ctx.translate(car.x,car.y);ctx.rotate(car.angle+Math.PI*1.5);ctx.drawImage(image,-64,-64,128,128);ctx.restore();}
 $('#speed').textContent=`${Math.round(speed(car))} px/s`;Object.assign(canvas.dataset,{x:car.x.toFixed(2),y:car.y.toFixed(2),speed:speed(car).toFixed(2),angle:car.angle.toFixed(3)});$('#position').textContent=`Car: ${car.x<341?'left':car.x>683?'right':'center'}, ${car.y<200?'near the top wall':car.y>400?'near the bottom wall':'middle height'}.`;
 if(source)source.playbackRate.value=pitch(car);
}
function pause(value){paused=value;release();last=0;acc=0;$('#pause-screen').hidden=!paused;$('#pause').textContent=paused?'▶':'Ⅱ';$('#pause').setAttribute('aria-label',paused?'Resume':'Pause');$('#pause').title=paused?'Resume':'Pause';$('#pause').setAttribute('aria-pressed',String(paused));$('#state').textContent=paused?'Paused':'Free driving';if(gain)gain.gain.value=(sound&&!paused)?0.5:0;}
async function start(){
 if(loading)return;loading=true;$('#error').hidden=true;$('#start').disabled=true;$('#start').textContent='Loading car and engine sound…';
 try{
  audio??=new AudioContext();await audio.resume();
  const img=new Image();img.src='car.png';
  const response=await fetch('engine.wav');if(!response.ok)throw new Error('Could not fetch the engine sound.');
  const buffer=await audio.decodeAudioData(await response.arrayBuffer());await img.decode();image=img;
  source?.stop();source=audio.createBufferSource();source.buffer=buffer;source.loop=true;gain=audio.createGain();gain.gain.value=sound?0.5:0;source.connect(gain).connect(audio.destination);source.start();
  running=true;car=createCar();$('#intro').hidden=true;$('#play').hidden=false;pause(false);draw();canvas.focus();
 }catch(error){$('#error-message').textContent='Could not load the car or engine sound. Check your connection and retry.';$('#error').hidden=false;}
 finally{loading=false;$('#start').disabled=false;$('#start').textContent='Start with engine sound';}
}
$('#start').addEventListener('click',start);$('#retry').addEventListener('click',start);
bindGameAction($('#reset'),()=>{release();car=createCar();pause(false);draw();canvas.focus();});bindGameAction($('#pause'),()=>{pause(!paused);if(!paused)canvas.focus();});bindGameAction($('#resume'),()=>{pause(false);canvas.focus();});
bindGameAction($('#sound'),()=>{sound=!sound;$('#sound').textContent=sound?'♪':'♩';$('#sound').setAttribute('aria-label',sound?'Sound on':'Sound off');$('#sound').title=sound?'Sound on':'Sound off';$('#sound').setAttribute('aria-pressed',String(sound));if(gain)gain.gain.value=(sound&&!paused)?0.5:0;if(sound)audio?.resume();});
window.addEventListener('keydown',e=>{if(!running)return;if(['KeyP','Escape'].includes(e.code)){e.preventDefault();if(!e.repeat)pause(!paused);return;}if(!bindings[e.code]||paused||e.target.closest('button,a,summary,input'))return;e.preventDefault();if(e.repeat&&!keys.has(e.code))return;keys.add(e.code);sync();});
window.addEventListener('keyup',e=>{keys.delete(e.code);sync();});
function steer(e){
 const dx=e.clientX-pointer.x,dy=e.clientY-pointer.y,r=radius(),scale=Math.min(1,r*.5/(Math.hypot(dx,dy)||1));
 touch.up=dy<-r*.22;touch.down=dy>r*.22;touch.left=dx<-r*.22;touch.right=dx>r*.22;
 knob.style.transform=`translate(${dx*scale}px,${dy*scale}px)`;sync();
}
canvas.addEventListener('pointerdown',e=>{
 const r=canvas.getBoundingClientRect();if(!running||paused||e.button!==0||pointer||e.clientX-r.left>r.width/2||e.clientY-r.top<54)return;
 e.preventDefault();canvas.focus();pointer={id:e.pointerId,x:e.clientX,y:e.clientY};canvas.setPointerCapture(e.pointerId);
 const size=radius();thumb.style.left=`${Math.max(size+8,Math.min(r.width/2-size-8,e.clientX-r.left))}px`;thumb.style.top=`${Math.max(size+54,Math.min(r.height-size-8,e.clientY-r.top))}px`;steer(e);
});
canvas.addEventListener('pointermove',e=>{if(pointer?.id===e.pointerId&&!paused){e.preventDefault();steer(e);}});
for(const event of['pointerup','pointercancel','lostpointercapture'])canvas.addEventListener(event,e=>{if(pointer?.id===e.pointerId)releaseTouch();});
// Touching an in-game action keeps the thumb contact; keyboard Tab still releases it.
for(const button of document.querySelectorAll('.toolbar button'))button.addEventListener('pointerdown',e=>e.preventDefault());
canvas.addEventListener('blur',release);window.addEventListener('blur',()=>{if(running)pause(true);});document.addEventListener('visibilitychange',()=>{if(document.hidden&&running)pause(true);last=0;});
window.addEventListener('resize',release);
bindFullscreen($('#board'),$('#fullscreen'),()=>{release();last=0;acc=0;if(running){draw();canvas.focus({preventScroll:true});}});
function frame(now){if(running&&!paused&&!document.hidden){if(last)acc+=Math.min(.1,(now-last)/1000);while(acc>=1/60){step(car,input);acc-=1/60;}draw();}last=now;requestAnimationFrame(frame);}requestAnimationFrame(frame);
window.addEventListener('pagehide',()=>{if(running)pause(true);});

$('#start').textContent='Start with engine sound';$('#start').disabled=false;
