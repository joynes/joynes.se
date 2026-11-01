import{createCar,step,speed,pitch}from'./core.mjs';
const $=s=>document.querySelector(s),canvas=$('#view'),ctx=canvas.getContext('2d');
const keys=new Set(),pointers=new Map(),input={up:false,down:false,left:false,right:false};
let car=createCar(),running=false,paused=false,loading=false,last=0,acc=0,image=null,audio=null,source=null,gain=null,sound=true;
const bindings={ArrowUp:'up',KeyW:'up',ArrowDown:'down',KeyS:'down',ArrowLeft:'left',KeyA:'left',ArrowRight:'right',KeyD:'right'};
function sync(){for(const key of Object.keys(input)){input[key]=[...keys].some(k=>bindings[k]===key)||[...pointers.values()].includes(key);document.querySelector(`[data-control="${key}"]`).classList.toggle('active',input[key]);}}
function release(){keys.clear();pointers.clear();sync();}
function draw(){
 ctx.fillStyle='#338033';ctx.fillRect(0,0,1024,600);ctx.fillStyle='#4d4d4d';ctx.fillRect(0,0,1024,20);ctx.fillRect(0,580,1024,20);ctx.fillRect(0,0,20,600);ctx.fillRect(1004,0,20,600);
 if(image){ctx.save();ctx.translate(car.x,car.y);ctx.rotate(car.angle+Math.PI*1.5);ctx.drawImage(image,-64,-64,128,128);ctx.restore();}
 $('#speed').textContent=`${Math.round(speed(car))} px/s`;Object.assign(canvas.dataset,{x:car.x.toFixed(2),y:car.y.toFixed(2),speed:speed(car).toFixed(2),angle:car.angle.toFixed(3)});$('#position').textContent=`Bilen är ${car.x<341?'till vänster':car.x>683?'till höger':'i mitten'}, ${car.y<200?'nära övre väggen':car.y>400?'nära nedre väggen':'mitt på höjden'}.`;
 if(source)source.playbackRate.value=pitch(car);
}
function pause(value){paused=value;release();last=0;acc=0;$('#pause-screen').hidden=!paused;$('#pause').textContent=paused?'Fortsätt':'Pausa';$('#pause').setAttribute('aria-pressed',String(paused));$('#state').textContent=paused?'Pausat':'Kör fritt';if(gain)gain.gain.value=(sound&&!paused)?0.5:0;}
async function start(){
 if(loading)return;loading=true;$('#error').hidden=true;$('#start').disabled=true;$('#start').textContent='Laddar bil och motorljud…';
 try{
  audio??=new AudioContext();await audio.resume();
  const img=new Image();img.src='car.png';
  const response=await fetch('engine.wav');if(!response.ok)throw new Error('Motorljudet kunde inte hämtas.');
  const buffer=await audio.decodeAudioData(await response.arrayBuffer());await img.decode();image=img;
  source?.stop();source=audio.createBufferSource();source.buffer=buffer;source.loop=true;gain=audio.createGain();gain.gain.value=sound?0.5:0;source.connect(gain).connect(audio.destination);source.start();
  running=true;car=createCar();$('#intro').hidden=true;$('#play').hidden=false;pause(false);draw();canvas.focus();
 }catch(error){$('#error-message').textContent='Bilen eller motorljudet kunde inte laddas. Kontrollera anslutningen och försök igen.';$('#error').hidden=false;}
 finally{loading=false;$('#start').disabled=false;$('#start').textContent='Starta med motorljud';}
}
$('#start').addEventListener('click',start);$('#retry').addEventListener('click',start);
$('#reset').addEventListener('click',()=>{release();car=createCar();pause(false);draw();canvas.focus();});$('#pause').addEventListener('click',()=>{pause(!paused);if(!paused)canvas.focus();});$('#resume').addEventListener('click',()=>{pause(false);canvas.focus();});
$('#sound').addEventListener('click',()=>{sound=!sound;$('#sound').textContent=sound?'Ljud på':'Ljud av';$('#sound').setAttribute('aria-pressed',String(sound));if(gain)gain.gain.value=(sound&&!paused)?0.5:0;if(sound)audio?.resume();});
window.addEventListener('keydown',e=>{if(!running)return;if(['KeyP','Escape'].includes(e.code)){e.preventDefault();if(!e.repeat)pause(!paused);return;}if(!bindings[e.code]||paused||e.target.closest('button,a,summary,input'))return;e.preventDefault();keys.add(e.code);sync();});
window.addEventListener('keyup',e=>{keys.delete(e.code);sync();});
for(const b of document.querySelectorAll('[data-control]')){
 b.addEventListener('pointerdown',e=>{if(!running||paused||e.button!==0)return;e.preventDefault();b.setPointerCapture(e.pointerId);pointers.set(e.pointerId,b.dataset.control);sync();canvas.focus();});
 for(const ev of['pointerup','pointercancel','lostpointercapture'])b.addEventListener(ev,e=>{pointers.delete(e.pointerId);sync();});
}
canvas.addEventListener('blur',()=>{if(keys.size)release();});window.addEventListener('blur',()=>{if(running)pause(true);});document.addEventListener('visibilitychange',()=>{if(document.hidden&&running)pause(true);last=0;});
function frame(now){if(running&&!paused&&!document.hidden){if(last)acc+=Math.min(.1,(now-last)/1000);while(acc>=1/60){step(car,input);acc-=1/60;}draw();}last=now;requestAnimationFrame(frame);}requestAnimationFrame(frame);
window.addEventListener('pagehide',()=>{if(running)pause(true);});
