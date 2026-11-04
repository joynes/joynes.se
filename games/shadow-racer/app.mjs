import{bindFullscreen,bindGameAction}from'../../assets/game-view.mjs?v=9a65005d59b1';
const $=id=>document.getElementById(id);
const versions=new Set(['20080928','20081005']);
const keyCodes={ArrowLeft:37,ArrowUp:38,ArrowRight:39,ArrowDown:40,Enter:13};
const aliases={a:'ArrowLeft',w:'ArrowUp',d:'ArrowRight',s:'ArrowDown'};
const initialURL=new URL(location.href),retryRequested=initialURL.searchParams.get('retry')==='1';
const selected=initialURL.searchParams.get('version');if(versions.has(selected))$('version').value=selected;
if(retryRequested){try{const saved=JSON.parse(sessionStorage.getItem('joynes-shadow-retry')||'null');if(typeof saved?.name==='string')$('name').value=saved.name.slice(0,24);sessionStorage.removeItem('joynes-shadow-retry');}catch{}initialURL.searchParams.delete('retry');history.replaceState(null,'',initialURL);}
const wait=ms=>new Promise(resolve=>setTimeout(resolve,ms));
let player,loadedScript,version=$('version').value,phase='ready',paused=false,native=null,lastMode=null,recorded=false,busy=false,synthetic=false,sentKey=null,lastPaint=0,nativeInitialized=false,resultTicks=0;
let records=[],storageAvailable=true,loadGeneration=0;
const held=new Map();
let routeIndex=0,inputFrame=-1,padPointer=null,padOrigin=null;
const board=$('board'),surface=$('game-surface'),thumb=$('thumbpad'),knob=$('thumb-knob');
$('native-hud-mask').addEventListener('pointerdown',event=>{event.preventDefault();if(player)focusGame();});
function readRecords(){
 try {const saved=JSON.parse(localStorage.getItem('joynes-shadow-racer-records-v1')||'[]');records=Array.isArray(saved)?saved.filter(r=>r&&versions.has(r.version)&&typeof r.name==='string'&&Number.isInteger(r.ticks)&&r.ticks>0&&r.ticks<=60000).slice(0,100):[];}catch{storageAvailable=false;records=[];}
}
function paintRecords(){
 $('records').replaceChildren();const sorted=records.filter(r=>r.version===version).sort((a,b)=>a.ticks-b.ticks).slice(0,10);
 for(const record of sorted){const li=document.createElement('li');li.textContent=`${record.name.slice(0,24)} — ${(record.ticks/100).toLocaleString('en-GB',{minimumFractionDigits:2,maximumFractionDigits:2})} s`;$('records').append(li);}
 if(!sorted.length){const li=document.createElement('li');li.textContent='No finishes yet.';$('records').append(li);}
 $('storage-status').textContent=storageAvailable?'Times for this release on this device.':'Storage unavailable. You can still play.';
}
function showOverlay(title,text='',action=null){$('overlay-title').textContent=title;$('result').textContent=text;$('resume').hidden=action!=='resume';$('again').hidden=action!=='again';$('overlay').hidden=false;}
function focusGame(){const target=player?.shadowRoot?.getElementById('container')||player;target?.focus({preventScroll:true});}
function dispatch(type,key){
 if(!player||!keyCodes[key])return;synthetic=true;
 try {(player.shadowRoot?.getElementById('container')||player).dispatchEvent(new KeyboardEvent(type,{key,code:key,keyCode:keyCodes[key],which:keyCodes[key],bubbles:true,cancelable:true,composed:true}));}finally{synthetic=false;}
}
function updateKey(advance=false){
 let actions=[...new Set(held.values())];
 for(const pair of [['ArrowUp','ArrowDown'],['ArrowLeft','ArrowRight']])if(pair.every(k=>actions.includes(k)))actions=actions.filter(k=>!pair.includes(k));
 if(advance&&actions.length>1)routeIndex=(routeIndex+1)%actions.length;
 const next=actions[routeIndex%Math.max(1,actions.length)]||null;
 document.querySelectorAll('[data-key]').forEach(button=>button.setAttribute('aria-pressed',String([...held.values()].includes(button.dataset.key))));
 if(next===sentKey)return;if(sentKey)dispatch('keyup',sentKey);sentKey=next;if(next){focusGame();dispatch('keydown',next);}
}
function releasePad(){const id=padPointer;padPointer=null;padOrigin=null;held.delete('pad:steer');held.delete('pad:throttle');thumb.style.left=thumb.style.top='';knob.style.transform='';if(id!==null&&board.hasPointerCapture(id))board.releasePointerCapture(id);updateKey();}
function releaseAll(){held.clear();routeIndex=0;releasePad();updateKey();}
// The archived AS3 polls one key each native frame. Route simultaneous held
// actions over successive native frames without writing to its game objects.
function routeHeld(){if(!busy&&!paused&&phase==='running'&&native?.frame!==inputFrame){inputFrame=native?.frame;updateKey(true);}requestAnimationFrame(routeHeld);}
requestAnimationFrame(routeHeld);
async function pressEnter(){focusGame();dispatch('keydown','Enter');await wait(160);dispatch('keyup','Enter');}
function onTrace(message){
 if(!message.startsWith('ShadowRacerPrototype2 '))return;
 const values=message.slice('ShadowRacerPrototype2 '.length).trim().split(/\s+/).map(Number);
 if(values.length===1&&values[0]===0){nativeInitialized=true;return;}
 if(values.length!==13||values.some(v=>!Number.isFinite(v)))return;
 const [mode,x,y,crashes,ticks,bx,by,leftX,leftY,rightX,rightY,key,frame]=values;
 native={mode,x,y,crashes,ticks,bx,by,leftX,leftY,rightX,rightY,key,frame};
 if(mode===1){if(lastMode!==1){recorded=false;$('overlay').hidden=true;}phase='running';resultTicks=ticks;}
 if(mode===0&&crashes>5){phase='crashed';$('pause').disabled=true;releaseAll();showOverlay('Crashed','Too many body collisions. Lean to stay upright.','again');}
 if(mode===3&&!recorded){
  recorded=true;phase='finished';$('pause').disabled=true;resultTicks=ticks;releaseAll();
  if(ticks>0){records.push({name:($('name').value.trim()||'Player').slice(0,24),ticks,version});records=records.sort((a,b)=>a.ticks-b.ticks).slice(0,100);
   try {localStorage.setItem('joynes-shadow-racer-records-v1',JSON.stringify(records));}catch{storageAvailable=false;}
   paintRecords();}
  showOverlay('Finished!',`Your time: ${(ticks/100).toLocaleString('en-GB',{minimumFractionDigits:2,maximumFractionDigits:2})} seconds.`,'again');
 }
 lastMode=mode;
 if(performance.now()-lastPaint>80||mode!==1){lastPaint=performance.now();$('time').textContent=((['crashed','finished'].includes(phase)?resultTicks:ticks)/100).toLocaleString('en-GB',{minimumFractionDigits:2,maximumFractionDigits:2})+' s';$('distance').textContent=Math.max(0,Math.min(3400,Math.floor(x)))+' / 3,400';$('state').textContent=paused?'Paused':phase==='running'?'Stay upright':phase==='crashed'?'Crashed':phase==='finished'?'Finished!':'Ready';}
}
async function loadRuffle(){
 if(window.RufflePlayer?.newest)return;
 if(!loadedScript){loadedScript=new Promise((resolve,reject)=>{
  window.RufflePlayer={config:{polyfills:false}};
  const script=document.createElement('script');script.src='vendor/ruffle/ruffle.js';script.onload=resolve;script.onerror=()=>{script.remove();reject(Error('Could not load the engine.'));};document.head.append(script);
 }).catch(error=>{loadedScript=null;throw error;});}
 await loadedScript;
}
async function start(){
 if(busy)return;busy=true;const generation=++loadGeneration;releaseAll();paused=false;native=null;nativeInitialized=false;resultTicks=0;lastMode=null;recorded=false;phase='loading';version=versions.has($('version').value)?$('version').value:'20081005';paintRecords();
 document.querySelectorAll('[data-key]').forEach(b=>b.disabled=true);$('intro').hidden=true;$('error').hidden=true;$('play').hidden=false;$('pause').disabled=$('reset').disabled=$('choose').disabled=true;paintPause(false);showOverlay('Loading…','Loading the original engine.');
 try {
  if(player){player.remove();player=null;}
  await loadRuffle();player=window.RufflePlayer.newest().createPlayer();player.tabIndex=0;player.setAttribute('aria-label','ShadowRacer. Arrows or WASD drive and lean.');$('player-holder').replaceChildren(player);player.addEventListener('focusout',()=>{if(document.activeElement!==player&&!player?.contains(document.activeElement))releaseAll();});
  const response=await fetch(`shadow-racer-${version}.swf`,{cache:'no-cache',signal:AbortSignal.timeout(30000)});
  if(!response.ok)throw Error('Could not load the original. Retry.');
  const data=new Uint8Array(await response.arrayBuffer());if(data.length<8||!['CWS','FWS'].includes(String.fromCharCode(...data.slice(0,3))))throw Error('Invalid game file. Retry.');
  await player.ruffle().load({data,swfFileName:`shadow-racer-${version}.swf`,parameters:{name:($('name').value.trim()||'Player').slice(0,24)},autoplay:'on',allowNetworking:'none',openUrlMode:'deny',allowScriptAccess:false,unmuteOverlay:'hidden',splashScreen:false,backgroundColor:'#334433',contextMenu:false,preferredRenderer:'canvas',urlRewriteRules:[[/^https?:\/\/91\.90\.27\.250\/shadowRacerServer\/(?:toplist|insert)\.php(?:\?.*)?$/,'data:text/plain;charset=utf-8,'+encodeURIComponent('Local times below.')]]});
  const deadline=Date.now()+60000;while(player.ruffle().readyState!==2){if(Date.now()>deadline)throw Error('Engine timed out. Retry.');await wait(30);}
  if(generation!==loadGeneration)return;
  player.ruffle().traceObserver=onTrace;phase='ready';
  while(!nativeInitialized){if(Date.now()>deadline)throw Error('Original did not respond. Retry.');await wait(20);}
  $('overlay').hidden=true;await pressEnter();$('pause').disabled=$('reset').disabled=$('choose').disabled=false;
 } catch(error){releaseAll();player?.remove();player=null;phase='error';$('play').hidden=true;$('error').hidden=false;$('error-message').textContent=error.message||'Could not start the original.';}
 finally{busy=false;if(player)document.querySelectorAll('[data-key]').forEach(b=>b.disabled=false);}
}
function paintPause(value){$('pause').textContent=value?'▶':'Ⅱ';$('pause').setAttribute('aria-label',value?'Resume':'Pause');$('pause').title=value?'Resume':'Pause';$('pause').setAttribute('aria-pressed',String(value));}
function pause(next=true){
 if(!player||busy||!['running','ready'].includes(phase))return;releaseAll();paused=next;
 if(paused){player.ruffle().suspend();showOverlay('Paused','Resume when ready.','resume');}
 else{player.ruffle().resume();$('overlay').hidden=true;focusGame();}
 paintPause(paused);$('state').textContent=paused?'Paused':'Stay upright';
}
bindGameAction($('choose'),()=>{if(busy)return;if(document.fullscreenElement||board.classList.contains('game-view-expanded'))$('fullscreen').click();releaseAll();player?.remove();player=null;native=null;paused=false;phase='ready';$('play').hidden=true;$('intro').hidden=false;$('error').hidden=true;$('start').focus();});
$('start').onclick=start;$('retry').onclick=()=>{try{sessionStorage.setItem('joynes-shadow-retry',JSON.stringify({name:$('name').value}));}catch{}const url=new URL(location.href);url.searchParams.set('version',version);url.searchParams.set('retry','1');location.replace(url);};bindGameAction($('reset'),start);bindGameAction($('again'),start);
bindGameAction($('pause'),()=>pause(!paused));bindGameAction($('resume'),()=>pause(false));
$('fullscreen').addEventListener('pointerdown',e=>{if(e.pointerType==='touch')e.preventDefault();});
bindFullscreen(board,$('fullscreen'),active=>{releaseAll();if(player&&!busy)focusGame();if(parent!==window)parent.postMessage({type:'joynes:game-view',active},location.origin);});
window.addEventListener('message',e=>{if(e.source===parent&&e.origin===location.origin&&e.data?.type==='joynes:game-view-close'&&$('board').classList.contains('game-view-expanded'))$('fullscreen').click();});
$('version').onchange=()=>{version=$('version').value;paintRecords();};
for(const button of document.querySelectorAll('[data-key]')){
 button.setAttribute('aria-pressed','false');
 button.addEventListener('pointerdown',event=>{if(busy||paused||phase!=='running')return;event.preventDefault();button.setPointerCapture(event.pointerId);held.set('pointer:'+event.pointerId,button.dataset.key);updateKey();});
 const release=event=>{held.delete('pointer:'+event.pointerId);updateKey();};
 for(const type of ['pointerup','pointercancel','lostpointercapture'])button.addEventListener(type,release);
 button.addEventListener('keydown',event=>{if(!['Space','Enter'].includes(event.code)||busy||paused||phase!=='running')return;event.preventDefault();if(event.repeat)return;held.set(`control:${button.dataset.key}:${event.code}`,button.dataset.key);updateKey();});
 button.addEventListener('keyup',event=>{if(!['Space','Enter'].includes(event.code))return;event.preventDefault();held.delete(`control:${button.dataset.key}:${event.code}`);updateKey();});
 button.addEventListener('contextmenu',event=>event.preventDefault());
}
board.addEventListener('pointerdown',event=>{
 if(busy||paused||phase!=='running'||padPointer!==null||event.button!==0||event.target.closest('button,#overlay'))return;
 const r=surface.getBoundingClientRect();if(event.clientX-r.x>r.width*.6||event.clientY-r.y<Math.max(56,r.height*.289))return;
 event.preventDefault();event.stopPropagation();padPointer=event.pointerId;padOrigin={x:event.clientX,y:event.clientY};board.setPointerCapture(padPointer);focusGame();
 thumb.style.left=`${event.clientX-r.x}px`;thumb.style.top=`${event.clientY-r.y}px`;
},{capture:true});
board.addEventListener('pointermove',event=>{
 if(event.pointerId!==padPointer||!padOrigin)return;event.preventDefault();
 const dx=event.clientX-padOrigin.x,dy=event.clientY-padOrigin.y,r=thumb.getBoundingClientRect().width/2,threshold=r*.22;
 held.delete('pad:steer');held.delete('pad:throttle');if(Math.abs(dx)>threshold)held.set('pad:steer',dx>0?'ArrowRight':'ArrowLeft');if(Math.abs(dy)>threshold)held.set('pad:throttle',dy>0?'ArrowDown':'ArrowUp');
 const scale=Math.min(1,r*.5/(Math.hypot(dx,dy)||1));knob.style.transform=`translate(${dx*scale}px,${dy*scale}px)`;updateKey();
});
for(const type of ['pointerup','pointercancel','lostpointercapture'])board.addEventListener(type,event=>{if(event.pointerId===padPointer)releasePad();});
window.addEventListener('keydown',event=>{
 if(synthetic||$('play').hidden||event.target.closest?.('button,a,input,select,summary'))return;
 const key=aliases[event.key.toLowerCase()]||event.key;
 if(['p','P','Escape'].includes(event.key)){event.preventDefault();event.stopImmediatePropagation();if(!event.repeat)pause(!paused);return;}
 if(!keyCodes[key])return;event.preventDefault();event.stopImmediatePropagation();
 if(key==='Enter'&&['crashed','finished'].includes(phase)){if(!event.repeat)start();return;}
 if(busy||paused||!['running','ready'].includes(phase))return;if(!event.repeat){held.set('key:'+event.code,key);updateKey();}
},true);
window.addEventListener('keyup',event=>{if(synthetic)return;let controlReleased=false;for(const token of [...held.keys()])if(token.startsWith('control:')&&token.endsWith(':'+event.code)){held.delete(token);controlReleased=true;}if(controlReleased){updateKey();event.preventDefault();event.stopImmediatePropagation();return;}const key=aliases[event.key.toLowerCase()]||event.key;if(keyCodes[key]&&!$('play').hidden){const active=held.has('key:'+event.code);held.delete('key:'+event.code);updateKey();if(active||!event.target.closest?.('button,a,input,select,summary')){event.preventDefault();event.stopImmediatePropagation();}}},true);
window.addEventListener('blur',()=>{releaseAll();if(phase==='running'&&!paused)pause(true);});
window.addEventListener('resize',releaseAll);
document.addEventListener('visibilitychange',()=>{if(document.hidden){releaseAll();if(phase==='running'&&!paused)pause(true);}});
window.shadowRacerDiagnostics=()=>Object.freeze({phase,version,paused,native:native?Object.freeze({...native}):null,held:[...held.values()],records:records.map(r=>Object.freeze({...r})),storageAvailable,metadata:player?.ruffle().metadata?{...player.ruffle().metadata}:null});
readRecords();paintRecords();$('start').disabled=false;$('start').textContent='Original';if(retryRequested)void start();
