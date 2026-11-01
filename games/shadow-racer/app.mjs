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
function readRecords(){
 try {const saved=JSON.parse(localStorage.getItem('joynes-shadow-racer-records-v1')||'[]');records=Array.isArray(saved)?saved.filter(r=>r&&versions.has(r.version)&&typeof r.name==='string'&&Number.isInteger(r.ticks)&&r.ticks>0&&r.ticks<=60000).slice(0,100):[];}catch{storageAvailable=false;records=[];}
}
function paintRecords(){
 $('records').replaceChildren();const sorted=records.filter(r=>r.version===version).sort((a,b)=>a.ticks-b.ticks).slice(0,10);
 for(const record of sorted){const li=document.createElement('li');li.textContent=`${record.name.slice(0,24)} — ${(record.ticks/100).toLocaleString('sv-SE',{minimumFractionDigits:2,maximumFractionDigits:2})} s`;$('records').append(li);}
 if(!sorted.length){const li=document.createElement('li');li.textContent='Inga målgångar ännu.';$('records').append(li);}
 $('storage-status').textContent=storageAvailable?'Tider för den valda originalutgåvan på den här enheten.':'Webbläsaren tillåter inte sparning. Du kan fortfarande spela.';
}
function showOverlay(title,text='',action=null){$('overlay-title').textContent=title;$('result').textContent=text;$('resume').hidden=action!=='resume';$('again').hidden=action!=='again';$('overlay').hidden=false;}
function focusGame(){const target=player?.shadowRoot?.getElementById('container')||player;target?.focus({preventScroll:true});}
function dispatch(type,key){
 if(!player||!keyCodes[key])return;synthetic=true;
 try {(player.shadowRoot?.getElementById('container')||player).dispatchEvent(new KeyboardEvent(type,{key,code:key,keyCode:keyCodes[key],which:keyCodes[key],bubbles:true,cancelable:true,composed:true}));}finally{synthetic=false;}
}
function updateKey(){
 const next=[...held.values()].at(-1)||null;
 if(next===sentKey)return;if(sentKey)dispatch('keyup',sentKey);sentKey=next;if(next){focusGame();dispatch('keydown',next);}
 document.querySelectorAll('[data-key]').forEach(button=>button.setAttribute('aria-pressed',String([...held.values()].includes(button.dataset.key))));
}
function releaseAll(){held.clear();updateKey();}
async function pressEnter(){focusGame();dispatch('keydown','Enter');await wait(160);dispatch('keyup','Enter');}
function onTrace(message){
 if(!message.startsWith('ShadowRacerPrototype2 '))return;
 const values=message.slice('ShadowRacerPrototype2 '.length).trim().split(/\s+/).map(Number);
 if(values.length===1&&values[0]===0){nativeInitialized=true;return;}
 if(values.length!==13||values.some(v=>!Number.isFinite(v)))return;
 const [mode,x,y,crashes,ticks,bx,by,leftX,leftY,rightX,rightY,key,frame]=values;
 native={mode,x,y,crashes,ticks,bx,by,leftX,leftY,rightX,rightY,key,frame};
 if(mode===1){if(lastMode!==1){recorded=false;$('overlay').hidden=true;}phase='running';resultTicks=ticks;}
 if(mode===0&&crashes>5){phase='crashed';$('pause').disabled=true;releaseAll();showOverlay('Bilen kraschade','Fler än fem karosskollisioner. Prova att luta bilen för att hålla den på hjulen.','again');}
 if(mode===3&&!recorded){
  recorded=true;phase='finished';$('pause').disabled=true;resultTicks=ticks;releaseAll();
  if(ticks>0){records.push({name:($('name').value.trim()||'Spelare').slice(0,24),ticks,version});records=records.sort((a,b)=>a.ticks-b.ticks).slice(0,100);
   try {localStorage.setItem('joynes-shadow-racer-records-v1',JSON.stringify(records));}catch{storageAvailable=false;}
   paintRecords();}
  showOverlay('Mål!',`Din tid: ${(ticks/100).toLocaleString('sv-SE',{minimumFractionDigits:2,maximumFractionDigits:2})} sekunder.`,'again');
 }
 lastMode=mode;
 if(performance.now()-lastPaint>80||mode!==1){lastPaint=performance.now();$('time').textContent=((['crashed','finished'].includes(phase)?resultTicks:ticks)/100).toLocaleString('sv-SE',{minimumFractionDigits:2,maximumFractionDigits:2})+' s';$('distance').textContent=Math.max(0,Math.min(3400,Math.floor(x)))+' / 3 400';$('state').textContent=paused?'Paus':phase==='running'?'Håll bilen på hjulen':phase==='crashed'?'Krasch':phase==='finished'?'Mål!':'Redo';}
}
async function loadRuffle(){
 if(window.RufflePlayer?.newest)return;
 if(!loadedScript){loadedScript=new Promise((resolve,reject)=>{
  window.RufflePlayer={config:{polyfills:false}};
  const script=document.createElement('script');script.src='vendor/ruffle/ruffle.js';script.onload=resolve;script.onerror=()=>{script.remove();reject(Error('Spelmotorn kunde inte hämtas.'));};document.head.append(script);
 }).catch(error=>{loadedScript=null;throw error;});}
 await loadedScript;
}
async function start(){
 if(busy)return;busy=true;const generation=++loadGeneration;releaseAll();paused=false;native=null;nativeInitialized=false;resultTicks=0;lastMode=null;recorded=false;phase='loading';version=versions.has($('version').value)?$('version').value:'20081005';paintRecords();
 document.querySelectorAll('[data-key]').forEach(b=>b.disabled=true);$('intro').hidden=true;$('error').hidden=true;$('play').hidden=false;$('pause').disabled=$('reset').disabled=$('choose').disabled=true;$('pause').setAttribute('aria-pressed','false');$('pause').textContent='Pausa';showOverlay('Laddar…','Originalets spelmotor hämtas första gången.');
 try {
  if(player){player.remove();player=null;}
  await loadRuffle();player=window.RufflePlayer.newest().createPlayer();player.tabIndex=0;player.setAttribute('aria-label','ShadowRacer. Piltangenter eller WASD styr bilen.');$('player-holder').replaceChildren(player);
  const response=await fetch(`shadow-racer-${version}.swf`,{cache:'no-cache',signal:AbortSignal.timeout(30000)});
  if(!response.ok)throw Error('Originalspelet kunde inte hämtas. Försök igen.');
  const data=new Uint8Array(await response.arrayBuffer());if(data.length<8||!['CWS','FWS'].includes(String.fromCharCode(...data.slice(0,3))))throw Error('Spelfilen är skadad. Försök igen.');
  await player.ruffle().load({data,swfFileName:`shadow-racer-${version}.swf`,parameters:{name:($('name').value.trim()||'Spelare').slice(0,24)},autoplay:'on',allowNetworking:'none',openUrlMode:'deny',allowScriptAccess:false,unmuteOverlay:'hidden',splashScreen:false,backgroundColor:'#334433',contextMenu:false,preferredRenderer:'canvas',urlRewriteRules:[[/^https?:\/\/91\.90\.27\.250\/shadowRacerServer\/(?:toplist|insert)\.php(?:\?.*)?$/,'data:text/plain;charset=utf-8,'+encodeURIComponent('Lokala rekord nedan.')]]});
  const deadline=Date.now()+60000;while(player.ruffle().readyState!==2){if(Date.now()>deadline)throw Error('Spelmotorn tog för lång tid att starta. Försök igen.');await wait(30);}
  if(generation!==loadGeneration)return;
  player.ruffle().traceObserver=onTrace;phase='ready';
  while(!nativeInitialized){if(Date.now()>deadline)throw Error('Originalspelet svarade inte. Försök igen.');await wait(20);}
  $('overlay').hidden=true;await pressEnter();$('pause').disabled=$('reset').disabled=$('choose').disabled=false;
 } catch(error){releaseAll();player?.remove();player=null;phase='error';$('play').hidden=true;$('error').hidden=false;$('error-message').textContent=error.message||'Originalspelet kunde inte startas.';}
 finally{busy=false;if(player)document.querySelectorAll('[data-key]').forEach(b=>b.disabled=false);}
}
function pause(next=true){
 if(!player||busy||!['running','ready'].includes(phase))return;releaseAll();paused=next;
 if(paused){player.ruffle().suspend();showOverlay('Paus','Loppet står stilla tills du fortsätter.','resume');}
 else{player.ruffle().resume();$('overlay').hidden=true;focusGame();}
 $('pause').textContent=paused?'Fortsätt':'Pausa';$('pause').setAttribute('aria-pressed',String(paused));$('state').textContent=paused?'Paus':'Håll bilen på hjulen';
}
$('choose').onclick=()=>{if(busy)return;releaseAll();player?.remove();player=null;native=null;paused=false;phase='ready';$('play').hidden=true;$('intro').hidden=false;$('error').hidden=true;$('start').focus();};
$('start').onclick=start;$('retry').onclick=()=>{try{sessionStorage.setItem('joynes-shadow-retry',JSON.stringify({name:$('name').value}));}catch{}const url=new URL(location.href);url.searchParams.set('version',version);url.searchParams.set('retry','1');location.replace(url);};$('reset').onclick=start;$('again').onclick=start;
$('pause').onclick=()=>pause(!paused);$('resume').onclick=()=>pause(false);
$('version').onchange=()=>{version=$('version').value;paintRecords();};
for(const button of document.querySelectorAll('[data-key]')){
 button.setAttribute('aria-pressed','false');
 button.addEventListener('pointerdown',event=>{if(busy||paused||phase!=='running')return;event.preventDefault();button.setPointerCapture(event.pointerId);held.set('pointer:'+event.pointerId,button.dataset.key);updateKey();});
 const release=event=>{held.delete('pointer:'+event.pointerId);updateKey();};
 for(const type of ['pointerup','pointercancel','lostpointercapture'])button.addEventListener(type,release);
 button.addEventListener('contextmenu',event=>event.preventDefault());
}
window.addEventListener('keydown',event=>{
 if(synthetic||$('play').hidden||event.target.closest?.('input,select'))return;
 const key=aliases[event.key.toLowerCase()]||event.key;
 if(['p','P','Escape'].includes(event.key)){event.preventDefault();event.stopImmediatePropagation();if(!event.repeat)pause(!paused);return;}
 if(!keyCodes[key])return;event.preventDefault();event.stopImmediatePropagation();
 if(key==='Enter'&&['crashed','finished'].includes(phase)){if(!event.repeat)start();return;}
 if(busy||paused||!['running','ready'].includes(phase))return;if(!event.repeat){held.set('key:'+event.code,key);updateKey();}
},true);
window.addEventListener('keyup',event=>{if(synthetic)return;const key=aliases[event.key.toLowerCase()]||event.key;if(keyCodes[key]&&!$('play').hidden){event.preventDefault();event.stopImmediatePropagation();held.delete('key:'+event.code);updateKey();}},true);
window.addEventListener('blur',()=>{releaseAll();if(phase==='running'&&!paused)pause(true);});
document.addEventListener('visibilitychange',()=>{if(document.hidden){releaseAll();if(phase==='running'&&!paused)pause(true);}});
window.shadowRacerDiagnostics=()=>Object.freeze({phase,version,paused,native:native?Object.freeze({...native}):null,held:[...held.values()],records:records.map(r=>Object.freeze({...r})),storageAvailable,metadata:player?.ruffle().metadata?{...player.ruffle().metadata}:null});
readRecords();paintRecords();if(retryRequested)void start();
