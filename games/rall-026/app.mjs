import{locateTextMemory,readTextScreen,screenPhase}from'./native-text.mjs';
import{NativeAudio}from'./audio.mjs';
const $=id=>document.getElementById(id),wait=ms=>new Promise(resolve=>setTimeout(resolve,ms));
const rawCodes={Enter:257,Escape:256,ArrowUp:265,ArrowDown:264,ArrowLeft:263,ArrowRight:262,Space:32,Semicolon:59,Quote:39,Backslash:92,Backspace:259,Delete:261};
let ci=null,audio=null,addresses=null,timer=null,screen=null,phase='idle',paused=false,busy=false,frames=0,context=null,image=null,loader=null,generation=0,abort=null,continuing=false,muted=false;
let showControls=matchMedia('(pointer:coarse)').matches;
const owners=new Map(),counts=new Map();
function paintControls(){$('play').classList.toggle('touch-controls',showControls);$('play').classList.toggle('dual',!$('p2-controls').hidden);$('controls-toggle').setAttribute('aria-pressed',String(showControls));}
function focus(){if(!$('play').hidden)$('view').focus({preventScroll:true});}
function press(owner,code){if(!ci||paused||owners.has(owner))return;owners.set(owner,code);const count=counts.get(code)||0;counts.set(code,count+1);if(!count)ci.sendKeyEvent(code,true);paintHeld();}
function release(owner){const code=owners.get(owner);if(code===undefined)return;owners.delete(owner);const count=(counts.get(code)||1)-1;if(count)counts.set(code,count);else{counts.delete(code);try{ci?.sendKeyEvent(code,false);}catch{}}paintHeld();}
function releaseAll(){for(const owner of [...owners.keys()])release(owner);}
function paintHeld(){document.querySelectorAll('[data-key]').forEach(b=>b.setAttribute('aria-pressed',String(counts.has(Number(b.dataset.key)))));}
async function pulse(code,duration=25){if(!ci||paused||busy)return;const owner='pulse:'+performance.now();press(owner,code);await wait(duration);release(owner);focus();}
function showOverlay(title,text='',button=null){$('overlay-title').textContent=title;$('overlay-text').textContent=text;$('resume').hidden=button!=='resume';$('new-session').hidden=button!=='new-session';$('overlay').hidden=false;}
function paintSound(){const active=audio?.context?.state==='running';$('sound').textContent=muted?'Ljud av':audio&&!active?'Aktivera ljud':'Ljud på';$('sound').setAttribute('aria-pressed',String(!muted&&active));}
function finish(){if(busy||phase==='ended')return;releaseAll();paused=false;phase='ended';$('continue').disabled=$('pause').disabled=true;clearInterval(timer);audio?.clear();showOverlay('Programmet avslutades','Du kan starta originalet igen.','new-session');$('state').textContent='Avslutat';}
function update(){
 // 8.5.2 emits onExit for an API-requested exit, but a DOS-requested exit
 // only sets its read-only-to-us exited flag. Observe that case as well.
 if(ci?.exited){finish();return;}
 $('continue').disabled=!ci||paused||busy||continuing||phase==='ended';if(!ci||!addresses||phase==='ended')return;screen=readTextScreen(ci.transport.module,addresses);if(!screen)return;
 paintSound();phase=screenPhase(screen.text);$('play').classList.toggle('battle',['playing','result'].includes(phase));$('back').hidden=phase!=='playing';paintControls();$('native-text').textContent=screen.text;
 const labels={initializing:'Startar originalljudet',intro:'Originalets presentation',title:'Originalets titelskärm',menu:'Välj en eller två spelare i originalmenyn','ai-intro':'En spelare mot datorn','two-player-intro':'Två spelare – gör er redo',playing:'Duell mellan hustaken',result:'Originalets resultat',credits:'Originalets historiska information',controls:'Originalets kontroller',options:'Originalets inställningar','sound-settings':'Originalets ljudinställningar','original-screen':'Originalets meny'};
 $('state').textContent=paused?'Paus':labels[phase]||'Rall0.026';$('continue').textContent=continuing?'Fortsätter…':phase==='title'?'Till menyn':phase==='menu'?'Välj':'Fortsätt';
}
async function continueNative(){
 if(!ci||paused||busy||continuing)return;void audio?.unlock().catch(()=>{});continuing=true;$('continue').disabled=true;const before=phase,owner='continue:'+performance.now(),version=generation;
 press(owner,phase==='title'?32:257);focus();update();
 try{
  // The original ready screen is drawn before its blocking voice finishes.
  // Retry normal Enter presses until it accepts one; never alter DOS state.
  const ready=['ai-intro','two-player-intro'].includes(before),deadline=performance.now()+(ready?5500:160);
  do{await wait(['menu','options','sound-settings'].includes(before)?25:160);release(owner);if(!ready||phase!==before)break;await wait(250);if(phase===before&&generation===version&&!paused)press(owner,257);}while(performance.now()<deadline&&generation===version&&!paused&&phase===before);
 }finally{release(owner);continuing=false;update();focus();}
}
function resize(width,height){if(!width||!height)return;$('view').width=width;$('view').height=height;context=$('view').getContext('2d',{alpha:false});image=context.createImageData(width,height);}
function render(rgb,rgba){if(!image||(!rgb&&!rgba))return;const data=image.data;if(rgba)data.set(rgba);else for(let from=0,to=0;from<rgb.length;from+=3,to+=4){data[to]=rgb[from];data[to+1]=rgb[from+1];data[to+2]=rgb[from+2];data[to+3]=255;}context.putImageData(image,0,0);frames++;}
async function loadEmulator(){
 if(window.emulators)return;if(!loader)loader=new Promise((resolve,reject)=>{const script=document.createElement('script');script.src='vendor/emulators/emulators.js';script.onload=resolve;script.onerror=()=>{script.remove();loader=null;reject(Error('DOS-motorn kunde inte hämtas.'));};document.head.append(script);});await loader;
}
async function dispose(){
 abort?.abort();abort=null;clearInterval(timer);timer=null;releaseAll();addresses=null;screen=null;
 const old=ci;ci=null;if(old){try{await old.exit();}catch{}}
 if(audio){await audio.close();audio=null;}
}
async function start(){
 if(busy)return;busy=true;generation++;const version=generation;paused=false;continuing=false;
 // Unlock Web Audio synchronously within the button's user gesture.
 const nextAudio=new NativeAudio();nextAudio.setMuted(muted);const unlocking=nextAudio.unlock().catch(()=>{});
 $('intro').hidden=true;$('error').hidden=true;$('play').hidden=false;$('continue').disabled=$('pause').disabled=$('restart').disabled=true;$('pause').textContent='Pausa';$('pause').setAttribute('aria-pressed','false');showOverlay('Startar…','Originalets ljudkort och musik startas.');
 try{
  await dispose();audio=nextAudio;void unlocking;phase='loading';frames=0;abort=new AbortController();
  await loadEmulator();window.emulators.pathPrefix=new URL('vendor/emulators/',import.meta.url).href;
  const response=await fetch('game.jsdos',{cache:'no-cache',signal:abort.signal});if(!response.ok)throw Error('Originalpaketet kunde inte hämtas. Försök igen.');
  ci=await window.emulators.dosboxDirect(new Uint8Array(await response.arrayBuffer()));if(version!==generation)return;
  resize(ci.width(),ci.height());ci.events().onFrameSize(resize);ci.events().onFrame(render);ci.events().onSoundPush(samples=>audio?.push(samples,ci?.soundFrequency()||44100));
  ci.events().onMessage((type,...args)=>{if(args.some(a=>typeof a==='string'&&a.includes('[panic]')))fail('DOS-motorn avbröts. Försök igen.');});
  ci.events().onExit(()=>{if(version===generation)finish();});
  addresses=await locateTextMemory(ci.transport.module,{signal:abort.signal});update();timer=setInterval(update,100);
  $('overlay').hidden=true;$('continue').disabled=$('pause').disabled=$('restart').disabled=false;busy=false;
  // This acknowledges only the sound-card setup screen, using the same key
  // requested by the original. The original presentation/title stay visible.
  if(phase==='initializing')await continueNative();focus();
 }catch(error){if(version===generation)await fail(error.message||'DOS-programmet kunde inte starta.');}
 finally{busy=false;}
}
async function fail(message){generation++;await dispose();phase='error';$('play').hidden=true;$('error').hidden=false;$('error-message').textContent=message;}
function pause(next){if(!ci||busy||phase==='ended')return;releaseAll();paused=next;if(paused){ci.pause();audio?.clear();showOverlay('Paus','Originalets spel och ljud står stilla.','resume');}else{ci.resume();void audio?.unlock();$('overlay').hidden=true;focus();}$('pause').textContent=paused?'Fortsätt':'Pausa';$('pause').setAttribute('aria-pressed',String(paused));update();}
$('start').onclick=start;$('restart').onclick=start;$('new-session').onclick=start;$('continue').onclick=continueNative;
$('pause').onclick=()=>pause(!paused);$('resume').onclick=()=>pause(false);
$('sound').onclick=()=>{if(audio?.context?.state!=='running'&&audio){muted=false;audio.setMuted(false);void audio.unlock().then(paintSound).catch(()=>{});}else{muted=!muted;audio?.setMuted(muted);paintSound();}};
$('controls-toggle').onclick=()=>{showControls=!showControls;paintControls();};
$('p2-toggle').onclick=()=>{showControls=true;const hidden=!$('p2-controls').hidden;$('p2-controls').hidden=hidden;$('p2-toggle').setAttribute('aria-pressed',String(!hidden));$('p2-toggle').textContent=hidden?'Visa P2-knappar':'Dölj P2-knappar';paintControls();};
$('retry').onclick=()=>{const url=new URL(location.href);url.searchParams.set('retry','1');location.replace(url);};
for(const button of document.querySelectorAll('[data-key]')){
 button.setAttribute('aria-pressed','false');button.addEventListener('pointerdown',event=>{if(!ci||paused||busy)return;event.preventDefault();button.setPointerCapture(event.pointerId);void audio?.unlock().catch(()=>{});focus();press('pointer:'+event.pointerId,Number(button.dataset.key));});
 for(const name of ['pointerup','pointercancel','lostpointercapture'])button.addEventListener(name,event=>release('pointer:'+event.pointerId));button.addEventListener('contextmenu',event=>event.preventDefault());
}
for(const button of document.querySelectorAll('[data-pulse]'))button.onclick=()=>pulse(Number(button.dataset.pulse));
window.addEventListener('keydown',event=>{
 if(!ci||paused||busy||phase==='ended'||event.ctrlKey||event.metaKey||event.altKey||event.target.closest?.('a,button,input,select,textarea'))return;
 if(event.code==='KeyP'){event.preventDefault();if(!event.repeat)pause(true);return;}
 let code=rawCodes[event.code];if(phase==='playing'){if(event.code==='KeyQ')code=59;if(event.code==='KeyE')code=39;if(event.code==='Space')code=92;}
 if(code===undefined&&/^Key[A-Z]$/.test(event.code))code=event.code.charCodeAt(3);
 if(code===undefined&&/^Digit[0-9]$/.test(event.code))code=event.code.charCodeAt(5);
 if(code===undefined)return;void audio?.unlock().catch(()=>{});event.preventDefault();if(!event.repeat)press('keyboard:'+event.code,code);
});
window.addEventListener('keyup',event=>{const owner='keyboard:'+event.code;if(owners.has(owner)){event.preventDefault();release(owner);}});
window.addEventListener('blur',()=>{releaseAll();if(ci&&!busy&&!paused)pause(true);});document.addEventListener('visibilitychange',()=>{if(document.hidden){releaseAll();if(ci&&!busy&&!paused)pause(true);}});
window.rall026Diagnostics=()=>({phase,paused,frames,held:[...counts.keys()],audio:audio?.snapshot()||null,screen:ci&&addresses?readTextScreen(ci.transport.module,addresses):null,width:ci?.width()||0,height:ci?.height()||0});
const initialURL=new URL(location.href);if(initialURL.searchParams.get('retry')==='1'){initialURL.searchParams.delete('retry');history.replaceState(null,'',initialURL);void start();}
