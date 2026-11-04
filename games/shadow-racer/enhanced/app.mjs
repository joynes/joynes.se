import{createJob,step,clamp}from'./core.mjs?v=c3bbf84468aa';
import{createGraphics}from'./graphics.mjs?v=48adb1b389bf';
import{bindFullscreen,bindGameAction}from'../../../assets/game-view.mjs?v=9a65005d59b1';
const $=id=>document.getElementById(id),canvas=$('canvas'),STORAGE='joynes:ridge-courier:v1';
let levels=[],chosen=0,job=null,graphics=null,ready=false,keys=new Set(),pedals=new Map(),boostContacts=new Set(),owner=null,origin=null,pad={lean:0,throttle:0},audio,buffers={},bufferInfo={},master,meter,motor,motorGain,muted=false,last=0,acc=0,noticeUntil=0,notice='',save={routes:{}};
try{const d=JSON.parse(localStorage.getItem(STORAGE));if(d?.routes&&typeof d.routes==='object')save=d;}catch{}
function record(id){const r=save.routes[id];return r&&Number.isFinite(r.time)&&r.time>0?r:null;}
function input(){let pedal=0;for(const value of pedals.values())pedal+=value;return{throttle:clamp(pad.throttle+pedal+Number(keys.has('KeyW')||keys.has('ArrowUp'))-Number(keys.has('KeyS')||keys.has('ArrowDown')),-1,1),lean:clamp(pad.lean+Number(keys.has('KeyD')||keys.has('ArrowRight'))-Number(keys.has('KeyA')||keys.has('ArrowLeft')),-1,1),boost:keys.has('Space')||boostContacts.size>0};}
function clearPad(){const old=owner;owner=null;origin=null;pad={lean:0,throttle:0};$('thumbpad').style.left='';$('thumbpad').style.top='';$('thumbpad').style.bottom='';$('knob').style.transform='';if(old!==null&&canvas.hasPointerCapture(old))canvas.releasePointerCapture(old);}
function clearInput(){keys.clear();pedals.clear();boostContacts.clear();clearPad();}
function say(text,seconds=1.7){notice=text;noticeUntil=performance.now()+seconds*1000;$('notice').textContent=text;}
function menu(){
 $('routes').replaceChildren(...levels.map((l,i)=>{const button=document.createElement('button'),r=record(l.id),open=i===0||record(levels[i-1].id);button.className='route';button.dataset.route=l.id;button.disabled=!open;button.setAttribute('aria-pressed',String(i===chosen));const image=new Image();image.src=`assets/route-${l.id}.jpg?v=1.0.0`;image.alt='';const title=document.createElement('strong');title.textContent=l.name;const detail=document.createElement('span');detail.textContent=r?`Best ${r.time.toFixed(1)}s`:open?'3 parcels':'Clear previous route';button.append(image,title,detail);button.onclick=()=>{chosen=i;menu();};return button;}));$('progress').textContent=`${levels.filter(l=>record(l.id)).length} / 3 routes delivered`;
}
async function load(){
 ready=false;$('start').disabled=true;$('retry').hidden=true;$('loading').textContent='Loading models and audio…';
 try{
  const response=await fetch('assets/routes.json?v=1.0.0');if(!response.ok)throw Error('Routes unavailable');levels=await response.json();graphics?.dispose();graphics=null;graphics=await createGraphics(canvas,levels);
  const raw=await Promise.all(['music','engine','delivery'].map(async name=>{const response=await fetch(`assets/${name}.mp3?v=1.0.0`);if(!response.ok)throw Error(name);return[name,await response.arrayBuffer()];}));
  audio||=new AudioContext();await Promise.all(raw.map(async([name,data])=>{const b=await audio.decodeAudioData(data);buffers[name]=b;bufferInfo[name]={duration:b.duration,nonzero:b.getChannelData(0).some(v=>Math.abs(v)>.001)};}));
  ready=true;menu();$('start').disabled=false;$('loading').textContent='Three stops. Brake to deliver. Boost over gaps.';
 }catch(error){graphics?.dispose();graphics=null;$('loading').textContent='Could not load the 3D game. Check your connection and retry.';$('retry').hidden=false;}
}
function initAudio(){
 void audio.resume();if(master)return;master=audio.createGain();master.gain.value=muted?0:1;meter=audio.createAnalyser();meter.fftSize=256;master.connect(meter).connect(audio.destination);
 const music=audio.createBufferSource(),gain=audio.createGain();music.buffer=buffers.music;music.loop=true;gain.gain.value=.2;music.connect(gain).connect(master);music.start();motor=audio.createBufferSource();motor.buffer=buffers.engine;motor.loop=true;motorGain=audio.createGain();motorGain.gain.value=0;motor.connect(motorGain).connect(master);motor.start();
}
function cue(rate=1){if(!master||muted)return;const s=audio.createBufferSource(),g=audio.createGain();s.buffer=buffers.delivery;s.playbackRate.value=rate;g.gain.value=.3;s.connect(g).connect(master);s.onended=()=>{s.disconnect();g.disconnect();};s.start();}
function start(){if(!ready)return;initAudio();clearInput();job=createJob(levels[chosen]);last=0;acc=0;$('menu').hidden=true;$('play').hidden=false;$('overlay').hidden=true;$('route-name').textContent=levels[chosen].name;$('pause').disabled=false;paintPause(false);graphics.select(chosen,job);graphics.render(job,chosen);canvas.focus({preventScroll:true});$('board').scrollIntoView({block:'center',behavior:'instant'});say('Brake at each depot');}
function overlay(kicker,title,text){$('result-kicker').textContent=kicker;$('result-title').textContent=title;$('result-text').textContent=text;$('resume').hidden=job.status!=='paused';$('again').hidden=job.status==='paused';$('next').hidden=job.status!=='won'||chosen===levels.length-1;$('overlay').hidden=false;}
function paintPause(paused){$('pause').textContent=paused?'▶':'Ⅱ';$('pause').title=paused?'Resume':'Pause';$('pause').setAttribute('aria-label',paused?'Resume':'Pause');$('pause').setAttribute('aria-pressed',String(paused));}
function pause(){if(job?.status!=='running')return;job.status='paused';paintPause(true);clearInput();acc=0;last=0;overlay('PAUSED','Parked for a moment','');}
function resume(){if(job?.status!=='paused')return;initAudio();clearInput();job.status='running';paintPause(false);last=0;acc=0;$('overlay').hidden=true;canvas.focus({preventScroll:true});}
function finish(){
 clearInput();$('pause').disabled=true;if(job.status==='won'){
  const id=levels[chosen].id,old=record(id);if(!old||job.time<old.time){save.routes[id]={time:job.time,rescues:job.rescues};try{localStorage.setItem(STORAGE,JSON.stringify(save));}catch{}}
  cue(1.2);overlay(chosen===2?'ALL ROUTES DELIVERED':job.rescues===0?'CAREFUL COURIER':'DELIVERY COMPLETE',`Three parcels delivered`,`${job.time.toFixed(1)}s · ${job.rescues} rescues`);menu();
 }else overlay('ROUTE ENDED',job.hull<=0?'Out of repairs':"Time’s up",'Try a gentler landing. Brake at the depots.');
}
function sound(){muted=!muted;if(master)master.gain.setValueAtTime(muted?0:1,audio.currentTime);$('sound').textContent=muted?'♪':'♫';$('sound').setAttribute('aria-label',muted?'Unmute sound':'Mute sound');}
$('start').onclick=start;$('retry').onclick=load;bindGameAction($('pause'),()=>job?.status==='paused'?resume():pause());bindGameAction($('resume'),resume);bindGameAction($('restart'),start);bindGameAction($('again'),start);bindGameAction($('sound'),sound);bindGameAction($('next'),()=>{chosen=Math.min(chosen+1,levels.length-1);start();});bindGameAction($('menu-button'),()=>{if(document.fullscreenElement||$('board').classList.contains('game-view-expanded'))$('fullscreen').click();clearInput();job=null;$('play').hidden=true;$('menu').hidden=false;menu();$('start').focus();});$('fullscreen').addEventListener('pointerdown',e=>{if(e.pointerType==='touch')e.preventDefault();});
bindFullscreen($('board'),$('fullscreen'),active=>{clearInput();graphics?.resize();if(job)canvas.focus({preventScroll:true});if(parent!==window)parent.postMessage({type:'joynes:game-view',active},location.origin);});
window.addEventListener('message',e=>{if(e.source===parent&&e.origin===location.origin&&e.data?.type==='joynes:game-view-close'&&$('board').classList.contains('game-view-expanded'))$('fullscreen').click();});
window.addEventListener('keydown',event=>{
 if(event.target instanceof HTMLElement&&event.target.closest('button,a,input,summary'))return;
 if(['ArrowUp','ArrowDown','ArrowLeft','ArrowRight','KeyW','KeyA','KeyS','KeyD','Space'].includes(event.code)){event.preventDefault();if(event.repeat&&!keys.has(event.code))return;if(job?.status==='running')keys.add(event.code);}
 else if(!event.repeat&&['KeyP','Escape','KeyR','KeyM'].includes(event.code)){event.preventDefault();if(event.code==='KeyM')sound();else if(event.code==='KeyR'&&job)start();else if(job?.status==='paused')resume();else pause();}
});window.addEventListener('keyup',event=>keys.delete(event.code));window.addEventListener('blur',pause);canvas.addEventListener('blur',clearInput);document.addEventListener('visibilitychange',()=>{if(document.hidden)pause();});window.addEventListener('resize',()=>{clearInput();graphics?.resize();});
canvas.addEventListener('pointerdown',event=>{if(owner!==null||event.button!==0||job?.status!=='running')return;const r=canvas.getBoundingClientRect();if(event.clientX-r.x>r.width*.6||event.clientY-r.y<130)return;event.preventDefault();canvas.focus({preventScroll:true});owner=event.pointerId;origin={x:event.clientX,y:event.clientY};canvas.setPointerCapture(owner);const radius=$('thumbpad').getBoundingClientRect().width/2,maxY=r.height-radius-8;$('thumbpad').style.left=`${clamp(event.clientX-r.x,radius+8,r.width*.6-radius-8)}px`;$('thumbpad').style.top=`${clamp(event.clientY-r.y,Math.min(130+radius+8,maxY),maxY)}px`;$('thumbpad').style.bottom='auto';});
canvas.addEventListener('pointermove',event=>{if(event.pointerId!==owner)return;const r=$('thumbpad').getBoundingClientRect().width/2,dx=event.clientX-origin.x,dy=event.clientY-origin.y;pad={lean:Math.abs(dx)<r*.15?0:clamp(dx/r,-1,1),throttle:Math.abs(dy)<r*.15?0:clamp(-dy/r,-1,1)};const scale=Math.min(1,r*.5/(Math.hypot(dx,dy)||1));$('knob').style.transform=`translate(${dx*scale}px,${dy*scale}px)`;});for(const type of['pointerup','pointercancel','lostpointercapture'])canvas.addEventListener(type,event=>{if(event.pointerId===owner)clearPad();});
function bindContinuous(button,onDown,onUp){button.addEventListener('pointerdown',event=>{if(event.button!==0||job?.status!=='running')return;event.preventDefault();button.setPointerCapture(event.pointerId);onDown(event.pointerId);});for(const type of['pointerup','pointercancel','lostpointercapture'])button.addEventListener(type,event=>onUp(event.pointerId));button.addEventListener('keydown',event=>{if(!['Space','Enter'].includes(event.code)||event.repeat||job?.status!=='running')return;event.preventDefault();onDown('keyboard:'+event.code);});button.addEventListener('keyup',event=>{if(['Space','Enter'].includes(event.code)){event.preventDefault();onUp('keyboard:'+event.code);}});button.addEventListener('blur',()=>{onUp('keyboard:Space');onUp('keyboard:Enter');});}
bindContinuous($('boost'),id=>boostContacts.add(id),id=>boostContacts.delete(id));for(const button of document.querySelectorAll('[data-pedal]'))bindContinuous(button,id=>pedals.set(button.dataset.pedal+':'+id,Number(button.dataset.pedal)),id=>pedals.delete(button.dataset.pedal+':'+id));
canvas.addEventListener('webglcontextlost',event=>{event.preventDefault();clearInput();job=null;ready=false;$('play').hidden=true;$('menu').hidden=false;$('start').disabled=true;$('loading').textContent='Graphics stopped. Reload to continue.';$('retry').hidden=false;$('retry').onclick=()=>location.reload();});
function update(){
 if(!job||!graphics)return;const level=levels[chosen];graphics.render(job,chosen);$('clock').textContent=`${Math.ceil(Math.max(0,level.limit-job.time))}s`;$('cargo').textContent=`${job.delivered} / 3 delivered`;$('hull').textContent='♥'.repeat(Math.max(0,job.hull));$('hull').setAttribute('aria-label',`${job.hull} repairs remaining`);$('battery').textContent=`${Math.round(job.energy)}%`;$('boost').dataset.active=String(job.boostTime>0);
 for(const button of document.querySelectorAll('[data-pedal]'))button.dataset.active=String([...pedals.values()].includes(Number(button.dataset.pedal)));
 const depot=level.depots[job.delivered],distance=depot===undefined?0:Math.round(Math.abs(depot-job.x)*.06),gap=level.gaps.some(([a])=>a>job.x&&a-job.x<350);
 $('target').textContent=job.dock>0?`Delivering ${Math.round(job.dock/.85*100)}%`:gap?'Gap ahead · Boost':Math.abs(job.wind)>1?'Headwind · keep speed':depot===undefined?'Route complete':`Depot ${job.delivered+1} · ${distance} m`;
 const point=graphics.depotPoint(chosen,job.delivered);$('depot-label').hidden=!point?.visible;if(point?.visible){$('depot-label').style.left=`${point.x*100}%`;$('depot-label').style.top=`${point.y*100}%`;}
 if(performance.now()>=noticeUntil)$('notice').textContent='';
}
function frame(now){
 const dt=last?Math.min((now-last)/1000,.15):0;last=now;
 if(job?.status==='running'){
  acc+=dt;while(acc>=1/120&&job.status==='running'){const events=step(job,levels[chosen],input(),1/120);acc-=1/120;for(const event of events){if(event==='delivery'){cue();say('Delivered · battery full');}else if(event==='recover'){clearInput();say('Recovered · release controls to retry');}else if(event==='won'||event==='lost')finish();}}
 }
 const running=job?.status==='running',volume=muted||!job?0:running?1:job.status==='paused'? .35 : .7;
 if(master)master.gain.setTargetAtTime(volume,audio.currentTime,.06);
 if(motorGain){motorGain.gain.setTargetAtTime(running ? .035+Math.abs(job.vx)/310*.09 : 0,audio.currentTime,.08);motor.playbackRate.setTargetAtTime(.6+Math.abs(job?.vx||0)/310*.85,audio.currentTime,.08);}
 update();requestAnimationFrame(frame);
}
export function readGame(){let peak=0;if(meter){const samples=new Float32Array(meter.fftSize);meter.getFloatTimeDomainData(samples);for(const s of samples)peak=Math.max(peak,Math.abs(s));}return{job:job?structuredClone(job):null,level:levels[chosen]?structuredClone(levels[chosen]):null,input:input(),ready,muted,graphics:graphics?.stats(),audio:audio?{state:audio.state,buffers:bufferInfo,peak,gain:master?.gain.value,motorGain:motorGain?.gain.value}:null};}
load();requestAnimationFrame(frame);
