import{WIDTH,HEIGHT,clamp,createRace,step,target,tangent}from'./core.mjs?v=5d2eda32ee4c';
import{bindFullscreen,bindGameAction}from'../../../assets/game-view.mjs?v=9a65005d59b1';
const $=id=>document.getElementById(id),canvas=$('canvas'),ctx=canvas.getContext('2d'),STORAGE='joynes:night-circuit:v1';
let courses=[],images={},buffers={},bufferInfo={},audio,master,meter,motorGain,motor,ready=false,chosen=0,race=null,muted=false,notice='',noticeUntil=0,last=0,keys=new Set(),boostPointers=new Set(),owner=null,pad=null,vector={steer:0,throttle:0},save={courses:{}};
try{const data=JSON.parse(localStorage.getItem(STORAGE));if(data&&typeof data.courses==='object'&&data.courses)save=data;}catch{}
function record(id){const v=save.courses[id];return v&&Number.isFinite(v.time)&&Array.isArray(v.ghost)?v:null;}
function clearInput(){keys.clear();boostPointers.clear();if(owner!==null&&canvas.hasPointerCapture(owner))canvas.releasePointerCapture(owner);owner=null;pad=null;vector={steer:0,throttle:0};$('boost').dataset.active='false';}
function say(text,seconds=1.5){notice=text;noticeUntil=performance.now()+seconds*1000;}
function input(){return{steer:clamp(vector.steer+Number(keys.has('ArrowRight')||keys.has('KeyD'))-Number(keys.has('ArrowLeft')||keys.has('KeyA')),-1,1),throttle:clamp(vector.throttle+Number(keys.has('ArrowUp')||keys.has('KeyW'))-Number(keys.has('ArrowDown')||keys.has('KeyS')),-1,1),boost:keys.has('Space')||boostPointers.size>0};}
function persist(){try{localStorage.setItem(STORAGE,JSON.stringify(save));}catch{say('Record saved for this session');}}
function menu(){
 $('courses').replaceChildren(...courses.map((c,i)=>{const button=document.createElement('button'),r=record(c.id),open=i===0||record(courses[i-1].id);button.className='course';button.dataset.course=c.id;button.setAttribute('aria-pressed',String(i===chosen));button.disabled=!open;const image=new Image();image.src=`assets/course-${c.id}.jpg?v=1.0.0`;image.alt='';const title=document.createElement('strong');title.textContent=c.name;const detail=document.createElement('span');detail.textContent=r?`${r.medal} · ${r.time.toFixed(1)}s`:open?`${c.limit}s limit`:'Clear previous course';button.append(image,title,detail);button.onclick=()=>{chosen=i;menu();};return button;}));
 $('progress').textContent=`${courses.filter(c=>record(c.id)).length} / 3 cleared`;
}
async function load(){
 ready=false;$('start').disabled=true;$('retry').hidden=true;$('loading').textContent='Loading graphics and audio…';
 try{
  const courseResponse=await fetch('assets/courses.json?v=1.0.0');if(!courseResponse.ok)throw Error('courses');courses=await courseResponse.json();
  const names=['car',...courses.map(c=>'course-'+c.id)];
  await Promise.all(names.map(async name=>{const image=new Image();image.src=`assets/${name}.${name==='car'?'png':'jpg'}?v=1.0.0`;await image.decode();if(image.naturalWidth<100)throw Error(name);images[name]=image;}));
  const raw=await Promise.all(['music','engine','chime'].map(async name=>{const response=await fetch(`assets/${name}.mp3?v=1.0.0`);if(!response.ok)throw Error(name);return[name,await response.arrayBuffer()];}));
  audio||=new AudioContext();await Promise.all(raw.map(async([name,data])=>{const b=await audio.decodeAudioData(data);buffers[name]=b;bufferInfo[name]={duration:b.duration,nonzero:b.getChannelData(0).some(v=>Math.abs(v)>.001)};}));
  ready=true;menu();$('start').disabled=false;$('loading').textContent='Corner to refill boost. Beat your ghost.';
 }catch{$('loading').textContent='Could not load the game. Check your connection and retry.';$('retry').hidden=false;}
}
function initAudio(){
 void audio.resume();
 if(master)return;
 master=audio.createGain();master.gain.value=muted?0:1;meter=audio.createAnalyser();meter.fftSize=256;master.connect(meter).connect(audio.destination);
 const music=audio.createBufferSource(),musicGain=audio.createGain();music.buffer=buffers.music;music.loop=true;musicGain.gain.value=.20;music.connect(musicGain).connect(master);music.start();
 motor=audio.createBufferSource();motor.buffer=buffers.engine;motor.loop=true;motorGain=audio.createGain();motorGain.gain.value=0;motor.connect(motorGain).connect(master);motor.start();
}
function chime(rate=1){if(!master||muted)return;const s=audio.createBufferSource(),g=audio.createGain();s.buffer=buffers.chime;s.playbackRate.value=rate;g.gain.value=.35;s.connect(g).connect(master);s.onended=()=>{s.disconnect();g.disconnect();};s.start();}
function start(){
 if(!ready)return;initAudio();clearInput();race=createRace(courses[chosen]);$('menu').hidden=true;$('play').hidden=false;$('overlay').hidden=true;$('course-name').textContent=courses[chosen].name;canvas.focus({preventScroll:true});$('board').scrollIntoView({block:'center',behavior:'instant'});say('GO · Follow the gold gates',2);
}
function pause(){if(!race||race.status!=='running')return;race.status='paused';clearInput();showOverlay('PAUSED','Take a breath','');}
function resume(){if(race?.status!=='paused')return;initAudio();clearInput();race.status='running';$('overlay').hidden=true;canvas.focus({preventScroll:true});}
function showOverlay(kicker,title,text){
 $('result-kicker').textContent=kicker;$('result-title').textContent=title;$('result-text').textContent=text;
 const paused=race.status==='paused';$('resume').hidden=!paused;$('again').hidden=paused;$('next').hidden=race.status!=='won'||chosen===courses.length-1;$('overlay').hidden=false;
}
function finished(){
 clearInput();const c=courses[chosen],old=record(c.id);
 if(race.status==='won'){
  const best=!old||race.time<old.time;if(best){save.courses[c.id]={time:race.time,medal:race.medal,ghost:race.ghost};persist();}
  chime(1.2);showOverlay(chosen===2?'ALL COURSES CLEARED':best?'PERSONAL BEST':'LAP COMPLETE',`${race.medal} · ${race.time.toFixed(1)}s`,chosen===2?'Night Circuit complete. Chase Gold on every course.':'Next course unlocked.');
 }else showOverlay('TIME UP','Try a cleaner line',`Finish within ${c.limit}s. Boost on the straights.`);
 menu();
}
function toggleSound(){muted=!muted;if(master)master.gain.setValueAtTime(muted?0:1,audio.currentTime);$('sound').setAttribute('aria-label',muted?'Unmute sound':'Mute sound');$('sound').textContent=muted?'♪':'♫';}
$('start').onclick=start;$('retry').onclick=load;
bindGameAction($('pause'),()=>race?.status==='paused'?resume():pause());bindGameAction($('restart'),start);bindGameAction($('resume'),resume);bindGameAction($('again'),start);bindGameAction($('sound'),toggleSound);
bindGameAction($('next'),()=>{chosen=Math.min(chosen+1,courses.length-1);start();});
bindGameAction($('menu-button'),()=>{if(document.fullscreenElement||$('board').classList.contains('game-view-expanded'))$('fullscreen').click();clearInput();race=null;$('play').hidden=true;$('menu').hidden=false;menu();$('start').focus();});
$('fullscreen').addEventListener('pointerdown',e=>{if(e.pointerType==='touch')e.preventDefault();});
bindFullscreen($('board'),$('fullscreen'),active=>{clearInput();canvas.focus({preventScroll:true});if(parent!==window)parent.postMessage({type:'joynes:game-view',active},location.origin);});
window.addEventListener('message',e=>{if(e.source===parent&&e.origin===location.origin&&e.data?.type==='joynes:game-view-close'&&$('board').classList.contains('game-view-expanded'))$('fullscreen').click();});
window.addEventListener('keydown',e=>{
 if(e.target instanceof HTMLElement&&e.target.closest('button,a,input,summary'))return;
 if(['ArrowUp','ArrowDown','ArrowLeft','ArrowRight','KeyW','KeyA','KeyS','KeyD','Space'].includes(e.code)){
  e.preventDefault();if(e.repeat&&!keys.has(e.code))return;if(race?.status==='running')keys.add(e.code);
 }else if(!e.repeat&&['KeyP','Escape','KeyR','KeyM'].includes(e.code)){
  e.preventDefault();if(e.code==='KeyM')toggleSound();else if(e.code==='KeyR'&&race)start();else if(race?.status==='paused')resume();else pause();
 }
});
window.addEventListener('keyup',e=>keys.delete(e.code));window.addEventListener('blur',pause);canvas.addEventListener('blur',clearInput);document.addEventListener('visibilitychange',()=>{if(document.hidden)pause();});
function point(e){const r=canvas.getBoundingClientRect();return{x:(e.clientX-r.x)*WIDTH/r.width,y:(e.clientY-r.y)*HEIGHT/r.height};}
canvas.addEventListener('pointerdown',e=>{if(e.button!==0||owner!==null||race?.status!=='running')return;const p=point(e);if(p.x>WIDTH*.65)return;e.preventDefault();canvas.focus({preventScroll:true});owner=e.pointerId;pad={...p};canvas.setPointerCapture(owner);vector={steer:0,throttle:0};});
canvas.addEventListener('pointermove',e=>{if(e.pointerId!==owner)return;const p=point(e);vector={steer:clamp((p.x-pad.x)/55,-1,1),throttle:clamp((pad.y-p.y)/55,-1,1)};});
for(const type of['pointerup','pointercancel','lostpointercapture'])canvas.addEventListener(type,e=>{if(e.pointerId===owner){owner=null;pad=null;vector={steer:0,throttle:0};}});
$('boost').addEventListener('pointerdown',e=>{if(e.button!==0||race?.status!=='running')return;e.preventDefault();boostPointers.add(e.pointerId);$('boost').setPointerCapture(e.pointerId);});
for(const type of['pointerup','pointercancel','lostpointercapture'])$('boost').addEventListener(type,e=>boostPointers.delete(e.pointerId));
// A focused button retains normal Space/Enter activation for attached keyboards.
$('boost').addEventListener('keydown',e=>{if(['Space','Enter'].includes(e.code)){e.preventDefault();if(race?.status==='running')keys.add('Space');}});$('boost').addEventListener('keyup',e=>{if(['Space','Enter'].includes(e.code))keys.delete('Space');});$('boost').addEventListener('blur',()=>keys.delete('Space'));
function car(x,y,angle,alpha=1){ctx.save();ctx.globalAlpha=alpha;ctx.translate(x,y);ctx.rotate(angle);ctx.drawImage(images.car,-40,-40,80,80);ctx.restore();}
function draw(){
 if(!race||!ready)return;const c=courses[chosen];ctx.drawImage(images['course-'+c.id],0,0,WIDTH,HEIGHT);
 const goal=target(c,race),ghost=record(c.id)?.ghost;
 if(ghost?.length){const g=ghost.find(v=>v[0]>=race.time);if(g)car(g[1],g[2],g[3],.28);}
 for(let i=0;i<race.gates;i++){
  const p=c.path[Math.floor(i*c.path.length/race.gates)],active=i===race.next%race.gates,done=i>0&&i<race.next;
  ctx.save();ctx.translate(...p);ctx.rotate(tangent(c.path,Math.floor(i*c.path.length/race.gates)));ctx.strokeStyle=active?'#ffd187':done?'#79f4bd66':'#defcff44';ctx.lineWidth=active?5:2;ctx.beginPath();ctx.moveTo(0,-c.width*.36);ctx.lineTo(0,c.width*.36);ctx.stroke();ctx.restore();
  if(active){ctx.fillStyle='#ffdc9e';ctx.font='bold 16px system-ui';ctx.textAlign='center';ctx.fillText(i===0?'FINISH':`${i}`,p[0],p[1]-c.width*.5);}
 }
 const aim=Math.atan2(goal[1]-race.y,goal[0]-race.x);ctx.save();ctx.translate(race.x,race.y);ctx.rotate(aim);ctx.fillStyle='#ffd18b';ctx.beginPath();ctx.moveTo(42,0);ctx.lineTo(32,-5);ctx.lineTo(32,5);ctx.fill();ctx.restore();
 if(race.boosting){ctx.save();ctx.translate(race.x,race.y);ctx.rotate(race.angle);ctx.fillStyle='#a2ffd5';ctx.beginPath();ctx.moveTo(-17,-5);ctx.lineTo(-35-Math.random()*15,0);ctx.lineTo(-17,5);ctx.fill();ctx.restore();}
 car(race.x,race.y,race.angle);
 // Touch controls stay over the scene, including the discoverable idle pad.
 const base=pad||{x:112,y:HEIGHT-110};ctx.save();ctx.globalAlpha=pad?.75:.28;ctx.strokeStyle='#beffdf';ctx.fillStyle='#163448';ctx.lineWidth=3;ctx.beginPath();ctx.arc(base.x,base.y,59,0,Math.PI*2);ctx.fill();ctx.stroke();ctx.fillStyle='#b0efd4';ctx.beginPath();ctx.arc(base.x+vector.steer*40,base.y-vector.throttle*40,23,0,Math.PI*2);ctx.fill();ctx.restore();
 $('timer').textContent=`${race.time.toFixed(1)}s`;$('gates').textContent=`${Math.min(race.next,8)} / 8`;$('energy').textContent=`Boost ${Math.round(race.energy)}%`;$('boost').dataset.active=String(race.boosting);$('message').textContent=performance.now()<noticeUntil?notice:race.offroad>.5?'Back to the road · recovery costs 3s':'';
}
function frame(now){
 const dt=Math.min((now-last)/1000,1/30);last=now;
 if(race?.status==='running')for(const event of step(race,courses[chosen],input(),dt)){
  if(event==='gate')chime();if(event==='recover')say('Recovered · +3s');if(event==='won'||event==='lost')finished();
 }
 if(motorGain){const running=race?.status==='running';motorGain.gain.setTargetAtTime(running?.035+Math.abs(race.speed)/270*.09:0,audio.currentTime,.08);motor.playbackRate.setTargetAtTime(.65+Math.abs(race?.speed||0)/270*.9,audio.currentTime,.08);}
 draw();requestAnimationFrame(frame);
}
export function readGame(){let peak=0;if(meter){const samples=new Float32Array(meter.fftSize);meter.getFloatTimeDomainData(samples);for(const sample of samples)peak=Math.max(peak,Math.abs(sample));}return{race:race?structuredClone(race):null,course:courses[chosen]?structuredClone(courses[chosen]):null,input:input(),ready,muted,audio:audio?{state:audio.state,buffers:bufferInfo,peak,gain:master?.gain.value,motorGain:motorGain?.gain.value}:null};}
load();requestAnimationFrame(frame);
